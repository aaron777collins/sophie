/**
 * MELO-P1-S02: Simple Login Audit
 * 
 * Simplified test to understand the actual app interface
 */

import { test, expect } from '@playwright/test';

const APP_URL = 'http://dev2.aaroncollins.info:3000/';

test('Explore Melo app interface after loading', async ({ page }) => {
  // Set viewport to desktop
  await page.setViewportSize({ width: 1920, height: 1080 });
  
  // Navigate to app
  await page.goto(APP_URL);
  
  // Take screenshot of initial state
  await page.screenshot({ 
    path: 'scheduler/validation/screenshots/melo-audit/MELO-P1-S02/initial-load-desktop.png',
    fullPage: true 
  });
  
  console.log('Initial URL:', page.url());
  console.log('Initial title:', await page.title());
  
  // Wait for loading to complete - wait for "Loading..." to disappear
  console.log('Waiting for loading to complete...');
  
  try {
    // Wait for loading text to disappear
    await page.waitForSelector('text=Loading...', { state: 'hidden', timeout: 15000 });
    console.log('Loading text disappeared');
  } catch (error) {
    console.log('Loading text did not disappear, continuing...');
  }
  
  // Wait a bit more for any additional rendering
  await page.waitForTimeout(3000);
  
  // Take screenshot after loading
  await page.screenshot({ 
    path: 'scheduler/validation/screenshots/melo-audit/MELO-P1-S02/after-loading-desktop.png',
    fullPage: true 
  });
  
  console.log('After loading URL:', page.url());
  
  // Check what's actually on the page
  const bodyText = await page.locator('body').textContent();
  console.log('Page content preview:', bodyText?.substring(0, 500));
  
  // Look for common login/auth patterns
  const emailInputs = await page.locator('input[type="email"], input[name*="email"], input[placeholder*="email"]').count();
  const passwordInputs = await page.locator('input[type="password"]').count();
  const loginButtons = await page.locator('button').filter({ hasText: /login|sign in/i }).count();
  const loginLinks = await page.locator('a').filter({ hasText: /login|sign in/i }).count();
  const signupLinks = await page.locator('a').filter({ hasText: /register|sign up/i }).count();
  
  console.log('Elements found:');
  console.log('- Email inputs:', emailInputs);
  console.log('- Password inputs:', passwordInputs);
  console.log('- Login buttons:', loginButtons);
  console.log('- Login links:', loginLinks);
  console.log('- Signup links:', signupLinks);
  
  // Check for registration page at /sign-up (from S01 findings)
  console.log('\\nChecking registration page at /sign-up...');
  await page.goto(APP_URL + 'sign-up');
  
  await page.screenshot({ 
    path: 'scheduler/validation/screenshots/melo-audit/MELO-P1-S02/signup-page-desktop.png',
    fullPage: true 
  });
  
  const signupEmailInputs = await page.locator('input[type="email"], input[name*="email"], input[placeholder*="email"]').count();
  const signupPasswordInputs = await page.locator('input[type="password"]').count();
  
  console.log('Sign-up page elements:');
  console.log('- Email inputs:', signupEmailInputs);
  console.log('- Password inputs:', signupPasswordInputs);
  console.log('- URL:', page.url());
  
  // Check for login page at common paths
  const loginPaths = ['/login', '/sign-in', '/signin', '/auth/login'];
  
  for (const path of loginPaths) {
    console.log(`\\nChecking login page at ${path}...`);
    await page.goto(APP_URL.replace(/\/$/, '') + path);
    
    const pathEmailInputs = await page.locator('input[type="email"], input[name*="email"], input[placeholder*="email"]').count();
    const pathPasswordInputs = await page.locator('input[type="password"]').count();
    
    if (pathEmailInputs > 0 && pathPasswordInputs > 0) {
      console.log(`Found login form at ${path}!`);
      await page.screenshot({ 
        path: `scheduler/validation/screenshots/melo-audit/MELO-P1-S02/login-found-${path.replace('/', '')}-desktop.png`,
        fullPage: true 
      });
    } else {
      console.log(`No login form at ${path} (email: ${pathEmailInputs}, password: ${pathPasswordInputs})`);
    }
  }
  
  // Final summary
  console.log('\\n=== LOGIN AUDIT EXPLORATION COMPLETE ===');
});