#!/usr/bin/env node

/**
 * Simple Node.js validation script for p2-1-b workflow validation
 * Validates that the test task from p2-1-a follows PROACTIVE-JOBS-TEMPLATE.md correctly
 * 
 * Run with: node tests/p2-1-b-workflow-validation.js
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 P2-1-B Workflow Validation Script');
console.log('=====================================');

// Read required files
const testTaskPath = 'docs/examples/test-task-documentation-validation.md';
const templatePath = 'docs/templates/PROACTIVE-JOBS-TEMPLATE.md';
const spawnTemplatePath = 'scheduler/templates/WORKER-SPAWN-TEMPLATE.md';

let testTask = '';
let template = '';
let spawnTemplate = '';

try {
  testTask = fs.readFileSync(testTaskPath, 'utf8');
  console.log('✅ Test task file loaded successfully');
} catch (error) {
  console.log('❌ Failed to load test task:', error.message);
  process.exit(1);
}

try {
  template = fs.readFileSync(templatePath, 'utf8');
  console.log('✅ PROACTIVE-JOBS template loaded successfully');
} catch (error) {
  console.log('❌ Failed to load template:', error.message);
  process.exit(1);
}

try {
  spawnTemplate = fs.readFileSync(spawnTemplatePath, 'utf8');
  console.log('✅ Worker spawn template loaded successfully');
} catch (error) {
  console.log('❌ Failed to load spawn template:', error.message);
  process.exit(1);
}

console.log('\n📋 Validating Template Compliance');
console.log('==================================');

// Test 1: Header Structure
const hasTaskHeader = testTask.includes('## TASK:') && testTask.includes('TEST-DOC-VAL-001');
console.log('Header Structure:', hasTaskHeader ? '✅' : '❌');

// Test 2: Status Fields
const hasStatus = testTask.includes('**Status:**') && testTask.includes('**Started:**');
console.log('Status Fields:', hasStatus ? '✅' : '❌');

// Test 3: Required Fields  
const requiredFields = [
  'Project:',
  'Phase:',
  'Min Model:',
  'Dependencies:',
  'Description:'
];

const hasRequiredFields = requiredFields.every(field => testTask.includes(field));
console.log('Required Fields:', hasRequiredFields ? '✅' : '❌');

// Test 4: Files to Modify Section
const hasFilesToModify = testTask.includes('Files to Create/Modify:') || testTask.includes('**Files to Create/Modify:**');
console.log('Files to Modify:', hasFilesToModify ? '✅' : '❌');

// Test 5: Acceptance Criteria
const hasAcceptanceCriteria = testTask.includes('## Acceptance Criteria');
console.log('Acceptance Criteria Section:', hasAcceptanceCriteria ? '✅' : '❌');

// Test 6: Given-When-Then Format
const hasGivenWhenThen = testTask.includes('**Given**') && testTask.includes('**When**') && testTask.includes('**Then**');
console.log('Given-When-Then Format:', hasGivenWhenThen ? '✅' : '❌');

// Test 7: Test Method and Evidence
const hasTestMethod = testTask.includes('**Test Method:**');
const hasEvidenceRequired = testTask.includes('**Evidence Required:**');
console.log('Test Method Specified:', hasTestMethod ? '✅' : '❌');
console.log('Evidence Required Specified:', hasEvidenceRequired ? '✅' : '❌');

// Test 8: Testing Requirements Section
const hasTestingRequirements = testTask.includes('## Testing Requirements (MANDATORY)');
console.log('Testing Requirements Section:', hasTestingRequirements ? '✅' : '❌');

// Test 9: TDD Approach
const hasTDD = testTask.includes('**RED:**') && testTask.includes('**GREEN:**') && testTask.includes('**REFACTOR:**');
console.log('TDD Approach (RED-GREEN-REFACTOR):', hasTDD ? '✅' : '❌');

// Test 10: Testing Framework
const hasTestingFramework = testTask.includes('**Testing Framework:**');
console.log('Testing Framework Specified:', hasTestingFramework ? '✅' : '❌');

// Test 11: 3-Layer Validation Checklist
const hasLayer1 = testTask.includes('### Layer 1: Self-Validation (Worker)');
const hasLayer2 = testTask.includes('### Layer 2: Manager Validation (Coordinator)');
const hasLayer3 = testTask.includes('### Layer 3: Independent Validation (Validator)');
console.log('3-Layer Validation Structure:', (hasLayer1 && hasLayer2 && hasLayer3) ? '✅' : '❌');

// Test 12: Test Evidence Section
const hasTestEvidence = testTask.includes('## Test Evidence');
console.log('Test Evidence Section:', hasTestEvidence ? '✅' : '❌');

// Test 13: Reference Materials
const hasReferences = testTask.includes('## Reference Materials') || testTask.includes('Reference Materials');
console.log('Reference Materials:', hasReferences ? '✅' : '❌');

// Test 14: Circle Thinking Integration
const hasCircleCheckpoint = testTask.includes('Critical Thinking Checkpoint') || testTask.includes('Circle');
console.log('Circle Thinking Integration:', hasCircleCheckpoint ? '✅' : '❌');

// Test 15: Contingencies
const hasContingencies = testTask.includes('## Contingencies') || testTask.includes('contingencies');
console.log('Contingencies Section:', hasContingencies ? '✅' : '❌');

console.log('\n🔍 Content Quality Assessment');
console.log('==============================');

// Test 16: Multiple Acceptance Criteria
const acMatches = testTask.match(/### AC-\d+:/g);
const hasMultipleAC = acMatches && acMatches.length >= 3;
console.log(`Multiple Acceptance Criteria (${acMatches ? acMatches.length : 0}/3+ required):`, hasMultipleAC ? '✅' : '❌');

// Test 17: Description Length
const descriptionMatch = testTask.match(/\*\*Description:\*\*\s*\n([\s\S]*?)\n\n\*\*Files/);
const descriptionLength = descriptionMatch ? descriptionMatch[1].trim().length : 0;
const hasGoodDescription = descriptionLength > 100;
console.log(`Description Length (${descriptionLength} chars, min 100):`, hasGoodDescription ? '✅' : '❌');

// Test 18: Status Progression
const hasStatusProgression = testTask.includes('pending') && testTask.includes('in-progress') && testTask.includes('validated');
console.log('Status Progression Documentation:', hasStatusProgression ? '✅' : '❌');

console.log('\n🏗️ Worker Spawn Template Assessment');
console.log('====================================');

// Test 19: TDD section in spawn template
const spawnHasTDD = spawnTemplate.includes('TDD APPROACH (MANDATORY)');
console.log('Spawn Template has TDD guidance:', spawnHasTDD ? '✅' : '❌');

// Test 20: Critical thinking checkpoints in spawn template
const spawnHasCheckpoints = spawnTemplate.includes('CRITICAL THINKING CHECKPOINTS');
console.log('Spawn Template has Circle checkpoints:', spawnHasCheckpoints ? '✅' : '❌');

// Test 21: Completion steps in spawn template
const spawnHasCompletion = spawnTemplate.includes('WHEN DONE (CRITICAL');
console.log('Spawn Template has completion steps:', spawnHasCompletion ? '✅' : '❌');

// Test 22: Status flow explanation
const spawnHasStatusFlow = spawnTemplate.includes('STATUS FLOW');
console.log('Spawn Template explains status flow:', spawnHasStatusFlow ? '✅' : '❌');

console.log('\n📊 Validation Summary');
console.log('=====================');

// Count passing tests
const tests = [
  hasTaskHeader, hasStatus, hasRequiredFields, hasFilesToModify,
  hasAcceptanceCriteria, hasGivenWhenThen, hasTestMethod, hasEvidenceRequired,
  hasTestingRequirements, hasTDD, hasTestingFramework,
  (hasLayer1 && hasLayer2 && hasLayer3), hasTestEvidence, hasReferences,
  hasCircleCheckpoint, hasContingencies, hasMultipleAC, hasGoodDescription,
  hasStatusProgression, spawnHasTDD, spawnHasCheckpoints, spawnHasCompletion,
  spawnHasStatusFlow
];

const passingTests = tests.filter(test => test).length;
const totalTests = tests.length;
const passRate = ((passingTests / totalTests) * 100).toFixed(1);

console.log(`Tests Passing: ${passingTests}/${totalTests} (${passRate}%)`);

if (passingTests === totalTests) {
  console.log('🎉 ALL TESTS PASS - Template compliance verified!');
  process.exit(0);
} else {
  console.log(`⚠️  ${totalTests - passingTests} tests failed - see details above`);
  process.exit(1);
}