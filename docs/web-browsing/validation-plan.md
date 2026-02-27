# Validation Plan: Robust Web Browsing Infrastructure

> **Date:** 2026-02-27
> **Author:** WEB-BROWSE-RESEARCH Sub-Agent
> **Purpose:** Define testing methodology for anti-detection validation

---

## Overview

This document outlines how to validate that the implemented web browsing infrastructure successfully bypasses anti-bot detection systems.

---

## Test Categories

### Category 1: Anti-Bot Detection Sites (Primary)

These sites are specifically designed to test bot detection:

| Site | Tests | Expected Result |
|------|-------|-----------------|
| `https://nowsecure.nl` | Cloudflare challenge | Pass without blocking |
| `https://bot.sannysoft.com` | Fingerprint detection | All checks pass |
| `https://intoli.com/blog/not-possible-to-block-chrome-headless/chrome-headless-test.html` | Headless detection | All checks pass |
| `https://arh.antoinevastel.com/bots/areyouheadless` | Advanced headless tests | "You are not Chrome headless" |
| `https://pixelscan.net` | Browser fingerprint analysis | Low bot score |

### Category 2: Real-World Protected Sites

| Site | Protection | Expected Result |
|------|------------|-----------------|
| `https://www.youtube.com` | YouTube's custom | Page loads, video playable |
| `https://www.amazon.com` | Aggressive anti-bot | Product pages accessible |
| `https://www.linkedin.com` | Rate limiting + detection | Page loads (logged out) |
| `https://www.instagram.com` | Facebook protection | Page loads |
| `https://www.cloudflare.com/under-attack` | Cloudflare demo | Challenge passes |

### Category 3: Cloudflare-Protected Sites

| Site | Cloudflare Mode | Expected Result |
|------|-----------------|-----------------|
| `https://zenrows.com` | Standard | No 403 error |
| `https://npmjs.com` | Standard | Package pages load |
| Any site with "Under Attack" mode | Maximum | Challenge passes |

---

## Test Protocol

### Pre-Test Setup

```bash
# 1. Ensure clean state
$HOME/start-chrome-automation.sh

# 2. Verify proxy is configured
echo $RESIDENTIAL_PROXY

# 3. Confirm browser is responsive
curl -s http://localhost:9222/json/version
```

### Test Execution Script

```bash
#!/bin/bash
# ~/clawd/tools/web-browsing-test/run_tests.sh

RESULTS_DIR="$HOME/clawd/scheduler/validation/web-browsing-tests"
mkdir -p "$RESULTS_DIR/$(date +%Y-%m-%d)"

test_site() {
    local url="$1"
    local name="$2"
    local timestamp=$(date +%H%M%S)
    local screenshot="$RESULTS_DIR/$(date +%Y-%m-%d)/${name}_${timestamp}.png"
    
    echo "Testing: $url"
    
    # Navigate and screenshot
    result=$(browser action=navigate profile=chrome targetUrl="$url" 2>&1)
    sleep 3
    browser action=screenshot profile=chrome > "$screenshot" 2>&1
    
    # Check for blocking indicators
    snapshot=$(browser action=snapshot profile=chrome 2>&1)
    
    if echo "$snapshot" | grep -qi "access denied\|blocked\|captcha\|verify you are human"; then
        echo "FAIL: $name - Blocked"
        return 1
    else
        echo "PASS: $name"
        return 0
    fi
}

# Run tests
echo "=== Web Browsing Validation Tests ==="
echo "Date: $(date)"
echo ""

test_site "https://nowsecure.nl" "nowsecure"
test_site "https://bot.sannysoft.com" "sannysoft"
test_site "https://www.youtube.com" "youtube"
test_site "https://zenrows.com" "zenrows"
test_site "https://www.amazon.com" "amazon"

echo ""
echo "=== Tests Complete ==="
```

### Python Stealth Tests

```python
#!/usr/bin/env python3
# ~/clawd/tools/web-browsing-test/stealth_tests.py

import undetected_chromedriver as uc
import json
import os
from datetime import datetime

TEST_SITES = [
    ("https://nowsecure.nl", "nowsecure"),
    ("https://bot.sannysoft.com", "sannysoft"),
    ("https://www.youtube.com", "youtube"),
    ("https://www.amazon.com", "amazon"),
]

def run_tests(proxy=None):
    results = []
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    options = uc.ChromeOptions()
    if proxy:
        options.add_argument(f'--proxy-server={proxy}')
    
    driver = uc.Chrome(options=options, headless=True)
    
    for url, name in TEST_SITES:
        try:
            driver.get(url)
            
            # Check for blocking
            blocked_indicators = [
                "access denied", "blocked", "captcha",
                "verify you are human", "checking your browser"
            ]
            
            page_source = driver.page_source.lower()
            blocked = any(ind in page_source for ind in blocked_indicators)
            
            # Save screenshot
            screenshot_path = f"/tmp/test_{name}_{timestamp}.png"
            driver.save_screenshot(screenshot_path)
            
            results.append({
                "site": name,
                "url": url,
                "success": not blocked,
                "title": driver.title,
                "screenshot": screenshot_path
            })
            
            print(f"{'PASS' if not blocked else 'FAIL'}: {name}")
            
        except Exception as e:
            results.append({
                "site": name,
                "url": url,
                "success": False,
                "error": str(e)
            })
            print(f"ERROR: {name} - {e}")
    
    driver.quit()
    
    # Save results
    with open(f"/tmp/test_results_{timestamp}.json", 'w') as f:
        json.dump(results, f, indent=2)
    
    return results

if __name__ == '__main__':
    import sys
    proxy = os.environ.get('RESIDENTIAL_PROXY')
    run_tests(proxy)
```

---

## Success Metrics

### Quantitative Metrics

| Metric | Minimum | Target | Measurement |
|--------|---------|--------|-------------|
| Anti-bot site pass rate | 80% | 95% | nowsecure.nl, bot.sannysoft.com |
| YouTube success rate | 90% | 99% | Page loads, no blocking |
| Cloudflare bypass rate | 85% | 95% | No 403/503 errors |
| Amazon access rate | 80% | 90% | Product pages load |
| Average page load time | <10s | <5s | Time to complete |
| Browser crashes | <5/day | 0 | Stability monitoring |

### Qualitative Metrics

- [ ] Screenshots show actual page content, not blocking pages
- [ ] Page titles match expected (not "Access Denied" etc.)
- [ ] Interactive elements work (can click, scroll)
- [ ] Session persistence works (cookies maintained)

---

## Test Schedule

### Initial Validation (Phase 1 Complete)

Run full test suite:
1. Before proxy implementation (baseline)
2. After proxy implementation (comparison)
3. Document improvement

### Ongoing Validation

| Frequency | Tests | Purpose |
|-----------|-------|---------|
| Daily | YouTube, Amazon | Catch regressions |
| Weekly | Full suite | Comprehensive check |
| On change | Affected sites | Validate changes |

### Automated Monitoring

```bash
# Add to crontab
# Run daily validation
0 8 * * * /home/ubuntu/clawd/tools/web-browsing-test/run_tests.sh >> /var/log/web-browsing-tests.log 2>&1
```

---

## Failure Analysis

### Common Failure Modes

| Failure | Indicator | Resolution |
|---------|-----------|------------|
| IP blocked | 403 Forbidden | Rotate proxy, check IP reputation |
| CAPTCHA | "Verify you are human" | Escalate to cloud, manual solve |
| JavaScript challenge | Cloudflare interstitial | Wait longer, use stealth |
| Rate limited | 429 Too Many Requests | Slow down, rotate IP |
| Session expired | Redirect to login | Refresh session |

### Escalation Matrix

```
Level 1: Retry with same method (3 attempts)
    ↓ Still failing
Level 2: Switch to stealth browser
    ↓ Still failing
Level 3: Use cloud browser
    ↓ Still failing
Level 4: Manual intervention required
```

---

## Evidence Collection

### Required Evidence Per Test

1. **Screenshot** - Visual proof of page state
2. **Page title** - Quick indicator of success
3. **DOM snapshot** - For debugging
4. **Network log** - Response codes
5. **Timing** - Load performance

### Storage Structure

```
scheduler/validation/screenshots/web-browsing/
├── 2026-02-27/
│   ├── baseline/
│   │   ├── youtube_blocked.png
│   │   └── amazon_blocked.png
│   ├── with-proxy/
│   │   ├── youtube_success.png
│   │   └── amazon_success.png
│   └── test_results.json
├── 2026-02-28/
│   └── ...
```

---

## Validation Checklist

### Phase 1 Validation

- [ ] Proxy connection working (IP check shows residential)
- [ ] YouTube homepage loads
- [ ] YouTube video page loads
- [ ] Cloudflare challenge passes (zenrows.com)
- [ ] npm.com loads without 403
- [ ] nowsecure.nl shows "not detected"
- [ ] bot.sannysoft.com shows all green
- [ ] Screenshots captured
- [ ] Results documented

### Phase 2 Validation (Stealth)

- [ ] undetected-chromedriver installed
- [ ] Stealth tests pass (nowsecure.nl)
- [ ] Fingerprint tests pass (pixelscan.net)
- [ ] Combined proxy+stealth works
- [ ] Performance acceptable (<5s load)

### Phase 3 Validation (Hybrid)

- [ ] Site classification accurate
- [ ] Auto-escalation works
- [ ] Cloud fallback functional
- [ ] Cost tracking accurate
- [ ] 95%+ overall success rate

---

## Reporting

### Daily Report Format

```markdown
# Web Browsing Validation Report - 2026-02-27

## Summary
- Total tests: 10
- Passed: 9
- Failed: 1
- Success rate: 90%

## Results by Site
| Site | Method Used | Result | Load Time |
|------|-------------|--------|-----------|
| youtube.com | proxy | PASS | 2.3s |
| amazon.com | proxy | PASS | 3.1s |
| netflix.com | cloud | FAIL | N/A |

## Failures
- netflix.com: CAPTCHA required, manual intervention needed

## Actions Required
- [ ] Investigate Netflix detection
- [ ] Consider CAPTCHA solving service
```

### Weekly Summary

```markdown
# Weekly Web Browsing Summary - Week of 2026-02-24

## Statistics
- Total requests: 523
- Success rate: 94.6%
- Proxy usage: 78%
- Cloud usage: 3%
- Direct usage: 19%

## Cost
- Proxy bandwidth: 2.3 GB ($5.75)
- Cloud requests: 47 ($4.70)
- Total: $10.45

## Trends
- YouTube: 100% success (up from baseline 0%)
- Cloudflare sites: 92% success (up from baseline 15%)
```

---

## Sign-off Requirements

Before marking implementation complete:

- [ ] 3 consecutive days of >90% success rate
- [ ] No critical failures (YouTube, major sites)
- [ ] Cost within budget
- [ ] Documentation complete
- [ ] Monitoring operational
- [ ] Aaron's approval
