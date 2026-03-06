# Task Routing System

> **Purpose:** How Coordinator and Scrum Master assign tasks to specialists
> **Last Updated:** 2026-03-05

---

## 🏷️ Label-Based Routing

### Primary Labels → Specialist Mapping

| Label | Primary Specialist | Agent Name | Identity Path | Notes |
|-------|-------------------|------------|---------------|-------|
| `frontend` | Frontend Specialist | Phoenix 🎨 | `scheduler/specialists/frontend/IDENTITY.md` | UI, components, styling |
| `backend` | Backend Specialist | Atlas ⚙️ | `scheduler/specialists/backend/IDENTITY.md` | APIs, database, auth |
| `testing` | QA Engineer | Mercury 🧪 | `scheduler/specialists/qa/IDENTITY.md` | Test strategy, implementation |
| `devops` | DevOps Engineer | Forge 🛡️ | `scheduler/specialists/devops/IDENTITY.md` | CI/CD, deployment |
| `infrastructure` | Infrastructure Specialist | Titan 🏔️ | `scheduler/specialists/infrastructure/IDENTITY.md` | Cloud, networking, scaling, security |
| `architecture` | Architect | Athena 🏛️ | `scheduler/specialists/architect/IDENTITY.md` | Design decisions, schemas |
| `cross-cutting` | Multiple | (coordinate) | — | Multi-domain work |

### Secondary Labels

| Label | Meaning |
|-------|---------|
| `urgent` | Priority boost, assign immediately |
| `blocked` | Cannot progress, needs resolution |
| `needs-review` | Ready for peer review |
| `needs-validation` | Ready for Validator |

---

## 🔀 Routing Algorithm

```
1. Check task labels
2. If single domain label → Route to that specialist
3. If multiple domain labels → Scrum Master coordinates
4. If cross-cutting → 
   a. Identify primary domain (largest portion of work)
   b. Assign to primary specialist
   c. Tag secondary specialists for collaboration
5. If no domain label →
   a. Analyze title/description for keywords
   b. Apply best-fit routing
   c. Add appropriate label
```

### Keyword-Based Fallback

| Keywords | Route To |
|----------|----------|
| button, form, UI, component, style, CSS, responsive | Frontend |
| API, endpoint, database, auth, migration, server | Backend |
| test, coverage, e2e, playwright, jest | QA |
| deploy, CI, docker, build, pipeline | DevOps |
| schema, design, pattern, architecture, refactor | Architect |

---

## 🤝 Multi-Specialist Tasks

When a task requires multiple specialists:

### 1. Identify Components
Break task into specialist-specific sub-tasks:
```bash
# Create parent task
bd create "Feature: User Profile" -t task -p 1 --labels cross-cutting

# Create sub-tasks
bd create "Profile API endpoint" -t task -p 2 --labels backend --deps clawd-XXX
bd create "Profile UI component" -t task -p 2 --labels frontend --deps clawd-XXX
bd create "Profile E2E tests" -t task -p 2 --labels testing --deps clawd-YYY,clawd-ZZZ
```

### 2. Define Dependencies
```
Backend API → Frontend UI → QA E2E Tests
     ↓
  (parallel)
     ↓
Database Migration
```

### 3. Coordinate Handoffs
Scrum Master ensures:
- Backend completes API before Frontend starts UI
- Both complete before QA tests full flow
- Clear API contract shared between Backend and Frontend

---

## 📊 Capacity Management

### Specialist Load Limits

| Specialist | Max Concurrent Tasks | Notes |
|------------|---------------------|-------|
| Frontend | 2 | Context-heavy, UI work |
| Backend | 2 | Database/API complexity |
| QA | 3 | Can parallelize test writing |
| DevOps | 2 | Pipeline work needs focus |
| Architect | 1 | Decisions need full attention |
| Validator | 3 | Sequential validation |
| Auditor | 2 | Random sampling |

### Before Assigning:
```bash
# Check specialist's current load
bd list --status in_progress --labels {specialist-label} --json
```

---

## 🚨 Escalation Paths

### Specialist → Scrum Master
- "I'm blocked by {issue}"
- "I need help from {other-specialist}"
- "This task is larger than expected"

### Scrum Master → Coordinator
- Cross-team dependency issues
- Resource conflicts
- Priority disputes
- Stalled tasks (>4 hours no progress)

### Coordinator → Person Manager
- Strategic decisions needed
- Major blockers affecting multiple tasks
- Pattern of failures

---

## 📋 Assignment Templates

### New Task Assignment
```
🏃 **Task Assignment**

**Bead:** {bead-id}
**Title:** {title}
**Priority:** {P0-P4}
**Labels:** {labels}

@{specialist-name} — This task is assigned to you.
**Claim it:** `bd update {bead-id} --claim`

**Acceptance Criteria:**
1. {AC1}
2. {AC2}

**Dependencies:** {deps or "None"}
**Deadline:** {if any}
```

### Collaboration Request
```
🤝 **Collaboration Needed**

**Task:** {bead-id} - {title}
**Lead:** @{primary-specialist}
**Support Needed:** @{secondary-specialist}

**What's needed:**
{description of support}

Please coordinate directly. Scrum Master tracking.
```

---

## 🔧 Beads Commands Quick Reference

```bash
# List open tasks by label
bd list --status open --labels frontend

# Assign/claim a task
bd update clawd-XXX --claim

# Add dependency
bd dep add clawd-XXX clawd-YYY

# Check ready tasks (no blockers)
bd ready --json

# Submit for validation
bd update clawd-XXX --status needs-validation

# Close task
bd close clawd-XXX --reason "Completed"
```
