import { useState, useCallback, useEffect } from 'react';
import { useRoom } from './use-room';
import { useMatrixClient } from './use-matrix-client';

type ScreenShareSource = 'fullscreen' | 'window' | 'tab';

export const useScreenShare = () => {
  const { client } = useMatrixClient();
  const { room } = useRoom();

  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [availableSources, setAvailableSources] = useState<ScreenShareSource[]>([]);
  const [currentStream, setCurrentStream] = useState<MediaStream | null>(null);

  // Check available screen share sources
  const detectAvailableSources = useCallback(async () => {
    const sources: ScreenShareSource[] = [];
    
    try {
      // Check fullscreen
      const fullscreenStream = await navigator.mediaDevices.getDisplayMedia({ 
        video: true, 
        audio: false 
      });
      fullscreenStream.getTracks().forEach(track => track.stop());
      sources.push('fullscreen');

      // Check window and tab support (requires more complex detection)
      // Note: This might vary by browser
      if ('getDisplayMedia' in navigator.mediaDevices) {
        sources.push('window', 'tab');
      }
    } catch (error) {
      console.warn('Screen share detection failed:', error);
    }

    setAvailableSources(sources);
    return sources;
  }, []);

  // Start screen sharing
  const startScreenShare = useCallback(async (source: ScreenShareSource) => {
    try {
      // Request screen share with appropriate constraints
      const constraints: DisplayMediaStreamConstraints = {
        video: {
          displaySurface: source === 'fullscreen' 
            ? 'monitor' 
            : (source === 'window' ? 'window' : 'browser')
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getDisplayMedia(constraints);
      
      // Stop track when screen sharing ends
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        stopScreenShare();
      });

      setCurrentStream(stream);
      setIsScreenSharing(true);

      // TODO: Implement actual screen share track addition to Matrix call
      // This is a placeholder and needs actual Matrix/LiveKit integration
      // client.sendEvent(room.roomId, 'm.room.message', {
      //   body: 'Started screen sharing',
      //   msgtype: 'm.notice'
      // });

      return stream;
    } catch (error) {
      console.error('Screen share failed:', error);
      throw error;
    }
  }, [room]);

  // Stop screen sharing
  const stopScreenShare = useCallback(() => {
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
      setCurrentStream(null);
      setIsScreenSharing(false);

      // TODO: Implement actual screen share stop in Matrix call
      // client.sendEvent(room.roomId, 'm.room.message', {
      //   body: 'Stopped screen sharing',
      //   msgtype: 'm.notice'
      // });
    }
  }, [currentStream]);

  // Detect available sources on mount
  useEffect(() => {
    detectAvailableSources();
  }, [detectAvailableSources]);

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [currentStream]);

  return {
    isScreenSharing,
    startScreenShare,
    stopScreenShare,
    availableSources,
    currentStream
  };
};