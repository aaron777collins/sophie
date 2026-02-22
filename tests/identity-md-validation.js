#!/usr/bin/env node

// TDD Validation Script for IDENTITY.md Testing & Validation Requirements Integration
// Tests for mandatory validation-first workflow and testing requirements

const fs = require('fs');
const path = require('path');

const IDENTITY_PATH = path.join(__dirname, '..', 'IDENTITY.md');

function runTests() {
  console.log('🧪 TDD Phase: Running IDENTITY.md validation tests...\n');
  
  if (!fs.existsSync(IDENTITY_PATH)) {
    console.error('❌ IDENTITY.md file not found!');
    process.exit(1);
  }
  
  const content = fs.readFileSync(IDENTITY_PATH, 'utf8');
  let passed = 0;
  let failed = 0;

  // Test cases for validation-first workflow integration
  const tests = [
    // Core testing requirements
    {
      name: 'Contains validation-first approach in work methodology',
      test: () => content.includes('validation-first') || content.includes('Validation-First'),
      required: true
    },
    {
      name: 'Contains testing requirements for project work',
      test: () => content.includes('testing requirements') || content.includes('Testing Requirements'),
      required: true
    },
    {
      name: 'Contains TDD methodology reference',
      test: () => content.includes('TDD') || content.includes('Test-Driven Development'),
      required: true
    },
    {
      name: 'Contains 3-layer validation workflow reference',
      test: () => content.includes('3-layer') || content.includes('three-layer') || content.includes('Layer 1') || content.includes('validation workflow'),
      required: true
    },
    
    // Memory system integration with validation
    {
      name: 'Updates memory system with validation practices',
      test: () => content.includes('memory') && (content.includes('validation') || content.includes('testing')),
      required: true
    },
    {
      name: 'Documents testing responsibility for main session tasks',
      test: () => content.includes('main session') && (content.includes('testing') || content.includes('validation')),
      required: true
    },
    
    // Management hierarchy references
    {
      name: 'References enhanced proactive job workflow',
      test: () => content.includes('proactive') || content.includes('Proactive') || content.includes('management hierarchy'),
      required: true
    },
    {
      name: 'Updates interaction patterns with management hierarchy',
      test: () => content.includes('hierarchy') || content.includes('Coordinator') || content.includes('Validator'),
      required: true
    },
    
    // Core methodology preservation
    {
      name: 'Preserves core Sophie identity',
      test: () => content.includes('Sophie') && content.includes('Sophisticated Omnichannel Personal Help'),
      required: true
    },
    {
      name: 'Preserves memory system fundamentals',
      test: () => content.includes('Memory System') || content.includes('memory system'),
      required: true
    },
    
    // Testing evidence and validation requirements
    {
      name: 'Contains testing evidence requirements',
      test: () => content.includes('evidence') || content.includes('Evidence') || content.includes('test results'),
      required: true
    },
    {
      name: 'Contains validation workflow documentation',
      test: () => content.includes('validation workflow') || content.includes('Validation Workflow'),
      required: true
    },
    
    // No Task Without Tests policy reference
    {
      name: 'References No Task Without Tests policy',
      test: () => content.includes('No Task Without Tests') || content.includes('no task without test') || content.includes('tasks without testing'),
      required: true
    },
    
    // Work methodology updates
    {
      name: 'Documents validation approach in work methodology',
      test: () => content.includes('methodology') && (content.includes('validation') || content.includes('testing')),
      required: true
    },
    {
      name: 'Contains testing framework references',
      test: () => content.includes('testing framework') || content.includes('Testing Framework') || content.includes('Jest') || content.includes('validation script'),
      required: true
    }
  ];

  // Run all tests
  tests.forEach((test, index) => {
    const result = test.test();
    const status = result ? '✅' : '❌';
    const requirement = test.required ? '(REQUIRED)' : '(optional)';
    
    console.log(`${status} Test ${index + 1}: ${test.name} ${requirement}`);
    
    if (result) {
      passed++;
    } else {
      failed++;
      if (test.required) {
        console.log(`   ⚠️  This is a required test case`);
      }
    }
  });

  // Summary
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed, ${tests.length} total`);
  
  if (failed === 0) {
    console.log('🎉 All validation tests passed! IDENTITY.md properly updated with testing requirements.');
    return true;
  } else {
    console.log('⚠️  Some tests failed. IDENTITY.md needs further updates.');
    return false;
  }
}

// Run tests if called directly
if (require.main === module) {
  const success = runTests();
  process.exit(success ? 0 : 1);
}

module.exports = { runTests };