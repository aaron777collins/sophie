// Simple BDV2 logout validation using Playwright
const playwright = require('playwright');

async function simpleValidation() {
  console.log('🔍 Starting BDV2 Logout Validation (Simple Version)...\n');
  
  let browser;
  try {
    // Launch browser
    browser = await playwright.chromium.launch({ 
      headless: false,
      executablePath: '/usr/bin/google-chrome-stable'
    });
    
    const page = await browser.newPage();
    
    // Step 1: Go to login page
    console.log('Step 1: Navigate to BDV2');
    await page.goto('https://dev2.aaroncollins.info/bdv2');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'step1-navigate.png' });
    console.log('✅ Navigation complete');
    
    // Step 2: Login
    console.log('\nStep 2: Login with test credentials');
    await page.waitForSelector('input[placeholder*="username"]');
    await page.fill('input[placeholder*="username"]', 'aaron');
    await page.fill('input[placeholder*="password"]', 'correctpassword');
    await page.screenshot({ path: 'step2-filled-form.png' });
    await page.click('button:has-text("Sign In")');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'step3-after-login.png' });
    
    const currentUrl = page.url();
    console.log('✅ Login attempt complete, URL:', currentUrl);
    
    // Step 3: Look for logout button
    console.log('\nStep 3: Looking for logout button');
    const pageContent = await page.textContent('body');
    console.log('Page content preview:', pageContent.substring(0, 200) + '...');
    
    // Try different logout selectors
    const selectors = [
      'button:has-text("Logout")',
      'button:has-text("Sign Out")', 
      'button:has-text("Log Out")',
      'a:has-text("Logout")',
      'a:has-text("Sign Out")',
    ];
    
    let found = false;
    for (const selector of selectors) {
      try {
        const element = page.locator(selector);
        if (await element.isVisible({ timeout: 1000 })) {
          console.log('✅ Found logout element:', selector);
          
          // Click logout
          await element.click();
          await page.waitForLoadState('networkidle');
          await page.screenshot({ path: 'step4-after-logout.png' });
          
          const logoutUrl = page.url();
          const logoutContent = await page.textContent('body');
          
          console.log('✅ Logout clicked, URL:', logoutUrl);
          console.log('✅ Success message check:', logoutContent.includes('signed out successfully'));
          console.log('✅ Redirected to login:', logoutUrl.includes('/login') || logoutContent.includes('Sign in'));
          
          found = true;
          break;
        }
      } catch (e) {
        // Continue
      }
    }
    
    if (!found) {
      console.log('❌ No logout button found');
      // Get all clickable elements for debugging
      const clickables = await page.locator('button, a').allTextContents();
      console.log('Available clickable elements:', clickables);
    }
    
    console.log('\n✅ Validation complete');
    
  } catch (error) {
    console.error('❌ Error during validation:', error.message);
    if (browser) {
      const page = await browser.newPage();
      await page.screenshot({ path: 'error-screenshot.png' });
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

simpleValidation();