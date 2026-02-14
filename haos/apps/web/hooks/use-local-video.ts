'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { LocalVideoTrack } from 'livekit-client';
import { VideoDevice, VideoQuality } from '@/components/video/video-controls';

export interface UseLocalVideoOptions {
  /** Auto-start camera on mount */
  autoStart?: boolean;
  /** Default video device ID */
  defaultDeviceId?: string;
  /** Default video quality */
  defaultQuality?: VideoQuality;
  /** Whether to mirror the local video */
  mirror?: boolean;
}

export interface UseLocalVideoReturn {
  // State
  isActive: boolean;
  isLoading: boolean;
  hasPermission: boolean | null;
  error: string | null;
  videoTrack: LocalVideoTrack | null;
  
  // Devices
  videoDevices: VideoDevice[];
  selectedDevice: string | null;
  isDeviceListLoading: boolean;
  
  // Quality
  currentQuality: VideoQuality;
  supportedQualities: VideoQuality[];
  
  // Actions
  startVideo: (deviceId?: string) => Promise<void>;
  stopVideo: () => void;
  switchDevice: (deviceId: string) => Promise<void>;
  changeQuality: (quality: VideoQuality) => Promise<void>;
  requestPermission: () => Promise<boolean>;
  refreshDevices: () => Promise<void>;
  attachToElement: (element: HTMLVideoElement) => void;
  detachFromElement: (element: HTMLVideoElement) => void;
}

const DEFAULT_QUALITY: VideoQuality = {
  width: 1280,
  height: 720,
  frameRate: 30,
  label: '720p (High)',
};

const SUPPORTED_QUALITIES: VideoQuality[] = [
  { width: 320, height: 240, frameRate: 15, label: '240p (Low)' },
  { width: 640, height: 480, frameRate: 30, label: '480p (Medium)' },
  { width: 1280, height: 720, frameRate: 30, label: '720p (High)' },
  { width: 1920, height: 1080, frameRate: 30, label: '1080p (Very High)' },
];

export function useLocalVideo(options: UseLocalVideoOptions = {}): UseLocalVideoReturn {
  const {
    autoStart = false,
    defaultDeviceId,
    defaultQuality = DEFAULT_QUALITY,
    mirror = true,
  } = options;

  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [videoTrack, setVideoTrack] = useState<LocalVideoTrack | null>(null);
  
  const [videoDevices, setVideoDevices] = useState<VideoDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(defaultDeviceId || null);
  const [isDeviceListLoading, setIsDeviceListLoading] = useState(false);
  
  const [currentQuality, setCurrentQuality] = useState<VideoQuality>(defaultQuality);
  const [supportedQualities] = useState<VideoQuality[]>(SUPPORTED_QUALITIES);

  const streamRef = useRef<MediaStream | null>(null);
  const attachedElementsRef = useRef<Set<HTMLVideoElement>>(new Set());

  // Check camera permission
  const checkPermission = useCallback(async () => {
    try {
      const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
      setHasPermission(permission.state === 'granted');
      
      permission.addEventListener('change', () => {
        setHasPermission(permission.state === 'granted');
      });
      
      return permission.state === 'granted';
    } catch (err) {
      // Permissions API not supported, we'll try to access camera directly
      setHasPermission(null);
      return true;
    }
  }, []);

  // Request camera permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      // Try to get a temporary stream to request permission
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      
      setHasPermission(true);
      return true;
    } catch (err) {
      if (err instanceof Error && err.name === 'NotAllowedError') {
        setHasPermission(false);
        setError('Camera access denied. Please allow camera access and try again.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to access camera');
      }
      return false;
    }
  }, []);

  // Get available video devices
  const refreshDevices = useCallback(async () => {
    setIsDeviceListLoading(true);
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDeviceList: VideoDevice[] = devices
        .filter(device => device.kind === 'videoinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${device.deviceId.slice(0, 8)}...`,
          kind: 'videoinput' as const,
        }));
      
      setVideoDevices(videoDeviceList);
      
      // Set default device if none selected
      if (!selectedDevice && videoDeviceList.length > 0) {
        const firstDevice = videoDeviceList[0];
        if (firstDevice?.deviceId) {
          setSelectedDevice(firstDevice.deviceId);
        }
      }
    } catch (err) {
      console.error('Failed to enumerate video devices:', err);
      setError('Failed to get video devices');
    } finally {
      setIsDeviceListLoading(false);
    }
  }, [selectedDevice]);

  // Initialize permissions and devices
  useEffect(() => {
    checkPermission();
    refreshDevices();
  }, [checkPermission, refreshDevices]);

  // Start video
  const startVideo = useCallback(async (deviceId?: string) => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    const targetDeviceId = deviceId || selectedDevice;

    try {
      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Configure constraints
      const constraints: MediaStreamConstraints = {
        video: {
          deviceId: targetDeviceId ? { exact: targetDeviceId } : undefined,
          width: { ideal: currentQuality.width },
          height: { ideal: currentQuality.height },
          frameRate: { ideal: currentQuality.frameRate },
        },
        audio: false, // Only video for this hook
      };

      // Get media stream
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Create video track from stream
      const videoTrackFromStream = stream.getVideoTracks()[0];
      if (videoTrackFromStream) {
        // Create LiveKit LocalVideoTrack
        const liveKitTrack = new LocalVideoTrack(videoTrackFromStream);

        setVideoTrack(liveKitTrack);
        
        // Update selected device
        if (targetDeviceId) {
          setSelectedDevice(targetDeviceId);
        }

        // Attach to any existing video elements
        attachedElementsRef.current.forEach(element => {
          liveKitTrack.attach(element);
          if (mirror) {
            element.style.transform = 'scaleX(-1)';
          }
        });

        setIsActive(true);
        setHasPermission(true);
      } else {
        throw new Error('No video track found in stream');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start video';
      setError(errorMessage);
      
      if (err instanceof Error && err.name === 'NotAllowedError') {
        setHasPermission(false);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, selectedDevice, currentQuality, mirror]);

  // Stop video
  const stopVideo = useCallback(() => {
    if (videoTrack) {
      // Detach from all elements first
      attachedElementsRef.current.forEach(element => {
        videoTrack.detach(element);
      });
      
      // Stop the track
      videoTrack.stop();
      setVideoTrack(null);
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    setIsActive(false);
    setError(null);
  }, [videoTrack]);

  // Switch device
  const switchDevice = useCallback(async (deviceId: string) => {
    const wasActive = isActive;
    
    if (wasActive) {
      stopVideo();
      // Small delay to ensure previous stream is fully stopped
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    setSelectedDevice(deviceId);
    
    if (wasActive) {
      await startVideo(deviceId);
    }
  }, [isActive, stopVideo, startVideo]);

  // Change quality
  const changeQuality = useCallback(async (quality: VideoQuality) => {
    const wasActive = isActive;
    
    setCurrentQuality(quality);
    
    if (wasActive) {
      stopVideo();
      await new Promise(resolve => setTimeout(resolve, 100));
      await startVideo();
    }
  }, [isActive, stopVideo, startVideo]);

  // Attach video to element
  const attachToElement = useCallback((element: HTMLVideoElement) => {
    attachedElementsRef.current.add(element);
    
    if (videoTrack) {
      videoTrack.attach(element);
      if (mirror) {
        element.style.transform = 'scaleX(-1)';
      }
    }
  }, [videoTrack, mirror]);

  // Detach video from element
  const detachFromElement = useCallback((element: HTMLVideoElement) => {
    attachedElementsRef.current.delete(element);
    
    if (videoTrack) {
      videoTrack.detach(element);
    }
  }, [videoTrack]);

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart && !isActive && !isLoading && hasPermission !== false && videoDevices.length > 0) {
      startVideo();
    }
  }, [autoStart, isActive, isLoading, hasPermission, videoDevices.length, startVideo]);

  // Handle device changes (device unplugged, etc.)
  useEffect(() => {
    const handleDeviceChange = () => {
      refreshDevices();
    };

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, [refreshDevices]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopVideo();
    };
  }, [stopVideo]);

  return {
    // State
    isActive,
    isLoading,
    hasPermission,
    error,
    videoTrack,
    
    // Devices
    videoDevices,
    selectedDevice,
    isDeviceListLoading,
    
    // Quality
    currentQuality,
    supportedQualities,
    
    // Actions
    startVideo,
    stopVideo,
    switchDevice,
    changeQuality,
    requestPermission,
    refreshDevices,
    attachToElement,
    detachFromElement,
  };
}

export default useLocalVideo;