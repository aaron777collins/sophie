import { test, expect } from '@playwright/test';

/**
 * BDV2 Video Processing E2E Tests
 * Stories: BDV2-US-3.1 to BDV2-US-3.7
 * Epic: EPIC-03 Video Processing Pipeline
 */
test.describe('BDV2 Video Processing Pipeline', () => {
  
  // Helper function to setup project with uploaded video
  async function setupProjectWithVideo(page: any) {
    // Login
    await page.goto('/login');
    await page.getByTestId('username-input').fill('demo');
    await page.getByTestId('password-input').fill('demo');
    await page.getByTestId('login-button').click();
    await page.waitForURL(/.*\/dashboard/);
    
    // Create project
    await page.getByTestId('create-project-button').click();
    await page.getByTestId('project-name-input').fill('Processing Test Project');
    await page.getByTestId('create-project-submit').click();
    await page.waitForURL(/.*\/projects\/.*/);
    
    // Mock uploaded video
    await page.evaluate(() => {
      window.mockUploadedVideo = {
        id: 'test-video-1',
        name: 'raw-sermon.mp4',
        duration: 1800, // 30 minutes
        size: 500000000, // 500MB
        status: 'uploaded'
      };
    });
    
    return page.url();
  }

  test.describe('Automatic Processing Start (BDV2-US-3.1)', () => {
    test('should automatically start processing after upload completion', async ({ page }) => {
      await setupProjectWithVideo(page);
      
      // Processing should start automatically
      await expect(page.getByTestId('processing-status')).toBeVisible();
      await expect(page.getByText(/processing started/i)).toBeVisible();
      
      // Processing indicator should be active
      await expect(page.getByTestId('processing-indicator')).toHaveClass(/active/);
    });

    test('should show processing queue when multiple videos uploaded', async ({ page }) => {
      await setupProjectWithVideo(page);
      
      // Mock multiple videos
      await page.evaluate(() => {
        window.mockMultipleVideos = [
          { id: 'video-1', name: 'sermon-part-1.mp4', status: 'processing' },
          { id: 'video-2', name: 'sermon-part-2.mp4', status: 'queued' },
          { id: 'video-3', name: 'sermon-part-3.mp4', status: 'queued' }
        ];
      });
      
      // Queue should be visible
      await expect(page.getByTestId('processing-queue')).toBeVisible();
      await expect(page.getByText('2 videos in queue')).toBeVisible();
    });

    test('should allow manual processing start if auto-start disabled', async ({ page }) => {
      await setupProjectWithVideo(page);
      
      // Mock auto-start disabled
      await page.evaluate(() => {
        window.mockAutoStartDisabled = true;
      });
      
      // Manual start button should be visible
      await expect(page.getByTestId('start-processing-button')).toBeVisible();
      await expect(page.getByText(/start processing/i)).toBeVisible();
      
      // Click to start processing
      await page.getByTestId('start-processing-button').click();
      
      // Processing should begin
      await expect(page.getByTestId('processing-status')).toContainText('Processing');
    });

    test('should show processing configuration options', async ({ page }) => {
      await setupProjectWithVideo(page);
      
      // Configuration button should be visible
      await expect(page.getByTestId('processing-config-button')).toBeVisible();
      
      // Open configuration
      await page.getByTestId('processing-config-button').click();
      
      // Configuration modal should appear
      await expect(page.getByTestId('processing-config-modal')).toBeVisible();
      await expect(page.getByText(/processing settings/i)).toBeVisible();
    });
  });

  test.describe('Silence Removal (BDV2-US-3.2)', () => {
    test('should show silence removal step in processing pipeline', async ({ page }) => {
      await setupProjectWithVideo(page);
      
      // Start processing
      await page.getByTestId('start-processing-button').click();
      
      // Silence removal step should be visible
      await expect(page.getByTestId('step-silence-removal')).toBeVisible();
      await expect(page.getByText(/removing silence/i)).toBeVisible();
    });

    test('should display silence removal progress', async ({ page }) => {
      await setupProjectWithVideo(page);
      
      // Mock silence removal in progress
      await page.evaluate(() => {
        window.mockProcessingStep = 'silence-removal';
        window.mockProcessingProgress = 45;
      });
      
      await page.getByTestId('start-processing-button').click();
      
      // Progress should be shown
      await expect(page.getByTestId('silence-removal-progress')).toBeVisible();
      await expect(page.getByTestId('silence-removal-percentage')).toContainText('45%');
    });

    test('should show silence removal configuration options', async ({ page }) => {
      await setupProjectWithVideo(page);
      
      // Open processing config
      await page.getByTestId('processing-config-button').click();
      
      // Silence removal settings should be available
      await expect(page.getByTestId('silence-threshold-slider')).toBeVisible();
      await expect(page.getByTestId('silence-duration-input')).toBeVisible();
      await expect(page.getByText(/silence threshold/i)).toBeVisible();
    });

    test('should display silence removal results', async ({ page }) => {
      await setupProjectWithVideo(page);
      
      // Mock completed silence removal
      await page.evaluate(() => {
        window.mockSilenceRemovalResults = {
          originalDuration: 1800,
          processedDuration: 1620,
          silenceRemoved: 180,
          segmentsFound: 12
        };
      });
      
      await page.getByTestId('start-processing-button').click();
      
      // Results should be displayed
      await expect(page.getByTestId('silence-removal-results')).toBeVisible();
      await expect(page.getByText('3 minutes of silence removed')).toBeVisible();
      await expect(page.getByText('12 silent segments found')).toBeVisible();
    });

    test('should allow preview of silence detection', async ({ page }) => {
      await setupProjectWithVideo(page);
      
      // Open config
      await page.getByTestId('processing-config-button').click();
      
      // Preview button should be available
      await expect(page.getByTestId('preview-silence-detection')).toBeVisible();
      
      // Click preview
      await page.getByTestId('preview-silence-detection').click();
      
      // Preview modal should show silence markers
      await expect(page.getByTestId('silence-preview-modal')).toBeVisible();
      await expect(page.getByTestId('silence-markers')).toBeVisible();
    });
  });

  test.describe('Audio Normalization (BDV2-US-3.3)', () => {
    test('should show audio normalization step', async ({ page }) => {
      await setupProjectWithVideo(page);
      await page.getByTestId('start-processing-button').click();
      
      // Audio normalization step should appear after silence removal
      await expect(page.getByTestId('step-audio-normalization')).toBeVisible();
      await expect(page.getByText(/normalizing audio/i)).toBeVisible();
    });

    test('should display audio level analysis', async ({ page }) => {
      await setupProjectWithVideo(page);
      
      // Mock audio analysis
      await page.evaluate(() => {
        window.mockAudioAnalysis = {
          peakLevel: -6.2,
          averageLevel: -23.1,
          recommendedGain: 4.1
        };
      });
      
      await page.getByTestId('start-processing-button').click();
      
      // Audio analysis should be shown
      await expect(page.getByTestId('audio-analysis')).toBeVisible();
      await expect(page.getByText('Peak: -6.2 dB')).toBeVisible();
      await expect(page.getByText('Average: -23.1 dB')).toBeVisible();
    });

    test('should allow customizing normalization settings', async ({ page }) => {
      await setupProjectWithVideo(page);
      
      // Open config
      await page.getByTestId('processing-config-button').click();
      
      // Normalization settings should be available
      await expect(page.getByTestId('target-loudness-input')).toBeVisible();
      await expect(page.getByTestId('peak-limiter-checkbox')).toBeVisible();
      await expect(page.getByText(/target loudness/i)).toBeVisible();
    });

    test('should show before/after audio waveforms', async ({ page }) => {
      await setupProjectWithVideo(page);
      
      // Mock normalization complete
      await page.evaluate(() => {
        window.mockNormalizationComplete = true;
      });
      
      await page.getByTestId('start-processing-button').click();
      
      // Waveform comparison should be available
      await expect(page.getByTestId('waveform-before')).toBeVisible();
      await expect(page.getByTestId('waveform-after')).toBeVisible();
      await expect(page.getByText(/before normalization/i)).toBeVisible();
      await expect(page.getByText(/after normalization/i)).toBeVisible();
    });
  });

  test.describe('Transcription Generation (BDV2-US-3.4)', () => {
    test('should show transcription step in processing pipeline', async ({ page }) => {
      await setupProjectWithVideo(page);
      await page.getByTestId('start-processing-button').click();
      
      // Transcription step should appear
      await expect(page.getByTestId('step-transcription')).toBeVisible();
      await expect(page.getByText(/generating transcript/i)).toBeVisible();
    });

    test('should display transcription progress with ETA', async ({ page }) => {
      await setupProjectWithVideo(page);
      
      // Mock transcription in progress
      await page.evaluate(() => {
        window.mockTranscriptionProgress = {
          percentage: 67,
          processedMinutes: 20,
          totalMinutes: 30,
          eta: 300 // 5 minutes
        };
      });
      
      await page.getByTestId('start-processing-button').click();
      
      // Transcription progress should be shown
      await expect(page.getByTestId('transcription-progress')).toBeVisible();
      await expect(page.getByText('67% complete')).toBeVisible();
      await expect(page.getByText('20/30 minutes processed')).toBeVisible();
      await expect(page.getByText('ETA: 5 minutes')).toBeVisible();
    });

    test('should allow selecting transcription model', async ({ page }) => {
      await setupProjectWithVideo(page);
      
      // Open config
      await page.getByTestId('processing-config-button').click();
      
      // Transcription model selection should be available
      await expect(page.getByTestId('transcription-model-select')).toBeVisible();
      await expect(page.getByText(/transcription model/i)).toBeVisible();
      
      // Model options should be available
      await page.getByTestId('transcription-model-select').click();
      await expect(page.getByText('Whisper Base')).toBeVisible();
      await expect(page.getByText('Whisper Large')).toBeVisible();
    });

    test('should show transcription accuracy metrics', async ({ page }) => {
      await setupProjectWithVideo(page);
      
      // Mock completed transcription
      await page.evaluate(() => {
        window.mockTranscriptionResults = {
          confidence: 0.89,
          wordCount: 2450,
          segmentCount: 156,
          speakerCount: 1
        };
      });
      
      await page.getByTestId('start-processing-button').click();
      
      // Transcription metrics should be shown
      await expect(page.getByTestId('transcription-metrics')).toBeVisible();
      await expect(page.getByText('89% confidence')).toBeVisible();
      await expect(page.getByText('2,450 words')).toBeVisible();
      await expect(page.getByText('156 segments')).toBeVisible();
    });

    test('should allow editing transcription while processing', async ({ page }) => {
      await setupProjectWithVideo(page);
      
      // Mock partial transcription available
      await page.evaluate(() => {
        window.mockPartialTranscription = true;
      });
      
      await page.getByTestId('start-processing-button').click();
      
      // Edit transcript button should be available
      await expect(page.getByTestId('edit-partial-transcript')).toBeVisible();
      
      // Click to edit
      await page.getByTestId('edit-partial-transcript').click();
      
      // Should open transcript editor
      await expect(page).toHaveURL(/.*\/transcript/);
    });
  });

  test.describe('Processing Progress Tracking (BDV2-US-3.5)', () => {
    test('should show overall processing progress', async ({ page }) => {
      await setupProjectWithVideo(page);
      await page.getByTestId('start-processing-button').click();
      
      // Overall progress bar should be visible
      await expect(page.getByTestId('overall-progress-bar')).toBeVisible();
      await expect(page.getByTestId('overall-progress-percentage')).toBeVisible();
      
      // Current step indicator should be shown
      await expect(page.getByTestId('current-step-indicator')).toBeVisible();
    });

    test('should show detailed progress for each step', async ({ page }) => {
      await setupProjectWithVideo(page);
      await page.getByTestId('start-processing-button').click();
      
      // Step progress indicators should be visible
      await expect(page.getByTestId('step-progress-silence')).toBeVisible();
      await expect(page.getByTestId('step-progress-normalization')).toBeVisible();
      await expect(page.getByTestId('step-progress-transcription')).toBeVisible();
      
      // Step statuses should be shown
      await expect(page.getByTestId('step-status-silence')).toContainText('In Progress');
    });

    test('should show processing time estimates', async ({ page }) => {
      await setupProjectWithVideo(page);
      
      // Mock processing time estimates
      await page.evaluate(() => {
        window.mockProcessingEstimates = {
          silenceRemoval: 120, // 2 minutes
          normalization: 60,   // 1 minute
          transcription: 600   // 10 minutes
        };
      });
      
      await page.getByTestId('start-processing-button').click();
      
      // Time estimates should be shown
      await expect(page.getByTestId('estimated-time')).toBeVisible();
      await expect(page.getByText('Estimated total: 13 minutes')).toBeVisible();
    });

    test('should allow pausing and resuming processing', async ({ page }) => {
      await setupProjectWithVideo(page);
      await page.getByTestId('start-processing-button').click();
      
      // Pause button should be available
      await expect(page.getByTestId('pause-processing-button')).toBeVisible();
      
      // Pause processing
      await page.getByTestId('pause-processing-button').click();
      
      // Status should show paused
      await expect(page.getByText(/processing paused/i)).toBeVisible();
      
      // Resume button should be available
      await expect(page.getByTestId('resume-processing-button')).toBeVisible();
      
      // Resume processing
      await page.getByTestId('resume-processing-button').click();
      
      // Status should show resumed
      await expect(page.getByText(/processing resumed/i)).toBeVisible();
    });

    test('should show processing logs', async ({ page }) => {
      await setupProjectWithVideo(page);
      await page.getByTestId('start-processing-button').click();
      
      // Logs toggle should be available
      await expect(page.getByTestId('show-logs-toggle')).toBeVisible();
      
      // Show logs
      await page.getByTestId('show-logs-toggle').click();
      
      // Log viewer should be visible
      await expect(page.getByTestId('processing-logs')).toBeVisible();
      await expect(page.getByText(/processing log/i)).toBeVisible();
    });
  });

  test.describe('Processing Configuration (BDV2-US-3.6)', () => {
    test('should provide comprehensive processing settings', async ({ page }) => {
      await setupProjectWithVideo(page);
      
      // Open configuration
      await page.getByTestId('processing-config-button').click();
      
      // All configuration sections should be available
      await expect(page.getByTestId('silence-removal-config')).toBeVisible();
      await expect(page.getByTestId('audio-normalization-config')).toBeVisible();
      await expect(page.getByTestId('transcription-config')).toBeVisible();
    });

    test('should allow saving and loading processing presets', async ({ page }) => {
      await setupProjectWithVideo(page);
      
      // Open config
      await page.getByTestId('processing-config-button').click();
      
      // Preset management should be available
      await expect(page.getByTestId('preset-selector')).toBeVisible();
      await expect(page.getByTestId('save-preset-button')).toBeVisible();
      
      // Save a preset
      await page.getByTestId('save-preset-button').click();
      await page.getByTestId('preset-name-input').fill('High Quality Sermon');
      await page.getByTestId('save-preset-confirm').click();
      
      // Preset should appear in selector
      await page.getByTestId('preset-selector').click();
      await expect(page.getByText('High Quality Sermon')).toBeVisible();
    });

    test('should validate configuration settings', async ({ page }) => {
      await setupProjectWithVideo(page);
      
      // Open config
      await page.getByTestId('processing-config-button').click();
      
      // Enter invalid values
      await page.getByTestId('silence-threshold-slider').fill('150'); // Invalid value
      
      // Validation error should appear
      await expect(page.getByTestId('threshold-error')).toContainText('Value must be between 0 and 100');
      
      // Apply button should be disabled
      await expect(page.getByTestId('apply-config-button')).toBeDisabled();
    });
  });

  test.describe('Combine Multiple Segments (BDV2-US-3.7)', () => {
    test('should detect multiple video segments in project', async ({ page }) => {
      await setupProjectWithVideo(page);
      
      // Mock multiple uploaded segments
      await page.evaluate(() => {
        window.mockMultipleSegments = [
          { id: 'seg-1', name: 'intro.mp4', order: 1 },
          { id: 'seg-2', name: 'main-content.mp4', order: 2 },
          { id: 'seg-3', name: 'outro.mp4', order: 3 }
        ];
      });
      
      // Segment combination option should be available
      await expect(page.getByTestId('combine-segments-option')).toBeVisible();
      await expect(page.getByText(/combine 3 segments/i)).toBeVisible();
    });

    test('should allow reordering segments before combining', async ({ page }) => {
      await setupProjectWithVideo(page);
      
      // Mock multiple segments
      await page.evaluate(() => {
        window.mockMultipleSegments = true;
      });
      
      // Open segment reorder interface
      await page.getByTestId('reorder-segments-button').click();
      
      // Drag and drop should be available
      await expect(page.getByTestId('segment-drag-handle-1')).toBeVisible();
      await expect(page.getByTestId('segment-drag-handle-2')).toBeVisible();
      
      // Reorder confirmation
      await expect(page.getByTestId('apply-reorder-button')).toBeVisible();
    });

    test('should show segment combination progress', async ({ page }) => {
      await setupProjectWithVideo(page);
      
      // Mock combining segments
      await page.evaluate(() => {
        window.mockCombiningSegments = true;
      });
      
      await page.getByTestId('start-processing-button').click();
      
      // Combination step should be visible
      await expect(page.getByTestId('step-combine-segments')).toBeVisible();
      await expect(page.getByText(/combining segments/i)).toBeVisible();
      
      // Progress should be shown
      await expect(page.getByTestId('combine-progress')).toBeVisible();
    });

    test('should handle segment combination failures gracefully', async ({ page }) => {
      await setupProjectWithVideo(page);
      
      // Mock combination failure
      await page.evaluate(() => {
        window.mockCombinationError = 'Incompatible video formats';
      });
      
      await page.getByTestId('start-processing-button').click();
      
      // Error should be displayed
      await expect(page.getByTestId('processing-error')).toBeVisible();
      await expect(page.getByText('Incompatible video formats')).toBeVisible();
      
      // Retry option should be available
      await expect(page.getByTestId('retry-combination-button')).toBeVisible();
    });
  });

  test.describe('Error Handling and Recovery', () => {
    test('should handle processing failures gracefully', async ({ page }) => {
      await setupProjectWithVideo(page);
      
      // Mock processing error
      await page.evaluate(() => {
        window.mockProcessingError = 'FFmpeg encoding failed';
      });
      
      await page.getByTestId('start-processing-button').click();
      
      // Error notification should appear
      await expect(page.getByTestId('processing-error-notification')).toBeVisible();
      await expect(page.getByText('FFmpeg encoding failed')).toBeVisible();
      
      // Retry button should be available
      await expect(page.getByTestId('retry-processing-button')).toBeVisible();
    });

    test('should allow canceling long-running processes', async ({ page }) => {
      await setupProjectWithVideo(page);
      await page.getByTestId('start-processing-button').click();
      
      // Cancel button should be available
      await expect(page.getByTestId('cancel-processing-button')).toBeVisible();
      
      // Click cancel
      await page.getByTestId('cancel-processing-button').click();
      
      // Confirmation dialog
      await expect(page.getByTestId('cancel-confirmation-dialog')).toBeVisible();
      
      // Confirm cancellation
      await page.getByTestId('confirm-cancel-button').click();
      
      // Processing should be canceled
      await expect(page.getByText(/processing canceled/i)).toBeVisible();
    });
  });

  test.describe('Multi-Viewport Processing Tests', () => {
    const viewports = [
      { name: 'Desktop', width: 1920, height: 1080 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Mobile', width: 375, height: 667 }
    ];

    viewports.forEach(({ name, width, height }) => {
      test(`should work on ${name} viewport (${width}x${height})`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        await setupProjectWithVideo(page);
        
        // Processing controls should be accessible
        await expect(page.getByTestId('start-processing-button')).toBeVisible();
        await expect(page.getByTestId('processing-config-button')).toBeVisible();
        
        // Start processing
        await page.getByTestId('start-processing-button').click();
        
        // Progress should be visible
        await expect(page.getByTestId('overall-progress-bar')).toBeVisible();
        
        // Take screenshot for visual validation
        await page.screenshot({ 
          path: `tests/screenshots/processing-${name.toLowerCase()}.png`,
          fullPage: true
        });
      });
    });
  });
});