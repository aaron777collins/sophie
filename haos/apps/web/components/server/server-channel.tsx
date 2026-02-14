'use client';

import { useState, useMemo } from 'react';
import { Hash, Volume2, Lock, Crown, Users, Mic, MicOff } from 'lucide-react';
import { useVoiceStore, VoiceParticipant } from '@/stores/voice-store';
import { cn } from '@/lib/utils';

export type ChannelType = 'text' | 'voice' | 'video' | 'announcement' | 'forum';

export interface ServerChannelProps {
  id: string;
  name: string;
  type: ChannelType;
  isPrivate?: boolean;
  isActive?: boolean;
  unreadCount?: number;
  hasUnreadMentions?: boolean;
  participants?: VoiceParticipant[];
  maxParticipants?: number;
  isUserInChannel?: boolean;
  onClick?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  className?: string;
}

export function ServerChannel({
  id,
  name,
  type,
  isPrivate = false,
  isActive = false,
  unreadCount = 0,
  hasUnreadMentions = false,
  participants = [],
  maxParticipants,
  isUserInChannel = false,
  onClick,
  onContextMenu,
  className,
}: ServerChannelProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { currentChannel, connectionState } = useVoiceStore();

  // Check if this is the currently connected voice channel
  const isConnectedVoiceChannel = useMemo(() => {
    if (type !== 'voice' && type !== 'video') return false;
    return currentChannel?.id === id && connectionState === 'connected';
  }, [currentChannel, connectionState, id, type]);

  // Get speaking participants for voice channels
  const speakingParticipants = useMemo(() => {
    return participants.filter(p => p.isSpeaking);
  }, [participants]);

  // Get muted participants for voice channels
  const mutedParticipants = useMemo(() => {
    return participants.filter(p => !p.isAudioEnabled);
  }, [participants]);

  const getChannelIcon = () => {
    switch (type) {
      case 'voice':
        return (
          <Volume2 
            className={cn(
              "w-4 h-4",
              isConnectedVoiceChannel ? "text-green-400" : "text-gray-400",
              speakingParticipants.length > 0 && "animate-pulse"
            )} 
          />
        );
      case 'video':
        return (
          <Volume2 
            className={cn(
              "w-4 h-4",
              isConnectedVoiceChannel ? "text-blue-400" : "text-gray-400"
            )} 
          />
        );
      case 'announcement':
        return <Hash className="w-4 h-4 text-gray-400" />;
      case 'forum':
        return <Hash className="w-4 h-4 text-gray-400" />;
      case 'text':
      default:
        return <Hash className="w-4 h-4 text-gray-400" />;
    }
  };

  const getChannelName = () => {
    if (isConnectedVoiceChannel && isUserInChannel) {
      return `${name} (connected)`;
    }
    return name;
  };

  const getChannelColor = () => {
    if (isActive) {
      return "text-white bg-[#5865f2]";
    }
    if (isConnectedVoiceChannel) {
      return "text-green-400 bg-green-400/10";
    }
    if (hasUnreadMentions) {
      return "text-white bg-red-500/20 hover:bg-red-500/30";
    }
    if (unreadCount > 0) {
      return "text-gray-200 hover:text-white";
    }
    return "text-gray-400 hover:text-gray-200 hover:bg-[#40444b]/50";
  };

  const showParticipants = (type === 'voice' || type === 'video') && participants.length > 0;

  return (
    <div className="group">
      {/* Main channel button */}
      <button
        onClick={onClick}
        onContextMenu={onContextMenu}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "w-full flex items-center justify-between p-2 rounded-md transition-all duration-150",
          getChannelColor(),
          className
        )}
      >
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          {/* Channel icon */}
          <div className="flex items-center space-x-1">
            {isPrivate && <Lock className="w-3 h-3 text-gray-500" />}
            {getChannelIcon()}
          </div>

          {/* Channel name */}
          <span className="font-medium truncate text-sm">
            {getChannelName()}
          </span>

          {/* Voice channel indicators */}
          {(type === 'voice' || type === 'video') && (
            <div className="flex items-center space-x-1">
              {/* Speaking indicator */}
              {speakingParticipants.length > 0 && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-xs text-green-400">
                    {speakingParticipants.length}
                  </span>
                </div>
              )}
              
              {/* Connection status */}
              {isConnectedVoiceChannel && (
                <div className="w-2 h-2 bg-green-400 rounded-full" />
              )}
            </div>
          )}
        </div>

        {/* Right side indicators */}
        <div className="flex items-center space-x-1">
          {/* Participant count for voice channels */}
          {showParticipants && (
            <div className="flex items-center space-x-1 text-xs text-gray-400">
              <Users className="w-3 h-3" />
              <span>
                {participants.length}
                {maxParticipants && `/${maxParticipants}`}
              </span>
            </div>
          )}

          {/* Unread count */}
          {unreadCount > 0 && (
            <div className={cn(
              "px-1.5 py-0.5 rounded-full text-xs font-medium",
              hasUnreadMentions 
                ? "bg-red-500 text-white" 
                : "bg-gray-500 text-white"
            )}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </div>
          )}

          {/* Show join/leave indicator on hover for voice channels */}
          {isHovered && (type === 'voice' || type === 'video') && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs text-gray-400">
                {isConnectedVoiceChannel ? 'Connected' : 'Click to join'}
              </span>
            </div>
          )}
        </div>
      </button>

      {/* Participants list for voice channels */}
      {showParticipants && (
        <div className="ml-6 mt-1 space-y-1">
          {participants.slice(0, 8).map((participant) => (
            <div
              key={participant.identity}
              className="flex items-center space-x-2 text-sm text-gray-400 hover:text-gray-300 transition-colors p-1 rounded hover:bg-[#36393f]"
            >
              {/* Avatar */}
              <div className="w-4 h-4 rounded-full bg-[#5865f2] text-white flex items-center justify-center text-xs font-semibold overflow-hidden relative">
                {participant.avatar ? (
                  <img 
                    src={participant.avatar} 
                    alt={participant.name} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <span>
                    {participant.name.slice(0, 1).toUpperCase()}
                  </span>
                )}
                
                {/* Speaking indicator */}
                {participant.isSpeaking && (
                  <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                )}
              </div>

              {/* Name and indicators */}
              <div className="flex items-center space-x-1 flex-1 min-w-0">
                <span className={cn(
                  "truncate text-xs",
                  participant.isLocal && "text-blue-400",
                  participant.isSpeaking && "text-green-400 font-medium"
                )}>
                  {participant.name}
                  {participant.isLocal && ' (You)'}
                </span>

                {/* Audio status icon */}
                {participant.isAudioEnabled ? (
                  <Mic className="w-3 h-3 text-gray-400" />
                ) : (
                  <MicOff className="w-3 h-3 text-red-400" />
                )}

                {/* Admin/Owner indicator */}
                {participant.name === participants[0]?.name && (
                  <Crown className="w-3 h-3 text-yellow-400" />
                )}
              </div>
            </div>
          ))}

          {/* Show "and X more" if there are more than 8 participants */}
          {participants.length > 8 && (
            <div className="ml-6 text-xs text-gray-500">
              and {participants.length - 8} more...
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ServerChannel;