# MELO v2 Security & Testing Overhaul — Task Queue

> **Last Updated:** 2026-02-17 18:15 EST  
> **Updated By:** Sophie (Opus) — Status verification pass
> **Priority:** 🔴 CRITICAL — Aaron's Direct Order

---

## ⚠️ AARON'S CLARIFIED REQUIREMENTS (READ THIS FIRST)

> "Privacy and E2EE should be the DEFAULT... Invite only by default... E2EE shouldn't even be allowed to be disabled it should just come fully packaged in"

**THE CORRECT MODEL:**
| Setting | Default State | Override |
|---------|---------------|----------|
| Private Mode | **ON** (no env var needed) | `MELO_PUBLIC_MODE=true` to disable |
| Invite-Only | **ON** (in private mode) | Cannot disable in private mode |
| E2EE | **ALWAYS ON** | **NO OVERRIDE — It's the architecture** |

**WRONG (Do NOT do this):**
- ❌ `MELO_PRIVATE_MODE=true` — Private IS the default, shouldn't need to enable it
- ❌ `MELO_FORCE_E2EE=true` — E2EE is mandatory, no force option
- ❌ `MELO_INVITE_ONLY=false` — Invite-only IS default in private mode
- ❌ Any UI toggle for encryption

**RIGHT:**
- ✅ Default = Private + Invite-Only + E2EE (no config needed)
- ✅ `MELO_PUBLIC_MODE=true` = Explicit opt-in to chaos
- ✅ E2EE is baked in — every room creation includes encryption event

---

## Active Tasks (P0 — ALL PARALLEL)

### melo-login-fix (Track 1)
- **Status:** 🔄 in-progress
- **Priority:** P0 — CRITICAL
- **Model:** Sonnet
- **Description:** Debug and fix "breaks after logging in" issue

#### 📋 Acceptance Criteria (MANDATORY)
- [ ] Login completes without JavaScript errors
- [ ] Matrix client initializes successfully
- [ ] Matrix sync completes
- [ ] User can navigate to home/rooms after login
- [ ] Session persists across page refresh
- [ ] Build passes: `pnpm build`
- [ ] Regression test written and passes

#### 📁 Key Files to Investigate
- `components/providers/matrix-provider.tsx` — Client init sequence
- `lib/matrix/client.ts` — Crypto init (MUST be before sync)
- `components/providers/matrix-auth-provider.tsx` — Session validation

---

### melo-private-mode (Track 2)
- **Status:** ✅ COMPLETE  
- **Priority:** P0 — CRITICAL
- **Model:** Sonnet
- **Completed:** 2026-02-17 17:15 EST
- **Commits:** `3567be6`, `892b516`
- **Description:** Private mode + invite-only AS THE DEFAULT

#### ✅ IMPLEMENTATION COMPLETE
- `lib/matrix/access-control.ts` — Full access control module
- Login route validates homeserver BEFORE Matrix auth
- Sign-in page hides homeserver input in private mode
- "Private Server" badge displayed
- Secure by default: Private mode ON unless `MELO_PUBLIC_MODE=true`

#### ⚠️ CRITICAL: GET THE DEFAULTS RIGHT

**The access control logic must be:**
```typescript
// lib/matrix/access-control.ts

export function getAccessControlConfig() {
  // PUBLIC MODE is the opt-in exception, not private mode
  const publicMode = process.env.MELO_PUBLIC_MODE === 'true';
  
  return {
    // Private mode is DEFAULT (on unless public mode explicitly enabled)
    privateMode: !publicMode,
    // In private mode, only allow the configured homeserver
    allowedHomeserver: process.env.NEXT_PUBLIC_MATRIX_HOMESERVER_URL || null,
    // Invite-only is DEFAULT in private mode (cannot be disabled)
    inviteOnly: !publicMode,
  };
}

export function isLoginAllowed(homeserverUrl: string): { allowed: boolean; reason?: string; code?: string } {
  const config = getAccessControlConfig();
  
  // Public mode = allow anyone (chaos mode)
  if (!config.privateMode) {
    return { allowed: true };
  }
  
  // Private mode = only configured homeserver
  if (!config.allowedHomeserver) {
    // No homeserver configured, but private mode on = only local works
    return { allowed: true };
  }
  
  const normalizedInput = homeserverUrl.replace(/\/$/, '').toLowerCase();
  const normalizedAllowed = config.allowedHomeserver.replace(/\/$/, '').toLowerCase();
  
  if (normalizedInput !== normalizedAllowed) {
    return { 
      allowed: false,
      code: 'M_FORBIDDEN',
      reason: 'This is a private server. External accounts require an invitation from a server admin.'
    };
  }
  
  return { allowed: true };
}
```

#### 📋 Acceptance Criteria (MANDATORY)
- [ ] **DEFAULT behavior (no env vars):** Private mode ON, external users rejected
- [ ] `MELO_PUBLIC_MODE=true` is the ONLY way to allow external users freely
- [ ] Homeserver input HIDDEN on sign-in (uses configured homeserver)
- [ ] Clear error: "External accounts require an invitation from a server admin"
- [ ] Build passes: `pnpm build`
- [ ] Tests written FIRST (TDD)

#### 📁 Files to Create/Modify
```
NEW:    lib/matrix/access-control.ts
MODIFY: app/api/auth/login/route.ts
MODIFY: app/(auth)/(routes)/sign-in/[[...sign-in]]/page.tsx
MODIFY: .env.example (add MELO_PUBLIC_MODE only)
NEW:    tests/e2e/auth/private-mode.spec.ts
```

#### Environment Variables (.env.example)
```bash
# Access Control
# By DEFAULT: Private mode ON, Invite-only ON
# Only set this to enable public mode (allow anyone):
# MELO_PUBLIC_MODE=true
```

---

### melo-e2ee-mandatory (Track 3 — NOW P0, NOT P1)
- **Status:** ✅ COMPLETE
- **Priority:** P0 — CRITICAL (promoted from P1)
- **Model:** Sonnet
- **Completed:** 2026-02-17 17:50 EST
- **Commit:** `e87c08e`
- **Description:** E2EE is MANDATORY — baked into architecture, no toggles

#### ⚠️ CRITICAL: E2EE IS NOT OPTIONAL

**There is no `MELO_FORCE_E2EE` because E2EE cannot be disabled.**

Every room creation MUST include:
```typescript
{
  type: "m.room.encryption",
  state_key: "",
  content: { algorithm: "m.megolm.v1.aes-sha2" }
}
```

#### 📋 Acceptance Criteria (MANDATORY)
- [ ] **REMOVE** all `encrypted: false` from `lib/matrix/server-templates.ts`
- [ ] **ADD** encryption event to space creation in `components/modals/initial-modal.tsx`
- [ ] **ADD** encryption event to channel creation in `components/modals/initial-modal.tsx`
- [ ] **ADD** encryption event to DM creation in conversations page
- [ ] **NO** UI toggle for encryption anywhere
- [ ] **NO** `MELO_FORCE_E2EE` env var (it's not configurable)
- [ ] Build passes: `pnpm build`
- [ ] Tests verify ALL new rooms are encrypted

#### 📁 Files to Modify
```
MODIFY: lib/matrix/server-templates.ts — Remove ALL encrypted: false
MODIFY: components/modals/initial-modal.tsx — Add encryption events
MODIFY: app/(main)/(routes)/servers/[serverId]/conversations/[memberId]/page.tsx — Add encryption
NEW:    tests/e2e/security/e2ee-mandatory.spec.ts
```

#### Implementation in initial-modal.tsx
```typescript
// Add to initialState array for space creation:
{
  type: "m.room.encryption",
  state_key: "",
  content: { algorithm: "m.megolm.v1.aes-sha2" }
}

// Add to channel creation:
initial_state: [
  {
    type: "m.room.encryption",
    state_key: "",
    content: { algorithm: "m.megolm.v1.aes-sha2" }
  },
  // ... other state events
]
```

---

### melo-playwright-tests (Track 4)
- **Status:** ✅ COMPLETE  
- **Priority:** P0 — CRITICAL
- **Model:** Sonnet
- **Completed:** 2026-02-17 17:10 EST
- **Commit:** `892b516`
- **Description:** TDD — Write tests FIRST, then validate implementation

#### ✅ TESTS CREATED
- `tests/e2e/auth/private-mode.spec.ts` — Private mode enforcement
- `tests/e2e/critical/post-login.spec.ts` — Post-login validation  
- `tests/e2e/security/e2ee.spec.ts` — E2EE verification

#### ⚠️ CRITICAL: TDD APPROACH

**Write failing tests first, then make them pass.**

#### 📋 Acceptance Criteria (MANDATORY)
- [ ] Post-login validation tests
- [ ] Private mode DEFAULT tests (verify private without env vars)
- [ ] E2EE mandatory tests (verify ALL rooms encrypted)
- [ ] Full flow tests (login → create → message)
- [ ] All tests pass
- [ ] Build passes

#### Test Cases Required

**tests/e2e/auth/private-mode.spec.ts:**
```typescript
test.describe('Private Mode (DEFAULT)', () => {
  test('should reject external homeserver by DEFAULT (no env vars)', async ({ page }) => {
    // With NO env vars set, external users should be rejected
  });

  test('should hide homeserver input by DEFAULT', async ({ page }) => {
    // Homeserver input should not be visible
  });

  test('should show clear error for external login attempts', async ({ page }) => {
    // Error should mention invitation required
  });
});
```

**tests/e2e/security/e2ee-mandatory.spec.ts:**
```typescript
test.describe('E2EE Mandatory', () => {
  test('new server should be encrypted by default', async ({ page }) => {
    // Create server, verify encryption shield
  });

  test('new DM should be encrypted by default', async ({ page }) => {
    // Start DM, verify encryption shield
  });

  test('no option to disable encryption in UI', async ({ page }) => {
    // Verify no toggle/checkbox for encryption
  });
});
```

---

### melo-admin-invites (Track 5)
- **Status:** 🔄 in-progress
- **Priority:** P0 — CRITICAL (promoted — needed for invite-only)
- **Model:** Sonnet
- **Description:** Admin invite system for external users in private mode

#### 📋 Acceptance Criteria (MANDATORY)
- [ ] `lib/matrix/admin-invites.ts` — Token generation and validation
- [ ] `app/api/admin/invites/route.ts` — API endpoints
- [ ] Invited users can login despite private mode
- [ ] Invites can be revoked
- [ ] Invites expire
- [ ] Tests pass

---

## Task Status Summary

| Task | Priority | Status | TDD |
|------|----------|--------|-----|
| melo-login-fix | P0 | 🔄 in-progress | Write regression test |
| melo-private-mode | P0 | ✅ COMPLETE | Tests first |
| melo-e2ee-mandatory | P0 | ✅ COMPLETE | Tests first |
| melo-playwright-tests | P0 | ✅ COMPLETE | This IS the tests |
| melo-admin-invites | P0 | 🔄 in-progress | Tests first |

**All tracks are P0. E2EE and Admin Invites are NOT P1 anymore.**

---

## Worker Slots

| Slot | Task | Model |
|------|------|-------|
| 1 | melo-login-fix | Sonnet |
| 2 | melo-private-mode | Sonnet |
| 3 | melo-e2ee-mandatory | Sonnet |
| 4 | melo-playwright-tests | Sonnet |
| 5 | melo-admin-invites | Sonnet |

---

## Quick Reference

```bash
cd /home/ubuntu/repos/melo
pnpm build                    # Must pass
npx playwright test           # Must pass
```

**Audit:** `/home/ubuntu/repos/melo/MELO-V2-COMPREHENSIVE-AUDIT.md`
