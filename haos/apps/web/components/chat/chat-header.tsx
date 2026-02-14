'use client';

import React, { useState } from 'react';
import { Hash, Pin, Users, Search, Settings, Bell, HelpCircle, Lock, LockOpen, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PinnedMessagesModal } from '../pinned-messages';
import { usePins } from '@/hooks/use-pins';
import { useMatrix } from '../providers/matrix-provider';
import { getRoomEncryptionStatus } from '@/lib/matrix/crypto/room-encryption';

export interface ChatHeaderProps {
  /** The channel/room name */
  channelName: string;
  /** The Matrix room ID */
  roomId: string;
  /** Optional channel description */
  description?: string;
  /** Whether this is a voice channel */
  isVoiceChannel?: boolean;
  /** Number of online members */
  onlineMembers?: number;
  /** Total number of members */
  totalMembers?: number;
  /** Whether notifications are enabled */
  notificationsEnabled?: boolean;
  /** Callback for opening channel settings */
  onOpenSettings?: () => void;
  /** Callback for opening member list */
  onOpenMembers?: () => void;
  /** Callback for opening search */
  onOpenSearch?: () => void;
  /** Callback for toggling notifications */
  onToggleNotifications?: () => void;
  /** Show encryption status indicator */
  showEncryption?: boolean;
}

/**
 * Header component for chat channels that displays channel information,
 * pinned message count, and provides access to channel actions.
 */
export function ChatHeader({
  channelName,
  roomId,
  description,
  isVoiceChannel = false,
  onlineMembers,
  totalMembers,
  notificationsEnabled = true,
  onOpenSettings,
  onOpenMembers,
  onOpenSearch,
  onToggleNotifications,
  showEncryption = true,
}: ChatHeaderProps) {
  const [showPinnedMessages, setShowPinnedMessages] = useState(false);
  const { pinnedMessages } = usePins(roomId);
  const { client } = useMatrix();
  
  // Get room encryption status
  const room = client?.getRoom(roomId);
  const encryptionStatus = room && client ? getRoomEncryptionStatus(client, room) : null;

  const handleOpenPinnedMessages = () => {
    setShowPinnedMessages(true);
  };

  const handleJumpToMessage = (eventId: string) => {
    // This would typically scroll to the message in the chat
    console.log('Jumping to message:', eventId);
    // TODO: Implement message scrolling/navigation
  };

  return (
    <>
      <header className="h-12 px-4 flex items-center justify-between border-b border-black/20 shadow-sm bg-[#313338] flex-shrink-0">
        {/* Left side - Channel info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            {isVoiceChannel ? (
              <div className="flex items-center justify-center w-6 h-6 rounded bg-green-500/20">
                <div className="w-3 h-3 rounded bg-green-500"></div>
              </div>
            ) : (
              <Hash className="w-6 h-6 text-gray-400 flex-shrink-0" aria-hidden="true" />
            )}
            <h1 className="font-semibold text-white truncate">{channelName}</h1>
          </div>

          {/* Encryption indicator */}
          {showEncryption && encryptionStatus && (
            <div className="flex items-center gap-1 ml-2">
              {encryptionStatus.isEncrypted ? (
                <div className="flex items-center gap-1">
                  {encryptionStatus.canDecrypt ? (
                    <div title="End-to-end encrypted">
                      <Lock className="w-4 h-4 text-green-400" />
                    </div>
                  ) : (
                    <div title="Encrypted but cannot decrypt">
                      <LockOpen className="w-4 h-4 text-yellow-400" />
                    </div>
                  )}
                  <span className="text-xs text-green-400 hidden md:inline">
                    E2E
                  </span>
                </div>
              ) : (
                <div title="Not encrypted">
                  <Shield className="w-4 h-4 text-gray-500" />
                </div>
              )}
            </div>
          )}
          
          {description && (
            <div className="h-6 w-px bg-gray-600 mx-1" aria-hidden="true" />
          )}
          
          {description && (
            <p className="text-sm text-gray-400 truncate max-w-xs">{description}</p>
          )}
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-1">
          {/* Pinned messages button */}
          {pinnedMessages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenPinnedMessages}
              className="h-8 px-2 text-gray-400 hover:text-white hover:bg-discord-hover relative"
              aria-label={`View ${pinnedMessages.length} pinned messages`}
            >
              <Pin className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 bg-discord-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                {pinnedMessages.length}
              </span>
            </Button>
          )}

          {/* Notifications toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleNotifications}
            className="h-8 px-2 text-gray-400 hover:text-white hover:bg-discord-hover"
            aria-label={`${notificationsEnabled ? 'Disable' : 'Enable'} notifications`}
          >
            <Bell className={`h-4 w-4 ${notificationsEnabled ? '' : 'opacity-50'}`} />
          </Button>

          {/* Search */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenSearch}
            className="h-8 px-2 text-gray-400 hover:text-white hover:bg-discord-hover"
            aria-label="Search messages"
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Members list */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenMembers}
            className="h-8 px-2 text-gray-400 hover:text-white hover:bg-discord-hover relative"
            aria-label="Member list"
          >
            <Users className="h-4 w-4" />
            {(onlineMembers !== undefined || totalMembers !== undefined) && (
              <span className="ml-1 text-xs">
                {onlineMembers !== undefined && totalMembers !== undefined
                  ? `${onlineMembers}/${totalMembers}`
                  : totalMembers || onlineMembers}
              </span>
            )}
          </Button>

          {/* Help */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-gray-400 hover:text-white hover:bg-discord-hover"
            aria-label="Help"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>

          {/* Settings */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenSettings}
            className="h-8 px-2 text-gray-400 hover:text-white hover:bg-discord-hover"
            aria-label="Channel settings"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Pinned Messages Modal */}
      <PinnedMessagesModal
        open={showPinnedMessages}
        onOpenChange={setShowPinnedMessages}
        roomId={roomId}
        onJumpToMessage={handleJumpToMessage}
      />
    </>
  );
}