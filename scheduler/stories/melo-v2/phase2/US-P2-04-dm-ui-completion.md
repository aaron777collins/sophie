# User Story: [US-P2-04] DM UI Component Completions

**Epic:** MELO-V2-PHASE2-DIRECT-MESSAGING
**Project:** melo-v2
**Status:** draft
**Story Architect:** story-architect (STORY-ARCHITECT-MELO-P2)
**Created:** 2026-02-28
**Version:** 1
**Test Server:** http://dev2.aaroncollins.info:3000

---

## Story

**As a** MELO V2 user wanting private conversations
**I want** to initiate and manage direct message conversations
**So that** I can communicate privately with other users outside of server channels

---

## 🧠 Multi-Perspective Brainstorming

### User Perspective
**Primary Journey:**
- User clicks "Direct Messages" section in sidebar → sees DM list with "+" button
- OR User clicks on another user's profile → clicks "Message" button
- DM interface opens → user types message → sends → sees conversation history

**Pain Points to Address (from S11/S12 Audits):**
- ❌ **S11:** DM functionality COMPLETELY MISSING at all viewport sizes
- ❌ No DM sidebar section exists
- ❌ No "Message" option in user profiles
- ❌ No DM creation flow or user selection
- ❌ **S12:** DM conversation interface completely absent
- ❌ No DM message input in DM context
- ❌ No DM message display area
- ✅ "Direct" button exists and works across viewports (but leads nowhere)

**Expected Discord-like Experience:**
- "Direct Messages" section in left sidebar with list of DM conversations
- "+" button to start new DM
- User search/selection to start DM
- Click on user profile → "Message" option
- Full conversation view with message history, input, send button

### Admin Perspective
**Operational Needs:**
- DM logs available for moderation (if reported)
- Ability to disable DM functionality server-wide (future)
- User blocking capabilities to prevent harassment

**Security Requirements:**
- Encryption indicators for DMs
- Spam prevention (rate limiting)
- Report mechanism for inappropriate DMs

### Moderator Perspective
**Concerns:**
- Cannot moderate DM content directly (privacy)
- Need user reporting mechanism
- Block/unblock functionality essential
- Clear indication of DM vs channel context

### Technical Perspective
**Implementation Status (from S11/S12 Audits):**
- ✅ "Direct" button navigation exists and works
- ❌ No DM sidebar section component
- ❌ No DM conversation interface
- ❌ No DM message input/display
- ❌ No user profile "Message" integration
- ⚠️ Matrix DM backend capability unknown (no UI to test)

**What Needs Implementation:**
- DM list sidebar component
- New DM creation modal with user search
- DM conversation view component
- DM message input (can leverage existing chat-input)
- DM message display (can leverage existing message components)
- User profile "Message" button integration
- Matrix DM room creation and messaging

---

## Acceptance Criteria

### AC-1: DM Section in Sidebar (P0-CRITICAL)

**Given** an authenticated user viewing the MELO V2 interface
**When** they look at the left sidebar
**Then** they see a "Direct Messages" section with a "+" button to start new DMs

**Validation:**
- Method: Playwright E2E test
- Test Server: http://dev2.aaroncollins.info:3000
- Screenshot: Required ✅
- Test Devices: Desktop (1920x1080), Tablet (768x1024), Mobile (375x667)

**Playwright Test Scenario:**
```typescript
test('AC-1: DM section visible in sidebar', async ({ page }) => {
  await loginAsTestUser(page);
  
  const dmSection = page.locator('[data-testid="dm-section"]');
  await expect(dmSection).toBeVisible();
  
  const dmHeader = dmSection.locator('text=Direct Messages');
  await expect(dmHeader).toBeVisible();
  
  const newDmButton = dmSection.locator('[data-testid="new-dm-button"]');
  await expect(newDmButton).toBeVisible();
  
  await page.screenshot({ path: 'evidence/ac1-dm-section.png' });
});
```

---

### AC-2: New DM Creation Modal

**Given** a user clicks the "+" button in the DM section
**When** the modal opens
**Then** they see a user search/selection interface to start a new DM

**Validation:**
- Method: Playwright E2E test
- Screenshot: Required ✅

**Playwright Test Scenario:**
```typescript
test('AC-2: New DM modal with user search', async ({ page }) => {
  await loginAsTestUser(page);
  
  await page.click('[data-testid="new-dm-button"]');
  
  const modal = page.locator('[data-testid="new-dm-modal"]');
  await expect(modal).toBeVisible();
  
  const searchInput = modal.locator('input[placeholder*="Search"]');
  await expect(searchInput).toBeVisible();
  
  const userList = modal.locator('[data-testid="user-search-results"]');
  await expect(userList).toBeVisible();
  
  await page.screenshot({ path: 'evidence/ac2-new-dm-modal.png' });
});
```

---

### AC-3: User Selection Creates DM

**Given** a user selects another user from the DM creation modal
**When** they click the user or confirm selection
**Then** a DM conversation is created/opened with that user

**Validation:**
- Method: Playwright E2E test
- Screenshot: Required ✅

**Playwright Test Scenario:**
```typescript
test('AC-3: Selecting user opens DM conversation', async ({ page }) => {
  await loginAsTestUser(page);
  
  await page.click('[data-testid="new-dm-button"]');
  
  // Search for and select a user
  await page.fill('input[placeholder*="Search"]', 'testuser2');
  await page.click('[data-testid="user-result-testuser2"]');
  
  // DM conversation should open
  const dmConversation = page.locator('[data-testid="dm-conversation"]');
  await expect(dmConversation).toBeVisible();
  
  await page.screenshot({ path: 'evidence/ac3-dm-opened.png' });
});
```

---

### AC-4: DM Conversation Interface (P0-CRITICAL)

**Given** a user has opened a DM conversation
**When** the DM view loads
**Then** they see a message history area, message input field, and send button

**Validation:**
- Method: Playwright E2E test
- Screenshot: Required ✅

**Playwright Test Scenario:**
```typescript
test('AC-4: DM conversation has complete interface', async ({ page }) => {
  await loginAsTestUser(page);
  await openExistingDM(page);
  
  // Message history area
  const messageHistory = page.locator('[data-testid="dm-messages"]');
  await expect(messageHistory).toBeVisible();
  
  // Message input
  const messageInput = page.locator('[data-testid="dm-message-input"]');
  await expect(messageInput).toBeVisible();
  
  // Send button
  const sendButton = page.locator('[data-testid="dm-send-button"]');
  await expect(sendButton).toBeVisible();
  
  await page.screenshot({ path: 'evidence/ac4-dm-interface.png' });
});
```

---

### AC-5: Send DM Message (P0-CRITICAL)

**Given** a user is in a DM conversation with message input visible
**When** they type a message and click send (or press Enter)
**Then** the message appears in the conversation history

**Validation:**
- Method: Playwright E2E test
- Screenshot: Required ✅

**Playwright Test Scenario:**
```typescript
test('AC-5: Send DM message shows in conversation', async ({ page }) => {
  await loginAsTestUser(page);
  await openExistingDM(page);
  
  const testMessage = `Test DM ${Date.now()}`;
  
  await page.fill('[data-testid="dm-message-input"]', testMessage);
  await page.click('[data-testid="dm-send-button"]');
  
  // Message should appear in history
  await expect(page.locator(`text=${testMessage}`)).toBeVisible({ timeout: 5000 });
  
  await page.screenshot({ path: 'evidence/ac5-dm-sent.png' });
});
```

---

### AC-6: DM List Shows Active Conversations

**Given** a user has existing DM conversations
**When** they view the DM section in the sidebar
**Then** they see a list of their active DM conversations with user avatars/names

**Validation:**
- Method: Playwright E2E test
- Screenshot: Required ✅

**Playwright Test Scenario:**
```typescript
test('AC-6: DM list shows active conversations', async ({ page }) => {
  await loginAsTestUser(page);
  
  // After having at least one DM conversation
  const dmList = page.locator('[data-testid="dm-list"]');
  await expect(dmList).toBeVisible();
  
  const dmItems = page.locator('[data-testid="dm-list-item"]');
  await expect(dmItems.first()).toBeVisible();
  
  await page.screenshot({ path: 'evidence/ac6-dm-list.png' });
});
```

---

### AC-7: User Profile "Message" Option

**Given** a user views another user's profile
**When** the profile displays
**Then** they see a "Message" button that starts a DM with that user

**Validation:**
- Method: Playwright E2E test
- Screenshot: Required ✅

**Playwright Test Scenario:**
```typescript
test('AC-7: User profile has Message button', async ({ page }) => {
  await loginAsTestUser(page);
  await openUserProfile(page, 'testuser2');
  
  const messageButton = page.locator('button:has-text("Message")');
  await expect(messageButton).toBeVisible();
  
  await messageButton.click();
  
  // Should open DM with that user
  const dmConversation = page.locator('[data-testid="dm-conversation"]');
  await expect(dmConversation).toBeVisible();
  
  await page.screenshot({ path: 'evidence/ac7-profile-message.png' });
});
```

---

### AC-8: Empty DM State

**Given** a new user with no DM conversations
**When** they view the DM section
**Then** they see an appropriate empty state with prompt to start first DM

**Validation:**
- Method: Playwright E2E test
- Screenshot: Required ✅

---

### AC-9: Mobile DM Experience

**Given** a user on mobile (375x667 viewport)
**When** they access DM functionality
**Then** the DM section, creation modal, and conversation interface are fully usable

**Validation:**
- Method: Playwright E2E test with mobile viewport
- Screenshot: Required ✅

---

### AC-10: DM Notification/Unread Indicator

**Given** a user has unread DM messages
**When** they view the DM section
**Then** they see visual indicators (badges/dots) showing unread counts

**Validation:**
- Method: Playwright E2E test
- Screenshot: Required ✅

---

### AC-11: Click DM List Item Opens Conversation

**Given** a user has DM conversations in their list
**When** they click on a DM list item
**Then** that DM conversation opens with full message history

**Validation:**
- Method: Playwright E2E test
- Screenshot: Required ✅

---

## Contingencies

### What Could Go Wrong

| Risk | Likelihood | Impact | Detection | Mitigation |
|------|------------|--------|-----------|------------|
| Matrix DM room creation fails | M | H | API error | Error toast, retry option |
| User search returns no results | M | L | Empty results | "No users found" message |
| DM message send fails | L | H | API error | Retry button, save draft |
| Real-time updates not working | M | M | Messages delayed | Poll fallback, refresh |
| User not found for DM | L | M | 404 response | Graceful error message |
| Rate limiting on DM creation | L | L | 429 response | Cooldown message |

### Fallback Options
- **If Matrix DM API unavailable:** Queue message, send when available
- **If user search fails:** Allow direct username entry
- **If real-time breaks:** Manual refresh button

### Blockers (Would Prevent Story Completion)
| Blocker | Likelihood | Mitigation |
|---------|------------|------------|
| Matrix SDK DM support missing | L | Verify SDK capabilities first |
| User search API unavailable | M | Build simple user lookup |
| No users to DM in test environment | M | Create multiple test accounts |

### Early Warning Signs
- Matrix SDK missing DM room creation methods
- User search returns incorrect format
- Chat input component not reusable
- Message display component incompatible

---

## Dependencies

### Dependency Graph
```
[Chat Input Component] ─┬─► [US-P2-04: DM UI] ─┬─► [Complete DM System]
                        │                       │
[Message Display Component] ─────────────────┘
                        │                       │
[User Search API] ──────┤                       ├─► [User Engagement]
                        │                       │
[Matrix DM Integration] ┘                       └─► [Notifications]

[US-P2-01: Registration] ───► [Users to DM]
```

### Upstream (Must Complete First)
| Dependency | Type | Status | Blocker? | Notes |
|------------|------|--------|----------|-------|
| US-P2-01 Registration | story | 🔄 in-progress | yes | Need users to DM |
| Chat input component | technical | ✅ exists | no | Reusable for DMs |
| Message display component | technical | ⚠️ has issues (S09) | maybe | May need fixes |
| User authentication | technical | ✅ done | no | Login works |

### Downstream (Waiting on This)
| Dependent | Type | Impact if Delayed |
|-----------|------|-------------------|
| Complete messaging system | feature | DM use cases blocked |
| User engagement features | feature | Private communication impossible |
| Notification system | feature | Cannot notify of DMs |

### External Dependencies
| External | Description | Status | Fallback |
|----------|-------------|--------|----------|
| Matrix Homeserver | DM room creation | testing | Verify exists |
| Matrix Homeserver | Direct message sending | testing | Same as channel messages |

### Technical Prerequisites
- [ ] Matrix DM room creation integration
- [ ] User search/lookup API
- [ ] DM sidebar component
- [ ] DM conversation view component
- [ ] Chat input adaptation for DM context
- [ ] Message display adaptation for DM context

---

## Out of Scope

Explicitly NOT included in this story (to prevent scope creep):
- Group DMs (more than 2 people)
- DM encryption settings/indicators
- Block/unblock users
- Report DM conversations
- DM message search
- DM reactions (can leverage existing)
- DM file/image attachments (future)
- DM read receipts
- DM typing indicators
- Voice/video calls in DM

---

## Technical Notes

### Suggested Approach
1. **Verify Matrix DM support** - Confirm SDK can create DM rooms
2. **Build DM sidebar section** - With list and "+" button
3. **Create NewDMModal** - User search and selection
4. **Build DM conversation view** - Reuse message components
5. **Integrate with user profiles** - Add "Message" button
6. **Wire up real-time updates** - Use existing WebSocket

### Components to Reuse
```typescript
// Existing components to adapt:
import { ChatInput } from '@/components/chat/chat-input';
import { MessageList } from '@/components/chat/message-list';
import { UserAvatar } from '@/components/ui/user-avatar';

// Modify for DM context (no channel, single recipient)
```

### Patterns to Follow
- Follow Discord's DM sidebar pattern
- Use existing modal patterns (CreateServerModal reference)
- Match channel message styling for DM messages
- Use consistent avatar/username display

### Anti-Patterns to Avoid
- Don't create separate message infrastructure (reuse)
- Don't show DMs in channel lists (keep separate)
- Don't allow DM to self
- Don't mix server and DM contexts

### Matrix DM Integration Notes
```typescript
// Matrix DM room creation
const dmRoomId = await matrixClient.createRoom({
  is_direct: true,
  invite: [targetUserId],
  preset: 'private_chat'
});

// Matrix already has DM infrastructure, just need UI triggers
```

---

## Test Credentials

**Location:** `~/.env.test-credentials`
**Note:** Never commit actual passwords to git

**Test Data Requirements:**
- At least 2 test user accounts
- Existing DM conversation for list testing
- User with no DMs for empty state testing

---

## Sub-Tasks (Coordinator Fills This)

| Task ID | Description | Model | Status |
|---------|-------------|-------|--------|
| | | | |

---

## Definition of Done

- [ ] AC-1: DM section visible in sidebar (all viewports)
- [ ] AC-2: New DM modal with user search
- [ ] AC-3: User selection creates/opens DM
- [ ] AC-4: DM conversation interface complete
- [ ] AC-5: Send DM message works
- [ ] AC-6: DM list shows active conversations
- [ ] AC-7: User profile "Message" button works
- [ ] AC-8: Empty DM state handled
- [ ] AC-9: Mobile DM experience works
- [ ] AC-10: Unread indicators shown
- [ ] AC-11: Click DM item opens conversation
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
- [x] Happy path covered (AC-3, AC-5)
- [x] Alternate valid paths covered (AC-7)
- [x] All error scenarios covered (contingencies)
- [x] All edge cases covered (AC-8)
- [x] Empty states covered (AC-8)
- [x] Boundary conditions covered
- [x] Permission/auth cases covered

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
| v1 | STORY-ARCHITECT-MELO-P2 | 2026-02-28 | draft | Initial creation from S11/S12 audit findings |

---
*Story created from Phase 1 Audits S11 (Initiate DM) and S12 (DM Conversation) - Combined P1-HIGH priority*
