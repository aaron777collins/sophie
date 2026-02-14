'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { X, User, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScreenShare } from '@/hooks/use-screenshare';
import { ScreenShareTrackInfo } from '@/services/screenshare';
import { ScreenShareControls } from './screenshare-controls';

interface ScreenShareViewerProps {
  /** Track to display in the viewer */
  track: ScreenShareTrackInfo;
  /** Whether viewer is in fullscreen mode */
  isFullscreen?: boolean;
  /** Whether to show controls overlay */
  showControls?: boolean;
  /** Whether viewer can be closed */
  closeable?: boolean;
  /** Callback when viewer is closed */
  onClose?: () => void;
  /** Callback when fullscreen is toggled */
  onFullscreenToggle?: () => void;
  /** Custom className */
  className?: string;
}

export function ScreenShareViewer({
  track,
  isFullscreen = false,
  showControls = true,
  closeable = true,
  onClose,
  onFullscreenToggle,
  className = '',
}: ScreenShareViewerProps) {
  const {
    viewerZoomLevel,
    isViewerFullscreen,
    focusTrack,
    toggleViewerFullscreen,
  } = useScreenShare();

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showControlsOverlay, setShowControlsOverlay] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);

  // Focus this track when component mounts
  useEffect(() => {
    focusTrack(track.trackSid);
  }, [track.trackSid, focusTrack]);

  // Attach video track to video element
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !track.track) return;

    const attachTrack = () => {
      try {
        if ('attach' in track.track) {
          track.track.attach(videoElement);
        } else {
          // For Remote tracks, attach directly
          videoElement.srcObject = new MediaStream([track.track.mediaStreamTrack]);
        }
        setHasError(false);
      } catch (err) {
        console.error('Failed to attach screen share track:', err);
        setHasError(true);
      }
    };

    const detachTrack = () => {
      try {
        if ('detach' in track.track && typeof track.track.detach === 'function') {
          track.track.detach(videoElement);
        } else {
          videoElement.srcObject = null;
        }
      } catch (err) {
        console.error('Failed to detach screen share track:', err);
      }
    };

    attachTrack();

    return () => {
      detachTrack();
    };
  }, [track.track]);

  // Handle video events
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleLoadedMetadata = () => {
      setIsLoading(false);
    };

    const handleError = () => {
      setIsLoading(false);
      setHasError(true);
    };

    const handleLoadStart = () => {
      setIsLoading(true);
      setHasError(false);
    };

    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('error', handleError);
    videoElement.addEventListener('loadstart', handleLoadStart);

    return () => {
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.removeEventListener('error', handleError);
      videoElement.removeEventListener('loadstart', handleLoadStart);
    };
  }, []);

  // Handle mouse movement for controls auto-hide
  const handleMouseMove = useCallback(() => {
    if (!showControls) return;

    setShowControlsOverlay(true);
    
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }

    const timeout = setTimeout(() => {
      setShowControlsOverlay(false);
    }, 3000);
    
    setControlsTimeout(timeout);
  }, [showControls, controlsTimeout]);

  // Handle mouse leave to hide controls immediately in fullscreen
  const handleMouseLeave = useCallback(() => {
    if (isViewerFullscreen && showControls) {
      setShowControlsOverlay(false);
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
    }
  }, [isViewerFullscreen, showControls, controlsTimeout]);

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isViewerFullscreen) {
        toggleViewerFullscreen();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isViewerFullscreen, toggleViewerFullscreen]);

  // Handle fullscreen toggle
  const handleFullscreenToggle = useCallback(async () => {
    if (containerRef.current) {
      await toggleViewerFullscreen(containerRef.current);
    }
    onFullscreenToggle?.();
  }, [toggleViewerFullscreen, onFullscreenToggle]);

  // Clean up timeouts
  useEffect(() => {
    return () => {
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
    };
  }, [controlsTimeout]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative bg-black rounded-lg overflow-hidden',
        isViewerFullscreen ? 'w-screen h-screen' : 'w-full h-full',
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        className={cn(
          'w-full h-full object-contain transition-transform duration-200',
          `scale-${Math.floor(viewerZoomLevel * 100)}`
        )}
        style={{
          transform: `scale(${viewerZoomLevel})`,
        }}
        autoPlay
        playsInline
        muted
        aria-label={`Screen share from ${track.participant.name}`}
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-2" />
            <p className="text-sm text-white/70">Loading screen share...</p>
          </div>
        </div>
      )}

      {/* Error overlay */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <X className="w-6 h-6 text-red-400" />
            </div>
            <p className="text-sm text-white mb-2">Failed to load screen share</p>
            <p className="text-xs text-white/70">The stream may have ended or there was a connection error</p>
          </div>
        </div>
      )}

      {/* Controls overlay */}
      {showControls && (
        <div className={cn(
          'absolute inset-0 pointer-events-none transition-opacity duration-300',
          showControlsOverlay ? 'opacity-100' : 'opacity-0'
        )}>
          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/50 to-transparent p-4 pointer-events-auto">
            <div className="flex items-center justify-between">
              {/* Participant info */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#3c3f45] rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    {track.participant.name}
                  </p>
                  <p className="text-xs text-white/70">
                    {track.isLocal ? 'Your screen' : 'Sharing screen'}
                  </p>
                </div>
              </div>

              {/* Top controls */}
              <div className="flex items-center gap-2">
                {/* Fullscreen toggle */}
                <button
                  onClick={handleFullscreenToggle}
                  className="w-8 h-8 rounded-lg bg-black/20 backdrop-blur-sm hover:bg-black/40 transition-colors flex items-center justify-center"
                  title={isViewerFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                >
                  {isViewerFullscreen ? (
                    <Minimize2 className="w-4 h-4 text-white" />
                  ) : (
                    <Maximize2 className="w-4 h-4 text-white" />
                  )}
                </button>

                {/* Close button */}
                {closeable && onClose && (
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-lg bg-black/20 backdrop-blur-sm hover:bg-red-500/50 transition-colors flex items-center justify-center"
                    title="Close viewer"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Bottom controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4 pointer-events-auto">
            <ScreenShareControls
              trackId={track.trackSid}
              showBackground={false}
              size={isViewerFullscreen ? 'lg' : 'md'}
            />
          </div>
        </div>
      )}

      {/* Dimensions info */}
      {track.dimensions && (
        <div className="absolute top-4 right-4 px-2 py-1 bg-black/30 rounded text-xs text-white/70">
          {track.dimensions.width} × {track.dimensions.height}
        </div>
      )}
    </div>
  );
}

export default ScreenShareViewer;