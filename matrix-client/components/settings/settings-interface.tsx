'use client';

import React, { useState } from 'react';
import { useSettings } from '../../hooks/use-settings';
import { NotificationSettingsPanel } from './notification-settings-panel';
import { ThemeSettingsPanel } from './theme-settings-panel';
import { PrivacySettingsPanel } from './privacy-settings-panel';
import { AdvancedSettingsPanel } from './advanced-settings-panel';
import { AccessibilitySettingsPanel } from './accessibility-settings-panel';
import { SettingsExportImport } from './settings-export-import';

type SettingsTab = 'notifications' | 'theme' | 'privacy' | 'advanced' | 'accessibility' | 'export';

interface SettingsTabInfo {
  id: SettingsTab;
  label: string;
  icon: string;
  description: string;
}

const SETTINGS_TABS: SettingsTabInfo[] = [
  {
    id: 'notifications',
    label: 'Notifications',
    icon: '🔔',
    description: 'Configure notification preferences and alert settings',
  },
  {
    id: 'theme',
    label: 'Appearance',
    icon: '🎨',
    description: 'Customize chat appearance, themes, and visual settings',
  },
  {
    id: 'privacy',
    label: 'Privacy & Security',
    icon: '🔒',
    description: 'Manage privacy settings and security preferences',
  },
  {
    id: 'advanced',
    label: 'Advanced',
    icon: '⚙️',
    description: 'Matrix client configuration and advanced features',
  },
  {
    id: 'accessibility',
    label: 'Accessibility',
    icon: '♿',
    description: 'Screen reader, keyboard navigation, and accessibility options',
  },
  {
    id: 'export',
    label: 'Backup & Export',
    icon: '💾',
    description: 'Import, export, and backup your settings',
  },
];

export function SettingsInterface() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('notifications');
  const { isLoading, hasUnsavedChanges, saveChanges } = useSettings();

  const handleSaveChanges = async () => {
    try {
      await saveChanges();
      // You could show a success toast here
    } catch (error) {
      console.error('Failed to save settings:', error);
      // You could show an error toast here
    }
  };

  const renderActivePanel = () => {
    switch (activeTab) {
      case 'notifications':
        return <NotificationSettingsPanel />;
      case 'theme':
        return <ThemeSettingsPanel />;
      case 'privacy':
        return <PrivacySettingsPanel />;
      case 'advanced':
        return <AdvancedSettingsPanel />;
      case 'accessibility':
        return <AccessibilitySettingsPanel />;
      case 'export':
        return <SettingsExportImport />;
      default:
        return <NotificationSettingsPanel />;
    }
  };

  if (isLoading) {
    return (
      <div className="settings-loading">
        <div className="loading-spinner"></div>
        <p>Loading settings...</p>
        
        <style jsx>{`
          .settings-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
            gap: 16px;
            color: var(--text-secondary, #6c757d);
          }

          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid var(--background-secondary, #e9ecef);
            border-top: 3px solid var(--accent-color, #007bff);
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="settings-interface">
      <div className="settings-header">
        <h1>Chat Settings</h1>
        <p>Customize your chat experience with comprehensive notification, theme, and privacy options</p>
        
        {hasUnsavedChanges && (
          <div className="unsaved-changes-banner">
            <span>You have unsaved changes</span>
            <button onClick={handleSaveChanges} className="save-changes-btn">
              Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="settings-layout">
        <nav className="settings-sidebar">
          <ul className="settings-nav">
            {SETTINGS_TABS.map((tab) => (
              <li key={tab.id}>
                <button
                  className={`settings-nav-btn ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                  type="button"
                >
                  <span className="nav-icon">{tab.icon}</span>
                  <div className="nav-content">
                    <span className="nav-label">{tab.label}</span>
                    <span className="nav-description">{tab.description}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <main className="settings-content">
          {renderActivePanel()}
        </main>
      </div>

      <style jsx>{`
        .settings-interface {
          max-width: 1200px;
          margin: 0 auto;
          background: var(--background-primary, #ffffff);
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .settings-header {
          padding: 32px;
          background: linear-gradient(135deg, var(--accent-color, #007bff) 0%, #0056b3 100%);
          color: white;
          position: relative;
        }

        .settings-header h1 {
          margin: 0 0 8px 0;
          font-size: 28px;
          font-weight: 600;
          letter-spacing: -0.5px;
        }

        .settings-header p {
          margin: 0;
          opacity: 0.9;
          font-size: 16px;
          line-height: 1.5;
        }

        .unsaved-changes-banner {
          position: absolute;
          top: 16px;
          right: 32px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 6px;
          font-size: 14px;
          backdrop-filter: blur(10px);
        }

        .save-changes-btn {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.4);
          color: white;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .save-changes-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
        }

        .settings-layout {
          display: grid;
          grid-template-columns: 320px 1fr;
          min-height: 600px;
        }

        .settings-sidebar {
          background: var(--background-secondary, #f8f9fa);
          border-right: 1px solid var(--border-color, #e9ecef);
          padding: 24px 0;
        }

        .settings-nav {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .settings-nav-btn {
          width: 100%;
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 16px 24px;
          border: none;
          background: none;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s;
          border-left: 3px solid transparent;
        }

        .settings-nav-btn:hover {
          background: var(--background-hover, rgba(0, 123, 255, 0.05));
        }

        .settings-nav-btn.active {
          background: var(--background-hover, rgba(0, 123, 255, 0.1));
          border-left-color: var(--accent-color, #007bff);
        }

        .nav-icon {
          font-size: 20px;
          line-height: 1;
          margin-top: 2px;
          flex-shrink: 0;
        }

        .nav-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .nav-label {
          font-weight: 500;
          font-size: 15px;
          color: var(--text-primary, #2c3e50);
        }

        .nav-description {
          font-size: 13px;
          color: var(--text-secondary, #6c757d);
          line-height: 1.4;
        }

        .settings-content {
          padding: 32px;
          overflow-y: auto;
          max-height: calc(100vh - 200px);
        }

        @media (max-width: 1024px) {
          .settings-layout {
            grid-template-columns: 1fr;
          }

          .settings-sidebar {
            border-right: none;
            border-bottom: 1px solid var(--border-color, #e9ecef);
            padding: 16px 0;
          }

          .settings-nav {
            display: flex;
            overflow-x: auto;
            padding-bottom: 8px;
          }

          .settings-nav-btn {
            flex-shrink: 0;
            min-width: 200px;
            border-left: none;
            border-bottom: 3px solid transparent;
          }

          .settings-nav-btn.active {
            border-left: none;
            border-bottom-color: var(--accent-color, #007bff);
          }

          .settings-content {
            padding: 24px;
            max-height: none;
          }
        }

        @media (max-width: 768px) {
          .settings-interface {
            border-radius: 0;
            box-shadow: none;
          }

          .settings-header {
            padding: 20px;
          }

          .settings-header h1 {
            font-size: 24px;
          }

          .settings-header p {
            font-size: 14px;
          }

          .unsaved-changes-banner {
            position: static;
            margin-top: 16px;
            right: auto;
            top: auto;
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .settings-nav-btn {
            min-width: 160px;
            padding: 12px 16px;
          }

          .nav-label {
            font-size: 14px;
          }

          .nav-description {
            font-size: 12px;
          }

          .settings-content {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
}