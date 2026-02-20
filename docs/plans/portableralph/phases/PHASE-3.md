# Phase 3: Windows Verification

**Project:** PortableRalph Production Readiness
**Parent:** MASTER-PLAN.md
**Created:** 2026-02-20
**Author:** Coordinator
**Version:** 2
**Status:** approved

## Phase Goals
Verify PortableRalph works correctly on Windows environments using GitHub Actions Windows CI runner for automated and repeatable testing.

## ✅ SOLUTION: GitHub Actions Windows Runner

**Decision:** Use GitHub Actions Windows runner for automated Windows testing
**Rationale:**
- Automated & repeatable - catches regressions going forward
- No server resource burden - doesn't require Windows VM on dev3
- Standard practice for cross-platform projects
- Repository is on GitHub so CI integrates naturally
- Independent of Aaron's availability for manual testing

**Implementation Plan:**
1. Create .github/workflows/windows-test.yml workflow
2. Configure runs-on: windows-latest runner
3. Test install.ps1, ralph.ps1, launcher.bat execution
4. Add notification testing if possible in CI
5. Monitor results and fix issues found

## Prerequisites
- [x] Decision on Windows testing approach (APPROVED: GitHub Actions)
- [x] Repository access for workflow creation

## Task Categories

### Windows CI Implementation
| Task ID | Description | Model | Dependencies |
|---------|-------------|-------|--------------|
| p3-1 | Create GitHub Actions Windows workflow | Sonnet | - |
| p3-2 | Run workflow and analyze results | Sonnet | p3-1 |
| p3-3 | Fix Windows-specific issues found | Sonnet | p3-2 |
| p3-4 | Verify all scripts work on Windows CI | Sonnet | p3-3 |
| p3-5 | Update Windows documentation | Haiku | p3-4 |

## Task Details

### p3-1: Create GitHub Actions Windows workflow
- Create `.github/workflows/windows-test.yml`
- Test install.ps1 PowerShell script execution
- Test ralph.ps1 functionality
- Test launcher.bat batch file
- Add notification testing if possible in CI environment

### p3-2: Run workflow and analyze results
- Execute the workflow
- Monitor Windows CI runner behavior
- Document any failures or issues
- Identify root causes of Windows-specific problems

### p3-3: Fix Windows-specific issues found
- Address path separator issues (\ vs /)
- Fix PowerShell execution problems
- Resolve batch file compatibility issues
- Fix notification system if needed

### p3-4: Verify all scripts work on Windows CI
- Re-run workflow after fixes
- Verify 100% success rate
- Test edge cases and error handling
- Ensure consistent behavior

### p3-5: Update Windows documentation
- Document Windows-specific installation steps
- Update CI workflow documentation
- Note any Windows limitations or requirements

## Deliverables
- [ ] GitHub Actions Windows workflow created
- [ ] Windows compatibility verified via CI
- [ ] All Windows-specific issues fixed
- [ ] Documentation updated with Windows guidance
- [ ] CI pipeline passing consistently

## Dependency Graph
```
p3-1 ──► p3-2 ──► p3-3 ──► p3-4 ──► p3-5
```

## Estimated Duration
1 day (automated CI testing approach)

## Review History
- v1: 2026-02-20 - Initial creation, blocker identified
- v2: 2026-02-20 12:02 EST - Updated with Person Manager decision (GitHub Actions approach)