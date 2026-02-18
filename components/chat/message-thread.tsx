import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  MatrixEvent, 
  MatrixClient, 
  EventType, 
  MsgType, 
  RelationType,
  Room,
  RoomEvent,
  EventTimeline
} from 'matrix-js-sdk';
import { useMatrixClient } from '../../matrix-client/lib/matrix/matrix-context';

// Types for message handling
interface MessageEventData {
  id: string;
  senderId: string;
  timestamp: number;
  content: string;
  msgtype: string;
  eventType: string;
  isEncrypted: boolean;
  isDecrypted: boolean;
  decryptionError?: string;
  editedAt?: number;
  redactedAt?: number;
  reactions: MessageReaction[];
  replyTo?: string;
  threadRoot?: string;
  threadReplies: string[];
  mediaInfo?: MediaInfo;
  status: 'sending' | 'sent' | 'failed' | 'delivered';
}

interface MessageReaction {
  emoji: string;
  count: number;
  users: string[];
  hasUserReacted: boolean;
}

interface MediaInfo {
  type: 'image' | 'video' | 'audio' | 'file';
  url?: string;
  filename?: string;
  mimetype?: string;
  size?: number;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  duration?: number;
}

interface TypingIndicator {
  userId: string;
  displayName: string;
  timestamp: number;
}

interface ReadReceipt {
  userId: string;
  displayName: string;
  timestamp: number;
  eventId: string;
}

interface MessageThreadProps {
  roomId: string;
  threadRootId?: string; // If set, shows only messages in this thread
  className?: string;
  enableSearch?: boolean;
  enableReactions?: boolean;
  enableEditing?: boolean;
  enableThreading?: boolean;
  enableMediaPreview?: boolean;
  maxMessages?: number;
  onMessageSelect?: (message: MessageEventData) => void;
  onThreadSelect?: (threadRootId: string) => void;
}

export const MessageThread: React.FC<MessageThreadProps> = ({
  roomId,
  threadRootId,
  className = '',
  enableSearch = true,
  enableReactions = true,
  enableEditing = true,
  enableThreading = true,
  enableMediaPreview = true,
  maxMessages = 100,
  onMessageSelect,
  onThreadSelect,
}) => {
  const client = useMatrixClient();
  const [messages, setMessages] = useState<MessageEventData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);
  const [readReceipts, setReadReceipts] = useState<Map<string, ReadReceipt>>(new Map());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const room = useMemo(() => client?.getRoom(roomId), [client, roomId]);

  // Process Matrix event into our message format
  const processMatrixEvent = useCallback((event: MatrixEvent): MessageEventData | null => {
    if (!client || !room) return null;

    const eventType = event.getType();
    if (eventType !== EventType.RoomMessage && eventType !== EventType.RoomMessageEncrypted) {
      return null;
    }

    const content = event.getContent();
    const sender = event.getSender();
    const eventId = event.getId();

    if (!sender || !eventId) return null;

    // Handle encrypted messages
    const isEncrypted = event.isEncrypted();
    const isDecrypted = isEncrypted ? event.getClearContent() !== null : true;
    const decryptionError = isEncrypted && !isDecrypted ? 'Failed to decrypt message' : undefined;

    // Get message content
    const messageContent = isEncrypted ? event.getClearContent() : content;
    const msgtype = messageContent.msgtype || MsgType.Text;
    const body = messageContent.body || '[Message could not be displayed]';

    // Check for edits
    const relation = messageContent['m.relates_to'];
    const isEdit = relation?.rel_type === RelationType.Replace;
    const editedAt = isEdit ? event.getTs() : undefined;

    // Check for replies and threads
    const replyTo = relation?.['m.in_reply_to']?.event_id;
    const threadRoot = relation?.rel_type === RelationType.Thread ? relation.event_id : undefined;

    // Handle media content
    let mediaInfo: MediaInfo | undefined;
    if (msgtype !== MsgType.Text && msgtype !== MsgType.Notice && msgtype !== MsgType.Emote) {
      const url = client.mxcUrlToHttp(messageContent.url);
      const info = messageContent.info || {};
      
      mediaInfo = {
        type: msgtype.includes('image') ? 'image' : 
              msgtype.includes('video') ? 'video' :
              msgtype.includes('audio') ? 'audio' : 'file',
        url,
        filename: messageContent.filename || body,
        mimetype: info.mimetype,
        size: info.size,
        thumbnailUrl: info.thumbnail_url ? client.mxcUrlToHttp(info.thumbnail_url) : undefined,
        width: info.w,
        height: info.h,
        duration: info.duration
      };
    }

    // Get reactions
    const reactions: MessageReaction[] = [];
    const relationsByEventId = room.getUnfilteredTimelineSet().relations?.getChildEventsForEvent(
      eventId,
      RelationType.Annotation,
      EventType.Reaction
    );

    if (relationsByEventId) {
      const reactionMap = new Map<string, { count: number; users: string[]; hasUserReacted: boolean }>();
      
      relationsByEventId.getRelations().forEach(reactionEvent => {
        const reactionContent = reactionEvent.getContent();
        const emoji = reactionContent['m.relates_to']?.key;
        if (emoji) {
          const existing = reactionMap.get(emoji) || { count: 0, users: [], hasUserReacted: false };
          existing.count++;
          existing.users.push(reactionEvent.getSender() || '');
          if (reactionEvent.getSender() === client.getUserId()) {
            existing.hasUserReacted = true;
          }
          reactionMap.set(emoji, existing);
        }
      });

      reactionMap.forEach((data, emoji) => {
        reactions.push({ emoji, ...data });
      });
    }

    // Get thread replies count
    const threadReplies: string[] = [];
    if (enableThreading) {
      const threadEvents = room.getUnfilteredTimelineSet().relations?.getChildEventsForEvent(
        eventId,
        RelationType.Thread,
        EventType.RoomMessage
      );
      if (threadEvents) {
        threadEvents.getRelations().forEach(threadEvent => {
          const threadEventId = threadEvent.getId();
          if (threadEventId) threadReplies.push(threadEventId);
        });
      }
    }

    return {
      id: eventId,
      senderId: sender,
      timestamp: event.getTs(),
      content: body,
      msgtype,
      eventType,
      isEncrypted,
      isDecrypted,
      decryptionError,
      editedAt,
      redactedAt: event.isRedacted() ? event.getTs() : undefined,
      reactions,
      replyTo,
      threadRoot,
      threadReplies,
      mediaInfo,
      status: 'sent' // We can enhance this with actual sending status
    };
  }, [client, room, enableThreading]);

  // Load messages from room timeline
  const loadMessages = useCallback(async (isLoadingMore = false) => {
    if (!client || !room) return;

    try {
      if (!isLoadingMore) {
        setIsLoading(true);
        setError(null);
      } else {
        setIsLoadingMore(true);
      }

      // Get timeline events
      const timeline = room.getLiveTimeline();
      const events = timeline.getEvents();

      // Process events into messages
      const processedMessages: MessageEventData[] = [];
      
      for (const event of events) {
        const processedMessage = processMatrixEvent(event);
        if (processedMessage) {
          // Filter by thread if threadRootId is specified
          if (threadRootId) {
            if (processedMessage.threadRoot === threadRootId || processedMessage.id === threadRootId) {
              processedMessages.push(processedMessage);
            }
          } else {
            // Only show root messages if not in thread view
            if (!processedMessage.threadRoot) {
              processedMessages.push(processedMessage);
            }
          }
        }
      }

      // Sort by timestamp
      processedMessages.sort((a, b) => a.timestamp - b.timestamp);

      // Limit messages if specified
      const limitedMessages = maxMessages 
        ? processedMessages.slice(-maxMessages)
        : processedMessages;

      setMessages(limitedMessages);
      setHasMoreMessages(processedMessages.length > limitedMessages.length);

    } catch (err) {
      console.error('Failed to load messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [client, room, threadRootId, maxMessages, processMatrixEvent]);

  // Load more messages (pagination)
  const loadMoreMessages = useCallback(async () => {
    if (!client || !room || !hasMoreMessages || isLoadingMore) return;

    try {
      setIsLoadingMore(true);
      
      // Paginate backwards in timeline
      const timeline = room.getLiveTimeline();
      await client.paginateEventTimeline(timeline, { backwards: true, limit: 30 });
      
      // Reload messages with new events
      await loadMessages(true);
      
    } catch (err) {
      console.error('Failed to load more messages:', err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [client, room, hasMoreMessages, isLoadingMore, loadMessages]);

  // Handle message events
  useEffect(() => {
    if (!client || !room) return;

    const handleTimelineEvent = (event: MatrixEvent) => {
      if (event.getRoomId() === roomId) {
        loadMessages();
      }
    };

    const handleTyping = (event: MatrixEvent, typingUsers: string[]) => {
      if (event.getRoomId() === roomId) {
        const indicators: TypingIndicator[] = typingUsers
          .filter(userId => userId !== client.getUserId())
          .map(userId => ({
            userId,
            displayName: room.getMember(userId)?.name || userId,
            timestamp: Date.now()
          }));
        setTypingUsers(indicators);
      }
    };

    const handleReadReceipt = (event: MatrixEvent) => {
      if (event.getRoomId() === roomId) {
        const content = event.getContent();
        const newReceipts = new Map<string, ReadReceipt>();
        
        Object.entries(content).forEach(([eventId, receiptData]: [string, any]) => {
          Object.entries(receiptData['m.read']).forEach(([userId, data]: [string, any]) => {
            if (userId !== client.getUserId()) {
              newReceipts.set(userId, {
                userId,
                displayName: room.getMember(userId)?.name || userId,
                timestamp: data.ts,
                eventId
              });
            }
          });
        });
        
        setReadReceipts(newReceipts);
      }
    };

    // Add event listeners
    client.on(RoomEvent.Timeline, handleTimelineEvent);
    client.on(RoomEvent.Typing, handleTyping);
    client.on(RoomEvent.Receipt, handleReadReceipt);

    // Initial load
    loadMessages();

    return () => {
      client.removeListener(RoomEvent.Timeline, handleTimelineEvent);
      client.removeListener(RoomEvent.Typing, handleTyping);
      client.removeListener(RoomEvent.Receipt, handleReadReceipt);
    };
  }, [client, room, roomId, loadMessages]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current && !isLoadingMore) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoadingMore]);

  // Handle reactions
  const handleReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!client || !enableReactions) return;

    try {
      const existingReaction = messages
        .find(m => m.id === messageId)
        ?.reactions.find(r => r.emoji === emoji && r.hasUserReacted);

      if (existingReaction) {
        // Remove reaction
        const relations = room?.getUnfilteredTimelineSet().relations?.getChildEventsForEvent(
          messageId,
          RelationType.Annotation,
          EventType.Reaction
        );
        
        const userReaction = relations?.getRelations().find(event => 
          event.getSender() === client.getUserId() && 
          event.getContent()['m.relates_to']?.key === emoji
        );

        if (userReaction) {
          await client.redactEvent(roomId, userReaction.getId()!, '');
        }
      } else {
        // Add reaction
        await client.sendEvent(roomId, EventType.Reaction, {
          'm.relates_to': {
            rel_type: RelationType.Annotation,
            event_id: messageId,
            key: emoji
          }
        });
      }
    } catch (err) {
      console.error('Failed to handle reaction:', err);
    }
  }, [client, enableReactions, messages, room, roomId]);

  // Handle message editing
  const handleEditMessage = useCallback(async (messageId: string, newContent: string) => {
    if (!client || !enableEditing) return;

    try {
      const originalEvent = room?.findEventById(messageId);
      if (!originalEvent) return;

      await client.sendEvent(roomId, EventType.RoomMessage, {
        msgtype: MsgType.Text,
        body: newContent,
        'm.new_content': {
          msgtype: MsgType.Text,
          body: newContent
        },
        'm.relates_to': {
          rel_type: RelationType.Replace,
          event_id: messageId
        }
      });

      setEditingMessageId(null);
      setEditingContent('');
    } catch (err) {
      console.error('Failed to edit message:', err);
    }
  }, [client, enableEditing, room, roomId]);

  // Handle message deletion
  const handleDeleteMessage = useCallback(async (messageId: string) => {
    if (!client || !enableEditing) return;

    try {
      await client.redactEvent(roomId, messageId, 'Message deleted');
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  }, [client, enableEditing, roomId]);

  // Start editing a message
  const startEditing = useCallback((messageId: string, currentContent: string) => {
    setEditingMessageId(messageId);
    setEditingContent(currentContent);
  }, []);

  // Cancel editing
  const cancelEditing = useCallback(() => {
    setEditingMessageId(null);
    setEditingContent('');
  }, []);

  // Handle scroll for pagination
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = e.currentTarget;
    
    if (scrollTop === 0 && hasMoreMessages && !isLoadingMore) {
      loadMoreMessages();
    }
  }, [hasMoreMessages, isLoadingMore, loadMoreMessages]);

  // Filter messages by search query
  const filteredMessages = useMemo(() => {
    if (!searchQuery.trim()) return messages;
    
    return messages.filter(message => 
      message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (room?.getMember(message.senderId)?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [messages, searchQuery, room]);

  // Render message content
  const renderMessageContent = useCallback((message: MessageEventData) => {
    if (message.redactedAt) {
      return <span className="italic text-gray-500">[Message deleted]</span>;
    }

    if (!message.isDecrypted && message.decryptionError) {
      return <span className="text-red-500">[Encryption error: {message.decryptionError}]</span>;
    }

    if (message.mediaInfo) {
      return renderMediaContent(message.mediaInfo);
    }

    // Handle text formatting (basic markdown support could be added here)
    return <span>{message.content}</span>;
  }, []);

  // Render media content
  const renderMediaContent = (media: MediaInfo) => {
    if (!enableMediaPreview || !media.url) {
      return <span>📎 {media.filename || 'Media file'}</span>;
    }

    switch (media.type) {
      case 'image':
        return (
          <img 
            src={media.url} 
            alt={media.filename || 'Image'}
            className="max-w-xs max-h-64 rounded cursor-pointer"
            onClick={() => window.open(media.url, '_blank')}
          />
        );
      case 'video':
        return (
          <video 
            src={media.url} 
            controls 
            className="max-w-xs max-h-64 rounded"
            preload="metadata"
          />
        );
      case 'audio':
        return (
          <audio 
            src={media.url} 
            controls 
            className="w-full max-w-xs"
            preload="metadata"
          />
        );
      default:
        return (
          <a 
            href={media.url} 
            download={media.filename}
            className="text-blue-500 hover:underline"
          >
            📎 {media.filename || 'Download file'}
            {media.size && ` (${(media.size / 1024 / 1024).toFixed(1)}MB)`}
          </a>
        );
    }
  };

  // Render message
  const renderMessage = useCallback((message: MessageEventData) => {
    const isOwnMessage = message.senderId === client?.getUserId();
    const senderName = room?.getMember(message.senderId)?.name || message.senderId;
    const isSelected = selectedMessageId === message.id;
    const isEditing = editingMessageId === message.id;

    return (
      <div 
        key={message.id}
        className={`message-item p-3 hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''} ${isOwnMessage ? 'text-right' : ''}`}
        onClick={() => {
          setSelectedMessageId(isSelected ? null : message.id);
          onMessageSelect?.(message);
        }}
      >
        <div className="flex items-start gap-2">
          {!isOwnMessage && (
            <div className="avatar w-8 h-8 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center">
              {senderName.charAt(0).toUpperCase()}
            </div>
          )}
          
          <div className={`message-content flex-1 ${isOwnMessage ? 'text-right' : ''}`}>
            <div className="message-header flex items-center gap-2 text-xs text-gray-500 mb-1">
              {!isOwnMessage && <span className="font-medium">{senderName}</span>}
              <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
              {message.editedAt && <span>(edited)</span>}
              {message.isEncrypted && <span>🔒</span>}
            </div>

            <div className="message-body">
              {isEditing ? (
                <div className="editing-form">
                  <textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    className="w-full p-2 border rounded resize-none"
                    rows={2}
                    autoFocus
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleEditMessage(message.id, editingContent)}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="px-3 py-1 bg-gray-500 text-white rounded text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                renderMessageContent(message)
              )}
            </div>

            {/* Message actions */}
            {isSelected && !isEditing && (
              <div className="message-actions flex gap-2 mt-2">
                {enableReactions && (
                  <div className="reactions flex gap-1">
                    {['👍', '👎', '❤️', '😄', '😮'].map(emoji => (
                      <button
                        key={emoji}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReaction(message.id, emoji);
                        }}
                        className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                {enableEditing && isOwnMessage && !message.redactedAt && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditing(message.id, message.content);
                    }}
                    className="px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded text-sm"
                  >
                    Edit
                  </button>
                )}

                {enableEditing && isOwnMessage && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteMessage(message.id);
                    }}
                    className="px-2 py-1 bg-red-100 hover:bg-red-200 rounded text-sm"
                  >
                    Delete
                  </button>
                )}

                {enableThreading && !message.threadRoot && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onThreadSelect?.(message.id);
                    }}
                    className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                  >
                    Reply in thread
                  </button>
                )}
              </div>
            )}

            {/* Reactions display */}
            {enableReactions && message.reactions.length > 0 && (
              <div className="reactions-display flex flex-wrap gap-1 mt-2">
                {message.reactions.map((reaction) => (
                  <button
                    key={reaction.emoji}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReaction(message.id, reaction.emoji);
                    }}
                    className={`reaction-pill px-2 py-1 rounded-full text-xs flex items-center gap-1 ${
                      reaction.hasUserReacted 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span>{reaction.emoji}</span>
                    <span>{reaction.count}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Thread replies indicator */}
            {enableThreading && message.threadReplies.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onThreadSelect?.(message.id);
                }}
                className="thread-indicator text-blue-500 hover:underline text-sm mt-1"
              >
                {message.threadReplies.length} {message.threadReplies.length === 1 ? 'reply' : 'replies'}
              </button>
            )}
          </div>

          {isOwnMessage && (
            <div className="avatar w-8 h-8 rounded-full bg-blue-500 flex-shrink-0 flex items-center justify-center text-white">
              You
            </div>
          )}
        </div>
      </div>
    );
  }, [
    client, 
    room, 
    selectedMessageId, 
    editingMessageId, 
    editingContent,
    onMessageSelect,
    onThreadSelect,
    enableReactions,
    enableEditing,
    enableThreading,
    handleReaction,
    handleEditMessage,
    handleDeleteMessage,
    startEditing,
    cancelEditing,
    renderMessageContent
  ]);

  if (error) {
    return (
      <div className={`message-thread error ${className}`}>
        <div className="text-center text-red-500 p-4">
          Error loading messages: {error}
          <button 
            onClick={() => loadMessages()}
            className="ml-2 px-3 py-1 bg-red-100 hover:bg-red-200 rounded text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`message-thread ${className}`}>
      {/* Search bar */}
      {enableSearch && (
        <div className="search-bar p-3 border-b">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="w-full p-2 border rounded"
          />
        </div>
      )}

      {/* Messages container */}
      <div 
        ref={messagesContainerRef}
        className="messages-container flex-1 overflow-y-auto"
        onScroll={handleScroll}
      >
        {/* Loading more indicator */}
        {isLoadingMore && (
          <div className="text-center p-4">
            <div className="inline-block animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}

        {/* Messages */}
        {isLoading ? (
          <div className="text-center p-4">
            <div className="inline-block animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="text-center text-gray-500 p-8">
            {searchQuery ? 'No messages match your search.' : 'No messages yet.'}
          </div>
        ) : (
          <div className="messages-list">
            {filteredMessages.map(renderMessage)}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Typing indicators */}
      {typingUsers.length > 0 && (
        <div className="typing-indicators p-3 border-t bg-gray-50">
          <div className="flex items-center gap-2">
            <div className="typing-animation flex gap-1">
              <div className="dot w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
              <div className="dot w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
              <div className="dot w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
            </div>
            <span className="text-gray-600 text-sm">
              {typingUsers.length === 1 
                ? `${typingUsers[0].displayName} is typing...`
                : `${typingUsers.length} people are typing...`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageThread;