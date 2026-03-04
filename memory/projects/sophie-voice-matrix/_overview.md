# Sophie Voice Matrix - Comprehensive Overview

**Status:** Production Ready (Streaming Enhanced)  
**Created:** 2026-03-03  
**Last Updated:** 2026-03-04 17:56 EST  
**Location:** `~/sophie-voice-env/` (local) + Kokoro Docker (TTS)

## Summary

Self-hosted voice pipeline using **Kokoro TTS** (af_heart voice with streaming) and **faster-whisper STT**. Designed for real-time voice applications.

### TTS Decision (2026-03-04)
- **Chosen:** Kokoro with af_heart voice + streaming enabled
- **Why:** Better voice quality than Piper (sounds more natural/expressive)
- **Trade-off:** Higher latency (~3-7s first chunk vs Piper's ~50ms) but worth it for quality
- **Streaming:** Uses `response_format: "pcm"` with chunked responses

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SOPHIE VOICE MATRIX                          │
└─────────────────────────────────────────────────────────────────────┘

INPUT LAYER
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Text Input   │  │ Audio File   │  │ Live Audio   │
│ (String)     │  │ (.wav/.mp3)  │  │ (Streaming)  │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       v                 v                 v

PROCESSING LAYER
┌─────────────────────────────────────────────────────────────────────┐
│                          TTS PIPELINE                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │ Text        │  │ Kokoro      │  │ Audio       │                 │
│  │ Processing  │→ │ Synthesis   │→ │ Chunking    │                 │
│  │             │  │ (af_heart)  │  │ (Streaming) │                 │
│  └─────────────┘  └─────────────┘  └─────────────┘                 │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      AUDIO OUTPUT LAYER                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │ WAV File    │  │ Raw PCM     │  │ Streaming   │                 │
│  │ (Complete)  │  │ Chunks      │  │ Playback    │                 │
│  │ 22050Hz     │  │ (16-bit)    │  │ (Real-time) │                 │
│  └─────────────┘  └─────────────┘  └─────────────┘                 │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          STT PIPELINE                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │ Audio       │  │ Whisper     │  │ Text        │                 │
│  │ Chunking    │→ │ Transcribe  │→ │ Assembly    │                 │
│  │ (5s chunks) │  │ (small/int8)│  │ (Streaming) │                 │
│  └─────────────┘  └─────────────┘  └─────────────┘                 │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
OUTPUT LAYER
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ Full Text    │  │ Text Chunks  │  │ Timestamped  │
│ (Complete)   │  │ (Streaming)  │  │ Segments     │
└──────────────┘  └──────────────┘  └──────────────┘

PERFORMANCE CHARACTERISTICS
┌─────────────────────────────────────────────────────────────────────┐
│ TTS: 2.7x realtime (Kokoro) | STT: 1.4x realtime | Voice: Natural  │
│ First chunk: ~3-5s | Streaming: PCM chunks | Quality: 9/10         │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Performance Specifications

### Hardware Requirements
- **CPU:** Ryzen 5 3600 or equivalent (6+ cores recommended)
- **RAM:** 500MB minimum (190MB models + processing overhead)
- **Storage:** 150MB for voice models
- **OS:** Linux (tested), macOS, Windows (Python 3.8+)

### Latency Characteristics

| Operation | Batch Mode | Streaming Mode | First Chunk |
|-----------|------------|----------------|-------------|
| **TTS (short ~12 words)** | 1.6s | Streaming | ~1.6s |
| **TTS (medium ~29 words)** | 5.4s | Streaming | ~5.4s |
| **TTS (long ~61 words)** | 13.4s | Streaming | ~6.7s |
| **STT (5s audio)** | 4.1s | 5s chunks | N/A |
| **STT (15s audio)** | 3.9s | 5s chunks | N/A |
| **Round-trip** | ~10-15s | ~8-12s | Depends on text |

**Note:** Kokoro has higher latency than Piper (~50ms) but significantly better voice quality. Trade-off accepted for natural-sounding voice.

### Voice Quality (Why Kokoro)
- **Kokoro (af_heart):** Very natural, expressive, sounds like a real person (9/10)
- **Piper (lessac):** Good clarity, less expressive (7/10)
- **Decision:** Quality > Speed for Sophie's voice

### Accuracy Metrics (STT)
- **Short phrases:** 50-85% word accuracy
- **Medium sentences:** 80-90% word accuracy  
- **Long paragraphs:** 85-95% word accuracy
- **Technical terms:** May require fine-tuning

---

## 📚 Complete API Reference

### Kokoro TTS (Primary)

#### Streaming TTS via Kokoro API
```python
import aiohttp

async def stream_tts(text: str):
    """Stream TTS from Kokoro with af_heart voice."""
    async with aiohttp.ClientSession() as session:
        async with session.post(
            "http://localhost:8880/v1/audio/speech",
            json={
                "model": "kokoro",
                "input": text,
                "voice": "af_heart",
                "response_format": "pcm"  # Key: PCM for streaming
            }
        ) as response:
            async for chunk in response.content.iter_chunked(960):
                yield chunk  # 24kHz, int16, mono
```

#### Sync Version (requests)
```python
import requests

response = requests.post(
    "http://localhost:8880/v1/audio/speech",
    json={
        "input": "Hello world!",
        "voice": "af_heart",
        "response_format": "pcm"
    },
    stream=True
)

for chunk in response.iter_content(chunk_size=1024):
    if chunk:
        # Process streaming chunks (24kHz PCM)
        pass
```

### Legacy: SophieTTS Class (Piper)

> **Note:** Piper is available as fallback but Kokoro is preferred for quality.

#### Initialization
```python
from sophie_voice import SophieTTS

tts = SophieTTS()
# Loads en_US-amy-medium.onnx automatically
# Memory usage: ~60MB
```

#### Core Methods

##### `synthesize(text: str) -> bytes`
```python
audio_data = tts.synthesize("Hello world")
# Returns: Raw 16-bit PCM audio bytes
# Sample rate: 22050 Hz, mono
```

##### `synthesize_streaming(text: str) -> Iterator[bytes]`
```python
for chunk in tts.synthesize_streaming("Hello world"):
    # Process each audio chunk as it's generated
    # Typical chunk size: 100-300KB
    # First chunk latency: ~170ms
    pass
```

##### `synthesize_to_file(text: str, output_path: str) -> Tuple[float, float]`
```python
duration, elapsed = tts.synthesize_to_file("Hello", "output.wav")
# Returns: (audio_duration_seconds, processing_time_seconds)
# Creates complete WAV file with headers
```

### SophieSTT Class

#### Initialization
```python
from sophie_voice import SophieSTT

stt = SophieSTT(model_size="small")  # Options: tiny, base, small, medium, large
# Default: small (best speed/accuracy balance)
# Memory usage: ~130MB
```

#### Core Methods

##### `transcribe(audio_path: str) -> str`
```python
text = stt.transcribe("audio.wav")
# Returns: Complete transcription as string
# Supports: WAV, MP3, M4A, FLAC via ffmpeg
```

##### `transcribe_streaming(audio_path: str, chunk_duration: float = 5.0) -> Iterator[str]`
```python
for chunk_text in stt.transcribe_streaming("long_audio.wav", chunk_duration=5.0):
    print(chunk_text)  # Format: "[0.0s] First chunk text"
    # Yields timestamped text chunks
    # Useful for long audio files or real-time processing
```

##### `transcribe_with_timing(audio_path: str) -> Tuple[str, float, float]`
```python
text, audio_duration, processing_time = stt.transcribe_with_timing("audio.wav")
# Returns: (transcription, audio_duration_seconds, processing_time_seconds)
# Includes performance metrics
```

---

## 🔄 Streaming vs Batch Modes

### TTS Modes

#### Batch Mode (Default)
```python
# Pros: Slightly faster overall, simpler implementation
# Cons: No intermediate results, higher memory usage for long text
duration, elapsed = tts.synthesize_to_file("Long text here", "output.wav")
```

#### Streaming Mode
```python
# Pros: Lower latency to first audio, progressive playback possible
# Cons: Slightly higher total processing time due to chunking overhead
with wave.open("output.wav", "wb") as wav_file:
    wav_file.setnchannels(1)
    wav_file.setsampwidth(2)  
    wav_file.setframerate(22050)
    for chunk in tts.synthesize_streaming("Long text here"):
        wav_file.writeframes(chunk)  # Can play chunk immediately
```

### STT Modes

#### Batch Mode (Default)
```python
# Pros: Better accuracy for complete context, faster for short audio
# Cons: No intermediate results, requires complete file
text = stt.transcribe("complete_audio.wav")
```

#### Streaming Mode
```python
# Pros: Progressive results, better for long audio, real-time capability
# Cons: May have slight accuracy reduction at chunk boundaries
for chunk in stt.transcribe_streaming("long_audio.wav", chunk_duration=5.0):
    print(f"Partial result: {chunk}")  # Can act on partial transcriptions
```

---

## 💡 Integration Examples

### 1. Real-time Microphone Input

```python
#!/usr/bin/env python3
"""
Real-time microphone to text transcription
Requires: pyaudio, queue, threading
"""
import pyaudio
import wave
import queue
import threading
import tempfile
from sophie_voice import SophieSTT

def record_audio(audio_queue, stop_event):
    """Record audio chunks from microphone"""
    p = pyaudio.PyAudio()
    
    stream = p.open(
        format=pyaudio.paInt16,
        channels=1,
        rate=16000,
        input=True,
        frames_per_buffer=1024
    )
    
    frames = []
    while not stop_event.is_set():
        data = stream.read(1024, exception_on_overflow=False)
        frames.append(data)
        
        # Every 5 seconds, send audio chunk for transcription
        if len(frames) >= 5 * 16000 // 1024:  # 5 seconds of audio
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as f:
                with wave.open(f.name, 'wb') as wf:
                    wf.setnchannels(1)
                    wf.setsampwidth(2)
                    wf.setframerate(16000)
                    wf.writeframes(b''.join(frames))
                audio_queue.put(f.name)
            frames = []
    
    stream.stop_stream()
    stream.close()
    p.terminate()

def transcribe_worker(audio_queue, text_queue, stop_event):
    """Worker thread for transcription"""
    stt = SophieSTT()
    
    while not stop_event.is_set():
        try:
            audio_file = audio_queue.get(timeout=1)
            text = stt.transcribe(audio_file)
            if text.strip():
                text_queue.put(text)
            os.unlink(audio_file)  # Clean up temp file
        except queue.Empty:
            continue
        except Exception as e:
            print(f"Transcription error: {e}")

def main():
    """Real-time speech recognition demo"""
    audio_queue = queue.Queue()
    text_queue = queue.Queue()
    stop_event = threading.Event()
    
    # Start worker threads
    record_thread = threading.Thread(target=record_audio, args=(audio_queue, stop_event))
    transcribe_thread = threading.Thread(target=transcribe_worker, args=(audio_queue, text_queue, stop_event))
    
    record_thread.start()
    transcribe_thread.start()
    
    print("Listening... (Ctrl+C to stop)")
    try:
        while True:
            try:
                text = text_queue.get(timeout=1)
                print(f"Transcribed: {text}")
            except queue.Empty:
                continue
    except KeyboardInterrupt:
        print("Stopping...")
        stop_event.set()
        record_thread.join()
        transcribe_thread.join()

if __name__ == "__main__":
    main()
```

### 2. WebSocket Streaming Server

```python
#!/usr/bin/env python3
"""
WebSocket server for real-time voice processing
Requires: websockets, asyncio
"""
import asyncio
import websockets
import json
import base64
import tempfile
import wave
from sophie_voice import SophieTTS, SophieSTT

class VoiceWebSocketServer:
    def __init__(self):
        self.tts = SophieTTS()
        self.stt = SophieSTT()
    
    async def handle_client(self, websocket, path):
        """Handle WebSocket client connection"""
        print(f"Client connected: {websocket.remote_address}")
        
        try:
            async for message in websocket:
                data = json.loads(message)
                
                if data['type'] == 'tts':
                    await self.handle_tts(websocket, data)
                elif data['type'] == 'stt':
                    await self.handle_stt(websocket, data)
                elif data['type'] == 'tts_streaming':
                    await self.handle_tts_streaming(websocket, data)
                    
        except websockets.exceptions.ConnectionClosed:
            print(f"Client disconnected: {websocket.remote_address}")
        except Exception as e:
            print(f"Error handling client: {e}")
    
    async def handle_tts(self, websocket, data):
        """Handle text-to-speech request"""
        text = data['text']
        
        # Generate audio
        audio_data = self.tts.synthesize(text)
        
        # Send back as base64
        audio_b64 = base64.b64encode(audio_data).decode('utf-8')
        response = {
            'type': 'tts_response',
            'audio': audio_b64,
            'sample_rate': self.tts.sample_rate,
            'format': 'pcm_s16le'
        }
        await websocket.send(json.dumps(response))
    
    async def handle_tts_streaming(self, websocket, data):
        """Handle streaming text-to-speech"""
        text = data['text']
        
        # Send chunks as they're generated
        for i, chunk in enumerate(self.tts.synthesize_streaming(text)):
            audio_b64 = base64.b64encode(chunk).decode('utf-8')
            response = {
                'type': 'tts_chunk',
                'chunk_index': i,
                'audio': audio_b64,
                'sample_rate': self.tts.sample_rate
            }
            await websocket.send(json.dumps(response))
        
        # Send completion signal
        await websocket.send(json.dumps({'type': 'tts_complete'}))
    
    async def handle_stt(self, websocket, data):
        """Handle speech-to-text request"""
        audio_b64 = data['audio']
        audio_data = base64.b64decode(audio_b64)
        
        # Write to temp file
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as f:
            with wave.open(f.name, 'wb') as wf:
                wf.setnchannels(1)
                wf.setsampwidth(2)
                wf.setframerate(data.get('sample_rate', 16000))
                wf.writeframes(audio_data)
            
            # Transcribe
            text = self.stt.transcribe(f.name)
            
        # Send response
        response = {
            'type': 'stt_response',
            'text': text
        }
        await websocket.send(json.dumps(response))
    
    def start_server(self, host='localhost', port=8765):
        """Start the WebSocket server"""
        print(f"Starting voice server on ws://{host}:{port}")
        return websockets.serve(self.handle_client, host, port)

async def main():
    server = VoiceWebSocketServer()
    await server.start_server()
    print("Server ready! Send JSON messages with 'type': 'tts'/'stt'/'tts_streaming'")
    await asyncio.Future()  # Run forever

if __name__ == "__main__":
    asyncio.run(main())
```

### 3. Clawdbot TTS Integration

```python
#!/usr/bin/env python3
"""
Clawdbot integration for Sophie Voice Matrix
Provides TTS function compatible with clawdbot's tts tool
"""
import sys
import os
sys.path.insert(0, '/home/ubuntu/sophie-voice-env')

from sophie_voice import SophieTTS

def generate_sophie_tts(text: str, channel: str = None) -> str:
    """
    Generate TTS using Sophie Voice Matrix
    Compatible with clawdbot's tts() function
    
    Args:
        text: Text to synthesize
        channel: Channel ID (unused, for compatibility)
    
    Returns:
        MEDIA: path for clawdbot consumption
    """
    try:
        # Initialize Sophie TTS
        tts = SophieTTS()
        
        # Generate unique output filename
        import hashlib
        import time
        text_hash = hashlib.md5(text.encode()).hexdigest()[:8]
        timestamp = int(time.time())
        output_path = f"/tmp/sophie_tts_{timestamp}_{text_hash}.wav"
        
        # Generate audio
        duration, elapsed = tts.synthesize_to_file(text, output_path)
        
        # Return in clawdbot MEDIA format
        return f"MEDIA: {output_path}"
        
    except Exception as e:
        print(f"Error generating Sophie TTS: {e}", file=sys.stderr)
        return None

def generate_sophie_tts_streaming(text: str, output_path: str = None) -> str:
    """
    Generate streaming TTS - returns path when first chunk is ready
    """
    try:
        tts = SophieTTS()
        
        if not output_path:
            import time
            output_path = f"/tmp/sophie_streaming_{int(time.time())}.wav"
        
        # Start streaming generation
        import wave
        import threading
        import time
        
        first_chunk_ready = threading.Event()
        
        def generate_audio():
            with wave.open(output_path, "wb") as wav_file:
                wav_file.setnchannels(1)
                wav_file.setsampwidth(2)
                wav_file.setframerate(22050)
                
                for i, chunk in enumerate(tts.synthesize_streaming(text)):
                    wav_file.writeframes(chunk)
                    if i == 0:  # First chunk ready
                        first_chunk_ready.set()
        
        # Start generation in background
        thread = threading.Thread(target=generate_audio)
        thread.start()
        
        # Wait for first chunk (low latency response)
        first_chunk_ready.wait(timeout=5.0)
        
        return f"MEDIA: {output_path}"
        
    except Exception as e:
        print(f"Error generating streaming Sophie TTS: {e}", file=sys.stderr)
        return None

# Command-line interface for clawdbot
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python sophie_clawdbot.py <text> [--streaming]", file=sys.stderr)
        sys.exit(1)
    
    text = sys.argv[1]
    streaming = "--streaming" in sys.argv
    
    if streaming:
        result = generate_sophie_tts_streaming(text)
    else:
        result = generate_sophie_tts(text)
    
    if result:
        print(result)  # clawdbot expects MEDIA: path on stdout
    else:
        sys.exit(1)
```

### 4. Voice Activity Detection (VAD) Integration

```python
#!/usr/bin/env python3
"""
Voice Activity Detection with Sophie Voice Matrix
Automatically detects speech and transcribes active segments
Requires: webrtcvad, pyaudio
"""
import pyaudio
import webrtcvad
import collections
import sys
import time
import wave
import tempfile
from sophie_voice import SophieSTT

class VoiceActivityDetector:
    def __init__(self, sample_rate=16000, aggressiveness=1):
        self.sample_rate = sample_rate
        self.vad = webrtcvad.Vad(aggressiveness)  # 0-3, higher = more aggressive
        self.stt = SophieSTT()
        
        # VAD frame configuration (webrtcvad requires specific frame sizes)
        self.frame_duration = 30  # ms (10, 20, or 30)
        self.frame_size = int(sample_rate * self.frame_duration / 1000)
        
        # Voice activity buffers
        self.ring_buffer_size = 10  # Keep last N frames
        self.ring_buffer = collections.deque(maxlen=self.ring_buffer_size)
        self.triggered = False
        
        # Audio recording
        self.audio = pyaudio.PyAudio()
        self.voice_frames = []
    
    def detect_and_transcribe(self, duration=None):
        """
        Continuously detect voice activity and transcribe speech segments
        
        Args:
            duration: Max duration in seconds (None = indefinite)
        """
        stream = self.audio.open(
            format=pyaudio.paInt16,
            channels=1,
            rate=self.sample_rate,
            input=True,
            frames_per_buffer=self.frame_size
        )
        
        print(f"Listening for voice activity... (Frame: {self.frame_duration}ms)")
        start_time = time.time()
        
        try:
            while True:
                if duration and (time.time() - start_time) > duration:
                    break
                
                # Read audio frame
                frame = stream.read(self.frame_size)
                
                # Detect voice activity
                is_speech = self.vad.is_speech(frame, self.sample_rate)
                
                if not self.triggered:
                    # Not currently recording
                    self.ring_buffer.append((frame, is_speech))
                    num_voiced = len([f for f, speech in self.ring_buffer if speech])
                    
                    # Start recording if enough voiced frames
                    if num_voiced > 0.9 * self.ring_buffer.maxlen:
                        print("Voice detected, starting recording...")
                        self.triggered = True
                        # Add buffered frames
                        self.voice_frames.extend([f for f, _ in self.ring_buffer])
                        self.ring_buffer.clear()
                else:
                    # Currently recording
                    self.voice_frames.append(frame)
                    self.ring_buffer.append((frame, is_speech))
                    num_unvoiced = len([f for f, speech in self.ring_buffer if not speech])
                    
                    # Stop recording if enough silent frames
                    if num_unvoiced > 0.9 * self.ring_buffer.maxlen:
                        print("Silence detected, processing speech...")
                        self.triggered = False
                        self.process_voice_segment()
                        self.voice_frames = []
                        self.ring_buffer.clear()
                        
        except KeyboardInterrupt:
            print("\nStopping...")
        finally:
            stream.stop_stream()
            stream.close()
            
            # Process any remaining audio
            if self.voice_frames:
                print("Processing final segment...")
                self.process_voice_segment()
    
    def process_voice_segment(self):
        """Process collected voice frames"""
        if len(self.voice_frames) < self.frame_size:  # Too short
            return
            
        # Convert frames to audio file
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as f:
            with wave.open(f.name, 'wb') as wf:
                wf.setnchannels(1)
                wf.setsampwidth(2)
                wf.setframerate(self.sample_rate)
                wf.writeframes(b''.join(self.voice_frames))
            
            # Transcribe
            try:
                text = self.stt.transcribe(f.name)
                if text.strip():
                    print(f"Transcribed: '{text}'")
                else:
                    print("(No speech detected)")
            except Exception as e:
                print(f"Transcription error: {e}")
            finally:
                import os
                os.unlink(f.name)
    
    def cleanup(self):
        """Clean up audio resources"""
        self.audio.terminate()

def main():
    """VAD demo with configurable parameters"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Voice Activity Detection with Sophie STT")
    parser.add_argument("--aggressiveness", type=int, default=1, choices=[0,1,2,3],
                       help="VAD aggressiveness (0=least, 3=most)")
    parser.add_argument("--duration", type=int, help="Duration in seconds (default: infinite)")
    parser.add_argument("--frame-duration", type=int, default=30, choices=[10,20,30],
                       help="Frame duration in ms")
    
    args = parser.parse_args()
    
    vad = VoiceActivityDetector(
        aggressiveness=args.aggressiveness
    )
    vad.frame_duration = args.frame_duration
    vad.frame_size = int(16000 * args.frame_duration / 1000)
    
    try:
        vad.detect_and_transcribe(duration=args.duration)
    finally:
        vad.cleanup()

if __name__ == "__main__":
    main()
```

---

## 🐛 Troubleshooting Guide

### Common Issues

#### 1. Model Loading Errors

**Problem:** `FileNotFoundError: en_US-amy-medium.onnx`
```bash
# Solution: Re-download voice models
cd ~/sophie-voice-env/voices
wget https://github.com/rhasspy/piper/releases/download/v1.2.0/voice-en-us-amy-medium.tar.gz
tar -xzf voice-en-us-amy-medium.tar.gz
mv en_US-amy-medium.onnx* .
```

**Problem:** `faster-whisper` import error
```bash
# Solution: Reinstall faster-whisper
~/sophie-voice-env/bin/pip install --upgrade faster-whisper
```

#### 2. Performance Issues

**Problem:** Slow TTS generation
```python
# Check model loading time vs synthesis time
import time
start = time.time()
tts = SophieTTS()  # Should take <2s
load_time = time.time() - start
print(f"Model load: {load_time:.2f}s")

# If >5s, check disk I/O and CPU usage
```

**Problem:** Poor STT accuracy
```python
# Try larger model
stt = SophieSTT(model_size="base")  # More accurate but slower

# Check audio quality
import subprocess
result = subprocess.run(['ffprobe', '-v', 'error', 'your_audio.wav'], 
                       capture_output=True, text=True)
print(result.stderr)  # Look for sample rate, channels, format
```

#### 3. Audio Format Issues

**Problem:** `wave` module errors
```bash
# Convert audio to supported format
ffmpeg -i input.mp3 -ar 16000 -ac 1 -c:a pcm_s16le output.wav
```

**Problem:** Streaming playback issues
```python
# Ensure consistent sample rate
with wave.open("output.wav", "wb") as wav_file:
    wav_file.setnchannels(1)
    wav_file.setsampwidth(2)
    wav_file.setframerate(22050)  # Must match TTS sample rate
    for chunk in tts.synthesize_streaming(text):
        wav_file.writeframes(chunk)
```

#### 4. Memory Issues

**Problem:** Out of memory during processing
```bash
# Check model memory usage
ps aux | grep python  # Look for memory usage

# Use smaller models if needed
stt = SophieSTT(model_size="tiny")  # ~20MB vs ~130MB for small
```

### Optimization Tips

#### 1. Model Caching
```python
# Pre-load models once for multiple requests
class VoiceServer:
    def __init__(self):
        self.tts = SophieTTS()  # Load once
        self.stt = SophieSTT()  # Load once
        
    def process_request(self, text):
        return self.tts.synthesize(text)  # Fast subsequent calls
```

#### 2. Streaming for Long Text
```python
# For text >100 words, use streaming to reduce perceived latency
def smart_synthesis(text):
    if len(text.split()) > 100:
        return synthesize_streaming(text)  # Progressive output
    else:
        return synthesize(text)  # Batch for short text
```

#### 3. Audio Format Optimization
```python
# Use optimal audio parameters
OPTIMAL_SAMPLE_RATE = 16000  # Good balance for STT
TTS_SAMPLE_RATE = 24000      # Kokoro's native rate (was 22050 for Piper)

# Resample if needed
import librosa
audio, sr = librosa.load("input.wav", sr=OPTIMAL_SAMPLE_RATE)
```

### Debug Commands

```bash
# Test basic pipeline
cd ~/sophie-voice-env && ./bin/python sophie_voice.py test

# Benchmark performance
cd ~/sophie-voice-env && ./bin/python sophie_voice.py benchmark

# Test streaming
cd ~/sophie-voice-env && ./bin/python sophie_voice.py demo-streaming

# Check model files
ls -la ~/sophie-voice-env/voices/

# Test individual components
./bin/python sophie_voice.py tts "Test text" /tmp/test.wav
./bin/python sophie_voice.py stt /tmp/test.wav

# Check dependencies
./bin/pip list | grep -E "(piper|faster-whisper|torch)"
```

### Log Analysis

Check system logs for issues:
```bash
# Memory usage during processing
dmesg | tail -20

# CPU usage patterns  
htop  # Look for CPU spikes during TTS/STT

# Disk I/O for model loading
iotop  # Check if storage is bottleneck
```

---

## 🗂️ File Structure Reference

```
~/sophie-voice-env/
├── bin/                                    # Python virtual environment
│   ├── python -> python3.12
│   ├── pip
│   └── activate
├── lib/python3.12/site-packages/         # Installed packages
│   ├── piper/                             # Piper TTS
│   ├── faster_whisper/                    # Whisper STT
│   ├── torch/                             # PyTorch (CPU)
│   └── ...
├── voices/                                # Voice model files
│   ├── en_US-amy-medium.onnx             # Sophie's voice (63MB)
│   ├── en_US-amy-medium.onnx.json        # Voice config
│   ├── en_US-libritts_r-medium.onnx      # Backup voice (78MB)
│   └── en_US-libritts_r-medium.onnx.json # Backup config
├── sophie_voice.py                        # Main pipeline script
└── activate_sophie.sh                     # Environment activation

Integration Examples:
├── examples/
│   ├── realtime_microphone.py           # Live audio input
│   ├── websocket_server.py              # WebSocket streaming
│   ├── clawdbot_integration.py           # Clawdbot TTS compatibility
│   └── vad_demo.py                       # Voice activity detection

Documentation:
/home/ubuntu/clawd/memory/projects/sophie-voice-matrix/
├── _overview.md                          # This file
├── benchmark-results.md                  # Performance data
├── streaming-research.md                 # Implementation notes
├── setup-complete.md                     # Installation summary
└── ai-streaming-notes.md                 # Development notes
```

---

## 📈 Benchmarks & Metrics

### TTS Comparison (2026-03-03)

| Engine | Voice | First Chunk | RTF | Quality |
|--------|-------|-------------|-----|---------|
| **Kokoro** ✅ | af_heart | 3-7s | 2.7x | 9/10 (natural) |
| Piper | lessac-medium | 50ms | 20-25x | 7/10 (good) |

**Decision:** Kokoro chosen for voice quality despite higher latency.

### Kokoro TTS Performance

| Words | First Chunk | Total Time | Audio Duration | RTF |
|-------|-------------|------------|----------------|-----|
| ~12 | 1.6s | 1.6s | 5.2s | 3.2x |
| ~29 | 5.4s | 5.4s | 15.1s | 2.8x |
| ~61 | 6.7s | 13.4s | 28.2s | 2.1x |

**Hardware:** Ryzen 5 3600, 32GB RAM, SSD  
**Models:** Kokoro af_heart (TTS), Whisper small/int8 (STT)

### STT Performance

| Test Case | STT Time | Accuracy | Notes |
|-----------|----------|----------|-------|
| Short | 4.1s | 50-85% | Short phrases less accurate |
| Medium | 3.9s | 80-90% | Good balance |
| Long | 4.2s | 85-95% | Best accuracy |

### Streaming Configuration

| Setting | Value | Notes |
|---------|-------|-------|
| API endpoint | `localhost:8880` | Kokoro Docker |
| Response format | `pcm` | Raw PCM for streaming |
| Sample rate | 24000 Hz | Kokoro native rate |
| Voice | `af_heart` | Natural, expressive |
| Chunk size | 960 bytes | ~20ms of audio |

### Accuracy Analysis

- **Technical terms:** 60-70% (e.g., "LiveKit" → "life get")
- **Common words:** 90-95% accuracy
- **Numbers/dates:** 80-85% accuracy  
- **Names:** 70-80% accuracy
- **Degradation:** Significant after 2+ TTS→STT cycles

---

## 🚀 Future Roadmap

### Phase 1: Production Hardening ✅
- [x] Self-hosted TTS: Kokoro (af_heart) with streaming
- [x] CPU-optimized STT: faster-whisper (small/int8)
- [x] Streaming implementation (PCM chunks)
- [x] Performance benchmarking (Kokoro vs Piper)
- [x] Comprehensive documentation
- [x] Integration examples

### Phase 2: Enhanced Features
- [ ] Voice Activity Detection (VAD) integration
- [ ] Wake word detection ("Hey Sophie")
- [ ] Emotion/prosody control for TTS
- [ ] Real-time audio streaming (microphone input)
- [ ] WebRTC integration for browser support

### Phase 3: Advanced Capabilities  
- [ ] Multi-speaker TTS (different voices)
- [ ] Speaker identification/diarization
- [ ] Custom voice training/fine-tuning
- [ ] Noise reduction and audio enhancement
- [ ] Language auto-detection

### Phase 4: Integration & Deployment
- [ ] Matrix/LiveKit voice chat integration
- [ ] Docker containerization
- [ ] Kubernetes deployment manifests
- [ ] Load balancing for multiple instances
- [ ] Monitoring and alerting

---

## 📞 Quick Reference

### Kokoro TTS (Primary)
```bash
# Test Kokoro is running
curl -s http://localhost:8880/v1/models | jq

# Generate speech via curl
curl -X POST http://localhost:8880/v1/audio/speech \
  -H "Content-Type: application/json" \
  -d '{"input": "Hello world", "voice": "af_heart", "response_format": "wav"}' \
  --output test.wav
```

### Python Integration (Streaming)
```python
import aiohttp

async def kokoro_stream(text: str):
    """Stream TTS from Kokoro."""
    async with aiohttp.ClientSession() as session:
        async with session.post(
            "http://localhost:8880/v1/audio/speech",
            json={
                "model": "kokoro",
                "input": text,
                "voice": "af_heart",
                "response_format": "pcm"
            }
        ) as response:
            async for chunk in response.content.iter_chunked(960):
                yield chunk  # 24kHz, int16, mono
```

### STT (faster-whisper)
```python
from sophie_voice import SophieSTT

stt = SophieSTT()
text = stt.transcribe("audio.wav")
```

### Key Settings
| Setting | Value |
|---------|-------|
| **TTS Engine** | Kokoro (Docker) |
| **TTS Voice** | `af_heart` |
| **TTS Endpoint** | `localhost:8880` |
| **TTS Format** | `pcm` (streaming) or `wav` |
| **TTS Sample Rate** | 24000 Hz |
| **STT Engine** | faster-whisper |
| **STT Model** | small/int8 |

### Performance Targets
- **TTS First Chunk:** ~3-5s (quality trade-off accepted)
- **TTS Quality:** 9/10 (natural, expressive)
- **STT Accuracy:** >90% for clear speech
- **Memory Usage:** <200MB total

---

**Status:** Production Ready ✅  
**Last Updated:** 2026-03-04 17:56 EST  
**Version:** 2.0 (Kokoro + Streaming)
---

## Element X Integration

See: `element-x-integration.md` for full details on Matrix/LiveKit voice setup.

**Current Status:** E2EE audio decryption issue being debugged (2026-03-03)

### Quick Links
- Infrastructure: `matrix3.aaroncollins.info` + `livekit3.aaroncollins.info`
- Bot account: `@sophie:matrix3.aaroncollins.info`
- Service: `sophie-voice.service`
- Project: `~/clawd/projects/element-secretary/`
