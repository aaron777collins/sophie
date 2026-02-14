import { MatrixClient, createClient } from 'matrix-js-sdk';

export interface MediaDuration {
  /** Duration in seconds */
  duration: number;
  /** Formatted human-readable duration */
  formattedDuration: string;
}

export interface MediaUploadResult {
  contentUri: string; // mxc:// URI
  filename: string;
  mimetype: string;
  size: number;
  duration?: MediaDuration; // Optional media duration
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

// Modify uploadFile to extract duration
export async function uploadFile(
  client: MatrixClient,
  file: File,
  onProgress?: (progress: MediaUploadProgress) => void
): Promise<MediaUploadResult> {
  try {
    // Extract media duration before upload
    const mediaDuration = await extractMediaDuration(file);

    // Rest of the existing uploadFile implementation...
    const uploadResult = await (async () => {
      // Original upload logic here (unchanged)
    })();

    // Add duration to the result if available
    return {
      ...uploadResult,
      duration: mediaDuration || undefined
    };
  } catch (error) {
    // Rest of error handling remains the same
    throw error;
  }
}

// ... (rest of the existing code remains unchanged)