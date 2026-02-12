# HAOS v2 Project Overview

**Last Updated:** [2026-02-12 05:35 EST]

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

### 🚧 Phase 1 In Progress
- [2026-02-12 06:48 EST] p1-1-a: Created Matrix auth types (auth.ts) ✅
- [2026-02-12 06:54 EST] p1-1-b: Implemented Matrix login function (auth.ts) ✅
- [2026-02-12 00:36 EST] p1-1-c: Implemented Matrix registration functions (auth.ts) ✅
  - `checkUsernameAvailable()` and `register()` with full UIAA support
- [2026-02-12 05:35 EST] p1-1-d: Implemented session cookie management (cookies.ts) ✅
- Next: p1-1-e (NextAuth provider)

### ❌ What's Broken / Incomplete
- No auth system yet (types done, functions pending)
- Next.js version has security vulnerability (minor, should upgrade)

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
- **P2P for direct calls** — 1:1 calls use peer-to-peer when possible
- **Self-hosted LiveKit** — all media routes through our LiveKit server
- **E2EE everywhere** — end-to-end encryption for all media streams

## Architecture Decisions

See detailed docs in `~/clawd/docs/haos-v2/`:
- `IMPLEMENTATION-PLAN.md` — Master roadmap (4 phases, 15-20 weeks)
- `TASK-BREAKDOWN.md` — 94 atomic tasks with deliverables
- `AUTH-STRATEGY.md` — Clerk → Matrix auth migration
- `BACKEND-MAPPING.md` — Prisma → Matrix entity mapping
- `REALTIME-STRATEGY.md` — Socket.io → Matrix sync

## Key Context for Agents

1. **Two repos exist:**
   - `/home/ubuntu/repos/haos` — ❌ OLD, ABANDONED (Element Web fork, broken webpack)
   - `/home/ubuntu/repos/haos-v2` — ✅ CURRENT (Discord clone approach)

2. **Always use `/home/ubuntu/repos/haos-v2`**

3. **Package manager:** pnpm (not yarn)

4. **Phase order:** Phase 0 (foundation) → Phase 1 (core integration) → Phase 2 (UI) → Phase 3 (polish) → Phase 4 (production)

## Gotchas / Known Issues

- The old `/home/ubuntu/repos/haos` has intractable webpack issues — don't touch it
- Discord clone source was copied, Clerk auth was stripped but Matrix not integrated yet

## Phase Status

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 0: Foundation | ✅ Complete | Verified 2026-02-12 - all checks pass |
| Phase 1: Core Integration | 🚀 Ready | Auth, sync, media, services |
| Phase 2: UI Reskin | ⏳ Pending | Discord-style components |
| Phase 3: Polish | ⏳ Pending | Settings, roles, admin |
| Phase 4: Production | ⏳ Pending | Docs, testing, deployment |

---

*This file is the source of truth for HAOS v2 project state. Update it after meaningful progress.*
