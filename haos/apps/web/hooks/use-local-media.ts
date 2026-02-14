'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useVoiceStore } from '@/stores/voice-store';
import { getVoiceChannelService, MediaDeviceInfo } from '@/services/voice-channel';
import { getLiveKitService } from '@/services/livekit';

export interface AudioLevel {
  current: number;
  peak: number;
  average: number;
}

export interface UseLocalMediaOptions {
  enableVoiceDetection?: boolean;
  voiceDetectionThreshold?: number;
  enableAudioLevelMonitoring?: boolean;
  autoSelectDevices?: boolean;
}

export interface UseLocalMediaReturn {
  // Device information
  audioInputDevices: MediaDeviceInfo[];
  audioOutputDevices: MediaDeviceInfo[];
  videoInputDevices: MediaDeviceInfo[];
  selectedAudioInput: string | null;
  selectedAudioOutput: string | null;
  selectedVideoInput: string | null;
  
  // Device loading states
  isLoadingDevices: boolean;
  devicesError: string | null;
  
  // Audio state
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isMuted: boolean;
  isDeafened: boolean;
  isSpeaking: boolean;
  audioLevel: AudioLevel;
  
  // Testing states
  isTesting: boolean;
  testResults: Record<string, number>;
  
  // Actions
  refreshDevices: () => Promise<void>;
  setAudioInputDevice: (deviceId: string) => Promise<void>;
  setAudioOutputDevice: (deviceId: string) => Promise<void>;
  setVideoInputDevice: (deviceId: string) => Promise<void>;
  
  toggleMute: () => Promise<void>;
  toggleDeafen: () => void;
  toggleVideo: () => Promise<void>;
  
  testMicrophone: (deviceId?: string) => Promise<number>;
  testAllMicrophones: () => Promise<void>;
  
  // Advanced controls
  setInputVolume: (volume: number) => void;
  setOutputVolume: (volume: number) => void;
  setSpeakingThreshold: (threshold: number) => void;
}

export function useLocalMedia(options: UseLocalMediaOptions = {}): UseLocalMediaReturn {
  const {
    enableVoiceDetection = true,
    voiceDetectionThreshold = 0.01,
    enableAudioLevelMonitoring = true,
    autoSelectDevices = true,
  } = options;

  const voiceChannelService = getVoiceChannelService();
  const liveKitService = getLiveKitService();

  // Device lists
  const [audioInputDevices, setAudioInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioOutputDevices, setAudioOutputDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoInputDevices, setVideoInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(true);
  const [devicesError, setDevicesError] = useState<string | null>(null);

  // Testing states
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, number>>({});

  // Audio monitoring
  const [audioLevel, setAudioLevel] = useState<AudioLevel>({
    current: 0,
    peak: 0,
    average: 0,
  });

  // Voice store state
  const {
    isAudioEnabled,
    isVideoEnabled,
    isDeafened,
    isSpeaking,
    settings,
    setAudioEnabled,
    setVideoEnabled,
    setDeafened,
    setSpeaking,
    updateSettings,
  } = useVoiceStore();

  // Selected devices from settings
  const selectedAudioInput = settings.inputDevice;
  const selectedAudioOutput = settings.outputDevice;
  const selectedVideoInput = null; // TODO: Add video input to settings

  // Refs for audio monitoring
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const monitoringRef = useRef<boolean>(false);
  const audioLevelHistoryRef = useRef<number[]>([]);

  // Derived state
  const isMuted = !isAudioEnabled;

  // Load available devices on mount
  useEffect(() => {
    loadDevices();
  }, []);

  // Set up audio level monitoring when enabled and connected
  useEffect(() => {
    if (enableAudioLevelMonitoring && liveKitService.isConnected() && isAudioEnabled) {
      startAudioMonitoring();
    } else {
      stopAudioMonitoring();
    }

    return () => stopAudioMonitoring();
  }, [enableAudioLevelMonitoring, isAudioEnabled]);

  // Auto-select default devices
  useEffect(() => {
    if (autoSelectDevices && audioInputDevices.length > 0 && !selectedAudioInput) {
      const defaultDevice = audioInputDevices.find(d => d.deviceId === 'default') || audioInputDevices[0];
      if (defaultDevice) {
        updateSettings({ inputDevice: defaultDevice.deviceId });
      }
    }
  }, [audioInputDevices, selectedAudioInput, autoSelectDevices]);

  const loadDevices = useCallback(async () => {
    setIsLoadingDevices(true);
    setDevicesError(null);

    try {
      const [audioInputs, audioOutputs, videoInputs] = await Promise.all([
        voiceChannelService.getAudioInputDevices(),
        voiceChannelService.getAudioOutputDevices(),
        voiceChannelService.getVideoInputDevices(),
      ]);

      setAudioInputDevices(audioInputs);
      setAudioOutputDevices(audioOutputs);
      setVideoInputDevices(videoInputs);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load devices';
      setDevicesError(message);
      console.error('Failed to load media devices:', error);
    } finally {
      setIsLoadingDevices(false);
    }
  }, [voiceChannelService]);

  const refreshDevices = useCallback(async () => {
    await loadDevices();
  }, [loadDevices]);

  const setAudioInputDevice = useCallback(async (deviceId: string) => {
    try {
      await voiceChannelService.setAudioInputDevice(deviceId);
      updateSettings({ inputDevice: deviceId });
    } catch (error) {
      console.error('Failed to set audio input device:', error);
      throw error;
    }
  }, [voiceChannelService, updateSettings]);

  const setAudioOutputDevice = useCallback(async (deviceId: string) => {
    try {
      await voiceChannelService.setAudioOutputDevice(deviceId);
      updateSettings({ outputDevice: deviceId });
    } catch (error) {
      console.error('Failed to set audio output device:', error);
      throw error;
    }
  }, [voiceChannelService, updateSettings]);

  const setVideoInputDevice = useCallback(async (deviceId: string) => {
    try {
      await voiceChannelService.setVideoInputDevice(deviceId);
      // TODO: Update settings when video input is added
    } catch (error) {
      console.error('Failed to set video input device:', error);
      throw error;
    }
  }, [voiceChannelService]);

  const toggleMute = useCallback(async () => {
    try {
      const newState = !isAudioEnabled;
      await liveKitService.setAudioEnabled(newState);
      setAudioEnabled(newState);

      // If unmuting and was deafened, also undeafen
      if (newState && isDeafened) {
        setDeafened(false);
      }
    } catch (error) {
      console.error('Failed to toggle mute:', error);
      throw error;
    }
  }, [isAudioEnabled, isDeafened, liveKitService, setAudioEnabled, setDeafened]);

  const toggleDeafen = useCallback(() => {
    const newDeafenedState = !isDeafened;
    setDeafened(newDeafenedState);

    // When deafening, also mute
    if (newDeafenedState && isAudioEnabled) {
      toggleMute();
    }
  }, [isDeafened, isAudioEnabled, setDeafened, toggleMute]);

  const toggleVideo = useCallback(async () => {
    try {
      const newState = !isVideoEnabled;
      await liveKitService.setVideoEnabled(newState);
      setVideoEnabled(newState);
    } catch (error) {
      console.error('Failed to toggle video:', error);
      throw error;
    }
  }, [isVideoEnabled, liveKitService, setVideoEnabled]);

  const testMicrophone = useCallback(async (deviceId?: string): Promise<number> => {
    const testDeviceId = deviceId || selectedAudioInput || 'default';
    setIsTesting(true);

    try {
      const level = await voiceChannelService.testMicrophone(testDeviceId);
      setTestResults(prev => ({ ...prev, [testDeviceId]: level }));
      return level;
    } catch (error) {
      console.error('Failed to test microphone:', error);
      throw error;
    } finally {
      setIsTesting(false);
    }
  }, [selectedAudioInput, voiceChannelService]);

  const testAllMicrophones = useCallback(async () => {
    setIsTesting(true);
    setTestResults({});

    try {
      const results: Record<string, number> = {};
      
      for (const device of audioInputDevices) {
        try {
          const level = await voiceChannelService.testMicrophone(device.deviceId);
          results[device.deviceId] = level;
        } catch (error) {
          console.error(`Failed to test microphone ${device.label}:`, error);
          results[device.deviceId] = 0;
        }
      }

      setTestResults(results);
    } finally {
      setIsTesting(false);
    }
  }, [audioInputDevices, voiceChannelService]);

  const setInputVolume = useCallback((volume: number) => {
    updateSettings({ inputVolume: Math.max(0, Math.min(200, volume)) });
  }, [updateSettings]);

  const setOutputVolume = useCallback((volume: number) => {
    updateSettings({ outputVolume: Math.max(0, Math.min(200, volume)) });
  }, [updateSettings]);

  const setSpeakingThreshold = useCallback((threshold: number) => {
    // This would be used for voice activity detection
    // For now, just log it as the actual implementation would be in the LiveKit service
    console.log('Speaking threshold set to:', threshold);
  }, []);

  const startAudioMonitoring = useCallback(async () => {
    if (monitoringRef.current || !isAudioEnabled) return;

    try {
      // Get microphone access
      const constraints: MediaStreamConstraints = {
        audio: selectedAudioInput ? { deviceId: { exact: selectedAudioInput } } : true,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      micStreamRef.current = stream;

      // Set up audio context and analyser
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const source = audioContextRef.current.createMediaStreamSource(stream);
      const analyser = audioContextRef.current.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;

      source.connect(analyser);
      analyserRef.current = analyser;
      monitoringRef.current = true;

      // Start monitoring loop
      const monitorLoop = () => {
        if (!monitoringRef.current || !analyserRef.current) return;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);

        const current = Math.max(...dataArray) / 255;
        
        // Update audio level history for average calculation
        audioLevelHistoryRef.current.push(current);
        if (audioLevelHistoryRef.current.length > 30) {
          audioLevelHistoryRef.current.shift();
        }

        const average = audioLevelHistoryRef.current.reduce((sum, val) => sum + val, 0) / audioLevelHistoryRef.current.length;
        
        setAudioLevel(prev => ({
          current,
          peak: Math.max(prev.peak * 0.95, current), // Decay peak slightly
          average,
        }));

        // Voice detection
        if (enableVoiceDetection) {
          const isSpeakingNow = current > voiceDetectionThreshold;
          if (isSpeakingNow !== isSpeaking) {
            setSpeaking(isSpeakingNow);
          }
        }

        requestAnimationFrame(monitorLoop);
      };

      monitorLoop();
    } catch (error) {
      console.error('Failed to start audio monitoring:', error);
      monitoringRef.current = false;
    }
  }, [isAudioEnabled, selectedAudioInput, enableVoiceDetection, voiceDetectionThreshold, isSpeaking, setSpeaking]);

  const stopAudioMonitoring = useCallback(() => {
    monitoringRef.current = false;

    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(track => track.stop());
      micStreamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    audioLevelHistoryRef.current = [];
    
    setAudioLevel({ current: 0, peak: 0, average: 0 });
    setSpeaking(false);
  }, [setSpeaking]);

  return {
    // Device information
    audioInputDevices,
    audioOutputDevices,
    videoInputDevices,
    selectedAudioInput,
    selectedAudioOutput,
    selectedVideoInput,

    // Device loading states
    isLoadingDevices,
    devicesError,

    // Audio state
    isAudioEnabled,
    isVideoEnabled,
    isMuted,
    isDeafened,
    isSpeaking,
    audioLevel,

    // Testing states
    isTesting,
    testResults,

    // Actions
    refreshDevices,
    setAudioInputDevice,
    setAudioOutputDevice,
    setVideoInputDevice,

    toggleMute,
    toggleDeafen,
    toggleVideo,

    testMicrophone,
    testAllMicrophones,

    // Advanced controls
    setInputVolume,
    setOutputVolume,
    setSpeakingThreshold,
  };
}

export default useLocalMedia;