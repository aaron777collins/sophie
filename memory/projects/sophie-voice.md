# Sophie Voice - Element X Integration

**Last Updated:** 2026-03-02 16:50 EST
**Status:** Partially Working - Sophie appears in calls but can't speak/hear yet

## Overview

Sophie Voice is the voice assistant integration that allows Sophie to join Element X (Matrix) voice/video calls via LiveKit.

## Architecture

```
Element X (iOS/Android)
    ↓
Matrix Synapse (matrix3.aaroncollins.info)
    ↓ call.member state events
Sophie Voice Bot (matrix_e2ee_voice.py)
    ↓
LiveKit Server (livekit3.aaroncollins.info)
    ↓
WebRTC Audio Streams
```

## Key Files

- **Main script:** `~/clawd/projects/element-secretary/matrix_e2ee_voice.py`
- **Environment:** `~/clawd/projects/element-secretary/.env`
- **Python venv:** `~/clawd/projects/element-secretary/.venv/`
- **Matrix store:** `~/clawd/projects/element-secretary/data/matrix_store/`

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

## What Works (as of 2026-03-02)

### ✅ Matrix Integration
- Sophie logs into Matrix successfully
- Joins the configured room
- Can read room state events

### ✅ LiveKit Connection
- Connects to LiveKit server
- Publishes audio track
- Sees other participants joining
- Receives track notifications from other participants

### ✅ Element X Visibility (FIXED TODAY)
- Sophie now appears in Element X call participant list
- Fixed by matching Element X's state event format

## Critical Fix Made Today

**Problem:** Sophie wasn't visible in Element X calls.

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

**Wrong format (what I was using):**
```json
{
  "state_key": "@sophie:matrix3.aaroncollins.info",
  "content": {
    "m.calls": [...]  // Wrong structure entirely
  }
}
```

**Fix applied in:** `announce_call_membership()` and `leave_call()` methods

## What Doesn't Work Yet

### ❌ Speech-to-Text (STT)
- Sophie can't hear/understand Aaron's voice
- Need to integrate Whisper or similar
- Audio comes in via LiveKit track subscription

### ❌ Text-to-Speech (TTS)  
- Sophie only sends silence
- Kokoro TTS is configured but not wired up
- Need to replace `send_silence()` with actual TTS audio

### ❌ AI Brain Integration
- No connection to Clawdbot or Claude for generating responses
- Need to process transcribed speech → AI → TTS response

### ❌ E2EE Key Exchange
- Sophie generates her own encryption key
- But doesn't properly exchange keys with Element X via to-device messages
- This may cause audio encryption/decryption issues
- Logs show: `Error decrypting megolm event, no session found`

### ❌ WebRTC Connection Stability
- Sometimes see: `failed to connect: Connection("wait_pc_connection timed out")`
- May be related to ICE candidates or network config

## How to Run

```bash
cd ~/clawd/projects/element-secretary
source .venv/bin/activate
python matrix_e2ee_voice.py
```

Or to run in background:
```bash
cd ~/clawd/projects/element-secretary
source .venv/bin/activate
nohup python matrix_e2ee_voice.py > sophie-voice.log 2>&1 &
```

## How to Test

1. Start Sophie: `python matrix_e2ee_voice.py`
2. Open Element X on phone
3. Go to "Sophie Room"
4. Start a call
5. Sophie should appear in participant list within a few seconds

## Debugging Commands

```bash
# Check if process is running
ps aux | grep matrix_e2ee_voice

# Check LiveKit rooms
cd ~/clawd/projects/element-secretary && source .venv/bin/activate && python -c "
import asyncio
from livekit import api
async def check():
    lk = api.LiveKitAPI('https://livekit3.aaroncollins.info', '8292ca21-ade4-5baf-ad8b-d0126c89cc4b', 'c6e4453b-09d8-5205-8196-cbe7c9ba7040')
    rooms = await lk.room.list_rooms(api.ListRoomsRequest())
    for r in rooms.rooms:
        print(f'{r.name}: {r.num_participants} participants')
        ps = await lk.room.list_participants(api.ListParticipantsRequest(room=r.name))
        for p in ps.participants:
            print(f'  - {p.identity}')
asyncio.run(check())
"

# Check Matrix call state events
TOKEN=\$(curl -s -X POST 'https://matrix3.aaroncollins.info/_matrix/client/v3/login' -H 'Content-Type: application/json' -d '{"type":"m.login.password","identifier":{"type":"m.id.user","user":"sophie"},"password":"TxAS4jIPit8fslkh1S9v"}' | jq -r '.access_token')
curl -s "https://matrix3.aaroncollins.info/_matrix/client/v3/rooms/%21iCDid0eGkre_6MbGVNl4lpvjqw90py9XY45ouXXn-nE/state" -H "Authorization: Bearer \$TOKEN" | jq '[.[] | select(.type | contains("call"))]'

# Clean up Sophie's call membership (to remove ghost sessions)
# Use empty content {} to clear
```

## Next Steps to Complete Voice

### 1. Add Speech-to-Text
- Subscribe to remote audio tracks in LiveKit
- Buffer audio frames
- Send to Whisper (local or API) for transcription
- Trigger AI response on speech end

### 2. Add AI Response Generation
- Connect to Clawdbot MCP endpoint (http://localhost:8014)
- Or use Claude API directly (key in .env)
- Get text response to transcribed speech

### 3. Add Text-to-Speech
- Send response text to Kokoro TTS (http://localhost:8880/v1)
- Convert TTS audio to LiveKit audio frames
- Replace silence with actual speech

### 4. Fix E2EE (if needed)
- Implement proper to-device key exchange per MSC4143
- Send our encryption key to other participants
- Receive and apply their keys

## Dependencies

```
# In .venv
livekit>=1.1.2
matrix-nio[e2e]>=0.24.0
numpy
python-dotenv
aiohttp
```

## Related Documentation

- MSC3401 (Matrix calling): https://github.com/matrix-org/matrix-spec-proposals/pull/3401
- MSC4143 (Call encryption keys): https://github.com/matrix-org/matrix-spec-proposals/pull/4143
- LiveKit Python SDK: https://docs.livekit.io/client-sdk-python/
- Element X source (for reference): https://github.com/element-hq/element-x-ios

## Session Log (2026-03-02)

1. Started with Sophie not visible in Element X calls
2. Discovered Element X uses different state_key format: `_@user:server_DEVICE_m.call`
3. Discovered Element X uses different content structure (not `m.calls` array)
4. Fixed `announce_call_membership()` to match Element X format
5. Fixed `leave_call()` to use same state_key format
6. Sophie now appears in calls! (confirmed via screenshot)
7. Two Sophies appeared due to multiple restarts with different device IDs
8. Cleaned up duplicate call membership state events
9. Documented everything here

## Contact

Project owner: Aaron Collins (@aaron:matrix3.aaroncollins.info)
