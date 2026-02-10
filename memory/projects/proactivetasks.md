# Proactive Tasks System

**Status:** ✅ Live  
**Created:** 2026-02-09  
**Type:** Infrastructure / Automation

---

## Overview

Self-managing task execution system for **continuous project work** (NOT scheduled jobs).

- Haiku cron orchestrates every 15 mins
- Sub-agents execute with tiered escalation (Haiku → Sonnet → Opus)
- All activity reported to Slack #aibot-chat
- Tasks auto-resume if agents die

---

## Key Files

| File | Purpose |
|------|---------|
| `PROACTIVE-JOBS.md` | Task definitions (Active + Archived) |
| `scheduler/heartbeats/{task-id}.json` | Agent liveness tracking |
| `scheduler/progress/{task-id}.md` | Task progress summaries |
| `docs/plans/PROACTIVE-SCHEDULER-PLAN.md` | Full design documentation |

---

## How It Works

### 1. Haiku Orchestrator (every 15 min)
- Reads PROACTIVE-JOBS.md
- If no active tasks → HEARTBEAT_OK (early exit, ~$0.001)
- Checks heartbeat files + sessions_list for agent health
- Spawns sub-agents for stale/dead tasks

### 2. Model Escalation
| Tier | When Used |
|------|-----------|
| Haiku | Simple tasks (default) |
| Sonnet | Complex tasks, or Haiku failed |
| Opus | Extreme complexity (both failed) |

### 3. Sub-Agent Behavior
1. Update heartbeat immediately (claim task)
2. Read progress file for resume point
3. Update heartbeat every 5-10 mins
4. On completion: archive task, remove heartbeat, Slack ✅
5. On failure: update Escalation field, exit cleanly

### 4. Slack Notifications
| Event | Emoji |
|-------|-------|
| Spawning | 🚀 |
| Resuming | 🔄 |
| Escalating | 📈 |
| Completed | ✅ |
| Blocked | 🔴 |

---

## Task Format (PROACTIVE-JOBS.md)

```markdown
### task-id
- **Type:** continuous | one-off
- **Min Model:** haiku | sonnet | opus
- **Priority:** high | medium | low
- **Project:** project-name
- **Description:** What needs to be done
- **Created:** YYYY-MM-DD
- **Status:** pending | in-progress
- **Escalation:** none | sonnet | opus | blocked
```

---

## Cron Job

- **ID:** `c60a003b-6a62-43bc-82f3-0b7941be8651`
- **Schedule:** `*/15 * * * *`
- **Model:** `anthropic/claude-3-haiku-20240307`
- **Target:** Isolated session → Slack #aibot-chat

---

## Important Rules

⚠️ **NOT for scheduled jobs!**
- Daily/weekly tasks → use regular `cron` tool
- This is for continuous work that runs until DONE

⚠️ **Dual verification required**
- Heartbeat file check + sessions_list
- Agent can crash without updating heartbeat

---

## History

- [2026-02-09 22:57 EST] Aaron requested proactive task system
- [2026-02-09 23:09 EST] Design approved, implementation started
- [2026-02-09 23:12 EST] System live, HAOS queued as first task
- [2026-02-09 23:16 EST] Added early-exit optimization for empty queue
