# PROACTIVE-JOBS.md — HAOS v2 Phase 5: Voice & Video

> **Status (2026-02-13 23:25 EST):** FULL IMPLEMENTATION MODE
> **Authorized by:** Aaron Collins (direct order)
> **Requirements:** Complete implementation, code review, deploy to dev2
> **NO STUBS** — Production-ready code only

## ✅ COMPLETED

### p5-1-infra — LiveKit Infrastructure ✅
- **Status:** complete
- **Completed:** 2026-02-13 22:07 EST

### p5-2-voice-service — Voice Services & Hooks ✅
- **Status:** complete
- **Completed:** 2026-02-13 22:15 EST

### p5-3-voice-ui — Voice UI Components ✅
- **Status:** complete
- **Completed:** 2026-02-13 22:17 EST

### p5-4-video — Video Calling Implementation ✅
- **Status:** complete
- **Completed:** 2026-02-13 22:45 EST
- **Files Created:**
  - `services/video-call.ts`
  - `hooks/use-video-call.ts`
  - `hooks/use-local-video.ts`
  - `components/video/video-grid.tsx`
  - `components/video/video-tile.tsx`
  - `components/video/video-controls.tsx`
  - `components/video/camera-preview.tsx`
  - `components/video/picture-in-picture.tsx`

## 🚀 ACTIVE DEVELOPMENT

### p5-5-screenshare — Screen Sharing Implementation
- **Status:** queued
- **Priority:** HIGH
- **Model:** sonnet
- **Description:** Implement screen sharing with viewer controls
- **Tasks:**
  - [ ] Create `services/screenshare.ts` — screen capture management
  - [ ] Create `hooks/use-screenshare.ts` — screenshare state
  - [ ] Create `components/screenshare/screenshare-button.tsx` — share toggle
  - [ ] Create `components/screenshare/screenshare-preview.tsx` — source selection
  - [ ] Create `components/screenshare/screenshare-viewer.tsx` — fullscreen viewer
  - [ ] Create `components/screenshare/screenshare-controls.tsx` — viewer controls
  - [ ] Create `components/screenshare/index.ts` — barrel exports
  - [ ] Integrate with voice-controls.tsx (add screen share button)
- **Outputs:** Full screen sharing with source selection and viewer

### p5-6-integration — Matrix Voice/Video Integration
- **Status:** queued
- **Priority:** HIGH
- **Model:** sonnet
- **Description:** Wire voice/video into Matrix rooms
- **Tasks:**
  - [ ] Update room store with voice/video state
  - [ ] Create `components/room/room-call-bar.tsx` — call status in room
  - [ ] Add voice channel to room sidebar
  - [ ] Handle Matrix call events (m.call.invite, m.call.answer, etc.)
  - [ ] Sync participant status with Matrix presence
  - [ ] Add call notification system
  - [ ] Create `components/call/incoming-call-modal.tsx`
- **Outputs:** Voice/video fully integrated with Matrix rooms

### p5-7-deploy — Deploy to dev2
- **Status:** queued
- **Priority:** HIGH
- **Model:** haiku
- **Description:** Deploy updated HAOS to dev2 server
- **Tasks:**
  - [ ] Build production bundle
  - [ ] Deploy to dev2 server
  - [ ] Verify LiveKit connection
  - [ ] Test voice channel join/leave
  - [ ] Test video call
  - [ ] Test screen share
- **Outputs:** HAOS v2 with voice/video running on dev2

### p5-8-review — Code Review & Cleanup
- **Status:** queued
- **Priority:** MEDIUM
- **Model:** sonnet
- **Description:** Review all Phase 5 code, fix issues
- **Tasks:**
  - [ ] Review all new services for error handling
  - [ ] Review all hooks for memory leaks
  - [ ] Review all components for accessibility
  - [ ] Add JSDoc comments to public APIs
  - [ ] Verify all TypeScript types are correct
  - [ ] Clean up any TODO comments
  - [ ] Update component exports in barrel files
- **Outputs:** Production-ready, reviewed code

## 📊 SUMMARY

| Task | Status | Worker |
|------|--------|--------|
| p5-1-infra | ✅ complete | — |
| p5-2-voice-service | ✅ complete | — |
| p5-3-voice-ui | ✅ complete | — |
| p5-4-video | ✅ complete | — |
| p5-5-screenshare | 🔄 queued | — |
| p5-6-integration | 🔄 queued | — |
| p5-7-deploy | 🔄 queued | — |
| p5-8-review | 🔄 queued | — |

**Build Status:** ✅ Passing (2026-02-13 23:23 EST)
