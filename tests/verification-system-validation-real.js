/**
 * Verification System Documentation Validation Tests
 * 
 * These tests validate that VERIFICATION-SYSTEM.md includes
 * comprehensive testing phase requirements and validation protocols.
 * 
 * TDD Approach: These tests should FAIL initially (RED phase)
 * then pass after implementation (GREEN phase).
 * 
 * EXECUTABLE with: node verification-system-validation-real.js
 */

const fs = require('fs');
const path = require('path');

// Simple testing framework for standalone Node.js
class TestRunner {
  constructor(name) {
    this.suiteName = name;
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  test(name, testFn) {
    this.tests.push({ name, testFn });
  }

  expect(actual) {
    return {
      toMatch: (pattern) => {
        const matches = typeof pattern === 'string' 
          ? actual.includes(pattern)
          : pattern.test(actual);
        if (!matches) {
          throw new Error(`Expected "${actual.substring(0, 100)}..." to match "${pattern}"`);
        }
        return true;
      },
      toInclude: (substring) => {
        if (!actual.includes(substring)) {
          throw new Error(`Expected content to include "${substring}"`);
        }
        return true;
      }
    };
  }

  run() {
    console.log(`\n🧪 Running test suite: ${this.suiteName}`);
    console.log('=' * 50);

    for (const test of this.tests) {
      try {
        test.testFn();
        console.log(`✅ ${test.name}`);
        this.passed++;
      } catch (error) {
        console.log(`❌ ${test.name}`);
        console.log(`   Error: ${error.message}`);
        this.failed++;
      }
    }

    console.log(`\n📊 Results: ${this.passed} passed, ${this.failed} failed`);
    return { passed: this.passed, failed: this.failed };
  }
}

// Load the verification system content
let verificationSystemContent = '';
try {
  const filePath = path.join(__dirname, '../docs/VERIFICATION-SYSTEM.md');
  verificationSystemContent = fs.readFileSync(filePath, 'utf8');
} catch (error) {
  console.log(`❌ Could not load VERIFICATION-SYSTEM.md: ${error.message}`);
  process.exit(1);
}

// Create test runner
const runner = new TestRunner('Verification System Documentation');

// Testing Phase Requirements (5 tests)
runner.test('should include comprehensive testing phase section', () => {
  runner.expect(verificationSystemContent).toMatch(/## Testing Phase \(MANDATORY\)/i);
  runner.expect(verificationSystemContent).toMatch(/testing phase must happen/i);
});

runner.test('should document TDD methodology integration', () => {
  runner.expect(verificationSystemContent).toMatch(/test.*driven.*development/i);
  runner.expect(verificationSystemContent).toMatch(/red.*green.*refactor/i);
});

runner.test('should specify testing framework requirements', () => {
  runner.expect(verificationSystemContent).toInclude('Jest');
  runner.expect(verificationSystemContent).toInclude('Playwright');
  runner.expect(verificationSystemContent).toInclude('Cypress');
});

runner.test('should require test evidence collection', () => {
  runner.expect(verificationSystemContent).toMatch(/test evidence/i);
  runner.expect(verificationSystemContent).toMatch(/screenshots/i);
  runner.expect(verificationSystemContent).toMatch(/test output/i);
  runner.expect(verificationSystemContent).toMatch(/coverage reports/i);
});

runner.test('should document test validation protocols', () => {
  runner.expect(verificationSystemContent).toMatch(/test validation/i);
  runner.expect(verificationSystemContent).toMatch(/validation.*protocol/i);
});

// Enhanced 3-Layer Validation Protocol (4 tests)
runner.test('should update Layer 1 (self-validation) with test execution requirements', () => {
  runner.expect(verificationSystemContent).toMatch(/layer 1.*self.*validation/i);
  runner.expect(verificationSystemContent).toMatch(/tests.*written.*before.*implementation/i);
  runner.expect(verificationSystemContent).toMatch(/test.*evidence.*collected/i);
});

runner.test('should update Layer 2 (manager validation) with testing verification', () => {
  runner.expect(verificationSystemContent).toMatch(/layer 2.*manager.*validation/i);
  runner.expect(verificationSystemContent).toMatch(/verify.*test.*evidence/i);
  runner.expect(verificationSystemContent).toMatch(/test.*quality/i);
  runner.expect(verificationSystemContent).toMatch(/testing.*framework.*usage/i);
});

runner.test('should update Layer 3 (validator) with comprehensive test review', () => {
  runner.expect(verificationSystemContent).toMatch(/layer 3.*independent.*validation/i);
  runner.expect(verificationSystemContent).toMatch(/run.*tests.*independently/i);
  runner.expect(verificationSystemContent).toMatch(/test.*comprehensiveness/i);
  runner.expect(verificationSystemContent).toMatch(/independent.*test.*verification/i);
});

runner.test('should include testing requirements at each validation layer', () => {
  runner.expect(verificationSystemContent).toMatch(/tests.*written.*before.*implementation/i);
  runner.expect(verificationSystemContent).toMatch(/all.*tests.*pass/i);
  runner.expect(verificationSystemContent).toMatch(/testing.*evidence.*documented/i);
});

// Testing Framework Integration Requirements (3 tests)
runner.test('should document specific testing frameworks for different work types', () => {
  runner.expect(verificationSystemContent).toMatch(/testing.*framework.*integration/i);
  runner.expect(verificationSystemContent).toMatch(/work.*type/i);
  runner.expect(verificationSystemContent).toMatch(/required.*testing.*tools/i);
});

runner.test('should specify validation methods for each framework', () => {
  runner.expect(verificationSystemContent).toMatch(/validation.*method/i);
  runner.expect(verificationSystemContent).toMatch(/unit.*integration.*e2e/i);
  runner.expect(verificationSystemContent).toMatch(/automated.*validation/i);
});

runner.test('should require appropriate testing tools per task type', () => {
  runner.expect(verificationSystemContent).toMatch(/testing.*tools/i);
  runner.expect(verificationSystemContent).toMatch(/work.*type/i);
  runner.expect(verificationSystemContent).toMatch(/required.*testing/i);
});

// Test Evidence Collection Protocols (3 tests)
runner.test('should document evidence requirements for each validation layer', () => {
  runner.expect(verificationSystemContent).toMatch(/evidence.*requirements/i);
  runner.expect(verificationSystemContent).toMatch(/test.*results/i);
  runner.expect(verificationSystemContent).toMatch(/screenshots.*logs/i);
});

runner.test('should specify test result documentation format', () => {
  runner.expect(verificationSystemContent).toMatch(/test.*result.*documentation/i);
  runner.expect(verificationSystemContent).toMatch(/evidence.*format/i);
});

runner.test('should require comprehensive test output inclusion', () => {
  runner.expect(verificationSystemContent).toMatch(/test.*output.*inclusion/i);
  runner.expect(verificationSystemContent).toMatch(/comprehensive.*test/i);
});

// Policy Integration (3 tests)
runner.test('should include "No Task Without Tests" policy', () => {
  runner.expect(verificationSystemContent).toMatch(/no.*task.*without.*tests/i);
  runner.expect(verificationSystemContent).toMatch(/testing.*plans.*mandatory/i);
});

runner.test('should specify task rejection criteria for missing tests', () => {
  runner.expect(verificationSystemContent).toMatch(/rejected.*without.*test/i);
  runner.expect(verificationSystemContent).toMatch(/cannot.*approve.*without.*test/i);
});

runner.test('should document test validation approval process', () => {
  runner.expect(verificationSystemContent).toMatch(/test.*validation.*approval/i);
  runner.expect(verificationSystemContent).toMatch(/approval.*process/i);
});

// Status Progression Enhancement (2 tests)
runner.test('should include testing status in task progression flow', () => {
  runner.expect(verificationSystemContent).toMatch(/status.*progression/i);
  runner.expect(verificationSystemContent).toMatch(/testing.*phase/i);
});

runner.test('should require test validation before status changes', () => {
  runner.expect(verificationSystemContent).toMatch(/test.*validation.*before.*status/i);
  runner.expect(verificationSystemContent).toMatch(/cannot.*claim.*complete.*without.*test/i);
});

// Integration with Existing Systems (3 tests)
runner.test('should reference AGENTS.md testing requirements', () => {
  runner.expect(verificationSystemContent).toMatch(/agents\.md.*testing/i);
  runner.expect(verificationSystemContent).toMatch(/foundation.*testing.*requirements/i);
});

runner.test('should align with PROACTIVE-JOBS-TEMPLATE.md structure', () => {
  runner.expect(verificationSystemContent).toMatch(/proactive.*jobs.*template/i);
  runner.expect(verificationSystemContent).toMatch(/template.*structure/i);
});

runner.test('should integrate with planning system requirements', () => {
  runner.expect(verificationSystemContent).toMatch(/planning.*system/i);
  runner.expect(verificationSystemContent).toMatch(/testing.*first.*methodology/i);
});

// Run the tests
const results = runner.run();

// Exit with appropriate code
process.exit(results.failed > 0 ? 1 : 0);