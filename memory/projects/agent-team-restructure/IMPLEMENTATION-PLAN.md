# Agent Team Restructure - Implementation Plan

> **Status:** Design Complete, Implementation Ready
> **Author:** Sophie
> **Date:** 2026-03-06

---

## ✅ COMPLETED

### 1. Research Phase
- [x] Frontend skills research (Sonnet sub-agent)
- [x] Backend skills research (Sonnet sub-agent)
- [x] Architecture patterns research (Sonnet sub-agent)
- [x] DevOps + Anti-hallucination research (Sonnet sub-agent)
- [x] QA/Testing research (partial)
- [x] Agent swarm/coordination research (partial)

### 2. Design Phase
- [x] New organization structure defined
- [x] 8 specialist roles created:
  - Phoenix 🎨 Frontend Specialist
  - Atlas ⚙️ Backend Specialist
  - Athena 🏛️ Architect
  - Mercury 🧪 QA Engineer
  - Forge 🛡️ DevOps Engineer
  - Argus 👁️ Hallucination Auditor
  - Herald 🏃 Scrum Master
  - Sentinel 🔍 Validator
- [x] Identity documents for all specialists
- [x] Task routing system
- [x] Anti-hallucination protocols

### 3. Documentation
- [x] `scheduler/specialists/*/IDENTITY.md` — All role definitions
- [x] `scheduler/scrum-master/IDENTITY.md` — Process coordinator
- [x] `scheduler/validator/IDENTITY.md` — Independent validation
- [x] `scheduler/TASK-ROUTING.md` — Assignment logic
- [x] `PROACTIVE-JOBS.md` — Updated with new hierarchy
- [x] `memory/projects/agent-team-restructure/_overview.md` — Full design

---

## ⏳ REMAINING TASKS

### Phase 1: Cron Configuration (Next)
- [ ] Create Scrum Master cron job (15-30 min interval)
- [ ] Create Auditor cron job (30-60 min interval)
- [ ] Create per-specialist heartbeat crons
- [ ] Update AGENTS.md with new hierarchy

### Phase 2: Beads Integration
- [ ] Add specialist labels to existing tasks
- [ ] Create label taxonomy in beads
- [ ] Test routing with sample task

### Phase 3: Testing
- [ ] Run test task through full workflow
- [ ] Verify specialist handoffs
- [ ] Validate auditor sampling
- [ ] Check Scrum Master coordination

### Phase 4: Documentation Update
- [ ] Update AGENTS.md with complete new system
- [ ] Create onboarding guide for specialists
- [ ] Document escalation paths

---

## 🔧 CRON JOBS TO CREATE

### Scrum Master (Herald)
```json
{
  "id": "scrum-master",
  "label": "Scrum Master",
  "schedule": "*/30 * * * *",
  "model": "anthropic/claude-sonnet-4-20250514",
  "text": "You are Herald, the Scrum Master. Read scheduler/scrum-master/IDENTITY.md and scheduler/scrum-master/HEARTBEAT.md. Execute your heartbeat check.",
  "workspace": "/home/ubuntu/clawd",
  "contextMessages": 0
}
```

### Hallucination Auditor (Argus)
```json
{
  "id": "hallucination-auditor",
  "label": "Hallucination Auditor",
  "schedule": "0 * * * *",
  "model": "anthropic/claude-sonnet-4-20250514",
  "text": "You are Argus, the Hallucination Auditor. Read scheduler/specialists/auditor/IDENTITY.md and scheduler/specialists/auditor/HEARTBEAT.md. Execute your audit check.",
  "workspace": "/home/ubuntu/clawd",
  "contextMessages": 0
}
```

---

## 🎯 KEY BENEFITS

| Before | After |
|--------|-------|
| Single worker overloaded | 6 specialists, focused domains |
| Self-validation only | Independent audit + validation |
| No loop detection | Argus catches hallucinations |
| Ad-hoc assignment | Herald manages task routing |
| Generic context | Specialists maintain domain expertise |
| No peer review | Cross-specialist collaboration |

---

## 📊 SUCCESS METRICS

Track after 1 week:
1. **Task completion rate** — Should increase
2. **Validation pass rate** — Should increase
3. **Hallucination incidents** — Should detect more initially, then decrease
4. **Time in each status** — Should decrease
5. **Blocker resolution time** — Should decrease

---

## ⚠️ RISKS & MITIGATIONS

| Risk | Mitigation |
|------|------------|
| Coordination overhead | Scrum Master manages handoffs |
| Skill gaps in specialists | Cross-training, escalation paths |
| Too many cron jobs | Start with Scrum Master + Auditor only |
| Context fragmentation | Clear handoff protocols, shared evidence |
| Specialists not picking up tasks | Scrum Master pings and escalates |

---

## 📁 FILE STRUCTURE CREATED

```
scheduler/
├── specialists/
│   ├── frontend/
│   │   └── IDENTITY.md ✅
│   ├── backend/
│   │   └── IDENTITY.md ✅
│   ├── architect/
│   │   └── IDENTITY.md ✅
│   ├── qa/
│   │   └── IDENTITY.md ✅
│   ├── devops/
│   │   └── IDENTITY.md ✅
│   └── auditor/
│       ├── IDENTITY.md ✅
│       └── HEARTBEAT.md ✅
├── scrum-master/
│   ├── IDENTITY.md ✅
│   └── HEARTBEAT.md ✅
├── validator/
│   └── IDENTITY.md ✅
├── TASK-ROUTING.md ✅
└── evidence/
    └── {bead-id}/ (created per task)

memory/projects/agent-team-restructure/
├── _overview.md ✅
├── research-frontend.md ✅
├── research-backend.md ✅
├── research-architecture.md ✅
├── research-devops-antihallucination.md ✅
└── IMPLEMENTATION-PLAN.md ✅ (this file)
```

---

## 🚀 NEXT ACTION

**Aaron's decision needed:**
1. Approve structure and proceed to cron configuration?
2. Any roles to add/remove?
3. Which cron intervals? (Suggested: Scrum Master 30min, Auditor 1hr)
4. Start with test task or production?
