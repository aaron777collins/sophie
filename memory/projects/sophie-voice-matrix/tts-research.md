# TTS Engine Research for Sophie Voice

**Goal:** Find fastest CPU-optimized TTS with natural speech  
**Hardware:** Ryzen 5 3600 (6 cores, 12 threads, NO GPU)  
**Baseline:** Kokoro TTS at 3x realtime (too slow)  
**Target:** >10x realtime while maintaining intelligibility

---

## Summary Table

| Engine | RTF (CPU) | Quality | Memory | Streaming | Install | Recommendation |
|--------|-----------|---------|--------|-----------|---------|----------------|
| **Piper TTS** | 20-50x | Good | ~100MB | Yes | Easy | ⭐ **TOP PICK** |
| **Silero TTS** | 20-100x | Good | ~70MB | Yes | Easy | ⭐ **TOP PICK** |
| **eSpeak-ng** | 500x+ | Robotic | ~5MB | Yes | Trivial | Fallback only |
| **Coqui VITS** | 3-5x | Very Good | ~500MB | Limited | Medium | Too slow |
| **XTTS v2** | 0.5-2x | Excellent | ~2GB | Yes | Medium | Way too slow |
| **StyleTTS2** | <1x | Excellent | ~2GB | No | Complex | Not CPU-viable |
| **Mimic3** | 10-20x | Good | ~200MB | Yes | Easy | Deprecated (→Piper) |

---

## Detailed Analysis

### 1. Piper TTS ⭐ RECOMMENDED

**Source:** https://github.com/rhasspy/piper (archived, moved to OHF-Voice/piper1-gpl)

**Architecture:** VITS-based, exported to ONNX for CPU inference

**Performance:**
- **RTF:** 20-50x realtime on CPU (depends on voice quality tier)
  - `x_low` quality: ~50x realtime
  - `low` quality: ~30x realtime  
  - `medium` quality: ~20x realtime
  - `high` quality: ~10-15x realtime
- **Latency to first audio:** <100ms for short phrases
- **Memory:** 50-150MB depending on model size

**Voice Quality:**
- Medium quality models sound natural and clear
- Multiple voices per language (30+ languages supported)
- Neural synthesis - not robotic

**Streaming:** 
- Yes! Designed for it - outputs audio chunks as they're generated
- Can pipe directly to audio players

**Installation:**
```bash
pip install piper-tts
# Or download standalone binary
wget https://github.com/rhasspy/piper/releases/download/v1.2.0/piper_amd64.tar.gz
```

**Pros:**
- Designed specifically for CPU/embedded (Raspberry Pi runs it well)
- ONNX runtime = highly optimized
- Streaming support built-in
- Large voice library (HuggingFace: rhasspy/piper-voices)
- Single binary deployment option

**Cons:**
- Project recently moved/archived (but still maintained under OHF-Voice)
- Not as expressive as XTTS

---

### 2. Silero TTS ⭐ RECOMMENDED

**Source:** https://github.com/snakers4/silero-models

**Architecture:** End-to-end neural TTS, PyTorch-based with JIT compilation

**Performance:**
- **RTF:** 20-100x realtime on CPU
  - v5 models: ~20-40x on modern CPU
  - Older v3 models: ~50-100x
- **Latency:** ~50-150ms for typical sentences
- **Memory:** ~70MB per model

**Voice Quality:**
- Natural-sounding, clear speech
- Multiple speakers per language
- v5 is best quality, v3 is fastest
- SSML support for prosody control

**Streaming:**
- Yes - can output audio incrementally
- Native chunk-based generation

**Languages:**
- Excellent Russian support (primary focus)
- v3: English, German, Spanish, French + more
- v5: CIS languages, some European

**Installation:**
```python
pip install silero
# or via torch.hub
import torch
model, _ = torch.hub.load('snakers4/silero-models', 'silero_tts', language='en', speaker='v3_en')
```

**Pros:**
- Extremely fast on CPU
- Small model size
- Simple one-liner usage
- Multi-speaker support
- Well-documented benchmarks

**Cons:**
- English voices not as natural as Russian
- Limited voice variety compared to Piper
- Requires PyTorch

---

### 3. eSpeak-ng

**Source:** https://github.com/espeak-ng/espeak-ng

**Architecture:** Formant synthesis (rule-based, not neural)

**Performance:**
- **RTF:** 500x+ realtime (essentially instant)
- **Latency:** <10ms
- **Memory:** <5MB

**Voice Quality:**
- Robotic/synthetic
- Highly intelligible but not natural
- Good for accessibility, not for pleasant listening

**Streaming:** Yes (immediate output)

**Installation:**
```bash
sudo apt install espeak-ng
```

**Use Case:** 
- Fallback when speed is critical
- Can be used as phonemizer frontend for other TTS

---

### 4. Coqui TTS (VITS models)

**Source:** https://github.com/coqui-ai/TTS

**Architecture:** Various (VITS, Tacotron2, GlowTTS, etc.)

**Performance (VITS on CPU):**
- **RTF:** 3-5x realtime (similar to Kokoro)
- **Latency:** 500ms-2s for sentences
- **Memory:** 300-600MB

**Voice Quality:**
- Very good with VITS
- Multi-speaker, multi-lingual options
- Good prosody

**Streaming:** Limited - full sentence generation typical

**Installation:**
```bash
pip install TTS
```

**Verdict:** Too slow for our needs - similar to Kokoro baseline.

---

### 5. XTTS v2

**Source:** Coqui TTS (tts_models/multilingual/multi-dataset/xtts_v2)

**Architecture:** Large transformer-based, voice cloning capable

**Performance:**
- **RTF:** 0.5-2x realtime on CPU (slower than realtime!)
- **Latency:** 2-10 seconds for first output
- **Memory:** 2-4GB

**Voice Quality:**
- Excellent - near human quality
- Voice cloning from 6 seconds of audio
- Expressive, emotional range

**Streaming:** Yes, but still slow

**Verdict:** Not viable for CPU - needs GPU. Quality is amazing but speed is unacceptable.

---

### 6. StyleTTS2

**Source:** https://github.com/yl4579/StyleTTS2

**Architecture:** Style diffusion + adversarial training with WavLM

**Performance:**
- **RTF:** <1x on CPU (slower than realtime)
- **Memory:** 2GB+
- Training required 4x A100 GPUs

**Voice Quality:**
- Human-level quality (surpasses human recordings on LJSpeech benchmark)
- Best-in-class naturalness

**Streaming:** No - requires full diffusion process

**Installation:** Complex - requires espeak-ng, multiple pretrained models

**Verdict:** Absolutely not CPU-viable. This is a research model for quality, not speed.

---

### 7. Mimic3 (Deprecated)

**Source:** https://github.com/MycroftAI/mimic3

**Status:** ⚠️ No longer maintained - Piper is the successor

**Architecture:** VITS-based, similar to Piper

**Performance:**
- **RTF:** 10-20x realtime on CPU
- **Memory:** ~200MB

**Voice Quality:** Good, comparable to Piper

**Verdict:** Use Piper instead - it's the actively maintained successor.

---

## Recommendations

### Primary Choice: **Piper TTS** (medium quality voices)
- 20x+ realtime factor
- Natural enough for conversation
- Easy deployment (single binary)
- Streaming support
- Active development under OHF-Voice

### Secondary Choice: **Silero TTS v3**
- Can hit 50-100x realtime
- Slightly less natural than Piper for English
- Good if you need multi-language or SSML control

### Hybrid Approach (Advanced)
Consider using **eSpeak-ng** for:
- Real-time responses during generation
- Phoneme extraction for other engines

### What NOT to Use
- **Kokoro** (current baseline) - 3x is too slow
- **XTTS/StyleTTS2** - Not CPU-viable
- **Coqui VITS** - Same speed issues as Kokoro

---

## Next Steps

1. **Benchmark Piper** on the actual Ryzen 5 3600
   ```bash
   echo "Hello, this is a test of the Piper text to speech system." | piper --model en_US-lessac-medium --output_file test.wav
   time piper --model en_US-lessac-medium < test_sentences.txt > /dev/null
   ```

2. **Test Silero** for comparison
   ```python
   import torch
   import time
   model, _ = torch.hub.load('snakers4/silero-models', 'silero_tts', language='en', speaker='v3_en')
   start = time.time()
   audio = model.apply_tts(text="Test sentence here", speaker='en_0')
   print(f"RTF: {len(audio)/24000 / (time.time()-start):.1f}x")
   ```

3. **Evaluate voice naturalness** subjectively
   - Generate same sentences with both
   - Pick the one that sounds best for Sophie's character

4. **Test streaming latency**
   - Measure time-to-first-audio-chunk
   - Ensure <200ms for conversational feel

---

## References

- Piper: https://github.com/rhasspy/piper / https://github.com/OHF-Voice/piper1-gpl
- Silero: https://github.com/snakers4/silero-models
- Coqui: https://github.com/coqui-ai/TTS
- eSpeak-ng: https://github.com/espeak-ng/espeak-ng
- StyleTTS2: https://github.com/yl4579/StyleTTS2
- Piper Voices: https://huggingface.co/rhasspy/piper-voices
