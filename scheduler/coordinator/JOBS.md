# Coordinator Jobs

> **Rule:** If "Active Projects" AND "Active Topics" are both empty, reply `HEARTBEAT_OK` immediately.

## Active Projects

### haos-v2
- **Status:** 🔄 PHASE 6 IN PROGRESS — Full Implementation
- **Priority:** HIGH (Aaron's direct order: "fully implement all parts of haos")
- **Current Phase:** Phase 6 — Full Implementation
- **Last Progress:** 2026-02-14 01:00 EST — Deployed correct codebase to port 80
- **Notes:** `notes/projects/haos-v2.md`
- **Current Status:** DEPLOYED — https://dev2.aaroncollins.info (port 80 via Caddy)
- **Code Quality:** 7.5/10 — Core working, features pending
- **Pending Tasks:** 9 (see PROACTIVE-JOBS.md)
- **Next Steps:** Execute p6-8 (quick fix), then p6-1 (cleanup), then p6-2 (DMs)

## Active Topics

(none currently)

## Paused Projects

(none)

## Completed (Ready for Archive)

(none)

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
