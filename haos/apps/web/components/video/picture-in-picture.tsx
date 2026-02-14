'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { X, Minimize2, Maximize2, RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import VideoTile, { VideoGridParticipant } from './video-tile';

export interface PictureInPictureProps {
  /** Whether PiP is currently active */
  isActive: boolean;
  /** Participant to show in PiP mode */
  participant?: VideoGridParticipant;
  /** Initial position */
  initialPosition?: {
    x: number;
    y: number;
  };
  /** Size preset */
  size?: 'small' | 'medium' | 'large';
  /** Whether PiP window is draggable */
  draggable?: boolean;
  /** Whether PiP window is resizable */
  resizable?: boolean;
  /** Custom CSS classes */
  className?: string;
  
  // Callbacks
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onParticipantClick?: (identity: string) => void;
  onPositionChange?: (position: { x: number; y: number }) => void;
  onSizeChange?: (size: 'small' | 'medium' | 'large') => void;
}

const SIZE_PRESETS = {
  small: { width: 200, height: 150 },
  medium: { width: 300, height: 225 },
  large: { width: 400, height: 300 },
};

const EDGE_SNAP_THRESHOLD = 20; // pixels

export const PictureInPicture: React.FC<PictureInPictureProps> = ({
  isActive,
  participant,
  initialPosition = { x: typeof window !== 'undefined' ? window.innerWidth - 320 : 300, y: 20 },
  size = 'medium',
  draggable = true,
  resizable = true,
  className,
  onClose,
  onMinimize,
  onMaximize,
  onParticipantClick,
  onPositionChange,
  onSizeChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(initialPosition);
  const [currentSize, setCurrentSize] = useState(size);
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Update position when prop changes
  useEffect(() => {
    setPosition(initialPosition);
  }, [initialPosition.x, initialPosition.y]);

  // Handle window resize - keep PiP within bounds
  useEffect(() => {
    const handleResize = () => {
      if (!isActive || typeof window === 'undefined') return;

      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const maxX = window.innerWidth - rect.width;
      const maxY = window.innerHeight - rect.height;

      setPosition(prev => ({
        x: Math.min(Math.max(0, prev.x), maxX),
        y: Math.min(Math.max(0, prev.y), maxY),
      }));
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [isActive]);

  // Snap to edges
  const snapToEdges = useCallback((pos: { x: number; y: number }) => {
    if (typeof window === 'undefined') return pos;

    const container = containerRef.current;
    if (!container) return pos;

    const rect = container.getBoundingClientRect();
    const { x, y } = pos;
    let snappedX = x;
    let snappedY = y;

    // Snap to left/right edges
    if (x < EDGE_SNAP_THRESHOLD) {
      snappedX = 0;
    } else if (x > window.innerWidth - rect.width - EDGE_SNAP_THRESHOLD) {
      snappedX = window.innerWidth - rect.width;
    }

    // Snap to top/bottom edges
    if (y < EDGE_SNAP_THRESHOLD) {
      snappedY = 0;
    } else if (y > window.innerHeight - rect.height - EDGE_SNAP_THRESHOLD) {
      snappedY = window.innerHeight - rect.height;
    }

    return { x: snappedX, y: snappedY };
  }, []);

  // Handle drag start
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!draggable || isMinimized) return;
    
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  }, [draggable, isMinimized, position]);

  // Handle drag move
  useEffect(() => {
    if (!isDragging || typeof window === 'undefined') return;

    const handleMouseMove = (e: MouseEvent) => {
      const newPosition = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      };

      // Keep within bounds
      const container = containerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        newPosition.x = Math.min(Math.max(0, newPosition.x), window.innerWidth - rect.width);
        newPosition.y = Math.min(Math.max(0, newPosition.y), window.innerHeight - rect.height);
      }

      setPosition(newPosition);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      
      // Snap to edges on release
      const snappedPosition = snapToEdges(position);
      setPosition(snappedPosition);
      onPositionChange?.(snappedPosition);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, position, snapToEdges, onPositionChange]);

  // Handle minimize
  const handleMinimize = () => {
    setIsMinimized(true);
    onMinimize?.();
  };

  // Handle maximize/restore
  const handleMaximize = () => {
    if (isMinimized) {
      setIsMinimized(false);
    }
    onMaximize?.();
  };

  // Handle size change
  const handleSizeChange = () => {
    const sizes: Array<'small' | 'medium' | 'large'> = ['small', 'medium', 'large'];
    const currentIndex = sizes.indexOf(currentSize);
    const nextSize = sizes[(currentIndex + 1) % sizes.length] || 'medium';
    
    setCurrentSize(nextSize);
    onSizeChange?.(nextSize);
  };

  if (!isActive || !participant) {
    return null;
  }

  const dimensions = SIZE_PRESETS[currentSize];

  return (
    <>
      {/* Backdrop overlay when dragging */}
      {isDragging && (
        <div className="fixed inset-0 z-40 bg-black/10 pointer-events-none" />
      )}

      {/* PiP Container */}
      <div
        ref={containerRef}
        className={cn(
          'fixed z-50 bg-[#2f3136] rounded-lg shadow-2xl border border-gray-600 transition-all duration-200',
          isDragging ? 'cursor-grabbing shadow-3xl scale-105' : 'cursor-grab',
          isMinimized && 'transform scale-75 opacity-75',
          className
        )}
        style={{
          left: position.x,
          top: position.y,
          width: dimensions.width,
          height: isMinimized ? 40 : dimensions.height,
        }}
      >
        {/* Header */}
        <div
          className={cn(
            'flex items-center justify-between p-2 bg-[#36393f] rounded-t-lg cursor-grab',
            isDragging && 'cursor-grabbing'
          )}
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-white text-sm font-medium truncate">
              {participant.name}
            </span>
            {participant.isSpeaking && (
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            )}
          </div>

          <div className="flex items-center gap-1">
            {/* Size toggle */}
            {resizable && !isMinimized && (
              <button
                onClick={handleSizeChange}
                className="p-1 hover:bg-gray-600 rounded text-gray-400 hover:text-white transition-colors"
                title="Resize"
              >
                <RotateCw className="w-3 h-3" />
              </button>
            )}

            {/* Minimize/Maximize */}
            <button
              onClick={isMinimized ? handleMaximize : handleMinimize}
              className="p-1 hover:bg-gray-600 rounded text-gray-400 hover:text-white transition-colors"
              title={isMinimized ? 'Restore' : 'Minimize'}
            >
              {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1 hover:bg-red-600 rounded text-gray-400 hover:text-white transition-colors"
              title="Close Picture-in-Picture"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Video Content */}
        {!isMinimized && (
          <div className="relative">
            <VideoTile
              participant={participant}
              size="medium"
              className="rounded-b-lg border-0"
              onClick={() => onParticipantClick?.(participant.identity)}
              onDoubleClick={handleMaximize}
            />

            {/* Resize handle */}
            {resizable && (
              <div className="absolute bottom-0 right-0 w-4 h-4 cursor-nw-resize">
                <div className="absolute bottom-1 right-1 w-0 h-0 border-l-4 border-l-transparent border-b-4 border-b-gray-500" />
              </div>
            )}
          </div>
        )}

        {/* Minimized state */}
        {isMinimized && (
          <div className="px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#5865f2] flex items-center justify-center text-white text-xs font-semibold">
                {participant.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-white text-sm">{participant.name}</span>
            </div>
            
            <button
              onClick={handleMaximize}
              className="text-gray-400 hover:text-white transition-colors"
              title="Restore"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default PictureInPicture;