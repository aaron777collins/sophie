# Verification System — Trust But Verify

> **"Employees can lie. Verify everything. Then have someone else verify."**

## Core Principle: Self-Validation + Independent Validation

**Each level SELF-VALIDATES, then Validator provides INDEPENDENT verification.**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    TWO-LAYER VALIDATION PATTERN                          │
└─────────────────────────────────────────────────────────────────────────┘

Layer 1: SELF-VALIDATION (catches obvious issues)
Layer 2: INDEPENDENT VALIDATION by Validator (catches what you missed)

WRONG: Work → Claim done → Hope someone validates
WRONG: Work → Self-validate → Claim done (no independent check)

RIGHT: Work → Self-validate → Send to Validator → Independent check → Complete
```

### The Flow (Updated 2026-02-18)

```
Coordinator: Works autonomously (doesn't wait for Person Manager)
    ↓
Workers complete tasks, claim done
    ↓
Coordinator SELF-VALIDATES:
    1. Spawn verification sub-agent(s) — different perspectives
    2. Check: Does build pass? Do tests pass? Does it work?
    3. Review from multiple angles (skeptic, pragmatist, etc.)
    ↓ ONLY if self-validation passes
Coordinator SENDS TO VALIDATOR (validation request):
    - Task IDs, files changed, acceptance criteria
    - What self-validation already checked
    ↓
🔍 VALIDATOR independently verifies:
    - Actually runs build/tests (doesn't trust claims)
    - Reads the code
    - Tests functionality
    - Catches what Coordinator missed
    ↓ Sends result back to Coordinator
If PASS → Mark truly complete, move to next
If FAIL → Back to workers for fixes
    ↓
Person Manager: Oversees both, handles escalations, spot-checks
```

### Self-Validation Requirements (MANDATORY)

**Before marking ANY batch/phase complete, Coordinator must:**

1. **Spawn verification sub-agent(s)** — At least one, ideally with different perspectives
2. **Run actual validation** — Build, tests, manual checks
3. **Multi-perspective review** — Use Circle thinking:
   - 🔧 Pragmatist: Does this actually work?
   - 🔍 Skeptic: What could be wrong? What did we miss?
   - 🛡️ Guardian: Any security/quality issues?
4. **Document findings** — Note what was checked and results

**Without self-validation, work is NOT complete. Period.**

### Why Self-Validation Matters

- Catches errors at the source (faster fixes)
- Prevents cascading failures up the chain
- Each level owns their quality
- Person Manager can spot-check, not block on every item

**Upward validation (Person Manager auditing Coordinator) is AFTER and for quality assurance, not gatekeeping.**

---

## The Problem

Sub-agents mark tasks "complete" without:
- Actually finishing the work
- Verifying the output works
- Deploying changes
- Testing in real environments

**Examples of failures:**
- MELO "v1.0.0 release" announced but no git tag, no deployment
- E2EE code "complete" but never pushed to production
- Tests "passing" that weren't actually run

## The Solution

**Two-layer validation: Self-validate, then independent validation by Validator.**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      VERIFICATION CHAIN (Updated)                        │
└─────────────────────────────────────────────────────────────────────────┘

Worker claims "done"
    ↓
Task Manager SELF-VALIDATES (runs tests, checks files, validates output)
    ↓ only if self-validated
Coordinator SELF-VALIDATES batch (integration tests, spot-checks)
    ↓ only if self-validated
Coordinator SENDS TO VALIDATOR ← NEW STEP
    ↓
🔍 Validator INDEPENDENTLY VERIFIES (doesn't trust claims, runs everything)
    ↓ only if Validator approves
Coordinator marks truly COMPLETE
    ↓
Person Manager OVERSEES (spot-checks, handles escalations from Validator)
    ↓
ACTUALLY COMPLETE ✅
```

---

## 🔍 The Validator (NEW)

**Added 2026-02-18 to catch lazy bots and prevent false completions.**

### Why Validator Exists

- Coordinators can be optimistic about their own work
- Self-validation misses things (you don't see your own blind spots)
- Independent fact-checking catches what self-validation misses
- Bots should not be lazy — Validator enforces this

### Validator's Role

| What | How |
|------|-----|
| **Receives** | Validation requests from Coordinator's inbox |
| **Verifies** | Actually runs build, tests, reads code, tests functionality |
| **Reports** | Sends results back to Coordinator |
| **Escalates** | Alerts Person Manager of systemic issues |

### The Validation Request Flow

```
1. Coordinator claims batch complete (after self-validating)
2. Coordinator sends validation request to scheduler/inboxes/validator/
3. Validator picks up request (runs at :10 and :40, offset from Coordinator)
4. Validator independently verifies:
   - Runs build (doesn't trust "build passes" claim)
   - Runs tests (doesn't trust "tests pass" claim)
   - Reads the code (checks quality, completeness)
   - Tests functionality (actually uses the feature)
5. Validator sends result to scheduler/inboxes/coordinator/
6. If PASS: Coordinator marks truly complete
7. If FAIL: Coordinator sends back for fixes
```

### Validator Communication

**Coordinator → Validator (validation-request):**
```json
{
  "type": "validation-request",
  "task_ids": ["p1-2-a", "p1-2-b"],
  "project": "project-name",
  "phase": "Phase 2",
  "files_changed": ["path/to/file.ts"],
  "acceptance_criteria": ["Build passes", "Auth flow works"],
  "self_validation_notes": "What Coordinator already checked"
}
```

**Validator → Coordinator (validation-result):**
```json
{
  "type": "validation-result",
  "result": "PASS" | "FAIL" | "PARTIAL",
  "findings": [...],
  "summary": "1/2 tasks validated. p1-2-b needs fixes."
}
```

### Validator Cron

- **Schedule:** Every 30 min at :10 and :40 (10-minute offset from Coordinator)
- **Model:** Sonnet (can escalate to Opus for complex validation)
- **Jobs File:** `scheduler/validator/JOBS.md`
- **Inbox:** `scheduler/inboxes/validator/`
- **Identity:** `scheduler/validator/IDENTITY.md`

---

## Verification Requirements by Level

### 🧪 Testing Phase (NEW - MANDATORY)

**Before verification, the TESTING phase must happen:**

Every task must have:
1. **Acceptance Criteria** — Defined before work starts
2. **Validation Steps** — How to verify each criterion

Worker must execute ALL validation steps before claiming complete.

### L4 Worker → L3 Task Manager Handoff

**Worker must provide:**
```markdown
## Completion Report
- **Task:** {task-id}
- **Status:** claiming-complete

### Acceptance Criteria Verification
- [x] Criterion 1: How it was verified
- [x] Criterion 2: How it was verified
- [x] Build passes: Command + result
- [x] Tests pass: Command + result

### Evidence
- Files created/modified: {list with paths}
- Build status: {pass/fail with command used}
- Tests run: {which tests, results}
- Git commit: {hash}

### Verification Steps for Manager
{How to verify this works}
```

**Task Manager must verify:**
- [ ] Acceptance criteria provided and checked
- [ ] Files actually exist at claimed paths
- [ ] Build actually passes (`pnpm build`, `npm test`, etc.)
- [ ] Claimed tests actually pass
- [ ] Git commit exists and contains claimed changes
- [ ] Functionality works (quick manual test)

**If verification fails:** Send back to worker with specific failures

### L3 Task Manager → L2 Coordinator Handoff

**Task Manager must provide:**
```markdown
## Verified Completion
- **Task:** {task-id}
- **Worker verified:** {yes, with evidence}
- **My verification:**
  - Build confirmed: {command + result}
  - Tests confirmed: {which tests + results}
  - Manual check: {what I tested}
- **Ready for audit:** yes
```

**Coordinator must audit:**
- [ ] Spot-check at least one file from each completion
- [ ] Run integration tests (if applicable)
- [ ] Verify against original requirements
- [ ] Check for missed edge cases
- [ ] Confirm documentation updated

### L2 Coordinator → L1 Person Manager Handoff

**Coordinator must provide:**
```markdown
## Phase/Feature Completion Report
- **Phase:** {phase-id}
- **Tasks completed:** {count}
- **All tasks verified:** {yes/no}
- **Integration tested:** {yes/no with results}
- **Deployment status:** {not deployed / deployed to X}
- **Known issues:** {list or none}
```

**Person Manager must confirm:**
- [ ] Review Coordinator's audit report
- [ ] Spot-check critical items
- [ ] Verify deployment (if claimed)
- [ ] Confirm against original goals
- [ ] Approve for release/announcement

---

## Verification Commands

### Quick Verification Checklist

```bash
# Check if file exists
ls -la {path}

# Check git commit exists
git log --oneline -1 {hash}

# Check build passes
pnpm build 2>&1 | tail -20

# Check tests pass
pnpm test 2>&1 | tail -30

# Check deployment is live
curl -s {url} | head -20
```

### Model Assignment for Verification

| Verification Type | Model | Why |
|-------------------|-------|-----|
| File existence | Haiku | Simple check |
| Build verification | Haiku | Run command, check exit code |
| Test verification | Sonnet | May need to interpret failures |
| Integration testing | Sonnet | Complex scenarios |
| Security audit | Opus | Critical, needs deep analysis |
| Deployment verification | Sonnet | Multiple checks needed |

---

## Updated Task Status Flow

```
pending → in-progress → claiming-complete → verified → validated → COMPLETE
                              ↓                ↓          ↓
                          (failed)         (failed)   (failed)
                              ↓                ↓          ↓
                         in-progress     in-progress  in-progress
```

**Statuses:**
- `pending` — Not started
- `in-progress` — Worker actively working
- `claiming-complete` — Worker says done, awaiting self-verification
- `verified` — Task Manager/Coordinator self-validated
- `validated` — **Validator independently verified** (NEW)
- `complete` — Truly done, approved

**The key addition:** `validated` status can only be set by Validator after independent verification.

---

## PROACTIVE-JOBS.md Format Update

```markdown
### {task-id}
- **Status:** verified  ← NEW: more granular statuses
- **Worker:** {session-id}
- **Claimed Complete:** 2026-02-14 14:00 EST
- **Verified By:** task-manager @ 2026-02-14 14:15 EST
- **Verification Notes:** Build passes, tests pass, manual check OK
- **Audited By:** coordinator @ 2026-02-14 14:30 EST ← NEW
- **Audit Notes:** Integration test passed, requirements met ← NEW
```

---

## Audit Task Templates

### Task Manager Verification Task
```markdown
### verify-{task-id}
- **Status:** pending
- **Min Model:** haiku
- **Description:** Verify {task-id} completion claims
- **Instructions:**
  1. Read {task-id} completion report
  2. Check files exist: {list}
  3. Run: `pnpm build` - must exit 0
  4. Run: `pnpm test` - must pass
  5. Check git commit {hash} exists
  6. Manual test: {specific test}
- **Success Criteria:**
  - [ ] All files exist
  - [ ] Build passes
  - [ ] Tests pass
  - [ ] Commit verified
  - [ ] Manual test works
- **If fails:** Mark {task-id} as in-progress with failure notes
```

### Coordinator Audit Task
```markdown
### audit-{phase-id}
- **Status:** pending
- **Min Model:** sonnet
- **Description:** Audit {phase-id} completions
- **Instructions:**
  1. Review all verification reports for phase
  2. Spot-check 2-3 random completed tasks
  3. Run integration tests
  4. Check deployment (if applicable)
  5. Verify requirements met
- **Success Criteria:**
  - [ ] All tasks verified
  - [ ] Spot-checks pass
  - [ ] Integration works
  - [ ] Deployment confirmed (if claimed)
```

---

## Escalation Path

**If verification fails:**
1. Document specific failure
2. Send back to worker with clear instructions
3. Worker fixes and re-submits
4. Re-verify

**If repeated failures (3+):**
1. Escalate to Coordinator
2. Coordinator investigates root cause
3. May need different worker model or approach

**If audit reveals systematic issues:**
1. Escalate to Person Manager
2. Review all completions from that worker
3. Consider re-doing affected work

---

## Anti-Patterns

❌ **Trusting completion claims without verification**
❌ **Skipping verification to "save time"**
❌ **Marking verified without running actual commands**
❌ **Auditing your own work** (must be different agent)
❌ **Announcing completion before deployment verified**

---

## Implementation Checklist

- [ ] Update AGENTS.md with verification requirements
- [ ] Update Person Manager IDENTITY.md
- [ ] Update Coordinator IDENTITY.md
- [ ] Update Task Manager cron to include verification
- [ ] Update PROACTIVE-JOBS.md format
- [ ] Create verification task templates
- [ ] Test the system on a real task

---

## Success Criteria for This System

The verification system is working when:
1. ✅ No false completions reach Person Manager
2. ✅ All deployed features actually work
3. ✅ Build failures are caught before "complete" status
4. ✅ Managers can trust completion reports
5. ✅ Clear audit trail for every completion
