#!/usr/bin/env python3
"""
TTS Comparison Benchmark: Kokoro vs Piper

Tests:
- First chunk latency
- Total generation time
- Realtime factor
- Voice quality (subjective notes)
"""

import asyncio
import time
import os
import sys
import aiohttp
import subprocess
from pathlib import Path
from dataclasses import dataclass
from typing import Optional

# Load env
from dotenv import load_dotenv
load_dotenv(Path(__file__).parent / ".env")

KOKORO_URL = os.getenv("KOKORO_TTS_URL", "http://localhost:8880/v1").rstrip("/")
KOKORO_VOICE = os.getenv("KOKORO_VOICE", "af_heart")
PIPER_MODEL = "/home/ubuntu/clawd/data/piper-voices/en_US-lessac-medium.onnx"

@dataclass
class TTSResult:
    engine: str
    text_words: int
    first_chunk_ms: float
    total_time_ms: float
    audio_duration_ms: float
    audio_bytes: int
    realtime_factor: float

async def benchmark_kokoro(text: str) -> TTSResult:
    """Benchmark Kokoro TTS with streaming."""
    start = time.perf_counter()
    first_chunk_time = None
    total_bytes = 0
    
    async with aiohttp.ClientSession() as session:
        async with session.post(
            f"{KOKORO_URL}/audio/speech",
            json={
                "model": "kokoro",
                "input": text,
                "voice": KOKORO_VOICE,
                "response_format": "pcm"
            }
        ) as response:
            if response.status != 200:
                raise Exception(f"Kokoro error: {response.status}")
            
            async for chunk in response.content.iter_chunked(960):
                if first_chunk_time is None:
                    first_chunk_time = time.perf_counter()
                total_bytes += len(chunk)
    
    end = time.perf_counter()
    
    total_ms = (end - start) * 1000
    first_chunk_ms = (first_chunk_time - start) * 1000 if first_chunk_time else total_ms
    audio_duration_ms = (total_bytes / 48000) * 1000  # 24kHz 16-bit
    rtf = audio_duration_ms / total_ms if total_ms > 0 else 0
    
    return TTSResult(
        engine="Kokoro",
        text_words=len(text.split()),
        first_chunk_ms=first_chunk_ms,
        total_time_ms=total_ms,
        audio_duration_ms=audio_duration_ms,
        audio_bytes=total_bytes,
        realtime_factor=rtf,
    )

def benchmark_piper(text: str) -> TTSResult:
    """Benchmark Piper TTS."""
    from piper import PiperVoice
    
    start = time.perf_counter()
    first_chunk_time = None
    total_bytes = 0
    chunks = []
    
    # Load voice (cached after first load)
    voice = PiperVoice.load(PIPER_MODEL)
    
    # Synthesize
    for audio_bytes in voice.synthesize_stream_raw(text):
        if first_chunk_time is None:
            first_chunk_time = time.perf_counter()
        chunks.append(audio_bytes)
        total_bytes += len(audio_bytes)
    
    end = time.perf_counter()
    
    total_ms = (end - start) * 1000
    first_chunk_ms = (first_chunk_time - start) * 1000 if first_chunk_time else total_ms
    
    # Piper outputs 16-bit mono at 22050Hz
    audio_duration_ms = (total_bytes / (22050 * 2)) * 1000
    rtf = audio_duration_ms / total_ms if total_ms > 0 else 0
    
    return TTSResult(
        engine="Piper",
        text_words=len(text.split()),
        first_chunk_ms=first_chunk_ms,
        total_time_ms=total_ms,
        audio_duration_ms=audio_duration_ms,
        audio_bytes=total_bytes,
        realtime_factor=rtf,
    )

def benchmark_espeak(text: str) -> TTSResult:
    """Benchmark espeak-ng (ultra-fast but robotic)."""
    start = time.perf_counter()
    
    # Run espeak-ng
    result = subprocess.run(
        ["espeak-ng", "-v", "en-us", "--stdout", text],
        capture_output=True,
        check=True
    )
    
    first_chunk_time = time.perf_counter()  # espeak is not streaming
    end = time.perf_counter()
    
    audio_bytes = result.stdout
    total_ms = (end - start) * 1000
    first_chunk_ms = total_ms  # No streaming
    
    # espeak outputs WAV, approximate duration
    audio_duration_ms = (len(audio_bytes) / (22050 * 2)) * 1000
    rtf = audio_duration_ms / total_ms if total_ms > 0 else 0
    
    return TTSResult(
        engine="espeak-ng",
        text_words=len(text.split()),
        first_chunk_ms=first_chunk_ms,
        total_time_ms=total_ms,
        audio_duration_ms=audio_duration_ms,
        audio_bytes=len(audio_bytes),
        realtime_factor=rtf,
    )

async def run_comparison(test_texts: list):
    """Run comparison across all engines."""
    
    print("=" * 70)
    print("TTS COMPARISON BENCHMARK")
    print("=" * 70)
    print(f"\nEngines: Kokoro, Piper, espeak-ng")
    print(f"Test texts: {len(test_texts)}")
    
    # Pre-load Piper model
    print("\n🔄 Pre-loading Piper model...")
    from piper import PiperVoice
    piper_voice = PiperVoice.load(PIPER_MODEL)
    print("✅ Piper loaded")
    
    results = {
        "Kokoro": [],
        "Piper": [],
        "espeak-ng": [],
    }
    
    for i, text in enumerate(test_texts):
        word_count = len(text.split())
        print(f"\n{'─' * 50}")
        print(f"Test {i+1}: {word_count} words")
        print(f"{'─' * 50}")
        print(f"Text: {text[:60]}...")
        
        # Kokoro
        print("\n🎵 Kokoro...")
        try:
            r = await benchmark_kokoro(text)
            results["Kokoro"].append(r)
            print(f"   First chunk: {r.first_chunk_ms:.0f}ms")
            print(f"   Total: {r.total_time_ms:.0f}ms")
            print(f"   RTF: {r.realtime_factor:.1f}x")
        except Exception as e:
            print(f"   ❌ Error: {e}")
        
        # Piper
        print("\n🎵 Piper...")
        try:
            start = time.perf_counter()
            first_time = None
            total_bytes = 0
            
            for audio_bytes in piper_voice.synthesize_stream_raw(text):
                if first_time is None:
                    first_time = time.perf_counter()
                total_bytes += len(audio_bytes)
            
            end = time.perf_counter()
            total_ms = (end - start) * 1000
            first_ms = (first_time - start) * 1000 if first_time else total_ms
            audio_ms = (total_bytes / (22050 * 2)) * 1000
            rtf = audio_ms / total_ms if total_ms > 0 else 0
            
            r = TTSResult("Piper", word_count, first_ms, total_ms, audio_ms, total_bytes, rtf)
            results["Piper"].append(r)
            print(f"   First chunk: {r.first_chunk_ms:.0f}ms")
            print(f"   Total: {r.total_time_ms:.0f}ms")
            print(f"   RTF: {r.realtime_factor:.1f}x")
        except Exception as e:
            print(f"   ❌ Error: {e}")
        
        # espeak-ng
        print("\n🎵 espeak-ng...")
        try:
            r = benchmark_espeak(text)
            results["espeak-ng"].append(r)
            print(f"   First chunk: {r.first_chunk_ms:.0f}ms (no streaming)")
            print(f"   Total: {r.total_time_ms:.0f}ms")
            print(f"   RTF: {r.realtime_factor:.1f}x")
        except Exception as e:
            print(f"   ❌ Error: {e}")
    
    # Summary
    print(f"\n{'=' * 70}")
    print("SUMMARY")
    print(f"{'=' * 70}")
    
    print(f"\n{'Engine':<12} {'Avg First Chunk':<18} {'Avg Total':<15} {'Avg RTF':<10} {'Quality'}")
    print("─" * 70)
    
    for engine, res_list in results.items():
        if res_list:
            avg_first = sum(r.first_chunk_ms for r in res_list) / len(res_list)
            avg_total = sum(r.total_time_ms for r in res_list) / len(res_list)
            avg_rtf = sum(r.realtime_factor for r in res_list) / len(res_list)
            quality = "Natural" if engine == "Kokoro" else ("Good" if engine == "Piper" else "Robotic")
            print(f"{engine:<12} {avg_first:>10.0f}ms       {avg_total:>8.0f}ms       {avg_rtf:>6.1f}x    {quality}")
    
    print("\n💡 Recommendations:")
    print("   - Kokoro: Best quality but slower first chunk (~3s)")
    print("   - Piper: Good quality, faster first chunk")
    print("   - espeak-ng: Instant but robotic (fallback only)")

async def main():
    test_texts = [
        # Short (~15 words)
        "Hello Aaron! I've finished the analysis. The main issue is TTS latency.",
        
        # Medium (~40 words)
        "Hello Aaron! I've completed the voice pipeline analysis and found several optimization opportunities. The primary bottleneck is TTS generation. By switching to streaming, we can reduce first-audio latency significantly.",
        
        # Longer (~80 words)
        "Hello Aaron! I've completed a comprehensive analysis of the Sophie voice pipeline. The main bottleneck is TTS generation at three times realtime speed. By implementing streaming output, we can reduce first-audio latency from twelve seconds to under four seconds. Additionally, upgrading speech recognition from tiny to small will improve accuracy while maintaining acceptable speed. The streaming architecture uses a producer-consumer pattern.",
    ]
    
    await run_comparison(test_texts)

if __name__ == "__main__":
    asyncio.run(main())
