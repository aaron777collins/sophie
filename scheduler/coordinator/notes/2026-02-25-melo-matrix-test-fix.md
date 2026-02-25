# Coordinator Notes: Melo Matrix Test Fix
**Date:** 2026-02-25 09:35 EST  
**Action:** Failed task recovery and respawn

## Situation Analysis

### Failed Worker: melo-matrix-1-fix
- **Started:** 2026-02-25 09:00 EST
- **Failed:** 2026-02-25 09:04 EST (4 minutes)
- **Issue:** Worker attempted individual test fixes without understanding systematic problems

### Root Cause Investigation
I ran `pnpm test:unit:run` myself and identified the real issues:

1. **React Import Issues (11 failures)**
   - SignInPage: "React is not defined" at line 189  
   - Multiple auth page components affected
   - Missing React imports in Next.js page components

2. **Missing Modules (7+ failures)**
   - `@/hooks/use-room-messages` - Cannot find module
   - `./server-invites` - Missing module in access-control.ts
   - Import path issues

3. **Test Mock Infrastructure (20+ failures)**
   - next/navigation mock missing useParams export
   - useModal returning undefined
   - Vitest setup problems

4. **Component Integration Issues (30+ failures)**
   - Test data structure mismatches
   - Component props not matching expectations
   - Mock return values incorrect

## Coordinator Decision

### Why Previous Worker Failed
- Tried to fix individual test cases
- Didn't understand systematic nature
- Made no commits, no real progress
- 4-minute runtime indicates superficial approach

### New Approach - melo-matrix-1-fix-v2
- **Model:** Sonnet (same as failed worker)
- **Key Difference:** Comprehensive systematic instructions
- **Priority-based fixing:** React imports → Missing modules → Test mocks → Component data
- **Clear success criteria:** 87 failures → 0 failures

### Instructions Enhancement
1. **Root Cause Analysis:** Provided detailed breakdown of all failure categories
2. **Systematic Approach:** Priority-ordered fixing strategy
3. **Verification Steps:** Build + test verification at each stage
4. **TDD Approach:** Follow proper test-driven development

## Expected Outcome
- All 87 failing unit tests should pass
- Build system remains stable  
- Test infrastructure properly configured
- No regressions introduced

## Layer 2 Validation Plan
When worker claims completion:
1. **Build Verification:** `pnpm build` must exit 0
2. **Full Test Suite:** `pnpm test:unit:run` must show 0 failures
3. **Test Categories:** Verify each category (React imports, modules, mocks) is fixed
4. **Code Review:** Check that fixes are minimal and don't break production code
5. **Spawn Validator:** Send to Layer 3 independent verification

## Lessons Learned
- Matrix project test failures require systematic approach, not individual fixes
- 4-minute worker runtime indicates insufficient problem analysis
- Failed workers should be analyzed and respawned with better instructions
- Test infrastructure problems cascade across multiple test files