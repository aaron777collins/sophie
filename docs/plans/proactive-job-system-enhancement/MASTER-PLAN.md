# Master Plan: Proactive Job System Enhancement & Sophie's Workflow Improvement

**Created:** 2026-02-27
**Author:** Sophie (L0)
**Version:** 1
**Status:** approved (direct request from Aaron)

## Executive Summary

Enhance the proactive job system to make acceptance criteria and proper testing a **mandatory default** for every phase of implementation. Apply this same testing and validation mentality to Sophie's own work. Integrate The Circle and The Counsel for critical thinking during planning. Ensure validation, testing, merging, pushing, and deploying are considered default actions for all work.

## Goals

1. **Mandatory testing** — Every task must include acceptance criteria and validation steps by default
2. **Full lifecycle thinking** — Jobs should consider validation, merge, push, deploy as standard phases
3. **Critical thinking integration** — Use The Circle for planning, The Counsel for critical decisions
4. **Sophie's workflow upgrade** — Apply the same rigor to Sophie's direct work
5. **Realistic end goals** — Think critically about what "done" actually means

## Success Criteria

- [ ] AGENTS.md updated with mandatory testing requirements
- [ ] PROACTIVE-JOBS.md template updated with testing sections
- [ ] Task Manager IDENTITY.md updated with validation requirements
- [ ] Sophie's IDENTITY.md updated with validation-first workflow
- [ ] Planning system docs updated to require acceptance criteria
- [ ] Verification system enhanced with testing phase
- [ ] Worker IDENTITY.md updated to require validation before claiming complete
- [ ] The Circle integrated into planning workflow
- [ ] Documentation complete and clear
- [ ] Changes tested and validated

## Technical Approach

### 1. Mandatory Task Structure

Every task in PROACTIVE-JOBS.md must have:

```markdown
### task-id
- **Status:** pending
- **Model:** {model}
- **Description:** {description}

#### 📋 Acceptance Criteria (MANDATORY)
- [ ] {Specific, testable criterion 1}
- [ ] {Specific, testable criterion 2}
- [ ] Build passes
- [ ] Tests pass (existing + new if applicable)

#### 🧪 Validation Steps (MANDATORY)
1. {How to verify criterion 1}
2. {How to verify criterion 2}
3. Run: `pnpm build` — must exit 0
4. Run: `pnpm test` — must pass

#### 🚀 Completion Actions (where applicable)
- [ ] Changes committed with descriptive message
- [ ] Branch merged (or PR created)
- [ ] Changes pushed to remote
- [ ] Deployed (if applicable)
- [ ] Verified in production (if applicable)
```

### 2. Phase Lifecycle Enhancement

Every implementation phase must include:

1. **Planning** — What we're building, acceptance criteria defined
2. **Implementation** — Actual work
3. **Testing** — Run all tests, verify acceptance criteria
4. **Validation** — Manual verification, edge case checks
5. **Merge** — PR or direct merge with proper commit messages
6. **Push** — Push to remote repository
7. **Deploy** — Deploy to target environment (if applicable)
8. **Verify** — Confirm working in production (if applicable)

### 3. The Circle Integration

**Planning Phase:**
- Use 🟡 Standard Circle for phase planning
- Use 🟠 Elevated Circle for architecture decisions
- Use 🔴 Counsel for major strategic decisions

**Required Circle perspectives for planning:**
- 🔧 **Pragmatist** — Is this realistic? What resources needed?
- 🔍 **Skeptic** — What could go wrong? What are we missing?
- 🛡️ **Guardian** — Security implications? Risk assessment?

### 4. Sophie's Workflow Enhancement

Sophie's IDENTITY.md will include:

```markdown
## Default Work Behaviors

### Before Starting Any Task
1. Define acceptance criteria (what does "done" look like?)
2. Consider testing approach (how will I verify this works?)
3. Use The Circle (at least 💭 Internal) to think through the approach

### During Implementation
1. Track progress against acceptance criteria
2. Test incrementally, not just at the end
3. Document decisions and changes

### Before Claiming Complete
1. All acceptance criteria met ✅
2. All tests pass ✅
3. Build succeeds ✅
4. Manual validation done ✅
5. Consider: Should this be merged/pushed/deployed?

### Critical Thinking Integration
- Use 💭 Internal Circle for routine decisions
- Use 🟢 Light Circle when stakes are higher
- Escalate to 🟡+ for important decisions
- Use The Counsel for critical, hard-to-reverse decisions
```

## Phases Overview

| Phase | Description | Est. Duration |
|-------|-------------|---------------|
| 1 | Document Updates (AGENTS.md, Planning docs) | 1 hour |
| 2 | PROACTIVE-JOBS.md Template Enhancement | 30 mins |
| 3 | Identity File Updates (Task Manager, Workers) | 1 hour |
| 4 | Sophie's Identity Enhancement | 30 mins |
| 5 | Verification System Updates | 30 mins |
| 6 | Integration Testing & Validation | 1 hour |

**Total Estimate:** 4.5-5 hours

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Overhead slows work | M | Keep requirements minimal but effective |
| Agents ignore new rules | H | Reinforce in Identity files, verify in reviews |
| Testing requirements too vague | M | Provide clear templates and examples |
| Circle overuse wastes tokens | L | Clear guidance on weight levels |

## Document Changes Required

### AGENTS.md Updates
- Add "Testing & Validation" section to Management Hierarchy
- Add mandatory acceptance criteria requirement
- Add Circle integration for planning
- Update task completion requirements

### PROACTIVE-JOBS.md Template
- Add Acceptance Criteria section (required)
- Add Validation Steps section (required)
- Add Completion Actions section (standard)

### docs/PLANNING-SYSTEM.md Updates
- Require acceptance criteria in all plans
- Integrate Circle perspectives in planning
- Add validation phase to planning flow

### docs/VERIFICATION-SYSTEM.md Updates
- Add testing verification step
- Require acceptance criteria check
- Add "testing done" to completion evidence

### scheduler/task-managers/IDENTITY.md
- Add validation-first mindset
- Require acceptance criteria before assigning tasks
- Add testing verification to completion checks

### scheduler/workers/IDENTITY.md
- Add "test before claiming done" requirement
- Add acceptance criteria check to completion
- Add validation steps to work log

### IDENTITY.md (Sophie's)
- Add Default Work Behaviors section
- Add Critical Thinking Integration
- Add acceptance criteria workflow

## Deliverables

1. **Updated AGENTS.md** — With testing requirements
2. **Updated Planning System** — With Circle integration
3. **Updated Verification System** — With testing phase
4. **Updated Task Templates** — With mandatory sections
5. **Updated Identity Files** — All levels with validation mindset
6. **Documentation** — Clear guidance on new requirements

## The Circle Analysis (💜 Pre-Planning)

### 🧠 Critical Thinking

**🔧 Pragmatist:**
- Changes are straightforward document updates
- No code changes, low risk
- Can be done incrementally

**🔍 Skeptic:**
- Will agents actually follow new rules?
- Need to make requirements clear, not buried
- Should validate the changes work in practice

**🛡️ Guardian:**
- No security implications
- Risk of breaking existing workflows minimal
- Need to preserve what works

### 💜 Empathy

**Impact on workflow:**
- Adds small overhead per task
- But prevents much larger rework
- Should feel helpful, not bureaucratic

**→ Decision:** Proceed with clear, minimal requirements that provide value without excessive overhead.

## Review History

- v1: 2026-02-27 — Initial plan created by Sophie (direct Aaron request)
