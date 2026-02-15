// Rate Limiter Utility for Slowmode
export class SlowmodeRateLimiter {
  private lastMessageTime: { [userId: string]: number } = {};

  /**
   * Check if user can send a message based on slowmode settings
   * @param userId User's unique identifier
   * @param slowmodeDuration Slowmode duration in seconds
   * @returns { canSend: boolean, timeRemaining?: number }
   */
  checkRateLimit(userId: string, slowmodeDuration: number): { canSend: boolean, timeRemaining?: number } {
    if (slowmodeDuration <= 0) {
      return { canSend: true };
    }

    const now = Date.now();
    const lastMessageTime = this.lastMessageTime[userId] || 0;
    const timeSinceLastMessage = now - lastMessageTime;
    const remainingCooldown = slowmodeDuration * 1000 - timeSinceLastMessage;

    if (timeSinceLastMessage >= slowmodeDuration * 1000) {
      this.lastMessageTime[userId] = now;
      return { canSend: true };
    }

    return { 
      canSend: false, 
      timeRemaining: Math.ceil(remainingCooldown / 1000)
    };
  }
}