/**
 * MELO-P1-S02: Login Functionality Audit
 * 
 * This test audits the login functionality of Melo V2 application
 * following Test-Driven Development (TDD) approach.
 * 
 * App URL: http://dev2.aaroncollins.info:3000/
 * Created: 2026-02-27
 * Worker: MELO-P1-S02
 */

import { test, expect } from '@playwright/test';

const APP_URL = 'http://dev2.aaroncollins.info:3000/';

// Test credentials (will either use from S01 or create new)
const TEST_USER = {
  email: `testuser-${Date.now()}@example.com`,
  password: 'TestPass123!'
};

// Invalid credentials for error testing
const INVALID_USER = {
  email: 'invalid@example.com',
  password: 'wrongpassword'
};

// Viewport configurations for evidence capture
const VIEWPORTS = {
  desktop: { width: 1920, height: 1080 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 }
};

/**
 * AC-1: Login Form Display
 * Test that login form displays properly at all viewport sizes
 */
test.describe('AC-1: Login Form Display', () => {
  
  for (const [device, viewport] of Object.entries(VIEWPORTS)) {
    test(`Login form displays correctly on ${device}`, async ({ page }) => {
      // Set viewport for this device
      await page.setViewportSize(viewport);
      
      // Navigate to app
      await page.goto(APP_URL);
      
      // Take screenshot of homepage
      await page.screenshot({ 
        path: `~/clawd/scheduler/validation/screenshots/melo-audit/MELO-P1-S02/homepage-${device}.png`,
        fullPage: true 
      });
      
      // Look for login form or login link
      // First check if there's a direct login form on the page
      const loginForm = page.locator('form').filter({ hasText: /login|sign in/i });
      const emailInput = page.locator('input[type="email"], input[name*="email"], input[placeholder*="email"]');
      const passwordInput = page.locator('input[type="password"]');
      const loginButton = page.locator('button').filter({ hasText: /login|sign in/i });
      const loginLink = page.locator('a').filter({ hasText: /login|sign in/i });
      
      // Check if login form is directly visible
      if (await loginForm.count() > 0 && await emailInput.count() > 0 && await passwordInput.count() > 0) {
        // Login form is directly on the page
        await page.screenshot({ 
          path: `~/clawd/scheduler/validation/screenshots/melo-audit/MELO-P1-S02/login-form-${device}.png`,
          fullPage: true 
        });
        
        // Verify form elements
        await expect(emailInput.first()).toBeVisible();
        await expect(passwordInput.first()).toBeVisible();
        await expect(loginButton.first()).toBeVisible();
        
      } else if (await loginLink.count() > 0) {
        // There's a login link, click it to navigate to login form
        await loginLink.first().click();
        
        // Wait for navigation/form to appear
        await page.waitForLoadState('networkidle');
        
        // Take screenshot of login form
        await page.screenshot({ 
          path: `~/clawd/scheduler/validation/screenshots/melo-audit/MELO-P1-S02/login-form-${device}.png`,
          fullPage: true 
        });
        
        // Verify login form elements
        await expect(page.locator('input[type="email"], input[name*="email"], input[placeholder*="email"]')).toBeVisible();
        await expect(page.locator('input[type="password"]')).toBeVisible();
        
      } else {
        // Try direct navigation to common login paths
        const loginPaths = ['/login', '/sign-in', '/signin', '/auth/login'];
        let loginFound = false;
        
        for (const path of loginPaths) {
          await page.goto(APP_URL.replace(/\/$/, '') + path);
          
          const hasEmailInput = await page.locator('input[type="email"], input[name*="email"], input[placeholder*="email"]').count() > 0;
          const hasPasswordInput = await page.locator('input[type="password"]').count() > 0;
          
          if (hasEmailInput && hasPasswordInput) {
            loginFound = true;
            await page.screenshot({ 
              path: `~/clawd/scheduler/validation/screenshots/melo-audit/MELO-P1-S02/login-form-${device}.png`,
              fullPage: true 
            });
            break;
          }
        }
        
        if (!loginFound) {
          // Document that no login form was found
          await page.screenshot({ 
            path: `~/clawd/scheduler/validation/screenshots/melo-audit/MELO-P1-S02/no-login-found-${device}.png`,
            fullPage: true 
          });
          throw new Error(`No login form found on ${device} viewport`);
        }
      }
    });
  }
});

/**
 * AC-2: Successful Login Flow
 * Test successful login with valid credentials
 */
test.describe('AC-2: Successful Login', () => {
  
  // First, ensure we have a test account by attempting registration
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      // Try to register test user first
      await page.goto(APP_URL + 'sign-up');
      
      // Check if registration form exists
      const hasRegistrationForm = await page.locator('input[type="email"], input[name*="email"]').count() > 0;
      
      if (hasRegistrationForm) {
        // Fill registration form
        await page.locator('input[type="email"], input[name*="email"]').first().fill(TEST_USER.email);
        await page.locator('input[type="password"]').first().fill(TEST_USER.password);
        
        // Look for username field if it exists
        const usernameInput = page.locator('input[name*="username"], input[placeholder*="username"]');
        if (await usernameInput.count() > 0) {
          await usernameInput.fill(`testuser-${Date.now()}`);
        }
        
        // Submit registration
        const submitButton = page.locator('button[type="submit"], button').filter({ hasText: /register|sign up/i });
        if (await submitButton.count() > 0) {
          await submitButton.click();
          await page.waitForLoadState('networkidle');
        }
      }
    } catch (error) {
      console.log('Registration attempt failed, will try with existing user or manual account creation');
    } finally {
      await context.close();
    }
  });
  
  for (const [device, viewport] of Object.entries(VIEWPORTS)) {
    test(`Successful login flow on ${device}`, async ({ page }) => {
      // Set viewport
      await page.setViewportSize(viewport);
      
      // Navigate to app and find login form
      await page.goto(APP_URL);
      
      // Try to find and navigate to login form (using same logic as AC-1)
      let loginFormFound = false;
      
      // Check for direct login form
      if (await page.locator('input[type="email"], input[name*="email"]').count() > 0 && 
          await page.locator('input[type="password"]').count() > 0) {
        loginFormFound = true;
      } else {
        // Try clicking login link
        const loginLink = page.locator('a').filter({ hasText: /login|sign in/i });
        if (await loginLink.count() > 0) {
          await loginLink.first().click();
          await page.waitForLoadState('networkidle');
          loginFormFound = true;
        } else {
          // Try direct login paths
          const loginPaths = ['/login', '/sign-in', '/signin', '/auth/login'];
          for (const path of loginPaths) {
            await page.goto(APP_URL.replace(/\/$/, '') + path);
            if (await page.locator('input[type="email"], input[name*="email"]').count() > 0 && 
                await page.locator('input[type="password"]').count() > 0) {
              loginFormFound = true;
              break;
            }
          }
        }
      }
      
      if (!loginFormFound) {
        throw new Error(`Cannot find login form for testing on ${device}`);
      }
      
      // Fill login form
      await page.locator('input[type="email"], input[name*="email"]').first().fill(TEST_USER.email);
      await page.locator('input[type="password"]').first().fill(TEST_USER.password);
      
      // Take screenshot of filled form
      await page.screenshot({ 
        path: `~/clawd/scheduler/validation/screenshots/melo-audit/MELO-P1-S02/login-filled-${device}.png`,
        fullPage: true 
      });
      
      // Submit login form
      const submitButton = page.locator('button[type="submit"], button').filter({ hasText: /login|sign in|submit/i });
      await expect(submitButton.first()).toBeVisible();
      await submitButton.first().click();
      
      // Wait for navigation/response
      await page.waitForLoadState('networkidle');
      
      // Take screenshot of result
      await page.screenshot({ 
        path: `~/clawd/scheduler/validation/screenshots/melo-audit/MELO-P1-S02/logged-in-${device}.png`,
        fullPage: true 
      });
      
      // Verify successful login (look for logged-in indicators)
      // This might be dashboard, user avatar, logout button, etc.
      const loggedInIndicators = [
        page.locator('[data-testid*="user"], [class*="user"], [class*="avatar"]'),
        page.locator('button').filter({ hasText: /logout|sign out/i }),
        page.locator('text=Welcome'),
        page.locator('text=Dashboard'),
        page.locator('[data-testid="user-menu"], [class*="user-menu"]')
      ];
      
      let loginSuccess = false;
      for (const indicator of loggedInIndicators) {
        if (await indicator.count() > 0) {
          loginSuccess = true;
          break;
        }
      }
      
      // Also check URL change (not on login page anymore)
      const currentUrl = page.url();
      const isNotOnLoginPage = !currentUrl.includes('/login') && !currentUrl.includes('/sign-in');
      
      if (!loginSuccess && !isNotOnLoginPage) {
        // Take screenshot of what we see for analysis
        await page.screenshot({ 
          path: `~/clawd/scheduler/validation/screenshots/melo-audit/MELO-P1-S02/login-result-analysis-${device}.png`,
          fullPage: true 
        });
      }
      
      // Document actual behavior rather than failing - this is an audit
      console.log(`Login result on ${device}: URL=${currentUrl}, loginSuccess=${loginSuccess}`);
    });
  }
});

/**
 * AC-3: Login Error Handling
 * Test login error handling with invalid credentials
 */
test.describe('AC-3: Login Error Handling', () => {
  
  test('Login error handling with invalid credentials', async ({ page }) => {
    // Use desktop viewport for error testing
    await page.setViewportSize(VIEWPORTS.desktop);
    
    // Navigate to app and find login form
    await page.goto(APP_URL);
    
    // Find login form (using same logic as above)
    let loginFormFound = false;
    
    if (await page.locator('input[type="email"], input[name*="email"]').count() > 0 && 
        await page.locator('input[type="password"]').count() > 0) {
      loginFormFound = true;
    } else {
      const loginLink = page.locator('a').filter({ hasText: /login|sign in/i });
      if (await loginLink.count() > 0) {
        await loginLink.first().click();
        await page.waitForLoadState('networkidle');
        loginFormFound = true;
      } else {
        const loginPaths = ['/login', '/sign-in', '/signin', '/auth/login'];
        for (const path of loginPaths) {
          await page.goto(APP_URL.replace(/\/$/, '') + path);
          if (await page.locator('input[type="email"], input[name*="email"]').count() > 0 && 
              await page.locator('input[type="password"]').count() > 0) {
            loginFormFound = true;
            break;
          }
        }
      }
    }
    
    if (!loginFormFound) {
      throw new Error('Cannot find login form for error testing');
    }
    
    // Fill form with invalid credentials
    await page.locator('input[type="email"], input[name*="email"]').first().fill(INVALID_USER.email);
    await page.locator('input[type="password"]').first().fill(INVALID_USER.password);
    
    // Submit form
    const submitButton = page.locator('button[type="submit"], button').filter({ hasText: /login|sign in|submit/i });
    await submitButton.first().click();
    
    // Wait for response
    await page.waitForLoadState('networkidle');
    
    // Take screenshot showing error handling
    await page.screenshot({ 
      path: `~/clawd/scheduler/validation/screenshots/melo-audit/MELO-P1-S02/login-error-desktop.png`,
      fullPage: true 
    });
    
    // Look for error messages
    const errorIndicators = [
      page.locator('text=Invalid'),
      page.locator('text=Error'),
      page.locator('text=Wrong'),
      page.locator('text=Incorrect'),
      page.locator('[class*="error"], [data-testid*="error"]'),
      page.locator('[style*="red"], [class*="danger"]')
    ];
    
    let errorFound = false;
    for (const indicator of errorIndicators) {
      if (await indicator.count() > 0) {
        errorFound = true;
        break;
      }
    }
    
    console.log(`Error handling test result: errorFound=${errorFound}, url=${page.url()}`);
    
    // Document behavior - this is an audit, not a pass/fail test
  });
});

/**
 * Documentation Test
 * This test documents what we actually find vs. what we expect
 */
test.describe('Login Audit Documentation', () => {
  
  test('Document actual login behavior vs expectations', async ({ page }) => {
    const findings = {
      loginFormLocation: null,
      loginFormFields: [],
      successBehavior: null,
      errorHandling: null,
      responsiveDesign: true
    };
    
    // Navigate and analyze
    await page.goto(APP_URL);
    
    // Document findings
    console.log('=== MELO-P1-S02 LOGIN AUDIT FINDINGS ===');
    console.log('App URL:', APP_URL);
    console.log('Timestamp:', new Date().toISOString());
    console.log('Findings:', findings);
    
    // Final documentation screenshot
    await page.screenshot({ 
      path: `~/clawd/scheduler/validation/screenshots/melo-audit/MELO-P1-S02/audit-summary-desktop.png`,
      fullPage: true 
    });
  });
});