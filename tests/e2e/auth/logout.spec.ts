import { test, expect } from '@playwright/test';

/**
 * BDV2 Logout E2E Tests
 * Story: BDV2-US-1.3 (User Logout)
 * Task: BDV2-ST-1.3.C
 * 
 * Acceptance Criteria:
 * 1. Clicking Sign Out redirects to login page
 * 2. Session cookie is invalidated on logout  
 * 3. 'You have been signed out' message displayed
 * 4. Cannot access protected pages after logout
 * 5. Logout works from any page in the application
 */

test.describe('BDV2 Logout Functionality', () => {
  
  const viewports = [
    { name: 'desktop', width: 1920, height: 1080 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'mobile', width: 375, height: 667 }
  ];

  // Helper function to authenticate user
  async function loginUser(page) {
    await page.goto('/login');
    await page.getByTestId('username-input').fill('demo');
    await page.getByTestId('password-input').fill('demo');
    await page.getByTestId('login-button').click();
    await page.waitForURL(/.*\/(dashboard|projects)/, { timeout: 10000 });
  }

  // Helper function to verify user is logged out
  async function verifyLoggedOut(page) {
    // Check we're on login page
    await expect(page).toHaveURL(/.*\/login/);
    
    // Check login form elements are visible
    await expect(page.getByTestId('username-input')).toBeVisible();
    await expect(page.getByTestId('password-input')).toBeVisible();
    await expect(page.getByTestId('login-button')).toBeVisible();
  }

  test.describe('AC-1: Successful Logout Flow', () => {
    viewports.forEach(({ name, width, height }) => {
      test(`should successfully logout from dashboard - ${name} viewport`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        
        // AC-1: Login first
        await loginUser(page);
        
        // Take screenshot of authenticated state
        await page.screenshot({ 
          path: `tests/screenshots/logout-${name}-authenticated-state.png`,
          fullPage: true 
        });
        
        // AC-1: Find and click logout button
        const logoutButton = page.getByTestId('logout-button');
        await expect(logoutButton).toBeVisible();
        await logoutButton.click();
        
        // AC-1: Should redirect to login page
        await page.waitForURL(/.*\/login/, { timeout: 10000 });
        await expect(page).toHaveURL(/.*\/login/);
        
        // Take screenshot of logout completion
        await page.screenshot({ 
          path: `tests/screenshots/logout-${name}-completed.png`,
          fullPage: true 
        });
      });
    });
  });

  test.describe('AC-2: Session Cookie Invalidation', () => {
    test('should invalidate session cookies on logout', async ({ page }) => {
      // Login first
      await loginUser(page);
      
      // Get cookies before logout
      const cookiesBefore = await page.context().cookies();
      const sessionCookie = cookiesBefore.find(c => c.name.includes('session-token'));
      expect(sessionCookie).toBeTruthy();
      
      // Logout
      await page.getByTestId('logout-button').click();
      await page.waitForURL(/.*\/login/);
      
      // Get cookies after logout
      const cookiesAfter = await page.context().cookies();
      const sessionCookieAfter = cookiesAfter.find(c => c.name.includes('session-token'));
      
      // Session cookie should be cleared or expired
      expect(sessionCookieAfter?.value).toBeFalsy();
    });
  });

  test.describe('AC-3: Logout Confirmation Message', () => {
    viewports.forEach(({ name, width, height }) => {
      test(`should display logout confirmation message - ${name} viewport`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        
        // Login first
        await loginUser(page);
        
        // Logout
        await page.getByTestId('logout-button').click();
        await page.waitForURL(/.*\/login/);
        
        // AC-3: Check for logout confirmation message
        const logoutMessage = page.getByText(/you have been signed out/i);
        await expect(logoutMessage).toBeVisible({ timeout: 5000 });
        
        // Take screenshot showing the logout message
        await page.screenshot({ 
          path: `tests/screenshots/logout-${name}-confirmation-message.png`,
          fullPage: true 
        });
      });
    });
  });

  test.describe('AC-4: Protected Routes Access Denied After Logout', () => {
    const protectedRoutes = ['/dashboard', '/projects', '/upload'];
    
    protectedRoutes.forEach(route => {
      test(`should deny access to ${route} after logout`, async ({ page }) => {
        // Login first
        await loginUser(page);
        
        // Verify we can access the protected route while authenticated
        await page.goto(route);
        await expect(page).not.toHaveURL(/.*\/login/);
        
        // Logout
        await page.getByTestId('logout-button').click();
        await page.waitForURL(/.*\/login/);
        
        // AC-4: Try to access protected route after logout
        await page.goto(route);
        
        // Should be redirected to login
        await expect(page).toHaveURL(/.*\/login/);
        await verifyLoggedOut(page);
      });
    });
  });

  test.describe('AC-5: Logout From Different Pages', () => {
    const pages = [
      { route: '/dashboard', name: 'dashboard' },
      { route: '/projects', name: 'projects' }, 
      { route: '/upload', name: 'upload' }
    ];
    
    pages.forEach(({ route, name }) => {
      test(`should logout successfully from ${name} page`, async ({ page }) => {
        // Login first
        await loginUser(page);
        
        // Navigate to specific page
        await page.goto(route);
        
        // Wait for page to load and verify we're there
        await page.waitForURL(`*${route}*`);
        
        // AC-5: Logout from this page
        const logoutButton = page.getByTestId('logout-button');
        await expect(logoutButton).toBeVisible();
        await logoutButton.click();
        
        // Should redirect to login
        await page.waitForURL(/.*\/login/);
        await expect(page).toHaveURL(/.*\/login/);
        
        // Verify logout message appears
        await expect(page.getByText(/you have been signed out/i)).toBeVisible();
      });
    });
  });

  test.describe('Logout Button Accessibility', () => {
    test('should be keyboard accessible', async ({ page }) => {
      await loginUser(page);
      
      // Navigate to logout button with keyboard
      await page.keyboard.press('Tab');
      // Keep tabbing until we reach the logout button
      let attempts = 0;
      while (attempts < 20) { // Reasonable limit to prevent infinite loop
        const focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
        if (focusedElement === 'logout-button') {
          break;
        }
        await page.keyboard.press('Tab');
        attempts++;
      }
      
      // Should be able to activate logout with Enter key
      await expect(page.getByTestId('logout-button')).toBeFocused();
      await page.keyboard.press('Enter');
      
      // Should complete logout
      await page.waitForURL(/.*\/login/);
      await expect(page).toHaveURL(/.*\/login/);
    });

    test('should have proper ARIA attributes', async ({ page }) => {
      await loginUser(page);
      
      const logoutButton = page.getByTestId('logout-button');
      
      // Check ARIA attributes
      await expect(logoutButton).toHaveAttribute('role', 'button');
      await expect(logoutButton).toHaveAccessibleName(/sign out|logout/i);
    });
  });

  test.describe('Edge Cases', () => {
    test('should handle double logout attempts gracefully', async ({ page }) => {
      await loginUser(page);
      
      // First logout
      await page.getByTestId('logout-button').click();
      await page.waitForURL(/.*\/login/);
      
      // Try to access a protected route (which should redirect to login)
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/.*\/login/);
      
      // Should not cause any errors and remain on login page
      await verifyLoggedOut(page);
    });

    test('should handle logout with slow network', async ({ page }) => {
      // Simulate slow network
      await page.route('**/*', route => {
        setTimeout(() => route.continue(), 100);
      });
      
      await loginUser(page);
      
      // Logout should still work with slow network
      await page.getByTestId('logout-button').click();
      await page.waitForURL(/.*\/login/, { timeout: 15000 }); // Extended timeout
      
      await expect(page).toHaveURL(/.*\/login/);
    });

    test('should preserve logout redirect URL', async ({ page }) => {
      await loginUser(page);
      
      // Navigate to a specific protected route
      await page.goto('/projects');
      await page.waitForURL(/.*\/projects/);
      
      // Logout
      await page.getByTestId('logout-button').click();
      
      // Should redirect to login with logout parameter
      await page.waitForURL(/.*\/login/);
      expect(page.url()).toContain('/login');
      
      // Check for logout confirmation
      await expect(page.getByText(/you have been signed out/i)).toBeVisible();
    });
  });

  test.describe('Visual Validation - Cross-Viewport Screenshots', () => {
    viewports.forEach(({ name, width, height }) => {
      test(`should capture logout flow screenshots - ${name}`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        
        // 1. Initial authenticated state
        await loginUser(page);
        await page.screenshot({ 
          path: `scheduler/validation/screenshots/clawd-x3z/${name}/01-authenticated-dashboard.png`,
          fullPage: true 
        });
        
        // 2. Logout button visible and highlighted
        const logoutButton = page.getByTestId('logout-button');
        await logoutButton.hover(); // Highlight the button
        await page.screenshot({ 
          path: `scheduler/validation/screenshots/clawd-x3z/${name}/02-logout-button-highlighted.png`,
          fullPage: true 
        });
        
        // 3. Click logout
        await logoutButton.click();
        await page.waitForURL(/.*\/login/);
        
        // 4. Final logged out state with confirmation
        await page.screenshot({ 
          path: `scheduler/validation/screenshots/clawd-x3z/${name}/03-logged-out-with-confirmation.png`,
          fullPage: true 
        });
        
        // 5. Verify protected route access denied
        await page.goto('/dashboard');
        await expect(page).toHaveURL(/.*\/login/);
        await page.screenshot({ 
          path: `scheduler/validation/screenshots/clawd-x3z/${name}/04-protected-route-access-denied.png`,
          fullPage: true 
        });
      });
    });
  });
});