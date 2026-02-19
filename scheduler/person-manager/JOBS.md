# Person Manager Jobs

> **CEO Role:** This agent ALWAYS runs. Check system health every time.

**Updated:** 2026-02-18 19:19 EST

---

## 🎯 AARON'S DIRECTION (2026-02-18 19:12 EST)

> "Frontend should literally be the discord clone + features and the backend should be the matrix stuff."

**Translation:**
- **Frontend** = Copy discord-clone EXACTLY, add HAOS features on top
- **Backend** = Matrix (stays as-is, no changes needed)

This is **HAOS**, not melo. The UI must BE the discord-clone, not "inspired by" it.

---

## 🔴 HAOS UI — DISCORD-CLONE COPY

### Current State

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 1: Reference Setup | ✅ COMPLETE | 54 components mapped, design tokens extracted |
| Phase 2: UI Component Replacement | 🔄 IN PROGRESS | Started 2026-02-18 19:13 EST |
| Phase 3: Admin Features | ⏳ PENDING | Blocked by Phase 2 |
| Phase 4: Integration & Polish | ⏳ PENDING | Blocked by Phase 3 |

### Phase 2 Progress
- **navigation-sidebar** — 🔄 IN PROGRESS (Sonnet sub-agent spawned)
- **navigation-item** — ⏳ pending
- **navigation-action** — ⏳ pending
- **server-sidebar** — ⏳ pending
- **chat components** — ⏳ pending
- **modals** — ⏳ pending

---

## 📋 NON-NEGOTIABLE RULES

### 1. Frontend = Discord-Clone Copy
- Copy EXACT JSX structure from discord-clone
- Copy EXACT Tailwind classes
- Copy EXACT color values
- Only change data layer (Prisma → Matrix hooks)
- Do NOT "improve" or "simplify" — COPY

### 2. Backend = Matrix (No Changes)
- Matrix integration stays as-is
- No backend work needed for UI fix
- Only data fetching adapts (Discord Prisma → Matrix hooks)

### 3. NO HAIKU FOR UI WORK
- All UI work: Sonnet or Opus ONLY
- Haiku cannot judge visual design
- This is NON-NEGOTIABLE

### 4. ALWAYS VISUALLY VERIFY
- Playwright screenshots after each component
- Compare to discord-clone reference
- Fix until visually identical

---

## 📁 Key References

| File | Purpose |
|------|---------|
| `~/repos/discord-clone/` | THE reference — copy from here |
| `~/repos/haos/frontend/` | HAOS frontend — replace components here |
| `scheduler/coordinator/notes/haos-ui-phase1/component-mapping.md` | What maps where |
| `scheduler/coordinator/notes/haos-ui-phase1/design-tokens.md` | Exact colors, spacing, fonts |
| `memory/topics/ui-design-lessons.md` | Lessons learned |

---

## 🏗️ Managed Agents

### Coordinator
- **Jobs File:** `scheduler/coordinator/JOBS.md`
- **Status:** ✅ ALIGNED — Has Aaron's direction, Phase 2 in progress

### Task Managers (Proactive Scheduler)
- **Jobs File:** `PROACTIVE-JOBS.md`
- **Status:** ✅ ALIGNED — Updated with HAOS Phase 2 tasks

---

## Next Steps (Person Manager)

1. **VERIFY** Coordinator is executing Phase 2 correctly
2. **MONITOR** sub-agent progress on navigation-sidebar
3. **QUEUE** next components as each completes (max 2 concurrent)
4. **REPORT** progress to Slack #aibot-chat
5. **VALIDATE** each component visually before marking complete

**Critical:** Frontend = discord-clone copy. Backend = Matrix. No Haiku on UI. Visual verification mandatory.
