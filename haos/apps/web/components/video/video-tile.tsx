'use client';

import React, { useRef, useEffect, useState } from 'react';
import { 
  MicOff, 
  Video, 
  VideoOff, 
  Monitor, 
  Crown, 
  Shield,
  Pin,
  PinOff,
  Volume2,
  VolumeX
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { VideoTrackInfo } from '@/services/video-call';

export interface VideoGridParticipant {
  identity: string;
  name: string;
  avatar?: string;
  tracks: VideoTrackInfo[];
  hasVideo: boolean;
  hasScreenShare: boolean;
  isLocal: boolean;
  isPinned: boolean;
  isSpeaking?: boolean;
  isAudioEnabled?: boolean;
  isScreenSharing?: boolean;
  isOwner?: boolean;
}

export interface VideoTileProps {
  participant: VideoGridParticipant;
  size?: 'small' | 'medium' | 'large';
  showName?: boolean;
  showSpeakingIndicator?: boolean;
  showControls?: boolean;
  role?: 'owner' | 'moderator' | null;
  className?: string;
  onClick?: () => void;
  onDoubleClick?: () => void;
  onPin?: () => void;
  onUnpin?: () => void;
}

export function VideoTile({
  participant,
  size = 'medium',
  showName = true,
  showSpeakingIndicator = true,
  showControls = false,
  role = null,
  className = '',
  onClick,
  onDoubleClick,
  onPin,
  onUnpin,
}: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Get the primary video track (non-screen share)
  const videoTrack = participant.tracks.find(t => !t.isScreenShare);
  const screenShareTrack = participant.tracks.find(t => t.isScreenShare);
  const displayTrack = screenShareTrack || videoTrack;

  // Size configurations
  const sizeConfig = {
    small: {
      container: 'min-h-[120px] max-h-[200px]',
      avatar: 'w-12 h-12',
      text: 'text-sm',
      icon: 'w-4 h-4',
      controls: 'gap-1 p-1',
    },
    medium: {
      container: 'min-h-[200px]',
      avatar: 'w-16 h-16',
      text: 'text-base',
      icon: 'w-5 h-5',
      controls: 'gap-2 p-2',
    },
    large: {
      container: 'min-h-[300px]',
      avatar: 'w-24 h-24',
      text: 'text-lg',
      icon: 'w-6 h-6',
      controls: 'gap-3 p-3',
    },
  };

  const config = sizeConfig[size];

  // Attach video track to video element
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !displayTrack) return;

    const attachTrack = async () => {
      try {
        // Attach the track to the video element
        displayTrack.track.attach(video);
        setIsVideoVisible(true);
        setVideoError(null);
      } catch (error) {
        console.error('Error attaching video track:', error);
        setVideoError(error instanceof Error ? error.message : 'Failed to load video');
        setIsVideoVisible(false);
      }
    };

    attachTrack();

    return () => {
      try {
        displayTrack.track.detach(video);
      } catch (error) {
        console.error('Error detaching video track:', error);
      }
    };
  }, [displayTrack]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarBackground = () => {
    // Generate consistent color based on name
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-orange-500',
    ];
    
    const index = participant.name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const handleClick = () => {
    onClick?.();
  };

  const handleDoubleClick = () => {
    onDoubleClick?.();
  };

  const handlePinToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (participant.isPinned) {
      onUnpin?.();
    } else {
      onPin?.();
    }
  };

  return (
    <div
      className={cn(
        'relative rounded-lg overflow-hidden bg-[#1e1f22] border border-[#40444b]',
        'transition-all duration-200 cursor-pointer',
        config.container,
        participant.isSpeaking && showSpeakingIndicator && 'ring-2 ring-green-500',
        isHovered && 'ring-2 ring-blue-500/50',
        className
      )}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      aria-label={`${participant.name}${participant.isLocal ? ' (You)' : ''}, ${
        participant.hasVideo ? 'camera on' : 'camera off'
      }, ${participant.isAudioEnabled ? 'microphone on' : 'muted'}`}
    >
      {/* Video element */}
      {displayTrack && (
        <video
          ref={videoRef}
          className={cn(
            'absolute inset-0 w-full h-full object-cover',
            !isVideoVisible && 'opacity-0'
          )}
          autoPlay
          playsInline
          muted
        />
      )}

      {/* Avatar fallback (shown when no video or video error) */}
      {(!displayTrack || !isVideoVisible || videoError) && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={cn(
            'rounded-full flex items-center justify-center text-white font-semibold',
            config.avatar,
            getAvatarBackground()
          )}>
            <span className={config.text}>
              {getInitials(participant.name)}
            </span>
          </div>
        </div>
      )}

      {/* Video error overlay */}
      {videoError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-center text-white">
            <VideoOff className={cn(config.icon, 'mx-auto mb-2')} />
            <p className="text-xs">Video unavailable</p>
          </div>
        </div>
      )}

      {/* Speaking indicator glow */}
      {participant.isSpeaking && showSpeakingIndicator && (
        <div 
          className="absolute inset-0 border-2 border-green-500 rounded-lg animate-pulse pointer-events-none"
          aria-hidden="true"
        />
      )}

      {/* Top overlay - role badge and controls */}
      <div className="absolute top-0 left-0 right-0 p-2 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-start justify-between">
          {/* Role badge */}
          {role && (
            <div className={cn(
              'rounded-full p-1',
              role === 'owner' ? 'bg-yellow-500' : 'bg-blue-500'
            )}>
              {role === 'owner' ? (
                <Crown className="w-3 h-3 text-white" />
              ) : (
                <Shield className="w-3 h-3 text-white" />
              )}
            </div>
          )}

          {/* Pin control */}
          {showControls && (onPin || onUnpin) && (
            <button
              onClick={handlePinToggle}
              className={cn(
                'rounded-full p-1 transition-colors',
                participant.isPinned 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-black/50 text-white hover:bg-black/70'
              )}
              title={participant.isPinned ? 'Unpin participant' : 'Pin participant'}
            >
              {participant.isPinned ? (
                <PinOff className="w-3 h-3" />
              ) : (
                <Pin className="w-3 h-3" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Bottom overlay - name and status */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
        {showName && (
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className={cn(
                'font-medium text-white truncate',
                config.text,
                participant.isLocal && 'text-blue-300'
              )}>
                {participant.name}
                {participant.isLocal && ' (You)'}
              </p>
              
              {/* Screen share indicator */}
              {screenShareTrack && (
                <p className="text-xs text-gray-300 flex items-center gap-1">
                  <Monitor className="w-3 h-3" />
                  Sharing screen
                </p>
              )}
            </div>

            {/* Status indicators */}
            <div className={cn('flex items-center', config.controls)}>
              {/* Audio status */}
              {participant.isAudioEnabled ? (
                showSpeakingIndicator && participant.isSpeaking ? (
                  <div className="bg-green-500 rounded-full p-1">
                    <Volume2 className="w-3 h-3 text-white" />
                  </div>
                ) : null
              ) : (
                <div className="bg-red-500 rounded-full p-1">
                  <MicOff className="w-3 h-3 text-white" />
                </div>
              )}

              {/* Video status (only show if no video track) */}
              {!displayTrack && (
                <div className="bg-red-500 rounded-full p-1">
                  <VideoOff className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Local participant indicator */}
      {participant.isLocal && (
        <div className="absolute top-2 right-2">
          <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
            You
          </div>
        </div>
      )}

      {/* Pinned indicator */}
      {participant.isPinned && (
        <div className="absolute top-2 left-2">
          <div className="bg-blue-500 rounded-full p-1">
            <Pin className="w-3 h-3 text-white" />
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoTile;