# Sub-Task: [ST-P2-03-B] Delete Channel Confirmation Modal

**User Story:** US-P2-03 (see `scheduler/stories/melo-v2/phase2/US-P2-03-delete-channel-ui.md`)
**Epic:** MELO-V2-PHASE2-CHANNEL-MANAGEMENT  
**Project:** melo-v2
**Status:** pending
**Assigned:** {worker}
**Model:** sonnet
**Created:** 2026-02-28

---

## Parent Story Context

**Story:** Delete Channel UI Implementation - Create confirmation modal with name typing requirement
**ACs Covered:** AC-3 (Confirmation modal), AC-4 (Delete enabled after correct name), AC-6 (Cancel flow)

---

## Task Description

**As a** developer implementing US-P2-03
**I need to** create a delete confirmation modal that requires typing the channel name exactly to enable the delete button
**So that** AC-3, AC-4, and AC-6 will pass (safe confirmation with name verification and cancel option)

---

## Acceptance Criteria (Subset of Parent)

### AC-3: Delete Channel Confirmation Modal

**Given** an admin clicks "Delete Channel"
**When** the action is initiated
**Then** a confirmation modal appears requiring them to type the channel name to confirm

**Implementation Verification:**
- [ ] Modal opens when delete is triggered
- [ ] Shows channel name prominently
- [ ] Has input field for name confirmation
- [ ] Delete button initially disabled
- [ ] Clear warning text about irreversible action

### AC-4: Delete Button Enabled After Correct Name Entry

**Given** an admin is in the delete confirmation modal
**When** they type the exact channel name correctly
**Then** the Delete button becomes enabled

**Implementation Verification:**
- [ ] Button disabled when input is empty
- [ ] Button disabled for incorrect name
- [ ] Button enabled only for exact match
- [ ] Case sensitive matching

### AC-6: Cancel Deletion Flow

**Given** an admin opens the delete confirmation modal
**When** they click "Cancel" or close the modal
**Then** the modal closes and the channel remains unchanged

**Implementation Verification:**
- [ ] Cancel button closes modal
- [ ] X/close button closes modal
- [ ] ESC key closes modal
- [ ] Click outside modal closes it
- [ ] No deletion occurs on cancel

---

## Explicit Instructions

**IMPORTANT:** Follow these steps exactly. Do not deviate.

### Step 1: Analyze Existing Modal Patterns
```bash
cd ~/clawd/repos/melo
find . -name "*modal*.tsx" | head -10
ls components/modals/ 2>/dev/null || ls components/ui/ | grep -i modal
```
Look for existing modal patterns, especially LeaveServerModal for reference.

### Step 2: Create Delete Channel Modal Component
- File: `components/modals/delete-channel-modal.tsx`
- Action: CREATE
- Pattern to follow: Copy structure from LeaveServerModal
```typescript
interface DeleteChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  channelId: string;
  channelName: string;
  isDeleting: boolean; // Loading state
}
```

### Step 3: Implement Name Confirmation Logic
```typescript
const [nameConfirmation, setNameConfirmation] = useState('');
const isDeleteEnabled = nameConfirmation === channelName && !isDeleting;
```

### Step 4: Add Modal Styling and Structure
- Use existing modal wrapper/backdrop if available
- Style Delete button as destructive (red/danger)
- Include warning text about irreversible action
- Show channel name prominently

### Step 5: Handle Modal Events
- onClose for cancel/escape/outside click
- Form submission for confirmation
- Loading state during deletion
- Error handling if deletion fails

### Step 6: Test Component in Isolation
```bash
pnpm build
pnpm test
# Test the component behavior
```

### Step 7: Integration Point (Note for Next Task)
Document how this modal will be triggered by the context menu from ST-P2-03-A.

---

## Contingencies

### What Could Go Wrong (Implementation Level)

| Risk | Detection | Resolution |
|------|-----------|------------|
| No existing modal library | Build errors | Use existing modal pattern or create basic one |
| Modal backdrop/overlay missing | No click-outside behavior | Create basic backdrop component |
| Loading state handling unclear | Button behavior issues | Use simple boolean loading state |
| Channel name has special characters | Typing verification fails | Use exact string comparison (trim whitespace) |
| Modal doesn't close on ESC | Poor UX | Add useEffect for keydown listener |

### If You Get Stuck
1. **Check LeaveServerModal** for exact pattern to follow
2. **Look for existing UI components** (Button, Input, Modal)
3. **Create minimal working version** first, then enhance
4. **Document missing dependencies** if modal system unclear

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
| ST-P2-03-A | task | in-progress | Context menu will trigger this modal |
| Modal base components | technical | check exists | Use existing modal patterns |

### Downstream (Waiting on This)
| Dependent | Impact |
|-----------|--------|
| ST-P2-03-C | Delete API integration needs this modal |

### Files This Task Touches
- `components/modals/delete-channel-modal.tsx` — CREATE
- `components/modals/index.ts` — MODIFY (export new modal)

### Files You Should NOT Touch
- Context menu component — ST-P2-03-A handles that
- API integration — Different task handles actual deletion

---

## Model Guidance

**This task requires:** sonnet

### Sonnet Reasoning Required
- Modal component architecture and state management
- Form validation logic for name confirmation
- Event handling for various modal close scenarios
- Integration points with existing UI components
- Error handling and loading state patterns

---

## Validation Checklist

Before claiming `needs-validation`:

### Evidence Required (PASTE ACTUAL OUTPUT)
```bash
$ cd ~/clawd/repos/melo && pwd
[PASTE OUTPUT]

$ ls -la 'components/modals/delete-channel-modal.tsx'
[PASTE OUTPUT]

$ git log --oneline -1
[PASTE OUTPUT]

$ pnpm build 2>&1 | tail -10 && echo "Exit: $?"
[PASTE OUTPUT]

$ pnpm test 2>&1 | tail -20 && echo "Exit: $?"
[PASTE OUTPUT]
```

### AC Verification
- [ ] AC-3 passes: Modal appears with name input requirement
- [ ] AC-4 passes: Delete button enabled only for correct name
- [ ] AC-6 passes: Cancel and close options work correctly
- [ ] Screenshot taken: `scheduler/validation/screenshots/melo-v2/ST-P2-03-B-AC3.png`
- [ ] Screenshot taken: `scheduler/validation/screenshots/melo-v2/ST-P2-03-B-AC4.png`
- [ ] Screenshot taken: `scheduler/validation/screenshots/melo-v2/ST-P2-03-B-AC6.png`

---

## Completion Report Template

When done, write this to `scheduler/progress/melo-v2/ST-P2-03-B.md`:

```markdown
## Completion Report: ST-P2-03-B

**Status:** needs-validation
**Completed:** {timestamp}
**Worker:** {label}

### Files Changed
| File | Action | Verified |
|------|--------|----------|
| components/modals/delete-channel-modal.tsx | CREATE | `ls -la` output |
| components/modals/index.ts | MODIFY | Export added |

### Commits
| Hash | Message | Verified |
|------|---------|----------|
| {hash} | feat: add delete channel confirmation modal with name verification | `git log` output |

### Build Verification
```
{actual pnpm build output}
```

### Test Verification
```
{actual pnpm test output}
```

### AC Verification
- [ ] AC-3: Modal shows with name input + screenshot path
- [ ] AC-4: Delete enabled only for exact name match + screenshot path  
- [ ] AC-6: Cancel/close functionality works + screenshot path

### Self-Validation (Layer 1)
- Modal rendering: {PASS/FAIL - opens and displays correctly}
- Name validation: {PASS/FAIL - tested exact matching}
- Cancel flow: {PASS/FAIL - all close methods work}
- Build/Tests: {PASS/FAIL - all green}
```

---
*Task created by Coordinator for autonomous execution — 2026-02-28 07:30 EST*