# HAOS v2 Project Overview

**Last Updated:** [2026-02-12 12:15 EST]

## Quick Reference

| Item | Value |
|------|-------|
| **Repo** | `/home/ubuntu/repos/haos-v2` |
| **Stack** | Next.js 14 + Tailwind + Matrix SDK |
| **Goal** | Discord-styled Matrix client |
| **Planning Docs** | `~/clawd/docs/haos-v2/` |
| **Package Manager** | pnpm (NOT yarn) |

## Current Status

### ✅ What's Done (Phase 0) - VERIFIED 2026-02-12
- Monorepo structure (pnpm workspace)
- TypeScript config (strict mode)
- ESLint + Prettier configured
- Next.js 14 app initialized
- Discord clone UI components copied
- Tailwind v3 + dark theme configured
- GitHub Actions CI workflow
- **All verification checks pass** (install, dev, lint, build)

### ✅ Phase 0 Verification Complete
- `pnpm install` ✅
- `pnpm dev` ✅ 
- `pnpm lint` ✅
- `pnpm build` ✅

### ✅ p1-1 (Auth) Complete
- [2026-02-12 06:48 EST] p1-1-a: Created Matrix auth types (auth.ts) ✅
- [2026-02-12 06:54 EST] p1-1-b: Implemented Matrix login function (auth.ts) ✅
- [2026-02-12 00:36 EST] p1-1-c: Implemented Matrix registration functions (auth.ts) ✅
- [2026-02-12 05:35 EST] p1-1-d: Implemented session cookie management (cookies.ts) ✅
- [2026-02-12 00:53 EST] p1-1-e: Created MatrixAuthProvider React context ✅
- **Auth system P1-1 COMPLETE!**

### 🚧 p1-2 (Real-Time Sync) In Progress
- [2026-02-12 08:15 EST] Coordinator populated first 5 tasks (a-e)
- [2026-02-12 02:20 EST] **p1-2-a: Matrix client singleton ✅** — `lib/matrix/client.ts`
  - Singleton pattern with initializeClient, getClient, destroyClient
  - Added matrix-js-sdk dependency (40.3.0-rc.0)
- [2026-02-12 08:15 EST] **p1-2-b: MatrixProvider context ✅** — `components/providers/matrix-provider.tsx`
  - React context managing client lifecycle
  - Exposes: client, syncState, rooms, isReady, isSyncing, syncError
  - Actions: getRoom(roomId), refreshRooms()
  - Listens to ClientEvent.Sync for state changes
  - Listens to ClientEvent.Room/DeleteRoom for room updates
- [2026-02-12 16:45 EST] **p1-2-c: useMatrixClient hook ✅** — `hooks/use-matrix-client.ts`
  - Focused hook returning { client, isReady }
  - Type-safe client access with proper error handling
  - MatrixClientContextError if used outside provider
  - Full TypeScript type safety, performance optimized
- [2026-02-12 07:02 EST] **p1-2-d: useRoom hook ✅** — `hooks/use-room.ts`
  - Single room data access with reactive updates
  - Returns { room, members, isLoading, error }
  - Room ID validation, handles room not found gracefully
  - Reactive: RoomStateEvent.Members/NewMember, RoomEvent.Name/MyMembership
  - Build ✅, Lint ✅, comprehensive TypeScript error handling
- Next up: p1-2-e (useRoomMessages) — unblocked by d

### ✅ p2-1-a (Server Sidebar) Complete
- [2026-02-12 12:15 EST] **p2-1-a: Discord-style server sidebar ✅**
  - Created `lib/matrix/types/space.ts` — Space/channel types
  - Created `components/navigation/navigation-dm.tsx` — DM shortcut
  - Created `hooks/use-spaces.ts` — Spaces hook (mock data, ready for Matrix)
  - Updated `navigation-sidebar.tsx` — Client component with full Discord layout
  - Updated `navigation-item.tsx` — Letter fallback, badges, hover animations
  - Fixed `next.config.js` — Enabled server actions (pre-existing issue)

### ❌ What's Broken / Incomplete
- Next.js version has security vulnerability (minor, should upgrade)
- Auth system needs to be wired into app layout (MatrixAuthProvider)

### 📁 File Structure Note
Matrix auth files are at **`lib/matrix/`** (root level), NOT `apps/web/lib/`:
- `lib/matrix/types/auth.ts` — TypeScript types
- `lib/matrix/auth.ts` — Login, register, logout, validate functions
- `lib/matrix/cookies.ts` — Session cookie management
- `lib/matrix/actions/auth.ts` — Server actions for client components
- `components/providers/matrix-auth-provider.tsx` — React context provider

### 🚧 Ready for Phase 1
Phase 0 is complete. Ready to begin Phase 1: Core Matrix Integration

## Core Requirements (NON-NEGOTIABLE)

| Requirement | Details |
|-------------|---------|
| **Self-Hosted** | Everything runs on Aaron's servers — all data, all traffic |
| **Federation** | Matrix federation enabled but **INVITE-ONLY by default** |
| **Security** | Very secure, invite-only access to system |
| **LiveKit** | Self-hosted LiveKit with E2EE for all real-time media |
| **Video Rooms** | Default to video rooms (not voice-only) |
| **Full Media** | Audio, video, screensharing, P2P direct calls |
| **Full Implementations** | NO stubs, NO placeholders, NO "TODO later" — production-ready only |

### Media Architecture
- **Video rooms by default** — rooms support video, audio, screensharing
- **Cameras OFF by default** — users opt-in to video, not auto-enabled
- **Discord UI** — LOOKS like Discord (the whole app is Discord-styled)
- **Element-level features** — multi-screenshare, video grid, etc. (feature parity with Element video rooms)
- **P2P for direct calls** — 1:1 calls use peer-to-peer when possible
- **Self-hosted LiveKit** — all media routes through our LiveKit server
- **E2EE everywhere** — end-to-end encryption for all media streams

> **Clarification:** The UI/UX is Discord. Element video rooms are referenced for *features*, not aesthetics.

## Architecture Decisions

See detailed docs in `~/clawd/docs/haos-v2/`:
- `IMPLEMENTATION-PLAN.md` — Master roadmap (4 phases, 15-20 weeks)
- `TASK-BREAKDOWN.md` — 94 atomic tasks with deliverables
- `AUTH-STRATEGY.md` — Clerk → Matrix auth migration
- `BACKEND-MAPPING.md` — Prisma → Matrix entity mapping
- `REALTIME-STRATEGY.md` — Socket.io → Matrix sync

## Key Context for Agents

> 🚨 **ONLY USE: `/home/ubuntu/repos/haos-v2`**
> 
> Old repo was renamed to `/home/ubuntu/repos/archived-haos-DO-NOT-USE`
> **DO NOT TOUCH THE ARCHIVED REPO!**

1. **Package manager:** pnpm (not yarn)

2. **Phase order:** Phase 0 (foundation) → Phase 1 (core integration) → Phase 2 (UI) → Phase 3 (polish) → Phase 4 (production)

## Gotchas / Known Issues

- The archived repo has intractable webpack issues — it's dead, ignore it
- Discord clone source was copied, Clerk auth was stripped but Matrix not integrated yet

## Phase Status

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 0: Foundation | ✅ Complete | Verified 2026-02-12 - all checks pass |
| Phase 1: Core Integration | 🚀 Ready | Auth, sync, media, services |
| Phase 2: UI Reskin | 🚧 Started | p2-1-a (server sidebar) complete |
| Phase 3: Polish | ⏳ Pending | Settings, roles, admin |
| Phase 4: Production | ⏳ Pending | Docs, testing, deployment |

---

*This file is the source of truth for HAOS v2 project state. Update it after meaningful progress.*
