# User Story: [US-P2-02] Leave Server UI Integration

**Epic:** MELO-V2-PHASE2-SERVER-MANAGEMENT
**Project:** melo-v2
**Status:** draft
**Story Architect:** story-architect (STORY-ARCHITECT-MELO-P2)
**Created:** 2026-02-28
**Version:** 1
**Test Server:** http://dev2.aaroncollins.info:3000

---

## Story

**As a** server member who wants to leave a server
**I want** to easily find and use a "Leave Server" option in the UI
**So that** I can remove myself from servers I no longer wish to be part of

---

## 🧠 Multi-Perspective Brainstorming

### User Perspective
**Primary Journey:**
- User right-clicks on server name in sidebar → context menu appears → "Leave Server" option
- OR User opens server settings → scrolls to danger zone → "Leave Server" button
- Confirmation modal appears with server name → user confirms → server removed from list

**Pain Points to Address:**
- S06 Audit found: Backend (LeaveServerModal) is COMPLETE and production-ready
- BUT: No UI triggers exist to access this functionality
- Users have no way to leave servers through the interface

**Expected Discord-like Experience:**
- Right-click server icon → context menu with "Leave Server"
- Server dropdown menu → "Leave Server" option
- Clear confirmation dialog with server name visible
- Immediate removal from server list after leaving

### Admin Perspective
**Operational Needs:**
- Server owners should NOT be able to leave their own server (transfer ownership first)
- Admins should see audit logs of who left and when
- No impact on other members when someone leaves

**Security Requirements:**
- Confirmation required before leaving (prevent accidental clicks)
- Cannot leave and rejoin invite-only servers easily (warn user)

### Moderator Perspective
**Concerns:**
- Moderators leaving should be logged
- No special leave restrictions for moderators
- Clean handoff of moderation duties if relevant

### Technical Perspective
**Implementation Status (from S06 Audit):**
- ✅ `LeaveServerModal` component exists at `components/modals/leave-server-modal.tsx`
- ✅ Matrix `client.leave()` integration complete
- ✅ Child room cleanup for Matrix spaces implemented
- ✅ Error handling and loading states built
- ✅ Router navigation after leaving works
- ❌ **MISSING:** UI triggers to open the modal

**What Needs Implementation:**
- Server context menu (right-click)
- Server dropdown/settings integration
- Connect existing modal to trigger points

---

## Acceptance Criteria

### AC-1: Leave Server Option in Server Context Menu (P1-PRIMARY)

**Given** an authenticated user viewing the server list sidebar
**When** they right-click on a server they are a member of
**Then** a context menu appears with a "Leave Server" option

**Validation:**
- Method: Playwright E2E test
- Test Server: http://dev2.aaroncollins.info:3000
- Screenshot: Required ✅
- Test Devices: Desktop (1920x1080), Tablet (768x1024)

**Playwright Test Scenario:**
```typescript
test('AC-1: Server context menu has Leave Server option', async ({ page }) => {
  // Login and navigate to server list
  await loginAsTestUser(page);
  const serverIcon = page.locator('[data-testid="server-icon"]').first();
  await serverIcon.click({ button: 'right' });
  
  const contextMenu = page.locator('[data-testid="server-context-menu"]');
  await expect(contextMenu).toBeVisible();
  
  const leaveOption = contextMenu.locator('text=Leave Server');
  await expect(leaveOption).toBeVisible();
  await page.screenshot({ path: 'evidence/ac1-context-menu.png' });
});
```

---

### AC-2: Leave Server Option in Server Settings/Dropdown

**Given** an authenticated user viewing server options
**When** they click on the server dropdown menu or access server settings
**Then** they see a "Leave Server" option/button

**Validation:**
- Method: Playwright E2E test
- Screenshot: Required ✅

**Playwright Test Scenario:**
```typescript
test('AC-2: Server dropdown has Leave Server option', async ({ page }) => {
  await loginAsTestUser(page);
  const serverDropdown = page.locator('[data-testid="server-dropdown"]');
  await serverDropdown.click();
  
  const leaveOption = page.locator('text=Leave Server');
  await expect(leaveOption).toBeVisible();
});
```

---

### AC-3: Leave Server Confirmation Modal Opens

**Given** a user clicks "Leave Server" from any UI trigger
**When** the action is initiated
**Then** the LeaveServerModal opens with server name displayed and Cancel/Leave buttons

**Validation:**
- Method: Playwright E2E test
- Screenshot: Required ✅

**Playwright Test Scenario:**
```typescript
test('AC-3: Leave Server modal opens with confirmation', async ({ page }) => {
  await loginAsTestUser(page);
  await triggerLeaveServerFromContextMenu(page);
  
  const modal = page.locator('[data-testid="leave-server-modal"]');
  await expect(modal).toBeVisible();
  await expect(modal.locator('text=Are you sure')).toBeVisible();
  await expect(modal.locator('button:has-text("Cancel")')).toBeVisible();
  await expect(modal.locator('button:has-text("Leave")')).toBeVisible();
  await page.screenshot({ path: 'evidence/ac3-confirmation-modal.png' });
});
```

---

### AC-4: Successful Leave Server Flow

**Given** a user confirms leaving a server
**When** they click the "Leave" button in the confirmation modal
**Then** the server is removed from their server list and they are redirected appropriately

**Validation:**
- Method: Playwright E2E test
- Screenshot: Required ✅ (before and after)
- Test Data: Create a test server, join it, then leave

**Playwright Test Scenario:**
```typescript
test('AC-4: Successfully leave server removes from list', async ({ page }) => {
  await loginAsTestUser(page);
  const serverCountBefore = await page.locator('[data-testid="server-icon"]').count();
  await page.screenshot({ path: 'evidence/ac4-before-leave.png' });
  
  await triggerLeaveServerFromContextMenu(page);
  await page.click('[data-testid="confirm-leave-button"]');
  
  // Wait for server to be removed
  await expect(page.locator('[data-testid="server-icon"]')).toHaveCount(serverCountBefore - 1);
  await page.screenshot({ path: 'evidence/ac4-after-leave.png' });
});
```

---

### AC-5: Cancel Leave Server Flow

**Given** a user opens the Leave Server confirmation modal
**When** they click "Cancel"
**Then** the modal closes and they remain a member of the server

**Validation:**
- Method: Playwright E2E test
- Screenshot: Required ✅

---

### AC-6: Error Handling - Network Failure

**Given** a user attempts to leave a server but the network fails
**When** the Matrix API call fails
**Then** an error message is displayed and they can retry

**Validation:**
- Method: Playwright E2E test with network interception
- Screenshot: Required ✅

---

### AC-7: Server Owner Cannot Leave (Must Transfer)

**Given** a user is the owner of a server
**When** they attempt to leave the server
**Then** they see a message indicating they must transfer ownership first OR the Leave option is disabled

**Validation:**
- Method: Playwright E2E test
- Screenshot: Required ✅

---

### AC-8: Mobile Touch-Friendly Leave Flow

**Given** a user on mobile (375x667 viewport)
**When** they long-press on a server icon OR access server options
**Then** they can find and use the Leave Server option

**Validation:**
- Method: Playwright E2E test with mobile viewport
- Screenshot: Required ✅

---

### AC-9: Leave Server Warning for Invite-Only Servers

**Given** a user is leaving an invite-only server
**When** the confirmation modal appears
**Then** it includes a warning that they may not be able to rejoin without a new invite

**Validation:**
- Method: Playwright E2E test
- Screenshot: Required ✅

---

## Contingencies

### What Could Go Wrong

| Risk | Likelihood | Impact | Detection | Mitigation |
|------|------------|--------|-----------|------------|
| Matrix leave API fails | L | M | API error response | Error toast, retry button |
| User clicks leave accidentally | M | M | Confirmation modal | Clear confirmation with server name |
| Context menu doesn't appear | L | H | UI test failure | Fallback to dropdown/settings |
| Child rooms not cleaned up | L | M | Orphan room detection | Matrix space leave handles children |
| Navigation fails after leave | L | M | Route error | Default to homepage redirect |
| Server owner leaves accidentally | L | H | Permission check | Block leave for owners |

### Fallback Options
- **If context menu fails:** Provide leave option in server settings page
- **If Matrix API unavailable:** Queue leave request, process when available
- **If modal doesn't load:** Inline confirmation in dropdown menu

### Blockers (Would Prevent Story Completion)
| Blocker | Likelihood | Mitigation |
|---------|------------|------------|
| LeaveServerModal broken | VL | Already verified working in S06 audit |
| No servers to test with | L | Depends on S04 Create Server |
| Authentication issues | L | DEF-006 resolution in progress |

### Early Warning Signs
- LeaveServerModal import errors
- Context menu library compatibility issues
- Matrix SDK version conflicts
- Right-click events not firing

---

## Dependencies

### Dependency Graph
```
[LeaveServerModal] ─┬─► [US-P2-02: Leave UI] ─┬─► [Server Management Complete]
                    │                          │
[Server Context Menu] ──────────────────────┘
                                               │
[US-P2-01: Registration] ─► [Authentication] ──┘
```

### Upstream (Must Complete First)
| Dependency | Type | Status | Blocker? | Notes |
|------------|------|--------|----------|-------|
| LeaveServerModal component | technical | ✅ done | no | Verified in S06 audit |
| Matrix client.leave() | technical | ✅ done | no | Integrated in modal |
| US-P2-01 Registration | story | 🔄 in-progress | soft | Need accounts to test |
| S04 Create Server | story | 🔄 audit-complete | yes (for testing) | Need servers to leave |

### Downstream (Waiting on This)
| Dependent | Type | Impact if Delayed |
|-----------|------|-------------------|
| Complete server management | feature | Users stuck in unwanted servers |
| Server cleanup workflows | feature | Cannot manage server membership |

### External Dependencies
| External | Description | Status | Fallback |
|----------|-------------|--------|----------|
| Matrix Homeserver | room.leave() API | available | None - core functionality |

### Technical Prerequisites
- [x] LeaveServerModal component exists and works
- [x] Matrix SDK room leave integration
- [ ] Server context menu component
- [ ] Server dropdown menu component
- [ ] Mobile long-press handling

---

## Out of Scope

Explicitly NOT included in this story (to prevent scope creep):
- Ownership transfer functionality (separate story)
- Leave with feedback/reason option
- Mass server leave (leave multiple at once)
- Leave server scheduling (leave at specific time)
- Archive conversations before leaving
- Export data before leaving
- Re-join request workflow

---

## Technical Notes

### Suggested Approach
1. **Create server context menu component** - Right-click handler on server icons
2. **Add "Leave Server" to context menu** - With onClick triggering modal
3. **Connect LeaveServerModal** - Import and render conditionally
4. **Add to server dropdown** - Alternative access method
5. **Handle mobile long-press** - Touch-friendly context menu
6. **Test end-to-end flow** - Create, join, leave cycle

### Existing Code to Leverage
```typescript
// Already exists and verified working:
import { LeaveServerModal } from '@/components/modals/leave-server-modal';

// Modal features:
// - server/space leave functionality
// - child room cleanup for spaces
// - error handling and loading states
// - router navigation after leaving
```

### Patterns to Follow
- Use existing modal patterns (CreateServerModal reference)
- Follow Radix UI context menu if used elsewhere
- Match Discord's confirmation dialog style
- Use existing toast/notification system for success/error

### Anti-Patterns to Avoid
- Don't allow leave without confirmation
- Don't block UI during leave operation (use loading state)
- Don't lose context menu on scroll
- Don't make mobile users pinch/zoom to access

---

## Test Credentials

**Location:** `~/.env.test-credentials`
**Note:** Never commit actual passwords to git

**Test Data Requirements:**
- Test user account (from US-P2-01)
- Test server to join and leave
- Server owner account for ownership tests

---

## Sub-Tasks (Coordinator Fills This)

| Task ID | Description | Model | Status |
|---------|-------------|-------|--------|
| | | | |

---

## Definition of Done

- [ ] AC-1: Context menu with Leave Server option (Desktop/Tablet)
- [ ] AC-2: Server dropdown/settings has Leave option
- [ ] AC-3: LeaveServerModal opens on trigger
- [ ] AC-4: Successful leave removes server from list
- [ ] AC-5: Cancel keeps server membership
- [ ] AC-6: Network error handled gracefully
- [ ] AC-7: Server owner blocked or warned
- [ ] AC-8: Mobile long-press works
- [ ] AC-9: Invite-only warning displayed
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
- [x] Happy path covered (AC-4)
- [x] Alternate valid paths covered (AC-1, AC-2)
- [x] All error scenarios covered (AC-6)
- [x] All edge cases covered (AC-7, AC-9)
- [x] Empty states covered (N/A - requires server membership)
- [x] Boundary conditions covered (owner cannot leave)
- [x] Permission/auth cases covered (owner restriction)

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
| v1 | STORY-ARCHITECT-MELO-P2 | 2026-02-28 | draft | Initial creation from S06 audit findings |

---
*Story created from Phase 1 Audit S06 - Leave Server: Backend ready, UI triggers missing (P1-HIGH priority)*
