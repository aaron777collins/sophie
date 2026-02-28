# Validation Evidence

This directory stores validation evidence for Beads tasks.

## Directory Structure

```
validation/
├── screenshots/
│   └── {bead-id}/
│       ├── ac-1-desktop-1920x1080.png
│       ├── ac-1-tablet-768x1024.png
│       ├── ac-1-mobile-375x667.png
│       ├── ac-2-desktop-1920x1080.png
│       └── ...
└── reports/
    └── {bead-id}/
        └── validation-report.md
```

## Screenshot Requirements

For UI work, ALL viewports are required:

| Viewport | Resolution | File Pattern |
|----------|------------|--------------|
| Desktop | 1920x1080 | `*-desktop-1920x1080.png` |
| Tablet | 768x1024 | `*-tablet-768x1024.png` |
| Mobile | 375x667 | `*-mobile-375x667.png` |

## Playwright Screenshot Command

```bash
# Example: Take screenshots for bead clawd-abc123
BEAD_ID="clawd-abc123"
mkdir -p scheduler/validation/screenshots/$BEAD_ID

# Desktop
npx playwright screenshot --viewport-size=1920,1080 \
  http://localhost:3000/feature \
  scheduler/validation/screenshots/$BEAD_ID/desktop-1920x1080.png

# Tablet  
npx playwright screenshot --viewport-size=768,1024 \
  http://localhost:3000/feature \
  scheduler/validation/screenshots/$BEAD_ID/tablet-768x1024.png

# Mobile
npx playwright screenshot --viewport-size=375,667 \
  http://localhost:3000/feature \
  scheduler/validation/screenshots/$BEAD_ID/mobile-375x667.png
```

## Visual Quality Checklist

Before screenshots can be approved:

- [ ] Text is readable at all viewport sizes
- [ ] No content overflow or horizontal scrolling on mobile
- [ ] Interactive elements are tappable size (44px minimum)
- [ ] Colors have sufficient contrast (WCAG AA)
- [ ] Layout is balanced and professional
- [ ] No broken images or missing assets
- [ ] Loading states display correctly
- [ ] Error states are styled consistently
- [ ] Forms are usable on mobile
- [ ] Navigation works at all breakpoints

**Rating must be: "Super Amazing and Professional"**

## Workflow

1. **Worker** takes screenshots after E2E tests pass
2. **Worker** adds evidence path to bead: `bd update {id} --notes "Screenshots: ..."`
3. **Validator** verifies screenshots exist at all viewports
4. **Validator** checks visual quality
5. **Validator** closes bead if all gates pass
