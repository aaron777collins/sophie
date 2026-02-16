import { MatrixClient } from 'matrix-js-sdk';

export interface PublicServer {
  roomId: string;
  name: string;
  topic: string;
  memberCount: number;
  avatarUrl?: string;
  language?: string;
  category?: string;
}

export class PublicServerDiscovery {
  private client: MatrixClient;

  constructor(client: MatrixClient) {
    this.client = client;
  }

  async searchPublicServers(options: {
    searchTerm?: string;
    category?: string;
    language?: string;
    minMemberCount?: number;
    maxResults?: number;
  }): Promise<PublicServer[]> {
    try {
      // TODO: Implement actual public server discovery
      // This is a placeholder implementation
      const publicRooms = await this.client.publicRooms({
        limit: options.maxResults || 50
      });

      return publicRooms.chunk.filter(room => {
        // Basic filtering logic
        const matchesTerm = !options.searchTerm || 
          room.name?.toLowerCase().includes(options.searchTerm.toLowerCase()) ||
          room.topic?.toLowerCase().includes(options.searchTerm.toLowerCase());
        
        const matchesCategory = !options.category || 
          room.topic?.toLowerCase().includes(options.category.toLowerCase());
        
        const matchesLanguage = !options.language || 
          room.topic?.toLowerCase().includes(options.language.toLowerCase());
        
        const meetsMinMemberCount = !options.minMemberCount || 
          (room.numJoinedMembers || 0) >= options.minMemberCount;

        return matchesTerm && matchesCategory && matchesLanguage && meetsMinMemberCount;
      }).map(room => ({
        roomId: room.roomId,
        name: room.name || 'Unnamed Server',
        topic: room.topic || '',
        memberCount: room.numJoinedMembers || 0,
        avatarUrl: room.avatarUrl,
        // TODO: Extract language and category from room metadata
      }));
    } catch (error) {
      console.error('Error searching public servers:', error);
      return [];
    }
  }

  async previewServer(roomId: string): Promise<PublicServer | null> {
    try {
      const roomState = await this.client.getRoomStateEvents(roomId, 'all');
      const nameEvent = roomState.find((e: any) => e.type === 'm.room.name');
      const topicEvent = roomState.find((e: any) => e.type === 'm.room.topic');

      return {
        roomId,
        name: nameEvent?.content?.name || 'Unnamed Server',
        topic: topicEvent?.content?.topic || '',
        memberCount: 0, // TODO: Fetch actual member count
      };
    } catch (error) {
      console.error('Error previewing server:', error);
      return null;
    }
  }

  async joinServer(roomId: string): Promise<boolean> {
    try {
      await this.client.joinRoom(roomId);
      return true;
    } catch (error) {
      console.error('Error joining server:', error);
      return false;
    }
  }
}