# User Story: [US-BA-02] Basic Screenshot Capture

**Epic:** EPIC-01 (Playwright Setup & Validation)  
**Project:** Browser Automation Infrastructure  
**Status:** approved  
**Story Architect:** story-architect  
**Created:** 2026-02-28 04:15 EST  
**Version:** 1  
**Test Server:** https://example.com (public)

---

## Story

**As a** validation agent (Sophie or sub-agents)  
**I want** to capture screenshots of any public URL using Playwright  
**So that** I can verify webpage content visually for validation workflows

---

## Acceptance Criteria

### AC-1: Capture Public Website Screenshot

**Given** Playwright is installed and Chromium is available (US-BA-01 complete)  
**When** I execute a Playwright screenshot command against https://example.com  
**Then** a PNG file is created at the specified output path

**Validation:**
- Method: Shell command execution + file verification
- Test Command:
  ```bash
  node -e "
  const {chromium} = require('playwright');
  (async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto('https://example.com');
    await page.screenshot({ path: '/tmp/playwright-test-example.png' });
    await browser.close();
    console.log('Screenshot saved to /tmp/playwright-test-example.png');
  })();"
  ls -la /tmp/playwright-test-example.png
  ```
- Expected Output: File exists with size > 0 bytes
- Screenshot: Required ✅ (captured PNG + command output)

---

### AC-2: Screenshot Has Meaningful Content (Not Blank)

**Given** a screenshot file was captured  
**When** I check the file size and optionally examine content  
**Then** the file is at least 10KB and represents actual webpage content

**Validation:**
- Method: File size check + visual inspection
- Test Command:
  ```bash
  stat -c%s /tmp/playwright-test-example.png  # Should be > 10000
  file /tmp/playwright-test-example.png       # Should be "PNG image data"
  ```
- Expected Output: Size > 10KB, file type is PNG
- Screenshot: Required ✅ (show the captured image content)

---

### AC-3: Full Page Screenshot (Scrollable Content)

**Given** basic screenshot works  
**When** I capture a full-page screenshot (scrolling entire page)  
**Then** the entire page content is captured, not just the viewport

**Validation:**
- Method: Full page screenshot + dimension check
- Test Command:
  ```bash
  node -e "
  const {chromium} = require('playwright');
  (async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto('https://playwright.dev');
    await page.screenshot({ path: '/tmp/fullpage.png', fullPage: true });
    await browser.close();
    console.log('Full page screenshot saved');
  })();"
  ```
- Expected Output: Image height > 1000px (captures scrollable content)
- Screenshot: Required ✅ (show full page capture)

---

### AC-4: Custom Viewport Size (Mobile Simulation)

**Given** basic screenshot works  
**When** I capture with mobile viewport (375x667 - iPhone SE)  
**Then** the screenshot has exactly those dimensions

**Validation:**
- Method: Screenshot with custom viewport + dimension verification
- Test Command:
  ```bash
  node -e "
  const {chromium} = require('playwright');
  (async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 375, height: 667 } });
    await page.goto('https://example.com');
    await page.screenshot({ path: '/tmp/mobile-screenshot.png' });
    await browser.close();
    console.log('Mobile screenshot saved');
  })();"
  identify /tmp/mobile-screenshot.png  # Check dimensions
  ```
- Expected Output: Image dimensions 375x667
- Screenshot: Required ✅ (mobile-sized capture)

---

### AC-5: Desktop Viewport Size (1920x1080)

**Given** basic screenshot works  
**When** I capture with desktop viewport (1920x1080)  
**Then** the screenshot has exactly those dimensions

**Validation:**
- Method: Screenshot with desktop viewport + dimension verification
- Test Command:
  ```bash
  node -e "
  const {chromium} = require('playwright');
  (async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    await page.goto('https://example.com');
    await page.screenshot({ path: '/tmp/desktop-screenshot.png' });
    await browser.close();
    console.log('Desktop screenshot saved');
  })();"
  identify /tmp/desktop-screenshot.png
  ```
- Expected Output: Image dimensions 1920x1080
- Screenshot: Required ✅ (desktop-sized capture)

---

### AC-6: Wait for Network Idle Before Screenshot

**Given** a page with dynamic content  
**When** I capture with `waitUntil: 'networkidle'`  
**Then** the screenshot shows fully loaded content, not loading spinners

**Validation:**
- Method: Screenshot with network idle wait
- Test Command:
  ```bash
  node -e "
  const {chromium} = require('playwright');
  (async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto('https://playwright.dev', { waitUntil: 'networkidle' });
    await page.screenshot({ path: '/tmp/networkidle.png' });
    await browser.close();
    console.log('Network idle screenshot saved');
  })();"
  ```
- Expected Output: Screenshot shows fully loaded page
- Screenshot: Required ✅ (show loaded content)

---

### AC-7: Error Handling for Invalid URL

**Given** Playwright screenshot capability works  
**When** I attempt to screenshot an invalid/unreachable URL  
**Then** I get a clear error message (not a hang or crash)

**Validation:**
- Method: Test with unreachable URL
- Test Command:
  ```bash
  timeout 30 node -e "
  const {chromium} = require('playwright');
  (async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    try {
      await page.goto('https://this-domain-definitely-does-not-exist-12345.com', { timeout: 10000 });
    } catch (e) {
      console.log('Error caught:', e.message);
    }
    await browser.close();
  })();"
  ```
- Expected Output: Error message about DNS/connection failure
- Screenshot: Required ✅ (error output captured)

---

### AC-8: Error Handling for Timeout

**Given** Playwright screenshot capability works  
**When** I set a short timeout and page takes too long  
**Then** I get a timeout error (not infinite hang)

**Validation:**
- Method: Test with short timeout
- Test Command:
  ```bash
  timeout 15 node -e "
  const {chromium} = require('playwright');
  (async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    try {
      await page.goto('https://httpstat.us/200?sleep=30000', { timeout: 5000 });
    } catch (e) {
      console.log('Timeout caught:', e.message);
    }
    await browser.close();
  })();"
  ```
- Expected Output: Timeout error message
- Screenshot: Required ✅ (timeout error output)

---

## Contingencies

### What Could Go Wrong

| Risk | Likelihood | Impact | Detection | Mitigation |
|------|------------|--------|-----------|------------|
| Headless browser won't start | L | H | "Failed to launch browser" | Check deps, try with --no-sandbox |
| Screenshot is blank/white | M | M | File size < 5KB | Add wait time, check page loaded |
| Page not fully loaded | M | M | Missing content in image | Use networkidle or explicit waits |
| HTTPS certificate errors | L | L | SSL error message | Use ignoreHTTPSErrors option |
| Memory exhaustion | L | H | ENOMEM error | Ensure browser.close() always runs |
| Process hangs indefinitely | M | M | No output | Add timeout wrapper, ensure cleanup |
| ImageMagick identify not installed | M | L | "command not found" | Use file command or image analysis |
| Output path not writable | L | L | EACCES error | Use /tmp or check permissions |

### Fallback Options

- **If node one-liner too complex:** Create a standalone script file
- **If Chromium fails:** Try with Firefox (`playwright.firefox`)
- **If headless fails:** Try with `headless: false` on Xvfb display

### Blockers (Would Prevent Story Completion)

| Blocker | Likelihood | Mitigation |
|---------|------------|------------|
| US-BA-01 not complete | - | Wait for installation verification |
| Network access blocked | VL | dev3 has internet |
| example.com down | VL | Use alternative test URL |

### Early Warning Signs

- Browser launch takes >10 seconds
- Multiple "timeout" errors
- Screenshots consistently < 1KB
- "Cannot read property" errors (code bugs)

---

## Dependencies

### Dependency Graph

```
[US-BA-01: Installation] ────► [THIS STORY: US-BA-02] ────► [US-BA-03: MELO Screenshot]
                                         │
                                         └──► [US-BA-04: Reliability]
```

### Upstream (Must Complete First)

| Dependency | Type | Status | Blocker? | Notes |
|------------|------|--------|----------|-------|
| US-BA-01 (Installation) | story | pending | YES | Must have Playwright working |

### Downstream (Waiting on This)

| Dependent | Type | Impact if Delayed |
|-----------|------|-------------------|
| US-BA-03 (MELO Screenshot) | story | Cannot test localhost |
| US-BA-04 (Reliability) | story | Nothing to run 10x |
| MELO validation workflow | feature | Still blocked |

### External Dependencies

| External | Description | Status | Fallback |
|----------|-------------|--------|----------|
| example.com | Test target URL | available | httpbin.org, google.com |
| playwright.dev | Full-page test | available | Any content-rich site |
| Internet connectivity | Required for all tests | available | - |

### Technical Prerequisites

- [x] US-BA-01 complete (Playwright installed)
- [x] Chromium browser available
- [x] Internet connectivity
- [ ] ImageMagick `identify` command (for dimension checks)
- [ ] Output directory writable (/tmp)

---

## Out of Scope

Explicitly NOT included in this story (to prevent scope creep):

- PDF generation (screenshot only)
- Video recording
- Localhost/development server testing (that's US-BA-03)
- Multi-browser testing (Firefox, WebKit)
- Playwright Test framework integration
- Parallel screenshot capture
- Screenshot comparison/diff testing
- Creating reusable screenshot utility scripts

---

## Technical Notes

### Suggested Approach

1. **Start simple:** Basic screenshot of example.com
2. **Add viewports:** Test mobile, tablet, desktop sizes
3. **Add waits:** Test networkidle for dynamic content
4. **Test errors:** Verify graceful failure handling
5. **Document patterns:** Note working code snippets

### Playwright Screenshot API Reference

```javascript
// Basic options
await page.screenshot({
  path: 'screenshot.png',        // Output file
  fullPage: true,                // Capture entire scrollable page
  type: 'png',                   // or 'jpeg'
  quality: 80,                   // 0-100 for jpeg only
  timeout: 30000,                // milliseconds
});

// Viewport options (on page creation)
const page = await browser.newPage({
  viewport: { width: 1920, height: 1080 }
});

// Navigation options
await page.goto(url, {
  waitUntil: 'networkidle',      // or 'load', 'domcontentloaded'
  timeout: 30000
});
```

### Standard Viewport Sizes for Validation

| Device | Width | Height | Viewport Setting |
|--------|-------|--------|------------------|
| Desktop | 1920 | 1080 | `{ width: 1920, height: 1080 }` |
| Tablet | 768 | 1024 | `{ width: 768, height: 1024 }` |
| Mobile | 375 | 667 | `{ width: 375, height: 667 }` |

### Anti-Patterns to Avoid

- Don't forget `await browser.close()` (leaks processes)
- Don't hardcode paths without checking writability
- Don't skip waitUntil for dynamic content sites
- Don't catch errors silently without logging

---

## Test Credentials

**Location:** N/A (public URLs only)

---

## Sub-Tasks (Coordinator Fills This)

| Task ID | Description | Model | Status |
|---------|-------------|-------|--------|
| | | | |

---

## Definition of Done

- [ ] AC-1: Can capture basic screenshot
- [ ] AC-2: Screenshot has content (>10KB)
- [ ] AC-3: Full page capture works
- [ ] AC-4: Mobile viewport works (375x667)
- [ ] AC-5: Desktop viewport works (1920x1080)
- [ ] AC-6: Network idle wait works
- [ ] AC-7: Invalid URL shows clear error
- [ ] AC-8: Timeout shows clear error
- [ ] All test screenshots saved as evidence
- [ ] Working code patterns documented
- [ ] L1 (Self) validation complete
- [ ] L2 (Manager) validation complete

---

## Validation History

| Level | Validator | Date | Result | Report |
|-------|-----------|------|--------|--------|
| L1 Self | | | | |
| L2 Manager | | | | |
| L3 Peer | | | | |

---

## Review Checklist (Story Architect / Reviewer)

### Completeness
- [x] Happy path covered (basic screenshot)
- [x] Alternate valid paths covered (viewports, full page)
- [x] All error scenarios covered (invalid URL, timeout)
- [x] All edge cases covered (large pages, dynamic content)
- [x] Empty states covered (N/A)
- [x] Boundary conditions covered (file size checks)
- [x] Permission/auth cases covered (N/A for public URLs)

### Testability
- [x] Every AC has Given/When/Then
- [x] Every AC has validation method with commands
- [x] ACs are specific and measurable
- [x] No ambiguous language

### Dependencies
- [x] Upstream dependencies identified (US-BA-01)
- [x] Downstream dependents identified
- [x] External dependencies mapped
- [x] Technical prerequisites listed
- [x] No circular dependencies

### Contingencies
- [x] Risks identified with mitigations
- [x] Fallback options documented
- [x] Blockers identified with workarounds
- [x] Early warning signs listed

### Clarity
- [x] Sonnet could implement without clarifying questions
- [x] No ambiguous terms
- [x] Scope boundaries explicit (out of scope)
- [x] Technical notes sufficient

---

## Review History

| Version | Reviewer | Date | Outcome | Key Feedback |
|---------|----------|------|---------|--------------|
| v1 | story-architect | 2026-02-28 | approved | Comprehensive screenshot testing |

---

## VSDD Compliance (Mandatory)

### Verification Properties

| Property ID | Property | Testable | Coverage |
|-------------|----------|----------|----------|
| VP-BA02-1 | Screenshot produces valid PNG file | File type check | AC-1, AC-2 |
| VP-BA02-2 | Full page capture includes all scrollable content | Height > viewport | AC-3 |
| VP-BA02-3 | Custom viewport produces exact dimensions | Dimension check | AC-4, AC-5 |
| VP-BA02-4 | Network idle ensures fully loaded content | Visual inspection | AC-6 |
| VP-BA02-5 | Invalid URL produces clear error (not hang) | Timeout test | AC-7, AC-8 |

### Purity Boundary Map

**Pure Core (Deterministic, no side effects):**
- `parseScreenshotDimensions()` — Extract dimensions from file
- `validateFileSize()` — Check file > threshold
- `formatOutputPath()` — Path string formatting

**Effectful Shell (Side effects allowed):**
- Browser launch/close
- Page navigation
- Screenshot file write
- Network requests

**Adapters (Thin wrappers):**
- N/A — Infrastructure story, direct Playwright usage

### Red Gate Tests (Must fail before implementation)

| Test | Test Description | Expected Failure |
|------|------------------|------------------|
| Screenshot file exists | Check /tmp/playwright-test-example.png | File not found |
| File size > 10KB | Check meaningful content | Size too small OR file not found |
| Dimensions match viewport | 375x667 or 1920x1080 | Wrong dimensions |
| Error on invalid URL | Connection refused message | No error OR hang |

### Contract Chain

```
Spec: US-BA-02 (Basic Screenshot)
  ↓
Properties: VP-BA02-1 through VP-BA02-5
  ↓
Beads: bd-ba-screenshot (to create if needed)
  ↓
Tests: Shell command validation (AC-1 through AC-8)
  ↓
Code: Playwright scripts, screenshot commands
```

---
*Story Architect: Opus | Created for EPIC-01 Playwright Setup | VSDD Updated 2026-03-01*
