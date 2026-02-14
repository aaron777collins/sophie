import { 
  Room, 
  LocalVideoTrack, 
  RemoteVideoTrack, 
  LocalAudioTrack, 
  RemoteAudioTrack,
  Track,
  TrackPublication,
  Participant,
  ConnectionQuality
} from 'livekit-client';
import { getLiveKitService } from '@/services/livekit';

export interface VideoTrackInfo {
  trackSid: string;
  participant: {
    identity: string;
    name: string;
  };
  track: LocalVideoTrack | RemoteVideoTrack;
  element?: HTMLVideoElement;
  isLocal: boolean;
  isScreenShare: boolean;
  dimensions?: {
    width: number;
    height: number;
  };
}

export interface VideoCallOptions {
  roomName: string;
  identity: string;
  name?: string;
  matrixAccessToken?: string;
  enableVideo?: boolean;
  enableAudio?: boolean;
  videoDeviceId?: string;
  audioDeviceId?: string;
}

export interface VideoCallState {
  isVideoCall: boolean;
  participants: Map<string, VideoTrackInfo[]>;
  localVideoTrack: LocalVideoTrack | null;
  localAudioTrack: LocalAudioTrack | null;
  screenShareTrack: LocalVideoTrack | null;
  pinnedParticipant: string | null;
  layoutMode: 'grid' | 'speaker' | 'fullscreen';
  gridSize: {
    rows: number;
    cols: number;
  };
}

/**
 * Video Call Service
 * Manages video tracks, layout, and video-specific functionality
 * Built on top of the existing LiveKit service
 */
export class VideoCallService {
  private liveKit = getLiveKitService();
  private state: VideoCallState = {
    isVideoCall: false,
    participants: new Map(),
    localVideoTrack: null,
    localAudioTrack: null,
    screenShareTrack: null,
    pinnedParticipant: null,
    layoutMode: 'grid',
    gridSize: { rows: 1, cols: 1 },
  };

  // Event handlers
  private onVideoTrackSubscribed?: (track: VideoTrackInfo) => void;
  private onVideoTrackUnsubscribed?: (trackSid: string) => void;
  private onLayoutChanged?: (layout: 'grid' | 'speaker' | 'fullscreen') => void;
  private onParticipantVideoEnabled?: (identity: string, enabled: boolean) => void;
  private onDimensionsChanged?: (trackSid: string, dimensions: { width: number; height: number }) => void;

  /**
   * Initialize video call session
   */
  async initializeVideoCall(options: VideoCallOptions): Promise<void> {
    try {
      // Connect to room using existing LiveKit service
      const token = await this.liveKit.requestToken(options.roomName, options.identity, {
        name: options.name,
        matrixAccessToken: options.matrixAccessToken,
      });

      await this.liveKit.connectToRoom(options.roomName, token);
      
      const room = this.liveKit.getRoom();
      if (!room) {
        throw new Error('Failed to connect to room');
      }

      // Enable video call mode
      this.state.isVideoCall = true;

      // Set up video-specific event listeners
      this.setupVideoEventListeners(room);

      // Enable initial media based on options
      if (options.enableVideo) {
        await this.enableCamera(options.videoDeviceId);
      }
      if (options.enableAudio) {
        await this.enableMicrophone(options.audioDeviceId);
      }

      // Calculate initial layout
      this.updateGridLayout();

    } catch (error) {
      throw new Error(`Failed to initialize video call: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Enable camera with optional device selection
   */
  async enableCamera(deviceId?: string): Promise<LocalVideoTrack> {
    try {
      const room = this.liveKit.getRoom();
      if (!room?.localParticipant) {
        throw new Error('Not connected to a room');
      }

      const captureOptions = {
        deviceId,
        resolution: {
          width: 1280,
          height: 720,
        },
        frameRate: 30,
      };

      await room.localParticipant.setCameraEnabled(true, captureOptions);
      
      // Find the local video track
      const videoPublication = room.localParticipant.getTrackPublication(Track.Source.Camera);
      if (videoPublication?.track instanceof LocalVideoTrack) {
        this.state.localVideoTrack = videoPublication.track;
        
        // Create video track info
        const trackInfo: VideoTrackInfo = {
          trackSid: videoPublication.trackSid,
          participant: {
            identity: room.localParticipant.identity,
            name: room.localParticipant.name || room.localParticipant.identity,
          },
          track: videoPublication.track,
          isLocal: true,
          isScreenShare: false,
        };

        // Add to participants map
        const participantTracks = this.state.participants.get(room.localParticipant.identity) || [];
        participantTracks.push(trackInfo);
        this.state.participants.set(room.localParticipant.identity, participantTracks);

        this.onVideoTrackSubscribed?.(trackInfo);
        this.updateGridLayout();
        
        return videoPublication.track;
      }

      throw new Error('Failed to get local video track');
    } catch (error) {
      throw new Error(`Failed to enable camera: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Disable camera
   */
  async disableCamera(): Promise<void> {
    try {
      const room = this.liveKit.getRoom();
      if (!room?.localParticipant) {
        throw new Error('Not connected to a room');
      }

      await room.localParticipant.setCameraEnabled(false);
      
      if (this.state.localVideoTrack) {
        // Remove from participants map
        const participantTracks = this.state.participants.get(room.localParticipant.identity) || [];
        const filteredTracks = participantTracks.filter(t => t.track !== this.state.localVideoTrack);
        
        if (filteredTracks.length === 0) {
          this.state.participants.delete(room.localParticipant.identity);
        } else {
          this.state.participants.set(room.localParticipant.identity, filteredTracks);
        }

        if (this.state.localVideoTrack.sid) {
          this.onVideoTrackUnsubscribed?.(this.state.localVideoTrack.sid);
        }
        this.state.localVideoTrack = null;
        this.updateGridLayout();
      }
    } catch (error) {
      throw new Error(`Failed to disable camera: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Enable microphone with optional device selection
   */
  async enableMicrophone(deviceId?: string): Promise<LocalAudioTrack> {
    try {
      const room = this.liveKit.getRoom();
      if (!room?.localParticipant) {
        throw new Error('Not connected to a room');
      }

      const captureOptions = {
        deviceId,
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      };

      await room.localParticipant.setMicrophoneEnabled(true, captureOptions);
      
      const audioPublication = room.localParticipant.getTrackPublication(Track.Source.Microphone);
      if (audioPublication?.track instanceof LocalAudioTrack) {
        this.state.localAudioTrack = audioPublication.track;
        return audioPublication.track;
      }

      throw new Error('Failed to get local audio track');
    } catch (error) {
      throw new Error(`Failed to enable microphone: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Disable microphone
   */
  async disableMicrophone(): Promise<void> {
    try {
      const room = this.liveKit.getRoom();
      if (!room?.localParticipant) {
        throw new Error('Not connected to a room');
      }

      await room.localParticipant.setMicrophoneEnabled(false);
      this.state.localAudioTrack = null;
    } catch (error) {
      throw new Error(`Failed to disable microphone: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Start screen sharing
   */
  async startScreenShare(): Promise<LocalVideoTrack> {
    try {
      const room = this.liveKit.getRoom();
      if (!room?.localParticipant) {
        throw new Error('Not connected to a room');
      }

      await room.localParticipant.setScreenShareEnabled(true, {
        audio: true,
      });

      const screenPublication = room.localParticipant.getTrackPublication(Track.Source.ScreenShare);
      if (screenPublication?.track instanceof LocalVideoTrack) {
        this.state.screenShareTrack = screenPublication.track;
        
        // Create screen share track info
        const trackInfo: VideoTrackInfo = {
          trackSid: screenPublication.trackSid,
          participant: {
            identity: room.localParticipant.identity,
            name: room.localParticipant.name || room.localParticipant.identity,
          },
          track: screenPublication.track,
          isLocal: true,
          isScreenShare: true,
        };

        // Add to participants map
        const participantTracks = this.state.participants.get(room.localParticipant.identity) || [];
        participantTracks.push(trackInfo);
        this.state.participants.set(room.localParticipant.identity, participantTracks);

        this.onVideoTrackSubscribed?.(trackInfo);
        this.setLayoutMode('speaker'); // Switch to speaker view for screen share
        
        return screenPublication.track;
      }

      throw new Error('Failed to get screen share track');
    } catch (error) {
      throw new Error(`Failed to start screen sharing: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Stop screen sharing
   */
  async stopScreenShare(): Promise<void> {
    try {
      const room = this.liveKit.getRoom();
      if (!room?.localParticipant) {
        throw new Error('Not connected to a room');
      }

      await room.localParticipant.setScreenShareEnabled(false);
      
      if (this.state.screenShareTrack) {
        // Remove from participants map
        const participantTracks = this.state.participants.get(room.localParticipant.identity) || [];
        const filteredTracks = participantTracks.filter(t => t.track !== this.state.screenShareTrack);
        this.state.participants.set(room.localParticipant.identity, filteredTracks);

        if (this.state.screenShareTrack.sid) {
          this.onVideoTrackUnsubscribed?.(this.state.screenShareTrack.sid);
        }
        this.state.screenShareTrack = null;
        this.setLayoutMode('grid'); // Switch back to grid view
      }
    } catch (error) {
      throw new Error(`Failed to stop screen sharing: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Switch camera device
   */
  async switchCamera(deviceId: string): Promise<void> {
    const wasEnabled = !!this.state.localVideoTrack;
    
    if (wasEnabled) {
      await this.disableCamera();
      await this.enableCamera(deviceId);
    }
  }

  /**
   * Switch microphone device
   */
  async switchMicrophone(deviceId: string): Promise<void> {
    const wasEnabled = !!this.state.localAudioTrack;
    
    if (wasEnabled) {
      await this.disableMicrophone();
      await this.enableMicrophone(deviceId);
    }
  }

  /**
   * Pin a participant (for speaker view)
   */
  pinParticipant(identity: string | null): void {
    this.state.pinnedParticipant = identity;
    if (identity && this.state.layoutMode !== 'fullscreen') {
      this.setLayoutMode('speaker');
    } else if (!identity && this.state.layoutMode === 'speaker') {
      this.setLayoutMode('grid');
    }
  }

  /**
   * Set layout mode
   */
  setLayoutMode(mode: 'grid' | 'speaker' | 'fullscreen'): void {
    this.state.layoutMode = mode;
    this.updateGridLayout();
    this.onLayoutChanged?.(mode);
  }

  /**
   * Get all video tracks
   */
  getAllVideoTracks(): VideoTrackInfo[] {
    const allTracks: VideoTrackInfo[] = [];
    for (const tracks of this.state.participants.values()) {
      allTracks.push(...tracks);
    }
    return allTracks;
  }

  /**
   * Get video tracks for a specific participant
   */
  getParticipantVideoTracks(identity: string): VideoTrackInfo[] {
    return this.state.participants.get(identity) || [];
  }

  /**
   * Get current state
   */
  getState(): VideoCallState {
    return { ...this.state };
  }

  /**
   * Cleanup video call
   */
  async cleanup(): Promise<void> {
    try {
      // Disable local tracks
      if (this.state.localVideoTrack) {
        await this.disableCamera();
      }
      if (this.state.localAudioTrack) {
        await this.disableMicrophone();
      }
      if (this.state.screenShareTrack) {
        await this.stopScreenShare();
      }

      // Reset state
      this.state = {
        isVideoCall: false,
        participants: new Map(),
        localVideoTrack: null,
        localAudioTrack: null,
        screenShareTrack: null,
        pinnedParticipant: null,
        layoutMode: 'grid',
        gridSize: { rows: 1, cols: 1 },
      };

      // Disconnect from room
      await this.liveKit.disconnect();
    } catch (error) {
      console.error('Error during video call cleanup:', error);
    }
  }

  /**
   * Set event handlers
   */
  setEventHandlers(handlers: {
    onVideoTrackSubscribed?: (track: VideoTrackInfo) => void;
    onVideoTrackUnsubscribed?: (trackSid: string) => void;
    onLayoutChanged?: (layout: 'grid' | 'speaker' | 'fullscreen') => void;
    onParticipantVideoEnabled?: (identity: string, enabled: boolean) => void;
    onDimensionsChanged?: (trackSid: string, dimensions: { width: number; height: number }) => void;
  }): void {
    this.onVideoTrackSubscribed = handlers.onVideoTrackSubscribed;
    this.onVideoTrackUnsubscribed = handlers.onVideoTrackUnsubscribed;
    this.onLayoutChanged = handlers.onLayoutChanged;
    this.onParticipantVideoEnabled = handlers.onParticipantVideoEnabled;
    this.onDimensionsChanged = handlers.onDimensionsChanged;
  }

  /**
   * Setup video-specific event listeners
   */
  private setupVideoEventListeners(room: Room): void {
    // Track subscribed events
    room.on('trackSubscribed', (track, publication, participant) => {
      if (track instanceof RemoteVideoTrack) {
        const trackInfo: VideoTrackInfo = {
          trackSid: publication.trackSid,
          participant: {
            identity: participant.identity,
            name: participant.name || participant.identity,
          },
          track,
          isLocal: false,
          isScreenShare: publication.source === Track.Source.ScreenShare,
        };

        // Add to participants map
        const participantTracks = this.state.participants.get(participant.identity) || [];
        participantTracks.push(trackInfo);
        this.state.participants.set(participant.identity, participantTracks);

        this.onVideoTrackSubscribed?.(trackInfo);
        this.updateGridLayout();
      }
    });

    // Track unsubscribed events
    room.on('trackUnsubscribed', (track, publication, participant) => {
      if (track instanceof RemoteVideoTrack) {
        // Remove from participants map
        const participantTracks = this.state.participants.get(participant.identity) || [];
        const filteredTracks = participantTracks.filter(t => t.trackSid !== publication.trackSid);
        
        if (filteredTracks.length === 0) {
          this.state.participants.delete(participant.identity);
        } else {
          this.state.participants.set(participant.identity, filteredTracks);
        }

        this.onVideoTrackUnsubscribed?.(publication.trackSid);
        this.updateGridLayout();
      }
    });

    // Participant disconnected
    room.on('participantDisconnected', (participant) => {
      this.state.participants.delete(participant.identity);
      this.updateGridLayout();
      
      // Unpin if the pinned participant left
      if (this.state.pinnedParticipant === participant.identity) {
        this.pinParticipant(null);
      }
    });
  }

  /**
   * Calculate optimal grid layout
   */
  private updateGridLayout(): void {
    const totalParticipants = this.getAllVideoTracks().length;
    
    if (totalParticipants === 0) {
      this.state.gridSize = { rows: 1, cols: 1 };
      return;
    }

    // Calculate optimal grid dimensions
    const cols = Math.ceil(Math.sqrt(totalParticipants));
    const rows = Math.ceil(totalParticipants / cols);
    
    this.state.gridSize = { rows, cols };
  }
}

// Singleton instance
let videoCallService: VideoCallService | null = null;

/**
 * Get the global video call service instance
 */
export function getVideoCallService(): VideoCallService {
  if (!videoCallService) {
    videoCallService = new VideoCallService();
  }
  return videoCallService;
}

/**
 * Initialize video call service
 */
export function initializeVideoCallService(): VideoCallService {
  videoCallService = new VideoCallService();
  return videoCallService;
}

export default VideoCallService;