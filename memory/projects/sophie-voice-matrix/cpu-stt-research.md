# CPU STT Research: Best Options for Speed + Accuracy

**Date:** 2026-03-03  
**Hardware Target:** Ryzen 5 3600 (6 cores, 12 threads, no GPU)  
**Priority:** Speed + Accuracy weighted 1:1  
**Current Baseline:**
- Whisper tiny.en: 27x realtime, 92.8% accuracy
- Whisper small.en: 2.1x realtime, ~100% accuracy (Sophie test)

---

## Executive Summary

| Model | RTF (CPU) | WER | Memory | Streaming | Recommended |
|-------|-----------|-----|--------|-----------|-------------|
| **faster-whisper small.en int8** | ~7-8x RT | ~3-4% | ~1.5GB | ✅ via VAD | ⭐ BEST BALANCE |
| **whisper.cpp small int8** | ~6-7x RT | ~3-4% | ~850MB | ✅ via VAD | ⭐ LOW MEMORY |
| **Moonshine Tiny Streaming** | ~15x RT | 12% | ~100MB | ✅ Native | ⭐ SPEED KING |
| **Moonshine Small Streaming** | ~6x RT | 7.8% | ~250MB | ✅ Native | ⭐ GREAT COMPROMISE |
| **Vosk small-en-us** | ~50x+ RT | ~10% | ~300MB | ✅ Native | Fast but lower accuracy |
| distil-whisper small.en | ~6x RT | 12.1% | ~400MB | ✅ | Good option |
| wav2vec2-base | ~3-4x RT | 3.4% | ~400MB | ❌ | Accurate but slow |

**Top Recommendations:**
1. **For best accuracy:** `faster-whisper small.en int8` or `whisper.cpp small`
2. **For fastest speed:** `Moonshine Tiny Streaming` (15x RT, 12% WER)
3. **For best balance:** `Moonshine Small Streaming` (6x RT, 7.8% WER) 
4. **For lowest latency:** `Moonshine` (native streaming with caching)

---

## 1. Whisper Variants (Detailed)

### 1.1 faster-whisper (CTranslate2) ⭐ CURRENT CHOICE

**Source:** https://github.com/SYSTRAN/faster-whisper

**Key Features:**
- 4x faster than openai/whisper for same accuracy
- INT8 quantization support on CPU
- Built-in Silero VAD integration
- Batch processing support

**CPU Benchmarks (Small model, 13 min audio, Intel i7-12700K, 8 threads):**
| Config | Time | Memory |
|--------|------|--------|
| fp32 | 2m37s | 2257MB |
| int8 | 1m42s | 1477MB |
| int8 + batch=8 | 51s | 3608MB |

**Estimated Ryzen 3600 Performance:**
- small.en int8: ~5-8x realtime
- tiny.en int8: ~25-35x realtime
- base.en int8: ~12-18x realtime

**Optimizations:**
```python
# Maximum CPU optimization
model = WhisperModel("small.en", device="cpu", compute_type="int8")
segments, _ = model.transcribe(
    audio,
    beam_size=1,  # Greedy decoding for speed
    vad_filter=True,  # Skip silence
    vad_parameters=dict(min_silence_duration_ms=300)
)
```

**Pros:**
- Best balance of speed/accuracy
- Easy Python integration
- Active development

**Cons:**
- Still requires 30-sec windows
- Not true streaming

---

### 1.2 whisper.cpp ⭐ LOW MEMORY OPTION

**Source:** https://github.com/ggml-org/whisper.cpp

**Key Features:**
- Pure C/C++, no Python dependencies
- AVX/AVX2 optimized for x86
- Multiple quantization levels (Q4, Q5, Q8)
- OpenVINO support for Intel acceleration
- Built-in VAD support
- Zero runtime memory allocations

**Memory Usage:**
| Model | Disk | RAM |
|-------|------|-----|
| tiny | 75MB | ~273MB |
| base | 142MB | ~388MB |
| small | 466MB | ~852MB |
| medium | 1.5GB | ~2.1GB |

**Quantization Options:**
- `q5_0` - Good balance (small: ~150MB, minimal accuracy loss)
- `q8_0` - Near-original accuracy
- `q4_0` - Maximum compression

**Estimated Ryzen 3600 Performance:**
- small.en fp32: ~6x realtime
- small.en q5_0: ~8-10x realtime  
- tiny.en: ~30-40x realtime

**Build for maximum CPU performance:**
```bash
cmake -B build -DGGML_BLAS=1
cmake --build build -j6 --config Release
./build/bin/whisper-cli -m models/ggml-small.en-q5_0.bin -t 6 -f audio.wav
```

**Pros:**
- Lower memory than faster-whisper
- Very portable
- Excellent for embedding

**Cons:**
- Less convenient Python bindings
- Slightly more complex setup

---

### 1.3 distil-whisper

**Source:** https://github.com/huggingface/distil-whisper

**Key Stats:**
- 6x faster than large-v3, 49% smaller, within 1% WER
- distil-small.en: 166M params, 12.1% WER

| Model | Params | Short WER | Long WER |
|-------|--------|-----------|----------|
| distil-large-v3 | 756M | 9.7% | 10.8% |
| distil-medium.en | 394M | 11.1% | 12.4% |
| distil-small.en | 166M | 12.1% | 12.8% |

**Note:** English-only. For multilingual, use Whisper Turbo.

**Pros:**
- Smaller models with decent accuracy
- Same API as Whisper

**Cons:**
- WER higher than base Whisper at same size
- Not as optimized for CPU as faster-whisper

---

## 2. Alternative Engines

### 2.1 Moonshine ⭐ BEST FOR STREAMING

**Source:** https://github.com/moonshine-ai/moonshine

**Revolutionary features:**
- **Flexible input windows** - No 30-sec padding waste
- **Streaming with caching** - Incremental audio, cached encoding
- **Better than Whisper Large V3** at 6% of parameters

**Benchmark (from official docs):**

| Model | WER | Params | MacBook | Linux x86 | RPi 5 |
|-------|-----|--------|---------|-----------|-------|
| Moonshine Medium Streaming | 6.65% | 245M | 107ms | 269ms | 802ms |
| Moonshine Small Streaming | 7.84% | 123M | 73ms | 165ms | 527ms |
| Moonshine Tiny Streaming | 12.00% | 34M | 34ms | 69ms | 237ms |
| Whisper Small | 8.59% | 244M | 1940ms | 3425ms | 10397ms |
| Whisper Tiny | 12.81% | 39M | 277ms | 1141ms | 5863ms |

**Latency vs Whisper (same accuracy tier):**
- Moonshine Tiny vs Whisper Tiny: **16x faster**
- Moonshine Small vs Whisper Small: **21x faster**

**Estimated Ryzen 3600 Performance:**
- Tiny Streaming: ~15x+ realtime
- Small Streaming: ~6x realtime
- Medium Streaming: ~4x realtime

**Installation:**
```bash
pip install moonshine-voice
python -m moonshine_voice.mic_transcriber --language en
```

**Multi-language support:**
- English, Spanish, Mandarin, Japanese, Korean, Vietnamese, Ukrainian, Arabic

**Pros:**
- True streaming with caching (massive latency reduction)
- Cross-platform (iOS, Android, RPi, etc.)
- No 30-sec window limitation
- Better WER than Whisper Large V3

**Cons:**
- Newer, less battle-tested
- Smaller community than Whisper

---

### 2.2 Vosk ⭐ ULTRA FAST, LOWER ACCURACY

**Source:** https://alphacephei.com/vosk/

**Key Features:**
- Extremely lightweight (50MB small model)
- Zero-latency streaming API
- Reconfigurable vocabulary
- 20+ languages

**Models:**
| Model | Size | WER (LibriSpeech) |
|-------|------|-------------------|
| vosk-model-small-en-us-0.15 | 40MB | 9.85% |
| vosk-model-en-us-0.22 | 1.8GB | 5.69% |
| vosk-model-en-us-0.22-lgraph | 128MB | 7.82% |

**Performance:**
- Small model: 50-100x realtime on CPU
- Zero first-word latency
- ~300MB memory

**Use case:** Perfect for command recognition, not great for dictation.

**Pros:**
- Blazing fast
- True streaming
- Very low memory
- Dynamic vocabulary

**Cons:**
- Higher WER than Whisper
- Less natural language handling

---

### 2.3 wav2vec2 (Facebook)

**Source:** https://huggingface.co/facebook/wav2vec2-base-960h

**Key Stats:**
- wav2vec2-base: 95M params
- WER: 3.4% (LibriSpeech clean), 8.6% (other)

**Pros:**
- Very accurate
- Good for alignment/timestamps

**Cons:**
- Not optimized for speed on CPU
- ~3-4x realtime on CPU (slower than Whisper)
- No built-in streaming
- Character-level output (needs post-processing)

**Verdict:** Better for alignment than primary STT.

---

### 2.4 NeMo Parakeet

**Source:** https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2

**Key Stats:**
- 600M parameters
- WER: 6.05% average (HF Open ASR Leaderboard)
- RTFx: 3380 (on GPU with batch=128)

**Performance (HF Leaderboard):**
| Dataset | WER |
|---------|-----|
| LibriSpeech test-clean | 1.69% |
| LibriSpeech test-other | 3.19% |
| Average | 6.05% |

**Pros:**
- State-of-the-art accuracy
- Word-level timestamps
- Automatic punctuation/capitalization

**Cons:**
- Designed for GPU (NVIDIA optimized)
- CPU performance unclear/likely slow
- Large model (600M params)

**Verdict:** Amazing on GPU, probably too slow for CPU-only.

---

### 2.5 Silero STT

**Source:** https://github.com/snakers4/silero-models

**Status:** Repository now focuses on TTS, not STT. The Silero STT models appear to be deprecated in favor of their VAD (which faster-whisper uses).

**Verdict:** Use Silero VAD + another STT engine.

---

### 2.6 SpeechBrain

**Source:** https://speechbrain.github.io/

**Features:**
- Research toolkit with many ASR recipes
- Various model architectures available
- wav2vec2, Whisper, Conformer integrations

**Verdict:** More of a research framework than a production STT engine. Use underlying models directly.

---

## 3. Optimization Strategies

### 3.1 Quantization
| Method | Speed Boost | Accuracy Loss | Best For |
|--------|-------------|---------------|----------|
| INT8 | ~1.5-2x | <1% | faster-whisper |
| Q5_0 | ~1.3-1.5x | <0.5% | whisper.cpp |
| Q4_0 | ~1.5-2x | 1-2% | whisper.cpp (max speed) |

### 3.2 VAD Integration
- **Silero VAD** (used by faster-whisper): Skip silence, ~1.3-2x speedup
- **Moonshine**: Built-in, automatic
- **whisper.cpp**: Has VAD flag

### 3.3 Beam Size Tuning
- `beam_size=1` (greedy): Fastest, ~5-10% accuracy loss
- `beam_size=3`: Good balance
- `beam_size=5`: Best accuracy, slowest

### 3.4 Thread Optimization
For Ryzen 3600 (6 cores):
- Use 6 threads (physical cores)
- Don't use 12 (hyperthreading hurts inference)

### 3.5 Batch Processing
- faster-whisper supports `batch_size` for bulk transcription
- Not helpful for realtime single-stream

---

## 4. Recommendations for Sophie

### Option A: Maximum Speed (Moonshine Tiny)
```
Speed: ~15x realtime
Accuracy: 88% (12% WER)
Latency: <100ms first word
Memory: ~100MB
```
**Best for:** Fast command recognition, acceptable dictation

### Option B: Best Balance (Moonshine Small Streaming) ⭐ RECOMMENDED
```
Speed: ~6x realtime
Accuracy: 92% (7.8% WER)  
Latency: <200ms first word
Memory: ~250MB
Streaming: Native with caching
```
**Best for:** Voice assistant with good accuracy

### Option C: Maximum Accuracy (faster-whisper small.en int8)
```
Speed: ~5-8x realtime
Accuracy: 96-97% (3-4% WER)
Latency: ~500ms first word
Memory: ~1.5GB
```
**Best for:** Dictation where accuracy is critical

### Option D: Low Memory (whisper.cpp small q5_0)
```
Speed: ~8-10x realtime
Accuracy: 96-97% (3-4% WER)
Latency: ~500ms first word
Memory: ~850MB
```
**Best for:** Resource-constrained environments

---

## 5. Implementation Plan

### Phase 1: Test Moonshine
```bash
pip install moonshine-voice
python -m moonshine_voice.mic_transcriber --language en
```
Benchmark against current faster-whisper setup.

### Phase 2: Hybrid Approach
1. **Moonshine Tiny** for initial response (low latency)
2. **faster-whisper small int8** for final transcript (high accuracy)

### Phase 3: Optimize Current Stack
If staying with faster-whisper:
```python
model = WhisperModel("small.en", device="cpu", compute_type="int8")
segments, _ = model.transcribe(
    audio,
    beam_size=1,
    vad_filter=True,
    vad_parameters={"min_silence_duration_ms": 300}
)
```

---

## 6. Sources & Further Reading

- [faster-whisper GitHub](https://github.com/SYSTRAN/faster-whisper)
- [whisper.cpp GitHub](https://github.com/ggml-org/whisper.cpp)
- [Moonshine Voice](https://github.com/moonshine-ai/moonshine)
- [Vosk Models](https://alphacephei.com/vosk/models)
- [distil-whisper](https://github.com/huggingface/distil-whisper)
- [HuggingFace Open ASR Leaderboard](https://huggingface.co/spaces/hf-audio/open_asr_leaderboard)
- [Moonshine Paper](https://arxiv.org/abs/2602.12241)
