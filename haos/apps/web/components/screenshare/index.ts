export { ScreenShareButton } from './screenshare-button';
export { ScreenSharePreview } from './screenshare-preview';
export { ScreenShareViewer } from './screenshare-viewer';
export { ScreenShareControls } from './screenshare-controls';

// Re-export types and services for convenience
export type {
  ScreenShareSource,
  ScreenShareTrackInfo,
  ScreenShareState,
} from '@/services/screenshare';

export {
  getScreenShareService,
  initializeScreenShareService,
} from '@/services/screenshare';

export type {
  UseScreenShareOptions,
  UseScreenShareReturn,
} from '@/hooks/use-screenshare';

export { useScreenShare } from '@/hooks/use-screenshare';