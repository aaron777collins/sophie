#!/usr/bin/env node
/**
 * Gateway Architecture Validation Tests
 * 
 * TDD Test Suite for p3-2: Gateway Architecture Documentation
 * These tests validate the completeness and accuracy of the architecture documentation.
 * 
 * Created: 2026-02-24
 * Task: p3-2 - Migrate Gateway to New Architecture
 */

const fs = require('fs');
const path = require('path');

// Color codes for output
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

let passed = 0;
let failed = 0;
const failures = [];

function test(name, condition) {
  if (condition) {
    console.log(`${GREEN}✓${RESET} ${name}`);
    passed++;
  } else {
    console.log(`${RED}✗${RESET} ${name}`);
    failed++;
    failures.push(name);
  }
}

function fileExists(filePath) {
  try {
    return fs.existsSync(path.resolve(filePath.replace('~', process.env.HOME)));
  } catch {
    return false;
  }
}

function fileContains(filePath, text) {
  try {
    const content = fs.readFileSync(path.resolve(filePath.replace('~', process.env.HOME)), 'utf8');
    return content.includes(text);
  } catch {
    return false;
  }
}

function fileSizeMin(filePath, minBytes) {
  try {
    const stats = fs.statSync(path.resolve(filePath.replace('~', process.env.HOME)));
    return stats.size >= minBytes;
  } catch {
    return false;
  }
}

console.log('\n' + '='.repeat(60));
console.log('Gateway Architecture Validation Tests');
console.log('='.repeat(60) + '\n');

// =============================================================================
// Section 1: Documentation File Existence
// =============================================================================
console.log('--- Section 1: Documentation Files ---\n');

test('GATEWAY-ARCHITECTURE.md exists',
  fileExists('~/clawd/docs/GATEWAY-ARCHITECTURE.md'));

test('GATEWAY-ARCHITECTURE.md has substantial content (>10KB)',
  fileSizeMin('~/clawd/docs/GATEWAY-ARCHITECTURE.md', 10000));

// =============================================================================
// Section 2: Architecture Documentation Completeness
// =============================================================================
console.log('\n--- Section 2: Documentation Content Completeness ---\n');

const archDoc = '~/clawd/docs/GATEWAY-ARCHITECTURE.md';

test('Documents Executive Summary',
  fileContains(archDoc, 'Executive Summary') || fileContains(archDoc, 'Overview'));

test('Documents Gateway Service',
  fileContains(archDoc, 'Gateway') && fileContains(archDoc, 'Service'));

test('Documents Systemd Integration',
  fileContains(archDoc, 'systemd') || fileContains(archDoc, 'Systemd'));

test('Documents WebSocket Server',
  fileContains(archDoc, 'WebSocket') || fileContains(archDoc, 'websocket'));

test('Documents Cron System',
  fileContains(archDoc, 'cron') || fileContains(archDoc, 'Cron'));

test('Documents Agent Hierarchy',
  fileContains(archDoc, 'hierarchy') || fileContains(archDoc, 'Hierarchy'));

test('Documents Session Management',
  fileContains(archDoc, 'session') || fileContains(archDoc, 'Session'));

test('Documents Sub-Agent Spawning',
  fileContains(archDoc, 'spawn') || fileContains(archDoc, 'sub-agent'));

test('Documents Authentication',
  fileContains(archDoc, 'auth') || fileContains(archDoc, 'token'));

test('Documents Configuration',
  fileContains(archDoc, 'config') || fileContains(archDoc, '.clawdbot'));

// =============================================================================
// Section 3: Improvement Areas Documented
// =============================================================================
console.log('\n--- Section 3: Improvement Areas ---\n');

test('Documents improvement areas section',
  fileContains(archDoc, 'Improvement') || fileContains(archDoc, 'improvement'));

test('Identifies at least one performance concern',
  fileContains(archDoc, 'performance') || fileContains(archDoc, 'Performance') ||
  fileContains(archDoc, 'timeout') || fileContains(archDoc, 'latency'));

test('Identifies scalability considerations',
  fileContains(archDoc, 'scalab') || fileContains(archDoc, 'concurrent'));

test('Identifies reliability requirements',
  fileContains(archDoc, 'reliab') || fileContains(archDoc, 'recovery') || 
  fileContains(archDoc, 'restart'));

// =============================================================================
// Section 4: Migration Plan
// =============================================================================
console.log('\n--- Section 4: Migration Plan ---\n');

test('Documents migration plan',
  fileContains(archDoc, 'Migration') || fileContains(archDoc, 'migration'));

test('Defines migration phases',
  fileContains(archDoc, 'Phase') || fileContains(archDoc, 'phase'));

test('Includes timeline or estimates',
  fileContains(archDoc, 'timeline') || fileContains(archDoc, 'estimate') ||
  fileContains(archDoc, 'week') || fileContains(archDoc, 'day'));

// =============================================================================
// Section 5: Technical Accuracy
// =============================================================================
console.log('\n--- Section 5: Technical Accuracy ---\n');

test('Documents correct gateway port (18789)',
  fileContains(archDoc, '18789'));

test('Documents clawdbot CLI',
  fileContains(archDoc, 'clawdbot') || fileContains(archDoc, 'moltbot'));

test('Documents scheduler structure',
  fileContains(archDoc, 'scheduler'));

test('Documents spawn queue mechanism',
  fileContains(archDoc, 'spawn-queue') || fileContains(archDoc, 'spawn queue'));

test('Documents inbox system',
  fileContains(archDoc, 'inbox'));

test('Documents heartbeat mechanism',
  fileContains(archDoc, 'heartbeat'));

// =============================================================================
// Section 6: Validation Components Documented
// =============================================================================
console.log('\n--- Section 6: Validation & Testing Documentation ---\n');

test('Documents 3-layer validation',
  fileContains(archDoc, '3-layer') || fileContains(archDoc, 'three-layer') ||
  fileContains(archDoc, 'Layer 1') || fileContains(archDoc, 'validation'));

test('Documents testing requirements',
  fileContains(archDoc, 'test') || fileContains(archDoc, 'Test'));

// =============================================================================
// Results Summary
// =============================================================================
console.log('\n' + '='.repeat(60));
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log('='.repeat(60));

if (failed > 0) {
  console.log(`\n${RED}Failed tests:${RESET}`);
  failures.forEach(f => console.log(`  - ${f}`));
}

console.log(`\n${passed > 0 && failed === 0 ? GREEN : failed > 0 ? RED : YELLOW}Overall: ${
  failed === 0 ? 'PASS' : 'FAIL'
}${RESET}\n`);

process.exit(failed > 0 ? 1 : 0);
