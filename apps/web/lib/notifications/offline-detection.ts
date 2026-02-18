/**
 * Offline user detection service for HAOS
 * Detects when users have been offline for a specified duration
 */

import { MatrixClient, User } from 'matrix-js-sdk';
import { NotificationService } from '@/lib/types/notification';

export interface OfflineUserInfo {
  userId: string;
  displayName?: string;
  avatarUrl?: string;
  lastSeenTimestamp: number;
  offlineDurationMs: number;
  unreadMessageCount: number;
  unreadMentions: number;
  unreadDirectMessages: number;
}

export interface OfflineDetectionConfig {
  /** Minimum offline duration before sending email (ms) */
  offlineThresholdMs: number;
  /** Maximum frequency for sending offline emails per user (ms) */
  rateLimitMs: number;
  /** Whether to include message previews in emails */
  includeMessagePreviews: boolean;
  /** Maximum number of message previews to include */
  maxMessagePreviews: number;
}

export class OfflineUserDetectionService {
  private matrixClient?: MatrixClient;
  private lastEmailSentMap = new Map<string, number>();
  
  constructor(
    private config: OfflineDetectionConfig,
    private notificationService?: NotificationService
  ) {}

  /**
   * Initialize the service with a Matrix client
   */
  initialize(matrixClient: MatrixClient): void {
    this.matrixClient = matrixClient;
    
    // Listen for presence updates - disabled for now due to TypeScript issues
    // TODO: Fix event listener when proper Matrix client types are available
    // this.matrixClient.on('User.presence', this.handlePresenceUpdate.bind(this));
  }

  /**
   * Handle Matrix presence updates
   */
  private handlePresenceUpdate(event: any, user: User): void {
    // Log presence changes for debugging
    console.log(`Presence update for ${user.userId}: ${user.presence} (${user.presenceStatusMsg})`);
  }

  /**
   * Detect users who have been offline for the configured threshold
   */
  async detectOfflineUsers(userIds: string[]): Promise<OfflineUserInfo[]> {
    if (!this.matrixClient) {
      throw new Error('Matrix client not initialized');
    }

    const offlineUsers: OfflineUserInfo[] = [];
    const now = Date.now();

    for (const userId of userIds) {
      try {
        const user = this.matrixClient.getUser(userId);
        if (!user) continue;

        // Check if user is offline and for how long
        const lastActiveTime = this.getLastActiveTime(user);
        const offlineDuration = now - lastActiveTime;

        // Skip if not offline long enough
        if (offlineDuration < this.config.offlineThresholdMs) {
          continue;
        }

        // Skip if we sent an email too recently (rate limiting)
        const lastEmailSent = this.lastEmailSentMap.get(userId) || 0;
        if (now - lastEmailSent < this.config.rateLimitMs) {
          continue;
        }

        // Get unread message counts
        const unreadCounts = await this.getUnreadCounts(userId);

        // Only include users with unread messages
        if (unreadCounts.unreadMessageCount > 0) {
          offlineUsers.push({
            userId,
            displayName: user.displayName || undefined,
            avatarUrl: user.avatarUrl || undefined,
            lastSeenTimestamp: lastActiveTime,
            offlineDurationMs: offlineDuration,
            ...unreadCounts,
          });
        }
      } catch (error) {
        console.error(`Error processing offline detection for user ${userId}:`, error);
      }
    }

    return offlineUsers;
  }

  /**
   * Get the last active time for a user
   */
  private getLastActiveTime(user: User): number {
    // Use presence information if available
    if (user.lastActiveAgo && user.lastPresenceTs) {
      return user.lastPresenceTs - user.lastActiveAgo;
    }

    // Fallback to last presence timestamp
    if (user.lastPresenceTs) {
      return user.lastPresenceTs;
    }

    // If no presence info, assume they've been offline for the threshold duration
    return Date.now() - this.config.offlineThresholdMs;
  }

  /**
   * Get unread message counts for a user
   */
  private async getUnreadCounts(userId: string): Promise<{
    unreadMessageCount: number;
    unreadMentions: number;
    unreadDirectMessages: number;
  }> {
    if (!this.matrixClient) {
      return { unreadMessageCount: 0, unreadMentions: 0, unreadDirectMessages: 0 };
    }

    let unreadMessageCount = 0;
    let unreadMentions = 0;
    let unreadDirectMessages = 0;

    try {
      // Get all rooms the user is in
      const rooms = this.matrixClient.getRooms();

      for (const room of rooms) {
        // Skip rooms the user is not in
        if (!room.hasMembershipState(userId, 'join')) {
          continue;
        }

        // Get unread count for this room
        const unreadCount = room.getUnreadNotificationCount();
        // Note: Using null for highlight count due to TypeScript issues
        const highlightCount = room.getUnreadNotificationCount() || 0;

        unreadMessageCount += unreadCount;
        unreadMentions += highlightCount;

        // Check if this is a direct message room
        if (room.getJoinedMemberCount() === 2 && room.hasMembershipState(userId, 'join')) {
          unreadDirectMessages += unreadCount;
        }
      }
    } catch (error) {
      console.error(`Error getting unread counts for ${userId}:`, error);
    }

    return {
      unreadMessageCount,
      unreadMentions,
      unreadDirectMessages,
    };
  }

  /**
   * Mark that an email was sent to a user (for rate limiting)
   */
  markEmailSent(userId: string): void {
    this.lastEmailSentMap.set(userId, Date.now());
  }

  /**
   * Get recent message previews for a user
   */
  async getMessagePreviews(userId: string, limit: number = 5): Promise<MessagePreview[]> {
    if (!this.matrixClient) {
      return [];
    }

    const previews: MessagePreview[] = [];

    try {
      const rooms = this.matrixClient.getRooms();

      for (const room of rooms) {
        if (!room.hasMembershipState(userId, 'join')) continue;

        // Get recent unread messages
        const timeline = room.timeline;
        const unreadEvents = timeline
          .slice(-20) // Last 20 events
          .filter(event => 
            event.getType() === 'm.room.message' &&
            event.getSender() !== userId &&
            !event.isRedacted()
          )
          .slice(-limit);

        for (const event of unreadEvents) {
          const content = event.getContent();
          if (content.msgtype === 'm.text' || content.msgtype === 'm.emote') {
            previews.push({
              roomName: room.name || 'Unknown Room',
              senderName: event.sender?.name || event.getSender() || 'Unknown',
              messageBody: content.body || '',
              timestamp: event.getTs(),
              isDirect: room.getJoinedMemberCount() === 2,
              isMention: content.body?.includes(userId) || false,
            });
          }
        }
      }

      // Sort by timestamp and return most recent
      return previews
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit);

    } catch (error) {
      console.error(`Error getting message previews for ${userId}:`, error);
      return [];
    }
  }
}

export interface MessagePreview {
  roomName: string;
  senderName: string;
  messageBody: string;
  timestamp: number;
  isDirect: boolean;
  isMention: boolean;
}

/**
 * Default configuration for offline detection
 */
export const defaultOfflineDetectionConfig: OfflineDetectionConfig = {
  offlineThresholdMs: 60 * 60 * 1000, // 1 hour
  rateLimitMs: 4 * 60 * 60 * 1000, // 4 hours between emails
  includeMessagePreviews: true,
  maxMessagePreviews: 5,
};