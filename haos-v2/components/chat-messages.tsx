'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useMatrixMessaging } from '@/hooks/use-matrix-messaging';
import { MatrixClient, MatrixEvent, EventType } from 'matrix-js-sdk';

interface MatrixMessage {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
  };
  timestamp: Date;
  reactions?: Array<{
    emoji: string;
    count: number;
    users: string[];
  }>;
  isEdited?: boolean;
  replyTo?: string;
  eventId: string; // Matrix event ID for reactions
}

interface ChatMessagesProps {
  messages: MatrixMessage[];
  currentUserId: string;
  roomId: string;
  client?: MatrixClient;
  onMessageReply?: (messageId: string) => void;
  onMessageEdit?: (messageId: string, newContent: string) => void;
  onMessageDelete?: (messageId: string) => void;
  onRefresh?: () => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

// Message bubble component adapted for Matrix
const MessageBubble: React.FC<{
  message: MatrixMessage;
  isOwn: boolean;
  onLongPress: () => void;
  onReactionAdd?: (emoji: string) => void;
}> = ({ message, isOwn, onLongPress, onReactionAdd }) => {
  const [showReactions, setShowReactions] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const pressTimer = useRef<NodeJS.Timeout | null>(null);
  
  // Long press handlers using mouse/touch events
  const handleStart = useCallback(() => {
    setIsPressed(true);
    pressTimer.current = setTimeout(() => {
      onLongPress();
      // Haptic feedback on supported devices
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500);
  }, [onLongPress]);

  const handleEnd = useCallback(() => {
    setIsPressed(false);
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (pressTimer.current) {
        clearTimeout(pressTimer.current);
        pressTimer.current = null;
      }
    };
  }, []);

  return (
    <div
      className={`
        flex w-full px-3 py-1 transition-opacity duration-200
        ${isOwn ? 'justify-end' : 'justify-start'}
        ${isPressed ? 'opacity-75' : 'opacity-100'}
        animate-in fade-in-0 slide-in-from-bottom-1 duration-200
      `}
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleStart}
      onTouchEnd={handleEnd}
      style={{ 
        userSelect: 'none',
        WebkitUserSelect: 'none'
      }}
    >
      <div className={`flex max-w-[85%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar - only show for others' messages */}
        {!isOwn && (
          <div className="flex-shrink-0 mr-2 mt-1">
            <div className="w-8 h-8 rounded-full bg-gray-400 overflow-hidden">
              {message.sender.avatar ? (
                <img 
                  src={message.sender.avatar} 
                  alt={message.sender.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-sm font-semibold">
                  {message.sender.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Message content */}
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
          {/* Sender name (only for others) */}
          {!isOwn && (
            <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 px-3">
              {message.sender.name}
            </span>
          )}
          
          {/* Message bubble */}
          <div
            className={`
              relative px-4 py-2 rounded-2xl max-w-full break-words
              ${isOwn 
                ? 'bg-blue-600 text-white rounded-br-md' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-md'
              }
              min-h-[44px] flex items-center
              touch-manipulation
              active:scale-[0.98] transition-transform duration-100
              cursor-pointer
            `}
          >
            <p className="text-base leading-relaxed">{message.content}</p>
            {message.isEdited && (
              <span className="text-xs opacity-70 ml-2">(edited)</span>
            )}
          </div>

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1 px-2">
              {message.reactions.map((reaction, index) => (
                <button
                  key={index}
                  className="
                    flex items-center gap-1 px-2 py-1 rounded-full
                    bg-gray-100 dark:bg-gray-600
                    text-xs font-medium
                    min-h-[32px] min-w-[32px]
                    touch-manipulation
                    hover:bg-gray-200 dark:hover:bg-gray-500
                    active:scale-95 transition-all duration-100
                  "
                  onClick={() => onReactionAdd?.(reaction.emoji)}
                >
                  <span className="text-sm">{reaction.emoji}</span>
                  <span className="text-gray-600 dark:text-gray-300">
                    {reaction.count}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Timestamp */}
          <span className={`
            text-xs text-gray-400 mt-1 px-2
            ${isOwn ? 'text-right' : 'text-left'}
          `}>
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
      </div>
    </div>
  );
};

// Message action sheet for mobile
const MessageActionSheet: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  message: MatrixMessage;
  isOwn: boolean;
  onReply?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onReaction?: (emoji: string) => void;
}> = ({ isOpen, onClose, message, isOwn, onReply, onEdit, onDelete, onReaction }) => {
  const quickReactions = ['👍', '❤️', '😂', '😮', '😢', '😡'];

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Action sheet */}
      <div
        className="
          fixed bottom-0 left-0 right-0 z-50
          bg-white dark:bg-gray-800 rounded-t-2xl
          pb-safe max-h-[60vh] overflow-y-auto
          animate-in slide-in-from-bottom duration-300
        "
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>

        {/* Quick reactions */}
        <div className="px-4 pb-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Quick Reactions
          </h3>
          <div className="flex gap-3 justify-center">
            {quickReactions.map((emoji) => (
              <button
                key={emoji}
                className="
                  w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700
                  flex items-center justify-center text-xl
                  touch-manipulation hover:scale-110 active:scale-95
                  transition-transform duration-100
                "
                onClick={() => {
                  onReaction?.(emoji);
                  onClose();
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          <button
            className="
              w-full px-6 py-4 text-left
              text-gray-900 dark:text-gray-100
              hover:bg-gray-50 dark:hover:bg-gray-700
              min-h-[56px] flex items-center
              touch-manipulation
            "
            onClick={() => {
              onReply?.();
              onClose();
            }}
          >
            <span className="mr-3 text-lg">💬</span>
            Reply to message
          </button>

          {isOwn && (
            <>
              <button
                className="
                  w-full px-6 py-4 text-left
                  text-gray-900 dark:text-gray-100
                  hover:bg-gray-50 dark:hover:bg-gray-700
                  min-h-[56px] flex items-center
                  touch-manipulation border-t border-gray-100 dark:border-gray-600
                "
                onClick={() => {
                  onEdit?.();
                  onClose();
                }}
              >
                <span className="mr-3 text-lg">✏️</span>
                Edit message
              </button>
              
              <button
                className="
                  w-full px-6 py-4 text-left
                  text-red-600 dark:text-red-400
                  hover:bg-red-50 dark:hover:bg-red-900/20
                  min-h-[56px] flex items-center
                  touch-manipulation border-t border-gray-100 dark:border-gray-600
                "
                onClick={() => {
                  onDelete?.();
                  onClose();
                }}
              >
                <span className="mr-3 text-lg">🗑️</span>
                Delete message
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export const ChatMessages: React.FC<ChatMessagesProps> = ({
  messages,
  currentUserId,
  roomId,
  client,
  onMessageReply,
  onMessageEdit,
  onMessageDelete,
  onRefresh,
  isLoading = false,
  className = ''
}) => {
  const [selectedMessage, setSelectedMessage] = useState<MatrixMessage | null>(null);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Matrix messaging integration
  const { sendReaction } = useMatrixMessaging({ client, roomId });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Pull to refresh implementation
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      const touch = e.touches[0];
      containerRef.current.dataset.touchStart = String(touch.clientY);
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const container = containerRef.current;
    if (!container || !container.dataset.touchStart) return;
    
    const touch = e.touches[0];
    const startY = parseInt(container.dataset.touchStart);
    const currentY = touch.clientY;
    const deltaY = currentY - startY;
    
    if (deltaY > 80 && !isRefreshing && onRefresh) {
      setIsRefreshing(true);
      onRefresh().finally(() => setIsRefreshing(false));
    }
  }, [isRefreshing, onRefresh]);

  const handleTouchEnd = useCallback(() => {
    if (containerRef.current) {
      delete containerRef.current.dataset.touchStart;
    }
  }, []);

  const handleMessageLongPress = useCallback((message: MatrixMessage) => {
    setSelectedMessage(message);
    setShowActionSheet(true);
  }, []);

  const handleReaction = useCallback(async (emoji: string) => {
    if (selectedMessage && client) {
      try {
        await sendReaction(selectedMessage.eventId, emoji);
      } catch (error) {
        console.error('Failed to send reaction:', error);
      }
    }
  }, [selectedMessage, sendReaction, client]);

  const handleReply = useCallback(() => {
    if (selectedMessage) {
      onMessageReply?.(selectedMessage.id);
    }
  }, [selectedMessage, onMessageReply]);

  const handleEdit = useCallback(() => {
    if (selectedMessage) {
      onMessageEdit?.(selectedMessage.id, selectedMessage.content);
    }
  }, [selectedMessage, onMessageEdit]);

  const handleDelete = useCallback(() => {
    if (selectedMessage) {
      onMessageDelete?.(selectedMessage.id);
    }
  }, [selectedMessage, onMessageDelete]);

  const handleDirectReaction = useCallback(async (messageId: string, emoji: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message && client) {
      try {
        await sendReaction(message.eventId, emoji);
      } catch (error) {
        console.error('Failed to send reaction:', error);
      }
    }
  }, [messages, sendReaction, client]);

  return (
    <div 
      ref={containerRef}
      className={`
        flex-1 overflow-hidden relative bg-[#313338]
        ${className}
      `}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull to refresh indicator */}
      {isRefreshing && (
        <div className="absolute top-0 left-0 right-0 z-10 flex justify-center py-2">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
            <span className="text-sm">Loading more messages...</span>
          </div>
        </div>
      )}

      {/* Messages container */}
      <div className="
        h-full overflow-y-auto overscroll-y-contain
        pb-4 pt-2
      " style={{ WebkitOverflowScrolling: 'touch' }}>
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-center py-4">
            <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" />
          </div>
        )}

        {/* Messages */}
        <div className="space-y-0">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.sender.id === currentUserId}
              onLongPress={() => handleMessageLongPress(message)}
              onReactionAdd={(emoji) => handleDirectReaction(message.id, emoji)}
            />
          ))}
        </div>

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message action sheet */}
      <MessageActionSheet
        isOpen={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        message={selectedMessage!}
        isOwn={selectedMessage?.sender.id === currentUserId}
        onReply={handleReply}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onReaction={handleReaction}
      />

    </div>
  );
};

export default ChatMessages;