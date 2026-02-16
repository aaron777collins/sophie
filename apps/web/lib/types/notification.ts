/**
 * Notification system types for HAOS
 */

export type NotificationType = 
  | 'message'
  | 'mention' 
  | 'direct_message'
  | 'voice_call'
  | 'server_update'
  | 'role_update'
  | 'system'
  | 'custom';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export type NotificationStatus = 'unread' | 'read' | 'dismissed' | 'archived';

export type NotificationDeliveryMethod = 'in_app' | 'email' | 'push' | 'all';

export interface NotificationAction {
  id: string;
  label: string;
  action: 'navigate' | 'dismiss' | 'archive' | 'custom';
  data?: Record<string, any>;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  status: NotificationStatus;
  userId: string;
  
  // Source information
  sourceId?: string; // Message ID, Server ID, etc.
  sourceType?: 'message' | 'server' | 'user' | 'system';
  channelId?: string;
  serverId?: string;
  
  // Metadata
  data?: Record<string, any>;
  actions?: NotificationAction[];
  
  // Delivery tracking
  deliveryMethods: NotificationDeliveryMethod[];
  deliveredAt?: {
    in_app?: Date;
    email?: Date;
    push?: Date;
  };
  
  // Timing
  createdAt: Date;
  updatedAt: Date;
  readAt?: Date;
  dismissedAt?: Date;
  expiresAt?: Date;
  
  // Display
  icon?: string;
  imageUrl?: string;
  avatarUrl?: string;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  title: string;
  message: string;
  
  // Template variables
  variables: string[];
  
  // Delivery settings
  defaultDeliveryMethods: NotificationDeliveryMethod[];
  defaultPriority: NotificationPriority;
  
  // Customization
  icon?: string;
  color?: string;
  sound?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  isSystem: boolean;
}

export interface NotificationSettings {
  userId: string;
  
  // Global settings
  enableDesktopNotifications: boolean;
  enableSoundNotifications: boolean;
  enableEmailNotifications: boolean;
  enablePushNotifications: boolean;
  muteAllNotifications: boolean;
  
  // Timing settings
  quietHoursEnabled: boolean;
  quietHoursStart?: string; // HH:MM format
  quietHoursEnd?: string; // HH:MM format
  timezone: string;
  
  // Type-specific settings
  typeSettings: Partial<Record<NotificationType, {
    enabled: boolean;
    deliveryMethods: NotificationDeliveryMethod[];
    priority: NotificationPriority;
    sound?: string;
  }>>;
  
  // Server-specific overrides
  serverOverrides: Record<string, {
    enabled: boolean;
    typeSettings?: Partial<Record<NotificationType, {
      enabled: boolean;
      deliveryMethods: NotificationDeliveryMethod[];
    }>>;
  }>;
  
  // Contact preferences
  emailAddress?: string;
  pushSubscription?: PushSubscription;
  
  updatedAt: Date;
}

export interface NotificationFilter {
  userId?: string;
  type?: NotificationType[];
  status?: NotificationStatus[];
  priority?: NotificationPriority[];
  serverId?: string;
  channelId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}

export interface NotificationCounts {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
  byPriority: Record<NotificationPriority, number>;
}

// Events for real-time notifications
export type NotificationEvent = 
  | { type: 'notification_created'; notification: Notification }
  | { type: 'notification_updated'; notification: Notification }
  | { type: 'notification_read'; notificationId: string }
  | { type: 'notification_dismissed'; notificationId: string }
  | { type: 'notifications_cleared'; count: number }
  | { type: 'settings_updated'; settings: NotificationSettings };

// Notification service interfaces
export interface NotificationService {
  // Core operations
  create(notification: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>): Promise<Notification>;
  getById(id: string): Promise<Notification | null>;
  getByFilter(filter: NotificationFilter): Promise<Notification[]>;
  getCounts(userId: string): Promise<NotificationCounts>;
  
  // Status updates
  markAsRead(id: string): Promise<void>;
  markAsRead(ids: string[]): Promise<void>;
  dismiss(id: string): Promise<void>;
  dismiss(ids: string[]): Promise<void>;
  archive(id: string): Promise<void>;
  clear(userId: string): Promise<number>;
  
  // Settings
  getSettings(userId: string): Promise<NotificationSettings>;
  updateSettings(userId: string, settings: Partial<NotificationSettings>): Promise<NotificationSettings>;
  
  // Templates
  getTemplates(): Promise<NotificationTemplate[]>;
  createFromTemplate(templateId: string, variables: Record<string, string>, userId: string): Promise<Notification>;
  
  // Real-time
  subscribe(userId: string, callback: (event: NotificationEvent) => void): () => void;
}

export interface EmailNotificationService {
  send(notification: Notification, recipient: string): Promise<boolean>;
  isConfigured(): boolean;
}

export interface PushNotificationService {
  send(notification: Notification, subscription: PushSubscription): Promise<boolean>;
  subscribe(subscription: PushSubscription): Promise<void>;
  unsubscribe(subscription: PushSubscription): Promise<void>;
  isSupported(): boolean;
}