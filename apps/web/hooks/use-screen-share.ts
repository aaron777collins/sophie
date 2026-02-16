'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  LocalVideoTrack, 
  LocalAudioTrack, 
  createLocalScreenTracks,
  Room,
  Track 
} from 'livekit-client';

export interface ScreenShareOptions {
  /** Whether to include audio from the screen share */
  includeAudio?: boolean;
  /** Preferred video quality settings */
  videoQuality?: {
    width?: number;
    height?: number;
    frameRate?: number;
  };
  /** Screen share source preference */
  displaySurface?: 'monitor' | 'window' | 'browser';
}

export interface ScreenShareState {
  /** Whether screen sharing is currently active */
  isScreenSharing: boolean;
  /** Whether starting screen share */
  isStarting: boolean;
  /** Whether stopping screen share */
  isStopping: boolean;
  /** Current screen share video track */
  screenShareTrack: LocalVideoTrack | null;
  /** Current screen share audio track (if enabled) */
  screenShareAudioTrack: LocalAudioTrack | null;
  /** Last error that occurred */
  error: string | null;
  /** Whether screen sharing is supported in this browser */
  isSupported: boolean;
}

export interface UseScreenShareProps {
  /** LiveKit room instance */
  room?: Room;
  /** Default screen share options */
  defaultOptions?: ScreenShareOptions;
  /** Callback when screen share starts successfully */
  onScreenShareStart?: (tracks: { video: LocalVideoTrack; audio?: LocalAudioTrack }) => void;
  /** Callback when screen share stops */
  onScreenShareStop?: () => void;
  /** Callback when screen share encounters an error */
  onError?: (error: Error) => void;
}

export function useScreenShare({
  room,
  defaultOptions = {},
  onScreenShareStart,
  onScreenShareStop,
  onError,
}: UseScreenShareProps = {}) {
  // State management
  const [state, setState] = useState<ScreenShareState>({
    isScreenSharing: false,
    isStarting: false,
    isStopping: false,
    screenShareTrack: null,
    screenShareAudioTrack: null,
    error: null,
    isSupported: typeof navigator !== 'undefined' && 
                 'mediaDevices' in navigator && 
                 'getDisplayMedia' in navigator.mediaDevices,
  });

  // Track cleanup on unmount
  const tracksRef = useRef<{ video?: LocalVideoTrack; audio?: LocalAudioTrack }>({});

  // Cleanup function
  const cleanup = useCallback(async () => {
    const { video, audio } = tracksRef.current;
    
    if (video) {
      video.stop();
      if (room && room.localParticipant.getTrackPublication(video.source)) {
        await room.localParticipant.unpublishTrack(video);
      }
    }
    
    if (audio) {
      audio.stop();
      if (room && room.localParticipant.getTrackPublication(audio.source)) {
        await room.localParticipant.unpublishTrack(audio);
      }
    }
    
    tracksRef.current = {};
  }, [room]);

  // Start screen sharing
  const startScreenShare = useCallback(async (options: ScreenShareOptions = {}) => {
    if (!state.isSupported) {
      const error = new Error('Screen sharing is not supported in this browser');
      setState(prev => ({ ...prev, error: error.message }));
      onError?.(error);
      return;
    }

    if (state.isScreenSharing || state.isStarting) {
      return; // Already active or starting
    }

    setState(prev => ({ ...prev, isStarting: true, error: null }));

    try {
      const mergedOptions = { ...defaultOptions, ...options };
      
      // Configure screen share options
      const trackOptions: Parameters<typeof createLocalScreenTracks>[0] = {
        video: {
          displaySurface: mergedOptions.displaySurface || 'monitor',
          ...(mergedOptions.videoQuality && {
            width: { ideal: mergedOptions.videoQuality.width },
            height: { ideal: mergedOptions.videoQuality.height },
            frameRate: { ideal: mergedOptions.videoQuality.frameRate },
          }),
        },
        audio: mergedOptions.includeAudio || false,
      };

      // Create screen share tracks
      const tracks = await createLocalScreenTracks(trackOptions);
      
      let videoTrack: LocalVideoTrack | undefined;
      let audioTrack: LocalAudioTrack | undefined;

      // Separate video and audio tracks
      tracks.forEach(track => {
        if (track.kind === Track.Kind.Video) {
          videoTrack = track as LocalVideoTrack;
        } else if (track.kind === Track.Kind.Audio) {
          audioTrack = track as LocalAudioTrack;
        }
      });

      if (!videoTrack) {
        throw new Error('Failed to create video track for screen sharing');
      }

      // Store tracks for cleanup
      tracksRef.current = { video: videoTrack, audio: audioTrack };

      // Publish tracks to room if available
      if (room) {
        await room.localParticipant.publishTrack(videoTrack, {
          name: 'screen-share',
          simulcast: false,
        });
        
        if (audioTrack) {
          await room.localParticipant.publishTrack(audioTrack, {
            name: 'screen-share-audio',
          });
        }
      }

      // Set up track end handler (user stops sharing via browser UI)
      const mediaStream = videoTrack.mediaStreamTrack.getSettings();
      videoTrack.mediaStreamTrack.addEventListener('ended', () => {
        stopScreenShare();
      });

      // Update state
      setState(prev => ({
        ...prev,
        isScreenSharing: true,
        isStarting: false,
        screenShareTrack: videoTrack || null,
        screenShareAudioTrack: audioTrack || null,
        error: null,
      }));

      // Call success callback
      onScreenShareStart?.({ video: videoTrack, audio: audioTrack });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start screen sharing';
      
      setState(prev => ({ 
        ...prev, 
        isStarting: false, 
        error: errorMessage,
      }));

      onError?.(error instanceof Error ? error : new Error(errorMessage));
      
      // Clean up any partially created tracks
      await cleanup();
    }
  }, [state.isSupported, state.isScreenSharing, state.isStarting, defaultOptions, room, onScreenShareStart, onError, cleanup]);

  // Stop screen sharing
  const stopScreenShare = useCallback(async () => {
    if (!state.isScreenSharing || state.isStopping) {
      return; // Not active or already stopping
    }

    setState(prev => ({ ...prev, isStopping: true, error: null }));

    try {
      await cleanup();

      setState(prev => ({
        ...prev,
        isScreenSharing: false,
        isStopping: false,
        screenShareTrack: null,
        screenShareAudioTrack: null,
        error: null,
      }));

      onScreenShareStop?.();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to stop screen sharing';
      
      setState(prev => ({ 
        ...prev, 
        isStopping: false, 
        error: errorMessage,
      }));

      onError?.(error instanceof Error ? error : new Error(errorMessage));
    }
  }, [state.isScreenSharing, state.isStopping, cleanup, onScreenShareStop, onError]);

  // Toggle screen sharing
  const toggleScreenShare = useCallback(async (options?: ScreenShareOptions) => {
    if (state.isScreenSharing) {
      await stopScreenShare();
    } else {
      await startScreenShare(options);
    }
  }, [state.isScreenSharing, startScreenShare, stopScreenShare]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // Clear error after timeout
  useEffect(() => {
    if (state.error) {
      const timer = setTimeout(() => {
        setState(prev => ({ ...prev, error: null }));
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [state.error]);

  return {
    ...state,
    startScreenShare,
    stopScreenShare,
    toggleScreenShare,
  };
}

export type UseScreenShareReturn = ReturnType<typeof useScreenShare>;