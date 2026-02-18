/**
 * Voice Controls Hook
 * State management for voice/video controls that wraps MatrixRTC and LiveKit APIs
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useMatrixRTC } from '../matrix/use-matrix-rtc';
import { useMatrixRTCContext } from '../../components/providers/matrix-rtc-provider';

export interface VoiceControlsState {
  // Audio controls
  isMuted: boolean;
  isDeafened: boolean;
  audioLevel: number;
  isSpeaking: boolean;
  
  // Video controls  
  isCameraOn: boolean;
  isScreenSharing: boolean;
  
  // Device selection
  selectedMicrophone?: string;
  selectedSpeaker?: string;
  selectedCamera?: string;
  availableDevices: MediaDeviceInfo[];
  
  // Call quality
  connectionQuality: 'excellent' | 'good' | 'poor' | 'unknown';
  latency?: number;
  packetLoss?: number;
  
  // Push-to-talk
  isPushToTalkEnabled: boolean;
  isPushToTalkActive: boolean;
  
  // Advanced audio
  noiseSuppression: boolean;
  echoCancellation: boolean;
  autoGainControl: boolean;
}

export interface VoiceControlsActions {
  // Audio controls
  toggleMute: () => Promise<void>;
  toggleDeafen: () => Promise<void>;
  setMute: (muted: boolean) => Promise<void>;
  
  // Video controls
  toggleCamera: () => Promise<void>;
  toggleScreenShare: () => Promise<void>;
  setCamera: (enabled: boolean) => Promise<void>;
  
  // Device management
  refreshDevices: () => Promise<void>;
  setMicrophone: (deviceId: string) => Promise<void>;
  setSpeaker: (deviceId: string) => Promise<void>;
  setCameraDevice: (deviceId: string) => Promise<void>;
  
  // Push-to-talk
  enablePushToTalk: (enabled: boolean) => void;
  activatePushToTalk: () => void;
  deactivatePushToTalk: () => void;
  
  // Advanced controls
  setNoiseSuppression: (enabled: boolean) => Promise<void>;
  setEchoCancellation: (enabled: boolean) => Promise<void>;
  setAutoGainControl: (enabled: boolean) => Promise<void>;
}

export function useVoiceControls(roomId: string | null) {
  const rtc = useMatrixRTC(roomId);
  const rtcContext = useMatrixRTCContext();
  
  // Local state
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [voiceState, setVoiceState] = useState<VoiceControlsState>({
    isMuted: false,
    isDeafened: false,
    audioLevel: 0,
    isSpeaking: false,
    isCameraOn: false,
    isScreenSharing: false,
    availableDevices: [],
    connectionQuality: 'unknown',
    isPushToTalkEnabled: false,
    isPushToTalkActive: false,
    noiseSuppression: true,
    echoCancellation: true,
    autoGainControl: true,
  });

  // Audio context for level monitoring
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const speakingThreshold = 0.01;
  const speakingTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize audio monitoring
  useEffect(() => {
    if (!localStream) return;

    const audioTrack = localStream.getAudioTracks()[0];
    if (!audioTrack) return;

    // Set up audio analysis
    const setupAudioAnalysis = async () => {
      try {
        audioContextRef.current = new AudioContext();
        analyzerRef.current = audioContextRef.current.createAnalyser();
        
        const source = audioContextRef.current.createMediaStreamSource(localStream);
        source.connect(analyzerRef.current);
        
        analyzerRef.current.fftSize = 512;
        const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount);
        
        const monitorAudio = () => {
          if (!analyzerRef.current) return;
          
          analyzerRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
          const audioLevel = average / 255;
          
          setVoiceState(prev => ({ ...prev, audioLevel }));
          
          // Speaking detection
          const isSpeaking = audioLevel > speakingThreshold;
          if (isSpeaking) {
            setVoiceState(prev => ({ ...prev, isSpeaking: true }));
            
            // Clear existing timeout
            if (speakingTimeoutRef.current) {
              clearTimeout(speakingTimeoutRef.current);
            }
            
            // Set timeout to stop speaking indicator
            speakingTimeoutRef.current = setTimeout(() => {
              setVoiceState(prev => ({ ...prev, isSpeaking: false }));
            }, 300);
          }
          
          requestAnimationFrame(monitorAudio);
        };
        
        monitorAudio();
      } catch (error) {
        console.error('Failed to set up audio analysis:', error);
      }
    };

    setupAudioAnalysis();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (speakingTimeoutRef.current) {
        clearTimeout(speakingTimeoutRef.current);
      }
    };
  }, [localStream]);

  // Get user media stream
  const getUserMedia = useCallback(async (
    audio = true, 
    video = false
  ): Promise<MediaStream | null> => {
    try {
      const constraints: MediaStreamConstraints = {
        audio: audio ? {
          echoCancellation: voiceState.echoCancellation,
          noiseSuppression: voiceState.noiseSuppression,
          autoGainControl: voiceState.autoGainControl
        } : false,
        video: video ? { width: 640, height: 480 } : false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error('Failed to get user media:', error);
      return null;
    }
  }, [voiceState.echoCancellation, voiceState.noiseSuppression, voiceState.autoGainControl]);

  // Device management
  const refreshDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      setVoiceState(prev => ({ ...prev, availableDevices: devices }));
    } catch (error) {
      console.error('Failed to enumerate devices:', error);
    }
  }, []);

  // Audio controls
  const toggleMute = useCallback(async () => {
    if (!localStream) return;
    
    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      const newMuted = !voiceState.isMuted;
      audioTrack.enabled = !newMuted;
      setVoiceState(prev => ({ ...prev, isMuted: newMuted }));
    }
  }, [localStream, voiceState.isMuted]);

  const setMute = useCallback(async (muted: boolean) => {
    if (!localStream) return;
    
    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !muted;
      setVoiceState(prev => ({ ...prev, isMuted: muted }));
    }
  }, [localStream]);

  const toggleDeafen = useCallback(async () => {
    const newDeafened = !voiceState.isDeafened;
    // In a real implementation, this would mute all remote audio
    setVoiceState(prev => ({ ...prev, isDeafened: newDeafened }));
  }, [voiceState.isDeafened]);

  // Video controls
  const toggleCamera = useCallback(async () => {
    const newCameraOn = !voiceState.isCameraOn;
    
    if (newCameraOn) {
      // Start camera
      const stream = await getUserMedia(true, true);
      if (stream) {
        setVoiceState(prev => ({ ...prev, isCameraOn: true }));
      }
    } else {
      // Stop camera
      if (localStream) {
        const videoTrack = localStream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.stop();
          setVoiceState(prev => ({ ...prev, isCameraOn: false }));
        }
      }
    }
  }, [voiceState.isCameraOn, getUserMedia, localStream]);

  const toggleScreenShare = useCallback(async () => {
    try {
      if (!voiceState.isScreenSharing) {
        // Start screen share
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        setLocalStream(stream);
        setVoiceState(prev => ({ ...prev, isScreenSharing: true }));
        
        // Handle stream ending
        stream.getVideoTracks()[0].onended = () => {
          setVoiceState(prev => ({ ...prev, isScreenSharing: false }));
        };
      } else {
        // Stop screen share
        if (localStream) {
          localStream.getTracks().forEach(track => track.stop());
          setLocalStream(null);
          setVoiceState(prev => ({ ...prev, isScreenSharing: false }));
        }
      }
    } catch (error) {
      console.error('Failed to toggle screen share:', error);
    }
  }, [voiceState.isScreenSharing, localStream]);

  // Device selection
  const setMicrophone = useCallback(async (deviceId: string) => {
    try {
      if (localStream) {
        localStream.getAudioTracks().forEach(track => track.stop());
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: { exact: deviceId } }
      });
      
      setLocalStream(stream);
      setVoiceState(prev => ({ ...prev, selectedMicrophone: deviceId }));
    } catch (error) {
      console.error('Failed to set microphone:', error);
    }
  }, [localStream]);

  const setSpeaker = useCallback(async (deviceId: string) => {
    // Note: setSinkId is not available in all browsers
    setVoiceState(prev => ({ ...prev, selectedSpeaker: deviceId }));
  }, []);

  const setCameraDevice = useCallback(async (deviceId: string) => {
    if (!voiceState.isCameraOn) return;
    
    try {
      if (localStream) {
        localStream.getVideoTracks().forEach(track => track.stop());
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } },
        audio: true
      });
      
      setLocalStream(stream);
      setVoiceState(prev => ({ ...prev, selectedCamera: deviceId }));
    } catch (error) {
      console.error('Failed to set camera:', error);
    }
  }, [voiceState.isCameraOn, localStream]);

  // Push-to-talk
  const enablePushToTalk = useCallback((enabled: boolean) => {
    setVoiceState(prev => ({ ...prev, isPushToTalkEnabled: enabled }));
    
    if (enabled) {
      // Auto-mute when push-to-talk is enabled
      setMute(true);
    }
  }, [setMute]);

  const activatePushToTalk = useCallback(() => {
    if (!voiceState.isPushToTalkEnabled) return;
    
    setMute(false);
    setVoiceState(prev => ({ ...prev, isPushToTalkActive: true }));
  }, [voiceState.isPushToTalkEnabled, setMute]);

  const deactivatePushToTalk = useCallback(() => {
    if (!voiceState.isPushToTalkEnabled) return;
    
    setMute(true);
    setVoiceState(prev => ({ ...prev, isPushToTalkActive: false }));
  }, [voiceState.isPushToTalkEnabled, setMute]);

  // Advanced audio controls
  const setNoiseSuppression = useCallback(async (enabled: boolean) => {
    setVoiceState(prev => ({ ...prev, noiseSuppression: enabled }));
    // Would need to recreate stream with new constraints
  }, []);

  const setEchoCancellation = useCallback(async (enabled: boolean) => {
    setVoiceState(prev => ({ ...prev, echoCancellation: enabled }));
    // Would need to recreate stream with new constraints
  }, []);

  const setAutoGainControl = useCallback(async (enabled: boolean) => {
    setVoiceState(prev => ({ ...prev, autoGainControl: enabled }));
    // Would need to recreate stream with new constraints
  }, []);

  // Connection quality monitoring (simplified)
  useEffect(() => {
    if (!rtc.session) return;
    
    // In a real implementation, this would monitor RTCPeerConnection stats
    const interval = setInterval(() => {
      // Mock connection quality based on session state
      let quality: VoiceControlsState['connectionQuality'] = 'unknown';
      if (rtc.isConnected && rtc.isJoined) {
        quality = 'good'; // Would be based on actual stats
      } else if (rtc.error) {
        quality = 'poor';
      }
      
      setVoiceState(prev => ({ ...prev, connectionQuality: quality }));
    }, 1000);

    return () => clearInterval(interval);
  }, [rtc.session, rtc.isConnected, rtc.isJoined, rtc.error]);

  // Initialize devices on mount
  useEffect(() => {
    refreshDevices();
  }, [refreshDevices]);

  // Actions object
  const actions: VoiceControlsActions = {
    toggleMute,
    toggleDeafen,
    setMute,
    toggleCamera,
    toggleScreenShare,
    setCamera: (enabled: boolean) => enabled ? toggleCamera() : Promise.resolve(),
    refreshDevices,
    setMicrophone,
    setSpeaker,
    setCameraDevice: setCameraDevice,
    enablePushToTalk,
    activatePushToTalk,
    deactivatePushToTalk,
    setNoiseSuppression,
    setEchoCancellation,
    setAutoGainControl,
  };

  return {
    // State
    ...voiceState,
    localStream,
    
    // RTC state passthrough
    rtcSession: rtc.session,
    isRTCConnected: rtc.isConnected,
    isRTCJoined: rtc.isJoined,
    participants: rtc.participants,
    rtcError: rtc.error,
    
    // Actions
    ...actions,
  };
}

export type UseVoiceControlsResult = ReturnType<typeof useVoiceControls>;