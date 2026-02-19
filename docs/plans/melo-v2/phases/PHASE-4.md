# Phase 4: Integration & Polish

**Project:** MELO V2
**Parent:** MASTER-PLAN.md (pending)
**Created:** 2026-02-19 08:00 EST
**Author:** Person Manager
**Version:** 1
**Status:** approved

---

## Overview

Phase 4 focuses on ensuring the full MELO V2 application works as a cohesive Discord clone experience. All major UI components have been replaced (Phase 2) and admin features implemented (Phase 3). Now we verify everything integrates correctly.

---

## Prerequisites

- [x] Phase 1: Reference Setup ✅ complete
- [x] Phase 2: UI Component Replacement ✅ complete  
- [ ] Phase 3: Setup Wizard & Admin Features (pending final validation)

---

## Goals

1. **Full Application Flow Verification** — User can complete all core journeys
2. **Visual Consistency Audit** — No inconsistencies between components
3. **Integration Testing** — Matrix backend works correctly with Discord frontend
4. **Responsive Design Check** — All breakpoints work correctly
5. **Theme Consistency** — Dark/light mode works throughout

---

## Task Categories

### Category 1: User Journey Testing
End-to-end verification of core user flows.

| Task ID | Description | Model | Depends On |
|---------|-------------|-------|------------|
| p4-1-a | E2E: Complete user onboarding flow | Sonnet | Phase 3 |
| p4-1-b | E2E: Server creation → room creation → messaging | Sonnet | p4-1-a |
| p4-1-c | E2E: Invite flow (generate → share → accept) | Sonnet | p4-1-b |
| p4-1-d | E2E: Admin settings flow (modify server → manage members) | Sonnet | p4-1-c |

**Acceptance Criteria per task:**
- [ ] Playwright E2E test passes
- [ ] No console errors during flow
- [ ] Visual comparison matches Discord reference

### Category 2: Visual Consistency Audit

| Task ID | Description | Model | Depends On |
|---------|-------------|-------|------------|
| p4-2-a | Screenshot all main pages, compare to Discord reference | Sonnet | - |
| p4-2-b | Fix any visual inconsistencies found | Sonnet | p4-2-a |
| p4-2-c | Verify all Discord color values are correct | Sonnet | p4-2-b |

**Pages to screenshot:**
- Login/Register pages
- Main application view (server list + channels + chat)
- Server creation modal
- Server settings pages
- Member list
- User settings
- Invite modal

### Category 3: Responsive Design

| Task ID | Description | Model | Depends On |
|---------|-------------|-------|------------|
| p4-3-a | Test mobile breakpoint (< 640px) | Sonnet | p4-2-c |
| p4-3-b | Test tablet breakpoint (640px - 1024px) | Sonnet | p4-2-c |
| p4-3-c | Test desktop breakpoint (> 1024px) | Sonnet | p4-2-c |
| p4-3-d | Fix responsive issues found | Sonnet | p4-3-a, p4-3-b, p4-3-c |

### Category 4: Theme Consistency

| Task ID | Description | Model | Depends On |
|---------|-------------|-------|------------|
| p4-4-a | Test dark mode across all components | Sonnet | p4-2-c |
| p4-4-b | Test light mode across all components | Sonnet | p4-4-a |
| p4-4-c | Fix any theme inconsistencies | Sonnet | p4-4-a, p4-4-b |

### Category 5: Integration Testing

| Task ID | Description | Model | Depends On |
|---------|-------------|-------|------------|
| p4-5-a | Verify Matrix authentication flow | Sonnet | - |
| p4-5-b | Verify Matrix real-time message sync | Sonnet | p4-5-a |
| p4-5-c | Verify Matrix space/room operations | Sonnet | p4-5-a |
| p4-5-d | Verify Matrix file upload/download | Sonnet | p4-5-a |
| p4-5-e | Performance testing: Load time < 3s | Sonnet | p4-5-d |

---

## Dependency Graph

```
User Journeys:
p4-1-a ──► p4-1-b ──► p4-1-c ──► p4-1-d

Visual Consistency:
p4-2-a ──► p4-2-b ──► p4-2-c

Responsive (after visual):
                       p4-2-c ──► p4-3-a ─┐
                              ├──► p4-3-b ──► p4-3-d
                              └──► p4-3-c ─┘

Theme (after visual):
                       p4-2-c ──► p4-4-a ──► p4-4-b ──► p4-4-c

Integration (parallel):
p4-5-a ──► p4-5-b
      ├──► p4-5-c
      ├──► p4-5-d ──► p4-5-e
```

---

## Deliverables

- [ ] All E2E user journey tests pass
- [ ] Visual comparison audit complete (screenshots match reference)
- [ ] Responsive design verified at all breakpoints
- [ ] Dark/light mode consistent across application
- [ ] Matrix integration stable (auth, messaging, files)
- [ ] Performance baseline established

---

## Model Rules

| Activity | Model |
|----------|-------|
| E2E test implementation | Sonnet |
| Visual comparison/fixing | Sonnet |
| Complex integration issues | Opus |
| Performance debugging | Sonnet |

---

## Phase 5 Preview

After Phase 4, the focus shifts to **Production Readiness**:
- Fix `pnpm build` hanging (architectural issue)
- Deployment configuration
- CI/CD pipeline
- Performance optimization
- Security hardening

---

## Review History

- v1: 2026-02-19 08:00 EST - Initial Phase 4 definition by Person Manager
