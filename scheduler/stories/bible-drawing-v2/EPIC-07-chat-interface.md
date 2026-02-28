# Epic 07: Chat Interface (Sophie Integration)

**Epic ID:** BDV2-EPIC-07  
**Priority:** P1 (Should Have)  
**Status:** Draft  
**Dependencies:** EPIC-04 (Transcript Editor), EPIC-05 (AI-Assisted Editing)  

## Description

In-app chat interface allowing Aaron to converse with Sophie about his video project. Sophie can make edits, answer questions, and provide revision suggestions in a natural conversational workflow.

## Business Value

- Enables conversational editing workflow
- Leverages existing Sophie integration
- Provides context-aware assistance
- Supports iterative revision process

---

## User Stories

### Story 7.1: Chat Panel Interface

**Story ID:** BDV2-US-7.1  
**Points:** 5  
**Priority:** P1  

> As Aaron, I want a chat panel in the editor so that I can communicate with Sophie.

#### Acceptance Criteria

```gherkin
Feature: Chat Panel Interface

  Scenario: Open chat panel
    Given I am in the project editor
    When I click the chat icon or press Ctrl+/
    Then a chat panel should slide in from the right
    And I should see my chat history with Sophie
    And I should see a message input field

  Scenario: Chat panel layout
    Then the chat panel should show:
      - Project name at top
      - Scrollable message history
      - Message input with send button
      - Typing indicator when Sophie is responding

  Scenario: Resize chat panel
    Given the chat panel is open
    Then I should be able to drag the border to resize
    And the editor should resize responsively
    And my preferred width should be remembered

  Scenario: Collapse chat panel
    When I click the collapse button
    Then the chat should minimize to a floating button
    And I can click to expand it again
    And unread messages should show a badge
```

---

### Story 7.2: Send Messages

**Story ID:** BDV2-US-7.2  
**Points:** 5  
**Priority:** P1  

> As Aaron, I want to send messages to Sophie so that I can request edits and get help.

#### Acceptance Criteria

```gherkin
Feature: Send Messages

  Scenario: Send text message
    Given the chat panel is open
    When I type a message
    And I press Enter or click Send
    Then my message should appear in the chat
    And Sophie should receive it
    And the input field should clear

  Scenario: Multi-line messages
    When I press Shift+Enter
    Then a new line should be added
    And the message should not send
    And the input field should expand

  Scenario: Message context
    When I send a message
    Then Sophie should have context about:
      - Current project and segments
      - Current transcript state
      - My recent edits
      - Current playback position

  Scenario: Show sending status
    When I send a message
    Then I should see:
      - Sending indicator while in transit
      - Sent checkmark when delivered
      - Error with retry option if failed
```

---

### Story 7.3: Receive AI Responses

**Story ID:** BDV2-US-7.3  
**Points:** 5  
**Priority:** P1  

> As Aaron, I want to see Sophie's responses so that I can act on her suggestions.

#### Acceptance Criteria

```gherkin
Feature: Receive AI Responses

  Scenario: Display Sophie's response
    Given I have sent a message
    When Sophie responds
    Then her message should appear in the chat
    And it should be clearly distinguished from my messages
    And it should include her avatar/name

  Scenario: Streaming responses
    When Sophie is generating a long response
    Then the response should stream in word by word
    And I should see a typing indicator
    And I can scroll up while she's still typing

  Scenario: Response with edit suggestions
    Given Sophie suggests edits
    Then her response should include:
      - Explanation of what she'll do
      - Clickable "Apply" button
      - Preview of changes (optional)
      - "Reject" option

  Scenario: Formatted responses
    When Sophie's response contains formatting
    Then I should see:
      - Bold text for emphasis
      - Bullet lists
      - Code blocks for timestamps
      - Quoted text for transcript excerpts
```

#### Playwright Test Specs

```typescript
test.describe('Receive AI Responses', () => {
  test('should display streamed response', async ({ page }) => {
    await loginAs(page, 'aaron');
    await page.goto('/project/test-project/editor');
    
    await page.click('[data-testid="chat-toggle"]');
    await page.fill('[data-testid="chat-input"]', 'What is this video about?');
    await page.press('[data-testid="chat-input"]', 'Enter');
    
    // Wait for response to start streaming
    await expect(page.locator('[data-testid="assistant-message"]').last()).toBeVisible({
      timeout: 10000
    });
    
    // Verify content
    await expect(page.locator('[data-testid="assistant-message"]').last()).not.toBeEmpty();
  });
});
```

---

### Story 7.4: Apply Edit Suggestions

**Story ID:** BDV2-US-7.4  
**Points:** 8  
**Priority:** P1  

> As Aaron, I want to apply Sophie's suggested edits so that I can quickly implement her recommendations.

#### Acceptance Criteria

```gherkin
Feature: Apply Edit Suggestions

  Scenario: Apply suggested edit
    Given Sophie has suggested an edit
    When I click "Apply" on her suggestion
    Then the edit should be applied to the transcript
    And the transcript view should update immediately
    And a success message should appear in chat
    And this should be a single undo-able action

  Scenario: Preview before applying
    Given Sophie has suggested removing a section
    When I click "Preview"
    Then the transcript should highlight the affected section
    And I should see what will be removed
    And I can then "Apply" or "Cancel"

  Scenario: Reject suggestion
    When I click "Reject" or "No thanks"
    Then the edit should not be applied
    And Sophie should acknowledge my choice
    And I can ask for alternatives

  Scenario: Partial application
    Given Sophie suggests multiple changes
    Then each change should have its own Apply button
    And I can apply some but not all
    And applied changes should be marked as done

  Scenario: Undo applied edit
    Given I have applied Sophie's edit
    When I press Ctrl+Z or click "Undo"
    Then the edit should be reversed
    And Sophie's suggestion should return to unapplied state
```

---

### Story 7.5: Chat Context Awareness

**Story ID:** BDV2-US-7.5  
**Points:** 5  
**Priority:** P1  

> As Sophie, I want full project context so that I can give relevant assistance.

#### Acceptance Criteria

```gherkin
Feature: Chat Context Awareness

  Scenario: Sophie knows current transcript
    When I ask "How long is the part about Moses?"
    Then Sophie should analyze the transcript
    And give me accurate time information

  Scenario: Sophie knows my recent edits
    Given I just removed a section
    When I ask "What did I just remove?"
    Then Sophie should know what I removed
    And can help me restore it if needed

  Scenario: Sophie knows current selection
    Given I have text selected in the transcript
    When I say "Remove this"
    Then Sophie should know what "this" refers to
    And remove the selected text

  Scenario: Sophie knows playback position
    Given the video is playing at 5:30
    When I say "What did I say just before this?"
    Then Sophie should reference content around 5:30
    And give relevant context

  Scenario: Multi-turn conversation
    Given I asked "Remove the um's"
    And Sophie applied the edit
    When I say "Actually, restore the one at 3:45"
    Then Sophie should understand the context
    And restore just that specific one
```

---

### Story 7.6: Chat History

**Story ID:** BDV2-US-7.6  
**Points:** 3  
**Priority:** P1  

> As Aaron, I want chat history preserved so that I can reference past conversations.

#### Acceptance Criteria

```gherkin
Feature: Chat History

  Scenario: Persist chat history
    Given I have chatted with Sophie about this project
    When I close and reopen the project
    Then my chat history should be preserved
    And I can scroll back to see old messages

  Scenario: Link edits to chat messages
    Given Sophie applied an edit from chat
    When I view that chat message later
    Then I should see "Edit applied" indicator
    And I can click to see what changed

  Scenario: Clear chat history
    When I click "Clear Chat History"
    And I confirm
    Then all messages should be removed
    And I can start fresh

  Scenario: Search chat history
    When I search for "burning bush" in chat
    Then I should see all messages containing that phrase
    And I can click to jump to any message
```

---

### Story 7.7: Quick Commands

**Story ID:** BDV2-US-7.7  
**Points:** 3  
**Priority:** P2  

> As Aaron, I want quick commands so that I can perform common actions fast.

#### Acceptance Criteria

```gherkin
Feature: Quick Commands

  Scenario: Slash commands
    When I type "/" in the chat input
    Then I should see a list of available commands:
      | Command        | Description              |
      | /analyze       | Analyze transcript       |
      | /suggest       | Suggest 10-min episode   |
      | /summary       | Generate summary         |
      | /fillers       | Remove filler words      |
      | /title         | Suggest titles           |

  Scenario: Command autocomplete
    When I type "/su"
    Then I should see matching commands
    And I can press Tab to autocomplete
    And I can press Enter to execute

  Scenario: Command with arguments
    When I type "/suggest 8 minutes"
    Then Sophie should suggest an 8-minute episode
    And understand the duration argument
```

---

## Definition of Done

- [ ] All stories have passing unit tests
- [ ] All stories have passing integration tests
- [ ] All stories have passing E2E tests
- [ ] Chat responses appear within 5 seconds
- [ ] Edit applications are instant
- [ ] Context is accurate and relevant
- [ ] Works on mobile viewport (collapsed by default)

---

## Technical Dependencies

- Claude API for chat functionality
- WebSocket for real-time updates (optional)
- Chat history storage in SQLite
- Integration with transcript editor state

## Estimated Total Points: 34
