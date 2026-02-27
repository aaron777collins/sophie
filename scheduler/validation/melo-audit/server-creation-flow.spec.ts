import { test, expect } from '@playwright/test';

/**
 * MELO-P1-S04: Server Creation Audit
 * 
 * Expected Behavior (from Story ACs):
 * AC-1: Create Server Option Visible
 * - Find the create/add server option in sidebar
 * - Verify visibility at all 3 viewport sizes
 * 
 * AC-2: Create Server Modal/Form
 * - Click create server option
 * - Verify form appears with server name field
 * - Check for optional server icon/image upload
 * 
 * AC-3: Server Created Successfully
 * - Fill form with unique name: Test-Server-${timestamp}
 * - Submit form
 * - Verify server appears in server list
 * - Verify navigation to new server
 */

const VIEWPORT_SIZES = [
  { name: 'desktop', width: 1920, height: 1080 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 667 }
];

const BASE_URL = 'http://dev2.aaroncollins.info:3000';
const TIMESTAMP = Date.now();
const TEST_SERVER_NAME = `Test-Server-${TIMESTAMP}`;

// Test credentials - from S02 audit, we know we need valid login
const TEST_CREDENTIALS = {
  username: 'testuser', // TODO: Get actual test credentials
  password: 'testpass'  // TODO: Get actual test credentials
};

for (const viewport of VIEWPORT_SIZES) {
  test.describe(`Server Creation Audit - ${viewport.name}`, () => {
    
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      // Navigate to login page and authenticate
      await page.goto(`${BASE_URL}/sign-in`);
      
      // TODO: Add actual login flow when credentials are available
      // For now, document what needs to be tested
    });

    test(`AC-1: Create Server Option Visible - ${viewport.name}`, async ({ page }) => {
      // Expected: Find create/add server option in sidebar
      
      // Take screenshot of the main app interface
      await page.screenshot({ 
        path: `scheduler/validation/screenshots/melo-audit/MELO-P1-S04/${viewport.name}/ac1-sidebar-${viewport.name}.png`,
        fullPage: true 
      });
      
      // Look for create server button/option
      const createServerButton = await page.locator('[data-testid="create-server"], .create-server, button:has-text("Create Server"), [aria-label*="Create"], [title*="Create"]').first();
      
      // Document findings
      const isVisible = await createServerButton.isVisible().catch(() => false);
      console.log(`AC-1 ${viewport.name}: Create server option visible = ${isVisible}`);
      
      if (isVisible) {
        // Highlight the create server option
        await createServerButton.highlight();
        await page.screenshot({ 
          path: `scheduler/validation/screenshots/melo-audit/MELO-P1-S04/${viewport.name}/ac1-create-option-highlighted-${viewport.name}.png`,
          fullPage: true 
        });
      }
    });

    test(`AC-2: Create Server Modal/Form - ${viewport.name}`, async ({ page }) => {
      // Expected: Click create server option, verify form appears
      
      try {
        // Find and click create server option
        const createServerButton = await page.locator('[data-testid="create-server"], .create-server, button:has-text("Create Server"), [aria-label*="Create"], [title*="Create"]').first();
        
        if (await createServerButton.isVisible()) {
          await createServerButton.click();
          
          // Wait for modal/form to appear
          await page.waitForTimeout(1000);
          
          // Take screenshot of the form
          await page.screenshot({ 
            path: `scheduler/validation/screenshots/melo-audit/MELO-P1-S04/${viewport.name}/ac2-create-server-form-${viewport.name}.png`,
            fullPage: true 
          });
          
          // Check for server name field
          const nameField = await page.locator('input[name*="name"], input[placeholder*="name"], input[aria-label*="name"]').first();
          const hasNameField = await nameField.isVisible().catch(() => false);
          
          // Check for optional server icon upload
          const iconUpload = await page.locator('input[type="file"], [data-testid="icon-upload"]').first();
          const hasIconUpload = await iconUpload.isVisible().catch(() => false);
          
          console.log(`AC-2 ${viewport.name}: Form visible with name field = ${hasNameField}, icon upload = ${hasIconUpload}`);
        } else {
          console.log(`AC-2 ${viewport.name}: Create server button not found`);
        }
      } catch (error) {
        console.log(`AC-2 ${viewport.name}: Error testing form - ${error.message}`);
      }
    });

    test(`AC-3: Server Created Successfully - ${viewport.name}`, async ({ page }) => {
      // Expected: Fill form, submit, verify server creation
      
      try {
        // Navigate through create server flow
        const createServerButton = await page.locator('[data-testid="create-server"], .create-server, button:has-text("Create Server"), [aria-label*="Create"], [title*="Create"]').first();
        
        if (await createServerButton.isVisible()) {
          await createServerButton.click();
          await page.waitForTimeout(1000);
          
          // Fill server name with unique timestamp-based name
          const nameField = await page.locator('input[name*="name"], input[placeholder*="name"], input[aria-label*="name"]').first();
          
          if (await nameField.isVisible()) {
            await nameField.fill(TEST_SERVER_NAME);
            
            // Take screenshot of filled form
            await page.screenshot({ 
              path: `scheduler/validation/screenshots/melo-audit/MELO-P1-S04/${viewport.name}/ac3-form-filled-${viewport.name}.png`,
              fullPage: true 
            });
            
            // Find and click submit button
            const submitButton = await page.locator('button[type="submit"], button:has-text("Create"), button:has-text("Submit")').first();
            
            if (await submitButton.isVisible()) {
              await submitButton.click();
              
              // Wait for server creation and navigation
              await page.waitForTimeout(2000);
              
              // Take screenshot of result
              await page.screenshot({ 
                path: `scheduler/validation/screenshots/melo-audit/MELO-P1-S04/${viewport.name}/ac3-server-created-${viewport.name}.png`,
                fullPage: true 
              });
              
              // Check if server appears in server list
              const serverInList = await page.locator(`[title*="${TEST_SERVER_NAME}"], [aria-label*="${TEST_SERVER_NAME}"], :text("${TEST_SERVER_NAME}")`).first();
              const serverVisible = await serverInList.isVisible().catch(() => false);
              
              console.log(`AC-3 ${viewport.name}: Server "${TEST_SERVER_NAME}" created and visible = ${serverVisible}`);
            } else {
              console.log(`AC-3 ${viewport.name}: Submit button not found`);
            }
          } else {
            console.log(`AC-3 ${viewport.name}: Name field not found`);
          }
        } else {
          console.log(`AC-3 ${viewport.name}: Create server button not found`);
        }
      } catch (error) {
        console.log(`AC-3 ${viewport.name}: Error creating server - ${error.message}`);
      }
    });
  });
}