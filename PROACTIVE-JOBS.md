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
| p1-2: Sync | 🚀 In Progress | 0/10 |
| p1-3: Media | ⏳ Pending | 0/8 |
| p1-4: Services | ⏳ Pending | 0/6 |

---

## Phase 1 Tasks (In Progress)

### haos-v2-sync-manager-p1-2: Real-Time Sync Migration (Manager)
- **Status:** pending
- **Min Model:** opus
- **Description:** Coordinate real-time sync migration — Matrix client singleton, React providers, hooks for rooms/messages/typing/presence/receipts, connection status UI. Manage sub-agents.
- **Sub-Tasks:**
  - haos-v2-matrix-client-p1-2-a
  - haos-v2-matrix-provider-p1-2-b
  - haos-v2-client-hook-p1-2-c
  - haos-v2-room-hook-p1-2-d
  - haos-v2-messages-hook-p1-2-e

### haos-v2-matrix-client-p1-2-a: Create Matrix Client Singleton
- **Status:** pending
- **Min Model:** sonnet
- **Description:** Singleton Matrix SDK client instance with proper lifecycle management
- **Files to Create:**
  - `apps/web/lib/matrix/client.ts`
- **Functions:**
  - `initializeClient(session: MatrixSession): MatrixClient`
  - `getClient(): MatrixClient | null`
  - `destroyClient(): void`
- **Success Criteria:**
  - Only one client instance exists
  - Client persists across navigation
  - Clean shutdown on logout

### haos-v2-matrix-provider-p1-2-b: Create MatrixProvider Context
- **Status:** pending
- **Min Model:** sonnet
- **Depends On:** haos-v2-matrix-client-p1-2-a
- **Description:** React context managing Matrix client lifecycle, exposes client and sync state to app
- **Files to Create:**
  - `apps/web/components/providers/matrix-provider.tsx`
- **Context Values:**
  - `client: MatrixClient | null`
  - `syncState: SyncState`
  - `rooms: Room[]`
  - `isReady: boolean`
- **Success Criteria:**
  - Client initializes when user logs in
  - Sync state exposed to components
  - Rooms update in real-time

### haos-v2-client-hook-p1-2-c: Create useMatrixClient Hook
- **Status:** pending
- **Min Model:** sonnet
- **Depends On:** haos-v2-matrix-provider-p1-2-b
- **Description:** Hook to access Matrix client with type safety
- **Files to Create:**
  - `apps/web/hooks/use-matrix-client.ts`
- **Returns:**
  - `client: MatrixClient | null`
  - `isReady: boolean`
- **Success Criteria:**
  - Throws error if used outside provider
  - Type-safe client access

### haos-v2-room-hook-p1-2-d: Create useRoom Hook
- **Status:** pending
- **Min Model:** sonnet
- **Depends On:** haos-v2-client-hook-p1-2-c
- **Description:** Hook to access single room data with reactive updates
- **Files to Create:**
  - `apps/web/hooks/use-room.ts`
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

### haos-v2-messages-hook-p1-2-e: Create useRoomMessages Hook
- **Status:** pending
- **Min Model:** sonnet
- **Depends On:** haos-v2-room-hook-p1-2-d
- **Description:** Hook for room message timeline with pagination
- **Files to Create:**
  - `apps/web/hooks/use-room-messages.ts`
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

## Phase 1.2: Real-Time Sync Migration

### haos-v2-sync-manager-p1-2: Real-Time Sync Migration (Manager)
- **Status:** in-progress (manager)
- **Started:** 2026-02-12 01:01 EST
- **Min Model:** opus
- **Description:** Coordinate sync migration — migrate from Socket.io to Matrix sync
- **Sub-Tasks:**
  - haos-v2-matrix-client-singleton-p1-2-a: 🔄 in-progress
  - haos-v2-matrix-provider-p1-2-b: pending (blocked by a)
  - haos-v2-use-matrix-client-p1-2-c: pending (blocked by b)
  - haos-v2-use-room-p1-2-d: pending (blocked by b)
  - haos-v2-use-room-messages-p1-2-e: pending (blocked by d)
- **Manager Notes:**
  - [01:01] Manager created, 5 initial sub-tasks populated
  - [01:02] Starting p1-2-a (Matrix Client Singleton)

### haos-v2-matrix-client-singleton-p1-2-a: Create Matrix Client Singleton
- **Status:** in-progress
- **Started:** 2026-02-12 01:02 EST
- **Parent:** haos-v2-sync-manager-p1-2
- **Min Model:** sonnet
- **Description:** Singleton Matrix SDK client instance
- **Files to Create:**
  - `lib/matrix/client.ts`
- **Functions:**
  - `initializeClient(session: MatrixSession): MatrixClient`
  - `getClient(): MatrixClient | null`
  - `destroyClient(): void`
- **Success Criteria:**
  - Only one client instance exists
  - Client persists across navigation
  - Clean shutdown on logout

### haos-v2-matrix-provider-p1-2-b: Create MatrixProvider Context
- **Status:** pending
- **Min Model:** sonnet
- **Depends On:** haos-v2-matrix-client-singleton-p1-2-a
- **Description:** React context managing Matrix client lifecycle
- **Files to Create:**
  - `components/providers/matrix-provider.tsx`
- **Context Values:**
  - `client: MatrixClient | null`
  - `syncState: SyncState`
  - `rooms: Room[]`
  - `isReady: boolean`
- **Success Criteria:**
  - Client initializes when user logs in
  - Sync state exposed to components
  - Rooms update in real-time

### haos-v2-use-matrix-client-p1-2-c: Create useMatrixClient Hook
- **Status:** pending
- **Min Model:** sonnet
- **Depends On:** haos-v2-matrix-provider-p1-2-b
- **Description:** Hook to access Matrix client
- **Files to Create:**
  - `hooks/use-matrix-client.ts`
- **Returns:**
  - `client: MatrixClient | null`
  - `isReady: boolean`
- **Success Criteria:**
  - Throws error if used outside provider
  - Type-safe client access

### haos-v2-use-room-p1-2-d: Create useRoom Hook
- **Status:** pending
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
- **Status:** pending
- **Min Model:** sonnet
- **Depends On:** haos-v2-use-room-p1-2-d
- **Description:** Hook for room message timeline
- **Files to Create:**
  - `hooks/use-room-messages.ts`
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
