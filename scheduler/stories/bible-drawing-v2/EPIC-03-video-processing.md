# Epic 03: Video Processing Pipeline

**Epic ID:** BDV2-EPIC-03  
**Priority:** P0 (MVP)  
**Status:** Draft  
**Dependencies:** EPIC-02 (Video Upload)  

## Description

Automated video processing pipeline that removes silence, normalizes audio, reduces background noise, and generates transcripts from uploaded videos. Integrates existing CLI tools (FFmpeg, Auto-Editor, Whisper) into the web application.

## Business Value

- Automates tedious editing tasks
- Reduces hour-long recordings to focused content
- Produces accurate transcripts for editing
- Maintains broadcast-quality audio standards

---

## User Stories

### Story 3.1: Automatic Processing Start

**Story ID:** BDV2-US-3.1  
**Points:** 3  
**Priority:** P0  

> As Aaron, I want processing to start automatically after upload so that I don't have to manually trigger it.

#### Acceptance Criteria

```gherkin
Feature: Automatic Processing Start

  Scenario: Processing starts after upload completes
    Given I have uploaded a video to a project
    When the upload completes successfully
    Then video processing should start automatically
    And I should see a "Processing started" notification
    And the segment status should change to "processing"

  Scenario: Processing starts for each segment independently
    Given I upload 3 videos to a project
    When the first upload completes
    Then processing should start for that segment immediately
    And other segments should continue uploading

  Scenario: Manual processing trigger
    Given a segment failed processing previously
    When I click "Retry Processing"
    Then processing should restart for that segment
    And previous partial results should be cleared
```

---

### Story 3.2: Silence Removal

**Story ID:** BDV2-US-3.2  
**Points:** 5  
**Priority:** P0  

> As Aaron, I want silence automatically removed from my videos so that dead air is cut out.

#### Acceptance Criteria

```gherkin
Feature: Silence Removal

  Scenario: Remove silence with default settings
    Given a video segment is being processed
    When the silence removal stage runs
    Then silence longer than 0.5 seconds should be removed
    And natural pauses should be preserved (0.1s margin before, 0.15s after speech)
    And the processing log should show how much was removed

  Scenario: Report silence removal statistics
    When silence removal completes
    Then I should see:
      | Statistic       | Example       |
      | Original length | 45:00         |
      | After removal   | 28:30         |
      | Time saved      | 16:30 (37%)   |

  Scenario: Preserve meaningful pauses
    Given the video contains natural speech pauses
    When silence removal runs
    Then pauses shorter than 0.5 seconds should be kept
    And transitions between topics should sound natural

  Scenario: Handle continuous speech
    Given a video with very little silence
    When silence removal runs
    Then the video should remain mostly intact
    And no audio should be corrupted or clipped
```

#### Technical Notes
- Use Auto-Editor with configured thresholds
- Default: -35dB threshold, 0.5s minimum silence
- Margins: 0.1s before, 0.15s after speech
- Output intermediate file for further processing

---

### Story 3.3: Audio Normalization

**Story ID:** BDV2-US-3.3  
**Points:** 3  
**Priority:** P0  

> As Aaron, I want audio normalized to broadcast standards so that my videos have consistent volume.

#### Acceptance Criteria

```gherkin
Feature: Audio Normalization

  Scenario: Normalize to broadcast standard
    Given a video segment with varying audio levels
    When audio normalization runs
    Then the audio should be normalized to -14 LUFS
    And peak levels should not exceed -1.5 dBTP
    And loudness range should be approximately 11 LU

  Scenario: Apply noise reduction
    Given a video with background hum or noise
    When processing completes
    Then low frequency rumble (<80Hz) should be filtered
    And high frequency hiss (>12kHz) should be filtered
    And voice frequencies should remain clear

  Scenario: Maintain audio quality
    Given the original audio is high quality
    When normalization completes
    Then output should be AAC at 192kbps
    And no audible artifacts should be introduced
```

---

### Story 3.4: Transcription Generation

**Story ID:** BDV2-US-3.4  
**Points:** 5  
**Priority:** P0  

> As Aaron, I want my video automatically transcribed so that I can edit by text.

#### Acceptance Criteria

```gherkin
Feature: Transcription Generation

  Scenario: Generate transcript with word timestamps
    Given a video segment has completed audio processing
    When transcription runs
    Then a transcript should be generated
    And each word should have a start and end timestamp
    And confidence scores should be included

  Scenario: Detect filler words
    Given the transcript contains filler words (um, uh, etc.)
    When transcription completes
    Then filler words should be marked/flagged in the transcript
    And I should be able to see a count of filler words

  Scenario: Handle long videos efficiently
    Given a video is 60 minutes long
    When transcription runs
    Then processing should complete within 30 minutes
    And progress should be reported during transcription

  Scenario: Transcription accuracy
    Given clear audio with speech
    When transcription completes
    Then accuracy should be >= 90% for clear speech
    And proper nouns should be reasonably transcribed

  Scenario: Generate subtitle file
    When transcription completes
    Then an SRT file should be generated
    And timing should match the processed video
    And subtitles should be properly segmented (not too long per line)
```

#### Technical Notes
- Use Whisper with 'base' model by default
- Generate word-level timestamps
- Output: JSON transcript + SRT file
- Store filler word locations for editor highlighting

---

### Story 3.5: Processing Progress Tracking

**Story ID:** BDV2-US-3.5  
**Points:** 5  
**Priority:** P0  

> As Aaron, I want to see processing progress so that I know when my video will be ready.

#### Acceptance Criteria

```gherkin
Feature: Processing Progress Tracking

  Scenario: Show current processing stage
    Given a video is being processed
    Then I should see which stage is currently active:
      | Stage              | Description            |
      | analyzing          | Detecting audio levels |
      | removing_silence   | Cutting dead air       |
      | normalizing        | Adjusting audio levels |
      | transcribing       | Converting to text     |
      | finalizing         | Preparing for editing  |

  Scenario: Show progress percentage
    Given processing is in the "transcribing" stage
    Then I should see overall progress (e.g., "75%")
    And I should see stage-specific progress
    And the progress bar should animate smoothly

  Scenario: Show estimated time remaining
    Given processing is underway
    Then I should see estimated completion time
    And the estimate should update as processing continues

  Scenario: Processing notification
    Given I start processing and navigate away
    When processing completes
    Then I should receive a notification
    And I should be able to click to view the result

  Scenario: Processing error display
    Given processing fails at some stage
    Then I should see which stage failed
    And I should see an error message
    And I should have a "Retry" option
```

#### Playwright Test Specs

```typescript
test.describe('Processing Progress', () => {
  test('should show processing stages', async ({ page }) => {
    await loginAs(page, 'aaron');
    await uploadVideo(page, 'test-project', 'sample-video.mp4');
    
    // Verify processing started
    await expect(page.locator('[data-testid="processing-status"]')).toBeVisible();
    await expect(page.locator('[data-testid="processing-stage"]')).toBeVisible();
    
    // Wait for completion (with longer timeout for processing)
    await expect(page.locator('[data-testid="processing-complete"]')).toBeVisible({ 
      timeout: 120000 
    });
  });

  test('should show error and retry option on failure', async ({ page }) => {
    // Simulate processing failure
    await loginAs(page, 'aaron');
    await uploadCorruptVideo(page, 'test-project');
    
    await expect(page.locator('[data-testid="processing-error"]')).toBeVisible({ 
      timeout: 60000 
    });
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
  });
});
```

---

### Story 3.6: Processing Configuration

**Story ID:** BDV2-US-3.6  
**Points:** 3  
**Priority:** P1  

> As Aaron, I want to configure processing settings so that I can adjust for different recording conditions.

#### Acceptance Criteria

```gherkin
Feature: Processing Configuration

  Background:
    Given I am on the project settings page

  Scenario: Configure silence detection
    When I adjust silence removal settings
    Then I should be able to set:
      | Setting           | Range     | Default |
      | Silence threshold | 0.1-2.0s  | 0.5s    |
      | Audio level       | -50 to -20dB | -35dB |
      | Margin before     | 0-0.5s    | 0.1s    |
      | Margin after      | 0-0.5s    | 0.15s   |

  Scenario: Choose Whisper model
    When I configure transcription settings
    Then I should be able to select:
      | Model  | Speed  | Accuracy |
      | tiny   | Fast   | Lower    |
      | base   | Medium | Good     |
      | small  | Slower | Better   |
      | medium | Slow   | High     |
      | large  | Slowest| Highest  |

  Scenario: Save settings as project defaults
    When I change settings for a project
    And I save them
    Then new segments in that project should use those settings
    And existing segments should keep their original settings

  Scenario: Preview settings before processing
    When I adjust settings
    Then I should see an explanation of what each setting does
    And I should see estimated processing time impact
```

---

### Story 3.7: Combine Multiple Segments

**Story ID:** BDV2-US-3.7  
**Points:** 5  
**Priority:** P0  

> As Aaron, I want to combine multiple video segments into one so that I can create a single cohesive video.

#### Acceptance Criteria

```gherkin
Feature: Combine Multiple Segments

  Scenario: Combine segments in order
    Given I have 3 processed segments in a project
    And they are ordered as segment-1, segment-2, segment-3
    When I click "Combine Segments"
    Then a single video should be created
    And the segments should appear in the specified order
    And a combined transcript should be generated

  Scenario: Respect segment order
    Given I have reordered segments to C, A, B
    When I combine them
    Then the resulting video should have C first, then A, then B
    And timestamps in the combined transcript should be adjusted

  Scenario: Handle different video formats
    Given I have segments with different codecs/resolutions
    When I combine them
    Then they should be transcoded to a common format
    And the output should be smooth with no glitches

  Scenario: Preview combined video
    Before combining permanently
    Then I should be able to preview the combined result
    And I should be able to cancel if it's not right
```

---

## Definition of Done

- [ ] All stories have passing unit tests
- [ ] All stories have passing integration tests  
- [ ] All stories have passing E2E tests
- [ ] Processing handles 60+ minute videos
- [ ] Silence removal matches CLI pipeline quality
- [ ] Transcription accuracy >= 90% on test samples
- [ ] Progress reporting is accurate within 5%
- [ ] Error handling covers all failure modes

---

## Technical Dependencies

- FFmpeg for audio/video manipulation
- Auto-Editor for silence removal
- Whisper for transcription
- Job queue for background processing
- WebSocket or SSE for real-time progress

## Estimated Total Points: 29
