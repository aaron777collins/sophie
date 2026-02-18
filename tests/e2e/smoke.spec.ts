import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('should load the test pages', async ({ page }) => {
    // Test that the regular test page loads
    await page.goto('/test-report-modal');
    await expect(page.locator('h1')).toContainText('Message Reporting Modal Test Page');
    await expect(page.locator('[data-testid="open-report-modal"]')).toBeVisible();
    
    // Test that the radix test page loads
    await page.goto('/test-report-modal-radix');
    await expect(page.locator('h1')).toContainText('Message Reporting Modal Test Page (Radix UI)');
    await expect(page.locator('[data-testid="open-report-modal"]')).toBeVisible();
  });

  test('should open and close modal', async ({ page }) => {
    await page.goto('/test-report-modal');
    
    // Open modal
    await page.locator('[data-testid="open-report-modal"]').click();
    await expect(page.locator('.ant-modal-title')).toContainText('Report Message');
    
    // Close modal
    await page.locator('text=Cancel').click();
    await expect(page.locator('.ant-modal-title')).not.toBeVisible();
  });
});