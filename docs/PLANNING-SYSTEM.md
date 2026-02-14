# Planning System — Iterative Refinement Before Execution

> **"Perfect plans make perfect execution. Plan first, work second."**

## Why This Exists

### The Problems
1. **Context rot** — Single agents lose coherence as conversations grow
2. **Small context windows** — No agent can hold an entire complex project
3. **Execution errors** — Workers making decisions = workers making mistakes
4. **Wasted cycles** — Redoing work because the plan was bad

### The Solution
**Iterative planning with multiple reviewers before any execution begins.**

Each level of the hierarchy refines the plan. By the time work starts, the plan is:
- Comprehensive (nothing missed)
- Reviewed by multiple perspectives
- Broken into executable chunks
- Clear enough that Haiku can follow it

---

## The Planning Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PLANNING PHASE                                   │
│         (No execution until plan is approved at all levels)             │
└─────────────────────────────────────────────────────────────────────────┘

STEP 1: L1 Creates Master Plan
┌──────────────────────────────────────────────────────────────────────────┐
│  Person Manager (Opus)                                                   │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ Input: Project request from human                                   │ │
│  │ Output: Comprehensive Master Plan v1                                │ │
│  │ - Goals and success criteria                                        │ │
│  │ - High-level phases                                                 │ │
│  │ - Technical approach                                                │ │
│  │ - Risk assessment                                                   │ │
│  │ - Timeline estimate                                                 │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                              ↓                                           │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ Spawn: Plan Reviewer (Sonnet/Opus)                                  │ │
│  │ Task: Review Master Plan, find gaps, suggest improvements           │ │
│  │ Output: Review notes + suggested changes                            │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                              ↓                                           │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ Person Manager incorporates feedback → Master Plan v2               │ │
│  │ Repeat review cycle until satisfied (usually 1-2 rounds)            │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
                              ↓
STEP 2: L2 Breaks Down Into Phases
┌──────────────────────────────────────────────────────────────────────────┐
│  Coordinator (Opus/Sonnet)                                               │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ Input: Approved Master Plan v2                                      │ │
│  │ Output: Phase Breakdown Plan                                        │ │
│  │ - Each phase with clear boundaries                                  │ │
│  │ - Dependencies between phases                                       │ │
│  │ - Task categories within each phase                                 │ │
│  │ - Model requirements per task type                                  │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                              ↓                                           │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ Spawn: Breakdown Reviewer (Sonnet/Opus)                             │ │
│  │ Task: Review phase breakdown, check for gaps, validate dependencies │ │
│  │ Output: Review notes + suggested changes                            │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                              ↓                                           │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ Coordinator incorporates feedback → Phase Plan v2                   │ │
│  │ Sends back to Person Manager for final approval                     │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
                              ↓
STEP 3: L3 Creates Executable Task Lists
┌──────────────────────────────────────────────────────────────────────────┐
│  Task Managers (Sonnet)                                                  │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ Input: Approved Phase Plan                                          │ │
│  │ Output: Detailed Task Lists for PROACTIVE-JOBS.md                   │ │
│  │ - Each task with explicit instructions                              │ │
│  │ - File paths, function signatures, patterns to follow               │ │
│  │ - Success criteria (checkboxes)                                     │ │
│  │ - Dependencies mapped                                               │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                              ↓                                           │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ Tasks are SO CLEAR that Haiku can execute without decisions         │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────────┐
│                        EXECUTION PHASE                                   │
│              (Plan is locked, workers just execute)                     │
└─────────────────────────────────────────────────────────────────────────┘
                              ↓
STEP 4: L4 Executes Tasks
┌──────────────────────────────────────────────────────────────────────────┐
│  Workers (Haiku/Sonnet)                                                  │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ Input: Explicit task from PROACTIVE-JOBS.md                         │ │
│  │ Output: Completed work + progress file update                       │ │
│  │ - Follow instructions exactly                                       │ │
│  │ - No design decisions (already made in plan)                        │ │
│  │ - Report blockers up, don't solve around them                       │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Model Requirements for Planning

| Activity | Minimum Model | Preferred |
|----------|---------------|-----------|
| Master Plan creation | Opus | Opus |
| Master Plan review | Sonnet | Opus |
| Phase breakdown | Sonnet | Opus |
| Phase review | Sonnet | Opus |
| Task list creation | Sonnet | Sonnet |
| Task execution | Haiku | Sonnet (complex) |

**Rule: No Haiku for planning. Ever. Planning requires reasoning.**

---

## Plan Document Formats

### Master Plan (L1)

Location: `docs/plans/{project}/MASTER-PLAN.md`

```markdown
# Master Plan: {Project Name}

**Created:** {date}
**Author:** Person Manager
**Version:** {n}
**Status:** draft | in-review | approved

## Executive Summary
{2-3 sentences on what we're building and why}

## Goals
1. {Primary goal}
2. {Secondary goal}
...

## Success Criteria
- [ ] {Measurable outcome 1}
- [ ] {Measurable outcome 2}
...

## Technical Approach
{High-level architecture and key decisions}

## Phases Overview
| Phase | Description | Est. Duration |
|-------|-------------|---------------|
| 1 | {name} | {time} |
...

## Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| {risk} | {H/M/L} | {strategy} |
...

## Timeline
{Overall timeline with milestones}

## Review History
- v1: {date} - Initial draft
- v2: {date} - Incorporated reviewer feedback: {summary}
```

### Phase Plan (L2)

Location: `docs/plans/{project}/phases/PHASE-{N}.md`

```markdown
# Phase {N}: {Name}

**Parent:** MASTER-PLAN.md
**Created:** {date}
**Author:** Coordinator
**Version:** {n}
**Status:** draft | in-review | approved

## Phase Goals
{What this phase accomplishes}

## Prerequisites
- [ ] {What must be done before this phase starts}

## Task Categories

### {Category 1}
- {task-id-1}: {description} (Model: {haiku/sonnet})
- {task-id-2}: {description} (Model: {haiku/sonnet})

### {Category 2}
...

## Dependencies
```
task-1 ─► task-3
task-2 ─► task-3
task-3 ─► task-4
```

## Deliverables
- [ ] {Concrete output 1}
- [ ] {Concrete output 2}

## Review History
- v1: {date} - Initial breakdown
- v2: {date} - Incorporated reviewer feedback: {summary}
```

### Task Definition (L3)

Location: `PROACTIVE-JOBS.md` (existing format, but MUST be explicit)

```markdown
### {task-id}
- **Status:** pending
- **Parent:** {phase-id}
- **Min Model:** haiku
- **Description:** {ONE clear sentence}
- **Files:**
  - CREATE: `path/to/new/file.ts`
  - MODIFY: `path/to/existing/file.ts`
- **Instructions:**
  1. {Explicit step 1 with file paths}
  2. {Explicit step 2 with code patterns}
  3. {Explicit step 3}
- **Success Criteria:**
  - [ ] {Specific, testable criterion}
  - [ ] Build passes
  - [ ] Lint passes
- **Context:**
  - Pattern to follow: {link or description}
  - Don't do: {anti-pattern to avoid}
```

---

## Review Process

### How Reviews Work

1. **Creator finishes draft** → Saves to file
2. **Creator spawns reviewer** with task:
   ```
   Review {file path}. Look for:
   - Missing requirements
   - Unclear instructions
   - Dependency gaps
   - Unrealistic estimates
   - Technical issues
   
   Output a review with:
   - Issues found (prioritized)
   - Suggested improvements
   - Questions for clarification
   ```
3. **Reviewer outputs feedback** → Saved to `{plan}-review-{n}.md`
4. **Creator incorporates feedback** → Creates v{n+1}
5. **Repeat until satisfied** (usually 1-2 rounds)

### Review Checklist

**For Master Plans:**
- [ ] Goals are clear and measurable
- [ ] Success criteria are testable
- [ ] Technical approach is sound
- [ ] Risks are identified
- [ ] Timeline is realistic
- [ ] Nothing is assumed/implicit

**For Phase Plans:**
- [ ] Phase boundaries are clear
- [ ] Dependencies are mapped
- [ ] Tasks are sized appropriately
- [ ] Model assignments make sense
- [ ] Deliverables are concrete

**For Task Lists:**
- [ ] Instructions are step-by-step
- [ ] File paths are explicit
- [ ] Success criteria are checkboxes
- [ ] A Haiku agent could follow this without decisions

---

## When Planning Happens

### New Project
1. Human requests project
2. Person Manager creates Master Plan
3. Full planning flow before any execution

### Major Pivot
1. Existing approach isn't working
2. Coordinator escalates to Person Manager
3. Master Plan revision + re-review

### New Phase
1. Previous phase completes
2. Coordinator creates Phase Plan for next
3. Review before execution starts

### NOT for small changes
- Bug fixes → Just do them
- Minor tweaks → Task Manager handles
- Clarifications → Worker asks up

---

## Integration with Existing Systems

### PROACTIVE-JOBS.md
- Still the execution queue
- But tasks come FROM approved plans
- No ad-hoc task creation without planning

### Hired Agents
- Planning agents are a special type
- They review, don't execute
- Use The Circle for complex planning decisions

### The Circle/Counsel
- Use for architectural decisions within plans
- Use for resolving reviewer disagreements
- Use when uncertain about approach

---

## Anti-Patterns

❌ **Starting execution without approved plan**
❌ **Skipping reviews to "save time"**
❌ **Using Haiku for any planning work**
❌ **Vague task descriptions** ("implement auth")
❌ **Plans without success criteria**
❌ **Reviewers just saying "looks good"**

---

## Benefits Recap

1. **No context rot** — Fresh reviewers catch what tired agents miss
2. **Distributed intelligence** — Many perspectives improve quality
3. **Clean execution** — Workers follow plans, don't make decisions
4. **Reduced rework** — Good plans = fewer mistakes
5. **Accountability** — Plans are documented, reviewable
6. **Scalability** — Add more reviewers for complex projects
