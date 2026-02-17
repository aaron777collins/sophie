'use client';

import React from 'react';
import { Users, Crown, Shield, Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VoiceParticipant } from '@/stores/voice-store';
import { useMatrixClient } from '@/hooks/use-matrix-client';
import { getAvatarDisplayInfo } from '@/lib/utils/avatar-utils';

interface VoiceMemberListProps {
  participants: VoiceParticipant[];
  currentUserId: string;
  className?: string;
  onMemberClick?: (participant: VoiceParticipant) => void;
}

/**
 * Component that displays a list of voice channel members with their avatars,
 * speaking indicators, and connection status.
 */
export function VoiceMemberList({
  participants,
  currentUserId,
  className = '',
  onMemberClick,
}: VoiceMemberListProps) {
  const { client: matrixClient } = useMatrixClient();

  if (participants.length === 0) {
    return (
      <div className={cn('p-4 text-center text-gray-500', className)}>
        <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No members in voice channel</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-1', className)}>
      <div className="px-2 py-1 text-xs font-medium text-gray-400 uppercase tracking-wide">
        In Voice — {participants.length}
      </div>
      
      {participants.map((participant) => {
        // TODO: Convert mxc:// avatar URLs to HTTP URLs using Matrix client mxcUrlToHttp()
        const avatarInfo = getAvatarDisplayInfo(
          matrixClient,
          participant.avatar,
          participant.name,
          undefined,
          32
        );

        const isCurrentUser = participant.identity === currentUserId;
        
        return (
          <button
            key={participant.identity}
            onClick={() => onMemberClick?.(participant)}
            className={cn(
              'w-full flex items-center gap-3 px-2 py-1.5 rounded',
              'text-gray-300 hover:bg-[#40444b] hover:text-white',
              'transition-colors duration-150',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset',
              participant.isSpeaking && 'bg-[#40444b] text-green-400'
            )}
            title={`${participant.name}${isCurrentUser ? ' (You)' : ''}`}
          >
            {/* Avatar */}
            <div className="relative">
              <div 
                className={cn(
                  'w-8 h-8 rounded-full bg-[#5865f2] flex items-center justify-center',
                  'text-white text-xs font-semibold overflow-hidden',
                  participant.isSpeaking && 'ring-2 ring-green-500'
                )}
              >
                {avatarInfo.hasAvatar ? (
                  <img
                    src={avatarInfo.httpUrl!}
                    alt={participant.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{avatarInfo.initials}</span>
                )}
              </div>
              
              {/* Online status */}
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#36393f]" />
            </div>

            {/* User info */}
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center gap-1">
                <span 
                  className={cn(
                    'text-sm font-medium truncate',
                    isCurrentUser && 'text-blue-400'
                  )}
                >
                  {participant.name}
                  {isCurrentUser && ' (You)'}
                </span>
                
                {/* Role badges */}
                {participant.identity === participants[0]?.identity && (
                  <Crown className="w-3 h-3 text-yellow-400 flex-shrink-0" title="Channel Owner" />
                )}
              </div>
              
              {/* Status indicators */}
              <div className="flex items-center gap-1 mt-0.5">
                {participant.isSpeaking && (
                  <span className="text-xs text-green-400">Speaking</span>
                )}
                {!participant.isAudioEnabled && (
                  <span className="text-xs text-red-400">Muted</span>
                )}
                {participant.connectionQuality && (
                  <span 
                    className={cn(
                      'text-xs',
                      participant.connectionQuality === 'excellent' && 'text-green-400',
                      participant.connectionQuality === 'good' && 'text-yellow-400',
                      participant.connectionQuality === 'poor' && 'text-red-400'
                    )}
                  >
                    {participant.connectionQuality}
                  </span>
                )}
              </div>
            </div>

            {/* Audio status icon */}
            <div className="flex items-center">
              {participant.isAudioEnabled ? (
                <Mic 
                  className={cn(
                    'w-4 h-4',
                    participant.isSpeaking ? 'text-green-400' : 'text-gray-400'
                  )}
                />
              ) : (
                <MicOff className="w-4 h-4 text-red-400" />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

export default VoiceMemberList;