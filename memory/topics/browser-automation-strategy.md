# Browser Automation Strategy

**Created:** 2026-02-28 03:20 EST
**Status:** 🚧 NEEDS PROPER SETUP

## ⚠️ Key Learning (2026-02-28)

**The Chrome extension relay is UNRELIABLE and basically never works.** — Aaron

We keep hitting this wall with validation. The browser extension approach fails consistently.

## Priority Order for Browser Automation

| Priority | Method | Reliability | Use Case |
|----------|--------|-------------|----------|
| **1st** | Playwright | ✅ HIGH | All screenshot validation, E2E tests |
| **2nd** | `profile=clawd` | 🟡 MEDIUM | Quick browser automation via Clawdbot |
| **3rd** | Chrome relay | ❌ LOW | Last resort only |

## Action Items

- [ ] **PROJECT CREATED:** Set up proper browser automation infrastructure
- [ ] Experiment with Playwright for all validation needs
- [ ] Test `profile=clawd` as fallback
- [ ] Document working patterns
- [ ] Remove reliance on Chrome extension relay

## Playwright Usage

```bash
# For MELO project validation
cd ~/repos/melo
npx playwright test

# Screenshot a specific URL
npx playwright screenshot https://localhost:3000 /tmp/screenshot.png

# Run specific test file
npx playwright test tests/registration.spec.ts
```

## What We've Tried That Failed

- [2026-02-28] Chrome extension relay - tabs empty, connection failing
- [2026-02-28] zoomclick template clicking - extension never connects

## Notes

This needs to become a proper project with thorough testing and documentation.
