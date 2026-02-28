# Validation Tools — BMAD-Beads System

Helper scripts for the validation workflow.

## Scripts

### take-screenshots.sh

Captures Playwright screenshots at all 3 required viewports.

```bash
./take-screenshots.sh <bead-id> <url> [name]

# Example:
./take-screenshots.sh clawd-abc123 http://localhost:3000/login login-form
```

Creates:
```
scheduler/validation/screenshots/clawd-abc123/
├── desktop/login-form.png   (1920x1080)
├── tablet/login-form.png    (768x1024)
└── mobile/login-form.png    (375x667)
```

### check-evidence.sh

Verifies all required evidence exists before requesting validation.

```bash
./check-evidence.sh <bead-id>

# Example:
./check-evidence.sh clawd-abc123
```

Checks:
- Bead exists in Beads DB
- Screenshot directories have files
- E2E test evidence in bead notes
- Bead status is appropriate

## Quick Reference

### Worker Workflow

```bash
# 1. Claim your bead
bd update clawd-abc123 --claim

# 2. Do your work (TDD)
pnpm test        # Write & run unit tests
pnpm test:e2e    # Write & run E2E tests

# 3. Take screenshots
./tools/validation/take-screenshots.sh clawd-abc123 http://localhost:3000/feature feature-name

# 4. Check evidence is complete
./tools/validation/check-evidence.sh clawd-abc123

# 5. Add evidence to bead
bd update clawd-abc123 --notes "Evidence: E2E pass, screenshots at scheduler/validation/screenshots/clawd-abc123/"

# 6. Request validation (NOT close!)
bd update clawd-abc123 --status needs-validation
```

### Validator Workflow

```bash
# 1. Find work to validate
bd list --status needs-validation

# 2. Check evidence
./tools/validation/check-evidence.sh clawd-abc123

# 3. Run E2E yourself
pnpm test:e2e

# 4. Review screenshots visually

# 5. Close (ONLY validator can close)
bd close clawd-abc123 --reason "Validated: E2E pass, screenshots complete, professional"

# OR reject
bd update clawd-abc123 --status needs-fix --notes "REJECTED: {reason}"
```

## Viewports

| Name | Size | Required |
|------|------|----------|
| Desktop | 1920×1080 | ✅ |
| Tablet | 768×1024 | ✅ |
| Mobile | 375×667 | ✅ |

Missing ANY viewport = automatic rejection.

---
*BMAD-Beads Integration v1.0 — 2026-02-28*
