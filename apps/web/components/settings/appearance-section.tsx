'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/form';
import styles from './appearance-section.module.css';

interface ThemeSettings {
  theme: 'dark' | 'light' | 'auto';
  compactMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
  messageGroupSpacing: boolean;
  animationsEnabled: boolean;
}

const themes = [
  { id: 'dark', name: 'Dark', description: 'Dark theme for low-light environments' },
  { id: 'light', name: 'Light', description: 'Light theme for bright environments' }, 
  { id: 'auto', name: 'Sync with system', description: 'Automatically switch based on system preferences' },
] as const;

const fontSizes = [
  { id: 'small', name: 'Small', description: 'Compact text size' },
  { id: 'medium', name: 'Medium', description: 'Default text size' },
  { id: 'large', name: 'Large', description: 'Larger text for better readability' },
] as const;

export default function AppearanceSection() {
  const [settings, setSettings] = useState<ThemeSettings>({
    theme: 'dark',
    compactMode: false,
    fontSize: 'medium',
    messageGroupSpacing: true,
    animationsEnabled: true,
  });
  
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('haos-appearance-settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings(parsed);
        applyTheme(parsed);
      }
    } catch (error) {
      console.error('Failed to load appearance settings:', error);
    }
  }, []);

  const applyTheme = (themeSettings: ThemeSettings) => {
    const { theme } = themeSettings;
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('theme-dark', 'theme-light');
    
    if (theme === 'auto') {
      // Use system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(prefersDark ? 'theme-dark' : 'theme-light');
    } else {
      root.classList.add(`theme-${theme}`);
    }
    
    // Apply other settings
    root.setAttribute('data-compact-mode', themeSettings.compactMode.toString());
    root.setAttribute('data-font-size', themeSettings.fontSize);
    root.setAttribute('data-animations', themeSettings.animationsEnabled.toString());
  };

  const handleSettingChange = <K extends keyof ThemeSettings>(
    key: K,
    value: ThemeSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    setHasChanges(true);
    
    // Apply theme immediately for preview
    applyTheme(newSettings);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Save to localStorage
      localStorage.setItem('haos-appearance-settings', JSON.stringify(settings));
      
      // TODO: Sync with Matrix account data for cross-device persistence
      // await saveAccountData('appearance', settings);
      
      setHasChanges(false);
      console.log('Appearance settings saved:', settings);
    } catch (error) {
      console.error('Failed to save appearance settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    const defaultSettings: ThemeSettings = {
      theme: 'dark',
      compactMode: false,
      fontSize: 'medium', 
      messageGroupSpacing: true,
      animationsEnabled: true,
    };
    
    setSettings(defaultSettings);
    applyTheme(defaultSettings);
    setHasChanges(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Appearance</h1>
        <p className={styles.subtitle}>
          Customize how HAOS looks and feels
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Theme</h2>
        <div className={styles.themeGrid}>
          {themes.map((theme) => (
            <div
              key={theme.id}
              className={`${styles.themeOption} ${
                settings.theme === theme.id ? styles.active : ''
              }`}
              onClick={() => handleSettingChange('theme', theme.id as ThemeSettings['theme'])}
            >
              <div className={`${styles.themePreview} ${styles[`preview${theme.id}`]}`}>
                <div className={styles.previewHeader}></div>
                <div className={styles.previewContent}></div>
              </div>
              <div className={styles.themeInfo}>
                <h3 className={styles.themeName}>{theme.name}</h3>
                <p className={styles.themeDescription}>{theme.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Font Size</h2>
        <div className={styles.fontSizeGrid}>
          {fontSizes.map((fontSize) => (
            <div
              key={fontSize.id}
              className={`${styles.fontSizeOption} ${
                settings.fontSize === fontSize.id ? styles.active : ''
              }`}
              onClick={() => handleSettingChange('fontSize', fontSize.id as ThemeSettings['fontSize'])}
            >
              <div className={styles.fontSizePreview}>
                <span className={styles[`fontSize${fontSize.id}`]}>
                  The quick brown fox
                </span>
              </div>
              <div className={styles.fontSizeInfo}>
                <h3 className={styles.fontSizeName}>{fontSize.name}</h3>
                <p className={styles.fontSizeDescription}>{fontSize.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Display Options</h2>
        <div className={styles.toggleGrid}>
          <div className={styles.toggleOption}>
            <div className={styles.toggleInfo}>
              <h3 className={styles.toggleName}>Compact Mode</h3>
              <p className={styles.toggleDescription}>
                Reduce spacing between messages and UI elements
              </p>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={settings.compactMode}
                onChange={(e) => handleSettingChange('compactMode', e.target.checked)}
              />
              <span className={styles.toggleSlider}></span>
            </label>
          </div>

          <div className={styles.toggleOption}>
            <div className={styles.toggleInfo}>
              <h3 className={styles.toggleName}>Message Group Spacing</h3>
              <p className={styles.toggleDescription}>
                Add extra spacing between message groups
              </p>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={settings.messageGroupSpacing}
                onChange={(e) => handleSettingChange('messageGroupSpacing', e.target.checked)}
              />
              <span className={styles.toggleSlider}></span>
            </label>
          </div>

          <div className={styles.toggleOption}>
            <div className={styles.toggleInfo}>
              <h3 className={styles.toggleName}>Animations</h3>
              <p className={styles.toggleDescription}>
                Enable smooth animations and transitions
              </p>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={settings.animationsEnabled}
                onChange={(e) => handleSettingChange('animationsEnabled', e.target.checked)}
              />
              <span className={styles.toggleSlider}></span>
            </label>
          </div>
        </div>
      </div>

      {hasChanges && (
        <div className={styles.actions}>
          <div className={styles.actionsContent}>
            <span className={styles.unsavedText}>
              You have unsaved changes!
            </span>
            <div className={styles.actionButtons}>
              <Button
                variant="secondary"
                onClick={handleReset}
                disabled={isLoading}
              >
                Reset
              </Button>
              <Button
                onClick={handleSave}
                disabled={isLoading}
                loading={isLoading}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}