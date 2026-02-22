#!/usr/bin/env node
/**
 * PROACTIVE-JOBS Template Validation Tests
 * Tests the structure and content of the PROACTIVE-JOBS template
 * 
 * Following TDD: These tests should FAIL initially, then guide implementation
 */

const fs = require('fs');
const path = require('path');

// Test configuration
const REPO_ROOT = path.join(__dirname, '..');
const PROACTIVE_JOBS_FILE = path.join(REPO_ROOT, 'PROACTIVE-JOBS.md');
const TEMPLATE_SECTIONS_FILE = path.join(REPO_ROOT, 'docs', 'templates', 'PROACTIVE-JOBS-TEMPLATE.md');

let testCount = 0;
let passCount = 0;

function test(description, testFn) {
  testCount++;
  try {
    testFn();
    console.log(`✅ Test ${testCount}: ${description}`);
    passCount++;
  } catch (error) {
    console.log(`❌ Test ${testCount}: ${description}`);
    console.log(`   Error: ${error.message}`);
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertContains(content, substring, message) {
  if (!content.includes(substring)) {
    throw new Error(message);
  }
}

function assertSectionExists(content, sectionTitle, message) {
  const sectionRegex = new RegExp(`^#{1,3}\\s+${sectionTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'm');
  if (!sectionRegex.test(content)) {
    throw new Error(message);
  }
}

// Main test execution
console.log('🧪 PROACTIVE-JOBS Template Validation Tests');
console.log('Following TDD: RED → GREEN → REFACTOR\n');

// Test 1: Template file should exist
test('Template file exists', () => {
  assert(fs.existsSync(TEMPLATE_SECTIONS_FILE), 
    `Template file should exist at ${TEMPLATE_SECTIONS_FILE}`);
});

// Test 2: Template should have mandatory testing sections
test('Template contains Testing Requirements section', () => {
  if (!fs.existsSync(TEMPLATE_SECTIONS_FILE)) return; // Skip if file doesn't exist
  const content = fs.readFileSync(TEMPLATE_SECTIONS_FILE, 'utf8');
  assertSectionExists(content, 'Testing Requirements', 
    'Template should include "Testing Requirements" section');
});

// Test 3: Template should have acceptance criteria formatting
test('Template contains Acceptance Criteria section with proper formatting', () => {
  if (!fs.existsSync(TEMPLATE_SECTIONS_FILE)) return;
  const content = fs.readFileSync(TEMPLATE_SECTIONS_FILE, 'utf8');
  assertSectionExists(content, 'Acceptance Criteria', 
    'Template should include "Acceptance Criteria" section');
  assertContains(content, '- [ ]', 
    'Acceptance Criteria should use checkbox format');
});

// Test 4: Template should have validation checklist
test('Template contains Validation Checklist section', () => {
  if (!fs.existsSync(TEMPLATE_SECTIONS_FILE)) return;
  const content = fs.readFileSync(TEMPLATE_SECTIONS_FILE, 'utf8');
  assertSectionExists(content, 'Validation Checklist', 
    'Template should include "Validation Checklist" section');
});

// Test 5: Template should have test evidence section
test('Template contains Test Evidence section', () => {
  if (!fs.existsSync(TEMPLATE_SECTIONS_FILE)) return;
  const content = fs.readFileSync(TEMPLATE_SECTIONS_FILE, 'utf8');
  assertSectionExists(content, 'Test Evidence', 
    'Template should include "Test Evidence" section');
});

// Test 6: Template should reference TDD methodology
test('Template references TDD methodology', () => {
  if (!fs.existsSync(TEMPLATE_SECTIONS_FILE)) return;
  const content = fs.readFileSync(TEMPLATE_SECTIONS_FILE, 'utf8');
  assertContains(content, 'TDD', 
    'Template should reference TDD methodology');
  assertContains(content, 'Red → Green → Refactor', 
    'Template should reference TDD phases');
});

// Test 7: Template should have status progression with validation states
test('Template includes validation status states', () => {
  if (!fs.existsSync(TEMPLATE_SECTIONS_FILE)) return;
  const content = fs.readFileSync(TEMPLATE_SECTIONS_FILE, 'utf8');
  assertContains(content, 'self-validated', 
    'Template should include self-validated status');
  assertContains(content, 'needs-validation', 
    'Template should include needs-validation status');
});

// Test 8: Template should include testing framework references
test('Template references testing frameworks', () => {
  if (!fs.existsSync(TEMPLATE_SECTIONS_FILE)) return;
  const content = fs.readFileSync(TEMPLATE_SECTIONS_FILE, 'utf8');
  // Should reference at least some common testing frameworks
  const hasTestingFrameworks = content.includes('Jest') || 
                              content.includes('Playwright') || 
                              content.includes('Cypress') ||
                              content.includes('validation scripts');
  assert(hasTestingFrameworks, 
    'Template should reference testing frameworks (Jest, Playwright, etc.)');
});

// Test 9: Template should have template usage guidelines
test('Template contains usage guidelines section', () => {
  if (!fs.existsSync(TEMPLATE_SECTIONS_FILE)) return;
  const content = fs.readFileSync(TEMPLATE_SECTIONS_FILE, 'utf8');
  assertSectionExists(content, 'Template Usage Guidelines', 
    'Template should include usage guidelines section');
});

// Test 10: Template should integrate with existing workflow
test('Template references existing workflow integration', () => {
  if (!fs.existsSync(TEMPLATE_SECTIONS_FILE)) return;
  const content = fs.readFileSync(TEMPLATE_SECTIONS_FILE, 'utf8');
  assertContains(content, 'AGENTS.md', 
    'Template should reference AGENTS.md for workflow integration');
});

// Test 11: Template should have proper markdown structure
test('Template uses proper markdown structure', () => {
  if (!fs.existsSync(TEMPLATE_SECTIONS_FILE)) return;
  const content = fs.readFileSync(TEMPLATE_SECTIONS_FILE, 'utf8');
  assert(content.startsWith('#'), 
    'Template should start with markdown header');
  assert(content.includes('##') || content.includes('###'), 
    'Template should use proper heading hierarchy');
});

// Test 12: Template should provide examples of acceptance criteria formatting
test('Template provides acceptance criteria examples', () => {
  if (!fs.existsSync(TEMPLATE_SECTIONS_FILE)) return;
  const content = fs.readFileSync(TEMPLATE_SECTIONS_FILE, 'utf8');
  assertContains(content, 'Given', 
    'Template should show Given-When-Then format examples');
  assertContains(content, 'When', 
    'Template should show Given-When-Then format examples');
  assertContains(content, 'Then', 
    'Template should show Given-When-Then format examples');
});

console.log(`\n📊 Test Results: ${passCount}/${testCount} tests passed`);

if (passCount === testCount) {
  console.log('🎉 All tests passed! Template implementation complete.');
  process.exit(0);
} else {
  console.log('🔴 Some tests failed. Implementation needed to make tests pass.');
  process.exit(1);
}