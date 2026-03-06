# Coordinator Jobs

**Last Updated:** 2026-03-05 21:00 EST

---

## Active Projects

### Bible Drawing V2 - Auth Implementation Progressing 🟡
**Status:** 🟡 VALIDATION QUEUE - Error selectors fixed, awaiting review
**Priority:** P0-CRITICAL (Auth Epic)
**Last Updated:** 2026-03-05 21:00 EST

**RECENT PROGRESS (21:00 EST):**
- ✅ clawd-7er: Error element selectors FIXED (commit d1450d7)
- ✅ Verification: Commit exists, build passes
- 📬 Sent to Validator for Layer 3 review
- Worker fix: Changed from fixed 2s timeout to waiting for loading state completion

**E2E INFRASTRUCTURE (Previously Fixed):**
- ✅ Zombie Next.js server resolved
- ✅ Playwright CLI script fixed (commit 15c159f)
- ✅ Tests execute and produce output

**VALIDATION QUEUE:**
- clawd-7er: Error element selectors (needs-validation)

**STORY ARCHITECT COMPLETED:**
- ✅ All 6 Authentication User Stories created with detailed ACs
- ✅ 60 acceptance criteria total (10 per story)
- 📁 Location: `~/clawd/scheduler/stories/bible-drawing-v2/stories/`

**REMAINING AUTH WORK:**
- Continue with Session Management story (clawd-1il) after validation

**Repository:** /home/ubuntu/repos/bible-drawing-v2
**Test Server:** https://dev2.aaroncollins.info/bdv2
**Test Credentials:** aaron@example.com/correctpassword

---

### MELO V2 - Maintenance Complete ✅ STABLE
**Status:** 🟢 STABLE - No active issues, monitoring only
**Priority:** P2-MAINTENANCE

**Repository:** /home/ubuntu/repos/melo

---

## Worker Capacity & Status

**Current Workers (0/2 CAPACITY):**
- 🆓 **Slot 1:** Available
- 🆓 **Slot 2:** Available

**Capacity Note:** Limited to 2 concurrent workers due to formal warning (2026-02-20).

---

## Session Accomplishments (21:00 EST)

1. ✅ **Health check passed:** Beads OK, Dolt OK
2. ✅ **Spawned worker:** error-selector-fix for clawd-7er
3. ✅ **Worker completed:** Fixed E2E test timing (commit d1450d7)
   - Issue: Tests used fixed 2s timeout
   - Fix: Now waits for loading state completion
   - Result: 9/9 Chromium tests pass
4. ✅ **Verification completed:** Commit exists, build passes
5. ✅ **Sent to Validator:** clawd-7er in validation queue

---

## Next Actions

1. **Await Validator review** of clawd-7er (error selectors)
2. **Continue Session Management** work (clawd-1il) if validated
3. **Run full E2E suite** after validation completes
4. **Create sub-tasks** for remaining auth stories if needed

---

## Ready Work Queue

**Auth Stories Ready for Sub-Task Breakdown:**
- US-AUTH-01: User Login (5 pts) - Entry point, no dependencies
- US-AUTH-02: Session Management (3 pts) - Requires US-AUTH-01
- US-AUTH-03: User Logout (2 pts) - Requires US-AUTH-02
- US-AUTH-04: Protected Routes (2 pts) - Requires US-AUTH-02
- US-AUTH-05: Rate Limiting (3 pts) - Requires US-AUTH-01 (can parallel)
- US-AUTH-06: Change Password (3 pts) - Requires US-AUTH-02, US-AUTH-04

**Implementation Order:**
1. US-AUTH-01 → Foundation
2. US-AUTH-02 + US-AUTH-05 (parallel) → Session + Rate limiting
3. US-AUTH-03 + US-AUTH-04 (parallel) → Logout + Protected routes
4. US-AUTH-06 → Change password
