# Sophie Voice Matrix - Project Overview

**Status:** Active Development  
**Created:** 2026-03-03  
**Last Updated:** 2026-03-03 14:25 EST

## Summary

Voice communication between Sophie and Aaron via Matrix/LiveKit integration. Self-hosted infrastructure on dev3/matrix3/livekit3.

## Current Phase: TLS-Only Mode

**Decision:** Skip E2EE for now, use transport encryption only (TLS/DTLS-SRTP).

**Security Model:**
- ✅ WSS (WebSocket Secure) - signaling encrypted
- ✅ DTLS-SRTP - media encrypted in transit
- ✅ Self-hosted LiveKit - only Aaron has server access
- ⏸️ SFrame E2EE - deferred until core functionality works

**Result:** Private conversations between Aaron and Sophie. No eavesdropping possible. LiveKit server (which Aaron owns) can see content, but that's fine for our use case.

---

## Infrastructure

| Component | Host | Purpose |
|-----------|------|---------|
| Matrix (Synapse) | matrix3.aaroncollins.info | Chat protocol |
| LiveKit Server | livekit3.aaroncollins.info | Voice/video SFU |
| Sophie Bot | dev3 | Voice bot runtime |

---

## Active Issues

### P0: Pipeline Latency - IN PROGRESS
- ✅ Added timing logs to identify bottlenecks (STT, AI, TTS phases)
- ✅ Pre-load Whisper model at startup (eliminates first-transcription delay)
- ✅ Disabled E2EE setup (was causing connection failures)
- ⏳ Need to test with Aaron to measure actual latency
- Keep existing TTS (Kokoro, af_heart voice)

---

## Reference Documents

| File | Purpose |
|------|---------|
| `scheduler/progress/matrix-e2ee-implementation-plan.md` | Original E2EE plan (deferred) |
| `scheduler/progress/matrix-rtc-voice-plan.md` | Current TLS-only plan |
| `scheduler/progress/livekit-e2ee-research.md` | LiveKit E2EE research |
| `scheduler/progress/element-x-rtc-research.md` | Element X architecture |
| `scheduler/progress/matrix-rtc-spec-research.md` | SFrame/MSC4143 spec |

---

## Code Location

| Component | Path |
|-----------|------|
| Sophie Voice Bot | `/home/ubuntu/clawd/projects/element-secretary/sophie_voice_full.py` |
| Config | `/home/ubuntu/clawd/projects/element-secretary/config.py` |
| Service | `sophie-voice.service` (systemd) |

---

## Log

### 2026-03-03
- [14:25] Created project folder, consolidated references
- [14:23] Decision: Use TLS-only mode (self-hosted = private enough)
- [14:18] Research completed: LiveKit E2EE, Element X architecture, SFrame spec
- [Earlier] Discovered E2EE incompatibility (LiveKit vs SFrame) - deferring
