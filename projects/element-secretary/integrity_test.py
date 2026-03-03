#!/usr/bin/env python3
"""
Integrity Test - TTS → STT retelling test
Same story through 10 cycles to measure degradation.
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
from difflib import SequenceMatcher

# Load env
from dotenv import load_dotenv
load_dotenv(Path(__file__).parent / ".env")

KOKORO_URL = os.getenv("KOKORO_TTS_URL", "http://localhost:8880/v1")
KOKORO_VOICE = os.getenv("KOKORO_VOICE", "af_heart")
WHISPER_MODEL = os.getenv("WHISPER_MODEL", "tiny.en")

# Pre-load model
print("Loading Whisper model...")
from faster_whisper import WhisperModel
whisper_model = WhisperModel(WHISPER_MODEL, device="cpu", compute_type="int8")
print("Model loaded.\n")

async def tts(text: str) -> tuple[bytes, float]:
    """Text to WAV audio"""
    start = time.time()
    async with aiohttp.ClientSession() as session:
        async with session.post(
            f"{KOKORO_URL}/audio/speech",
            json={"model": "kokoro", "input": text, "voice": KOKORO_VOICE, "response_format": "wav"},
            timeout=aiohttp.ClientTimeout(total=300)
        ) as resp:
            if resp.status == 200:
                wav = await resp.read()
                return wav, time.time() - start
            raise Exception(f"TTS error: {resp.status}")

def stt(wav_data: bytes) -> tuple[str, float]:
    """WAV audio to text"""
    start = time.time()
    
    # Extract PCM from WAV
    with wave.open(io.BytesIO(wav_data), 'rb') as wf:
        sample_rate = wf.getframerate()
        pcm = wf.readframes(wf.getnframes())
    
    # Convert to float32 normalized
    audio = np.frombuffer(pcm, dtype=np.int16).astype(np.float32) / 32768.0
    
    # Resample to 16kHz if needed (simple decimation for speed)
    if sample_rate != 16000:
        ratio = sample_rate // 16000
        audio = audio[::ratio]
    
    # Transcribe
    segments, _ = whisper_model.transcribe(audio, language="en", beam_size=1, best_of=1)
    text = " ".join([seg.text for seg in segments]).strip()
    
    return text, time.time() - start

def similarity(a: str, b: str) -> float:
    """Calculate similarity ratio between two strings"""
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()

def word_count(text: str) -> int:
    return len(text.split())

async def run_integrity_test(cycles: int = 10):
    """Run TTS→STT integrity test"""
    
    # Original story (~100 words - realistic voice response length)
    original = """Hello Aaron, this is Sophie speaking. I wanted to tell you about the progress we've made today on the voice integration system. We successfully configured the Matrix and LiveKit connections, disabled the problematic E2EE encryption that was causing connection failures, and set up transport layer security instead. The Whisper speech recognition is working well, and Kokoro text-to-speech is generating clear audio. We still need to optimize the response latency, but the core pipeline is functional. Let me know if you'd like me to run any additional tests or make further improvements to the system."""
    
    print("=" * 70)
    print("INTEGRITY TEST: TTS → STT Telephone Game")
    print("=" * 70)
    print(f"\n📖 Original ({word_count(original)} words):")
    print(f"   {original[:100]}...")
    
    current_text = original
    results = []
    
    for cycle in range(1, cycles + 1):
        print(f"\n{'─' * 50}")
        print(f"CYCLE {cycle}/{cycles}")
        print(f"{'─' * 50}")
        
        # TTS
        print(f"🔊 TTS: {word_count(current_text)} words...")
        try:
            wav_data, tts_time = await tts(current_text)
            audio_duration = len(wav_data) / (24000 * 2)
            print(f"   ✅ {tts_time:.1f}s → ~{audio_duration:.0f}s audio")
        except Exception as e:
            print(f"   ❌ TTS failed: {e}")
            break
        
        # STT
        print(f"🎤 STT: Transcribing...")
        try:
            transcribed, stt_time = stt(wav_data)
            print(f"   ✅ {stt_time:.1f}s → {word_count(transcribed)} words")
        except Exception as e:
            print(f"   ❌ STT failed: {e}")
            break
        
        # Calculate metrics
        sim_to_original = similarity(transcribed, original) * 100
        sim_to_previous = similarity(transcribed, current_text) * 100
        
        print(f"\n📊 Metrics:")
        print(f"   Similarity to original:  {sim_to_original:.1f}%")
        print(f"   Similarity to previous:  {sim_to_previous:.1f}%")
        print(f"   Word count drift: {word_count(original)} → {word_count(transcribed)}")
        
        # Show text changes
        if cycle <= 3 or cycle == cycles:
            print(f"\n📝 Current text:")
            print(f"   {transcribed[:150]}...")
        
        results.append({
            "cycle": cycle,
            "tts_time": tts_time,
            "stt_time": stt_time,
            "words": word_count(transcribed),
            "sim_to_original": sim_to_original,
            "sim_to_previous": sim_to_previous,
            "text": transcribed,
        })
        
        current_text = transcribed
    
    # Final summary
    print(f"\n{'=' * 70}")
    print("FINAL SUMMARY")
    print(f"{'=' * 70}")
    
    if results:
        print(f"\n📊 Degradation over {len(results)} cycles:")
        print(f"   {'Cycle':<8} {'Words':<8} {'vs Original':<15} {'vs Previous':<15} {'TTS':<8} {'STT':<8}")
        print(f"   {'─' * 60}")
        for r in results:
            print(f"   {r['cycle']:<8} {r['words']:<8} {r['sim_to_original']:.1f}%{'':<9} {r['sim_to_previous']:.1f}%{'':<9} {r['tts_time']:.1f}s{'':<4} {r['stt_time']:.1f}s")
        
        # Overall stats
        final_sim = results[-1]["sim_to_original"]
        avg_tts = sum(r["tts_time"] for r in results) / len(results)
        avg_stt = sum(r["stt_time"] for r in results) / len(results)
        
        print(f"\n💡 Key Findings:")
        print(f"   Final similarity to original: {final_sim:.1f}%")
        print(f"   Average TTS time: {avg_tts:.1f}s")
        print(f"   Average STT time: {avg_stt:.1f}s")
        print(f"   Word count: {word_count(original)} → {results[-1]['words']}")
        
        print(f"\n📝 Original:")
        print(f"   {original[:200]}...")
        print(f"\n📝 After {len(results)} cycles:")
        print(f"   {results[-1]['text'][:200]}...")

if __name__ == "__main__":
    asyncio.run(run_integrity_test(cycles=10))
