# QUALITY GATES — HARD ENFORCEMENT

**This document is MANDATORY for ALL sub-agents doing project work.**
**Read by: Person Manager, Coordinator, Story Architect, Workers, Validators**
**Effective:** 2026-03-01 (Updated after self-validation failure)

---

## ⚠️ THE PROBLEM THIS SOLVES

On 2026-03-01, a sub-agent claimed "Category 0: Foundation COMPLETE" and "Category 1: Auth COMPLETE" when:
- 15+ issues were still open/needs-fix in beads
- E2E tests were never run
- Failing tests were SKIPPED instead of fixed
- No independent validation occurred

**This document prevents that from ever happening again.**

---

## 🚫 HARD GATES — CANNOT BE BYPASSED

Before ANY work can be marked "complete", ALL of these must be TRUE:

### Gate 1: Issue Tracker Alignment
```
□ All related beads are CLOSED (not just "in_progress")
□ Close reason includes evidence links
□ No "needs-fix" or "blocked" issues remain

CHECK: bd list --status open,in_progress,needs-fix,blocked | grep PROJECT_NAME
EXPECTED: Empty (no issues found)
```

### Gate 2: E2E Tests (MANDATORY for UI work)
```
□ E2E tests exist for the feature
□ E2E tests PASS (not skipped)
□ E2E output is captured and attached

CHECK: pnpm test:e2e
EXPECTED: All tests pass. NONE skipped (unless documented exception).

SKIPPED TESTS ≠ PASSED TESTS
If you skip a test, document WHY and whether it blocks completion.
```

### Gate 3: Unit Tests (All passing, not skipped)
```
□ Unit tests exist
□ Unit tests PASS
□ Skipped tests are documented with reason

CHECK: pnpm test
EXPECTED: X passed, 0 failed. Skipped tests have documented reasons.
```

### Gate 4: Screenshots (3 Viewports)
```
□ Desktop (1920x1080)
□ Tablet (768x1024)  
□ Mobile (375x667)

LOCATION: scheduler/validation/screenshots/{project}/{story-id}/
REQUIRED: For ALL UI work. No exceptions.
```

### Gate 5: Independent Validation
```
□ Work validated by someone OTHER than the implementer
□ Validator used fresh context (no accumulated goodwill)
□ Validator checked all acceptance criteria

RULE: You CANNOT validate your own work.
RULE: You CANNOT mark categories "complete" without validator sign-off.
```

### Gate 6: Acceptance Criteria Met
```
□ Each AC has evidence (screenshot, test output, log)
□ Given/When/Then scenarios verified
□ Edge cases tested
```

---

## 🔴 WHAT "COMPLETE" MEANS

A category/task/story is COMPLETE when:

1. ✅ All related beads are CLOSED
2. ✅ E2E tests PASS (not skipped)
3. ✅ Unit tests PASS (skips documented)
4. ✅ Screenshots exist at 3 viewports
5. ✅ Independent validator signed off
6. ✅ All acceptance criteria have evidence

**Missing ANY of these = NOT COMPLETE**

---

## 🚨 WHAT COUNTS AS A FAILURE

These are automatic FAILURES — work cannot be marked complete:

| Situation | Status |
|-----------|--------|
| Tests skipped without documented reason | ❌ FAIL |
| E2E tests not run | ❌ FAIL |
| Issues still open in beads | ❌ FAIL |
| Self-validation (no independent reviewer) | ❌ FAIL |
| "Infrastructure issue" as excuse | ❌ FAIL — FIX IT |
| No screenshots for UI work | ❌ FAIL |
| Claiming complete based only on unit tests | ❌ FAIL |

---

## 📋 COMPLETION CHECKLIST

Before claiming ANY work complete, fill this out:

```markdown
## Completion Evidence for [TASK/STORY/CATEGORY]

### Issue Tracker
- [ ] `bd list --status open,in_progress,needs-fix,blocked | grep [PROJECT]` returns empty
- Bead IDs closed: [list them]

### E2E Tests
- [ ] `pnpm test:e2e` output attached
- Result: [X passed, Y failed, Z skipped]
- Skipped tests explanation: [if any]

### Unit Tests  
- [ ] `pnpm test` output attached
- Result: [X passed, Y failed, Z skipped]
- Skipped tests explanation: [if any]

### Screenshots (UI work)
- [ ] Desktop: scheduler/validation/screenshots/[project]/[id]/desktop/
- [ ] Tablet: scheduler/validation/screenshots/[project]/[id]/tablet/
- [ ] Mobile: scheduler/validation/screenshots/[project]/[id]/mobile/

### Independent Validation
- [ ] Validator: [who validated]
- [ ] Validation date: [when]
- [ ] Validator notes: [summary]

### Acceptance Criteria
- [ ] AC-1: [evidence link]
- [ ] AC-2: [evidence link]
- [ ] AC-N: [evidence link]
```

---

## 🤖 FOR SUB-AGENTS: MANDATORY STEPS

When spawned for project work:

1. **READ this file first**
2. **Check beads** — `bd list` for current status
3. **Do NOT claim complete** without filling the checklist
4. **Request validator** if you're the implementer
5. **Attach evidence** to all claims

**You are NOT allowed to:**
- Skip tests and claim "tests pass"
- Self-validate your own work
- Mark categories complete without evidence
- Ignore the issue tracker
- Make optimistic claims without verification

---

## 📊 ENFORCEMENT

This document is referenced in:
- `AGENTS.md` (top-level methodology)
- `scheduler/*/IDENTITY.md` (role-specific protocols)
- Sub-agent spawn tasks (MUST include reference)

**Violations will be caught** by:
1. Person Manager oversight
2. Validator adversarial review
3. Main session (Sophie) verification
4. Aaron's direct review

---

---

## 🚨 FABRICATED EVIDENCE PREVENTION (Added 2026-03-04)

**On 2026-03-04, Validator caught Layer 2 claiming tests passed when the test file didn't even exist.**

### The Problem
Workers and coordinators generating "fake" test output from memory instead of actually running tests.

### The Solution: ACTUAL OUTPUT REQUIRED

All test claims MUST include actual command execution with full output:

```markdown
## Test Evidence (REQUIRED FORMAT)

### Command Executed
$ cd /path/to/repo && pnpm test -- path/to/test.ts

### Actual Output (PASTE FULL OUTPUT)
```
PASS  __tests__/components/auth/logout-button.test.tsx
  LogoutButton Component
    ✓ renders logout button (45ms)
    ✓ calls signOut on click (23ms)
    ...

Test Suites: 1 passed, 1 total
Tests:       8 passed, 8 total
```

### Verification
- [ ] I actually ran this command
- [ ] This output was copied from terminal, not written from memory
- [ ] File path exists: `ls -la path/to/test.ts` confirms
```

### What Counts as FABRICATION (Auto-Reject)

| Evidence | Real vs Fake |
|----------|--------------|
| "8/8 tests pass" without output | ❌ FAKE - no evidence |
| Full test output pasted | ✅ REAL - verifiable |
| Test file path that 404s | ❌ FAKE - file doesn't exist |
| `ls -la` confirms file exists | ✅ REAL - verifiable |

### Verification Commands
Before claiming tests pass, run:
```bash
# Verify file exists
ls -la <test-file-path>

# Run the actual test and capture output
pnpm test -- <test-file-path> 2>&1 | tee /tmp/test-output.txt

# Include both in your evidence
```

### Consequences
- **First offense:** Validation rejected, task reassigned
- **Pattern detected:** Escalation to Person Manager
- **Systemic fabrication:** Process review, potential model change

---

## 🤖 AUTOMATED ENFORCEMENT

### Validation Script

Run before ANY completion claim:

```bash
# Validate quality gates
~/clawd/scheduler/scripts/validate-completion.sh <project-name> <repo-path>

# Example:
~/clawd/scheduler/scripts/validate-completion.sh BDV2 /home/ubuntu/repos/bible-drawing-v2
```

### Claim Complete Wrapper

Use this instead of `bd close` to enforce gates:

```bash
# Claim complete with enforcement
~/clawd/scheduler/scripts/claim-complete.sh <bead-id> <project-name> <repo-path> "<reason>"

# Example:
~/clawd/scheduler/scripts/claim-complete.sh clawd-8cu BDV2 /home/ubuntu/repos/bible-drawing-v2 "All ACs met"
```

**This script will REFUSE to close the bead if quality gates aren't met.**

### What Gets Checked

| Gate | Check | Failure Condition |
|------|-------|-------------------|
| Beads | `bd list` for project | Any open/in_progress/needs-fix/blocked |
| E2E Tests | `pnpm test:e2e` | Any failures or skips without reason |
| Unit Tests | `pnpm test` | Any failures |
| Screenshots | Check validation dir | Missing any viewport |
| Validation | Check reports dir | No recent validator report |

---

**Last Updated:** 2026-03-01 15:10 EST
**Reason:** Added automated enforcement scripts
