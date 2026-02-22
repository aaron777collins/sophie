#!/usr/bin/env node

/**
 * P2-1-C AC Compliance Validation Script
 * 
 * Validates that acceptance criteria in Phase 2 tasks follow the new template format:
 * - Given-When-Then format is used correctly
 * - Test methods are specified for each AC
 * - Evidence requirements are documented
 * - Compliance across completed tasks
 */

const fs = require('fs');
const path = require('path');

// Files to validate
const TASK_FILES = [
    'docs/examples/test-task-documentation-validation.md',  // p2-1-a output
    'docs/validation-reports/p2-1-b-workflow-assessment.md', // p2-1-b output
    'docs/templates/PROACTIVE-JOBS-TEMPLATE.md'  // Template reference
];

// Validation results
const results = {
    total_tests: 0,
    passed: 0,
    failed: 0,
    issues: []
};

function addResult(test_name, passed, message = '') {
    results.total_tests++;
    if (passed) {
        results.passed++;
        console.log(`✅ ${test_name}`);
    } else {
        results.failed++;
        results.issues.push({ test: test_name, message });
        console.log(`❌ ${test_name}: ${message}`);
    }
}

function validateGivenWhenThenFormat(content, filename) {
    console.log(`\n📋 Validating Given-When-Then Format in ${filename}`);
    
    // Check for AC sections
    const acSections = content.match(/###\s*AC-\d+:[^\n]*\n([\s\S]*?)(?=###|\n##|\n---|\n```|$)/g);
    if (!acSections) {
        addResult(`${filename}: AC sections found`, false, 'No AC sections detected');
        return;
    }
    
    addResult(`${filename}: AC sections found`, true);
    
    let validACs = 0;
    acSections.forEach((section, index) => {
        const acNum = index + 1;
        
        // Check for Given-When-Then structure
        const hasGiven = /\*\*Given\*\*/.test(section);
        const hasWhen = /\*\*When\*\*/.test(section);
        const hasThen = /\*\*Then\*\*/.test(section);
        
        addResult(`${filename}: AC-${acNum} has Given`, hasGiven, 'Missing **Given** clause');
        addResult(`${filename}: AC-${acNum} has When`, hasWhen, 'Missing **When** clause');  
        addResult(`${filename}: AC-${acNum} has Then`, hasThen, 'Missing **Then** clause');
        
        if (hasGiven && hasWhen && hasThen) {
            validACs++;
        }
        
        // Check order (Given should come before When, When before Then)
        const givenIndex = section.search(/\*\*Given\*\*/);
        const whenIndex = section.search(/\*\*When\*\*/);
        const thenIndex = section.search(/\*\*Then\*\*/);
        
        if (givenIndex > -1 && whenIndex > -1 && thenIndex > -1) {
            const correctOrder = givenIndex < whenIndex && whenIndex < thenIndex;
            addResult(`${filename}: AC-${acNum} correct GWT order`, correctOrder, 
                     'Given-When-Then not in correct order');
        }
    });
    
    addResult(`${filename}: All ACs follow GWT format`, validACs === acSections.length);
}

function validateTestMethods(content, filename) {
    console.log(`\n🧪 Validating Test Methods in ${filename}`);
    
    const acSections = content.match(/###\s*AC-\d+:.*?\n([\s\S]*?)(?=###|\n##|\n---|\n```|\n\*\*|$)/g);
    if (!acSections) {
        addResult(`${filename}: No AC sections for test method validation`, false);
        return;
    }
    
    let testMethodsSpecified = 0;
    acSections.forEach((section, index) => {
        const acNum = index + 1;
        
        // Check for Test Method specification
        const hasTestMethod = /\*\*Test Method:\*\*/.test(section);
        addResult(`${filename}: AC-${acNum} has Test Method`, hasTestMethod, 
                 'Missing **Test Method:** specification');
        
        if (hasTestMethod) {
            testMethodsSpecified++;
            
            // Check if test method is not just empty
            const testMethodMatch = section.match(/\*\*Test Method:\*\*\s*(.+)/);
            if (testMethodMatch && testMethodMatch[1].trim().length > 3) {
                addResult(`${filename}: AC-${acNum} Test Method has content`, true);
            } else {
                addResult(`${filename}: AC-${acNum} Test Method has content`, false, 
                         'Test Method field is empty or too short');
            }
        }
    });
    
    addResult(`${filename}: All ACs have Test Methods`, testMethodsSpecified === acSections.length);
}

function validateEvidenceRequirements(content, filename) {
    console.log(`\n📊 Validating Evidence Requirements in ${filename}`);
    
    const acSections = content.match(/###\s*AC-\d+:.*?\n([\s\S]*?)(?=###|\n##|\n---|\n```|\n\*\*|$)/g);
    if (!acSections) {
        addResult(`${filename}: No AC sections for evidence validation`, false);
        return;
    }
    
    let evidenceRequirementsSpecified = 0;
    acSections.forEach((section, index) => {
        const acNum = index + 1;
        
        // Check for Evidence Required specification
        const hasEvidenceRequired = /\*\*Evidence Required:\*\*/.test(section);
        addResult(`${filename}: AC-${acNum} has Evidence Required`, hasEvidenceRequired, 
                 'Missing **Evidence Required:** specification');
        
        if (hasEvidenceRequired) {
            evidenceRequirementsSpecified++;
            
            // Check if evidence requirement is not just empty
            const evidenceMatch = section.match(/\*\*Evidence Required:\*\*\s*(.+)/);
            if (evidenceMatch && evidenceMatch[1].trim().length > 3) {
                addResult(`${filename}: AC-${acNum} Evidence Required has content`, true);
            } else {
                addResult(`${filename}: AC-${acNum} Evidence Required has content`, false, 
                         'Evidence Required field is empty or too short');
            }
        }
    });
    
    addResult(`${filename}: All ACs have Evidence Requirements`, 
             evidenceRequirementsSpecified === acSections.length);
}

function validateTestingIntegration(content, filename) {
    console.log(`\n🔧 Validating Testing Integration in ${filename}`);
    
    // Check for TDD approach documentation
    const hasTDDSection = /TDD Approach/.test(content);
    addResult(`${filename}: Documents TDD approach`, hasTDDSection, 
             'Missing TDD Approach section');
    
    if (hasTDDSection) {
        const hasRED = /RED.*:/.test(content) || /RED\s*-/.test(content);
        const hasGREEN = /GREEN.*:/.test(content) || /GREEN\s*-/.test(content);
        const hasREFACTOR = /REFACTOR.*:/.test(content) || /REFACTOR\s*-/.test(content);
        
        addResult(`${filename}: Documents RED phase`, hasRED, 'Missing RED phase documentation');
        addResult(`${filename}: Documents GREEN phase`, hasGREEN, 'Missing GREEN phase documentation');
        addResult(`${filename}: Documents REFACTOR phase`, hasREFACTOR, 'Missing REFACTOR phase documentation');
    }
    
    // Check for testing framework specification
    const hasTestingFramework = /Testing Framework/.test(content) || /Jest|Playwright|Cypress|validation.script/.test(content);
    addResult(`${filename}: Specifies testing framework`, hasTestingFramework, 
             'No testing framework specified');
    
    // Check for 3-layer validation
    const hasLayer1 = /Layer 1.*Self-Validation/.test(content);
    const hasLayer2 = /Layer 2.*Manager.*Validation/.test(content) || /Layer 2.*Coordinator/.test(content);
    const hasLayer3 = /Layer 3.*Independent.*Validation/.test(content) || /Layer 3.*Validator/.test(content);
    
    addResult(`${filename}: Has Layer 1 Self-Validation`, hasLayer1, 'Missing Layer 1 Self-Validation');
    addResult(`${filename}: Has Layer 2 Manager Validation`, hasLayer2, 'Missing Layer 2 Manager Validation');
    addResult(`${filename}: Has Layer 3 Independent Validation`, hasLayer3, 'Missing Layer 3 Independent Validation');
}

function validateTestEvidence(content, filename) {
    console.log(`\n📈 Validating Test Evidence Documentation in ${filename}`);
    
    // Check for Test Evidence section
    const hasTestEvidence = /Test Evidence/.test(content) || /Testing Evidence/.test(content);
    addResult(`${filename}: Has Test Evidence section`, hasTestEvidence, 
             'Missing Test Evidence section');
    
    if (hasTestEvidence) {
        // Check for evidence categories
        const hasImplementationEvidence = /Implementation Evidence/.test(content);
        const hasValidationEvidence = /Validation Evidence/.test(content);
        const hasFilesSection = /Files Created|Files Modified/.test(content);
        
        addResult(`${filename}: Documents Implementation Evidence`, hasImplementationEvidence);
        addResult(`${filename}: Documents Validation Evidence`, hasValidationEvidence);  
        addResult(`${filename}: Documents Files Created/Modified`, hasFilesSection);
    }
}

function main() {
    console.log('🔍 P2-1-C AC Compliance Validation');
    console.log('=====================================\n');
    
    let filesProcessed = 0;
    
    for (const filename of TASK_FILES) {
        const filepath = path.join(process.cwd(), filename);
        
        if (!fs.existsSync(filepath)) {
            addResult(`${filename}: File exists`, false, 'File not found');
            continue;
        }
        
        addResult(`${filename}: File exists`, true);
        filesProcessed++;
        
        const content = fs.readFileSync(filepath, 'utf8');
        
        // Run all validations
        validateGivenWhenThenFormat(content, filename);
        validateTestMethods(content, filename);
        validateEvidenceRequirements(content, filename);
        validateTestingIntegration(content, filename);
        validateTestEvidence(content, filename);
    }
    
    // Summary
    console.log('\n📊 VALIDATION SUMMARY');
    console.log('=====================');
    console.log(`Files Processed: ${filesProcessed}`);
    console.log(`Tests Run: ${results.total_tests}`);
    console.log(`Passed: ${results.passed}`);
    console.log(`Failed: ${results.failed}`);
    
    const compliancePercentage = Math.round((results.passed / results.total_tests) * 100);
    console.log(`Compliance: ${compliancePercentage}%`);
    
    if (results.failed > 0) {
        console.log('\n❌ Issues Found:');
        results.issues.forEach((issue, index) => {
            console.log(`${index + 1}. ${issue.test}: ${issue.message}`);
        });
    }
    
    if (compliancePercentage >= 90) {
        console.log('\n✅ HIGH COMPLIANCE - AC format is being followed correctly');
    } else if (compliancePercentage >= 75) {
        console.log('\n⚠️  MODERATE COMPLIANCE - Some improvements needed');
    } else {
        console.log('\n❌ LOW COMPLIANCE - Significant AC format issues detected');
    }
    
    return compliancePercentage;
}

if (require.main === module) {
    const compliance = main();
    process.exit(compliance >= 75 ? 0 : 1);
}

module.exports = main;