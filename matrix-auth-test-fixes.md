# Critical Test Fixes for Matrix Authentication Module

## Fix 1: Server Discovery Test - Search Button Text Issue

**Problem**: Test expects "Search" button but finds "Searching..." during loading state.

**Root Cause**: Component shows different button text during loading state.

**Fix**: Update test to handle both states or wait for loading to complete.

```tsx
// Current failing test
const searchButton = screen.getByText('Search');

// Fixed version - Option 1: Handle loading state
await waitFor(() => {
  expect(screen.queryByText('Searching...')).not.toBeInTheDocument();
});
const searchButton = screen.getByText('Search');

// Fixed version - Option 2: Use data-testid
const searchButton = screen.getByTestId('search-button');
```

## Fix 2: React Act() Wrapper Issues

**Problem**: State updates in tests not wrapped in act(), causing warnings.

**Root Cause**: React 18+ requires act() for async state updates in tests.

**Fix**: Wrap state-changing operations in act().

```tsx
import { act } from '@testing-library/react';

// Before
await user.type(searchInput, 'gaming');
await user.click(searchButton);

// After  
await act(async () => {
  await user.type(searchInput, 'gaming');
});
await act(async () => {
  await user.click(searchButton);
});
```

## Fix 3: Server Preview Duplicate Element Queries

**Problem**: Multiple elements with same text causing query ambiguity.

**Root Cause**: Server alias appears in both header and metadata sections.

**Fix**: Use more specific queries or data-testids.

```tsx
// Before - ambiguous query
expect(screen.getByText('#test:example.com')).toBeInTheDocument();

// After - specific selector
expect(screen.getByTestId('server-alias')).toHaveTextContent('#test:example.com');
// OR
expect(screen.getAllByText('#test:example.com')).toHaveLength(2);
```

## Fix 4: Create Invite Modal Validation Errors

**Problem**: Tests expect validation error messages that aren't appearing.

**Root Cause**: Form validation not triggering or error messages not rendering.

**Fix**: Ensure validation runs and error display is working.

```tsx
// Check if validation is actually triggered
fireEvent.click(submitBtn);

// Wait for validation to complete
await waitFor(() => {
  expect(screen.getByTestId('matrix-id-error')).toHaveTextContent('Matrix ID is required');
}, { timeout: 3000 });
```

## Fix 5: Email Notification Service Validation

**Problem**: Email validation returning wrong results for invalid emails.

**Root Cause**: Validation logic not properly implemented.

**Fix**: Implement proper email validation.

```typescript
// EmailNotificationService.validateEmail
validateEmail(email: string): { isValid: boolean; error?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email || !emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address'
    };
  }
  
  return { isValid: true };
}
```

## Implementation Priority

1. **Immediate** (Blocking deployment):
   - Fix search button text expectation
   - Add missing validation error displays
   - Fix email validation logic

2. **High** (Clean test output):  
   - Wrap all user interactions in act()
   - Use data-testids for ambiguous elements
   - Fix offline user detection counts

3. **Medium** (Test reliability):
   - Improve mock implementations
   - Add timeout configurations
   - Enhance error scenario coverage

## Quick Fix Script

```bash
# Run individual test files to isolate issues
npm test __tests__/components/providers/matrix-auth-provider.test.tsx
npm test __tests__/components/servers/server-discovery.test.tsx  
npm test __tests__/components/admin/create-invite-modal.test.tsx

# Apply fixes incrementally
# 1. Fix button text expectations
# 2. Add act() wrappers  
# 3. Update DOM queries
# 4. Fix validation logic
```

This systematic approach will resolve the most critical blocking issues first, then improve test reliability and maintainability.