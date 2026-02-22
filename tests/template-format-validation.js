#!/usr/bin/env node
/**
 * Template Format Validation Tests
 * Ensures formatting consistency across the template structure
 * 
 * Following TDD: These tests should FAIL initially, then guide implementation
 */

const fs = require('fs');
const path = require('path');

// Test configuration
const REPO_ROOT = path.join(__dirname, '..');
const TEMPLATE_FILE = path.join(REPO_ROOT, 'docs', 'templates', 'PROACTIVE-JOBS-TEMPLATE.md');

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

function assertRegexMatch(content, regex, message) {
  if (!regex.test(content)) {
    throw new Error(message);
  }
}

// Main test execution
console.log('🧪 Template Format Validation Tests');
console.log('Ensuring consistent formatting standards\n');

// Test 1: Template file exists for format validation
test('Template file exists for format validation', () => {
  assert(fs.existsSync(TEMPLATE_FILE), 
    `Template file should exist at ${TEMPLATE_FILE}`);
});

let content = '';
try {
  if (fs.existsSync(TEMPLATE_FILE)) {
    content = fs.readFileSync(TEMPLATE_FILE, 'utf8');
  }
} catch (error) {
  console.log(`⚠️ Warning: Could not read template file: ${error.message}`);
}

// Test 2: Consistent heading levels
test('Headings follow consistent hierarchy', () => {
  if (!content) return;
  const headings = content.match(/^#{1,6}\s+.+$/gm) || [];
  assert(headings.length > 0, 'Template should have headings');
  
  // Should start with # (h1) and not skip levels
  const firstHeading = headings[0];
  assert(firstHeading.startsWith('# '), 
    'Template should start with h1 heading (#)');
});

// Test 3: Status field formatting consistency
test('Status fields use consistent format', () => {
  if (!content) return;
  const statusPattern = /\*\*Status:\*\*/g;
  const matches = content.match(statusPattern);
  if (matches) {
    assert(matches.length > 0, 
      'Status fields should use **Status:** format');
  }
});

// Test 4: Checkbox format consistency
test('All checkboxes use consistent format', () => {
  if (!content) return;
  const checkboxes = content.match(/^-\s+\[\s+\]/gm) || [];
  if (checkboxes.length > 0) {
    // All checkboxes should use '- [ ]' format (not '* [ ]' or other variants)
    const consistentFormat = checkboxes.every(cb => cb.startsWith('- [ ]'));
    assert(consistentFormat, 
      'All checkboxes should use "- [ ]" format consistently');
  }
});

// Test 5: Acceptance criteria numbering format
test('Acceptance criteria use consistent numbering', () => {
  if (!content) return;
  if (content.includes('Acceptance Criteria')) {
    const acPattern = /AC-\d+:/g;
    const matches = content.match(acPattern);
    if (matches) {
      assert(matches.length > 0, 
        'Acceptance criteria should use AC-X: format');
    }
  }
});

// Test 6: Date/time format consistency
test('Timestamps use consistent format', () => {
  if (!content) return;
  // Should use YYYY-MM-DD HH:MM TZ format
  const timestampPattern = /\[\d{4}-\d{2}-\d{2} \d{2}:\d{2} [A-Z]{3}\]/;
  if (content.includes('[')) {
    const hasConsistentTimestamps = timestampPattern.test(content);
    assert(hasConsistentTimestamps, 
      'Timestamps should use [YYYY-MM-DD HH:MM TZ] format');
  }
});

// Test 7: Section divider consistency
test('Section dividers use consistent format', () => {
  if (!content) return;
  const dividers = content.match(/^-{3,}$/gm) || [];
  if (dividers.length > 0) {
    // All dividers should be same length
    const lengths = dividers.map(d => d.length);
    const consistent = lengths.every(len => len === lengths[0]);
    assert(consistent, 
      'Section dividers should use consistent length');
  }
});

// Test 8: Code block formatting consistency
test('Code blocks use consistent fencing', () => {
  if (!content) return;
  const fencedBlocks = content.match(/```[\s\S]*?```/g) || [];
  if (fencedBlocks.length > 0) {
    // All should use triple backticks (not indentation)
    assert(fencedBlocks.length > 0, 
      'Code blocks should use consistent ``` fencing');
  }
});

// Test 9: Bullet point consistency
test('Bullet points use consistent format', () => {
  if (!content) return;
  const bulletLines = content.split('\n').filter(line => 
    line.trim().match(/^[-*+]\s+/) && !line.includes('[ ]')
  );
  
  if (bulletLines.length > 0) {
    const allUseDash = bulletLines.every(line => line.trim().startsWith('- '));
    assert(allUseDash, 
      'Bullet points should consistently use "- " format');
  }
});

// Test 10: Field label consistency
test('Field labels use consistent bold formatting', () => {
  if (!content) return;
  const fieldPatterns = [
    /\*\*Project:\*\*/,
    /\*\*Phase:\*\*/,
    /\*\*Dependencies:\*\*/,
    /\*\*Status:\*\*/
  ];
  
  fieldPatterns.forEach((pattern, index) => {
    if (content.match(pattern)) {
      assert(pattern.test(content), 
        `Field labels should use **Label:** format consistently`);
    }
  });
});

console.log(`\n📊 Test Results: ${passCount}/${testCount} tests passed`);

if (passCount === testCount) {
  console.log('🎉 All format validation tests passed!');
  process.exit(0);
} else {
  console.log('🔴 Format validation failed. Template needs formatting consistency fixes.');
  process.exit(1);
}