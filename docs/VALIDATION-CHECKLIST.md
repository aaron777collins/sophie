# Validation Checklist — Sub-Agent Work Standards

**Created:** 2026-02-16
**Mandate:** "If you can't validate your work, it's the same as not doing it."

---

## 🚨 Non-Negotiable Rules

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    TESTING IS NOT OPTIONAL                              │
│                                                                         │
│  1. Write tests FIRST or DURING implementation (TDD/BDD)                │
│  2. Run ALL tests before claiming complete                              │
│  3. Build must pass                                                     │
│  4. Coverage must not decrease                                          │
│  5. Manual validation for user-facing changes                           │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Before ANY Implementation

### 1. Understand Acceptance Criteria

Every task MUST have acceptance criteria. If it doesn't, **do not start**. Ask for clarification.

```markdown
#### 📋 Acceptance Criteria
- [ ] Specific, testable criterion 1
- [ ] Specific, testable criterion 2
- [ ] Build passes
- [ ] Tests pass
```

### 2. Write Tests First (TDD) or Alongside (BDD)

**TDD Approach:**
```bash
# 1. Write failing test
# 2. Run test (confirms it fails)
# 3. Write minimal code to pass
# 4. Run test (confirms it passes)
# 5. Refactor
# 6. Repeat
```

**BDD Approach:**
```bash
# 1. Start implementation
# 2. As you complete each piece, write its test
# 3. Never move to next piece until current is tested
```

**DO NOT** write all code first and tests last. That's not TDD/BDD.

---

## Required Tests by Type

### New Feature
- [ ] Unit tests for business logic
- [ ] Component tests for React components
- [ ] Integration tests if it touches multiple systems
- [ ] E2E test for critical user flows

### Bug Fix
- [ ] Regression test that would have caught the bug
- [ ] Verify test fails before fix, passes after

### Refactor
- [ ] Existing tests still pass
- [ ] No coverage decrease

### API/Backend Change
- [ ] Unit tests for new endpoints/functions
- [ ] Integration tests with dependencies
- [ ] E2E test for complete flow

---

## Validation Commands

Every sub-agent must run these before claiming complete:

### JavaScript/TypeScript Projects

```bash
# Type checking
pnpm tsc --noEmit

# Linting
pnpm lint

# Unit tests
pnpm test:unit

# Component tests (if applicable)
pnpm test:components

# Build
pnpm build

# E2E tests (against live URL where applicable)
pnpm test:e2e

# Coverage check
pnpm test:coverage
```

### For HAOS Specifically

```bash
# Full validation suite
pnpm build && pnpm test:unit && pnpm test:e2e

# Live URL testing with Playwright
PLAYWRIGHT_BASE_URL=https://haos.dev2.aaroncollins.info pnpm test:e2e:web
```

---

## Completion Report Template

When claiming a task complete, provide this report:

```markdown
## Completion Report

### Task
- **ID:** {task-id}
- **Description:** {description}

### Acceptance Criteria Verification
- [x] Criterion 1: How verified
- [x] Criterion 2: How verified
- [x] Build passes: `pnpm build` (exit 0)
- [x] Tests pass: `pnpm test` (X tests, 0 failures)

### Tests Added
- `__tests__/feature.test.ts` — 5 new tests
- `tests/e2e/feature.spec.ts` — 2 E2E scenarios

### Coverage
- Before: 72%
- After: 74% (+2%)

### Manual Validation
- [ ] Tested in browser
- [ ] Edge cases checked

### Git
- Commit: {hash}
- Message: {message}
```

---

## E2E Testing with Playwright

### Live URL Testing

Playwright can test against live URLs. Use this for validation:

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
  },
});
```

```bash
# Test against production
PLAYWRIGHT_BASE_URL=https://haos.dev2.aaroncollins.info pnpm test:e2e
```

### Network Conditioning

Test offline scenarios:

```typescript
test('works offline', async ({ page, context }) => {
  await page.goto('/');
  
  // Go offline
  await context.setOffline(true);
  
  // Verify cached content shows
  await expect(page.locator('.message')).toBeVisible();
  
  // Send message while offline
  await page.fill('[data-testid="message-input"]', 'Offline message');
  await page.click('[data-testid="send-button"]');
  
  // Verify queued indicator
  await expect(page.locator('.pending-indicator')).toBeVisible();
  
  // Go online
  await context.setOffline(false);
  
  // Verify message sent
  await expect(page.locator('.pending-indicator')).not.toBeVisible();
});
```

---

## Framework Recommendations

### Unit/Component Tests
- **Framework:** Vitest (fast, Vite-native)
- **React:** React Testing Library
- **Coverage:** c8 or vitest coverage

### E2E Tests
- **Web:** Playwright (recommended)
- **Mobile:** Maestro (or Detox for more complex)
- **Desktop:** Playwright (can test Electron-mode) or WebDriver

### Integration Tests
- Use Vitest with longer timeouts
- Mock external services where necessary
- Use test containers for databases if needed

---

## Common Mistakes to Avoid

### ❌ DON'T

```
- Skip tests "to save time"
- Write all code then all tests
- Trust "it works on my machine"
- Claim complete without running tests
- Ignore flaky tests
- Decrease coverage
```

### ✅ DO

```
- Write test first (or alongside)
- Run full test suite before claiming done
- Test edge cases
- Test error paths
- Verify on live URL when possible
- Add to coverage
```

---

## Test Quality Standards

### Good Test

```typescript
test('sends message when online', async () => {
  // Arrange
  const message = 'Hello, World!';
  render(<ChatInput roomId="test-room" />);
  
  // Act
  await userEvent.type(screen.getByRole('textbox'), message);
  await userEvent.click(screen.getByRole('button', { name: /send/i }));
  
  // Assert
  expect(mockSendMessage).toHaveBeenCalledWith('test-room', message);
});
```

### Bad Test

```typescript
test('works', () => {
  // Too vague, tests nothing specific
  expect(true).toBe(true);
});
```

---

## Escalation

If you cannot validate your work due to:
- Missing test infrastructure → File issue, do not proceed
- Test environment broken → Fix environment first
- Unclear acceptance criteria → Ask for clarification

**Never skip validation. Never.**

---

*This document is mandatory for all sub-agents. Violations will be caught in verification.*
