# Proactive Jobs - HAOS v2 (Discord Clone + Matrix Backend)

> 🚨 **REPO PATH: `/home/ubuntu/repos/haos-v2`**
> ⚠️ Old repo renamed to `/home/ubuntu/repos/archived-haos-DO-NOT-USE` — DO NOT TOUCH IT!

> 📚 **DOCUMENTATION REQUIRED:**
> - **Task Progress:** `scheduler/progress/{task-id}.md` — YOUR work log
> - **Project Memory:** `memory/projects/haos-v2/_overview.md` — Project state
> - **Read BOTH before starting. Update BOTH while working.**

> 🔢 **TASK COUNTING RULES:**
> - **Leaf tasks** (in-progress, no sub-tasks of their own running) = 1 slot each
> - **Manager tasks** (coordinate sub-agents) = 0 slots (coordination overhead)
> - **Max 2 leaf task slots active** — count actual running agents, not hierarchy
> 
> Example: `haos-v2-auth-manager-p1-1` with sub-agents c + d running = **2 slots** (at capacity)

> 🧠 **MODEL:** Use **Opus** for verification/complex tasks, **Sonnet** for implementation

---

## Current Priority: Phase 1 - Core Integration 🔧

**p1-1 (Auth) COMPLETE** (2026-02-12). Login, registration, cookies, and provider done.

**Now executing p1-2:** Real-Time Sync Migration — Matrix client, hooks, presence.

See: `~/clawd/docs/haos-v2/TASK-BREAKDOWN.md` for full task list (94 tasks across 4 phases)
See: `memory/projects/haos-v2/_overview.md` for current project state

### Phase 1 Progress
| Section | Status | Tasks Done |
|---------|--------|------------|
| p1-1: Auth | ✅ Complete | 5/5 |
| p1-2: Sync | ✅ Complete | 10/10 |
| p1-3: Media | 🚀 In Progress | 7/8 |
| p1-4: Services | 🚀 In Progress | 2/6 |

### Phase 2 Progress (UI Reskin)
| Section | Status | Tasks Done |
|---------|--------|------------|
| p2-1: Navigation | 🚀 In Progress | 1/5 |

---

## Phase 1 Tasks (In Progress)

### haos-v2-sync-manager-p1-2: Real-Time Sync Migration (Manager)
- **Status:** in-progress (manager)
- **Min Model:** opus
- **Description:** Coordinate real-time sync migration — Matrix client singleton, React providers, hooks for rooms/messages/typing/presence/receipts, connection status UI. Manage sub-agents.
- **Sub-Tasks (Phase 1):**
  - haos-v2-matrix-client-p1-2-a: ✅ completed
  - haos-v2-matrix-provider-p1-2-b: ✅ completed
  - haos-v2-client-hook-p1-2-c: ✅ completed
  - haos-v2-use-room-p1-2-d: ✅ completed
  - haos-v2-use-room-messages-p1-2-e: ✅ completed
- **Sub-Tasks (Phase 2 - Ready):**
  - haos-v2-typing-indicator-p1-2-f: ✅ completed
  - haos-v2-presence-hook-p1-2-g: ✅ completed
  - haos-v2-read-receipts-p1-2-h: ✅ completed
  - haos-v2-connection-status-p1-2-i: ✅ completed
  - haos-v2-remove-socketio-p1-2-j: pending

### haos-v2-typing-indicator-p1-2-f: Create useTypingIndicator Hook
- **Status:** completed
- **Completed:** 2026-02-12 07:35 EST
- **Min Model:** sonnet
- **Parent:** haos-v2-sync-manager-p1-2
- **Description:** Hook for typing indicators with real-time updates
- **Files to Create:**
  - `hooks/use-typing-indicator.ts`
- **Parameters:** `roomId: string`
- **Returns:**
  - `typingUsers: string[]`
  - `setTyping(isTyping: boolean): void`
- **Success Criteria:**
  - Shows when others are typing
  - Sends typing notifications
  - Auto-clears after timeout

### haos-v2-presence-hook-p1-2-g: Create usePresence Hook
- **Status:** completed
- **Completed:** 2026-02-13 08:50 EST
- **Min Model:** sonnet
- **Parent:** haos-v2-sync-manager-p1-2
- **Description:** Hook for user presence state with real-time sync
- **Files to Create:**
  - `hooks/use-presence.ts`
- **Parameters:** `userId?: string`
- **Returns:**
  - `presence: 'online' | 'offline' | 'unavailable'`
  - `lastActiveAgo: number`
  - `setPresence(presence): void`
- **Success Criteria:**
  - Current user presence syncs
  - Can read other users' presence
  - Updates in real-time
- **Started:** 2026-02-12 22:45 EST

### haos-v2-read-receipts-p1-2-h: Create useReadReceipts Hook
- **Status:** completed
- **Completed:** 2026-02-13 08:59 EST
- **Min Model:** sonnet
- **Parent:** haos-v2-sync-manager-p1-2
- **Description:** Hook for read receipt tracking and marking
- **Files Created:**
  - `hooks/use-read-receipts.ts` — Complete implementation (16.2kB)
- **Parameters:** `roomId: string`
- **Returns:**
  - `receipts: Map<eventId, userId[]>`
  - `markAsRead(eventId): void`
- **Success Criteria:** ✅ ALL MET
  - ✅ Shows who has read messages (receipts Map)
  - ✅ Marks messages as read on scroll (markAsRead function)
  - ✅ Updates in real-time (RoomEvent.Receipt listeners)

### haos-v2-connection-status-p1-2-i: Create Connection Status Component
- **Status:** completed
- **Completed:** 2026-02-13 13:25 EST
- **Min Model:** sonnet
- **Parent:** haos-v2-sync-manager-p1-2
- **Description:** UI indicator for sync connection state
- **Files to Create:**
  - `components/connection-indicator.tsx`
- **Features:**
  - Green = synced, yellow = syncing, red = error
  - Tooltip with details
  - Auto-retry on disconnect
- **Success Criteria:**
  - Accurately reflects sync state
  - Visible but not intrusive
  - Clickable for details
- **Started:** 2026-02-12 05:15 EST

### haos-v2-remove-socketio-p1-2-j: Remove Socket.io Dependencies ✅
- **Status:** completed
- **Completed:** 2026-02-14 00:30 EST
- **Min Model:** haiku
- **Parent:** haos-v2-sync-manager-p1-2
- **Description:** Clean removal of all Socket.io code
- **Files Deleted:**
  - `components/providers/socket-provider.tsx`
  - `hooks/use-chat-socket.ts`
  - `pages/api/socket/` (entire directory)
- **Actions Completed:**
  - Removed socket.io from package.json
  - Removed socket.io-client from package.json
  - Searched and removed all socket references
- **Success Criteria:**
  - `pnpm build` triggered without socket.io errors
  - No socket.io in bundle
  - Real-time preparation for Matrix integration

### haos-v2-matrix-auth-types-p1-1-a: Create Matrix Auth Types ✅
- **Status:** completed
- **Parent:** haos-v2-auth-manager-p1-1
- **Started:** 2026-02-11 23:51 EST
- **Completed:** 2026-02-12 06:48 EST
- **Min Model:** sonnet
- **Description:** TypeScript types for Matrix authentication
- **Files Created:**
  - `apps/web/lib/matrix/types/auth.ts`
- **Types Defined:**
  - `MatrixCredentials`, `MatrixSession`, `MatrixUser`
  - `AuthState` (discriminated union), `LoginRequest`/`LoginResponse`
  - `RegisterRequest`/`RegisterResponse`, `RegistrationFlowInfo`
  - Type guards: `isAuthenticated()`, `isAuthError()`, `isAuthLoading()`
- **Summary:** All auth-related data has proper types. No `any` types. Strict typing throughout.

### haos-v2-matrix-login-p1-1-b: Implement Matrix Login Function ✅
- **Status:** completed
- **Started:** 2026-02-12 06:50 EST
- **Completed:** 2026-02-12 06:54 EST
- **Min Model:** sonnet
- **Depends On:** haos-v2-matrix-auth-types-p1-1-a
- **Description:** Function to authenticate with Matrix homeserver
- **Files Created:**
  - `apps/web/lib/matrix/auth.ts`
- **Functions Implemented:**
  - `loginWithPassword(username, password): Promise<MatrixSession>`
  - `validateSession(accessToken): Promise<MatrixUser>`
  - Bonus: `logout()`, `logoutAll()`, `refreshAccessToken()`
- **Summary:** Full auth implementation with well-known discovery, proper error handling via MatrixAuthError class, and JSDoc documentation. TypeScript compiles cleanly, lint passes, no 'any' types.

### haos-v2-matrix-registration-p1-1-c: Implement Matrix Registration Function ✅
- **Status:** completed
- **Started:** 2026-02-12 00:14 EST
- **Completed:** 2026-02-12 00:23 EST
- **Parent:** haos-v2-auth-manager-p1-1
- **Min Model:** sonnet
- **Depends On:** haos-v2-matrix-auth-types-p1-1-a
- **Description:** Function to register new Matrix accounts
- **Files Modified:**
  - `apps/web/lib/matrix/auth.ts`
- **Functions Implemented:**
  - `register(username, password, email?): Promise<MatrixSession>` with full UIAA support
  - `checkUsernameAvailable(username): Promise<boolean>`
- **Summary:** Full registration with UIAA flow support (dummy, terms, email). Build ✅ Lint ✅

### haos-v2-session-cookies-p1-1-d: Create Session Cookie Management ✅
- **Status:** completed
- **Started:** 2026-02-12 00:14 EST
- **Completed:** 2026-02-12 00:24 EST
- **Parent:** haos-v2-auth-manager-p1-1
- **Min Model:** sonnet
- **Depends On:** haos-v2-matrix-login-p1-1-b
- **Description:** Secure cookie handling for Matrix sessions
- **Files Created:**
  - `apps/web/lib/matrix/cookies.ts`
- **Functions Implemented:**
  - `setSessionCookie`, `getSessionCookie`, `clearSessionCookie`
  - `hasSessionCookie`, `updateSessionTokens`
- **Summary:** Secure httpOnly cookies with proper flags. Build ✅ Lint ✅

### haos-v2-auth-provider-p1-1-e: Create MatrixAuthProvider Context ✅
- **Status:** completed
- **Started:** 2026-02-12 00:25 EST
- **Completed:** 2026-02-12 00:53 EST
- **Parent:** haos-v2-auth-manager-p1-1
- **Min Model:** sonnet
- **Depends On:** haos-v2-session-cookies-p1-1-d
- **Description:** React context providing auth state to app
- **Files Created:**
  - `components/providers/matrix-auth-provider.tsx`
  - `lib/matrix/actions/auth.ts`
- **Summary:** MatrixAuthProvider context with useMatrixAuth() hook. Auto-validates session on mount, secure cookie handling via server actions. Build ✅ Lint ✅ Commit: 248f201

---

## Phase 1.4: Matrix Service Layer

### haos-v2-space-service-p1-4-a: Create Space Service
- **Status:** completed
- **Completed:** 2026-02-14 19:30 EST
- **Min Model:** sonnet
- **Depends On:** haos-v2-sync-manager-p1-2 (in-progress)
- **Description:** Service for Matrix space (server) operations
- **Files to Create:**
  - `apps/web/services/matrix-space.ts`
- **Functions:**
  - `createSpace(name, avatar?): Promise<Space>`
  - `getSpace(spaceId): Promise<Space>`
  - `joinSpace(spaceId): Promise<void>`
  - `leaveSpace(spaceId): Promise<void>`
  - `updateSpace(spaceId, data): Promise<void>`
  - `deleteSpace(spaceId): Promise<void>`
  - `getSpaceChildren(spaceId): Promise<Room[]>`
- **Success Criteria:**
  - All CRUD operations work
  - Spaces visible in room list
  - Children (channels) accessible

### haos-v2-room-service-p1-4-b: Create Room Service
- **Status:** completed
- **Completed:** 2026-02-17 05:48 EST
- **Min Model:** sonnet
- **Depends On:** haos-v2-space-service-p1-4-a
- **Description:** Service for Matrix room (channel) operations
- **Files to Create:**
  - `apps/web/services/matrix-room.ts`
- **Functions:**
  - `createRoom(name, type, parentSpaceId): Promise<Room>`
  - `getRoom(roomId): Promise<Room>`
  - `joinRoom(roomId): Promise<void>`
  - `leaveRoom(roomId): Promise<void>`
  - `updateRoom(roomId, data): Promise<void>`
  - `deleteRoom(roomId): Promise<void>`
  - `getRoomType(room): 'text' | 'audio' | 'video'`
- **Success Criteria:**
  - Channels can be created in spaces
  - Room types (text/audio/video) work
  - Room deletion works

### haos-v2-member-service-p1-4-c: Create Member Service
- **Status:** in-progress
- **Min Model:** sonnet
- **Depends On:** haos-v2-room-service-p1-4-b
- **Description:** Service for membership operations
- **Files to Create:**
  - `apps/web/services/matrix-member.ts`
- **Functions:**
  - `getMembers(roomId): Promise<Member[]>`
  - `inviteMember(roomId, userId): Promise<void>`
  - `kickMember(roomId, userId, reason?): Promise<void>`
  - `banMember(roomId, userId, reason?): Promise<void>`
  - `unbanMember(roomId, userId): Promise<void>`
  - `setPowerLevel(roomId, userId, level): Promise<void>`
  - `getMemberRole(roomId, userId): string`
- **Success Criteria:**
  - Member list accurate
  - Moderation actions work
  - Power levels map to roles

### haos-v2-message-service-p1-4-d: Create Message Service
- **Status:** pending
- **Min Model:** sonnet
- **Depends On:** haos-v2-member-service-p1-4-c
- **Description:** Service for message operations
- **Files to Create:**
  - `apps/web/services/matrix-message.ts`
- **Functions:**
  - `sendMessage(roomId, content): Promise<string>`
  - `sendFile(roomId, file): Promise<string>`
  - `editMessage(roomId, eventId, newContent): Promise<void>`
  - `deleteMessage(roomId, eventId): Promise<void>`
  - `addReaction(roomId, eventId, emoji): Promise<void>`
  - `removeReaction(roomId, eventId, emoji): Promise<void>`
- **Success Criteria:**
  - Messages send and appear
  - Edit/delete work
  - Reactions work

### haos-v2-dm-service-p1-4-e: Create DM Service
- **Status:** pending
- **Min Model:** sonnet
- **Depends On:** haos-v2-message-service-p1-4-d
- **Description:** Service for direct message rooms
- **Files to Create:**
  - `apps/web/services/matrix-dm.ts`
- **Functions:**
  - `getOrCreateDM(userId): Promise<Room>`
  - `getDMRooms(): Promise<Room[]>`
  - `isDMRoom(room): boolean`
- **Success Criteria:**
  - Can start DM with any user
  - DMs appear in correct section
  - Existing DMs are reused

### haos-v2-invite-service-p1-4-f: Create Invite Service
- **Status:** pending
- **Min Model:** sonnet
- **Depends On:** haos-v2-dm-service-p1-4-e
- **Description:** Service for invite code handling
- **Files to Create:**
  - `apps/web/services/matrix-invite.ts`
- **Functions:**
  - `createInviteLink(spaceId, maxUses?): Promise<string>`
  - `getInviteInfo(inviteCode): Promise<InviteInfo>`
  - `redeemInvite(inviteCode): Promise<Space>`
  - `revokeInvite(inviteCode): Promise<void>`
- **Implementation Notes:**
  - Use custom state event `io.haos.invite`
  - Or use Matrix room aliases creatively
- **Success Criteria:**
  - Invite links can be generated
  - Links can be shared and redeemed
  - Links can be revoked

---

## Phase 1.3: Media Upload Migration

### haos-v2-matrix-media-types-p1-3-a: Create Matrix Media Types ✅
- **Status:** completed
- **Started:** 2026-02-12 06:02 EST
- **Completed:** 2026-02-15 20:38 EST
- **Min Model:** sonnet
- **Description:** TypeScript types for Matrix media handling and mxc:// URLs
- **Files Created:**
  - `lib/matrix/types/media.ts` (12.2kB, 437 lines)
- **Types Defined:**
  - `MxcUrl` (branded string type with validation functions)
  - `UploadProgress` (complete upload state tracking)
  - `MediaInfo` (dimensions, size, mimetype with metadata)
  - `ThumbnailInfo` (thumbnail-specific properties)
- **Success Criteria:** ✅ ALL MET
  - ✅ All media data strongly typed (no `any` types)
  - ✅ mxc:// URLs have distinct branded type for safety
  - ✅ Comprehensive utility functions for URL conversion and validation

### haos-v2-media-upload-service-p1-3-b: Create Media Upload Service
- **Status:** completed
- **Started:** 2026-02-12 06:08 EST
- **Completed:** 2026-02-15 21:44 EST
- **Min Model:** sonnet
- **Depends On:** haos-v2-matrix-media-types-p1-3-a (COMPLETED)
- **Description:** Functions for uploading files to Matrix content repository
- **Files Created:**
  - `lib/matrix/media.ts` ✅ (18.5KB production-ready implementation)
- **Functions:**
  - `uploadMedia(file: File, onProgress?): Promise<MxcUrl>` ✅
  - `uploadThumbnail(file: File, width, height): Promise<MxcUrl>` ✅
- **Success Criteria:**
  - Files upload to Matrix server ✅ (XMLHttpRequest to /_matrix/media/v3/upload)
  - Progress callback works correctly ✅ (xhr.upload.addEventListener)
  - Returns valid mxc:// URL ✅ (MxcUrl branded type)

### haos-v2-use-media-upload-p1-3-c: Create useMediaUpload Hook
- **Status:** completed
- **Completed:** 2026-02-15 22:30 EST
- **Min Model:** sonnet
- **Depends On:** haos-v2-media-upload-service-p1-3-b
- **Description:** React hook for file uploads with progress state
- **Files to Create:**
  - `apps/web/hooks/use-media-upload.ts`
- **Returns:**
  - `upload(file: File): Promise<MxcUrl>`
  - `progress: number`
  - `isUploading: boolean`
  - `error: Error | null`
  - `cancel(): void`
- **Success Criteria:**
  - Progress updates smoothly
  - Can cancel in-flight uploads
  - Error states accessible to UI

### haos-v2-use-mxc-url-p1-3-d: Create useMxcUrl Hook
- **Status:** completed
- **Completed:** 2026-02-15 22:50 EST
- **Min Model:** sonnet
- **Depends On:** haos-v2-matrix-media-types-p1-3-a
- **Description:** Hook to convert mxc:// URLs to HTTP URLs for display
- **Files Created:**
  - `apps/web/hooks/use-mxc-url.ts` — React hook implementation (7.5KB)
- **Parameters:** `mxcUrl: string, width?: number, height?: number`
- **Returns:** `httpUrl: string | null`
- **Success Criteria:** ✅ ALL MET
  - ✅ Converts mxc:// to homeserver URL
  - ✅ Supports thumbnail dimensions
  - ✅ Handles invalid URLs gracefully

### haos-v2-matrix-image-p1-3-e: Create MatrixImage Component
- **Status:** completed
- **Started:** 2026-02-12 07:30 EST
- **Completed:** 2026-02-16 08:00 EST
- **Min Model:** sonnet
- **Depends On:** haos-v2-use-mxc-url-p1-3-d (COMPLETED)
- **Description:** Image component that handles mxc:// URLs with Next.js optimization
- **Files Created:**
  - ✅ `components/matrix-image.tsx` (8KB production-ready component)
  - ✅ `hooks/use-mxc-url.ts` (relocated to root for consistency)
- **Props:**
  - `mxcUrl: string`
  - `alt: string`
  - `width/height: number`
  - `thumbnail?: boolean`
- **Success Criteria:**
  - ✅ Renders images from Matrix correctly
  - ✅ Supports Next.js Image optimization
  - ✅ Loading/error states handled

### haos-v2-file-upload-p1-3-f: Create FileUpload Component ✅
- **Status:** completed
- **Started:** 2026-02-12 07:31 EST
- **Completed:** 2026-02-16 20:30 EST
- **Min Model:** sonnet
- **Depends On:** haos-v2-use-media-upload-p1-3-c (COMPLETED)
- **Description:** Drag-drop file upload UI component
- **Files Created:**
  - `apps/web/components/file-upload.tsx` (13.8KB production-ready component)
  - `components/ui/progress.tsx` (Progress component - no external deps)
  - `components/ui/card.tsx` (Card layout components)
- **Features Completed:**
  - ✅ Dropzone for drag and drop with visual feedback
  - ✅ File preview with image thumbnails and file info
  - ✅ Real-time progress indicator during upload
  - ✅ File type and size validation with configurable limits
- **Success Criteria:** ✅ ALL MET
  - ✅ Drag and drop works correctly with hover states
  - ✅ Shows upload progress via useMediaUpload hook
  - ✅ Validates file types and sizes with clear error messages

### haos-v2-message-attachment-p1-3-g: Create MessageAttachment Component
- **Status:** ✅ completed
- **Started:** 2026-02-12 07:32 EST
- **Completed:** 2026-02-12 13:30 EST
- **Min Model:** sonnet
- **Depends On:** haos-v2-matrix-image-p1-3-e
- **Description:** Component for displaying file attachments in messages
- **Files Created:**
  - ✅ `apps/web/components/chat/message-attachment.tsx`
- **Features:**
  - ✅ Image preview (inline display)
  - ✅ File download link
  - ✅ Audio/video player (implemented)
  - ✅ File size and type display
- **Success Criteria:**
  - ✅ Images render inline properly
  - ✅ Files are downloadable
  - ✅ Graceful fallback for unknown types

### haos-v2-remove-uploadthing-p1-3-h: Remove UploadThing Dependencies
- **Status:** pending
- **Min Model:** haiku
- **Depends On:** haos-v2-message-attachment-p1-3-g
- **Description:** Clean removal of all UploadThing code and dependencies
- **Files to Delete:**
  - `apps/web/app/api/uploadthing/` (if exists)
  - Any uploadthing config files
  - Remove from package.json
- **Success Criteria:**
  - `pnpm build` passes without UploadThing
  - No UploadThing references remain
  - Bundle size reduced

---

## Phase 1.2: Real-Time Sync Migration

### haos-v2-sync-manager-p1-2: Real-Time Sync Migration (Manager)
- **Status:** in-progress (manager)
- **Started:** 2026-02-12 01:01 EST
- **Min Model:** opus
- **Description:** Coordinate sync migration — migrate from Socket.io to Matrix sync
- **Sub-Tasks:**
  - haos-v2-matrix-client-singleton-p1-2-a: ✅ completed
  - haos-v2-matrix-provider-p1-2-b: ✅ completed
  - haos-v2-use-matrix-client-p1-2-c: ✅ completed
  - haos-v2-use-room-p1-2-d: ✅ completed
  - haos-v2-use-room-messages-p1-2-e: pending (blocked by d)
- **Manager Notes:**
  - [01:01] Manager created, 5 initial sub-tasks populated
  - [01:02] Starting p1-2-a (Matrix Client Singleton)
  - [02:20] p1-2-a completed (Matrix Client Singleton) — lib/matrix/client.ts
  - [08:15] p1-2-b completed (MatrixProvider) — components/providers/matrix-provider.tsx
  - [16:45] p1-2-c completed (useMatrixClient) — hooks/use-matrix-client.ts

### haos-v2-matrix-client-singleton-p1-2-a: Create Matrix Client Singleton ✅
- **Status:** completed
- **Started:** 2026-02-12 01:02 EST
- **Completed:** 2026-02-12 02:20 EST
- **Parent:** haos-v2-sync-manager-p1-2
- **Min Model:** sonnet (escalated to opus)
- **Description:** Singleton Matrix SDK client instance
- **Files Created:**
  - `lib/matrix/client.ts` — Singleton with initializeClient, getClient, hasClient, destroyClient
- **Functions:**
  - `initializeClient(session: MatrixSession): MatrixClient`
  - `getClient(): MatrixClient | null`
  - `hasClient(): boolean`
  - `destroyClient(): void`
- **Summary:** Singleton pattern implemented with auto-cleanup of existing client, proper validation, sync start on init, and listener cleanup on destroy. Added matrix-js-sdk 40.3.0-rc.0. Build ✅ Lint ✅ Commit: e6eb73b

---

## Phase 2 Tasks (UI Reskin)

### p2-1-b: Implement Server Icon Component ✅
- **Status:** completed
- **Completed:** 2026-02-12 19:15 EST
- **Min Model:** sonnet
- **Depends On:** p2-1-a (completed)
- **Description:** Server icon with avatar/fallback, hover animations, and status indicators
- **Files Modified:**
  - `components/navigation/navigation-item.tsx` — Enhanced animations
- **Features:**
  - ✅ Round → square on hover animation (smooth transitions)
  - ✅ First letter fallback for missing avatars (via getSpaceInitials)
  - ✅ Active/unread indicators (multi-state pill + badges)
- **Success Criteria:** ✅ ALL MET
  - ✅ Icons animate smoothly on hover (duration-200 ease-in-out)
  - ✅ Fallback renders for missing avatars (handles edge cases)
  - ✅ Visual indicators work correctly (4 distinct states)

### p2-1-c: Implement Add Server Button ✅
- **Status:** completed
- **Started:** 2026-02-12 03:31 EST
- **Completed:** 2026-02-12 19:45 EST
- **Min Model:** sonnet
- **Depends On:** p2-1-a (completed)
- **Description:** Plus button to create/join server with modal integration
- **Files Created:**
  - `components/navigation/navigation-action.tsx` (already existed)
- **Features:**
  - ✅ Opens modal on click (onOpen("createServer"))
  - ✅ Green accent color matching Discord (emerald-500)
  - ✅ Tooltip on hover ("Add a server")
  - ✅ Discord-style hover animations (round→square)
- **Success Criteria:** ✅ ALL MET
  - ✅ Opens create server modal correctly
  - ✅ Styling matches Discord design
  - ✅ Tooltip displays properly
- **Summary:** Component already existed and met all requirements. Likely completed as part of p2-1-a.

### p2-1-d: Implement User Panel ✅
- **Status:** completed
- **Completed:** 2026-02-12 20:12 EST
- **Min Model:** sonnet
- **Depends On:** p2-1-a (completed)
- **Description:** User info panel at bottom of sidebar with controls
- **Files Created:**
  - `components/navigation/user-panel.tsx` — Discord-style user panel component
- **Files Modified:**
  - `hooks/use-modal-store.ts` — Added "userSettings" modal type
  - `components/navigation/navigation-sidebar.tsx` — Integrated UserPanel
- **Features:** ✅ ALL COMPLETED
  - User avatar and display name with Matrix auth integration
  - Online status indicator (green/yellow/gray dots)
  - Settings, mute, deafen buttons with hover tooltips
  - Discord-style animations and visual feedback
- **Success Criteria:** ✅ ALL MET
  - Shows current user information from MatrixAuthProvider
  - Settings button opens user settings modal 
  - Audio controls implemented (ready for voice system integration)
- **Validation:** Build ✅, Lint ✅, TypeScript ✅

### p2-2-a: Implement Channel Sidebar
- **Status:** completed
- **Completed:** 2026-02-12 15:05 EST
- **Min Model:** sonnet
- **Depends On:** p1-4-a (Space Service - pending)
- **Description:** Discord-style channel list with categories and member toggle
- **Files to Create/Modify:**
  - `apps/web/components/server/server-sidebar.tsx`
- **Features:**
  - Server name header with dropdown ✅
  - Channel categories (collapsible) ✅
  - Channel list with type icons ✅
  - Member list toggle ✅
- **Success Criteria:**
  - Shows all channels in current space ✅
  - Categories collapse/expand properly ✅
  - Layout matches Discord design ✅
- **Implementation Notes:**
  - Added collapsible ServerSection with chevron animation
  - Created ServerSidebarContent client component for interactivity
  - Member toggle uses eye/eye-off icons
  - Git commit: 62b339a
- **Started:** 2026-02-12 21:20 EST

### p2-2-b: Implement Server Header
- **Status:** completed
- **Completed:** 2026-02-14 02:05 EST
- **Min Model:** sonnet
- **Depends On:** p1-4-a (Space Service - pending)
- **Description:** Server name dropdown header with action menu
- **Files Modified:**
  - `components/server/server-header.tsx` — Complete rewrite with Matrix power levels
  - `components/server/server-sidebar-content.tsx` — Updated to use new header
  - `hooks/use-modal-store.ts` — Added new modal types
- **Features Implemented:**
  - ✅ Server name with dropdown arrow
  - ✅ Dropdown menu with 11 role-based actions
  - ✅ Server boost indicator (pink rocket)
  - ✅ Verification/partner badges
  - ✅ Matrix power level support
  - ✅ Legacy Prisma compatibility via adapter
- **Success Criteria:** ✅ ALL MET
  - ✅ Dropdown opens on click
  - ✅ Menu actions trigger correctly
  - ✅ Server name displays properly
- **Git Commit:** 23bbae7

### p2-2-c: Implement Channel Category
- **Status:** pending
- **Min Model:** sonnet
- **Depends On:** p2-2-a
- **Description:** Collapsible channel category sections
- **Files to Create:**
  - `apps/web/components/server/server-section.tsx`
- **Features:**
  - Category name with collapse arrow
  - Create channel button (admin only)
  - Smooth collapse/expand animation
- **Success Criteria:**
  - Categories toggle state correctly
  - State persists per server
  - Add button shows for admins only

### p2-2-d: Implement Channel Item
- **Status:** pending
- **Min Model:** sonnet
- **Depends On:** p2-2-c
- **Description:** Individual channel row with type icons and status
- **Files to Create/Modify:**
  - `apps/web/components/server/server-channel.tsx`
- **Features:**
  - Icons by type (text #, voice 🔊, video 📹)
  - Channel name with active state
  - Unread/mention indicators
  - Hover actions (edit, invite, delete)
- **Success Criteria:**
  - Correct icons display per channel type
  - Active state clearly visible
  - Action buttons work properly

### p2-3-a: Implement Message List Container ✅
- **Status:** completed
- **Started:** 2026-02-14 01:30 EST
- **Completed:** 2026-02-14 01:50 EST  
- **Min Model:** sonnet
- **Depends On:** p1-2-e (completed)
- **Description:** Scrollable message timeline with infinite scroll
- **Files Created:**
  - `components/chat/chat-messages.tsx` — Complete Matrix-based rewrite (15.5KB)
- **Features Implemented:**
  - ✅ Infinite scroll with loadMore() function from useRoomMessages hook
  - ✅ Auto-scroll to bottom for new messages with scroll detection
  - ✅ Date separators between days ("Today", "Yesterday", formatted dates)
  - ✅ "New messages" indicator with jump button when scrolled up
  - ✅ Message grouping (same sender within 5min threshold)
  - ✅ Discord-style hover effects and styling patterns
  - ✅ Performance optimized with React refs and scroll callbacks
- **Success Criteria:** ✅ ALL MET
  - ✅ Smooth scrolling performance with optimized React patterns
  - ✅ Loads message history on scroll up via useRoomMessages loadMore()
  - ✅ Sticks to bottom for new messages with auto-scroll logic
- **Implementation Notes:**
  - Replaced old Prisma useChatQuery/useChatSocket with Matrix useRoomMessages
  - 15.5KB production-ready implementation with comprehensive TypeScript
  - Git commit: d31a4bc

### p2-3-b: Implement Message Item
- **Status:** completed
- **Started:** 2026-02-12 06:12 EST
- **Completed:** 2026-02-15 21:30 EST
- **Min Model:** sonnet
- **Depends On:** p2-3-a
- **Description:** Individual message display with rich content support
- **Files to Create/Modify:**
  - `components/chat/chat-item.tsx` ✅ (18KB production-ready)
- **Features:**
  - Avatar, username, timestamp layout ✅
  - Message content with markdown rendering ✅
  - Inline attachment display ✅
  - Reaction buttons below message ✅
  - Edited indicator ✅
- **Success Criteria:**
  - Layout matches Discord message design ✅
  - Markdown renders correctly ✅
  - Timestamps format appropriately ✅

### p2-1-a: Implement Server Sidebar ✅
- **Status:** completed
- **Started:** 2026-02-12 11:45 EST
- **Completed:** 2026-02-12 12:15 EST
- **Parent:** p2-1 (Server Sidebar / Navigation Components)
- **Min Model:** opus
- **Description:** Discord-style server/space sidebar with DM button, server icons, add button
- **Files Created:**
  - `lib/matrix/types/space.ts` — Space/channel types for navigation
  - `components/navigation/navigation-dm.tsx` — DM shortcut button
  - `hooks/use-spaces.ts` — Spaces hook (mock data, ready for Matrix)
- **Files Modified:**
  - `components/navigation/navigation-sidebar.tsx` — Client component with full Discord layout
  - `components/navigation/navigation-item.tsx` — Letter fallback, badges, hover animations
  - `next.config.js` — Fixed server actions (pre-existing issue)
- **Features:**
  - ✅ DM shortcut at top with unread badge
  - ✅ Server icons with letter fallback
  - ✅ Active server indicator (pill on left)
  - ✅ Hover animations (round → square corners)
  - ✅ Add server button (green plus icon)
  - ✅ User panel at bottom
  - ✅ Loading skeleton states
- **Verification:**
  - Build ✅ Lint ✅ TypeScript ✅
- **Integration Notes:**
  - `useSpaces()` hook returns empty array until Matrix SDK integration (p1-2-b, p1-4-a)
  - When Matrix client ready, update `hooks/use-spaces.ts` to use real data

### haos-v2-matrix-provider-p1-2-b: Create MatrixProvider Context ✅
- **Status:** completed
- **Started:** 2026-02-12 08:05 EST
- **Completed:** 2026-02-12 08:15 EST
- **Parent:** haos-v2-sync-manager-p1-2
- **Min Model:** sonnet (ran as opus)
- **Depends On:** haos-v2-matrix-client-singleton-p1-2-a
- **Description:** React context managing Matrix client lifecycle
- **Files Created:**
  - `components/providers/matrix-provider.tsx` — 381 lines
- **Context Values:**
  - `client: MatrixClient | null`
  - `syncState: SyncState | null`
  - `rooms: Room[]`
  - `isReady: boolean`
  - `isSyncing: boolean`
  - `syncError: Error | null`
- **Actions:**
  - `getRoom(roomId): Room | null`
  - `refreshRooms(): void`
- **Success Criteria:**
  - ✅ Client initializes when user logs in (via MatrixAuthProvider session)
  - ✅ Sync state exposed to components (SyncState enum)
  - ✅ Rooms update in real-time (listens to ClientEvent.Room/DeleteRoom)
- **Verification:**
  - Build: ✅ `pnpm build` passes
  - Lint: ✅ `pnpm lint` passes
- **Commit:** c56367d

### haos-v2-use-matrix-client-p1-2-c: Create useMatrixClient Hook ✅
- **Status:** completed
- **Started:** 2026-02-12 01:30 EST
- **Completed:** 2026-02-12 16:45 EST
- **Min Model:** sonnet
- **Depends On:** haos-v2-matrix-provider-p1-2-b (COMPLETED)
- **Description:** Hook to access Matrix client
- **Files Created:**
  - `hooks/use-matrix-client.ts`
- **Returns:**
  - `client: MatrixClient | null`
  - `isReady: boolean`
- **Success Criteria:** ✅ All Met
  - ✅ Throws error if used outside provider (MatrixClientContextError)
  - ✅ Type-safe client access with full TypeScript types
  - ✅ Build passes (`pnpm build`)
  - ✅ Lint passes (`pnpm lint`)
- **Parent:** haos-v2-sync-manager-p1-2
- **Summary:** Hook implemented with focused interface (client + isReady), custom error handling, performance optimization with useMemo, and comprehensive documentation. Type-safe access to Matrix client from components.

### haos-v2-use-room-p1-2-d: Create useRoom Hook ✅
- **Status:** completed
- **Started:** 2026-02-12 01:54 EST
- **Completed:** 2026-02-12 07:02 EST
- **Min Model:** sonnet
- **Depends On:** haos-v2-matrix-provider-p1-2-b
- **Description:** Hook to access single room data
- **Files to Create:**
  - `hooks/use-room.ts`
- **Parameters:** `roomId: string`
- **Returns:**
  - `room: Room | null`
  - `members: RoomMember[]`
  - `isLoading: boolean`
  - `error: Error | null`
- **Success Criteria:**
  - Room data reactive to changes
  - Members list updates on join/leave
  - Handles room not found

### haos-v2-use-room-messages-p1-2-e: Create useRoomMessages Hook
- **Status:** completed
- **Completed:** 2026-02-11 00:40 EST
- **Min Model:** sonnet
- **Depends On:** haos-v2-use-room-p1-2-d
- **Description:** Hook for room message timeline
- **Files Created:**
  - `hooks/use-room-messages.ts` (498 lines)
- **Parameters:** `roomId: string`
- **Returns:**
  - `messages: TimelineEvent[]`
  - `isLoading: boolean`
  - `loadMore(): Promise<void>`
  - `hasMore: boolean`
  - `error: Error | null`
  - `isLoadingMore: boolean`
- **Success Criteria:** ✅
  - Messages appear in real-time (RoomEvent.Timeline)
  - Can paginate backwards (client.paginateEventTimeline)
  - Handles edit/delete updates (RoomEvent.Redaction)

---

## Phase 2 Tasks (UI Reskin)

### p2-1-a: Implement Server Sidebar ✅
- **Status:** completed
- **Started:** 2026-02-12 12:00 EST
- **Completed:** 2026-02-12 12:25 EST
- **Parent:** p2-1 (Server Sidebar / Navigation Components)
- **Min Model:** opus
- **Description:** Discord-style server sidebar with spaces
- **Files Created:**
  - `lib/matrix/types/space.ts` — Space type definitions
  - `hooks/use-spaces.ts` — Space fetching hooks
  - `components/navigation/navigation-dm.tsx` — DM shortcut button
- **Files Modified:**
  - `components/navigation/navigation-item.tsx` — MXC URL support, badges
  - `components/navigation/navigation-sidebar.tsx` — Client component with hooks
- **Features Implemented:**
  - ✅ Server icons with hover effects (round → square)
  - ✅ Active server indicator pill
  - ✅ DM shortcut at top
  - ✅ Add server button
  - ✅ User avatar with online indicator
  - ✅ Loading skeletons
  - ✅ Empty state for no servers
  - ✅ Unread/mention badges
  - ✅ MXC to HTTP URL conversion
  - ✅ Fallback initials
- **Verification:**
  - Build: ✅ `pnpm build` passes
  - Lint: ✅ `pnpm lint` passes
  - TypeScript: ✅ No errors, no `any` types
- **Summary:** Navigation sidebar converted from server component with Prisma to client component using Matrix auth hooks. Uses temporary `useSpaces()` stub that will integrate with Matrix sync once p1-2-b complete.
- **Commit:** e6eb73b (combined with p1-2-a Matrix client)

---

## Phase 0 Tasks (Completed)

### haos-v2-monorepo-init-p0-1-a: Initialize Monorepo Structure ✅
- **Status:** completed
- **Completed:** 2026-02-11 12:16 PM EST
- **Summary:** Monorepo initialized with pnpm workspace. All 3 projects detected. Minor note: matrix-js-sdk dependency in pre-existing web app needs `onlyBuiltDependencies` config later.

### haos-v2-typescript-config-p0-1-b: Configure TypeScript ✅
- **Status:** completed
- **Completed:** 2026-02-11 12:32 PM EST
- **Summary:** Created tsconfig.base.json (strict mode, ES2022, path aliases), apps/web/tsconfig.json, packages/shared/tsconfig.json, and root tsconfig.json with project references. `pnpm exec tsc --noEmit` passes.

### haos-v2-eslint-prettier-p0-1-c: Configure ESLint & Prettier ✅
- **Status:** completed
- **Completed:** 2026-02-11 12:47 PM EST
- **Summary:** Created .eslintrc.js (TypeScript, React, Next.js rules), .prettierrc (with Tailwind plugin), .prettierignore, and added lint/format scripts. `pnpm lint` and `pnpm format:check` both pass.

### haos-v2-nextjs-init-p0-5-a: Initialize Next.js 14 App ✅
- **Status:** completed
- **Completed:** 2026-02-11 1:00 PM EST
- **Summary:** Created Next.js 14 app structure with dark theme. `pnpm dev` runs on localhost:3000.

### haos-v2-discord-clone-p0-4-a: Clone Discord Clone Repository ✅
- **Status:** completed
- **Completed:** 2026-02-11 1:15 PM EST
- **Summary:** Discord clone repo cloned to /tmp/discord-clone-source. Working tree clean.

### haos-v2-discord-audit-p0-4-b: Audit Discord Clone Structure ✅
- **Status:** completed
- **Completed:** 2026-02-11 1:31 PM EST
- **Summary:** Created comprehensive inventory at `~/clawd/docs/haos-v2/DISCORD-CLONE-INVENTORY.md` documenting all components, hooks, utilities, and Matrix adaptation needs.

### haos-v2-ui-components-p0-4-c: Copy UI Components to HAOS ✅
- **Status:** completed
- **Completed:** 2026-02-11 2:30 PM EST
- **Summary:** 19 shadcn/ui components copied to `apps/web/src/components/ui/` with index.ts barrel export. Imports use relative paths (`../../lib/utils`). Dependencies already present in Element Web package.json. `components.json` configured.
- **Note:** Build fails due to pre-existing monorepo resolution bug (unrelated to this task) - see haos-v2-fix-build-p0

### haos-v2-fix-build-p0: Fix Monorepo Build Resolution Bug ❌ ABANDONED
- **Status:** abandoned
- **Abandoned:** 2026-02-11 11:00 PM EST
- **Reason:** Intractable tech debt from Element Web fork. Multiple sub-agents hit the same wall (webpack resolution + yarn workspace hoisting + lodash alias conflicts). Strategic decision: focus on haos-v2 instead of fixing legacy code.
- **See:** `scheduler/progress/p0-fix-build.md` for full failure analysis
- **See:** `/home/ubuntu/repos/haos/DEPRECATED.md` for deprecation notice

### haos-v2-tailwind-styling-p0-4-e: Copy Styling and Tailwind Config ✅
- **Status:** completed
- **Completed:** 2026-02-11 9:19 PM EST
- **Summary:** Tailwind v3 configured with dark theme CSS variables. Used `.cjs` extensions for configs (ESM compatibility). JIT compiles in 246ms.

### haos-v2-github-actions-p0-6-a: Create GitHub Actions Build Workflow ✅
- **Status:** completed
- **Completed:** 2026-02-11 00:31 AM EST
- **Min Model:** sonnet
- **Depends On:** haos-v2-monorepo-init-p0-1-a
- **Description:** CI that builds on every PR
- **Summary:** Created `.github/workflows/build.yml` with checkout, Node.js 20, pnpm 9 (with caching), install, lint, typecheck, and build steps. Triggers on push to main and PRs. Includes concurrency control.
- **Files Created:**
  - `/home/ubuntu/repos/haos/.github/workflows/build.yml`

### haos-v2-dev-setup-guide-p0-7-a: Create Development Setup Guide ✅
- **Status:** completed
- **Started:** 2026-02-11 11:08 PM EST
- **Completed:** 2026-02-11 HH:MM EST
- **Min Model:** sonnet
- **Depends On:** haos-v2-nextjs-init-p0-5-a
- **Description:** Complete setup instructions for new devs
- **Deliverables:**
  - `~/clawd/docs/haos-v2/DEV-SETUP.md`
- **Success Criteria:**
  - Doc is complete and accurate
  - A new dev could follow it
- **Summary:** Comprehensive development setup guide created with sections on prerequisites, installation, environment setup, Matrix connection, and troubleshooting.

---

## Phase 0 Verification Tasks

### haos-v2-phase0-verify-p0-verify: Phase 0 Completion Check ✅
- **Status:** completed
- **Completed:** 2026-02-12 00:40 EST
- **Min Model:** opus
- **Summary:** All verification checks pass (pnpm install, dev, lint, build). Fixed 2 TypeScript issues in shadcn components (dialog.tsx, sheet.tsx - Radix UI breaking change). Added note about running `prisma generate` after install.
- **See:** `scheduler/progress/p0-verify.md` for full details
- **Verdict:** ✅ Phase 0 COMPLETE - Ready for Phase 1

---

## Completed Tasks

### haos-v2-task-breakdown-impl-00: Create Task Breakdown ✅
- **Completed:** 2025-02-13
- **Deliverable:** `~/clawd/docs/haos-v2/TASK-BREAKDOWN.md`
- **Summary:** 94 atomic tasks across 4 phases, all with clear deliverables and success criteria

---

## Completed Audits

### haos-v2-implementation-plan-audit-08 ✅
- Created: ~/clawd/docs/haos-v2/IMPLEMENTATION-PLAN.md
- Summary: Comprehensive 4-phase plan (15-20 weeks), all dependencies mapped

### haos-v2-feature-gaps-audit-07 ✅
- Created: ~/clawd/docs/haos-v2/FEATURE-GAPS.md
- Summary: 85% features via Element, gaps identified (E2EE, federation, etc.)

### haos-v2-livekit-integration-audit-06 ✅
- Created: ~/clawd/docs/haos-v2/LIVEKIT-INTEGRATION.md
- Summary: LiveKit already compatible with dev2 setup

### haos-v2-frontend-analysis-audit-01 ✅
- Created: ~/clawd/docs/haos-v2/FRONTEND-AUDIT.md
- Summary: 53 components, 24 routes, clean Next.js 13 structure

### haos-v2-backend-mapping-audit-02 ✅
- Created: ~/clawd/docs/haos-v2/BACKEND-MAPPING.md
- Summary: Prisma → Matrix mapping complete

### haos-v2-auth-strategy-audit-03 ✅
- Created: ~/clawd/docs/haos-v2/AUTH-STRATEGY.md
- Summary: Clerk → Matrix auth migration planned

### haos-v2-realtime-strategy-audit-04 ✅
- Created: ~/clawd/docs/haos-v2/REALTIME-STRATEGY.md
- Summary: Socket.io → Matrix sync migration planned (1709 lines)
- Covers: Messages, typing indicators, presence, read receipts

### haos-v2-media-strategy-audit-05 ✅
- Created: ~/clawd/docs/haos-v2/MEDIA-STRATEGY.md
- Summary: UploadThing → Matrix content API migration (1519 lines)
- Covers: File uploads, thumbnails, avatars, security

---

## Completed Infrastructure (The Counsel & Circle)

### The Counsel ✅
- Spec: ~/clawd/docs/THE-COUNSEL.md
- Skill: ~/clawd/skills/counsel/SKILL.md
- Multi-agent voting for critical decisions

### The Circle ✅
- Spec: ~/clawd/docs/THE-CIRCLE.md
- Skill: ~/clawd/skills/circle/SKILL.md
- Multi-perspective thinking framework

---

## Archived (Low Priority)

All cog-* tasks archived - the core framework is done. Refinements can happen later.
