# Epic: [{EPIC-ID}] {Title}

**Project:** {project-name}
**Owner:** Person Manager
**Status:** draft | planning | in-progress | complete
**Created:** {date}
**Version:** 1

---

## Description
{2-3 sentence summary of what this epic delivers}

---

## Business Value
{Why this matters to the user/business}

---

## User Stories

| US-ID | Title | Status | Assigned |
|-------|-------|--------|----------|
| {US-ID} | {title} | pending | story-architect |

---

## Scope Boundaries

### In Scope
- {what IS included}
- {what IS included}

### Out of Scope
- {what is NOT included — explicit exclusions}
- {what belongs to a different epic}

---

## Contingencies

### What Could Go Wrong (Epic Level)

| Risk | Likelihood | Impact | Detection | Mitigation |
|------|------------|--------|-----------|------------|
| Scope creep | M | H | Stories multiplying | Enforce scope boundary |
| Technical debt blocks progress | M | H | Unexpected blockers | Have fallback approaches |
| External dependency unavailable | L | H | API down/changed | Build abstraction layer |
| Timeline slips | M | M | Milestone missed | Prioritize MVP features |
| {risk} | {L/M/H} | {L/M/H} | {how we know} | {what we do} |

### Fallback Options
- **If {scenario}:** {fallback approach}
- **If timeline at risk:** {MVP scope reduction}

### Blockers (Would Stop Epic Completely)
| Blocker | Likelihood | Mitigation |
|---------|------------|------------|
| {blocker} | L/M/H | {approach} |

### Early Warning Signs
- {signal that this epic is at risk}
- {signal that scope is expanding}
- {signal that dependencies are problematic}

---

## Dependencies

### Dependency Graph (Epic Level)
```
[Prerequisite Epic/Work] ─┬─► [THIS EPIC]
                          │
[Other Prerequisite] ─────┘
                          ↓
                    [Dependent Epic/Feature]
```

### Upstream Dependencies (Must Complete First)
| Dependency | Type | Status | Owner | Blocker? |
|------------|------|--------|-------|----------|
| {epic/tech/external} | epic/technical/external | status | who | yes/no |

### Downstream Dependents (Waiting on This)
| Dependent | Type | Impact if Delayed |
|-----------|------|-------------------|
| {epic/feature} | epic/feature | {business impact} |

### External Dependencies
| External | Description | Status | Fallback |
|----------|-------------|--------|----------|
| {API/service} | {what we need} | available/unknown | {alternative} |

### Parallel Work (No Dependencies)
- {work that can happen simultaneously}

---

## Success Metrics
- [ ] {measurable outcome 1}
- [ ] {measurable outcome 2}
- [ ] All User Stories complete and validated
- [ ] Deployed to production
- [ ] No critical bugs in first week

---

## Timeline

| Phase | Target | Status | Notes |
|-------|--------|--------|-------|
| Epic Definition | {date} | ✅ | |
| Story Breakdown | {date} | ⏳ | Story Architect |
| Development | {date} | ⏳ | |
| Validation | {date} | ⏳ | |
| Deployment | {date} | ⏳ | |

---

## Review Checklist

Before sending to Story Architect:
- [ ] Business value clear
- [ ] Scope boundaries explicit
- [ ] Dependencies mapped
- [ ] Contingencies identified
- [ ] Success metrics measurable
- [ ] Timeline realistic

---

## Review History

| Version | Reviewer | Date | Outcome | Changes |
|---------|----------|------|---------|---------|
| v1 | | | | Initial draft |

---

## VSDD Compliance (Mandatory)

### Verification Properties (Epic-Level)

| Property ID | Property | Testable | Coverage |
|-------------|----------|----------|----------|
| VP-{EPIC}-01 | {What must be provably true for this epic} | {Test method} | {Stories covered} |
| VP-{EPIC}-02 | {Core invariant} | {Test method} | {Stories covered} |
| VP-{EPIC}-03 | {Security/permission property} | {Test method} | {Stories covered} |

### Purity Boundary Map (Epic-Level)

**Pure Core (Deterministic, no side effects):**
- `{reducer}()` — State transitions
- `{validator}()` — Validation rules
- `{transformer}()` — Data transformation

**Effectful Shell (Side effects allowed):**
- API calls
- Database operations
- Event handlers
- Navigation

**Adapters (Thin wrappers):**
- `use{Feature}()` hook — Connects pure core to effects

### Contract Chain (Epic-Level)

```
Spec: {EPIC-ID}
  ↓
Stories: {US-IDs}
  ↓
Properties: VP-{EPIC}-01 through VP-{EPIC}-XX
  ↓
Beads: bd-{epic-prefix}-* (one per story)
  ↓
Tests: tests/{feature}/*.test.ts, tests/e2e/{feature}.spec.ts
  ↓
Code: lib/{feature}/, hooks/, components/
```

---
*Template version: 3.0 — Added VSDD Compliance (2026-03-01)*
