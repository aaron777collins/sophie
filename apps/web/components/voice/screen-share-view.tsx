import React, { useState, useRef, useEffect } from 'react';
import { LocalTrack } from 'livekit-client';
import { ScreenShareViewOptions } from './screen-share.types';

interface ScreenShareViewProps {
  screenShareTrack?: LocalTrack;
}

export const ScreenShareView: React.FC<ScreenShareViewProps> = ({ screenShareTrack }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [viewOptions, setViewOptions] = useState<ScreenShareViewOptions>({
    fitMode: 'fit',
    quality: 'medium'
  });

  useEffect(() => {
    if (screenShareTrack && videoRef.current) {
      screenShareTrack.attach(videoRef.current);
      return () => {
        screenShareTrack.detach(videoRef.current!);
      };
    }
  }, [screenShareTrack]);

  if (!screenShareTrack) return null;

  const handleFitModeToggle = () => {
    setViewOptions(prev => ({
      ...prev,
      fitMode: prev.fitMode === 'fit' ? 'fill' : 'fit'
    }));
  };

  const handleQualityChange = (quality: ScreenShareViewOptions['quality']) => {
    setViewOptions(prev => ({ ...prev, quality }));
  };

  return (
    <div className="screen-share-view">
      <div 
        className={`screen-share-container ${viewOptions.fitMode}`}
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: viewOptions.fitMode === 'fit' ? 'contain' : 'cover' 
        }}
      >
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          style={{ width: '100%', height: '100%', objectFit: viewOptions.fitMode === 'fit' ? 'contain' : 'cover' }}
        />
      </div>
      
      <div className="screen-share-controls">
        <button onClick={handleFitModeToggle}>
          {viewOptions.fitMode === 'fit' ? 'Fill Screen' : 'Fit Screen'}
        </button>
        
        <select 
          value={viewOptions.quality}
          onChange={(e) => handleQualityChange(e.target.value as ScreenShareViewOptions['quality'])}
        >
          <option value="low">Low Quality</option>
          <option value="medium">Medium Quality</option>
          <option value="high">High Quality</option>
        </select>
      </div>
    </div>
  );
};