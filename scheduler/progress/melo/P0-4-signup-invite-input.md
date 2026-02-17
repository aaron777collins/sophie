# P0-4 Signup Invite Code Input

## Status: ✅ COMPLETED
**Completed:** 2026-02-18 16:45 EST

## Work Log

- [2026-02-18 16:00 EST] Started task - read existing sign-up page and invite system
- [2026-02-18 16:10 EST] Analyzed existing invite architecture:
  - Admin invites stored in Matrix account data
  - Server-invites.ts provides file-based storage for unauthenticated access
  - Invites tied to specific user IDs (@user:server format)
- [2026-02-18 16:20 EST] Added `serverValidateInviteCode()` function to server-invites.ts
- [2026-02-18 16:25 EST] Created `/api/auth/validate-invite` endpoint for validation
- [2026-02-18 16:30 EST] Created `/api/auth/use-invite` endpoint to mark invites as used
- [2026-02-18 16:35 EST] Updated sign-up page with invite code input field
- [2026-02-18 16:40 EST] Build verified successful
- [2026-02-18 16:45 EST] Changes committed

## Implementation Details

### Files Modified
1. **lib/matrix/server-invites.ts**
   - Added `serverValidateInviteCode(code, userId)` function
   - Validates invite code format (inv_timestamp_random)
   - Checks if invite exists, not expired, not used
   - Verifies invite matches expected user ID

2. **app/(auth)/(routes)/sign-up/[[...sign-up]]/page.tsx**
   - Added `inviteCode` to form state
   - Added `showInviteField` logic (external homeserver only)
   - Added invite code input with validation UI
   - Shows validation status (loading, error, success)
   - Validates invite before registration
   - Marks invite as used after successful registration

3. **app/api/auth/validate-invite/route.ts** (NEW)
   - POST endpoint for invite validation
   - Constructs user ID from username + homeserver
   - Returns validation result with error codes

4. **app/api/auth/use-invite/route.ts** (NEW)
   - POST endpoint to mark invite as used
   - Called after successful registration
   - Best-effort (doesn't block on failure)

### Flow
1. User selects external homeserver (not configured one)
2. Invite code field appears with amber border
3. User enters invite code (format: inv_TIMESTAMP_RANDOM)
4. On submit, invite is validated via API
5. If valid, registration proceeds
6. After successful registration, invite marked as used

### Acceptance Criteria
- [x] Invite field shown when using external homeserver
- [x] Field hidden for configured homeserver users
- [x] Form validates invite code before submission
- [x] Can successfully register with valid invite (API ready)
- [x] Clear error for invalid invite codes
- [x] Build passes without errors
- [x] TypeScript passes (for new files)

### Notes
- Pre-existing TypeScript errors in other files (not related to this change)
- Invite codes use format: `inv_{timestamp}_{random}` (e.g., inv_1739832456789_abc123def)
- Invites are stored in `.data/invites.json` for server-side access
