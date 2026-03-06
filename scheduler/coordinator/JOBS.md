# Coordinator Jobs

**Last Updated:** 2026-03-05 22:55 EST

---

## Active Projects

### Bible Drawing V2 - Auth Implementation Progressing 🟡
**Status:** 🟡 INFRASTRUCTURE BLOCKER - dev2 deployment needs fix
**Priority:** P0-CRITICAL (Auth Epic)
**Last Updated:** 2026-03-05 22:55 EST

**LAYER 2 VALIDATION COMPLETED:**
- ✅ clawd-1il (Session Management) - Implementation verified, test server blocked

**VALIDATION SUMMARY (clawd-1il):**
- ✅ Local build passes
- ✅ 466 unit tests passing (18/18 session-specific)
- ✅ Fresh-perspective sub-agent code review: PASS
- ✅ All 6 ACs verified via code analysis
- ❌ Test server browser validation: BLOCKED (dev2 infrastructure issue)

**INFRASTRUCTURE ISSUE:**
- dev2 build fails due to NextAuth version mismatch
- `getServerSession` export not found error
- Requires node_modules rebuild with correct dependency versions

**NEXT ACTIONS:**
1. Create infrastructure ticket for dev2 fix
2. After infrastructure fix, complete browser validation
3. Send to Validator for Layer 3 review

**TEST SERVER:** https://dev2.aaroncollins.info/bdv2
**TEST CREDENTIALS:** demo/demo123 (created, but server needs rebuild)

**Repository:** /home/ubuntu/repos/bible-drawing-v2

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

## Infrastructure Issues to Escalate

### dev2 BDV2 Deployment Fix (P1-HIGH)
**Issue:** NextAuth dependency version mismatch on dev2
**Error:** `getServerSession` export not found
**Impact:** Blocking full browser validation for auth stories
**Action Needed:** 
1. Clean node_modules on dev2
2. Reinstall with correct lockfile
3. Rebuild and restart

---

## Ready Work Queue

**Auth Stories Ready (after infrastructure fix):**
- US-AUTH-01: User Login (5 pts) - In validation queue (clawd-7er)
- US-AUTH-02: Session Management (3 pts) - Layer 2 complete, awaiting infra fix
- US-AUTH-03: User Logout (2 pts) - Next up
- US-AUTH-04: Protected Routes (2 pts) - Next up
- US-AUTH-05: Rate Limiting (3 pts) - Can parallel with US-AUTH-03/04
- US-AUTH-06: Change Password (3 pts) - Requires US-AUTH-02, US-AUTH-04
