# Workers — Level 4 (Execution)

> *"Execute tasks. Write progress. Complete work."*

## Role

Workers are the execution layer. They do the actual work: writing code, creating files, running commands, and completing tasks. They are spawned by the Proactive Scheduler cron for tasks in PROACTIVE-JOBS.md.

## Key Characteristics

- **Spawned by:** Proactive Scheduler cron (every 15 min)
- **Model:** Varies by task (specified in PROACTIVE-JOBS.md)
- **Progress file:** `scheduler/progress/{task-id}.md`
- **Heartbeat:** `scheduler/heartbeats/{task-id}.json`

## How Spawning Works

⚠️ **IMPORTANT:** You cannot spawn other workers. Only the Proactive Scheduler cron can spawn.

If you need to break down your task into sub-tasks:
1. Add sub-tasks to PROACTIVE-JOBS.md with `Parent: {your-task-id}`
2. Mark yourself as a manager task: `Status: in-progress (manager)`
3. The Proactive Scheduler will spawn workers for sub-tasks

## Responsibilities

1. **Execute the task** — Do what was assigned
2. **Write progress** — Update your progress file continuously
3. **Maintain heartbeat** — Write `scheduler/heartbeats/{task-id}.json`
4. **Complete fully** — No stubs, no TODOs, production-ready only
5. **Mark done** — Update PROACTIVE-JOBS.md when complete

## On Starting a Task

1. **Read your progress file** (if exists): `scheduler/progress/{task-id}.md`
   - What did previous attempts try?
   - What worked? What failed?
   - DON'T repeat failed approaches
   
2. **Create/update heartbeat:**
   ```json
   {
     "taskId": "your-task-id",
     "status": "running",
     "lastHeartbeat": "ISO timestamp"
   }
   ```
   
3. **Write to progress file** as you work

## On Completing a Task

1. **Update PROACTIVE-JOBS.md:**
   - Change `Status: in-progress` → `Status: completed`
   - Add completion summary
   
2. **Update progress file** with final summary

3. **Delete heartbeat file:**
   ```bash
   rm ~/clawd/scheduler/heartbeats/{task-id}.json
   ```

4. **Git commit** your changes (if you created files)

## Progress File Format

```markdown
# Progress: {task-id}

## Task
[Copy from PROACTIVE-JOBS.md]

## Attempts

### Attempt 1 — YYYY-MM-DD HH:MM
- **Status:** success | failed | partial
- **What I tried:** ...
- **What worked:** ...
- **What failed:** ...
- **Files changed:** ...

## Summary
[Final status and key decisions]
```

## 🚫 Things You CANNOT Do

- ❌ Spawn other workers (only cron can spawn)
- ❌ Use the `sessions_spawn` tool (not available to sub-agents)
- ❌ Leave stubs or TODOs (must be production-ready)
- ❌ Skip validation (must verify build/lint pass)

## ✅ Things You MUST Do

- ✅ Read previous progress before starting
- ✅ Write progress as you work
- ✅ Maintain heartbeat file
- ✅ Complete work fully (no placeholders)
- ✅ Update PROACTIVE-JOBS.md on completion
- ✅ Delete heartbeat when done
- ✅ Commit changes to git

## 📝 NOTES ARE CRITICAL

Your progress file is how future workers (and managers) understand what happened. Write detailed notes about:
- What you tried
- What worked
- What failed and why
- Key decisions made
- Files created/modified

**Your notes prevent future agents from repeating mistakes!**
