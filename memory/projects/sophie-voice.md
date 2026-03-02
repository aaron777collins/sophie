# Sophie Voice - Element X Integration

**Last Updated:** 2026-03-02 17:00 EST
**Status:** Phase 1 Complete (visible in calls), Phase 2 In Planning

## Overview

Sophie Voice is the voice assistant integration that allows Sophie to join Element X (Matrix) voice/video calls via LiveKit. Fully self-hosted on dev3.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Element X (iOS/Android)                         │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Matrix Synapse (matrix3.aaroncollins.info)                │
│                         - Call membership state events                       │
│                         - Room state monitoring                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Sophie Voice Bot (Python)                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Presence   │  │    VAD      │  │     STT     │  │     TTS     │         │
│  │  Detector   │──│  (silero)   │──│  (whisper)  │──│  (kokoro)   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘         │
│         │                │                │                │                 │
│         ▼                ▼                ▼                ▼                 │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        AI Brain (Claude API)                         │    │
│  │                    Conversation context + Response                   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    LiveKit Server (livekit3.aaroncollins.info)               │
│                         - WebRTC audio streams                               │
│                         - E2EE encryption                                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Server Infrastructure (All on dev3)

| Service | URL | Status |
|---------|-----|--------|
| Matrix Synapse | https://matrix3.aaroncollins.info | ✅ Running |
| LiveKit Server | wss://livekit3.aaroncollins.info | ✅ Running |
| Kokoro TTS | http://localhost:8880/v1 | ✅ Running |
| Whisper STT | CLI at `/home/linuxbrew/.linuxbrew/bin/whisper` | ✅ Installed |
| Claude API | Direct API calls | ✅ Key in .env |

## Key Files

- **Main script:** `~/clawd/projects/element-secretary/matrix_e2ee_voice.py`
- **Environment:** `~/clawd/projects/element-secretary/.env`
- **Python venv:** `~/clawd/projects/element-secretary/.venv/`
- **Matrix store:** `~/clawd/projects/element-secretary/data/matrix_store/`
- **Whisper models:** `~/.cache/whisper/` (base.pt, large-v3-turbo.pt)

## Credentials & Config (from .env)

| Setting | Value |
|---------|-------|
| Matrix Homeserver | https://matrix3.aaroncollins.info |
| Matrix User | @sophie:matrix3.aaroncollins.info |
| Matrix Password | TxAS4jIPit8fslkh1S9v |
| Matrix Room ID | !iCDid0eGkre_6MbGVNl4lpvjqw90py9XY45ouXXn-nE |
| LiveKit URL | wss://livekit3.aaroncollins.info |
| LiveKit API Key | 8292ca21-ade4-5baf-ad8b-d0126c89cc4b |
| LiveKit API Secret | c6e4453b-09d8-5205-8196-cbe7c9ba7040 |
| Kokoro TTS URL | http://localhost:8880/v1 |
| Kokoro Voice | af_heart |
| Anthropic API Key | sk-ant-oat01-... (in .env) |

---

## IMPLEMENTATION PLAN

### Phase 1: Element X Visibility ✅ COMPLETE

Sophie can join calls and appear in Element X participant list.

**What was fixed:**
- State key format: `_@sophie:matrix3.aaroncollins.info_DEVICEID_m.call`
- Content structure matching Element X expectations
- Proper `foci_preferred` with JWT service URL

### Phase 2: Presence Detection & Auto-Join/Leave

**Goal:** Sophie automatically joins when Aaron joins, leaves 5 min after Aaron leaves.

#### 2.1 Aaron Presence Detection

Monitor call.member state events for Aaron:

```python
class PresenceManager:
    def __init__(self):
        self.aaron_in_call = False
        self.aaron_left_at = None
        self.leave_timeout = 300  # 5 minutes
        
    async def check_aaron_presence(self, room_state):
        """Check if Aaron is in the call based on Matrix state."""
        aaron_state_keys = [
            key for key in room_state 
            if key.startswith("_@aaron:matrix3.aaroncollins.info_") 
            and key.endswith("_m.call")
        ]
        
        for key in aaron_state_keys:
            content = room_state[key].get("content", {})
            # Non-empty content means Aaron is in call
            if content and content.get("device_id"):
                self.aaron_in_call = True
                self.aaron_left_at = None
                return True
        
        # Aaron not in call
        if self.aaron_in_call:
            self.aaron_left_at = time.time()
        self.aaron_in_call = False
        return False
    
    def should_leave(self):
        """Check if Sophie should leave (Aaron gone > 5 min)."""
        if self.aaron_left_at is None:
            return False
        return time.time() - self.aaron_left_at > self.leave_timeout
```

#### 2.2 Auto-Join Logic

```python
async def watch_for_aaron(self):
    """Main loop: join when Aaron joins, leave when he's gone 5+ min."""
    while True:
        # Check Matrix state for Aaron's call membership
        aaron_in_call = await self.presence.check_aaron_presence()
        
        if aaron_in_call and not self.in_call:
            # Aaron joined - Sophie joins
            logger.info("👤 Aaron joined call - Sophie joining...")
            await self.join_call()
            
        elif not aaron_in_call and self.in_call:
            if self.presence.should_leave():
                # Aaron gone > 5 min - Sophie leaves
                logger.info("👋 Aaron left 5+ min ago - Sophie leaving...")
                await self.leave_call()
        
        await asyncio.sleep(2)
```

### Phase 3: Audio Pipeline (STT → AI → TTS)

#### 3.1 Audio Capture from LiveKit

```python
class AudioProcessor:
    def __init__(self):
        self.audio_buffer = []
        self.sample_rate = 48000
        self.is_speaking = False
        
    async def on_track_subscribed(self, track, publication, participant):
        """Handle incoming audio track from Aaron."""
        if track.kind != rtc.TrackKind.KIND_AUDIO:
            return
            
        audio_stream = rtc.AudioStream(track)
        async for frame in audio_stream:
            await self.process_audio_frame(frame, participant)
    
    async def process_audio_frame(self, frame: rtc.AudioFrame, participant):
        """Buffer audio frames and detect speech."""
        # Convert to numpy array
        audio_data = np.frombuffer(frame.data, dtype=np.int16)
        self.audio_buffer.append(audio_data)
        
        # VAD check (see 3.2)
        if self.vad.is_speech(audio_data):
            self.is_speaking = True
            self.silence_frames = 0
        else:
            self.silence_frames += 1
            
        # After 1 second of silence, process the utterance
        if self.is_speaking and self.silence_frames > 100:  # ~1 sec at 48kHz/480
            await self.process_utterance()
            self.is_speaking = False
            self.audio_buffer = []
```

#### 3.2 Voice Activity Detection (VAD)

Use Silero VAD (lightweight, CPU-friendly):

```python
import torch

class VADProcessor:
    def __init__(self):
        self.model, utils = torch.hub.load(
            repo_or_dir='snakers4/silero-vad',
            model='silero_vad',
            trust_repo=True
        )
        self.get_speech_timestamps = utils[0]
        
    def is_speech(self, audio_chunk: np.ndarray, threshold=0.5) -> bool:
        """Check if audio chunk contains speech."""
        # Convert to float and normalize
        audio_float = audio_chunk.astype(np.float32) / 32768.0
        
        # Silero expects 16kHz, resample if needed
        if len(audio_float) > 0:
            tensor = torch.from_numpy(audio_float)
            speech_prob = self.model(tensor, 16000).item()
            return speech_prob > threshold
        return False
```

#### 3.3 Speech-to-Text (Whisper)

Using local Whisper with large-v3-turbo model:

```python
import subprocess
import tempfile
import json

class WhisperSTT:
    def __init__(self, model="large-v3-turbo"):
        self.model = model
        self.whisper_path = "/home/linuxbrew/.linuxbrew/bin/whisper"
    
    async def transcribe(self, audio_data: np.ndarray, sample_rate: int = 48000) -> str:
        """Transcribe audio using Whisper CLI."""
        # Save audio to temp WAV file
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
            import scipy.io.wavfile as wav
            wav.write(f.name, sample_rate, audio_data)
            temp_path = f.name
        
        try:
            # Run Whisper
            result = subprocess.run([
                self.whisper_path,
                temp_path,
                "--model", self.model,
                "--language", "en",
                "--output_format", "json",
                "--output_dir", "/tmp"
            ], capture_output=True, text=True, timeout=30)
            
            # Parse result
            json_path = temp_path.replace(".wav", ".json")
            with open(json_path) as f:
                data = json.load(f)
                return data.get("text", "").strip()
        finally:
            os.unlink(temp_path)
            
    # Alternative: Use Whisper Python API directly (faster, no subprocess)
    async def transcribe_direct(self, audio_data: np.ndarray) -> str:
        """Transcribe using Whisper Python library."""
        import whisper
        
        # Load model (cached after first load)
        if not hasattr(self, '_model'):
            self._model = whisper.load_model(self.model)
        
        # Whisper expects float32 audio
        audio_float = audio_data.astype(np.float32) / 32768.0
        
        result = self._model.transcribe(
            audio_float,
            language="en",
            fp16=False  # CPU doesn't support fp16
        )
        return result["text"].strip()
```

#### 3.4 AI Response Generation

Using Claude API directly:

```python
import anthropic

class SophieAI:
    def __init__(self, api_key: str):
        self.client = anthropic.Anthropic(api_key=api_key)
        self.conversation_history = []
        self.system_prompt = """You are Sophie, a helpful AI voice assistant. 
You're having a voice conversation with Aaron.
Keep responses concise and conversational - this is spoken, not written.
Respond naturally as you would in a phone call."""
    
    async def get_response(self, user_text: str) -> str:
        """Get AI response to user's speech."""
        self.conversation_history.append({
            "role": "user",
            "content": user_text
        })
        
        response = self.client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=500,  # Keep responses short for voice
            system=self.system_prompt,
            messages=self.conversation_history
        )
        
        assistant_text = response.content[0].text
        self.conversation_history.append({
            "role": "assistant", 
            "content": assistant_text
        })
        
        return assistant_text
```

#### 3.5 Text-to-Speech (Kokoro)

```python
import aiohttp
import io

class KokoroTTS:
    def __init__(self, url="http://localhost:8880/v1", voice="af_heart"):
        self.url = url
        self.voice = voice
        
    async def synthesize(self, text: str) -> bytes:
        """Convert text to speech audio."""
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.url}/audio/speech",
                json={
                    "model": "kokoro",
                    "input": text,
                    "voice": self.voice,
                    "response_format": "pcm"  # Raw PCM for LiveKit
                }
            ) as resp:
                return await resp.read()
    
    def pcm_to_frames(self, pcm_data: bytes, sample_rate=24000) -> list:
        """Convert PCM audio to LiveKit AudioFrames."""
        # Kokoro outputs 24kHz, LiveKit expects 48kHz
        audio = np.frombuffer(pcm_data, dtype=np.int16)
        
        # Resample to 48kHz
        from scipy import signal
        resampled = signal.resample(audio, len(audio) * 2)
        resampled = resampled.astype(np.int16)
        
        # Split into 10ms frames (480 samples at 48kHz)
        frames = []
        for i in range(0, len(resampled), 480):
            chunk = resampled[i:i+480]
            if len(chunk) == 480:
                frame = rtc.AudioFrame(
                    data=chunk.tobytes(),
                    sample_rate=48000,
                    num_channels=1,
                    samples_per_channel=480
                )
                frames.append(frame)
        return frames
```

#### 3.6 Send TTS Audio to LiveKit

```python
async def speak(self, text: str):
    """Convert text to speech and send via LiveKit."""
    logger.info(f"🗣️ Speaking: {text[:50]}...")
    
    # Generate TTS audio
    pcm_audio = await self.tts.synthesize(text)
    frames = self.tts.pcm_to_frames(pcm_audio)
    
    # Send frames to LiveKit
    for frame in frames:
        await self.audio_source.capture_frame(frame)
        await asyncio.sleep(0.01)  # 10ms per frame
    
    logger.info("✅ Finished speaking")
```

### Phase 4: Full Integration

#### 4.1 Main Processing Loop

```python
async def process_utterance(self):
    """Process a complete utterance: STT → AI → TTS."""
    # Combine buffered audio
    full_audio = np.concatenate(self.audio_buffer)
    
    # Transcribe
    logger.info("🎤 Transcribing...")
    text = await self.stt.transcribe(full_audio)
    
    if not text or len(text.strip()) < 2:
        logger.info("(no speech detected)")
        return
    
    logger.info(f"📝 Heard: {text}")
    
    # Get AI response
    logger.info("🧠 Thinking...")
    response = await self.ai.get_response(text)
    logger.info(f"💬 Response: {response[:100]}...")
    
    # Speak response
    await self.speak(response)
```

#### 4.2 Complete Main Class

```python
class SophieVoiceAgent:
    def __init__(self):
        # Core components
        self.matrix_client = None
        self.livekit_room = None
        self.audio_source = None
        
        # Processing pipeline
        self.presence = PresenceManager()
        self.vad = VADProcessor()
        self.stt = WhisperSTT(model="large-v3-turbo")
        self.ai = SophieAI(api_key=os.getenv("ANTHROPIC_API_KEY"))
        self.tts = KokoroTTS()
        
        # State
        self.in_call = False
        self.audio_buffer = []
        self.is_speaking = False
        self.silence_frames = 0
        
    async def run(self):
        """Main entry point."""
        await self.connect_matrix()
        await self.watch_for_aaron()  # Main loop
```

### Phase 5: E2EE Key Exchange (If Needed)

Element X uses MSC4143 for call encryption keys. If audio doesn't work after Phase 4, implement:

```python
async def send_encryption_key_to_participant(self, user_id: str, device_id: str):
    """Send our encryption key to another participant."""
    key, index = self.key_manager.get_own_key()
    
    content = {
        "keys": [{
            "key": base64.b64encode(key).decode(),
            "index": index
        }],
        "device_id": self.device_id,
        "call_id": self.current_call_id,
    }
    
    await self.matrix_client.to_device(
        "org.matrix.msc4143.call.encryption_keys",
        {user_id: {device_id: content}}
    )
```

---

## Contingencies & Error Handling

### C1: Whisper Too Slow on CPU
- **Detection:** Transcription takes > 10 seconds
- **Fallback:** Switch to `base` model (faster, less accurate)
- **Config:** `WHISPER_MODEL` env var, default `large-v3-turbo`

### C2: VAD Misses Speech / False Positives
- **Configurable threshold:** `VAD_THRESHOLD` (default 0.5)
- **Minimum speech duration:** Ignore < 0.5 sec utterances
- **Maximum silence before processing:** 1.5 sec (configurable)

### C3: TTS Fails
- **Retry:** 3 attempts with exponential backoff
- **Fallback:** Log error, continue (don't crash)
- **Health check:** Ping Kokoro on startup

### C4: Claude API Fails
- **Retry:** 3 attempts with backoff
- **Fallback response:** "Sorry, I'm having trouble thinking right now."
- **Rate limiting:** Respect 429 errors

### C5: LiveKit Connection Drops
- **Auto-reconnect:** Up to 5 attempts
- **Backoff:** 1s, 2s, 4s, 8s, 16s
- **Full restart:** If reconnect fails, restart entire agent

### C6: Aaron Speaks While Sophie Speaking (Barge-in)
- **Detection:** VAD detects speech during TTS playback
- **Action:** Stop TTS immediately, listen to Aaron
- **Implementation:** `is_speaking` flag, interrupt queue

### C7: Audio E2EE Issues
- **Detection:** Garbled/silent audio from Aaron
- **Logging:** Log key exchange events for debugging
- **Fallback:** Try without E2EE (if configured)

### C8: Matrix Sync Fails
- **Retry:** With exponential backoff (max 60s)
- **Partial failure:** Continue with cached state
- **Full failure:** Log and retry indefinitely

### C9: Multiple Participants
- **Filter:** Only process audio from Aaron's identity
- **Ignore others:** Log but don't respond

### C10: Empty/Short Transcriptions
- **Minimum length:** Ignore < 3 characters
- **Common noise:** Ignore "um", "uh", single words
- **Configurable:** `MIN_UTTERANCE_LENGTH`

---

## Dependencies

### Python Packages
```bash
# Required (not yet installed)
pip install torch silero-vad scipy anthropic

# Already installed
# - livekit, matrix-nio, aiohttp, numpy
```

### System Dependencies
- Whisper CLI: `/home/linuxbrew/.linuxbrew/bin/whisper` ✅
- Whisper models: `~/.cache/whisper/large-v3-turbo.pt` ✅
- Kokoro TTS: `http://localhost:8880` ✅

### Environment Variables (in .env)
- `ANTHROPIC_API_KEY` ✅
- `LIVEKIT_*` credentials ✅
- `MATRIX_*` credentials ✅
- `KOKORO_*` settings ✅

---

## Implementation Order

1. **Phase 2.1:** Add presence detection for Aaron ⏳
2. **Phase 2.2:** Add auto-join/leave with 5-min timeout ⏳
3. **Phase 3.1:** Add audio capture from LiveKit tracks ⏳
4. **Phase 3.2:** Add VAD (Silero) ⏳
5. **Phase 3.3:** Add Whisper STT integration ⏳
6. **Phase 3.4:** Add Claude AI integration ⏳
7. **Phase 3.5:** Add Kokoro TTS integration ⏳
8. **Phase 3.6:** Wire up audio output to LiveKit ⏳
9. **Phase 4:** Integration testing ⏳
10. **Phase 5:** E2EE key exchange (if audio fails) ⏳

---

## Dependencies to Install

```bash
cd ~/clawd/projects/element-secretary
source .venv/bin/activate

# Core
pip install numpy scipy

# VAD
pip install torch silero-vad

# STT (if using Python API instead of CLI)
pip install openai-whisper

# AI
pip install anthropic

# Already installed
# - livekit
# - matrix-nio
# - aiohttp
```

---

## Testing Commands

```bash
# Run Sophie
cd ~/clawd/projects/element-secretary
source .venv/bin/activate
python matrix_e2ee_voice.py

# Test Whisper STT
whisper /tmp/test_audio.wav --model large-v3-turbo --language en

# Test Kokoro TTS
curl -X POST http://localhost:8880/v1/audio/speech \
  -H "Content-Type: application/json" \
  -d '{"model":"kokoro","input":"Hello Aaron","voice":"af_heart"}' \
  --output /tmp/test.mp3 && play /tmp/test.mp3

# Test Claude API
python -c "
import anthropic
c = anthropic.Anthropic()
r = c.messages.create(model='claude-sonnet-4-20250514', max_tokens=100, messages=[{'role':'user','content':'Say hello'}])
print(r.content[0].text)
"
```

---

## Key Code from Phase 1 (Already Implemented)

### Call Membership Announcement (Element X Format)

```python
async def announce_call_membership(self, room_name: str, call_id: str):
    """Publish Matrix call.member state event so Element X sees us."""
    import time
    
    # Element X state_key format: _@user:server_DEVICE_m.call
    state_key = f"_{MATRIX_USER}_{self.device_id}_m.call"
    
    # Build content matching Element X format
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
                "livekit_alias": MATRIX_ROOM_ID
            }
        ],
        "m.call.intent": "audio",
        "created_ts": int(time.time() * 1000)
    }
    
    response = await self.matrix_client.room_put_state(
        room_id=MATRIX_ROOM_ID,
        event_type="org.matrix.msc3401.call.member",
        state_key=state_key,
        content=content,
    )
```

### Leaving a Call

```python
async def leave_call(self):
    """Remove ourselves from the call."""
    state_key = f"_{MATRIX_USER}_{self.device_id}_m.call"
    await self.matrix_client.room_put_state(
        room_id=MATRIX_ROOM_ID,
        event_type="org.matrix.msc3401.call.member",
        state_key=state_key,
        content={},
    )
```

### Joining LiveKit with E2EE

```python
async def join_livekit_room(self, room_name: str, call_id: str = None):
    key = secrets.token_bytes(32)
    
    e2ee_options = rtc.E2EEOptions(
        key_provider_options=rtc.KeyProviderOptions(
            shared_key=key,
            ratchet_salt=b"LKFrameEncryptionKey",
            ratchet_window_size=16,
        ),
        encryption_type=1,
    )
    
    self.livekit_room = rtc.Room()
    self.audio_source = rtc.AudioSource(48000, 1)
    
    token = api.AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET)
    token.with_identity(f"{MATRIX_USER}:{self.device_id}")
    token.with_name("Sophie")
    token.with_grants(api.VideoGrants(
        room_join=True, room=room_name,
        can_publish=True, can_subscribe=True,
    ))
    
    await self.livekit_room.connect(
        LIVEKIT_URL, token.to_jwt(),
        options=rtc.RoomOptions(encryption=e2ee_options)
    )
    
    track = rtc.LocalAudioTrack.create_audio_track("sophie-voice", self.audio_source)
    await self.livekit_room.local_participant.publish_track(track)
```

---

## Session Log

### 2026-03-02

1. **14:30** - Started debugging why Sophie wasn't visible in Element X calls
2. **14:45** - Discovered Element X uses different state_key format (`_@user_DEVICE_m.call`)
3. **15:00** - Fixed `announce_call_membership()` to match Element X format
4. **16:47** - Sophie appeared in Element X! (screenshot confirmed)
5. **16:49** - Two ghost Sophies appeared (from multiple restarts)
6. **16:50** - Cleaned up duplicate call membership state events
7. **17:00** - Documented comprehensive implementation plan for remaining phases

---

## Related Documentation

- MSC3401 (Matrix calling): https://github.com/matrix-org/matrix-spec-proposals/pull/3401
- MSC4143 (Call encryption keys): https://github.com/matrix-org/matrix-spec-proposals/pull/4143
- LiveKit Python SDK: https://docs.livekit.io/client-sdk-python/
- Silero VAD: https://github.com/snakers4/silero-vad
- Whisper: https://github.com/openai/whisper
- Kokoro TTS API: OpenAI-compatible `/v1/audio/speech`

---

## Contact

Project owner: Aaron Collins (@aaron:matrix3.aaroncollins.info)
