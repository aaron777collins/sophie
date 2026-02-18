import { ServerDiscoveryService, PublicServer, SearchOptions } from '../../../lib/matrix/server-discovery';

// Mock matrix-js-sdk
const mockMatrixClient = {
  publicRooms: jest.fn(),
  getRoomStateEvents: jest.fn(),
  joinRoom: jest.fn(),
  getRoomSummary: jest.fn(),
};

describe('ServerDiscoveryService', () => {
  let service: ServerDiscoveryService;

  beforeEach(() => {
    service = new ServerDiscoveryService(mockMatrixClient as any);
    jest.clearAllMocks();
  });

  describe('searchServers', () => {
    const mockPublicRoomsResponse = {
      chunk: [
        {
          room_id: '!room1:example.com',
          name: 'Gaming Community',
          topic: 'A place for gamers to chat',
          num_joined_members: 150,
          canonical_alias: '#gaming:example.com',
          avatar_url: 'mxc://example.com/avatar1'
        },
        {
          room_id: '!room2:example.com',
          name: 'Tech Talk',
          topic: 'Discussion about programming and technology',
          num_joined_members: 300,
          canonical_alias: '#tech:example.com'
        },
        {
          room_id: '!room3:example.com',
          name: 'Small Chat',
          topic: 'Small community for casual chat',
          num_joined_members: 5,
          canonical_alias: '#small:example.com'
        }
      ]
    };

    beforeEach(() => {
      mockMatrixClient.publicRooms.mockResolvedValue(mockPublicRoomsResponse);
    });

    it('should search servers with no filters', async () => {
      const result = await service.searchServers();

      expect(mockMatrixClient.publicRooms).toHaveBeenCalledWith({
        limit: 40,
        since: undefined
      });

      expect(result.servers).toHaveLength(3);
      expect(result.totalCount).toBe(3);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('should filter servers by search term', async () => {
      const options: SearchOptions = {
        searchTerm: 'gaming',
        limit: 20
      };

      const result = await service.searchServers(options);

      expect(result.servers).toHaveLength(1);
      expect(result.servers[0].name).toBe('Gaming Community');
    });

    it('should filter servers by minimum member count', async () => {
      const options: SearchOptions = {
        minMemberCount: 100,
        limit: 20
      };

      const result = await service.searchServers(options);

      expect(result.servers).toHaveLength(2);
      expect(result.servers.every(server => server.memberCount >= 100)).toBe(true);
    });

    it('should filter servers by topic', async () => {
      const options: SearchOptions = {
        topic: 'programming',
        limit: 20
      };

      const result = await service.searchServers(options);

      expect(result.servers).toHaveLength(1);
      expect(result.servers[0].name).toBe('Tech Talk');
    });

    it('should sort servers by member count descending by default', async () => {
      const result = await service.searchServers({ limit: 20 });

      expect(result.servers[0].memberCount).toBe(300);
      expect(result.servers[1].memberCount).toBe(150);
      expect(result.servers[2].memberCount).toBe(5);
    });

    it('should sort servers by member count ascending', async () => {
      const options: SearchOptions = {
        sortBy: 'members',
        sortDirection: 'asc',
        limit: 20
      };

      const result = await service.searchServers(options);

      expect(result.servers[0].memberCount).toBe(5);
      expect(result.servers[1].memberCount).toBe(150);
      expect(result.servers[2].memberCount).toBe(300);
    });

    it('should sort servers by name', async () => {
      const options: SearchOptions = {
        sortBy: 'name',
        sortDirection: 'asc',
        limit: 20
      };

      const result = await service.searchServers(options);

      expect(result.servers[0].name).toBe('Gaming Community');
      expect(result.servers[1].name).toBe('Small Chat');
      expect(result.servers[2].name).toBe('Tech Talk');
    });

    it('should handle pagination correctly', async () => {
      const options: SearchOptions = {
        page: 2,
        limit: 2
      };

      const result = await service.searchServers(options);

      expect(result.page).toBe(2);
      expect(result.servers).toHaveLength(1); // Only 1 server on page 2
      expect(result.hasPrevious).toBe(true);
      expect(result.hasNext).toBe(false);
    });

    it('should handle search errors gracefully', async () => {
      mockMatrixClient.publicRooms.mockRejectedValue(new Error('Network error'));

      const result = await service.searchServers();

      expect(result.servers).toHaveLength(0);
      expect(result.totalCount).toBe(0);
      expect(result.hasNext).toBe(false);
      expect(result.hasPrevious).toBe(false);
    });

    it('should transform room data to server format correctly', async () => {
      const result = await service.searchServers({ limit: 1 });

      const server = result.servers[0];
      expect(server).toEqual({
        roomId: '!room2:example.com',
        name: 'Tech Talk',
        topic: 'Discussion about programming and technology',
        memberCount: 300,
        avatarUrl: undefined, // This room doesn't have an avatar in the mock
        canonicalAlias: '#tech:example.com',
        language: undefined, // Mock doesn't extract language
        category: 'tech', // Extracted from topic
      });
    });
  });

  describe('getServerPreview', () => {
    const mockRoomStateEvents = [
      { type: 'm.room.name', content: { name: 'Test Server' } },
      { type: 'm.room.topic', content: { topic: 'Test topic' } },
      { type: 'm.room.avatar', content: { url: 'mxc://example.com/avatar' } },
      { type: 'm.room.canonical_alias', content: { alias: '#test:example.com' } }
    ];

    beforeEach(() => {
      mockMatrixClient.getRoomStateEvents.mockResolvedValue(mockRoomStateEvents);
      mockMatrixClient.getRoomSummary.mockResolvedValue({
        'm.joined_member_count': 100
      });
    });

    it('should get server preview successfully', async () => {
      const roomId = '!test:example.com';
      const preview = await service.getServerPreview(roomId);

      expect(mockMatrixClient.getRoomStateEvents).toHaveBeenCalledWith(roomId, '');
      expect(preview).toEqual({
        roomId,
        name: 'Test Server',
        topic: 'Test topic',
        memberCount: 100,
        avatarUrl: 'mxc://example.com/avatar',
        canonicalAlias: '#test:example.com',
        isEncrypted: false,
        description: 'Test topic'
      });
    });

    it('should handle missing room state events', async () => {
      mockMatrixClient.getRoomStateEvents.mockResolvedValue([]);
      mockMatrixClient.getRoomSummary.mockResolvedValue({});

      const roomId = '!test:example.com';
      const preview = await service.getServerPreview(roomId);

      expect(preview?.name).toBe('Unnamed Server');
      expect(preview?.topic).toBe('');
      expect(preview?.memberCount).toBe(0);
    });

    it('should detect encryption', async () => {
      const eventsWithEncryption = [
        ...mockRoomStateEvents,
        { type: 'm.room.encryption', content: { algorithm: 'm.megolm.v1.aes-sha2' } }
      ];
      mockMatrixClient.getRoomStateEvents.mockResolvedValue(eventsWithEncryption);

      const roomId = '!test:example.com';
      const preview = await service.getServerPreview(roomId);

      expect(preview?.isEncrypted).toBe(true);
    });

    it('should handle preview errors gracefully', async () => {
      mockMatrixClient.getRoomStateEvents.mockRejectedValue(new Error('Access denied'));

      const roomId = '!test:example.com';
      const preview = await service.getServerPreview(roomId);

      expect(preview).toBeNull();
    });
  });

  describe('joinServer', () => {
    it('should join server successfully', async () => {
      mockMatrixClient.joinRoom.mockResolvedValue({});

      const result = await service.joinServer('!test:example.com');

      expect(mockMatrixClient.joinRoom).toHaveBeenCalledWith('!test:example.com');
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should handle join errors', async () => {
      const joinError = new Error('Room not found');
      mockMatrixClient.joinRoom.mockRejectedValue(joinError);

      const result = await service.joinServer('!test:example.com');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Room not found');
    });

    it('should handle join errors without message', async () => {
      mockMatrixClient.joinRoom.mockRejectedValue({});

      const result = await service.joinServer('!test:example.com');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to join server');
    });
  });
});