import { MatrixClient } from 'matrix-js-sdk';
import {
  UserNotificationPreferences,
  EmailNotificationData,
  OfflineUser,
  EmailTemplate,
  NotificationLogEntry,
  EmailNotificationConfig,
  EmailValidationResult,
  NotificationStats
} from '../types/email-notifications';

/**
 * Email Notification Service
 * Handles email notifications for offline Matrix users
 */
export class EmailNotificationService {
  private config: EmailNotificationConfig;
  private logger: (level: 'info' | 'warn' | 'error', message: string, metadata?: any) => void;

  // In-memory storage - in production, this would be a database
  private userPreferences: Map<string, UserNotificationPreferences> = new Map();
  private notifications: Map<string, EmailNotificationData> = new Map();
  private templates: Map<string, EmailTemplate> = new Map();
  private logs: NotificationLogEntry[] = [];

  constructor(
    config: EmailNotificationConfig,
    logger?: (level: 'info' | 'warn' | 'error', message: string, metadata?: any) => void
  ) {
    this.config = config;
    this.logger = logger || this.defaultLogger;
    this.initializeDefaultTemplates();
  }

  private defaultLogger(level: string, message: string, metadata?: any): void {
    console.log(`[${level.toUpperCase()}] EmailNotificationService: ${message}`, metadata || '');
  }

  private logAction(
    userId: string,
    emailAddress: string,
    notificationId: string,
    action: 'created' | 'sent' | 'failed' | 'cancelled' | 'retried',
    details: string,
    metadata?: Record<string, any>
  ): void {
    const logEntry: NotificationLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      emailAddress,
      notificationId,
      action,
      details,
      metadata,
      timestamp: new Date().toISOString()
    };

    this.logs.push(logEntry);
    this.logger(action === 'failed' ? 'error' : 'info', details, { ...logEntry, metadata });

    // Keep only last 1000 log entries to prevent memory issues
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }
  }

  /**
   * Get user notification preferences
   */
  async getUserPreferences(userId: string): Promise<UserNotificationPreferences | null> {
    return this.userPreferences.get(userId) || null;
  }

  /**
   * Update user notification preferences
   */
  async updateUserPreferences(
    userId: string,
    preferences: Partial<UserNotificationPreferences>
  ): Promise<UserNotificationPreferences> {
    const existing = this.userPreferences.get(userId) || this.createDefaultPreferences(userId);
    const updated: UserNotificationPreferences = {
      ...existing,
      ...preferences,
      updatedAt: new Date().toISOString()
    };

    this.userPreferences.set(userId, updated);
    this.logger('info', `Updated notification preferences for user ${userId}`);
    return updated;
  }

  /**
   * Create default notification preferences for a user
   */
  private createDefaultPreferences(userId: string): UserNotificationPreferences {
    return {
      userId,
      emailEnabled: true,
      offlineThresholdMinutes: this.config.defaultOfflineThresholdMinutes,
      notificationTypes: {
        directMessages: true,
        mentions: true,
        invites: true,
        roomActivity: false
      },
      optedOut: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Validate email address
   */
  validateEmail(email: string): EmailValidationResult {
    if (!email) {
      return { isValid: false, error: 'Email address is required' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Invalid email format' };
    }

    return { isValid: true };
  }

  /**
   * Create email notification
   */
  async createNotification(
    userId: string,
    emailAddress: string,
    notificationType: EmailNotificationData['notificationType'],
    templateData: Record<string, any>
  ): Promise<EmailNotificationData> {
    // Validate email
    const emailValidation = this.validateEmail(emailAddress);
    if (!emailValidation.isValid) {
      throw new Error(`Invalid email address: ${emailValidation.error}`);
    }

    // Check if user has opted out
    const preferences = await this.getUserPreferences(userId);
    if (preferences?.optedOut) {
      throw new Error('User has opted out of email notifications');
    }

    // Get appropriate template
    const template = this.getTemplateForType(notificationType);
    if (!template) {
      throw new Error(`No template found for notification type: ${notificationType}`);
    }

    // Create notification
    const notification: EmailNotificationData = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      emailAddress,
      notificationType,
      subject: this.processTemplate(template.subject, templateData),
      templateId: template.id,
      templateData,
      status: 'pending',
      attemptCount: 0,
      maxAttempts: this.config.maxAttemptsPerNotification,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.notifications.set(notification.id, notification);
    
    this.logAction(
      userId,
      emailAddress,
      notification.id,
      'created',
      `Created ${notificationType} notification`,
      { templateId: template.id, subject: notification.subject }
    );

    return notification;
  }

  /**
   * Process offline users and create notifications
   */
  async processOfflineUsers(offlineUsers: OfflineUser[]): Promise<void> {
    if (!this.config.enabled) {
      this.logger('info', 'Email notifications are disabled, skipping offline user processing');
      return;
    }

    this.logger('info', `Processing ${offlineUsers.length} offline users`);

    let processedCount = 0;
    let notificationCount = 0;

    for (const offlineUser of offlineUsers) {
      try {
        // Check if user has email enabled and an email address
        if (!offlineUser.notificationPreferences.emailEnabled || 
            !offlineUser.notificationPreferences.emailAddress) {
          continue;
        }

        // Check rate limiting
        if (await this.isRateLimited(offlineUser.userId)) {
          this.logger('warn', `User ${offlineUser.userId} is rate limited, skipping`);
          continue;
        }

        // Create notifications based on unread messages
        const notifications = await this.createNotificationsForOfflineUser(offlineUser);
        notificationCount += notifications.length;
        processedCount++;

      } catch (error) {
        this.logger('error', `Error processing offline user ${offlineUser.userId}`, error);
      }
    }

    this.logger('info', `Processed ${processedCount} users, created ${notificationCount} notifications`);
  }

  /**
   * Create notifications for an offline user based on their unread messages
   */
  private async createNotificationsForOfflineUser(offlineUser: OfflineUser): Promise<EmailNotificationData[]> {
    const notifications: EmailNotificationData[] = [];
    const { userId, unreadMessages, notificationPreferences } = offlineUser;
    const emailAddress = notificationPreferences.emailAddress!;

    // Direct messages notification
    if (notificationPreferences.notificationTypes.directMessages && unreadMessages.directMessages > 0) {
      const notification = await this.createNotification(
        userId,
        emailAddress,
        'direct_message',
        {
          userName: userId.split(':')[0].replace('@', ''),
          unreadCount: unreadMessages.directMessages,
          totalUnread: unreadMessages.totalUnread,
          offlineDuration: this.formatDuration(offlineUser.offlineDurationMinutes)
        }
      );
      notifications.push(notification);
    }

    // Mentions notification
    if (notificationPreferences.notificationTypes.mentions && unreadMessages.mentions > 0) {
      const notification = await this.createNotification(
        userId,
        emailAddress,
        'mention',
        {
          userName: userId.split(':')[0].replace('@', ''),
          mentionCount: unreadMessages.mentions,
          totalUnread: unreadMessages.totalUnread,
          offlineDuration: this.formatDuration(offlineUser.offlineDurationMinutes)
        }
      );
      notifications.push(notification);
    }

    // Room activity notification (only if enabled and has unread)
    if (notificationPreferences.notificationTypes.roomActivity && 
        unreadMessages.totalUnread > unreadMessages.directMessages + unreadMessages.mentions) {
      const notification = await this.createNotification(
        userId,
        emailAddress,
        'room_activity',
        {
          userName: userId.split(':')[0].replace('@', ''),
          roomCount: unreadMessages.rooms.length,
          unreadCount: unreadMessages.totalUnread - unreadMessages.directMessages - unreadMessages.mentions,
          totalUnread: unreadMessages.totalUnread,
          offlineDuration: this.formatDuration(offlineUser.offlineDurationMinutes),
          rooms: unreadMessages.rooms.slice(0, 5) // Top 5 rooms
        }
      );
      notifications.push(notification);
    }

    return notifications;
  }

  /**
   * Send pending notifications
   */
  async sendPendingNotifications(): Promise<void> {
    const pendingNotifications = Array.from(this.notifications.values())
      .filter(n => n.status === 'pending')
      .slice(0, this.config.batchSize);

    if (pendingNotifications.length === 0) {
      return;
    }

    this.logger('info', `Sending ${pendingNotifications.length} pending notifications`);

    for (const notification of pendingNotifications) {
      try {
        await this.sendNotification(notification);
      } catch (error) {
        this.logger('error', `Failed to send notification ${notification.id}`, error);
      }
    }
  }

  /**
   * Send individual notification
   */
  private async sendNotification(notification: EmailNotificationData): Promise<void> {
    // Update notification status
    notification.status = 'sending';
    notification.attemptCount++;
    notification.lastAttemptAt = new Date().toISOString();
    notification.updatedAt = new Date().toISOString();

    try {
      // Get template
      const template = this.templates.get(notification.templateId);
      if (!template) {
        throw new Error(`Template ${notification.templateId} not found`);
      }

      // Process templates
      const htmlContent = this.processTemplate(template.htmlTemplate, notification.templateData);
      const textContent = this.processTemplate(template.textTemplate, notification.templateData);

      // In a real implementation, this would use a real email service (SendGrid, AWS SES, etc.)
      await this.sendEmail(
        notification.emailAddress,
        notification.subject,
        htmlContent,
        textContent
      );

      // Mark as sent
      notification.status = 'sent';
      notification.sentAt = new Date().toISOString();

      this.logAction(
        notification.userId,
        notification.emailAddress,
        notification.id,
        'sent',
        `Successfully sent ${notification.notificationType} notification`
      );

    } catch (error) {
      // Mark as failed
      notification.status = 'failed';
      notification.errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Retry logic
      if (notification.attemptCount < notification.maxAttempts) {
        // Schedule retry (in a real implementation, this would use a job queue)
        setTimeout(() => {
          notification.status = 'pending';
          this.logAction(
            notification.userId,
            notification.emailAddress,
            notification.id,
            'retried',
            `Retrying notification (attempt ${notification.attemptCount + 1}/${notification.maxAttempts})`
          );
        }, this.config.retryDelayMinutes * 60 * 1000);
      } else {
        this.logAction(
          notification.userId,
          notification.emailAddress,
          notification.id,
          'failed',
          `Failed to send notification after ${notification.maxAttempts} attempts`,
          { error: notification.errorMessage }
        );
      }

      throw error;
    }
  }

  /**
   * Mock email sending (replace with real email service)
   */
  private async sendEmail(
    to: string,
    subject: string,
    htmlContent: string,
    textContent: string
  ): Promise<void> {
    // This is a mock implementation
    // In production, integrate with SendGrid, AWS SES, Postmark, etc.
    
    this.logger('info', `[MOCK] Sending email to ${to}`, {
      subject,
      htmlPreview: htmlContent.substring(0, 100) + '...',
      textPreview: textContent.substring(0, 100) + '...'
    });

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Simulate occasional failures (5% failure rate)
    if (Math.random() < 0.05) {
      throw new Error('Simulated email service error');
    }
  }

  /**
   * Process template with data
   */
  private processTemplate(template: string, data: Record<string, any>): string {
    let result = template;
    for (const [key, value] of Object.entries(data)) {
      const placeholder = `{{${key}}}`;
      result = result.replace(new RegExp(placeholder, 'g'), String(value));
    }
    return result;
  }

  /**
   * Get template for notification type
   */
  private getTemplateForType(type: EmailNotificationData['notificationType']): EmailTemplate | null {
    return Array.from(this.templates.values()).find(t => t.type === type && t.isActive) || null;
  }

  /**
   * Check if user is rate limited
   */
  private async isRateLimited(userId: string): Promise<boolean> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const recentNotifications = Array.from(this.notifications.values())
      .filter(n => n.userId === userId && n.createdAt > oneHourAgo && n.status === 'sent');

    return recentNotifications.length >= this.config.rateLimitPerHour;
  }

  /**
   * Format duration in minutes to human-readable string
   */
  private formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours < 24) {
      if (remainingMinutes === 0) {
        return `${hours} hour${hours !== 1 ? 's' : ''}`;
      }
      return `${hours} hour${hours !== 1 ? 's' : ''} and ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
    }
    
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    
    if (remainingHours === 0) {
      return `${days} day${days !== 1 ? 's' : ''}`;
    }
    return `${days} day${days !== 1 ? 's' : ''} and ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`;
  }

  /**
   * Initialize default email templates
   */
  private initializeDefaultTemplates(): void {
    const templates: EmailTemplate[] = [
      {
        id: 'direct_message_template',
        name: 'Direct Message Notification',
        type: 'direct_message',
        subject: 'You have {{unreadCount}} unread direct message{{unreadCount === 1 ? "" : "s"}} on Matrix',
        htmlTemplate: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Unread Messages</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2196F3; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
    .button { display: inline-block; background: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 10px 0; }
    .unsubscribe { color: #666; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>You have unread messages!</h1>
    </div>
    <div class="content">
      <p>Hi {{userName}},</p>
      <p>You've been offline for {{offlineDuration}} and have <strong>{{unreadCount}} unread direct message{{unreadCount === 1 ? "" : "s"}}</strong> waiting for you.</p>
      <p>Total unread messages: <strong>{{totalUnread}}</strong></p>
      <p><a href="{{matrixClientUrl}}" class="button">Open Matrix Client</a></p>
    </div>
    <div class="footer">
      <p>You received this email because you have email notifications enabled for Matrix.</p>
      <p><a href="{{unsubscribeUrl}}" class="unsubscribe">Unsubscribe</a> | <a href="{{privacyPolicyUrl}}" class="unsubscribe">Privacy Policy</a></p>
    </div>
  </div>
</body>
</html>`,
        textTemplate: `Hi {{userName}},

You've been offline for {{offlineDuration}} and have {{unreadCount}} unread direct message{{unreadCount === 1 ? "" : "s"}} waiting for you.

Total unread messages: {{totalUnread}}

Open your Matrix client to read them: {{matrixClientUrl}}

You received this email because you have email notifications enabled for Matrix.
To unsubscribe: {{unsubscribeUrl}}
Privacy Policy: {{privacyPolicyUrl}}`,
        variables: ['userName', 'unreadCount', 'totalUnread', 'offlineDuration', 'matrixClientUrl', 'unsubscribeUrl', 'privacyPolicyUrl'],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'mention_template',
        name: 'Mention Notification',
        type: 'mention',
        subject: 'You were mentioned {{mentionCount}} time{{mentionCount === 1 ? "" : "s"}} on Matrix',
        htmlTemplate: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>You were mentioned</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #FF9800; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
    .button { display: inline-block; background: #FF9800; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 10px 0; }
    .unsubscribe { color: #666; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>You were mentioned!</h1>
    </div>
    <div class="content">
      <p>Hi {{userName}},</p>
      <p>You've been offline for {{offlineDuration}} and were mentioned <strong>{{mentionCount}} time{{mentionCount === 1 ? "" : "s"}}</strong> in Matrix conversations.</p>
      <p>Total unread messages: <strong>{{totalUnread}}</strong></p>
      <p><a href="{{matrixClientUrl}}" class="button">Check Mentions</a></p>
    </div>
    <div class="footer">
      <p>You received this email because you have email notifications enabled for Matrix.</p>
      <p><a href="{{unsubscribeUrl}}" class="unsubscribe">Unsubscribe</a> | <a href="{{privacyPolicyUrl}}" class="unsubscribe">Privacy Policy</a></p>
    </div>
  </div>
</body>
</html>`,
        textTemplate: `Hi {{userName}},

You've been offline for {{offlineDuration}} and were mentioned {{mentionCount}} time{{mentionCount === 1 ? "" : "s"}} in Matrix conversations.

Total unread messages: {{totalUnread}}

Check your mentions: {{matrixClientUrl}}

You received this email because you have email notifications enabled for Matrix.
To unsubscribe: {{unsubscribeUrl}}
Privacy Policy: {{privacyPolicyUrl}}`,
        variables: ['userName', 'mentionCount', 'totalUnread', 'offlineDuration', 'matrixClientUrl', 'unsubscribeUrl', 'privacyPolicyUrl'],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'room_activity_template',
        name: 'Room Activity Notification',
        type: 'room_activity',
        subject: 'Activity in {{roomCount}} Matrix room{{roomCount === 1 ? "" : "s"}}',
        htmlTemplate: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Room Activity</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
    .button { display: inline-block; background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 10px 0; }
    .room-list { margin: 15px 0; }
    .room-item { padding: 5px 0; }
    .unsubscribe { color: #666; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Room Activity</h1>
    </div>
    <div class="content">
      <p>Hi {{userName}},</p>
      <p>You've been offline for {{offlineDuration}} and there's been activity in <strong>{{roomCount}} room{{roomCount === 1 ? "" : "s"}}</strong> you're part of.</p>
      <p>Unread messages in rooms: <strong>{{unreadCount}}</strong></p>
      <p>Total unread messages: <strong>{{totalUnread}}</strong></p>
      {{#if rooms}}
      <div class="room-list">
        <h4>Active rooms:</h4>
        {{#each rooms}}
        <div class="room-item">• {{roomName}} ({{unreadCount}} unread)</div>
        {{/each}}
      </div>
      {{/if}}
      <p><a href="{{matrixClientUrl}}" class="button">Check Rooms</a></p>
    </div>
    <div class="footer">
      <p>You received this email because you have email notifications enabled for Matrix.</p>
      <p><a href="{{unsubscribeUrl}}" class="unsubscribe">Unsubscribe</a> | <a href="{{privacyPolicyUrl}}" class="unsubscribe">Privacy Policy</a></p>
    </div>
  </div>
</body>
</html>`,
        textTemplate: `Hi {{userName}},

You've been offline for {{offlineDuration}} and there's been activity in {{roomCount}} room{{roomCount === 1 ? "" : "s"}} you're part of.

Unread messages in rooms: {{unreadCount}}
Total unread messages: {{totalUnread}}

{{#if rooms}}
Active rooms:
{{#each rooms}}
• {{roomName}} ({{unreadCount}} unread)
{{/each}}
{{/if}}

Check your rooms: {{matrixClientUrl}}

You received this email because you have email notifications enabled for Matrix.
To unsubscribe: {{unsubscribeUrl}}
Privacy Policy: {{privacyPolicyUrl}}`,
        variables: ['userName', 'roomCount', 'unreadCount', 'totalUnread', 'offlineDuration', 'rooms', 'matrixClientUrl', 'unsubscribeUrl', 'privacyPolicyUrl'],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    templates.forEach(template => {
      this.templates.set(template.id, template);
    });

    this.logger('info', `Initialized ${templates.length} default email templates`);
  }

  /**
   * Get notification statistics
   */
  async getStats(): Promise<NotificationStats> {
    const notifications = Array.from(this.notifications.values());
    const preferences = Array.from(this.userPreferences.values());

    const totalSent = notifications.filter(n => n.status === 'sent').length;
    const totalFailed = notifications.filter(n => n.status === 'failed').length;
    const totalPending = notifications.filter(n => n.status === 'pending').length;

    const sentNotifications = notifications.filter(n => n.status === 'sent' && n.sentAt && n.createdAt);
    const averageDeliveryTimeMs = sentNotifications.length > 0 
      ? sentNotifications.reduce((sum, n) => {
          const created = new Date(n.createdAt!).getTime();
          const sent = new Date(n.sentAt!).getTime();
          return sum + (sent - created);
        }, 0) / sentNotifications.length
      : 0;

    return {
      totalSent,
      totalFailed,
      totalPending,
      averageDeliveryTimeMs,
      usersWithNotificationsEnabled: preferences.filter(p => p.emailEnabled && !p.optedOut).length,
      usersOptedOut: preferences.filter(p => p.optedOut).length,
      lastProcessedAt: new Date().toISOString()
    };
  }

  /**
   * Get user's notification logs
   */
  async getUserLogs(userId: string, limit = 50): Promise<NotificationLogEntry[]> {
    return this.logs
      .filter(log => log.userId === userId)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .slice(0, limit);
  }

  /**
   * Opt user out of email notifications
   */
  async optOut(userId: string): Promise<void> {
    const preferences = await this.getUserPreferences(userId) || this.createDefaultPreferences(userId);
    preferences.optedOut = true;
    preferences.emailEnabled = false;
    preferences.updatedAt = new Date().toISOString();
    
    this.userPreferences.set(userId, preferences);
    this.logger('info', `User ${userId} opted out of email notifications`);
  }

  /**
   * Cancel pending notifications for a user
   */
  async cancelPendingNotifications(userId: string): Promise<number> {
    let cancelledCount = 0;
    
    for (const notification of this.notifications.values()) {
      if (notification.userId === userId && (notification.status === 'pending' || notification.status === 'sending')) {
        notification.status = 'cancelled';
        notification.updatedAt = new Date().toISOString();
        
        this.logAction(
          userId,
          notification.emailAddress,
          notification.id,
          'cancelled',
          `Cancelled ${notification.notificationType} notification`
        );
        
        cancelledCount++;
      }
    }
    
    return cancelledCount;
  }
}