# Person Manager Jobs

> **CEO Role:** This agent ALWAYS runs. Check system health every time.

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

This is **MELO V2**. The UI must BE the discord-clone, not "inspired by" it.

---

## 🔴 MELO V2 UI — DISCORD-CLONE COPY

### Current State

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 1: Reference Setup | ✅ COMPLETE | 54 components mapped, design tokens extracted |
| Phase 2: UI Component Replacement | 🔄 IN PROGRESS | Started 2026-02-18 19:13 EST |
| Phase 3: Admin Features | ⏳ PENDING | Blocked by Phase 2 |
| Phase 4: Integration & Polish | ⏳ PENDING | Blocked by Phase 3 |

### Phase 2 Progress
- **navigation-sidebar** — ✅ COMPLETE
- **navigation-item** — ✅ COMPLETE
- **navigation-action** — ✅ COMPLETE
- **server-sidebar** — ✅ COMPLETE
- **chat-header** — 🔄 in-progress
- **chat-input** — ✅ COMPLETE
- **chat-messages** — 🔄 in-progress
- **chat-item** — 🔄 in-progress
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
| `~/repos/melo/` | MELO V2 — replace components here |
| `memory/topics/ui-design-lessons.md` | Lessons learned |

---

## 🏗️ Managed Agents

### Coordinator
- **Jobs File:** `scheduler/coordinator/JOBS.md`
- **Status:** ✅ ALIGNED — Has Aaron's direction, Phase 2 in progress

### Task Managers (Proactive Scheduler)
- **Jobs File:** `PROACTIVE-JOBS.md`
- **Status:** ✅ ALIGNED — Updated with MELO V2 Phase 2 tasks

---

## Next Steps (Person Manager)

1. **VERIFY** Coordinator is executing Phase 2 correctly
2. **MONITOR** sub-agent progress on components
3. **QUEUE** next components as each completes (max 2 concurrent)
4. **REPORT** progress to Slack #aibot-chat
5. **VALIDATE** each component visually before marking complete

**Critical:** Frontend = discord-clone copy. Backend = Matrix. No Haiku on UI. Visual verification mandatory.
