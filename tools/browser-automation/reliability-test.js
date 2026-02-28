/**
 * Playwright Screenshot Reliability Tester
 * 
 * A comprehensive testing framework for validating Playwright screenshot reliability
 * across multiple runs, with detailed analysis and reporting capabilities.
 */

// Use the installed playwright from pnpm node_modules
let chromium;
try {
  // Try to import playwright normally first
  ({ chromium } = require('playwright'));
} catch (e) {
  // Fallback to explicit path if needed
  try {
    ({ chromium } = require('../../node_modules/.pnpm/playwright@1.58.2/node_modules/playwright'));
  } catch (e2) {
    throw new Error('Playwright not found. Please ensure it is installed.');
  }
}
const fs = require('fs');
const path = require('path');

class PlaywrightReliabilityTester {
  constructor(config = {}) {
    this.config = {
      runCount: config.runCount || 10,
      targetUrl: config.targetUrl || 'https://example.com',
      outputDir: config.outputDir || '/tmp/playwright-reliability',
      timeout: config.timeout || 30000,
      viewport: config.viewport || { width: 1920, height: 1080 },
      browser: config.browser || 'chromium',
      waitUntil: config.waitUntil || 'networkidle',
      screenshotType: config.screenshotType || 'png',
      ...config
    };

    // Ensure output directory exists
    this._ensureOutputDirectory();
  }

  /**
   * Ensures the output directory exists
   * @private
   */
  _ensureOutputDirectory() {
    if (!fs.existsSync(this.config.outputDir)) {
      fs.mkdirSync(this.config.outputDir, { recursive: true });
    }
  }

  /**
   * Runs a single screenshot test
   * @param {number} runNumber - The run number (1-based)
   * @returns {Promise<Object>} Test result object
   */
  async runSingleTest(runNumber) {
    const startTime = Date.now();
    let browser = null;
    let page = null;
    
    const result = {
      runNumber,
      success: false,
      duration: 0,
      screenshotPath: null,
      error: null,
      timestamp: new Date().toISOString()
    };

    try {
      // Launch browser with timeout
      browser = await chromium.launch({
        timeout: this.config.timeout
      });

      // Create page with viewport
      page = await browser.newPage({
        viewport: this.config.viewport
      });

      // Set page timeout
      page.setDefaultTimeout(this.config.timeout);

      // Navigate to target URL
      await page.goto(this.config.targetUrl, {
        waitUntil: this.config.waitUntil,
        timeout: this.config.timeout
      });

      // Take screenshot
      const screenshotPath = path.join(
        this.config.outputDir,
        `reliability-test-run-${runNumber}-${Date.now()}.${this.config.screenshotType}`
      );

      await page.screenshot({
        path: screenshotPath,
        type: this.config.screenshotType,
        fullPage: true
      });

      // Verify screenshot was created and has content
      if (fs.existsSync(screenshotPath)) {
        const stats = fs.statSync(screenshotPath);
        if (stats.size > 0) {
          result.success = true;
          result.screenshotPath = screenshotPath;
        } else {
          throw new Error('Screenshot file created but is empty');
        }
      } else {
        throw new Error('Screenshot file was not created');
      }

    } catch (error) {
      result.success = false;
      result.error = error.message;
    } finally {
      // Clean up
      if (page) {
        try {
          await page.close();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      if (browser) {
        try {
          await browser.close();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      
      result.duration = Date.now() - startTime;
    }

    return result;
  }

  /**
   * Runs the complete reliability test suite
   * @returns {Promise<Object>} Complete test results with analysis
   */
  async runReliabilityTest() {
    const startTime = Date.now();
    const results = [];
    let successful = 0;
    let failed = 0;

    console.log(`\n🧪 Starting Playwright Reliability Test`);
    console.log(`Runs: ${this.config.runCount}`);
    console.log(`Target URL: ${this.config.targetUrl}`);
    console.log(`Output Directory: ${this.config.outputDir}`);
    console.log(`Timeout: ${this.config.timeout}ms\n`);

    // Run all tests sequentially to avoid resource conflicts
    for (let i = 1; i <= this.config.runCount; i++) {
      console.log(`🔄 Running test ${i}/${this.config.runCount}...`);
      
      const result = await this.runSingleTest(i);
      results.push(result);

      if (result.success) {
        successful++;
        console.log(`✅ Run ${i}: SUCCESS (${result.duration}ms)`);
      } else {
        failed++;
        console.log(`❌ Run ${i}: FAILED (${result.duration}ms) - ${result.error}`);
      }
    }

    const totalDuration = Date.now() - startTime;
    const successRate = Math.round((successful / this.config.runCount) * 100);

    const summary = {
      totalRuns: this.config.runCount,
      successful,
      failed,
      successRate,
      totalDuration,
      averageDuration: Math.round(totalDuration / this.config.runCount),
      results,
      timestamp: new Date().toISOString()
    };

    console.log(`\n📊 Test Results Summary:`);
    console.log(`Total Runs: ${summary.totalRuns}`);
    console.log(`Successful: ${summary.successful}`);
    console.log(`Failed: ${summary.failed}`);
    console.log(`Success Rate: ${summary.successRate}%`);
    console.log(`Total Duration: ${summary.totalDuration}ms`);
    console.log(`Average Duration: ${summary.averageDuration}ms`);

    return summary;
  }

  /**
   * Analyzes test results for failure patterns
   * @param {Object} results - Test results from runReliabilityTest()
   * @returns {Object} Analysis object with failure patterns and recommendations
   */
  analyzeResults(results) {
    const failureTypes = {};
    const failedResults = results.results.filter(r => !r.success);

    // Categorize failures
    failedResults.forEach(result => {
      const errorType = this._categorizeError(result.error);
      failureTypes[errorType] = (failureTypes[errorType] || 0) + 1;
    });

    // Generate recommendations based on analysis
    const recommendations = this._generateRecommendations(results, failureTypes);

    return {
      totalFailures: failedResults.length,
      failureTypes,
      failureRate: Math.round((failedResults.length / results.totalRuns) * 100),
      averageSuccessfulDuration: this._calculateAverageSuccessfulDuration(results),
      recommendations
    };
  }

  /**
   * Categorizes error types for analysis
   * @private
   */
  _categorizeError(error) {
    if (!error) return 'unknown';
    
    const errorLower = error.toLowerCase();
    
    if (errorLower.includes('timeout')) return 'timeout';
    if (errorLower.includes('network') || errorLower.includes('net::')) return 'network';
    if (errorLower.includes('navigation') || errorLower.includes('navigate')) return 'navigation';
    if (errorLower.includes('screenshot')) return 'screenshot';
    if (errorLower.includes('browser')) return 'browser';
    if (errorLower.includes('page')) return 'page';
    
    return 'other';
  }

  /**
   * Calculates average duration for successful runs
   * @private
   */
  _calculateAverageSuccessfulDuration(results) {
    const successfulResults = results.results.filter(r => r.success);
    if (successfulResults.length === 0) return 0;
    
    const totalDuration = successfulResults.reduce((sum, r) => sum + r.duration, 0);
    return Math.round(totalDuration / successfulResults.length);
  }

  /**
   * Generates recommendations based on test results
   * @private
   */
  _generateRecommendations(results, failureTypes) {
    const recommendations = [];

    // Success rate recommendations
    if (results.successRate < 90) {
      recommendations.push('❗ CRITICAL: Success rate below 90%. Not recommended for production use.');
    } else if (results.successRate < 95) {
      recommendations.push('⚠️ WARNING: Success rate below 95%. Consider investigating failure patterns.');
    } else if (results.successRate === 100) {
      recommendations.push('✅ EXCELLENT: 100% success rate. Ready for production deployment.');
    } else {
      recommendations.push('✅ GOOD: Success rate above 95%. Suitable for production use.');
    }

    // Failure type specific recommendations
    if (failureTypes.timeout > 0) {
      recommendations.push('🕒 Consider increasing timeout values or optimizing target page load times.');
    }
    
    if (failureTypes.network > 0) {
      recommendations.push('🌐 Network issues detected. Consider implementing retry logic or checking network stability.');
    }
    
    if (failureTypes.browser > 0) {
      recommendations.push('🌐 Browser issues detected. Consider updating Playwright version or browser binaries.');
    }

    // Performance recommendations
    const avgDuration = results.averageDuration;
    if (avgDuration > 10000) {
      recommendations.push('⚡ Average duration > 10s. Consider optimizing for faster execution.');
    } else if (avgDuration > 5000) {
      recommendations.push('⚡ Average duration > 5s. Performance could be improved.');
    } else {
      recommendations.push('⚡ Good performance: Average duration under 5s.');
    }

    return recommendations;
  }

  /**
   * Validates if results meet production readiness criteria
   * @param {Object} results - Test results from runReliabilityTest()
   * @returns {Object} Production readiness assessment
   */
  validateProductionReadiness(results) {
    const criticalIssues = [];
    const analysis = this.analyzeResults(results);

    // Critical criteria for production readiness
    if (results.successRate < 95) {
      criticalIssues.push(`Success rate ${results.successRate}% below minimum 95% requirement`);
    }

    if (analysis.totalFailures > Math.ceil(results.totalRuns * 0.05)) {
      criticalIssues.push(`Too many failures: ${analysis.totalFailures}/${results.totalRuns}`);
    }

    if (analysis.failureTypes.timeout > 2) {
      criticalIssues.push(`Excessive timeout failures: ${analysis.failureTypes.timeout}`);
    }

    const isReady = criticalIssues.length === 0 && results.successRate >= 95;

    return {
      isReady,
      criticalIssues,
      successRate: results.successRate,
      recommendations: analysis.recommendations,
      readinessScore: Math.max(0, 100 - (criticalIssues.length * 25))
    };
  }

  /**
   * Generates a comprehensive report
   * @param {Object} results - Test results from runReliabilityTest()
   * @returns {string} Formatted report
   */
  generateReport(results) {
    const analysis = this.analyzeResults(results);
    const readiness = this.validateProductionReadiness(results);

    const report = `
╔════════════════════════════════════════════════════════════════════════╗
║                    PLAYWRIGHT RELIABILITY TEST REPORT                 ║
╠════════════════════════════════════════════════════════════════════════╣
║ Test Configuration:                                                    ║
║   Target URL: ${this.config.targetUrl.padEnd(58)} ║
║   Run Count: ${String(this.config.runCount).padEnd(59)} ║
║   Timeout: ${String(this.config.timeout + 'ms').padEnd(61)} ║
║   Browser: ${this.config.browser.padEnd(61)} ║
╠════════════════════════════════════════════════════════════════════════╣
║ Results Summary:                                                       ║
║   Total Runs: ${String(results.totalRuns).padEnd(58)} ║
║   Successful: ${String(results.successful).padEnd(58)} ║
║   Failed: ${String(results.failed).padEnd(62)} ║
║   Success Rate: ${String(results.successRate + '%').padEnd(56)} ║
║   Total Duration: ${String(results.totalDuration + 'ms').padEnd(54)} ║
║   Average Duration: ${String(results.averageDuration + 'ms').padEnd(52)} ║
╠════════════════════════════════════════════════════════════════════════╣
║ Production Readiness:                                                  ║
║   Ready for Production: ${String(readiness.isReady ? 'YES ✅' : 'NO ❌').padEnd(50)} ║
║   Readiness Score: ${String(readiness.readinessScore + '%').padEnd(55)} ║
║   Critical Issues: ${String(readiness.criticalIssues.length).padEnd(55)} ║
╠════════════════════════════════════════════════════════════════════════╣
║ RECOMMENDATIONS:                                                       ║
${analysis.recommendations.map(rec => `║ • ${rec.padEnd(69)} ║`).join('\n')}
╠════════════════════════════════════════════════════════════════════════╣
║ Failure Analysis:                                                      ║
${Object.entries(analysis.failureTypes).length > 0 ? 
  Object.entries(analysis.failureTypes).map(([type, count]) => 
    `║   ${type}: ${count} occurrences`.padEnd(71) + '║'
  ).join('\n') : 
  '║   No failures detected ✅'.padEnd(71) + '║'
}
╚════════════════════════════════════════════════════════════════════════╝

Timestamp: ${results.timestamp}
Generated by: PlaywrightReliabilityTester v1.0.0
`;

    return report;
  }
}

module.exports = { PlaywrightReliabilityTester };