# Task: haos-v2-auth-provider-p1-1-e - MatrixAuthProvider Context

## Summary
- **Status:** in-progress
- **Parent:** haos-v2-auth-manager-p1-1
- **Started:** 2026-02-12 00:25 EST
- **Model:** sonnet

## What to Build
Create React context for Matrix auth state at `apps/web/components/providers/matrix-auth-provider.tsx`:
- `MatrixAuthProvider` - Context provider component
- `useMatrixAuth()` - Hook to access auth state and actions
- Auto-validates session on mount using cookies
- Handles loading/error/authenticated states

## Prior Context
- Auth types in `apps/web/lib/matrix/types/auth.ts` (p1-1-a)
- Login/register functions in `apps/web/lib/matrix/auth.ts` (p1-1-b, p1-1-c)
- Cookie management in `apps/web/lib/matrix/cookies.ts` (p1-1-d)

## Files to Create
- `apps/web/components/providers/matrix-auth-provider.tsx`

## Success Criteria
- [ ] MatrixAuthProvider component created
- [ ] useMatrixAuth() hook provides: user, isLoading, error, login, logout, register
- [ ] Auto-validates session from cookie on mount
- [ ] Handles all auth states (loading, authenticated, unauthenticated, error)
- [ ] "use client" directive for client-side React
- [ ] Build passes (pnpm build)
- [ ] Lint passes (pnpm lint)

## Work Log
(Agent will fill this in)

## Validation
(Agent will fill this in)

## Notes for Manager
(Agent will fill this in)
