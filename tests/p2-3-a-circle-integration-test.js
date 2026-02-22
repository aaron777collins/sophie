#!/usr/bin/env node
/**
 * p2-3-a Circle Integration Test Suite
 * 
 * TDD validation of The Circle critical thinking framework integration
 * into the planning workflow system.
 * 
 * Tests: Framework documentation, checkpoint templates, planning workflow integration,
 *        validation workflow integration, and Circle perspectives definition.
 * 
 * Run: node tests/p2-3-a-circle-integration-test.js
 */

const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_PATH = path.join(__dirname, '..');
const results = { passed: 0, failed: 0, tests: [] };

// Test helper functions
function test(name, fn) {
  try {
    fn();
    results.passed++;
    results.tests.push({ name, status: 'PASS' });
    console.log(`✅ ${name}`);
  } catch (error) {
    results.failed++;
    results.tests.push({ name, status: 'FAIL', error: error.message });
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error.message}`);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readFile(relativePath) {
  const fullPath = path.join(BASE_PATH, relativePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${relativePath}`);
  }
  return fs.readFileSync(fullPath, 'utf8');
}

function fileExists(relativePath) {
  return fs.existsSync(path.join(BASE_PATH, relativePath));
}

// ============================================================================
// SECTION 1: Circle Framework Documentation Tests
// ============================================================================
console.log('\n📚 SECTION 1: Circle Framework Documentation');
console.log('─'.repeat(60));

test('Circle main documentation file exists', () => {
  assert(fileExists('docs/THE-CIRCLE-PLANNING-INTEGRATION.md'), 
    'THE-CIRCLE-PLANNING-INTEGRATION.md must exist');
});

test('Circle documentation has comprehensive structure', () => {
  const content = readFile('docs/THE-CIRCLE-PLANNING-INTEGRATION.md');
  const requiredSections = [
    'The Circle Framework',
    'Four Perspectives',
    'Pragmatist',
    'Skeptic',
    'Guardian',
    'Dreamer',
    'Planning Workflow Integration',
    'Circle Checkpoints'
  ];
  for (const section of requiredSections) {
    assert(content.includes(section), 
      `Missing required section: ${section}`);
  }
});

test('Circle documentation defines all four perspectives with key questions', () => {
  const content = readFile('docs/THE-CIRCLE-PLANNING-INTEGRATION.md');
  const perspectives = ['Pragmatist', 'Skeptic', 'Guardian', 'Dreamer'];
  for (const perspective of perspectives) {
    assert(content.includes(`### ${perspective}`), 
      `Missing perspective section: ${perspective}`);
    // Each perspective should have Key Questions
    const perspectiveSection = content.split(`### ${perspective}`)[1]?.split('###')[0] || '';
    assert(perspectiveSection.includes('Key Questions') || perspectiveSection.includes('key questions'),
      `${perspective} perspective missing Key Questions`);
  }
});

test('Circle documentation includes risk assessment integration', () => {
  const content = readFile('docs/THE-CIRCLE-PLANNING-INTEGRATION.md');
  assert(content.includes('Risk Assessment') || content.includes('risk assessment'),
    'Must include risk assessment integration');
  assert(content.includes('Risk Mitigation') || content.includes('risk mitigation'),
    'Must include risk mitigation guidance');
});

test('Circle documentation includes decision-making process', () => {
  const content = readFile('docs/THE-CIRCLE-PLANNING-INTEGRATION.md');
  assert(content.includes('Decision') && content.includes('Process'),
    'Must include decision-making process');
});

test('Circle documentation includes practical examples', () => {
  const content = readFile('docs/THE-CIRCLE-PLANNING-INTEGRATION.md');
  assert(content.includes('Example') || content.includes('example'),
    'Must include practical examples');
});

test('Circle documentation includes testing integration', () => {
  const content = readFile('docs/THE-CIRCLE-PLANNING-INTEGRATION.md');
  assert(content.includes('Testing') && content.includes('Integration'),
    'Must document testing integration with Circle');
});

// ============================================================================
// SECTION 2: Checkpoint Template Tests
// ============================================================================
console.log('\n📋 SECTION 2: Checkpoint Template Validation');
console.log('─'.repeat(60));

test('Critical thinking checkpoint template exists', () => {
  assert(fileExists('scheduler/templates/CRITICAL-THINKING-CHECKPOINT-TEMPLATE.md'),
    'CRITICAL-THINKING-CHECKPOINT-TEMPLATE.md must exist');
});

test('Checkpoint template includes all four Circle perspectives', () => {
  const content = readFile('scheduler/templates/CRITICAL-THINKING-CHECKPOINT-TEMPLATE.md');
  const perspectives = ['Pragmatist', 'Skeptic', 'Guardian', 'Dreamer'];
  for (const perspective of perspectives) {
    assert(content.includes(perspective),
      `Checkpoint template must include ${perspective} perspective`);
  }
});

test('Checkpoint template includes guided questions for each perspective', () => {
  const content = readFile('scheduler/templates/CRITICAL-THINKING-CHECKPOINT-TEMPLATE.md');
  // Each perspective should have questions indicated by question marks
  const perspectives = ['Pragmatist', 'Skeptic', 'Guardian', 'Dreamer'];
  for (const perspective of perspectives) {
    const sectionMatch = content.split(new RegExp(`${perspective}`, 'i'))[1];
    if (sectionMatch) {
      const questions = (sectionMatch.match(/\?/g) || []).length;
      assert(questions >= 3, 
        `${perspective} section should have at least 3 guiding questions`);
    }
  }
});

test('Checkpoint template includes checkpoint triggers', () => {
  const content = readFile('scheduler/templates/CRITICAL-THINKING-CHECKPOINT-TEMPLATE.md');
  assert(content.includes('Checkpoint Triggers') || content.includes('trigger'),
    'Template must define checkpoint triggers');
  assert(content.includes('Mandatory') || content.includes('mandatory'),
    'Template must define mandatory checkpoints');
});

test('Checkpoint template includes evaluation criteria', () => {
  const content = readFile('scheduler/templates/CRITICAL-THINKING-CHECKPOINT-TEMPLATE.md');
  assert(content.includes('Evaluation') || content.includes('evaluation') ||
         content.includes('Assessment') || content.includes('assessment'),
    'Template must include evaluation criteria');
});

test('Checkpoint template includes synthesis and decision documentation', () => {
  const content = readFile('scheduler/templates/CRITICAL-THINKING-CHECKPOINT-TEMPLATE.md');
  assert(content.includes('Synthesis') || content.includes('synthesis'),
    'Template must include synthesis section');
  assert(content.includes('Decision') || content.includes('decision'),
    'Template must include decision documentation');
});

test('Checkpoint template is usable with clear markdown structure', () => {
  const content = readFile('scheduler/templates/CRITICAL-THINKING-CHECKPOINT-TEMPLATE.md');
  // Should have proper heading structure
  const headings = content.match(/^##+ /gm) || [];
  assert(headings.length >= 5, 
    'Template should have organized heading structure (at least 5 sections)');
  // Should have checkboxes or action items
  assert(content.includes('[ ]') || content.includes('[x]') || content.includes('Action'),
    'Template should include actionable items or checklists');
});

// ============================================================================
// SECTION 3: Planning Workflow Integration Tests
// ============================================================================
console.log('\n🔄 SECTION 3: Planning Workflow Integration');
console.log('─'.repeat(60));

test('Circle-integrated planning workflow documentation exists', () => {
  assert(fileExists('docs/workflows/CIRCLE-INTEGRATED-PLANNING.md'),
    'CIRCLE-INTEGRATED-PLANNING.md must exist');
});

test('Planning workflow integrates Circle at project phases', () => {
  const content = readFile('docs/workflows/CIRCLE-INTEGRATED-PLANNING.md');
  const phases = ['Initiation', 'Requirements', 'Planning', 'Execution', 'Validation'];
  let phasesFound = 0;
  for (const phase of phases) {
    if (content.toLowerCase().includes(phase.toLowerCase())) {
      phasesFound++;
    }
  }
  assert(phasesFound >= 3, 
    'Workflow should cover at least 3 project phases with Circle integration');
});

test('Planning workflow includes Circle checkpoint references', () => {
  const content = readFile('docs/workflows/CIRCLE-INTEGRATED-PLANNING.md');
  assert(content.includes('Circle Checkpoint') || content.includes('checkpoint'),
    'Workflow must reference Circle checkpoints');
});

test('PLANNING-SYSTEM.md references Circle framework', () => {
  const content = readFile('docs/PLANNING-SYSTEM.md');
  // Should reference Circle or critical thinking
  const hasCircleRef = content.includes('Circle') || 
                       content.includes('critical thinking') ||
                       content.includes('perspective');
  assert(hasCircleRef,
    'PLANNING-SYSTEM.md should reference Circle framework or critical thinking');
});

test('Planning workflow includes user story enhancement with Circle', () => {
  const content = readFile('docs/workflows/CIRCLE-INTEGRATED-PLANNING.md');
  assert(content.includes('User Story') || content.includes('user story'),
    'Workflow should address user story enhancement with Circle');
});

// ============================================================================
// SECTION 4: Validation Workflow Integration Tests
// ============================================================================
console.log('\n✅ SECTION 4: Validation Workflow Integration');
console.log('─'.repeat(60));

test('Circle integrates with 3-layer validation in documentation', () => {
  const content = readFile('docs/THE-CIRCLE-PLANNING-INTEGRATION.md');
  // Should reference the 3-layer validation
  const hasLayerRef = content.includes('Layer 1') || 
                      content.includes('Layer 2') ||
                      content.includes('Layer 3') ||
                      content.includes('3-layer') ||
                      content.includes('validation layer');
  assert(hasLayerRef,
    'Circle docs should integrate with 3-layer validation workflow');
});

test('Checkpoint template references validation workflow', () => {
  const content = readFile('scheduler/templates/CRITICAL-THINKING-CHECKPOINT-TEMPLATE.md');
  const hasValidationRef = content.includes('validation') || 
                           content.includes('Validation') ||
                           content.includes('TDD');
  assert(hasValidationRef,
    'Checkpoint template should reference validation workflow');
});

test('Circle provides perspective-driven test strategy guidance', () => {
  const content = readFile('docs/THE-CIRCLE-PLANNING-INTEGRATION.md');
  // Check for testing strategy per perspective
  const hasTestStrategy = content.includes('Test') && 
                          (content.includes('Pragmatist') || content.includes('Skeptic'));
  assert(hasTestStrategy,
    'Circle should provide perspective-driven testing guidance');
});

test('Circle enhances TDD approach documentation', () => {
  const content = readFile('docs/THE-CIRCLE-PLANNING-INTEGRATION.md');
  const hasTDD = content.includes('TDD') || 
                 content.includes('Test-Driven') ||
                 content.includes('RED') && content.includes('GREEN');
  assert(hasTDD,
    'Circle framework should enhance TDD approach');
});

// ============================================================================
// SECTION 5: Circle Perspectives Definition Tests
// ============================================================================
console.log('\n🎯 SECTION 5: Circle Perspectives Definition');
console.log('─'.repeat(60));

test('Pragmatist perspective has clear focus and questions', () => {
  const content = readFile('docs/THE-CIRCLE-PLANNING-INTEGRATION.md');
  assert(content.includes('Pragmatist') && content.includes('feasibility'),
    'Pragmatist should focus on feasibility and implementation');
});

test('Skeptic perspective emphasizes critical analysis', () => {
  const content = readFile('docs/THE-CIRCLE-PLANNING-INTEGRATION.md');
  const skepticSection = content.split(/Skeptic/i)[1]?.split('###')[0] || content;
  const hasCriticalFocus = skepticSection.includes('wrong') || 
                           skepticSection.includes('fail') ||
                           skepticSection.includes('assumption') ||
                           skepticSection.includes('edge');
  assert(hasCriticalFocus,
    'Skeptic should emphasize critical analysis, failures, and edge cases');
});

test('Guardian perspective addresses security and protection', () => {
  const content = readFile('docs/THE-CIRCLE-PLANNING-INTEGRATION.md');
  const guardianSection = content.split(/Guardian/i)[1]?.split('###')[0] || content;
  const hasSecurityFocus = guardianSection.includes('security') || 
                           guardianSection.includes('Security') ||
                           guardianSection.includes('risk') ||
                           guardianSection.includes('protect');
  assert(hasSecurityFocus,
    'Guardian should address security, risk, and protection');
});

test('Dreamer perspective covers vision and long-term thinking', () => {
  const content = readFile('docs/THE-CIRCLE-PLANNING-INTEGRATION.md');
  const dreamerSection = content.split(/Dreamer/i)[1]?.split('###')[0] || content;
  const hasVisionFocus = dreamerSection.includes('vision') || 
                         dreamerSection.includes('Vision') ||
                         dreamerSection.includes('long-term') ||
                         dreamerSection.includes('opportunity') ||
                         dreamerSection.includes('strategic');
  assert(hasVisionFocus,
    'Dreamer should cover vision, opportunities, and long-term thinking');
});

test('All perspectives have integration points defined', () => {
  const content = readFile('docs/THE-CIRCLE-PLANNING-INTEGRATION.md');
  assert(content.includes('Integration Point') || content.includes('integration point'),
    'Perspectives should have defined integration points');
});

test('Perspectives include "When Most Critical" guidance', () => {
  const content = readFile('docs/THE-CIRCLE-PLANNING-INTEGRATION.md');
  const hasCriticalGuidance = content.includes('When Most Critical') ||
                              content.includes('Critical') ||
                              content.includes('most critical');
  assert(hasCriticalGuidance,
    'Perspectives should indicate when they are most critical');
});

// ============================================================================
// SECTION 6: AGENTS.md Integration Tests
// ============================================================================
console.log('\n📖 SECTION 6: AGENTS.md Integration');
console.log('─'.repeat(60));

test('AGENTS.md references The Circle framework', () => {
  const content = readFile('AGENTS.md');
  assert(content.includes('Circle') || content.includes('circle'),
    'AGENTS.md must reference The Circle framework');
});

test('AGENTS.md includes Circle in planning guidance', () => {
  const content = readFile('AGENTS.md');
  const hasCircleInPlanning = content.includes('Circle') && 
                              (content.includes('planning') || content.includes('Planning'));
  assert(hasCircleInPlanning,
    'AGENTS.md should include Circle in planning guidance');
});

// ============================================================================
// SECTION 7: Cross-Integration Tests
// ============================================================================
console.log('\n🔗 SECTION 7: Cross-Integration Validation');
console.log('─'.repeat(60));

test('Circle documentation references existing templates', () => {
  const content = readFile('docs/THE-CIRCLE-PLANNING-INTEGRATION.md');
  const hasTemplateRef = content.includes('template') || 
                         content.includes('TEMPLATE') ||
                         content.includes('CIRCLE-ANALYSIS-TEMPLATE');
  assert(hasTemplateRef,
    'Circle docs should reference available templates');
});

test('Checkpoint template references main Circle documentation', () => {
  const content = readFile('scheduler/templates/CRITICAL-THINKING-CHECKPOINT-TEMPLATE.md');
  const hasDocRef = content.includes('THE-CIRCLE') || 
                    content.includes('Circle framework');
  assert(hasDocRef,
    'Checkpoint template should reference main Circle documentation');
});

test('Worker spawn template includes Circle checkpoint guidance', () => {
  if (!fileExists('scheduler/templates/WORKER-SPAWN-TEMPLATE.md')) {
    console.log('   (Worker spawn template not found - skipping)');
    return;
  }
  const content = readFile('scheduler/templates/WORKER-SPAWN-TEMPLATE.md');
  const hasCircleRef = content.includes('Circle') || 
                       content.includes('critical thinking') ||
                       content.includes('checkpoint');
  assert(hasCircleRef,
    'Worker spawn template should reference Circle checkpoints');
});

test('Circle analysis templates exist', () => {
  // Check for Circle analysis template
  const hasAnalysisTemplate = fileExists('docs/templates/CIRCLE-ANALYSIS-TEMPLATE.md');
  const hasCheckpointTemplate = fileExists('docs/templates/CIRCLE-CHECKPOINT-TEMPLATE.md');
  assert(hasAnalysisTemplate || hasCheckpointTemplate,
    'At least one Circle template (analysis or checkpoint) should exist in docs/templates/');
});

// ============================================================================
// SECTION 8: Value Assessment Tests (Meta-Test of Circle)
// ============================================================================
console.log('\n💡 SECTION 8: Circle Value Assessment');
console.log('─'.repeat(60));

test('Circle documentation is substantial (> 5KB)', () => {
  const content = readFile('docs/THE-CIRCLE-PLANNING-INTEGRATION.md');
  assert(content.length > 5000,
    `Documentation should be substantial (${content.length} bytes, need > 5000)`);
});

test('Circle provides actionable guidance (not just theory)', () => {
  const content = readFile('docs/THE-CIRCLE-PLANNING-INTEGRATION.md');
  const actionableIndicators = [
    'Step',
    'step',
    'When to',
    'How to',
    'must',
    'should',
    'Example',
    'example'
  ];
  let actionableCount = 0;
  for (const indicator of actionableIndicators) {
    if (content.includes(indicator)) actionableCount++;
  }
  assert(actionableCount >= 4,
    'Documentation should include actionable guidance (found: ' + actionableCount + ')');
});

test('Circle workflow is comprehensive (covers full project lifecycle)', () => {
  const content = readFile('docs/workflows/CIRCLE-INTEGRATED-PLANNING.md');
  const lifecycleTerms = ['Initiation', 'Requirements', 'Design', 'Implementation', 
                          'Validation', 'Deployment', 'Execution'];
  let termsFound = 0;
  for (const term of lifecycleTerms) {
    if (content.toLowerCase().includes(term.toLowerCase())) termsFound++;
  }
  assert(termsFound >= 4,
    `Workflow should cover project lifecycle comprehensively (found ${termsFound}/7 phases)`);
});

// ============================================================================
// RESULTS SUMMARY
// ============================================================================
console.log('\n' + '═'.repeat(60));
console.log('📊 TEST RESULTS SUMMARY');
console.log('═'.repeat(60));
console.log(`\n   PASSED: ${results.passed}`);
console.log(`   FAILED: ${results.failed}`);
console.log(`   TOTAL:  ${results.passed + results.failed}`);
console.log(`   RATE:   ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
console.log('\n' + '═'.repeat(60));

// Exit with appropriate code
process.exit(results.failed > 0 ? 1 : 0);
