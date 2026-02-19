# Phase 3 Review: Setup Wizard & Admin Features

**Reviewer:** Phase Plan Review Agent (Opus)  
**Review Date:** 2026-02-19 01:30 EST  
**Document:** PHASE-3.md v1  
**Status:** ⚠️ **REVISE REQUIRED**

---

## Executive Summary

Phase 3 has a solid structural foundation with correct model assignments (Sonnet throughout) and reasonable task granularity. However, several critical issues require revision before approval:

1. **Scope confusion** with existing features (onboarding system already exists)
2. **Missing reference to discord-clone-reference repo** (critical per UI design lessons)
3. **No visual verification workflow** (Playwright screenshots mandatory)
4. **Task descriptions lack explicit file paths and deliverables**
5. **Potential duplicate work** - invite modal may already be Discord-styled

---

## Overall Assessment

| Criterion | Rating | Notes |
|-----------|--------|-------|
| Model Assignments | ✅ **PASS** | All Sonnet - correct for UI work, no Haiku |
| Task Boundaries | ⚠️ **NEEDS WORK** | Reasonable but need explicit file targets |
| Dependencies | ✅ **PASS** | Logical dependency chains |
| Task Sizing | ✅ **PASS** | Not too big, not too small |
| Acceptance Criteria | ⚠️ **NEEDS WORK** | Missing visual verification steps |
| Completeness | ❌ **FAIL** | Scope overlap with existing features unclear |
| Visual Standards | ⚠️ **NEEDS WORK** | No reference to discord-clone-reference repo |

---

## Critical Issues (Must Fix)

### Issue 1: Scope Confusion - What IS the "Setup Wizard"?

**Problem:** The plan mentions "Setup Wizard Redesign" but doesn't clarify which of these it means:

1. **InitialModal** (discord-clone style) - First server creation modal
2. **OnboardingModal** - Already exists with 6 comprehensive steps (see `components/onboarding/`)
3. **Homeserver Setup** - Matrix-specific server configuration

**Evidence from codebase:**
- `components/onboarding/onboarding-modal.tsx` - 491 lines, comprehensive tutorial
- `components/onboarding/onboarding-flow.tsx` - Multi-step wizard already exists
- `hooks/use-onboarding-wizard.tsx` - State management already complete
- `app/(main)/(routes)/servers/create/templates/page.tsx` - Server creation with templates

**Recommendation:** Clarify scope explicitly:
```markdown
## Scope Clarification

This phase covers:
- ✅ Server creation modal (InitialModal pattern from discord-clone-reference)
- ❌ NOT the user onboarding system (Phase 2 deliverable, already complete)
- ❌ NOT homeserver Matrix configuration (out of scope)

Specifically, we are restyling:
- `components/modals/create-server-modal.tsx` → Discord InitialModal style
- `app/(main)/(routes)/servers/create/` → Discord server creation flow
```

### Issue 2: Missing Visual Reference Specification

**Problem:** Per `memory/topics/ui-design-lessons.md`, ALL UI work must:
1. Reference the discord-clone-reference repo explicitly
2. Copy EXACT JSX structure and classNames
3. Verify with Playwright screenshots

**Current Plan:** No mention of `~/repos/discord-clone-reference`

**Recommendation:** Add to Design Requirements:
```markdown
## Reference Implementation (MANDATORY)

**Source:** `~/repos/discord-clone-reference/components/`

| Phase 3 Target | Discord Clone Reference |
|----------------|-------------------------|
| Server Creation Modal | `modals/initial-modal.tsx` |
| Server Settings | `modals/edit-server-modal.tsx` |
| Member Management | `modals/members-modal.tsx` |
| Invite Modal | `modals/invite-modal.tsx` |

**Process:**
1. Read discord-clone-reference source FIRST
2. Copy exact JSX structure, classNames, colors
3. Adapt only the data layer (Matrix SDK instead of Prisma)
4. Visual verify with Playwright screenshots
```

### Issue 3: Invite Modal May Already Be Discord-Styled

**Problem:** The current `components/modals/invite-modal.tsx` already uses Discord colors:
- `bg-[#313338]` (Discord dark background)
- `bg-[#5865F2]` (Discord blurple button)
- `bg-[#2B2D31]` (Discord input background)

**Evidence:**
```tsx
// From current invite-modal.tsx line 74:
<DialogContent className="bg-[#313338] text-white p-0 overflow-hidden">
```

**Recommendation:** Task p3-3-a (Audit) must verify if invite modal is already compliant. If so, tasks p3-3-b and p3-3-c may be unnecessary or should focus on:
- Invite management interface (admin dashboard style)
- Invite analytics/tracking UI
- NOT recreating the already-styled modal

---

## Task-by-Task Feedback

### Category 1: Setup Wizard Redesign

#### p3-1-a: Audit existing setup wizard components
| Aspect | Assessment |
|--------|------------|
| Description | ⚠️ Vague - "setup wizard" means what? |
| Model | ✅ Sonnet - correct |
| Dependencies | ✅ None - good starting point |

**Feedback:** Must specify which files to audit:
```markdown
**Files to Audit:**
- `components/modals/create-server-modal.tsx`
- `components/onboarding/onboarding-flow.tsx`
- `app/(main)/(routes)/servers/create/templates/page.tsx`
- `lib/matrix/server-templates.ts`

**Compare Against:**
- `~/repos/discord-clone-reference/components/modals/initial-modal.tsx`
- `~/repos/discord-clone-reference/components/modals/create-server-modal.tsx`

**Deliverable:** Audit report listing:
- [ ] Current styling vs. Discord reference gaps
- [ ] Components needing replacement vs. modification
- [ ] Data layer changes required (Prisma → Matrix)
```

#### p3-1-b: Create Discord-style setup flow mockup
| Aspect | Assessment |
|--------|------------|
| Description | ⚠️ "Mockup" is unclear for code work |
| Model | ✅ Sonnet - correct |

**Feedback:** This should be "Document the target implementation" not "create mockup":
```markdown
**Deliverable:** Implementation specification including:
- [ ] JSX structure from discord-clone-reference to copy
- [ ] Exact color tokens to use
- [ ] Component hierarchy diagram
- [ ] Data flow changes (Matrix SDK integration points)
```

#### p3-1-c: Replace setup wizard UI components
| Aspect | Assessment |
|--------|------------|
| Description | ❌ Too vague for worker execution |
| Model | ✅ Sonnet - correct |

**Feedback:** Need explicit file list and acceptance:
```markdown
**Files to Modify:**
1. `components/modals/create-server-modal.tsx`
2. `app/(main)/(routes)/servers/create/page.tsx`
3. [list all files from audit]

**Acceptance Criteria:**
- [ ] Each file visually identical to discord-clone-reference
- [ ] Playwright screenshot comparison passes
- [ ] Same JSX structure (exact match)
- [ ] Only data layer changed (Matrix SDK)
- [ ] Build passes: `pnpm build`
```

#### p3-1-d: Test complete setup flow end-to-end
| Aspect | Assessment |
|--------|------------|
| Description | ✅ Clear |
| Model | ✅ Sonnet - correct |

**Feedback:** Add explicit test creation requirement:
```markdown
**Deliverable:**
- [ ] E2E test: `tests/e2e/setup/server-creation.spec.ts`
- [ ] Visual regression test with screenshots
- [ ] Manual verification video/screenshots in PR
```

### Category 2: Admin Dashboard Transformation

#### p3-2-a: Audit existing admin/homeserver components
| Aspect | Assessment |
|--------|------------|
| Description | ⚠️ "homeserver" confusing |

**Feedback:** Be specific:
```markdown
**Files to Audit:**
- `components/admin/admin-invites-dashboard.tsx`
- `components/admin/*.tsx` (all admin components)
- `components/server/settings/` directory
- `app/(main)/(routes)/servers/[serverId]/settings/` pages

**Note:** "Homeserver" refers to Matrix server config.
Phase 3 covers SERVER SETTINGS UI, not Matrix homeserver administration.
```

#### p3-2-b: Create Discord-style admin layout design
| Aspect | Assessment |
|--------|------------|
| Description | ⚠️ Same "design" vs "implementation spec" issue |

**Feedback:** Reference specific Discord UI:
```markdown
**Reference:** Discord Server Settings Modal Layout
- Left sidebar with setting categories
- Content area with forms
- Danger zone section at bottom

**Copy From:**
- `~/repos/discord-clone-reference/components/modals/edit-server-modal.tsx`
```

#### p3-2-c: Implement server settings modal
| Aspect | Assessment |
|--------|------------|
| Description | ✅ Clear enough |

**Feedback:** Add specific file target:
```markdown
**Target Files:**
- `components/server/settings/server-settings-sidebar.tsx` (already Discord-styled, verify)
- `app/(main)/(routes)/servers/[serverId]/settings/*` pages
```

#### p3-2-d: Implement member management interface
| Aspect | Assessment |
|--------|------------|
| Description | ✅ Clear |

**Feedback:** Reference existing work:
```markdown
**Existing Components:**
- `components/server/member-list.tsx` (16KB - may need styling updates only)
- `components/server/member-role-editor.tsx` (16KB)

**Reference:**
- `~/repos/discord-clone-reference/components/modals/members-modal.tsx`
```

#### p3-2-e: Test admin functionality
| Aspect | Assessment |
|--------|------------|
| Description | ✅ Clear |

**No changes needed.**

### Category 3: Invite System Enhancement

#### p3-3-a: Audit existing invite system
| Aspect | Assessment |
|--------|------------|
| Description | ⚠️ Critical - must determine if already done |

**Feedback:** This audit MUST answer:
```markdown
**Key Question:** Is the invite modal already Discord-styled?

**Evidence to check:**
- `components/modals/invite-modal.tsx` - Check for Discord colors
- `components/server/enhanced-invite-generator.tsx` - Check styling

**If already Discord-styled:**
- Skip p3-3-b and p3-3-c
- Focus p3-3-d on invite MANAGEMENT (admin dashboard style)
```

#### p3-3-b & p3-3-c: Design and implement invite modal
| Aspect | Assessment |
|--------|------------|
| Description | ⚠️ May be duplicate work |

**Feedback:** Make conditional:
```markdown
**Conditional Execution:**
IF audit finds invite modal NOT Discord-styled:
  → Execute p3-3-b and p3-3-c
ELSE:
  → Skip to p3-3-d (management interface)
  → Document in PR why skipped
```

#### p3-3-d: Implement invite management interface
| Aspect | Assessment |
|--------|------------|
| Description | ✅ Clear and needed |

**Feedback:** Specify scope:
```markdown
**Scope:**
- Invite listing with status (active/expired/used)
- Revocation workflow with confirmation
- Analytics display (usage counts, top performers)

**Existing Components to Restyle:**
- `components/server/enhanced-invite-generator.tsx` (22KB)
- `components/server/invite-analytics.tsx` (8KB)
- `components/admin/admin-invites-dashboard.tsx`
```

---

## Missing Items

### 1. Visual Verification Workflow (CRITICAL)

Per UI design lessons, EVERY implementation task must include:
```markdown
#### Visual Verification Steps (Required for ALL UI tasks)
1. Run dev server: `pnpm dev`
2. Navigate to component/page
3. Take Playwright screenshot: `npx playwright screenshot`
4. Compare against discord-clone-reference screenshot
5. Iterate until visually identical
6. Include screenshot comparison in PR
```

### 2. Reference Repository Specification

```markdown
## Reference Repository

**Discord Clone Reference:** `~/repos/discord-clone-reference/`

Workers MUST:
1. Read the reference source BEFORE implementing
2. Copy exact JSX structure
3. Copy exact classNames and colors
4. Only change data fetching layer (Prisma → Matrix SDK)
```

### 3. Explicit Build/Test Commands

```markdown
## Validation Commands

**After EVERY task:**
- [ ] `pnpm build` - Must exit 0
- [ ] `pnpm test` - All tests pass
- [ ] `pnpm test:e2e` - E2E tests pass
- [ ] `pnpm lint` - No lint errors
```

### 4. Commit Message Format

```markdown
## Commit Format

Use: `feat(ui): <component-name> discord-clone copy`

Examples:
- `feat(ui): create-server-modal discord-clone copy`
- `feat(ui): member-management discord-style update`
```

---

## Recommended Changes Summary

### Must Fix (Blocking)

1. **Clarify "Setup Wizard" scope** - Is it server creation or onboarding?
2. **Add discord-clone-reference specification** - Explicit file mappings
3. **Add visual verification workflow** - Playwright screenshots mandatory
4. **Audit Task p3-3-a must answer** - Is invite modal already done?
5. **Make invite modal tasks conditional** - Skip if already Discord-styled

### Should Fix (Important)

6. **Add explicit file paths** to each implementation task
7. **Add specific acceptance criteria** with visual verification
8. **Reference existing components** that may only need styling updates
9. **Add commit message format** requirement
10. **Specify E2E test file names** to be created

### Nice to Have

11. Add time estimates per task
12. Add rollback procedures if visual verification fails
13. Add screenshot archive location for reference

---

## Approval Status

### ❌ **REVISE REQUIRED**

Phase 3 cannot be approved in current form due to:
1. Scope confusion about "Setup Wizard"
2. Missing discord-clone-reference specification (critical per lessons learned)
3. No visual verification workflow
4. Potential duplicate work on invite modal

### Path to Approval

1. Coordinator revises PHASE-3.md addressing "Must Fix" items
2. Re-submit for review
3. Expected: Approval after one revision cycle

---

## Appendix: Existing Components Status

| Component | Location | Lines | Status |
|-----------|----------|-------|--------|
| Onboarding Modal | `components/onboarding/onboarding-modal.tsx` | 491 | ✅ Exists, may need styling check |
| Create Server Modal | `components/modals/create-server-modal.tsx` | ~300 | ⚠️ Needs Discord styling |
| Invite Modal | `components/modals/invite-modal.tsx` | 122 | ✅ Already has Discord colors |
| Server Settings Sidebar | `components/server/settings/server-settings-sidebar.tsx` | ~100 | ✅ Discord-styled |
| Member List | `components/server/member-list.tsx` | ~500 | ⚠️ Needs styling check |
| Enhanced Invite Generator | `components/server/enhanced-invite-generator.tsx` | ~700 | ⚠️ Needs styling check |
| Admin Invites Dashboard | `components/admin/admin-invites-dashboard.tsx` | ~200 | ⚠️ Needs Discord styling |

---

*Review completed 2026-02-19 01:45 EST*
