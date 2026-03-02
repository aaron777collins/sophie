/**
 * Rate Limiter for Authentication Endpoints
 * 
 * Implements sliding window rate limiting to prevent brute force attacks.
 * Tracks failed login attempts per IP address with configurable limits.
 */

export interface RateLimitConfig {
  /** Maximum number of attempts allowed within the window */
  maxAttempts: number;
  /** Time window in seconds */
  windowSeconds: number;
  /** Optional custom identifier (defaults to IP) */
  identifier?: string;
}

export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean;
  /** Number of attempts remaining (0 if blocked) */
  attemptsRemaining: number;
  /** Time in seconds until the limit resets */
  timeUntilReset: number;
  /** Total attempts made in current window */
  totalAttempts: number;
}

export interface AttemptRecord {
  /** Timestamp of the attempt */
  timestamp: number;
  /** Whether the attempt was successful */
  successful: boolean;
}

/**
 * In-memory rate limiter using sliding window algorithm
 */
export class AuthRateLimiter {
  private attempts: Map<string, AttemptRecord[]> = new Map();
  private readonly defaultConfig: RateLimitConfig = {
    maxAttempts: 5,
    windowSeconds: 60, // 1 minute
  };

  /**
   * Check if a request should be rate limited
   */
  checkRateLimit(
    identifier: string,
    config: Partial<RateLimitConfig> = {}
  ): RateLimitResult {
    const fullConfig = { ...this.defaultConfig, ...config };
    const now = Date.now();
    const windowStart = now - (fullConfig.windowSeconds * 1000);

    // Get existing attempts for this identifier
    const userAttempts = this.attempts.get(identifier) || [];

    // Remove attempts outside the current window
    const recentAttempts = userAttempts.filter(
      attempt => attempt.timestamp >= windowStart
    );

    // Update the stored attempts
    this.attempts.set(identifier, recentAttempts);

    // Count only failed attempts for rate limiting
    const failedAttempts = recentAttempts.filter(attempt => !attempt.successful);
    const failedCount = failedAttempts.length;

    // Check if limit is exceeded
    const allowed = failedCount < fullConfig.maxAttempts;
    const attemptsRemaining = Math.max(0, fullConfig.maxAttempts - failedCount);

    // Calculate time until reset (time until oldest failed attempt expires)
    let timeUntilReset = 0;
    if (failedAttempts.length > 0) {
      const oldestFailedAttempt = Math.min(...failedAttempts.map(a => a.timestamp));
      timeUntilReset = Math.max(0, Math.ceil((oldestFailedAttempt + (fullConfig.windowSeconds * 1000) - now) / 1000));
    }

    return {
      allowed,
      attemptsRemaining,
      timeUntilReset,
      totalAttempts: recentAttempts.length,
    };
  }

  /**
   * Record a failed authentication attempt
   */
  recordFailedAttempt(identifier: string): void {
    const now = Date.now();
    const userAttempts = this.attempts.get(identifier) || [];
    
    userAttempts.push({
      timestamp: now,
      successful: false,
    });

    this.attempts.set(identifier, userAttempts);
  }

  /**
   * Record a successful authentication attempt and clear failed attempts
   */
  recordSuccessfulAttempt(identifier: string): void {
    const now = Date.now();
    
    // Clear all failed attempts for this identifier on successful login
    this.attempts.set(identifier, [{
      timestamp: now,
      successful: true,
    }]);
  }

  /**
   * Clear all attempts for an identifier
   */
  clearAttempts(identifier: string): void {
    this.attempts.delete(identifier);
  }

  /**
   * Get current attempt statistics for debugging
   */
  getAttemptStats(identifier: string): {
    totalAttempts: number;
    failedAttempts: number;
    successfulAttempts: number;
    oldestAttempt: number | null;
  } {
    const userAttempts = this.attempts.get(identifier) || [];
    const failedAttempts = userAttempts.filter(a => !a.successful);
    const successfulAttempts = userAttempts.filter(a => a.successful);
    const oldestAttempt = userAttempts.length > 0 
      ? Math.min(...userAttempts.map(a => a.timestamp))
      : null;

    return {
      totalAttempts: userAttempts.length,
      failedAttempts: failedAttempts.length,
      successfulAttempts: successfulAttempts.length,
      oldestAttempt,
    };
  }

  /**
   * Cleanup old attempts (called periodically to prevent memory leaks)
   */
  cleanup(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const [identifier, attempts] of this.attempts) {
      const recentAttempts = attempts.filter(
        attempt => (now - attempt.timestamp) < maxAge
      );

      if (recentAttempts.length === 0) {
        this.attempts.delete(identifier);
      } else {
        this.attempts.set(identifier, recentAttempts);
      }
    }
  }
}

// Global instance
export const authRateLimiter = new AuthRateLimiter();

/**
 * Utility to get client IP address from various headers
 */
export function getClientIP(headers: Headers): string {
  // Check various headers for the real IP
  const xForwardedFor = headers.get('x-forwarded-for');
  const xRealIP = headers.get('x-real-ip');
  const cfConnectingIP = headers.get('cf-connecting-ip');

  if (xForwardedFor) {
    // X-Forwarded-For can contain multiple IPs, take the first one
    return xForwardedFor.split(',')[0].trim();
  }

  if (xRealIP) {
    return xRealIP.trim();
  }

  if (cfConnectingIP) {
    return cfConnectingIP.trim();
  }

  // Fallback - this might not be accurate in production behind proxies
  return 'unknown';
}

/**
 * Create a standardized 429 response for rate limiting
 */
export function createRateLimitResponse(rateLimitResult: RateLimitResult): Response {
  return new Response(
    JSON.stringify({
      error: 'RateLimitExceeded',
      message: 'Too many login attempts. Please wait before trying again.',
      timeUntilReset: rateLimitResult.timeUntilReset,
      attemptsRemaining: 0,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': rateLimitResult.timeUntilReset.toString(),
        'X-RateLimit-Limit': '5',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': (Date.now() + (rateLimitResult.timeUntilReset * 1000)).toString(),
      },
    }
  );
}