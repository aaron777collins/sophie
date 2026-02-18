import { MatrixClient, Room, MatrixEvent } from 'matrix-js-sdk';
import { OfflineUser, UserNotificationPreferences } from '../types/email-notifications';

interface UserPresence {
  userId: string;
  lastSeenAt: string;
  presence: 'online' | 'offline' | 'unavailable' | 'unknown';
  isActive: boolean;
  lastActivityAt?: string;
}

interface UnreadMessageSummary {
  directMessages: number;
  mentions: number;
  invites: number;
  totalUnread: number;
  rooms: Array<{
    roomId: string;
    roomName: string;
    unreadCount: number;
    hasDirectMessages: boolean;
    hasMentions: boolean;
  }>;
}

/**
 * Offline User Detection Service
 * Monitors Matrix users and detects when they've been offline for too long
 */
export class OfflineUserDetectionService {
  private matrixClient: MatrixClient | null = null;
  private logger: (level: 'info' | 'warn' | 'error', message: string, metadata?: any) => void;
  
  // In-memory storage for user presence tracking
  private userPresence: Map<string, UserPresence> = new Map();
  private lastDetectionRun: string = new Date().toISOString();
  
  // Configuration
  private config = {
    defaultOfflineThresholdMinutes: 60,
    presenceUpdateIntervalMs: 30000, // 30 seconds
    detectionIntervalMs: 300000, // 5 minutes
    maxUsersToProcess: 100,
    enablePresencePolling: true
  };

  constructor(
    logger?: (level: 'info' | 'warn' | 'error', message: string, metadata?: any) => void
  ) {
    this.logger = logger || this.defaultLogger;
  }

  private defaultLogger(level: string, message: string, metadata?: any): void {
    console.log(`[${level.toUpperCase()}] OfflineUserDetectionService: ${message}`, metadata || '');
  }

  /**
   * Initialize the service with a Matrix client
   */
  initialize(matrixClient: MatrixClient): void {
    this.matrixClient = matrixClient;
    this.setupEventListeners();
    
    if (this.config.enablePresencePolling) {
      this.startPresencePolling();
    }
    
    this.logger('info', 'Offline user detection service initialized');
  }

  /**
   * Setup Matrix event listeners to track user activity
   */
  private setupEventListeners(): void {
    if (!this.matrixClient) return;

    // Track presence updates
    this.matrixClient.on('User.presence', (event: any, user: any) => {
      if (user && user.userId) {
        this.updateUserPresence(user.userId, {
          presence: user.presence || 'unknown',
          lastSeenAt: user.lastPresenceTs ? new Date(user.lastPresenceTs).toISOString() : new Date().toISOString()
        });
      }
    });

    // Track room timeline events to detect activity
    this.matrixClient.on('Room.timeline', (event: MatrixEvent, room: Room | undefined) => {
      if (event.getSender() && room) {
        const userId = event.getSender()!;
        this.updateUserActivity(userId);
      }
    });

    // Track typing events
    this.matrixClient.on('RoomMember.typing', (event: any, member: any) => {
      if (member && member.userId) {
        this.updateUserActivity(member.userId);
      }
    });

    // Track receipt events (read receipts)
    this.matrixClient.on('Room.receipt', (event: MatrixEvent, room: Room) => {
      const content = event.getContent();
      if (content) {
        Object.keys(content).forEach(eventId => {
          const readReceipt = content[eventId];
          if (readReceipt && readReceipt['m.read']) {
            Object.keys(readReceipt['m.read']).forEach(userId => {
              this.updateUserActivity(userId);
            });
          }
        });
      }
    });

    this.logger('info', 'Matrix event listeners set up');
  }

  /**
   * Update user presence information
   */
  private updateUserPresence(
    userId: string, 
    update: Partial<Pick<UserPresence, 'presence' | 'lastSeenAt'>>
  ): void {
    const existing = this.userPresence.get(userId) || {
      userId,
      lastSeenAt: new Date().toISOString(),
      presence: 'unknown' as const,
      isActive: false
    };

    const updated: UserPresence = {
      ...existing,
      ...update,
      isActive: update.presence === 'online' || existing.isActive
    };

    // If user came online, update their activity time
    if (update.presence === 'online') {
      updated.lastActivityAt = new Date().toISOString();
      updated.isActive = true;
    }

    this.userPresence.set(userId, updated);
    
    this.logger('info', `Updated presence for ${userId}: ${updated.presence}`, {
      userId,
      presence: updated.presence,
      lastSeenAt: updated.lastSeenAt
    });
  }

  /**
   * Update user activity timestamp
   */
  private updateUserActivity(userId: string): void {
    const now = new Date().toISOString();
    const existing = this.userPresence.get(userId) || {
      userId,
      lastSeenAt: now,
      presence: 'unknown' as const,
      isActive: true
    };

    existing.lastActivityAt = now;
    existing.isActive = true;
    existing.lastSeenAt = now;
    
    // If we see activity, assume they're online
    if (existing.presence === 'offline' || existing.presence === 'unknown') {
      existing.presence = 'online';
    }

    this.userPresence.set(userId, existing);
  }

  /**
   * Start presence polling (periodically check user presence)
   */
  private startPresencePolling(): void {
    const pollPresence = async () => {
      try {
        await this.pollUserPresence();
      } catch (error) {
        this.logger('error', 'Error polling user presence', error);
      }
    };

    // Initial poll
    pollPresence();

    // Set up interval
    setInterval(pollPresence, this.config.presenceUpdateIntervalMs);
    this.logger('info', `Started presence polling every ${this.config.presenceUpdateIntervalMs}ms`);
  }

  /**
   * Poll Matrix for current user presence
   */
  private async pollUserPresence(): Promise<void> {
    if (!this.matrixClient) return;

    try {
      // Get all rooms and users we know about
      const rooms = this.matrixClient.getRooms();
      const userIds = new Set<string>();

      rooms.forEach(room => {
        const members = room.getJoinedMembers();
        members.forEach(member => {
          userIds.add(member.userId);
        });
      });

      // Limit the number of users we check at once
      const usersToCheck = Array.from(userIds).slice(0, this.config.maxUsersToProcess);

      // Update presence for inactive users
      const now = Date.now();
      usersToCheck.forEach(userId => {
        const presence = this.userPresence.get(userId);
        if (presence) {
          const lastActivity = presence.lastActivityAt ? new Date(presence.lastActivityAt).getTime() : 0;
          const timeSinceActivity = now - lastActivity;
          
          // Mark as offline if no activity for 5 minutes
          if (timeSinceActivity > 300000 && presence.isActive) {
            presence.isActive = false;
            presence.presence = 'offline';
            this.logger('info', `Marked user ${userId} as inactive due to lack of activity`);
          }
        }
      });

    } catch (error) {
      this.logger('error', 'Error in presence polling', error);
    }
  }

  /**
   * Detect offline users who need email notifications
   */
  async detectOfflineUsers(
    userPreferences: UserNotificationPreferences[]
  ): Promise<OfflineUser[]> {
    if (!this.matrixClient) {
      this.logger('warn', 'Matrix client not initialized, cannot detect offline users');
      return [];
    }

    const now = new Date();
    const offlineUsers: OfflineUser[] = [];

    this.logger('info', `Checking ${userPreferences.length} users for offline status`);

    for (const preferences of userPreferences) {
      try {
        // Skip if user has opted out or email notifications are disabled
        if (preferences.optedOut || !preferences.emailEnabled || !preferences.emailAddress) {
          continue;
        }

        const userPresence = this.userPresence.get(preferences.userId);
        let offlineDurationMinutes = 0;
        let lastSeenAt = now.toISOString();

        if (userPresence) {
          const lastSeen = new Date(userPresence.lastSeenAt);
          offlineDurationMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60));
          lastSeenAt = userPresence.lastSeenAt;

          // Skip if user is currently active or hasn't been offline long enough
          if (userPresence.isActive || offlineDurationMinutes < preferences.offlineThresholdMinutes) {
            continue;
          }
        } else {
          // If we have no presence data, assume they're new and skip for now
          this.logger('info', `No presence data for ${preferences.userId}, skipping`);
          continue;
        }

        // Get unread message summary
        const unreadMessages = await this.getUnreadMessageSummary(preferences.userId);

        // Skip if no unread messages
        if (unreadMessages.totalUnread === 0) {
          continue;
        }

        // Check if any notification types are enabled and have relevant unread messages
        const hasRelevantUnread = 
          (preferences.notificationTypes.directMessages && unreadMessages.directMessages > 0) ||
          (preferences.notificationTypes.mentions && unreadMessages.mentions > 0) ||
          (preferences.notificationTypes.roomActivity && 
           (unreadMessages.totalUnread - unreadMessages.directMessages - unreadMessages.mentions) > 0);

        if (!hasRelevantUnread) {
          continue;
        }

        const offlineUser: OfflineUser = {
          userId: preferences.userId,
          lastSeenAt,
          offlineDurationMinutes,
          unreadMessages,
          notificationPreferences: preferences
        };

        offlineUsers.push(offlineUser);

      } catch (error) {
        this.logger('error', `Error checking offline status for ${preferences.userId}`, error);
      }
    }

    this.lastDetectionRun = now.toISOString();
    this.logger('info', `Found ${offlineUsers.length} offline users needing notifications`);

    return offlineUsers;
  }

  /**
   * Get unread message summary for a user
   */
  private async getUnreadMessageSummary(userId: string): Promise<UnreadMessageSummary> {
    if (!this.matrixClient) {
      throw new Error('Matrix client not initialized');
    }

    const summary: UnreadMessageSummary = {
      directMessages: 0,
      mentions: 0,
      invites: 0,
      totalUnread: 0,
      rooms: []
    };

    try {
      const rooms = this.matrixClient.getRooms();
      const userIdLocal = this.matrixClient.getUserId();

      for (const room of rooms) {
        // Skip rooms the user isn't in
        const membership = room.getMyMembership();
        if (membership !== 'join') {
          if (membership === 'invite') {
            summary.invites++;
          }
          continue;
        }

        // Get unread count for this room
        const unreadCount = room.getUnreadNotificationCount();
        const highlightCount = room.getUnreadNotificationCount('highlight');
        
        if (unreadCount > 0) {
          const isDirect = room.isDmRoom();
          const roomSummary = {
            roomId: room.roomId,
            roomName: room.name || room.getCanonicalAlias() || 'Unknown Room',
            unreadCount,
            hasDirectMessages: isDirect,
            hasMentions: highlightCount > 0
          };

          summary.rooms.push(roomSummary);
          summary.totalUnread += unreadCount;

          // Categorize the unread messages
          if (isDirect) {
            summary.directMessages += unreadCount;
          } else if (highlightCount > 0) {
            summary.mentions += highlightCount;
            // The remaining unread messages in this room are regular room activity
            const roomActivity = unreadCount - highlightCount;
            // Note: This is counted in totalUnread but not separately tracked
          }
        }
      }

    } catch (error) {
      this.logger('error', `Error getting unread message summary for ${userId}`, error);
    }

    return summary;
  }

  /**
   * Manually mark a user as offline (for testing or admin purposes)
   */
  markUserOffline(userId: string, lastSeenAt?: string): void {
    const now = new Date().toISOString();
    const userPresence: UserPresence = {
      userId,
      lastSeenAt: lastSeenAt || now,
      presence: 'offline',
      isActive: false,
      lastActivityAt: lastSeenAt || now
    };

    this.userPresence.set(userId, userPresence);
    this.logger('info', `Manually marked user ${userId} as offline`);
  }

  /**
   * Manually mark a user as online (for testing or admin purposes)
   */
  markUserOnline(userId: string): void {
    const now = new Date().toISOString();
    const existing = this.userPresence.get(userId) || {
      userId,
      lastSeenAt: now,
      presence: 'online' as const,
      isActive: true
    };

    existing.presence = 'online';
    existing.isActive = true;
    existing.lastSeenAt = now;
    existing.lastActivityAt = now;

    this.userPresence.set(userId, existing);
    this.logger('info', `Manually marked user ${userId} as online`);
  }

  /**
   * Get current presence information for a user
   */
  getUserPresence(userId: string): UserPresence | null {
    return this.userPresence.get(userId) || null;
  }

  /**
   * Get presence information for all tracked users
   */
  getAllUserPresence(): UserPresence[] {
    return Array.from(this.userPresence.values());
  }

  /**
   * Get offline users statistics
   */
  getOfflineStats(): {
    totalTrackedUsers: number;
    onlineUsers: number;
    offlineUsers: number;
    unknownUsers: number;
    lastDetectionRun: string;
  } {
    const allUsers = Array.from(this.userPresence.values());
    
    return {
      totalTrackedUsers: allUsers.length,
      onlineUsers: allUsers.filter(u => u.isActive && u.presence === 'online').length,
      offlineUsers: allUsers.filter(u => !u.isActive || u.presence === 'offline').length,
      unknownUsers: allUsers.filter(u => u.presence === 'unknown').length,
      lastDetectionRun: this.lastDetectionRun
    };
  }

  /**
   * Update service configuration
   */
  updateConfig(newConfig: Partial<typeof this.config>): void {
    this.config = { ...this.config, ...newConfig };
    this.logger('info', 'Updated offline detection service configuration', newConfig);
  }

  /**
   * Cleanup old presence data (remove entries older than 30 days)
   */
  cleanupOldPresenceData(): number {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    let removedCount = 0;

    for (const [userId, presence] of this.userPresence.entries()) {
      if (presence.lastSeenAt < thirtyDaysAgo) {
        this.userPresence.delete(userId);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      this.logger('info', `Cleaned up ${removedCount} old presence entries`);
    }

    return removedCount;
  }

  /**
   * Force a detection run (for manual triggering)
   */
  async runDetection(userPreferences: UserNotificationPreferences[]): Promise<OfflineUser[]> {
    this.logger('info', 'Running manual offline user detection');
    return this.detectOfflineUsers(userPreferences);
  }

  /**
   * Shutdown the service
   */
  shutdown(): void {
    this.logger('info', 'Shutting down offline user detection service');
    // Clear any intervals or cleanup resources if needed
  }
}