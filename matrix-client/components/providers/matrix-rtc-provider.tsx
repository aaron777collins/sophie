/**
 * MatrixRTC Context Provider
 * Provides global MatrixRTC session management across the application
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { MatrixRTCSession } from 'matrix-js-sdk/lib/matrixrtc/MatrixRTCSession';
import { useMatrixClient } from '../../lib/matrix/matrix-context';
import { MatrixRTCSessionManager } from '../../lib/matrix/rtc/rtc-session';
import { 
  RTCSessionState, 
  RTCError,
  MatrixRTCContextValue,
  UseMatrixRTCOptions,
  RTCSessionEventHandler
} from '../../lib/matrix/rtc/types';

const MatrixRTCContext = createContext<MatrixRTCContextValue | null>(null);

interface MatrixRTCProviderProps {
  children: React.ReactNode;
}

export function MatrixRTCProvider({ children }: MatrixRTCProviderProps) {
  const client = useMatrixClient();
  const sessionManagerRef = useRef<MatrixRTCSessionManager | null>(null);
  const [sessions, setSessions] = useState<Map<string, RTCSessionState>>(new Map());

  // Initialize session manager when client is available
  useEffect(() => {
    if (client && !sessionManagerRef.current) {
      sessionManagerRef.current = new MatrixRTCSessionManager(client);
      console.log('MatrixRTC session manager initialized');
    }
  }, [client]);

  // Update sessions state
  const updateSessions = useCallback(() => {
    if (!sessionManagerRef.current) {
      setSessions(new Map());
      return;
    }

    // Get all sessions (active and inactive)
    const allSessions = new Map<string, RTCSessionState>();
    
    // This would be implemented in the session manager to return all sessions
    // For now, we'll get active sessions
    const activeSessions = sessionManagerRef.current.getActiveSessions();
    
    setSessions(new Map(activeSessions));
  }, []);

  // Set up global event listeners
  useEffect(() => {
    if (!sessionManagerRef.current) return;

    const manager = sessionManagerRef.current;

    // Event handlers
    const handleSessionCreated: RTCSessionEventHandler<'session.created'> = () => {
      updateSessions();
    };

    const handleSessionJoined: RTCSessionEventHandler<'session.joined'> = () => {
      updateSessions();
    };

    const handleSessionLeft: RTCSessionEventHandler<'session.left'> = () => {
      updateSessions();
    };

    const handleSessionDestroyed: RTCSessionEventHandler<'session.destroyed'> = () => {
      updateSessions();
    };

    const handleParticipantJoined: RTCSessionEventHandler<'participant.joined'> = (event) => {
      updateSessions();
      console.log(`Participant joined: ${event.participant.userId} in ${event.roomId}`);
    };

    const handleParticipantLeft: RTCSessionEventHandler<'participant.left'> = (event) => {
      updateSessions();
      console.log(`Participant left: ${event.participant.userId} in ${event.roomId}`);
    };

    const handleEncryptionKeyRotated: RTCSessionEventHandler<'encryption.keyRotated'> = (event) => {
      console.log(`Encryption key rotated in ${event.roomId}: ${event.keyId}`);
    };

    const handleError: RTCSessionEventHandler<'error'> = (event) => {
      console.error(`RTC error in ${event.roomId}:`, event.error);
      updateSessions();
    };

    // Add event listeners
    manager.addEventListener('session.created', handleSessionCreated);
    manager.addEventListener('session.joined', handleSessionJoined);
    manager.addEventListener('session.left', handleSessionLeft);
    manager.addEventListener('session.destroyed', handleSessionDestroyed);
    manager.addEventListener('participant.joined', handleParticipantJoined);
    manager.addEventListener('participant.left', handleParticipantLeft);
    manager.addEventListener('encryption.keyRotated', handleEncryptionKeyRotated);
    manager.addEventListener('error', handleError);

    // Initial update
    updateSessions();

    // Cleanup
    return () => {
      manager.removeEventListener('session.created', handleSessionCreated);
      manager.removeEventListener('session.joined', handleSessionJoined);
      manager.removeEventListener('session.left', handleSessionLeft);
      manager.removeEventListener('session.destroyed', handleSessionDestroyed);
      manager.removeEventListener('participant.joined', handleParticipantJoined);
      manager.removeEventListener('participant.left', handleParticipantLeft);
      manager.removeEventListener('encryption.keyRotated', handleEncryptionKeyRotated);
      manager.removeEventListener('error', handleError);
    };
  }, [updateSessions]);

  // Context methods
  const createSession = useCallback(async (
    roomId: string, 
    options?: UseMatrixRTCOptions
  ): Promise<MatrixRTCSession> => {
    if (!sessionManagerRef.current) {
      throw new Error('MatrixRTC session manager not initialized');
    }

    try {
      const session = await sessionManagerRef.current.createSession(roomId, {
        focusConfig: undefined // Use .well-known configuration
      });

      updateSessions();
      return session;
    } catch (error) {
      console.error(`Failed to create session for room ${roomId}:`, error);
      throw error;
    }
  }, [updateSessions]);

  const joinSession = useCallback(async (roomId: string): Promise<void> => {
    if (!sessionManagerRef.current) {
      throw new Error('MatrixRTC session manager not initialized');
    }

    try {
      await sessionManagerRef.current.joinSession(roomId);
      updateSessions();
    } catch (error) {
      console.error(`Failed to join session for room ${roomId}:`, error);
      throw error;
    }
  }, [updateSessions]);

  const leaveSession = useCallback(async (roomId: string): Promise<void> => {
    if (!sessionManagerRef.current) {
      throw new Error('MatrixRTC session manager not initialized');
    }

    try {
      await sessionManagerRef.current.leaveSession(roomId);
      updateSessions();
    } catch (error) {
      console.error(`Failed to leave session for room ${roomId}:`, error);
      throw error;
    }
  }, [updateSessions]);

  const destroySession = useCallback(async (roomId: string): Promise<void> => {
    if (!sessionManagerRef.current) {
      throw new Error('MatrixRTC session manager not initialized');
    }

    try {
      await sessionManagerRef.current.destroySession(roomId);
      updateSessions();
    } catch (error) {
      console.error(`Failed to destroy session for room ${roomId}:`, error);
      throw error;
    }
  }, [updateSessions]);

  const isSessionActive = useCallback((roomId: string): boolean => {
    if (!sessionManagerRef.current) {
      return false;
    }

    return sessionManagerRef.current.isSessionActive(roomId);
  }, []);

  const getSessionState = useCallback((roomId: string): RTCSessionState | null => {
    if (!sessionManagerRef.current) {
      return null;
    }

    return sessionManagerRef.current.getSessionState(roomId);
  }, []);

  // Context value
  const contextValue: MatrixRTCContextValue = {
    sessions,
    createSession,
    joinSession,
    leaveSession,
    destroySession,
    isSessionActive,
    getSessionState
  };

  return (
    <MatrixRTCContext.Provider value={contextValue}>
      {children}
    </MatrixRTCContext.Provider>
  );
}

/**
 * Hook to access the MatrixRTC context
 */
export function useMatrixRTCContext(): MatrixRTCContextValue {
  const context = useContext(MatrixRTCContext);
  if (!context) {
    throw new Error('useMatrixRTCContext must be used within a MatrixRTCProvider');
  }
  return context;
}

/**
 * Hook to get RTC session for a specific room
 */
export function useRoomRTCSession(roomId: string | null): {
  sessionState: RTCSessionState | null;
  isActive: boolean;
  createAndJoinSession: () => Promise<void>;
  leaveAndDestroySession: () => Promise<void>;
} {
  const { 
    sessions, 
    createSession, 
    joinSession, 
    leaveSession, 
    destroySession,
    isSessionActive,
    getSessionState 
  } = useMatrixRTCContext();

  const sessionState = roomId ? getSessionState(roomId) : null;
  const isActive = roomId ? isSessionActive(roomId) : false;

  const createAndJoinSession = useCallback(async () => {
    if (!roomId) {
      throw new Error('Room ID is required');
    }

    try {
      // Create session if it doesn't exist
      if (!sessionState?.session) {
        await createSession(roomId);
      }

      // Join the session
      await joinSession(roomId);
    } catch (error) {
      console.error(`Failed to create and join session for room ${roomId}:`, error);
      throw error;
    }
  }, [roomId, sessionState, createSession, joinSession]);

  const leaveAndDestroySession = useCallback(async () => {
    if (!roomId) {
      return;
    }

    try {
      // Leave session if joined
      if (sessionState?.isJoined) {
        await leaveSession(roomId);
      }

      // Destroy session
      await destroySession(roomId);
    } catch (error) {
      console.error(`Failed to leave and destroy session for room ${roomId}:`, error);
      throw error;
    }
  }, [roomId, sessionState, leaveSession, destroySession]);

  return {
    sessionState,
    isActive,
    createAndJoinSession,
    leaveAndDestroySession
  };
}

/**
 * Hook to get summary of all active RTC sessions
 */
export function useRTCSessionsSummary(): {
  totalActiveSessions: number;
  activeRoomIds: string[];
  totalParticipants: number;
  hasAnyActiveCall: boolean;
} {
  const { sessions } = useMatrixRTCContext();

  const totalActiveSessions = sessions.size;
  const activeRoomIds = Array.from(sessions.keys());
  const totalParticipants = Array.from(sessions.values())
    .reduce((total, session) => total + session.participants.length, 0);
  const hasAnyActiveCall = totalActiveSessions > 0;

  return {
    totalActiveSessions,
    activeRoomIds,
    totalParticipants,
    hasAnyActiveCall
  };
}