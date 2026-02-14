import { Room, RoomOptions, DataPacket_Kind, RemoteTrack, RemoteParticipant, LocalParticipant } from 'livekit-client';

// Environment configuration
const LIVEKIT_URL = process.env['NEXT_PUBLIC_LIVEKIT_URL'] || 'wss://livekit.dev2.aaroncollins.info';
const LIVEKIT_API_KEY = process.env['LIVEKIT_API_KEY'] || 'devkey';
const LIVEKIT_API_SECRET = process.env['LIVEKIT_API_SECRET'] || 'LiveKit2026SecretKeyForMatrix';
const LIVEKIT_JWT_SERVICE_URL = process.env['LIVEKIT_JWT_SERVICE_URL'] || 'https://dev2.aaroncollins.info/_livekit';

export interface LiveKitConfig {
  url: string;
  jwtServiceUrl: string;
}

export interface ParticipantInfo {
  identity: string;
  name?: string;
  metadata?: string;
  avatar?: string;
  isLocal: boolean;
  audioEnabled: boolean;
  videoEnabled: boolean;
  screenShareEnabled: boolean;
  isSpeaking: boolean;
}

export interface RoomInfo {
  name: string;
  sid?: string;
  metadata?: string;
  participantCount: number;
  maxParticipants?: number;
  createdAt?: Date;
}

/**
 * LiveKit service for managing WebRTC connections and rooms
 * Token generation is handled by the server-side JWT service
 */
export class LiveKitService {
  private config: LiveKitConfig;
  private room: Room | null = null;
  private isConnecting = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  
  // Event handlers
  private onParticipantConnected?: (participant: RemoteParticipant) => void;
  private onParticipantDisconnected?: (participant: RemoteParticipant) => void;
  private onTrackSubscribed?: (track: RemoteTrack, participant: RemoteParticipant) => void;
  private onTrackUnsubscribed?: (track: RemoteTrack, participant: RemoteParticipant) => void;
  private onConnectionStateChanged?: (state: string) => void;
  private onError?: (error: Error) => void;
  private onSpeakingChanged?: (participant: string, speaking: boolean) => void;

  constructor(config?: Partial<LiveKitConfig>) {
    this.config = {
      url: config?.url || LIVEKIT_URL,
      jwtServiceUrl: config?.jwtServiceUrl || LIVEKIT_JWT_SERVICE_URL,
    };
  }

  /**
   * Request an access token from the JWT service
   * This calls the server-side JWT service to generate tokens securely
   */
  async requestToken(roomName: string, identity: string, options?: {
    name?: string;
    matrixAccessToken?: string;
  }): Promise<string> {
    try {
      // Call the LiveKit JWT service to get a token
      // The JWT service validates the Matrix access token and returns a LiveKit token
      const response = await fetch(`${this.config.jwtServiceUrl}/sfu/get`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(options?.matrixAccessToken && {
            'Authorization': `Bearer ${options.matrixAccessToken}`,
          }),
        },
        body: JSON.stringify({
          room: roomName,
          identity: identity,
          name: options?.name || identity,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get LiveKit token: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.jwt) {
        throw new Error('No JWT token in response');
      }

      return data.jwt;
    } catch (error) {
      const err = new Error(`Failed to request LiveKit token: ${error instanceof Error ? error.message : 'Unknown error'}`);
      this.handleError(err);
      throw err;
    }
  }

  /**
   * Connect to a LiveKit room
   */
  async connectToRoom(roomName: string, token: string, options?: Partial<RoomOptions>): Promise<Room> {
    if (this.isConnecting) {
      throw new Error('Connection already in progress');
    }

    if (this.room?.state === 'connected') {
      throw new Error('Already connected to a room. Disconnect first.');
    }

    this.isConnecting = true;
    this.reconnectAttempts = 0;

    try {
      // Create new room instance
      this.room = new Room({
        ...options,
      });

      // Set up event listeners
      this.setupRoomEventListeners();

      // Connect to the room
      await this.room.connect(this.config.url, token, {
        autoSubscribe: true,
      });

      this.isConnecting = false;
      return this.room;
    } catch (error) {
      this.isConnecting = false;
      const err = new Error(`Failed to connect to room ${roomName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      this.handleError(err);
      throw err;
    }
  }

  /**
   * Disconnect from the current room
   */
  async disconnect(): Promise<void> {
    if (this.room) {
      try {
        await this.room.disconnect();
        this.room = null;
        this.reconnectAttempts = 0;
      } catch (error) {
        const err = new Error(`Failed to disconnect: ${error instanceof Error ? error.message : 'Unknown error'}`);
        this.handleError(err);
        throw err;
      }
    }
  }

  /**
   * Get current room instance
   */
  getRoom(): Room | null {
    return this.room;
  }

  /**
   * Check if connected to a room
   */
  isConnected(): boolean {
    return this.room?.state === 'connected';
  }

  /**
   * Get current participants
   */
  getParticipants(): ParticipantInfo[] {
    if (!this.room) return [];

    const participants: ParticipantInfo[] = [];

    // Add local participant
    if (this.room.localParticipant) {
      participants.push(this.mapParticipant(this.room.localParticipant, true));
    }

    // Add remote participants
    this.room.remoteParticipants.forEach((participant) => {
      participants.push(this.mapParticipant(participant, false));
    });

    return participants;
  }

  /**
   * Enable/disable local audio
   */
  async setAudioEnabled(enabled: boolean): Promise<void> {
    if (!this.room?.localParticipant) {
      throw new Error('Not connected to a room');
    }

    try {
      await this.room.localParticipant.setMicrophoneEnabled(enabled);
    } catch (error) {
      const err = new Error(`Failed to ${enabled ? 'enable' : 'disable'} audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
      this.handleError(err);
      throw err;
    }
  }

  /**
   * Enable/disable local video
   */
  async setVideoEnabled(enabled: boolean): Promise<void> {
    if (!this.room?.localParticipant) {
      throw new Error('Not connected to a room');
    }

    try {
      await this.room.localParticipant.setCameraEnabled(enabled);
    } catch (error) {
      const err = new Error(`Failed to ${enabled ? 'enable' : 'disable'} video: ${error instanceof Error ? error.message : 'Unknown error'}`);
      this.handleError(err);
      throw err;
    }
  }

  /**
   * Start screen sharing
   */
  async startScreenShare(): Promise<void> {
    if (!this.room?.localParticipant) {
      throw new Error('Not connected to a room');
    }

    try {
      await this.room.localParticipant.setScreenShareEnabled(true, {
        audio: true, // Include system audio
      });
    } catch (error) {
      const err = new Error(`Failed to start screen share: ${error instanceof Error ? error.message : 'Unknown error'}`);
      this.handleError(err);
      throw err;
    }
  }

  /**
   * Stop screen sharing
   */
  async stopScreenShare(): Promise<void> {
    if (!this.room?.localParticipant) {
      throw new Error('Not connected to a room');
    }

    try {
      await this.room.localParticipant.setScreenShareEnabled(false);
    } catch (error) {
      const err = new Error(`Failed to stop screen share: ${error instanceof Error ? error.message : 'Unknown error'}`);
      this.handleError(err);
      throw err;
    }
  }

  /**
   * Send data to all participants
   */
  async sendData(data: string | Uint8Array, kind: 'reliable' | 'lossy' = 'reliable'): Promise<void> {
    if (!this.room?.localParticipant) {
      throw new Error('Not connected to a room');
    }

    try {
      const encoder = new TextEncoder();
      const payload = typeof data === 'string' ? encoder.encode(data) : data;
      
      await this.room.localParticipant.publishData(payload, {
        reliable: kind === 'reliable',
      });
    } catch (error) {
      const err = new Error(`Failed to send data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      this.handleError(err);
      throw err;
    }
  }

  /**
   * Set event handlers
   */
  setEventHandlers(handlers: {
    onParticipantConnected?: (participant: RemoteParticipant) => void;
    onParticipantDisconnected?: (participant: RemoteParticipant) => void;
    onTrackSubscribed?: (track: RemoteTrack, participant: RemoteParticipant) => void;
    onTrackUnsubscribed?: (track: RemoteTrack, participant: RemoteParticipant) => void;
    onConnectionStateChanged?: (state: string) => void;
    onError?: (error: Error) => void;
    onSpeakingChanged?: (participant: string, speaking: boolean) => void;
  }): void {
    this.onParticipantConnected = handlers.onParticipantConnected;
    this.onParticipantDisconnected = handlers.onParticipantDisconnected;
    this.onTrackSubscribed = handlers.onTrackSubscribed;
    this.onTrackUnsubscribed = handlers.onTrackUnsubscribed;
    this.onConnectionStateChanged = handlers.onConnectionStateChanged;
    this.onError = handlers.onError;
    this.onSpeakingChanged = handlers.onSpeakingChanged;
  }

  /**
   * Setup room event listeners
   */
  private setupRoomEventListeners(): void {
    if (!this.room) return;

    // Participant events
    this.room.on('participantConnected', (participant) => {
      // TODO: Replace with proper logging service
      // console.log('Participant connected:', participant.identity);
      this.onParticipantConnected?.(participant);
    });

    this.room.on('participantDisconnected', (participant) => {
      // TODO: Replace with proper logging service
      // console.log('Participant disconnected:', participant.identity);
      this.onParticipantDisconnected?.(participant);
    });

    // Track events
    this.room.on('trackSubscribed', (track, publication, participant) => {
      // TODO: Replace with proper logging service
      // console.log('Track subscribed:', track.kind, 'from', participant.identity);
      this.onTrackSubscribed?.(track, participant);
    });

    this.room.on('trackUnsubscribed', (track, publication, participant) => {
      // TODO: Replace with proper logging service
      // console.log('Track unsubscribed:', track.kind, 'from', participant.identity);
      this.onTrackUnsubscribed?.(track, participant);
    });

    // Audio level events for speaking indicators
    this.room.on('activeSpeakersChanged', (speakers) => {
      // Update speaking state for all participants
      const speakerIds = new Set(speakers.map(s => s.identity));
      this.getParticipants().forEach(p => {
        this.onSpeakingChanged?.(p.identity, speakerIds.has(p.identity));
      });
    });

    // Connection events
    this.room.on('reconnecting', () => {
      // TODO: Replace with proper logging service
      // console.log('Reconnecting to room...');
      this.onConnectionStateChanged?.('reconnecting');
    });

    this.room.on('reconnected', () => {
      // TODO: Replace with proper logging service
      // console.log('Reconnected to room');
      this.reconnectAttempts = 0;
      this.onConnectionStateChanged?.('connected');
    });

    this.room.on('disconnected', (reason) => {
      // TODO: Replace with proper logging service
      // console.log('Disconnected from room:', reason);
      this.onConnectionStateChanged?.('disconnected');
    });

    // Data events
    this.room.on('dataReceived', (payload, participant, kind) => {
      // TODO: Replace with proper logging service
      // console.log('Data received from', participant?.identity, 'kind:', kind);
      // Handle received data here
    });

    // Connection quality
    this.room.on('connectionQualityChanged', (quality, participant) => {
      // TODO: Replace with proper logging service
      // console.log('Connection quality changed for', participant.identity, ':', quality);
    });

    // Media device errors
    this.room.on('mediaDevicesError', (error) => {
      // TODO: Replace with proper logging service
      // console.error('Media devices error:', error);
      this.handleError(new Error(`Media devices error: ${error.message}`));
    });
  }

  /**
   * Map participant to ParticipantInfo
   */
  private mapParticipant(participant: LocalParticipant | RemoteParticipant, isLocal: boolean): ParticipantInfo {
    return {
      identity: participant.identity,
      name: participant.name || participant.identity,
      metadata: participant.metadata,
      isLocal,
      audioEnabled: participant.isMicrophoneEnabled,
      videoEnabled: participant.isCameraEnabled,
      screenShareEnabled: participant.isScreenShareEnabled,
      isSpeaking: false, // Will be updated by speaking events
    };
  }

  /**
   * Handle errors
   */
  private handleError(error: Error): void {
    // TODO: Replace with proper logging service
    // console.error('LiveKit Service Error:', error);
    this.onError?.(error);
  }
}

// Singleton instance for global use
let liveKitInstance: LiveKitService | null = null;

/**
 * Get the global LiveKit service instance
 */
export function getLiveKitService(): LiveKitService {
  if (!liveKitInstance) {
    liveKitInstance = new LiveKitService();
  }
  return liveKitInstance;
}

/**
 * Initialize LiveKit service with custom config
 */
export function initializeLiveKit(config?: Partial<LiveKitConfig>): LiveKitService {
  liveKitInstance = new LiveKitService(config);
  return liveKitInstance;
}

export default LiveKitService;
