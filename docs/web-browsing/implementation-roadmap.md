# Implementation Roadmap: Robust Web Browsing Infrastructure

> **Date:** 2026-02-27
> **Author:** WEB-BROWSE-RESEARCH Sub-Agent
> **Total Estimated Time:** 5-7 days

---

## Phase 1: Quick Win - Residential Proxy (Day 1)

### Objective
Add residential proxy to existing Chrome setup for immediate improvement.

### Tasks

#### 1.1 Provider Setup (30 min)
- [ ] Sign up for Bright Data or Smartproxy
  - Bright Data: https://brightdata.com (recommended)
  - Smartproxy: https://smartproxy.com (budget option)
- [ ] Create residential proxy zone/user
- [ ] Get credentials (username:password@host:port)
- [ ] Verify proxy works with curl test

#### 1.2 Chrome Configuration (30 min)
- [ ] Update `$HOME/start-chrome-automation.sh`:
```bash
# Add proxy configuration
PROXY_URL="${RESIDENTIAL_PROXY:-}"
if [ -n "$PROXY_URL" ]; then
  PROXY_FLAG="--proxy-server=$PROXY_URL"
else
  PROXY_FLAG=""
fi

# Add to Chrome launch
google-chrome \
  $PROXY_FLAG \
  --remote-debugging-port=9222 \
  # ... other existing flags
```

- [ ] Create environment file:
```bash
# ~/.chrome-automation-env
export RESIDENTIAL_PROXY="http://user:pass@brd.superproxy.io:22225"
```

- [ ] Source in startup script

#### 1.3 Initial Testing (30 min)
- [ ] Restart Chrome automation
- [ ] Test against YouTube
- [ ] Test against Cloudflare-protected site (zenrows.com)
- [ ] Verify browser tool still works
- [ ] Take screenshots as evidence

### Deliverables
- [ ] Working Chrome with residential proxy
- [ ] Test results documented
- [ ] Screenshots in `scheduler/validation/screenshots/web-browsing/`

### Success Criteria
- [ ] YouTube loads without blocking
- [ ] Cloudflare sites return 200 instead of 403
- [ ] Browser tool functions unchanged

---

## Phase 2: Stealth Enhancement (Days 2-3)

### Objective
Add browser fingerprint evasion for additional protection.

### Tasks

#### 2.1 Install undetected-chromedriver (1 hour)
```bash
# In Python environment
pip install undetected-chromedriver

# Test basic functionality
python3 -c "
import undetected_chromedriver as uc
driver = uc.Chrome(headless=True)
driver.get('https://nowsecure.nl')
print('SUCCESS' if 'detected' not in driver.page_source.lower() else 'DETECTED')
driver.quit()
"
```

#### 2.2 Create Stealth Browser Wrapper (2 hours)
```python
# ~/clawd/tools/stealth-browser/stealth_browse.py
import undetected_chromedriver as uc
import argparse
import json
import sys

def browse_with_stealth(url, proxy=None, screenshot=None):
    options = uc.ChromeOptions()
    if proxy:
        options.add_argument(f'--proxy-server={proxy}')
    
    driver = uc.Chrome(options=options, headless=True)
    try:
        driver.get(url)
        result = {
            'success': True,
            'title': driver.title,
            'url': driver.current_url,
            'status': 'loaded'
        }
        if screenshot:
            driver.save_screenshot(screenshot)
            result['screenshot'] = screenshot
        return result
    except Exception as e:
        return {'success': False, 'error': str(e)}
    finally:
        driver.quit()

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('url')
    parser.add_argument('--proxy')
    parser.add_argument('--screenshot')
    args = parser.parse_args()
    
    result = browse_with_stealth(args.url, args.proxy, args.screenshot)
    print(json.dumps(result, indent=2))
```

#### 2.3 Integration Points (2 hours)
- [ ] Document when to use stealth vs regular
- [ ] Add CLI entry point
- [ ] Test with various sites

### Deliverables
- [ ] `stealth_browse.py` tool
- [ ] Test results documented
- [ ] Usage documentation

---

## Phase 3: Hybrid Architecture (Days 4-5)

### Objective
Implement full hybrid system with site classification and fallbacks.

### Tasks

#### 3.1 Site Classification System (2 hours)
```python
# ~/clawd/tools/web-router/classifier.py
SITE_DIFFICULTY = {
    'easy': [
        'github.com', 'docs.*', '*.dev', 'wikipedia.org',
        'playwright.dev', 'browserstack.com'
    ],
    'medium': [
        'youtube.com', 'twitter.com', 'linkedin.com',
        'amazon.com', 'reddit.com'
    ],
    'hard': [
        'netflix.com', 'instagram.com', 'facebook.com',
        '*.cloudflare.*'  # Under attack mode
    ],
    'extreme': [
        '*.gov', 'banking.*', 'chase.com', 'bankofamerica.com'
    ]
}

def classify_site(url):
    # Pattern matching logic
    # Returns: 'easy', 'medium', 'hard', 'extreme'
    pass
```

#### 3.2 Request Router (3 hours)
```python
# ~/clawd/tools/web-router/router.py
class BrowseRouter:
    def __init__(self, config):
        self.config = config
        self.classifier = SiteClassifier()
        
    async def browse(self, url, options={}):
        difficulty = self.classifier.classify(url)
        
        methods = self.get_methods_for_difficulty(difficulty)
        
        for method in methods:
            try:
                result = await method.execute(url, options)
                if result.success:
                    self.cache_success(url, method)
                    return result
            except Exception as e:
                continue
        
        return BrowseResult(success=False, error='All methods failed')
```

#### 3.3 Cloud Browser Fallback (2 hours)
- [ ] Sign up for Browserless.io (free tier: 1000 requests)
- [ ] Implement connector:
```python
# ~/clawd/tools/web-router/cloud_browser.py
import websockets
import asyncio

async def browse_via_cloud(url, options={}):
    endpoint = f"wss://chrome.browserless.io?token={BROWSERLESS_TOKEN}"
    # Puppeteer connection logic
    pass
```

### Deliverables
- [ ] Site classification system
- [ ] Request router with fallbacks
- [ ] Cloud browser integration
- [ ] Full test suite

---

## Phase 4: Integration & Optimization (Days 6-7)

### Objective
Integrate with existing Clawdbot browser tool and optimize.

### Tasks

#### 4.1 Browser Tool Enhancement (3 hours)
- [ ] Add method selection logic to browser tool
- [ ] Support `--method` flag (auto/local/proxy/cloud)
- [ ] Add retry logic with escalation

#### 4.2 Monitoring & Alerting (2 hours)
```python
# Track success rates
class BrowseMetrics:
    def __init__(self):
        self.success_by_method = {}
        self.failure_reasons = {}
        
    def record(self, url, method, success, error=None):
        # Log to metrics file
        pass
```

#### 4.3 Cost Optimization (2 hours)
- [ ] Implement caching of successful methods per domain
- [ ] Add budget tracking
- [ ] Alert when approaching limits

#### 4.4 Documentation (2 hours)
- [ ] Update TOOLS.md with new capabilities
- [ ] Document configuration options
- [ ] Add troubleshooting guide

### Deliverables
- [ ] Enhanced browser tool
- [ ] Metrics dashboard/logs
- [ ] Complete documentation

---

## Timeline Summary

```
Day 1: ████████████████████ Phase 1 - Quick Win (Proxy)
Day 2: ████████████████████ Phase 2 - Stealth (Part 1)
Day 3: ████████████████████ Phase 2 - Stealth (Part 2)
Day 4: ████████████████████ Phase 3 - Hybrid (Part 1)
Day 5: ████████████████████ Phase 3 - Hybrid (Part 2)
Day 6: ████████████████████ Phase 4 - Integration
Day 7: ████████████████████ Phase 4 - Optimization
```

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Proxy provider blocks | Low | High | Have backup provider configured |
| Chrome update breaks stealth | Medium | Medium | Pin Chrome version, monitor releases |
| Cost overrun | Low | Medium | Set hard limits, monitor usage |
| Sites still block | Low | Medium | Cloud fallback, escalate to manual |

---

## Resource Requirements

### Personnel
- Developer time: ~20-30 hours total
- Can be parallelized across sub-agents

### Services
- Residential proxy: $15-30/month
- Cloud browser (optional): $0-30/month

### Infrastructure
- No additional servers needed
- Uses existing dev3 infrastructure

---

## Go/No-Go Criteria

### After Phase 1
- ✅ Go if: YouTube and Cloudflare sites work with proxy
- ❌ No-go if: Still blocked, investigate proxy quality

### After Phase 2
- ✅ Go if: Success rate >90% on test sites
- ❌ No-go if: Stealth patches don't help, skip to Phase 3

### After Phase 3
- ✅ Go if: Hybrid system working, <5% cloud fallback usage
- ❌ No-go if: Cloud dependency too high, review cost structure

---

## Definition of Done

- [ ] YouTube loads reliably (>95% success)
- [ ] Cloudflare-protected sites work (>90% success)
- [ ] Browser tool integration complete
- [ ] Documentation updated
- [ ] Monitoring in place
- [ ] Cost within budget (<$50/month)
