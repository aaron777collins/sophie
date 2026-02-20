# Person Manager Jobs

> **CEO Role:** This agent ALWAYS runs. Check system health every time.

**Updated:** 2026-02-19 22:05 EST

---

## 🚨 HIGH PRIORITY: WYDOT APRIL 2021 ATTACK

| Item | Value |
|------|-------|
| **Project** | WYDOT Constant Offset Attack |
| **Server** | Jaekel (`ssh jaekel`) |
| **Location** | `/home/ubuntu/repos/ConnectedDrivingPipelineV4/` |
| **Full Plan** | `scheduler/coordinator/notes/wydot-apr2021-attack-plan.md` |

### Phase Progress
- ✅ **Phase 1:** Data Download COMPLETE (13.3M rows)
- ✅ **Phase 2:** Parquet Conversion COMPLETE (27 files)
- 🔄 **Phase 3:** Attack Execution IN PROGRESS (PID 466915)

### What's Running
Sophie is directly monitoring the attack pipeline. When complete:
1. Collect classification metrics
2. Post results to Slack #aibot-chat

---

## 🎯 PRIMARY PROJECT: MELO V2

| Item | Value |
|------|-------|
| **Project Name** | MELO V2 |
| **Location** | `/home/ubuntu/repos/melo` |
| **Live Site** | https://dev2.aaroncollins.info |
| **Frontend** | Discord clone (nayak-nirmalya/discord-clone) |
| **Backend** | Matrix |

### Phase Status

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 1: Reference Setup | ✅ COMPLETE | 54 components mapped |
| Phase 2: UI Component Replacement | ✅ COMPLETE | All core components done |
| Phase 3: Setup Wizard & Admin | ✅ COMPLETE | All tasks validated |
| Phase 4: Integration & Polish | 🔄 IN PROGRESS | E2E tests, responsive, themes |

### Phase 4 Active Work (Managed by Coordinator)

**Completed:**
- ✅ p4-1-a: E2E User Onboarding Flow
- ✅ p4-2-a: Screenshot Audit vs Discord Reference  
- ✅ p4-2-c: Fix Remaining Build Errors
- ✅ p4-1-b: E2E Server Creation → Room Creation → Messaging
- ✅ p4-5-a: Verify Matrix Authentication Flow
- ✅ p4-6-a: Fix E2E Authentication Infrastructure
- ✅ p4-1-c: E2E Invite Flow
- ✅ p4-3-a: Responsive Behavior Audit
- ✅ p4-3-b: Dark/Light Mode Toggle Verification
- ✅ p4-3-c: Test Desktop Breakpoint
- ✅ p4-4-a: Test Dark Mode Across All Components
- ✅ p4-4-b: Test Light Mode Across All Components
- ✅ p4-4-c: Fix Theme Inconsistencies
- ✅ p4-5-b: Verify Matrix Real-time Message Sync
- ✅ p4-5-c: Verify Matrix Space/Room Operations

**In Progress:**
- 🔄 p4-1-d: E2E Admin Settings Flow (self-validated, sent to Validator)
- 🔄 p4-3-d: Fix Responsive Issues Found
- 🔄 p4-5-d: Verify Matrix File Upload/Download (validation failed - fixing unit tests)

**Pending:**
- ⏸️ p4-5-e: Performance Testing (Load Time < 3s)

---

## 📋 NON-NEGOTIABLE RULES

### 1. NO HAIKU FOR UI WORK
- All UI work: Sonnet or Opus ONLY
- Haiku cannot judge visual design

### 2. ALWAYS VISUALLY VERIFY
- Playwright screenshots after each component
- Compare to discord-clone reference

### 3. MAX 2 CONCURRENT TASKS
- Count actual running workers, not hierarchy
- Only spawn new when slots available

---

## 🏗️ Managed Agents

### Coordinator
- **Jobs File:** `scheduler/coordinator/JOBS.md`
- **Status:** ✅ Managing Phase 4 tasks + WYDOT monitoring

### Task Managers (Proactive Scheduler)  
- **Jobs File:** `PROACTIVE-JOBS.md`
- **Status:** ✅ Detailed task tracking for Phase 4

### Validator
- **Jobs File:** `scheduler/validator/JOBS.md`
- **Status:** ✅ Validating completed tasks

---

## Next Steps

1. **MONITOR** WYDOT download progress (via Coordinator)
2. **TRACK** Phase 4 task completions
3. **VALIDATE** tasks sent to Validator get processed
4. **ESCALATE** blockers to Aaron if needed
5. **REPORT** significant progress to Slack
