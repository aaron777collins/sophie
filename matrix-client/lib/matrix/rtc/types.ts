/**
 * TypeScript definitions for MatrixRTC integration
 */

import { MatrixClient, Room } from 'matrix-js-sdk';
import { MatrixRTCSession } from 'matrix-js-sdk/lib/matrixrtc/MatrixRTCSession';
import { Focus } from 'matrix-js-sdk/lib/matrixrtc/focus';

export interface RTCSessionConfig {
  client: MatrixClient;
  room: Room;
  focusConfig?: FocusConfig;
}

export interface FocusConfig {
  type: 'livekit';
  livekit_service_url: string;
  livekit_alias?: string;
}

export interface RTCSessionState {
  session: MatrixRTCSession | null;
  isConnected: boolean;
  isJoined: boolean;
  focus: Focus | null;
  participants: RTCParticipant[];
  error: RTCError | null;
  isLoading: boolean;
}

export interface RTCParticipant {
  userId: string;
  deviceId: string;
  isLocal: boolean;
  displayName?: string;
  avatarUrl?: string;
}

export interface RTCError {
  code: string;
  message: string;
  timestamp: Date;
}

export interface RTCEncryptionState {
  isEnabled: boolean;
  keyRotationActive: boolean;
  participantKeys: Map<string, Uint8Array>;
  lastKeyRotation?: Date;
}

export interface UseMatrixRTCOptions {
  autoJoin?: boolean;
  enableEncryption?: boolean;
}

export interface MatrixRTCContextValue {
  sessions: Map<string, RTCSessionState>;
  createSession: (roomId: string, options?: UseMatrixRTCOptions) => Promise<MatrixRTCSession>;
  joinSession: (roomId: string) => Promise<void>;
  leaveSession: (roomId: string) => Promise<void>;
  destroySession: (roomId: string) => Promise<void>;
  isSessionActive: (roomId: string) => boolean;
  getSessionState: (roomId: string) => RTCSessionState | null;
}

// Event types for MatrixRTC
export interface RTCSessionEvents {
  'session.created': { session: MatrixRTCSession; roomId: string };
  'session.joined': { session: MatrixRTCSession; roomId: string };
  'session.left': { session: MatrixRTCSession; roomId: string };
  'session.destroyed': { session: MatrixRTCSession; roomId: string };
  'participant.joined': { participant: RTCParticipant; roomId: string };
  'participant.left': { participant: RTCParticipant; roomId: string };
  'encryption.keyRotated': { roomId: string; keyId: string };
  'error': { error: RTCError; roomId: string };
}

export type RTCSessionEventType = keyof RTCSessionEvents;
export type RTCSessionEventHandler<T extends RTCSessionEventType> = (
  event: RTCSessionEvents[T]
) => void;