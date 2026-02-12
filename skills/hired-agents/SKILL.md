# Hired Agents Skill

> Use when facing a complex task that needs to be broken down recursively.

## Quick Reference

| Complexity | Action |
|------------|--------|
| Trivial (< 15 min) | Just do it |
| Moderate (15-30 min) | Consider hiring |
| Complex (> 30 min) | Definitely hire |
| Can't hold in context | Must hire |

## The Hiring Process

### Step 1: Assess

Ask yourself:
- Can I complete this in one focused session?
- Can I hold all the context I need?
- Are there independent parts that could run in parallel?
- Would The Circle help me decide?

If any of: > 30 min, can't hold context, has independent parts → **hire**.

### Step 2: Decompose

Break the task into sub-tasks. Each sub-task should be:
- **Focused** — one clear thing
- **Independent** — minimal dependencies
- **Completable** — can be done by one agent

Use The Circle (Light or Standard) if uncertain about the breakdown.

### Step 3: Add Sub-Tasks to PROACTIVE-JOBS.md

```markdown
### {your-task-id}-{subtask-name}
- **Status:** pending
- **Parent:** {your-task-id}
- **Min Model:** {haiku|sonnet|opus}
- **Depends On:** {other-subtask-id} (optional)
- **Description:** {clear, focused description}
- **Instructions:**
  1. {explicit step 1}
  2. {explicit step 2}
- **Success Criteria:** {measurable outcome}
```

### Step 4: Update Your Progress File

Document the breakdown:
```markdown
## Hired Sub-Agents

[HH:MM] Breaking down task into sub-agents:
- {subtask-1}: {what it does}
- {subtask-2}: {what it does}
- {subtask-3}: {what it does}

Dependencies: {subtask-2} blocked by {subtask-1}
```

### Step 5: Become a Manager

As a manager, you:
1. **Monitor** — Check sub-agent progress files periodically
2. **Coordinate** — Ensure dependencies are respected
3. **Integrate** — Combine completed work
4. **Escalate** — Hire more sub-agents if gaps emerge
5. **Complete** — Only after ALL children complete

## Task ID Format

```
{parent}-{child}[-{grandchild}...]

Examples:
build-haos-auth
build-haos-auth-login
build-haos-auth-login-validation
```

Depth is determined by counting hyphens beyond the base task.

## Progress File Hierarchy

```
scheduler/progress/
├── build-haos-auth.md               # Manager
├── build-haos-auth-login.md         # Sub-agent
├── build-haos-auth-session.md       # Sub-agent
└── build-haos-auth-session/         # Scaled to folder
    ├── _overview.md
    ├── storage.md
    └── hooks.md
```

**Scaling:** When a progress file > 500 lines, convert to folder with `_overview.md`.

## Processing Order

The scheduler picks:
1. **Deepest unblocked pending** task (leaves first)
2. **Managers with active children** run concurrently
3. **Blocked tasks** wait for dependencies

Example:
```
1. Start: build-haos-auth (manager) + build-haos-auth-login-validation (deepest)
2. build-haos-auth-login-validation completes
3. Start: build-haos-auth-login-hooks (next deepest)
4. Both complete → build-haos-auth-login completes
5. Start: build-haos-auth-session (next sibling)
...
```

## Integration with The Circle/Council

**Use The Circle when:**
- Deciding how to break down a task
- Choosing approach for a sub-task
- Evaluating if a task is trivial enough

**Use The Council when:**
- Architecture decisions affecting multiple sub-agents
- Trade-offs between approaches
- Resolving conflicts between sub-agent outputs

## Manager Template

When you become a manager, structure your progress file:

```markdown
# Task: {task-id} (Manager)

## Overview
- **Description:** {what this task achieves}
- **Status:** managing
- **Sub-agents hired:** {count}

## Sub-Agent Status

| Sub-Task | Status | Progress | Notes |
|----------|--------|----------|-------|
| {id}-login | completed | 100% | Done at 14:30 |
| {id}-session | in-progress | 60% | Working on hooks |
| {id}-middleware | pending | 0% | Waiting for session |

## Coordination Log

- [HH:MM] Hired initial sub-agents
- [HH:MM] {subtask} completed, unblocking {other}
- [HH:MM] Identified gap, hiring additional sub-agent
- [HH:MM] All sub-agents complete, integrating

## Integration Notes

{How the pieces fit together}

## Completion

[ ] All sub-agents completed
[ ] Work integrated
[ ] Tests pass
[ ] Documentation updated
```

## Anti-Patterns

❌ **Over-hiring:** Creating sub-agents for 5-minute tasks
❌ **Under-hiring:** Struggling with complexity instead of decomposing
❌ **Silent managing:** Not monitoring or taking notes
❌ **Premature completion:** Marking done before children finish
❌ **Flat decomposition:** 10 peers instead of nested hierarchy

## Full Documentation

See: `/home/ubuntu/clawd/docs/HIRED-AGENTS.md`
