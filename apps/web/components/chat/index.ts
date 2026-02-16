// Chat Components
export { ChatInterface } from './chat-interface';
export { ChatInput } from './chat-input';
export { MediaUpload, type FileWithPreview } from './media-upload';
export { MediaMessage } from './media-message';
export { MediaViewer } from './media-viewer';

// Re-export types and utilities from media service
export {
  uploadFile,
  getMediaUrl,
  getThumbnailUrl,
  formatFileSize,
  isImage,
  isVideo,
  isAudio,
  getMessageType,
  type MediaUploadResult,
  type MediaUploadProgress
} from '../../lib/matrix/media';