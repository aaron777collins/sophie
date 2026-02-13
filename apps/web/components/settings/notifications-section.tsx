'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/form';
import styles from './settings-section.module.css';

interface NotificationSettings {
  enableDesktopNotifications: boolean;
  enableSoundNotifications: boolean;
  enableMentionNotifications: boolean;
  enableDMNotifications: boolean;
  muteAllNotifications: boolean;
}

export default function NotificationsSection() {
  const [settings, setSettings] = useState<NotificationSettings>({
    enableDesktopNotifications: true,
    enableSoundNotifications: true,
    enableMentionNotifications: true,
    enableDMNotifications: true,
    muteAllNotifications: false,
  });
  
  const [hasChanges, setHasChanges] = useState(false);

  const handleSettingChange = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // TODO: Implement notification settings save
    setHasChanges(false);
    console.log('Notification settings saved:', settings);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Notifications</h1>
        <p className={styles.subtitle}>
          Control when and how you receive notifications
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Desktop Notifications</h2>
        <div className={styles.toggleGrid}>
          <div className={styles.toggleOption}>
            <div className={styles.toggleInfo}>
              <h3 className={styles.toggleName}>Enable Desktop Notifications</h3>
              <p className={styles.toggleDescription}>
                Show notifications on your desktop when HAOS is in the background
              </p>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={settings.enableDesktopNotifications}
                onChange={(e) => handleSettingChange('enableDesktopNotifications', e.target.checked)}
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
                checked={settings.enableSoundNotifications}
                onChange={(e) => handleSettingChange('enableSoundNotifications', e.target.checked)}
              />
              <span className={styles.toggleSlider}></span>
            </label>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Message Notifications</h2>
        <div className={styles.toggleGrid}>
          <div className={styles.toggleOption}>
            <div className={styles.toggleInfo}>
              <h3 className={styles.toggleName}>Mentions</h3>
              <p className={styles.toggleDescription}>
                Get notified when someone mentions you in a message
              </p>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={settings.enableMentionNotifications}
                onChange={(e) => handleSettingChange('enableMentionNotifications', e.target.checked)}
              />
              <span className={styles.toggleSlider}></span>
            </label>
          </div>

          <div className={styles.toggleOption}>
            <div className={styles.toggleInfo}>
              <h3 className={styles.toggleName}>Direct Messages</h3>
              <p className={styles.toggleDescription}>
                Get notified for all direct messages
              </p>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={settings.enableDMNotifications}
                onChange={(e) => handleSettingChange('enableDMNotifications', e.target.checked)}
              />
              <span className={styles.toggleSlider}></span>
            </label>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Do Not Disturb</h2>
        <div className={styles.toggleGrid}>
          <div className={styles.toggleOption}>
            <div className={styles.toggleInfo}>
              <h3 className={styles.toggleName}>Mute All Notifications</h3>
              <p className={styles.toggleDescription}>
                Temporarily disable all notifications
              </p>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={settings.muteAllNotifications}
                onChange={(e) => handleSettingChange('muteAllNotifications', e.target.checked)}
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
                onClick={() => setHasChanges(false)}
              >
                Reset
              </Button>
              <Button onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}