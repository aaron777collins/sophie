# Epic 04: Transcript Editor

**Epic ID:** BDV2-EPIC-04  
**Priority:** P0 (MVP)  
**Status:** Draft  
**Dependencies:** EPIC-03 (Video Processing)  

## Description

Interactive transcript editor that allows editing video by editing text. Supports strikethrough deletion, shows removed sections, synchronizes with video playback, and provides undo/redo functionality.

## Business Value

- Enables intuitive "edit text to edit video" workflow
- Dramatically faster than traditional video editing
- Shows context of what was removed (no lost information)
- Preserves editing history for review and undo

---

## User Stories

### Story 4.1: Display Transcript

**Story ID:** BDV2-US-4.1  
**Points:** 5  
**Priority:** P0  

> As Aaron, I want to see the transcript of my video so that I can review what I said.

#### Acceptance Criteria

```gherkin
Feature: Display Transcript

  Scenario: Show full transcript
    Given a video has been transcribed
    When I open the transcript editor
    Then I should see the complete transcript text
    And words should be displayed in readable paragraphs
    And segment breaks should be visually indicated

  Scenario: Show word timestamps on hover
    When I hover over a word in the transcript
    Then I should see a tooltip with:
      | Field      | Example  |
      | Start time | 01:23.45 |
      | End time   | 01:23.78 |
      | Confidence | 98%      |

  Scenario: Highlight low confidence words
    Given some words have low transcription confidence (<80%)
    When I view the transcript
    Then low confidence words should be visually highlighted
    And I should be able to see/edit the uncertain text

  Scenario: Display filler words
    Given the transcript contains filler words
    When I view the transcript
    Then filler words should be subtly highlighted
    And I should see a "Filler words detected: 23" indicator
```

#### Playwright Test Specs

```typescript
test.describe('Display Transcript', () => {
  test('should display full transcript', async ({ page }) => {
    await loginAs(page, 'aaron');
    await page.goto('/project/test-project/editor');
    
    await expect(page.locator('[data-testid="transcript-text"]')).toBeVisible();
    await expect(page.locator('[data-testid="transcript-word"]')).toHaveCount.greaterThan(0);
  });

  test('should show timestamp on hover', async ({ page }) => {
    await loginAs(page, 'aaron');
    await page.goto('/project/test-project/editor');
    
    const firstWord = page.locator('[data-testid="transcript-word"]').first();
    await firstWord.hover();
    
    await expect(page.locator('[data-testid="word-tooltip"]')).toBeVisible();
    await expect(page.locator('[data-testid="word-timestamp"]')).toContainText(':');
  });
});
```

---

### Story 4.2: Select and Remove Text

**Story ID:** BDV2-US-4.2  
**Points:** 8  
**Priority:** P0  

> As Aaron, I want to select text and mark it for removal so that those parts are cut from the video.

#### Acceptance Criteria

```gherkin
Feature: Select and Remove Text

  Scenario: Select words by clicking and dragging
    Given I am viewing the transcript
    When I click on a word and drag to another word
    Then all words between them should be selected
    And the selection should be visually highlighted

  Scenario: Remove selected text
    Given I have selected some words
    When I press the Delete key or click "Remove"
    Then the selected text should appear struck through
    And the corresponding video segment should be marked for removal
    And the edit should be saved automatically

  Scenario: Strikethrough styling
    Given I have removed some text
    Then removed text should display with:
      - Strikethrough line
      - Grayed out color
      - Slightly reduced opacity
    And it should still be readable

  Scenario: Select entire sentence
    When I double-click on a word
    Then the entire sentence should be selected

  Scenario: Select paragraph
    When I triple-click on a word
    Then the entire paragraph/segment should be selected

  Scenario: Keyboard shortcuts
    Then I should be able to use:
      | Shortcut        | Action              |
      | Ctrl+A          | Select all          |
      | Delete/Backspace| Remove selected     |
      | Ctrl+Z          | Undo                |
      | Ctrl+Shift+Z    | Redo                |
      | Escape          | Clear selection     |
```

#### Playwright Test Specs

```typescript
test.describe('Select and Remove Text', () => {
  test('should remove selected text with strikethrough', async ({ page }) => {
    await loginAs(page, 'aaron');
    await page.goto('/project/test-project/editor');
    
    // Select first three words
    const words = page.locator('[data-testid="transcript-word"]');
    const firstWord = words.first();
    const thirdWord = words.nth(2);
    
    await firstWord.click();
    await page.keyboard.down('Shift');
    await thirdWord.click();
    await page.keyboard.up('Shift');
    
    // Remove selection
    await page.keyboard.press('Delete');
    
    // Verify strikethrough
    await expect(firstWord).toHaveClass(/removed/);
    await expect(thirdWord).toHaveClass(/removed/);
  });

  test('should support Ctrl+Z undo', async ({ page }) => {
    await loginAs(page, 'aaron');
    await page.goto('/project/test-project/editor');
    
    const firstWord = page.locator('[data-testid="transcript-word"]').first();
    await firstWord.click();
    await page.keyboard.press('Delete');
    
    await expect(firstWord).toHaveClass(/removed/);
    
    await page.keyboard.press('Control+z');
    
    await expect(firstWord).not.toHaveClass(/removed/);
  });
});
```

---

### Story 4.3: Show Removed Sections

**Story ID:** BDV2-US-4.3  
**Points:** 5  
**Priority:** P0  

> As Aaron, I want to see what I've removed so that I can restore it if needed.

#### Acceptance Criteria

```gherkin
Feature: Show Removed Sections

  Scenario: Removed text visible by default
    Given I have removed some text
    When I view the transcript
    Then removed text should be visible (struck through)
    And I should be able to distinguish removed from kept content

  Scenario: Toggle removed content visibility
    Given there is removed content
    When I click "Hide Removed"
    Then removed sections should collapse to a "[...]" indicator
    And clicking the indicator should expand to show what was removed

  Scenario: Restore removed content
    Given some text is marked as removed
    When I select the removed text
    And I click "Restore" or press a restore shortcut
    Then the text should be restored
    And the corresponding video segment should be included again

  Scenario: Expand collapsed section
    Given removed content is collapsed
    When I click on the "[...]" indicator
    Then I should see the removed content expanded
    And I should have the option to restore it

  Scenario: Show removal statistics
    Given I have made edits
    Then I should see:
      | Statistic          | Example     |
      | Original duration  | 45:00       |
      | Removed duration   | 12:30       |
      | Final duration     | 32:30       |
      | Reduction          | 28%         |
```

---

### Story 4.4: Video-Transcript Synchronization

**Story ID:** BDV2-US-4.4  
**Points:** 8  
**Priority:** P0  

> As Aaron, I want the transcript to sync with video playback so that I can see and hear content together.

#### Acceptance Criteria

```gherkin
Feature: Video-Transcript Synchronization

  Scenario: Highlight current word during playback
    Given the video is playing
    Then the currently spoken word should be highlighted
    And the highlight should move smoothly from word to word
    And the transcript should auto-scroll to keep current word visible

  Scenario: Click word to seek video
    Given the video is paused or playing
    When I click on a word in the transcript
    Then the video should seek to that word's timestamp
    And playback should continue from that point

  Scenario: Click timestamp to seek
    Given I see a timestamp in the transcript
    When I click on it
    Then the video should seek to that time

  Scenario: Preview mode
    When I enable "Preview Mode"
    Then the video should skip over removed sections
    And only kept content should play
    And transitions should be smooth (no jarring cuts)

  Scenario: Sync scroll position
    When the video plays past the visible transcript area
    Then the transcript should auto-scroll
    And the current word should stay in view (middle of viewport)
```

#### Playwright Test Specs

```typescript
test.describe('Video-Transcript Synchronization', () => {
  test('should highlight current word during playback', async ({ page }) => {
    await loginAs(page, 'aaron');
    await page.goto('/project/test-project/editor');
    
    // Start playback
    await page.click('[data-testid="play-button"]');
    
    // Wait a moment
    await page.waitForTimeout(1000);
    
    // Verify a word is highlighted
    await expect(page.locator('[data-testid="transcript-word"].current')).toBeVisible();
  });

  test('should seek video when clicking word', async ({ page }) => {
    await loginAs(page, 'aaron');
    await page.goto('/project/test-project/editor');
    
    // Get initial time
    const initialTime = await page.locator('[data-testid="video-time"]').textContent();
    
    // Click a word in the middle of transcript
    const middleWord = page.locator('[data-testid="transcript-word"]').nth(50);
    await middleWord.click();
    
    // Verify time changed
    const newTime = await page.locator('[data-testid="video-time"]').textContent();
    expect(newTime).not.toBe(initialTime);
  });
});
```

---

### Story 4.5: Undo/Redo System

**Story ID:** BDV2-US-4.5  
**Points:** 5  
**Priority:** P0  

> As Aaron, I want to undo and redo my edits so that I can experiment freely.

#### Acceptance Criteria

```gherkin
Feature: Undo/Redo System

  Scenario: Undo single edit
    Given I have removed some text
    When I press Ctrl+Z
    Then the last edit should be undone
    And the text should be restored

  Scenario: Redo undone edit
    Given I have undone an edit
    When I press Ctrl+Shift+Z
    Then the edit should be reapplied

  Scenario: Multiple undo levels
    Given I have made 10 edits
    When I press Ctrl+Z 10 times
    Then all 10 edits should be undone in reverse order

  Scenario: Undo history persists
    Given I have made edits and closed the browser
    When I return to the editor
    Then my undo history should still be available
    And I should be able to undo previous edits

  Scenario: Visual undo/redo buttons
    Then I should see undo and redo buttons in the toolbar
    And they should be disabled when not applicable
    And hovering should show the action that will be undone/redone

  Scenario: Clear redo on new edit
    Given I have undone some edits
    When I make a new edit
    Then the redo stack should be cleared
    And only undo should be available
```

---

### Story 4.6: Quick Actions

**Story ID:** BDV2-US-4.6  
**Points:** 3  
**Priority:** P1  

> As Aaron, I want quick action buttons so that I can perform common edits easily.

#### Acceptance Criteria

```gherkin
Feature: Quick Actions

  Scenario: Remove all filler words
    Given the transcript contains filler words
    When I click "Remove All Filler Words"
    Then all detected filler words should be struck through
    And I should see a count of how many were removed
    And this should be a single undo-able action

  Scenario: Confirm before bulk action
    When I click "Remove All Filler Words"
    Then I should see a confirmation: "Remove 23 filler words?"
    And I should be able to cancel or confirm

  Scenario: Remove long pauses
    Given the transcript has sections marked as long pauses
    When I click "Remove Long Pauses"
    Then those sections should be marked for removal

  Scenario: Keep only selected
    Given I have selected some text
    When I click "Keep Only Selected"
    Then everything except my selection should be removed
    And I should get a confirmation first
```

---

### Story 4.7: Search and Navigation

**Story ID:** BDV2-US-4.7  
**Points:** 3  
**Priority:** P1  

> As Aaron, I want to search the transcript so that I can find specific content quickly.

#### Acceptance Criteria

```gherkin
Feature: Search and Navigation

  Scenario: Search for text
    When I press Ctrl+F
    Then a search box should appear
    And I can type to search

  Scenario: Highlight search results
    Given I have searched for "Moses"
    Then all occurrences of "Moses" should be highlighted
    And I should see "3 of 7 matches" indicator

  Scenario: Navigate between results
    Given I have multiple search matches
    When I press Enter or click "Next"
    Then I should jump to the next match
    And the video should seek to that position

  Scenario: Jump to timestamp
    When I open "Go to time" dialog
    And I enter "12:34"
    Then I should jump to 12 minutes 34 seconds
    And the corresponding transcript should be shown
```

---

## Definition of Done

- [ ] All stories have passing unit tests
- [ ] All stories have passing integration tests
- [ ] All stories have passing E2E tests
- [ ] E2E screenshots at 3 viewports
- [ ] Transcript syncs smoothly with video (<50ms lag)
- [ ] Undo/redo supports 100+ actions
- [ ] Selection works with mouse and keyboard
- [ ] Accessibility: keyboard-only navigation works
- [ ] Performance: Handles 10,000+ word transcripts smoothly

---

## Technical Dependencies

- React state management for edit history
- Web Audio API for playback sync (optional)
- IndexedDB for local undo history persistence
- Efficient DOM updates for large transcripts

## Estimated Total Points: 37
