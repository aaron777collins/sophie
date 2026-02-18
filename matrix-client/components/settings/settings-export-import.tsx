'use client';

import React, { useState } from 'react';
import { useSettings } from '../../hooks/use-settings';

export function SettingsExportImport() {
  const { settings, exportSettings, importSettings, resetSettings } = useSettings();
  const [importData, setImportData] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  const showMessage = (type: 'success' | 'error' | 'info', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleExport = () => {
    try {
      const exportedData = exportSettings();
      
      // Create and trigger download
      const blob = new Blob([exportedData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `matrix-chat-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showMessage('success', 'Settings exported successfully! Check your downloads folder.');
    } catch (error) {
      console.error('Export failed:', error);
      showMessage('error', 'Failed to export settings. Please try again.');
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      const exportedData = exportSettings();
      await navigator.clipboard.writeText(exportedData);
      showMessage('success', 'Settings copied to clipboard!');
    } catch (error) {
      console.error('Copy to clipboard failed:', error);
      showMessage('error', 'Failed to copy to clipboard. Please manually copy the exported data.');
    }
  };

  const handleImport = async () => {
    if (!importData.trim()) {
      showMessage('error', 'Please paste your settings data before importing.');
      return;
    }

    setIsImporting(true);
    try {
      await importSettings(importData);
      setImportData('');
      showMessage('success', 'Settings imported successfully!');
    } catch (error) {
      console.error('Import failed:', error);
      showMessage('error', `Import failed: ${error instanceof Error ? error.message : 'Invalid settings data'}`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      showMessage('error', 'Please select a JSON file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setImportData(content);
      showMessage('info', 'File loaded. Click "Import Settings" to apply the changes.');
    };
    reader.onerror = () => {
      showMessage('error', 'Failed to read the file.');
    };
    reader.readAsText(file);

    // Reset file input
    event.target.value = '';
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await resetSettings();
      setShowConfirmReset(false);
      showMessage('success', 'All settings have been reset to defaults.');
    } catch (error) {
      console.error('Reset failed:', error);
      showMessage('error', 'Failed to reset settings. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  const getSettingsSummary = () => {
    const summary = {
      notifications: {
        enabled: settings.notifications.enablePushNotifications,
        keywords: settings.notifications.notificationKeywords.length,
        quietHours: settings.notifications.quietHours.enabled,
      },
      theme: {
        mode: settings.theme.mode,
        accentColor: settings.theme.accentColor,
        fontSize: settings.theme.fontSize,
        customCSS: !!settings.theme.customCSS,
      },
      privacy: {
        level: [
          !settings.privacy.showOnlineStatus,
          !settings.privacy.showLastSeen,
          !settings.privacy.enableAnalytics,
          settings.privacy.enableCrossSigning,
        ].filter(Boolean).length,
        totalSettings: 4,
      },
      advanced: {
        homeserver: settings.advanced.homeserver,
        e2ee: settings.advanced.enableE2EE,
        devMode: settings.advanced.enableDevMode,
      },
      accessibility: {
        screenReader: settings.accessibility.enableScreenReader,
        shortcuts: settings.accessibility.enableKeyboardShortcuts,
        highContrast: settings.accessibility.highContrast,
      },
    };

    return summary;
  };

  const summary = getSettingsSummary();

  return (
    <div className="settings-export-import">
      <header className="panel-header">
        <h2>Backup & Export Settings</h2>
        <p>Export your settings for backup, import from another device, or restore to default values.</p>
      </header>

      {message && (
        <div className={`message-banner ${message.type}`}>
          <span className="message-icon">
            {message.type === 'success' ? '✅' : message.type === 'error' ? '❌' : 'ℹ️'}
          </span>
          <span className="message-text">{message.text}</span>
        </div>
      )}

      <div className="settings-sections">
        {/* Current Settings Overview */}
        <section className="settings-section">
          <h3>📊 Current Settings Overview</h3>
          <p className="section-description">
            Summary of your current configuration before exporting or making changes.
          </p>

          <div className="settings-summary">
            <div className="summary-grid">
              <div className="summary-item">
                <div className="summary-icon">🔔</div>
                <div className="summary-content">
                  <h4>Notifications</h4>
                  <ul>
                    <li>Push notifications: {summary.notifications.enabled ? 'Enabled' : 'Disabled'}</li>
                    <li>Keywords: {summary.notifications.keywords} configured</li>
                    <li>Quiet hours: {summary.notifications.quietHours ? 'Enabled' : 'Disabled'}</li>
                  </ul>
                </div>
              </div>

              <div className="summary-item">
                <div className="summary-icon">🎨</div>
                <div className="summary-content">
                  <h4>Theme</h4>
                  <ul>
                    <li>Mode: {summary.theme.mode}</li>
                    <li>Accent color: {summary.theme.accentColor}</li>
                    <li>Font size: {summary.theme.fontSize}</li>
                    <li>Custom CSS: {summary.theme.customCSS ? 'Yes' : 'No'}</li>
                  </ul>
                </div>
              </div>

              <div className="summary-item">
                <div className="summary-icon">🔒</div>
                <div className="summary-content">
                  <h4>Privacy</h4>
                  <ul>
                    <li>Privacy level: {summary.privacy.level}/{summary.privacy.totalSettings}</li>
                    <li>Cross-signing: {summary.advanced.e2ee ? 'Enabled' : 'Disabled'}</li>
                  </ul>
                </div>
              </div>

              <div className="summary-item">
                <div className="summary-icon">⚙️</div>
                <div className="summary-content">
                  <h4>Advanced</h4>
                  <ul>
                    <li>Homeserver: {new URL(summary.advanced.homeserver).hostname}</li>
                    <li>E2EE: {summary.advanced.e2ee ? 'Enabled' : 'Disabled'}</li>
                    <li>Dev mode: {summary.advanced.devMode ? 'Enabled' : 'Disabled'}</li>
                  </ul>
                </div>
              </div>

              <div className="summary-item">
                <div className="summary-icon">♿</div>
                <div className="summary-content">
                  <h4>Accessibility</h4>
                  <ul>
                    <li>Screen reader: {summary.accessibility.screenReader ? 'Enabled' : 'Disabled'}</li>
                    <li>Keyboard shortcuts: {summary.accessibility.shortcuts ? 'Enabled' : 'Disabled'}</li>
                    <li>High contrast: {summary.accessibility.highContrast ? 'Enabled' : 'Disabled'}</li>
                  </ul>
                </div>
              </div>

              <div className="summary-item">
                <div className="summary-icon">📅</div>
                <div className="summary-content">
                  <h4>Last Updated</h4>
                  <ul>
                    <li>Date: {new Date(settings.lastUpdated).toLocaleDateString()}</li>
                    <li>Time: {new Date(settings.lastUpdated).toLocaleTimeString()}</li>
                    <li>Version: {settings.version}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Export Settings */}
        <section className="settings-section">
          <h3>📤 Export Settings</h3>
          <p className="section-description">
            Save your current settings to a file or copy to clipboard for backup or sharing with another device.
          </p>

          <div className="export-actions">
            <button onClick={handleExport} className="export-btn primary" type="button">
              📥 Download Settings File
            </button>
            <button onClick={handleCopyToClipboard} className="export-btn secondary" type="button">
              📋 Copy to Clipboard
            </button>
          </div>

          <div className="export-info">
            <h4>💡 Export Information</h4>
            <ul>
              <li>Exported file includes all your personal settings and preferences</li>
              <li>No personal messages or account credentials are included</li>
              <li>File is in JSON format and can be imported on any device</li>
              <li>Settings are timestamped for version tracking</li>
            </ul>
          </div>
        </section>

        {/* Import Settings */}
        <section className="settings-section">
          <h3>📥 Import Settings</h3>
          <p className="section-description">
            Restore settings from a backup file or data from another device. This will replace your current settings.
          </p>

          <div className="import-methods">
            <div className="import-method">
              <h4>Import from File</h4>
              <label className="file-upload-btn" htmlFor="settings-file">
                📁 Choose Settings File
                <input
                  id="settings-file"
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileImport}
                  className="file-input"
                />
              </label>
            </div>

            <div className="import-divider">
              <span>OR</span>
            </div>

            <div className="import-method">
              <h4>Import from Text</h4>
              <textarea
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                placeholder="Paste your settings JSON data here..."
                className="import-textarea"
                rows={8}
              />
            </div>
          </div>

          {importData && (
            <div className="import-preview">
              <h4>📋 Import Preview</h4>
              <div className="preview-content">
                {(() => {
                  try {
                    const data = JSON.parse(importData);
                    return (
                      <div className="preview-valid">
                        <p>✅ Valid settings data detected:</p>
                        <ul>
                          <li>Version: {data.version || 'Unknown'}</li>
                          <li>Last updated: {data.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : 'Unknown'}</li>
                          <li>Contains: {Object.keys(data).filter(k => !['version', 'lastUpdated'].includes(k)).join(', ')}</li>
                        </ul>
                      </div>
                    );
                  } catch {
                    return (
                      <div className="preview-invalid">
                        <p>❌ Invalid JSON data. Please check your input.</p>
                      </div>
                    );
                  }
                })()}
              </div>
            </div>
          )}

          <div className="import-actions">
            <button
              onClick={handleImport}
              disabled={!importData || isImporting}
              className="import-btn"
              type="button"
            >
              {isImporting ? '⏳ Importing...' : '📥 Import Settings'}
            </button>
            {importData && (
              <button
                onClick={() => setImportData('')}
                className="clear-btn"
                type="button"
              >
                🗑️ Clear
              </button>
            )}
          </div>

          <div className="import-warning">
            <div className="warning-icon">⚠️</div>
            <div className="warning-content">
              <strong>Warning:</strong> Importing settings will replace all your current preferences. 
              Make sure to export your current settings first if you want to keep them.
            </div>
          </div>
        </section>

        {/* Reset Settings */}
        <section className="settings-section reset-section">
          <h3>🔄 Reset to Defaults</h3>
          <p className="section-description">
            Restore all settings to their default values. This action cannot be undone.
          </p>

          {!showConfirmReset ? (
            <div className="reset-actions">
              <button
                onClick={() => setShowConfirmReset(true)}
                className="reset-btn danger"
                type="button"
              >
                🔄 Reset All Settings
              </button>
            </div>
          ) : (
            <div className="reset-confirmation">
              <div className="confirmation-content">
                <h4>⚠️ Confirm Reset</h4>
                <p>
                  Are you sure you want to reset all settings to their default values? 
                  This will permanently remove all your customizations including:
                </p>
                <ul>
                  <li>Notification preferences and keywords</li>
                  <li>Theme customizations and custom CSS</li>
                  <li>Privacy and security settings</li>
                  <li>Advanced Matrix configurations</li>
                  <li>Accessibility preferences</li>
                  <li>Custom keyboard shortcuts</li>
                </ul>
                <p><strong>This action cannot be undone.</strong></p>
              </div>
              
              <div className="confirmation-actions">
                <button
                  onClick={() => setShowConfirmReset(false)}
                  className="cancel-reset-btn"
                  disabled={isResetting}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReset}
                  disabled={isResetting}
                  className="confirm-reset-btn"
                  type="button"
                >
                  {isResetting ? '⏳ Resetting...' : '🔄 Yes, Reset Everything'}
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      <style jsx>{`
        .settings-export-import {
          max-width: 800px;
        }

        .panel-header {
          margin-bottom: 32px;
        }

        .panel-header h2 {
          margin: 0 0 8px 0;
          font-size: 24px;
          font-weight: 600;
          color: var(--text-primary, #2c3e50);
        }

        .panel-header p {
          margin: 0;
          color: var(--text-secondary, #6c757d);
          font-size: 16px;
          line-height: 1.5;
        }

        .message-banner {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 24px;
          font-size: 14px;
          font-weight: 500;
        }

        .message-banner.success {
          background: rgba(40, 167, 69, 0.1);
          border: 1px solid rgba(40, 167, 69, 0.3);
          color: #155724;
        }

        .message-banner.error {
          background: rgba(220, 53, 69, 0.1);
          border: 1px solid rgba(220, 53, 69, 0.3);
          color: #721c24;
        }

        .message-banner.info {
          background: rgba(0, 123, 255, 0.1);
          border: 1px solid rgba(0, 123, 255, 0.3);
          color: #004085;
        }

        .message-icon {
          font-size: 16px;
          flex-shrink: 0;
        }

        .settings-sections {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .settings-section {
          background: var(--background-secondary, #f8f9fa);
          border: 1px solid var(--border-color, #e9ecef);
          border-radius: 8px;
          padding: 24px;
        }

        .reset-section {
          background: rgba(220, 53, 69, 0.05);
          border-color: rgba(220, 53, 69, 0.2);
        }

        .settings-section h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary, #2c3e50);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .settings-section h4 {
          margin: 0 0 12px 0;
          font-size: 15px;
          font-weight: 500;
          color: var(--text-primary, #2c3e50);
        }

        .section-description {
          margin: 0 0 20px 0;
          color: var(--text-secondary, #6c757d);
          font-size: 14px;
          line-height: 1.5;
        }

        .settings-summary {
          background: var(--background-primary, #ffffff);
          border: 1px solid var(--border-color, #e9ecef);
          border-radius: 6px;
          padding: 20px;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .summary-item {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .summary-icon {
          font-size: 20px;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .summary-content h4 {
          margin: 0 0 8px 0;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary, #2c3e50);
        }

        .summary-content ul {
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .summary-content li {
          font-size: 12px;
          color: var(--text-secondary, #6c757d);
          margin-bottom: 4px;
          padding-left: 12px;
          position: relative;
        }

        .summary-content li::before {
          content: '•';
          position: absolute;
          left: 0;
          color: var(--accent-color, #007bff);
        }

        .export-actions {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
        }

        .export-btn {
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .export-btn.primary {
          background: var(--accent-color, #007bff);
          color: white;
        }

        .export-btn.primary:hover {
          background: #0056b3;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
        }

        .export-btn.secondary {
          background: var(--background-tertiary, #dee2e6);
          color: var(--text-primary, #2c3e50);
          border: 1px solid var(--border-color, #ced4da);
        }

        .export-btn.secondary:hover {
          background: #c6c8ca;
          transform: translateY(-1px);
        }

        .export-info {
          background: var(--background-primary, #ffffff);
          border: 1px solid var(--border-color, #e9ecef);
          border-radius: 6px;
          padding: 16px;
        }

        .export-info ul {
          margin: 8px 0 0 0;
          padding-left: 16px;
        }

        .export-info li {
          font-size: 13px;
          color: var(--text-secondary, #6c757d);
          margin-bottom: 6px;
          line-height: 1.4;
        }

        .import-methods {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 20px;
        }

        .import-method {
          background: var(--background-primary, #ffffff);
          border: 1px solid var(--border-color, #e9ecef);
          border-radius: 6px;
          padding: 16px;
        }

        .import-divider {
          text-align: center;
          color: var(--text-secondary, #6c757d);
          font-weight: 500;
          position: relative;
        }

        .import-divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: var(--border-color, #e9ecef);
          z-index: 1;
        }

        .import-divider span {
          background: var(--background-secondary, #f8f9fa);
          padding: 0 16px;
          position: relative;
          z-index: 2;
        }

        .file-upload-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: var(--accent-color, #007bff);
          color: white;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .file-upload-btn:hover {
          background: #0056b3;
          transform: translateY(-1px);
        }

        .file-input {
          display: none;
        }

        .import-textarea {
          width: 100%;
          min-height: 150px;
          padding: 12px;
          border: 1px solid var(--border-color, #ced4da);
          border-radius: 4px;
          font-family: monospace;
          font-size: 12px;
          line-height: 1.4;
          resize: vertical;
        }

        .import-textarea:focus {
          outline: none;
          border-color: var(--accent-color, #007bff);
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
        }

        .import-preview {
          margin-bottom: 20px;
          padding: 16px;
          background: var(--background-primary, #ffffff);
          border: 1px solid var(--border-color, #e9ecef);
          border-radius: 6px;
        }

        .preview-valid {
          color: #155724;
        }

        .preview-invalid {
          color: #721c24;
        }

        .preview-content ul {
          margin: 8px 0 0 16px;
          padding: 0;
        }

        .preview-content li {
          font-size: 13px;
          margin-bottom: 4px;
        }

        .import-actions {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }

        .import-btn {
          padding: 12px 24px;
          background: var(--accent-color, #007bff);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .import-btn:disabled {
          background: var(--background-tertiary, #dee2e6);
          color: var(--text-secondary, #6c757d);
          cursor: not-allowed;
        }

        .import-btn:hover:not(:disabled) {
          background: #0056b3;
          transform: translateY(-1px);
        }

        .clear-btn {
          padding: 12px 20px;
          background: var(--background-tertiary, #dee2e6);
          color: var(--text-primary, #2c3e50);
          border: none;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .clear-btn:hover {
          background: #c6c8ca;
        }

        .import-warning {
          display: flex;
          gap: 12px;
          padding: 12px 16px;
          background: rgba(255, 193, 7, 0.1);
          border: 1px solid rgba(255, 193, 7, 0.3);
          border-radius: 6px;
          font-size: 13px;
        }

        .warning-icon {
          font-size: 16px;
          flex-shrink: 0;
        }

        .warning-content {
          line-height: 1.4;
          color: var(--text-primary, #2c3e50);
        }

        .reset-actions {
          display: flex;
          justify-content: center;
        }

        .reset-btn {
          padding: 12px 24px;
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .reset-btn:hover {
          background: #c82333;
          transform: translateY(-1px);
        }

        .reset-confirmation {
          background: var(--background-primary, #ffffff);
          border: 2px solid #dc3545;
          border-radius: 8px;
          padding: 24px;
        }

        .confirmation-content h4 {
          color: #dc3545;
          margin-bottom: 16px;
        }

        .confirmation-content p {
          margin-bottom: 12px;
          font-size: 14px;
          line-height: 1.5;
          color: var(--text-primary, #2c3e50);
        }

        .confirmation-content ul {
          margin: 12px 0 16px 20px;
          color: var(--text-secondary, #6c757d);
        }

        .confirmation-content li {
          font-size: 13px;
          margin-bottom: 6px;
          line-height: 1.4;
        }

        .confirmation-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 20px;
        }

        .cancel-reset-btn {
          padding: 10px 20px;
          background: var(--background-tertiary, #dee2e6);
          color: var(--text-primary, #2c3e50);
          border: none;
          border-radius: 4px;
          font-size: 14px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .cancel-reset-btn:hover:not(:disabled) {
          background: #c6c8ca;
        }

        .cancel-reset-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .confirm-reset-btn {
          padding: 10px 20px;
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .confirm-reset-btn:hover:not(:disabled) {
          background: #c82333;
        }

        .confirm-reset-btn:disabled {
          background: #6c757d;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .settings-export-import {
            max-width: none;
          }

          .settings-section {
            padding: 20px 16px;
          }

          .summary-grid {
            grid-template-columns: 1fr;
          }

          .export-actions {
            flex-direction: column;
          }

          .import-actions {
            flex-direction: column;
          }

          .confirmation-actions {
            flex-direction: column-reverse;
          }

          .import-warning {
            flex-direction: column;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
}