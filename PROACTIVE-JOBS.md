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
- **Status:** pending
- **Priority:** CRITICAL
- **Model:** Sonnet
- **Description:** Build the Discord-style app shell layout
- **Sub-Tasks:**
  - p1-1-a: Server sidebar (left rail)
  - p1-1-b: Channel sidebar 
  - p1-1-c: Main content area
  - p1-1-d: Member sidebar (right rail, toggleable)
  - p1-1-e: Responsive breakpoints

### p1-messages — Message Components
- **Status:** blocked
- **Blocked By:** p1-layout
- **Priority:** CRITICAL
- **Model:** Sonnet
- **Description:** Build message list and input components
- **Sub-Tasks:**
  - p1-2-a: Virtual scrolling message list
  - p1-2-b: Message component (avatar, name, time, content)
  - p1-2-c: Message grouping (consecutive same-user)
  - p1-2-d: Message input with send
  - p1-2-e: Typing indicator area

### p1-nav — Navigation
- **Status:** blocked
- **Blocked By:** p1-layout
- **Priority:** HIGH
- **Model:** Haiku
- **Description:** URL routing and quick switcher
- **Sub-Tasks:**
  - p1-3-a: Server/channel URL routing
  - p1-3-b: Quick switcher modal (Ctrl+K)

---

## 🔴 Phase 2: Matrix Integration (Priority: CRITICAL)

### p2-auth — Authentication Flows
- **Status:** pending (can start parallel to Phase 1)
- **Priority:** CRITICAL
- **Model:** Sonnet
- **Description:** Complete Matrix authentication
- **Sub-Tasks:**
  - p2-1-a: Login form with homeserver input
  - p2-1-b: Registration flow
  - p2-1-c: Session persistence
  - p2-1-d: Logout with cleanup

### p2-rooms — Room Management
- **Status:** blocked
- **Blocked By:** p2-auth
- **Priority:** CRITICAL
- **Model:** Sonnet
- **Description:** Map Matrix rooms to Discord concepts
- **Sub-Tasks:**
  - p2-2-a: Fetch joined rooms on login
  - p2-2-b: Map Spaces→Servers, Rooms→Channels
  - p2-2-c: Join room by ID/alias
  - p2-2-d: Leave room
  - p2-2-e: Create room (channel)
  - p2-2-f: Create space (server)

---

## 🔴 Phase 3: Real-time Messaging (Priority: CRITICAL)

### p3-messaging — Core Messaging
- **Status:** blocked
- **Blocked By:** p1-messages, p2-rooms
- **Priority:** CRITICAL
- **Model:** Sonnet
- **Description:** Send and receive messages
- **Sub-Tasks:**
  - p3-1-a: Send text messages
  - p3-1-b: Receive messages (sync)
  - p3-1-c: Message history (pagination)
  - p3-1-d: Edit messages
  - p3-1-e: Delete messages
  - p3-1-f: Reply threading

### p3-presence — Presence & Typing
- **Status:** blocked
- **Blocked By:** p3-messaging
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
