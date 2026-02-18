# PROACTIVE-JOBS.md — Task Manager Work Queue

**Updated:** 2026-02-18 17:30 EST  
**Status:** 🔴 ALL WORK HALTED — Awaiting UI Fix Direction

---

## ⛔ WORK STOPPAGE NOTICE

**All ongoing melo work is CANCELLED per Aaron's directive.**

Previous tasks were building UI incorrectly. The entire approach was wrong:
- UI was built from scratch instead of adapting the Discord clone reference
- Haiku was assigned UI work (cannot do visual design)
- No visual verification was performed
- Hours wasted on bad output

**DO NOT resume any melo work until Phase 1 of the UI Fix is complete.**

See: `scheduler/coordinator/JOBS.md` for the comprehensive fix plan.

---

## 🔴 Active Tasks

### MELO-UI-FIX-P1: Discord Clone Reference Setup
**Status:** pending  
**Assigned:** NOT HAIKU — Sonnet/Opus only  
**Model:** opus  
**Priority:** CRITICAL  

**Description:** Set up the discord-clone reference repo and create component mapping.

**Sub-Tasks:**
1. Clone `nayak-nirmalya/discord-clone` to `/tmp/discord-clone-ref`
2. Install dependencies and get it running
3. Take reference screenshots of all major views
4. Create component-to-component mapping document
5. Extract exact color palette and design tokens

**📋 Acceptance Criteria (MANDATORY)**
- [ ] Discord clone repo cloned and running locally
- [ ] Reference screenshots captured for: navigation sidebar, server sidebar, channel view, chat view, modals
- [ ] Component mapping document created at `/home/ubuntu/repos/melo/docs/DISCORD-CLONE-MAPPING.md`
- [ ] Design tokens extracted (colors, spacing, typography)

**🧪 Validation Steps (MANDATORY)**
1. `ls /tmp/discord-clone-ref/components` — directory exists
2. Screenshots exist and show Discord-like UI
3. Mapping doc is complete and comprehensive

**Completion Actions:**
- [ ] Document created and committed
- [ ] Screenshots saved to `/home/ubuntu/repos/melo/docs/reference-screenshots/`
- [ ] Report to Coordinator that Phase 1 is complete

---

## 📚 Work Rules — READ BEFORE ANY TASK

### Model Assignment Rules

| Task Type | Model | Reason |
|-----------|-------|--------|
| UI design/implementation | Sonnet/Opus | Requires visual judgment |
| Visual verification | Sonnet/Opus | Must interpret screenshots |
| Clear step-by-step execution | Haiku | Only if steps are explicit |
| Planning/architecture | Opus | Complex reasoning |

**⚠️ NEVER assign Haiku to:**
- UI design
- Visual comparison
- Anything requiring judgment about "how it looks"

### Visual Verification (MANDATORY for UI)

Every UI change must follow this workflow:
```
1. Make change
2. Run app (pnpm dev)
3. Take Playwright screenshot
4. Compare to reference
5. If different → fix and repeat
6. Only mark done when visually verified
```

### Reference Files

- **UI Design Lessons:** `memory/topics/ui-design-lessons.md`
- **Coordinator Plan:** `scheduler/coordinator/JOBS.md`
- **Discord Clone Mapping:** (to be created) `/home/ubuntu/repos/melo/docs/DISCORD-CLONE-MAPPING.md`

---

## Archived Tasks (Previous Work — UI INVALIDATED)

> ⚠️ The following tasks built incorrect UI. Their functionality may be preserved but visual output is wrong.

<details>
<summary>Click to expand archived tasks</summary>

### P0-P3 Tasks
All marked complete but UI was built incorrectly. Test infrastructure is valid; UI components must be replaced.

</details>

---

## Notes

This file is checked by Task Manager cron every 15 minutes.

**Current state:** Waiting for MELO-UI-FIX-P1 to be assigned and started.

**Escalation:** If blocked, escalate to Coordinator → Person Manager → Aaron
