# Proactive Jobs

**🚨 EMERGENCY DIRECTIVE UPDATED:** 2026-02-18 19:00 EST

---

## 🔴 MELO UI FIX — All Previous Work CANCELLED

**Context:** Aaron issued emergency directive at 17:24 EST. All previous Matrix migration work is CANCELLED. UI was built wrong from the start - need to copy discord-clone exactly.

**Repository:** `~/repos/melo/`
**Branch:** `discord-ui-migration` (will be reset/cleaned)
**Reference:** `https://github.com/nayak-nirmalya/discord-clone`

---

## Phase 1: Reference Setup & Planning ✅ COMPLETE

**Status:** ✅ COMPLETE
**Model:** opus
**Validated By:** Person Manager
**Completed:** 2026-02-18 19:11 EST

### P1-Setup: Clone Discord Reference & Setup
**Status:** ✅ COMPLETE (validated)
**Git Commit:** 54c37e4

#### Completed Work
1. ✅ Discord-clone cloned at `/tmp/discord-clone-ref/`
2. ✅ Dependencies installed (npm install)
3. ✅ `docs/ui-redesign/reference-setup.md` created (120 lines)
4. ✅ `docs/ui-redesign/component-mapping.md` created (189 lines, 54 components)
5. ✅ `docs/ui-redesign/design-tokens.md` created (299 lines)

#### Validation Notes
- Screenshots deferred (discord-clone requires Clerk auth)
- Will use live Discord app for visual comparison during Phase 2
- **MELO is fork of discord-clone** — can copy exact code styling

---

## Phase 2: UI Component Replacement 🟢 READY

**Status:** 🟢 READY TO START (Phase 1 complete)
**Model:** sonnet/opus ONLY (NO Haiku for UI work)
**Priority:** 🔴 CRITICAL

### Component Priority Order

| Component | Status | Model | Worker |
|-----------|--------|-------|--------|
| navigation-sidebar | attempted-spawn | sonnet | Unable to spawn - gateway timeout |
| navigation-item | pending | sonnet | — |
| navigation-action | pending | sonnet | — |
| server-sidebar | pending | sonnet | — |
| chat components | pending | sonnet | — |
| modals | pending | sonnet | — |

Each component task will be added after Phase 1 completion.

---

## Phase 3: Admin Features Restyling (PENDING Phase 2)

**Status:** pending (blocked by Phase 2)
**Model:** sonnet/opus

- Setup wizard
- Homeserver management  
- Invite system

---

## Phase 4: Integration & Polish (PENDING Phase 3)

**Status:** pending (blocked by Phase 3)
**Model:** sonnet/opus

- Full app verification
- Responsive testing
- Final visual comparison

---

## 🚫 CANCELLED WORK (Reference Only)

The following work was cancelled per Aaron's directive:

- ~~Matrix migration (Phases 1-4)~~
- ~~Type system fixes~~
- ~~SDK integration~~
- ~~Legacy dependency removal~~

These phases were abandoned. UI must be rebuilt using discord-clone as exact reference.

---

## Execution Rules

1. **NO HAIKU FOR UI WORK** — Sonnet/Opus only for visual components
2. **ALWAYS VISUALLY VERIFY** — Playwright screenshots mandatory for each component
3. **COPY, DON'T CREATE** — Exact visual replication of discord-clone
4. **REFERENCE FIRST** — Phase 1 must complete before any UI work
5. **Report progress** — Updates to coordinator every component completion

**Reference Document:** `memory/topics/ui-design-lessons.md`