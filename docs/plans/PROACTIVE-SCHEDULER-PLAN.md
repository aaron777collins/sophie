# Proactive Scheduler System - Design Plan

**Author:** Sophie  
**Date:** 2026-02-09  
**Status:** Live - Updated 2026-02-09 23:48 EST
**Last Update:** Added validation phase, work tracking, memory sync cron

---

## Overview

A self-managing task execution system for **continuous project work**:
1. A lightweight Haiku cron orchestrates work every 15 mins
2. Sub-agents (Haiku/Sonnet/Opus) execute actual tasks with tiered escalation
3. Heartbeat files + session checks verify agent liveness
4. Hierarchical memory system tracks all progress
5. Tasks auto-resume if agents die or timeout
6. **All activity is reported to Slack (#aibot-chat)**

---

## ⚠️ IMPORTANT: What This System Is NOT For

> **This is for CONTINUOUS PROJECT WORK — NOT scheduled jobs!**

| Use This System For | Use Regular Cron For |
|---------------------|----------------------|
| "Work on HAOS until complete" | "Check email at 9am daily" |
| "Fix the API bug" | "Send weekly summary every Monday" |
| "Implement feature X" | "Run backup at midnight" |
| "Research topic and compile report" | "Check calendar every morning" |

**The difference:**
- **Proactive Scheduler** = Long-running work that continues until DONE
- **Cron Jobs** = Scheduled tasks that run at specific times

If your task has a schedule like "daily", "weekly", "every morning" — **use a regular cron job instead!**

```bash
# RIGHT: Use cron for scheduled tasks
cron action=add job='{"schedule": "0 9 * * *", "text": "Check emails..."}'

# RIGHT: Use proactive scheduler for project work
# Add to PROACTIVE-JOBS.md: "Complete HAOS implementation"
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CRON (Haiku)                            │
│                    Every 15 mins - Orchestrator                 │
│  - Reads PROACTIVE-JOBS.md                                      │
│  - Checks heartbeat files for staleness (>20 min)               │
│  - Pre-assesses task complexity for model selection             │
│  - Spawns sub-agents with tiered escalation                     │
│  - Lightweight: no actual work, just coordination               │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│               TIERED MODEL ESCALATION                           │
│                                                                 │
│   ┌─────────┐     fail     ┌─────────┐     fail    ┌──────────┐│
│   │  Haiku  │ ──────────▶  │ Sonnet  │ ─────────▶  │  Opus    ││
│   │ (simple)│              │(complex)│             │(extreme) ││
│   └─────────┘              └─────────┘             └──────────┘│
│        ▲                        ▲                               │
│        │                        │                               │
│   Default start            Skip-to if task                      │
│   for all tasks            looks complex at glance              │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUB-AGENT EXECUTION                          │
│  - Execute actual tasks                                         │
│  - Update heartbeat every 5-10 mins                             │
│  - Write to memory/projects/{project}/*                         │
│  - Update progress tracking files                               │
│  - On failure: escalate to next tier                            │
│  - Mark completion in memories + proactive file                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Model Escalation Strategy

### The Principle: Start Cheap, Escalate When Needed

- **Haiku** → Default starting point for ALL tasks (cheap, fast)
- **Sonnet** → Escalate if Haiku fails OR task is obviously complex
- **Opus** → ONLY for extreme complexity (both Haiku + Sonnet failed)

### Pre-Assessment (Haiku Orchestrator)

Before spawning, Haiku glances at the task and decides:

| Task Looks Like | Start With | Rationale |
|-----------------|------------|-----------|
| Simple/routine (email check, status update) | Haiku | Can handle it |
| Moderate complexity visible | Sonnet | Skip the failure |
| Multi-step, architecture, complex reasoning | Sonnet | Don't waste Haiku attempt |
| Already failed with lower tier | Next tier up | Escalation path |

**Complexity Indicators (skip to Sonnet):**
- Multi-file code changes
- Architecture decisions
- Research requiring synthesis
- Debugging complex issues
- Tasks that previously failed with Haiku

### Escalation Flow

```
1. Haiku attempts task
   └─ Success? → Done ✓
   └─ Failure? → Log reason, escalate to Sonnet

2. Sonnet attempts task  
   └─ Success? → Done ✓
   └─ Failure? → Log reason, escalate to Opus (rare)

3. Opus attempts task
   └─ Success? → Done ✓
   └─ Failure? → Alert human, mark as blocked
```

### Tracking Escalation

In `scheduler/heartbeats/{task-id}.json`:
```json
{
  "taskId": "fix-api-bug",
  "currentModel": "sonnet",
  "modelHistory": [
    {"model": "haiku", "result": "failed", "reason": "couldn't understand codebase context"},
    {"model": "sonnet", "result": "running", "startedAt": "..."}
  ],
  "escalationCount": 1
}
```

In `PROACTIVE-JOBS.md`, track preferred starting model based on history:
```markdown
### fix-complex-api
- **Min Model:** sonnet  <!-- learned from past failures -->
```

---

## File Structure

### Core Scheduling Files

```
~/clawd/
├── PROACTIVE-JOBS.md          # Active task definitions
├── scheduler/
│   ├── heartbeats/            # Per-task heartbeat files
│   │   ├── {task-id}.json     # Timestamp + agent info
│   │   └── ...
│   └── progress/              # Per-task progress summaries
│       ├── {task-id}.md       # High-level progress
│       └── ...
└── memory/
    └── projects/
        └── {project-name}/    # Hierarchical project memory
            ├── _overview.md
            ├── progress.md
            ├── decisions.md
            └── ...
```

### PROACTIVE-JOBS.md Format

```markdown
# Proactive Jobs

## Active Tasks

### haos-implementation
- **Type:** continuous
- **Min Model:** sonnet  <!-- complex: multi-file TSX transforms -->
- **Priority:** high
- **Project:** haos
- **Description:** Complete Discord-clone UI implementation
- **Last Run:** 2026-02-09 22:30 EST
- **Status:** in-progress
- **Escalation:** none

### fix-smartbudget-api
- **Type:** one-off
- **Min Model:** haiku  <!-- start cheap, escalate if needed -->
- **Priority:** high
- **Project:** smartbudget
- **Description:** Fix the audit API issues
- **Created:** 2026-02-09
- **Status:** pending
- **Escalation:** none

## Archived Tasks
<!-- Auto-moved here when finished, with completion timestamp -->

### example-completed-task
- **Completed:** 2026-02-08 14:30 EST
- **Model Used:** haiku
- **Project:** example
- **Description:** Did the thing
```

**Model Field Explained:**
- `Min Model: haiku` → Start with Haiku (default for new tasks)
- `Min Model: sonnet` → Skip Haiku, task is known to need more capability
- `Min Model: opus` → Only after Sonnet failed (should be rare)

**Escalation Field:** Tracks which models have been tried
- `none` → Fresh task, start at Min Model
- `sonnet` → Haiku failed, now trying Sonnet
- `opus` → Sonnet failed, escalated to Opus
- `blocked` → Even Opus couldn't do it, needs human

### Heartbeat File Format (`scheduler/heartbeats/{task-id}.json`)

```json
{
  "taskId": "haos-implementation",
  "agentSessionKey": "agent:main:subagent:abc123",
  "model": "sonnet",
  "startedAt": "2026-02-09T22:30:00Z",
  "lastHeartbeat": "2026-02-09T22:45:00Z",
  "status": "running",
  "currentPhase": "TSX transformations - MessageList",
  "progressPct": 45,
  "modelHistory": [
    {"model": "haiku", "result": "skipped", "reason": "pre-assessed as complex"},
    {"model": "sonnet", "result": "running"}
  ]
}
```

### Progress File Format (`scheduler/progress/{task-id}.md`)

```markdown
# haos-implementation Progress

**Last Updated:** 2026-02-09 22:45 EST
**Status:** In Progress (45%)

## Work Log
- [22:30] Started: MessageList.tsx transformation
- [22:35] Completed: SpacePanel.tsx styles applied
- [22:40] Issue found: Import path conflict in RoomSublist
- [22:42] Decision: Using relative imports for consistency

## Files Changed
- src/components/views/rooms/MessageList.tsx — Discord-style layout
- res/css/views/rooms/_MessageList.pcss — Dark theme + spacing

## Dependencies Discovered
- MessageList relies on RoomContext for theme
- Need to update ScrollPanel when MessageList changes

## Open Questions / Blockers
- [ ] Unresolved: Should voice indicators be in MessageList or separate?
- [x] Resolved: Import paths — using relative

## Tests / Verification Done
- [x] Built successfully
- [ ] Tested manually
- [ ] Checked related components

## Completed Phases
- [x] CSS design system (25 files, 560KB)
- [x] SpacePanel.tsx transformation
- [x] RoomSublist.tsx transformation
- [ ] MessageList transformation (in progress)
- [ ] Settings modal
- [ ] Voice integration

## Next Steps
1. Complete MessageList.tsx
2. Transform UserMenu
3. Build test
```

---

## Validation Phase (Before Completion)

> **Critical addition (2026-02-09 23:47 EST):** Sub-agents MUST validate before marking tasks complete.

### Why This Exists

Sub-agents were marking tasks "done" without verification, leading to:
- Broken builds discovered later
- Missing dependencies
- Incomplete implementations flagged as complete

### Validation Checklist

Before any agent marks a task complete, they MUST run through:

| Category | Checks | Required |
|----------|--------|----------|
| **Build & Syntax** | Code compiles, no TS/lint errors, imports resolve | ✅ |
| **Functionality** | Code works, edge cases handled, error states | ✅ |
| **Dependencies** | Dependent files work, no broken imports | ✅ |
| **Integration** | Fits codebase, no conflicts, git clean | ✅ |
| **Documentation** | Progress file complete, decisions documented | ✅ |

### Validation Workflow

```
1. Agent thinks task is done
2. Run through checklist (document in progress file)
3. ALL checks pass?
   ├─ YES → Mark complete, include validation summary in Slack
   └─ NO → Fix issues or escalate, do NOT mark complete
```

### Slack Completion Format

```
✅ [task-id] completed!
Validation: ✓ build, ✓ functionality, ✓ dependencies, ✓ integration
```

---

## Cron Configuration

### Cron Job 1: `proactive-scheduler` (Every 15 mins)

Orchestrates task spawning and monitoring.

### Cron Job 2: `memory-sync` (Hourly)

Consolidates progress files into long-term memory.

```javascript
{
  "id": "memory-sync",
  "schedule": "0 * * * *",  // Every hour
  "model": "anthropic/claude-3-5-haiku-latest",
  "text": `You are the Memory Sync agent.
  
  1. Read ~/clawd/AGENTS.md (memory system section)
  2. List files in ~/clawd/scheduler/progress/
  3. For each progress file:
     - Read the progress file
     - Update memory/projects/{project}/_overview.md with latest status
     - Add significant events to memory/daily/YYYY-MM-DD.md
  4. Commit any memory changes to git
  
  Post summary to Slack #aibot-chat or reply HEARTBEAT_OK if nothing to sync.`
}
```

**Why this exists:** Sub-agents may miss memory updates. This ensures progress → memory sync happens at least hourly.

---

### Cron Job Details: `proactive-scheduler`

```javascript
// Added via cron tool
{
  "id": "proactive-scheduler",
  "schedule": "*/15 * * * *",  // Every 15 minutes
  "model": "anthropic/claude-3-5-haiku-latest",
  "text": `You are the Proactive Scheduler orchestrator.

Read ~/clawd/PROACTIVE-JOBS.md and ~/clawd/scheduler/heartbeats/.

For each active task:
1. Check heartbeat file - stale if missing or >20 mins old
2. VERIFY agent is actually running:
   - Use sessions_list to check if agentSessionKey exists
   - Heartbeat can exist but agent died — always verify!
3. If task needs work (stale OR agent dead):
   - Determine model tier (Min Model + Escalation field)
   - Pre-assess complexity (skip to sonnet if obviously complex)
   - Spawn sub-agent with appropriate model
   - Include: "Update Escalation field and exit if you cannot complete"

ALWAYS report to Slack (#aibot-chat) via message tool:
- 🚀 Spawning: "[task-id] - spawning [model] agent"
- ⚠️ Escalating: "[task-id] - escalating from [old] to [new]"
- ✅ Completed: "[task-id] - task completed!"
- 🔴 Blocked: "[task-id] - blocked, needs human"

Do NOT execute tasks yourself - only orchestrate and report.`,
  "thinking": "off"
}
```

---

## Workflow

### 1. Haiku Orchestrator (Every 15 mins)

```
1. Read PROACTIVE-JOBS.md (Active Tasks section only)
2. For each active task:
   a. Check scheduler/heartbeats/{task-id}.json
   b. VERIFY agent is alive:
      - Use sessions_list to check agentSessionKey
      - Heartbeat file can exist but agent crashed!
   c. If stale (>20 mins) OR agent not running:
      - Determine model from Min Model + Escalation
      - Pre-assess complexity (skip tiers if obviously complex)
      - Spawn sub-agent
      - 🚀 Slack: "Spawning [model] for [task-id]"
3. Check for escalations:
   - If Escalation changed → 📈 Slack: "Escalating [task] to [model]"
4. Check for blocked tasks:
   - If Escalation = blocked → 🔴 Slack: "[task] needs human attention"
5. Clean up: remove heartbeat files for archived tasks
```

### 2. Sub-Agent Execution

```
1. On spawn:
   - READ ENTIRE AGENTS.md FIRST (memory + proactive sections)
   - Read PROACTIVE-JOBS.md (task definition)
   - Read scheduler/progress/{task-id}.md (resume point)
   - Read memory/projects/{project}/_overview.md
   - Update heartbeat immediately (claim the task)
   
2. During work (TRACK EVERYTHING):
   - Maintain detailed work log in progress file:
     - [HH:MM] entries for each action
     - Files changed list
     - Dependencies discovered
     - Open questions / blockers
     - Tests / verification done
   
3. Every 5-10 minutes:
   - Update scheduler/heartbeats/{task-id}.json
   - Add new entries to progress file work log
   
4. On meaningful progress:
   - Update memory/projects/{project}/_overview.md
   - Add entry to memory/daily/YYYY-MM-DD.md with timestamp
   - Commit code changes
   
5. BEFORE completion - VALIDATION PHASE:
   ⚠️ DO NOT SKIP THIS
   - Build & Syntax: compiles, no errors, imports work
   - Functionality: code works, edge cases, error states
   - Dependencies: dependent files still work
   - Integration: fits codebase, git clean
   - Documentation: progress file complete
   - Document results in progress file
   - If ANY check fails: fix or escalate, do NOT mark complete
   
6. On completion (ONLY after validation passes):
   - ✅ Update memory/projects/{project}/_overview.md (final status)
   - ✅ Add entry to memory/daily/YYYY-MM-DD.md with timestamp
   - ✅ AUTO-ARCHIVE in PROACTIVE-JOBS.md
   - ✅ Remove heartbeat file
   - ✅ Slack: "[task-id] completed! Validation: ✓ build, ✓ tests, ✓ integration"

7. On failure (can't complete):
   - Log reason in progress file with full context
   - Document what was tried and why it didn't work
   - Update PROACTIVE-JOBS.md Escalation field
   - Add failure entry to daily log with timestamp
   - Remove heartbeat file
   - Exit cleanly
```

### 2b. Nested Sub-Agents (Spawning Children)

Sub-agents CAN spawn their own children for parallel work (e.g., multiple TSX transforms at once).

**Shared Heartbeat Architecture:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    TASK: haos-implementation                    │
│                                                                 │
│  scheduler/heartbeats/haos-implementation.json  ← SHARED FILE  │
│                           ▲                                     │
│           ┌───────────────┼───────────────┐                     │
│           │               │               │                     │
│      Parent Agent    Child Agent 1   Child Agent 2              │
│      (haos-impl)     (haos-voice)    (haos-react)              │
│           │               │               │                     │
│           └───────────────┴───────────────┘                     │
│                    ALL update same heartbeat                    │
└─────────────────────────────────────────────────────────────────┘
```

**Rules:**

1. **Shared heartbeat file:** All agents in the task tree update `scheduler/heartbeats/{task-id}.json`
   - As long as ANY agent is alive → heartbeat stays fresh
   - Only when ALL agents die → heartbeat goes stale

2. **Parent responsibilities:**
   - Stay alive while children work
   - Monitor children via `sessions_list`
   - Keep updating heartbeat while waiting
   - Aggregate results when children complete

3. **Child labels:** Use descriptive labels for easy identification
   - Pattern: `{task-id}-{subtask}`
   - Example: `haos-implementation-voice-tsx`

4. **Orphan recovery:** If parent dies while children work:
   - Orchestrator sees stale heartbeat, spawns new parent
   - New parent checks `sessions_list` for agents matching task-id
   - If orphaned children exist: wait for them, don't duplicate work
   - Read progress file to understand current state

**Child Agent Workflow:**
```
1. Receive task from parent (via sessions_spawn)
2. Update shared heartbeat immediately
3. Do the work
4. Keep updating heartbeat every 5-10 mins
5. Report results to parent OR write to progress file
6. Exit when done (parent or orchestrator handles cleanup)
```

### 3. Agent Verification (Dual Check)

Heartbeat files alone aren't enough — an agent can crash without updating the file.

**Orchestrator performs TWO checks:**

```
1. Heartbeat Check:
   - Read scheduler/heartbeats/{task-id}.json
   - If missing or lastHeartbeat > 20 mins → possibly stale

2. Session Check:
   - Use sessions_list to find agentSessionKey
   - If session doesn't exist → agent is dead
   - If session exists but heartbeat stale → agent is stuck

Decision Matrix:
┌─────────────────┬───────────────────┬────────────────────┐
│ Heartbeat       │ Session Exists    │ Action             │
├─────────────────┼───────────────────┼────────────────────┤
│ Fresh (<20 min) │ Yes               │ All good, skip     │
│ Fresh (<20 min) │ No                │ Agent died, respawn│
│ Stale (>20 min) │ Yes               │ Agent stuck, kill  │
│ Stale (>20 min) │ No                │ Agent died, respawn│
│ Missing         │ N/A               │ Never started, spawn│
└─────────────────┴───────────────────┴────────────────────┘
```

### 4. Stale Task Recovery

When spawning a replacement agent:
1. Read progress file to understand state
2. Continue from last known checkpoint
3. Update heartbeat immediately (claim task)
4. Slack: "🔄 Resuming [task-id] from checkpoint"

---

## Slack Notifications (Mandatory)

**ALL proactive scheduler activity goes to #aibot-chat.**

| Event | Emoji | Message Format |
|-------|-------|----------------|
| Task spawned | 🚀 | `[task-id] - spawning [model] agent` |
| Task resumed | 🔄 | `[task-id] - resuming from checkpoint ([model])` |
| Escalation | 📈 | `[task-id] - escalating from [old] to [new]: [reason]` |
| Task completed | ✅ | `[task-id] - completed!` |
| Task blocked | 🔴 | `[task-id] - blocked, needs human: [reason]` |
| Agent stuck | ⚠️ | `[task-id] - agent appears stuck, killing and respawning` |

**Why always notify?**
- Visibility into what's happening
- Easy to spot issues
- Satisfying to see ✅ completions roll in
- Quick awareness when human attention needed

---

## Memory Integration

### Project Memory Structure

```
memory/projects/{project-name}/
├── _overview.md           # Project summary, goals, status
├── progress.md            # Detailed progress log with timestamps
├── decisions.md           # Key decisions and rationale
├── blockers.md            # Current blockers and resolutions
└── {feature}.md           # Feature-specific details (optional)
```

### Required Updates

Each sub-agent MUST update:

1. **On Start:**
   - `_overview.md` - Note resumption, current agent session
   - Heartbeat file - Initialize

2. **During Execution:**
   - Heartbeat file - Every 5-10 mins
   - `progress.md` - On each milestone
   - `scheduler/progress/{task-id}.md` - High-level summary

3. **On Completion:**
   - `_overview.md` - Mark complete, final status
   - `progress.md` - Final entry with timestamp
   - `PROACTIVE-JOBS.md` - Update status
   - Remove heartbeat file

---

## Changes to Core Files

### AGENTS.md Additions

```markdown
## Proactive Scheduler

The proactive scheduler runs every 15 minutes via cron (Haiku).
It orchestrates **continuous project work** defined in PROACTIVE-JOBS.md.

⚠️ **NOT for scheduled jobs!** Daily/weekly tasks use regular cron, not this.

### As a Sub-Agent on a Proactive Task

When spawned for a proactive task:

1. **First thing:** Update your heartbeat file immediately
   - Write to scheduler/heartbeats/{task-id}.json
   - This claims the task and prevents duplicate spawns

2. **Every 5-10 minutes:** Update heartbeat + progress
   - scheduler/heartbeats/{task-id}.json (timestamp)
   - scheduler/progress/{task-id}.md (high-level)

3. **On meaningful progress:** Update project memory
   - memory/projects/{project}/*.md

4. **On completion:**
   - Auto-archive task in PROACTIVE-JOBS.md
   - Update memory/projects/{project}/_overview.md
   - Remove heartbeat file
   - ✅ Slack #aibot-chat: "[task-id] completed!"

5. **On failure (can't complete at your tier):**
   - Log reason in progress file
   - Update Escalation field in PROACTIVE-JOBS.md
   - Exit cleanly (next cron spawns higher tier)
```

### IDENTITY.md Additions

```markdown
## Proactive Work

I can work on **continuous project tasks** autonomously:
- **PROACTIVE-JOBS.md** defines active project work
- Haiku orchestrates every 15 mins
- Sub-agents execute (Haiku → Sonnet → Opus escalation)
- All activity reported to Slack
- Tasks resume automatically if interrupted

⚠️ This is for project work, not scheduled jobs (those use regular cron).
```

---

## Implementation Steps

1. **Create directory structure:**
   ```
   mkdir -p ~/clawd/scheduler/{heartbeats,progress}
   ```

2. **Create PROACTIVE-JOBS.md** with initial format (empty Active Tasks)

3. **Add cron job:**
   ```
   cron action=add with proactive-scheduler config
   ```

4. **Update AGENTS.md** with sub-agent guidance

5. **Update IDENTITY.md** with proactive work section

6. **Create initial project memory structure** for active projects

7. **Test with a simple one-off task** to verify the pipeline

8. **Add haos-implementation** as first real continuous task

---

## Considerations

### Pros
- Self-healing: stale tasks auto-resume
- Hierarchical: detailed memory + quick progress files
- Lightweight orchestration: Haiku is cheap
- Scalable: can handle many concurrent tasks
- Traceable: full history in memories

### Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Agent spawns duplicate work | Check heartbeat recency before spawning |
| Heartbeat not updated (agent stuck) | 20 min threshold catches this |
| Cron misses a cycle | Next cycle catches up |
| Too many concurrent agents | Add max-concurrent limit in PROACTIVE-JOBS.md |
| Progress file conflicts | Each task has separate files |

### Resource Considerations

- **Haiku cron:** ~$0.01-0.02 per run (very light)
- **Haiku sub-agents:** ~$0.02-0.10 per task (most tasks should complete here!)
- **Sonnet sub-agents:** ~$0.10-0.50 per task (complex work)
- **Opus sub-agents:** ~$0.50-2.00+ per task (rare escalation only)

**Cost Philosophy:** By defaulting to Haiku, most simple tasks cost pennies. The escalation safety net means complex tasks still get done right — you just pay for capability when you actually need it.

- Recommend: Max 3-4 concurrent proactive tasks

---

## Resolved Questions

1. ✅ **Should Haiku also check session health?** 
   - **YES** — Use sessions_list to verify agent is actually running, not just heartbeat file

2. ✅ **Notification preferences?**
   - **ALWAYS notify via Slack #aibot-chat** for all activity:
     - 🚀 Task spawned
     - 📈 Escalation triggered
     - ✅ Task completed
     - 🔴 Task blocked (needs human)

3. ✅ **Should one-off tasks auto-archive?**
   - **YES** — All completed tasks move to "Archived Tasks" section automatically

4. ✅ **Scheduled jobs (daily/weekly)?**
   - **NOT for this system!** — Use regular cron jobs for scheduled tasks

## Open Questions

1. **Priority handling?** Should high-priority tasks preempt others?

2. **Max staleness before restart?** Currently 20 mins — adjust?

3. **Archive cleanup?** Periodically purge old archived tasks?

---

## Next Steps (If Approved)

1. You review this plan
2. Discuss any changes/additions
3. I implement the file structure + cron
4. Update AGENTS.md and IDENTITY.md
5. Add haos-implementation as first proactive task
6. Monitor and iterate

---

*Ready for your review! Let me know what to adjust before we build this.* ✨
