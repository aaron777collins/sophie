# Advanced Chat Settings System

## Overview

This comprehensive settings system provides a user-friendly interface for customizing all aspects of the Matrix chat experience. It includes notification preferences, theme customization, privacy controls, advanced Matrix configurations, accessibility features, and backup/export functionality.

## Features

### 🔔 Notification Settings
- Push, desktop, and sound notifications
- Message-specific notifications (DMs, mentions, keywords)
- Custom notification keywords with management
- Quiet hours with time range configuration
- Advanced notification behavior controls

### 🎨 Theme & Appearance
- Light, dark, and auto theme modes
- Custom accent color with presets and custom picker
- Font family and size configuration
- Chat appearance controls (timestamps, avatars, grouping)
- Custom CSS support with validation
- Live preview of changes

### 🔒 Privacy & Security
- Profile privacy controls (online status, read receipts)
- Room and communication privacy settings
- Content privacy (message history, URL previews)
- Device and encryption management
- Data collection preferences with privacy score

### ⚙️ Advanced Matrix Settings
- Homeserver and identity server configuration
- Sync and connection timeout settings
- Encryption and verification preferences
- Room creation defaults
- Performance optimization options
- Developer tools and debugging features

### ♿ Accessibility Features
- Screen reader support with announcements
- Customizable keyboard shortcuts
- Visual accessibility (high contrast, reduced motion)
- Large click targets for easier interaction
- Audio cues and descriptions
- Comprehensive accessibility status overview

### 💾 Backup & Export
- Export settings to downloadable JSON file
- Copy settings to clipboard
- Import settings from file or text input
- Reset to default values with confirmation
- Current settings overview and summary

## Integration Guide

### 1. Add Settings Provider to Your App

Wrap your application with the `SettingsProvider`:

```tsx
// app/layout.tsx
import { SettingsProvider } from '../components/providers/settings-provider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <SettingsProvider matrixClient={matrixClient}>
          {children}
        </SettingsProvider>
      </body>
    </html>
  );
}
```

### 2. Add Settings Route

The settings page is available at `/settings` and uses the main layout structure:

```tsx
// app/(main)/(routes)/settings/page.tsx
// Already created - no additional setup needed
```

### 3. Using Settings in Components

Use the `useSettings` hook in any component:

```tsx
import { useSettings } from '../../hooks/use-settings';

export function MyComponent() {
  const { settings, updateSettings } = useSettings();
  
  // Access any setting
  const isDarkMode = settings.theme.mode === 'dark';
  const notificationsEnabled = settings.notifications.enablePushNotifications;
  
  // Update settings
  const toggleDarkMode = async () => {
    await updateSettings({
      theme: {
        ...settings.theme,
        mode: isDarkMode ? 'light' : 'dark'
      }
    });
  };
  
  return (
    <button onClick={toggleDarkMode}>
      {isDarkMode ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
}
```

### 4. CSS Custom Properties Integration

The settings system automatically applies CSS custom properties:

```css
/* These are automatically set based on theme settings */
:root {
  --accent-color: #007bff;
  --font-size: 16px;
  --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --animation-duration: 0.2s; /* 0s if reduce motion enabled */
  --transition-duration: 0.2s; /* 0s if reduce motion enabled */
}

/* Theme mode is applied via data attribute */
[data-theme="dark"] {
  /* Dark theme styles */
}

[data-theme="light"] {
  /* Light theme styles */
}

/* High contrast mode */
[data-high-contrast="true"] {
  /* High contrast styles */
}
```

### 5. Matrix Client Integration

Settings sync with Matrix account data when enabled:

```tsx
// Provide your Matrix client instance to the provider
const matrixClient = new MatrixClient({
  baseUrl: 'https://matrix.org',
  // ... other config
});

<SettingsProvider matrixClient={matrixClient}>
  <App />
</SettingsProvider>
```

### 6. Keyboard Shortcuts Integration

Implement keyboard shortcuts based on accessibility settings:

```tsx
import { useSettings } from '../../hooks/use-settings';

export function useKeyboardShortcuts() {
  const { settings } = useSettings();
  
  useEffect(() => {
    if (!settings.accessibility.enableKeyboardShortcuts) return;
    
    const handleKeydown = (e: KeyboardEvent) => {
      const shortcuts = settings.accessibility.customKeyboardShortcuts;
      
      // Example: Focus composer shortcut
      if (e.key === 'k' && e.ctrlKey) {
        e.preventDefault();
        focusComposer();
      }
      
      // Check other shortcuts...
    };
    
    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [settings.accessibility]);
}
```

### 7. Notification System Integration

Use notification settings in your notification handler:

```tsx
export function useNotifications() {
  const { settings } = useSettings();
  
  const showNotification = (message: string, type: string) => {
    const { notifications } = settings;
    
    // Check if notifications are enabled
    if (!notifications.enablePushNotifications) return;
    
    // Check quiet hours
    if (notifications.quietHours.enabled && isInQuietHours()) return;
    
    // Check if this type should notify
    if (type === 'mention' && !notifications.notifyOnMentions) return;
    
    // Show notification with configured timeout
    const notification = new Notification(message, {
      // ... other options
    });
    
    setTimeout(() => {
      notification.close();
    }, notifications.notificationTimeout);
  };
}
```

## File Structure

```
matrix-client/
├── types/
│   └── settings.ts                 # Type definitions and defaults
├── hooks/
│   └── use-settings.ts            # Settings hook and storage logic
├── components/
│   ├── providers/
│   │   └── settings-provider.tsx  # Settings context provider
│   └── settings/
│       ├── settings-interface.tsx         # Main settings interface
│       ├── notification-settings-panel.tsx
│       ├── theme-settings-panel.tsx
│       ├── privacy-settings-panel.tsx
│       ├── advanced-settings-panel.tsx
│       ├── accessibility-settings-panel.tsx
│       └── settings-export-import.tsx
└── app/(main)/(routes)/
    └── settings/
        └── page.tsx               # Settings page route
```

## Validation and Error Handling

The system includes comprehensive validation:

- **URL validation** for homeserver and identity server
- **CSS syntax validation** for custom CSS
- **Time format validation** for quiet hours
- **Color format validation** for accent colors
- **Settings schema validation** on import

Errors are handled gracefully with user-friendly messages and fallback to previous values.

## Performance Considerations

- **Local storage caching** for immediate availability
- **Debounced Matrix sync** to avoid excessive API calls
- **Lazy loading** of settings panels
- **CSS-in-JS optimization** for theme changes
- **Minimal re-renders** with proper React optimization

## Browser Support

- **Modern browsers** with ES2020+ support
- **localStorage** for settings persistence
- **CSS custom properties** for theming
- **Clipboard API** for export/import functionality
- **File API** for settings file import

## Security

- **No sensitive data** in exported settings
- **Client-side validation** with server-side verification
- **Sanitized custom CSS** to prevent XSS
- **Secure defaults** for privacy settings
- **Optional Matrix sync** with user control

## Testing

The settings system includes:

- **Unit tests** for settings validation
- **Integration tests** for provider functionality
- **Accessibility tests** for screen reader compatibility
- **Performance tests** for large settings objects
- **End-to-end tests** for complete user flows

## Customization

You can customize the settings system by:

1. **Adding new setting categories** in `types/settings.ts`
2. **Creating custom panels** following existing patterns
3. **Extending validation** in the settings hook
4. **Adding custom themes** via CSS custom properties
5. **Implementing custom storage** backends

## Migration

When updating the settings schema:

1. **Update the version** in `DEFAULT_CHAT_SETTINGS`
2. **Add migration logic** in `SettingsStorage.mergeWithDefaults`
3. **Test with existing settings** files
4. **Document breaking changes**

This ensures backward compatibility with existing user configurations.