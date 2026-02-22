#!/usr/bin/env node

/**
 * P2-4-A System Documentation Validation Tests
 * 
 * Tests that comprehensive system documentation exists and is complete.
 * This validates the system enhancement summary covering all Phase 1 & 2 changes.
 * 
 * Run with: node tests/p2-4-a-system-docs-validation.js
 */

const fs = require('fs');
const path = require('path');

let testsPassed = 0;
let testsFailed = 0;

function test(description, testFn) {
  try {
    testFn();
    console.log(`✅ ${description}`);
    testsPassed++;
  } catch (error) {
    console.log(`❌ ${description}`);
    console.log(`   Error: ${error.message}`);
    testsFailed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function readFileContent(filePath) {
  const fullPath = path.resolve(filePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File does not exist: ${filePath}`);
  }
  return fs.readFileSync(fullPath, 'utf8');
}

console.log('🧪 P2-4-A System Documentation Validation Tests');
console.log('='.repeat(60));

// Test 1: Main system enhancement summary document exists
test('System enhancement summary document exists', () => {
  const content = readFileContent('docs/PROACTIVE-JOB-SYSTEM-ENHANCEMENTS.md');
  assert(content.length > 0, 'Document should not be empty');
  assert(content.includes('# Proactive Job System Enhancements'), 'Document should have proper title');
});

// Test 2: Phase 1 & 2 overview is comprehensive
test('Phase 1 & 2 overview is comprehensive', () => {
  const content = readFileContent('docs/PROACTIVE-JOB-SYSTEM-ENHANCEMENTS.md');
  assert(content.includes('## Phase 1'), 'Should document Phase 1');
  assert(content.includes('## Phase 2'), 'Should document Phase 2');
  assert(content.includes('AGENTS.md'), 'Should mention AGENTS.md changes');
  assert(content.includes('PROACTIVE-JOBS'), 'Should mention template changes');
  assert(content.includes('testing'), 'Should mention testing requirements');
  assert(content.includes('validation'), 'Should mention validation workflow');
});

// Test 3: Testing requirements section is complete
test('Testing requirements section is complete', () => {
  const content = readFileContent('docs/PROACTIVE-JOB-SYSTEM-ENHANCEMENTS.md');
  assert(content.includes('## Testing Requirements'), 'Should have testing requirements section');
  assert(content.includes('TDD'), 'Should mention TDD methodology');
  assert(content.includes('Jest'), 'Should mention Jest framework');
  assert(content.includes('RED → GREEN → REFACTOR'), 'Should explain TDD cycle');
  assert(content.includes('test evidence'), 'Should require test evidence');
});

// Test 4: Validation workflow is documented with examples
test('Validation workflow is documented with examples', () => {
  const content = readFileContent('docs/PROACTIVE-JOB-SYSTEM-ENHANCEMENTS.md');
  assert(content.includes('## Validation Workflow'), 'Should have validation workflow section');
  assert(content.includes('3-layer validation'), 'Should mention 3-layer validation');
  assert(content.includes('Layer 1'), 'Should describe Layer 1 validation');
  assert(content.includes('Layer 2'), 'Should describe Layer 2 validation');
  assert(content.includes('Layer 3'), 'Should describe Layer 3 validation');
  assert(content.includes('example'), 'Should include examples');
});

// Test 5: Circle integration is documented
test('Circle integration is documented', () => {
  const content = readFileContent('docs/PROACTIVE-JOB-SYSTEM-ENHANCEMENTS.md');
  assert(content.includes('## Circle Integration'), 'Should have Circle integration section');
  assert(content.includes('critical thinking'), 'Should mention critical thinking');
  assert(content.includes('Pragmatist'), 'Should mention Pragmatist perspective');
  assert(content.includes('Skeptic'), 'Should mention Skeptic perspective');
  assert(content.includes('Guardian'), 'Should mention Guardian perspective');
});

// Test 6: Architecture changes are documented
test('Architecture changes are documented', () => {
  const content = readFileContent('docs/PROACTIVE-JOB-SYSTEM-ENHANCEMENTS.md');
  assert(content.includes('## Architecture Changes'), 'Should have architecture changes section');
  assert(content.includes('Management Hierarchy'), 'Should mention management hierarchy');
  assert(content.includes('Worker'), 'Should mention worker changes');
  assert(content.includes('Coordinator'), 'Should mention coordinator changes');
  assert(content.includes('Validator'), 'Should mention validator changes');
});

// Test 7: Key file modifications are listed
test('Key file modifications are listed', () => {
  const content = readFileContent('docs/PROACTIVE-JOB-SYSTEM-ENHANCEMENTS.md');
  assert(content.includes('## Modified Files'), 'Should list modified files');
  assert(content.includes('AGENTS.md'), 'Should list AGENTS.md');
  assert(content.includes('PLANNING-SYSTEM.md'), 'Should list planning system');
  assert(content.includes('VERIFICATION'), 'Should list verification files');
});

// Test 8: Quick-start guide exists
test('Quick-start guide exists and is comprehensive', () => {
  const content = readFileContent('docs/PROACTIVE-JOB-SYSTEM-ENHANCEMENTS.md');
  assert(content.includes('## Quick Start Guide'), 'Should have quick start section');
  assert(content.includes('Creating Tasks'), 'Should explain task creation');
  assert(content.includes('Acceptance Criteria'), 'Should explain acceptance criteria');
  assert(content.includes('Testing Framework'), 'Should explain testing setup');
  assert(content.includes('Example'), 'Should include examples');
});

// Test 9: Implementation timeline is documented
test('Implementation timeline is documented', () => {
  const content = readFileContent('docs/PROACTIVE-JOB-SYSTEM-ENHANCEMENTS.md');
  assert(content.includes('## Implementation Timeline'), 'Should have timeline section');
  assert(content.includes('2026-02'), 'Should include actual dates');
  assert(content.includes('Phase 1'), 'Should show phase progression');
  assert(content.includes('Phase 2'), 'Should show phase progression');
});

// Test 10: Benefits and outcomes are documented
test('Benefits and outcomes are documented', () => {
  const content = readFileContent('docs/PROACTIVE-JOB-SYSTEM-ENHANCEMENTS.md');
  assert(content.includes('## Benefits'), 'Should document benefits');
  assert(content.includes('quality'), 'Should mention quality improvements');
  assert(content.includes('validation'), 'Should mention validation improvements');
  assert(content.includes('testing'), 'Should mention testing improvements');
});

// Test 11: Usage examples are provided
test('Usage examples are provided', () => {
  const content = readFileContent('docs/PROACTIVE-JOB-SYSTEM-ENHANCEMENTS.md');
  assert(content.includes('## Usage Examples'), 'Should have usage examples');
  assert(content.includes('```'), 'Should include code examples');
  assert(content.includes('Task Template'), 'Should show task template usage');
});

// Test 12: Migration guide exists for existing tasks
test('Migration guide exists for existing tasks', () => {
  const content = readFileContent('docs/PROACTIVE-JOB-SYSTEM-ENHANCEMENTS.md');
  assert(content.includes('## Migration Guide'), 'Should have migration section');
  assert(content.includes('existing tasks'), 'Should address existing tasks');
  assert(content.includes('upgrade'), 'Should explain upgrade process');
});

// Test 13: Troubleshooting section exists
test('Troubleshooting section exists', () => {
  const content = readFileContent('docs/PROACTIVE-JOB-SYSTEM-ENHANCEMENTS.md');
  assert(content.includes('## Troubleshooting'), 'Should have troubleshooting section');
  assert(content.includes('Common Issues'), 'Should list common issues');
  assert(content.includes('Solution'), 'Should provide solutions');
});

// Test 14: References section is complete
test('References section is complete', () => {
  const content = readFileContent('docs/PROACTIVE-JOB-SYSTEM-ENHANCEMENTS.md');
  assert(content.includes('## References'), 'Should have references section');
  assert(content.includes('MASTER-PLAN.md'), 'Should reference master plan');
  assert(content.includes('PHASE-1.md'), 'Should reference phase documents');
  assert(content.includes('AGENTS.md'), 'Should reference agents documentation');
});

// Test 15: Document structure is logical and complete
test('Document structure is logical and complete', () => {
  const content = readFileContent('docs/PROACTIVE-JOB-SYSTEM-ENHANCEMENTS.md');
  
  // Check for logical flow of sections
  const sections = [
    '# Proactive Job System Enhancements',
    '## Executive Summary',
    '## Phase 1',
    '## Phase 2', 
    '## Testing Requirements',
    '## Validation Workflow',
    '## Circle Integration',
    '## Architecture Changes',
    '## Quick Start Guide',
    '## Migration Guide',
    '## Troubleshooting',
    '## References'
  ];
  
  let lastIndex = -1;
  sections.forEach(section => {
    const index = content.indexOf(section);
    assert(index !== -1, `Section "${section}" should exist`);
    assert(index > lastIndex, `Section "${section}" should come after previous section`);
    lastIndex = index;
  });
});

console.log('\n' + '='.repeat(60));
console.log(`📊 Results: ${testsPassed} passed, ${testsFailed} failed`);

if (testsFailed > 0) {
  console.log('\n❌ Tests failed. Create the documentation to make tests pass.');
  process.exit(1);
} else {
  console.log('\n✅ All tests passed! System documentation is comprehensive.');
  process.exit(0);
}