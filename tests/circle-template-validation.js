/**
 * Circle Template Structure Validation Tests
 * Task: p1-3-a - Document The Circle integration into planning workflow  
 * TDD Phase: RED - Tests written FIRST, should FAIL initially
 */

const fs = require('fs');
const path = require('path');

// Test configuration
const DOCS_PATH = path.join(__dirname, '..', 'docs');
const TEMPLATES_PATH = path.join(DOCS_PATH, 'templates');
const CIRCLE_ANALYSIS_TEMPLATE = path.join(TEMPLATES_PATH, 'CIRCLE-ANALYSIS-TEMPLATE.md');
const CIRCLE_CHECKPOINT_TEMPLATE = path.join(TEMPLATES_PATH, 'CIRCLE-CHECKPOINT-TEMPLATE.md');

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
    console.log('\n=== CIRCLE TEMPLATE VALIDATION TESTS ===');
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

// Test 1: Templates directory exists
runTest('Templates directory exists for Circle templates', () => {
    return fs.existsSync(TEMPLATES_PATH);
});

// Test 2: Circle Analysis Template exists
runTest('Circle Analysis Template file exists', () => {
    return fs.existsSync(CIRCLE_ANALYSIS_TEMPLATE);
});

// Test 3: Circle Checkpoint Template exists  
runTest('Circle Checkpoint Template file exists', () => {
    return fs.existsSync(CIRCLE_CHECKPOINT_TEMPLATE);
});

// Test 4: Circle Analysis Template has all four perspectives
runTest('Circle Analysis Template includes all four perspectives', () => {
    if (!fs.existsSync(CIRCLE_ANALYSIS_TEMPLATE)) return false;
    
    const content = fs.readFileSync(CIRCLE_ANALYSIS_TEMPLATE, 'utf8');
    const perspectives = ['Pragmatist', 'Skeptic', 'Guardian', 'Dreamer'];
    
    return perspectives.every(perspective => content.includes(perspective));
});

// Test 5: Circle Analysis Template has structured format
runTest('Circle Analysis Template has structured format with sections', () => {
    if (!fs.existsSync(CIRCLE_ANALYSIS_TEMPLATE)) return false;
    
    const content = fs.readFileSync(CIRCLE_ANALYSIS_TEMPLATE, 'utf8');
    const requiredSections = [
        'Analysis Topic',
        'Context',
        'Circle Perspectives',
        'Synthesis',
        'Recommendations'
    ];
    
    return requiredSections.every(section => content.includes(section));
});

// Test 6: Circle Analysis Template has usage instructions
runTest('Circle Analysis Template includes clear usage instructions', () => {
    if (!fs.existsSync(CIRCLE_ANALYSIS_TEMPLATE)) return false;
    
    const content = fs.readFileSync(CIRCLE_ANALYSIS_TEMPLATE, 'utf8');
    const instructionKeywords = ['instructions', 'how to use', 'usage', 'guide', 'steps'];
    
    return instructionKeywords.some(keyword => content.toLowerCase().includes(keyword));
});

// Test 7: Circle Checkpoint Template has trigger definitions
runTest('Circle Checkpoint Template defines when to trigger checkpoints', () => {
    if (!fs.existsSync(CIRCLE_CHECKPOINT_TEMPLATE)) return false;
    
    const content = fs.readFileSync(CIRCLE_CHECKPOINT_TEMPLATE, 'utf8');
    const triggerKeywords = ['trigger', 'when to use', 'criteria', 'conditions', 'schedule'];
    
    return triggerKeywords.some(keyword => content.toLowerCase().includes(keyword));
});

// Test 8: Circle Checkpoint Template has evaluation criteria
runTest('Circle Checkpoint Template includes evaluation criteria', () => {
    if (!fs.existsSync(CIRCLE_CHECKPOINT_TEMPLATE)) return false;
    
    const content = fs.readFileSync(CIRCLE_CHECKPOINT_TEMPLATE, 'utf8');
    const evaluationKeywords = ['criteria', 'evaluate', 'assessment', 'checklist', 'questions'];
    
    return evaluationKeywords.some(keyword => content.toLowerCase().includes(keyword));
});

// Test 9: Circle Checkpoint Template has outcome actions
runTest('Circle Checkpoint Template defines possible outcomes and actions', () => {
    if (!fs.existsSync(CIRCLE_CHECKPOINT_TEMPLATE)) return false;
    
    const content = fs.readFileSync(CIRCLE_CHECKPOINT_TEMPLATE, 'utf8');
    const outcomeKeywords = ['outcome', 'action', 'next steps', 'follow-up', 'decision'];
    
    return outcomeKeywords.some(keyword => content.toLowerCase().includes(keyword));
});

// Test 10: Both templates have consistent formatting
runTest('Templates use consistent markdown formatting and structure', () => {
    if (!fs.existsSync(CIRCLE_ANALYSIS_TEMPLATE) || !fs.existsSync(CIRCLE_CHECKPOINT_TEMPLATE)) return false;
    
    const analysisContent = fs.readFileSync(CIRCLE_ANALYSIS_TEMPLATE, 'utf8');
    const checkpointContent = fs.readFileSync(CIRCLE_CHECKPOINT_TEMPLATE, 'utf8');
    
    // Both should have titles, headers, and structured content
    const analysisFormatted = analysisContent.includes('# ') && analysisContent.includes('## ');
    const checkpointFormatted = checkpointContent.includes('# ') && checkpointContent.includes('## ');
    
    return analysisFormatted && checkpointFormatted;
});

// Test 11: Templates integrate with existing workflow
runTest('Templates reference integration with existing planning workflow', () => {
    if (!fs.existsSync(CIRCLE_ANALYSIS_TEMPLATE) || !fs.existsSync(CIRCLE_CHECKPOINT_TEMPLATE)) return false;
    
    const analysisContent = fs.readFileSync(CIRCLE_ANALYSIS_TEMPLATE, 'utf8');
    const checkpointContent = fs.readFileSync(CIRCLE_CHECKPOINT_TEMPLATE, 'utf8');
    
    const workflowKeywords = ['planning', 'workflow', 'process', 'integration'];
    
    const analysisHasWorkflow = workflowKeywords.some(w => analysisContent.toLowerCase().includes(w));
    const checkpointHasWorkflow = workflowKeywords.some(w => checkpointContent.toLowerCase().includes(w));
    
    return analysisHasWorkflow || checkpointHasWorkflow;
});

// Test 12: Templates are practical and usable
runTest('Templates provide practical, fillable sections for real use', () => {
    if (!fs.existsSync(CIRCLE_ANALYSIS_TEMPLATE) || !fs.existsSync(CIRCLE_CHECKPOINT_TEMPLATE)) return false;
    
    const analysisContent = fs.readFileSync(CIRCLE_ANALYSIS_TEMPLATE, 'utf8');
    const checkpointContent = fs.readFileSync(CIRCLE_CHECKPOINT_TEMPLATE, 'utf8');
    
    // Look for placeholder text or fillable sections
    const fillableKeywords = ['[FILL IN]', '{your', 'TODO', '_____', '...', 'EXAMPLE'];
    
    const analysisHasFillable = fillableKeywords.some(f => analysisContent.includes(f));
    const checkpointHasFillable = fillableKeywords.some(f => checkpointContent.includes(f));
    
    return analysisHasFillable || checkpointHasFillable;
});

// Test 13: Templates have sufficient content depth
runTest('Templates have sufficient content depth for practical use', () => {
    if (!fs.existsSync(CIRCLE_ANALYSIS_TEMPLATE) || !fs.existsSync(CIRCLE_CHECKPOINT_TEMPLATE)) return false;
    
    const analysisContent = fs.readFileSync(CIRCLE_ANALYSIS_TEMPLATE, 'utf8');
    const checkpointContent = fs.readFileSync(CIRCLE_CHECKPOINT_TEMPLATE, 'utf8');
    
    // Each template should have meaningful content
    const analysisLength = analysisContent.length > 800;
    const checkpointLength = checkpointContent.length > 800;
    
    return analysisLength && checkpointLength;
});

// Test 14: Templates align with AGENTS.md testing requirements
runTest('Templates align with AGENTS.md validation and testing requirements', () => {
    if (!fs.existsSync(CIRCLE_ANALYSIS_TEMPLATE) || !fs.existsSync(CIRCLE_CHECKPOINT_TEMPLATE)) return false;
    
    const analysisContent = fs.readFileSync(CIRCLE_ANALYSIS_TEMPLATE, 'utf8');
    const checkpointContent = fs.readFileSync(CIRCLE_CHECKPOINT_TEMPLATE, 'utf8');
    
    const validationKeywords = ['validation', 'test', 'verify', 'evidence', 'criteria'];
    
    const analysisHasValidation = validationKeywords.some(v => analysisContent.toLowerCase().includes(v));
    const checkpointHasValidation = validationKeywords.some(v => checkpointContent.toLowerCase().includes(v));
    
    return analysisHasValidation || checkpointHasValidation;
});

// Test 15: Templates include examples
runTest('Templates include examples or sample usage', () => {
    if (!fs.existsSync(CIRCLE_ANALYSIS_TEMPLATE) || !fs.existsSync(CIRCLE_CHECKPOINT_TEMPLATE)) return false;
    
    const analysisContent = fs.readFileSync(CIRCLE_ANALYSIS_TEMPLATE, 'utf8');
    const checkpointContent = fs.readFileSync(CIRCLE_CHECKPOINT_TEMPLATE, 'utf8');
    
    const exampleKeywords = ['example', 'sample', 'case study', 'illustration', 'scenario'];
    
    const analysisHasExample = exampleKeywords.some(e => analysisContent.toLowerCase().includes(e));
    const checkpointHasExample = exampleKeywords.some(e => checkpointContent.toLowerCase().includes(e));
    
    return analysisHasExample || checkpointHasExample;
});

// Run all tests and print results
const allPassed = printResults();

// Exit with appropriate code for test runner integration
process.exit(allPassed ? 0 : 1);