# User Story: [US-BA-01] Playwright Installation Verification

**Epic:** EPIC-01 (Playwright Setup & Validation)  
**Project:** Browser Automation Infrastructure  
**Status:** approved  
**Story Architect:** story-architect  
**Created:** 2026-02-28 04:00 EST  
**Version:** 1  
**Test Server:** N/A (local environment)

---

## Story

**As a** validation agent (Sophie or sub-agents)  
**I want** Playwright properly installed and configured on dev3  
**So that** I can use reliable browser automation without dependency issues blocking my work

---

## Acceptance Criteria

### AC-1: Playwright CLI Available

**Given** a fresh terminal session on dev3 machine  
**When** I execute `npx playwright --version`  
**Then** it returns a version number (e.g., `1.x.x`) without errors

**Validation:**
- Method: Shell command execution
- Test Command: `npx playwright --version`
- Expected Output: Version number (no npm ERR! or command not found)
- Screenshot: Required ✅ (terminal output)

---

### AC-2: Chromium Browser Binary Installed

**Given** Playwright CLI is available  
**When** I execute `npx playwright install chromium --dry-run` OR check browser location  
**Then** Chromium browser is present and executable

**Validation:**
- Method: Shell command execution + file existence check
- Test Commands:
  ```bash
  npx playwright install chromium --dry-run
  # OR check browser location
  ls ~/.cache/ms-playwright/*/chrome* 2>/dev/null || ls ~/.cache/ms-playwright/chromium*/
  ```
- Expected Output: Chromium browser path exists
- Screenshot: Required ✅ (output showing browser present)

---

### AC-3: System Dependencies Satisfied

**Given** Playwright Chromium is installed  
**When** I execute `npx playwright install-deps chromium`  
**Then** all required system libraries are present (no missing lib errors)

**Validation:**
- Method: Shell command execution
- Test Command: `npx playwright install-deps chromium 2>&1`
- Expected Output: "All dependencies are satisfied" or successful install
- Screenshot: Required ✅ (dependency check output)

---

### AC-4: Headless Launch Test

**Given** all dependencies are satisfied  
**When** I execute a minimal Playwright script to launch browser  
**Then** browser launches and closes without errors

**Validation:**
- Method: Node.js script execution
- Test Command:
  ```bash
  node -e "const {chromium} = require('playwright'); (async () => { const b = await chromium.launch(); console.log('Browser launched OK'); await b.close(); console.log('Browser closed OK'); })();"
  ```
- Expected Output: "Browser launched OK" and "Browser closed OK"
- Screenshot: Required ✅ (successful launch/close output)

---

### AC-5: Installation From Scratch Recovery

**Given** Playwright is NOT installed (simulated fresh state)  
**When** I run the installation commands  
**Then** full installation completes within 5 minutes

**Validation:**
- Method: Timed installation test
- Test Commands:
  ```bash
  time npm install -g playwright
  time npx playwright install chromium
  time npx playwright install-deps chromium
  ```
- Expected Output: All commands succeed, total time < 5 minutes
- Screenshot: Required ✅ (installation timing output)

---

## Contingencies

### What Could Go Wrong

| Risk | Likelihood | Impact | Detection | Mitigation |
|------|------------|--------|-----------|------------|
| npm/npx not in PATH | L | H | "command not found" | Source ~/.nvm/nvm.sh, verify Node installation |
| Playwright package not installed | M | M | "Cannot find module" | npm install -g playwright |
| Chromium binary missing | M | M | "Executable doesn't exist" | npx playwright install chromium |
| System libs missing (libatk, etc.) | H | M | "error while loading shared libraries" | sudo npx playwright install-deps chromium |
| Disk space insufficient | L | H | "No space left on device" | Check disk, clean up |
| Network issues during download | M | L | Timeout/connection error | Retry, check connectivity |
| Permission denied on cache dir | L | M | "EACCES permission denied" | Fix permissions on ~/.cache/ms-playwright |

### Fallback Options

- **If npm install fails:** Try with `--force` or clear npm cache
- **If browser download fails:** Manual download from Playwright releases or use system Chromium
- **If deps install needs sudo:** Document as setup requirement

### Blockers (Would Prevent Story Completion)

| Blocker | Likelihood | Mitigation |
|---------|------------|------------|
| Node.js not installed | VL | Already verified v22.22.0 present |
| No internet connectivity | VL | dev3 has internet access |
| Root access required and unavailable | L | Most deps can install without root |

### Early Warning Signs

- npm commands taking >2 minutes (network issues)
- Multiple "deprecated" warnings (outdated packages)
- "Cannot find module" after install (PATH issues)
- "ENOMEM" errors (memory pressure)

---

## Dependencies

### Dependency Graph

```
[Node.js v22.22.0] ────► [THIS STORY: US-BA-01] ────► [US-BA-02: Basic Screenshot]
                                   │
                                   └──► [US-BA-03: MELO Screenshot]
                                   │
                                   └──► [US-BA-04: Reliability]
```

### Upstream (Must Complete First)

| Dependency | Type | Status | Blocker? | Notes |
|------------|------|--------|----------|-------|
| Node.js installation | technical | ✅ done | no | v22.22.0 confirmed in runtime |
| Internet connectivity | infrastructure | ✅ done | no | Required for package download |

### Downstream (Waiting on This)

| Dependent | Type | Impact if Delayed |
|-----------|------|-------------------|
| US-BA-02 (Basic Screenshot) | story | Cannot proceed |
| US-BA-03 (MELO Screenshot) | story | Cannot proceed |
| US-BA-04 (Reliability) | story | Cannot proceed |
| ALL MELO validation work | feature | Blocked |

### External Dependencies

| External | Description | Status | Fallback |
|----------|-------------|--------|----------|
| npmjs.com | Playwright package download | available | npm cache if available |
| Playwright CDN | Browser binary download | available | Manual download |
| Ubuntu package repos | System dependencies | available | Already installed |

### Technical Prerequisites

- [x] Node.js v22.22.0+
- [x] npm/npx available
- [x] Internet connectivity
- [ ] Playwright package (to be installed)
- [ ] Chromium browser binary (to be installed)
- [ ] System libraries (to be verified)

---

## Out of Scope

Explicitly NOT included in this story (to prevent scope creep):

- Firefox or WebKit browser installation (Chromium only for now)
- Playwright Test runner setup (just core Playwright)
- Screenshot capture functionality (that's US-BA-02)
- Integration with MELO (that's US-BA-03)
- Configuration files or project setup
- Performance optimization

---

## Technical Notes

### Suggested Approach

1. **Check existing state:** Run version commands first to see what's already there
2. **Install if needed:** Only install what's missing
3. **Verify installation:** Run headless browser launch test
4. **Document results:** Save all outputs as evidence

### Key Commands Reference

```bash
# Check version
npx playwright --version

# Install Playwright globally
npm install -g playwright

# Install Chromium browser
npx playwright install chromium

# Install system dependencies
npx playwright install-deps chromium

# Browser location (typical)
~/.cache/ms-playwright/chromium-*/chrome-linux/chrome
```

### Known Environment Facts (dev3)

- **OS:** Linux 6.8.0-90-generic (x64)
- **Node:** v22.22.0
- **Display:** Xvfb running on :99 (may not be needed for headless)
- **User:** ubuntu

### Anti-Patterns to Avoid

- Don't install browsers globally on system (use Playwright's managed versions)
- Don't skip dependency check (libatk etc. cause silent failures)
- Don't run as root unless necessary for deps

---

## Test Credentials

**Location:** N/A (no credentials needed for installation)

---

## Sub-Tasks (Coordinator Fills This)

| Task ID | Description | Model | Status |
|---------|-------------|-------|--------|
| | | | |

---

## Definition of Done

- [ ] AC-1: Playwright CLI returns version
- [ ] AC-2: Chromium browser binary present
- [ ] AC-3: System dependencies satisfied
- [ ] AC-4: Browser launches and closes successfully
- [ ] AC-5: Installation process documented (for recovery)
- [ ] All outputs saved as evidence files
- [ ] Screenshots captured for EACH acceptance criterion
- [ ] Commands documented in validation log
- [ ] L1 (Self) validation complete
- [ ] L2 (Manager) validation complete

---

## Validation History

| Level | Validator | Date | Result | Report |
|-------|-----------|------|--------|--------|
| L1 Self | | | | |
| L2 Manager | | | | |
| L3 Peer | | | | |

---

## Review Checklist (Story Architect / Reviewer)

### Completeness
- [x] Happy path covered (installation succeeds)
- [x] Alternate valid paths covered (already installed case)
- [x] All error scenarios covered (missing deps, network, permissions)
- [x] All edge cases covered (recovery from scratch)
- [x] Empty states covered (not applicable)
- [x] Boundary conditions covered (disk space, timeout)
- [x] Permission/auth cases covered (sudo for deps)

### Testability
- [x] Every AC has Given/When/Then
- [x] Every AC has validation method
- [x] ACs are specific and measurable
- [x] No ambiguous language

### Dependencies
- [x] Upstream dependencies identified
- [x] Downstream dependents identified
- [x] External dependencies mapped
- [x] Technical prerequisites listed
- [x] No circular dependencies

### Contingencies
- [x] Risks identified with mitigations
- [x] Fallback options documented
- [x] Blockers identified with workarounds
- [x] Early warning signs listed

### Clarity
- [x] Sonnet could implement without clarifying questions
- [x] No ambiguous terms
- [x] Scope boundaries explicit (out of scope)
- [x] Technical notes sufficient

---

## Review History

| Version | Reviewer | Date | Outcome | Key Feedback |
|---------|----------|------|---------|--------------|
| v1 | story-architect | 2026-02-28 | approved | Initial comprehensive story |

---

## VSDD Compliance (Mandatory)

### Verification Properties

| Property ID | Property | Testable | Coverage |
|-------------|----------|----------|----------|
| VP-BA01-1 | Playwright CLI returns version without errors | Shell command | AC-1 |
| VP-BA01-2 | Chromium binary exists at expected path | File existence | AC-2 |
| VP-BA01-3 | All system dependencies satisfied | Deps check output | AC-3 |
| VP-BA01-4 | Browser launches and closes without errors | Node script | AC-4 |
| VP-BA01-5 | Full install completes within 5 minutes | Timed execution | AC-5 |

### Purity Boundary Map

**Pure Core (Deterministic, no side effects):**
- `parseVersion()` — Extract version from CLI output
- `validateBrowserPath()` — Check path format
- `parseDepOutput()` — Parse dependency check output

**Effectful Shell (Side effects allowed):**
- Shell command execution (npx, npm)
- File system checks
- Browser process launch/close
- Package downloads

**Adapters (Thin wrappers):**
- N/A — Infrastructure story, no adapters needed

### Red Gate Tests (Must fail before implementation)

| Test | Test Description | Expected Failure |
|------|------------------|------------------|
| `npx playwright --version` | CLI available | Command not found OR no version |
| `ls ~/.cache/ms-playwright/chromium*` | Chromium exists | No such file or directory |
| `npx playwright install-deps chromium` | Deps satisfied | Missing dependency error |
| `node -e "chromium.launch()"` | Browser launches | Cannot find module OR launch error |

### Contract Chain

```
Spec: US-BA-01 (Playwright Installation)
  ↓
Properties: VP-BA01-1 through VP-BA01-5
  ↓
Beads: bd-ba-install (to create if needed)
  ↓
Tests: Shell command validation (see AC-1 through AC-5)
  ↓
Code: Installation scripts, verification scripts
```

---
*Story Architect: Opus | Created for EPIC-01 Playwright Setup | VSDD Updated 2026-03-01*
