import { test, expect } from '@playwright/test';

/**
 * BDV2 Video Export E2E Tests
 * Stories: BDV2-US-8.1 to BDV2-US-8.7
 * Epic: EPIC-08 Video Export & Publishing
 */
test.describe('BDV2 Video Export & Publishing', () => {
  
  // Helper function to setup project with processed video ready for export
  async function setupProcessedProject(page: any) {
    // Login
    await page.goto('/login');
    await page.getByTestId('username-input').fill('demo');
    await page.getByTestId('password-input').fill('demo');
    await page.getByTestId('login-button').click();
    await page.waitForURL(/.*\/dashboard/);
    
    // Create and setup processed project
    await page.getByTestId('create-project-button').click();
    await page.getByTestId('project-name-input').fill('Export Test Project');
    await page.getByTestId('create-project-submit').click();
    await page.waitForURL(/.*\/projects\/.*/);
    
    // Mock processed video ready for export
    await page.evaluate(() => {
      window.mockProcessedVideo = {
        id: 'processed-video-1',
        name: 'edited-sermon.mp4',
        originalDuration: 1800,
        editedDuration: 1620,
        status: 'processed',
        hasTranscript: true,
        transcript: [
          { id: 1, start: 0, end: 5, text: "Welcome to today's Bible study.", removed: false },
          { id: 2, start: 5, end: 12, text: "We'll be looking at the book of Genesis.", removed: false },
          { id: 3, start: 12, end: 18, text: "Let's start with chapter one, verse one.", removed: true },
          { id: 4, start: 18, end: 25, text: "In the beginning, God created the heavens and the earth.", removed: false }
        ]
      };
    });
    
    // Navigate to export page
    await page.getByTestId('export-video-button').click();
    await page.waitForURL(/.*\/projects\/.*\/export/);
  }

  test.describe('Export Video (BDV2-US-8.1)', () => {
    test('should display export interface with video preview', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Export interface should be visible
      await expect(page.getByTestId('export-interface')).toBeVisible();
      await expect(page.getByRole('heading', { name: /export video/i })).toBeVisible();
      
      // Video preview should be available
      await expect(page.getByTestId('export-preview-player')).toBeVisible();
      await expect(page.getByTestId('preview-duration')).toContainText('27:00'); // Edited duration
    });

    test('should show export summary with edit statistics', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Export summary should be visible
      await expect(page.getByTestId('export-summary')).toBeVisible();
      await expect(page.getByText('Original duration: 30:00')).toBeVisible();
      await expect(page.getByText('Final duration: 27:00')).toBeVisible();
      await expect(page.getByText('Time saved: 3:00')).toBeVisible();
    });

    test('should allow previewing final export before rendering', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Preview button should be available
      await expect(page.getByTestId('preview-export-button')).toBeVisible();
      
      // Click preview
      await page.getByTestId('preview-export-button').click();
      
      // Preview modal should open
      await expect(page.getByTestId('export-preview-modal')).toBeVisible();
      
      // Video player should show edited version
      await expect(page.getByTestId('preview-player')).toBeVisible();
      
      // Removed sections should not be in preview
      await page.getByTestId('preview-player').click(); // Start playback
      // Would need to test that removed transcript sections are actually skipped
    });

    test('should start export process with default settings', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Export button should be available
      await expect(page.getByTestId('start-export-button')).toBeVisible();
      
      // Start export
      await page.getByTestId('start-export-button').click();
      
      // Export progress should begin
      await expect(page.getByTestId('export-progress')).toBeVisible();
      await expect(page.getByText(/export started/i)).toBeVisible();
    });

    test('should show export progress with detailed steps', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Start export
      await page.getByTestId('start-export-button').click();
      
      // Export steps should be visible
      await expect(page.getByTestId('export-step-rendering')).toBeVisible();
      await expect(page.getByTestId('export-step-encoding')).toBeVisible();
      await expect(page.getByTestId('export-step-finalizing')).toBeVisible();
      
      // Progress percentage should be shown
      await expect(page.getByTestId('export-percentage')).toBeVisible();
      
      // ETA should be displayed
      await expect(page.getByTestId('export-eta')).toBeVisible();
    });

    test('should handle export completion and provide download', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Mock export completion
      await page.evaluate(() => {
        window.mockExportComplete = {
          videoPath: '/exports/edited-sermon-final.mp4',
          size: 450000000, // 450MB
          duration: 1620
        };
      });
      
      await page.getByTestId('start-export-button').click();
      
      // Export completion should be shown
      await expect(page.getByText(/export complete/i)).toBeVisible();
      
      // Download button should be available
      await expect(page.getByTestId('download-video-button')).toBeVisible();
      
      // Video info should be displayed
      await expect(page.getByText('File size: 450 MB')).toBeVisible();
      await expect(page.getByText('Duration: 27:00')).toBeVisible();
    });
  });

  test.describe('Quality Presets (BDV2-US-8.2)', () => {
    test('should provide quality preset options', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Quality preset selector should be visible
      await expect(page.getByTestId('quality-preset-selector')).toBeVisible();
      await expect(page.getByText(/export quality/i)).toBeVisible();
      
      // Preset options should be available
      await page.getByTestId('quality-preset-selector').click();
      await expect(page.getByText('YouTube 1080p')).toBeVisible();
      await expect(page.getByText('YouTube 720p')).toBeVisible();
      await expect(page.getByText('Web Optimized')).toBeVisible();
      await expect(page.getByText('High Quality')).toBeVisible();
    });

    test('should show preset details when selected', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Select a preset
      await page.getByTestId('quality-preset-selector').click();
      await page.getByText('YouTube 1080p').click();
      
      // Preset details should be displayed
      await expect(page.getByTestId('preset-details')).toBeVisible();
      await expect(page.getByText('Resolution: 1920x1080')).toBeVisible();
      await expect(page.getByText('Bitrate: 8000 kbps')).toBeVisible();
      await expect(page.getByText('Format: MP4 (H.264)')).toBeVisible();
    });

    test('should estimate file size for selected preset', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Select preset
      await page.getByTestId('quality-preset-selector').click();
      await page.getByText('YouTube 1080p').click();
      
      // File size estimate should be shown
      await expect(page.getByTestId('estimated-file-size')).toBeVisible();
      await expect(page.getByText(/estimated size: ~600 MB/i)).toBeVisible();
      
      // Export time estimate
      await expect(page.getByTestId('estimated-export-time')).toBeVisible();
      await expect(page.getByText(/estimated time: ~15 minutes/i)).toBeVisible();
    });

    test('should allow custom quality settings', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Select custom preset
      await page.getByTestId('quality-preset-selector').click();
      await page.getByText('Custom').click();
      
      // Custom settings should be available
      await expect(page.getByTestId('custom-resolution-select')).toBeVisible();
      await expect(page.getByTestId('custom-bitrate-input')).toBeVisible();
      await expect(page.getByTestId('custom-format-select')).toBeVisible();
    });

    test('should validate custom settings', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Select custom preset
      await page.getByTestId('quality-preset-selector').click();
      await page.getByText('Custom').click();
      
      // Enter invalid bitrate
      await page.getByTestId('custom-bitrate-input').fill('99999999');
      
      // Validation error should appear
      await expect(page.getByTestId('bitrate-error')).toContainText('Bitrate too high');
      
      // Export button should be disabled
      await expect(page.getByTestId('start-export-button')).toBeDisabled();
    });
  });

  test.describe('Generate Subtitles (BDV2-US-8.3)', () => {
    test('should provide subtitle generation options', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Subtitle options should be visible
      await expect(page.getByTestId('subtitle-options')).toBeVisible();
      await expect(page.getByTestId('include-subtitles-checkbox')).toBeVisible();
      await expect(page.getByText(/include subtitles/i)).toBeVisible();
    });

    test('should show subtitle format options', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Enable subtitles
      await page.getByTestId('include-subtitles-checkbox').check();
      
      // Format options should appear
      await expect(page.getByTestId('subtitle-format-selector')).toBeVisible();
      
      // Format options should be available
      await page.getByTestId('subtitle-format-selector').click();
      await expect(page.getByText('SRT')).toBeVisible();
      await expect(page.getByText('VTT')).toBeVisible();
      await expect(page.getByText('Embedded')).toBeVisible();
    });

    test('should allow customizing subtitle appearance', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Enable subtitles
      await page.getByTestId('include-subtitles-checkbox').check();
      
      // Appearance options should be available
      await expect(page.getByTestId('subtitle-font-select')).toBeVisible();
      await expect(page.getByTestId('subtitle-size-slider')).toBeVisible();
      await expect(page.getByTestId('subtitle-color-picker')).toBeVisible();
    });

    test('should preview subtitles in export preview', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Enable subtitles
      await page.getByTestId('include-subtitles-checkbox').check();
      
      // Preview export
      await page.getByTestId('preview-export-button').click();
      
      // Subtitles should be visible in preview
      await expect(page.getByTestId('subtitle-display')).toBeVisible();
      await expect(page.getByText("Welcome to today's Bible study.")).toBeVisible();
    });

    test('should generate subtitle files alongside video', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Enable subtitles with SRT format
      await page.getByTestId('include-subtitles-checkbox').check();
      await page.getByTestId('subtitle-format-selector').click();
      await page.getByText('SRT').click();
      
      // Start export
      await page.getByTestId('start-export-button').click();
      
      // Mock export completion
      await page.evaluate(() => {
        window.mockExportComplete = true;
        window.mockSubtitleFiles = ['edited-sermon.srt'];
      });
      
      // Subtitle file download should be available
      await expect(page.getByTestId('download-subtitles-button')).toBeVisible();
      await expect(page.getByText('edited-sermon.srt')).toBeVisible();
    });
  });

  test.describe('Generate Thumbnail (BDV2-US-8.4)', () => {
    test('should provide thumbnail generation options', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Thumbnail options should be visible
      await expect(page.getByTestId('thumbnail-options')).toBeVisible();
      await expect(page.getByTestId('generate-thumbnail-checkbox')).toBeVisible();
    });

    test('should allow selecting thumbnail timestamp', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Enable thumbnail generation
      await page.getByTestId('generate-thumbnail-checkbox').check();
      
      // Timestamp selector should appear
      await expect(page.getByTestId('thumbnail-timestamp-slider')).toBeVisible();
      await expect(page.getByTestId('thumbnail-timestamp-input')).toBeVisible();
    });

    test('should provide thumbnail preview', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Enable thumbnails
      await page.getByTestId('generate-thumbnail-checkbox').check();
      
      // Set timestamp
      await page.getByTestId('thumbnail-timestamp-input').fill('05:30');
      
      // Generate preview
      await page.getByTestId('generate-thumbnail-preview').click();
      
      // Preview should be shown
      await expect(page.getByTestId('thumbnail-preview-image')).toBeVisible();
    });

    test('should allow customizing thumbnail settings', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Enable thumbnails
      await page.getByTestId('generate-thumbnail-checkbox').check();
      
      // Customization options should be available
      await expect(page.getByTestId('thumbnail-resolution-select')).toBeVisible();
      await expect(page.getByTestId('thumbnail-format-select')).toBeVisible();
      await expect(page.getByTestId('thumbnail-quality-slider')).toBeVisible();
    });

    test('should generate thumbnail file with export', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Enable thumbnail generation
      await page.getByTestId('generate-thumbnail-checkbox').check();
      
      // Start export
      await page.getByTestId('start-export-button').click();
      
      // Mock completion with thumbnail
      await page.evaluate(() => {
        window.mockExportComplete = true;
        window.mockThumbnailFile = 'edited-sermon-thumb.jpg';
      });
      
      // Thumbnail download should be available
      await expect(page.getByTestId('download-thumbnail-button')).toBeVisible();
      await expect(page.getByText('edited-sermon-thumb.jpg')).toBeVisible();
    });
  });

  test.describe('Export History (BDV2-US-8.5)', () => {
    test('should maintain export history for project', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Export history section should be visible
      await expect(page.getByTestId('export-history')).toBeVisible();
      await expect(page.getByRole('heading', { name: /export history/i })).toBeVisible();
    });

    test('should show previous exports with details', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Mock previous exports
      await page.evaluate(() => {
        window.mockExportHistory = [
          {
            id: 'export-1',
            timestamp: '2024-02-28T10:00:00Z',
            quality: 'YouTube 1080p',
            size: 450000000,
            status: 'completed'
          },
          {
            id: 'export-2',
            timestamp: '2024-02-27T15:30:00Z',
            quality: 'Web Optimized',
            size: 250000000,
            status: 'completed'
          }
        ];
      });
      
      // Export history items should be displayed
      await expect(page.getByTestId('export-history-item-1')).toBeVisible();
      await expect(page.getByTestId('export-history-item-2')).toBeVisible();
      
      // Export details should be shown
      await expect(page.getByText('YouTube 1080p')).toBeVisible();
      await expect(page.getByText('450 MB')).toBeVisible();
    });

    test('should allow re-downloading previous exports', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Mock export history
      await page.evaluate(() => {
        window.mockExportHistory = [
          { id: 'export-1', status: 'completed', downloadUrl: '/exports/video-1.mp4' }
        ];
      });
      
      // Download button should be available for completed exports
      await expect(page.getByTestId('download-previous-export-1')).toBeVisible();
    });

    test('should allow deleting old exports', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Mock export history
      await page.evaluate(() => {
        window.mockExportHistory = [
          { id: 'export-1', status: 'completed' }
        ];
      });
      
      // Delete button should be available
      await expect(page.getByTestId('delete-export-1')).toBeVisible();
      
      // Click delete
      await page.getByTestId('delete-export-1').click();
      
      // Confirmation dialog should appear
      await expect(page.getByTestId('delete-export-confirmation')).toBeVisible();
      
      // Confirm deletion
      await page.getByTestId('confirm-delete-export').click();
      
      // Export should be removed from history
      await expect(page.getByTestId('export-history-item-1')).not.toBeVisible();
    });
  });

  test.describe('Export Notifications (BDV2-US-8.7)', () => {
    test('should show in-app notifications during export', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Start export
      await page.getByTestId('start-export-button').click();
      
      // Export started notification
      await expect(page.getByTestId('notification-export-started')).toBeVisible();
      await expect(page.getByText(/export started/i)).toBeVisible();
    });

    test('should show progress notifications', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Start export and mock progress updates
      await page.getByTestId('start-export-button').click();
      
      await page.evaluate(() => {
        window.mockProgressNotification = { step: 'encoding', percentage: 50 };
      });
      
      // Progress notification should update
      await expect(page.getByTestId('progress-notification')).toBeVisible();
      await expect(page.getByText('Encoding... 50%')).toBeVisible();
    });

    test('should show completion notification', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Start export and mock completion
      await page.getByTestId('start-export-button').click();
      
      await page.evaluate(() => {
        window.mockExportComplete = true;
      });
      
      // Completion notification should appear
      await expect(page.getByTestId('notification-export-complete')).toBeVisible();
      await expect(page.getByText(/export complete/i)).toBeVisible();
      
      // Notification should have download link
      await expect(page.getByTestId('notification-download-link')).toBeVisible();
    });

    test('should show error notifications on failure', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Start export and mock error
      await page.getByTestId('start-export-button').click();
      
      await page.evaluate(() => {
        window.mockExportError = 'Encoding failed: insufficient disk space';
      });
      
      // Error notification should appear
      await expect(page.getByTestId('notification-export-error')).toBeVisible();
      await expect(page.getByText('Encoding failed: insufficient disk space')).toBeVisible();
      
      // Retry option should be available
      await expect(page.getByTestId('notification-retry-button')).toBeVisible();
    });

    test('should allow dismissing notifications', async ({ page }) => {
      await setupProcessedProject(page);
      
      await page.getByTestId('start-export-button').click();
      
      // Dismiss button should be available
      await expect(page.getByTestId('dismiss-notification-button')).toBeVisible();
      
      // Click dismiss
      await page.getByTestId('dismiss-notification-button').click();
      
      // Notification should be hidden
      await expect(page.getByTestId('notification-export-started')).not.toBeVisible();
    });
  });

  test.describe('Multi-Viewport Export Tests', () => {
    const viewports = [
      { name: 'Desktop', width: 1920, height: 1080 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Mobile', width: 375, height: 667 }
    ];

    viewports.forEach(({ name, width, height }) => {
      test(`should work on ${name} viewport (${width}x${height})`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        await setupProcessedProject(page);
        
        // Core export functionality should be accessible
        await expect(page.getByTestId('quality-preset-selector')).toBeVisible();
        await expect(page.getByTestId('start-export-button')).toBeVisible();
        
        // Preview should work
        await page.getByTestId('preview-export-button').click();
        await expect(page.getByTestId('export-preview-modal')).toBeVisible();
        
        // Take screenshot for visual validation
        await page.screenshot({ 
          path: `tests/screenshots/export-${name.toLowerCase()}.png`,
          fullPage: true
        });
      });
    });
  });

  test.describe('Performance and Edge Cases', () => {
    test('should handle large video exports gracefully', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Mock large video
      await page.evaluate(() => {
        window.mockLargeVideo = {
          duration: 7200, // 2 hours
          originalSize: 2000000000 // 2GB
        };
      });
      
      // Warning about large file should be shown
      await expect(page.getByTestId('large-file-warning')).toBeVisible();
      await expect(page.getByText(/this is a large video/i)).toBeVisible();
    });

    test('should handle concurrent exports properly', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Start first export
      await page.getByTestId('start-export-button').click();
      
      // Try to start another export
      await page.getByTestId('start-export-button').click();
      
      // Should show queue or prevent concurrent exports
      await expect(page.getByText(/export in progress/i)).toBeVisible();
    });

    test('should recover from network interruptions', async ({ page }) => {
      await setupProcessedProject(page);
      
      // Start export
      await page.getByTestId('start-export-button').click();
      
      // Mock network interruption
      await page.evaluate(() => {
        window.mockNetworkError = true;
      });
      
      // Should show retry option
      await expect(page.getByTestId('network-error-notification')).toBeVisible();
      await expect(page.getByTestId('retry-export-button')).toBeVisible();
    });
  });
});