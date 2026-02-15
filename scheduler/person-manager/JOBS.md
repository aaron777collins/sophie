# Person Manager Jobs

> **CEO Role:** This agent ALWAYS runs. Check system health every time.

## 🚨 PRIORITY DIRECTIVE

**[2026-02-27 12:00 EST] Aaron's Order:** Queue up ALL remaining HAOS tasks including nice-to-haves and initiate full workforce to begin immediately.

**Action Required:**
1. Verify Coordinator has received HAOS Phase 8-12 tasks
2. Confirm Task Managers are spawning workers for pending tasks
3. Monitor slot utilization — ensure 2/2 slots are active at all times
4. Report progress to Slack

## Managed Agents

### Coordinator
- **Jobs File:** `scheduler/coordinator/JOBS.md`
- **Identity:** `scheduler/coordinator/IDENTITY.md`
- **Status:** ⚠️ NEEDS ACTIVATION
- **Last Checked:** 2026-02-12 01:07 EST
- **Action:** Assign HAOS Phase 8-12 to Coordinator for task distribution

### Task Managers (Proactive Scheduler)
- **Jobs File:** `PROACTIVE-JOBS.md`
- **Identity:** `scheduler/task-managers/IDENTITY.md`
- **Status:** ⚠️ NEEDS ACTIVATION
- **Last Checked:** 2026-02-12 01:07 EST
- **Action:** Begin spawning workers for Phase 8-12 tasks

## Active Projects

### HAOS Full Implementation
- **Priority:** 🔴 CRITICAL (Aaron's direct order)
- **Status:** IN PROGRESS — Phases 8-12 queued (53 tasks total)
- **Location:** ~/repos/haos-v2
- **PROACTIVE-JOBS.md:** Updated with full task breakdown
- **Phases:**
  - Phase 8: Security Polish (2 pending)
  - Phase 9: Chat Features (8 tasks)
  - Phase 10: Server Features (14 tasks)
  - Phase 11: User Experience (15 tasks)
  - Phase 12: Infrastructure (16 tasks)

## Issues Requiring Attention

- 🔴 **IMMEDIATE:** Activate workforce for HAOS implementation
- ⚠️ **p8-2-device-prompts:** Already in-progress, verify completion status
- ⚠️ **Slot utilization:** Must be 2/2 active workers at all times

## Recent Actions

- [2026-02-27 12:00 EST] **AARON'S ORDER:** Full HAOS implementation activated
- [2026-02-27 12:00 EST] PROACTIVE-JOBS.md updated with 53 new HAOS tasks (Phases 8-12)
- [2026-02-12 01:54 EST] **FULL AUDIT COMPLETED** — See `notes/health-checks/2026-02-12-0154.md`
- [2026-02-12 01:54 EST] Updated p1-2 manager file (p1-2-c now marked complete)
- [2026-02-12 01:54 EST] Identified work stoppage — no active workers
- [2026-02-12 01:07 EST] Full system health check completed
- [2026-02-12 01:07 EST] Cleaned up orphaned heartbeat: `p2-1-a.json` (5h stale)
- [2026-02-12 01:07 EST] Sent health check report to Slack
- [2026-02-12 00:57 EST] Person Manager system created and initialized

## Cleanup Log

- [2026-02-12 01:07 EST] Deleted `scheduler/heartbeats/p2-1-a.json` — orphaned worker heartbeat
