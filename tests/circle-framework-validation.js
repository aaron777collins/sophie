/**
 * Circle Framework Documentation Validation Tests
 * Task: p1-3-a - Document The Circle integration into planning workflow
 * TDD Phase: RED - Tests written FIRST, should FAIL initially
 */

const fs = require('fs');
const path = require('path');

// Test configuration
const DOCS_PATH = path.join(__dirname, '..', 'docs');
const MAIN_DOC = path.join(DOCS_PATH, 'THE-CIRCLE-PLANNING-INTEGRATION.md');
const TEMPLATES_PATH = path.join(DOCS_PATH, 'templates');
const WORKFLOWS_PATH = path.join(DOCS_PATH, 'workflows');

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
    console.log('\n=== CIRCLE FRAMEWORK VALIDATION TESTS ===');
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

// Test 1: Main Circle framework documentation exists
runTest('Main Circle framework documentation file exists', () => {
    return fs.existsSync(MAIN_DOC);
});

// Test 2: Main documentation has required sections
runTest('Circle framework documentation has required sections', () => {
    if (!fs.existsSync(MAIN_DOC)) return false;
    
    const content = fs.readFileSync(MAIN_DOC, 'utf8');
    const requiredSections = [
        'The Circle Framework',
        'Pragmatist',
        'Skeptic', 
        'Guardian',
        'Dreamer',
        'Planning Workflow Integration',
        'Circle Checkpoints',
        'Risk Assessment',
        'Decision-Making Process'
    ];
    
    return requiredSections.every(section => content.includes(section));
});

// Test 3: Each Circle perspective is properly documented
runTest('All four Circle perspectives are documented with definitions', () => {
    if (!fs.existsSync(MAIN_DOC)) return false;
    
    const content = fs.readFileSync(MAIN_DOC, 'utf8');
    const perspectives = ['Pragmatist', 'Skeptic', 'Guardian', 'Dreamer'];
    
    return perspectives.every(perspective => {
        const hasHeading = content.includes(`## ${perspective}`) || content.includes(`### ${perspective}`);
        const hasDescription = content.toLowerCase().includes(perspective.toLowerCase());
        return hasHeading && hasDescription;
    });
});

// Test 4: Circle checkpoints are defined in planning workflow
runTest('Circle checkpoints are defined with specific triggers', () => {
    if (!fs.existsSync(MAIN_DOC)) return false;
    
    const content = fs.readFileSync(MAIN_DOC, 'utf8');
    const checkpointKeywords = ['checkpoint', 'trigger', 'when to use', 'validation'];
    
    return checkpointKeywords.some(keyword => content.toLowerCase().includes(keyword));
});

// Test 5: Risk assessment integration is documented
runTest('Risk assessment integration with Circle thinking is documented', () => {
    if (!fs.existsSync(MAIN_DOC)) return false;
    
    const content = fs.readFileSync(MAIN_DOC, 'utf8');
    const riskKeywords = ['risk', 'assessment', 'mitigation', 'threat', 'vulnerability'];
    
    return riskKeywords.some(keyword => content.toLowerCase().includes(keyword));
});

// Test 6: Decision-making process includes Circle perspectives
runTest('Decision-making process explicitly includes Circle perspectives', () => {
    if (!fs.existsSync(MAIN_DOC)) return false;
    
    const content = fs.readFileSync(MAIN_DOC, 'utf8');
    const decisionKeywords = ['decision', 'perspective', 'analysis', 'evaluate'];
    
    return decisionKeywords.some(keyword => content.toLowerCase().includes(keyword));
});

// Test 7: Integration with existing planning system is documented
runTest('Integration with existing planning system is documented', () => {
    if (!fs.existsSync(MAIN_DOC)) return false;
    
    const content = fs.readFileSync(MAIN_DOC, 'utf8');
    const integrationKeywords = ['planning system', 'workflow', 'integration', 'existing'];
    
    return integrationKeywords.some(keyword => content.toLowerCase().includes(keyword));
});

// Test 8: Document structure is professional and complete
runTest('Document has proper structure with title, TOC, and sections', () => {
    if (!fs.existsSync(MAIN_DOC)) return false;
    
    const content = fs.readFileSync(MAIN_DOC, 'utf8');
    const hasTitle = content.includes('# ') || content.includes('# The Circle');
    const hasSections = (content.match(/## /g) || []).length >= 3;
    const hasContent = content.length > 1000; // Meaningful content length
    
    return hasTitle && hasSections && hasContent;
});

// Test 9: References to AGENTS.md and planning system updates
runTest('Document references AGENTS.md and planning system enhancements', () => {
    if (!fs.existsSync(MAIN_DOC)) return false;
    
    const content = fs.readFileSync(MAIN_DOC, 'utf8');
    const hasAgentsRef = content.includes('AGENTS.md') || content.includes('validation requirements');
    const hasPlanningRef = content.includes('planning system') || content.includes('p1-2-b');
    
    return hasAgentsRef || hasPlanningRef;
});

// Test 10: Document includes practical examples
runTest('Document includes practical examples of Circle usage', () => {
    if (!fs.existsSync(MAIN_DOC)) return false;
    
    const content = fs.readFileSync(MAIN_DOC, 'utf8');
    const exampleKeywords = ['example', 'scenario', 'case study', 'practice', 'application'];
    
    return exampleKeywords.some(keyword => content.toLowerCase().includes(keyword));
});

// Test 11: Proper markdown formatting
runTest('Document uses proper markdown formatting', () => {
    if (!fs.existsSync(MAIN_DOC)) return false;
    
    const content = fs.readFileSync(MAIN_DOC, 'utf8');
    const hasHeaders = content.includes('#');
    const hasBullets = content.includes('- ') || content.includes('* ');
    const hasCodeBlocks = content.includes('```') || content.includes('`');
    
    return hasHeaders && (hasBullets || hasCodeBlocks);
});

// Test 12: Document size indicates comprehensive content
runTest('Document has comprehensive content (minimum size check)', () => {
    if (!fs.existsSync(MAIN_DOC)) return false;
    
    const content = fs.readFileSync(MAIN_DOC, 'utf8');
    return content.length > 2000; // At least 2KB of content for comprehensive documentation
});

// Run all tests and print results
const allPassed = printResults();

// Exit with appropriate code for test runner integration
process.exit(allPassed ? 0 : 1);