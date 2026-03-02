import { test, expect } from '@playwright/test';

/**
 * E2E tests for BDV2-ST-1.4.B: Callback URL Handling
 * 
 * @spec BDV2-US-1.4: Protected Route Redirect
 * @property VP-AUTH-01-4: Callback URL handling with security validation
 * @bead clawd-bwl
 */

test.describe('Protected Routes & Callback URL Handling', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure we start unauthenticated
    await page.context().clearCookies();
  });

  test('should redirect unauthenticated user to login with callbackUrl', async ({ page }) => {
    // Try to access protected route
    await page.goto('/projects');
    
    // Should redirect to login with callbackUrl parameter
    await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fprojects/);
    
    // Login page should be displayed
    await expect(page.getByRole('heading', { name: /sign in to your account/i })).toBeVisible();
    await expect(page.getByTestId('username-input')).toBeVisible();
  });

  test('should redirect to original URL after successful login', async ({ page }) => {
    // Navigate to a specific protected route
    const originalUrl = '/projects/test-project/editor';
    await page.goto(originalUrl);
    
    // Should be redirected to login with callbackUrl
    await page.waitForURL(/\/login\?callbackUrl=/);
    expect(page.url()).toContain('callbackUrl=%2Fprojects%2Ftest-project%2Feditor');
    
    // Login with valid credentials
    await page.getByTestId('username-input').fill('demo');
    await page.getByTestId('password-input').fill('demo');
    await page.getByTestId('login-button').click();
    
    // Should redirect back to original protected route
    await page.waitForURL(originalUrl);
    await expect(page).toHaveURL(originalUrl);
  });

  test('should default to /projects when no callbackUrl provided', async ({ page }) => {
    // Go directly to login page (no callbackUrl)
    await page.goto('/login');
    
    // Login with valid credentials
    await page.getByTestId('username-input').fill('demo');
    await page.getByTestId('password-input').fill('demo');
    await page.getByTestId('login-button').click();
    
    // Should redirect to default /projects route
    await page.waitForURL('/projects');
    await expect(page).toHaveURL('/projects');
  });

  test('should reject external URLs in callbackUrl (security)', async ({ page }) => {
    // Try to login with an external URL as callback
    await page.goto('/login?callbackUrl=https://evil.com/steal-data');
    
    // Login with valid credentials
    await page.getByTestId('username-input').fill('demo');
    await page.getByTestId('password-input').fill('demo');
    await page.getByTestId('login-button').click();
    
    // Should redirect to safe default instead of external URL
    await page.waitForURL('/projects');
    await expect(page).toHaveURL('/projects');
  });

  test('should reject protocol-relative URLs (security)', async ({ page }) => {
    // Try various malicious callback URLs
    const maliciousUrls = [
      '//evil.com/steal',
      'javascript:alert("xss")',
      'data:text/html,<script>alert("xss")</script>',
      'ftp://evil.com/file'
    ];
    
    for (const maliciousUrl of maliciousUrls) {
      await page.goto(`/login?callbackUrl=${encodeURIComponent(maliciousUrl)}`);
      
      await page.getByTestId('username-input').fill('demo');
      await page.getByTestId('password-input').fill('demo');
      await page.getByTestId('login-button').click();
      
      // Should always redirect to safe default
      await page.waitForURL('/projects');
      await expect(page).toHaveURL('/projects');
      
      // Clear cookies for next iteration
      await page.context().clearCookies();
    }
  });

  test('should handle nested protected routes correctly', async ({ page }) => {
    // Try to access deeply nested protected route
    const deepRoute = '/projects/my-project/transcript/segment/123/edit';
    await page.goto(deepRoute);
    
    // Should redirect to login with full path preserved
    await page.waitForURL(/\/login\?callbackUrl=/);
    expect(page.url()).toContain(encodeURIComponent(deepRoute));
    
    // Login and verify return to exact route
    await page.getByTestId('username-input').fill('demo');
    await page.getByTestId('password-input').fill('demo');
    await page.getByTestId('login-button').click();
    
    await page.waitForURL(deepRoute);
    await expect(page).toHaveURL(deepRoute);
  });

  test('should preserve query parameters in callbackUrl', async ({ page }) => {
    // Try to access protected route with query parameters
    const routeWithQuery = '/projects/test?tab=settings&filter=recent';
    await page.goto(routeWithQuery);
    
    // Should redirect to login preserving the full URL with query params
    await page.waitForURL(/\/login\?callbackUrl=/);
    
    // Login
    await page.getByTestId('username-input').fill('demo');
    await page.getByTestId('password-input').fill('demo');
    await page.getByTestId('login-button').click();
    
    // Should return to exact URL with query parameters intact
    await page.waitForURL(routeWithQuery);
    await expect(page).toHaveURL(routeWithQuery);
  });

  test('should handle callbackUrl with fragment/hash correctly', async ({ page }) => {
    // Note: Fragments are not sent to server, but we should handle gracefully
    const routeWithFragment = '/projects/test';
    await page.goto(routeWithFragment + '#section-2');
    
    // Should redirect to login
    await page.waitForURL(/\/login\?callbackUrl=/);
    
    // Login
    await page.getByTestId('username-input').fill('demo');
    await page.getByTestId('password-input').fill('demo');
    await page.getByTestId('login-button').click();
    
    // Should return to base URL (fragments don't reach server)
    await page.waitForURL(routeWithFragment);
    await expect(page).toHaveURL(routeWithFragment);
  });

  test('should handle multiple consecutive redirects correctly', async ({ page }) => {
    // Access protected route
    await page.goto('/projects/test');
    
    // Should redirect to login
    await page.waitForURL(/\/login\?callbackUrl=/);
    
    // Try to access another protected route while on login page
    await page.goto('/projects/another-project');
    
    // Should redirect to login with new callbackUrl
    await page.waitForURL(/\/login\?callbackUrl=/);
    expect(page.url()).toContain('another-project');
    
    // Login should redirect to the most recent requested URL
    await page.getByTestId('username-input').fill('demo');
    await page.getByTestId('password-input').fill('demo');
    await page.getByTestId('login-button').click();
    
    await page.waitForURL('/projects/another-project');
    await expect(page).toHaveURL('/projects/another-project');
  });

  test('should work across different viewports', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      // Test the callback flow
      await page.goto('/projects/test-viewport');
      
      await page.waitForURL(/\/login\?callbackUrl=/);
      expect(page.url()).toContain('test-viewport');
      
      await page.getByTestId('username-input').fill('demo');
      await page.getByTestId('password-input').fill('demo');
      await page.getByTestId('login-button').click();
      
      await page.waitForURL('/projects/test-viewport');
      await expect(page).toHaveURL('/projects/test-viewport');
      
      // Clear session for next test
      await page.context().clearCookies();
    }
  });
});