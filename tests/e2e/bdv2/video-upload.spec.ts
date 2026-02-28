import { test, expect } from '@playwright/test';
import * as path from 'path';

/**
 * BDV2 Video Upload E2E Tests
 * Stories: BDV2-US-2.1 to BDV2-US-2.6
 * Epic: EPIC-02 Video Upload & Management
 */
test.describe('BDV2 Video Upload & Management', () => {
  
  // Helper function to login
  async function login(page: any) {
    await page.goto('/login');
    await page.getByTestId('username-input').fill('demo');
    await page.getByTestId('password-input').fill('demo');
    await page.getByTestId('login-button').click();
    await page.waitForURL(/.*\/dashboard/);
  }

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test.describe('Create New Project (BDV2-US-2.1)', () => {
    test('should display create project button on dashboard', async ({ page }) => {
      await expect(page.getByTestId('create-project-button')).toBeVisible();
      await expect(page.getByText(/create new project/i)).toBeVisible();
    });

    test('should open project creation modal', async ({ page }) => {
      await page.getByTestId('create-project-button').click();
      
      // Modal should be visible
      await expect(page.getByTestId('create-project-modal')).toBeVisible();
      await expect(page.getByRole('heading', { name: /create new project/i })).toBeVisible();
      
      // Form fields should be present
      await expect(page.getByTestId('project-name-input')).toBeVisible();
      await expect(page.getByTestId('project-description-input')).toBeVisible();
    });

    test('should create project with valid data', async ({ page }) => {
      await page.getByTestId('create-project-button').click();
      
      // Fill form
      await page.getByTestId('project-name-input').fill('Test Bible Series');
      await page.getByTestId('project-description-input').fill('Testing video upload functionality');
      
      // Submit form
      await page.getByTestId('create-project-submit').click();
      
      // Should navigate to project page
      await page.waitForURL(/.*\/projects\/.*/, { timeout: 10000 });
      
      // Project name should be displayed
      await expect(page.getByText('Test Bible Series')).toBeVisible();
    });

    test('should validate required fields', async ({ page }) => {
      await page.getByTestId('create-project-button').click();
      
      // Try to submit empty form
      await page.getByTestId('create-project-submit').click();
      
      // Validation errors should appear
      await expect(page.getByTestId('project-name-error')).toContainText('Project name is required');
    });
  });

  test.describe('Upload Single Video (BDV2-US-2.2)', () => {
    test.beforeEach(async ({ page }) => {
      // Create a project first
      await page.getByTestId('create-project-button').click();
      await page.getByTestId('project-name-input').fill('Upload Test Project');
      await page.getByTestId('create-project-submit').click();
      await page.waitForURL(/.*\/projects\/.*/);
    });

    test('should display upload area', async ({ page }) => {
      await expect(page.getByTestId('video-upload-area')).toBeVisible();
      await expect(page.getByText(/drag and drop videos/i)).toBeVisible();
      await expect(page.getByTestId('select-files-button')).toBeVisible();
    });

    test('should accept video file uploads', async ({ page }) => {
      // Create a mock video file for testing
      const filePath = path.join(__dirname, '../../fixtures/sample-video.mp4');
      
      // Upload file via file input
      const fileInput = page.getByTestId('video-file-input');
      await fileInput.setInputFiles(filePath);
      
      // Upload progress should be visible
      await expect(page.getByTestId('upload-progress')).toBeVisible();
      await expect(page.getByTestId('upload-filename')).toContainText('sample-video.mp4');
    });

    test('should reject non-video files', async ({ page }) => {
      const textFilePath = path.join(__dirname, '../../fixtures/sample.txt');
      
      // Try to upload text file
      const fileInput = page.getByTestId('video-file-input');
      await fileInput.setInputFiles(textFilePath);
      
      // Error message should appear
      await expect(page.getByTestId('upload-error')).toBeVisible();
      await expect(page.getByText(/only video files are supported/i)).toBeVisible();
    });

    test('should show file size validation', async ({ page }) => {
      // Mock large file (this would be implementation-specific)
      await page.evaluate(() => {
        // Simulate large file upload
        window.mockLargeFile = true;
      });
      
      const fileInput = page.getByTestId('video-file-input');
      // This would need actual large file or mocking in real implementation
      
      // For now, test the UI elements exist for size validation
      await expect(page.getByTestId('video-upload-area')).toContainText(/maximum file size/i);
    });
  });

  test.describe('Upload Multiple Videos (BDV2-US-2.3)', () => {
    test.beforeEach(async ({ page }) => {
      // Create a project first
      await page.getByTestId('create-project-button').click();
      await page.getByTestId('project-name-input').fill('Multi Upload Test');
      await page.getByTestId('create-project-submit').click();
      await page.waitForURL(/.*\/projects\/.*/);
    });

    test('should support multiple file selection', async ({ page }) => {
      const file1Path = path.join(__dirname, '../../fixtures/video1.mp4');
      const file2Path = path.join(__dirname, '../../fixtures/video2.mp4');
      
      // Upload multiple files
      const fileInput = page.getByTestId('video-file-input');
      await fileInput.setInputFiles([file1Path, file2Path]);
      
      // Both files should appear in upload list
      await expect(page.getByTestId('upload-item-video1')).toBeVisible();
      await expect(page.getByTestId('upload-item-video2')).toBeVisible();
    });

    test('should show progress for each file', async ({ page }) => {
      const filePaths = [
        path.join(__dirname, '../../fixtures/video1.mp4'),
        path.join(__dirname, '../../fixtures/video2.mp4')
      ];
      
      const fileInput = page.getByTestId('video-file-input');
      await fileInput.setInputFiles(filePaths);
      
      // Each file should have its own progress indicator
      await expect(page.getByTestId('progress-video1')).toBeVisible();
      await expect(page.getByTestId('progress-video2')).toBeVisible();
    });

    test('should allow removing files before upload', async ({ page }) => {
      const filePath = path.join(__dirname, '../../fixtures/sample-video.mp4');
      
      const fileInput = page.getByTestId('video-file-input');
      await fileInput.setInputFiles(filePath);
      
      // Remove file button should be visible
      await expect(page.getByTestId('remove-file-button')).toBeVisible();
      
      // Click remove
      await page.getByTestId('remove-file-button').click();
      
      // File should be removed from list
      await expect(page.getByTestId('upload-item-sample-video')).not.toBeVisible();
    });
  });

  test.describe('View Upload Progress (BDV2-US-2.4)', () => {
    test('should show upload progress bar', async ({ page }) => {
      // Navigate to project and start upload
      await page.getByTestId('create-project-button').click();
      await page.getByTestId('project-name-input').fill('Progress Test');
      await page.getByTestId('create-project-submit').click();
      await page.waitForURL(/.*\/projects\/.*/);
      
      const filePath = path.join(__dirname, '../../fixtures/sample-video.mp4');
      const fileInput = page.getByTestId('video-file-input');
      await fileInput.setInputFiles(filePath);
      
      // Progress elements should be visible
      await expect(page.getByTestId('upload-progress-bar')).toBeVisible();
      await expect(page.getByTestId('upload-percentage')).toBeVisible();
    });

    test('should show upload speed and ETA', async ({ page }) => {
      await page.getByTestId('create-project-button').click();
      await page.getByTestId('project-name-input').fill('Speed Test');
      await page.getByTestId('create-project-submit').click();
      await page.waitForURL(/.*\/projects\/.*/);
      
      const filePath = path.join(__dirname, '../../fixtures/sample-video.mp4');
      const fileInput = page.getByTestId('video-file-input');
      await fileInput.setInputFiles(filePath);
      
      // Upload details should be visible
      await expect(page.getByTestId('upload-speed')).toBeVisible();
      await expect(page.getByTestId('upload-eta')).toBeVisible();
    });

    test('should allow canceling uploads', async ({ page }) => {
      await page.getByTestId('create-project-button').click();
      await page.getByTestId('project-name-input').fill('Cancel Test');
      await page.getByTestId('create-project-submit').click();
      await page.waitForURL(/.*\/projects\/.*/);
      
      const filePath = path.join(__dirname, '../../fixtures/sample-video.mp4');
      const fileInput = page.getByTestId('video-file-input');
      await fileInput.setInputFiles(filePath);
      
      // Cancel button should be visible
      await expect(page.getByTestId('cancel-upload-button')).toBeVisible();
      
      // Click cancel
      await page.getByTestId('cancel-upload-button').click();
      
      // Upload should be canceled
      await expect(page.getByText(/upload canceled/i)).toBeVisible();
    });
  });

  test.describe('Manage Video Segments (BDV2-US-2.5)', () => {
    test.beforeEach(async ({ page }) => {
      // Create project and upload a video
      await page.getByTestId('create-project-button').click();
      await page.getByTestId('project-name-input').fill('Segment Management Test');
      await page.getByTestId('create-project-submit').click();
      await page.waitForURL(/.*\/projects\/.*/);
      
      // Mock uploaded video for segment management
      const filePath = path.join(__dirname, '../../fixtures/sample-video.mp4');
      const fileInput = page.getByTestId('video-file-input');
      await fileInput.setInputFiles(filePath);
      
      // Wait for upload completion (mock)
      await page.waitForTimeout(2000);
    });

    test('should display uploaded video segments', async ({ page }) => {
      await expect(page.getByTestId('video-segments-list')).toBeVisible();
      await expect(page.getByTestId('segment-sample-video')).toBeVisible();
    });

    test('should allow renaming video segments', async ({ page }) => {
      // Click edit name button
      await page.getByTestId('edit-segment-name').click();
      
      // Name input should be visible
      await expect(page.getByTestId('segment-name-input')).toBeVisible();
      
      // Change name
      await page.getByTestId('segment-name-input').fill('Introduction Segment');
      await page.getByTestId('save-segment-name').click();
      
      // New name should be displayed
      await expect(page.getByText('Introduction Segment')).toBeVisible();
    });

    test('should allow deleting video segments', async ({ page }) => {
      // Click delete button
      await page.getByTestId('delete-segment-button').click();
      
      // Confirmation dialog should appear
      await expect(page.getByTestId('delete-confirmation-modal')).toBeVisible();
      await expect(page.getByText(/are you sure/i)).toBeVisible();
      
      // Confirm deletion
      await page.getByTestId('confirm-delete-button').click();
      
      // Segment should be removed
      await expect(page.getByTestId('segment-sample-video')).not.toBeVisible();
    });

    test('should show video metadata', async ({ page }) => {
      // Metadata should be visible
      await expect(page.getByTestId('video-duration')).toBeVisible();
      await expect(page.getByTestId('video-filesize')).toBeVisible();
      await expect(page.getByTestId('video-resolution')).toBeVisible();
    });
  });

  test.describe('Project List Dashboard (BDV2-US-2.6)', () => {
    test('should display projects list on dashboard', async ({ page }) => {
      await page.goto('/dashboard');
      
      await expect(page.getByTestId('projects-list')).toBeVisible();
      await expect(page.getByRole('heading', { name: /your projects/i })).toBeVisible();
    });

    test('should show project cards with metadata', async ({ page }) => {
      // Create a project first
      await page.getByTestId('create-project-button').click();
      await page.getByTestId('project-name-input').fill('Dashboard Test Project');
      await page.getByTestId('project-description-input').fill('Test project for dashboard');
      await page.getByTestId('create-project-submit').click();
      await page.waitForURL(/.*\/projects\/.*/);
      
      // Go back to dashboard
      await page.goto('/dashboard');
      
      // Project card should be visible
      await expect(page.getByTestId('project-card')).toBeVisible();
      await expect(page.getByText('Dashboard Test Project')).toBeVisible();
      await expect(page.getByText('Test project for dashboard')).toBeVisible();
    });

    test('should allow navigating to project from card', async ({ page }) => {
      // Create a project
      await page.getByTestId('create-project-button').click();
      await page.getByTestId('project-name-input').fill('Navigation Test');
      await page.getByTestId('create-project-submit').click();
      await page.waitForURL(/.*\/projects\/.*/);
      
      // Go to dashboard and click project card
      await page.goto('/dashboard');
      await page.getByTestId('project-card').click();
      
      // Should navigate to project
      await expect(page).toHaveURL(/.*\/projects\/.*/);
    });

    test('should show empty state when no projects', async ({ page }) => {
      await page.goto('/dashboard');
      
      // Mock empty projects state
      await page.evaluate(() => {
        window.mockEmptyProjects = true;
      });
      
      // Empty state should be visible
      await expect(page.getByTestId('empty-projects-state')).toBeVisible();
      await expect(page.getByText(/no projects yet/i)).toBeVisible();
    });
  });

  test.describe('Multi-Viewport Upload Tests', () => {
    const viewports = [
      { name: 'Desktop', width: 1920, height: 1080 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Mobile', width: 375, height: 667 }
    ];

    viewports.forEach(({ name, width, height }) => {
      test(`should work on ${name} viewport (${width}x${height})`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        
        // Create project
        await page.getByTestId('create-project-button').click();
        await page.getByTestId('project-name-input').fill(`${name} Test`);
        await page.getByTestId('create-project-submit').click();
        await page.waitForURL(/.*\/projects\/.*/);
        
        // Upload area should be usable
        await expect(page.getByTestId('video-upload-area')).toBeVisible();
        await expect(page.getByTestId('select-files-button')).toBeVisible();
        
        // Take screenshot for visual validation
        await page.screenshot({ 
          path: `tests/screenshots/upload-${name.toLowerCase()}.png`,
          fullPage: true
        });
      });
    });
  });
});