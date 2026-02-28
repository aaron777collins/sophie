# Testing Methodology Fix — 2026-02-28

## The Problem

**[2026-02-28 11:34 EST]** Validator identified a critical systemic failure:

- **Unit tests:** 100% pass rate
- **E2E tests:** 92% FAIL rate
- **Gap:** Massive disconnect between unit tests and actual UI functionality

Workers were running `pnpm test` (unit tests) and claiming complete, but never running `pnpm test:e2e` (E2E tests). This created **dangerous false confidence** — features appeared to work based on unit tests but were completely broken in the actual UI.

## Root Cause

The protocols mentioned E2E tests but didn't **mandate** them at Layer 1 (worker self-validation). Workers could claim `needs-validation` with only unit test evidence. The E2E failures were only caught at L3 (Validator) — too late in the pipeline.

## The Fix

Aaron directed: *"Implementers should be running ALL tests including E2E before saying it's complete. They should not consider anything done without ALL tests passing + screenshots via playwright."*

### Changes Made (commit f965fde)

1. **AGENTS.md** — Added mandatory E2E testing section, updated 3-layer validation
2. **scheduler/workers/IDENTITY.md** — Workers MUST run `pnpm test:e2e` before claiming complete
3. **scheduler/coordinator/IDENTITY.md** — L2 must run E2E tests and reject if they fail
4. **scheduler/validator/IDENTITY.md** — L3 must verify E2E evidence and run tests independently

### New Rule

```
Unit test success + E2E failure = NOT COMPLETE
```

All UI work requires:
1. `pnpm test` — Unit tests (PASS)
2. `pnpm test:integration` — Integration tests if exist (PASS)
3. `pnpm test:e2e` — E2E tests (PASS) ← THIS WAS BEING SKIPPED
4. Playwright screenshots at 3 viewports

### Reject Criteria

Workers claiming complete without E2E evidence → REJECT at L2
E2E tests failing → REJECT immediately, send back for fixes
No E2E tests exist for UI work → REJECT, worker must create them

## Lessons Learned

1. **Unit tests give false confidence** — They test implementation, not user experience
2. **E2E is the ground truth** — If it doesn't work in Playwright, it doesn't work
3. **Mandate early, not late** — Catching at L3 is too late; require at L1

## References

- Validator report: `scheduler/validator/notes/validations/ST-P2-04-D.md`
- Aaron's directive: Slack #aibot-chat 2026-02-28 11:34 EST
