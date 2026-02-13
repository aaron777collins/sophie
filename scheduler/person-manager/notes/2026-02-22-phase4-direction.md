# Phase 4 Direction Notes — 2026-02-22

## Context
- **Received:** Coordinator inbox message confirming Phase 3 completion
- **Status:** All 8 Phase 3 tasks completed (settings, first-run, voice/video UI, screen share, server discovery)
- **Decision Needed:** Phase 4 scope, priorities, timeline, model assignments

## Phase 4 Analysis

**Total Scope:** 12 tasks across 4 categories (2 weeks estimated)

| Category | Tasks | Estimated Days |
|----------|-------|----------------|
| 4.1 Documentation | 3 tasks | 3 days |
| 4.2 Performance | 3 tasks | 2.5 days |
| 4.3 Testing | 2 tasks | 3 days |
| 4.4 Deployment | 3 tasks | 2.5 days |

## Strategic Decision: Parallel Tracks

**Track A: Documentation + Deployment (Critical Path)**
- Documentation first (no blockers, high value)
- Docker images (foundation for deployment)
- These enable everything else

**Track B: Performance + Testing**
- Bundle optimization (improves UX)
- E2E tests (validates functionality)

## Task Prioritization

### Week 1: Foundation
1. **4.1.1 User Guide** — Sonnet (1 day) — Start immediately
2. **4.4.1 Docker Images** — Sonnet (1 day) — Start immediately (parallel)
3. **4.1.2 Admin Guide** — Sonnet (1 day) — After user guide
4. **4.2.1 Bundle Optimization** — Sonnet (1 day) — After docker starts
5. **4.3.1 E2E Tests** — Sonnet (2 days) — Start mid-week

### Week 2: Polish
6. **4.1.3 Self-Host Guide** — Sonnet (1 day) — Depends on Docker
7. **4.4.2 Helm Charts** — Sonnet (1 day) — After Docker
8. **4.2.2 Sync Optimization** — Sonnet (1 day)
9. **4.3.2 Load Testing** — Sonnet (1 day) — After E2E
10. **4.2.3 Image Optimization** — Haiku (0.5 days) — Simple task
11. **4.4.3 Release Automation** — Haiku (0.5 days) — Final step

## Model Assignments

| Model | Tasks |
|-------|-------|
| **Sonnet** | All documentation, performance, testing, Docker, Helm |
| **Haiku** | Image optimization (4.2.3), Release automation (4.4.3) |

## Slot Management
- Max 2 leaf tasks running at once
- Start with Documentation + Docker (2 slots)
- Rotate as tasks complete

## Success Criteria for Phase 4
From IMPLEMENTATION-PLAN.md:
- [ ] Documentation complete
- [ ] Performance meets targets (< 3s initial load, < 100ms message send)
- [ ] E2E tests pass
- [ ] Docker images published
- [ ] v1.0.0 released

## Decision Summary
✅ Approve Phase 4 start immediately
✅ Parallel execution: Documentation + Deployment tracks
✅ Sonnet for all substantial work, Haiku for simple final tasks
✅ 2-week timeline maintained
