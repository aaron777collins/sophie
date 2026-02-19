'use client';

import { MatrixClient, Room, RoomEvent, RoomMember, MatrixEvent, EventType, MsgType } from 'matrix-js-sdk';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useMatrixClient } from './matrix-context';

// Types for Discord-like functionality
export interface ServerData {
  id: string;
  name: string;
  avatar?: string;
  memberCount: number;
  unreadCount: number;
  mentionCount: number;
  channels: ChannelData[];
  categories: CategoryData[];
  isJoined: boolean;
}

export interface ChannelData {
  id: string;
  name: string;
  type: 'text' | 'voice' | 'video';
  topic?: string;
  unreadCount: number;
  mentionCount: number;
  categoryId?: string;
  lastMessage?: {
    id: string;
    content: string;
    sender: string;
    timestamp: number;
  };
}

export interface CategoryData {
  id: string;
  name: string;
  channels: string[];
  collapsed?: boolean;
}

export interface MessageData {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: number;
  edited?: number;
  reactions: Array<{
    emoji: string;
    count: number;
    users: string[];
    hasReacted: boolean;
  }>;
  replyTo?: string;
  attachments: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  mentions: string[];
  isSystem: boolean;
}

export interface UserPresence {
  id: string;
  displayName: string;
  avatar?: string;
  presence: 'online' | 'offline' | 'unavailable' | 'unknown';
  statusMsg?: string;
  lastActiveAgo?: number;
}

// Hook for managing servers (Matrix spaces/rooms acting as Discord servers)
export function useMatrixServers() {
  const client = useMatrixClient();
  const [servers, setServers] = useState<ServerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadServers = useCallback(async () => {
    if (!client) return;

    try {
      setLoading(true);
      const rooms = client.getRooms();
      const serverData: ServerData[] = [];

      for (const room of rooms) {
        if (room.isSpaceRoom()) {
          // This is a space (Discord server equivalent)
          const channels = await loadChannelsForServer(room, client);
          const categories = extractCategoriesFromChannels(channels);
          
          serverData.push({
            id: room.roomId,
            name: room.name || 'Unnamed Server',
            avatar: room.getAvatarUrl(client.baseUrl, 64, 64, 'crop'),
            memberCount: room.getJoinedMemberCount(),
            unreadCount: room.getUnreadNotificationCount() || 0,
            mentionCount: room.getUnreadNotificationCount('highlight') || 0,
            channels,
            categories,
            isJoined: room.getMyMembership() === 'join'
          });
        } else if (!room.getParent()) {
          // This is a standalone room (treat as single-channel server)
          const channelData: ChannelData = {
            id: room.roomId,
            name: room.name || 'General',
            type: determineChannelType(room),
            topic: room.currentState.getStateEvents('m.room.topic', '')?.[0]?.getContent()?.topic,
            unreadCount: room.getUnreadNotificationCount() || 0,
            mentionCount: room.getUnreadNotificationCount('highlight') || 0,
            lastMessage: await getLastMessage(room)
          };

          serverData.push({
            id: room.roomId,
            name: room.name || 'Direct Chat',
            avatar: room.getAvatarUrl(client.baseUrl, 64, 64, 'crop'),
            memberCount: room.getJoinedMemberCount(),
            unreadCount: room.getUnreadNotificationCount() || 0,
            mentionCount: room.getUnreadNotificationCount('highlight') || 0,
            channels: [channelData],
            categories: [],
            isJoined: room.getMyMembership() === 'join'
          });
        }
      }

      setServers(serverData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load servers');
    } finally {
      setLoading(false);
    }
  }, [client]);

  // Listen for real-time updates
  useEffect(() => {
    if (!client) return;

    const handleRoomUpdate = () => {
      loadServers();
    };

    client.on(RoomEvent.Name, handleRoomUpdate);
    client.on(RoomEvent.MyMembership, handleRoomUpdate);
    client.on(RoomEvent.UnreadNotifications, handleRoomUpdate);
    client.on(RoomEvent.Timeline, handleRoomUpdate);

    // Initial load
    loadServers();

    return () => {
      client.removeListener(RoomEvent.Name, handleRoomUpdate);
      client.removeListener(RoomEvent.MyMembership, handleRoomUpdate);
      client.removeListener(RoomEvent.UnreadNotifications, handleRoomUpdate);
      client.removeListener(RoomEvent.Timeline, handleRoomUpdate);
    };
  }, [client, loadServers]);

  const joinServer = useCallback(async (serverId: string) => {
    if (!client) throw new Error('Matrix client not available');
    
    try {
      await client.joinRoom(serverId);
      await loadServers();
    } catch (err) {
      throw new Error(`Failed to join server: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [client, loadServers]);

  const leaveServer = useCallback(async (serverId: string) => {
    if (!client) throw new Error('Matrix client not available');
    
    try {
      await client.leave(serverId);
      await loadServers();
    } catch (err) {
      throw new Error(`Failed to leave server: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [client, loadServers]);

  const createServer = useCallback(async (name: string, avatar?: File) => {
    if (!client) throw new Error('Matrix client not available');
    
    try {
      // Create a space (Discord server equivalent)
      const { room_id } = await client.createRoom({
        name,
        topic: `${name} community space`,
        preset: 'public_chat',
        creation_content: {
          type: 'm.space'
        },
        power_level_content_override: {
          events: {
            'm.space.child': 50,
            'm.space.parent': 50,
            'm.room.avatar': 50,
            'm.room.canonical_alias': 50,
            'm.room.history_visibility': 100,
            'm.room.name': 50,
            'm.room.power_levels': 100,
            'm.room.topic': 50
          }
        }
      });

      // Set avatar if provided
      if (avatar) {
        const url = await client.uploadContent(avatar);
        await client.sendStateEvent(room_id, 'm.room.avatar', { url }, '');
      }

      await loadServers();
      return room_id;
    } catch (err) {
      throw new Error(`Failed to create server: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [client, loadServers]);

  return {
    servers,
    loading,
    error,
    joinServer,
    leaveServer,
    createServer,
    refresh: loadServers
  };
}

// Hook for managing channels within a server
export function useMatrixChannels(serverId: string) {
  const client = useMatrixClient();
  const [channels, setChannels] = useState<ChannelData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadChannels = useCallback(async () => {
    if (!client || !serverId) return;

    try {
      setLoading(true);
      const server = client.getRoom(serverId);
      if (!server) throw new Error('Server not found');

      const channelData = await loadChannelsForServer(server, client);
      const categoryData = extractCategoriesFromChannels(channelData);

      setChannels(channelData);
      setCategories(categoryData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load channels');
    } finally {
      setLoading(false);
    }
  }, [client, serverId]);

  useEffect(() => {
    if (!client || !serverId) return;

    const handleChannelUpdate = () => {
      loadChannels();
    };

    client.on(RoomEvent.Name, handleChannelUpdate);
    client.on(RoomEvent.MyMembership, handleChannelUpdate);
    client.on(RoomEvent.UnreadNotifications, handleChannelUpdate);
    client.on(RoomEvent.Timeline, handleChannelUpdate);

    loadChannels();

    return () => {
      client.removeListener(RoomEvent.Name, handleChannelUpdate);
      client.removeListener(RoomEvent.MyMembership, handleChannelUpdate);
      client.removeListener(RoomEvent.UnreadNotifications, handleChannelUpdate);
      client.removeListener(RoomEvent.Timeline, handleChannelUpdate);
    };
  }, [client, serverId, loadChannels]);

  const createChannel = useCallback(async (name: string, type: 'text' | 'voice' = 'text', categoryId?: string) => {
    if (!client) throw new Error('Matrix client not available');
    
    try {
      const roomOptions: any = {
        name,
        preset: 'public_chat',
        parent_id: serverId,
        creation_content: {
          [type === 'voice' ? 'm.federate' : 'm.room.version']: type === 'voice' ? false : '9'
        }
      };

      if (type === 'voice') {
        roomOptions.initial_state = [
          {
            type: 'm.room.power_levels',
            content: {
              events: {
                'im.vector.modular.widgets': 0,
                'm.room.redaction': 50
              }
            }
          }
        ];
      }

      const { room_id } = await client.createRoom(roomOptions);
      
      // Add channel to space
      await client.sendStateEvent(
        serverId,
        'm.space.child',
        {
          via: [client.getDomain()!],
          order: Date.now().toString()
        },
        room_id
      );

      await loadChannels();
      return room_id;
    } catch (err) {
      throw new Error(`Failed to create channel: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [client, serverId, loadChannels]);

  const deleteChannel = useCallback(async (channelId: string) => {
    if (!client) throw new Error('Matrix client not available');
    
    try {
      // Remove from space first
      await client.sendStateEvent(serverId, 'm.space.child', {}, channelId);
      
      // Leave the room
      await client.leave(channelId);
      
      await loadChannels();
    } catch (err) {
      throw new Error(`Failed to delete channel: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [client, serverId, loadChannels]);

  return {
    channels,
    categories,
    loading,
    error,
    createChannel,
    deleteChannel,
    refresh: loadChannels
  };
}

// Hook for managing messages in a channel
export function useMatrixMessages(channelId: string, limit: number = 50) {
  const client = useMatrixClient();
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const timelineRef = useRef<string | null>(null);

  const loadMessages = useCallback(async (loadMore: boolean = false) => {
    if (!client || !channelId) return;

    try {
      if (!loadMore) setLoading(true);
      
      const room = client.getRoom(channelId);
      if (!room) throw new Error('Channel not found');

      const timeline = room.getLiveTimeline();
      const events = timeline.getEvents();
      
      // Convert Matrix events to Discord-like message format
      const messageData: MessageData[] = [];
      
      for (const event of events.slice(-limit)) {
        if (event.getType() === EventType.RoomMessage) {
          const messageData = await convertMatrixEventToMessage(event, client);
          if (messageData) {
            messageData.push(messageData);
          }
        }
      }

      if (loadMore) {
        setMessages(prev => [...messageData, ...prev]);
      } else {
        setMessages(messageData);
      }
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [client, channelId, limit]);

  useEffect(() => {
    if (!client || !channelId) return;

    const handleNewMessage = (event: MatrixEvent) => {
      if (event.getRoomId() !== channelId) return;
      if (event.getType() !== EventType.RoomMessage) return;

      convertMatrixEventToMessage(event, client).then(messageData => {
        if (messageData) {
          setMessages(prev => [...prev, messageData]);
        }
      });
    };

    client.on(RoomEvent.Timeline, handleNewMessage);
    loadMessages();

    return () => {
      client.removeListener(RoomEvent.Timeline, handleNewMessage);
    };
  }, [client, channelId, loadMessages]);

  const sendMessage = useCallback(async (content: string, replyToId?: string) => {
    if (!client) throw new Error('Matrix client not available');
    
    try {
      let eventContent: any = {
        msgtype: MsgType.Text,
        body: content,
      };

      // Handle replies
      if (replyToId) {
        const replyToEvent = client.getRoom(channelId)?.findEventById(replyToId);
        if (replyToEvent) {
          eventContent['m.relates_to'] = {
            'm.in_reply_to': {
              event_id: replyToId
            }
          };
        }
      }

      await client.sendMessage(channelId, eventContent);
    } catch (err) {
      throw new Error(`Failed to send message: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [client, channelId]);

  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    if (!client) throw new Error('Matrix client not available');
    
    try {
      await client.sendMessage(channelId, {
        msgtype: MsgType.Text,
        body: `* ${newContent}`,
        'm.new_content': {
          msgtype: MsgType.Text,
          body: newContent,
        },
        'm.relates_to': {
          rel_type: 'm.replace',
          event_id: messageId
        }
      });
    } catch (err) {
      throw new Error(`Failed to edit message: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [client, channelId]);

  const deleteMessage = useCallback(async (messageId: string) => {
    if (!client) throw new Error('Matrix client not available');
    
    try {
      await client.redactEvent(channelId, messageId);
    } catch (err) {
      throw new Error(`Failed to delete message: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [client, channelId]);

  const addReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!client) throw new Error('Matrix client not available');
    
    try {
      await client.sendEvent(channelId, 'm.reaction', {
        'm.relates_to': {
          rel_type: 'm.annotation',
          event_id: messageId,
          key: emoji
        }
      });
    } catch (err) {
      throw new Error(`Failed to add reaction: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [client, channelId]);

  return {
    messages,
    loading,
    error,
    hasMore,
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction,
    loadMore: () => loadMessages(true),
    refresh: () => loadMessages(false)
  };
}

// Hook for user presence and profile management
export function useMatrixPresence() {
  const client = useMatrixClient();
  const [users, setUsers] = useState<Map<string, UserPresence>>(new Map());
  const [currentUser, setCurrentUser] = useState<UserPresence | null>(null);

  useEffect(() => {
    if (!client) return;

    const updateUserPresence = (event: MatrixEvent, user: any) => {
      const presence: UserPresence = {
        id: user.userId,
        displayName: user.displayName || user.name,
        avatar: user.avatarUrl,
        presence: user.presence || 'unknown',
        statusMsg: user.presenceStatusMsg,
        lastActiveAgo: user.lastActiveAgo
      };

      setUsers(prev => new Map(prev.set(user.userId, presence)));
      
      if (user.userId === client.getUserId()) {
        setCurrentUser(presence);
      }
    };

    client.on('User.presence' as any, updateUserPresence);
    client.on('User.avatarUrl' as any, updateUserPresence);
    client.on('User.displayName' as any, updateUserPresence);

    // Load current user
    const currentUserId = client.getUserId();
    if (currentUserId) {
      const user = client.getUser(currentUserId);
      if (user) {
        updateUserPresence({} as MatrixEvent, user as any);
      }
    }

    return () => {
      client.removeListener('User.presence' as any, updateUserPresence);
      client.removeListener('User.avatarUrl' as any, updateUserPresence);
      client.removeListener('User.displayName' as any, updateUserPresence);
    };
  }, [client]);

  const setPresence = useCallback(async (presence: 'online' | 'offline' | 'unavailable', statusMsg?: string) => {
    if (!client) throw new Error('Matrix client not available');
    
    try {
      await client.setPresence({
        presence,
        status_msg: statusMsg
      });
    } catch (err) {
      throw new Error(`Failed to set presence: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [client]);

  const updateProfile = useCallback(async (displayName?: string, avatar?: File) => {
    if (!client) throw new Error('Matrix client not available');
    
    try {
      if (displayName) {
        await client.setDisplayName(displayName);
      }
      
      if (avatar) {
        const { content_uri } = await client.uploadContent(avatar);
        await client.setAvatarUrl(content_uri);
      }
    } catch (err) {
      throw new Error(`Failed to update profile: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [client]);

  return {
    users,
    currentUser,
    setPresence,
    updateProfile,
    getUser: (userId: string) => users.get(userId)
  };
}

// Helper functions
async function loadChannelsForServer(server: Room, client: MatrixClient): Promise<ChannelData[]> {
  const childEvents = server.currentState.getStateEvents('m.space.child');
  const channels: ChannelData[] = [];

  for (const event of childEvents) {
    const childRoomId = event.getStateKey();
    if (!childRoomId) continue;

    const childRoom = client.getRoom(childRoomId);
    if (!childRoom || childRoom.getMyMembership() !== 'join') continue;

    channels.push({
      id: childRoomId,
      name: childRoom.name || 'Unnamed Channel',
      type: determineChannelType(childRoom),
      topic: childRoom.currentState.getStateEvents('m.room.topic', '')[0]?.getContent()?.topic,
      unreadCount: childRoom.getUnreadNotificationCount() || 0,
      mentionCount: childRoom.getUnreadNotificationCount('highlight' as any) || 0,
      lastMessage: await getLastMessage(childRoom)
    });
  }

  return channels;
}

function extractCategoriesFromChannels(channels: ChannelData[]): CategoryData[] {
  // For now, create a simple "General" category
  // TODO: Implement proper category support based on Matrix spaces or room hierarchy
  return [{
    id: 'general',
    name: 'General',
    channels: channels.map(c => c.id)
  }];
}

function determineChannelType(room: Room): 'text' | 'voice' | 'video' {
  // Check for voice/video room indicators
  const widgets = room.currentState.getStateEvents('im.vector.modular.widgets');
  if (widgets.some(w => w.getContent()?.type === 'jitsi')) {
    return 'voice';
  }
  return 'text';
}

async function getLastMessage(room: Room): Promise<ChannelData['lastMessage']> {
  const timeline = room.getLiveTimeline();
  const events = timeline.getEvents();
  
  for (let i = events.length - 1; i >= 0; i--) {
    const event = events[i];
    if (event.getType() === EventType.RoomMessage) {
      const sender = event.getSender();
      return {
        id: event.getId() || '',
        content: event.getContent()?.body || '',
        sender: sender || '',
        timestamp: event.getTs()
      };
    }
  }
  
  return undefined;
}

async function convertMatrixEventToMessage(event: MatrixEvent, client: MatrixClient): Promise<MessageData | null> {
  if (event.getType() !== EventType.RoomMessage) return null;

  const sender = event.getSender();
  if (!sender) return null;

  const senderUser = client.getUser(sender);
  const content = event.getContent();
  
  return {
    id: event.getId() || '',
    content: content?.body || '',
    sender: {
      id: sender,
      name: senderUser?.displayName || sender,
      avatar: senderUser?.avatarUrl
    },
    timestamp: event.getTs(),
    edited: event.replacingEventDate()?.getTime(),
    reactions: [], // TODO: Load reactions
    replyTo: event.getRelation()?.event_id,
    attachments: [], // TODO: Parse attachments
    mentions: [], // TODO: Parse mentions
    isSystem: false
  };
}