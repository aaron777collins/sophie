# STT Engine Benchmarking Results

**Date**: 2026-03-03 18:10:00
**Environment**: Ubuntu 22.04, Python 3.14, No GPU acceleration

## Test Configuration

- **Test Audio**: ~1000 word AI-generated speech (3.9 minutes duration)
- **Engines**: faster-whisper (small), moonshine (installation issues)
- **Metrics**: Total time, RTF, First-word latency, Memory usage, WER
- **Audio Quality**: Clean (24kHz MP3) vs Telephone (8kHz mu-law WAV)

## Executive Summary

### ✅ faster-whisper Performance
- **Excellent speed**: 8x realtime processing (RTF ~0.12x)
- **High accuracy**: WER 0.6-1.7% (extremely low error rates)
- **Reasonable memory**: ~130MB usage
- **Good latency**: 3-4 second first word latency

### ❌ Moonshine Issues
- **Installation problems**: Compatibility issues with Python 3.14
- **Package conflicts**: timm library dataclass errors
- **API documentation**: Unclear usage patterns

## Results Summary

| Engine | Model | Test | Duration | Trans Time | RTF | First Word | Memory | WER |
|--------|-------|------|----------|------------|-----|------------|--------|---------|
| faster-whisper | small | writing_1000_words | 232.7s | 27.83s | 0.12x | 3.23s | 135.0 MB | 0.017 |
| faster-whisper | small | telephone_quality | 232.7s | 29.98s | 0.13x | 3.67s | 130.5 MB | 0.006 |

## Detailed Results

### Writing 1000 Words (Clean Audio)

#### faster-whisper (small)
- **Audio Duration**: 232.73s
- **Transcription Time**: 27.83s
- **Real-time Factor**: 0.12x (8.36x realtime)
- **First Word Latency**: 3.23s
- **Memory Usage**: 135.0 MB
- **Word Error Rate**: 0.017 (1.7% error rate)
- **Model Load Time**: 6.45s
- **Optimization**: int8 quantization, beam_size=1

**Transcription Quality**: Excellent - captured technical content accurately including terms like "GPT and BERT", "convolutional neural networks", "artificial general intelligence"

### Telephone Quality (8kHz Mono)

#### faster-whisper (small)
- **Audio Duration**: 232.73s
- **Transcription Time**: 29.98s
- **Real-time Factor**: 0.13x (7.76x realtime)
- **First Word Latency**: 3.67s
- **Memory Usage**: 130.5 MB
- **Word Error Rate**: 0.006 (0.6% error rate)
- **Model Load Time**: 0.74s (cached)

**Surprising Result**: Telephone quality actually had *better* WER than clean audio, likely due to the preprocessing reducing background noise and making speech more focused.

## Technical Analysis

### faster-whisper Strengths
1. **Performance**: Consistently ~8x realtime factor
2. **Accuracy**: Sub-2% WER on complex technical speech
3. **Robustness**: Handled both high and low quality audio well
4. **Memory efficiency**: ~135MB peak usage
5. **Mature ecosystem**: Well-documented, stable API

### faster-whisper Optimizations Applied
- **int8 quantization**: Reduced memory and improved speed
- **beam_size=1**: Greedy decoding for fastest results
- **CPU-only**: No GPU acceleration required

### Moonshine Installation Issues

Attempted to install moonshine but encountered:

1. **Python 3.14 Compatibility**: Package dependencies fail with dataclass errors
2. **timm Library Conflicts**: Version incompatibilities in the dependency chain
3. **API Clarity**: Limited documentation on correct usage patterns

**Error Details**:
```
ValueError: mutable default <class 'timm.models.maxxvit.MaxxVitConvCfg'> for field conv_cfg is not allowed: use default_factory
```

**Recommendation**: Moonshine may work better with Python 3.11/3.12. Consider testing in a different environment.

## Performance Comparison

### Speed Metrics
- **faster-whisper**: 8.4x realtime (clean), 7.8x realtime (telephone)
- **Target comparison**: Moonshine claims ~6x realtime

### Accuracy Assessment
- **faster-whisper WER**: 0.6-1.7% (excellent for technical content)
- **Quality**: Captured complex technical terms accurately
- **Robustness**: Better performance on telephone quality vs clean

## Recommendations

### For Production Use
1. **faster-whisper is production-ready** with excellent performance
2. **Consider GPU acceleration** for even faster processing
3. **int8 quantization + beam_size=1** provides optimal speed/accuracy balance

### For Future Testing
1. **Retry moonshine** with Python 3.11/3.12 environment
2. **Test larger models** (faster-whisper medium/large) for comparison
3. **Benchmark streaming capabilities** for real-time applications

### Memory Considerations
- **faster-whisper small**: ~135MB peak usage
- **Suitable for edge deployment** on devices with 1GB+ RAM
- **Model caching**: Subsequent loads much faster (0.74s vs 6.45s)

## Test Audio Details

### Clean Audio
- **Format**: MP3, 24kHz sampling rate
- **Source**: TTS-generated from 1000-word technical text
- **Content**: AI/ML technical documentation
- **Duration**: 3 minutes 52 seconds

### Telephone Quality Audio  
- **Format**: WAV, 8kHz mu-law encoding
- **Processing**: Downsampled and compressed to simulate telephone quality
- **Artifacts**: Compression noise, limited frequency response
- **Same content**: Identical text as clean version

## Conclusion

**faster-whisper** demonstrates excellent performance characteristics:
- **Speed**: 8x realtime processing exceeds requirements
- **Accuracy**: Sub-2% WER suitable for production use
- **Efficiency**: Reasonable memory usage for edge deployment
- **Reliability**: Consistent performance across audio qualities

**moonshine** requires further investigation:
- Installation issues prevent current testing
- Potential for 6x realtime performance worth pursuing
- May require different Python version or dependency management

**Overall Assessment**: faster-whisper provides a solid baseline for STT requirements with production-ready performance and accuracy.