# Unit Test Failures Task Decomposition
**Date:** 2026-02-27 17:00 EST
**Issue:** Context limit blocking unit test fix (67+ failures, 3 failed attempts)

## Problem Analysis
- Original task too large (200k token limit exceeded)
- 67+ failing tests require analysis of multiple files and dependencies
- Workers hit context limits when loading test files and error output

## Decomposition Strategy

### Task A: Modal Component Tests
**ID:** melo-unit-tests-modals
**Focus:** Modal-related test failures
**Estimated Scope:** ~15-20 tests
**Files:** `*modal*.test.ts`, `*Modal*.spec.ts`
**Model:** sonnet

### Task B: Service/Hook Tests  
**ID:** melo-unit-tests-services
**Focus:** Service layer and custom hooks
**Estimated Scope:** ~20-25 tests
**Files:** `*service*.test.ts`, `*hook*.test.ts`, `use*.test.ts`
**Model:** sonnet

### Task C: Component Tests
**ID:** melo-unit-tests-components
**Focus:** UI component tests (non-modal)
**Estimated Scope:** ~20-25 tests
**Files:** Component test files excluding modals
**Model:** sonnet

### Task D: Integration Verification
**ID:** melo-unit-tests-final
**Focus:** Final integration and cleanup
**Estimated Scope:** Verify all fixes, final test run
**Dependencies:** Tasks A, B, C
**Model:** sonnet

## Implementation Plan
1. Spawn Task A immediately (smallest scope)
2. Tasks B & C can run in parallel once A completes
3. Task D for final verification

## Success Criteria
- Each subtask focuses on <20 test files
- `pnpm test` exits with code 0
- All failures resolved or properly skipped with rationale
- Documentation updated for accurate test status reporting