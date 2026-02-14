'use client';

import React, { useCallback } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Minimize2,
  Move,
  Monitor,
  Download,
  Copy
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScreenShare } from '@/hooks/use-screenshare';

interface ScreenShareControlsProps {
  /** Track ID to control */
  trackId?: string;
  /** Show background/border */
  showBackground?: boolean;
  /** Control size */
  size?: 'sm' | 'md' | 'lg';
  /** Custom className */
  className?: string;
  /** Position */
  position?: 'center' | 'left' | 'right';
  /** Orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Disabled state */
  disabled?: boolean;
}

export function ScreenShareControls({
  trackId,
  showBackground = true,
  size = 'md',
  className = '',
  position = 'center',
  orientation = 'horizontal',
  disabled = false,
}: ScreenShareControlsProps) {
  const {
    viewerZoomLevel,
    isViewerFullscreen,
    zoomIn,
    zoomOut,
    resetZoom,
    toggleViewerFullscreen,
    activeTracks,
  } = useScreenShare();

  // Find the track if trackId is provided
  const track = trackId ? activeTracks.find(t => t.trackSid === trackId) : activeTracks[0];

  const handleZoomIn = useCallback(() => {
    if (!disabled) zoomIn();
  }, [disabled, zoomIn]);

  const handleZoomOut = useCallback(() => {
    if (!disabled) zoomOut();
  }, [disabled, zoomOut]);

  const handleResetZoom = useCallback(() => {
    if (!disabled) resetZoom();
  }, [disabled, resetZoom]);

  const handleFullscreenToggle = useCallback(async () => {
    if (!disabled) {
      await toggleViewerFullscreen();
    }
  }, [disabled, toggleViewerFullscreen]);

  const handleDownload = useCallback(async () => {
    if (!track?.track || disabled) return;

    try {
      // Create a canvas to capture the current frame
      const video = document.querySelector(`video[data-track-id="${track.trackSid}"]`) as HTMLVideoElement;
      if (!video) return;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      // Download as PNG
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `screenshare-${track.participant.name}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download screenshot:', err);
    }
  }, [track, disabled]);

  const handleCopyToClipboard = useCallback(async () => {
    if (!track?.track || disabled) return;

    try {
      const video = document.querySelector(`video[data-track-id="${track.trackSid}"]`) as HTMLVideoElement;
      if (!video) return;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      // Copy to clipboard
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) return;

      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  }, [track, disabled]);

  // Get size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'gap-1 p-2',
          button: 'w-6 h-6',
          icon: 'w-3 h-3',
        };
      case 'lg':
        return {
          container: 'gap-3 p-4',
          button: 'w-10 h-10',
          icon: 'w-5 h-5',
        };
      default:
        return {
          container: 'gap-2 p-3',
          button: 'w-8 h-8',
          icon: 'w-4 h-4',
        };
    }
  };

  const sizeClasses = getSizeClasses();

  // Get position classes
  const getPositionClasses = () => {
    if (orientation === 'vertical') {
      return 'flex-col';
    }
    
    switch (position) {
      case 'left':
        return 'flex-row justify-start';
      case 'right':
        return 'flex-row justify-end';
      default:
        return 'flex-row justify-center';
    }
  };

  const ControlButton = ({ 
    onClick, 
    icon: Icon, 
    tooltip, 
    isActive = false,
    variant = 'default'
  }: { 
    onClick: () => void;
    icon: React.ComponentType<{ className?: string }>;
    tooltip: string;
    isActive?: boolean;
    variant?: 'default' | 'danger' | 'success';
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        sizeClasses.button,
        'rounded-lg transition-all duration-200 flex items-center justify-center',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent',
        disabled && 'opacity-50 cursor-not-allowed',
        variant === 'danger' && 'hover:bg-red-500/20 focus:ring-red-400',
        variant === 'success' && 'hover:bg-green-500/20 focus:ring-green-400',
        variant === 'default' && 'hover:bg-white/10 focus:ring-white/20',
        isActive && 'bg-blue-500/20 text-blue-400',
        !isActive && 'text-white/70 hover:text-white'
      )}
      title={tooltip}
      aria-label={tooltip}
    >
      <Icon className={sizeClasses.icon} />
    </button>
  );

  if (!track && trackId) {
    return null; // Track not found
  }

  const zoomPercent = Math.round(viewerZoomLevel * 100);
  const canZoomIn = viewerZoomLevel < 3;
  const canZoomOut = viewerZoomLevel > 0.5;

  return (
    <div className={cn(
      'flex items-center',
      getPositionClasses(),
      sizeClasses.container,
      showBackground && cn(
        'bg-black/40 backdrop-blur-sm rounded-lg border border-white/10',
        'shadow-lg shadow-black/20'
      ),
      className
    )}>
      {/* Zoom out */}
      <ControlButton
        onClick={handleZoomOut}
        icon={ZoomOut}
        tooltip={`Zoom out (${zoomPercent}%)`}
        isActive={!canZoomOut}
      />

      {/* Zoom level indicator */}
      <div className={cn(
        'flex items-center justify-center text-xs font-medium text-white/70 min-w-[3rem]',
        size === 'sm' ? 'min-w-[2.5rem]' : size === 'lg' ? 'min-w-[3.5rem]' : 'min-w-[3rem]'
      )}>
        {zoomPercent}%
      </div>

      {/* Zoom in */}
      <ControlButton
        onClick={handleZoomIn}
        icon={ZoomIn}
        tooltip={`Zoom in (${zoomPercent}%)`}
        isActive={!canZoomIn}
      />

      {/* Reset zoom */}
      <ControlButton
        onClick={handleResetZoom}
        icon={RotateCcw}
        tooltip="Reset zoom (100%)"
        isActive={viewerZoomLevel === 1}
      />

      {/* Separator */}
      {orientation === 'horizontal' ? (
        <div className="w-px h-4 bg-white/10 mx-1" />
      ) : (
        <div className="h-px w-4 bg-white/10 my-1" />
      )}

      {/* Fullscreen toggle */}
      <ControlButton
        onClick={handleFullscreenToggle}
        icon={isViewerFullscreen ? Minimize2 : Maximize2}
        tooltip={isViewerFullscreen ? 'Exit fullscreen (Esc)' : 'Enter fullscreen (F)'}
        isActive={isViewerFullscreen}
      />

      {/* Additional controls for larger sizes */}
      {size !== 'sm' && (
        <>
          {/* Separator */}
          {orientation === 'horizontal' ? (
            <div className="w-px h-4 bg-white/10 mx-1" />
          ) : (
            <div className="h-px w-4 bg-white/10 my-1" />
          )}

          {/* Download screenshot */}
          <ControlButton
            onClick={handleDownload}
            icon={Download}
            tooltip="Download screenshot"
          />

          {/* Copy to clipboard */}
          {navigator.clipboard && (
            <ControlButton
              onClick={handleCopyToClipboard}
              icon={Copy}
              tooltip="Copy to clipboard"
            />
          )}
        </>
      )}

      {/* Track indicator */}
      {size === 'lg' && track && (
        <>
          {orientation === 'horizontal' ? (
            <div className="w-px h-4 bg-white/10 mx-1" />
          ) : (
            <div className="h-px w-4 bg-white/10 my-1" />
          )}
          
          <div className="flex items-center gap-2 px-2">
            <Monitor className="w-3 h-3 text-white/50" />
            <span className="text-xs text-white/70 truncate max-w-20">
              {track.participant.name}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

export default ScreenShareControls;