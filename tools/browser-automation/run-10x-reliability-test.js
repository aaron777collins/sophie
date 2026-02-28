#!/usr/bin/env node

/**
 * 10x Playwright Screenshot Reliability Test Runner
 * 
 * Executes the production reliability test with 10 consecutive runs
 * as specified in task US-BA-04
 */

const { PlaywrightReliabilityTester } = require('./reliability-test');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║                US-BA-04: 10x Reliability Test                 ║');
  console.log('║          Playwright Screenshot Functionality Validation       ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  // Production configuration for 10x reliability test
  const config = {
    runCount: 10,
    targetUrl: 'https://example.com',
    outputDir: '/tmp/playwright-reliability-production',
    timeout: 30000,
    viewport: { width: 1920, height: 1080 },
    browser: 'chromium',
    waitUntil: 'networkidle',
    screenshotType: 'png'
  };

  const tester = new PlaywrightReliabilityTester(config);

  try {
    // Run the comprehensive reliability test
    const results = await tester.runReliabilityTest();

    // Generate detailed analysis
    const analysis = tester.analyzeResults(results);
    const readiness = tester.validateProductionReadiness(results);
    const report = tester.generateReport(results);

    // Save results to file
    const resultsFile = path.join(config.outputDir, 'reliability-test-results.json');
    const reportFile = path.join(config.outputDir, 'reliability-test-report.txt');

    fs.writeFileSync(resultsFile, JSON.stringify({
      testConfig: config,
      results,
      analysis,
      readiness,
      timestamp: new Date().toISOString()
    }, null, 2));

    fs.writeFileSync(reportFile, report);

    // Display final report
    console.log(report);

    // Critical success/failure determination
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                        FINAL ASSESSMENT                       ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');

    if (readiness.isReady && results.successRate === 100) {
      console.log('✅ TASK COMPLETED SUCCESSFULLY');
      console.log('✅ 10/10 tests passed (100% success rate)');
      console.log('✅ Production ready for deployment');
      process.exit(0);
    } else {
      console.log('❌ RELIABILITY TEST FAILED');
      console.log(`❌ Success rate: ${results.successRate}% (target: 100%)`);
      console.log('❌ NOT recommended for production use');
      
      if (readiness.criticalIssues.length > 0) {
        console.log('\n🚨 Critical Issues:');
        readiness.criticalIssues.forEach(issue => console.log(`   • ${issue}`));
      }
      
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ RELIABILITY TEST EXECUTION FAILED');
    console.error('Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };