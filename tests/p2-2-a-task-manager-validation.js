#!/usr/bin/env node

/**
 * P2-2-A Task Manager Validation Tests
 * 
 * Validates that Task Manager IDENTITY.md follows new validation requirements
 * per AGENTS.md testing standards.
 * 
 * Tests:
 * 1. Task Manager IDENTITY.md includes validation requirements
 * 2. Worker spawning process includes testing requirements  
 * 3. "No task without tests" policy is referenced
 * 4. References to AGENTS.md testing standards are present
 * 5. 3-layer validation workflow is implemented
 * 6. TDD methodology is specified
 * 7. Testing framework integration is documented
 * 
 * Run: node tests/p2-2-a-task-manager-validation.js
 */

const fs = require('fs');
const path = require('path');

// Test framework
let passed = 0;
let failed = 0;
let testResults = [];

function test(name, assertion, details = '') {
    try {
        if (assertion) {
            console.log(`✅ ${name}`);
            testResults.push({ name, status: 'PASS', details });
            passed++;
        } else {
            console.log(`❌ ${name}`);
            testResults.push({ name, status: 'FAIL', details: details || 'Assertion failed' });
            failed++;
        }
    } catch (error) {
        console.log(`❌ ${name} - Error: ${error.message}`);
        testResults.push({ name, status: 'ERROR', details: error.message });
        failed++;
    }
}

// Load files for testing
const taskManagerPath = path.join(process.cwd(), 'scheduler/task-managers/IDENTITY.md');
const agentsPath = path.join(process.cwd(), 'AGENTS.md');

console.log('🧪 P2-2-A Task Manager Validation Tests');
console.log('=====================================\n');

// Check file existence
test('Task Manager IDENTITY.md exists', fs.existsSync(taskManagerPath));
test('AGENTS.md exists for reference validation', fs.existsSync(agentsPath));

if (!fs.existsSync(taskManagerPath) || !fs.existsSync(agentsPath)) {
    console.log('\n❌ Required files missing. Aborting tests.');
    process.exit(1);
}

const taskManagerContent = fs.readFileSync(taskManagerPath, 'utf8');
const agentsContent = fs.readFileSync(agentsPath, 'utf8');

console.log('📋 Testing Task Manager Validation Requirements\n');

// 1. Core Testing & Validation Section
test(
    'Has dedicated Testing & Validation Requirements section',
    taskManagerContent.includes('## 🧪 Testing & Validation Requirements (MANDATORY)'),
    'Dedicated section with emoji and MANDATORY designation'
);

test(
    'References AGENTS.md foundational rule',
    taskManagerContent.includes('Foundational Rule: No task is complete without proper testing and validation') ||
    taskManagerContent.includes('FOUNDATIONAL RULE: No task is complete without proper testing and validation'),
    'Must reference the foundational rule from AGENTS.md'
);

test(
    'Includes AGENTS.md reference in testing section',
    taskManagerContent.includes('Reference:** `~/clawd/AGENTS.md` — "Testing & Validation Requirements" section') ||
    taskManagerContent.includes('~/clawd/AGENTS.md'),
    'Must reference AGENTS.md for testing standards'
);

// 2. TDD Methodology
test(
    'Specifies TDD methodology (RED-GREEN-REFACTOR)',
    taskManagerContent.includes('RED') && 
    taskManagerContent.includes('GREEN') && 
    taskManagerContent.includes('REFACTOR'),
    'Must include all three TDD phases'
);

test(
    'TDD methodology properly explained',
    taskManagerContent.includes('Write tests first') && 
    taskManagerContent.includes('make tests pass') && 
    taskManagerContent.includes('Improve code while keeping tests green'),
    'TDD phases must be properly explained'
);

// 3. Testing Frameworks Integration
test(
    'Includes testing frameworks table',
    taskManagerContent.includes('Testing Frameworks Integration') ||
    taskManagerContent.includes('Required Testing Tools'),
    'Must document required testing frameworks'
);

test(
    'Specifies Jest for backend testing',
    taskManagerContent.includes('Jest'),
    'Must include Jest as testing framework option'
);

test(
    'Specifies Playwright/Cypress for frontend testing',
    taskManagerContent.includes('Playwright') || taskManagerContent.includes('Cypress'),
    'Must include frontend testing frameworks'
);

// 4. "No Task Without Tests" Policy
test(
    'Has "No Task Without Tests" policy section',
    taskManagerContent.includes('No Task Without Tests Policy'),
    'Must have dedicated policy section'
);

test(
    'Policy is marked as MANDATORY',
    taskManagerContent.includes('MANDATORY RULE') || taskManagerContent.includes('MANDATORY'),
    'Policy must be marked as mandatory'
);

test(
    'Policy includes rejection clause',
    taskManagerContent.includes('REJECTED by Task Managers') || 
    taskManagerContent.includes('will be REJECTED') ||
    taskManagerContent.includes('Tasks without testing plans'),
    'Must specify rejection of tasks without tests'
);

// 5. Pre-Spawn Validation Checklist
test(
    'Has pre-spawn validation checklist',
    taskManagerContent.includes('Pre-Spawn Validation') && 
    taskManagerContent.includes('MANDATORY'),
    'Must have mandatory pre-spawn validation'
);

test(
    'Pre-spawn checklist includes User Story requirement',
    taskManagerContent.includes('User Story') && 
    taskManagerContent.includes('acceptance criteria'),
    'Must verify User Story exists before spawning'
);

test(
    'Pre-spawn checklist includes test strategy requirement',
    taskManagerContent.includes('Test strategy defined') ||
    taskManagerContent.includes('test strategy'),
    'Must verify test strategy exists'
);

test(
    'Pre-spawn checklist includes testing framework specification',
    taskManagerContent.includes('Testing framework specified') ||
    taskManagerContent.includes('Framework specified'),
    'Must verify testing framework is specified'
);

test(
    'Pre-spawn checklist includes validation method requirement',
    taskManagerContent.includes('Validation method documented') ||
    taskManagerContent.includes('validation method'),
    'Must verify validation method is documented'
);

test(
    'Pre-spawn checklist includes evidence collection requirement',
    taskManagerContent.includes('Evidence collection requirements') ||
    taskManagerContent.includes('evidence collection'),
    'Must verify evidence collection is planned'
);

// 6. Enhanced Worker Spawn Template
test(
    'Has enhanced worker spawn template section',
    taskManagerContent.includes('Enhanced Worker Spawn Template') ||
    taskManagerContent.includes('Worker Spawn') ||
    taskManagerContent.includes('Spawning Workers'),
    'Must document enhanced spawning process'
);

test(
    'Worker spawn template includes TDD approach',
    taskManagerContent.includes('MANDATORY TDD APPROACH') ||
    (taskManagerContent.includes('TDD') && taskManagerContent.includes('RED') && taskManagerContent.includes('GREEN')),
    'Worker spawn must include TDD methodology'
);

test(
    'Worker spawn template includes testing requirements section',
    taskManagerContent.includes('TESTING REQUIREMENTS') ||
    taskManagerContent.includes('Testing Requirements'),
    'Worker spawn must include testing requirements'
);

test(
    'Worker spawn template references AGENTS.md',
    taskManagerContent.includes('Reference: ~/clawd/AGENTS.md') ||
    taskManagerContent.includes('AGENTS.md'),
    'Worker spawn must reference AGENTS.md testing section'
);

// 7. 3-Layer Validation Workflow
test(
    '3-Layer validation workflow documented',
    taskManagerContent.includes('3-Layer') || taskManagerContent.includes('Three-Layer') ||
    taskManagerContent.includes('Enhanced Validation Workflow'),
    'Must document 3-layer validation process'
);

test(
    'Layer 1 (Self-Validation) defined',
    taskManagerContent.includes('Layer 1') && taskManagerContent.includes('Self-Validation'),
    'Must define worker self-validation layer'
);

test(
    'Layer 2 (Manager Validation) defined', 
    taskManagerContent.includes('Layer 2') && 
    (taskManagerContent.includes('Manager Validation') || taskManagerContent.includes('Task Manager')),
    'Must define manager validation layer'
);

test(
    'Layer 3 (Independent Validation) defined',
    taskManagerContent.includes('Layer 3') && taskManagerContent.includes('Independent Validation'),
    'Must define independent validation layer'
);

// 8. Test Evidence Requirements
test(
    'Specifies test evidence requirements',
    taskManagerContent.includes('test evidence') || taskManagerContent.includes('Testing evidence'),
    'Must specify evidence requirements'
);

test(
    'Cannot claim complete without test evidence',
    taskManagerContent.includes('Cannot claim complete without test evidence') ||
    taskManagerContent.includes('cannot complete without') ||
    taskManagerContent.includes('without test evidence'),
    'Must specify completion depends on test evidence'
);

test(
    'Cannot approve without reviewing test results',
    taskManagerContent.includes('Cannot approve without reviewing test results') ||
    taskManagerContent.includes('cannot approve without') ||
    taskManagerContent.includes('reviewing test results'),
    'Must specify approval depends on test review'
);

// 9. Enhanced Verification Template
test(
    'Includes enhanced verification template',
    taskManagerContent.includes('Enhanced verification template') ||
    taskManagerContent.includes('Verification:') ||
    taskManagerContent.includes('verification template'),
    'Must provide verification template for managers'
);

test(
    'Verification template includes test evidence review',
    taskManagerContent.includes('Test evidence independently verified') ||
    taskManagerContent.includes('test evidence') ||
    taskManagerContent.includes('evidence verified'),
    'Verification must check test evidence'
);

// 10. Multi-Perspective Self-Validation  
test(
    'Includes multi-perspective self-validation guidance',
    taskManagerContent.includes('Multi-Perspective Self-Validation') ||
    taskManagerContent.includes('verification sub-agent') ||
    taskManagerContent.includes('different perspectives'),
    'Must provide guidance for spawning verification sub-agents'
);

test(
    'Self-validation includes different perspectives',
    taskManagerContent.includes('Pragmatist') && taskManagerContent.includes('Skeptic') &&
    taskManagerContent.includes('Guardian'),
    'Must include multiple validation perspectives'
);

// 11. Testing Framework Integration Requirements
test(
    'Documents when to spawn verification sub-agent',
    taskManagerContent.includes('When to spawn verification sub-agent') ||
    taskManagerContent.includes('spawn verification') ||
    taskManagerContent.includes('verification sub-agent'),
    'Must guide when additional verification is needed'
);

test(
    'Includes specific testing framework requirements in task assignment',
    taskManagerContent.includes('Framework:') && 
    (taskManagerContent.includes('Jest') || taskManagerContent.includes('Playwright') || taskManagerContent.includes('validation scripts')),
    'Task assignment must specify testing frameworks'
);

// 12. Compliance with Enhanced User Story Format
test(
    'References User Stories requirement from AGENTS.md',
    taskManagerContent.includes('NO USER STORY = NO TASK SPAWNING') ||
    taskManagerContent.includes('NO ACCEPTANCE CRITERIA = NO VALIDATION') ||
    taskManagerContent.includes('User Story') && taskManagerContent.includes('spawning'),
    'Must enforce user story requirements'
);

test(
    'Task assignment format includes testing requirements',
    taskManagerContent.includes('Testing Requirements (MANDATORY)') ||
    taskManagerContent.includes('TESTING REQUIREMENTS') ||
    (taskManagerContent.includes('Testing') && taskManagerContent.includes('MANDATORY')),
    'Task assignments must include mandatory testing section'
);

// Results Summary
console.log('\n📊 Test Results Summary');
console.log('======================');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📊 Total: ${passed + failed}`);

const compliancePercentage = Math.round((passed / (passed + failed)) * 100);
console.log(`🎯 Compliance: ${compliancePercentage}%`);

// Detailed Results for Failed Tests
if (failed > 0) {
    console.log('\n❌ Failed Tests Details:');
    console.log('========================');
    testResults
        .filter(r => r.status !== 'PASS')
        .forEach(result => {
            console.log(`- ${result.name}: ${result.details}`);
        });
}

// Recommendations
console.log('\n💡 Compliance Assessment:');
console.log('=========================');

if (compliancePercentage >= 90) {
    console.log('🟢 EXCELLENT: Task Manager IDENTITY.md meets validation requirements');
} else if (compliancePercentage >= 80) {
    console.log('🟡 GOOD: Task Manager mostly compliant, minor improvements needed');
} else if (compliancePercentage >= 70) {
    console.log('🟠 MODERATE: Task Manager partially compliant, significant improvements needed');  
} else {
    console.log('🔴 POOR: Task Manager does not meet validation requirements, major updates needed');
}

// Export results for reporting
const results = {
    summary: {
        passed,
        failed,
        total: passed + failed,
        compliancePercentage
    },
    tests: testResults,
    timestamp: new Date().toISOString(),
    taskId: 'p2-2-a',
    component: 'Task Manager IDENTITY.md'
};

// Write results to file for reporting
fs.writeFileSync(
    'tests/p2-2-a-task-manager-validation-results.json',
    JSON.stringify(results, null, 2)
);

console.log('\n📄 Detailed results written to: tests/p2-2-a-task-manager-validation-results.json');

process.exit(failed > 0 ? 1 : 0);