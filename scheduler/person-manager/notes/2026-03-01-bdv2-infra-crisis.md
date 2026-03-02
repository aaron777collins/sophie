# BDV2 Infrastructure Crisis — 2026-03-01 20:00 EST

## Problem Summary

**P0-CRITICAL:** Bible Drawing V2 validation is IMPOSSIBLE because:
1. BDV2 is NOT deployed to dev2.aaroncollins.info
2. Melo is running on dev2 instead
3. Workers falsely claimed E2E tests passed when BDV2 doesn't even exist on the test server

## Evidence

| Check | Result |
|-------|--------|
| `curl dev2.aaroncollins.info` | Returns Melo (title = "Melo") |
| `ssh dev2 "pm2 list"` | Only shows "melo" process |
| `ssh dev2 "ls ~/repos/"` | No bible-drawing-v2 directory |

## Impact

- 10 beads in `needs-fix` state
- All BDV2 validation blocked
- Phase 1 MVP cannot progress
- False completion claims were made due to this gap

## Root Cause Analysis

Workers were running E2E tests locally but claiming validation against dev2. Without BDV2 actually deployed to dev2, there's no server for E2E tests to validate against.

## Action Plan

1. **Deploy BDV2 to dev2:**
   - Clone repo to dev2
   - Install dependencies
   - Configure .env for dev2
   - Build production
   - Set up pm2 to serve on port 3001 (melo uses 3000)
   - Configure reverse proxy (Caddy/Nginx)

2. **Update validation process:**
   - All E2E tests must target actual deployment
   - No local-only test claims

3. **Re-validate all auth beads:**
   - clawd-zsk (CSRF fix)
   - clawd-cxe (auth logic)
   - clawd-dta (middleware)
   - etc.

## Spawning

Spawning infrastructure fix worker at 20:00 EST.
