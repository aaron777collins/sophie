import { ServerDiscoveryService, MatrixServer, ServerSearchFilters } from '../apps/web/lib/matrix/server-discovery';

// Mock fetch globally
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock matrix-js-sdk
jest.mock('matrix-js-sdk', () => ({
  createClient: jest.fn().mockReturnValue({
    getVersions: jest.fn().mockResolvedValue({}),
  }),
}));

describe('ServerDiscoveryService', () => {
  let service: ServerDiscoveryService;
  
  beforeEach(() => {
    service = ServerDiscoveryService.getInstance();
    service.clearCache(); // Clear cache before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = ServerDiscoveryService.getInstance();
      const instance2 = ServerDiscoveryService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('searchServers', () => {
    const mockServerResponse = {
      servers: [
        {
          server_name: 'matrix.org',
          homeserver: 'matrix.org',
          description: 'The original Matrix homeserver',
          user_count: 1000000,
          room_count: 50000,
          country: 'United Kingdom',
          country_code: 'GB',
          tags: ['general', 'official'],
          public: true
        },
        {
          server_name: 'mozilla.org',
          homeserver: 'mozilla.org',
          description: 'Mozilla\'s Matrix homeserver',
          user_count: 10000,
          room_count: 1000,
          country: 'United States',
          country_code: 'US',
          tags: ['tech', 'open-source'],
          public: true
        }
      ],
      total: 2,
      hasMore: false
    };

    it('should fetch and return servers successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockServerResponse),
      } as Response);

      const result = await service.searchServers({}, 1, 10);
      
      expect(result.servers).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.hasMore).toBe(false);
      expect(result.servers[0].server_name).toBe('matrix.org');
    });

    it('should apply search query filter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockServerResponse),
      } as Response);

      const filters: ServerSearchFilters = { query: 'matrix' };
      await service.searchServers(filters, 1, 10);
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('search=matrix')
      );
    });

    it('should apply category filter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockServerResponse),
      } as Response);

      const filters: ServerSearchFilters = { category: 'tech' };
      await service.searchServers(filters, 1, 10);
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('category=tech')
      );
    });

    it('should apply country filter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockServerResponse),
      } as Response);

      const filters: ServerSearchFilters = { country: 'US' };
      await service.searchServers(filters, 1, 10);
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('country=US')
      );
    });

    it('should apply client-side minUsers filter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockServerResponse),
      } as Response);

      const filters: ServerSearchFilters = { minUsers: 50000 };
      const result = await service.searchServers(filters, 1, 10);
      
      expect(result.servers).toHaveLength(1);
      expect(result.servers[0].server_name).toBe('matrix.org');
    });

    it('should apply client-side maxUsers filter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockServerResponse),
      } as Response);

      const filters: ServerSearchFilters = { maxUsers: 50000 };
      const result = await service.searchServers(filters, 1, 10);
      
      expect(result.servers).toHaveLength(1);
      expect(result.servers[0].server_name).toBe('mozilla.org');
    });

    it('should return fallback servers when API fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await service.searchServers({}, 1, 10);
      
      expect(result.servers.length).toBeGreaterThan(0);
      expect(result.servers[0].server_name).toBe('matrix.org');
    });

    it('should handle non-200 HTTP responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      const result = await service.searchServers({}, 1, 10);
      
      // Should return fallback servers
      expect(result.servers.length).toBeGreaterThan(0);
      expect(result.servers[0].server_name).toBe('matrix.org');
    });
  });

  describe('Caching', () => {
    it('should cache search results', async () => {
      const mockResponse = {
        servers: [{ server_name: 'test.org', homeserver: 'test.org' }],
        total: 1,
        hasMore: false
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      // First call
      await service.searchServers({}, 1, 10);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second call should use cache
      await service.searchServers({}, 1, 10);
      expect(mockFetch).toHaveBeenCalledTimes(1); // Still 1 call
    });

    it('should respect cache TTL', async () => {
      jest.useFakeTimers();
      
      const mockResponse = {
        servers: [{ server_name: 'test.org', homeserver: 'test.org' }],
        total: 1,
        hasMore: false
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      // First call
      await service.searchServers({}, 1, 10);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Advance time beyond cache TTL (5 minutes)
      jest.advanceTimersByTime(6 * 60 * 1000);

      // Second call should make new request
      await service.searchServers({}, 1, 10);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should clear cache when requested', async () => {
      const mockResponse = {
        servers: [{ server_name: 'test.org', homeserver: 'test.org' }],
        total: 1,
        hasMore: false
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      // First call
      await service.searchServers({}, 1, 10);
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Clear cache
      service.clearCache();

      // Second call should make new request
      await service.searchServers({}, 1, 10);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('getServerCategories', () => {
    it('should return predefined categories', () => {
      const categories = service.getServerCategories();
      
      expect(categories).toContain('general');
      expect(categories).toContain('tech');
      expect(categories).toContain('gaming');
      expect(categories).toContain('social');
      expect(categories.length).toBeGreaterThan(5);
    });
  });

  describe('getPopularServers', () => {
    it('should return servers sorted by user count', async () => {
      const mockResponse = {
        servers: [
          { server_name: 'small.org', homeserver: 'small.org', user_count: 100 },
          { server_name: 'large.org', homeserver: 'large.org', user_count: 10000 },
          { server_name: 'medium.org', homeserver: 'medium.org', user_count: 1000 },
        ],
        total: 3,
        hasMore: false
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await service.getPopularServers(3);
      
      expect(result).toHaveLength(3);
      expect(result[0].server_name).toBe('large.org');
      expect(result[1].server_name).toBe('medium.org');
      expect(result[2].server_name).toBe('small.org');
    });

    it('should limit results to requested count', async () => {
      const mockResponse = {
        servers: Array.from({ length: 10 }, (_, i) => ({
          server_name: `server${i}.org`,
          homeserver: `server${i}.org`,
          user_count: 1000 - i * 100
        })),
        total: 10,
        hasMore: false
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await service.getPopularServers(5);
      
      expect(result).toHaveLength(5);
    });
  });

  describe('checkServerHealth', () => {
    const { createClient } = require('matrix-js-sdk');

    it('should return true for healthy server', async () => {
      const mockClient = {
        getVersions: jest.fn().mockResolvedValue({})
      };
      createClient.mockReturnValue(mockClient);

      const result = await service.checkServerHealth('matrix.org');
      
      expect(result).toBe(true);
      expect(createClient).toHaveBeenCalledWith({
        baseUrl: 'https://matrix.org',
        timeoutMs: 10000
      });
      expect(mockClient.getVersions).toHaveBeenCalled();
    });

    it('should return false for unhealthy server', async () => {
      const mockClient = {
        getVersions: jest.fn().mockRejectedValue(new Error('Connection failed'))
      };
      createClient.mockReturnValue(mockClient);

      const result = await service.checkServerHealth('unreachable.org');
      
      expect(result).toBe(false);
    });
  });

  describe('Client-side Filtering', () => {
    const testServers: MatrixServer[] = [
      {
        server_name: 'gaming.org',
        homeserver: 'gaming.org',
        description: 'A gaming community server',
        user_count: 5000,
        tags: ['gaming', 'community'],
        public: true
      },
      {
        server_name: 'tech.org',
        homeserver: 'tech.org',
        description: 'Technology discussions',
        user_count: 15000,
        tags: ['tech', 'programming'],
        public: true
      },
      {
        server_name: 'music.org',
        homeserver: 'music.org',
        description: 'Music lovers unite',
        user_count: 3000,
        tags: ['music', 'art'],
        public: true
      }
    ];

    it('should filter by search query in server name', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ servers: testServers, total: 3, hasMore: false }),
      } as Response);

      const result = await service.searchServers({ query: 'gaming' }, 1, 10);
      
      expect(result.servers).toHaveLength(1);
      expect(result.servers[0].server_name).toBe('gaming.org');
    });

    it('should filter by search query in description', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ servers: testServers, total: 3, hasMore: false }),
      } as Response);

      const result = await service.searchServers({ query: 'technology' }, 1, 10);
      
      expect(result.servers).toHaveLength(1);
      expect(result.servers[0].server_name).toBe('tech.org');
    });

    it('should filter by search query in tags', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ servers: testServers, total: 3, hasMore: false }),
      } as Response);

      const result = await service.searchServers({ query: 'programming' }, 1, 10);
      
      expect(result.servers).toHaveLength(1);
      expect(result.servers[0].server_name).toBe('tech.org');
    });
  });
});