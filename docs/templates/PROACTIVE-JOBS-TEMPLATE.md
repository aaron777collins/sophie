# PROACTIVE-JOBS Template Structure

**Version:** 2.0 - Enhanced with Testing Requirements  
**Last Updated:** [2026-02-22 13:30 EST]  
**Purpose:** Template structure for proactive job task definitions with mandatory testing and validation

This template establishes the standard structure for all proactive job tasks, incorporating comprehensive testing requirements and validation protocols as defined in AGENTS.md.

---

## Template Usage Guidelines

### When to Use This Template
- Creating new proactive job tasks
- Updating existing tasks to meet testing standards
- Ensuring consistent task documentation across projects

### How to Use This Template
1. **Copy the task template section below**
2. **Fill in all required fields** (marked with `{placeholder}`)
3. **Define acceptance criteria** using Given-When-Then format
4. **Specify testing requirements** including frameworks and validation methods
5. **Follow TDD approach**: Write tests first, then implement
6. **Update status progression** as work progresses through validation layers

### Integration with Existing Workflow
- This template aligns with enhanced AGENTS.md testing requirements
- Tasks must follow the 3-layer validation workflow (Self → Manager → Validator)
- All tasks must include test evidence before claiming completion
- References testing frameworks: Jest, Playwright, Cypress, validation scripts

---

## Task Template Structure

```markdown
## TASK: {task-id} - {brief-description}
**Status:** {pending|in-progress|self-validated|needs-validation|validated|complete}
**Started:** {YYYY-MM-DD HH:MM EST}
**Claimed Complete:** {YYYY-MM-DD HH:MM EST} _(when worker claims done)_
**L2 Validated:** {YYYY-MM-DD HH:MM EST} _(when coordinator approves)_
**L3 Validated:** {YYYY-MM-DD HH:MM EST} _(when validator approves)_
**Worker:** {session-id}
**Git Commit:** {commit-hash}

**Project:** {project-name}
**Phase:** {phase-info}
**Min Model:** {sonnet|opus|haiku}
**Dependencies:** {task-dependencies} ✅/❌/pending
**Assigned:** {worker-id or '-'}

**Description:**
{Detailed description of what needs to be accomplished}

**Files to Modify:**
- {list-of-files-to-change}
- {include-new-files-to-create}

**Specific Changes Needed:**
1. {specific-change-1}
2. {specific-change-2}
3. {specific-change-n}

## Acceptance Criteria

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

### AC-{n}: {additional-criteria-as-needed}
**Given** {precondition-state}
**When** {action-or-trigger}
**Then** {expected-result}
**Test Method:** {testing-approach}
**Evidence Required:** {validation-artifacts}

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
- {test-file-1.js} - {purpose}
- {test-file-2.js} - {purpose}
- {validation-script.js} - {purpose}

## Validation Checklist

### Layer 1: Self-Validation (Worker) ✅/❌
- [ ] Tests written BEFORE implementation (TDD RED phase)
- [ ] All tests pass (TDD GREEN phase)
- [ ] Code/content meets all acceptance criteria
- [ ] Test evidence collected and documented
- [ ] Testing framework properly implemented
- [ ] Performance criteria met (if applicable)
- [ ] Git commit created with descriptive message
- [ ] Task progress file updated with full work log
- [ ] Project memory files updated
- [ ] Status updated to "self-validated"

### Layer 2: Manager Validation (Coordinator) ✅/❌
- [ ] Verify test evidence provided and valid
- [ ] Confirm tests actually validate acceptance criteria  
- [ ] Check test coverage is adequate
- [ ] Validate testing framework usage
- [ ] Review implementation quality
- [ ] Verify integration with existing systems
- [ ] Confirm git commit exists and is proper
- [ ] Status updated to "needs-validation"

### Layer 3: Independent Validation (Validator) ✅/❌
- [ ] Run tests independently to confirm results
- [ ] Verify test quality and comprehensiveness
- [ ] Check for missed edge cases
- [ ] Validate end-to-end functionality
- [ ] Confirm acceptance criteria fully met
- [ ] Final approval and status update to "validated"

## Test Evidence

### Implementation Evidence
- **Test Results:** {link-to-test-output-or-paste-results}
- **Coverage Report:** {coverage-percentage-and-details}
- **Performance Metrics:** {if-applicable-response-times-etc}

### Validation Evidence
- **Screenshots:** {if-UI-changes-screenshot-paths}
- **Integration Tests:** {results-of-integration-testing}
- **Manual Verification:** {checklist-of-manual-checks-performed}

### Files Created/Modified
- {file-path} - {change-summary}
- {test-file-path} - {test-suite-description}

## Reference Materials
- AGENTS.md - Testing and validation requirements
- {project-specific-documentation}
- {related-tasks-or-dependencies}

---

**Validation Checklist (needs Coordinator review):**
- [ ] Task structure follows template format
- [ ] All acceptance criteria defined with Given-When-Then format
- [ ] Testing requirements specified with appropriate frameworks
- [ ] TDD approach documented (Red → Green → Refactor)
- [ ] 3-layer validation workflow included
- [ ] Test evidence sections prepared
- [ ] Status progression includes all validation states
- [ ] Integration points with AGENTS.md documented
```

---

## Status Progression States

Tasks progress through these states with mandatory validation at each layer:

1. **pending** - Task defined but not yet started
2. **in-progress** - Worker actively working on task
3. **self-validated** - Worker completed Layer 1 validation with test evidence
4. **needs-validation** - Ready for Layer 2 (Coordinator) review
5. **validated** - Passed Layer 3 (Independent Validator) review  
6. **complete** - Fully validated and integrated

### Status Change Requirements

| From State | To State | Required Actions |
|------------|----------|------------------|
| pending → in-progress | Worker claims task, creates heartbeat |
| in-progress → self-validated | All tests pass, evidence collected, AC met |
| self-validated → needs-validation | Coordinator verifies test quality |
| needs-validation → validated | Independent validator runs tests |
| validated → complete | Integration confirmed, project updated |

---

## Testing Framework Integration

### For Code Implementation Tasks
- **Jest:** Unit and integration testing for JavaScript/Node.js
- **Playwright:** End-to-end testing for web applications
- **Cypress:** UI testing and user workflow validation
- **Supertest:** API endpoint testing

### For Documentation Tasks
- **Validation Scripts:** Structure and content validation
- **Link Checkers:** Internal and external link validation
- **Format Validators:** Markdown structure and consistency
- **Content Analysis:** Completeness and accuracy checks

### For Infrastructure Tasks
- **Terraform Plan:** Infrastructure change validation
- **Smoke Tests:** Basic functionality verification
- **Integration Tests:** System connectivity validation
- **Performance Tests:** Load and response time validation

### For Content/Media Tasks
- **Accessibility Validation:** WCAG compliance checking
- **Format Validation:** File format and quality standards
- **Content Review:** Accuracy and completeness verification
- **Integration Testing:** Compatibility with existing systems

---

## Examples

### Example Acceptance Criteria Format

```markdown
### AC-1: Documentation Update Validation
**Given** the AGENTS.md file exists and contains task management sections
**When** testing requirements are added to the document structure
**Then** the document should include TDD methodology, testing frameworks, and 3-layer validation
**Test Method:** validation script checking for required sections and content
**Evidence Required:** test output showing all validation checks pass

### AC-2: Template Integration Functionality  
**Given** a new proactive job task is created using this template
**When** the task is processed through the 3-layer validation workflow
**Then** each validation layer should have clear checkpoints and evidence requirements
**Test Method:** integration test with sample task creation and validation
**Evidence Required:** successful task progression through all validation states
```

### Example Testing Requirements Section

```markdown
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
- `tests/template-structure-validation.js` - Validates template sections
- `tests/format-consistency-check.js` - Ensures formatting standards
- `tests/integration-workflow-test.js` - Tests template usage in workflow
```

---

## Template Maintenance

This template should be updated when:
- New testing requirements are added to AGENTS.md
- Validation workflow changes are implemented
- New testing frameworks are adopted
- Status progression states are modified

**Last Review:** [2026-02-22 13:30 EST] by p1-2-a (proactive job system enhancement)  
**Next Review Due:** When Phase 1 validation results are available