# Browser Automation Infrastructure - Master Plan

**Created:** 2026-02-28 03:25 EST  
**Status:** 🚀 ACTIVE  
**Priority:** HIGH (blocking all validation work)  
**Owner:** Person Manager (Opus)

---

## Executive Summary

The Chrome extension relay approach for browser automation has been **consistently failing**. We cannot take screenshots reliably, which blocks validation work on MELO and all future projects. Aaron's directive: *"Make sure it's thoroughly tested and done right.. and if it doesn't work then try something else."*

This project establishes **reliable, tested browser automation infrastructure** using a layered approach with Playwright as the primary method.

---

## Problem Statement

| Issue | Impact |
|-------|--------|
| Chrome extension relay fails consistently | Cannot take screenshots for validation |
| `browser action=tabs` returns empty | No connection to browser |
| zoomclick template clicking unreliable | Extension never connects |
| Validation gates blocked | MELO Phase 2 stalled |
| No fallback working | All browser automation unusable |

---

## Success Criteria

1. **Playwright works reliably** for screenshot capture and E2E testing
2. **Multiple methods available** (layered fallback)
3. **All methods thoroughly tested** with documented results
4. **Clear documentation** for which method to use when
5. **Validation workflow unblocked** - can take screenshots on demand

---

## Strategic Approach

### Priority Order (Per Aaron's Direction)

| Priority | Method | Target Reliability | Use Case |
|----------|--------|-------------------|----------|
| **1st** | Playwright | 99%+ | All validation, E2E tests, screenshots |
| **2nd** | Clawdbot `profile=clawd` | 90%+ | Quick automation via tool |
| **3rd** | Chrome extension relay | 70%+ | Legacy fallback only |

### Key Principle

**"If one doesn't work, try something else."** Each approach gets thorough testing. We move on from approaches that don't work reliably.

---

## Multi-Perspective Analysis

### 🎯 User Perspective (Sophie/Agents)
- **Need:** Take screenshots and validate UI without friction
- **Pain:** Current methods fail silently or require complex debugging
- **Want:** Single reliable command that just works
- **Frustration:** Spending time debugging browser instead of doing actual work

### 👨‍💻 Developer Perspective (Technical Implementation)
- **Need:** Headless browser that integrates with Node.js test frameworks
- **Pain:** Xvfb + Chrome + Extension chain has too many failure points
- **Want:** Playwright's native headless approach (fewer moving parts)
- **Opportunity:** Better test integration, parallel execution, CI-ready

### 🔧 Operations Perspective (Reliability/Maintenance)
- **Need:** Self-healing or at least easily diagnosable
- **Pain:** Current setup requires manual intervention (clicking extension)
- **Want:** Automated startup, health checks, clear logs
- **Risk:** Machine reboot = hours of debugging

### 📋 Project Manager Perspective (Aaron)
- **Need:** Validation workflow that doesn't block progress
- **Pain:** Every project hits the same browser wall
- **Want:** Solved once, works everywhere
- **Success:** Never hear "screenshot failed" again

---

## Project Structure

### Epic 1: Playwright Setup & Validation
**Goal:** Establish Playwright as the primary, reliable browser automation method.

### Epic 2: Alternative Methods Testing
**Goal:** Test and document fallback methods (profile=clawd, Chrome relay).

### Epic 3: Integration & Workflow
**Goal:** Integrate browser automation into validation workflows.

### Epic 4: Documentation & Maintenance
**Goal:** Create clear documentation and maintenance procedures.

---

## Timeline & Milestones

| Milestone | Target | Success Criteria |
|-----------|--------|------------------|
| M1: Playwright Working | Day 1 | Can take screenshot of any URL reliably |
| M2: Validation Integration | Day 1-2 | MELO validation can use Playwright |
| M3: Fallbacks Tested | Day 2 | Alternative methods documented with results |
| M4: Documentation Complete | Day 2 | TOOLS.md updated, troubleshooting guide ready |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Playwright doesn't work in current env | Low | High | Test immediately, fail fast |
| Dependencies missing | Medium | Low | Document and install |
| Chrome relay never fixable | High | Low | Accept and document as deprecated |
| Multiple methods create confusion | Medium | Medium | Clear priority order in docs |

---

## Epics Overview

| Epic | Stories | Priority | Status |
|------|---------|----------|--------|
| [EPIC-01](./epics/EPIC-01-playwright-setup.md) | Playwright Setup & Validation | P0-CRITICAL | Not Started |
| [EPIC-02](./epics/EPIC-02-alternative-methods.md) | Alternative Methods Testing | P1-HIGH | Not Started |
| [EPIC-03](./epics/EPIC-03-integration.md) | Integration & Workflow | P1-HIGH | Not Started |
| [EPIC-04](./epics/EPIC-04-documentation.md) | Documentation & Maintenance | P2-MEDIUM | Not Started |

---

## Acceptance Testing Strategy

### Validation Method
Each browser automation method must pass:

1. **Basic Screenshot Test** - Can capture a simple webpage
2. **MELO Dev Server Test** - Can screenshot localhost:3000
3. **Reliability Test** - 10 consecutive runs succeed
4. **Integration Test** - Works from validation workflow

### Evidence Collection
All tests documented with:
- Command used
- Output/logs
- Success/failure status
- Screenshot (if applicable)

---

## Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Node.js | ✅ Ready | v22.22.0 |
| Playwright | ⏳ Verify | May need install |
| MELO repo | ✅ Ready | ~/repos/melo |
| Xvfb | ✅ Running | Display :99 |

---

## Next Steps

1. **Story Architect:** Create detailed user stories for EPIC-01
2. **Worker (Sonnet):** Test Playwright installation and basic functionality
3. **Coordinator:** Monitor progress, spawn sub-tasks

---

## Change Log

| Date | Change | By |
|------|--------|-----|
| 2026-02-28 03:25 EST | Initial Master Plan created | Person Manager |
