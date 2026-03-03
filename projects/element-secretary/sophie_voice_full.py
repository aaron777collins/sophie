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
    vad_threshold: float = float(os.getenv("VAD_THRESHOLD", "0.1"))  # Lowered for better detection
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
    """Voice Activity Detection using amplitude-based detection (simple but reliable)."""
    
    def __init__(self, threshold: float = 0.1):
        # Amplitude threshold for speech detection
        # 500 was too sensitive, picking up background noise
        # 1500-2000 should require actual voice to trigger
        self.amplitude_threshold = 1500
        self._initialized = True
        self._vad_calls = 0
        self._speech_count = 0
        logger.info(f"✅ Amplitude-based VAD initialized (threshold={self.amplitude_threshold})")
        
    def is_speech(self, audio_chunk: np.ndarray, sample_rate: int = 16000) -> bool:
        """Check if audio chunk contains speech using amplitude threshold."""
        avg_amplitude = np.abs(audio_chunk).mean()
        is_speech = avg_amplitude > self.amplitude_threshold
        
        # Debug logging
        self._vad_calls += 1
        if is_speech:
            self._speech_count += 1
        
        if self._vad_calls % 100 == 0:  # Log every 100 calls (~3 seconds)
            logger.info(f"🔊 VAD: is_speech={is_speech}, speech_ratio={self._speech_count}/{self._vad_calls}, amp={avg_amplitude:.0f}, threshold={self.amplitude_threshold}")
        
        return is_speech


# ============================================================================
# Speech-to-Text (faster-whisper)
# ============================================================================

class WhisperSTT:
    """Speech-to-Text using faster-whisper (CTranslate2 - much faster than CLI)."""
    
    def __init__(self, whisper_path: str, model: str = "tiny.en"):
        self.model_name = model
        self._model = None
        
    def _get_model(self):
        """Lazy-load the model."""
        if self._model is None:
            from faster_whisper import WhisperModel
            logger.info(f"🔄 Loading faster-whisper model: {self.model_name}")
            # Use CPU with int8 quantization for speed
            self._model = WhisperModel(self.model_name, device="cpu", compute_type="int8")
            logger.info(f"✅ Model loaded")
        return self._model
        
    async def transcribe(self, audio_data: np.ndarray, sample_rate: int = 48000) -> str:
        """Transcribe audio to text using faster-whisper."""
        try:
            import time
            start = time.time()
            
            # Normalize/amplify audio to improve accuracy
            max_val = np.abs(audio_data).max()
            if max_val > 0 and max_val < 10000:  # Too quiet, amplify
                scale = 16000 / max_val
                audio_data = (audio_data.astype(np.float32) * scale).clip(-32767, 32767).astype(np.int16)
                logger.info(f"🔊 Amplified audio by {scale:.1f}x (was max={max_val})")
            
            # Convert to float32 normalized [-1, 1] for faster-whisper
            audio_float = audio_data.astype(np.float32) / 32768.0
            
            # Resample to 16kHz if needed (faster-whisper expects 16kHz)
            if sample_rate != 16000:
                from scipy.signal import resample
                num_samples = int(len(audio_float) * 16000 / sample_rate)
                audio_float = resample(audio_float, num_samples)
            
            # Run transcription in executor to not block
            def do_transcribe():
                model = self._get_model()
                segments, info = model.transcribe(audio_float, language="en", beam_size=1, best_of=1)
                return " ".join([seg.text for seg in segments]).strip()
            
            text = await asyncio.get_event_loop().run_in_executor(None, do_transcribe)
            
            elapsed = time.time() - start
            logger.info(f"📝 Transcribed in {elapsed:.1f}s: {text}")
            return text
                
        except Exception as e:
            logger.error(f"Whisper error: {e}")
            import traceback
            traceback.print_exc()
            return ""


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
        """Get AI response to user's speech using OAuth token."""
        try:
            import httpx
            
            self.conversation_history.append({
                "role": "user",
                "content": user_text
            })
            
            # Keep conversation history manageable
            if len(self.conversation_history) > 20:
                self.conversation_history = self.conversation_history[-20:]
            
            # OAuth tokens need Bearer auth + beta header
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    "https://api.anthropic.com/v1/messages",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "anthropic-version": "2023-06-01",
                        "anthropic-beta": "oauth-2025-04-20",
                        "content-type": "application/json",
                    },
                    json={
                        "model": "claude-sonnet-4-20250514",
                        "max_tokens": 300,
                        "system": self.system_prompt,
                        "messages": self.conversation_history,
                    }
                )
                response.raise_for_status()
                data = response.json()
            
            assistant_text = data["content"][0]["text"]
            
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
        self.aaron_e2ee_key: Optional[bytes] = None  # Aaron's encryption key (from to-device or call.member)
        self.aaron_device_id: Optional[str] = None  # Aaron's device ID for to-device messaging
        
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
                    self.aaron_device_id = content.get("device_id")  # Store for to-device messaging
                    if not self.aaron_in_call:
                        logger.info(f"👤 Aaron joined the call (device: {self.aaron_device_id})")
                    
                    # Extract Aaron's encryption key if present (MSC4143)
                    enc_keys = content.get("encryption_keys", [])
                    if enc_keys:
                        key_data = enc_keys[0]  # Use first key
                        aaron_key_b64 = key_data.get("key")
                        if aaron_key_b64:
                            self.aaron_e2ee_key = base64.b64decode(aaron_key_b64)
                            logger.info(f"🔑 Got Aaron's encryption key ({len(self.aaron_e2ee_key)} bytes)")
                    else:
                        self.aaron_e2ee_key = None
                        logger.warning("⚠️ Aaron's call.member has no encryption_keys")
                    
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
        self.silence_threshold = 50   # ~0.5 sec of silence triggers utterance end (was 75)
        self.min_speech_frames = 75   # ~0.75 sec minimum speech (filter noise blips, was 50)
        self.vad_chunk_size = 480     # WebRTC VAD: 30ms at 16kHz (10/20/30ms supported)
        
    def process_frame(self, frame: rtc.AudioFrame) -> Optional[np.ndarray]:
        """Process an audio frame, return complete utterance when ready."""
        audio_data = np.frombuffer(frame.data, dtype=np.int16)
        
        # Always buffer the audio
        self.audio_buffer.append(audio_data)
        
        # Downsample to 16kHz for VAD - simple decimation (every 3rd sample)
        # scipy.signal.decimate was killing amplitude due to filtering
        audio_16k = audio_data[::3].copy()  # Simple downsample, preserves amplitude
        self.vad_buffer.append(audio_16k)
        
        # Only run VAD when we have enough samples (process in exact 512-sample chunks)
        vad_audio = np.concatenate(self.vad_buffer)
        is_speech = False
        
        # Process all complete 512-sample chunks
        while len(vad_audio) >= self.vad_chunk_size:
            # Extract EXACTLY 512 samples for Silero VAD
            chunk = vad_audio[:512].copy()  # Copy to ensure contiguous array
            vad_audio = vad_audio[512:]
            
            # Run VAD on this chunk
            is_speech = self.vad.is_speech(chunk, 16000)
            
        # Keep remaining samples for next iteration
        if len(vad_audio) > 0:
            self.vad_buffer = [vad_audio]
        else:
            self.vad_buffer = []
        
        # Process VAD result with smoothing (require 3+ consecutive frames to change state)
        if is_speech:
            self.speech_frames += 1
            # Only transition to speaking after 3 consecutive speech frames
            if not self.is_speaking and self.speech_frames >= 3:
                logger.info(f"🎤 Speech started (after {self.speech_frames} frames)")
                self.is_speaking = True
            if self.is_speaking:
                self.silence_frames = 0  # Reset silence counter when speaking
        else:
            self.silence_frames += 1
            # Log silence start only once (first time we hit 5 consecutive silence frames)
            if self.is_speaking and self.silence_frames == 5:
                logger.info(f"🔇 Silence detected after {self.speech_frames} speech frames")
        
        # Check if utterance is complete (after sustained silence)
        if self.is_speaking and self.silence_frames > self.silence_threshold:
            if self.speech_frames >= self.min_speech_frames:
                # Return complete utterance
                utterance = np.concatenate(self.audio_buffer)
                duration = len(utterance) / self.sample_rate
                logger.info(f"🎤 Got utterance: {len(utterance)} samples ({duration:.1f}s)")
                self._reset()
                return utterance
            else:
                # Too short, discard
                logger.info(f"Utterance too short ({self.speech_frames} frames), discarding")
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
        
        # E2EE keys (SFrame encryption for MatrixRTC)
        import secrets
        self.our_e2ee_key = secrets.token_bytes(32)  # 256-bit key
        self.our_e2ee_key_b64 = base64.b64encode(self.our_e2ee_key).decode()
        self.aaron_e2ee_key: Optional[bytes] = None
        logger.info(f"🔑 Generated our encryption key ({len(self.our_e2ee_key)} bytes)")
        
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
        
        # CRITICAL: Use consistent paths for crypto store persistence
        # NOTE: matrix_store contains existing Olm keys - DO NOT change this path
        session_file = config.data_path / "session.json"
        crypto_store_path = config.data_path / "matrix_store"  # Use existing store!
        crypto_store_path.mkdir(parents=True, exist_ok=True)
        
        # Try to load saved session first
        saved_session = None
        if session_file.exists():
            try:
                with open(session_file) as f:
                    saved_session = json.load(f)
                logger.info(f"📂 Found saved session: device_id={saved_session.get('device_id')}")
            except Exception as e:
                logger.warning(f"⚠️ Failed to load session file: {e}")
        
        # Use saved device_id or generate a PERSISTENT one
        device_id = saved_session.get("device_id") if saved_session else "SOPHIEVOICE01"
        
        # Connect to Matrix with PERSISTENT crypto store
        # CRITICAL: store_path and store_name must be same every time for Olm keys to persist
        matrix_config = AsyncClientConfig(
            store=SqliteStore,
            store_name="sophie_matrix",  # Must match existing DB filename
            encryption_enabled=True,
        )
        
        self.matrix_client = AsyncClient(
            config.matrix_homeserver,
            config.matrix_user,
            config=matrix_config,
            store_path=str(crypto_store_path),  # CRITICAL: Use dedicated crypto store path
            device_id=device_id,
        )
        
        # Try to restore session if we have one
        if saved_session and saved_session.get("access_token"):
            self.matrix_client.access_token = saved_session["access_token"]
            self.matrix_client.user_id = saved_session.get("user_id", config.matrix_user)
            self.matrix_client.device_id = device_id
            self.device_id = device_id
            logger.info(f"✅ Restored Matrix session: device_id={self.device_id}")
            logger.info(f"   Crypto store: {crypto_store_path}")
            
            # matrix-nio loads the store automatically when we call sync()
            # Just verify the store path exists
            store_db = crypto_store_path / "sophie_matrix"
            if store_db.exists():
                logger.info(f"✅ Found existing crypto store DB")
            else:
                logger.warning(f"⚠️ No existing crypto store - new Olm keys will be created")
        else:
            # Fresh login - will create new crypto keys
            response = await self.matrix_client.login(
                config.matrix_password,
                device_name="Sophie Voice",
            )
            
            if isinstance(response, LoginResponse):
                self.device_id = response.device_id
                logger.info(f"✅ Matrix logged in as {config.matrix_user}")
                logger.info(f"   Device ID: {self.device_id}")
                
                # Save session for next time
                with open(session_file, "w") as f:
                    json.dump({
                        "access_token": self.matrix_client.access_token,
                        "device_id": self.device_id,
                        "user_id": config.matrix_user,
                    }, f)
                logger.info(f"💾 Saved session to {session_file}")
            else:
                logger.error(f"❌ Matrix login failed: {response}")
                return False
            
        # Add callback for to-device events (encryption keys)
        self.e2ee_key = None
        self.matrix_client.add_to_device_callback(self._on_to_device_event, None)
        logger.info("🔐 Listening for E2EE keys via to-device")
        
        # Initial sync - CRITICAL: Use sync_forever pattern for proper key sharing
        logger.info("🔄 Starting Matrix sync (may take a moment to receive keys)...")
        await self.matrix_client.sync(timeout=30000, full_state=True)
        logger.info("✅ Matrix synced")
        
        # CRITICAL: Request room keys we don't have
        await self._request_missing_room_keys()
        
        # CLEANUP: Clear all old Sophie ghost call.member state events
        await self._cleanup_ghost_instances()
        
        return True
    
    async def _request_missing_room_keys(self):
        """Request Megolm session keys for encrypted rooms we're in.
        
        This is CRITICAL for E2EE - without the session keys, we can't decrypt messages.
        Aaron's client needs to share keys with us.
        """
        logger.info("🔑 Checking for missing room keys...")
        
        try:
            # Get the room object
            room = self.matrix_client.rooms.get(config.matrix_room_id)
            if not room:
                logger.warning(f"⚠️ Room {config.matrix_room_id} not in client state yet")
                return
            
            # Check if room is encrypted
            if not room.encrypted:
                logger.info(f"ℹ️ Room is not encrypted, no keys needed")
                return
            
            # Request keys for this room
            # This sends m.room_key_request to-device messages
            logger.info(f"📤 Requesting room keys for {config.matrix_room_id}")
            
            # Send key request for any undecrypted events
            # The SDK handles this automatically during sync when it encounters
            # MegolmEvent that it can't decrypt, but we can also trigger manually
            
            # Try to import/query keys from the crypto store
            if hasattr(self.matrix_client, 'olm') and self.matrix_client.olm:
                sessions = self.matrix_client.olm.inbound_group_store
                if sessions:
                    count = len(list(sessions))
                    logger.info(f"✅ Have {count} Megolm sessions in store")
                else:
                    logger.warning("⚠️ No Megolm sessions in store - waiting for key share from Aaron")
                    logger.warning("   👉 Aaron may need to verify Sophie's device in Element")
            
            # Log our device keys for verification
            if hasattr(self.matrix_client, 'device_id'):
                logger.info(f"📱 Our device: {self.matrix_client.device_id}")
                logger.info(f"   Aaron needs to verify this device to share keys")
                
        except Exception as e:
            logger.error(f"❌ Error requesting room keys: {e}")
            import traceback
            logger.error(traceback.format_exc())
        
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
    
    async def _on_to_device_event(self, event):
        """Handle to-device events (including encryption keys from Element X per MSC4143)."""
        try:
            event_type = event.source.get("type", "")
            content = event.source.get("content", {})
            sender = event.source.get("sender", "")
            
            # Log ALL to-device events for debugging (info level to see what's coming)
            logger.info(f"📨 To-device event: type={event_type}, sender={sender}")
            logger.debug(f"   Content keys: {list(content.keys())}")
            
            # Handle room key sharing (m.room_key - for Megolm sessions)
            if event_type == "m.room_key":
                logger.info(f"🔐 Received room key from {sender}")
                room_id = content.get("room_id", "")
                session_id = content.get("session_id", "")
                logger.info(f"   Room: {room_id}, Session: {session_id[:20]}...")
                # The SDK automatically processes these and adds to the crypto store
                return
            
            # Handle forwarded room keys
            if event_type == "m.forwarded_room_key":
                logger.info(f"🔐 Received forwarded room key from {sender}")
                return
            
            # Handle key requests (someone asking us for keys)
            if event_type == "m.room_key_request":
                logger.info(f"📬 Received key request from {sender}")
                # We could respond with keys if we have them, but for voice bot we don't need to
                return
            
            # Handle MSC4143 MatrixRTC encryption keys (for voice/audio E2EE)
            if event_type == "m.rtc.encryption_key" or event_type == "io.element.call.encryption_keys":
                logger.info(f"🔐 Received MatrixRTC encryption key from {sender}")
                logger.info(f"   Full content: {json.dumps(content, indent=2)}")
                
                # MSC4143 format: media_key.key and media_key.index
                media_key = content.get("media_key", {})
                key_b64 = media_key.get("key") or content.get("key")
                key_index = media_key.get("index", 0) or content.get("index", 0)
                member_id = content.get("member_id", "unknown")
                
                # Also check legacy/Element-specific formats
                if not key_b64:
                    keys = content.get("keys", {})
                    key_b64 = keys.get("key")
                    key_index = keys.get("index", 0)
                
                # Element X may use encryption_keys array
                if not key_b64:
                    enc_keys = content.get("encryption_keys", [])
                    if enc_keys:
                        key_b64 = enc_keys[0].get("key")
                        key_index = enc_keys[0].get("index", 0)
                
                if key_b64:
                    self.presence.aaron_e2ee_key = base64.b64decode(key_b64)
                    logger.info(f"✅ Stored Aaron's MatrixRTC E2EE key!")
                    logger.info(f"   Member: {member_id}, Index: {key_index}, Size: {len(self.presence.aaron_e2ee_key)} bytes")
                else:
                    logger.warning(f"⚠️ MatrixRTC key event had no key data")
                return
            
            # Log other interesting to-device events
            if "key" in event_type.lower() or "encrypt" in event_type.lower():
                logger.info(f"🔐 Other crypto event: {event_type}")
                logger.info(f"   Content: {json.dumps(content, indent=2)[:500]}")
                    
        except Exception as e:
            logger.error(f"❌ Error handling to-device event: {e}")
            import traceback
            logger.error(traceback.format_exc())
        
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
        
        # E2EE setup using Aaron's key from his call.member event
        # MatrixRTC uses SFrame E2EE where each participant publishes their key
        e2ee_options = None
        aaron_key = self.presence.aaron_e2ee_key
        if aaron_key:
            logger.info(f"🔐 Using Aaron's E2EE key from call.member ({len(aaron_key)} bytes)")
            try:
                e2ee_options = rtc.E2EEOptions(
                    key_provider_options=rtc.KeyProviderOptions(
                        shared_key=aaron_key,
                        ratchet_salt=b"LKFrameEncryptionKey",
                    ),
                    encryption_type=1,
                )
            except Exception as e:
                logger.warning(f"⚠️ E2EE setup failed: {e}")
        else:
            logger.warning("⚠️ Aaron's encryption key not found in call.member - audio may be encrypted")
            logger.warning("   Check if Aaron's Element X is publishing encryption_keys in call.member")
        
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
        
        # Send our encryption key to Aaron via to-device (MSC4143)
        await self._send_encryption_key_to_aaron()
        
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
            "created_ts": int(time.time() * 1000),
            # E2EE encryption keys (MSC4143)
            "encryption_keys": [
                {
                    "index": 0,
                    "key": self.our_e2ee_key_b64,
                }
            ],
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
    
    async def _send_encryption_key_to_aaron(self):
        """Send our encryption key to Aaron via to-device message (MSC4143).
        
        This is how MatrixRTC participants share media encryption keys.
        Each participant sends their key to all other participants.
        """
        if not self.presence.aaron_device_id:
            logger.warning("⚠️ Cannot send encryption key - don't know Aaron's device ID")
            # Try to get device ID from room state
            state_events = await self.get_room_state()
            for event in state_events:
                if event.get("type") == "org.matrix.msc3401.call.member":
                    state_key = event.get("state_key", "")
                    content = event.get("content", {})
                    if config.aaron_user_id in state_key and content.get("device_id"):
                        self.presence.aaron_device_id = content["device_id"]
                        logger.info(f"📱 Found Aaron's device ID: {self.presence.aaron_device_id}")
                        break
            
            if not self.presence.aaron_device_id:
                logger.warning("⚠️ Still no device ID for Aaron - cannot send key")
                return
            
        try:
            # MSC4143 format for m.rtc.encryption_key
            member_id = f"{self.device_id}_{secrets.token_hex(4)}"
            key_content = {
                "room_id": config.matrix_room_id,
                "member_id": member_id,
                "media_key": {
                    "index": 0,
                    "key": self.our_e2ee_key_b64,
                },
                "version": "0"
            }
            
            logger.info(f"📤 Sending MatrixRTC encryption key to Aaron")
            logger.info(f"   Device: {self.presence.aaron_device_id}")
            logger.info(f"   Member ID: {member_id}")
            
            # Use matrix-nio's to_device method directly
            # Format: {event_type: {user_id: {device_id: content}}}
            messages = {
                config.aaron_user_id: {
                    self.presence.aaron_device_id: key_content
                }
            }
            
            response = await self.matrix_client.to_device(
                "m.rtc.encryption_key",
                messages
            )
            
            if hasattr(response, 'transport_response'):
                status = response.transport_response.status if hasattr(response.transport_response, 'status') else 'ok'
                logger.info(f"✅ Sent encryption key to Aaron (status: {status})")
            else:
                logger.info(f"✅ Sent encryption key to Aaron: {response}")
            
        except Exception as e:
            logger.error(f"❌ Failed to send encryption key to Aaron: {e}")
            import traceback
            logger.error(traceback.format_exc())
            
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
        
        # Cache LiveKit room name for faster rejoins
        cached_room_name = None
        
        try:
            while not self.should_stop:
                # Sync Matrix (shorter timeout for faster detection)
                try:
                    await self.matrix_client.sync(timeout=1000)
                except Exception as e:
                    logger.warning(f"Matrix sync error: {e}")
                    await asyncio.sleep(1)
                    continue
                    
                # Get room state and check Aaron's presence
                state_events = await self.get_room_state()
                aaron_in_call = self.presence.check_aaron_state(state_events)
                
                if aaron_in_call and not self.in_call:
                    # Aaron joined - find and join the LiveKit room
                    room_name = cached_room_name
                    
                    if not room_name:
                        # Find room with participants
                        try:
                            rooms = await lk_api.room.list_rooms(api.ListRoomsRequest())
                            for room in rooms.rooms:
                                if room.num_participants > 0:
                                    room_name = room.name
                                    cached_room_name = room_name  # Cache for next time
                                    break
                        except Exception as e:
                            logger.error(f"Error listing LiveKit rooms: {e}")
                    
                    if room_name:
                        await self.join_call(room_name)
                        
                elif not aaron_in_call and self.in_call:
                    # Aaron left - check timeout
                    if self.presence.should_leave():
                        await self.leave_call()
                        
                await asyncio.sleep(0.5)  # Faster polling
                
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
