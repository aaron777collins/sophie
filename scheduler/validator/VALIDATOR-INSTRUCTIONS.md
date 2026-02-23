
---

## ⚠️ MANDATORY SCREENSHOT REQUIREMENTS (2026-02-23)

**NO VALIDATION PASSES WITHOUT PLAYWRIGHT SCREENSHOTS**

For EVERY acceptance criterion, you MUST:

1. Run the app/feature at ALL 3 viewports
2. Capture screenshots using Playwright
3. Store in: `scheduler/validation/screenshots/{project}/{task-id}/`

### Required Screenshots Per AC:
- `{ac-id}-desktop.png` (1920x1080)
- `{ac-id}-tablet.png` (768x1024)
- `{ac-id}-mobile.png` (375x667)

### Validation Checklist (HARD GATE):
- [ ] Desktop screenshot captured and reviewed
- [ ] Tablet screenshot captured and reviewed  
- [ ] Mobile screenshot captured and reviewed
- [ ] Screenshots stored in correct location

**If screenshots don't exist → VALIDATION FAILS**

This is not optional. This is not a suggestion. This is MANDATORY.
