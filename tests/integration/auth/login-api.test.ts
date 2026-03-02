/**
 * Integration tests for the login API with rate limiting
 */

import { authRateLimiter } from "../../../lib/auth/rate-limiter";

// Mock console to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
};

// Mock NextResponse
const mockNextResponse = {
  json: (body: any, init?: any) => ({
    status: init?.status || 200,
    json: async () => body,
    headers: new Map(),
  }),
};

// Mock the API route functions
jest.mock("next/server", () => ({
  NextResponse: mockNextResponse,
}));

describe("/api/auth/login", () => {
  beforeEach(() => {
    // Clear rate limiter state between tests
    authRateLimiter.clearAttempts("test-ip:demo");
    authRateLimiter.clearAttempts("test-ip:admin");
    authRateLimiter.clearAttempts("test-ip:invalid");
  });

  describe("Rate Limiting Logic", () => {

    it("should block login after 5 failed attempts", () => {
      const identifier = "test-ip:demo";

      // Make 5 failed attempts
      for (let i = 0; i < 5; i++) {
        authRateLimiter.recordFailedAttempt(identifier);
      }

      const result = authRateLimiter.checkRateLimit(identifier);
      expect(result.allowed).toBe(false);
      expect(result.attemptsRemaining).toBe(0);
      expect(result.timeUntilReset).toBeGreaterThan(0);
    });

    it("should allow successful attempts without counting against limit", () => {
      const identifier = "test-ip:demo";

      // Make 4 failed attempts
      for (let i = 0; i < 4; i++) {
        authRateLimiter.recordFailedAttempt(identifier);
      }

      // Successful attempt should reset counter
      authRateLimiter.recordSuccessfulAttempt(identifier);

      const result = authRateLimiter.checkRateLimit(identifier);
      expect(result.allowed).toBe(true);
      expect(result.attemptsRemaining).toBe(5); // Full limit available again
    });

    it("should isolate rate limiting by IP and username combination", () => {
      const user1IP1 = "ip1:demo";
      const user2IP1 = "ip1:admin";
      const user1IP2 = "ip2:demo";

      // Max out attempts for user1 from IP1
      for (let i = 0; i < 5; i++) {
        authRateLimiter.recordFailedAttempt(user1IP1);
      }

      // User1 from IP1 should be blocked
      let result = authRateLimiter.checkRateLimit(user1IP1);
      expect(result.allowed).toBe(false);

      // User2 from IP1 should NOT be blocked
      result = authRateLimiter.checkRateLimit(user2IP1);
      expect(result.allowed).toBe(true);

      // User1 from IP2 should NOT be blocked
      result = authRateLimiter.checkRateLimit(user1IP2);
      expect(result.allowed).toBe(true);
    });

    it("should handle sliding time window correctly", () => {
      const identifier = "test-ip:demo";
      const originalNow = Date.now;
      let currentTime = Date.now();

      // Mock Date.now
      Date.now = jest.fn(() => currentTime);

      // Make 3 failed attempts
      for (let i = 0; i < 3; i++) {
        authRateLimiter.recordFailedAttempt(identifier);
      }

      // Should still be allowed (3 < 5)
      let result = authRateLimiter.checkRateLimit(identifier);
      expect(result.allowed).toBe(true);
      expect(result.attemptsRemaining).toBe(2);

      // Move time forward by 70 seconds (past 60-second window)
      currentTime += 70 * 1000;

      // Old attempts should be expired, should be allowed again
      result = authRateLimiter.checkRateLimit(identifier);
      expect(result.allowed).toBe(true);
      expect(result.attemptsRemaining).toBe(5);

      // Restore Date.now
      Date.now = originalNow;
    });

    it("should provide accurate time until reset", () => {
      const identifier = "test-ip:demo";
      const originalNow = Date.now;
      let currentTime = Date.now();

      // Mock Date.now
      Date.now = jest.fn(() => currentTime);

      // Make 5 failed attempts to trigger rate limiting
      for (let i = 0; i < 5; i++) {
        authRateLimiter.recordFailedAttempt(identifier);
      }

      const result = authRateLimiter.checkRateLimit(identifier);
      expect(result.allowed).toBe(false);
      
      // Time until reset should be approximately 60 seconds (1 minute window)
      expect(result.timeUntilReset).toBeGreaterThan(55);
      expect(result.timeUntilReset).toBeLessThanOrEqual(60);

      // Restore Date.now
      Date.now = originalNow;
    });

    it("should track different types of authentication attempts", () => {
      const identifier = "test-ip:demo";

      // Record mixed successful and failed attempts
      authRateLimiter.recordFailedAttempt(identifier);
      authRateLimiter.recordFailedAttempt(identifier);
      authRateLimiter.recordSuccessfulAttempt(identifier); // Should clear failed attempts
      authRateLimiter.recordFailedAttempt(identifier);

      const stats = authRateLimiter.getAttemptStats(identifier);
      
      // Should only have 1 failed attempt after successful login cleared the previous ones
      expect(stats.failedAttempts).toBe(1);
      expect(stats.successfulAttempts).toBe(1);
      expect(stats.totalAttempts).toBe(2); // 1 successful + 1 failed (after reset)

      const result = authRateLimiter.checkRateLimit(identifier);
      expect(result.allowed).toBe(true);
      expect(result.attemptsRemaining).toBe(4); // 5 - 1 failed attempt
    });
  });
});