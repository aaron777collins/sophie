/**
 * Voice Controls Component
 * Voice-specific controls for mute, deafen, push-to-talk, and audio settings
 * Complements CallControls with more advanced voice features
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useVoiceControls } from '../../hooks/voice/use-voice-controls';

export interface VoiceControlsProps {
  roomId: string;
  
  // Layout options
  orientation?: 'horizontal' | 'vertical';
  size?: 'small' | 'medium' | 'large';
  compact?: boolean;
  
  // Feature toggles
  showPushToTalk?: boolean;
  showAudioSettings?: boolean;
  showDeviceSelection?: boolean;
  showAudioLevel?: boolean;
  
  // Event handlers
  onSettingsClick?: () => void;
  
  // Visual options
  className?: string;
  style?: React.CSSProperties;
}

const CONTROL_SIZES = {
  small: { width: 32, height: 32, fontSize: '12px', iconSize: '14px' },
  medium: { width: 40, height: 40, fontSize: '14px', iconSize: '16px' },
  large: { width: 48, height: 48, fontSize: '16px', iconSize: '18px' },
};

export const VoiceControls: React.FC<VoiceControlsProps> = ({
  roomId,
  orientation = 'horizontal',
  size = 'medium',
  compact = false,
  showPushToTalk = true,
  showAudioSettings = true,
  showDeviceSelection = true,
  showAudioLevel = true,
  onSettingsClick,
  className = '',
  style = {},
}) => {
  const voice = useVoiceControls(roomId);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isHoldingPTT, setIsHoldingPTT] = useState(false);
  
  const controlSize = CONTROL_SIZES[size];

  // Push-to-talk keyboard handling
  useEffect(() => {
    if (!voice.isPushToTalkEnabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && !isHoldingPTT) {
        e.preventDefault();
        setIsHoldingPTT(true);
        voice.activatePushToTalk();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && isHoldingPTT) {
        e.preventDefault();
        setIsHoldingPTT(false);
        voice.deactivatePushToTalk();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [voice, isHoldingPTT]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (isHoldingPTT) {
        voice.deactivatePushToTalk();
      }
    };
  }, [voice, isHoldingPTT]);

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

  const handlePTTToggle = useCallback(() => {
    voice.enablePushToTalk(!voice.isPushToTalkEnabled);
  }, [voice]);

  const handleDeviceChange = useCallback(async (deviceId: string, type: 'microphone' | 'speaker') => {
    try {
      if (type === 'microphone') {
        await voice.setMicrophone(deviceId);
      } else {
        await voice.setSpeaker(deviceId);
      }
    } catch (error) {
      console.error(`Failed to set ${type}:`, error);
    }
  }, [voice]);

  const handleAudioSettingToggle = useCallback(async (setting: 'noiseSuppression' | 'echoCancellation' | 'autoGainControl') => {
    try {
      const currentValue = voice[setting];
      switch (setting) {
        case 'noiseSuppression':
          await voice.setNoiseSuppression(!currentValue);
          break;
        case 'echoCancellation':
          await voice.setEchoCancellation(!currentValue);
          break;
        case 'autoGainControl':
          await voice.setAutoGainControl(!currentValue);
          break;
      }
    } catch (error) {
      console.error(`Failed to toggle ${setting}:`, error);
    }
  }, [voice]);

  // Base button styles
  const getButtonStyle = (
    isActive: boolean,
    variant: 'normal' | 'danger' | 'warning' | 'success' = 'normal',
    isSmall = false
  ): React.CSSProperties => {
    const baseColor = isActive
      ? variant === 'danger' ? '#f04747'
        : variant === 'warning' ? '#faa61a'
        : variant === 'success' ? '#43b581'
        : '#7289da'
      : '#4f545c';

    const size = isSmall ? 
      { width: 24, height: 24, fontSize: '10px' } :
      { width: controlSize.width, height: controlSize.height, fontSize: controlSize.iconSize };

    return {
      ...size,
      borderRadius: isSmall ? '4px' : '50%',
      border: 'none',
      backgroundColor: baseColor,
      color: 'white',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
      outline: 'none',
    };
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: orientation === 'vertical' ? 'column' : 'row',
    alignItems: 'stretch',
    gap: compact ? '6px' : '8px',
    padding: compact ? '6px' : '8px',
    backgroundColor: 'rgba(54, 57, 63, 0.9)',
    borderRadius: compact ? '6px' : '8px',
    backdropFilter: 'blur(4px)',
    minWidth: compact ? 'auto' : '200px',
    ...style,
  };

  const sectionStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: orientation === 'vertical' ? 'column' : 'row',
    alignItems: 'center',
    gap: compact ? '4px' : '6px',
  };

  // Audio level visualization
  const AudioLevelIndicator: React.FC = () => (
    <div style={{
      width: '60px',
      height: '4px',
      backgroundColor: '#42464d',
      borderRadius: '2px',
      overflow: 'hidden',
      position: 'relative',
    }}>
      <div
        style={{
          width: `${Math.min(voice.audioLevel * 100, 100)}%`,
          height: '100%',
          backgroundColor: voice.isSpeaking ? '#43b581' : '#7289da',
          borderRadius: '2px',
          transition: 'width 0.1s ease',
        }}
      />
    </div>
  );

  // Device selector dropdown
  const DeviceSelector: React.FC<{
    devices: MediaDeviceInfo[];
    selectedDevice?: string;
    kind: 'audioinput' | 'audiooutput';
    onChange: (deviceId: string) => void;
  }> = ({ devices, selectedDevice, kind, onChange }) => {
    const relevantDevices = devices.filter(d => d.kind === kind);
    
    if (relevantDevices.length === 0) return null;

    return (
      <select
        value={selectedDevice || ''}
        onChange={(e) => onChange(e.target.value)}
        style={{
          backgroundColor: '#42464d',
          color: 'white',
          border: '1px solid #72767d',
          borderRadius: '4px',
          padding: '2px 4px',
          fontSize: '11px',
          maxWidth: '120px',
        }}
      >
        {relevantDevices.map(device => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label || `${kind === 'audioinput' ? 'Microphone' : 'Speaker'} ${device.deviceId.slice(0, 8)}`}
          </option>
        ))}
      </select>
    );
  };

  return (
    <div className={`voice-controls ${className}`} style={containerStyle}>
      {/* Main Controls Section */}
      <div style={sectionStyle}>
        {/* Mute Toggle */}
        <button
          onClick={handleMuteToggle}
          title={voice.isMuted ? 'Unmute microphone' : 'Mute microphone'}
          style={getButtonStyle(voice.isMuted, 'danger')}
        >
          {voice.isMuted ? '🔇' : '🎤'}
        </button>

        {/* Deafen Toggle */}
        <button
          onClick={handleDeafenToggle}
          title={voice.isDeafened ? 'Undeafen (hear others)' : 'Deafen (mute all audio)'}
          style={getButtonStyle(voice.isDeafened, 'warning')}
        >
          {voice.isDeafened ? '🔇' : '🔊'}
        </button>

        {/* Push-to-Talk Toggle */}
        {showPushToTalk && (
          <button
            onClick={handlePTTToggle}
            title={voice.isPushToTalkEnabled ? 'Disable push-to-talk' : 'Enable push-to-talk (Space key)'}
            style={getButtonStyle(voice.isPushToTalkEnabled, 'success')}
          >
            {voice.isPushToTalkEnabled ? '⌨️' : '🎙️'}
          </button>
        )}
      </div>

      {/* Audio Level Indicator */}
      {showAudioLevel && !compact && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          minWidth: '80px',
        }}>
          <span style={{ fontSize: '10px', color: '#b9bbbe' }}>🔉</span>
          <AudioLevelIndicator />
          {voice.isSpeaking && (
            <span style={{ fontSize: '8px', color: '#43b581' }}>●</span>
          )}
        </div>
      )}

      {/* Push-to-Talk Status */}
      {voice.isPushToTalkEnabled && (
        <div style={{
          fontSize: '10px',
          color: voice.isPushToTalkActive ? '#43b581' : '#b9bbbe',
          padding: '2px 6px',
          backgroundColor: 'rgba(0,0,0,0.3)',
          borderRadius: '3px',
          textAlign: 'center',
          minWidth: '60px',
        }}>
          {voice.isPushToTalkActive ? 'TALKING' : 'HOLD SPACE'}
        </div>
      )}

      {/* Advanced Settings Toggle */}
      {(showAudioSettings || showDeviceSelection) && !compact && (
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          title="Advanced audio settings"
          style={getButtonStyle(showAdvanced, 'normal', true)}
        >
          ⚙️
        </button>
      )}

      {/* Advanced Settings Panel */}
      {showAdvanced && !compact && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '4px',
          padding: '8px',
          backgroundColor: '#36393f',
          borderRadius: '6px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          zIndex: 1000,
        }}>
          {/* Audio Processing Settings */}
          {showAudioSettings && (
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '11px', color: '#b9bbbe', marginBottom: '4px' }}>
                Audio Processing
              </div>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => handleAudioSettingToggle('noiseSuppression')}
                  style={getButtonStyle(voice.noiseSuppression, 'normal', true)}
                  title="Noise suppression"
                >
                  🔕
                </button>
                <button
                  onClick={() => handleAudioSettingToggle('echoCancellation')}
                  style={getButtonStyle(voice.echoCancellation, 'normal', true)}
                  title="Echo cancellation"
                >
                  🗣️
                </button>
                <button
                  onClick={() => handleAudioSettingToggle('autoGainControl')}
                  style={getButtonStyle(voice.autoGainControl, 'normal', true)}
                  title="Auto gain control"
                >
                  📶
                </button>
              </div>
            </div>
          )}

          {/* Device Selection */}
          {showDeviceSelection && voice.availableDevices.length > 0 && (
            <div>
              <div style={{ fontSize: '11px', color: '#b9bbbe', marginBottom: '4px' }}>
                Devices
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <DeviceSelector
                  devices={voice.availableDevices}
                  selectedDevice={voice.selectedMicrophone}
                  kind="audioinput"
                  onChange={(deviceId) => handleDeviceChange(deviceId, 'microphone')}
                />
                <DeviceSelector
                  devices={voice.availableDevices}
                  selectedDevice={voice.selectedSpeaker}
                  kind="audiooutput"
                  onChange={(deviceId) => handleDeviceChange(deviceId, 'speaker')}
                />
              </div>
            </div>
          )}

          {/* Settings Button */}
          {onSettingsClick && (
            <button
              onClick={onSettingsClick}
              style={{
                width: '100%',
                marginTop: '6px',
                padding: '4px',
                backgroundColor: '#4f545c',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                fontSize: '11px',
                cursor: 'pointer',
              }}
            >
              More Settings
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default VoiceControls;