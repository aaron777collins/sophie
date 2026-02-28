# Sub-Task: [ST-P2-03-A] Channel Context Menu with Delete Option

**User Story:** US-P2-03 (see `scheduler/stories/melo-v2/phase2/US-P2-03-delete-channel-ui.md`)
**Epic:** MELO-V2-PHASE2-CHANNEL-MANAGEMENT  
**Project:** melo-v2
**Status:** pending
**Assigned:** {worker}
**Model:** sonnet
**Created:** 2026-02-28

---

## Parent Story Context

**Story:** Delete Channel UI Implementation - S08 audit found delete channel functionality completely missing
**ACs Covered:** AC-1 (Delete option in context menu for admins), AC-2 (Delete hidden from non-admins)

---

## Task Description

**As a** developer implementing US-P2-03
**I need to** create a channel context menu component with right-click support that shows "Delete Channel" option only for admins
**So that** AC-1 and AC-2 will pass (admin-only delete option in context menu)

---

## Acceptance Criteria (Subset of Parent)

### AC-1: Delete Channel Option in Context Menu (P1-PRIMARY)

**Given** an authenticated admin/owner viewing a channel list
**When** they right-click on a channel they have permission to delete
**Then** a context menu appears with a "Delete Channel" option (styled as destructive action)

**Implementation Verification:**
- [ ] Context menu appears on right-click
- [ ] "Delete Channel" option visible for admins
- [ ] Option styled as destructive/dangerous (red/warning colors)
- [ ] Context menu positioned correctly near cursor

### AC-2: Delete Option NOT Shown for Non-Admins

**Given** a regular member (non-admin) viewing a channel list
**When** they right-click on a channel
**Then** the "Delete Channel" option is NOT visible in the context menu

**Implementation Verification:**
- [ ] Permission check prevents showing delete option to non-admins
- [ ] Context menu still appears but without delete option
- [ ] No console errors when checking permissions

---

## Explicit Instructions

**IMPORTANT:** Follow these steps exactly. Do not deviate.

### Step 1: Analyze Existing Channel Components
```bash
cd ~/clawd/repos/melo
find . -name "*.tsx" | grep -E "(channel|navigation)" | head -10
ls components/navigation/
```
Look for existing channel list items and navigation components.

### Step 2: Create Context Menu Component
- File: `components/ui/context-menu.tsx`
- Action: CREATE (if doesn't exist) or CHECK
- Pattern to follow: Look for any existing context menus or create from scratch
```typescript
// Expected structure
interface ContextMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  // Other props
}
```

### Step 3: Create Channel Context Menu Component
- File: `components/navigation/channel-context-menu.tsx`
- Action: CREATE
- Pattern to follow: Similar to any existing modal or menu components
```typescript
interface ChannelContextMenuProps {
  channelId: string;
  channelName: string;
  canDelete: boolean; // Based on user permissions
  onDeleteChannel: () => void;
  children: React.ReactNode; // The trigger element (channel item)
}
```

### Step 4: Check Permission System
```bash
cd ~/clawd/repos/melo
grep -r "permission\|admin\|owner" --include="*.ts" --include="*.tsx" components/ lib/ | head -10
```
Find existing permission checking patterns to determine admin/owner status.

### Step 5: Integrate with Channel List
- File: `components/navigation/navigation-item.tsx` (or similar)
- Action: MODIFY
- Wrap channel items with the new context menu component

### Step 6: Test Component
```bash
pnpm build
pnpm test
```

### Step 7: Manual Verification
- Check that right-click shows context menu
- Verify different behavior for admin vs regular users
- Test on desktop (primary target)

---

## Contingencies

### What Could Go Wrong (Implementation Level)

| Risk | Detection | Resolution |
|------|-----------|------------|
| No existing context menu library | Build errors | Install or create basic context menu |
| Permission system not granular enough | User always/never sees option | Document limitation, use basic auth check |
| Right-click conflicts with browser menu | No context menu appears | Use onContextMenu event, prevent default |
| Mobile right-click doesn't work | Touch devices don't show menu | Document as known limitation (AC-10 covers mobile) |
| Channel list structure unknown | Can't find integration point | Inspect existing channel components |

### If You Get Stuck
1. **Check similar patterns** in codebase (modals, dropdowns)
2. **Look at LeaveServerModal** for reference structure
3. **Document the specific blocker** in progress file
4. **Note the permission system structure** if unclear

### Rollback Plan
If changes break things:
```bash
git stash  # Save work
git checkout -- {files}  # Restore original
```

---

## Dependencies

### Upstream (Must Be Done First)
| Dependency | Type | Status | Notes |
|------------|------|--------|-------|
| Channel list component | technical | exists | From existing MELO navigation |
| User permission system | technical | exists | Need to verify admin detection |

### Downstream (Waiting on This)
| Dependent | Impact |
|-----------|--------|
| ST-P2-03-B | Delete confirmation modal needs context menu trigger |

### Files This Task Touches
- `components/ui/context-menu.tsx` — CREATE/MODIFY
- `components/navigation/channel-context-menu.tsx` — CREATE
- `components/navigation/navigation-item.tsx` — MODIFY (integration)

### Files You Should NOT Touch
- Modal components — Different task will handle delete confirmation modal

---

## Model Guidance

**This task requires:** sonnet

### Sonnet Reasoning Required
- Component design decisions for context menu implementation
- Integration approach with existing navigation components 
- Permission checking logic and fallback patterns
- Event handling for right-click behavior
- Responsive design considerations

---

## Validation Checklist

Before claiming `needs-validation`:

### Evidence Required (PASTE ACTUAL OUTPUT)
```bash
$ cd ~/clawd/repos/melo && pwd
[PASTE OUTPUT]

$ ls -la 'components/navigation/channel-context-menu.tsx'
[PASTE OUTPUT]

$ git log --oneline -1
[PASTE OUTPUT]

$ pnpm build 2>&1 | tail -10 && echo "Exit: $?"
[PASTE OUTPUT]

$ pnpm test 2>&1 | tail -20 && echo "Exit: $?"
[PASTE OUTPUT]
```

### AC Verification
- [ ] AC-1 passes: Right-click on channel shows context menu with "Delete Channel" for admins
- [ ] AC-2 passes: Non-admins don't see "Delete Channel" option
- [ ] Screenshot taken: `scheduler/validation/screenshots/melo-v2/ST-P2-03-A-AC1.png`
- [ ] Screenshot taken: `scheduler/validation/screenshots/melo-v2/ST-P2-03-A-AC2.png`

---

## Completion Report Template

When done, write this to `scheduler/progress/melo-v2/ST-P2-03-A.md`:

```markdown
## Completion Report: ST-P2-03-A

**Status:** needs-validation
**Completed:** {timestamp}
**Worker:** {label}

### Files Changed
| File | Action | Verified |
|------|--------|----------|
| components/navigation/channel-context-menu.tsx | CREATE | `ls -la` output |
| components/navigation/navigation-item.tsx | MODIFY | `git diff` shows changes |

### Commits
| Hash | Message | Verified |
|------|---------|----------|
| {hash} | feat: add channel context menu with delete option for admins | `git log` output |

### Build Verification
```
{actual pnpm build output}
```

### Test Verification
```
{actual pnpm test output}
```

### AC Verification
- [ ] AC-1: Right-click shows context menu with delete option for admins + screenshot path
- [ ] AC-2: Non-admins don't see delete option + screenshot path

### Self-Validation (Layer 1)
- Manual test: {PASS/FAIL - actually tested right-click behavior}
- Permission test: {PASS/FAIL - tested with different user types}
- Build/Tests: {PASS/FAIL - all green}
```

---
*Task created by Coordinator for autonomous execution — 2026-02-28 07:30 EST*