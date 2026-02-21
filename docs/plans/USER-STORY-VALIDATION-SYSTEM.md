# User Story & Validation System Implementation Plan

**Created:** 2026-02-21 11:05 EST
**Author:** Sophie
**Directive From:** Aaron Collins
**Status:** Planning → Implementation

---

## Executive Summary

**Problem:** Tasks lack detailed user stories with acceptance criteria, making validation subjective and unreliable. Workers claim "done" without provable criteria.

**Solution:** Implement a formal Epic → User Story → Acceptance Criteria hierarchy with mandatory Playwright-based validation that requires:
- Deployment to test server
- Actual UI interaction (login, actions)
- Screenshots as proof
- Issue documentation

---

## Part 1: Story Structure Standards

### 1.1 Hierarchy

```
PROJECT
└── EPIC (large feature/initiative)
    └── USER STORY (single user-facing capability)
        └── ACCEPTANCE CRITERIA (testable requirements)
            └── VALIDATION EVIDENCE (proof of completion)
```

### 1.2 Epic Format

```markdown
# Epic: [EPIC-ID] [Title]

**Project:** {project-name}
**Owner:** {person responsible}
**Status:** draft | planning | in-progress | complete

## Description
{2-3 sentence summary of what this epic delivers}

## Business Value
{Why this matters to the user/business}

## User Stories
- [ ] [US-001] {story title}
- [ ] [US-002] {story title}
...

## Dependencies
- {other epics/external dependencies}

## Success Metrics
- {measurable outcome 1}
- {measurable outcome 2}
```

### 1.3 User Story Format (MANDATORY)

```markdown
# User Story: [US-ID] [Title]

**Epic:** {epic-id}
**Status:** pending | in-progress | validating | complete
**Assigned:** {worker/person}
**Model:** {haiku|sonnet|opus}

## Story
**As a** {user type}
**I want** {capability}
**So that** {benefit}

## Acceptance Criteria

### AC-1: {Criterion Title}
**Given** {precondition}
**When** {action}
**Then** {expected result}

**Validation Method:** {how to verify}
**Test Server:** {URL}
**Test Credentials:** {reference to credentials file}

### AC-2: {Criterion Title}
**Given** {precondition}
**When** {action}
**Then** {expected result}

**Validation Method:** {how to verify}

## Technical Notes
{implementation guidance if needed}

## Definition of Done
- [ ] All acceptance criteria pass
- [ ] Playwright tests created and passing
- [ ] Deployed to test server
- [ ] Screenshots captured for each AC
- [ ] No console/server errors
- [ ] Code committed and pushed
```

### 1.4 Acceptance Criteria Requirements

**Every AC MUST have:**
1. **Given/When/Then** format (testable)
2. **Validation Method** (how to verify)
3. **Expected Evidence** (what proof looks like)

**Bad AC (vague):**
> "The login should work"

**Good AC (testable):**
> **Given** I am on the sign-in page
> **When** I enter valid credentials and click "Sign In"
> **Then** I am redirected to the dashboard and see my username in the header

---

## Part 2: Validation Protocol

### 2.1 Validation Levels (All Use Same Protocol)

| Level | Who | When | Same Protocol? |
|-------|-----|------|----------------|
| Self (L1) | Worker + Sonnet sub-agent | After implementation | ✅ YES |
| Manager (L2) | Coordinator/Task Manager | After self-validation | ✅ YES |
| Peer (L3) | Validator | After manager validation | ✅ YES |

**Every level follows the SAME validation protocol. No shortcuts.**

### 2.2 Mandatory Validation Protocol

```
┌─────────────────────────────────────────────────────────────────────────┐
│              VALIDATION PROTOCOL (ALL LEVELS)                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. LOAD USER STORY                                                      │
│     → Read the user story file                                           │
│     → Understand all acceptance criteria                                 │
│                                                                          │
│  2. DEPLOY TO TEST SERVER                                                │
│     → Ensure latest code is deployed                                     │
│     → Verify deployment successful (curl health check)                   │
│                                                                          │
│  3. FOR EACH ACCEPTANCE CRITERION:                                       │
│     a) Set up precondition (Given)                                       │
│     b) Perform action (When) - using Playwright/browser                  │
│     c) Verify result (Then)                                              │
│     d) Take screenshot as evidence                                       │
│     e) Document: PASS/FAIL + notes                                       │
│                                                                          │
│  4. CHECK FOR ISSUES                                                     │
│     → Browser console errors?                                            │
│     → Server logs errors?                                                │
│     → Performance problems?                                              │
│     → Document all issues found                                          │
│                                                                          │
│  5. GENERATE VALIDATION REPORT                                           │
│     → AC results (pass/fail with evidence)                               │
│     → Screenshots (file paths)                                           │
│     → Issues found                                                       │
│     → Overall verdict: PASS/FAIL                                         │
│                                                                          │
│  ALL CRITERIA MUST PASS = VALIDATION PASS                                │
│  ANY CRITERION FAILS = VALIDATION FAIL                                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Validation Report Format

```markdown
# Validation Report: [US-ID]

**Validator:** {name/level}
**Date:** {timestamp}
**Test Server:** {URL}
**Verdict:** ✅ PASS | ❌ FAIL

## Acceptance Criteria Results

### AC-1: {title}
- **Status:** ✅ PASS | ❌ FAIL
- **Screenshot:** `validation/screenshots/US-001-AC-1.png`
- **Notes:** {observations}

### AC-2: {title}
- **Status:** ✅ PASS | ❌ FAIL
- **Screenshot:** `validation/screenshots/US-001-AC-2.png`
- **Notes:** {observations}

## Issues Found
1. {issue description}
2. {issue description}

## Environment
- Browser: Chrome/Playwright
- Server: {test server URL}
- Commit: {git hash}
- Logs checked: ✅

## Evidence Files
- `validation/screenshots/US-001-*.png`
- `validation/logs/US-001-server.log`
- `validation/logs/US-001-console.log`
```

---

## Part 3: Playwright Integration

### 3.1 Test Structure

```
project/
├── playwright/
│   ├── tests/
│   │   ├── user-stories/
│   │   │   ├── US-001.spec.ts    # One file per user story
│   │   │   ├── US-002.spec.ts
│   │   │   └── ...
│   │   └── helpers/
│   │       ├── auth.ts           # Login helpers
│   │       └── screenshots.ts    # Screenshot helpers
│   ├── playwright.config.ts
│   └── screenshots/              # Generated evidence
└── ...
```

### 3.2 User Story Test Template

```typescript
// US-001.spec.ts
import { test, expect } from '@playwright/test';
import { login } from '../helpers/auth';

test.describe('US-001: User can sign in', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to test server
    await page.goto(process.env.TEST_SERVER_URL || 'https://dev2.aaroncollins.info');
  });

  test('AC-1: Sign in form displays correctly', async ({ page }) => {
    // Given: I am on the sign-in page
    await page.goto('/sign-in');
    
    // When: The page loads
    // (implicit)
    
    // Then: I see username and password fields
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    
    // Evidence
    await page.screenshot({ path: 'screenshots/US-001-AC-1.png', fullPage: true });
  });

  test('AC-2: Valid credentials redirect to dashboard', async ({ page }) => {
    // Given: I am on the sign-in page
    await page.goto('/sign-in');
    
    // When: I enter valid credentials and click Sign In
    await page.fill('input[name="username"]', process.env.TEST_USERNAME!);
    await page.fill('input[name="password"]', process.env.TEST_PASSWORD!);
    await page.click('button[type="submit"]');
    
    // Then: I am redirected to dashboard
    await expect(page).toHaveURL(/.*dashboard|.*\/$/);
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    
    // Evidence
    await page.screenshot({ path: 'screenshots/US-001-AC-2.png', fullPage: true });
  });

  test('AC-3: Invalid credentials show error', async ({ page }) => {
    // Given: I am on the sign-in page
    await page.goto('/sign-in');
    
    // When: I enter invalid credentials
    await page.fill('input[name="username"]', 'invalid_user');
    await page.fill('input[name="password"]', 'wrong_password');
    await page.click('button[type="submit"]');
    
    // Then: I see an error message
    await expect(page.locator('[role="alert"]')).toBeVisible();
    
    // Evidence
    await page.screenshot({ path: 'screenshots/US-001-AC-3.png', fullPage: true });
  });
});
```

### 3.3 Running Validation

```bash
# Run all user story tests
npx playwright test playwright/tests/user-stories/

# Run specific user story
npx playwright test playwright/tests/user-stories/US-001.spec.ts

# Run with UI (for debugging)
npx playwright test --ui

# Generate HTML report
npx playwright test --reporter=html
```

---

## Part 4: Directory Structure Changes

### 4.1 New Directories

```
clawd/
├── scheduler/
│   ├── stories/                    # User stories by project
│   │   ├── melo-v2/
│   │   │   ├── epics/
│   │   │   │   └── EPIC-001-auth.md
│   │   │   └── stories/
│   │   │       ├── US-001-sign-in.md
│   │   │       └── US-002-sign-up.md
│   │   ├── portableralph/
│   │   │   └── ...
│   │   └── connected-driving/
│   │       └── ...
│   ├── validation/                 # Validation reports
│   │   ├── reports/
│   │   │   └── {project}/{US-ID}-{date}.md
│   │   ├── screenshots/
│   │   │   └── {project}/{US-ID}-*.png
│   │   └── logs/
│   │       └── {project}/{US-ID}-*.log
│   └── ...
└── ...
```

### 4.2 Story Templates

Create templates at `scheduler/stories/templates/`:
- `EPIC-TEMPLATE.md`
- `USER-STORY-TEMPLATE.md`
- `VALIDATION-REPORT-TEMPLATE.md`

---

## Part 5: Process Changes

### 5.1 Task Assignment Flow (NEW)

```
1. PROJECT REQUEST
   ↓
2. PERSON MANAGER: Create Epics
   ↓
3. COORDINATOR: Break Epics into User Stories
   - Must include acceptance criteria
   - Must specify test server
   - Must specify validation method
   ↓
4. WORKER: Implement User Story
   - Write code
   - Create Playwright tests for each AC
   - Deploy to test server
   ↓
5. WORKER (L1): Self-Validation
   - Run Playwright tests
   - Capture screenshots
   - Generate validation report
   - Submit for L2
   ↓
6. COORDINATOR (L2): Manager Validation
   - Run SAME Playwright tests (fresh perspective)
   - Verify screenshots match criteria
   - Generate own validation report
   - Submit for L3
   ↓
7. VALIDATOR (L3): Peer Validation
   - Run SAME Playwright tests (independent)
   - Verify all evidence
   - Final validation report
   - PASS → Complete | FAIL → Back to worker
```

### 5.2 Validation Commands

Add to worker/validator identity files:

```bash
# Run validation for a user story
./scripts/validate-story.sh US-001 melo-v2

# This script:
# 1. Loads user story from scheduler/stories/{project}/stories/{US-ID}.md
# 2. Runs Playwright tests: playwright/tests/user-stories/{US-ID}.spec.ts
# 3. Captures screenshots to scheduler/validation/screenshots/{project}/
# 4. Checks server logs
# 5. Generates validation report to scheduler/validation/reports/{project}/
```

---

## Part 6: Implementation Plan

### Phase 1: Infrastructure (Today)
- [ ] Create directory structure
- [ ] Create templates (Epic, User Story, Validation Report)
- [ ] Create validation script
- [ ] Update AGENTS.md with new requirements
- [ ] Update worker/coordinator/validator identity files

### Phase 2: Retrofit Existing Projects (Today)
- [ ] Create user stories for active Melo v2 work
- [ ] Create user stories for PortableRalph Phase 4
- [ ] Create user stories for Connected Driving

### Phase 3: Playwright Setup (Today)
- [ ] Set up Playwright in Melo v2 project
- [ ] Create test helpers (auth, screenshots)
- [ ] Create example tests for existing user stories

### Phase 4: Process Enforcement (Ongoing)
- [ ] All new tasks MUST have user stories
- [ ] Validation MUST use Playwright
- [ ] Screenshots REQUIRED for all validations
- [ ] No exceptions

---

## Part 7: Example: Melo v2 Sign-In

### Epic

```markdown
# Epic: MELO-E001 Authentication System

**Project:** Melo v2
**Owner:** Sophie
**Status:** in-progress

## Description
Complete authentication system allowing users to sign in, sign up, and manage their sessions with the Matrix homeserver.

## User Stories
- [ ] [MELO-US-001] User can sign in with credentials
- [ ] [MELO-US-002] User can sign up for new account
- [ ] [MELO-US-003] User can sign out
- [ ] [MELO-US-004] User can enable 2FA
- [ ] [MELO-US-005] Session persists across page refresh
```

### User Story

```markdown
# User Story: MELO-US-001 User can sign in with credentials

**Epic:** MELO-E001
**Status:** in-progress
**Assigned:** Worker
**Model:** Sonnet

## Story
**As a** registered user
**I want** to sign in with my username and password
**So that** I can access my account and messages

## Acceptance Criteria

### AC-1: Sign-in form displays correctly
**Given** I navigate to /sign-in
**When** the page loads
**Then** I see:
  - Username input field
  - Password input field
  - "Sign In" button
  - Link to registration page

**Validation Method:** Visual inspection + Playwright
**Test Server:** https://dev2.aaroncollins.info
**Test Credentials:** ~/.env.test-credentials

### AC-2: Valid credentials authenticate successfully
**Given** I am on the sign-in page
**When** I enter valid username and password and click "Sign In"
**Then** I am redirected to the main app and see my username displayed

**Validation Method:** Playwright test with test credentials

### AC-3: Invalid credentials show error message
**Given** I am on the sign-in page
**When** I enter invalid credentials and click "Sign In"
**Then** I see an error message explaining authentication failed
**And** I remain on the sign-in page

**Validation Method:** Playwright test with invalid credentials

### AC-4: No console or server errors during flow
**Given** I complete the sign-in flow (success or failure)
**When** I check browser console and server logs
**Then** there are no JavaScript errors or server exceptions

**Validation Method:** Console log capture + pm2 logs check

## Definition of Done
- [ ] All 4 acceptance criteria pass
- [ ] Playwright tests created and passing
- [ ] Deployed to dev2.aaroncollins.info
- [ ] Screenshots captured for each AC
- [ ] No console/server errors
- [ ] Code committed and pushed
```

---

## Success Criteria for This Plan

1. ✅ All new tasks have user stories with acceptance criteria
2. ✅ All validations use Playwright on test servers
3. ✅ Screenshots exist for every acceptance criterion
4. ✅ Validation reports follow standard format
5. ✅ No more "page renders = done" validations
6. ✅ Workers cannot claim done without evidence

---

*This plan transforms validation from subjective guessing to objective, evidence-based verification.*
