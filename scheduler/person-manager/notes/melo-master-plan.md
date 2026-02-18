# MELO Master Plan - Full Audit Results
**Created:** 2026-02-17
**Author:** Sub-agent (commissioned by Aaron via Person Manager)
**Purpose:** Comprehensive audit and production-readiness roadmap

---

## Executive Summary

Aaron requested a deep audit of MELO's actual state. **The invite system is NOT done.** It's backend scaffolding with NO UI. The previous reports were optimistic - this audit goes deep.

---

## Part 1: E2E Test Results

**Ran:** `npx playwright test` against dev2.aaroncollins.info

| Category | Count |
|----------|-------|
| ✅ Passed | 16 |
| ❌ Failed | 8 |
| ⏭️ Skipped | 11 |
| 🚫 Didn't Run | 258 |

### Failed Tests:
1. `authenticate` (setup) - Auth setup failing
2. `should show private server badge by DEFAULT` - Timeout (12.5s)
3. `should have all required login form elements` - Timeout (12.5s)
4. `should show validation errors for empty fields` - Timeout (17.5s)
5. `should show error message container on failed login` - Timeout (17.4s)
6. `should include invite-required message in error response` - Message mismatch
7. `should show error for empty username` - Timeout
8. `should show error for empty password` - Timeout

**Root Causes:**
- Tests expect form validation to prevent submission, but form submits anyway
- Timeouts on hydration/waiting for elements
- Private mode invite message differs from expected

---

## Part 2: Invite System Deep Audit

### ✅ DONE: Backend Infrastructure

| Component | Status | Location |
|-----------|--------|----------|
| Admin Invite Types | ✅ | `lib/matrix/admin-invites.ts` |
| Create Invite API | ✅ | `app/api/admin/invites/route.ts` POST |
| List Invites API | ✅ | `app/api/admin/invites/route.ts` GET |
| Revoke Invite API | ✅ | `app/api/admin/invites/route.ts` DELETE |
| Invite Validation | ✅ | `checkUserHasValidInvite()` |
| Mark Used | ✅ | `markInviteUsed()` |
| Access Control | ✅ | `lib/matrix/access-control.ts` |
| Storage | ✅ | Matrix account data (`im.melo.admin_invites`) |

### ❌ MISSING: Critical Components

| Component | Status | Impact |
|-----------|--------|--------|
| **Admin UI for Invites** | ❌ MISSING | Admins cannot create/manage invites |
| **Sign-Up Private Mode** | ❌ MISSING | Sign-up ignores private mode entirely |
| **Login + Invite Integration** | ❌ MISSING | External users with invites can't login |
| **Invite Code Entry UI** | ❌ MISSING | No way for invited users to enter code |

### Detailed Analysis

#### 1. Admin Invite UI - COMPLETELY MISSING
**Current State:** The `components/admin/` folder contains only JOB QUEUE components (for background tasks), NOT invite management.

**What Exists:**
```
components/admin/
├── create-job-dialog.tsx    # For job queue
├── job-details.tsx          # For job queue
├── job-list.tsx             # For job queue
├── job-queue-dashboard.tsx  # For job queue
├── job-stats.tsx            # For job queue
└── worker-list.tsx          # For job queue
```

**What's Missing:**
```
components/admin/
├── admin-invites-page.tsx    # MISSING - Main admin invites UI
├── create-invite-modal.tsx   # MISSING - Create new invite
├── invite-list.tsx           # MISSING - List invites with revoke
└── invite-stats.tsx          # MISSING - Invite analytics
```

**Impact:** Even though the API exists, there's NO way for admins to actually create invites.

#### 2. Sign-Up Page - Ignores Private Mode
**File:** `app/(auth)/(routes)/sign-up/[[...sign-up]]/page.tsx`

**Problems:**
- Always shows homeserver input (should be hidden/locked in private mode)
- No private mode badge
- No invite code input
- Doesn't validate against allowed homeserver
- Allows registration attempts on any homeserver

**Expected Behavior in Private Mode:**
1. Show "Private Server" badge
2. Lock homeserver to configured value
3. Show invite code input for external users
4. Validate invite before allowing registration

#### 3. Login + Invite Integration - NOT WIRED UP
**File:** `lib/matrix/access-control.ts`

**Current Flow:**
```
User attempts login
  → isLoginAllowed(homeserverUrl)  // Only checks homeserver match
  → If external homeserver, REJECT
```

**Required Flow:**
```
User attempts login
  → isLoginAllowedWithInvite(homeserverUrl, userId)  // Check homeserver + invite
  → If external homeserver but has valid invite, ALLOW
  → If external without invite, REJECT with "invite required" message
```

The `isLoginAllowedWithInvite()` function EXISTS but is NOT CALLED in the login flow!

#### 4. Room Invites vs Admin Invites
Two completely separate systems:

| System | Purpose | Has UI? |
|--------|---------|---------|
| **Room Invites** | Invite users to Matrix rooms | ✅ YES |
| **Admin Invites** | Allow external users in private mode | ❌ NO |

The invite page at `app/(invite)/...` is for ROOM invites, not admin invites.

---

## Part 3: Homeserver URL Feature Analysis

### Current Implementation

**Sign-In Page:** ✅ Partially Correct
```typescript
// app/(auth)/(routes)/sign-in/.../page.tsx
const config = getClientConfig();
// In private mode, use configured homeserver
homeserver: config.privateMode ? config.allowedHomeserver : "https://matrix.org"
```

**Sign-Up Page:** ❌ BROKEN
```typescript
// app/(auth)/(routes)/sign-up/.../page.tsx
homeserver: "https://matrix.org"  // HARDCODED, ignores private mode
```

### Aaron's Requirements

1. ✅ `NEXT_PUBLIC_MATRIX_HOMESERVER_URL` env var - EXISTS
2. ⚠️ Default homeserver from env - Sign-in only, not sign-up
3. ❌ Easy switch to public homeserver - NOT IMPLEMENTED

### Implementation Plan

**Option A: Public Homeserver Toggle**
```tsx
{config.privateMode && (
  <div className="text-center text-sm">
    <span className="text-zinc-500">Need a public account? </span>
    <button 
      onClick={() => setUsePublicHomeserver(true)}
      className="text-indigo-400 hover:underline"
    >
      Use matrix.org instead
    </button>
  </div>
)}
```

**Option B: Env Var Override**
```env
MELO_DEFAULT_HOMESERVER=https://dev2.aaroncollins.info
MELO_ALLOW_PUBLIC_SWITCH=true  # Shows "Use matrix.org" button
```

---

## Part 4: Comprehensive Gap Analysis

### TODOs in Codebase (50+ found)

**Critical:**
| Location | TODO | Impact |
|----------|------|--------|
| `lib/matrix/cookies.ts:11` | Add encryption layer to session data | Security |
| `lib/matrix/notifications.ts:320` | Send email for offline users | Feature gap |
| `lib/matrix/privacy.ts:264` | Implement friend checking | Privacy feature broken |

**Moderate:**
| Location | TODO | Impact |
|----------|------|--------|
| `components/chat/chat-item.tsx:366` | Get homeserver from context | UX |
| `components/settings/server-settings.tsx:139` | Matrix power level updates | Admin feature |
| `components/voice/voice-member-list.tsx:92` | Get avatar from Matrix | UI incomplete |

**Low:**
| Location | TODO |
|----------|------|
| `hooks/use-spaces.ts:157` | Implement categories |
| `components/pinned-messages.tsx:84` | Message navigation |

### Stubbed/Mock Functions

| File | Function | Status |
|------|----------|--------|
| `lib/jobs/handlers/matrix.ts:48-71` | Room cleanup, archiving | Stubbed |
| `lib/jobs/handlers/file-processing.ts:214` | Antivirus scanner | Stubbed |
| `lib/jobs/handlers/file-processing.ts:338-410` | Media processing | Stubbed |
| `components/privacy/user-search-block.tsx` | `mockSearchUsers()` | Mock |

### UI Flow Gaps

#### Sign-Up Flow (Private Mode)
| Step | Expected | Actual |
|------|----------|--------|
| 1. Visit /sign-up | See private badge | ❌ No badge |
| 2. Homeserver field | Locked to configured | ❌ Editable, defaults matrix.org |
| 3. Enter invite code | Invite input shown | ❌ No invite input |
| 4. Submit | Validate invite | ❌ No validation |

#### Login Flow (External User with Invite)
| Step | Expected | Actual |
|------|----------|--------|
| 1. Enter external homeserver | Accept if invite exists | ❌ Always rejects |
| 2. Check invite | Call `isLoginAllowedWithInvite()` | ❌ Not called |
| 3. Mark invite used | On successful login | ❌ Never happens |

---

## Part 5: Master Task List

### P0 - Blockers (Cannot Deploy Without)

| ID | Task | Complexity | Estimate |
|----|------|------------|----------|
| **P0-1** | Create Admin Invites UI page | Medium | 4-6h |
| **P0-2** | Create Invite Modal component | Medium | 2-3h |
| **P0-3** | Wire `isLoginAllowedWithInvite()` into login flow | Low | 1-2h |
| **P0-4** | Add invite code input to sign-up page | Medium | 2-3h |
| **P0-5** | Fix sign-up page private mode handling | Low | 1-2h |
| **P0-6** | Fix failing E2E tests | Medium | 3-4h |

### P1 - Important (Production Quality)

| ID | Task | Complexity | Estimate |
|----|------|------------|----------|
| **P1-1** | Homeserver URL env var for sign-up | Low | 1h |
| **P1-2** | "Use matrix.org" toggle button | Low | 1h |
| **P1-3** | Session storage security (remove password) | Medium | 2h |
| **P1-4** | Fix 2FA test skipping | Medium | 2h |
| **P1-5** | Email notifications for offline users | High | 4-6h |
| **P1-6** | Friend checking implementation | Medium | 3h |

### P2 - Nice-to-Have (Polish)

| ID | Task | Complexity | Estimate |
|----|------|------------|----------|
| **P2-1** | Improve validation error messages | Low | 1h |
| **P2-2** | Private mode badge styling | Low | 30m |
| **P2-3** | User search (replace mock) | Medium | 2h |
| **P2-4** | Voice member avatars | Low | 1h |
| **P2-5** | Pinned message navigation | Low | 1h |

---

## Part 6: Phase 1 Implementation Details

### P0-1: Admin Invites UI Page

**Create:** `app/(main)/(routes)/admin/invites/page.tsx`

```tsx
// Key features:
// 1. List all invites with status (active, used, expired)
// 2. Create new invite button → opens modal
// 3. Revoke invite button
// 4. Show invite statistics
// 5. Restrict to admin users
```

**Route:** `/admin/invites`

### P0-2: Create Invite Modal

**Create:** `components/admin/create-invite-modal.tsx`

```tsx
// Features:
// - Matrix user ID input (@user:homeserver.com)
// - Expiration dropdown (7d, 14d, 30d, custom)
// - Notes field
// - Submit → POST /api/admin/invites
```

### P0-3: Wire Invite Check into Login

**Modify:** `components/providers/matrix-auth-provider.tsx` or login API

```typescript
// Before login:
const result = await isLoginAllowedWithInvite(homeserver, constructedUserId);
if (!result.allowed) {
  return { error: result.reason };
}
// After successful login:
await markInviteUsed(userId);
```

### P0-4: Sign-Up Invite Code Input

**Modify:** `app/(auth)/(routes)/sign-up/.../page.tsx`

```tsx
// Add to form (only shown in private mode for external homeserver):
{showInviteInput && (
  <div>
    <label>Invite Code (required for external users)</label>
    <input
      type="text"
      placeholder="inv_..."
      value={inviteCode}
      onChange={...}
    />
  </div>
)}
```

### P0-5: Sign-Up Private Mode

**Modify:** `app/(auth)/(routes)/sign-up/.../page.tsx`

```typescript
// Add same getClientConfig() pattern as sign-in page
// Lock homeserver in private mode
// Show private badge
// Add invite code field
```

---

## Part 7: Recommended Execution Order

### Week 1: P0 Blockers
```
Day 1-2: P0-1 + P0-2 (Admin Invites UI)
Day 3: P0-3 (Wire invite check into login)
Day 4: P0-4 + P0-5 (Sign-up fixes)
Day 5: P0-6 (Fix E2E tests)
```

### Week 2: P1 Important
```
Day 1: P1-1 + P1-2 (Homeserver URL features)
Day 2: P1-3 (Security fix)
Day 3: P1-4 (2FA tests)
Day 4-5: P1-5 + P1-6 (Email, friends)
```

### Week 3: P2 Polish
```
As time permits, tackle P2 items
```

---

## Part 8: Verification Criteria

### Admin Invites System Complete When:
- [ ] Admin can access /admin/invites page
- [ ] Admin can create invite for @external-user:other.server
- [ ] Admin can see list of all invites
- [ ] Admin can revoke an invite
- [ ] External user with invite can log in
- [ ] External user without invite gets clear error
- [ ] Invite marked as used after login
- [ ] E2E tests pass for invite flow

### Homeserver URL Feature Complete When:
- [ ] Sign-up defaults to NEXT_PUBLIC_MATRIX_HOMESERVER_URL
- [ ] Sign-up locked in private mode
- [ ] "Use matrix.org" button visible and works
- [ ] E2E tests pass

---

## Appendix A: Files to Create

```
app/(main)/(routes)/admin/invites/
└── page.tsx                           # Admin invites dashboard

components/admin/
├── admin-invites-dashboard.tsx        # Main invites UI
├── create-invite-modal.tsx            # Create invite form
├── invite-list.tsx                    # List of invites
└── invite-stats.tsx                   # Invite analytics
```

## Appendix B: Files to Modify

```
app/(auth)/(routes)/sign-up/.../page.tsx   # Add private mode support
components/providers/matrix-auth-provider.tsx  # Wire invite check
lib/matrix/access-control.ts               # May need minor adjustments
```

---

**This audit is COMPREHENSIVE. The invite system is NOT done - it needs UI work. Aaron's skepticism was warranted.**
