# Epic 08: Video Export & Publishing

**Epic ID:** BDV2-EPIC-08  
**Priority:** P0 (MVP)  
**Status:** Draft  
**Dependencies:** EPIC-04 (Transcript Editor)  

## Description

Export edited videos as YouTube-ready files with proper encoding, subtitles, and thumbnails. Support multiple quality presets and formats.

## Business Value

- Produces YouTube-optimized output
- Generates required companion files (subtitles, thumbnails)
- Maintains professional quality standards
- Enables efficient publishing workflow

---

## User Stories

### Story 8.1: Export Video

**Story ID:** BDV2-US-8.1  
**Points:** 8  
**Priority:** P0  

> As Aaron, I want to export my edited video so that I can upload it to YouTube.

#### Acceptance Criteria

```gherkin
Feature: Export Video

  Scenario: Start export
    Given I have made edits to my transcript
    When I click "Export Video"
    Then I should see export options
    And I should see estimated file size
    And I should see estimated export time

  Scenario: Export applies transcript edits
    Given I have removed sections via transcript
    When export completes
    Then the exported video should not contain removed sections
    And transitions between kept sections should be smooth
    And audio should not have gaps or pops

  Scenario: Export progress
    Given export is in progress
    Then I should see:
      | Element          | Example                  |
      | Progress bar     | 45%                      |
      | Current stage    | "Rendering video..."     |
      | Time elapsed     | "2:30"                   |
      | Time remaining   | "~3:00"                  |

  Scenario: Export completion
    When export completes
    Then I should see a success message
    And I should have a download link
    And I should see file size and duration
    And the file should be saved in project exports

  Scenario: Continue editing during export
    Given export is in progress
    Then I should be able to continue editing
    And start new edits (separate version)
    And navigate to other projects
```

#### Playwright Test Specs

```typescript
test.describe('Export Video', () => {
  test('should export video with edits applied', async ({ page }) => {
    await loginAs(page, 'aaron');
    await page.goto('/project/test-project/editor');
    
    // Make some edits
    await removeSection(page, 0, 100);
    
    // Start export
    await page.click('[data-testid="export-button"]');
    await page.click('[data-testid="quality-option-1080p"]');
    await page.click('[data-testid="start-export"]');
    
    // Wait for completion
    await expect(page.locator('[data-testid="export-complete"]')).toBeVisible({
      timeout: 180000  // 3 minutes for test video
    });
    
    // Verify download available
    await expect(page.locator('[data-testid="download-link"]')).toBeVisible();
  });
});
```

---

### Story 8.2: Quality Presets

**Story ID:** BDV2-US-8.2  
**Points:** 3  
**Priority:** P0  

> As Aaron, I want quality presets so that I can easily choose the right output settings.

#### Acceptance Criteria

```gherkin
Feature: Quality Presets

  Scenario: Select quality preset
    When I click "Export Video"
    Then I should see preset options:
      | Preset       | Resolution | Bitrate   | Est. Size |
      | YouTube HD   | 1080p      | 12 Mbps   | ~1.5 GB   |
      | YouTube 4K   | 2160p      | 35 Mbps   | ~4 GB     |
      | Web Standard | 720p       | 5 Mbps    | ~600 MB   |
      | Quick Preview| 480p       | 2 Mbps    | ~200 MB   |

  Scenario: Preset matches source
    Given my source video is 1080p
    Then I should not see 4K as an option
    And 1080p should be marked as "native"

  Scenario: Custom settings
    When I click "Custom"
    Then I should be able to configure:
      - Resolution
      - Video bitrate
      - Audio bitrate
      - Codec (H.264 / H.265)
      - Container (MP4 / MKV)
```

---

### Story 8.3: Generate Subtitles

**Story ID:** BDV2-US-8.3  
**Points:** 3  
**Priority:** P0  

> As Aaron, I want subtitle files generated so that I can add captions on YouTube.

#### Acceptance Criteria

```gherkin
Feature: Generate Subtitles

  Scenario: Generate SRT file
    When export completes
    Then an SRT file should be generated
    And timing should match the exported video
    And removed sections should be excluded from subtitles

  Scenario: Subtitle options
    In export settings, I should be able to choose:
      | Option              | Default |
      | Generate subtitles  | Yes     |
      | Subtitle format     | SRT     |
      | Max chars per line  | 42      |
      | Include timestamps  | Yes     |

  Scenario: Subtitle timing accuracy
    Given subtitles are generated
    Then subtitle timing should be accurate within 100ms
    And subtitles should not overlap awkwardly
    And line breaks should occur at natural pauses

  Scenario: Multiple format export
    When I select "VTT" format additionally
    Then both SRT and VTT files should be generated
```

---

### Story 8.4: Generate Thumbnail

**Story ID:** BDV2-US-8.4  
**Points:** 3  
**Priority:** P1  

> As Aaron, I want a thumbnail generated so that I have a preview image for YouTube.

#### Acceptance Criteria

```gherkin
Feature: Generate Thumbnail

  Scenario: Auto-generate thumbnail
    When export completes
    Then a thumbnail should be generated
    And it should be from a visually interesting moment
    And it should be 1920x1080 resolution
    And it should be in JPG format

  Scenario: Choose thumbnail frame
    When I click "Choose Thumbnail"
    Then I should see multiple frame options
    And I can click to select one
    And I can scrub through the video to pick a frame

  Scenario: AI-suggested thumbnail
    When AI suggests a thumbnail
    Then it should identify a frame with:
      - Good composition (drawing visible)
      - Clear, in-focus image
      - Not a transition/blur

  Scenario: Custom thumbnail upload
    When I click "Upload Custom"
    Then I should be able to upload an image
    And it should be resized appropriately
    And it should be saved with the export
```

---

### Story 8.5: Export History

**Story ID:** BDV2-US-8.5  
**Points:** 3  
**Priority:** P1  

> As Aaron, I want to see my export history so that I can access previous exports.

#### Acceptance Criteria

```gherkin
Feature: Export History

  Scenario: View export list
    Given I have exported multiple versions
    When I click "Exports" tab
    Then I should see a list of all exports with:
      | Field      | Example              |
      | Date       | Feb 28, 2024 3:30 PM |
      | Duration   | 10:23                |
      | File size  | 845 MB               |
      | Quality    | 1080p                |
      | Version    | "Final edit v2"      |

  Scenario: Re-download previous export
    When I click on a previous export
    Then I should be able to download it again
    And see its associated subtitle file
    And see its thumbnail

  Scenario: Delete old exports
    When I click "Delete" on an old export
    And confirm deletion
    Then the export files should be removed
    And storage space should be freed

  Scenario: Compare exports
    Given I have multiple exports
    When I select two exports
    Then I should be able to compare:
      - Duration difference
      - Which edits differ
      - File size comparison
```

---

### Story 8.6: Batch Export

**Story ID:** BDV2-US-8.6  
**Points:** 5  
**Priority:** P2  

> As Aaron, I want to batch export multiple projects so that I can prepare several videos at once.

#### Acceptance Criteria

```gherkin
Feature: Batch Export

  Scenario: Select multiple projects
    Given I am on the projects list
    When I select multiple projects with checkboxes
    And click "Export Selected"
    Then I should see batch export options

  Scenario: Apply same settings
    When I configure batch export
    Then I can apply the same quality settings to all
    Or I can use each project's default settings

  Scenario: Batch progress
    Given batch export is running
    Then I should see:
      - Overall progress "3 of 5 complete"
      - Individual progress for current export
      - Estimated total time remaining

  Scenario: Handle partial failures
    Given one export fails in a batch
    Then other exports should continue
    And I should see which failed with the reason
    And I can retry failed exports
```

---

### Story 8.7: Export Notifications

**Story ID:** BDV2-US-8.7  
**Points:** 2  
**Priority:** P1  

> As Aaron, I want notifications when export completes so that I know when to download.

#### Acceptance Criteria

```gherkin
Feature: Export Notifications

  Scenario: Browser notification
    Given I have started an export
    And I am on another page or tab
    When export completes
    Then I should receive a browser notification
    And clicking it should take me to the export

  Scenario: Email notification (optional)
    Given I have enabled email notifications
    When export completes
    Then I should receive an email with:
      - Project name
      - Export duration and size
      - Download link

  Scenario: Slack notification (Sophie)
    Given export completes
    Then Sophie can notify me in Slack
    With project details and completion status
```

---

## Definition of Done

- [ ] All stories have passing unit tests
- [ ] All stories have passing integration tests
- [ ] All stories have passing E2E tests
- [ ] Exported video matches preview exactly
- [ ] Audio has no gaps, pops, or glitches
- [ ] Subtitles sync within 100ms
- [ ] Thumbnail is high quality
- [ ] YouTube upload succeeds without issues

---

## Technical Dependencies

- FFmpeg for video encoding
- Complex filter graphs for edit application
- Background worker for long exports
- File download handling
- Notification APIs

## Estimated Total Points: 27
