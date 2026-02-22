# Test Task Example: Documentation Validation System

> **Purpose:** This comprehensive test task demonstrates ALL template requirements from Phase 1 of the Proactive Job System Enhancement project. It serves as both a validation of the enhanced system and a reference example for future tasks.

---

## TASK: TEST-DOC-VAL-001 - Create Documentation Validation System
**Status:** pending
**Started:** -
**Claimed Complete:** -
**L2 Validated:** -
**L3 Validated:** -
**Worker:** -
**Git Commit:** -

**Project:** Documentation Quality Initiative
**Phase:** Phase 1 - Core Validation Framework
**Min Model:** Sonnet
**Dependencies:** None (root task)
**Assigned:** -

**Description:**
Create a comprehensive documentation validation system that automatically checks markdown files for required sections, formatting consistency, and cross-reference integrity. This system will ensure all project documentation meets quality standards before being merged into the main branch.

The system will include:
- A validation script that checks documentation structure against defined templates
- Integration with the CI/CD pipeline for automated validation
- Clear error reporting with actionable fix suggestions
- Support for multiple documentation types (technical docs, user guides, API references)

This task demonstrates proper task definition following PROACTIVE-JOBS-TEMPLATE.md format, including comprehensive acceptance criteria, TDD methodology, Circle thinking checkpoints, and the 3-layer validation workflow.

**Files to Create/Modify:**
- `scripts/validate-docs.js` - Main validation script
- `scripts/doc-templates/` - Template definition files
- `docs/DOCUMENTATION-STANDARDS.md` - Documentation standards guide
- `tests/doc-validation.test.js` - Validation script tests
- `.github/workflows/doc-validation.yml` - CI integration
- `docs/examples/valid-doc-example.md` - Reference example

**Specific Changes Needed:**
1. Create Node.js validation script with configurable template rules
2. Define template structures for each documentation type
3. Implement section presence validation (required vs optional)
4. Add link checker for internal cross-references
5. Integrate with existing CI/CD pipeline
6. Create comprehensive error reporting with fix suggestions
7. Document all validation rules and standards
8. Add test suite covering all validation scenarios

---

## 🎯 Critical Thinking Checkpoint: Approach Selection

Before implementation, apply Circle analysis per `scheduler/templates/CRITICAL-THINKING-CHECKPOINT-TEMPLATE.md`:

### Checkpoint Context
**Decision:** Technology approach for documentation validation system
**Trigger Type:** [x] Mandatory - Architecture decision affecting tooling
**Background:** Need to choose validation framework and integration approach

### Circle Perspective Analysis

#### Pragmatist Perspective
**Focus:** Can we implement this practically with current resources?
- **Feasibility:** ✅ Node.js validation scripts are straightforward to implement
- **Resources:** Existing Node.js expertise, test framework already in place
- **Constraints:** Must integrate with current CI pipeline (GitHub Actions)
- **Recommendation:** Proceed - practical implementation path is clear

#### Skeptic Perspective  
**Focus:** What could go wrong? What edge cases exist?
- **Risks Identified:**
  - False positives frustrating developers
  - Edge cases in markdown parsing (nested lists, code blocks)
  - Performance issues on large documentation sets
  - Template rules becoming too rigid
- **Mitigation:** 
  - Extensive edge case testing
  - Configurable rule severity (error vs warning)
  - Performance benchmarks as acceptance criteria
- **Recommendation:** Proceed with comprehensive edge case coverage

#### Guardian Perspective
**Focus:** What security/compliance needs protection?
- **Security Considerations:**
  - Script should not execute arbitrary code from docs
  - File access limited to documentation directories
  - No secrets exposed in validation output
- **Compliance:** Aligns with documentation quality standards
- **Safeguards:** Sandboxed execution, path validation
- **Recommendation:** Proceed with security guardrails

#### Dreamer Perspective
**Focus:** How does this align with long-term vision?
- **Strategic Value:** Foundation for comprehensive quality automation
- **Scalability:** Template-based system can extend to new doc types
- **Future Opportunities:** Could expand to auto-fix, AI-assisted writing
- **Innovation:** Proactive quality over reactive review
- **Recommendation:** Proceed - strong strategic alignment

### Circle Synthesis
**Consensus:** All perspectives support proceeding with validation system
**Key Trade-off:** Comprehensive validation vs developer friction
**Decision:** Proceed with configurable severity levels to balance thoroughness and usability

---

## Acceptance Criteria

### AC-1: Validation Script Core Functionality
**Given** the documentation validation system is installed and configured
**When** the validation script runs against a documentation directory
**Then** it should identify all markdown files and check each against applicable templates, reporting violations with specific file locations and fix suggestions
**Test Method:** Jest unit tests + integration tests with sample docs
**Evidence Required:** Test output showing pass/fail for various document structures

### AC-2: Template Structure Validation
**Given** template definitions exist for each documentation type (technical, user guide, API)
**When** a document is validated against its applicable template
**Then** the validator should verify presence of all required sections, proper heading hierarchy, and consistent formatting
**Test Method:** Unit tests with valid/invalid sample documents
**Evidence Required:** Test coverage report showing all template rules tested

### AC-3: Cross-Reference Integrity
**Given** documentation contains internal links (e.g., `[link](./other-doc.md)`)
**When** the link checker validates these references
**Then** all broken links should be reported with the source file, line number, and target path that couldn't be resolved
**Test Method:** Integration test with document containing mix of valid/broken links
**Evidence Required:** Test output showing accurate broken link detection

### AC-4: CI/CD Integration
**Given** the validation system is integrated with GitHub Actions
**When** a pull request includes documentation changes
**Then** the validation workflow should automatically run and block merge if critical violations are found
**Test Method:** E2E test simulating PR workflow (mock CI execution)
**Evidence Required:** Workflow file + execution logs showing proper gating

### AC-5: Error Reporting Quality
**Given** validation failures are detected in documentation
**When** the error report is generated
**Then** each error should include: file path, line number, rule violated, severity level, and actionable fix suggestion
**Test Method:** Unit tests validating error output format
**Evidence Required:** Sample error reports demonstrating all required fields

### AC-6: Performance Requirements
**Given** a documentation set of 100+ markdown files
**When** full validation runs
**Then** completion should occur within 30 seconds with clear progress indication
**Test Method:** Performance benchmark with realistic document set
**Evidence Required:** Timing logs showing execution under threshold

---

## Testing Requirements (MANDATORY)

### TDD Approach

- **RED:** Write failing tests FIRST for each acceptance criterion before implementing functionality
- **GREEN:** Implement the minimum code necessary to make each test pass
- **REFACTOR:** Optimize and clean up implementation while keeping all tests green

### Testing Strategy
- **Testing Framework:** Jest for unit/integration tests, custom scripts for E2E
- **Test Types:** Unit tests (individual functions), Integration tests (component interaction), E2E tests (full workflow)
- **Coverage Requirements:** Minimum 85% line coverage, 100% branch coverage for critical paths
- **Performance Criteria:** Full test suite runs in under 60 seconds

### Test Files to Create
- `tests/doc-validation.test.js` - Core validation logic tests
- `tests/template-parser.test.js` - Template definition parsing tests
- `tests/link-checker.test.js` - Cross-reference validation tests
- `tests/error-reporter.test.js` - Error formatting tests
- `tests/fixtures/` - Sample valid/invalid documents for testing
- `tests/e2e/ci-integration.test.js` - End-to-end CI workflow tests

### Test Categories by Circle Perspective

**Pragmatist Tests (Functional):**
- Does it correctly identify missing sections?
- Does it properly parse markdown structures?
- Does integration with CI work as expected?

**Skeptic Tests (Edge Cases & Failures):**
- What happens with malformed markdown?
- How does it handle unicode characters?
- What if a template definition is invalid?
- Performance under stress (1000+ files)?

**Guardian Tests (Security & Safety):**
- Can malicious markdown cause issues?
- Are file paths properly sanitized?
- Is output safe from injection?

**Dreamer Tests (Strategic Value):**
- Can templates be easily extended?
- Is the system configurable for different needs?
- Does error output enable future auto-fix features?

---

## Validation Checklist

### Layer 1: Self-Validation (Worker) ✅/❌
- [ ] Tests written BEFORE implementation (TDD RED phase documented)
- [ ] All tests pass (TDD GREEN phase complete with evidence)
- [ ] Code/content meets all acceptance criteria (AC-1 through AC-6)
- [ ] Test evidence collected and documented below
- [ ] Testing framework properly implemented (Jest configured)
- [ ] Performance criteria met (validation <30s, tests <60s)
- [ ] Git commit created with descriptive message
- [ ] Task progress file updated with full work log
- [ ] Project memory files updated with completion details
- [ ] Status updated from "in-progress" to "self-validated"
- [ ] Coverage report shows minimum 85% line coverage

**Layer 1 Critical Checks:**
- [ ] No hardcoded paths or credentials
- [ ] Error messages are actionable
- [ ] All edge cases from Skeptic analysis addressed

### Layer 2: Manager Validation (Coordinator) ✅/❌
- [ ] Verify test evidence provided and valid
- [ ] Confirm tests actually validate acceptance criteria (not just passing)
- [ ] Check test coverage is adequate (85%+ line coverage verified)
- [ ] Validate testing framework usage (Jest properly configured)
- [ ] Review implementation quality (code review for maintainability)
- [ ] Verify integration with existing systems (CI pipeline tested)
- [ ] Confirm git commit exists and is proper
- [ ] Verify Circle checkpoint was properly applied
- [ ] Check performance benchmarks meet requirements
- [ ] Status updated to "needs-validation"

**Layer 2 Quality Gates:**
- [ ] No false positive warnings in test output
- [ ] Documentation standards file is comprehensive
- [ ] Error reporting format matches specification

### Layer 3: Independent Validation (Validator) ✅/❌
- [ ] Run tests independently to confirm results (fresh environment)
- [ ] Verify test quality and comprehensiveness (edge cases covered)
- [ ] Check for missed edge cases (try additional malformed inputs)
- [ ] Validate end-to-end functionality (simulate real PR workflow)
- [ ] Confirm acceptance criteria fully met (independent verification)
- [ ] Review Circle checkpoint quality
- [ ] Final approval and status update to "validated"

**Layer 3 Independence Requirements:**
- [ ] Clone fresh repository to validate
- [ ] Run full test suite without prior knowledge of implementation
- [ ] Attempt to break validation with unexpected inputs
- [ ] Verify documentation matches actual behavior

---

## Test Evidence

### Implementation Evidence (To be filled by worker)

**TDD RED Phase Evidence:**
```
# Initial test run (before implementation)
$ npm test -- --testPathPattern=doc-validation
 FAIL  tests/doc-validation.test.js
  ✕ should identify missing required sections (x ms)
  ✕ should validate heading hierarchy (x ms)
  ✕ should detect broken internal links (x ms)
  ...
Tests: X failed, 0 passed
```

**TDD GREEN Phase Evidence:**
```
# After implementation
$ npm test -- --testPathPattern=doc-validation
 PASS  tests/doc-validation.test.js
  ✓ should identify missing required sections (xx ms)
  ✓ should validate heading hierarchy (xx ms)
  ✓ should detect broken internal links (xx ms)
  ...
Tests: X passed, 0 failed
```

**Coverage Report:**
```
--------------------|---------|----------|---------|---------|
File                | % Stmts | % Branch | % Funcs | % Lines |
--------------------|---------|----------|---------|---------|
All files           |   XX.XX |    XX.XX |   XX.XX |   XX.XX |
 validate-docs.js   |   XX.XX |    XX.XX |   XX.XX |   XX.XX |
 template-parser.js |   XX.XX |    XX.XX |   XX.XX |   XX.XX |
--------------------|---------|----------|---------|---------|
```

**Performance Metrics:**
```
Validation time for 100 files: XXs (target: <30s)
Test suite execution time: XXs (target: <60s)
```

### Validation Evidence

**Screenshots:** (if UI changes applicable)
- N/A for this task

**Integration Tests:**
- CI workflow execution logs
- PR gating behavior verification

**Manual Verification:**
- [ ] Ran validation on existing project documentation
- [ ] Verified error messages are actionable
- [ ] Confirmed CI integration works in test branch

### Files Created/Modified
| File | Purpose |
|------|---------|
| `scripts/validate-docs.js` | Main validation script |
| `scripts/doc-templates/*.json` | Template definitions |
| `docs/DOCUMENTATION-STANDARDS.md` | Standards documentation |
| `tests/doc-validation.test.js` | Core test suite |
| `tests/fixtures/` | Test documents |
| `.github/workflows/doc-validation.yml` | CI integration |

---

## Contingencies

**Risk: False positives frustrating developers**
- **Trigger:** Multiple complaints about invalid validation errors
- **Mitigation:** Add configurable rule severity, warning vs error distinction
- **Fallback:** Emergency bypass flag for critical releases

**Risk: Performance degradation on large repos**
- **Trigger:** Validation exceeds 30s threshold
- **Mitigation:** Implement caching, parallel processing
- **Fallback:** Selective validation (changed files only)

**Risk: Template rules too rigid for edge cases**
- **Trigger:** Legitimate docs failing validation
- **Mitigation:** Add inline suppression comments, template exceptions
- **Fallback:** Document exclusion patterns

---

## Reference Materials
- **AGENTS.md** - Testing and validation requirements (foundational)
- **PROACTIVE-JOBS-TEMPLATE.md** - Template format reference
- **CRITICAL-THINKING-CHECKPOINT-TEMPLATE.md** - Circle analysis format
- **docs/PLANNING-SYSTEM.md** - User story and planning requirements
- **docs/VERIFICATION-SYSTEM.md** - Validation workflow details

---

## Status Progression Reference

This task will progress through the following states:

| Status | Who Sets | Requirements |
|--------|----------|--------------|
| `pending` | Definition | Task defined, ready for assignment |
| `in-progress` | Worker | Worker claimed, heartbeat active |
| `self-validated` | Worker | All tests pass, evidence collected |
| `needs-validation` | Worker | Ready for Coordinator review |
| `validated` | Validator | Independent verification complete |
| `complete` | Coordinator | Final integration confirmed |

---

**Template Compliance:** This task demonstrates all requirements from Phase 1:
- ✅ Header and status fields per template
- ✅ Description with >50 characters
- ✅ Files to modify section
- ✅ Specific changes needed
- ✅ Given-When-Then acceptance criteria (6 ACs)
- ✅ Test Method and Evidence Required for each AC
- ✅ Testing Requirements with TDD approach (RED/GREEN/REFACTOR)
- ✅ Testing Framework and Strategy specified
- ✅ Test files to create listed
- ✅ 3-layer validation checklist (Layer 1, 2, 3)
- ✅ Test Evidence section with templates
- ✅ Circle thinking checkpoint integrated
- ✅ All four perspectives addressed (Pragmatist, Skeptic, Guardian, Dreamer)
- ✅ Contingencies documented
- ✅ Reference materials including AGENTS.md
- ✅ Status progression documented
