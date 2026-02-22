#!/usr/bin/env node
/**
 * P2-1-a: 3-Layer Validation Workflow Compliance Tests
 * 
 * Purpose: Validates that test tasks properly document the 3-layer validation workflow
 * TDD Phase: RED → Tests should fail initially until workflow documentation is complete
 * 
 * Created: 2026-02-22 by p2-1-a worker
 */

const fs = require('fs');
const path = require('path');

// Test results tracking
let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (error) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// File paths
const testTaskPath = path.join(__dirname, '..', 'docs', 'examples', 'test-task-documentation-validation.md');

console.log('\n🧪 Running 3-Layer Validation Workflow Tests\n');
console.log('=' .repeat(60));

// Check if test task file exists
let testTaskContent = '';
try {
  testTaskContent = fs.readFileSync(testTaskPath, 'utf8');
  console.log(`📁 Found test task file: ${testTaskPath}\n`);
} catch (e) {
  console.log(`❌ Test task file not found: ${testTaskPath}`);
  console.log('   Create the test task to make these tests pass.\n');
  process.exit(1);
}

// ============================================
// SECTION 1: Layer 1 - Self-Validation (Worker)
// ============================================
console.log('\n--- Section 1: Layer 1 Self-Validation ---\n');

test('Layer 1 should be explicitly documented', () => {
  assert(
    /Layer 1|Self.?Validation|Worker.*Validation/i.test(testTaskContent),
    'Layer 1 (Self-Validation) must be documented'
  );
});

test('Layer 1 should require TDD completion', () => {
  const layer1Section = testTaskContent.match(/Layer 1[\s\S]*?(?=Layer 2|###|$)/i);
  const content = layer1Section ? layer1Section[0] : testTaskContent;
  assert(
    /TDD|RED.*GREEN|test.*first/i.test(content),
    'Layer 1 must require TDD methodology completion'
  );
});

test('Layer 1 should require test evidence collection', () => {
  const layer1Section = testTaskContent.match(/Layer 1[\s\S]*?(?=Layer 2|###|$)/i);
  const content = layer1Section ? layer1Section[0] : testTaskContent;
  assert(
    /evidence|collect|document|output|result/i.test(content),
    'Layer 1 must require evidence collection'
  );
});

test('Layer 1 should have checkbox items', () => {
  assert(
    /\[ \]|\[x\]/i.test(testTaskContent),
    'Validation checklist should have checkbox items'
  );
});

test('Layer 1 should require git commit', () => {
  assert(
    /git|commit/i.test(testTaskContent),
    'Layer 1 should require git commit'
  );
});

test('Layer 1 should require acceptance criteria verification', () => {
  assert(
    /acceptance.*criteria|criteria.*met|AC.*meet/i.test(testTaskContent),
    'Layer 1 should verify acceptance criteria are met'
  );
});

// ============================================
// SECTION 2: Layer 2 - Manager Validation (Coordinator)
// ============================================
console.log('\n--- Section 2: Layer 2 Manager Validation ---\n');

test('Layer 2 should be explicitly documented', () => {
  assert(
    /Layer 2|Manager.*Validation|Coordinator/i.test(testTaskContent),
    'Layer 2 (Manager Validation) must be documented'
  );
});

test('Layer 2 should verify test evidence', () => {
  const layer2Section = testTaskContent.match(/Layer 2[\s\S]*?(?=Layer 3|###|$)/i);
  const content = layer2Section ? layer2Section[0] : testTaskContent;
  assert(
    /verif|review|check|evidence|test/i.test(content),
    'Layer 2 must verify test evidence'
  );
});

test('Layer 2 should validate test quality', () => {
  assert(
    /quality|adequate|coverage|comprehensive/i.test(testTaskContent),
    'Layer 2 should validate test quality'
  );
});

test('Layer 2 should check framework usage', () => {
  assert(
    /framework|method|approach|implement/i.test(testTaskContent),
    'Layer 2 should check testing framework usage'
  );
});

// ============================================
// SECTION 3: Layer 3 - Independent Validation (Validator)
// ============================================
console.log('\n--- Section 3: Layer 3 Independent Validation ---\n');

test('Layer 3 should be explicitly documented', () => {
  assert(
    /Layer 3|Independent|Validator/i.test(testTaskContent),
    'Layer 3 (Independent Validation) must be documented'
  );
});

test('Layer 3 should run tests independently', () => {
  assert(
    /independen|run.*test|test.*independen|verify.*result/i.test(testTaskContent),
    'Layer 3 should run tests independently'
  );
});

test('Layer 3 should check for missed edge cases', () => {
  assert(
    /edge|miss|comprehensive|complete/i.test(testTaskContent),
    'Layer 3 should check for missed edge cases'
  );
});

test('Layer 3 should provide final approval', () => {
  assert(
    /final|approv|complete|pass/i.test(testTaskContent),
    'Layer 3 should provide final approval'
  );
});

// ============================================
// SECTION 4: Status Progression
// ============================================
console.log('\n--- Section 4: Status Progression ---\n');

test('Should document status progression', () => {
  assert(
    /status|pending|in-progress|self-validated|needs-validation|validated|complete/i.test(testTaskContent),
    'Should document status progression states'
  );
});

test('Should show self-validated state', () => {
  assert(
    /self-validated/i.test(testTaskContent),
    'Must include self-validated status state'
  );
});

test('Should show needs-validation state', () => {
  assert(
    /needs-validation/i.test(testTaskContent),
    'Must include needs-validation status state'
  );
});

// ============================================
// SECTION 5: Workflow Requirements
// ============================================
console.log('\n--- Section 5: Workflow Completeness ---\n');

test('Should have clear handoff points between layers', () => {
  assert(
    /then|after|when|next|proceed|status.*change/i.test(testTaskContent),
    'Should document handoff points between validation layers'
  );
});

test('Should document what cannot be bypassed', () => {
  assert(
    /cannot|must|required|mandatory|before/i.test(testTaskContent),
    'Should document mandatory workflow requirements'
  );
});

test('Each layer should have specific responsibilities', () => {
  // Check for different keywords in different sections
  const hasLayerDistinction = 
    testTaskContent.includes('Worker') &&
    testTaskContent.includes('Coordinator') ||
    testTaskContent.includes('Manager') &&
    testTaskContent.includes('Validator');
  assert(hasLayerDistinction, 'Each layer should have distinct responsibilities');
});

// ============================================
// SECTION 6: Evidence Requirements
// ============================================
console.log('\n--- Section 6: Evidence Collection ---\n');

test('Should specify what evidence to collect', () => {
  assert(
    /evidence|output|screenshot|log|result|report/i.test(testTaskContent),
    'Should specify evidence types to collect'
  );
});

test('Should document evidence location or format', () => {
  assert(
    /file|path|location|format|document|where/i.test(testTaskContent),
    'Should document where/how to store evidence'
  );
});

test('Evidence should be verifiable by validators', () => {
  assert(
    /verif|independen|reproduc|confirm|check/i.test(testTaskContent),
    'Evidence should be independently verifiable'
  );
});

// ============================================
// Final Results
// ============================================
console.log('\n' + '=' .repeat(60));
console.log(`\n📊 Validation Workflow Results: ${passed} passed, ${failed} failed`);
console.log(`   Coverage: ${Math.round(passed / (passed + failed) * 100)}%\n`);

if (failed > 0) {
  console.log('❌ Validation workflow compliance FAILED');
  process.exit(1);
} else {
  console.log('✅ Validation workflow compliance PASSED');
  process.exit(0);
}
