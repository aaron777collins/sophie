#!/usr/bin/env node

/**
 * p2-2-b Worker Validation Test Suite
 * Tests that Worker follows new validation-before-complete workflow
 * as defined in the enhanced IDENTITY.md
 * 
 * Run with: node tests/p2-2-b-worker-validation.js
 */

const fs = require('fs');
const path = require('path');

// Test configuration
const WORKER_IDENTITY_PATH = 'scheduler/workers/IDENTITY.md';
let testsPassed = 0;
let testsFailed = 0;
let complianceDetails = [];

/**
 * Test helper function
 */
function runTest(testName, testFunction) {
    try {
        const result = testFunction();
        if (result === true) {
            console.log(`✅ PASS: ${testName}`);
            testsPassed++;
            complianceDetails.push({ test: testName, status: 'PASS', details: 'Requirement met' });
        } else {
            console.log(`❌ FAIL: ${testName} - ${result}`);
            testsFailed++;
            complianceDetails.push({ test: testName, status: 'FAIL', details: result });
        }
    } catch (error) {
        console.log(`❌ ERROR: ${testName} - ${error.message}`);
        testsFailed++;
        complianceDetails.push({ test: testName, status: 'ERROR', details: error.message });
    }
}

/**
 * Load Worker IDENTITY.md content
 */
let workerContent = '';
try {
    workerContent = fs.readFileSync(WORKER_IDENTITY_PATH, 'utf8');
} catch (error) {
    console.error(`❌ ERROR: Cannot read ${WORKER_IDENTITY_PATH}: ${error.message}`);
    process.exit(1);
}

console.log('🧪 Testing Worker IDENTITY.md Validation-Before-Complete Workflow\n');
console.log(`📁 File: ${WORKER_IDENTITY_PATH}\n`);

// Test 1: Validation-Before-Complete Workflow Documentation
runTest('Validation-Before-Complete workflow documented', () => {
    if (workerContent.includes('validation-before-complete') || 
        workerContent.includes('needs-validation') ||
        (workerContent.includes('validation') && workerContent.includes('complete'))) {
        return true;
    }
    return 'Validation-before-complete workflow not found';
});

// Test 2: Self-Validation Step is Mandatory
runTest('Self-validation step is mandatory', () => {
    if (workerContent.includes('Self-Validation') && 
        (workerContent.includes('MANDATORY') || workerContent.includes('mandatory') || 
         workerContent.includes('MUST') || workerContent.includes('required'))) {
        return true;
    }
    return 'Mandatory self-validation step not documented';
});

// Test 3: Test Execution Requirements Clear
runTest('Test execution requirements are clear', () => {
    const hasTestExecution = workerContent.includes('Test-Driven Development') || 
                           workerContent.includes('TDD') ||
                           workerContent.includes('testing framework');
    const hasRequirements = workerContent.includes('Testing Requirements') ||
                           workerContent.includes('Testing Framework');
    
    if (hasTestExecution && hasRequirements) {
        return true;
    }
    return 'Test execution requirements not clearly specified';
});

// Test 4: Status Progression with Validation Checkpoint
runTest('Status progression includes validation checkpoint', () => {
    if (workerContent.includes('needs-validation') && 
        (workerContent.includes('Status Flow') || workerContent.includes('Status Progression') ||
         workerContent.includes('pending → working → needs-validation'))) {
        return true;
    }
    return 'Validation checkpoint not found in status progression';
});

// Test 5: Evidence Collection Requirements
runTest('Workers required to collect test evidence', () => {
    if (workerContent.includes('Evidence Collection') && 
        (workerContent.includes('evidence') || workerContent.includes('proof') ||
         workerContent.includes('screenshots') || workerContent.includes('test output'))) {
        return true;
    }
    return 'Test evidence collection requirements not found';
});

// Test 6: TDD Methodology Documentation
runTest('TDD methodology (RED → GREEN → REFACTOR) documented', () => {
    const hasRed = workerContent.includes('RED');
    const hasGreen = workerContent.includes('GREEN');
    const hasRefactor = workerContent.includes('REFACTOR');
    
    if (hasRed && hasGreen && hasRefactor) {
        return true;
    }
    return 'Complete TDD methodology (RED → GREEN → REFACTOR) not documented';
});

// Test 7: Testing Framework Integration
runTest('Testing framework integration specified', () => {
    const frameworks = ['Jest', 'Playwright', 'Cypress', 'Supertest'];
    const hasFramework = frameworks.some(framework => workerContent.includes(framework));
    
    if (hasFramework) {
        return true;
    }
    return 'Testing framework integration not specified';
});

// Test 8: Quality Gates Documentation
runTest('Quality gates that cannot be bypassed documented', () => {
    if (workerContent.includes('Quality Gates') && 
        (workerContent.includes('CANNOT BE BYPASSED') || 
         workerContent.includes('cannot be bypassed') ||
         workerContent.includes('mandatory'))) {
        return true;
    }
    return 'Non-bypassable quality gates not documented';
});

// Test 9: Never Set Complete Status Rule
runTest('Rule that Workers never set status to complete', () => {
    if (workerContent.includes('NEVER set status to') && 
        workerContent.includes('complete') &&
        (workerContent.includes('only') || workerContent.includes('Manager') || 
         workerContent.includes('Validator'))) {
        return true;
    }
    return 'Rule preventing Workers from setting status to complete not found';
});

// Test 10: Validation Evidence Templates
runTest('Evidence documentation templates provided', () => {
    if (workerContent.includes('Evidence Collection') && 
        (workerContent.includes('```markdown') || 
         workerContent.includes('Evidence:') ||
         workerContent.includes('Test Evidence:'))) {
        return true;
    }
    return 'Evidence documentation templates not provided';
});

// Test 11: Three-Layer Validation System
runTest('Three-layer validation system referenced', () => {
    const hasLayers = workerContent.includes('Layer 1') || 
                     workerContent.includes('Layer 2') ||
                     workerContent.includes('Layer 3');
    const hasThreeLayers = workerContent.includes('three-layer') || 
                          workerContent.includes('3-layer') ||
                          (workerContent.includes('Self-Validation') && 
                           workerContent.includes('Manager') && 
                           workerContent.includes('Validator'));
    
    if (hasLayers || hasThreeLayers) {
        return true;
    }
    return 'Three-layer validation system not referenced';
});

// Test 12: Acceptance Criteria Validation
runTest('Acceptance criteria validation required', () => {
    if (workerContent.includes('acceptance criteria') &&
        (workerContent.includes('Given') && workerContent.includes('When') && 
         workerContent.includes('Then'))) {
        return true;
    }
    return 'Acceptance criteria validation with Given/When/Then not required';
});

// Test 13: Critical Rules Section
runTest('Critical rules section present with security focus', () => {
    if (workerContent.includes('CRITICAL RULES') && 
        (workerContent.includes('credential') || workerContent.includes('LOGIN') ||
         workerContent.includes('validation'))) {
        return true;
    }
    return 'Critical rules section with security focus not found';
});

// Test 14: Implementation Workflow Documentation
runTest('Step-by-step implementation workflow documented', () => {
    if (workerContent.includes('Implementation Workflow') ||
        (workerContent.includes('workflow') && 
         (workerContent.includes('1.') || workerContent.includes('Step')))) {
        return true;
    }
    return 'Step-by-step implementation workflow not documented';
});

// Test 15: Error Conditions and Escalation
runTest('Error conditions and escalation procedures documented', () => {
    if (workerContent.includes('Error Conditions') && 
        workerContent.includes('Escalation') &&
        (workerContent.includes('Task Manager') || workerContent.includes('escalate'))) {
        return true;
    }
    return 'Error conditions and escalation procedures not documented';
});

// Calculate compliance percentage
const totalTests = testsPassed + testsFailed;
const compliancePercentage = totalTests > 0 ? Math.round((testsPassed / totalTests) * 100) : 0;

// Print summary
console.log('\n📊 WORKER VALIDATION SUMMARY');
console.log('=' * 50);
console.log(`Total Tests: ${totalTests}`);
console.log(`Passed: ${testsPassed}`);
console.log(`Failed: ${testsFailed}`);
console.log(`Compliance: ${compliancePercentage}%`);

if (compliancePercentage >= 90) {
    console.log('✅ EXCELLENT: Worker IDENTITY.md fully compliant with validation-before-complete workflow');
} else if (compliancePercentage >= 75) {
    console.log('⚠️  GOOD: Worker IDENTITY.md mostly compliant, minor gaps exist');
} else if (compliancePercentage >= 50) {
    console.log('⚠️  FAIR: Worker IDENTITY.md partially compliant, significant improvements needed');
} else {
    console.log('❌ POOR: Worker IDENTITY.md lacks validation-before-complete workflow requirements');
}

console.log('\n📋 DETAILED COMPLIANCE REPORT');
console.log('=' * 50);
complianceDetails.forEach((detail, index) => {
    const statusIcon = detail.status === 'PASS' ? '✅' : 
                      detail.status === 'FAIL' ? '❌' : '⚠️ ';
    console.log(`${index + 1}. ${statusIcon} ${detail.test}`);
    if (detail.status !== 'PASS') {
        console.log(`   Details: ${detail.details}`);
    }
});

// Export results for potential use by other scripts
module.exports = {
    testsPassed,
    testsFailed,
    compliancePercentage,
    complianceDetails
};

// Exit with appropriate code
process.exit(testsFailed > 0 ? 1 : 0);