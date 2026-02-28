/**
 * Playwright Screenshot Reliability Tests
 * Tests the reliability of Playwright screenshot functionality
 * Following TDD approach: RED → GREEN → REFACTOR
 */

const fs = require('fs');
const path = require('path');
const { PlaywrightReliabilityTester } = require('./reliability-test');

describe('Playwright Screenshot Reliability Testing', () => {
  let tester;
  const testOutputDir = '/tmp/playwright-reliability-test';

  beforeAll(() => {
    // Ensure output directory exists
    if (!fs.existsSync(testOutputDir)) {
      fs.mkdirSync(testOutputDir, { recursive: true });
    }
  });

  afterAll(() => {
    // Clean up test artifacts
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true, force: true });
    }
  });

  beforeEach(() => {
    tester = new PlaywrightReliabilityTester({
      runCount: 5, // Reduced for testing
      targetUrl: 'https://example.com',
      outputDir: testOutputDir,
      timeout: 30000
    });
  });

  describe('PlaywrightReliabilityTester Class', () => {
    test('should be defined and instantiable', () => {
      expect(PlaywrightReliabilityTester).toBeDefined();
      expect(tester).toBeInstanceOf(PlaywrightReliabilityTester);
    });

    test('should have required configuration properties', () => {
      expect(tester.config.runCount).toBe(5);
      expect(tester.config.targetUrl).toBe('https://example.com');
      expect(tester.config.outputDir).toBe(testOutputDir);
      expect(tester.config.timeout).toBe(30000);
    });

    test('should initialize with default configuration when none provided', () => {
      const defaultTester = new PlaywrightReliabilityTester();
      expect(defaultTester.config.runCount).toBe(10);
      expect(defaultTester.config.targetUrl).toBe('https://example.com');
      expect(defaultTester.config.timeout).toBeDefined();
    });
  });

  describe('Individual Screenshot Tests', () => {
    test('should successfully take a single screenshot', async () => {
      const result = await tester.runSingleTest(1);
      
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.runNumber).toBe(1);
      expect(result.screenshotPath).toBeDefined();
      expect(result.duration).toBeGreaterThan(0);
      expect(result.error).toBeNull();
      
      // Verify screenshot file was created
      expect(fs.existsSync(result.screenshotPath)).toBe(true);
    });

    test('should handle timeouts gracefully', async () => {
      const timeoutTester = new PlaywrightReliabilityTester({
        runCount: 1,
        targetUrl: 'https://httpstat.us/200?sleep=35000', // 35s delay
        timeout: 5000 // 5s timeout
      });

      const result = await timeoutTester.runSingleTest(1);
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('timeout');
    });

    test('should handle invalid URLs gracefully', async () => {
      const invalidTester = new PlaywrightReliabilityTester({
        runCount: 1,
        targetUrl: 'https://this-domain-should-not-exist-12345.invalid'
      });

      const result = await invalidTester.runSingleTest(1);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('Reliability Test Suite', () => {
    test('should run multiple screenshot tests and collect results', async () => {
      const results = await tester.runReliabilityTest();
      
      expect(results).toBeDefined();
      expect(results.totalRuns).toBe(5);
      expect(results.successful).toBeGreaterThan(0);
      expect(results.failed).toBeGreaterThanOrEqual(0);
      expect(results.successRate).toBeGreaterThan(0);
      expect(results.successRate).toBeLessThanOrEqual(100);
      expect(results.results).toHaveLength(5);
      expect(results.summary).toBeDefined();
    });

    test('should achieve target reliability (80% minimum for test)', async () => {
      const results = await tester.runReliabilityTest();
      
      // For production, we want 100%, but for tests we'll accept 80%
      expect(results.successRate).toBeGreaterThanOrEqual(80);
    });

    test('should generate proper result structure for each run', async () => {
      const results = await tester.runReliabilityTest();
      
      results.results.forEach((result, index) => {
        expect(result).toMatchObject({
          runNumber: index + 1,
          success: expect.any(Boolean),
          duration: expect.any(Number),
          screenshotPath: result.success ? expect.any(String) : null,
          error: result.success ? null : expect.any(String)
        });
      });
    });
  });

  describe('Result Analysis', () => {
    test('should analyze failure patterns', async () => {
      // Run a test that will likely have some failures 
      const mixedTester = new PlaywrightReliabilityTester({
        runCount: 3,
        targetUrl: 'https://example.com',
        timeout: 10000
      });

      const results = await mixedTester.runReliabilityTest();
      const analysis = mixedTester.analyzeResults(results);
      
      expect(analysis).toBeDefined();
      expect(analysis.failureTypes).toBeDefined();
      expect(analysis.recommendations).toBeDefined();
      expect(Array.isArray(analysis.recommendations)).toBe(true);
    });

    test('should generate comprehensive summary report', async () => {
      const results = await tester.runReliabilityTest();
      const report = tester.generateReport(results);
      
      expect(report).toBeDefined();
      expect(report).toContain('PLAYWRIGHT RELIABILITY TEST REPORT');
      expect(report).toContain('Total Runs:');
      expect(report).toContain('Success Rate:');
      expect(report).toContain('RECOMMENDATIONS');
    });
  });

  describe('Production Readiness Validation', () => {
    test('should validate production readiness criteria', async () => {
      const results = await tester.runReliabilityTest();
      const validation = tester.validateProductionReadiness(results);
      
      expect(validation).toBeDefined();
      expect(validation.isReady).toBeDefined();
      expect(validation.criticalIssues).toBeDefined();
      expect(validation.recommendations).toBeDefined();
    });
  });
});