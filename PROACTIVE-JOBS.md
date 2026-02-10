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
> - After completing tasks: update `HAOS-COMPREHENSIVE-TASKS.md` in the project repo!
> - Check off completed items, update summary counts

---

## Active Tasks (In-Progress)

### haos-phase5-notifications
- **Type:** continuous
- **Min Model:** opus
- **Priority:** high
- **Project:** haos
- **Description:** Complete Phase 5 notification features (P5-101 to P5-118)
- **Created:** 2026-02-10
- **Status:** in-progress
- **Notes:** Agent restarted on [2026-02-10 15:45 EST]
- **Instructions:**
  1. Implement desktop notifications (Web Notification API)
  2. Implement notification sounds
  3. Create per-channel notification settings UI
  4. Create per-server notification settings UI
  5. Implement notification mute timing options
  6. Implement suppress @everyone/@here options
  7. Create unread channel indicator styling
  8. Implement mark as read (channel/server/all)
  9. Create Inbox component (mentions + unreads tabs)
  10. Build and verify
  11. Update HAOS-COMPREHENSIVE-TASKS.md

### haos-phase6-moderation ✅ COMPLETE
- **Type:** continuous
- **Min Model:** opus
- **Priority:** high
- **Project:** haos
- **Description:** Complete Phase 6 moderation actions (P6-001 to P6-060)
- **Created:** 2026-02-10
- **Status:** complete
- **Completed:** 2026-02-10 22:15 EST
- **Notes:** Validated by sub-agent - all moderation, automod, and audit log tasks complete
- **Results:**
  - Moderation modals: Kick, Ban, Timeout, Unban, BulkDelete, SlowMode, ChannelLock, ServerLockdown, Warn, WarnLog
  - AutoMod system: 25 rule types with actions and exemptions (P6-036 to P6-060)
  - Audit log: Viewer, entry component, event mapper (P6-021 to P6-035)
  - ~7470 lines of code
  - Fixed automod export in haos/index.ts
  - Git commits: 2d1a423, 5a8d742, fb12df3, fd15d40, 2d63a78
  - P6-017/P6-018 deferred (require server onboarding flow)

(Remaining content unchanged)