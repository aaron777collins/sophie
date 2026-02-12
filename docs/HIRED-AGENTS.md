# Hired Agents - Recursive Task Decomposition System

> Complex problems naturally decompose until trivial. Agents hire agents.

**📚 For step-by-step spawning instructions, see: `~/clawd/docs/SPAWNING-GUIDE.md`**

## Core Concept

When an agent faces a complex task, it becomes a **Manager** and "hires" **Sub-Agents** dynamically. Sub-agents can also hire their own sub-agents, creating a recursive tree. Each level communicates with its direct parent/children only — no context explosion.

### Key Principles

1. **Managers spawn sub-agents at runtime** — assess the work, decide how to break it down
2. **Each level talks to its neighbors** — sub-agents report to their manager, not globally
3. **Failures ALWAYS documented + reported up** — manager decides to retry, pivot, or escalate
4. **Different route = different task name** — if pivoting, spawn new task with relevant context
5. **Context stays scoped** — pass only what the sub-agent needs, not everything

## Architecture

```
Task 1 (Manager - runs continuously)
├── Task 1-A (Sub-Agent - hired by Manager)
│   ├── Task 1-A-1 (Sub-Sub-Agent - hired by 1-A)
│   └── Task 1-A-2 (Sub-Sub-Agent - hired by 1-A)
├── Task 1-B (Sub-Agent - queued, waiting for 1-A)
└── Task 1-C (Sub-Agent - queued)
```

**Processing Order:** Deepest first (1-A-1, 1-A-2, then 1-A, then 1-B, etc.)

**Concurrency:** 
- Manager always runs alongside its deepest active sub-agent
- Manager observes, takes notes, coordinates, spawns next sub-agents
- Sub-agents do focused work, report back

## Task Format in PROACTIVE-JOBS.md

```markdown
### build-haos-auth
- **Status:** in-progress (manager)
- **Min Model:** opus
- **Description:** Implement Matrix authentication for HAOS v2
- **Manager Notes:**
  - [23:30] Hired 3 sub-agents: login-form, session-context, auth-middleware
  - [23:45] login-form completed, session-context in progress
- **Sub-Tasks:**
  - build-haos-auth-login-form: completed
  - build-haos-auth-session-context: in-progress
  - build-haos-auth-middleware: pending (blocked by session-context)

### build-haos-auth-session-context
- **Status:** in-progress
- **Parent:** build-haos-auth
- **Min Model:** sonnet
- **Description:** Create React context for Matrix session management
- **Sub-Tasks:**
  - build-haos-auth-session-context-storage: in-progress
  - build-haos-auth-session-context-hooks: pending
```

## Hierarchical Documentation

**Every level gets FULL documentation:** heartbeats, progress files, notes. This creates complete visibility into what's happening at every depth.

### Folder Structure (Nested by Manager)

```
scheduler/
├── heartbeats/
│   ├── p1-1.json              # Manager heartbeat
│   ├── p1-1-a.json            # Sub-agent heartbeat (while running)
│   └── p1-1-b.json            # Sub-agent heartbeat (while running)
│
└── progress/
    └── p1-1/                  # Manager folder
        ├── _manager.md        # Manager's overview & coordination notes
        ├── p1-1-a.md          # Sub-agent a progress
        ├── p1-1-b.md          # Sub-agent b progress
        ├── p1-1-c.md          # Sub-agent c progress
        └── p1-1-d/            # Sub-agent d (became manager, got nested)
            ├── _manager.md    # d's manager notes
            ├── p1-1-d-1.md    # d's sub-agent progress
            └── p1-1-d-2.md    # d's sub-agent progress
```

### Manager Progress File (`_manager.md`)

Every manager maintains:

```markdown
# Manager: {task-id} - {description}

## Status
- **State:** in-progress
- **Started:** YYYY-MM-DD HH:MM TZ
- **Model:** opus

## Sub-Agent Tracking

| Task | Status | Agent Session | Started | Completed | Notes |
|------|--------|---------------|---------|-----------|-------|
| p1-1-a | ✅ completed | session-abc | 23:51 | 00:02 | Auth types |
| p1-1-b | in-progress | session-def | 00:05 | — | Login func |
| p1-1-c | pending | — | — | — | Registration |

## Dependency Graph
(visual representation of what blocks what)

## Manager Log
- [HH:MM] Action taken, decision made
- [HH:MM] Sub-agent spawned/completed

## Integration Checklist
(what to verify when all sub-tasks complete)

## Decisions
- [HH:MM] Why this approach over alternatives

## Blockers / Escalations
(issues that need human or higher-level attention)
```

### Heartbeats (Every Running Agent)

Both managers AND sub-agents maintain heartbeats while running:

```json
{
  "taskId": "p1-1",
  "sessionKey": "agent:main:subagent:uuid",
  "startedAt": "2026-02-12T00:03:00Z",
  "lastHeartbeat": "2026-02-12T00:15:00Z",
  "status": "running",
  "currentPhase": "Coordinating auth sub-tasks",
  "model": "opus",
  "isManager": true,
  "activeSubAgents": ["p1-1-b", "p1-1-c"]
}
```

**Cleanup:** Heartbeat files are deleted when task completes.

### Why This Matters

1. **Visibility** — See what's happening at every level
2. **Recovery** — If an agent dies, next one knows exactly where things stand
3. **Coordination** — Managers can track sub-agent progress in real-time
4. **History** — Progress files are permanent record of what was tried

**Scaling Rule:** When a progress file exceeds ~500 lines or has 3+ major sections, convert to folder with `_overview.md`.

## Hiring Protocol

### When to Hire

An agent should hire sub-agents when:
1. Task has multiple independent parts
2. Task requires different perspectives/expertise
3. Task is too complex to hold in one context
4. Estimated effort > 30 minutes

An agent should NOT hire when:
1. Task is trivial (< 15 min)
2. Task requires tight sequential steps
3. Overhead of coordination > benefit

### How to Hire

1. **Break down the task** into sub-tasks (use The Circle if uncertain)
2. **Add sub-tasks** to PROACTIVE-JOBS.md with parent reference
3. **Update manager's Sub-Tasks list** with statuses
4. **Write to progress file** explaining the breakdown
5. **Set dependencies** between sub-tasks if needed

```markdown
### {parent-id}-{subtask-name}
- **Status:** pending
- **Parent:** {parent-id}
- **Min Model:** {appropriate-model}
- **Depends On:** {other-subtask-id} (optional)
- **Description:** {clear, focused description}
- **Instructions:**
  1. {step 1}
  2. {step 2}
- **Success Criteria:** {measurable outcome}
```

### Manager Responsibilities

The manager agent:
1. **Monitors** sub-agent progress (via progress files)
2. **Coordinates** dependencies and sequencing
3. **Takes notes** on overall progress
4. **Hires additional** sub-agents if gaps emerge
5. **Integrates** completed work
6. **Reports** completion when all sub-tasks done
7. **Uses The Circle/Council** for decisions affecting multiple sub-tasks

### Sub-Agent Responsibilities

Each sub-agent:
1. **Claims** task via heartbeat
2. **Reads** parent's notes for context (only what's passed to you)
3. **Does focused work** on their piece
4. **Takes detailed notes** in their progress file
5. **Hires own sub-agents** if task still too complex
6. **Commits work** atomically (see Git Workflow below)
7. **Reports to manager** (not just Slack broadcast — update progress file)
8. **On failure:** Document what went wrong, what you tried, recommendations → manager decides next steps

### Communication Between Levels

```
Manager
  ↓ spawns with scoped context
Sub-Agent
  ↓ reports back (success/failure + notes)
Manager
  ↓ decides: continue, retry, pivot?
Next Sub-Agent (or new approach)
```

**On Success:**
- Sub-agent completes, documents in progress file
- Manager reads progress, spawns next sub-agent or completes

**On Failure:**
- Sub-agent documents: what failed, what was tried, recommendations
- Sub-agent reports to manager: "I failed because X, suggest Y"
- Manager decides:
  - **Retry** same approach with adjustments?
  - **Pivot** to different approach? → new task name, fresh context
  - **Escalate** to higher tier model?
  - **Abort** and report up?

**Pivoting = New Task Name:**
```markdown
### p1-1-b-v2: Implement Login (Alternative Approach)
- **Status:** pending
- **Parent:** p1-1
- **Replaces:** p1-1-b (failed due to X)
- **New Approach:** Use Y instead of Z
- **Context from failed attempt:**
  - Don't try: {what didn't work}
  - Do try: {recommendations}
```

## 📦 Git Workflow (Atomic Commits)

**Every task completion = git commit.** Work must be recoverable.

### Sub-Task Commits

When completing a leaf task:
```bash
cd /home/ubuntu/repos/{project}
git add -A
git commit -m "{task-id}: {brief description}"
```

### Parent/Manager Commits

When all children complete, the manager:
```bash
# Verify sub-task commits exist
git log --oneline -10

# Integration commit if needed
git add -A
git commit -m "{task-id}: Complete {feature}

Sub-tasks:
- {child-1}: description
- {child-2}: description"

# Push to remote
git push origin main
```

### Phase Completion

When entire phase completes:
```bash
# Tag the milestone
git tag -a "phase-{N}-complete" -m "Phase {N}: {description}"
git push origin --tags

# Deploy if appropriate
# (check for deploy script, notify Slack first)
```

### Commit Message Format

```
{task-id}: {imperative verb} {what}

- Detail 1
- Detail 2
```

Examples:
- `p1-1-a: Create Matrix auth types`
- `p1-1-b: Implement Matrix login function`
- `p1-1: Complete Matrix authentication (5 sub-tasks)`

## Processing Order

The scheduler picks tasks in this order:

1. **Deepest unblocked pending** task first (leaves of tree)
2. **Managers with active sub-agents** run concurrently
3. **Blocked tasks** skip until dependencies resolve
4. **Completed parent tasks** only after all children complete

Example execution order for the tree above:
```
1. Start Task 1 (Manager) + Task 1-A-1 (deepest leaf)
2. Task 1-A-1 completes → Start Task 1-A-2
3. Task 1-A-2 completes → Task 1-A can now complete
4. Task 1-A completes → Start Task 1-B
... and so on
```

## Integration with The Circle & Council

**Use The Circle when:**
- Breaking down a complex task (which sub-tasks?)
- Choosing approach for a sub-task
- Evaluating if a task is "trivial enough"

**Use The Council when:**
- Architecture decisions affecting multiple sub-agents
- Trade-offs between sub-task approaches
- Conflicts between sub-agent recommendations

## File Scaling (Self-Organizing)

When any markdown file grows too large:

1. **Create folder** with same name (minus .md)
2. **Create `_overview.md`** inside as main index
3. **Split content** into logical sub-files
4. **Update references** in parent files

```
# Before
scheduler/progress/big-task.md (800 lines)

# After
scheduler/progress/big-task/
├── _overview.md (200 lines - index + summary)
├── phase-1-findings.md (250 lines)
├── phase-2-implementation.md (200 lines)
└── decisions.md (150 lines)
```

## Scheduler Changes

The cron scheduler needs to:

1. **Parse hierarchy** from task IDs (split on `-`)
2. **Calculate depth** for each task
3. **Find deepest unblocked** pending task
4. **Spawn that task** + any managers above it
5. **Respect concurrency** (1 worker + N managers)

### Depth Calculation
```
build-haos-auth                    → depth 0
build-haos-auth-login              → depth 1
build-haos-auth-login-validation   → depth 2
```

### Selection Algorithm
```python
def select_next_task(tasks):
    # Filter to pending + unblocked
    eligible = [t for t in tasks if t.status == 'pending' and not t.is_blocked()]
    
    # Sort by depth (deepest first), then priority
    eligible.sort(key=lambda t: (-t.depth, -t.priority))
    
    # Return deepest + all its managers
    if eligible:
        deepest = eligible[0]
        return [deepest] + deepest.get_manager_chain()
    return []
```

## Example: Building HAOS Auth

```
[Manager spawns at 00:00]
build-haos-auth (Manager)
├── Notes: "Breaking down auth into 4 components..."
├── Hires: login-page, register-page, session-context, middleware
│
[00:05 - Scheduler picks deepest pending]
├── build-haos-auth-session-context (in-progress)
│   ├── Notes: "This is still complex, hiring sub-agents..."
│   ├── Hires: storage, hooks, types
│   │
│   [00:10 - Even deeper now]
│   ├── build-haos-auth-session-context-storage (in-progress)
│   │   └── Notes: "Implementing localStorage + cookie sync..."
│   │   └── [00:20] COMPLETED ✓
│   │
│   ├── build-haos-auth-session-context-hooks (in-progress after storage)
│   │   └── Notes: "Creating useMatrixSession, useMatrixUser..."
│   │   └── [00:35] COMPLETED ✓
│   │
│   └── build-haos-auth-session-context-types (in-progress)
│       └── [00:25] COMPLETED ✓
│
│   [00:40 - All children done, parent completes]
│   └── COMPLETED ✓
│
[00:45 - Next sibling starts]
├── build-haos-auth-login-page (in-progress)
...
```

## Success Criteria

The Hired Agents system is working when:

1. ✅ Complex tasks automatically decompose
2. ✅ Sub-agents work on focused pieces
3. ✅ Managers coordinate without micromanaging
4. ✅ Deepest tasks complete first (bottom-up)
5. ✅ Progress files scale to folders when needed
6. ✅ Notes are detailed at all levels
7. ✅ The Circle/Council used for decisions
8. ✅ No task stays "too complex" - always decomposes

## 🧹 Note Sweep Agents

**Critical pattern:** When changes affect existing documentation, spawn a note-sweep agent.

### When to Spawn Note Sweeps

- Project renamed or relocated
- Approach deprecated for new one  
- File structure reorganized
- Key decision reversed
- Anything that could leave stale references

### Note Sweep Task Format

```markdown
### {task-id}-note-sweep
- **Status:** pending
- **Parent:** {task-id}
- **Min Model:** haiku
- **Description:** Find and update all references to {old-thing} → {new-thing}
- **Search Locations:**
  - `memory/` (projects, topics, dailies)
  - `scheduler/progress/`
  - `docs/`
  - `*.md` in workspace root
- **Actions:**
  - Update paths/names to current
  - Add deprecation notices to old locations
  - Explain what changed and why
  - Report all updates in progress file
```

### Sweep Agent Workflow

1. `grep -r "{old-name}" ~/clawd/` to find all occurrences
2. **Use The Circle (🟢 Light)** for each update decision:
   - Spawn 1-2 Haiku sub-agents if unsure about an update
   - Questions to consider:
     - Is this reference still relevant?
     - Update, deprecate, or add context note?
     - What does a future reader need to understand?
3. For each file:
   - If reference is primary → update to new path/name
   - If historical context → add note explaining change
   - If deprecated doc → add deprecation header pointing to new
4. Update progress file with list of all files changed
5. Update INDEX.md if project/topic references changed

### Circle at Haiku Level

Sweep agents are typically Haiku. They should still think critically:

| Situation | Circle Weight | Agents |
|-----------|---------------|--------|
| Obvious update (path rename) | 💭 Internal | 0 (just do it) |
| Ambiguous reference | 🟢 Light | 1-2 Haiku |
| Affects multiple docs | 🟢 Light | 1-2 Haiku |
| Uncertain if relevant | 🟢 Light | 1-2 Haiku |

**Even Haiku should pause and think** — spawn quick Haiku sub-agents for sanity checks on non-obvious updates.

### Deprecation Format

```markdown
> ⚠️ **DEPRECATED** [2026-02-11]: This was replaced by {new-thing}.
> **Reason:** {why it changed}
> **See:** `{path/to/new}` for current approach.
```

**Goal:** Any agent reading old notes immediately knows what's current vs stale.

---

## Anti-Patterns

❌ **Over-hiring:** Creating sub-agents for trivial work (overhead > benefit)
❌ **Under-hiring:** Trying to do complex work without decomposition
❌ **Silent managers:** Not taking notes or monitoring sub-agents
❌ **Orphan sub-agents:** Sub-agents without clear parent coordination
❌ **Flat decomposition:** Breaking into too many peers instead of hierarchy
❌ **Premature completion:** Marking parent done before children finish
❌ **Stale notes:** Making changes without updating related documentation
