'use client';

import React, { useState } from 'react';
import { useSettings } from '../../hooks/use-settings';
import { ThemeSettings } from '../../types/settings';

const PRESET_COLORS = [
  '#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8',
  '#6f42c1', '#fd7e14', '#e83e8c', '#20c997', '#6c757d'
];

const FONT_FAMILIES = [
  { value: 'system', label: 'System Default', preview: '-apple-system, BlinkMacSystemFont, "Segoe UI"' },
  { value: 'serif', label: 'Serif', preview: 'Georgia, "Times New Roman", serif' },
  { value: 'mono', label: 'Monospace', preview: '"SF Mono", Monaco, "Cascadia Code"' },
];

export function ThemeSettingsPanel() {
  const { settings, updateSettings } = useSettings();
  const { theme } = settings;
  const [customColor, setCustomColor] = useState('');
  const [cssError, setCssError] = useState('');

  const handleThemeUpdate = async (updates: Partial<ThemeSettings>) => {
    await updateSettings({
      theme: {
        ...theme,
        ...updates,
      },
    });
  };

  const handleCustomColorSubmit = () => {
    if (customColor.match(/^#[0-9A-Fa-f]{6}$/)) {
      handleThemeUpdate({ accentColor: customColor });
      setCustomColor('');
    }
  };

  const validateCSS = (css: string) => {
    try {
      // Create a temporary style element to validate CSS
      const tempStyle = document.createElement('style');
      tempStyle.textContent = css;
      document.head.appendChild(tempStyle);
      document.head.removeChild(tempStyle);
      setCssError('');
      return true;
    } catch (error) {
      setCssError('Invalid CSS syntax');
      return false;
    }
  };

  const handleCustomCSSChange = (css: string) => {
    if (!css || validateCSS(css)) {
      handleThemeUpdate({ customCSS: css });
    }
  };

  return (
    <div className="theme-settings">
      <header className="panel-header">
        <h2>Appearance Settings</h2>
        <p>Customize the visual appearance of your chat interface with themes, colors, and fonts.</p>
      </header>

      <div className="settings-sections">
        {/* Theme Mode */}
        <section className="settings-section">
          <h3>Theme Mode</h3>
          
          <div className="theme-mode-selector">
            {[
              { value: 'light', label: 'Light', icon: '☀️', description: 'Light theme for bright environments' },
              { value: 'dark', label: 'Dark', icon: '🌙', description: 'Dark theme for low-light environments' },
              { value: 'auto', label: 'Auto', icon: '🔄', description: 'Follow system preference' },
            ].map((mode) => (
              <label key={mode.value} className={`theme-mode-option ${theme.mode === mode.value ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="themeMode"
                  value={mode.value}
                  checked={theme.mode === mode.value}
                  onChange={(e) => handleThemeUpdate({ mode: e.target.value as 'light' | 'dark' | 'auto' })}
                  className="mode-radio"
                />
                <div className="mode-content">
                  <span className="mode-icon">{mode.icon}</span>
                  <div className="mode-info">
                    <span className="mode-label">{mode.label}</span>
                    <span className="mode-description">{mode.description}</span>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* Accent Color */}
        <section className="settings-section">
          <h3>Accent Color</h3>
          <p className="section-description">
            Choose a color that will be used for highlights, buttons, and interactive elements.
          </p>

          <div className="color-selection">
            <div className="preset-colors">
              <h4>Preset Colors</h4>
              <div className="color-grid">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    className={`color-option ${theme.accentColor === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleThemeUpdate({ accentColor: color })}
                    aria-label={`Select color ${color}`}
                    type="button"
                  >
                    {theme.accentColor === color && <span className="check-icon">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="custom-color">
              <h4>Custom Color</h4>
              <div className="custom-color-input">
                <input
                  type="color"
                  value={customColor || theme.accentColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="color-picker"
                />
                <input
                  type="text"
                  placeholder="#007bff"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="color-text-input"
                />
                <button
                  onClick={handleCustomColorSubmit}
                  disabled={!customColor.match(/^#[0-9A-Fa-f]{6}$/)}
                  className="apply-color-btn"
                  type="button"
                >
                  Apply
                </button>
              </div>
              <div className="current-color-display">
                <span>Current: </span>
                <div className="color-preview" style={{ backgroundColor: theme.accentColor }}></div>
                <code>{theme.accentColor}</code>
              </div>
            </div>
          </div>
        </section>

        {/* Font Settings */}
        <section className="settings-section">
          <h3>Font Settings</h3>

          <div className="setting-group">
            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Font Size</span>
                <span className="setting-description">
                  Adjust the base font size for better readability
                </span>
              </div>
              <div className="font-size-controls">
                {[
                  { value: 'small', label: 'Small', size: '14px' },
                  { value: 'medium', label: 'Medium', size: '16px' },
                  { value: 'large', label: 'Large', size: '18px' },
                ].map((size) => (
                  <button
                    key={size.value}
                    className={`size-option ${theme.fontSize === size.value ? 'selected' : ''}`}
                    onClick={() => handleThemeUpdate({ fontSize: size.value as 'small' | 'medium' | 'large' })}
                    type="button"
                  >
                    <span style={{ fontSize: size.size }}>{size.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Font Family</span>
                <span className="setting-description">
                  Choose a font family that suits your preference
                </span>
              </div>
              <select
                value={theme.fontFamily}
                onChange={(e) => handleThemeUpdate({ fontFamily: e.target.value as 'system' | 'serif' | 'mono' })}
                className="font-family-select"
              >
                {FONT_FAMILIES.map((font) => (
                  <option key={font.value} value={font.value}>
                    {font.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="font-preview">
              <h4>Preview</h4>
              <div 
                className="preview-text"
                style={{
                  fontSize: { small: '14px', medium: '16px', large: '18px' }[theme.fontSize],
                  fontFamily: FONT_FAMILIES.find(f => f.value === theme.fontFamily)?.preview || 'inherit'
                }}
              >
                The quick brown fox jumps over the lazy dog. 0123456789
              </div>
            </div>
          </div>
        </section>

        {/* Chat Appearance */}
        <section className="settings-section">
          <h3>Chat Appearance</h3>

          <div className="setting-group">
            <label className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Show Timestamps</span>
                <span className="setting-description">
                  Display timestamps next to messages
                </span>
              </div>
              <input
                type="checkbox"
                checked={theme.showTimestamps}
                onChange={(e) => handleThemeUpdate({ showTimestamps: e.target.checked })}
                className="setting-toggle"
              />
            </label>

            {theme.showTimestamps && (
              <div className="timestamp-format-setting">
                <div className="setting-info">
                  <span className="setting-title">Timestamp Format</span>
                  <span className="setting-description">Choose 12-hour or 24-hour format</span>
                </div>
                <div className="timestamp-options">
                  <label className="timestamp-option">
                    <input
                      type="radio"
                      name="timestampFormat"
                      value="12h"
                      checked={theme.timestampFormat === '12h'}
                      onChange={(e) => handleThemeUpdate({ timestampFormat: e.target.value as '12h' | '24h' })}
                    />
                    <span>12-hour (2:30 PM)</span>
                  </label>
                  <label className="timestamp-option">
                    <input
                      type="radio"
                      name="timestampFormat"
                      value="24h"
                      checked={theme.timestampFormat === '24h'}
                      onChange={(e) => handleThemeUpdate({ timestampFormat: e.target.value as '12h' | '24h' })}
                    />
                    <span>24-hour (14:30)</span>
                  </label>
                </div>
              </div>
            )}

            <label className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Show Avatars</span>
                <span className="setting-description">
                  Display user avatars next to messages
                </span>
              </div>
              <input
                type="checkbox"
                checked={theme.showAvatars}
                onChange={(e) => handleThemeUpdate({ showAvatars: e.target.checked })}
                className="setting-toggle"
              />
            </label>

            <label className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Compact Mode</span>
                <span className="setting-description">
                  Reduce spacing between messages for denser layout
                </span>
              </div>
              <input
                type="checkbox"
                checked={theme.compactMode}
                onChange={(e) => handleThemeUpdate({ compactMode: e.target.checked })}
                className="setting-toggle"
              />
            </label>

            <label className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Show Read Receipts</span>
                <span className="setting-description">
                  Display read receipt indicators
                </span>
              </div>
              <input
                type="checkbox"
                checked={theme.showReadReceipts}
                onChange={(e) => handleThemeUpdate({ showReadReceipts: e.target.checked })}
                className="setting-toggle"
              />
            </label>

            <label className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Group Messages</span>
                <span className="setting-description">
                  Group consecutive messages from the same user
                </span>
              </div>
              <input
                type="checkbox"
                checked={theme.messageGrouping}
                onChange={(e) => handleThemeUpdate({ messageGrouping: e.target.checked })}
                className="setting-toggle"
              />
            </label>

            <label className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Message Reactions</span>
                <span className="setting-description">
                  Show emoji reactions on messages
                </span>
              </div>
              <input
                type="checkbox"
                checked={theme.showMessageReactions}
                onChange={(e) => handleThemeUpdate({ showMessageReactions: e.target.checked })}
                className="setting-toggle"
              />
            </label>

            <label className="setting-item">
              <div className="setting-info">
                <span className="setting-title">Animated Emojis</span>
                <span className="setting-description">
                  Enable animations for emojis and reactions
                </span>
              </div>
              <input
                type="checkbox"
                checked={theme.animatedEmojis}
                onChange={(e) => handleThemeUpdate({ animatedEmojis: e.target.checked })}
                className="setting-toggle"
              />
            </label>
          </div>
        </section>

        {/* Custom CSS */}
        <section className="settings-section">
          <h3>Custom CSS</h3>
          <p className="section-description">
            Add your own custom CSS to further customize the interface. Use with caution.
          </p>

          <div className="custom-css-editor">
            <textarea
              value={theme.customCSS}
              onChange={(e) => handleCustomCSSChange(e.target.value)}
              placeholder="/* Add your custom CSS here */&#10;.message-container {&#10;  border-radius: 12px;&#10;}"
              className="css-textarea"
              rows={8}
            />
            {cssError && <div className="css-error">{cssError}</div>}
            
            <div className="css-tips">
              <h4>💡 Tips:</h4>
              <ul>
                <li>Use CSS custom properties like <code>var(--accent-color)</code> for consistent theming</li>
                <li>Target specific elements with classes like <code>.message-container</code>, <code>.user-avatar</code></li>
                <li>Changes apply instantly but may require a page refresh for some elements</li>
                <li>Invalid CSS will be ignored and an error shown</li>
              </ul>
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        .theme-settings {
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

        .theme-mode-selector {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .theme-mode-option {
          display: block;
          cursor: pointer;
        }

        .mode-radio {
          display: none;
        }

        .mode-content {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          border: 2px solid var(--border-color, #e9ecef);
          border-radius: 8px;
          background: var(--background-primary, #ffffff);
          transition: all 0.2s;
        }

        .theme-mode-option.selected .mode-content {
          border-color: var(--accent-color, #007bff);
          background: rgba(0, 123, 255, 0.05);
        }

        .mode-content:hover {
          border-color: var(--accent-color, #007bff);
        }

        .mode-icon {
          font-size: 24px;
          line-height: 1;
        }

        .mode-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .mode-label {
          font-weight: 500;
          font-size: 15px;
          color: var(--text-primary, #2c3e50);
        }

        .mode-description {
          font-size: 13px;
          color: var(--text-secondary, #6c757d);
          line-height: 1.4;
        }

        .color-selection {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .color-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
          gap: 12px;
          max-width: 400px;
        }

        .color-option {
          width: 50px;
          height: 50px;
          border: 3px solid transparent;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          position: relative;
        }

        .color-option:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .color-option.selected {
          border-color: var(--text-primary, #2c3e50);
          box-shadow: 0 0 0 2px var(--background-primary, #ffffff);
        }

        .check-icon {
          color: white;
          font-size: 18px;
          font-weight: bold;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        .custom-color-input {
          display: flex;
          gap: 8px;
          align-items: center;
          margin-bottom: 12px;
        }

        .color-picker {
          width: 50px;
          height: 40px;
          border: 1px solid var(--border-color, #ced4da);
          border-radius: 4px;
          cursor: pointer;
          background: none;
          padding: 0;
        }

        .color-text-input {
          padding: 8px 12px;
          border: 1px solid var(--border-color, #ced4da);
          border-radius: 4px;
          font-family: monospace;
          font-size: 14px;
          width: 100px;
        }

        .apply-color-btn {
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

        .apply-color-btn:disabled {
          background: var(--background-tertiary, #dee2e6);
          cursor: not-allowed;
        }

        .apply-color-btn:hover:not(:disabled) {
          background: #0056b3;
        }

        .current-color-display {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: var(--text-secondary, #6c757d);
        }

        .color-preview {
          width: 20px;
          height: 20px;
          border-radius: 4px;
          border: 1px solid var(--border-color, #ced4da);
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

        .font-size-controls {
          display: flex;
          gap: 8px;
        }

        .size-option {
          padding: 8px 12px;
          border: 1px solid var(--border-color, #ced4da);
          border-radius: 4px;
          background: var(--background-primary, #ffffff);
          cursor: pointer;
          transition: all 0.2s;
        }

        .size-option.selected {
          background: var(--accent-color, #007bff);
          color: white;
          border-color: var(--accent-color, #007bff);
        }

        .font-family-select {
          padding: 8px 12px;
          border: 1px solid var(--border-color, #ced4da);
          border-radius: 4px;
          background: white;
          font-size: 14px;
          min-width: 150px;
          cursor: pointer;
        }

        .font-preview {
          margin-top: 16px;
          padding: 16px;
          background: var(--background-primary, #ffffff);
          border-radius: 6px;
          border: 1px solid var(--border-light, #f1f3f4);
        }

        .preview-text {
          margin-top: 8px;
          padding: 12px;
          background: var(--background-secondary, #f8f9fa);
          border-radius: 4px;
          color: var(--text-primary, #2c3e50);
        }

        .timestamp-format-setting {
          margin-left: 16px;
          padding-left: 16px;
          border-left: 2px solid var(--border-color, #e9ecef);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
        }

        .timestamp-options {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .timestamp-option {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 14px;
        }

        .custom-css-editor {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .css-textarea {
          width: 100%;
          min-height: 200px;
          padding: 12px;
          border: 1px solid var(--border-color, #ced4da);
          border-radius: 4px;
          font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', monospace;
          font-size: 13px;
          line-height: 1.5;
          resize: vertical;
        }

        .css-textarea:focus {
          outline: none;
          border-color: var(--accent-color, #007bff);
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
        }

        .css-error {
          color: #dc3545;
          font-size: 13px;
          font-weight: 500;
        }

        .css-tips {
          background: var(--background-primary, #ffffff);
          border: 1px solid var(--border-color, #e9ecef);
          border-radius: 6px;
          padding: 16px;
        }

        .css-tips ul {
          margin: 8px 0 0 0;
          padding-left: 20px;
        }

        .css-tips li {
          margin-bottom: 6px;
          font-size: 13px;
          line-height: 1.4;
          color: var(--text-secondary, #6c757d);
        }

        .css-tips code {
          background: var(--background-secondary, #f8f9fa);
          padding: 2px 4px;
          border-radius: 3px;
          font-size: 12px;
          color: var(--text-primary, #2c3e50);
        }

        @media (max-width: 768px) {
          .theme-mode-selector {
            grid-template-columns: 1fr;
          }

          .color-grid {
            grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
          }

          .color-option {
            width: 40px;
            height: 40px;
          }

          .custom-color-input {
            flex-direction: column;
            align-items: flex-start;
          }

          .setting-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }

          .timestamp-format-setting {
            margin-left: 0;
            padding-left: 0;
            border-left: none;
            flex-direction: column;
          }

          .font-size-controls {
            justify-content: flex-start;
          }
        }
      `}</style>
    </div>
  );
}