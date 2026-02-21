# User Story: [{US-ID}] {Title}

**Epic:** {EPIC-ID}
**Project:** {project-name}
**Status:** pending | in-progress | validating | complete
**Assigned:** {worker/person}
**Model:** haiku | sonnet | opus
**Created:** {date}
**Test Server:** {URL}

---

## Story

**As a** {user type}
**I want** {capability/feature}
**So that** {benefit/value}

---

## Acceptance Criteria

### AC-1: {Criterion Title}

**Given** {precondition - the starting state}
**When** {action - what the user does}
**Then** {expected result - what should happen}

**Validation:**
- Method: {Playwright test | Manual verification | API test}
- Screenshot: Required ✅
- Server Logs: Check for errors ✅

---

### AC-2: {Criterion Title}

**Given** {precondition}
**When** {action}
**Then** {expected result}

**Validation:**
- Method: {validation method}
- Screenshot: Required ✅
- Server Logs: Check for errors ✅

---

### AC-3: {Criterion Title}

**Given** {precondition}
**When** {action}
**Then** {expected result}

**Validation:**
- Method: {validation method}
- Screenshot: Required ✅
- Server Logs: Check for errors ✅

---

## Technical Notes

{Any implementation guidance, constraints, or context}

---

## Test Credentials

**Location:** `~/.env.test-credentials`
**Username:** {test username for this project}
**Note:** Never commit actual passwords to git

---

## Definition of Done

- [ ] All acceptance criteria pass
- [ ] Playwright tests created (if applicable)
- [ ] Deployed to test server
- [ ] Screenshots captured for EACH acceptance criterion
- [ ] No browser console errors
- [ ] No server errors (pm2 logs clean)
- [ ] Code committed with descriptive message
- [ ] Code pushed to remote
- [ ] Validation report generated

---

## Validation History

| Level | Validator | Date | Result | Report |
|-------|-----------|------|--------|--------|
| L1 Self | | | | |
| L2 Manager | | | | |
| L3 Peer | | | | |

---
*Template version: 1.0*
