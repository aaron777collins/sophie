import { createClient, MatrixClient } from 'matrix-js-sdk';

// TypeScript interfaces for server metadata
export interface MatrixServer {
  server_name: string;
  homeserver: string;
  description?: string;
  avatar_url?: string;
  user_count?: number;
  room_count?: number;
  country?: string;
  country_code?: string;
  state_list?: string[];
  tags?: string[];
  website?: string;
  matrix_id?: string;
  public?: boolean;
}

export interface ServerSearchFilters {
  query?: string;
  category?: string;
  country?: string;
  minUsers?: number;
  maxUsers?: number;
}

export interface ServerDiscoveryResult {
  servers: MatrixServer[];
  total: number;
  page: number;
  hasMore: boolean;
}

export interface CachedResult {
  data: ServerDiscoveryResult;
  timestamp: number;
  filters: ServerSearchFilters;
}

export class ServerDiscoveryService {
  private static instance: ServerDiscoveryService;
  private cache = new Map<string, CachedResult>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly API_BASE_URL = 'https://publiclist.anchel.nl';

  public static getInstance(): ServerDiscoveryService {
    if (!ServerDiscoveryService.instance) {
      ServerDiscoveryService.instance = new ServerDiscoveryService();
    }
    return ServerDiscoveryService.instance;
  }

  private constructor() {}

  /**
   * Generate a cache key from search filters
   */
  private getCacheKey(filters: ServerSearchFilters, page: number): string {
    return JSON.stringify({ ...filters, page });
  }

  /**
   * Check if cached result is still valid
   */
  private isCacheValid(cached: CachedResult): boolean {
    return Date.now() - cached.timestamp < this.CACHE_TTL;
  }

  /**
   * Fetch public servers from the anchel.nl API
   */
  private async fetchPublicServers(filters: ServerSearchFilters = {}, page: number = 1, limit: number = 20): Promise<ServerDiscoveryResult> {
    const params = new URLSearchParams();
    
    // Add pagination
    params.set('page', page.toString());
    params.set('limit', limit.toString());
    
    // Add search query if provided
    if (filters.query) {
      params.set('search', filters.query);
    }
    
    // Add category filter
    if (filters.category) {
      params.set('category', filters.category);
    }
    
    // Add country filter
    if (filters.country) {
      params.set('country', filters.country);
    }
    
    try {
      const response = await fetch(`${this.API_BASE_URL}/servers.json?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Transform the response to match our interface
      const servers: MatrixServer[] = Array.isArray(data.servers) ? data.servers.map((server: any) => ({
        server_name: server.server_name || server.homeserver,
        homeserver: server.homeserver || server.server_name,
        description: server.description || '',
        avatar_url: server.avatar_url,
        user_count: server.user_count || server.users || 0,
        room_count: server.room_count || server.rooms || 0,
        country: server.country,
        country_code: server.country_code,
        state_list: server.state_list || [],
        tags: server.tags || [],
        website: server.website,
        matrix_id: server.matrix_id,
        public: server.public !== false
      })) : [];
      
      // Apply client-side filters
      const filteredServers = this.applyClientFilters(servers, filters);
      
      return {
        servers: filteredServers,
        total: data.total || filteredServers.length,
        page,
        hasMore: data.hasMore || (page * limit < (data.total || filteredServers.length))
      };
    } catch (error) {
      console.error('Error fetching public servers:', error);
      
      // Return fallback data or empty result
      return this.getFallbackServers(filters, page);
    }
  }

  /**
   * Apply additional client-side filters
   */
  private applyClientFilters(servers: MatrixServer[], filters: ServerSearchFilters): MatrixServer[] {
    let filtered = servers;
    
    // Filter by minimum users
    if (filters.minUsers !== undefined) {
      filtered = filtered.filter(server => (server.user_count || 0) >= filters.minUsers!);
    }
    
    // Filter by maximum users
    if (filters.maxUsers !== undefined) {
      filtered = filtered.filter(server => (server.user_count || 0) <= filters.maxUsers!);
    }
    
    // Additional search filtering if API doesn't support it
    if (filters.query && filters.query.length > 0) {
      const searchTerm = filters.query.toLowerCase();
      filtered = filtered.filter(server => 
        server.server_name.toLowerCase().includes(searchTerm) ||
        (server.description && server.description.toLowerCase().includes(searchTerm)) ||
        (server.tags && server.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
      );
    }
    
    return filtered;
  }

  /**
   * Get fallback servers when API fails
   */
  private getFallbackServers(filters: ServerSearchFilters, page: number): ServerDiscoveryResult {
    const fallbackServers: MatrixServer[] = [
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
      },
      {
        server_name: 'kde.org',
        homeserver: 'kde.org',
        description: 'KDE Community Matrix server',
        user_count: 5000,
        room_count: 500,
        country: 'Germany',
        country_code: 'DE',
        tags: ['tech', 'kde', 'linux'],
        public: true
      }
    ];
    
    const filtered = this.applyClientFilters(fallbackServers, filters);
    
    return {
      servers: filtered,
      total: filtered.length,
      page,
      hasMore: false
    };
  }

  /**
   * Search public servers with caching
   */
  public async searchServers(
    filters: ServerSearchFilters = {}, 
    page: number = 1, 
    limit: number = 20
  ): Promise<ServerDiscoveryResult> {
    const cacheKey = this.getCacheKey(filters, page);
    const cached = this.cache.get(cacheKey);
    
    // Return cached result if valid
    if (cached && this.isCacheValid(cached)) {
      return cached.data;
    }
    
    try {
      // Fetch fresh data
      const result = await this.fetchPublicServers(filters, page, limit);
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
        filters
      });
      
      return result;
    } catch (error) {
      console.error('Server discovery error:', error);
      
      // Return cached data even if expired, or fallback
      if (cached) {
        return cached.data;
      }
      
      return this.getFallbackServers(filters, page);
    }
  }

  /**
   * Get server categories for filtering
   */
  public getServerCategories(): string[] {
    return [
      'general',
      'tech',
      'gaming',
      'social',
      'open-source',
      'business',
      'education',
      'community',
      'development',
      'linux',
      'privacy',
      'crypto',
      'art',
      'music',
      'science'
    ];
  }

  /**
   * Get popular servers (cached)
   */
  public async getPopularServers(limit: number = 10): Promise<MatrixServer[]> {
    const result = await this.searchServers({}, 1, limit);
    return result.servers
      .sort((a, b) => (b.user_count || 0) - (a.user_count || 0))
      .slice(0, limit);
  }

  /**
   * Clear cache
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Check if a server is reachable
   */
  public async checkServerHealth(homeserver: string): Promise<boolean> {
    try {
      // Create a temporary client to test server connectivity
      const client = createClient({
        baseUrl: `https://${homeserver}`
      });
      
      // Try to get server version info
      await client.getVersions();
      return true;
    } catch (error) {
      console.warn(`Server ${homeserver} appears to be unreachable:`, error);
      return false;
    }
  }
}

// Export singleton instance
export const serverDiscovery = ServerDiscoveryService.getInstance();