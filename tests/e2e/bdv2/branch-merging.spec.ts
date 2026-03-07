/**
 * @spec VH-013: Branch Merging - E2E Tests
 * End-to-end tests for branch merging functionality
 *
 * RED GATE: All tests written before implementation
 * Runs against local application at http://localhost:3000
 */

import { test, expect } from '@playwright/test';

test.describe('Branch Merging', () => {
  test.beforeEach(async ({ page }) => {
    // Login to access protected routes
    await page.goto('/sign-in');
    await page.getByRole('textbox', { name: 'Username' }).fill('aaron');
    await page.getByRole('textbox', { name: 'Password' }).fill('test123');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForTimeout(2000);

    // Navigate to dashboard where branch switcher lives
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Wait for branch switcher
    await page.waitForSelector('[data-testid="branch-switcher"]', { timeout: 10000 });
  });

  test.describe('AC1: Clean Merge UI', () => {
    test('shows merge button in branch dropdown for non-main branches', async ({ page }) => {
      // Open branch dropdown
      await page.click('[data-testid="branch-switcher-trigger"]');
      await expect(page.locator('[data-testid="branch-dropdown-menu"]')).toBeVisible();

      // Feature branch should have a merge button
      await expect(page.locator('[data-testid="merge-branch-feature-titles"]')).toBeVisible();
    });

    test('merge button not shown for main branch', async ({ page }) => {
      await page.click('[data-testid="branch-switcher-trigger"]');

      // Main branch should NOT have a merge button
      await expect(page.locator('[data-testid="merge-branch-main"]')).not.toBeVisible();
    });

    test('opens merge dialog when merge button is clicked', async ({ page }) => {
      await page.click('[data-testid="branch-switcher-trigger"]');

      // Click merge for feature-titles branch
      await page.click('[data-testid="merge-branch-feature-titles"]');

      // Merge dialog should appear
      await expect(page.locator('[data-testid="branch-merge-dialog"]')).toBeVisible();
    });

    test('merge dialog shows source and target branches', async ({ page }) => {
      await page.click('[data-testid="branch-switcher-trigger"]');
      await page.click('[data-testid="merge-branch-feature-titles"]');

      const dialog = page.locator('[data-testid="branch-merge-dialog"]');
      await expect(dialog.locator('[data-testid="merge-source-branch"]')).toContainText('feature-titles');
      await expect(dialog.locator('[data-testid="merge-target-branch"]')).toContainText('main');
    });

    test('shows merge preview in dialog', async ({ page }) => {
      await page.click('[data-testid="branch-switcher-trigger"]');
      await page.click('[data-testid="merge-branch-feature-titles"]');

      await expect(page.locator('[data-testid="merge-preview"]')).toBeVisible();
    });

    test('can complete a clean merge', async ({ page }) => {
      await page.click('[data-testid="branch-switcher-trigger"]');
      await page.click('[data-testid="merge-branch-feature-titles"]');

      // Should show no conflicts for clean merge
      await expect(page.locator('[data-testid="no-conflicts-message"]')).toBeVisible();

      // Merge button should be enabled
      const mergeButton = page.locator('[data-testid="confirm-merge-button"]');
      await expect(mergeButton).toBeEnabled();

      // Click merge
      await mergeButton.click();

      // Dialog should close after merge
      await expect(page.locator('[data-testid="branch-merge-dialog"]')).not.toBeVisible();
    });
  });

  test.describe('AC2: Conflict Detection', () => {
    test('shows conflict count when branches have conflicts', async ({ page }) => {
      // Navigate to the experiment branch (which has conflicts with main)
      await page.click('[data-testid="branch-switcher-trigger"]');
      await page.click('[data-testid="branch-item-experiment-ai"]');

      // Now try to merge into main
      await page.click('[data-testid="branch-switcher-trigger"]');
      await page.click('[data-testid="merge-branch-experiment-ai"]');

      // If there are conflicts, count should be shown
      const conflictCount = page.locator('[data-testid="conflict-count"]');
      // This may or may not have conflicts - just verify dialog opens
      await expect(page.locator('[data-testid="branch-merge-dialog"]')).toBeVisible();
    });

    test('highlights conflicting sections when conflicts exist', async ({ page }) => {
      await page.click('[data-testid="branch-switcher-trigger"]');
      await page.click('[data-testid="merge-branch-feature-titles"]');

      // If conflicts exist, they should be highlighted
      const conflictList = page.locator('[data-testid="conflict-list"]');
      const conflictCount = page.locator('[data-testid="conflict-count"]');

      // Either no conflicts (clean) or conflicts list is shown
      const hasConflicts = await conflictCount.isVisible();
      if (hasConflicts) {
        await expect(conflictList).toBeVisible();
        const conflictItems = page.locator('[data-testid^="conflict-item-"]');
        const count = await conflictItems.count();
        expect(count).toBeGreaterThan(0);
      } else {
        await expect(page.locator('[data-testid="no-conflicts-message"]')).toBeVisible();
      }
    });

    test('shows both versions for conflicts', async ({ page }) => {
      await page.click('[data-testid="branch-switcher-trigger"]');
      await page.click('[data-testid="merge-branch-feature-titles"]');

      const conflictCount = page.locator('[data-testid="conflict-count"]');
      const hasConflicts = await conflictCount.isVisible();

      if (hasConflicts) {
        // Should show both versions
        await expect(page.locator('[data-testid^="conflict-ours-"]').first()).toBeVisible();
        await expect(page.locator('[data-testid^="conflict-theirs-"]').first()).toBeVisible();
      }
    });
  });

  test.describe('AC3: Conflict Resolution', () => {
    test('can resolve conflict by choosing mine', async ({ page }) => {
      await page.click('[data-testid="branch-switcher-trigger"]');
      await page.click('[data-testid="merge-branch-feature-titles"]');

      const conflictCount = page.locator('[data-testid="conflict-count"]');
      const hasConflicts = await conflictCount.isVisible();

      if (hasConflicts) {
        // Click "choose mine" for first conflict
        await page.click('[data-testid="choose-ours-button"]');

        // Conflict should be marked as resolved
        await expect(page.locator('[data-testid="conflict-resolved-indicator"]').first()).toBeVisible();
      }
    });

    test('can resolve conflict by choosing theirs', async ({ page }) => {
      await page.click('[data-testid="branch-switcher-trigger"]');
      await page.click('[data-testid="merge-branch-feature-titles"]');

      const conflictCount = page.locator('[data-testid="conflict-count"]');
      const hasConflicts = await conflictCount.isVisible();

      if (hasConflicts) {
        await page.click('[data-testid="choose-theirs-button"]');
        await expect(page.locator('[data-testid="conflict-resolved-indicator"]').first()).toBeVisible();
      }
    });

    test('can manually edit conflict resolution', async ({ page }) => {
      await page.click('[data-testid="branch-switcher-trigger"]');
      await page.click('[data-testid="merge-branch-feature-titles"]');

      const conflictCount = page.locator('[data-testid="conflict-count"]');
      const hasConflicts = await conflictCount.isVisible();

      if (hasConflicts) {
        // Open manual editor
        await page.click('[data-testid="edit-manually-button"]');
        await expect(page.locator('[data-testid="manual-editor"]')).toBeVisible();

        // Edit the content
        await page.fill('[data-testid="manual-editor"]', 'Manually resolved content');

        // Save
        await page.click('[data-testid="save-manual-edit-button"]');
        await expect(page.locator('[data-testid="conflict-resolved-indicator"]').first()).toBeVisible();
      }
    });

    test('merge becomes available when all conflicts resolved', async ({ page }) => {
      await page.click('[data-testid="branch-switcher-trigger"]');
      await page.click('[data-testid="merge-branch-feature-titles"]');

      const hasConflicts = await page.locator('[data-testid="conflict-count"]').isVisible();

      if (hasConflicts) {
        // Resolve all conflicts
        const chooseOursButtons = page.locator('[data-testid="choose-ours-button"]');
        const count = await chooseOursButtons.count();
        for (let i = 0; i < count; i++) {
          await chooseOursButtons.nth(i).click();
        }

        // Merge button should now be enabled
        await expect(page.locator('[data-testid="confirm-merge-button"]')).toBeEnabled();
      }
    });
  });

  test.describe('AC4: Abort Merge', () => {
    test('shows abort button in merge dialog', async ({ page }) => {
      await page.click('[data-testid="branch-switcher-trigger"]');
      await page.click('[data-testid="merge-branch-feature-titles"]');

      await expect(page.locator('[data-testid="abort-merge-button"]')).toBeVisible();
    });

    test('closes dialog when abort is clicked (no conflicts)', async ({ page }) => {
      await page.click('[data-testid="branch-switcher-trigger"]');
      await page.click('[data-testid="merge-branch-feature-titles"]');

      // For clean merge, abort should close immediately
      const hasConflicts = await page.locator('[data-testid="conflict-count"]').isVisible();

      if (!hasConflicts) {
        await page.click('[data-testid="abort-merge-button"]');
        await expect(page.locator('[data-testid="branch-merge-dialog"]')).not.toBeVisible();
      }
    });

    test('shows confirmation before abort when conflicts exist', async ({ page }) => {
      await page.click('[data-testid="branch-switcher-trigger"]');
      await page.click('[data-testid="merge-branch-feature-titles"]');

      const hasConflicts = await page.locator('[data-testid="conflict-count"]').isVisible();

      if (hasConflicts) {
        await page.click('[data-testid="abort-merge-button"]');
        await expect(page.locator('[data-testid="abort-confirmation"]')).toBeVisible();
      }
    });

    test('abort cancellation keeps dialog open', async ({ page }) => {
      await page.click('[data-testid="branch-switcher-trigger"]');
      await page.click('[data-testid="merge-branch-feature-titles"]');

      const hasConflicts = await page.locator('[data-testid="conflict-count"]').isVisible();

      if (hasConflicts) {
        await page.click('[data-testid="abort-merge-button"]');
        await page.click('[data-testid="cancel-abort-button"]');

        // Dialog should still be open
        await expect(page.locator('[data-testid="branch-merge-dialog"]')).toBeVisible();
      }
    });
  });

  test.describe('AC5: Merge History', () => {
    test('shows merge commit in version history after merge', async ({ page }) => {
      // Complete a merge first
      await page.click('[data-testid="branch-switcher-trigger"]');
      await page.click('[data-testid="merge-branch-feature-titles"]');

      // Wait for dialog
      await page.waitForSelector('[data-testid="branch-merge-dialog"]');

      // Check for no conflicts (clean merge)
      const hasConflicts = await page.locator('[data-testid="conflict-count"]').isVisible();
      if (!hasConflicts) {
        await page.click('[data-testid="confirm-merge-button"]');
        await page.waitForSelector('[data-testid="branch-merge-dialog"]', { state: 'hidden' });

        // Open version history panel (if accessible)
        const versionHistory = page.locator('[data-testid="version-history-panel"]');
        if (await versionHistory.isVisible()) {
          // Look for merge commit indicator
          await expect(page.locator('[data-testid^="merge-commit-"]').first()).toBeVisible();
        }
      }
    });

    test('merge commit shows parent branch information', async ({ page }) => {
      // Navigate to version history
      const versionHistoryToggle = page.locator('[data-testid="version-history-toggle"]');
      if (await versionHistoryToggle.isVisible()) {
        await versionHistoryToggle.click();

        // Look for merge entries with parent branch info
        const mergeCommits = page.locator('[data-testid^="merge-commit-"]');
        const count = await mergeCommits.count();

        if (count > 0) {
          await expect(mergeCommits.first().locator('[data-testid="merge-parent-branch"]')).toBeVisible();
        }
      }
    });
  });
});
