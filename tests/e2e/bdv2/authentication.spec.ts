import { test, expect } from '@playwright/test';

/**
 * BDV2 Authentication E2E Tests
 * Stories: BDV2-US-1.1 to BDV2-US-1.6
 * Epic: EPIC-01 Authentication System
 */
test.describe('BDV2 Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Login Flow (BDV2-US-1.1)', () => {
    test('should redirect unauthenticated users to login', async ({ page }) => {
      // Accessing protected route should redirect to login
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/.*\/login/);
    });

    test('should display login page with correct elements', async ({ page }) => {
      await page.goto('/login');
      
      // Check page title and heading
      await expect(page.getByRole('heading', { name: /sign in to your account/i })).toBeVisible();
      
      // Check form elements are present
      await expect(page.getByTestId('username-input')).toBeVisible();
      await expect(page.getByTestId('password-input')).toBeVisible();
      await expect(page.getByTestId('login-button')).toBeVisible();
      
      // Check labels
      await expect(page.getByText('Username')).toBeVisible();
      await expect(page.getByText('Password')).toBeVisible();
    });

    test('should validate required fields', async ({ page }) => {
      await page.goto('/login');
      
      // Try to submit empty form
      await page.getByTestId('login-button').click();
      
      // Check validation errors appear
      await expect(page.getByTestId('username-error')).toContainText('Username is required');
      await expect(page.getByTestId('password-error')).toContainText('Password is required');
    });

    test('should perform successful login with demo credentials', async ({ page }) => {
      await page.goto('/login');
      
      // Fill in valid credentials
      await page.getByTestId('username-input').fill('demo');
      await page.getByTestId('password-input').fill('demo');
      
      // Submit form
      await page.getByTestId('login-button').click();
      
      // Should redirect to dashboard
      await page.waitForURL(/.*\/dashboard/, { timeout: 10000 });
      await expect(page).toHaveURL(/.*\/dashboard/);
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login');
      
      // Fill in invalid credentials
      await page.getByTestId('username-input').fill('invalid');
      await page.getByTestId('password-input').fill('wrong');
      
      // Submit form
      await page.getByTestId('login-button').click();
      
      // Wait for error message
      await expect(page.getByTestId('error-message')).toBeVisible();
      await expect(page.getByText('Invalid credentials')).toBeVisible();
      
      // Should remain on login page
      await expect(page).toHaveURL(/.*\/login/);
    });
  });

  test.describe('Session Management (BDV2-US-1.2)', () => {
    test('should maintain session across page reloads', async ({ page }) => {
      // Login first
      await page.goto('/login');
      await page.getByTestId('username-input').fill('demo');
      await page.getByTestId('password-input').fill('demo');
      await page.getByTestId('login-button').click();
      await page.waitForURL(/.*\/dashboard/);
      
      // Reload page
      await page.reload();
      
      // Should still be on dashboard (session maintained)
      await expect(page).toHaveURL(/.*\/dashboard/);
    });

    test('should persist session across browser tabs', async ({ context }) => {
      const page1 = await context.newPage();
      const page2 = await context.newPage();
      
      // Login in first tab
      await page1.goto('/login');
      await page1.getByTestId('username-input').fill('demo');
      await page1.getByTestId('password-input').fill('demo');
      await page1.getByTestId('login-button').click();
      await page1.waitForURL(/.*\/dashboard/);
      
      // Open dashboard in second tab
      await page2.goto('/dashboard');
      
      // Should not redirect to login (session shared)
      await expect(page2).toHaveURL(/.*\/dashboard/);
    });
  });

  test.describe('Logout Flow (BDV2-US-1.3)', () => {
    test('should logout and redirect to login page', async ({ page }) => {
      // Login first
      await page.goto('/login');
      await page.getByTestId('username-input').fill('demo');
      await page.getByTestId('password-input').fill('demo');
      await page.getByTestId('login-button').click();
      await page.waitForURL(/.*\/dashboard/);
      
      // Find and click logout button
      await page.getByTestId('logout-button').click();
      
      // Should redirect to login page
      await page.waitForURL(/.*\/login/);
      await expect(page).toHaveURL(/.*\/login/);
    });

    test('should clear session after logout', async ({ page }) => {
      // Login first
      await page.goto('/login');
      await page.getByTestId('username-input').fill('demo');
      await page.getByTestId('password-input').fill('demo');
      await page.getByTestId('login-button').click();
      await page.waitForURL(/.*\/dashboard/);
      
      // Logout
      await page.getByTestId('logout-button').click();
      await page.waitForURL(/.*\/login/);
      
      // Try to access protected route
      await page.goto('/dashboard');
      
      // Should redirect back to login
      await expect(page).toHaveURL(/.*\/login/);
    });
  });

  test.describe('Protected Route Redirect (BDV2-US-1.4)', () => {
    test('should redirect unauthenticated users to login from dashboard', async ({ page }) => {
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/.*\/login/);
    });

    test('should redirect unauthenticated users to login from projects', async ({ page }) => {
      await page.goto('/projects');
      await expect(page).toHaveURL(/.*\/login/);
    });

    test('should redirect unauthenticated users to login from upload', async ({ page }) => {
      await page.goto('/upload');
      await expect(page).toHaveURL(/.*\/login/);
    });

    test('should allow authenticated users to access protected routes', async ({ page }) => {
      // Login first
      await page.goto('/login');
      await page.getByTestId('username-input').fill('demo');
      await page.getByTestId('password-input').fill('demo');
      await page.getByTestId('login-button').click();
      await page.waitForURL(/.*\/dashboard/);
      
      // Should be able to access other protected routes
      await page.goto('/projects');
      await expect(page).not.toHaveURL(/.*\/login/);
      
      await page.goto('/upload');
      await expect(page).not.toHaveURL(/.*\/login/);
    });
  });

  test.describe('Accessibility', () => {
    test('should be keyboard accessible', async ({ page }) => {
      await page.goto('/login');
      
      // Tab navigation should work
      await page.keyboard.press('Tab');
      await expect(page.getByTestId('username-input')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.getByTestId('password-input')).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(page.getByTestId('login-button')).toBeFocused();
      
      // Should be able to submit with Enter
      await page.getByTestId('username-input').fill('demo');
      await page.getByTestId('password-input').fill('demo');
      await page.getByTestId('password-input').press('Enter');
      
      // Should redirect on successful login via keyboard
      await page.waitForURL(/.*\/dashboard/);
    });

    test('should have proper ARIA labels and roles', async ({ page }) => {
      await page.goto('/login');
      
      // Check ARIA attributes
      await expect(page.getByTestId('username-input')).toHaveAttribute('aria-describedby');
      await expect(page.getByTestId('password-input')).toHaveAttribute('aria-describedby');
      
      // Trigger validation errors
      await page.getByTestId('login-button').click();
      
      // Check ARIA invalid attributes
      await expect(page.getByTestId('username-input')).toHaveAttribute('aria-invalid', 'true');
      await expect(page.getByTestId('password-input')).toHaveAttribute('aria-invalid', 'true');
    });
  });

  test.describe('Multi-Viewport Support', () => {
    const viewports = [
      { name: 'Desktop', width: 1920, height: 1080 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Mobile', width: 375, height: 667 }
    ];

    viewports.forEach(({ name, width, height }) => {
      test(`should work on ${name} viewport (${width}x${height})`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.goto('/login');
        
        // Page should be usable
        await expect(page.getByRole('heading', { name: /sign in to your account/i })).toBeVisible();
        await expect(page.getByTestId('username-input')).toBeVisible();
        await expect(page.getByTestId('password-input')).toBeVisible();
        await expect(page.getByTestId('login-button')).toBeVisible();
        
        // Form should work
        await page.getByTestId('username-input').fill('demo');
        await page.getByTestId('password-input').fill('demo');
        await page.getByTestId('login-button').click();
        
        await page.waitForURL(/.*\/dashboard/);
        await expect(page).toHaveURL(/.*\/dashboard/);
        
        // Take screenshot for visual validation
        await page.screenshot({ 
          path: `tests/screenshots/login-${name.toLowerCase()}.png`,
          fullPage: true
        });
      });
    });
  });
});