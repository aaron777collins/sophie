## PROACTIVE-JOBS.md - Active Task Queue

**Updated:** 2026-02-28 13:30 EST by Person Manager (Opus subagent)
**Worker Slots:** 0/5 occupied
**Critical Status:** MELO V2 unit test fixes in progress

---

## 🚨 CRITICAL CORRECTION: "Fraud" Claim Was FALSE

**Assessment Date:** 2026-02-28 13:25 EST

The previous fraud claim against clawd-pc8 (DM Sidebar) was **INCORRECT**:
- ✅ Commit `ddf7b8b` EXISTS and contains real DM components
- ✅ `components/navigation/dm-sidebar-section.tsx` - implemented
- ✅ `components/navigation/dm-list-item.tsx` - implemented
- ✅ `components/navigation/dm-empty-state.tsx` - implemented
- ✅ `tests/unit/dm-sidebar.test.tsx` - 5/5 tests PASSING

**Task clawd-pc8 has been CLOSED as complete.**

---

## MELO V2 Unit Test Status (Actual Assessment)

### Test Failures Breakdown

| Category | Failures | Root Cause | Fix Task |
|----------|----------|------------|----------|
| **Modal Components** | ~36 | Missing FormProvider context in tests | clawd-i4y |
| **Matrix Client** | ~8 | Matrix client mock initialization | clawd-9uz |
| **useModal Hook** | ~12 | Modal provider context not in test setup | clawd-8rk |
| **ChatMessages** | ~15 | Component/test expectation mismatch | clawd-d6i |

**Key Insight:** clawd-i4y (React Hook Form) is the **ROOT CAUSE** of most failures. Fixing test wrapper to include FormProvider will resolve ~36 tests.

### Ready Tasks (Priority Order)

| Task ID | Title | Priority | Complexity | Recommended Model |
|---------|-------|----------|------------|-------------------|
| **clawd-i4y** | React Hook Form Integration | P2 | Medium | Sonnet |
| **clawd-8rk** | Modal Provider Context | P1 | Low | Sonnet (combine with i4y) |
| **clawd-9uz** | Matrix Client Initialization | P1 | Medium | Sonnet |
| **clawd-d6i** | ChatMessages Tests | P2 | Medium | Sonnet |

### Action Plan

1. **Phase 1: Fix Test Infrastructure** (clawd-i4y + clawd-8rk)
   - Update `tests/unit/setup.ts` to include:
     - FormProvider wrapper with useForm mock
     - ModalProvider context mock
   - Expected impact: ~48 tests fixed

2. **Phase 2: Matrix Client Mock** (clawd-9uz)
   - Update Matrix client mock in setup.ts
   - Ensure proper initialization for tests
   - Expected impact: ~8 tests fixed

3. **Phase 3: Component Test Updates** (clawd-d6i)
   - Review ChatMessages component structure
   - Update test expectations to match implementation
   - Expected impact: ~15 tests fixed

---

## Implementation Notes

### React Hook Form Test Fix (clawd-i4y)

**Error:** `Cannot read properties of undefined (reading 'formState')`

**Solution:**
```typescript
// In tests/unit/setup.ts or test wrapper
import { FormProvider, useForm } from 'react-hook-form';

const TestWrapper = ({ children }) => {
  const methods = useForm();
  return (
    <FormProvider {...methods}>
      <ModalProvider>
        {children}
      </ModalProvider>
    </FormProvider>
  );
};
```

### Affected Test Files
- `tests/unit/components/modals/initial-modal.test.tsx` (16 failures)
- `tests/unit/components/modals/create-server-modal.test.tsx` (14 failures)
- `tests/unit/components/modals/server-overview-modal.test.tsx` (6 failures)

---

## Worker Assignment Status

| Worker | Task | Status | Notes |
|--------|------|--------|-------|
| *Available* | - | - | Ready for assignment |

---

## Previous Session Context

- Browser Automation: ✅ COMPLETE (US-BA-01 through US-BA-04)
- MELO Phase 1: ✅ COMPLETE (10/12 stories)
- MELO Phase 2: 🔄 IN PROGRESS (unit test fixes needed)

---

## Next Steps

1. **Spawn Sonnet worker** for clawd-i4y (React Hook Form fix)
2. **Combine clawd-8rk** work into same PR (Modal Provider)
3. **Verify test count** drops after infrastructure fix
4. **Assign remaining tasks** (clawd-9uz, clawd-d6i)
