import { test, expect } from '@playwright/test';

/**
 * BDV2 Transcript Editor E2E Tests
 * Stories: BDV2-US-4.1 to BDV2-US-4.7
 * Epic: EPIC-04 Transcript Editor
 */
test.describe('BDV2 Transcript Editor', () => {
  
  // Helper function to login and navigate to a project with processed video
  async function setupProcessedProject(page: any) {
    // Login
    await page.goto('/login');
    await page.getByTestId('username-input').fill('demo');
    await page.getByTestId('password-input').fill('demo');
    await page.getByTestId('login-button').click();
    await page.waitForURL(/.*\/dashboard/);
    
    // Create project
    await page.getByTestId('create-project-button').click();
    await page.getByTestId('project-name-input').fill('Transcript Editor Test');
    await page.getByTestId('create-project-submit').click();
    await page.waitForURL(/.*\/projects\/.*/);
    
    // Mock processed video with transcript
    await page.evaluate(() => {
      window.mockProcessedVideo = {
        id: 'test-video-1',
        name: 'sample-sermon.mp4',
        duration: 1800, // 30 minutes
        transcript: [
          { id: 1, start: 0, end: 5, text: "Welcome to today's Bible study." },
          { id: 2, start: 5, end: 12, text: "We'll be looking at the book of Genesis." },
          { id: 3, start: 12, end: 18, text: "Let's start with chapter one, verse one." },
          { id: 4, start: 18, end: 25, text: "In the beginning, God created the heavens and the earth." },
          { id: 5, start: 25, end: 30, text: "This is a foundational verse for our faith." }
        ]
      };
    });
    
    // Navigate to transcript editor
    await page.getByTestId('edit-transcript-button').click();
    await page.waitForURL(/.*\/projects\/.*\/transcript/);
  }

  test.describe('Display Transcript (BDV2-US-4.1)', () => {
    test('should display transcript with proper formatting', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Transcript container should be visible
      await expect(page.getByTestId('transcript-editor')).toBeVisible();
      
      // Transcript segments should be displayed
      await expect(page.getByTestId('transcript-segment-1')).toBeVisible();
      await expect(page.getByTestId('transcript-segment-2')).toBeVisible();
      
      // Text content should be visible
      await expect(page.getByText("Welcome to today's Bible study.")).toBeVisible();
      await expect(page.getByText("We'll be looking at the book of Genesis.")).toBeVisible();
    });

    test('should display timestamps for each segment', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Timestamps should be visible
      await expect(page.getByTestId('timestamp-1')).toBeVisible();
      await expect(page.getByTestId('timestamp-2')).toBeVisible();
      
      // Timestamp format should be correct (MM:SS)
      await expect(page.getByTestId('timestamp-1')).toContainText('00:00');
      await expect(page.getByTestId('timestamp-2')).toContainText('00:05');
    });

    test('should highlight currently playing segment', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Start playback
      await page.getByTestId('play-button').click();
      
      // First segment should be highlighted
      await expect(page.getByTestId('transcript-segment-1')).toHaveClass(/active/);
      
      // Seek to different time
      await page.getByTestId('video-player').click({ position: { x: 100, y: 50 } });
      
      // Different segment should be highlighted based on current time
      await expect(page.getByTestId('transcript-segment-2')).toHaveClass(/active/);
    });

    test('should display confidence scores for transcript segments', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Confidence indicators should be visible
      await expect(page.getByTestId('confidence-indicator-1')).toBeVisible();
      
      // Low confidence segments should be marked
      await page.evaluate(() => {
        window.mockLowConfidenceSegment = { id: 3, confidence: 0.6 };
      });
      
      await expect(page.getByTestId('low-confidence-warning')).toBeVisible();
    });
  });

  test.describe('Select and Remove Text (BDV2-US-4.2)', () => {
    test('should allow selecting text segments', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Click on a segment to select it
      await page.getByTestId('transcript-segment-2').click();
      
      // Segment should be selected
      await expect(page.getByTestId('transcript-segment-2')).toHaveClass(/selected/);
      
      // Selection toolbar should appear
      await expect(page.getByTestId('selection-toolbar')).toBeVisible();
    });

    test('should allow multi-select with Ctrl+click', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Select first segment
      await page.getByTestId('transcript-segment-1').click();
      
      // Ctrl+click second segment
      await page.getByTestId('transcript-segment-3').click({ modifiers: ['Control'] });
      
      // Both segments should be selected
      await expect(page.getByTestId('transcript-segment-1')).toHaveClass(/selected/);
      await expect(page.getByTestId('transcript-segment-3')).toHaveClass(/selected/);
      
      // Selection count should show 2
      await expect(page.getByTestId('selection-count')).toContainText('2 segments selected');
    });

    test('should allow range selection with Shift+click', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Select first segment
      await page.getByTestId('transcript-segment-1').click();
      
      // Shift+click third segment
      await page.getByTestId('transcript-segment-3').click({ modifiers: ['Shift'] });
      
      // Range should be selected (segments 1, 2, 3)
      await expect(page.getByTestId('transcript-segment-1')).toHaveClass(/selected/);
      await expect(page.getByTestId('transcript-segment-2')).toHaveClass(/selected/);
      await expect(page.getByTestId('transcript-segment-3')).toHaveClass(/selected/);
      
      await expect(page.getByTestId('selection-count')).toContainText('3 segments selected');
    });

    test('should mark selected text for removal with strikethrough', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Select a segment
      await page.getByTestId('transcript-segment-2').click();
      
      // Click remove button
      await page.getByTestId('remove-selection-button').click();
      
      // Segment should have strikethrough styling
      await expect(page.getByTestId('transcript-segment-2')).toHaveClass(/removed/);
      
      // Text should visually indicate removal
      const segmentText = page.getByTestId('transcript-segment-2');
      await expect(segmentText).toHaveCSS('text-decoration', /line-through/);
    });

    test('should allow removing multiple segments at once', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Multi-select segments
      await page.getByTestId('transcript-segment-2').click();
      await page.getByTestId('transcript-segment-3').click({ modifiers: ['Control'] });
      
      // Remove selection
      await page.getByTestId('remove-selection-button').click();
      
      // Both segments should be marked as removed
      await expect(page.getByTestId('transcript-segment-2')).toHaveClass(/removed/);
      await expect(page.getByTestId('transcript-segment-3')).toHaveClass(/removed/);
    });
  });

  test.describe('Show Removed Sections (BDV2-US-4.3)', () => {
    test('should have toggle to show/hide removed sections', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Remove a segment first
      await page.getByTestId('transcript-segment-2').click();
      await page.getByTestId('remove-selection-button').click();
      
      // Toggle should be visible
      await expect(page.getByTestId('show-removed-toggle')).toBeVisible();
      await expect(page.getByText('Show removed sections')).toBeVisible();
    });

    test('should hide removed sections when toggle is off', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Remove a segment
      await page.getByTestId('transcript-segment-2').click();
      await page.getByTestId('remove-selection-button').click();
      
      // Turn off show removed toggle
      await page.getByTestId('show-removed-toggle').click();
      
      // Removed segment should not be visible
      await expect(page.getByTestId('transcript-segment-2')).not.toBeVisible();
      
      // Other segments should still be visible
      await expect(page.getByTestId('transcript-segment-1')).toBeVisible();
      await expect(page.getByTestId('transcript-segment-3')).toBeVisible();
    });

    test('should show removed sections when toggle is on', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Remove a segment
      await page.getByTestId('transcript-segment-2').click();
      await page.getByTestId('remove-selection-button').click();
      
      // Turn off toggle, then on again
      await page.getByTestId('show-removed-toggle').click();
      await page.getByTestId('show-removed-toggle').click();
      
      // Removed segment should be visible with strikethrough
      await expect(page.getByTestId('transcript-segment-2')).toBeVisible();
      await expect(page.getByTestId('transcript-segment-2')).toHaveClass(/removed/);
    });

    test('should allow restoring removed sections', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Remove a segment
      await page.getByTestId('transcript-segment-2').click();
      await page.getByTestId('remove-selection-button').click();
      
      // Select the removed segment
      await page.getByTestId('transcript-segment-2').click();
      
      // Restore button should be available
      await expect(page.getByTestId('restore-selection-button')).toBeVisible();
      
      // Restore the segment
      await page.getByTestId('restore-selection-button').click();
      
      // Segment should no longer be marked as removed
      await expect(page.getByTestId('transcript-segment-2')).not.toHaveClass(/removed/);
    });
  });

  test.describe('Video-Transcript Sync (BDV2-US-4.4)', () => {
    test('should sync video playback with transcript highlighting', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Start video playback
      await page.getByTestId('play-button').click();
      
      // First segment should be highlighted
      await expect(page.getByTestId('transcript-segment-1')).toHaveClass(/active/);
      
      // Wait for video to progress (mock)
      await page.evaluate(() => {
        window.mockVideoTime = 7; // 7 seconds
      });
      
      // Second segment should now be highlighted
      await expect(page.getByTestId('transcript-segment-2')).toHaveClass(/active/);
    });

    test('should seek video when clicking on transcript segment', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Click on a transcript segment
      await page.getByTestId('transcript-segment-3').click();
      
      // Video should seek to that timestamp
      const currentTime = await page.evaluate(() => {
        return window.mockVideoElement?.currentTime || 0;
      });
      
      expect(currentTime).toBeCloseTo(12, 1); // Segment 3 starts at 12 seconds
    });

    test('should auto-scroll transcript to follow video playback', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Mock longer transcript that requires scrolling
      await page.evaluate(() => {
        window.mockLongTranscript = true;
      });
      
      // Start playback
      await page.getByTestId('play-button').click();
      
      // Mock video time far in transcript
      await page.evaluate(() => {
        window.mockVideoTime = 120; // 2 minutes
      });
      
      // Transcript should auto-scroll
      const scrollTop = await page.evaluate(() => {
        return document.querySelector('[data-testid="transcript-editor"]')?.scrollTop || 0;
      });
      
      expect(scrollTop).toBeGreaterThan(0);
    });

    test('should show visual sync between video and transcript', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Play video
      await page.getByTestId('play-button').click();
      
      // Progress indicator should be visible
      await expect(page.getByTestId('sync-indicator')).toBeVisible();
      
      // Active segment should have visual emphasis
      const activeSegment = page.getByTestId('transcript-segment-1');
      await expect(activeSegment).toHaveClass(/active/);
      
      // Check for glow or border effect
      await expect(activeSegment).toHaveCSS('border-color', /rgb\(59, 130, 246\)/); // Blue border
    });
  });

  test.describe('Undo/Redo System (BDV2-US-4.5)', () => {
    test('should provide undo/redo buttons', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Undo/Redo buttons should be visible
      await expect(page.getByTestId('undo-button')).toBeVisible();
      await expect(page.getByTestId('redo-button')).toBeVisible();
      
      // Initially should be disabled
      await expect(page.getByTestId('undo-button')).toBeDisabled();
      await expect(page.getByTestId('redo-button')).toBeDisabled();
    });

    test('should enable undo after making changes', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Make a change (remove a segment)
      await page.getByTestId('transcript-segment-2').click();
      await page.getByTestId('remove-selection-button').click();
      
      // Undo button should be enabled
      await expect(page.getByTestId('undo-button')).not.toBeDisabled();
    });

    test('should undo removal actions', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Remove a segment
      await page.getByTestId('transcript-segment-2').click();
      await page.getByTestId('remove-selection-button').click();
      
      // Segment should be marked as removed
      await expect(page.getByTestId('transcript-segment-2')).toHaveClass(/removed/);
      
      // Undo the action
      await page.getByTestId('undo-button').click();
      
      // Segment should be restored
      await expect(page.getByTestId('transcript-segment-2')).not.toHaveClass(/removed/);
      
      // Redo button should now be enabled
      await expect(page.getByTestId('redo-button')).not.toBeDisabled();
    });

    test('should redo undone actions', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Remove segment, then undo
      await page.getByTestId('transcript-segment-2').click();
      await page.getByTestId('remove-selection-button').click();
      await page.getByTestId('undo-button').click();
      
      // Redo the removal
      await page.getByTestId('redo-button').click();
      
      // Segment should be marked as removed again
      await expect(page.getByTestId('transcript-segment-2')).toHaveClass(/removed/);
    });

    test('should show action history', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Make multiple changes
      await page.getByTestId('transcript-segment-2').click();
      await page.getByTestId('remove-selection-button').click();
      
      await page.getByTestId('transcript-segment-3').click();
      await page.getByTestId('remove-selection-button').click();
      
      // History dropdown should show actions
      await page.getByTestId('history-dropdown').click();
      await expect(page.getByText('Remove segment 2')).toBeVisible();
      await expect(page.getByText('Remove segment 3')).toBeVisible();
    });

    test('should handle keyboard shortcuts for undo/redo', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Remove a segment
      await page.getByTestId('transcript-segment-2').click();
      await page.getByTestId('remove-selection-button').click();
      
      // Undo with Ctrl+Z
      await page.keyboard.press('Control+z');
      
      // Segment should be restored
      await expect(page.getByTestId('transcript-segment-2')).not.toHaveClass(/removed/);
      
      // Redo with Ctrl+Y
      await page.keyboard.press('Control+y');
      
      // Segment should be removed again
      await expect(page.getByTestId('transcript-segment-2')).toHaveClass(/removed/);
    });
  });

  test.describe('Search and Navigation (BDV2-US-4.7)', () => {
    test('should provide search functionality', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Search input should be visible
      await expect(page.getByTestId('transcript-search')).toBeVisible();
      await expect(page.getByPlaceholder(/search transcript/i)).toBeVisible();
    });

    test('should highlight search results', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Search for text
      await page.getByTestId('transcript-search').fill('Genesis');
      
      // Search results should be highlighted
      await expect(page.getByTestId('search-highlight')).toBeVisible();
      
      // Result count should be shown
      await expect(page.getByTestId('search-results-count')).toContainText('1 result');
    });

    test('should navigate between search results', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Search for common word
      await page.getByTestId('transcript-search').fill('the');
      
      // Navigation buttons should be visible
      await expect(page.getByTestId('search-prev-button')).toBeVisible();
      await expect(page.getByTestId('search-next-button')).toBeVisible();
      
      // Current result indicator
      await expect(page.getByTestId('current-result')).toContainText('1 of');
      
      // Navigate to next result
      await page.getByTestId('search-next-button').click();
      await expect(page.getByTestId('current-result')).toContainText('2 of');
    });

    test('should clear search results', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Perform search
      await page.getByTestId('transcript-search').fill('Bible');
      
      // Clear search
      await page.getByTestId('clear-search-button').click();
      
      // Search input should be empty
      await expect(page.getByTestId('transcript-search')).toHaveValue('');
      
      // Highlights should be removed
      await expect(page.getByTestId('search-highlight')).not.toBeVisible();
    });
  });

  test.describe('Multi-Viewport Transcript Editor Tests', () => {
    const viewports = [
      { name: 'Desktop', width: 1920, height: 1080 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Mobile', width: 375, height: 667 }
    ];

    viewports.forEach(({ name, width, height }) => {
      test(`should work on ${name} viewport (${width}x${height})`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        await setupProcessedProject(page);
        
        // Core functionality should be accessible
        await expect(page.getByTestId('transcript-editor')).toBeVisible();
        await expect(page.getByTestId('play-button')).toBeVisible();
        
        // Selection should work
        await page.getByTestId('transcript-segment-1').click();
        await expect(page.getByTestId('transcript-segment-1')).toHaveClass(/selected/);
        
        // Take screenshot for visual validation
        await page.screenshot({ 
          path: `tests/screenshots/transcript-${name.toLowerCase()}.png`,
          fullPage: true
        });
      });
    });
  });
});