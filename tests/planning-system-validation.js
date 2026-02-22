#!/usr/bin/env node

/**
 * Planning System Validation Tests
 * Tests that PLANNING-SYSTEM.md mandates acceptance criteria and testing for every user story and task
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

// Testing Requirements Integration
test('should reference AGENTS.md testing requirements', () => {
  expect(planningSystemContent).toMatch(/AGENTS\.md.*testing/i);
});

test('should mandate TDD approach for all planning work', () => {
  expect(planningSystemContent).toMatch(/TDD.*RED.*GREEN.*REFACTOR/i);
  expect(planningSystemContent).toMatch(/Test.Driven.Development/i);
});

test('should require testing frameworks specification', () => {
  expect(planningSystemContent).toMatch(/Jest|Playwright|Cypress/);
  expect(planningSystemContent).toMatch(/testing.framework/i);
});

test('should mandate test evidence collection', () => {
  expect(planningSystemContent).toMatch(/test.evidence/i);
  expect(planningSystemContent).toMatch(/screenshots|logs|coverage/i);
});

// User Story Format Requirements
test('should mandate Given-When-Then format for acceptance criteria', () => {
  expect(planningSystemContent).toMatch(/Given.*When.*Then/);
  expect(planningSystemContent).toMatch(/acceptance.criteria.*mandatory/i);
});

test('should require testing method specification for each AC', () => {
  expect(planningSystemContent).toMatch(/Test.Method.*testing.framework/i);
  expect(planningSystemContent).toMatch(/Evidence.Required/i);
});

test('should mandate contingencies and dependencies in user stories', () => {
  expect(planningSystemContent).toMatch(/CONTINGENCIES.*what.could.go.wrong/i);
  expect(planningSystemContent).toMatch(/DEPENDENCIES.*upstream.*downstream/i);
});

// Task Breakdown Requirements  
test('should require testing plans for all tasks', () => {
  expect(planningSystemContent).toMatch(/testing.plan.*mandatory/i);
  expect(planningSystemContent).toMatch(/validation.steps.*mandatory/i);
});

test('should mandate 3-layer validation workflow', () => {
  expect(planningSystemContent).toMatch(/Layer.1.*Self.Validation/);
  expect(planningSystemContent).toMatch(/Layer.2.*Manager.Validation/);
  expect(planningSystemContent).toMatch(/Layer.3.*Independent.Validation/);
});

test('should require test files specification', () => {
  expect(planningSystemContent).toMatch(/test.files.*create/i);
  expect(planningSystemContent).toMatch(/\.test\.js|\.spec\.js/);
});

// Planning Workflow Validation
test('should include validation checkpoints in planning flow', () => {
  expect(planningSystemContent).toMatch(/validation.checkpoint/i);
  expect(planningSystemContent).toMatch(/quality.gate/i);
});

test('should mandate test strategy at planning stage', () => {
  expect(planningSystemContent).toMatch(/test.strategy/i);
  expect(planningSystemContent).toMatch(/testing.*before.*implementation/i);
});

test('should require testing framework integration planning', () => {
  expect(planningSystemContent).toMatch(/framework.integration/i);
  expect(planningSystemContent).toMatch(/test.setup/i);
});

// Quality Gates Documentation
test('should document quality gates for planning approval', () => {
  expect(planningSystemContent).toMatch(/quality.gate.*approval/i);
  expect(planningSystemContent).toMatch(/approval.*criteria/i);
});

test('should mandate test validation before task approval', () => {
  expect(planningSystemContent).toMatch(/test.*validation.*approval/i);
  expect(planningSystemContent).toMatch(/cannot.*approve.*without.*test/i);
});

test('should require comprehensive test coverage validation', () => {
  expect(planningSystemContent).toMatch(/test.coverage/i);
  expect(planningSystemContent).toMatch(/comprehensive.*validation/i);
});

// PROACTIVE-JOBS-TEMPLATE.md Alignment
test('should reference the new template structure', () => {
  expect(planningSystemContent).toMatch(/PROACTIVE.JOBS.TEMPLATE/);
  expect(planningSystemContent).toMatch(/docs\/templates/);
});

test('should align task definition format with template', () => {
  expect(planningSystemContent).toMatch(/testing.requirements.*mandatory/i);
  expect(planningSystemContent).toMatch(/validation.checklist/i);
});

// Phase Planning Requirements
test('should mandate testing considerations in phase planning', () => {
  expect(planningSystemContent).toMatch(/phase.*testing/i);
  expect(planningSystemContent).toMatch(/test.*infrastructure/i);
});

test('should require test environment setup planning', () => {
  expect(planningSystemContent).toMatch(/test.environment/i);
  expect(planningSystemContent).toMatch(/testing.setup/i);
});

// Run tests if called directly
if (require.main === module) {
  console.log(`\n🧪 Planning System Validation Tests`);
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