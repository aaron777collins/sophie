'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { VideoTrack, LocalVideoTrack, RemoteVideoTrack, Track } from 'livekit-client';
import { getVideoCallService, VideoCallService, VideoTrackInfo, VideoCallOptions } from '@/services/video-call';
import { useVoiceStore } from '@/stores/voice-store';
import { VideoQuality } from '@/components/video/video-controls';

export interface VideoCallParticipant {
  identity: string;
  name: string;
  avatar?: string;
  videoTrack?: VideoTrack;
  isLocal: boolean;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
  isSpeaking: boolean;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'unknown';
  isOwner?: boolean;
}

export interface UseVideoCallOptions {
  roomName: string;
  userId: string;
  userName?: string;
  matrixAccessToken?: string;
  enableVideo?: boolean;
  enableAudio?: boolean;
  autoConnect?: boolean;
}

export interface UseVideoCallReturn {
  // State
  isConnected: boolean;
  isConnecting: boolean;
  isVideoCall: boolean;
  participants: VideoCallParticipant[];
  localVideoTrack: LocalVideoTrack | null;
  screenShareTrack: LocalVideoTrack | null;
  error: string | null;
  
  // Layout
  layoutMode: 'grid' | 'speaker' | 'fullscreen';
  pinnedParticipant: string | null;
  isPictureInPicture: boolean;

  // Local media state
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;

  // Actions
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  enableCamera: (deviceId?: string) => Promise<void>;
  disableCamera: () => Promise<void>;
  toggleCamera: () => Promise<void>;
  enableMicrophone: (deviceId?: string) => Promise<void>;
  disableMicrophone: () => Promise<void>;
  toggleMicrophone: () => Promise<void>;
  startScreenShare: () => Promise<void>;
  stopScreenShare: () => Promise<void>;
  toggleScreenShare: () => Promise<void>;
  switchCamera: (deviceId: string) => Promise<void>;
  switchMicrophone: (deviceId: string) => Promise<void>;
  
  // Layout controls
  setLayoutMode: (mode: 'grid' | 'speaker' | 'fullscreen') => void;
  pinParticipant: (identity: string | null) => void;
  togglePictureInPicture: () => void;
}

export function useVideoCall(options: UseVideoCallOptions): UseVideoCallReturn {
  const {
    roomName,
    userId,
    userName = userId,
    matrixAccessToken,
    enableVideo = false,
    enableAudio = true,
    autoConnect = false,
  } = options;

  const videoCallServiceRef = useRef<VideoCallService | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [participants, setParticipants] = useState<VideoCallParticipant[]>([]);
  const [localVideoTrack, setLocalVideoTrack] = useState<LocalVideoTrack | null>(null);
  const [screenShareTrack, setScreenShareTrack] = useState<LocalVideoTrack | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Layout state
  const [layoutMode, setLayoutModeState] = useState<'grid' | 'speaker' | 'fullscreen'>('grid');
  const [pinnedParticipant, setPinnedParticipant] = useState<string | null>(null);
  const [isPictureInPicture, setIsPictureInPicture] = useState(false);

  // Get voice store state for media controls
  const {
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    setAudioEnabled,
    setVideoEnabled,
    setScreenSharing,
  } = useVoiceStore();

  // Initialize video call service
  useEffect(() => {
    videoCallServiceRef.current = getVideoCallService();

    // Set up event handlers
    videoCallServiceRef.current.setEventHandlers({
      onVideoTrackSubscribed: (trackInfo: VideoTrackInfo) => {
        setParticipants(prev => {
          const existing = prev.find(p => p.identity === trackInfo.participant.identity);
          if (existing) {
            return prev.map(p => 
              p.identity === trackInfo.participant.identity
                ? { ...p, videoTrack: trackInfo.track, isVideoEnabled: true }
                : p
            );
          } else {
            return [...prev, {
              identity: trackInfo.participant.identity,
              name: trackInfo.participant.name,
              videoTrack: trackInfo.track,
              isLocal: trackInfo.isLocal,
              isVideoEnabled: true,
              isAudioEnabled: true, // Will be updated by voice events
              isScreenSharing: trackInfo.isScreenShare,
              isSpeaking: false,
              connectionQuality: 'unknown' as const,
            }];
          }
        });
      },
      onVideoTrackUnsubscribed: (trackSid: string) => {
        setParticipants(prev => 
          prev.map(p => 
            p.videoTrack?.sid === trackSid 
              ? { ...p, videoTrack: undefined, isVideoEnabled: false }
              : p
          )
        );
      },
      onLayoutChanged: (layout: 'grid' | 'speaker' | 'fullscreen') => {
        setLayoutModeState(layout);
      },
      onParticipantVideoEnabled: (identity: string, enabled: boolean) => {
        setParticipants(prev => 
          prev.map(p => 
            p.identity === identity 
              ? { ...p, isVideoEnabled: enabled }
              : p
          )
        );
      },
    });

    return () => {
      if (videoCallServiceRef.current?.getState().isVideoCall) {
        videoCallServiceRef.current.cleanup();
      }
    };
  }, []);

  // Auto-connect if enabled
  useEffect(() => {
    if (autoConnect && !isConnected && !isConnecting) {
      connect();
    }
  }, [autoConnect]);

  // Connect to video call
  const connect = useCallback(async () => {
    if (!videoCallServiceRef.current || isConnecting) return;

    setIsConnecting(true);
    setError(null);

    try {
      const callOptions: VideoCallOptions = {
        roomName,
        identity: userId,
        name: userName,
        matrixAccessToken,
        enableVideo,
        enableAudio,
      };

      await videoCallServiceRef.current.initializeVideoCall(callOptions);
      
      setIsConnected(true);
      setIsVideoCall(true);
      
      // Update local tracks
      const state = videoCallServiceRef.current.getState();
      setLocalVideoTrack(state.localVideoTrack);
      setScreenShareTrack(state.screenShareTrack);
      
      // Sync with voice store
      setVideoEnabled(enableVideo);
      setAudioEnabled(enableAudio);

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to connect to video call';
      setError(errorMsg);
    } finally {
      setIsConnecting(false);
    }
  }, [roomName, userId, userName, matrixAccessToken, enableVideo, enableAudio, isConnecting, setVideoEnabled, setAudioEnabled]);

  // Disconnect from video call
  const disconnect = useCallback(async () => {
    if (!videoCallServiceRef.current) return;

    try {
      await videoCallServiceRef.current.cleanup();
      
      setIsConnected(false);
      setIsVideoCall(false);
      setParticipants([]);
      setLocalVideoTrack(null);
      setScreenShareTrack(null);
      setError(null);
      setPinnedParticipant(null);
      setIsPictureInPicture(false);

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to disconnect';
      setError(errorMsg);
    }
  }, []);

  // Camera controls
  const enableCamera = useCallback(async (deviceId?: string) => {
    if (!videoCallServiceRef.current) return;

    try {
      const track = await videoCallServiceRef.current.enableCamera(deviceId);
      setLocalVideoTrack(track);
      setVideoEnabled(true);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to enable camera';
      setError(errorMsg);
    }
  }, [setVideoEnabled]);

  const disableCamera = useCallback(async () => {
    if (!videoCallServiceRef.current) return;

    try {
      await videoCallServiceRef.current.disableCamera();
      setLocalVideoTrack(null);
      setVideoEnabled(false);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to disable camera';
      setError(errorMsg);
    }
  }, [setVideoEnabled]);

  const toggleCamera = useCallback(async () => {
    if (isVideoEnabled) {
      await disableCamera();
    } else {
      await enableCamera();
    }
  }, [isVideoEnabled, enableCamera, disableCamera]);

  // Microphone controls
  const enableMicrophone = useCallback(async (deviceId?: string) => {
    if (!videoCallServiceRef.current) return;

    try {
      await videoCallServiceRef.current.enableMicrophone(deviceId);
      setAudioEnabled(true);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to enable microphone';
      setError(errorMsg);
    }
  }, [setAudioEnabled]);

  const disableMicrophone = useCallback(async () => {
    if (!videoCallServiceRef.current) return;

    try {
      await videoCallServiceRef.current.disableMicrophone();
      setAudioEnabled(false);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to disable microphone';
      setError(errorMsg);
    }
  }, [setAudioEnabled]);

  const toggleMicrophone = useCallback(async () => {
    if (isAudioEnabled) {
      await disableMicrophone();
    } else {
      await enableMicrophone();
    }
  }, [isAudioEnabled, enableMicrophone, disableMicrophone]);

  // Screen sharing controls
  const startScreenShare = useCallback(async () => {
    if (!videoCallServiceRef.current) return;

    try {
      const track = await videoCallServiceRef.current.startScreenShare();
      setScreenShareTrack(track);
      setScreenSharing(true);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to start screen sharing';
      setError(errorMsg);
    }
  }, [setScreenSharing]);

  const stopScreenShare = useCallback(async () => {
    if (!videoCallServiceRef.current) return;

    try {
      await videoCallServiceRef.current.stopScreenShare();
      setScreenShareTrack(null);
      setScreenSharing(false);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to stop screen sharing';
      setError(errorMsg);
    }
  }, [setScreenSharing]);

  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      await stopScreenShare();
    } else {
      await startScreenShare();
    }
  }, [isScreenSharing, startScreenShare, stopScreenShare]);

  // Device switching
  const switchCamera = useCallback(async (deviceId: string) => {
    if (!videoCallServiceRef.current) return;

    try {
      await videoCallServiceRef.current.switchCamera(deviceId);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to switch camera';
      setError(errorMsg);
    }
  }, []);

  const switchMicrophone = useCallback(async (deviceId: string) => {
    if (!videoCallServiceRef.current) return;

    try {
      await videoCallServiceRef.current.switchMicrophone(deviceId);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to switch microphone';
      setError(errorMsg);
    }
  }, []);

  // Layout controls
  const setLayoutMode = useCallback((mode: 'grid' | 'speaker' | 'fullscreen') => {
    if (videoCallServiceRef.current) {
      videoCallServiceRef.current.setLayoutMode(mode);
    }
    setLayoutModeState(mode);
  }, []);

  const pinParticipant = useCallback((identity: string | null) => {
    if (videoCallServiceRef.current) {
      videoCallServiceRef.current.pinParticipant(identity);
    }
    setPinnedParticipant(identity);
  }, []);

  const togglePictureInPicture = useCallback(() => {
    setIsPictureInPicture(prev => !prev);
  }, []);

  return {
    // State
    isConnected,
    isConnecting,
    isVideoCall,
    participants,
    localVideoTrack,
    screenShareTrack,
    error,
    
    // Layout
    layoutMode,
    pinnedParticipant,
    isPictureInPicture,

    // Local media state
    isVideoEnabled,
    isAudioEnabled,
    isScreenSharing,

    // Actions
    connect,
    disconnect,
    enableCamera,
    disableCamera,
    toggleCamera,
    enableMicrophone,
    disableMicrophone,
    toggleMicrophone,
    startScreenShare,
    stopScreenShare,
    toggleScreenShare,
    switchCamera,
    switchMicrophone,
    
    // Layout controls
    setLayoutMode,
    pinParticipant,
    togglePictureInPicture,
  };
}

export default useVideoCall;