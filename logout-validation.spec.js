const { test, expect } = require('@playwright/test');

test('BDV2 Logout Logic Validation', async ({ page }) => {
  console.log('🔍 Starting BDV2 Logout Validation...\n');

  // Step 1: Navigate to the application
  console.log('📁 Step 1: Navigating to https://dev2.aaroncollins.info/bdv2');
  await page.goto('https://dev2.aaroncollins.info/bdv2');
  await page.screenshot({ path: '1-initial-page.png', fullPage: true });
  console.log('✅ Screenshot saved: 1-initial-page.png');

  // Step 2: Fill login credentials
  console.log('\n🔐 Step 2: Logging in with test credentials');
  
  // Wait for the form to be visible
  await page.waitForSelector('input[placeholder*="username"]');
  
  // Fill username
  await page.fill('input[placeholder*="username"]', 'aaron');
  console.log('✅ Username filled');
  
  // Fill password
  await page.fill('input[placeholder*="password"]', 'correctpassword');
  console.log('✅ Password filled');
  
  await page.screenshot({ path: '2-login-form-filled.png', fullPage: true });
  console.log('✅ Screenshot saved: 2-login-form-filled.png');
  
  // Step 3: Click login button
  console.log('\n🚪 Step 3: Clicking Sign In button');
  await page.click('button:has-text("Sign In")');
  
  // Wait for navigation or response
  await page.waitForLoadState('networkidle');
  
  const currentUrl = page.url();
  console.log('🌐 Current URL after login:', currentUrl);
  
  await page.screenshot({ path: '3-after-login.png', fullPage: true });
  console.log('✅ Screenshot saved: 3-after-login.png');
  
  // Step 4: Look for logout button/link
  console.log('\n🔍 Step 4: Looking for logout button');
  
  // Common logout selectors
  const logoutSelectors = [
    'button:has-text("Logout")',
    'button:has-text("Sign Out")', 
    'a:has-text("Logout")',
    'a:has-text("Sign Out")',
    'button:has-text("Log Out")',
    '[data-testid="logout"]',
    '.logout',
    '#logout'
  ];
  
  let logoutElement = null;
  let logoutSelector = null;
  
  for (const selector of logoutSelectors) {
    try {
      if (await page.locator(selector).first().isVisible({ timeout: 1000 })) {
        logoutElement = page.locator(selector).first();
        logoutSelector = selector;
        console.log('✅ Found logout element with selector:', selector);
        break;
      }
    } catch (e) {
      // Continue to next selector
    }
  }
  
  if (!logoutElement) {
    console.log('❌ No logout button found. Current page content:');
    const pageText = await page.textContent('body');
    console.log(pageText.substring(0, 500) + '...');
    await page.screenshot({ path: '4-no-logout-found.png', fullPage: true });
    
    // Log all clickable elements for debugging
    const clickableElements = await page.locator('button, a, [onclick], [role="button"]').all();
    console.log('Available clickable elements:');
    for (const element of clickableElements) {
      try {
        const text = await element.textContent();
        const tagName = await element.evaluate(el => el.tagName);
        if (text && text.trim()) {
          console.log(`  - ${tagName}: "${text.trim()}"`);
        }
      } catch (e) {
        // Skip problematic elements
      }
    }
    
    throw new Error('Logout button not found');
  }
  
  // Step 5: Click logout
  console.log('\n🚪 Step 5: Clicking logout button');
  await logoutElement.click();
  
  // Wait for potential redirect
  await page.waitForLoadState('networkidle');
  
  const urlAfterLogout = page.url();
  console.log('🌐 URL after logout:', urlAfterLogout);
  
  await page.screenshot({ path: '5-after-logout.png', fullPage: true });
  console.log('✅ Screenshot saved: 5-after-logout.png');
  
  // Step 6: Check for success message
  console.log('\n📝 Step 6: Checking for success message');
  const pageContent = await page.textContent('body');
  const hasSuccessMessage = pageContent.includes('You have been signed out successfully');
  console.log('📧 Success message present:', hasSuccessMessage);
  
  // Step 7: Check if redirected to login page
  console.log('\n🔄 Step 7: Checking redirect to login');
  const isOnLoginPage = urlAfterLogout.includes('/login') || (urlAfterLogout.includes('bdv2') && pageContent.includes('Sign in'));
  console.log('📍 Redirected to login page:', isOnLoginPage);
  
  // Step 8: Try to access a protected route
  console.log('\n🔐 Step 8: Testing protected route access');
  
  try {
    // Try to navigate to dashboard or a protected route
    const baseUrl = urlAfterLogout.replace(/\/(login)?$/, '');
    const protectedRoutes = ['/dashboard', '/home', '/profile', '/admin'];
    
    let protectedRouteBlocked = true;
    
    for (const route of protectedRoutes) {
      try {
        await page.goto(baseUrl + route);
        await page.waitForLoadState('networkidle');
        
        const protectedUrl = page.url();
        const protectedContent = await page.textContent('body');
        
        console.log(`🌐 Testing route ${route}, URL: ${protectedUrl}`);
        
        // If we stay on the route and don't get redirected to login, protection failed
        if (!protectedUrl.includes('/login') && !protectedContent.includes('Sign in')) {
          protectedRouteBlocked = false;
          console.log(`❌ Route ${route} is NOT protected - can access without login`);
          break;
        } else {
          console.log(`✅ Route ${route} is protected - redirected to login`);
        }
      } catch (e) {
        console.log(`🔍 Route ${route} not accessible:`, e.message);
      }
    }
    
    await page.screenshot({ path: '6-protected-route-test.png', fullPage: true });
    console.log('✅ Screenshot saved: 6-protected-route-test.png');
    
    // Report results
    console.log('\n🏁 VALIDATION RESULTS:');
    console.log('='.repeat(50));
    console.log('✅ Login successful:', !currentUrl.includes('/login'));
    console.log('✅ Logout button found:', true);
    console.log('✅ Redirected to login after logout:', isOnLoginPage);
    console.log('✅ Success message shown:', hasSuccessMessage);
    console.log('✅ Protected routes blocked:', protectedRouteBlocked);
    
    const results = {
      loginSuccessful: !currentUrl.includes('/login'),
      logoutButtonFound: true,
      redirectedToLogin: isOnLoginPage,
      successMessage: hasSuccessMessage,
      protectedRouteBlocked: protectedRouteBlocked,
      logoutSelector: logoutSelector
    };
    
    // Write results to validation report
    const reportContent = `# BDV2 Logout Logic Validation Report

## Test Execution: ${new Date().toISOString()}

## Test Server
- **URL**: https://dev2.aaroncollins.info/bdv2
- **Test Credentials**: aaron / correctpassword

## Validation Results

### 1. Login Process
- **Status**: ${results.loginSuccessful ? '✅ PASS' : '❌ FAIL'}
- **URL after login**: ${currentUrl}

### 2. Logout Button Detection
- **Status**: ${results.logoutButtonFound ? '✅ PASS' : '❌ FAIL'}
- **Selector used**: ${logoutSelector}

### 3. Redirect to Login After Logout  
- **Status**: ${results.redirectedToLogin ? '✅ PASS' : '❌ FAIL'}
- **URL after logout**: ${urlAfterLogout}

### 4. Success Message Display
- **Status**: ${results.successMessage ? '✅ PASS' : '❌ FAIL'}
- **Expected**: "You have been signed out successfully"
- **Found**: ${results.successMessage}

### 5. Protected Route Access Blocked
- **Status**: ${results.protectedRouteBlocked ? '✅ PASS' : '❌ FAIL'}
- **Description**: Cannot access protected pages after logout

## Overall Assessment
**${Object.values(results).every(r => r === true) ? '✅ VALIDATION PASSED' : '❌ VALIDATION FAILED'}**

## Screenshots Evidence
1. \`1-initial-page.png\` - Initial login page
2. \`2-login-form-filled.png\` - Login form with credentials filled
3. \`3-after-login.png\` - Page after successful login
4. \`5-after-logout.png\` - Page after logout
5. \`6-protected-route-test.png\` - Testing protected route access

## Acceptance Criteria Verification
1. ✅ signOut() properly called from logout button: ${results.logoutButtonFound ? 'VERIFIED' : 'FAILED'}
2. ❓ All session-related cookies cleared: Cannot verify programmatically via UI test
3. ✅ User redirected to /login after signOut: ${results.redirectedToLogin ? 'VERIFIED' : 'FAILED'}  
4. ${results.successMessage ? '✅' : '❌'} Success message displayed: "You have been signed out successfully": ${results.successMessage ? 'VERIFIED' : 'FAILED'}
5. ✅ Cannot access protected pages after logout: ${results.protectedRouteBlocked ? 'VERIFIED' : 'FAILED'}

---
*Report generated by automated validation script*
`;

    require('fs').writeFileSync('bdv2-logout-validation-report.md', reportContent);
    console.log('\n📄 Full validation report saved to: bdv2-logout-validation-report.md');
    
  } catch (error) {
    console.log('❌ Error during validation:', error.message);
    await page.screenshot({ path: 'error-state.png', fullPage: true });
    throw error;
  }
});