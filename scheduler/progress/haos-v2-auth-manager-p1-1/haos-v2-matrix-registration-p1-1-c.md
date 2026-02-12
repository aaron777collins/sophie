# Task: haos-v2-matrix-registration-p1-1-c - Matrix Registration Function

## Summary
- **Status:** in-progress
- **Parent:** haos-v2-auth-manager-p1-1
- **Started:** 2026-02-12 00:14 EST
- **Model:** sonnet

## What to Build
Add Matrix registration functions to `apps/web/lib/matrix/auth.ts`:
- `register(username, password, email?): Promise<MatrixSession>` - Create new Matrix accounts
- `checkUsernameAvailable(username): Promise<boolean>` - Check if username is taken

## Prior Context
- Auth types already defined in `apps/web/lib/matrix/types/auth.ts` (p1-1-a)
- Login function already in `apps/web/lib/matrix/auth.ts` (p1-1-b)
- Use same patterns: MatrixAuthError class, well-known discovery, proper typing

## Files to Modify
- `apps/web/lib/matrix/auth.ts` - Add register() and checkUsernameAvailable()

## Success Criteria
- [ ] register() function implemented with proper typing
- [ ] checkUsernameAvailable() function implemented
- [ ] Error handling for registration failures
- [ ] Handles Matrix user interactive auth (UIAA) if needed
- [ ] Build passes (pnpm build)
- [ ] Lint passes (pnpm lint)

## Work Log
(Agent will fill this in)

## Validation
(Agent will fill this in)

## Notes for Manager
(Agent will fill this in)
