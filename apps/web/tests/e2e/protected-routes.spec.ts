import { test, expect } from '@playwright/test';

test('Unauthenticated user is redirected to login', async ({ page }) => {
  await page.goto('/projects');
  await expect(page).toHaveURL('/login');
  // Verify callbackUrl is preserved
  await expect(page.url()).toContain('callbackUrl=/projects');
});

test('Authenticated user can access protected route', async ({ page }) => {
  // Login flow
  await page.goto('/login');
  await page.fill('#username', 'testuser');
  await page.fill('#password', 'testpass');
  await page.click('#submit');
  await expect(page).toHaveURL('/projects');
});

// Add more tests for:
// - Redirect back to callbackUrl after login
// - 401 responses for protected API routes
