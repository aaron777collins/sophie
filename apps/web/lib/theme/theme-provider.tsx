'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface ThemeSettings {
  theme: 'dark' | 'light' | 'auto';
  compactMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
  messageGroupSpacing: boolean;
  animationsEnabled: boolean;
}

interface ThemeContextValue {
  settings: ThemeSettings;
  updateSettings: (settings: Partial<ThemeSettings>) => void;
  resolvedTheme: 'dark' | 'light';
}

const defaultSettings: ThemeSettings = {
  theme: 'dark',
  compactMode: false,
  fontSize: 'medium',
  messageGroupSpacing: true,
  animationsEnabled: true,
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [settings, setSettings] = useState<ThemeSettings>(defaultSettings);
  const [systemTheme, setSystemTheme] = useState<'dark' | 'light'>('dark');

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('haos-appearance-settings');
      if (saved) {
        const parsed = JSON.parse(saved) as ThemeSettings;
        setSettings(parsed);
      }
    } catch (error) {
      console.error('Failed to load theme settings:', error);
    }
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };
    
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handleChange);
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply theme to DOM
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('theme-dark', 'theme-light');
    
    // Determine resolved theme
    const resolvedTheme = settings.theme === 'auto' ? systemTheme : settings.theme;
    
    // Apply theme class
    root.classList.add(`theme-${resolvedTheme}`);
    
    // Apply other settings as data attributes
    root.setAttribute('data-compact-mode', settings.compactMode.toString());
    root.setAttribute('data-font-size', settings.fontSize);
    root.setAttribute('data-message-spacing', settings.messageGroupSpacing.toString());
    root.setAttribute('data-animations', settings.animationsEnabled.toString());
  }, [settings, systemTheme]);

  const updateSettings = (newSettings: Partial<ThemeSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    
    // Save to localStorage
    try {
      localStorage.setItem('haos-appearance-settings', JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save theme settings:', error);
    }
  };

  const resolvedTheme = settings.theme === 'auto' ? systemTheme : settings.theme;

  return (
    <ThemeContext.Provider
      value={{
        settings,
        updateSettings,
        resolvedTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}