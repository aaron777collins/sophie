'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/form';
import styles from './settings-section.module.css';

interface PrivacySettings {
  allowDirectMessages: 'everyone' | 'friends' | 'nobody';
  showOnlineStatus: boolean;
  allowFriendRequests: boolean;
  shareTypingIndicators: boolean;
  allowReadReceipts: boolean;
  dataCollection: boolean;
  analyticsOptOut: boolean;
}

export default function PrivacySection() {
  const [settings, setSettings] = useState<PrivacySettings>({
    allowDirectMessages: 'friends',
    showOnlineStatus: true,
    allowFriendRequests: true,
    shareTypingIndicators: true,
    allowReadReceipts: true,
    dataCollection: false,
    analyticsOptOut: true,
  });
  
  const [hasChanges, setHasChanges] = useState(false);

  const handleSettingChange = <K extends keyof PrivacySettings>(
    key: K,
    value: PrivacySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // TODO: Implement privacy settings save
    setHasChanges(false);
    console.log('Privacy settings saved:', settings);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Privacy & Safety</h1>
        <p className={styles.subtitle}>
          Control your privacy and who can interact with you
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Direct Messages</h2>
        <div className={styles.radioGroup}>
          <label className={styles.radioOption}>
            <input
              type="radio"
              name="allowDirectMessages"
              checked={settings.allowDirectMessages === 'everyone'}
              onChange={() => handleSettingChange('allowDirectMessages', 'everyone')}
            />
            <div className={styles.radioInfo}>
              <h3 className={styles.radioName}>Everyone</h3>
              <p className={styles.radioDescription}>Allow direct messages from everyone</p>
            </div>
          </label>
          
          <label className={styles.radioOption}>
            <input
              type="radio"
              name="allowDirectMessages"
              checked={settings.allowDirectMessages === 'friends'}
              onChange={() => handleSettingChange('allowDirectMessages', 'friends')}
            />
            <div className={styles.radioInfo}>
              <h3 className={styles.radioName}>Friends Only</h3>
              <p className={styles.radioDescription}>Only allow direct messages from friends</p>
            </div>
          </label>
          
          <label className={styles.radioOption}>
            <input
              type="radio"
              name="allowDirectMessages"
              checked={settings.allowDirectMessages === 'nobody'}
              onChange={() => handleSettingChange('allowDirectMessages', 'nobody')}
            />
            <div className={styles.radioInfo}>
              <h3 className={styles.radioName}>Nobody</h3>
              <p className={styles.radioDescription}>Block all direct messages</p>
            </div>
          </label>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Online Status</h2>
        <div className={styles.toggleGrid}>
          <div className={styles.toggleOption}>
            <div className={styles.toggleInfo}>
              <h3 className={styles.toggleName}>Show Online Status</h3>
              <p className={styles.toggleDescription}>
                Let others see when you're online and active
              </p>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={settings.showOnlineStatus}
                onChange={(e) => handleSettingChange('showOnlineStatus', e.target.checked)}
              />
              <span className={styles.toggleSlider}></span>
            </label>
          </div>

          <div className={styles.toggleOption}>
            <div className={styles.toggleInfo}>
              <h3 className={styles.toggleName}>Typing Indicators</h3>
              <p className={styles.toggleDescription}>
                Show when you're typing in conversations
              </p>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={settings.shareTypingIndicators}
                onChange={(e) => handleSettingChange('shareTypingIndicators', e.target.checked)}
              />
              <span className={styles.toggleSlider}></span>
            </label>
          </div>

          <div className={styles.toggleOption}>
            <div className={styles.toggleInfo}>
              <h3 className={styles.toggleName}>Read Receipts</h3>
              <p className={styles.toggleDescription}>
                Show when you've read messages
              </p>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={settings.allowReadReceipts}
                onChange={(e) => handleSettingChange('allowReadReceipts', e.target.checked)}
              />
              <span className={styles.toggleSlider}></span>
            </label>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Social Features</h2>
        <div className={styles.toggleGrid}>
          <div className={styles.toggleOption}>
            <div className={styles.toggleInfo}>
              <h3 className={styles.toggleName}>Friend Requests</h3>
              <p className={styles.toggleDescription}>
                Allow others to send you friend requests
              </p>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={settings.allowFriendRequests}
                onChange={(e) => handleSettingChange('allowFriendRequests', e.target.checked)}
              />
              <span className={styles.toggleSlider}></span>
            </label>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Data & Analytics</h2>
        <div className={styles.toggleGrid}>
          <div className={styles.toggleOption}>
            <div className={styles.toggleInfo}>
              <h3 className={styles.toggleName}>Data Collection</h3>
              <p className={styles.toggleDescription}>
                Allow HAOS to collect usage data to improve the service
              </p>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={settings.dataCollection}
                onChange={(e) => handleSettingChange('dataCollection', e.target.checked)}
              />
              <span className={styles.toggleSlider}></span>
            </label>
          </div>

          <div className={styles.toggleOption}>
            <div className={styles.toggleInfo}>
              <h3 className={styles.toggleName}>Analytics Opt-Out</h3>
              <p className={styles.toggleDescription}>
                Opt out of anonymous analytics tracking
              </p>
            </div>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={settings.analyticsOptOut}
                onChange={(e) => handleSettingChange('analyticsOptOut', e.target.checked)}
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