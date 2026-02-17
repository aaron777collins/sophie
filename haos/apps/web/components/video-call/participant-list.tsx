'use client';

import React, { useMemo } from 'react';
import { Video, VideoOff, Mic, MicOff, Monitor, Crown, Shield, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VoiceParticipant } from '@/stores/voice-store';
import { useMatrixClient } from '@/hooks/use-matrix-client';
import { getAvatarDisplayInfo } from '@/lib/utils/avatar-utils';

interface VideoParticipant extends VoiceParticipant {
  isVideoEnabled: boolean;
  isScreenSharing?: boolean;
  connectionQuality?: 'excellent' | 'good' | 'poor';
  role?: 'owner' | 'moderator' | null;
}

interface ParticipantListProps {
  participants: VideoParticipant[];
  currentUserId: string;
  layout?: 'grid' | 'list' | 'sidebar';
  className?: string;
  onParticipantClick?: (participant: VideoParticipant) => void;
  onMuteParticipant?: (participantId: string) => void;
  onKickParticipant?: (participantId: string) => void;
}

/**
 * Component that displays participants in a video call with their avatars,
 * video status, and controls for moderators.
 */
export function ParticipantList({
  participants,
  currentUserId,
  layout = 'list',
  className = '',
  onParticipantClick,
  onMuteParticipant,
  onKickParticipant,
}: ParticipantListProps) {
  const { client: matrixClient } = useMatrixClient();

  const sortedParticipants = useMemo(() => {
    return [...participants].sort((a, b) => {
      // Current user first
      if (a.identity === currentUserId) return -1;
      if (b.identity === currentUserId) return 1;
      
      // Then by role (owner > moderator > regular)
      const roleOrder = { owner: 0, moderator: 1 };
      const aRole = roleOrder[a.role || ''] ?? 2;
      const bRole = roleOrder[b.role || ''] ?? 2;
      if (aRole !== bRole) return aRole - bRole;
      
      // Then by speaking status
      if (a.isSpeaking && !b.isSpeaking) return -1;
      if (b.isSpeaking && !a.isSpeaking) return 1;
      
      // Finally by name
      return a.name.localeCompare(b.name);
    });
  }, [participants, currentUserId]);

  if (participants.length === 0) {
    return (
      <div className={cn('p-4 text-center text-gray-500', className)}>
        <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No participants in call</p>
      </div>
    );
  }

  const gridClasses = layout === 'grid' 
    ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3'
    : 'space-y-2';

  return (
    <div className={cn(className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Users className="w-5 h-5" />
          Participants ({participants.length})
        </h3>
      </div>

      {/* Participant list/grid */}
      <div className={gridClasses}>
        {sortedParticipants.map((participant) => {
          // TODO: Convert mxc:// avatar URLs to HTTP URLs using Matrix client mxcUrlToHttp()
          const avatarInfo = getAvatarDisplayInfo(
            matrixClient,
            participant.avatar,
            participant.name,
            undefined,
            layout === 'grid' ? 64 : 40
          );

          const isCurrentUser = participant.identity === currentUserId;
          const canModerate = !isCurrentUser && (
            sortedParticipants.find(p => p.identity === currentUserId)?.role === 'owner' ||
            sortedParticipants.find(p => p.identity === currentUserId)?.role === 'moderator'
          );

          if (layout === 'grid') {
            return (
              <div
                key={participant.identity}
                className={cn(
                  'relative bg-[#2f3136] rounded-lg p-4 border border-[#40444b]',
                  'hover:bg-[#36393f] transition-colors cursor-pointer',
                  participant.isSpeaking && 'ring-2 ring-green-500'
                )}
                onClick={() => onParticipantClick?.(participant)}
              >
                {/* Avatar */}
                <div className="flex flex-col items-center space-y-2">
                  <div 
                    className={cn(
                      'w-16 h-16 rounded-full bg-[#5865f2] flex items-center justify-center',
                      'text-white font-semibold overflow-hidden',
                      participant.connectionQuality === 'poor' && 'ring-2 ring-red-500',
                      participant.connectionQuality === 'good' && 'ring-2 ring-yellow-500',
                      participant.connectionQuality === 'excellent' && 'ring-2 ring-green-500'
                    )}
                  >
                    {avatarInfo.hasAvatar ? (
                      <img
                        src={avatarInfo.httpUrl!}
                        alt={participant.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg">{avatarInfo.initials}</span>
                    )}
                  </div>

                  {/* Name and role */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span 
                        className={cn(
                          'text-sm font-medium text-white truncate',
                          isCurrentUser && 'text-blue-400'
                        )}
                      >
                        {participant.name}
                        {isCurrentUser && ' (You)'}
                      </span>
                      
                      {/* Role badge */}
                      {participant.role === 'owner' && (
                        <Crown className="w-3 h-3 text-yellow-400" />
                      )}
                      {participant.role === 'moderator' && (
                        <Shield className="w-3 h-3 text-blue-400" />
                      )}
                    </div>
                  </div>

                  {/* Status indicators */}
                  <div className="flex items-center gap-2">
                    {participant.isVideoEnabled ? (
                      <Video className="w-4 h-4 text-green-400" />
                    ) : (
                      <VideoOff className="w-4 h-4 text-gray-400" />
                    )}
                    
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
                    
                    {participant.isScreenSharing && (
                      <Monitor className="w-4 h-4 text-blue-400" />
                    )}
                  </div>
                </div>

                {/* Speaking indicator overlay */}
                {participant.isSpeaking && (
                  <div className="absolute inset-0 border-2 border-green-500 rounded-lg animate-pulse pointer-events-none" />
                )}
              </div>
            );
          }

          // List layout
          return (
            <div
              key={participant.identity}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg bg-[#2f3136] border border-[#40444b]',
                'hover:bg-[#36393f] transition-colors',
                participant.isSpeaking && 'ring-1 ring-green-500'
              )}
            >
              {/* Avatar */}
              <div className="relative">
                <div 
                  className={cn(
                    'w-10 h-10 rounded-full bg-[#5865f2] flex items-center justify-center',
                    'text-white text-sm font-semibold overflow-hidden',
                    participant.connectionQuality === 'poor' && 'ring-2 ring-red-500',
                    participant.connectionQuality === 'good' && 'ring-2 ring-yellow-500',
                    participant.connectionQuality === 'excellent' && 'ring-2 ring-green-500'
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
                
                {/* Speaking indicator */}
                {participant.isSpeaking && (
                  <div className="absolute inset-0 border-2 border-green-500 rounded-full animate-pulse" />
                )}
              </div>

              {/* User info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span 
                    className={cn(
                      'text-sm font-medium text-white truncate',
                      isCurrentUser && 'text-blue-400'
                    )}
                  >
                    {participant.name}
                    {isCurrentUser && ' (You)'}
                  </span>
                  
                  {/* Role badges */}
                  {participant.role === 'owner' && (
                    <Crown className="w-3 h-3 text-yellow-400" />
                  )}
                  {participant.role === 'moderator' && (
                    <Shield className="w-3 h-3 text-blue-400" />
                  )}
                </div>

                {/* Status line */}
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                  {participant.isSpeaking && (
                    <span className="text-green-400">Speaking</span>
                  )}
                  {participant.connectionQuality && (
                    <span 
                      className={cn(
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

              {/* Status icons */}
              <div className="flex items-center gap-2">
                {participant.isVideoEnabled ? (
                  <Video className="w-4 h-4 text-green-400" />
                ) : (
                  <VideoOff className="w-4 h-4 text-gray-400" />
                )}
                
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
                
                {participant.isScreenSharing && (
                  <Monitor className="w-4 h-4 text-blue-400" />
                )}
              </div>

              {/* Moderation controls */}
              {canModerate && (
                <div className="flex items-center gap-1">
                  {onMuteParticipant && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMuteParticipant(participant.identity);
                      }}
                      className="p-1 hover:bg-[#40444b] rounded"
                      title="Mute participant"
                    >
                      <MicOff className="w-3 h-3 text-gray-400" />
                    </button>
                  )}
                  
                  {onKickParticipant && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onKickParticipant(participant.identity);
                      }}
                      className="p-1 hover:bg-[#40444b] rounded text-red-400"
                      title="Remove participant"
                    >
                      ×
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ParticipantList;