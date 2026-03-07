# Sophie Voice Matrix - Element X Integration

**Date:** 2026-03-03  
**Status:** ✅ SFrame Decryption Implemented - Ready for Testing

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
    
Aaron speaks → [SFrame E2EE encrypted] → Sophie decrypts & processes → responds
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

## ✅ SOLVED: SFrame E2EE Audio Decryption 

### Implementation (2026-03-03 22:53 EST)

**Added SFrame decryption support per RFC 8723:**

1. **SFrameDecryptor class** - Handles AES-GCM decryption with rotating keys
2. **Key storage by index** - Stores MSC4143 encryption keys by index (saw index=2)
3. **Audio frame decryption** - Attempts decryption before VAD/STT processing
4. **Enhanced logging** - Shows decryption status and audio amplitudes

### ✅ FIXED: SFrame Key Timing Issue (2026-03-04 00:45 EST)

**Problem:** Keys arrived AFTER audio processing started
```
⚠️ No key available for SFrame index 0/2/3  (trying to decrypt)
👋 Aaron left the call
🔑 Added SFrame key for index 2: 16 bytes  (key arrives too late!)
```

**Solution:** Implemented encrypted frame buffering system

#### Changes Made:
1. **Encrypted frame buffering** - AudioProcessor buffers up to 5 seconds of encrypted frames
2. **Key wait timeout** - Wait up to 5 seconds for keys before processing without decryption  
3. **Improved key extraction** - Enhanced call.member state parsing with multiple formats
4. **Proactive key requests** - Request keys immediately when Aaron joins
5. **Key arrival notification** - SFrame decryptor notifies AudioProcessor when keys arrive

#### Technical Details:
- `encrypted_frame_buffer: List[rtc.AudioFrame]` - Stores frames until keys arrive
- `on_keys_available()` - Processes buffered frames when keys become available
- `_extract_keys_from_call_member()` - Robust key parsing (3 formats supported)
- `max_buffer_frames = 150` - 5 second buffer at 10ms per frame

### Previous Issue (SOLVED)
Element X encrypted voice with **SFrame E2EE** → Sophie received zeros
**Solution:** Implemented RFC 8723 SFrame decryption using received MSC4143 keys

### Expected Results (Next Test)
```
👤 Aaron joined the call (device: AQIGNEJUKI)
🔐 Encryption status: 0 SFrame keys available
⏳ BUFFERING frames until keys arrive...
🔑 EXTRACTED Aaron's key from call.member (format 1)
🔓 SFrame decryption is now ENABLED - first key added!
🔓 Keys became available! Processing 45 buffered frames...
✅ Processed 45/45 buffered frames
🎤 FIRST FRAME (DECRYPTED)! avg_amp=8500, max_amp=16000
✅ Audio has content - decryption working!
```

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
- [x] SFrame decryption implemented
- [x] **FIXED:** SFrame key timing issue with frame buffering
- [ ] **NEXT:** Sophie can decrypt Aaron's encrypted audio
- [ ] Keys arrive before/during audio processing (not after)
- [ ] Buffered frames processed when keys arrive
- [ ] Non-zero audio amplitudes after decryption
- [ ] VAD detects actual speech (not silence)
- [ ] STT transcribes Aaron's words correctly
- [ ] Full conversation loop working
- [ ] Response latency < 2 seconds

---

## Next Steps

1. ✅ **~~Fix E2EE audio decryption~~** — ✅ SFrame decryption implemented
2. **Test SFrame decryption** — Verify encrypted audio becomes non-zero amplitudes
3. **Test full conversation** — Verify STT → Claude → TTS pipeline with real audio
4. **Debug/refine SFrame format** — May need adjustments for Element X specifics
5. **Optimize latency** — Target < 2 second response time
6. **Add conversation context** — Multi-turn dialogue support

---

## Related Files

- Main bot: `~/clawd/projects/element-secretary/sophie_voice_full.py`
- Service: `/etc/systemd/system/sophie-voice.service`
- Voice models: `~/clawd/projects/element-secretary/voices/`
- Matrix notes: `~/clawd/memory/topics/matrix-infrastructure.md`
- Voice benchmarks: `~/clawd/memory/projects/sophie-voice-matrix/benchmark-summary-2026-03-03.md`

---

## Debug Session 2026-03-04

### Call Test Results
- Aaron called, Sophie responded with greeting ✅
- Aaron spoke, Sophie heard garbage ("New York hospitals") ❌
- SFrame decryption running but producing invalid audio

### Log Analysis
```
avg_amp=22936, max=32767  ← audio data exists
Transcribed: "hospital in New York..."  ← Whisper hallucination
```

### Root Cause
Our SFrame implementation is a guess, not matching Element's actual format:
- Element uses RFC 9605 (not 8723)
- HKDF key derivation needed
- Different header format

### Fix In Progress
Worker implementing proper RFC 9605 SFrame with:
- Correct header parsing
- HKDF key derivation
- Debug audio file output for verification

---

## Debug Session 2026-03-07

### Issue: Whisper Can't Understand Aaron's Voice

**Symptoms:**
- Sophie joins calls, sends greeting ✅
- Audio frames received with good amplitude (avg=4526, max=32767) ✅
- Whisper transcribes hallucinations: "I'm sorry", "I'm not gonna talk" ❌
- Audio sent to Aaron for verification - confirmed ENCRYPTED

**Root Cause:**
SFrame decryption was disabled on 2026-03-04. The assumption that "LiveKit handles decryption" was WRONG for Element X E2EE calls.

**Evidence:**
- Audio clip analysis: speech-like autocorrelation (0.39) but unintelligible
- Aaron confirmed clip sounded like "definitely encrypted"
- Whisper hallucinating = classic sign of noise/encrypted input

**Fix Applied:**
```python
# In _process_single_frame():
if decrypt and self.sframe_decryptor and self.sframe_decryptor.derived_keys:
    decrypted_data = self.sframe_decryptor.decrypt_frame(raw_data)
    if decrypted_data:
        raw_data = decrypted_data  # Use decrypted data
```

**Status:** Testing fix - need to verify decryption actually works

**Next Steps:**
1. Verify decrypt_frame() is called and succeeds
2. If KID mismatch, check key rotation/index
3. If decryption fails, debug HKDF derivation or SFrame header parsing
