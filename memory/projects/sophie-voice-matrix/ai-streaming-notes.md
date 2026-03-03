# AI Streaming Output Notes

**Created:** 2026-03-03 17:42 EST

## Current State

- Using Claude Sonnet via Anthropic API
- Currently waiting for full response before TTS
- Response time: 3-5s for short responses, 26-34s for 1000 words

## Requirement

**Stream AI output directly to TTS** - don't wait for full response.

### Benefits
- Start speaking sooner (first words in ~1s instead of waiting 3-5s)
- More natural conversation flow
- Can interrupt AI mid-thought

### Architecture

```
User speaks → STT → [partial text]
                      ↓
              Claude API (streaming)
                      ↓
              [token by token]
                      ↓
              Sentence buffer
                      ↓
              [complete sentence]
                      ↓
              TTS (streaming)
                      ↓
              Audio playback
                      ↓
              User interrupts? → Cancel everything
```

### Implementation Considerations

#### 1. Sentence Buffering
- Buffer tokens until we have a complete sentence
- Detect sentence boundaries: `.` `!` `?` followed by space/newline
- Don't start TTS on partial sentences (sounds choppy)

#### 2. Interruption Handling
- VAD running during playback
- If user speaks → cancel AI stream + cancel TTS + start listening
- Need clean cancellation (no half-words)

#### 3. Claude Streaming API
```python
async with client.messages.stream(
    model="claude-sonnet-4-20250514",
    max_tokens=300,
    messages=messages,
) as stream:
    async for text in stream.text_stream:
        # Buffer until sentence complete
        buffer += text
        if has_complete_sentence(buffer):
            sentence = extract_sentence(buffer)
            await tts_queue.put(sentence)
```

#### 4. TTS Queue
- Queue of sentences to speak
- TTS worker pulls from queue
- Can be cancelled mid-queue

### Latency Breakdown (Streamed)

| Phase | Time |
|-------|------|
| STT | 0.5-1s |
| AI first token | ~0.5s |
| AI to first sentence | ~1-2s |
| TTS first sentence | ~1-2s (if fast TTS) |
| **Total to first audio** | **~3-5s** |

Compare to current: ~10-12s

### Dependencies

- Need streaming TTS (Piper supports this)
- Need fast TTS (<2s for a sentence)
- Need robust VAD during playback
- Need clean cancellation

## Status

⏳ Waiting for TTS research to identify streaming-capable fast TTS
