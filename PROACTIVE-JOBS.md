# PROACTIVE-JOBS.md — HAOS v2 Implementation Queue

> **Reality Check (2026-02-13):** Previous "release" was fake. Starting fresh with real work.
> **Current State:** Onboarding wizard + server discovery. No actual chat UI.
> **Target:** Complete Discord-style Matrix client.

## 📊 Status Overview

| Phase | Description | Status |
|-------|-------------|--------|
| Phase 1 | Core Chat UI | 🔴 Not Started |
| Phase 2 | Matrix Integration | 🔴 Not Started |
| Phase 3 | Real-time Messaging | 🔴 Not Started |
| Phase 4 | User Experience | ⏸️ Blocked (needs Phase 1-3) |
| Phase 5 | Voice & Video | ⏸️ Blocked (needs Phase 1-3) |
| Phase 6 | Polish & Deploy | ✅ Docker done, rest blocked |

---

## 🔴 Phase 1: Core Chat UI (Priority: CRITICAL)

### p1-layout — App Layout Structure
- **Status:** completed
- **Priority:** CRITICAL
- **Model:** Sonnet
- **Description:** Build the Discord-style app shell layout
- **Worker:** p1-layout (spawned 2025-01-15, completed 2026-02-13)
- **Progress:** `scheduler/progress/p1-layout.md`
- **Sub-Tasks:**
  - ✅ p1-1-a: Server sidebar (left rail)
  - ✅ p1-1-b: Channel sidebar 
  - ✅ p1-1-c: Main content area
  - ✅ p1-1-d: Member sidebar (right rail, toggleable)
  - ✅ p1-1-e: Responsive breakpoints

### p1-messages — Message Components
- **Status:** completed
- **Completed:** 2026-02-13 16:45 EST
- **Priority:** CRITICAL
- **Model:** Opus
- **Description:** Build message list and input components
- **Worker:** p1-messages (spawned 2026-02-13 15:47 EST)
- **Progress:** `scheduler/progress/p1-messages.md`
- **Sub-Tasks:**
  - ✅ p1-2-a: Virtual scrolling message list (MessageList with react-window)
  - ✅ p1-2-b: Message component (Discord-style with avatar, username, timestamp, content)
  - ✅ p1-2-c: Message grouping (consecutive messages from same user within 5min)
  - ✅ p1-2-d: Message input integration (ChatInterface combines existing ChatInput)
  - ✅ p1-2-e: Complete chat interface (ChatInterface with all components)

### p1-nav — Navigation
- **Status:** completed
- **Priority:** HIGH
- **Model:** Haiku
- **Description:** URL routing and quick switcher
- **Worker:** p1-nav (spawned 2026-02-14 11:00 EST)
- **Completed:** 2026-02-14 12:45 EST
- **Progress:** `scheduler/progress/p1-nav.md`
- **Sub-Tasks:**
  - ✅ p1-3-a: Server/channel URL routing
  - ✅ p1-3-b: Quick switcher modal (Ctrl+K)

---

## 🔴 Phase 2: Matrix Integration (Priority: CRITICAL)

### p2-auth — Authentication Flows
- **Status:** completed
- **Priority:** CRITICAL
- **Model:** Sonnet
- **Description:** Complete Matrix authentication
- **Worker:** p2-auth (spawned 2025-01-28, completed 2026-02-13)
- **Progress:** `scheduler/progress/p2-auth.md`
- **Sub-Tasks:**
  - ✅ p2-1-a: Login form with homeserver input
  - ✅ p2-1-b: Registration flow
  - ✅ p2-1-c: Session persistence
  - ✅ p2-1-d: Logout with cleanup

### p2-rooms — Room Management
- **Status:** completed
- **Completed:** 2025-01-28 17:30 EST
- **Priority:** CRITICAL
- **Model:** Sonnet
- **Description:** Map Matrix rooms to Discord concepts
- **Worker:** p2-rooms (spawned 2025-01-28 16:45 EST)
- **Progress:** `scheduler/progress/p2-rooms.md`
- **Sub-Tasks:**
  - ✅ p2-2-a: Fetch joined rooms on login
  - ✅ p2-2-b: Map Spaces→Servers, Rooms→Channels
  - ✅ p2-2-c: Join room by ID/alias
  - ✅ p2-2-d: Leave room
  - ✅ p2-2-e: Create room (channel)
  - ✅ p2-2-f: Create space (server)

---

## 🚨 CRITICAL: Build Fixes

### build-fix-spaces-hook — Fix Build Errors (Scope Expanded)
- **Status:** in-progress
- **Priority:** CRITICAL (blocking all progress)
- **Model:** Sonnet/Opus
- **Description:** Fix TypeScript errors preventing build (originally spaces hook, scope expanded)
- **Workers Active:** 2 workers running as of 2026-02-13 12:01 EST
- **Progress:** `scheduler/progress/build-fix-spaces-hook.md`
- **Heartbeat:** `scheduler/heartbeats/build-fix-spaces-hook.json`

#### PM Assessment (2026-02-13 12:01 EST):
Original issue (use-spaces hook) was stale — hook exists. **Actual blockers:**
1. **Server components** — Type mismatches between MatrixSpace/ServerHeaderData
2. **LiveKit API** — TrackRef property, ConnectionStatus properties removed
3. **Prisma/Matrix enums** — MemberRole case mismatch (ADMIN vs admin)
4. **Various** — pathname null checks, toast import scope

#### Files With Errors:
- `components/server/server-channel.tsx`
- `components/server/server-header.tsx`
- `components/server/server-sidebar-content.tsx`
- `components/server/settings/server-settings-sidebar.tsx`
- `components/video-call/participant-list.tsx`
- `components/video-call/video-call-layout.tsx`
- `components/video-call/video-controls.tsx`
- `components/modals/server-discovery-modal.tsx`

#### Success Criteria:
- [ ] All TypeScript errors resolved
- [ ] `npm run build` succeeds
- [ ] No runtime errors on dev server startup

## 🔴 Phase 3: Real-time Messaging (Priority: CRITICAL)

### p3-messaging — Core Messaging
- **Status:** completed
- **Completed:** 2026-02-13 15:15 EST
- **Priority:** CRITICAL
- **Model:** Sonnet
- **Description:** Send and receive messages
- **Worker:** p3-messaging (completed 2026-02-13 15:15 EST)
- **Progress:** `scheduler/progress/p3-messaging.md`
- **Sub-Tasks:**
  - ✅ p3-1-a: Send text messages (sendMessage service)
  - ✅ p3-1-b: Receive messages (sync) (useRoomMessages timeline listeners)
  - ✅ p3-1-c: Message history (pagination) (Matrix scrollback)
  - ✅ p3-1-d: Edit messages (editMessage service + UI)
  - ✅ p3-1-e: Delete messages (deleteMessage service + UI)
  - ✅ p3-1-f: Reply threading (Matrix relations + UI)

### p3-presence — Presence & Typing
- **Status:** blocked
- **Blocked By:** build-fix-spaces-hook (critical build failure)
- **Priority:** MEDIUM
- **Model:** Haiku
- **Description:** Typing indicators and presence
- **Sub-Tasks:**
  - p3-2-a: Send typing indicators
  - p3-2-b: Display typing indicators

---

## ⏸️ Phase 4: User Experience (Blocked)

### p4-profile — User Profile & Settings
- **Status:** blocked
- **Blocked By:** Phase 1-3 completion
- **Priority:** MEDIUM
- **Model:** Sonnet

### p4-media — Media & Files
- **Status:** blocked
- **Blocked By:** p3-messaging
- **Priority:** MEDIUM
- **Model:** Sonnet

### p4-notifications — Notifications
- **Status:** blocked
- **Blocked By:** p3-messaging
- **Priority:** MEDIUM
- **Model:** Haiku

---

## ⏸️ Phase 5: Voice & Video (Blocked)

### p5-voice — Voice Channels
- **Status:** blocked
- **Blocked By:** Phase 1-3 completion
- **Priority:** HIGH
- **Model:** Sonnet
- **Note:** Integrate with LiveKit (already running on dev2)

### p5-video — Video & Screen Share
- **Status:** blocked
- **Blocked By:** p5-voice
- **Priority:** MEDIUM
- **Model:** Sonnet

---

## ✅ Phase 6: Polish & Deploy

### p6-docker — Docker Deployment
- **Status:** completed
- **Completed:** 2026-02-13 10:30 EST
- **Description:** Dockerfile, docker-compose, deployed to dev2

### p6-quality — Quality & Accessibility
- **Status:** blocked
- **Blocked By:** Phase 1-5 completion

---

## 🚀 Execution Order

**Immediate (can start now):**
1. `p1-layout` — Build the app shell
2. `p2-auth` — Complete auth flows (parallel)

**After layout:**
3. `p1-messages` — Message components
4. `p1-nav` — Navigation

**After auth:**
5. `p2-rooms` — Room management

**After messages + rooms:**
6. `p3-messaging` — Core messaging
7. `p3-presence` — Typing indicators

**After core complete:**
8. Phase 4 (UX)
9. Phase 5 (Voice/Video)
10. Phase 6 (Polish)

---

## 📋 Task Manager Instructions

1. **Start with p1-layout** — This unblocks everything
2. **Parallel p2-auth** — Can run alongside layout work
3. **Verify completions** — Build must pass, feature must work
4. **Model sizing:**
   - UI components: Sonnet (needs design thinking)
   - Plumbing/integration: Haiku (clear instructions)
   - Complex Matrix logic: Sonnet

---

*Last Updated: 2026-02-13 10:30 EST by Sophie (reality check deployment)*
