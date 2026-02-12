# HAOS v2 Task Breakdown

**Version:** 1.0  
**Date:** 2025-02-13  
**Based On:** IMPLEMENTATION-PLAN.md  

---

## Overview

This document breaks down the HAOS v2 implementation into **atomic, actionable, testable tasks**. Each task has:
- **One clear deliverable**
- **Specific files to create/modify**
- **Clear success criteria**

### Task ID Format
`{phase}-{section}-{number}` (e.g., `p0-1-a` = Phase 0, Section 1, Task a)

---

## Phase 0: Foundation (2 weeks)

### 0.1 Development Environment Setup

#### p0-1-a: Initialize Monorepo Structure
- **Deliverable:** pnpm workspace with apps/packages structure
- **Files to Create:**
  ```
  /home/ubuntu/repos/haos/
  ├── package.json (workspace root)
  ├── pnpm-workspace.yaml
  ├── turbo.json (optional, for caching)
  ├── .npmrc
  └── .gitignore
  ```
- **Success Criteria:**
  - `pnpm install` runs without errors
  - Workspace packages resolve correctly

#### p0-1-b: Configure TypeScript
- **Deliverable:** Shared TypeScript config for all packages
- **Files to Create:**
  ```
  tsconfig.base.json
  apps/web/tsconfig.json (extends base)
  packages/shared/tsconfig.json (extends base)
  ```
- **Success Criteria:**
  - `pnpm tsc --noEmit` passes
  - IDE shows no TypeScript errors

#### p0-1-c: Configure ESLint & Prettier
- **Deliverable:** Consistent code style across monorepo
- **Files to Create:**
  ```
  .eslintrc.js
  .prettierrc
  .prettierignore
  apps/web/.eslintrc.js
  ```
- **Success Criteria:**
  - `pnpm lint` runs without errors
  - `pnpm format` formats all files consistently

#### p0-1-d: Create Shared Package Scaffold
- **Deliverable:** `packages/shared` with common types/utilities
- **Files to Create:**
  ```
  packages/shared/
  ├── package.json
  ├── tsconfig.json
  ├── src/
  │   ├── index.ts
  │   └── types/
  │       └── index.ts
  ```
- **Success Criteria:**
  - Can import from `@haos/shared` in apps/web

---

### 0.2 Matrix Homeserver Setup

#### p0-2-a: Verify Synapse Configuration
- **Deliverable:** Documented Synapse config for dev environment
- **Files to Create:**
  ```
  docs/haos-v2/DEV-SETUP.md (Matrix section)
  ```
- **Actions:**
  - Check Synapse is running on dev2
  - Verify federation (if needed) or local-only mode
  - Document admin token location
- **Success Criteria:**
  - Can curl `https://matrix.dev2.aaroncollins.info/_matrix/client/versions`
  - Returns valid JSON response

#### p0-2-b: Create Test User Accounts
- **Deliverable:** 3 test accounts for development
- **Actions:**
  - Create `@alice:haos.local`, `@bob:haos.local`, `@admin:haos.local`
  - Document credentials in secure location
- **Success Criteria:**
  - All accounts can log in via Element Web
  - Admin account has admin privileges

#### p0-2-c: Create Test Spaces and Rooms
- **Deliverable:** Sample data for development testing
- **Actions:**
  - Create "Dev Server" space with 3 channels
  - Create "Test Server" space with 5 channels
  - Add test messages to each
- **Success Criteria:**
  - Spaces visible in Element Web
  - Messages load correctly

---

### 0.3 LiveKit Configuration

#### p0-3-a: Verify LiveKit Connection
- **Deliverable:** Documented LiveKit config with test proof
- **Files to Create:**
  ```
  docs/haos-v2/DEV-SETUP.md (LiveKit section)
  ```
- **Actions:**
  - Test WebSocket connection to `wss://livekit.dev2.aaroncollins.info`
  - Verify API key/secret work
- **Success Criteria:**
  - Can generate valid JWT token
  - Test room joins successfully

#### p0-3-b: Create LiveKit Test Script
- **Deliverable:** Node.js script to test LiveKit integration
- **Files to Create:**
  ```
  scripts/test-livekit.ts
  ```
- **Success Criteria:**
  - Script creates room, generates token, connects
  - Outputs success/failure status

---

### 0.4 Discord Clone Extraction

#### p0-4-a: Clone Discord Clone Repository
- **Deliverable:** Local copy of discord-clone source
- **Actions:**
  ```bash
  git clone https://github.com/nayak-nirmalya/discord-clone /tmp/discord-clone-source
  ```
- **Success Criteria:**
  - Source cloned and readable

#### p0-4-b: Audit and Document Discord Clone Structure
- **Deliverable:** Map of all components we'll reuse
- **Files to Create:**
  ```
  docs/haos-v2/DISCORD-CLONE-INVENTORY.md
  ```
- **Success Criteria:**
  - Every component listed with purpose
  - Dependencies documented

#### p0-4-c: Copy UI Components to HAOS
- **Deliverable:** All reusable UI components in `apps/web/components/ui`
- **Files to Copy/Create:**
  ```
  apps/web/components/ui/
  ├── button.tsx
  ├── dialog.tsx
  ├── dropdown-menu.tsx
  ├── input.tsx
  ├── label.tsx
  ├── modal.tsx
  ├── scroll-area.tsx
  ├── separator.tsx
  ├── sheet.tsx
  ├── tooltip.tsx
  └── ... (all shadcn/ui components)
  ```
- **Success Criteria:**
  - All UI components render without errors
  - No missing dependencies

#### p0-4-d: Copy Feature Components to HAOS
- **Deliverable:** Discord-specific components migrated
- **Files to Copy/Create:**
  ```
  apps/web/components/
  ├── navigation/
  │   ├── navigation-action.tsx
  │   ├── navigation-item.tsx
  │   └── navigation-sidebar.tsx
  ├── server/
  │   ├── server-channel.tsx
  │   ├── server-header.tsx
  │   ├── server-member.tsx
  │   ├── server-search.tsx
  │   ├── server-section.tsx
  │   └── server-sidebar.tsx
  ├── chat/
  │   ├── chat-header.tsx
  │   ├── chat-input.tsx
  │   ├── chat-item.tsx
  │   ├── chat-messages.tsx
  │   └── chat-welcome.tsx
  └── modals/
      ├── create-server-modal.tsx
      ├── create-channel-modal.tsx
      ├── invite-modal.tsx
      ├── members-modal.tsx
      └── ... (all modals)
  ```
- **Success Criteria:**
  - Components compile without TypeScript errors
  - Import paths corrected for new structure

#### p0-4-e: Copy Styling and Tailwind Config
- **Deliverable:** Full styling setup matching Discord clone
- **Files to Copy/Create:**
  ```
  apps/web/tailwind.config.js
  apps/web/postcss.config.js
  apps/web/app/globals.css
  apps/web/components.json (shadcn config)
  ```
- **Success Criteria:**
  - Tailwind JIT compiles
  - Dark theme matches Discord clone

#### p0-4-f: Copy Hooks (for structure reference)
- **Deliverable:** Hook files copied, ready for Matrix adaptation
- **Files to Copy/Create:**
  ```
  apps/web/hooks/
  ├── use-chat-query.ts
  ├── use-chat-scroll.ts
  ├── use-chat-socket.ts (to be replaced)
  ├── use-modal-store.ts
  └── use-origin.ts
  ```
- **Success Criteria:**
  - Hooks imported without errors
  - Socket hooks marked as TODO for replacement

---

### 0.5 Next.js App Setup

#### p0-5-a: Initialize Next.js 14 App
- **Deliverable:** Working Next.js app in `apps/web`
- **Files to Create:**
  ```
  apps/web/
  ├── package.json
  ├── next.config.js
  ├── app/
  │   ├── layout.tsx
  │   ├── page.tsx
  │   └── globals.css
  └── public/
  ```
- **Success Criteria:**
  - `pnpm dev` starts on localhost:3000
  - Home page renders

#### p0-5-b: Configure Next.js for Matrix
- **Deliverable:** Next.js config with Matrix-compatible settings
- **Files to Modify:**
  ```
  apps/web/next.config.js
  ```
- **Config Additions:**
  - CORS headers for Matrix homeserver
  - WebSocket upgrade support
  - Image domains for Matrix content
- **Success Criteria:**
  - No CORS errors connecting to Matrix
  - Images from Matrix load correctly

#### p0-5-c: Create Environment Variable Schema
- **Deliverable:** Documented env vars with validation
- **Files to Create:**
  ```
  apps/web/.env.example
  apps/web/.env.local (gitignored)
  apps/web/lib/env.ts (zod validation)
  ```
- **Success Criteria:**
  - App fails gracefully if env vars missing
  - All required vars documented

---

### 0.6 CI/CD Pipeline

#### p0-6-a: Create GitHub Actions Build Workflow
- **Deliverable:** CI that builds on every PR
- **Files to Create:**
  ```
  .github/workflows/build.yml
  ```
- **Workflow Steps:**
  - Checkout, pnpm install, lint, type-check, build
- **Success Criteria:**
  - Push to PR triggers build
  - Build passes or fails appropriately

#### p0-6-b: Create GitHub Actions Test Workflow
- **Deliverable:** CI that runs tests on every PR
- **Files to Create:**
  ```
  .github/workflows/test.yml
  ```
- **Success Criteria:**
  - Tests run on PR (even if placeholder)
  - Can add real tests later

#### p0-6-c: Create Dependabot Config
- **Deliverable:** Automated dependency updates
- **Files to Create:**
  ```
  .github/dependabot.yml
  ```
- **Success Criteria:**
  - Dependabot creates PRs for updates

---

### 0.7 Development Documentation

#### p0-7-a: Create Development Setup Guide
- **Deliverable:** Complete setup instructions for new devs
- **Files to Create:**
  ```
  docs/haos-v2/DEV-SETUP.md
  ```
- **Sections:**
  - Prerequisites (Node, pnpm, etc.)
  - Clone and install
  - Environment configuration
  - Running locally
  - Testing with Matrix
- **Success Criteria:**
  - New developer can follow guide start to finish
  - All steps work as documented

#### p0-7-b: Create Architecture Overview
- **Deliverable:** High-level architecture document
- **Files to Create:**
  ```
  docs/haos-v2/ARCHITECTURE.md
  ```
- **Contents:**
  - System diagram
  - Component relationships
  - Data flow
  - Matrix integration points
- **Success Criteria:**
  - Diagram accurately represents system
  - Key decisions explained

#### p0-7-c: Create Contributing Guide
- **Deliverable:** Guidelines for contributors
- **Files to Create:**
  ```
  CONTRIBUTING.md
  ```
- **Contents:**
  - Branch naming
  - Commit message format
  - PR process
  - Code style
- **Success Criteria:**
  - Consistent with project standards

---

## Phase 1: Core Integration (6-8 weeks)

### 1.1 Authentication Migration

#### p1-1-a: Create Matrix Auth Types
- **Deliverable:** TypeScript types for Matrix authentication
- **Files to Create:**
  ```
  apps/web/lib/matrix/types/auth.ts
  ```
- **Types to Define:**
  - `MatrixCredentials`
  - `MatrixSession`
  - `MatrixUser`
  - `AuthState`
  - `LoginRequest`/`LoginResponse`
  - `RegisterRequest`/`RegisterResponse`
- **Success Criteria:**
  - All auth-related data has proper types
  - No `any` types in auth flow

#### p1-1-b: Implement Matrix Login Function
- **Deliverable:** Function to authenticate with Matrix homeserver
- **Files to Create:**
  ```
  apps/web/lib/matrix/auth.ts
  ```
- **Functions:**
  - `loginWithPassword(username, password): Promise<MatrixSession>`
  - `validateSession(accessToken): Promise<MatrixUser>`
- **Success Criteria:**
  - Valid credentials return session
  - Invalid credentials throw appropriate error
  - Access token stored in response

#### p1-1-c: Implement Matrix Registration Function
- **Deliverable:** Function to register new Matrix accounts
- **Files to Create:**
  ```
  apps/web/lib/matrix/auth.ts (add to existing)
  ```
- **Functions:**
  - `register(username, password, email?): Promise<MatrixSession>`
  - `checkUsernameAvailable(username): Promise<boolean>`
- **Success Criteria:**
  - New accounts can be created
  - Username validation works
  - Handles registration flows (captcha, etc.)

#### p1-1-d: Create Session Cookie Management
- **Deliverable:** Secure cookie handling for Matrix sessions
- **Files to Create:**
  ```
  apps/web/lib/matrix/cookies.ts
  ```
- **Functions:**
  - `setSessionCookie(session: MatrixSession): void`
  - `getSessionCookie(): MatrixSession | null`
  - `clearSessionCookie(): void`
- **Success Criteria:**
  - Cookies are httpOnly, secure, sameSite
  - Session persists across browser refresh
  - Logout clears all session data

#### p1-1-e: Create MatrixAuthProvider Context
- **Deliverable:** React context providing auth state to app
- **Files to Create:**
  ```
  apps/web/components/providers/matrix-auth-provider.tsx
  ```
- **Context Values:**
  - `user: MatrixUser | null`
  - `session: MatrixSession | null`
  - `isLoading: boolean`
  - `login(credentials): Promise<void>`
  - `logout(): Promise<void>`
  - `register(data): Promise<void>`
- **Success Criteria:**
  - Auth state available throughout app
  - Auto-restore session on app load
  - Login/logout update state correctly

#### p1-1-f: Create Login Page
- **Deliverable:** Matrix login form UI
- **Files to Create:**
  ```
  apps/web/app/(auth)/sign-in/page.tsx
  apps/web/components/auth/login-form.tsx
  ```
- **Features:**
  - Username/password fields
  - Error display
  - Loading state
  - Link to registration
- **Success Criteria:**
  - Form submits to Matrix login
  - Errors display clearly
  - Redirects to app on success

#### p1-1-g: Create Registration Page
- **Deliverable:** Matrix registration form UI
- **Files to Create:**
  ```
  apps/web/app/(auth)/sign-up/page.tsx
  apps/web/components/auth/register-form.tsx
  ```
- **Features:**
  - Username, password, confirm password
  - Optional email
  - Terms acceptance
  - Username availability check
- **Success Criteria:**
  - Form validates before submit
  - Creates account on Matrix
  - Redirects to app on success

#### p1-1-h: Create Auth Middleware
- **Deliverable:** Next.js middleware for route protection
- **Files to Create:**
  ```
  apps/web/middleware.ts
  ```
- **Logic:**
  - Check for session cookie
  - Redirect unauthenticated to /sign-in
  - Redirect authenticated away from auth pages
- **Success Criteria:**
  - Protected routes require login
  - Auth routes redirect if already logged in
  - No flash of wrong content

#### p1-1-i: Create Server-Side Auth Helpers
- **Deliverable:** Helpers for server components/actions
- **Files to Create:**
  ```
  apps/web/lib/matrix/server-auth.ts
  ```
- **Functions:**
  - `getServerSession(): Promise<MatrixSession | null>`
  - `requireAuth(): Promise<MatrixSession>` (throws if not auth'd)
  - `getCurrentUser(): Promise<MatrixUser | null>`
- **Success Criteria:**
  - Server components can check auth
  - API routes can require authentication
  - Consistent error handling

#### p1-1-j: Remove Clerk Dependencies
- **Deliverable:** Clean removal of all Clerk code
- **Files to Delete:**
  ```
  apps/web/lib/current-profile.ts
  apps/web/lib/current-profile-pages.ts
  apps/web/lib/initial-profile.ts
  Any @clerk/* imports
  ```
- **Actions:**
  - Remove from package.json
  - Remove from .env
  - Search codebase for Clerk references
- **Success Criteria:**
  - `pnpm build` succeeds
  - No Clerk in bundle
  - No Clerk environment variables

---

### 1.2 Real-Time Sync Migration

#### p1-2-a: Create Matrix Client Singleton
- **Deliverable:** Singleton Matrix SDK client instance
- **Files to Create:**
  ```
  apps/web/lib/matrix/client.ts
  ```
- **Functions:**
  - `initializeClient(session: MatrixSession): MatrixClient`
  - `getClient(): MatrixClient | null`
  - `destroyClient(): void`
- **Success Criteria:**
  - Only one client instance exists
  - Client persists across navigation
  - Clean shutdown on logout

#### p1-2-b: Create MatrixProvider Context
- **Deliverable:** React context managing Matrix client lifecycle
- **Files to Create:**
  ```
  apps/web/components/providers/matrix-provider.tsx
  ```
- **Context Values:**
  - `client: MatrixClient | null`
  - `syncState: SyncState`
  - `rooms: Room[]`
  - `isReady: boolean`
- **Success Criteria:**
  - Client initializes when user logs in
  - Sync state exposed to components
  - Rooms update in real-time

#### p1-2-c: Create useMatrixClient Hook
- **Deliverable:** Hook to access Matrix client
- **Files to Create:**
  ```
  apps/web/hooks/use-matrix-client.ts
  ```
- **Returns:**
  - `client: MatrixClient | null`
  - `isReady: boolean`
- **Success Criteria:**
  - Throws error if used outside provider
  - Type-safe client access

#### p1-2-d: Create useRoom Hook
- **Deliverable:** Hook to access single room data
- **Files to Create:**
  ```
  apps/web/hooks/use-room.ts
  ```
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

#### p1-2-e: Create useRoomMessages Hook
- **Deliverable:** Hook for room message timeline
- **Files to Create:**
  ```
  apps/web/hooks/use-room-messages.ts
  ```
- **Parameters:** `roomId: string`
- **Returns:**
  - `messages: TimelineEvent[]`
  - `isLoading: boolean`
  - `loadMore(): Promise<void>`
  - `hasMore: boolean`
- **Success Criteria:**
  - Messages appear in real-time
  - Can paginate backwards
  - Handles edit/delete updates

#### p1-2-f: Create useTypingIndicator Hook
- **Deliverable:** Hook for typing indicators
- **Files to Create:**
  ```
  apps/web/hooks/use-typing-indicator.ts
  ```
- **Parameters:** `roomId: string`
- **Returns:**
  - `typingUsers: string[]`
  - `setTyping(isTyping: boolean): void`
- **Success Criteria:**
  - Shows when others are typing
  - Sends typing notifications
  - Auto-clears after timeout

#### p1-2-g: Create usePresence Hook
- **Deliverable:** Hook for user presence state
- **Files to Create:**
  ```
  apps/web/hooks/use-presence.ts
  ```
- **Parameters:** `userId?: string`
- **Returns:**
  - `presence: 'online' | 'offline' | 'unavailable'`
  - `lastActiveAgo: number`
  - `setPresence(presence): void`
- **Success Criteria:**
  - Current user presence syncs
  - Can read other users' presence
  - Updates in real-time

#### p1-2-h: Create useReadReceipts Hook
- **Deliverable:** Hook for read receipt tracking
- **Files to Create:**
  ```
  apps/web/hooks/use-read-receipts.ts
  ```
- **Parameters:** `roomId: string`
- **Returns:**
  - `receipts: Map<eventId, userId[]>`
  - `markAsRead(eventId): void`
- **Success Criteria:**
  - Shows who has read messages
  - Marks messages as read on scroll
  - Updates in real-time

#### p1-2-i: Create Connection Status Component
- **Deliverable:** UI indicator for sync connection state
- **Files to Create:**
  ```
  apps/web/components/connection-indicator.tsx
  ```
- **Features:**
  - Green = synced, yellow = syncing, red = error
  - Tooltip with details
  - Auto-retry on disconnect
- **Success Criteria:**
  - Accurately reflects sync state
  - Visible but not intrusive
  - Clickable for details

#### p1-2-j: Remove Socket.io Dependencies
- **Deliverable:** Clean removal of all Socket.io code
- **Files to Delete:**
  ```
  apps/web/components/providers/socket-provider.tsx
  apps/web/hooks/use-chat-socket.ts
  apps/web/pages/api/socket/ (entire directory)
  ```
- **Actions:**
  - Remove socket.io from package.json
  - Remove socket.io-client from package.json
  - Search for all socket references
- **Success Criteria:**
  - `pnpm build` succeeds
  - No socket.io in bundle
  - Real-time works via Matrix

---

### 1.3 Media Upload Migration

#### p1-3-a: Create Matrix Media Types
- **Deliverable:** TypeScript types for media handling
- **Files to Create:**
  ```
  apps/web/lib/matrix/types/media.ts
  ```
- **Types:**
  - `MxcUrl` (branded string type)
  - `UploadProgress`
  - `MediaInfo` (dimensions, size, mimetype)
  - `ThumbnailInfo`
- **Success Criteria:**
  - All media data strongly typed
  - mxc:// URLs have distinct type

#### p1-3-b: Create Media Upload Service
- **Deliverable:** Functions for uploading to Matrix content repo
- **Files to Create:**
  ```
  apps/web/lib/matrix/media.ts
  ```
- **Functions:**
  - `uploadMedia(file: File, onProgress?): Promise<MxcUrl>`
  - `uploadThumbnail(file: File, width, height): Promise<MxcUrl>`
- **Success Criteria:**
  - Files upload to Matrix server
  - Progress callback works
  - Returns valid mxc:// URL

#### p1-3-c: Create useMediaUpload Hook
- **Deliverable:** Hook for file uploads with state
- **Files to Create:**
  ```
  apps/web/hooks/use-media-upload.ts
  ```
- **Returns:**
  - `upload(file: File): Promise<MxcUrl>`
  - `progress: number`
  - `isUploading: boolean`
  - `error: Error | null`
  - `cancel(): void`
- **Success Criteria:**
  - Progress updates smoothly
  - Can cancel in-flight upload
  - Error state accessible

#### p1-3-d: Create useMxcUrl Hook
- **Deliverable:** Hook to convert mxc:// to HTTP URL
- **Files to Create:**
  ```
  apps/web/hooks/use-mxc-url.ts
  ```
- **Parameters:** `mxcUrl: string, width?: number, height?: number`
- **Returns:** `httpUrl: string`
- **Success Criteria:**
  - Converts mxc:// to homeserver URL
  - Supports thumbnail dimensions
  - Handles invalid URLs gracefully

#### p1-3-e: Create MatrixImage Component
- **Deliverable:** Image component that handles mxc:// URLs
- **Files to Create:**
  ```
  apps/web/components/matrix-image.tsx
  ```
- **Props:**
  - `mxcUrl: string`
  - `alt: string`
  - `width/height: number`
  - `thumbnail?: boolean`
- **Success Criteria:**
  - Renders images from Matrix
  - Supports Next.js Image optimization
  - Loading/error states

#### p1-3-f: Create FileUpload Component
- **Deliverable:** Drag-drop file upload UI
- **Files to Create:**
  ```
  apps/web/components/file-upload.tsx
  ```
- **Features:**
  - Dropzone for files
  - Preview before upload
  - Progress indicator
  - File type validation
- **Success Criteria:**
  - Drag and drop works
  - Shows upload progress
  - Validates file types/sizes

#### p1-3-g: Create MessageAttachment Component
- **Deliverable:** Component for displaying file attachments
- **Files to Create:**
  ```
  apps/web/components/chat/message-attachment.tsx
  ```
- **Features:**
  - Image preview (inline)
  - File download link
  - Audio/video player (optional)
  - File size/type display
- **Success Criteria:**
  - Images render inline
  - Files downloadable
  - Graceful fallback for unknown types

#### p1-3-h: Remove UploadThing Dependencies
- **Deliverable:** Clean removal of UploadThing
- **Files to Delete:**
  ```
  apps/web/app/api/uploadthing/ (if exists)
  Any uploadthing config files
  ```
- **Actions:**
  - Remove uploadthing from package.json
  - Remove @uploadthing/react
  - Search for all uploadthing references
- **Success Criteria:**
  - `pnpm build` succeeds
  - No uploadthing in bundle
  - Media works via Matrix

---

### 1.4 Matrix Service Layer

#### p1-4-a: Create Space Service
- **Deliverable:** Service for Matrix space (server) operations
- **Files to Create:**
  ```
  apps/web/services/matrix-space.ts
  ```
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

#### p1-4-b: Create Room Service
- **Deliverable:** Service for Matrix room (channel) operations
- **Files to Create:**
  ```
  apps/web/services/matrix-room.ts
  ```
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

#### p1-4-c: Create Member Service
- **Deliverable:** Service for membership operations
- **Files to Create:**
  ```
  apps/web/services/matrix-member.ts
  ```
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

#### p1-4-d: Create Message Service
- **Deliverable:** Service for message operations
- **Files to Create:**
  ```
  apps/web/services/matrix-message.ts
  ```
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

#### p1-4-e: Create DM Service
- **Deliverable:** Service for direct message rooms
- **Files to Create:**
  ```
  apps/web/services/matrix-dm.ts
  ```
- **Functions:**
  - `getOrCreateDM(userId): Promise<Room>`
  - `getDMRooms(): Promise<Room[]>`
  - `isDMRoom(room): boolean`
- **Success Criteria:**
  - Can start DM with any user
  - DMs appear in correct section
  - Existing DMs are reused

#### p1-4-f: Create Invite Service
- **Deliverable:** Service for invite code handling
- **Files to Create:**
  ```
  apps/web/services/matrix-invite.ts
  ```
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

## Phase 2: UI Reskin (3-4 weeks)

### 2.1 Navigation Components

#### p2-1-a: Implement Server Sidebar
- **Deliverable:** Discord-style server sidebar
- **Files to Create/Modify:**
  ```
  apps/web/components/navigation/navigation-sidebar.tsx
  ```
- **Features:**
  - Server icons with hover effects
  - Active server indicator
  - DM shortcut at top
  - Add server button at bottom
- **Success Criteria:**
  - Matches Discord's server sidebar
  - Shows all joined spaces
  - Selection updates channel list

#### p2-1-b: Implement Server Icon Component
- **Deliverable:** Server icon with avatar/fallback
- **Files to Create/Modify:**
  ```
  apps/web/components/navigation/navigation-item.tsx
  ```
- **Features:**
  - Round → square on hover
  - First letter fallback
  - Active/unread indicators
- **Success Criteria:**
  - Icons animate on hover
  - Fallback for missing avatars
  - Indicators visible

#### p2-1-c: Implement Add Server Button
- **Deliverable:** Plus button to create/join server
- **Files to Create/Modify:**
  ```
  apps/web/components/navigation/navigation-action.tsx
  ```
- **Features:**
  - Opens modal on click
  - Green accent color
  - Tooltip on hover
- **Success Criteria:**
  - Opens create server modal
  - Matches Discord styling

#### p2-1-d: Implement User Panel
- **Deliverable:** User info panel at bottom of sidebar
- **Files to Create:**
  ```
  apps/web/components/navigation/user-panel.tsx
  ```
- **Features:**
  - User avatar and name
  - Status indicator
  - Settings, mute, deafen buttons
- **Success Criteria:**
  - Shows current user info
  - Settings opens user settings
  - Audio controls work (if voice enabled)

#### p2-1-e: Implement Quick Switcher (Ctrl+K)
- **Deliverable:** Command palette for navigation
- **Files to Create:**
  ```
  apps/web/components/modals/quick-switcher-modal.tsx
  apps/web/hooks/use-quick-switcher.ts
  ```
- **Features:**
  - Fuzzy search across servers/channels
  - Keyboard navigation
  - Recent destinations
- **Success Criteria:**
  - Ctrl+K opens switcher
  - Search filters results
  - Enter navigates to selection

---

### 2.2 Channel Components

#### p2-2-a: Implement Channel Sidebar
- **Deliverable:** Discord-style channel list
- **Files to Create/Modify:**
  ```
  apps/web/components/server/server-sidebar.tsx
  ```
- **Features:**
  - Server name header
  - Channel categories (collapsible)
  - Channel list with icons
  - Member list toggle
- **Success Criteria:**
  - Shows all channels in space
  - Categories collapse/expand
  - Matches Discord layout

#### p2-2-b: Implement Server Header
- **Deliverable:** Server name dropdown header
- **Files to Create/Modify:**
  ```
  apps/web/components/server/server-header.tsx
  ```
- **Features:**
  - Server name with dropdown arrow
  - Dropdown menu (invite, settings, etc.)
  - Boost indicator (optional)
- **Success Criteria:**
  - Dropdown opens on click
  - Menu actions work
  - Server name displays correctly

#### p2-2-c: Implement Channel Category
- **Deliverable:** Collapsible channel category
- **Files to Create:**
  ```
  apps/web/components/server/server-section.tsx
  ```
- **Features:**
  - Category name with collapse arrow
  - Create channel button (if admin)
  - Collapse/expand animation
- **Success Criteria:**
  - Categories toggle correctly
  - State persists per server
  - Add button shows for admins

#### p2-2-d: Implement Channel Item
- **Deliverable:** Individual channel row
- **Files to Create/Modify:**
  ```
  apps/web/components/server/server-channel.tsx
  ```
- **Features:**
  - Icon based on type (text #, voice 🔊, video 📹)
  - Channel name
  - Unread/mention indicators
  - Hover actions (edit, invite, delete)
- **Success Criteria:**
  - Correct icons per type
  - Active state visible
  - Actions work

#### p2-2-e: Implement Member List
- **Deliverable:** Right sidebar member list
- **Files to Create:**
  ```
  apps/web/components/server/server-member-list.tsx
  ```
- **Features:**
  - Members grouped by role
  - Online/offline sections
  - Member count per role
  - Click opens profile card
- **Success Criteria:**
  - Members grouped correctly
  - Presence updates in real-time
  - Profile cards open

---

### 2.3 Message Components

#### p2-3-a: Implement Message List Container
- **Deliverable:** Scrollable message timeline
- **Files to Create/Modify:**
  ```
  apps/web/components/chat/chat-messages.tsx
  ```
- **Features:**
  - Infinite scroll (load older)
  - Auto-scroll to bottom
  - Date separators
  - "New messages" indicator
- **Success Criteria:**
  - Smooth scrolling
  - Loads history on scroll up
  - Sticks to bottom for new messages

#### p2-3-b: Implement Message Item
- **Deliverable:** Individual message display
- **Files to Create/Modify:**
  ```
  apps/web/components/chat/chat-item.tsx
  ```
- **Features:**
  - Avatar, username, timestamp
  - Message content (markdown)
  - Attachments inline
  - Reactions below
  - Edited indicator
- **Success Criteria:**
  - Matches Discord message layout
  - Markdown renders correctly
  - Timestamps format correctly

#### p2-3-c: Implement Message Input
- **Deliverable:** Chat input composer
- **Files to Create/Modify:**
  ```
  apps/web/components/chat/chat-input.tsx
  ```
- **Features:**
  - Multi-line input
  - File attachment button
  - Emoji picker button
  - Send on Enter (Shift+Enter for newline)
  - Typing indicator trigger
- **Success Criteria:**
  - Messages send correctly
  - Files can be attached
  - Emoji picker works

#### p2-3-d: Implement Message Actions
- **Deliverable:** Hover action buttons on messages
- **Files to Create:**
  ```
  apps/web/components/chat/message-actions.tsx
  ```
- **Features:**
  - React, reply, edit, delete buttons
  - More menu for additional actions
  - Copy text, pin message
- **Success Criteria:**
  - Actions appear on hover
  - Edit opens inline editor
  - Delete confirms before action

#### p2-3-e: Implement Chat Header
- **Deliverable:** Channel header with info
- **Files to Create/Modify:**
  ```
  apps/web/components/chat/chat-header.tsx
  ```
- **Features:**
  - Channel name and icon
  - Topic (if set)
  - Member count
  - Search, pins, members toggles
- **Success Criteria:**
  - Shows channel info
  - Toggle buttons work
  - Topic truncates nicely

---

### 2.4 Modal Components

#### p2-4-a: Implement Create Server Modal
- **Deliverable:** Server creation wizard
- **Files to Create/Modify:**
  ```
  apps/web/components/modals/create-server-modal.tsx
  ```
- **Features:**
  - "Create" vs "Join" choice
  - Server name input
  - Avatar upload
  - Template selection (optional)
- **Success Criteria:**
  - Creates space via Matrix
  - Redirects to new server
  - Modal closes on success

#### p2-4-b: Implement Server Settings Modal
- **Deliverable:** Server settings dialog
- **Files to Create:**
  ```
  apps/web/components/modals/server-settings-modal.tsx
  ```
- **Features:**
  - Tabs: Overview, Roles, Members, Invites
  - Edit server name/avatar
  - Role management
  - Delete server (danger zone)
- **Success Criteria:**
  - Settings save correctly
  - Role changes apply
  - Delete requires confirmation

#### p2-4-c: Implement Create Channel Modal
- **Deliverable:** Channel creation dialog
- **Files to Create/Modify:**
  ```
  apps/web/components/modals/create-channel-modal.tsx
  ```
- **Features:**
  - Channel type selector
  - Channel name input
  - Category selection
  - Private toggle
- **Success Criteria:**
  - Creates room in space
  - Room type set correctly
  - Appears in channel list

#### p2-4-d: Implement Invite Modal
- **Deliverable:** Invite link generator
- **Files to Create/Modify:**
  ```
  apps/web/components/modals/invite-modal.tsx
  ```
- **Features:**
  - Display invite link
  - Copy button
  - Expiration options
  - Max uses options
- **Success Criteria:**
  - Link copies to clipboard
  - Link works when shared
  - Options affect link behavior

#### p2-4-e: Implement Member Management Modal
- **Deliverable:** Role assignment and moderation
- **Files to Create/Modify:**
  ```
  apps/web/components/modals/members-modal.tsx
  ```
- **Features:**
  - Member list with search
  - Role dropdown per member
  - Kick/ban buttons
  - Transfer ownership
- **Success Criteria:**
  - Roles can be assigned
  - Kick/ban work
  - Ownership transfer works

#### p2-4-f: Implement User Profile Modal
- **Deliverable:** User profile card
- **Files to Create:**
  ```
  apps/web/components/modals/user-profile-modal.tsx
  ```
- **Features:**
  - Avatar and display name
  - User status/bio
  - Roles in current server
  - DM and add friend buttons
- **Success Criteria:**
  - Profile info displays
  - DM button starts conversation
  - Roles shown correctly

---

## Phase 3: Polish & Admin (3-4 weeks)

### 3.1 Settings UI

#### p3-1-a: Implement User Settings Page
- **Deliverable:** User account settings
- **Files to Create:**
  ```
  apps/web/app/(main)/settings/page.tsx
  apps/web/components/settings/user-settings.tsx
  ```
- **Sections:**
  - Profile (name, avatar, about me)
  - Appearance (theme, compact mode)
  - Notifications
  - Privacy & Safety
  - Account (password, 2FA)
- **Success Criteria:**
  - All settings sections accessible
  - Changes save to Matrix
  - Theme changes apply immediately

#### p3-1-b: Implement Server Settings Pages
- **Deliverable:** Server administration settings
- **Files to Create:**
  ```
  apps/web/components/settings/server-settings.tsx
  apps/web/components/settings/server-overview.tsx
  apps/web/components/settings/server-roles.tsx
  apps/web/components/settings/server-moderation.tsx
  ```
- **Sections:**
  - Overview (name, avatar, description)
  - Roles (role editor)
  - Moderation (bans, audit log)
  - Integrations (webhooks, bots)
- **Success Criteria:**
  - Admin-only access
  - Changes apply to space
  - All sections functional

#### p3-1-c: Implement Channel Settings
- **Deliverable:** Channel-level settings
- **Files to Create:**
  ```
  apps/web/components/settings/channel-settings.tsx
  ```
- **Sections:**
  - Overview (name, topic)
  - Permissions (role overrides)
  - Slowmode settings
- **Success Criteria:**
  - Channel settings save
  - Permission overrides work
  - Slowmode enforced

---

### 3.2 Role Management

#### p3-2-a: Implement Role Editor
- **Deliverable:** Visual role creation/editing
- **Files to Create:**
  ```
  apps/web/components/roles/role-editor.tsx
  apps/web/components/roles/role-item.tsx
  ```
- **Features:**
  - Role name and color
  - Permission toggles
  - Display separately toggle
  - Mentionable toggle
- **Success Criteria:**
  - Roles can be created/edited
  - Changes save to Matrix
  - Role order draggable

#### p3-2-b: Implement Permission Matrix
- **Deliverable:** Permission checkboxes grid
- **Files to Create:**
  ```
  apps/web/components/roles/permission-matrix.tsx
  apps/web/lib/permissions.ts
  ```
- **Features:**
  - All Discord-like permissions
  - Category grouping
  - Enable/disable/inherit states
- **Success Criteria:**
  - All permissions toggleable
  - Maps to Matrix power levels
  - Inheritance visualized

#### p3-2-c: Implement Role Assignment UI
- **Deliverable:** Assign roles to members
- **Files to Create:**
  ```
  apps/web/components/roles/role-assignment.tsx
  ```
- **Features:**
  - Member list with role badges
  - Multi-select role dropdown
  - Bulk assignment
- **Success Criteria:**
  - Roles assignable to members
  - Changes reflect immediately
  - Power levels update

---

### 3.3 Admin Features

#### p3-3-a: Implement Audit Log UI
- **Deliverable:** Visual audit log viewer
- **Files to Create:**
  ```
  apps/web/components/admin/audit-log.tsx
  apps/web/services/matrix-audit.ts
  ```
- **Features:**
  - Event list with filters
  - User, action type, target filters
  - Date range selection
  - Event detail view
- **Success Criteria:**
  - Shows all moderation actions
  - Filters work correctly
  - Pulls from Matrix state

#### p3-3-b: Implement Moderation Tools
- **Deliverable:** Ban/kick/mute interface
- **Files to Create:**
  ```
  apps/web/components/moderation/mod-actions.tsx
  apps/web/components/moderation/ban-dialog.tsx
  apps/web/components/moderation/timeout-dialog.tsx
  ```
- **Features:**
  - Quick actions in member list
  - Reason input
  - Duration for timeouts
  - Unban interface
- **Success Criteria:**
  - All mod actions work
  - Reasons logged
  - Timeouts auto-expire

#### p3-3-c: Implement Server Discovery
- **Deliverable:** Browse public servers
- **Files to Create:**
  ```
  apps/web/app/(main)/discover/page.tsx
  apps/web/components/discovery/server-browser.tsx
  ```
- **Features:**
  - Search public spaces
  - Category filtering
  - Server cards with join button
  - Member count display
- **Success Criteria:**
  - Shows public spaces
  - Search works
  - Join adds to server list

---

### 3.4 Onboarding

#### p3-4-a: Implement First-Run Experience
- **Deliverable:** Welcome flow for new users
- **Files to Create:**
  ```
  apps/web/components/onboarding/welcome-wizard.tsx
  apps/web/components/onboarding/create-first-server.tsx
  ```
- **Features:**
  - Welcome message
  - Profile setup (name, avatar)
  - Create or join first server
  - Tour of key features
- **Success Criteria:**
  - Shows only for new users
  - Profile gets set up
  - User ends up in a server

#### p3-4-b: Implement Server Templates
- **Deliverable:** Pre-configured server options
- **Files to Create:**
  ```
  apps/web/components/onboarding/server-templates.tsx
  apps/web/lib/server-templates.ts
  ```
- **Templates:**
  - Gaming (voice channels)
  - Community (text focused)
  - Study Group
  - Friends
- **Success Criteria:**
  - Templates create proper channels
  - Roles pre-configured
  - User can customize after

---

### 3.5 LiveKit Integration Polish

#### p3-5-a: Implement Voice Channel UI
- **Deliverable:** Voice channel join/leave
- **Files to Create:**
  ```
  apps/web/components/voice/voice-channel.tsx
  apps/web/components/voice/voice-status.tsx
  ```
- **Features:**
  - Join/leave voice button
  - Connected users list
  - Speaking indicators
  - Self mute/deafen controls
- **Success Criteria:**
  - Voice connects via LiveKit
  - Users visible in channel
  - Audio controls work

#### p3-5-b: Implement Video Call UI
- **Deliverable:** Video grid layout
- **Files to Create:**
  ```
  apps/web/components/video/video-room.tsx
  apps/web/components/video/video-tile.tsx
  ```
- **Features:**
  - Video grid layout
  - Spotlight mode (pin user)
  - Camera toggle
  - Leave call button
- **Success Criteria:**
  - Video displays correctly
  - Grid adapts to participant count
  - Controls work

#### p3-5-c: Implement Screen Share
- **Deliverable:** Screen sharing UI
- **Files to Create:**
  ```
  apps/web/components/video/screen-share.tsx
  ```
- **Features:**
  - Share screen button
  - Preview before sharing
  - Viewer count indicator
  - Stop sharing button
- **Success Criteria:**
  - Screen share starts/stops
  - Others can view
  - Works with video simultaneously

---

## Phase 4: Production Readiness (2 weeks)

### 4.1 Documentation

#### p4-1-a: Create User Guide
- **Deliverable:** End-user documentation
- **Files to Create:**
  ```
  docs/user-guide/
  ├── getting-started.md
  ├── servers-and-channels.md
  ├── messaging.md
  ├── voice-and-video.md
  └── settings.md
  ```
- **Success Criteria:**
  - Covers all features
  - Screenshots included
  - Beginner-friendly

#### p4-1-b: Create Admin Guide
- **Deliverable:** Server administration docs
- **Files to Create:**
  ```
  docs/admin-guide/
  ├── server-setup.md
  ├── roles-and-permissions.md
  ├── moderation.md
  └── integrations.md
  ```
- **Success Criteria:**
  - Covers all admin features
  - Best practices included
  - Troubleshooting section

#### p4-1-c: Create Self-Host Guide
- **Deliverable:** Deployment documentation
- **Files to Create:**
  ```
  docs/self-host/
  ├── requirements.md
  ├── docker-compose.md
  ├── kubernetes.md
  ├── configuration.md
  └── upgrading.md
  ```
- **Success Criteria:**
  - Complete deployment steps
  - Multiple deployment options
  - Configuration documented

---

### 4.2 Performance Optimization

#### p4-2-a: Implement Code Splitting
- **Deliverable:** Optimized bundle size
- **Files to Modify:**
  ```
  apps/web/next.config.js
  Various component dynamic imports
  ```
- **Optimizations:**
  - Dynamic imports for modals
  - Route-based code splitting
  - Tree shaking verification
- **Success Criteria:**
  - Initial bundle < 200KB
  - Lazy loading works
  - No duplicate code

#### p4-2-b: Implement Sync Optimization
- **Deliverable:** Efficient Matrix sync
- **Files to Modify:**
  ```
  apps/web/lib/matrix/client.ts
  apps/web/lib/matrix/sync-filter.ts
  ```
- **Optimizations:**
  - Sync filters for relevant events only
  - Room summary caching
  - Timeline pagination limits
- **Success Criteria:**
  - Initial sync < 3s
  - Sync bandwidth reduced
  - Memory usage stable

#### p4-2-c: Implement Image Optimization
- **Deliverable:** Optimized image loading
- **Files to Modify:**
  ```
  apps/web/components/matrix-image.tsx
  apps/web/next.config.js
  ```
- **Optimizations:**
  - Proper thumbnail sizes
  - Lazy loading
  - WebP conversion where supported
- **Success Criteria:**
  - Images load progressively
  - Thumbnails used in lists
  - No layout shift

---

### 4.3 Testing

#### p4-3-a: Implement E2E Tests
- **Deliverable:** Critical flow tests
- **Files to Create:**
  ```
  tests/e2e/
  ├── auth.spec.ts
  ├── messaging.spec.ts
  ├── server-management.spec.ts
  └── settings.spec.ts
  ```
- **Test Coverage:**
  - Login/logout/register
  - Send/receive messages
  - Create server/channel
  - Settings changes
- **Success Criteria:**
  - All critical paths tested
  - Tests pass in CI
  - < 5 min total runtime

#### p4-3-b: Implement Load Testing
- **Deliverable:** Performance benchmarks
- **Files to Create:**
  ```
  tests/load/
  ├── sync-test.ts
  ├── message-throughput.ts
  └── concurrent-users.ts
  ```
- **Metrics:**
  - Message throughput
  - Sync performance
  - Concurrent user capacity
- **Success Criteria:**
  - 100+ concurrent users
  - < 500ms message latency
  - No memory leaks

---

### 4.4 Deployment

#### p4-4-a: Create Production Dockerfile
- **Deliverable:** Optimized Docker image
- **Files to Create:**
  ```
  docker/Dockerfile
  docker/docker-compose.yml
  docker/.dockerignore
  ```
- **Features:**
  - Multi-stage build
  - Non-root user
  - Health checks
  - < 500MB image size
- **Success Criteria:**
  - Image builds successfully
  - Container starts correctly
  - Health endpoint responds

#### p4-4-b: Create Helm Charts
- **Deliverable:** Kubernetes deployment
- **Files to Create:**
  ```
  deploy/helm/haos/
  ├── Chart.yaml
  ├── values.yaml
  ├── templates/
  │   ├── deployment.yaml
  │   ├── service.yaml
  │   ├── ingress.yaml
  │   └── configmap.yaml
  ```
- **Success Criteria:**
  - `helm install` works
  - Configurable via values
  - Ingress routes traffic

#### p4-4-c: Create Release Automation
- **Deliverable:** Automated release process
- **Files to Create:**
  ```
  .github/workflows/release.yml
  scripts/bump-version.ts
  CHANGELOG.md
  ```
- **Features:**
  - Version tagging
  - Changelog generation
  - Docker image publish
  - GitHub release creation
- **Success Criteria:**
  - Tag triggers release
  - Changelog auto-generated
  - Images pushed to registry

---

## Summary

### Task Counts by Phase

| Phase | Sections | Tasks |
|-------|----------|-------|
| **Phase 0: Foundation** | 7 | 22 |
| **Phase 1: Core Integration** | 4 | 32 |
| **Phase 2: UI Reskin** | 4 | 18 |
| **Phase 3: Polish & Admin** | 5 | 13 |
| **Phase 4: Production** | 4 | 9 |
| **Total** | **24** | **94** |

### Critical Path Tasks

These tasks must be completed in order:

1. `p0-1-a` → `p0-5-a` → `p0-4-c` (Dev setup → Next.js → Components)
2. `p1-1-a` → `p1-1-b` → `p1-1-e` (Auth types → Login → Provider)
3. `p1-2-a` → `p1-2-b` → `p1-2-e` (Client → Provider → Messages)
4. `p1-4-a` → `p2-1-a` (Space service → Server sidebar)
5. `p2-3-a` → `p2-3-b` (Message list → Message item)

### Parallel Work Opportunities

| Track A | Track B | Track C |
|---------|---------|---------|
| Auth (p1-1-*) | UI Components (p0-4-*) | CI/CD (p0-6-*) |
| Services (p1-4-*) | Styling (p0-4-e) | Docs (p0-7-*) |
| Media (p1-3-*) | Modals (p2-4-*) | Docker (p4-4-*) |

---

*Generated: 2025-02-13*
