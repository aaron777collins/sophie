'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Mail, 
  Smartphone, 
  Clock, 
  Volume2, 
  VolumeX,
  Check,
  AlertCircle,
  Info,
  Globe,
} from 'lucide-react';
import { useNotifications } from '@/hooks/use-notifications';
import { NotificationSettings, NotificationType } from '@/lib/types/notification';
import { Button } from '@/components/ui/form';
import styles from './notification-settings.module.css';

interface NotificationSettingsProps {
  userId?: string;
  onSave?: (settings: NotificationSettings) => void;
}

const NOTIFICATION_TYPES: Array<{
  type: NotificationType;
  label: string;
  description: string;
  icon: React.ComponentType;
}> = [
  {
    type: 'message',
    label: 'Messages',
    description: 'Regular chat messages in channels',
    icon: Bell,
  },
  {
    type: 'mention',
    label: 'Mentions',
    description: 'When someone mentions you or replies to your message',
    icon: Bell,
  },
  {
    type: 'direct_message',
    label: 'Direct Messages',
    description: 'Private messages sent directly to you',
    icon: Mail,
  },
  {
    type: 'voice_call',
    label: 'Voice Calls',
    description: 'Incoming voice and video calls',
    icon: Volume2,
  },
  {
    type: 'server_update',
    label: 'Server Updates',
    description: 'Server settings changes, new channels, etc.',
    icon: Globe,
  },
  {
    type: 'role_update',
    label: 'Role Changes',
    description: 'When your roles or permissions change',
    icon: Check,
  },
  {
    type: 'system',
    label: 'System Notifications',
    description: 'Important system messages and updates',
    icon: Info,
  },
];

const DELIVERY_METHOD_OPTIONS = [
  { value: 'in_app', label: 'In-App', icon: Bell },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'push', label: 'Push', icon: Smartphone },
] as const;

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: '#6b7280' },
  { value: 'normal', label: 'Normal', color: '#3b82f6' },
  { value: 'high', label: 'High', color: '#f59e0b' },
  { value: 'urgent', label: 'Urgent', color: '#ef4444' },
] as const;

export default function NotificationSettingsComponent({ userId, onSave }: NotificationSettingsProps) {
  const {
    settings,
    isLoadingSettings,
    settingsError,
    isSaving,
    updateSettings,
    pushService,
  } = useNotifications({ userId });

  const [localSettings, setLocalSettings] = useState<NotificationSettings | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [testEmailSent, setTestEmailSent] = useState(false);

  // Sync local state with loaded settings
  useEffect(() => {
    if (settings && !localSettings) {
      setLocalSettings({ ...settings });
    }
  }, [settings, localSettings]);

  // Handle setting changes
  const handleSettingChange = <K extends keyof NotificationSettings>(
    key: K, 
    value: NotificationSettings[K]
  ) => {
    if (!localSettings) return;
    
    const updated = { ...localSettings, [key]: value };
    setLocalSettings(updated);
    setHasChanges(true);
  };

  // Handle type-specific setting changes
  const handleTypeSettingChange = (
    type: NotificationType,
    key: keyof NonNullable<NotificationSettings['typeSettings'][NotificationType]>,
    value: any
  ) => {
    if (!localSettings) return;

    const updated = {
      ...localSettings,
      typeSettings: {
        ...localSettings.typeSettings,
        [type]: {
          ...localSettings.typeSettings[type],
          [key]: value,
        },
      },
    };
    setLocalSettings(updated);
    setHasChanges(true);
  };

  // Save settings
  const handleSave = async () => {
    if (!localSettings || !hasChanges) return;

    try {
      await updateSettings(localSettings);
      setHasChanges(false);
      onSave?.(localSettings);
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    }
  };

  // Reset settings
  const handleReset = () => {
    if (settings) {
      setLocalSettings({ ...settings });
      setHasChanges(false);
    }
  };

  // Test email notifications
  const handleTestEmail = async () => {
    if (!localSettings?.emailAddress) return;
    
    // This would trigger a test email in a real implementation
    setTestEmailSent(true);
    setTimeout(() => setTestEmailSent(false), 3000);
  };

  // Enable push notifications
  const handleEnablePush = async () => {
    try {
      const subscription = await pushService.enablePushNotifications();
      if (subscription) {
        handleSettingChange('enablePushNotifications', true);
        handleSettingChange('pushSubscription', subscription);
      }
    } catch (error) {
      console.error('Failed to enable push notifications:', error);
    }
  };

  if (isLoadingSettings) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p>Loading notification settings...</p>
      </div>
    );
  }

  if (settingsError) {
    return (
      <div className={styles.error}>
        <AlertCircle size={24} />
        <p>Failed to load notification settings</p>
        <p className={styles.errorMessage}>{settingsError}</p>
      </div>
    );
  }

  if (!localSettings) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          <Bell size={20} />
          Notification Settings
        </h1>
        <p className={styles.subtitle}>
          Control when and how you receive notifications
        </p>
      </div>

      {/* Global Settings */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Global Settings</h2>
        <div className={styles.toggleGrid}>
          <div className={styles.toggleOption}>
            <div className={styles.toggleInfo}>
              <h3 className={styles.toggleName}>Master Switch</h3>
              <p className={styles.toggleDescription}>
                Enable or disable all notifications
              </p>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={!localSettings.muteAllNotifications}
                onChange={(e) => handleSettingChange('muteAllNotifications', !e.target.checked)}
              />
              <span className={styles.toggleSlider}></span>
            </label>
          </div>

          <div className={styles.toggleOption}>
            <div className={styles.toggleInfo}>
              <h3 className={styles.toggleName}>Desktop Notifications</h3>
              <p className={styles.toggleDescription}>
                Show notifications on your desktop when HAOS is in the background
              </p>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={localSettings.enableDesktopNotifications}
                onChange={(e) => handleSettingChange('enableDesktopNotifications', e.target.checked)}
                disabled={localSettings.muteAllNotifications}
              />
              <span className={styles.toggleSlider}></span>
            </label>
          </div>

          <div className={styles.toggleOption}>
            <div className={styles.toggleInfo}>
              <h3 className={styles.toggleName}>Sound Notifications</h3>
              <p className={styles.toggleDescription}>
                Play sound alerts for incoming messages and mentions
              </p>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={localSettings.enableSoundNotifications}
                onChange={(e) => handleSettingChange('enableSoundNotifications', e.target.checked)}
                disabled={localSettings.muteAllNotifications}
              />
              <span className={styles.toggleSlider}></span>
            </label>
          </div>
        </div>
      </div>

      {/* Email Settings */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <Mail size={16} />
          Email Notifications
        </h2>
        <div className={styles.toggleGrid}>
          <div className={styles.toggleOption}>
            <div className={styles.toggleInfo}>
              <h3 className={styles.toggleName}>Enable Email Notifications</h3>
              <p className={styles.toggleDescription}>
                Receive notifications via email
              </p>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={localSettings.enableEmailNotifications}
                onChange={(e) => handleSettingChange('enableEmailNotifications', e.target.checked)}
                disabled={localSettings.muteAllNotifications}
              />
              <span className={styles.toggleSlider}></span>
            </label>
          </div>
        </div>

        {localSettings.enableEmailNotifications && (
          <div className={styles.emailSettings}>
            <div className={styles.inputGroup}>
              <label htmlFor="emailAddress" className={styles.inputLabel}>
                Email Address
              </label>
              <input
                id="emailAddress"
                type="email"
                value={localSettings.emailAddress || ''}
                onChange={(e) => handleSettingChange('emailAddress', e.target.value)}
                className={styles.textInput}
                placeholder="your@email.com"
              />
            </div>
            <button
              onClick={handleTestEmail}
              className={`${styles.testButton} ${testEmailSent ? styles.sent : ''}`}
              disabled={!localSettings.emailAddress || testEmailSent}
            >
              {testEmailSent ? 'Test Email Sent!' : 'Send Test Email'}
            </button>
          </div>
        )}
      </div>

      {/* Push Notification Settings */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <Smartphone size={16} />
          Push Notifications
        </h2>
        <div className={styles.toggleGrid}>
          <div className={styles.toggleOption}>
            <div className={styles.toggleInfo}>
              <h3 className={styles.toggleName}>Enable Push Notifications</h3>
              <p className={styles.toggleDescription}>
                Receive push notifications in your browser
              </p>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={localSettings.enablePushNotifications}
                onChange={(e) => {
                  if (e.target.checked && !localSettings.pushSubscription) {
                    handleEnablePush();
                  } else {
                    handleSettingChange('enablePushNotifications', e.target.checked);
                  }
                }}
                disabled={localSettings.muteAllNotifications || !pushService.isSupported}
              />
              <span className={styles.toggleSlider}></span>
            </label>
          </div>
        </div>

        {!pushService.isSupported && (
          <div className={styles.warningMessage}>
            <AlertCircle size={16} />
            <span>Push notifications are not supported in this browser</span>
          </div>
        )}

        {pushService.permission === 'denied' && (
          <div className={styles.warningMessage}>
            <AlertCircle size={16} />
            <span>Push notifications are blocked. Please enable them in your browser settings.</span>
          </div>
        )}
      </div>

      {/* Quiet Hours */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <Clock size={16} />
          Quiet Hours
        </h2>
        <div className={styles.toggleGrid}>
          <div className={styles.toggleOption}>
            <div className={styles.toggleInfo}>
              <h3 className={styles.toggleName}>Enable Quiet Hours</h3>
              <p className={styles.toggleDescription}>
                Mute notifications during specified hours
              </p>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={localSettings.quietHoursEnabled}
                onChange={(e) => handleSettingChange('quietHoursEnabled', e.target.checked)}
                disabled={localSettings.muteAllNotifications}
              />
              <span className={styles.toggleSlider}></span>
            </label>
          </div>
        </div>

        {localSettings.quietHoursEnabled && (
          <div className={styles.quietHours}>
            <div className={styles.timeRange}>
              <div className={styles.inputGroup}>
                <label htmlFor="quietStart" className={styles.inputLabel}>
                  Start Time
                </label>
                <input
                  id="quietStart"
                  type="time"
                  value={localSettings.quietHoursStart || '22:00'}
                  onChange={(e) => handleSettingChange('quietHoursStart', e.target.value)}
                  className={styles.timeInput}
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="quietEnd" className={styles.inputLabel}>
                  End Time
                </label>
                <input
                  id="quietEnd"
                  type="time"
                  value={localSettings.quietHoursEnd || '08:00'}
                  onChange={(e) => handleSettingChange('quietHoursEnd', e.target.value)}
                  className={styles.timeInput}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Notification Types */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Notification Types</h2>
        <p className={styles.sectionDescription}>
          Customize settings for each type of notification
        </p>

        <div className={styles.typeSettings}>
          {NOTIFICATION_TYPES.map((type) => {
            const typeSettings = localSettings.typeSettings[type.type];
            const IconComponent = type.icon;

            return (
              <div key={type.type} className={styles.typeSetting}>
                <div className={styles.typeHeader}>
                  <div className={styles.typeInfo}>
                    <IconComponent />
                    <div>
                      <h4 className={styles.typeName}>{type.label}</h4>
                      <p className={styles.typeDescription}>{type.description}</p>
                    </div>
                  </div>
                  <label className={styles.toggle}>
                    <input
                      type="checkbox"
                      checked={typeSettings?.enabled ?? true}
                      onChange={(e) => handleTypeSettingChange(type.type, 'enabled', e.target.checked)}
                      disabled={localSettings.muteAllNotifications}
                    />
                    <span className={styles.toggleSlider}></span>
                  </label>
                </div>

                {typeSettings?.enabled && (
                  <div className={styles.typeDetails}>
                    {/* Delivery Methods */}
                    <div className={styles.deliveryMethods}>
                      <label className={styles.detailLabel}>Delivery Methods:</label>
                      <div className={styles.methodButtons}>
                        {DELIVERY_METHOD_OPTIONS.map((method) => {
                          const MethodIcon = method.icon;
                          const isSelected = typeSettings?.deliveryMethods?.includes(method.value as any) ?? false;
                          
                          return (
                            <button
                              key={method.value}
                              className={`${styles.methodButton} ${isSelected ? styles.selected : ''}`}
                              onClick={() => {
                                const current = typeSettings?.deliveryMethods || [];
                                const updated = isSelected
                                  ? current.filter(m => m !== method.value)
                                  : [...current, method.value];
                                handleTypeSettingChange(type.type, 'deliveryMethods', updated);
                              }}
                              disabled={
                                (method.value === 'email' && !localSettings.enableEmailNotifications) ||
                                (method.value === 'push' && !localSettings.enablePushNotifications)
                              }
                            >
                              <MethodIcon size={14} />
                              {method.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Priority */}
                    <div className={styles.prioritySetting}>
                      <label className={styles.detailLabel}>Priority:</label>
                      <select
                        value={typeSettings?.priority || 'normal'}
                        onChange={(e) => handleTypeSettingChange(type.type, 'priority', e.target.value)}
                        className={styles.prioritySelect}
                      >
                        {PRIORITY_OPTIONS.map((priority) => (
                          <option key={priority.value} value={priority.value}>
                            {priority.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Actions */}
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
                disabled={isSaving}
              >
                Reset
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}