import { test, expect } from '@playwright/test';

/**
 * MELO-P1-S11 Independent Validation Test
 * Layer 3 Validation Worker - Independent DM Functionality Audit
 * 
 * Objective: Independently verify DM functionality exists/missing in Melo V2
 * Expected Result: Tests should FAIL (RED phase) if DM functionality is missing
 */

test.describe('MELO-P1-S11: DM Initiation Independent Validation', () => {
  const TEST_URL = 'https://dev2.aaroncollins.info:3000';
  
  test.beforeEach(async ({ page }) => {
    // Navigate to Melo application 
    await page.goto(TEST_URL);
    await page.waitForLoadState('networkidle');
  });

  test('AC-1: DM Option Available - User should be able to find DM functionality', async ({ page }) => {
    // Take initial screenshot for evidence
    await page.screenshot({ 
      path: `scheduler/validation/screenshots/melo-audit/s11/desktop/ac1-initial-interface.png`,
      fullPage: true 
    });

    // Look for DM-related navigation elements
    const dmNavigation = page.locator('[data-testid*="dm"], [aria-label*="direct"], [aria-label*="message"], [href*="/dm"], [href*="/direct"]');
    
    // This should pass if DM functionality exists, fail if missing
    await expect(dmNavigation.first()).toBeVisible();
  });

  test('AC-2: User Discovery - Users should be able to find other users to DM', async ({ page }) => {
    await page.screenshot({ 
      path: `scheduler/validation/screenshots/melo-audit/s11/desktop/ac2-user-discovery-initial.png`,
      fullPage: true 
    });

    // Look for user discovery mechanisms
    const userSearch = page.locator('input[placeholder*="search"], input[placeholder*="user"], [data-testid*="search"]');
    const userDirectory = page.locator('[data-testid*="user"], [aria-label*="member"], [aria-label*="user"]');
    
    // Check if user search exists
    if (await userSearch.first().isVisible()) {
      await userSearch.first().fill('test');
      await page.screenshot({ 
        path: `scheduler/validation/screenshots/melo-audit/s11/desktop/ac2-user-search-filled.png`,
        fullPage: true 
      });
    }

    // This should pass if user discovery exists, fail if missing
    const hasUserDiscovery = await userSearch.first().isVisible() || await userDirectory.first().isVisible();
    expect(hasUserDiscovery).toBeTruthy();
  });

  test('AC-3: DM Initiation Flow - User should be able to start a DM conversation', async ({ page }) => {
    await page.screenshot({ 
      path: `scheduler/validation/screenshots/melo-audit/s11/desktop/ac3-dm-initiation-start.png`,
      fullPage: true 
    });

    // Look for DM initiation mechanisms
    const dmButtons = page.locator('button:has-text("message"), button:has-text("dm"), [data-testid*="start-dm"], [aria-label*="start conversation"]');
    const composeButton = page.locator('button:has-text("compose"), [data-testid*="compose"], [aria-label*="new conversation"]');
    
    // This should pass if DM initiation exists, fail if missing
    const hasDmInitiation = await dmButtons.first().isVisible() || await composeButton.first().isVisible();
    expect(hasDmInitiation).toBeTruthy();
  });

  test('Mobile Viewport: DM Functionality Check', async ({ page, browser }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(TEST_URL);
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: `scheduler/validation/screenshots/melo-audit/s11/mobile/mobile-dm-interface.png`,
      fullPage: true 
    });

    // Check for mobile-specific DM navigation
    const mobileDmNav = page.locator('[data-testid*="dm"], [aria-label*="direct"], button:has-text("DM"), button:has-text("Message")');
    
    // This should pass if mobile DM functionality exists, fail if missing
    await expect(mobileDmNav.first()).toBeVisible();
  });

  test('Tablet Viewport: DM Functionality Check', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(TEST_URL);
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: `scheduler/validation/screenshots/melo-audit/s11/tablet/tablet-dm-interface.png`,
      fullPage: true 
    });

    // Check for tablet-specific DM navigation
    const tabletDmNav = page.locator('[data-testid*="dm"], [aria-label*="direct"], button:has-text("DM"), button:has-text("Message")');
    
    // This should pass if tablet DM functionality exists, fail if missing  
    await expect(tabletDmNav.first()).toBeVisible();
  });
});