'use client';

import React from 'react';
import { Pin, MessageSquare, Copy, Trash2, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { usePins } from '@/hooks/use-pins';

export interface MessageActionsProps {
  /** The Matrix event ID of the message */
  eventId: string;
  /** The Matrix room ID */
  roomId: string;
  /** The message content (for copy functionality) */
  content: string;
  /** Whether the current user can delete this message */
  canDelete?: boolean;
  /** Whether the current user can pin messages in this room */
  canPin?: boolean;
  /** Callback for starting a thread from this message */
  onStartThread?: () => void;
  /** Callback for copying message content */
  onCopy?: (content: string) => void;
  /** Callback for deleting the message */
  onDelete?: () => void;
}

/**
 * Context menu component for message actions including pin/unpin, thread creation,
 * copy, and delete functionality. Integrates with Matrix protocol for pinning.
 */
export function MessageActions({
  eventId,
  roomId,
  content,
  canDelete = false,
  canPin = true,
  onStartThread,
  onCopy,
  onDelete,
}: MessageActionsProps) {
  const { pinnedMessages, pinMessage, unpinMessage } = usePins(roomId);
  
  // Check if this message is currently pinned
  const isPinned = pinnedMessages.some(msg => msg.eventId === eventId);

  const handlePin = async () => {
    if (isPinned) {
      await unpinMessage(eventId);
    } else {
      await pinMessage(eventId);
    }
  };

  const handleCopy = () => {
    if (onCopy) {
      onCopy(content);
    } else {
      // Default copy behavior
      navigator.clipboard.writeText(content).catch(console.error);
    }
  };

  const handleStartThread = () => {
    if (onStartThread) {
      onStartThread();
    } else {
      // Default thread behavior - could open a modal or navigate
      console.log('Starting thread from message:', eventId);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    } else {
      // Default delete behavior
      console.log('Deleting message:', eventId);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-discord-hover"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Message actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {canPin && (
          <DropdownMenuItem onClick={handlePin}>
            <Pin className="mr-2 h-4 w-4" />
            {isPinned ? 'Unpin Message' : 'Pin Message'}
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem onClick={handleStartThread}>
          <MessageSquare className="mr-2 h-4 w-4" />
          Start Thread
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleCopy}>
          <Copy className="mr-2 h-4 w-4" />
          Copy Message
        </DropdownMenuItem>
        
        {canDelete && (
          <DropdownMenuItem 
            onClick={handleDelete}
            className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Message
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}