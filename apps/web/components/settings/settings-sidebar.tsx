'use client';

import React from 'react';
import { SettingsSection } from './user-settings';
import styles from './settings-sidebar.module.css';

interface SettingsSidebarProps {
  activeSection: SettingsSection;
  onSectionChange: (section: SettingsSection) => void;
}

interface SettingsMenuItem {
  id: SettingsSection;
  label: string;
  icon: string;
}

const settingsMenuItems: SettingsMenuItem[] = [
  { id: 'profile', label: 'My Account', icon: '👤' },
  { id: 'appearance', label: 'Appearance', icon: '🎨' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
  { id: 'privacy', label: 'Privacy & Safety', icon: '🔒' },
  { id: 'account', label: 'Account Settings', icon: '⚙️' },
];

export default function SettingsSidebar({ activeSection, onSectionChange }: SettingsSidebarProps) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>User Settings</h2>
      </div>
      
      <div className={styles.separator}></div>
      
      <nav className={styles.nav}>
        {settingsMenuItems.map((item) => (
          <button
            key={item.id}
            className={`${styles.navItem} ${
              activeSection === item.id ? styles.active : ''
            }`}
            onClick={() => onSectionChange(item.id)}
          >
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.label}>{item.label}</span>
          </button>
        ))}
      </nav>
      
      <div className={styles.footer}>
        <div className={styles.separator}></div>
        <div className={styles.versionInfo}>
          HAOS v2.0.0-beta
        </div>
      </div>
    </div>
  );
}