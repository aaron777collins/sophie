/**
 * Video Tile Component
 * Individual participant video with name overlay, speaking indicators, mute status, connection quality
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { RTCParticipant } from '../../lib/matrix/rtc/types';

export interface VideoTileProps {
  participant: RTCParticipant;
  stream?: MediaStream | null;
  
  // Visual state
  isSpeaking?: boolean;
  isMuted?: boolean;
  isDeafened?: boolean;
  connectionQuality?: 'excellent' | 'good' | 'poor' | 'unknown';
  
  // Display options
  showName?: boolean;
  showAvatar?: boolean;
  showStatusIndicators?: boolean;
  
  // Interaction
  onClick?: () => void;
  onDoubleClick?: () => void;
  
  // Styling
  className?: string;
  style?: React.CSSProperties;
  size?: 'small' | 'medium' | 'large';
  
  // Advanced options
  mirror?: boolean; // For local video
  volume?: number; // Audio volume 0-1
}

const TILE_SIZES = {
  small: { width: 160, height: 120 },
  medium: { width: 240, height: 180 },
  large: { width: 320, height: 240 },
};

export const VideoTile: React.FC<VideoTileProps> = ({
  participant,
  stream,
  isSpeaking = false,
  isMuted = false,
  isDeafened = false,
  connectionQuality = 'unknown',
  showName = true,
  showAvatar = true,
  showStatusIndicators = true,
  onClick,
  onDoubleClick,
  className = '',
  style = {},
  size = 'medium',
  mirror = false,
  volume = 1,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [lastSpeakingTime, setLastSpeakingTime] = useState<number>(0);

  // Set up video stream
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement || !stream) {
      setIsVideoReady(false);
      return;
    }

    const handleLoadedData = () => setIsVideoReady(true);
    const handleError = () => setIsVideoReady(false);

    videoElement.srcObject = stream;
    videoElement.volume = volume;
    videoElement.addEventListener('loadeddata', handleLoadedData);
    videoElement.addEventListener('error', handleError);

    // Auto-play
    videoElement.play().catch(error => {
      console.warn('Failed to auto-play video:', error);
      setIsVideoReady(false);
    });

    return () => {
      videoElement.removeEventListener('loadeddata', handleLoadedData);
      videoElement.removeEventListener('error', handleError);
      if (videoElement.srcObject) {
        videoElement.srcObject = null;
      }
    };
  }, [stream, volume]);

  // Track speaking activity
  useEffect(() => {
    if (isSpeaking) {
      setLastSpeakingTime(Date.now());
    }
  }, [isSpeaking]);

  // Helper functions
  const getUserInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  };

  const getConnectionIcon = () => {
    switch (connectionQuality) {
      case 'excellent': return '🟢';
      case 'good': return '🟡';
      case 'poor': return '🔴';
      default: return '⚪';
    }
  };

  const getConnectionText = () => {
    switch (connectionQuality) {
      case 'excellent': return 'Excellent connection';
      case 'good': return 'Good connection';
      case 'poor': return 'Poor connection';
      default: return 'Unknown connection';
    }
  };

  const hasVideo = stream && stream.getVideoTracks().length > 0 && stream.getVideoTracks()[0].enabled;
  const hasAudio = stream && stream.getAudioTracks().length > 0;
  const tileSize = TILE_SIZES[size];

  // Speaking animation effect
  const speakingBorderColor = isSpeaking ? '#00ff00' : 'transparent';
  const recentlySpokeGlow = Date.now() - lastSpeakingTime < 1000;

  const tileStyle: React.CSSProperties = {
    position: 'relative',
    width: tileSize.width,
    height: tileSize.height,
    backgroundColor: '#2f3136',
    borderRadius: '8px',
    overflow: 'hidden',
    cursor: onClick ? 'pointer' : 'default',
    border: `2px solid ${speakingBorderColor}`,
    boxShadow: isSpeaking 
      ? '0 0 12px rgba(0, 255, 0, 0.5)' 
      : recentlySpokeGlow 
        ? '0 0 8px rgba(0, 255, 0, 0.3)'
        : 'none',
    transition: 'all 0.2s ease',
    transform: isHovered && onClick ? 'scale(1.02)' : 'scale(1)',
    ...style,
  };

  return (
    <div
      className={`video-tile ${className}`}
      style={tileStyle}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Video element */}
      {hasVideo && isVideoReady ? (
        <video
          ref={videoRef}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: mirror ? 'scaleX(-1)' : 'none',
          }}
          autoPlay
          playsInline
          muted={participant.isLocal} // Prevent echo
        />
      ) : (
        /* Avatar/placeholder */
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#36393f',
            backgroundImage: showAvatar && participant.avatarUrl ? `url(${participant.avatarUrl})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {!participant.avatarUrl && showAvatar && (
            <>
              <div
                style={{
                  width: size === 'large' ? '80px' : size === 'medium' ? '60px' : '40px',
                  height: size === 'large' ? '80px' : size === 'medium' ? '60px' : '40px',
                  borderRadius: '50%',
                  backgroundColor: '#7289da',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: size === 'large' ? '32px' : size === 'medium' ? '24px' : '16px',
                  fontWeight: 'bold',
                  marginBottom: '8px',
                }}
              >
                {getUserInitials(participant.displayName || participant.userId)}
              </div>
              
              {/* Camera off indicator */}
              <div
                style={{
                  color: '#b9bbbe',
                  fontSize: size === 'large' ? '14px' : '12px',
                  textAlign: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>📷</span>
                <span>Camera off</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Name overlay */}
      {showName && (
        <div
          style={{
            position: 'absolute',
            bottom: showStatusIndicators ? '32px' : '8px',
            left: '8px',
            right: '8px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: size === 'large' ? '14px' : '12px',
            fontWeight: '500',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {participant.displayName || participant.userId}
          {participant.isLocal && ' (You)'}
        </div>
      )}

      {/* Status indicators bar */}
      {showStatusIndicators && (
        <div
          style={{
            position: 'absolute',
            bottom: '8px',
            left: '8px',
            right: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
          }}
        >
          {/* Left side - Audio/Video status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {/* Microphone status */}
            <span title={isMuted ? 'Muted' : 'Unmuted'}>
              {isMuted ? '🔇' : hasAudio ? '🎤' : '❌'}
            </span>
            
            {/* Camera status */}
            <span title={hasVideo ? 'Camera on' : 'Camera off'}>
              {hasVideo ? '📹' : '📷'}
            </span>
            
            {/* Deafened status */}
            {isDeafened && (
              <span title="Deafened">🔇</span>
            )}
            
            {/* Speaking indicator */}
            {isSpeaking && (
              <span
                style={{
                  animation: 'pulse 1s infinite',
                  color: '#00ff00',
                }}
                title="Speaking"
              >
                🗣️
              </span>
            )}
          </div>

          {/* Right side - Connection quality */}
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '2px' }}
            title={getConnectionText()}
          >
            <span style={{ fontSize: '10px' }}>
              {getConnectionIcon()}
            </span>
          </div>
        </div>
      )}

      {/* Hover overlay with additional controls */}
      {isHovered && onClick && (
        <div
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: '4px',
            borderRadius: '4px',
            display: 'flex',
            gap: '4px',
          }}
        >
          <button
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontSize: '12px',
              padding: '2px',
            }}
            title="More options"
            onClick={(e) => {
              e.stopPropagation();
              // Handle more options
            }}
          >
            ⋯
          </button>
        </div>
      )}

      {/* Loading overlay */}
      {stream && !isVideoReady && hasVideo && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '12px',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '20px',
              height: '20px',
              border: '2px solid #666',
              borderTop: '2px solid #7289da',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 8px',
            }}></div>
            Loading...
          </div>
        </div>
      )}

      {/* Global animations */}
      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default VideoTile;