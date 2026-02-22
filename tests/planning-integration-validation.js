/**
 * Planning Workflow Integration Validation Tests  
 * Task: p1-3-a - Document The Circle integration into planning workflow
 * TDD Phase: RED - Tests written FIRST, should FAIL initially
 */

const fs = require('fs');
const path = require('path');

// Test configuration
const DOCS_PATH = path.join(__dirname, '..', 'docs');
const WORKFLOWS_PATH = path.join(DOCS_PATH, 'workflows');
const WORKFLOW_DOC = path.join(WORKFLOWS_PATH, 'CIRCLE-INTEGRATED-PLANNING.md');
const MAIN_DOC = path.join(DOCS_PATH, 'THE-CIRCLE-PLANNING-INTEGRATION.md');
const PLANNING_SYSTEM_DOC = path.join(DOCS_PATH, 'PLANNING-SYSTEM.md');

let testResults = [];

function runTest(testName, testFunction) {
    try {
        const result = testFunction();
        testResults.push({ name: testName, status: result ? 'PASS' : 'FAIL', error: null });
        return result;
    } catch (error) {
        testResults.push({ name: testName, status: 'FAIL', error: error.message });
        return false;
    }
}

function printResults() {
    console.log('\n=== PLANNING INTEGRATION VALIDATION TESTS ===');
    let passed = 0;
    let failed = 0;
    
    testResults.forEach(test => {
        const status = test.status === 'PASS' ? '✅' : '❌';
        console.log(`${status} ${test.name}`);
        if (test.error) {
            console.log(`   Error: ${test.error}`);
        }
        test.status === 'PASS' ? passed++ : failed++;
    });
    
    console.log(`\nResults: ${passed} passed, ${failed} failed`);
    return failed === 0;
}

// Test 1: Workflows directory exists
runTest('Workflows directory exists for Circle integration docs', () => {
    return fs.existsSync(WORKFLOWS_PATH);
});

// Test 2: Circle-integrated planning workflow document exists
runTest('Circle-integrated planning workflow document exists', () => {
    return fs.existsSync(WORKFLOW_DOC);
});

// Test 3: Planning workflow includes Circle checkpoints
runTest('Planning workflow document includes Circle checkpoint definitions', () => {
    if (!fs.existsSync(WORKFLOW_DOC)) return false;
    
    const content = fs.readFileSync(WORKFLOW_DOC, 'utf8');
    const checkpointKeywords = ['checkpoint', 'Circle analysis', 'validation point', 'perspective review'];
    
    return checkpointKeywords.some(keyword => content.toLowerCase().includes(keyword.toLowerCase()));
});

// Test 4: Integration with existing planning system phases
runTest('Integration with existing planning system phases documented', () => {
    if (!fs.existsSync(WORKFLOW_DOC)) return false;
    
    const content = fs.readFileSync(WORKFLOW_DOC, 'utf8');
    const phaseKeywords = ['Phase 1', 'Phase 2', 'initiation', 'planning', 'execution', 'validation'];
    
    return phaseKeywords.some(keyword => content.includes(keyword));
});

// Test 5: Circle perspectives are mapped to planning stages
runTest('Circle perspectives are mapped to specific planning stages', () => {
    if (!fs.existsSync(WORKFLOW_DOC)) return false;
    
    const content = fs.readFileSync(WORKFLOW_DOC, 'utf8');
    const perspectives = ['Pragmatist', 'Skeptic', 'Guardian', 'Dreamer'];
    const stageKeywords = ['stage', 'phase', 'step', 'when to use'];
    
    const hasPerspectives = perspectives.some(p => content.includes(p));
    const hasStages = stageKeywords.some(s => content.toLowerCase().includes(s));
    
    return hasPerspectives && hasStages;
});

// Test 6: Decision gates include Circle analysis requirements
runTest('Decision gates include mandatory Circle analysis requirements', () => {
    if (!fs.existsSync(WORKFLOW_DOC)) return false;
    
    const content = fs.readFileSync(WORKFLOW_DOC, 'utf8');
    const gateKeywords = ['decision gate', 'approval', 'go/no-go', 'checkpoint', 'validation'];
    const circleKeywords = ['Circle analysis', 'four perspectives', 'comprehensive review'];
    
    const hasGates = gateKeywords.some(g => content.toLowerCase().includes(g));
    const hasCircle = circleKeywords.some(c => content.includes(c));
    
    return hasGates && hasCircle;
});

// Test 7: Integration with testing requirements from p1-2-b  
runTest('Integration with testing requirements from enhanced planning system', () => {
    if (!fs.existsSync(WORKFLOW_DOC)) return false;
    
    const content = fs.readFileSync(WORKFLOW_DOC, 'utf8');
    const testKeywords = ['testing', 'validation', 'acceptance criteria', 'TDD'];
    
    return testKeywords.some(keyword => content.toLowerCase().includes(keyword));
});

// Test 8: Risk assessment checkpoints are defined
runTest('Risk assessment checkpoints using Circle thinking are defined', () => {
    if (!fs.existsSync(WORKFLOW_DOC)) return false;
    
    const content = fs.readFileSync(WORKFLOW_DOC, 'utf8');
    const riskKeywords = ['risk', 'threat', 'vulnerability', 'mitigation'];
    const guardianKeywords = ['Guardian', 'security', 'protection'];
    
    const hasRisk = riskKeywords.some(r => content.toLowerCase().includes(r));
    const hasGuardian = guardianKeywords.some(g => content.includes(g));
    
    return hasRisk && hasGuardian;
});

// Test 9: Workflow includes practical examples
runTest('Workflow document includes practical integration examples', () => {
    if (!fs.existsSync(WORKFLOW_DOC)) return false;
    
    const content = fs.readFileSync(WORKFLOW_DOC, 'utf8');
    const exampleKeywords = ['example', 'scenario', 'case study', 'sample', 'illustration'];
    
    return exampleKeywords.some(keyword => content.toLowerCase().includes(keyword));
});

// Test 10: References to existing planning system
runTest('Document references and builds upon existing PLANNING-SYSTEM.md', () => {
    if (!fs.existsSync(WORKFLOW_DOC)) return false;
    
    const content = fs.readFileSync(WORKFLOW_DOC, 'utf8');
    const planningRefs = ['PLANNING-SYSTEM.md', 'existing planning', 'enhanced with', 'builds upon'];
    
    return planningRefs.some(ref => content.includes(ref));
});

// Test 11: Clear workflow steps with Circle integration points
runTest('Clear workflow steps with specific Circle integration points', () => {
    if (!fs.existsSync(WORKFLOW_DOC)) return false;
    
    const content = fs.readFileSync(WORKFLOW_DOC, 'utf8');
    const stepKeywords = ['Step 1', 'Step 2', 'Next:', 'Then:', '1.', '2.', '3.'];
    const integrationKeywords = ['Circle analysis', 'perspective review', 'four viewpoints'];
    
    const hasSteps = stepKeywords.some(s => content.includes(s));
    const hasIntegration = integrationKeywords.some(i => content.includes(i));
    
    return hasSteps && hasIntegration;
});

// Test 12: Document quality and completeness
runTest('Workflow document has comprehensive content and structure', () => {
    if (!fs.existsSync(WORKFLOW_DOC)) return false;
    
    const content = fs.readFileSync(WORKFLOW_DOC, 'utf8');
    const hasTitle = content.includes('# ');
    const hasHeaders = (content.match(/## /g) || []).length >= 4;
    const hasSubstantialContent = content.length > 1500; // Meaningful content length
    
    return hasTitle && hasHeaders && hasSubstantialContent;
});

// Test 13: Integration points with AGENTS.md validation requirements
runTest('Integration with AGENTS.md validation requirements documented', () => {
    if (!fs.existsSync(WORKFLOW_DOC)) return false;
    
    const content = fs.readFileSync(WORKFLOW_DOC, 'utf8');
    const validationKeywords = ['validation', 'Layer 1', 'Layer 2', 'Layer 3', 'AGENTS.md'];
    
    return validationKeywords.some(v => content.includes(v));
});

// Test 14: Main document references the workflow
runTest('Main Circle documentation references the integrated workflow', () => {
    if (!fs.existsSync(MAIN_DOC) || !fs.existsSync(WORKFLOW_DOC)) return false;
    
    const mainContent = fs.readFileSync(MAIN_DOC, 'utf8');
    const workflowRefs = ['CIRCLE-INTEGRATED-PLANNING.md', 'workflow', 'integration workflow', 'see workflow'];
    
    return workflowRefs.some(ref => mainContent.includes(ref));
});

// Run all tests and print results
const allPassed = printResults();

// Exit with appropriate code for test runner integration
process.exit(allPassed ? 0 : 1);