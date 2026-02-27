/**
 * MELO-P1-S02: Login via Sign-up page link
 * 
 * Follow the "Sign in here" link from registration page
 */

import { test, expect } from '@playwright/test';

const APP_URL = 'http://dev2.aaroncollins.info:3000/';

// Test credentials for login testing
const TEST_USER = {
  email: `testuser-${Date.now()}@example.com`,
  username: `testuser-${Date.now()}`,
  password: 'TestPass123!'
};

const INVALID_USER = {
  email: 'invalid@example.com', 
  username: 'invalid-user',
  password: 'wrongpassword'
};

// Viewport configurations
const VIEWPORTS = {
  desktop: { width: 1920, height: 1080 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 }
};

test('Find and test login interface via signup link', async ({ page }) => {
  console.log('=== EXPLORING LOGIN VIA SIGNUP LINK ===');
  
  // Navigate to sign-up page where we saw the "Sign in here" link
  await page.goto(APP_URL + 'sign-up');
  
  // Wait for page to load
  await page.waitForLoadState('networkidle');
  
  console.log('On sign-up page, looking for "Sign in here" link...');
  
  // Look for the "Sign in here" link
  const signinLink = page.locator('a').filter({ hasText: /sign in here/i });
  const signinLinkCount = await signinLink.count();
  
  console.log(`Found ${signinLinkCount} "Sign in here" links`);
  
  if (signinLinkCount > 0) {
    // Click the sign in link
    console.log('Clicking "Sign in here" link...');
    await signinLink.first().click();
    
    // Wait for navigation
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('After clicking sign in link, URL:', page.url());
    
    // Take screenshot at desktop resolution
    await page.setViewportSize(VIEWPORTS.desktop);
    await page.screenshot({ 
      path: 'scheduler/validation/screenshots/melo-audit/MELO-P1-S02/login-form-desktop.png',
      fullPage: true 
    });
    
    // Check for login form elements
    const emailInputs = await page.locator('input[type="email"], input[name*="email"], input[placeholder*="email"], input[name*="username"], input[placeholder*="username"]').count();
    const passwordInputs = await page.locator('input[type="password"]').count();
    const loginButtons = await page.locator('button').filter({ hasText: /login|sign in|submit/i }).count();
    
    console.log('Login form elements found:');
    console.log('- Email/username inputs:', emailInputs);
    console.log('- Password inputs:', passwordInputs);
    console.log('- Login buttons:', loginButtons);
    
    if (emailInputs > 0 && passwordInputs > 0) {
      console.log('✅ LOGIN FORM FOUND!');
      
      // Capture screenshots at all viewport sizes for AC-1
      for (const [device, viewport] of Object.entries(VIEWPORTS)) {
        await page.setViewportSize(viewport);
        await page.screenshot({ 
          path: `scheduler/validation/screenshots/melo-audit/MELO-P1-S02/login-form-${device}.png`,
          fullPage: true 
        });
        console.log(`📸 Captured login form screenshot for ${device}`);
      }
      
      // Test successful login (AC-2)
      console.log('\\n=== TESTING SUCCESSFUL LOGIN (AC-2) ===');
      
      // First, create a test account
      console.log('Creating test account first...');
      await page.goto(APP_URL + 'sign-up');
      await page.waitForLoadState('networkidle');
      
      // Fill registration form
      await page.locator('input[name*="username"], input[placeholder*="username"]').first().fill(TEST_USER.username);
      
      const emailInput = page.locator('input[type="email"], input[name*="email"], input[placeholder*="email"]');
      if (await emailInput.count() > 0) {
        await emailInput.first().fill(TEST_USER.email);
      }
      
      const passwordInputs = page.locator('input[type="password"]');
      if (await passwordInputs.count() >= 2) {
        await passwordInputs.first().fill(TEST_USER.password); // Password
        await passwordInputs.nth(1).fill(TEST_USER.password);  // Confirm password
      }
      
      // Submit registration
      const createButton = page.locator('button').filter({ hasText: /create|register|sign up/i });
      if (await createButton.count() > 0) {
        await createButton.first().click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        
        console.log('Account creation attempted, URL:', page.url());
        
        // Take screenshot after registration attempt
        await page.screenshot({ 
          path: 'scheduler/validation/screenshots/melo-audit/MELO-P1-S02/after-registration-desktop.png',
          fullPage: true 
        });
      }
      
      // Now try to login
      console.log('\\nTesting login with created account...');
      
      // Go back to sign-up page and click sign in link again
      await page.goto(APP_URL + 'sign-up');
      await page.waitForLoadState('networkidle');
      
      const signinLinkAgain = page.locator('a').filter({ hasText: /sign in here/i });
      if (await signinLinkAgain.count() > 0) {
        await signinLinkAgain.first().click();
        await page.waitForLoadState('networkidle');
        
        // Test at all viewport sizes
        for (const [device, viewport] of Object.entries(VIEWPORTS)) {
          console.log(`\\nTesting login on ${device}...`);
          await page.setViewportSize(viewport);
          
          // Fill login form
          const loginUsernameInput = page.locator('input[type="email"], input[name*="email"], input[placeholder*="email"], input[name*="username"], input[placeholder*="username"]');
          const loginPasswordInput = page.locator('input[type="password"]');
          
          if (await loginUsernameInput.count() > 0 && await loginPasswordInput.count() > 0) {
            // Try both username and email
            await loginUsernameInput.first().fill(TEST_USER.username);
            await loginPasswordInput.first().fill(TEST_USER.password);
            
            // Take screenshot before submit
            await page.screenshot({ 
              path: `scheduler/validation/screenshots/melo-audit/MELO-P1-S02/login-filled-${device}.png`,
              fullPage: true 
            });
            
            // Submit login
            const submitButton = page.locator('button').filter({ hasText: /login|sign in|submit/i });
            if (await submitButton.count() > 0) {
              await submitButton.first().click();
              await page.waitForLoadState('networkidle');
              await page.waitForTimeout(3000);
              
              // Take screenshot after login attempt
              await page.screenshot({ 
                path: `scheduler/validation/screenshots/melo-audit/MELO-P1-S02/logged-in-${device}.png`,
                fullPage: true 
              });
              
              console.log(`Login result on ${device}, URL: ${page.url()}`);
            }
          }
        }
        
        // Test error handling (AC-3)
        console.log('\\n=== TESTING LOGIN ERROR HANDLING (AC-3) ===');
        
        // Go back to login form
        await page.goto(APP_URL + 'sign-up');
        await page.waitForLoadState('networkidle');
        
        const signinLinkError = page.locator('a').filter({ hasText: /sign in here/i });
        if (await signinLinkError.count() > 0) {
          await signinLinkError.first().click();
          await page.waitForLoadState('networkidle');
          
          // Set desktop viewport for error testing
          await page.setViewportSize(VIEWPORTS.desktop);
          
          // Fill with invalid credentials
          const errorUsernameInput = page.locator('input[type="email"], input[name*="email"], input[placeholder*="email"], input[name*="username"], input[placeholder*="username"]');
          const errorPasswordInput = page.locator('input[type="password"]');
          
          if (await errorUsernameInput.count() > 0 && await errorPasswordInput.count() > 0) {
            await errorUsernameInput.first().fill(INVALID_USER.username);
            await errorPasswordInput.first().fill(INVALID_USER.password);
            
            // Submit with invalid credentials
            const errorSubmitButton = page.locator('button').filter({ hasText: /login|sign in|submit/i });
            if (await errorSubmitButton.count() > 0) {
              await errorSubmitButton.first().click();
              await page.waitForLoadState('networkidle');
              await page.waitForTimeout(2000);
              
              // Take screenshot showing error handling
              await page.screenshot({ 
                path: 'scheduler/validation/screenshots/melo-audit/MELO-P1-S02/login-error-desktop.png',
                fullPage: true 
              });
              
              console.log('Error handling test completed, URL:', page.url());
            }
          }
        }
      }
    } else {
      console.log('❌ No login form found after clicking "Sign in here"');
      
      // Take screenshot of what we see
      await page.screenshot({ 
        path: 'scheduler/validation/screenshots/melo-audit/MELO-P1-S02/no-login-after-signin-click.png',
        fullPage: true 
      });
    }
    
  } else {
    console.log('❌ "Sign in here" link not found on signup page');
  }
  
  console.log('\\n=== LOGIN AUDIT COMPLETE ===');
});