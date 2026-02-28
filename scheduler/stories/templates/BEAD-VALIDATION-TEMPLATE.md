# Bead Validation Report: {bead-id}

**Bead:** {bead-id} — {title}
**Type:** {epic/story/task}
**Validator:** {agent-name}
**Date:** {YYYY-MM-DD HH:MM TZ}

---

## Overall Verdict

# ✅ VALIDATED | ❌ REJECTED

---

## Quality Gates (ALL MUST PASS)

```
┌─────────────────────────────────────────────────────────────────────┐
│  QUALITY GATES CHECKLIST                                            │
├─────────────────────────────────────────────────────────────────────┤
│  [x/✗] Bead was claimed before work started                         │
│  [x/✗] Acceptance criteria defined (Given/When/Then)                │
│  [x/✗] Unit tests written AND passing                               │
│  [x/✗] E2E tests written AND passing                                │
│  [x/✗] Screenshots at 3 viewports exist                             │
│  [x/✗] Visual quality check: "professional appearance"              │
│  [x/✗] All evidence documented in bead notes                        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Test Evidence Verification

### Unit Tests
```bash
$ pnpm test
{paste actual output}

Exit code: {0 or error}
```
**Status:** ✅ PASS / ❌ FAIL

### E2E Tests (MANDATORY)
```bash
$ pnpm test:e2e
{paste actual output}

Exit code: {0 or error}
```
**Status:** ✅ PASS / ❌ FAIL

---

## Screenshot Verification

### Screenshot Directory Check
```bash
$ ls -la scheduler/validation/screenshots/{bead-id}/
{paste output showing all 3 viewport directories}
```

### Screenshots Found

| Viewport | Size | Screenshot Path | Status |
|----------|------|-----------------|--------|
| Desktop | 1920×1080 | `{path}` | ✅/❌ |
| Tablet | 768×1024 | `{path}` | ✅/❌ |
| Mobile | 375×667 | `{path}` | ✅/❌ |

---

## Visual Quality Checklist

| Check | Status |
|-------|--------|
| Text readable at all viewports | ✅/❌ |
| No content overflow on mobile | ✅/❌ |
| Interactive elements ≥44px | ✅/❌ |
| Sufficient color contrast | ✅/❌ |
| Professional appearance | ✅/❌ |
| No broken images | ✅/❌ |
| Loading states work | ✅/❌ |
| Error states styled | ✅/❌ |

**Visual Rating:** {Super Amazing and Professional / Needs Work}

---

## Acceptance Criteria Verification

### AC-1: {title}
- **Given:** {precondition} — ✅ Verified
- **When:** {action} — ✅ Performed  
- **Then:** {expected} — ✅ Observed
- **Status:** ✅ PASS / ❌ FAIL

### AC-2: {title}
- **Given:** {precondition} — ✅ Verified
- **When:** {action} — ✅ Performed  
- **Then:** {expected} — ✅ Observed
- **Status:** ✅ PASS / ❌ FAIL

---

## Issues Found

| # | Severity | Description | Action Required |
|---|----------|-------------|-----------------|
| 1 | {P0-Critical/P1-High/P2-Medium/P3-Low} | {description} | {fix needed} |

---

## Bead Close Command (Validator Only)

```bash
# If VALIDATED (all gates pass):
bd close {bead-id} --reason "Validated: E2E pass ({X/X} tests), screenshots complete (3/3 viewports), visually professional"

# If REJECTED (any gate fails):
bd update {bead-id} --status needs-fix --notes "REJECTED: {reason}. Fix required: {specific action}"
```

---

## Validator Certification

I, the Validator, certify that:
- [x] I ran E2E tests MYSELF (not trusting worker's claim)
- [x] I verified screenshots EXIST at all 3 viewports
- [x] I checked visual quality against all criteria
- [x] I verified all acceptance criteria are met
- [x] This is independent verification (fresh perspective)

**Validator:** {name}
**Date:** {ISO timestamp}
**Bead Closed:** YES / NO (if rejected)

---
*BMAD-Beads Integration v1.0 — 2026-02-28*
