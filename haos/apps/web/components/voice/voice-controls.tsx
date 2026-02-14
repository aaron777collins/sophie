'use client';

import { Mic, MicOff, Headphones, HeadphonesIcon as Deafen, Settings, PhoneOff, Monitor, MonitorOff } from 'lucide-react';
import { useVoiceChannel } from '@/hooks/use-voice-channel';
import { useVoiceStore } from '@/stores/voice-store';

interface VoiceControlsProps {
  roomName?: string;
  userId?: string;
  className?: string;
  onSettingsClick?: () => void;
}

export function VoiceControls({ 
  roomName, 
  userId, 
  className = '', 
  onSettingsClick 
}: VoiceControlsProps) {
  const {
    isConnected,
    isAudioEnabled,
    isScreenSharing,
    toggleAudio,
    toggleScreenShare,
    disconnect,
  } = useVoiceChannel({
    roomName: roomName || '',
    userId: userId || '',
  });

  const { isDeafened, setDeafened } = useVoiceStore();

  const handleDeafenToggle = () => {
    setDeafened(!isDeafened);
    
    // When deafening, also mute if currently unmuted
    if (!isDeafened && isAudioEnabled) {
      toggleAudio();
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  if (!isConnected) {
    return null;
  }

  const ControlButton = ({ 
    onClick, 
    isActive, 
    tooltip, 
    children, 
    variant = 'default' 
  }: {
    onClick: () => void;
    isActive?: boolean;
    tooltip: string;
    children: React.ReactNode;
    variant?: 'default' | 'danger';
  }) => {
    const getButtonClasses = () => {
      const base = 'w-10 h-10 rounded-full transition-all flex items-center justify-center';
      
      if (variant === 'danger') {
        return `${base} bg-red-500 hover:bg-red-600 text-white`;
      }
      
      if (isActive === false) {
        return `${base} bg-red-500 hover:bg-red-600 text-white`;
      }
      
      if (isActive === true) {
        return `${base} bg-green-500 hover:bg-green-600 text-white`;
      }
      
      return `${base} hover:bg-gray-600 text-white`;
    };

    return (
      <button
        onClick={onClick}
        className={getButtonClasses()}
        title={tooltip}
      >
        {children}
      </button>
    );
  };

  return (
    <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex items-center space-x-2 px-4 py-2 rounded-lg bg-[#2f3136] border border-[#40444b] shadow-lg ${className}`}>
      {/* Microphone toggle */}
      <ControlButton
        onClick={toggleAudio}
        isActive={isAudioEnabled}
        tooltip={isAudioEnabled ? 'Mute' : 'Unmute'}
      >
        {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
      </ControlButton>

      {/* Deafen toggle */}
      <ControlButton
        onClick={handleDeafenToggle}
        isActive={!isDeafened}
        tooltip={isDeafened ? 'Undeafen' : 'Deafen'}
      >
        {isDeafened ? <Deafen className="w-5 h-5" /> : <Headphones className="w-5 h-5" />}
      </ControlButton>

      {/* Screen share toggle */}
      <ControlButton
        onClick={toggleScreenShare}
        isActive={isScreenSharing}
        tooltip={isScreenSharing ? 'Stop sharing' : 'Share screen'}
      >
        {isScreenSharing ? <Monitor className="w-5 h-5" /> : <MonitorOff className="w-5 h-5" />}
      </ControlButton>

      {/* Settings */}
      {onSettingsClick && (
        <ControlButton
          onClick={onSettingsClick}
          tooltip="Voice Settings"
        >
          <Settings className="w-5 h-5" />
        </ControlButton>
      )}

      {/* Disconnect */}
      <ControlButton
        onClick={handleDisconnect}
        tooltip="Disconnect"
        variant="danger"
      >
        <PhoneOff className="w-5 h-5" />
      </ControlButton>
    </div>
  );
}

export default VoiceControls;