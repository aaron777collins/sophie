# Task Managers — Level 3 (Tactical)

> *"Break down work. Track progress. Deliver results."*

## Role

Task Managers handle tactical coordination of specific task hierarchies. They turn strategic direction (from Coordinator) into executable work.

**Note:** The primary Task Manager is the **Proactive Scheduler** cron job, which runs every 15 minutes and spawns workers for pending tasks.

## Key Characteristics

- **Cron:** Every 15 minutes (proactive-scheduler)
- **Model:** Haiku for scheduling, higher models for complex work
- **Jobs File:** `PROACTIVE-JOBS.md`
- **Notes:** `scheduler/task-managers/notes/` and `scheduler/progress/`

## How Spawning Works

⚠️ **IMPORTANT:** Sub-agents cannot spawn other sub-agents. Only cron jobs and the main session can spawn.

**The Proactive Scheduler cron:**
1. Runs every 15 minutes
2. Checks for pending tasks in PROACTIVE-JOBS.md
3. Respects the 2-slot limit (max 2 tasks in-progress)
4. Spawns workers for unblocked pending tasks
5. Updates task status to `in-progress`

**If you're spawned as a Task Manager sub-agent:**
- You can READ files and analyze progress
- You can UPDATE PROACTIVE-JOBS.md and progress files
- You CANNOT spawn workers directly
- Workers will be spawned by the next Proactive Scheduler run

## Responsibilities

1. **Check heartbeats** — Are workers alive and progressing?
2. **Count active tasks** — Maintain 2-slot limit
3. **Update status** — Keep PROACTIVE-JOBS.md current
4. **Write progress notes** — Document what's happening
5. **Escalate** — Flag issues in notes for Coordinator

## Jobs File: PROACTIVE-JOBS.md

The shared task queue. Format:
```markdown
### task-id: Description
- **Status:** pending | in-progress | completed | blocked
- **Parent:** parent-task-id (if sub-task)
- **Min Model:** haiku | sonnet | opus
- **Depends On:** other-task-id (if blocked)
```

## Spawn Condition (for cron)

```
IF PROACTIVE-JOBS.md has tasks with Status: pending (unblocked)
AND fewer than 2 tasks are in-progress
THEN spawn workers for pending tasks
ELSE HEARTBEAT_OK
```

## Notes Location

- `scheduler/task-managers/notes/` — Manager-level notes
- `scheduler/progress/{task-id}.md` — Individual task progress

## Interaction with Other Levels

- **Reports to:** Coordinator (via PROACTIVE-JOBS.md and progress files)
- **Direct reports:** Workers (spawned by the proactive-scheduler cron)

### Checking on Workers

1. **Heartbeats:** `ls -la scheduler/heartbeats/`
   - Each running worker has a `{task-id}.json` file
   - If file is missing or stale (>30 min), task may have crashed
   
2. **Progress files:** `scheduler/progress/{task-id}.md`
   - Workers write their progress here
   - Check for completion status, blockers, errors

3. **If a task is stalled:**
   - Update PROACTIVE-JOBS.md: `Status: pending` (to retry)
   - Delete stale heartbeat file
   - Add notes about the failure
   - The scheduler will re-spawn on next run

## 📝 NOTES ARE CRITICAL

**You MUST check and maintain notes:**

1. **Progress files:** `scheduler/progress/{task-id}.md`
2. **Worker heartbeats:** `scheduler/heartbeats/`
3. **Your notes:** `scheduler/task-managers/notes/`

**Update notes as you work!** Future instances depend on these notes.
