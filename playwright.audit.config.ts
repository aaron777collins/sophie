import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/audit',
  fullyParallel: false, // Run sequentially for audit
  retries: 0,
  workers: 1,
  reporter: [
    ['line'],
    ['html', { outputFolder: 'test-results/audit-html' }],
    ['json', { outputFile: 'test-results/audit-results.json' }]
  ],
  use: {
    baseURL: 'http://dev2.aaroncollins.info:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: true,
  },
  timeout: 60000,
  projects: [
    {
      name: 'audit-chromium',
      use: { ...devices['Desktop Chrome'] },
    }
  ],
});