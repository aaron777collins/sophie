# Person Manager Jobs

> **CEO Role:** This agent ALWAYS runs. Check system health every time.

## 🔴 CRITICAL: MELO v2 Final Completion & Quality Assurance

**[2026-02-18 02:52 EST] Aaron's Direct Order:**
> "Make sure everything gets done right, queue it all up, make sure it follows TDD, e2e tests, e2ee, etc"

### Current State (~85% Complete)

| Phase | Status |
|-------|--------|
| P0: Critical Blockers | ✅ 6/6 complete |
| P1: High Priority | ✅ 5/5 complete |
| P2: Voice/Video | ✅ 4/4 complete |
| Build | ✅ 50 pages, production ready |
| E2E Tests | ⚠️ Need completion |
| Unit Tests | ❌ Infrastructure missing |

### ⚠️ Remaining Issues

1. **34 test failures** (79% pass rate) — MUST FIX
2. **Some P2-4 files uncommitted** — MUST COMMIT
3. **Voice/video needs real-world testing**
4. **Unit test infrastructure missing** — MUST ADD

---

## 📋 AARON'S REQUIREMENTS (NON-NEGOTIABLE)

### 1. TDD Approach
- **Tests FIRST, then implementation** for any new work
- No "implement first, test later" — that's backwards
- If fixing a bug, write a failing test that reproduces it FIRST

### 2. E2E Test Coverage (Playwright)
- All critical user flows must have E2E tests
- Tests must PASS, not just exist
- Fix the 34 failing tests before adding new ones

### 3. E2EE Verification
- E2EE is MANDATORY for all rooms (not optional)
- Audit and verify E2EE is properly enforced
- Add E2E tests that verify encryption is active

### 4. Quality Standards
- No stubs or placeholders
- No "TODO later" comments
- If a feature exists, it must be COMPLETE and TESTED
- Build must pass, tests must pass

---

## 🎯 IMMEDIATE ACTIONS

### Phase A: Fix Failing Tests (P0 - TODAY)
**Assignee:** Coordinator → Worker (Sonnet)

- [ ] Run `npm run test:e2e` and capture all failures
- [ ] Categorize failures (flaky, broken, missing deps)
- [ ] Fix each failure with proper implementation
- [ ] Verify 100% pass rate before moving on

### Phase B: Add Unit Test Infrastructure (P0 - 1 day)
**Assignee:** Coordinator → Worker (Sonnet)

- [ ] Add Vitest or Jest to package.json
- [ ] Create test setup file
- [ ] Add `test:unit` script
- [ ] Write unit tests for critical modules:
  - `lib/matrix/access-control.ts`
  - `lib/matrix/auth.ts`
  - `lib/matrix/admin-invites.ts`
  - `lib/matrix/e2ee.ts`

### Phase C: E2EE Audit & Verification (P0 - 1 day)
**Assignee:** Coordinator → Worker (Sonnet)

- [ ] Audit all room creation paths
- [ ] Verify encryption is mandatory (not optional)
- [ ] Add E2E tests that verify:
  - New servers have encryption enabled
  - New DMs have encryption enabled
  - Cannot create unencrypted rooms
- [ ] Fix any paths that allow unencrypted rooms

### Phase D: Voice/Video Testing (P1 - 1 day)
**Assignee:** Coordinator → Worker (Sonnet)

- [ ] Test LiveKit integration manually
- [ ] Test Element Call integration
- [ ] Write E2E tests for voice/video initiation
- [ ] Document any issues found

### Phase E: Cleanup & Commit (P1 - 0.5 day)
**Assignee:** Coordinator → Worker (Haiku)

- [ ] Find and commit all uncommitted changes
- [ ] Remove any console.log statements
- [ ] Remove any placeholder code
- [ ] Final build verification

---

## 📊 Definition of Done

### For Each Phase:
1. ✅ All acceptance criteria met
2. ✅ All tests pass (E2E + Unit)
3. ✅ Build succeeds (`npm run build` exit 0)
4. ✅ Code committed with descriptive message
5. ✅ Pushed to remote
6. ✅ Progress reported to Slack

### For MELO v2 Overall:
1. ✅ 100% E2E test pass rate
2. ✅ Unit test infrastructure with >80% coverage on critical modules
3. ✅ E2EE verified as mandatory
4. ✅ Voice/video tested and working
5. ✅ All code committed and pushed
6. ✅ No console.log or placeholder code
7. ✅ Build passes
8. ✅ Ready for production use

---

## 🏗️ Managed Agents

### Coordinator
- **Jobs File:** `scheduler/coordinator/JOBS.md`
- **Identity:** `scheduler/coordinator/IDENTITY.md`
- **Status:** ⏳ NEEDS UPDATED TASKS from above phases
- **Last Checked:** 2026-02-18 02:52 EST

### Task Managers (Proactive Scheduler)
- **Jobs File:** `PROACTIVE-JOBS.md`
- **Identity:** `scheduler/task-managers/IDENTITY.md`
- **Status:** ⏳ NEEDS UPDATED with Phase A-E tasks

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `/home/ubuntu/repos/melo/MELO-V2-COMPREHENSIVE-AUDIT.md` | Full security/testing audit |
| `/home/ubuntu/repos/melo/tests/e2e/` | E2E test directory |
| `scheduler/coordinator/JOBS.md` | Coordinator tasks |
| `PROACTIVE-JOBS.md` | Task Manager tasks |

---

## Recent Actions

- [2026-02-18 02:52 EST] **AARON'S ORDER** — Ensure TDD, E2E, E2EE, complete properly
- [2026-02-18 02:51 EST] Progress report: ~85% complete, 34 test failures remain
- [2026-02-17 16:20 EST] Comprehensive audit completed

---

## Next Steps (Person Manager)

1. **READ** this jobs file thoroughly
2. **UPDATE** Coordinator JOBS.md with Phase A-E breakdown
3. **UPDATE** PROACTIVE-JOBS.md with detailed task definitions
4. **SPAWN** workers to begin Phase A immediately
5. **REPORT** progress to Slack #aibot-chat
6. **VERIFY** each phase before marking complete

**Critical:** Do NOT mark anything complete until tests pass and code is committed. Quality over speed.
