'use client';

import { useCallback, useEffect, KeyboardEvent as ReactKeyboardEvent } from 'react';
import { 
  Mic, 
  MicOff, 
  Headphones, 
  VolumeX, 
  Settings, 
  PhoneOff,
  Video,
  VideoOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVoiceChannel } from '@/hooks/use-voice-channel';
import { useVoiceStore } from '@/stores/voice-store';
import { ScreenShareButton } from '@/components/screenshare';

interface VoiceControlsProps {
  roomName?: string;
  userId?: string;
  className?: string;
  onSettingsClick?: () => void;
  /** Compact mode for sidebar */
  compact?: boolean;
}

interface ControlButtonProps {
  onClick: () => void;
  isActive?: boolean;
  tooltip: string;
  children: React.ReactNode;
  variant?: 'default' | 'danger' | 'success';
  'aria-pressed'?: boolean;
  disabled?: boolean;
}

function ControlButton({ 
  onClick, 
  isActive, 
  tooltip, 
  children, 
  variant = 'default',
  'aria-pressed': ariaPressed,
  disabled = false,
}: ControlButtonProps) {
  const getButtonClasses = () => {
    const base = cn(
      'w-10 h-10 rounded-full transition-all flex items-center justify-center',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#2f3136]',
      disabled && 'opacity-50 cursor-not-allowed'
    );
    
    if (variant === 'danger') {
      return cn(base, 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-400');
    }
    
    if (variant === 'success') {
      return cn(base, 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-400');
    }
    
    // Toggle states for default variant
    if (isActive === false) {
      return cn(base, 'bg-red-500/80 hover:bg-red-500 text-white focus:ring-red-400');
    }
    
    if (isActive === true) {
      return cn(base, 'bg-[#3c3f45] hover:bg-[#4a4d55] text-white focus:ring-white/20');
    }
    
    return cn(base, 'bg-[#3c3f45] hover:bg-[#4a4d55] text-white focus:ring-white/20');
  };

  const handleKeyDown = (e: ReactKeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!disabled) onClick();
    }
  };

  return (
    <button
      onClick={disabled ? undefined : onClick}
      onKeyDown={handleKeyDown}
      className={getButtonClasses()}
      title={tooltip}
      aria-label={tooltip}
      aria-pressed={ariaPressed}
      disabled={disabled}
      role="switch"
    >
      {children}
    </button>
  );
}

export function VoiceControls({ 
  roomName, 
  userId, 
  className = '', 
  onSettingsClick,
  compact = false,
}: VoiceControlsProps) {
  const {
    isConnected,
    isAudioEnabled,
    isVideoEnabled,
    toggleAudio,
    toggleVideo,
    disconnect,
  } = useVoiceChannel({
    roomName: roomName || '',
    userId: userId || '',
  });

  const { isDeafened, setDeafened } = useVoiceStore();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      // Only handle when not typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Ctrl/Cmd + Shift + M = Toggle Mute
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'M') {
        e.preventDefault();
        toggleAudio();
      }
      
      // Ctrl/Cmd + Shift + D = Toggle Deafen
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        handleDeafenToggle();
      }

      // Ctrl/Cmd + Shift + V = Toggle Video
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'V') {
        e.preventDefault();
        toggleVideo();
      }
    };

    if (isConnected) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isConnected, toggleAudio, toggleVideo]);

  const handleDeafenToggle = useCallback(() => {
    const newDeafened = !isDeafened;
    setDeafened(newDeafened);
    
    // When deafening, also mute if currently unmuted
    if (newDeafened && isAudioEnabled) {
      toggleAudio();
    }
  }, [isDeafened, setDeafened, isAudioEnabled, toggleAudio]);

  const handleDisconnect = useCallback(() => {
    disconnect();
  }, [disconnect]);

  if (!isConnected) {
    return null;
  }

  if (compact) {
    return (
      <div 
        className={cn(
          'flex items-center gap-1 p-1 rounded bg-[#232428]',
          className
        )}
        role="toolbar"
        aria-label="Voice controls"
      >
        <ControlButton
          onClick={toggleAudio}
          isActive={isAudioEnabled}
          tooltip={isAudioEnabled ? 'Mute (Ctrl+Shift+M)' : 'Unmute (Ctrl+Shift+M)'}
          aria-pressed={!isAudioEnabled}
        >
          {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </ControlButton>

        <ControlButton
          onClick={handleDeafenToggle}
          isActive={!isDeafened}
          tooltip={isDeafened ? 'Undeafen (Ctrl+Shift+D)' : 'Deafen (Ctrl+Shift+D)'}
          aria-pressed={isDeafened}
        >
          {isDeafened ? <VolumeX className="w-4 h-4" /> : <Headphones className="w-4 h-4" />}
        </ControlButton>

        <ScreenShareButton
          variant="compact"
          size="sm"
          showDropdown={false}
          className="w-8 h-8 min-w-8"
        />

        <ControlButton
          onClick={handleDisconnect}
          tooltip="Disconnect"
          variant="danger"
        >
          <PhoneOff className="w-4 h-4" />
        </ControlButton>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        'fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50',
        'flex items-center gap-2 px-4 py-3 rounded-xl',
        'bg-[#1e1f22]/95 backdrop-blur-sm border border-[#2d2f34]',
        'shadow-lg shadow-black/30',
        className
      )}
      role="toolbar"
      aria-label="Voice controls"
    >
      {/* Microphone toggle */}
      <ControlButton
        onClick={toggleAudio}
        isActive={isAudioEnabled}
        tooltip={isAudioEnabled ? 'Mute (Ctrl+Shift+M)' : 'Unmute (Ctrl+Shift+M)'}
        aria-pressed={!isAudioEnabled}
      >
        {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
      </ControlButton>

      {/* Deafen toggle */}
      <ControlButton
        onClick={handleDeafenToggle}
        isActive={!isDeafened}
        tooltip={isDeafened ? 'Undeafen (Ctrl+Shift+D)' : 'Deafen (Ctrl+Shift+D)'}
        aria-pressed={isDeafened}
      >
        {isDeafened ? <VolumeX className="w-5 h-5" /> : <Headphones className="w-5 h-5" />}
      </ControlButton>

      {/* Separator */}
      <div className="w-px h-6 bg-[#3c3f45] mx-1" aria-hidden="true" />

      {/* Video toggle */}
      <ControlButton
        onClick={toggleVideo}
        isActive={isVideoEnabled}
        tooltip={isVideoEnabled ? 'Turn off camera (Ctrl+Shift+V)' : 'Turn on camera (Ctrl+Shift+V)'}
        aria-pressed={isVideoEnabled}
      >
        {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
      </ControlButton>

      {/* Screen share toggle */}
      <ScreenShareButton
        variant="default"
        size="md"
        showDropdown={true}
      />

      {/* Separator */}
      <div className="w-px h-6 bg-[#3c3f45] mx-1" aria-hidden="true" />

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
