# Visual Quality Checklist — BMAD-Beads System

> **Rating Required:** "Super Amazing and Professional" — Aaron's exact words

---

## When To Use This Checklist

Use this checklist BEFORE:
- Workers: Requesting validation (`bd update --status needs-validation`)
- Validators: Closing beads (`bd close --reason "..."`)

---

## Mandatory Checks (ALL Must Pass)

### 📱 Responsiveness (3 Viewports Required)

| Viewport | Size | Check | Status |
|----------|------|-------|--------|
| Desktop | 1920×1080 | Layout is correct | ☐ |
| Tablet | 768×1024 | Adapts properly | ☐ |
| Mobile | 375×667 | Fully usable | ☐ |

**Screenshot paths MUST exist:**
```
scheduler/validation/screenshots/{bead-id}/
├── desktop/  ← Required
├── tablet/   ← Required
└── mobile/   ← Required
```

---

### 📖 Typography & Readability

| Check | Requirement | Status |
|-------|-------------|--------|
| Font size | ≥16px body text | ☐ |
| Line height | 1.4-1.6× font size | ☐ |
| Contrast ratio | ≥4.5:1 (WCAG AA) | ☐ |
| Text truncation | Graceful (no broken words) | ☐ |
| Headings | Clear hierarchy | ☐ |

---

### 👆 Interactivity

| Check | Requirement | Status |
|-------|-------------|--------|
| Touch targets | ≥44×44px on mobile | ☐ |
| Hover states | Visible on desktop | ☐ |
| Focus states | Clear for accessibility | ☐ |
| Button spacing | ≥8px between | ☐ |
| Links | Distinguishable from text | ☐ |

---

### 📐 Layout & Spacing

| Check | Requirement | Status |
|-------|-------------|--------|
| No horizontal scroll | Especially on mobile | ☐ |
| No content overflow | Text stays in containers | ☐ |
| Consistent spacing | Margins/padding uniform | ☐ |
| Balanced layout | Visual weight distributed | ☐ |
| Alignment | Elements properly aligned | ☐ |

---

### 🖼️ Assets & Media

| Check | Requirement | Status |
|-------|-------------|--------|
| No broken images | All images load | ☐ |
| Image aspect ratios | Preserved (not stretched) | ☐ |
| Icons visible | Clear and recognizable | ☐ |
| Loading states | Graceful (spinners/skeletons) | ☐ |
| Error images | Fallbacks work | ☐ |

---

### 🎨 Visual Polish

| Check | Requirement | Status |
|-------|-------------|--------|
| Color consistency | Brand colors used correctly | ☐ |
| Shadow/elevation | Consistent depth cues | ☐ |
| Border radius | Consistent across elements | ☐ |
| Animation | Smooth, not janky | ☐ |
| Professional appearance | "Would I show a client?" | ☐ |

---

### ⚠️ Error & Edge States

| Check | Requirement | Status |
|-------|-------------|--------|
| Error messages | Styled consistently | ☐ |
| Empty states | Handled gracefully | ☐ |
| Loading states | User knows something's happening | ☐ |
| Form validation | Clear error indicators | ☐ |
| 404/error pages | Styled, not default | ☐ |

---

## Quick Pass/Fail Decision

```
┌─────────────────────────────────────────────────────────────────────┐
│   PASS = ALL checkboxes checked                                     │
│   FAIL = ANY checkbox unchecked                                     │
│                                                                     │
│   No partial passes. No "conditional" approvals.                    │
│   Fix the issues, re-check, then pass.                              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Documentation for Bead Notes

Copy this summary into your bead notes:

```
VISUAL QUALITY CHECK COMPLETE:
✅ Responsiveness: 3/3 viewports pass
✅ Typography: Readable, good contrast
✅ Interactivity: Touch targets ≥44px
✅ Layout: No overflow, balanced
✅ Assets: All images load
✅ Polish: Professional appearance
✅ Edge states: Handled gracefully

Rating: SUPER AMAZING AND PROFESSIONAL
```

---
*BMAD-Beads Integration v1.0 — 2026-02-28*
