import { test, expect } from '@playwright/test';

/**
 * Screenshot validation for BDV2-ST-1.4.B: Callback URL Handling
 * 
 * Taking screenshots at 3 viewports as required by quality gates:
 * - Desktop (1920x1080)
 * - Tablet (768x1024)  
 * - Mobile (375x667)
 */

const viewports = [
  { width: 1920, height: 1080, name: 'desktop' },
  { width: 768, height: 1024, name: 'tablet' },
  { width: 375, height: 667, name: 'mobile' }
];

test.describe('Callback URL Handling - Screenshots', () => {
  for (const viewport of viewports) {
    test(`should demonstrate callback URL functionality on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      // Clear any existing session
      await page.context().clearCookies();
      
      // Step 1: Try to access protected route
      await page.goto('/projects');
      
      // Should redirect to login with callbackUrl
      await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fprojects/);
      
      // Take screenshot of login page with callback URL
      await page.screenshot({ 
        path: `scheduler/validation/screenshots/bdv2/clawd-bwl/${viewport.name}/01-redirect-to-login.png`,
        fullPage: true 
      });
      
      // Step 2: Login with credentials
      await page.getByTestId('username-input').fill('demo');
      await page.getByTestId('password-input').fill('demo');
      await page.getByTestId('login-button').click();
      
      // Should redirect back to projects
      await page.waitForURL('/projects');
      await expect(page).toHaveURL('/projects');
      
      // Take screenshot of successful redirect to projects page
      await page.screenshot({ 
        path: `scheduler/validation/screenshots/bdv2/clawd-bwl/${viewport.name}/02-successful-redirect.png`,
        fullPage: true 
      });
      
      // Step 3: Test nested route with callback URL
      await page.context().clearCookies();
      
      // Try to access deeply nested route
      await page.goto('/projects/my-project/transcript/segment/123/edit');
      
      // Should redirect to login preserving the nested path
      await expect(page).toHaveURL(/\/login\?callbackUrl=/);
      expect(page.url()).toContain('projects%2Fmy-project%2Ftranscript%2Fsegment%2F123%2Fedit');
      
      // Take screenshot of nested callback URL
      await page.screenshot({ 
        path: `scheduler/validation/screenshots/bdv2/clawd-bwl/${viewport.name}/03-nested-callback-url.png`,
        fullPage: true 
      });
    });
  }
});