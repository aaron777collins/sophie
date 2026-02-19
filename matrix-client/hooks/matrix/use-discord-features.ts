'use client';

import { useCallback, useState, useEffect, useRef } from 'react';
import { useMatrixClient } from '@/lib/matrix/matrix-context';
import { DiscordFeaturesService, SERVER_TEMPLATES, ServerTemplate } from '@/lib/matrix/discord-features-service';
import { MessageData } from '@/lib/matrix/matrix-backend-hooks';

// Hook for file uploads with progress tracking
export function useFileUpload() {
  const client = useMatrixClient();
  const [uploads, setUploads] = useState<Map<string, FileUploadProgress>>(new Map());
  const serviceRef = useRef<DiscordFeaturesService | null>(null);

  useEffect(() => {
    if (client) {
      serviceRef.current = new DiscordFeaturesService(client);
    }
  }, [client]);

  const uploadFile = useCallback(async (
    file: File, 
    channelId: string,
    uploadId: string = crypto.randomUUID()
  ): Promise<string> => {
    if (!serviceRef.current) throw new Error('Discord features service not available');

    // Initialize upload progress
    setUploads(prev => new Map(prev.set(uploadId, {
      id: uploadId,
      file,
      channelId,
      progress: 0,
      status: 'uploading',
      error: null
    })));

    try {
      const messageId = await serviceRef.current.uploadFile(
        file,
        channelId,
        (progress) => {
          setUploads(prev => {
            const current = prev.get(uploadId);
            if (current) {
              return new Map(prev.set(uploadId, {
                ...current,
                progress
              }));
            }
            return prev;
          });
        }
      );

      // Mark as completed
      setUploads(prev => {
        const current = prev.get(uploadId);
        if (current) {
          return new Map(prev.set(uploadId, {
            ...current,
            status: 'completed',
            messageId
          }));
        }
        return prev;
      });

      return messageId;
    } catch (error) {
      // Mark as failed
      setUploads(prev => {
        const current = prev.get(uploadId);
        if (current) {
          return new Map(prev.set(uploadId, {
            ...current,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Upload failed'
          }));
        }
        return prev;
      });
      throw error;
    }
  }, []);

  const cancelUpload = useCallback((uploadId: string) => {
    setUploads(prev => {
      const newUploads = new Map(prev);
      newUploads.delete(uploadId);
      return newUploads;
    });
  }, []);

  const clearCompleted = useCallback(() => {
    setUploads(prev => {
      const newUploads = new Map();
      for (const [id, upload] of prev.entries()) {
        if (upload.status === 'uploading') {
          newUploads.set(id, upload);
        }
      }
      return newUploads;
    });
  }, []);

  return {
    uploads: Array.from(uploads.values()),
    uploadFile,
    cancelUpload,
    clearCompleted
  };
}

// Hook for slash commands
export function useSlashCommands() {
  const client = useMatrixClient();
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const serviceRef = useRef<DiscordFeaturesService | null>(null);

  useEffect(() => {
    if (client) {
      serviceRef.current = new DiscordFeaturesService(client);
    }
  }, [client]);

  const executeCommand = useCallback(async (input: string, channelId: string) => {
    if (!serviceRef.current) throw new Error('Discord features service not available');
    if (!input.startsWith('/')) throw new Error('Not a slash command');

    setIsExecuting(true);
    setLastError(null);

    try {
      const parts = input.slice(1).split(' ');
      const command = parts[0];
      const args = parts.slice(1);

      await serviceRef.current.handleSlashCommand(command, args, channelId);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Command execution failed';
      setLastError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsExecuting(false);
    }
  }, []);

  const getAvailableCommands = useCallback(() => {
    return [
      { name: 'nick', description: 'Change your nickname', usage: '/nick <new_nickname>' },
      { name: 'kick', description: 'Kick a user from the server', usage: '/kick <@user> [reason]' },
      { name: 'ban', description: 'Ban a user from the server', usage: '/ban <@user> [reason]' },
      { name: 'mute', description: 'Mute a user', usage: '/mute <@user> [duration]' },
      { name: 'topic', description: 'Change the channel topic', usage: '/topic <new_topic>' },
      { name: 'invite', description: 'Invite a user to the channel', usage: '/invite <@user>' }
    ];
  }, []);

  return {
    executeCommand,
    getAvailableCommands,
    isExecuting,
    lastError
  };
}

// Hook for managing threads
export function useThreads(channelId: string) {
  const client = useMatrixClient();
  const [threads, setThreads] = useState<Map<string, ThreadData>>(new Map());
  const [loading, setLoading] = useState(false);
  const serviceRef = useRef<DiscordFeaturesService | null>(null);

  useEffect(() => {
    if (client) {
      serviceRef.current = new DiscordFeaturesService(client);
    }
  }, [client]);

  const createThread = useCallback(async (parentMessageId: string, content: string): Promise<string> => {
    if (!serviceRef.current) throw new Error('Discord features service not available');

    try {
      const threadMessageId = await serviceRef.current.createThread(parentMessageId, channelId, content);
      
      // Update threads state
      setThreads(prev => {
        const existing = prev.get(parentMessageId) || {
          parentMessageId,
          messageCount: 0,
          participants: [],
          lastActivity: Date.now()
        };

        return new Map(prev.set(parentMessageId, {
          ...existing,
          messageCount: existing.messageCount + 1,
          lastActivity: Date.now()
        }));
      });

      return threadMessageId;
    } catch (error) {
      throw new Error(`Failed to create thread: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [channelId]);

  const getThread = useCallback((parentMessageId: string) => {
    return threads.get(parentMessageId);
  }, [threads]);

  const loadThreads = useCallback(async () => {
    if (!client) return;

    setLoading(true);
    try {
      const room = client.getRoom(channelId);
      if (!room) return;

      // Load thread information from Matrix timeline
      const timeline = room.getLiveTimeline();
      const events = timeline.getEvents();
      const threadMap = new Map<string, ThreadData>();

      for (const event of events) {
        const relation = event.getRelation();
        if (relation && relation.rel_type === 'm.thread') {
          const parentId = relation.event_id;
          const existing = threadMap.get(parentId) || {
            parentMessageId: parentId,
            messageCount: 0,
            participants: [],
            lastActivity: 0
          };

          threadMap.set(parentId, {
            ...existing,
            messageCount: existing.messageCount + 1,
            lastActivity: Math.max(existing.lastActivity, event.getTs()),
            participants: Array.from(new Set([...existing.participants, event.getSender()!]))
          });
        }
      }

      setThreads(threadMap);
    } catch (error) {
      console.error('Failed to load threads:', error);
    } finally {
      setLoading(false);
    }
  }, [client, channelId]);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  return {
    threads: Array.from(threads.values()),
    createThread,
    getThread,
    loading,
    refresh: loadThreads
  };
}

// Hook for server templates
export function useServerTemplates() {
  const client = useMatrixClient();
  const [isCreating, setIsCreating] = useState(false);
  const serviceRef = useRef<DiscordFeaturesService | null>(null);

  useEffect(() => {
    if (client) {
      serviceRef.current = new DiscordFeaturesService(client);
    }
  }, [client]);

  const createServerFromTemplate = useCallback(async (templateKey: string, serverName?: string): Promise<string> => {
    if (!serviceRef.current) throw new Error('Discord features service not available');

    const template = SERVER_TEMPLATES[templateKey];
    if (!template) throw new Error(`Template ${templateKey} not found`);

    setIsCreating(true);
    try {
      const customizedTemplate = {
        ...template,
        name: serverName || template.name
      };

      const serverId = await serviceRef.current.createServerFromTemplate(customizedTemplate);
      return serverId;
    } catch (error) {
      throw new Error(`Failed to create server from template: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreating(false);
    }
  }, []);

  const getAvailableTemplates = useCallback(() => {
    return Object.entries(SERVER_TEMPLATES).map(([key, template]) => ({
      key,
      name: template.name,
      description: template.description,
      categories: template.categories.length,
      channels: template.categories.reduce((sum, cat) => sum + cat.channels.length, 0)
    }));
  }, []);

  const getTemplate = useCallback((templateKey: string) => {
    return SERVER_TEMPLATES[templateKey];
  }, []);

  return {
    createServerFromTemplate,
    getAvailableTemplates,
    getTemplate,
    isCreating
  };
}

// Hook for voice channels
export function useVoiceChannels(serverId: string) {
  const client = useMatrixClient();
  const [voiceChannels, setVoiceChannels] = useState<VoiceChannelData[]>([]);
  const [connectedChannel, setConnectedChannel] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const serviceRef = useRef<DiscordFeaturesService | null>(null);

  useEffect(() => {
    if (client) {
      serviceRef.current = new DiscordFeaturesService(client);
    }
  }, [client]);

  const createVoiceChannel = useCallback(async (name: string): Promise<string> => {
    if (!serviceRef.current) throw new Error('Discord features service not available');

    try {
      const channelId = await serviceRef.current.createVoiceChannel(serverId, name);
      await loadVoiceChannels();
      return channelId;
    } catch (error) {
      throw new Error(`Failed to create voice channel: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [serverId]);

  const joinVoiceChannel = useCallback(async (channelId: string) => {
    setIsConnecting(true);
    try {
      // Join the Matrix room
      if (!client?.getRoom(channelId)) {
        await client?.joinRoom(channelId);
      }

      setConnectedChannel(channelId);
      
      // Update channel user count
      setVoiceChannels(prev => prev.map(channel => 
        channel.id === channelId 
          ? { ...channel, connectedUsers: channel.connectedUsers + 1 }
          : channel
      ));
    } catch (error) {
      throw new Error(`Failed to join voice channel: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsConnecting(false);
    }
  }, [client]);

  const leaveVoiceChannel = useCallback(async () => {
    if (!connectedChannel) return;

    try {
      setConnectedChannel(null);
      
      // Update channel user count
      setVoiceChannels(prev => prev.map(channel => 
        channel.id === connectedChannel 
          ? { ...channel, connectedUsers: Math.max(0, channel.connectedUsers - 1) }
          : channel
      ));
    } catch (error) {
      console.error('Failed to leave voice channel:', error);
    }
  }, [connectedChannel]);

  const loadVoiceChannels = useCallback(async () => {
    if (!client) return;

    try {
      const server = client.getRoom(serverId);
      if (!server) return;

      const childEvents = server.currentState.getStateEvents('m.space.child');
      const channels: VoiceChannelData[] = [];

      for (const event of childEvents) {
        const childRoomId = event.getStateKey();
        if (!childRoomId) continue;

        const childRoom = client.getRoom(childRoomId);
        if (!childRoom) continue;

        // Check if it's a voice channel
        const widgets = childRoom.currentState.getStateEvents('im.vector.modular.widgets');
        const isVoiceChannel = widgets.some(w => w.getContent()?.type === 'jitsi');

        if (isVoiceChannel) {
          channels.push({
            id: childRoomId,
            name: childRoom.name || 'Voice Channel',
            connectedUsers: childRoom.getJoinedMemberCount(),
            userLimit: 0, // No limit by default
            bitrate: 64000 // Default bitrate
          });
        }
      }

      setVoiceChannels(channels);
    } catch (error) {
      console.error('Failed to load voice channels:', error);
    }
  }, [client, serverId]);

  useEffect(() => {
    loadVoiceChannels();
  }, [loadVoiceChannels]);

  return {
    voiceChannels,
    connectedChannel,
    isConnecting,
    createVoiceChannel,
    joinVoiceChannel,
    leaveVoiceChannel,
    refresh: loadVoiceChannels
  };
}

// Hook for direct messages
export function useDirectMessages() {
  const client = useMatrixClient();
  const [directMessages, setDirectMessages] = useState<DirectMessageData[]>([]);
  const [loading, setLoading] = useState(true);
  const serviceRef = useRef<DiscordFeaturesService | null>(null);

  useEffect(() => {
    if (client) {
      serviceRef.current = new DiscordFeaturesService(client);
    }
  }, [client]);

  const createDirectMessage = useCallback(async (userId: string): Promise<string> => {
    if (!serviceRef.current) throw new Error('Discord features service not available');

    try {
      const roomId = await serviceRef.current.createDirectMessage(userId);
      await loadDirectMessages();
      return roomId;
    } catch (error) {
      throw new Error(`Failed to create direct message: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, []);

  const loadDirectMessages = useCallback(async () => {
    if (!client) return;

    try {
      setLoading(true);
      const directRoomData = client.getAccountData('m.direct')?.getContent() || {};
      const dmData: DirectMessageData[] = [];

      for (const [userId, roomIds] of Object.entries(directRoomData)) {
        for (const roomId of roomIds as string[]) {
          const room = client.getRoom(roomId);
          if (!room || room.getMyMembership() !== 'join') continue;

          const otherMember = room.getMembers().find(m => m.userId !== client.getUserId());
          if (!otherMember) continue;

          dmData.push({
            id: roomId,
            userId,
            displayName: otherMember.name,
            avatar: otherMember.getAvatarUrl(client.baseUrl, 64, 64, 'crop'),
            lastMessage: await getLastDirectMessage(room),
            unreadCount: room.getUnreadNotificationCount() || 0,
            isOnline: otherMember.presence === 'online'
          });
        }
      }

      // Sort by last activity
      dmData.sort((a, b) => (b.lastMessage?.timestamp || 0) - (a.lastMessage?.timestamp || 0));
      setDirectMessages(dmData);
    } catch (error) {
      console.error('Failed to load direct messages:', error);
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    loadDirectMessages();

    // Listen for DM updates
    if (client) {
      const handleUpdate = () => loadDirectMessages();
      client.on('Room.timeline', handleUpdate);
      client.on('Room.myMembership', handleUpdate);
      
      return () => {
        client.removeListener('Room.timeline', handleUpdate);
        client.removeListener('Room.myMembership', handleUpdate);
      };
    }
  }, [client, loadDirectMessages]);

  return {
    directMessages,
    loading,
    createDirectMessage,
    refresh: loadDirectMessages
  };
}

// Helper function to get last direct message
async function getLastDirectMessage(room: any): Promise<DirectMessageData['lastMessage']> {
  const timeline = room.getLiveTimeline();
  const events = timeline.getEvents();
  
  for (let i = events.length - 1; i >= 0; i--) {
    const event = events[i];
    if (event.getType() === 'm.room.message') {
      return {
        content: event.getContent()?.body || '',
        timestamp: event.getTs(),
        senderId: event.getSender() || ''
      };
    }
  }
  
  return undefined;
}

// Type definitions
interface FileUploadProgress {
  id: string;
  file: File;
  channelId: string;
  progress: number;
  status: 'uploading' | 'completed' | 'failed';
  error: string | null;
  messageId?: string;
}

interface ThreadData {
  parentMessageId: string;
  messageCount: number;
  participants: string[];
  lastActivity: number;
}

interface VoiceChannelData {
  id: string;
  name: string;
  connectedUsers: number;
  userLimit: number;
  bitrate: number;
}

interface DirectMessageData {
  id: string;
  userId: string;
  displayName: string;
  avatar?: string;
  lastMessage?: {
    content: string;
    timestamp: number;
    senderId: string;
  };
  unreadCount: number;
  isOnline: boolean;
}