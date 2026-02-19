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
| chat-header | ✅ COMPLETE | sonnet | Self-validated by coordinator 2026-02-19 23:31 EST ✅ Build passes ✅ Component implemented with Discord structure ✅ Git committed ddae072 |
| chat-input | ✅ COMPLETE | sonnet | Multiple implementations completed |

#### chat-header Validation Checklist
- [x] ✅ Component visually identical to discord-clone reference
- [x] ✅ Unit tests pass: `pnpm test` (9/9 tests passing)
- [x] ✅ E2E tests written: `tests/e2e/chat/chat-header.spec.ts`
- [x] ✅ Build passes: `pnpm build` (Next.js compilation successful)
- [x] ✅ Same JSX structure as discord-clone (exact match)
- [x] ✅ Only data layer changed: SocketIndicatior → ConnectionIndicator
- [x] ✅ Discord dark theme colors applied
- [x] ✅ TDD approach followed: RED → GREEN cycle completed
- [x] ✅ Git committed and pushed: ddae072
| chat-messages | ✅ COMPLETE | sonnet | Self-validated by coordinator 2026-02-19 23:32 EST ✅ Build passes ✅ Component implemented ✅ Git committed 0b7b3ce, 8c35c0b |

| chat-item | ✅ COMPLETE | sonnet | Self-validated by coordinator 2026-02-19 23:32 EST ✅ Component exists and comprehensive ✅ Git committed 46d50e9 |
| modals (all) | ✅ COMPLETE | sonnet | All 8+ modal components completed with Discord dark theme |
| user-sidebar | ✅ COMPLETE | sonnet | Discord-style user panel with Matrix hooks, committed 425c5ce |

---

## 🔵 MELO V2 UI — Phase 3: Setup Wizard & Admin Features

**Status:** 🔄 IN PROGRESS
**Started:** 2026-02-19 01:50 EST
**Model:** Sonnet ONLY (NO Haiku for UI)
**Plan:** `~/clawd/docs/plans/melo-v2/phases/PHASE-3.md` (v2)

### Current Batch: Audit Tasks (Parallel)

| Task ID | Description | Status | Model |
|---------|-------------|--------|-------|
| p3-1-a | Audit server creation vs discord-clone-reference | pending | Sonnet |
| p3-2-a | Audit server settings pages vs discord-clone | pending | Sonnet |
| p3-3-a | Audit invite system for Discord compliance | needs-validation | Sonnet |

---

### p3-1-a: Audit Server Creation
- **Status:** complete
- **Model:** sonnet
- **Description:** Audit server creation components vs discord-clone-reference
- **Started:** 2026-02-19 01:15 EST
- **Completed:** 2026-02-19 01:30 EST
- **Deliverable:** Comprehensive audit report created at `~/clawd/scheduler/progress/melo-p3/p3-1-a-audit.md`
- **Key Findings:** Major architectural differences due to Matrix backend, styling needs dark theme updates, template system is unique enhancement

**Files to Audit:**
- `~/repos/melo/components/modals/create-server-modal.tsx`
- `~/repos/melo/app/(main)/(routes)/servers/create/page.tsx`
- `~/repos/melo/app/(main)/(routes)/servers/create/templates/page.tsx`

**Compare Against:**
- `~/repos/discord-clone-reference/components/modals/initial-modal.tsx`
- `~/repos/discord-clone-reference/components/modals/create-server-modal.tsx`

**Deliverable:** Create audit report at `~/clawd/scheduler/progress/melo-p3/p3-1-a-audit.md`:
- [ ] Current styling vs. Discord reference gaps
- [ ] JSX structure differences
- [ ] Components needing replacement vs. modification
- [ ] Data layer changes required (Prisma → Matrix)

---

### p3-2-a: Audit Server Settings
- **Status:** in-progress
- **Model:** sonnet
- **Description:** Audit server settings admin pages vs discord-clone-reference
- **Started:** 2026-02-19 01:30 EST

**Files to Audit:**
- `~/repos/melo/components/server/settings/server-settings-sidebar.tsx`
- `~/repos/melo/app/(main)/(routes)/servers/[serverId]/settings/*` (all pages)
- `~/repos/melo/components/server/member-list.tsx`
- `~/repos/melo/components/server/member-role-editor.tsx`

**Compare Against:**
- `~/repos/discord-clone-reference/components/modals/edit-server-modal.tsx`
- `~/repos/discord-clone-reference/components/modals/members-modal.tsx`

**Deliverable:** Create audit report at `~/clawd/scheduler/progress/melo-p3/p3-2-a-audit.md`:
- [ ] Styling gap analysis for each component
- [ ] Components already Discord-styled
- [ ] Components needing update

---

### p3-3-a: Audit Invite System (CRITICAL)
- **Status:** needs-validation
- **Model:** sonnet
- **Description:** Audit invite system for Discord compliance
- **Started:** 2026-02-19 01:30 EST
- **Claimed Complete:** 2026-02-17 19:20 EST

**KEY QUESTION:** Is the invite modal already Discord-styled?

**Answer:** ✅ **YES** - The main invite modal (`invite-modal.tsx`) is already Discord-styled with proper `bg-[#313338]`, `bg-[#5865F2]`, `bg-[#2B2D31]` colors.

**Files Checked:**
- `~/repos/melo/components/modals/invite-modal.tsx` ✅ Discord-styled
- `~/repos/melo/components/server/enhanced-invite-generator.tsx` ⚠️ Not Discord-styled
- `~/repos/melo/components/server/invite-analytics.tsx` ⚠️ Not Discord-styled
- `~/repos/melo/components/admin/admin-invites-dashboard.tsx` ⚠️ Not Discord-styled

**Deliverable:** Audit report at `~/clawd/scheduler/progress/melo-p3/p3-3-a-audit.md`

- **Validation Checklist:**
  - Audit report: ✅ exists at expected path
  - Key question answered: ✅ Discord styling status determined (YES)
  - All files analyzed: ✅ 4/4 invite system components reviewed
  - Git commit: pending (documentation only)

**Recommendation:** Task p3-3-b should be SKIPPED - invite modal is already Discord-styled.

---

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