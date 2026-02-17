'use client';

import React from 'react';
import { X, Pin, Clock, User, MessageSquare } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePins, PinnedMessage } from '@/hooks/use-pins';
import { useMatrixClient } from '@/hooks/use-matrix-client';
import { getAvatarDisplayInfo } from '@/lib/utils/avatar-utils';

export interface PinnedMessagesModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback to change the open state */
  onOpenChange: (open: boolean) => void;
  /** The Matrix room ID to display pinned messages for */
  roomId: string;
  /** Optional callback when a user wants to jump to the original message */
  onJumpToMessage?: (eventId: string) => void;
}

/**
 * Modal component that displays all pinned messages for a Matrix room.
 * Provides functionality to view pinned message content, timestamps, and
 * optionally jump to the original message location.
 */
export function PinnedMessagesModal({
  open,
  onOpenChange,
  roomId,
  onJumpToMessage,
}: PinnedMessagesModalProps) {
  const { pinnedMessages, isLoading, error, unpinMessage } = usePins(roomId);
  const { client: matrixClient } = useMatrixClient();

  const handleJumpToMessage = (eventId: string) => {
    if (onJumpToMessage) {
      onJumpToMessage(eventId);
    } else {
      // Default behavior - could scroll to message in chat
      console.log('Jumping to message:', eventId);
    }
    // Close modal after jumping
    onOpenChange(false);
  };

  const handleUnpinMessage = async (eventId: string) => {
    await unpinMessage(eventId);
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const formatSender = (sender: string) => {
    // Extract display name from Matrix user ID (@username:homeserver.org)
    if (sender.startsWith('@')) {
      const parts = sender.split(':');
      return parts[0]?.substring(1) || sender; // Remove @ prefix, fallback to full sender
    }
    return sender;
  };

  const truncateContent = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] bg-discord-dark border-discord-light">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Pin className="h-5 w-5 text-yellow-500" />
            Pinned Messages
            <span className="text-sm text-gray-400 font-normal">
              ({pinnedMessages.length})
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-discord-accent"></div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-32 text-red-400">
              <p>Failed to load pinned messages: {error}</p>
            </div>
          ) : pinnedMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-400">
              <Pin className="h-12 w-12 mb-2 opacity-50" />
              <p className="text-lg font-medium">No Pinned Messages</p>
              <p className="text-sm">Messages pinned in this channel will appear here.</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="space-y-4 pr-4">
                {pinnedMessages.map((message) => (
                  <div
                    key={message.eventId}
                    className="bg-discord-light/50 rounded-lg p-4 border border-discord-light/20 hover:bg-discord-light/70 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Message header */}
                        <div className="flex items-center gap-2 mb-2">
                          {(() => {
                            // TODO: Get actual avatar URL from Matrix user profile
                            const avatarInfo = getAvatarDisplayInfo(
                              matrixClient,
                              message.avatarUrl, // This should come from the message/user data
                              formatSender(message.sender),
                              undefined,
                              16
                            );
                            
                            return (
                              <div className="w-4 h-4 rounded-full bg-discord-accent flex items-center justify-center text-xs font-semibold text-white overflow-hidden">
                                {avatarInfo.hasAvatar ? (
                                  <img 
                                    src={avatarInfo.httpUrl!} 
                                    alt={formatSender(message.sender)} 
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span>{avatarInfo.initials}</span>
                                )}
                              </div>
                            );
                          })()}
                          <span className="text-sm font-medium text-white">
                            {formatSender(message.sender)}
                          </span>
                          <Clock className="h-3 w-3 text-gray-500" />
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(message.timestamp)}
                          </span>
                        </div>

                        {/* Message content */}
                        <div className="text-gray-200 text-sm leading-relaxed mb-3">
                          {message.type === 'm.image' ? (
                            <div className="flex items-center gap-2 text-discord-accent">
                              <MessageSquare className="h-4 w-4" />
                              <span>Image message</span>
                            </div>
                          ) : message.type === 'm.file' ? (
                            <div className="flex items-center gap-2 text-discord-accent">
                              <MessageSquare className="h-4 w-4" />
                              <span>File attachment</span>
                            </div>
                          ) : (
                            <p>{truncateContent(message.content)}</p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleJumpToMessage(message.eventId)}
                            className="text-discord-accent hover:text-discord-accent hover:bg-discord-accent/10"
                          >
                            Jump to Message
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleUnpinMessage(message.eventId)}
                            className="text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10"
                          >
                            <Pin className="h-3 w-3 mr-1" />
                            Unpin
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}