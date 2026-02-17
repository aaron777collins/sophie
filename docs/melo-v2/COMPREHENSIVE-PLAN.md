# MELO v2 - Comprehensive Implementation Plan

> **Goal:** A fully functional Discord-style Matrix client
> **Current State:** Onboarding wizard + server discovery (no actual chat)
> **Target:** Complete chat application with voice/video

---

## 📊 Phase Overview

| Phase | Description | Est. Tasks | Priority |
|-------|-------------|------------|----------|
| **Phase 1** | Core Chat UI | 12 | 🔴 Critical |
| **Phase 2** | Matrix Integration | 10 | 🔴 Critical |
| **Phase 3** | Real-time Features | 8 | 🔴 Critical |
| **Phase 4** | User Experience | 10 | 🟡 High |
| **Phase 5** | Voice & Video | 8 | 🟡 High |
| **Phase 6** | Polish & Deploy | 6 | 🟢 Medium |

**Total: ~54 tasks**

---

## 🔴 Phase 1: Core Chat UI (No Matrix Yet - Pure UI)

Build the Discord-style interface without backend integration first.

### 1.1 Layout Structure
- [ ] **p1-1-a** Server sidebar (left rail) - list of joined servers with icons
- [ ] **p1-1-b** Channel sidebar - channels grouped by category, collapsible
- [ ] **p1-1-c** Main content area - messages + input
- [ ] **p1-1-d** Member sidebar (right rail) - toggle-able member list
- [ ] **p1-1-e** Responsive layout - mobile collapses sidebars

### 1.2 Message Components
- [ ] **p1-2-a** Message list container - virtual scrolling for performance
- [ ] **p1-2-b** Message component - avatar, username, timestamp, content
- [ ] **p1-2-c** Message grouping - consecutive messages from same user
- [ ] **p1-2-d** Message input - textarea with send button
- [ ] **p1-2-e** Typing indicator area
- [ ] **p1-2-f** Unread message divider

### 1.3 Navigation
- [ ] **p1-3-a** Server/channel context (URL routing or state)
- [ ] **p1-3-b** Quick switcher (Ctrl+K) modal

---

## 🔴 Phase 2: Matrix Integration

Connect the UI to the Matrix SDK.

### 2.1 Authentication
- [ ] **p2-1-a** Login form with homeserver URL input
- [ ] **p2-1-b** Registration flow (if homeserver allows)
- [ ] **p2-1-c** Session persistence (localStorage + SDK restore)
- [ ] **p2-1-d** Logout with cleanup

### 2.2 Room Management
- [ ] **p2-2-a** Fetch joined rooms on login
- [ ] **p2-2-b** Map Matrix rooms → "servers" and "channels"
  - Spaces = Servers
  - Rooms in spaces = Channels
  - DMs = separate section
- [ ] **p2-2-c** Join room by ID/alias
- [ ] **p2-2-d** Leave room
- [ ] **p2-2-e** Create room (channel)
- [ ] **p2-2-f** Create space (server)

---

## 🔴 Phase 3: Real-time Features

### 3.1 Messaging
- [ ] **p3-1-a** Send text messages
- [ ] **p3-1-b** Receive messages (sync loop)
- [ ] **p3-1-c** Message history (pagination/backfill)
- [ ] **p3-1-d** Edit messages
- [ ] **p3-1-e** Delete messages
- [ ] **p3-1-f** Reply to messages (threading)

### 3.2 Presence & Typing
- [ ] **p3-2-a** Typing indicators (send)
- [ ] **p3-2-b** Typing indicators (receive/display)

---

## 🟡 Phase 4: User Experience

### 4.1 User Profile
- [ ] **p4-1-a** User settings modal
- [ ] **p4-1-b** Avatar upload
- [ ] **p4-1-c** Display name change
- [ ] **p4-1-d** Status (online/away/dnd/invisible)

### 4.2 Media & Files
- [ ] **p4-2-a** Image upload & preview
- [ ] **p4-2-b** File upload
- [ ] **p4-2-c** Image/video embeds in messages
- [ ] **p4-2-d** Link previews

### 4.3 Notifications
- [ ] **p4-3-a** Browser notification permission
- [ ] **p4-3-b** Desktop notifications for mentions
- [ ] **p4-3-c** Unread badges on servers/channels

---

## 🟡 Phase 5: Voice & Video

Integrate with LiveKit (already running on dev2).

### 5.1 Voice Channels
- [ ] **p5-1-a** Voice channel UI in sidebar
- [ ] **p5-1-b** Join voice channel
- [ ] **p5-1-c** Leave voice channel
- [ ] **p5-1-d** Mute/unmute controls
- [ ] **p5-1-e** Deafen controls
- [ ] **p5-1-f** Voice activity indicators

### 5.2 Video
- [ ] **p5-2-a** Enable camera
- [ ] **p5-2-b** Screen share

---

## 🟢 Phase 6: Polish & Deploy

### 6.1 Quality
- [ ] **p6-1-a** Error boundaries
- [ ] **p6-1-b** Loading states everywhere
- [ ] **p6-1-c** Accessibility audit

### 6.2 DevOps
- [ ] **p6-2-a** Dockerfile (DONE - see below)
- [ ] **p6-2-b** docker-compose integration
- [ ] **p6-2-c** CI/CD (optional)

---

## 🐳 Docker Setup

See `/home/ubuntu/clawd/melo/Dockerfile` and `/home/ubuntu/clawd/melo/docker-compose.yml`

---

## 📁 File Structure (Target)

```
melo/apps/web/
├── app/
│   ├── page.tsx              # Main app entry
│   ├── layout.tsx            # Root layout
│   └── (app)/                # Authenticated routes
│       ├── layout.tsx        # App shell with sidebars
│       ├── [serverId]/
│       │   └── [channelId]/
│       │       └── page.tsx  # Channel view
│       └── settings/
│           └── page.tsx
├── components/
│   ├── layout/
│   │   ├── server-sidebar.tsx
│   │   ├── channel-sidebar.tsx
│   │   ├── member-sidebar.tsx
│   │   └── app-shell.tsx
│   ├── chat/
│   │   ├── message-list.tsx
│   │   ├── message.tsx
│   │   ├── message-input.tsx
│   │   └── typing-indicator.tsx
│   ├── voice/
│   │   ├── voice-channel.tsx
│   │   └── voice-controls.tsx
│   └── modals/
│       ├── quick-switcher.tsx
│       ├── user-settings.tsx
│       └── create-channel.tsx
├── hooks/
│   ├── use-matrix-client.ts  # EXISTS
│   ├── use-rooms.ts
│   ├── use-messages.ts
│   ├── use-typing.ts
│   └── use-voice.ts
├── stores/
│   ├── room-store.ts
│   ├── message-store.ts
│   └── user-store.ts
└── lib/
    ├── matrix/
    │   ├── client.ts
    │   ├── rooms.ts
    │   └── messages.ts
    └── livekit/
        └── client.ts
```

---

## 🚀 Execution Order

**Week 1: Core UI (Phase 1)**
- Day 1-2: Layout structure (p1-1-*)
- Day 3-4: Message components (p1-2-*)
- Day 5: Navigation (p1-3-*)

**Week 2: Matrix Integration (Phase 2 + 3)**
- Day 1-2: Auth flows (p2-1-*)
- Day 3-4: Room management (p2-2-*)
- Day 5-7: Messaging (p3-1-*)

**Week 3: UX + Voice (Phase 4 + 5)**
- Day 1-3: User experience (p4-*)
- Day 4-7: Voice/video (p5-*)

**Week 4: Polish (Phase 6)**
- Quality, testing, deployment

---

## ✅ Success Criteria

MELO v2 is "100% complete" when:

1. ✅ User can log in with Matrix credentials
2. ✅ User sees their servers (spaces) and channels (rooms)
3. ✅ User can send and receive messages in real-time
4. ✅ User can join/leave rooms
5. ✅ User can create rooms/spaces
6. ✅ User can upload images/files
7. ✅ User can join voice channels
8. ✅ User can video chat / screen share
9. ✅ App runs in Docker
10. ✅ App is deployed and accessible

---

*Created: 2026-02-13 by Sophie after reality check*
