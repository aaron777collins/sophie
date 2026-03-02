import { test, expect } from '@playwright/test';

test.describe('Login Rate Limiting UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  /**
   * @spec BDV2-ST-1.5.C
   * Tests rate limit UI feedback in login form
   * 
   * Note: These tests verify the UI behavior when the API returns 429.
   * The actual rate limiting logic is handled by the backend (BDV2-ST-1.5.A/B).
   */

  test('should show rate limit message when API returns 429', async ({ page }) => {
    // Mock the NextAuth endpoint to return 429
    await page.route('**/api/auth/callback/credentials', async (route) => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'RateLimitExceeded',
          message: 'Too many login attempts',
        }),
      });
    });

    // Fill in credentials
    await page.getByTestId('username-input').fill('testuser');
    await page.getByTestId('password-input').fill('testpass');

    // Submit form
    await page.getByTestId('login-button').click();

    // Rate limit message should appear
    await expect(page.getByTestId('rate-limit-message')).toBeVisible();
    await expect(page.getByText(/too many login attempts/i)).toBeVisible();
  });

  test('should disable login button during rate limit cooldown', async ({ page }) => {
    // Mock the NextAuth endpoint to return 429
    await page.route('**/api/auth/callback/credentials', async (route) => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'RateLimitExceeded' }),
      });
    });

    // Fill in credentials and submit
    await page.getByTestId('username-input').fill('testuser');
    await page.getByTestId('password-input').fill('testpass');
    await page.getByTestId('login-button').click();

    // Login button should be disabled
    await expect(page.getByTestId('login-button')).toBeDisabled();
  });

  test('should show visual indication with amber styling', async ({ page }) => {
    // Mock the NextAuth endpoint to return 429
    await page.route('**/api/auth/callback/credentials', async (route) => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'RateLimitExceeded' }),
      });
    });

    // Fill in credentials and submit
    await page.getByTestId('username-input').fill('testuser');
    await page.getByTestId('password-input').fill('testpass');
    await page.getByTestId('login-button').click();

    // Check for amber/warning styling
    const rateLimitMessage = page.getByTestId('rate-limit-message');
    await expect(rateLimitMessage).toBeVisible();
    await expect(rateLimitMessage).toHaveClass(/bg-amber-50/);
  });

  test('should display countdown timer', async ({ page }) => {
    // Mock the NextAuth endpoint to return 429
    await page.route('**/api/auth/callback/credentials', async (route) => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'RateLimitExceeded' }),
      });
    });

    // Fill in credentials and submit
    await page.getByTestId('username-input').fill('testuser');
    await page.getByTestId('password-input').fill('testpass');
    await page.getByTestId('login-button').click();

    // Countdown timer should be visible
    const cooldownTimer = page.getByTestId('cooldown-timer');
    await expect(cooldownTimer).toBeVisible();
    
    // Timer should show time in MM:SS format
    await expect(cooldownTimer).toHaveText(/\d:\d{2}/);
  });

  test('should show waiting text in button during cooldown', async ({ page }) => {
    // Mock the NextAuth endpoint to return 429
    await page.route('**/api/auth/callback/credentials', async (route) => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'RateLimitExceeded' }),
      });
    });

    // Fill in credentials and submit
    await page.getByTestId('username-input').fill('testuser');
    await page.getByTestId('password-input').fill('testpass');
    await page.getByTestId('login-button').click();

    // Button should show wait time
    await expect(page.getByTestId('login-button')).toContainText(/wait/i);
  });

  test('should have proper accessibility attributes on rate limit message', async ({ page }) => {
    // Mock the NextAuth endpoint to return 429
    await page.route('**/api/auth/callback/credentials', async (route) => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'RateLimitExceeded' }),
      });
    });

    // Fill in credentials and submit
    await page.getByTestId('username-input').fill('testuser');
    await page.getByTestId('password-input').fill('testpass');
    await page.getByTestId('login-button').click();

    // Rate limit message should have proper ARIA attributes
    const rateLimitMessage = page.getByTestId('rate-limit-message');
    await expect(rateLimitMessage).toHaveAttribute('role', 'alert');
    await expect(rateLimitMessage).toHaveAttribute('aria-live', 'polite');
  });

  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Mock the NextAuth endpoint to return 429
    await page.route('**/api/auth/callback/credentials', async (route) => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'RateLimitExceeded' }),
      });
    });

    // Fill in credentials and submit
    await page.getByTestId('username-input').fill('testuser');
    await page.getByTestId('password-input').fill('testpass');
    await page.getByTestId('login-button').click();

    // Rate limit UI should be visible on mobile
    await expect(page.getByTestId('rate-limit-message')).toBeVisible();
    await expect(page.getByText(/too many login attempts/i)).toBeVisible();
    await expect(page.getByTestId('cooldown-timer')).toBeVisible();
  });

  test('should work on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    // Mock the NextAuth endpoint to return 429
    await page.route('**/api/auth/callback/credentials', async (route) => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'RateLimitExceeded' }),
      });
    });

    // Fill in credentials and submit
    await page.getByTestId('username-input').fill('testuser');
    await page.getByTestId('password-input').fill('testpass');
    await page.getByTestId('login-button').click();

    // Rate limit UI should be visible on tablet
    await expect(page.getByTestId('rate-limit-message')).toBeVisible();
    await expect(page.getByText(/too many login attempts/i)).toBeVisible();
  });

  test('should take screenshots at 3 viewports', async ({ page }) => {
    // Mock the NextAuth endpoint to return 429
    await page.route('**/api/auth/callback/credentials', async (route) => {
      await route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'RateLimitExceeded' }),
      });
    });

    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1280, height: 720 },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/login');

      // Trigger rate limit
      await page.getByTestId('username-input').fill('testuser');
      await page.getByTestId('password-input').fill('testpass');
      await page.getByTestId('login-button').click();

      // Wait for rate limit message
      await expect(page.getByTestId('rate-limit-message')).toBeVisible();

      // Take screenshot
      await page.screenshot({
        path: `tests/screenshots/rate-limit-${viewport.name}.png`,
        fullPage: true,
      });
    }
  });
});
