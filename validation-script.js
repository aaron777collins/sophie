const { chromium } = require('playwright');
const fs = require('fs');

async function validateLogout() {
  console.log('🔍 Starting BDV2 Logout Validation...\n');
  
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Step 1: Navigate to the application
    console.log('📁 Step 1: Navigating to https://dev2.aaroncollins.info/bdv2');
    await page.goto('https://dev2.aaroncollins.info/bdv2');
    await page.screenshot({ path: '1-initial-page.png' });
    console.log('✅ Screenshot saved: 1-initial-page.png');
    
    // Step 2: Fill login credentials
    console.log('\n🔐 Step 2: Logging in with test credentials');
    
    // Look for username field
    const usernameField = page.locator('input[placeholder*="username"], input[type="text"]').first();
    await usernameField.fill('aaron');
    console.log('✅ Username filled');
    
    // Look for password field
    const passwordField = page.locator('input[placeholder*="password"], input[type="password"]').first();
    await passwordField.fill('correctpassword');
    console.log('✅ Password filled');
    
    await page.screenshot({ path: '2-login-form-filled.png' });
    console.log('✅ Screenshot saved: 2-login-form-filled.png');
    
    // Step 3: Click login button
    console.log('\n🚪 Step 3: Clicking Sign In button');
    const loginButton = page.locator('button:has-text("Sign In")');
    await loginButton.click();
    
    // Wait for navigation or response
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    console.log('🌐 Current URL after login:', currentUrl);
    
    await page.screenshot({ path: '3-after-login.png' });
    console.log('✅ Screenshot saved: 3-after-login.png');
    
    // Step 4: Look for logout button/link
    console.log('\n🔍 Step 4: Looking for logout button');
    
    // Common logout selectors
    const logoutSelectors = [
      'button:has-text("Logout")',
      'button:has-text("Sign Out")',
      'a:has-text("Logout")',
      'a:has-text("Sign Out")',
      '[data-testid="logout"]',
      '.logout',
      '#logout'
    ];
    
    let logoutElement = null;
    for (const selector of logoutSelectors) {
      try {
        logoutElement = page.locator(selector).first();
        if (await logoutElement.isVisible({ timeout: 1000 })) {
          console.log('✅ Found logout element with selector:', selector);
          break;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (!logoutElement || !(await logoutElement.isVisible())) {
      console.log('❌ No logout button found. Current page content:');
      const pageText = await page.textContent('body');
      console.log(pageText.substring(0, 500) + '...');
      await page.screenshot({ path: '4-no-logout-found.png' });
      throw new Error('Logout button not found');
    }
    
    // Step 5: Click logout
    console.log('\n🚪 Step 5: Clicking logout button');
    await logoutElement.click();
    
    // Wait for potential redirect
    await page.waitForTimeout(2000);
    
    const urlAfterLogout = page.url();
    console.log('🌐 URL after logout:', urlAfterLogout);
    
    await page.screenshot({ path: '5-after-logout.png' });
    console.log('✅ Screenshot saved: 5-after-logout.png');
    
    // Step 6: Check for success message
    console.log('\n📝 Step 6: Checking for success message');
    const pageContent = await page.textContent('body');
    const hasSuccessMessage = pageContent.includes('You have been signed out successfully');
    console.log('📧 Success message present:', hasSuccessMessage);
    
    // Step 7: Check if redirected to login page
    console.log('\n🔄 Step 7: Checking redirect to login');
    const isOnLoginPage = urlAfterLogout.includes('/login') || urlAfterLogout.includes('bdv2') && pageContent.includes('Sign in');
    console.log('📍 Redirected to login page:', isOnLoginPage);
    
    // Step 8: Try to access a protected route
    console.log('\n🔐 Step 8: Testing protected route access');
    try {
      await page.goto(urlAfterLogout.replace(/\/(login)?$/, '/dashboard'));
      await page.waitForTimeout(2000);
      
      const protectedUrl = page.url();
      const protectedContent = await page.textContent('body');
      
      console.log('🌐 Protected route URL:', protectedUrl);
      const stillProtected = protectedUrl.includes('/login') || protectedContent.includes('Sign in');
      console.log('🛡️  Protected route access denied:', stillProtected);
      
      await page.screenshot({ path: '6-protected-route-test.png' });
      console.log('✅ Screenshot saved: 6-protected-route-test.png');
      
      return {
        loginSuccessful: !currentUrl.includes('/login'),
        logoutButtonFound: true,
        redirectedToLogin: isOnLoginPage,
        successMessage: hasSuccessMessage,
        protectedRouteBlocked: stillProtected,
        screenshots: ['1-initial-page.png', '2-login-form-filled.png', '3-after-login.png', '5-after-logout.png', '6-protected-route-test.png']
      };
      
    } catch (error) {
      console.log('❌ Error testing protected route:', error.message);
      return {
        loginSuccessful: false,
        logoutButtonFound: false,
        redirectedToLogin: false,
        successMessage: false,
        protectedRouteBlocked: false,
        error: error.message,
        screenshots: ['1-initial-page.png', '2-login-form-filled.png', '3-after-login.png']
      };
    }
    
  } catch (error) {
    console.log('❌ Validation failed:', error.message);
    await page.screenshot({ path: 'error-state.png' });
    return {
      loginSuccessful: false,
      logoutButtonFound: false,
      redirectedToLogin: false,
      successMessage: false,
      protectedRouteBlocked: false,
      error: error.message,
      screenshots: ['error-state.png']
    };
  } finally {
    await browser.close();
  }
}

validateLogout().then(results => {
  console.log('\n🏁 VALIDATION RESULTS:');
  console.log('='.repeat(50));
  console.log('Login successful:', results.loginSuccessful ? '✅' : '❌');
  console.log('Logout button found:', results.logoutButtonFound ? '✅' : '❌');
  console.log('Redirected to login:', results.redirectedToLogin ? '✅' : '❌');
  console.log('Success message shown:', results.successMessage ? '✅' : '❌');
  console.log('Protected route blocked:', results.protectedRouteBlocked ? '✅' : '❌');
  
  if (results.error) {
    console.log('Error:', results.error);
  }
  
  console.log('\n📸 Screenshots taken:');
  results.screenshots.forEach(screenshot => {
    console.log('  -', screenshot);
  });
}).catch(console.error);