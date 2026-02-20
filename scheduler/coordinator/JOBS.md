# Coordinator Jobs

**Updated:** 2026-02-19 21:30 EST

---

## 🚨 HIGH PRIORITY: WYDOT APRIL 2021 ATTACK

| Item | Value |
|------|-------|
| **Project** | WYDOT Constant Offset Attack |
| **Server** | Jaekel (`ssh jaekel`) |
| **Location** | `/home/ubuntu/repos/ConnectedDrivingPipelineV4/` |
| **Full Plan** | `scheduler/coordinator/notes/wydot-apr2021-attack-plan.md` |

### Current Status: Phase 1 - Data Download
- **PID:** 460811 (curl under nohup)
- **Started:** 2026-02-19 21:27 EST
- **Expected:** 13,318,200 rows (~11-12GB, ~2-3 hours)

### Your Tasks

#### 1. Monitor Download (Every 30 min)
```bash
# Check if still running
ssh jaekel "ps aux | grep 460811 | grep -v grep"

# Check progress
ssh jaekel "ls -lh /home/ubuntu/repos/ConnectedDrivingPipelineV4/April_2021_Wyoming_Data.csv"
ssh jaekel "wc -l /home/ubuntu/repos/ConnectedDrivingPipelineV4/April_2021_Wyoming_Data.csv"
```

#### 2. When Download Completes
1. Verify row count = 13,318,201 (13,318,200 + header)
2. Spawn worker to convert CSV → Parquet
3. Update status in `scheduler/coordinator/notes/wydot-apr2021-attack-plan.md`

#### 3. After Conversion
1. Run attack pipeline: `DaskMClassifierConstOffsetPerID100To200.py`
2. Monitor for completion
3. Collect results and post to Slack

### Contingencies
- Download fails → Re-run with `--continue-at -`
- Out of memory → Reduce Dask workers in config
- Low disk space → Check `df -h /home/ubuntu/`

---

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

## The Previous Problem (Now Fixed)

We were incorrectly calling this "HAOS" in job files. The project is MELO V2.
- ❌ Wrong path: `~/repos/haos/frontend/` (doesn't exist)
- ✅ Correct path: `~/repos/melo/`

---

## 🔴 MELO V2 UI — DISCORD-CLONE COPY

### Phase 1: Reference Setup ✅ COMPLETE
**Model:** Opus
**Status:** ✅ COMPLETE
**Completed:** 2026-02-18 19:11 EST

**Completed Work:**
- [x] Discord-clone cloned to `/tmp/discord-clone-ref/`
- [x] Component mapping completed (54 components)
- [x] Design tokens extracted (colors, typography, spacing)
- [x] Reference setup complete

**Key Finding:** MELO is a fork of discord-clone. Component structures nearly identical.

---

### Phase 2: UI Component Replacement ✅ COMPLETE
**Model:** Sonnet/Opus ONLY (no Haiku for UI)  
**Status:** ✅ COMPLETE
**Completed:** 2026-02-19 01:03 EST
**Build Verification:** ✅ pnpm build successful

For EACH component, follow this workflow:
1. Read the discord-clone component source
2. Copy the EXACT JSX structure and Tailwind classes
3. Replace only the data layer (Prisma → Matrix hooks)
4. Keep the EXACT same visual styling
5. Take Playwright screenshot after implementing
6. Compare to reference screenshot
7. Iterate until visually matching

**Components to replace (priority order):**

| Discord Clone Component | Melo V2 Equivalent | Priority |
|-------------------------|-------------------|----------|
| `navigation/navigation-sidebar.tsx` | `components/navigation/navigation-sidebar.tsx` | P0 |
| `navigation/navigation-item.tsx` | `components/navigation/navigation-item.tsx` | P0 |
| `navigation/navigation-action.tsx` | `components/navigation/navigation-action.tsx` | P0 |
| `server/server-sidebar.tsx` | `components/navigation/spaces-navigation.tsx` | P0 |
| `server/server-header.tsx` | TBD | P1 |
| `server/server-channel.tsx` | TBD | P1 |
| `chat/chat-header.tsx` | TBD | P1 |
| `chat/chat-input.tsx` | `components/chat/chat-input.tsx` | P1 |
| `chat/chat-messages.tsx` | TBD | P1 |
| `chat/chat-item.tsx` | TBD | P1 |
| All modal components | `components/modals/*` | P2 |

**Visual Verification Process (MANDATORY):**
```bash
# After each component change:
# 1. Run the app
pnpm dev

# 2. Take screenshot with Playwright
# 3. Compare to reference
# 4. Fix any visual differences
# 5. ONLY mark done when visually verified
```

**Acceptance Criteria:**
- [ ] Each component visually matches discord-clone reference
- [ ] Screenshots taken and compared for each component
- [ ] All colors match exactly: dark:bg-[#1e1f22], bg-[#e3e5e8], etc.
- [ ] Layout structure identical to reference

---

### Phase 3: Setup Wizard & Admin Features 🔄 IN PROGRESS  
**Model:** Sonnet/Opus ONLY
**Status:** 🔄 IN PROGRESS
**Started:** 2026-02-19 01:02 EST
**Plan:** ~/clawd/docs/plans/melo-v2/phases/PHASE-3.md (v1, under review)

Restyle existing functionality to match Discord's aesthetic:

1. **Setup Wizard** — Initial server setup flow → Discord-style server creation
2. **Homeserver Management** — Admin settings → Discord-style server settings  
3. **Invite System** — Invite links and management → Discord-style invite system

**Current Status:** Phase plan created, awaiting reviewer feedback before task population

---

### Phase 4: Integration & Polish
**Model:** Sonnet/Opus
**Status:** pending

1. Verify full application flow looks like Discord
2. Check responsive behavior matches
3. Verify dark/light mode toggle works
4. Final screenshot comparison of full application

---

## 📋 Work Rules (NON-NEGOTIABLE)

### 1. NO HAIKU FOR UI WORK
Haiku cannot judge visual design. All UI work must use:
- **Sonnet** — for implementation
- **Opus** — for planning and complex decisions

### 2. ALWAYS VISUALLY VERIFY
Every UI change must be verified with Playwright screenshots.

### 3. COPY, DON'T CREATE
- ✅ Copy exact JSX structure
- ✅ Copy exact Tailwind classes
- ✅ Copy exact color values
- ✅ Only change data fetching (Prisma → Matrix)
- ❌ Don't "improve" the UI
- ❌ Don't "simplify" components
- ❌ Don't invent new styling

---

## 📁 Key References

| File | Purpose |
|------|---------|
| `~/repos/discord-clone/` | THE reference — copy from here |
| `~/repos/melo/` | MELO V2 — replace components here |
| `memory/topics/ui-design-lessons.md` | Lessons learned |

---

## Notes

**Report to:** Person Manager
**Escalate to:** Aaron if blocked
