# E2E Rework Report - MELO Tasks

**Date:** 2026-02-28  
**Subagent:** melo-rework-opus  
**Task:** Rework failing MELO tasks with E2E validation

---

## Executive Summary

Fixed several infrastructure issues with E2E tests. Some critical blockers remain related to server-side authentication that require application-level changes.

---

## Issues Fixed

### 1. Missing Auth Helper Module
**Problem:** E2E tests importing from `./helpers/auth` failed because the file didn't exist  
**Solution:** Created `tests/e2e/helpers/auth.ts` with login/logout functions  
**Status:** ✅ FIXED

### 2. Incorrect Import Path
**Problem:** `dm-conversation-flow.spec.ts` used wrong import path `../helpers/auth` instead of `./helpers/auth`  
**Solution:** Fixed import path  
**Status:** ✅ FIXED

### 3. Outdated Build on dev2
**Problem:** Sign-up page missing `data-testid` attributes on dev2 server  
**Solution:** Rebuilt and restarted melo service on dev2  
**Status:** ✅ FIXED

### 4. Wrong Form Selectors in Tests
**Problem:** Tests using `input[name="username"]` instead of `[data-testid="username-input"]`  
**Solution:** Updated `profile-to-dm-flow.spec.ts` to use correct data-testid selectors  
**Status:** ✅ FIXED

---

## Remaining Issues (Require Application Changes)

### Server-Side Auth Redirect
**Problem:** Protected routes like `/channels/@me` redirect to `/sign-in` server-side before client JavaScript runs  
**Impact:** Client-side auth bypass (localStorage injection) is too late - redirect already happened  
**Affected Tests:**
- `dm-mobile-unread.spec.ts` - 4 tests failing
- `profile-to-dm-flow.spec.ts` - 12 tests failing

**Required Fix:**
1. Add test mode environment variable (`E2E_TEST_MODE=true`)
2. Modify server-side auth middleware to skip redirect in test mode
3. OR use actual Matrix test credentials that work with the homeserver

---

## Test Results Summary

### Route Tests (basic-routing.spec.ts)
- **Before:** 2 failed (sign-up missing password-input)
- **After:** ✅ 9 passed, 0 failed

### DM Mobile Tests (dm-mobile-unread.spec.ts)
- 9 passed, 4 failed
- Failures due to server-side auth redirect

### Profile to DM Tests (profile-to-dm-flow.spec.ts)
- 1 passed, 12 failed  
- Failures due to server-side auth redirect + form selector issues fixed

---

## Commits Made

1. `0c7136e` - fix: Add missing auth helper module for E2E tests
2. `94147b6` - fix: Update E2E test helpers and selectors for auth and DM tests

---

## Recommendations

### Short-Term
1. Focus E2E tests on unauthenticated pages (sign-in, sign-up, static pages)
2. Use unit tests for authenticated components

### Long-Term (Required for Full E2E Coverage)
1. **Add E2E Test Mode to Server:**
   ```typescript
   // middleware.ts or auth provider
   if (process.env.E2E_TEST_MODE === 'true') {
     // Skip auth check for test routes
   }
   ```

2. **Configure Test User in Matrix:**
   - Create dedicated test user on dev2 Matrix server
   - Store credentials in test config
   - Use real Matrix auth instead of bypass

3. **Test Database Reset:**
   - Add API endpoint to reset test state
   - Call before each test run

---

## Files Modified

```
tests/e2e/helpers/auth.ts (NEW)
tests/e2e/dm-conversation-flow.spec.ts
tests/e2e/dm-mobile-unread.spec.ts  
tests/e2e/profile-to-dm-flow.spec.ts
```

---

## Next Steps

1. Decide on auth strategy (test mode vs real credentials)
2. Implement server-side changes if needed
3. Re-run all E2E tests after auth fix
4. Capture screenshots at 3 viewports for passing tests

---

**Report Generated:** 2026-02-28 12:25 EST
