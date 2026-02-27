# Recommended Architecture: Robust Web Browsing

> **Date:** 2026-02-27
> **Author:** WEB-BROWSE-RESEARCH Sub-Agent
> **Recommendation:** Hybrid with Residential Proxy Priority

---

## Executive Summary

**Recommended Solution:** Hybrid architecture with residential proxy as primary enhancement, local stealth as backup, and cloud browser for extreme cases.

**Estimated Cost:** $25-40/month
**Expected Success Rate:** 95-99%
**Implementation Time:** 2-3 days (Phase 1)

---

## Recommended Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Enhanced Browser Stack                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────┐     ┌────────────────────────────────┐  │
│  │   Request Router   │────▶│  Site Classification Cache     │  │
│  └─────────┬──────────┘     │  - Easy: local direct          │  │
│            │                │  - Medium: proxy               │  │
│            ▼                │  - Hard: proxy + stealth       │  │
│  ┌─────────────────────┐    │  - Extreme: cloud fallback    │  │
│  │  Browser Factory    │    └────────────────────────────────┘  │
│  │  (Selects optimal   │                                        │
│  │   configuration)    │                                        │
│  └─────────┬──────────┘                                         │
│            │                                                     │
│   ┌────────┼────────┬───────────────────┐                       │
│   ▼        ▼        ▼                   ▼                       │
│ ┌──────┐ ┌──────┐ ┌──────────────┐ ┌────────────────┐          │
│ │Local │ │Local │ │Local Chrome  │ │Cloud Browser   │          │
│ │Direct│ │+Proxy│ │+Proxy+Stealth│ │(Browserless)   │          │
│ │ FREE │ │$2/GB │ │    $3/GB     │ │   $0.10/req    │          │
│ └──────┘ └──────┘ └──────────────┘ └────────────────┘          │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Unified Response Handler                                   │ │
│  │  - Screenshot capture                                       │ │
│  │  - DOM extraction                                           │ │
│  │  - Session management                                       │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Details

### 1. Request Router

```javascript
// Pseudocode for request routing
async function browseWithOptimalMethod(url) {
  const difficulty = await classifySite(url);
  
  switch (difficulty) {
    case 'easy':
      return await browseLocal(url);
    case 'medium':
      return await browseWithProxy(url);
    case 'hard':
      return await browseWithProxyAndStealth(url);
    case 'extreme':
      return await browseWithCloud(url);
    default:
      return await tryAllMethods(url);
  }
}
```

### 2. Site Classification

```markdown
## Easy Sites (Local Direct)
- Developer documentation (github.com, docs.*, *.dev)
- API endpoints
- Simple static sites
- No known anti-bot

## Medium Sites (Local + Proxy)
- YouTube (most pages)
- E-commerce with light protection
- Social media (read-only)
- News sites

## Hard Sites (Proxy + Stealth)
- YouTube (aggressive pages)
- Cloudflare "Under Attack" mode
- Sites with CAPTCHA
- Banking marketing pages

## Extreme Sites (Cloud Fallback)
- Banking transactions
- Government portals with CAPTCHA
- Sites that actively fight proxy networks
```

### 3. Residential Proxy Setup

**Recommended Provider:** Bright Data (best success rate) or Smartproxy (better value)

**Configuration:**
```bash
# Chrome with rotating residential proxy
google-chrome \
  --proxy-server="http://USERNAME:PASSWORD@brd.superproxy.io:22225" \
  --proxy-bypass-list="localhost,127.0.0.1" \
  --disable-blink-features=AutomationControlled \
  --disable-infobars \
  --no-sandbox \
  --window-size=1920,1080
```

**Proxy Configuration Options:**
| Feature | Config |
|---------|--------|
| Country targeting | `country-us` |
| Sticky sessions | `session-RANDOM` |
| Rotation | Per request (default) |
| Protocol | HTTPS (for SSL) |

### 4. Stealth Enhancements

**For Python (recommended for complex sites):**
```python
import undetected_chromedriver as uc

options = uc.ChromeOptions()
options.add_argument('--proxy-server=http://proxy:port')

driver = uc.Chrome(options=options, headless=True)
driver.get('https://youtube.com')
```

**For Node.js/Puppeteer:**
```javascript
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

const browser = await puppeteer.launch({
  args: ['--proxy-server=http://proxy:port']
});
```

### 5. Cloud Fallback (Browserless)

```javascript
// Only for extreme cases
const browser = await puppeteer.connect({
  browserWSEndpoint: `wss://chrome.browserless.io?token=${BROWSERLESS_TOKEN}&--proxy-server=residential`
});
```

---

## Integration with Clawdbot Browser Tool

### Minimal Change Approach

The current `browser` tool uses the Chrome DevTools Protocol. We can enhance it by:

1. **Add proxy support to Chrome launch:**
```bash
# In start-chrome-automation.sh
PROXY_URL="${RESIDENTIAL_PROXY:-}"
if [ -n "$PROXY_URL" ]; then
  PROXY_FLAG="--proxy-server=$PROXY_URL"
fi

google-chrome \
  $PROXY_FLAG \
  --remote-debugging-port=9222 \
  # ... other flags
```

2. **Environment-based proxy:**
```bash
# In ~/.bashrc or systemd service
export RESIDENTIAL_PROXY="http://user:pass@brd.superproxy.io:22225"
```

3. **No changes to browser tool itself** - proxy is transparent

### Full Enhancement Approach

Create a wrapper that selects optimal method:

```javascript
// browser-enhanced.js
async function enhancedBrowse(action, options) {
  const difficulty = classifySite(options.targetUrl);
  
  if (difficulty === 'extreme') {
    return await cloudBrowse(action, options);
  }
  
  // Use local with proxy for everything else
  return await localBrowse(action, options, { 
    proxy: difficulty !== 'easy' 
  });
}
```

---

## Cost Analysis

### Scenario: Typical AI Agent Usage

| Component | Usage | Monthly Cost |
|-----------|-------|--------------|
| Residential Proxy (Bright Data) | 5 GB/month | $12.50-25 |
| Cloud Browser (Browserless) | 100 requests | $10 |
| **Total** | | **$22.50-35** |

### Break-even Analysis

- Free tier limitations hit frequently
- Cost to unblock vs manual intervention
- Time saved: ~10+ hours/month
- **ROI:** Excellent

---

## Security Considerations

### Proxy Provider Selection

✅ **DO:**
- Use enterprise-grade providers (Bright Data, Oxylabs)
- Verify ethical sourcing policies
- Use HTTPS connection to proxy
- Rotate credentials periodically

❌ **DON'T:**
- Use free proxy lists
- Use providers without clear privacy policies
- Route sensitive data (banking) through proxies
- Store proxy credentials in public repos

### Data Exposure

| Data Type | Via Proxy | Via Cloud | Recommendation |
|-----------|-----------|-----------|----------------|
| Public web browsing | ✅ Safe | ✅ Safe | Use freely |
| Logged-in sessions | ⚠️ Caution | ⚠️ Caution | Use carefully |
| Banking/Financial | ❌ Avoid | ❌ Avoid | Manual only |
| Personal accounts | ⚠️ Caution | ⚠️ Caution | Consider risk |

---

## Implementation Priority

### Phase 1: Quick Win (Day 1)
1. Sign up for Bright Data or Smartproxy
2. Add proxy flag to Chrome startup script
3. Test against YouTube, Cloudflare sites
4. Verify improvement

### Phase 2: Stealth Enhancement (Day 2-3)
1. Install undetected-chromedriver or puppeteer-stealth
2. Create wrapper for difficult sites
3. Test against harder sites

### Phase 3: Full Hybrid (Week 2)
1. Set up Browserless account
2. Implement site classification
3. Create request router
4. Add fallback logic

### Phase 4: Optimization (Ongoing)
1. Track success/failure rates
2. Build classification database
3. Optimize cost (prefer cheaper methods)
4. Add alerting for failures

---

## Success Criteria

| Metric | Target | Measurement |
|--------|--------|-------------|
| YouTube success rate | >95% | Page loads, video playable |
| Cloudflare bypass | >90% | No 403 errors |
| General sites | >99% | Successful navigation |
| Average latency | <3s | Page load time |
| Monthly cost | <$50 | Actual billing |
| Integration stability | >99.9% | Uptime |

---

## Fallback Strategy

```
┌─────────────────┐
│ Request comes in│
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│ Try Local+Proxy │────▶│ Success?        │
└─────────────────┘     └────────┬────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼ YES                     ▼ NO (403/CAPTCHA)
           ┌───────────────┐         ┌───────────────┐
           │ Return Result │         │ Try Stealth   │
           └───────────────┘         └───────┬───────┘
                                             │
                                ┌────────────┴────────────┐
                                │                         │
                                ▼ YES                     ▼ NO
                       ┌───────────────┐         ┌───────────────┐
                       │ Return Result │         │ Try Cloud     │
                       └───────────────┘         └───────┬───────┘
                                                         │
                                            ┌────────────┴────────────┐
                                            │                         │
                                            ▼ YES                     ▼ NO
                                   ┌───────────────┐         ┌───────────────┐
                                   │ Return Result │         │ Return Error  │
                                   └───────────────┘         │ + Diagnostics │
                                                             └───────────────┘
```

---

## Recommended Next Steps

1. **Aaron's approval** on architecture and budget
2. **Provider signup** (Bright Data recommended)
3. **Quick implementation** (proxy flag only)
4. **Testing** against target sites
5. **Full hybrid** if needed

See: `implementation-roadmap.md` for detailed timeline
See: `validation-plan.md` for testing methodology
