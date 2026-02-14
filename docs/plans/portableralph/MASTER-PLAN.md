# Master Plan: PortableRalph Production Readiness

**Created:** 2026-02-14
**Author:** Sophie (for Person Manager)
**Version:** 4 (fix PRs ourselves + communicate with contributors)
**Status:** approved

---

## Executive Summary

Make PortableRalph rock solid and production ready. Fix all failing tests, review open PRs, verify Windows support, and deploy.

**Repository:** https://github.com/aaron777collins/portableralph
**Description:** An autonomous AI development loop that works in any repo

---

## Requirements

### Functional Requirements
- [ ] All existing functionality preserved
- [ ] Windows PowerShell 5.1+ support
- [ ] Windows CMD support (via launcher.bat)
- [ ] Email/Slack/Discord notifications work cross-platform
- [ ] Docker support functional

### Non-Functional Requirements
- [ ] All 10 test suites pass (100% green)
- [ ] Installation works on Linux, macOS, Windows
- [ ] Memory usage reasonable during operation
- [ ] CI/CD all green before release

### Definition of "Production Ready"
- All tests pass
- Open PRs addressed (merged or closed with reason)
- Windows functionality verified
- Security review passed
- No known critical bugs
- Documentation current

---

## Current State (Audit Results)

### Test Results (7 of 10 FAILING)
| Suite | Status | Priority |
|-------|--------|----------|
| Integration Tests | ❌ FAILED | HIGH |
| Security Tests | ❌ FAILED | HIGH |
| Monitor Tests | ❌ FAILED | MEDIUM |
| Constants Library Tests | ❌ FAILED | LOW |
| Windows Compatibility Tests | ✅ PASSED | - |
| Validation Library Tests | ❌ FAILED | MEDIUM |
| Setup Tests | ✅ PASSED | - |
| Security Fixes Tests | ❌ FAILED | HIGH |
| Notify Tests | ✅ PASSED | - |
| Ralph Tests | ❌ FAILED | HIGH |

### Open PRs
1. **PR #3:** fix: Include email in notification enabled detection (from avwohl)
2. **PR #2:** Implement a Docker sandbox for Ralph (from dmelo)

---

## Success Criteria

- [ ] All 10 test suites pass
- [ ] PR #3 reviewed and merged/closed
- [ ] PR #2 reviewed and merged/closed (or deferred with reason)
- [ ] Windows PowerShell workflow tested
- [ ] Windows CMD/batch workflow tested
- [ ] CI/CD workflows all green
- [ ] No security vulnerabilities
- [ ] Documentation current
- [ ] Version bump and release created

---

## Phases

### Phase 0: Deep Analysis (NEW)
**Goal:** Understand root causes before fixing
**Estimated:** 0.5 days

| Task | Description | Model |
|------|-------------|-------|
| p0-1 | Categorize all test failures by type | Opus |
| p0-2 | Identify if failures are related (systemic vs isolated) | Opus |
| p0-3 | Check for architectural issues | Opus |
| p0-4 | Create fix complexity estimates | Opus |
| p0-5 | Create prioritized fix order | Opus |

**Output:** Fix strategy document before any code changes

### Phase 1: Fix Failing Tests (HIGH PRIORITY)
**Goal:** Get all 10 test suites passing
**Estimated:** 2 days (1-2 base + 0.5-1 buffer)

| Task | Description | Model | Depends On |
|------|-------------|-------|------------|
| p1-1 | Fix Security Tests (highest priority) | Sonnet | p0-5 |
| p1-2 | Fix Security Fixes Tests | Sonnet | p1-1 |
| p1-3 | Fix Ralph Tests | Sonnet | p0-5 |
| p1-4 | Fix Integration Tests | Sonnet | p1-3 |
| p1-5 | Fix Validation Library Tests | Sonnet | p0-5 |
| p1-6 | Fix Monitor Tests | Sonnet | p0-5 |
| p1-7 | Fix Constants Library Tests | Haiku | p0-5 |
| p1-8 | Run full test suite, verify all pass | Sonnet | p1-1 through p1-7 |

**Quality Gate:** ALL tests must pass before proceeding

### Phase 2: Fix & Merge Open PRs
**Goal:** Review, fix any issues ourselves, merge, and communicate with contributors
**Estimated:** 1 day

**Approach:**
- Review each PR thoroughly
- Fix any issues ourselves (don't just request changes)
- Test with full suite
- Merge when working
- Reply to PR authors with status updates

| Task | Description | Model |
|------|-------------|-------|
| p2-1 | Review PR #3 code (email notifications from avwohl) | Sonnet |
| p2-2 | Test PR #3 locally | Sonnet |
| p2-3 | Fix any issues in PR #3 | Sonnet |
| p2-4 | Comment on PR #3 - update avwohl on status | Sonnet |
| p2-5 | Merge PR #3 | Haiku |
| p2-6 | Review PR #2 code (Docker sandbox from dmelo) | Sonnet |
| p2-7 | Test PR #2 locally | Sonnet |
| p2-8 | Fix any issues in PR #2 | Sonnet |
| p2-9 | Comment on PR #2 - update dmelo on status | Sonnet |
| p2-10 | Merge PR #2 | Haiku |

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
| Tests have deep/systemic bugs | High | Medium | Phase 0 analysis first |
| Windows testing limited | Medium | Medium | Use VM if needed |
| PR conflicts | Low | Low | Rebase before merge |
| Breaking changes from fixes | High | Low | Run full suite after each fix |
| Dependency issues | Medium | Low | Check package versions |
| Rollback needed | High | Low | Tag pre-release state |

**Rollback Plan:** If release has critical issues, revert to previous tag immediately

---

## Timeline

| Phase | Base | Buffer | Total |
|-------|------|--------|-------|
| Phase 0: Analysis | 0.5 days | 0 | 0.5 days |
| Phase 1: Fix Tests | 1.5 days | 0.5 days | 2 days |
| Phase 2: Fix & Merge PRs | 0.75 days | 0.25 days | 1 day |
| Phase 3: Windows | 0.5 days | 0 | 0.5 days |
| Phase 4: Hardening | 0.5 days | 0 | 0.5 days |
| Phase 5: Release | 0.25 days | 0.25 days | 0.5 days |
| **Total** | **4 days** | **1 day** | **5 days** |

---

## Review History

- v1: 2026-02-14 - Initial audit and plan creation
- v2: 2026-02-14 - Incorporated reviewer feedback:
  - Added Phase 0 (deep analysis)
  - Added requirements section
  - Added timeline buffers
  - Enhanced risk management
  - Added PR review criteria
  - Added quality gates
  - Added rollback plan
- v3: 2026-02-14 - Per Aaron's direction:
  - Renamed Phase 5 to "Merge, Push & Deploy"
  - Added explicit merge step for all branches
  - Added final test suite run before release
  - Added deployment trigger and verification steps
- v4: 2026-02-14 - Per Aaron's direction:
  - Renamed Phase 2 to "Fix & Merge Open PRs"
  - Fix issues in PRs ourselves (don't just request changes)
  - Add tasks to comment/reply to PR authors (avwohl, dmelo)
  - Updated timeline: Phase 2 now 1 day, total ~5 days
