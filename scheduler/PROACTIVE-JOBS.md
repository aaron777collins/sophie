# PROACTIVE-JOBS.md

**Last Updated:** 2026-02-28 01:30 EST by Coordinator  
**Active Projects:** MELO V2 Comprehensive Audit (maintenance phase)

---

## CURRENT TASKS

### 🔧 MELO V2 - Unit Test Fix (Priority: P1-MAINTENANCE)

**Context:** 67+ unit test failures identified during audit validation process. Workers previously claimed "tests pass" but validator found significant failures, creating false validation claims.

#### UNIT-FIX-1: Fix Modal Provider Context Issues
- **Status:** in-progress
- **Worker:** agent:main:subagent:4819a21c-1271-42af-9b82-8b804c124363
- **Started:** 2026-02-28 01:30 EST
- **Priority:** P1-HIGH (affects 12+ tests)
- **Model:** sonnet
- **Description:** Fix useModal hook integration failures in test environment
- **Progress File:** `scheduler/progress/melo-audit/unit-test-fix-v3.md`
- **Repository:** `/home/ubuntu/repos/melo`
- **Instructions:**
  1. Analyze failing tests with "Cannot destructure property 'isOpen' of 'useModal(...)"
  2. Fix missing modal provider context in test setup
  3. Update test/unit/setup.ts with proper modal context mocking
  4. Re-run affected tests to verify fixes
- **Success Criteria:**
  - [ ] All useModal-related tests pass
  - [ ] No "Cannot destructure property 'isOpen'" errors
  - [ ] Modal provider context properly mocked in tests
- **Files to Modify:**
  - `tests/unit/setup.ts`
  - Modal component test files as needed

#### UNIT-FIX-2: Fix Matrix Client Initialization
- **Status:** pending  
- **Priority:** P1-HIGH (affects 8+ tests)
- **Model:** sonnet
- **Description:** Fix Matrix client initialization issues in tests
- **Instructions:**
  1. Resolve "Matrix client not initialized" errors
  2. Update useMatrixClient mock setup in test environment
  3. Ensure proper Matrix client mocking across all tests
- **Success Criteria:**
  - [ ] No "Matrix client not initialized" errors
  - [ ] All Matrix client dependent tests pass
  - [ ] Mock configuration covers all Matrix client usage

#### UNIT-FIX-3: Fix React Hook Form Integration
- **Status:** pending
- **Priority:** P1-MEDIUM (affects 9+ tests)  
- **Model:** sonnet
- **Description:** Resolve React Hook Form validation warnings and nested form issues
- **Instructions:**
  1. Fix form validation warnings in tests
  2. Resolve nested form issues
  3. Ensure proper form component usage in test environment
- **Success Criteria:**
  - [ ] No React Hook Form warnings
  - [ ] All form-related tests pass
  - [ ] Proper form integration testing

#### UNIT-FIX-4: ChatMessages Component Tests
- **Status:** pending
- **Priority:** P1-MEDIUM (affects 15+ tests)
- **Model:** sonnet  
- **Description:** Fix ChatMessages component test expectations vs actual implementation
- **Instructions:**
  1. Analyze component structure vs test expectations
  2. Fix missing UI elements: loading states, error states, message display, pagination
  3. Update tests to match actual component implementation
- **Success Criteria:**
  - [ ] All ChatMessages component tests pass
  - [ ] Test expectations match component implementation
  - [ ] Loading and error states properly tested

---

### 🎯 MELO V2 - Story Implementation (Priority: P1-HIGH)

#### ST-P2-04-A: DM Sidebar Section Components
- **Status:** needs-validation
- **Worker:** agent:main:subagent:97216f48-0cb4-42fe-a370-e9f78381401c (COMPLETED)
- **Completed:** 2026-02-28 08:42 EST  
- **Priority:** P1-HIGH
- **Model:** sonnet
- **Description:** Implemented DM sidebar section component with full functionality
- **Repository:** `/home/ubuntu/repos/melo`
- **Git Commit:** ddf7b8b
- **Deliverables:**
  ✅ DMSidebarSection component (AC-1)
  ✅ DMListItem for conversation display (AC-6, AC-11) 
  ✅ DMEmptyState for new users (AC-8)
  ✅ Unit tests with full coverage
  ✅ Build passes successfully
  ✅ Git commit created
- **Validation Requirements:**
  - [ ] L2 Validation: Component functionality and integration
  - [ ] L3 Validation: Code quality and completeness
  - [ ] Testing evidence: All tests passing
  - [ ] Build evidence: Successful production build

---

## WORKER SLOTS

**Current Capacity:** 2 slots  
**Active Workers:** 1 (UNIT-FIX-1)  
**Available:** 1

---

## COORDINATION NOTES

### Status Overview
- **Emergency Phase:** ✅ COMPLETE - Application restored (48m uptime)
- **Phase 1 Audit:** ✅ MOSTLY COMPLETE - 11/12 stories done
- **Current Focus:** Unit test maintenance (preventing false validation claims)

### Next Actions
1. Spawn worker for UNIT-FIX-1 (highest priority - affects most tests)
2. Continue systematic unit test fixes following TDD methodology
3. Monitor application stability
4. Prepare for potential Phase 2 audit planning

### Context Links
- **Progress Files:** `scheduler/progress/melo-audit/`
- **Story Status:** See `scheduler/coordinator/JOBS.md`
- **Validation Reports:** `scheduler/validation/reports/melo-v2/`