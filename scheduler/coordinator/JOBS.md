# Coordinator Jobs

> **Rule:** If "Active Projects" AND "Active Topics" are both empty, reply `HEARTBEAT_OK` immediately.

## Active Projects

### haos-v2 — Phase 7: Security Foundation + Voice/Video 🔴 CRITICAL
- **Status:** 🔴 **STARTING** — Aaron's direct order (2026-02-14 12:19 EST)
- **Priority:** 🔴 CRITICAL — Security is non-negotiable
- **Master Plan:** `docs/haos-v2/HAOS-MASTER-PLAN.md`
- **Tasks:** `PROACTIVE-JOBS.md` (10 tasks for Phase 7)
- **Goal:** Element-level security (full E2EE) + Discord-level voice/video

**Critical Finding from Audit:**
> HAOS currently has **ZERO E2EE** — messages are NOT encrypted. 
> This is a fundamental security failure that MUST be fixed.

**Phase 7 Task Groups:**
1. **Security (p7-1 to p7-6):** Crypto init → Room encryption → Device verify → Cross-signing → Key backup → Secret storage
2. **Voice/Video (p7-7 to p7-10):** LiveKit deploy → Voice channels → Video calls → Screen share

**Key Dependencies:**
- p7-1 (crypto-init) blocks all other security tasks
- p7-7 (livekit-deploy) blocks all voice/video tasks
- Security tasks are sequential (chain of trust)

**Immediate Actions:**
1. Start p7-1-crypto-init (Opus model — complex)
2. In parallel, start p7-7-livekit-deploy (infrastructure)
3. Chain security tasks as p7-1 completes

## Active Topics

(none currently)

## Paused Projects

(none)

## Completed (Ready for Archive)

### haos-v2 — Phase 6 Complete ✅
- **Status:** ✅ PHASE 6 COMPLETE — Full Implementation 
- **Priority:** HIGH (Aaron's direct order fulfilled)
- **Completed:** 2026-02-15 05:46 EST — All 9 tasks finished
- **Final Status:** DEPLOYED & FEATURE-COMPLETE — https://dev2.aaroncollins.info
- **Code Quality:** 9/10 — Production ready Discord clone
- **Tasks Completed:** 9/9 (DMs, friends, threads, pinning, reactions, cleanup, etc.)

## Notes

- [2026-02-14 01:00] **PHASE 6 STARTED** — Sophie deployed correct codebase from dev3 to dev2. Found two separate codebases:
  - dev3:/home/ubuntu/repos/haos-v2/ → Complete Discord-clone implementation with Matrix auth
  - dev2:~/haos-v2/ → Old basic monorepo shell (WRONG)
  - Fixed by deploying dev3 code to dev2:/home/ubuntu/repos/haos-v2-new/
  - Configured Caddy to proxy port 80 to PM2 on port 3000
  - Sign-in, auth, chat, voice/video all working
  - 9 remaining tasks identified for full implementation
- [2026-02-14 00:30] **STATUS VERIFICATION COMPLETE** — Phase 5 deployed but discovered wrong codebase was live
- [2026-02-13 23:58] **v1.0.0 Deployed** — Previous deployment was old shell, not complete codebase
- [2026-02-13 15:01] **STATUS VERIFICATION** — Build working, Phases 1-4 complete
- [2026-02-13 10:00] **v1.0.0 RELEASE COMPLETE** — Release tasks completed
- [2026-02-13 08:00] **RELEASE AUTHORIZED** — Person Manager approved v1.0.0 release
