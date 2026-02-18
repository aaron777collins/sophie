import { OfflineUserDetectionService } from '../../lib/services/offline-user-detection-service';
import { UserNotificationPreferences } from '../../lib/types/email-notifications';
import { MatrixClient } from 'matrix-js-sdk';

// Mock Matrix client
const mockMatrixClient = {
  on: jest.fn(),
  getRooms: jest.fn(),
  getUserId: jest.fn(),
  startClient: jest.fn(),
  stopClient: jest.fn()
} as unknown as MatrixClient;

// Mock Room
const mockRoom = {
  roomId: '!test:test.com',
  name: 'Test Room',
  getCanonicalAlias: jest.fn().mockReturnValue('#test:test.com'),
  isDmRoom: jest.fn().mockReturnValue(false),
  getMyMembership: jest.fn().mockReturnValue('join'),
  getUnreadNotificationCount: jest.fn().mockReturnValue(5),
  getJoinedMemberCount: jest.fn().mockReturnValue(3),
  getJoinedMembers: jest.fn().mockReturnValue([
    { userId: '@user1:test.com' },
    { userId: '@user2:test.com' }
  ])
};

const mockDirectRoom = {
  roomId: '!direct:test.com',
  name: '',
  getCanonicalAlias: jest.fn().mockReturnValue(null),
  isDmRoom: jest.fn().mockReturnValue(true),
  getMyMembership: jest.fn().mockReturnValue('join'),
  getUnreadNotificationCount: jest.fn().mockImplementation((type) => 
    type === 'highlight' ? 0 : 3
  ),
  getJoinedMemberCount: jest.fn().mockReturnValue(2),
  getJoinedMembers: jest.fn().mockReturnValue([
    { userId: '@user1:test.com' },
    { userId: '@other:test.com' }
  ])
};

describe('OfflineUserDetectionService', () => {
  let service: OfflineUserDetectionService;
  let mockLogger: jest.Mock;

  beforeEach(() => {
    mockLogger = jest.fn();
    service = new OfflineUserDetectionService(mockLogger);

    // Reset mock implementations
    jest.clearAllMocks();
    
    (mockMatrixClient.getRooms as jest.Mock).mockReturnValue([
      mockRoom,
      mockDirectRoom
    ]);
    (mockMatrixClient.getUserId as jest.Mock).mockReturnValue('@test:test.com');
  });

  describe('Initialization', () => {
    it('should initialize with Matrix client', () => {
      service.initialize(mockMatrixClient);

      expect(mockMatrixClient.on).toHaveBeenCalledWith('User.presence', expect.any(Function));
      expect(mockMatrixClient.on).toHaveBeenCalledWith('Room.timeline', expect.any(Function));
      expect(mockMatrixClient.on).toHaveBeenCalledWith('RoomMember.typing', expect.any(Function));
      expect(mockMatrixClient.on).toHaveBeenCalledWith('Room.receipt', expect.any(Function));
      
      expect(mockLogger).toHaveBeenCalledWith(
        'info',
        'Offline user detection service initialized'
      );
    });

    it('should set up event listeners', () => {
      service.initialize(mockMatrixClient);

      expect(mockLogger).toHaveBeenCalledWith(
        'info',
        'Matrix event listeners set up'
      );
    });
  });

  describe('User Presence Tracking', () => {
    beforeEach(() => {
      service.initialize(mockMatrixClient);
    });

    it('should manually mark user as offline', () => {
      const userId = '@test:test.com';
      const lastSeenAt = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(); // 2 hours ago

      service.markUserOffline(userId, lastSeenAt);

      const presence = service.getUserPresence(userId);
      expect(presence).not.toBeNull();
      expect(presence?.userId).toBe(userId);
      expect(presence?.presence).toBe('offline');
      expect(presence?.isActive).toBe(false);
      expect(presence?.lastSeenAt).toBe(lastSeenAt);
    });

    it('should manually mark user as online', () => {
      const userId = '@test:test.com';

      // First mark offline
      service.markUserOffline(userId);
      
      // Then mark online
      service.markUserOnline(userId);

      const presence = service.getUserPresence(userId);
      expect(presence?.presence).toBe('online');
      expect(presence?.isActive).toBe(true);
    });

    it('should return null for non-existent user presence', () => {
      const presence = service.getUserPresence('@nonexistent:test.com');
      expect(presence).toBeNull();
    });

    it('should return all tracked user presence', () => {
      service.markUserOffline('@user1:test.com');
      service.markUserOnline('@user2:test.com');

      const allPresence = service.getAllUserPresence();
      expect(allPresence).toHaveLength(2);
      expect(allPresence.some(p => p.userId === '@user1:test.com')).toBe(true);
      expect(allPresence.some(p => p.userId === '@user2:test.com')).toBe(true);
    });
  });

  describe('Offline User Detection', () => {
    let mockUserPreferences: UserNotificationPreferences[];

    beforeEach(() => {
      service.initialize(mockMatrixClient);

      // Reset mock return values for unread counts (they may have been changed by previous tests)
      (mockRoom.getUnreadNotificationCount as jest.Mock).mockReturnValue(5);
      (mockDirectRoom.getUnreadNotificationCount as jest.Mock).mockImplementation((type) => 
        type === 'highlight' ? 0 : 3
      );

      mockUserPreferences = [
        {
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
        },
        {
          userId: '@user2:test.com',
          emailEnabled: true,
          emailAddress: 'user2@example.com',
          offlineThresholdMinutes: 30,
          notificationTypes: {
            directMessages: true,
            mentions: false,
            invites: false,
            roomActivity: true
          },
          optedOut: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          userId: '@user3:test.com',
          emailEnabled: false,
          emailAddress: 'user3@example.com',
          offlineThresholdMinutes: 60,
          notificationTypes: {
            directMessages: false,
            mentions: false,
            invites: false,
            roomActivity: false
          },
          optedOut: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
    });

    it('should detect offline users with unread messages', async () => {
      // Mark users as offline with sufficient duration
      service.markUserOffline('@user1:test.com', new Date(Date.now() - 90 * 60 * 1000).toISOString()); // 90 min ago
      service.markUserOffline('@user2:test.com', new Date(Date.now() - 45 * 60 * 1000).toISOString()); // 45 min ago

      const offlineUsers = await service.detectOfflineUsers(mockUserPreferences);

      expect(offlineUsers).toHaveLength(2); // user1 and user2
      expect(offlineUsers.some(u => u.userId === '@user1:test.com')).toBe(true);
      expect(offlineUsers.some(u => u.userId === '@user2:test.com')).toBe(true);
      expect(offlineUsers.some(u => u.userId === '@user3:test.com')).toBe(false); // opted out
    });

    it('should skip users who are not offline long enough', async () => {
      // Mark user as offline but not long enough
      service.markUserOffline('@user1:test.com', new Date(Date.now() - 30 * 60 * 1000).toISOString()); // 30 min ago, threshold is 60

      const offlineUsers = await service.detectOfflineUsers(mockUserPreferences);

      expect(offlineUsers).toHaveLength(0);
    });

    it('should skip users with email disabled or opted out', async () => {
      service.markUserOffline('@user3:test.com', new Date(Date.now() - 120 * 60 * 1000).toISOString()); // 120 min ago

      const offlineUsers = await service.detectOfflineUsers(mockUserPreferences);

      expect(offlineUsers).toHaveLength(0); // user3 is opted out
    });

    it('should skip users with no unread messages', async () => {
      // Mock no unread messages
      (mockRoom.getUnreadNotificationCount as jest.Mock).mockReturnValue(0);
      (mockDirectRoom.getUnreadNotificationCount as jest.Mock).mockReturnValue(0);

      service.markUserOffline('@user1:test.com', new Date(Date.now() - 90 * 60 * 1000).toISOString());

      const offlineUsers = await service.detectOfflineUsers(mockUserPreferences);

      expect(offlineUsers).toHaveLength(0);
    });

    it('should skip active users', async () => {
      // Mark user as online/active
      service.markUserOnline('@user1:test.com');

      const offlineUsers = await service.detectOfflineUsers(mockUserPreferences);

      expect(offlineUsers).toHaveLength(0);
    });

    it('should return empty array when Matrix client not initialized', async () => {
      const uninitializedService = new OfflineUserDetectionService(mockLogger);
      
      const offlineUsers = await uninitializedService.detectOfflineUsers(mockUserPreferences);

      expect(offlineUsers).toHaveLength(0);
      expect(mockLogger).toHaveBeenCalledWith(
        'warn',
        'Matrix client not initialized, cannot detect offline users'
      );
    });

    it('should calculate offline duration correctly', async () => {
      const offlineTime = Date.now() - 150 * 60 * 1000; // 150 minutes ago
      service.markUserOffline('@user1:test.com', new Date(offlineTime).toISOString());

      const offlineUsers = await service.detectOfflineUsers(mockUserPreferences);

      expect(offlineUsers).toHaveLength(1);
      expect(offlineUsers[0].offlineDurationMinutes).toBeGreaterThanOrEqual(149);
      expect(offlineUsers[0].offlineDurationMinutes).toBeLessThanOrEqual(151);
    });

    it('should include notification preferences in offline user data', async () => {
      service.markUserOffline('@user1:test.com', new Date(Date.now() - 90 * 60 * 1000).toISOString());

      const offlineUsers = await service.detectOfflineUsers(mockUserPreferences);

      expect(offlineUsers).toHaveLength(1);
      expect(offlineUsers[0].notificationPreferences).toEqual(mockUserPreferences[0]);
    });
  });

  describe('Unread Message Summary', () => {
    beforeEach(() => {
      service.initialize(mockMatrixClient);

      // Reset mock return values for unread counts
      (mockRoom.getUnreadNotificationCount as jest.Mock).mockReturnValue(5);
      (mockDirectRoom.getUnreadNotificationCount as jest.Mock).mockImplementation((type) => 
        type === 'highlight' ? 0 : 3
      );
    });

    it('should categorize unread messages correctly', async () => {
      const userPrefs: UserNotificationPreferences[] = [{
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

      service.markUserOffline('@test:test.com', new Date(Date.now() - 90 * 60 * 1000).toISOString());

      const offlineUsers = await service.detectOfflineUsers(userPrefs);

      expect(offlineUsers).toHaveLength(1);
      
      const unreadMessages = offlineUsers[0].unreadMessages;
      expect(unreadMessages.directMessages).toBe(3); // From mockDirectRoom
      expect(unreadMessages.totalUnread).toBe(8); // 3 + 5 from both rooms
      expect(unreadMessages.rooms).toHaveLength(2);
      
      // Check room details
      const directRoomSummary = unreadMessages.rooms.find(r => r.hasDirectMessages);
      expect(directRoomSummary).toBeDefined();
      expect(directRoomSummary?.unreadCount).toBe(3);
      
      const regularRoomSummary = unreadMessages.rooms.find(r => !r.hasDirectMessages);
      expect(regularRoomSummary).toBeDefined();
      expect(regularRoomSummary?.unreadCount).toBe(5);
    });

    it('should handle rooms with mentions', async () => {
      // Mock room with mentions
      (mockRoom.getUnreadNotificationCount as jest.Mock).mockImplementation((type) =>
        type === 'highlight' ? 2 : 7 // 2 mentions out of 7 total
      );

      const userPrefs: UserNotificationPreferences[] = [{
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

      service.markUserOffline('@test:test.com', new Date(Date.now() - 90 * 60 * 1000).toISOString());

      const offlineUsers = await service.detectOfflineUsers(userPrefs);

      expect(offlineUsers).toHaveLength(1);
      
      const unreadMessages = offlineUsers[0].unreadMessages;
      expect(unreadMessages.mentions).toBe(2);
      
      const roomWithMentions = unreadMessages.rooms.find(r => r.hasMentions);
      expect(roomWithMentions).toBeDefined();
      expect(roomWithMentions?.hasMentions).toBe(true);
    });

    it('should handle invite rooms', async () => {
      const mockInviteRoom = {
        roomId: '!invite:test.com',
        name: 'Invite Room',
        getMyMembership: jest.fn().mockReturnValue('invite'),
        getUnreadNotificationCount: jest.fn().mockReturnValue(0)
      };

      (mockMatrixClient.getRooms as jest.Mock).mockReturnValue([
        mockRoom,
        mockDirectRoom,
        mockInviteRoom
      ]);

      const userPrefs: UserNotificationPreferences[] = [{
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

      service.markUserOffline('@test:test.com', new Date(Date.now() - 90 * 60 * 1000).toISOString());

      const offlineUsers = await service.detectOfflineUsers(userPrefs);

      expect(offlineUsers).toHaveLength(1);
      expect(offlineUsers[0].unreadMessages.invites).toBe(1);
    });
  });

  describe('Statistics', () => {
    beforeEach(() => {
      service.initialize(mockMatrixClient);
    });

    it('should provide offline statistics', () => {
      service.markUserOffline('@offline1:test.com');
      service.markUserOffline('@offline2:test.com');
      service.markUserOnline('@online1:test.com');

      const stats = service.getOfflineStats();

      expect(stats.totalTrackedUsers).toBe(3);
      expect(stats.onlineUsers).toBe(1);
      expect(stats.offlineUsers).toBe(2);
      expect(stats.unknownUsers).toBe(0);
      expect(stats.lastDetectionRun).toBeDefined();
    });
  });

  describe('Configuration', () => {
    it('should update configuration', () => {
      const newConfig = {
        defaultOfflineThresholdMinutes: 120,
        maxUsersToProcess: 50
      };

      service.updateConfig(newConfig);

      expect(mockLogger).toHaveBeenCalledWith(
        'info',
        'Updated offline detection service configuration',
        newConfig
      );
    });
  });

  describe('Cleanup', () => {
    beforeEach(() => {
      service.initialize(mockMatrixClient);
    });

    it('should cleanup old presence data', () => {
      // Add old presence data (31 days old)
      const oldDate = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString();
      service.markUserOffline('@old:test.com', oldDate);
      
      // Add recent presence data
      service.markUserOffline('@recent:test.com');

      const removedCount = service.cleanupOldPresenceData();

      expect(removedCount).toBe(1);
      expect(service.getUserPresence('@old:test.com')).toBeNull();
      expect(service.getUserPresence('@recent:test.com')).not.toBeNull();
    });

    it('should not cleanup recent presence data', () => {
      service.markUserOffline('@recent1:test.com');
      service.markUserOffline('@recent2:test.com');

      const removedCount = service.cleanupOldPresenceData();

      expect(removedCount).toBe(0);
      expect(service.getAllUserPresence()).toHaveLength(2);
    });
  });

  describe('Manual Detection Run', () => {
    beforeEach(() => {
      service.initialize(mockMatrixClient);
    });

    it('should run manual detection', async () => {
      const userPrefs: UserNotificationPreferences[] = [{
        userId: '@manual:test.com',
        emailEnabled: true,
        emailAddress: 'manual@example.com',
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
      }];

      service.markUserOffline('@manual:test.com', new Date(Date.now() - 90 * 60 * 1000).toISOString());

      const offlineUsers = await service.runDetection(userPrefs);

      expect(offlineUsers).toHaveLength(1);
      expect(mockLogger).toHaveBeenCalledWith(
        'info',
        'Running manual offline user detection'
      );
    });
  });

  describe('Shutdown', () => {
    it('should shutdown gracefully', () => {
      service.shutdown();

      expect(mockLogger).toHaveBeenCalledWith(
        'info',
        'Shutting down offline user detection service'
      );
    });
  });
});