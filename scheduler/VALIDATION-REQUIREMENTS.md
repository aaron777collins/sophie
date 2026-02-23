# VALIDATION REQUIREMENTS - MANDATORY

## Screenshot Evidence (NON-NEGOTIABLE)

**Every acceptance criterion requires Playwright screenshot evidence.**

### Required Viewports
| Device | Viewport | Required |
|--------|----------|----------|
| Desktop | 1920x1080 | ✅ YES |
| Tablet | 768x1024 | ✅ YES |
| Mobile | 375x667 | ✅ YES |

### Storage Location
```
scheduler/validation/screenshots/{project}/{task-id}/
├── {ac-id}-desktop.png
├── {ac-id}-tablet.png
└── {ac-id}-mobile.png
```

### Validation Gate
```
┌─────────────────────────────────────────────────────────────────┐
│  NO SCREENSHOTS = NO VALIDATION PASS                            │
│  This is a HARD GATE. No exceptions. No excuses.                │
└─────────────────────────────────────────────────────────────────┘
```

### Playwright Screenshot Script
```typescript
// Use this pattern for all validations
const viewports = [
  { name: 'desktop', width: 1920, height: 1080 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 375, height: 667 },
];

for (const vp of viewports) {
  await page.setViewportSize({ width: vp.width, height: vp.height });
  await page.screenshot({ 
    path: `scheduler/validation/screenshots/${project}/${taskId}/${acId}-${vp.name}.png`,
    fullPage: true 
  });
}
```

## Melo V2 Specific

### LiveKit - ALREADY RUNNING ON DEV2
- dev2.aaroncollins.info has LiveKit configured
- This is NOT a blocker
- Melo connects to the existing LiveKit server
- DO NOT report this as missing infrastructure

---
*Last updated: 2026-02-23 by Sophie after Aaron's feedback*
*This is a core requirement. Enforce it.*
