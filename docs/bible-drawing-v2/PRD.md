# Bible Drawing Video Pipeline V2 - Product Requirements Document

**Version:** 2.0  
**Author:** Sophie (AI Assistant)  
**Date:** 2025-02-28  
**Status:** Draft  

---

## Executive Summary

Bible Drawing Video Pipeline V2 transforms Aaron's existing CLI-based video processing pipeline into a comprehensive, self-hosted web application for creating polished Bible drawing videos from raw OBS recordings. The system will enable Aaron to upload hour-long recordings, automatically process them, edit transcripts to edit video, and produce coherent ~10 minute videos with AI assistance.

---

## Problem Statement

### Current State
Aaron records himself drawing Bible scenes while narrating scripture. These recordings are typically 30-60 minutes of raw footage containing:
- Long silences during drawing
- Background noise
- Filler words ("um", "uh")
- Tangential discussions
- Multiple takes of the same passages

The existing CLI pipeline (`~/bible-drawing-pipeline/`) handles basic silence removal and transcription but lacks:
- Web-based interface for easier management
- Ability to combine multiple video segments
- Transcript-based editing (edit text → edit video)
- AI-assisted content curation
- Version history and rollback
- Conversational revision workflow

### Desired State
A web application where Aaron can:
1. Upload multiple video files with proper authentication
2. View and edit transcripts to control video output
3. Get AI suggestions for creating coherent 10-minute episodes
4. Chat with Sophie for iterative revisions
5. Export final YouTube-ready videos with subtitles

---

## Goals & Success Metrics

### Primary Goals
1. **Reduce editing time** from hours to minutes per video
2. **Enable transcript-based editing** - editing text should edit video
3. **AI-powered curation** - automatically suggest best segments
4. **Version control** - never lose work, always be able to rollback
5. **Conversational workflow** - chat with Sophie for revisions

### Success Metrics
| Metric | Current | Target |
|--------|---------|--------|
| Time to produce 10-min video | 2+ hours manual | <30 minutes |
| Videos produced per week | 1-2 | 5+ |
| Manual editing required | High | Minimal |
| Risk of lost work | High | Zero |

---

## User Personas

### Primary User: Aaron (Content Creator)
- Records Bible drawing videos with OBS
- Comfortable with technology but prefers not to use complex video editors
- Values efficiency and simplicity
- Wants to focus on content, not editing
- Already familiar with current CLI pipeline
- Prefers conversational interface with Sophie

### Secondary User: Sophie (AI Assistant)
- Processes videos, suggests edits, executes revisions
- Needs API access to video processing capabilities
- Should be able to handle revision requests conversationally

---

## Feature Requirements

### P0 - Must Have (MVP)

#### 1. Authentication System
- **Secure login** with username/password (not HTTP Basic Auth)
- Single user initially (Aaron), extensible to multi-user
- Session management with secure tokens
- Password reset capability
- Rate limiting on login attempts

#### 2. Video Upload & Management
- **Multi-file upload** with drag-and-drop support
- Progress indicators for large uploads
- Support for common formats: MP4, MKV, MOV, WebM
- File size limit: 10GB per file
- Auto-detection of video metadata (duration, resolution, codec)
- Upload queue management

#### 3. Video Processing Pipeline
- **Silence removal** using Auto-Editor (existing functionality)
- **Background noise reduction** using FFmpeg filters
- **Audio normalization** to broadcast standards (-14 LUFS)
- **Transcription** using local Whisper
- Progress tracking with percentage and stage indicators
- Support for combining multiple segments in order

#### 4. Transcript Editor
- **Display transcript with word-level timestamps**
- **Strikethrough editing**: crossed-out text = cut from video
- Visual indication of currently playing segment
- Playback synchronized with transcript highlighting
- Show removed sections (grayed out, expandable)
- Undo/redo support

#### 5. Video Preview
- In-browser video player
- Sync with transcript editor
- Basic controls: play, pause, seek, speed adjustment
- Preview cut points before export

### P1 - Should Have

#### 6. AI-Assisted Editing
- **Analyze transcript for content themes**
- **Suggest 10-minute episode cuts** from longer recordings
- Identify best segments based on:
  - Audio clarity
  - Content coherence
  - Narrative flow
- Flag potential issues (audio dropout, long silence, mumbling)
- Natural language commands: "Make this section about Genesis 1"

#### 7. Version History
- **Git-like versioning** for edits
- Space-efficient storage (diffs, not full copies)
- Named save points (manual commits)
- Auto-save with intelligent checkpointing
- Rollback to any previous version
- Branch and merge for experimental edits

#### 8. Chat Interface
- **In-app chat with Sophie**
- Context-aware of current project
- Commands like:
  - "Remove all the parts where I cough"
  - "Make this shorter, around 8 minutes"
  - "Focus on the drawing of David and Goliath"
- Real-time edit application
- Revision history tied to chat messages

### P2 - Nice to Have

#### 9. Export & Publishing
- YouTube-optimized export presets
- Automatic thumbnail generation
- SRT/VTT subtitle files
- Multiple quality options
- Direct YouTube upload (future)

#### 10. Analytics & Insights
- Processing time statistics
- Content coverage analysis
- Speaking pace analysis
- Common filler word patterns

---

## Technical Requirements

### Performance
- Video upload: Support files up to 10GB
- Processing: Handle 60+ minute videos
- Transcription: Near real-time (1hr video in <30 min)
- UI responsiveness: <100ms for transcript edits
- Export: Full quality 1080p/30fps minimum

### Reliability
- Crash recovery: Resume processing after failure
- Data integrity: Never lose uploaded or edited content
- Backup: Automated backup of all projects

### Security
- Secure authentication (no plain HTTP)
- All API endpoints authenticated
- Secure file storage
- No external data transmission (self-hosted)

### Scalability
- Support for 100+ projects
- 1TB+ total storage
- Single server deployment initially

---

## Constraints

### Technical Constraints
- Must run on existing server infrastructure
- Self-hosted only (no cloud dependencies)
- Must work with existing FFmpeg and Whisper installations
- Linux server environment (Ubuntu)

### Business Constraints
- Single developer (Aaron + Sophie)
- No budget for paid services
- Timeline: Working MVP within 2-4 weeks

### Integration Constraints
- Must integrate with Sophie (Clawdbot) for chat interface
- Must preserve existing CLI functionality (backward compatible)

---

## Out of Scope (V2)

- Multi-user collaboration
- Real-time collaborative editing
- Mobile app
- Cloud deployment
- Monetization features
- Public sharing/embedding
- Live streaming integration

---

## User Flows

### Flow 1: Basic Video Processing
```
1. Aaron logs in to web interface
2. Drags raw OBS recording to upload area
3. System shows upload progress
4. System automatically starts processing:
   - Silence removal
   - Transcription
   - Audio normalization
5. Aaron sees transcript appear as processing completes
6. Aaron reviews and edits transcript
7. Aaron exports final video
```

### Flow 2: AI-Assisted Episode Creation
```
1. Aaron uploads hour-long recording
2. System processes and transcribes
3. Aaron asks Sophie: "Create a 10-minute video about Moses"
4. Sophie analyzes transcript, suggests segment cuts
5. Aaron reviews suggested edits in transcript editor
6. Aaron refines: "Include the part about the burning bush"
7. Sophie adjusts, shows updated preview
8. Aaron approves and exports
```

### Flow 3: Revision Workflow
```
1. Aaron exports video, watches it
2. Opens project, chats with Sophie: "Too much silence at 3:45"
3. Sophie makes edit, shows diff
4. Aaron: "Actually, undo that, but remove the coughing at 5:20"
5. Sophie rolls back, makes new edit
6. Aaron exports new version
7. Can always go back to any previous version
```

---

## Acceptance Criteria Overview

### MVP Acceptance Criteria
- [ ] User can log in with secure credentials
- [ ] User can upload multiple video files
- [ ] Videos are automatically processed (silence removal + transcription)
- [ ] User can view and edit transcript
- [ ] Editing transcript updates video output
- [ ] User can export processed video
- [ ] All tests pass (unit, integration, E2E)

### Quality Requirements
- [ ] 100% test coverage on critical paths
- [ ] E2E tests with Playwright for all user flows
- [ ] Responsive design (works on desktop, tablet)
- [ ] Accessibility: keyboard navigation, screen reader support
- [ ] Performance: Page load <2s, edit response <100ms

---

## Appendix

### Existing Pipeline Components to Reuse
From `~/bible-drawing-pipeline/`:
- `process-video.sh` - Core processing logic
- Auto-Editor integration for silence removal
- Whisper integration for transcription
- FFmpeg audio normalization
- Subtitle generation

### Technology Stack Recommendations
- **Frontend:** Next.js 14+ with App Router
- **Auth:** NextAuth.js with credentials provider
- **Video:** FFmpeg, Auto-Editor
- **Transcription:** OpenAI Whisper (local)
- **AI Editing:** Claude API for transcript analysis
- **Storage:** Local filesystem with git-like versioning
- **Testing:** Playwright + Vitest
- **Styling:** Tailwind CSS

---

*Document created: 2025-02-28*  
*Last updated: 2025-02-28*
