# Phase 3: Setup Wizard & Admin Features

**Project:** MELO V2
**Parent:** MASTER-PLAN.md  
**Created:** 2026-02-19 01:02 EST
**Author:** Coordinator
**Version:** 2
**Status:** revised

---

## Scope Clarification (CRITICAL)

This phase covers **server creation and admin interfaces** ONLY:

| In Scope | NOT In Scope |
|----------|--------------|
| ✅ Server creation modal (InitialModal style) | ❌ User onboarding system (already complete) |
| ✅ Server settings admin interface | ❌ Matrix homeserver configuration |
| ✅ Member management interface | ❌ Basic user settings (Phase 2) |
| ✅ Invite management dashboard | ❌ Invite modal itself (may already be done) |

**"Setup Wizard" means:** The server creation flow that appears when clicking "Add Server" — NOT the user onboarding tutorial.

---

## Reference Repository (MANDATORY)

**Discord Clone Reference:** `~/repos/discord-clone-reference/`

| Phase 3 Target | Discord Clone Reference | MELO V2 Location |
|----------------|-------------------------|------------------|
| Server Creation Modal | `components/modals/initial-modal.tsx` | `components/modals/create-server-modal.tsx` |
| Server Settings | `components/modals/edit-server-modal.tsx` | `app/.../servers/[serverId]/settings/*` |
| Member Management | `components/modals/members-modal.tsx` | `components/server/member-list.tsx` |
| Invite Modal | `components/modals/invite-modal.tsx` | `components/modals/invite-modal.tsx` |

**Workers MUST:**
1. Read the discord-clone-reference source FIRST
2. Copy exact JSX structure and classNames
3. Copy exact color values (`bg-[#313338]`, `bg-[#5865F2]`, etc.)
4. Only change data fetching layer (Prisma → Matrix SDK)

---

## Visual Verification Workflow (MANDATORY)

**After EVERY UI implementation task:**

1. Run dev server: `pnpm dev`
2. Navigate to the component/page
3. Take Playwright screenshot: `npx playwright screenshot [url] [output.png]`
4. Compare against discord-clone-reference screenshot
5. Fix ANY visual differences
6. Include screenshot comparison in commit/progress

**Validation Commands (EVERY task):**
```bash
pnpm build     # Must exit 0
pnpm test      # All tests pass
pnpm test:e2e  # E2E tests pass (if applicable)
pnpm lint      # No lint errors
```

---

## Phase Goals

1. **Server Creation Flow** — Discord-style InitialModal experience
2. **Admin Settings UI** — Discord-style server settings sidebar and forms
3. **Member Management** — Discord-style member list with role badges
4. **Invite Management Dashboard** — Discord-style invite tracking (NOT the modal itself)

## Prerequisites

- [x] Phase 2: UI Component Replacement complete
- [x] All core UI components styled as Discord clones
- [x] Build system functioning

---

## Task Categories

### Category 1: Server Creation Flow
Transform server creation to Discord's InitialModal pattern.

| Task ID | Description | Model | Depends On | Files |
|---------|-------------|-------|------------|-------|
| p3-1-a | Audit server creation vs discord-clone-reference | Sonnet | - | See below |
| p3-1-b | Document target implementation from reference | Sonnet | p3-1-a | Spec document |
| p3-1-c | Replace create-server-modal with discord-clone copy | Sonnet | p3-1-b | `components/modals/create-server-modal.tsx` |
| p3-1-d | E2E test server creation flow | Sonnet | p3-1-c | `tests/e2e/server-creation.spec.ts` |

#### p3-1-a Details: Audit Server Creation
**Files to Audit:**
- `components/modals/create-server-modal.tsx`
- `app/(main)/(routes)/servers/create/page.tsx`
- `app/(main)/(routes)/servers/create/templates/page.tsx`

**Compare Against:**
- `~/repos/discord-clone-reference/components/modals/initial-modal.tsx`
- `~/repos/discord-clone-reference/components/modals/create-server-modal.tsx`

**Deliverable:** Audit report listing:
- [ ] Current styling vs. Discord reference gaps
- [ ] JSX structure differences
- [ ] Components needing replacement vs. modification
- [ ] Data layer changes required (Prisma → Matrix)

#### p3-1-c Details: Implementation
**Acceptance Criteria:**
- [ ] Visually identical to discord-clone-reference
- [ ] Playwright screenshot comparison passes
- [ ] Same JSX structure (exact match)
- [ ] Only data layer changed (Matrix SDK)
- [ ] Build passes: `pnpm build`
- [ ] Committed with: `feat(ui): create-server-modal discord-clone copy`

---

### Category 2: Admin Settings Interface
Transform server settings to Discord's admin UI pattern.

| Task ID | Description | Model | Depends On | Files |
|---------|-------------|-------|------------|-------|
| p3-2-a | Audit server settings pages vs discord-clone | Sonnet | - | See below |
| p3-2-b | Document target admin layout design | Sonnet | p3-2-a | Spec document |
| p3-2-c | Implement server settings modal (Discord-style) | Sonnet | p3-2-b | Settings pages |
| p3-2-d | Implement member management interface | Sonnet | p3-2-b | `components/server/member-list.tsx` |
| p3-2-e | E2E test admin functionality | Sonnet | p3-2-c, p3-2-d | `tests/e2e/admin/settings.spec.ts` |

#### p3-2-a Details: Audit Admin Components
**Files to Audit:**
- `components/server/settings/server-settings-sidebar.tsx`
- `app/(main)/(routes)/servers/[serverId]/settings/*` (all pages)
- `components/server/member-list.tsx` (~500 lines)
- `components/server/member-role-editor.tsx`

**Compare Against:**
- `~/repos/discord-clone-reference/components/modals/edit-server-modal.tsx`
- `~/repos/discord-clone-reference/components/modals/members-modal.tsx`

**Deliverable:** Audit report with styling gap analysis.

#### p3-2-d Details: Member Management
**Reference:** `~/repos/discord-clone-reference/components/modals/members-modal.tsx`

**Key Discord patterns to copy:**
- Left sidebar with setting categories
- Content area with member list
- Role badges next to member names
- Search/filter functionality styling
- Kick/ban action buttons

---

### Category 3: Invite Management Dashboard
**NOTE:** The invite modal (`components/modals/invite-modal.tsx`) already uses Discord colors. This category focuses on the MANAGEMENT interface, not the modal itself.

| Task ID | Description | Model | Depends On | Files |
|---------|-------------|-------|------------|-------|
| p3-3-a | Audit invite system for Discord compliance | Sonnet | - | See below |
| p3-3-b | **CONDITIONAL:** Update invite modal if needed | Sonnet | p3-3-a | `components/modals/invite-modal.tsx` |
| p3-3-c | Implement invite management dashboard | Sonnet | p3-3-a | `components/admin/admin-invites-dashboard.tsx` |
| p3-3-d | E2E test invite flow | Sonnet | p3-3-c | `tests/e2e/invites.spec.ts` |

#### p3-3-a Details: Audit (CRITICAL)
**Key Question:** Is the invite modal already Discord-styled?

**Files to Check:**
- `components/modals/invite-modal.tsx` (check for `bg-[#313338]`, `bg-[#5865F2]`)
- `components/server/enhanced-invite-generator.tsx` (22KB)
- `components/server/invite-analytics.tsx` (8KB)
- `components/admin/admin-invites-dashboard.tsx`

**Deliverable:** Audit report answering:
- [ ] Is invite modal already Discord-styled? (Y/N)
- [ ] If Y: Skip p3-3-b, document why
- [ ] If N: Document gaps for p3-3-b
- [ ] Invite management dashboard styling gaps

#### p3-3-b Details: CONDITIONAL Execution
**Execute ONLY IF** audit finds invite modal NOT Discord-styled.

**If already styled:** Mark as "N/A - Already compliant" and skip.

#### p3-3-c Details: Management Dashboard
**Scope:**
- Invite listing with status (active/expired/used)
- Revocation workflow with confirmation modal
- Analytics display (usage counts)

**Target Files:**
- `components/admin/admin-invites-dashboard.tsx` (~200 lines)
- `components/server/invite-analytics.tsx` (~200 lines)

---

## Dependency Graph

```
Server Creation:
p3-1-a ──► p3-1-b ──► p3-1-c ──► p3-1-d

Admin Settings:  
p3-2-a ──► p3-2-b ──► p3-2-c ──► p3-2-e
              │        └─► p3-2-d ──┘

Invite System:
p3-3-a ──► p3-3-b* ──► p3-3-c ──► p3-3-d
           (*conditional)
```

---

## Deliverables

- [ ] **Server Creation:** Discord-style InitialModal experience
- [ ] **Admin Settings:** Discord-style server settings interface  
- [ ] **Member Management:** Discord-style member list with roles
- [ ] **Invite Dashboard:** Discord-style invite management
- [ ] **Visual Consistency:** Screenshots match discord-clone-reference
- [ ] **E2E Tests:** All flows covered by Playwright tests
- [ ] **Build Passing:** `pnpm build` successful

---

## Commit Format

Use: `feat(ui): <component-name> discord-clone copy`

Examples:
- `feat(ui): create-server-modal discord-clone copy`
- `feat(ui): member-management discord-style update`
- `feat(ui): invite-dashboard discord-style restyle`

---

## VSDD Compliance (Mandatory)

### Verification Properties (Phase-Level)

| Property ID | Property | Testable | Coverage |
|-------------|----------|----------|----------|
| VP-P3-01 | Server creation modal visually matches Discord reference | Screenshot diff | p3-1-* |
| VP-P3-02 | Admin settings UI identical to Discord pattern | Screenshot diff | p3-2-* |
| VP-P3-03 | Member management shows correct role badges | E2E test | p3-2-d |
| VP-P3-04 | Invite flow produces valid Matrix invite | Integration test | p3-3-* |

### Purity Boundary Map (Phase-Level)

**Pure Core (Deterministic, no side effects):**
- `validateServerName()` — Server name rules
- `validateInviteSettings()` — Invite configuration
- `transformMemberData()` — Member list formatting
- Modal state reducers

**Effectful Shell (Side effects allowed):**
- Matrix SDK server/space operations
- Matrix invite API
- Matrix member management API
- File upload for server icons

**Adapters (Thin wrappers):**
- `useServerCreation()` hook
- `useInviteManagement()` hook
- `useMemberList()` hook

### Red Gate Tests (Phase-Level)

| Test File | Test Description | Expected Failure |
|-----------|------------------|------------------|
| `tests/e2e/server-creation.spec.ts` | Modal opens and submits | Element not found |
| `tests/e2e/admin/settings.spec.ts` | Settings page loads | Route not found |
| `tests/e2e/invites.spec.ts` | Invite link generated | Function not found |

### Contract Chain (Phase-Level)

```
Spec: PHASE-3 (Setup Wizard & Admin)
  ↓
Tasks: p3-1-*, p3-2-*, p3-3-*
  ↓
Properties: VP-P3-01 through VP-P3-04
  ↓
Tests: tests/e2e/server-creation.spec.ts, tests/e2e/admin/*.spec.ts
  ↓
Code: components/modals/create-server-modal.tsx, app/.../settings/*
```

---

## Review History

- v1: 2026-02-19 01:02 EST - Initial Phase 3 breakdown by Coordinator
- v2: 2026-02-19 01:50 EST - Revised per reviewer feedback:
  - ✅ Clarified "Setup Wizard" scope (server creation, not onboarding)
  - ✅ Added discord-clone-reference file mappings
  - ✅ Added visual verification workflow (Playwright screenshots)
  - ✅ Made invite modal tasks conditional on audit
  - ✅ Added explicit file paths for each task
  - ✅ Added commit message format
- v3: 2026-03-01 - VSDD compliance sections added