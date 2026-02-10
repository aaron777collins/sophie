# Proactive Jobs

> ⚠️ **This is for CONTINUOUS PROJECT WORK only!**  
> For scheduled tasks (daily, weekly, etc.) use regular cron jobs instead.

> 🚨 **FULL COMPLETION STANDARD**
> - "Done" means **PRODUCTION READY** — no placeholders, no stubs, no "iterate later"
> - If a feature needs SDK integration → INTEGRATE IT, don't stub it
> - If you can't fully complete something → be honest, don't claim it's done
> - Every completion must pass validation: builds, works end-to-end, no TODOs left

## Active Tasks

### haos-phase1-themes
- **Type:** continuous
- **Min Model:** sonnet
- **Priority:** high
- **Project:** haos
- **Description:** Complete Phase 1 theme system - light theme, AMOLED theme, theme switcher, accent color customization. Tasks P1-073 to P1-079.
- **Created:** 2026-02-10
- **Status:** pending
- **Escalation:** none
- **Instructions:** Work in `/home/ubuntu/repos/haos/apps/web`. Read `MASTER-TODO.md` for task details. Focus on theme system completion. Commit after each task. Read AGENTS.md memory section - update memory files!

### haos-phase2-autocomplete
- **Type:** continuous
- **Min Model:** sonnet
- **Priority:** high
- **Project:** haos
- **Description:** Implement Discord-style autocomplete for @mentions, #channels, :emoji:, and /commands. Tasks P2-051 to P2-055.
- **Created:** 2026-02-10
- **Status:** pending
- **Escalation:** none
- **Instructions:** Work in `/home/ubuntu/repos/haos/apps/web`. Create autocomplete popup component that works for all completion types. Match Discord behavior exactly.

### haos-phase2-embeds
- **Type:** continuous
- **Min Model:** sonnet
- **Priority:** medium
- **Project:** haos
- **Description:** Implement URL preview fetcher and platform-specific embeds (YouTube, Twitter, Spotify, Twitch). Tasks P2-119 to P2-125.
- **Created:** 2026-02-10
- **Status:** pending
- **Escalation:** none
- **Instructions:** Create Open Graph metadata fetcher. Implement rich embeds for major platforms. Handle embed suppression toggle.

### haos-phase2-threads
- **Type:** continuous
- **Min Model:** sonnet
- **Priority:** medium
- **Project:** haos
- **Description:** Complete thread system - thread preview in main chat, archive/unarchive, member count, notifications, threads list panel. Tasks P2-102 to P2-107.
- **Created:** 2026-02-10
- **Status:** pending
- **Escalation:** none
- **Instructions:** Enhance existing thread panel with full Discord-like functionality.

### haos-phase3-server-wizard
- **Type:** continuous
- **Min Model:** sonnet
- **Priority:** high
- **Project:** haos
- **Description:** Create server creation wizard with templates (gaming, friends, community, creators). Tasks P3-001 to P3-018.
- **Created:** 2026-02-10
- **Status:** pending
- **Escalation:** none
- **Instructions:** Build multi-step modal wizard. Create Matrix Space on submit with default categories, channels, and roles.

### haos-phase3-roles
- **Type:** continuous
- **Min Model:** opus
- **Priority:** critical
- **Project:** haos
- **Description:** Implement Discord-style role system with 50+ permissions, role hierarchy, and Matrix power level mapping. Tasks P3-060 to P3-104. COMPLEX - needs Opus.
- **Created:** 2026-02-10
- **Status:** pending
- **Escalation:** none
- **Notes:** This is the most complex subsystem. Needs careful architecture for io.haos.roles state event and bidirectional sync with Matrix power levels.
- **Instructions:** Design role data structures first. Create custom Matrix state events. Build role editor UI. Implement permission calculator and hierarchy enforcement.

### haos-phase4-voice-infra
- **Type:** continuous
- **Min Model:** opus
- **Priority:** high
- **Project:** haos
- **Description:** Create LiveKit voice integration - token service, VoiceConnectionManager, state events. Tasks P4-001 to P4-015.
- **Created:** 2026-02-10
- **Status:** pending
- **Escalation:** none
- **Notes:** Requires LiveKit server setup. Complex real-time infrastructure.
- **Instructions:** Design voice channel state events (io.haos.voice.*). Create JWT token generation for LiveKit. Build connection manager with reconnection logic.

## Archived Tasks

### haos-implementation
- **Completed:** 2026-02-09 23:30 EST
- **Model Used:** sonnet
- **Notes:** Phase 2 CSS and Phase 3 TSX complete. Build passing. Transitioned to phase-specific tasks.

