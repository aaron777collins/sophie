# Epic: [MELO-E002] Production Stability

**Project:** Melo v2
**Status:** in-progress
**Priority:** P0 (Critical)
**Created:** 2026-02-21
**Test Server:** https://dev2.aaroncollins.info

---

## Description

Ensure Melo v2 is stable, builds reliably, and runs without errors in production. Fix recurring build issues and ensure reliable deployments.

---

## Business Value

- **Reliability:** App must work consistently
- **Deployability:** Builds must succeed, deployments must be smooth
- **User Trust:** No random errors or crashes

---

## User Stories

| Story ID | Title | Status | Priority |
|----------|-------|--------|----------|
| MELO-US-010 | Production build succeeds | ✅ fixed | P0 |
| MELO-US-011 | No console errors after login | 🔄 validating | P0 |
| MELO-US-012 | App performs well | ⏳ pending | P1 |
| MELO-US-013 | Error boundaries catch crashes | ⏳ pending | P1 |

---

## Acceptance Criteria (Epic-Level)

1. **Build:** `pnpm build` succeeds without errors
2. **Runtime:** No JavaScript errors in browser console during normal use
3. **Server:** No exceptions in pm2 logs during normal use
4. **Performance:** Pages load in <3s, no UI freezes
5. **Recovery:** Errors don't crash app, graceful fallbacks exist

---

## Dependencies

- **Upstream:** Codebase, Next.js, Matrix SDK
- **Downstream:** All features depend on stable base

---

## Technical Notes

- Next.js 14.2.35 with App Router
- pm2 for process management on dev2
- Build cache issues have caused problems - nuclear clean fixes
- MatrixAuthProvider infinite re-render was an issue (fixed)

---

## Known Issues (Resolved)

| Issue | Status | Fix |
|-------|--------|-----|
| `clientModules` error | ✅ FIXED | Nuclear clean build |
| Infinite re-render | ✅ FIXED | Added initialization guard |
| PWA manifest hang | ✅ FIXED | Removed manifest generation |
| Debug logging spam | ✅ FIXED | Removed verbose logs |

---

## Progress Tracking

| Date | Update |
|------|--------|
| 2026-02-21 | Epic created |
| 2026-02-21 | US-010 fixed (nuclear clean build) |
| 2026-02-21 | US-011 in validation (need Aaron to confirm) |
