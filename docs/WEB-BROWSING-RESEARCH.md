# Web Browsing Infrastructure Research

**Date:** 2026-02-27  
**Researcher:** Sophie (Opus Research Agent)  
**Priority:** CRITICAL (per Aaron's directive)

## Executive Summary

The current Chrome on Xvfb with Clawdbot Browser Relay setup is unreliable for several reasons:
1. Chrome crashes frequently in headless/virtual display mode
2. Bot detection systems easily identify automation
3. The extension-click workflow is fragile
4. No auto-recovery from failures

This document evaluates alternatives and recommends a multi-layered architecture for robust, undetectable web browsing.

---

## Table of Contents

1. [Current State Analysis](#current-state-analysis)
2. [Browser Automation Options](#browser-automation-options)
3. [Anti-Detection Techniques](#anti-detection-techniques)
4. [Reliability Patterns](#reliability-patterns)
5. [Integration Considerations](#integration-considerations)
6. [Recommended Architecture](#recommended-architecture)
7. [Implementation Complexity](#implementation-complexity)
8. [User Stories](#user-stories)

---

## Current State Analysis

### Current Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Xvfb :99 (Virtual Display 1920x1080)                   │
│  ├── Fluxbox (Window Manager)                           │
│  │   └── Chrome (--remote-debugging-port=9222)          │
│  │       └── Clawdbot Browser Relay Extension           │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
          browser action=* profile=chrome
```

### Pain Points

| Issue | Impact | Frequency |
|-------|--------|-----------|
| Chrome crashes | Complete automation failure | High |
| Sites detect automation | Blocked/CAPTCHA | Very High |
| Extension needs manual click | Workflow disruption | Every restart |
| No crash recovery | Manual intervention needed | High |
| Session state lost | Re-login required | Every crash |

### Why Sites Block Us

1. **navigator.webdriver = true** — Standard automation flag
2. **CDP detection** — Chrome DevTools Protocol leaves traces
3. **Headless markers** — Missing fonts, WebGL quirks
4. **Behavioral analysis** — Inhuman click patterns, timing
5. **IP reputation** — Datacenter IPs are flagged
6. **TLS/JA3 fingerprinting** — Automation tools have distinct signatures

---

## Browser Automation Options

### 1. Playwright with Stealth

**Overview:** Microsoft's Playwright + community stealth plugins

**Pros:**
- Multi-browser support (Chromium, Firefox, WebKit)
- Active development by Microsoft
- `playwright-stealth` package available (v2.0.2 as of Feb 2026)
- Better API than Puppeteer
- Built-in auto-wait, better stability

**Cons:**
- Still detectable by sophisticated systems (Cloudflare, etc.)
- CDP-based = inherent detection vectors
- Stealth plugins are "proof-of-concept" level (per maintainer)
- Requires additional patches for robust evasion

**Detection Status:** Fails Pixelscan, Browserscan, Cloudflare WAF

**Code Example:**
```python
from playwright.async_api import async_playwright
from playwright_stealth import Stealth

async with Stealth().use_async(async_playwright()) as p:
    browser = await p.chromium.launch()
    page = await browser.new_page()
    await page.goto("https://example.com")
```

**Verdict:** ⭐⭐⭐ Good starting point, but needs enhancement

---

### 2. Puppeteer + puppeteer-extra-plugin-stealth

**Overview:** Original stealth solution, JavaScript-based

**Pros:**
- Mature ecosystem (3+ years)
- 794+ dependent packages on npm
- CAPTCHA solver integrations
- Well-documented evasion techniques

**Cons:**
- Last major update 3 years ago
- JavaScript-level patching is fundamentally detectable
- CDP serialization detection bypasses it
- Chrome/Chromium only

**Detection Status:** Passes basic checks (Sannysoft), fails advanced (Pixelscan, Cloudflare)

**Verdict:** ⭐⭐ Dated, but foundation for understanding evasions

---

### 3. Nodriver (Successor to undetected-chromedriver)

**Overview:** Python async framework with NO webdriver/selenium dependency

**Pros:**
- Eliminates CDP usage entirely
- Direct browser communication
- Async-first design
- Fresh profile per run (auto-cleanup)
- Built-in Cloudflare checkbox solver (cf_verify)
- Human-like cursor movement
- Active development

**Cons:**
- Python-only (our stack is Node.js/TypeScript)
- Requires Xvfb for headless operation
- Newer = less community support
- Not a drop-in replacement

**Key Feature:** `tab.cf_verify()` — Automatically solves Cloudflare checkbox challenges!

**Detection Status:** Significantly better than CDP-based tools

**Code Example:**
```python
import nodriver as uc

async def main():
    browser = await uc.start()
    page = await browser.get('https://nowsecure.nl')
    await page.cf_verify()  # Solve Cloudflare!
```

**Verdict:** ⭐⭐⭐⭐ Excellent for Python projects

---

### 4. Rebrowser-Playwright / Rebrowser-Puppeteer

**Overview:** Drop-in replacements with rebrowser-patches applied

**Pros:**
- Same API as original Playwright/Puppeteer
- No code changes required
- Passes rebrowser-bot-detector tests
- Active development

**Cons:**
- Still CDP-based (inherent limits)
- Patch version may lag behind official releases
- Less documented than originals

**Verdict:** ⭐⭐⭐⭐ Best choice for existing Playwright/Puppeteer code

---

### 5. Camoufox (Firefox-based Anti-Detect)

**Overview:** Custom Firefox build for fingerprint injection at C++ level

**Pros:**
- **C++ level patching** — Undetectable via JavaScript inspection
- Firefox-based (different fingerprint pool than Chrome)
- BrowserForge integration for realistic fingerprints
- Human-like cursor movement built-in
- WebRTC IP spoofing at protocol level
- Built-in uBlock Origin
- PyPi package with auto-fingerprint injection
- Playwright-compatible API

**Cons:**
- Firefox only (some sites Chrome-preferred)
- Cannot spoof Chromium fingerprints
- Python-only officially
- Under active development (maintenance gap recently)
- Some WAFs test for Spidermonkey engine specifically

**Detection Status:** Passes most tests, struggles with some Cloudflare scenarios

**Key Innovation:** All fingerprint data intercepted at C++ level, not JavaScript

**Code Example:**
```python
from camoufox.async_api import AsyncCamoufox

async with AsyncCamoufox() as browser:
    page = await browser.new_page()
    await page.goto("https://example.com")
```

**Verdict:** ⭐⭐⭐⭐⭐ Best open-source anti-detect solution

---

### 6. Browserless.io (Managed Service)

**Overview:** Browser-as-a-Service with built-in stealth

**Pricing (2026):**
| Plan | Price | Units/Month | Concurrent | Max Session |
|------|-------|-------------|------------|-------------|
| Free | $0 | 1k | 2 | 1 min |
| Prototyping | $25/mo | 20k | 10 | 15 min |
| Starter | $140/mo | 180k | 40 | 30 min |
| Scale | $350/mo | 500k | 100 | 60 min |

**Pros:**
- No infrastructure management
- Built-in CAPTCHA solving
- BQL (Browserless Query Language) for complex workflows
- Cloudflare bypass built-in (`verify(type: cloudflare)`)
- Residential proxies included
- Supports Playwright and Puppeteer
- Session reconnects

**Cons:**
- Monthly cost
- External dependency
- Usage limits
- 30-second unit granularity

**BQL Example:**
```graphql
mutation VerifyChallenge {
  goto(url: "https://protected.domain") {
    status
  }
  verify(type: cloudflare) {
    found
    solved
    time
  }
}
```

**Verdict:** ⭐⭐⭐⭐ Best for reliability without maintenance burden

---

### 7. Commercial Anti-Detect Browsers

**Options:** Multilogin, GoLogin, AdsPower, Kameleo, Dolphin Anty

**Kameleo Test Results (2026):**
| Test | Playwright | Puppeteer Stealth | Undetected CD | Kameleo |
|------|------------|-------------------|---------------|---------|
| Sannysoft | ❌ | ✅ | 🟡 | ✅ |
| Pixelscan | ❌ | ❌ | ❌ | ✅ |
| Browserscan | ❌ | ❌ | ❌ | ✅ |
| Cloudflare | ❌ | ❌ | ❌ | 🟡 |

**Pros:**
- Highest success rate against detection
- Fingerprint management UI
- Profile persistence
- API for automation

**Cons:**
- Expensive (subscription-based)
- External dependency
- Complex integration
- Designed for multi-account management, not general automation

**Verdict:** ⭐⭐⭐ Overkill for our needs, but worth knowing

---

## Anti-Detection Techniques

### What Actually Works in 2026

The anti-detect landscape has evolved significantly. Key insights from research:

#### 1. CDP is the Main Detection Vector

Modern detection focuses on Chrome DevTools Protocol artifacts:
- `Runtime.consoleAPICalled` serialization detection
- WebSocket communication patterns
- Error stack trace analysis

**Solution:** Use CDP-minimal frameworks (nodriver, Camoufox) or patched versions (rebrowser)

#### 2. JavaScript Patching is Detectable

```javascript
// Detection example:
Object.getOwnPropertyDescriptor(navigator, 'webdriver')
// If descriptor reveals override, detected
```

**Solution:** C++ level patching (Camoufox) or avoid triggering checks

#### 3. Fingerprint Consistency is Critical

Detection systems look for inconsistencies:
- User-Agent says Windows, but fonts are macOS
- Timezone says EST, but IP is in Germany
- WebGL vendor doesn't match GPU claims

**Solution:** Use BrowserForge-style fingerprint generation with market share distribution

#### 4. Behavioral Analysis is Growing

Sites analyze:
- Mouse movement patterns
- Click timing distribution
- Scroll behavior
- Typing cadence

**Solution:** Human-like input simulation (Camoufox, nodriver have this built-in)

### Proxy Considerations

| Type | Detection Risk | Cost | Use Case |
|------|---------------|------|----------|
| Datacenter | HIGH | Low | Testing only |
| Residential | LOW | High | Production scraping |
| Mobile/5G | LOWEST | Highest | Hardened targets |
| ISP | LOW | Medium | Good balance |

**Recommendation:** Residential or ISP proxies for production use

---

## Reliability Patterns

### 1. Auto-Recovery from Crashes

```javascript
class BrowserManager {
  async ensureBrowser() {
    if (!this.browser || !this.browser.isConnected()) {
      this.browser = await this.launchBrowser();
    }
    return this.browser;
  }
  
  async withRetry(fn, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn(await this.ensureBrowser());
      } catch (e) {
        if (e.message.includes('Target closed') || 
            e.message.includes('Protocol error')) {
          this.browser = null; // Force relaunch
          continue;
        }
        throw e;
      }
    }
  }
}
```

### 2. Browser Pool Pattern

For high-volume needs:

```javascript
class BrowserPool {
  constructor(size = 5) {
    this.pool = [];
    this.maxSize = size;
  }
  
  async acquire() {
    // Return existing idle browser or create new
    const idle = this.pool.find(b => !b.inUse && b.isConnected());
    if (idle) {
      idle.inUse = true;
      return idle;
    }
    if (this.pool.length < this.maxSize) {
      const browser = await this.createBrowser();
      this.pool.push(browser);
      return browser;
    }
    // Wait for one to become available
    return this.waitForAvailable();
  }
  
  release(browser) {
    browser.inUse = false;
  }
}
```

### 3. Session Persistence

```javascript
// Save session state
const cookies = await context.cookies();
const storage = await page.evaluate(() => ({
  localStorage: {...localStorage},
  sessionStorage: {...sessionStorage}
}));
await fs.writeFile('session.json', JSON.stringify({cookies, storage}));

// Restore session
const session = JSON.parse(await fs.readFile('session.json'));
await context.addCookies(session.cookies);
await page.evaluate(({localStorage, sessionStorage}) => {
  Object.entries(localStorage).forEach(([k,v]) => window.localStorage[k] = v);
  Object.entries(sessionStorage).forEach(([k,v]) => window.sessionStorage[k] = v);
}, session.storage);
```

### 4. Health Checks

```javascript
async function healthCheck() {
  try {
    const page = await browser.newPage();
    await page.goto('about:blank', {timeout: 5000});
    await page.close();
    return true;
  } catch {
    return false;
  }
}

// Run periodically
setInterval(async () => {
  if (!await healthCheck()) {
    await restartBrowser();
  }
}, 60000);
```

---

## Integration Considerations

### Current Clawdbot Browser Tool Interface

The existing `browser` tool supports:
- `action=tabs` — List tabs
- `action=navigate` — Go to URL
- `action=screenshot` — Capture image
- `action=snapshot` — Get DOM/accessibility tree
- `action=act` — Perform actions (click, type, etc.)

### Integration Options

#### Option A: Replace Backend, Keep Interface

Replace Chrome/Relay with Playwright-based backend while keeping the same `browser` tool interface.

**Pros:** No changes to agent prompts or workflows
**Cons:** Significant backend rewrite

#### Option B: Add Alternative Browser Profile

Add new profile (e.g., `profile=stealth`) that uses Camoufox/rebrowser:

```bash
browser action=navigate profile=stealth targetUrl="https://example.com"
```

**Pros:** Can A/B test, gradual migration
**Cons:** Two systems to maintain

#### Option C: Hybrid with Browserless.io

Use local browser for simple tasks, fall back to Browserless for protected sites:

```bash
# Local first
browser action=navigate profile=chrome targetUrl="https://simple-site.com"

# Fallback to Browserless for Cloudflare sites
browser action=navigate profile=browserless targetUrl="https://protected-site.com"
```

**Pros:** Cost-effective, best of both worlds
**Cons:** Two integrations

### Screenshot/Snapshot Capabilities

All evaluated tools support:
- Full page screenshots
- Element screenshots
- DOM snapshots
- PDF generation

Camoufox and rebrowser-playwright are Playwright-compatible, so existing snapshot code works.

---

## Recommended Architecture

### Tiered Approach

```
┌─────────────────────────────────────────────────────────────┐
│                    Clawdbot Browser Tool                     │
├─────────────────────────────────────────────────────────────┤
│                    Browser Abstraction Layer                 │
├──────────────┬──────────────┬──────────────┬────────────────┤
│   Tier 1     │    Tier 2    │    Tier 3    │    Tier 4      │
│  rebrowser-  │   Camoufox   │ Browserless  │  Manual/VNC    │
│  playwright  │  (Firefox)   │    (API)     │   (Fallback)   │
├──────────────┼──────────────┼──────────────┼────────────────┤
│  Fast/Local  │ Stealth/Local│ Stealth/Cloud│  Last Resort   │
│  Low evasion │ High evasion │ Highest      │  Human assist  │
│  Free        │ Free         │ $$$          │  Free          │
└──────────────┴──────────────┴──────────────┴────────────────┘
```

### Selection Logic

```javascript
async function browse(url, options = {}) {
  const domain = new URL(url).hostname;
  
  // Tier 1: Simple sites, no protection
  if (isSimpleSite(domain)) {
    return await rebrowserPlaywright.browse(url);
  }
  
  // Tier 2: Known protected but solvable
  if (needsStealth(domain)) {
    return await camoufox.browse(url);
  }
  
  // Tier 3: Heavily protected (Cloudflare, etc.)
  if (isHeavilyProtected(domain) || options.forceCloud) {
    return await browserless.browse(url);
  }
  
  // Default to Tier 1
  return await rebrowserPlaywright.browse(url);
}
```

### Recommended Stack

1. **Primary (Tier 1):** rebrowser-playwright
   - Drop-in replacement for current Playwright code
   - Good baseline stealth
   - Fast, local

2. **Stealth (Tier 2):** Camoufox
   - Firefox-based (different fingerprint pool)
   - C++ level patching (undetectable)
   - Python wrapper, but can run as service

3. **Cloud (Tier 3):** Browserless.io Starter Plan
   - $140/mo for 180k units
   - Built-in Cloudflare bypass
   - CAPTCHA solving included

4. **Fallback (Tier 4):** VNC/Manual
   - Real browser on remote desktop
   - Human intervention for edge cases

---

## Implementation Complexity

### Phase 1: Stabilize Current Setup (1-2 days)
- Add auto-recovery watchdog
- Session persistence
- Health check cron
- **Complexity:** Low

### Phase 2: Add rebrowser-playwright (2-3 days)
- Install rebrowser-playwright
- Create abstraction layer
- Integrate with browser tool
- **Complexity:** Medium

### Phase 3: Add Camoufox Backend (3-5 days)
- Set up Camoufox Python service
- WebSocket bridge to Clawdbot
- Profile for `profile=stealth`
- **Complexity:** Medium-High

### Phase 4: Browserless.io Integration (1-2 days)
- Sign up, get API key
- Implement BQL queries
- Add as fallback profile
- **Complexity:** Low

### Phase 5: Tiered Selection Logic (2-3 days)
- Domain classification
- Auto-escalation on failure
- Monitoring/metrics
- **Complexity:** Medium

**Total Estimate:** 9-15 days of focused work

---

## User Stories

### Epic: Robust Web Browsing Infrastructure

---

#### Story 1: Browser Auto-Recovery

**As a** Sophie agent  
**I want** the browser to automatically recover from crashes  
**So that** I don't need human intervention when Chrome dies

**Acceptance Criteria:**

**AC-1: Crash Detection**
- **Given** Chrome has crashed or closed unexpectedly
- **When** I attempt a browser action
- **Then** the system detects the failure within 5 seconds
- **Test Method:** Kill Chrome process, verify detection

**AC-2: Auto-Restart**
- **Given** a browser crash is detected
- **When** recovery is triggered
- **Then** Chrome restarts and becomes operational within 30 seconds
- **Test Method:** Automated restart test, measure time

**AC-3: Session Restoration**
- **Given** I had cookies/session state before crash
- **When** the browser recovers
- **Then** my session is restored from last checkpoint
- **Test Method:** Login to site, crash, verify still logged in after recovery

---

#### Story 2: Stealth Browser Integration

**As a** Sophie agent  
**I want** a stealth browser option  
**So that** I can access sites that block automation

**Acceptance Criteria:**

**AC-1: Stealth Profile Available**
- **Given** I need to access a bot-protected site
- **When** I use `browser profile=stealth`
- **Then** the request uses rebrowser-playwright with stealth patches
- **Test Method:** Access nowsecure.nl, verify pass

**AC-2: Fingerprint Randomization**
- **Given** I launch multiple stealth sessions
- **When** sites fingerprint the browser
- **Then** each session has a unique, consistent fingerprint
- **Test Method:** Check fingerprint on browserleaks.com across sessions

**AC-3: Human-like Behavior**
- **Given** I perform click/type actions
- **When** the action executes
- **Then** timing and movement patterns appear human-like
- **Test Method:** Behavioral analysis comparison

---

#### Story 3: Cloudflare Bypass

**As a** Sophie agent  
**I want** automatic Cloudflare challenge solving  
**So that** I can access Cloudflare-protected sites without manual help

**Acceptance Criteria:**

**AC-1: Challenge Detection**
- **Given** I navigate to a Cloudflare-protected page
- **When** a challenge is presented
- **Then** the system detects it within 2 seconds
- **Test Method:** Navigate to known Cloudflare site

**AC-2: Automatic Solve**
- **Given** a Cloudflare checkbox challenge appears
- **When** automatic solving is attempted
- **Then** the challenge is solved >80% of the time
- **Test Method:** 10 attempts, measure success rate

**AC-3: Fallback to Cloud Service**
- **Given** local solving fails
- **When** retry threshold is exceeded
- **Then** request escalates to Browserless.io
- **Test Method:** Mock local failure, verify escalation

---

#### Story 4: Tiered Browser Selection

**As a** Sophie agent  
**I want** automatic selection of the right browser tier  
**So that** I get the best balance of speed and success

**Acceptance Criteria:**

**AC-1: Simple Site Detection**
- **Given** I navigate to an unprotected site
- **When** the browser tier is selected
- **Then** Tier 1 (rebrowser-playwright) is used
- **Test Method:** Navigate to httpbin.org

**AC-2: Protected Site Detection**
- **Given** I navigate to a known Cloudflare site
- **When** the browser tier is selected
- **Then** higher tier is automatically selected
- **Test Method:** Navigate to g2.com

**AC-3: Escalation on Failure**
- **Given** Tier 1 fails with detection error
- **When** retry is attempted
- **Then** system escalates to Tier 2/3 automatically
- **Test Method:** Mock Tier 1 failure, verify escalation

---

#### Story 5: Browser Pool Management

**As a** Sophie agent  
**I want** a pool of browser instances  
**So that** I can handle concurrent requests efficiently

**Acceptance Criteria:**

**AC-1: Pool Initialization**
- **Given** the system starts
- **When** browser pool is initialized
- **Then** 2-5 browser instances are pre-warmed
- **Test Method:** Check process count on startup

**AC-2: Instance Reuse**
- **Given** I make sequential requests
- **When** browser instances are available
- **Then** existing instances are reused (not launched new)
- **Test Method:** Track instance IDs across requests

**AC-3: Concurrent Requests**
- **Given** multiple parallel requests
- **When** pool capacity is exceeded
- **Then** requests queue until instance available
- **Test Method:** 10 parallel requests with pool size 3

---

## Appendix: Tool Comparison Matrix

| Feature | Current | rebrowser | Camoufox | nodriver | Browserless |
|---------|---------|-----------|----------|----------|-------------|
| Language | JS | JS | Python | Python | API |
| Browser | Chrome | Chromium | Firefox | Chrome | Multi |
| Stealth Level | Low | Medium | High | High | Highest |
| Cloudflare | ❌ | 🟡 | 🟡 | ✅ | ✅ |
| Crash Recovery | ❌ | ⚙️ | ⚙️ | ⚙️ | ✅ |
| Cost | Free | Free | Free | Free | $$$  |
| Maintenance | High | Low | Medium | Medium | None |
| Integration | Native | Drop-in | Bridge | Bridge | API |

**Legend:** ❌ = No, 🟡 = Partial, ✅ = Yes, ⚙️ = Needs implementation

---

## References

1. [Castle.io - From Puppeteer Stealth to Nodriver](https://blog.castle.io/from-puppeteer-stealth-to-nodriver-how-anti-detect-frameworks-evolved-to-evade-bot-detection/)
2. [Kameleo - Best Headless Chrome for Anti-Bot](https://kameleo.io/blog/the-best-headless-chrome-browser-for-bypassing-anti-bot-systems)
3. [Browserless - Bypass Cloudflare Guide](https://www.browserless.io/blog/bypass-cloudflare-with-playwright)
4. [Camoufox GitHub](https://github.com/daijro/camoufox)
5. [Nodriver GitHub](https://github.com/ultrafunkamsterdam/nodriver)
6. [rebrowser-playwright GitHub](https://github.com/rebrowser/rebrowser-playwright)
7. [playwright-stealth PyPI](https://pypi.org/project/playwright-stealth/)

---

*Research completed 2026-02-27 by Sophie Research Agent*
