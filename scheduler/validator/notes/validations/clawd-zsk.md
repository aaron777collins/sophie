# Validation: clawd-zsk (NextAuth.js CSRF Configuration Fix)

**Validated:** 2026-03-02 03:13:00 EST  
**Requested by:** coordinator  
**Project:** bible-drawing-v2  
**Phase:** Phase 1 - Authentication  
**Validator:** sophie (ADVERSARIAL PERSONA)

## 🚨 DIRECTORY VERIFICATION (MANDATORY FIRST STEP)
```bash
cd /home/ubuntu/repos/bible-drawing-v2
pwd
# Output: /home/ubuntu/repos/bible-drawing-v2
# ✅ VERIFIED: Working in correct project directory
```

## Acceptance Criteria

### AC-1: CSRF token endpoint works (/api/auth/csrf)
**CLAIMED:** Layer 2 validated working  
**ACTUAL TESTING:**
```bash
# Test endpoint
curl -i http://localhost:3000/api/auth/csrf
# Result: 404 Not Found (missing basePath)

curl -i http://localhost:3000/bdv2/api/auth/csrf  
# Result: 302 Found (redirects to signin)
# Sets cookie: next-auth.csrf-token=...
```
**RESULT:** ⚠️ PARTIAL - Endpoint exists and sets CSRF tokens but redirects instead of returning JSON

### AC-2: Auth callback returns 302, not 403 CSRF error
**CLAIMED:** Verified working  
**ACTUAL TESTING:** ❌ UNABLE TO VERIFY - E2E tests won't start
```bash
pnpm test:e2e
# Error: Unable to acquire lock at .next/dev/lock, is another instance of next dev running?
```

### AC-3: Browser auth flow shows no CSRF errors  
**CLAIMED:** Browser shows CredentialsSignin error (proper auth flow)  
**ACTUAL TESTING:** ❌ UNABLE TO VERIFY - E2E tests fail to start

### AC-4: Login attempts get credential errors, not CSRF errors
**CLAIMED:** Confirmed via API-level testing  
**ACTUAL TESTING:** ❌ UNABLE TO VERIFY - Cannot run auth tests

## E2E Test Verification (CRITICAL FAILURE)

**Multiple Attempts Made:**
1. `pnpm test:e2e` - Failed (port/lock conflicts)
2. `npx playwright test auth-basic.spec.ts` - Failed (same issue)
3. Killed all processes, removed locks - Still fails

**Error Pattern:**
```
Port 3000 is in use by an unknown process, using available port 3001 instead.
Unable to acquire lock at .next/dev/lock, is another instance of next dev running?
Error: Process from config.webServer was not able to start. Exit code: 1
```

## Configuration Review

### NextAuth Route: ✅ PRESENT
- File: `src/app/api/auth/[...nextauth]/route.ts`  
- Exports: `{ GET, POST } = handlers`
- Configuration: `authOptions` imported from config

### Auth Config: ✅ CONFIGURED  
- File: `src/lib/auth/config.ts`
- BasePath: `/bdv2/api/auth` ✅
- CSRF cookies: Configured ✅  
- Trust host: `true` ✅

## ADVERSARIAL VALIDATION RESULT: ❌ REJECTION

### Critical Issues Found:

1. **E2E TESTING COMPLETELY BROKEN**
   - Cannot run ANY E2E tests
   - Multiple failure modes (port conflicts, lock files, server startup)
   - This violates the "E2E tests pass" requirement

2. **UNVERIFIABLE CLAIMS**  
   - Layer 2 claims "9/9 E2E pass" but tests won't run
   - Cannot verify auth flow behavior
   - Cannot verify CSRF vs credential error distinction

3. **PARTIAL FUNCTIONALITY**
   - CSRF endpoint redirects instead of returning token data
   - May work for browser flows but doesn't match typical NextAuth behavior

### Evidence Issues:
- Claims of working E2E tests are UNVERIFIABLE
- Screenshots exist but cannot be validated against current functionality  
- "API-level testing confirms CSRF functionality" is insufficient for Layer 3 validation

## Required Before Re-submission:

1. **FIX E2E TEST INFRASTRUCTURE**
   - Resolve port conflicts and lock file issues
   - Ensure `pnpm test:e2e` runs successfully
   - Provide working E2E test evidence

2. **VERIFY ALL ACCEPTANCE CRITERIA**
   - Demonstrate CSRF endpoint returns proper JSON response
   - Show auth callback behavior (302 vs 403)
   - Prove credential errors vs CSRF errors distinction

3. **PROVIDE REAL EVIDENCE**
   - Working E2E test output (not claims)
   - Server logs showing proper CSRF handling
   - Browser testing evidence of auth flow

## Validation Status: FAILED

**Sent to Coordinator:** 2026-03-02 03:13:00 EST - Validation REJECTED due to unverifiable claims and broken E2E test infrastructure.

**Next Action:** Return to `needs-fix` status for E2E infrastructure repair and proper evidence generation.