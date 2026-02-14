# PROACTIVE-JOBS.md — HAOS v2 Phase 5: Voice & Video

> **Status (2026-02-13 21:45 EST):** FULL IMPLEMENTATION MODE
> **Authorized by:** Aaron Collins (direct order)
> **Requirements:** Complete implementation, code review, deploy to dev2
> **NO STUBS** — Production-ready code only

## 🚀 ACTIVE DEVELOPMENT

### p5-1-infra — LiveKit Infrastructure Setup
- **Status:** ✅ COMPLETED
- **Priority:** CRITICAL (blocks all other work)
- **Model:** sonnet
- **Description:** Set up LiveKit server on dev2 and integrate into HAOS
- **Tasks:**
  - [x] ✅ Found existing LiveKit server on dev2:7880 (working)
  - [x] ✅ Verified TURN/STUN servers configured
  - [x] ✅ SSL certificates available (using existing setup)
  - [x] ✅ UDP ports configured (50000-60000)
  - [x] ✅ API keys available (devkey/LiveKit2026SecretKeyForMatrix)
  - [x] ✅ Added `livekit-client`, `@livekit/components-react`, `@livekit/components-styles` to HAOS
  - [x] ✅ Created production-ready LiveKit service for token generation and room management
  - [x] ✅ Set up environment configuration in next.config.js
- **Outputs:** ✅ LiveKit server operational on dev2:7880, HAOS integration ready
- **Docs:** `/haos/docs/PHASE5-VOICE-VIDEO-PLAN.md`
- **Completed:** 2026-02-13 22:03 EST by worker p5-1-infra

### p5-2-voice-service — Voice Channel Service & Hooks
- **Status:** ✅ COMPLETED
- **Priority:** HIGH
- **Model:** sonnet
- **Description:** Create voice channel service and React hooks
- **Completed:** 2026-02-14 16:30 EST
- **Tasks:**
  - [x] ✅ Create `services/voice-channel.ts` — room creation, participant management
  - [x] ✅ Create `hooks/use-voice-channel.ts` — join/leave voice channels (already existed)
  - [x] ✅ Create `hooks/use-participants.ts` — track participants and states
  - [x] ✅ Create `hooks/use-local-media.ts` — manage local microphone
  - [x] ✅ Create `stores/voice-store.ts` — Zustand store for voice state
  - [x] ✅ Implement mute/unmute functionality
  - [x] ✅ Implement speaking indicators (voice activity detection)
  - [x] ✅ Create LiveKit API endpoint (`app/api/livekit/route.ts`)
- **Outputs:** ✅ Working voice channel service with comprehensive hook coverage and state management

### p5-3-voice-ui — Voice Channel UI Components
- **Status:** pending (blocked by p5-2-voice-service)
- **Priority:** HIGH
- **Model:** sonnet
- **Description:** Build Discord-style voice channel UI
- **Tasks:**
  - [ ] Create `components/voice/voice-channel-list.tsx` — sidebar voice channels
  - [ ] Create `components/voice/voice-channel-panel.tsx` — current channel view
  - [ ] Create `components/voice/voice-controls.tsx` — mute/deafen/settings
  - [ ] Create `components/voice/participant-tile.tsx` — user avatar with speaking indicator
  - [ ] Create `components/voice/speaking-indicator.tsx` — green ring animation
  - [ ] Integrate voice controls into main app layout
  - [ ] Add connected users display with avatars
- **Outputs:** Complete voice channel UI matching Discord style

### p5-4-video — Video Calling Implementation
- **Status:** pending (blocked by p5-2-voice-service)
- **Priority:** HIGH
- **Model:** sonnet
- **Description:** Implement video calling with camera controls
- **Tasks:**
  - [ ] Create `services/video-call.ts` — video track management
  - [ ] Create `hooks/use-video-call.ts` — video call state
  - [ ] Create `hooks/use-local-video.ts` — camera controls
  - [ ] Create `components/video/video-grid.tsx` — auto-resize participant grid
  - [ ] Create `components/video/video-tile.tsx` — individual video tile
  - [ ] Create `components/video/video-controls.tsx` — camera on/off
  - [ ] Create `components/video/camera-preview.tsx` — preview before joining
  - [ ] Implement picture-in-picture support
- **Outputs:** Full video calling with grid layout and controls

### p5-5-screenshare — Screen Sharing
- **Status:** pending (blocked by p5-4-video)
- **Priority:** MEDIUM
- **Model:** sonnet
- **Description:** Implement screen/window/tab sharing
- **Tasks:**
  - [ ] Create `services/screen-share.ts` — screen selection and sharing
  - [ ] Create `hooks/use-screen-share.ts` — screen share state
  - [ ] Create `components/screen-share/screen-share-button.tsx`
  - [ ] Create `components/screen-share/screen-share-view.tsx`
  - [ ] Implement system audio sharing
  - [ ] Add screen share overlay in video grid
- **Outputs:** Working screen sharing with audio support

### p5-6-integration — Matrix Integration & Polish
- **Status:** pending (blocked by p5-3, p5-4, p5-5)
- **Priority:** HIGH
- **Model:** sonnet
- **Description:** Integrate with Matrix, add settings, polish UX
- **Tasks:**
  - [ ] Voice channel state sync with Matrix rooms
  - [ ] Presence updates when in voice
  - [ ] Call history in room timeline
  - [ ] Notifications for incoming calls
  - [ ] Audio/video device selection settings
  - [ ] Noise suppression and echo cancellation
  - [ ] Voice activity threshold settings
  - [ ] Push-to-talk option
  - [ ] Connection retry logic
  - [ ] Network quality indicators
  - [ ] Error handling and recovery
- **Outputs:** Fully integrated voice/video with settings

### p5-7-deploy — Deploy to dev2
- **Status:** pending (blocked by all above)
- **Priority:** HIGH
- **Model:** sonnet
- **Description:** Deploy complete HAOS with voice/video to dev2
- **Tasks:**
  - [ ] Update Docker compose with LiveKit env vars
  - [ ] Build production HAOS container
  - [ ] Deploy to dev2
  - [ ] Configure CORS for LiveKit URLs
  - [ ] End-to-end testing on dev2
  - [ ] Performance testing (CPU/memory usage)
- **Outputs:** HAOS running on dev2 with full voice/video

### p5-8-review — Code Review
- **Status:** pending (runs parallel with implementation)
- **Priority:** HIGH
- **Model:** opus
- **Description:** Review all Phase 5 code
- **Tasks:**
  - [ ] TypeScript strict mode compliance
  - [ ] Code quality review
  - [ ] Security review (token handling, permissions)
  - [ ] Accessibility review (keyboard controls, screen reader)
  - [ ] Performance review
  - [ ] Unit test coverage review
- **Outputs:** All code reviewed and approved

---

## 📊 Phase Completion Summary

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 | ✅ COMPLETE | Core Chat UI |
| Phase 2 | ✅ COMPLETE | Matrix Integration |
| Phase 3 | ✅ COMPLETE | Real-time Messaging |
| Phase 4 | ✅ COMPLETE | User Experience |
| Phase 5 | 🔄 IN PROGRESS | Voice & Video |
| Phase 6 | ⏳ PENDING | Final Polish & Deploy |

---

## 🔄 Task Dependencies

```
p5-1-infra (CRITICAL)
    ├── p5-2-voice-service
    │   ├── p5-3-voice-ui
    │   └── p5-4-video
    │       └── p5-5-screenshare
    └── p5-6-integration (after p5-3, p5-4, p5-5)
        └── p5-7-deploy
            └── p5-8-review (parallel)
```

---

*Updated: 2026-02-13 21:45 EST — Phase 5 ACTIVE per Aaron's direct order*
