# Coordinator Jobs

**Last Updated:** 2026-03-01 09:45 EST

---

## Active Projects

### Bible Drawing V2 - Phase 1 Execution 🚨 CRITICAL
**Status:** ⚠️ Phase 1 IN PROGRESS with 10 tasks NEEDS-FIX
**Priority:** P0-CRITICAL

**Current Beads Status:**
- **needs-fix:** 10 tasks (BLOCKING - auth system broken)
- **in_progress:** 1 task
- **blocked:** 2 tasks  
- **open:** 18 tasks

**CRITICAL ISSUES (from validation):**
- Authentication system completely broken
- SessionProvider not properly configured
- E2E tests fail (infinite SessionProvider errors)
- Unit tests: 64/74 suites FAILING
- CSRF configuration broken

**Active Worker:** bdv2-auth-critical-fix (Sonnet) - fixing clawd-zsk

**Key Needs-Fix Tasks:**
- clawd-zsk: NextAuth CSRF Configuration (P0) - **BEING FIXED**
- clawd-cxe: Authentication Logic & Error Handling (P0)
- clawd-dta: NextAuth Middleware Configuration (P0)
- clawd-0tn: Session Configuration (P0)

**Repository:** /home/ubuntu/repos/bible-drawing-v2
**Phase 1 Plan:** `~/clawd/docs/plans/bible-drawing-v2/phases/PHASE-1.md`

**Next Actions:**
1. Wait for auth critical fix to complete
2. Verify authentication system works
3. Address remaining needs-fix tasks in dependency order
4. Resume normal Phase 1 task execution

---

### MELO V2 - Unit Test Maintenance
**Status:** Maintenance issues discovered, fixes in progress
**Priority:** P1-MAINTENANCE

**Recent Completions (validated & closed):**
- ✅ clawd-8rk: Modal Provider Context Issues - CLOSED
- ✅ clawd-9uz: Matrix Client Initialization - CLOSED  
- ✅ clawd-i4y: React Hook Form Integration - CLOSED
- ✅ clawd-d6i: ChatMessages Component Tests - CLOSED
- ✅ clawd-b6s: Main Unit Test Epic - CLOSED (partially complete)

**New Issues Discovered (2026-03-01):**
- clawd-717: ChatInput Component Tests (22/23 failures) - P1 **BEING FIXED**
- clawd-dv8: TemplateSelector Tests (3/18 failures) - P2
- clawd-0bw: Registration Tests (9/13 failures) - P2

**Active Worker:** melo-chatinput-fix-v2 (Sonnet) - fixing clawd-717

**Repository:** /home/ubuntu/repos/melo

---

## Worker Capacity

**Current Workers (2/2 limit):**
1. melo-chatinput-fix-v2 - ChatInput test fixes (clawd-717)
2. bdv2-auth-critical-fix - Bible Drawing V2 auth fixes (clawd-zsk)

---

## Other Projects

All projects (Proactive Job Enhancement, ConnectedDrivingPipelineV4) are **COMPLETE** or **ARCHIVED**.

Web browsing infrastructure research **COMPLETE**.
