# Epic 02: Video Upload & Management

**Epic ID:** BDV2-EPIC-02  
**Priority:** P0 (MVP)  
**Status:** Draft  
**Dependencies:** EPIC-01 (Authentication)  

## Description

Enable users to upload video files through a web interface, manage multiple video segments within projects, and track upload progress. Support for large files (up to 10GB) with resumable uploads.

## Business Value

- Eliminates manual file copying to server
- Supports batch upload workflow
- Provides visual feedback during long uploads
- Enables organized project management

---

## User Stories

### Story 2.1: Create New Project

**Story ID:** BDV2-US-2.1  
**Points:** 3  
**Priority:** P0  

> As Aaron, I want to create a new project so that I can organize my video segments.

#### Acceptance Criteria

```gherkin
Feature: Create New Project

  Background:
    Given I am logged in
    And I am on the projects dashboard

  Scenario: Create project with name only
    When I click the "New Project" button
    And I enter project name "Genesis Chapter 1"
    And I click "Create"
    Then a new project should be created
    And I should be redirected to the project page
    And the project should appear in my projects list

  Scenario: Create project with name and description
    When I create a project with name "Exodus 3" and description "The burning bush story"
    Then the project should be created with both fields saved
    And the description should be visible on the project page

  Scenario: Project name is required
    When I try to create a project without a name
    Then I should see a validation error "Project name is required"

  Scenario: Project names can be duplicated
    Given a project named "Test Project" already exists
    When I create another project named "Test Project"
    Then both projects should exist
    And they should have different IDs
```

#### Playwright Test Specs

```typescript
test.describe('Create New Project', () => {
  test('should create project with name', async ({ page }) => {
    await loginAs(page, 'aaron');
    await page.click('[data-testid="new-project-button"]');
    await page.fill('[data-testid="project-name-input"]', 'Genesis Chapter 1');
    await page.click('[data-testid="create-project-button"]');
    
    await expect(page).toHaveURL(/\/project\/[a-z0-9]+/);
    await expect(page.locator('[data-testid="project-title"]')).toContainText('Genesis Chapter 1');
  });

  test('should show validation error for empty name', async ({ page }) => {
    await loginAs(page, 'aaron');
    await page.click('[data-testid="new-project-button"]');
    await page.click('[data-testid="create-project-button"]');
    
    await expect(page.locator('[data-testid="name-error"]')).toBeVisible();
  });
});
```

---

### Story 2.2: Upload Single Video

**Story ID:** BDV2-US-2.2  
**Points:** 5  
**Priority:** P0  

> As Aaron, I want to upload a video file so that I can process it in the pipeline.

#### Acceptance Criteria

```gherkin
Feature: Upload Single Video

  Background:
    Given I am logged in
    And I have an existing project open

  Scenario: Upload video via file picker
    When I click the "Upload Video" button
    And I select a video file from my computer
    Then the file should start uploading
    And I should see a progress bar showing upload percentage
    And the filename should be displayed

  Scenario: Upload video via drag and drop
    When I drag a video file onto the upload zone
    And I drop it
    Then the file should start uploading
    And I should see visual feedback during the drag

  Scenario: Show upload completion
    Given a video is being uploaded
    When the upload completes
    Then I should see a success indicator
    And the video should appear in the project's segment list
    And video metadata (duration, resolution) should be displayed

  Scenario: Handle upload errors gracefully
    Given a video is being uploaded
    When the network connection is lost
    Then I should see an error message
    And I should have the option to retry the upload

  Scenario: Cancel upload in progress
    Given a video is being uploaded
    When I click the "Cancel" button
    Then the upload should stop
    And no partial file should be saved
    And I should be able to start a new upload

  Scenario: Reject invalid file types
    When I try to upload a file with extension ".txt"
    Then I should see an error "Only video files are accepted"
    And the upload should not start
```

#### Technical Notes
- Supported formats: MP4, MKV, MOV, WebM, AVI
- Max file size: 10GB
- Use chunked upload for large files
- Validate MIME type and magic bytes

#### Playwright Test Specs

```typescript
test.describe('Upload Single Video', () => {
  test('should upload video and show progress', async ({ page }) => {
    await loginAs(page, 'aaron');
    await page.goto('/project/test-project');
    
    // Upload file
    const fileInput = page.locator('[data-testid="file-input"]');
    await fileInput.setInputFiles('tests/fixtures/sample-video.mp4');
    
    // Wait for progress bar
    await expect(page.locator('[data-testid="upload-progress"]')).toBeVisible();
    
    // Wait for completion
    await expect(page.locator('[data-testid="upload-success"]')).toBeVisible({ timeout: 60000 });
    await expect(page.locator('[data-testid="segment-list"]')).toContainText('sample-video');
  });

  test('should reject non-video files', async ({ page }) => {
    await loginAs(page, 'aaron');
    await page.goto('/project/test-project');
    
    const fileInput = page.locator('[data-testid="file-input"]');
    await fileInput.setInputFiles('tests/fixtures/document.pdf');
    
    await expect(page.locator('[data-testid="upload-error"]')).toContainText('video files');
  });
});
```

---

### Story 2.3: Upload Multiple Videos

**Story ID:** BDV2-US-2.3  
**Points:** 5  
**Priority:** P0  

> As Aaron, I want to upload multiple videos at once so that I can batch process my recordings.

#### Acceptance Criteria

```gherkin
Feature: Upload Multiple Videos

  Scenario: Select multiple files at once
    Given I am on a project page
    When I click "Upload Videos"
    And I select 3 video files from my computer
    Then all 3 files should appear in the upload queue
    And each should show its own progress bar

  Scenario: Drag and drop multiple files
    When I drag 4 video files onto the upload zone
    And I drop them
    Then all 4 files should start uploading

  Scenario: Sequential upload processing
    Given I have uploaded 3 videos
    When uploads are in progress
    Then videos should upload one at a time (not simultaneously)
    And I should see "1 of 3", "2 of 3", etc. indicators

  Scenario: Partial failure handling
    Given I am uploading 3 videos
    When 1 upload fails and 2 succeed
    Then the 2 successful uploads should be available
    And the failed upload should show an error with retry option
    And I should see a summary "2 succeeded, 1 failed"

  Scenario: Clear completed uploads
    Given I have completed uploading multiple videos
    When I click "Clear Completed"
    Then the success indicators should be removed
    And the videos should remain in my project
```

---

### Story 2.4: View Upload Progress

**Story ID:** BDV2-US-2.4  
**Points:** 3  
**Priority:** P0  

> As Aaron, I want to see detailed upload progress so that I know how long to wait.

#### Acceptance Criteria

```gherkin
Feature: Upload Progress Display

  Scenario: Show upload percentage
    Given a video is being uploaded
    Then I should see a progress bar
    And I should see the percentage (e.g., "45%")
    And the progress should update in real-time

  Scenario: Show upload speed
    Given a video is being uploaded
    Then I should see the current upload speed (e.g., "12.5 MB/s")

  Scenario: Show time remaining
    Given a video is being uploaded
    Then I should see estimated time remaining (e.g., "2 minutes left")

  Scenario: Show file size information
    Given a video is being uploaded
    Then I should see "250 MB of 1.2 GB uploaded"

  Scenario: Navigate away and return
    Given a video is being uploaded
    When I navigate to another page
    And I return to the project page
    Then I should still see the upload progress
    And the upload should continue in the background
```

---

### Story 2.5: Manage Video Segments

**Story ID:** BDV2-US-2.5  
**Points:** 5  
**Priority:** P0  

> As Aaron, I want to reorder and manage uploaded segments so that I can control the final video sequence.

#### Acceptance Criteria

```gherkin
Feature: Manage Video Segments

  Scenario: View segment list
    Given I have uploaded 3 videos to a project
    When I view the project page
    Then I should see all 3 segments listed
    And each should show filename, duration, and thumbnail

  Scenario: Reorder segments via drag and drop
    Given I have segments A, B, C in that order
    When I drag segment C to the top
    Then the order should become C, A, B
    And this order should be persisted

  Scenario: Delete a segment
    Given I have 3 segments uploaded
    When I click the delete button on one segment
    And I confirm the deletion
    Then the segment should be removed
    And the source file should be deleted from storage

  Scenario: View segment details
    When I click on a segment in the list
    Then I should see detailed metadata:
      | Field      | Example Value        |
      | Filename   | recording-2024-02-28 |
      | Duration   | 45:23                |
      | Resolution | 1920x1080            |
      | Codec      | H.264                |
      | Size       | 2.4 GB               |

  Scenario: Preview segment thumbnail
    Given segments are listed
    Then each segment should show a thumbnail preview
    And I can hover to see a larger preview
```

#### Playwright Test Specs

```typescript
test.describe('Manage Video Segments', () => {
  test('should display segment metadata', async ({ page }) => {
    await loginAs(page, 'aaron');
    await setupProjectWithSegments(page, 'test-project', 2);
    
    await page.goto('/project/test-project');
    
    const segments = page.locator('[data-testid="segment-item"]');
    await expect(segments).toHaveCount(2);
    await expect(segments.first().locator('[data-testid="segment-duration"]')).toBeVisible();
  });

  test('should reorder segments via drag and drop', async ({ page }) => {
    await loginAs(page, 'aaron');
    await setupProjectWithSegments(page, 'test-project', 3);
    
    await page.goto('/project/test-project');
    
    // Drag third segment to first position
    const thirdSegment = page.locator('[data-testid="segment-item"]').nth(2);
    const firstPosition = page.locator('[data-testid="segment-item"]').first();
    
    await thirdSegment.dragTo(firstPosition);
    
    // Verify new order
    await page.reload();
    const firstSegmentName = await page.locator('[data-testid="segment-item"]').first().textContent();
    expect(firstSegmentName).toContain('segment-3');
  });
});
```

---

### Story 2.6: Project List Dashboard

**Story ID:** BDV2-US-2.6  
**Points:** 3  
**Priority:** P0  

> As Aaron, I want to see all my projects in a dashboard so that I can easily navigate between them.

#### Acceptance Criteria

```gherkin
Feature: Project List Dashboard

  Scenario: View all projects
    Given I am logged in
    When I navigate to "/projects"
    Then I should see a list of all my projects
    And each project should show name, status, and last modified date

  Scenario: Projects sorted by recent activity
    Given I have multiple projects
    When I view the project list
    Then projects should be sorted by last modified date (newest first)

  Scenario: Filter projects by status
    Given I have projects in various states
    When I filter by "Processing"
    Then I should only see projects currently being processed

  Scenario: Search projects by name
    When I type "Genesis" in the search box
    Then I should only see projects containing "Genesis" in the name

  Scenario: Delete a project
    When I click the delete button on a project
    And I confirm with "Delete permanently"
    Then the project should be removed
    And all associated files should be deleted

  Scenario: Show project status indicators
    Then I should see visual status indicators:
      | Status     | Indicator                |
      | uploading  | Blue spinning icon       |
      | processing | Yellow progress bar      |
      | ready      | Green checkmark          |
      | error      | Red exclamation mark     |
```

---

## Definition of Done

- [ ] All stories have passing unit tests
- [ ] All stories have passing integration tests
- [ ] All stories have passing E2E tests (Playwright)
- [ ] E2E screenshots captured at 3 viewports
- [ ] File upload handles 10GB files successfully
- [ ] Upload progress is accurate and real-time
- [ ] Drag and drop works on all supported browsers
- [ ] Mobile layout is usable for project management

---

## Technical Dependencies

- File upload API endpoint with chunked upload support
- File validation (MIME type, magic bytes)
- Thumbnail generation using FFmpeg
- SQLite database for project/segment metadata

## Estimated Total Points: 24
