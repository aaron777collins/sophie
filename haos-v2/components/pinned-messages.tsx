'use client';

import React from 'react';
import { X, Pin } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { usePins, PinnedMessage } from '@/hooks/use-pins';

interface PinnedMessagesModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when modal open state changes */
  onOpenChange: (open: boolean) => void;
  /** Matrix room ID */
  roomId: string;
  /** Callback when jumping to a message */
  onJumpToMessage: (eventId: string) => void;
}

interface PinnedMessageItemProps {
  message: PinnedMessage;
  onJumpToMessage: (eventId: string) => void;
}

function PinnedMessageItem({ message, onJumpToMessage }: PinnedMessageItemProps) {
  const handleJumpToMessage = () => {
    onJumpToMessage(message.eventId);
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(timestamp);
  };

  return (
    <div className="p-4 border border-gray-700 rounded-lg hover:bg-gray-700/20 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold text-white">
              {message.sender.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-semibold text-white">{message.sender}</p>
            <p className="text-xs text-gray-400">{formatTimestamp(message.timestamp)}</p>
          </div>
        </div>
        <Pin className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-1" />
      </div>
      
      <div className="mb-3">
        <p className="text-gray-100 whitespace-pre-wrap break-words">{message.content}</p>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleJumpToMessage}
        className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 p-2 h-auto"
      >
        Jump to Message
      </Button>
    </div>
  );
}

export function PinnedMessagesModal({
  open,
  onOpenChange,
  roomId,
  onJumpToMessage
}: PinnedMessagesModalProps) {
  const { pinnedMessages, isLoading, error } = usePins(roomId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] bg-gray-800 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Pin className="w-5 h-5 text-yellow-400" />
            Pinned Messages
            <span className="text-sm text-gray-400 font-normal">
              ({pinnedMessages.length})
            </span>
          </DialogTitle>
          <DialogDescription>
            View and navigate to messages that have been pinned in this channel.
          </DialogDescription>
          <DialogClose asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 text-gray-400 hover:text-white"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="mt-4">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              <span className="ml-2 text-gray-400">Loading pinned messages...</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400">Failed to load pinned messages</p>
              <p className="text-xs text-red-300 mt-1">{error}</p>
            </div>
          )}

          {!isLoading && !error && pinnedMessages.length === 0 && (
            <div className="text-center py-8">
              <Pin className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 text-lg">No pinned messages</p>
              <p className="text-gray-500 text-sm mt-1">
                Pinned messages will appear here when they're added to this channel.
              </p>
            </div>
          )}

          {!isLoading && !error && pinnedMessages.length > 0 && (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {pinnedMessages.map((message) => (
                <PinnedMessageItem
                  key={message.id}
                  message={message}
                  onJumpToMessage={onJumpToMessage}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}