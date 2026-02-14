'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  getScreenShareService, 
  ScreenShareService, 
  ScreenShareSource, 
  ScreenShareTrackInfo, 
  ScreenShareState 
} from '@/services/screenshare';

export interface UseScreenShareOptions {
  roomName?: string;
  userId?: string;
  autoSetupListeners?: boolean;
}

export interface UseScreenShareReturn {
  // State
  isSharing: boolean;
  isSelectingSource: boolean;
  availableSources: ScreenShareSource[];
  selectedSource: ScreenShareSource | null;
  activeTracks: ScreenShareTrackInfo[];
  hasActiveShares: boolean;
  
  // Viewer state
  isViewerFullscreen: boolean;
  viewerZoomLevel: number;
  focusedTrack: string | null;
  
  // Actions
  startSourceSelection: () => Promise<ScreenShareSource[]>;
  cancelSourceSelection: () => void;
  selectAndStartSharing: (source: ScreenShareSource) => Promise<ScreenShareTrackInfo>;
  stopScreenSharing: () => Promise<void>;
  toggleScreenShare: () => Promise<void>;
  
  // Viewer actions
  focusTrack: (trackSid: string) => void;
  setZoomLevel: (level: number) => void;
  toggleViewerFullscreen: (element?: HTMLElement) => Promise<void>;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
  
  // Utilities
  getTrackForParticipant: (identity: string) => ScreenShareTrackInfo | null;
  isParticipantSharing: (identity: string) => boolean;
  
  // Error state
  error: string | null;
  clearError: () => void;
}

export function useScreenShare(options: UseScreenShareOptions = {}): UseScreenShareReturn {
  const {
    roomName,
    userId,
    autoSetupListeners = true,
  } = options;

  const screenShareServiceRef = useRef<ScreenShareService | null>(null);
  
  // State
  const [isSharing, setIsSharing] = useState(false);
  const [isSelectingSource, setIsSelectingSource] = useState(false);
  const [availableSources, setAvailableSources] = useState<ScreenShareSource[]>([]);
  const [selectedSource, setSelectedSource] = useState<ScreenShareSource | null>(null);
  const [activeTracks, setActiveTracks] = useState<ScreenShareTrackInfo[]>([]);
  const [hasActiveShares, setHasActiveShares] = useState(false);
  
  // Viewer state
  const [isViewerFullscreen, setIsViewerFullscreen] = useState(false);
  const [viewerZoomLevel, setViewerZoomLevel] = useState(1);
  const [focusedTrack, setFocusedTrack] = useState<string | null>(null);
  
  // Error state
  const [error, setError] = useState<string | null>(null);

  // Initialize service and event handlers
  useEffect(() => {
    screenShareServiceRef.current = getScreenShareService();

    if (autoSetupListeners) {
      // Setup LiveKit event listeners
      screenShareServiceRef.current.setupEventListeners();
      
      // Set up service event handlers
      screenShareServiceRef.current.setEventHandlers({
        onScreenShareStarted: (track: ScreenShareTrackInfo) => {
          setActiveTracks(prev => {
            const filtered = prev.filter(t => t.participant.identity !== track.participant.identity);
            return [...filtered, track];
          });
          setHasActiveShares(true);
          
          if (track.isLocal) {
            setIsSharing(true);
          }
        },
        
        onScreenShareStopped: (trackSid: string) => {
          setActiveTracks(prev => {
            const filtered = prev.filter(t => t.trackSid !== trackSid);
            setHasActiveShares(filtered.length > 0);
            
            // Check if local track stopped
            const stoppedTrack = prev.find(t => t.trackSid === trackSid);
            if (stoppedTrack?.isLocal) {
              setIsSharing(false);
              setSelectedSource(null);
            }
            
            return filtered;
          });
        },
        
        onSourceSelected: (source: ScreenShareSource) => {
          setSelectedSource(source);
          setIsSelectingSource(false);
        },
        
        onViewerStateChanged: (viewerState) => {
          setIsViewerFullscreen(viewerState.isFullscreen);
          setViewerZoomLevel(viewerState.zoomLevel);
          setFocusedTrack(viewerState.focusedTrack);
        },
      });
    }

    // Sync initial state
    const currentState = screenShareServiceRef.current.getState();
    setIsSharing(currentState.isSharing);
    setIsSelectingSource(currentState.isSelectingSource);
    setAvailableSources(currentState.availableSources);
    setSelectedSource(currentState.selectedSource);
    setActiveTracks(screenShareServiceRef.current.getActiveTracks());
    setHasActiveShares(screenShareServiceRef.current.hasActiveShares());
    setIsViewerFullscreen(currentState.viewerState.isFullscreen);
    setViewerZoomLevel(currentState.viewerState.zoomLevel);
    setFocusedTrack(currentState.viewerState.focusedTrack);

    return () => {
      if (screenShareServiceRef.current?.getState().isSharing) {
        screenShareServiceRef.current.cleanup();
      }
    };
  }, [autoSetupListeners]);

  // Start source selection
  const startSourceSelection = useCallback(async (): Promise<ScreenShareSource[]> => {
    if (!screenShareServiceRef.current) {
      throw new Error('Screen share service not initialized');
    }

    setError(null);
    
    try {
      setIsSelectingSource(true);
      const sources = await screenShareServiceRef.current.startSourceSelection();
      setAvailableSources(sources);
      return sources;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to get available sources';
      setError(errorMsg);
      setIsSelectingSource(false);
      throw err;
    }
  }, []);

  // Cancel source selection
  const cancelSourceSelection = useCallback((): void => {
    if (!screenShareServiceRef.current) return;

    screenShareServiceRef.current.cancelSourceSelection();
    setIsSelectingSource(false);
    setAvailableSources([]);
    setError(null);
  }, []);

  // Select and start sharing
  const selectAndStartSharing = useCallback(async (source: ScreenShareSource): Promise<ScreenShareTrackInfo> => {
    if (!screenShareServiceRef.current) {
      throw new Error('Screen share service not initialized');
    }

    setError(null);

    try {
      const trackInfo = await screenShareServiceRef.current.selectAndStartSharing(source);
      return trackInfo;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to start screen sharing';
      setError(errorMsg);
      throw err;
    }
  }, []);

  // Stop screen sharing
  const stopScreenSharing = useCallback(async (): Promise<void> => {
    if (!screenShareServiceRef.current) return;

    setError(null);

    try {
      await screenShareServiceRef.current.stopScreenSharing();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to stop screen sharing';
      setError(errorMsg);
      throw err;
    }
  }, []);

  // Toggle screen share (simplified)
  const toggleScreenShare = useCallback(async (): Promise<void> => {
    if (isSharing) {
      await stopScreenSharing();
    } else {
      // Start with screen selection
      const sources = await startSourceSelection();
      if (sources.length === 1) {
        // If only one source available, use it directly
        await selectAndStartSharing(sources[0]);
      }
      // Otherwise, user needs to select from UI
    }
  }, [isSharing, stopScreenSharing, startSourceSelection, selectAndStartSharing]);

  // Viewer controls
  const focusTrackAction = useCallback((trackSid: string): void => {
    if (screenShareServiceRef.current) {
      screenShareServiceRef.current.focusTrack(trackSid);
    }
  }, []);

  const setZoomLevelAction = useCallback((level: number): void => {
    if (screenShareServiceRef.current) {
      screenShareServiceRef.current.setZoomLevel(level);
    }
  }, []);

  const toggleViewerFullscreen = useCallback(async (element?: HTMLElement): Promise<void> => {
    if (screenShareServiceRef.current) {
      await screenShareServiceRef.current.toggleFullscreen(element);
    }
  }, []);

  const zoomIn = useCallback((): void => {
    const newZoom = Math.min(3, viewerZoomLevel + 0.25);
    setZoomLevelAction(newZoom);
  }, [viewerZoomLevel, setZoomLevelAction]);

  const zoomOut = useCallback((): void => {
    const newZoom = Math.max(0.5, viewerZoomLevel - 0.25);
    setZoomLevelAction(newZoom);
  }, [viewerZoomLevel, setZoomLevelAction]);

  const resetZoom = useCallback((): void => {
    setZoomLevelAction(1);
  }, [setZoomLevelAction]);

  // Utility functions
  const getTrackForParticipant = useCallback((identity: string): ScreenShareTrackInfo | null => {
    if (!screenShareServiceRef.current) return null;
    return screenShareServiceRef.current.getTrackForParticipant(identity);
  }, []);

  const isParticipantSharing = useCallback((identity: string): boolean => {
    return getTrackForParticipant(identity) !== null;
  }, [getTrackForParticipant]);

  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  return {
    // State
    isSharing,
    isSelectingSource,
    availableSources,
    selectedSource,
    activeTracks,
    hasActiveShares,
    
    // Viewer state
    isViewerFullscreen,
    viewerZoomLevel,
    focusedTrack,
    
    // Actions
    startSourceSelection,
    cancelSourceSelection,
    selectAndStartSharing,
    stopScreenSharing,
    toggleScreenShare,
    
    // Viewer actions
    focusTrack: focusTrackAction,
    setZoomLevel: setZoomLevelAction,
    toggleViewerFullscreen,
    zoomIn,
    zoomOut,
    resetZoom,
    
    // Utilities
    getTrackForParticipant,
    isParticipantSharing,
    
    // Error state
    error,
    clearError,
  };
}

export default useScreenShare;