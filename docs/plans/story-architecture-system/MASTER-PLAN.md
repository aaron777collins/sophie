# Master Plan: Story Architecture System

**Created:** 2026-02-21 11:20 EST
**Author:** Sophie (with Aaron's direction)
**Version:** 1
**Status:** draft

---

## Executive Summary

Restructure the agent hierarchy to create a specialized **Story Architect** role (Opus) that focuses exclusively on breaking projects into Epics, User Stories, and comprehensive Acceptance Criteria. This separates "planning what to build" (Opus-level thinking) from "executing the build" (Sonnet/Haiku execution). All planning artifacts must include contingencies and dependencies.

---

## Goals

1. **Separate planning from execution** — Opus thinks, Sonnet implements, Haiku executes commands
2. **Specialize in story architecture** — Dedicated role for Epic/Story creation with deep domain expertise
3. **Comprehensive contingency planning** — Every Epic, Story, and Task must document what could go wrong and how to handle it
4. **Explicit dependency mapping** — Clear visualization of what blocks what
5. **Testable acceptance criteria** — Every AC must be verifiable with Given/When/Then

---

## Success Criteria

- [ ] Story Architect role created with Identity, cron, inbox
- [ ] Person Manager updated to create Epics (strategic level)
- [ ] Coordinator updated to break Stories into sub-tasks only
- [ ] All templates updated with Contingency and Dependency sections
- [ ] Clear flow: Epic → Story → Task with proper handoffs
- [ ] Model requirements enforced: Opus (planning), Sonnet (implementation), Haiku (commands only)

---

## New Hierarchy Structure

```
👑 Aaron + Sophie ─ Direction & Orders
   │
   └── 👔 Person Manager (Opus, 4x/day)
       │   Creates: MASTER PLANS + EPICS (strategic level)
       │   Works with: Story Architect on story breakdown
       │
       ├── 📐 Story Architect (Opus, on-demand) ← NEW ROLE
       │       Creates: USER STORIES with comprehensive ACs
       │       Specializes: Breaking epics into stories
       │       Thinks through: ALL contingencies & dependencies
       │       Outputs: Ready-to-implement story files
       │
       ├── 🎯 Coordinator (Opus/Sonnet, 30 min)
       │       Creates: SUB-TASKS from Stories (still US format)
       │       Manages: Execution, progress tracking
       │       Validates: Layer 2 manager validation
       │
       ├── 🔍 Validator (Sonnet, 30 min)
       │       Validates: Layer 3 independent verification
       │
       └── 📋 Task Managers (Haiku, 15 min)
               Spawns: Workers for pending tasks
               │
               └── ⚙️ Workers (Sonnet for implementation, Haiku for commands)
                       Executes: Tasks per User Story ACs
```

---

## Model Requirements (NON-NEGOTIABLE)

| Role | Model | What They Do | What They DON'T Do |
|------|-------|--------------|-------------------|
| **Person Manager** | Opus | Master Plans, Epics, Strategic decisions | Task execution |
| **Story Architect** | Opus | User Stories, ACs, Contingencies, Dependencies | Implementation |
| **Coordinator** | Opus (planning) / Sonnet (monitoring) | Break stories into tasks, Layer 2 validation | Epic/Story creation |
| **Validator** | Sonnet | Layer 3 validation | Planning, implementation |
| **Task Managers** | Haiku | Spawn workers, track heartbeats | Decision-making, planning |
| **Workers (impl)** | Sonnet | Code implementation, problem-solving | Epic/Story creation |
| **Workers (cmd)** | Haiku | Run commands exactly as specified | ANY decision-making |

**Key Insight:** 
- Opus = Thinks and plans (strategic + stories)
- Sonnet = Implements and validates (code + verification)
- Haiku = Executes commands only (zero decisions)

---

## Story Architect Role Design

### Purpose
The Story Architect is a specialized Opus agent that:
1. Receives Epics from Person Manager
2. Breaks them into comprehensive User Stories
3. Creates detailed Acceptance Criteria with Given/When/Then
4. Maps ALL contingencies (what could go wrong)
5. Maps ALL dependencies (what blocks what)
6. Produces "implementation-ready" story files

### Why a Separate Role?
- **Focus:** Epic/Story creation requires deep thinking about edge cases
- **Expertise:** Learns patterns of good story architecture over time
- **Quality:** Dedicated review cycles catch missing scenarios
- **Separation:** Keeps Person Manager focused on strategic planning

### Identity Location
`scheduler/story-architect/IDENTITY.md`

### Invocation Method
**Via Claude Code CLI** (separate process, not a sub-agent)
```bash
claude --model opus -p "You are the Story Architect. Read ~/clawd/scheduler/story-architect/IDENTITY.md..."
```

**Why Claude Code?**
- Separate process — no sub-agent nesting constraints
- Can spawn unlimited researchers and reviewers
- On-demand — only runs when Person Manager has epics
- Full Opus reasoning for comprehensive story architecture

### Sub-Agents Story Architect Can Spawn
1. **Researchers** (Sonnet) — Gather codebase context, domain knowledge, technical constraints
2. **Reviewers** (Opus/Sonnet) — Challenge stories, find missing edge cases

### Inbox
`scheduler/inboxes/story-architect/`

### Notes
`scheduler/story-architect/notes/`

---

## Flow: Project → Epic → Story → Task

```
┌─────────────────────────────────────────────────────────────────────────┐
│ LEVEL 0: PROJECT REQUEST                                                │
│ Aaron says: "Build feature X"                                           │
└─────────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ LEVEL 1: PERSON MANAGER (Opus)                                          │
│ Creates: MASTER PLAN + EPICS                                            │
│                                                                         │
│ Epic: [{EPIC-ID}] {Feature Area}                                        │
│ - High-level description                                                │
│ - Business value                                                        │
│ - Success metrics                                                       │
│ - Timeline estimates                                                    │
│ - CONTINGENCIES (what could go wrong at epic level)                     │
│ - DEPENDENCIES (other epics, external factors)                          │
│                                                                         │
│ Output: docs/plans/{project}/epics/{EPIC-ID}.md                         │
└─────────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ LEVEL 2: STORY ARCHITECT (Opus via Claude Code) ← NEW                   │
│ Input: Epic from Person Manager                                         │
│ Invoked: Via Claude Code CLI (separate process, unlimited sub-agents)   │
│                                                                         │
│ STEP 1: Spawn RESEARCHERS (Sonnet)                                      │
│ - Codebase patterns, technical constraints                              │
│ - Domain knowledge, best practices                                      │
│ - Security, accessibility, performance considerations                   │
│                                                                         │
│ STEP 2: Create USER STORIES with full Acceptance Criteria               │
│ Story: [{US-ID}] {Specific Capability}                                  │
│ - As a / I want / So that                                               │
│ - AC-1: Given/When/Then + validation method                             │
│ - AC-N: Given/When/Then + validation method                             │
│ - CONTINGENCIES (edge cases, error scenarios, what if X fails)          │
│ - DEPENDENCIES (other stories, technical prerequisites)                 │
│ - Technical notes from research                                         │
│                                                                         │
│ STEP 3: Spawn REVIEWERS (Opus/Sonnet)                                   │
│ - Challenge: Are ALL edge cases covered?                                │
│ - Challenge: Are CONTINGENCIES complete?                                │
│ - Challenge: Are DEPENDENCIES mapped?                                   │
│ - Challenge: Are ACs testable?                                          │
│                                                                         │
│ Output: scheduler/stories/{project}/stories/{US-ID}.md                  │
└─────────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ LEVEL 3: COORDINATOR (Opus planning / Sonnet monitoring)                │
│ Input: Approved User Stories                                            │
│ Creates: SUB-TASKS (still User Story format)                            │
│                                                                         │
│ Sub-Task: [{TASK-ID}] {Implementation Step}                             │
│ - References parent US-ID                                               │
│ - Subset of parent's ACs                                                │
│ - Explicit implementation instructions                                  │
│ - CONTINGENCIES (implementation risks, technical gotchas)               │
│ - DEPENDENCIES (other sub-tasks, shared code)                           │
│ - Model requirement (Sonnet for impl, Haiku for commands)               │
│                                                                         │
│ Output: PROACTIVE-JOBS.md entries OR scheduler/tasks/{project}/         │
└─────────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ LEVEL 4: WORKERS (Sonnet implementation, Haiku commands)                │
│ Input: Sub-task with explicit instructions                              │
│ Executes: The implementation                                            │
│                                                                         │
│ For EACH AC:                                                            │
│ - Perform Given setup                                                   │
│ - Execute When action                                                   │
│ - Verify Then result                                                    │
│ - Take screenshot                                                       │
│                                                                         │
│ Output: Code + validation report referencing Story ACs                  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Contingency Framework (MANDATORY)

### What is a Contingency?

A contingency is: **"If X happens, then we will Y"**

Every planning artifact (Epic, Story, Task) MUST answer:
1. **What could go wrong?** (technical failures, edge cases, external deps)
2. **What are the fallback options?** (alternative approaches)
3. **What are the blockers?** (things that would stop us completely)
4. **How do we detect problems early?** (warning signs)

### Contingency Levels

| Level | Example Contingencies |
|-------|----------------------|
| **Epic** | Third-party API unavailable, scope creep, timeline risk |
| **Story** | Edge cases (empty state, error state, timeout), auth failures |
| **Task** | Build fails, test flaky, dependency not installed |

### Contingency Template Section

```markdown
## Contingencies

### What Could Go Wrong
| Risk | Likelihood | Impact | Detection | Mitigation |
|------|------------|--------|-----------|------------|
| {risk} | H/M/L | H/M/L | {how we know} | {what we do} |

### Fallback Options
- Option A: {description}
- Option B: {description}

### Blockers (would stop us completely)
- {blocker 1}: Mitigation = {approach}
- {blocker 2}: Mitigation = {approach}

### Early Warning Signs
- {signal that something is going wrong}
```

---

## Dependency Framework (MANDATORY)

### What is a Dependency?

A dependency is: **"X cannot start/complete until Y is done"**

Every planning artifact MUST document:
1. **Upstream dependencies** — What must be done before this?
2. **Downstream dependents** — What is waiting for this?
3. **External dependencies** — Third parties, APIs, services
4. **Parallel work** — What can happen simultaneously?

### Dependency Visualization

```markdown
## Dependencies

### Dependency Graph
```
[US-001] Auth ────┬───► [US-003] User Profile
                  │
[US-002] Database ┘

[US-004] UI Framework (parallel - no deps)
```

### Upstream (Must Complete First)
| Dependency | Status | Blocker? |
|------------|--------|----------|
| {dep} | done/in-progress/pending | yes/no |

### Downstream (Waiting on This)
| Dependent | Impact if Delayed |
|-----------|-------------------|
| {dep} | {impact} |

### External Dependencies
| External | Status | Fallback |
|----------|--------|----------|
| {service} | {status} | {alternative} |
```

---

## Updated Templates

### Epic Template (Updated)
- Add: Contingencies section (epic-level risks)
- Add: Dependencies section (epic-level deps)
- Add: Scope boundaries (what's NOT included)

### User Story Template (Updated)
- Add: Contingencies section (edge cases, error scenarios)
- Add: Dependencies section (other stories, technical prereqs)
- Add: Out of Scope (explicit exclusions)
- Add: Review checklist (for Story Architect review)

### Task Template (Updated)
- Add: Contingencies section (implementation risks)
- Add: Dependencies section (other tasks)
- Add: Rollback plan (how to undo if it breaks things)

---

## Implementation Phases

### Phase 1: Create Story Architect Role
- Create `scheduler/story-architect/` directory structure
- Write IDENTITY.md for Story Architect
- Set up inbox and notes directories
- Add to registry.json

### Phase 2: Update Templates
- Update EPIC-TEMPLATE.md with Contingencies + Dependencies
- Update USER-STORY-TEMPLATE.md with full sections
- Create SUB-TASK-TEMPLATE.md for Coordinator's use
- Add review checklists to each template

### Phase 3: Update Existing Identities
- Person Manager: Clarify epic-level responsibility
- Coordinator: Remove story creation, add sub-task creation
- Workers: Clarify Sonnet vs Haiku split

### Phase 4: Update Documentation
- Update PLANNING-SYSTEM.md with new flow
- Update AGENTS.md with new hierarchy
- Create STORY-ARCHITECTURE.md comprehensive guide

### Phase 5: Create Example
- Create example Epic → Stories → Tasks for Melo v2
- Show full contingency and dependency mapping
- Demonstrate validation against ACs

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Story Architect becomes bottleneck | High | Can run parallel reviews, PM can assist |
| Too much planning overhead | Medium | Right-size: small tasks don't need full stories |
| Templates too complex | Medium | Start simple, add sections as needed |
| Agents don't follow new process | High | Enforce in cron checks, reject non-compliant work |

---

## Timeline

| Phase | Description | Est. Duration |
|-------|-------------|---------------|
| 1 | Create Story Architect Role | 30 min |
| 2 | Update Templates | 30 min |
| 3 | Update Existing Identities | 30 min |
| 4 | Update Documentation | 30 min |
| 5 | Create Example | 30 min |

**Total: ~2.5 hours**

---

## Review Questions

Before approving, consider:
1. Is the Story Architect role clearly differentiated from Person Manager?
2. Are contingency requirements comprehensive but not burdensome?
3. Is the dependency mapping approach practical?
4. Will this slow down small tasks unnecessarily?
5. Are model assignments correct (Opus/Sonnet/Haiku)?

---

*Version 1 — Ready for review*
