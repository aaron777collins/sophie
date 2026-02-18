# Coordinator Jobs

**Updated:** 2026-02-18 02:52 EST  
**Source:** Person Manager (Aaron's direct order)

## 🎯 Current Mission: MELO v2 Final Completion

Aaron's requirement: **TDD, E2E tests, E2EE verification, done right.**

---

## 📋 Active Phases

### Phase A: Fix Failing E2E Tests (P0 - IMMEDIATE)
**Status:** ⏳ NOT STARTED  
**Model:** Sonnet  
**Estimated:** 2-4 hours

#### Tasks:
1. Run full E2E test suite and capture all failures
2. Categorize each failure (flaky, broken logic, missing deps)
3. Fix failures one by one with TDD approach:
   - Understand what the test expects
   - Fix the implementation to match
   - Verify test passes
4. Achieve 100% pass rate

#### Acceptance Criteria:
- [ ] `npm run test:e2e` exits with 0
- [ ] All tests pass (not skipped)
- [ ] No flaky tests (run 3x to verify)

#### Validation:
```bash
npm run test:e2e 2>&1 | tail -50
# Must show: all tests passing
```

---

### Phase B: Add Unit Test Infrastructure (P0 - 1 day)
**Status:** ⏳ BLOCKED (depends on Phase A)  
**Model:** Sonnet  
**Estimated:** 4-6 hours

#### Tasks:
1. Add Vitest to project:
   ```bash
   npm install -D vitest @vitest/coverage-v8
   ```
2. Create `vitest.config.ts`
3. Add `test:unit` script to package.json
4. Write unit tests for critical modules:
   - `lib/matrix/access-control.ts` 
   - `lib/matrix/auth.ts`
   - `lib/matrix/admin-invites.ts`
   - `lib/matrix/e2ee.ts` (if exists)

#### Acceptance Criteria:
- [ ] `npm run test:unit` works
- [ ] >80% coverage on critical modules
- [ ] All unit tests pass

---

### Phase C: E2EE Audit & Verification (P0 - 1 day)
**Status:** ⏳ BLOCKED (depends on Phase A)  
**Model:** Sonnet  
**Estimated:** 4-6 hours

#### Tasks:
1. Audit all room creation code paths:
   - `components/modals/initial-modal.tsx`
   - `lib/matrix/server-templates.ts`
   - DM creation paths
2. Verify encryption is MANDATORY:
   - No way to create unencrypted rooms
   - All templates have `encrypted: true`
3. Write E2E tests that verify encryption:
   - Test that new servers have encryption
   - Test that new DMs have encryption
   - Test that encryption cannot be disabled

#### Acceptance Criteria:
- [ ] All room creation paths audited
- [ ] Encryption is mandatory (no opt-out)
- [ ] E2E tests verify encryption is active
- [ ] Tests pass

---

### Phase D: Voice/Video Testing (P1)
**Status:** ⏳ BLOCKED (depends on Phase C)  
**Model:** Sonnet  
**Estimated:** 3-4 hours

#### Tasks:
1. Manual testing of LiveKit integration
2. Manual testing of Element Call
3. Write E2E tests for:
   - Initiating voice call
   - Initiating video call
   - Joining existing call
4. Document any issues

#### Acceptance Criteria:
- [ ] Voice calls work between 2 users
- [ ] Video calls work between 2 users
- [ ] E2E tests for call initiation pass

---

### Phase E: Cleanup & Final Commit (P1)
**Status:** ⏳ BLOCKED (depends on Phase D)  
**Model:** Haiku  
**Estimated:** 1-2 hours

#### Tasks:
1. `git status` to find uncommitted changes
2. Remove console.log statements
3. Remove placeholder/TODO comments
4. Commit all changes with good messages
5. Push to remote
6. Final build verification

#### Acceptance Criteria:
- [ ] `git status` shows clean working tree
- [ ] No console.log in production code
- [ ] No placeholder code
- [ ] `npm run build` exits 0

---

## 📊 Progress Tracking

| Phase | Status | Started | Completed | Notes |
|-------|--------|---------|-----------|-------|
| A: Fix E2E Tests | ⏳ | - | - | - |
| B: Unit Tests | ⏳ | - | - | Blocked on A |
| C: E2EE Audit | ⏳ | - | - | Blocked on A |
| D: Voice/Video | ⏳ | - | - | Blocked on C |
| E: Cleanup | ⏳ | - | - | Blocked on D |

---

## 🔧 Worker Assignments

| Worker ID | Phase | Model | Status |
|-----------|-------|-------|--------|
| TBD | A | Sonnet | Pending |
| TBD | B | Sonnet | Pending |
| TBD | C | Sonnet | Pending |
| TBD | D | Sonnet | Pending |
| TBD | E | Haiku | Pending |

---

## Notes

- **TDD is mandatory** — tests first, then fix
- **Quality over speed** — don't rush, do it right
- **Verify before complete** — run tests, check build
- **Report to Slack** — keep #aibot-chat updated
