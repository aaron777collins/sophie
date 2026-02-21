# User Stories Index

**Last Updated:** 2026-02-21 12:30 EST

---

## Active Projects

### PortableRalph

**Status:** Phase 4 - Production Hardening
**Repository:** PortableRalph
**Test Environment:** GitHub Actions Windows CI

| Epic | Title | Status | Stories |
|------|-------|--------|---------|
| PR-E004 | Production Hardening | 🔄 in-progress | 5 |

**Current Focus:** PR-US-403 (Error Handling)

### Melo v2

**Status:** Stabilization
**Repository:** melo
**Test Environment:** https://dev2.aaroncollins.info

| Epic | Title | Status | Stories |
|------|-------|--------|---------|
| MELO-E001 | Core Authentication | 🔄 in-progress | 5 |
| MELO-E002 | Production Stability | 🔄 in-progress | 4 |

**Current Focus:** MELO-US-001 (Sign-in validation), MELO-US-011 (Console errors)

---

## Story Status Legend

| Status | Meaning |
|--------|---------|
| ⏳ pending | Not started |
| 🔄 in-progress | Being worked on |
| ✅ validating | Work done, in validation |
| ✅ complete | Validated and done |
| ❌ blocked | Cannot proceed |

---

## Directory Structure

```
scheduler/stories/
├── INDEX.md (this file)
├── templates/
│   ├── EPIC-TEMPLATE.md
│   ├── USER-STORY-TEMPLATE.md
│   └── VALIDATION-REPORT-TEMPLATE.md
├── portableralph/
│   ├── epics/
│   │   └── PR-E004-production-hardening.md
│   └── stories/
│       ├── PR-US-403-error-handling.md
│       ├── PR-US-404-documentation.md
│       └── PR-US-405-cicd-verification.md
└── melo-v2/
    ├── epics/
    │   ├── MELO-E001-authentication.md
    │   └── MELO-E002-production-stability.md
    └── stories/
        └── MELO-US-001-sign-in.md
```

---

## Workflow Rules (NON-NEGOTIABLE)

1. **No User Story = No Task Assignment**
2. **No Acceptance Criteria = No Validation**
3. **Every AC must have Given/When/Then format**
4. **Screenshots required for ALL validations**
5. **Validation reports go to `scheduler/validation/reports/{project}/`**

---

## Creating New Work

1. **New Project:** Create `scheduler/stories/{project}/` with `epics/` and `stories/` subdirs
2. **New Epic:** Use `templates/EPIC-TEMPLATE.md`, save to `{project}/epics/`
3. **New Story:** Use `templates/USER-STORY-TEMPLATE.md`, save to `{project}/stories/`
4. **Update this INDEX** after creating epics/stories
