'use client';

import { MatrixClient, Room, RoomEvent, EventType, MsgType } from 'matrix-js-sdk';

// Discord-like features service for advanced functionality
export class DiscordFeaturesService {
  constructor(private client: MatrixClient) {}

  // File upload and media handling
  async uploadFile(file: File, channelId: string, progressCallback?: (progress: number) => void): Promise<string> {
    try {
      // Upload file to Matrix homeserver
      const upload = await this.client.uploadContent(file, {
        progressHandler: progressCallback ? (progress) => {
          const percentage = (progress.loaded / progress.total) * 100;
          progressCallback(percentage);
        } : undefined
      });

      // Send message with file attachment
      const content = {
        msgtype: this.getMessageTypeForFile(file),
        body: file.name,
        filename: file.name,
        info: {
          size: file.size,
          mimetype: file.type,
        },
        url: upload
      };

      // Add image/video specific info
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        content.info = {
          ...content.info,
          ...await this.getMediaInfo(file)
        };
      }

      const { event_id } = await this.client.sendMessage(channelId, content);
      return event_id;
    } catch (error) {
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Create thread (using Matrix's thread relation)
  async createThread(parentMessageId: string, channelId: string, content: string): Promise<string> {
    try {
      const threadContent = {
        msgtype: MsgType.Text,
        body: content,
        'm.relates_to': {
          rel_type: 'm.thread',
          event_id: parentMessageId
        }
      };

      const { event_id } = await this.client.sendMessage(channelId, threadContent);
      return event_id;
    } catch (error) {
      throw new Error(`Failed to create thread: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Slash commands simulation
  async handleSlashCommand(command: string, args: string[], channelId: string): Promise<void> {
    const room = this.client.getRoom(channelId);
    if (!room) throw new Error('Channel not found');

    switch (command) {
      case 'nick':
        await this.handleNickCommand(args[0], room);
        break;
      case 'kick':
        await this.handleKickCommand(args[0], args[1], room);
        break;
      case 'ban':
        await this.handleBanCommand(args[0], args[1], room);
        break;
      case 'mute':
        await this.handleMuteCommand(args[0], args[1], room);
        break;
      case 'topic':
        await this.handleTopicCommand(args.join(' '), room);
        break;
      case 'invite':
        await this.handleInviteCommand(args[0], room);
        break;
      default:
        throw new Error(`Unknown command: /${command}`);
    }
  }

  // Role management (using Matrix power levels)
  async assignRole(userId: string, roleLevel: number, channelId: string): Promise<void> {
    try {
      const room = this.client.getRoom(channelId);
      if (!room) throw new Error('Channel not found');

      const powerLevels = room.currentState.getStateEvents('m.room.power_levels', '')?.[0];
      if (!powerLevels) throw new Error('Unable to access power levels');

      const content = { ...powerLevels.getContent() };
      content.users = content.users || {};
      content.users[userId] = roleLevel;

      await this.client.sendStateEvent(channelId, 'm.room.power_levels', content, '');
    } catch (error) {
      throw new Error(`Failed to assign role: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Voice channel management
  async createVoiceChannel(serverId: string, name: string): Promise<string> {
    try {
      const { room_id } = await this.client.createRoom({
        name,
        preset: 'public_chat',
        parent_id: serverId,
        initial_state: [
          {
            type: 'im.vector.modular.widgets',
            state_key: 'voice',
            content: {
              type: 'jitsi',
              url: 'https://meet.element.io/#/$matrix_room_id',
              name: 'Voice Chat',
              data: {
                conferenceId: `${serverId}_${Date.now()}`,
                isAudioOnly: true,
                domain: 'meet.element.io'
              }
            }
          }
        ]
      });

      // Add to space
      await this.client.sendStateEvent(
        serverId,
        'm.space.child',
        {
          via: [this.client.getDomain()!],
          order: Date.now().toString()
        },
        room_id
      );

      return room_id;
    } catch (error) {
      throw new Error(`Failed to create voice channel: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Server boost simulation (using custom state events)
  async boostServer(serverId: string): Promise<void> {
    try {
      const boostEvent = {
        type: 'com.discord.boost',
        user_id: this.client.getUserId(),
        timestamp: Date.now(),
        boost_type: 'nitro'
      };

      await this.client.sendStateEvent(
        serverId,
        'com.discord.server_boosts',
        boostEvent,
        this.client.getUserId()!
      );
    } catch (error) {
      throw new Error(`Failed to boost server: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Emoji reactions with custom emoji support
  async addCustomReaction(messageId: string, channelId: string, emojiName: string, emojiUrl?: string): Promise<void> {
    try {
      const reactionKey = emojiUrl ? `mxc://${emojiUrl}` : emojiName;
      
      await this.client.sendEvent(channelId, 'm.reaction', {
        'm.relates_to': {
          rel_type: 'm.annotation',
          event_id: messageId,
          key: reactionKey
        }
      });
    } catch (error) {
      throw new Error(`Failed to add reaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Message formatting (Discord markdown to Matrix HTML)
  convertDiscordMarkdownToMatrix(content: string): { body: string; formatted_body?: string; format?: string } {
    let htmlContent = content;
    let hasFormatting = false;

    // Bold **text**
    htmlContent = htmlContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    if (htmlContent !== content) hasFormatting = true;

    // Italic *text*
    htmlContent = htmlContent.replace(/\*(.*?)\*/g, '<em>$1</em>');
    if (htmlContent !== content) hasFormatting = true;

    // Code `text`
    htmlContent = htmlContent.replace(/`(.*?)`/g, '<code>$1</code>');
    if (htmlContent !== content) hasFormatting = true;

    // Code block ```text```
    htmlContent = htmlContent.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    if (htmlContent !== content) hasFormatting = true;

    // Strikethrough ~~text~~
    htmlContent = htmlContent.replace(/~~(.*?)~~/g, '<del>$1</del>');
    if (htmlContent !== content) hasFormatting = true;

    // Underline __text__
    htmlContent = htmlContent.replace(/__(.*?)__/g, '<u>$1</u>');
    if (htmlContent !== content) hasFormatting = true;

    // Mentions @username
    htmlContent = htmlContent.replace(/@(\w+)/g, '<a href="https://matrix.to/#/$1">@$1</a>');
    if (htmlContent !== content) hasFormatting = true;

    // Channels #channel
    htmlContent = htmlContent.replace(/#(\w+)/g, '<a href="https://matrix.to/#/$1">#$1</a>');
    if (htmlContent !== content) hasFormatting = true;

    if (hasFormatting) {
      return {
        body: content,
        formatted_body: htmlContent,
        format: 'org.matrix.custom.html'
      };
    }

    return { body: content };
  }

  // Server templates (create server with predefined structure)
  async createServerFromTemplate(template: ServerTemplate): Promise<string> {
    try {
      // Create main server space
      const { room_id: serverId } = await this.client.createRoom({
        name: template.name,
        topic: template.description,
        preset: 'public_chat',
        creation_content: {
          type: 'm.space'
        }
      });

      // Create categories and channels
      for (const category of template.categories) {
        // Create channels in category
        for (const channelTemplate of category.channels) {
          const { room_id: channelId } = await this.client.createRoom({
            name: channelTemplate.name,
            topic: channelTemplate.topic,
            preset: 'public_chat',
            parent_id: serverId
          });

          // Add channel to space
          await this.client.sendStateEvent(
            serverId,
            'm.space.child',
            {
              via: [this.client.getDomain()!],
              order: channelTemplate.order?.toString() || Date.now().toString()
            },
            channelId
          );

          // Set channel permissions if specified
          if (channelTemplate.permissions) {
            await this.client.sendStateEvent(
              channelId,
              'm.room.power_levels',
              channelTemplate.permissions,
              ''
            );
          }
        }
      }

      return serverId;
    } catch (error) {
      throw new Error(`Failed to create server from template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Direct message handling
  async createDirectMessage(userId: string): Promise<string> {
    try {
      const { room_id } = await this.client.createRoom({
        preset: 'trusted_private_chat',
        invite: [userId],
        is_direct: true,
        initial_state: [
          {
            type: 'm.room.encryption',
            content: {
              algorithm: 'm.megolm.v1.aes-sha2'
            }
          }
        ]
      });

      // Mark as direct message
      const directRooms = this.client.getAccountData('m.direct')?.getContent() || {};
      directRooms[userId] = directRooms[userId] || [];
      directRooms[userId].push(room_id);
      
      await this.client.setAccountData('m.direct', directRooms);
      
      return room_id;
    } catch (error) {
      throw new Error(`Failed to create direct message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Helper methods
  private getMessageTypeForFile(file: File): string {
    if (file.type.startsWith('image/')) return 'm.image';
    if (file.type.startsWith('video/')) return 'm.video';
    if (file.type.startsWith('audio/')) return 'm.audio';
    return 'm.file';
  }

  private async getMediaInfo(file: File): Promise<any> {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const img = new Image();
        img.onload = () => {
          resolve({
            w: img.width,
            h: img.height
          });
        };
        img.onerror = () => resolve({});
        img.src = URL.createObjectURL(file);
      } else if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.onloadedmetadata = () => {
          resolve({
            w: video.videoWidth,
            h: video.videoHeight,
            duration: video.duration * 1000
          });
        };
        video.onerror = () => resolve({});
        video.src = URL.createObjectURL(file);
      } else {
        resolve({});
      }
    });
  }

  // Slash command handlers
  private async handleNickCommand(nickname: string, room: Room): Promise<void> {
    if (!nickname) throw new Error('Nickname required');
    await this.client.setDisplayName(nickname);
  }

  private async handleKickCommand(userId: string, reason: string = '', room: Room): Promise<void> {
    if (!userId) throw new Error('User ID required');
    await this.client.kick(room.roomId, userId, reason);
  }

  private async handleBanCommand(userId: string, reason: string = '', room: Room): Promise<void> {
    if (!userId) throw new Error('User ID required');
    await this.client.ban(room.roomId, userId, reason);
  }

  private async handleMuteCommand(userId: string, duration: string = '', room: Room): Promise<void> {
    if (!userId) throw new Error('User ID required');
    
    // Implement mute by setting power level to negative value temporarily
    const powerLevels = room.currentState.getStateEvents('m.room.power_levels', '')?.[0];
    if (!powerLevels) throw new Error('Unable to access power levels');

    const content = { ...powerLevels.getContent() };
    content.users = content.users || {};
    content.users[userId] = -1; // Muted user level

    await this.client.sendStateEvent(room.roomId, 'm.room.power_levels', content, '');
  }

  private async handleTopicCommand(topic: string, room: Room): Promise<void> {
    if (!topic) throw new Error('Topic required');
    await this.client.sendStateEvent(room.roomId, 'm.room.topic', { topic }, '');
  }

  private async handleInviteCommand(userId: string, room: Room): Promise<void> {
    if (!userId) throw new Error('User ID required');
    await this.client.invite(room.roomId, userId);
  }
}

// Server template types
export interface ServerTemplate {
  name: string;
  description: string;
  categories: CategoryTemplate[];
  icon?: string;
}

export interface CategoryTemplate {
  name: string;
  channels: ChannelTemplate[];
}

export interface ChannelTemplate {
  name: string;
  type: 'text' | 'voice';
  topic?: string;
  order?: number;
  permissions?: any;
}

// Predefined server templates
export const SERVER_TEMPLATES: Record<string, ServerTemplate> = {
  gaming: {
    name: 'Gaming Community',
    description: 'A community for gamers to connect and play together',
    categories: [
      {
        name: 'Welcome',
        channels: [
          { name: 'rules', type: 'text', topic: 'Server rules and guidelines' },
          { name: 'announcements', type: 'text', topic: 'Important server announcements' }
        ]
      },
      {
        name: 'General',
        channels: [
          { name: 'general-chat', type: 'text', topic: 'General discussion' },
          { name: 'introductions', type: 'text', topic: 'Introduce yourself here' }
        ]
      },
      {
        name: 'Gaming',
        channels: [
          { name: 'game-discussion', type: 'text', topic: 'Discuss your favorite games' },
          { name: 'looking-for-group', type: 'text', topic: 'Find teammates and groups' },
          { name: 'gaming-voice', type: 'voice' },
          { name: 'game-room-1', type: 'voice' }
        ]
      }
    ]
  },
  study: {
    name: 'Study Group',
    description: 'A place for students to collaborate and study together',
    categories: [
      {
        name: 'Information',
        channels: [
          { name: 'announcements', type: 'text', topic: 'Study group announcements' },
          { name: 'resources', type: 'text', topic: 'Helpful study resources' }
        ]
      },
      {
        name: 'Study',
        channels: [
          { name: 'general-study', type: 'text', topic: 'General study discussion' },
          { name: 'homework-help', type: 'text', topic: 'Get help with assignments' },
          { name: 'study-hall', type: 'voice' },
          { name: 'group-study', type: 'voice' }
        ]
      }
    ]
  },
  community: {
    name: 'Community Server',
    description: 'A general community server for socializing',
    categories: [
      {
        name: 'Welcome',
        channels: [
          { name: 'welcome', type: 'text', topic: 'Welcome new members!' },
          { name: 'rules', type: 'text', topic: 'Community guidelines' }
        ]
      },
      {
        name: 'Social',
        channels: [
          { name: 'general', type: 'text', topic: 'General chat' },
          { name: 'media', type: 'text', topic: 'Share photos and videos' },
          { name: 'voice-lounge', type: 'voice' }
        ]
      }
    ]
  }
};