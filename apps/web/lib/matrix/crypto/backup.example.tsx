/**
 * Matrix Key Backup System - Usage Examples
 * 
 * This file demonstrates how to integrate the key backup system into your Matrix application.
 * It shows various patterns for using the backup manager, React hook, and modal components.
 */

'use client';

import React, { useState, useCallback } from 'react';
import { MatrixClient } from 'matrix-js-sdk';
import { KeyBackupModal } from '@/components/modals';
import { useKeyBackup } from '@/hooks';
import { createKeyBackupManager } from './backup';

// Example 1: Direct usage of the backup manager
export function ExampleDirectUsage() {
  const [client, setClient] = useState<MatrixClient | undefined>(undefined);

  const handleDirectBackup = useCallback(async () => {
    if (!client) return;

    try {
      // Create backup manager
      const backupManager = createKeyBackupManager(client);

      // Check current status
      const status = await backupManager.getBackupStatus();
      console.log('Backup status:', status);

      if (!status.enabled) {
        // Generate passphrase for new backup
        const { passphrase } = await backupManager.generateBackupPassphrase();
        console.log('Generated passphrase:', passphrase);

        // Initialize backup
        const version = await backupManager.initializeBackup(passphrase);
        console.log('Backup initialized with version:', version);
      } else {
        // Backup existing keys
        await backupManager.backupKeys();
        console.log('Keys backed up successfully');
      }
    } catch (error) {
      console.error('Backup failed:', error);
    }
  }, [client]);

  return (
    <div>
      <h3>Direct Backup Manager Usage</h3>
      <button onClick={handleDirectBackup}>
        Initialize Backup
      </button>
    </div>
  );
}

// Example 2: Using the React hook
export function ExampleHookUsage() {
  const [client, setClient] = useState<MatrixClient | undefined>(undefined);
  
  const {
    // State
    status,
    isLoading,
    error,
    isBackupEnabled,
    isBackupTrusted,
    needsBackup,
    backupProgress,
    
    // Actions
    generatePassphrase,
    initializeBackup,
    backupKeys,
    restoreBackup,
    clearError,
  } = useKeyBackup({
    client,
    autoRefresh: true,
    autoBackup: true,
    onBackupComplete: () => {
      console.log('Backup completed!');
    },
    onError: (error) => {
      console.error('Key backup error:', error);
    },
  });

  const handleSetupBackup = useCallback(async () => {
    try {
      // Generate secure passphrase
      const credentials = await generatePassphrase();
      if (!credentials) return;

      console.log('Save this passphrase securely:', credentials.passphrase);
      
      // Initialize backup with passphrase
      const success = await initializeBackup(credentials.passphrase);
      if (success) {
        console.log('Backup setup complete!');
      }
    } catch (error) {
      console.error('Setup failed:', error);
    }
  }, [generatePassphrase, initializeBackup]);

  const handleManualBackup = useCallback(async () => {
    const success = await backupKeys();
    if (success) {
      console.log('Manual backup successful');
    }
  }, [backupKeys]);

  const handleRestore = useCallback(async () => {
    const passphrase = prompt('Enter your recovery passphrase:');
    if (!passphrase) return;

    const success = await restoreBackup(passphrase);
    if (success) {
      console.log('Restore successful');
    }
  }, [restoreBackup]);

  return (
    <div>
      <h3>React Hook Usage</h3>
      
      {/* Status Display */}
      <div>
        <p>Backup Enabled: {isBackupEnabled ? '✅' : '❌'}</p>
        <p>Backup Trusted: {isBackupTrusted ? '✅' : '⚠️'}</p>
        <p>Needs Backup: {needsBackup ? '⚠️' : '✅'}</p>
        {status && <p>Keys Backed Up: {status.count}</p>}
      </div>

      {/* Loading State */}
      {isLoading && <p>Loading...</p>}

      {/* Error Display */}
      {error && (
        <div style={{ color: 'red' }}>
          <p>Error: {error}</p>
          <button onClick={clearError}>Clear Error</button>
        </div>
      )}

      {/* Backup Progress */}
      {backupProgress && (
        <div>
          <p>Backup Progress: {backupProgress.stage}</p>
          <progress value={backupProgress.backedUp} max={backupProgress.total} />
        </div>
      )}

      {/* Actions */}
      <div>
        {!isBackupEnabled && (
          <button onClick={handleSetupBackup} disabled={isLoading}>
            Setup Backup
          </button>
        )}
        
        {isBackupEnabled && needsBackup && (
          <button onClick={handleManualBackup} disabled={isLoading}>
            Backup Keys
          </button>
        )}
        
        <button onClick={handleRestore} disabled={isLoading}>
          Restore Backup
        </button>
      </div>
    </div>
  );
}

// Example 3: Using the modal components
export function ExampleModalUsage() {
  const [client, setClient] = useState<MatrixClient | undefined>(undefined);
  const [modalMode, setModalMode] = useState<'setup' | 'restore' | 'manage' | null>(null);

  const openSetupModal = () => setModalMode('setup');
  const openRestoreModal = () => setModalMode('restore');
  const openManageModal = () => setModalMode('manage');
  const closeModal = () => setModalMode(null);

  return (
    <div>
      <h3>Modal Component Usage</h3>
      
      <div>
        <button onClick={openSetupModal}>
          Setup Key Backup
        </button>
        
        <button onClick={openRestoreModal}>
          Restore From Backup
        </button>
        
        <button onClick={openManageModal}>
          Manage Backup
        </button>
      </div>

      {/* Key Backup Modal */}
      {modalMode && (
        <KeyBackupModal
          isOpen={true}
          onClose={closeModal}
          client={client}
          mode={modalMode}
        />
      )}
    </div>
  );
}

// Example 4: Integration with Matrix authentication
export function ExampleWithAuth() {
  const [client, setClient] = useState<MatrixClient | undefined>(undefined);
  const [showBackupPrompt, setShowBackupPrompt] = useState(false);
  const [modalMode, setModalMode] = useState<'setup' | 'restore' | 'manage' | null>(null);

  // Hook that auto-checks backup status after login
  const { isBackupEnabled, needsBackup } = useKeyBackup({
    client,
    autoRefresh: true,
  });

  // Check if user should be prompted to set up backup
  React.useEffect(() => {
    if (client && !isBackupEnabled) {
      // Show backup setup prompt for new users
      const shouldPrompt = localStorage.getItem('backup-prompt-dismissed') !== 'true';
      if (shouldPrompt) {
        setShowBackupPrompt(true);
      }
    }
  }, [client, isBackupEnabled]);

  const dismissBackupPrompt = useCallback(() => {
    setShowBackupPrompt(false);
    localStorage.setItem('backup-prompt-dismissed', 'true');
  }, []);

  return (
    <div>
      <h3>Integration with Authentication</h3>
      
      {/* Backup Setup Prompt */}
      {showBackupPrompt && (
        <div style={{ 
          padding: '16px', 
          background: '#fff3cd', 
          border: '1px solid #ffeaa7',
          borderRadius: '8px',
          margin: '16px 0'
        }}>
          <h4>🔐 Secure Your Messages</h4>
          <p>
            Set up key backup to ensure you never lose access to your encrypted messages.
          </p>
          <div>
            <button onClick={() => setModalMode('setup')}>
              Set Up Backup
            </button>
            <button onClick={dismissBackupPrompt}>
              Maybe Later
            </button>
          </div>
        </div>
      )}

      {/* Backup Status in Settings */}
      {client && (
        <div>
          <h4>Security Settings</h4>
          <div>
            <span>Message Backup: </span>
            {isBackupEnabled ? (
              <span style={{ color: 'green' }}>
                ✅ Enabled {needsBackup && '(needs backup)'}
              </span>
            ) : (
              <span style={{ color: 'orange' }}>❌ Not set up</span>
            )}
            <button onClick={() => setModalMode('manage')}>
              Manage
            </button>
          </div>
        </div>
      )}

      {/* Modal for backup management */}
      {modalMode && (
        <KeyBackupModal
          isOpen={true}
          onClose={() => setModalMode(null)}
          client={client}
          mode={modalMode}
        />
      )}
    </div>
  );
}

// Example 5: Advanced error handling and user feedback
export function ExampleAdvancedErrorHandling() {
  const [client, setClient] = useState<MatrixClient | undefined>(undefined);
  const [userFeedback, setUserFeedback] = useState<{
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
  } | null>(null);

  const {
    initializeBackup,
    restoreBackup,
    error,
    clearError,
  } = useKeyBackup({
    client,
    onBackupComplete: () => {
      setUserFeedback({
        type: 'success',
        message: 'Your messages are now safely backed up! You can restore them on any device using your recovery passphrase.'
      });
    },
    onRestoreComplete: () => {
      setUserFeedback({
        type: 'success', 
        message: 'Welcome back! Your message history has been restored.'
      });
    },
    onError: (error) => {
      let message = 'Something went wrong. Please try again.';
      
      switch (error.errorCode) {
        case 'M_INVALID_PASSPHRASE':
          message = 'The recovery passphrase you entered is incorrect. Please check it and try again.';
          break;
        case 'M_BACKUP_NOT_ENABLED':
          message = 'Key backup is not set up yet. Would you like to set it up now?';
          break;
        case 'M_HOMESERVER_UNAVAILABLE':
          message = 'Unable to connect to your Matrix server. Please check your connection and try again.';
          break;
        default:
          message = error.message;
      }
      
      setUserFeedback({
        type: 'error',
        message,
      });
    },
  });

  const clearFeedback = () => {
    setUserFeedback(null);
    clearError();
  };

  return (
    <div>
      <h3>Advanced Error Handling</h3>
      
      {/* User Feedback Display */}
      {userFeedback && (
        <div style={{
          padding: '12px',
          borderRadius: '8px',
          margin: '16px 0',
          background: {
            info: '#e3f2fd',
            success: '#e8f5e8',
            warning: '#fff3e0', 
            error: '#ffebee'
          }[userFeedback.type],
          border: `1px solid ${{
            info: '#1976d2',
            success: '#4caf50',
            warning: '#ff9800',
            error: '#f44336'
          }[userFeedback.type]}`,
          color: {
            info: '#0d47a1',
            success: '#2e7d32',
            warning: '#e65100',
            error: '#c62828'
          }[userFeedback.type]
        }}>
          <p>{userFeedback.message}</p>
          <button onClick={clearFeedback}>Dismiss</button>
        </div>
      )}
      
      {/* Example actions that might trigger errors */}
      <div>
        <button onClick={() => initializeBackup('wrong-format-passphrase')}>
          Test Invalid Setup
        </button>
        
        <button onClick={() => restoreBackup('wrong-passphrase')}>
          Test Invalid Restore
        </button>
      </div>
    </div>
  );
}

// Example usage in a React component
export default function KeyBackupExamples() {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Matrix Key Backup System Examples</h1>
      
      <ExampleDirectUsage />
      <hr />
      
      <ExampleHookUsage />
      <hr />
      
      <ExampleModalUsage />
      <hr />
      
      <ExampleWithAuth />
      <hr />
      
      <ExampleAdvancedErrorHandling />
    </div>
  );
}