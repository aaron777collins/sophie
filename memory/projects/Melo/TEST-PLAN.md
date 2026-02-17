# Melo V2 Test-Driven Development Plan
**Date:** 2026-02-17
**Version:** 1.0

---

## Overview

This document outlines the comprehensive TDD approach for fixing and completing Melo V2. Each feature fix follows the Red-Green-Refactor cycle:

1. **RED:** Write failing test that defines expected behavior
2. **GREEN:** Implement minimum code to pass the test
3. **REFACTOR:** Clean up while keeping tests green

---

## Test Infrastructure

### Current Setup
- **Framework:** Playwright
- **Config:** `playwright.config.ts`
- **Test Directory:** `tests/e2e/`
- **Auth State:** `tests/.auth/user.json`

### Test Commands
```bash
# Run all tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run headed (see browser)
npm run test:e2e:headed

# Debug mode
npm run test:e2e:debug

# View report
npm run test:e2e:report

# Run specific test
npx playwright test --grep "test name"

# Run specific file
npx playwright test tests/e2e/auth/sign-in.spec.ts
```

---

## Test Priorities by Phase

### Phase 1: Critical Path Tests (Current)

#### 1.1 Authentication Flow
**File:** `tests/e2e/auth/sign-in.spec.ts`
**Status:** ✅ Tests exist

| Test | Expected | Actual Status |
|------|----------|---------------|
| Display sign-in form | Form visible | ✅ Now passing |
| Invalid credentials error | Error shown | Needs verify |
| Empty username error | Error shown | Needs verify |
| Empty password error | Error shown | Needs verify |
| Successful login | Redirect to app | Needs verify |
| Custom homeserver | Field accepts input | Needs verify |
| Link to sign-up | Navigates correctly | Needs verify |

#### 1.2 Sign-Up Flow
**File:** `tests/e2e/auth/sign-up.spec.ts`
**Status:** ✅ Tests exist

| Test | Expected | Actual Status |
|------|----------|---------------|
| Display sign-up form | Form visible | Needs verify |
| Username taken error | Error shown | Needs verify |
| Password validation | Requirements shown | Needs verify |
| Link to sign-in | Navigates correctly | Needs verify |

---

### Phase 2: Core Feature Tests (New Tests Needed)

#### 2.1 Direct Messages (CRITICAL - Currently Stubbed)
**File to create:** `tests/e2e/dms/dm-full-flow.spec.ts`

```typescript
// Tests to write:
test.describe('Direct Messages', () => {
  test('should display DM list in sidebar', async ({ page }) => {
    // Navigate to DMs section
    // Verify DM list component renders (not stub)
  });

  test('should start new DM conversation', async ({ page }) => {
    // Click "New Message" button
    // Search for user
    // Start conversation
    // Verify DM opens
  });

  test('should send message in DM', async ({ page }) => {
    // Open existing DM
    // Type message
    // Send message
    // Verify message appears
  });

  test('should receive message in DM', async ({ page }) => {
    // Open DM
    // Wait for incoming message (may need mock)
    // Verify message appears
  });
});
```

#### 2.2 Server Discovery Modal (CRITICAL - Missing)
**File to create:** `tests/e2e/servers/server-discovery.spec.ts`

```typescript
test.describe('Server Discovery', () => {
  test('should open discovery modal from navigation', async ({ page }) => {
    // Click "Explore Servers" button
    // Verify modal opens
  });

  test('should display public servers', async ({ page }) => {
    // Open discovery modal
    // Verify server list loads
  });

  test('should filter servers by category', async ({ page }) => {
    // Open discovery modal
    // Select category filter
    // Verify results update
  });

  test('should join server from discovery', async ({ page }) => {
    // Open discovery modal
    // Click join on a server
    // Verify joined successfully
  });
});
```

#### 2.3 Two-Factor Authentication (CRITICAL - Not Implemented)
**File to create:** `tests/e2e/settings/two-factor.spec.ts`

```typescript
test.describe('Two-Factor Authentication', () => {
  test('should display 2FA setup option', async ({ page }) => {
    // Navigate to security settings
    // Verify 2FA setup button visible
  });

  test('should show QR code for authenticator app', async ({ page }) => {
    // Start 2FA setup
    // Verify QR code displayed
  });

  test('should verify 2FA code', async ({ page }) => {
    // Enter valid 2FA code
    // Verify 2FA enabled
  });

  test('should require 2FA on login when enabled', async ({ page }) => {
    // Log out
    // Log in with credentials
    // Verify 2FA prompt appears
  });

  test('should allow 2FA disable', async ({ page }) => {
    // Navigate to security settings
    // Disable 2FA
    // Verify 2FA disabled
  });
});
```

---

### Phase 3: High Priority Tests

#### 3.1 Spaces/Channels Hook
**File to create:** `tests/e2e/spaces/spaces-navigation.spec.ts`

```typescript
test.describe('Spaces Navigation', () => {
  test('should display spaces list', async ({ page }) => {
    // Verify spaces appear in sidebar
  });

  test('should navigate between spaces', async ({ page }) => {
    // Click different space
    // Verify content updates
  });

  test('should display channels within space', async ({ page }) => {
    // Select space
    // Verify channel list appears
  });
});
```

#### 3.2 Role Management
**File to create:** `tests/e2e/servers/role-management.spec.ts`

```typescript
test.describe('Role Management', () => {
  test('should display roles list', async ({ page }) => {
    // Navigate to server settings > roles
    // Verify roles visible
  });

  test('should create new role', async ({ page }) => {
    // Click create role
    // Fill details
    // Save role
    // Verify role appears
  });

  test('should edit existing role', async ({ page }) => {
    // Select role
    // Edit permissions
    // Save changes
    // Verify changes persisted
  });

  test('should delete role', async ({ page }) => {
    // Select role
    // Delete role
    // Verify role removed
  });

  test('should reorder roles', async ({ page }) => {
    // Drag role to new position
    // Verify order changed
  });
});
```

#### 3.3 Device Verification
**File to create:** `tests/e2e/settings/device-verification.spec.ts`

```typescript
test.describe('Device Verification', () => {
  test('should display device list', async ({ page }) => {
    // Navigate to security settings
    // Verify device list visible
  });

  test('should verify current device', async ({ page }) => {
    // Click verify on current device
    // Complete verification flow
    // Verify device marked verified
  });

  test('should block suspicious device', async ({ page }) => {
    // Select device
    // Click block
    // Verify device blocked
  });

  test('should sign out all other devices', async ({ page }) => {
    // Click sign out all
    // Confirm action
    // Verify other devices signed out
  });
});
```

---

### Phase 4: Medium Priority Tests

#### 4.1 Moderation Tests
```typescript
// tests/e2e/moderation/bulk-actions.spec.ts
test.describe('Bulk Moderation', () => {
  test('should bulk kick members', async ({ page }) => { ... });
  test('should bulk ban members', async ({ page }) => { ... });
  test('should apply timed bans', async ({ page }) => { ... });
});
```

#### 4.2 Message Reporting
```typescript
// tests/e2e/moderation/message-reporting.spec.ts
test.describe('Message Reporting', () => {
  test('should open report modal', async ({ page }) => { ... });
  test('should submit report', async ({ page }) => { ... });
  test('should show report confirmation', async ({ page }) => { ... });
});
```

#### 4.3 Push Notifications
```typescript
// tests/e2e/notifications/push-notifications.spec.ts
test.describe('Push Notifications', () => {
  test('should request notification permission', async ({ page }) => { ... });
  test('should receive notification', async ({ page }) => { ... });
  test('should configure notification settings', async ({ page }) => { ... });
});
```

---

## Test Data & Fixtures

### Test Users
| User | Username | Password | Purpose |
|------|----------|----------|---------|
| Primary | sophietest | SophieTest2026! | Main test user |
| Secondary | e2etest2 | E2ETest2026! | DM/invite tests |

### Test Servers
- Create fresh server for each test suite
- Clean up servers after test completion
- Use unique names with timestamps

### Test Helpers
**Location:** `tests/e2e/fixtures/helpers.ts`

```typescript
// Wait for app ready
export async function waitForAppReady(page: Page) { ... }

// Wait for Matrix sync
export async function waitForMatrixSync(page: Page) { ... }

// Navigate to channel
export async function navigateToChannel(page: Page, serverName: string, channelName: string) { ... }

// Send and verify message
export async function sendAndVerifyMessage(page: Page, message: string) { ... }

// Generate unique identifiers
export function generateServerName() { return `Test Server ${Date.now()}`; }
export function generateChannelName() { return `test-channel-${Date.now()}`; }
export function generateMessage() { return `Test message ${Date.now()}`; }
```

---

## Acceptance Criteria Template

Every feature implementation must include:

```markdown
### Feature: [Name]

#### Acceptance Criteria
- [ ] Test file created at tests/e2e/[category]/[feature].spec.ts
- [ ] All tests pass
- [ ] No console errors in browser
- [ ] Feature works on mobile viewport
- [ ] Loading states handled
- [ ] Error states handled
- [ ] Accessibility checked (keyboard nav, screen reader)

#### Test Coverage
- [ ] Happy path
- [ ] Error cases
- [ ] Edge cases
- [ ] Mobile responsive

#### Validation Steps
1. Run: `npx playwright test tests/e2e/[category]/[feature].spec.ts`
2. All tests pass
3. Manual verification in browser
4. Code review complete
```

---

## CI/CD Integration

### GitHub Actions (Recommended)
```yaml
# .github/workflows/e2e.yml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      - name: Build
        run: npm run build
      - name: Run tests
        run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Test Execution Order

1. **Setup:** Run auth.setup.ts to authenticate
2. **Auth Tests:** Run without auth state (test login flows)
3. **Chromium Tests:** Run with auth state (test app features)

Tests are organized to run independent tests in parallel where possible.

---

## Reporting

### Test Report Location
- HTML Report: `playwright-report/index.html`
- JSON Results: `test-results/.last-run.json`
- Screenshots: `test-results/[test-name]/`
- Videos: `test-results/[test-name]/` (on failure)

### View Report
```bash
npm run test:e2e:report
```

---

## Maintenance

### Weekly Tasks
- [ ] Run full test suite
- [ ] Update flaky tests
- [ ] Add tests for new features
- [ ] Review test coverage

### Monthly Tasks
- [ ] Update Playwright version
- [ ] Review test performance
- [ ] Clean up test data
- [ ] Update test documentation
