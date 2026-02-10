# Proactive Tasks System

**Status:** ✅ Live  
**Created:** 2026-02-09  
**Type:** Infrastructure / Automation

---

## Overview

Self-managing task execution system for **continuous project work** (NOT scheduled jobs).

- Cron checks every 15 mins and spawns sub-agents for active tasks
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

### 2. Model Tiers (Right-Sized to Task)

> ⚠️ **Haiku executes, it doesn't plan.** Before scheduling ANY task, define explicit steps with a smarter model.

| Model | Role | Use When |
|-------|------|----------|
| **Haiku** | Executor | Clear step-by-step instructions exist |
| **Sonnet** | Implementer | Scope is clear, needs to figure out *how* |
| **Opus** | Architect | Complex reasoning, design decisions |

**The rule:** If you can't write explicit instructions, it's not a Haiku task. Set `Min Model` appropriately when defining tasks.

**Escalation:** If the assigned model fails, next run uses the next tier up (Haiku → Sonnet → Opus). But proper upfront planning reduces failures.

### 3. Sub-Agent Behavior
1. Update heartbeat immediately (claim task)
2. Read progress file for resume point
3. Update heartbeat every 5-10 mins
4. On completion: archive task, remove heartbeat, Slack ✅
5. On failure: update Escalation field, exit cleanly

### 3b. Nested Sub-Agents (Children of Children)

Sub-agents CAN spawn their own children for parallel work:

**Shared Heartbeat Rule:**
- ALL agents in the task tree update the SAME heartbeat file
- `scheduler/heartbeats/{task-id}.json` is shared
- As long as ANY agent is alive, heartbeat stays fresh

**Parent Responsibilities:**
- Stay alive while children work
- Monitor children via `sessions_list`
- Keep updating heartbeat
- Aggregate results when done

**Orphan Recovery:**
- If parent dies, orchestrator spawns new parent
- New parent checks `sessions_list` for existing children
- Waits for orphans instead of duplicating work

**Child Labels:**
- Use descriptive labels: `{task-id}-{subtask}`
- Example: `haos-implementation-voice-tsx`

### 4. Slack Notifications

**Status Summary (every 15 min when tasks exist):**
```
📋 *Proactive Tasks Status*

• *haos-implementation* — 🟢 Running (sonnet) — TSX transforms 65%
• *fix-api-bug* — 🚀 Just spawned (haiku)

_Next check: 15 min_
```

**Action Notifications:**
| Event | Format |
|-------|--------|
| Spawning | 🚀 'task-id - spawning model agent' |
| Resuming | 🔄 'task-id - resuming from checkpoint' |
| Escalating | 📈 'task-id - escalating from X to Y' |
| Completed | ✅ 'task-id - completed!' |
| Blocked | 🔴 'task-id - blocked, needs human' |

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
- [2026-02-09 23:19 EST] Added status summary output to Slack each run
- [2026-02-09 23:32 EST] Added nested sub-agent support with shared heartbeat
