# Proactive Jobs

**Updated:** 2026-02-19 (CORRECTED)

---

## 🚨 PROJECT CLARIFICATION (2026-02-19)

> **AARON'S DIRECTION:**
> "WE ARE SUPPOSED TO BE DOING MELO V2, having the frontend from the discord clone and the backend using matrix. CANCEL ALL OTHER THINGS. NO HAOS. NOTHING."

### ✅ THE PROJECT IS: **MELO V2**

| Item | Value |
|------|-------|
| **Project Name** | MELO V2 |
| **Location** | `/home/ubuntu/repos/melo` |
| **Frontend** | Discord clone (nayak-nirmalya/discord-clone) |
| **Backend** | Matrix |

### ❌ NOT THESE:
- ~~HAOS~~
- ~~haos-v2~~
- ~~~/repos/haos/~~

---

## 🎯 AARON'S DIRECTION (2026-02-18 19:12 EST)

> "Frontend should literally be the discord clone + features and the backend should be the matrix stuff."

**Translation:**
- **Frontend** = Copy discord-clone EXACTLY, add features on top
- **Backend** = Matrix (stays as-is, no changes needed)

---

## 🔴 MELO V2 UI — Phase 2: Component Replacement

**Status:** 🔄 IN PROGRESS
**Started:** 2026-02-18 19:13 EST
**Model:** Sonnet/Opus ONLY (NO Haiku for UI)

### Component Progress

| Component | Status | Model | Notes |
|-----------|--------|-------|-------|
| navigation-sidebar | ✅ COMPLETE | sonnet | Exact copy implemented, adapted for Matrix auth |
| navigation-item | ✅ COMPLETE | sonnet | Exact copy with hover states and routing |
| navigation-action | ✅ COMPLETE | sonnet | Exact copy with tooltip and modal integration |
| server-sidebar | ✅ COMPLETE | sonnet | 8 components (sidebar, header, search, section, channel, member), 54 tests passing |
| server-header | ✅ COMPLETE | sonnet | Included in server-sidebar batch |
| server-channel | ✅ COMPLETE | sonnet | Included in server-sidebar batch |
| chat-header | 🔴 spawn-failed | sonnet | Spawn attempt failed, retry needed |
| chat-input | ✅ COMPLETE | sonnet | Multiple implementations completed |
| chat-messages | 🔄 in-progress | sonnet | Spawned for implementation |
| chat-item | 🔄 in-progress | sonnet | Spawned for implementation |
| modals (all) | 🔄 in-progress | sonnet | Spawned for implementation |

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

--- [Rest of the file remains the same]