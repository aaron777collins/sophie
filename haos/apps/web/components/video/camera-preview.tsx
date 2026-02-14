'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Video, VideoOff, Camera, RotateCw, Settings, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VideoDevice, VideoQuality } from './video-controls';

export interface CameraPreviewProps {
  /** Whether preview is currently active */
  isActive: boolean;
  /** Available video devices */
  videoDevices: VideoDevice[];
  /** Currently selected video device */
  selectedVideoDevice?: string;
  /** Available video quality options */
  videoQualities: VideoQuality[];
  /** Currently selected video quality */
  selectedVideoQuality?: VideoQuality;
  /** Whether the preview should auto-start */
  autoStart?: boolean;
  /** Custom CSS classes */
  className?: string;
  
  // Callbacks
  onDeviceChange?: (deviceId: string) => void;
  onQualityChange?: (quality: VideoQuality) => void;
  onTogglePreview?: () => void;
  onError?: (error: string) => void;
}

const DEFAULT_QUALITY: VideoQuality = {
  width: 1280,
  height: 720,
  frameRate: 30,
  label: '720p (High)',
};

export const CameraPreview: React.FC<CameraPreviewProps> = ({
  isActive,
  videoDevices,
  selectedVideoDevice,
  videoQualities,
  selectedVideoQuality = DEFAULT_QUALITY,
  autoStart = false,
  className,
  onDeviceChange,
  onQualityChange,
  onTogglePreview,
  onError,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Check camera permission
  const checkPermission = useCallback(async () => {
    try {
      const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
      setHasPermission(permission.state === 'granted');
      
      permission.addEventListener('change', () => {
        setHasPermission(permission.state === 'granted');
      });
    } catch (err) {
      // Permissions API not supported, assume we can try to access
      setHasPermission(null);
    }
  }, []);

  // Start camera stream
  const startPreview = useCallback(async () => {
    if (!videoRef.current || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Configure constraints
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: selectedVideoDevice ? { exact: selectedVideoDevice } : undefined,
          width: { ideal: selectedVideoQuality.width },
          height: { ideal: selectedVideoQuality.height },
          frameRate: { ideal: selectedVideoQuality.frameRate },
        },
        audio: false, // Preview doesn't need audio
      };

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Attach to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setHasPermission(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access camera';
      setError(errorMessage);
      onError?.(errorMessage);
      
      // Check if permission was denied
      if (err instanceof Error && err.name === 'NotAllowedError') {
        setHasPermission(false);
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedVideoDevice, selectedVideoQuality, onError]);

  // Stop camera stream
  const stopPreview = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setError(null);
  }, []);

  // Initialize permission check
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  // Auto-start preview
  useEffect(() => {
    if (autoStart && isActive && !isLoading && !streamRef.current) {
      startPreview();
    }
  }, [autoStart, isActive, startPreview, isLoading]);

  // Handle active state changes
  useEffect(() => {
    if (isActive && !streamRef.current && !autoStart) {
      // Don't auto-start if not enabled
      return;
    }
    
    if (!isActive && streamRef.current) {
      stopPreview();
    }
  }, [isActive, stopPreview, autoStart]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopPreview();
    };
  }, [stopPreview]);

  // Handle device change
  const handleDeviceChange = async (deviceId: string) => {
    onDeviceChange?.(deviceId);
    
    // Restart preview with new device if currently active
    if (streamRef.current) {
      stopPreview();
      // Small delay to ensure stream is stopped
      setTimeout(startPreview, 100);
    }
  };

  // Handle quality change
  const handleQualityChange = async (quality: VideoQuality) => {
    onQualityChange?.(quality);
    
    // Restart preview with new quality if currently active
    if (streamRef.current) {
      stopPreview();
      setTimeout(startPreview, 100);
    }
  };

  const handleTogglePreview = () => {
    if (streamRef.current) {
      stopPreview();
    } else {
      startPreview();
    }
    onTogglePreview?.();
  };

  // Permission denied state
  if (hasPermission === false) {
    return (
      <div className={cn(
        'relative aspect-video bg-[#36393f] rounded-lg flex items-center justify-center',
        className
      )}>
        <div className="text-center text-gray-400 p-8">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <h3 className="text-lg font-medium text-white mb-2">Camera Access Denied</h3>
          <p className="text-sm mb-4">
            Please allow camera access in your browser settings and refresh the page.
          </p>
          <button
            onClick={checkPermission}
            className="px-4 py-2 bg-[#5865f2] hover:bg-[#4752c4] text-white rounded-md font-medium transition-colors"
          >
            Check Permission
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      {/* Video Preview */}
      <div className="relative aspect-video bg-[#36393f] rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-200',
            streamRef.current ? 'opacity-100' : 'opacity-0'
          )}
          autoPlay
          playsInline
          muted // Always mute preview to prevent feedback
        />

        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 bg-[#36393f] flex items-center justify-center">
            <div className="text-center text-gray-400">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm">Starting camera...</p>
            </div>
          </div>
        )}

        {/* No Stream State */}
        {!streamRef.current && !isLoading && !error && (
          <div className="absolute inset-0 bg-[#36393f] flex items-center justify-center">
            <div className="text-center text-gray-400">
              <VideoOff className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Camera Preview</h3>
              <p className="text-sm mb-4">Click the button below to start your camera preview</p>
              <button
                onClick={handleTogglePreview}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors mx-auto"
              >
                <Video className="w-4 h-4" />
                Start Preview
              </button>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="absolute inset-0 bg-[#36393f] flex items-center justify-center">
            <div className="text-center text-gray-400 p-8">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
              <h3 className="text-lg font-medium text-white mb-2">Camera Error</h3>
              <p className="text-sm mb-4">{error}</p>
              <button
                onClick={handleTogglePreview}
                className="px-4 py-2 bg-[#5865f2] hover:bg-[#4752c4] text-white rounded-md font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Controls Overlay */}
        {streamRef.current && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="text-white text-sm font-medium">Camera Preview</div>
                
                <div className="flex items-center gap-2">
                  {/* Camera Toggle */}
                  <button
                    onClick={handleTogglePreview}
                    className={cn(
                      'p-2 rounded-full transition-colors',
                      streamRef.current
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    )}
                    title={streamRef.current ? 'Stop preview' : 'Start preview'}
                  >
                    {streamRef.current ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                  </button>

                  {/* Settings indicator */}
                  <div className="text-xs text-gray-300">
                    {selectedVideoQuality.label}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Device and Quality Selectors */}
      {videoDevices.length > 0 && (
        <div className="mt-4 space-y-3">
          {/* Camera Device Selector */}
          {videoDevices.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Camera Device
              </label>
              <select
                value={selectedVideoDevice || ''}
                onChange={(e) => handleDeviceChange(e.target.value)}
                className="w-full px-3 py-2 bg-[#2f3136] border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {videoDevices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${device.deviceId.slice(0, 8)}...`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Video Quality Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Video Quality
            </label>
            <select
              value={`${selectedVideoQuality.width}x${selectedVideoQuality.height}@${selectedVideoQuality.frameRate}`}
              onChange={(e) => {
                const quality = videoQualities.find(q => 
                  `${q.width}x${q.height}@${q.frameRate}` === e.target.value
                );
                if (quality) handleQualityChange(quality);
              }}
              className="w-full px-3 py-2 bg-[#2f3136] border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {videoQualities.map((quality) => (
                <option
                  key={`${quality.width}x${quality.height}@${quality.frameRate}`}
                  value={`${quality.width}x${quality.height}@${quality.frameRate}`}
                >
                  {quality.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraPreview;