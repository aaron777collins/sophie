# Task: Robust Web Browsing Infrastructure

**Created:** 2026-02-27 02:35 EST
**Requested by:** Aaron (Slack)
**Priority:** CRITICAL

## Directive

> "No it's critical we get a way to browse the web up consistently and robustly which can handle websites like YouTube or whatever and load any site without being blocked."

## Current State

- Chrome on Xvfb with Clawdbot Browser Relay — **Unreliable**
- Chrome crashes frequently
- Some sites block headless/automated browsers
- No robust fallback

## Requirements

1. **Consistent** — Should work reliably, auto-recover from crashes
2. **Robust** — Handle any website (YouTube, etc.)
3. **Unblocked** — Avoid bot detection / anti-automation
4. **Properly Planned** — Opus planner, research, TDD, validation

## Research Areas

1. **Browser automation options:**
   - Playwright (built-in stealth)
   - Puppeteer with stealth plugins
   - undetected-chromedriver
   - Browserless.io (managed service)
   - Real browser via VNC/RDP

2. **Anti-detection techniques:**
   - Browser fingerprint randomization
   - Human-like behavior simulation
   - Residential proxies
   - Browser profiles/cookies persistence

3. **Reliability patterns:**
   - Auto-restart on crash
   - Health checks
   - Session persistence
   - Multiple browser pool

4. **Integration with Clawdbot:**
   - Keep browser tool interface
   - Add reliability layer
   - Screenshot/DOM capture

## Next Steps

1. Spawn Opus research agent to evaluate options
2. Create user stories with acceptance criteria
3. Implement with TDD and Playwright validation
4. Document and test thoroughly
