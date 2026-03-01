# Epic 08: Video Export & Publishing - Status Report

**Epic ID:** clawd-47n (BDV2-EPIC-08)  
**Priority:** P0 (MVP)  
**Status:** OPEN (Blocked by dependencies)  
**Report Date:** 2026-03-01  
**Total Points:** 27  

---

## Executive Summary

The Video Export & Publishing epic is **defined but not yet actionable** due to dependency chain requirements. All 7 user stories are fully documented with acceptance criteria and Playwright test specifications. The epic cannot begin until EPIC-04 (Transcript Editor) is complete, which itself depends on Auth, Upload, and Processing epics.

---

## Dependency Chain Status

```
EPIC-01 Auth ──► EPIC-02 Upload ──► EPIC-03 Processing ──► EPIC-04 Transcript ──► EPIC-08 Export
    ⚠️                 ◯                    ◯                     ◯                    ◯
 BLOCKED             OPEN                 OPEN                  OPEN                 OPEN
(CSRF bug)
```

| Epic | Status | Blocker |
|------|--------|---------|
| EPIC-01: Authentication | ⚠️ BLOCKED | CSRF configuration issues (clawd-zsk, clawd-cxe) |
| EPIC-02: Upload | ◯ OPEN | Waiting on Auth completion |
| EPIC-03: Processing | ◯ OPEN | Waiting on Upload completion |
| EPIC-04: Transcript | ◯ OPEN | Waiting on Processing completion |
| **EPIC-08: Export** | ◯ OPEN | Waiting on Transcript completion |

---

## Project Foundation Status

| Item | Status | Notes |
|------|--------|-------|
| PRD Document | ✅ Complete | `docs/bible-drawing-v2/PRD.md` |
| Architecture Doc | ✅ Complete | `docs/bible-drawing-v2/ARCHITECTURE.md` |
| Stories Index | ✅ Complete | `scheduler/stories/bible-drawing-v2/INDEX.md` |
| Epic Stories | ✅ Complete | `scheduler/stories/bible-drawing-v2/EPIC-08-export.md` |
| Phase 1 Plan | ✅ Complete | `docs/plans/bible-drawing-v2/phases/PHASE-1.md` (v2) |
| App Repository | ❌ Not Created | Requires Category 0 foundation tasks |

---

## User Stories Summary

### P0 (MVP) Stories

| ID | Story | Points | Phase 1 Task |
|----|-------|--------|--------------|
| BDV2-US-8.1 | Export Video | 8 | p1-5-a |
| BDV2-US-8.2 | Quality Presets | 3 | p1-5-b |
| BDV2-US-8.3 | Generate Subtitles | 3 | p1-5-c |

### P1 Stories

| ID | Story | Points | Phase 1 Task |
|----|-------|--------|--------------|
| BDV2-US-8.4 | Generate Thumbnail | 3 | p1-5-d |
| BDV2-US-8.5 | Export History | 3 | p1-5-e |
| BDV2-US-8.7 | Export Notifications | 2 | Post-MVP |

### P2 Stories

| ID | Story | Points | Phase 1 Task |
|----|-------|--------|--------------|
| BDV2-US-8.6 | Batch Export | 5 | Post-MVP |

---

## Phase 1 Export Tasks (Category 5)

When dependencies clear, these tasks are ready:

| Task ID | Description | Model | Dependencies |
|---------|-------------|-------|--------------|
| p1-5-a | Basic video export functionality | Sonnet | p1-4-b (transcript edit), p1-3-f (segment combine) |
| p1-5-b | YouTube quality presets (1080p, 720p) | Haiku | p1-5-a |
| p1-5-c | Subtitle file generation (SRT/VTT) | Sonnet | p1-5-a |
| p1-5-d | Thumbnail generation from video frame | Sonnet | p1-5-a |
| p1-5-e | Export history tracking | Sonnet | p1-5-a |

**Acceptance Criteria (from Phase 1 plan):**
- [ ] User can export video with current edits applied
- [ ] Export includes only non-struck transcript segments
- [ ] YouTube presets produce compatible 1080p/30fps output
- [ ] SRT and VTT subtitle files generated alongside video
- [ ] Thumbnail can be selected from video frames
- [ ] Export history shows all previous exports with timestamps
- [ ] E2E test passes: full workflow → export → file accessible

---

## Technical Requirements

### Dependencies
- FFmpeg for video encoding
- Complex filter graphs for edit application
- Background worker for long exports
- File download handling
- Notification APIs

### Core Export Flow
```
Transcript Edits → Edit Decision List (EDL) → FFmpeg Filter Graph → 
Encoded Output → Subtitle Generation → Thumbnail Extraction → Export Complete
```

### Quality Presets
| Preset | Resolution | Bitrate | Use Case |
|--------|------------|---------|----------|
| YouTube HD | 1080p | 12 Mbps | Standard publish |
| YouTube 4K | 2160p | 35 Mbps | High quality |
| Web Standard | 720p | 5 Mbps | Preview/sharing |
| Quick Preview | 480p | 2 Mbps | Fast review |

---

## Definition of Done

- [ ] All stories have passing unit tests
- [ ] All stories have passing integration tests
- [ ] All stories have passing E2E tests (3 viewports)
- [ ] Exported video matches preview exactly
- [ ] Audio has no gaps, pops, or glitches
- [ ] Subtitles sync within 100ms
- [ ] Thumbnail is high quality
- [ ] YouTube upload succeeds without issues

---

## Recommended Actions

### Immediate (Blocked)
1. **Cannot start** - Epic blocked by dependency chain
2. Auth CSRF issues (clawd-zsk) must be resolved first

### When Dependencies Clear
1. Create `bd` issues for Phase 1 Category 5 tasks
2. Begin p1-5-a (basic export) once p1-4-b and p1-3-f complete
3. Parallel work on p1-5-b/c/d/e after p1-5-a

### Post-MVP
1. Implement US-8.6 (Batch Export) - P2
2. Implement US-8.7 (Export Notifications) - P1
3. Advanced features from full EPIC-08 spec

---

## Timeline Estimate

Based on Phase 1 plan (4-5 weeks total):

| Week | Focus |
|------|-------|
| Week 1 | Foundation + Auth start |
| Week 1-2 | Auth completion |
| Week 2 | Upload system |
| Week 2-3 | Processing pipeline |
| Week 3-4 | Transcript editor + Preview |
| **Week 4-5** | **Export system (this epic)** |

---

## Files Reference

- **Epic Definition:** `scheduler/stories/bible-drawing-v2/EPIC-08-export.md`
- **Stories Index:** `scheduler/stories/bible-drawing-v2/INDEX.md`
- **Phase 1 Plan:** `docs/plans/bible-drawing-v2/phases/PHASE-1.md`
- **Architecture:** `docs/bible-drawing-v2/ARCHITECTURE.md`
- **PRD:** `docs/bible-drawing-v2/PRD.md`
- **Master Issue:** clawd-9vx (Bible Drawing V2 Master Plan)

---

*Report generated by Subagent: agent:main:subagent:e2053797-0773-4f2c-ac18-c37292bf8d7c*
