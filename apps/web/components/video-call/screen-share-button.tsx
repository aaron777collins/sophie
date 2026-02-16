'use client';

import React, { useState } from 'react';
import { Monitor, Square, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import { useScreenShare, ScreenShareOptions } from '@/hooks';
import type { Room } from 'livekit-client';

export interface ScreenShareButtonProps {
  /** LiveKit room instance */
  room?: Room;
  /** Whether the button should be disabled */
  disabled?: boolean;
  /** Whether the user is currently in a call */
  inCall?: boolean;
  /** Button size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Button style variant */
  variant?: 'primary' | 'secondary' | 'danger';
  /** Whether to show the dropdown for screen share options */
  showOptions?: boolean;
  /** Default screen share options */
  defaultOptions?: ScreenShareOptions;
  /** Custom button text when not sharing */
  startText?: string;
  /** Custom button text when sharing */
  stopText?: string;
  /** Whether to show icon only (no text) */
  iconOnly?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Callback when screen share starts */
  onScreenShareStart?: () => void;
  /** Callback when screen share stops */
  onScreenShareStop?: () => void;
  /** Callback when error occurs */
  onError?: (error: string) => void;
}

export const ScreenShareButton: React.FC<ScreenShareButtonProps> = ({
  room,
  disabled = false,
  inCall = true,
  size = 'md',
  variant = 'secondary',
  showOptions = false,
  defaultOptions,
  startText = 'Share Screen',
  stopText = 'Stop Sharing',
  iconOnly = false,
  className = '',
  onScreenShareStart,
  onScreenShareStop,
  onError,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentOptions, setCurrentOptions] = useState<ScreenShareOptions>(defaultOptions || {});

  const {
    isScreenSharing,
    isStarting,
    isStopping,
    error,
    isSupported,
    startScreenShare,
    stopScreenShare,
  } = useScreenShare({
    room,
    defaultOptions: currentOptions,
    onScreenShareStart: () => {
      onScreenShareStart?.();
      setShowDropdown(false);
    },
    onScreenShareStop: () => {
      onScreenShareStop?.();
    },
    onError: (err) => {
      onError?.(err.message);
    },
  });

  // Button is disabled if not supported, explicitly disabled, not in call, or during transitions
  const isButtonDisabled = !isSupported || disabled || !inCall || isStarting || isStopping;

  const handleClick = async () => {
    if (isScreenSharing) {
      await stopScreenShare();
    } else if (showOptions) {
      setShowDropdown(!showDropdown);
    } else {
      await startScreenShare(currentOptions);
    }
  };

  const handleOptionStart = async (options: ScreenShareOptions) => {
    setCurrentOptions(options);
    await startScreenShare(options);
  };

  // Get button content based on state
  const getButtonContent = () => {
    if (isStarting) {
      return (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          {!iconOnly && 'Starting...'}
        </>
      );
    }

    if (isStopping) {
      return (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          {!iconOnly && 'Stopping...'}
        </>
      );
    }

    if (isScreenSharing) {
      return (
        <>
          <Square className="w-4 h-4" />
          {!iconOnly && stopText}
        </>
      );
    }

    return (
      <>
        <Monitor className="w-4 h-4" />
        {!iconOnly && startText}
      </>
    );
  };

  // Get button variant based on state
  const getButtonVariant = () => {
    if (isScreenSharing) {
      return 'danger';
    }
    return variant;
  };

  // Convert size prop to Button size
  const buttonSize = size === 'sm' ? 'small' : size === 'lg' ? 'large' : 'medium';

  // Render not supported state
  if (!isSupported) {
    return (
      <Button
        variant="secondary"
        size={buttonSize}
        disabled={true}
        className={`${className} opacity-50 cursor-not-allowed`}
        aria-label="Screen sharing not supported"
      >
        <AlertCircle className="w-4 h-4" />
        {!iconOnly && 'Not Supported'}
      </Button>
    );
  }

  return (
    <div className="relative">
      <Button
        variant={getButtonVariant()}
        size={buttonSize}
        disabled={isButtonDisabled}
        onClick={handleClick}
        className={`${className} transition-all duration-200 ${
          isScreenSharing ? 'ring-2 ring-red-500 ring-opacity-50' : ''
        }`}
        aria-label={isScreenSharing ? 'Stop screen sharing' : 'Start screen sharing'}
        aria-pressed={isScreenSharing}
      >
        {getButtonContent()}
      </Button>

      {/* Options Dropdown */}
      {showOptions && showDropdown && !isScreenSharing && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
              Screen Share Options
            </h3>
            
            {/* Display Surface Options */}
            <div className="space-y-2 mb-4">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                Share:
              </label>
              <div className="space-y-2">
                <button
                  onClick={() => handleOptionStart({ displaySurface: 'monitor' })}
                  className="w-full flex items-center px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <Monitor className="w-4 h-4 mr-2" />
                  Entire Screen
                </button>
                <button
                  onClick={() => handleOptionStart({ displaySurface: 'window' })}
                  className="w-full flex items-center px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Application Window
                </button>
                <button
                  onClick={() => handleOptionStart({ displaySurface: 'browser' })}
                  className="w-full flex items-center px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Browser Tab
                </button>
              </div>
            </div>

            {/* Audio Option */}
            <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={currentOptions.includeAudio || false}
                  onChange={(e) =>
                    setCurrentOptions(prev => ({ ...prev, includeAudio: e.target.checked }))
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-xs text-gray-700 dark:text-gray-300">
                  Share audio
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="absolute top-full left-0 mt-1 px-3 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs rounded-md whitespace-nowrap z-40">
          {error}
        </div>
      )}
    </div>
  );
};