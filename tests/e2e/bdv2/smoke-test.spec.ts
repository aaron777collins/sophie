import { test, expect } from '@playwright/test';
import * as path from 'path';

/**
 * BDV2 Smoke Tests - End-to-End User Journey
 * Tests the complete workflow from login to video export
 * Covers critical path functionality across all epics
 */
test.describe('BDV2 Smoke Tests - Complete User Journey', () => {
  
  test.describe('Critical Path: Login to Export', () => {
    test('should complete full video editing workflow', async ({ page }) => {
      // 1. AUTHENTICATION - Login
      await page.goto('/login');
      await page.getByTestId('username-input').fill('demo');
      await page.getByTestId('password-input').fill('demo');
      await page.getByTestId('login-button').click();
      await page.waitForURL(/.*\/dashboard/);
      
      // Verify dashboard loaded
      await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
      await expect(page.getByTestId('create-project-button')).toBeVisible();

      // 2. PROJECT CREATION - Create new project
      await page.getByTestId('create-project-button').click();
      await page.getByTestId('project-name-input').fill('Smoke Test - Complete Workflow');
      await page.getByTestId('project-description-input').fill('End-to-end test of video editing workflow');
      await page.getByTestId('create-project-submit').click();
      await page.waitForURL(/.*\/projects\/.*/);
      
      // Verify project created
      await expect(page.getByText('Smoke Test - Complete Workflow')).toBeVisible();
      await expect(page.getByTestId('video-upload-area')).toBeVisible();

      // 3. VIDEO UPLOAD - Upload video file
      const testVideoPath = path.join(__dirname, '../../fixtures/sample-sermon.mp4');
      const fileInput = page.getByTestId('video-file-input');
      await fileInput.setInputFiles(testVideoPath);
      
      // Verify upload started
      await expect(page.getByTestId('upload-progress')).toBeVisible();
      
      // Mock upload completion
      await page.evaluate(() => {
        window.mockUploadComplete = true;
      });
      
      await expect(page.getByText(/upload complete/i)).toBeVisible();

      // 4. VIDEO PROCESSING - Start processing
      await expect(page.getByTestId('start-processing-button')).toBeVisible();
      await page.getByTestId('start-processing-button').click();
      
      // Verify processing started
      await expect(page.getByTestId('processing-status')).toBeVisible();
      await expect(page.getByText(/processing/i)).toBeVisible();
      
      // Mock processing completion
      await page.evaluate(() => {
        window.mockProcessingComplete = {
          transcript: [
            { id: 1, start: 0, end: 5, text: "Welcome to today's Bible study.", removed: false },
            { id: 2, start: 5, end: 12, text: "We'll be looking at the book of Genesis.", removed: false },
            { id: 3, start: 12, end: 18, text: "Let's start with chapter one, verse one.", removed: false }
          ]
        };
      });
      
      await expect(page.getByText(/processing complete/i)).toBeVisible();

      // 5. TRANSCRIPT EDITING - Edit transcript
      await page.getByTestId('edit-transcript-button').click();
      await page.waitForURL(/.*\/transcript/);
      
      // Verify transcript editor loaded
      await expect(page.getByTestId('transcript-editor')).toBeVisible();
      await expect(page.getByTestId('transcript-segment-1')).toBeVisible();
      
      // Make some edits - remove a segment
      await page.getByTestId('transcript-segment-2').click();
      await page.getByTestId('remove-selection-button').click();
      
      // Verify segment marked for removal
      await expect(page.getByTestId('transcript-segment-2')).toHaveClass(/removed/);
      
      // Save changes
      await page.getByTestId('save-transcript-button').click();
      await expect(page.getByText(/changes saved/i)).toBeVisible();

      // 6. VIDEO EXPORT - Export edited video
      await page.getByTestId('export-video-button').click();
      await page.waitForURL(/.*\/export/);
      
      // Verify export interface
      await expect(page.getByTestId('export-interface')).toBeVisible();
      await expect(page.getByTestId('quality-preset-selector')).toBeVisible();
      
      // Select export quality
      await page.getByTestId('quality-preset-selector').click();
      await page.getByText('YouTube 1080p').click();
      
      // Enable subtitles
      await page.getByTestId('include-subtitles-checkbox').check();
      
      // Start export
      await page.getByTestId('start-export-button').click();
      
      // Verify export started
      await expect(page.getByTestId('export-progress')).toBeVisible();
      
      // Mock export completion
      await page.evaluate(() => {
        window.mockExportComplete = {
          videoPath: '/exports/smoke-test-final.mp4',
          subtitlePath: '/exports/smoke-test-final.srt',
          size: 450000000
        };
      });
      
      // Verify export completed
      await expect(page.getByText(/export complete/i)).toBeVisible();
      await expect(page.getByTestId('download-video-button')).toBeVisible();
      await expect(page.getByTestId('download-subtitles-button')).toBeVisible();
      
      console.log('✅ Complete workflow smoke test passed');
    });
  });

  test.describe('Essential Features Smoke Tests', () => {
    test('should validate core authentication flows', async ({ page }) => {
      // Test login
      await page.goto('/login');
      await page.getByTestId('username-input').fill('demo');
      await page.getByTestId('password-input').fill('demo');
      await page.getByTestId('login-button').click();
      await page.waitForURL(/.*\/dashboard/);
      
      // Test logout
      await page.getByTestId('logout-button').click();
      await page.waitForURL(/.*\/login/);
      
      // Test protected route redirect
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/.*\/login/);
      
      console.log('✅ Authentication smoke test passed');
    });

    test('should validate project management basics', async ({ page }) => {
      // Login
      await page.goto('/login');
      await page.getByTestId('username-input').fill('demo');
      await page.getByTestId('password-input').fill('demo');
      await page.getByTestId('login-button').click();
      await page.waitForURL(/.*\/dashboard/);
      
      // Create project
      await page.getByTestId('create-project-button').click();
      await page.getByTestId('project-name-input').fill('Smoke Test Project');
      await page.getByTestId('create-project-submit').click();
      await page.waitForURL(/.*\/projects\/.*/);
      
      // Verify project interface
      await expect(page.getByText('Smoke Test Project')).toBeVisible();
      await expect(page.getByTestId('video-upload-area')).toBeVisible();
      
      // Return to dashboard and verify project appears
      await page.goto('/dashboard');
      await expect(page.getByTestId('project-card')).toBeVisible();
      
      console.log('✅ Project management smoke test passed');
    });

    test('should validate upload interface basics', async ({ page }) => {
      // Setup project
      await page.goto('/login');
      await page.getByTestId('username-input').fill('demo');
      await page.getByTestId('password-input').fill('demo');
      await page.getByTestId('login-button').click();
      await page.waitForURL(/.*\/dashboard/);
      
      await page.getByTestId('create-project-button').click();
      await page.getByTestId('project-name-input').fill('Upload Test');
      await page.getByTestId('create-project-submit').click();
      await page.waitForURL(/.*\/projects\/.*/);
      
      // Test upload interface
      await expect(page.getByTestId('video-upload-area')).toBeVisible();
      await expect(page.getByTestId('select-files-button')).toBeVisible();
      
      // Test file validation (mock)
      const textFile = path.join(__dirname, '../../fixtures/sample.txt');
      const fileInput = page.getByTestId('video-file-input');
      await fileInput.setInputFiles(textFile);
      
      // Should show error for non-video file
      await expect(page.getByTestId('upload-error')).toBeVisible();
      
      console.log('✅ Upload interface smoke test passed');
    });

    test('should validate processing interface basics', async ({ page }) => {
      // Setup project with mock uploaded video
      await page.goto('/login');
      await page.getByTestId('username-input').fill('demo');
      await page.getByTestId('password-input').fill('demo');
      await page.getByTestId('login-button').click();
      await page.waitForURL(/.*\/dashboard/);
      
      await page.getByTestId('create-project-button').click();
      await page.getByTestId('project-name-input').fill('Processing Test');
      await page.getByTestId('create-project-submit').click();
      await page.waitForURL(/.*\/projects\/.*/);
      
      // Mock uploaded video
      await page.evaluate(() => {
        window.mockUploadedVideo = { id: 'test-1', name: 'test.mp4', status: 'uploaded' };
      });
      
      // Test processing interface
      await expect(page.getByTestId('start-processing-button')).toBeVisible();
      await expect(page.getByTestId('processing-config-button')).toBeVisible();
      
      // Test config modal
      await page.getByTestId('processing-config-button').click();
      await expect(page.getByTestId('processing-config-modal')).toBeVisible();
      
      console.log('✅ Processing interface smoke test passed');
    });

    test('should validate transcript editor basics', async ({ page }) => {
      // Setup project with mock processed video
      await page.goto('/login');
      await page.getByTestId('username-input').fill('demo');
      await page.getByTestId('password-input').fill('demo');
      await page.getByTestId('login-button').click();
      await page.waitForURL(/.*\/dashboard/);
      
      await page.getByTestId('create-project-button').click();
      await page.getByTestId('project-name-input').fill('Transcript Test');
      await page.getByTestId('create-project-submit').click();
      await page.waitForURL(/.*\/projects\/.*/);
      
      // Mock processed video
      await page.evaluate(() => {
        window.mockProcessedVideo = {
          id: 'test-1',
          transcript: [
            { id: 1, start: 0, end: 5, text: "Test transcript segment", removed: false }
          ]
        };
      });
      
      // Navigate to transcript editor
      await page.getByTestId('edit-transcript-button').click();
      await page.waitForURL(/.*\/transcript/);
      
      // Test basic functionality
      await expect(page.getByTestId('transcript-editor')).toBeVisible();
      await expect(page.getByTestId('transcript-segment-1')).toBeVisible();
      
      // Test selection
      await page.getByTestId('transcript-segment-1').click();
      await expect(page.getByTestId('transcript-segment-1')).toHaveClass(/selected/);
      
      console.log('✅ Transcript editor smoke test passed');
    });

    test('should validate export interface basics', async ({ page }) => {
      // Setup project ready for export
      await page.goto('/login');
      await page.getByTestId('username-input').fill('demo');
      await page.getByTestId('password-input').fill('demo');
      await page.getByTestId('login-button').click();
      await page.waitForURL(/.*\/dashboard/);
      
      await page.getByTestId('create-project-button').click();
      await page.getByTestId('project-name-input').fill('Export Test');
      await page.getByTestId('create-project-submit').click();
      await page.waitForURL(/.*\/projects\/.*/);
      
      // Mock processed video ready for export
      await page.evaluate(() => {
        window.mockProcessedVideo = { 
          id: 'test-1', 
          status: 'processed',
          hasTranscript: true 
        };
      });
      
      // Navigate to export
      await page.getByTestId('export-video-button').click();
      await page.waitForURL(/.*\/export/);
      
      // Test export interface
      await expect(page.getByTestId('export-interface')).toBeVisible();
      await expect(page.getByTestId('quality-preset-selector')).toBeVisible();
      await expect(page.getByTestId('start-export-button')).toBeVisible();
      
      console.log('✅ Export interface smoke test passed');
    });
  });

  test.describe('Multi-Viewport Smoke Tests', () => {
    const viewports = [
      { name: 'Desktop', width: 1920, height: 1080 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Mobile', width: 375, height: 667 }
    ];

    viewports.forEach(({ name, width, height }) => {
      test(`should work on ${name} viewport (${width}x${height})`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        
        // Test login on viewport
        await page.goto('/login');
        await expect(page.getByTestId('username-input')).toBeVisible();
        
        await page.getByTestId('username-input').fill('demo');
        await page.getByTestId('password-input').fill('demo');
        await page.getByTestId('login-button').click();
        await page.waitForURL(/.*\/dashboard/);
        
        // Test dashboard on viewport
        await expect(page.getByTestId('create-project-button')).toBeVisible();
        
        // Create project
        await page.getByTestId('create-project-button').click();
        await page.getByTestId('project-name-input').fill(`${name} Test`);
        await page.getByTestId('create-project-submit').click();
        await page.waitForURL(/.*\/projects\/.*/);
        
        // Test project interface on viewport
        await expect(page.getByTestId('video-upload-area')).toBeVisible();
        
        // Take screenshot for visual validation
        await page.screenshot({ 
          path: `tests/screenshots/smoke-${name.toLowerCase()}.png`,
          fullPage: true
        });
        
        console.log(`✅ ${name} viewport smoke test passed`);
      });
    });
  });

  test.describe('Error Handling Smoke Tests', () => {
    test('should handle authentication errors gracefully', async ({ page }) => {
      await page.goto('/login');
      
      // Test invalid credentials
      await page.getByTestId('username-input').fill('invalid');
      await page.getByTestId('password-input').fill('wrong');
      await page.getByTestId('login-button').click();
      
      // Should show error and stay on login
      await expect(page.getByTestId('error-message')).toBeVisible();
      await expect(page).toHaveURL(/.*\/login/);
      
      console.log('✅ Authentication error handling smoke test passed');
    });

    test('should handle form validation errors', async ({ page }) => {
      await page.goto('/login');
      await page.getByTestId('username-input').fill('demo');
      await page.getByTestId('password-input').fill('demo');
      await page.getByTestId('login-button').click();
      await page.waitForURL(/.*\/dashboard/);
      
      // Test empty project creation
      await page.getByTestId('create-project-button').click();
      await page.getByTestId('create-project-submit').click();
      
      // Should show validation error
      await expect(page.getByTestId('project-name-error')).toBeVisible();
      
      console.log('✅ Form validation error handling smoke test passed');
    });

    test('should handle network connectivity issues', async ({ page }) => {
      // This would test offline scenarios, network timeouts, etc.
      // For now, just verify error handling UI exists
      await page.goto('/login');
      
      // Mock network error
      await page.route('**/*', route => route.abort());
      
      await page.getByTestId('username-input').fill('demo');
      await page.getByTestId('password-input').fill('demo');
      await page.getByTestId('login-button').click();
      
      // Should handle gracefully (specific implementation would depend on error handling strategy)
      // For now, just verify page doesn't crash
      await expect(page.getByTestId('login-button')).toBeVisible();
      
      console.log('✅ Network error handling smoke test passed');
    });
  });

  test.describe('Performance Smoke Tests', () => {
    test('should load pages within acceptable time limits', async ({ page }) => {
      const startTime = Date.now();
      
      // Test login page load time
      await page.goto('/login');
      const loginLoadTime = Date.now() - startTime;
      expect(loginLoadTime).toBeLessThan(5000); // 5 seconds max
      
      // Test dashboard load time after login
      const dashboardStartTime = Date.now();
      await page.getByTestId('username-input').fill('demo');
      await page.getByTestId('password-input').fill('demo');
      await page.getByTestId('login-button').click();
      await page.waitForURL(/.*\/dashboard/);
      const dashboardLoadTime = Date.now() - dashboardStartTime;
      expect(dashboardLoadTime).toBeLessThan(10000); // 10 seconds max
      
      console.log(`✅ Performance smoke test passed - Login: ${loginLoadTime}ms, Dashboard: ${dashboardLoadTime}ms`);
    });

    test('should handle multiple concurrent operations', async ({ page }) => {
      // Test that UI remains responsive during concurrent operations
      await page.goto('/login');
      await page.getByTestId('username-input').fill('demo');
      await page.getByTestId('password-input').fill('demo');
      await page.getByTestId('login-button').click();
      await page.waitForURL(/.*\/dashboard/);
      
      // Simulate concurrent clicks (should not break UI)
      const createProjectButton = page.getByTestId('create-project-button');
      await Promise.all([
        createProjectButton.click(),
        createProjectButton.click(),
        createProjectButton.click()
      ]);
      
      // Modal should still be functional
      await expect(page.getByTestId('create-project-modal')).toBeVisible();
      
      console.log('✅ Concurrent operations smoke test passed');
    });
  });
});