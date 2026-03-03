# Sophie Voice - Optimization Research Requirements

**Created:** 2026-03-03 17:41 EST  
**Priority:** P0  
**Hardware:** Ryzen 5 3600 (6 cores, 12 threads, NO GPU)

---

## Optimization Goals

**Weight:** Speed (50%) + Accuracy (50%)

### Current Bottlenecks
1. **TTS (Kokoro):** 3x realtime - TOO SLOW
2. **STT (Whisper tiny.en):** Fast but mishears technical terms

### Constraints
- **CPU only** - Ryzen 5 3600 (no GPU acceleration)
- **Keep Claude Sonnet** for AI (latency acceptable)
- **Need streaming output** - start playback while generating
- **Need interruption support** - proper silence detection to stop when user speaks

---

## Research Areas

### 1. TTS Alternatives (CPU-optimized)

**Requirements:**
- Must be faster than 3x realtime on CPU
- Natural sounding voice
- Support streaming output
- Low memory footprint

**Candidates to evaluate:**
- Piper TTS (ONNX, designed for CPU)
- Coqui TTS (various models)
- eSpeak-ng (ultra-fast, robotic)
- XTTS v2 (quality vs speed tradeoff)
- StyleTTS2 (if CPU viable)
- Bark (likely too slow for CPU)
- WhisperSpeech (new, unknown)

**Metrics to collect:**
- Realtime factor (RTF) on Ryzen 5 3600
- Memory usage
- Voice quality (subjective 1-10)
- Streaming support (yes/no)
- Latency to first audio

### 2. STT Models (Accuracy vs Speed)

**Requirements:**
- Better accuracy than tiny.en on technical terms
- Still fast enough for real-time
- Good English recognition

**Candidates to evaluate:**
- Whisper tiny.en (current baseline)
- Whisper base.en
- Whisper small.en
- Whisper distil-small.en
- Whisper distil-medium.en
- faster-whisper variants
- Vosk (alternative engine)
- wav2vec2 (if applicable)

**Metrics to collect:**
- Processing time for 30s audio
- WER (Word Error Rate) on technical terms
- Memory usage
- First-word latency

### 3. Streaming Architecture

**Requirements:**
- Start TTS playback before full generation
- Allow interruption when user speaks
- Proper silence detection during playback

**Research needed:**
- Kokoro streaming API (does it exist?)
- Piper streaming support
- How to detect user speech during playback
- Cancellation/interruption patterns

---

## Hardware Reference

**Ryzen 5 3600:**
- 6 cores / 12 threads
- 3.6 GHz base, 4.2 GHz boost
- 32MB L3 cache
- No integrated GPU
- ~65W TDP

**Expected performance:**
- Good for ONNX inference
- Can run multiple threads for batch processing
- May struggle with large transformer models

---

## Success Criteria

| Component | Target | Current |
|-----------|--------|---------|
| TTS RTF | >10x realtime | 3x |
| TTS first-audio latency | <500ms | ~12s for 100 words |
| STT accuracy (technical terms) | >95% | ~93% |
| STT latency | <2s for 30s audio | 1.3s ✓ |
| Full response latency | <5s | ~10-12s |

---

## Research Tasks (Sub-agents)

1. **TTS Research Agent:** Evaluate CPU TTS options, benchmark on Ryzen 5
2. **STT Research Agent:** Compare Whisper model sizes, test accuracy
3. **Streaming Research Agent:** Investigate streaming + interruption patterns
