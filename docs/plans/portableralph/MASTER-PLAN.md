# Master Plan: PortableRalph Production Readiness

**Created:** 2026-02-14
**Author:** Sophie (for Person Manager)
**Version:** 5 (scope restructure - tests already passing)
**Status:** approved

---

## ⚡ SCOPE UPDATE (2026-02-20)

**CRITICAL CHANGE:** All 7 originally failing test suites were already fixed on 2026-02-14 by Ralph AI Agent (commit d1078e5). Phase 0-1 analysis confirmed 10/10 test suites now passing with 276+ tests.

**Obsolete Work:** Phase 0 tasks p0-2 through p0-5, ALL of Phase 1
**Focus Shift:** PR review, Windows verification, and production deployment

---

## Executive Summary

Make PortableRalph rock solid and production ready. ~~Fix all failing tests,~~ Review open PRs, verify Windows support, and deploy.

**Repository:** https://github.com/aaron777collins/portableralph
**Description:** An autonomous AI development loop that works in any repo

---

## Requirements

### Functional Requirements
- [x] All existing functionality preserved (verified - tests pass)
- [ ] Windows PowerShell 5.1+ support
- [ ] Windows CMD support (via launcher.bat)
- [ ] Email/Slack/Discord notifications work cross-platform
- [ ] Docker support functional

### Non-Functional Requirements
- [x] All 10 test suites pass (100% green) ✅ ALREADY COMPLETE
- [ ] Installation works on Linux, macOS, Windows
- [ ] Memory usage reasonable during operation
- [ ] CI/CD all green before release

### Definition of "Production Ready"
- [x] All tests pass ✅
- [ ] Open PRs addressed (merged or closed with reason)
- [ ] Windows functionality verified
- [ ] Security review passed
- [ ] No known critical bugs
- [ ] Documentation current

---

## Current State (Updated 2026-02-20)

### Test Results (10 of 10 PASSING ✅)
| Suite | Status | Tests |
|-------|--------|-------|
| Integration Tests | ✅ PASS | 30/30 |
| Security Tests | ✅ PASS | 26/26 |
| Monitor Tests | ✅ PASS | 17/17 |
| Constants Library Tests | ✅ PASS | 92/92 |
| Windows Compatibility Tests | ✅ PASS | - |
| Validation Library Tests | ✅ PASS | 59/59 |
| Setup Tests | ✅ PASS | - |
| Security Fixes Tests | ✅ PASS | ~30/30 |
| Notify Tests | ✅ PASS | - |
| Ralph Tests | ✅ PASS | 22/22 |

**Fixed in:** commit d1078e5 by Ralph AI Agent (2026-02-14)

### Open PRs
1. **PR #3:** fix: Include email in notification enabled detection (from avwohl)
2. **PR #2:** Implement a Docker sandbox for Ralph (from dmelo)

---

## Success Criteria

- [x] All 10 test suites pass ✅
- [ ] PR #3 reviewed and merged/closed
- [ ] PR #2 reviewed and merged/closed (or deferred with reason)
- [ ] Windows PowerShell workflow tested
- [ ] Windows CMD/batch workflow tested
- [ ] CI/CD workflows all green
- [ ] No security vulnerabilities
- [ ] Documentation current
- [ ] Version bump and release created

---

## Phases (RESTRUCTURED)

### Phase 0: Deep Analysis ✅ COMPLETE
**Goal:** Understand root causes before fixing
**Status:** ✅ COMPLETE - Discovered tests already pass

| Task | Description | Status | Result |
|------|-------------|--------|--------|
| p0-1 | Categorize all test failures by type | ✅ Complete | All tests already passing |
| p0-2 | Identify systemic issues | ⏭️ SKIPPED | N/A - no failures |
| p0-3 | Check for architectural issues | ⏭️ SKIPPED | N/A - no failures |
| p0-4 | Create fix complexity estimates | ⏭️ SKIPPED | N/A - no failures |
| p0-5 | Create prioritized fix order | ⏭️ SKIPPED | N/A - no failures |

**Output:** Analysis documented discovery that all tests already pass.

### Phase 1: Fix Failing Tests ⏭️ SKIPPED
**Goal:** Get all 10 test suites passing
**Status:** ⏭️ SKIPPED - Tests already pass (fixed 2026-02-14)

All tasks p1-1 through p1-8 are unnecessary. Tests already pass.

### Phase 2: Fix & Merge Open PRs 🎯 CURRENT
**Goal:** Review, fix any issues ourselves, merge, and communicate with contributors
**Estimated:** 1 day

**Approach:**
- Review each PR thoroughly
- Fix any issues ourselves (don't just request changes)
- Test with full suite
- Merge when working
- Reply to PR authors with status updates

| Task | Description | Model | Status |
|------|-------------|-------|--------|
| p2-1 | Review PR #3 code (email notifications from avwohl) | Sonnet | pending |
| p2-2 | Test PR #3 locally | Sonnet | pending |
| p2-3 | Fix any issues in PR #3 | Sonnet | pending |
| p2-4 | Comment on PR #3 - update avwohl on status | Sonnet | pending |
| p2-5 | Merge PR #3 | Haiku | pending |
| p2-6 | Review PR #2 code (Docker sandbox from dmelo) | Sonnet | pending |
| p2-7 | Test PR #2 locally | Sonnet | pending |
| p2-8 | Fix any issues in PR #2 | Sonnet | pending |
| p2-9 | Comment on PR #2 - update dmelo on status | Sonnet | pending |
| p2-10 | Merge PR #2 | Haiku | pending |

### Phase 3: Windows Verification
**Goal:** Verify Windows native support works end-to-end
**Estimated:** 0.5 days

**Testing Strategy:** Use Windows VM or real Windows machine
- PowerShell execution policy handling
- Path separator handling (\ vs /)
- Permission/UAC considerations

| Task | Description | Model |
|------|-------------|-------|
| p3-1 | Test install.ps1 on Windows | Sonnet |
| p3-2 | Test ralph.ps1 end-to-end | Sonnet |
| p3-3 | Test launcher.bat on CMD | Sonnet |
| p3-4 | Test notifications on Windows | Sonnet |
| p3-5 | Fix Windows-specific issues | Sonnet |
| p3-6 | Update Windows docs | Haiku |

### Phase 4: Production Hardening
**Goal:** Code quality, security, documentation
**Estimated:** 0.5 days

| Task | Description | Model |
|------|-------------|-------|
| p4-1 | Security audit | Sonnet |
| p4-2 | Code quality review | Sonnet |
| p4-3 | Error handling review | Sonnet |
| p4-4 | Documentation updates | Haiku |
| p4-5 | Verify CI/CD all green | Sonnet |

### Phase 5: Merge, Push & Deploy
**Goal:** Merge all changes, push to master, create release, deploy
**Estimated:** 0.5 days (with buffer)

| Task | Description | Model |
|------|-------------|-------|
| p5-1 | Merge all feature branches to master | Sonnet |
| p5-2 | Run final full test suite on master | Sonnet |
| p5-3 | Determine version number | Haiku |
| p5-4 | Update CHANGELOG.md with all changes | Sonnet |
| p5-5 | Create git tag | Haiku |
| p5-6 | Push master and tags to origin | Haiku |
| p5-7 | Create GitHub release with notes | Sonnet |
| p5-8 | Trigger deployment workflow | Sonnet |
| p5-9 | Verify deployment successful | Sonnet |

---

## Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| ~~Tests have deep/systemic bugs~~ | ~~High~~ | ~~Medium~~ | ~~Phase 0 analysis first~~ N/A - tests pass |
| Windows testing limited | Medium | Medium | Use VM if needed |
| PR conflicts | Low | Low | Rebase before merge |
| Breaking changes from fixes | High | Low | Run full suite after each fix |
| Dependency issues | Medium | Low | Check package versions |
| Rollback needed | High | Low | Tag pre-release state |

**Rollback Plan:** If release has critical issues, revert to previous tag immediately

---

## Timeline (REVISED)

| Phase | Original | Revised | Notes |
|-------|----------|---------|-------|
| Phase 0: Analysis | 0.5 days | ✅ Done | All tests already passing |
| Phase 1: Fix Tests | 2 days | ⏭️ SKIP | Tests already pass |
| Phase 2: Fix & Merge PRs | 1 day | 1 day | Current focus |
| Phase 3: Windows | 0.5 days | 0.5 days | |
| Phase 4: Hardening | 0.5 days | 0.5 days | |
| Phase 5: Release | 0.5 days | 0.5 days | |
| **Total** | **5 days** | **~3 days** | Saved 2 days |

---

## Review History

- v1: 2026-02-14 - Initial audit and plan creation
- v2: 2026-02-14 - Incorporated reviewer feedback
- v3: 2026-02-14 - Per Aaron's direction (merge + deploy steps)
- v4: 2026-02-14 - Per Aaron's direction (fix PRs ourselves)
- **v5: 2026-02-20 - SCOPE RESTRUCTURE (Person Manager)**
  - Discovery: All tests already passing (fixed 2026-02-14 by Ralph AI Agent)
  - Skipped Phase 0 tasks p0-2 through p0-5
  - Skipped entire Phase 1 (no failing tests)
  - Focus now on Phase 2 (PR review)
  - Timeline reduced from 5 days to ~3 days
