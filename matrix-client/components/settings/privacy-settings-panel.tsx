'use client';

import React from 'react';
import { useSettings } from '../../hooks/use-settings';
import { PrivacySettings } from '../../types/settings';

export function PrivacySettingsPanel() {
  const { settings, updateSettings } = useSettings();
  const { privacy } = settings;

  const handlePrivacyUpdate = async (updates: Partial<PrivacySettings>) => {
    await updateSettings({
      privacy: {
        ...privacy,
        ...updates,
      },
    });
  };

  return (
    <div className="privacy-settings">
      <header className="panel-header">
        <h2>Privacy & Security Settings</h2>
        <p>Control your privacy preferences and security settings to protect your data and communications.</p>
      </header>

      <div className="settings-sections">
        {/* Profile Privacy */}
        <section className="settings-section">
          <h3>🏷️ Profile Privacy</h3>
          <p className="section-description">
            Control what information others can see about your activity and status.
          </p>

          <div className="setting-group">
            <label className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Show Online Status</span>
                <span className="setting-description">
                  Let others see when you're online or offline
                </span>
              </div>
              <input
                type="checkbox"
                checked={privacy.showOnlineStatus}
                onChange={(e) => handlePrivacyUpdate({ showOnlineStatus: e.target.checked })}
                className="setting-toggle"
              />
            </label>

            <label className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Show Last Seen</span>
                <span className="setting-description">
                  Display when you were last active to other users
                </span>
              </div>
              <input
                type="checkbox"
                checked={privacy.showLastSeen}
                onChange={(e) => handlePrivacyUpdate({ showLastSeen: e.target.checked })}
                className="setting-toggle"
              />
            </label>

            <label className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Show Read Receipts</span>
                <span className="setting-description">
                  Let others see when you've read their messages
                </span>
              </div>
              <input
                type="checkbox"
                checked={privacy.showReadReceipts}
                onChange={(e) => handlePrivacyUpdate({ showReadReceipts: e.target.checked })}
                className="setting-toggle"
              />
            </label>

            <label className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Show Typing Indicators</span>
                <span className="setting-description">
                  Display "typing..." indicator when you're composing messages
                </span>
              </div>
              <input
                type="checkbox"
                checked={privacy.showTypingIndicators}
                onChange={(e) => handlePrivacyUpdate({ showTypingIndicators: e.target.checked })}
                className="setting-toggle"
              />
            </label>
          </div>
        </section>

        {/* Room Privacy */}
        <section className="settings-section">
          <h3>🚪 Room & Communication Privacy</h3>
          <p className="section-description">
            Manage who can invite you to rooms and send you direct messages.
          </p>

          <div className="setting-group">
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Accept Room Invites</span>
                <span className="setting-description">
                  Control who can invite you to join rooms
                </span>
              </div>
              <select
                value={privacy.acceptRoomInvites}
                onChange={(e) => handlePrivacyUpdate({ acceptRoomInvites: e.target.value as 'always' | 'friends' | 'never' })}
                className="setting-select"
              >
                <option value="always">Anyone</option>
                <option value="friends">Friends only</option>
                <option value="never">Nobody</option>
              </select>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Allow Direct Messages</span>
                <span className="setting-description">
                  Control who can send you direct messages
                </span>
              </div>
              <select
                value={privacy.allowDirectMessages}
                onChange={(e) => handlePrivacyUpdate({ allowDirectMessages: e.target.value as 'anyone' | 'friends' | 'verified' })}
                className="setting-select"
              >
                <option value="anyone">Anyone</option>
                <option value="friends">Friends only</option>
                <option value="verified">Verified users only</option>
              </select>
            </div>
          </div>

          <div className="privacy-note">
            <strong>Note:</strong> These settings may not apply retroactively to existing conversations or invitations.
          </div>
        </section>

        {/* Content Privacy */}
        <section className="settings-section">
          <h3>📄 Content Privacy</h3>
          <p className="section-description">
            Control how your messages and content are stored and processed.
          </p>

          <div className="setting-group">
            <label className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Enable Message Search</span>
                <span className="setting-description">
                  Allow searching through your message history locally
                </span>
              </div>
              <input
                type="checkbox"
                checked={privacy.enableMessageSearch}
                onChange={(e) => handlePrivacyUpdate({ enableMessageSearch: e.target.checked })}
                className="setting-toggle"
              />
            </label>

            <label className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Store Message History</span>
                <span className="setting-description">
                  Keep a local history of your messages for offline access
                </span>
              </div>
              <input
                type="checkbox"
                checked={privacy.storeMessageHistory}
                onChange={(e) => handlePrivacyUpdate({ storeMessageHistory: e.target.checked })}
                className="setting-toggle"
              />
            </label>

            <label className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Enable URL Previews</span>
                <span className="setting-description">
                  Generate previews for links shared in conversations
                </span>
              </div>
              <input
                type="checkbox"
                checked={privacy.enableUrlPreviews}
                onChange={(e) => handlePrivacyUpdate({ enableUrlPreviews: e.target.checked })}
                className="setting-toggle"
              />
            </label>
          </div>

          <div className="privacy-warning">
            <div className="warning-icon">⚠️</div>
            <div className="warning-content">
              <strong>Privacy Impact:</strong> URL previews may send metadata about links to preview services. 
              Disable this if you share sensitive links frequently.
            </div>
          </div>
        </section>

        {/* Device Privacy */}
        <section className="settings-section">
          <h3>📱 Device & Encryption Privacy</h3>
          <p className="section-description">
            Manage device verification, cross-signing, and encryption preferences.
          </p>

          <div className="setting-group">
            <label className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Share Presence Data</span>
                <span className="setting-description">
                  Share your online status across all your devices
                </span>
              </div>
              <input
                type="checkbox"
                checked={privacy.sharePresenceData}
                onChange={(e) => handlePrivacyUpdate({ sharePresenceData: e.target.checked })}
                className="setting-toggle"
              />
            </label>

            <label className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Enable Cross-Signing</span>
                <span className="setting-description">
                  Verify your devices using cross-signing for better security
                </span>
              </div>
              <input
                type="checkbox"
                checked={privacy.enableCrossSigning}
                onChange={(e) => handlePrivacyUpdate({ enableCrossSigning: e.target.checked })}
                className="setting-toggle"
              />
            </label>

            <label className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Auto-Verify Devices</span>
                <span className="setting-description">
                  Automatically verify new devices when cross-signing is enabled
                </span>
                <div className="setting-dependency">
                  {!privacy.enableCrossSigning && (
                    <span className="dependency-note">Requires cross-signing to be enabled</span>
                  )}
                </div>
              </div>
              <input
                type="checkbox"
                checked={privacy.autoVerifyDevices && privacy.enableCrossSigning}
                disabled={!privacy.enableCrossSigning}
                onChange={(e) => handlePrivacyUpdate({ autoVerifyDevices: e.target.checked })}
                className="setting-toggle"
              />
            </label>
          </div>
        </section>

        {/* Data & Analytics */}
        <section className="settings-section">
          <h3>📊 Data & Analytics</h3>
          <p className="section-description">
            Control data collection, analytics, and synchronization preferences.
          </p>

          <div className="setting-group">
            <label className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Enable Analytics</span>
                <span className="setting-description">
                  Help improve the app by sharing anonymous usage analytics
                </span>
              </div>
              <input
                type="checkbox"
                checked={privacy.enableAnalytics}
                onChange={(e) => handlePrivacyUpdate({ enableAnalytics: e.target.checked })}
                className="setting-toggle"
              />
            </label>

            <label className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Enable Error Reporting</span>
                <span className="setting-description">
                  Automatically send crash reports and error information
                </span>
              </div>
              <input
                type="checkbox"
                checked={privacy.enableErrorReporting}
                onChange={(e) => handlePrivacyUpdate({ enableErrorReporting: e.target.checked })}
                className="setting-toggle"
              />
            </label>

            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Data Sync Frequency</span>
                <span className="setting-description">
                  How often to sync data with servers (affects battery and privacy)
                </span>
              </div>
              <select
                value={privacy.dataSyncFrequency}
                onChange={(e) => handlePrivacyUpdate({ 
                  dataSyncFrequency: e.target.value as 'realtime' | 'frequent' | 'moderate' | 'minimal' 
                })}
                className="setting-select"
              >
                <option value="realtime">Real-time (instant, more data usage)</option>
                <option value="frequent">Frequent (every few seconds)</option>
                <option value="moderate">Moderate (every minute)</option>
                <option value="minimal">Minimal (every 5 minutes)</option>
              </select>
            </div>
          </div>

          <div className="data-info">
            <h4>📋 Data Collection Summary</h4>
            <ul className="data-list">
              <li className={privacy.enableAnalytics ? 'enabled' : 'disabled'}>
                <span className="status-icon">{privacy.enableAnalytics ? '✅' : '❌'}</span>
                <span>Anonymous usage analytics</span>
              </li>
              <li className={privacy.enableErrorReporting ? 'enabled' : 'disabled'}>
                <span className="status-icon">{privacy.enableErrorReporting ? '✅' : '❌'}</span>
                <span>Crash reports and error logs</span>
              </li>
              <li className={privacy.storeMessageHistory ? 'enabled' : 'disabled'}>
                <span className="status-icon">{privacy.storeMessageHistory ? '✅' : '❌'}</span>
                <span>Local message history storage</span>
              </li>
              <li className={privacy.enableUrlPreviews ? 'enabled' : 'disabled'}>
                <span className="status-icon">{privacy.enableUrlPreviews ? '✅' : '❌'}</span>
                <span>URL metadata for link previews</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Privacy Score */}
        <section className="settings-section privacy-score-section">
          <h3>🎯 Privacy Score</h3>
          <p className="section-description">
            Your current privacy configuration score based on enabled settings.
          </p>

          <div className="privacy-score">
            {(() => {
              const privacyScore = [
                !privacy.showOnlineStatus,
                !privacy.showLastSeen,
                !privacy.showReadReceipts,
                !privacy.showTypingIndicators,
                privacy.acceptRoomInvites !== 'always',
                privacy.allowDirectMessages !== 'anyone',
                !privacy.enableUrlPreviews,
                !privacy.enableAnalytics,
                privacy.enableCrossSigning,
                privacy.dataSyncFrequency !== 'realtime'
              ].filter(Boolean).length;

              const maxScore = 10;
              const percentage = (privacyScore / maxScore) * 100;

              return (
                <>
                  <div className="score-display">
                    <div className="score-circle">
                      <span className="score-value">{privacyScore}/{maxScore}</span>
                    </div>
                    <div className="score-info">
                      <div className="score-label">Privacy Score</div>
                      <div className={`score-rating ${
                        percentage >= 80 ? 'excellent' : 
                        percentage >= 60 ? 'good' : 
                        percentage >= 40 ? 'fair' : 'needs-improvement'
                      }`}>
                        {percentage >= 80 ? 'Excellent' : 
                         percentage >= 60 ? 'Good' : 
                         percentage >= 40 ? 'Fair' : 'Needs Improvement'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="score-breakdown">
                    <h4>Recommendations:</h4>
                    <ul>
                      {privacy.showOnlineStatus && <li>Consider hiding your online status</li>}
                      {privacy.showLastSeen && <li>Consider hiding your last seen timestamp</li>}
                      {privacy.enableUrlPreviews && <li>Disable URL previews for better privacy</li>}
                      {privacy.enableAnalytics && <li>Consider disabling analytics</li>}
                      {privacy.acceptRoomInvites === 'always' && <li>Restrict room invites to friends only</li>}
                      {!privacy.enableCrossSigning && <li>Enable cross-signing for better security</li>}
                    </ul>
                  </div>
                </>
              );
            })()}
          </div>
        </section>
      </div>

      <style jsx>{`
        .privacy-settings {
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
          gap: 16px;
        }

        .setting-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          padding: 12px 0;
          border-bottom: 1px solid var(--border-light, #f1f3f4);
          cursor: pointer;
        }

        .setting-item:last-child {
          border-bottom: none;
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
          min-width: 150px;
          cursor: pointer;
        }

        .setting-select:focus {
          outline: none;
          border-color: var(--accent-color, #007bff);
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
        }

        .privacy-note {
          margin-top: 16px;
          padding: 12px;
          background: rgba(0, 123, 255, 0.1);
          border: 1px solid rgba(0, 123, 255, 0.2);
          border-radius: 6px;
          font-size: 13px;
          color: var(--text-primary, #2c3e50);
        }

        .privacy-warning {
          display: flex;
          gap: 12px;
          margin-top: 16px;
          padding: 12px;
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
          color: var(--text-primary, #2c3e50);
          line-height: 1.4;
        }

        .data-info {
          margin-top: 20px;
          padding: 16px;
          background: var(--background-primary, #ffffff);
          border: 1px solid var(--border-color, #e9ecef);
          border-radius: 6px;
        }

        .data-list {
          margin: 8px 0 0 0;
          padding: 0;
          list-style: none;
        }

        .data-list li {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 0;
          font-size: 14px;
          color: var(--text-secondary, #6c757d);
        }

        .data-list li.enabled {
          color: var(--text-primary, #2c3e50);
        }

        .status-icon {
          font-size: 12px;
          width: 16px;
        }

        .privacy-score-section {
          background: linear-gradient(135deg, rgba(0, 123, 255, 0.05) 0%, rgba(0, 123, 255, 0.1) 100%);
          border: 1px solid rgba(0, 123, 255, 0.2);
        }

        .privacy-score {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .score-display {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .score-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: var(--accent-color, #007bff);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 16px;
          box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
        }

        .score-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .score-label {
          font-size: 14px;
          color: var(--text-secondary, #6c757d);
          font-weight: 500;
        }

        .score-rating {
          font-size: 18px;
          font-weight: 600;
        }

        .score-rating.excellent {
          color: #28a745;
        }

        .score-rating.good {
          color: #17a2b8;
        }

        .score-rating.fair {
          color: #ffc107;
        }

        .score-rating.needs-improvement {
          color: #dc3545;
        }

        .score-breakdown {
          background: var(--background-primary, #ffffff);
          padding: 16px;
          border-radius: 6px;
          border: 1px solid var(--border-color, #e9ecef);
        }

        .score-breakdown ul {
          margin: 8px 0 0 0;
          padding-left: 16px;
        }

        .score-breakdown li {
          margin-bottom: 4px;
          font-size: 13px;
          color: var(--text-secondary, #6c757d);
        }

        @media (max-width: 768px) {
          .privacy-settings {
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

          .score-display {
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 12px;
          }

          .privacy-warning {
            flex-direction: column;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
}