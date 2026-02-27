# Phase 1: Core Functionality Audit - User Stories

**Epic:** Melo V2 Comprehensive Audit
**Phase:** 1 - Core Functionality
**Created:** 2026-02-27
**Story Architect:** Opus
**App URL:** http://dev2.aaroncollins.info:3000/

---

## Overview

This phase audits the core functionality of Melo V2 to verify that essential features work correctly. Each story is an **audit story** — we document expected vs actual behavior, capture evidence, and log any defects found.

### Viewport Sizes (MANDATORY for all evidence)
| Device | Viewport |
|--------|----------|
| Desktop | 1920x1080 |
| Tablet | 768x1024 |
| Mobile | 375x667 |

### Evidence Storage
```
scheduler/validation/screenshots/melo-audit/
├── MELO-P1-S01/  # Authentication - Registration
├── MELO-P1-S02/  # Authentication - Login
├── MELO-P1-S03/  # Authentication - Logout
├── MELO-P1-S04/  # Server - Create
├── MELO-P1-S05/  # Server - Join
├── MELO-P1-S06/  # Server - Leave
├── MELO-P1-S07/  # Channel - Create
├── MELO-P1-S08/  # Channel - Delete
├── MELO-P1-S09/  # Messaging - Send & Receive
├── MELO-P1-S10/  # Messaging - Edit & Delete
├── MELO-P1-S11/  # Direct Messages - Initiate
└── MELO-P1-S12/  # Direct Messages - Conversation
```

### Defect Log Location
`scheduler/progress/melo-audit/phase1-defects.md`

---

## Story MELO-P1-S01: Authentication - User Registration

### Story
**As a** new user  
**I want** to register for a Melo account  
**So that** I can access the messaging platform

### Acceptance Criteria

#### AC-1: Registration Form Display
**Given** I am on the Melo homepage  
**When** I navigate to the registration page  
**Then** I see a registration form with fields for username, email, and password  
**And** the form is properly styled and readable  
**And** the layout is responsive at all viewport sizes

**Test Method:** Playwright navigation + visual assertion
**Evidence Required:** Screenshot of registration form at all 3 sizes

#### AC-2: Successful Registration
**Given** I am on the registration page  
**When** I enter valid registration details (unique username, valid email, strong password)  
**And** I submit the form  
**Then** I am either redirected to the main app OR shown a verification step  
**And** no error messages are displayed

**Test Method:** Playwright form submission + URL/state assertion
**Evidence Required:** Before (form filled) and after (success state) screenshots at all 3 sizes

#### AC-3: Registration Validation Errors
**Given** I am on the registration page  
**When** I submit with invalid data (empty fields, weak password, invalid email)  
**Then** I see appropriate validation error messages  
**And** the errors clearly indicate what needs to be fixed

**Test Method:** Playwright negative testing
**Evidence Required:** Screenshots showing validation errors at Desktop size

### Testing Method
```typescript
// Playwright test outline
test('MELO-P1-S01: Registration audit', async ({ page }) => {
  // Navigate to registration
  await page.goto('http://dev2.aaroncollins.info:3000/');
  
  // Find and click registration link
  // Screenshot: registration-form-{device}.png
  
  // Fill form with test data
  // Screenshot: registration-filled-{device}.png
  
  // Submit and verify result
  // Screenshot: registration-result-{device}.png
});
```

### Setup Steps
1. Ensure Melo app is running on dev2 (`pm2 status` check)
2. Generate unique test user credentials (timestamp-based)
3. Clear browser state/cookies

### Teardown Steps
1. Document test user credentials in progress file
2. Note if user was successfully created (for use in subsequent tests)

### Expected Behavior
- Clean registration form with clear labels
- Form validates input before submission
- Successful registration leads to app or verification
- Matrix account is created on backend

### Contingencies
| Risk | Mitigation |
|------|------------|
| Matrix server unreachable | Document error, check Matrix synapse status on dev2 |
| Registration endpoint 500 | Capture network logs, document in defects |
| Form doesn't render | Check console errors, capture full page screenshot |
| Existing user collision | Use timestamp-based unique usernames |

### Dependencies
- **Blocks:** All other stories (need valid account)
- **Depends On:** None (first story)

### Complexity
- **Estimated Time:** 30-45 minutes
- **Worker Model:** Sonnet (implementation) with Playwright

---

## Story MELO-P1-S02: Authentication - User Login

### Story
**As a** registered user  
**I want** to log into my Melo account  
**So that** I can access my servers and messages

### Acceptance Criteria

#### AC-1: Login Form Display
**Given** I am on the Melo homepage  
**When** I navigate to the login page  
**Then** I see a login form with fields for email/username and password  
**And** the form is properly styled and accessible  
**And** the layout is responsive at all viewport sizes

**Test Method:** Playwright navigation + visual assertion
**Evidence Required:** Screenshot of login form at all 3 sizes

#### AC-2: Successful Login
**Given** I have a registered account  
**When** I enter valid credentials  
**And** I submit the login form  
**Then** I am redirected to the main application  
**And** I see my username or avatar indicating logged-in state

**Test Method:** Playwright form submission + auth state verification
**Evidence Required:** Before (login form) and after (logged-in dashboard) screenshots at all 3 sizes

#### AC-3: Login Error Handling
**Given** I am on the login page  
**When** I enter invalid credentials  
**Then** I see an appropriate error message  
**And** the form remains usable for retry

**Test Method:** Playwright negative testing
**Evidence Required:** Screenshot showing error message at Desktop size

### Testing Method
```typescript
test('MELO-P1-S02: Login audit', async ({ page }) => {
  await page.goto('http://dev2.aaroncollins.info:3000/');
  
  // Navigate to login
  // Screenshot: login-form-{device}.png
  
  // Use credentials from S01 or known test account
  // Screenshot: login-filled-{device}.png
  
  // Submit and verify dashboard
  // Screenshot: logged-in-{device}.png
});
```

### Setup Steps
1. Have valid credentials from S01 OR use pre-existing test account
2. Clear browser state/cookies to ensure clean login

### Teardown Steps
1. Remain logged in for use in subsequent stories
2. Document session state

### Expected Behavior
- Clean login form
- Successful auth redirects to app
- Session persists (localStorage/cookies set)

### Contingencies
| Risk | Mitigation |
|------|------------|
| No test account exists | Run S01 first, or create account manually |
| Matrix auth fails | Check Matrix synapse logs, document error |
| Redirect loop | Capture URL at each step, check auth cookies |

### Dependencies
- **Blocks:** S03-S12 (need logged-in session)
- **Depends On:** S01 (need valid account)

### Complexity
- **Estimated Time:** 20-30 minutes
- **Worker Model:** Sonnet with Playwright

---

## Story MELO-P1-S03: Authentication - User Logout

### Story
**As a** logged-in user  
**I want** to log out of my Melo account  
**So that** my session is securely ended

### Acceptance Criteria

#### AC-1: Logout Option Visible
**Given** I am logged into Melo  
**When** I look for account/settings options  
**Then** I can find a logout button or menu item  
**And** it is accessible at all viewport sizes

**Test Method:** Playwright element location + visibility
**Evidence Required:** Screenshot showing logout option at all 3 sizes

#### AC-2: Successful Logout
**Given** I am logged in  
**When** I click the logout option  
**Then** I am logged out and redirected to login/home page  
**And** my session is terminated (refreshing doesn't restore session)

**Test Method:** Playwright click + auth state verification
**Evidence Required:** After logout screenshot showing logged-out state at all 3 sizes

### Testing Method
```typescript
test('MELO-P1-S03: Logout audit', async ({ page }) => {
  // Start from logged-in state
  // Screenshot: logged-in-state-{device}.png
  
  // Find and click logout
  // Screenshot: logout-click-{device}.png
  
  // Verify logged out
  // Screenshot: logged-out-{device}.png
  
  // Attempt refresh - should stay logged out
  await page.reload();
  // Screenshot: after-refresh-{device}.png
});
```

### Setup Steps
1. Must be logged in (from S02)

### Teardown Steps
1. Document logout success/failure
2. Re-login for subsequent tests if needed

### Expected Behavior
- Logout option easily findable
- Clean session termination
- No lingering auth state

### Contingencies
| Risk | Mitigation |
|------|------------|
| Logout button not found | Check mobile menu, settings modal, document location |
| Session persists after logout | Check cookies/localStorage, document as critical bug |

### Dependencies
- **Blocks:** None directly (but validates auth system)
- **Depends On:** S02 (need logged-in session)

### Complexity
- **Estimated Time:** 15-20 minutes
- **Worker Model:** Sonnet with Playwright

---

## Story MELO-P1-S04: Server - Create New Server

### Story
**As a** logged-in user  
**I want** to create a new server  
**So that** I can have a space for group conversations

### Acceptance Criteria

#### AC-1: Create Server Option Visible
**Given** I am logged into Melo  
**When** I look at the server sidebar  
**Then** I see an option to create/add a new server (+ button or similar)  
**And** it is visible and clickable at all viewport sizes

**Test Method:** Playwright element location
**Evidence Required:** Screenshot highlighting create server option at all 3 sizes

#### AC-2: Create Server Modal/Form
**Given** I click the create server option  
**When** the creation interface appears  
**Then** I see a form to enter server name (minimum)  
**And** optionally server icon/image upload  
**And** the form is properly styled

**Test Method:** Playwright modal interaction
**Evidence Required:** Screenshot of create server form at all 3 sizes

#### AC-3: Server Created Successfully
**Given** I fill in the server creation form  
**When** I submit with a valid server name  
**Then** a new server is created  
**And** I am taken to the new server  
**And** the server appears in my server list

**Test Method:** Playwright form submission + navigation verification
**Evidence Required:** Before (form filled) and after (new server view) screenshots at all 3 sizes

### Testing Method
```typescript
test('MELO-P1-S04: Create server audit', async ({ page }) => {
  // Logged in state
  // Screenshot: server-sidebar-{device}.png
  
  // Click create server
  // Screenshot: create-server-form-{device}.png
  
  // Fill with unique name: `Test-Server-${timestamp}`
  // Screenshot: form-filled-{device}.png
  
  // Submit and verify new server
  // Screenshot: new-server-created-{device}.png
});
```

### Setup Steps
1. Logged in from S02
2. Generate unique server name with timestamp

### Teardown Steps
1. Document created server name/ID
2. Server will be used in subsequent tests (S07, S08, S09)

### Expected Behavior
- Clear "create server" affordance
- Simple creation flow
- Server immediately appears in sidebar
- Matrix room is created on backend

### Contingencies
| Risk | Mitigation |
|------|------------|
| Create button not found | Check all UI areas, mobile menu, document location |
| Modal doesn't open | Check for JS errors, capture console output |
| Server creation fails | Capture network response, check Matrix logs |
| Server name collision | Use timestamp-based unique names |

### Dependencies
- **Blocks:** S06 (leave server), S07-S08 (channels), S09-S10 (messaging)
- **Depends On:** S02 (need logged-in session)

### Complexity
- **Estimated Time:** 30 minutes
- **Worker Model:** Sonnet with Playwright

---

## Story MELO-P1-S05: Server - Join Existing Server

### Story
**As a** logged-in user  
**I want** to join an existing server via invite  
**So that** I can participate in established communities

### Acceptance Criteria

#### AC-1: Join Server Option Visible
**Given** I am logged into Melo  
**When** I look for ways to join a server  
**Then** I see a join server option (may be same + button as create)

**Test Method:** Playwright element location
**Evidence Required:** Screenshot showing join option at Desktop size

#### AC-2: Join via Invite Code/Link
**Given** I have a server invite code or link  
**When** I enter/use the invite  
**Then** I am added to the server  
**And** the server appears in my server list

**Test Method:** Playwright form/navigation + verification
**Evidence Required:** Before (invite entry) and after (joined server) screenshots at all 3 sizes

### Testing Method
```typescript
test('MELO-P1-S05: Join server audit', async ({ page }) => {
  // This requires an invite code from server created in S04
  // Or use a pre-existing public test server
  
  // Screenshot: join-server-form-{device}.png
  // Screenshot: joined-server-{device}.png
});
```

### Setup Steps
1. Need invite code from server created in S04, OR
2. Have a pre-existing test server with known invite

### Teardown Steps
1. Document join success/failure
2. Note any invite system issues

### Expected Behavior
- Join flow accepts invite codes/links
- User added to server member list
- Server appears in sidebar

### Contingencies
| Risk | Mitigation |
|------|------------|
| No invite system exists | Document as missing feature |
| Invite creation not found | Check server settings, document |
| Join fails | Capture error, check Matrix room permissions |

### Dependencies
- **Blocks:** Tests join functionality for S06
- **Depends On:** S04 (need a server to join)

### Complexity
- **Estimated Time:** 25 minutes
- **Worker Model:** Sonnet with Playwright

### Note
This story may reveal that invite functionality is incomplete. If so, document what exists and what's missing.

---

## Story MELO-P1-S06: Server - Leave Server

### Story
**As a** server member  
**I want** to leave a server I no longer want to be in  
**So that** it no longer appears in my server list

### Acceptance Criteria

#### AC-1: Leave Server Option
**Given** I am a member of a server  
**When** I access server settings or context menu  
**Then** I can find a "Leave Server" option

**Test Method:** Playwright element location
**Evidence Required:** Screenshot showing leave option at Desktop size

#### AC-2: Successful Leave
**Given** I click "Leave Server"  
**When** I confirm the action (if confirmation exists)  
**Then** I am removed from the server  
**And** the server no longer appears in my sidebar

**Test Method:** Playwright click + sidebar verification
**Evidence Required:** Before (in server) and after (server removed from list) screenshots at all 3 sizes

### Testing Method
```typescript
test('MELO-P1-S06: Leave server audit', async ({ page }) => {
  // Navigate to server from S05 (or create a test server to leave)
  // Screenshot: before-leave-{device}.png
  
  // Find and click leave server
  // Screenshot: leave-confirmation-{device}.png
  
  // Verify server removed from list
  // Screenshot: after-leave-{device}.png
});
```

### Setup Steps
1. Must be member of a server (S04 or S05)
2. Use a "throwaway" server to test leave (don't leave main test server)

### Teardown Steps
1. Document leave success/failure
2. Note any issues with server removal from Matrix

### Expected Behavior
- Leave option accessible
- Confirmation dialog (optional but expected)
- Clean removal from server list
- Matrix room membership revoked

### Contingencies
| Risk | Mitigation |
|------|------------|
| Leave option not found | Check server settings, dropdown menus, document |
| Server still shows after leave | Check sidebar refresh, document as bug |
| Cannot leave own server | Owner may not be able to leave - verify if this is expected |

### Dependencies
- **Blocks:** None
- **Depends On:** S04 or S05 (need server membership)

### Complexity
- **Estimated Time:** 20 minutes
- **Worker Model:** Sonnet with Playwright

---

## Story MELO-P1-S07: Channel - Create New Channel

### Story
**As a** server administrator  
**I want** to create a new text channel  
**So that** I can organize conversations by topic

### Acceptance Criteria

#### AC-1: Create Channel Option
**Given** I am in a server I administer  
**When** I look at the channel list  
**Then** I see an option to create a new channel (+ button or similar)

**Test Method:** Playwright element location
**Evidence Required:** Screenshot showing create channel option at all 3 sizes

#### AC-2: Channel Creation Form
**Given** I click create channel  
**When** the creation interface appears  
**Then** I see options for channel name and type (text/voice)

**Test Method:** Playwright modal interaction
**Evidence Required:** Screenshot of channel creation form at Desktop size

#### AC-3: Channel Created Successfully
**Given** I fill in channel details  
**When** I submit the form  
**Then** a new channel is created  
**And** it appears in the channel list  
**And** I can navigate to it

**Test Method:** Playwright form submission + navigation
**Evidence Required:** Before and after screenshots at all 3 sizes

### Testing Method
```typescript
test('MELO-P1-S07: Create channel audit', async ({ page }) => {
  // Navigate to server from S04
  // Screenshot: channel-list-{device}.png
  
  // Click create channel
  // Screenshot: create-channel-form-{device}.png
  
  // Fill: `test-channel-${timestamp}`
  // Screenshot: form-filled-{device}.png
  
  // Submit
  // Screenshot: new-channel-{device}.png
});
```

### Setup Steps
1. Logged in and in server from S04
2. Verify user has admin/create permissions

### Teardown Steps
1. Document created channel name
2. Channel will be used for messaging tests (S09, S10)

### Expected Behavior
- Clear create channel affordance
- Form for name and optionally type
- Channel immediately appears in list
- Matrix room created for channel

### Contingencies
| Risk | Mitigation |
|------|------------|
| No create option visible | Check permissions, maybe only server owner can create |
| Channel creation fails | Capture API error, check Matrix logs |
| Channel name conflicts | Use unique timestamp-based names |

### Dependencies
- **Blocks:** S08 (delete channel), S09-S10 (messaging)
- **Depends On:** S04 (need server)

### Complexity
- **Estimated Time:** 25 minutes
- **Worker Model:** Sonnet with Playwright

---

## Story MELO-P1-S08: Channel - Delete Channel

### Story
**As a** server administrator  
**I want** to delete a text channel  
**So that** I can remove unused or obsolete channels

### Acceptance Criteria

#### AC-1: Delete Channel Option
**Given** I am in a server I administer  
**When** I access channel settings or context menu  
**Then** I can find a delete channel option

**Test Method:** Playwright element location
**Evidence Required:** Screenshot showing delete option at Desktop size

#### AC-2: Successful Deletion
**Given** I select delete channel  
**When** I confirm the deletion  
**Then** the channel is removed  
**And** it no longer appears in the channel list

**Test Method:** Playwright click + verification
**Evidence Required:** Before and after screenshots at all 3 sizes

### Testing Method
```typescript
test('MELO-P1-S08: Delete channel audit', async ({ page }) => {
  // Create a channel specifically to delete (or use one from S07)
  // Screenshot: before-delete-{device}.png
  
  // Find delete option
  // Screenshot: delete-option-{device}.png
  
  // Confirm and verify deletion
  // Screenshot: after-delete-{device}.png
});
```

### Setup Steps
1. Need a channel to delete (create one specifically for this test)
2. Verify admin permissions

### Teardown Steps
1. Document deletion success/failure
2. Verify Matrix room was also deleted/archived

### Expected Behavior
- Delete option in settings or right-click menu
- Confirmation dialog before deletion
- Clean removal from channel list

### Contingencies
| Risk | Mitigation |
|------|------------|
| Delete option not found | Check settings modal, admin panel |
| Deletion fails | Capture error, check Matrix API |
| Channel reappears | Check Matrix sync, document as bug |

### Dependencies
- **Blocks:** None
- **Depends On:** S07 (need channel to delete)

### Complexity
- **Estimated Time:** 20 minutes
- **Worker Model:** Sonnet with Playwright

---

## Story MELO-P1-S09: Messaging - Send and Receive Messages

### Story
**As a** channel member  
**I want** to send and see messages in a channel  
**So that** I can communicate with other members

### Acceptance Criteria

#### AC-1: Message Input Visible
**Given** I am in a text channel  
**When** I look at the bottom of the channel  
**Then** I see a message input field  
**And** it is functional at all viewport sizes

**Test Method:** Playwright element location + interaction
**Evidence Required:** Screenshot showing message input at all 3 sizes

#### AC-2: Send Message
**Given** I am in a channel with the input focused  
**When** I type a message and press Enter (or click send)  
**Then** my message appears in the channel  
**And** it shows my username/avatar  
**And** it has a timestamp

**Test Method:** Playwright type + assertion
**Evidence Required:** Before (typing) and after (sent) screenshots at all 3 sizes

#### AC-3: Message Display
**Given** there are messages in the channel  
**When** I view the channel  
**Then** messages are displayed chronologically  
**And** each message shows sender, content, and time  
**And** messages are readable at all viewport sizes

**Test Method:** Playwright visual inspection
**Evidence Required:** Screenshot of message list at all 3 sizes

### Testing Method
```typescript
test('MELO-P1-S09: Messaging audit', async ({ page }) => {
  // Navigate to channel from S07
  // Screenshot: empty-channel-{device}.png
  
  // Type message: `Test message at ${timestamp}`
  // Screenshot: typing-message-{device}.png
  
  // Send message
  // Screenshot: message-sent-{device}.png
  
  // Verify message appears with correct format
  // Screenshot: message-displayed-{device}.png
});
```

### Setup Steps
1. Logged in, in a server with a text channel
2. Clear channel history or use fresh channel

### Teardown Steps
1. Document messaging success/failure
2. Note any issues with Matrix message sync

### Expected Behavior
- Clear message input field
- Send via Enter or button
- Immediate message appearance (optimistic update)
- Proper formatting (username, avatar, timestamp)
- Matrix event sent to room

### Contingencies
| Risk | Mitigation |
|------|------------|
| Input not found | Check DOM, maybe hidden on mobile |
| Message doesn't appear | Check Matrix sync, WebSocket connection |
| Message appears but malformed | Document display bugs |
| Rate limiting | Wait between sends, document limits |

### Dependencies
- **Blocks:** S10 (edit/delete needs messages)
- **Depends On:** S07 (need channel)

### Complexity
- **Estimated Time:** 30 minutes
- **Worker Model:** Sonnet with Playwright

---

## Story MELO-P1-S10: Messaging - Edit and Delete Messages

### Story
**As a** message author  
**I want** to edit or delete my sent messages  
**So that** I can correct mistakes or remove unwanted content

### Acceptance Criteria

#### AC-1: Edit Message Option
**Given** I have sent a message  
**When** I hover over or select my message  
**Then** I see an edit option (icon or menu)

**Test Method:** Playwright hover/click + element detection
**Evidence Required:** Screenshot showing edit option at Desktop size

#### AC-2: Edit Message Flow
**Given** I click edit on my message  
**When** the edit interface appears  
**Then** I can modify the message text  
**And** save or cancel the edit

**Test Method:** Playwright interaction flow
**Evidence Required:** Screenshots of edit flow at Desktop size

#### AC-3: Delete Message Option
**Given** I have sent a message  
**When** I access message options  
**Then** I see a delete option

**Test Method:** Playwright element detection
**Evidence Required:** Screenshot showing delete option at Desktop size

#### AC-4: Delete Message Flow
**Given** I click delete on my message  
**When** I confirm deletion  
**Then** the message is removed from the channel

**Test Method:** Playwright click + verification
**Evidence Required:** Before and after deletion screenshots at Desktop size

### Testing Method
```typescript
test('MELO-P1-S10: Edit/Delete audit', async ({ page }) => {
  // Use message from S09 or send new one
  // Screenshot: message-to-edit-{device}.png
  
  // Hover/click for options
  // Screenshot: message-options-{device}.png
  
  // Edit flow
  // Screenshot: edit-mode-{device}.png
  // Screenshot: after-edit-{device}.png
  
  // Send new message then delete
  // Screenshot: before-delete-{device}.png
  // Screenshot: after-delete-{device}.png
});
```

### Setup Steps
1. Have at least one sent message from S09
2. May need to send additional messages for deletion test

### Teardown Steps
1. Document edit/delete functionality status
2. Note any Matrix-specific behaviors (edit history, tombstone events)

### Expected Behavior
- Edit option on own messages
- Inline editing with save/cancel
- Delete option with confirmation
- Clean removal from view
- Matrix events for edits/redactions

### Contingencies
| Risk | Mitigation |
|------|------------|
| Edit not supported | Document as missing feature (Discord has it, common expectation) |
| Delete not supported | Document as missing feature |
| Edit shows but doesn't save | Check Matrix API, capture errors |
| Deleted message still visible | Check Matrix sync, document bug |

### Dependencies
- **Blocks:** None
- **Depends On:** S09 (need messages to edit/delete)

### Complexity
- **Estimated Time:** 35 minutes
- **Worker Model:** Sonnet with Playwright

---

## Story MELO-P1-S11: Direct Messages - Initiate DM

### Story
**As a** logged-in user  
**I want** to start a direct message conversation with another user  
**So that** I can have private one-on-one communication

### Acceptance Criteria

#### AC-1: DM Option Available
**Given** I am logged into Melo  
**When** I look at the UI (sidebar, user profile, etc.)  
**Then** I can find a way to start a DM with another user

**Test Method:** Playwright element location
**Evidence Required:** Screenshot showing DM initiation option at all 3 sizes

#### AC-2: Start DM Conversation
**Given** I have another user to DM (member list, search, etc.)  
**When** I select to DM them  
**Then** a DM conversation is created/opened  
**And** I see a private chat interface

**Test Method:** Playwright interaction + navigation
**Evidence Required:** Screenshots of DM creation flow at all 3 sizes

### Testing Method
```typescript
test('MELO-P1-S11: DM initiation audit', async ({ page }) => {
  // Find DM creation option
  // Screenshot: dm-option-{device}.png
  
  // Select user (may need second test account)
  // Screenshot: user-selection-{device}.png
  
  // Verify DM conversation opens
  // Screenshot: dm-opened-{device}.png
});
```

### Setup Steps
1. Logged in from S02
2. Need second user to DM with (either second test account or existing user)

### Teardown Steps
1. Document DM creation success/failure
2. DM will be used in S12

### Expected Behavior
- Clear way to initiate DMs
- Can search/select users
- Private conversation created
- Matrix DM room created

### Contingencies
| Risk | Mitigation |
|------|------------|
| No DM feature visible | Check sidebar carefully, document if missing |
| Need second account | Create second test account or use existing |
| DM creation fails | Capture error, check Matrix API |

### Dependencies
- **Blocks:** S12 (DM conversation)
- **Depends On:** S02 (login)

### Complexity
- **Estimated Time:** 30 minutes
- **Worker Model:** Sonnet with Playwright

### Note
May need to create a second test account to properly test DMs. Document this requirement.

---

## Story MELO-P1-S12: Direct Messages - Conversation

### Story
**As a** DM participant  
**I want** to send and receive messages in a DM  
**So that** I can have a private conversation

### Acceptance Criteria

#### AC-1: DM Interface
**Given** I have an open DM conversation  
**When** I view the DM  
**Then** I see a message input and message history  
**And** the interface works like a channel

**Test Method:** Playwright visual inspection
**Evidence Required:** Screenshot of DM interface at all 3 sizes

#### AC-2: Send DM Message
**Given** I am in a DM conversation  
**When** I send a message  
**Then** it appears in the conversation  
**And** (ideally) the other user receives it

**Test Method:** Playwright message send + verification
**Evidence Required:** Before/after message send at all 3 sizes

#### AC-3: DM List/Access
**Given** I have DM conversations  
**When** I look at the sidebar or DM list  
**Then** I can see my existing DMs  
**And** I can click to access them

**Test Method:** Playwright navigation
**Evidence Required:** Screenshot of DM list at all 3 sizes

### Testing Method
```typescript
test('MELO-P1-S12: DM conversation audit', async ({ page }) => {
  // Open DM from S11
  // Screenshot: dm-interface-{device}.png
  
  // Send message
  // Screenshot: dm-message-sent-{device}.png
  
  // Check DM list
  // Screenshot: dm-list-{device}.png
});
```

### Setup Steps
1. Have DM conversation from S11

### Teardown Steps
1. Document DM functionality status
2. Note any differences from channel messaging

### Expected Behavior
- DM functions like channel messaging
- DM list accessible in sidebar
- Can switch between DMs easily
- Matrix DM events work correctly

### Contingencies
| Risk | Mitigation |
|------|------------|
| DM messaging differs from channel | Document differences |
| DM list not visible | Check sidebar UI, document |
| Messages don't sync | Check Matrix, document |

### Dependencies
- **Blocks:** None (last story)
- **Depends On:** S11 (need DM conversation)

### Complexity
- **Estimated Time:** 25 minutes
- **Worker Model:** Sonnet with Playwright

---

## Execution Order Summary

```
S01: Registration ──┐
                    ├──► S02: Login ──► S03: Logout
                    │         │
                    │         ▼
                    │    S04: Create Server ──► S06: Leave Server
                    │         │
                    │         ├──► S05: Join Server
                    │         │
                    │         ▼
                    │    S07: Create Channel ──► S08: Delete Channel
                    │         │
                    │         ▼
                    │    S09: Send/Receive Messages ──► S10: Edit/Delete Messages
                    │
                    └──► S11: Initiate DM ──► S12: DM Conversation
```

### Critical Path
S01 → S02 → S04 → S07 → S09

### Parallel Opportunities
- S03 (logout) can run after S02, independent of S04+
- S11/S12 (DMs) only depend on S02, can run parallel to server tests

---

## Defect Tracking

All defects found during audit will be logged to:
`scheduler/progress/melo-audit/phase1-defects.md`

### Defect Template
```markdown
## MELO-P1-DEF-{number}: {title}

**Story:** MELO-P1-S{XX}
**Severity:** Critical | High | Medium | Low
**Found:** {date}

### Description
{what is broken}

### Expected Behavior
{what should happen}

### Actual Behavior
{what actually happens}

### Steps to Reproduce
1. {step}
2. {step}

### Evidence
- Screenshot: {path}
- Console errors: {if any}

### Notes
{additional context}
```

---

## Success Criteria for Phase 1

Phase 1 is complete when:
1. All 12 stories have been executed
2. Screenshots captured at all 3 viewport sizes for each AC
3. All defects logged in defect file
4. Summary report created with:
   - Features working as expected
   - Features partially working
   - Features broken/missing
   - Recommended fixes for Phase 2+

---

## Next Phase Preview

**Phase 2: Discord Feature Comparison** will compare Melo's UI/UX to Discord's, identifying:
- Missing UI elements
- UX flow differences  
- Visual polish opportunities
- Feature parity gaps
