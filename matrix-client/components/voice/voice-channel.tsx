/**
 * Voice Channel UI Component
 * Main voice channel interface with participant list that integrates with useMatrixRTCSession
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useMatrixRTC } from '../../hooks/matrix/use-matrix-rtc';
import { useVoiceControls } from '../../hooks/voice/use-voice-controls';

interface VoiceChannelProps {
  roomId: string;
  roomName?: string;
  onLeave?: () => void;
}

interface ParticipantListItemProps {
  participant: {
    userId: string;
    displayName?: string;
    avatarUrl?: string;
    isLocal: boolean;
  };
  isSpeaking?: boolean;
  isMuted?: boolean;
  connectionQuality?: 'excellent' | 'good' | 'poor' | 'unknown';
}

const ParticipantListItem: React.FC<ParticipantListItemProps> = ({
  participant,
  isSpeaking = false,
  isMuted = false,
  connectionQuality = 'unknown',
}) => {
  const getConnectionIcon = () => {
    switch (connectionQuality) {
      case 'excellent': return '🟢';
      case 'good': return '🟡'; 
      case 'poor': return '🔴';
      default: return '⚪';
    }
  };

  const getUserInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '8px 12px',
      borderRadius: '6px',
      backgroundColor: isSpeaking ? 'rgba(0, 255, 0, 0.1)' : 'transparent',
      border: isSpeaking ? '2px solid rgba(0, 255, 0, 0.3)' : '2px solid transparent',
      transition: 'all 0.2s ease',
      marginBottom: '4px',
    }}>
      {/* Avatar */}
      <div style={{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        backgroundColor: participant.avatarUrl ? 'transparent' : '#666',
        backgroundImage: participant.avatarUrl ? `url(${participant.avatarUrl})` : 'none',
        backgroundSize: 'cover',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '12px',
        fontWeight: 'bold',
        marginRight: '12px',
      }}>
        {!participant.avatarUrl && getUserInitials(participant.displayName || participant.userId)}
      </div>

      {/* Name and status */}
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: '14px',
          fontWeight: '500',
          color: '#fff',
          marginBottom: '2px',
        }}>
          {participant.displayName || participant.userId}
          {participant.isLocal && ' (You)'}
        </div>
        <div style={{
          fontSize: '12px',
          color: '#999',
        }}>
          {isSpeaking ? 'Speaking' : 'Silent'}
        </div>
      </div>

      {/* Status indicators */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}>
        {/* Mute status */}
        {isMuted && (
          <span style={{ fontSize: '14px' }}>🔇</span>
        )}
        
        {/* Connection quality */}
        <span style={{ fontSize: '12px' }} title={`Connection: ${connectionQuality}`}>
          {getConnectionIcon()}
        </span>
      </div>
    </div>
  );
};

export const VoiceChannel: React.FC<VoiceChannelProps> = ({
  roomId,
  roomName,
  onLeave,
}) => {
  const rtc = useMatrixRTC(roomId);
  const voice = useVoiceControls(roomId);
  const [isMinimized, setIsMinimized] = useState(false);

  // Auto-join on mount if not already joined
  useEffect(() => {
    if (rtc.session && !rtc.isJoined && !rtc.isLoading) {
      rtc.joinSession().catch(console.error);
    }
  }, [rtc.session, rtc.isJoined, rtc.isLoading]);

  // Create session if it doesn't exist
  useEffect(() => {
    if (!rtc.session && !rtc.isLoading) {
      rtc.createSession().catch(console.error);
    }
  }, [rtc.session, rtc.isLoading]);

  const handleLeave = async () => {
    try {
      await rtc.leaveSession();
      await rtc.destroySession();
      onLeave?.();
    } catch (error) {
      console.error('Failed to leave voice channel:', error);
    }
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (!rtc.session && rtc.isLoading) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '300px',
        backgroundColor: '#2f3136',
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', marginBottom: '8px' }}>Connecting...</div>
          <div style={{
            width: '24px',
            height: '24px',
            border: '2px solid #666',
            borderTop: '2px solid #7289da',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto',
          }}></div>
        </div>
      </div>
    );
  }

  if (rtc.error) {
    return (
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '300px',
        backgroundColor: '#f04747',
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        color: '#fff',
      }}>
        <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
          Connection Error
        </div>
        <div style={{ fontSize: '12px', marginBottom: '12px' }}>
          {rtc.error.message}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => rtc.createSession()}
            style={{
              flex: 1,
              padding: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Retry
          </button>
          <button
            onClick={onLeave}
            style={{
              flex: 1,
              padding: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: isMinimized ? '200px' : '300px',
      backgroundColor: '#2f3136',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      color: '#fff',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        backgroundColor: '#36393f',
        borderBottom: '1px solid #42464d',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '14px',
            fontWeight: 'bold',
            marginBottom: '2px',
          }}>
            🔊 {roomName || 'Voice Channel'}
          </div>
          <div style={{
            fontSize: '11px',
            color: '#b9bbbe',
          }}>
            {rtc.participants.length} participant{rtc.participants.length !== 1 ? 's' : ''}
            {voice.connectionQuality && ` • ${voice.connectionQuality}`}
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={handleMinimize}
            style={{
              background: 'none',
              border: 'none',
              color: '#b9bbbe',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '3px',
              fontSize: '12px',
            }}
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? '⬆️' : '⬇️'}
          </button>
          
          <button
            onClick={handleLeave}
            style={{
              background: 'none',
              border: 'none',
              color: '#f04747',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '3px',
              fontSize: '12px',
            }}
            title="Leave channel"
          >
            ❌
          </button>
        </div>
      </div>

      {/* Content - only show if not minimized */}
      {!isMinimized && (
        <div style={{ padding: '12px 16px' }}>
          {/* Participants List */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{
              fontSize: '12px',
              color: '#b9bbbe',
              marginBottom: '8px',
              textTransform: 'uppercase',
              fontWeight: '600',
            }}>
              Participants
            </div>
            
            <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
              {rtc.participants.map((participant) => (
                <ParticipantListItem
                  key={`${participant.userId}-${participant.deviceId}`}
                  participant={participant}
                  isSpeaking={participant.isLocal ? voice.isSpeaking : false}
                  isMuted={participant.isLocal ? voice.isMuted : false}
                  connectionQuality={participant.isLocal ? voice.connectionQuality : 'good'}
                />
              ))}
              
              {rtc.participants.length === 0 && (
                <div style={{
                  textAlign: 'center',
                  color: '#666',
                  fontSize: '12px',
                  padding: '20px',
                }}>
                  No participants yet
                </div>
              )}
            </div>
          </div>

          {/* Quick Controls */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            paddingTop: '12px',
            borderTop: '1px solid #42464d',
          }}>
            <button
              onClick={voice.toggleMute}
              style={{
                padding: '8px',
                backgroundColor: voice.isMuted ? '#f04747' : '#43b581',
                border: 'none',
                borderRadius: '50%',
                color: 'white',
                cursor: 'pointer',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
              }}
              title={voice.isMuted ? 'Unmute' : 'Mute'}
            >
              {voice.isMuted ? '🔇' : '🎤'}
            </button>

            <button
              onClick={voice.toggleDeafen}
              style={{
                padding: '8px',
                backgroundColor: voice.isDeafened ? '#f04747' : '#7289da',
                border: 'none',
                borderRadius: '50%',
                color: 'white',
                cursor: 'pointer',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
              }}
              title={voice.isDeafened ? 'Undeafen' : 'Deafen'}
            >
              {voice.isDeafened ? '🔇' : '🔊'}
            </button>

            <button
              onClick={voice.toggleCamera}
              style={{
                padding: '8px',
                backgroundColor: voice.isCameraOn ? '#43b581' : '#666',
                border: 'none',
                borderRadius: '50%',
                color: 'white',
                cursor: 'pointer',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
              }}
              title={voice.isCameraOn ? 'Turn off camera' : 'Turn on camera'}
            >
              {voice.isCameraOn ? '📹' : '📷'}
            </button>
          </div>
        </div>
      )}

      {/* Global styles for animation */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default VoiceChannel;