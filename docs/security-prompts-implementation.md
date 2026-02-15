# Security Prompts Implementation Guide

## Overview
This guide provides practical implementation details, code examples, and integration patterns for the security prompts system.

## Core Components

### 1. Security Prompt Component (React/Vue/Angular)

#### React Implementation
```jsx
import React, { useState, useEffect } from 'react';
import { validatePassword, logSecurityEvent } from './security-utils';

const SecurityPrompt = ({
  level = 1,
  action,
  target,
  confirmationText,
  requires2FA = false,
  onConfirm,
  onCancel,
  visible = false
}) => {
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [twoFACode, setTwoFACode] = useState('');
  const [acknowledgments, setAcknowledgments] = useState({});
  const [isValidating, setIsValidating] = useState(false);

  const handleConfirm = async () => {
    setIsValidating(true);
    
    try {
      // Validate password
      const passwordValid = await validatePassword(password);
      if (!passwordValid) {
        throw new Error('Invalid password');
      }

      // Validate confirmation text if required
      if (confirmationText && confirmText !== confirmationText) {
        throw new Error(`Please type "${confirmationText}" to confirm`);
      }

      // Validate 2FA if required
      if (requires2FA && !twoFACode) {
        throw new Error('Two-factor authentication code required');
      }

      // Log security event
      await logSecurityEvent({
        action,
        target,
        level,
        status: 'confirmed',
        method: requires2FA ? 'password_2fa' : 'password'
      });

      onConfirm?.();
    } catch (error) {
      await logSecurityEvent({
        action,
        target,
        level,
        status: 'failed',
        error: error.message
      });
      alert(error.message);
    } finally {
      setIsValidating(false);
    }
  };

  const handleCancel = () => {
    logSecurityEvent({
      action,
      target,
      level,
      status: 'cancelled'
    });
    onCancel?.();
  };

  if (!visible) return null;

  return (
    <div className="security-prompt-overlay">
      <div className={`security-prompt level-${level}`}>
        <div className="prompt-header">
          {level === 3 && <span className="icon">🚨</span>}
          {level === 2 && <span className="icon">⚠️</span>}
          {level === 1 && <span className="icon">🔐</span>}
          <h2>
            {level === 3 ? 'Critical Action Verification' : 
             level === 2 ? 'Enhanced Confirmation Required' : 
             'Authentication Required'}
          </h2>
        </div>

        <div className="prompt-body">
          <p className="action-description">
            You are about to {action}
            {target && <><br/><strong>{target}</strong></>}
          </p>

          {level >= 2 && (
            <div className="warning-section">
              <p className="warning-text">
                This action cannot be undone and may have significant consequences.
              </p>
            </div>
          )}

          <div className="input-section">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {confirmationText && (
            <div className="input-section">
              <label htmlFor="confirm-text">
                Type "{confirmationText}" to confirm:
              </label>
              <input
                type="text"
                id="confirm-text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={confirmationText}
                required
              />
            </div>
          )}

          {requires2FA && (
            <div className="input-section">
              <label htmlFor="two-fa">Two-Factor Code:</label>
              <input
                type="text"
                id="two-fa"
                value={twoFACode}
                onChange={(e) => setTwoFACode(e.target.value)}
                maxLength="6"
                required
              />
            </div>
          )}

          {level >= 2 && (
            <div className="acknowledgment-section">
              <label>
                <input
                  type="checkbox"
                  checked={acknowledgments.understanding || false}
                  onChange={(e) => setAcknowledgments({
                    ...acknowledgments,
                    understanding: e.target.checked
                  })}
                />
                I understand this action is irreversible
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={acknowledgments.consequences || false}
                  onChange={(e) => setAcknowledgments({
                    ...acknowledgments,
                    consequences: e.target.checked
                  })}
                />
                I have reviewed the consequences
              </label>
            </div>
          )}
        </div>

        <div className="prompt-footer">
          <button
            type="button"
            onClick={handleCancel}
            className="btn-cancel"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isValidating}
            className="btn-confirm"
          >
            {isValidating ? 'Verifying...' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecurityPrompt;
```

### 2. Security Utilities

```javascript
// security-utils.js
import crypto from 'crypto';

export class SecurityManager {
  constructor(config = {}) {
    this.config = {
      sessionTimeout: 15 * 60 * 1000, // 15 minutes
      maxAttempts: 3,
      requireStrongPasswords: true,
      ...config
    };
  }

  async validatePassword(password, userId) {
    try {
      const response = await fetch('/api/auth/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, userId })
      });
      
      if (!response.ok) {
        throw new Error('Authentication failed');
      }
      
      return await response.json();
    } catch (error) {
      this.logSecurityEvent({
        type: 'authentication_failure',
        error: error.message,
        userId
      });
      throw error;
    }
  }

  async logSecurityEvent(event) {
    const logEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      sessionId: this.getSessionId(),
      userAgent: navigator.userAgent,
      ipAddress: await this.getClientIP(),
      ...event
    };

    try {
      await fetch('/api/security/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logEntry)
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
      // Store locally as fallback
      this.storeLocalSecurityLog(logEntry);
    }
  }

  validateConfirmationText(input, expected, caseSensitive = true) {
    if (!caseSensitive) {
      input = input.toLowerCase();
      expected = expected.toLowerCase();
    }
    return input === expected;
  }

  async requestTwoFactorCode(userId) {
    const response = await fetch('/api/auth/2fa/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    
    if (!response.ok) {
      throw new Error('Failed to send 2FA code');
    }
    
    return await response.json();
  }

  async validateTwoFactorCode(code, userId) {
    const response = await fetch('/api/auth/2fa/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, userId })
    });
    
    return response.ok;
  }

  getSessionId() {
    return sessionStorage.getItem('sessionId') || 'unknown';
  }

  async getClientIP() {
    try {
      const response = await fetch('/api/client-ip');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  }

  storeLocalSecurityLog(entry) {
    const logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
    logs.push(entry);
    localStorage.setItem('security_logs', JSON.stringify(logs.slice(-100))); // Keep last 100
  }
}

export const securityManager = new SecurityManager();
export const validatePassword = (password, userId) => securityManager.validatePassword(password, userId);
export const logSecurityEvent = (event) => securityManager.logSecurityEvent(event);
```

### 3. Hook for Easy Integration

```javascript
// useSecurityPrompt.js
import { useState, useCallback } from 'react';
import { securityManager } from './security-utils';

export const useSecurityPrompt = () => {
  const [promptState, setPromptState] = useState({
    visible: false,
    level: 1,
    action: '',
    target: '',
    confirmationText: '',
    requires2FA: false,
    onConfirm: null,
    onCancel: null
  });

  const showPrompt = useCallback(({
    level = 1,
    action,
    target = '',
    confirmationText = '',
    requires2FA = false,
    onConfirm,
    onCancel
  }) => {
    setPromptState({
      visible: true,
      level,
      action,
      target,
      confirmationText,
      requires2FA,
      onConfirm: () => {
        setPromptState(prev => ({ ...prev, visible: false }));
        onConfirm?.();
      },
      onCancel: () => {
        setPromptState(prev => ({ ...prev, visible: false }));
        onCancel?.();
      }
    });
  }, []);

  const hidePrompt = useCallback(() => {
    setPromptState(prev => ({ ...prev, visible: false }));
  }, []);

  return {
    promptState,
    showPrompt,
    hidePrompt
  };
};
```

## Usage Examples

### 1. Basic Usage
```javascript
import { useSecurityPrompt } from './hooks/useSecurityPrompt';

function UserManagement() {
  const { promptState, showPrompt } = useSecurityPrompt();

  const handleDeleteUser = (user) => {
    showPrompt({
      level: 2,
      action: 'permanently delete user',
      target: `${user.name} (${user.email})`,
      confirmationText: 'DELETE USER',
      onConfirm: () => {
        // Proceed with deletion
        deleteUser(user.id);
      },
      onCancel: () => {
        console.log('User deletion cancelled');
      }
    });
  };

  return (
    <>
      <UserList onDeleteUser={handleDeleteUser} />
      <SecurityPrompt {...promptState} />
    </>
  );
}
```

### 2. System Reset with Maximum Security
```javascript
const handleSystemReset = () => {
  showPrompt({
    level: 3,
    action: 'completely reset the system',
    target: 'ALL data, configurations, and customizations',
    confirmationText: 'RESET EVERYTHING',
    requires2FA: true,
    onConfirm: async () => {
      try {
        await systemReset();
        alert('System reset completed successfully');
      } catch (error) {
        alert('System reset failed: ' + error.message);
      }
    }
  });
};
```

### 3. Bulk Operations
```javascript
const handleBulkDelete = (selectedItems) => {
  showPrompt({
    level: 2,
    action: `delete ${selectedItems.length} items`,
    target: selectedItems.map(item => item.name).join(', '),
    confirmationText: 'DELETE ALL',
    onConfirm: () => {
      bulkDelete(selectedItems.map(item => item.id));
    }
  });
};
```

## Backend Integration

### 1. Authentication Endpoint
```javascript
// Express.js example
app.post('/api/auth/validate', async (req, res) => {
  try {
    const { password, userId } = req.body;
    
    // Rate limiting
    const attempts = await getFailedAttempts(userId);
    if (attempts >= 3) {
      return res.status(429).json({ 
        error: 'Too many failed attempts. Please try again later.' 
      });
    }

    // Validate password
    const user = await getUserById(userId);
    const isValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isValid) {
      await incrementFailedAttempts(userId);
      await logSecurityEvent({
        type: 'authentication_failure',
        userId,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Reset failed attempts on success
    await resetFailedAttempts(userId);
    
    await logSecurityEvent({
      type: 'authentication_success',
      userId,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({ valid: true });
    
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication service unavailable' });
  }
});
```

### 2. Security Event Logging
```javascript
app.post('/api/security/log', async (req, res) => {
  try {
    const event = {
      ...req.body,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    };

    await saveSecurityEvent(event);
    
    // Check for suspicious activity
    if (await detectSuspiciousActivity(event)) {
      await triggerSecurityAlert(event);
    }

    res.json({ logged: true });
    
  } catch (error) {
    console.error('Security logging error:', error);
    res.status(500).json({ error: 'Logging service unavailable' });
  }
});
```

## CSS Styles

```css
/* security-prompt.css */
.security-prompt-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.security-prompt {
  background: white;
  border-radius: 8px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  animation: slideIn 0.3s ease-out;
}

.security-prompt.level-1 {
  border-top: 4px solid #2196F3; /* Blue */
}

.security-prompt.level-2 {
  border-top: 4px solid #FF9800; /* Orange */
}

.security-prompt.level-3 {
  border-top: 4px solid #F44336; /* Red */
  background: #fff5f5;
}

.prompt-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  gap: 12px;
}

.prompt-header .icon {
  font-size: 24px;
}

.prompt-header h2 {
  margin: 0;
  color: #333;
}

.action-description {
  margin-bottom: 20px;
  font-size: 16px;
  line-height: 1.5;
}

.warning-section {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 20px;
}

.warning-text {
  margin: 0;
  color: #856404;
  font-weight: 500;
}

.input-section {
  margin-bottom: 16px;
}

.input-section label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
  color: #333;
}

.input-section input[type="text"],
.input-section input[type="password"] {
  width: 100%;
  padding: 8px 12px;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.2s;
}

.input-section input:focus {
  outline: none;
  border-color: #2196F3;
}

.acknowledgment-section {
  background: #f8f9fa;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 20px;
}

.acknowledgment-section label {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  cursor: pointer;
  gap: 8px;
}

.prompt-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-cancel,
.btn-confirm {
  padding: 10px 24px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-cancel {
  background: #6c757d;
  color: white;
}

.btn-cancel:hover {
  background: #5a6268;
}

.btn-confirm {
  background: #dc3545;
  color: white;
  font-weight: 500;
}

.btn-confirm:hover:not(:disabled) {
  background: #c82333;
}

.btn-confirm:disabled {
  background: #aaa;
  cursor: not-allowed;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .security-prompt {
    animation: none;
  }
}

@media (max-width: 600px) {
  .security-prompt {
    margin: 20px;
    width: calc(100% - 40px);
  }
  
  .prompt-footer {
    flex-direction: column-reverse;
  }
  
  .btn-cancel,
  .btn-confirm {
    width: 100%;
  }
}
```

## Testing Framework

```javascript
// security-prompt.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SecurityPrompt from './SecurityPrompt';
import { securityManager } from './security-utils';

// Mock the security manager
jest.mock('./security-utils');

describe('SecurityPrompt', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders basic prompt correctly', () => {
    render(
      <SecurityPrompt
        visible={true}
        level={1}
        action="test action"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    expect(screen.getByText('Authentication Required')).toBeInTheDocument();
    expect(screen.getByLabelText('Password:')).toBeInTheDocument();
  });

  test('requires confirmation text for level 2', () => {
    render(
      <SecurityPrompt
        visible={true}
        level={2}
        action="delete something"
        confirmationText="DELETE"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />
    );

    expect(screen.getByText('Type "DELETE" to confirm:')).toBeInTheDocument();
  });

  test('validates password before confirming', async () => {
    const onConfirm = jest.fn();
    securityManager.validatePassword.mockResolvedValue(true);

    render(
      <SecurityPrompt
        visible={true}
        level={1}
        action="test action"
        onConfirm={onConfirm}
        onCancel={jest.fn()}
      />
    );

    fireEvent.change(screen.getByLabelText('Password:'), {
      target: { value: 'testpassword' }
    });

    fireEvent.click(screen.getByText('Confirm'));

    await waitFor(() => {
      expect(securityManager.validatePassword).toHaveBeenCalledWith('testpassword');
      expect(onConfirm).toHaveBeenCalled();
    });
  });

  test('validates confirmation text exactly', async () => {
    const onConfirm = jest.fn();
    securityManager.validatePassword.mockResolvedValue(true);

    render(
      <SecurityPrompt
        visible={true}
        level={2}
        action="delete something"
        confirmationText="DELETE"
        onConfirm={onConfirm}
        onCancel={jest.fn()}
      />
    );

    fireEvent.change(screen.getByLabelText('Password:'), {
      target: { value: 'testpassword' }
    });

    fireEvent.change(screen.getByLabelText('Type "DELETE" to confirm:'), {
      target: { value: 'delete' } // Wrong case
    });

    fireEvent.click(screen.getByText('Confirm'));

    await waitFor(() => {
      expect(onConfirm).not.toHaveBeenCalled();
    });
  });

  test('logs security events', async () => {
    const onCancel = jest.fn();

    render(
      <SecurityPrompt
        visible={true}
        level={1}
        action="test action"
        target="test target"
        onConfirm={jest.fn()}
        onCancel={onCancel}
      />
    );

    fireEvent.click(screen.getByText('Cancel'));

    expect(securityManager.logSecurityEvent).toHaveBeenCalledWith({
      action: 'test action',
      target: 'test target',
      level: 1,
      status: 'cancelled'
    });

    expect(onCancel).toHaveBeenCalled();
  });
});
```

## Configuration Options

```javascript
// security-config.js
export const SecurityConfig = {
  // Global settings
  sessionTimeout: 15 * 60 * 1000, // 15 minutes
  maxFailedAttempts: 3,
  lockoutDuration: 30 * 60 * 1000, // 30 minutes
  
  // Prompt levels
  levels: {
    1: { // Standard
      requirePassword: true,
      require2FA: false,
      requireConfirmationText: false,
      requireAcknowledgments: false,
      logLevel: 'info'
    },
    2: { // Elevated
      requirePassword: true,
      require2FA: false,
      requireConfirmationText: true,
      requireAcknowledgments: true,
      logLevel: 'warn'
    },
    3: { // Critical
      requirePassword: true,
      require2FA: true,
      requireConfirmationText: true,
      requireAcknowledgments: true,
      logLevel: 'critical'
    }
  },

  // Action mappings
  actionMappings: {
    'view_sensitive_data': 1,
    'edit_user_data': 1,
    'delete_user': 2,
    'bulk_delete': 2,
    'export_data': 2,
    'change_permissions': 2,
    'system_config': 2,
    'system_reset': 3,
    'delete_account': 3,
    'factory_reset': 3
  }
};
```

This implementation provides a robust, secure, and user-friendly system for handling sensitive operations with appropriate security prompts and confirmations.