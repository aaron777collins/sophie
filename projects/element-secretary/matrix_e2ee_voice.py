#!/usr/bin/env python3
"""
Sophie Voice Agent with Matrix E2EE Integration

Uses matrix-nio to receive encryption keys from Element X via to-device messages,
then uses those keys with LiveKit for encrypted voice.
"""

import os
import asyncio
import logging
import base64
import hashlib
import secrets
from pathlib import Path
from typing import Optional, Dict, Any

import numpy as np
from dotenv import load_dotenv
from livekit import rtc, api
from nio import (
    AsyncClient, 
    AsyncClientConfig, 
    LoginResponse,
    ToDeviceEvent,
    RoomMemberEvent,
)
from nio.store import SqliteStore

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("sophie-voice-e2ee")

# Load environment
load_dotenv()

# Configuration
MATRIX_HOMESERVER = os.getenv("MATRIX_HOMESERVER", "https://matrix3.aaroncollins.info")
MATRIX_USER = os.getenv("MATRIX_USER_ID", "@sophie:matrix3.aaroncollins.info")
MATRIX_PASSWORD = os.getenv("MATRIX_PASSWORD", "QJQb3SyirFep2XJ0nzGC4SXx")
MATRIX_ROOM_ID = os.getenv("MATRIX_ROOM_ID", "!iCDid0eGkre_6MbGVNl4lpvjqw90py9XY45ouXXn-nE")

LIVEKIT_URL = os.getenv("LIVEKIT_URL", "wss://livekit3.aaroncollins.info")
LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY", "8292ca21-ade4-5baf-ad8b-d0126c89cc4b")
LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET", "c6e4453b-09d8-5205-8196-cbe7c9ba7040")

DATA_PATH = Path(__file__).parent / "data"
DATA_PATH.mkdir(parents=True, exist_ok=True)

# Audio settings
SAMPLE_RATE = 48000
NUM_CHANNELS = 1
SAMPLES_PER_CHANNEL = 480

# Call encryption keys event type
CALL_ENCRYPTION_KEYS_EVENT = "org.matrix.msc4143.call.encryption_keys"


class MatrixE2EEKeyManager:
    """Manages encryption keys from Matrix for LiveKit E2EE."""
    
    def __init__(self):
        self._keys: Dict[str, bytes] = {}  # participant_id -> key
        self._own_key: Optional[bytes] = None
        self._own_key_index: int = 0
        self._room: Optional[rtc.Room] = None
        
    def set_room(self, room: rtc.Room):
        """Set the LiveKit room for key updates."""
        self._room = room
        
    def set_key_for_participant(self, participant_id: str, key: bytes, index: int):
        """Set the encryption key for a participant."""
        logger.info(f"🔑 Received key for {participant_id[:30]}... (index={index})")
        self._keys[participant_id] = key
        
        # Update the room's E2EE manager if available
        if self._room and self._room.e2ee_manager:
            try:
                self._room.e2ee_manager.set_key(key, participant_id, index)
                logger.info(f"✅ Key set in E2EE manager for {participant_id[:30]}...")
            except Exception as e:
                logger.error(f"Failed to set key: {e}")
    
    def get_own_key(self) -> tuple[bytes, int]:
        """Get our own key for distribution."""
        if self._own_key is None:
            # Generate a new key
            self._own_key = secrets.token_bytes(32)
            self._own_key_index = 0
        return self._own_key, self._own_key_index


class SophieE2EEVoiceAgent:
    """Sophie voice agent with Matrix E2EE integration."""
    
    def __init__(self):
        self.matrix_client: Optional[AsyncClient] = None
        self.livekit_room: Optional[rtc.Room] = None
        self.audio_source: Optional[rtc.AudioSource] = None
        self.key_manager: Optional[MatrixE2EEKeyManager] = None
        self.current_call_id: Optional[str] = None
        self.device_id: Optional[str] = None
        self.member_id: Optional[str] = None
        
    async def start(self):
        """Start the bot - connect to Matrix."""
        logger.info("🚀 Starting Sophie E2EE Voice Agent...")
        
        # Connect to Matrix
        config = AsyncClientConfig(
            store=SqliteStore,
            store_name="sophie_matrix",
            encryption_enabled=True,
        )
        
        self.matrix_client = AsyncClient(
            MATRIX_HOMESERVER,
            MATRIX_USER,
            config=config,
            store_path=str(DATA_PATH / "matrix_store"),
        )
        
        # Add callback for to-device events
        self.matrix_client.add_to_device_callback(
            self.on_to_device_event,
            (ToDeviceEvent,)
        )
        
        # Login
        response = await self.matrix_client.login(
            MATRIX_PASSWORD, 
            device_name="Sophie Voice E2EE"
        )
        
        if isinstance(response, LoginResponse):
            logger.info(f"✅ Matrix logged in as {MATRIX_USER}")
            self.device_id = response.device_id
            # Generate a unique member ID for this session
            self.member_id = f"{self.device_id}_{secrets.token_hex(4)}"
            logger.info(f"   Device ID: {self.device_id}")
            logger.info(f"   Member ID: {self.member_id}")
        else:
            logger.error(f"❌ Matrix login failed: {response}")
            return False
        
        # Initial sync
        await self.matrix_client.sync(timeout=30000, full_state=True)
        logger.info("✅ Matrix synced!")
        
        return True
    
    async def on_to_device_event(self, event: ToDeviceEvent):
        """Handle to-device events (including encryption keys)."""
        event_type = event.source.get("type", "")
        content = event.source.get("content", {})
        sender = event.source.get("sender", "")
        
        logger.debug(f"📨 To-device event: {event_type} from {sender}")
        
        # Check for call encryption keys
        if "call" in event_type.lower() and "encryption" in event_type.lower():
            logger.info(f"🔐 Received encryption keys from {sender}")
            await self.handle_encryption_keys(sender, content)
    
    async def handle_encryption_keys(self, sender: str, content: Dict[str, Any]):
        """Handle received encryption keys."""
        try:
            keys = content.get("keys", {})
            key_b64 = keys.get("key")
            key_index = keys.get("index", 0)
            room_id = content.get("room_id")
            member = content.get("member", {})
            
            if not key_b64:
                logger.warning("No key in encryption keys event")
                return
            
            # Decode the key
            key_bytes = base64.b64decode(key_b64)
            
            # Build participant identity
            device_id = member.get("claimed_device_id", "unknown")
            member_id = member.get("id", f"{sender}:{device_id}")
            participant_id = f"{sender}:{device_id}"
            
            logger.info(f"🔑 Got key from {participant_id} (index={key_index})")
            
            # Store the key
            if self.key_manager:
                self.key_manager.set_key_for_participant(
                    participant_id, 
                    key_bytes, 
                    key_index
                )
                
        except Exception as e:
            logger.error(f"Error handling encryption keys: {e}")
    
    async def send_our_key_to_participants(self, participants: list):
        """Send our encryption key to other participants via to-device."""
        if not self.key_manager or not self.matrix_client:
            return
        
        key, index = self.key_manager.get_own_key()
        key_b64 = base64.b64encode(key).decode("utf-8")
        
        content = {
            "keys": {
                "key": key_b64,
                "index": index,
            },
            "room_id": MATRIX_ROOM_ID,
            "member": {
                "claimed_device_id": self.device_id,
                "id": self.member_id,
            },
            "session": {
                "call_id": self.current_call_id or "",
                "application": "m.call",
                "scope": "m.room",
            },
            "sent_ts": int(asyncio.get_event_loop().time() * 1000),
        }
        
        for participant in participants:
            user_id = participant.get("user_id")
            device_id = participant.get("device_id")
            
            if user_id and device_id:
                if user_id == MATRIX_USER and device_id == self.device_id:
                    continue  # Skip ourselves
                
                logger.info(f"📤 Sending key to {user_id}:{device_id}")
                try:
                    await self.matrix_client.to_device(
                        CALL_ENCRYPTION_KEYS_EVENT,
                        {user_id: {device_id: content}}
                    )
                except Exception as e:
                    logger.error(f"Failed to send key to {user_id}:{device_id}: {e}")
    
    async def announce_call_membership(self, room_name: str, call_id: str):
        """Publish Matrix call.member state event so Element X sees us.
        
        Element X uses a specific format per MSC3401:
        - state_key: _@user:server_DEVICE_m.call
        - content: application, device_id, foci_preferred, etc.
        """
        logger.info(f"📢 Announcing call membership...")
        
        import time
        
        # Element X state_key format: _@user:server_DEVICE_m.call
        state_key = f"_{MATRIX_USER}_{self.device_id}_m.call"
        
        # Build content matching Element X format
        content = {
            "application": "m.call",
            "call_id": "",  # Element X uses empty string
            "scope": "m.room",
            "device_id": self.device_id,
            "expires": 7200000,  # 2 hours in ms
            "focus_active": {
                "type": "livekit",
                "focus_selection": "oldest_membership"
            },
            "foci_preferred": [
                {
                    "type": "livekit",
                    # JWT service URL, not WebSocket
                    "livekit_service_url": "https://matrix3.aaroncollins.info/livekit-jwt-service",
                    # Room ID, not LiveKit room name
                    "livekit_alias": MATRIX_ROOM_ID
                }
            ],
            "m.call.intent": "audio",
            "created_ts": int(time.time() * 1000)
        }
        
        try:
            # Publish state event with Element X compatible state_key
            response = await self.matrix_client.room_put_state(
                room_id=MATRIX_ROOM_ID,
                event_type="org.matrix.msc3401.call.member",
                state_key=state_key,
                content=content,
            )
            logger.info(f"✅ Call membership announced (state_key={state_key}): {response}")
            self.current_call_id = call_id
        except Exception as e:
            logger.error(f"❌ Failed to announce call membership: {e}")
            import traceback
            traceback.print_exc()

    async def leave_call(self):
        """Remove ourselves from the call by clearing our call.member state."""
        if not self.matrix_client or not self.device_id:
            return
            
        logger.info("📢 Leaving call (clearing membership)...")
        try:
            # Element X state_key format
            state_key = f"_{MATRIX_USER}_{self.device_id}_m.call"
            
            # Empty content means we left the call
            await self.matrix_client.room_put_state(
                room_id=MATRIX_ROOM_ID,
                event_type="org.matrix.msc3401.call.member",
                state_key=state_key,
                content={},
            )
            logger.info("✅ Call membership cleared")
        except Exception as e:
            logger.error(f"Failed to clear call membership: {e}")

    async def join_livekit_room(self, room_name: str, call_id: str = None):
        """Join LiveKit room with E2EE."""
        logger.info(f"🎤 Joining LiveKit room: {room_name[:40]}...")
        
        # Use room_name as call_id if not provided
        if call_id is None:
            call_id = room_name
        
        # Create key manager
        self.key_manager = MatrixE2EEKeyManager()
        
        # Generate our key
        key, index = self.key_manager.get_own_key()
        logger.info(f"🔑 Generated our encryption key (index={index})")
        
        # Create E2EE options - check if ratchet_window_size is supported
        try:
            e2ee_options = rtc.E2EEOptions(
                key_provider_options=rtc.KeyProviderOptions(
                    shared_key=key,
                    ratchet_salt=b"LKFrameEncryptionKey",
                    ratchet_window_size=16,
                ),
                encryption_type=1,  # GCM
            )
        except TypeError:
            # Fallback without ratchet_window_size if not supported
            logger.warning("ratchet_window_size not supported, using minimal E2EE options")
            e2ee_options = rtc.E2EEOptions(
                key_provider_options=rtc.KeyProviderOptions(
                    shared_key=key,
                    ratchet_salt=b"LKFrameEncryptionKey",
                ),
                encryption_type=1,
            )
        
        # Create room
        self.livekit_room = rtc.Room()
        self.audio_source = rtc.AudioSource(SAMPLE_RATE, NUM_CHANNELS)
        
        @self.livekit_room.on("participant_connected")
        def on_participant(participant):
            logger.info(f"👤 Participant joined: {participant.identity}")
            # TODO: Send our key to this participant
        
        @self.livekit_room.on("track_subscribed")
        def on_track(track, pub, participant):
            logger.info(f"🎵 Track from {participant.identity}: {track.kind}")
        
        @self.livekit_room.on("disconnected")
        def on_disconnect():
            logger.info("🔇 Disconnected from LiveKit")
        
        try:
            # Generate token
            token = api.AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
            token.with_identity(f"{MATRIX_USER}:{self.device_id}")
            token.with_name("Sophie")
            token.with_grants(api.VideoGrants(
                room_join=True,
                room=room_name,
                can_publish=True,
                can_subscribe=True,
            ))
            
            # Connect with E2EE
            await self.livekit_room.connect(
                LIVEKIT_URL,
                token.to_jwt(),
                options=rtc.RoomOptions(encryption=e2ee_options)
            )
            logger.info(f"✅ Connected to LiveKit (E2EE enabled)")
            
            # Set room in key manager for dynamic key updates
            self.key_manager.set_room(self.livekit_room)
            
            # Publish audio track
            track = rtc.LocalAudioTrack.create_audio_track("sophie-voice", self.audio_source)
            await self.livekit_room.local_participant.publish_track(track)
            logger.info("🎙️ Audio track published")
            
            # Start sending silence
            asyncio.create_task(self.send_silence())
            
            # CRITICAL: Announce ourselves to Matrix so Element X sees us
            await self.announce_call_membership(room_name, call_id)
            
        except Exception as e:
            logger.error(f"❌ LiveKit error: {e}")
            import traceback
            traceback.print_exc()
    
    async def send_silence(self):
        """Send silent audio frames."""
        silence = np.zeros(SAMPLES_PER_CHANNEL * NUM_CHANNELS, dtype=np.int16)
        frame = rtc.AudioFrame(
            data=silence.tobytes(),
            sample_rate=SAMPLE_RATE,
            num_channels=NUM_CHANNELS,
            samples_per_channel=SAMPLES_PER_CHANNEL,
        )
        
        while self.livekit_room and self.livekit_room.connection_state == rtc.ConnectionState.CONN_CONNECTED:
            await self.audio_source.capture_frame(frame)
            await asyncio.sleep(0.01)
    
    async def watch_for_calls(self):
        """Watch Matrix room for call events and join when found."""
        logger.info("👀 Watching for calls...")
        
        # Also poll LiveKit for active rooms
        lk_api = api.LiveKitAPI(
            url=LIVEKIT_URL.replace("wss://", "https://"),
            api_key=LIVEKIT_API_KEY,
            api_secret=LIVEKIT_API_SECRET,
        )
        
        joined_rooms = set()
        
        while True:
            try:
                # Sync Matrix
                sync_response = await self.matrix_client.sync(timeout=5000)
                
                # Check for call state events in our room
                if MATRIX_ROOM_ID in sync_response.rooms.join:
                    room = sync_response.rooms.join[MATRIX_ROOM_ID]
                    for event in room.state:
                        if hasattr(event, 'source'):
                            event_type = event.source.get('type', '')
                            if 'call' in event_type.lower() or 'msc3401' in event_type.lower():
                                logger.info(f"📞 Call event: {event_type}")
                                # Parse call membership
                
                # Also check LiveKit for active rooms
                rooms = await lk_api.room.list_rooms(api.ListRoomsRequest())
                for room in rooms.rooms:
                    if room.name not in joined_rooms and room.num_participants > 0:
                        logger.info(f"🚀 Found active LiveKit room with {room.num_participants} participants")
                        joined_rooms.add(room.name)
                        # room.name is typically the call_id from Element X
                        await self.join_livekit_room(room.name, call_id=room.name)
                
                # Clean up
                current = {r.name for r in rooms.rooms}
                joined_rooms &= current
                
            except Exception as e:
                logger.error(f"Watch error: {e}")
            
            await asyncio.sleep(2)
    
    async def run(self):
        """Main run loop."""
        if not await self.start():
            return
        
        await self.watch_for_calls()
    
    async def stop(self):
        """Stop the bot."""
        # Leave the call properly so Element X knows we're gone
        if self.matrix_client:
            await self.leave_call()
        if self.livekit_room:
            await self.livekit_room.disconnect()
        if self.matrix_client:
            await self.matrix_client.close()
        logger.info("👋 Sophie stopped")


async def main():
    agent = SophieE2EEVoiceAgent()
    try:
        await agent.run()
    except KeyboardInterrupt:
        pass
    finally:
        await agent.stop()


if __name__ == "__main__":
    asyncio.run(main())
