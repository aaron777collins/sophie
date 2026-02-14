# Task: p6-9-media-duration

## Summary
- **Status:** in-progress
- **What it does:** Implement media duration extraction for audio/video files in Matrix media handling
- **What works:** Not yet implemented
- **What's broken:** No current media duration extraction

## Work Plan
- Investigate media libraries for duration extraction
- Implement library in `lib/matrix/media.ts`
- Add support for audio file duration
- Add support for video file duration
- Implement error handling for unsupported formats

## Libraries to Investigate
- [ffprobe (part of ffmpeg)]
- [node-ffmpeg]
- [fluent-ffmpeg]
- [mediainfo-js]

## Success Criteria
- [ ] Duration extracted for audio files
- [ ] Duration extracted for video files
- [ ] Duration displays correctly in chat attachments
- [ ] Proper error handling for unsupported formats
- [ ] No breaking changes to existing media functionality

## Decisions and Rationale
- TBD: Will add notes during implementation

## Work Log
- [2026-02-14 12:30 EST] Task initiated
- [2026-02-14 13:45 EST] Installed get-video-duration library
- [2026-02-14 14:00 EST] Implemented media duration extraction in getMediaInfo()
  - Added optional 'duration' field to MediaInfo type
  - Uses getDuration from get-video-duration library
  - Handles async import to avoid bundling entire library
  - Added error handling for cases where duration can't be extracted

## Technical Details
- Library: get-video-duration
- Approach: Use URL.createObjectURL to pass File to library
- Duration rounded to whole seconds
- Non-blocking: Logs warning if duration extraction fails
- Supports both video and audio file types

## Challenges Addressed
- Cross-browser compatibility
- Performance of duration extraction
- Minimal external library dependencies
- Graceful error handling

## Potential Challenges
- Handling various media formats
- Performance of duration extraction
- Cross-platform compatibility
- Error handling for corrupt or unsupported files