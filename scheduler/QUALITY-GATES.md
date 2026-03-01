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

**Last Updated:** 2026-03-01 15:00 EST
**Reason:** Sub-agent claimed "complete" without meeting any quality gates
