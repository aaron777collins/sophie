import React, { useMemo, useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { VideoTile } from './video-tile';
import { VideoParticipant } from '../../services/video-call';

export interface VideoGridProps {
  participants: VideoParticipant[];
  localParticipantId?: string;
  className?: string;
  maxParticipantsVisible?: number;
  aspectRatio?: 'auto' | '16:9' | '4:3' | '1:1';
  gap?: number;
  showNames?: boolean;
  showAudioIndicators?: boolean;
  onParticipantClick?: (participant: VideoParticipant) => void;
  onParticipantDoubleClick?: (participant: VideoParticipant) => void;
}

interface GridLayout {
  columns: number;
  rows: number;
  tileWidth: number;
  tileHeight: number;
}

/**
 * Calculate optimal grid layout based on participant count and container size
 */
function calculateGridLayout(
  participantCount: number,
  containerWidth: number,
  containerHeight: number,
  aspectRatio: string,
  gap: number
): GridLayout {
  if (participantCount === 0) {
    return { columns: 1, rows: 1, tileWidth: 0, tileHeight: 0 };
  }

  // Single participant takes full space
  if (participantCount === 1) {
    return {
      columns: 1,
      rows: 1,
      tileWidth: containerWidth - gap * 2,
      tileHeight: containerHeight - gap * 2
    };
  }

  // Calculate aspect ratio
  let targetAspectRatio = 16 / 9; // Default
  switch (aspectRatio) {
    case '4:3':
      targetAspectRatio = 4 / 3;
      break;
    case '1:1':
      targetAspectRatio = 1;
      break;
    case '16:9':
      targetAspectRatio = 16 / 9;
      break;
    case 'auto':
      // Use container aspect ratio
      targetAspectRatio = containerWidth / containerHeight;
      break;
  }

  let bestLayout: GridLayout = { columns: 1, rows: participantCount, tileWidth: 0, tileHeight: 0 };
  let maxTileArea = 0;

  // Try different grid configurations
  for (let cols = 1; cols <= participantCount; cols++) {
    const rows = Math.ceil(participantCount / cols);
    
    // Calculate available space per tile
    const availableWidth = (containerWidth - gap * (cols + 1)) / cols;
    const availableHeight = (containerHeight - gap * (rows + 1)) / rows;
    
    // Calculate tile dimensions maintaining aspect ratio
    let tileWidth = availableWidth;
    let tileHeight = availableWidth / targetAspectRatio;
    
    // If height is too large, constrain by height
    if (tileHeight > availableHeight) {
      tileHeight = availableHeight;
      tileWidth = tileHeight * targetAspectRatio;
    }
    
    // Ensure minimum size
    if (tileWidth < 100 || tileHeight < 75) {
      continue;
    }
    
    const tileArea = tileWidth * tileHeight;
    
    // Check if this layout is better (larger tiles)
    if (tileArea > maxTileArea) {
      maxTileArea = tileArea;
      bestLayout = { columns: cols, rows, tileWidth, tileHeight };
    }
  }

  return bestLayout;
}

/**
 * VideoGrid component that automatically arranges video tiles in an optimal grid layout
 */
export const VideoGrid: React.FC<VideoGridProps> = ({
  participants,
  localParticipantId,
  className,
  maxParticipantsVisible = 16,
  aspectRatio = '16:9',
  gap = 8,
  showNames = true,
  showAudioIndicators = true,
  onParticipantClick,
  onParticipantDoubleClick
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Filter and sort participants
  const displayedParticipants = useMemo(() => {
    // Limit participants if specified
    let filtered = participants.slice(0, maxParticipantsVisible);
    
    // Sort to put local participant first
    if (localParticipantId) {
      filtered.sort((a, b) => {
        if (a.id === localParticipantId) return -1;
        if (b.id === localParticipantId) return 1;
        return 0;
      });
    }
    
    return filtered;
  }, [participants, localParticipantId, maxParticipantsVisible]);

  // Calculate grid layout
  const gridLayout = useMemo(() => {
    return calculateGridLayout(
      displayedParticipants.length,
      containerSize.width,
      containerSize.height,
      aspectRatio,
      gap
    );
  }, [displayedParticipants.length, containerSize, aspectRatio, gap]);

  // Update container size on resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };

    updateSize();

    // Use ResizeObserver if available, otherwise fallback to window resize
    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(updateSize);
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }
      return () => resizeObserver.disconnect();
    } else {
      window.addEventListener('resize', updateSize);
      return () => window.removeEventListener('resize', updateSize);
    }
  }, []);

  // Generate grid items
  const gridItems = useMemo(() => {
    if (displayedParticipants.length === 0) {
      return [];
    }

    return displayedParticipants.map((participant, index) => {
      const row = Math.floor(index / gridLayout.columns);
      const col = index % gridLayout.columns;
      
      // Calculate position
      const x = gap + col * (gridLayout.tileWidth + gap);
      const y = gap + row * (gridLayout.tileHeight + gap);
      
      const isLocal = participant.id === localParticipantId;

      return (
        <div
          key={participant.id}
          className="absolute transition-all duration-300 ease-out"
          style={{
            left: x,
            top: y,
            width: gridLayout.tileWidth,
            height: gridLayout.tileHeight
          }}
        >
          <VideoTile
            participant={participant}
            isLocal={isLocal}
            showName={showNames}
            showAudioIndicator={showAudioIndicators}
            onClick={onParticipantClick}
            onDoubleClick={onParticipantDoubleClick}
            className="w-full h-full"
          />
        </div>
      );
    });
  }, [
    displayedParticipants,
    gridLayout,
    gap,
    localParticipantId,
    showNames,
    showAudioIndicators,
    onParticipantClick,
    onParticipantDoubleClick
  ]);

  // Handle empty state
  if (displayedParticipants.length === 0) {
    return (
      <div
        ref={containerRef}
        className={cn(
          'relative w-full h-full flex items-center justify-center',
          'bg-zinc-900/20 rounded-lg border-2 border-dashed border-zinc-700',
          className
        )}
      >
        <div className="text-center text-zinc-400">
          <div className="text-4xl mb-2">📹</div>
          <div className="text-lg font-medium">No participants</div>
          <div className="text-sm text-zinc-500">Waiting for others to join...</div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full h-full bg-zinc-900/10 rounded-lg overflow-hidden',
        className
      )}
      style={{
        minHeight: '400px' // Ensure minimum height for layout calculations
      }}
    >
      {gridItems}
      
      {/* Participant count indicator */}
      {displayedParticipants.length < participants.length && (
        <div className="absolute top-2 right-2 bg-zinc-900/80 text-white text-xs px-2 py-1 rounded-md">
          +{participants.length - displayedParticipants.length} more
        </div>
      )}
    </div>
  );
};

/**
 * Hook for managing video grid state
 */
export function useVideoGrid(participants: VideoParticipant[]) {
  const [selectedParticipant, setSelectedParticipant] = useState<VideoParticipant | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleParticipantClick = useMemo(
    () => (participant: VideoParticipant) => {
      setSelectedParticipant(participant);
    },
    []
  );

  const handleParticipantDoubleClick = useMemo(
    () => (participant: VideoParticipant) => {
      setSelectedParticipant(participant);
      setIsFullscreen(true);
    },
    []
  );

  const clearSelection = useMemo(
    () => () => {
      setSelectedParticipant(null);
      setIsFullscreen(false);
    },
    []
  );

  const toggleFullscreen = useMemo(
    () => () => {
      setIsFullscreen(!isFullscreen);
    },
    [isFullscreen]
  );

  return {
    selectedParticipant,
    isFullscreen,
    handleParticipantClick,
    handleParticipantDoubleClick,
    clearSelection,
    toggleFullscreen,
    setSelectedParticipant
  };
}

export default VideoGrid;