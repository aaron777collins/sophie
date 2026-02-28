# Epic 06: Version History & Rollback

**Epic ID:** BDV2-EPIC-06  
**Priority:** P1 (Should Have)  
**Status:** Draft  
**Dependencies:** EPIC-04 (Transcript Editor)  

## Description

Git-like version control for project edits, enabling save points, rollback, branching for experiments, and space-efficient storage using diffs rather than full copies.

## Business Value

- Never lose work, always recoverable
- Enables experimentation without fear
- Provides audit trail of all changes
- Efficient storage for many versions

---

## User Stories

### Story 6.1: Auto-Save Versions

**Story ID:** BDV2-US-6.1  
**Points:** 5  
**Priority:** P1  

> As Aaron, I want my edits auto-saved so that I never lose work.

#### Acceptance Criteria

```gherkin
Feature: Auto-Save Versions

  Scenario: Automatic checkpoint creation
    Given I am editing a transcript
    When I make any edit
    Then the change should be saved automatically
    And I should see a "Saved" indicator
    And a checkpoint should be created after periods of inactivity

  Scenario: Checkpoint frequency
    Given I am actively editing
    Then checkpoints should be created:
      - After 30 seconds of no edits
      - After every 10 significant edits
      - Before closing the browser

  Scenario: Show save status
    Given I am in the editor
    Then I should see one of:
      | Status      | Indicator                    |
      | Saving      | Spinning icon                |
      | Saved       | Checkmark with timestamp     |
      | Offline     | Warning with "Changes queued"|

  Scenario: Recover unsaved changes
    Given I was editing and my browser crashed
    When I return to the project
    Then I should see "Unsaved changes recovered"
    And my latest edits should be present
```

---

### Story 6.2: Create Named Save Points

**Story ID:** BDV2-US-6.2  
**Points:** 3  
**Priority:** P1  

> As Aaron, I want to create named save points so that I can mark important milestones.

#### Acceptance Criteria

```gherkin
Feature: Create Named Save Points

  Scenario: Create save point with name
    Given I am in the editor
    When I click "Save Point" or press Ctrl+S
    Then I should see a dialog to name this version
    And I can enter a description
    And clicking "Save" creates the save point

  Scenario: Quick save point
    When I press Ctrl+Shift+S
    Then a save point should be created immediately
    With an auto-generated name like "Save 2024-02-28 15:30"

  Scenario: View save point in history
    Given I have created a named save point
    When I view version history
    Then I should see my save point with:
      - Name I provided
      - Timestamp
      - Description (if provided)
      - Changes since previous save
```

---

### Story 6.3: View Version History

**Story ID:** BDV2-US-6.3  
**Points:** 5  
**Priority:** P1  

> As Aaron, I want to view my editing history so that I can see how my project evolved.

#### Acceptance Criteria

```gherkin
Feature: View Version History

  Scenario: Open version history panel
    When I click "History" or press Ctrl+H
    Then I should see a version history panel
    And versions should be listed newest first

  Scenario: Version list display
    Given I have multiple versions
    Then each version should show:
      | Field         | Example                        |
      | Timestamp     | Feb 28, 2024 3:30 PM           |
      | Name          | "After AI suggestions"         |
      | Type          | Auto-save / Manual / AI edit   |
      | Summary       | "Removed 45 words, restored 3" |

  Scenario: Collapse similar auto-saves
    Given many auto-saves exist between manual saves
    Then auto-saves should be collapsed under "12 auto-saves"
    And I can expand to see individual auto-saves

  Scenario: Filter history
    When I filter by "Manual saves only"
    Then only named save points should be visible
    
    When I filter by "AI edits"
    Then only versions created by AI should be visible
```

---

### Story 6.4: Preview Previous Version

**Story ID:** BDV2-US-6.4  
**Points:** 5  
**Priority:** P1  

> As Aaron, I want to preview previous versions so that I can decide which to restore.

#### Acceptance Criteria

```gherkin
Feature: Preview Previous Version

  Scenario: View version transcript
    Given I am viewing version history
    When I click on a previous version
    Then I should see the transcript as it was at that version
    And it should be clearly marked as "Viewing: [version name]"
    And I should NOT be able to edit in preview mode

  Scenario: Compare with current
    When I click "Compare with current"
    Then I should see a diff view showing:
      - Added text (highlighted green)
      - Removed text (highlighted red)
      - Unchanged text (normal)

  Scenario: Play preview video
    Given I am previewing a previous version
    When I click play
    Then I should see the video as it would export at that version
    And removed sections should be skipped
```

---

### Story 6.5: Restore Previous Version

**Story ID:** BDV2-US-6.5  
**Points:** 5  
**Priority:** P1  

> As Aaron, I want to restore a previous version so that I can undo unwanted changes.

#### Acceptance Criteria

```gherkin
Feature: Restore Previous Version

  Scenario: Restore to previous version
    Given I am viewing a previous version
    When I click "Restore This Version"
    And I confirm the action
    Then the project should revert to that version
    And the current state should be saved first
    And I should see "Restored to [version name]"

  Scenario: Restoration creates new version
    Given I have restored to a previous version
    When I view history
    Then I should see a new entry "Restored to [version name]"
    And the version I restored from should still exist
    And I can restore back to the "before restore" state

  Scenario: Partial restoration
    Given I am comparing versions
    When I select specific changes
    And I click "Restore Selected"
    Then only those changes should be reverted
    And other edits should remain

  Scenario: Cancel restore
    Given I have clicked "Restore This Version"
    When I click "Cancel" on confirmation
    Then no changes should be made
    And I should remain in preview mode
```

#### Playwright Test Specs

```typescript
test.describe('Restore Previous Version', () => {
  test('should restore and preserve current state', async ({ page }) => {
    await loginAs(page, 'aaron');
    await page.goto('/project/test-project/editor');
    
    // Make some edits
    await makeEdits(page);
    await page.click('[data-testid="save-point-button"]');
    await page.fill('[data-testid="save-point-name"]', 'Before changes');
    await page.click('[data-testid="confirm-save"]');
    
    // Make more edits
    await makeEdits(page);
    
    // Open history and restore
    await page.click('[data-testid="history-button"]');
    await page.click('[data-testid="version-item"]', { text: 'Before changes' });
    await page.click('[data-testid="restore-button"]');
    await page.click('[data-testid="confirm-restore"]');
    
    // Verify restored
    await expect(page.locator('[data-testid="status-message"]')).toContainText('Restored');
  });
});
```

---

### Story 6.6: Space-Efficient Storage

**Story ID:** BDV2-US-6.6  
**Points:** 5  
**Priority:** P1  

> As the system, I want to store versions efficiently so that many versions don't consume excessive storage.

#### Acceptance Criteria

```gherkin
Feature: Space-Efficient Storage

  Scenario: Store diffs instead of full copies
    Given I have 10 versions of a project
    Then storage should use delta compression
    And total storage should be less than 2x a single version
    
  Scenario: Compact old versions
    Given a project has 100+ auto-save versions
    When automatic cleanup runs
    Then old auto-saves should be consolidated
    And manual save points should be preserved
    And at least one auto-save per day should be kept

  Scenario: Show storage usage
    When I view project settings
    Then I should see:
      | Metric            | Example  |
      | Total versions    | 47       |
      | Storage used      | 12.5 MB  |
      | Largest version   | 1.2 MB   |

  Scenario: Manual cleanup option
    Given I have many old versions
    When I click "Clean Up Old Versions"
    Then I should see options:
      - Keep last N versions
      - Keep versions newer than X days
      - Keep all manual save points
    And I should see space that will be freed
```

---

### Story 6.7: Branch for Experiments

**Story ID:** BDV2-US-6.7  
**Points:** 5  
**Priority:** P2  

> As Aaron, I want to create branches so that I can experiment without affecting my main work.

#### Acceptance Criteria

```gherkin
Feature: Branch for Experiments

  Scenario: Create branch
    Given I am in the editor
    When I click "Create Branch"
    And I name it "Short version experiment"
    Then a new branch should be created
    And I should be switched to that branch
    And the main branch should be unchanged

  Scenario: Switch between branches
    Given I have multiple branches
    When I click on the branch selector
    Then I should see all branches
    And clicking a branch should switch to it
    And unsaved changes should prompt to save first

  Scenario: Merge branch
    Given I am on an experiment branch
    And I like the changes
    When I click "Merge to Main"
    Then the experiment changes should be applied to main
    And the branch can optionally be deleted

  Scenario: Delete branch
    Given I have an experiment branch I no longer need
    When I click "Delete Branch"
    Then the branch should be removed
    And I should be switched to main if I was on that branch
```

---

## Definition of Done

- [ ] All stories have passing unit tests
- [ ] All stories have passing integration tests
- [ ] All stories have passing E2E tests
- [ ] Version storage uses <2x single version space
- [ ] Restore operation completes in <3 seconds
- [ ] History loads within 1 second for 100 versions
- [ ] No data loss in any scenario

---

## Technical Dependencies

- Delta/diff algorithm implementation
- Efficient JSON diff library
- IndexedDB for local caching
- Background compression worker

## Estimated Total Points: 33
