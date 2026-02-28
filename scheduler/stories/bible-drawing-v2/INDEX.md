# Bible Drawing Video Pipeline V2 - Stories Index

**Project:** Bible Drawing Video Pipeline V2  
**Status:** Planning Complete  
**Created:** 2025-02-28  

---

## Overview

This document indexes all Epics and User Stories for the Bible Drawing Video Pipeline V2 project.

### Project Goal

Transform Aaron's existing CLI-based video processing pipeline into a comprehensive web application for creating polished Bible drawing videos. Enable transcript-based editing, AI-assisted curation, and conversational revision workflow.

---

## Epic Summary

| Epic | Name | Priority | Stories | Points | Status |
|------|------|----------|---------|--------|--------|
| EPIC-01 | Authentication System | P0 (MVP) | 6 | 18 | Draft |
| EPIC-02 | Video Upload & Management | P0 (MVP) | 6 | 24 | Draft |
| EPIC-03 | Video Processing Pipeline | P0 (MVP) | 7 | 29 | Draft |
| EPIC-04 | Transcript Editor | P0 (MVP) | 7 | 37 | Draft |
| EPIC-05 | AI-Assisted Editing | P1 | 5 | 27 | Draft |
| EPIC-06 | Version History & Rollback | P1 | 7 | 33 | Draft |
| EPIC-07 | Chat Interface (Sophie) | P1 | 7 | 34 | Draft |
| EPIC-08 | Video Export & Publishing | P0 (MVP) | 7 | 27 | Draft |

**Total Stories:** 52  
**Total Points:** 229  

---

## MVP Scope (P0)

The MVP includes 4 epics with 26 stories totaling 108 points:

1. **Authentication** - Secure login, session management
2. **Video Upload** - Upload, organize, manage video segments
3. **Video Processing** - Silence removal, transcription, normalization
4. **Transcript Editor** - Edit text to edit video, sync playback
5. **Export** - Generate YouTube-ready files

### MVP Acceptance Criteria

- [ ] User can log in securely
- [ ] User can upload multiple video files
- [ ] Videos are automatically processed
- [ ] User can edit transcript (strikethrough = cut)
- [ ] Edits are reflected in exported video
- [ ] Subtitles and thumbnails are generated
- [ ] All E2E tests pass at 3 viewports

---

## Phase 2 Scope (P1)

Post-MVP features (3 epics, 19 stories, 94 points):

1. **AI-Assisted Editing** - Smart suggestions, natural language commands
2. **Version History** - Save points, rollback, branching
3. **Chat Interface** - Conversational editing with Sophie

---

## Dependency Graph

```
EPIC-01 (Auth)
    └── EPIC-02 (Upload)
            └── EPIC-03 (Processing)
                    └── EPIC-04 (Editor)
                            ├── EPIC-05 (AI)
                            ├── EPIC-06 (Versions)
                            ├── EPIC-07 (Chat)
                            └── EPIC-08 (Export)
```

---

## Story Index by Epic

### EPIC-01: Authentication System
| ID | Story | Points | Priority |
|----|-------|--------|----------|
| BDV2-US-1.1 | User Login | 5 | P0 |
| BDV2-US-1.2 | Session Management | 3 | P0 |
| BDV2-US-1.3 | User Logout | 2 | P0 |
| BDV2-US-1.4 | Protected Route Redirect | 2 | P0 |
| BDV2-US-1.5 | Rate Limiting | 3 | P1 |
| BDV2-US-1.6 | Change Password | 3 | P2 |

### EPIC-02: Video Upload & Management
| ID | Story | Points | Priority |
|----|-------|--------|----------|
| BDV2-US-2.1 | Create New Project | 3 | P0 |
| BDV2-US-2.2 | Upload Single Video | 5 | P0 |
| BDV2-US-2.3 | Upload Multiple Videos | 5 | P0 |
| BDV2-US-2.4 | View Upload Progress | 3 | P0 |
| BDV2-US-2.5 | Manage Video Segments | 5 | P0 |
| BDV2-US-2.6 | Project List Dashboard | 3 | P0 |

### EPIC-03: Video Processing Pipeline
| ID | Story | Points | Priority |
|----|-------|--------|----------|
| BDV2-US-3.1 | Automatic Processing Start | 3 | P0 |
| BDV2-US-3.2 | Silence Removal | 5 | P0 |
| BDV2-US-3.3 | Audio Normalization | 3 | P0 |
| BDV2-US-3.4 | Transcription Generation | 5 | P0 |
| BDV2-US-3.5 | Processing Progress Tracking | 5 | P0 |
| BDV2-US-3.6 | Processing Configuration | 3 | P1 |
| BDV2-US-3.7 | Combine Multiple Segments | 5 | P0 |

### EPIC-04: Transcript Editor
| ID | Story | Points | Priority |
|----|-------|--------|----------|
| BDV2-US-4.1 | Display Transcript | 5 | P0 |
| BDV2-US-4.2 | Select and Remove Text | 8 | P0 |
| BDV2-US-4.3 | Show Removed Sections | 5 | P0 |
| BDV2-US-4.4 | Video-Transcript Sync | 8 | P0 |
| BDV2-US-4.5 | Undo/Redo System | 5 | P0 |
| BDV2-US-4.6 | Quick Actions | 3 | P1 |
| BDV2-US-4.7 | Search and Navigation | 3 | P1 |

### EPIC-05: AI-Assisted Editing
| ID | Story | Points | Priority |
|----|-------|--------|----------|
| BDV2-US-5.1 | Analyze Transcript Content | 5 | P1 |
| BDV2-US-5.2 | Suggest Episode Cuts | 8 | P1 |
| BDV2-US-5.3 | Natural Language Commands | 8 | P1 |
| BDV2-US-5.4 | Content Quality Scoring | 3 | P2 |
| BDV2-US-5.5 | Title/Description Generation | 3 | P2 |

### EPIC-06: Version History & Rollback
| ID | Story | Points | Priority |
|----|-------|--------|----------|
| BDV2-US-6.1 | Auto-Save Versions | 5 | P1 |
| BDV2-US-6.2 | Create Named Save Points | 3 | P1 |
| BDV2-US-6.3 | View Version History | 5 | P1 |
| BDV2-US-6.4 | Preview Previous Version | 5 | P1 |
| BDV2-US-6.5 | Restore Previous Version | 5 | P1 |
| BDV2-US-6.6 | Space-Efficient Storage | 5 | P1 |
| BDV2-US-6.7 | Branch for Experiments | 5 | P2 |

### EPIC-07: Chat Interface (Sophie)
| ID | Story | Points | Priority |
|----|-------|--------|----------|
| BDV2-US-7.1 | Chat Panel Interface | 5 | P1 |
| BDV2-US-7.2 | Send Messages | 5 | P1 |
| BDV2-US-7.3 | Receive AI Responses | 5 | P1 |
| BDV2-US-7.4 | Apply Edit Suggestions | 8 | P1 |
| BDV2-US-7.5 | Chat Context Awareness | 5 | P1 |
| BDV2-US-7.6 | Chat History | 3 | P1 |
| BDV2-US-7.7 | Quick Commands | 3 | P2 |

### EPIC-08: Video Export & Publishing
| ID | Story | Points | Priority |
|----|-------|--------|----------|
| BDV2-US-8.1 | Export Video | 8 | P0 |
| BDV2-US-8.2 | Quality Presets | 3 | P0 |
| BDV2-US-8.3 | Generate Subtitles | 3 | P0 |
| BDV2-US-8.4 | Generate Thumbnail | 3 | P1 |
| BDV2-US-8.5 | Export History | 3 | P1 |
| BDV2-US-8.6 | Batch Export | 5 | P2 |
| BDV2-US-8.7 | Export Notifications | 2 | P1 |

---

## Technical Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 14+ (App Router) |
| Auth | NextAuth.js (credentials) |
| Database | SQLite (Drizzle ORM) |
| Video | FFmpeg, Auto-Editor |
| Transcription | Whisper (local) |
| AI | Claude API |
| Testing | Playwright + Vitest |
| Styling | Tailwind CSS |

---

## Documents

- [PRD](../../docs/bible-drawing-v2/PRD.md) - Product Requirements Document
- [Architecture](../../docs/bible-drawing-v2/ARCHITECTURE.md) - Technical Architecture

## Epic Files

- [EPIC-01: Authentication](./EPIC-01-authentication.md)
- [EPIC-02: Video Upload](./EPIC-02-video-upload.md)
- [EPIC-03: Video Processing](./EPIC-03-video-processing.md)
- [EPIC-04: Transcript Editor](./EPIC-04-transcript-editor.md)
- [EPIC-05: AI-Assisted Editing](./EPIC-05-ai-assisted-editing.md)
- [EPIC-06: Version History](./EPIC-06-version-history.md)
- [EPIC-07: Chat Interface](./EPIC-07-chat-interface.md)
- [EPIC-08: Export](./EPIC-08-export.md)

---

*Index created: 2025-02-28*
