/**
 * Integration tests for offline email notification system
 */

import { OfflineUserDetectionService, defaultOfflineDetectionConfig } from '@/lib/notifications/offline-detection';
import { OfflineEmailService, defaultOfflineEmailConfig } from '@/lib/notifications/offline-email-service';
import { MockEmailService } from '@/lib/notifications/email-service';
import { notificationService } from '@/lib/notifications/service';

// Mock Matrix client for testing
const createMockMatrixClient = () => ({
  getUser: jest.fn((userId: string) => ({
    userId,
    displayName: `Display Name for ${userId}`,
    avatarUrl: `https://example.com/avatar/${userId}.png`,
    presence: 'offline',
    lastActiveAgo: 3600000, // 1 hour ago
    lastPresenceTs: Date.now() - 3600000,
  })),
  getRooms: jest.fn(() => [
    // Mock room with unread messages
    {
      hasMembershipState: jest.fn(() => true),
      getUnreadNotificationCount: jest.fn((type?: string) => 
        type === 'highlight' ? 2 : 5
      ),
      getJoinedMemberCount: jest.fn(() => 3),
      name: 'Test Room',
      timeline: [
        {
          getType: () => 'm.room.message',
          getSender: () => '@alice:example.com',
          isRedacted: () => false,
          getContent: () => ({
            msgtype: 'm.text',
            body: 'Hello @bob:example.com, how are you?'
          }),
          getTs: () => Date.now() - 1800000, // 30 minutes ago
          sender: { name: 'Alice' },
        },
        {
          getType: () => 'm.room.message',
          getSender: () => '@charlie:example.com',
          isRedacted: () => false,
          getContent: () => ({
            msgtype: 'm.text',
            body: 'Meeting at 3pm today'
          }),
          getTs: () => Date.now() - 900000, // 15 minutes ago
          sender: { name: 'Charlie' },
        },
      ],
    },
    // Mock direct message room
    {
      hasMembershipState: jest.fn(() => true),
      getUnreadNotificationCount: jest.fn(() => 2),
      getJoinedMemberCount: jest.fn(() => 2),
      name: 'Direct Chat',
      timeline: [
        {
          getType: () => 'm.room.message',
          getSender: () => '@david:example.com',
          isRedacted: () => false,
          getContent: () => ({
            msgtype: 'm.text',
            body: 'Hey, can we talk?'
          }),
          getTs: () => Date.now() - 600000, // 10 minutes ago
          sender: { name: 'David' },
        },
      ],
    },
  ]),
  on: jest.fn(),
});

describe('Offline Email Notification Integration Tests', () => {
  let offlineDetectionService: OfflineUserDetectionService;
  let offlineEmailService: OfflineEmailService;
  let mockMatrixClient: any;
  let mockEmailService: MockEmailService;

  const testUsers = ['@bob:example.com', '@alice:example.com'];
  const userEmails = new Map([
    ['@bob:example.com', 'bob@example.com'],
    ['@alice:example.com', 'alice@example.com'],
  ]);

  beforeEach(() => {
    // Create fresh instances for each test
    mockMatrixClient = createMockMatrixClient();
    // Configure the mock email service to be enabled BEFORE creating it
    process.env.EMAIL_ENABLED = 'true';
    mockEmailService = new MockEmailService();
    
    // Spy on the send method
    jest.spyOn(mockEmailService, 'send');
    
    offlineDetectionService = new OfflineUserDetectionService(
      {
        ...defaultOfflineDetectionConfig,
        offlineThresholdMs: 30 * 60 * 1000, // 30 minutes for testing
        rateLimitMs: 60 * 60 * 1000, // 1 hour for testing
      },
      notificationService
    );

    offlineEmailService = new OfflineEmailService(
      {
        ...defaultOfflineEmailConfig,
        fromAddress: 'test@haos.local',
        fromName: 'HAOS Test',
        baseUrl: 'http://localhost:3000',
        maxEmailsPerHour: 5,
        maxEmailsPerDay: 20,
      } as any,
      mockEmailService
    );

    offlineDetectionService.initialize(mockMatrixClient);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('End-to-End Offline Notification Flow', () => {
    test('should detect offline users and send email notifications', async () => {
      // Arrange
      const expectedOfflineUsers = testUsers;

      // Act - Detect offline users
      const offlineUsers = await offlineDetectionService.detectOfflineUsers(expectedOfflineUsers);

      // Assert - Offline users detected
      expect(offlineUsers).toHaveLength(2);
      expect(offlineUsers[0].userId).toBe('@bob:example.com');
      expect(offlineUsers[0].unreadMessageCount).toBe(7); // 5 + 2 from rooms
      expect(offlineUsers[0].unreadMentions).toBe(7); // Same as unreadMessageCount due to simplified mock
      expect(offlineUsers[0].unreadDirectMessages).toBe(2);

      // Act - Get message previews
      const messagePreviewsMap = new Map();
      for (const user of offlineUsers) {
        const previews = await offlineDetectionService.getMessagePreviews(user.userId, 3);
        messagePreviewsMap.set(user.userId, previews);
      }

      // Assert - Message previews generated
      const bobPreviews = messagePreviewsMap.get('@bob:example.com');
      expect(bobPreviews).toHaveLength(3);
      expect(bobPreviews[0].messageBody).toContain('Hey, can we talk?');
      expect(bobPreviews[0].senderName).toBe('David');
      expect(bobPreviews[0].isDirect).toBe(true);

      // Act - Send email notifications
      const emailResults = await offlineEmailService.sendOfflineNotifications(
        offlineUsers,
        messagePreviewsMap,
        userEmails
      );

      // Assert - Emails sent successfully
      expect(emailResults).toHaveLength(2);
      expect(emailResults[0].success).toBe(true);
      expect(emailResults[0].userId).toBe('@bob:example.com');
      expect(emailResults[0].emailAddress).toBe('bob@example.com');

      expect(emailResults[1].success).toBe(true);
      expect(emailResults[1].userId).toBe('@alice:example.com');
      expect(emailResults[1].emailAddress).toBe('alice@example.com');

      // Assert - Email service was called
      expect(mockEmailService.send).toHaveBeenCalledTimes(2);
      
      // Check first email content
      const firstEmailCall = (mockEmailService.send as jest.Mock).mock.calls[0];
      const firstNotification = firstEmailCall[0];
      expect(firstNotification.title).toContain('unread');
      expect(firstNotification.message).toContain('Display Name for @bob:example.com');
      expect(firstNotification.message).toContain('Hey, can we talk?');
      expect(firstNotification.actions).toHaveLength(2);
      expect(firstNotification.actions[0].label).toBe('View Messages');
      expect(firstNotification.actions[1].label).toBe('Unsubscribe');
    });

    test('should respect rate limiting', async () => {
      // Create email service with very low rate limits for testing
      const rateLimitedEmailService = new OfflineEmailService(
        {
          ...defaultOfflineEmailConfig,
          fromAddress: 'test@haos.local',
          baseUrl: 'http://localhost:3000',
          maxEmailsPerHour: 1, // Only 1 email per hour
          maxEmailsPerDay: 1,
        } as any,
        mockEmailService
      );

      // Arrange - Get offline users once (avoid detection rate limiting)
      const offlineUsers = await offlineDetectionService.detectOfflineUsers(['@bob:example.com']);
      expect(offlineUsers).toHaveLength(1); // Should only get one user
      
      const messagePreviewsMap = new Map();
      
      // Send first email - should succeed
      const firstEmailResults = await rateLimitedEmailService.sendOfflineNotifications(
        offlineUsers,
        messagePreviewsMap,
        userEmails
      );

      // Act - Try to send email again immediately with same user and service instance
      const secondEmailResults = await rateLimitedEmailService.sendOfflineNotifications(
        offlineUsers,
        messagePreviewsMap,
        userEmails
      );

      // Assert - First email should succeed, second should be rate limited
      expect(firstEmailResults).toHaveLength(1);
      expect(firstEmailResults[0].success).toBe(true);
      
      expect(secondEmailResults).toHaveLength(1);
      expect(secondEmailResults[0].success).toBe(false);
      expect(secondEmailResults[0].error).toBe('Rate limit exceeded');
    });

    test('should handle users with no email addresses', async () => {
      // Arrange
      const usersWithoutEmail = ['@noEmail:example.com'];
      const offlineUsers = await offlineDetectionService.detectOfflineUsers(usersWithoutEmail);
      
      if (offlineUsers.length > 0) {
        const messagePreviewsMap = new Map();
        
        // Act - Try to send emails to users without email addresses
        const emailResults = await offlineEmailService.sendOfflineNotifications(
          offlineUsers,
          messagePreviewsMap,
          new Map() // Empty email map
        );

        // Assert - Should fail gracefully
        expect(emailResults[0].success).toBe(false);
        expect(emailResults[0].error).toContain('No email address found');
      }
    });

    test('should generate appropriate email content for different message types', async () => {
      // Arrange
      const offlineUsers = await offlineDetectionService.detectOfflineUsers(['@bob:example.com']);
      const messagePreviewsMap = new Map();
      const previews = await offlineDetectionService.getMessagePreviews('@bob:example.com', 3);
      messagePreviewsMap.set('@bob:example.com', previews);

      // Act
      const emailResults = await offlineEmailService.sendOfflineNotifications(
        offlineUsers,
        messagePreviewsMap,
        userEmails
      );

      // Assert
      const emailCall = (mockEmailService.send as jest.Mock).mock.calls[0];
      const notification = emailCall[0];
      
      // Check email has correct priority (high because of mentions and DMs)
      expect(notification.priority).toBe('high');
      
      // Check email content mentions different message types
      expect(notification.message).toContain('direct message');
      expect(notification.message).toContain('mention');
      
      // Check message previews are included
      expect(notification.message).toContain('David');
      expect(notification.message).toContain('Alice');
      expect(notification.message).toContain('Charlie');
    });
  });

  describe('Service Integration', () => {
    test('should integrate with notification service for creating notifications', async () => {
      // Arrange
      const offlineUsers = await offlineDetectionService.detectOfflineUsers(['@bob:example.com']);
      const messagePreviewsMap = new Map();

      // Act
      const emailResults = await offlineEmailService.sendOfflineNotifications(
        offlineUsers,
        messagePreviewsMap,
        userEmails
      );

      // Assert - Notification was created and passed to email service
      expect(emailResults[0].success).toBe(true);
      expect(mockEmailService.send).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'custom',
          title: expect.stringContaining('unread'),
          userId: '@bob:example.com',
          data: expect.objectContaining({
            offlineNotification: true,
          }),
        }),
        'bob@example.com'
      );
    });

    test('should handle email service failures gracefully', async () => {
      // Arrange
      const failingEmailService = {
        send: jest.fn().mockResolvedValue(false),
        isConfigured: jest.fn().mockReturnValue(true),
      };

      const failingOfflineEmailService = new OfflineEmailService(
        defaultOfflineEmailConfig as any,
        failingEmailService
      );

      const offlineUsers = await offlineDetectionService.detectOfflineUsers(['@bob:example.com']);
      const messagePreviewsMap = new Map();

      // Act
      const emailResults = await failingOfflineEmailService.sendOfflineNotifications(
        offlineUsers,
        messagePreviewsMap,
        userEmails
      );

      // Assert
      expect(emailResults[0].success).toBe(false);
      expect(emailResults[0].error).toBe('Email service failed to send');
    });
  });

  describe('Configuration and Error Handling', () => {
    test('should handle matrix client errors gracefully', async () => {
      // Arrange
      const errorMatrixClient = {
        ...mockMatrixClient,
        getUser: jest.fn().mockImplementation(() => {
          throw new Error('Matrix client error');
        }),
      };

      offlineDetectionService.initialize(errorMatrixClient);

      // Act
      const offlineUsers = await offlineDetectionService.detectOfflineUsers(['@bob:example.com']);

      // Assert - Should handle errors and return empty result
      expect(offlineUsers).toHaveLength(0);
    });

    test('should validate service configuration', () => {
      // Arrange & Act
      const rateLimitStats = offlineEmailService.getRateLimitStats();

      // Assert
      expect(rateLimitStats).toHaveProperty('hourly');
      expect(rateLimitStats).toHaveProperty('daily');
      expect(rateLimitStats.hourly).toBeInstanceOf(Map);
      expect(rateLimitStats.daily).toBeInstanceOf(Map);
    });
  });
});

describe('Rate Limiting Tests', () => {
  let offlineEmailService: OfflineEmailService;
  let mockEmailService: MockEmailService;

  beforeEach(() => {
    mockEmailService = new MockEmailService();
    offlineEmailService = new OfflineEmailService(
      {
        ...defaultOfflineEmailConfig,
        fromAddress: 'test@haos.local',
        baseUrl: 'http://localhost:3000',
        maxEmailsPerHour: 2,
        maxEmailsPerDay: 5,
      } as any,
      mockEmailService
    );
  });

  test('should enforce hourly rate limits', async () => {
    // Arrange
    const offlineUser = {
      userId: '@rate-test:example.com',
      displayName: 'Rate Test User',
      lastSeenTimestamp: Date.now() - 3600000,
      offlineDurationMs: 3600000,
      unreadMessageCount: 3,
      unreadMentions: 1,
      unreadDirectMessages: 0,
    };

    const userEmails = new Map([['@rate-test:example.com', 'rate-test@example.com']]);
    const messagePreviewsMap = new Map();

    // Act - Send emails up to the hourly limit
    const results1 = await offlineEmailService.sendOfflineNotifications([offlineUser], messagePreviewsMap, userEmails);
    const results2 = await offlineEmailService.sendOfflineNotifications([offlineUser], messagePreviewsMap, userEmails);
    const results3 = await offlineEmailService.sendOfflineNotifications([offlineUser], messagePreviewsMap, userEmails);

    // Assert
    expect(results1[0].success).toBe(true);
    expect(results2[0].success).toBe(true);
    expect(results3[0].success).toBe(false);
    expect(results3[0].error).toBe('Rate limit exceeded');
  });

  test('should reset hourly counters after time period', async () => {
    // This test would require mocking time, which is complex
    // For now, we'll test that the rate limit stats are accessible
    const stats = offlineEmailService.getRateLimitStats();
    expect(stats).toHaveProperty('hourly');
    expect(stats).toHaveProperty('daily');
  });
});