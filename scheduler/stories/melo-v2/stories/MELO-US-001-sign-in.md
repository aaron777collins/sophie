# User Story: [MELO-US-001] User can sign in with credentials

**Epic:** MELO-E001-Authentication
**Project:** Melo v2
**Status:** validating
**Assigned:** Sophie (fixing)
**Model:** opus
**Created:** 2026-02-21
**Test Server:** https://dev2.aaroncollins.info

---

## Story

**As a** registered Melo user
**I want** to sign in with my Matrix credentials
**So that** I can access my servers, channels, and messages

---

## Acceptance Criteria

### AC-1: Sign-in form displays correctly

**Given** I navigate to https://dev2.aaroncollins.info/sign-in
**When** the page fully loads
**Then** I see:
  - "Welcome to Melo" heading
  - Username input field
  - Password input field  
  - "Sign In" button
  - "Don't have an account? Create one here" link

**Validation:**
- Method: Playwright test + visual inspection
- Screenshot: Required ✅
- Server Logs: Check for errors ✅

---

### AC-2: Valid credentials authenticate and redirect to main app

**Given** I am on the sign-in page
**When** I enter valid credentials (sophietest / SophieTest2026!) and click "Sign In"
**Then**:
  - I am redirected to the main application (/ or /dashboard)
  - I can see the main app interface (sidebar with servers/channels)
  - My session is established (no "Loading..." stuck state)

**Validation:**
- Method: Playwright test with test credentials
- Screenshot: Required ✅ (must show logged-in state)
- Server Logs: Check for errors ✅

---

### AC-3: Invalid credentials show appropriate error

**Given** I am on the sign-in page
**When** I enter invalid credentials and click "Sign In"
**Then**:
  - An error message is displayed
  - I remain on the sign-in page
  - The form is not disabled/stuck

**Validation:**
- Method: Playwright test with invalid credentials
- Screenshot: Required ✅
- Server Logs: Check for errors ✅

---

### AC-4: No JavaScript or server errors during sign-in flow

**Given** I complete the full sign-in flow (from page load to logged-in state)
**When** I check browser console and server logs
**Then**:
  - Browser console has no JavaScript errors (warnings OK)
  - Server logs (pm2 logs melo) have no exceptions
  - All network requests return 2xx or expected 4xx

**Validation:**
- Method: Console capture + pm2 logs check
- Screenshot: N/A (log files)
- Server Logs: Required ✅

---

## Technical Notes

- The sign-in uses Matrix protocol authentication
- Session is stored in HTTP-only cookies
- 2FA check happens server-side (may fail gracefully if client can't be created)
- Test server is dev2.aaroncollins.info with pm2 process "melo"

---

## Test Credentials

**Location:** `~/.env.test-credentials`
**Username:** sophietest
**Password:** SophieTest2026!
**Note:** These are test credentials for validation only

---

## Definition of Done

- [ ] All 4 acceptance criteria pass
- [ ] Playwright tests exist for AC-1, AC-2, AC-3
- [ ] Deployed to dev2.aaroncollins.info
- [ ] Screenshots captured for AC-1, AC-2, AC-3
- [ ] Console logs captured for AC-4
- [ ] Server logs checked for AC-4
- [ ] No blocking errors in any check
- [ ] Validation report generated

---

## Validation History

| Level | Validator | Date | Result | Report |
|-------|-----------|------|--------|--------|
| L1 Self | Sophie | 2026-02-21 02:00 | ⏳ Partial | Server-side tested, client-side pending |
| L2 Manager | | | | |
| L3 Peer | | | | |

---

## Current Status Notes

**2026-02-21 02:00 EST:** Nuclear clean build deployed. Server-side validation passed (login API returns 200, session created). Client-side validation (AC-2) pending - need to verify no JavaScript errors after login.

**2026-02-21 11:00 EST:** Aaron reported client-side error after login still exists. User story created to properly track and validate the fix.

---

## VSDD Compliance (Mandatory)

### Verification Properties

| Property ID | Property | Testable | Coverage |
|-------------|----------|----------|----------|
| VP-US001-1 | Sign-in form renders all required elements | E2E snapshot test | AC-1 |
| VP-US001-2 | Valid credentials produce authenticated session | E2E test with creds | AC-2 |
| VP-US001-3 | Invalid credentials show error, no session | E2E test | AC-3 |
| VP-US001-4 | No JS console errors during entire flow | Console capture test | AC-4 |

### Purity Boundary Map

**Pure Core (Deterministic, no side effects):**
- `validateCredentials()` — Input validation (empty check, format)
- `authReducer()` — State transitions (loading, success, error)
- `formatErrorMessage()` — Error message formatting

**Effectful Shell (Side effects allowed):**
- Matrix authentication API call
- Session cookie setting
- Navigation/redirect after login
- pm2 server-side logging

**Adapters (Thin wrappers):**
- `useSignIn()` hook — Connects validation + reducer to API

### Red Gate Tests (Must fail before implementation)

| Test File | Test Description | Expected Failure |
|-----------|------------------|------------------|
| `tests/e2e/auth/sign-in.spec.ts` | Form displays all elements | Locator not found |
| `tests/e2e/auth/sign-in.spec.ts` | Valid login redirects | Timeout waiting |
| `tests/e2e/auth/sign-in.spec.ts` | Invalid login shows error | Error element not found |
| `tests/auth/validateCredentials.test.ts` | Empty username rejected | Function not defined |

### Contract Chain

```
Spec: MELO-US-001 (Sign In Story)
  ↓
Properties: VP-US001-1 through VP-US001-4
  ↓
Beads: bd-auth-signin (existing or to create)
  ↓
Tests: tests/e2e/auth/sign-in.spec.ts, tests/auth/*.test.ts
  ↓
Code: app/sign-in/page.tsx, lib/auth/reducer.ts, hooks/useSignIn.ts
```
