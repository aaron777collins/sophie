#!/usr/bin/env node
/**
 * P2-1-a: Circle Integration Validation Script
 * 
 * Purpose: Validates that test tasks properly integrate Circle thinking checkpoints
 * TDD Phase: RED → Tests should fail initially until Circle integration is added
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

console.log('\n🧪 Running Circle Integration Validation Tests\n');
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
// SECTION 1: Circle Framework Presence
// ============================================
console.log('\n--- Section 1: Circle Framework Integration ---\n');

test('Task should have Circle/Critical Thinking section', () => {
  assert(
    /Circle|Critical Thinking|🎯/i.test(testTaskContent),
    'Missing Circle or Critical Thinking section'
  );
});

test('Task should reference Circle perspectives', () => {
  assert(
    /Pragmatist|Skeptic|Guardian|Dreamer/i.test(testTaskContent),
    'Must reference at least one Circle perspective'
  );
});

test('Task should reference checkpoint template', () => {
  assert(
    /CRITICAL-THINKING-CHECKPOINT-TEMPLATE|checkpoint/i.test(testTaskContent),
    'Should reference Critical Thinking Checkpoint Template'
  );
});

// ============================================
// SECTION 2: Perspective Coverage
// ============================================
console.log('\n--- Section 2: Circle Perspective Coverage ---\n');

test('Should include Pragmatist perspective', () => {
  assert(
    /Pragmatist/i.test(testTaskContent),
    'Must include Pragmatist perspective'
  );
});

test('Should include Skeptic perspective', () => {
  assert(
    /Skeptic/i.test(testTaskContent),
    'Must include Skeptic perspective'
  );
});

test('Should include Guardian perspective', () => {
  assert(
    /Guardian/i.test(testTaskContent),
    'Must include Guardian perspective'
  );
});

test('Should include Dreamer perspective', () => {
  assert(
    /Dreamer/i.test(testTaskContent),
    'Must include Dreamer perspective'
  );
});

// ============================================
// SECTION 3: Checkpoint Triggers
// ============================================
console.log('\n--- Section 3: Checkpoint Triggers ---\n');

test('Should identify when checkpoints are needed', () => {
  assert(
    /checkpoint.*when|when.*checkpoint|trigger/i.test(testTaskContent),
    'Should identify checkpoint triggers or timing'
  );
});

test('Should mention architectural or design decisions', () => {
  assert(
    /architect|design|decision|approach/i.test(testTaskContent),
    'Should mention decision points requiring Circle analysis'
  );
});

// ============================================
// SECTION 4: Perspective-Driven Requirements
// ============================================
console.log('\n--- Section 4: Perspective-Driven Analysis ---\n');

test('Pragmatist concerns should be addressed', () => {
  const pragContent = testTaskContent.toLowerCase();
  assert(
    /implement|feasib|resource|practic|execut/i.test(pragContent),
    'Should address Pragmatist concerns (implementation, feasibility)'
  );
});

test('Skeptic concerns should be addressed', () => {
  const skeptContent = testTaskContent.toLowerCase();
  assert(
    /risk|fail|edge.?case|wrong|issue|problem/i.test(skeptContent),
    'Should address Skeptic concerns (risks, edge cases, failures)'
  );
});

test('Guardian concerns should be addressed', () => {
  const guardContent = testTaskContent.toLowerCase();
  assert(
    /secur|protect|safe|compli|valid|integr/i.test(guardContent),
    'Should address Guardian concerns (security, compliance, protection)'
  );
});

test('Dreamer concerns should be addressed', () => {
  const dreamContent = testTaskContent.toLowerCase();
  assert(
    /vision|future|scal|grow|long.?term|strateg/i.test(dreamContent),
    'Should address Dreamer concerns (vision, scalability, strategy)'
  );
});

// ============================================
// SECTION 5: Integration with Testing
// ============================================
console.log('\n--- Section 5: Circle-Testing Integration ---\n');

test('Should connect Circle perspectives to testing strategy', () => {
  assert(
    /test.*perspect|perspect.*test|validate.*concern/i.test(testTaskContent) ||
    (testTaskContent.includes('Skeptic') && testTaskContent.includes('edge')),
    'Should connect Circle perspectives to testing approach'
  );
});

test('Should have perspective-informed test categories', () => {
  // Check if different test types address different perspectives
  const hasMultipleTestTypes = (
    /unit|integration|e2e|functional|security|performance/i.test(testTaskContent)
  );
  assert(hasMultipleTestTypes, 'Should have multiple test types informed by perspectives');
});

// ============================================
// SECTION 6: Checkpoint Documentation
// ============================================
console.log('\n--- Section 6: Checkpoint Documentation ---\n');

test('Should document checkpoint timing or phases', () => {
  assert(
    /phase|before|after|during|init|plan|design|implement/i.test(testTaskContent),
    'Should document when checkpoints occur in workflow'
  );
});

test('Should have actionable checkpoint outcomes', () => {
  assert(
    /action|outcome|decision|proceed|modif|block|mitiga/i.test(testTaskContent),
    'Should document checkpoint outcomes or actions'
  );
});

// ============================================
// Final Results
// ============================================
console.log('\n' + '=' .repeat(60));
console.log(`\n📊 Circle Integration Results: ${passed} passed, ${failed} failed`);
console.log(`   Coverage: ${Math.round(passed / (passed + failed) * 100)}%\n`);

if (failed > 0) {
  console.log('❌ Circle integration validation FAILED');
  process.exit(1);
} else {
  console.log('✅ Circle integration validation PASSED');
  process.exit(0);
}
