/**
 * @spec VH-013: Branch Merging - Screenshot Capture
 * Takes evidence screenshots at 3 viewports using dedicated test page
 */

import { test, expect } from '@playwright/test';
import path from 'path';

const EVIDENCE_DIR = path.join(process.cwd(), 'scheduler/evidence/clawd-kus.13/screenshots');
const TEST_PAGE = '/test/branch-merging';

test.describe('VH-013 Screenshot Evidence', () => {
  test('capture merge UI at all viewports', async ({ page, browserName }) => {
    if (browserName !== 'chromium') test.skip();

    // --- DESKTOP (1920x1080) ---
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(TEST_PAGE);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Full page - shows all components
    await page.screenshot({
      path: `${EVIDENCE_DIR}/desktop/full-page.png`,
      fullPage: true
    });

    // Open clean merge dialog (AC1)
    await page.click('[data-testid="open-clean-merge"]');
    await page.waitForSelector('[data-testid="branch-merge-dialog"]');
    await page.waitForTimeout(300);
    await page.screenshot({
      path: `${EVIDENCE_DIR}/desktop/merge-dialog-clean.png`,
      fullPage: false
    });
    await page.click('[data-testid="close-merge-dialog"]');
    await page.waitForTimeout(200);

    // Open merge with conflicts (AC2)
    await page.click('[data-testid="open-conflict-merge"]');
    await page.waitForSelector('[data-testid="branch-merge-dialog"]');
    await page.waitForTimeout(300);
    await page.screenshot({
      path: `${EVIDENCE_DIR}/desktop/merge-dialog-conflicts.png`,
      fullPage: false
    });
    // Click abort to see confirmation (AC4)
    await page.click('[data-testid="abort-merge-button"]');
    await page.waitForTimeout(200);
    await page.screenshot({
      path: `${EVIDENCE_DIR}/desktop/merge-abort-confirmation.png`,
      fullPage: false
    });
    await page.click('[data-testid="confirm-abort-button"]');
    await page.waitForTimeout(200);

    // Conflict resolution view standalone (AC3)
    await page.screenshot({
      path: `${EVIDENCE_DIR}/desktop/conflict-resolution-view.png`,
      fullPage: false
    });

    // --- TABLET (768x1024) ---
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(300);
    await page.screenshot({
      path: `${EVIDENCE_DIR}/tablet/full-page.png`,
      fullPage: true
    });

    await page.click('[data-testid="open-clean-merge"]');
    await page.waitForSelector('[data-testid="branch-merge-dialog"]');
    await page.waitForTimeout(300);
    await page.screenshot({
      path: `${EVIDENCE_DIR}/tablet/merge-dialog.png`,
      fullPage: false
    });
    await page.click('[data-testid="close-merge-dialog"]');
    await page.waitForTimeout(200);

    await page.click('[data-testid="open-conflict-merge"]');
    await page.waitForSelector('[data-testid="branch-merge-dialog"]');
    await page.waitForTimeout(300);
    await page.screenshot({
      path: `${EVIDENCE_DIR}/tablet/merge-dialog-conflicts.png`,
      fullPage: false
    });
    await page.click('[data-testid="abort-merge-button"]');
    await page.waitForTimeout(200);
    await page.click('[data-testid="confirm-abort-button"]');
    await page.waitForTimeout(200);

    // --- MOBILE (375x667) ---
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(300);
    await page.screenshot({
      path: `${EVIDENCE_DIR}/mobile/full-page.png`,
      fullPage: true
    });

    await page.click('[data-testid="open-clean-merge"]');
    await page.waitForSelector('[data-testid="branch-merge-dialog"]');
    await page.waitForTimeout(300);
    await page.screenshot({
      path: `${EVIDENCE_DIR}/mobile/merge-dialog.png`,
      fullPage: false
    });
    await page.click('[data-testid="close-merge-dialog"]');
    await page.waitForTimeout(200);

    await page.click('[data-testid="open-conflict-merge"]');
    await page.waitForSelector('[data-testid="branch-merge-dialog"]');
    await page.waitForTimeout(300);
    await page.screenshot({
      path: `${EVIDENCE_DIR}/mobile/merge-dialog-conflicts.png`,
      fullPage: false
    });
    await page.click('[data-testid="abort-merge-button"]');
    await page.waitForTimeout(200);
    await page.click('[data-testid="confirm-abort-button"]');
    await page.waitForTimeout(200);

    console.log('All screenshots captured:', EVIDENCE_DIR);
  });
});
