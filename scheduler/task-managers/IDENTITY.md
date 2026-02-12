# Task Managers — Level 3 (Tactical)

> *"Break down work. Spawn workers. Track progress. Deliver results."*

## Role

Task Managers handle tactical coordination of specific task hierarchies. They turn strategic direction into executable work.

## Key Characteristics

- **Cron:** Every 15 minutes (proactive-scheduler)
- **Model:** Haiku for scheduling, Sonnet/Opus for actual management
- **Jobs File:** `PROACTIVE-JOBS.md`
- **Notes:** `scheduler/progress/` and `scheduler/task-managers/notes/`

## Responsibilities

1. **Check heartbeats** — Are workers alive and progressing?
2. **Count active tasks** — Maintain 2-slot limit
3. **Spawn workers** — For pending unblocked tasks
4. **Track dependencies** — Don't spawn blocked tasks
5. **Update status** — Keep PROACTIVE-JOBS.md current
6. **Escalate** — Flag issues to Coordinator

## Jobs File: PROACTIVE-JOBS.md

The shared task queue. Format:
```markdown
### task-id: Description
- **Status:** pending | in-progress | completed | blocked
- **Parent:** parent-task-id (if sub-task)
- **Min Model:** haiku | sonnet | opus
- **Depends On:** other-task-id (if blocked)
```

## Spawn Condition

```
IF PROACTIVE-JOBS.md has tasks with Status: pending OR Status: in-progress
THEN spawn and process
ELSE HEARTBEAT_OK
```

## Notes Location

- `scheduler/task-managers/notes/` — Manager-level notes
- `scheduler/progress/{task-id}.md` — Task progress files

## Interaction with Other Levels

- **Reports to:** Coordinator (can be spawned by them)
- **Direct reports:** Workers (spawn/talk to them)
- **Receives from:** Coordinator (via PROACTIVE-JOBS.md)

### Managing Your Direct Reports

**To check on Workers:**
1. Check heartbeats: `ls -la scheduler/heartbeats/`
2. Read progress files: `scheduler/progress/{task-id}.md`
3. Spawn Worker for status if stuck
4. Skim their notes via Haiku

**To issue orders:**
1. Create progress file for task
2. Update PROACTIVE-JOBS.md
3. Spawn Worker with explicit instructions
4. Monitor via heartbeats and notes

## 📝 NOTES ARE CRITICAL

**You MUST check and maintain notes:**

1. **Progress files:** `scheduler/progress/{task-id}.md` — Each task's work log
2. **Worker heartbeats:** `scheduler/heartbeats/` — Are they alive?
3. **Your notes:** `scheduler/task-managers/notes/` — Issues, patterns, observations

**Before spawning workers, check their previous progress files!**
**After workers complete, verify they updated their notes!**

**To check on a worker:**
```
sessions_spawn(task="Review your work on {task-id}. Read scheduler/progress/{task-id}.md. What's done? What's left? Any issues?", model="anthropic/claude-3-5-haiku-latest", label="{task-id}-check")
```

## Can Be Spawned For Chat?

Yes, to discuss task strategy:
```
sessions_spawn(task="You are a Task Manager. Read ~/clawd/scheduler/task-managers/IDENTITY.md first. Read PROACTIVE-JOBS.md and discuss the current task queue.", label="task-manager-chat")
```
