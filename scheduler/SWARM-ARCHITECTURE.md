# Agent Swarm Architecture

> **Status:** ACTIVE SYSTEM (not just documentation)
> **Updated:** 2026-03-06
> **Author:** Sophie

---

## 🧠 Core Concept: Specialists Are Spawned, Not Polled

**Critical understanding:**
- Specialists (Phoenix, Atlas, Mercury, etc.) are **NOT** running daemons
- They are **identities** that get invoked via `sessions_spawn`
- Only **overseers** have cron jobs (Coordinator, Person Manager, Auditor)
- Work flows through the Coordinator who spawns specialists on-demand

---

## 🔄 How Work Actually Flows

```
┌─────────────────────────────────────────────────────────────────────┐
│  PERSON MANAGER (cron: nightly 2am)                                 │
│  - Strategic review, epic creation                                  │
│  - Self-reflection: What's working? What's not?                     │
│  - Hiring analysis: Do we need new specialist types?                │
│  - Resource gaps: Are specialists overwhelmed?                      │
└─────────────────────────────────────────────────────────────────────┘
         │
         │ creates epics/stories
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│  COORDINATOR (cron: every 30min)                                    │
│  1. Run `bd ready --json` to find unassigned work                   │
│  2. Read TASK-ROUTING.md to determine specialist                    │
│  3. Spawn appropriate specialist with task context                  │
│  4. Track progress via beads status updates                         │
│  5. When work hits needs-validation, spawn Validator                │
└─────────────────────────────────────────────────────────────────────┘
         │
         │ spawns on-demand
         ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Phoenix 🎨       │  │ Atlas ⚙️         │  │ Mercury 🧪       │
│ (frontend)      │  │ (backend)       │  │ (qa)            │
│ - Reads IDENTITY│  │ - Reads IDENTITY│  │ - Reads IDENTITY│
│ - Claims bead   │  │ - Claims bead   │  │ - Claims bead   │
│ - Does work     │  │ - Does work     │  │ - Does work     │
│ - Updates bead  │  │ - Updates bead  │  │ - Updates bead  │
│ - Session ends  │  │ - Session ends  │  │ - Session ends  │
└─────────────────┘  └─────────────────┘  └─────────────────┘
         │                   │                   │
         └───────────────────┼───────────────────┘
                             │
                             │ marks needs-validation
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  VALIDATOR (spawned by Coordinator when work needs validation)      │
│  - Independent verification                                          │
│  - Runs tests, takes screenshots, checks evidence                   │
│  - PASS → bd close                                                  │
│  - FAIL → bd update --status needs-fix                              │
└─────────────────────────────────────────────────────────────────────┘
         │
         │ completed work sampled by
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│  AUDITOR (cron: hourly)                                             │
│  - Sample 20% of recently completed tasks                           │
│  - Verify claims match evidence                                     │
│  - Detect hallucination patterns                                    │
│  - Escalate issues to Coordinator/PM                                │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📅 Cron Schedule

| Role | Cron Needed | Schedule | Purpose |
|------|-------------|----------|---------|
| **Coordinator** | ✅ YES | Every 30 min | Routes work, spawns specialists |
| **Person Manager** | ✅ YES | Nightly 2am | Strategic review, hiring analysis |
| **Auditor** | ✅ YES | Hourly | Sample-check completed work |
| **Scrum Master** | ⚠️ MERGED | (into Coordinator) | Task assignment is Coordinator's job |
| **Specialists** | ❌ NO | On-demand | Spawned by Coordinator |
| **Validator** | ❌ NO | On-demand | Spawned when needed |

**Note:** Scrum Master responsibilities merged into Coordinator to reduce cron overhead.

---

## 🔧 Coordinator Routing Logic

The Coordinator reads `TASK-ROUTING.md` and spawns specialists like this:

```python
# Pseudocode for Coordinator's routing logic

# 1. Get ready work
ready_tasks = bd ready --json

for task in ready_tasks:
    # 2. Determine specialist from labels
    specialist = route_task(task.labels)
    
    # 3. Build spawn message
    spawn_message = f"""
    You are {specialist.name}, the {specialist.role}.
    
    Read your identity: scheduler/specialists/{specialist.dir}/IDENTITY.md
    
    Your task:
    - Bead ID: {task.id}
    - Title: {task.title}
    - Acceptance Criteria: {task.description}
    
    Workflow:
    1. Claim the task: bd update {task.id} --claim
    2. Spawn a sub-agent for implementation (prevent context rot)
    3. Follow TDD: write tests first
    4. Collect evidence in scheduler/evidence/{task.id}/
    5. When done: bd update {task.id} --status needs-validation
    """
    
    # 4. Spawn specialist
    sessions_spawn(
        task=spawn_message,
        model="sonnet",
        label=f"{specialist.name}-{task.id}"
    )
```

---

## 🔀 Task Routing Rules

| Label | Specialist | Agent Name |
|-------|------------|------------|
| `frontend` | Frontend Specialist | Phoenix 🎨 |
| `backend` | Backend Specialist | Atlas ⚙️ |
| `testing` | QA Engineer | Mercury 🧪 |
| `devops` | DevOps Engineer | Forge 🛡️ |
| `architecture` | Architect | Athena 🏛️ |
| `cross-cutting` | (Coordinator decides) | Multiple |

**Fallback:** If no label, analyze title/description for keywords.

---

## ⚠️ Contingencies & Edge Cases

### 1. Task Has Multiple Labels
**Problem:** Task labeled both `frontend` and `backend`
**Solution:** Coordinator splits into sub-tasks OR assigns to primary (larger scope)

### 2. Specialist Fails Mid-Task
**Problem:** Session dies or times out
**Solution:** 
- Bead stays `in_progress` 
- Next Coordinator heartbeat sees stalled task
- Re-spawns specialist with context

### 3. Validation Keeps Failing
**Problem:** Same task fails validation 3+ times
**Solution:**
- Coordinator escalates to Person Manager
- PM reviews task scope/clarity
- May need architecture review

### 4. No Ready Tasks
**Problem:** `bd ready` returns empty
**Solution:** HEARTBEAT_OK, nothing to do

### 5. Too Many Tasks at Once
**Problem:** 10 tasks ready, can only spawn 4 concurrent
**Solution:**
- Prioritize by P0 > P1 > P2
- Track active spawns
- Process remainder next heartbeat

### 6. Circular Dependencies
**Problem:** Task A depends on B depends on A
**Solution:**
- `bd ready` won't show either (blocked)
- Coordinator flags for manual review

### 7. Specialist Doesn't Claim
**Problem:** Spawned specialist doesn't run `bd update --claim`
**Solution:**
- Auditor catches unclaimed tasks with old spawn
- Flags for re-spawn

---

## 📋 Handoff Protocol

### Specialist → Validator Handoff
1. Specialist completes work
2. Specialist runs: `bd update {id} --status needs-validation`
3. Specialist adds note: `bd note {id} "Evidence at scheduler/evidence/{id}/"`
4. **Next Coordinator heartbeat:**
   - Sees `needs-validation` status
   - Spawns Validator with task context
   - Validator independently verifies

### Validator → Complete/Fix Handoff
**If PASS:**
1. Validator runs: `bd close {id} --reason "Validated: all ACs met"`
2. Evidence archived
3. Auditor may sample later

**If FAIL:**
1. Validator runs: `bd update {id} --status needs-fix`
2. Validator adds note with specific failures
3. **Next Coordinator heartbeat:**
   - Sees `needs-fix` status
   - Re-spawns original specialist with failure context

---

## 🛡️ Anti-Hallucination Safeguards

### Built into Specialists
- Must spawn sub-agent for implementation (fresh context)
- Must run actual commands (not fabricate output)
- Must collect evidence (screenshots, logs)

### Built into Validator
- Runs tests independently
- Takes own screenshots
- Doesn't trust claimed evidence

### Built into Auditor
- Samples 20% of completed work
- Verifies files exist
- Cross-references claims with reality
- Escalates patterns

### Built into Coordinator
- Tracks spawn → claim timing
- Flags unclaimed tasks
- Monitors re-spawn frequency (hallucination signal)

---

## 📊 Health Metrics

Coordinator tracks:
1. **Tasks spawned per hour** — Activity level
2. **Claim rate** — % of spawns that claim within 5min
3. **Validation pass rate** — Quality signal
4. **Re-spawn frequency** — Hallucination/failure signal
5. **Time in status** — Efficiency signal

Auditor tracks:
1. **Hallucination rate** — % of sampled tasks with issues
2. **Per-specialist reliability** — Who's struggling?
3. **Evidence quality** — Completeness of proof
