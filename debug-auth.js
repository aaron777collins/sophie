const { chromium } = require('@playwright/test');

async function debugAuth() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  try {
    console.log('🔍 Starting auth debug...');
    
    // Go to login page
    console.log('🔍 Navigating to login page...');
    await page.goto('http://localhost:3001/login');
    await page.waitForTimeout(2000);
    
    // Take screenshot of login page
    await page.screenshot({ path: 'scheduler/validation/screenshots/clawd-zsk/desktop/01-login-page.png', fullPage: true });
    console.log('📸 Screenshot: Login page');

    // Check if form elements are present
    const usernameInput = await page.locator('[data-testid="username-input"]');
    const passwordInput = await page.locator('[data-testid="password-input"]');
    const loginButton = await page.locator('[data-testid="login-button"]');
    
    console.log('🔍 Username input visible:', await usernameInput.isVisible());
    console.log('🔍 Password input visible:', await passwordInput.isVisible());
    console.log('🔍 Login button visible:', await loginButton.isVisible());

    // Fill in credentials
    console.log('🔍 Filling credentials...');
    await usernameInput.fill('demo');
    await passwordInput.fill('demo');
    
    // Take screenshot before submit
    await page.screenshot({ path: 'scheduler/validation/screenshots/clawd-zsk/desktop/02-before-submit.png', fullPage: true });
    console.log('📸 Screenshot: Before submit');

    // Click login button
    console.log('🔍 Clicking login button...');
    await loginButton.click();
    
    // Wait and see what happens
    await page.waitForTimeout(5000);
    
    // Take screenshot after submit
    await page.screenshot({ path: 'scheduler/validation/screenshots/clawd-zsk/desktop/03-after-submit.png', fullPage: true });
    console.log('📸 Screenshot: After submit');
    
    console.log('🔍 Current URL:', page.url());
    console.log('🔍 Page title:', await page.title());
    
    // Check if we're on dashboard
    if (page.url().includes('/dashboard')) {
      console.log('✅ Successfully redirected to dashboard');
      await page.screenshot({ path: 'scheduler/validation/screenshots/clawd-zsk/desktop/04-dashboard.png', fullPage: true });
    } else {
      console.log('❌ Not on dashboard page');
      
      // Check for error messages
      const errorMessage = await page.locator('[data-testid="error-message"]').textContent().catch(() => null);
      if (errorMessage) {
        console.log('🚨 Error message:', errorMessage);
      }
      
      // Check for loading states
      const isLoading = await page.locator('text=Loading').isVisible().catch(() => false);
      if (isLoading) {
        console.log('⏳ Page is still loading');
      }
    }

  } catch (error) {
    console.error('🚨 Debug error:', error);
    await page.screenshot({ path: 'scheduler/validation/screenshots/clawd-zsk/desktop/99-error.png', fullPage: true });
  } finally {
    await browser.close();
  }
}

debugAuth();