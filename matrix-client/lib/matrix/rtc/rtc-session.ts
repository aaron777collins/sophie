/**
 * MatrixRTC Session Management
 * Handles creation, joining, and management of voice/video calls in Matrix rooms
 */

import { MatrixClient, Room, EventType } from 'matrix-js-sdk';
import { MatrixRTCSession, MatrixRTCSessionEvent } from 'matrix-js-sdk/lib/matrixrtc/MatrixRTCSession';
import { Focus } from 'matrix-js-sdk/lib/matrixrtc/focus';
import { RTCEncryptionManager } from './encryption';
import { 
  RTCSessionConfig, 
  RTCSessionState, 
  RTCParticipant, 
  RTCError,
  FocusConfig,
  RTCSessionEvents,
  RTCSessionEventType,
  RTCSessionEventHandler
} from './types';

export class MatrixRTCSessionManager {
  private client: MatrixClient;
  private sessions: Map<string, MatrixRTCSession> = new Map();
  private sessionStates: Map<string, RTCSessionState> = new Map();
  private encryptionManager: RTCEncryptionManager;
  private eventListeners: Map<RTCSessionEventType, Set<RTCSessionEventHandler<any>>> = new Map();

  constructor(client: MatrixClient) {
    this.client = client;
    this.encryptionManager = new RTCEncryptionManager(client);
    this.setupEventListeners();
  }

  /**
   * Create a new RTC session for a room
   */
  async createSession(roomId: string, config?: Partial<RTCSessionConfig>): Promise<MatrixRTCSession> {
    try {
      const room = this.client.getRoom(roomId);
      if (!room) {
        throw new Error(`Room ${roomId} not found`);
      }

      // Check if session already exists
      if (this.sessions.has(roomId)) {
        return this.sessions.get(roomId)!;
      }

      // Get focus configuration from .well-known or use provided config
      const focusConfig = config?.focusConfig || await this.getFocusConfig(room);
      
      // Create MatrixRTC session
      const session = MatrixRTCSession.roomSessionForRoom(this.client, room);
      
      // Initialize session state
      const initialState: RTCSessionState = {
        session,
        isConnected: false,
        isJoined: false,
        focus: null,
        participants: [],
        error: null,
        isLoading: false
      };

      this.sessions.set(roomId, session);
      this.sessionStates.set(roomId, initialState);

      // Set up session event handlers
      this.setupSessionEventHandlers(session, roomId);

      // Set up encryption if room is encrypted
      if (this.client.isRoomEncrypted(roomId)) {
        await this.encryptionManager.setupSessionEncryption(session, roomId);
      }

      this.emitEvent('session.created', { session, roomId });

      return session;
    } catch (error) {
      const rtcError: RTCError = {
        code: 'SESSION_CREATE_ERROR',
        message: error instanceof Error ? error.message : 'Failed to create RTC session',
        timestamp: new Date()
      };
      
      this.updateSessionError(roomId, rtcError);
      throw rtcError;
    }
  }

  /**
   * Join an RTC session (start participating in the call)
   */
  async joinSession(roomId: string): Promise<void> {
    try {
      const session = this.sessions.get(roomId);
      if (!session) {
        throw new Error('Session not found. Create session first.');
      }

      this.updateSessionLoading(roomId, true);

      // Get focus for the session
      const room = this.client.getRoom(roomId);
      if (!room) {
        throw new Error(`Room ${roomId} not found`);
      }

      const focusConfig = await this.getFocusConfig(room);
      const focus: Focus = {
        ...focusConfig
      };

      // Join the session
      session.joinRoomSession([focus]);

      // Update state
      const state = this.sessionStates.get(roomId)!;
      state.isJoined = true;
      state.isConnected = true;
      state.focus = focus;
      state.isLoading = false;
      state.error = null;

      this.sessionStates.set(roomId, state);

      this.emitEvent('session.joined', { session, roomId });
    } catch (error) {
      const rtcError: RTCError = {
        code: 'SESSION_JOIN_ERROR',
        message: error instanceof Error ? error.message : 'Failed to join RTC session',
        timestamp: new Date()
      };

      this.updateSessionError(roomId, rtcError);
      throw rtcError;
    } finally {
      this.updateSessionLoading(roomId, false);
    }
  }

  /**
   * Leave an RTC session
   */
  async leaveSession(roomId: string): Promise<void> {
    try {
      const session = this.sessions.get(roomId);
      if (!session) {
        return; // Already left or never joined
      }

      session.leaveRoomSession();

      // Update state
      const state = this.sessionStates.get(roomId)!;
      state.isJoined = false;
      state.isConnected = false;
      state.focus = null;
      state.participants = [];
      state.error = null;

      this.sessionStates.set(roomId, state);

      this.emitEvent('session.left', { session, roomId });
    } catch (error) {
      const rtcError: RTCError = {
        code: 'SESSION_LEAVE_ERROR',
        message: error instanceof Error ? error.message : 'Failed to leave RTC session',
        timestamp: new Date()
      };

      this.updateSessionError(roomId, rtcError);
      throw rtcError;
    }
  }

  /**
   * Destroy an RTC session completely
   */
  async destroySession(roomId: string): Promise<void> {
    try {
      const session = this.sessions.get(roomId);
      if (session) {
        // Leave first if joined
        if (this.sessionStates.get(roomId)?.isJoined) {
          await this.leaveSession(roomId);
        }

        // Clean up encryption
        await this.encryptionManager.cleanupSessionEncryption(roomId);

        // Remove event handlers
        this.removeSessionEventHandlers(session);

        // Clean up session
        session.stop();

        this.emitEvent('session.destroyed', { session, roomId });
      }

      // Remove from maps
      this.sessions.delete(roomId);
      this.sessionStates.delete(roomId);
    } catch (error) {
      const rtcError: RTCError = {
        code: 'SESSION_DESTROY_ERROR',
        message: error instanceof Error ? error.message : 'Failed to destroy RTC session',
        timestamp: new Date()
      };

      this.updateSessionError(roomId, rtcError);
      throw rtcError;
    }
  }

  /**
   * Get current session state
   */
  getSessionState(roomId: string): RTCSessionState | null {
    return this.sessionStates.get(roomId) || null;
  }

  /**
   * Check if session is active (exists and connected)
   */
  isSessionActive(roomId: string): boolean {
    const state = this.sessionStates.get(roomId);
    return state?.isConnected === true;
  }

  /**
   * Get all active sessions
   */
  getActiveSessions(): Map<string, RTCSessionState> {
    const activeSessions = new Map<string, RTCSessionState>();
    for (const [roomId, state] of Array.from(this.sessionStates.entries())) {
      if (state.isConnected) {
        activeSessions.set(roomId, state);
      }
    }
    return activeSessions;
  }

  /**
   * Add event listener
   */
  addEventListener<T extends RTCSessionEventType>(
    eventType: T,
    handler: RTCSessionEventHandler<T>
  ): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(handler);
  }

  /**
   * Remove event listener
   */
  removeEventListener<T extends RTCSessionEventType>(
    eventType: T,
    handler: RTCSessionEventHandler<T>
  ): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.delete(handler);
    }
  }

  // Private helper methods

  private async getFocusConfig(room: Room): Promise<FocusConfig> {
    try {
      // Get the focus configuration from client's .well-known
      const clientConfig = await this.client.getClientWellKnown();
      const rtcFoci = clientConfig?.['org.matrix.msc4143.rtc_foci'];
      
      if (rtcFoci && Array.isArray(rtcFoci) && rtcFoci.length > 0) {
        const livekitFocus = rtcFoci.find(focus => focus.type === 'livekit');
        if (livekitFocus) {
          return {
            type: 'livekit',
            livekit_service_url: livekitFocus.livekit_service_url,
            livekit_alias: room.roomId
          };
        }
      }

      throw new Error('No LiveKit focus configuration found in .well-known');
    } catch (error) {
      throw new Error(`Failed to get focus configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private setupEventListeners(): void {
    // Listen for call membership events
    // @ts-ignore - Event type may not be in current definitions
    this.client.on('RoomState.events', this.handleRoomStateEvent.bind(this));
  }

  private handleRoomStateEvent(event: any): void {
    // Handle m.call.member events for participant tracking
    if (event.getType() === 'm.call.member') {
      const roomId = event.getRoomId();
      if (this.sessions.has(roomId)) {
        this.updateParticipants(roomId);
      }
    }
  }

  private setupSessionEventHandlers(session: MatrixRTCSession, roomId: string): void {
    // Listen for membership changes
    session.on(MatrixRTCSessionEvent.MembershipsChanged, (oldMemberships, newMemberships) => {
      this.updateParticipants(roomId);
    });

    // Listen for join state changes  
    session.on(MatrixRTCSessionEvent.JoinStateChanged, (isJoined) => {
      const state = this.sessionStates.get(roomId);
      if (state) {
        state.isJoined = isJoined;
        state.isConnected = isJoined;
        this.sessionStates.set(roomId, state);
      }
    });
  }

  private removeSessionEventHandlers(session: MatrixRTCSession): void {
    session.removeAllListeners();
  }

  private updateParticipants(roomId: string): void {
    const session = this.sessions.get(roomId);
    const state = this.sessionStates.get(roomId);
    
    if (!session || !state) return;

    // Get current participants from the session
    // This is a simplified implementation - actual participant tracking
    // would involve parsing m.call.member events
    const participants: RTCParticipant[] = [];
    
    // Add local participant
    const localUserId = this.client.getUserId()!;
    const localDeviceId = this.client.getDeviceId()!;
    
    if (state.isJoined) {
      participants.push({
        userId: localUserId,
        deviceId: localDeviceId,
        isLocal: true,
        displayName: this.client.getUser(localUserId)?.displayName,
        avatarUrl: this.client.getUser(localUserId)?.avatarUrl
      });
    }

    // Update state
    state.participants = participants;
    this.sessionStates.set(roomId, state);
  }

  private updateSessionError(roomId: string, error: RTCError): void {
    const state = this.sessionStates.get(roomId);
    if (state) {
      state.error = error;
      state.isLoading = false;
      this.sessionStates.set(roomId, state);
      this.emitEvent('error', { error, roomId });
    }
  }

  private updateSessionLoading(roomId: string, isLoading: boolean): void {
    const state = this.sessionStates.get(roomId);
    if (state) {
      state.isLoading = isLoading;
      this.sessionStates.set(roomId, state);
    }
  }

  private emitEvent<T extends RTCSessionEventType>(
    eventType: T,
    eventData: RTCSessionEvents[T]
  ): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach(handler => handler(eventData));
    }
  }
}