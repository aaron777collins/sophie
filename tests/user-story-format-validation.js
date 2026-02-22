#!/usr/bin/env node

/**
 * User Story Format Validation Tests
 * Tests that PLANNING-SYSTEM.md mandates proper user story format with acceptance criteria and testing
 * 
 * TDD Phase: RED - These tests should FAIL initially
 * Part of: Proactive Job System Enhancement p1-2-b
 */

const fs = require('fs');
const path = require('path');

const PLANNING_SYSTEM_PATH = path.join(__dirname, '..', 'docs', 'PLANNING-SYSTEM.md');

// Simple test framework
let testCount = 0;
let passCount = 0;
let failures = [];

function test(description, testFn) {
  testCount++;
  try {
    testFn();
    passCount++;
    console.log(`✅ ${description}`);
  } catch (error) {
    failures.push({ description, error: error.message });
    console.log(`❌ ${description}: ${error.message}`);
  }
}

function expect(value) {
  return {
    toMatch: (pattern) => {
      if (!value.match(pattern)) {
        throw new Error(`Expected content to match pattern: ${pattern}`);
      }
    }
  };
}

// Load content
if (!fs.existsSync(PLANNING_SYSTEM_PATH)) {
  console.error(`❌ PLANNING-SYSTEM.md not found at ${PLANNING_SYSTEM_PATH}`);
  process.exit(1);
}

const planningSystemContent = fs.readFileSync(PLANNING_SYSTEM_PATH, 'utf8');

// User Story Structure Requirements
test('should mandate "As a/I want/So that" format', () => {
  expect(planningSystemContent).toMatch(/As a.*I want.*So that/i);
  expect(planningSystemContent).toMatch(/user story.*format.*mandatory/i);
});

test('should require acceptance criteria section', () => {
  expect(planningSystemContent).toMatch(/acceptance criteria.*mandatory/i);
  expect(planningSystemContent).toMatch(/AC-\d+/);
});

test('should mandate Given-When-Then format for ACs', () => {
  expect(planningSystemContent).toMatch(/Given.*When.*Then.*format/i);
  expect(planningSystemContent).toMatch(/Given.*precondition/i);
  expect(planningSystemContent).toMatch(/When.*action/i);
  expect(planningSystemContent).toMatch(/Then.*expected.result/i);
});

test('should require test method specification for each AC', () => {
  expect(planningSystemContent).toMatch(/Test Method.*required/i);
  expect(planningSystemContent).toMatch(/testing.framework.*validation.approach/i);
});

test('should mandate evidence requirements for each AC', () => {
  expect(planningSystemContent).toMatch(/Evidence Required.*mandatory/i);
  expect(planningSystemContent).toMatch(/screenshots.*test.output.*logs/i);
});

// Testing Requirements Section
test('should mandate testing requirements section in user stories', () => {
  expect(planningSystemContent).toMatch(/Testing Requirements.*MANDATORY/i);
  expect(planningSystemContent).toMatch(/TDD Approach/i);
});

test('should require testing framework specification', () => {
  expect(planningSystemContent).toMatch(/Testing Framework.*Jest.*Playwright.*Cypress/i);
  expect(planningSystemContent).toMatch(/test.types.*unit.*integration.*e2e/i);
});

test('should mandate test files specification', () => {
  expect(planningSystemContent).toMatch(/Test Files.*Create/i);
  expect(planningSystemContent).toMatch(/\.test\.js.*\.spec\.js/);
});

test('should require performance criteria when applicable', () => {
  expect(planningSystemContent).toMatch(/Performance Criteria/i);
  expect(planningSystemContent).toMatch(/response.times.*load.requirements/i);
});

// Contingencies and Dependencies
test('should mandate contingencies section', () => {
  expect(planningSystemContent).toMatch(/CONTINGENCIES.*mandatory/i);
  expect(planningSystemContent).toMatch(/what could go wrong.*mitigations/i);
});

test('should require dependencies documentation', () => {
  expect(planningSystemContent).toMatch(/DEPENDENCIES.*mandatory/i);
  expect(planningSystemContent).toMatch(/upstream.*downstream.*external/i);
});

test('should mandate technical notes from research', () => {
  expect(planningSystemContent).toMatch(/technical notes.*research/i);
  expect(planningSystemContent).toMatch(/implementation.*constraints/i);
});

// Story Architect Integration
test('should reference Story Architect process', () => {
  expect(planningSystemContent).toMatch(/Story Architect.*Claude Code/i);
  expect(planningSystemContent).toMatch(/RESEARCHERS.*REVIEWERS/i);
});

test('should mandate user story review process', () => {
  expect(planningSystemContent).toMatch(/story.*review.*mandatory/i);
  expect(planningSystemContent).toMatch(/iterate.*until.*complete/i);
});

test('should require multiple perspectives in story review', () => {
  expect(planningSystemContent).toMatch(/multiple.*perspective/i);
  expect(planningSystemContent).toMatch(/edge cases.*contingencies.*dependencies/i);
});

// Example User Story Format
test('should provide complete user story example with all sections', () => {
  expect(planningSystemContent).toMatch(/## Story\s*\*\*As a\*\*/i);
  expect(planningSystemContent).toMatch(/## Acceptance Criteria/i);
  expect(planningSystemContent).toMatch(/## Testing Requirements.*MANDATORY/i);
});

test('should show proper AC format in examples', () => {
  expect(planningSystemContent).toMatch(/### AC-1:.*title/i);
  expect(planningSystemContent).toMatch(/\*\*Given\*\*.*precondition/i);
  expect(planningSystemContent).toMatch(/\*\*When\*\*.*action/i);
  expect(planningSystemContent).toMatch(/\*\*Then\*\*.*expected result/i);
});

test('should demonstrate testing integration in examples', () => {
  expect(planningSystemContent).toMatch(/\*\*Test Method:\*\*.*testing.framework/i);
  expect(planningSystemContent).toMatch(/\*\*Evidence Required:\*\*.*screenshots.*test.output/i);
});

// No Story Without Tests Policy
test('should mandate that no user story is approved without tests', () => {
  expect(planningSystemContent).toMatch(/NO.*USER.*STORY.*NO.*TEST/i);
  expect(planningSystemContent).toMatch(/cannot.*approve.*without.*test/i);
});

test('should require test strategy definition upfront', () => {
  expect(planningSystemContent).toMatch(/test strategy.*upfront/i);
  expect(planningSystemContent).toMatch(/testing.*plan.*mandatory/i);
});

test('should mandate validation method documentation', () => {
  expect(planningSystemContent).toMatch(/validation method.*documented/i);
  expect(planningSystemContent).toMatch(/evidence collection.*requirements/i);
});

// Run tests if called directly
if (require.main === module) {
  console.log(`\n🧪 User Story Format Validation Tests`);
  console.log(`📄 Testing: ${PLANNING_SYSTEM_PATH}\n`);
  
  // Summary
  console.log(`\n📊 Test Results:`);
  console.log(`✅ Passed: ${passCount}/${testCount}`);
  console.log(`❌ Failed: ${failures.length}/${testCount}`);
  
  if (failures.length > 0) {
    console.log(`\n💥 Failures:`);
    failures.forEach(failure => {
      console.log(`   ❌ ${failure.description}: ${failure.error}`);
    });
    process.exit(1);
  } else {
    console.log(`\n🎉 All tests passed!`);
    process.exit(0);
  }
}

module.exports = { PLANNING_SYSTEM_PATH };