'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff,
  Monitor, 
  MonitorOff,
  Settings, 
  PhoneOff,
  ChevronUp,
  ChevronDown,
  Grid3x3,
  Users,
  Maximize,
  Camera,
  Headphones
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocalVideo } from '@/hooks/use-local-video';

export interface VideoDevice {
  deviceId: string;
  label: string;
  kind: 'videoinput';
}

export interface VideoQuality {
  width: number;
  height: number;
  frameRate: number;
  label: string;
}

interface VideoControlsProps {
  // Media state
  isCameraEnabled: boolean;
  isMicrophoneEnabled: boolean;
  isScreenSharing: boolean;
  
  // Layout state
  layoutMode: 'grid' | 'speaker' | 'fullscreen';
  participantCount: number;
  
  // Actions
  onCameraToggle: () => Promise<void>;
  onMicrophoneToggle: () => Promise<void>;
  onScreenShareToggle: () => Promise<void>;
  onLayoutChange: (mode: 'grid' | 'speaker' | 'fullscreen') => void;
  onDisconnect: () => void;
  onSettingsClick?: () => void;
  onDeviceChange?: (type: 'camera' | 'microphone', deviceId: string) => void;
  
  // Style options
  className?: string;
  compact?: boolean;
  position?: 'bottom' | 'top' | 'floating';
}

interface DropdownMenuProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

function DropdownMenu({ isOpen, onClose, children, className = '' }: DropdownMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className={cn(
        'absolute bottom-full mb-2 bg-[#1e1f22] border border-[#40444b] rounded-lg shadow-lg',
        'min-w-[200px] py-2 z-50',
        className
      )}
    >
      {children}
    </div>
  );
}

interface ControlButtonProps {
  onClick: () => void;
  isActive?: boolean;
  isEnabled?: boolean;
  tooltip: string;
  children: React.ReactNode;
  variant?: 'default' | 'danger' | 'success';
  hasDropdown?: boolean;
  onDropdownClick?: () => void;
  disabled?: boolean;
}

function ControlButton({ 
  onClick, 
  isActive, 
  isEnabled = true,
  tooltip, 
  children, 
  variant = 'default',
  hasDropdown = false,
  onDropdownClick,
  disabled = false,
}: ControlButtonProps) {
  const getButtonClasses = () => {
    const base = cn(
      'flex items-center justify-center transition-all',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#2f3136]',
      disabled && 'opacity-50 cursor-not-allowed',
      hasDropdown ? 'rounded-l-lg' : 'rounded-lg'
    );
    
    if (variant === 'danger') {
      return cn(base, 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-400 h-10 px-3');
    }
    
    if (variant === 'success') {
      return cn(base, 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-400 h-10 px-3');
    }
    
    // Toggle states for default variant
    if (isActive === false || (isEnabled !== undefined && !isEnabled)) {
      return cn(base, 'bg-red-500/80 hover:bg-red-500 text-white focus:ring-red-400 h-10 px-3');
    }
    
    return cn(base, 'bg-[#3c3f45] hover:bg-[#4a4d55] text-white focus:ring-white/20 h-10 px-3');
  };

  const getDropdownClasses = () => {
    if (variant === 'danger') {
      return 'bg-red-500 hover:bg-red-600 text-white border-l border-red-400';
    }
    if (isActive === false || (isEnabled !== undefined && !isEnabled)) {
      return 'bg-red-500/80 hover:bg-red-500 text-white border-l border-red-400';
    }
    return 'bg-[#3c3f45] hover:bg-[#4a4d55] text-white border-l border-[#5a5d65]';
  };

  return (
    <div className="flex">
      <button
        onClick={disabled ? undefined : onClick}
        className={getButtonClasses()}
        title={tooltip}
        aria-label={tooltip}
        disabled={disabled}
      >
        {children}
      </button>
      
      {hasDropdown && onDropdownClick && (
        <button
          onClick={onDropdownClick}
          className={cn(
            'rounded-r-lg h-10 px-2 transition-all',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#2f3136]',
            getDropdownClasses()
          )}
          aria-label="Device options"
        >
          <ChevronUp className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

export function VideoControls({
  isCameraEnabled,
  isMicrophoneEnabled,
  isScreenSharing,
  layoutMode,
  participantCount,
  onCameraToggle,
  onMicrophoneToggle,
  onScreenShareToggle,
  onLayoutChange,
  onDisconnect,
  onSettingsClick,
  onDeviceChange,
  className = '',
  compact = false,
  position = 'bottom',
}: VideoControlsProps) {
  const [cameraDropdownOpen, setCameraDropdownOpen] = useState(false);
  const [microphoneDropdownOpen, setMicrophoneDropdownOpen] = useState(false);
  const [layoutDropdownOpen, setLayoutDropdownOpen] = useState(false);

  const {
    videoDevices,
    selectedDevice: selectedVideoDevice,
  } = useLocalVideo();

  // Mock audio devices for now since current hook doesn't support them
  const audioDevices: any[] = [];
  const selectedAudioDevice = null;

  const handleDeviceSelect = useCallback((type: 'camera' | 'microphone', deviceId: string) => {
    onDeviceChange?.(type, deviceId);
    setCameraDropdownOpen(false);
    setMicrophoneDropdownOpen(false);
  }, [onDeviceChange]);

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50';
      case 'floating':
        return 'absolute bottom-4 right-4 z-50';
      default:
        return 'fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50';
    }
  };

  if (compact) {
    return (
      <div 
        className={cn(
          'flex items-center gap-1 p-2 rounded-lg',
          'bg-[#232428]/95 backdrop-blur-sm border border-[#2d2f34]',
          className
        )}
      >
        <ControlButton
          onClick={onCameraToggle}
          isEnabled={isCameraEnabled}
          tooltip={isCameraEnabled ? 'Turn off camera' : 'Turn on camera'}
        >
          {isCameraEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
        </ControlButton>

        <ControlButton
          onClick={onMicrophoneToggle}
          isEnabled={isMicrophoneEnabled}
          tooltip={isMicrophoneEnabled ? 'Mute' : 'Unmute'}
        >
          {isMicrophoneEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
        </ControlButton>

        <ControlButton
          onClick={onDisconnect}
          tooltip="Leave call"
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
        getPositionClasses(),
        'flex items-center gap-3 px-4 py-3 rounded-xl',
        'bg-[#1e1f22]/95 backdrop-blur-sm border border-[#2d2f34]',
        'shadow-lg shadow-black/30',
        className
      )}
    >
      {/* Camera controls */}
      <div className="relative">
        <ControlButton
          onClick={onCameraToggle}
          isEnabled={isCameraEnabled}
          tooltip={isCameraEnabled ? 'Turn off camera' : 'Turn on camera'}
          hasDropdown={videoDevices.length > 1}
          onDropdownClick={() => setCameraDropdownOpen(!cameraDropdownOpen)}
        >
          {isCameraEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </ControlButton>

        <DropdownMenu
          isOpen={cameraDropdownOpen}
          onClose={() => setCameraDropdownOpen(false)}
        >
          <div className="px-3 py-2 text-sm font-medium text-gray-300 border-b border-[#40444b]">
            Camera
          </div>
          {videoDevices.map((device) => (
            <button
              key={device.deviceId}
              onClick={() => handleDeviceSelect('camera', device.deviceId)}
              className={cn(
                'w-full px-3 py-2 text-left text-sm hover:bg-[#3c3f45] transition-colors',
                'flex items-center gap-2',
                selectedVideoDevice === device.deviceId && 'bg-[#3c3f45] text-blue-400'
              )}
            >
              <Camera className="w-4 h-4" />
              <span className="truncate">{device.label}</span>
              {selectedVideoDevice === device.deviceId && (
                <span className="ml-auto text-xs text-blue-400">●</span>
              )}
            </button>
          ))}
        </DropdownMenu>
      </div>

      {/* Microphone controls */}
      <div className="relative">
        <ControlButton
          onClick={onMicrophoneToggle}
          isEnabled={isMicrophoneEnabled}
          tooltip={isMicrophoneEnabled ? 'Mute' : 'Unmute'}
          hasDropdown={audioDevices.length > 1}
          onDropdownClick={() => setMicrophoneDropdownOpen(!microphoneDropdownOpen)}
        >
          {isMicrophoneEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </ControlButton>

        <DropdownMenu
          isOpen={microphoneDropdownOpen}
          onClose={() => setMicrophoneDropdownOpen(false)}
        >
          <div className="px-3 py-2 text-sm font-medium text-gray-300 border-b border-[#40444b]">
            Microphone
          </div>
          {audioDevices.map((device) => (
            <button
              key={device.deviceId}
              onClick={() => handleDeviceSelect('microphone', device.deviceId)}
              className={cn(
                'w-full px-3 py-2 text-left text-sm hover:bg-[#3c3f45] transition-colors',
                'flex items-center gap-2',
                selectedAudioDevice === device.deviceId && 'bg-[#3c3f45] text-blue-400'
              )}
            >
              <Headphones className="w-4 h-4" />
              <span className="truncate">{device.label}</span>
              {selectedAudioDevice === device.deviceId && (
                <span className="ml-auto text-xs text-blue-400">●</span>
              )}
            </button>
          ))}
        </DropdownMenu>
      </div>

      <div className="w-px h-6 bg-[#3c3f45]" />

      {/* Screen share */}
      <ControlButton
        onClick={onScreenShareToggle}
        isActive={isScreenSharing}
        tooltip={isScreenSharing ? 'Stop sharing' : 'Share screen'}
      >
        {isScreenSharing ? 
          <Monitor className="w-5 h-5 text-green-400" /> : 
          <MonitorOff className="w-5 h-5" />
        }
      </ControlButton>

      {/* Layout controls */}
      <div className="relative">
        <ControlButton
          onClick={() => setLayoutDropdownOpen(!layoutDropdownOpen)}
          tooltip="Layout options"
        >
          {layoutMode === 'grid' ? <Grid3x3 className="w-5 h-5" /> :
           layoutMode === 'speaker' ? <Users className="w-5 h-5" /> :
           <Maximize className="w-5 h-5" />}
        </ControlButton>

        <DropdownMenu
          isOpen={layoutDropdownOpen}
          onClose={() => setLayoutDropdownOpen(false)}
        >
          <div className="px-3 py-2 text-sm font-medium text-gray-300 border-b border-[#40444b]">
            Layout
          </div>
          <button
            onClick={() => {
              onLayoutChange('grid');
              setLayoutDropdownOpen(false);
            }}
            className={cn(
              'w-full px-3 py-2 text-left text-sm hover:bg-[#3c3f45] transition-colors',
              'flex items-center gap-2',
              layoutMode === 'grid' && 'bg-[#3c3f45] text-blue-400'
            )}
          >
            <Grid3x3 className="w-4 h-4" />
            <span>Grid View</span>
            {layoutMode === 'grid' && <span className="ml-auto text-xs text-blue-400">●</span>}
          </button>
          <button
            onClick={() => {
              onLayoutChange('speaker');
              setLayoutDropdownOpen(false);
            }}
            className={cn(
              'w-full px-3 py-2 text-left text-sm hover:bg-[#3c3f45] transition-colors',
              'flex items-center gap-2',
              layoutMode === 'speaker' && 'bg-[#3c3f45] text-blue-400'
            )}
          >
            <Users className="w-4 h-4" />
            <span>Speaker View</span>
            {layoutMode === 'speaker' && <span className="ml-auto text-xs text-blue-400">●</span>}
          </button>
          <button
            onClick={() => {
              onLayoutChange('fullscreen');
              setLayoutDropdownOpen(false);
            }}
            className={cn(
              'w-full px-3 py-2 text-left text-sm hover:bg-[#3c3f45] transition-colors',
              'flex items-center gap-2',
              layoutMode === 'fullscreen' && 'bg-[#3c3f45] text-blue-400'
            )}
          >
            <Maximize className="w-4 h-4" />
            <span>Fullscreen</span>
            {layoutMode === 'fullscreen' && <span className="ml-auto text-xs text-blue-400">●</span>}
          </button>
        </DropdownMenu>
      </div>

      <div className="w-px h-6 bg-[#3c3f45]" />

      {/* Settings */}
      {onSettingsClick && (
        <ControlButton
          onClick={onSettingsClick}
          tooltip="Video settings"
        >
          <Settings className="w-5 h-5" />
        </ControlButton>
      )}

      {/* Disconnect */}
      <ControlButton
        onClick={onDisconnect}
        tooltip="Leave call"
        variant="danger"
      >
        <PhoneOff className="w-5 h-5" />
      </ControlButton>

      {/* Participant count indicator */}
      {participantCount > 0 && (
        <div className="flex items-center gap-2 px-3 py-1 bg-[#3c3f45] rounded-lg text-sm text-gray-300">
          <Users className="w-4 h-4" />
          <span>{participantCount}</span>
        </div>
      )}
    </div>
  );
}

export default VideoControls;