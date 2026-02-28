# EPIC-02: Alternative Methods Testing

**Epic ID:** EPIC-02  
**Project:** Browser Automation Infrastructure  
**Priority:** P1-HIGH  
**Status:** Not Started  
**Created:** 2026-02-28 03:35 EST

---

## Overview

Test and document fallback browser automation methods. Even with Playwright as primary, we need alternatives documented so we can switch if needed.

## Goals

1. Test Clawdbot `profile=clawd` method
2. Attempt to fix or document Chrome extension relay limitations
3. Document what works and what doesn't
4. Establish clear guidance on when to use each method

---

## User Stories

### US-BA-05: Clawdbot Profile=Clawd Testing

**As a** automation agent  
**I want** to test the `profile=clawd` browser method  
**So that** I have a quick fallback for simple browser tasks

#### Acceptance Criteria

##### AC-1: Profile Starts Successfully
**Given** I want to use the clawd browser profile  
**When** I run `browser action=status profile=clawd`  
**Then** I get a status response (not error)  
**Test Method:** Browser tool command  
**Evidence Required:** Command output

##### AC-2: Can Navigate to URL
**Given** the clawd profile is available  
**When** I run `browser action=open profile=clawd targetUrl="https://example.com"`  
**Then** the page loads successfully  
**Test Method:** Browser tool command  
**Evidence Required:** Snapshot or status confirmation

##### AC-3: Can Take Screenshot
**Given** a page is loaded in clawd profile  
**When** I run `browser action=screenshot profile=clawd`  
**Then** I receive a screenshot image  
**Test Method:** Browser tool command  
**Evidence Required:** Screenshot returned

##### AC-4: Can Get Page Snapshot
**Given** a page is loaded  
**When** I run `browser action=snapshot profile=clawd`  
**Then** I get page structure/content for automation  
**Test Method:** Browser tool command  
**Evidence Required:** Snapshot output

#### Contingencies
- **What if profile doesn't exist?** May need browser start first
- **What if timeouts?** Try with longer timeoutMs
- **What if blank pages?** Check for JavaScript rendering issues

#### Dependencies
- None (independent of Playwright)

---

### US-BA-06: Chrome Extension Relay Diagnosis

**As a** system maintainer  
**I want** to understand why Chrome extension relay fails  
**So that** I can either fix it or document why it's deprecated

#### Acceptance Criteria

##### AC-1: Document Current State
**Given** Chrome relay has been failing  
**When** I run diagnostic commands  
**Then** I document the exact failure mode  
**Test Method:** Shell commands + browser tool  
**Evidence Required:** Diagnostic log

##### AC-2: Test Repair Attempts
**Given** failure modes are documented  
**When** I attempt repairs (restart, click extension, etc.)  
**Then** I document whether each attempt works  
**Test Method:** Manual testing with logging  
**Evidence Required:** Test results log

##### AC-3: Make Deprecation Decision
**Given** repair attempts documented  
**When** reliability is still <80%  
**Then** document as deprecated with alternatives  
**Test Method:** Decision documentation  
**Evidence Required:** Updated TOOLS.md

#### Contingencies
- **What if it magically starts working?** Great! Document what fixed it
- **What if completely unfixable?** Mark deprecated, remove from primary docs

#### Dependencies
- None

---

### US-BA-07: Method Comparison Matrix

**As a** decision maker  
**I want** a clear comparison of all browser methods  
**So that** I know which to use in each situation

#### Acceptance Criteria

##### AC-1: Reliability Scores
**Given** all methods tested  
**When** I create a comparison matrix  
**Then** each method has a reliability score (0-100%)  
**Test Method:** Aggregation of test results  
**Evidence Required:** Comparison table

##### AC-2: Use Case Mapping
**Given** reliability scores documented  
**When** I map use cases to methods  
**Then** each use case has a recommended method  
**Test Method:** Documentation creation  
**Evidence Required:** Use case table

##### AC-3: Failure Mode Documentation
**Given** testing complete  
**When** I document failure modes  
**Then** each method's weaknesses are clear  
**Test Method:** Documentation  
**Evidence Required:** Failure mode list

#### Dependencies
- US-BA-04 (Playwright tested)
- US-BA-05 (Clawd profile tested)
- US-BA-06 (Chrome relay diagnosed)

---

## Testing Requirements

| Story | Testing Framework | Test Strategy |
|-------|------------------|---------------|
| US-BA-05 | Browser tool commands | Functional testing |
| US-BA-06 | Shell + browser tools | Diagnostic testing |
| US-BA-07 | Documentation | Aggregation |

## Definition of Done

- [ ] All methods tested with documented results
- [ ] Reliability scores calculated
- [ ] Comparison matrix created
- [ ] Clear recommendations documented

---

## Change Log

| Date | Change | By |
|------|--------|-----|
| 2026-02-28 03:35 EST | Epic created with 3 user stories | Person Manager |
