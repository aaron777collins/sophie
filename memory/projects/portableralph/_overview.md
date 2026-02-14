# PortableRalph Project Overview

**Repository:** https://github.com/aaron777collins/portableralph  
**Local Path:** `~/repos/portableralph-audit`  
**Type:** Shell/PowerShell CLI tools for AI-assisted development workflows

---

## Project Description

PortableRalph is a cross-platform toolkit for:
- Running AI-assisted coding workflows
- Progress monitoring for iterative development
- Multi-platform notifications (Slack, Discord, Telegram)
- Automated build/plan orchestration

---

## Current State (as of 2026-02-14)

### Test Suite Status
- **Total:** 10 test suites
- **Passing:** 3 (Windows Compat, Setup, Notify)
- **Failing:** 7

### Phase 0 Audit Started
Testing and security audit in progress.

---

## Test Failure Summary

| Category | Count | Description |
|----------|-------|-------------|
| MISSING_DEP | 1 | `monitor-progress.sh` doesn't exist |
| EXIT_CODE | 3 | Scripts return wrong exit codes |
| IMPL_GAP | 2 | Security features not implemented |
| ASSERT_LOGIC | 2 | Test expectations don't match implementation |

### Priority Security Issues
1. **SSRF vulnerability** - `validate_url()` accepts localhost
2. **URL-as-path** - File path validation accepts http:// URLs

Full analysis: `~/repos/portableralph-audit/test-failure-analysis.md`

---

## Key Files

| File | Purpose |
|------|---------|
| `ralph.sh` | Main CLI script |
| `notify.sh` | Notification dispatcher |
| `setup-notifications.sh` | Configuration wizard |
| `lib/validation.sh` | Input validation library |
| `lib/constants.sh` | Shared constants |
| `tests/run-all-tests.sh` | Test runner |

---

## Timeline

- [2026-02-14] Phase 0 audit started
- [2026-02-14] Test failure analysis completed (p0-1-categorize-failures)

---

## Next Steps

1. Fix Priority 1 security issues (SSRF, URL validation)
2. Create missing `monitor-progress.sh`
3. Standardize exit codes
4. Align test expectations
