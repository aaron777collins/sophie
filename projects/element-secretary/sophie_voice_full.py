#!/usr/bin/env python3
"""
Sophie Voice Agent - Full Implementation

A voice assistant that joins Element X calls via LiveKit and Matrix.
- Detects when Aaron joins/leaves
- Transcribes speech with Whisper
- Responds via Claude AI
- Speaks via Kokoro TTS

All self-hosted on dev3.
"""

import os
import sys
import asyncio
import logging
import base64
import secrets
import time
import tempfile
import subprocess
import json
from pathlib import Path
from typing import Optional, Dict, List, Any
from dataclasses import dataclass, field

import numpy as np
from dotenv import load_dotenv
import aiohttp

# LiveKit
from livekit import rtc, api

# Matrix
from nio import (
    AsyncClient,
    AsyncClientConfig,
    LoginResponse,
    RoomGetStateResponse,
)
from nio.store import SqliteStore

# Load environment
load_dotenv()

# ============================================================================
# Configuration
# ============================================================================

@dataclass
class Config:
    # Matrix
    matrix_homeserver: str = os.getenv("MATRIX_HOMESERVER", "https://matrix3.aaroncollins.info")
    matrix_user: str = os.getenv("MATRIX_USER_ID", "@sophie:matrix3.aaroncollins.info")
    matrix_password: str = os.getenv("MATRIX_PASSWORD", "")
    matrix_room_id: str = os.getenv("MATRIX_ROOM_ID", "!iCDid0eGkre_6MbGVNl4lpvjqw90py9XY45ouXXn-nE")
    aaron_user_id: str = os.getenv("AARON_USER_ID", "@aaron:matrix3.aaroncollins.info")
    
    # LiveKit
    livekit_url: str = os.getenv("LIVEKIT_URL", "wss://livekit3.aaroncollins.info")
    livekit_api_key: str = os.getenv("LIVEKIT_API_KEY", "")
    livekit_api_secret: str = os.getenv("LIVEKIT_API_SECRET", "")
    
    # TTS (Kokoro)
    kokoro_url: str = os.getenv("KOKORO_TTS_URL", "http://localhost:8880/v1")
    kokoro_voice: str = os.getenv("KOKORO_VOICE", "af_heart")
    
    # STT (Whisper)
    whisper_path: str = "/home/linuxbrew/.linuxbrew/bin/whisper"
    whisper_model: str = os.getenv("WHISPER_MODEL", "large-v3-turbo")
    
    # AI (Claude)
    anthropic_api_key: str = os.getenv("ANTHROPIC_API_KEY", "")
    
    # Behavior
    leave_timeout: int = int(os.getenv("EMPTY_ROOM_TIMEOUT", "300"))  # 5 minutes
    vad_threshold: float = float(os.getenv("VAD_THRESHOLD", "0.5"))
    min_utterance_length: int = 3
    silence_timeout: float = 1.5  # seconds of silence before processing
    
    # Audio
    sample_rate: int = 48000
    num_channels: int = 1
    samples_per_channel: int = 480  # 10ms at 48kHz
    
    # Data paths
    data_path: Path = field(default_factory=lambda: Path(__file__).parent / "data")


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("sophie-voice")

config = Config()
config.data_path.mkdir(parents=True, exist_ok=True)


# ============================================================================
# Voice Activity Detection (Silero VAD)
# ============================================================================

class VADProcessor:
    """Voice Activity Detection using Silero VAD."""
    
    def __init__(self, threshold: float = 0.5):
        self.threshold = threshold
        self.model = None
        self._initialized = False
        
    def _init_model(self):
        """Lazy-load the VAD model."""
        if self._initialized:
            return
            
        try:
            import torch
            self.model, utils = torch.hub.load(
                repo_or_dir='snakers4/silero-vad',
                model='silero_vad',
                trust_repo=True
            )
            self._initialized = True
            logger.info("✅ VAD model loaded")
        except Exception as e:
            logger.error(f"❌ Failed to load VAD model: {e}")
            self.model = None
            
    def is_speech(self, audio_chunk: np.ndarray, sample_rate: int = 16000) -> bool:
        """Check if audio chunk contains speech."""
        self._init_model()
        
        if self.model is None:
            # Fallback: assume all audio is speech
            return np.abs(audio_chunk).mean() > 500
        
        try:
            import torch
            
            # Convert to float and normalize
            audio_float = audio_chunk.astype(np.float32) / 32768.0
            
            # Silero expects 16kHz
            tensor = torch.from_numpy(audio_float)
            speech_prob = self.model(tensor, sample_rate).item()
            
            return speech_prob > self.threshold
        except Exception as e:
            logger.warning(f"VAD error: {e}")
            return np.abs(audio_chunk).mean() > 500


# ============================================================================
# Speech-to-Text (Whisper)
# ============================================================================

class WhisperSTT:
    """Speech-to-Text using Whisper CLI."""
    
    def __init__(self, whisper_path: str, model: str = "large-v3-turbo"):
        self.whisper_path = whisper_path
        self.model = model
        
    async def transcribe(self, audio_data: np.ndarray, sample_rate: int = 48000) -> str:
        """Transcribe audio to text."""
        # Save to temp WAV file
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
            temp_path = f.name
            
        try:
            # Write WAV file
            import wave
            with wave.open(temp_path, 'wb') as wav_file:
                wav_file.setnchannels(1)
                wav_file.setsampwidth(2)  # 16-bit
                wav_file.setframerate(sample_rate)
                wav_file.writeframes(audio_data.tobytes())
            
            # Run Whisper CLI
            output_dir = tempfile.mkdtemp()
            result = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: subprocess.run([
                    self.whisper_path,
                    temp_path,
                    "--model", self.model,
                    "--language", "en",
                    "--output_format", "json",
                    "--output_dir", output_dir,
                    "--fp16", "False",  # CPU doesn't support fp16
                ], capture_output=True, text=True, timeout=60)
            )
            
            # Parse result
            json_path = os.path.join(output_dir, os.path.basename(temp_path).replace(".wav", ".json"))
            if os.path.exists(json_path):
                with open(json_path) as f:
                    data = json.load(f)
                    text = data.get("text", "").strip()
                    logger.info(f"📝 Transcribed: {text}")
                    return text
            else:
                logger.warning(f"Whisper output not found: {json_path}")
                logger.warning(f"Whisper stderr: {result.stderr}")
                return ""
                
        except subprocess.TimeoutExpired:
            logger.error("Whisper timed out")
            return ""
        except Exception as e:
            logger.error(f"Whisper error: {e}")
            return ""
        finally:
            # Cleanup
            if os.path.exists(temp_path):
                os.unlink(temp_path)


# ============================================================================
# Text-to-Speech (Kokoro)
# ============================================================================

class KokoroTTS:
    """Text-to-Speech using Kokoro API."""
    
    def __init__(self, url: str, voice: str = "af_heart"):
        self.url = url
        self.voice = voice
        
    async def synthesize(self, text: str) -> Optional[bytes]:
        """Convert text to speech audio (PCM)."""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.url}/audio/speech",
                    json={
                        "model": "kokoro",
                        "input": text,
                        "voice": self.voice,
                        "response_format": "wav"
                    },
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as resp:
                    if resp.status == 200:
                        wav_data = await resp.read()
                        # Extract PCM from WAV
                        return self._wav_to_pcm(wav_data)
                    else:
                        logger.error(f"TTS error: {resp.status} - {await resp.text()}")
                        return None
        except Exception as e:
            logger.error(f"TTS request failed: {e}")
            return None
            
    def _wav_to_pcm(self, wav_data: bytes) -> bytes:
        """Extract raw PCM from WAV data."""
        import wave
        import io
        
        with wave.open(io.BytesIO(wav_data), 'rb') as wav_file:
            return wav_file.readframes(wav_file.getnframes())
            
    def pcm_to_frames(self, pcm_data: bytes, input_rate: int = 24000) -> List[rtc.AudioFrame]:
        """Convert PCM audio to LiveKit AudioFrames at 48kHz."""
        audio = np.frombuffer(pcm_data, dtype=np.int16)
        
        # Resample from Kokoro's rate to 48kHz
        if input_rate != 48000:
            from scipy import signal
            num_samples = int(len(audio) * 48000 / input_rate)
            audio = signal.resample(audio, num_samples).astype(np.int16)
        
        # Split into 10ms frames (480 samples at 48kHz)
        frames = []
        for i in range(0, len(audio), 480):
            chunk = audio[i:i+480]
            if len(chunk) < 480:
                # Pad last frame
                chunk = np.pad(chunk, (0, 480 - len(chunk)))
            frame = rtc.AudioFrame(
                data=chunk.tobytes(),
                sample_rate=48000,
                num_channels=1,
                samples_per_channel=480,
            )
            frames.append(frame)
            
        return frames


# ============================================================================
# AI Brain (Claude)
# ============================================================================

class SophieAI:
    """AI response generation using Claude."""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.conversation_history: List[Dict] = []
        self.system_prompt = """You are Sophie, a helpful AI voice assistant created by Aaron.
You're having a real-time voice conversation. Keep these rules:

1. Be concise - this is spoken, not written
2. Be natural - use conversational language
3. Be helpful - answer questions directly
4. Be friendly - you know Aaron well
5. Don't use markdown, lists, or formatting - just speak naturally
6. Keep responses under 3 sentences unless asked for more detail

You have access to Aaron's systems and can help with tasks, but for now focus on conversation."""

    async def get_response(self, user_text: str) -> str:
        """Get AI response to user's speech."""
        try:
            import anthropic
            
            client = anthropic.Anthropic(api_key=self.api_key)
            
            self.conversation_history.append({
                "role": "user",
                "content": user_text
            })
            
            # Keep conversation history manageable
            if len(self.conversation_history) > 20:
                self.conversation_history = self.conversation_history[-20:]
            
            response = client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=300,
                system=self.system_prompt,
                messages=self.conversation_history
            )
            
            assistant_text = response.content[0].text
            
            self.conversation_history.append({
                "role": "assistant",
                "content": assistant_text
            })
            
            return assistant_text
            
        except Exception as e:
            logger.error(f"AI error: {e}")
            return "Sorry, I'm having trouble thinking right now. Can you try again?"


# ============================================================================
# Presence Manager
# ============================================================================

class PresenceManager:
    """Tracks Aaron's presence in calls."""
    
    def __init__(self, aaron_user_id: str, leave_timeout: int = 300):
        self.aaron_user_id = aaron_user_id
        self.leave_timeout = leave_timeout
        self.aaron_in_call = False
        self.aaron_left_at: Optional[float] = None
        
    def check_aaron_state(self, state_events: List[Dict]) -> bool:
        """Check if Aaron is in the call based on Matrix state events."""
        aaron_found = False
        
        for event in state_events:
            event_type = event.get("type", "")
            if event_type != "org.matrix.msc3401.call.member":
                continue
                
            state_key = event.get("state_key", "")
            content = event.get("content", {})
            
            # Check if this is Aaron's call membership
            if self.aaron_user_id in state_key:
                aaron_found = True
                logger.debug(f"Aaron state event: {state_key}, content keys: {list(content.keys()) if content else 'empty'}")
                
                # Non-empty content with device_id means Aaron is in call
                if content and content.get("device_id"):
                    if not self.aaron_in_call:
                        logger.info(f"👤 Aaron joined the call (device: {content.get('device_id')})")
                    self.aaron_in_call = True
                    self.aaron_left_at = None
                    return True
        
        # No active Aaron call membership found
        if self.aaron_in_call and not aaron_found:
            logger.info(f"👋 Aaron left the call (no active state)")
            self.aaron_left_at = time.time()
            self.aaron_in_call = False
        elif self.aaron_in_call:
            # Aaron was in call but content is now empty
            logger.info(f"👋 Aaron left the call")
            self.aaron_left_at = time.time()
            self.aaron_in_call = False
                    
        return self.aaron_in_call
        
    def should_leave(self) -> bool:
        """Check if Sophie should leave (Aaron gone > timeout)."""
        if self.aaron_in_call:
            return False
        if self.aaron_left_at is None:
            return False
        elapsed = time.time() - self.aaron_left_at
        if elapsed > self.leave_timeout:
            logger.info(f"⏰ Aaron has been gone for {elapsed:.0f}s, leaving...")
            return True
        return False


# ============================================================================
# Audio Processor
# ============================================================================

class AudioProcessor:
    """Processes incoming audio for VAD and STT."""
    
    def __init__(self, vad: VADProcessor, stt: WhisperSTT, sample_rate: int = 48000):
        self.vad = vad
        self.stt = stt
        self.sample_rate = sample_rate
        
        # State
        self.audio_buffer: List[np.ndarray] = []
        self.vad_buffer: List[np.ndarray] = []  # Buffer for VAD (needs more samples)
        self.is_speaking = False
        self.silence_frames = 0
        self.speech_frames = 0
        
        # Config
        self.silence_threshold = 100  # ~1 sec at 10ms frames
        self.min_speech_frames = 30   # ~0.3 sec minimum speech
        self.vad_chunk_size = 512     # Silero VAD needs 512+ samples at 16kHz (~32ms)
        
    def process_frame(self, frame: rtc.AudioFrame) -> Optional[np.ndarray]:
        """Process an audio frame, return complete utterance when ready."""
        audio_data = np.frombuffer(frame.data, dtype=np.int16)
        
        # Always buffer the audio
        self.audio_buffer.append(audio_data)
        
        # Downsample to 16kHz for VAD and buffer
        audio_16k = audio_data[::3]  # Simple downsample from 48kHz to 16kHz
        self.vad_buffer.append(audio_16k)
        
        # Only run VAD when we have enough samples (512+ at 16kHz)
        vad_audio = np.concatenate(self.vad_buffer)
        if len(vad_audio) >= self.vad_chunk_size:
            is_speech = self.vad.is_speech(vad_audio, 16000)
            self.vad_buffer = []  # Clear VAD buffer
            
            if is_speech:
                if not self.is_speaking:
                    logger.info(f"🎤 Speech started (amplitude: {np.abs(vad_audio).mean():.0f})")
                self.is_speaking = True
                self.silence_frames = 0
                self.speech_frames += 1
            else:
                if self.is_speaking and self.silence_frames == 0:
                    logger.info(f"🔇 Silence started after {self.speech_frames} speech frames")
                self.silence_frames += 1
        
        # Check if utterance is complete (after silence)
        if self.is_speaking and self.silence_frames > self.silence_threshold:
            if self.speech_frames >= self.min_speech_frames:
                # Return complete utterance
                utterance = np.concatenate(self.audio_buffer)
                self._reset()
                logger.info(f"🎤 Got utterance: {len(utterance)} samples ({len(utterance)/self.sample_rate:.1f}s)")
                return utterance
            else:
                # Too short, discard
                logger.debug("Utterance too short, discarding")
                self._reset()
                
        return None
        
    def _reset(self):
        """Reset state for next utterance."""
        self.audio_buffer = []
        self.vad_buffer = []
        self.is_speaking = False
        self.silence_frames = 0
        self.speech_frames = 0


# ============================================================================
# Main Voice Agent
# ============================================================================

class SophieVoiceAgent:
    """Complete voice agent with Matrix + LiveKit integration."""
    
    def __init__(self):
        # Core clients
        self.matrix_client: Optional[AsyncClient] = None
        self.livekit_room: Optional[rtc.Room] = None
        self.audio_source: Optional[rtc.AudioSource] = None
        
        # Processing components
        self.vad = VADProcessor(threshold=config.vad_threshold)
        self.stt = WhisperSTT(config.whisper_path, config.whisper_model)
        self.tts = KokoroTTS(config.kokoro_url, config.kokoro_voice)
        self.ai = SophieAI(config.anthropic_api_key)
        self.presence = PresenceManager(config.aaron_user_id, config.leave_timeout)
        self.audio_processor: Optional[AudioProcessor] = None
        
        # State
        self.device_id: Optional[str] = None
        self.in_call = False
        self.is_speaking = False  # True when playing TTS
        self.should_stop = False
        
    async def start(self) -> bool:
        """Connect to Matrix."""
        logger.info("🚀 Starting Sophie Voice Agent...")
        
        # Validate config
        if not config.matrix_password:
            logger.error("❌ MATRIX_PASSWORD not set")
            return False
        if not config.anthropic_api_key:
            logger.error("❌ ANTHROPIC_API_KEY not set")
            return False
            
        # Connect to Matrix
        matrix_config = AsyncClientConfig(
            store=SqliteStore,
            store_name="sophie_voice",
            encryption_enabled=True,
        )
        
        self.matrix_client = AsyncClient(
            config.matrix_homeserver,
            config.matrix_user,
            config=matrix_config,
            store_path=str(config.data_path / "matrix_store"),
        )
        
        response = await self.matrix_client.login(
            config.matrix_password,
            device_name="Sophie Voice"
        )
        
        if isinstance(response, LoginResponse):
            self.device_id = response.device_id
            logger.info(f"✅ Matrix logged in as {config.matrix_user}")
            logger.info(f"   Device ID: {self.device_id}")
        else:
            logger.error(f"❌ Matrix login failed: {response}")
            return False
            
        # Initial sync
        await self.matrix_client.sync(timeout=30000, full_state=True)
        logger.info("✅ Matrix synced")
        
        # CLEANUP: Clear all old Sophie ghost call.member state events
        await self._cleanup_ghost_instances()
        
        return True
        
    async def _cleanup_ghost_instances(self):
        """Clean up ALL old Sophie call.member state events from previous sessions.
        
        Each restart creates a new device_id, leaving old state events as "ghosts"
        that appear in Element X as duplicate Sophie instances. This clears them all
        on startup before joining any calls.
        """
        logger.info("🧹 Cleaning up ghost Sophie instances...")
        
        try:
            state_events = await self.get_room_state()
            cleaned = 0
            
            for event in state_events:
                event_type = event.get("type", "")
                state_key = event.get("state_key", "")
                content = event.get("content", {})
                
                # Find Sophie's call.member events
                if event_type == "org.matrix.msc3401.call.member" and "sophie" in state_key.lower():
                    # Check if this is NOT our current device (or clean all if content exists)
                    event_device = content.get("device_id", "")
                    
                    if content and event_device != self.device_id:
                        # This is an old ghost - clear it
                        logger.info(f"   🗑️ Clearing ghost: {state_key} (device: {event_device})")
                        try:
                            await self.matrix_client.room_put_state(
                                room_id=config.matrix_room_id,
                                event_type="org.matrix.msc3401.call.member",
                                state_key=state_key,
                                content={},  # Empty content = leave
                            )
                            cleaned += 1
                        except Exception as e:
                            logger.warning(f"   ⚠️ Failed to clear {state_key}: {e}")
                            
            if cleaned > 0:
                logger.info(f"✅ Cleaned up {cleaned} ghost instance(s)")
            else:
                logger.info("✅ No ghost instances found")
                
        except Exception as e:
            logger.error(f"❌ Ghost cleanup failed: {e}")
        
    async def get_room_state(self) -> List[Dict]:
        """Get current room state events."""
        try:
            response = await self.matrix_client.room_get_state(config.matrix_room_id)
            if isinstance(response, RoomGetStateResponse):
                # Convert events to dicts with proper structure
                events = []
                for event in response.events:
                    if hasattr(event, 'source'):
                        events.append(event.source)
                    elif isinstance(event, dict):
                        events.append(event)
                return events
        except Exception as e:
            logger.warning(f"Failed to get room state: {e}")
        return []
        
    async def join_call(self, livekit_room_name: str):
        """Join a LiveKit room and announce to Matrix."""
        if self.in_call:
            return
            
        logger.info(f"🎤 Joining call: {livekit_room_name[:40]}...")
        
        # Generate encryption key
        key = secrets.token_bytes(32)
        
        # E2EE options (try with, fall back to without)
        try:
            e2ee_options = rtc.E2EEOptions(
                key_provider_options=rtc.KeyProviderOptions(
                    shared_key=key,
                    ratchet_salt=b"LKFrameEncryptionKey",
                    ratchet_window_size=16,
                ),
                encryption_type=1,
            )
        except TypeError:
            e2ee_options = rtc.E2EEOptions(
                key_provider_options=rtc.KeyProviderOptions(
                    shared_key=key,
                    ratchet_salt=b"LKFrameEncryptionKey",
                ),
                encryption_type=1,
            )
        
        # Create room and audio source
        self.livekit_room = rtc.Room()
        self.audio_source = rtc.AudioSource(config.sample_rate, config.num_channels)
        
        # Set up event handlers
        @self.livekit_room.on("participant_connected")
        def on_participant(participant):
            logger.info(f"👤 Participant connected: {participant.identity}")
            # Log all their existing tracks
            for pub in participant.track_publications.values():
                logger.info(f"   📡 Existing track: {pub.kind} - {pub.sid}")
            
        @self.livekit_room.on("track_subscribed")
        def on_track(track, publication, participant):
            # DEBUG: Log ALL tracks, not just audio
            logger.info(f"🎵 Track subscribed: kind={track.kind}, participant={participant.identity}")
            logger.info(f"   📡 Track details: sid={publication.sid}, source={publication.source}")
            
            if track.kind == rtc.TrackKind.KIND_AUDIO:
                logger.info(f"   ✅ This IS an audio track")
                logger.info(f"   🔍 Checking if '{config.aaron_user_id}' in '{participant.identity}'")
                
                # Start processing audio from this participant (process ALL audio for now)
                if config.aaron_user_id in participant.identity:
                    logger.info(f"   ✅ Matched Aaron! Starting audio processing...")
                    asyncio.create_task(self._process_audio_track(track, participant))
                else:
                    logger.info(f"   ⚠️ NOT Aaron - but let's process anyway for debugging")
                    asyncio.create_task(self._process_audio_track(track, participant))
            else:
                logger.info(f"   ℹ️ Not audio (kind={track.kind}), skipping")
                
        @self.livekit_room.on("track_published")
        def on_track_published(publication, participant):
            logger.info(f"📢 Track published: {publication.kind} from {participant.identity}")
            
        @self.livekit_room.on("track_unpublished")
        def on_track_unpublished(publication, participant):
            logger.info(f"🔇 Track unpublished: {publication.kind} from {participant.identity}")
                    
        @self.livekit_room.on("disconnected")
        def on_disconnect():
            logger.info("🔇 Disconnected from LiveKit")
            self.in_call = False
            
        # Generate token
        token = api.AccessToken(config.livekit_api_key, config.livekit_api_secret)
        token.with_identity(f"{config.matrix_user}:{self.device_id}")
        token.with_name("Sophie")
        token.with_grants(api.VideoGrants(
            room_join=True,
            room=livekit_room_name,
            can_publish=True,
            can_subscribe=True,
        ))
        
        # Set in_call BEFORE connecting so callbacks don't exit early
        self.in_call = True
        self.audio_processor = AudioProcessor(self.vad, self.stt, config.sample_rate)
        
        # Connect
        try:
            await self.livekit_room.connect(
                config.livekit_url,
                token.to_jwt(),
                options=rtc.RoomOptions(auto_subscribe=True)
            )
            logger.info("✅ Connected to LiveKit")
            
            # DEBUG: Log all existing participants and their tracks
            logger.info(f"📋 Room participants on join:")
            for participant in self.livekit_room.remote_participants.values():
                logger.info(f"   👤 {participant.identity} (sid={participant.sid})")
                for pub in participant.track_publications.values():
                    logger.info(f"      📡 Track: kind={pub.kind}, sid={pub.sid}, subscribed={pub.subscribed}")
                    # Try to subscribe if not subscribed
                    if not pub.subscribed and pub.kind == rtc.TrackKind.KIND_AUDIO:
                        logger.info(f"      🔄 Attempting to subscribe to audio track...")
                        
        except Exception as e:
            logger.error(f"❌ LiveKit connection failed: {e}")
            return
            
        # Publish audio track
        track = rtc.LocalAudioTrack.create_audio_track("sophie-voice", self.audio_source)
        await self.livekit_room.local_participant.publish_track(track)
        logger.info("🎙️ Audio track published")
        
        # Announce to Matrix
        await self._announce_call_membership(livekit_room_name)
        
        # Start sending silence when not speaking
        asyncio.create_task(self._send_audio_loop())
        
    async def _announce_call_membership(self, room_name: str):
        """Publish Matrix call.member state event."""
        state_key = f"_{config.matrix_user}_{self.device_id}_m.call"
        
        content = {
            "application": "m.call",
            "call_id": "",
            "scope": "m.room",
            "device_id": self.device_id,
            "expires": 7200000,
            "focus_active": {
                "type": "livekit",
                "focus_selection": "oldest_membership"
            },
            "foci_preferred": [
                {
                    "type": "livekit",
                    "livekit_service_url": "https://matrix3.aaroncollins.info/livekit-jwt-service",
                    "livekit_alias": config.matrix_room_id
                }
            ],
            "m.call.intent": "audio",
            "created_ts": int(time.time() * 1000)
        }
        
        try:
            response = await self.matrix_client.room_put_state(
                room_id=config.matrix_room_id,
                event_type="org.matrix.msc3401.call.member",
                state_key=state_key,
                content=content,
            )
            logger.info(f"✅ Call membership announced")
        except Exception as e:
            logger.error(f"❌ Failed to announce call membership: {e}")
            
    async def leave_call(self):
        """Leave the LiveKit room and clear Matrix state."""
        if not self.in_call:
            return
            
        logger.info("👋 Leaving call...")
        
        # Clear Matrix state
        if self.matrix_client and self.device_id:
            state_key = f"_{config.matrix_user}_{self.device_id}_m.call"
            try:
                await self.matrix_client.room_put_state(
                    room_id=config.matrix_room_id,
                    event_type="org.matrix.msc3401.call.member",
                    state_key=state_key,
                    content={},
                )
                logger.info("✅ Call membership cleared")
            except Exception as e:
                logger.error(f"Failed to clear call membership: {e}")
                
        # Disconnect from LiveKit
        if self.livekit_room:
            await self.livekit_room.disconnect()
            self.livekit_room = None
            
        self.in_call = False
        self.audio_processor = None
        
    async def _process_audio_track(self, track, participant):
        """Process incoming audio from a participant."""
        logger.info(f"🎧 Starting audio processing from {participant.identity}")
        logger.info(f"   Track info: kind={track.kind}, sid={track.sid}")
        
        try:
            audio_stream = rtc.AudioStream(track)
            logger.info(f"   ✅ AudioStream created successfully")
        except Exception as e:
            logger.error(f"   ❌ Failed to create AudioStream: {e}")
            return
            
        frame_count = 0
        zero_frames = 0
        
        logger.info(f"   🔄 Entering async for loop on audio_stream...")
        
        try:
            async for event in audio_stream:
                if self.should_stop or not self.in_call:
                    logger.info(f"   🛑 Stopping audio processing (should_stop={self.should_stop}, in_call={self.in_call})")
                    break
                    
                frame = event.frame
                frame_count += 1
                
                # Log first frame immediately
                if frame_count == 1:
                    audio_data = np.frombuffer(frame.data, dtype=np.int16)
                    avg_amplitude = np.abs(audio_data).mean()
                    max_amplitude = np.abs(audio_data).max()
                    logger.info(f"   🎤 FIRST FRAME! samples={len(audio_data)}, avg_amp={avg_amplitude:.0f}, max_amp={max_amplitude}")
                    logger.info(f"      Frame details: sample_rate={frame.sample_rate}, channels={frame.num_channels}, samples_per_ch={frame.samples_per_channel}")
                    if max_amplitude == 0:
                        logger.warning(f"      ⚠️ Audio is ALL ZEROS - possible E2EE encryption issue!")
                
                # Track zero frames (encryption issue indicator)
                audio_data = np.frombuffer(frame.data, dtype=np.int16)
                if np.abs(audio_data).max() == 0:
                    zero_frames += 1
                
                # Log every 500 frames (~5 seconds) to show we're getting audio
                if frame_count % 500 == 0:
                    avg_amplitude = np.abs(audio_data).mean()
                    max_amplitude = np.abs(audio_data).max()
                    logger.info(f"📊 Audio frames: {frame_count} received, {zero_frames} zero-frames, avg_amp={avg_amplitude:.0f}, max={max_amplitude}")
                
                # Skip if we're speaking (barge-in could be added here)
                if self.is_speaking:
                    continue
                    
                # Process frame through VAD
                if self.audio_processor:
                    utterance = self.audio_processor.process_frame(frame)
                    if utterance is not None:
                        # Got complete utterance, process it
                        asyncio.create_task(self._handle_utterance(utterance))
                        
        except Exception as e:
            logger.error(f"   ❌ Error in audio processing loop: {e}")
            import traceback
            traceback.print_exc()
            
        logger.info(f"   🏁 Audio processing ended. Total frames: {frame_count}")
                    
    async def _handle_utterance(self, audio_data: np.ndarray):
        """Handle a complete utterance: STT → AI → TTS."""
        try:
            # Transcribe
            logger.info("🎤 Transcribing...")
            text = await self.stt.transcribe(audio_data, config.sample_rate)
            
            if not text or len(text.strip()) < config.min_utterance_length:
                logger.info("(empty or too short, ignoring)")
                return
                
            logger.info(f"📝 Heard: {text}")
            
            # Get AI response
            logger.info("🧠 Thinking...")
            response = await self.ai.get_response(text)
            logger.info(f"💬 Response: {response}")
            
            # Speak response
            await self._speak(response)
            
        except Exception as e:
            logger.error(f"Error handling utterance: {e}")
            
    async def _speak(self, text: str):
        """Convert text to speech and send to LiveKit."""
        self.is_speaking = True
        
        try:
            logger.info(f"🗣️ Speaking: {text[:50]}...")
            
            # Generate TTS
            pcm_audio = await self.tts.synthesize(text)
            if pcm_audio is None:
                logger.error("TTS failed")
                return
                
            # Convert to frames and send
            frames = self.tts.pcm_to_frames(pcm_audio, input_rate=24000)
            
            for frame in frames:
                if not self.in_call:
                    break
                await self.audio_source.capture_frame(frame)
                await asyncio.sleep(0.01)
                
            logger.info("✅ Finished speaking")
            
        finally:
            self.is_speaking = False
            
    async def _send_audio_loop(self):
        """Send silence when not speaking."""
        silence = np.zeros(config.samples_per_channel, dtype=np.int16)
        frame = rtc.AudioFrame(
            data=silence.tobytes(),
            sample_rate=config.sample_rate,
            num_channels=config.num_channels,
            samples_per_channel=config.samples_per_channel,
        )
        
        while self.in_call and not self.should_stop:
            if not self.is_speaking:
                await self.audio_source.capture_frame(frame)
            await asyncio.sleep(0.01)
            
    async def run(self):
        """Main run loop."""
        if not await self.start():
            return
            
        logger.info("👀 Watching for Aaron...")
        
        # LiveKit API for room checking
        lk_api = api.LiveKitAPI(
            url=config.livekit_url.replace("wss://", "https://"),
            api_key=config.livekit_api_key,
            api_secret=config.livekit_api_secret,
        )
        
        try:
            while not self.should_stop:
                # Sync Matrix
                try:
                    await self.matrix_client.sync(timeout=5000)
                except Exception as e:
                    logger.warning(f"Matrix sync error: {e}")
                    await asyncio.sleep(5)
                    continue
                    
                # Get room state and check Aaron's presence
                state_events = await self.get_room_state()
                aaron_in_call = self.presence.check_aaron_state(state_events)
                
                if aaron_in_call and not self.in_call:
                    # Aaron joined - find and join the LiveKit room
                    try:
                        rooms = await lk_api.room.list_rooms(api.ListRoomsRequest())
                        for room in rooms.rooms:
                            if room.num_participants > 0:
                                await self.join_call(room.name)
                                break
                    except Exception as e:
                        logger.error(f"Error listing LiveKit rooms: {e}")
                        
                elif not aaron_in_call and self.in_call:
                    # Aaron left - check timeout
                    if self.presence.should_leave():
                        await self.leave_call()
                        
                await asyncio.sleep(2)
                
        except asyncio.CancelledError:
            pass
        finally:
            await self.stop()
            
    async def stop(self):
        """Clean shutdown."""
        self.should_stop = True
        await self.leave_call()
        if self.matrix_client:
            await self.matrix_client.close()
        logger.info("👋 Sophie stopped")


# ============================================================================
# Entry Point
# ============================================================================

async def main():
    agent = SophieVoiceAgent()
    
    try:
        await agent.run()
    except KeyboardInterrupt:
        pass
    finally:
        await agent.stop()


if __name__ == "__main__":
    asyncio.run(main())
