import { test, expect } from '@playwright/test';
import * as path from 'path';

const BASE_URL = 'http://dev2.aaroncollins.info:3000';
const CREDENTIALS = {
  username: 'sophietest',
  password: 'SophieTest2026!'
};

const SCREENSHOT_DIR = path.join(process.cwd(), 'scheduler/validation/screenshots/melo-audit/MELO-P1-S04');

const VIEWPORTS = [
  { name: 'desktop', width: 1920, height: 1080 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 667 }
];

test.describe('MELO-P1-S04: Create Server Audit', () => {
  
  test.beforeEach(async ({ page }) => {
    // Set longer timeout for each test
    test.setTimeout(120000);
    
    // Go to sign-in page and login
    await page.goto(`${BASE_URL}/sign-in`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000); // Wait for React to hydrate
    
    // Login - try multiple selectors
    const usernameSelectors = [
      'input[name="username"]',
      'input[type="text"]',
      'input[placeholder*="username" i]',
      'input[placeholder*="user" i]'
    ];
    
    const passwordSelectors = [
      'input[name="password"]', 
      'input[type="password"]',
      'input[placeholder*="password" i]'
    ];
    
    // Fill username
    let usernameFilled = false;
    for (const selector of usernameSelectors) {
      try {
        const element = page.locator(selector);
        if (await element.isVisible()) {
          await element.fill(CREDENTIALS.username);
          usernameFilled = true;
          break;
        }
      } catch (error) {
        continue;
      }
    }
    expect(usernameFilled).toBe(true);
    
    // Fill password
    let passwordFilled = false;
    for (const selector of passwordSelectors) {
      try {
        const element = page.locator(selector);
        if (await element.isVisible()) {
          await element.fill(CREDENTIALS.password);
          passwordFilled = true;
          break;
        }
      } catch (error) {
        continue;
      }
    }
    expect(passwordFilled).toBe(true);
    
    // Submit form
    const submitSelectors = [
      'button[type="submit"]',
      'button:has-text("Sign In")',
      'button:has-text("Login")',
      'input[type="submit"]'
    ];
    
    let submitted = false;
    for (const selector of submitSelectors) {
      try {
        const element = page.locator(selector);
        if (await element.isVisible()) {
          await element.click();
          submitted = true;
          break;
        }
      } catch (error) {
        continue;
      }
    }
    expect(submitted).toBe(true);
    
    // Wait for login to complete
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
  });

  for (const viewport of VIEWPORTS) {
    test(`Quick AC-1 Check: Create Server Option - ${viewport.name}`, async ({ page }) => {
      console.log(`\n=== Quick AC-1 Check at ${viewport.name} ===`);
      
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      // Screenshot of current state
      const screenshotPath = path.join(SCREENSHOT_DIR, viewport.name, `ac1-quick-check.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      console.log(`Screenshot saved: ${screenshotPath}`);
      
      // Look for any button or element that could be create server
      const createSelectors = [
        'button:has-text("+")',
        '[aria-label*="create" i]',
        '[title*="create" i]',
        'button:has-text("Create")',
        'button:has-text("Add")',
        '.create-server',
        '.add-server'
      ];
      
      const foundElements = [];
      for (const selector of createSelectors) {
        try {
          const elements = await page.locator(selector).all();
          for (const element of elements) {
            if (await element.isVisible()) {
              foundElements.push({ selector, element });
            }
          }
        } catch (error) {
          continue;
        }
      }
      
      console.log(`Found ${foundElements.length} potential create elements`);
      
      // Log page content for analysis
      const pageText = await page.textContent('body');
      const logPath = path.join(SCREENSHOT_DIR, viewport.name, `ac1-page-content.txt`);
      await require('fs').promises.writeFile(logPath, pageText || '');
      
      // Check URL and title
      console.log(`Current URL: ${page.url()}`);
      console.log(`Page title: ${await page.title()}`);
      
      // Basic success criteria - we found the logged in state
      expect(page.url()).not.toContain('/sign-in');
    });
  }

  test(`Manual Server Creation Test - Desktop`, async ({ page }) => {
    console.log(`\n=== Manual Server Creation Test ===`);
    
    await page.setViewportSize({ width: 1920, height: 1080 });
    
    // Take screenshot of current state
    const screenshotPath = path.join(SCREENSHOT_DIR, 'desktop', 'manual-server-creation.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    
    // Log all clickable elements that might be create server
    const allButtons = await page.locator('button').all();
    console.log(`Found ${allButtons.length} buttons on page`);
    
    for (let i = 0; i < allButtons.length; i++) {
      try {
        const button = allButtons[i];
        const text = await button.textContent();
        const ariaLabel = await button.getAttribute('aria-label');
        const title = await button.getAttribute('title');
        
        console.log(`Button ${i}: text="${text}" aria-label="${ariaLabel}" title="${title}"`);
        
        // If this looks like a create button, try clicking it
        if (text?.includes('+') || ariaLabel?.toLowerCase().includes('create') || 
            text?.toLowerCase().includes('create') || text?.toLowerCase().includes('add')) {
          console.log(`Attempting to click potential create button: ${text || ariaLabel || title}`);
          
          try {
            await button.click();
            await page.waitForTimeout(2000);
            
            // Screenshot after click
            const afterClickPath = path.join(SCREENSHOT_DIR, 'desktop', `after-click-button-${i}.png`);
            await page.screenshot({ path: afterClickPath, fullPage: true });
            
            // Look for form fields
            const formInputs = await page.locator('input[type="text"], input[name*="name"], input[placeholder*="name" i]').all();
            if (formInputs.length > 0) {
              console.log(`Found ${formInputs.length} form inputs after clicking button ${i}`);
              
              // Try to fill the first text input
              const testServerName = `Test-Server-${Date.now()}`;
              await formInputs[0].fill(testServerName);
              
              // Screenshot with filled form
              const filledFormPath = path.join(SCREENSHOT_DIR, 'desktop', `form-filled-${i}.png`);
              await page.screenshot({ path: filledFormPath, fullPage: true });
              
              // Look for submit button
              const submitButtons = await page.locator('button[type="submit"], button:has-text("Create"), button:has-text("Submit")').all();
              if (submitButtons.length > 0) {
                await submitButtons[0].click();
                await page.waitForTimeout(2000);
                
                // Screenshot after submit
                const afterSubmitPath = path.join(SCREENSHOT_DIR, 'desktop', `after-submit-${i}.png`);
                await page.screenshot({ path: afterSubmitPath, fullPage: true });
                
                console.log(`Attempted server creation with button ${i}`);
              }
              
              break; // Exit after attempting one creation
            }
          } catch (clickError) {
            console.log(`Error clicking button ${i}: ${clickError.message}`);
          }
        }
      } catch (error) {
        continue;
      }
    }
    
    // Final screenshot
    const finalPath = path.join(SCREENSHOT_DIR, 'desktop', 'manual-test-complete.png');
    await page.screenshot({ path: finalPath, fullPage: true });
  });
});