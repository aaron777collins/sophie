'use client';

import React, { useState } from 'react';
import { useSettings } from '../../hooks/use-settings';
import { AdvancedMatrixSettings } from '../../types/settings';

export function AdvancedSettingsPanel() {
  const { settings, updateSettings } = useSettings();
  const { advanced } = settings;
  const [customHomeserver, setCustomHomeserver] = useState('');
  const [customIdentityServer, setCustomIdentityServer] = useState('');
  const [validationErrors, setValidationErrors] = useState<{
    homeserver?: string;
    identityServer?: string;
  }>({});

  const handleAdvancedUpdate = async (updates: Partial<AdvancedMatrixSettings>) => {
    await updateSettings({
      advanced: {
        ...advanced,
        ...updates,
      },
    });
  };

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return url.startsWith('https://');
    } catch {
      return false;
    }
  };

  const handleHomeserverUpdate = () => {
    if (!customHomeserver) return;
    
    if (validateUrl(customHomeserver)) {
      handleAdvancedUpdate({ homeserver: customHomeserver });
      setCustomHomeserver('');
      setValidationErrors(prev => ({ ...prev, homeserver: undefined }));
    } else {
      setValidationErrors(prev => ({ 
        ...prev, 
        homeserver: 'Please enter a valid HTTPS URL (e.g., https://matrix.org)' 
      }));
    }
  };

  const handleIdentityServerUpdate = () => {
    if (!customIdentityServer) return;
    
    if (validateUrl(customIdentityServer)) {
      handleAdvancedUpdate({ identityServer: customIdentityServer });
      setCustomIdentityServer('');
      setValidationErrors(prev => ({ ...prev, identityServer: undefined }));
    } else {
      setValidationErrors(prev => ({ 
        ...prev, 
        identityServer: 'Please enter a valid HTTPS URL (e.g., https://vector.im)' 
      }));
    }
  };

  return (
    <div className="advanced-settings">
      <header className="panel-header">
        <h2>Advanced Matrix Settings</h2>
        <p>Configure advanced Matrix client options, server connections, and developer features.</p>
        
        <div className="warning-banner">
          <div className="warning-icon">⚠️</div>
          <div className="warning-text">
            <strong>Advanced Settings:</strong> These settings affect core Matrix functionality. 
            Only change them if you understand the implications.
          </div>
        </div>
      </header>

      <div className="settings-sections">
        {/* Connection Settings */}
        <section className="settings-section">
          <h3>🔗 Connection Settings</h3>
          <p className="section-description">
            Configure your Matrix homeserver and identity server connections.
          </p>

          <div className="setting-group">
            <div className="server-setting">
              <div className="setting-info">
                <span className="setting-title">Homeserver</span>
                <span className="setting-description">
                  The Matrix homeserver you&apos;re connected to
                </span>
              </div>
              <div className="server-input-group">
                <div className="current-server">
                  <span className="server-label">Current:</span>
                  <code className="server-url">{advanced.homeserver}</code>
                </div>
                <div className="server-change">
                  <input
                    type="url"
                    placeholder="https://matrix.org"
                    value={customHomeserver}
                    onChange={(e) => {
                      setCustomHomeserver(e.target.value);
                      if (validationErrors.homeserver) {
                        setValidationErrors(prev => ({ ...prev, homeserver: undefined }));
                      }
                    }}
                    className={`server-input ${validationErrors.homeserver ? 'error' : ''}`}
                  />
                  <button 
                    onClick={handleHomeserverUpdate}
                    disabled={!customHomeserver}
                    className="update-server-btn"
                    type="button"
                  >
                    Update
                  </button>
                </div>
                {validationErrors.homeserver && (
                  <div className="validation-error">{validationErrors.homeserver}</div>
                )}
              </div>
            </div>

            <div className="server-setting">
              <div className="setting-info">
                <span className="setting-title">Identity Server</span>
                <span className="setting-description">
                  Optional identity server for user discovery (leave empty to disable)
                </span>
              </div>
              <div className="server-input-group">
                <div className="current-server">
                  <span className="server-label">Current:</span>
                  <code className="server-url">
                    {advanced.identityServer || 'Not configured'}
                  </code>
                </div>
                <div className="server-change">
                  <input
                    type="url"
                    placeholder="https://vector.im (optional)"
                    value={customIdentityServer}
                    onChange={(e) => {
                      setCustomIdentityServer(e.target.value);
                      if (validationErrors.identityServer) {
                        setValidationErrors(prev => ({ ...prev, identityServer: undefined }));
                      }
                    }}
                    className={`server-input ${validationErrors.identityServer ? 'error' : ''}`}
                  />
                  <button 
                    onClick={handleIdentityServerUpdate}
                    disabled={!customIdentityServer}
                    className="update-server-btn"
                    type="button"
                  >
                    Update
                  </button>
                  {advanced.identityServer && (
                    <button 
                      onClick={() => handleAdvancedUpdate({ identityServer: undefined })}
                      className="remove-server-btn"
                      type="button"
                    >
                      Remove
                    </button>
                  )}
                </div>
                {validationErrors.identityServer && (
                  <div className="validation-error">{validationErrors.identityServer}</div>
                )}
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Sync Timeout</span>
                <span className="setting-description">
                  How long to wait for server responses (milliseconds)
                </span>
              </div>
              <select
                value={advanced.syncTimeout}
                onChange={(e) => handleAdvancedUpdate({ syncTimeout: Number(e.target.value) })}
                className="setting-select"
              >
                <option value={10000}>10 seconds</option>
                <option value={30000}>30 seconds (default)</option>
                <option value={60000}>1 minute</option>
                <option value={120000}>2 minutes</option>
                <option value={300000}>5 minutes</option>
              </select>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Retry Configuration</span>
                <span className="setting-description">
                  Network retry settings for failed requests
                </span>
              </div>
              <div className="retry-settings">
                <div className="retry-input">
                  <label htmlFor="retry-delay">Delay (ms):</label>
                  <input
                    id="retry-delay"
                    type="number"
                    min="100"
                    max="10000"
                    step="100"
                    value={advanced.retryDelayMs}
                    onChange={(e) => handleAdvancedUpdate({ retryDelayMs: Number(e.target.value) })}
                    className="number-input"
                  />
                </div>
                <div className="retry-input">
                  <label htmlFor="max-retries">Max retries:</label>
                  <input
                    id="max-retries"
                    type="number"
                    min="0"
                    max="10"
                    value={advanced.maxRetries}
                    onChange={(e) => handleAdvancedUpdate({ maxRetries: Number(e.target.value) })}
                    className="number-input"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sync Settings */}
        <section className="settings-section">
          <h3>🔄 Sync Settings</h3>
          <p className="section-description">
            Control how the client synchronizes data with the Matrix homeserver.
          </p>

          <div className="setting-group">
            <label className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Lazy Load Members</span>
                <span className="setting-description">
                  Load room members on-demand to reduce memory usage
                </span>
              </div>
              <input
                type="checkbox"
                checked={advanced.lazyLoadMembers}
                onChange={(e) => handleAdvancedUpdate({ lazyLoadMembers: e.target.checked })}
                className="setting-toggle"
              />
            </label>

            <label className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Enable Presence</span>
                <span className="setting-description">
                  Sync online status and presence information
                </span>
              </div>
              <input
                type="checkbox"
                checked={advanced.enablePresence}
                onChange={(e) => handleAdvancedUpdate({ enablePresence: e.target.checked })}
                className="setting-toggle"
              />
            </label>

            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Custom Sync Filter</span>
                <span className="setting-description">
                  Advanced sync filtering (leave empty for default)
                </span>
              </div>
              <input
                type="text"
                placeholder="Custom filter ID"
                value={advanced.syncFilterId || ''}
                onChange={(e) => handleAdvancedUpdate({ 
                  syncFilterId: e.target.value || undefined 
                })}
                className="text-input"
              />
            </div>
          </div>
        </section>

        {/* Encryption Settings */}
        <section className="settings-section">
          <h3>🔐 Encryption Settings</h3>
          <p className="section-description">
            Configure end-to-end encryption and device verification settings.
          </p>

          <div className="setting-group">
            <label className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Enable End-to-End Encryption</span>
                <span className="setting-description">
                  Use E2EE for encrypted rooms (strongly recommended)
                </span>
              </div>
              <input
                type="checkbox"
                checked={advanced.enableE2EE}
                onChange={(e) => handleAdvancedUpdate({ enableE2EE: e.target.checked })}
                className="setting-toggle"
              />
            </label>

            <label className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Enable Key Backup</span>
                <span className="setting-description">
                  Backup encryption keys to the server for key recovery
                </span>
                <div className="setting-dependency">
                  {!advanced.enableE2EE && (
                    <span className="dependency-note">Requires E2EE to be enabled</span>
                  )}
                </div>
              </div>
              <input
                type="checkbox"
                checked={advanced.keyBackupEnabled && advanced.enableE2EE}
                disabled={!advanced.enableE2EE}
                onChange={(e) => handleAdvancedUpdate({ keyBackupEnabled: e.target.checked })}
                className="setting-toggle"
              />
            </label>

            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Device Verification Mode</span>
                <span className="setting-description">
                  How strictly to verify devices before trusting them
                </span>
              </div>
              <select
                value={advanced.deviceVerificationMode}
                onChange={(e) => handleAdvancedUpdate({ 
                  deviceVerificationMode: e.target.value as 'strict' | 'relaxed' | 'disabled' 
                })}
                className="setting-select"
              >
                <option value="strict">Strict (verify all devices)</option>
                <option value="relaxed">Relaxed (trust known devices)</option>
                <option value="disabled">Disabled (trust all devices)</option>
              </select>
            </div>

            <label className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Enable Cross-Signing</span>
                <span className="setting-description">
                  Use cross-signing to verify devices across your account
                </span>
              </div>
              <input
                type="checkbox"
                checked={advanced.crossSigningEnabled}
                onChange={(e) => handleAdvancedUpdate({ crossSigningEnabled: e.target.checked })}
                className="setting-toggle"
              />
            </label>
          </div>
        </section>

        {/* Room Settings */}
        <section className="settings-section">
          <h3>🏠 Room Settings</h3>
          <p className="section-description">
            Configure default room creation and federation settings.
          </p>

          <div className="setting-group">
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Default Room Version</span>
                <span className="setting-description">
                  Matrix room version to use when creating new rooms
                </span>
              </div>
              <select
                value={advanced.defaultRoomVersion}
                onChange={(e) => handleAdvancedUpdate({ defaultRoomVersion: e.target.value })}
                className="setting-select"
              >
                <option value="6">Version 6 (stable, older features)</option>
                <option value="7">Version 7 (stable)</option>
                <option value="8">Version 8 (stable)</option>
                <option value="9">Version 9 (stable, recommended)</option>
                <option value="10">Version 10 (stable, latest)</option>
              </select>
            </div>

            <label className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Enable Bridging</span>
                <span className="setting-description">
                  Allow rooms to connect to external chat networks
                </span>
              </div>
              <input
                type="checkbox"
                checked={advanced.enableBridging}
                onChange={(e) => handleAdvancedUpdate({ enableBridging: e.target.checked })}
                className="setting-toggle"
              />
            </label>

            <label className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Enable Federation</span>
                <span className="setting-description">
                  Allow communication with users on other Matrix servers
                </span>
              </div>
              <input
                type="checkbox"
                checked={advanced.enableFederation}
                onChange={(e) => handleAdvancedUpdate({ enableFederation: e.target.checked })}
                className="setting-toggle"
              />
            </label>
          </div>
        </section>

        {/* Performance Settings */}
        <section className="settings-section">
          <h3>⚡ Performance Settings</h3>
          <p className="section-description">
            Optimize client performance and resource usage.
          </p>

          <div className="setting-group">
            <label className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Enable Lazy Loading</span>
                <span className="setting-description">
                  Load room data incrementally to improve performance
                </span>
              </div>
              <input
                type="checkbox"
                checked={advanced.enableLazyLoading}
                onChange={(e) => handleAdvancedUpdate({ enableLazyLoading: e.target.checked })}
                className="setting-toggle"
              />
            </label>

            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Message History Limit</span>
                <span className="setting-description">
                  Maximum messages to keep in memory per room
                </span>
              </div>
              <div className="number-input-group">
                <input
                  type="number"
                  min="100"
                  max="10000"
                  step="100"
                  value={advanced.messageHistoryLimit}
                  onChange={(e) => handleAdvancedUpdate({ messageHistoryLimit: Number(e.target.value) })}
                  className="number-input"
                />
                <span className="input-suffix">messages</span>
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Thumbnail Size</span>
                <span className="setting-description">
                  Maximum size for image thumbnails (pixels)
                </span>
              </div>
              <select
                value={advanced.thumbnailSize}
                onChange={(e) => handleAdvancedUpdate({ thumbnailSize: Number(e.target.value) })}
                className="setting-select"
              >
                <option value={240}>240px (small)</option>
                <option value={320}>320px (medium)</option>
                <option value={480}>480px (large, default)</option>
                <option value={640}>640px (extra large)</option>
                <option value={800}>800px (full quality)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Developer Settings */}
        <section className="settings-section developer-section">
          <h3>🛠️ Developer Settings</h3>
          <p className="section-description">
            Debug tools and developer features. Enable only for troubleshooting.
          </p>

          <div className="setting-group">
            <label className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Enable Developer Mode</span>
                <span className="setting-description">
                  Show developer tools and debug information
                </span>
              </div>
              <input
                type="checkbox"
                checked={advanced.enableDevMode}
                onChange={(e) => handleAdvancedUpdate({ enableDevMode: e.target.checked })}
                className="setting-toggle"
              />
            </label>

            <label className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Show Event IDs</span>
                <span className="setting-description">
                  Display Matrix event IDs in the interface
                </span>
                <div className="setting-dependency">
                  {!advanced.enableDevMode && (
                    <span className="dependency-note">Requires developer mode</span>
                  )}
                </div>
              </div>
              <input
                type="checkbox"
                checked={advanced.showEventIds && advanced.enableDevMode}
                disabled={!advanced.enableDevMode}
                onChange={(e) => handleAdvancedUpdate({ showEventIds: e.target.checked })}
                className="setting-toggle"
              />
            </label>

            <label className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Enable Debug Logs</span>
                <span className="setting-description">
                  Log detailed debug information to browser console
                </span>
              </div>
              <input
                type="checkbox"
                checked={advanced.enableDebugLogs}
                onChange={(e) => handleAdvancedUpdate({ enableDebugLogs: e.target.checked })}
                className="setting-toggle"
              />
            </label>

            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Log Level</span>
                <span className="setting-description">
                  Minimum severity level for console logging
                </span>
              </div>
              <select
                value={advanced.logLevel}
                onChange={(e) => handleAdvancedUpdate({ 
                  logLevel: e.target.value as 'error' | 'warn' | 'info' | 'debug' 
                })}
                className="setting-select"
              >
                <option value="error">Error only</option>
                <option value="warn">Warnings and errors</option>
                <option value="info">Info, warnings, errors</option>
                <option value="debug">All messages (verbose)</option>
              </select>
            </div>
          </div>

          <div className="developer-tools">
            <h4>🔧 Debug Actions</h4>
            <div className="debug-actions">
              <button className="debug-btn" type="button">
                Clear Local Storage
              </button>
              <button className="debug-btn" type="button">
                Export Debug Info
              </button>
              <button className="debug-btn" type="button">
                Test Connection
              </button>
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        .advanced-settings {
          max-width: 900px;
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
          margin: 0 0 16px 0;
          color: var(--text-secondary, #6c757d);
          font-size: 16px;
          line-height: 1.5;
        }

        .warning-banner {
          display: flex;
          gap: 12px;
          padding: 16px;
          background: rgba(255, 193, 7, 0.1);
          border: 1px solid rgba(255, 193, 7, 0.3);
          border-radius: 8px;
          font-size: 14px;
        }

        .warning-icon {
          font-size: 18px;
          flex-shrink: 0;
        }

        .warning-text {
          color: var(--text-primary, #2c3e50);
          line-height: 1.4;
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

        .developer-section {
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

        .setting-group {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .setting-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          padding: 12px 0;
          border-bottom: 1px solid var(--border-light, #f1f3f4);
        }

        .setting-item:last-child {
          border-bottom: none;
        }

        .server-setting {
          padding: 16px 0;
          border-bottom: 1px solid var(--border-light, #f1f3f4);
        }

        .setting-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex-grow: 1;
        }

        .setting-title {
          font-weight: 500;
          font-size: 15px;
          color: var(--text-primary, #2c3e50);
        }

        .setting-description {
          font-size: 13px;
          color: var(--text-secondary, #6c757d);
          line-height: 1.4;
        }

        .setting-dependency {
          margin-top: 6px;
        }

        .dependency-note {
          font-size: 12px;
          color: #dc3545;
          font-style: italic;
        }

        .setting-toggle {
          width: 44px;
          height: 24px;
          appearance: none;
          background: var(--background-tertiary, #dee2e6);
          border: none;
          border-radius: 12px;
          position: relative;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .setting-toggle:checked {
          background: var(--accent-color, #007bff);
        }

        .setting-toggle:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .setting-toggle::after {
          content: '';
          position: absolute;
          top: 2px;
          left: 2px;
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 10px;
          transition: all 0.2s;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .setting-toggle:checked::after {
          transform: translateX(20px);
        }

        .setting-select {
          padding: 8px 12px;
          border: 1px solid var(--border-color, #ced4da);
          border-radius: 4px;
          background: white;
          font-size: 14px;
          min-width: 180px;
          cursor: pointer;
        }

        .setting-select:focus {
          outline: none;
          border-color: var(--accent-color, #007bff);
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
        }

        .text-input {
          padding: 8px 12px;
          border: 1px solid var(--border-color, #ced4da);
          border-radius: 4px;
          font-size: 14px;
          min-width: 200px;
          font-family: monospace;
        }

        .text-input:focus {
          outline: none;
          border-color: var(--accent-color, #007bff);
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
        }

        .number-input {
          padding: 6px 10px;
          border: 1px solid var(--border-color, #ced4da);
          border-radius: 4px;
          font-size: 14px;
          width: 80px;
          text-align: center;
        }

        .number-input:focus {
          outline: none;
          border-color: var(--accent-color, #007bff);
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
        }

        .number-input-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .input-suffix {
          font-size: 13px;
          color: var(--text-secondary, #6c757d);
        }

        .server-input-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 12px;
        }

        .current-server {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }

        .server-label {
          color: var(--text-secondary, #6c757d);
          font-weight: 500;
        }

        .server-url {
          background: var(--background-primary, #ffffff);
          padding: 4px 8px;
          border-radius: 4px;
          border: 1px solid var(--border-color, #e9ecef);
          font-family: monospace;
          font-size: 13px;
          color: var(--text-primary, #2c3e50);
        }

        .server-change {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .server-input {
          flex-grow: 1;
          padding: 8px 12px;
          border: 1px solid var(--border-color, #ced4da);
          border-radius: 4px;
          font-size: 14px;
          font-family: monospace;
        }

        .server-input.error {
          border-color: #dc3545;
        }

        .server-input:focus {
          outline: none;
          border-color: var(--accent-color, #007bff);
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
        }

        .update-server-btn {
          padding: 8px 16px;
          background: var(--accent-color, #007bff);
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .update-server-btn:disabled {
          background: var(--background-tertiary, #dee2e6);
          cursor: not-allowed;
        }

        .update-server-btn:hover:not(:disabled) {
          background: #0056b3;
        }

        .remove-server-btn {
          padding: 8px 12px;
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .remove-server-btn:hover {
          background: #c82333;
        }

        .validation-error {
          color: #dc3545;
          font-size: 12px;
          margin-top: 4px;
        }

        .retry-settings {
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .retry-input {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .retry-input label {
          font-size: 12px;
          color: var(--text-secondary, #6c757d);
          font-weight: 500;
        }

        .developer-tools {
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid rgba(220, 53, 69, 0.2);
        }

        .debug-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .debug-btn {
          padding: 8px 16px;
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .debug-btn:hover {
          background: #c82333;
        }

        @media (max-width: 768px) {
          .advanced-settings {
            max-width: none;
          }

          .settings-section {
            padding: 20px 16px;
          }

          .setting-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .server-change {
            flex-direction: column;
            align-items: stretch;
          }

          .retry-settings {
            flex-direction: column;
            align-items: flex-start;
          }

          .debug-actions {
            flex-direction: column;
          }

          .debug-btn {
            width: 100%;
          }

          .server-input {
            min-width: auto;
          }

          .text-input {
            min-width: auto;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}