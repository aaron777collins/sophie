/**
 * Call Controls Component
 * Mute/unmute, camera toggle, screenshare, leave call - integrates with MatrixRTC session controls
 */

'use client';

import React, { useState, useCallback } from 'react';
import { useVoiceControls } from '../../hooks/voice/use-voice-controls';
import { useMatrixRTC } from '../../hooks/matrix/use-matrix-rtc';

export interface CallControlsProps {
  roomId: string;
  onLeave?: () => void;
  onSettingsClick?: () => void;
  
  // Layout options
  orientation?: 'horizontal' | 'vertical';
  size?: 'small' | 'medium' | 'large';
  showLabels?: boolean;
  
  // Visual options
  className?: string;
  style?: React.CSSProperties;
  
  // Feature toggles
  showScreenShare?: boolean;
  showDeafen?: boolean;
  showSettings?: boolean;
}

const CONTROL_SIZES = {
  small: { width: 36, height: 36, fontSize: '14px', iconSize: '16px' },
  medium: { width: 48, height: 48, fontSize: '16px', iconSize: '20px' },
  large: { width: 56, height: 56, fontSize: '18px', iconSize: '24px' },
};

export const CallControls: React.FC<CallControlsProps> = ({
  roomId,
  onLeave,
  onSettingsClick,
  orientation = 'horizontal',
  size = 'medium',
  showLabels = false,
  className = '',
  style = {},
  showScreenShare = true,
  showDeafen = true,
  showSettings = true,
}) => {
  const voice = useVoiceControls(roomId);
  const rtc = useMatrixRTC(roomId);
  const [isLeaving, setIsLeaving] = useState(false);
  
  const controlSize = CONTROL_SIZES[size];

  const handleLeave = useCallback(async () => {
    if (isLeaving) return;
    
    setIsLeaving(true);
    try {
      await rtc.leaveSession();
      await rtc.destroySession();
      onLeave?.();
    } catch (error) {
      console.error('Failed to leave call:', error);
    } finally {
      setIsLeaving(false);
    }
  }, [rtc, onLeave, isLeaving]);

  const handleMuteToggle = useCallback(async () => {
    try {
      await voice.toggleMute();
    } catch (error) {
      console.error('Failed to toggle mute:', error);
    }
  }, [voice]);

  const handleDeafenToggle = useCallback(async () => {
    try {
      await voice.toggleDeafen();
    } catch (error) {
      console.error('Failed to toggle deafen:', error);
    }
  }, [voice]);

  const handleCameraToggle = useCallback(async () => {
    try {
      await voice.toggleCamera();
    } catch (error) {
      console.error('Failed to toggle camera:', error);
    }
  }, [voice]);

  const handleScreenShareToggle = useCallback(async () => {
    try {
      await voice.toggleScreenShare();
    } catch (error) {
      console.error('Failed to toggle screen share:', error);
    }
  }, [voice]);

  // Base button styles
  const getButtonStyle = (
    isActive: boolean, 
    variant: 'normal' | 'danger' | 'warning' = 'normal'
  ): React.CSSProperties => {
    const baseColor = isActive
      ? variant === 'danger' ? '#f04747'
        : variant === 'warning' ? '#faa61a'
        : '#43b581'
      : '#4f545c';

    return {
      width: controlSize.width,
      height: controlSize.height,
      borderRadius: '50%',
      border: 'none',
      backgroundColor: baseColor,
      color: 'white',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: controlSize.iconSize,
      transition: 'all 0.2s ease',
      position: 'relative',
      outline: 'none',
    };
  };

  const getLabelStyle = (): React.CSSProperties => ({
    fontSize: '11px',
    color: '#b9bbbe',
    marginTop: '4px',
    textAlign: 'center',
    minHeight: '14px',
  });

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: orientation === 'vertical' ? 'column' : 'row',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: 'rgba(54, 57, 63, 0.95)',
    borderRadius: '12px',
    backdropFilter: 'blur(8px)',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
    ...style,
  };

  const ControlButton: React.FC<{
    onClick: () => void;
    isActive: boolean;
    variant?: 'normal' | 'danger' | 'warning';
    disabled?: boolean;
    label?: string;
    icon: string;
    title: string;
  }> = ({ onClick, isActive, variant = 'normal', disabled = false, label, icon, title }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <button
        onClick={onClick}
        disabled={disabled}
        title={title}
        style={{
          ...getButtonStyle(isActive, variant),
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.transform = 'scale(1.1)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {icon}
        
        {/* Loading spinner for async operations */}
        {disabled && (
          <div
            style={{
              position: 'absolute',
              width: '16px',
              height: '16px',
              border: '2px solid transparent',
              borderTop: '2px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
        )}
      </button>
      
      {showLabels && label && (
        <div style={getLabelStyle()}>{label}</div>
      )}
    </div>
  );

  return (
    <div className={`call-controls ${className}`} style={containerStyle}>
      {/* Microphone Toggle */}
      <ControlButton
        onClick={handleMuteToggle}
        isActive={voice.isMuted}
        variant={voice.isMuted ? 'danger' : 'normal'}
        icon={voice.isMuted ? '🔇' : '🎤'}
        label={voice.isMuted ? 'Unmute' : 'Mute'}
        title={voice.isMuted ? 'Unmute microphone' : 'Mute microphone'}
      />

      {/* Camera Toggle */}
      <ControlButton
        onClick={handleCameraToggle}
        isActive={voice.isCameraOn}
        icon={voice.isCameraOn ? '📹' : '📷'}
        label={voice.isCameraOn ? 'Stop Video' : 'Start Video'}
        title={voice.isCameraOn ? 'Turn off camera' : 'Turn on camera'}
      />

      {/* Screen Share Toggle */}
      {showScreenShare && (
        <ControlButton
          onClick={handleScreenShareToggle}
          isActive={voice.isScreenSharing}
          variant={voice.isScreenSharing ? 'warning' : 'normal'}
          icon={voice.isScreenSharing ? '🔲' : '📺'}
          label={voice.isScreenSharing ? 'Stop Share' : 'Share Screen'}
          title={voice.isScreenSharing ? 'Stop screen sharing' : 'Share your screen'}
        />
      )}

      {/* Deafen Toggle */}
      {showDeafen && (
        <ControlButton
          onClick={handleDeafenToggle}
          isActive={voice.isDeafened}
          variant={voice.isDeafened ? 'warning' : 'normal'}
          icon={voice.isDeafened ? '🔇' : '🔊'}
          label={voice.isDeafened ? 'Undeafen' : 'Deafen'}
          title={voice.isDeafened ? 'Undeafen (hear others)' : 'Deafen (mute all audio)'}
        />
      )}

      {/* Divider */}
      <div
        style={{
          width: orientation === 'horizontal' ? '1px' : '100%',
          height: orientation === 'horizontal' ? `${controlSize.height * 0.6}px` : '1px',
          backgroundColor: '#42464d',
          margin: '0 4px',
        }}
      />

      {/* Settings */}
      {showSettings && onSettingsClick && (
        <ControlButton
          onClick={onSettingsClick}
          isActive={false}
          icon="⚙️"
          label="Settings"
          title="Call settings"
        />
      )}

      {/* Leave Call */}
      <ControlButton
        onClick={handleLeave}
        isActive={false}
        variant="danger"
        disabled={isLeaving}
        icon={isLeaving ? '⏳' : '📞'}
        label="Leave"
        title="Leave call"
      />

      {/* Connection Status Indicator */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginLeft: orientation === 'horizontal' ? '8px' : '0',
          marginTop: orientation === 'vertical' ? '8px' : '0',
        }}
      >
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: 
              voice.connectionQuality === 'excellent' ? '#43b581'
              : voice.connectionQuality === 'good' ? '#faa61a'
              : voice.connectionQuality === 'poor' ? '#f04747'
              : '#4f545c',
            marginBottom: '2px',
          }}
        />
        {showLabels && (
          <div style={{
            ...getLabelStyle(),
            fontSize: '9px',
            textTransform: 'capitalize',
          }}>
            {voice.connectionQuality}
          </div>
        )}
      </div>

      {/* Global animations */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CallControls;