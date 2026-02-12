# Coordinator Notes: HAOS v2

**Last Updated:** 2026-02-12 08:02 EST

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
| Phase 1: Core Integration | 🔄 In Progress (p1-1 done, p1-2 next) |
| Phase 2: UI Reskin | ⏳ Pending |
| Phase 3: Polish | ⏳ Pending |
| Phase 4: Production | ⏳ Pending |

### Phase 1 Progress

| Section | Status | Tasks |
|---------|--------|-------|
| p1-1: Auth | ✅ Complete | 5/5 (types, login, register, cookies, provider) |
| p1-2: Real-Time Sync | 🚀 Ready | 10 tasks — first 5 populated in queue |
| p1-3: Media Upload | ⏳ Pending | 8 tasks |
| p1-4: Services | ⏳ Pending | 6 tasks |

### Key Files
- **Repo:** `/home/ubuntu/repos/haos-v2`
- **Task Queue:** `PROACTIVE-JOBS.md`
- **Task Breakdown:** `~/clawd/docs/haos-v2/TASK-BREAKDOWN.md`
- **Project Memory:** `~/clawd/memory/projects/haos-v2/_overview.md`

### Recent Activity
- [2026-02-12 08:02 EST] **Cleaned up crashed task p2-1-b** — Session unresponsive (timeout), removed stale heartbeat, reset status to 'pending'
- [2026-02-12 08:15 EST] **Coordinator initialized** — corrected Phase 1 status, refreshed p1-2 tasks
- [2026-02-12 01:01 EST] p1-2 tasks populated (5 initial tasks)
- [2026-02-12 00:32 EST] Auth manager (p1-1) completed — all 5 sub-tasks done
- [2026-02-12 00:14 EST] Started c (registration) and d (cookies) in parallel
- [2026-02-11] Phase 0 verified complete

### Observations
- ⚠️ PROACTIVE-JOBS.md had incorrectly claimed "Phase 1 COMPLETE" — only p1-1 was done
- Corrected status and ensured p1-2 (sync) tasks are properly defined
- Remaining p1-2 tasks (f-j: typing, presence, receipts, connection indicator, cleanup) will be added as first batch completes

### Next Actions
1. ✅ p1-2 manager + first 5 sub-tasks in queue
2. Monitor: Workers should pick up p1-2-a (Matrix client singleton)
3. When a-e complete, add f-j to queue
4. Track progress and unblock issues
