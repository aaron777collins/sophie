# Bible Drawing Pipeline

**Created:** [2026-02-07 12:26 EST]
**Status:** Active
**Location:** `~/bible-drawing-pipeline/`

## Overview

Automated video editing pipeline for Aaron's Bible drawing project. Takes hour-long OBS screen recordings and produces polished 10-15 minute YouTube videos.

## What Aaron Does

1. Records in OBS with Bible text + drawing already framed in 16:9
2. Drops video in `~/bible-drawing-pipeline/input/` or sends to Sophie
3. Gets back edited video + subtitles + transcript + thumbnail

## Pipeline Stages

1. **Silence Removal** - Auto-Editor cuts dead air
2. **Transcription** - Whisper generates text with word-level timestamps
3. **Filler Word Detection** - Identifies "um", "uh", etc.
4. **Subtitle Generation** - Creates .srt for YouTube
5. **Audio Normalization** - -14 LUFS broadcast standard
6. **Thumbnail Extraction** - Auto-grabs nice frame
7. **Final Export** - YouTube-optimized MP4

## Commands

```bash
bdp process <video>      # Process single video
bdp watch --daemon       # Start folder watcher
bdp watch --stop         # Stop watcher
bdp status               # Show status
```

## Technical Details

- **Tools:** Auto-Editor 29.3.1, Whisper, ffmpeg 8.0
- **Virtual env:** `~/bible-drawing-pipeline/venv/`
- **Config:** `~/bible-drawing-pipeline/config.sh`

## History

- [2026-02-07 12:26 EST] Pipeline created and installed
