# Streaming Benchmark Results

**Date:** 2026-03-03 17:55 EST  
**Hardware:** Ryzen 5 3600 (CPU only)

---

## Executive Summary

| Metric | Non-Streaming | Streaming | Improvement |
|--------|---------------|-----------|-------------|
| **First audio (89 words)** | 14.2s | 7.7s | **6.5s faster** |
| **First audio (41 words)** | 6.2s | 3.5s | **2.7s faster** |
| **First audio (14 words)** | 2.0s | 2.1s | ~same |
| **Can keep up?** | N/A | ✅ YES | 3.3x realtime |
| **STT (small.en)** | 1.3s (tiny) | 2.9s | Slower but accurate |

**Bottom line:** Streaming helps for longer responses, but first-chunk latency is still ~3.3s. TTS can keep up with playback (no cutting out).

---

## TTS Streaming Results

### Keep-Up Test (43 words)

| Run | First Chunk | RTF | Can Keep Up |
|-----|-------------|-----|-------------|
| 1 | 3160ms | 3.3x | ✅ |
| 2 | 3334ms | 3.4x | ✅ |
| 3 | 3205ms | 3.3x | ✅ |
| 4 | 3347ms | 3.2x | ✅ |
| 5 | 3435ms | 3.1x | ✅ |
| **Avg** | **3296ms** | **3.3x** | ✅ |

**Verdict:** Kokoro generates at 3.3x realtime. This means we generate audio faster than we can play it, so **no cutting out**.

### Comparison: Streaming vs Non-Streaming

| Response Length | Non-Streaming First Audio | Streaming First Audio | Improvement |
|-----------------|---------------------------|----------------------|-------------|
| 14 words | 2054ms | 2103ms | -49ms (same) |
| 41 words | 6206ms | 3517ms | **+2689ms** |
| 89 words | 14201ms | 7715ms | **+6486ms** |

**Key insight:** Streaming shines for longer responses. For 89 words, we start speaking **6.5 seconds earlier**.

---

## STT Results (small.en)

Testing Whisper small.en with optimizations:
- `compute_type="int8"` 
- `beam_size=3`
- `vad_filter=True`

| Run | Processing Time | Realtime Factor | Accuracy |
|-----|-----------------|-----------------|----------|
| 1 (cold) | 8914ms | 0.7x | ✅ Perfect |
| 2 | 3198ms | 1.9x | ✅ Perfect |
| 3 | 2921ms | 2.1x | ✅ Perfect |

**Test text:** "Hello, Aaron. This is Sophie speaking with the optimized pipeline."  
**Transcription:** "Hello, Aaron. This is Sophie speaking with the optimized pipeline."  
**Accuracy:** 100% ✅

**Comparison to tiny.en:**
- tiny.en: 1.3s (27x realtime) but 92.8% accuracy
- small.en: 2.9s (2.1x realtime) but ~100% accuracy on this test

---

## Architecture Notes

### Why is first chunk still 3.3s?

Kokoro needs to process the input text before streaming. This includes:
1. Text normalization
2. Phoneme conversion
3. Initial model forward pass

The ~3s first-chunk latency is inherent to Kokoro's architecture on CPU.

### Can we go faster?

**Options:**
1. **Piper TTS** - Claims 20-50x realtime, lower first-chunk latency
2. **Sentence chunking** - Send shorter chunks to TTS (faster first token)
3. **Speculative pre-generation** - Start TTS before AI finishes

### Sentence Chunking Strategy

Instead of sending full response:
```
"Hello Aaron! I've finished the research. Here are the results."
```

Send sentence by sentence:
```
Sentence 1: "Hello Aaron!" → TTS → Play
Sentence 2: "I've finished the research." → TTS → Play (while #1 plays)
Sentence 3: "Here are the results." → TTS → Play
```

This could reduce perceived latency to ~1s (first sentence is short).

---

## Recommendations

### Immediate (code changes only)
1. ✅ Enable streaming PCM output (done in benchmark)
2. ⏳ Upgrade STT to small.en with optimizations
3. ⏳ Implement sentence-level chunking for TTS

### Short-term
1. Test Piper TTS for lower first-chunk latency
2. Implement streaming AI → sentence buffer → streaming TTS pipeline

### Metrics to Track

| Metric | Target | Current (Streaming) |
|--------|--------|---------------------|
| First audio (short) | <1s | 2.1s |
| First audio (medium) | <2s | 3.5s |
| First audio (long) | <4s | 7.7s |
| STT accuracy | >95% | ~100% ✅ |
| TTS keep-up | >1.2x | 3.3x ✅ |

---

## Raw Data

### Test Texts

**Short (14 words):**
```
Hello Aaron! I've finished analyzing the voice pipeline. The main bottleneck is TTS latency.
```

**Medium (41 words):**
```
Hello Aaron! I've finished analyzing the voice pipeline and identified several 
optimization opportunities. The main bottleneck is TTS latency at three times 
realtime. By switching to streaming output, we can reduce first-audio latency 
from twelve seconds to under five hundred milliseconds.
```

**Long (89 words):**
```
Hello Aaron! I've completed a comprehensive analysis of the Sophie voice pipeline. 
The main bottleneck is TTS generation at three times realtime speed. By implementing 
streaming output with the PCM format, we can dramatically reduce first-audio latency 
from twelve seconds to approximately three hundred milliseconds. Additionally, upgrading 
the speech recognition from tiny to small model will improve accuracy from ninety-two 
percent to ninety-six percent on technical terms, while only adding a couple seconds 
of processing time. The streaming architecture uses a producer-consumer pattern with 
cancellation support for handling interruptions.
```
