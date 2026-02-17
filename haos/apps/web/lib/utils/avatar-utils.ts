import { MatrixClient } from 'matrix-js-sdk';

/**
 * Convert Matrix mxc:// URL to HTTP URL using the Matrix client
 * @param matrixClient - The Matrix client instance
 * @param mxcUrl - The mxc:// URL to convert
 * @param width - Optional width for resizing
 * @param height - Optional height for resizing
 * @param resizeMethod - Optional resize method ('crop' or 'scale')
 * @returns HTTP URL or null if conversion fails
 */
export function convertMxcToHttp(
  matrixClient: MatrixClient | null,
  mxcUrl: string | null | undefined,
  width?: number,
  height?: number,
  resizeMethod?: string
): string | null {
  if (!matrixClient || !mxcUrl || !mxcUrl.startsWith('mxc://')) {
    return null;
  }

  try {
    return matrixClient.mxcUrlToHttp(mxcUrl, width, height, resizeMethod);
  } catch (error) {
    console.error('Failed to convert mxc URL to HTTP:', error);
    return null;
  }
}

/**
 * Get a user's avatar URL, converted from mxc:// to HTTP if needed
 * @param matrixClient - The Matrix client instance
 * @param avatarUrl - The avatar URL (may be mxc:// or already HTTP)
 * @param fallback - Optional fallback URL if conversion fails
 * @param width - Optional width for resizing
 * @param height - Optional height for resizing
 * @returns HTTP URL, fallback URL, or null
 */
export function getAvatarHttpUrl(
  matrixClient: MatrixClient | null,
  avatarUrl: string | null | undefined,
  fallback?: string,
  width?: number,
  height?: number
): string | null {
  if (!avatarUrl) {
    return fallback || null;
  }

  // If it's already an HTTP URL, return as-is
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    return avatarUrl;
  }

  // Convert mxc:// URL to HTTP
  if (avatarUrl.startsWith('mxc://')) {
    const convertedUrl = convertMxcToHttp(matrixClient, avatarUrl, width, height);
    return convertedUrl || fallback || null;
  }

  // For any other format, return the fallback
  return fallback || null;
}

/**
 * Generate initials from a name for use as fallback avatar
 * @param name - The user's display name
 * @param maxChars - Maximum number of characters to return (default: 2)
 * @returns Uppercase initials
 */
export function getInitials(name: string, maxChars: number = 2): string {
  if (!name || name.trim() === '') {
    return '?';
  }

  return name
    .trim()
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, maxChars);
}

/**
 * Avatar component props with proper URL handling
 */
export interface AvatarProps {
  matrixClient: MatrixClient | null;
  avatarUrl?: string | null;
  displayName: string;
  size?: number;
  fallbackUrl?: string;
  className?: string;
}

/**
 * Get the best avatar source (HTTP URL or initials) for display
 * @param matrixClient - The Matrix client instance  
 * @param avatarUrl - The avatar URL (may be mxc://)
 * @param displayName - The user's display name for generating initials
 * @param fallbackUrl - Optional fallback image URL
 * @param size - Optional size for avatar resizing
 * @returns Object with avatar HTTP URL and/or initials
 */
export function getAvatarDisplayInfo(
  matrixClient: MatrixClient | null,
  avatarUrl: string | null | undefined,
  displayName: string,
  fallbackUrl?: string,
  size?: number
): {
  httpUrl: string | null;
  initials: string;
  hasAvatar: boolean;
} {
  const httpUrl = getAvatarHttpUrl(
    matrixClient, 
    avatarUrl, 
    fallbackUrl, 
    size, 
    size
  );
  
  const initials = getInitials(displayName);
  
  return {
    httpUrl,
    initials,
    hasAvatar: !!httpUrl
  };
}