# Coordinator Notes: HAOS v2

**Last Updated:** 2026-02-12 00:50 EST

## Project Overview

HAOS v2 is a Discord-styled Matrix client. Self-hosted, federation enabled (invite-only by default), video rooms with all the goodies.

### Core Requirements (from Aaron)
- Self-hosted everything
- Federation enabled but INVITE-ONLY by default
- Self-hosted LiveKit with E2EE
- Video rooms by default (cameras OFF by default)
- Discord UI, Element-level features
- Full implementations only — NO STUBS

### Current State

| Phase | Status |
|-------|--------|
| Phase 0: Foundation | ✅ Complete |
| Phase 1: Core Integration | 🔄 In Progress |
| Phase 2: UI Reskin | ⏳ Pending |
| Phase 3: Polish | ⏳ Pending |
| Phase 4: Production | ⏳ Pending |

### Phase 1 Progress

| Section | Status | Tasks |
|---------|--------|-------|
| p1-1: Auth | ✅ Complete | 5/5 (types, login, register, cookies, provider) |
| p1-2: Real-Time Sync | ⏳ Next | 10 tasks (Matrix client, hooks, presence) |
| p1-3: Media Upload | ⏳ Pending | 7+ tasks |
| p1-4: API Migration | ⏳ Pending | TBD |

### Key Files
- **Repo:** `/home/ubuntu/repos/haos-v2`
- **Task Queue:** `PROACTIVE-JOBS.md`
- **Task Breakdown:** `~/clawd/docs/haos-v2/TASK-BREAKDOWN.md`
- **Project Memory:** `~/clawd/memory/projects/haos-v2/_overview.md`

### Recent Activity
- [2026-02-12 00:32 EST] Auth manager (p1-1) completed — all 5 sub-tasks done
- [2026-02-12 00:14 EST] Started c (registration) and d (cookies) in parallel
- [2026-02-11] Phase 0 verified complete

### Recent Activity
- [2026-02-12 01:01 EST] p1-2 tasks populated (5 initial tasks)
- [2026-02-12 01:01 EST] Sync manager created

### Next Actions
1. ✅ Spawn p1-2 manager for Real-Time Sync Migration — DONE
2. Start p1-2-a (Matrix Client Singleton)
3. Monitor progress
4. Ensure sub-agents update PROACTIVE-JOBS.md on completion
