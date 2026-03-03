# Piper vs Kokoro Benchmark Results

**Date:** 2026-03-03 18:00 EST  
**Hardware:** Ryzen 5 3600 (CPU only)

---

## 🏆 Winner: PIPER

| Metric | Kokoro | Piper | Winner |
|--------|--------|-------|--------|
| **First chunk latency** | 3000-7000ms | **41-56ms** | Piper (100x faster) |
| **Realtime factor** | 2.7x | **20-25x** | Piper (10x faster) |
| **Voice quality** | Natural | Good | Kokoro (slightly) |
| **Streaming** | Yes | Yes | Tie |

---

## Detailed Results

### Piper TTS (en_US-lessac-medium)

| Words | First Chunk | Total Time | Audio Duration | RTF |
|-------|-------------|------------|----------------|-----|
| 7 | 56ms | 109ms | 2183ms | 20.0x |
| 19 | 44ms | 345ms | 8649ms | 25.1x |
| 32 | 41ms | 548ms | 13166ms | 24.0x |

### Kokoro TTS (af_heart)

| Words | First Chunk | Total Time | Audio Duration | RTF |
|-------|-------------|------------|----------------|-----|
| 12 | 1625ms | 1626ms | 5208ms | 3.2x |
| 29 | 5405ms | 5407ms | 15140ms | 2.8x |
| 61 | 6687ms | 13408ms | 28156ms | 2.1x |

### espeak-ng (baseline)

| Words | First Chunk | Total Time | RTF |
|-------|-------------|------------|-----|
| 12 | 136ms | 136ms | 34.6x |
| 29 | 28ms | 28ms | 467.7x |
| 61 | 44ms | 44ms | 570.8x |

---

## Impact on Voice Chat Latency

### With Kokoro (current)
```
User speaks (5s) → STT (1s) → AI (3s) → TTS first chunk (5s) → Audio
Total to first audio: ~14s ❌
```

### With Piper (proposed)
```
User speaks (5s) → STT (1s) → AI (3s) → TTS first chunk (50ms) → Audio
Total to first audio: ~9s ✅
```

**Improvement: ~5 seconds faster to first audio!**

---

## Voice Quality Assessment

### Kokoro (af_heart)
- Very natural, expressive
- Good intonation
- Sounds like a real person
- Quality: 9/10

### Piper (lessac-medium)
- Natural-sounding
- Good clarity
- Slightly less expressive than Kokoro
- Quality: 7/10

### espeak-ng
- Robotic
- Clear but unnatural
- Quality: 3/10 (useful for fallback only)

---

## Recommendation

**Switch to Piper TTS** for Sophie voice.

**Reasons:**
1. **50ms first chunk** vs Kokoro's 3-7 seconds
2. **20-25x realtime** vs Kokoro's 2.7x
3. **Good voice quality** (lessac-medium is quite natural)
4. **Streaming support** built-in
5. **Low memory** (~60MB model)

**Trade-off:** Slightly less natural voice than Kokoro, but the latency improvement is massive.

---

## Implementation Notes

### Current Kokoro Setup
```python
async with session.post(
    "http://localhost:8880/v1/audio/speech",
    json={"model": "kokoro", "input": text, "voice": "af_heart", "response_format": "pcm"}
) as response:
    async for chunk in response.content.iter_chunked(960):
        yield chunk
```

### Piper Replacement
```python
from piper import PiperVoice

voice = PiperVoice.load("/path/to/en_US-lessac-medium.onnx")

for chunk in voice.synthesize(text):
    audio_bytes = chunk.audio_int16_bytes
    yield audio_bytes
```

### Piper Model Details
- Model: `en_US-lessac-medium.onnx`
- Size: 63MB
- Sample rate: 22050 Hz
- Format: int16 mono
- Download: https://huggingface.co/rhasspy/piper-voices

---

## Other Piper Voices to Try

| Voice | Quality | Size | Notes |
|-------|---------|------|-------|
| en_US-lessac-medium | Good | 63MB | Current choice |
| en_US-lessac-high | Better | 100MB | Higher quality |
| en_US-amy-medium | Good | 63MB | Female, different style |
| en_GB-alba-medium | Good | 63MB | British accent |

---

## Next Steps

1. ✅ Benchmark complete
2. ⏳ Implement Piper in sophie_voice_full.py
3. ⏳ Test voice quality with Aaron
4. ⏳ Consider trying other Piper voices
