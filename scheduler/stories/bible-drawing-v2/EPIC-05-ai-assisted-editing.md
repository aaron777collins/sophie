# Epic 05: AI-Assisted Editing

**Epic ID:** BDV2-EPIC-05  
**Priority:** P1 (Should Have)  
**Status:** Draft  
**Dependencies:** EPIC-04 (Transcript Editor)  

## Description

AI-powered editing assistance using Claude to analyze transcripts, suggest episode cuts, identify themes, and help create coherent 10-minute videos from longer recordings.

## Business Value

- Reduces manual review time significantly
- Ensures narrative coherence in edited content
- Identifies best segments objectively
- Enables "assistant-guided" editing workflow

---

## User Stories

### Story 5.1: Analyze Transcript Content

**Story ID:** BDV2-US-5.1  
**Points:** 5  
**Priority:** P1  

> As Aaron, I want AI to analyze my transcript so that I can understand the content structure.

#### Acceptance Criteria

```gherkin
Feature: Analyze Transcript Content

  Scenario: Generate content summary
    Given a transcript exists for my video
    When I click "Analyze Content"
    Then I should see an AI-generated summary including:
      | Element          | Example                              |
      | Main topics      | Genesis 1, Creation, Day 1-3         |
      | Key themes       | God's creative power, order from chaos|
      | Scripture refs   | Genesis 1:1-13                       |
      | Duration breakdown| Topic A: 12min, Topic B: 8min       |

  Scenario: Identify natural segments
    When analysis completes
    Then I should see suggested segment boundaries
    And each segment should have:
      - Start/end timestamps
      - Topic summary
      - Suggested title
    And I can click to preview each segment

  Scenario: Flag potential issues
    When analysis completes
    Then I should see warnings for:
      | Issue            | Example                              |
      | Audio problems   | "Unclear speech at 23:45"           |
      | Long tangent     | "Off-topic discussion 15:00-18:30"  |
      | Repetition       | "Same point made at 5:00 and 25:00" |
      | Missing context  | "References unshown drawing at 10:00"|
```

#### Technical Notes
- Use Claude API for analysis
- Send transcript in chunks if very long
- Cache analysis results
- Estimated API cost per analysis

---

### Story 5.2: Suggest Episode Cuts

**Story ID:** BDV2-US-5.2  
**Points:** 8  
**Priority:** P1  

> As Aaron, I want AI to suggest how to cut my hour-long recording into a 10-minute episode so that I can quickly create focused content.

#### Acceptance Criteria

```gherkin
Feature: Suggest Episode Cuts

  Scenario: Generate episode suggestion
    Given I have a 60-minute transcribed video
    When I click "Suggest 10-Minute Episode"
    Then I should receive a suggestion including:
      - Segments to keep (with timestamps)
      - Segments to remove (with reasons)
      - Suggested title for the episode
      - Estimated final duration
      - Brief narrative summary

  Scenario: Preview suggested cuts
    Given AI has suggested episode cuts
    Then I should see the suggestions overlaid on the transcript
    And suggested removals should be highlighted differently than manual edits
    And I can play a preview of the suggested edit

  Scenario: Accept or reject suggestions
    Given AI suggestions are shown
    When I click "Accept All"
    Then all suggested cuts should be applied
    And this should be a single undo-able action
    
    When I click on individual suggestions
    Then I can accept or reject each one separately

  Scenario: Request different focus
    Given AI has made suggestions
    When I say "Focus more on the burning bush part"
    Then AI should regenerate suggestions
    And the new suggestions should emphasize that content

  Scenario: Target duration adjustment
    When I specify "Make it 15 minutes instead"
    Then AI should adjust suggestions for the new duration
    And include more content accordingly
```

#### Playwright Test Specs

```typescript
test.describe('Suggest Episode Cuts', () => {
  test('should generate AI suggestions', async ({ page }) => {
    await loginAs(page, 'aaron');
    await page.goto('/project/test-project/editor');
    
    await page.click('[data-testid="ai-suggest-button"]');
    
    // Wait for AI response
    await expect(page.locator('[data-testid="ai-suggestions"]')).toBeVisible({
      timeout: 30000
    });
    
    await expect(page.locator('[data-testid="suggested-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="suggested-duration"]')).toContainText('min');
  });

  test('should apply all suggestions at once', async ({ page }) => {
    await loginAs(page, 'aaron');
    await page.goto('/project/test-project/editor');
    
    await page.click('[data-testid="ai-suggest-button"]');
    await page.waitForSelector('[data-testid="ai-suggestions"]');
    
    await page.click('[data-testid="accept-all-suggestions"]');
    
    // Verify edits applied
    await expect(page.locator('[data-testid="transcript-word"].removed')).toHaveCount.greaterThan(0);
  });
});
```

---

### Story 5.3: Natural Language Edit Commands

**Story ID:** BDV2-US-5.3  
**Points:** 8  
**Priority:** P1  

> As Aaron, I want to give natural language commands to edit my video so that I can describe what I want in plain English.

#### Acceptance Criteria

```gherkin
Feature: Natural Language Edit Commands

  Scenario: Remove content by description
    Given I am in the editor
    When I type "Remove all the parts where I cough"
    Then AI should identify coughing sounds/mentions
    And mark those sections for removal
    And show me what it found before applying

  Scenario: Keep content by description
    When I type "Keep only the parts about David and Goliath"
    Then AI should identify relevant sections
    And mark everything else for removal
    And show the expected result

  Scenario: Trim to duration
    When I type "Make this video about 8 minutes long"
    Then AI should suggest cuts to achieve that duration
    And prioritize keeping the most important content

  Scenario: Rearrange content
    When I type "Move the conclusion to the beginning"
    Then AI should identify the conclusion
    And suggest reordering
    And show a preview of the new arrangement

  Scenario: Fix specific issues
    When I type "Fix the audio dropout at around 5 minutes"
    Then AI should identify the issue at that timestamp
    And suggest trimming or noting it for manual review
```

---

### Story 5.4: Content Quality Scoring

**Story ID:** BDV2-US-5.4  
**Points:** 3  
**Priority:** P2  

> As Aaron, I want to see quality scores for different parts of my video so that I know which parts are best.

#### Acceptance Criteria

```gherkin
Feature: Content Quality Scoring

  Scenario: Show segment quality indicators
    Given content has been analyzed
    Then each segment should have quality indicators:
      | Metric          | Description                    |
      | Audio clarity   | How clear is the speech        |
      | Content density | Information per minute         |
      | Engagement      | Likely viewer interest         |
      | Coherence       | How well it flows              |

  Scenario: Visual quality heat map
    When I view the transcript timeline
    Then I should see a color-coded bar indicating quality
    And green = high quality, red = potential issues

  Scenario: Sort by quality
    When I click "Show Best Segments"
    Then segments should be listed by quality score
    And I can quickly select high-quality sections
```

---

### Story 5.5: Smart Title and Description Generation

**Story ID:** BDV2-US-5.5  
**Points:** 3  
**Priority:** P2  

> As Aaron, I want AI to suggest titles and descriptions so that I can quickly prepare for YouTube upload.

#### Acceptance Criteria

```gherkin
Feature: Smart Title and Description Generation

  Scenario: Generate title suggestions
    Given I have edited my video
    When I click "Generate Title"
    Then I should see 3-5 title suggestions
    And I can click to copy any of them
    And I can request more options

  Scenario: Generate video description
    When I click "Generate Description"
    Then I should see a YouTube-ready description including:
      - Summary of content
      - Timestamps for key moments
      - Scripture references
      - Relevant hashtags

  Scenario: Edit generated content
    Given AI has generated a description
    Then I should be able to edit it inline
    And request AI to revise specific parts
```

---

## Definition of Done

- [ ] All stories have passing unit tests
- [ ] All stories have passing integration tests
- [ ] All stories have passing E2E tests
- [ ] AI responses return within 30 seconds
- [ ] Suggestions are accurate and relevant
- [ ] All AI actions are undo-able
- [ ] API usage is tracked and displayed
- [ ] Graceful fallback when API unavailable

---

## Technical Dependencies

- Claude API access
- API key management
- Rate limiting for API calls
- Response caching
- Streaming response support (nice to have)

## Estimated Total Points: 27
