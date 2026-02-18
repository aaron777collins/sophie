/**
 * Offline email notification service for HAOS
 * Sends personalized emails to users when they are offline with unread messages
 */

import { OfflineUserInfo, MessagePreview } from './offline-detection';
import { EmailNotificationService } from './email-service';
import { Notification } from '@/lib/types/notification';

export interface OfflineEmailConfig {
  /** Email service configuration */
  smtpHost?: string;
  smtpPort?: number;
  smtpSecure?: boolean;
  smtpUser?: string;
  smtpPassword?: string;
  fromAddress: string;
  fromName?: string;
  
  /** Email content configuration */
  includeUnsubscribeLink: boolean;
  baseUrl: string; // For generating unsubscribe links
  
  /** Rate limiting */
  maxEmailsPerHour: number;
  maxEmailsPerDay: number;
}

export interface OfflineEmailResult {
  success: boolean;
  userId: string;
  emailAddress: string;
  error?: string;
  messageId?: string;
}

export class OfflineEmailService {
  private emailsSentThisHour = new Map<string, number>();
  private emailsSentToday = new Map<string, number>();
  private lastHourReset = Date.now();
  private lastDayReset = new Date().getDate();

  constructor(
    private config: OfflineEmailConfig,
    private emailService: EmailNotificationService
  ) {}

  /**
   * Send offline email notifications to multiple users
   */
  async sendOfflineNotifications(
    offlineUsers: OfflineUserInfo[],
    messagePreviewsMap: Map<string, MessagePreview[]>,
    userEmailMap: Map<string, string>
  ): Promise<OfflineEmailResult[]> {
    const results: OfflineEmailResult[] = [];

    // Reset rate limiting counters if needed
    this.resetRateLimitCounters();

    for (const user of offlineUsers) {
      const emailAddress = userEmailMap.get(user.userId);
      if (!emailAddress) {
        results.push({
          success: false,
          userId: user.userId,
          emailAddress: '',
          error: 'No email address found for user',
        });
        continue;
      }

      // Check rate limits
      if (!this.checkRateLimit(user.userId)) {
        results.push({
          success: false,
          userId: user.userId,
          emailAddress,
          error: 'Rate limit exceeded',
        });
        continue;
      }

      try {
        const messagePreviews = messagePreviewsMap.get(user.userId) || [];
        const notification = this.createOfflineNotification(user, messagePreviews);
        
        const success = await this.emailService.send(notification, emailAddress);
        
        if (success) {
          this.updateRateLimitCounters(user.userId);
          results.push({
            success: true,
            userId: user.userId,
            emailAddress,
            messageId: notification.id,
          });
        } else {
          results.push({
            success: false,
            userId: user.userId,
            emailAddress,
            error: 'Email service failed to send',
          });
        }
      } catch (error) {
        results.push({
          success: false,
          userId: user.userId,
          emailAddress,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  /**
   * Create a notification object for offline user email
   */
  private createOfflineNotification(
    user: OfflineUserInfo, 
    messagePreviews: MessagePreview[]
  ): Notification {
    const offlineHours = Math.floor(user.offlineDurationMs / (60 * 60 * 1000));
    const offlineMinutes = Math.floor((user.offlineDurationMs % (60 * 60 * 1000)) / (60 * 1000));
    
    // Create a human-readable offline duration
    let offlineDuration: string;
    if (offlineHours > 0) {
      offlineDuration = offlineMinutes > 0 
        ? `${offlineHours} hours and ${offlineMinutes} minutes`
        : `${offlineHours} hours`;
    } else {
      offlineDuration = `${offlineMinutes} minutes`;
    }

    // Generate email subject
    let subject = '';
    if (user.unreadDirectMessages > 0) {
      subject = `You have ${user.unreadDirectMessages} unread direct message${user.unreadDirectMessages === 1 ? '' : 's'}`;
    } else if (user.unreadMentions > 0) {
      subject = `You were mentioned ${user.unreadMentions} time${user.unreadMentions === 1 ? '' : 's'}`;
    } else {
      subject = `You have ${user.unreadMessageCount} unread message${user.unreadMessageCount === 1 ? '' : 's'}`;
    }

    // Generate email body
    const message = this.generateEmailMessage(user, messagePreviews, offlineDuration);

    return {
      id: `offline_${user.userId}_${Date.now()}`,
      type: 'custom', // Using custom type for offline notifications
      title: subject,
      message,
      priority: user.unreadMentions > 0 || user.unreadDirectMessages > 0 ? 'high' : 'normal',
      status: 'unread',
      userId: user.userId,
      deliveryMethods: ['email'],
      createdAt: new Date(),
      updatedAt: new Date(),
      data: {
        offlineNotification: true,
        offlineDurationMs: user.offlineDurationMs,
        unreadCounts: {
          total: user.unreadMessageCount,
          mentions: user.unreadMentions,
          directMessages: user.unreadDirectMessages,
        },
        messagePreviews,
      },
      actions: [
        {
          id: 'view_messages',
          label: 'View Messages',
          action: 'navigate',
          data: { url: this.config.baseUrl },
        },
        {
          id: 'unsubscribe',
          label: 'Unsubscribe',
          action: 'navigate',
          data: { 
            url: `${this.config.baseUrl}/api/notifications/unsubscribe?userId=${encodeURIComponent(user.userId)}&type=offline`,
          },
        },
      ],
    };
  }

  /**
   * Generate the email message content
   */
  private generateEmailMessage(
    user: OfflineUserInfo, 
    messagePreviews: MessagePreview[], 
    offlineDuration: string
  ): string {
    let message = `Hi ${user.displayName || user.userId}!\n\n`;
    
    message += `You've been away from HAOS for ${offlineDuration}, and you have `;
    
    // Describe unread messages
    const parts: string[] = [];
    if (user.unreadDirectMessages > 0) {
      parts.push(`${user.unreadDirectMessages} direct message${user.unreadDirectMessages === 1 ? '' : 's'}`);
    }
    if (user.unreadMentions > 0) {
      parts.push(`${user.unreadMentions} mention${user.unreadMentions === 1 ? '' : 's'}`);
    }
    if (user.unreadMessageCount > user.unreadDirectMessages + user.unreadMentions) {
      const otherCount = user.unreadMessageCount - user.unreadDirectMessages - user.unreadMentions;
      parts.push(`${otherCount} other unread message${otherCount === 1 ? '' : 's'}`);
    }
    
    if (parts.length === 0) {
      parts.push(`${user.unreadMessageCount} unread message${user.unreadMessageCount === 1 ? '' : 's'}`);
    }
    
    message += parts.join(' and ') + ' waiting for you.\n\n';

    // Add message previews if available
    if (messagePreviews.length > 0) {
      message += 'Here\'s a preview of your recent messages:\n\n';
      
      for (const preview of messagePreviews.slice(0, 3)) {
        const timeAgo = this.formatTimeAgo(Date.now() - preview.timestamp);
        const messageType = preview.isDirect ? 'Direct message' : 
                           preview.isMention ? 'Mention' : 
                           `Message in ${preview.roomName}`;
        
        message += `📩 ${messageType} from ${preview.senderName} (${timeAgo}):\n`;
        message += `   "${this.truncateMessage(preview.messageBody)}"\n\n`;
      }
      
      if (messagePreviews.length > 3) {
        message += `And ${messagePreviews.length - 3} more message${messagePreviews.length - 3 === 1 ? '' : 's'}...\n\n`;
      }
    }

    message += `Click the link below to view all your messages:\n`;
    message += `${this.config.baseUrl}\n\n`;
    
    if (this.config.includeUnsubscribeLink) {
      message += `To stop receiving these offline notifications, click here:\n`;
      message += `${this.config.baseUrl}/api/notifications/unsubscribe?userId=${encodeURIComponent(user.userId)}&type=offline\n\n`;
    }
    
    message += 'Best regards,\nThe HAOS Team';

    return message;
  }

  /**
   * Truncate message to a reasonable length for email preview
   */
  private truncateMessage(message: string, maxLength: number = 100): string {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength - 3) + '...';
  }

  /**
   * Format timestamp as human-readable time ago
   */
  private formatTimeAgo(ms: number): string {
    const minutes = Math.floor(ms / (60 * 1000));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days === 1 ? '' : 's'} ago`;
    if (hours > 0) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    if (minutes > 0) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    return 'just now';
  }

  /**
   * Check if user is within rate limits
   */
  private checkRateLimit(userId: string): boolean {
    const hourlyCount = this.emailsSentThisHour.get(userId) || 0;
    const dailyCount = this.emailsSentToday.get(userId) || 0;
    
    return hourlyCount < this.config.maxEmailsPerHour && 
           dailyCount < this.config.maxEmailsPerDay;
  }

  /**
   * Update rate limiting counters after sending an email
   */
  private updateRateLimitCounters(userId: string): void {
    const hourlyCount = this.emailsSentThisHour.get(userId) || 0;
    const dailyCount = this.emailsSentToday.get(userId) || 0;
    
    this.emailsSentThisHour.set(userId, hourlyCount + 1);
    this.emailsSentToday.set(userId, dailyCount + 1);
  }

  /**
   * Reset rate limiting counters when time periods expire
   */
  private resetRateLimitCounters(): void {
    const now = Date.now();
    const currentHour = Math.floor(now / (60 * 60 * 1000));
    const currentDay = new Date().getDate();
    
    // Reset hourly counter
    if (currentHour !== Math.floor(this.lastHourReset / (60 * 60 * 1000))) {
      this.emailsSentThisHour.clear();
      this.lastHourReset = now;
    }
    
    // Reset daily counter
    if (currentDay !== this.lastDayReset) {
      this.emailsSentToday.clear();
      this.lastDayReset = currentDay;
    }
  }

  /**
   * Get rate limiting statistics for monitoring
   */
  getRateLimitStats(): { hourly: Map<string, number>; daily: Map<string, number> } {
    this.resetRateLimitCounters();
    return {
      hourly: new Map(this.emailsSentThisHour),
      daily: new Map(this.emailsSentToday),
    };
  }
}

/**
 * Default configuration for offline email service
 */
export const defaultOfflineEmailConfig: Partial<OfflineEmailConfig> = {
  fromAddress: 'notifications@haos.local',
  fromName: 'HAOS Notifications',
  includeUnsubscribeLink: true,
  baseUrl: 'http://localhost:3000',
  maxEmailsPerHour: 2,
  maxEmailsPerDay: 10,
};