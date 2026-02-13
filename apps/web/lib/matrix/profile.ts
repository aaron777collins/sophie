import { createClient, MatrixClient } from 'matrix-js-sdk';
import { MatrixSession } from './auth';

export interface MatrixProfile {
  displayName?: string;
  avatarUrl?: string;
}

export interface UserSettings {
  theme: 'dark' | 'light' | 'auto';
  compactMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
  messageGroupSpacing: boolean;
  animationsEnabled: boolean;
  notifications: {
    enableDesktopNotifications: boolean;
    enableSoundNotifications: boolean;
    enableMentionNotifications: boolean;
    enableDMNotifications: boolean;
    muteAllNotifications: boolean;
  };
  privacy: {
    allowDirectMessages: 'everyone' | 'friends' | 'nobody';
    showOnlineStatus: boolean;
    allowFriendRequests: boolean;
    shareTypingIndicators: boolean;
    allowReadReceipts: boolean;
    dataCollection: boolean;
    analyticsOptOut: boolean;
  };
}

/**
 * Create a Matrix client from session data
 */
function createMatrixClient(session: MatrixSession): MatrixClient {
  return createClient({
    baseUrl: session.homeserverUrl,
    accessToken: session.accessToken,
    userId: session.userId,
  });
}

/**
 * Get current user profile from Matrix
 */
export async function getMatrixProfile(session: MatrixSession): Promise<MatrixProfile> {
  const client = createMatrixClient(session);
  
  try {
    const profile = await client.getProfileInfo(session.userId);
    return {
      displayName: profile.displayname,
      avatarUrl: profile.avatar_url,
    };
  } catch (error) {
    console.error('Failed to get Matrix profile:', error);
    throw error;
  }
}

/**
 * Update user display name in Matrix
 */
export async function updateDisplayName(session: MatrixSession, displayName: string): Promise<void> {
  const client = createMatrixClient(session);
  
  try {
    await client.setDisplayName(displayName);
  } catch (error) {
    console.error('Failed to update display name:', error);
    throw error;
  }
}

/**
 * Update user avatar in Matrix
 */
export async function updateAvatar(session: MatrixSession, avatarFile: File): Promise<string> {
  const client = createMatrixClient(session);
  
  try {
    // Upload the file to Matrix content repository
    const response = await client.uploadContent(avatarFile, {
      name: avatarFile.name,
      type: avatarFile.type,
    });
    
    const avatarUrl = response.content_uri;
    
    // Set the avatar URL in the user's profile
    await client.setAvatarUrl(avatarUrl);
    
    return avatarUrl;
  } catch (error) {
    console.error('Failed to update avatar:', error);
    throw error;
  }
}

/**
 * Save user settings to Matrix account data
 * This allows settings to sync across devices
 */
export async function saveUserSettings(session: MatrixSession, settings: UserSettings): Promise<void> {
  const client = createMatrixClient(session);
  
  try {
    await client.setAccountData('com.haos.settings' as any, settings as any);
  } catch (error) {
    console.error('Failed to save user settings:', error);
    throw error;
  }
}

/**
 * Load user settings from Matrix account data
 */
export async function loadUserSettings(session: MatrixSession): Promise<UserSettings | null> {
  const client = createMatrixClient(session);
  
  try {
    const event = await client.getAccountData('com.haos.settings' as any);
    return (event?.getContent() as UserSettings) || null;
  } catch (error) {
    console.error('Failed to load user settings:', error);
    return null;
  }
}

/**
 * Complete profile update with all fields
 */
export async function updateCompleteProfile(
  session: MatrixSession,
  profile: {
    displayName?: string;
    aboutMe?: string;
    avatarFile?: File;
  }
): Promise<{ avatarUrl?: string }> {
  const client = createMatrixClient(session);
  const result: { avatarUrl?: string } = {};
  
  try {
    // Update display name if provided
    if (profile.displayName) {
      await client.setDisplayName(profile.displayName);
    }
    
    // Update avatar if provided
    if (profile.avatarFile) {
      result.avatarUrl = await updateAvatar(session, profile.avatarFile);
    }
    
    // Update "about me" in account data (custom field)
    if (profile.aboutMe !== undefined) {
      await client.setAccountData('com.haos.profile' as any, {
        aboutMe: profile.aboutMe,
      } as any);
    }
    
    return result;
  } catch (error) {
    console.error('Failed to update complete profile:', error);
    throw error;
  }
}

/**
 * Get "about me" from account data
 */
export async function getAboutMe(session: MatrixSession): Promise<string | undefined> {
  const client = createMatrixClient(session);
  
  try {
    const event = await client.getAccountData('com.haos.profile' as any);
    return (event?.getContent() as { aboutMe?: string } | undefined)?.aboutMe;
  } catch (error) {
    console.error('Failed to get about me:', error);
    return undefined;
  }
}