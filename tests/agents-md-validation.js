#!/usr/bin/env node

/**
 * AGENTS.md Validation Test Suite
 * Tests for mandatory testing requirements enhancement
 * 
 * This test suite validates that AGENTS.md contains all required sections
 * for mandatory testing and validation workflow.
 */

const fs = require('fs');
const path = require('path');

// Test configuration
const AGENTS_MD_PATH = path.join(__dirname, '..', 'AGENTS.md');
const REQUIRED_SECTIONS = [
    'Testing & Validation Requirements',
    'Mandatory Acceptance Criteria', 
    'Test-Driven Development',
    'Validation Workflow',
    'Testing Frameworks'
];

const REQUIRED_TESTING_PHRASES = [
    'mandatory testing',
    'acceptance criteria',
    'test-driven development',
    'validation workflow',
    'testing frameworks',
    'no task without tests'
];

// Test runner
class AgentsMarkdownValidator {
    constructor() {
        this.tests = [];
        this.results = { passed: 0, failed: 0, total: 0 };
    }

    async runAllTests() {
        console.log('🧪 Running AGENTS.md Validation Tests...\n');
        
        try {
            const content = await this.readAgentsMarkdown();
            
            this.testFileExists(content);
            this.testRequiredSections(content);
            this.testTestingPhrases(content);
            this.testMarkdownStructure(content);
            this.testCrossReferences(content);
            
            this.printResults();
            return this.results.failed === 0;
            
        } catch (error) {
            console.error('❌ Test suite failed:', error.message);
            return false;
        }
    }

    async readAgentsMarkdown() {
        if (!fs.existsSync(AGENTS_MD_PATH)) {
            throw new Error(`AGENTS.md not found at ${AGENTS_MD_PATH}`);
        }
        return fs.readFileSync(AGENTS_MD_PATH, 'utf8');
    }

    testFileExists(content) {
        this.runTest('AGENTS.md file exists and readable', () => {
            return content && content.length > 0;
        });
    }

    testRequiredSections(content) {
        REQUIRED_SECTIONS.forEach(section => {
            this.runTest(`Contains section: ${section}`, () => {
                return content.includes(section) || content.includes(`# ${section}`) || content.includes(`## ${section}`);
            });
        });
    }

    testTestingPhrases(content) {
        REQUIRED_TESTING_PHRASES.forEach(phrase => {
            this.runTest(`Contains testing phrase: "${phrase}"`, () => {
                return content.toLowerCase().includes(phrase.toLowerCase());
            });
        });
    }

    testMarkdownStructure(content) {
        this.runTest('Has proper markdown headers', () => {
            return content.includes('#') && !content.startsWith('#');
        });

        this.runTest('Contains task management section', () => {
            return content.includes('Management Hierarchy') || content.includes('Task Management');
        });

        this.runTest('Contains validation workflow', () => {
            return content.includes('Validation') || content.includes('validation');
        });
    }

    testCrossReferences(content) {
        this.runTest('References testing frameworks', () => {
            const frameworks = ['Jest', 'Playwright', 'testing'];
            return frameworks.some(fw => content.toLowerCase().includes(fw.toLowerCase()));
        });

        this.runTest('Has consistent internal structure', () => {
            // Check that sections flow logically
            const hasValidation = content.includes('validation');
            const hasTesting = content.includes('testing');
            return hasValidation && hasTesting;
        });
    }

    runTest(name, testFn) {
        this.results.total++;
        try {
            const passed = testFn();
            if (passed) {
                console.log(`✅ ${name}`);
                this.results.passed++;
            } else {
                console.log(`❌ ${name}`);
                this.results.failed++;
            }
        } catch (error) {
            console.log(`❌ ${name} - Error: ${error.message}`);
            this.results.failed++;
        }
    }

    printResults() {
        console.log('\n📊 Test Results:');
        console.log(`✅ Passed: ${this.results.passed}`);
        console.log(`❌ Failed: ${this.results.failed}`);
        console.log(`📈 Total: ${this.results.total}`);
        
        if (this.results.failed === 0) {
            console.log('\n🎉 All tests passed! AGENTS.md meets validation requirements.');
        } else {
            console.log('\n⚠️  Some tests failed. AGENTS.md needs updates.');
        }
    }
}

// Run tests if called directly
if (require.main === module) {
    const validator = new AgentsMarkdownValidator();
    validator.runAllTests().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = AgentsMarkdownValidator;