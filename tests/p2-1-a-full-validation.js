#!/usr/bin/env node
/**
 * P2-1-a: Full Validation Suite Runner
 * 
 * Purpose: Runs all validation tests for the test task example
 * Tests: Template compliance, Circle integration, Validation workflow
 * 
 * Created: 2026-02-22 by p2-1-a worker
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('\n🧪 P2-1-a Full Validation Suite\n');
console.log('=' .repeat(60));
console.log('Running all validation tests for test task example...\n');

const tests = [
  { name: 'Template Compliance', file: 'p2-template-compliance-validation.js' },
  { name: 'Circle Integration', file: 'p2-circle-integration-validation.js' },
  { name: 'Validation Workflow', file: 'p2-validation-workflow-tests.js' }
];

let totalPassed = 0;
let totalFailed = 0;
const results = [];

for (const test of tests) {
  console.log(`\n📋 Running: ${test.name}`);
  console.log('-'.repeat(40));
  
  try {
    const output = execSync(`node ${path.join(__dirname, test.file)}`, { 
      encoding: 'utf8',
      timeout: 30000 
    });
    
    // Parse results from output
    const match = output.match(/(\d+) passed, (\d+) failed/);
    if (match) {
      const passed = parseInt(match[1]);
      const failed = parseInt(match[2]);
      totalPassed += passed;
      totalFailed += failed;
      results.push({ name: test.name, passed, failed, status: failed === 0 ? '✅' : '❌' });
    }
    
    console.log(output);
  } catch (error) {
    console.log(`❌ Test suite failed: ${error.message}`);
    totalFailed++;
    results.push({ name: test.name, passed: 0, failed: 1, status: '❌' });
  }
}

// Summary
console.log('\n' + '=' .repeat(60));
console.log('\n📊 FULL VALIDATION SUMMARY\n');
console.log('Test Suite                 | Passed | Failed | Status');
console.log('-'.repeat(55));
for (const r of results) {
  console.log(`${r.name.padEnd(26)} |   ${String(r.passed).padStart(4)} |   ${String(r.failed).padStart(4)} | ${r.status}`);
}
console.log('-'.repeat(55));
console.log(`${'TOTAL'.padEnd(26)} |   ${String(totalPassed).padStart(4)} |   ${String(totalFailed).padStart(4)} | ${totalFailed === 0 ? '✅' : '❌'}`);

console.log(`\n📈 Overall Coverage: ${Math.round(totalPassed / (totalPassed + totalFailed) * 100)}%\n`);

if (totalFailed > 0) {
  console.log('❌ Full validation FAILED');
  process.exit(1);
} else {
  console.log('✅ Full validation PASSED - Test task meets all requirements');
  process.exit(0);
}
