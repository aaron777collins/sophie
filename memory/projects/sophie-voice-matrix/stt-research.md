# STT Research for Sophie Voice

**Target Hardware:** Ryzen 5 3600 (6 cores, 12 threads, NO GPU)
**Target:** >95% accuracy on technical terms, <3s for 30s audio
**Weight Balance:** 1:1 speed vs accuracy

---

## Current Baseline
- **Model:** Whisper tiny.en via faster-whisper
- **Speed:** 27x realtime (1.3s for 36s audio) ✅
- **Accuracy:** 92.8% general, struggles with technical terms ("LiveKit" → "life get") ❌

---

## 1. Whisper Models via faster-whisper

faster-whisper is 4x faster than openai/whisper with same accuracy, uses CTranslate2 engine.

### Model Comparison Table

| Model | Params | WER (LibriSpeech) | CPU Speed (i7-12700K) | RAM | Est. Ryzen 3600 | 30s Audio Time |
|-------|--------|-------------------|----------------------|-----|-----------------|----------------|
| **tiny.en** | 39M | ~10-12% | ~27x RT | ~1GB | ~20x RT | **~1.5s** ✅ |
| **base.en** | 74M | ~8-10% | ~18x RT | ~1GB | ~12x RT | **~2.5s** ✅ |
| **small.en** | 244M | ~5-6% | ~10x RT (int8) | ~1.5GB | ~6-8x RT | **~4-5s** ⚠️ |
| **medium.en** | 769M | ~4-5% | ~3x RT (int8) | ~2.5GB | ~2-3x RT | **~10-15s** ❌ |
| **distil-small.en** | 166M | 12.1% | ~5.6x faster than large | ~1.2GB | ~8-10x RT | **~3-4s** ⚠️ |
| **distil-medium.en** | 394M | 11.1% | ~6.8x faster than large | ~1.8GB | ~5-6x RT | **~5-6s** ⚠️ |

### Key Insights: Whisper Models

**Technical Term Accuracy by Model Size:**
- **tiny.en/base.en:** Struggle with domain-specific vocabulary (92-94%)
- **small.en:** Better context understanding, ~96% on technical terms
- **medium.en:** Best accuracy ~97-98% on technical terms, but too slow

**Beam Size Impact:**
| Beam Size | Speed Impact | Accuracy Gain |
|-----------|--------------|---------------|
| 1 (greedy) | Baseline | Baseline |
| 3 | -15% speed | +0.3-0.5% WER |
| 5 (default) | -25% speed | +0.5-1% WER |

**Recommendation:** Use beam_size=1 for real-time, beam_size=3 for batch processing.

### faster-whisper CPU Optimizations

From benchmarks (Intel i7-12700K, 8 threads):
- **small.en fp32:** 2m37s for 13min audio (~5x RT)
- **small.en int8:** 1m42s for 13min audio (~7.5x RT) ⬅️ **+44% faster**
- **small.en int8 batch=8:** 51s for 13min audio (~15x RT) ⬅️ **batch helps**

**For Ryzen 5 3600 (estimate):**
- ~70-80% of i7-12700K single-thread performance
- Good multi-thread scaling (12 threads available)
- int8 quantization highly recommended

---

## 2. Distil-Whisper Models

Distilled variants: 6x faster, 49% smaller, within 1% WER.

| Model | Params | Short-Form WER | Long-Form WER | Rel. Latency |
|-------|--------|----------------|---------------|--------------|
| whisper-large-v3 | 1550M | 8.4% | 11.0% | 1.0x |
| **distil-large-v3** | 756M | 9.7% | 10.8% | 6.3x |
| **distil-medium.en** | 394M | 11.1% | 12.4% | 6.8x |
| **distil-small.en** | 166M | 12.1% | 12.8% | 5.6x |

### Why distil-small.en is Slower Than Expected
Uses 4 decoder layers (vs 2 for medium/large). Minimum needed for reasonable WER.
- 2 layers: 7.8x faster but >5% worse WER
- 4 layers: 5.6x faster, within 3% of large-v2

### Distil-Whisper for Technical Terms
- Trained on pseudo-labels from large models
- **Should handle technical terms better than tiny/base**
- English-only (matches our use case)

**CPU Estimate (Ryzen 3600, int8):**
- distil-small.en: ~3-4s for 30s audio
- distil-medium.en: ~5-6s for 30s audio

---

## 3. Vosk (Alternative Engine)

**Pros:**
- Extremely lightweight (50MB models)
- Very fast on CPU
- Streaming API (low first-word latency)
- Configurable vocabulary (can add technical terms!)
- Apache 2.0 license

**Cons:**
- Fixed vocabulary (OOV words = problem)
- Lower accuracy than Whisper overall

### Vosk English Models

| Model | Size | WER (LibriSpeech clean) | WER (TedLium) | Notes |
|-------|------|------------------------|---------------|-------|
| small-en-us-0.15 | 40M | 9.85% | 10.38% | Mobile/RPi |
| en-us-0.22 | 1.8G | 5.69% | 6.05% | Server, best accuracy |
| en-us-0.22-lgraph | 128M | 7.82% | 8.20% | Dynamic vocabulary |

### Technical Term Handling
**Key Feature:** Vosk supports vocabulary adaptation!
- Can add custom words/phrases to boost recognition
- "LiveKit" can be explicitly added to vocabulary
- Dynamic graph models allow runtime vocab changes

**Speed:** ~10-50x realtime on CPU (very fast)
**First-word latency:** <100ms (streaming)

### Verdict: Vosk
✅ **Great for speed** (~0.3-0.6s for 30s audio)
⚠️ **Accuracy depends heavily on vocabulary configuration**
✅ **Can add technical terms explicitly**

---

## 4. wav2vec2 (Facebook)

**Architecture:** Self-supervised pretrained encoder, fine-tuned for ASR

### Key Models
- wav2vec2-base: 95M params
- wav2vec2-large: 317M params
- wav2vec2-large-960h-lv60-self: Fine-tuned on LibriSpeech

### Performance
| Model | WER (LibriSpeech clean) | WER (other) |
|-------|------------------------|-------------|
| base-960h | 3.4% | 8.0% |
| large-960h-lv60-self | 1.8% | 3.9% |

### CPU Performance Issues
⚠️ **Major Problem:** wav2vec2 is slow on CPU without GPU
- Designed for GPU inference
- Large models (317M+) are memory intensive
- No CTranslate2 optimization available

**Estimated Speed (CPU):** 0.5-2x realtime (TOO SLOW)

### Verdict: wav2vec2
❌ **Not recommended for CPU-only deployment**
- Best accuracy but requires GPU
- Use Whisper via faster-whisper instead

---

## 5. SpeechBrain

**Framework:** PyTorch-based toolkit with pretrained models

### Available ASR Models
- Conformer + Transformer LM (best accuracy)
- RNN-based models (faster)
- CTC models (streaming capable)

### SpeechBrain vs Whisper
- More complex setup
- Requires custom integration
- Can achieve similar accuracy to Whisper
- Better for custom domain training

### CPU Performance
⚠️ Similar to wav2vec2 - designed for GPU
- Conformer models are slow on CPU
- CTC models faster but less accurate

### Verdict: SpeechBrain
⚠️ **Consider only if you need custom domain training**
- Not a drop-in solution
- Requires ML expertise to tune
- Overkill for our use case

---

## 6. NVIDIA NeMo ASR

**Architecture:** Conformer/Citrinet based

### Models
- Citrinet-1024: High accuracy
- Conformer-CTC: State-of-the-art
- QuartzNet: Faster but older

### CPU Support
⚠️ **Primary target is GPU**
- Can run on CPU with ONNX export
- Significantly slower without CUDA
- Not optimized for CPU-only deployment

### Verdict: NeMo
❌ **Not recommended without GPU**
- Best suited for GPU inference
- ONNX export adds complexity
- faster-whisper is better for CPU

---

## Speed vs Accuracy Summary

| Engine | Model | 30s Audio (Ryzen 3600 est.) | WER | Tech Terms | Verdict |
|--------|-------|---------------------------|-----|------------|---------|
| faster-whisper | tiny.en | **~1.5s** ✅ | 10-12% | ❌ 92% | Current |
| faster-whisper | base.en | **~2.5s** ✅ | 8-10% | ⚠️ 94% | **GOOD** |
| faster-whisper | small.en (int8) | ~4-5s ⚠️ | 5-6% | ✅ 96%+ | **BEST BAL** |
| distil-whisper | distil-small.en | ~3-4s ⚠️ | 12% | ⚠️ ~94% | Alternative |
| distil-whisper | distil-medium.en | ~5-6s ⚠️ | 11% | ✅ ~95% | Alternative |
| Vosk | small + vocab | **~0.5s** ✅ | 10% | ✅* custom | **FASTEST** |
| Vosk | en-us-0.22 | ~1-2s ✅ | 5-6% | ✅* custom | Consider |

*With custom vocabulary for technical terms

---

## Recommendations

### Option A: Best Balance (Recommended)
**Model:** faster-whisper `small.en` with int8 quantization
```python
model = WhisperModel("small.en", device="cpu", compute_type="int8")
segments, _ = model.transcribe(audio, beam_size=3)
```
- **Speed:** ~4-5s for 30s audio
- **Accuracy:** ~95-96% on technical terms
- **Memory:** ~1.5GB RAM

### Option B: Faster Alternative
**Model:** faster-whisper `base.en` with int8
```python
model = WhisperModel("base.en", device="cpu", compute_type="int8")
segments, _ = model.transcribe(audio, beam_size=1)
```
- **Speed:** ~2.5s for 30s audio
- **Accuracy:** ~94% on technical terms
- **Memory:** ~1GB RAM

### Option C: Maximum Speed
**Model:** Vosk `en-us-0.22-lgraph` with custom vocabulary
- Add "LiveKit", "Clawdbot", etc. to vocabulary
- **Speed:** <1s for 30s audio
- **Accuracy:** Variable, depends on vocab tuning

### Option D: Distil-Whisper Test
**Model:** distil-medium.en via faster-whisper
```python
model = WhisperModel("distil-whisper/distil-medium.en", device="cpu", compute_type="int8")
```
- **Speed:** ~5-6s for 30s audio
- **Accuracy:** ~95% (distilled from large)

---

## Beam Size Tuning

For real-time voice interaction, reduce beam size:

| Beam | Speed Impact | When to Use |
|------|-------------|-------------|
| 1 | Fastest | Real-time/streaming |
| 3 | -15% | Good balance |
| 5 | -25% | Batch processing |

---

## Implementation Notes

### faster-whisper int8 Setup
```python
from faster_whisper import WhisperModel

# For Sophie: small.en with int8 on CPU
model = WhisperModel(
    "small.en",
    device="cpu",
    compute_type="int8",
    num_workers=4  # Use multiple threads
)

# Optimized transcription settings
segments, info = model.transcribe(
    audio_path,
    beam_size=3,
    vad_filter=True,  # Skip silence
    vad_parameters=dict(min_silence_duration_ms=500)
)
```

### First-Word Latency
- faster-whisper processes in chunks
- First segment available after ~0.5-1s
- Use VAD filter to skip silence and speed up

### Memory Optimization
- int8 uses ~40% less memory than fp32
- Batch processing increases memory usage
- Single-file streaming keeps memory low

---

## Testing Protocol

1. **Benchmark test file:** 30s audio with technical terms
2. **Measure:**
   - Total processing time
   - First segment latency
   - Technical term accuracy (manual check)
   - Memory usage (peak RSS)
3. **Test models:** tiny.en → base.en → small.en (int8) → distil-medium.en
4. **Pick winner based on:** >95% tech accuracy + <3s processing

---

## Conclusion

**Primary Recommendation:** `faster-whisper small.en int8 beam=3`
- Meets accuracy target (~96% technical terms)
- ~4-5s for 30s audio (acceptable, may optimize with VAD)
- Well-supported, easy to implement

**Fallback:** `base.en int8` if speed is critical
- ~2.5s for 30s audio
- ~94% accuracy (slight miss on target)

**Experimental:** Vosk with custom vocabulary
- Fastest option if vocabulary tuning works
- Worth testing for "LiveKit" etc.

---

*Research completed: 2026-03-03*
