# Phase 3: Windows Verification

**Project:** PortableRalph Production Readiness
**Parent:** MASTER-PLAN.md
**Created:** 2026-02-20
**Author:** Coordinator
**Version:** 1
**Status:** draft

## Phase Goals
Verify PortableRalph works correctly on Windows environments, including:
- PowerShell scripts (install.ps1, ralph.ps1)
- Batch launcher (launcher.bat)
- Windows-specific path handling
- Notification system on Windows

## ⚠️ BLOCKER: Windows Environment Required

**Problem:** We are running on a Linux server (dev3). Phase 3 requires testing on actual Windows to verify:
- PowerShell execution
- Windows path separators (\ vs /)
- UAC/permission handling
- Windows notification system

**Options to consider:**
1. **Windows VM** — Set up Windows VM on the server (resource intensive)
2. **Remote Windows machine** — Use a Windows node if available
3. **GitHub Actions Windows runner** — Use CI/CD for Windows testing
4. **Manual testing by Aaron** — Have Aaron test on his Windows machine
5. **Skip/defer** — If Windows support is not critical for initial release

**Recommendation:** Escalate to Person Manager for decision on testing approach.

## Prerequisites
- [ ] Decision on Windows testing approach
- [ ] Access to Windows environment (VM, remote, or CI)

## Task Categories

### Windows Script Testing
| Task ID | Description | Model | Notes |
|---------|-------------|-------|-------|
| p3-1 | Test install.ps1 on Windows | Sonnet | Requires Windows |
| p3-2 | Test ralph.ps1 end-to-end | Sonnet | Requires Windows |
| p3-3 | Test launcher.bat on CMD | Sonnet | Requires Windows |
| p3-4 | Test notifications on Windows | Sonnet | Requires Windows |

### Fixes and Documentation
| Task ID | Description | Model | Notes |
|---------|-------------|-------|-------|
| p3-5 | Fix Windows-specific issues | Sonnet | If issues found |
| p3-6 | Update Windows docs | Haiku | After testing |

## Deliverables
- [ ] Windows install script verified working
- [ ] Windows ralph.ps1 verified working
- [ ] Batch launcher verified working
- [ ] Windows notifications verified working
- [ ] Any issues fixed
- [ ] Documentation updated

## Estimated Duration
0.5 days (assuming Windows environment is available)

## Review History
- v1: 2026-02-20 - Initial creation, blocker identified