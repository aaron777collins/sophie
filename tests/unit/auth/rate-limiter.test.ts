import { AuthRateLimiter, getClientIP, createRateLimitResponse } from "../../../lib/auth/rate-limiter";

describe("AuthRateLimiter", () => {
  let rateLimiter: AuthRateLimiter;

  beforeEach(() => {
    rateLimiter = new AuthRateLimiter();
  });

  describe("checkRateLimit", () => {
    it("should allow requests within limit", () => {
      const identifier = "192.168.1.1:user1";
      
      // Record 3 failed attempts
      rateLimiter.recordFailedAttempt(identifier);
      rateLimiter.recordFailedAttempt(identifier);
      rateLimiter.recordFailedAttempt(identifier);

      const result = rateLimiter.checkRateLimit(identifier);

      expect(result.allowed).toBe(true);
      expect(result.attemptsRemaining).toBe(2);
      expect(result.totalAttempts).toBe(3);
    });

    it("should block requests when limit exceeded", () => {
      const identifier = "192.168.1.1:user1";
      
      // Record 5 failed attempts (default limit)
      for (let i = 0; i < 5; i++) {
        rateLimiter.recordFailedAttempt(identifier);
      }

      const result = rateLimiter.checkRateLimit(identifier);

      expect(result.allowed).toBe(false);
      expect(result.attemptsRemaining).toBe(0);
      expect(result.totalAttempts).toBe(5);
      expect(result.timeUntilReset).toBeGreaterThan(0);
    });

    it("should respect custom configuration", () => {
      const identifier = "192.168.1.1:user1";
      
      // Record 2 failed attempts with custom limit of 2
      rateLimiter.recordFailedAttempt(identifier);
      rateLimiter.recordFailedAttempt(identifier);

      const result = rateLimiter.checkRateLimit(identifier, {
        maxAttempts: 2,
        windowSeconds: 60,
      });

      expect(result.allowed).toBe(false);
      expect(result.attemptsRemaining).toBe(0);
    });

    it("should only count failed attempts for rate limiting", () => {
      const identifier = "192.168.1.1:user1";
      
      // Record mix of failed and successful attempts
      rateLimiter.recordFailedAttempt(identifier);
      rateLimiter.recordSuccessfulAttempt(identifier); // This should clear failed attempts
      rateLimiter.recordFailedAttempt(identifier);

      const result = rateLimiter.checkRateLimit(identifier);

      expect(result.allowed).toBe(true);
      expect(result.attemptsRemaining).toBe(4); // Only 1 failed attempt should be counted
    });
  });

  describe("recordFailedAttempt", () => {
    it("should record failed attempts", () => {
      const identifier = "192.168.1.1:user1";
      
      rateLimiter.recordFailedAttempt(identifier);
      rateLimiter.recordFailedAttempt(identifier);

      const stats = rateLimiter.getAttemptStats(identifier);
      expect(stats.failedAttempts).toBe(2);
      expect(stats.successfulAttempts).toBe(0);
    });
  });

  describe("recordSuccessfulAttempt", () => {
    it("should clear failed attempts on successful login", () => {
      const identifier = "192.168.1.1:user1";
      
      // Record failed attempts
      rateLimiter.recordFailedAttempt(identifier);
      rateLimiter.recordFailedAttempt(identifier);
      rateLimiter.recordFailedAttempt(identifier);

      // Verify they are recorded
      let stats = rateLimiter.getAttemptStats(identifier);
      expect(stats.failedAttempts).toBe(3);

      // Record successful attempt
      rateLimiter.recordSuccessfulAttempt(identifier);

      // Verify failed attempts are cleared
      stats = rateLimiter.getAttemptStats(identifier);
      expect(stats.failedAttempts).toBe(0);
      expect(stats.successfulAttempts).toBe(1);

      // Verify rate limit is reset
      const result = rateLimiter.checkRateLimit(identifier);
      expect(result.allowed).toBe(true);
      expect(result.attemptsRemaining).toBe(5);
    });
  });

  describe("clearAttempts", () => {
    it("should clear all attempts for identifier", () => {
      const identifier = "192.168.1.1:user1";
      
      rateLimiter.recordFailedAttempt(identifier);
      rateLimiter.recordFailedAttempt(identifier);

      rateLimiter.clearAttempts(identifier);

      const stats = rateLimiter.getAttemptStats(identifier);
      expect(stats.totalAttempts).toBe(0);
    });
  });

  describe("cleanup", () => {
    it("should remove old attempts", () => {
      const identifier = "192.168.1.1:user1";
      
      // Mock Date.now to simulate old attempts
      const originalNow = Date.now;
      const now = Date.now();
      Date.now = jest.fn(() => now - 25 * 60 * 60 * 1000); // 25 hours ago

      rateLimiter.recordFailedAttempt(identifier);

      // Restore Date.now
      Date.now = originalNow;

      rateLimiter.cleanup();

      const stats = rateLimiter.getAttemptStats(identifier);
      expect(stats.totalAttempts).toBe(0);
    });
  });

  describe("sliding window behavior", () => {
    it("should remove attempts outside the time window", () => {
      const identifier = "192.168.1.1:user1";
      const originalNow = Date.now;
      let currentTime = Date.now();

      // Mock Date.now
      Date.now = jest.fn(() => currentTime);

      // Record 3 failed attempts
      rateLimiter.recordFailedAttempt(identifier);
      rateLimiter.recordFailedAttempt(identifier);
      rateLimiter.recordFailedAttempt(identifier);

      // Move time forward by 70 seconds (past the 60-second window)
      currentTime += 70 * 1000;

      // Check rate limit - old attempts should be expired
      const result = rateLimiter.checkRateLimit(identifier);

      expect(result.allowed).toBe(true);
      expect(result.attemptsRemaining).toBe(5);

      // Restore Date.now
      Date.now = originalNow;
    });
  });
});

describe("getClientIP", () => {
  it("should extract IP from x-forwarded-for header", () => {
    const headers = new Headers();
    headers.set("x-forwarded-for", "192.168.1.1, 10.0.0.1");

    const ip = getClientIP(headers);
    expect(ip).toBe("192.168.1.1");
  });

  it("should extract IP from x-real-ip header", () => {
    const headers = new Headers();
    headers.set("x-real-ip", "192.168.1.2");

    const ip = getClientIP(headers);
    expect(ip).toBe("192.168.1.2");
  });

  it("should extract IP from cf-connecting-ip header", () => {
    const headers = new Headers();
    headers.set("cf-connecting-ip", "192.168.1.3");

    const ip = getClientIP(headers);
    expect(ip).toBe("192.168.1.3");
  });

  it("should return 'unknown' when no IP headers are present", () => {
    const headers = new Headers();

    const ip = getClientIP(headers);
    expect(ip).toBe("unknown");
  });

  it("should prioritize x-forwarded-for over other headers", () => {
    const headers = new Headers();
    headers.set("x-forwarded-for", "192.168.1.1");
    headers.set("x-real-ip", "192.168.1.2");
    headers.set("cf-connecting-ip", "192.168.1.3");

    const ip = getClientIP(headers);
    expect(ip).toBe("192.168.1.1");
  });
});

describe("createRateLimitResponse", () => {
  it("should create proper 429 response", () => {
    const rateLimitResult = {
      allowed: false,
      attemptsRemaining: 0,
      timeUntilReset: 45,
      totalAttempts: 5,
    };

    const response = createRateLimitResponse(rateLimitResult);

    expect(response.status).toBe(429);
    expect(response.headers.get("Content-Type")).toBe("application/json");
    expect(response.headers.get("Retry-After")).toBe("45");
    expect(response.headers.get("X-RateLimit-Limit")).toBe("5");
    expect(response.headers.get("X-RateLimit-Remaining")).toBe("0");
  });

  it("should include correct response body", async () => {
    const rateLimitResult = {
      allowed: false,
      attemptsRemaining: 0,
      timeUntilReset: 30,
      totalAttempts: 5,
    };

    const response = createRateLimitResponse(rateLimitResult);
    const body = await response.json();

    expect(body).toEqual({
      error: "RateLimitExceeded",
      message: "Too many login attempts. Please wait before trying again.",
      timeUntilReset: 30,
      attemptsRemaining: 0,
    });
  });
});