'use client';

import React, { useState, useCallback } from 'react';
import { Monitor, MonitorOff, ChevronDown, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScreenShare } from '@/hooks/use-screenshare';
import { ScreenShareSource } from '@/services/screenshare';
import { ScreenSharePreview } from './screenshare-preview';

interface ScreenShareButtonProps {
  /** Style variant */
  variant?: 'default' | 'compact' | 'floating';
  /** Custom className */
  className?: string;
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Show dropdown for source selection */
  showDropdown?: boolean;
  /** Button tooltip */
  tooltip?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Event handlers */
  onSharingStart?: (source: ScreenShareSource) => void;
  onSharingStop?: () => void;
  onError?: (error: string) => void;
}

export function ScreenShareButton({
  variant = 'default',
  className = '',
  size = 'md',
  showDropdown = true,
  tooltip,
  disabled = false,
  onSharingStart,
  onSharingStop,
  onError,
}: ScreenShareButtonProps) {
  const {
    isSharing,
    isSelectingSource,
    startSourceSelection,
    stopScreenSharing,
    error,
    clearError,
  } = useScreenShare();

  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handle quick toggle (no source selection)
  const handleQuickToggle = useCallback(async () => {
    if (isSharing) {
      // Stop sharing
      setIsLoading(true);
      try {
        await stopScreenSharing();
        onSharingStop?.();
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to stop screen sharing';
        onError?.(errorMsg);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Start sharing with default source
      setIsLoading(true);
      try {
        setShowPreview(true);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to start screen sharing';
        onError?.(errorMsg);
        setIsLoading(false);
      }
    }
  }, [isSharing, stopScreenSharing, onSharingStop, onError]);

  // Handle dropdown click
  const handleDropdownClick = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isSharing) {
      // If sharing, stop immediately
      await handleQuickToggle();
    } else {
      // Show source selection
      setShowPreview(true);
    }
  }, [isSharing, handleQuickToggle]);

  // Handle source selection from preview
  const handleSourceSelected = useCallback((source: ScreenShareSource) => {
    setShowPreview(false);
    setIsLoading(false);
    onSharingStart?.(source);
    clearError();
  }, [onSharingStart, clearError]);

  // Handle preview cancel
  const handlePreviewCancel = useCallback(() => {
    setShowPreview(false);
    setIsLoading(false);
    clearError();
  }, [clearError]);

  // Get button size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-8 px-2';
      case 'lg':
        return 'h-12 px-4';
      default:
        return 'h-10 px-3';
    }
  };

  // Get icon size classes
  const getIconSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-5 h-5';
    }
  };

  // Get button variant classes
  const getVariantClasses = () => {
    const base = cn(
      'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#2f3136]',
      disabled && 'opacity-50 cursor-not-allowed'
    );

    if (variant === 'compact') {
      return cn(base, 'rounded-lg');
    }

    if (variant === 'floating') {
      return cn(base, 'rounded-full shadow-lg');
    }

    return cn(base, showDropdown ? 'rounded-l-lg' : 'rounded-lg');
  };

  // Get button state classes
  const getStateClasses = () => {
    if (isSharing) {
      return 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-400';
    }
    
    if (isSelectingSource || isLoading) {
      return 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-400';
    }

    return 'bg-[#3c3f45] hover:bg-[#4a4d55] text-white focus:ring-white/20';
  };

  // Get dropdown classes
  const getDropdownClasses = () => {
    const base = cn(
      'rounded-r-lg border-l transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#2f3136]',
      getSizeClasses().split(' ')[0], // Just height
      'px-2'
    );

    if (isSharing) {
      return cn(base, 'bg-green-600 hover:bg-green-700 border-green-500 text-white');
    }
    
    if (isSelectingSource || isLoading) {
      return cn(base, 'bg-blue-600 hover:bg-blue-700 border-blue-500 text-white');
    }

    return cn(base, 'bg-[#3c3f45] hover:bg-[#4a4d55] border-[#5a5d65] text-white');
  };

  const buttonTooltip = tooltip || (isSharing ? 'Stop screen sharing' : 'Share your screen');

  return (
    <>
      <div className={cn('flex items-center', className)}>
        {/* Main button */}
        <button
          onClick={handleQuickToggle}
          disabled={disabled || isLoading}
          className={cn(
            getVariantClasses(),
            getStateClasses(),
            getSizeClasses(),
            'flex items-center justify-center gap-2'
          )}
          title={buttonTooltip}
          aria-label={buttonTooltip}
          aria-pressed={isSharing}
          role="switch"
        >
          {isLoading || isSelectingSource ? (
            <Loader2 className={cn(getIconSizeClasses(), 'animate-spin')} />
          ) : isSharing ? (
            <Monitor className={getIconSizeClasses()} />
          ) : (
            <MonitorOff className={getIconSizeClasses()} />
          )}
          
          {variant !== 'compact' && size !== 'sm' && (
            <span className="text-sm font-medium">
              {isSharing ? 'Sharing' : 'Share Screen'}
            </span>
          )}
        </button>

        {/* Dropdown button */}
        {showDropdown && variant !== 'compact' && (
          <button
            onClick={handleDropdownClick}
            disabled={disabled || isLoading}
            className={getDropdownClasses()}
            title="Screen share options"
            aria-label="Screen share options"
          >
            <ChevronDown className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Source selection preview */}
      {showPreview && (
        <ScreenSharePreview
          isOpen={showPreview}
          onSourceSelect={handleSourceSelected}
          onCancel={handlePreviewCancel}
          error={error}
        />
      )}
    </>
  );
}

export default ScreenShareButton;