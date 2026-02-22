#!/usr/bin/env node
/**
 * P2-1-a: Template Compliance Validation Script
 * 
 * Purpose: Validates that test tasks follow PROACTIVE-JOBS-TEMPLATE.md format
 * TDD Phase: RED → Tests should fail initially until test task is created
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

console.log('\n🧪 Running Template Compliance Validation Tests\n');
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
// SECTION 1: Header & Status Fields
// ============================================
console.log('\n--- Section 1: Header & Status Fields ---\n');

test('Task should have proper TASK header with ID', () => {
  assert(
    /## TASK: \S+ -/.test(testTaskContent),
    'Missing proper TASK header format (## TASK: {id} - {description})'
  );
});

test('Task should have Status field', () => {
  assert(
    /\*\*Status:\*\*/.test(testTaskContent),
    'Missing Status field'
  );
});

test('Status should be one of valid values', () => {
  const statusMatch = testTaskContent.match(/\*\*Status:\*\*\s*(\S+)/);
  assert(statusMatch, 'Cannot parse Status field');
  const validStatuses = ['pending', 'in-progress', 'self-validated', 'needs-validation', 'validated', 'complete'];
  assert(
    validStatuses.includes(statusMatch[1].toLowerCase()),
    `Invalid status: ${statusMatch[1]}. Must be one of: ${validStatuses.join(', ')}`
  );
});

test('Task should have Project field', () => {
  assert(
    /\*\*Project:\*\*/.test(testTaskContent),
    'Missing Project field'
  );
});

test('Task should have Phase field', () => {
  assert(
    /\*\*Phase:\*\*/.test(testTaskContent),
    'Missing Phase field'
  );
});

test('Task should have Min Model field', () => {
  assert(
    /\*\*Min Model:\*\*/.test(testTaskContent),
    'Missing Min Model field'
  );
});

test('Task should have Dependencies field', () => {
  assert(
    /\*\*Dependencies:\*\*/.test(testTaskContent),
    'Missing Dependencies field'
  );
});

// ============================================
// SECTION 2: Description & Files
// ============================================
console.log('\n--- Section 2: Description & File Changes ---\n');

test('Task should have Description section', () => {
  assert(
    /\*\*Description:\*\*/.test(testTaskContent),
    'Missing Description section'
  );
});

test('Description should be substantive (>50 chars)', () => {
  const descMatch = testTaskContent.match(/\*\*Description:\*\*\s*\n([\s\S]*?)(?=\*\*Files|##)/);
  assert(descMatch && descMatch[1].trim().length > 50, 'Description too short (must be >50 chars)');
});

test('Task should have Files to Modify/Create section', () => {
  assert(
    /\*\*Files to (Modify|Create)/.test(testTaskContent),
    'Missing Files to Modify/Create section'
  );
});

test('Task should have Specific Changes Needed section', () => {
  assert(
    /\*\*Specific Changes Needed:\*\*/.test(testTaskContent),
    'Missing Specific Changes Needed section'
  );
});

// ============================================
// SECTION 3: Acceptance Criteria (Given-When-Then)
// ============================================
console.log('\n--- Section 3: Acceptance Criteria Format ---\n');

test('Task should have Acceptance Criteria section', () => {
  assert(
    /## Acceptance Criteria/.test(testTaskContent),
    'Missing Acceptance Criteria section'
  );
});

test('Should have at least 2 acceptance criteria', () => {
  const acMatches = testTaskContent.match(/### AC-\d+:/g);
  assert(acMatches && acMatches.length >= 2, 'Must have at least 2 acceptance criteria');
});

test('Each AC should have Given statement', () => {
  const acSection = testTaskContent.split('## Acceptance Criteria')[1] || '';
  const givenCount = (acSection.match(/\*\*Given\*\*/g) || []).length;
  const acCount = (acSection.match(/### AC-\d+:/g) || []).length;
  assert(givenCount >= acCount, `Each AC needs Given statement. Found ${givenCount} Given for ${acCount} ACs`);
});

test('Each AC should have When statement', () => {
  const acSection = testTaskContent.split('## Acceptance Criteria')[1] || '';
  const whenCount = (acSection.match(/\*\*When\*\*/g) || []).length;
  const acCount = (acSection.match(/### AC-\d+:/g) || []).length;
  assert(whenCount >= acCount, `Each AC needs When statement. Found ${whenCount} When for ${acCount} ACs`);
});

test('Each AC should have Then statement', () => {
  const acSection = testTaskContent.split('## Acceptance Criteria')[1] || '';
  const thenCount = (acSection.match(/\*\*Then\*\*/g) || []).length;
  const acCount = (acSection.match(/### AC-\d+:/g) || []).length;
  assert(thenCount >= acCount, `Each AC needs Then statement. Found ${thenCount} Then for ${acCount} ACs`);
});

test('Each AC should have Test Method', () => {
  const acSection = testTaskContent.split('## Acceptance Criteria')[1] || '';
  const methodCount = (acSection.match(/\*\*Test Method:\*\*/g) || []).length;
  const acCount = (acSection.match(/### AC-\d+:/g) || []).length;
  assert(methodCount >= acCount, `Each AC needs Test Method. Found ${methodCount} for ${acCount} ACs`);
});

test('Each AC should have Evidence Required', () => {
  const acSection = testTaskContent.split('## Acceptance Criteria')[1] || '';
  const evidenceCount = (acSection.match(/\*\*Evidence Required:\*\*/g) || []).length;
  const acCount = (acSection.match(/### AC-\d+:/g) || []).length;
  assert(evidenceCount >= acCount, `Each AC needs Evidence Required. Found ${evidenceCount} for ${acCount} ACs`);
});

// ============================================
// SECTION 4: Testing Requirements (TDD)
// ============================================
console.log('\n--- Section 4: Testing Requirements (TDD) ---\n');

test('Task should have Testing Requirements section', () => {
  assert(
    /## Testing Requirements/.test(testTaskContent),
    'Missing Testing Requirements section'
  );
});

test('Testing Requirements should mention TDD approach', () => {
  const testingSection = testTaskContent.split('## Testing Requirements')[1] || '';
  assert(
    /TDD|Test.?Driven|RED.*GREEN|Green.*Red/i.test(testingSection),
    'Testing Requirements must mention TDD approach'
  );
});

test('Testing Requirements should have RED phase', () => {
  assert(
    /\*\*RED\*\*/.test(testTaskContent) || /RED:/.test(testTaskContent),
    'Must document RED phase (write tests first)'
  );
});

test('Testing Requirements should have GREEN phase', () => {
  assert(
    /\*\*GREEN\*\*/.test(testTaskContent) || /GREEN:/.test(testTaskContent),
    'Must document GREEN phase (implement to pass)'
  );
});

test('Testing Requirements should have REFACTOR phase', () => {
  assert(
    /\*\*REFACTOR\*\*/.test(testTaskContent) || /REFACTOR:/.test(testTaskContent),
    'Must document REFACTOR phase'
  );
});

test('Should specify Testing Framework', () => {
  assert(
    /\*\*Testing Framework:\*\*/.test(testTaskContent),
    'Must specify Testing Framework'
  );
});

test('Should specify Test Types', () => {
  assert(
    /\*\*Test (Types|Strategy):\*\*/.test(testTaskContent),
    'Must specify Test Types or Test Strategy'
  );
});

test('Should list Test Files to Create', () => {
  assert(
    /### Test Files to Create|Test Files|tests?\//i.test(testTaskContent),
    'Must list test files to create'
  );
});

// ============================================
// SECTION 5: Validation Workflow
// ============================================
console.log('\n--- Section 5: 3-Layer Validation Workflow ---\n');

test('Task should have Validation Checklist section', () => {
  assert(
    /## Validation Checklist/.test(testTaskContent),
    'Missing Validation Checklist section'
  );
});

test('Should have Layer 1: Self-Validation section', () => {
  assert(
    /Layer 1.*Self|Self.*Validation.*Worker/i.test(testTaskContent),
    'Missing Layer 1 Self-Validation section'
  );
});

test('Should have Layer 2: Manager Validation section', () => {
  assert(
    /Layer 2.*Manager|Manager.*Validation.*Coordinator/i.test(testTaskContent),
    'Missing Layer 2 Manager Validation section'
  );
});

test('Should have Layer 3: Validator section', () => {
  assert(
    /Layer 3.*Validator|Independent.*Validation/i.test(testTaskContent),
    'Missing Layer 3 Independent Validation section'
  );
});

test('Layer 1 should include test evidence requirements', () => {
  const layer1Section = testTaskContent.match(/Layer 1[:\s]*Self[^#]*/i);
  assert(
    layer1Section && /test|evidence|TDD/i.test(layer1Section[0]),
    'Layer 1 must include test evidence requirements'
  );
});

// ============================================
// SECTION 6: Test Evidence Section
// ============================================
console.log('\n--- Section 6: Test Evidence Documentation ---\n');

test('Task should have Test Evidence section', () => {
  assert(
    /## Test Evidence/.test(testTaskContent),
    'Missing Test Evidence section'
  );
});

test('Test Evidence should have Implementation Evidence', () => {
  assert(
    /Implementation Evidence|Test Results/i.test(testTaskContent),
    'Missing Implementation Evidence subsection'
  );
});

// ============================================
// SECTION 7: Reference Materials
// ============================================
console.log('\n--- Section 7: Reference & Integration ---\n');

test('Task should reference AGENTS.md', () => {
  assert(
    /AGENTS\.md/i.test(testTaskContent),
    'Must reference AGENTS.md'
  );
});

test('Task should reference existing templates', () => {
  assert(
    /PROACTIVE-JOBS-TEMPLATE\.md|template/i.test(testTaskContent),
    'Must reference PROACTIVE-JOBS-TEMPLATE.md or templates'
  );
});

// ============================================
// Final Results
// ============================================
console.log('\n' + '=' .repeat(60));
console.log(`\n📊 Template Compliance Results: ${passed} passed, ${failed} failed`);
console.log(`   Coverage: ${Math.round(passed / (passed + failed) * 100)}%\n`);

if (failed > 0) {
  console.log('❌ Template compliance validation FAILED');
  process.exit(1);
} else {
  console.log('✅ Template compliance validation PASSED');
  process.exit(0);
}
