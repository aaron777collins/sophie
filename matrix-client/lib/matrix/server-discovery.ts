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
      // Get the room from the client's store
      const room = this.client.getRoom(roomId);
      
      if (room) {
        // Room is already in the client's store - use local state
        const currentState = room.currentState;
        
        const nameEvent = currentState.getStateEvents('m.room.name', '');
        const topicEvent = currentState.getStateEvents('m.room.topic', '');
        const avatarEvent = currentState.getStateEvents('m.room.avatar', '');
        const encryptionEvent = currentState.getStateEvents('m.room.encryption', '');
        const canonicalAliasEvent = currentState.getStateEvents('m.room.canonical_alias', '');
        
        const memberCount = room.getJoinedMemberCount() || 0;

        return {
          roomId,
          name: nameEvent?.getContent()?.name || room.name || 'Unnamed Server',
          topic: topicEvent?.getContent()?.topic || '',
          memberCount,
          avatarUrl: avatarEvent?.getContent()?.url,
          isEncrypted: !!encryptionEvent,
          canonicalAlias: canonicalAliasEvent?.getContent()?.alias,
          description: topicEvent?.getContent()?.topic || '',
        };
      }

      // Room not in store - try to get basic info from public rooms API
      try {
        const publicRooms = await this.client.publicRooms({
          limit: 1,
          filter: { generic_search_term: roomId }
        });
        
        const roomInfo = publicRooms.chunk.find(r => r.room_id === roomId);
        if (roomInfo) {
          return {
            roomId,
            name: roomInfo.name || 'Unnamed Server',
            topic: roomInfo.topic || '',
            memberCount: roomInfo.num_joined_members || 0,
            avatarUrl: roomInfo.avatar_url,
            description: roomInfo.topic || '',
          };
        }
      } catch (publicRoomError) {
        console.warn('Could not fetch public room info:', publicRoomError);
      }

      // Fallback - return minimal info
      return {
        roomId,
        name: 'Server Preview',
        topic: 'Unable to load full preview',
        memberCount: 0,
        description: '',
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
      // First try to get from room in store
      const room = this.client.getRoom(roomId);
      if (room) {
        return room.getJoinedMemberCount() || 0;
      }
      
      // Fallback: try public rooms API
      try {
        const publicRooms = await this.client.publicRooms({
          limit: 1,
          filter: { generic_search_term: roomId }
        });
        const roomInfo = publicRooms.chunk.find(r => r.room_id === roomId);
        if (roomInfo) {
          return roomInfo.num_joined_members || 0;
        }
      } catch (publicRoomError) {
        console.warn('Could not fetch public room info for member count:', publicRoomError);
      }
      
      return 0;
    } catch (error) {
      console.error('Error getting member count:', error);
      return 0;
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