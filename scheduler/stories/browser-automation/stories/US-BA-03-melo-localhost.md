# User Story: [US-BA-03] MELO Localhost Screenshot Capture

**Epic:** EPIC-01 (Playwright Setup & Validation)  
**Project:** Browser Automation Infrastructure  
**Status:** approved  
**Story Architect:** story-architect  
**Created:** 2026-02-28 04:30 EST  
**Version:** 1  
**Test Server:** http://localhost:3000 (MELO dev server)

---

## Story

**As a** MELO validation agent  
**I want** to capture screenshots of the MELO development server running on localhost:3000  
**So that** I can validate UI components, layouts, and user flows during development

---

## Acceptance Criteria

### AC-1: Localhost Connection Works

**Given** Playwright screenshot capability works (US-BA-02 complete)  
**And** MELO development server is running on localhost:3000  
**When** I navigate Playwright to http://localhost:3000  
**Then** the page loads without connection errors

**Validation:**
- Method: Playwright navigation + success check
- Test Commands:
  ```bash
  # First, verify MELO server is running
  curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "Server not running"
  
  # Then test Playwright connection
  node -e "
  const {chromium} = require('playwright');
  (async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    const response = await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    console.log('Status:', response.status());
    console.log('URL:', page.url());
    await browser.close();
  })();"
  ```
- Expected Output: Status 200, URL matches
- Screenshot: Required ✅ (navigation success output)

---

### AC-2: MELO Homepage Screenshot

**Given** localhost connection works  
**When** I capture a screenshot of http://localhost:3000  
**Then** the screenshot shows the MELO homepage with recognizable UI elements

**Validation:**
- Method: Screenshot capture + visual verification
- Test Command:
  ```bash
  node -e "
  const {chromium} = require('playwright');
  (async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.screenshot({ path: '/tmp/melo-homepage.png' });
    await browser.close();
    console.log('MELO homepage screenshot saved');
  })();"
  ```
- Expected Output: Screenshot file with MELO UI visible
- Screenshot: Required ✅ (MELO homepage at desktop size)

---

### AC-3: Sign-Up Page Screenshot

**Given** MELO homepage screenshot works  
**When** I capture http://localhost:3000/sign-up  
**Then** the screenshot shows the registration form UI

**Validation:**
- Method: Screenshot capture of specific route
- Test Command:
  ```bash
  node -e "
  const {chromium} = require('playwright');
  (async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    await page.goto('http://localhost:3000/sign-up', { waitUntil: 'networkidle' });
    await page.screenshot({ path: '/tmp/melo-signup.png' });
    await browser.close();
    console.log('MELO sign-up screenshot saved');
  })();"
  ```
- Expected Output: Screenshot showing registration form
- Screenshot: Required ✅ (sign-up page)

---

### AC-4: Login Page Screenshot

**Given** route screenshots work  
**When** I capture http://localhost:3000/sign-in  
**Then** the screenshot shows the login form UI

**Validation:**
- Method: Screenshot capture of login route
- Test Command:
  ```bash
  node -e "
  const {chromium} = require('playwright');
  (async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
    await page.goto('http://localhost:3000/sign-in', { waitUntil: 'networkidle' });
    await page.screenshot({ path: '/tmp/melo-signin.png' });
    await browser.close();
    console.log('MELO sign-in screenshot saved');
  })();"
  ```
- Expected Output: Screenshot showing login form
- Screenshot: Required ✅ (sign-in page)

---

### AC-5: Mobile Viewport MELO Screenshot

**Given** MELO screenshots work at desktop size  
**When** I capture MELO homepage with mobile viewport (375x667)  
**Then** the screenshot shows mobile-responsive MELO UI

**Validation:**
- Method: Mobile viewport screenshot
- Test Command:
  ```bash
  node -e "
  const {chromium} = require('playwright');
  (async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 375, height: 667 } });
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.screenshot({ path: '/tmp/melo-mobile.png' });
    await browser.close();
    console.log('MELO mobile screenshot saved');
  })();"
  ```
- Expected Output: 375x667 screenshot with mobile layout
- Screenshot: Required ✅ (mobile viewport)

---

### AC-6: Tablet Viewport MELO Screenshot

**Given** viewport screenshots work  
**When** I capture MELO homepage with tablet viewport (768x1024)  
**Then** the screenshot shows tablet-responsive MELO UI

**Validation:**
- Method: Tablet viewport screenshot
- Test Command:
  ```bash
  node -e "
  const {chromium} = require('playwright');
  (async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 768, height: 1024 } });
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.screenshot({ path: '/tmp/melo-tablet.png' });
    await browser.close();
    console.log('MELO tablet screenshot saved');
  })();"
  ```
- Expected Output: 768x1024 screenshot with tablet layout
- Screenshot: Required ✅ (tablet viewport)

---

### AC-7: Clear Error When Server Not Running

**Given** MELO development server is NOT running  
**When** I attempt a Playwright screenshot of localhost:3000  
**Then** I get a clear error message about connection refused (not hang)

**Validation:**
- Method: Test with server stopped
- Test Command:
  ```bash
  # Ensure server is stopped first (or test on different port)
  timeout 15 node -e "
  const {chromium} = require('playwright');
  (async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    try {
      await page.goto('http://localhost:3001', { timeout: 5000 });  // Different port
      console.log('ERROR: Should have failed');
    } catch (e) {
      console.log('Expected error:', e.message);
    }
    await browser.close();
  })();"
  ```
- Expected Output: "net::ERR_CONNECTION_REFUSED" or similar
- Screenshot: Required ✅ (error message output)

---

### AC-8: MELO Dev Server Startup Documentation

**Given** MELO server needs to be running for tests  
**When** validation agents need to test MELO  
**Then** clear startup instructions are documented

**Validation:**
- Method: Document the startup commands
- Required Documentation:
  ```bash
  # MELO Dev Server Startup
  cd ~/repos/melo
  npm run dev
  # Server available at http://localhost:3000
  
  # Verify running
  curl -s http://localhost:3000 | head -20
  ```
- Evidence: Commands work and server starts
- Screenshot: Required ✅ (server startup output)

---

## Contingencies

### What Could Go Wrong

| Risk | Likelihood | Impact | Detection | Mitigation |
|------|------------|--------|-----------|------------|
| MELO server not running | H | H | Connection refused error | Document startup, check first |
| Server on different port | M | M | Wrong port error | Verify port, check pm2/package.json |
| Server slow to respond | M | M | Timeout errors | Increase timeout, use networkidle |
| Next.js hydration delay | M | L | Partial content in screenshot | Add explicit wait, use networkidle |
| Server crashes during test | L | M | Connection reset | Restart server, check logs |
| CORS or security issues | L | L | Console errors | Check Next.js config |
| Port already in use | M | M | EADDRINUSE on startup | Kill existing process, use different port |

### Fallback Options

- **If server won't start:** Check ~/repos/melo exists, run npm install
- **If port conflict:** Use `lsof -i :3000` to find conflicting process
- **If server crashes:** Check pm2 logs or npm run dev output
- **If routes don't exist:** Verify MELO project structure, check routing

### Blockers (Would Prevent Story Completion)

| Blocker | Likelihood | Mitigation |
|---------|------------|------------|
| US-BA-02 not complete | - | Wait for basic screenshot |
| MELO repo missing | L | Clone from GitHub |
| npm dependencies broken | M | npm install, check for errors |
| Node.js version mismatch | L | Use nvm, verify version |

### Early Warning Signs

- `npm run dev` takes >30 seconds to start
- Console shows compile errors
- Multiple "Error" messages in dev server output
- Port 3000 shows different application

---

## Dependencies

### Dependency Graph

```
[US-BA-02: Basic Screenshot] ────► [THIS STORY: US-BA-03] ────► [US-BA-04: Reliability]
                                           │
          [MELO Dev Server] ───────────────┘
```

### Upstream (Must Complete First)

| Dependency | Type | Status | Blocker? | Notes |
|------------|------|--------|----------|-------|
| US-BA-02 (Basic Screenshot) | story | pending | YES | Need screenshot capability first |
| MELO repo cloned | technical | ✅ done | no | ~/repos/melo exists |
| MELO npm dependencies | technical | unknown | yes | Need to verify npm install |

### Downstream (Waiting on This)

| Dependent | Type | Impact if Delayed |
|-----------|------|-------------------|
| US-BA-04 (Reliability) | story | Can test, but not MELO-specific |
| MELO Phase 2 Validation | feature | Primary use case blocked |
| All future MELO UI validation | feature | Can't verify UI changes |

### External Dependencies

| External | Description | Status | Fallback |
|----------|-------------|--------|----------|
| MELO repository | Source code | available at ~/repos/melo | Clone fresh |
| npm packages | MELO dependencies | need verify | npm install |
| localhost:3000 | Default Next.js port | may conflict | Use different port |

### Technical Prerequisites

- [x] US-BA-02 complete (screenshot works)
- [ ] MELO repo exists at ~/repos/melo
- [ ] npm dependencies installed
- [ ] Dev server can start
- [ ] Port 3000 available

---

## Out of Scope

Explicitly NOT included in this story (to prevent scope creep):

- Authenticated page screenshots (logged-in states)
- API endpoint testing
- Form submission testing
- E2E user flow testing
- Visual regression testing
- Performance testing
- Accessibility testing
- Multi-browser testing
- Screenshot comparison with baselines

---

## Technical Notes

### Suggested Approach

1. **Verify MELO setup:** Check repo exists, dependencies installed
2. **Start dev server:** `cd ~/repos/melo && npm run dev`
3. **Wait for server:** Verify http://localhost:3000 responds
4. **Test routes:** Homepage, sign-up, sign-in
5. **Test viewports:** Desktop, tablet, mobile
6. **Document patterns:** Note working commands

### MELO Project Structure (Expected)

```
~/repos/melo/
├── package.json       # npm scripts
├── app/               # Next.js app router
│   ├── page.tsx       # Homepage
│   ├── sign-up/       # Registration
│   └── sign-in/       # Login
├── public/            # Static assets
└── ...
```

### Common MELO Routes to Test

| Route | Description | Expected Content |
|-------|-------------|------------------|
| / | Homepage | Landing page, hero section |
| /sign-up | Registration | Form with email, password fields |
| /sign-in | Login | Form with credentials |
| /dashboard | Dashboard | Requires auth (out of scope) |

### Server Startup Commands

```bash
# Navigate to MELO
cd ~/repos/melo

# Install dependencies (if needed)
npm install

# Start development server
npm run dev

# Verify server is running
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
# Should return: 200
```

### Anti-Patterns to Avoid

- Don't assume server is running (check first)
- Don't skip networkidle wait (Next.js hydration)
- Don't test authenticated routes without auth (separate story)
- Don't hardcode paths that might change

---

## Test Credentials

**Location:** N/A (no authentication required for public pages)

---

## Sub-Tasks (Coordinator Fills This)

| Task ID | Description | Model | Status |
|---------|-------------|-------|--------|
| | | | |

---

## Definition of Done

- [ ] AC-1: Localhost connection succeeds
- [ ] AC-2: Homepage screenshot captured
- [ ] AC-3: Sign-up page screenshot captured
- [ ] AC-4: Sign-in page screenshot captured
- [ ] AC-5: Mobile viewport screenshot captured
- [ ] AC-6: Tablet viewport screenshot captured
- [ ] AC-7: Server-not-running error is clear
- [ ] AC-8: Startup documentation complete
- [ ] All MELO screenshots saved as evidence
- [ ] Screenshots show recognizable MELO UI
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
- [x] Happy path covered (localhost screenshots)
- [x] Alternate valid paths covered (multiple routes, viewports)
- [x] All error scenarios covered (server not running)
- [x] All edge cases covered (viewport sizes)
- [x] Empty states covered (N/A)
- [x] Boundary conditions covered (server startup)
- [x] Permission/auth cases covered (public pages only)

### Testability
- [x] Every AC has Given/When/Then
- [x] Every AC has validation method
- [x] ACs are specific and measurable
- [x] No ambiguous language

### Dependencies
- [x] Upstream dependencies identified
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
| v1 | story-architect | 2026-02-28 | approved | MELO-specific localhost testing |

---
*Story Architect: Opus | Created for EPIC-01 Playwright Setup*
