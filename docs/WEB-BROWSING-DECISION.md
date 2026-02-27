# Web Browsing Infrastructure Decision

**Date:** 2026-02-27  
**Decision Maker:** Sophie (with Opus Counsel)  
**Status:** APPROVED

---

## Executive Summary

After deliberation with multiple Opus counsel perspectives (Technical Architect, Cost/Business Analyst, plus internal Ops/Security analysis), the decision is:

**✅ APPROVED: rebrowser-playwright standalone**

---

## Decision Rationale

### Counsel Perspectives

| Perspective | Recommendation | Key Argument |
|-------------|----------------|--------------|
| **Technical Architect** | rebrowser-playwright + Browserless fallback | Same API both tiers, avoid Python |
| **Cost/Business** | rebrowser-playwright ALONE | YAGNI, 9-15 days is premature optimization |
| **Ops/Reliability** (self) | rebrowser-playwright + watchdog | Health monitoring solves 90% of ops issues |
| **Security/Anti-Detection** (self) | rebrowser-playwright sufficient | Handles 80%+ of real-world cases |

### Why rebrowser-playwright Standalone

1. **Time to value:** 2-3 days implementation vs 9-15 days for tiered
2. **Zero ongoing cost:** vs $1,680/year for Browserless.io
3. **Drop-in replacement:** Same Playwright API, existing code/skills transfer
4. **Language fit:** Native TypeScript/JavaScript, no Python bridge
5. **80/20 rule:** Defeats 80%+ of detection systems, which covers personal use
6. **Reversibility:** Can add Camoufox or Browserless later if needed

### What We're NOT Doing (Yet)

| Option | Why Deferred |
|--------|--------------|
| **Camoufox** | Python = language mismatch, adds complexity |
| **nodriver** | Python, single maintainer, different API |
| **Browserless.io** | $140/mo not justified for current scale |
| **Full tiered architecture** | Premature optimization |

---

## Implementation Plan

### Phase 1: Stabilize Current Setup (1-2 days)
**Goal:** Make current Chrome+Xvfb reliable while rebrowser work happens

- [ ] Add auto-recovery watchdog (detect crash, restart Chrome)
- [ ] Implement session state checkpointing (cookies, localStorage)
- [ ] Add health check cron job (every 60 seconds)
- [ ] Log all browser failures for analysis

### Phase 2: rebrowser-playwright Integration (2-3 days)
**Goal:** Replace current CDP-based automation with rebrowser-playwright

- [ ] Install `rebrowser-playwright` npm package
- [ ] Create browser abstraction layer in Clawdbot
- [ ] Add `profile=stealth` option to browser tool
- [ ] Migrate existing browser workflows to new backend
- [ ] Test against known detection sites (nowsecure.nl, browserleaks.com)

### Phase 3: Monitoring & Learning (ongoing)
**Goal:** Track what works and what doesn't

- [ ] Log all browser sessions with outcome (success/blocked/captcha)
- [ ] Build domain blocklist for sites that defeat rebrowser
- [ ] Document failure patterns
- [ ] Evaluate need for additional tiers quarterly

---

## Success Criteria

| Metric | Current | Target |
|--------|---------|--------|
| Chrome crashes/day | 2-3 | <1 |
| Manual intervention/week | 5+ | <2 |
| Detection rate (estimated) | 40%+ | <20% |
| Implementation time | - | <5 days |
| Monthly cost | $0 | $0 |

---

## Fallback Plan

If rebrowser-playwright proves insufficient after 30 days:

1. **Option A: Add Browserless.io** — $140/mo, trivial integration, same API
2. **Option B: Add Camoufox** — Free, but requires Python service wrapper
3. **Option C: Hybrid** — rebrowser for simple sites, Browserless for protected

The key insight: **We don't need to decide this upfront.** Start simple, measure, adapt.

---

## Technical Details

### rebrowser-playwright Installation

```bash
npm install rebrowser-playwright
```

### Usage

```typescript
import { chromium } from 'rebrowser-playwright';

const browser = await chromium.launch({
  headless: true,
  args: ['--disable-blink-features=AutomationControlled']
});

const context = await browser.newContext({
  userAgent: 'Mozilla/5.0 ...',
  viewport: { width: 1920, height: 1080 }
});

const page = await context.newPage();
await page.goto('https://example.com');
```

### What rebrowser Patches

- `navigator.webdriver` → undefined
- Chrome automation flags → removed
- CDP runtime detection → patched
- WebDriver flag in navigator → cleaned
- Permissions API quirks → normalized

### Integration with Clawdbot

Create new profile in browser tool:

```typescript
// browser-profiles.ts
export const profiles = {
  chrome: { /* current implementation */ },
  stealth: {
    launcher: 'rebrowser-playwright',
    options: {
      headless: true,
      args: ['--disable-blink-features=AutomationControlled']
    }
  }
};
```

---

## Decision Log

| Date | Event |
|------|-------|
| 2026-02-27 02:39 | Research completed (docs/WEB-BROWSING-RESEARCH.md) |
| 2026-02-27 02:42 | Aaron requests decision with counsel |
| 2026-02-27 02:50 | Counsel spawned (Technical, Cost/Business, Ops, Security) |
| 2026-02-27 03:00 | Decision synthesized: rebrowser-playwright standalone |

---

## Next Steps

1. **Create Epic & Stories** for implementation
2. **Phase 1 start:** Tomorrow (after Aaron confirms)
3. **Phase 2 start:** After Phase 1 validated
4. **30-day review:** Evaluate if additional tiers needed

---

*Decision document created by Sophie after deliberation with Opus counsel.*
