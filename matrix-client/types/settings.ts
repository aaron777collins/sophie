// Settings Type Definitions for Advanced Chat Customization

export interface NotificationSettings {
  // Push Notifications
  enablePushNotifications: boolean;
  enableDesktopNotifications: boolean;
  enableSoundNotifications: boolean;
  
  // Message Notifications
  notifyOnDirectMessages: boolean;
  notifyOnMentions: boolean;
  notifyOnKeywords: boolean;
  notifyOnRoomInvites: boolean;
  
  // Keywords & Filters
  notificationKeywords: string[];
  mutedRooms: string[]; // Room IDs
  mutedUsers: string[]; // User IDs
  
  // Notification Schedule
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:MM format
    endTime: string;   // HH:MM format
  };
  
  // Advanced
  groupNotifications: boolean;
  showSenderInfo: boolean;
  notificationTimeout: number; // milliseconds
}

export interface ThemeSettings {
  // Theme Selection
  mode: 'light' | 'dark' | 'auto'; // auto follows system
  accentColor: string; // hex color
  
  // Font Settings
  fontSize: 'small' | 'medium' | 'large';
  fontFamily: 'system' | 'serif' | 'mono';
  
  // Chat Appearance
  showTimestamps: boolean;
  timestampFormat: '12h' | '24h';
  showAvatars: boolean;
  compactMode: boolean;
  showReadReceipts: boolean;
  
  // Message Appearance
  messageGrouping: boolean;
  showMessageReactions: boolean;
  animatedEmojis: boolean;
  
  // Custom CSS
  customCSS: string;
}

export interface PrivacySettings {
  // Profile Privacy
  showOnlineStatus: boolean;
  showLastSeen: boolean;
  showReadReceipts: boolean;
  showTypingIndicators: boolean;
  
  // Room Privacy
  acceptRoomInvites: 'always' | 'friends' | 'never';
  allowDirectMessages: 'anyone' | 'friends' | 'verified';
  
  // Content Privacy
  enableMessageSearch: boolean;
  storeMessageHistory: boolean;
  enableUrlPreviews: boolean;
  
  // Device Privacy
  sharePresenceData: boolean;
  enableCrossSigning: boolean;
  autoVerifyDevices: boolean;
  
  // Data Settings
  enableAnalytics: boolean;
  enableErrorReporting: boolean;
  dataSyncFrequency: 'realtime' | 'frequent' | 'moderate' | 'minimal';
}

export interface AdvancedMatrixSettings {
  // Connection Settings
  homeserver: string;
  identityServer?: string;
  syncTimeout: number;
  retryDelayMs: number;
  maxRetries: number;
  
  // Sync Settings
  lazyLoadMembers: boolean;
  syncFilterId?: string;
  enablePresence: boolean;
  
  // Encryption Settings
  enableE2EE: boolean;
  keyBackupEnabled: boolean;
  deviceVerificationMode: 'strict' | 'relaxed' | 'disabled';
  crossSigningEnabled: boolean;
  
  // Room Settings
  defaultRoomVersion: string;
  enableBridging: boolean;
  enableFederation: boolean;
  
  // Performance Settings
  enableLazyLoading: boolean;
  messageHistoryLimit: number;
  thumbnailSize: number;
  
  // Developer Settings
  enableDevMode: boolean;
  showEventIds: boolean;
  enableDebugLogs: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
}

export interface AccessibilitySettings {
  // Screen Reader
  enableScreenReader: boolean;
  announceRoomChanges: boolean;
  announceNewMessages: boolean;
  
  // Keyboard Navigation
  enableKeyboardShortcuts: boolean;
  customKeyboardShortcuts: Record<string, string>;
  
  // Visual Accessibility
  highContrast: boolean;
  reduceMotion: boolean;
  largeClickTargets: boolean;
  
  // Audio Accessibility
  audioDescriptions: boolean;
  enableSoundCues: boolean;
}

export interface ChatSettings {
  notifications: NotificationSettings;
  theme: ThemeSettings;
  privacy: PrivacySettings;
  advanced: AdvancedMatrixSettings;
  accessibility: AccessibilitySettings;
  
  // Meta settings
  version: string;
  lastUpdated: string;
  syncWithMatrix: boolean; // Whether to sync settings with Matrix account data
}

export interface SettingsContextType {
  settings: ChatSettings;
  updateSettings: (updates: Partial<ChatSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  exportSettings: () => string;
  importSettings: (settingsJson: string) => Promise<void>;
  isLoading: boolean;
  hasUnsavedChanges: boolean;
  saveChanges: () => Promise<void>;
}

// Default settings configuration
export const DEFAULT_CHAT_SETTINGS: ChatSettings = {
  notifications: {
    enablePushNotifications: true,
    enableDesktopNotifications: true,
    enableSoundNotifications: true,
    notifyOnDirectMessages: true,
    notifyOnMentions: true,
    notifyOnKeywords: false,
    notifyOnRoomInvites: true,
    notificationKeywords: [],
    mutedRooms: [],
    mutedUsers: [],
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00',
    },
    groupNotifications: true,
    showSenderInfo: true,
    notificationTimeout: 5000,
  },
  theme: {
    mode: 'auto',
    accentColor: '#007bff',
    fontSize: 'medium',
    fontFamily: 'system',
    showTimestamps: true,
    timestampFormat: '12h',
    showAvatars: true,
    compactMode: false,
    showReadReceipts: true,
    messageGrouping: true,
    showMessageReactions: true,
    animatedEmojis: true,
    customCSS: '',
  },
  privacy: {
    showOnlineStatus: true,
    showLastSeen: true,
    showReadReceipts: true,
    showTypingIndicators: true,
    acceptRoomInvites: 'friends',
    allowDirectMessages: 'anyone',
    enableMessageSearch: true,
    storeMessageHistory: true,
    enableUrlPreviews: true,
    sharePresenceData: true,
    enableCrossSigning: true,
    autoVerifyDevices: false,
    enableAnalytics: false,
    enableErrorReporting: true,
    dataSyncFrequency: 'frequent',
  },
  advanced: {
    homeserver: 'https://matrix.org',
    syncTimeout: 30000,
    retryDelayMs: 1000,
    maxRetries: 3,
    lazyLoadMembers: true,
    enablePresence: true,
    enableE2EE: true,
    keyBackupEnabled: true,
    deviceVerificationMode: 'relaxed',
    crossSigningEnabled: true,
    defaultRoomVersion: '9',
    enableBridging: true,
    enableFederation: true,
    enableLazyLoading: true,
    messageHistoryLimit: 1000,
    thumbnailSize: 480,
    enableDevMode: false,
    showEventIds: false,
    enableDebugLogs: false,
    logLevel: 'warn',
  },
  accessibility: {
    enableScreenReader: false,
    announceRoomChanges: true,
    announceNewMessages: true,
    enableKeyboardShortcuts: true,
    customKeyboardShortcuts: {},
    highContrast: false,
    reduceMotion: false,
    largeClickTargets: false,
    audioDescriptions: false,
    enableSoundCues: false,
  },
  version: '1.0.0',
  lastUpdated: new Date().toISOString(),
  syncWithMatrix: true,
};

// Settings validation functions
export const validateNotificationSettings = (settings: Partial<NotificationSettings>): string[] => {
  const errors: string[] = [];
  
  if (settings.quietHours?.enabled) {
    const startTime = settings.quietHours.startTime;
    const endTime = settings.quietHours.endTime;
    
    if (!startTime?.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
      errors.push('Invalid quiet hours start time format');
    }
    
    if (!endTime?.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)) {
      errors.push('Invalid quiet hours end time format');
    }
  }
  
  if (settings.notificationTimeout && (settings.notificationTimeout < 1000 || settings.notificationTimeout > 30000)) {
    errors.push('Notification timeout must be between 1-30 seconds');
  }
  
  return errors;
};

export const validateThemeSettings = (settings: Partial<ThemeSettings>): string[] => {
  const errors: string[] = [];
  
  if (settings.accentColor && !settings.accentColor.match(/^#[0-9A-Fa-f]{6}$/)) {
    errors.push('Invalid accent color format (use hex: #RRGGBB)');
  }
  
  return errors;
};

export const validateAdvancedSettings = (settings: Partial<AdvancedMatrixSettings>): string[] => {
  const errors: string[] = [];
  
  if (settings.homeserver) {
    try {
      new URL(settings.homeserver);
    } catch {
      errors.push('Invalid homeserver URL');
    }
  }
  
  if (settings.identityServer) {
    try {
      new URL(settings.identityServer);
    } catch {
      errors.push('Invalid identity server URL');
    }
  }
  
  if (settings.syncTimeout && (settings.syncTimeout < 5000 || settings.syncTimeout > 300000)) {
    errors.push('Sync timeout must be between 5-300 seconds');
  }
  
  if (settings.messageHistoryLimit && (settings.messageHistoryLimit < 100 || settings.messageHistoryLimit > 10000)) {
    errors.push('Message history limit must be between 100-10000 messages');
  }
  
  return errors;
};