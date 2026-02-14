'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Monitor, 
  Square, 
  X, 
  AlertCircle, 
  Loader2,
  Check 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScreenShare } from '@/hooks/use-screenshare';
import { ScreenShareSource } from '@/services/screenshare';

interface ScreenSharePreviewProps {
  /** Whether the preview modal is open */
  isOpen: boolean;
  /** Callback when a source is selected */
  onSourceSelect: (source: ScreenShareSource) => void;
  /** Callback when preview is cancelled */
  onCancel: () => void;
  /** Error message to display */
  error?: string | null;
  /** Custom className for modal */
  className?: string;
}

interface SourceOptionProps {
  source: ScreenShareSource;
  isSelected: boolean;
  isLoading: boolean;
  onClick: (source: ScreenShareSource) => void;
}

function SourceOption({ source, isSelected, isLoading, onClick }: SourceOptionProps) {
  const handleClick = useCallback(() => {
    if (!isLoading) {
      onClick(source);
    }
  }, [source, isLoading, onClick]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'relative flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all',
        'hover:bg-[#3c3f45]/50 focus:outline-none focus:ring-2 focus:ring-blue-400',
        isSelected
          ? 'border-blue-500 bg-blue-500/10'
          : 'border-[#40444b] hover:border-[#5a5d65]',
        isLoading && 'opacity-70 cursor-not-allowed'
      )}
      aria-pressed={isSelected}
    >
      {/* Icon */}
      <div className={cn(
        'flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center',
        source.type === 'screen' 
          ? 'bg-blue-500/20 text-blue-400' 
          : 'bg-green-500/20 text-green-400'
      )}>
        {source.type === 'screen' ? (
          <Monitor className="w-6 h-6" />
        ) : (
          <Square className="w-6 h-6" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-white">
          {source.name}
        </h3>
        <p className="text-xs text-gray-400 mt-1">
          {source.type === 'screen' 
            ? 'Share your entire screen with all open applications'
            : 'Share a specific application window'
          }
        </p>
      </div>

      {/* Status indicator */}
      <div className="flex-shrink-0">
        {isLoading ? (
          <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
        ) : isSelected ? (
          <Check className="w-5 h-5 text-blue-400" />
        ) : null}
      </div>

      {/* Thumbnail placeholder */}
      {source.thumbnail && (
        <div className="absolute top-2 right-2 w-16 h-10 bg-[#2f3136] rounded border border-[#40444b] overflow-hidden">
          <img 
            src={URL.createObjectURL(source.thumbnail as any)} 
            alt="Preview"
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </div>
  );
}

export function ScreenSharePreview({
  isOpen,
  onSourceSelect,
  onCancel,
  error,
  className = '',
}: ScreenSharePreviewProps) {
  const {
    availableSources,
    startSourceSelection,
    cancelSourceSelection,
    selectAndStartSharing,
    isSelectingSource,
    clearError,
  } = useScreenShare();

  const [selectedSource, setSelectedSource] = useState<ScreenShareSource | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Load sources when modal opens
  useEffect(() => {
    if (isOpen && availableSources.length === 0) {
      loadSources();
    }
  }, [isOpen]);

  // Clear errors when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalError(null);
      clearError();
    }
  }, [isOpen, clearError]);

  const loadSources = useCallback(async () => {
    try {
      setIsLoading(true);
      setLocalError(null);
      await startSourceSelection();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load screen share sources';
      setLocalError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [startSourceSelection]);

  const handleSourceClick = useCallback((source: ScreenShareSource) => {
    setSelectedSource(source);
  }, []);

  const handleStartSharing = useCallback(async () => {
    if (!selectedSource) return;

    try {
      setIsLoading(true);
      setLocalError(null);
      
      const trackInfo = await selectAndStartSharing(selectedSource);
      onSourceSelect(selectedSource);
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to start screen sharing';
      setLocalError(errorMsg);
      setIsLoading(false);
    }
  }, [selectedSource, selectAndStartSharing, onSourceSelect]);

  const handleCancel = useCallback(() => {
    cancelSourceSelection();
    setSelectedSource(null);
    setLocalError(null);
    onCancel();
  }, [cancelSourceSelection, onCancel]);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  }, [handleCancel]);

  const currentError = error || localError;

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="screenshare-title"
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className={cn(
        'relative w-full max-w-md mx-4 bg-[#1e1f22] rounded-lg shadow-2xl border border-[#2d2f34]',
        'max-h-[80vh] flex flex-col',
        className
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2d2f34]">
          <div>
            <h2 id="screenshare-title" className="text-lg font-semibold text-white">
              Share Your Screen
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Choose what to share with others in the call
            </p>
          </div>
          
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-white transition-colors rounded-lg p-1 hover:bg-[#3c3f45]"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Error display */}
          {currentError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-400">Screen Share Error</p>
                <p className="text-xs text-red-300 mt-1">{currentError}</p>
              </div>
            </div>
          )}

          {/* Loading state */}
          {(isLoading && !availableSources.length) ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-3" />
              <p className="text-sm text-gray-400">Loading available sources...</p>
            </div>
          ) : (
            /* Source options */
            <div className="space-y-3">
              {availableSources.map((source) => (
                <SourceOption
                  key={source.id}
                  source={source}
                  isSelected={selectedSource?.id === source.id}
                  isLoading={isLoading && selectedSource?.id === source.id}
                  onClick={handleSourceClick}
                />
              ))}
              
              {availableSources.length === 0 && !isLoading && (
                <div className="text-center py-8">
                  <Monitor className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">No sources available</p>
                  <button
                    onClick={loadSources}
                    className="text-sm text-blue-400 hover:text-blue-300 mt-2"
                  >
                    Try again
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-[#2d2f34]">
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          
          <button
            onClick={handleStartSharing}
            disabled={!selectedSource || isLoading}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-blue-400',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              selectedSource && !isLoading
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-[#3c3f45] text-gray-400 cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Starting...
              </span>
            ) : (
              'Share'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ScreenSharePreview;