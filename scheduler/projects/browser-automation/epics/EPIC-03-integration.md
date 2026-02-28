# EPIC-03: Integration & Workflow

**Epic ID:** EPIC-03  
**Project:** Browser Automation Infrastructure  
**Priority:** P1-HIGH  
**Status:** Not Started  
**Created:** 2026-02-28 03:40 EST

---

## Overview

Integrate reliable browser automation into validation workflows. Once we have working methods, we need to integrate them into how we actually do validation work.

## Goals

1. Create reusable screenshot helper scripts
2. Integrate with MELO validation workflow
3. Establish validation patterns
4. Enable Layer 3 (Validator) to use screenshots easily

---

## User Stories

### US-BA-08: Screenshot Helper Script

**As a** validation agent  
**I want** a simple script that handles screenshots reliably  
**So that** I don't have to remember complex Playwright commands

#### Acceptance Criteria

##### AC-1: Simple Interface
**Given** I need to take a screenshot  
**When** I run `./tools/screenshot.sh https://example.com output.png`  
**Then** the screenshot is saved to the specified path  
**Test Method:** Script execution  
**Evidence Required:** Screenshot file

##### AC-2: Device Size Presets
**Given** I need specific device sizes  
**When** I run with `--device desktop|tablet|mobile`  
**Then** the correct viewport is used (1920x1080, 768x1024, 375x667)  
**Test Method:** Dimension verification  
**Evidence Required:** Screenshots at each size

##### AC-3: Full Page Option
**Given** I want the entire page  
**When** I run with `--full-page`  
**Then** the full scrollable page is captured  
**Test Method:** Long page capture  
**Evidence Required:** Full page screenshot

##### AC-4: Wait Options
**Given** page has dynamic content  
**When** I run with `--wait 3000` (ms)  
**Then** it waits before capturing  
**Test Method:** Dynamic page capture  
**Evidence Required:** Screenshot with loaded content

#### Contingencies
- **What if script fails?** Provide clear error messages
- **What if Playwright unavailable?** Fall back to clawd profile

#### Dependencies
- US-BA-02 (Playwright screenshots working)

---

### US-BA-09: MELO Validation Integration

**As a** MELO validator  
**I want** browser automation integrated with MELO validation  
**So that** I can verify UI changes with screenshots

#### Acceptance Criteria

##### AC-1: Screenshot Validation Workflow
**Given** MELO dev server is running  
**When** I validate an acceptance criterion  
**Then** I can capture screenshots as evidence  
**Test Method:** End-to-end validation test  
**Evidence Required:** Validation with screenshots

##### AC-2: All Three Device Sizes
**Given** a validation task  
**When** I capture evidence  
**Then** screenshots exist for desktop, tablet, and mobile  
**Test Method:** Multi-device capture  
**Evidence Required:** Three screenshots

##### AC-3: Screenshot Organization
**Given** screenshots are captured  
**When** they are saved  
**Then** they follow the pattern `scheduler/validation/screenshots/{project}/{story-id}/{device}/`  
**Test Method:** Path verification  
**Evidence Required:** Properly organized files

##### AC-4: Works From Validator Agent
**Given** a Validator agent is spawned  
**When** it needs to verify UI  
**Then** it can use the screenshot workflow independently  
**Test Method:** Validator execution  
**Evidence Required:** Validator success log

#### Contingencies
- **What if MELO server not running?** Error message indicating server needed
- **What if port conflict?** Support custom port parameter

#### Dependencies
- US-BA-08 (Screenshot helper ready)
- US-BA-03 (Localhost screenshots work)

---

### US-BA-10: Validation Evidence Capture

**As a** Layer 3 Validator  
**I want** to easily capture and store validation evidence  
**So that** acceptance criteria can be verified with proof

#### Acceptance Criteria

##### AC-1: Automated Evidence Collection
**Given** I'm validating a story  
**When** I run a validation script  
**Then** screenshots are automatically named and stored  
**Test Method:** Validation run  
**Evidence Required:** Organized screenshot files

##### AC-2: Evidence Naming Convention
**Given** evidence is collected  
**When** saved to disk  
**Then** filename includes: story-id, AC number, device, timestamp  
**Test Method:** Filename check  
**Evidence Required:** Example: `ST-P2-01-A_AC-1_desktop_20260228-0345.png`

##### AC-3: Evidence Log Generation
**Given** validation complete  
**When** I check results  
**Then** a log file lists all evidence with paths  
**Test Method:** Log file check  
**Evidence Required:** Evidence log file

#### Contingencies
- **What if disk full?** Check before capture, warn if <1GB free
- **What if duplicate names?** Add sequence number

#### Dependencies
- US-BA-09 (MELO integration complete)

---

## Testing Requirements

| Story | Testing Framework | Test Strategy |
|-------|------------------|---------------|
| US-BA-08 | Bash/shell testing | Script functionality |
| US-BA-09 | Integration testing | End-to-end validation |
| US-BA-10 | Integration testing | Evidence workflow |

## Definition of Done

- [ ] Helper scripts created and working
- [ ] MELO validation can use screenshots
- [ ] Evidence capture workflow established
- [ ] Validator agents can use independently

---

## Change Log

| Date | Change | By |
|------|--------|-----|
| 2026-02-28 03:40 EST | Epic created with 3 user stories | Person Manager |
