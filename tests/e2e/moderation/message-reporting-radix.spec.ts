import { test, expect, Page, BrowserContext } from '@playwright/test';

interface MockMatrixClient {
  reportEvent: jest.Mock;
  userId: string;
  isConnected: boolean;
}

// Mock Matrix client responses
const createMockMatrixClient = (): MockMatrixClient => ({
  reportEvent: jest.fn(),
  userId: '@test:example.com',
  isConnected: true,
});

// Test data
const mockMessageData = {
  messageId: '$test-message-id:example.com',
  roomId: '!test-room:example.com',
  eventContent: {
    body: 'This is a test message that needs to be reported',
    sender: '@sender:example.com',
    timestamp: Date.now(),
  },
};

// Helper function to setup the page with mock Matrix client
async function setupPageWithMocks(page: Page) {
  // Mock the Matrix client context
  await page.addInitScript(() => {
    (window as any).mockMatrixClient = {
      reportEvent: async (roomId: string, messageId: string, score: number, reason: string) => {
        (window as any).reportEventCalls = (window as any).reportEventCalls || [];
        (window as any).reportEventCalls.push({ roomId, messageId, score, reason });
        return Promise.resolve();
      },
      userId: '@test:example.com',
      isConnected: true,
    };
  });

  // Mock React context
  await page.addInitScript(() => {
    // Mock the useMatrixClient hook
    const originalUseMatrixClient = (window as any).useMatrixClient;
    (window as any).useMatrixClient = () => (window as any).mockMatrixClient;
  });
}

test.describe('Message Reporting Modal (Radix UI)', () => {
  let page: Page;
  let context: BrowserContext;

  test.beforeEach(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
    
    // Setup mocks
    await setupPageWithMocks(page);
    
    // Navigate to the component test page (Radix UI version)
    await page.goto('/test-report-modal-radix');
    
    // Wait for the component to be ready
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(async () => {
    if (context) {
      await context.close();
    }
  });

  test('should render the modal with all required elements', async () => {
    // Open the modal
    await page.locator('[data-testid="open-report-modal"]').click();
    
    // Check modal title
    await expect(page.locator('text=Report Message')).toBeVisible();
    
    // Check that the reported message preview is shown
    await expect(page.locator('text=Reported Message:')).toBeVisible();
    await expect(page.locator(`text=${mockMessageData.eventContent.body}`)).toBeVisible();
    await expect(page.locator(`text=From: ${mockMessageData.eventContent.sender}`)).toBeVisible();
    
    // Check form elements
    await expect(page.locator('[data-testid="report-reason-select"]')).toBeVisible();
    await expect(page.locator('[data-testid="report-details-textarea"]')).toBeVisible();
    await expect(page.locator('[data-testid="submit-report-button"]')).toBeVisible();
    
    // Check buttons
    await expect(page.locator('text=Cancel')).toBeVisible();
    await expect(page.locator('[data-testid="submit-report-button"]')).toContainText('Report Message');
    
    // Check warning note
    await expect(page.locator('text=False reports may result in action taken against your account')).toBeVisible();
  });

  test('should require a reason to be selected before submission', async () => {
    await page.locator('[data-testid="open-report-modal"]').click();
    
    // Try to submit without selecting a reason
    await page.locator('[data-testid="submit-report-button"]').click();
    
    // Should show validation error
    await expect(page.locator('text=Please select a reason for reporting')).toBeVisible();
  });

  test('should successfully submit a basic report', async () => {
    await page.locator('[data-testid="open-report-modal"]').click();
    
    // Select a reason
    await page.locator('[data-testid="report-reason-select"]').click();
    await page.locator('text=Spam').click();
    
    // Submit the report
    await page.locator('[data-testid="submit-report-button"]').click();
    
    // Check loading state
    await expect(page.locator('[data-testid="submit-report-button"]')).toContainText('Reporting...');
    
    // Wait for success (modal should close)
    await expect(page.locator('text=Report Message').first()).not.toBeVisible({ timeout: 5000 });
    
    // Verify the Matrix API was called correctly
    const reportCalls = await page.evaluate(() => (window as any).reportEventCalls);
    expect(reportCalls).toHaveLength(1);
    expect(reportCalls[0]).toMatchObject({
      roomId: mockMessageData.roomId,
      messageId: mockMessageData.messageId,
      score: -100,
      reason: 'spam'
    });
  });

  test('should submit report with additional details', async () => {
    await page.locator('[data-testid="open-report-modal"]').click();
    
    // Select a reason
    await page.locator('[data-testid="report-reason-select"]').click();
    await page.locator('text=Harassment or Abuse').click();
    
    // Add details
    const additionalDetails = 'This user has been repeatedly sending inappropriate messages';
    await page.locator('[data-testid="report-details-textarea"]').fill(additionalDetails);
    
    // Submit the report
    await page.locator('[data-testid="submit-report-button"]').click();
    
    // Wait for success (modal should close)
    await expect(page.locator('text=Report Message').first()).not.toBeVisible({ timeout: 5000 });
    
    // Verify two API calls were made (one for reason, one for detailed reason)
    const reportCalls = await page.evaluate(() => (window as any).reportEventCalls);
    expect(reportCalls).toHaveLength(2);
    expect(reportCalls[0].reason).toBe('harassment');
    expect(reportCalls[1].reason).toBe(`harassment: ${additionalDetails}`);
  });

  test('should handle different report reasons correctly', async () => {
    const testReasons = [
      { display: 'Spam', value: 'spam' },
      { display: 'Hate Speech', value: 'hate_speech' },
      { display: 'Illegal Content', value: 'illegal' },
      { display: 'Other', value: 'other' }
    ];

    for (const reason of testReasons) {
      await page.locator('[data-testid="open-report-modal"]').click();
      
      // Select the reason
      await page.locator('[data-testid="report-reason-select"]').click();
      await page.locator(`text=${reason.display}`).click();
      
      // Submit
      await page.locator('[data-testid="submit-report-button"]').click();
      
      // Wait for completion (modal closes)
      await expect(page.locator('text=Report Message').first()).not.toBeVisible({ timeout: 5000 });
      
      // Clear previous calls for clean testing
      await page.evaluate(() => { (window as any).reportEventCalls = []; });
    }
  });

  test('should handle rate limiting error (429)', async () => {
    // Mock rate limiting error
    await page.addInitScript(() => {
      (window as any).mockMatrixClient.reportEvent = async () => {
        throw { httpStatus: 429, message: 'Too Many Requests' };
      };
    });

    await page.locator('[data-testid="open-report-modal"]').click();
    
    // Submit a report
    await page.locator('[data-testid="report-reason-select"]').click();
    await page.locator('text=Spam').click();
    await page.locator('[data-testid="submit-report-button"]').click();
    
    // Should show rate limiting error
    await expect(page.locator('text=Too many reports sent. Please wait before reporting again.')).toBeVisible();
  });

  test('should handle permission error (403)', async () => {
    // Mock permission error
    await page.addInitScript(() => {
      (window as any).mockMatrixClient.reportEvent = async () => {
        throw { httpStatus: 403, message: 'Forbidden' };
      };
    });

    await page.locator('[data-testid="open-report-modal"]').click();
    
    // Submit a report
    await page.locator('[data-testid="report-reason-select"]').click();
    await page.locator('text=Spam').click();
    await page.locator('[data-testid="submit-report-button"]').click();
    
    // Should show permission error
    await expect(page.locator('text=You do not have permission to report messages in this room.')).toBeVisible();
  });

  test('should handle not found error (404)', async () => {
    // Mock not found error
    await page.addInitScript(() => {
      (window as any).mockMatrixClient.reportEvent = async () => {
        throw { httpStatus: 404, message: 'Not Found' };
      };
    });

    await page.locator('[data-testid="open-report-modal"]').click();
    
    // Submit a report
    await page.locator('[data-testid="report-reason-select"]').click();
    await page.locator('text=Spam').click();
    await page.locator('[data-testid="submit-report-button"]').click();
    
    // Should show not found error
    await expect(page.locator('text=Message or room not found. It may have been deleted.')).toBeVisible();
  });

  test('should handle network errors with retry functionality', async () => {
    // Mock network error
    await page.addInitScript(() => {
      (window as any).mockMatrixClient.reportEvent = async () => {
        throw { name: 'NetworkError', message: 'Failed to fetch' };
      };
    });

    await page.locator('[data-testid="open-report-modal"]').click();
    
    // Submit a report
    await page.locator('[data-testid="report-reason-select"]').click();
    await page.locator('text=Spam').click();
    await page.locator('[data-testid="submit-report-button"]').click();
    
    // Should show network error with retry button
    await expect(page.locator('text=Network error. Please check your connection and try again.')).toBeVisible();
    await expect(page.locator('[data-testid="retry-report-button"]')).toBeVisible();
  });

  test('should retry with same values when retry button is clicked', async () => {
    let callCount = 0;
    
    // Mock network error for first call, success for second
    await page.addInitScript(() => {
      let callCount = 0;
      (window as any).mockMatrixClient.reportEvent = async (roomId: string, messageId: string, score: number, reason: string) => {
        callCount++;
        (window as any).reportEventCalls = (window as any).reportEventCalls || [];
        (window as any).reportEventCalls.push({ roomId, messageId, score, reason, callNumber: callCount });
        
        if (callCount === 1) {
          throw { name: 'NetworkError', message: 'Failed to fetch' };
        }
        return Promise.resolve();
      };
    });

    await page.locator('[data-testid="open-report-modal"]').click();
    
    // Submit a report
    await page.locator('[data-testid="report-reason-select"]').click();
    await page.locator('text=Spam').click();
    await page.locator('[data-testid="submit-report-button"]').click();
    
    // Wait for error and retry button
    await expect(page.locator('text=Network error. Please check your connection and try again.')).toBeVisible();
    await expect(page.locator('[data-testid="retry-report-button"]')).toBeVisible();
    
    // Click retry
    await page.locator('[data-testid="retry-report-button"]').click();
    
    // Should succeed on retry (modal should close)
    await expect(page.locator('text=Report Message').first()).not.toBeVisible({ timeout: 5000 });
    
    // Should have made two API calls with same parameters
    const reportCalls = await page.evaluate(() => (window as any).reportEventCalls);
    expect(reportCalls).toHaveLength(2);
    expect(reportCalls[0].reason).toBe('spam');
    expect(reportCalls[1].reason).toBe('spam');
  });

  test('should handle missing Matrix client gracefully', async () => {
    // Mock missing Matrix client
    await page.addInitScript(() => {
      (window as any).useMatrixClient = () => null;
    });

    await page.locator('[data-testid="open-report-modal"]').click();
    
    // Submit a report
    await page.locator('[data-testid="report-reason-select"]').click();
    await page.locator('text=Spam').click();
    await page.locator('[data-testid="submit-report-button"]').click();
    
    // Should show client unavailable error
    await expect(page.locator('text=Matrix client not available. Please try again later.')).toBeVisible();
  });

  test('should close modal on cancel', async () => {
    await page.locator('[data-testid="open-report-modal"]').click();
    
    // Modal should be visible
    await expect(page.locator('text=Report Message')).toBeVisible();
    
    // Click cancel
    await page.locator('text=Cancel').click();
    
    // Modal should be hidden
    await expect(page.locator('text=Report Message')).not.toBeVisible();
  });

  test('should reset form when modal is closed and reopened', async () => {
    await page.locator('[data-testid="open-report-modal"]').click();
    
    // Fill out form
    await page.locator('[data-testid="report-reason-select"]').click();
    await page.locator('text=Spam').click();
    await page.locator('[data-testid="report-details-textarea"]').fill('Test details');
    
    // Close modal via X button
    await page.locator('button[aria-label="Close"]').click();
    
    // Reopen modal
    await page.locator('[data-testid="open-report-modal"]').click();
    
    // Form should be reset
    await expect(page.locator('[data-testid="report-reason-select"]')).toContainText('Select a reason...');
    await expect(page.locator('[data-testid="report-details-textarea"]')).toHaveValue('');
  });

  test('should display character count for details textarea', async () => {
    await page.locator('[data-testid="open-report-modal"]').click();
    
    const testText = 'This is some additional context for the report';
    await page.locator('[data-testid="report-details-textarea"]').fill(testText);
    
    // Should show character count
    await expect(page.locator(`text=${testText.length} / 500 characters`)).toBeVisible();
  });

  test('should disable buttons during submission', async () => {
    await page.locator('[data-testid="open-report-modal"]').click();
    
    // Select a reason
    await page.locator('[data-testid="report-reason-select"]').click();
    await page.locator('text=Spam').click();
    
    // Mock a slow API call
    await page.addInitScript(() => {
      (window as any).mockMatrixClient.reportEvent = async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return Promise.resolve();
      };
    });
    
    // Submit the report
    await page.locator('[data-testid="submit-report-button"]').click();
    
    // Buttons should be disabled during loading
    await expect(page.locator('text=Cancel')).toHaveAttribute('disabled');
    await expect(page.locator('[data-testid="submit-report-button"]')).toContainText('Reporting...');
  });

  test('should display all available report reasons', async () => {
    await page.locator('[data-testid="open-report-modal"]').click();
    
    // Click reason select to open dropdown
    await page.locator('[data-testid="report-reason-select"]').click();
    
    // Check that all expected reasons are available
    const expectedReasons = [
      'Spam',
      'Harassment or Abuse',
      'Hate Speech',
      'Threats or Violence',
      'Illegal Content',
      'Inappropriate Content',
      'Misinformation',
      'Other'
    ];
    
    for (const reason of expectedReasons) {
      await expect(page.locator(`text=${reason}`)).toBeVisible();
    }
  });

  test('should be accessible via keyboard navigation', async () => {
    await page.locator('[data-testid="open-report-modal"]').click();
    
    // Focus should be on the modal
    await expect(page.locator('[role="dialog"]')).toBeFocused();
    
    // Tab through form elements
    await page.keyboard.press('Tab'); // Reason select
    await expect(page.locator('[data-testid="report-reason-select"]')).toBeFocused();
    
    await page.keyboard.press('Tab'); // Details textarea
    await expect(page.locator('[data-testid="report-details-textarea"]')).toBeFocused();
    
    await page.keyboard.press('Tab'); // Cancel button
    await expect(page.locator('text=Cancel')).toBeFocused();
    
    await page.keyboard.press('Tab'); // Submit button
    await expect(page.locator('[data-testid="submit-report-button"]')).toBeFocused();
  });
});