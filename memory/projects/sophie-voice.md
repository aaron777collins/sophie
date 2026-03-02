# Sophie Voice - Element X Integration

**Last Updated:** 2026-03-02 17:28 EST
**Status:** In Progress - Debugging audio pipeline

## Overview

Sophie Voice is the voice assistant integration that allows Sophie to join Element X (Matrix) voice/video calls via LiveKit. Fully self-hosted on dev3.

## Current Status

### ✅ Working
1. **Matrix Integration** - Login, sync, room state monitoring
2. **Presence Detection** - Detects when Aaron joins/leaves calls
3. **Auto-Join** - Sophie automatically joins when Aaron starts a call
4. **Element X Visibility** - Sophie appears in participant list
5. **LiveKit Connection** - Connects and publishes audio track
6. **Call Membership** - Proper state event format for Element X

### ❌ Not Working Yet
1. **Audio Reception** - Unclear if audio is actually being received from Aaron
2. **VAD** - Silero VAD had "audio chunk too short" errors (fixed but untested)
3. **STT** - No transcription happening yet
4. **TTS** - No speech output happening yet
5. **E2EE** - Encryption key exchange not implemented (may affect audio)

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

- **Main script:** `~/clawd/projects/element-secretary/sophie_voice_full.py`
- **Old script:** `~/clawd/projects/element-secretary/matrix_e2ee_voice.py`
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
| Aaron User ID | @aaron:matrix3.aaroncollins.info |
| LiveKit URL | wss://livekit3.aaroncollins.info |
| LiveKit API Key | 8292ca21-ade4-5baf-ad8b-d0126c89cc4b |
| LiveKit API Secret | c6e4453b-09d8-5205-8196-cbe7c9ba7040 |
| Kokoro TTS URL | http://localhost:8880/v1 |
| Kokoro Voice | af_heart |
| Anthropic API Key | sk-ant-oat01-... (in .env) |

---

## Issues Encountered & Fixes

### Issue 1: Sophie Not Visible in Element X ✅ FIXED

**Problem:** Sophie joined LiveKit but didn't appear in Element X participant list.

**Root Cause:** Element X uses a specific format for `org.matrix.msc3401.call.member` state events that differs from the MSC3401 spec examples.

**Element X Format:**
```json
{
  "type": "org.matrix.msc3401.call.member",
  "state_key": "_@user:server_DEVICEID_m.call",  // NOT just @user:server
  "content": {
    "application": "m.call",
    "call_id": "",
    "scope": "m.room",
    "device_id": "DEVICEID",
    "expires": 7200000,
    "focus_active": {
      "type": "livekit",
      "focus_selection": "oldest_membership"
    },
    "foci_preferred": [
      {
        "type": "livekit",
        "livekit_service_url": "https://matrix3.aaroncollins.info/livekit-jwt-service",
        "livekit_alias": "!roomid:server"  // Room ID, NOT LiveKit room name
      }
    ],
    "m.call.intent": "audio",
    "created_ts": 1234567890123
  }
}
```

**Fix Applied:** Updated `announce_call_membership()` to use Element X format.

### Issue 2: VAD "Audio Chunk Too Short" ✅ FIXED

**Problem:** Silero VAD was throwing errors:
```
ValueError: Input audio chunk is too short
```

**Root Cause:** Was passing 10ms audio chunks (160 samples at 16kHz) but Silero VAD requires at least 32ms (512+ samples).

**Fix Applied:** Added VAD buffer to accumulate samples before running VAD:
```python
self.vad_buffer: List[np.ndarray] = []
self.vad_chunk_size = 512  # Silero needs 512+ samples at 16kHz

# Only run VAD when we have enough samples
vad_audio = np.concatenate(self.vad_buffer)
if len(vad_audio) >= self.vad_chunk_size:
    is_speech = self.vad.is_speech(vad_audio, 16000)
    self.vad_buffer = []
```

### Issue 3: Presence Detection Not Working ✅ FIXED

**Problem:** Sophie wasn't detecting when Aaron joined calls.

**Root Cause:** `room_get_state()` returns events with `.source` attribute, not direct dict access.

**Fix Applied:** Convert events to dicts properly:
```python
for event in response.events:
    if hasattr(event, 'source'):
        events.append(event.source)
    elif isinstance(event, dict):
        events.append(event)
```

### Issue 4: Multiple Sophie Ghosts in Calls

**Problem:** Multiple old Sophie sessions appear as participants.

**Root Cause:** Each restart creates a new device ID, and old call.member state events persist.

**Cleanup Command:**
```bash
TOKEN=$(curl -s -X POST 'https://matrix3.aaroncollins.info/_matrix/client/v3/login' \
  -H 'Content-Type: application/json' \
  -d '{"type":"m.login.password","identifier":{"type":"m.id.user","user":"sophie"},"password":"TxAS4jIPit8fslkh1S9v"}' | jq -r '.access_token')

# Get all Sophie state keys and clear them
curl -s "https://matrix3.aaroncollins.info/_matrix/client/v3/rooms/%21iCDid0eGkre_6MbGVNl4lpvjqw90py9XY45ouXXn-nE/state" \
  -H "Authorization: Bearer $TOKEN" | jq -r '.[] | select(.state_key | contains("sophie")) | .state_key' | while read key; do
    encoded=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$key', safe=''))")
    curl -X PUT "https://matrix3.aaroncollins.info/_matrix/client/v3/rooms/%21iCDid0eGkre_6MbGVNl4lpvjqw90py9XY45ouXXn-nE/state/org.matrix.msc3401.call.member/$encoded" \
      -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{}'
done
```

### Issue 5: Audio Not Being Processed ❓ INVESTIGATING

**Problem:** Sophie joins call, says she's processing audio, but no VAD/STT activity.

**Symptoms:**
- `🎧 Processing audio from @aaron...` appears
- No `📊 Audio frames received` (debug logging added)
- No `🎤 Speech started` messages
- No transcription happens

**Possible Causes:**
1. Audio frames not actually being received (async iterator issue?)
2. E2EE encryption preventing audio decoding
3. Audio format mismatch
4. VAD model not loading properly

**Debug Logging Added:**
```python
# Log every 500 frames (~5 seconds)
if frame_count % 500 == 0:
    logger.info(f"📊 Audio frames received: {frame_count}, avg amplitude: {avg_amplitude:.0f}")

# Log when speech starts/stops
if is_speech and not self.is_speaking:
    logger.info(f"🎤 Speech started")
if not is_speech and self.is_speaking:
    logger.info(f"🔇 Silence started")
```

---

## Code Structure

### Main Components

1. **Config** - Dataclass with all settings from .env
2. **VADProcessor** - Silero VAD for speech detection
3. **WhisperSTT** - Local Whisper for transcription
4. **KokoroTTS** - Local Kokoro for speech synthesis
5. **SophieAI** - Claude API for responses
6. **PresenceManager** - Tracks Aaron's call state
7. **AudioProcessor** - Buffers and processes audio frames
8. **SophieVoiceAgent** - Main orchestrator

### Key Methods

```python
class SophieVoiceAgent:
    async def start()                    # Connect to Matrix
    async def get_room_state()           # Get call.member events
    async def join_call(room_name)       # Join LiveKit + announce
    async def leave_call()               # Leave + clear state
    async def _announce_call_membership() # Element X format
    async def _process_audio_track()     # Receive audio frames
    async def _handle_utterance()        # STT → AI → TTS
    async def _speak(text)               # TTS → LiveKit
    async def run()                      # Main loop
```

### Audio Processing Flow

```
LiveKit Audio Frame (48kHz, 10ms)
    ↓
Downsample to 16kHz for VAD
    ↓
Buffer until 512+ samples
    ↓
Silero VAD → is_speech?
    ↓
If speech → buffer frames
If silence after speech → process utterance
    ↓
Concatenate buffered audio
    ↓
Whisper STT → text
    ↓
Claude AI → response
    ↓
Kokoro TTS → audio
    ↓
Resample to 48kHz
    ↓
Send frames to LiveKit
```

---

## Dependencies Installed

```bash
pip install torch silero-vad scipy anthropic
# Also includes: numpy, livekit, matrix-nio, aiohttp
```

## How to Run

```bash
cd ~/clawd/projects/element-secretary
source .venv/bin/activate
python sophie_voice_full.py
```

## Testing Checklist

- [x] Sophie logs into Matrix
- [x] Sophie detects Aaron joining call
- [x] Sophie joins LiveKit room
- [x] Sophie appears in Element X
- [ ] Sophie receives audio frames (needs verification)
- [ ] VAD detects speech
- [ ] Whisper transcribes speech
- [ ] Claude generates response
- [ ] Kokoro synthesizes speech
- [ ] Aaron hears Sophie

---

## Session Log

### 2026-03-02

**14:30** - Started debugging why Sophie wasn't visible in Element X calls

**14:45** - Discovered Element X uses different state_key format:
- Wrong: `@sophie:matrix3.aaroncollins.info`
- Correct: `_@sophie:matrix3.aaroncollins.info_DEVICEID_m.call`

**15:00** - Fixed `announce_call_membership()` to match Element X format

**16:47** - Sophie appeared in Element X! (screenshot confirmed showing 2 Sophies + Aaron)

**16:49** - Cleaned up duplicate Sophie call membership state events

**17:00** - Created comprehensive implementation plan with all components

**17:05** - Installed dependencies: torch, silero-vad, scipy, anthropic

**17:06** - Wrote `sophie_voice_full.py` with full pipeline

**17:15** - First test: Sophie detected Aaron, joined call, but VAD failed with "audio chunk too short"

**17:17** - Fixed VAD buffer to accumulate 512+ samples before running

**17:19** - Second test: VAD errors stopped, but still no transcription

**17:20** - Added debug logging for audio frames and speech detection

**17:21** - Third test: Sophie joins, processes audio, but no debug output about frames received

**17:25** - Aaron left call, Sophie detected it (`👋 Aaron left the call`)

**17:27** - Current state: Audio pipeline not working, need to debug why frames aren't being processed

---

## Next Steps

1. **Debug audio reception** - Verify frames are actually coming through the async iterator
2. **Test VAD in isolation** - Make sure Silero model loads and works
3. **Check E2EE** - May need to implement key exchange for audio to work
4. **Test TTS in isolation** - Verify Kokoro produces valid audio
5. **Add more logging** - Track each step of the pipeline

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
