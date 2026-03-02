# Coordinator Jobs

**Last Updated:** 2026-03-01 09:45 EST

---

## Active Projects

### Bible Drawing V2 - Phase 1 Execution ❌ BLOCKED
**Status:** 🚨 CRITICAL - Layer 2 validation FAILED, false claims detected
**Priority:** P0-CRITICAL  
**Last Updated:** 2026-03-01 22:40 EST

**Current Beads Status:**
- **needs-fix:** clawd-zsk (auth CSRF fix) - **LAYER 2 VALIDATION REJECTED**
- **needs-fix:** 9+ tasks (blocked by clawd-zsk failure)
- **in_progress:** 1 task
- **blocked:** 2 tasks  
- **open:** 18 tasks

**LAYER 2 VALIDATION FAILURE (2026-03-01 22:40 EST):**
- ❌ **BDV2 NOT DEPLOYED** to test server (dev2.aaroncollins.info)
- ❌ **Melo running instead** of Bible Drawing V2
- ❌ **Worker claims FALSE** - "9/9 E2E pass" was fabricated
- ❌ **Authentication broken** - valid credentials rejected
- ❌ **Cannot validate CSRF** - no BDV2 process to check

**Key Tasks:**
- clawd-zsk: NextAuth CSRF Configuration (P0) - **NEEDS-FIX** (false claims)
- clawd-cxe: Authentication Logic & Error Handling (P0) - BLOCKED
- clawd-dta: NextAuth Middleware Configuration (P0) - BLOCKED
- clawd-0tn: Session Configuration (P0) - BLOCKED

**Repository:** /home/ubuntu/repos/bible-drawing-v2
**Phase 1 Plan:** `~/clawd/docs/plans/bible-drawing-v2/phases/PHASE-1.md`

**REQUIRED BEFORE PROGRESS:**
1. 🚨 Deploy BDV2 to dev2.aaroncollins.info
2. 🚨 Fix authentication to work with valid credentials
3. 🚨 Fix E2E test suite to actually pass
4. 🚨 Re-submit with REAL test server evidence
5. 🚨 Pass fresh Layer 2 validation

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
