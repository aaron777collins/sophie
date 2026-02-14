'use client';

import { MicOff, Video, VideoOff, Monitor, Crown, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SpeakingIndicator } from './speaking-indicator';
import { VoiceParticipant } from '@/stores/voice-store';

interface ParticipantTileProps {
  participant: VoiceParticipant;
  size?: 'sm' | 'md' | 'lg';
  showVideo?: boolean;
  className?: string;
  /** Optional role badge (owner, moderator) */
  role?: 'owner' | 'moderator' | null;
  onClick?: () => void;
}

export function ParticipantTile({ 
  participant, 
  size = 'md', 
  showVideo = false,
  className = '',
  role = null,
  onClick,
}: ParticipantTileProps) {
  const sizeConfig = {
    sm: {
      avatar: 'w-8 h-8',
      text: 'text-xs',
      icon: 'w-3 h-3',
      video: 'w-24 h-18',
    },
    md: {
      avatar: 'w-10 h-10',
      text: 'text-sm',
      icon: 'w-3.5 h-3.5',
      video: 'w-32 h-24',
    },
    lg: {
      avatar: 'w-14 h-14',
      text: 'text-base',
      icon: 'w-4 h-4',
      video: 'w-40 h-30',
    },
  };

  const config = sizeConfig[size];

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
        return 'ring-green-500';
      case 'good':
        return 'ring-yellow-500';
      case 'poor':
        return 'ring-red-500';
      default:
        return 'ring-gray-600';
    }
  };

  const getConnectionLabel = () => {
    switch (participant.connectionQuality) {
      case 'excellent':
        return 'Excellent connection';
      case 'good':
        return 'Good connection';
      case 'poor':
        return 'Poor connection';
      default:
        return 'Unknown connection quality';
    }
  };

  // Build accessibility description
  const getAriaDescription = () => {
    const parts: string[] = [];
    if (participant.isLocal) parts.push('You');
    if (participant.isSpeaking) parts.push('Speaking');
    if (!participant.isAudioEnabled) parts.push('Muted');
    if (participant.isVideoEnabled) parts.push('Camera on');
    if (participant.isScreenSharing) parts.push('Sharing screen');
    parts.push(getConnectionLabel());
    return parts.join(', ');
  };

  const Wrapper = onClick ? 'button' : 'div';

  // Video tile mode
  if (showVideo && participant.isVideoEnabled) {
    return (
      <Wrapper
        onClick={onClick}
        className={cn(
          'relative flex flex-col items-center gap-2 p-3 rounded-lg bg-[#2f3136]',
          'border border-[#40444b] transition-all',
          onClick && 'hover:bg-[#36393f] cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500',
          participant.isSpeaking && 'ring-2 ring-green-500',
          className
        )}
        aria-label={`${participant.name}, ${getAriaDescription()}`}
      >
        {/* Video container */}
        <div className={cn(
          'relative bg-[#1e1f22] rounded overflow-hidden',
          config.video
        )}>
          {/* Video placeholder - would contain actual video element */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Video className="w-8 h-8 text-gray-600" aria-hidden="true" />
          </div>
          
          {/* Speaking glow overlay */}
          {participant.isSpeaking && (
            <div 
              className="absolute inset-0 border-2 border-green-500 rounded animate-pulse pointer-events-none"
              aria-hidden="true"
            />
          )}
          
          {/* Bottom status bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
            <div className="flex items-center justify-between">
              <span className={cn('font-medium text-white truncate', config.text)}>
                {participant.name}
                {participant.isLocal && ' (You)'}
              </span>
              
              <div className="flex items-center gap-1">
                {!participant.isAudioEnabled && (
                  <div className="bg-red-500 rounded-full p-1" aria-label="Muted">
                    <MicOff className={config.icon} />
                  </div>
                )}
                {participant.isScreenSharing && (
                  <div className="bg-blue-500 rounded-full p-1" aria-label="Sharing screen">
                    <Monitor className={config.icon} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Role badge */}
        {role && (
          <div className={cn(
            'absolute top-2 right-2 rounded-full p-1',
            role === 'owner' ? 'bg-yellow-500' : 'bg-blue-500'
          )}>
            {role === 'owner' ? (
              <Crown className="w-3 h-3 text-white" aria-label="Server owner" />
            ) : (
              <Shield className="w-3 h-3 text-white" aria-label="Moderator" />
            )}
          </div>
        )}
      </Wrapper>
    );
  }

  // List/row mode (default)
  return (
    <Wrapper
      onClick={onClick}
      className={cn(
        'relative flex items-center gap-3 py-1.5 px-2 rounded',
        'text-gray-300 transition-colors',
        onClick && 'hover:bg-[#3c3f45] cursor-pointer focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500',
        !onClick && 'hover:bg-[#36393f]',
        className
      )}
      aria-label={`${participant.name}, ${getAriaDescription()}`}
    >
      {/* Avatar container */}
      <div className={cn('relative flex-shrink-0', config.avatar)}>
        <div 
          className={cn(
            config.avatar,
            'rounded-full ring-2 bg-[#5865f2] text-white',
            'flex items-center justify-center font-semibold overflow-hidden',
            getConnectionColor()
          )}
        >
          {participant.avatar ? (
            <img
              src={participant.avatar}
              alt=""
              className="w-full h-full object-cover"
              aria-hidden="true"
            />
          ) : (
            <span className={config.text} aria-hidden="true">
              {getInitials(participant.name)}
            </span>
          )}
        </div>
        
        {/* Speaking indicator ring */}
        <SpeakingIndicator 
          isSpeaking={participant.isSpeaking} 
          size={size}
        />
        
        {/* Role badge */}
        {role && (
          <div className={cn(
            'absolute -top-0.5 -right-0.5 rounded-full p-0.5',
            role === 'owner' ? 'bg-yellow-500' : 'bg-blue-500'
          )}>
            {role === 'owner' ? (
              <Crown className="w-2.5 h-2.5 text-white" />
            ) : (
              <Shield className="w-2.5 h-2.5 text-white" />
            )}
          </div>
        )}
      </div>

      {/* User info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span 
            className={cn(
              'font-medium truncate',
              config.text,
              participant.isLocal && 'text-blue-400',
              participant.isSpeaking && !participant.isLocal && 'text-green-400'
            )}
          >
            {participant.name}
            {participant.isLocal && (
              <span className="text-gray-500 font-normal"> (You)</span>
            )}
          </span>
        </div>
        
        {/* Status icons row */}
        <div className="flex items-center gap-1.5 mt-0.5" aria-hidden="true">
          {!participant.isAudioEnabled && (
            <div className="flex items-center text-red-400" title="Muted">
              <MicOff className={config.icon} />
            </div>
          )}
          
          {participant.isVideoEnabled ? (
            <div className="flex items-center text-green-400" title="Camera on">
              <Video className={config.icon} />
            </div>
          ) : size !== 'sm' && (
            <div className="flex items-center text-gray-500" title="Camera off">
              <VideoOff className={config.icon} />
            </div>
          )}
          
          {participant.isScreenSharing && (
            <div className="flex items-center text-blue-400" title="Sharing screen">
              <Monitor className={config.icon} />
            </div>
          )}
        </div>
      </div>
    </Wrapper>
  );
}

export default ParticipantTile;
