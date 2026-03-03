# Sophie Voice Bot Project

## Overview
Voice assistant for Matrix/Element X calls using LiveKit, Whisper STT, Kokoro TTS, and Claude AI.

**Location:** `/home/ubuntu/clawd/projects/element-secretary/`
**Service:** `sophie-voice.service`
**Device ID:** `SOPHIEVOICE01` (MUST remain consistent)

## Architecture
```
Element X Call → Matrix (call.member state) → Sophie detects → Joins LiveKit
                                                              ↓
User speaks → LiveKit audio → Whisper STT → Claude AI → Kokoro TTS → LiveKit audio out
```

## E2EE Architecture (Critical!)

### Two Separate Encryption Layers

1. **Room E2EE (Megolm/Olm)** - Text messages
   - Handled by matrix-nio crypto store
   - Store path: `data/matrix_store/sophie_matrix`
   - Device keys must persist across restarts
   - Aaron must verify Sophie's device for key sharing

2. **MatrixRTC E2EE (SFrame)** - Voice/audio
   - Uses MSC4143 key exchange
   - Keys sent via `m.rtc.encryption_key` to-device messages
   - NOT in call.member state events (Element X standard)

### Critical Persistence Requirements
```python
# MUST use these exact paths for crypto to work:
crypto_store_path = config.data_path / "matrix_store"
store_name = "sophie_matrix"  # Matches existing DB file
device_id = "SOPHIEVOICE01"   # Must be consistent
```

## Known Issues & Solutions

### [FIXED 2026-03-02] Megolm Decryption Errors
- **Symptom:** `Error decrypting megolm event, no session found`
- **Cause:** New Olm keys created every restart
- **Fix:** Use existing crypto store path + consistent device ID

### Device Verification Required
- Aaron must verify Sophie's device in Element X
- Without verification, keys won't be shared
- Path: Element X → Settings → Security → Verify SOPHIEVOICE01

## Key Files
- `sophie_voice_full.py` - Main voice agent
- `data/session.json` - Access token + device ID
- `data/matrix_store/sophie_matrix` - Crypto store (Olm keys)

## References
- MSC4143: MatrixRTC key exchange spec
- MSC3401: Legacy call.member format
- Plan file: `/home/ubuntu/clawd/scheduler/progress/matrix-bridge-mvp-plan.md`
