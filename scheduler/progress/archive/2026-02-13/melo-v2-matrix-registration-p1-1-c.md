# Task: melo-v2-matrix-registration-p1-1-c - Matrix Registration Function

## Summary
- **Status:** completed ✅
- **Parent:** melo-v2-auth-manager-p1-1
- **Started:** 2026-02-12 00:14 EST
- **Completed:** 2026-02-12 00:36 EST
- **Model:** opus

## What Was Built
Added Matrix registration functions to `apps/web/lib/matrix/auth.ts`:
- `checkUsernameAvailable(username, homeserverUrl?): Promise<boolean>` - Check if username is available
- `register(username, password, email?, options?): Promise<MatrixSession>` - Create new Matrix accounts

### Functions Implemented:

**checkUsernameAvailable(username, homeserverUrl?)**
- Queries `/_matrix/client/v3/register/available` endpoint
- Strips `@` prefix and `:server` suffix from username if present
- Returns `true` if available, `false` if taken (M_USER_IN_USE, M_EXCLUSIVE, M_INVALID_USERNAME)
- Throws `MatrixAuthError` for server errors

**register(username, password, email?, options?)**
- Posts to `/_matrix/client/v3/register` endpoint
- Handles Matrix UIAA (User Interactive Authentication API) flows:
  - Empty flow (no auth required)
  - `m.login.dummy` (basic dummy auth)
  - `m.login.terms` (accept terms)
  - `m.login.email.identity` (if email provided)
- Returns `MatrixSession` on success
- Throws `MatrixAuthError` with appropriate codes:
  - `M_USER_IN_USE` - Username taken
  - `M_WEAK_PASSWORD` - Password too weak
  - `M_INVALID_USERNAME` - Invalid username format
  - `M_REGISTRATION_DISABLED` - Registration disabled on server
  - `M_FORBIDDEN` - Unsupported UIAA stages (e.g., CAPTCHA)

### Types Added:
- `RegisterOptions` - Configuration for registration
- `RegistrationResponse` - Matrix registration API response
- `UiaaResponse` - User Interactive Authentication response

### Helper Functions:
- `attemptRegistration()` - Single registration attempt
- `findCompletableFlow()` - Find a UIAA flow we can complete
- `completeRegistrationFlow()` - Complete UIAA stages
- `buildAuthStage()` - Build auth object for specific UIAA stage
- `createSessionFromRegistration()` - Convert registration response to session

## Files Modified
- `apps/web/lib/matrix/auth.ts` - Added ~300 lines of registration code

## Work Log
- [00:31] Claimed task, created heartbeat file
- [00:32] Read existing auth.ts to understand patterns
- [00:33] Implemented checkUsernameAvailable() function
- [00:34] Implemented register() function with full UIAA support
- [00:34] Added helper functions for UIAA flow handling
- [00:35] Fixed type error: `email` → `!!email` for boolean parameter
- [00:35] Fixed type error: UiaaResponse cast for details field
- [00:36] Build passed ✅
- [00:36] Lint passed ✅

## Validation
- [x] Code compiles/builds without errors
- [x] No TypeScript/linting errors introduced
- [x] Imports resolve correctly
- [x] Edge cases handled (UIAA flows, various error codes)
- [x] Error states handled gracefully
- [x] Changes integrate with existing codebase
- [x] Follows same patterns as loginWithPassword()
- [x] Proper JSDoc documentation

## Notes for Manager
- Registration is more complex than login due to UIAA flows
- Currently supports dummy, terms, and email.identity auth stages
- CAPTCHA and recaptcha stages are NOT supported - function throws helpful error
- If homeserver requires unsupported auth (common on public servers), function returns M_FORBIDDEN with available flows in details
- For production use with public servers, may need to add CAPTCHA support later
