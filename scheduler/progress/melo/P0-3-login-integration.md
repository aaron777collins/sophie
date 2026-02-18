# P0-3: Wire Invite Check into Login Flow

**Status:** ✅ Complete
**Completed:** 2025-02-17 18:50 EST
**Agent:** P0-3-login-integration

## Task Summary
Wire the invite check into the login flow by replacing `isLoginAllowed()` with `isLoginAllowedWithInvite()`.

## What Was Done

### Problem Discovered
The original implementation had a chicken-and-egg problem:
- `isLoginAllowedWithInvite()` needed to check invites stored in Matrix account data
- Matrix account data requires a logged-in Matrix client
- During login, the user isn't logged in yet - so no client available!

### Solution Implemented

1. **Created Server-Side Invite Storage** (`lib/matrix/server-invites.ts`)
   - File-based JSON storage in `.data/invites.json`
   - Can be read/written without Matrix authentication
   - Functions: `serverCheckHasValidInvite()`, `serverMarkInviteUsed()`, `syncInvitesFromMatrix()`

2. **Fixed Broken matrix-auth-provider.tsx**
   - Previous commit `6dbb420` had left placeholder comments instead of actual code
   - Restored full 500+ line implementation from git history

3. **Updated access-control.ts**
   - Changed `isLoginAllowedWithInvite()` to use server-side storage
   - Made it synchronous (no longer async) since file reads are sync
   - Added `hasValidInviteServerSide()` and `markInviteUsedServerSide()` functions

4. **Updated login API route** (`app/api/auth/login/route.ts`)
   - Constructs full Matrix userId from username + homeserver
   - Calls `isLoginAllowedWithInvite(homeserver, userId)` before Matrix auth
   - Marks invite as used after successful login for external users
   - Returns `INVITE_REQUIRED` error code for external users without invite

5. **Updated admin-invites.ts to Sync**
   - When creating invite: also writes to server storage
   - When revoking invite: also removes from server storage  
   - When listing invites: syncs Matrix data to server storage

### Files Changed
- `lib/matrix/server-invites.ts` (NEW - 280 lines)
- `lib/matrix/access-control.ts` (modified)
- `lib/matrix/admin-invites.ts` (modified)
- `app/api/auth/login/route.ts` (modified)
- `components/providers/matrix-auth-provider.tsx` (restored)
- `.gitignore` (added .data)

## Success Criteria

- [x] External user with valid invite CAN login
- [x] External user without invite gets "invite required" error  
- [x] Invite marked as used after successful login
- [x] Local homeserver users unaffected
- [x] Build passes without errors
- [x] TypeScript passes without errors (pre-existing unrelated errors remain)

## Technical Notes

### Data Flow
```
Admin creates invite via UI
    → POST /api/admin/invites
    → createAdminInvite() saves to Matrix account data
    → serverCreateInvite() saves to .data/invites.json
    
External user tries to login
    → POST /api/auth/login
    → isLoginAllowedWithInvite(homeserver, userId)
    → hasValidInviteServerSide() reads .data/invites.json
    → If valid: proceed with Matrix login
    → After success: serverMarkInviteUsed() marks it used
```

### Why Server-Side Storage?
Matrix account data is ideal for client-side storage but unusable for pre-auth checks. The server-side file provides:
- Immediate availability (no Matrix client needed)
- Sync mechanism keeps both stores consistent
- Admin operations update both stores atomically

## Commit
```
1811129 P0-3: Wire invite check into login flow
```
