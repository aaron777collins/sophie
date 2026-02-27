import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration specifically for Melo V2 audit tests
 * Tests against dev2.aaroncollins.info:3000
 */
export default defineConfig({
  testDir: './tests/audit',
  /* Run tests in files in parallel */
  fullyParallel: false, // Sequential for audit to avoid conflicts
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: 0, // No retries for audit - we want to see actual behavior
  /* Opt out of parallel tests on CI. */
  workers: 1, // Single worker for audit
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { outputFolder: 'audit-report' }],
    ['json', { outputFile: 'test-results/audit-results.json' }],
    ['list'] // Console output for real-time feedback
  ],
  /* Shared settings for all the projects below. */
  use: {
    /* Base URL for dev2 server */
    baseURL: 'http://dev2.aaroncollins.info:3000',

    /* Collect trace on failure for audit evidence */
    trace: 'on',

    /* Take screenshot on failure and success */
    screenshot: 'on',

    /* Capture video for audit evidence */
    video: 'on',

    /* Timeout settings */
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  /* Configure projects for audit testing */
  projects: [
    {
      name: 'audit-chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Ensure we can capture full pages
        viewport: { width: 1920, height: 1080 }
      },
    }
  ],

  /* No webServer for audit - testing against external dev2 server */
  timeout: 60000, // Longer timeout for audit tests
});