import React, { useState, useMemo, useCallback } from 'react';
import { MatrixClient } from 'matrix-js-sdk';
import { getAvatarDisplayInfo } from '@/lib/utils/avatar-utils';

interface MatrixReaction {
  emoji: string;
  users: string[]; // Matrix user IDs who reacted
}

interface DiscordChatItemProps {
  message: {
    id: string;
    content: string;
    sender: string;
    timestamp: number;
    roomId: string;
    reactions?: MatrixReaction[];
    avatarUrl?: string; // mxc:// URL or HTTP URL
    senderDisplayName?: string;
    editedAt?: number;
    pinned?: boolean;
    replyTo?: {
      id: string;
      content: string;
      sender: string;
      senderDisplayName?: string;
    };
  };
  matrixClient: MatrixClient;
  currentUserId: string;
  isGrouped?: boolean; // Whether this message is grouped with previous message from same user
  showAvatar?: boolean; // Whether to show avatar (false for grouped messages)
  isFirstInGroup?: boolean; // Whether this is the first message in a group
}

export const DiscordChatItem: React.FC<DiscordChatItemProps> = ({ 
  message, 
  matrixClient, 
  currentUserId,
  isGrouped = false,
  showAvatar = true,
  isFirstInGroup = true
}) => {
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [localReactions, setLocalReactions] = useState<MatrixReaction[]>(message.reactions || []);
  const [showActions, setShowActions] = useState(false);

  const addReaction = useCallback(async (emoji: string) => {
    try {
      // Optimistic UI update
      const updatedReactions = [...localReactions];
      const existingReactionIndex = updatedReactions.findIndex(r => r.emoji === emoji);
      
      if (existingReactionIndex !== -1) {
        if (!updatedReactions[existingReactionIndex].users.includes(currentUserId)) {
          updatedReactions[existingReactionIndex].users.push(currentUserId);
        }
      } else {
        updatedReactions.push({ emoji, users: [currentUserId] });
      }
      
      setLocalReactions(updatedReactions);
      setIsEmojiPickerOpen(false);

      // Actual Matrix reaction
      await (matrixClient as any).sendEvent(
        message.roomId, 
        'm.reaction', 
        {
          "m.relates_to": {
            "rel_type": "m.annotation",
            "event_id": message.id,
            "key": emoji
          }
        }
      );
    } catch (error) {
      console.error('Failed to add reaction:', error);
      // Rollback optimistic update if failed
      setLocalReactions(message.reactions || []);
    }
  }, [message.id, currentUserId, matrixClient, localReactions]);

  const removeReaction = useCallback(async (emoji: string) => {
    try {
      // Optimistic UI update
      const updatedReactions = localReactions.map(reaction => ({
        ...reaction,
        users: reaction.users.filter(user => user !== currentUserId)
      })).filter(reaction => reaction.users.length > 0);
      
      setLocalReactions(updatedReactions);

      // Find and redact the specific reaction
      const reactionEvent = await matrixClient.relations(
        message.roomId,
        message.id, 
        'm.annotation', 
        'm.reaction'
      );
      
      if (reactionEvent.events.length > 0) {
        const eventId = reactionEvent.events[0].getId();
        if (eventId) {
          await matrixClient.redactEvent(
            message.roomId, 
            eventId
          );
        }
      }
    } catch (error) {
      console.error('Failed to remove reaction:', error);
      // Rollback optimistic update if failed
      setLocalReactions(message.reactions || []);
    }
  }, [message.id, currentUserId, matrixClient, localReactions]);

  const reactionSummary = useMemo(() => {
    return localReactions.map(reaction => ({
      emoji: reaction.emoji,
      count: reaction.users.length,
      userReacted: reaction.users.includes(currentUserId)
    }));
  }, [localReactions, currentUserId]);

  // Convert mxc:// avatar URLs to HTTP URLs using Matrix client
  const avatarInfo = useMemo(() => {
    return getAvatarDisplayInfo(
      matrixClient,
      message.avatarUrl,
      message.senderDisplayName || message.sender,
      undefined,
      40
    );
  }, [matrixClient, message.avatarUrl, message.senderDisplayName, message.sender]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateString = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today at ' + formatTime(timestamp);
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday at ' + formatTime(timestamp);
    } else {
      return date.toLocaleDateString() + ' at ' + formatTime(timestamp);
    }
  };

  return (
    <div 
      className={`discord-message ${isGrouped ? 'discord-message-grouped' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Reply context */}
      {message.replyTo && !isGrouped && (
        <div className="discord-message-reply-context">
          <div className="discord-reply-spine"></div>
          <div className="discord-reply-content">
            <span className="discord-reply-username">
              {message.replyTo.senderDisplayName || message.replyTo.sender}
            </span>
            <span className="discord-reply-text">
              {message.replyTo.content.length > 50 
                ? message.replyTo.content.substring(0, 50) + '...' 
                : message.replyTo.content}
            </span>
          </div>
        </div>
      )}

      <div className="discord-message-content">
        {/* Avatar column */}
        <div className="discord-message-avatar">
          {showAvatar && isFirstInGroup ? (
            <div className="discord-avatar">
              {avatarInfo.hasAvatar ? (
                <img 
                  src={avatarInfo.httpUrl!} 
                  alt={message.senderDisplayName || message.sender} 
                  className="discord-avatar-image"
                />
              ) : (
                <span className="discord-avatar-initials">{avatarInfo.initials}</span>
              )}
            </div>
          ) : isGrouped ? (
            <div className="discord-message-timestamp-compact">
              {formatTime(message.timestamp)}
            </div>
          ) : null}
        </div>

        {/* Message text column */}
        <div className="discord-message-text">
          {/* Message header - only show for first message in group */}
          {!isGrouped && isFirstInGroup && (
            <div className="discord-message-header">
              <span className="discord-username">
                {message.senderDisplayName || message.sender}
              </span>
              <span className="discord-timestamp">
                {formatDateString(message.timestamp)}
              </span>
            </div>
          )}
          
          {/* Message content */}
          <div className="discord-message-body">
            {message.content}
            {message.editedAt && (
              <span className="discord-edited-indicator"> (edited)</span>
            )}
          </div>

          {/* Reactions */}
          {reactionSummary.length > 0 && (
            <div className="discord-reactions">
              {reactionSummary.map((reaction, index) => (
                <button
                  key={`${reaction.emoji}-${index}`}
                  className={`discord-reaction ${reaction.userReacted ? 'discord-reaction-reacted' : ''}`}
                  onClick={() => reaction.userReacted 
                    ? removeReaction(reaction.emoji) 
                    : addReaction(reaction.emoji)
                  }
                  title={`${reaction.count} reaction${reaction.count > 1 ? 's' : ''}`}
                >
                  <span className="discord-reaction-emoji">{reaction.emoji}</span>
                  <span className="discord-reaction-count">{reaction.count}</span>
                </button>
              ))}
            </div>
          )}

          {/* Message actions toolbar - shows on hover */}
          {showActions && (
            <div className="discord-message-actions">
              <button 
                className="discord-action-button"
                onClick={() => addReaction('👍')}
                title="Add Reaction"
              >
                <span className="discord-action-icon">😊</span>
              </button>
              <button 
                className="discord-action-button"
                title="Reply"
              >
                <span className="discord-action-icon">💬</span>
              </button>
              <button 
                className="discord-action-button"
                title="Create Thread"
              >
                <span className="discord-action-icon">🧵</span>
              </button>
              <button 
                className="discord-action-button"
                title="More"
              >
                <span className="discord-action-icon">⋯</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to determine message grouping
export const shouldGroupMessages = (
  currentMessage: { sender: string; timestamp: number },
  previousMessage?: { sender: string; timestamp: number }
): boolean => {
  if (!previousMessage) return false;
  
  // Same author
  if (currentMessage.sender !== previousMessage.sender) return false;
  
  // Within 7 minutes of previous message
  const timeDiff = currentMessage.timestamp - previousMessage.timestamp;
  const sevenMinutes = 7 * 60 * 1000;
  
  return timeDiff <= sevenMinutes;
};