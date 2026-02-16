'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Room, 
  RemoteParticipant, 
  LocalParticipant, 
  Track,
  RemoteTrack,
  LocalTrack,
  TrackPublication,
} from 'livekit-client';
import { ScreenShareButton } from './screen-share-button';
import { Maximize2, Minimize2, Users, Grid3x3 } from 'lucide-react';
import { Button } from '@/components/ui';

export interface ParticipantInfo {
  participant: LocalParticipant | RemoteParticipant;
  videoTrack?: TrackPublication;
  audioTrack?: TrackPublication;
  screenShareTrack?: TrackPublication;
  screenShareAudioTrack?: TrackPublication;
  isLocal: boolean;
  isScreenSharing: boolean;
}

export interface VideoCallLayoutProps {
  /** LiveKit room instance */
  room: Room;
  /** Whether to show screen share controls */
  showScreenShareControls?: boolean;
  /** Layout mode for participants */
  layoutMode?: 'grid' | 'focus' | 'sidebar';
  /** Maximum number of participants to show in grid */
  maxGridParticipants?: number;
  /** Whether to show participant names */
  showParticipantNames?: boolean;
  /** Whether the call is active */
  isCallActive?: boolean;
  /** Custom CSS classes */
  className?: string;
  /** Callback when layout mode changes */
  onLayoutModeChange?: (mode: 'grid' | 'focus' | 'sidebar') => void;
}

type ViewMode = 'participants-only' | 'screen-share-focus' | 'mixed';

export const VideoCallLayout: React.FC<VideoCallLayoutProps> = ({
  room,
  showScreenShareControls = true,
  layoutMode: initialLayoutMode = 'grid',
  maxGridParticipants = 9,
  showParticipantNames = true,
  isCallActive = false,
  className = '',
  onLayoutModeChange,
}) => {
  const [participants, setParticipants] = useState<ParticipantInfo[]>([]);
  const [layoutMode, setLayoutMode] = useState<'grid' | 'focus' | 'sidebar'>(initialLayoutMode);
  const [focusedParticipant, setFocusedParticipant] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Get current view mode based on screen shares
  const viewMode: ViewMode = useMemo(() => {
    const screenSharers = participants.filter(p => p.isScreenSharing);
    
    if (screenSharers.length === 0) {
      return 'participants-only';
    } else if (screenSharers.length === 1 && layoutMode === 'focus') {
      return 'screen-share-focus';
    } else {
      return 'mixed';
    }
  }, [participants, layoutMode]);

  // Update participants list when room changes
  useEffect(() => {
    if (!room) return;

    const updateParticipants = () => {
      const allParticipants: ParticipantInfo[] = [];

      // Add local participant
      const localParticipant = room.localParticipant;
      const localScreenShare = Array.from(localParticipant.trackPublications.values())
        .find(pub => pub.track?.source === Track.Source.ScreenShare);

      allParticipants.push({
        participant: localParticipant,
        videoTrack: localParticipant.getTrackPublication(Track.Source.Camera),
        audioTrack: localParticipant.getTrackPublication(Track.Source.Microphone),
        screenShareTrack: localParticipant.getTrackPublication(Track.Source.ScreenShare),
        screenShareAudioTrack: localParticipant.getTrackPublication(Track.Source.ScreenShareAudio),
        isLocal: true,
        isScreenSharing: !!localScreenShare,
      });

      // Add remote participants
      Array.from(room.remoteParticipants.values()).forEach(participant => {
        const screenShare = Array.from(participant.trackPublications.values())
          .find(pub => pub.track?.source === Track.Source.ScreenShare);

        allParticipants.push({
          participant,
          videoTrack: participant.getTrackPublication(Track.Source.Camera),
          audioTrack: participant.getTrackPublication(Track.Source.Microphone),
          screenShareTrack: participant.getTrackPublication(Track.Source.ScreenShare),
          screenShareAudioTrack: participant.getTrackPublication(Track.Source.ScreenShareAudio),
          isLocal: false,
          isScreenSharing: !!screenShare,
        });
      });

      setParticipants(allParticipants);
    };

    // Initial update
    updateParticipants();

    // Listen for participant changes
    const handleParticipantConnected = () => updateParticipants();
    const handleParticipantDisconnected = () => updateParticipants();
    const handleTrackSubscribed = () => updateParticipants();
    const handleTrackUnsubscribed = () => updateParticipants();
    const handleTrackPublished = () => updateParticipants();
    const handleTrackUnpublished = () => updateParticipants();

    room.on('participantConnected', handleParticipantConnected);
    room.on('participantDisconnected', handleParticipantDisconnected);
    room.on('trackSubscribed', handleTrackSubscribed);
    room.on('trackUnsubscribed', handleTrackUnsubscribed);
    room.on('trackPublished', handleTrackPublished);
    room.on('trackUnpublished', handleTrackUnpublished);

    return () => {
      room.off('participantConnected', handleParticipantConnected);
      room.off('participantDisconnected', handleParticipantDisconnected);
      room.off('trackSubscribed', handleTrackSubscribed);
      room.off('trackUnsubscribed', handleTrackUnsubscribed);
      room.off('trackPublished', handleTrackPublished);
      room.off('trackUnpublished', handleTrackUnpublished);
    };
  }, [room]);

  const handleLayoutModeChange = (mode: 'grid' | 'focus' | 'sidebar') => {
    setLayoutMode(mode);
    onLayoutModeChange?.(mode);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  // Render participant video
  const renderParticipantVideo = (participantInfo: ParticipantInfo, isScreenShare = false) => {
    const { participant, videoTrack, screenShareTrack, isLocal } = participantInfo;
    const trackToRender = isScreenShare ? screenShareTrack : videoTrack;
    
    if (!trackToRender || !trackToRender.track) {
      return (
        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center mb-2 mx-auto">
              <Users className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-gray-300 text-sm">
              {isScreenShare ? 'No screen share' : 'No video'}
            </p>
          </div>
        </div>
      );
    }

    return (
      <VideoRenderer
        track={trackToRender.track as LocalTrack | RemoteTrack}
        isLocal={isLocal && !isScreenShare}
        participantName={participant.identity}
        showName={showParticipantNames}
      />
    );
  };

  // Get screen sharing participants
  const screenSharingParticipants = participants.filter(p => p.isScreenSharing);
  const regularParticipants = participants;

  // Render based on view mode
  const renderContent = () => {
    switch (viewMode) {
      case 'screen-share-focus':
        const screenSharer = screenSharingParticipants[0];
        return (
          <div className="w-full h-full flex flex-col">
            {/* Main screen share area */}
            <div className="flex-1 bg-black">
              {renderParticipantVideo(screenSharer, true)}
            </div>
            
            {/* Participant thumbnails */}
            <div className="h-24 bg-gray-900 flex items-center px-4 space-x-2 overflow-x-auto">
              {regularParticipants.slice(0, 8).map((p) => (
                <div
                  key={p.participant.sid}
                  className="w-20 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-800"
                >
                  {renderParticipantVideo(p)}
                </div>
              ))}
            </div>
          </div>
        );

      case 'mixed':
        return (
          <div className="w-full h-full grid grid-cols-2 gap-2 p-2">
            {/* Screen shares take priority */}
            {screenSharingParticipants.map((p) => (
              <div key={`${p.participant.sid}-screen`} className="bg-black rounded-lg overflow-hidden">
                {renderParticipantVideo(p, true)}
              </div>
            ))}
            
            {/* Regular participants fill remaining space */}
            {regularParticipants
              .slice(0, 4 - screenSharingParticipants.length)
              .map((p) => (
                <div key={p.participant.sid} className="bg-gray-800 rounded-lg overflow-hidden">
                  {renderParticipantVideo(p)}
                </div>
              ))}
          </div>
        );

      case 'participants-only':
      default:
        const gridSize = Math.min(participants.length, maxGridParticipants);
        const gridCols = Math.ceil(Math.sqrt(gridSize));
        
        return (
          <div 
            className={`w-full h-full grid gap-2 p-2`}
            style={{ 
              gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
              gridTemplateRows: `repeat(${Math.ceil(gridSize / gridCols)}, 1fr)`
            }}
          >
            {participants.slice(0, maxGridParticipants).map((p) => (
              <div 
                key={p.participant.sid} 
                className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                onClick={() => setFocusedParticipant(
                  focusedParticipant === p.participant.sid ? null : p.participant.sid
                )}
              >
                {renderParticipantVideo(p)}
              </div>
            ))}
          </div>
        );
    }
  };

  if (!isCallActive) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-gray-900 ${className}`}>
        <div className="text-center">
          <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No active call</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full relative bg-gray-900 ${className}`}>
      {/* Main video area */}
      <div className="w-full h-full">
        {renderContent()}
      </div>

      {/* Controls overlay */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2">
        {/* Layout controls */}
        <div className="flex bg-black bg-opacity-50 rounded-lg p-1 space-x-1">
          <Button
            size="small"
            variant={layoutMode === 'grid' ? 'primary' : 'secondary'}
            onClick={() => handleLayoutModeChange('grid')}
            className="w-8 h-8 p-0"
          >
            <Grid3x3 className="w-4 h-4" />
          </Button>
          
          {screenSharingParticipants.length > 0 && (
            <Button
              size="small"
              variant={layoutMode === 'focus' ? 'primary' : 'secondary'}
              onClick={() => handleLayoutModeChange('focus')}
              className="w-8 h-8 p-0"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Screen share controls */}
        {showScreenShareControls && (
          <ScreenShareButton
            room={room}
            inCall={isCallActive}
            showOptions={true}
          />
        )}

        {/* Fullscreen toggle */}
        <Button
          size="small"
          variant="secondary"
          onClick={toggleFullscreen}
          className="w-8 h-8 p-0 bg-black bg-opacity-50"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </Button>
      </div>

      {/* Participant count */}
      <div className="absolute top-4 right-4 bg-black bg-opacity-50 rounded-lg px-3 py-1 text-white text-sm">
        <Users className="w-4 h-4 inline mr-1" />
        {participants.length}
        {screenSharingParticipants.length > 0 && (
          <span className="ml-2 text-green-400">
            {screenSharingParticipants.length} sharing
          </span>
        )}
      </div>
    </div>
  );
};

// Video renderer component
interface VideoRendererProps {
  track: LocalTrack | RemoteTrack;
  isLocal?: boolean;
  participantName?: string;
  showName?: boolean;
}

const VideoRenderer: React.FC<VideoRendererProps> = ({ 
  track, 
  isLocal = false, 
  participantName,
  showName = true 
}) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (track && videoRef.current) {
      track.attach(videoRef.current);
      return () => {
        track.detach(videoRef.current!);
      };
    }
  }, [track]);

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal} // Prevent audio feedback for local video
        className="w-full h-full object-cover"
        style={{ transform: isLocal ? 'scaleX(-1)' : 'none' }} // Mirror local video
      />
      
      {showName && participantName && (
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 rounded px-2 py-1 text-white text-xs">
          {participantName} {isLocal && '(You)'}
        </div>
      )}
    </div>
  );
};