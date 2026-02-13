import { LocalTrack } from 'livekit-client';

export enum ScreenShareSource {
  FULL_SCREEN = 'full-screen',
  WINDOW = 'window',
  TAB = 'tab'
}

export interface ScreenShareControlsProps {
  isScreenSharing: boolean;
  onStartScreenShare: (source: ScreenShareSource) => Promise<void>;
  onStopScreenShare: () => Promise<void>;
  screenShareTrack?: LocalTrack;
}

export interface ScreenShareViewOptions {
  fitMode: 'fit' | 'fill';
  quality: 'low' | 'medium' | 'high';
}