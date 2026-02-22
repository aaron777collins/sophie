# Planning System — Iterative Refinement Before Execution

> **"Perfect plans make perfect execution. Plan first, work second."**
> 
> **Enhanced with Testing-First Methodology — February 2026**

## Why This Exists

### The Problems
1. **Context rot** — Single agents lose coherence as conversations grow
2. **Small context windows** — No agent can hold an entire complex project
3. **Execution errors** — Workers making decisions = workers making mistakes
4. **Wasted cycles** — Redoing work because the plan was bad
5. **Validation failures** — Tasks completed without proper testing and evidence
6. **Incomplete acceptance criteria** — User stories without testable outcomes

### The Solution
**Iterative planning with mandatory testing requirements and multiple reviewers before any execution begins.**

> 📚 **FOUNDATION:** All planning work must align with the testing requirements established in `AGENTS.md` and follow the template structure defined in `docs/templates/PROACTIVE-JOBS-TEMPLATE.md`.

Each level of the hierarchy refines the plan. By the time work starts, the plan is:
- Comprehensive (nothing missed)
- Reviewed by multiple perspectives
- Broken into executable chunks
- **Validated with comprehensive testing requirements**
- **Equipped with acceptance criteria and test evidence plans**
- Clear enough that Haiku can follow it

---

## 🧪 Testing-First Planning Approach (MANDATORY)

> **CRITICAL POLICY:** No user story is approved without tests. No task is scheduled without a testing plan. No validation layer passes without test evidence.

### TDD Methodology Integration
All planning work follows **Test-Driven Development** approach:

1. **RED Phase** — Write validation tests for planning artifacts (should fail initially)
2. **GREEN Phase** — Create plans that make validation tests pass
3. **REFACTOR Phase** — Improve plan clarity while keeping validation green

### Quality Gates for Planning Approval
Every planning artifact must pass these quality gates — **approval criteria mandatory**:

| Gate | Requirement | Cannot Approve Without |
|------|------------|-------------------------|
| **Test Strategy** | Testing approach defined upfront | Testing framework specification |
| **Test Evidence** | Evidence collection plan documented | Screenshots, logs, coverage requirements |
| **Test Validation** | Validation method specified | Independent test validation approval |
| **Comprehensive Coverage** | All acceptance criteria testable | Test cases for every AC |

**⚠️ CRITICAL:** Cannot approve any planning artifact without test validation approval. All approval processes must include comprehensive test coverage validation.

### Testing Framework Integration Planning
Planning must specify which testing frameworks will be used:

- **Jest** — Unit and integration testing for JavaScript/Node.js
- **Playwright** — End-to-end testing for web applications  
- **Cypress** — UI testing and user workflow validation
- **Validation Scripts** — Documentation and structure validation
- **Manual Testing** — When automated testing is not feasible

### Test Environment Setup Requirements
Phase planning must include test environment considerations — **testing setup mandatory**:

- **Test Infrastructure** setup and maintenance planning
- **Test Data** management and lifecycle strategy  
- **Test Environment** provisioning and configuration
- **Test Automation** pipeline integration
- **Testing Setup** requirements for framework integration
- **Test Setup** automation and deployment strategies

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
│  │ Input: Project request from Aaron                                   │ │
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
STEP 1.5: STORY ARCHITECT Creates User Stories (Enhanced with Testing — Feb 2026)
┌──────────────────────────────────────────────────────────────────────────┐
│  Story Architect (Opus via Claude Code CLI)                              │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ Input: Epic from Person Manager                                     │ │
│  │ Invocation: claude --model opus (separate process)                  │ │
│  │                                                                     │ │
│  │ PHASE 1: Spawn RESEARCHERS (Sonnet)                                 │ │
│  │ - Codebase patterns and existing implementations                    │ │
│  │ - Domain knowledge and best practices                               │ │
│  │ - Technical constraints and dependencies                            │ │
│  │ - Testing frameworks and validation approaches                      │ │
│  │ - Implementation constraints affecting testability                  │ │
│  │                                                                     │ │
│  │ PHASE 2: Create User Stories (MANDATORY TESTING INTEGRATION)        │ │
│  │ - As a / I want / So that (user story format mandatory)             │ │
│  │ - Acceptance Criteria (Given/When/Then format MANDATORY)            │ │
│  │   • Each AC must specify Test Method (testing framework)            │ │
│  │   • Each AC must specify Evidence Required (screenshots/logs)       │ │
│  │ - Testing Requirements Section (MANDATORY)                          │ │
│  │   • TDD Approach specification (Red → Green → Refactor)             │ │
│  │   • Testing Framework selection (Jest/Playwright/Cypress/etc)       │ │
│  │   • Test Files to Create with purpose                               │ │
│  │   • Performance Criteria when applicable                            │ │
│  │ - CONTINGENCIES (what could go wrong + mitigations) MANDATORY       │ │
│  │ - DEPENDENCIES (upstream/downstream/external) MANDATORY             │ │
│  │ - Technical notes from research                                     │ │
│  │                                                                     │ │
│  │ PHASE 3: Spawn REVIEWERS (Opus/Sonnet) — ENHANCED VALIDATION        │ │
│  │ - Challenge edge cases, contingencies, dependencies                 │ │
│  │ - Validate testing approach and framework selection                 │ │
│  │ - Review acceptance criteria for testability                        │ │
│  │ - Verify test evidence requirements are comprehensive               │ │
│  │ - Story review mandatory — iterate until complete                   │ │
│  │ - Multiple perspectives required for thorough validation            │ │
│  │                                                                     │ │
│  │ ⚠️ VALIDATION CHECKPOINT: NO USER STORY WITHOUT TESTS               │ │
│  │ - Cannot approve story without testing plan                         │ │
│  │ - Cannot approve story without testable acceptance criteria         │ │
│  │ - Cannot approve story without validation method documentation      │ │
│  │                                                                     │ │
│  │ Output: scheduler/stories/{project}/stories/{US-ID}.md              │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│  Why Claude Code?                                                        │
│  │ - Separate process (not a sub-agent)                                    │
│  │ - Can spawn unlimited researchers + reviewers                           │
│  │ - On-demand invocation when epics are ready                             │
│  │ - Full Opus reasoning power for comprehensive story architecture        │
└──────────────────────────────────────────────────────────────────────────┘
                              ↓
STEP 2: L2 Breaks Down Into Sub-Tasks (Enhanced with Testing — Feb 2026)
┌──────────────────────────────────────────────────────────────────────────┐
│  Coordinator (Opus/Sonnet)                                               │
│  NOTE: Coordinator now receives User Stories, not Epics                  │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ Input: Approved Master Plan v2 + User Stories with Testing Plans    │ │
│  │ Output: Phase Breakdown Plan (TESTING ENHANCED)                     │ │
│  │ - Each phase with clear boundaries                                  │ │
│  │ - Dependencies between phases                                       │ │
│  │ - Task categories within each phase                                 │ │
│  │ - Model requirements per task type                                  │ │
│  │ - Phase testing considerations (MANDATORY)                          │ │
│  │   • Test infrastructure requirements per phase                      │ │
│  │   • Test environment setup and configuration                        │ │
│  │   • Testing framework integration planning                          │ │
│  │   • Test data management and lifecycle                              │ │
│  │ - 3-Layer Validation workflow integration                           │ │
│  │   • Layer 1: Self-Validation requirements                           │ │
│  │   • Layer 2: Manager Validation checkpoints                         │ │
│  │   • Layer 3: Independent Validation protocols                       │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                              ↓                                           │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ Spawn: Breakdown Reviewer (Sonnet/Opus) — ENHANCED VALIDATION       │ │
│  │ Task: Review phase breakdown, check for gaps, validate dependencies │ │
│  │ - Verify testing plans are comprehensive and feasible               │ │
│  │ - Validate testing framework integration is realistic               │ │
│  │ - Check that 3-layer validation workflow is properly planned        │ │
│  │ - Ensure test environment requirements are documented               │ │
│  │ Output: Review notes + suggested changes + testing validation       │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                              ↓                                           │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ Coordinator incorporates feedback → Phase Plan v2                   │ │
│  │ Sends back to Person Manager for final approval                     │ │
│  │ ⚠️ VALIDATION CHECKPOINT: Testing strategy must be approved         │ │
│  └────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
                              ↓
STEP 3: L3 Creates Executable Task Lists (Testing Plans MANDATORY — Feb 2026)
┌──────────────────────────────────────────────────────────────────────────┐
│  Task Managers (Sonnet)                                                  │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ Input: Approved Phase Plan with Testing Strategy                    │ │
│  │ Output: Detailed Task Lists for PROACTIVE-JOBS.md (TESTING READY)   │ │
│  │ - Each task with explicit instructions                              │ │
│  │ - File paths, function signatures, patterns to follow               │ │
│  │ - Success criteria (checkboxes) — MUST BE TESTABLE                  │ │
│  │ - Dependencies mapped                                               │ │
│  │ - Testing Plans (MANDATORY for every task)                          │ │
│  │   • Test files to create (with .test.js/.spec.js naming)            │ │
│  │   • Testing framework specification                                 │ │
│  │   • Validation steps for manual verification                        │ │
│  │   • Test evidence collection requirements                           │ │
│  │ - Validation Checklist (3-layer workflow integration)               │ │
│  │   • Layer 1: Self-validation with test evidence                     │ │
│  │   • Layer 2: Manager validation of test quality                     │ │
│  │   • Layer 3: Independent validation with test execution             │ │
│  │ - PROACTIVE-JOBS-TEMPLATE.md format alignment (MANDATORY)           │ │
│  │   • Testing Requirements section                                    │ │
│  │   • Acceptance criteria with Given-When-Then format                 │ │
│  │   • Test Method and Evidence Required for each AC                   │ │
│  │   • TDD approach specification                                      │ │
│  └────────────────────────────────────────────────────────────────────┘ │
│                              ↓                                           │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ Tasks are SO CLEAR that Haiku can execute without decisions         │ │
│  │ BUT comprehensive enough that testing validation is built-in        │ │
│  │ ⚠️ NO TASK WITHOUT TESTING PLAN — Tasks rejected without tests      │ │
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

## 💜 The Circle in Planning

**Use The Circle during planning for critical thinking:**

| Planning Stage | Minimum Circle | Required Perspectives |
|----------------|----------------|----------------------|
| Master Plan | 🟡 Standard | Pragmatist, Skeptic, Guardian |
| Phase Breakdown | 🟢 Light | Pragmatist, Skeptic |
| Task Definition | 💭 Internal | Quick sanity check |
| Architecture Decisions | 🟠 Elevated | Full critical + empathy |
| Major Pivots | 🔴 Council | All perspectives |

**Key perspectives for planning:**
- 🔧 **Pragmatist** — Is this realistic? What resources needed?
- 🔍 **Skeptic** — What could go wrong? What are we missing?
- 🛡️ **Guardian** — Security implications? Risk assessment?

**Think about the realistic end goal.** "Done" for a project includes:
1. Implementation complete
2. Tests pass
3. Validated manually
4. Merged/committed
5. Pushed to remote
6. Deployed (where applicable)
7. Verified working in production (where applicable)

All of these should be considered when planning, not just "write the code."

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

### Task Definition (L3) — ENHANCED WITH TESTING REQUIREMENTS

Location: `PROACTIVE-JOBS.md` (MUST follow `docs/templates/PROACTIVE-JOBS-TEMPLATE.md` structure)

```markdown
### {task-id} — {brief-description}
- **Status:** pending
- **Parent:** {phase-id}
- **Min Model:** {sonnet|opus|haiku}
- **Description:** {ONE clear sentence describing the task}
- **Files to Modify:**
  - CREATE: `path/to/new/file.ts`
  - MODIFY: `path/to/existing/file.ts`
  - CREATE: `tests/{task-name}.test.js` ← TEST FILE MANDATORY
- **Instructions:**
  1. {Explicit step 1 with file paths}
  2. {Explicit step 2 with code patterns}
  3. {Explicit step 3}

## Acceptance Criteria (MANDATORY — Given-When-Then Format)

### AC-1: {primary-outcome-title}
**Given** {precondition-state}
**When** {action-or-trigger}
**Then** {expected-result}
**Test Method:** {Jest/Playwright/validation-script/manual-verification}
**Evidence Required:** {screenshots/test-output/logs/coverage-reports}

### AC-2: {secondary-outcome-title}
**Given** {precondition-state}
**When** {action-or-trigger}
**Then** {expected-result}
**Test Method:** {testing-framework-and-approach}
**Evidence Required:** {specific-artifacts-needed}

## Testing Requirements (MANDATORY)

### TDD Approach
- **RED:** Write tests FIRST (before implementation)
- **GREEN:** Implement just enough to make tests pass
- **REFACTOR:** Improve code while keeping tests green

### Testing Strategy
- **Testing Framework:** {Jest/Playwright/Cypress/validation-scripts}
- **Test Types:** {unit/integration/e2e/validation/manual}
- **Coverage Requirements:** {minimum-percentage-if-applicable}
- **Performance Criteria:** {response-times-load-requirements}

### Test Files to Create
- `{test-file-1.js}` — {purpose}
- `{test-file-2.js}` — {purpose}
- `{validation-script.js}` — {purpose}

### Validation Steps (MANDATORY)
1. Execute test suite — all tests must pass
2. Run validation scripts — structure checks must pass
3. Collect test evidence — screenshots, logs, coverage reports
4. Verify acceptance criteria — each AC validated with test method
5. Document test results — evidence required for approval

## Validation Checklist (3-Layer Validation Workflow)

### Layer 1: Self-Validation (Worker) ✅/❌
- [ ] Tests written BEFORE implementation (TDD RED phase)
- [ ] All tests pass (TDD GREEN phase)
- [ ] Code/content meets all acceptance criteria
- [ ] Test evidence collected and documented
- [ ] Testing framework properly implemented
- [ ] Performance criteria met (if applicable)

### Layer 2: Manager Validation (Coordinator) ✅/❌
- [ ] Verify test evidence provided and valid
- [ ] Confirm tests actually validate acceptance criteria
- [ ] Check test coverage is adequate
- [ ] Validate testing framework usage

### Layer 3: Independent Validation (Validator) ✅/❌
- [ ] Run tests independently to confirm results
- [ ] Verify test quality and comprehensiveness
- [ ] Check for missed edge cases
- [ ] Validate end-to-end functionality

## Test Evidence
- **Test Results:** {link-to-test-output-or-paste-results}
- **Coverage Report:** {coverage-percentage-and-details}
- **Screenshots:** {if-UI-changes-screenshot-paths}

#### 🚀 Completion Actions
- [ ] Git commit with descriptive message
- [ ] Push to remote
- [ ] Deploy (if applicable)
- [ ] Update task progress with test evidence
- [ ] Update project memory with testing results

- **Context:**
  - Pattern to follow: {link or description}
  - Testing approach: {specific framework setup}
  - Don't do: {anti-pattern to avoid}
```

**⚠️ MANDATORY POLICIES:**
- **Without acceptance criteria:** Task cannot be scheduled
- **Without testing plan:** Task will be rejected by managers
- **Without test evidence:** Task cannot claim completion

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
- [ ] Testing requirements are mandatory
- [ ] Validation checklist is complete
- [ ] A Haiku agent could follow this without decisions

---

## User Story Format Examples (MANDATORY TEMPLATE)

### Complete User Story Structure

```markdown
## Story
**As a** project coordinator
**I want** to validate that all tasks have comprehensive testing requirements
**So that** the system ensures quality and reduces validation failures

## Acceptance Criteria

### AC-1: Testing Requirements Validation
**Given** a task is submitted to PROACTIVE-JOBS.md
**When** the task is reviewed by a coordinator
**Then** the expected result is that the task must include a Testing Requirements section with TDD approach, testing framework, and test files specification
**Test Method:** validation script checking for required sections and content
**Evidence Required (mandatory):** test output showing all validation checks pass

### AC-2: 3-Layer Validation Workflow Integration
**Given** a task has passed self-validation (Layer 1)
**When** the task moves to manager validation (Layer 2) 
**Then** the expected result is that the manager must verify test evidence before approving
**Test Method:** integration test with sample task validation workflow  
**Evidence Required (mandatory):** screenshots of validation checkpoints and test results verification

## Testing Requirements (MANDATORY)

### TDD Approach
- **RED:** Write validation script that checks for required sections (should fail initially)
- **GREEN:** Add required sections to make validation script pass  
- **REFACTOR:** Improve section clarity and consistency while keeping tests green

### Testing Strategy
- **Testing Framework:** Node.js validation scripts with file system checks
- **Test Types:** Structure validation, content verification, format consistency
- **Coverage Requirements:** All mandatory sections must be present and properly formatted
- **Performance Criteria:** Validation script should complete in under 5 seconds

### Test Files to Create
- `tests/planning-system-validation.js` — Validates planning system requirements
- `tests/user-story-format-validation.js` — Ensures user story formatting standards
- `tests/integration-workflow-test.js` — Tests planning workflow integration

## CONTINGENCIES (MANDATORY)
- **Risk:** Existing tasks don't follow new format → **Mitigation:** Gradual migration with validation script guidance
- **Risk:** Testing overhead slows planning → **Mitigation:** Template automation and validation tools
- **Risk:** Story review process bottlenecks → **Mitigation:** Multiple reviewers and parallel review spawning

## DEPENDENCIES (MANDATORY)
- **Upstream:** AGENTS.md testing requirements must be established first
- **Downstream:** Task Managers must be trained on new validation requirements
- **External:** Testing frameworks must be available and configured in workspace
```

### No Story Without Tests Policy

```
┌─────────────────────────────────────────────────────────────────────┐
│                    NO USER STORY = NO TASK ASSIGNMENT               │
│                    NO ACCEPTANCE CRITERIA = NO VALIDATION           │
│                    NO TESTS = NO COMPLETION                         │
└─────────────────────────────────────────────────────────────────────┘
```

**Enforcement:**
- **Test strategy upfront:** Every user story must define testing approach before implementation begins
- **Testing plan mandatory:** No task scheduling without comprehensive testing plan
- **Validation method documented:** Each acceptance criterion must specify how it will be validated
- **Evidence collection requirements:** Specific artifacts required for each validation layer

---

## When Planning Happens

### New Project
1. Aaron requests project
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
