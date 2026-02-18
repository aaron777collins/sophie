import { MatrixClient } from 'matrix-js-sdk';

export interface PublicServer {
  roomId: string;
  name: string;
  topic: string;
  memberCount: number;
  avatarUrl?: string;
  language?: string;
  category?: string;
  lastActivity?: Date;
  canonicalAlias?: string;
  isEncrypted?: boolean;
}

export interface SearchFilters {
  searchTerm?: string;
  topic?: string;
  minMemberCount?: number;
  maxMemberCount?: number;
  language?: string;
  isEncrypted?: boolean;
}

export interface SearchOptions extends SearchFilters {
  sortBy?: 'members' | 'recent' | 'name' | 'topic';
  sortDirection?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface SearchResults {
  servers: PublicServer[];
  totalCount: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ServerPreview extends PublicServer {
  description?: string;
  rules?: string;
  joinedMembers?: string[];
  recentMessages?: {
    sender: string;
    content: string;
    timestamp: Date;
  }[];
}

export class ServerDiscoveryService {
  private client: MatrixClient;

  constructor(client: MatrixClient) {
    this.client = client;
  }

  async searchServers(options: SearchOptions = {}): Promise<SearchResults> {
    const {
      searchTerm,
      topic,
      minMemberCount = 0,
      maxMemberCount,
      language,
      isEncrypted,
      sortBy = 'members',
      sortDirection = 'desc',
      page = 1,
      limit = 20
    } = options;

    try {
      // Fetch public rooms from Matrix server
      const publicRooms = await this.client.publicRooms({
        limit: limit * 2, // Fetch more than needed for filtering
        since: page > 1 ? this.generatePageToken(page, limit) : undefined
      });

      // Filter and transform servers
      let servers: PublicServer[] = publicRooms.chunk
        .filter(room => this.filterRoom(room, {
          searchTerm,
          topic,
          minMemberCount,
          maxMemberCount,
          language,
          isEncrypted
        }))
        .map(room => this.transformRoomToServer(room));

      // Sort servers
      servers = this.sortServers(servers, sortBy, sortDirection);

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const paginatedServers = servers.slice(startIndex, startIndex + limit);

      const totalCount = servers.length;
      const hasNext = startIndex + limit < totalCount;
      const hasPrevious = page > 1;

      return {
        servers: paginatedServers,
        totalCount,
        page,
        limit,
        hasNext,
        hasPrevious
      };
    } catch (error) {
      console.error('Error searching servers:', error);
      return {
        servers: [],
        totalCount: 0,
        page: 1,
        limit,
        hasNext: false,
        hasPrevious: false
      };
    }
  }

  async getServerPreview(roomId: string): Promise<ServerPreview | null> {
    try {
      // Get room state and information
      // TODO: Fix getRoomStateEvents method call - using placeholder for now
      const [roomState, roomSummary] = await Promise.all([
        Promise.resolve([]), // Placeholder until Matrix.js SDK method is fixed
        this.getPublicRoom(roomId)
      ]);

      // TODO: Fix these when roomState API is implemented correctly
      const nameEvent: any = null; // roomState.find((e: any) => e.type === 'm.room.name');
      const topicEvent: any = null; // roomState.find((e: any) => e.type === 'm.room.topic');
      const avatarEvent: any = null; // roomState.find((e: any) => e.type === 'm.room.avatar');
      const encryptionEvent: any = null; // roomState.find((e: any) => e.type === 'm.room.encryption');
      const canonicalAliasEvent: any = null; // roomState.find((e: any) => e.type === 'm.room.canonical_alias');

      // Get member count
      const memberCount = await this.getRoomMemberCount(roomId);

      return {
        roomId,
        name: nameEvent?.content?.name || roomSummary?.name || 'Unnamed Server',
        topic: topicEvent?.content?.topic || roomSummary?.topic || '',
        memberCount,
        avatarUrl: avatarEvent?.content?.url,
        isEncrypted: !!encryptionEvent,
        canonicalAlias: canonicalAliasEvent?.content?.alias,
        description: topicEvent?.content?.topic || '',
        // TODO: Fetch recent messages and member list if permissions allow
      };
    } catch (error) {
      console.error('Error getting server preview:', error);
      return null;
    }
  }

  async joinServer(roomId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await this.client.joinRoom(roomId);
      return { success: true };
    } catch (error: any) {
      console.error('Error joining server:', error);
      return {
        success: false,
        error: error.message || 'Failed to join server'
      };
    }
  }

  private filterRoom(room: any, filters: SearchFilters): boolean {
    const {
      searchTerm,
      topic,
      minMemberCount,
      maxMemberCount,
      language,
      isEncrypted
    } = filters;

    // Search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchesName = room.name?.toLowerCase().includes(term);
      const matchesTopic = room.topic?.toLowerCase().includes(term);
      const matchesAlias = room.canonical_alias?.toLowerCase().includes(term);
      
      if (!matchesName && !matchesTopic && !matchesAlias) {
        return false;
      }
    }

    // Topic filter
    if (topic && !room.topic?.toLowerCase().includes(topic.toLowerCase())) {
      return false;
    }

    // Member count filters
    const memberCount = room.num_joined_members || 0;
    if (minMemberCount && memberCount < minMemberCount) {
      return false;
    }
    if (maxMemberCount && memberCount > maxMemberCount) {
      return false;
    }

    // Language filter (simple implementation - can be enhanced)
    if (language && !room.topic?.toLowerCase().includes(language.toLowerCase())) {
      return false;
    }

    return true;
  }

  private transformRoomToServer(room: any): PublicServer {
    return {
      roomId: room.room_id,
      name: room.name || 'Unnamed Server',
      topic: room.topic || '',
      memberCount: room.num_joined_members || 0,
      avatarUrl: room.avatar_url,
      canonicalAlias: room.canonical_alias,
      // TODO: Extract language and category from room metadata or topic
      language: this.extractLanguageFromTopic(room.topic),
      category: this.extractCategoryFromTopic(room.topic),
    };
  }

  private sortServers(servers: PublicServer[], sortBy: string, direction: 'asc' | 'desc'): PublicServer[] {
    return servers.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'members':
          comparison = a.memberCount - b.memberCount;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'topic':
          comparison = (a.topic || '').localeCompare(b.topic || '');
          break;
        case 'recent':
          // TODO: Implement based on last activity
          comparison = 0;
          break;
        default:
          comparison = 0;
      }

      return direction === 'desc' ? -comparison : comparison;
    });
  }

  private generatePageToken(page: number, limit: number): string {
    // Simple implementation - in real scenario this would be a proper pagination token
    return `page_${page}_limit_${limit}`;
  }

  private async getPublicRoom(roomId: string): Promise<any> {
    try {
      const publicRooms = await this.client.publicRooms({ limit: 1000 });
      return publicRooms.chunk.find(room => room.room_id === roomId);
    } catch (error) {
      console.error('Error getting public room:', error);
      return null;
    }
  }

  private async getRoomMemberCount(roomId: string): Promise<number> {
    try {
      const roomSummary = await this.client.getRoomSummary(roomId);
      return (roomSummary as any)?.['m.joined_member_count'] || 0;
    } catch (error) {
      // Fallback to state events
      try {
        // TODO: Fix getRoomStateEvents method call
        const memberEvents: any[] = []; // await this.client.getRoomStateEvents(roomId, 'm.room.member');
        return memberEvents.filter((event: any) => event.content?.membership === 'join').length;
      } catch (fallbackError) {
        console.error('Error getting member count:', fallbackError);
        return 0;
      }
    }
  }

  private extractLanguageFromTopic(topic?: string): string | undefined {
    if (!topic) return undefined;
    
    const languages = ['english', 'spanish', 'french', 'german', 'chinese', 'japanese', 'russian', 'portuguese', 'arabic'];
    const lowerTopic = topic.toLowerCase();
    
    return languages.find(lang => lowerTopic.includes(lang));
  }

  private extractCategoryFromTopic(topic?: string): string | undefined {
    if (!topic) return undefined;
    
    const categories = ['tech', 'gaming', 'art', 'music', 'education', 'programming', 'language', 'general'];
    const lowerTopic = topic.toLowerCase();
    
    return categories.find(cat => lowerTopic.includes(cat));
  }
}