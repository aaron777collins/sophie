'use client';

import React, { useState } from 'react';
import SettingsSidebar from './settings-sidebar';
import ProfileSection from './profile-section';
import AppearanceSection from './appearance-section';
import NotificationsSection from './notifications-section';
import PrivacySection from './privacy-section';
import AccountSection from './account-section';
import styles from './user-settings.module.css';

export type SettingsSection = 
  | 'profile' 
  | 'appearance' 
  | 'notifications' 
  | 'privacy' 
  | 'account';

export default function UserSettings() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');

  const renderSection = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileSection />;
      case 'appearance':
        return <AppearanceSection />;
      case 'notifications':
        return <NotificationsSection />;
      case 'privacy':
        return <PrivacySection />;
      case 'account':
        return <AccountSection />;
      default:
        return <ProfileSection />;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <SettingsSidebar 
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
      </div>
      
      <div className={styles.content}>
        <div className={styles.contentInner}>
          {renderSection()}
        </div>
      </div>
      
      <div className={styles.closeButton}>
        <button 
          className={styles.closeIcon}
          onClick={() => window.history.back()}
          aria-label="Close Settings"
        >
          ✕
        </button>
      </div>
    </div>
  );
}