# EPIC-01: Playwright Setup & Validation

**Epic ID:** EPIC-01  
**Project:** Browser Automation Infrastructure  
**Priority:** P0-CRITICAL  
**Status:** In Progress  
**Created:** 2026-02-28 03:30 EST

---

## Overview

Establish Playwright as the primary, reliable browser automation method. Playwright is a modern browser automation framework that runs headlessly without requiring Xvfb or Chrome extensions.

## Goals

1. Verify Playwright installation and dependencies
2. Test basic screenshot capture
3. Test MELO localhost capture
4. Validate reliability with repeated runs
5. Establish standard patterns for use

---

## User Stories

### US-BA-01: Playwright Installation Verification ✅ COMPLETE

**As a** validation agent  
**I want** Playwright properly installed and configured  
**So that** I can use it for screenshot capture without dependency issues

**Status:** ✅ COMPLETE (2026-02-28 03:49 EST)  
**Evidence:** `scheduler/projects/browser-automation/evidence/US-BA-01.md`

#### Acceptance Criteria

##### AC-1: Playwright Installed
**Given** a fresh session on the dev3 machine  
**When** I run `npx playwright --version`  
**Then** it returns a version number without errors  
**Test Method:** Shell command execution  
**Evidence Required:** Command output log

##### AC-2: Browser Binaries Present
**Given** Playwright is installed  
**When** I run `npx playwright install --dry-run`  
**Then** it shows chromium/firefox/webkit are available or installable  
**Test Method:** Shell command execution  
**Evidence Required:** Command output log

##### AC-3: Dependencies Satisfied
**Given** Playwright browsers are installed  
**When** I run `npx playwright install-deps`  
**Then** all system dependencies are present or get installed  
**Test Method:** Shell command execution  
**Evidence Required:** Command output log

#### Contingencies
- **What if Playwright not installed?** Run `npm install -g playwright` or `npx playwright install`
- **What if browser binaries missing?** Run `npx playwright install chromium`
- **What if system deps missing?** Run `npx playwright install-deps --with-deps`

#### Dependencies
- None (first task)

---

### US-BA-02: Basic Screenshot Capture

**As a** validation agent  
**I want** to capture a screenshot of any public URL  
**So that** I can verify Playwright works for basic use cases

#### Acceptance Criteria

##### AC-1: Capture Public Website
**Given** Playwright is working  
**When** I run `npx playwright screenshot https://example.com /tmp/test-screenshot.png`  
**Then** a PNG file is created at the specified path  
**Test Method:** Command execution + file existence check  
**Evidence Required:** Screenshot file, command output

##### AC-2: Screenshot Has Content
**Given** a screenshot was captured  
**When** I examine the screenshot file  
**Then** it shows the actual webpage content (not blank/error)  
**Test Method:** Image analysis or file size check (>10KB)  
**Evidence Required:** Screenshot file or size verification

##### AC-3: Multiple Viewports Work
**Given** Playwright screenshot works  
**When** I capture with `--viewport-size=375,667` (mobile)  
**Then** the screenshot has mobile dimensions  
**Test Method:** Image dimension check  
**Evidence Required:** Screenshot with mobile size

#### Contingencies
- **What if command not found?** May need different syntax - check `npx playwright --help`
- **What if screenshot blank?** Try with `--wait-until=networkidle`
- **What if site blocks headless?** Use `--browser-channel=chrome` for real Chrome

#### Dependencies
- US-BA-01 (Playwright installed)

---

### US-BA-03: Local Development Server Screenshot

**As a** MELO validation agent  
**I want** to capture screenshots of localhost:3000  
**So that** I can validate MELO UI components

#### Acceptance Criteria

##### AC-1: Localhost Screenshot Works
**Given** MELO dev server is running on localhost:3000  
**When** I run Playwright screenshot against localhost:3000  
**Then** a screenshot is captured showing the MELO homepage  
**Test Method:** Command execution + screenshot verification  
**Evidence Required:** Screenshot of MELO homepage

##### AC-2: Multiple Routes Work
**Given** localhost screenshot works  
**When** I screenshot localhost:3000/sign-up  
**Then** the registration page is captured  
**Test Method:** Screenshot capture  
**Evidence Required:** Screenshot of sign-up page

##### AC-3: Works Without Running Dev Server
**Given** the dev server is NOT running  
**When** I attempt a screenshot  
**Then** I get a clear error message (not hang or crash)  
**Test Method:** Command execution without server  
**Evidence Required:** Error message output

#### Contingencies
- **What if SSL issues?** Use `--ignore-https-errors`
- **What if timeout?** MELO server may be slow to start - increase timeout
- **What if wrong content?** Verify correct port and route

#### Dependencies
- US-BA-02 (Basic screenshot works)
- MELO dev server available

---

### US-BA-04: Reliability Validation

**As a** validation system  
**I want** Playwright to work consistently every time  
**So that** validation never fails due to browser issues

#### Acceptance Criteria

##### AC-1: 10 Consecutive Successes
**Given** basic screenshot capture works  
**When** I run the same screenshot command 10 times in a row  
**Then** all 10 succeed without errors  
**Test Method:** Bash loop with success counting  
**Evidence Required:** Test output log showing 10/10 success

##### AC-2: Works After Pause
**Given** 10 consecutive tests passed  
**When** I wait 5 minutes and run again  
**Then** it still works without re-initialization  
**Test Method:** Delayed execution  
**Evidence Required:** Successful screenshot after pause

##### AC-3: Works From Different Directories
**Given** Playwright works from ~/clawd  
**When** I run from ~/repos/melo  
**Then** it works identically  
**Test Method:** Change directory and run  
**Evidence Required:** Success from both directories

#### Contingencies
- **What if random failures?** Investigate logs, may need resource limits
- **What if degradation over time?** Check for memory leaks, process cleanup

#### Dependencies
- US-BA-03 (Screenshots working)

---

## Testing Requirements

| Story | Testing Framework | Test Strategy |
|-------|------------------|---------------|
| US-BA-01 | Shell scripts | Dependency verification |
| US-BA-02 | Shell + file checks | Output validation |
| US-BA-03 | Manual + shell | Integration with MELO |
| US-BA-04 | Bash loop | Reliability testing |

## Definition of Done

- [ ] All acceptance criteria pass
- [ ] Reliability test: 10/10 success rate
- [ ] Screenshots saved as evidence
- [ ] Patterns documented for reuse

---

## Change Log

| Date | Change | By |
|------|--------|-----|
| 2026-02-28 03:30 EST | Epic created with 4 user stories | Person Manager |
