#!/usr/bin/env python3
"""
Pipeline Benchmark - Test TTS, AI, STT with long-form content.
Cycles: TTS(1000 words) → AI(extend 1000) → STT → repeat
"""

import asyncio
import time
import os
import sys
import numpy as np
import aiohttp
import httpx
from pathlib import Path

# Load env
from dotenv import load_dotenv
load_dotenv(Path(__file__).parent / ".env")

KOKORO_URL = os.getenv("KOKORO_TTS_URL", "http://localhost:8880/v1")
KOKORO_VOICE = os.getenv("KOKORO_VOICE", "af_heart")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
WHISPER_MODEL = os.getenv("WHISPER_MODEL", "tiny.en")

# Results storage
results = []

async def tts_synthesize(text: str) -> tuple[bytes, float]:
    """TTS: text → audio, returns (wav_bytes, elapsed_seconds)"""
    start = time.time()
    async with aiohttp.ClientSession() as session:
        async with session.post(
            f"{KOKORO_URL}/audio/speech",
            json={
                "model": "kokoro",
                "input": text,
                "voice": KOKORO_VOICE,
                "response_format": "wav"
            },
            timeout=aiohttp.ClientTimeout(total=120)
        ) as resp:
            if resp.status == 200:
                wav_data = await resp.read()
                elapsed = time.time() - start
                return wav_data, elapsed
            else:
                error = await resp.text()
                raise Exception(f"TTS error {resp.status}: {error}")

async def ai_extend(text: str, target_words: int = 1000) -> tuple[str, float]:
    """AI: extend text by ~target_words, returns (extended_text, elapsed_seconds)"""
    start = time.time()
    async with httpx.AsyncClient(timeout=120.0) as client:
        response = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "Authorization": f"Bearer {ANTHROPIC_API_KEY}",
                "anthropic-version": "2023-06-01",
                "anthropic-beta": "oauth-2025-04-20",
                "content-type": "application/json",
            },
            json={
                "model": "claude-sonnet-4-20250514",
                "max_tokens": 2000,
                "system": "You are a creative storyteller. Continue the story naturally. Write approximately 1000 words. Do not use any markdown formatting - just plain prose.",
                "messages": [{"role": "user", "content": f"Continue this story with about {target_words} more words:\n\n{text}"}],
            }
        )
        response.raise_for_status()
        data = response.json()
        result = data["content"][0]["text"]
        elapsed = time.time() - start
        return result, elapsed

async def stt_transcribe(wav_data: bytes) -> tuple[str, float]:
    """STT: audio → text, returns (text, elapsed_seconds)"""
    import wave
    import io
    from faster_whisper import WhisperModel
    
    start = time.time()
    
    # Extract PCM from WAV
    with wave.open(io.BytesIO(wav_data), 'rb') as wav_file:
        sample_rate = wav_file.getframerate()
        pcm_data = wav_file.readframes(wav_file.getnframes())
    
    # Convert to float32 normalized
    audio = np.frombuffer(pcm_data, dtype=np.int16).astype(np.float32) / 32768.0
    
    # Resample to 16kHz if needed
    if sample_rate != 16000:
        from scipy.signal import resample
        num_samples = int(len(audio) * 16000 / sample_rate)
        audio = resample(audio, num_samples)
    
    # Transcribe
    model = WhisperModel(WHISPER_MODEL, device="cpu", compute_type="int8")
    segments, info = model.transcribe(audio, language="en", beam_size=1, best_of=1)
    text = " ".join([seg.text for seg in segments]).strip()
    
    elapsed = time.time() - start
    return text, elapsed

def word_count(text: str) -> int:
    return len(text.split())

async def run_benchmark(cycles: int = 3):
    """Run the full benchmark."""
    print("=" * 70)
    print("PIPELINE BENCHMARK")
    print("=" * 70)
    
    # Initial ~1000 word story seed
    story = """Once upon a time in a small village nestled between two great mountains, there lived a young inventor named Clara. She had wild curly hair that seemed to have a mind of its own, and bright eyes that sparkled with curiosity. Clara spent her days in her workshop, a converted barn filled with gears, springs, wires, and countless half-finished contraptions.

Her latest project was her most ambitious yet: a machine that could capture dreams and play them back like moving pictures. The villagers thought she was eccentric, perhaps even a little mad, but Clara knew that every great invention started as an impossible idea.

One stormy night, as lightning crackled across the sky, Clara made a breakthrough. She had finally figured out how to stabilize the dream crystals that would store the captured images. With trembling hands, she connected the final wire and threw the main switch.

The machine hummed to life, its brass gears turning smoothly, steam hissing from the pressure valves. The dream collector extended its antenna toward the sleeping village below, and Clara held her breath as the first wisps of dream energy began to flow through the copper tubes.

What she saw amazed her. Dreams of flying, of adventure, of love and loss and hope. The villagers' innermost thoughts and desires swirled together in a kaleidoscope of light and color. Clara laughed with pure joy, tears streaming down her face.

But then something unexpected happened. The machine began to pull in not just dreams, but nightmares too. Dark shapes formed in the collection chamber, shadows with teeth and claws, fears given terrible form. Clara scrambled to shut down the machine, but it was too late.

The nightmare creatures had already begun to seep through the cracks in the chamber, flowing like smoke into the night. Clara grabbed her emergency toolkit and her trusty wrench, determination setting her jaw. She had created this problem, and she would fix it.

She followed the trail of darkness down the mountain, toward the sleeping village, knowing that by morning everything would change. Either she would save her neighbors from the monsters she had unleashed, or she would fail trying.

The first house she reached was old Miller Thompson's cottage. Through the window, she could see a dark shape hovering over his bed, feeding on his peaceful slumber. Clara didn't hesitate. She burst through the door, wrench raised high, and charged at the nightmare creature with a battle cry that would have impressed any warrior.

The battle was fierce but brief. Clara discovered that the creatures, being made of dream stuff, were vulnerable to the same frequencies that powered her machine. She quickly modified her toolkit to emit a counter-harmonic, dissolving the nightmare into harmless mist.

But there were more creatures out there, dozens perhaps hundreds, and the night was still young. Clara ran from house to house, fighting nightmares, saving sleepers, her curly hair flying wild behind her. By the time dawn began to pink the eastern sky, she had protected every soul in the village.

Exhausted but triumphant, Clara returned to her workshop to properly shut down the dream machine and reinforce the collection chamber. She had learned a valuable lesson about the responsibility that comes with invention.

But she had also learned something else: within the nightmares, she had seen glimpses of the dreamers' deepest hopes, their hidden strengths, their capacity for courage. Even their fears contained the seeds of bravery."""

    print(f"\n📖 Starting story: {word_count(story)} words")
    
    for cycle in range(1, cycles + 1):
        print(f"\n{'='*70}")
        print(f"CYCLE {cycle}/{cycles}")
        print(f"{'='*70}")
        
        # TTS: story → audio
        print(f"\n🔊 TTS: Converting {word_count(story)} words to audio...")
        try:
            wav_data, tts_time = await tts_synthesize(story)
            audio_duration = len(wav_data) / (24000 * 2)  # Rough estimate (24kHz, 16-bit)
            print(f"   ✅ TTS complete: {tts_time:.1f}s for ~{audio_duration:.0f}s audio")
            print(f"   📊 TTS speed: {audio_duration/tts_time:.1f}x realtime")
        except Exception as e:
            print(f"   ❌ TTS failed: {e}")
            continue
        
        # AI: extend story
        print(f"\n🧠 AI: Extending story by ~1000 words...")
        try:
            extension, ai_time = await ai_extend(story[-2000:], 1000)  # Use last ~2000 chars for context
            print(f"   ✅ AI complete: {ai_time:.1f}s, added {word_count(extension)} words")
        except Exception as e:
            print(f"   ❌ AI failed: {e}")
            continue
        
        # STT: audio → text
        print(f"\n🎤 STT: Transcribing audio back to text...")
        try:
            transcribed, stt_time = await stt_transcribe(wav_data)
            print(f"   ✅ STT complete: {stt_time:.1f}s, got {word_count(transcribed)} words")
            print(f"   📊 STT speed: {audio_duration/stt_time:.1f}x realtime")
        except Exception as e:
            print(f"   ❌ STT failed: {e}")
            continue
        
        # Update story for next cycle
        story = story + "\n\n" + extension
        
        # Record results
        results.append({
            "cycle": cycle,
            "input_words": word_count(story) - word_count(extension),
            "tts_time": tts_time,
            "ai_time": ai_time,
            "stt_time": stt_time,
            "audio_duration": audio_duration,
            "output_words": word_count(extension),
            "transcribed_words": word_count(transcribed),
        })
        
        print(f"\n📊 Cycle {cycle} Summary:")
        print(f"   TTS: {tts_time:.1f}s | AI: {ai_time:.1f}s | STT: {stt_time:.1f}s")
        print(f"   Total: {tts_time + ai_time + stt_time:.1f}s")
    
    # Final summary
    print(f"\n{'='*70}")
    print("FINAL SUMMARY")
    print(f"{'='*70}")
    print(f"\n📖 Final story: {word_count(story)} words")
    
    if results:
        avg_tts = sum(r["tts_time"] for r in results) / len(results)
        avg_ai = sum(r["ai_time"] for r in results) / len(results)
        avg_stt = sum(r["stt_time"] for r in results) / len(results)
        avg_total = avg_tts + avg_ai + avg_stt
        
        print(f"\n📊 Average times per cycle:")
        print(f"   TTS: {avg_tts:.1f}s")
        print(f"   AI:  {avg_ai:.1f}s")
        print(f"   STT: {avg_stt:.1f}s")
        print(f"   ────────────")
        print(f"   Total: {avg_total:.1f}s")
        
        print(f"\n💡 Bottleneck: ", end="")
        if avg_tts > avg_ai and avg_tts > avg_stt:
            print("TTS (Kokoro)")
        elif avg_ai > avg_tts and avg_ai > avg_stt:
            print("AI (Claude)")
        else:
            print("STT (Whisper)")

if __name__ == "__main__":
    print("Loading Whisper model (one-time cost)...")
    from faster_whisper import WhisperModel
    model = WhisperModel(WHISPER_MODEL, device="cpu", compute_type="int8")
    print("Model loaded.\n")
    
    asyncio.run(run_benchmark(cycles=3))
