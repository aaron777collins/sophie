# Phase 1: Bible Drawing V2 MVP Foundation

**Project:** Bible Drawing Video Pipeline V2  
**Parent:** Bible Drawing V2 Master Plan  
**Created:** 2026-03-01 20:02 EST  
**Author:** Coordinator  
**Version:** 2  
**Status:** revised (addressing review feedback)  

## Changes from v1

**Review Feedback Addressed:**
- ✅ Added Category 0: Project Foundation (6 tasks)
- ✅ Added Category 6: Video Preview System (4 tasks)
- ✅ Fixed critical dependency flows (processing → upload connection)
- ✅ Moved security tasks to Sonnet (p1-1-d, p1-1-f, p1-2-e)
- ✅ Added specific, testable acceptance criteria
- ✅ Split oversized tasks (Auto-Editor, Dashboard, Transcript)
- ✅ Added TDD task structure with test-first approach

---

## Phase Goals

Establish the foundational MVP for Bible Drawing V2 - a secure, web-based video editing platform that enables Aaron to upload raw OBS recordings, automatically process them through silence removal and transcription, edit videos by editing text transcripts, preview changes in real-time, and export YouTube-ready content.

**Success Criteria:**
- [ ] Aaron can securely log in with session lasting 24 hours
- [ ] Aaron can upload video files up to 10GB with progress display
- [ ] Videos are automatically processed (silence removal + transcription) in background
- [ ] Aaron can edit transcripts with immediate visual feedback
- [ ] Video preview syncs with transcript highlighting
- [ ] Aaron can export final processed videos with subtitles

## Prerequisites

- [ ] Server access (dev2 or equivalent)
- [ ] FFmpeg installed on server
- [ ] Whisper (local) installed on server
- [ ] Auto-Editor installed on server
- [ ] Node.js 18+ available

---

## Task Categories

### Category 0: Project Foundation (MUST COMPLETE FIRST)

| Task ID | Description | Model | Depends On |
|---------|-------------|-------|------------|
| p1-0-a | Initialize Bible Drawing V2 repository | Haiku | - |
| p1-0-b | Configure Next.js 14 with App Router | Sonnet | p1-0-a |
| p1-0-c | Setup Tailwind CSS and base styling | Haiku | p1-0-b |
| p1-0-d | Configure test frameworks (Vitest + Playwright) | Sonnet | p1-0-b |
| p1-0-e | Setup file storage directory structure | Haiku | p1-0-a |
| p1-0-f | Create development environment config | Sonnet | p1-0-d |

**Acceptance Criteria:**
- [ ] Repository exists at `/home/ubuntu/repos/bible-drawing-v2`
- [ ] `pnpm dev` starts development server on port 3000
- [ ] `pnpm test` runs Vitest unit tests (0 failures on empty suite)
- [ ] `pnpm test:e2e` runs Playwright tests
- [ ] `/uploads` directory exists with proper permissions
- [ ] `.env.local`, `.env.test` configs created

---

### Category 1: Authentication Foundation

| Task ID | Description | Model | Depends On |
|---------|-------------|-------|------------|
| p1-1-a | Setup NextAuth.js credentials provider | Sonnet | p1-0-f |
| p1-1-b | Create user login/logout UI components | Sonnet | p1-1-a |
| p1-1-c | Implement session management with 24h expiry | Sonnet | p1-1-b |
| p1-1-d | Add protected route middleware | **Sonnet** | p1-1-c |
| p1-1-e | Create password reset flow | Sonnet | p1-1-c |
| p1-1-f | Implement rate limiting (5 failures = lockout) | **Sonnet** | p1-1-a |

**Acceptance Criteria:**
- [ ] User can log in with valid credentials in <2 seconds
- [ ] Invalid login attempts are rate limited after 5 failures
- [ ] Session expires after 24 hours of inactivity
- [ ] Protected routes redirect to `/login` when not authenticated
- [ ] Password reset emails can be sent (or displayed for single-user mode)
- [ ] E2E test passes: login → dashboard → logout flow

---

### Category 2: Video Upload System

| Task ID | Description | Model | Depends On |
|---------|-------------|-------|------------|
| p1-2-a | Create project creation UI | Sonnet | p1-1-d |
| p1-2-b | Implement drag-drop upload component | Sonnet | p1-2-a |
| p1-2-c | Add upload progress indicators with ETA | Sonnet | p1-2-b |
| p1-2-d | Support multiple file uploads with queue | Sonnet | p1-2-c |
| p1-2-e | Add file validation (size/type/security) | **Sonnet** | p1-2-b |
| p1-2-f | Create upload queue management | Sonnet | p1-2-d |
| p1-2-g-1 | Build dashboard layout and navigation | Sonnet | p1-2-a |
| p1-2-g-2 | Create project list component | Sonnet | p1-2-g-1 |
| p1-2-g-3 | Add project status indicators | Sonnet | p1-2-g-2, p1-2-f |

**Acceptance Criteria:**
- [ ] User can create new projects with name and description
- [ ] User can drag MP4, MKV, MOV, WebM files to upload area
- [ ] Files up to 10GB are accepted; larger files rejected with message
- [ ] Upload progress shows percentage, speed, and ETA
- [ ] User can cancel uploads in progress
- [ ] Dashboard shows all projects with processing status
- [ ] E2E test passes: create project → upload file → see in dashboard

---

### Category 3: Video Processing Pipeline

| Task ID | Description | Model | Depends On |
|---------|-------------|-------|------------|
| p1-3-a | Create processing job queue system | Sonnet | p1-2-f |
| p1-3-b-1 | Research Auto-Editor CLI interface | Sonnet | p1-3-a |
| p1-3-b-2 | Create Auto-Editor wrapper service | Sonnet | p1-3-b-1 |
| p1-3-b-3 | Integrate wrapper into job queue | Sonnet | p1-3-b-2 |
| p1-3-c | Add FFmpeg audio normalization (-14 LUFS) | Sonnet | p1-3-b-3 |
| p1-3-d-1 | Research Whisper CLI integration | Sonnet | p1-3-a |
| p1-3-d-2 | Create Whisper transcription wrapper | Sonnet | p1-3-d-1 |
| p1-3-d-3 | Store transcripts with word-level timestamps | Sonnet | p1-3-d-2 |
| p1-3-e | Build progress tracking UI | Sonnet | p1-3-a |
| p1-3-f | Add segment combination logic | Sonnet | p1-3-c |
| p1-3-g | Create processing configuration options | Haiku | p1-3-a |

**Acceptance Criteria:**
- [ ] Uploaded videos automatically start processing within 30 seconds
- [ ] Silence removal completes without errors (Auto-Editor)
- [ ] Audio normalized to -14 LUFS broadcast standard
- [ ] Transcription completes with word-level timestamps
- [ ] Progress UI shows current stage and percentage
- [ ] Failed jobs show clear error messages
- [ ] E2E test passes: upload → processing starts → progress visible

---

### Category 4: Transcript Editor

| Task ID | Description | Model | Depends On |
|---------|-------------|-------|------------|
| p1-4-a-1 | Create transcript data models | Sonnet | p1-3-d-3 |
| p1-4-a-2 | Build transcript display component | Sonnet | p1-4-a-1 |
| p1-4-b | Implement strikethrough editing | Sonnet | p1-4-a-2 |
| p1-4-c | Add video sync highlighting | Sonnet | p1-4-a-2, p1-6-b |
| p1-4-d | Show removed sections toggle | Sonnet | p1-4-b |
| p1-4-e | Implement undo/redo system | Sonnet | p1-4-b |
| p1-4-f | Add quick action toolbar | Sonnet | p1-4-e |
| p1-4-g | Create search within transcript | Sonnet | p1-4-a-2 |

**Acceptance Criteria:**
- [ ] Transcript displays with word-level clickable segments
- [ ] Clicking text adds strikethrough styling
- [ ] Struck text is excluded from video timeline calculation
- [ ] Current playback position highlights in transcript
- [ ] "Show removed" toggle displays struck text (grayed)
- [ ] Undo/redo works for all edit actions (Ctrl+Z/Y)
- [ ] Search finds and highlights text in transcript
- [ ] E2E test passes: edit transcript → see changes in timeline

---

### Category 5: Video Export

| Task ID | Description | Model | Depends On |
|---------|-------------|-------|------------|
| p1-5-a | Basic video export functionality | Sonnet | p1-4-b, p1-3-f |
| p1-5-b | YouTube quality presets (1080p, 720p) | Haiku | p1-5-a |
| p1-5-c | Subtitle file generation (SRT/VTT) | Sonnet | p1-5-a |
| p1-5-d | Thumbnail generation from video frame | Sonnet | p1-5-a |
| p1-5-e | Export history tracking | Sonnet | p1-5-a |

**Acceptance Criteria:**
- [ ] User can export video with current edits applied
- [ ] Export includes only non-struck transcript segments
- [ ] YouTube presets produce compatible 1080p/30fps output
- [ ] SRT and VTT subtitle files generated alongside video
- [ ] Thumbnail can be selected from video frames
- [ ] Export history shows all previous exports with timestamps
- [ ] E2E test passes: full workflow → export → file accessible

---

### Category 6: Video Preview System (NEW)

| Task ID | Description | Model | Depends On |
|---------|-------------|-------|------------|
| p1-6-a | Create HTML5 video player component | Sonnet | p1-2-a |
| p1-6-b | Implement transcript-video synchronization | Sonnet | p1-6-a, p1-4-a-2 |
| p1-6-c | Add playback controls (play/pause/seek/speed) | Sonnet | p1-6-b |
| p1-6-d | Preview cut segments during editing | Sonnet | p1-6-c, p1-4-b |

**Acceptance Criteria:**
- [ ] Video player displays uploaded/processed video
- [ ] Clicking transcript text seeks video to that timestamp
- [ ] Playing video highlights current word in transcript
- [ ] Basic controls: play/pause, seek bar, speed adjustment (0.5x-2x)
- [ ] Preview mode shows only non-struck content
- [ ] E2E test passes: play video → click transcript → video seeks

---

## Dependency Graph

```
FOUNDATION (Must Complete First):
p1-0-a ─► p1-0-b ─► p1-0-c
              ├──► p1-0-d ─► p1-0-f
              └──► p1-0-e

AUTHENTICATION:
p1-0-f ─► p1-1-a ─► p1-1-b ─► p1-1-c ─► p1-1-d
              │           └── p1-1-e
              └── p1-1-f

UPLOAD SYSTEM:
p1-1-d ─► p1-2-a ─► p1-2-b ─► p1-2-c ─► p1-2-d ─► p1-2-f ─► p1-3-a
              │         │                               │
              │         └── p1-2-e                      │
              └─► p1-2-g-1 ─► p1-2-g-2 ─► p1-2-g-3 ◄───┘

PROCESSING:
p1-2-f ─► p1-3-a ─► p1-3-b-1 ─► p1-3-b-2 ─► p1-3-b-3 ─► p1-3-c ─► p1-3-f
              │                                                       │
              ├─► p1-3-d-1 ─► p1-3-d-2 ─► p1-3-d-3 ─► p1-4-a-1       │
              ├─► p1-3-e                                              │
              └─► p1-3-g                                              │
                                                                      ▼
VIDEO PREVIEW:                                                    p1-5-a
p1-2-a ─► p1-6-a ─► p1-6-b ─► p1-6-c ─► p1-6-d                       │
              │         │                   │                        │
              │         ▼                   ▼                        │
TRANSCRIPT:   └────► p1-4-a-2 ─► p1-4-b ─► p1-4-d                   │
                         │          │   └── p1-4-e ─► p1-4-f         │
                         │          │                                │
                         └── p1-4-c ◄─────────────────────────────────
                         └── p1-4-g

EXPORT:
p1-3-f + p1-4-b ─► p1-5-a ─► p1-5-b
                       ├──► p1-5-c
                       ├──► p1-5-d
                       └──► p1-5-e
```

---

## Testing Requirements

### Test-Driven Development (TDD) - MANDATORY

**Every task MUST follow this structure:**

```markdown
### Task Example: p1-4-b TDD - Strikethrough Text Editing

**TDD Steps:**
1. **RED:** Write failing tests FIRST
   - [ ] Test: Clicking text adds strikethrough class
   - [ ] Test: Struck text excluded from timeline calculation
   - [ ] E2E: User can strike text and see visual change

2. **GREEN:** Implement minimal solution
   - [ ] Component code to pass tests

3. **REFACTOR:** Improve without breaking tests
   - [ ] Optimize, add accessibility
```

### Required Test Coverage

| Category | Unit Tests | E2E Tests | Performance |
|----------|------------|-----------|-------------|
| Foundation | Setup validation | - | Build <30s |
| Auth | Login/logout, session | Full auth flow | Login <2s |
| Upload | File validation, queue | Upload + progress | 10GB upload stable |
| Processing | Queue, CLI wrappers | Processing flow | 60min video <30min |
| Transcript | Edit logic, sync | Edit workflow | Edit response <100ms |
| Preview | Player, sync | Play + seek | Sync lag <200ms |
| Export | Export logic | Full export flow | 10min video <5min export |

### Screenshot Requirements

Every validation requires Playwright screenshots at:
- **Desktop:** 1920x1080
- **Tablet:** 768x1024  
- **Mobile:** 375x667

**Storage:** `scheduler/validation/screenshots/bible-drawing-v2/{task-id}/`

---

## Deliverables

### Category 0: Project Foundation
- [ ] Repository initialized with Next.js 14 + Tailwind
- [ ] Test frameworks configured (Vitest + Playwright)
- [ ] File storage directories with proper permissions
- [ ] Environment configurations for dev/test

### Category 1: Secure Authentication System
- [ ] User can log in with valid credentials in <2 seconds
- [ ] Invalid attempts rate limited (5 failures = 15min lockout)
- [ ] Sessions expire after 24 hours of inactivity
- [ ] Protected routes redirect to login when not authenticated

### Category 2: Video Upload Interface
- [ ] Drag-drop upload accepts MP4, MKV, MOV, WebM up to 10GB
- [ ] Upload progress shows percentage, speed, and ETA
- [ ] Failed/cancelled uploads can be retried
- [ ] Dashboard shows all projects with current status

### Category 3: Automated Processing Pipeline
- [ ] Videos auto-process within 30s of upload completion
- [ ] Silence removal via Auto-Editor integration
- [ ] Audio normalized to -14 LUFS broadcast standard
- [ ] Transcription with word-level timestamps via Whisper
- [ ] Progress UI shows stage and percentage

### Category 4: Transcript Editor
- [ ] Transcript displays with clickable word segments
- [ ] Strikethrough editing removes text from video timeline
- [ ] Undo/redo for all edit actions
- [ ] Search finds text in transcript
- [ ] Current playback highlights in transcript

### Category 5: Video Export System
- [ ] Export produces YouTube-ready 1080p/30fps output
- [ ] SRT/VTT subtitle files generated
- [ ] Thumbnail selection from video frames
- [ ] Export history with timestamps

### Category 6: Video Preview System
- [ ] Video player with play/pause/seek/speed controls
- [ ] Transcript-video synchronization (bidirectional)
- [ ] Preview mode shows only non-struck content
- [ ] Sync lag <200ms

---

## Review History

- **v1:** 2026-03-01 20:02 EST - Initial phase breakdown from Master Plan
- **v2:** 2026-03-01 20:35 EST - Major revision addressing reviewer feedback:
  - Added Category 0 (Foundation) and Category 6 (Preview)
  - Fixed dependency flows
  - Moved security tasks to Sonnet
  - Added specific acceptance criteria
  - Split oversized tasks
  - Added TDD structure

---

## Estimated Timeline

**Total Tasks:** 40 tasks across 7 categories  
**Concurrent Workers:** 2 (per Coordinator slot limit)  
**Estimated Duration:** 4-5 weeks  

**Critical Path:**
```
Foundation (Week 1) → Auth (Week 1-2) → Upload (Week 2) → 
Processing (Week 2-3) → Transcript + Preview (Week 3-4) → Export (Week 4-5)
```

**Risk Factors:**
- Auto-Editor/Whisper integration complexity
- Large file upload stability
- Real-time transcript-video sync performance

---

**Status:** Ready for Person Manager approval