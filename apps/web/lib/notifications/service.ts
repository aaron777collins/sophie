/**
 * Core notification service implementation
 */

import { 
  Notification, 
  NotificationService, 
  NotificationFilter, 
  NotificationCounts, 
  NotificationSettings, 
  NotificationTemplate,
  NotificationEvent,
  NotificationDeliveryMethod,
  NotificationStatus,
  NotificationPriority,
  NotificationType
} from '@/lib/types/notification';

// In-memory storage for demonstration - in production this would be replaced with a database
class InMemoryNotificationStore {
  private notifications = new Map<string, Notification>();
  private settings = new Map<string, NotificationSettings>();
  private templates = new Map<string, NotificationTemplate>();
  private subscribers = new Map<string, ((event: NotificationEvent) => void)[]>();

  // Notifications
  async saveNotification(notification: Notification): Promise<Notification> {
    this.notifications.set(notification.id, { ...notification });
    return notification;
  }

  async getNotification(id: string): Promise<Notification | null> {
    return this.notifications.get(id) || null;
  }

  async getNotifications(filter: NotificationFilter): Promise<Notification[]> {
    let notifications = Array.from(this.notifications.values());

    // Apply filters
    if (filter.userId) {
      notifications = notifications.filter(n => n.userId === filter.userId);
    }
    if (filter.type?.length) {
      notifications = notifications.filter(n => filter.type!.includes(n.type));
    }
    if (filter.status?.length) {
      notifications = notifications.filter(n => filter.status!.includes(n.status));
    }
    if (filter.priority?.length) {
      notifications = notifications.filter(n => filter.priority!.includes(n.priority));
    }
    if (filter.serverId) {
      notifications = notifications.filter(n => n.serverId === filter.serverId);
    }
    if (filter.channelId) {
      notifications = notifications.filter(n => n.channelId === filter.channelId);
    }
    if (filter.dateFrom) {
      notifications = notifications.filter(n => n.createdAt >= filter.dateFrom!);
    }
    if (filter.dateTo) {
      notifications = notifications.filter(n => n.createdAt <= filter.dateTo!);
    }

    // Sort by creation date (newest first)
    notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Apply pagination
    if (filter.offset) {
      notifications = notifications.slice(filter.offset);
    }
    if (filter.limit) {
      notifications = notifications.slice(0, filter.limit);
    }

    return notifications;
  }

  async deleteNotification(id: string): Promise<boolean> {
    return this.notifications.delete(id);
  }

  // Settings
  async getSettings(userId: string): Promise<NotificationSettings | null> {
    return this.settings.get(userId) || null;
  }

  async saveSettings(settings: NotificationSettings): Promise<NotificationSettings> {
    this.settings.set(settings.userId, { ...settings });
    return settings;
  }

  // Templates
  async getTemplates(): Promise<NotificationTemplate[]> {
    return Array.from(this.templates.values());
  }

  async getTemplate(id: string): Promise<NotificationTemplate | null> {
    return this.templates.get(id) || null;
  }

  async saveTemplate(template: NotificationTemplate): Promise<NotificationTemplate> {
    this.templates.set(template.id, { ...template });
    return template;
  }

  // Event system
  subscribe(userId: string, callback: (event: NotificationEvent) => void): () => void {
    const userSubscribers = this.subscribers.get(userId) || [];
    userSubscribers.push(callback);
    this.subscribers.set(userId, userSubscribers);

    // Return unsubscribe function
    return () => {
      const subscribers = this.subscribers.get(userId) || [];
      const index = subscribers.indexOf(callback);
      if (index > -1) {
        subscribers.splice(index, 1);
        this.subscribers.set(userId, subscribers);
      }
    };
  }

  emit(userId: string, event: NotificationEvent): void {
    const subscribers = this.subscribers.get(userId) || [];
    subscribers.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in notification event callback:', error);
      }
    });
  }
}

export class NotificationServiceImpl implements NotificationService {
  private store = new InMemoryNotificationStore();

  constructor() {
    this.initializeDefaultTemplates();
  }

  private generateId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDefaultSettings(userId: string): NotificationSettings {
    return {
      userId,
      enableDesktopNotifications: true,
      enableSoundNotifications: true,
      enableEmailNotifications: false,
      enablePushNotifications: true,
      muteAllNotifications: false,
      quietHoursEnabled: false,
      timezone: 'UTC',
      typeSettings: {
        message: { enabled: true, deliveryMethods: ['in_app'], priority: 'normal' },
        mention: { enabled: true, deliveryMethods: ['in_app', 'push'], priority: 'high' },
        direct_message: { enabled: true, deliveryMethods: ['in_app', 'push'], priority: 'high' },
        voice_call: { enabled: true, deliveryMethods: ['in_app', 'push'], priority: 'urgent' },
        server_update: { enabled: true, deliveryMethods: ['in_app'], priority: 'normal' },
        role_update: { enabled: true, deliveryMethods: ['in_app'], priority: 'normal' },
        system: { enabled: true, deliveryMethods: ['in_app'], priority: 'normal' },
        custom: { enabled: true, deliveryMethods: ['in_app'], priority: 'normal' },
      },
      serverOverrides: {},
      updatedAt: new Date(),
    };
  }

  async create(notificationData: Omit<Notification, 'id' | 'createdAt' | 'updatedAt'>): Promise<Notification> {
    const now = new Date();
    const notification: Notification = {
      ...notificationData,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now,
      status: 'unread',
    };

    await this.store.saveNotification(notification);

    // Emit event
    this.store.emit(notification.userId, {
      type: 'notification_created',
      notification,
    });

    return notification;
  }

  async getById(id: string): Promise<Notification | null> {
    return this.store.getNotification(id);
  }

  async getByFilter(filter: NotificationFilter): Promise<Notification[]> {
    return this.store.getNotifications(filter);
  }

  async getCounts(userId: string): Promise<NotificationCounts> {
    const notifications = await this.store.getNotifications({ userId });

    const counts: NotificationCounts = {
      total: notifications.length,
      unread: notifications.filter(n => n.status === 'unread').length,
      byType: {} as Record<NotificationType, number>,
      byPriority: {} as Record<NotificationPriority, number>,
    };

    // Initialize counts
    const types: NotificationType[] = ['message', 'mention', 'direct_message', 'voice_call', 'server_update', 'role_update', 'system', 'custom'];
    const priorities: NotificationPriority[] = ['low', 'normal', 'high', 'urgent'];
    
    types.forEach(type => counts.byType[type] = 0);
    priorities.forEach(priority => counts.byPriority[priority] = 0);

    // Count notifications
    notifications.forEach(notification => {
      counts.byType[notification.type]++;
      counts.byPriority[notification.priority]++;
    });

    return counts;
  }

  async markAsRead(idOrIds: string | string[]): Promise<void> {
    const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];

    for (const id of ids) {
      const notification = await this.store.getNotification(id);
      if (notification && notification.status === 'unread') {
        const updated: Notification = {
          ...notification,
          status: 'read',
          readAt: new Date(),
          updatedAt: new Date(),
        };
        
        await this.store.saveNotification(updated);
        
        this.store.emit(notification.userId, {
          type: 'notification_read',
          notificationId: id,
        });
      }
    }
  }

  async dismiss(idOrIds: string | string[]): Promise<void> {
    const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];

    for (const id of ids) {
      const notification = await this.store.getNotification(id);
      if (notification) {
        const updated: Notification = {
          ...notification,
          status: 'dismissed',
          dismissedAt: new Date(),
          updatedAt: new Date(),
        };
        
        await this.store.saveNotification(updated);
        
        this.store.emit(notification.userId, {
          type: 'notification_dismissed',
          notificationId: id,
        });
      }
    }
  }

  async archive(id: string): Promise<void> {
    const notification = await this.store.getNotification(id);
    if (notification) {
      const updated: Notification = {
        ...notification,
        status: 'archived',
        updatedAt: new Date(),
      };
      
      await this.store.saveNotification(updated);
      
      this.store.emit(notification.userId, {
        type: 'notification_updated',
        notification: updated,
      });
    }
  }

  async clear(userId: string): Promise<number> {
    const notifications = await this.store.getNotifications({ userId });
    let clearedCount = 0;

    for (const notification of notifications) {
      if (notification.status !== 'archived') {
        await this.store.deleteNotification(notification.id);
        clearedCount++;
      }
    }

    this.store.emit(userId, {
      type: 'notifications_cleared',
      count: clearedCount,
    });

    return clearedCount;
  }

  async getSettings(userId: string): Promise<NotificationSettings> {
    let settings = await this.store.getSettings(userId);
    if (!settings) {
      settings = this.getDefaultSettings(userId);
      await this.store.saveSettings(settings);
    }
    return settings;
  }

  async updateSettings(userId: string, updates: Partial<NotificationSettings>): Promise<NotificationSettings> {
    const currentSettings = await this.getSettings(userId);
    const updatedSettings: NotificationSettings = {
      ...currentSettings,
      ...updates,
      userId, // Ensure userId is preserved
      updatedAt: new Date(),
    };

    await this.store.saveSettings(updatedSettings);

    this.store.emit(userId, {
      type: 'settings_updated',
      settings: updatedSettings,
    });

    return updatedSettings;
  }

  async getTemplates(): Promise<NotificationTemplate[]> {
    return this.store.getTemplates();
  }

  async createFromTemplate(templateId: string, variables: Record<string, string>, userId: string): Promise<Notification> {
    const template = await this.store.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template with id ${templateId} not found`);
    }

    // Replace variables in title and message
    let title = template.title;
    let message = template.message;

    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      title = title.replace(new RegExp(placeholder, 'g'), value);
      message = message.replace(new RegExp(placeholder, 'g'), value);
    });

    return this.create({
      type: template.type,
      title,
      message,
      priority: template.defaultPriority,
      status: 'unread',
      userId,
      deliveryMethods: template.defaultDeliveryMethods,
      icon: template.icon,
      data: { templateId, variables },
    });
  }

  subscribe(userId: string, callback: (event: NotificationEvent) => void): () => void {
    return this.store.subscribe(userId, callback);
  }

  private async initializeDefaultTemplates(): Promise<void> {
    const templates: NotificationTemplate[] = [
      {
        id: 'mention',
        name: 'Mention Notification',
        type: 'mention',
        title: '{{mentioner}} mentioned you',
        message: '{{mentioner}} mentioned you in {{channel}}',
        variables: ['mentioner', 'channel'],
        defaultDeliveryMethods: ['in_app', 'push'],
        defaultPriority: 'high',
        icon: '🔔',
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'direct_message',
        name: 'Direct Message',
        type: 'direct_message',
        title: 'Message from {{sender}}',
        message: '{{sender}}: {{message}}',
        variables: ['sender', 'message'],
        defaultDeliveryMethods: ['in_app', 'push'],
        defaultPriority: 'high',
        icon: '💬',
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'server_update',
        name: 'Server Update',
        type: 'server_update',
        title: 'Server Update: {{server}}',
        message: '{{update}} in {{server}}',
        variables: ['server', 'update'],
        defaultDeliveryMethods: ['in_app'],
        defaultPriority: 'normal',
        icon: '📢',
        isSystem: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    for (const template of templates) {
      await this.store.saveTemplate(template);
    }
  }
}

// Singleton instance
export const notificationService = new NotificationServiceImpl();