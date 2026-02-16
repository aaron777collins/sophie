import { MatrixClient, createClient } from 'matrix-js-sdk';

export interface MediaDuration {
  /** Duration in seconds */
  duration: number;
  /** Formatted human-readable duration */
  formattedDuration: string;
}

export interface MediaUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface MediaUploadResult {
  contentUri: string; // mxc:// URI
  filename: string;
  mimetype: string;
  size: number;
  duration?: MediaDuration; // Optional media duration
}

// Media type checking utilities
export function isImage(mimetype: string): boolean {
  return mimetype.startsWith('image/');
}

export function isVideo(mimetype: string): boolean {
  return mimetype.startsWith('video/');
}

export function isAudio(mimetype: string): boolean {
  return mimetype.startsWith('audio/');
}

// File size formatting utility
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Get message type based on mimetype
export function getMessageType(mimetype: string): 'm.image' | 'm.video' | 'm.audio' | 'm.file' {
  if (isImage(mimetype)) return 'm.image';
  if (isVideo(mimetype)) return 'm.video';
  if (isAudio(mimetype)) return 'm.audio';
  return 'm.file';
}

// Media URL utilities
export function getMediaUrl(client: MatrixClient, mxcUri: string, width?: number, height?: number): string {
  // Convert mxc:// URI to HTTP URL for direct access
  return client.mxcUrlToHttp(mxcUri, width, height) || '';
}

export function getThumbnailUrl(client: MatrixClient, mxcUri: string, width = 300, height = 300): string {
  // Get thumbnail URL for media
  return client.mxcUrlToHttp(mxcUri, width, height, 'crop') || '';
}

// Existing code from previous implementation...

/**
 * Extract media duration from a file
 * @param file File object to extract duration from
 * @returns Promise resolving to media duration
 */
export async function extractMediaDuration(file: File): Promise<MediaDuration | null> {
  // Check if browser supports HTMLMediaElement (for audio/video files)
  if (!(file.type.startsWith('audio/') || file.type.startsWith('video/'))) {
    return null;
  }

  return new Promise((resolve, reject) => {
    try {
      const audioElement = new Audio(URL.createObjectURL(file));
      
      audioElement.addEventListener('loadedmetadata', () => {
        const duration = audioElement.duration;
        
        // Validate duration
        if (isNaN(duration) || duration <= 0) {
          resolve(null);
          return;
        }

        // Format duration
        const formattedDuration = formatDuration(duration);
        
        // Revoke object URL to free memory
        URL.revokeObjectURL(audioElement.src);
        
        resolve({
          duration,
          formattedDuration
        });
      });

      audioElement.addEventListener('error', () => {
        resolve(null);
      });
    } catch (error) {
      resolve(null);
    }
  });
}

/**
 * Format duration in HH:MM:SS or MM:SS format
 * @param seconds Duration in seconds
 * @returns Formatted duration string
 */
export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return '00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  // If duration is less than an hour, use MM:SS
  if (hours === 0) {
    return [minutes, secs]
      .map(v => v.toString().padStart(2, '0'))
      .join(':');
  }
  
  // If duration is an hour or more, use HH:MM:SS
  return [hours, minutes, secs]
    .map(v => v.toString().padStart(2, '0'))
    .join(':');
}

// Upload file to Matrix media repository
export async function uploadFile(
  client: MatrixClient,
  file: File,
  onProgress?: (progress: MediaUploadProgress) => void
): Promise<MediaUploadResult> {
  try {
    // Extract media duration before upload
    const mediaDuration = await extractMediaDuration(file);

    // Upload file to Matrix media repository
    const response = await client.uploadContent(file, {
      name: file.name,
      type: file.type,
      progressHandler: onProgress ? (progress: any) => {
        onProgress({
          loaded: progress.loaded || 0,
          total: progress.total || file.size,
          percentage: progress.total ? Math.round((progress.loaded / progress.total) * 100) : 0
        });
      } : undefined
    });

    // Return upload result
    return {
      contentUri: response.content_uri,
      filename: file.name,
      mimetype: file.type,
      size: file.size,
      duration: mediaDuration || undefined
    };
  } catch (error) {
    console.error('Failed to upload file:', error);
    throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}