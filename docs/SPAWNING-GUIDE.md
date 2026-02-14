# Spawning Guide - How Agents Hire Sub-Agents

> 🎯 **This is THE definitive guide for spawning sub-agents.**
> Read this COMPLETELY before spawning anything.

## The Golden Rule

**Managers coordinate. Sub-agents execute.**

A manager's job is to:
1. Break down work into clear tasks
2. Spawn sub-agents with explicit instructions
3. Monitor progress via heartbeats and progress files
4. Integrate results when sub-agents complete

A sub-agent's job is to:
1. Do ONE focused task
2. Document everything in progress file
3. Update heartbeat regularly
4. Report completion/failure to parent
5. **UPDATE PROACTIVE-JOBS.md when done!**

---

> 🚨 **CRITICAL: Sub-agents MUST update PROACTIVE-JOBS.md on completion!**
> 
> The proactive scheduler ONLY reads `PROACTIVE-JOBS.md` to determine what's done.
> If a sub-agent completes but doesn't update the file:
> - Scheduler thinks task is still running
> - Next task never starts
> - Work stalls
> 
> **Every sub-agent must edit PROACTIVE-JOBS.md:**
> 1. Change `Status: in-progress` → `Status: completed`
> 2. Add `Completed: YYYY-MM-DD HH:MM EST`
> 3. Update parent's Sub-Tasks list

---

## Step-by-Step: Spawning a Sub-Agent

### Step 1: Write the Task Definition FIRST

Before spawning, add the task to `PROACTIVE-JOBS.md`:

```markdown
### p1-1-c: Registration Function
- **Status:** in-progress
- **Parent:** p1-1
- **Min Model:** sonnet
- **Description:** Implement Matrix account registration
- **Files to Create:**
  - `apps/web/lib/matrix/auth.ts` (add to existing)
- **Functions:**
  - `register(username, password, email?): Promise<MatrixSession>`
  - `checkUsernameAvailable(username): Promise<boolean>`
- **Success Criteria:**
  - New accounts can be created
  - Username validation works
```

### Step 2: Create the Progress File FIRST

Create `scheduler/progress/{parent-id}/{task-id}.md`:

```markdown
# Task: p1-1-c - Registration Function

## Summary
- **Status:** not-started
- **Parent:** p1-1
- **What to build:** Matrix registration function

## Prior Context
(Copy relevant info from parent's _manager.md)

## Files to Modify
- apps/web/lib/matrix/auth.ts

## Success Criteria
- register() function works
- checkUsernameAvailable() works
- Build passes

## Work Log
(Agent will fill this in)
```

### Step 3: Spawn with Explicit Instructions

Use `sessions_spawn` with a **complete, explicit task description**:

```
sessions_spawn(
  task = """
You are sub-agent p1-1-c working on HAOS v2 Matrix authentication.

## YOUR TASK
Implement Matrix account registration in apps/web/lib/matrix/auth.ts

## BEFORE YOU START
1. Read ~/clawd/AGENTS.md (full file - your instructions)
2. Read ~/clawd/scheduler/progress/p1-1/_manager.md (manager's notes)
3. Read ~/clawd/scheduler/progress/p1-1/p1-1-c.md (your progress file)
4. Read ~/clawd/memory/projects/haos-v2/_overview.md (project context)

## REPO PATH
~/repos/haos-v2

## WHAT TO BUILD
Add to apps/web/lib/matrix/auth.ts:
- register(username, password, email?): Promise<MatrixSession>
- checkUsernameAvailable(username): Promise<boolean>

## SUCCESS CRITERIA
- [ ] Functions implemented and typed
- [ ] Error handling included
- [ ] Build passes (pnpm build)
- [ ] Progress file updated

## WHEN DONE
1. Update scheduler/progress/p1-1/p1-1-c.md with full work log
2. Update memory/projects/haos-v2/_overview.md
3. Add entry to memory/daily/YYYY-MM-DD.md
4. Git commit your changes
5. **🚨 UPDATE ~/clawd/PROACTIVE-JOBS.md** — CRITICAL!
   - Change YOUR task's Status: in-progress → Status: completed
   - Add Completed: timestamp
   - Update parent's Sub-Tasks list to show ✅ completed
6. Delete your heartbeat file: rm ~/clawd/scheduler/heartbeats/p1-1-c.json
7. **DO NOT post to Slack** — update parent's progress file only

## IF YOU GET STUCK
Document what you tried in progress file, mark status as blocked, and explain the issue.
""",
  label = "p1-1-c"
)
```

### Step 4: Monitor Progress

Check heartbeat files periodically:
```bash
cat ~/clawd/scheduler/heartbeats/p1-1-c.json
```

Check progress file:
```bash
cat ~/clawd/scheduler/progress/p1-1/p1-1-c.md
```

---

## The Spawn Message Template

Copy this template and fill in the blanks:

```
You are sub-agent {TASK_ID} working on {PROJECT_NAME}.

## YOUR TASK
{ONE_SENTENCE_DESCRIPTION}

## BEFORE YOU START
1. Read ~/clawd/AGENTS.md (full file - your instructions)
2. Read ~/clawd/scheduler/progress/{PARENT_ID}/_manager.md
3. Read ~/clawd/scheduler/progress/{PARENT_ID}/{TASK_ID}.md
4. Read ~/clawd/memory/projects/{PROJECT}/_overview.md

## REPO PATH
{FULL_PATH_TO_REPO}

## WHAT TO BUILD
{EXPLICIT_LIST_OF_WHAT_TO_CREATE_OR_MODIFY}

## SUCCESS CRITERIA
{CHECKBOXES_OF_WHAT_DONE_LOOKS_LIKE}

## WHEN DONE
1. Update scheduler/progress/{PARENT_ID}/{TASK_ID}.md with full work log
2. Update memory/projects/{PROJECT}/_overview.md
3. Add entry to memory/daily/YYYY-MM-DD.md
4. Git commit your changes
5. **🚨 UPDATE PROACTIVE-JOBS.md** — CRITICAL! Edit ~/clawd/PROACTIVE-JOBS.md:
   - Change YOUR task's `Status: in-progress` → `Status: completed`
   - Add `Completed: YYYY-MM-DD HH:MM EST` field
   - Update parent's Sub-Tasks list (change your entry to ✅ completed)
   - THE SCHEDULER READS THIS TO START NEXT TASKS!
6. Delete your heartbeat file: rm ~/clawd/scheduler/heartbeats/{TASK_ID}.json
7. **DO NOT post to Slack** — report to parent manager only (update their progress file)

## IF YOU GET STUCK
Document what you tried in progress file, mark status as blocked, and explain the issue.
```

---

## Manager Spawning Pattern

When a manager needs to spawn multiple sub-agents:

```python
# GOOD: Sequential spawning with monitoring
for task in tasks:
    # 1. Add to PROACTIVE-JOBS.md
    # 2. Create progress file
    # 3. Spawn agent
    # 4. Wait for completion OR monitor heartbeats
    # 5. Check results
    # 6. Spawn next task (if dependent) or continue parallel

# BAD: Spawning everything at once without structure
for task in tasks:
    spawn(task)  # No monitoring, no progress files, chaos
```

---

## Heartbeat Format

Every running agent maintains this file while working:

`scheduler/heartbeats/{task-id}.json`:
```json
{
  "taskId": "p1-1-c",
  "sessionKey": "agent:main:subagent:abc123",
  "startedAt": "2026-02-12T00:10:00Z",
  "lastHeartbeat": "2026-02-12T00:15:00Z",
  "status": "running",
  "currentPhase": "Implementing register() function",
  "model": "sonnet",
  "parent": "p1-1"
}
```

**Update `lastHeartbeat` every 5-10 minutes!**

---

## Progress File Format

`scheduler/progress/{parent-id}/{task-id}.md`:

```markdown
# Task: {task-id} - {description}

## Summary
- **Status:** in-progress | completed | blocked
- **Parent:** {parent-task-id}
- **Started:** YYYY-MM-DD HH:MM TZ
- **Model:** sonnet/opus/haiku

## What I'm Building
{description of deliverables}

## Work Log
- [HH:MM] Started: reading context files
- [HH:MM] Created: new function in auth.ts
- [HH:MM] Issue: build error because X
- [HH:MM] Fixed: changed Y to Z
- [HH:MM] Completed: all success criteria met

## Files Changed
- path/to/file.ts — what was done

## What I Tried (if issues)
- Approach A: failed because...
- Approach B: worked!

## Validation
- [x] Build passes
- [x] Types correct
- [x] Functions work
- [ ] (any failing checks)

## Notes for Manager
{anything the manager should know for integration}
```

---

## Common Mistakes (DON'T DO THESE)

### ❌ Vague spawn instructions
```
task = "implement registration"
```

### ✅ Explicit spawn instructions
```
task = """
You are sub-agent p1-1-c...
[full template with all sections]
"""
```

### ❌ No progress file before spawning
Sub-agent has nowhere to write, no context to read.

### ✅ Create progress file first
Sub-agent reads context, knows where to write.

### ❌ Spawning without adding to PROACTIVE-JOBS.md
No tracking, no visibility, orphaned work.

### ✅ Add to PROACTIVE-JOBS.md first
Clear status tracking, dependency management.

### ❌ Not specifying the repo path
Agent works in wrong directory.

### ✅ Explicit repo path
`REPO PATH: ~/repos/haos-v2`

### ❌ No success criteria
Agent doesn't know when it's done.

### ✅ Explicit checkboxes
```
- [ ] Function implemented
- [ ] Build passes
- [ ] Tests pass
```

---

## Model Selection

| Model | Use For | Don't Use For |
|-------|---------|---------------|
| **Haiku** | Simple, well-defined tasks with explicit steps | Anything requiring judgment or design |
| **Sonnet** | Implementation work with clear scope | Complex architecture decisions |
| **Opus** | Complex tasks, managers, design decisions | Simple CRUD operations |

**Rule:** If you can't write explicit step-by-step instructions, don't use Haiku.

---

## Debugging Stuck Agents

1. **Check heartbeat** — Is it being updated?
   ```bash
   cat ~/clawd/scheduler/heartbeats/{task-id}.json
   ```

2. **Check progress file** — What did it try?
   ```bash
   cat ~/clawd/scheduler/progress/{parent}/{task-id}.md
   ```

3. **Check session** — Is it still running?
   ```
   sessions_list(activeMinutes=30)
   ```

4. **Send a message** — Ping the agent
   ```
   sessions_send(label="{task-id}", message="Status check - what's your current state?")
   ```

---

## Quick Reference

```
SPAWN CHECKLIST:
[ ] Task added to PROACTIVE-JOBS.md with Status: in-progress, Parent: {parent-id}
[ ] Progress file created at scheduler/progress/{parent-id}/{task-id}.md
[ ] Spawn message includes ALL sections (before, repo, what, criteria, done, stuck)
[ ] Model appropriate for task complexity
[ ] Monitoring plan in place (heartbeats, progress checks)
```
