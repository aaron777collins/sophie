## PROACTIVE-JOBS.md - Active Task Queue

**Updated:** 2026-03-01 14:15 EST by Person Manager (subagent)
**Worker Slots:** Available for assignment
**Priority:** Bible Drawing V2 Phase 1 UNBLOCKED

---

## 🎯 BIBLE DRAWING V2: Phase 1 Status (PM Assessment)

**Phase 1 Plan:** ✅ APPROVED (2026-03-01 08:00 EST per clawd-9vx)
**Plan Location:** `~/clawd/docs/plans/bible-drawing-v2/phases/PHASE-1.md` (v2, 40 tasks)

### Progress Summary

| Category | Status | Tasks | Notes |
|----------|--------|-------|-------|
| **Cat 0: Foundation** | ✅ COMPLETE | 6/6 | Repo, Next.js, Tailwind, Tests, Storage |
| **Cat 1: Auth** | ✅ COMPLETE | 6/6 | NextAuth, Login/Logout, Sessions, Rate Limit |
| **Cat 2: Upload** | 🔄 IN PROGRESS | 1/9 | p1-2-a code DONE (needs re-validation) |
| **Cat 3: Processing** | ⏳ BLOCKED | 0/11 | Waiting on Cat 2 |
| **Cat 4: Transcript** | ⏳ BLOCKED | 0/8 | Waiting on Cat 3 |
| **Cat 5: Export** | ⏳ BLOCKED | 0/5 | Waiting on Cat 4 |
| **Cat 6: Preview** | ⏳ BLOCKED | 0/4 | Waiting on Cat 2 |

### Test Status
- **Unit Tests:** 147/155 passing (95%)
- **Failing Tests:** 8 tests fail due to test database setup issues (NOT code bugs)
- **Root Cause:** Integration tests expect seeded test users; no seed script exists

---

## 🚨 CRITICAL PATH: Unblock Video Upload

The test infrastructure issue is blocking progress. Fix this FIRST:

### Task 1: Fix Test Database (HIGHEST PRIORITY)

| Field | Value |
|-------|-------|
| **Issue** | `clawd-lbk` |
| **Title** | BDV2-INFRA: Fix Test Database Setup & Seeding |
| **Priority** | P0 - Blocking all forward progress |
| **Model** | Sonnet |
| **Est. Time** | 1-2 hours |

**Problem:**
- Integration tests expect user 'aaron' with password 'correctpassword'
- No seed script exists
- Database name mismatch in configs

**Fix:**
1. Create `scripts/seed-test-db.ts` to populate test users
2. Update `jest.setup.js` to seed before integration tests
3. Fix `.env.test` database URL if needed

**Acceptance Criteria:**
- All 155 tests pass
- `pnpm test` runs green

---

### Task 2: Re-validate p1-2-a (After clawd-lbk)

| Field | Value |
|-------|-------|
| **Issue** | `clawd-8cu` |
| **Title** | BDV2-p1-2-a: Create project creation UI |
| **Status** | Code COMPLETE - needs re-validation |
| **Model** | Validator (Sonnet) |

**Context:** The code is DONE. Previous validation failed due to test infrastructure issues, not code bugs. Once clawd-lbk is complete, re-run validation.

**Files Already Implemented:**
- ✅ `src/app/projects/new/page.tsx`
- ✅ `src/components/projects/create-project-form.tsx`
- ✅ `src/app/dashboard/page.tsx`
- ✅ `__tests__/unit/components/projects/create-project-form.test.tsx` (7/7 pass)

---

## 📋 Ready Tasks (After Blocker Fixed)

Once p1-2-a is validated, these tasks are READY:

| Task ID | Description | Model | Dependencies |
|---------|-------------|-------|--------------|
| **p1-2-b** | Implement drag-drop upload component | Sonnet | p1-2-a |
| **p1-2-e** | Add file validation (size/type/security) | Sonnet | p1-2-b |
| **p1-2-g-1** | Build dashboard layout and navigation | Sonnet | p1-2-a |
| **p1-6-a** | Create HTML5 video player component | Sonnet | p1-2-a |

### Parallel Work Possible
After p1-2-a validated, workers can work on:
- **p1-2-b + p1-6-a** in parallel (different categories, both depend only on p1-2-a)

---

## 🔧 MELO V2 Unit Tests (Background)

MELO work continues in background, lower priority than BDV2:

| Task ID | Title | Status | Priority |
|---------|-------|--------|----------|
| clawd-717 | ChatInput Component Tests | in_progress | P1 |
| clawd-7v9 | Remaining Matrix Client Issues | in_progress | P1 |
| clawd-0bw | Registration Component Tests | in_progress | P2 |

---

## 🎯 Immediate Action Plan

**Step 1:** Assign Sonnet worker to `clawd-lbk` (test database fix)
```
bd update clawd-lbk --status in_progress --claim
```

**Step 2:** After clawd-lbk complete, re-validate `clawd-8cu`:
```
bd update clawd-8cu --status in_progress
# Run full validation including E2E tests
cd /home/ubuntu/repos/bible-drawing-v2 && pnpm test
cd /home/ubuntu/repos/bible-drawing-v2 && pnpm test:e2e
# Capture screenshots
```

**Step 3:** Once p1-2-a validated, spawn workers for:
- p1-2-b (drag-drop upload)
- p1-6-a (video player component)

---

## 📊 Worker Assignment Status

| Worker | Task | Status | Notes |
|--------|------|--------|-------|
| **AVAILABLE** | clawd-lbk | 🎯 ASSIGN NOW | Test DB fix - CRITICAL |
| **AVAILABLE** | - | ⏳ Waiting | Assign p1-2-b after blocker |
| melo-* workers | MELO tests | 🔄 In Progress | Continue background work |

---

## Notes

- **DO NOT rework clawd-8cu** - The code is correct. The validation failed due to test infrastructure.
- **clawd-bgi is a duplicate** of clawd-8cu - Close it after clawd-8cu is validated
- **Phase 1 critical path:** Foundation ✅ → Auth ✅ → Upload 🔄 → Processing → Transcript → Export
- **Aaron is waiting** for V2 to process videos - prioritize this over MELO

---

**Last Updated:** 2026-03-01 14:15 EST
**Updated By:** PM Subagent (bdv2-phase1-unblock)
