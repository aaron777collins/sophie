'use client';

import React, { useState } from 'react';
import { useSettings } from '../../hooks/use-settings';
import { NotificationSettings } from '../../types/settings';

export function NotificationSettingsPanel() {
  const { settings, updateSettings } = useSettings();
  const { notifications } = settings;
  const [newKeyword, setNewKeyword] = useState('');

  const handleNotificationUpdate = async (updates: Partial<NotificationSettings>) => {
    await updateSettings({
      notifications: {
        ...notifications,
        ...updates,
      },
    });
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !notifications.notificationKeywords.includes(newKeyword.trim())) {
      handleNotificationUpdate({
        notificationKeywords: [...notifications.notificationKeywords, newKeyword.trim()],
      });
      setNewKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    handleNotificationUpdate({
      notificationKeywords: notifications.notificationKeywords.filter(k => k !== keyword),
    });
  };

  return (
    <div className="notification-settings">
      <header className="panel-header">
        <h2>Notification Settings</h2>
        <p>Configure when and how you receive notifications for messages and events.</p>
      </header>

      <div className="settings-sections">
        {/* Basic Notifications */}
        <section className="settings-section">
          <h3>Basic Notifications</h3>
          
          <div className="setting-group">
            <label className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Push Notifications</span>
                <span className="setting-description">
                  Receive push notifications on your device
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifications.enablePushNotifications}
                onChange={(e) => handleNotificationUpdate({ enablePushNotifications: e.target.checked })}
                className="setting-toggle"
              />
            </label>

            <label className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Desktop Notifications</span>
                <span className="setting-description">
                  Show notifications on your desktop
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifications.enableDesktopNotifications}
                onChange={(e) => handleNotificationUpdate({ enableDesktopNotifications: e.target.checked })}
                className="setting-toggle"
              />
            </label>

            <label className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Sound Notifications</span>
                <span className="setting-description">
                  Play sound alerts for notifications
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifications.enableSoundNotifications}
                onChange={(e) => handleNotificationUpdate({ enableSoundNotifications: e.target.checked })}
                className="setting-toggle"
              />
            </label>
          </div>
        </section>

        {/* Message Notifications */}
        <section className="settings-section">
          <h3>Message Notifications</h3>
          
          <div className="setting-group">
            <label className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Direct Messages</span>
                <span className="setting-description">
                  Notify for all direct messages
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifications.notifyOnDirectMessages}
                onChange={(e) => handleNotificationUpdate({ notifyOnDirectMessages: e.target.checked })}
                className="setting-toggle"
              />
            </label>

            <label className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Mentions</span>
                <span className="setting-description">
                  Notify when you're mentioned in a room
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifications.notifyOnMentions}
                onChange={(e) => handleNotificationUpdate({ notifyOnMentions: e.target.checked })}
                className="setting-toggle"
              />
            </label>

            <label className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Keywords</span>
                <span className="setting-description">
                  Notify when specific keywords are mentioned
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifications.notifyOnKeywords}
                onChange={(e) => handleNotificationUpdate({ notifyOnKeywords: e.target.checked })}
                className="setting-toggle"
              />
            </label>

            <label className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Room Invites</span>
                <span className="setting-description">
                  Notify when you're invited to join a room
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifications.notifyOnRoomInvites}
                onChange={(e) => handleNotificationUpdate({ notifyOnRoomInvites: e.target.checked })}
                className="setting-toggle"
              />
            </label>
          </div>
        </section>

        {/* Notification Keywords */}
        {notifications.notifyOnKeywords && (
          <section className="settings-section">
            <h3>Notification Keywords</h3>
            <p className="section-description">
              Get notified when these words are mentioned in any room.
            </p>

            <div className="keywords-manager">
              <div className="keywords-input">
                <input
                  type="text"
                  placeholder="Add a keyword..."
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                  className="keyword-input"
                />
                <button onClick={addKeyword} className="add-keyword-btn" type="button">
                  Add
                </button>
              </div>

              <div className="keywords-list">
                {notifications.notificationKeywords.map((keyword) => (
                  <div key={keyword} className="keyword-tag">
                    <span>{keyword}</span>
                    <button
                      onClick={() => removeKeyword(keyword)}
                      className="remove-keyword-btn"
                      type="button"
                      aria-label={`Remove keyword: ${keyword}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Quiet Hours */}
        <section className="settings-section">
          <h3>Quiet Hours</h3>
          <p className="section-description">
            Automatically disable notifications during specific hours.
          </p>

          <div className="setting-group">
            <label className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Enable Quiet Hours</span>
                <span className="setting-description">
                  Disable notifications during specified time period
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifications.quietHours.enabled}
                onChange={(e) => handleNotificationUpdate({
                  quietHours: { ...notifications.quietHours, enabled: e.target.checked }
                })}
                className="setting-toggle"
              />
            </label>

            {notifications.quietHours.enabled && (
              <div className="time-range-inputs">
                <div className="time-input-group">
                  <label htmlFor="quiet-start">Start Time</label>
                  <input
                    id="quiet-start"
                    type="time"
                    value={notifications.quietHours.startTime}
                    onChange={(e) => handleNotificationUpdate({
                      quietHours: { ...notifications.quietHours, startTime: e.target.value }
                    })}
                    className="time-input"
                  />
                </div>
                <div className="time-input-group">
                  <label htmlFor="quiet-end">End Time</label>
                  <input
                    id="quiet-end"
                    type="time"
                    value={notifications.quietHours.endTime}
                    onChange={(e) => handleNotificationUpdate({
                      quietHours: { ...notifications.quietHours, endTime: e.target.value }
                    })}
                    className="time-input"
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Advanced Notification Settings */}
        <section className="settings-section">
          <h3>Advanced Settings</h3>

          <div className="setting-group">
            <label className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Group Notifications</span>
                <span className="setting-description">
                  Group multiple notifications from the same room together
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifications.groupNotifications}
                onChange={(e) => handleNotificationUpdate({ groupNotifications: e.target.checked })}
                className="setting-toggle"
              />
            </label>

            <label className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Show Sender Info</span>
                <span className="setting-description">
                  Include sender name and avatar in notifications
                </span>
              </div>
              <input
                type="checkbox"
                checked={notifications.showSenderInfo}
                onChange={(e) => handleNotificationUpdate({ showSenderInfo: e.target.checked })}
                className="setting-toggle"
              />
            </label>

            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Notification Timeout</span>
                <span className="setting-description">
                  How long notifications stay visible (seconds)
                </span>
              </div>
              <select
                value={notifications.notificationTimeout}
                onChange={(e) => handleNotificationUpdate({ notificationTimeout: Number(e.target.value) })}
                className="setting-select"
              >
                <option value={2000}>2 seconds</option>
                <option value={5000}>5 seconds</option>
                <option value={10000}>10 seconds</option>
                <option value={15000}>15 seconds</option>
                <option value={30000}>30 seconds</option>
              </select>
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        .notification-settings {
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
          padding: 6px 10px;
          border: 1px solid var(--border-color, #ced4da);
          border-radius: 4px;
          background: white;
          font-size: 14px;
          min-width: 120px;
          cursor: pointer;
        }

        .setting-select:focus {
          outline: none;
          border-color: var(--accent-color, #007bff);
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
        }

        .keywords-manager {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .keywords-input {
          display: flex;
          gap: 8px;
        }

        .keyword-input {
          flex-grow: 1;
          padding: 8px 12px;
          border: 1px solid var(--border-color, #ced4da);
          border-radius: 4px;
          font-size: 14px;
        }

        .keyword-input:focus {
          outline: none;
          border-color: var(--accent-color, #007bff);
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
        }

        .add-keyword-btn {
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

        .add-keyword-btn:hover {
          background: #0056b3;
        }

        .keywords-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .keyword-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 8px;
          background: var(--accent-color, #007bff);
          color: white;
          border-radius: 16px;
          font-size: 13px;
          font-weight: 500;
        }

        .remove-keyword-btn {
          background: none;
          border: none;
          color: white;
          font-size: 16px;
          cursor: pointer;
          padding: 0;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background-color 0.2s;
        }

        .remove-keyword-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .time-range-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-top: 12px;
          padding: 16px;
          background: var(--background-primary, #ffffff);
          border-radius: 6px;
          border: 1px solid var(--border-light, #f1f3f4);
        }

        .time-input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .time-input-group label {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary, #2c3e50);
        }

        .time-input {
          padding: 6px 10px;
          border: 1px solid var(--border-color, #ced4da);
          border-radius: 4px;
          font-size: 14px;
        }

        .time-input:focus {
          outline: none;
          border-color: var(--accent-color, #007bff);
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
        }

        @media (max-width: 768px) {
          .notification-settings {
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

          .time-range-inputs {
            grid-template-columns: 1fr;
          }

          .keywords-input {
            flex-direction: column;
          }

          .add-keyword-btn {
            align-self: flex-start;
          }
        }
      `}</style>
    </div>
  );
}