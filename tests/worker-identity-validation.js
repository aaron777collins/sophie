#!/usr/bin/env node

/**
 * Validation script for scheduler/workers/IDENTITY.md
 * Verifies that all required sections and keywords exist for the validation-before-complete workflow
 */

const fs = require('fs');
const path = require('path');

// Test results tracking
let totalTests = 0;
let passedTests = 0;
let failedTests = [];

function test(description, assertion) {
    totalTests++;
    try {
        if (assertion()) {
            console.log(`✅ ${description}`);
            passedTests++;
        } else {
            console.log(`❌ ${description}`);
            failedTests.push(description);
        }
    } catch (error) {
        console.log(`❌ ${description} - Error: ${error.message}`);
        failedTests.push(description);
    }
}

function main() {
    console.log('🧪 Testing Worker IDENTITY.md validation requirements...\n');

    const identityPath = path.join(process.env.HOME, 'clawd/scheduler/workers/IDENTITY.md');
    
    if (!fs.existsSync(identityPath)) {
        console.log(`❌ File not found: ${identityPath}`);
        process.exit(1);
    }

    const content = fs.readFileSync(identityPath, 'utf8');

    // Test 1: File has proper header structure
    test('Has proper Worker header with tagline', () => {
        return content.includes('# Workers — Level 4 (Execution)') &&
               content.includes('*"Test first. Implement. Validate. Never claim complete without evidence."*');
    });

    // Test 2: Contains mandatory testing section
    test('Contains Testing & Validation Requirements section', () => {
        return content.includes('## 🧪 Testing & Validation Requirements (MANDATORY)');
    });

    // Test 3: References AGENTS.md testing standards
    test('References AGENTS.md testing standards', () => {
        return content.includes('~/clawd/AGENTS.md') &&
               content.includes('Testing & Validation Requirements');
    });

    // Test 4: TDD approach is documented
    test('Documents Test-Driven Development (TDD) approach', () => {
        return content.includes('Test-Driven Development (TDD)') &&
               content.includes('RED') && content.includes('GREEN') && content.includes('REFACTOR');
    });

    // Test 5: Mandatory sequence for validation
    test('Contains mandatory TDD sequence with no exceptions', () => {
        return content.includes('MANDATORY TDD SEQUENCE') &&
               content.includes('Write failing tests FIRST') &&
               content.includes('NO EXCEPTIONS: This applies to ALL work types');
    });

    // Test 6: Status progression includes validation checkpoints
    test('Status progression includes validation workflow', () => {
        return content.includes('Status Progression & Validation Workflow') &&
               content.includes('pending → working → needs-validation → complete') &&
               content.includes('NEVER set status to `complete`');
    });

    // Test 7: Self-validation process with checklists
    test('Contains self-validation process with detailed checklists', () => {
        return content.includes('Self-Validation Checklist') &&
               content.includes('TDD Methodology') &&
               content.includes('Testing Requirements') &&
               content.includes('Acceptance Criteria Validation');
    });

    // Test 8: Testing framework requirements by work type
    test('Specifies testing frameworks by work type', () => {
        return content.includes('Testing Framework Selection') &&
               content.includes('Documentation') && content.includes('Validation scripts') &&
               content.includes('Frontend Code') && content.includes('Jest, Playwright, Cypress') &&
               content.includes('Backend Code') && content.includes('Supertest, integration tests');
    });

    // Test 9: Evidence collection requirements
    test('Contains evidence collection requirements', () => {
        return content.includes('Evidence Collection Requirements') &&
               content.includes('Test Evidence') &&
               content.includes('Screenshots') &&
               content.includes('Test output');
    });

    // Test 10: Layer 1 self-validation detailed
    test('Details Layer 1 self-validation responsibilities', () => {
        return content.includes('Layer 1: Self-Validation (YOUR RESPONSIBILITY)') &&
               content.includes('Tests written BEFORE implementation') &&
               content.includes('CANNOT CLAIM COMPLETE WITHOUT TEST EVIDENCE');
    });

    // Test 11: Quality gates that cannot be bypassed
    test('Contains quality gates that cannot be bypassed', () => {
        return content.includes('Quality Gates (CANNOT BE BYPASSED)') &&
               content.includes('All tests pass') &&
               content.includes('Build succeeds');
    });

    // Test 12: Validation checkpoints before implementation
    test('Has validation checkpoints throughout workflow', () => {
        return content.includes('Validation Checkpoints (MANDATORY)') &&
               content.includes('Checkpoint 1: Before Implementation') &&
               content.includes('Checkpoint 2: After Implementation') &&
               content.includes('Checkpoint 3: Self-Validation Complete');
    });

    // Test 13: Mandatory workflow sequence
    test('Documents mandatory workflow sequence on starting', () => {
        return content.includes('On Starting (MANDATORY SEQUENCE)') &&
               content.includes('Read AGENTS.md Testing Requirements') &&
               content.includes('Write tests FIRST (RED phase)') &&
               content.includes('Collect validation evidence');
    });

    // Test 14: Error conditions and escalation
    test('Contains error conditions and escalation procedures', () => {
        return content.includes('Error Conditions & Escalation') &&
               content.includes('When to Reject Your Own Work') &&
               content.includes('When to Escalate to Task Manager');
    });

    // Test 15: Implementation workflow with TDD
    test('Provides detailed implementation workflow with TDD phases', () => {
        return content.includes('Implementation Workflow') &&
               content.includes('TDD RED Phase') &&
               content.includes('TDD GREEN Phase') &&
               content.includes('TDD REFACTOR Phase');
    });

    // Test 16: Success patterns and examples
    test('Contains success patterns and high-quality examples', () => {
        return content.includes('Success Patterns') &&
               content.includes('High-Quality Completion Example') &&
               content.includes('Validation Evidence');
    });

    // Test 17: Tools and resources for testing
    test('Provides tools and resources for different work types', () => {
        return content.includes('Tools & Resources') &&
               content.includes('Testing Commands by Work Type') &&
               content.includes('Evidence Collection Tools');
    });

    // Test 18: Clear prohibition on setting status to complete
    test('Explicitly prohibits workers from setting status to complete', () => {
        return content.includes('NEVER set status to "complete"') &&
               content.includes('only Manager/Validator can') &&
               content.includes('needs-validation is your completion signal');
    });

    // Test 19: Learning from validation failures section
    test('Contains learning from validation failures guidance', () => {
        return content.includes('Learning from Validation Failures') &&
               content.includes('Common Validation Issues') &&
               content.includes('Improvement Patterns');
    });

    // Test 20: Alignment with AGENTS.md indicated
    test('Shows alignment with AGENTS.md at bottom', () => {
        return content.includes('*Aligned with: AGENTS.md Testing & Validation Requirements*');
    });

    // Summary
    console.log('\n📊 Test Results Summary:');
    console.log(`Total tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests.length}`);

    if (failedTests.length > 0) {
        console.log('\n❌ Failed tests:');
        failedTests.forEach(test => console.log(`  - ${test}`));
        process.exit(1);
    } else {
        console.log('\n✅ All tests passed! Worker IDENTITY.md meets validation requirements.');
        process.exit(0);
    }
}

if (require.main === module) {
    main();
}