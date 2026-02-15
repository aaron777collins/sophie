# Coordinator Jobs

> **Rule:** If "Active Projects" AND "Active Topics" are both empty, reply `HEARTBEAT_OK` immediately.

## Active Projects

### HAOS Full Implementation — Phases 8-12
- **Status:** 🔴 **ACTIVE — BEGIN IMMEDIATELY**
- **Priority:** 🔴 CRITICAL (Aaron's direct order)
- **Started:** 2026-02-27 12:00 EST
- **Jobs File:** `PROACTIVE-JOBS.md`
- **Location:** ~/repos/haos-v2
- **Total Tasks:** 53 (across 5 phases)

#### Phase Breakdown

| Phase | Description | Tasks | Priority | Status |
|-------|-------------|-------|----------|--------|
| **Phase 8** | Security Polish | 2 | 🟡 MEDIUM | 🔄 p8-2 in-progress |
| **Phase 9** | Chat Features | 8 | 🟠 HIGH | ⏳ Ready to start |
| **Phase 10** | Server Features | 14 | 🟠 HIGH | ⏳ Ready to start |
| **Phase 11** | User Experience | 15 | 🟡 MEDIUM | ⏳ Ready to start |
| **Phase 12** | Infrastructure | 16 | 🟡 MEDIUM | ⏳ Ready to start |

#### Task Priority Order

**Start with HIGH priority items that have no dependencies:**

1. **p8-3-encryption-ui** (Sonnet) — Lock icon in chat header
2. **p9-1-message-editing** (Sonnet) — Message editing UI
3. **p9-2-message-deletion** (Sonnet) — Message deletion UI
4. **p9-4-mentions** (Sonnet) — @mentions autocomplete
5. **p10-1-role-ui** (Sonnet) — Role management UI
6. **p10-6-user-kick** (Sonnet) — Kick functionality
7. **p10-7-user-ban** (Sonnet) — Ban functionality
8. **p11-1-settings-layout** (Sonnet) — Settings page
9. **p11-12-mobile-audit** (Sonnet) — Mobile responsiveness
10. **p12-9-error-boundaries** (Sonnet) — Error handling

**Note:** Many tasks have dependencies. Check `Depends on:` field before spawning.

#### Worker Slot Management

- **Max Slots:** 2
- **Current:** Check p8-2-device-prompts status first
- **Strategy:** Keep 2 parallel workers running at all times

## Active Topics

(none currently)

## Paused Projects

(none)

## Completed (Ready for Archive)

### haos-v2 — Phase 7 Complete ✅ CRITICAL SECURITY FIXED
- **Status:** ✅ PHASE 7 COMPLETE — Security Foundation + Voice/Video
- **Priority:** 🔴 CRITICAL (Aaron's direct order fulfilled)
- **Completed:** 2026-02-14 16:30 EST — All 11 tasks finished
- **Final Status:** PRODUCTION-READY WITH FULL E2EE — https://dev2.aaroncollins.info
- **Critical Achievement:** Fixed ZERO E2EE → Full Element-level security
- **Security Tasks:** 6/6 complete (crypto init, room encryption, device verification, cross-signing, key backup, secret storage, security audit)
- **Voice/Video Tasks:** 4/4 complete (LiveKit deployment, voice channels, video calls, screen sharing)
- **Code Quality:** 10/10 — Production ready secure Discord clone

### portableralph — Phase 0 Complete ✅ TEST SUITE FIXED
- **Status:** ✅ PHASE 0 COMPLETE — Deep Analysis & Fix Implementation
- **Priority:** HIGH (Aaron requested "rock solid" production readiness)
- **Completed:** 2026-02-14 15:00 EST — All 5 analysis + 7 fix tasks finished
- **Final Status:** ALL TESTS PASSING (10/10 test suites)
- **Achievement:** Test suite restored from 30% → 100% passing
- **Repository:** https://github.com/aaron777collins/portableralph
- **Deliverables:** Complete fix strategy with priorities and estimates

### haos-v2 — Phase 6 Complete ✅ (Previous)
- **Status:** ✅ PHASE 6 COMPLETE — Full Implementation 
- **Priority:** HIGH (Aaron's direct order fulfilled)
- **Completed:** 2026-02-15 05:46 EST — All 9 tasks finished
- **Final Status:** DEPLOYED & FEATURE-COMPLETE — https://dev2.aaroncollins.info
- **Code Quality:** 9/10 — Production ready Discord clone
- **Tasks Completed:** 9/9 (DMs, friends, threads, pinning, reactions, cleanup, etc.)

## Notes

- [2026-02-27 12:00] **PHASE 8-12 ACTIVATED** — Aaron ordered full HAOS implementation
- [2026-02-27 12:00] **53 new tasks** queued in PROACTIVE-JOBS.md
- [2026-02-27 12:00] **Priority:** Chat features (P9) and Server features (P10) are highest impact
- [2026-02-14 01:00] **PHASE 6 STARTED** — Sophie deployed correct codebase from dev3 to dev2
- [2026-02-14 00:30] **STATUS VERIFICATION COMPLETE** — Phase 5 deployed but discovered wrong codebase was live
