'use client';

import { useState } from 'react';
import { Volume2, Users, Crown, Lock, Plus, UserPlus } from 'lucide-react';
import { useVoiceChannel } from '@/hooks/use-voice-channel';
import { useVoiceStore, VoiceParticipant } from '@/stores/voice-store';

interface VoiceChannelInfo {
  id: string;
  name: string;
  participantCount: number;
  maxParticipants?: number;
  participants: VoiceParticipant[];
  isPrivate?: boolean;
  isActive?: boolean;
}

interface VoiceChannelListProps {
  channels: VoiceChannelInfo[];
  currentUserId: string;
  onJoinChannel?: (channelId: string) => void;
  onCreateChannel?: () => void;
  className?: string;
}

export function VoiceChannelList({ 
  channels, 
  currentUserId, 
  onJoinChannel, 
  onCreateChannel,
  className = ''
}: VoiceChannelListProps) {
  const [joiningChannel, setJoiningChannel] = useState<string | null>(null);
  const { currentChannel, connectionState } = useVoiceStore();
  
  const {
    connect,
    disconnect,
    isConnecting,
  } = useVoiceChannel({
    roomName: '',
    userId: currentUserId,
  });

  const handleJoinChannel = async (channelId: string) => {
    if (joiningChannel || connectionState === 'connecting') return;
    
    setJoiningChannel(channelId);
    
    try {
      // If already connected to a different channel, disconnect first
      if (currentChannel && currentChannel.id !== channelId) {
        await disconnect();
      }
      
      onJoinChannel?.(channelId);
    } catch (error) {
      console.error('Failed to join channel:', error);
    } finally {
      setJoiningChannel(null);
    }
  };

  const isCurrentChannel = (channelId: string) => {
    return currentChannel?.id === channelId && connectionState === 'connected';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center space-x-2">
          <Volume2 className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-300 uppercase tracking-wide">
            Voice Channels
          </span>
        </div>
        
        {onCreateChannel && (
          <button
            onClick={onCreateChannel}
            className="w-6 h-6 flex items-center justify-center hover:bg-[#40444b] text-gray-400 hover:text-white rounded transition-colors"
            title="Create Channel"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Channel list */}
      <div className="space-y-1">
        {channels.map((channel) => {
          const isJoining = joiningChannel === channel.id;
          const isCurrent = isCurrentChannel(channel.id);
          const canJoin = !isCurrent && !isJoining && connectionState !== 'connecting';
          
          return (
            <div key={channel.id} className="group">
              {/* Channel row */}
              <button
                onClick={() => canJoin ? handleJoinChannel(channel.id) : undefined}
                disabled={!canJoin}
                className={`w-full p-2 text-left hover:bg-[#40444b] transition-colors rounded ${isCurrent ? 'bg-[#40444b] text-white' : 'text-gray-300 hover:text-white'} ${!canJoin ? 'cursor-default' : 'cursor-pointer'}`}
                title={canJoin ? `Join ${channel.name}` : undefined}
              >
                <div className="flex items-center space-x-2 w-full">
                  {/* Channel icon and name */}
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <div className="flex items-center space-x-1">
                      {channel.isPrivate ? (
                        <Lock className="w-4 h-4 text-gray-400" />
                      ) : (
                        <Volume2 className={`w-4 h-4 ${isCurrent ? 'text-green-400' : 'text-gray-400'}`} />
                      )}
                      
                      <span className="font-medium truncate">
                        {channel.name}
                      </span>
                      
                      {isCurrent && (
                        <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">
                          Connected
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Participant count */}
                  {channel.participantCount > 0 && (
                    <div className="flex items-center space-x-1 text-xs text-gray-400">
                      <Users className="w-3 h-3" />
                      <span>
                        {channel.participantCount}
                        {channel.maxParticipants && `/${channel.maxParticipants}`}
                      </span>
                    </div>
                  )}

                  {/* Join button (visible on hover) */}
                  {!isCurrent && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <UserPlus className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Loading indicator */}
                  {isJoining && (
                    <div className="w-4 h-4">
                      <div className="animate-spin rounded-full h-3 w-3 border border-gray-400 border-t-transparent"></div>
                    </div>
                  )}
                </div>
              </button>

              {/* Participants list (when connected or has participants) */}
              {(isCurrent || channel.participants.length > 0) && (
                <div className="ml-6 mt-1 space-y-1">
                  {channel.participants.map((participant, index) => (
                    <div
                      key={participant.identity}
                      className="flex items-center space-x-2 text-sm text-gray-400 hover:text-gray-300 transition-colors p-1 rounded hover:bg-[#36393f]"
                      title={`${participant.name}${participant.isLocal ? ' (You)' : ''}`}
                    >
                      {/* Avatar */}
                      <div className="w-5 h-5 rounded-full border border-gray-600 bg-[#5865f2] text-white flex items-center justify-center text-xs font-semibold overflow-hidden">
                        {participant.avatar ? (
                          <img src={participant.avatar} alt={participant.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{getInitials(participant.name)}</span>
                        )}
                      </div>

                      {/* Name and indicators */}
                      <div className="flex items-center space-x-1 flex-1 min-w-0">
                        <span className={`truncate ${participant.isLocal ? 'text-blue-400' : ''} ${participant.isSpeaking ? 'text-green-400 font-medium' : ''}`}>
                          {participant.name}
                          {participant.isLocal && ' (You)'}
                        </span>
                        
                        {/* Speaking indicator */}
                        {participant.isSpeaking && (
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Speaking" />
                        )}
                        
                        {/* Muted indicator */}
                        {!participant.isAudioEnabled && (
                          <div className="w-2 h-2 bg-red-400 rounded-full" title="Muted" />
                        )}
                        
                        {/* Crown for admin/owner (could be added later) */}
                        {index === 0 && (
                          <span title="Owner">
                            <Crown className="w-3 h-3 text-yellow-400" />
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {channels.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Volume2 className="w-8 h-8 mx-auto mb-2 text-gray-600" />
          <p className="text-sm">No voice channels available</p>
          {onCreateChannel && (
            <button
              onClick={onCreateChannel}
              className="text-blue-400 hover:text-blue-300 text-sm mt-2 underline"
            >
              Create the first channel
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default VoiceChannelList;