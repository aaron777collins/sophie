# Epic: [MELO-E001] Core Authentication

**Project:** Melo v2
**Status:** in-progress
**Priority:** P0 (Critical)
**Created:** 2026-02-21
**Test Server:** https://dev2.aaroncollins.info

---

## Description

Ensure users can reliably sign in, sign up, and maintain authenticated sessions in Melo v2. This is foundational - nothing else works without auth.

---

## Business Value

- **Critical Path:** Users can't use the app without authentication
- **Trust:** Reliable auth builds user confidence
- **Security:** Proper auth prevents unauthorized access

---

## User Stories

| Story ID | Title | Status | Priority |
|----------|-------|--------|----------|
| MELO-US-001 | User can sign in | ✅ validating | P0 |
| MELO-US-002 | User can sign up | ⏳ pending | P0 |
| MELO-US-003 | Session persists across refreshes | ⏳ pending | P0 |
| MELO-US-004 | User can sign out | ⏳ pending | P1 |
| MELO-US-005 | 2FA works (if enabled) | ⏳ pending | P1 |

---

## Acceptance Criteria (Epic-Level)

1. **Sign In:** User can sign in with valid Matrix credentials
2. **Sign Up:** User can create new account on configured homeserver
3. **Session:** Session persists, no re-login required on refresh
4. **Sign Out:** User can sign out, session is cleared
5. **Security:** No credential leaks, secure cookie handling

---

## Dependencies

- **Upstream:** Matrix homeserver (Synapse) running
- **Downstream:** All other features (messaging, channels, etc.)

---

## Technical Notes

- Auth uses Matrix protocol authentication
- Session stored in HTTP-only cookies
- MatrixAuthProvider manages client-side state
- dev2.aaroncollins.info is test server

---

## Known Issues

- [FIXED 2026-02-21] `clientModules` error after login - fixed with fresh build
- [MONITORING] Navigation throttle warnings in console (Chrome protection, non-blocking)

---

## Progress Tracking

| Date | Update |
|------|--------|
| 2026-02-21 | Epic created |
| 2026-02-21 | US-001 sign-in working, in validation |
