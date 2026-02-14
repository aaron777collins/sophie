'use client';

import { MicOff, Video, VideoOff, Monitor } from 'lucide-react';
import { SpeakingIndicator } from './speaking-indicator';
import { VoiceParticipant } from '@/stores/voice-store';

interface ParticipantTileProps {
  participant: VoiceParticipant;
  size?: 'sm' | 'md' | 'lg';
  showVideo?: boolean;
  className?: string;
}

export function ParticipantTile({ 
  participant, 
  size = 'md', 
  showVideo = false,
  className = ''
}: ParticipantTileProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getConnectionColor = () => {
    switch (participant.connectionQuality) {
      case 'excellent':
        return 'border-green-500';
      case 'good':
        return 'border-yellow-500';
      case 'poor':
        return 'border-red-500';
      default:
        return 'border-gray-500';
    }
  };

  if (showVideo && participant.isVideoEnabled) {
    return (
      <div className={`relative flex flex-col items-center space-y-1 p-2 rounded-lg bg-[#36393f] ${className}`}>
        {/* Video placeholder - would contain actual video element */}
        <div className="relative w-32 h-24 bg-[#2f3136] rounded border-2 border-gray-600 flex items-center justify-center">
          <Video className="w-6 h-6 text-gray-400" />
          
          {/* Speaking indicator overlay for video */}
          {participant.isSpeaking && (
            <div className="absolute inset-0 border-2 border-green-400 rounded animate-pulse" />
          )}
          
          {/* Mute indicator */}
          {!participant.isAudioEnabled && (
            <div className="absolute bottom-1 right-1 bg-red-500 rounded-full p-1">
              <MicOff className="w-3 h-3 text-white" />
            </div>
          )}
          
          {/* Screen sharing indicator */}
          {participant.isScreenSharing && (
            <div className="absolute top-1 right-1 bg-blue-500 rounded-full p-1">
              <Monitor className="w-3 h-3 text-white" />
            </div>
          )}
        </div>
        
        {/* Username */}
        <span className={`text-gray-300 font-medium truncate max-w-full ${textSizeClasses[size]}`}>
          {participant.name}
        </span>
        
        {/* Local badge */}
        {participant.isLocal && (
          <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
            You
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`relative flex items-center space-x-2 text-gray-300 hover:text-white transition-colors ${className}`}>
      {/* Avatar container with speaking indicator */}
      <div className={`relative flex-shrink-0 ${sizeClasses[size]}`}>
        <div className={`${sizeClasses[size]} rounded-full border-2 ${getConnectionColor()} bg-[#5865f2] text-white flex items-center justify-center text-sm font-semibold overflow-hidden`}>
          {participant.avatar ? (
            <img src={participant.avatar} alt={participant.name} className="w-full h-full object-cover" />
          ) : (
            <span>{getInitials(participant.name)}</span>
          )}
        </div>
        
        {/* Speaking indicator */}
        <SpeakingIndicator 
          isSpeaking={participant.isSpeaking} 
          size={size}
        />
      </div>

      {/* User info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-1">
          <span className={`font-medium truncate ${textSizeClasses[size]} ${participant.isLocal ? 'text-blue-400' : ''}`}>
            {participant.name}
            {participant.isLocal && ' (You)'}
          </span>
        </div>
        
        {/* Status indicators */}
        <div className="flex items-center space-x-1 mt-0.5">
          {/* Mute indicator */}
          {!participant.isAudioEnabled && (
            <MicOff className="w-3 h-3 text-red-400" />
          )}
          
          {/* Video indicator */}
          {participant.isVideoEnabled ? (
            <Video className="w-3 h-3 text-green-400" />
          ) : size !== 'sm' && (
            <VideoOff className="w-3 h-3 text-gray-500" />
          )}
          
          {/* Screen sharing indicator */}
          {participant.isScreenSharing && (
            <Monitor className="w-3 h-3 text-blue-400" />
          )}
        </div>
      </div>
    </div>
  );
}

export default ParticipantTile;