'use client';

import React, { useState } from 'react';
import { useSettings } from '../../hooks/use-settings';
import { AccessibilitySettings } from '../../types/settings';

interface KeyboardShortcut {
  id: string;
  label: string;
  description: string;
  defaultKey: string;
  category: 'navigation' | 'messaging' | 'rooms' | 'general';
}

const DEFAULT_SHORTCUTS: KeyboardShortcut[] = [
  // Navigation
  { id: 'focus_composer', label: 'Focus Message Input', description: 'Focus the message composition area', defaultKey: 'Ctrl+K', category: 'messaging' },
  { id: 'send_message', label: 'Send Message', description: 'Send the current message', defaultKey: 'Ctrl+Enter', category: 'messaging' },
  { id: 'next_room', label: 'Next Room', description: 'Switch to the next room', defaultKey: 'Ctrl+ArrowDown', category: 'navigation' },
  { id: 'prev_room', label: 'Previous Room', description: 'Switch to the previous room', defaultKey: 'Ctrl+ArrowUp', category: 'navigation' },
  { id: 'search_rooms', label: 'Search Rooms', description: 'Open room search', defaultKey: 'Ctrl+Shift+K', category: 'rooms' },
  { id: 'toggle_sidebar', label: 'Toggle Sidebar', description: 'Show/hide the room list sidebar', defaultKey: 'Ctrl+Shift+S', category: 'navigation' },
  { id: 'open_settings', label: 'Open Settings', description: 'Open the settings panel', defaultKey: 'Ctrl+,', category: 'general' },
  { id: 'escape', label: 'Escape', description: 'Cancel current action or close dialogs', defaultKey: 'Escape', category: 'general' },
];

export function AccessibilitySettingsPanel() {
  const { settings, updateSettings } = useSettings();
  const { accessibility } = settings;
  const [editingShortcut, setEditingShortcut] = useState<string | null>(null);
  const [shortcutInput, setShortcutInput] = useState('');

  const handleAccessibilityUpdate = async (updates: Partial<AccessibilitySettings>) => {
    await updateSettings({
      accessibility: {
        ...accessibility,
        ...updates,
      },
    });
  };

  const getCurrentShortcuts = () => {
    const shortcuts: Record<string, string> = {};
    DEFAULT_SHORTCUTS.forEach(shortcut => {
      shortcuts[shortcut.id] = accessibility.customKeyboardShortcuts[shortcut.id] || shortcut.defaultKey;
    });
    return shortcuts;
  };

  const updateShortcut = (shortcutId: string, key: string) => {
    handleAccessibilityUpdate({
      customKeyboardShortcuts: {
        ...accessibility.customKeyboardShortcuts,
        [shortcutId]: key,
      },
    });
  };

  const resetShortcut = (shortcutId: string) => {
    const { [shortcutId]: removed, ...remaining } = accessibility.customKeyboardShortcuts;
    handleAccessibilityUpdate({
      customKeyboardShortcuts: remaining,
    });
  };

  const handleKeyCapture = (e: React.KeyboardEvent) => {
    e.preventDefault();
    
    const modifiers = [];
    if (e.ctrlKey) modifiers.push('Ctrl');
    if (e.altKey) modifiers.push('Alt');
    if (e.shiftKey) modifiers.push('Shift');
    if (e.metaKey) modifiers.push('Meta');
    
    let key = e.key;
    if (key === ' ') key = 'Space';
    if (key.startsWith('Arrow')) key = key.replace('Arrow', '');
    
    const shortcut = modifiers.length > 0 ? `${modifiers.join('+')}+${key}` : key;
    setShortcutInput(shortcut);
  };

  const saveShortcut = () => {
    if (editingShortcut && shortcutInput) {
      updateShortcut(editingShortcut, shortcutInput);
      setEditingShortcut(null);
      setShortcutInput('');
    }
  };

  const cancelShortcutEdit = () => {
    setEditingShortcut(null);
    setShortcutInput('');
  };

  const groupedShortcuts = DEFAULT_SHORTCUTS.reduce((groups, shortcut) => {
    if (!groups[shortcut.category]) {
      groups[shortcut.category] = [];
    }
    groups[shortcut.category].push(shortcut);
    return groups;
  }, {} as Record<string, KeyboardShortcut[]>);

  return (
    <div className="accessibility-settings">
      <header className="panel-header">
        <h2>Accessibility Settings</h2>
        <p>Configure accessibility features to improve your chat experience with screen readers, keyboard navigation, and visual enhancements.</p>
      </header>

      <div className="settings-sections">
        {/* Screen Reader Support */}
        <section className="settings-section">
          <h3>🔊 Screen Reader Support</h3>
          <p className="section-description">
            Enhance compatibility with screen readers and assistive technologies.
          </p>

          <div className="setting-group">
            <label className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Enable Screen Reader Support</span>
                <span className="setting-description">
                  Optimize interface for screen readers with ARIA labels and live regions
                </span>
              </div>
              <input
                type="checkbox"
                checked={accessibility.enableScreenReader}
                onChange={(e) => handleAccessibilityUpdate({ enableScreenReader: e.target.checked })}
                className="setting-toggle"
              />
            </label>

            <label className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Announce Room Changes</span>
                <span className="setting-description">
                  Announce when switching between rooms or channels
                </span>
                <div className="setting-dependency">
                  {!accessibility.enableScreenReader && (
                    <span className="dependency-note">Requires screen reader support</span>
                  )}
                </div>
              </div>
              <input
                type="checkbox"
                checked={accessibility.announceRoomChanges && accessibility.enableScreenReader}
                disabled={!accessibility.enableScreenReader}
                onChange={(e) => handleAccessibilityUpdate({ announceRoomChanges: e.target.checked })}
                className="setting-toggle"
              />
            </label>

            <label className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Announce New Messages</span>
                <span className="setting-description">
                  Announce new messages as they arrive in real-time
                </span>
                <div className="setting-dependency">
                  {!accessibility.enableScreenReader && (
                    <span className="dependency-note">Requires screen reader support</span>
                  )}
                </div>
              </div>
              <input
                type="checkbox"
                checked={accessibility.announceNewMessages && accessibility.enableScreenReader}
                disabled={!accessibility.enableScreenReader}
                onChange={(e) => handleAccessibilityUpdate({ announceNewMessages: e.target.checked })}
                className="setting-toggle"
              />
            </label>
          </div>
        </section>

        {/* Keyboard Navigation */}
        <section className="settings-section">
          <h3>⌨️ Keyboard Navigation</h3>
          <p className="section-description">
            Configure keyboard shortcuts and navigation preferences.
          </p>

          <div className="setting-group">
            <label className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Enable Keyboard Shortcuts</span>
                <span className="setting-description">
                  Use keyboard shortcuts for faster navigation and actions
                </span>
              </div>
              <input
                type="checkbox"
                checked={accessibility.enableKeyboardShortcuts}
                onChange={(e) => handleAccessibilityUpdate({ enableKeyboardShortcuts: e.target.checked })}
                className="setting-toggle"
              />
            </label>
          </div>

          {accessibility.enableKeyboardShortcuts && (
            <div className="keyboard-shortcuts">
              <h4>Customize Keyboard Shortcuts</h4>
              
              {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
                <div key={category} className="shortcut-category">
                  <h5 className="category-title">
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </h5>
                  
                  <div className="shortcuts-list">
                    {shortcuts.map((shortcut) => {
                      const currentKey = getCurrentShortcuts()[shortcut.id];
                      const isDefault = currentKey === shortcut.defaultKey;
                      const isEditing = editingShortcut === shortcut.id;
                      
                      return (
                        <div key={shortcut.id} className="shortcut-item">
                          <div className="shortcut-info">
                            <span className="shortcut-label">{shortcut.label}</span>
                            <span className="shortcut-description">{shortcut.description}</span>
                          </div>
                          
                          <div className="shortcut-controls">
                            {isEditing ? (
                              <div className="shortcut-edit">
                                <input
                                  type="text"
                                  value={shortcutInput}
                                  onChange={(e) => setShortcutInput(e.target.value)}
                                  onKeyDown={handleKeyCapture}
                                  placeholder="Press keys..."
                                  className="shortcut-input"
                                  autoFocus
                                />
                                <button onClick={saveShortcut} className="save-shortcut-btn" type="button">
                                  Save
                                </button>
                                <button onClick={cancelShortcutEdit} className="cancel-shortcut-btn" type="button">
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="shortcut-display">
                                <kbd className="shortcut-key">{currentKey}</kbd>
                                <button
                                  onClick={() => {
                                    setEditingShortcut(shortcut.id);
                                    setShortcutInput(currentKey);
                                  }}
                                  className="edit-shortcut-btn"
                                  type="button"
                                >
                                  Edit
                                </button>
                                {!isDefault && (
                                  <button
                                    onClick={() => resetShortcut(shortcut.id)}
                                    className="reset-shortcut-btn"
                                    type="button"
                                  >
                                    Reset
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Visual Accessibility */}
        <section className="settings-section">
          <h3>👁️ Visual Accessibility</h3>
          <p className="section-description">
            Adjust visual elements for better visibility and reduced eye strain.
          </p>

          <div className="setting-group">
            <label className="setting-item">
              <div className="setting-info">
                <span className="setting-title">High Contrast Mode</span>
                <span className="setting-description">
                  Increase contrast between text and background colors
                </span>
              </div>
              <input
                type="checkbox"
                checked={accessibility.highContrast}
                onChange={(e) => handleAccessibilityUpdate({ highContrast: e.target.checked })}
                className="setting-toggle"
              />
            </label>

            <label className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Reduce Motion</span>
                <span className="setting-description">
                  Minimize animations and transitions for motion sensitivity
                </span>
              </div>
              <input
                type="checkbox"
                checked={accessibility.reduceMotion}
                onChange={(e) => handleAccessibilityUpdate({ reduceMotion: e.target.checked })}
                className="setting-toggle"
              />
            </label>

            <label className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Large Click Targets</span>
                <span className="setting-description">
                  Make buttons and interactive elements larger for easier clicking
                </span>
              </div>
              <input
                type="checkbox"
                checked={accessibility.largeClickTargets}
                onChange={(e) => handleAccessibilityUpdate({ largeClickTargets: e.target.checked })}
                className="setting-toggle"
              />
            </label>
          </div>

          <div className="contrast-preview">
            <h4>Visual Preview</h4>
            <div className={`preview-content ${accessibility.highContrast ? 'high-contrast' : ''}`}>
              <div className="preview-message">
                <div className="message-avatar">👤</div>
                <div className="message-content">
                  <div className="message-header">
                    <span className="message-sender">John Doe</span>
                    <span className="message-time">12:34 PM</span>
                  </div>
                  <div className="message-text">
                    This is how messages will appear with your current accessibility settings.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Audio Accessibility */}
        <section className="settings-section">
          <h3>🔊 Audio Accessibility</h3>
          <p className="section-description">
            Configure audio cues and descriptions for better accessibility.
          </p>

          <div className="setting-group">
            <label className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Audio Descriptions</span>
                <span className="setting-description">
                  Provide audio descriptions for visual content like images
                </span>
              </div>
              <input
                type="checkbox"
                checked={accessibility.audioDescriptions}
                onChange={(e) => handleAccessibilityUpdate({ audioDescriptions: e.target.checked })}
                className="setting-toggle"
              />
            </label>

            <label className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Enable Sound Cues</span>
                <span className="setting-description">
                  Play sounds for interface actions and notifications
                </span>
              </div>
              <input
                type="checkbox"
                checked={accessibility.enableSoundCues}
                onChange={(e) => handleAccessibilityUpdate({ enableSoundCues: e.target.checked })}
                className="setting-toggle"
              />
            </label>
          </div>
        </section>

        {/* Accessibility Status */}
        <section className="settings-section accessibility-status">
          <h3>✅ Accessibility Status</h3>
          <p className="section-description">
            Overview of your current accessibility configuration.
          </p>

          <div className="status-grid">
            <div className={`status-item ${accessibility.enableScreenReader ? 'enabled' : 'disabled'}`}>
              <div className="status-icon">
                {accessibility.enableScreenReader ? '✅' : '❌'}
              </div>
              <div className="status-content">
                <span className="status-label">Screen Reader</span>
                <span className="status-description">
                  {accessibility.enableScreenReader ? 'Enabled with announcements' : 'Disabled'}
                </span>
              </div>
            </div>

            <div className={`status-item ${accessibility.enableKeyboardShortcuts ? 'enabled' : 'disabled'}`}>
              <div className="status-icon">
                {accessibility.enableKeyboardShortcuts ? '✅' : '❌'}
              </div>
              <div className="status-content">
                <span className="status-label">Keyboard Navigation</span>
                <span className="status-description">
                  {accessibility.enableKeyboardShortcuts ? `${DEFAULT_SHORTCUTS.length} shortcuts available` : 'Disabled'}
                </span>
              </div>
            </div>

            <div className={`status-item ${accessibility.highContrast ? 'enabled' : 'disabled'}`}>
              <div className="status-icon">
                {accessibility.highContrast ? '✅' : '❌'}
              </div>
              <div className="status-content">
                <span className="status-label">High Contrast</span>
                <span className="status-description">
                  {accessibility.highContrast ? 'Enhanced contrast enabled' : 'Standard contrast'}
                </span>
              </div>
            </div>

            <div className={`status-item ${accessibility.reduceMotion ? 'enabled' : 'disabled'}`}>
              <div className="status-icon">
                {accessibility.reduceMotion ? '✅' : '❌'}
              </div>
              <div className="status-content">
                <span className="status-label">Reduced Motion</span>
                <span className="status-description">
                  {accessibility.reduceMotion ? 'Animations minimized' : 'Full animations'}
                </span>
              </div>
            </div>
          </div>

          <div className="accessibility-score">
            {(() => {
              const enabledFeatures = [
                accessibility.enableScreenReader,
                accessibility.enableKeyboardShortcuts,
                accessibility.highContrast,
                accessibility.reduceMotion,
                accessibility.largeClickTargets,
                accessibility.enableSoundCues
              ].filter(Boolean).length;

              return (
                <div className="score-summary">
                  <span className="score-text">
                    {enabledFeatures}/6 accessibility features enabled
                  </span>
                  <div className="score-bar">
                    <div 
                      className="score-fill" 
                      style={{ width: `${(enabledFeatures / 6) * 100}%` }}
                    ></div>
                  </div>
                </div>
              );
            })()}
          </div>
        </section>
      </div>

      <style jsx>{`
        .accessibility-settings {
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

        .accessibility-status {
          background: rgba(40, 167, 69, 0.05);
          border-color: rgba(40, 167, 69, 0.2);
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

        .settings-section h5 {
          margin: 0 0 8px 0;
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary, #2c3e50);
          text-transform: uppercase;
          letter-spacing: 0.5px;
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

        .keyboard-shortcuts {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid var(--border-light, #f1f3f4);
        }

        .shortcut-category {
          margin-bottom: 24px;
        }

        .category-title {
          color: var(--accent-color, #007bff);
          margin-bottom: 12px;
        }

        .shortcuts-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .shortcut-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          background: var(--background-primary, #ffffff);
          border: 1px solid var(--border-color, #e9ecef);
          border-radius: 6px;
        }

        .shortcut-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .shortcut-label {
          font-weight: 500;
          font-size: 14px;
          color: var(--text-primary, #2c3e50);
        }

        .shortcut-description {
          font-size: 12px;
          color: var(--text-secondary, #6c757d);
        }

        .shortcut-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .shortcut-display {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .shortcut-key {
          background: var(--background-tertiary, #dee2e6);
          padding: 4px 8px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 12px;
          font-weight: 500;
          color: var(--text-primary, #2c3e50);
          border: 1px solid var(--border-color, #ced4da);
        }

        .shortcut-edit {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .shortcut-input {
          padding: 4px 8px;
          border: 1px solid var(--accent-color, #007bff);
          border-radius: 4px;
          font-family: monospace;
          font-size: 12px;
          width: 120px;
        }

        .edit-shortcut-btn,
        .save-shortcut-btn {
          padding: 4px 8px;
          background: var(--accent-color, #007bff);
          color: white;
          border: none;
          border-radius: 3px;
          font-size: 11px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .edit-shortcut-btn:hover,
        .save-shortcut-btn:hover {
          background: #0056b3;
        }

        .reset-shortcut-btn,
        .cancel-shortcut-btn {
          padding: 4px 8px;
          background: var(--background-tertiary, #dee2e6);
          color: var(--text-primary, #2c3e50);
          border: none;
          border-radius: 3px;
          font-size: 11px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .reset-shortcut-btn:hover,
        .cancel-shortcut-btn:hover {
          background: #c6c8ca;
        }

        .contrast-preview {
          margin-top: 20px;
        }

        .preview-content {
          padding: 16px;
          background: var(--background-primary, #ffffff);
          border: 1px solid var(--border-color, #e9ecef);
          border-radius: 6px;
        }

        .preview-content.high-contrast {
          background: #000000;
          color: #ffffff;
          border-color: #ffffff;
        }

        .preview-message {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .message-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--accent-color, #007bff);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
        }

        .high-contrast .message-avatar {
          background: #ffffff;
          color: #000000;
        }

        .message-content {
          flex-grow: 1;
        }

        .message-header {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin-bottom: 4px;
        }

        .message-sender {
          font-weight: 600;
          font-size: 14px;
          color: var(--text-primary, #2c3e50);
        }

        .high-contrast .message-sender {
          color: #ffffff;
        }

        .message-time {
          font-size: 12px;
          color: var(--text-secondary, #6c757d);
        }

        .high-contrast .message-time {
          color: #cccccc;
        }

        .message-text {
          font-size: 14px;
          color: var(--text-primary, #2c3e50);
          line-height: 1.4;
        }

        .high-contrast .message-text {
          color: #ffffff;
        }

        .status-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
        }

        .status-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: var(--background-primary, #ffffff);
          border: 1px solid var(--border-color, #e9ecef);
          border-radius: 6px;
        }

        .status-item.enabled {
          border-color: rgba(40, 167, 69, 0.3);
          background: rgba(40, 167, 69, 0.05);
        }

        .status-icon {
          font-size: 20px;
          flex-shrink: 0;
        }

        .status-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .status-label {
          font-weight: 500;
          font-size: 14px;
          color: var(--text-primary, #2c3e50);
        }

        .status-description {
          font-size: 12px;
          color: var(--text-secondary, #6c757d);
        }

        .accessibility-score {
          margin-top: 20px;
          padding: 16px;
          background: var(--background-primary, #ffffff);
          border: 1px solid var(--border-color, #e9ecef);
          border-radius: 6px;
        }

        .score-summary {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .score-text {
          font-weight: 500;
          font-size: 14px;
          color: var(--text-primary, #2c3e50);
        }

        .score-bar {
          height: 8px;
          background: var(--background-tertiary, #dee2e6);
          border-radius: 4px;
          overflow: hidden;
        }

        .score-fill {
          height: 100%;
          background: linear-gradient(90deg, #28a745 0%, #20c997 100%);
          transition: width 0.3s ease;
        }

        @media (max-width: 768px) {
          .accessibility-settings {
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

          .shortcut-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .shortcut-edit {
            flex-wrap: wrap;
          }

          .shortcut-input {
            width: 100%;
          }

          .status-grid {
            grid-template-columns: 1fr;
          }

          .preview-message {
            flex-direction: column;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
}