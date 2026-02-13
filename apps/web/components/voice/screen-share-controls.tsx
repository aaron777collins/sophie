import React, { useState, useCallback } from 'react';
import { LocalTrack, createLocalScreenTracks } from 'livekit-client';
import { ScreenShareSource, ScreenShareControlsProps } from './screen-share.types';
import { Button } from '../ui/button';
import { Icons } from '../ui/icons';

export const ScreenShareControls: React.FC<ScreenShareControlsProps> = ({
  isScreenSharing,
  onStartScreenShare,
  onStopScreenShare,
}) => {
  const [screenShareSource, setScreenShareSource] = useState<ScreenShareSource>(ScreenShareSource.FULL_SCREEN);

  const handleStartScreenShare = useCallback(async () => {
    try {
      // Request screen share permissions
      const tracks = await createLocalScreenTracks({
        video: { displaySurface: screenShareSource },
        audio: false, // Optional: add audio sharing if needed
      });

      // Start screen share with selected source
      await onStartScreenShare(screenShareSource);
    } catch (error) {
      console.error('Screen share permission denied or failed:', error);
      // TODO: Add user-friendly error handling
    }
  }, [screenShareSource, onStartScreenShare]);

  const renderScreenShareButton = () => {
    if (isScreenSharing) {
      return (
        <Button 
          variant="destructive" 
          onClick={onStopScreenShare}
          aria-label="Stop Screen Share"
        >
          <Icons.ScreenShareOff />
          Stop Sharing
        </Button>
      );
    }

    return (
      <div className="screen-share-dropdown">
        <Button 
          onClick={handleStartScreenShare}
          aria-label="Start Screen Share"
        >
          <Icons.ScreenShare />
          Share Screen
        </Button>
        <select 
          value={screenShareSource} 
          onChange={(e) => setScreenShareSource(e.target.value as ScreenShareSource)}
        >
          <option value={ScreenShareSource.FULL_SCREEN}>Full Screen</option>
          <option value={ScreenShareSource.WINDOW}>Window</option>
          <option value={ScreenShareSource.TAB}>Tab</option>
        </select>
      </div>
    );
  };

  return (
    <div className="screen-share-controls">
      {renderScreenShareButton()}
    </div>
  );
};