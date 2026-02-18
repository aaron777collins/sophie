import { EmailNotificationService } from '../../lib/services/email-notification-service';
import { 
  EmailNotificationConfig, 
  UserNotificationPreferences, 
  OfflineUser,
  EmailNotificationData
} from '../../lib/types/email-notifications';

describe('EmailNotificationService', () => {
  let service: EmailNotificationService;
  let mockConfig: EmailNotificationConfig;
  let mockLogger: jest.Mock;

  beforeEach(() => {
    mockConfig = {
      enabled: true,
      defaultOfflineThresholdMinutes: 60,
      maxAttemptsPerNotification: 3,
      retryDelayMinutes: 15,
      batchSize: 10,
      rateLimitPerHour: 5,
      smtpConfig: {
        host: 'smtp.test.com',
        port: 587,
        secure: false,
        user: 'test@test.com',
        pass: 'testpass',
        from: 'noreply@test.com'
      },
      gdprCompliant: true,
      privacyPolicyUrl: 'https://test.com/privacy',
      unsubscribeUrl: 'https://test.com/unsubscribe'
    };

    mockLogger = jest.fn();
    service = new EmailNotificationService(mockConfig, mockLogger);
  });

  describe('User Preferences Management', () => {
    it('should get null for non-existent user preferences', async () => {
      const preferences = await service.getUserPreferences('@nonexistent:test.com');
      expect(preferences).toBeNull();
    });

    it('should create and update user preferences', async () => {
      const userId = '@test:test.com';
      const updates = {
        emailEnabled: true,
        emailAddress: 'test@example.com',
        offlineThresholdMinutes: 30
      };

      const result = await service.updateUserPreferences(userId, updates);

      expect(result.userId).toBe(userId);
      expect(result.emailEnabled).toBe(true);
      expect(result.emailAddress).toBe('test@example.com');
      expect(result.offlineThresholdMinutes).toBe(30);
      expect(result.updatedAt).toBeDefined();
    });

    it('should retrieve updated user preferences', async () => {
      const userId = '@test:test.com';
      await service.updateUserPreferences(userId, {
        emailAddress: 'updated@example.com'
      });

      const preferences = await service.getUserPreferences(userId);
      expect(preferences?.emailAddress).toBe('updated@example.com');
    });

    it('should opt out user from notifications', async () => {
      const userId = '@test:test.com';
      
      // First create preferences
      await service.updateUserPreferences(userId, {
        emailEnabled: true,
        emailAddress: 'test@example.com'
      });

      await service.optOut(userId);

      const preferences = await service.getUserPreferences(userId);
      expect(preferences?.optedOut).toBe(true);
      expect(preferences?.emailEnabled).toBe(false);
    });
  });

  describe('Email Validation', () => {
    it('should validate correct email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.org',
        'test+label@example.co.uk'
      ];

      validEmails.forEach(email => {
        const result = service.validateEmail(email);
        expect(result.isValid).toBe(true);
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        '',
        'invalid',
        'test@',
        '@example.com',
        'test..email@example.com'
      ];

      invalidEmails.forEach(email => {
        const result = service.validateEmail(email);
        expect(result.isValid).toBe(false);
        expect(result.error).toBeDefined();
      });
    });
  });

  describe('Notification Creation', () => {
    beforeEach(async () => {
      // Set up test user preferences
      await service.updateUserPreferences('@test:test.com', {
        emailEnabled: true,
        emailAddress: 'test@example.com'
      });
    });

    it('should create direct message notification', async () => {
      const notification = await service.createNotification(
        '@test:test.com',
        'test@example.com',
        'direct_message',
        {
          userName: 'test',
          unreadCount: 5,
          totalUnread: 10,
          offlineDuration: '2 hours'
        }
      );

      expect(notification.userId).toBe('@test:test.com');
      expect(notification.emailAddress).toBe('test@example.com');
      expect(notification.notificationType).toBe('direct_message');
      expect(notification.status).toBe('pending');
      expect(notification.subject).toContain('5 unread direct message');
    });

    it('should create mention notification', async () => {
      const notification = await service.createNotification(
        '@test:test.com',
        'test@example.com',
        'mention',
        {
          userName: 'test',
          mentionCount: 2,
          totalUnread: 8,
          offlineDuration: '1 hour'
        }
      );

      expect(notification.notificationType).toBe('mention');
      expect(notification.subject).toContain('mentioned 2 times');
    });

    it('should reject notification for opted-out user', async () => {
      await service.optOut('@test:test.com');

      await expect(
        service.createNotification(
          '@test:test.com',
          'test@example.com',
          'direct_message',
          {}
        )
      ).rejects.toThrow('User has opted out of email notifications');
    });

    it('should reject notification with invalid email', async () => {
      await expect(
        service.createNotification(
          '@test:test.com',
          'invalid-email',
          'direct_message',
          {}
        )
      ).rejects.toThrow('Invalid email address');
    });
  });

  describe('Offline User Processing', () => {
    let mockOfflineUsers: OfflineUser[];

    beforeEach(() => {
      mockOfflineUsers = [
        {
          userId: '@user1:test.com',
          lastSeenAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(), // 90 min ago
          offlineDurationMinutes: 90,
          unreadMessages: {
            directMessages: 3,
            mentions: 1,
            invites: 0,
            totalUnread: 10,
            rooms: [
              {
                roomId: '!room1:test.com',
                roomName: 'Test Room',
                unreadCount: 6,
                hasDirectMessages: false,
                hasMentions: false
              }
            ]
          },
          notificationPreferences: {
            userId: '@user1:test.com',
            emailEnabled: true,
            emailAddress: 'user1@example.com',
            offlineThresholdMinutes: 60,
            notificationTypes: {
              directMessages: true,
              mentions: true,
              invites: true,
              roomActivity: false
            },
            optedOut: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        },
        {
          userId: '@user2:test.com',
          lastSeenAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(), // 120 min ago
          offlineDurationMinutes: 120,
          unreadMessages: {
            directMessages: 0,
            mentions: 2,
            invites: 1,
            totalUnread: 5,
            rooms: [
              {
                roomId: '!room2:test.com',
                roomName: 'Another Room',
                unreadCount: 2,
                hasDirectMessages: false,
                hasMentions: true
              }
            ]
          },
          notificationPreferences: {
            userId: '@user2:test.com',
            emailEnabled: true,
            emailAddress: 'user2@example.com',
            offlineThresholdMinutes: 60,
            notificationTypes: {
              directMessages: true,
              mentions: true,
              invites: true,
              roomActivity: true
            },
            optedOut: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }
      ];
    });

    it('should process offline users and create notifications', async () => {
      await service.processOfflineUsers(mockOfflineUsers);

      const stats = await service.getStats();
      expect(stats.totalPending).toBeGreaterThan(0);
    });

    it('should skip processing when notifications are disabled', async () => {
      service = new EmailNotificationService(
        { ...mockConfig, enabled: false },
        mockLogger
      );

      await service.processOfflineUsers(mockOfflineUsers);

      const stats = await service.getStats();
      expect(stats.totalPending).toBe(0);
      expect(mockLogger).toHaveBeenCalledWith(
        'info',
        'Email notifications are disabled, skipping offline user processing'
      );
    });

    it('should create appropriate notifications based on user preferences', async () => {
      const user = mockOfflineUsers[0];
      
      // This user has directMessages and mentions enabled, but roomActivity disabled
      await service.processOfflineUsers([user]);

      const stats = await service.getStats();
      // Should create 2 notifications: direct_message and mention
      expect(stats.totalPending).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Template Processing', () => {
    it('should process templates with variable substitution', async () => {
      await service.updateUserPreferences('@test:test.com', {
        emailEnabled: true,
        emailAddress: 'test@example.com'
      });

      const notification = await service.createNotification(
        '@test:test.com',
        'test@example.com',
        'direct_message',
        {
          userName: 'TestUser',
          unreadCount: 3,
          totalUnread: 7,
          offlineDuration: '90 minutes'
        }
      );

      expect(notification.subject).toContain('3 unread direct message');
      expect(notification.templateData.userName).toBe('TestUser');
      expect(notification.templateData.unreadCount).toBe(3);
    });
  });

  describe('Rate Limiting', () => {
    it('should respect rate limiting for users', async () => {
      const userId = '@ratelimited:test.com';
      await service.updateUserPreferences(userId, {
        emailEnabled: true,
        emailAddress: 'ratelimited@example.com'
      });

      // Create multiple notifications quickly
      const notifications = [];
      for (let i = 0; i < 10; i++) {
        notifications.push(
          await service.createNotification(
            userId,
            'ratelimited@example.com',
            'direct_message',
            { unreadCount: i + 1 }
          )
        );
      }

      // Mock sending all notifications
      for (const notification of notifications) {
        notification.status = 'sent';
        notification.sentAt = new Date().toISOString();
      }

      // Try to process more offline users - should be rate limited
      const offlineUser: OfflineUser = {
        userId,
        lastSeenAt: new Date().toISOString(),
        offlineDurationMinutes: 90,
        unreadMessages: {
          directMessages: 1,
          mentions: 0,
          invites: 0,
          totalUnread: 1,
          rooms: []
        },
        notificationPreferences: {
          userId,
          emailEnabled: true,
          emailAddress: 'ratelimited@example.com',
          offlineThresholdMinutes: 60,
          notificationTypes: {
            directMessages: true,
            mentions: true,
            invites: true,
            roomActivity: false
          },
          optedOut: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };

      await service.processOfflineUsers([offlineUser]);

      // Should have logged rate limiting warning
      expect(mockLogger).toHaveBeenCalledWith(
        'warn',
        expect.stringContaining('is rate limited')
      );
    });
  });

  describe('Statistics', () => {
    it('should provide accurate statistics', async () => {
      const stats = await service.getStats();

      expect(stats).toHaveProperty('totalSent');
      expect(stats).toHaveProperty('totalFailed');
      expect(stats).toHaveProperty('totalPending');
      expect(stats).toHaveProperty('averageDeliveryTimeMs');
      expect(stats).toHaveProperty('usersWithNotificationsEnabled');
      expect(stats).toHaveProperty('usersOptedOut');
      expect(stats).toHaveProperty('lastProcessedAt');
    });
  });

  describe('Notification Cancellation', () => {
    it('should cancel pending notifications for a user', async () => {
      const userId = '@cancel:test.com';
      await service.updateUserPreferences(userId, {
        emailEnabled: true,
        emailAddress: 'cancel@example.com'
      });

      // Create some notifications
      await service.createNotification(userId, 'cancel@example.com', 'direct_message', {});
      await service.createNotification(userId, 'cancel@example.com', 'mention', {});

      const cancelledCount = await service.cancelPendingNotifications(userId);
      expect(cancelledCount).toBe(2);
    });
  });

  describe('Logging', () => {
    it('should log notification actions', async () => {
      const userId = '@logger:test.com';
      await service.updateUserPreferences(userId, {
        emailEnabled: true,
        emailAddress: 'logger@example.com'
      });

      await service.createNotification(
        userId,
        'logger@example.com',
        'direct_message',
        {}
      );

      const logs = await service.getUserLogs(userId);
      expect(logs.length).toBeGreaterThan(0);
      expect(logs[0].action).toBe('created');
      expect(logs[0].userId).toBe(userId);
    });

    it('should limit log entries returned', async () => {
      const userId = '@manyLogs:test.com';
      await service.updateUserPreferences(userId, {
        emailEnabled: true,
        emailAddress: 'manylogs@example.com'
      });

      // Create many notifications to generate logs
      for (let i = 0; i < 10; i++) {
        await service.createNotification(
          userId,
          'manylogs@example.com',
          'direct_message',
          {}
        );
      }

      const logs = await service.getUserLogs(userId, 5);
      expect(logs.length).toBe(5);
    });
  });
});