#!/usr/bin/env node

/**
 * p2-3-b Checkpoint Usage Effectiveness Test Suite
 * 
 * Task: Validate that critical thinking checkpoints are being used effectively
 * in the enhanced planning and validation workflow.
 * 
 * Test-Driven Development Approach:
 * 1. Write tests FIRST (before analysis) ← THIS STEP
 * 2. Run tests — they should initially check for checkpoint presence
 * 3. Perform the effectiveness analysis
 * 4. Run tests — verify checkpoint integration
 * 5. Document findings
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 p2-3-b: Critical Thinking Checkpoint Usage Effectiveness Tests');
console.log('===================================================================');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function runTest(testName, testFunction) {
    totalTests++;
    try {
        const result = testFunction();
        if (result) {
            console.log(`✅ PASS: ${testName}`);
            passedTests++;
            return true;
        } else {
            console.log(`❌ FAIL: ${testName}`);
            failedTests++;
            return false;
        }
    } catch (error) {
        console.log(`❌ FAIL: ${testName} - Error: ${error.message}`);
        failedTests++;
        return false;
    }
}

// Helper function to check if file exists and read it
function readFileIfExists(filePath) {
    const fullPath = path.resolve(filePath);
    try {
        if (fs.existsSync(fullPath)) {
            return fs.readFileSync(fullPath, 'utf8');
        }
    } catch (error) {
        // File doesn't exist or can't be read
    }
    return null;
}

// Helper function to check if directory exists and list files
function listFilesInDirectory(dirPath) {
    try {
        if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
            return fs.readdirSync(dirPath);
        }
    } catch (error) {
        // Directory doesn't exist or can't be read
    }
    return [];
}

console.log('\n📋 1. Checkpoint References in Agent Documentation');
console.log('---------------------------------------------------');

runTest('AGENTS.md references critical thinking checkpoints', () => {
    const agentsContent = readFileIfExists('AGENTS.md');
    if (!agentsContent) return false;
    
    return agentsContent.includes('critical thinking') || 
           agentsContent.includes('Circle') || 
           agentsContent.includes('checkpoint');
});

runTest('Agent identity files reference checkpoint usage', () => {
    // Check for existing agent identity files
    const identityFiles = [
        'scheduler/coordinator/IDENTITY.md',
        'scheduler/task-manager/IDENTITY.md',
        'scheduler/validator/IDENTITY.md'
    ];
    
    let foundReferences = 0;
    for (const file of identityFiles) {
        const content = readFileIfExists(file);
        if (content && (content.includes('checkpoint') || 
                       content.includes('Circle') || 
                       content.includes('critical thinking'))) {
            foundReferences++;
        }
    }
    
    // At least one identity file should reference checkpoints
    return foundReferences > 0;
});

runTest('Worker spawn template includes checkpoint guidance', () => {
    const templateContent = readFileIfExists('scheduler/templates/WORKER-SPAWN-TEMPLATE.md');
    if (!templateContent) return false;
    
    return templateContent.includes('checkpoint') || 
           templateContent.includes('Circle') ||
           templateContent.includes('critical thinking');
});

console.log('\n📋 2. Checkpoint Usage in Recent Task Workflows');
console.log('------------------------------------------------');

runTest('Recent proactive jobs show checkpoint usage', () => {
    const proactiveJobs = readFileIfExists('PROACTIVE-JOBS.md');
    if (!proactiveJobs) return false;
    
    // Look for evidence of checkpoint usage in task descriptions or completion notes
    return proactiveJobs.includes('Circle') || 
           proactiveJobs.includes('checkpoint') ||
           proactiveJobs.includes('critical thinking');
});

runTest('Task progress files document checkpoint applications', () => {
    const progressFiles = listFilesInDirectory('scheduler/progress/proactive-job-system-enhancement/');
    
    let checkpointUsageFound = 0;
    for (const file of progressFiles) {
        if (file.endsWith('.md')) {
            const content = readFileIfExists(`scheduler/progress/proactive-job-system-enhancement/${file}`);
            if (content && (content.includes('Circle') || 
                           content.includes('checkpoint') ||
                           content.includes('critical thinking'))) {
                checkpointUsageFound++;
            }
        }
    }
    
    // At least one progress file should show checkpoint usage
    return checkpointUsageFound > 0;
});

runTest('Recent validation reports reference checkpoint analysis', () => {
    const validationReports = listFilesInDirectory('docs/validation-reports/');
    
    let checkpointReferencesFound = 0;
    for (const file of validationReports) {
        if (file.endsWith('.md')) {
            const content = readFileIfExists(`docs/validation-reports/${file}`);
            if (content && (content.includes('Circle') || 
                           content.includes('checkpoint') ||
                           content.includes('critical thinking'))) {
                checkpointReferencesFound++;
            }
        }
    }
    
    // At least one validation report should reference checkpoints
    return checkpointReferencesFound > 0;
});

console.log('\n📋 3. Checkpoint Template Adoption');
console.log('-----------------------------------');

runTest('Critical thinking checkpoint template exists', () => {
    const templateExists = readFileIfExists('scheduler/templates/CRITICAL-THINKING-CHECKPOINT-TEMPLATE.md');
    return templateExists !== null;
});

runTest('Checkpoint template is comprehensive', () => {
    const template = readFileIfExists('scheduler/templates/CRITICAL-THINKING-CHECKPOINT-TEMPLATE.md');
    if (!template) return false;
    
    // Check for all four Circle perspectives
    const hasPragmatist = template.includes('Pragmatist');
    const hasSkeptic = template.includes('Skeptic');
    const hasGuardian = template.includes('Guardian');
    const hasDreamer = template.includes('Dreamer');
    
    return hasPragmatist && hasSkeptic && hasGuardian && hasDreamer;
});

runTest('Template provides actionable guidance', () => {
    const template = readFileIfExists('scheduler/templates/CRITICAL-THINKING-CHECKPOINT-TEMPLATE.md');
    if (!template) return false;
    
    // Look for actionable elements
    return template.includes('Key Questions') && 
           template.includes('Assessment') && 
           template.includes('Recommendation');
});

console.log('\n📋 4. Checkpoint Effectiveness Measurement');
console.log('------------------------------------------');

runTest('Checkpoint usage can be tracked and measured', () => {
    // Check if there's infrastructure for tracking checkpoint usage
    const circleDoc = readFileIfExists('docs/THE-CIRCLE-PLANNING-INTEGRATION.md');
    const template = readFileIfExists('scheduler/templates/CRITICAL-THINKING-CHECKPOINT-TEMPLATE.md');
    
    if (!circleDoc || !template) return false;
    
    // Look for measurement or tracking guidance
    return (circleDoc.includes('metric') || circleDoc.includes('measure') || 
            circleDoc.includes('track') || circleDoc.includes('analysis')) &&
           (template.includes('Document') || template.includes('record') ||
            template.includes('storage'));
});

runTest('Checkpoint outcomes can be evaluated', () => {
    const template = readFileIfExists('scheduler/templates/CRITICAL-THINKING-CHECKPOINT-TEMPLATE.md');
    if (!template) return false;
    
    // Template should provide evaluation criteria
    return template.includes('evaluation') || 
           template.includes('criteria') ||
           template.includes('success');
});

runTest('Evidence collection for checkpoint effectiveness exists', () => {
    const template = readFileIfExists('scheduler/templates/CRITICAL-THINKING-CHECKPOINT-TEMPLATE.md');
    if (!template) return false;
    
    // Look for evidence collection requirements
    return template.includes('evidence') || 
           template.includes('validation') ||
           template.includes('outcomes');
});

console.log('\n📋 5. Integration with Validation Workflow');
console.log('------------------------------------------');

runTest('Checkpoint integration with 3-layer validation exists', () => {
    const circleDoc = readFileIfExists('docs/THE-CIRCLE-PLANNING-INTEGRATION.md');
    if (!circleDoc) return false;
    
    // Look for integration with existing validation layers
    return circleDoc.includes('Layer 1') || 
           circleDoc.includes('Layer 2') || 
           circleDoc.includes('Layer 3') ||
           circleDoc.includes('validation');
});

runTest('TDD methodology includes checkpoint considerations', () => {
    const circleDoc = readFileIfExists('docs/THE-CIRCLE-PLANNING-INTEGRATION.md');
    if (!circleDoc) return false;
    
    // Look for TDD integration
    return circleDoc.includes('TDD') || 
           circleDoc.includes('Test-Driven') ||
           circleDoc.includes('testing');
});

runTest('Validation workflow enhanced with Circle analysis', () => {
    const agentsContent = readFileIfExists('AGENTS.md');
    if (!agentsContent) return false;
    
    // Look for Circle integration in validation sections
    const validationSection = agentsContent.toLowerCase();
    return validationSection.includes('circle') || 
           validationSection.includes('perspective');
});

console.log('\n📋 6. Recommendations for Improvement Exist');
console.log('--------------------------------------------');

runTest('Previous validation reports include improvement recommendations', () => {
    const p23aReport = readFileIfExists('docs/validation-reports/p2-3-a-circle-assessment.md');
    if (!p23aReport) return false;
    
    return p23aReport.includes('Recommendation') || 
           p23aReport.includes('recommend') ||
           p23aReport.includes('improvement');
});

runTest('Circle integration documentation includes enhancement opportunities', () => {
    const circleDoc = readFileIfExists('docs/THE-CIRCLE-PLANNING-INTEGRATION.md');
    if (!circleDoc) return false;
    
    return circleDoc.includes('enhancement') || 
           circleDoc.includes('improvement') ||
           circleDoc.includes('Next Steps');
});

runTest('Template includes guidance for iterative improvement', () => {
    const template = readFileIfExists('scheduler/templates/CRITICAL-THINKING-CHECKPOINT-TEMPLATE.md');
    if (!template) return false;
    
    return template.includes('improvement') || 
           template.includes('iteration') ||
           template.includes('refine');
});

console.log('\n📊 Test Results Summary');
console.log('=======================');
console.log(`Total Tests: ${totalTests}`);
console.log(`Passed: ${passedTests}`);
console.log(`Failed: ${failedTests}`);
console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

if (failedTests === 0) {
    console.log('\n🎉 All tests passed! Checkpoint usage appears to be well-integrated.');
} else {
    console.log('\n⚠️  Some tests failed. This indicates areas where checkpoint usage could be improved.');
}

console.log('\n📝 Next Steps:');
console.log('1. Analyze test results to understand checkpoint usage patterns');
console.log('2. Perform detailed effectiveness analysis');
console.log('3. Create effectiveness report with recommendations');
console.log('4. Re-run tests to verify improvements');

// Exit with appropriate code
process.exit(failedTests === 0 ? 0 : 1);