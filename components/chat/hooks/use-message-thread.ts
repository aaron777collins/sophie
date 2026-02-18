import { useState, useEffect, useCallback, useMemo } from 'react';
import { MatrixEvent, RelationType, EventType, Room } from 'matrix-js-sdk';
import { useMatrixClient } from '../../matrix-client/lib/matrix/matrix-context';

interface ThreadMessage {
  id: string;
  senderId: string;
  timestamp: number;
  content: string;
  isEncrypted: boolean;
  isDecrypted: boolean;
  editedAt?: number;
  redactedAt?: number;
  replyTo?: string;
}

interface ThreadInfo {
  rootEventId: string;
  rootMessage?: ThreadMessage;
  replies: ThreadMessage[];
  totalReplies: number;
  lastReplyTimestamp?: number;
  participants: Set<string>;
}

interface UseMessageThreadOptions {
  autoLoad?: boolean;
  maxReplies?: number;
  includeRedacted?: boolean;
}

interface UseMessageThreadResult {
  thread: ThreadInfo | null;
  isLoading: boolean;
  error: string | null;
  loadThread: () => Promise<void>;
  sendThreadReply: (content: string, replyToId?: string) => Promise<void>;
  editThreadMessage: (messageId: string, newContent: string) => Promise<void>;
  deleteThreadMessage: (messageId: string) => Promise<void>;
  markThreadRead: () => Promise<void>;
}

/**
 * Hook for managing message threads in Matrix rooms
 */
export function useMessageThread(
  roomId: string | null,
  threadRootId: string | null,
  options: UseMessageThreadOptions = {}
): UseMessageThreadResult {
  const client = useMatrixClient();
  const [thread, setThread] = useState<ThreadInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { 
    autoLoad = true, 
    maxReplies = 100, 
    includeRedacted = false 
  } = options;

  const room = useMemo(() => 
    client && roomId ? client.getRoom(roomId) : null, 
    [client, roomId]
  );

  // Process Matrix event into thread message
  const processThreadMessage = useCallback((event: MatrixEvent): ThreadMessage | null => {
    if (!client) return null;

    const eventId = event.getId();
    const sender = event.getSender();
    
    if (!eventId || !sender) return null;

    // Check if this is a message event
    const eventType = event.getType();
    if (eventType !== EventType.RoomMessage && eventType !== EventType.RoomMessageEncrypted) {
      return null;
    }

    // Skip redacted messages unless specifically included
    if (event.isRedacted() && !includeRedacted) {
      return null;
    }

    // Handle encrypted messages
    const isEncrypted = event.isEncrypted();
    const isDecrypted = isEncrypted ? event.getClearContent() !== null : true;
    
    // Get message content
    const content = isEncrypted ? event.getClearContent() : event.getContent();
    const body = content.body || '[Message could not be displayed]';

    // Check for relations
    const relation = content['m.relates_to'];
    const isEdit = relation?.rel_type === RelationType.Replace;
    const replyTo = relation?.['m.in_reply_to']?.event_id;

    return {
      id: eventId,
      senderId: sender,
      timestamp: event.getTs(),
      content: body,
      isEncrypted,
      isDecrypted,
      editedAt: isEdit ? event.getTs() : undefined,
      redactedAt: event.isRedacted() ? event.getTs() : undefined,
      replyTo
    };
  }, [client, includeRedacted]);

  // Load thread data
  const loadThread = useCallback(async () => {
    if (!client || !room || !threadRootId) {
      setThread(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Get the root event
      const rootEvent = room.findEventById(threadRootId);
      if (!rootEvent) {
        throw new Error('Thread root event not found');
      }

      // Process root message
      const rootMessage = processThreadMessage(rootEvent);
      if (!rootMessage) {
        throw new Error('Invalid thread root message');
      }

      // Get thread relations
      const relations = room.getUnfilteredTimelineSet().relations?.getChildEventsForEvent(
        threadRootId,
        RelationType.Thread,
        EventType.RoomMessage
      );

      const replies: ThreadMessage[] = [];
      const participants = new Set<string>([rootMessage.senderId]);
      let lastReplyTimestamp: number | undefined;

      if (relations) {
        const threadEvents = relations.getRelations();
        
        for (const threadEvent of threadEvents) {
          const threadMessage = processThreadMessage(threadEvent);
          if (threadMessage) {
            replies.push(threadMessage);
            participants.add(threadMessage.senderId);
            
            if (!lastReplyTimestamp || threadMessage.timestamp > lastReplyTimestamp) {
              lastReplyTimestamp = threadMessage.timestamp;
            }
          }
        }
      }

      // Sort replies by timestamp
      replies.sort((a, b) => a.timestamp - b.timestamp);

      // Limit replies if specified
      const limitedReplies = maxReplies > 0 ? replies.slice(-maxReplies) : replies;

      const threadInfo: ThreadInfo = {
        rootEventId: threadRootId,
        rootMessage,
        replies: limitedReplies,
        totalReplies: replies.length,
        lastReplyTimestamp,
        participants
      };

      setThread(threadInfo);

    } catch (err) {
      console.error('Failed to load thread:', err);
      setError(err instanceof Error ? err.message : 'Failed to load thread');
      setThread(null);
    } finally {
      setIsLoading(false);
    }
  }, [client, room, threadRootId, processThreadMessage, maxReplies]);

  // Send a reply to the thread
  const sendThreadReply = useCallback(async (content: string, replyToId?: string) => {
    if (!client || !roomId || !threadRootId) {
      throw new Error('Cannot send thread reply: missing required data');
    }

    try {
      const eventContent: any = {
        msgtype: 'm.text',
        body: content,
        'm.relates_to': {
          rel_type: RelationType.Thread,
          event_id: threadRootId
        }
      };

      // Add reply relation if specified
      if (replyToId) {
        eventContent['m.relates_to']['m.in_reply_to'] = {
          event_id: replyToId
        };
        
        // Add fallback for clients that don't support threading
        const replyEvent = room?.findEventById(replyToId);
        if (replyEvent) {
          const replyContent = replyEvent.getContent();
          const replyBody = replyContent.body || '';
          const replySender = room?.getMember(replyEvent.getSender() || '')?.name || 'Unknown';
          
          eventContent.body = `> <${replySender}> ${replyBody}\n\n${content}`;
          eventContent['m.new_content'] = {
            msgtype: 'm.text',
            body: content
          };
        }
      }

      await client.sendEvent(roomId, EventType.RoomMessage, eventContent);

      // Reload thread to show new reply
      await loadThread();

    } catch (err) {
      console.error('Failed to send thread reply:', err);
      throw err;
    }
  }, [client, roomId, threadRootId, room, loadThread]);

  // Edit a message in the thread
  const editThreadMessage = useCallback(async (messageId: string, newContent: string) => {
    if (!client || !roomId) {
      throw new Error('Cannot edit message: missing required data');
    }

    try {
      await client.sendEvent(roomId, EventType.RoomMessage, {
        msgtype: 'm.text',
        body: newContent,
        'm.new_content': {
          msgtype: 'm.text',
          body: newContent
        },
        'm.relates_to': {
          rel_type: RelationType.Replace,
          event_id: messageId
        }
      });

      // Reload thread to show edit
      await loadThread();

    } catch (err) {
      console.error('Failed to edit thread message:', err);
      throw err;
    }
  }, [client, roomId, loadThread]);

  // Delete a message in the thread
  const deleteThreadMessage = useCallback(async (messageId: string) => {
    if (!client || !roomId) {
      throw new Error('Cannot delete message: missing required data');
    }

    try {
      await client.redactEvent(roomId, messageId, 'Message deleted');
      
      // Reload thread to reflect deletion
      await loadThread();

    } catch (err) {
      console.error('Failed to delete thread message:', err);
      throw err;
    }
  }, [client, roomId, loadThread]);

  // Mark thread as read
  const markThreadRead = useCallback(async () => {
    if (!client || !roomId || !thread?.replies.length) return;

    try {
      // Get the latest message in the thread
      const latestMessage = thread.replies[thread.replies.length - 1];
      
      // Send read receipt for the latest message
      await client.sendReadReceipt(
        client.getRoom(roomId)?.findEventById(latestMessage.id) || null
      );

    } catch (err) {
      console.error('Failed to mark thread as read:', err);
    }
  }, [client, roomId, thread]);

  // Auto-load thread when dependencies change
  useEffect(() => {
    if (autoLoad && threadRootId) {
      loadThread();
    }
  }, [autoLoad, threadRootId, loadThread]);

  // Listen for new thread events
  useEffect(() => {
    if (!client || !room || !threadRootId) return;

    const handleTimelineEvent = (event: MatrixEvent) => {
      if (event.getRoomId() === roomId) {
        const relation = event.getContent()['m.relates_to'];
        
        // Check if this event is part of our thread
        if (relation?.rel_type === RelationType.Thread && relation.event_id === threadRootId) {
          loadThread();
        }
        
        // Check if this is an edit or redaction of a thread message
        if (relation?.rel_type === RelationType.Replace) {
          const originalEventId = relation.event_id;
          if (thread?.replies.some(reply => reply.id === originalEventId) ||
              thread?.rootMessage?.id === originalEventId) {
            loadThread();
          }
        }
      }
    };

    client.on('Room.timeline', handleTimelineEvent);
    client.on('Room.redaction', handleTimelineEvent);

    return () => {
      client.removeListener('Room.timeline', handleTimelineEvent);
      client.removeListener('Room.redaction', handleTimelineEvent);
    };
  }, [client, room, roomId, threadRootId, thread, loadThread]);

  return {
    thread,
    isLoading,
    error,
    loadThread,
    sendThreadReply,
    editThreadMessage,
    deleteThreadMessage,
    markThreadRead
  };
}

/**
 * Hook for getting thread previews for multiple messages
 */
export function useThreadPreviews(roomId: string | null, messageIds: string[]) {
  const client = useMatrixClient();
  const [threadPreviews, setThreadPreviews] = useState<Map<string, {
    replyCount: number;
    lastReplyTimestamp?: number;
    lastReplySender?: string;
  }>>(new Map());

  const room = useMemo(() => 
    client && roomId ? client.getRoom(roomId) : null, 
    [client, roomId]
  );

  const loadPreviews = useCallback(async () => {
    if (!client || !room || messageIds.length === 0) return;

    const previews = new Map();

    for (const messageId of messageIds) {
      try {
        const relations = room.getUnfilteredTimelineSet().relations?.getChildEventsForEvent(
          messageId,
          RelationType.Thread,
          EventType.RoomMessage
        );

        if (relations) {
          const threadEvents = relations.getRelations();
          let lastReplyTimestamp: number | undefined;
          let lastReplySender: string | undefined;

          threadEvents.forEach(event => {
            const timestamp = event.getTs();
            if (!lastReplyTimestamp || timestamp > lastReplyTimestamp) {
              lastReplyTimestamp = timestamp;
              lastReplySender = room.getMember(event.getSender() || '')?.name || 'Unknown';
            }
          });

          previews.set(messageId, {
            replyCount: threadEvents.length,
            lastReplyTimestamp,
            lastReplySender
          });
        } else {
          previews.set(messageId, { replyCount: 0 });
        }
      } catch (err) {
        console.error(`Failed to load thread preview for ${messageId}:`, err);
        previews.set(messageId, { replyCount: 0 });
      }
    }

    setThreadPreviews(previews);
  }, [client, room, messageIds]);

  useEffect(() => {
    loadPreviews();
  }, [loadPreviews]);

  return {
    threadPreviews,
    refreshPreviews: loadPreviews
  };
}