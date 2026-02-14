'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getLiveKitService, LiveKitService, ParticipantInfo } from '@/services/livekit';
import { useVoiceStore, VoiceParticipant, ConnectionState } from '@/stores/voice-store';
import { RemoteParticipant, RemoteTrack, Room } from 'livekit-client';

export interface UseVoiceChannelOptions {
  roomName: string;
  userId: string;
  userName?: string;
  matrixAccessToken?: string;
  autoConnect?: boolean;
}

export interface UseVoiceChannelReturn {
  // State
  room: Room | null;
  isConnected: boolean;
  isConnecting: boolean;
  connectionState: ConnectionState;
  participants: VoiceParticipant[];
  error: string | null;

  // Local controls
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  isDeafened: boolean;

  // Actions
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  toggleAudio: () => Promise<void>;
  toggleVideo: () => Promise<void>;
  toggleScreenShare: () => Promise<void>;
  toggleDeafen: () => void;
}

export function useVoiceChannel(options: UseVoiceChannelOptions): UseVoiceChannelReturn {
  const {
    roomName,
    userId,
    userName = userId,
    matrixAccessToken,
    autoConnect = false,
  } = options;

  const liveKitRef = useRef<LiveKitService | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const {
    connectionState,
    setConnectionState,
    setCurrentChannel,
    setError,
    isAudioEnabled,
    setAudioEnabled,
    isVideoEnabled,
    setVideoEnabled,
    isScreenSharing,
    setScreenSharing,
    isDeafened,
    setDeafened,
    participants,
    addParticipant,
    removeParticipant,
    updateParticipant,
    clearParticipants,
    error,
  } = useVoiceStore();

  // Initialize LiveKit service
  useEffect(() => {
    liveKitRef.current = getLiveKitService();

    // Set up event handlers
    liveKitRef.current.setEventHandlers({
      onParticipantConnected: (participant: RemoteParticipant) => {
        addParticipant(mapRemoteParticipant(participant));
      },
      onParticipantDisconnected: (participant: RemoteParticipant) => {
        removeParticipant(participant.identity);
      },
      onTrackSubscribed: (track: RemoteTrack, participant: RemoteParticipant) => {
        // Update participant state when track is subscribed
        updateParticipant(participant.identity, {
          isAudioEnabled: participant.isMicrophoneEnabled,
          isVideoEnabled: participant.isCameraEnabled,
          isScreenSharing: participant.isScreenShareEnabled,
        });
      },
      onTrackUnsubscribed: (track: RemoteTrack, participant: RemoteParticipant) => {
        updateParticipant(participant.identity, {
          isAudioEnabled: participant.isMicrophoneEnabled,
          isVideoEnabled: participant.isCameraEnabled,
          isScreenSharing: participant.isScreenShareEnabled,
        });
      },
      onConnectionStateChanged: (state: string) => {
        setConnectionState(state as ConnectionState);
      },
      onError: (err: Error) => {
        setError(err.message);
      },
      onSpeakingChanged: (identity: string, speaking: boolean) => {
        updateParticipant(identity, { isSpeaking: speaking });
      },
    });

    return () => {
      if (liveKitRef.current?.isConnected()) {
        liveKitRef.current.disconnect();
      }
    };
  }, []);

  // Auto-connect if enabled
  useEffect(() => {
    if (autoConnect && !room && !isConnecting) {
      connect();
    }
  }, [autoConnect]);

  const connect = useCallback(async () => {
    if (!liveKitRef.current || isConnecting) return;

    setIsConnecting(true);
    setConnectionState('connecting');
    setError(null);

    try {
      // Request token from JWT service
      const token = await liveKitRef.current.requestToken(roomName, userId, {
        name: userName,
        matrixAccessToken,
      });

      // Connect to room
      const connectedRoom = await liveKitRef.current.connectToRoom(roomName, token);
      setRoom(connectedRoom);
      setConnectionState('connected');
      setCurrentChannel({
        id: roomName,
        name: roomName,
        participants: [],
      });

      // Add existing participants
      const existingParticipants = liveKitRef.current.getParticipants();
      existingParticipants.forEach((p) => {
        addParticipant(mapParticipantInfo(p));
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
      setConnectionState('error');
    } finally {
      setIsConnecting(false);
    }
  }, [roomName, userId, userName, matrixAccessToken]);

  const disconnect = useCallback(async () => {
    if (!liveKitRef.current) return;

    try {
      await liveKitRef.current.disconnect();
      setRoom(null);
      setConnectionState('disconnected');
      setCurrentChannel(null);
      clearParticipants();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect');
    }
  }, []);

  const toggleAudio = useCallback(async () => {
    if (!liveKitRef.current?.isConnected()) return;

    try {
      const newState = !isAudioEnabled;
      await liveKitRef.current.setAudioEnabled(newState);
      setAudioEnabled(newState);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle audio');
    }
  }, [isAudioEnabled]);

  const toggleVideo = useCallback(async () => {
    if (!liveKitRef.current?.isConnected()) return;

    try {
      const newState = !isVideoEnabled;
      await liveKitRef.current.setVideoEnabled(newState);
      setVideoEnabled(newState);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle video');
    }
  }, [isVideoEnabled]);

  const toggleScreenShare = useCallback(async () => {
    if (!liveKitRef.current?.isConnected()) return;

    try {
      if (isScreenSharing) {
        await liveKitRef.current.stopScreenShare();
      } else {
        await liveKitRef.current.startScreenShare();
      }
      setScreenSharing(!isScreenSharing);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle screen share');
    }
  }, [isScreenSharing]);

  const toggleDeafen = useCallback(() => {
    const newState = !isDeafened;
    setDeafened(newState);
    
    // When deafening, also mute
    if (newState && isAudioEnabled) {
      toggleAudio();
    }
  }, [isDeafened, isAudioEnabled, toggleAudio]);

  return {
    room,
    isConnected: connectionState === 'connected',
    isConnecting,
    connectionState,
    participants: Array.from(participants.values()),
    error,
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    isDeafened,
    connect,
    disconnect,
    toggleAudio,
    toggleVideo,
    toggleScreenShare,
    toggleDeafen,
  };
}

// Helper functions
function mapRemoteParticipant(participant: RemoteParticipant): VoiceParticipant {
  return {
    identity: participant.identity,
    name: participant.name || participant.identity,
    isSpeaking: false,
    isAudioEnabled: participant.isMicrophoneEnabled,
    isVideoEnabled: participant.isCameraEnabled,
    isScreenSharing: participant.isScreenShareEnabled,
    isLocal: false,
    connectionQuality: 'unknown',
  };
}

function mapParticipantInfo(info: ParticipantInfo): VoiceParticipant {
  return {
    identity: info.identity,
    name: info.name || info.identity,
    avatar: info.avatar,
    isSpeaking: info.isSpeaking,
    isAudioEnabled: info.audioEnabled,
    isVideoEnabled: info.videoEnabled,
    isScreenSharing: info.screenShareEnabled,
    isLocal: info.isLocal,
    connectionQuality: 'unknown',
  };
}

export default useVoiceChannel;
