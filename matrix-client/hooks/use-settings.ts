'use client';

import { useState, useEffect, useCallback, useContext, createContext } from 'react';
import { 
  ChatSettings, 
  SettingsContextType, 
  DEFAULT_CHAT_SETTINGS,
  validateNotificationSettings,
  validateThemeSettings,
  validateAdvancedSettings
} from '../types/settings';

// Settings Context
export const SettingsContext = createContext<SettingsContextType | null>(null);

// Custom hook to use settings context
export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

// Settings storage utilities
const SETTINGS_STORAGE_KEY = 'matrix-chat-settings';
const MATRIX_ACCOUNT_DATA_TYPE = 'dev.aaron777collins.chat_settings';

class SettingsStorage {
  // Load settings from localStorage with fallback to defaults
  static loadLocal(): ChatSettings {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to handle version updates
        return this.mergeWithDefaults(parsed);
      }
    } catch (error) {
      console.warn('Failed to load settings from localStorage:', error);
    }
    return DEFAULT_CHAT_SETTINGS;
  }

  // Save settings to localStorage
  static saveLocal(settings: ChatSettings): void {
    try {
      const toSave = {
        ...settings,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(toSave));
    } catch (error) {
      console.error('Failed to save settings to localStorage:', error);
    }
  }

  // Merge stored settings with defaults (handles version changes)
  static mergeWithDefaults(stored: Partial<ChatSettings>): ChatSettings {
    const merged: ChatSettings = {
      notifications: { ...DEFAULT_CHAT_SETTINGS.notifications, ...stored.notifications },
      theme: { ...DEFAULT_CHAT_SETTINGS.theme, ...stored.theme },
      privacy: { ...DEFAULT_CHAT_SETTINGS.privacy, ...stored.privacy },
      advanced: { ...DEFAULT_CHAT_SETTINGS.advanced, ...stored.advanced },
      accessibility: { ...DEFAULT_CHAT_SETTINGS.accessibility, ...stored.accessibility },
      version: DEFAULT_CHAT_SETTINGS.version,
      lastUpdated: stored.lastUpdated || new Date().toISOString(),
      syncWithMatrix: stored.syncWithMatrix ?? true,
    };

    return merged;
  }

  // Load settings from Matrix account data
  static async loadFromMatrix(matrixClient: any): Promise<ChatSettings | null> {
    try {
      if (!matrixClient?.isLoggedIn()) {
        return null;
      }

      const accountData = matrixClient.getAccountData(MATRIX_ACCOUNT_DATA_TYPE);
      if (accountData?.getContent()) {
        return this.mergeWithDefaults(accountData.getContent());
      }
    } catch (error) {
      console.warn('Failed to load settings from Matrix account data:', error);
    }
    return null;
  }

  // Save settings to Matrix account data
  static async saveToMatrix(matrixClient: any, settings: ChatSettings): Promise<void> {
    try {
      if (!matrixClient?.isLoggedIn()) {
        return;
      }

      await matrixClient.setAccountData(MATRIX_ACCOUNT_DATA_TYPE, {
        ...settings,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to save settings to Matrix account data:', error);
      throw error;
    }
  }
}

// Settings validation
const validateSettings = (settings: Partial<ChatSettings>): string[] => {
  const errors: string[] = [];
  
  if (settings.notifications) {
    errors.push(...validateNotificationSettings(settings.notifications));
  }
  
  if (settings.theme) {
    errors.push(...validateThemeSettings(settings.theme));
  }
  
  if (settings.advanced) {
    errors.push(...validateAdvancedSettings(settings.advanced));
  }
  
  return errors;
};

// Settings hook implementation
export const useSettingsImpl = (matrixClient?: any): SettingsContextType => {
  const [settings, setSettings] = useState<ChatSettings>(DEFAULT_CHAT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingSettings, setPendingSettings] = useState<ChatSettings | null>(null);

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true);
      
      // First, load from localStorage
      let loadedSettings = SettingsStorage.loadLocal();
      
      // If Matrix client is available and sync is enabled, try to load from Matrix
      if (matrixClient && loadedSettings.syncWithMatrix) {
        try {
          const matrixSettings = await SettingsStorage.loadFromMatrix(matrixClient);
          if (matrixSettings) {
            // Use the more recent settings
            const localTime = new Date(loadedSettings.lastUpdated).getTime();
            const matrixTime = new Date(matrixSettings.lastUpdated).getTime();
            
            if (matrixTime > localTime) {
              loadedSettings = matrixSettings;
              // Save the newer settings locally
              SettingsStorage.saveLocal(matrixSettings);
            } else if (localTime > matrixTime) {
              // Local settings are newer, sync them to Matrix
              await SettingsStorage.saveToMatrix(matrixClient, loadedSettings);
            }
          }
        } catch (error) {
          console.warn('Failed to sync settings with Matrix:', error);
        }
      }
      
      setSettings(loadedSettings);
      setIsLoading(false);
    };

    loadSettings();
  }, [matrixClient]);

  // Apply theme settings to DOM
  useEffect(() => {
    const applyThemeSettings = () => {
      const root = document.documentElement;
      const { theme } = settings;

      // Apply theme mode
      if (theme.mode === 'auto') {
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        root.setAttribute('data-theme', darkModeQuery.matches ? 'dark' : 'light');
        
        const handleThemeChange = (e: MediaQueryListEvent) => {
          root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
        };
        
        darkModeQuery.addEventListener('change', handleThemeChange);
        return () => darkModeQuery.removeEventListener('change', handleThemeChange);
      } else {
        root.setAttribute('data-theme', theme.mode);
      }

      // Apply accent color
      root.style.setProperty('--accent-color', theme.accentColor);

      // Apply font settings
      root.style.setProperty('--font-size', {
        small: '14px',
        medium: '16px',
        large: '18px'
      }[theme.fontSize]);

      root.style.setProperty('--font-family', {
        system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        serif: 'Georgia, "Times New Roman", serif',
        mono: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, monospace'
      }[theme.fontFamily]);

      // Apply accessibility settings
      if (settings.accessibility.reduceMotion) {
        root.style.setProperty('--animation-duration', '0s');
        root.style.setProperty('--transition-duration', '0s');
      }

      if (settings.accessibility.highContrast) {
        root.setAttribute('data-high-contrast', 'true');
      } else {
        root.removeAttribute('data-high-contrast');
      }

      // Apply custom CSS
      const customStyleId = 'matrix-chat-custom-css';
      let customStyleElement = document.getElementById(customStyleId);
      
      if (theme.customCSS) {
        if (!customStyleElement) {
          customStyleElement = document.createElement('style');
          customStyleElement.id = customStyleId;
          document.head.appendChild(customStyleElement);
        }
        customStyleElement.textContent = theme.customCSS;
      } else if (customStyleElement) {
        customStyleElement.remove();
      }
    };

    if (!isLoading) {
      applyThemeSettings();
    }
  }, [settings, isLoading]);

  // Update settings
  const updateSettings = useCallback(async (updates: Partial<ChatSettings>) => {
    // Validate settings
    const validationErrors = validateSettings(updates);
    if (validationErrors.length > 0) {
      throw new Error(`Invalid settings: ${validationErrors.join(', ')}`);
    }

    const newSettings = {
      ...settings,
      ...updates,
      lastUpdated: new Date().toISOString(),
    };

    setSettings(newSettings);
    setPendingSettings(newSettings);
    setHasUnsavedChanges(true);
    
    // Auto-save locally
    SettingsStorage.saveLocal(newSettings);
  }, [settings]);

  // Save changes to Matrix
  const saveChanges = useCallback(async () => {
    if (!pendingSettings || !hasUnsavedChanges) return;

    if (matrixClient && pendingSettings.syncWithMatrix) {
      try {
        await SettingsStorage.saveToMatrix(matrixClient, pendingSettings);
      } catch (error) {
        console.error('Failed to sync settings to Matrix:', error);
        // Don't throw - local save already happened
      }
    }

    setPendingSettings(null);
    setHasUnsavedChanges(false);
  }, [matrixClient, pendingSettings, hasUnsavedChanges]);

  // Reset to defaults
  const resetSettings = useCallback(async () => {
    const defaultSettings = {
      ...DEFAULT_CHAT_SETTINGS,
      lastUpdated: new Date().toISOString(),
    };

    setSettings(defaultSettings);
    SettingsStorage.saveLocal(defaultSettings);

    if (matrixClient && defaultSettings.syncWithMatrix) {
      try {
        await SettingsStorage.saveToMatrix(matrixClient, defaultSettings);
      } catch (error) {
        console.error('Failed to reset settings in Matrix:', error);
      }
    }

    setHasUnsavedChanges(false);
    setPendingSettings(null);
  }, [matrixClient]);

  // Export settings as JSON
  const exportSettings = useCallback(() => {
    return JSON.stringify(settings, null, 2);
  }, [settings]);

  // Import settings from JSON
  const importSettings = useCallback(async (settingsJson: string) => {
    try {
      const importedSettings = JSON.parse(settingsJson);
      
      // Validate the imported settings
      const validationErrors = validateSettings(importedSettings);
      if (validationErrors.length > 0) {
        throw new Error(`Invalid imported settings: ${validationErrors.join(', ')}`);
      }

      // Merge with defaults to handle missing properties
      const mergedSettings = SettingsStorage.mergeWithDefaults(importedSettings);
      await updateSettings(mergedSettings);
    } catch (error) {
      console.error('Failed to import settings:', error);
      throw new Error(`Failed to import settings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [updateSettings]);

  return {
    settings,
    updateSettings,
    resetSettings,
    exportSettings,
    importSettings,
    isLoading,
    hasUnsavedChanges,
    saveChanges,
  };
};