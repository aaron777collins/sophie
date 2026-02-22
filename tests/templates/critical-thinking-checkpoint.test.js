#!/usr/bin/env node

/**
 * Tests for Critical Thinking Checkpoint Template
 * Testing TDD approach - these tests should FAIL initially, then PASS after implementation
 */

const fs = require('fs');
const path = require('path');

const TEMPLATE_PATH = path.join(__dirname, '../../scheduler/templates/CRITICAL-THINKING-CHECKPOINT-TEMPLATE.md');

// Load template content
let templateContent = '';
if (fs.existsSync(TEMPLATE_PATH)) {
  templateContent = fs.readFileSync(TEMPLATE_PATH, 'utf8');
}

console.log('Running Critical Thinking Checkpoint Template Tests...');

// Simple test runner since we don't have Jest installed
let passed = 0;
let failed = 0;

const tests = [
  {
    name: 'template file exists',
    fn: () => fs.existsSync(TEMPLATE_PATH)
  },
  {
    name: 'contains all four Circle perspectives',
    fn: () => {
      const hasAll = /pragmatist/i.test(templateContent) && 
                    /skeptic/i.test(templateContent) && 
                    /guardian/i.test(templateContent) && 
                    /dreamer/i.test(templateContent);
      return hasAll;
    }
  },
  {
    name: 'defines checkpoint triggers',
    fn: () => /checkpoint.*trigger/i.test(templateContent) && 
              /mandatory.*checkpoint/i.test(templateContent)
  },
  {
    name: 'includes evaluation criteria section',
    fn: () => /evaluation.*criteria/i.test(templateContent)
  },
  {
    name: 'defines checkpoint outcomes and actions',
    fn: () => /outcome/i.test(templateContent) && /action.*item/i.test(templateContent)
  },
  {
    name: 'includes usage guidelines',
    fn: () => /usage.*guideline/i.test(templateContent)
  },
  {
    name: 'contains integration hooks for existing templates',
    fn: () => /integration/i.test(templateContent) && /template.*reference/i.test(templateContent)
  },
  {
    name: 'includes validation requirements integration',
    fn: () => /validation/i.test(templateContent) && /tdd/i.test(templateContent)
  },
  {
    name: 'defines timing for checkpoints',
    fn: () => /timing/i.test(templateContent) && /phase.*transition/i.test(templateContent)
  }
];

tests.forEach(test => {
  try {
    if (test.fn()) {
      console.log(`✅ ${test.name}`);
      passed++;
    } else {
      console.log(`❌ ${test.name}`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ ${test.name} - Error: ${error.message}`);
    failed++;
  }
});

console.log(`\nResults: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);