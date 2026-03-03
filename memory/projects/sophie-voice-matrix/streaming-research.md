# Streaming TTS + Interruption Research

**Date:** 2026-03-03  
**Goal:** Enable streaming TTS playback and handle user interruptions for Sophie voice assistant

---

## Executive Summary

The current Sophie implementation has ~12s latency for 100 words because it waits for full TTS generation before playback. This can be reduced to **~300ms first-token latency** by:

1. Using Kokoro's **streaming PCM output** (already supported!)
2. Publishing audio chunks incrementally to LiveKit
3. Using LiveKit's built-in **interruption handling** via VAD

**Best path forward:** Consider migrating to **LiveKit Agents framework** which handles all of this out of the box.

---

## 1. Streaming TTS APIs

### 1.1 Kokoro (localhost:8880) - STREAMING SUPPORTED ✅

Kokoro-FastAPI **already supports streaming**! The documentation confirms:

```python
# Streaming to speakers example from Kokoro docs
from openai import OpenAI
import pyaudio

client = OpenAI(base_url="http://localhost:8880/v1", api_key="not-needed")

player = pyaudio.PyAudio().open(
    format=pyaudio.paInt16,
    channels=1,
    rate=24000,
    output=True
)

with client.audio.speech.with_streaming_response.create(
    model="kokoro",
    voice="af_heart",
    response_format="pcm",  # Key: use PCM for streaming!
    input="Hello world!"
) as response:
    for chunk in response.iter_bytes(chunk_size=1024):
        player.write(chunk)
```

**Via requests (for aiohttp equivalent):**
```python
import requests

response = requests.post(
    "http://localhost:8880/v1/audio/speech",
    json={
        "input": "Hello world!",
        "voice": "af_heart",
        "response_format": "pcm"  # Raw PCM for streaming
    },
    stream=True  # Enable streaming response
)

for chunk in response.iter_content(chunk_size=1024):
    if chunk:
        # Process streaming chunks
        pass
```

**Key metrics:**
- **First token latency:** ~300ms (GPU) / ~3500ms (CPU)
- **Sample rate:** 24kHz
- **Format:** PCM (int16, mono)
- **Chunk size:** Configurable (1024 bytes = ~21ms of audio)

### 1.2 Piper TTS

Piper is now archived (Oct 2025). For streaming with Piper:
- Use `--output-raw` flag for raw PCM output
- Pipe to stdout and read chunks
- Native streaming not as well-supported as Kokoro

**Recommendation:** Stick with Kokoro for streaming.

### 1.3 Chunking Strategy

**Sentence-level chunking** is the sweet spot:
- Too small (word-by-word): Poor intonation, artifacts
- Too large (full text): High latency
- Sentence-level: Natural prosody, reasonable latency

Kokoro's internal chunking:
- `TARGET_MIN_TOKENS`: 175
- `TARGET_MAX_TOKENS`: 250
- `ABSOLUTE_MAX_TOKENS`: 450

---

## 2. Interruption Handling

### 2.1 LiveKit Agents Framework Approach (Recommended)

LiveKit has a full **Agents framework** that handles this elegantly:

```python
from livekit.agents import AgentSession
from livekit.agents.voice import VoiceAgent

# Turn detection options:
# - "turn_detector": Custom open-weights model (best)
# - "vad": Voice Activity Detection only
# - "stt": Use STT endpoint detection
# - "manual": Push-to-talk style

session = AgentSession(
    turn_detection="turn_detector",  # or "vad"
    allow_interruptions=True,
    min_interruption_speech_duration=0.5,  # 500ms
    min_interruption_words=3,  # Require at least 3 words
    resume_false_interruption=True,  # Resume if false positive
)
```

**Interruption behavior:**
1. VAD detects user speech
2. Agent stops speaking immediately
3. Conversation history truncated to what user heard
4. Agent listens for new input
5. If false positive (no words detected), agent resumes

### 2.2 Manual Interruption Handling (Current Architecture)

If not using LiveKit Agents, implement manually:

```python
class InterruptibleSpeaker:
    def __init__(self):
        self.speaking = False
        self.cancel_event = asyncio.Event()
        self.audio_queue = asyncio.Queue()
        
    async def play_with_interruption(self, audio_source, livekit_source):
        """Play audio while monitoring for user speech."""
        self.speaking = True
        self.cancel_event.clear()
        
        try:
            async for chunk in self.stream_audio(audio_source):
                # Check for cancellation
                if self.cancel_event.is_set():
                    break
                    
                # Publish chunk to LiveKit
                frame = rtc.AudioFrame(
                    data=chunk,
                    sample_rate=24000,
                    num_channels=1,
                    samples_per_channel=len(chunk) // 2
                )
                await livekit_source.capture_frame(frame)
                await asyncio.sleep(0.018)  # ~20ms frame pacing
        finally:
            self.speaking = False
    
    def interrupt(self):
        """Called when VAD detects user speech."""
        self.cancel_event.set()
```

### 2.3 VAD During Playback (Echo Cancellation)

**The Challenge:** Detecting user speech while playing audio creates echo.

**Solutions:**
1. **LiveKit Cloud Enhanced Noise Cancellation** - Built-in echo suppression
2. **Local Silero VAD** - Works but sensitive to echo
3. **Hardware AEC** - If using external mic/speaker

```python
# Silero VAD with sensitivity tuning
from livekit.plugins.silero import VAD

vad = VAD(
    activation_threshold=0.7,  # Higher = less sensitive
    min_speech_duration=0.3,   # Minimum speech to trigger
)
```

### 2.4 Graceful Stop Mid-Sentence

```python
async def stop_speaking(self):
    """Stop TTS playback gracefully."""
    # 1. Set cancel flag
    self.cancel_event.set()
    
    # 2. Drain audio queue
    while not self.audio_queue.empty():
        try:
            self.audio_queue.get_nowait()
        except:
            break
    
    # 3. Unpublish track (optional - or mute)
    if self.current_publication:
        await self.room.local_participant.unpublish_track(
            self.current_publication.sid
        )
    
    # 4. Log interruption point for context
    logger.info(f"Interrupted at position {self.playback_position}")
```

---

## 3. Architecture Patterns

### 3.1 Producer-Consumer Pattern

```python
class StreamingTTSPipeline:
    """Producer-Consumer pattern for streaming TTS."""
    
    def __init__(self):
        self.audio_queue = asyncio.Queue(maxsize=10)  # Buffer limit
        self.stop_event = asyncio.Event()
        
    async def producer(self, text: str):
        """Fetch streaming audio from Kokoro."""
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
                async for chunk in response.content.iter_chunked(1024):
                    if self.stop_event.is_set():
                        break
                    await self.audio_queue.put(chunk)
                        
        # Signal end of stream
        await self.audio_queue.put(None)
    
    async def consumer(self, livekit_source):
        """Play audio chunks to LiveKit."""
        while True:
            chunk = await self.audio_queue.get()
            if chunk is None:  # End of stream
                break
            if self.stop_event.is_set():
                break
                
            # Convert and publish
            frame = self.chunk_to_frame(chunk)
            await livekit_source.capture_frame(frame)
            await asyncio.sleep(0.018)
    
    async def run(self, text: str, livekit_source):
        """Run producer and consumer concurrently."""
        await asyncio.gather(
            self.producer(text),
            self.consumer(livekit_source)
        )
    
    def cancel(self):
        """Cancel streaming (on interruption)."""
        self.stop_event.set()
```

### 3.2 Cancellation Tokens/Signals

```python
class CancellationToken:
    """Cancellation token for cooperative cancellation."""
    
    def __init__(self):
        self._cancelled = False
        self._event = asyncio.Event()
        
    def cancel(self):
        self._cancelled = True
        self._event.set()
        
    @property
    def is_cancelled(self) -> bool:
        return self._cancelled
        
    async def wait(self):
        """Wait until cancelled."""
        await self._event.wait()

# Usage
async def speak_with_cancellation(text, token: CancellationToken):
    async for chunk in stream_tts(text):
        if token.is_cancelled:
            return  # Stop immediately
        await play_chunk(chunk)
```

### 3.3 Buffer Management

```python
class AudioBuffer:
    """Managed audio buffer with backpressure."""
    
    def __init__(self, max_buffered_ms: int = 500):
        self.max_chunks = max_buffered_ms // 20  # 20ms per chunk
        self.queue = asyncio.Queue(maxsize=self.max_chunks)
        self.underrun_count = 0
        
    async def push(self, chunk: bytes, timeout: float = 0.1):
        """Push chunk, blocks if buffer full (backpressure)."""
        try:
            await asyncio.wait_for(
                self.queue.put(chunk),
                timeout=timeout
            )
        except asyncio.TimeoutError:
            logger.warning("Buffer full, dropping chunk")
            
    async def pop(self) -> bytes:
        """Pop chunk, returns silence if empty."""
        try:
            return self.queue.get_nowait()
        except asyncio.QueueEmpty:
            self.underrun_count += 1
            return b'\x00' * 960  # 20ms silence at 24kHz
```

---

## 4. LiveKit Integration

### 4.1 Publishing Audio Chunks Incrementally ✅

**Yes, this works!** Current code already does frame-by-frame publishing:

```python
# From existing sophie_voice_agent.py - this is correct!
source = rtc.AudioSource(sample_rate, channels)
track = rtc.LocalAudioTrack.create_audio_track("sophie-voice", source)
publication = await self.room.local_participant.publish_track(track, options)

# Send frames incrementally
for chunk in audio_chunks:
    frame = rtc.AudioFrame(...)
    await source.capture_frame(frame)
    await asyncio.sleep(0.02)  # 20ms pacing
```

**Key insight:** Don't create new track per utterance! Keep a persistent track:

```python
class PersistentAudioPublisher:
    """Persistent audio track for low-latency streaming."""
    
    def __init__(self, room: rtc.Room):
        self.room = room
        self.source = None
        self.track = None
        self.publication = None
        
    async def setup(self):
        """Create persistent audio track (call once)."""
        self.source = rtc.AudioSource(24000, 1)
        self.track = rtc.LocalAudioTrack.create_audio_track(
            "sophie-voice", 
            self.source
        )
        options = rtc.TrackPublishOptions()
        options.source = rtc.TrackSource.SOURCE_MICROPHONE
        self.publication = await self.room.local_participant.publish_track(
            self.track, options
        )
        
    async def stream_audio(self, chunks_iterator):
        """Stream audio chunks through persistent track."""
        async for chunk in chunks_iterator:
            frame = rtc.AudioFrame(
                data=chunk,
                sample_rate=24000,
                num_channels=1,
                samples_per_channel=len(chunk) // 2
            )
            await self.source.capture_frame(frame)
```

### 4.2 Track Replacement on Interruption

**Don't replace tracks!** Instead:
1. Stop sending frames (let track go silent)
2. Clear any buffered audio
3. Start new audio stream when ready

```python
async def handle_interruption(self):
    """Handle user interruption."""
    # 1. Signal producer to stop
    self.cancel_token.cancel()
    
    # 2. Clear buffer
    await self.audio_buffer.clear()
    
    # 3. Track stays published but silent
    # (No need to unpublish/republish)
    
    # 4. Reset for next utterance
    self.cancel_token = CancellationToken()
```

---

## 5. Recommended Implementation

### Option A: Migrate to LiveKit Agents Framework (Recommended)

The LiveKit Agents framework handles **everything** we need:
- Streaming STT → LLM → TTS pipeline
- VAD and turn detection
- Interruption handling with history truncation
- False interruption recovery
- Echo cancellation

```python
from livekit.agents import AgentSession, Agent
from livekit.plugins import silero, deepgram, openai

class SophieAgent(Agent):
    def __init__(self):
        super().__init__(
            instructions="You are Sophie, Aaron's AI partner...",
            tts=openai.TTS(),  # Or custom Kokoro plugin
        )

async def main():
    session = AgentSession(
        turn_detection="turn_detector",
        allow_interruptions=True,
    )
    await session.start(SophieAgent())
```

**Pros:**
- Battle-tested interruption handling
- Built-in streaming
- Noise cancellation support
- Less code to maintain

**Cons:**
- Need to write Kokoro plugin (or use OpenAI TTS)
- Dependency on LiveKit Agents version

### Option B: Enhance Current Implementation

If staying with current architecture, add:

```python
class StreamingSophie:
    """Enhanced Sophie with streaming TTS and interruption handling."""
    
    async def speak_streaming(self, text: str):
        """Stream TTS with interruption support."""
        self.cancel_token = CancellationToken()
        
        # Start monitoring for user speech
        vad_task = asyncio.create_task(self.monitor_for_interruption())
        
        try:
            # Stream from Kokoro
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.kokoro_url}/v1/audio/speech",
                    json={
                        "model": "kokoro",
                        "input": text,
                        "voice": self.kokoro_voice,
                        "response_format": "pcm"
                    }
                ) as response:
                    async for chunk in response.content.iter_chunked(960):
                        if self.cancel_token.is_cancelled:
                            break
                        
                        frame = rtc.AudioFrame(
                            data=chunk,
                            sample_rate=24000,
                            num_channels=1,
                            samples_per_channel=len(chunk) // 2
                        )
                        await self.audio_source.capture_frame(frame)
                        await asyncio.sleep(0.018)
        finally:
            vad_task.cancel()
    
    async def monitor_for_interruption(self):
        """Monitor incoming audio for user speech."""
        energy_threshold = 500
        speech_frames = 0
        
        async for frame in self.incoming_audio_stream:
            audio_data = np.frombuffer(frame.data, dtype=np.int16)
            energy = np.sqrt(np.mean(audio_data.astype(float)**2))
            
            if energy > energy_threshold:
                speech_frames += 1
                if speech_frames > 5:  # ~100ms of speech
                    logger.info("User interruption detected!")
                    self.cancel_token.cancel()
                    return
            else:
                speech_frames = 0
```

---

## 6. Quick Wins (Immediate Improvements)

### 6.1 Switch to Streaming TTS (5 min change)

Change `_generate_speech` to stream:

```python
async def _generate_speech_streaming(self, text: str):
    """Generate speech with streaming."""
    async with aiohttp.ClientSession() as session:
        async with session.post(
            f"{self.kokoro_url}/v1/audio/speech",
            json={
                "model": "kokoro",
                "input": text,
                "voice": self.kokoro_voice,
                "response_format": "pcm"  # Changed from wav!
            }
        ) as response:
            async for chunk in response.content.iter_chunked(960):
                yield chunk
```

### 6.2 Use Persistent Audio Track (10 min change)

Move track creation to `join_room()`, not `speak()`:

```python
async def join_room(self):
    # ... existing code ...
    
    # Create persistent audio source/track
    self.audio_source = rtc.AudioSource(24000, 1)
    self.audio_track = rtc.LocalAudioTrack.create_audio_track(
        "sophie-voice", 
        self.audio_source
    )
    await self.room.local_participant.publish_track(self.audio_track)
```

### 6.3 Add Basic Interruption (30 min)

Add cancellation flag checked during playback.

---

## 7. References

- [Kokoro-FastAPI Streaming Docs](https://github.com/remsky/Kokoro-FastAPI)
- [LiveKit Agents Framework](https://docs.livekit.io/agents/)
- [LiveKit Turn Detection](https://docs.livekit.io/agents/logic/turns/)
- [LiveKit Agent Sessions](https://docs.livekit.io/agents/logic/sessions/)
