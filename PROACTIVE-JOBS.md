# PROACTIVE-JOBS.md — HAOS v2 Phase 6: Full Implementation

> **Status (2026-02-14 01:00 EST):** 🔄 PHASE 6 IN PROGRESS
> **Authorized by:** Aaron Collins (direct order: "fully implement all parts of haos")
> **Build Status:** ✅ WORKING
> **Deployment:** ✅ LIVE AT https://dev2.aaroncollins.info (port 80 via Caddy)

## 📊 CURRENT STATE

**What's Working:**
- ✅ Matrix authentication (sign-in/sign-up with any Matrix homeserver)
- ✅ Matrix provider & client integration
- ✅ Spaces/Servers display & navigation
- ✅ Channel listing & navigation
- ✅ Chat messaging (send/receive via Matrix)
- ✅ Voice/Video infrastructure (LiveKit integration)
- ✅ User settings modal
- ✅ Server settings modal
- ✅ Server discovery modal
- ✅ Theme switching (dark/light)
- ✅ Deployed on port 80

**What Needs Implementation:**

## 🚀 PHASE 6 TASKS

### p6-1-cleanup — Remove Dead Code & Integrate apps/web ✅
- **Status:** ✅ completed
- **Model:** sonnet
- **Started:** 2026-02-14 01:01 EST
- **Completed:** 2026-02-14 03:00 EST
- **Priority:** HIGH
- **Description:** 
  - ✅ Remove placeholder auth files (`lib/auth.ts`, `lib/auth-server.ts`) - Clerk placeholders deleted
  - ✅ Update profile files to use Matrix auth (`lib/initial-profile.ts`, `lib/current-profile.ts`, `lib/current-profile-pages.ts`)
  - ✅ Clean up imports referencing old auth throughout application
  - ✅ Evaluate enhanced components from `apps/web/` - moved to migration directories for future integration
- **Files completed:**
  - ✅ `lib/auth.ts` - DELETED (placeholder)
  - ✅ `lib/auth-server.ts` - DELETED (placeholder)
  - ✅ `lib/initial-profile.ts` - UPDATED to use Matrix auth
  - ✅ `lib/current-profile.ts` - UPDATED to use Matrix auth
  - ✅ `lib/current-profile-pages.ts` - UPDATED to use Matrix auth
  - ✅ `apps/web/` folder - EVALUATED and moved to migration directories
- **Acceptance:** ✅ Build passes, no placeholder auth references remain

### p6-2-dm — Direct Messages Implementation ✅
- **Status:** ✅ completed
- **Model:** sonnet
- **Started:** 2026-02-14 01:01 EST
- **Completed:** 2026-02-14 06:55 EST
- **Priority:** HIGH
- **Description:**
  - ✅ Implement DM creation between users
  - ✅ Add DM listing in sidebar/quick switcher
  - ✅ Wire up `getOrCreateDM` service from `apps/web/services/matrix-dm.ts`
  - ✅ Add DM notifications
- **Files:** COMPLETED
  - ✅ `hooks/use-quick-switcher.ts` - Integrated DM service
  - ✅ `apps/web/services/matrix-dm.ts` - Service integrated
  - ✅ Created DM routes, components, and notifications
- **Acceptance:** ✅ Can start DM with any user, DMs appear in sidebar

### p6-3-friends — Friend System ✅
- **Status:** ✅ completed
- **Model:** sonnet
- **Started:** 2026-02-14 01:45 EST
- **Completed:** 2026-02-14 02:00 EST
- **Priority:** MEDIUM
- **Description:**
  - ✅ Implement friend requests (send/accept/decline)
  - ✅ Friend list management
  - ✅ User search and friend discovery
  - ✅ Friend system fully implemented with tabbed UI
- **Files completed:**
  - ✅ `apps/web/services/friend.ts` - Full friend service with Matrix integration ready
  - ✅ `apps/web/components/user/user-profile-modal.tsx` - Tabbed interface with friend management
  - ✅ `apps/web/components/user/friend-list.tsx` - Compact sidebar friend list
  - ✅ `apps/web/hooks/use-friends.ts` - React hook for friend functionality
  - ✅ `apps/web/components/main-app.tsx` - User area integration
- **Acceptance:** ✅ Can send/accept/decline friend requests, friend list displays in sidebar and profile modal

### p6-4-threads — Message Threads ⏳
- **Status:** pending
- **Model:** sonnet
- **Priority:** MEDIUM
- **Description:**
  - Implement thread creation from messages
  - Thread view/reply UI
  - Currently placeholder: "Start thread (placeholder for future implementation)"
- **Files:**
  - `apps/web/components/chat/message-actions.tsx` - Line 457: placeholder
- **Acceptance:** Can create threads, view thread replies

### p6-5-pins — Message Pinning ⏳
- **Status:** pending
- **Model:** sonnet
- **Priority:** LOW
- **Description:**
  - Implement message pinning
  - Pin/unpin UI
  - Pinned messages list per channel
  - Currently placeholder
- **Files:**
  - `apps/web/components/chat/message-actions.tsx` - Line 447: "Pin message (placeholder for future implementation)"
- **Acceptance:** Can pin/unpin messages, view pinned messages

### p6-6-video-chat — In-Call Chat ⏳
- **Status:** pending
- **Model:** sonnet
- **Priority:** MEDIUM
- **Description:**
  - Add chat sidebar in video/voice calls
  - Currently shows "Chat feature coming soon..."
- **Files:**
  - `components/media-room.tsx` - Lines 158-165: placeholder
- **Acceptance:** Can chat while in voice/video call

### p6-7-reactions — Message Reactions Polish ⏳
- **Status:** pending
- **Model:** haiku
- **Priority:** LOW
- **Description:**
  - Polish reaction actions (currently placeholders)
  - Implement reaction add/remove/view
- **Files:**
  - `components/chat/chat-item.tsx` - Line 422: "Handle reaction actions (placeholders for now)"
- **Acceptance:** Can add/remove reactions on messages

### p6-8-user-context — Fix Hardcoded User IDs ✅
- **Status:** completed
- **Model:** haiku (completed by Coordinator directly after Haiku API overload)
- **Priority:** HIGH
- **Description:**
  - Replace hardcoded `currentUserId="@user:example.com"` with actual Matrix user
- **Files:**
  - `app/(main)/(routes)/servers/[serverId]/channels/[channelId]/page.tsx` - Line 93
- **Acceptance:** Actual logged-in user ID used throughout
- **Started:** 2026-02-14 01:00 EST
- **Completed:** 2026-02-14 02:45 EST
- **Notes:** Also fixed pre-existing TypeScript errors in notification hooks

### p6-9-media-duration — Media Duration Extraction ⏳
- **Status:** pending
- **Model:** haiku
- **Priority:** LOW
- **Description:**
  - Extract media duration for audio/video files
  - Currently placeholder in media.ts
- **Files:**
  - `lib/matrix/media.ts` - Lines 630-632: "TODO: Extract media duration using a media library"
- **Acceptance:** Media duration displays for audio/video attachments

## 📋 TASK PRIORITY ORDER

1. **p6-8-user-context** (quick fix, HIGH impact)
2. **p6-1-cleanup** (foundation for other work)
3. **p6-2-dm** (core feature)
4. **p6-6-video-chat** (completes voice/video)
5. **p6-3-friends** (social feature)
6. **p6-4-threads** (advanced messaging)
7. **p6-5-pins** (convenience feature)
8. **p6-7-reactions** (polish)
9. **p6-9-media-duration** (polish)

## 📊 PHASE 6 SUMMARY

| Task | Status | Priority | Model |
|------|--------|----------|-------|
| p6-1-cleanup | ✅ completed | HIGH | sonnet |
| p6-2-dm | ✅ completed | HIGH | sonnet |
| p6-3-friends | ✅ completed | MEDIUM | sonnet |
| p6-4-threads | ⏳ pending | MEDIUM | sonnet |
| p6-5-pins | ⏳ pending | LOW | sonnet |
| p6-6-video-chat | ⏳ pending | MEDIUM | sonnet |
| p6-7-reactions | ⏳ pending | LOW | haiku |
| p6-8-user-context | ✅ completed | HIGH | haiku |
| p6-9-media-duration | ⏳ pending | LOW | haiku |

**Total Tasks:** 9 (4 ✅ completed, 0 🔄 in-progress, 5 ⏳ pending)  
**Estimated Effort:** ~1-2 days with parallel execution (reduced from 3 completions)
