#!/usr/bin/env node
/**
 * TDD Test Suite for Session Log Search & Organization
 * Task: p3-1 - Audit and Refactor Session Logs
 * 
 * RED PHASE: Tests written first - should FAIL until implementation
 */

const fs = require('fs');
const path = require('path');

// Test tracking
let testsPassed = 0;
let testsFailed = 0;
const results = [];

function test(name, fn) {
  try {
    fn();
    testsPassed++;
    results.push({ name, status: '✅ PASS' });
  } catch (e) {
    testsFailed++;
    results.push({ name, status: '❌ FAIL', error: e.message });
  }
}

function assertEqual(actual, expected, msg) {
  if (actual !== expected) {
    throw new Error(`${msg}: Expected "${expected}", got "${actual}"`);
  }
}

function assertTrue(condition, msg) {
  if (!condition) {
    throw new Error(`${msg}: Condition was false`);
  }
}

function assertContains(arr, item, msg) {
  if (!arr.includes(item)) {
    throw new Error(`${msg}: "${item}" not found in array`);
  }
}

// ============================================
// Section 1: Log Index Tests
// ============================================

test('LOG_INDEX_EXISTS - Session log index file must exist', () => {
  const indexPath = path.join(__dirname, '..', 'memory', 'logs', 'INDEX.md');
  assertTrue(fs.existsSync(indexPath), 'memory/logs/INDEX.md should exist');
});

test('LOG_INDEX_HAS_CATEGORIES - Index must have log categories', () => {
  const indexPath = path.join(__dirname, '..', 'memory', 'logs', 'INDEX.md');
  if (!fs.existsSync(indexPath)) throw new Error('Index file missing');
  const content = fs.readFileSync(indexPath, 'utf8');
  assertTrue(content.includes('## Daily Logs'), 'Index should have Daily Logs section');
  assertTrue(content.includes('## Progress Logs'), 'Index should have Progress Logs section');
  assertTrue(content.includes('## Search'), 'Index should have Search section');
});

test('LOG_INDEX_HAS_STATS - Index must have log statistics', () => {
  const indexPath = path.join(__dirname, '..', 'memory', 'logs', 'INDEX.md');
  if (!fs.existsSync(indexPath)) throw new Error('Index file missing');
  const content = fs.readFileSync(indexPath, 'utf8');
  assertTrue(content.includes('Total Files'), 'Index should show total files');
  assertTrue(content.includes('Total Size'), 'Index should show total size');
});

// ============================================
// Section 2: Log Search Tool Tests
// ============================================

test('SEARCH_TOOL_EXISTS - Log search tool must exist', () => {
  const toolPath = path.join(__dirname, '..', 'tools', 'log-search.js');
  assertTrue(fs.existsSync(toolPath), 'tools/log-search.js should exist');
});

test('SEARCH_TOOL_IS_EXECUTABLE - Search tool must be executable', () => {
  const toolPath = path.join(__dirname, '..', 'tools', 'log-search.js');
  if (!fs.existsSync(toolPath)) throw new Error('Tool file missing');
  const content = fs.readFileSync(toolPath, 'utf8');
  assertTrue(content.startsWith('#!/usr/bin/env node'), 'Tool should have shebang');
});

test('SEARCH_TOOL_HAS_HELP - Search tool must have help option', () => {
  const toolPath = path.join(__dirname, '..', 'tools', 'log-search.js');
  if (!fs.existsSync(toolPath)) throw new Error('Tool file missing');
  const content = fs.readFileSync(toolPath, 'utf8');
  assertTrue(content.includes('--help') || content.includes('-h'), 'Tool should have help option');
});

test('SEARCH_TOOL_HAS_DATE_FILTER - Search tool must support date filtering', () => {
  const toolPath = path.join(__dirname, '..', 'tools', 'log-search.js');
  if (!fs.existsSync(toolPath)) throw new Error('Tool file missing');
  const content = fs.readFileSync(toolPath, 'utf8');
  assertTrue(content.includes('--date') || content.includes('--since') || content.includes('--from'), 
    'Tool should support date filtering');
});

test('SEARCH_TOOL_HAS_KEYWORD_SEARCH - Search tool must support keyword search', () => {
  const toolPath = path.join(__dirname, '..', 'tools', 'log-search.js');
  if (!fs.existsSync(toolPath)) throw new Error('Tool file missing');
  const content = fs.readFileSync(toolPath, 'utf8');
  assertTrue(content.includes('query') || content.includes('search') || content.includes('keyword'), 
    'Tool should support keyword search');
});

test('SEARCH_TOOL_HAS_PROJECT_FILTER - Search tool must support project filtering', () => {
  const toolPath = path.join(__dirname, '..', 'tools', 'log-search.js');
  if (!fs.existsSync(toolPath)) throw new Error('Tool file missing');
  const content = fs.readFileSync(toolPath, 'utf8');
  assertTrue(content.includes('--project') || content.includes('project'), 
    'Tool should support project filtering');
});

// ============================================
// Section 3: Log Organization Structure Tests
// ============================================

test('LOGS_DIR_EXISTS - Organized logs directory must exist', () => {
  const logsDir = path.join(__dirname, '..', 'memory', 'logs');
  assertTrue(fs.existsSync(logsDir), 'memory/logs directory should exist');
});

test('LOGS_HAS_DAILY_SUBDIR - Logs must have daily subdirectory', () => {
  const dailyDir = path.join(__dirname, '..', 'memory', 'logs', 'daily');
  assertTrue(fs.existsSync(dailyDir), 'memory/logs/daily directory should exist');
});

test('LOGS_HAS_PROGRESS_SUBDIR - Logs must have progress subdirectory', () => {
  const progressDir = path.join(__dirname, '..', 'memory', 'logs', 'progress');
  assertTrue(fs.existsSync(progressDir), 'memory/logs/progress directory should exist');
});

test('LOGS_HAS_ARCHIVE_SUBDIR - Logs must have archive subdirectory', () => {
  const archiveDir = path.join(__dirname, '..', 'memory', 'logs', 'archive');
  assertTrue(fs.existsSync(archiveDir), 'memory/logs/archive directory should exist');
});

// ============================================
// Section 4: Log Analysis Tool Tests
// ============================================

test('ANALYSIS_TOOL_EXISTS - Log analysis tool must exist', () => {
  const toolPath = path.join(__dirname, '..', 'tools', 'log-analyze.js');
  assertTrue(fs.existsSync(toolPath), 'tools/log-analyze.js should exist');
});

test('ANALYSIS_TOOL_HAS_STATS - Analysis tool must provide statistics', () => {
  const toolPath = path.join(__dirname, '..', 'tools', 'log-analyze.js');
  if (!fs.existsSync(toolPath)) throw new Error('Tool file missing');
  const content = fs.readFileSync(toolPath, 'utf8');
  assertTrue(content.includes('stats') || content.includes('statistics') || content.includes('count'), 
    'Tool should provide statistics');
});

test('ANALYSIS_TOOL_HAS_SIZE_CHECK - Analysis tool must check file sizes', () => {
  const toolPath = path.join(__dirname, '..', 'tools', 'log-analyze.js');
  if (!fs.existsSync(toolPath)) throw new Error('Tool file missing');
  const content = fs.readFileSync(toolPath, 'utf8');
  assertTrue(content.includes('size') || content.includes('bytes') || content.includes('KB'), 
    'Tool should check file sizes');
});

// ============================================
// Section 5: Documentation Tests
// ============================================

test('DOCS_SESSION_LOG_GUIDE_EXISTS - Session log guide must exist', () => {
  const docPath = path.join(__dirname, '..', 'docs', 'SESSION-LOG-ORGANIZATION.md');
  assertTrue(fs.existsSync(docPath), 'docs/SESSION-LOG-ORGANIZATION.md should exist');
});

test('DOCS_HAS_STRUCTURE_SECTION - Guide must document structure', () => {
  const docPath = path.join(__dirname, '..', 'docs', 'SESSION-LOG-ORGANIZATION.md');
  if (!fs.existsSync(docPath)) throw new Error('Doc file missing');
  const content = fs.readFileSync(docPath, 'utf8');
  assertTrue(content.includes('## Structure') || content.includes('## Organization'), 
    'Guide should have structure section');
});

test('DOCS_HAS_SEARCH_SECTION - Guide must document search', () => {
  const docPath = path.join(__dirname, '..', 'docs', 'SESSION-LOG-ORGANIZATION.md');
  if (!fs.existsSync(docPath)) throw new Error('Doc file missing');
  const content = fs.readFileSync(docPath, 'utf8');
  assertTrue(content.includes('## Search') || content.includes('## Searching'), 
    'Guide should have search section');
});

test('DOCS_HAS_BEST_PRACTICES - Guide must have best practices', () => {
  const docPath = path.join(__dirname, '..', 'docs', 'SESSION-LOG-ORGANIZATION.md');
  if (!fs.existsSync(docPath)) throw new Error('Doc file missing');
  const content = fs.readFileSync(docPath, 'utf8');
  assertTrue(content.includes('Best Practices') || content.includes('Guidelines') || content.includes('Rules'), 
    'Guide should have best practices');
});

// ============================================
// Section 6: Log Metadata Tests
// ============================================

test('METADATA_FILE_EXISTS - Log metadata file must exist', () => {
  const metaPath = path.join(__dirname, '..', 'memory', 'logs', 'metadata.json');
  assertTrue(fs.existsSync(metaPath), 'memory/logs/metadata.json should exist');
});

test('METADATA_HAS_VALID_JSON - Metadata must be valid JSON', () => {
  const metaPath = path.join(__dirname, '..', 'memory', 'logs', 'metadata.json');
  if (!fs.existsSync(metaPath)) throw new Error('Metadata file missing');
  const content = fs.readFileSync(metaPath, 'utf8');
  try {
    JSON.parse(content);
  } catch (e) {
    throw new Error('Metadata is not valid JSON');
  }
});

test('METADATA_HAS_LAST_INDEXED - Metadata must track last indexed time', () => {
  const metaPath = path.join(__dirname, '..', 'memory', 'logs', 'metadata.json');
  if (!fs.existsSync(metaPath)) throw new Error('Metadata file missing');
  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  assertTrue('lastIndexed' in meta, 'Metadata should have lastIndexed field');
});

test('METADATA_HAS_FILE_COUNT - Metadata must track file counts', () => {
  const metaPath = path.join(__dirname, '..', 'memory', 'logs', 'metadata.json');
  if (!fs.existsSync(metaPath)) throw new Error('Metadata file missing');
  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
  assertTrue('fileCount' in meta || 'totalFiles' in meta || 'files' in meta, 
    'Metadata should have file count');
});

// ============================================
// Run Tests & Report
// ============================================

console.log('\n' + '='.repeat(60));
console.log('📋 p3-1 Session Log Search & Organization Tests');
console.log('='.repeat(60) + '\n');

results.forEach(r => {
  console.log(`${r.status} ${r.name}`);
  if (r.error) console.log(`   ↳ ${r.error}`);
});

console.log('\n' + '-'.repeat(60));
console.log(`Results: ${testsPassed} passed, ${testsFailed} failed (${results.length} total)`);
console.log('-'.repeat(60));

if (testsFailed > 0) {
  console.log('\n⚠️  Tests FAILED - Implementation needed (TDD RED phase)');
  process.exit(1);
} else {
  console.log('\n✅ All tests PASSED (TDD GREEN phase)');
  process.exit(0);
}
