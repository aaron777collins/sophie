/**
 * Video Grid Component  
 * Adaptive layout: 1x1, 2x2, 3x3 based on participant count with responsive design
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { RTCParticipant } from '../../lib/matrix/rtc/types';

interface VideoGridProps {
  participants: RTCParticipant[];
  localStream?: MediaStream | null;
  onParticipantClick?: (participant: RTCParticipant) => void;
  className?: string;
  style?: React.CSSProperties;
}

interface GridLayout {
  rows: number;
  cols: number;
  maxParticipants: number;
}

// Grid layout configurations
const GRID_LAYOUTS: Record<number, GridLayout> = {
  1: { rows: 1, cols: 1, maxParticipants: 1 },
  2: { rows: 1, cols: 2, maxParticipants: 2 },
  3: { rows: 2, cols: 2, maxParticipants: 4 },  // 2x2 for 3-4 participants
  4: { rows: 2, cols: 2, maxParticipants: 4 },
  5: { rows: 2, cols: 3, maxParticipants: 6 },  // 2x3 for 5-6 participants  
  6: { rows: 2, cols: 3, maxParticipants: 6 },
  7: { rows: 3, cols: 3, maxParticipants: 9 },  // 3x3 for 7+ participants
  8: { rows: 3, cols: 3, maxParticipants: 9 },
  9: { rows: 3, cols: 3, maxParticipants: 9 },
};

const getGridLayout = (participantCount: number): GridLayout => {
  if (participantCount <= 1) return GRID_LAYOUTS[1];
  if (participantCount <= 2) return GRID_LAYOUTS[2];
  if (participantCount <= 4) return GRID_LAYOUTS[3];
  if (participantCount <= 6) return GRID_LAYOUTS[5];
  return GRID_LAYOUTS[7]; // 3x3 for 7+ participants
};

export const VideoGrid: React.FC<VideoGridProps> = ({
  participants,
  localStream,
  onParticipantClick,
  className = '',
  style = {},
}) => {
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  
  // Determine grid layout based on participant count
  const gridLayout = useMemo(() => {
    return getGridLayout(participants.length);
  }, [participants.length]);

  // Calculate tile dimensions
  const tileDimensions = useMemo(() => {
    const { rows, cols } = gridLayout;
    const padding = 8; // Gap between tiles
    const totalHorizontalPadding = (cols + 1) * padding;
    const totalVerticalPadding = (rows + 1) * padding;
    
    const availableWidth = containerSize.width - totalHorizontalPadding;
    const availableHeight = containerSize.height - totalVerticalPadding;
    
    const tileWidth = Math.floor(availableWidth / cols);
    const tileHeight = Math.floor(availableHeight / rows);
    
    return {
      width: Math.max(tileWidth, 160), // Minimum width
      height: Math.max(tileHeight, 120), // Minimum height
      padding,
    };
  }, [gridLayout, containerSize]);

  // Handle container resize
  useEffect(() => {
    const updateContainerSize = () => {
      // In a real app, you'd measure the actual container
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Use responsive sizing
      const maxWidth = Math.min(viewportWidth * 0.8, 1200);
      const maxHeight = Math.min(viewportHeight * 0.6, 800);
      
      setContainerSize({
        width: maxWidth,
        height: maxHeight,
      });
    };

    updateContainerSize();
    window.addEventListener('resize', updateContainerSize);
    return () => window.removeEventListener('resize', updateContainerSize);
  }, []);

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateRows: `repeat(${gridLayout.rows}, 1fr)`,
    gridTemplateColumns: `repeat(${gridLayout.cols}, 1fr)`,
    gap: `${tileDimensions.padding}px`,
    width: '100%',
    height: '100%',
    padding: `${tileDimensions.padding}px`,
    backgroundColor: '#1e1e1e',
    borderRadius: '8px',
    overflow: 'hidden',
    ...style,
  };

  return (
    <div 
      className={`video-grid ${className}`}
      style={gridStyle}
    >
      {participants.map((participant, index) => (
        <VideoTile
          key={`${participant.userId}-${participant.deviceId}`}
          participant={participant}
          localStream={participant.isLocal ? localStream || undefined : undefined}
          onClick={() => onParticipantClick?.(participant)}
          style={{
            width: '100%',
            height: '100%',
            minWidth: `${tileDimensions.width}px`,
            minHeight: `${tileDimensions.height}px`,
          }}
        />
      ))}
      
      {/* Fill empty grid spots with placeholder tiles if needed */}
      {participants.length < gridLayout.maxParticipants && 
        Array.from({ length: gridLayout.maxParticipants - participants.length }).map((_, index) => (
          <PlaceholderTile key={`placeholder-${index}`} />
        ))
      }
    </div>
  );
};

interface VideoTileProps {
  participant: RTCParticipant;
  localStream?: MediaStream;
  onClick?: () => void;
  style?: React.CSSProperties;
  showControls?: boolean;
}

const VideoTile: React.FC<VideoTileProps> = ({
  participant,
  localStream,
  onClick,
  style = {},
  showControls = false,
}) => {
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);

  // Set up video stream
  useEffect(() => {
    if (!videoElement || !localStream) return;

    videoElement.srcObject = localStream;
    videoElement.play().catch(console.error);

    return () => {
      if (videoElement.srcObject) {
        videoElement.srcObject = null;
      }
    };
  }, [videoElement, localStream]);

  const getUserInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  };

  const hasVideo = localStream && localStream.getVideoTracks().length > 0;

  return (
    <div
      style={{
        position: 'relative',
        backgroundColor: '#2f3136',
        borderRadius: '8px',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        border: '2px solid transparent',
        transition: 'border-color 0.2s ease',
        ...style,
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.borderColor = '#7289da';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'transparent';
      }}
    >
      {/* Video element */}
      {hasVideo ? (
        <video
          ref={setVideoElement}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          autoPlay
          playsInline
          muted={participant.isLocal} // Mute local video to prevent echo
        />
      ) : (
        /* Avatar placeholder */
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#36393f',
            backgroundImage: participant.avatarUrl ? `url(${participant.avatarUrl})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {!participant.avatarUrl && (
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#7289da',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '24px',
                fontWeight: 'bold',
              }}
            >
              {getUserInitials(participant.displayName || participant.userId)}
            </div>
          )}
        </div>
      )}

      {/* Name overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: '8px',
          left: '8px',
          right: '8px',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {participant.displayName || participant.userId}
          {participant.isLocal && ' (You)'}
        </span>
        
        {/* Status indicators would go here */}
      </div>

      {/* Loading overlay for remote participants without video */}
      {!participant.isLocal && !hasVideo && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#b9bbbe',
            fontSize: '12px',
            textAlign: 'center',
          }}
        >
          <div style={{ marginBottom: '4px' }}>📷</div>
          <div>Camera off</div>
        </div>
      )}
    </div>
  );
};

const PlaceholderTile: React.FC = () => (
  <div
    style={{
      backgroundColor: '#1a1a1a',
      borderRadius: '8px',
      border: '2px dashed #444',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#666',
      fontSize: '12px',
    }}
  >
    Empty
  </div>
);

// Export VideoTile for standalone usage
export { VideoTile };
export default VideoGrid;