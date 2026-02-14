'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import VideoTile, { VideoGridParticipant } from './video-tile';

export interface VideoGridProps {
  /** Array of participants with video data */
  participants: VideoGridParticipant[];
  /** Layout mode */
  layout?: 'grid' | 'speaker' | 'fullscreen';
  /** Currently pinned participant identity */
  pinnedParticipant?: string | null;
  /** Maximum number of participants to show in grid */
  maxParticipants?: number;
  /** Whether to show local participant */
  showLocalParticipant?: boolean;
  /** Custom CSS classes */
  className?: string;
  /** Callback when participant is clicked (for pinning) */
  onParticipantClick?: (identity: string) => void;
  /** Callback when participant is double-clicked (for fullscreen) */
  onParticipantDoubleClick?: (identity: string) => void;
  /** Callback when grid layout changes */
  onLayoutChange?: (layout: 'grid' | 'speaker' | 'fullscreen') => void;
}

interface GridDimensions {
  rows: number;
  cols: number;
  aspectRatio: string;
}

/**
 * Calculate optimal grid dimensions for a given number of participants
 */
function calculateGridDimensions(participantCount: number): GridDimensions {
  if (participantCount === 0) {
    return { rows: 1, cols: 1, aspectRatio: 'aspect-video' };
  }

  if (participantCount === 1) {
    return { rows: 1, cols: 1, aspectRatio: 'aspect-video' };
  }

  if (participantCount === 2) {
    return { rows: 1, cols: 2, aspectRatio: 'aspect-video' };
  }

  if (participantCount <= 4) {
    return { rows: 2, cols: 2, aspectRatio: 'aspect-video' };
  }

  if (participantCount <= 6) {
    return { rows: 2, cols: 3, aspectRatio: 'aspect-video' };
  }

  if (participantCount <= 9) {
    return { rows: 3, cols: 3, aspectRatio: 'aspect-video' };
  }

  if (participantCount <= 12) {
    return { rows: 3, cols: 4, aspectRatio: 'aspect-video' };
  }

  // Maximum 16 participants (4x4 grid)
  return { rows: 4, cols: 4, aspectRatio: 'aspect-video' };
}

/**
 * Sort participants by priority (pinned, local, speaking, then alphabetical)
 */
function sortParticipants(
  participants: VideoGridParticipant[],
  pinnedParticipant?: string | null
): VideoGridParticipant[] {
  return [...participants].sort((a, b) => {
    // Pinned participant first
    if (pinnedParticipant === a.identity) return -1;
    if (pinnedParticipant === b.identity) return 1;

    // Local participant second
    if (a.isLocal && !b.isLocal) return -1;
    if (b.isLocal && !a.isLocal) return 1;

    // Screen sharing participants next
    if (a.hasScreenShare && !b.hasScreenShare) return -1;
    if (b.hasScreenShare && !a.hasScreenShare) return 1;

    // Speaking participants next
    if (a.isSpeaking && !b.isSpeaking) return -1;
    if (b.isSpeaking && !a.isSpeaking) return 1;

    // Finally, alphabetical by name
    return a.name.localeCompare(b.name);
  });
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  participants,
  layout = 'grid',
  pinnedParticipant,
  maxParticipants = 16,
  showLocalParticipant = true,
  className,
  onParticipantClick,
  onParticipantDoubleClick,
  onLayoutChange,
}) => {
  // Filter and sort participants
  const sortedParticipants = useMemo(() => {
    let filtered = participants;
    
    // Filter out local participant if not showing
    if (!showLocalParticipant) {
      filtered = filtered.filter(p => !p.isLocal);
    }

    // Limit to max participants
    if (filtered.length > maxParticipants) {
      filtered = filtered.slice(0, maxParticipants);
    }

    return sortParticipants(filtered, pinnedParticipant);
  }, [participants, showLocalParticipant, maxParticipants, pinnedParticipant]);

  // Calculate grid dimensions
  const gridDimensions = useMemo(() => {
    return calculateGridDimensions(sortedParticipants.length);
  }, [sortedParticipants.length]);

  // Handle participant interactions
  const handleParticipantClick = (identity: string) => {
    onParticipantClick?.(identity);
  };

  const handleParticipantDoubleClick = (identity: string) => {
    onParticipantDoubleClick?.(identity);
  };

  // Speaker view - show pinned participant large, others small
  if (layout === 'speaker' && pinnedParticipant) {
    const pinned = sortedParticipants.find(p => p.identity === pinnedParticipant);
    const others = sortedParticipants.filter(p => p.identity !== pinnedParticipant).slice(0, 6); // Max 6 others

    return (
      <div className={cn('flex flex-col h-full gap-4', className)}>
        {/* Main Speaker */}
        <div className="flex-1 min-h-0">
          {pinned && (
            <VideoTile
              participant={{ ...pinned, isPinned: true }}
              size="large"
              className="w-full h-full"
              onClick={() => handleParticipantClick(pinned.identity)}
              onDoubleClick={() => handleParticipantDoubleClick(pinned.identity)}
            />
          )}
        </div>

        {/* Other Participants */}
        {others.length > 0 && (
          <div className="flex gap-2 h-24 overflow-x-auto">
            {others.map((participant) => (
              <VideoTile
                key={participant.identity}
                participant={{ ...participant, isPinned: false }}
                size="small"
                className="w-32 h-24 flex-shrink-0"
                onClick={() => handleParticipantClick(participant.identity)}
                onDoubleClick={() => handleParticipantDoubleClick(participant.identity)}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Fullscreen view - show only pinned participant
  if (layout === 'fullscreen' && pinnedParticipant) {
    const pinned = sortedParticipants.find(p => p.identity === pinnedParticipant);
    
    return (
      <div className={cn('h-full w-full', className)}>
        {pinned && (
          <VideoTile
            participant={{ ...pinned, isPinned: true }}
            size="large"
            className="w-full h-full"
            onClick={() => handleParticipantClick(pinned.identity)}
            onDoubleClick={() => handleParticipantDoubleClick(pinned.identity)}
          />
        )}
      </div>
    );
  }

  // Empty state
  if (sortedParticipants.length === 0) {
    return (
      <div className={cn('flex items-center justify-center h-full bg-[#36393f] rounded-lg', className)}>
        <div className="text-center text-gray-400">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#2f3136] flex items-center justify-center">
            <span className="text-2xl">👥</span>
          </div>
          <p className="text-lg font-medium">No participants</p>
          <p className="text-sm">Waiting for others to join the call...</p>
        </div>
      </div>
    );
  }

  // Grid layout - auto-sizing grid
  const gridTemplateColumns = `repeat(${gridDimensions.cols}, 1fr)`;
  const gridTemplateRows = `repeat(${gridDimensions.rows}, 1fr)`;

  return (
    <div 
      className={cn(
        'grid gap-2 h-full w-full p-4',
        className
      )}
      style={{
        gridTemplateColumns,
        gridTemplateRows,
      }}
    >
      {sortedParticipants.map((participant, index) => (
        <VideoTile
          key={participant.identity}
          participant={{ ...participant, isPinned: participant.identity === pinnedParticipant }}
          size="medium"
          onClick={() => handleParticipantClick(participant.identity)}
          onDoubleClick={() => handleParticipantDoubleClick(participant.identity)}
          className={cn(
            'min-h-0 min-w-0',
            // Special sizing for single participant
            sortedParticipants.length === 1 && 'max-w-2xl max-h-xl mx-auto my-auto'
          )}
        />
      ))}

      {/* Fill empty grid cells with placeholders if needed */}
      {Array.from({ length: Math.max(0, (gridDimensions.rows * gridDimensions.cols) - sortedParticipants.length) }).map((_, index) => (
        <div
          key={`empty-${index}`}
          className="aspect-video bg-[#2f3136] rounded-lg border-2 border-gray-600 border-dashed flex items-center justify-center opacity-50"
        >
          <span className="text-gray-500 text-sm">Empty</span>
        </div>
      ))}
    </div>
  );
};

export default VideoGrid;