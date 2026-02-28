# Sub-Task: [ST-P2-03-C] Channel Deletion API Integration

**User Story:** US-P2-03 (see `scheduler/stories/melo-v2/phase2/US-P2-03-delete-channel-ui.md`)
**Epic:** MELO-V2-PHASE2-CHANNEL-MANAGEMENT  
**Project:** melo-v2
**Status:** pending
**Assigned:** {worker}
**Model:** sonnet
**Created:** 2026-02-28

---

## Parent Story Context

**Story:** Delete Channel UI Implementation - Integrate actual Matrix room deletion with success/error handling
**ACs Covered:** AC-5 (Successful deletion removes channel), AC-7 (Error handling for API failures)

---

## Task Description

**As a** developer implementing US-P2-03
**I need to** integrate Matrix room deletion API with the confirmation modal and handle success/error states
**So that** AC-5 and AC-7 will pass (actual deletion works with proper error handling)

---

## Acceptance Criteria (Subset of Parent)

### AC-5: Successful Channel Deletion

**Given** an admin confirms deletion by typing the channel name and clicking Delete
**When** the deletion is processed
**Then** the channel is removed from the list and a success message appears

**Implementation Verification:**
- [ ] Matrix room deletion API called correctly
- [ ] Channel disappears from navigation list
- [ ] Success toast/notification appears
- [ ] Modal closes after successful deletion
- [ ] UI updates without requiring page refresh

### AC-7: Error Handling - Deletion Fails

**Given** an admin attempts to delete a channel but the API fails
**When** the Matrix deletion API returns an error
**Then** an error message is displayed with option to retry

**Implementation Verification:**
- [ ] API errors caught and handled gracefully
- [ ] Error message displayed to user
- [ ] Retry option provided
- [ ] Modal remains open on error
- [ ] Loading state cleared on error

---

## Explicit Instructions

**IMPORTANT:** Follow these steps exactly. Do not deviate.

### Step 1: Analyze Existing Matrix Integration
```bash
cd ~/clawd/repos/melo
find . -name "*.ts" -o -name "*.tsx" | xargs grep -l "matrix\|Matrix" | head -10
grep -r "deleteRoom\|forget\|leave" --include="*.ts" --include="*.tsx" . | head -5
```
Look for existing Matrix client integration and room management patterns.

### Step 2: Find Matrix Client Access Pattern
```bash
cd ~/clawd/repos/melo
grep -r "useMatrix\|MatrixClient" --include="*.ts" --include="*.tsx" . | head -5
find . -name "*matrix*" -type f | head -10
```
Understand how Matrix client is accessed in components.

### Step 3: Create Channel Deletion Hook/Utility
- File: `lib/matrix/hooks/use-delete-channel.ts` or `lib/matrix/delete-channel.ts`
- Action: CREATE
- Pattern to follow: Look for existing Matrix operation patterns
```typescript
interface DeleteChannelOptions {
  channelId: string;
  channelName: string;
}

interface DeleteChannelResult {
  deleteChannel: (options: DeleteChannelOptions) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}
```

### Step 4: Implement Matrix Room Deletion
Research Matrix room deletion:
- `matrixClient.leave(roomId)` - Leave the room
- `matrixClient.forget(roomId)` - Remove from client
- Check if room needs to be kicked from space/community

### Step 5: Integrate with Delete Modal
- Modify `delete-channel-modal.tsx` from ST-P2-03-B
- Add loading states and error handling
- Connect the confirmation to actual deletion

### Step 6: Update Channel List State
Find how channel list is managed and ensure it updates after deletion:
```bash
grep -r "channel.*list\|navigation.*items" --include="*.ts" --include="*.tsx" . | head -5
```

### Step 7: Add Success/Error Notifications
Look for existing toast/notification system:
```bash
find . -name "*toast*" -o -name "*notification*" | head -5
grep -r "toast\|notification" --include="*.ts" --include="*.tsx" components/ | head -5
```

### Step 8: Test Integration
```bash
pnpm build
pnpm test
```

---

## Contingencies

### What Could Go Wrong (Implementation Level)

| Risk | Detection | Resolution |
|------|-----------|------------|
| Matrix deletion API unclear | Build/runtime errors | Use leave + forget pattern, document limitations |
| No Matrix client access | TypeScript errors | Find existing Matrix context/provider |
| Channel list not updating | UI doesn't refresh | Force refresh or use state management |
| No notification system | No user feedback | Create simple error display in modal |
| Deletion permissions not checked | API returns 403/401 | Add permission check before API call |

### If You Get Stuck
1. **Check existing Matrix operations** (join room, leave room, create room)
2. **Look at LeaveServerModal** for similar Matrix integration patterns
3. **Document the Matrix client pattern** if unclear
4. **Note any permission system** discovered

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
| ST-P2-03-B | task | in-progress | Need modal component to integrate with |
| Matrix client access | technical | verify exists | Need to call deletion API |

### Downstream (Waiting on This)
| Dependent | Impact |
|-----------|--------|
| Channel management completeness | feature | Admin can't remove unwanted channels |

### Files This Task Touches
- `lib/matrix/hooks/use-delete-channel.ts` — CREATE
- `components/modals/delete-channel-modal.tsx` — MODIFY (add API integration)
- Channel list component — MODIFY (to handle deletion updates)

### Files You Should NOT Touch
- Context menu component — Already handled by ST-P2-03-A
- Modal base structure — ST-P2-03-B handles that

---

## Model Guidance

**This task requires:** sonnet

### Sonnet Reasoning Required
- Matrix API integration patterns and error handling
- Async operation management with loading states
- State management for channel list updates
- Error handling strategies and user feedback
- Integration architecture between modal and backend

---

## Validation Checklist

Before claiming `needs-validation`:

### Evidence Required (PASTE ACTUAL OUTPUT)
```bash
$ cd ~/clawd/repos/melo && pwd
[PASTE OUTPUT]

$ ls -la 'lib/matrix/hooks/use-delete-channel.ts' || ls -la 'lib/matrix/delete-channel.ts'
[PASTE OUTPUT]

$ git log --oneline -1
[PASTE OUTPUT]

$ pnpm build 2>&1 | tail -10 && echo "Exit: $?"
[PASTE OUTPUT]

$ pnpm test 2>&1 | tail -20 && echo "Exit: $?"
[PASTE OUTPUT]
```

### AC Verification
- [ ] AC-5 passes: Channel deletion removes from list with success feedback
- [ ] AC-7 passes: API errors handled gracefully with retry option
- [ ] Screenshot taken: `scheduler/validation/screenshots/melo-v2/ST-P2-03-C-AC5.png`
- [ ] Screenshot taken: `scheduler/validation/screenshots/melo-v2/ST-P2-03-C-AC7.png`

**Note:** These ACs require live testing which may be blocked by dev2 infrastructure issues.

---

## Completion Report Template

When done, write this to `scheduler/progress/melo-v2/ST-P2-03-C.md`:

```markdown
## Completion Report: ST-P2-03-C

**Status:** needs-validation
**Completed:** {timestamp}
**Worker:** {label}

### Files Changed
| File | Action | Verified |
|------|--------|----------|
| lib/matrix/hooks/use-delete-channel.ts | CREATE | `ls -la` output |
| components/modals/delete-channel-modal.tsx | MODIFY | API integration added |
| {channel-list-component} | MODIFY | Deletion handling |

### Commits
| Hash | Message | Verified |
|------|---------|----------|
| {hash} | feat: integrate Matrix room deletion API with error handling | `git log` output |

### Build Verification
```
{actual pnpm build output}
```

### Test Verification
```
{actual pnpm test output}
```

### AC Verification
- [ ] AC-5: Successful deletion works (may be blocked by dev2 infrastructure) + screenshot path
- [ ] AC-7: Error handling implemented + screenshot path

### Self-Validation (Layer 1)
- Matrix integration: {PASS/FAIL - API calls implemented correctly}
- Error handling: {PASS/FAIL - tried error scenarios}
- State management: {PASS/FAIL - channel list updates}
- Build/Tests: {PASS/FAIL - all green}

### Notes
- Infrastructure blocker: {note if dev2 prevents live testing}
- Matrix API limitations: {document any discoveries about room deletion}
```

---
*Task created by Coordinator for autonomous execution — 2026-02-28 07:30 EST*