# User Story: [{US-ID}] {Title}

**Epic:** {EPIC-ID}
**Project:** {project-name}
**Status:** draft | reviewed | approved | in-progress | validating | complete
**Story Architect:** story-architect
**Created:** {date}
**Version:** 1
**Test Server:** {URL}

---

## Story

**As a** {user type}
**I want** {capability/feature}
**So that** {benefit/value}

---

## Acceptance Criteria

### AC-1: {Happy Path - Primary Success}

**Given** {precondition - the starting state}
**When** {action - what the user does}
**Then** {expected result - what should happen}

**Validation:**
- Method: {Playwright test | Manual verification | API test}
- Test Server: {URL}
- Screenshot: Required ✅

---

### AC-2: {Alternate Success Path}

**Given** {different valid starting state}
**When** {alternate action}
**Then** {expected result}

**Validation:**
- Method: {validation method}
- Screenshot: Required ✅

---

### AC-3: {Edge Case - Empty/No Data State}

**Given** {user has no data / empty state}
**When** {action}
**Then** {appropriate empty state UI / message}

**Validation:**
- Method: {validation method}
- Screenshot: Required ✅

---

### AC-4: {Edge Case - Error Handling}

**Given** {precondition}
**When** {action that causes error}
**Then** {user-friendly error message / recovery option}

**Validation:**
- Method: {validation method}
- Screenshot: Required ✅

---

### AC-5: {Edge Case - Boundary Condition}

**Given** {boundary condition - max items, long input, etc.}
**When** {action}
**Then** {appropriate handling}

**Validation:**
- Method: {validation method}
- Screenshot: Required ✅

---

## Contingencies

### What Could Go Wrong

| Risk | Likelihood | Impact | Detection | Mitigation |
|------|------------|--------|-----------|------------|
| Network request fails | M | M | Error response | Show retry button, offline message |
| API returns unexpected format | L | H | Parse error | Graceful degradation, error logging |
| User input too long | M | L | Form validation | Character limit with feedback |
| Concurrent modification | L | M | Stale data error | Refresh prompt, conflict resolution |
| Session expires mid-action | M | M | 401 response | Save draft, redirect to login |
| {risk} | {L/M/H} | {L/M/H} | {how to detect} | {what to do} |

### Fallback Options
- **If primary approach fails:** {alternative approach}
- **If external service down:** {graceful degradation}
- **If user lacks permissions:** {appropriate message/redirect}

### Blockers (Would Prevent Story Completion)
| Blocker | Likelihood | Mitigation |
|---------|------------|------------|
| Auth system not ready | L | Use mock auth, implement later |
| API not available | M | Build with mock data, integrate later |
| {blocker} | {L/M/H} | {approach} |

### Early Warning Signs
- {signal that implementation is going wrong}
- {signal that approach needs rethinking}
- {signal that scope is expanding}

---

## Dependencies

### Dependency Graph
```
[Upstream Story/Tech] ─┬─► [THIS STORY] ─┬─► [Downstream Story]
                       │                 │
[Other Upstream] ──────┘                 └─► [Other Downstream]
```

### Upstream (Must Complete First)
| Dependency | Type | Status | Blocker? | Notes |
|------------|------|--------|----------|-------|
| {US-ID / tech item} | story/technical/external | done/in-progress/pending | yes/no | {notes} |

### Downstream (Waiting on This)
| Dependent | Type | Impact if Delayed |
|-----------|------|-------------------|
| {US-ID / feature} | story/feature | {what breaks/waits} |

### External Dependencies
| External | Description | Status | Fallback |
|----------|-------------|--------|----------|
| {API/service} | {what we need from it} | available/testing | {alternative} |

### Technical Prerequisites
- [ ] {database table/schema}
- [ ] {authentication/authorization}
- [ ] {shared component/library}

---

## Out of Scope

Explicitly NOT included in this story (to prevent scope creep):
- {thing that might be assumed but isn't covered}
- {thing that belongs in a different story}
- {nice-to-have that can be a future story}

---

## Technical Notes

{Implementation guidance, constraints, patterns to follow}

### Suggested Approach
- {high-level implementation steps}

### Patterns to Follow
- {link to or description of existing patterns}

### Anti-Patterns to Avoid
- {known bad approaches}

---

## Test Credentials

**Location:** `~/.env.test-credentials`
**Note:** Never commit actual passwords to git

---

## Sub-Tasks (Coordinator Fills This)

| Task ID | Description | Model | Status |
|---------|-------------|-------|--------|
| | | | |

---

## Definition of Done

- [ ] All acceptance criteria pass
- [ ] All edge cases handled
- [ ] Playwright tests created (if applicable)
- [ ] Unit tests written
- [ ] Deployed to test server
- [ ] Screenshots captured for EACH acceptance criterion
- [ ] No browser console errors
- [ ] No server errors (pm2 logs clean)
- [ ] Code committed with descriptive message
- [ ] Code pushed to remote
- [ ] L1 (Self) validation complete
- [ ] L2 (Manager) validation complete
- [ ] L3 (Peer) validation complete

---

## Validation History

| Level | Validator | Date | Result | Report |
|-------|-----------|------|--------|--------|
| L1 Self | | | | |
| L2 Manager | | | | |
| L3 Peer | | | | |

---

## Review Checklist (Story Architect / Reviewer)

### Completeness
- [ ] Happy path covered
- [ ] Alternate valid paths covered
- [ ] All error scenarios covered
- [ ] All edge cases covered
- [ ] Empty states covered
- [ ] Boundary conditions covered
- [ ] Permission/auth cases covered

### Testability
- [ ] Every AC has Given/When/Then
- [ ] Every AC has validation method
- [ ] ACs are specific and measurable
- [ ] No ambiguous language

### Dependencies
- [ ] Upstream dependencies identified
- [ ] Downstream dependents identified
- [ ] External dependencies mapped
- [ ] Technical prerequisites listed
- [ ] No circular dependencies

### Contingencies
- [ ] Risks identified with mitigations
- [ ] Fallback options documented
- [ ] Blockers identified with workarounds
- [ ] Early warning signs listed

### Clarity
- [ ] Sonnet could implement without clarifying questions
- [ ] No ambiguous terms
- [ ] Scope boundaries explicit (out of scope)
- [ ] Technical notes sufficient

---

## Review History

| Version | Reviewer | Date | Outcome | Key Feedback |
|---------|----------|------|---------|--------------|
| v1 | | | draft | Initial |
| v2 | {reviewer} | {date} | {approved/needs-work} | {summary} |

---
*Template version: 2.0 — Added Contingencies, Dependencies, Review Checklist (2026-02-21)*
