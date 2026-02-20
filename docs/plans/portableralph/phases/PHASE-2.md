# Phase 2: Fix & Merge Open PRs

**Project:** PortableRalph Production Readiness
**Parent:** MASTER-PLAN.md (v5)
**Created:** 2026-02-20 08:04 EST
**Author:** Coordinator
**Version:** 1
**Status:** approved (by PM directive)

## Phase Goals

Review and merge the 2 open PRs in the PortableRalph repository:
- **PR #3:** Email notifications fix from avwohl 
- **PR #2:** Docker sandbox from dmelo

**Key Strategy:** Review → Test → Fix issues ourselves → Merge → Update contributors (don't just request changes)

## Prerequisites

- [x] Phase 0 complete (analysis confirmed tests already pass)
- [x] Phase 1 skipped (no failing tests to fix)
- [x] Repository access confirmed

## Task Categories

### PR #3: Email Notifications Fix (Priority 1 - Simpler)

| Task ID | Description | Model | Depends On |
|---------|-------------|-------|------------|
| p2-1 | Review PR #3 code (email notifications from avwohl) | Sonnet | - |
| p2-2 | Test PR #3 locally | Sonnet | p2-1 |
| p2-3 | Fix any issues in PR #3 | Sonnet | p2-2 |
| p2-4 | Comment on PR #3 - update avwohl on status | Sonnet | p2-3 |
| p2-5 | Merge PR #3 | Haiku | p2-4 |

### PR #2: Docker Sandbox (Priority 2 - Complex)

| Task ID | Description | Model | Depends On |
|---------|-------------|-------|------------|
| p2-6 | Review PR #2 code (Docker sandbox from dmelo) | Sonnet | p2-5 |
| p2-7 | Test PR #2 locally | Sonnet | p2-6 |
| p2-8 | Fix any issues in PR #2 | Sonnet | p2-7 |
| p2-9 | Comment on PR #2 - update dmelo on status | Sonnet | p2-8 |
| p2-10 | Merge PR #2 | Haiku | p2-9 |

## Dependency Graph

```
p2-1 ──► p2-2 ──► p2-3 ──► p2-4 ──► p2-5
                                    │
                                    ├──► p2-6 ──► p2-7 ──► p2-8 ──► p2-9 ──► p2-10
```

**Sequential Processing:** Complete PR #3 fully before starting PR #2

## Deliverables

### For PR #3 (Email Notifications)
- [ ] Code review completed and documented
- [ ] Local testing passed (all 10 test suites still pass)
- [ ] Any issues fixed in our branch
- [ ] PR merged to main
- [ ] avwohl updated via PR comment

### For PR #2 (Docker Sandbox) 
- [ ] Code review completed and documented
- [ ] Local testing passed (all 10 test suites still pass)
- [ ] Any issues fixed in our branch
- [ ] PR merged to main (or closed with reason if unfixable)
- [ ] dmelo updated via PR comment

## Success Criteria

- [ ] Both PRs addressed (merged or closed with reason)
- [ ] All 10 test suites still passing after each merge
- [ ] Contributors updated on status via PR comments
- [ ] No regressions introduced
- [ ] Documentation updated if needed

## Technical Notes

**Repository:** https://github.com/aaron777collins/portableralph
**Current Status:** All 10 test suites passing (276+ tests)
**Key Constraint:** Must maintain test suite integrity

**Testing Protocol per PR:**
1. Checkout PR branch locally
2. Run full test suite: `npm test` or equivalent
3. Test specific functionality being changed
4. Check for Windows compatibility implications
5. Verify no security issues introduced

**Merge Protocol:**
1. Rebase PR onto latest main if needed
2. Squash commits to clean history
3. Use descriptive merge commit message
4. Delete feature branch after merge

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| PR breaks existing tests | Test locally first, fix before merge |
| PR has conflicts | Rebase and resolve conflicts ourselves |
| PR quality too low | Fix issues ourselves rather than request changes |
| Docker complexity | Defer PR #2 if blocking, comment reason to dmelo |

## Timeline

**Estimated:** 1 day total
- PR #3: 4 hours (simpler email fix)
- PR #2: 4 hours (more complex Docker changes)

**Approach:** Focus on one PR at a time, complete fully before moving to next.

## Review History

- v1: 2026-02-20 08:04 EST - Initial breakdown per PM directive