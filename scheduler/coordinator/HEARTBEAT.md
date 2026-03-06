# Coordinator Heartbeat (Every 30 Minutes)

> **Purpose:** Route work to specialists, track progress, spawn validators
> **Model:** Sonnet
> **Read First:** `scheduler/SWARM-ARCHITECTURE.md`

---

## On Every Heartbeat

### Step 1: Check Ready Work

```bash
bd ready --json
```

For each ready task:
1. Read its labels and description
2. Route to appropriate specialist (see routing table below)
3. Spawn the specialist with proper context

### Step 2: Route by Labels

| Label | Spawn As | Identity Path |
|-------|----------|---------------|
| `frontend` | Phoenix | `scheduler/specialists/frontend/IDENTITY.md` |
| `backend` | Atlas | `scheduler/specialists/backend/IDENTITY.md` |
| `testing` | Mercury | `scheduler/specialists/qa/IDENTITY.md` |
| `devops` | Forge | `scheduler/specialists/devops/IDENTITY.md` |
| `architecture` | Athena | `scheduler/specialists/architect/IDENTITY.md` |

**If no label:** Analyze title for keywords:
- UI, component, style, button, form → frontend
- API, database, auth, server → backend
- test, coverage, e2e → testing
- deploy, CI, docker → devops
- schema, design, pattern → architecture

### Step 3: Spawn Specialist

```
sessions_spawn(
  task="""
  You are {NAME}, the {ROLE} Specialist.
  
  **Read your identity first:** {IDENTITY_PATH}
  
  **Your assignment:**
  - Bead ID: {bead-id}
  - Title: {title}
  - Description: {description}
  
  **Workflow:**
  1. Claim: `bd update {bead-id} --claim`
  2. Spawn sub-agent for implementation (keep context fresh)
  3. Follow TDD: tests first
  4. Collect evidence: `scheduler/evidence/{bead-id}/`
  5. When done: `bd update {bead-id} --status needs-validation`
  
  **DO NOT** claim completion without evidence.
  """,
  model="sonnet",
  label="{name}-{bead-id}"
)
```

### Step 4: Check Needs-Validation

```bash
bd list --status needs-validation --json
```

For each task needing validation:
1. Spawn Validator (Sentinel)

```
sessions_spawn(
  task="""
  You are Sentinel, the Validator.
  
  **Read your identity:** scheduler/validator/IDENTITY.md
  
  **Task to validate:**
  - Bead ID: {bead-id}
  - Title: {title}
  - Evidence at: scheduler/evidence/{bead-id}/
  
  **Workflow:**
  1. Read acceptance criteria from bead
  2. Verify each criterion independently
  3. Run tests yourself, take your own screenshots
  4. If PASS: `bd close {bead-id} --reason "Validated"`
  5. If FAIL: `bd update {bead-id} --status needs-fix` with specific failures
  """,
  model="sonnet",
  label="validator-{bead-id}"
)
```

### Step 5: Check Needs-Fix (Re-assignment)

```bash
bd list --status needs-fix --json
```

For each task needing fix:
1. Check previous validation failure notes
2. Re-spawn original specialist type with failure context
3. Include what specifically failed

### Step 6: Check for Stalled Tasks

```bash
bd list --status in_progress --json
```

For each in-progress task:
- If last update > 4 hours ago → Task may be stalled
- Check if spawn session still active
- If not, re-spawn specialist

### Step 7: Update Daily Log

Note:
- Tasks spawned this heartbeat
- Tasks validated
- Tasks re-assigned
- Any blockers identified

---

## Capacity Limits

- **Max concurrent spawns:** 4 per heartbeat
- **Priority order:** P0 > P1 > P2 > P3
- Remaining tasks handled next heartbeat

---

## Edge Cases

### Multiple Labels (e.g., frontend + backend)
1. Check if task can be split → Create sub-beads
2. If not splittable → Assign to primary (larger scope label)
3. Note in bead that collaboration needed

### No Ready Tasks
- Check needs-validation and needs-fix
- If nothing to do: HEARTBEAT_OK

### Validation Fails 3+ Times
1. Add label `escalated`
2. Note in Person Manager inbox
3. Don't auto-re-spawn, needs review

---

## If Nothing Needs Attention

Reply: HEARTBEAT_OK
