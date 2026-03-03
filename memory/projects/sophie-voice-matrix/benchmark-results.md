# Sophie Voice Pipeline - Benchmark Results

**Date:** 2026-03-03  
**Tested by:** Sophie  
**Infrastructure:** dev3 (self-hosted)

---

## Executive Summary

| Component | Performance | Verdict |
|-----------|-------------|---------|
| **TTS (Kokoro)** | 3x realtime | 🔴 **BOTTLENECK** |
| **STT (Whisper tiny.en)** | ~1.3s for 36s audio | 🟢 Fast |
| **AI (Claude Sonnet)** | 26-34s for 1000 words | 🟡 Acceptable |
| **Single round-trip accuracy** | 92.8% | 🟢 Good |
| **Multi-cycle degradation** | 28% after 2 cycles | 🔴 Bad |

**Bottom Line:** TTS is the primary bottleneck. For a typical 100-word response, expect ~12-13s TTS time alone.

---

## Test 1: Long-Form Pipeline Benchmark

**Test:** 573 words → TTS → AI extend → STT → repeat 3 cycles

### Results

| Cycle | Input Words | TTS Time | AI Time | Output Words |
|-------|-------------|----------|---------|--------------|
| 1 | 573 | 71.2s | 34.4s | 1008 |
| 2 | 573 | 67.6s | 26.7s | 818 |
| 3 | 573 | 65.6s | 31.7s | 921 |

### TTS Performance
- **Speed:** 2.9-3.1x realtime
- **573 words → ~207 seconds of audio**
- **Processing time:** 65-71 seconds

### AI Performance (Claude Sonnet)
- **Time:** 26-34 seconds
- **Output:** 800-1000 words per request
- **Quality:** Good creative continuation

### STT Performance
- Failed in this test due to missing scipy
- Fixed in subsequent tests

---

## Test 2: Integrity Test (Telephone Game)

**Test:** Same ~100 word message through TTS → STT, 10 cycles

### Original Text (94 words)
```
Hello Aaron, this is Sophie speaking. I wanted to tell you about the 
progress we've made today on the voice integration system. We successfully 
configured the Matrix and LiveKit connections, disabled the problematic 
E2EE encryption that was causing connection failures, and set up transport 
layer security instead. The Whisper speech recognition is working well, 
and Kokoro text-to-speech is generating clear audio. We still need to 
optimize the response latency, but the core pipeline is functional. 
Let me know if you'd like me to run any additional tests or make 
further improvements to the system.
```

### Degradation Results

| Cycle | Words | vs Original | vs Previous | TTS | STT |
|-------|-------|-------------|-------------|-----|-----|
| 1 | 96 | 92.8% | 92.8% | 12.7s | 1.2s |
| 2 | 97 | 28.0% | 29.1% | 12.6s | 1.2s |
| 3 | 98 | 28.2% | 92.4% | 12.8s | 1.2s |
| 4 | 98 | 28.2% | 92.5% | 12.6s | 1.3s |
| 5 | 98 | 28.2% | 100.0% | 12.7s | 1.2s |
| 6 | 98 | 28.2% | 100.0% | 12.3s | 1.3s |
| 7 | 98 | 28.2% | 100.0% | 12.8s | 1.3s |
| 8 | 98 | 28.2% | 100.0% | 12.8s | 1.4s |
| 9 | 98 | 28.2% | 100.0% | 13.0s | 1.3s |
| 10 | 98 | 28.2% | 100.0% | 12.4s | 1.3s |

### Averages
- **TTS:** 12.7s for ~36s audio (2.8x realtime)
- **STT:** 1.3s for ~36s audio (27x realtime)
- **Word count drift:** 94 → 98 words (slight expansion)

### Text Degradation Examples
```
Original: "configured the Matrix and LiveKit connections, disabled"
After 10: "configured the matrix and life get connections to sav"
```

**Key errors:**
- "LiveKit" → "life get" (technical term mishearing)
- "disabled" → truncated
- Punctuation/capitalization changes

### Integrity Analysis

1. **First cycle (TTS→STT):** 92.8% similarity - acceptable
2. **Second cycle:** Crashes to 28% - catastrophic loss
3. **Cycles 3-10:** Stabilizes at 28.2% - converged to stable corruption

**Why the crash at cycle 2?**
The first STT introduces small errors. When those errors go through TTS again, Kokoro pronounces them slightly differently, causing Whisper to mishear them differently, creating a cascade.

---

## Component Analysis

### TTS: Kokoro (af_heart voice)

| Metric | Value |
|--------|-------|
| Model | kokoro |
| Voice | af_heart |
| Speed | 2.8-3.1x realtime |
| Quality | Good natural speech |
| Latency | **12-13s for 100 words** |

**Verdict:** 🔴 Major bottleneck. For real-time voice chat, this is too slow.

**Options to improve:**
1. Use streaming TTS (start playback while generating)
2. Switch to faster TTS (Piper, Coqui, etc.)
3. GPU acceleration
4. Shorter responses

### STT: Whisper (tiny.en via faster-whisper)

| Metric | Value |
|--------|-------|
| Model | tiny.en |
| Backend | faster-whisper (CTranslate2) |
| Speed | 27x realtime |
| Accuracy | 92.8% on first pass |
| Latency | **1.3s for 36s audio** |

**Verdict:** 🟢 Fast and acceptable accuracy for conversational use.

**Known issues:**
- Technical terms often misheard ("LiveKit" → "life get")
- Proper nouns may be incorrect
- Punctuation not always accurate

**Upgrade options:**
- `base.en` - slightly better accuracy, still fast
- `small.en` - much better accuracy, slower
- `large-v3-turbo` - best accuracy, slowest

### AI: Claude Sonnet

| Metric | Value |
|--------|-------|
| Model | claude-sonnet-4-20250514 |
| Response time | 26-34s for 1000 words |
| Short response | ~3-5s for 50 words |

**Verdict:** 🟡 Acceptable for voice chat with short responses.

---

## Expected Latency for Voice Chat

**Scenario:** User speaks for 5 seconds, Sophie responds with ~50 words

| Phase | Time |
|-------|------|
| User speaking | 5s |
| STT processing | ~0.5s |
| AI thinking | ~3-5s |
| TTS generating | **~6-7s** |
| Audio playback | ~15s |
| **Total before first audio** | **~10-12s** |

**The ~10-12 second delay** between user finishing speaking and Sophie starting to respond is too long for natural conversation.

---

## Recommendations

### Immediate (No code changes)
1. **Keep responses short** - Under 50 words if possible
2. **Use simple vocabulary** - Avoid technical terms that Whisper might mishear

### Short-term (Code changes)
1. **Streaming TTS** - If Kokoro supports it, start playback immediately
2. **Upgrade Whisper model** - `base.en` is a good balance
3. **Pre-generate common phrases** - Cache greetings, acknowledgments

### Long-term (Infrastructure changes)
1. **GPU TTS** - Would be 10-30x faster
2. **Alternative TTS** - Piper, StyleTTS2, or XTTS are faster
3. **Edge deployment** - Run TTS closer to user
4. **Streaming architecture** - Generate and play simultaneously

---

## Test Scripts

Located in `/home/ubuntu/clawd/projects/element-secretary/`:

| Script | Purpose |
|--------|---------|
| `pipeline_benchmark.py` | Long-form TTS→AI→STT benchmark |
| `integrity_test.py` | TTS→STT telephone game (degradation test) |

---

## Raw Data

### Integrity Test Full Output
```
Cycle 1: "Hello, Aaron. This is Sophie speaking..."
Cycle 10: "Hello, Aaron. This is Sophie speaking. I wanted to tell you 
about the progress we've made today on the Voice Integration System. 
We successfully configured the matrix and life get connections to sav..."
```

### Pipeline Benchmark Audio Stats
- 573 words ≈ 207 seconds of audio
- ~36 seconds per 100 words
- Kokoro generates at ~3x realtime
