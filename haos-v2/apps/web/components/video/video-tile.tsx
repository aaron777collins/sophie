import React, { useRef, useEffect, useState, useMemo } from 'react';
import { 
  Mic, 
  MicOff, 
  VideoOff, 
  User, 
  Volume2, 
  VolumeX,
  Maximize2,
  Pin,
  MoreHorizontal 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { VideoParticipant } from '../../services/video-call';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface VideoTileProps {
  participant: VideoParticipant;
  isLocal?: boolean;
  showName?: boolean;
  showAudioIndicator?: boolean;
  showControls?: boolean;
  isPinned?: boolean;
  isFullscreen?: boolean;
  className?: string;
  onClick?: (participant: VideoParticipant) => void;
  onDoubleClick?: (participant: VideoParticipant) => void;
  onPin?: (participant: VideoParticipant) => void;
  onUnpin?: (participant: VideoParticipant) => void;
  onFullscreen?: (participant: VideoParticipant) => void;
  onMute?: (participant: VideoParticipant) => void;
  onUnmute?: (participant: VideoParticipant) => void;
}

/**
 * AudioLevelIndicator shows real-time audio levels
 */
interface AudioLevelIndicatorProps {
  audioTrack: MediaStreamTrack | undefined;
  isMuted: boolean;
}

const AudioLevelIndicator: React.FC<AudioLevelIndicatorProps> = ({ audioTrack, isMuted }) => {
  const [audioLevel, setAudioLevel] = useState(0);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!audioTrack || isMuted) {
      setAudioLevel(0);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    // Create audio context and analyzer
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(new MediaStream([audioTrack]));
    const analyzer = audioContext.createAnalyser();
    
    analyzer.fftSize = 256;
    analyzer.smoothingTimeConstant = 0.3;
    source.connect(analyzer);
    
    analyzerRef.current = analyzer;

    // Monitor audio levels
    const dataArray = new Uint8Array(analyzer.frequencyBinCount);
    
    const updateAudioLevel = () => {
      if (analyzerRef.current) {
        analyzerRef.current.getByteFrequencyData(dataArray);
        
        // Calculate average volume
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        const normalizedLevel = Math.min(average / 128, 1); // Normalize to 0-1
        
        setAudioLevel(normalizedLevel);
      }
      
      animationRef.current = requestAnimationFrame(updateAudioLevel);
    };
    
    updateAudioLevel();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      source.disconnect();
      audioContext.close();
    };
  }, [audioTrack, isMuted]);

  if (isMuted) {
    return (
      <div className="flex items-center text-red-500">
        <MicOff className="h-3 w-3" />
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-1">
      <Mic className="h-3 w-3 text-green-500" />
      <div className="flex space-x-0.5">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={cn(
              'w-1 h-2 bg-green-500 rounded-sm transition-opacity duration-100',
              audioLevel > (i + 1) * 0.25 ? 'opacity-100' : 'opacity-30'
            )}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * VideoTile component for displaying individual participant video
 */
export const VideoTile: React.FC<VideoTileProps> = ({
  participant,
  isLocal = false,
  showName = true,
  showAudioIndicator = true,
  showControls = false,
  isPinned = false,
  isFullscreen = false,
  className,
  onClick,
  onDoubleClick,
  onPin,
  onUnpin,
  onFullscreen,
  onMute,
  onUnmute
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);

  // Set up video stream
  useEffect(() => {
    if (videoRef.current && participant.stream) {
      videoRef.current.srcObject = participant.stream;
      setHasVideoError(false);
    } else if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [participant.stream]);

  // Handle video errors
  const handleVideoError = () => {
    setHasVideoError(true);
    console.error(`Video error for participant ${participant.displayName}`);
  };

  // Generate initials for avatar
  const initials = useMemo(() => {
    return participant.displayName
      .split(' ')
      .map(name => name.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  }, [participant.displayName]);

  // Handle click events
  const handleClick = () => {
    onClick?.(participant);
  };

  const handleDoubleClick = () => {
    onDoubleClick?.(participant);
  };

  // Control handlers
  const handlePin = () => {
    if (isPinned) {
      onUnpin?.(participant);
    } else {
      onPin?.(participant);
    }
  };

  const handleFullscreen = () => {
    onFullscreen?.(participant);
  };

  const handleMute = () => {
    if (participant.isMuted) {
      onUnmute?.(participant);
    } else {
      onMute?.(participant);
    }
  };

  // Determine what to show
  const showVideo = participant.isVideoEnabled && participant.videoTrack && !hasVideoError;
  const showAvatar = !showVideo;

  return (
    <div
      className={cn(
        'relative group rounded-lg overflow-hidden bg-zinc-900 border',
        'cursor-pointer transition-all duration-200',
        isLocal && 'ring-2 ring-blue-500/50',
        isPinned && 'ring-2 ring-yellow-500/50',
        isFullscreen && 'ring-2 ring-purple-500/50',
        'hover:ring-2 hover:ring-white/50',
        className
      )}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Video Element */}
      {showVideo && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal} // Prevent echo for local video
          className="w-full h-full object-cover"
          onError={handleVideoError}
        />
      )}

      {/* Avatar Fallback */}
      {showAvatar && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
          <Avatar className="w-16 h-16 md:w-20 md:h-20">
            <AvatarImage src={participant.avatarUrl} alt={participant.displayName} />
            <AvatarFallback className="text-lg font-medium bg-zinc-700">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          {/* Video disabled indicator */}
          {!participant.isVideoEnabled && (
            <div className="absolute top-2 right-2 p-1 bg-red-500/80 rounded-full">
              <VideoOff className="h-3 w-3 text-white" />
            </div>
          )}
        </div>
      )}

      {/* Local indicator */}
      {isLocal && (
        <div className="absolute top-2 left-2 px-2 py-1 bg-blue-500/80 text-white text-xs font-medium rounded">
          You
        </div>
      )}

      {/* Pinned indicator */}
      {isPinned && (
        <div className="absolute top-2 right-2 p-1 bg-yellow-500/80 rounded-full">
          <Pin className="h-3 w-3 text-white" />
        </div>
      )}

      {/* Name overlay */}
      {showName && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
          <div className="flex items-center justify-between">
            <span className="text-white text-sm font-medium truncate">
              {participant.displayName}
            </span>
            
            {/* Audio indicator */}
            {showAudioIndicator && (
              <AudioLevelIndicator 
                audioTrack={participant.audioTrack} 
                isMuted={participant.isMuted} 
              />
            )}
          </div>
        </div>
      )}

      {/* Controls overlay (visible on hover or when showControls is true) */}
      {(showControls || isHovered) && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex space-x-1">
            {/* Fullscreen button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 bg-black/40 hover:bg-black/60"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFullscreen();
                    }}
                  >
                    <Maximize2 className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Fullscreen</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Pin button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'h-8 w-8 p-0 bg-black/40 hover:bg-black/60',
                      isPinned && 'bg-yellow-500/60'
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePin();
                    }}
                  >
                    <Pin className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isPinned ? 'Unpin' : 'Pin'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* More options */}
            {!isLocal && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 bg-black/40 hover:bg-black/60"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleMute}>
                    {participant.isMuted ? (
                      <>
                        <Volume2 className="mr-2 h-4 w-4" />
                        Request Unmute
                      </>
                    ) : (
                      <>
                        <VolumeX className="mr-2 h-4 w-4" />
                        Request Mute
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => console.log('View profile')}>
                    <User className="mr-2 h-4 w-4" />
                    View Profile
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      )}

      {/* Connection status indicator */}
      {!participant.stream && !isLocal && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="text-white text-sm">
            Connecting...
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoTile;