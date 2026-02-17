import { EventEmitter } from 'events';

// Video call participant interface
export interface VideoParticipant {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  videoTrack?: MediaStreamTrack;
  audioTrack?: MediaStreamTrack;
  isLocal: boolean;
  isMuted: boolean;
  isVideoEnabled: boolean;
  stream?: MediaStream;
}

// Video call configuration
export interface VideoCallConfig {
  maxParticipants: number;
  defaultVideoEnabled: boolean;
  defaultAudioEnabled: boolean;
  videoConstraints: MediaTrackConstraints;
  audioConstraints: MediaTrackConstraints;
}

// Video call events
export type VideoCallEvents = {
  'participant-joined': VideoParticipant;
  'participant-left': string;
  'participant-updated': VideoParticipant;
  'track-added': { participantId: string; track: MediaStreamTrack; kind: 'audio' | 'video' };
  'track-removed': { participantId: string; trackId: string; kind: 'audio' | 'video' };
  'connection-state-changed': RTCPeerConnectionState;
  'error': Error;
};

// Default configuration
const DEFAULT_CONFIG: VideoCallConfig = {
  maxParticipants: 12,
  defaultVideoEnabled: true,
  defaultAudioEnabled: true,
  videoConstraints: {
    width: { ideal: 1280, min: 640, max: 1920 },
    height: { ideal: 720, min: 480, max: 1080 },
    frameRate: { ideal: 30, min: 15, max: 60 },
    facingMode: 'user'
  },
  audioConstraints: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 48000,
    sampleSize: 16,
    channelCount: 2
  }
};

/**
 * VideoCallService manages WebRTC connections, tracks, and participants
 * for multi-participant video calls using LiveKit
 */
export class VideoCallService extends EventEmitter {
  private participants = new Map<string, VideoParticipant>();
  private localParticipant: VideoParticipant | null = null;
  private localStream: MediaStream | null = null;
  private config: VideoCallConfig;
  private isConnected = false;
  private roomId: string | null = null;

  constructor(config: Partial<VideoCallConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Join a video call room
   */
  async joinCall(roomId: string, userId: string, displayName: string): Promise<void> {
    if (this.isConnected) {
      throw new Error('Already connected to a call');
    }

    this.roomId = roomId;

    try {
      // Initialize local media
      await this.initializeLocalMedia(userId, displayName);
      
      // Connect to room (placeholder - needs LiveKit integration)
      await this.connectToRoom(roomId);
      
      this.isConnected = true;
      this.emit('connection-state-changed', 'connected');
    } catch (error) {
      this.emit('error', error as Error);
      throw error;
    }
  }

  /**
   * Leave the current video call
   */
  async leaveCall(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      // Stop local media
      this.stopLocalMedia();
      
      // Disconnect from room
      await this.disconnectFromRoom();
      
      // Clean up participants
      this.participants.clear();
      this.localParticipant = null;
      this.isConnected = false;
      this.roomId = null;
      
      this.emit('connection-state-changed', 'disconnected');
    } catch (error) {
      this.emit('error', error as Error);
      throw error;
    }
  }

  /**
   * Initialize local media stream
   */
  private async initializeLocalMedia(userId: string, displayName: string): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: this.config.videoConstraints,
        audio: this.config.audioConstraints
      });

      this.localStream = stream;
      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];

      this.localParticipant = {
        id: `local-${userId}`,
        userId,
        displayName,
        videoTrack,
        audioTrack,
        isLocal: true,
        isMuted: !this.config.defaultAudioEnabled,
        isVideoEnabled: this.config.defaultVideoEnabled,
        stream
      };

      // Apply initial mute state
      if (!this.config.defaultAudioEnabled && audioTrack) {
        audioTrack.enabled = false;
      }
      if (!this.config.defaultVideoEnabled && videoTrack) {
        videoTrack.enabled = false;
      }

      this.participants.set(this.localParticipant.id, this.localParticipant);
      this.emit('participant-joined', this.localParticipant);
    } catch (error) {
      throw new Error(`Failed to initialize local media: ${error}`);
    }
  }

  /**
   * Connect to LiveKit room (placeholder implementation)
   */
  private async connectToRoom(roomId: string): Promise<void> {
    // TODO: Implement actual LiveKit connection
    // This is a placeholder for the LiveKit integration
    console.log(`Connecting to room: ${roomId}`);
    
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  /**
   * Disconnect from LiveKit room (placeholder implementation)
   */
  private async disconnectFromRoom(): Promise<void> {
    // TODO: Implement actual LiveKit disconnection
    console.log('Disconnecting from room');
  }

  /**
   * Stop local media streams
   */
  private stopLocalMedia(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        track.stop();
      });
      this.localStream = null;
    }
  }

  /**
   * Toggle local audio mute state
   */
  toggleAudio(): boolean {
    if (!this.localParticipant?.audioTrack) {
      return false;
    }

    const newMutedState = !this.localParticipant.isMuted;
    this.localParticipant.audioTrack.enabled = !newMutedState;
    this.localParticipant.isMuted = newMutedState;

    this.participants.set(this.localParticipant.id, this.localParticipant);
    this.emit('participant-updated', this.localParticipant);

    return !newMutedState;
  }

  /**
   * Toggle local video enabled state
   */
  toggleVideo(): boolean {
    if (!this.localParticipant?.videoTrack) {
      return false;
    }

    const newVideoState = !this.localParticipant.isVideoEnabled;
    this.localParticipant.videoTrack.enabled = newVideoState;
    this.localParticipant.isVideoEnabled = newVideoState;

    this.participants.set(this.localParticipant.id, this.localParticipant);
    this.emit('participant-updated', this.localParticipant);

    return newVideoState;
  }

  /**
   * Add a remote participant (called when someone joins)
   */
  addRemoteParticipant(participant: Omit<VideoParticipant, 'isLocal'>): void {
    const remoteParticipant: VideoParticipant = {
      ...participant,
      isLocal: false
    };

    this.participants.set(participant.id, remoteParticipant);
    this.emit('participant-joined', remoteParticipant);
  }

  /**
   * Remove a remote participant (called when someone leaves)
   */
  removeRemoteParticipant(participantId: string): void {
    const participant = this.participants.get(participantId);
    if (participant && !participant.isLocal) {
      // Clean up tracks
      if (participant.stream) {
        participant.stream.getTracks().forEach(track => track.stop());
      }
      
      this.participants.delete(participantId);
      this.emit('participant-left', participantId);
    }
  }

  /**
   * Add a track to a remote participant
   */
  addTrack(participantId: string, track: MediaStreamTrack, stream: MediaStream): void {
    const participant = this.participants.get(participantId);
    if (!participant) {
      return;
    }

    if (track.kind === 'video') {
      participant.videoTrack = track;
      participant.isVideoEnabled = track.enabled;
    } else if (track.kind === 'audio') {
      participant.audioTrack = track;
      participant.isMuted = !track.enabled;
    }

    participant.stream = stream;
    this.participants.set(participantId, participant);
    
    this.emit('track-added', { 
      participantId, 
      track, 
      kind: track.kind as 'audio' | 'video' 
    });
    this.emit('participant-updated', participant);
  }

  /**
   * Remove a track from a remote participant
   */
  removeTrack(participantId: string, trackId: string): void {
    const participant = this.participants.get(participantId);
    if (!participant) {
      return;
    }

    let kind: 'audio' | 'video' | null = null;

    if (participant.videoTrack?.id === trackId) {
      participant.videoTrack = undefined;
      participant.isVideoEnabled = false;
      kind = 'video';
    } else if (participant.audioTrack?.id === trackId) {
      participant.audioTrack = undefined;
      participant.isMuted = true;
      kind = 'audio';
    }

    if (kind) {
      this.participants.set(participantId, participant);
      this.emit('track-removed', { participantId, trackId, kind });
      this.emit('participant-updated', participant);
    }
  }

  /**
   * Get all participants
   */
  getParticipants(): VideoParticipant[] {
    return Array.from(this.participants.values());
  }

  /**
   * Get local participant
   */
  getLocalParticipant(): VideoParticipant | null {
    return this.localParticipant;
  }

  /**
   * Get remote participants only
   */
  getRemoteParticipants(): VideoParticipant[] {
    return Array.from(this.participants.values()).filter(p => !p.isLocal);
  }

  /**
   * Get participant by ID
   */
  getParticipant(participantId: string): VideoParticipant | undefined {
    return this.participants.get(participantId);
  }

  /**
   * Check if currently in a call
   */
  isInCall(): boolean {
    return this.isConnected;
  }

  /**
   * Get current room ID
   */
  getRoomId(): string | null {
    return this.roomId;
  }

  /**
   * Get participant count
   */
  getParticipantCount(): number {
    return this.participants.size;
  }

  /**
   * Check if at max capacity
   */
  isAtMaxCapacity(): boolean {
    return this.participants.size >= this.config.maxParticipants;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<VideoCallConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): VideoCallConfig {
    return { ...this.config };
  }

  /**
   * Cleanup and dispose of resources
   */
  dispose(): void {
    this.leaveCall().catch(console.error);
    this.removeAllListeners();
  }
}

// Singleton instance
let videoCallServiceInstance: VideoCallService | null = null;

/**
 * Get the global VideoCallService instance
 */
export function getVideoCallService(config?: Partial<VideoCallConfig>): VideoCallService {
  if (!videoCallServiceInstance) {
    videoCallServiceInstance = new VideoCallService(config);
  }
  return videoCallServiceInstance;
}

/**
 * Reset the global VideoCallService instance (useful for testing)
 */
export function resetVideoCallService(): void {
  if (videoCallServiceInstance) {
    videoCallServiceInstance.dispose();
    videoCallServiceInstance = null;
  }
}