#!/usr/bin/env node

/**
 * Validation Script for Task Manager IDENTITY.md
 * Tests that the file contains all mandatory testing and validation requirements
 */

const fs = require('fs');
const path = require('path');

const IDENTITY_FILE = path.join(process.env.HOME, 'clawd', 'scheduler', 'task-managers', 'IDENTITY.md');

function runTests() {
    console.log('🧪 Task Manager IDENTITY.md Validation Tests');
    console.log('='.repeat(50));
    
    if (!fs.existsSync(IDENTITY_FILE)) {
        console.error('❌ IDENTITY.md file not found at:', IDENTITY_FILE);
        process.exit(1);
    }
    
    const content = fs.readFileSync(IDENTITY_FILE, 'utf8');
    let passedTests = 0;
    let totalTests = 0;
    
    const tests = [
        // Core testing requirements
        {
            name: 'References AGENTS.md testing requirements',
            test: () => content.includes('AGENTS.md') && content.includes('testing')
        },
        {
            name: 'Contains TDD methodology reference',
            test: () => content.includes('TDD') || content.includes('Test-Driven Development')
        },
        {
            name: 'Requires acceptance criteria before spawning',
            test: () => content.includes('acceptance criteria') && content.includes('before spawning')
        },
        {
            name: 'Includes test verification in validation checklist',
            test: () => content.includes('test') && (content.includes('verification') || content.includes('validate'))
        },
        {
            name: 'Mentions rejection of tasks without testing plans',
            test: () => content.includes('reject') && content.includes('test')
        },
        {
            name: 'RED → GREEN → REFACTOR methodology mentioned',
            test: () => content.includes('RED') && content.includes('GREEN') && content.includes('REFACTOR')
        },
        {
            name: 'Testing frameworks integration mentioned',
            test: () => content.includes('Jest') || content.includes('Playwright') || content.includes('testing framework')
        },
        {
            name: 'Test evidence collection requirements',
            test: () => content.includes('evidence') && content.includes('test')
        },
        {
            name: 'No task without tests policy',
            test: () => content.includes('without test') && (content.includes('reject') || content.includes('MUST'))
        },
        {
            name: 'Testing strategy defined upfront requirement',
            test: () => content.includes('strategy') && content.includes('upfront')
        },
        {
            name: 'Validation method documentation requirement',
            test: () => content.includes('validation method') || (content.includes('validation') && content.includes('method'))
        },
        {
            name: 'Worker spawning template includes testing requirements',
            test: () => content.includes('spawn') && content.includes('test') && content.includes('template')
        },
        {
            name: 'Enhanced validation workflow mentioned',
            test: () => content.includes('validation workflow') || (content.includes('3-layer') || content.includes('Layer 1'))
        },
        {
            name: 'Test results verification before approval',
            test: () => content.includes('test results') && (content.includes('verify') || content.includes('review'))
        },
        {
            name: 'Independent test verification requirement',
            test: () => content.includes('independent') && content.includes('test') && content.includes('verify')
        }
    ];
    
    tests.forEach((testCase, index) => {
        totalTests++;
        const passed = testCase.test();
        const status = passed ? '✅' : '❌';
        console.log(`${status} Test ${index + 1}: ${testCase.name}`);
        if (passed) passedTests++;
    });
    
    console.log('\n' + '='.repeat(50));
    console.log(`📊 Results: ${passedTests}/${totalTests} tests passing`);
    
    if (passedTests === totalTests) {
        console.log('🎉 All tests pass! Task Manager IDENTITY.md meets requirements.');
        return true;
    } else {
        console.log(`❌ ${totalTests - passedTests} tests failing. Requirements not met.`);
        return false;
    }
}

if (require.main === module) {
    const success = runTests();
    process.exit(success ? 0 : 1);
}

module.exports = { runTests };