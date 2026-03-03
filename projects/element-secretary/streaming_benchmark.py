#!/usr/bin/env python3
"""
Streaming Pipeline Benchmark - Test optimized TTS + STT

Optimizations:
- TTS: Kokoro with streaming PCM (response_format=pcm)
- STT: Whisper small.en with int8, beam_size=3, vad_filter

Metrics captured:
- First chunk latency (time to first audio)
- Total generation time
- Realtime factor
- Can we keep up? (generation vs playback speed)
"""

import asyncio
import time
import os
import sys
import numpy as np
import aiohttp
import wave
import io
from pathlib import Path
from dataclasses import dataclass
from typing import List, Optional

# Load env
from dotenv import load_dotenv
load_dotenv(Path(__file__).parent / ".env")

KOKORO_URL = os.getenv("KOKORO_TTS_URL", "http://localhost:8880/v1").rstrip("/")
KOKORO_VOICE = os.getenv("KOKORO_VOICE", "af_heart")

@dataclass
class TTSMetrics:
    text_length: int
    word_count: int
    first_chunk_ms: float
    total_time_ms: float
    audio_duration_ms: float
    total_bytes: int
    chunk_count: int
    realtime_factor: float
    can_keep_up: bool

@dataclass
class STTMetrics:
    audio_duration_ms: float
    processing_time_ms: float
    word_count: int
    text: str
    realtime_factor: float

async def benchmark_tts_streaming(text: str) -> TTSMetrics:
    """Benchmark streaming TTS with detailed metrics."""
    
    start_time = time.perf_counter()
    first_chunk_time = None
    total_bytes = 0
    chunk_count = 0
    chunks = []
    
    async with aiohttp.ClientSession() as session:
        async with session.post(
            f"{KOKORO_URL}/audio/speech",
            json={
                "model": "kokoro",
                "input": text,
                "voice": KOKORO_VOICE,
                "response_format": "pcm"  # Streaming PCM!
            }
        ) as response:
            if response.status != 200:
                raise Exception(f"TTS error: {response.status}")
            
            async for chunk in response.content.iter_chunked(960):  # 20ms chunks at 24kHz
                if first_chunk_time is None:
                    first_chunk_time = time.perf_counter()
                
                chunks.append(chunk)
                total_bytes += len(chunk)
                chunk_count += 1
    
    end_time = time.perf_counter()
    
    # Calculate metrics
    total_time_ms = (end_time - start_time) * 1000
    first_chunk_ms = (first_chunk_time - start_time) * 1000 if first_chunk_time else 0
    
    # Audio duration: 24kHz, 16-bit mono = 48000 bytes/sec
    audio_duration_ms = (total_bytes / 48000) * 1000
    
    # Realtime factor: how many times faster than realtime
    realtime_factor = audio_duration_ms / total_time_ms if total_time_ms > 0 else 0
    
    # Can we keep up? We need RTF > 1.0 (ideally > 1.5 for safety margin)
    can_keep_up = realtime_factor > 1.2
    
    return TTSMetrics(
        text_length=len(text),
        word_count=len(text.split()),
        first_chunk_ms=first_chunk_ms,
        total_time_ms=total_time_ms,
        audio_duration_ms=audio_duration_ms,
        total_bytes=total_bytes,
        chunk_count=chunk_count,
        realtime_factor=realtime_factor,
        can_keep_up=can_keep_up,
    )

async def benchmark_tts_non_streaming(text: str) -> TTSMetrics:
    """Benchmark non-streaming TTS (current behavior) for comparison."""
    
    start_time = time.perf_counter()
    
    async with aiohttp.ClientSession() as session:
        async with session.post(
            f"{KOKORO_URL}/audio/speech",
            json={
                "model": "kokoro",
                "input": text,
                "voice": KOKORO_VOICE,
                "response_format": "wav"  # Non-streaming WAV
            },
            timeout=aiohttp.ClientTimeout(total=120)
        ) as response:
            if response.status != 200:
                raise Exception(f"TTS error: {response.status}")
            wav_data = await response.read()
    
    first_chunk_time = time.perf_counter()  # First chunk = full response
    end_time = time.perf_counter()
    
    # Get audio duration from WAV
    with wave.open(io.BytesIO(wav_data), 'rb') as wf:
        frames = wf.getnframes()
        rate = wf.getframerate()
        audio_duration_ms = (frames / rate) * 1000
    
    total_time_ms = (end_time - start_time) * 1000
    first_chunk_ms = total_time_ms  # No streaming = full wait
    realtime_factor = audio_duration_ms / total_time_ms if total_time_ms > 0 else 0
    
    return TTSMetrics(
        text_length=len(text),
        word_count=len(text.split()),
        first_chunk_ms=first_chunk_ms,
        total_time_ms=total_time_ms,
        audio_duration_ms=audio_duration_ms,
        total_bytes=len(wav_data),
        chunk_count=1,
        realtime_factor=realtime_factor,
        can_keep_up=realtime_factor > 1.2,
    )

def benchmark_stt_optimized(audio_data: bytes, sample_rate: int = 24000) -> STTMetrics:
    """Benchmark STT with optimized settings."""
    from faster_whisper import WhisperModel
    
    start_time = time.perf_counter()
    
    # Load model with optimizations
    model = WhisperModel(
        "small.en",  # Upgraded from tiny.en
        device="cpu",
        compute_type="int8"  # 44% faster, 40% less memory
    )
    
    # Convert PCM to float32
    audio = np.frombuffer(audio_data, dtype=np.int16).astype(np.float32) / 32768.0
    
    # Resample to 16kHz if needed
    if sample_rate != 16000:
        # Simple decimation (faster than scipy resample)
        ratio = sample_rate // 16000
        audio = audio[::ratio]
    
    # Transcribe with optimizations
    segments, info = model.transcribe(
        audio,
        language="en",
        beam_size=3,  # Reduced from 5 (15% faster)
        best_of=1,
        vad_filter=True,  # Skip silence
    )
    
    text = " ".join([seg.text for seg in segments]).strip()
    
    end_time = time.perf_counter()
    
    processing_time_ms = (end_time - start_time) * 1000
    audio_duration_ms = (len(audio) / 16000) * 1000
    realtime_factor = audio_duration_ms / processing_time_ms if processing_time_ms > 0 else 0
    
    return STTMetrics(
        audio_duration_ms=audio_duration_ms,
        processing_time_ms=processing_time_ms,
        word_count=len(text.split()),
        text=text,
        realtime_factor=realtime_factor,
    )

async def run_streaming_keepup_test(text: str, num_runs: int = 5):
    """Test if streaming TTS can keep up with realtime playback."""
    
    print("\n" + "=" * 70)
    print("STREAMING KEEP-UP TEST")
    print("=" * 70)
    print(f"\nText: {text[:80]}...")
    print(f"Words: {len(text.split())}")
    
    # Simulate realtime playback
    print(f"\n🔄 Running {num_runs} iterations...")
    
    results = []
    for i in range(num_runs):
        metrics = await benchmark_tts_streaming(text)
        results.append(metrics)
        status = "✅" if metrics.can_keep_up else "❌"
        print(f"   Run {i+1}: First chunk {metrics.first_chunk_ms:.0f}ms, "
              f"RTF {metrics.realtime_factor:.1f}x {status}")
    
    # Calculate averages
    avg_first_chunk = sum(r.first_chunk_ms for r in results) / len(results)
    avg_total = sum(r.total_time_ms for r in results) / len(results)
    avg_rtf = sum(r.realtime_factor for r in results) / len(results)
    all_keep_up = all(r.can_keep_up for r in results)
    
    print(f"\n📊 Averages:")
    print(f"   First chunk latency: {avg_first_chunk:.0f}ms")
    print(f"   Total generation: {avg_total:.0f}ms")
    print(f"   Audio duration: {results[0].audio_duration_ms:.0f}ms")
    print(f"   Realtime factor: {avg_rtf:.1f}x")
    print(f"   Can keep up: {'✅ YES' if all_keep_up else '❌ NO - may cut out'}")
    
    return results

async def run_comparison_benchmark():
    """Compare streaming vs non-streaming TTS."""
    
    print("\n" + "=" * 70)
    print("TTS COMPARISON: STREAMING vs NON-STREAMING")
    print("=" * 70)
    
    test_texts = [
        # Short response (~20 words)
        "Hello Aaron! I've finished analyzing the voice pipeline. The main bottleneck is TTS latency.",
        
        # Medium response (~50 words)
        "Hello Aaron! I've finished analyzing the voice pipeline and identified several optimization opportunities. The main bottleneck is TTS latency at three times realtime. By switching to streaming output, we can reduce first-audio latency from twelve seconds to under five hundred milliseconds.",
        
        # Longer response (~100 words)
        "Hello Aaron! I've completed a comprehensive analysis of the Sophie voice pipeline. The main bottleneck is TTS generation at three times realtime speed. By implementing streaming output with the PCM format, we can dramatically reduce first-audio latency from twelve seconds to approximately three hundred milliseconds. Additionally, upgrading the speech recognition from tiny to small model will improve accuracy from ninety-two percent to ninety-six percent on technical terms, while only adding a couple seconds of processing time. The streaming architecture uses a producer-consumer pattern with cancellation support for handling interruptions.",
    ]
    
    for i, text in enumerate(test_texts):
        word_count = len(text.split())
        print(f"\n{'─' * 50}")
        print(f"Test {i+1}: {word_count} words")
        print(f"{'─' * 50}")
        
        # Non-streaming (current)
        print("\n📦 Non-streaming (current)...")
        non_stream = await benchmark_tts_non_streaming(text)
        print(f"   First audio: {non_stream.first_chunk_ms:.0f}ms")
        print(f"   Total time: {non_stream.total_time_ms:.0f}ms")
        print(f"   RTF: {non_stream.realtime_factor:.1f}x")
        
        # Streaming (optimized)
        print("\n🌊 Streaming (optimized)...")
        stream = await benchmark_tts_streaming(text)
        print(f"   First audio: {stream.first_chunk_ms:.0f}ms")
        print(f"   Total time: {stream.total_time_ms:.0f}ms")
        print(f"   RTF: {stream.realtime_factor:.1f}x")
        print(f"   Can keep up: {'✅' if stream.can_keep_up else '❌'}")
        
        # Improvement
        improvement = non_stream.first_chunk_ms - stream.first_chunk_ms
        print(f"\n   💡 First audio improvement: {improvement:.0f}ms faster!")

async def run_stt_benchmark():
    """Benchmark optimized STT."""
    
    print("\n" + "=" * 70)
    print("STT BENCHMARK: OPTIMIZED small.en")
    print("=" * 70)
    
    # First generate some test audio
    test_text = "Hello Aaron! This is Sophie speaking with the optimized pipeline."
    
    print(f"\n1. Generating test audio via TTS...")
    
    # Get audio
    audio_chunks = []
    async with aiohttp.ClientSession() as session:
        async with session.post(
            f"{KOKORO_URL}/audio/speech",
            json={
                "model": "kokoro",
                "input": test_text,
                "voice": KOKORO_VOICE,
                "response_format": "pcm"
            }
        ) as response:
            async for chunk in response.content.iter_chunked(960):
                audio_chunks.append(chunk)
    
    audio_data = b''.join(audio_chunks)
    audio_duration_ms = (len(audio_data) / 48000) * 1000  # 24kHz, 16-bit
    print(f"   Generated {len(audio_data)} bytes ({audio_duration_ms:.0f}ms)")
    
    print(f"\n2. Running STT with small.en + optimizations...")
    print(f"   (First run loads model, subsequent runs are faster)")
    
    # Run multiple times
    for i in range(3):
        metrics = benchmark_stt_optimized(audio_data, sample_rate=24000)
        print(f"\n   Run {i+1}:")
        print(f"   Processing time: {metrics.processing_time_ms:.0f}ms")
        print(f"   Realtime factor: {metrics.realtime_factor:.1f}x")
        print(f"   Transcribed: \"{metrics.text}\"")

async def main():
    print("=" * 70)
    print("STREAMING PIPELINE BENCHMARK")
    print("=" * 70)
    print(f"\nConfiguration:")
    print(f"   TTS: Kokoro ({KOKORO_URL}) with streaming PCM")
    print(f"   STT: faster-whisper small.en, int8, beam_size=3")
    print(f"   Voice: {KOKORO_VOICE}")
    
    # Test 1: Streaming keep-up test
    test_text = """Hello Aaron! I've finished the optimization research and have great news. 
    By switching to streaming TTS output, we can reduce first-audio latency significantly. 
    The system now starts speaking within a few hundred milliseconds instead of waiting 
    for the entire response to be generated."""
    
    await run_streaming_keepup_test(test_text, num_runs=5)
    
    # Test 2: Comparison benchmark
    await run_comparison_benchmark()
    
    # Test 3: STT benchmark
    await run_stt_benchmark()
    
    print("\n" + "=" * 70)
    print("BENCHMARK COMPLETE")
    print("=" * 70)

if __name__ == "__main__":
    asyncio.run(main())
