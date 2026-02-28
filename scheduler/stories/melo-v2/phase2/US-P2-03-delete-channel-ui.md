# User Story: [US-P2-03] Delete Channel UI Implementation

**Epic:** MELO-V2-PHASE2-CHANNEL-MANAGEMENT
**Project:** melo-v2
**Status:** draft
**Story Architect:** story-architect (STORY-ARCHITECT-MELO-P2)
**Created:** 2026-02-28
**Version:** 1
**Test Server:** http://dev2.aaroncollins.info:3000

---

## Story

**As a** server admin or channel creator
**I want** to delete channels that are no longer needed
**So that** I can keep my server organized and remove obsolete or unwanted channels

---

## 🧠 Multi-Perspective Brainstorming

### User Perspective
**Primary Journey:**
- Admin right-clicks on channel → context menu → "Delete Channel"
- OR Admin opens channel settings → scrolls to danger zone → "Delete Channel" button
- Confirmation modal requires typing channel name → confirms → channel removed

**Pain Points to Address:**
- S08 Audit found: Delete Channel functionality NOT ACCESSIBLE at any viewport size
- No context menus, settings panels, or delete buttons found anywhere
- Backend status unknown (cannot test without UI access)

**Expected Discord-like Experience:**
- Right-click channel name → "Delete Channel" option (with warning icon)
- Channel Settings → Danger Zone → "Delete Channel" button
- Confirmation dialog: "Type channel name to confirm deletion"
- Immediate removal from channel list

### Admin Perspective
**Operational Needs:**
- Only admins/owners or channel creators should delete channels
- Audit log of deleted channels (who, when, which channel)
- Ability to see message count before deletion (optional warning)
- No accidental deletions (require name typing)

**Security Requirements:**
- Permission check before showing delete option
- Cannot delete #general or other protected channels
- Rate limiting to prevent mass deletion attacks

### Moderator Perspective
**Concerns:**
- Moderators may need delete permission (configurable per server)
- Clear indication of which channels are deletable
- Should see channel stats before deletion decision
- Warning if channel has recent activity

### Technical Perspective
**Implementation Status (from S08 Audit):**
- ❌ No delete channel UI elements found at any viewport
- ⚠️ Backend status unknown (no UI to trigger API)
- ❌ No channel context menus implemented
- ❌ No channel settings page with delete option

**What Needs Implementation:**
- Channel context menu component
- Delete confirmation modal (with name typing)
- Channel settings danger zone section
- Matrix room deletion API integration
- Permission checks for delete access

---

## Acceptance Criteria

### AC-1: Delete Channel Option in Context Menu (P1-PRIMARY)

**Given** an authenticated admin/owner viewing a channel list
**When** they right-click on a channel they have permission to delete
**Then** a context menu appears with a "Delete Channel" option (styled as destructive action)

**Validation:**
- Method: Playwright E2E test
- Test Server: http://dev2.aaroncollins.info:3000
- Screenshot: Required ✅
- Test Devices: Desktop (1920x1080), Tablet (768x1024)

**Playwright Test Scenario:**
```typescript
test('AC-1: Channel context menu has Delete option for admins', async ({ page }) => {
  await loginAsAdminUser(page);
  await navigateToServer(page);
  
  const channelItem = page.locator('[data-testid="channel-item"]').first();
  await channelItem.click({ button: 'right' });
  
  const contextMenu = page.locator('[data-testid="channel-context-menu"]');
  await expect(contextMenu).toBeVisible();
  
  const deleteOption = contextMenu.locator('text=Delete Channel');
  await expect(deleteOption).toBeVisible();
  await expect(deleteOption).toHaveClass(/destructive|danger|red/);
  await page.screenshot({ path: 'evidence/ac1-delete-context-menu.png' });
});
```

---

### AC-2: Delete Option NOT Shown for Non-Admins

**Given** a regular member (non-admin) viewing a channel list
**When** they right-click on a channel
**Then** the "Delete Channel" option is NOT visible in the context menu

**Validation:**
- Method: Playwright E2E test
- Screenshot: Required ✅

**Playwright Test Scenario:**
```typescript
test('AC-2: Regular members cannot see delete option', async ({ page }) => {
  await loginAsRegularUser(page);
  await navigateToServer(page);
  
  const channelItem = page.locator('[data-testid="channel-item"]').first();
  await channelItem.click({ button: 'right' });
  
  const contextMenu = page.locator('[data-testid="channel-context-menu"]');
  await expect(contextMenu).toBeVisible();
  
  const deleteOption = contextMenu.locator('text=Delete Channel');
  await expect(deleteOption).not.toBeVisible();
  await page.screenshot({ path: 'evidence/ac2-no-delete-for-regular.png' });
});
```

---

### AC-3: Delete Channel Confirmation Modal

**Given** an admin clicks "Delete Channel"
**When** the action is initiated
**Then** a confirmation modal appears requiring them to type the channel name to confirm

**Validation:**
- Method: Playwright E2E test
- Screenshot: Required ✅

**Playwright Test Scenario:**
```typescript
test('AC-3: Delete confirmation requires channel name', async ({ page }) => {
  await loginAsAdminUser(page);
  await triggerDeleteChannelFromContextMenu(page, 'test-channel');
  
  const modal = page.locator('[data-testid="delete-channel-modal"]');
  await expect(modal).toBeVisible();
  
  await expect(modal.locator('text=Delete Channel')).toBeVisible();
  await expect(modal.locator('text=test-channel')).toBeVisible();
  await expect(modal.locator('input[placeholder*="channel name"]')).toBeVisible();
  await expect(modal.locator('button:has-text("Delete")')).toBeDisabled();
  
  await page.screenshot({ path: 'evidence/ac3-delete-modal.png' });
});
```

---

### AC-4: Delete Button Enabled After Correct Name Entry

**Given** an admin is in the delete confirmation modal
**When** they type the exact channel name correctly
**Then** the Delete button becomes enabled

**Validation:**
- Method: Playwright E2E test
- Screenshot: Required ✅

**Playwright Test Scenario:**
```typescript
test('AC-4: Delete button enabled after typing channel name', async ({ page }) => {
  await loginAsAdminUser(page);
  await triggerDeleteChannelFromContextMenu(page, 'test-channel');
  
  const modal = page.locator('[data-testid="delete-channel-modal"]');
  const deleteButton = modal.locator('button:has-text("Delete")');
  const nameInput = modal.locator('input[placeholder*="channel name"]');
  
  // Initially disabled
  await expect(deleteButton).toBeDisabled();
  
  // Wrong name keeps disabled
  await nameInput.fill('wrong-name');
  await expect(deleteButton).toBeDisabled();
  
  // Correct name enables
  await nameInput.fill('test-channel');
  await expect(deleteButton).toBeEnabled();
  await page.screenshot({ path: 'evidence/ac4-delete-enabled.png' });
});
```

---

### AC-5: Successful Channel Deletion

**Given** an admin confirms deletion by typing the channel name and clicking Delete
**When** the deletion is processed
**Then** the channel is removed from the list and a success message appears

**Validation:**
- Method: Playwright E2E test
- Screenshot: Required ✅ (before and after)
- Test Data: Create test channel, then delete

**Playwright Test Scenario:**
```typescript
test('AC-5: Successful deletion removes channel from list', async ({ page }) => {
  await loginAsAdminUser(page);
  
  // Create test channel first
  const channelName = `test-${Date.now()}`;
  await createTestChannel(page, channelName);
  await page.screenshot({ path: 'evidence/ac5-before-delete.png' });
  
  await triggerDeleteChannelFromContextMenu(page, channelName);
  await page.fill('input[placeholder*="channel name"]', channelName);
  await page.click('button:has-text("Delete")');
  
  // Channel should be removed
  await expect(page.locator(`text=${channelName}`)).not.toBeVisible({ timeout: 5000 });
  await page.screenshot({ path: 'evidence/ac5-after-delete.png' });
});
```

---

### AC-6: Cancel Deletion Flow

**Given** an admin opens the delete confirmation modal
**When** they click "Cancel" or close the modal
**Then** the modal closes and the channel remains unchanged

**Validation:**
- Method: Playwright E2E test
- Screenshot: Required ✅

---

### AC-7: Error Handling - Deletion Fails

**Given** an admin attempts to delete a channel but the API fails
**When** the Matrix deletion API returns an error
**Then** an error message is displayed with option to retry

**Validation:**
- Method: Playwright E2E test with network interception
- Screenshot: Required ✅

---

### AC-8: Cannot Delete Protected Channels

**Given** an admin tries to delete a protected channel (e.g., #general)
**When** they access the context menu
**Then** the Delete option is disabled OR a warning explains the channel cannot be deleted

**Validation:**
- Method: Playwright E2E test
- Screenshot: Required ✅

---

### AC-9: Delete Channel in Channel Settings

**Given** an admin opens channel settings
**When** they scroll to the danger zone section
**Then** they see a "Delete Channel" button with appropriate warnings

**Validation:**
- Method: Playwright E2E test
- Screenshot: Required ✅

**Playwright Test Scenario:**
```typescript
test('AC-9: Channel settings has Delete Channel option', async ({ page }) => {
  await loginAsAdminUser(page);
  await navigateToChannel(page, 'test-channel');
  await openChannelSettings(page);
  
  // Scroll to danger zone
  const dangerZone = page.locator('[data-testid="danger-zone"]');
  await dangerZone.scrollIntoViewIfNeeded();
  
  const deleteButton = dangerZone.locator('button:has-text("Delete Channel")');
  await expect(deleteButton).toBeVisible();
  await page.screenshot({ path: 'evidence/ac9-settings-delete.png' });
});
```

---

### AC-10: Mobile Delete Flow

**Given** a mobile user (375x667 viewport) with admin permissions
**When** they long-press on a channel
**Then** they can access and use the Delete Channel option

**Validation:**
- Method: Playwright E2E test with mobile viewport
- Screenshot: Required ✅

---

## Contingencies

### What Could Go Wrong

| Risk | Likelihood | Impact | Detection | Mitigation |
|------|------------|--------|-----------|------------|
| Matrix room deletion fails | L | H | API error response | Error toast, retry option |
| User misclicks delete accidentally | M | H | N/A | Name confirmation requirement |
| Protected channel deleted | L | H | Server state check | Block deletion, show warning |
| Permission check fails | L | M | Auth error | Refresh permissions, retry |
| Channel has active users | M | M | User count check | Warning with user count |
| Deletion takes too long | L | M | Timeout | Loading state, async notification |

### Fallback Options
- **If context menu fails:** Delete via channel settings page only
- **If Matrix API unavailable:** Queue deletion, process when available
- **If name confirmation fails:** Simple checkbox confirmation as fallback

### Blockers (Would Prevent Story Completion)
| Blocker | Likelihood | Mitigation |
|---------|------------|------------|
| Matrix room deletion API unavailable | L | Verify API exists in SDK |
| No admin test accounts | M | Create admin accounts in test setup |
| Channel creation not working (S07) | M | S07 has issues, may need fix first |

### Early Warning Signs
- Matrix SDK missing room deletion methods
- Permission system not granular enough
- Context menu library conflicts
- Mobile long-press not firing

---

## Dependencies

### Dependency Graph
```
[Channel List Component] ─┬─► [US-P2-03: Delete UI] ─┬─► [Complete Channel Mgmt]
                          │                           │
[Matrix Room Deletion API]┤                           ├─► [Server Cleanup Features]
                          │                           │
[Permission System] ──────┘                           └─► [Admin Dashboard]
                                                      
[S07: Create Channel] ───► [Test Channels to Delete]
```

### Upstream (Must Complete First)
| Dependency | Type | Status | Blocker? | Notes |
|------------|------|--------|----------|-------|
| Channel list component | technical | ✅ done | no | Channels display in sidebar |
| S07 Create Channel | story | ⚠️ has defects | soft | Need channels to delete |
| Permission system | technical | ⚠️ unknown | maybe | Need to verify admin checks |
| Matrix room deletion | technical | ⚠️ unknown | maybe | Verify SDK support |

### Downstream (Waiting on This)
| Dependent | Type | Impact if Delayed |
|-----------|------|-------------------|
| Complete channel management | feature | Channels accumulate |
| Server admin workflows | feature | Admin capabilities limited |

### External Dependencies
| External | Description | Status | Fallback |
|----------|-------------|--------|----------|
| Matrix Homeserver | room deletion API | testing | Verify exists |

### Technical Prerequisites
- [ ] Channel context menu component
- [ ] Delete confirmation modal component
- [ ] Channel settings page exists
- [ ] Matrix room deletion integration
- [ ] Permission checking utilities

---

## Out of Scope

Explicitly NOT included in this story (to prevent scope creep):
- Archive channel instead of delete
- Soft delete / restore functionality
- Export channel history before deletion
- Batch delete multiple channels
- Scheduled deletion
- Deletion notification to channel members
- Deletion approval workflow (multi-admin)

---

## Technical Notes

### Suggested Approach
1. **Verify Matrix SDK room deletion** - Confirm API exists and works
2. **Create DeleteChannelModal component** - With name confirmation
3. **Build channel context menu** - Right-click handler
4. **Add to channel settings** - Danger zone section
5. **Implement permission checks** - Admin/owner only
6. **Handle mobile interactions** - Long-press for context menu

### Patterns to Follow
- Use LeaveServerModal as reference for confirmation pattern
- Follow Discord's destructive action styling (red buttons, warnings)
- Use existing permission checking patterns
- Match existing context menu implementations

### Anti-Patterns to Avoid
- Don't allow deletion without confirmation
- Don't delete in foreground (use async with loading state)
- Don't show delete option to non-admins
- Don't allow deleting the last channel in a category

### Matrix Integration Notes
```typescript
// Matrix room deletion
await matrixClient.forget(roomId); // Remove from user's view
// Note: Matrix rooms can't be truly deleted, only forgotten
// Consider: leave room + kick all members + remove from space
```

---

## Test Credentials

**Location:** `~/.env.test-credentials`
**Note:** Never commit actual passwords to git

**Test Data Requirements:**
- Admin user account with delete permissions
- Regular user account without delete permissions
- Test server with multiple channels
- Protected channel (#general) for restriction testing

---

## Sub-Tasks (Coordinator Fills This)

| Task ID | Description | Model | Status |
|---------|-------------|-------|--------|
| | | | |

---

## Definition of Done

- [ ] AC-1: Context menu shows Delete for admins
- [ ] AC-2: Delete hidden from non-admins
- [ ] AC-3: Confirmation modal requires name typing
- [ ] AC-4: Delete enabled after correct name
- [ ] AC-5: Successful deletion removes channel
- [ ] AC-6: Cancel preserves channel
- [ ] AC-7: API errors handled gracefully
- [ ] AC-8: Protected channels cannot be deleted
- [ ] AC-9: Delete available in channel settings
- [ ] AC-10: Mobile long-press works
- [ ] Playwright E2E tests created and passing
- [ ] Screenshots captured for ALL acceptance criteria
- [ ] No browser console errors
- [ ] Code committed with descriptive message
- [ ] L1 (Self) validation complete
- [ ] L2 (Manager) validation complete
- [ ] L3 (Peer) validation complete

---

## Validation History

| Level | Validator | Date | Result | Report |
|-------|-----------|------|--------|--------|
| L1 Self | | | | |
| L2 Manager | | | | |
| L3 Peer | | | | |

---

## Review Checklist (Story Architect / Reviewer)

### Completeness
- [x] Happy path covered (AC-5)
- [x] Alternate valid paths covered (AC-1, AC-9)
- [x] All error scenarios covered (AC-7)
- [x] All edge cases covered (AC-2, AC-8)
- [x] Empty states covered (N/A)
- [x] Boundary conditions covered (protected channels)
- [x] Permission/auth cases covered (AC-2)

### Testability
- [x] Every AC has Given/When/Then
- [x] Every AC has validation method
- [x] ACs are specific and measurable
- [x] No ambiguous language

### Dependencies
- [x] Upstream dependencies identified
- [x] Downstream dependents identified
- [x] External dependencies mapped
- [x] Technical prerequisites listed
- [x] No circular dependencies

### Contingencies
- [x] Risks identified with mitigations
- [x] Fallback options documented
- [x] Blockers identified with workarounds
- [x] Early warning signs listed

### Clarity
- [x] Sonnet could implement without clarifying questions
- [x] No ambiguous terms
- [x] Scope boundaries explicit (out of scope)
- [x] Technical notes sufficient

---

## Review History

| Version | Reviewer | Date | Outcome | Key Feedback |
|---------|----------|------|---------|--------------|
| v1 | STORY-ARCHITECT-MELO-P2 | 2026-02-28 | draft | Initial creation from S08 audit findings |

---
*Story created from Phase 1 Audit S08 - Delete Channel: Complete UI implementation needed (P1-HIGH priority)*
