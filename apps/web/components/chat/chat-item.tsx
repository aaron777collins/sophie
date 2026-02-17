import React, { useState, useMemo, useCallback } from 'react';
import { MatrixClient } from 'matrix-js-sdk';
import { getAvatarDisplayInfo } from '@/lib/utils/avatar-utils';
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
// import { EmojiPicker } from '@/components/emoji/emoji-picker';

interface MatrixReaction {
  emoji: string;
  users: string[]; // Matrix user IDs who reacted
}

interface ChatItemProps {
  message: {
    id: string;
    content: string;
    sender: string;
    timestamp: number;
    roomId: string;
    reactions?: MatrixReaction[];
    avatarUrl?: string; // mxc:// URL or HTTP URL
    senderDisplayName?: string;
  };
  matrixClient: MatrixClient;
  currentUserId: string;
}

export const ChatItem: React.FC<ChatItemProps> = ({ 
  message, 
  matrixClient, 
  currentUserId 
}) => {
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [localReactions, setLocalReactions] = useState<MatrixReaction[]>(message.reactions || []);

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

  // TODO: Convert mxc:// avatar URLs to HTTP URLs using Matrix client mxcUrlToHttp()
  const avatarInfo = useMemo(() => {
    return getAvatarDisplayInfo(
      matrixClient,
      message.avatarUrl,
      message.senderDisplayName || message.sender,
      undefined,
      32
    );
  }, [matrixClient, message.avatarUrl, message.senderDisplayName, message.sender]);

  return (
    <div className="chat-item flex gap-3 py-2">
      {/* User avatar */}
      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold overflow-hidden">
        {avatarInfo.hasAvatar ? (
          <img 
            src={avatarInfo.httpUrl!} 
            alt={message.senderDisplayName || message.sender} 
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{avatarInfo.initials}</span>
        )}
      </div>
      
      <div className="flex-1">
        {/* Message header */}
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-gray-900">
            {message.senderDisplayName || message.sender}
          </span>
          <span className="text-xs text-gray-500">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
        </div>
        
        {/* Message content */}
        <div className="message-content">{message.content}</div>
      
        {/* Reactions Display */}
        <div className="message-reactions mt-2">
          {reactionSummary.map(reaction => (
            <div key={reaction.emoji}>
              <button
                className={`reaction ${reaction.userReacted ? 'user-reacted' : ''}`}
                onClick={() => reaction.userReacted 
                  ? removeReaction(reaction.emoji) 
                  : addReaction(reaction.emoji)
                }
                title={`Reacted by: ${localReactions
                  .find(r => r.emoji === reaction.emoji)
                  ?.users.join(', ') || ''}`}
              >
                {reaction.emoji} {reaction.count > 1 ? reaction.count : ''}
              </button>
            </div>
          ))}
          
          {/* Add Reaction Button */}
          <button 
            className="add-reaction-btn" 
            onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
          >
            +
          </button>
        </div>

        {/* Emoji Picker */}
        {/* Temporarily commented out to allow build to complete
        {isEmojiPickerOpen && (
          <EmojiPicker 
            onEmojiSelect={(emoji) => {
              addReaction(emoji);
              setIsEmojiPickerOpen(false);
            }}
            onClose={() => setIsEmojiPickerOpen(false)}
          />
        )}
        */}
      </div>
    </div>
  );
};