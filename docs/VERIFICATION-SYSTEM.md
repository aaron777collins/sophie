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

## Testing Phase (MANDATORY)

> **CRITICAL POLICY:** Every task must complete a comprehensive testing phase before claiming completion. The testing phase must happen after implementation but before any validation layer approval.

**Foundation:** All testing requirements build upon the comprehensive testing foundation established in `AGENTS.md` and align with the `PROACTIVE-JOBS-TEMPLATE.md` structure.

### Testing Phase Requirements

Before any task can move from implementation to validation, the following testing phase must be completed:

1. **Tests Written First** — TDD approach requires tests before implementation
2. **Test Framework Integration** — Appropriate testing framework properly configured  
3. **Test Evidence Collection** — Screenshots, test output, coverage reports documented
4. **Test Validation Protocols** — All validation layers must verify test evidence
5. **Comprehensive Test Coverage** — Unit, integration, and E2E tests as applicable

**NO task may claim completion without completing the testing phase with documented evidence.**

### Testing Framework Integration Requirements

All tasks must specify and use appropriate testing frameworks based on work type:

| Work Type | Required Testing Tools | Validation Method |
|-----------|----------------------|-------------------|
| **Code Implementation** | Jest, Playwright, Cypress | Unit + E2E test suites |
| **Documentation** | Validation scripts, link checkers | Automated structure validation |
| **Infrastructure** | Terraform plan, smoke tests | Deployment validation |
| **Content/Media** | Accessibility checks, format validation | Quality + compliance checks |

### Test Evidence Collection Protocols

Each validation layer requires specific test evidence:

- **Test Results** — Complete test output with pass/fail status
- **Screenshots** — Visual evidence for UI changes and test execution  
- **Test Output** — Full command output and exit codes with comprehensive test output inclusion
- **Coverage Reports** — Code coverage percentage and detailed reports
- **Performance Metrics** — Response times and load test results (when applicable)

### Test Result Documentation Format

All test evidence must follow standardized test result documentation format:
- **Complete test execution logs** with timestamps
- **Exit codes and status indicators** for all test suites
- **Test Results Screenshots Logs** as visual evidence
- **Failure analysis** if any tests fail during execution

### Test Validation Protocols

All validation protocols must include comprehensive test verification at every layer.

---

## Verification Requirements by Level

### Enhanced 3-Layer Validation Protocol with Testing Integration

> **"It's not just 'oh I finished my code'... it's a FULL VERIFICATION!"** — Enhanced with mandatory testing verification at each layer.

```
┌─────────────────────────────────────────────────────────────────────┐
│              3-LAYER VALIDATION PROTOCOL (TESTING ENHANCED)          │
│                                                                     │
│  Layer 1: SELF-VALIDATION with Test Evidence (Worker)               │
│  Layer 2: MANAGER VALIDATION with Test Quality Review (Coordinator) │
│  Layer 3: INDEPENDENT VALIDATION with Test Verification (Validator) │
│                                                                     │
│  ALL LAYERS REQUIRE COMPREHENSIVE TESTING VERIFICATION              │
└─────────────────────────────────────────────────────────────────────┘
```

#### Layer 1: Self-Validation (Worker) — Testing Requirements

Worker MUST complete ALL testing requirements before claiming completion:

- [ ] **Tests Written BEFORE Implementation** (TDD RED phase)
- [ ] **All Tests Pass** (TDD GREEN phase) 
- [ ] **Test Evidence Collected and Documented** (screenshots, logs, coverage)
- [ ] **Testing Evidence Documented** (comprehensive test output inclusion required)
- [ ] **Testing Framework Properly Implemented** (Jest/Playwright/Cypress)
- [ ] **Performance Criteria Met** (if applicable)
- [ ] **Cannot Claim Complete Without Test Evidence**

#### Layer 2: Manager Validation (Coordinator) — Testing Verification

Coordinator MUST verify test quality before approving:

- [ ] **Verify Test Evidence Provided and Valid**
- [ ] **Confirm Tests Actually Validate Acceptance Criteria**
- [ ] **Check Test Coverage is Adequate**  
- [ ] **Validate Testing Framework Usage**
- [ ] **Cannot Approve Without Reviewing Test Results**

#### Layer 3: Independent Validation (Validator) — Test Verification

Validator MUST run independent test verification:

- [ ] **Run Tests Independently to Confirm Results**
- [ ] **Verify Test Quality and Comprehensiveness**
- [ ] **Check for Missed Edge Cases** 
- [ ] **Validate End-to-End Functionality**
- [ ] **Final Approval Requires Independent Test Verification**

### Policy Integration: "No Task Without Tests"

```
┌─────────────────────────────────────────────────────────────────────┐
│                         MANDATORY RULE                              │
│                                                                     │
│   Every task assignment MUST include:                               │
│   • Test strategy defined upfront                                   │
│   • Testing framework specified                                     │
│   • Validation method documented                                    │
│   • Evidence collection requirements                                │
│                                                                     │
│   Tasks without testing plans will be REJECTED by managers          │
└─────────────────────────────────────────────────────────────────────┘
```

**Policy Enforcement:**
- **Testing Plans Mandatory** — No task scheduling without comprehensive testing plan
- **Test Evidence Required** — Cannot claim completion without test evidence
- **Test Validation Approval Process** — Each validation layer must verify test quality
- **Task Rejection Criteria** — Tasks missing tests will be rejected without testing plans

### 🧪 Testing Methodology (MANDATORY)

**All development follows Test-Driven Development (TDD) with E2E coverage.**

#### TDD Process (Red → Green → Refactor)

```
1. WRITE TEST FIRST — Define expected behavior as a failing test
2. RUN TEST — Confirm it fails (red)
3. IMPLEMENT — Write minimum code to make test pass
4. RUN TEST — Confirm it passes (green)
5. REFACTOR — Clean up code while keeping tests green
6. REPEAT — Next test case
```

#### Testing Stack

| Layer | Tool | Purpose |
|-------|------|---------|
| Unit Tests | Vitest/Jest | Individual functions, components |
| Integration | Vitest/Jest | Module interactions |
| E2E Tests | **Playwright** | Full user flows in real browser |
| Visual | Playwright | Screenshot comparison |

#### E2E Testing with Playwright (REQUIRED for UI features)

**Every user-facing feature MUST have Playwright E2E tests.**

```bash
# Run all E2E tests
pnpm test:e2e

# Run specific test
pnpm test:e2e tests/e2e/auth.spec.ts

# Debug mode (UI)
pnpm test:e2e --ui

# Headed mode (see browser)
pnpm test:e2e --headed

# Generate tests (record)
pnpm playwright codegen http://localhost:3000
```

**E2E Test Structure:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature: User Authentication', () => {
  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Welcome');
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'wrong@example.com');
    await page.fill('[name="password"]', 'wrong');
    await page.click('button[type="submit"]');
    await expect(page.locator('.error')).toBeVisible();
  });
});
```

#### What Tests Are Required

| Feature Type | Required Tests |
|--------------|----------------|
| API endpoint | Unit + integration tests |
| UI component | Component test + E2E if user-facing |
| User flow | Playwright E2E (happy path + error cases) |
| Auth/security | Unit + integration + E2E |
| Data mutation | Unit + integration + E2E |

#### Testing Phase (MANDATORY)

**Before verification, the TESTING phase must happen:**

Every task must have:
1. **Acceptance Criteria** — Defined before work starts (as test cases!)
2. **Tests Written First** — TDD: tests exist before implementation
3. **All Tests Pass** — Unit, integration, AND E2E
4. **Validation Steps** — How to verify each criterion

Worker must execute ALL validation steps before claiming complete.

**NO feature is complete without tests. Tests are NOT optional.**

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

## Task Status Flow (OFFICIAL) — Enhanced with Testing Phase

```
pending → in-progress → testing-phase → needs-validation → self-validated → validated → COMPLETE
                             ↓               ↓                  ↓              ↓
                        (tests fail)    (validation fail)  (validation fail) (validation fail)
                             ↓               ↓                  ↓              ↓
                        in-progress → in-progress       in-progress    in-progress
```

**Testing Phase Integration:** All tasks must complete comprehensive testing phase before validation begins. Cannot claim completion without test evidence.

**Test Validation Before Status Changes:** All status progression requires test validation before status changes can be approved. No task may advance through validation layers without comprehensive test verification.

**Statuses:**

| Status | Who Sets It | Meaning |
|--------|-------------|---------|
| `pending` | Coordinator | Not started, waiting in queue |
| `in-progress` | Scheduler | Worker actively working |
| `needs-validation` | Worker | Worker claims done, awaiting self-validation |
| `self-validated` | Coordinator | Coordinator ran self-validation checks |
| `validated` | Validator | Independent verification passed |
| `complete` | Coordinator | Fully done after Validator approval |

**Enhanced Status Format with Testing Validation in PROACTIVE-JOBS.md:**
```markdown
- **Status:** self-validated (L2-coordinator)
- **Testing Phase:** 2026-02-18 12:00 EST - COMPLETED
  - Testing Framework: Jest + Playwright
  - TDD Evidence: Tests written first ✅
  - Test Results: All tests pass ✅
  - Test Coverage: 95% ✅
  - Test Evidence: Screenshots and logs collected ✅
- **Self-Validation:** 2026-02-18 12:30 EST by coordinator
  - Build: ✅ pass
  - Unit tests: ✅ pass (verified independently)
  - E2E tests: ✅ pass (verified independently)
  - Test Quality: ✅ comprehensive
  - Manual check: ✅ feature works
- **Validation:** pending (sent to validator with test evidence)
```

**Rules:**
- Only **Workers** can set `needs-validation`
- Only **Coordinator** can set `self-validated` (after running checks)
- Only **Validator** can set `validated` (after independent verification)
- Only **Coordinator** can set `complete` (after Validator approves)

**The flow is strict:** Worker → Coordinator self-validates → Validator independently verifies → Complete

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

## Integration with System Requirements

### Foundation Reference: AGENTS.md Testing Requirements
This verification system builds upon and enforces the comprehensive testing requirements established in `AGENTS.md`:
- **Testing & Validation Requirements (MANDATORY)** section
- **TDD methodology** (Red → Green → Refactor)
- **"No Task Without Tests" policy**
- **3-layer validation workflow** with testing verification

### Template Alignment: PROACTIVE-JOBS-TEMPLATE.md
All verification workflows align with the standardized template structure:
- **Testing Requirements (MANDATORY)** section in all tasks
- **Acceptance Criteria** with Given-When-Then format including test methods
- **Evidence Required** specifications for each validation layer
- **Status progression** including testing phase validation

### Planning System Integration: PLANNING-SYSTEM.md
Verification system integrates with the testing-first methodology:
- **Quality gates for planning approval** include test validation
- **User stories** cannot be approved without testing plans
- **Testing framework integration** planning requirements
- **Test environment setup** requirements in phase planning

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
