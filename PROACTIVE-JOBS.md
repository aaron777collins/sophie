## PROACTIVE-JOBS.md - Active Task Queue

**Updated:** 2026-03-06 00:00 EST by Sophie
**Priority Update from Aaron:** Bible > Matrix Voice Chat > Agent Team Restructure > MELO

---

## 🚀 NEW: Agent Team Restructure (P0-STRATEGIC)

**Status:** DESIGN COMPLETE, Implementation Starting

### What's Changing
Moving from **generic workers** to **specialized agent swarm**:

| Old System | New System |
|------------|------------|
| Single generic worker | 6 specialized roles |
| Self-validation | Independent audit + validation |
| No loop detection | Hallucination Auditor |
| Ad-hoc assignment | Scrum Master coordination |

### New Specialist Roles
| Agent | Role | Model | Domain |
|-------|------|-------|--------|
| Phoenix 🎨 | Frontend Specialist | Sonnet | React, Next.js, UI/UX |
| Atlas ⚙️ | Backend Specialist | Sonnet | APIs, DB, Auth |
| Athena 🏛️ | Architect | Sonnet/Opus | System design, patterns |
| Mercury 🧪 | QA Engineer | Sonnet | Testing strategy |
| Forge 🛡️ | DevOps Engineer | Sonnet | CI/CD, deployment |
| Argus 👁️ | Hallucination Auditor | Sonnet | Meta-validation |
| Herald 🏃 | Scrum Master | Sonnet | Process, assignment |
| Sentinel 🔍 | Validator | Sonnet | Independent verification |

### Implementation Status
- [x] Identity documents created for all specialists
- [x] Task routing system documented
- [x] Heartbeat configs for Scrum Master + Auditor
- [ ] Cron jobs configured
- [ ] Test with real task flow
- [ ] AGENTS.md updated

**See:** `memory/projects/agent-team-restructure/_overview.md`

---

## 🔴 P0: BDV2 Phase 1 - AUTH SYSTEM

**Status:** Auth infrastructure needs specialist attention

### Current State
| Category | Status | Issues Open |
|----------|--------|-------------|
| Cat 0: Foundation | ⚠️ PARTIAL | Schema incomplete |
| Cat 1: Auth | 🔴 NEEDS-FIX | CSRF + session issues |
| Cat 2: Upload | ⚠️ localStorage only | No DB integration |
| Cat 3-6 | ⏳ BLOCKED | Not started |

### Critical Path
1. **Fix CSRF/Auth** → Route to Backend Specialist (Atlas)
2. **Fix E2E infrastructure** → Route to DevOps (Forge)
3. **Validate fixes** → Route to QA (Mercury) + Validator (Sentinel)

### Assignment (New System)
- `backend` tasks → Atlas ⚙️
- `frontend` tasks → Phoenix 🎨
- `testing` tasks → Mercury 🧪
- `devops` tasks → Forge 🛡️

---

## 🟡 P1: Matrix/Element Voice Chat

**Goal:** Self-hosted Element server where Aaron can voice chat with Sophie

### Architecture (Documented in memory/projects/sophie-voice-matrix/)
- Synapse (Matrix homeserver)
- LiveKit (WebRTC SFU)
- Sophie Bot (Kokoro TTS + faster-whisper STT)

### Current Status (2026-03-04)
- ✅ Infrastructure documented
- ✅ TTS decision: Kokoro with af_heart
- ✅ STT decision: faster-whisper small/int8
- 🔄 SFrame decryption fix in progress
- ⏳ Full integration pending

---

## 🔵 P2: MELO V2 (Background)

**Status:** Maintenance mode - Assign to specialists as capacity allows

---

## 📐 MANAGEMENT HIERARCHY

```
👑 Aaron + Sophie — Direction
   │
   └── 👔 Person Manager (Opus, 4x/day) — Master Plans, Epics
       │
       ├── 📐 Story Architect (Opus) — User Stories with ACs
       │
       └── 🎯 Coordinator (Sonnet) — Sprint planning, oversight
           │
           ├── 🏃 Scrum Master (Sonnet, 15-30 min) — Task assignment
           │
           └── 👥 Development Team
               │
               ├── 🎨 Phoenix — Frontend
               ├── ⚙️ Atlas — Backend
               ├── 🏛️ Athena — Architecture
               ├── 🧪 Mercury — QA
               ├── 🛡️ Forge — DevOps
               ├── 👁️ Argus — Audit
               └── 🔍 Sentinel — Validation
```

---

## 📊 QUALITY GATES (All Projects)

Before claiming ANY task complete:

```
□ All beads CLOSED
□ E2E tests PASS (actual output)
□ Unit tests PASS
□ Screenshots at 3 viewports
□ Independent validator sign-off
□ Evidence in scheduler/evidence/{bead-id}/
```

**See:** `scheduler/QUALITY-GATES.md`

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `scheduler/TASK-ROUTING.md` | How tasks get assigned to specialists |
| `scheduler/specialists/*/IDENTITY.md` | Specialist role definitions |
| `scheduler/scrum-master/IDENTITY.md` | Scrum Master definition |
| `scheduler/validator/IDENTITY.md` | Validator definition |
| `memory/projects/agent-team-restructure/` | Full restructure research |

---

**Last Updated:** 2026-03-06 00:00 EST
**Updated By:** Sophie (Agent Team Restructure)
