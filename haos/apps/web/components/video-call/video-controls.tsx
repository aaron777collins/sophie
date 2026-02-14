'use client';

import React, { useState, useCallback } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff,
  Monitor, 
  MonitorOff,
  PhoneOff,
  MoreHorizontal,
  Users,
  Settings,
  Maximize2,
  Grid3x3,
  Layout,
  Webcam,
  MicIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocalVideo } from '@/hooks/use-local-video';

export interface VideoCallControlsProps {
  // Media state
  isCameraEnabled: boolean;
  isMicrophoneEnabled: boolean;
  isScreenSharing: boolean;
  isRecording?: boolean;
  
  // Layout state
  layoutMode: 'grid' | 'speaker' | 'fullscreen';
  participantCount: number;
  isPictureInPicture?: boolean;
  
  // Actions
  onCameraToggle: () => Promise<void>;
  onMicrophoneToggle: () => Promise<void>;
  onScreenShareToggle: () => Promise<void>;
  onLayoutChange: (mode: 'grid' | 'speaker' | 'fullscreen') => void;
  onPictureInPictureToggle?: () => void;
  onDisconnect: () => void;
  onSettingsClick?: () => void;
  onDeviceChange?: (type: 'camera' | 'microphone', deviceId: string) => void;
  onRecordingToggle?: () => void;
  
  // Style options
  className?: string;
  variant?: 'compact' | 'full' | 'minimal';
  position?: 'bottom' | 'top' | 'floating';
  showParticipantCount?: boolean;
  enablePictureInPicture?: boolean;
}

interface ControlButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  isEnabled?: boolean;
  variant?: 'default' | 'danger' | 'success' | 'accent';
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  showLabel?: boolean;
}

function ControlButton({ 
  icon, 
  label, 
  isActive = true, 
  isEnabled = true,
  variant = 'default', 
  onClick, 
  disabled = false,
  className = '',
  showLabel = false
}: ControlButtonProps) {
  const getVariantClasses = () => {
    if (disabled) {
      return 'bg-gray-600/50 text-gray-400 cursor-not-allowed';
    }

    switch (variant) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'success':
        return 'bg-green-600 hover:bg-green-700 text-white';
      case 'accent':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      default:
        if (!isEnabled || isActive === false) {
          return 'bg-red-500/80 hover:bg-red-500 text-white';
        }
        return 'bg-[#404249] hover:bg-[#4a4d55] text-white';
    }
  };

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={cn(
        'flex items-center justify-center rounded-xl transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50',
        showLabel ? 'px-4 py-3 gap-2' : 'w-12 h-12',
        getVariantClasses(),
        className
      )}
    >
      {icon}
      {showLabel && <span className="text-sm font-medium">{label}</span>}
    </button>
  );
}

interface LayoutSelectorProps {
  currentLayout: 'grid' | 'speaker' | 'fullscreen';
  onLayoutChange: (layout: 'grid' | 'speaker' | 'fullscreen') => void;
}

function LayoutSelector({ currentLayout, onLayoutChange }: LayoutSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const layouts = [
    { id: 'grid' as const, icon: Grid3x3, label: 'Grid View' },
    { id: 'speaker' as const, icon: Users, label: 'Speaker View' },
    { id: 'fullscreen' as const, icon: Maximize2, label: 'Fullscreen' }
  ];

  const currentLayoutConfig = layouts.find(l => l.id === currentLayout);

  return (
    <div className="relative">
      <ControlButton
        icon={currentLayoutConfig ? <currentLayoutConfig.icon className="w-5 h-5" /> : <Layout className="w-5 h-5" />}
        label="Change layout"
        onClick={() => setIsOpen(!isOpen)}
      />

      {isOpen && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-[#2f3136] border border-[#40444b] rounded-lg shadow-xl py-2 min-w-[160px] z-50">
          {layouts.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => {
                onLayoutChange(id);
                setIsOpen(false);
              }}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 text-sm text-white hover:bg-[#40444b] transition-colors',
                currentLayout === id && 'bg-[#40444b] text-blue-400'
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
              {currentLayout === id && <span className="ml-auto text-xs">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface DeviceSelectorProps {
  type: 'camera' | 'microphone';
  currentDevice?: string;
  onDeviceChange: (deviceId: string) => void;
}

function DeviceSelector({ type, currentDevice, onDeviceChange }: DeviceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { videoDevices } = useLocalVideo();

  // Mock audio devices - in real app, would come from audio hook
  const audioDevices = [
    { deviceId: 'default', label: 'Default Microphone' },
    { deviceId: 'communications', label: 'Default Communications Device' }
  ];

  const devices = type === 'camera' ? videoDevices : audioDevices;
  const icon = type === 'camera' ? Webcam : MicIcon;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-400 hover:text-white hover:bg-[#40444b] rounded-lg transition-colors"
        title={`Select ${type}`}
      >
        {React.createElement(icon, { className: 'w-4 h-4' })}
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 left-0 bg-[#2f3136] border border-[#40444b] rounded-lg shadow-xl py-2 min-w-[200px] z-50">
          <div className="px-3 py-1 text-xs text-gray-400 uppercase tracking-wide border-b border-[#40444b] mb-1">
            {type === 'camera' ? 'Camera' : 'Microphone'}
          </div>
          {devices.map((device) => (
            <button
              key={device.deviceId}
              onClick={() => {
                onDeviceChange(device.deviceId);
                setIsOpen(false);
              }}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-[#40444b] transition-colors',
                currentDevice === device.deviceId && 'bg-[#40444b] text-blue-400'
              )}
            >
              <span className="truncate">{device.label}</span>
              {currentDevice === device.deviceId && <span className="ml-auto text-xs">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function VideoCallControls({
  isCameraEnabled,
  isMicrophoneEnabled,
  isScreenSharing,
  isRecording = false,
  layoutMode,
  participantCount,
  isPictureInPicture = false,
  onCameraToggle,
  onMicrophoneToggle,
  onScreenShareToggle,
  onLayoutChange,
  onPictureInPictureToggle,
  onDisconnect,
  onSettingsClick,
  onDeviceChange,
  onRecordingToggle,
  className = '',
  variant = 'full',
  position = 'bottom',
  showParticipantCount = true,
  enablePictureInPicture = true
}: VideoCallControlsProps) {
  const [showDeviceMenu, setShowDeviceMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const handleDeviceChange = useCallback((type: 'camera' | 'microphone', deviceId: string) => {
    onDeviceChange?.(type, deviceId);
  }, [onDeviceChange]);

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'floating':
        return 'bottom-4 right-4';
      default:
        return 'bottom-6 left-1/2 transform -translate-x-1/2';
    }
  };

  if (variant === 'minimal') {
    return (
      <div className={cn(
        'fixed z-50 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2',
        getPositionClasses(),
        className
      )}>
        <ControlButton
          icon={isCameraEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
          label={isCameraEnabled ? 'Turn off camera' : 'Turn on camera'}
          isEnabled={isCameraEnabled}
          onClick={onCameraToggle}
        />
        <ControlButton
          icon={isMicrophoneEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          label={isMicrophoneEnabled ? 'Mute' : 'Unmute'}
          isEnabled={isMicrophoneEnabled}
          onClick={onMicrophoneToggle}
        />
        <ControlButton
          icon={<PhoneOff className="w-4 h-4" />}
          label="Leave call"
          variant="danger"
          onClick={onDisconnect}
        />
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn(
        'fixed z-50 flex items-center gap-3 bg-[#1e1f22]/95 backdrop-blur-sm border border-[#2d2f34] rounded-xl px-4 py-3',
        getPositionClasses(),
        className
      )}>
        <ControlButton
          icon={isCameraEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          label={isCameraEnabled ? 'Turn off camera' : 'Turn on camera'}
          isEnabled={isCameraEnabled}
          onClick={onCameraToggle}
        />
        <ControlButton
          icon={isMicrophoneEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          label={isMicrophoneEnabled ? 'Mute' : 'Unmute'}
          isEnabled={isMicrophoneEnabled}
          onClick={onMicrophoneToggle}
        />
        <ControlButton
          icon={<PhoneOff className="w-5 h-5" />}
          label="Leave call"
          variant="danger"
          onClick={onDisconnect}
        />
      </div>
    );
  }

  // Full variant with all controls
  return (
    <div className={cn(
      'fixed z-50 flex items-center gap-3 bg-[#1e1f22]/95 backdrop-blur-sm border border-[#2d2f34] rounded-xl px-6 py-4 shadow-xl',
      getPositionClasses(),
      className
    )}>
      {/* Main controls */}
      <div className="flex items-center gap-3">
        {/* Camera with device selector */}
        <div className="relative flex items-center">
          <ControlButton
            icon={isCameraEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            label={isCameraEnabled ? 'Turn off camera' : 'Turn on camera'}
            isEnabled={isCameraEnabled}
            onClick={onCameraToggle}
          />
          {onDeviceChange && (
            <DeviceSelector
              type="camera"
              onDeviceChange={(deviceId) => handleDeviceChange('camera', deviceId)}
            />
          )}
        </div>

        {/* Microphone with device selector */}
        <div className="relative flex items-center">
          <ControlButton
            icon={isMicrophoneEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            label={isMicrophoneEnabled ? 'Mute' : 'Unmute'}
            isEnabled={isMicrophoneEnabled}
            onClick={onMicrophoneToggle}
          />
          {onDeviceChange && (
            <DeviceSelector
              type="microphone"
              onDeviceChange={(deviceId) => handleDeviceChange('microphone', deviceId)}
            />
          )}
        </div>

        {/* Screen share */}
        <ControlButton
          icon={isScreenSharing ? <Monitor className="w-5 h-5" /> : <MonitorOff className="w-5 h-5" />}
          label={isScreenSharing ? 'Stop sharing' : 'Share screen'}
          isActive={isScreenSharing}
          variant={isScreenSharing ? 'success' : 'default'}
          onClick={onScreenShareToggle}
        />

        {/* Separator */}
        <div className="w-px h-6 bg-[#404249]" />

        {/* Layout selector */}
        <LayoutSelector
          currentLayout={layoutMode}
          onLayoutChange={onLayoutChange}
        />

        {/* More options */}
        <div className="relative">
          <ControlButton
            icon={<MoreHorizontal className="w-5 h-5" />}
            label="More options"
            onClick={() => setShowMoreMenu(!showMoreMenu)}
          />

          {showMoreMenu && (
            <div className="absolute bottom-full mb-2 right-0 bg-[#2f3136] border border-[#40444b] rounded-lg shadow-xl py-2 min-w-[160px] z-50">
              {enablePictureInPicture && onPictureInPictureToggle && (
                <button
                  onClick={() => {
                    onPictureInPictureToggle();
                    setShowMoreMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white hover:bg-[#40444b] transition-colors"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span>Picture in Picture</span>
                </button>
              )}
              
              {onRecordingToggle && (
                <button
                  onClick={() => {
                    onRecordingToggle();
                    setShowMoreMenu(false);
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-[#40444b] transition-colors',
                    isRecording ? 'text-red-400' : 'text-white'
                  )}
                >
                  <div className={cn('w-2 h-2 rounded-full', isRecording ? 'bg-red-400' : 'bg-gray-400')} />
                  <span>{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
                </button>
              )}
              
              {onSettingsClick && (
                <button
                  onClick={() => {
                    onSettingsClick();
                    setShowMoreMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-white hover:bg-[#40444b] transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-[#404249]" />

        {/* Leave call */}
        <ControlButton
          icon={<PhoneOff className="w-5 h-5" />}
          label="Leave call"
          variant="danger"
          onClick={onDisconnect}
        />
      </div>

      {/* Participant count */}
      {showParticipantCount && participantCount > 0 && (
        <div className="flex items-center gap-2 px-3 py-1 bg-[#404249] rounded-lg text-sm text-gray-300 ml-3">
          <Users className="w-4 h-4" />
          <span>{participantCount}</span>
        </div>
      )}
    </div>
  );
}

export default VideoCallControls;