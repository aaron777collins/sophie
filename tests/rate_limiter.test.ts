import { SlowmodeRateLimiter } from '../src/utils/rate_limiter';

describe('SlowmodeRateLimiter', () => {
  let rateLimiter: SlowmodeRateLimiter;
  const userId = 'test-user-1';

  beforeEach(() => {
    rateLimiter = new SlowmodeRateLimiter();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should allow message when slowmode is disabled', () => {
    const result = rateLimiter.checkRateLimit(userId, 0);
    expect(result.canSend).toBe(true);
  });

  it('should allow first message when slowmode is enabled', () => {
    const result = rateLimiter.checkRateLimit(userId, 10);
    expect(result.canSend).toBe(true);
  });

  it('should prevent message within cooldown period', () => {
    rateLimiter.checkRateLimit(userId, 10);
    jest.advanceTimersByTime(5000); // 5 seconds passed

    const result = rateLimiter.checkRateLimit(userId, 10);
    expect(result.canSend).toBe(false);
    expect(result.timeRemaining).toBe(5);
  });

  it('should allow message after cooldown period', () => {
    rateLimiter.checkRateLimit(userId, 10);
    jest.advanceTimersByTime(11000); // 11 seconds passed

    const result = rateLimiter.checkRateLimit(userId, 10);
    expect(result.canSend).toBe(true);
  });
});