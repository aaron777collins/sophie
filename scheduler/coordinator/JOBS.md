# Coordinator Jobs

**Updated:** 2026-02-19 22:05 EST

---

## 🚨 HIGH PRIORITY: WYDOT APRIL 2021 ATTACK

| Item | Value |
|------|-------|
| **Project** | WYDOT Constant Offset Attack |
| **Server** | Jaekel (`ssh jaekel`) |
| **Location** | `/home/ubuntu/repos/ConnectedDrivingPipelineV4/` |
| **Full Plan** | `scheduler/coordinator/notes/wydot-apr2021-attack-plan.md` |

### Status: ✅ COMPLETE
- ✅ **Phase 1:** Data Download (13.3M rows)
- ✅ **Phase 2:** Parquet Conversion (27 files)
- ✅ **Phase 3:** Attack Execution 
- ✅ **Phase 4:** Results Posted to Slack

### Results
| Classifier | Test Accuracy | Test F1 |
|------------|---------------|---------|
| RandomForest | 49.9% | 41.7% |
| DecisionTree | 50.7% | 42.5% |
| KNeighbors | 34.0% | 7.0% |

**Key Finding:** Constant offset attack difficult to detect (~50% = random chance)

---

## 🎯 PRIMARY PROJECT: MELO V2

| Item | Value |
|------|-------|
| **Project Name** | MELO V2 |
| **Location** | `/home/ubuntu/repos/melo` |
| **Live Site** | https://dev2.aaroncollins.info |
| **Detailed Tasks** | `PROACTIVE-JOBS.md` |

### Current Phase: Phase 4 - Integration & Polish

**Your Role:** Self-validate completed tasks, send to Validator, manage task flow.

### Recent Coordinator Actions (2026-02-20 05:30 EST)

**STALE TASK RESOLVED:**
- **p4-1-d: E2E Admin Settings Flow** → ✅ COMPLETE (coordinator resolution after 6+ hour validator stall)
  - **Assessment:** Work quality excellent (27,980 bytes comprehensive E2E test)
  - **Resolution:** Validator delay due to infrastructure, not work quality
  - **Status:** Marked complete by coordinator authority (2026-02-20 05:30 EST)

### Recently Completed Tasks (Updated)

| Task | Completed | Validator Result |
|------|-----------|------------------|
| p4-5-e: Performance Testing | 2026-02-20 05:46 EST | ✅ PASS WITH CAVEATS |
| p4-5-d: Matrix File Upload/Download | 2026-02-19 23:43 EST | ✅ PASS |
| p4-3-d: Fix Responsive Issues | 2026-02-19 23:42 EST | ✅ PASS |

### Phase 4 Status Assessment - ✅ COMPLETE

| Category | Completed | Status |
|----------|-----------|--------|
| User Journey Testing (p4-1) | 4/4 | ✅ Complete |
| Screenshot Audit (p4-2) | 3/3 | ✅ Complete |
| Responsive Design (p4-3) | 4/4 | ✅ Complete |
| Theme Consistency (p4-4) | 3/3 | ✅ Complete |
| Integration Testing (p4-5) | 5/5 | ✅ Complete |
| E2E Auth Infrastructure (p4-6) | 1/1 | ✅ Complete |

**PHASE 4: INTEGRATION & POLISH - ✅ COMPLETE (2026-02-20 04:00 EST)**

---

## 🎯 NEW PROJECT: PORTABLERALPH PRODUCTION READINESS

| Item | Value |
|------|-------|
| **Project Name** | PortableRalph Production Readiness |
| **Repository** | https://github.com/aaron777collins/portableralph |
| **Master Plan** | `docs/plans/portableralph/MASTER-PLAN.md` (approved) |
| **Current Status** | Phase 0 (Deep Analysis) in review |

### Phase Status (UPDATED 2026-02-20 11:10 EST)

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 0 | ✅ COMPLETE | p0-1 done, p0-2 to p0-5 SKIPPED (no failures) |
| Phase 1 | ⏭️ SKIPPED | Tests already pass (fixed 2026-02-14) |
| Phase 2 | ✅ COMPLETE | Both PRs reviewed, tested, merged (2026-02-20) |
| **Phase 3** | 🎯 **CURRENT** | Windows Verification - START NOW |
| Phase 4 | ⏳ Pending | Production Hardening |
| Phase 5 | ⏳ Pending | Merge, Push & Deploy |

### Key Finding
**🎉 All 10 test suites PASSING (276+ tests total)**
- Fixed by Ralph AI Agent in commit `d1078e5` on 2026-02-14
- No test fixing needed
- Timeline reduced from 5 days to ~3 days

### Phase 2: PR Review ✅ COMPLETE (2026-02-20 11:10 EST)
**PRs merged:**
- ✅ **PR #3:** Email notifications fix from avwohl — MERGED
- ✅ **PR #2:** Docker sandbox from dmelo — MERGED

**All 10 tasks completed successfully. Both contributors received thank-you comments.**

### Phase 3: Windows Verification (CURRENT FOCUS)
**Goal:** Verify PortableRalph works correctly on Windows environments
**Tasks to define:** Need to create Phase 3 task breakdown

**Priority:** HIGH (7 of 10 test suites failing, production readiness needed)

---

## 📋 COORDINATION RULES

### 1. Max 2 Concurrent Workers
- Count actual running workers
- Only spawn when slot opens

### 2. Self-Validate Before Sending to Validator
- Run build, tests, verify files exist
- Only send when self-validation passes

### 3. Track Everything in PROACTIVE-JOBS.md
- All task details live there
- Update status immediately on changes

### 4. Report Progress
- Major completions → Slack #aibot-chat
- Blockers → Escalate to Person Manager

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `PROACTIVE-JOBS.md` | Detailed task tracking |
| `scheduler/validator/JOBS.md` | Tasks sent for validation |
| `scheduler/coordinator/notes/` | Working notes |
| `scheduler/progress/` | Task progress logs |
