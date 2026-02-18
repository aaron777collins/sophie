'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// Mock participant data
interface MockParticipant {
  identity: string;
  name: string;
  isLocal: boolean;
  isSpeaking: boolean;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  connectionQuality: 'excellent' | 'good' | 'poor';
}

interface MockMediaDevice {
  deviceId: string;
  kind: 'audioinput' | 'videoinput' | 'audiooutput';
  label: string;
}

export default function TestCallUIPage() {
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showDeviceSettings, setShowDeviceSettings] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [participants, setParticipants] = useState<MockParticipant[]>([
    {
      identity: 'test-user',
      name: 'Test User',
      isLocal: true,
      isSpeaking: false,
      isAudioEnabled: true,
      isVideoEnabled: false,
      connectionQuality: 'excellent'
    },
    {
      identity: 'remote-1',
      name: 'Remote User 1',
      isLocal: false,
      isSpeaking: false,
      isAudioEnabled: true,
      isVideoEnabled: true,
      connectionQuality: 'good'
    },
    {
      identity: 'remote-2',
      name: 'Remote User 2',
      isLocal: false,
      isSpeaking: true,
      isAudioEnabled: false,
      isVideoEnabled: false,
      connectionQuality: 'poor'
    }
  ]);

  const [mediaDevices] = useState<MockMediaDevice[]>([
    { deviceId: 'default', kind: 'audioinput', label: 'Default Microphone' },
    { deviceId: 'mic-1', kind: 'audioinput', label: 'USB Microphone' },
    { deviceId: 'cam-1', kind: 'videoinput', label: 'Webcam HD' },
    { deviceId: 'cam-2', kind: 'videoinput', label: 'External Camera' },
    { deviceId: 'speaker-1', kind: 'audiooutput', label: 'Speakers' },
    { deviceId: 'headphones-1', kind: 'audiooutput', label: 'Headphones' }
  ]);

  const [selectedMic, setSelectedMic] = useState('default');
  const [selectedCamera, setSelectedCamera] = useState('cam-1');
  const [selectedSpeaker, setSelectedSpeaker] = useState('speaker-1');
  const [mediaError, setMediaError] = useState<string>('');

  // Expose functions to window for testing
  useEffect(() => {
    (window as any).updateVoiceState = (newState: any) => {
      if (newState.participants) {
        setParticipants(newState.participants);
      }
    };

    (window as any).setCallDuration = (durationMs: number) => {
      setCallDuration(durationMs);
    };

    // Start call duration timer
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1000);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const toggleMicrophone = async () => {
    try {
      // Check for mock error
      if ((window as any).mockError) {
        throw new Error((window as any).mockError);
      }

      setIsAudioEnabled(!isAudioEnabled);
      
      // Update participant state
      setParticipants(prev => 
        prev.map(p => 
          p.isLocal ? { ...p, isAudioEnabled: !isAudioEnabled } : p
        )
      );
    } catch (err) {
      setMediaError(err instanceof Error ? err.message : 'Audio error');
    }
  };

  const toggleVideo = async () => {
    try {
      // Check for mock error
      if ((window as any).mockError) {
        throw new Error((window as any).mockError);
      }

      setIsVideoEnabled(!isVideoEnabled);
      
      // Update participant state
      setParticipants(prev => 
        prev.map(p => 
          p.isLocal ? { ...p, isVideoEnabled: !isVideoEnabled } : p
        )
      );
    } catch (err) {
      setMediaError(err instanceof Error ? err.message : 'Camera access denied');
    }
  };

  const toggleScreenShare = async () => {
    try {
      setIsScreenSharing(!isScreenSharing);
    } catch (err) {
      setMediaError(err instanceof Error ? err.message : 'Screen share error');
    }
  };

  const endCall = () => {
    // Mock end call logic
    console.log('Call ended');
  };

  const requestPictureInPicture = () => {
    // Mock PiP request
    console.log('Picture-in-picture requested');
  };

  const renderParticipantTile = (participant: MockParticipant) => {
    return (
      <div
        key={participant.identity}
        data-testid="participant-tile"
        data-participant={participant.identity}
        className={`relative p-4 border rounded-lg ${participant.isSpeaking ? 'border-green-500 border-2' : 'border-gray-300'}`}
      >
        {/* Participant Name */}
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">
            {participant.name}
            {participant.isLocal && (
              <span data-testid="local-participant" className="text-sm text-gray-500 ml-1">
                (You)
              </span>
            )}
          </span>
          
          {/* Connection Quality */}
          <div 
            data-testid="connection-quality"
            className={`w-3 h-3 rounded-full ${
              participant.connectionQuality === 'excellent' ? 'bg-green-500' :
              participant.connectionQuality === 'good' ? 'bg-yellow-500' : 
              'bg-red-500'
            }`}
            title={`Connection: ${participant.connectionQuality}`}
          />
        </div>

        {/* Video/Placeholder */}
        {participant.isVideoEnabled ? (
          <div className="w-full h-32 bg-gray-200 rounded mb-2 flex items-center justify-center">
            <span className="text-gray-600">Video Feed</span>
          </div>
        ) : (
          <div 
            data-testid="video-placeholder"
            className="w-full h-32 bg-gray-100 rounded mb-2 flex items-center justify-center"
          >
            <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold">
              {participant.name.charAt(0)}
            </div>
          </div>
        )}

        {/* Speaking Indicator */}
        {participant.isSpeaking && (
          <div 
            data-testid="speaking-indicator"
            className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded speaking active"
          >
            Speaking
          </div>
        )}

        {/* Muted Indicator */}
        {!participant.isAudioEnabled && (
          <div 
            data-testid="muted-indicator"
            className="absolute bottom-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded"
          >
            Muted
          </div>
        )}
      </div>
    );
  };

  const renderVideoTile = (participant: MockParticipant) => {
    return (
      <div
        key={`video-${participant.identity}`}
        data-testid="video-tile"
        data-participant={participant.identity}
        className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500"
        onClick={() => {
          // Mock focus/pin functionality
          console.log(`Focused participant: ${participant.identity}`);
        }}
      >
        {participant.isVideoEnabled ? (
          <div className="w-full h-full bg-gray-700 flex items-center justify-center text-white">
            Video: {participant.name}
          </div>
        ) : (
          <div 
            data-testid="video-placeholder"
            className="w-full h-full bg-gray-800 flex items-center justify-center"
          >
            <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
              {participant.name.charAt(0)}
            </div>
          </div>
        )}
        
        {/* Video tile overlay */}
        <div className="absolute bottom-2 left-2 text-white text-sm font-medium">
          {participant.name}
        </div>
        
        {!participant.isAudioEnabled && (
          <div className="absolute bottom-2 right-2 bg-red-500 w-6 h-6 rounded-full flex items-center justify-center">
            🔇
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Call UI Components Test</span>
              <div data-testid="call-duration" className="text-lg font-mono">
                {formatDuration(callDuration)}
              </div>
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Voice Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Voice Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div data-testid="voice-controls" className="flex items-center justify-center gap-4">
              {/* Microphone Toggle */}
              <Button
                data-testid="mic-toggle"
                onClick={toggleMicrophone}
                variant={isAudioEnabled ? "default" : "destructive"}
                className={isAudioEnabled ? "" : "muted"}
                size="lg"
                aria-pressed={isAudioEnabled}
                aria-label={isAudioEnabled ? "Mute microphone" : "Unmute microphone"}
              >
                {isAudioEnabled ? (
                  <span data-testid="mic-icon-active">🎤</span>
                ) : (
                  <span data-testid="mic-icon-muted">🔇</span>
                )}
              </Button>

              {/* Video Toggle */}
              <Button
                data-testid="video-toggle"
                onClick={toggleVideo}
                variant={isVideoEnabled ? "default" : "outline"}
                size="lg"
                aria-pressed={isVideoEnabled}
                aria-label={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
              >
                {isVideoEnabled ? (
                  <span data-testid="video-icon-active">📹</span>
                ) : (
                  <span data-testid="video-icon-disabled">📷</span>
                )}
              </Button>

              {/* Screen Share Toggle */}
              <Button
                data-testid="screen-share-toggle"
                onClick={toggleScreenShare}
                variant={isScreenSharing ? "default" : "outline"}
                className={isScreenSharing ? "active sharing" : ""}
                size="lg"
                aria-pressed={isScreenSharing}
                aria-label={isScreenSharing ? "Stop screen sharing" : "Start screen sharing"}
              >
                🖥️
              </Button>

              {/* Settings */}
              <Dialog open={showDeviceSettings} onOpenChange={setShowDeviceSettings}>
                <DialogTrigger asChild>
                  <Button
                    data-testid="call-settings-button"
                    variant="outline"
                    size="lg"
                    aria-label="Call settings"
                  >
                    ⚙️
                  </Button>
                </DialogTrigger>
                <DialogContent data-testid="device-settings">
                  <DialogHeader>
                    <DialogTitle>Device Settings</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Microphone Selection */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Microphone</label>
                      <Select value={selectedMic} onValueChange={setSelectedMic}>
                        <SelectTrigger data-testid="microphone-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {mediaDevices.filter(d => d.kind === 'audioinput').map(device => (
                            <SelectItem key={device.deviceId} value={device.deviceId} data-testid="device-option">
                              {device.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Camera Selection */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Camera</label>
                      <Select value={selectedCamera} onValueChange={setSelectedCamera}>
                        <SelectTrigger data-testid="camera-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {mediaDevices.filter(d => d.kind === 'videoinput').map(device => (
                            <SelectItem key={device.deviceId} value={device.deviceId} data-testid="device-option">
                              {device.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Speaker Selection */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Speaker</label>
                      <Select value={selectedSpeaker} onValueChange={setSelectedSpeaker}>
                        <SelectTrigger data-testid="speaker-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {mediaDevices.filter(d => d.kind === 'audiooutput').map(device => (
                            <SelectItem key={device.deviceId} value={device.deviceId} data-testid="device-option">
                              {device.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* End Call */}
              <Button
                data-testid="end-call-button"
                onClick={endCall}
                variant="destructive"
                size="lg"
                aria-label="End call"
                className="danger error"
              >
                📞
              </Button>
            </div>

            {/* Screen Share Indicator */}
            {isScreenSharing && (
              <div data-testid="screen-share-indicator" className="text-center mt-4 text-sm text-blue-600">
                🖥️ Screen sharing is active
              </div>
            )}

            {/* Picture in Picture Button */}
            {isVideoEnabled && (
              <div className="text-center mt-4">
                <Button
                  data-testid="picture-in-picture-button"
                  onClick={requestPictureInPicture}
                  variant="outline"
                  size="sm"
                >
                  Picture in Picture
                </Button>
                <div data-testid="pip-indicator" className="hidden">PiP Active</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error Display */}
        {mediaError && (
          <div 
            data-testid="media-error" 
            className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
          >
            {mediaError}
          </div>
        )}

        {/* Video Grid (when video is enabled) */}
        {isVideoEnabled && (
          <Card>
            <CardHeader>
              <CardTitle>Video Grid</CardTitle>
            </CardHeader>
            <CardContent>
              <div data-testid="video-grid" className="grid grid-cols-2 gap-4">
                {participants
                  .filter(p => p.isVideoEnabled || p.isLocal)
                  .map(renderVideoTile)}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Participants List */}
        <Card>
          <CardHeader>
            <CardTitle>Participants ({participants.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {participants.map(renderParticipantTile)}
            </div>
          </CardContent>
        </Card>

        {/* Local Video Preview */}
        {isVideoEnabled && (
          <Card>
            <CardHeader>
              <CardTitle>Local Video</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                data-testid="local-video"
                className="w-full aspect-video bg-gray-200 rounded-lg flex items-center justify-center"
              >
                <span className="text-gray-600">Local Video Preview</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}