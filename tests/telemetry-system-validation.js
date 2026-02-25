#!/usr/bin/env node
/**
 * Telemetry System Validation Tests
 * 
 * TDD Test Suite for p3-3: Comprehensive Telemetry System Design
 * These tests validate the completeness and accuracy of the telemetry documentation.
 * 
 * Created: 2026-02-24
 * Task: p3-3 - Implement Comprehensive Telemetry System
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
    return content.toLowerCase().includes(text.toLowerCase());
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

function countOccurrences(filePath, text) {
  try {
    const content = fs.readFileSync(path.resolve(filePath.replace('~', process.env.HOME)), 'utf8');
    const regex = new RegExp(text, 'gi');
    const matches = content.match(regex);
    return matches ? matches.length : 0;
  } catch {
    return 0;
  }
}

console.log('\n' + '='.repeat(60));
console.log('Telemetry System Validation Tests');
console.log('='.repeat(60) + '\n');

const telemetryDoc = '~/clawd/docs/TELEMETRY-SYSTEM.md';

// =============================================================================
// Section 1: Documentation File Existence
// =============================================================================
console.log('--- Section 1: Documentation Files ---\n');

test('TELEMETRY-SYSTEM.md exists',
  fileExists(telemetryDoc));

test('TELEMETRY-SYSTEM.md has substantial content (>8KB)',
  fileSizeMin(telemetryDoc, 8000));

// =============================================================================
// Section 2: Telemetry Architecture Overview
// =============================================================================
console.log('\n--- Section 2: Architecture Overview ---\n');

test('Documents Executive Summary or Overview',
  fileContains(telemetryDoc, 'summary') || fileContains(telemetryDoc, 'overview'));

test('Documents telemetry architecture',
  fileContains(telemetryDoc, 'architecture'));

test('Documents three pillars: Metrics, Logs, Traces',
  fileContains(telemetryDoc, 'metric') && 
  fileContains(telemetryDoc, 'log') && 
  fileContains(telemetryDoc, 'trace'));

test('Contains architecture diagram (ASCII or description)',
  fileContains(telemetryDoc, '┌') || 
  fileContains(telemetryDoc, '─') ||
  fileContains(telemetryDoc, 'diagram'));

// =============================================================================
// Section 3: Metrics Collection
// =============================================================================
console.log('\n--- Section 3: Metrics Collection ---\n');

test('Documents task completion metrics',
  fileContains(telemetryDoc, 'task completion') || 
  fileContains(telemetryDoc, 'task_completion') ||
  fileContains(telemetryDoc, 'completion rate'));

test('Documents latency metrics',
  fileContains(telemetryDoc, 'latency'));

test('Documents error metrics',
  fileContains(telemetryDoc, 'error') && 
  (fileContains(telemetryDoc, 'rate') || fileContains(telemetryDoc, 'count')));

test('Documents throughput metrics',
  fileContains(telemetryDoc, 'throughput') || 
  fileContains(telemetryDoc, 'requests per'));

test('Documents resource utilization metrics',
  fileContains(telemetryDoc, 'memory') || 
  fileContains(telemetryDoc, 'cpu') ||
  fileContains(telemetryDoc, 'resource'));

test('Documents agent-specific metrics',
  fileContains(telemetryDoc, 'agent') && 
  (fileContains(telemetryDoc, 'spawn') || fileContains(telemetryDoc, 'session')));

// =============================================================================
// Section 4: Logging System
// =============================================================================
console.log('\n--- Section 4: Logging System ---\n');

test('Documents log levels',
  fileContains(telemetryDoc, 'debug') || 
  fileContains(telemetryDoc, 'info') ||
  fileContains(telemetryDoc, 'error') ||
  fileContains(telemetryDoc, 'log level'));

test('Documents structured logging',
  fileContains(telemetryDoc, 'structured') || 
  fileContains(telemetryDoc, 'json'));

test('Documents log rotation or retention',
  fileContains(telemetryDoc, 'rotation') || 
  fileContains(telemetryDoc, 'retention') ||
  fileContains(telemetryDoc, 'archiv'));

test('Documents correlation IDs for tracing',
  fileContains(telemetryDoc, 'correlation') || 
  fileContains(telemetryDoc, 'trace id') ||
  fileContains(telemetryDoc, 'request id'));

// =============================================================================
// Section 5: Collection Points
// =============================================================================
console.log('\n--- Section 5: Collection Points ---\n');

test('Documents Gateway collection point',
  fileContains(telemetryDoc, 'gateway'));

test('Documents Scheduler/Cron collection point',
  fileContains(telemetryDoc, 'scheduler') || 
  fileContains(telemetryDoc, 'cron'));

test('Documents Agent session collection point',
  fileContains(telemetryDoc, 'session'));

test('Documents Spawn queue collection point',
  fileContains(telemetryDoc, 'spawn') || 
  fileContains(telemetryDoc, 'sub-agent'));

test('Documents Inbox/communication collection point',
  fileContains(telemetryDoc, 'inbox') || 
  fileContains(telemetryDoc, 'communication') ||
  fileContains(telemetryDoc, 'message'));

// =============================================================================
// Section 6: Key Performance Indicators (KPIs)
// =============================================================================
console.log('\n--- Section 6: Key Performance Indicators ---\n');

test('Defines KPIs or key metrics',
  fileContains(telemetryDoc, 'kpi') || 
  fileContains(telemetryDoc, 'key metric') ||
  fileContains(telemetryDoc, 'key performance'));

test('Documents target values or thresholds',
  fileContains(telemetryDoc, 'threshold') || 
  fileContains(telemetryDoc, 'target') ||
  fileContains(telemetryDoc, 'baseline'));

test('Documents alerting conditions',
  fileContains(telemetryDoc, 'alert') || 
  fileContains(telemetryDoc, 'notification') ||
  fileContains(telemetryDoc, 'warning'));

// =============================================================================
// Section 7: Implementation Plan
// =============================================================================
console.log('\n--- Section 7: Implementation Plan ---\n');

test('Documents implementation phases',
  fileContains(telemetryDoc, 'phase'));

test('Documents timeline or estimates',
  fileContains(telemetryDoc, 'week') || 
  fileContains(telemetryDoc, 'timeline') ||
  fileContains(telemetryDoc, 'estimate'));

test('Documents dependencies or prerequisites',
  fileContains(telemetryDoc, 'depend') || 
  fileContains(telemetryDoc, 'prerequisite') ||
  fileContains(telemetryDoc, 'require'));

test('Documents storage considerations',
  fileContains(telemetryDoc, 'storage') || 
  fileContains(telemetryDoc, 'database') ||
  fileContains(telemetryDoc, 'persist'));

// =============================================================================
// Section 8: Integration with Existing Systems
// =============================================================================
console.log('\n--- Section 8: Integration ---\n');

test('References GATEWAY-ARCHITECTURE.md',
  fileContains(telemetryDoc, 'gateway-architecture') || 
  fileContains(telemetryDoc, 'gateway architecture'));

test('Documents integration with heartbeat system',
  fileContains(telemetryDoc, 'heartbeat'));

test('Documents integration with validation system',
  fileContains(telemetryDoc, 'validation') || 
  fileContains(telemetryDoc, '3-layer'));

// =============================================================================
// Section 9: Dashboard & Visualization
// =============================================================================
console.log('\n--- Section 9: Visualization ---\n');

test('Documents dashboard or visualization',
  fileContains(telemetryDoc, 'dashboard') || 
  fileContains(telemetryDoc, 'visual') ||
  fileContains(telemetryDoc, 'display'));

test('Documents metric aggregation',
  fileContains(telemetryDoc, 'aggregat') || 
  fileContains(telemetryDoc, 'rollup') ||
  fileContains(telemetryDoc, 'summar'));

// =============================================================================
// Section 10: Technical Reference
// =============================================================================
console.log('\n--- Section 10: Technical Reference ---\n');

test('Documents metric naming conventions',
  fileContains(telemetryDoc, 'naming') || 
  fileContains(telemetryDoc, 'convention') ||
  fileContains(telemetryDoc, 'format'));

test('Documents at least 10 specific metrics',
  countOccurrences(telemetryDoc, '_') >= 10 ||
  countOccurrences(telemetryDoc, 'metric') >= 10);

test('Documents data retention policy',
  fileContains(telemetryDoc, 'retention') || 
  fileContains(telemetryDoc, 'cleanup') ||
  fileContains(telemetryDoc, 'expir'));

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
