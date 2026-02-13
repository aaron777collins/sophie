import { MatrixClient } from 'matrix-js-sdk';

export class TypingService {
  private client: MatrixClient;
  private lastTypingEventTime: number = 0;
  private typingTimeout: NodeJS.Timeout | null = null;
  private TYPING_TIMEOUT_MS: number = 5000; // 5 seconds
  private RATE_LIMIT_MS: number = 5000; // 1 typing event per 5 seconds

  constructor(client: MatrixClient) {
    this.client = client;
  }

  /**
   * Send typing start event for a specific room
   * @param roomId The ID of the room
   */
  public startTyping(roomId: string): void {
    const currentTime = Date.now();

    // Prevent flooding by rate limiting typing events
    if (currentTime - this.lastTypingEventTime < this.RATE_LIMIT_MS) {
      return;
    }

    // Clear any existing timeout to prevent multiple calls
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }

    // Send typing start event
    this.client.sendTyping(roomId, true, this.TYPING_TIMEOUT_MS);
    this.lastTypingEventTime = currentTime;

    // Set a timeout to send typing stop after inactivity
    this.typingTimeout = setTimeout(() => {
      this.stopTyping(roomId);
    }, this.TYPING_TIMEOUT_MS);
  }

  /**
   * Send typing stop event for a specific room
   * @param roomId The ID of the room
   */
  public stopTyping(roomId: string): void {
    // Prevent flooding by rate limiting typing events
    const currentTime = Date.now();
    if (currentTime - this.lastTypingEventTime < this.RATE_LIMIT_MS) {
      return;
    }

    // Cancel any existing timeout
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
      this.typingTimeout = null;
    }

    // Send typing stop event
    this.client.sendTyping(roomId, false);
    this.lastTypingEventTime = currentTime;
  }
}