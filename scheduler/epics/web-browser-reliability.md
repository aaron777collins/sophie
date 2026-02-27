# Epic: Web Browser Reliability

**Epic ID:** BROWSER-001  
**Created:** 2026-02-27  
**Status:** READY  
**Priority:** HIGH  
**Estimated Duration:** 3-5 days

---

## Overview

Implement rebrowser-playwright as the primary browser automation solution, replacing the unreliable Chrome+Xvfb+Relay setup with a more robust, detection-resistant approach.

**Decision Reference:** `docs/WEB-BROWSING-DECISION.md`

---

## Stories

### S01: Browser Health Watchdog (Phase 1)
**Priority:** CRITICAL  
**Estimate:** 0.5-1 day

**As a** Sophie agent  
**I want** automatic browser crash detection and recovery  
**So that** I don't need human intervention when Chrome dies

**Acceptance Criteria:**
- AC-1: Crash detected within 5 seconds
- AC-2: Auto-restart completes within 30 seconds
- AC-3: Session state (cookies) restored after recovery
- AC-4: Recovery attempts logged for analysis

**Implementation Notes:**
- Add watchdog cron (every 30s health check)
- Implement session state checkpointing
- Create recovery script

---

### S02: rebrowser-playwright Integration (Phase 2)
**Priority:** HIGH  
**Estimate:** 1-2 days

**As a** Sophie agent  
**I want** rebrowser-playwright available as a browser backend  
**So that** I can access sites that block standard automation

**Acceptance Criteria:**
- AC-1: `browser profile=stealth` uses rebrowser-playwright
- AC-2: Passes nowsecure.nl detection test
- AC-3: Existing browser actions (navigate, screenshot, snapshot) work unchanged
- AC-4: Integration documented in TOOLS.md

**Implementation Notes:**
```bash
npm install rebrowser-playwright
```
- Create browser abstraction layer
- Add stealth profile to browser tool

---

### S03: Session Persistence (Phase 1)
**Priority:** MEDIUM  
**Estimate:** 0.5 day

**As a** Sophie agent  
**I want** browser sessions to persist across restarts  
**So that** I don't have to re-login to sites after crashes

**Acceptance Criteria:**
- AC-1: Cookies saved on graceful shutdown
- AC-2: Cookies restored on startup
- AC-3: localStorage/sessionStorage preserved (optional)
- AC-4: Session file location documented

**Implementation Notes:**
- Save to `~/.clawdbot/browser-sessions/`
- JSON format for cookies
- Checkpoint on navigation to authenticated pages

---

### S04: Detection Logging (Phase 3)
**Priority:** LOW  
**Estimate:** 0.5 day

**As a** Sophie agent  
**I want** all browser sessions logged with outcomes  
**So that** I can identify patterns and problem sites

**Acceptance Criteria:**
- AC-1: Every navigation logged (URL, timestamp, outcome)
- AC-2: Detection signals captured (403, captcha, redirect)
- AC-3: Log file rotated daily
- AC-4: Weekly summary generated

**Implementation Notes:**
- Log to `logs/browser-sessions/YYYY-MM-DD.jsonl`
- Outcome categories: success, blocked, captcha, error

---

## Dependencies

```
S01 (Watchdog) ─→ S03 (Persistence)
       │
       └──────→ S02 (rebrowser-playwright) ─→ S04 (Logging)
```

S01 and S02 can proceed in parallel.

---

## Success Metrics

| Metric | Before | Target |
|--------|--------|--------|
| Crashes/day | 2-3 | <1 |
| Manual interventions/week | 5+ | <2 |
| Detection rate | ~40% | <20% |
| Time to recovery | minutes | <30s |

---

## Out of Scope (Deferred)

- Browserless.io integration (evaluate at 30-day review)
- Camoufox backend (only if rebrowser proves insufficient)
- Full tiered routing system (YAGNI for now)
- Residential proxy integration

---

## Review Schedule

- **Day 7:** Phase 1 & 2 complete, initial metrics
- **Day 30:** Full review, evaluate need for additional tiers
- **Quarterly:** Long-term effectiveness review

---

*Epic created by Sophie following counsel deliberation.*
