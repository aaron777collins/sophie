# Hired Agents Skill

> Use when facing a complex task that needs to be broken down recursively.

---

## ⚠️ READ THIS FIRST (ALL AGENTS)

**Every agent at every level MUST:**
1. ✅ Maintain a heartbeat file (update every 5-10 min)
2. ✅ Keep detailed progress notes in `scheduler/progress/{task-id}.md`
3. ✅ Report failures to parent manager (ALWAYS document first, then report)
4. ✅ Never mark complete without validation

**Haiku agents:** Follow checklists EXACTLY. Don't skip steps.

---

## Quick Reference

| Complexity | Action |
|------------|--------|
| Trivial (< 15 min) | Just do it |
| Moderate (15-30 min) | Consider hiring |
| Complex (> 30 min) | Definitely hire |
| Can't hold in context | Must hire |

---

## 🔄 Two Roles: Sub-Agent vs Manager

### You are a **SUB-AGENT** if:
- You were spawned by a manager task
- Your task ID has a parent (e.g., `p1-1-b` has parent `p1-1`)
- You do focused work on ONE piece

### You are a **MANAGER** if:
- You assessed work and decided to hire sub-agents
- You coordinate multiple sub-tasks
- You wait for children to complete, then integrate

**You can be BOTH:** A sub-agent to your parent, AND a manager of your own sub-agents.

---

## 📋 SUB-AGENT CHECKLIST (Follow Exactly!)

### On Spawn (FIRST THINGS FIRST):

```
□ 1. Write heartbeat file IMMEDIATELY
     File: scheduler/heartbeats/{task-id}.json
     Content:
     {
       "taskId": "{task-id}",
       "sessionKey": "{your-session-key}",
       "startedAt": "{ISO timestamp}",
       "lastHeartbeat": "{ISO timestamp}",
       "status": "running",
       "currentPhase": "Starting work",
       "parentId": "{parent-task-id}",
       "model": "{haiku|sonnet|opus}"
     }

□ 2. Read parent's progress file (if you have a parent)
     File: scheduler/progress/{parent-id}.md or {parent-id}/_overview.md
     Why: Understand context, integration requirements

□ 3. Read your own progress file (if exists)
     File: scheduler/progress/{task-id}.md
     Why: Previous agent may have started, don't repeat work

□ 4. Read project memory
     File: memory/projects/{project}/_overview.md
     Why: Understand project state
```

### During Work:

```
□ 5. Update heartbeat every 5-10 minutes
     Change: "lastHeartbeat" and "currentPhase"

□ 6. Document EVERYTHING in progress file
     - What you tried
     - What worked / what failed
     - Decisions and why
     - Files changed
```

### On Completion:

```
□ 7. VALIDATE before marking done
     □ Code compiles/builds
     □ New code actually works
     □ No broken imports
     □ Changes integrate properly

□ 8. Update progress file with completion status
     Status: completed
     Include: validation summary

□ 9. Update project memory
     File: memory/projects/{project}/_overview.md

□ 10. Update daily log
      File: memory/daily/YYYY-MM-DD.md
      Entry: [HH:MM TZ] {task-id}: what you did

□ 11. Git commit your work
      cd /home/ubuntu/repos/{project}
      git add -A
      git commit -m "{task-id}: {description}"

□ 12. Update PROACTIVE-JOBS.md
      Change: Status: in-progress → Status: completed

□ 13. DELETE heartbeat file
      rm ~/clawd/scheduler/heartbeats/{task-id}.json

□ 14. Report to parent manager
      Update parent's progress file with your completion
      DO NOT send Slack notifications — managers handle that

□ 15. (MANAGERS ONLY) Send Slack summary
      Only L1/L2 (Person Manager, Coordinator) send Slack updates
      Workers and Task Managers do NOT post to Slack directly
```

### On FAILURE:

```
⚠️ ALWAYS DOCUMENT FIRST, THEN REPORT!

□ 1. Update YOUR progress file with failure details
     - What you tried
     - What failed and why
     - Suggestions for next approach

□ 2. Update heartbeat status to "blocked" or "failed"

□ 3. Report to parent manager
     - Send message to parent session (if active)
     - OR update parent's progress file

□ 4. DO NOT just die silently!
```

---

## 📋 MANAGER CHECKLIST (Follow Exactly!)

### On Starting as Manager:

```
□ 1. Write heartbeat file (same as sub-agent)
     Extra field: "role": "manager"

□ 2. Assess the work
     - What needs to be done?
     - Can it be broken into independent pieces?
     - What are the dependencies?

□ 3. Use The Circle if uncertain about decomposition
     Light (1-2 agents) for simple decisions
     Standard (3 agents) for complex breakdowns

□ 4. Create progress file with manager structure:

# Task: {task-id} (Manager)

## Overview
- **Description:** {what this achieves}
- **Status:** managing
- **Sub-agents:** {list}

## Sub-Agent Status Table

| Sub-Task | Status | Model | Notes |
|----------|--------|-------|-------|
| {id}-a   | pending | haiku | {desc} |
| {id}-b   | pending | sonnet | {desc} |

## Coordination Log

- [HH:MM] Assessing task, planning decomposition
- [HH:MM] Hiring sub-agents: {list}

## Integration Notes

{How pieces will fit together}
```

### Hiring Sub-Agents:

```
□ 5. Add sub-tasks to PROACTIVE-JOBS.md

### {task-id}-{subtask}
- **Status:** pending
- **Parent:** {task-id}
- **Min Model:** {haiku|sonnet|opus}
- **Depends On:** {other-task} (if any)
- **Description:** {ONE clear thing}
- **Instructions:**
  1. {explicit step 1}
  2. {explicit step 2}
  3. {explicit step 3}
- **Success Criteria:**
  - [ ] {measurable outcome 1}
  - [ ] {measurable outcome 2}
- **Context:**
  {Any info they need from you}

□ 6. For HAIKU tasks, be EXTREMELY explicit
     - Write step-by-step instructions
     - Include file paths
     - Include code patterns to follow
     - Tell them exactly what success looks like
```

### While Managing:

```
□ 7. Keep heartbeat updated (every 5-10 min)

□ 8. Monitor sub-agent progress files
     Check: scheduler/progress/{task-id}-*.md

□ 9. Log coordination events
     - [HH:MM] {subtask} started
     - [HH:MM] {subtask} completed
     - [HH:MM] Unblocking {next-task}

□ 10. Handle failures
      When sub-agent fails:
      a. Read their progress notes (what did they try?)
      b. Decide: retry, pivot, or escalate
      c. If pivot → new task name (e.g., {task-id}-b-v2)
      d. Pass context from failed attempt to new task

□ 11. Hire more sub-agents if gaps emerge
```

### On Completion:

```
□ 12. Wait for ALL sub-agents to complete

□ 13. Integrate the work
      - Combine outputs
      - Resolve any conflicts
      - Ensure everything works together

□ 14. Validate the integrated result
      □ Build passes
      □ Tests pass
      □ Integration points work

□ 15. Complete using same steps as sub-agent (steps 8-14)
```

---

## Task ID Naming

```
{base-task}-{subtask}[-{sub-subtask}]...

Examples:
p1-1                    → Phase 1, Section 1 (manager)
p1-1-a                  → First sub-task
p1-1-a-types            → Sub-sub-task of p1-1-a
p1-1-b-v2               → Second attempt at p1-1-b (pivot)
```

**Rule:** Child task ID = parent ID + hyphen + short suffix

---

## Progress File Hierarchy

```
scheduler/progress/
├── p1-1.md                    # Manager for auth section
├── p1-1-a.md                  # Sub-agent: auth types
├── p1-1-b.md                  # Sub-agent: login
├── p1-1-b/                    # Scaled to folder (> 500 lines)
│   ├── _overview.md           # Main progress
│   ├── attempts.md            # What was tried
│   └── integration.md         # How it connects
└── p1-1-c.md                  # Sub-agent: registration
```

---

## Heartbeat File Format

```json
{
  "taskId": "p1-1-b",
  "sessionKey": "agent:main:subagent:uuid-here",
  "startedAt": "2026-02-12T07:00:00Z",
  "lastHeartbeat": "2026-02-12T07:15:00Z",
  "status": "running",
  "currentPhase": "Implementing login flow",
  "parentId": "p1-1",
  "model": "sonnet",
  "role": "sub-agent"
}
```

For managers, add: `"role": "manager"`

---

## Communication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        PARENT MANAGER                        │
│  Reads: child progress files, receives failure reports      │
│  Writes: coordination log, integration notes                │
└─────────────────────────────────────────────────────────────┘
         │                    ▲
         │ spawns             │ reports
         ▼                    │
┌─────────────────────────────────────────────────────────────┐
│                         SUB-AGENT                            │
│  Reads: parent context, own progress, project memory        │
│  Writes: heartbeat, progress, completion/failure report     │
└─────────────────────────────────────────────────────────────┘
         │                    ▲
         │ can spawn          │ reports
         ▼                    │
┌─────────────────────────────────────────────────────────────┐
│                      SUB-SUB-AGENT                           │
│  Same pattern, one more level deep                          │
└─────────────────────────────────────────────────────────────┘
```

**Each level only talks to direct parent/children. No context explosion.**

---

## Handling Pivots (When Things Fail)

When a sub-agent fails and you need a different approach:

1. **Document the failure** in original task's progress file
2. **Create new task** with `-v2` or new name (e.g., `p1-1-b-v2`)
3. **Pass context** from failed attempt:
   - What was tried
   - Why it failed
   - What to try instead
4. **Archive original task** (Status: abandoned, see: p1-1-b-v2)

Example in PROACTIVE-JOBS.md:
```markdown
### p1-1-b
- **Status:** abandoned
- **Note:** Approach failed, see p1-1-b-v2

### p1-1-b-v2
- **Status:** pending
- **Parent:** p1-1
- **Description:** Login implementation (retry with different approach)
- **Context from p1-1-b:**
  Previous attempt tried direct Matrix SDK calls but hit CORS issues.
  Try proxying through Next.js API routes instead.
```

---

## Integration with The Circle/Council

**Use The Circle when:**
- Deciding how to break down a task (Light: 1-2 agents)
- Evaluating if something is too complex for current model (Standard: 3 agents)
- Reviewing approach before pivoting (Standard: 3 agents)

**Use The Counsel when:**
- Architecture decisions affecting multiple sub-agents (5-7 Opus)
- Cross-cutting concerns (auth strategy, data flow)
- Resolving conflicts between different approaches

---

## Anti-Patterns

❌ **Silent failure:** Dying without documenting what went wrong
❌ **Skipping heartbeats:** Manager can't tell if you're alive
❌ **Over-hiring:** Creating sub-agents for 5-minute tasks
❌ **Under-hiring:** Struggling alone instead of decomposing
❌ **Premature completion:** Marking done before children finish
❌ **Context explosion:** Passing entire conversation to children
❌ **Missing validation:** Claiming complete without testing

---

## Full Documentation

See: `/home/ubuntu/clawd/docs/HIRED-AGENTS.md`
