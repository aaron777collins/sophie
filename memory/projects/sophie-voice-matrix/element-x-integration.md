# Sophie Voice Matrix - Element X Integration

**Date:** 2026-03-03
**Status:** In Progress - E2EE Audio Issue

---

## Architecture

```
Element X (Aaron's phone)
    ↓ voice call (MatrixRTC)
Matrix Server (matrix3.aaroncollins.info)
    ↓ call.member state events
Sophie Voice Bot (sophie-voice.service)
    ↓ joins via LiveKit
LiveKit Server (livekit3.aaroncollins.info)
    ↓ audio streams
    
Aaron speaks → [SFrame E2EE encrypted] → Sophie receives encrypted zeros
Sophie speaks → [unencrypted] → Aaron hears response
```

---

## Infrastructure (WORKING)

| Component | URL/Location | Status |
|-----------|--------------|--------|
| **Matrix Server** | `matrix3.aaroncollins.info` | ✅ Running |
| **LiveKit Server** | `livekit3.aaroncollins.info` | ✅ Running |
| **Sophie Account** | `@sophie:matrix3.aaroncollins.info` | ✅ Logged in |
| **Sophie Service** | `sophie-voice.service` | ✅ Active |
| **Project Location** | `~/clawd/projects/element-secretary/` | ✅ |

---

## Voice Stack (Updated 2026-03-03)

| Component | Engine | Performance | Status |
|-----------|--------|-------------|--------|
| **TTS** | Piper (Amy voice) | 19-24x realtime | ✅ Working |
| **STT** | faster-whisper (small/int8) | 8x realtime | ✅ Installed |
| **AI** | Claude/Sonnet | via claude-code CLI | ✅ |

### TTS Migration (2026-03-03 19:20 EST)
- **Old:** Kokoro TTS (slow to load, complex setup)
- **New:** Piper TTS with Amy voice (instant, 19x realtime)
- Voice files: `~/clawd/projects/element-secretary/voices/en_US-amy-medium.onnx`

---

## Current Issue: E2EE Audio Encryption

### Symptoms
- Sophie joins call ✅
- Sophie sends greeting (Aaron can hear) ✅
- Aaron speaks → Sophie receives encrypted zeros ❌
- VAD detects "speech" but frames are mostly zeros
- Utterances discarded as "too short"

### Log Evidence
```
📊 Audio frames: 6000 received, 2266 zero-frames, avg_amp=1, max=4
📝 Received Aaron's E2EE key (stored for reference, not using E2EE)
🔑 Found dict format: index=2, Size: 16 bytes
Utterance too short (27 frames), discarding
```

### Root Cause
Element X encrypts voice with **SFrame E2EE** (MSC4143 MatrixRTC encryption). Sophie:
1. Receives Aaron's encryption keys via to-device messages ✅
2. Does NOT decrypt the SFrame-encrypted audio frames ❌

### Potential Solutions
1. **Create unencrypted room** — Test if Element X will send unencrypted audio
2. **Implement SFrame decryption** — Use received keys to decrypt audio
3. **LiveKit unencrypted mode** — Check if there's an option to disable E2EE

### Related Specs
- MSC4143: MatrixRTC key exchange
- MSC3401: Native group calls
- RFC 8723: SFrame encryption

---

## Session Data

```json
{
  "access_token": "syt_c29waGll_...",
  "device_id": "SOPHIEVOICE01",
  "user_id": "@sophie:matrix3.aaroncollins.info"
}
```

**Crypto Store:** `data/matrix_store/sophie_matrix`

---

## Service Management

```bash
# Check status
systemctl status sophie-voice.service

# View logs
journalctl -u sophie-voice.service -f

# Restart
sudo systemctl restart sophie-voice.service

# Log file
tail -f ~/clawd/projects/element-secretary/sophie_voice.log
```

---

## Test Checklist

- [x] Sophie joins call when Aaron joins
- [x] Sophie sends greeting audio
- [x] Piper TTS working (19x realtime)
- [ ] Sophie can hear Aaron (blocked by E2EE)
- [ ] Full conversation loop working
- [ ] Response latency < 2 seconds

---

## Next Steps

1. **Fix E2EE audio decryption** — Either disable or implement SFrame
2. **Test full conversation** — Verify STT → Claude → TTS pipeline
3. **Optimize latency** — Target < 2 second response time
4. **Add conversation context** — Multi-turn dialogue support

---

## Related Files

- Main bot: `~/clawd/projects/element-secretary/sophie_voice_full.py`
- Service: `/etc/systemd/system/sophie-voice.service`
- Voice models: `~/clawd/projects/element-secretary/voices/`
- Matrix notes: `~/clawd/memory/topics/matrix-infrastructure.md`
- Voice benchmarks: `~/clawd/memory/projects/sophie-voice-matrix/benchmark-summary-2026-03-03.md`
