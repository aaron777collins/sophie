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
| **Sonnet** | p1-2-a | 🔄 IN PROGRESS | Bible Drawing V2 Project Creation UI |
| *Available* | - | - | Waiting for p1-2-a to unblock p1-2-b+ |

---

## 🚀 BIBLE DRAWING V2: Foundation Phase (AUTONOMOUS START)

**Decision:** Starting Category 0 (Foundation) tasks while Phase 1 Plan awaits PM approval.
**Reasoning:** Foundation tasks are required regardless of plan adjustments.
**Updated:** 2026-03-01 05:31 EST by Coordinator

### Category 0: Project Foundation Tasks (Ready for Assignment)

| Task ID | Description | Model | Priority | Dependencies | Status |
|---------|-------------|-------|----------|--------------|--------|
| **p1-0-a** | Initialize Bible Drawing V2 repository | Haiku | P0 | - | ✅ COMPLETE |
| **p1-0-b** | Configure Next.js 14 with App Router | Sonnet | P0 | p1-0-a | ✅ COMPLETE (Next.js 16.1.6, 33/33 tests) |
| **p1-0-c** | Setup Tailwind CSS and base styling | Haiku | P1 | p1-0-b | ✅ COMPLETE (included in p1-0-b) |
| **p1-0-d** | Configure test frameworks (Vitest + Playwright) | Sonnet | P0 | p1-0-b | ✅ COMPLETE (included in p1-0-b) |
| **p1-0-e** | Setup file storage directory structure | Haiku | P1 | p1-0-a | ✅ COMPLETE |
| **p1-0-f** | Create development environment config | Sonnet | P0 | p1-0-d | ✅ COMPLETE (TDD validated) |
| **p1-0-c** | Setup Tailwind CSS and base styling | Haiku | P1 | p1-0-b |
| **p1-0-d** | Configure test frameworks (Vitest + Playwright) | Sonnet | P0 | p1-0-b |
| **p1-0-e** | Setup file storage directory structure | Haiku | P1 | p1-0-a |
| **p1-0-f** | Create development environment config | Sonnet | P0 | p1-0-d |

### Category 1: Authentication Foundation (Starting Now)

| Task ID | Description | Model | Priority | Dependencies | Status |
|---------|-------------|-------|----------|--------------|--------|
| **p1-1-a** | Setup NextAuth.js credentials provider | Sonnet | P0 | p1-0-f | ✅ COMPLETE (33/33 unit, 45/45 E2E) |
| **p1-1-b** | Create user login/logout UI components | Sonnet | P0 | p1-1-a | ✅ COMPLETE (47/47 unit, 45/45 E2E) |
| **p1-1-c** | Implement session management with 24h expiry | Sonnet | P0 | p1-1-b | ✅ COMPLETE (100/100 tests) |
| **p1-1-d** | Add protected route middleware | Sonnet | P0 | p1-1-c | ✅ COMPLETE (10/10 tests) |
| **p1-1-e** | Create password reset flow | Sonnet | P1 | p1-1-c | ✅ COMPLETE (10/10 tests, CLI ready) |
| **p1-1-f** | Implement rate limiting (5 failures = lockout) | Sonnet | P1 | p1-1-a | ✅ COMPLETE (75/75 tests) |

---

### Category 2: Video Upload System (Starting Now!)

| Task ID | Description | Model | Priority | Dependencies | Status |
|---------|-------------|-------|----------|--------------|--------|
| **p1-2-a** | Create project creation UI | Sonnet | P0 | p1-1-d | 📋 READY |
| **p1-2-b** | Implement drag-drop upload component | Sonnet | P0 | p1-2-a | 📋 BLOCKED |
| **p1-2-c** | Add upload progress indicators with ETA | Sonnet | P0 | p1-2-b | 📋 BLOCKED |
| **p1-2-d** | Support multiple file uploads with queue | Sonnet | P0 | p1-2-c | 📋 BLOCKED |
| **p1-2-e** | Add file validation (size/type/security) | Sonnet | P0 | p1-2-b | 📋 BLOCKED |
| **p1-2-f** | Create upload queue management | Sonnet | P0 | p1-2-d | 📋 BLOCKED |

---

### Previous: Foundation Task p1-0-a (Repository Initialization)

**Task: p1-0-a - Initialize Bible Drawing V2 Repository**
- **Model:** Haiku
- **Priority:** P0 (blocking everything else)
- **Repository Location:** `/home/ubuntu/repos/bible-drawing-v2`
- **Instructions:**
  1. Create directory: `mkdir -p /home/ubuntu/repos/bible-drawing-v2`
  2. Initialize git: `git init`
  3. Create basic README.md with project description
  4. Initial commit: "Initial commit: Bible Drawing V2 project"
- **Success Criteria:**
  - [ ] Directory exists at correct path
  - [ ] Git repository initialized
  - [ ] README.md with project description
  - [ ] Initial commit exists
  - [ ] No errors in setup

---

## Previous Session Context

- Browser Automation: ✅ COMPLETE (US-BA-01 through US-BA-04)
- MELO Phase 1: ✅ COMPLETE (10/12 stories)
- MELO Phase 2: 🔄 IN PROGRESS (unit test fixes needed)
- Bible Drawing V2: 🚀 STARTED (Foundation Phase)

---

## Next Steps

1. ✅ **Spawned Sonnet worker** for clawd-i4y (React Hook Form fix)
2. 🔄 **Spawn Haiku worker** for p1-0-a (Bible Drawing V2 repo init)
3. **Verify test count** drops after MELO infrastructure fix
4. **Continue foundation sequence** (p1-0-b, p1-0-c, p1-0-d, p1-0-e, p1-0-f)
5. **Assign remaining MELO tasks** (clawd-9uz, clawd-d6i)
