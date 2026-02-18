/**
 * Types for email notification system
 */

export interface UserNotificationPreferences {
  userId: string;
  emailEnabled: boolean;
  offlineThresholdMinutes: number; // Default: 60 minutes
  notificationTypes: {
    directMessages: boolean;
    mentions: boolean;
    invites: boolean;
    roomActivity: boolean;
  };
  emailAddress?: string;
  lastEmailSent?: string; // ISO timestamp
  optedOut: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmailNotificationData {
  id: string;
  userId: string;
  emailAddress: string;
  notificationType: 'direct_message' | 'mention' | 'invite' | 'room_activity';
  subject: string;
  templateId: string;
  templateData: Record<string, any>;
  status: 'pending' | 'sending' | 'sent' | 'failed' | 'cancelled';
  attemptCount: number;
  maxAttempts: number;
  lastAttemptAt?: string;
  sentAt?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OfflineUser {
  userId: string;
  lastSeenAt: string;
  offlineDurationMinutes: number;
  unreadMessages: {
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
  };
  notificationPreferences: UserNotificationPreferences;
}

export interface EmailTemplate {
  id: string;
  name: string;
  type: 'direct_message' | 'mention' | 'invite' | 'room_activity';
  subject: string;
  htmlTemplate: string;
  textTemplate: string;
  variables: string[]; // List of template variables
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationLogEntry {
  id: string;
  userId: string;
  emailAddress: string;
  notificationId: string;
  action: 'created' | 'sent' | 'failed' | 'cancelled' | 'retried';
  details: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface EmailNotificationConfig {
  enabled: boolean;
  defaultOfflineThresholdMinutes: number;
  maxAttemptsPerNotification: number;
  retryDelayMinutes: number;
  batchSize: number; // How many notifications to process at once
  rateLimitPerHour: number; // Max emails per user per hour
  smtpConfig: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    from: string;
  };
  gdprCompliant: boolean;
  privacyPolicyUrl: string;
  unsubscribeUrl: string;
}

export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
}

export interface NotificationStats {
  totalSent: number;
  totalFailed: number;
  totalPending: number;
  averageDeliveryTimeMs: number;
  usersWithNotificationsEnabled: number;
  usersOptedOut: number;
  lastProcessedAt: string;
}