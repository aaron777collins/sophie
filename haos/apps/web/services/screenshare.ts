import { 
  Room, 
  LocalVideoTrack, 
  RemoteVideoTrack, 
  Track,
  TrackPublication,
  Participant,
} from 'livekit-client';
import { getLiveKitService } from '@/services/livekit';
import { getVideoCallService } from '@/services/video-call';

export interface ScreenShareSource {
  id: string;
  name: string;
  type: 'screen' | 'window';
  thumbnail?: ImageBitmap;
}

export interface ScreenShareTrackInfo {
  trackSid: string;
  participant: {
    identity: string;
    name: string;
  };
  track: LocalVideoTrack | RemoteVideoTrack;
  isLocal: boolean;
  dimensions?: {
    width: number;
    height: number;
  };
  source?: ScreenShareSource;
}

export interface ScreenShareState {
  isSharing: boolean;
  isSelectingSource: boolean;
  availableSources: ScreenShareSource[];
  selectedSource: ScreenShareSource | null;
  activeTracks: Map<string, ScreenShareTrackInfo>;
  viewerState: {
    isFullscreen: boolean;
    zoomLevel: number;
    focusedTrack: string | null;
  };
}

/**
 * Screen Share Service
 * Manages screen capture tracks, source selection, and viewer functionality
 * Built on top of the existing VideoCall service and LiveKit
 */
export class ScreenShareService {
  private liveKit = getLiveKitService();
  private videoCall = getVideoCallService();
  
  private state: ScreenShareState = {
    isSharing: false,
    isSelectingSource: false,
    availableSources: [],
    selectedSource: null,
    activeTracks: new Map(),
    viewerState: {
      isFullscreen: false,
      zoomLevel: 1,
      focusedTrack: null,
    },
  };

  // Event handlers
  private onScreenShareStarted?: (track: ScreenShareTrackInfo) => void;
  private onScreenShareStopped?: (trackSid: string) => void;
  private onSourceSelected?: (source: ScreenShareSource) => void;
  private onViewerStateChanged?: (state: ScreenShareState['viewerState']) => void;

  /**
   * Get available screen share sources (screens and windows)
   */
  async getAvailableSources(): Promise<ScreenShareSource[]> {
    try {
      // Use getDisplayMedia to enumerate sources if supported
      if (navigator.mediaDevices && 'getDisplayMedia' in navigator.mediaDevices) {
        // For modern browsers, we'll start the sharing process to get source selection
        // This is a limitation of the web platform - we can't enumerate without user action
        const sources: ScreenShareSource[] = [
          {
            id: 'screen',
            name: 'Entire Screen',
            type: 'screen',
          },
          {
            id: 'window',
            name: 'Application Window',
            type: 'window',
          },
        ];
        
        this.state.availableSources = sources;
        return sources;
      }
      
      throw new Error('Screen sharing not supported in this browser');
    } catch (error) {
      throw new Error(`Failed to get available sources: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Start source selection process
   */
  async startSourceSelection(): Promise<ScreenShareSource[]> {
    try {
      this.state.isSelectingSource = true;
      const sources = await this.getAvailableSources();
      return sources;
    } catch (error) {
      this.state.isSelectingSource = false;
      throw error;
    }
  }

  /**
   * Cancel source selection
   */
  cancelSourceSelection(): void {
    this.state.isSelectingSource = false;
    this.state.availableSources = [];
  }

  /**
   * Select and start sharing a specific source
   */
  async selectAndStartSharing(source: ScreenShareSource): Promise<ScreenShareTrackInfo> {
    try {
      this.state.selectedSource = source;
      this.state.isSelectingSource = false;
      
      // Get the room from LiveKit service
      const room = this.liveKit.getRoom();
      if (!room?.localParticipant) {
        throw new Error('Not connected to a room');
      }

      // Configure screen share options based on source type
      const shareOptions: any = {
        audio: true, // Include system audio
      };

      // For screen vs window, browser will show appropriate picker
      if (source.type === 'screen') {
        shareOptions.video = {
          displaySurface: 'monitor',
        };
      } else {
        shareOptions.video = {
          displaySurface: 'window',
        };
      }

      // Start screen sharing using the video call service
      const track = await this.videoCall.startScreenShare();
      
      // Create screen share track info
      const trackInfo: ScreenShareTrackInfo = {
        trackSid: track.sid || '',
        participant: {
          identity: room.localParticipant.identity,
          name: room.localParticipant.name || room.localParticipant.identity,
        },
        track,
        isLocal: true,
        source,
      };

      // Update state
      this.state.isSharing = true;
      this.state.activeTracks.set(room.localParticipant.identity, trackInfo);

      // Set up track ended listener
      track.mediaStreamTrack.addEventListener('ended', () => {
        this.handleTrackEnded(room.localParticipant.identity);
      });

      this.onScreenShareStarted?.(trackInfo);
      this.onSourceSelected?.(source);
      
      return trackInfo;

    } catch (error) {
      this.state.isSelectingSource = false;
      this.state.selectedSource = null;
      throw new Error(`Failed to start screen sharing: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Stop screen sharing
   */
  async stopScreenSharing(): Promise<void> {
    try {
      const room = this.liveKit.getRoom();
      if (!room?.localParticipant) {
        throw new Error('Not connected to a room');
      }

      // Use video call service to stop sharing
      await this.videoCall.stopScreenShare();

      // Clean up state
      const localTrack = this.state.activeTracks.get(room.localParticipant.identity);
      if (localTrack) {
        this.onScreenShareStopped?.(localTrack.trackSid);
        this.state.activeTracks.delete(room.localParticipant.identity);
      }

      this.state.isSharing = false;
      this.state.selectedSource = null;
      
      // Reset viewer state
      this.state.viewerState = {
        isFullscreen: false,
        zoomLevel: 1,
        focusedTrack: null,
      };

    } catch (error) {
      throw new Error(`Failed to stop screen sharing: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Focus on a specific screen share track for viewing
   */
  focusTrack(trackSid: string): void {
    this.state.viewerState.focusedTrack = trackSid;
    this.onViewerStateChanged?.(this.state.viewerState);
  }

  /**
   * Set zoom level for the viewer
   */
  setZoomLevel(zoomLevel: number): void {
    this.state.viewerState.zoomLevel = Math.max(0.5, Math.min(3, zoomLevel));
    this.onViewerStateChanged?.(this.state.viewerState);
  }

  /**
   * Toggle fullscreen mode for viewer
   */
  async toggleFullscreen(element?: HTMLElement): Promise<void> {
    try {
      if (this.state.viewerState.isFullscreen) {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
        this.state.viewerState.isFullscreen = false;
      } else {
        if (element && element.requestFullscreen) {
          await element.requestFullscreen();
          this.state.viewerState.isFullscreen = true;
        }
      }
      this.onViewerStateChanged?.(this.state.viewerState);
    } catch (error) {
      // TODO: Replace with proper logging service
      // console.error('Failed to toggle fullscreen:', error);
    }
  }

  /**
   * Get all active screen share tracks
   */
  getActiveTracks(): ScreenShareTrackInfo[] {
    return Array.from(this.state.activeTracks.values());
  }

  /**
   * Get track for specific participant
   */
  getTrackForParticipant(identity: string): ScreenShareTrackInfo | null {
    return this.state.activeTracks.get(identity) || null;
  }

  /**
   * Get current state
   */
  getState(): ScreenShareState {
    return { ...this.state };
  }

  /**
   * Check if someone is currently sharing
   */
  hasActiveShares(): boolean {
    return this.state.activeTracks.size > 0;
  }

  /**
   * Set event handlers
   */
  setEventHandlers(handlers: {
    onScreenShareStarted?: (track: ScreenShareTrackInfo) => void;
    onScreenShareStopped?: (trackSid: string) => void;
    onSourceSelected?: (source: ScreenShareSource) => void;
    onViewerStateChanged?: (state: ScreenShareState['viewerState']) => void;
  }): void {
    this.onScreenShareStarted = handlers.onScreenShareStarted;
    this.onScreenShareStopped = handlers.onScreenShareStopped;
    this.onSourceSelected = handlers.onSourceSelected;
    this.onViewerStateChanged = handlers.onViewerStateChanged;
  }

  /**
   * Handle remote screen share tracks
   */
  handleRemoteScreenShare(track: RemoteVideoTrack, publication: TrackPublication, participant: Participant): void {
    if (publication.source === Track.Source.ScreenShare) {
      const trackInfo: ScreenShareTrackInfo = {
        trackSid: publication.trackSid,
        participant: {
          identity: participant.identity,
          name: participant.name || participant.identity,
        },
        track,
        isLocal: false,
      };

      this.state.activeTracks.set(participant.identity, trackInfo);
      this.onScreenShareStarted?.(trackInfo);
    }
  }

  /**
   * Handle remote screen share track removal
   */
  handleRemoteScreenShareStopped(publication: TrackPublication, participant: Participant): void {
    if (publication.source === Track.Source.ScreenShare) {
      const trackInfo = this.state.activeTracks.get(participant.identity);
      if (trackInfo) {
        this.state.activeTracks.delete(participant.identity);
        this.onScreenShareStopped?.(trackInfo.trackSid);
      }
    }
  }

  /**
   * Handle track ended (user stopped sharing via browser UI)
   */
  private handleTrackEnded(identity: string): void {
    const trackInfo = this.state.activeTracks.get(identity);
    if (trackInfo && trackInfo.isLocal) {
      this.state.isSharing = false;
      this.state.selectedSource = null;
      this.state.activeTracks.delete(identity);
      this.onScreenShareStopped?.(trackInfo.trackSid);
    }
  }

  /**
   * Setup event listeners for LiveKit events
   */
  setupEventListeners(): void {
    const room = this.liveKit.getRoom();
    if (!room) return;

    // Handle remote screen shares
    room.on('trackSubscribed', (track, publication, participant) => {
      if (track instanceof RemoteVideoTrack && publication.source === Track.Source.ScreenShare) {
        this.handleRemoteScreenShare(track, publication, participant);
      }
    });

    room.on('trackUnsubscribed', (track, publication, participant) => {
      if (track instanceof RemoteVideoTrack && publication.source === Track.Source.ScreenShare) {
        this.handleRemoteScreenShareStopped(publication, participant);
      }
    });

    // Handle participant disconnections
    room.on('participantDisconnected', (participant) => {
      const trackInfo = this.state.activeTracks.get(participant.identity);
      if (trackInfo) {
        this.state.activeTracks.delete(participant.identity);
        this.onScreenShareStopped?.(trackInfo.trackSid);
      }
    });

    // Handle fullscreen change events
    document.addEventListener('fullscreenchange', () => {
      this.state.viewerState.isFullscreen = !!document.fullscreenElement;
      this.onViewerStateChanged?.(this.state.viewerState);
    });
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    if (this.state.isSharing) {
      await this.stopScreenSharing();
    }
    
    this.state = {
      isSharing: false,
      isSelectingSource: false,
      availableSources: [],
      selectedSource: null,
      activeTracks: new Map(),
      viewerState: {
        isFullscreen: false,
        zoomLevel: 1,
        focusedTrack: null,
      },
    };
  }
}

// Singleton instance
let screenShareService: ScreenShareService | null = null;

/**
 * Get the global screen share service instance
 */
export function getScreenShareService(): ScreenShareService {
  if (!screenShareService) {
    screenShareService = new ScreenShareService();
  }
  return screenShareService;
}

/**
 * Initialize screen share service
 */
export function initializeScreenShareService(): ScreenShareService {
  screenShareService = new ScreenShareService();
  return screenShareService;
}

export default ScreenShareService;