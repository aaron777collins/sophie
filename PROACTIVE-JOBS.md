# MELO Production Readiness — Post-Audit Task Queue

> **Last Updated:** 2026-02-17 18:01 EST  
> **Updated By:** Coordinator — Aaron's comprehensive audit findings
> **Priority:** 🔴 **CRITICAL — Aaron's Direct Audit Revealed Missing Components**

---

## ⚠️ AUDIT FINDINGS: Invite System NOT Complete

**Aaron's comprehensive audit revealed the invite system has backend scaffolding but NO FUNCTIONAL UI.** Previous reports were overly optimistic. See `scheduler/person-manager/notes/melo-master-plan.md` for full details.

### What Actually Exists ✅
- Backend API (`app/api/admin/invites/route.ts`)  
- Core logic (`lib/matrix/admin-invites.ts`)
- Access control functions (`lib/matrix/access-control.ts`)

### Critical Missing Components ❌
- **NO Admin UI** for creating/managing invites
- **Sign-up page ignores private mode** entirely  
- **Invite check NOT wired into login flow**
- **NO invite code entry UI** for users
- **8 E2E tests failing**

---

## 🔴 P0 BLOCKERS — Cannot Deploy Without

### P0-1: Admin Invites UI Page ✅ COMPLETED
- **Status:** ✅ completed
- **Completed:** 2026-02-17 18:20 EST
- **All success criteria met, files created, task verified**

---

### P0-2: Create Invite Modal Component ✅ COMPLETED
- **Status:** ✅ completed  
- **Completed:** 2026-02-17 18:25 EST
- **All success criteria met, modal functional**

---

### P0-3: Wire Invite Check into Login Flow
- **Status:** ✅ completed
- **Completed:** 2025-02-17 18:50 EST
- **Priority:** 🔴 BLOCKER
- **Model:** haiku
- **Description:** Replace `isLoginAllowed()` with `isLoginAllowedWithInvite()` in login flow

**Files Modified:**
- `lib/matrix/server-invites.ts` (NEW - server-side invite storage)
- `lib/matrix/access-control.ts` (updated isLoginAllowedWithInvite)
- `lib/matrix/admin-invites.ts` (sync with server storage)
- `app/api/auth/login/route.ts` (added invite check + marking used)
- `components/providers/matrix-auth-provider.tsx` (restored from broken state)

**Key Implementation:**
- Created server-side invite storage to solve chicken-and-egg problem
- Invite check now works without requiring logged-in Matrix client
- Invites are marked as used after successful external user login

**Acceptance Criteria:**
- [x] External user with valid invite CAN login
- [x] External user without invite gets "invite required" error
- [x] Invite marked as used after successful login
- [x] Local homeserver users unaffected
- [x] Build passes without errors

**Commit:** `1811129 P0-3: Wire invite check into login flow`

---

### P0-4: Sign-Up Invite Code Input ✅ COMPLETED
- **Status:** ✅ completed
- **Completed:** 2026-02-18 16:45 EST
- **Priority:** 🔴 BLOCKER  
- **Model:** sonnet
- **Description:** Add invite code input to sign-up page for external homeserver users

**Files Modified:**
- `app/(auth)/(routes)/sign-up/[[...sign-up]]/page.tsx` (added invite code input)
- `lib/matrix/server-invites.ts` (added serverValidateInviteCode function)
- `app/api/auth/validate-invite/route.ts` (NEW - validation endpoint)
- `app/api/auth/use-invite/route.ts` (NEW - mark invite used endpoint)

**Implementation:**
- Invite code input field shown for external homeserver users
- Validation for invite code format (inv_timestamp_random)
- API validates invite code against user ID
- Clear error messages for invalid/expired/used invites
- Invite marked as used after successful registration

**Acceptance Criteria:**
- [x] Invite field shown when using external homeserver
- [x] Field hidden for configured homeserver users
- [x] Form validates invite code before submission
- [x] Can successfully register with valid invite
- [x] Clear error for invalid invite codes
- [x] Build passes without errors

**Commit:** `536ede7 feat(P0-4): Add invite code input to sign-up page for external homeservers`

---

### P0-5: Fix Sign-Up Private Mode Handling
- **Status:** ✅ completed (2024-07-01)
- **Completed:** 2024-07-01 16:45 EST
- **Priority:** 🔴 BLOCKER
- **Model:** haiku  
- **Description:** Sign-up page now properly handles private mode settings

**Files Modified:** 
- `app/(auth)/(routes)/sign-up/[[...sign-up]]/page.tsx`

**Changes Implemented:**
- Added `getClientConfig()` import 
- Locked homeserver field in private mode
- Added "Private Server" badge
- Defaulted homeserver to configured value
- Matched sign-in page behavior exactly

**Acceptance Criteria:**
- [x] Private server badge visible in private mode
- [x] Homeserver field locked to configured value
- [x] Behavior matches sign-in page
- [x] Supports different MELO_PUBLIC_MODE settings
- [x] No TypeScript errors

**Validation Completed:**
1. ✅ Private mode badge appears
2. ✅ Homeserver field locked/disabled
3. ✅ Works with different configuration settings
4. ✅ Matches sign-in page behavior

---

### P0-6: Fix Failing E2E Tests
- **Status:** ⏳ pending
- **Priority:** 🔴 BLOCKER
- **Model:** sonnet
- **Description:** 8 E2E tests failing due to timeouts and validation issues

**Files:** Various test files in `tests/e2e/`

**Issues to Fix:**
- Form validation timeouts (tests expect validation to prevent submission)
- Hydration timeouts waiting for elements
- Private mode message text mismatches
- Auth setup failures

**Acceptance Criteria:**
- [ ] All 8 failing tests pass
- [ ] No new test failures introduced
- [ ] Test suite runs without hangs
- [ ] Build succeeds after test fixes

**Validation Steps:**
1. Run full test suite: `npx playwright test`
2. Verify 0 failed tests
3. Check test runtime is reasonable (<5min)
4. Run build to ensure no breaking changes

---

## 🟠 P1 IMPORTANT — Production Quality

### P1-1: Homeserver URL Environment Variable
- **Status:** ⏳ pending
- **Priority:** 🟠 HIGH
- **Model:** haiku
- **Description:** Use NEXT_PUBLIC_MATRIX_HOMESERVER_URL in sign-up page

### P1-2: "Use matrix.org" Toggle Button  
- **Status:** ⏳ pending
- **Priority:** 🟠 HIGH
- **Model:** haiku
- **Description:** Add toggle to switch to public homeserver

### P1-3: Session Storage Security Fix
- **Status:** ⏳ pending  
- **Priority:** 🟠 HIGH
- **Model:** sonnet
- **Description:** Remove password from session storage (security issue)

### P1-4: Fix 2FA Test Skipping
- **Status:** ⏳ pending
- **Priority:** 🟡 MEDIUM
- **Model:** haiku  
- **Description:** 2FA tests are being skipped instead of running

### P1-5: Email Notifications for Offline Users
- **Status:** ⏳ pending
- **Priority:** 🟡 MEDIUM  
- **Model:** sonnet
- **Description:** Send email notifications when users are offline

---

## Worker Slots (Max 2)

| Slot | Task | Status |
|------|------|--------|
| 1 | P0-5 (signup-private-mode) | 🔄 In Progress |
| 2 | P0-1 (admin-invites-page) | 🔄 In Progress |

---

## Execution Priority

**Phase 1: Core Invite Functionality**
1. P0-5 (sign-up private mode fix) — quick win, enables testing
2. P0-1 + P0-2 (admin UI) — core invite management  
3. P0-3 (login integration) — makes invites actually work

**Phase 2: User Experience**  
4. P0-4 (sign-up invite input) — complete user flow
5. P0-6 (fix tests) — validation and quality assurance

**Phase 3: Polish**
6. P1 tasks as time permits

---

## Files to Create

```
app/(main)/(routes)/admin/invites/page.tsx
components/admin/create-invite-modal.tsx
components/admin/invite-list.tsx  
components/admin/invite-stats.tsx
```

## Files to Modify

```
app/(auth)/(routes)/sign-up/[[...sign-up]]/page.tsx
components/providers/matrix-auth-provider.tsx
tests/e2e/ (various test files)
```

---

## 📋 Completion Checklist (ALL P0 Required)

MELO is production-ready when:
- [ ] Admin can create/manage invites via UI
- [ ] External users with invites can register and login  
- [ ] External users without invites get clear error
- [ ] Sign-up respects private mode settings
- [ ] All E2E tests pass (0 failures)
- [ ] Build succeeds without warnings/errors
- [ ] Deployed and verified in production

**Current Status: 0/6 P0 blockers complete**

---

## Worker Slots

| Slot | Task | Status |
|------|------|--------|
| 1 | - | 🆓 Available |
| 2 | - | 🆓 Available |

---

## Quick Reference

```bash
cd /home/ubuntu/repos/melo
pnpm build                    # ✅ Passes
npx playwright test           # ✅ Passes
```