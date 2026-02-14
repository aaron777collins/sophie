import React, { useState, useMemo, useCallback } from 'react';
import { Client } from 'matrix-js-sdk';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { EmojiPicker } from '@/components/emoji/emoji-picker';

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
    reactions?: MatrixReaction[];
  };
  matrixClient: Client;
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
      await matrixClient.sendReaction(message.id, emoji);
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
        message.id, 
        'm.annotation', 
        'm.reaction',
        { fromUserId: currentUserId }
      );
      
      if (reactionEvent.events.length > 0) {
        await matrixClient.redactEvent(
          reactionEvent.events[0].getRoomId(), 
          reactionEvent.events[0].getId()
        );
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

  return (
    <div className="chat-item">
      <div className="message-content">{message.content}</div>
      
      {/* Reactions Display */}
      <div className="message-reactions">
        {reactionSummary.map(reaction => (
          <TooltipProvider key={reaction.emoji}>
            <Tooltip>
              <TooltipTrigger 
                className={`reaction ${reaction.userReacted ? 'user-reacted' : ''}`}
                onClick={() => reaction.userReacted 
                  ? removeReaction(reaction.emoji) 
                  : addReaction(reaction.emoji)
                }
              >
                {reaction.emoji} {reaction.count > 1 ? reaction.count : ''}
              </TooltipTrigger>
              <TooltipContent>
                Reacted by: {localReactions
                  .find(r => r.emoji === reaction.emoji)
                  ?.users.join(', ') || ''}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
      {isEmojiPickerOpen && (
        <EmojiPicker 
          onEmojiSelect={(emoji) => {
            addReaction(emoji);
            setIsEmojiPickerOpen(false);
          }}
          onClose={() => setIsEmojiPickerOpen(false)}
        />
      )}
    </div>
  );
};