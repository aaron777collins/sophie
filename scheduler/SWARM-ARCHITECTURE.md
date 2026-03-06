# Swarm Architecture

> **Purpose:** How specialists get triggered, work flows, and handoffs happen
> **Last Updated:** 2026-03-06

---

## 🧠 Core Principle: Spawned, Not Polled

Specialists don't run on crons. They're **spawned on-demand** by the Coordinator when work matches their domain.

```
┌─────────────────────────────────────────────────────────────────────┐
│                         THE HEARTBEATS                               │
│                                                                      │
│  Coordinator (30min)     - Routes tasks, spawns specialists          │
│  Auditor (1hr)           - Samples completed work for hallucinations │
│  Person Manager (4x/day) - Strategic oversight + nightly reflection  │
│  Validator (2x/hr)       - Independent QA on needs-validation        │
│                                                                      │
│  Everything else → SPAWNED when needed                               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Task Lifecycle

### 1. Task Creation
```bash
bd create "Build login form" -t task -p 1 --labels frontend
```

### 2. Coordinator Heartbeat (every 30min)
```
1. Run `bd ready --json` to find unassigned work
2. For each task:
   a. Read labels
   b. Consult TASK-ROUTING.md for specialist mapping
   c. Spawn the appropriate specialist
3. Claim the bead for tracking
```

### 3. Specialist Execution
```
1. Specialist spawns with their IDENTITY.md context
2. Reads the task from beads
3. Does the work (follows TDD, creates evidence)
4. Updates bead: `bd update {id} --status needs-validation`
5. Session ends
```

### 4. Validation (Validator heartbeat, 2x/hour)
```
1. Validator checks `bd list --status needs-validation`
2. For each:
   a. Actually runs tests, checks screenshots
   b. PASS → `bd close {id}`
   c. FAIL → `bd update {id} --status needs-fix`
```

### 5. Auditor Sampling (hourly)
```
1. Auditor runs `bd list --status closed --limit 10`
2. Randomly samples ~20% of recently closed work
3. Checks for hallucinations, false claims, missing evidence
4. Flags issues for re-validation
```

---

## 📋 Specialist Spawn Protocol

When Coordinator spawns a specialist, it MUST include:

```
sessions_spawn(
  agentId="sonnet",  // or appropriate model
  label="{specialist}-{bead-id}",
  task="""
## Specialist: {Name} ({Emoji})

**Read your identity FIRST:**
```bash
cat ~/clawd/scheduler/specialists/{domain}/IDENTITY.md
```

**Your task:**
- Bead: {bead-id}
- Title: {title}
- Priority: {priority}
- Labels: {labels}

**Acceptance Criteria:**
{ACs from bead}

**Workflow:**
1. Read identity and understand your role
2. Claim: `bd update {bead-id} --claim`
3. Do the work (TDD approach)
4. Create evidence (screenshots, test results)
5. Submit: `bd update {bead-id} --status needs-validation --notes "Evidence: ..."`
6. Commit and push

**Dependencies:** {deps}
"""
)
```

---

## 🤝 Handoffs Between Specialists

### Sequential Dependencies
```
Backend (Atlas) completes API
    → Updates bead: needs-validation
    → Creates new bead for Frontend with dep on API bead
    → Coordinator sees new frontend task, spawns Phoenix
```

### Parallel Work
```
Coordinator sees multi-domain task
    → Creates sub-beads for each domain
    → Spawns specialists in parallel
    → Each completes independently
    → Final integration task depends on all sub-beads
```

### Requesting Help
Specialists can request other specialists via spawn queue:
```bash
# Inside specialist session
cat > ~/clawd/scheduler/spawn-queue/requests/help-$(date +%s).json << 'EOF'
{
  "from": "phoenix",
  "needed": "atlas",
  "reason": "Need API endpoint for user profile",
  "bead": "clawd-123",
  "priority": 1
}
EOF
```

Coordinator's next heartbeat processes this and spawns Atlas.

---

## ⚠️ Contingencies

### Specialist Fails Mid-Work
- Bead stays `in_progress`
- Next Coordinator heartbeat detects stale (>4hr)
- Re-spawns with fresh context OR escalates

### Multiple Tasks for Same Specialist
- Coordinator checks capacity (max concurrent per TASK-ROUTING.md)
- If over capacity, tasks stay in `ready` queue
- Next heartbeat picks them up

### Specialist Needs Escalation
```bash
# Write to coordinator inbox
cat > ~/clawd/scheduler/inboxes/coordinator/escalate-$(date +%s).json << 'EOF'
{
  "from": "phoenix",
  "type": "escalation",
  "bead": "clawd-123",
  "reason": "Task larger than expected, needs Architect input",
  "suggested_action": "spawn athena for design review"
}
EOF
```

### Validator Rejects Work
- Bead status → `needs-fix`
- Next Coordinator heartbeat sees it
- Re-spawns original specialist with rejection notes

---

## 🔧 Cron Configuration

| Cron | Model | Frequency | Purpose |
|------|-------|-----------|---------|
| coordinator | Sonnet | 30min | Route tasks, spawn specialists, manage flow |
| validator | Sonnet | 2x/hour | Independent QA |
| auditor | Sonnet | 1hr | Hallucination checks, sampling |
| person-manager | Opus | 4x/day + nightly | Strategy + reflection + hiring |
| spawn-processor | Haiku | 2min | Process spawn queue |

**Specialists have NO crons.** They are invoked.

---

## 📁 File Structure

```
scheduler/
├── SWARM-ARCHITECTURE.md      # This file
├── TASK-ROUTING.md            # Label → Specialist mapping
├── spawn-queue/               # Request queue for spawns
│   ├── requests/              # Pending spawn requests
│   └── responses/             # Spawn results
├── inboxes/                   # Inter-agent communication
│   ├── coordinator/
│   ├── person-manager/
│   └── validator/
└── specialists/
    ├── frontend/IDENTITY.md   # Phoenix
    ├── backend/IDENTITY.md    # Atlas
    ├── architect/IDENTITY.md  # Athena
    ├── qa/IDENTITY.md         # Mercury
    ├── devops/IDENTITY.md     # Forge
    ├── infrastructure/IDENTITY.md  # (NEW) Titan
    └── auditor/IDENTITY.md    # Argus
```

---

## 🎯 Key Insight

**The swarm is event-driven, not poll-driven.**

- Crons are for OVERSEERS (Coordinator, Validator, Auditor, Person Manager)
- Specialists are MUSCLES that activate when called
- Work flows through beads, not direct messages
- Handoffs are explicit (bead status changes trigger next action)
