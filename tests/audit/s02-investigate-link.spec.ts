/**
 * Investigate the "Sign in here" link href
 */

import { test, expect } from '@playwright/test';

const APP_URL = 'http://dev2.aaroncollins.info:3000/';

test('Investigate sign in link href', async ({ page }) => {
  console.log('=== INVESTIGATING SIGN IN LINK ===');
  
  // Navigate to sign-up page
  await page.goto(APP_URL + 'sign-up');
  await page.waitForLoadState('networkidle');
  
  // Find the "Sign in here" link
  const signinLink = page.locator('a').filter({ hasText: /sign in here/i });
  const signinLinkCount = await signinLink.count();
  
  console.log(`Found ${signinLinkCount} "Sign in here" links`);
  
  if (signinLinkCount > 0) {
    // Get the href attribute
    const href = await signinLink.first().getAttribute('href');
    console.log('Sign in link href:', href);
    
    // Get the text content
    const text = await signinLink.first().textContent();
    console.log('Sign in link text:', text);
    
    // Try to construct a proper URL if the href is relative
    if (href) {
      let fullUrl;
      if (href.startsWith('/')) {
        fullUrl = APP_URL.replace(/\/$/, '') + href;
      } else if (href.startsWith('http')) {
        fullUrl = href;
      } else {
        fullUrl = new URL(href, APP_URL).href;
      }
      
      console.log('Constructed full URL:', fullUrl);
      
      // Try navigating to the constructed URL directly
      try {
        await page.goto(fullUrl);
        await page.waitForLoadState('networkidle');
        
        console.log('Direct navigation successful, URL:', page.url());
        
        // Take screenshot
        await page.screenshot({ 
          path: 'scheduler/validation/screenshots/melo-audit/MELO-P1-S02/direct-signin-page.png',
          fullPage: true 
        });
        
        // Check for login form
        const emailInputs = await page.locator('input[type="email"], input[name*="email"], input[placeholder*="email"], input[name*="username"], input[placeholder*="username"]').count();
        const passwordInputs = await page.locator('input[type="password"]').count();
        
        console.log('Login form elements on direct navigation:');
        console.log('- Email/username inputs:', emailInputs);
        console.log('- Password inputs:', passwordInputs);
        
      } catch (error) {
        console.log('Direct navigation failed:', error.message);
      }
    }
    
    // Try some common login paths manually
    const loginPaths = ['/login', '/signin', '/sign-in', '/auth', '/auth/login', '/login.html'];
    
    console.log('\\nTrying common login paths...');
    
    for (const path of loginPaths) {
      try {
        const testUrl = APP_URL.replace(/\/$/, '') + path;
        await page.goto(testUrl);
        await page.waitForLoadState('networkidle');
        
        const emailInputs = await page.locator('input[type="email"], input[name*="email"], input[placeholder*="email"], input[name*="username"], input[placeholder*="username"]').count();
        const passwordInputs = await page.locator('input[type="password"]').count();
        
        console.log(`${path}: email/username inputs: ${emailInputs}, password inputs: ${passwordInputs}`);
        
        if (emailInputs > 0 && passwordInputs > 0) {
          console.log(`✅ FOUND LOGIN FORM AT ${path}!`);
          await page.screenshot({ 
            path: `scheduler/validation/screenshots/melo-audit/MELO-P1-S02/login-found-${path.replace('/', '')}.png`,
            fullPage: true 
          });
        }
      } catch (error) {
        console.log(`${path}: Navigation failed`);
      }
    }
    
  } else {
    console.log('❌ No "Sign in here" link found');
  }
  
  console.log('\\n=== INVESTIGATION COMPLETE ===');
});