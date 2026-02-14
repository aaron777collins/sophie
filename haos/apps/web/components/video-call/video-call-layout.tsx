'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useVideoCall } from '@/hooks/use-video-call';
import { useVoiceStore } from '@/stores/voice-store';
import { VideoControls } from '@/components/video/video-controls';
import { VideoGrid } from '@/components/video/video-grid';
import { VideoTile, type VideoGridParticipant } from '@/components/video/video-tile';
import { CameraPreview } from '@/components/video/camera-preview';
import { PictureInPicture } from '@/components/video/picture-in-picture';
import { Users, Monitor, AlertTriangle, Loader2, PhoneOff } from 'lucide-react';

export interface VideoCallLayoutProps {
  roomName: string;
  userId: string;
  userName?: string;
  matrixAccessToken?: string;
  className?: string;
  onDisconnect?: () => void;
  onError?: (error: string) => void;
  enablePreviewBeforeJoin?: boolean;
}

export function VideoCallLayout({
  roomName,
  userId,
  userName,
  matrixAccessToken,
  className = '',
  onDisconnect,
  onError,
  enablePreviewBeforeJoin = false
}: VideoCallLayoutProps) {
  const [preJoinView, setPreJoinView] = useState(enablePreviewBeforeJoin);
  const [isJoining, setIsJoining] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize video call hook
  const {
    isConnected,
    isConnecting,
    participants,
    localVideoTrack,
    screenShareTrack,
    error,
    layoutMode,
    pinnedParticipant,
    isPictureInPicture,
    isVideoEnabled,
    isAudioEnabled,
    connect,
    disconnect,
    toggleCamera,
    toggleMicrophone,
    startScreenShare,
    stopScreenShare,
    setLayoutMode,
    pinParticipant,
    switchCamera,
    switchMicrophone,
    toggleScreenShare
  } = useVideoCall({
    roomName,
    userId,
    userName,
    matrixAccessToken,
    enableVideo: true,
    enableAudio: true,
    autoConnect: !enablePreviewBeforeJoin
  });

  // Voice store for additional state
  const { currentChannel, isDeafened } = useVoiceStore();

  // Handle connection errors
  useEffect(() => {
    if (error) {
      console.error('Video call error:', error);
      onError?.(error);
    }
  }, [error, onError]);

  // Convert participants for video grid
  const gridParticipants: VideoGridParticipant[] = participants.map(participant => ({
    identity: participant.identity,
    name: participant.name,
    avatar: participant.avatar,
    tracks: participant.videoTrack ? [
      {
        trackSid: participant.videoTrack.sid || '',
        participant: {
          identity: participant.identity,
          name: participant.name,
        },
        track: participant.videoTrack,
        isLocal: participant.isLocal,
        isScreenShare: participant.isScreenSharing,
      }
    ] : [],
    hasVideo: participant.isVideoEnabled,
    hasScreenShare: participant.isScreenSharing,
    isLocal: participant.isLocal,
    isPinned: participant.identity === pinnedParticipant,
    isSpeaking: participant.isSpeaking,
    isAudioEnabled: participant.isAudioEnabled,
    isScreenSharing: participant.isScreenSharing,
    isOwner: participant.isOwner
  }));

  // Handle device changes
  const handleDeviceChange = useCallback(async (type: 'camera' | 'microphone', deviceId: string) => {
    try {
      if (type === 'camera') {
        await switchCamera(deviceId);
      } else {
        await switchMicrophone(deviceId);
      }
    } catch (err) {
      console.error('Failed to change device:', err);
    }
  }, [switchCamera, switchMicrophone]);

  // Handle screen share toggle
  const handleScreenShareToggle = useCallback(async () => {
    try {
      await toggleScreenShare();
    } catch (err) {
      console.error('Failed to toggle screen share:', err);
    }
  }, [toggleScreenShare]);

  // Handle participant interactions
  const handleParticipantClick = useCallback((identity: string) => {
    if (pinnedParticipant === identity) {
      pinParticipant(null);
    } else {
      pinParticipant(identity);
    }
  }, [pinnedParticipant, pinParticipant]);

  const handleParticipantDoubleClick = useCallback((identity: string) => {
    setLayoutMode('fullscreen');
    pinParticipant(identity);
  }, [setLayoutMode, pinParticipant]);

  // Handle join call
  const handleJoinCall = useCallback(async () => {
    setIsJoining(true);
    try {
      await connect();
      setPreJoinView(false);
    } catch (err) {
      console.error('Failed to join call:', err);
    } finally {
      setIsJoining(false);
    }
  }, [connect]);

  // Handle disconnect
  const handleDisconnect = useCallback(() => {
    disconnect();
    onDisconnect?.();
  }, [disconnect, onDisconnect]);

  // Pre-join view with camera preview
  if (preJoinView) {
    return (
      <div className={cn(
        'flex flex-col items-center justify-center min-h-screen bg-[#1e1f22] p-6',
        className
      )}>
        <div className="max-w-lg w-full space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-white mb-2">
              Join Video Call
            </h2>
            <p className="text-gray-400">
              Room: {roomName}
            </p>
          </div>

          <CameraPreview
            className="w-full max-w-md mx-auto"
            isActive={true}
            videoDevices={[]}
            videoQualities={[]}
            onDeviceChange={(deviceId) => handleDeviceChange('camera', deviceId)}
          />

          <div className="flex justify-center gap-3">
            <button
              onClick={() => setPreJoinView(false)}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleJoinCall}
              disabled={isJoining}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all",
                "bg-green-600 hover:bg-green-700 text-white",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isJoining ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  <Users className="w-4 h-4" />
                  Join Call
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading/connecting state
  if (isConnecting && !isConnected) {
    return (
      <div className={cn(
        'flex flex-col items-center justify-center min-h-screen bg-[#1e1f22]',
        className
      )}>
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto" />
          <p className="text-white font-medium">Connecting to video call...</p>
          <p className="text-gray-400 text-sm">Room: {roomName}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !isConnected) {
    return (
      <div className={cn(
        'flex flex-col items-center justify-center min-h-screen bg-[#1e1f22]',
        className
      )}>
        <div className="text-center space-y-4 max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
          <h3 className="text-xl font-semibold text-white">Connection Failed</h3>
          <p className="text-gray-400">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Retry
            </button>
            <button
              onClick={handleDisconnect}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main video call layout
  return (
    <div 
      ref={containerRef}
      className={cn(
        'relative flex flex-col h-screen bg-[#1e1f22] overflow-hidden',
        className
      )}
    >
      {/* Header with room info */}
      <div className="flex items-center justify-between p-4 bg-[#2f3136] border-b border-[#2d2f34]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-green-500" />
            <span className="font-medium text-white">{roomName}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-400">
            <Users className="w-4 h-4" />
            <span>{participants.length} participant{participants.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        <button
          onClick={handleDisconnect}
          className="flex items-center gap-2 px-3 py-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <PhoneOff className="w-4 h-4" />
          <span className="text-sm font-medium">Leave</span>
        </button>
      </div>

      {/* Main video area */}
      <div className="flex-1 relative">
        {layoutMode === 'grid' && (
          <VideoGrid
            participants={gridParticipants}
            layout="grid"
            pinnedParticipant={pinnedParticipant}
            maxParticipants={16}
            showLocalParticipant={true}
            onParticipantClick={handleParticipantClick}
            onParticipantDoubleClick={handleParticipantDoubleClick}
            className="h-full"
          />
        )}

        {layoutMode === 'speaker' && gridParticipants.length > 0 && (
          <div className="flex h-full">
            {/* Main speaker view */}
            <div className="flex-1 relative">
              {(() => {
                const mainParticipant = pinnedParticipant 
                  ? gridParticipants.find(p => p.identity === pinnedParticipant) || gridParticipants[0]
                  : gridParticipants[0];
                
                return mainParticipant ? (
                  <VideoTile
                    participant={mainParticipant}
                    showControls={true}
                    onDoubleClick={() => setLayoutMode('fullscreen')}
                    className="w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    No participants
                  </div>
                );
              })()}
            </div>
            
            {/* Sidebar with other participants */}
            {gridParticipants.length > 1 && (
              <div className="w-64 bg-[#232428] border-l border-[#2d2f34] p-2 space-y-2 overflow-y-auto">
                {gridParticipants
                  .filter(p => p.identity !== (pinnedParticipant || gridParticipants[0]?.identity))
                  .map(participant => (
                    <VideoTile
                      key={participant.identity}
                      participant={participant}
                      onClick={() => handleParticipantClick(participant.identity)}
                      className="aspect-video"
                    />
                  ))}
              </div>
            )}
          </div>
        )}

        {layoutMode === 'fullscreen' && pinnedParticipant && (() => {
          const fullscreenParticipant = gridParticipants.find(p => p.identity === pinnedParticipant);
          return fullscreenParticipant ? (
            <VideoTile
              participant={fullscreenParticipant}
              showControls={true}
              onDoubleClick={() => setLayoutMode('speaker')}
              className="w-full h-full"
            />
          ) : null;
        })()}

        {/* Picture in Picture mode */}
        {isPictureInPicture && localVideoTrack && (() => {
          const localParticipant = gridParticipants.find(p => p.isLocal);
          return localParticipant ? (
            <PictureInPicture
              isActive={true}
              participant={localParticipant}
              onClose={() => {
                // Handle PiP close
              }}
            />
          ) : null;
        })()}

        {/* Screen share indicator */}
        {screenShareTrack && (
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-green-600 text-white px-3 py-1 rounded-lg text-sm">
            <Monitor className="w-4 h-4" />
            You're sharing your screen
          </div>
        )}
      </div>

      {/* Video controls */}
      <VideoControls
        isCameraEnabled={isVideoEnabled}
        isMicrophoneEnabled={isAudioEnabled}
        isScreenSharing={!!screenShareTrack}
        layoutMode={layoutMode}
        participantCount={participants.length}
        onCameraToggle={toggleCamera}
        onMicrophoneToggle={toggleMicrophone}
        onScreenShareToggle={handleScreenShareToggle}
        onLayoutChange={setLayoutMode}
        onDisconnect={handleDisconnect}
        onDeviceChange={handleDeviceChange}
        position="bottom"
      />
    </div>
  );
}

export default VideoCallLayout;