# Proactive Jobs

> ⚠️ **This is for CONTINUOUS PROJECT WORK only!**  
> For scheduled tasks (daily, weekly, etc.) use regular cron jobs instead.

> 🔢 **MAX 2 DEV TASKS IN-PROGRESS**
> - Keep at most 2 tasks with `Status: in-progress` at a time
> - Remaining tasks stay `Status: pending` (scheduled, not running)
> - This prevents resource contention and context switching overhead
> - When a task completes, the next pending task can be promoted

> 🚨 **FULL COMPLETION STANDARD**
> - "Done" means **PRODUCTION READY** — no placeholders, no stubs, no "iterate later"
> - If a feature needs SDK integration → INTEGRATE IT, don't stub it
> - If you can't fully complete something → be honest, don't claim it's done
> - Every completion must pass validation: builds, works end-to-end, no TODOs left

> 📝 **KEEP DOCS IN SYNC**
> - After completing tasks: update `MASTER-TODO.md` in the project repo!
> - Check off completed items, update percentages, remove blockers that are solved

## Active Tasks

### haos-phase3-server-wizard
- **Type:** continuous
- **Min Model:** sonnet
- **Priority:** high
- **Project:** haos
- **Description:** Complete server wizard Matrix integration. UI done (HaosServerWizard.tsx), needs Space creation. Tasks P3-008 to P3-018.
- **Created:** 2026-02-10
- **Status:** in-progress
- **Escalation:** none
- **Instructions:** 
  1. ✅ Wizard UI complete with templates (Gaming, Friends, Community, Creators)
  2. [ ] P3-008-P3-011: Server icon handling (upload, crop, save)
  3. [ ] P3-012-P3-018: Create Matrix Space on submit with default categories/channels/roles
  4. Read existing HaosServerWizard.tsx, add Matrix SDK integration
  5. Test Space creation end-to-end
  6. Update MASTER-TODO.md when done!

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

### haos-visual-validation
- **Type:** continuous
- **Min Model:** sonnet
- **Priority:** critical
- **Project:** haos
- **Description:** Validate HAOS UI matches Discord perfectly. Fix any issues until GORGEOUS and professional.
- **Created:** 2026-02-10
- **Status:** pending
- **Escalation:** none
- **Notes:** Deploy to dev2, view in browser, screenshot, compare to Discord, fix CSS/components until perfect
- **Instructions:**
  1. Deploy HAOS production build to dev2.aaroncollins.info (replace Element)
  2. View in browser, take screenshots of: login, main chat, sidebar, voice panel, settings
  3. Compare each to Discord screenshots
  4. Identify visual issues (spacing, colors, fonts, icons, layout)
  5. Fix issues in code, rebuild, redeploy
  6. Repeat until UI is PERFECT and professional
  7. Post comparison screenshots to Slack showing before/after and Discord reference

## Archived Tasks

### haos-phase1-themes
- **Completed:** 2026-02-10 01:20 EST
- **Model Used:** opus
- **Notes:** All P1-073 to P1-079 complete. Light theme, AMOLED theme, theme switcher with 9 preset accent colors + custom hue, smooth transitions, documentation. Build passes. Visual validation needed via haos-visual-validation task.

### haos-phase4-voice-infra
- **Completed:** 2026-02-10 16:45 EST
- **Model Used:** opus
- **Notes:** Voice infrastructure was already fully implemented. Validated: types.ts (io.haos.voice.* state events), VoiceConnectionManager.ts (auto-reconnect), HaosVoiceStore.ts, hooks/useHaosVoice.ts. Components updated. TypeScript compiles, build passes.

### haos-phase2-threads
- **Completed:** 2026-02-10 01:15 EST
- **Model Used:** opus
- **Notes:** Complete thread system (P2-102 to P2-107). Implemented thread preview in main chat, archive/unarchive via room account data, member count from timeline events, per-thread notifications, auto-archive, and full threads list panel with filtering/sorting. All Matrix SDK integrated. Git commit 61a9baa.

### haos-phase2-embeds
- **Completed:** 2026-02-10 00:46 EST
- **Model Used:** opus
- **Notes:** Full implementation of URL preview service and platform-specific embeds. Created SpotifyEmbed, TwitchEmbed, EmbedDetector. Enhanced HaosEmbed (removed TODOs), YouTubeEmbed (startTime), url-preview-service (Matrix SDK integration). Added Twitch CSS. All in commit 84896b6.

### haos-phase2-autocomplete
- **Completed:** 2026-02-10 01:00 EST
- **Model Used:** opus
- **Notes:** Created CommandAutocomplete.tsx. Fixed TypeScript warnings. CSS overrides apply Discord styling to existing Element autocomplete. All 4 types complete: @mentions, #channels, :emoji:, /commands. Git commit ddb9fca.

### haos-implementation
- **Completed:** 2026-02-09 23:30 EST
- **Model Used:** sonnet
- **Notes:** Phase 2 CSS and Phase 3 TSX complete. Build passing. Transitioned to phase-specific tasks.

