import { test, expect } from '@playwright/test';

// Mock title generation response
const mockTitleResponse = {
  suggestions: [
    {
      id: '1',
      title: 'How to Cook Perfect Pasta Every Time',
      category: 'descriptive',
      engagementScore: 85,
      confidence: 0.9,
      characterCount: 40
    },
    {
      id: '2', 
      title: '5 Pasta Secrets Chefs Don\'t Want You to Know!',
      category: 'clickbait',
      engagementScore: 92,
      confidence: 0.8,
      characterCount: 46
    },
    {
      id: '3',
      title: 'Master Chef Pasta Techniques Tutorial',
      category: 'professional', 
      engagementScore: 78,
      confidence: 0.85,
      characterCount: 38
    }
  ],
  detectedTopics: ['cooking', 'pasta', 'techniques'],
  contentSummary: 'A cooking tutorial about pasta preparation',
  generatedAt: new Date().toISOString(),
  processingTimeMs: 1500
};

// Test page URL that doesn't require authentication
const TEST_PAGE_URL = '/test/title-generator';

test.describe('Title Generation', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the AI API to return consistent results
    await page.route('**/api/ai/generate-titles', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockTitleResponse)
      });
    });
  });

  test('should generate titles for video content', async ({ page }) => {
    // Navigate to test page (no auth required)
    await page.goto(TEST_PAGE_URL);
    
    // Enter transcript text
    const transcriptInput = page.locator('[data-testid="transcript-input"]');
    await transcriptInput.fill('Here is a cooking tutorial about making pasta with traditional Italian techniques');
    
    // Generate titles
    await page.click('[data-testid="generate-titles-button"]');
    
    // Wait for loading to complete
    await expect(page.locator('[data-testid="generate-titles-button"]')).not.toContainText('Generating', { timeout: 10000 });
    
    // Verify suggestions appear
    await expect(page.locator('[data-testid="title-suggestions"]')).toBeVisible();
    await expect(page.locator('[data-testid="title-suggestion-0"]')).toBeVisible();
    await expect(page.locator('[data-testid="title-suggestion-1"]')).toBeVisible();
    
    // Verify title content
    await expect(page.locator('[data-testid="title-suggestion-0"]')).toContainText('How to Cook Perfect Pasta');
    await expect(page.locator('[data-testid="title-suggestion-1"]')).toContainText('5 Pasta Secrets');
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Override the mock with an error response for this test
    await page.route('**/api/ai/generate-titles', route =>
      route.fulfill({ 
        status: 500, 
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Service unavailable' })
      })
    );
    
    await page.goto(TEST_PAGE_URL);
    
    // Enter transcript text
    const transcriptInput = page.locator('[data-testid="transcript-input"]');
    await transcriptInput.fill('Test content for error handling');
    
    await page.click('[data-testid="generate-titles-button"]');
    
    await expect(page.locator('[data-testid="ai-error-message"]')).toBeVisible({ timeout: 10000 });
  });

  test('should show platform-specific formatting', async ({ page }) => {
    await page.goto(TEST_PAGE_URL);
    
    // Enter transcript text
    const transcriptInput = page.locator('[data-testid="transcript-input"]');
    await transcriptInput.fill('Test content about cooking pasta');
    
    await page.click('[data-testid="generate-titles-button"]');
    await expect(page.locator('[data-testid="title-suggestions"]')).toBeVisible({ timeout: 10000 });
    
    // Test platform filters
    await page.click('[data-testid="platform-filter-youtube"]');
    await expect(page.locator('[data-testid="platform-active-youtube"]')).toBeVisible();
    
    await page.click('[data-testid="platform-filter-tiktok"]'); 
    await expect(page.locator('[data-testid="platform-active-tiktok"]')).toBeVisible();
    
    await page.click('[data-testid="platform-filter-linkedin"]');
    await expect(page.locator('[data-testid="platform-active-linkedin"]')).toBeVisible();
    
    await page.click('[data-testid="platform-filter-twitter"]');
    await expect(page.locator('[data-testid="platform-active-twitter"]')).toBeVisible();
  });

  test('should display character counts for platform limits', async ({ page }) => {
    await page.goto(TEST_PAGE_URL);
    
    // Enter transcript text
    const transcriptInput = page.locator('[data-testid="transcript-input"]');
    await transcriptInput.fill('Test content for character count');
    
    await page.click('[data-testid="generate-titles-button"]');
    await expect(page.locator('[data-testid="title-suggestions"]')).toBeVisible({ timeout: 10000 });
    
    // Select YouTube platform and check character limit display
    await page.click('[data-testid="platform-filter-youtube"]');
    await expect(page.locator('[data-testid="character-count-0"]')).toBeVisible();
    await expect(page.locator('[data-testid="character-count-0"]')).toContainText('/100');
  });

  test('should allow title selection', async ({ page }) => {
    await page.goto(TEST_PAGE_URL);
    
    // Enter transcript text
    const transcriptInput = page.locator('[data-testid="transcript-input"]');
    await transcriptInput.fill('Test content for title selection');
    
    await page.click('[data-testid="generate-titles-button"]');
    await expect(page.locator('[data-testid="title-suggestions"]')).toBeVisible({ timeout: 10000 });
    
    // Click on a title suggestion
    await page.click('[data-testid="title-suggestion-0"] [data-testid="select-title-button"]');
    
    // Verify selection feedback
    await expect(page.locator('[data-testid="selected-title-feedback"]')).toBeVisible();
    await expect(page.locator('[data-testid="selected-title-feedback"]')).toContainText('Title selected');
  });
});
