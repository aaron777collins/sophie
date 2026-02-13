import { LocalTrack } from 'livekit-client';

export enum ScreenShareSource {
  FULL_SCREEN = 'monitor',
  WINDOW = 'window',
  TAB = 'browser'
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