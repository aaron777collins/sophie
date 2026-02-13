import { MatrixClient, createClient } from 'matrix-js-sdk';

export interface MediaUploadResult {
  contentUri: string; // mxc:// URI
  filename: string;
  mimetype: string;
  size: number;
}

export interface MediaUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export class MediaUploadError extends Error {
  constructor(message: string, public readonly originalError?: Error) {
    super(message);
    this.name = 'MediaUploadError';
  }
}

/**
 * Upload a file to the Matrix homeserver
 * @param client Authenticated Matrix client
 * @param file File to upload
 * @param onProgress Optional progress callback
 * @returns Promise resolving to upload result
 */
export async function uploadFile(
  client: MatrixClient,
  file: File,
  onProgress?: (progress: MediaUploadProgress) => void
): Promise<MediaUploadResult> {
  try {
    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new MediaUploadError(`File size ${file.size} bytes exceeds limit of ${maxSize} bytes`);
    }

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer();

    // Create XMLHttpRequest for upload with progress tracking
    const uploadPromise = new Promise<MediaUploadResult>((resolve, reject) => {
      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress: MediaUploadProgress = {
              loaded: event.loaded,
              total: event.total,
              percentage: Math.round((event.loaded / event.total) * 100)
            };
            onProgress(progress);
          }
        });
      }

      // Handle response
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve({
              contentUri: response.content_uri,
              filename: file.name,
              mimetype: file.type,
              size: file.size
            });
          } catch (error) {
            reject(new MediaUploadError('Failed to parse upload response', error as Error));
          }
        } else {
          reject(new MediaUploadError(`Upload failed with status ${xhr.status}: ${xhr.responseText}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new MediaUploadError('Network error during upload'));
      });

      xhr.addEventListener('abort', () => {
        reject(new MediaUploadError('Upload was aborted'));
      });

      // Send request to Matrix media endpoint
      const baseUrl = client.getHomeserverUrl();
      const uploadUrl = `${baseUrl}/_matrix/media/r0/upload`;
      
      xhr.open('POST', uploadUrl);
      xhr.setRequestHeader('Authorization', `Bearer ${client.getAccessToken()}`);
      
      if (file.name) {
        xhr.setRequestHeader('Content-Disposition', `filename="${encodeURIComponent(file.name)}"`);
      }

      xhr.send(formData);
    });

    return await uploadPromise;
  } catch (error) {
    if (error instanceof MediaUploadError) {
      throw error;
    }
    throw new MediaUploadError('Failed to upload file', error as Error);
  }
}

/**
 * Get the HTTP URL for an mxc:// content URI
 * @param client Matrix client
 * @param contentUri mxc:// URI
 * @param width Optional width for image thumbnails
 * @param height Optional height for image thumbnails
 * @returns HTTP URL for downloading the content
 */
export function getMediaUrl(
  client: MatrixClient,
  contentUri: string,
  width?: number,
  height?: number
): string {
  // If it's not an mxc:// URI, return as-is (for testing with HTTP URLs)
  if (!contentUri.startsWith('mxc://')) {
    return contentUri;
  }

  const baseUrl = client.getHomeserverUrl();
  
  // Extract server_name and media_id from mxc://server_name/media_id
  const [, , serverName, mediaId] = contentUri.split('/');
  
  if (width && height) {
    // Return thumbnail URL
    return `${baseUrl}/_matrix/media/r0/thumbnail/${serverName}/${mediaId}?width=${width}&height=${height}&method=crop`;
  }
  
  // Return download URL
  return `${baseUrl}/_matrix/media/r0/download/${serverName}/${mediaId}`;
}

/**
 * Get thumbnail URL for an image
 * @param client Matrix client
 * @param contentUri mxc:// URI
 * @param width Thumbnail width (default: 300)
 * @param height Thumbnail height (default: 300)
 * @returns Thumbnail URL
 */
export function getThumbnailUrl(
  client: MatrixClient,
  contentUri: string,
  width: number = 300,
  height: number = 300
): string {
  // If it's not an mxc:// URI, return as-is (for testing with HTTP URLs)
  if (!contentUri.startsWith('mxc://')) {
    return contentUri;
  }
  
  return getMediaUrl(client, contentUri, width, height);
}

/**
 * Check if a MIME type represents an image
 */
export function isImage(mimetype: string): boolean {
  return mimetype.startsWith('image/');
}

/**
 * Check if a MIME type represents a video
 */
export function isVideo(mimetype: string): boolean {
  return mimetype.startsWith('video/');
}

/**
 * Check if a MIME type represents audio
 */
export function isAudio(mimetype: string): boolean {
  return mimetype.startsWith('audio/');
}

/**
 * Get the appropriate Matrix event type for a file
 */
export function getMessageType(mimetype: string): string {
  if (isImage(mimetype)) {
    return 'm.image';
  }
  if (isVideo(mimetype)) {
    return 'm.video';
  }
  if (isAudio(mimetype)) {
    return 'm.audio';
  }
  return 'm.file';
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}