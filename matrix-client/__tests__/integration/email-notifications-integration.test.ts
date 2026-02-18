import { EmailNotificationService } from '../../lib/services/email-notification-service';
import { OfflineUserDetectionService } from '../../lib/services/offline-user-detection-service';
import { NotificationConfigService } from '../../lib/services/notification-config-service';
import { 
  UserNotificationPreferences, 
  OfflineUser,
  EmailNotificationConfig 
} from '../../lib/types/email-notifications';
import { MatrixClient } from 'matrix-js-sdk';

describe('Email Notifications Integration Tests', () => {
  let emailService: EmailNotificationService;
  let offlineDetectionService: OfflineUserDetectionService;
  let configService: NotificationConfigService;
  let mockConfig: EmailNotificationConfig;
  let mockMatrixClient: jest.Mocked<MatrixClient>;

  beforeEach(() => {
    // Reset singleton instance
    (NotificationConfigService as any).instance = null;
    
    // Mock environment for consistent testing
    process.env.EMAIL_NOTIFICATIONS_ENABLED = 'true';
    process.env.DEFAULT_OFFLINE_THRESHOLD_MINUTES = '60';
    process.env.MAX_NOTIFICATION_ATTEMPTS = '3';
    process.env.SMTP_HOST = 'smtp.test.com';
    process.env.SMTP_USER = 'test@test.com';
    process.env.SMTP_PASS = 'testpass';

    configService = NotificationConfigService.getInstance();
    mockConfig = configService.getConfig();

    emailService = new EmailNotificationService(mockConfig);
    offlineDetectionService = new OfflineUserDetectionService();

    // Mock Matrix client
    mockMatrixClient = {
      on: jest.fn(),
      getRooms: jest.fn().mockReturnValue([]),
      getUserId: jest.fn().mockReturnValue('@system:test.com'),
      startClient: jest.fn(),
      stopClient: jest.fn()
    } as any;

    offlineDetectionService.initialize(mockMatrixClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
    
    // Clean up environment
    delete process.env.EMAIL_NOTIFICATIONS_ENABLED;
    delete process.env.DEFAULT_OFFLINE_THRESHOLD_MINUTES;
    delete process.env.MAX_NOTIFICATION_ATTEMPTS;
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
  });

  describe('Complete Notification Flow', () => {
    it('should detect offline users and create notifications end-to-end', async () => {
      // Step 1: Set up user preferences
      const userPreferences: UserNotificationPreferences[] = [
        {
          userId: '@alice:test.com',
          emailEnabled: true,
          emailAddress: 'alice@example.com',
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
        },
        {
          userId: '@bob:test.com',
          emailEnabled: true,
          emailAddress: 'bob@example.com',
          offlineThresholdMinutes: 30,
          notificationTypes: {
            directMessages: false,
            mentions: true,
            invites: false,
            roomActivity: true
          },
          optedOut: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      // Step 2: Store preferences in email service
      for (const prefs of userPreferences) {
        await emailService.updateUserPreferences(prefs.userId, prefs);
      }

      // Step 3: Simulate offline users
      offlineDetectionService.markUserOffline(
        '@alice:test.com',
        new Date(Date.now() - 90 * 60 * 1000).toISOString() // 90 minutes ago
      );
      offlineDetectionService.markUserOffline(
        '@bob:test.com',
        new Date(Date.now() - 45 * 60 * 1000).toISOString() // 45 minutes ago
      );

      // Step 4: Mock Matrix rooms with unread messages
      const mockRooms = [
        {
          roomId: '!direct:test.com',
          name: '',
          getCanonicalAlias: () => null,
          isDmRoom: () => true,
          getMyMembership: () => 'join',
          getUnreadNotificationCount: (type?: string) => type === 'highlight' ? 0 : 3,
          getJoinedMembers: () => [
            { userId: '@alice:test.com' },
            { userId: '@other:test.com' }
          ]
        },
        {
          roomId: '!room:test.com',
          name: 'Test Room',
          getCanonicalAlias: () => '#test:test.com',
          isDmRoom: () => false,
          getMyMembership: () => 'join',
          getUnreadNotificationCount: (type?: string) => type === 'highlight' ? 2 : 5,
          getJoinedMembers: () => [
            { userId: '@alice:test.com' },
            { userId: '@bob:test.com' }
          ]
        }
      ];

      mockMatrixClient.getRooms.mockReturnValue(mockRooms as any);

      // Step 5: Detect offline users
      const offlineUsers = await offlineDetectionService.detectOfflineUsers(userPreferences);

      expect(offlineUsers).toHaveLength(2);
      
      const aliceOffline = offlineUsers.find(u => u.userId === '@alice:test.com');
      const bobOffline = offlineUsers.find(u => u.userId === '@bob:test.com');

      expect(aliceOffline).toBeDefined();
      expect(bobOffline).toBeDefined();
      
      expect(aliceOffline!.offlineDurationMinutes).toBeGreaterThan(85);
      expect(bobOffline!.offlineDurationMinutes).toBeGreaterThan(40);

      // Step 6: Process offline users and create notifications
      await emailService.processOfflineUsers(offlineUsers);

      // Step 7: Verify notifications were created
      const stats = await emailService.getStats();
      expect(stats.totalPending).toBeGreaterThan(0);

      // Alice should have direct message and mention notifications (roomActivity disabled)
      const aliceLogs = await emailService.getUserLogs('@alice:test.com');
      const aliceNotificationTypes = aliceLogs.map(log => 
        log.details.includes('direct_message') ? 'direct_message' :
        log.details.includes('mention') ? 'mention' : 'unknown'
      ).filter(type => type !== 'unknown');
      
      expect(aliceNotificationTypes).toContain('direct_message');
      expect(aliceNotificationTypes).toContain('mention');

      // Bob should have mention and room activity notifications (directMessages disabled)
      const bobLogs = await emailService.getUserLogs('@bob:test.com');
      const bobNotificationTypes = bobLogs.map(log => 
        log.details.includes('mention') ? 'mention' :
        log.details.includes('room_activity') ? 'room_activity' : 'unknown'
      ).filter(type => type !== 'unknown');
      
      expect(bobNotificationTypes).toContain('mention');
      expect(bobNotificationTypes).toContain('room_activity');
    });

    it('should respect user opt-out preferences', async () => {
      // Set up user who opts out mid-process
      const userPreferences: UserNotificationPreferences = {
        userId: '@opted_out:test.com',
        emailEnabled: true,
        emailAddress: 'optedout@example.com',
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
      };

      // Store preferences
      await emailService.updateUserPreferences(userPreferences.userId, userPreferences);

      // Mark user as offline
      offlineDetectionService.markUserOffline(
        '@opted_out:test.com',
        new Date(Date.now() - 90 * 60 * 1000).toISOString()
      );

      // Mock unread messages
      mockMatrixClient.getRooms.mockReturnValue([{
        roomId: '!test:test.com',
        name: 'Test',
        getCanonicalAlias: () => null,
        isDmRoom: () => true,
        getMyMembership: () => 'join',
        getUnreadNotificationCount: () => 3,
        getJoinedMembers: () => [{ userId: '@opted_out:test.com' }]
      }] as any);

      // User should be detected as offline initially
      let offlineUsers = await offlineDetectionService.detectOfflineUsers([userPreferences]);
      expect(offlineUsers).toHaveLength(1);

      // Now opt the user out
      await emailService.optOut('@opted_out:test.com');

      // Get updated preferences
      const updatedPrefs = await emailService.getUserPreferences('@opted_out:test.com');
      expect(updatedPrefs?.optedOut).toBe(true);

      // User should no longer be detected as needing notifications
      offlineUsers = await offlineDetectionService.detectOfflineUsers([updatedPrefs!]);
      expect(offlineUsers).toHaveLength(0);
    });

    it('should handle rate limiting correctly', async () => {
      const userId = '@rate_limited:test.com';
      const userPreferences: UserNotificationPreferences = {
        userId,
        emailEnabled: true,
        emailAddress: 'ratelimited@example.com',
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
      };

      // Store preferences
      await emailService.updateUserPreferences(userId, userPreferences);

      // Create many notifications quickly to hit rate limit
      for (let i = 0; i < 10; i++) {
        const notification = await emailService.createNotification(
          userId,
          'ratelimited@example.com',
          'direct_message',
          { unreadCount: i + 1 }
        );
        
        // Mark as sent to count towards rate limit
        notification.status = 'sent';
        notification.sentAt = new Date().toISOString();
      }

      // Now try to process offline user - should be rate limited
      offlineDetectionService.markUserOffline(
        userId,
        new Date(Date.now() - 90 * 60 * 1000).toISOString()
      );

      mockMatrixClient.getRooms.mockReturnValue([{
        roomId: '!test:test.com',
        name: 'Test',
        getCanonicalAlias: () => null,
        isDmRoom: () => true,
        getMyMembership: () => 'join',
        getUnreadNotificationCount: () => 1,
        getJoinedMembers: () => [{ userId }]
      }] as any);

      const offlineUsers = await offlineDetectionService.detectOfflineUsers([userPreferences]);
      expect(offlineUsers).toHaveLength(1);

      const initialNotificationCount = (await emailService.getStats()).totalPending;

      // Process should skip due to rate limiting
      await emailService.processOfflineUsers(offlineUsers);

      const finalNotificationCount = (await emailService.getStats()).totalPending;
      expect(finalNotificationCount).toBe(initialNotificationCount); // No new notifications created
    });

    it('should handle Matrix client disconnection gracefully', async () => {
      const userPreferences: UserNotificationPreferences[] = [{
        userId: '@test:test.com',
        emailEnabled: true,
        emailAddress: 'test@example.com',
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
      }];

      // Initialize new service without Matrix client
      const disconnectedService = new OfflineUserDetectionService();

      // Should handle gracefully without Matrix client
      const offlineUsers = await disconnectedService.detectOfflineUsers(userPreferences);
      expect(offlineUsers).toHaveLength(0);
    });
  });

  describe('Configuration Integration', () => {
    it('should respect configuration changes across services', async () => {
      // Update configuration to disable notifications
      configService.updateConfig({ enabled: false });
      const newConfig = configService.getConfig();

      // Create new service with updated config
      const disabledEmailService = new EmailNotificationService(newConfig);

      const userPreferences: UserNotificationPreferences = {
        userId: '@test:test.com',
        emailEnabled: true,
        emailAddress: 'test@example.com',
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
      };

      // Store preferences
      await disabledEmailService.updateUserPreferences(userPreferences.userId, userPreferences);

      // Mark user as offline
      offlineDetectionService.markUserOffline(
        '@test:test.com',
        new Date(Date.now() - 90 * 60 * 1000).toISOString()
      );

      // Mock unread messages
      mockMatrixClient.getRooms.mockReturnValue([{
        roomId: '!test:test.com',
        name: 'Test',
        getCanonicalAlias: () => null,
        isDmRoom: () => true,
        getMyMembership: () => 'join',
        getUnreadNotificationCount: () => 3,
        getJoinedMembers: () => [{ userId: '@test:test.com' }]
      }] as any);

      const offlineUsers = await offlineDetectionService.detectOfflineUsers([userPreferences]);
      expect(offlineUsers).toHaveLength(1);

      // Process should not create notifications when disabled
      await disabledEmailService.processOfflineUsers(offlineUsers);

      const stats = await disabledEmailService.getStats();
      expect(stats.totalPending).toBe(0);
    });

    it('should validate SMTP configuration before processing', () => {
      configService.updateConfig({
        smtpConfig: {
          host: '',
          port: 0,
          secure: false,
          user: '',
          pass: '',
          from: 'invalid-email'
        }
      });

      const validation = configService.validateSmtpConfig();
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);

      // In a real application, you would check this validation before
      // attempting to send emails and handle the error appropriately
    });
  });

  describe('Error Recovery and Resilience', () => {
    it('should handle individual user processing errors without stopping the batch', async () => {
      const userPreferences: UserNotificationPreferences[] = [
        {
          userId: '@good_user:test.com',
          emailEnabled: true,
          emailAddress: 'good@example.com',
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
        },
        {
          userId: '@bad_user:test.com',
          emailEnabled: true,
          emailAddress: 'invalid-email', // This will cause validation error
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
      ];

      // Store preferences
      for (const prefs of userPreferences) {
        await emailService.updateUserPreferences(prefs.userId, prefs);
      }

      // Mark users as offline
      offlineDetectionService.markUserOffline(
        '@good_user:test.com',
        new Date(Date.now() - 90 * 60 * 1000).toISOString()
      );
      offlineDetectionService.markUserOffline(
        '@bad_user:test.com',
        new Date(Date.now() - 90 * 60 * 1000).toISOString()
      );

      // Mock unread messages
      mockMatrixClient.getRooms.mockReturnValue([{
        roomId: '!test:test.com',
        name: 'Test',
        getCanonicalAlias: () => null,
        isDmRoom: () => true,
        getMyMembership: () => 'join',
        getUnreadNotificationCount: () => 3,
        getJoinedMembers: () => [
          { userId: '@good_user:test.com' },
          { userId: '@bad_user:test.com' }
        ]
      }] as any);

      const offlineUsers = await offlineDetectionService.detectOfflineUsers(userPreferences);
      expect(offlineUsers).toHaveLength(2);

      // Process should handle the error for bad_user but continue processing
      await emailService.processOfflineUsers(offlineUsers);

      // Good user should have logs, bad user should not
      const goodUserLogs = await emailService.getUserLogs('@good_user:test.com');
      const badUserLogs = await emailService.getUserLogs('@bad_user:test.com');

      expect(goodUserLogs.length).toBeGreaterThan(0);
      expect(badUserLogs.length).toBe(0); // No successful notifications due to invalid email
    });

    it('should track and report processing statistics accurately', async () => {
      const userPreferences: UserNotificationPreferences[] = [
        {
          userId: '@stats_user1:test.com',
          emailEnabled: true,
          emailAddress: 'stats1@example.com',
          offlineThresholdMinutes: 60,
          notificationTypes: {
            directMessages: true,
            mentions: false,
            invites: false,
            roomActivity: false
          },
          optedOut: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          userId: '@stats_user2:test.com',
          emailEnabled: false, // Disabled
          emailAddress: 'stats2@example.com',
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
      ];

      // Store preferences
      for (const prefs of userPreferences) {
        await emailService.updateUserPreferences(prefs.userId, prefs);
      }

      // Mark users as offline
      offlineDetectionService.markUserOffline(
        '@stats_user1:test.com',
        new Date(Date.now() - 90 * 60 * 1000).toISOString()
      );
      offlineDetectionService.markUserOffline(
        '@stats_user2:test.com',
        new Date(Date.now() - 90 * 60 * 1000).toISOString()
      );

      // Mock unread messages
      mockMatrixClient.getRooms.mockReturnValue([{
        roomId: '!direct:test.com',
        name: '',
        getCanonicalAlias: () => null,
        isDmRoom: () => true,
        getMyMembership: () => 'join',
        getUnreadNotificationCount: () => 2,
        getJoinedMembers: () => [
          { userId: '@stats_user1:test.com' },
          { userId: '@stats_user2:test.com' }
        ]
      }] as any);

      const initialStats = await emailService.getStats();

      const offlineUsers = await offlineDetectionService.detectOfflineUsers(userPreferences);
      // Only stats_user1 should be detected (stats_user2 has email disabled)
      expect(offlineUsers).toHaveLength(1);

      await emailService.processOfflineUsers(offlineUsers);

      const finalStats = await emailService.getStats();

      // Should have more pending notifications than before
      expect(finalStats.totalPending).toBeGreaterThan(initialStats.totalPending);
      expect(finalStats.usersWithNotificationsEnabled).toBe(1); // Only stats_user1
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle batch processing efficiently', async () => {
      // Create many users to test batch processing
      const userCount = 25;
      const userPreferences: UserNotificationPreferences[] = [];

      for (let i = 0; i < userCount; i++) {
        userPreferences.push({
          userId: `@user${i}:test.com`,
          emailEnabled: true,
          emailAddress: `user${i}@example.com`,
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
        });
      }

      // Store preferences (this would be a batch operation in a real database)
      const startTime = Date.now();
      
      for (const prefs of userPreferences) {
        await emailService.updateUserPreferences(prefs.userId, prefs);
        offlineDetectionService.markUserOffline(
          prefs.userId,
          new Date(Date.now() - 90 * 60 * 1000).toISOString()
        );
      }

      // Mock unread messages for all users
      const mockRooms = [{
        roomId: '!batch:test.com',
        name: 'Batch Test',
        getCanonicalAlias: () => null,
        isDmRoom: () => true,
        getMyMembership: () => 'join',
        getUnreadNotificationCount: () => 1,
        getJoinedMembers: () => userPreferences.map(u => ({ userId: u.userId }))
      }];

      mockMatrixClient.getRooms.mockReturnValue(mockRooms as any);

      const offlineUsers = await offlineDetectionService.detectOfflineUsers(userPreferences);
      expect(offlineUsers).toHaveLength(userCount);

      await emailService.processOfflineUsers(offlineUsers);

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      // Should process reasonably quickly (this is a rough benchmark)
      expect(processingTime).toBeLessThan(10000); // 10 seconds max for 25 users

      const stats = await emailService.getStats();
      expect(stats.totalPending).toBeGreaterThan(0);
    });
  });
});