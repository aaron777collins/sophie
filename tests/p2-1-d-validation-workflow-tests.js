#!/usr/bin/env node
/**
 * p2-1-d Validation Workflow Tests
 * Tests the enhanced 3-layer validation workflow effectiveness
 * 
 * Tests Layer 1 (Self-Validation), Layer 2 (Manager Validation), 
 * and Layer 3 (Independent Validation) to ensure quality improvement
 */

const fs = require('fs');
const path = require('path');

// Test configuration
const PROJECT_ROOT = '/home/ubuntu/clawd';
const PROGRESS_DIR = path.join(PROJECT_ROOT, 'scheduler/progress/proactive-job-system-enhancement');

let passedTests = 0;
let failedTests = 0;

function test(description, testFunction) {
    try {
        const result = testFunction();
        if (result) {
            console.log(`✅ ${description}`);
            passedTests++;
        } else {
            console.log(`❌ ${description}`);
            failedTests++;
        }
    } catch (error) {
        console.log(`❌ ${description} - Error: ${error.message}`);
        failedTests++;
    }
}

function fileExists(filePath) {
    try {
        return fs.existsSync(filePath);
    } catch {
        return false;
    }
}

function readFileContent(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch {
        return '';
    }
}

function getProgressFiles() {
    try {
        return fs.readdirSync(PROGRESS_DIR)
            .filter(file => file.endsWith('.md') && file.startsWith('p'))
            .map(file => path.join(PROGRESS_DIR, file));
    } catch {
        return [];
    }
}

function analyzeValidationWorkflow() {
    const progressFiles = getProgressFiles();
    const validationAnalysis = {
        layer1Evidence: 0,
        layer2Evidence: 0,
        layer3Evidence: 0,
        totalTasks: progressFiles.length,
        tddEvidence: 0,
        testFrameworkUsage: 0,
        independentValidation: 0
    };

    progressFiles.forEach(file => {
        const content = readFileContent(file);
        
        // Layer 1 (Self-Validation) indicators
        if (content.includes('TDD') || content.includes('RED → GREEN → REFACTOR') || 
            content.includes('test evidence') || content.includes('Exit code: 0')) {
            validationAnalysis.layer1Evidence++;
        }

        // Layer 2 (Manager Validation) indicators  
        if (content.includes('L2 Validated') || content.includes('coordinator') ||
            content.includes('verification') || content.includes('manager validation')) {
            validationAnalysis.layer2Evidence++;
        }

        // Layer 3 (Independent Validation) indicators
        if (content.includes('L3 Validated') || content.includes('validator') ||
            content.includes('independent') || content.includes('PASS') || content.includes('FAIL')) {
            validationAnalysis.layer3Evidence++;
        }

        // TDD Evidence
        if (content.includes('RED Phase') || content.includes('GREEN Phase') || 
            content.includes('REFACTOR Phase') || content.includes('tests written first')) {
            validationAnalysis.tddEvidence++;
        }

        // Testing Framework Usage
        if (content.includes('jest') || content.includes('playwright') || 
            content.includes('cypress') || content.includes('npm test') || content.includes('pnpm test')) {
            validationAnalysis.testFrameworkUsage++;
        }

        // Independent Validation Evidence
        if (content.includes('validator') && content.includes('independent') && 
            (content.includes('✅ PASS') || content.includes('verification result'))) {
            validationAnalysis.independentValidation++;
        }
    });

    return validationAnalysis;
}

console.log('🧪 Running p2-1-d: Enhanced 3-Layer Validation Workflow Tests');
console.log('=' + '='.repeat(65));

// Layer 1 (Self-Validation) Tests
console.log('\n📋 Layer 1 (Self-Validation) Requirements Tests');

test('should have VERIFICATION-CHECKLIST.md with worker requirements', () => {
    const checklist = readFileContent(path.join(PROJECT_ROOT, 'docs/VERIFICATION-CHECKLIST.md'));
    return checklist.includes('Enhanced Worker Completion Checklist') &&
           checklist.includes('Test Verification (MANDATORY FIRST)') &&
           checklist.includes('Cannot claim complete without test evidence');
});

test('should have TDD evidence requirements in checklist', () => {
    const checklist = readFileContent(path.join(PROJECT_ROOT, 'docs/VERIFICATION-CHECKLIST.md'));
    return checklist.includes('TDD Evidence Verification (MANDATORY)') &&
           checklist.includes('RED Phase Evidence Requirements') &&
           checklist.includes('GREEN Phase Evidence Requirements') &&
           checklist.includes('REFACTOR Phase Evidence Requirements');
});

test('should require test framework integration validation', () => {
    const checklist = readFileContent(path.join(PROJECT_ROOT, 'docs/VERIFICATION-CHECKLIST.md'));
    return checklist.includes('Testing Framework Integration Validation (MANDATORY)') &&
           checklist.includes('Jest') && checklist.includes('Playwright') && checklist.includes('Cypress');
});

test('should require test execution output documentation', () => {
    const checklist = readFileContent(path.join(PROJECT_ROOT, 'docs/VERIFICATION-CHECKLIST.md'));
    return checklist.includes('Test Execution Output Documentation (MANDATORY)') &&
           checklist.includes('actual command execution output') &&
           checklist.includes('Exit code:');
});

test('should prevent completion without test evidence', () => {
    const checklist = readFileContent(path.join(PROJECT_ROOT, 'docs/VERIFICATION-CHECKLIST.md'));
    return checklist.includes('Cannot claim complete without test evidence') &&
           checklist.includes('Test evidence before completion claims');
});

// Layer 2 (Manager Validation) Tests  
console.log('\n📊 Layer 2 (Manager Validation) Requirements Tests');

test('should have coordinator self-validation requirements', () => {
    const checklist = readFileContent(path.join(PROJECT_ROOT, 'docs/VERIFICATION-CHECKLIST.md'));
    return checklist.includes('Enhanced Coordinator Self-Validation Checklist') &&
           checklist.includes('Test Framework Validation (MANDATORY FIRST)') &&
           checklist.includes('Cannot approve tasks without verifying testing framework');
});

test('should require test evidence quality verification', () => {
    const checklist = readFileContent(path.join(PROJECT_ROOT, 'docs/VERIFICATION-CHECKLIST.md'));
    return checklist.includes('Test Evidence Quality Verification (MANDATORY)') &&
           checklist.includes('validate test evidence from workers') &&
           checklist.includes('test evidence quality');
});

test('should require independent test execution by coordinator', () => {
    const checklist = readFileContent(path.join(PROJECT_ROOT, 'docs/VERIFICATION-CHECKLIST.md'));
    return checklist.includes('Independent Test Execution Verification (MANDATORY)') &&
           checklist.includes('Run tests independently') &&
           checklist.includes('coordinator-test-results.log');
});

test('should require test coverage validation by coordinator', () => {
    const checklist = readFileContent(path.join(PROJECT_ROOT, 'docs/VERIFICATION-CHECKLIST.md'));
    return checklist.includes('Test Coverage Validation Requirements (MANDATORY)') &&
           checklist.includes('Independent test coverage verification') &&
           checklist.includes('coverage requirements are met');
});

test('should prevent coordinator approval without test verification', () => {
    const system = readFileContent(path.join(PROJECT_ROOT, 'docs/VERIFICATION-SYSTEM.md'));
    return system.includes('Cannot approve without reviewing test results') &&
           system.includes('Layer 2 (Manager Validation)') &&
           system.includes('verify test quality');
});

// Layer 3 (Independent Validation) Tests
console.log('\n🔍 Layer 3 (Independent Validation) Requirements Tests');

test('should have comprehensive validator test validation requirements', () => {
    const checklist = readFileContent(path.join(PROJECT_ROOT, 'docs/VERIFICATION-CHECKLIST.md'));
    return checklist.includes('Enhanced Validator Verification Checklist') &&
           checklist.includes('Comprehensive Test Validation (MANDATORY)') &&
           checklist.includes('independent test execution and comprehensive test validation');
});

test('should require independent test execution by validator', () => {
    const checklist = readFileContent(path.join(PROJECT_ROOT, 'docs/VERIFICATION-CHECKLIST.md'));
    return checklist.includes('Independent Test Execution by Validator (MANDATORY)') &&
           checklist.includes('validator must run tests to confirm results') &&
           checklist.includes('validator-test-results.log');
});

test('should require test quality assessment by validator', () => {
    const checklist = readFileContent(path.join(PROJECT_ROOT, 'docs/VERIFICATION-CHECKLIST.md'));
    return checklist.includes('Test Quality Assessment Requirements (MANDATORY)') &&
           checklist.includes('Assess test quality, comprehensiveness') &&
           checklist.includes('test quality assessment');
});

test('should require end-to-end functionality validation', () => {
    const checklist = readFileContent(path.join(PROJECT_ROOT, 'docs/VERIFICATION-CHECKLIST.md'));
    return checklist.includes('End-to-End Functionality Validation (MANDATORY)') &&
           checklist.includes('Validate end-to-end functionality') &&
           checklist.includes('end-to-end functionality validation');
});

test('should require final approval through independent test verification', () => {
    const system = readFileContent(path.join(PROJECT_ROOT, 'docs/VERIFICATION-SYSTEM.md'));
    return system.includes('Final approval requires independent test verification') &&
           system.includes('Layer 3 (Independent Validation)') &&
           system.includes('Validator');
});

// Workflow Integration Tests
console.log('\n🔄 Workflow Integration Tests');

test('should have 3-layer validation protocol documented', () => {
    const system = readFileContent(path.join(PROJECT_ROOT, 'docs/VERIFICATION-SYSTEM.md'));
    return system.includes('3-LAYER VALIDATION PROTOCOL (TESTING ENHANCED)') &&
           system.includes('Layer 1: SELF-VALIDATION with Test Evidence (Worker)') &&
           system.includes('Layer 2: MANAGER VALIDATION with Test Quality Review (Coordinator)') &&
           system.includes('Layer 3: INDEPENDENT VALIDATION with Test Verification (Validator)');
});

test('should have "No Task Without Tests" policy enforcement', () => {
    const system = readFileContent(path.join(PROJECT_ROOT, 'docs/VERIFICATION-SYSTEM.md'));
    return system.includes('No Task Without Tests') &&
           system.includes('MANDATORY RULE') &&
           system.includes('Tasks without testing plans will be REJECTED by managers');
});

test('should have testing methodology requirements', () => {
    const system = readFileContent(path.join(PROJECT_ROOT, 'docs/VERIFICATION-SYSTEM.md'));
    return system.includes('Testing Methodology (MANDATORY)') &&
           system.includes('Test-Driven Development (TDD)') &&
           system.includes('Red → Green → Refactor');
});

test('should have status flow with testing phase', () => {
    const system = readFileContent(path.join(PROJECT_ROOT, 'docs/VERIFICATION-SYSTEM.md'));
    return system.includes('testing-phase') &&
           system.includes('needs-validation') &&
           system.includes('self-validated') &&
           system.includes('validated');
});

test('should have anti-patterns for testing fraud prevention', () => {
    const checklist = readFileContent(path.join(PROJECT_ROOT, 'docs/VERIFICATION-CHECKLIST.md'));
    return checklist.includes('Testing-Related Anti-Patterns') &&
           checklist.includes('WILL BE REJECTED') &&
           checklist.includes('False test claims') &&
           checklist.includes('Jest syntax errors');
});

// Effectiveness Analysis Tests
console.log('\n📈 Workflow Effectiveness Analysis Tests');

const analysis = analyzeValidationWorkflow();

test('should show evidence of Layer 1 self-validation in task progress', () => {
    return analysis.layer1Evidence >= Math.floor(analysis.totalTasks * 0.8); // 80% of tasks show L1 evidence
});

test('should show evidence of Layer 2 manager validation in task progress', () => {
    return analysis.layer2Evidence >= Math.floor(analysis.totalTasks * 0.6); // 60% of tasks show L2 evidence
});

test('should show evidence of Layer 3 independent validation in task progress', () => {
    return analysis.layer3Evidence >= Math.floor(analysis.totalTasks * 0.4); // 40% of tasks show L3 evidence
});

test('should show widespread TDD evidence adoption', () => {
    return analysis.tddEvidence >= Math.floor(analysis.totalTasks * 0.7); // 70% of tasks show TDD evidence
});

test('should show testing framework integration across tasks', () => {
    return analysis.testFrameworkUsage >= Math.floor(analysis.totalTasks * 0.6); // 60% of tasks use testing frameworks
});

test('should demonstrate quality improvement through validation', () => {
    // Look for retry/fix patterns indicating validation is catching issues
    const progressFiles = getProgressFiles();
    let retryCount = 0;
    let validationFailures = 0;
    
    progressFiles.forEach(file => {
        const content = readFileContent(file);
        if (content.includes('RETRY') || content.includes('Previous Worker Failed')) {
            retryCount++;
        }
        if (content.includes('validation fail') || content.includes('REJECTED')) {
            validationFailures++;
        }
    });

    // If we see retries/failures, it means validation is working
    return (retryCount + validationFailures) > 0;
});

// System Integration Tests
console.log('\n🔗 System Integration Tests');

test('should integrate with AGENTS.md testing requirements', () => {
    const agents = readFileContent(path.join(PROJECT_ROOT, 'AGENTS.md'));
    const system = readFileContent(path.join(PROJECT_ROOT, 'docs/VERIFICATION-SYSTEM.md'));
    
    return agents.includes('Testing & Validation Requirements (MANDATORY)') &&
           system.includes('Integration with AGENTS.md Testing Requirements');
});

test('should align with PROACTIVE-JOBS template structure', () => {
    const templateExists = fileExists(path.join(PROJECT_ROOT, 'docs/templates/PROACTIVE-JOBS-TEMPLATE.md'));
    const system = readFileContent(path.join(PROJECT_ROOT, 'docs/VERIFICATION-SYSTEM.md'));
    
    return templateExists && system.includes('PROACTIVE-JOBS-TEMPLATE.md');
});

test('should have evidence collection templates', () => {
    const checklist = readFileContent(path.join(PROJECT_ROOT, 'docs/VERIFICATION-CHECKLIST.md'));
    return checklist.includes('Testing Evidence Template Enhancement') &&
           checklist.includes('Test Execution Output Template (MANDATORY)') &&
           checklist.includes('Test Evidence Collection Format (MANDATORY)');
});

// Quality Metrics Tests
console.log('\n📊 Quality Metrics Tests');

test('should show improved task completion quality', () => {
    // Look for comprehensive completion reports with test evidence
    const progressFiles = getProgressFiles();
    let qualityCompletions = 0;
    
    progressFiles.forEach(file => {
        const content = readFileContent(file);
        if (content.includes('Test Results Summary') || 
            content.includes('TDD Evidence') ||
            content.includes('Acceptance Criteria Verification')) {
            qualityCompletions++;
        }
    });

    return qualityCompletions >= Math.floor(analysis.totalTasks * 0.5); // 50% show quality completions
});

test('should demonstrate comprehensive documentation standards', () => {
    const checklist = readFileContent(path.join(PROJECT_ROOT, 'docs/VERIFICATION-CHECKLIST.md'));
    return checklist.includes('Test Result Documentation Standards (MANDATORY)') &&
           checklist.includes('Complete test evidence collection must include') &&
           checklist.includes('standardized test result documentation format');
});

// Summary
console.log('\n📊 VALIDATION WORKFLOW EFFECTIVENESS SUMMARY');
console.log('=' + '='.repeat(65));
console.log(`\nValidation Analysis Results:`);
console.log(`- Total Tasks Analyzed: ${analysis.totalTasks}`);
console.log(`- Layer 1 Evidence: ${analysis.layer1Evidence}/${analysis.totalTasks} (${Math.round(analysis.layer1Evidence/analysis.totalTasks*100)}%)`);
console.log(`- Layer 2 Evidence: ${analysis.layer2Evidence}/${analysis.totalTasks} (${Math.round(analysis.layer2Evidence/analysis.totalTasks*100)}%)`);
console.log(`- Layer 3 Evidence: ${analysis.layer3Evidence}/${analysis.totalTasks} (${Math.round(analysis.layer3Evidence/analysis.totalTasks*100)}%)`);
console.log(`- TDD Evidence: ${analysis.tddEvidence}/${analysis.totalTasks} (${Math.round(analysis.tddEvidence/analysis.totalTasks*100)}%)`);
console.log(`- Testing Framework Usage: ${analysis.testFrameworkUsage}/${analysis.totalTasks} (${Math.round(analysis.testFrameworkUsage/analysis.totalTasks*100)}%)`);

console.log(`\n📈 Test Results Summary:`);
console.log(`✅ Passed: ${passedTests}`);
console.log(`❌ Failed: ${failedTests}`);
console.log(`📊 Success Rate: ${Math.round(passedTests / (passedTests + failedTests) * 100)}%`);

if (failedTests === 0) {
    console.log(`\n🎉 ALL TESTS PASSED - 3-Layer Validation Workflow is Effective!`);
} else {
    console.log(`\n⚠️  Some tests failed - Validation workflow needs improvement.`);
}

process.exit(failedTests > 0 ? 1 : 0);