# Authentication Epic Breakdown

**Epic:** clawd-89g - Authentication System  
**Total Points:** 18  
**Created:** 2026-03-01  

---

## User Stories Summary

| Story ID | Title | Points | Priority | Tasks | Status |
|----------|-------|--------|----------|-------|--------|
| BDV2-US-1.1 | User Login | 5 | P0 | 4 | In Progress (CSRF fix needed) |
| clawd-38a | Session Management | 3 | P0 | 3 | Open |
| clawd-eb1 | User Logout | 2 | P0 | 3 | Open |
| clawd-avn | Protected Route Redirect | 2 | P0 | 4 | Open |
| clawd-r0y | Rate Limiting | 3 | P1 | 4 | Open |
| clawd-2we | Change Password | 3 | P2 | 4 | Open |

---

## Detailed Breakdown

### US-1.1: User Login (5 pts) - P0

> As Aaron, I want to log in with a username and password so that I can access my video projects securely.

**Existing Tasks:**
| ID | Task | Status |
|----|------|--------|
| clawd-6pb | NextAuth.js Setup & Configuration | blocked |
| clawd-c3n | Login Page UI Components | ✅ closed |
| clawd-cxe | Authentication Logic & Error Handling | needs-fix |
| clawd-ebr | Playwright E2E Tests | blocked |

**Blocking Issue:** `clawd-zsk` - CSRF Configuration Fix (must resolve first)

---

### US-1.2: Session Management (3 pts) - P0

> As a logged-in user, I want my session to persist so that I don't have to log in repeatedly.

**Tasks:**
| ID | Task | Dependencies |
|----|------|--------------|
| clawd-0tn | Session Configuration | - |
| clawd-2zh | Session Provider Integration | clawd-0tn |
| clawd-udd | Session Tests | clawd-0tn, clawd-2zh |

**Acceptance Criteria:**
- Session persists across page refresh
- Session persists when opening new tab
- Session expires after 24 hours of inactivity
- Session refreshes on activity (sliding window)
- httpOnly, secure, sameSite cookies used

---

### US-1.3: User Logout (2 pts) - P0

> As a logged-in user, I want to log out so that I can secure my session when I'm done.

**Tasks:**
| ID | Task | Dependencies |
|----|------|--------------|
| clawd-4io | Logout Button & Navigation | - |
| clawd-nu1 | Logout Logic Implementation | clawd-4io |
| clawd-x3z | Logout E2E Tests | clawd-4io, clawd-nu1 |

**Acceptance Criteria:**
- Sign Out button in navigation
- Session cookie invalidated on logout
- Redirect to /login with confirmation message
- Cannot access protected pages after logout
- Works from any page

---

### US-1.4: Protected Route Redirect (2 pts) - P0

> As an unauthenticated user, I want to be redirected to login when accessing protected pages.

**Tasks:**
| ID | Task | Dependencies |
|----|------|--------------|
| clawd-dta | NextAuth Middleware Configuration | - |
| clawd-bwl | Callback URL Handling | clawd-dta |
| clawd-ata | API Route Protection | clawd-dta |
| clawd-fg2 | Protected Routes E2E Tests | all above |

**Acceptance Criteria:**
- Unauthenticated /projects access → redirect to /login
- Original URL preserved as callbackUrl
- After login, redirect back to original URL
- Protected API returns 401 Unauthorized

---

### US-1.5: Rate Limiting (3 pts) - P1

> As the system, I want to rate limit login attempts to prevent brute force attacks.

**Tasks:**
| ID | Task | Dependencies |
|----|------|--------------|
| clawd-ehb | Rate Limiter Implementation | - |
| clawd-qn7 | Rate Limiter Integration | clawd-ehb |
| clawd-4lu | Rate Limit UI Feedback | clawd-qn7 |
| clawd-atn | Rate Limiting Tests | all above |

**Acceptance Criteria:**
- Allow up to 4 failed attempts
- Block after 5 failed attempts within 1 minute
- Show "Too many attempts" message
- Return 429 for API requests during cooldown
- Reset after 1 minute cooldown

---

### US-1.6: Change Password (3 pts) - P2

> As a logged-in user, I want to change my password to maintain security.

**Tasks:**
| ID | Task | Dependencies |
|----|------|--------------|
| clawd-3cu | Settings Page & Change Password Form | - |
| clawd-z68 | Change Password API | clawd-3cu |
| clawd-5ol | Change Password Form Logic | clawd-3cu, clawd-z68 |
| clawd-xd0 | Change Password Tests | all above |

**Acceptance Criteria:**
- Change password form on settings page
- Verify current password first
- New password + confirmation must match
- Minimum 8 character requirement
- Success message after change
- Can login with new password

---

## Execution Order (Recommended)

### Phase 1: Core Auth (P0) - 12 pts

1. **Fix CSRF Issues** (clawd-zsk) ← BLOCKING
2. **Complete US-1.1** (User Login) - existing tasks
3. **US-1.2** (Session Management)
4. **US-1.3** (User Logout)
5. **US-1.4** (Protected Routes)

### Phase 2: Security Hardening (P1) - 3 pts

6. **US-1.5** (Rate Limiting)

### Phase 3: User Management (P2) - 3 pts

7. **US-1.6** (Change Password)

---

## Dependencies Graph

```
clawd-zsk (CSRF Fix)
    └── clawd-6pb (NextAuth Setup)
        └── clawd-cxe (Auth Logic)
            └── clawd-ebr (E2E Tests)

US-1.2 (Session)
    ├── ST-1.2.A (Config)
    │   └── ST-1.2.B (Provider)
    │       └── ST-1.2.C (Tests)

US-1.3 (Logout)
    ├── ST-1.3.A (Button)
    │   └── ST-1.3.B (Logic)
    │       └── ST-1.3.C (Tests)

US-1.4 (Protected Routes)
    ├── ST-1.4.A (Middleware)
    │   ├── ST-1.4.B (Callback)
    │   └── ST-1.4.C (API 401)
    │       └── ST-1.4.D (Tests)

US-1.5 (Rate Limiting)
    ├── ST-1.5.A (Implementation)
    │   └── ST-1.5.B (Integration)
    │       └── ST-1.5.C (UI)
    │           └── ST-1.5.D (Tests)

US-1.6 (Change Password)
    ├── ST-1.6.A (Form UI)
    │   └── ST-1.6.B (API)
    │       └── ST-1.6.C (Logic)
    │           └── ST-1.6.D (Tests)
```

---

## Notes

- **Critical Blocker:** clawd-zsk (CSRF fix) must be resolved before any auth work can proceed
- All tasks must include E2E tests with screenshots at 3 viewports
- TDD approach: write tests first, then implement
- Model assignment: Sonnet for all implementation tasks
