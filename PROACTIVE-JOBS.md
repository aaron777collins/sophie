## PROACTIVE-JOBS.md - Active Task Queue

**Updated:** 2026-03-02 12:00 EST by Person Manager
**Priority Update from Aaron:** Bible > Matrix Voice Chat > MELO

---

## 🎯 PRIORITY ORDER (Per Aaron, 2026-03-01)

| Priority | Project | Why |
|----------|---------|-----|
| **P0** | Bible Drawing V2 | Core project, highest priority |
| **P1** | Matrix/Element Voice Chat | Enable easier Sophie communication |
| **P2** | MELO V2 | Background maintenance |

---

## 🔴 P0: BDV2 Phase 1 - AUTH SYSTEM

**Status:** Auth infrastructure BLOCKED - clawd-zsk (CSRF fix) stalled

### Current State (2026-03-02 12:00 EST)
| Category | Status | Issues Open |
|----------|--------|-------------|
| Cat 0: Foundation | ⚠️ PARTIAL | Schema incomplete |
| Cat 1: Auth | 🔴 BLOCKED | clawd-zsk stalled, needs reassignment |
| Cat 2: Upload | ⚠️ localStorage only | No DB integration |
| Cat 3-6 | ⏳ BLOCKED | Not started |

### Critical Blocker
- **clawd-zsk (NextAuth CSRF Fix)** - P0-CRITICAL
  - Status: in_progress, assigned to "ubuntu"
  - SECOND false claims incident - validator caught
  - Auth system fundamentally broken
  - **NEEDS:** Proper reassignment and implementation

### Parallel Progress (Rate Limiting)
- ✅ clawd-qn7: Integration complete
- ⏳ clawd-ehb: Needs-review (sent to validator)
- 🔄 clawd-4lu, clawd-atn: In progress

### Open Issues
- 11 P0 tasks in needs-fix (mostly missing screenshots)
- 3 P0 tasks blocked
- 7 tasks in progress

---

## 🟡 P1: Matrix/Element Voice Chat (NEW!)

**Goal:** Self-hosted Element server where Aaron can voice chat with Sophie

### Architecture
```
dev3 VPS
├── Synapse (Matrix homeserver)
├── PostgreSQL (database)
├── LiveKit (WebRTC SFU)
├── lk-jwt-service (Matrix→LiveKit auth)
├── Traefik (reverse proxy + SSL)
└── Sophie Bot (voice participant)
```

### Implementation Plan
1. **Phase 1: Infrastructure** - Deploy Matrix stack via Ansible playbook
2. **Phase 2: Configuration** - Private server, no federation, invite-only room
3. **Phase 3: Sophie Bot** - Custom voice bot using LiveKit SDK
4. **Phase 4: Polish** - Wake on room join, idle when alone

### Status: 🚀 STARTING NOW

---

## 🔵 P2: MELO V2 (Background)

**Status:** Maintenance mode

| Task ID | Title | Status |
|---------|-------|--------|
| clawd-717 | ChatInput Component Tests | in_progress |
| clawd-7v9 | Remaining Matrix Client Issues | in_progress |
| clawd-0bw | Registration Component Tests | in_progress |

Workers continue background progress. Not blocking other work.

---

## 📐 QUALITY GATES (All Projects)

Before claiming ANY task complete:

```
□ All beads CLOSED (bd list returns empty for task)
□ E2E tests PASS (actual output, not "skipped")
□ Unit tests PASS (actual pass, not skip)
□ Screenshots at 3 viewports
□ Independent validator sign-off
□ Acceptance criteria all have evidence
```

**See:** `scheduler/QUALITY-GATES.md`

---

**Last Updated:** 2026-03-01 16:22 EST
**Updated By:** Sophie (priority update from Aaron + new Matrix project)
