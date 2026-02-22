#!/usr/bin/env node

/**
 * Tests for Critical Thinking Checkpoint Integration with Existing Templates
 * Validates that existing templates properly reference the checkpoint system
 */

const fs = require('fs');
const path = require('path');

const TEMPLATES_DIR = path.join(__dirname, '../../scheduler/templates');
const WORKER_TEMPLATE_PATH = path.join(TEMPLATES_DIR, 'WORKER-SPAWN-TEMPLATE.md');
const CHECKPOINT_TEMPLATE_PATH = path.join(TEMPLATES_DIR, 'CRITICAL-THINKING-CHECKPOINT-TEMPLATE.md');

// Load template content
let workerTemplateContent = fs.existsSync(WORKER_TEMPLATE_PATH) 
  ? fs.readFileSync(WORKER_TEMPLATE_PATH, 'utf8') 
  : '';

let checkpointTemplateExists = fs.existsSync(CHECKPOINT_TEMPLATE_PATH);

console.log('Running Template Integration Tests...');

let passed = 0;
let failed = 0;

const tests = [
  {
    name: 'checkpoint template exists before integration',
    fn: () => fs.existsSync(CHECKPOINT_TEMPLATE_PATH)
  },
  {
    name: 'worker template references critical thinking checkpoints',
    fn: () => {
      const content = fs.existsSync(WORKER_TEMPLATE_PATH) 
        ? fs.readFileSync(WORKER_TEMPLATE_PATH, 'utf8') 
        : '';
      return /critical.*thinking/i.test(content) && /checkpoint/i.test(content);
    }
  },
  {
    name: 'worker template includes Circle analysis guidance',
    fn: () => {
      const content = fs.existsSync(WORKER_TEMPLATE_PATH) 
        ? fs.readFileSync(WORKER_TEMPLATE_PATH, 'utf8') 
        : '';
      return /circle/i.test(content) && /perspective/i.test(content);
    }
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