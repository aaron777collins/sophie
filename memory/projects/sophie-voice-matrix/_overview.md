# Sophie Voice Matrix - Project Overview

**Status:** Active Development  
**Created:** 2026-03-03  
**Last Updated:** 2026-03-03 17:40 EST

## Summary

Voice communication between Sophie and Aaron via Matrix/LiveKit integration. Self-hosted infrastructure on dev3/matrix3/livekit3.

## Current Phase: TLS-Only Mode

**Decision:** Skip E2EE for now, use transport encryption only (TLS/DTLS-SRTP).

**Security Model:**
- ✅ WSS (WebSocket Secure) - signaling encrypted
- ✅ DTLS-SRTP - media encrypted in transit
- ✅ Self-hosted LiveKit - only Aaron has server access
- ⏸️ SFrame E2EE - deferred (incompatible between LiveKit SDK and Element X)

**Result:** Private conversations between Aaron and Sophie. No eavesdropping possible.

---

## Infrastructure

| Component | Host | Purpose |
|-----------|------|---------|
| Matrix (Synapse) | matrix3.aaroncollins.info | Chat protocol |
| LiveKit Server | livekit3.aaroncollins.info | Voice/video SFU |
| Sophie Bot | dev3 | Voice bot runtime |
| TTS | Kokoro (localhost:8880) | Text-to-speech |
| STT | Whisper tiny.en (CPU) | Speech-to-text |

---

## 🔴 Performance Analysis (Benchmarked 2026-03-03)

**See:** `benchmark-results.md` for full data

### Component Performance

| Component | Speed | Verdict |
|-----------|-------|---------|
| **TTS (Kokoro)** | 3x realtime (~12s for 100 words) | 🔴 BOTTLENECK |
| **STT (Whisper)** | 27x realtime (~1.3s for 36s audio) | 🟢 Fast |
| **AI (Claude)** | 3-5s for short response | 🟡 OK |

### Expected Latency (Real Voice Chat)
```
User speaks (5s) → STT (0.5s) → AI (3-5s) → TTS (6-7s) → Playback
                                            ↑
                                    ~10-12s delay before Sophie speaks
```

### Integrity (TTS→STT Round-Trip)
- **Single cycle:** 92.8% accuracy ✅
- **After 2 cycles:** 28% accuracy ❌ (catastrophic degradation)
- **Technical terms:** Often misheard ("LiveKit" → "life get")

### Recommendations
1. **Keep responses short** (<50 words)
2. **Consider faster TTS** (Piper, GPU Kokoro)
3. **Streaming TTS** if available
4. **Upgrade Whisper to base.en** for better accuracy

---

## Active Issues

### P0: Pipeline Latency - RESEARCH IN PROGRESS

**Completed:**
- ✅ Benchmarked all components
- ✅ Identified TTS as primary bottleneck (3x realtime)
- ✅ STT is fast (27x realtime) but mishears technical terms

**Research Spawned (2026-03-03 17:42):**
- 🔄 `research-tts-options` - Evaluating Piper, Coqui, eSpeak, XTTS, etc.
- 🔄 `research-stt-options` - Comparing Whisper model sizes + alternatives
- 🔄 `research-streaming-interruption` - Streaming TTS + interruption handling

**Requirements:**
- Speed + Accuracy weighted 1:1
- Hardware: Ryzen 5 3600 (CPU only, no GPU)
- Keep Claude Sonnet for AI
- Need streaming AI output (start TTS before full response)
- Need interruption support (stop when user speaks)

**See:** `research-requirements.md` for full specs

---

## Reference Documents

### Research
| File | Purpose |
|------|---------|
| `scheduler/progress/matrix-e2ee-implementation-plan.md` | Original E2EE plan (deferred) |
| `scheduler/progress/matrix-rtc-voice-plan.md` | Current TLS-only plan |
| `scheduler/progress/livekit-e2ee-research.md` | LiveKit E2EE research |
| `scheduler/progress/element-x-rtc-research.md` | Element X architecture |
| `scheduler/progress/matrix-rtc-spec-research.md` | SFrame/MSC4143 spec |

### Benchmarks
| File | Purpose |
|------|---------|
| `memory/projects/sophie-voice-matrix/benchmark-results.md` | Full benchmark data |
| `projects/element-secretary/pipeline_benchmark.py` | Long-form TTS→AI→STT test |
| `projects/element-secretary/integrity_test.py` | TTS→STT telephone game test |

---

## Code Location

| Component | Path |
|-----------|------|
| Sophie Voice Bot | `/home/ubuntu/clawd/projects/element-secretary/sophie_voice_full.py` |
| Config | `/home/ubuntu/clawd/projects/element-secretary/.env` |
| Service | `sophie-voice.service` (systemd) |
| TTS | Kokoro at `localhost:8880` |
| STT | faster-whisper (tiny.en, CPU) |

---

## Log

### 2026-03-03
- [17:40] Completed benchmark testing - TTS is bottleneck (3x realtime)
- [17:35] Integrity test: 92.8% accuracy first cycle, 28% after 2 cycles
- [17:30] Pipeline benchmark: TTS 65-71s, AI 26-34s, STT ~1.3s
- [14:28] Added Whisper pre-loading, timing logs
- [14:25] Created project folder, consolidated references
- [14:23] Decision: Use TLS-only mode (self-hosted = private enough)
- [14:18] Research completed: LiveKit E2EE, Element X architecture, SFrame spec
- [Earlier] Discovered E2EE incompatibility (LiveKit vs SFrame) - deferring
