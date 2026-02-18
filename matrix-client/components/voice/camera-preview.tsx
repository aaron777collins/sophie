/**
 * Camera Preview Component
 * Pre-call camera setup and device selection using LiveKit camera/microphone APIs
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

export interface CameraPreviewProps {
  onDeviceChange?: (devices: { camera?: string; microphone?: string; speaker?: string }) => void;
  onStreamReady?: (stream: MediaStream | null) => void;
  onJoinCall?: () => void;
  onCancel?: () => void;
  
  // Initial settings
  initialCameraEnabled?: boolean;
  initialMicrophoneEnabled?: boolean;
  
  // UI options
  showDeviceSelection?: boolean;
  showPreview?: boolean;
  showAudioLevel?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

interface DeviceInfo {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
}

export const CameraPreview: React.FC<CameraPreviewProps> = ({
  onDeviceChange,
  onStreamReady,
  onJoinCall,
  onCancel,
  initialCameraEnabled = false,
  initialMicrophoneEnabled = true,
  showDeviceSelection = true,
  showPreview = true,
  showAudioLevel = true,
  className = '',
  style = {},
}) => {
  // State
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [selectedMicrophone, setSelectedMicrophone] = useState<string>('');
  const [selectedSpeaker, setSelectedSpeaker] = useState<string>('');
  const [cameraEnabled, setCameraEnabled] = useState(initialCameraEnabled);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(initialMicrophoneEnabled);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>();

  // Get available devices
  const refreshDevices = useCallback(async () => {
    try {
      const mediaDevices = await navigator.mediaDevices.enumerateDevices();
      const deviceList: DeviceInfo[] = mediaDevices.map(device => ({
        deviceId: device.deviceId,
        label: device.label || `${device.kind} (${device.deviceId.slice(0, 8)})`,
        kind: device.kind,
      }));
      
      setDevices(deviceList);
      
      // Set default devices if not already selected
      if (!selectedCamera) {
        const defaultCamera = deviceList.find(d => d.kind === 'videoinput');
        if (defaultCamera) setSelectedCamera(defaultCamera.deviceId);
      }
      
      if (!selectedMicrophone) {
        const defaultMic = deviceList.find(d => d.kind === 'audioinput');
        if (defaultMic) setSelectedMicrophone(defaultMic.deviceId);
      }
      
      if (!selectedSpeaker) {
        const defaultSpeaker = deviceList.find(d => d.kind === 'audiooutput');
        if (defaultSpeaker) setSelectedSpeaker(defaultSpeaker.deviceId);
      }
    } catch (error) {
      console.error('Failed to enumerate devices:', error);
      setError('Failed to access media devices');
    }
  }, [selectedCamera, selectedMicrophone, selectedSpeaker]);

  // Request permissions
  const requestPermissions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Request permissions for both audio and video
      const permissionStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      
      // Stop the permission stream immediately
      permissionStream.getTracks().forEach(track => track.stop());
      
      setPermissionsGranted(true);
      await refreshDevices();
    } catch (error) {
      console.error('Failed to get permissions:', error);
      setError('Camera and microphone permissions are required');
    } finally {
      setIsLoading(false);
    }
  }, [refreshDevices]);

  // Get user media stream
  const getStream = useCallback(async () => {
    if (!permissionsGranted) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Stop existing stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        audio: microphoneEnabled ? {
          deviceId: selectedMicrophone ? { exact: selectedMicrophone } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } : false,
        video: cameraEnabled ? {
          deviceId: selectedCamera ? { exact: selectedCamera } : undefined,
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 },
        } : false,
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      onStreamReady?.(newStream);

      // Set up video element
      if (videoRef.current && cameraEnabled) {
        videoRef.current.srcObject = newStream;
        videoRef.current.play().catch(console.error);
      }

      // Set up audio level monitoring
      if (microphoneEnabled && showAudioLevel) {
        setupAudioMonitoring(newStream);
      }

    } catch (error) {
      console.error('Failed to get user media:', error);
      setError('Failed to access camera or microphone');
      onStreamReady?.(null);
    } finally {
      setIsLoading(false);
    }
  }, [
    permissionsGranted,
    stream,
    microphoneEnabled,
    selectedMicrophone,
    cameraEnabled,
    selectedCamera,
    onStreamReady,
    showAudioLevel,
  ]);

  // Set up audio level monitoring
  const setupAudioMonitoring = useCallback((mediaStream: MediaStream) => {
    if (!showAudioLevel) return;

    try {
      audioContextRef.current = new AudioContext();
      analyzerRef.current = audioContextRef.current.createAnalyser();
      
      const source = audioContextRef.current.createMediaStreamSource(mediaStream);
      source.connect(analyzerRef.current);
      
      analyzerRef.current.fftSize = 256;
      const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount);
      
      const updateAudioLevel = () => {
        if (!analyzerRef.current) return;
        
        analyzerRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        setAudioLevel(average / 255);
        
        animationRef.current = requestAnimationFrame(updateAudioLevel);
      };
      
      updateAudioLevel();
    } catch (error) {
      console.error('Failed to set up audio monitoring:', error);
    }
  }, [showAudioLevel]);

  // Effects
  useEffect(() => {
    if (permissionsGranted) {
      getStream();
    }
  }, [permissionsGranted, cameraEnabled, microphoneEnabled, selectedCamera, selectedMicrophone]);

  useEffect(() => {
    onDeviceChange?.({
      camera: selectedCamera,
      microphone: selectedMicrophone,
      speaker: selectedSpeaker,
    });
  }, [selectedCamera, selectedMicrophone, selectedSpeaker, onDeviceChange]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [stream]);

  const containerStyle: React.CSSProperties = {
    backgroundColor: '#36393f',
    borderRadius: '8px',
    padding: '20px',
    color: '#dcddde',
    maxWidth: '600px',
    ...style,
  };

  if (!permissionsGranted) {
    return (
      <div className={`camera-preview ${className}`} style={containerStyle}>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ color: '#fff', marginBottom: '16px' }}>Set up your camera and microphone</h3>
          <p style={{ color: '#b9bbbe', marginBottom: '24px' }}>
            We need permission to access your camera and microphone for this call.
          </p>
          
          <button
            onClick={requestPermissions}
            disabled={isLoading}
            style={{
              backgroundColor: '#5865f2',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '12px 24px',
              fontSize: '14px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            {isLoading ? 'Requesting permissions...' : 'Allow camera and microphone'}
          </button>
          
          {error && (
            <p style={{ color: '#f04747', marginTop: '16px', fontSize: '14px' }}>
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`camera-preview ${className}`} style={containerStyle}>
      <h3 style={{ color: '#fff', marginBottom: '20px', textAlign: 'center' }}>
        Camera & Microphone Setup
      </h3>

      {/* Preview Section */}
      {showPreview && (
        <div style={{ marginBottom: '20px' }}>
          {/* Camera Preview */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '400px',
              height: '300px',
              backgroundColor: '#2f3136',
              borderRadius: '8px',
              overflow: 'hidden',
              margin: '0 auto 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {cameraEnabled && stream && stream.getVideoTracks().length > 0 ? (
              <video
                ref={videoRef}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: 'scaleX(-1)', // Mirror local video
                }}
                autoPlay
                playsInline
                muted
              />
            ) : (
              <div style={{ textAlign: 'center', color: '#b9bbbe' }}>
                <div style={{ fontSize: '48px', marginBottom: '8px' }}>📷</div>
                <div>Camera off</div>
              </div>
            )}
            
            {/* Camera toggle overlay */}
            <button
              onClick={() => setCameraEnabled(!cameraEnabled)}
              style={{
                position: 'absolute',
                bottom: '12px',
                right: '12px',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: cameraEnabled ? '#43b581' : '#f04747',
                color: 'white',
                cursor: 'pointer',
                fontSize: '16px',
              }}
            >
              {cameraEnabled ? '📹' : '📷'}
            </button>
          </div>

          {/* Audio Level Indicator */}
          {showAudioLevel && microphoneEnabled && (
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ marginBottom: '8px', fontSize: '14px', color: '#b9bbbe' }}>
                Microphone Level
              </div>
              <div
                style={{
                  width: '200px',
                  height: '8px',
                  backgroundColor: '#4f545c',
                  borderRadius: '4px',
                  margin: '0 auto',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${audioLevel * 100}%`,
                    height: '100%',
                    backgroundColor: audioLevel > 0.7 ? '#f04747' : audioLevel > 0.3 ? '#faa61a' : '#43b581',
                    transition: 'width 0.1s ease',
                  }}
                />
              </div>
            </div>
          )}

          {/* Audio Toggle */}
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => setMicrophoneEnabled(!microphoneEnabled)}
              style={{
                backgroundColor: microphoneEnabled ? '#43b581' : '#f04747',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                padding: '8px 16px',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {microphoneEnabled ? '🎤' : '🔇'}
              {microphoneEnabled ? 'Microphone On' : 'Microphone Off'}
            </button>
          </div>
        </div>
      )}

      {/* Device Selection */}
      {showDeviceSelection && devices.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ color: '#fff', marginBottom: '12px', fontSize: '16px' }}>
            Device Settings
          </h4>
          
          <div style={{ display: 'grid', gap: '12px' }}>
            {/* Camera Selection */}
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#b9bbbe' }}>
                Camera
              </label>
              <select
                value={selectedCamera}
                onChange={(e) => setSelectedCamera(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: '#40444b',
                  color: '#dcddde',
                  border: '1px solid #4f545c',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              >
                {devices
                  .filter(device => device.kind === 'videoinput')
                  .map(device => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label}
                    </option>
                  ))
                }
              </select>
            </div>

            {/* Microphone Selection */}
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#b9bbbe' }}>
                Microphone
              </label>
              <select
                value={selectedMicrophone}
                onChange={(e) => setSelectedMicrophone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: '#40444b',
                  color: '#dcddde',
                  border: '1px solid #4f545c',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              >
                {devices
                  .filter(device => device.kind === 'audioinput')
                  .map(device => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label}
                    </option>
                  ))
                }
              </select>
            </div>

            {/* Speaker Selection */}
            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', color: '#b9bbbe' }}>
                Speaker
              </label>
              <select
                value={selectedSpeaker}
                onChange={(e) => setSelectedSpeaker(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  backgroundColor: '#40444b',
                  color: '#dcddde',
                  border: '1px solid #4f545c',
                  borderRadius: '4px',
                  fontSize: '14px',
                }}
              >
                {devices
                  .filter(device => device.kind === 'audiooutput')
                  .map(device => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label}
                    </option>
                  ))
                }
              </select>
            </div>
          </div>

          <button
            onClick={refreshDevices}
            style={{
              marginTop: '12px',
              backgroundColor: 'transparent',
              color: '#00aff4',
              border: 'none',
              fontSize: '14px',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            🔄 Refresh devices
          </button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div
          style={{
            backgroundColor: '#f04747',
            color: 'white',
            padding: '12px',
            borderRadius: '4px',
            marginBottom: '16px',
            fontSize: '14px',
          }}
        >
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <button
          onClick={onCancel}
          style={{
            flex: 1,
            padding: '12px',
            backgroundColor: '#4f545c',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          Cancel
        </button>
        
        <button
          onClick={onJoinCall}
          disabled={isLoading}
          style={{
            flex: 2,
            padding: '12px',
            backgroundColor: isLoading ? '#4f545c' : '#5865f2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            opacity: isLoading ? 0.6 : 1,
          }}
        >
          {isLoading ? 'Setting up...' : 'Join Call'}
        </button>
      </div>
    </div>
  );
};

export default CameraPreview;