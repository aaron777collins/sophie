#!/usr/bin/env node

/**
 * p2-2-c: Test that Coordinator properly applies new acceptance criteria standards
 * 
 * This test suite validates that scheduler/coordinator/IDENTITY.md contains
 * all required acceptance criteria standards and validation workflow documentation.
 * 
 * TDD Approach: Write tests FIRST, run them (should FAIL), then analyze/implement
 */

const fs = require('fs');
const path = require('path');

// Test configuration
const COORDINATOR_IDENTITY_PATH = path.join(__dirname, '..', 'scheduler', 'coordinator', 'IDENTITY.md');

// Test state tracking
let testResults = [];
let totalTests = 0;
let passedTests = 0;

function runTest(testName, testFn) {
  totalTests++;
  try {
    const result = testFn();
    if (result) {
      passedTests++;
      console.log(`✅ ${testName}`);
      testResults.push({ name: testName, passed: true, error: null });
    } else {
      console.log(`❌ ${testName}`);
      testResults.push({ name: testName, passed: false, error: 'Test returned false' });
    }
  } catch (error) {
    console.log(`❌ ${testName}: ${error.message}`);
    testResults.push({ name: testName, passed: false, error: error.message });
  }
}

// Helper function to load coordinator identity content
function loadCoordinatorIdentity() {
  if (!fs.existsSync(COORDINATOR_IDENTITY_PATH)) {
    throw new Error(`Coordinator IDENTITY.md not found at ${COORDINATOR_IDENTITY_PATH}`);
  }
  return fs.readFileSync(COORDINATOR_IDENTITY_PATH, 'utf8');
}

console.log('🧪 Running test suite: Coordinator Validation Standards');
console.log('📁 Testing file:', COORDINATOR_IDENTITY_PATH);
console.log('');

// ========================================
// ACCEPTANCE CRITERIA STANDARDS TESTS
// ========================================

runTest('should document acceptance criteria validation requirements', () => {
  const content = loadCoordinatorIdentity();
  return content.includes('acceptance criteria') && 
         content.includes('validation') &&
         (content.includes('Given-When-Then') || content.includes('Given') && content.includes('When') && content.includes('Then'));
});

runTest('should reference AGENTS.md testing standards', () => {
  const content = loadCoordinatorIdentity();
  return content.includes('AGENTS.md') && 
         (content.includes('testing standards') || content.includes('testing requirements'));
});

runTest('should document AC format requirements', () => {
  const content = loadCoordinatorIdentity();
  return (content.includes('Acceptance Criteria') || content.includes('AC')) &&
         (content.includes('format') || content.includes('structure') || content.includes('Given-When-Then'));
});

runTest('should require test methods in acceptance criteria', () => {
  const content = loadCoordinatorIdentity();
  return content.includes('test method') || 
         content.includes('Test Method') ||
         (content.includes('test') && content.includes('evidence'));
});

runTest('should document evidence collection requirements', () => {
  const content = loadCoordinatorIdentity();
  return content.includes('evidence') && 
         (content.includes('collection') || content.includes('required') || content.includes('screenshot'));
});

// ========================================
// L2 VALIDATION PROCESS TESTS  
// ========================================

runTest('should document Layer 2 validation responsibility', () => {
  const content = loadCoordinatorIdentity();
  return (content.includes('Layer 2') || content.includes('L2')) &&
         content.includes('validation') &&
         (content.includes('Coordinator') || content.includes('Manager'));
});

runTest('should document L2 validation checklist', () => {
  const content = loadCoordinatorIdentity();
  return content.includes('validation') && 
         (content.includes('checklist') || content.includes('MUST') || content.includes('requirements'));
});

runTest('should document fresh perspective requirement for L2', () => {
  const content = loadCoordinatorIdentity();
  return content.includes('fresh perspective') ||
         (content.includes('independent') && content.includes('validation')) ||
         content.includes('FRESH PERSPECTIVE');
});

runTest('should document sub-agent spawning for L2 validation', () => {
  const content = loadCoordinatorIdentity();
  return (content.includes('spawn') || content.includes('sub-agent')) &&
         content.includes('validation') &&
         (content.includes('L2') || content.includes('Layer 2'));
});

runTest('should document test server validation requirement', () => {
  const content = loadCoordinatorIdentity();
  return (content.includes('test server') || content.includes('TEST SERVER')) &&
         (content.includes('dev2') || content.includes('localhost') || content.includes('server'));
});

runTest('should document testing framework validation for L2', () => {
  const content = loadCoordinatorIdentity();
  return (content.includes('Playwright') || content.includes('testing framework')) &&
         content.includes('validation') &&
         (content.includes('L2') || content.includes('Layer 2'));
});

// ========================================
// VALIDATION REQUEST WORKFLOW TESTS
// ========================================

runTest('should document validation request process', () => {
  const content = loadCoordinatorIdentity();
  return content.includes('validation request') ||
         (content.includes('send to Validator') || content.includes('send to validator'));
});

runTest('should document inbox usage for validation requests', () => {
  const content = loadCoordinatorIdentity();
  return content.includes('inbox') && 
         (content.includes('validator') || content.includes('Validator')) &&
         content.includes('scheduler/inboxes');
});

runTest('should document validation request format', () => {
  const content = loadCoordinatorIdentity();
  return content.includes('validation-request') ||
         (content.includes('validation request') && content.includes('json'));
});

runTest('should document required validation request fields', () => {
  const content = loadCoordinatorIdentity();
  return content.includes('task_ids') ||
         (content.includes('acceptance_criteria') && content.includes('validation request')) ||
         content.includes('self_validation_notes');
});

// ========================================
// SEND TO VALIDATOR PROCESS TESTS
// ========================================

runTest('should document when to send to Validator', () => {
  const content = loadCoordinatorIdentity();
  return content.includes('after self-validation') ||
         (content.includes('send to Validator') && content.includes('L2')) ||
         content.includes('SEND TO VALIDATOR');
});

runTest('should document Validator inbox path', () => {
  const content = loadCoordinatorIdentity();
  return content.includes('scheduler/inboxes/validator') ||
         (content.includes('validator') && content.includes('inbox'));
});

runTest('should document validation request creation command', () => {
  const content = loadCoordinatorIdentity();
  return content.includes('cat >') &&
         content.includes('validator') &&
         (content.includes('.json') || content.includes('validation-request'));
});

runTest('should document validation request timestamp requirement', () => {
  const content = loadCoordinatorIdentity();
  return (content.includes('timestamp') || content.includes('$(date')) &&
         content.includes('validation') &&
         content.includes('request');
});

// ========================================
// 3-LAYER VALIDATION INTEGRATION TESTS
// ========================================

runTest('should document all three validation layers', () => {
  const content = loadCoordinatorIdentity();
  return (content.includes('Layer 1') || content.includes('L1')) &&
         (content.includes('Layer 2') || content.includes('L2')) &&
         (content.includes('Layer 3') || content.includes('L3'));
});

runTest('should document Worker (L1) responsibilities', () => {
  const content = loadCoordinatorIdentity();
  return (content.includes('Worker') || content.includes('L1') || content.includes('Layer 1')) &&
         content.includes('self-validation');
});

runTest('should document Coordinator (L2) responsibilities', () => {
  const content = loadCoordinatorIdentity();
  return (content.includes('Coordinator') || content.includes('L2') || content.includes('Layer 2')) &&
         content.includes('validation') &&
         content.includes('manager');
});

runTest('should document Validator (L3) responsibilities', () => {
  const content = loadCoordinatorIdentity();
  return (content.includes('Validator') || content.includes('L3') || content.includes('Layer 3')) &&
         content.includes('independent');
});

runTest('should document validation flow progression', () => {
  const content = loadCoordinatorIdentity();
  return content.includes('self-validated') &&
         content.includes('validated') &&
         (content.includes('complete') || content.includes('status'));
});

runTest('should document mandatory verification checklist', () => {
  const content = loadCoordinatorIdentity();
  return content.includes('MANDATORY VERIFICATION CHECKLIST') ||
         (content.includes('verification') && content.includes('checklist') && content.includes('MUST'));
});

runTest('should require actual command output in validation', () => {
  const content = loadCoordinatorIdentity();
  return content.includes('ACTUAL OUTPUT') ||
         content.includes('PASTE OUTPUT') ||
         (content.includes('command output') && content.includes('verification'));
});

// ========================================
// TDD AND TESTING INTEGRATION TESTS
// ========================================

runTest('should document TDD requirement', () => {
  const content = loadCoordinatorIdentity();
  return content.includes('TDD') ||
         content.includes('Test-Driven Development') ||
         (content.includes('RED') && content.includes('GREEN'));
});

runTest('should document testing framework requirements', () => {
  const content = loadCoordinatorIdentity();
  return content.includes('Jest') ||
         content.includes('Playwright') ||
         content.includes('testing framework');
});

runTest('should document "No Task Without Tests" policy', () => {
  const content = loadCoordinatorIdentity();
  return content.includes('No Task Without Tests') ||
         content.includes('NO feature is complete without passing tests');
});

// ========================================
// STATUS AND WORKFLOW INTEGRATION TESTS
// ========================================

runTest('should document status progression with validation states', () => {
  const content = loadCoordinatorIdentity();
  return content.includes('needs-validation') &&
         content.includes('self-validated') &&
         content.includes('validated');
});

runTest('should document status update responsibilities', () => {
  const content = loadCoordinatorIdentity();
  return content.includes('Status') &&
         content.includes('Who Sets') &&
         content.includes('Coordinator');
});

runTest('should document validation failure handling', () => {
  const content = loadCoordinatorIdentity();
  return content.includes('FAIL') &&
         content.includes('back to') &&
         (content.includes('in-progress') || content.includes('worker'));
});

// Run summary
console.log('');
console.log('📊 Test Results Summary:');
console.log(`✅ Passed: ${passedTests}/${totalTests} (${Math.round(passedTests/totalTests*100)}%)`);
console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
console.log('');

if (passedTests === totalTests) {
  console.log('🎉 All tests passed! Coordinator IDENTITY.md has comprehensive validation standards.');
} else {
  console.log('⚠️  Some tests failed. Coordinator IDENTITY.md may need enhancement.');
  console.log('');
  console.log('Failed tests:');
  testResults.filter(t => !t.passed).forEach(t => {
    console.log(`  • ${t.name}: ${t.error}`);
  });
}

console.log('');
console.log('💾 Test execution complete. Results logged for validation report.');

// Exit with appropriate code
process.exit(passedTests === totalTests ? 0 : 1);