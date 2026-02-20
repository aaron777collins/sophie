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

### Phase Progress
- ✅ **Phase 1:** Data Download COMPLETE (13.3M rows, 13.3GB)
- ✅ **Phase 2:** Parquet Conversion COMPLETE (27 files, 1.6GB)
- 🔄 **Phase 3:** Attack Execution IN PROGRESS (PID 466915)

### Monitoring Commands
```bash
# Check if attack is running
ssh jaekel "ps aux | grep 466915 | grep -v grep"

# Check progress
ssh jaekel "tail -50 /home/ubuntu/repos/ConnectedDrivingPipelineV4/attack_apr2021.log"
```

### When Attack Completes
1. Collect classification metrics
2. Generate report
3. Post results to Slack #aibot-chat

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

### Tasks Awaiting Validator Response

| Task | Sent | Status |
|------|------|--------|
| p4-1-d: E2E Admin Settings Flow | 2026-02-19 21:40 EST | Awaiting validation |

### Tasks Needing Attention

| Task | Issue | Action Needed |
|------|-------|---------------|
| p4-5-d: Matrix File Upload/Download | Validation failed (unit tests) | Fix unit tests, re-validate |
| p4-3-d: Fix Responsive Issues | In progress | Monitor worker |

### Tasks Pending (Queue Next When Slots Open)

| Task | Dependencies | Ready? |
|------|--------------|--------|
| p4-5-e: Performance Testing | p4-5-d | No (blocked) |

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
