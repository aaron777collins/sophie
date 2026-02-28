# User Story: [US-P2-01] User Registration Implementation

**Epic:** MELO-V2-PHASE2-AUTHENTICATION
**Project:** melo-v2
**Status:** draft
**Story Architect:** story-architect (STORY-ARCHITECT-MELO-P2)
**Created:** 2026-02-28
**Version:** 1
**Test Server:** http://dev2.aaroncollins.info:3000

---

## Story

**As a** new user visiting MELO V2
**I want** to easily find and complete user registration
**So that** I can create an account and access all authenticated features of the platform

---

## 🧠 Multi-Perspective Brainstorming

### User Perspective
**Primary Journey:**
- User arrives at homepage → sees clear "Register" or "Sign Up" CTA
- Registration form is simple: username, email, password, confirm password
- Clear validation feedback on each field
- Success leads to immediate login or confirmation screen

**Pain Points to Address:**
- DEF-001 found NO visible registration path on homepage
- Users currently have no way to create accounts through normal UI flow
- Registration exists at `/sign-up` but is not discoverable

**Expected Discord-like Experience:**
- Prominent "Register" button on login page
- "Create an account" link from sign-in form
- Clean, focused registration form without distractions

### Admin Perspective
**Operational Needs:**
- Registration creates valid Matrix accounts with proper homeserver integration
- Admin should be able to view new user registrations
- Rate limiting to prevent spam registrations
- Audit trail of registration attempts

**Security Requirements:**
- Password strength validation (minimum 8 chars, complexity)
- Email verification flow (optional but recommended)
- Captcha for bot prevention (future enhancement)

### Moderator Perspective
**Concerns:**
- New users should have appropriate default permissions
- Ability to identify newly registered accounts
- No offensive usernames allowed (validation)

### Technical Perspective
**Implementation Requirements:**
- Matrix SDK user creation integration (already exists in backend)
- Form validation using Zod schema
- Responsive design across all viewports
- NextAuth.js session creation after registration
- Proper error handling for existing usernames/emails

**Infrastructure Ready:**
- `/sign-up` page exists but lacks homepage discoverability
- Matrix user creation API endpoints functional
- Authentication system works (login verified working)

---

## Acceptance Criteria

### AC-1: Registration Access from Homepage (P0-CRITICAL)

**Given** a new user on the MELO V2 homepage
**When** they look for registration options
**Then** they see a clear "Register" or "Sign Up" button/link within 5 seconds of page load

**Validation:**
- Method: Playwright E2E test
- Test Server: http://dev2.aaroncollins.info:3000
- Screenshot: Required ✅
- Test Devices: Desktop (1920x1080), Tablet (768x1024), Mobile (375x667)

**Playwright Test Scenario:**
```typescript
test('AC-1: Registration link visible on homepage', async ({ page }) => {
  await page.goto('/');
  const registerLink = page.locator('a[href*="sign-up"], a[href*="register"], button:has-text("Register"), button:has-text("Sign Up")');
  await expect(registerLink).toBeVisible({ timeout: 5000 });
  await page.screenshot({ path: 'evidence/ac1-register-link.png', fullPage: true });
});
```

---

### AC-2: Registration Access from Login Page

**Given** a user on the sign-in page (`/sign-in`)
**When** they need to create a new account
**Then** they see a "Create an account" or "Register" link that navigates to `/sign-up`

**Validation:**
- Method: Playwright E2E test
- Screenshot: Required ✅

**Playwright Test Scenario:**
```typescript
test('AC-2: Registration link from login page', async ({ page }) => {
  await page.goto('/sign-in');
  const createAccountLink = page.locator('a[href*="sign-up"]');
  await expect(createAccountLink).toBeVisible();
  await createAccountLink.click();
  await expect(page).toHaveURL(/sign-up/);
});
```

---

### AC-3: Registration Form Fields Display

**Given** a user on the registration page (`/sign-up`)
**When** the page loads
**Then** they see a form with: username field, email field, password field, confirm password field, and submit button

**Validation:**
- Method: Playwright E2E test
- Screenshot: Required ✅ (all viewports)

**Playwright Test Scenario:**
```typescript
test('AC-3: Registration form has required fields', async ({ page }) => {
  await page.goto('/sign-up');
  await expect(page.locator('input[name="username"]')).toBeVisible();
  await expect(page.locator('input[name="email"]')).toBeVisible();
  await expect(page.locator('input[name="password"]')).toBeVisible();
  await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();
  await expect(page.locator('button[type="submit"]')).toBeVisible();
});
```

---

### AC-4: Successful Registration Flow

**Given** a user with valid, unique credentials (username: `testuser_<timestamp>`, email: `testuser_<timestamp>@test.com`, password: `SecurePass123!`)
**When** they complete the registration form and submit
**Then** they are registered successfully and either logged in automatically OR shown a success message

**Validation:**
- Method: Playwright E2E test
- Screenshot: Required ✅
- Test Data: Unique username/email per test run

**Playwright Test Scenario:**
```typescript
test('AC-4: Successful registration creates account', async ({ page }) => {
  const timestamp = Date.now();
  await page.goto('/sign-up');
  await page.fill('input[name="username"]', `testuser_${timestamp}`);
  await page.fill('input[name="email"]', `testuser_${timestamp}@test.com`);
  await page.fill('input[name="password"]', 'SecurePass123!');
  await page.fill('input[name="confirmPassword"]', 'SecurePass123!');
  await page.click('button[type="submit"]');
  // Either redirected to app OR success message shown
  await expect(page.locator('text=Welcome, text=Success, text=Account created')).toBeVisible({ timeout: 10000 });
});
```

---

### AC-5: Validation Error - Username Already Exists

**Given** a user trying to register with an existing username
**When** they submit the form
**Then** they see an error message indicating the username is taken

**Validation:**
- Method: Playwright E2E test
- Screenshot: Required ✅

---

### AC-6: Validation Error - Invalid Email Format

**Given** a user entering an invalid email (e.g., "notanemail")
**When** they attempt to submit
**Then** they see inline validation error on the email field

**Validation:**
- Method: Playwright E2E test
- Screenshot: Required ✅

---

### AC-7: Validation Error - Password Mismatch

**Given** a user with mismatched password and confirm password fields
**When** they attempt to submit
**Then** they see an error indicating passwords don't match

**Validation:**
- Method: Playwright E2E test
- Screenshot: Required ✅

---

### AC-8: Responsive Design - Mobile Registration

**Given** a user on a mobile device (375x667)
**When** they access the registration page
**Then** the form is fully visible, fields are properly sized, and submit button is easily tappable

**Validation:**
- Method: Playwright E2E test with mobile viewport
- Screenshot: Required ✅

---

### AC-9: Password Strength Requirements

**Given** a user entering a weak password (e.g., "123")
**When** they attempt to submit
**Then** they see clear password requirements (minimum 8 characters, etc.)

**Validation:**
- Method: Playwright E2E test
- Screenshot: Required ✅

---

## Contingencies

### What Could Go Wrong

| Risk | Likelihood | Impact | Detection | Mitigation |
|------|------------|--------|-----------|------------|
| Matrix user creation fails | M | H | API error response | Graceful error message, retry option |
| Username contains invalid characters | M | L | Form validation | Regex validation with clear feedback |
| Email already registered | M | M | Backend check | Suggest login with existing account |
| Network timeout during registration | L | M | Request timeout | Loading state, retry button |
| Session creation fails after registration | L | H | Auth error | Prompt to login manually |
| Rate limiting triggered | L | L | 429 response | "Too many attempts" message with wait time |

### Fallback Options
- **If Matrix API unavailable:** Show maintenance message, allow retry later
- **If email verification required:** Show clear instructions and resend option
- **If session creation fails:** Redirect to login with "Account created" message

### Blockers (Would Prevent Story Completion)
| Blocker | Likelihood | Mitigation |
|---------|------------|------------|
| Matrix homeserver unreachable | L | Use mock API for testing, verify in staging |
| Authentication provider misconfigured | L | Document NextAuth.js setup requirements |
| Database connection issues | L | Verify DB before implementation |

### Early Warning Signs
- Build failures when adding new components
- Matrix SDK version incompatibility
- NextAuth session creation test failures
- Zod schema validation not working

---

## Dependencies

### Dependency Graph
```
[Matrix SDK Integration] ─┬─► [US-P2-01: Registration] ─┬─► [S02: Login]
                          │                              │
[NextAuth.js Setup] ──────┘                              ├─► [S04: Create Server]
                                                         │
                                                         └─► [ALL authenticated features]
```

### Upstream (Must Complete First)
| Dependency | Type | Status | Blocker? | Notes |
|------------|------|--------|----------|-------|
| Matrix SDK client | technical | ✅ done | no | Already integrated |
| NextAuth.js config | technical | ✅ done | no | Login works, same config |
| DEF-003 resolution | technical | ✅ done | no | App loading fixed |

### Downstream (Waiting on This)
| Dependent | Type | Impact if Delayed |
|-----------|------|-------------------|
| S02 Login | story | Cannot test with new users |
| S04 Create Server | story | No authenticated users |
| S05 Join Server | story | Blocked by auth |
| S07-S12 All | story | Entire auth-dependent chain |

### External Dependencies
| External | Description | Status | Fallback |
|----------|-------------|--------|----------|
| Matrix Homeserver | User creation API | available | Mock for unit tests |
| SMTP (if email verify) | Verification emails | testing | Skip verification for MVP |

### Technical Prerequisites
- [x] NextAuth.js provider configured
- [x] Matrix SDK user creation working
- [x] `/sign-up` page exists (needs homepage link)
- [ ] Zod schema for registration form
- [ ] Error handling components

---

## Out of Scope

Explicitly NOT included in this story (to prevent scope creep):
- Email verification flow (future enhancement)
- Social login (OAuth providers)
- Two-factor authentication setup
- Profile picture upload during registration
- Custom display name (separate from username)
- Terms of service agreement checkbox
- Captcha/bot prevention (P2 enhancement)

---

## Technical Notes

### Suggested Approach
1. **Add homepage registration link** - Quick win, add button to hero section
2. **Verify `/sign-up` form completeness** - May already have most fields
3. **Add "Create account" link to `/sign-in`** - Simple link addition
4. **Enhance form validation** - Zod schema with all rules
5. **Test Matrix integration** - Verify user creation works end-to-end
6. **Add comprehensive error handling** - User-friendly messages

### Patterns to Follow
- Use existing form patterns from `/sign-in` page
- Follow Melo UI component conventions (Discord-like styling)
- Use React Hook Form with Zod validation (existing pattern)
- Handle loading states with existing spinner components

### Anti-Patterns to Avoid
- Don't require email verification for MVP (blocks testing)
- Don't make password requirements too strict initially
- Don't create user before validating all fields
- Don't expose Matrix-specific errors to users

---

## Test Credentials

**Location:** `~/.env.test-credentials`
**Note:** Never commit actual passwords to git

**Test Data Requirements:**
- Unique usernames per test run (use timestamp)
- Valid email format (can be fake for testing)
- Password meeting strength requirements

---

## Sub-Tasks (Coordinator Fills This)

| Task ID | Description | Model | Status |
|---------|-------------|-------|--------|
| | | | |

---

## Definition of Done

- [ ] AC-1: Registration link visible on homepage (all viewports)
- [ ] AC-2: "Create account" link on sign-in page
- [ ] AC-3: Form has all required fields
- [ ] AC-4: Successful registration creates Matrix user
- [ ] AC-5: Duplicate username error handled
- [ ] AC-6: Invalid email validation works
- [ ] AC-7: Password mismatch error shown
- [ ] AC-8: Mobile responsive design verified
- [ ] AC-9: Password strength requirements enforced
- [ ] Playwright E2E tests created and passing
- [ ] Screenshots captured for ALL acceptance criteria
- [ ] No browser console errors
- [ ] Code committed with descriptive message
- [ ] L1 (Self) validation complete
- [ ] L2 (Manager) validation complete
- [ ] L3 (Peer) validation complete

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
- [x] Happy path covered (AC-4)
- [x] Alternate valid paths covered (AC-1, AC-2)
- [x] All error scenarios covered (AC-5, AC-6, AC-7)
- [x] All edge cases covered (AC-9)
- [x] Empty states covered (N/A - form always shown)
- [x] Boundary conditions covered (password length)
- [x] Permission/auth cases covered (creates authenticated user)

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
| v1 | STORY-ARCHITECT-MELO-P2 | 2026-02-28 | draft | Initial creation from Phase 1 audit findings |

---
*Story created from Phase 1 Audit DEF-001 (Registration Not Accessible) - P0-CRITICAL priority*
