/**
 * useMatrixRTC Hook
 * React hook for integrating MatrixRTC functionality into components
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { MatrixRTCSession } from 'matrix-js-sdk/lib/matrixrtc/MatrixRTCSession';
import { useMatrixClient } from '../../lib/matrix/matrix-context';
import { MatrixRTCSessionManager } from '../../lib/matrix/rtc/rtc-session';
import { 
  RTCSessionState, 
  RTCError, 
  RTCParticipant,
  UseMatrixRTCOptions,
  RTCSessionEventType,
  RTCSessionEventHandler
} from '../../lib/matrix/rtc/types';

interface UseMatrixRTCResult {
  // Session state
  session: MatrixRTCSession | null;
  isConnected: boolean;
  isJoined: boolean;
  isLoading: boolean;
  participants: RTCParticipant[];
  error: RTCError | null;

  // Session actions
  createSession: () => Promise<MatrixRTCSession | null>;
  joinSession: () => Promise<void>;
  leaveSession: () => Promise<void>;
  destroySession: () => Promise<void>;

  // Utility methods
  clearError: () => void;
  isSessionActive: boolean;
}

/**
 * Hook for managing MatrixRTC sessions in a specific room
 */
export function useMatrixRTC(
  roomId: string | null,
  options: UseMatrixRTCOptions = {}
): UseMatrixRTCResult {
  const client = useMatrixClient();
  const sessionManagerRef = useRef<MatrixRTCSessionManager | null>(null);
  
  // Initialize session manager
  useEffect(() => {
    if (client && !sessionManagerRef.current) {
      sessionManagerRef.current = new MatrixRTCSessionManager(client);
    }
  }, [client]);

  // Session state
  const [sessionState, setSessionState] = useState<RTCSessionState>({
    session: null,
    isConnected: false,
    isJoined: false,
    focus: null,
    participants: [],
    error: null,
    isLoading: false
  });

  // Update state from session manager
  const updateSessionState = useCallback(() => {
    if (!roomId || !sessionManagerRef.current) {
      setSessionState(prev => ({
        ...prev,
        session: null,
        isConnected: false,
        isJoined: false,
        participants: [],
        error: null
      }));
      return;
    }

    const currentState = sessionManagerRef.current.getSessionState(roomId);
    if (currentState) {
      setSessionState(currentState);
    }
  }, [roomId]);

  // Set up event listeners
  useEffect(() => {
    if (!sessionManagerRef.current || !roomId) return;

    const manager = sessionManagerRef.current;

    // Event handlers
    const handleSessionCreated: RTCSessionEventHandler<'session.created'> = ({ roomId: eventRoomId }) => {
      if (eventRoomId === roomId) {
        updateSessionState();
      }
    };

    const handleSessionJoined: RTCSessionEventHandler<'session.joined'> = ({ roomId: eventRoomId }) => {
      if (eventRoomId === roomId) {
        updateSessionState();
      }
    };

    const handleSessionLeft: RTCSessionEventHandler<'session.left'> = ({ roomId: eventRoomId }) => {
      if (eventRoomId === roomId) {
        updateSessionState();
      }
    };

    const handleSessionDestroyed: RTCSessionEventHandler<'session.destroyed'> = ({ roomId: eventRoomId }) => {
      if (eventRoomId === roomId) {
        updateSessionState();
      }
    };

    const handleParticipantJoined: RTCSessionEventHandler<'participant.joined'> = ({ roomId: eventRoomId }) => {
      if (eventRoomId === roomId) {
        updateSessionState();
      }
    };

    const handleParticipantLeft: RTCSessionEventHandler<'participant.left'> = ({ roomId: eventRoomId }) => {
      if (eventRoomId === roomId) {
        updateSessionState();
      }
    };

    const handleError: RTCSessionEventHandler<'error'> = ({ roomId: eventRoomId, error }) => {
      if (eventRoomId === roomId) {
        setSessionState(prev => ({ ...prev, error, isLoading: false }));
      }
    };

    // Add event listeners
    manager.addEventListener('session.created', handleSessionCreated);
    manager.addEventListener('session.joined', handleSessionJoined);
    manager.addEventListener('session.left', handleSessionLeft);
    manager.addEventListener('session.destroyed', handleSessionDestroyed);
    manager.addEventListener('participant.joined', handleParticipantJoined);
    manager.addEventListener('participant.left', handleParticipantLeft);
    manager.addEventListener('error', handleError);

    // Initial state update
    updateSessionState();

    // Cleanup
    return () => {
      manager.removeEventListener('session.created', handleSessionCreated);
      manager.removeEventListener('session.joined', handleSessionJoined);
      manager.removeEventListener('session.left', handleSessionLeft);
      manager.removeEventListener('session.destroyed', handleSessionDestroyed);
      manager.removeEventListener('participant.joined', handleParticipantJoined);
      manager.removeEventListener('participant.left', handleParticipantLeft);
      manager.removeEventListener('error', handleError);
    };
  }, [roomId, updateSessionState]);

  // Auto-join if enabled
  useEffect(() => {
    if (options.autoJoin && roomId && sessionState.session && !sessionState.isJoined && !sessionState.isLoading) {
      joinSession();
    }
  }, [options.autoJoin, roomId, sessionState.session, sessionState.isJoined, sessionState.isLoading]);

  // Session actions
  const createSession = useCallback(async (): Promise<MatrixRTCSession | null> => {
    if (!roomId || !sessionManagerRef.current) {
      console.error('Cannot create session: roomId or sessionManager not available');
      return null;
    }

    try {
      setSessionState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const session = await sessionManagerRef.current.createSession(roomId, {
        focusConfig: undefined // Will use .well-known configuration
      });

      return session;
    } catch (error) {
      const rtcError: RTCError = {
        code: 'CREATE_SESSION_ERROR',
        message: error instanceof Error ? error.message : 'Failed to create session',
        timestamp: new Date()
      };
      setSessionState(prev => ({ ...prev, error: rtcError, isLoading: false }));
      return null;
    }
  }, [roomId]);

  const joinSession = useCallback(async (): Promise<void> => {
    if (!roomId || !sessionManagerRef.current) {
      console.error('Cannot join session: roomId or sessionManager not available');
      return;
    }

    try {
      setSessionState(prev => ({ ...prev, isLoading: true, error: null }));
      await sessionManagerRef.current.joinSession(roomId);
    } catch (error) {
      const rtcError: RTCError = {
        code: 'JOIN_SESSION_ERROR',
        message: error instanceof Error ? error.message : 'Failed to join session',
        timestamp: new Date()
      };
      setSessionState(prev => ({ ...prev, error: rtcError, isLoading: false }));
    }
  }, [roomId]);

  const leaveSession = useCallback(async (): Promise<void> => {
    if (!roomId || !sessionManagerRef.current) {
      return;
    }

    try {
      setSessionState(prev => ({ ...prev, isLoading: true, error: null }));
      await sessionManagerRef.current.leaveSession(roomId);
    } catch (error) {
      const rtcError: RTCError = {
        code: 'LEAVE_SESSION_ERROR',
        message: error instanceof Error ? error.message : 'Failed to leave session',
        timestamp: new Date()
      };
      setSessionState(prev => ({ ...prev, error: rtcError, isLoading: false }));
    }
  }, [roomId]);

  const destroySession = useCallback(async (): Promise<void> => {
    if (!roomId || !sessionManagerRef.current) {
      return;
    }

    try {
      setSessionState(prev => ({ ...prev, isLoading: true, error: null }));
      await sessionManagerRef.current.destroySession(roomId);
    } catch (error) {
      const rtcError: RTCError = {
        code: 'DESTROY_SESSION_ERROR',
        message: error instanceof Error ? error.message : 'Failed to destroy session',
        timestamp: new Date()
      };
      setSessionState(prev => ({ ...prev, error: rtcError, isLoading: false }));
    }
  }, [roomId]);

  const clearError = useCallback(() => {
    setSessionState(prev => ({ ...prev, error: null }));
  }, []);

  // Computed values
  const isSessionActive = sessionManagerRef.current?.isSessionActive(roomId || '') || false;

  return {
    // Session state
    session: sessionState.session,
    isConnected: sessionState.isConnected,
    isJoined: sessionState.isJoined,
    isLoading: sessionState.isLoading,
    participants: sessionState.participants,
    error: sessionState.error,

    // Session actions
    createSession,
    joinSession,
    leaveSession,
    destroySession,

    // Utility methods
    clearError,
    isSessionActive
  };
}

/**
 * Hook for getting all active RTC sessions across all rooms
 */
export function useMatrixRTCSessions() {
  const client = useMatrixClient();
  const sessionManagerRef = useRef<MatrixRTCSessionManager | null>(null);
  const [sessions, setSessions] = useState<Map<string, RTCSessionState>>(new Map());

  // Initialize session manager
  useEffect(() => {
    if (client && !sessionManagerRef.current) {
      sessionManagerRef.current = new MatrixRTCSessionManager(client);
    }
  }, [client]);

  // Update all sessions
  const updateSessions = useCallback(() => {
    if (!sessionManagerRef.current) {
      setSessions(new Map());
      return;
    }

    const activeSessions = sessionManagerRef.current.getActiveSessions();
    setSessions(new Map(activeSessions));
  }, []);

  // Set up event listeners for all session changes
  useEffect(() => {
    if (!sessionManagerRef.current) return;

    const manager = sessionManagerRef.current;

    const handleAnySessionEvent = () => {
      updateSessions();
    };

    // Listen to all session events
    manager.addEventListener('session.created', handleAnySessionEvent);
    manager.addEventListener('session.joined', handleAnySessionEvent);
    manager.addEventListener('session.left', handleAnySessionEvent);
    manager.addEventListener('session.destroyed', handleAnySessionEvent);
    manager.addEventListener('participant.joined', handleAnySessionEvent);
    manager.addEventListener('participant.left', handleAnySessionEvent);

    // Initial update
    updateSessions();

    return () => {
      manager.removeEventListener('session.created', handleAnySessionEvent);
      manager.removeEventListener('session.joined', handleAnySessionEvent);
      manager.removeEventListener('session.left', handleAnySessionEvent);
      manager.removeEventListener('session.destroyed', handleAnySessionEvent);
      manager.removeEventListener('participant.joined', handleAnySessionEvent);
      manager.removeEventListener('participant.left', handleAnySessionEvent);
    };
  }, [updateSessions]);

  return {
    sessions,
    activeSessions: Array.from(sessions.entries()),
    totalActiveSessions: sessions.size
  };
}