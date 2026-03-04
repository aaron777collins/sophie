# Sophie Voice Matrix - Setup Complete ✅
**Date:** 2026-03-03
**Status:** Production Ready

---

## Voice Stack

| Component | Engine | Model | Speed | Memory |
|-----------|--------|-------|-------|--------|
| **TTS** | Piper | en_US-amy-medium | 24x RT | ~60MB |
| **STT** | faster-whisper | small/int8 | 1.4x RT | ~130MB |

**Combined latency:** ~4 seconds for 5 seconds of speech

---

## Installation Location

```
~/sophie-voice-env/
├── bin/               # Python 3.12 venv
├── voices/
│   ├── en_US-amy-medium.onnx        # Sophie's voice (63MB)
│   ├── en_US-amy-medium.onnx.json
│   ├── en_US-libritts_r-medium.onnx # Backup multi-speaker (78MB)
│   └── en_US-libritts_r-medium.onnx.json
├── sophie_voice.py    # Main pipeline script
└── activate_sophie.sh # Convenience activation
```

---

## Quick Start

```bash
# Activate environment
source ~/sophie-voice-env/activate_sophie.sh

# Text-to-Speech
sophie-tts "Hello world" output.wav

# Speech-to-Text
sophie-stt input.wav

# Full pipeline test
sophie-test

# Or use Python directly
python ~/sophie-voice-env/sophie_voice.py tts "Text" out.wav
python ~/sophie-voice-env/sophie_voice.py stt audio.wav
python ~/sophie-voice-env/sophie_voice.py loop "Round trip test"
```

---

## API Usage

```python
import sys
sys.path.insert(0, '/home/ubuntu/sophie-voice-env')
from sophie_voice import SophieTTS, SophieSTT

# TTS
tts = SophieTTS()
duration, elapsed = tts.synthesize_to_file("Hello!", "output.wav")
print(f"Generated {duration}s in {elapsed}s")

# Streaming TTS
for chunk in tts.synthesize_streaming("Hello world"):
    # Process chunk (16-bit PCM bytes)
    pass

# STT
stt = SophieSTT()
text = stt.transcribe("audio.wav")
print(text)
```

---

## Voice Character

- **Name:** Amy (en_US-amy-medium)
- **Sample Rate:** 22050 Hz
- **Quality:** Natural, friendly, clear
- **Best for:** Conversational AI, assistants

---

## Performance Benchmarks

| Test | TTS Time | STT Time | Total |
|------|----------|----------|-------|
| 5s phrase | 0.2s | 3.7s | 3.9s |
| 18s paragraph | 0.8s | ~13s | ~14s |

**Hardware:** Ryzen 5 3600 (6 cores, CPU only)

---

## Future Improvements

- [ ] Add VAD for streaming STT
- [ ] Implement wake word detection
- [ ] Add emotion/prosody control
- [ ] Test with real-time audio input
- [ ] Integrate with Clawdbot TTS config

---

## Demo Files

- Voice demo: `/home/ubuntu/clawd/data/voice-benchmarks/sophie_voice_demo.wav`
- Test samples: `/home/ubuntu/clawd/data/voice-benchmarks/tts/`
