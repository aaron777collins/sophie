# Qwen3-TTS Research & TTS Alternatives for Sophie Voice

**Date:** 2026-03-03  
**Goal:** Compare Qwen3-TTS to Kokoro TTS for Sophie voice assistant  
**Hardware:** Ryzen 5 3600 (6 cores, 12 threads, NO GPU)  
**Current baseline:** Kokoro at 3x realtime, ~3.3s first chunk latency

---

## ⚠️ Key Finding: "Qwen3-TTS" Does Not Exist

After extensive research, **there is no "Qwen3-TTS" model from Alibaba**. Here's what exists:

| Model | Type | Purpose |
|-------|------|---------|
| **Qwen2-Audio** | Audio LLM | Audio *understanding* (speech-to-text, audio analysis) - NOT TTS |
| **CosyVoice 3.0** | TTS | Alibaba's actual TTS offering (via FunAudioLLM) |
| **Qwen2.5** | Text LLM | General language model, no audio generation |

**The model you may have heard about is CosyVoice 3.0**, which is Alibaba's state-of-the-art TTS system.

---

## 1. CosyVoice 3.0 (Alibaba's Actual TTS)

**Source:** https://github.com/FunAudioLLM/CosyVoice

### Overview
- **Latest version:** Fun-CosyVoice3-0.5B-2512 (May 2025)
- **Model size:** 0.5B parameters
- **Architecture:** LLM-based TTS with flow matching

### Languages Supported
- **9 common languages:** Chinese, English, Japanese, Korean, German, Spanish, French, Italian, Russian
- **18+ Chinese dialects/accents**
- Zero-shot voice cloning supported

### Quality Metrics (from paper)
| Model | CER (zh) | WER (en) | Speaker Similarity |
|-------|----------|----------|-------------------|
| Human | 1.26% | 2.14% | 75.5% |
| CosyVoice 2.0 | 1.45% | 2.57% | 75.7% |
| **CosyVoice 3.0** | 1.21% | 2.24% | 78.0% |
| CosyVoice 3.0 + RL | **0.81%** | **1.68%** | 77.4% |

### Features
- ✅ Streaming support (bi-directional: text-in streaming + audio-out streaming)
- ✅ Latency as low as 150ms (with streaming)
- ✅ Instruct support (emotions, speed, volume)
- ✅ Zero-shot voice cloning
- ✅ Pronunciation inpainting (Chinese Pinyin, English CMU phonemes)

### CPU Performance: ❌ NOT VIABLE

**Critical issue:** CosyVoice is designed for GPU inference.

```
# From their docs - requires NVIDIA GPU
docker run --runtime=nvidia ...
pip install vllm  # Requires CUDA
```

- **No CPU inference benchmarks provided**
- **0.5B parameters is large** for CPU inference
- Uses vLLM/TensorRT-LLM for acceleration (both GPU-only)
- Even with optimizations, LLM-based TTS is inherently slow on CPU

### Estimated CPU Performance
Based on similar-sized LLM-based TTS models:
- **RTF (realtime factor):** ~0.1-0.5x (slower than realtime)
- **First token latency:** 5-30+ seconds
- **Memory:** 2-4GB

**Verdict:** 🔴 **Not usable on CPU** - designed for GPU inference only.

---

## 2. Kokoro TTS (Current Baseline)

**Source:** https://github.com/hexgrad/kokoro  
**Model:** hexgrad/Kokoro-82M

### Overview
- **Parameters:** 82M (very lightweight!)
- **Architecture:** StyleTTS 2 + ISTFTNet
- **License:** Apache 2.0

### Our Current Performance
- **RTF:** 3x realtime
- **First chunk latency:** ~3.3s (for ~10s audio)
- **Memory:** ~200MB
- **Voice:** af_heart (natural, good quality)

### Languages
- 🇺🇸 American English, 🇬🇧 British English
- 🇪🇸 Spanish, 🇫🇷 French, 🇮🇳 Hindi, 🇮🇹 Italian
- 🇯🇵 Japanese, 🇧🇷 Portuguese, 🇨🇳 Chinese

### Quality
- Ranked well in TTS Arena
- Natural prosody, good expressiveness
- 54 voices available in v1.0

### Why It's "Slow"
- StyleTTS 2 architecture uses diffusion for style
- 82M params is small but not tiny
- PyTorch inference (not ONNX-optimized like Piper)

---

## 3. F5-TTS

**Source:** https://github.com/SWivid/F5-TTS

### Overview
- **Architecture:** Diffusion Transformer with ConvNeXt V2
- **Model size:** ~0.3B parameters
- **License:** MIT code, CC-BY-NC models (commercial restriction!)

### Performance (GPU)
| Config | RTF | Latency |
|--------|-----|---------|
| TensorRT-LLM (L20 GPU) | 0.04x | 253ms |
| Offline PyTorch (L20 GPU) | 0.15x | - |

### CPU Performance: ❌ NOT VIABLE
- Diffusion-based = many iterative steps
- No CPU benchmarks available
- Estimated: <1x realtime (slower than realtime)

**Verdict:** 🔴 **Not suitable for CPU**

---

## 4. Fish Speech / FishAudio-S1

**Source:** https://github.com/fishaudio/fish-speech

### Overview
- **Latest:** FishAudio-S1-mini (0.5B params)
- **Architecture:** LLM-based with RLHF
- **Ranking:** #1 on TTS-Arena2

### Performance
- **RTF:** 1:7 on RTX 4090 (7x realtime with GPU)
- **Quality:** Best-in-class, emotion control

### Features
- 35+ emotion markers (angry, sad, excited, etc.)
- Multilingual (13+ languages)
- Zero-shot voice cloning

### CPU Performance: ❌ NOT VIABLE
- 0.5B parameters
- LLM architecture requires GPU
- No CPU inference option

**Verdict:** 🔴 **Not suitable for CPU**

---

## 5. MeloTTS

**Source:** https://github.com/myshell-ai/MeloTTS

### Overview
- **Architecture:** VITS-based (similar to Kokoro's foundation)
- **License:** MIT
- **Languages:** English, Spanish, French, Chinese, Japanese, Korean

### Performance Estimate
- Similar to Coqui VITS: 3-5x realtime on CPU
- Lightweight compared to LLM-based models

**Verdict:** 🟡 **Comparable to Kokoro** - not faster

---

## 6. Piper TTS ⭐ FASTEST CPU OPTION

**Source:** https://github.com/rhasspy/piper (archived → OHF-Voice/piper1-gpl)

### Overview
- **Architecture:** VITS exported to ONNX
- **Model sizes:** 15-65MB depending on quality tier
- **License:** MIT

### Performance
| Quality Tier | RTF | Model Size |
|--------------|-----|------------|
| x_low | ~50x | ~15MB |
| low | ~30x | ~25MB |
| medium | ~20x | ~40MB |
| high | ~10-15x | ~65MB |

### Key Advantage: ONNX Runtime
- Highly optimized CPU inference
- Single binary deployment
- Designed for Raspberry Pi (runs there!)

### Voice Quality
- Natural-sounding (neural VITS)
- 30+ languages
- Multiple voices per language
- Less expressive than Kokoro/StyleTTS2

**Verdict:** 🟢 **Best CPU option** - 7-15x faster than Kokoro

---

## 7. Silero TTS

**Source:** https://github.com/snakers4/silero-models

### Overview
- **Architecture:** End-to-end neural, JIT-compiled PyTorch
- **Model size:** ~70MB
- **License:** CC BY-NC-SA 4.0 (non-commercial)

### Performance
- **v3 models:** 50-100x realtime on CPU
- **v5 models:** 20-40x realtime on CPU
- **Memory:** ~70MB

### Languages
- Excellent: Russian
- Good: English, German, Spanish, French

### Quality
- Natural for Russian
- English is acceptable but not as good as Kokoro

**Verdict:** 🟢 **Fast, but English quality concerns**

---

## Comparison Summary

| Model | RTF (CPU) | Latency | Quality | Streaming | License | Verdict |
|-------|-----------|---------|---------|-----------|---------|---------|
| **Kokoro** | 3x | ~3.3s | ⭐⭐⭐⭐ | Yes | Apache | Current baseline |
| **Piper** | 20-50x | <100ms | ⭐⭐⭐ | Yes | MIT | 🟢 **Best for speed** |
| **Silero** | 50-100x | <50ms | ⭐⭐½ | Yes | NC | 🟢 Fast but NC license |
| **MeloTTS** | 3-5x | ~1s | ⭐⭐⭐ | Limited | MIT | ≈ Kokoro |
| **CosyVoice 3** | <0.5x | 5-30s | ⭐⭐⭐⭐⭐ | Yes | Apache | 🔴 GPU only |
| **F5-TTS** | <0.5x | 5-30s | ⭐⭐⭐⭐⭐ | No | NC | 🔴 GPU only |
| **Fish S1** | <0.5x | 5-30s | ⭐⭐⭐⭐⭐ | Yes | NC | 🔴 GPU only |

---

## Recommendations for Sophie Voice

### Option A: Stay with Kokoro (Current)
**If voice quality is paramount:**
- 3x realtime is slow but workable
- Keep responses short (~50 words max)
- Consider streaming optimization

### Option B: Switch to Piper ⭐ RECOMMENDED
**If speed is critical:**
- 7-15x faster than Kokoro (10-50x realtime)
- Use `medium` or `high` quality voices
- First-audio latency <100ms vs 3.3s
- Trade: slightly less expressive voice

### Option C: Hybrid Approach
**Best of both worlds:**
1. Use Piper for immediate feedback ("Got it", "One moment")
2. Use Kokoro for longer, more expressive responses
3. Pre-cache common phrases with Kokoro

### Option D: GPU Upgrade
**If budget allows:**
- Even a GTX 1660 would enable CosyVoice/Fish Speech
- Would get ~10x realtime on LLM-based TTS
- Best quality + reasonable speed

---

## Why Piper is the Answer

Given the constraints (CPU-only, Ryzen 5 3600):

1. **Speed:** 20x realtime vs Kokoro's 3x = **6.7x faster**
2. **Latency:** <100ms vs 3.3s = **33x faster to first audio**
3. **Memory:** 40MB vs 200MB = lighter footprint
4. **Deployment:** Single binary, no Python deps needed

### Voice Recommendation for Piper
- `en_US-lessac-medium` - Clear, natural American English
- `en_GB-cori-medium` - British English option
- `en_US-amy-medium` - Female voice alternative

### Quick Test
```bash
# Install
pip install piper-tts

# Test
echo "Hello, this is Sophie. How can I help you today?" | \
  piper --model en_US-lessac-medium --output_file test.wav

# Benchmark
time echo "Testing the performance of Piper text to speech." | \
  piper --model en_US-lessac-medium --output_file /dev/null
```

---

## Conclusion

**"Qwen3-TTS" does not exist.** Alibaba's TTS is CosyVoice, which requires GPU.

For CPU-only deployment:
- **Best quality:** Kokoro (current) at 3x realtime
- **Best speed:** Piper at 20-50x realtime
- **Best balance:** Piper `medium` quality at 20x realtime

**Recommended action:** Benchmark Piper on the Ryzen 5 3600 and compare voice quality subjectively. If acceptable, switch to Piper for a 6-15x speed improvement.

---

## References

- CosyVoice: https://github.com/FunAudioLLM/CosyVoice
- Kokoro: https://github.com/hexgrad/kokoro
- Piper: https://github.com/rhasspy/piper
- F5-TTS: https://github.com/SWivid/F5-TTS
- Fish Speech: https://github.com/fishaudio/fish-speech
- Silero: https://github.com/snakers4/silero-models
- MeloTTS: https://github.com/myshell-ai/MeloTTS
- Qwen2-Audio (not TTS): https://github.com/QwenLM/Qwen2-Audio
