import { useState, useEffect, useCallback, useRef } from 'react';

export type CameraDevice = {
  deviceId: string;
  label: string;
  groupId: string;
};

export type VideoQuality = 'low' | 'medium' | 'high' | 'hd';

export interface VideoConstraints {
  width: number;
  height: number;
  frameRate: number;
}

export interface UseLocalVideoReturn {
  // Stream state
  stream: MediaStream | null;
  isEnabled: boolean;
  isInitialized: boolean;
  error: string | null;
  
  // Device management
  currentDevice: CameraDevice | null;
  availableDevices: CameraDevice[];
  hasMultipleCameras: boolean;
  
  // Controls
  startVideo: (deviceId?: string) => Promise<void>;
  stopVideo: () => void;
  toggleVideo: () => Promise<boolean>;
  switchCamera: (deviceId?: string) => Promise<void>;
  switchToNextCamera: () => Promise<void>;
  
  // Quality management
  quality: VideoQuality;
  setQuality: (quality: VideoQuality) => Promise<void>;
  constraints: VideoConstraints;
  
  // Utility
  refreshDevices: () => Promise<void>;
  clearError: () => void;
  getCurrentVideoTrack: () => MediaStreamTrack | null;
}

// Quality presets
const QUALITY_PRESETS: Record<VideoQuality, VideoConstraints> = {
  low: { width: 320, height: 240, frameRate: 15 },
  medium: { width: 640, height: 480, frameRate: 24 },
  high: { width: 1280, height: 720, frameRate: 30 },
  hd: { width: 1920, height: 1080, frameRate: 30 }
};

/**
 * Custom hook for managing local video stream and camera controls
 */
export function useLocalVideo(
  autoStart: boolean = false,
  initialQuality: VideoQuality = 'medium'
): UseLocalVideoReturn {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentDevice, setCurrentDevice] = useState<CameraDevice | null>(null);
  const [availableDevices, setAvailableDevices] = useState<CameraDevice[]>([]);
  const [quality, setQualityState] = useState<VideoQuality>(initialQuality);
  
  const streamRef = useRef<MediaStream | null>(null);
  
  // Get current constraints based on quality
  const constraints = QUALITY_PRESETS[quality];

  // Get available video devices
  const getVideoDevices = useCallback(async (): Promise<CameraDevice[]> => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices
        .filter(device => device.kind === 'videoinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${device.deviceId.slice(0, 8)}`,
          groupId: device.groupId
        }));
    } catch (err) {
      console.error('Failed to enumerate video devices:', err);
      return [];
    }
  }, []);

  // Refresh available devices
  const refreshDevices = useCallback(async () => {
    const devices = await getVideoDevices();
    setAvailableDevices(devices);
    
    // Update current device if it's no longer available
    if (currentDevice && !devices.some(d => d.deviceId === currentDevice.deviceId)) {
      setCurrentDevice(devices[0] || null);
    }
  }, [currentDevice, getVideoDevices]);

  // Start video with specified device
  const startVideo = useCallback(async (deviceId?: string) => {
    try {
      setError(null);
      
      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Determine device to use
      const targetDeviceId = deviceId || currentDevice?.deviceId;
      
      // Create constraints
      const videoConstraints: MediaTrackConstraints = {
        ...constraints,
        deviceId: targetDeviceId ? { exact: targetDeviceId } : undefined,
        facingMode: !targetDeviceId ? 'user' : undefined
      };

      // Get user media
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: false // Only video for this hook
      });

      streamRef.current = newStream;
      setStream(newStream);
      setIsEnabled(true);
      setIsInitialized(true);

      // Update current device info
      const videoTrack = newStream.getVideoTracks()[0];
      if (videoTrack) {
        const settings = videoTrack.getSettings();
        if (settings.deviceId) {
          const device = availableDevices.find(d => d.deviceId === settings.deviceId);
          if (device) {
            setCurrentDevice(device);
          }
        }
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start video';
      setError(errorMessage);
      setIsEnabled(false);
      streamRef.current = null;
      setStream(null);
      throw new Error(errorMessage);
    }
  }, [currentDevice?.deviceId, constraints, availableDevices]);

  // Stop video
  const stopVideo = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setStream(null);
    }
    setIsEnabled(false);
    setError(null);
  }, []);

  // Toggle video on/off
  const toggleVideo = useCallback(async (): Promise<boolean> => {
    if (isEnabled) {
      stopVideo();
      return false;
    } else {
      await startVideo();
      return true;
    }
  }, [isEnabled, startVideo, stopVideo]);

  // Switch to specific camera
  const switchCamera = useCallback(async (deviceId?: string) => {
    if (!deviceId) {
      // Switch to next available camera
      return switchToNextCamera();
    }

    const targetDevice = availableDevices.find(d => d.deviceId === deviceId);
    if (!targetDevice) {
      throw new Error('Camera device not found');
    }

    if (isEnabled) {
      await startVideo(deviceId);
    } else {
      setCurrentDevice(targetDevice);
    }
  }, [availableDevices, isEnabled, startVideo]);

  // Switch to next camera in the list
  const switchToNextCamera = useCallback(async () => {
    if (availableDevices.length <= 1) {
      return;
    }

    const currentIndex = currentDevice 
      ? availableDevices.findIndex(d => d.deviceId === currentDevice.deviceId)
      : -1;
    
    const nextIndex = (currentIndex + 1) % availableDevices.length;
    const nextDevice = availableDevices[nextIndex];

    if (nextDevice) {
      await switchCamera(nextDevice.deviceId);
    }
  }, [availableDevices, currentDevice, switchCamera]);

  // Set video quality
  const setQuality = useCallback(async (newQuality: VideoQuality) => {
    setQualityState(newQuality);
    
    // If video is currently enabled, restart with new quality
    if (isEnabled) {
      await startVideo(currentDevice?.deviceId);
    }
  }, [isEnabled, currentDevice?.deviceId, startVideo]);

  // Get current video track
  const getCurrentVideoTrack = useCallback((): MediaStreamTrack | null => {
    return stream?.getVideoTracks()[0] || null;
  }, [stream]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initialize devices on mount
  useEffect(() => {
    refreshDevices();

    // Listen for device changes
    const handleDeviceChange = () => {
      refreshDevices();
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, [refreshDevices]);

  // Auto-start if requested
  useEffect(() => {
    if (autoStart && !isInitialized && availableDevices.length > 0) {
      startVideo().catch(console.error);
    }
  }, [autoStart, isInitialized, availableDevices.length, startVideo]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return {
    // Stream state
    stream,
    isEnabled,
    isInitialized,
    error,
    
    // Device management
    currentDevice,
    availableDevices,
    hasMultipleCameras: availableDevices.length > 1,
    
    // Controls
    startVideo,
    stopVideo,
    toggleVideo,
    switchCamera,
    switchToNextCamera,
    
    // Quality management
    quality,
    setQuality,
    constraints,
    
    // Utility
    refreshDevices,
    clearError,
    getCurrentVideoTrack
  };
}

/**
 * Hook for getting preview stream without affecting main video call
 */
export function useVideoPreview(
  deviceId?: string,
  quality: VideoQuality = 'medium'
): {
  previewStream: MediaStream | null;
  isLoading: boolean;
  error: string | null;
  startPreview: () => Promise<void>;
  stopPreview: () => void;
} {
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const previewStreamRef = useRef<MediaStream | null>(null);

  const startPreview = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Stop existing preview
      if (previewStreamRef.current) {
        previewStreamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints = QUALITY_PRESETS[quality];
      const videoConstraints: MediaTrackConstraints = {
        ...constraints,
        deviceId: deviceId ? { exact: deviceId } : undefined,
        facingMode: !deviceId ? 'user' : undefined
      };

      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: false
      });

      previewStreamRef.current = stream;
      setPreviewStream(stream);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start preview';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [deviceId, quality]);

  const stopPreview = useCallback(() => {
    if (previewStreamRef.current) {
      previewStreamRef.current.getTracks().forEach(track => track.stop());
      previewStreamRef.current = null;
      setPreviewStream(null);
    }
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (previewStreamRef.current) {
        previewStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return {
    previewStream,
    isLoading,
    error,
    startPreview,
    stopPreview
  };
}