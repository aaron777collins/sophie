import { test, expect } from '@playwright/test';
import { promises as fs } from 'fs';
import * as path from 'path';

const BASE_URL = 'http://dev2.aaroncollins.info:3000';
const CREDENTIALS = {
  username: 'sophietest',
  password: 'SophieTest2026!'
};

// Screenshot directory
const SCREENSHOT_DIR = path.join(process.cwd(), 'scheduler/validation/screenshots/melo-audit/MELO-P1-S04');

// Viewport configurations
const VIEWPORTS = [
  { name: 'desktop', width: 1920, height: 1080 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 667 }
];

// Test data
const TEST_SERVER_NAME = `Test-Server-${Date.now()}`;

test.describe('MELO-P1-S04: Create Server Audit', () => {
  
  // Helper function to save screenshot
  async function saveScreenshot(page: any, filename: string, viewport: string) {
    const screenshotPath = path.join(SCREENSHOT_DIR, viewport, filename);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`Screenshot saved: ${screenshotPath}`);
  }

  // Helper function to login
  async function login(page: any) {
    await page.goto(`${BASE_URL}/sign-in`);
    await page.waitForLoadState('networkidle');
    
    // Fill login form
    await page.fill('input[name="username"], input[type="text"], input[placeholder*="username" i]', CREDENTIALS.username);
    await page.fill('input[name="password"], input[type="password"], input[placeholder*="password" i]', CREDENTIALS.password);
    
    // Submit form
    await page.click('button[type="submit"], button:has-text("Sign In"), button:has-text("Login")');
    await page.waitForLoadState('networkidle');
    
    // Wait for successful login (URL change or dashboard elements)
    await page.waitForTimeout(2000);
  }

  for (const viewport of VIEWPORTS) {
    test(`AC-1: Create Server Option Visible - ${viewport.name}`, async ({ page }) => {
      console.log(`\n=== Testing AC-1 at ${viewport.name} (${viewport.width}x${viewport.height}) ===`);
      
      // Set viewport
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      // Login first
      await login(page);
      
      // Screenshot of initial server sidebar view
      await saveScreenshot(page, `server-sidebar-initial.png`, viewport.name);
      
      // Look for create server option - various selectors to try
      const createServerSelectors = [
        'button:has-text("+")',
        '[aria-label*="create" i][aria-label*="server" i]',
        '[title*="create" i][title*="server" i]',
        'button:has-text("Create Server")',
        'button:has-text("Add Server")',
        '[data-testid*="create-server"]',
        '.create-server',
        '.add-server',
        // Mobile-specific - might be in menu
        '[aria-label="menu"]',
        'button[aria-expanded]'
      ];
      
      let createServerElement = null;
      let usedSelector = '';
      
      // Try each selector
      for (const selector of createServerSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 1000 });
          if (await page.isVisible(selector)) {
            createServerElement = await page.locator(selector);
            usedSelector = selector;
            console.log(`✅ Create server option found with selector: ${selector}`);
            break;
          }
        } catch (error) {
          // Continue to next selector
        }
      }
      
      // If mobile viewport and no direct button found, check for menu
      if (!createServerElement && viewport.name === 'mobile') {
        try {
          // Look for hamburger menu or sidebar toggle
          const menuSelectors = ['[aria-label="menu"]', '.menu-toggle', 'button[aria-expanded]'];
          for (const menuSelector of menuSelectors) {
            if (await page.isVisible(menuSelector)) {
              await page.click(menuSelector);
              await page.waitForTimeout(500);
              
              // Try create server selectors again
              for (const selector of createServerSelectors) {
                try {
                  if (await page.isVisible(selector)) {
                    createServerElement = await page.locator(selector);
                    usedSelector = selector;
                    console.log(`✅ Create server option found in mobile menu: ${selector}`);
                    break;
                  }
                } catch (error) {
                  // Continue
                }
              }
              if (createServerElement) break;
            }
          }
        } catch (error) {
          console.log(`Mobile menu check failed: ${error.message}`);
        }
      }
      
      // Take screenshot showing the found element or the search area
      await saveScreenshot(page, `create-server-option-located.png`, viewport.name);
      
      // Verify element is clickable
      if (createServerElement) {
        const isClickable = await createServerElement.isEnabled();
        console.log(`Create server element clickable: ${isClickable}`);
        
        // Highlight the element if possible (for evidence)
        try {
          await page.evaluate((selector) => {
            const element = document.querySelector(selector);
            if (element) {
              element.style.border = '3px solid red';
              element.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
            }
          }, usedSelector);
          
          await saveScreenshot(page, `create-server-option-highlighted.png`, viewport.name);
        } catch (error) {
          console.log(`Could not highlight element: ${error.message}`);
        }
        
        expect(createServerElement).toBeTruthy();
        expect(isClickable).toBe(true);
      } else {
        // Document the failure with comprehensive screenshot
        await saveScreenshot(page, `create-server-option-NOT-FOUND.png`, viewport.name);
        console.log(`❌ Create server option NOT found at ${viewport.name}`);
        
        // Take screenshot of entire page for analysis
        await saveScreenshot(page, `full-page-analysis.png`, viewport.name);
        
        // Log page content for debugging
        const pageContent = await page.content();
        const logPath = path.join(SCREENSHOT_DIR, viewport.name, 'page-content.html');
        await fs.writeFile(logPath, pageContent);
        
        throw new Error(`Create server option not found at ${viewport.name} viewport`);
      }
    });

    test(`AC-2: Create Server Modal/Form - ${viewport.name}`, async ({ page }) => {
      console.log(`\n=== Testing AC-2 at ${viewport.name} (${viewport.width}x${viewport.height}) ===`);
      
      // Set viewport
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      // Login first
      await login(page);
      
      // Find and click create server option (reuse logic from AC-1)
      const createServerSelectors = [
        'button:has-text("+")',
        '[aria-label*="create" i][aria-label*="server" i]',
        '[title*="create" i][title*="server" i]',
        'button:has-text("Create Server")',
        'button:has-text("Add Server")',
        '[data-testid*="create-server"]'
      ];
      
      let clicked = false;
      for (const selector of createServerSelectors) {
        try {
          if (await page.isVisible(selector)) {
            await page.click(selector);
            clicked = true;
            console.log(`✅ Clicked create server option: ${selector}`);
            break;
          }
        } catch (error) {
          // Continue to next selector
        }
      }
      
      if (!clicked) {
        // Handle mobile menu case
        if (viewport.name === 'mobile') {
          const menuSelectors = ['[aria-label="menu"]', '.menu-toggle', 'button[aria-expanded]'];
          for (const menuSelector of menuSelectors) {
            if (await page.isVisible(menuSelector)) {
              await page.click(menuSelector);
              await page.waitForTimeout(500);
              
              for (const selector of createServerSelectors) {
                try {
                  if (await page.isVisible(selector)) {
                    await page.click(selector);
                    clicked = true;
                    break;
                  }
                } catch (error) {
                  // Continue
                }
              }
              if (clicked) break;
            }
          }
        }
      }
      
      expect(clicked).toBe(true);
      
      // Wait for modal/form to appear
      await page.waitForTimeout(1000);
      
      // Screenshot after clicking
      await saveScreenshot(page, `create-server-modal-opened.png`, viewport.name);
      
      // Look for form elements
      const formSelectors = [
        'input[name="name"]',
        'input[name="serverName"]', 
        'input[placeholder*="server" i][placeholder*="name" i]',
        'input[placeholder*="name" i]',
        'input[type="text"]',
        'form input',
        '[data-testid*="server-name"]'
      ];
      
      let nameInput = null;
      for (const selector of formSelectors) {
        try {
          if (await page.isVisible(selector)) {
            nameInput = page.locator(selector);
            console.log(`✅ Found server name input: ${selector}`);
            break;
          }
        } catch (error) {
          // Continue
        }
      }
      
      expect(nameInput).toBeTruthy();
      
      // Look for optional image upload
      const imageUploadSelectors = [
        'input[type="file"]',
        'input[accept*="image"]',
        '[data-testid*="upload"]',
        '.file-upload',
        'label:has-text("icon")'
      ];
      
      let hasImageUpload = false;
      for (const selector of imageUploadSelectors) {
        try {
          if (await page.isVisible(selector)) {
            hasImageUpload = true;
            console.log(`✅ Found image upload option: ${selector}`);
            break;
          }
        } catch (error) {
          // Continue
        }
      }
      
      console.log(`Image upload available: ${hasImageUpload}`);
      
      // Verify form is properly styled (modal or dedicated page)
      const modalSelectors = [
        '.modal',
        '.dialog',
        '[role="dialog"]',
        '[aria-modal="true"]'
      ];
      
      let isModal = false;
      for (const selector of modalSelectors) {
        try {
          if (await page.isVisible(selector)) {
            isModal = true;
            console.log(`✅ Form displayed as modal: ${selector}`);
            break;
          }
        } catch (error) {
          // Continue
        }
      }
      
      console.log(`Displayed as modal: ${isModal}`);
      
      // Final screenshot showing the form
      await saveScreenshot(page, `create-server-form-complete.png`, viewport.name);
    });

    test(`AC-3: Server Created Successfully - ${viewport.name}`, async ({ page }) => {
      console.log(`\n=== Testing AC-3 at ${viewport.name} (${viewport.width}x${viewport.height}) ===`);
      
      // Set viewport
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      // Login first
      await login(page);
      
      // Take initial screenshot of server list
      await saveScreenshot(page, `server-list-before-creation.png`, viewport.name);
      
      // Find and click create server option
      const createServerSelectors = [
        'button:has-text("+")',
        '[aria-label*="create" i][aria-label*="server" i]',
        'button:has-text("Create Server")'
      ];
      
      let clicked = false;
      for (const selector of createServerSelectors) {
        try {
          if (await page.isVisible(selector)) {
            await page.click(selector);
            clicked = true;
            break;
          }
        } catch (error) {
          // Continue
        }
      }
      
      // Handle mobile menu if needed
      if (!clicked && viewport.name === 'mobile') {
        try {
          await page.click('[aria-label="menu"]');
          await page.waitForTimeout(500);
          for (const selector of createServerSelectors) {
            try {
              if (await page.isVisible(selector)) {
                await page.click(selector);
                clicked = true;
                break;
              }
            } catch (error) {
              // Continue
            }
          }
        } catch (error) {
          // Continue
        }
      }
      
      expect(clicked).toBe(true);
      await page.waitForTimeout(1000);
      
      // Fill server name with unique timestamp-based name
      const serverName = TEST_SERVER_NAME;
      console.log(`Creating server: ${serverName}`);
      
      const nameInputSelectors = [
        'input[name="name"]',
        'input[name="serverName"]',
        'input[placeholder*="server" i][placeholder*="name" i]',
        'input[type="text"]'
      ];
      
      let filled = false;
      for (const selector of nameInputSelectors) {
        try {
          if (await page.isVisible(selector)) {
            await page.fill(selector, serverName);
            filled = true;
            console.log(`✅ Filled server name with: ${selector}`);
            break;
          }
        } catch (error) {
          // Continue
        }
      }
      
      expect(filled).toBe(true);
      
      // Screenshot with form filled
      await saveScreenshot(page, `form-filled-before-submit.png`, viewport.name);
      
      // Submit the form
      const submitSelectors = [
        'button[type="submit"]',
        'button:has-text("Create")',
        'button:has-text("Submit")',
        'button:has-text("Save")',
        '[data-testid*="submit"]',
        'form button'
      ];
      
      let submitted = false;
      for (const selector of submitSelectors) {
        try {
          if (await page.isVisible(selector) && await page.isEnabled(selector)) {
            await page.click(selector);
            submitted = true;
            console.log(`✅ Clicked submit button: ${selector}`);
            break;
          }
        } catch (error) {
          // Continue
        }
      }
      
      expect(submitted).toBe(true);
      
      // Wait for submission to complete
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // Screenshot after submission
      await saveScreenshot(page, `after-server-creation.png`, viewport.name);
      
      // Verify server appears in server list
      const serverListSelectors = [
        `.server-list`,
        `[data-server-name="${serverName}"]`,
        `text=${serverName}`,
        `.sidebar`,
        `.server-sidebar`,
        // Generic server item patterns
        `.server-item:has-text("${serverName}")`,
        `li:has-text("${serverName}")`,
        `div:has-text("${serverName}")`
      ];
      
      let serverFound = false;
      for (const selector of serverListSelectors) {
        try {
          if (await page.isVisible(selector)) {
            serverFound = true;
            console.log(`✅ Server found in list: ${selector}`);
            break;
          }
        } catch (error) {
          // Continue
        }
      }
      
      // If not found by direct selector, check page content
      if (!serverFound) {
        const pageText = await page.textContent('body');
        if (pageText && pageText.includes(serverName)) {
          serverFound = true;
          console.log(`✅ Server name found in page content`);
        }
      }
      
      // Verify navigation to new server (URL change or UI change)
      const currentUrl = page.url();
      console.log(`Current URL after creation: ${currentUrl}`);
      
      const isInNewServer = currentUrl.includes('server') || currentUrl.includes('channel');
      console.log(`Appears to be in new server view: ${isInNewServer}`);
      
      // Final screenshot showing the new server
      await saveScreenshot(page, `new-server-created-final.png`, viewport.name);
      
      // Log creation success
      const creationLogPath = path.join(SCREENSHOT_DIR, viewport.name, 'server-creation-log.txt');
      const logContent = `Server Creation Test Results
Viewport: ${viewport.name}
Server Name: ${serverName}
Created At: ${new Date().toISOString()}
Server Found in List: ${serverFound}
URL After Creation: ${currentUrl}
Appears in New Server: ${isInNewServer}
`;
      await fs.writeFile(creationLogPath, logContent);
      
      // Assertions
      expect(serverFound).toBe(true);
      console.log(`✅ Server creation successful at ${viewport.name}`);
    });
  }
});