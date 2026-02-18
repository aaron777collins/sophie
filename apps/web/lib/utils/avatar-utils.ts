/**
 * Avatar display utilities for Matrix users
 */

import { MatrixClient } from 'matrix-js-sdk';

export interface AvatarDisplayInfo {
  avatarUrl?: string;
  displayName: string;
  fallbackText: string;
  colorSeed: string;
  size?: number;
  hasAvatar: boolean;
  httpUrl?: string;
  initials: string;
}

/**
 * Get avatar display information for a Matrix user
 */
export function getAvatarDisplayInfo(
  matrixClient: MatrixClient, 
  avatarUrl?: string, 
  displayName?: string, 
  userId?: string, 
  size?: number
): AvatarDisplayInfo {
  // Use display name if provided, otherwise extract from user ID
  const name = displayName || (userId ? extractDisplayNameFromUserId(userId) : 'Unknown');
  
  // Generate fallback text (usually initials)
  const fallbackText = generateFallbackText(name);
  
  // Generate a consistent color seed for avatar background
  const colorSeed = generateColorSeed(userId || displayName || 'unknown');
  
  return {
    avatarUrl,
    displayName: name,
    fallbackText,
    colorSeed,
    size,
    hasAvatar: !!avatarUrl,
    httpUrl: avatarUrl,
    initials: fallbackText,
  };
}

/**
 * Extract a display name from a Matrix user ID
 */
function extractDisplayNameFromUserId(userId: string): string {
  // Matrix user IDs are in the format @localpart:domain.com
  const match = userId.match(/^@([^:]+):/);
  return match ? match[1] : userId;
}

/**
 * Generate fallback text (initials) from a display name
 */
function generateFallbackText(displayName: string): string {
  const trimmed = displayName.trim();
  if (!trimmed) return '?';
  
  const words = trimmed.split(/\s+/);
  if (words.length === 1) {
    // Single word - take first 2 characters
    return words[0].substring(0, 2).toUpperCase();
  }
  
  // Multiple words - take first letter of first two words
  return words.slice(0, 2).map(word => word[0]).join('').toUpperCase();
}

/**
 * Generate a consistent color seed for avatar backgrounds
 */
function generateColorSeed(userId: string): string {
  // Generate a simple hash of the user ID for consistent colors
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert to a hex string for color
  return Math.abs(hash).toString(16).substring(0, 6);
}