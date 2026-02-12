# Task: haos-v2-session-cookies-p1-1-d - Session Cookie Management

## Summary
- **Status:** in-progress
- **Parent:** haos-v2-auth-manager-p1-1
- **Started:** 2026-02-12 00:14 EST
- **Model:** sonnet

## What to Build
Create secure cookie handling for Matrix sessions at `apps/web/lib/matrix/cookies.ts`:
- `setSessionCookie(session: MatrixSession)` - Store session in httpOnly cookie
- `getSessionCookie(): MatrixSession | null` - Retrieve session from cookie
- `clearSessionCookie()` - Remove session cookie on logout

## Prior Context
- Auth types in `apps/web/lib/matrix/types/auth.ts` (MatrixSession type)
- Login function in `apps/web/lib/matrix/auth.ts` returns MatrixSession
- This will be used by MatrixAuthProvider (p1-1-e) to persist auth state

## Files to Create
- `apps/web/lib/matrix/cookies.ts` - New file for cookie management

## Success Criteria
- [ ] setSessionCookie() stores session securely
- [ ] getSessionCookie() retrieves and validates session
- [ ] clearSessionCookie() removes session
- [ ] Cookies are httpOnly, secure, sameSite=strict
- [ ] Session persists across browser refresh
- [ ] Build passes (pnpm build)
- [ ] Lint passes (pnpm lint)

## Work Log
(Agent will fill this in)

## Validation
(Agent will fill this in)

## Notes for Manager
(Agent will fill this in)
