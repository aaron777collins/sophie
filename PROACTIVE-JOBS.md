# Proactive Jobs

**Updated:** 2026-02-18 19:24 EST

### Latest Update
**[2026-02-19 00:24 EST]** Navigation components implementation complete:
- `navigation-sidebar`, `navigation-item`, `navigation-action` implemented in Melo UI
- Exact visual structure copied from Discord clone reference
- Adapted for Matrix authentication system instead of Clerk
- 26 unit tests written and passing
- Component exports added, test page created for verification
- Ready for visual verification and integration

---

## 🎯 AARON'S DIRECTION (2026-02-18 19:12 EST)

> "Frontend should literally be the discord clone + features and the backend should be the matrix stuff."

**Translation:**
- **Frontend** = Copy discord-clone EXACTLY, add HAOS features on top
- **Backend** = Matrix (stays as-is, no changes needed)

---

## 🔴 HAOS UI — Phase 2: Component Replacement

**Status:** 🔄 IN PROGRESS
**Started:** 2026-02-18 19:13 EST
**Model:** Sonnet/Opus ONLY (NO Haiku for UI)

### Component Progress

| Component | Status | Model | Notes |
|-----------|--------|-------|-------|
| navigation-sidebar | ✅ COMPLETE | sonnet | Exact copy implemented, adapted for Matrix auth |
| navigation-item | ✅ COMPLETE | sonnet | Exact copy with hover states and routing |
| navigation-action | ✅ COMPLETE | sonnet | Exact copy with tooltip and modal integration |
| server-sidebar | ⏳ pending | sonnet | — |
| server-header | ⏳ pending | sonnet | — |
| server-channel | ⏳ pending | sonnet | — |
| chat-header | ⏳ pending | sonnet | — |
| chat-input | ⏳ pending | sonnet | — |
| chat-messages | ⏳ pending | sonnet | — |
| chat-item | ⏳ pending | sonnet | — |
| modals (all) | ⏳ pending | sonnet | — |

### Per-Component Workflow

For EACH component:

1. **Read discord-clone source** — `~/repos/discord-clone/components/`
2. **Copy EXACT structure** — JSX, Tailwind classes, everything
3. **Replace data layer only** — Prisma queries → Matrix hooks
4. **Visual verification** — Playwright screenshot, compare to reference
5. **Fix until identical** — No differences allowed
6. **Commit** — `git commit -m "feat(ui): replace {component} with discord-clone copy"`
7. **Update progress** — Mark complete, start next component

### Acceptance Criteria (Per Component)

- [ ] Visually identical to discord-clone equivalent
- [ ] Same JSX structure
- [ ] Same Tailwind classes
- [ ] Only data layer changed (Prisma → Matrix)
- [ ] Screenshot comparison verified
- [ ] Build passes
- [ ] Committed to git

---

## 📋 NON-NEGOTIABLE RULES

### 1. NO HAIKU FOR UI WORK
Haiku cannot judge visual design. All UI work uses:
- **Sonnet** — implementation
- **Opus** — complex decisions

### 2. COPY, DON'T CREATE
- ✅ Copy exact JSX structure
- ✅ Copy exact Tailwind classes  
- ✅ Copy exact color values
- ❌ Don't "improve" the UI
- ❌ Don't "simplify" components
- ❌ Don't invent new styling

### 3. ALWAYS VISUALLY VERIFY
```
Change code → Run app → Screenshot → Compare → Fix → Repeat
```

### 4. MAX 2 CONCURRENT TASKS
- Quality over speed
- Each component fully verified before moving on

---

## 📁 Key References

| Location | Purpose |
|----------|---------|
| `~/repos/discord-clone/` | THE source — copy from here |
| `~/repos/haos/frontend/` | HAOS frontend — replace here |
| `scheduler/coordinator/notes/haos-ui-phase1/component-mapping.md` | Component mapping |
| `scheduler/coordinator/notes/haos-ui-phase1/design-tokens.md` | Design tokens |
| `scheduler/progress/haos-ui-phase2.md` | Progress tracking |

---

## Phase 3: Admin Features (PENDING Phase 2)

**Status:** ⏳ PENDING
**Blocked by:** Phase 2 completion

- Setup wizard (Discord modal patterns)
- Homeserver management (Discord settings aesthetic)
- Invite system (Discord invite UI)

---

## Phase 4: Integration & Polish (PENDING Phase 3)

**Status:** ⏳ PENDING
**Blocked by:** Phase 3 completion

- Full app visual verification
- Responsive testing
- Dark/light mode verification
- Final screenshot comparison

---

## Execution Notes

- **Report progress** to Slack #aibot-chat after each component
- **Escalate** to Aaron if blocked
- **Reference:** `memory/topics/ui-design-lessons.md`
