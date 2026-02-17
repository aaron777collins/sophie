import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  VideoCallService, 
  VideoParticipant, 
  VideoCallEvents,
  getVideoCallService 
} from '../services/video-call';

export type CallState = 'idle' | 'joining' | 'connected' | 'leaving' | 'error';

export interface UseVideoCallReturn {
  // State
  callState: CallState;
  participants: VideoParticipant[];
  localParticipant: VideoParticipant | null;
  remoteParticipants: VideoParticipant[];
  isConnected: boolean;
  error: string | null;
  participantCount: number;
  isAtMaxCapacity: boolean;
  
  // Actions
  joinCall: (roomId: string, userId: string, displayName: string) => Promise<void>;
  leaveCall: () => Promise<void>;
  toggleAudio: () => boolean;
  toggleVideo: () => boolean;
  
  // Utility
  getParticipant: (participantId: string) => VideoParticipant | undefined;
  clearError: () => void;
}

/**
 * Custom hook for managing video call state and operations
 */
export function useVideoCall(): UseVideoCallReturn {
  const [callState, setCallState] = useState<CallState>('idle');
  const [participants, setParticipants] = useState<VideoParticipant[]>([]);
  const [localParticipant, setLocalParticipant] = useState<VideoParticipant | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const serviceRef = useRef<VideoCallService | null>(null);

  // Initialize service
  useEffect(() => {
    serviceRef.current = getVideoCallService();
    return () => {
      // Don't dispose here as it's a singleton
    };
  }, []);

  // Update participants state
  const updateParticipantsState = useCallback(() => {
    if (!serviceRef.current) return;
    
    const allParticipants = serviceRef.current.getParticipants();
    const local = serviceRef.current.getLocalParticipant();
    
    setParticipants(allParticipants);
    setLocalParticipant(local);
  }, []);

  // Event handlers
  useEffect(() => {
    const service = serviceRef.current;
    if (!service) return;

    const handleParticipantJoined = (participant: VideoParticipant) => {
      updateParticipantsState();
      console.log(`Participant joined: ${participant.displayName}`);
    };

    const handleParticipantLeft = (participantId: string) => {
      updateParticipantsState();
      console.log(`Participant left: ${participantId}`);
    };

    const handleParticipantUpdated = (participant: VideoParticipant) => {
      updateParticipantsState();
      console.log(`Participant updated: ${participant.displayName}`);
    };

    const handleConnectionStateChanged = (state: RTCPeerConnectionState) => {
      switch (state) {
        case 'connected':
          setCallState('connected');
          setError(null);
          break;
        case 'disconnected':
          setCallState('idle');
          setParticipants([]);
          setLocalParticipant(null);
          break;
        case 'failed':
          setCallState('error');
          setError('Connection failed');
          break;
        default:
          break;
      }
    };

    const handleError = (err: Error) => {
      setCallState('error');
      setError(err.message);
      console.error('Video call error:', err);
    };

    const handleTrackAdded = ({ participantId, track, kind }: {
      participantId: string;
      track: MediaStreamTrack;
      kind: 'audio' | 'video';
    }) => {
      console.log(`Track added for ${participantId}: ${kind}`);
      updateParticipantsState();
    };

    const handleTrackRemoved = ({ participantId, trackId, kind }: {
      participantId: string;
      trackId: string;
      kind: 'audio' | 'video';
    }) => {
      console.log(`Track removed for ${participantId}: ${kind}`);
      updateParticipantsState();
    };

    // Add event listeners
    service.on('participant-joined', handleParticipantJoined);
    service.on('participant-left', handleParticipantLeft);
    service.on('participant-updated', handleParticipantUpdated);
    service.on('connection-state-changed', handleConnectionStateChanged);
    service.on('error', handleError);
    service.on('track-added', handleTrackAdded);
    service.on('track-removed', handleTrackRemoved);

    // Initialize state from service
    updateParticipantsState();
    setCallState(service.isInCall() ? 'connected' : 'idle');

    // Cleanup
    return () => {
      service.off('participant-joined', handleParticipantJoined);
      service.off('participant-left', handleParticipantLeft);
      service.off('participant-updated', handleParticipantUpdated);
      service.off('connection-state-changed', handleConnectionStateChanged);
      service.off('error', handleError);
      service.off('track-added', handleTrackAdded);
      service.off('track-removed', handleTrackRemoved);
    };
  }, [updateParticipantsState]);

  // Join call function
  const joinCall = useCallback(async (roomId: string, userId: string, displayName: string) => {
    if (!serviceRef.current) {
      throw new Error('Video call service not initialized');
    }

    if (callState !== 'idle') {
      throw new Error('Already in a call or joining');
    }

    setCallState('joining');
    setError(null);

    try {
      await serviceRef.current.joinCall(roomId, userId, displayName);
      // State will be updated by event handlers
    } catch (err) {
      setCallState('error');
      setError(err instanceof Error ? err.message : 'Failed to join call');
      throw err;
    }
  }, [callState]);

  // Leave call function
  const leaveCall = useCallback(async () => {
    if (!serviceRef.current) {
      return;
    }

    if (callState === 'idle') {
      return;
    }

    setCallState('leaving');
    setError(null);

    try {
      await serviceRef.current.leaveCall();
      // State will be updated by event handlers
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to leave call');
      // Force state update even if leave fails
      setCallState('idle');
      setParticipants([]);
      setLocalParticipant(null);
    }
  }, [callState]);

  // Toggle audio function
  const toggleAudio = useCallback((): boolean => {
    if (!serviceRef.current) {
      return false;
    }

    const isEnabled = serviceRef.current.toggleAudio();
    // State will be updated by participant-updated event
    return isEnabled;
  }, []);

  // Toggle video function
  const toggleVideo = useCallback((): boolean => {
    if (!serviceRef.current) {
      return false;
    }

    const isEnabled = serviceRef.current.toggleVideo();
    // State will be updated by participant-updated event
    return isEnabled;
  }, []);

  // Get participant function
  const getParticipant = useCallback((participantId: string): VideoParticipant | undefined => {
    if (!serviceRef.current) {
      return undefined;
    }

    return serviceRef.current.getParticipant(participantId);
  }, []);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
    if (callState === 'error') {
      setCallState('idle');
    }
  }, [callState]);

  // Derived state
  const isConnected = callState === 'connected';
  const remoteParticipants = participants.filter(p => !p.isLocal);
  const participantCount = participants.length;
  const isAtMaxCapacity = serviceRef.current?.isAtMaxCapacity() ?? false;

  return {
    // State
    callState,
    participants,
    localParticipant,
    remoteParticipants,
    isConnected,
    error,
    participantCount,
    isAtMaxCapacity,
    
    // Actions
    joinCall,
    leaveCall,
    toggleAudio,
    toggleVideo,
    
    // Utility
    getParticipant,
    clearError
  };
}

/**
 * Hook variant that automatically joins a call on mount
 */
export function useVideoCallAutoJoin(
  roomId: string, 
  userId: string, 
  displayName: string,
  enabled: boolean = true
): UseVideoCallReturn {
  const videoCall = useVideoCall();

  // Auto-join effect
  useEffect(() => {
    if (!enabled || !roomId || !userId || !displayName) {
      return;
    }

    if (videoCall.callState === 'idle') {
      videoCall.joinCall(roomId, userId, displayName).catch(console.error);
    }

    // Auto-leave on unmount
    return () => {
      if (videoCall.isConnected) {
        videoCall.leaveCall().catch(console.error);
      }
    };
  }, [roomId, userId, displayName, enabled, videoCall]);

  return videoCall;
}