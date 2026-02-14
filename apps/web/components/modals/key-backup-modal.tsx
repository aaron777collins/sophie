'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Modal } from '../ui';
import { useKeyBackup } from '@/hooks';
import { MatrixClient } from 'matrix-js-sdk';
import { BackupPassphrase } from '@/lib/matrix/crypto/backup';
import styles from './key-backup-modal.module.css';

export interface KeyBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: MatrixClient;
  mode: 'setup' | 'restore' | 'manage';
}

type SetupStep = 'intro' | 'generating' | 'passphrase' | 'confirm' | 'backup' | 'complete';
type RestoreStep = 'intro' | 'passphrase' | 'restore' | 'complete';
type ManageStep = 'status' | 'backup' | 'delete' | 'confirm-delete';

interface PassphraseInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  placeholder?: string;
  showStrength?: boolean;
  error?: string | null;
}

function PassphraseInput({ 
  value, 
  onChange, 
  onSubmit, 
  isLoading, 
  placeholder = "Enter your backup passphrase...",
  showStrength = false,
  error 
}: PassphraseInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      onSubmit();
    }
  };

  const passphraseStrength = useMemo(() => {
    if (!showStrength || !value) return null;
    
    const length = value.length;
    const words = value.trim().split(/\s+/).length;
    
    if (length < 12) return { level: 'weak', text: 'Too short' };
    if (words < 4) return { level: 'weak', text: 'Use more words' };
    if (words >= 8) return { level: 'strong', text: 'Strong' };
    if (words >= 6) return { level: 'medium', text: 'Good' };
    return { level: 'weak', text: 'Add more words' };
  }, [showStrength, value]);

  return (
    <div className={styles.passphraseInput}>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isLoading}
        className={styles.passphraseTextarea}
        rows={3}
        autoComplete="off"
        autoFocus
      />
      
      {error && (
        <div className={styles.error}>
          <ErrorIcon />
          <span>{error}</span>
        </div>
      )}
      
      {passphraseStrength && (
        <div className={`${styles.strength} ${styles[passphraseStrength.level]}`}>
          <div className={styles.strengthBar}>
            <div className={styles.strengthFill} />
          </div>
          <span>{passphraseStrength.text}</span>
        </div>
      )}
    </div>
  );
}

interface ProgressBarProps {
  progress: number;
  stage: string;
}

function ProgressBar({ progress, stage }: ProgressBarProps) {
  return (
    <div className={styles.progressContainer}>
      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill} 
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className={styles.progressText}>
        {stage === 'preparing' && 'Preparing backup...'}
        {stage === 'uploading' && 'Uploading encrypted keys...'}
        {stage === 'downloading' && 'Downloading backup...'}
        {stage === 'decrypting' && 'Decrypting backup...'}
        {stage === 'importing' && 'Importing keys...'}
        {stage === 'complete' && 'Complete!'}
        {progress > 0 && ` (${progress}%)`}
      </p>
    </div>
  );
}

export function KeyBackupModal({ isOpen, onClose, client, mode }: KeyBackupModalProps) {
  // Hook for backup operations
  const {
    status,
    isLoading,
    error,
    backupProgress,
    restoreProgress,
    isBackupEnabled,
    isBackupTrusted,
    needsBackup,
    generatePassphrase,
    initializeBackup,
    backupKeys,
    restoreBackup,
    deleteBackup,
    clearError,
  } = useKeyBackup({
    client,
    autoRefresh: true,
    onBackupComplete: () => {
      if (currentSetupStep === 'backup') {
        setCurrentSetupStep('complete');
      }
    },
    onRestoreComplete: () => {
      if (currentRestoreStep === 'restore') {
        setCurrentRestoreStep('complete');
      }
    },
  });

  // Step state
  const [currentSetupStep, setCurrentSetupStep] = useState<SetupStep>('intro');
  const [currentRestoreStep, setCurrentRestoreStep] = useState<RestoreStep>('intro');
  const [currentManageStep, setCurrentManageStep] = useState<ManageStep>('status');

  // Form state
  const [generatedPassphrase, setGeneratedPassphrase] = useState<BackupPassphrase | null>(null);
  const [inputPassphrase, setInputPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [savedPassphrase, setSavedPassphrase] = useState(false);

  // Reset state when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      clearError();
      setCurrentSetupStep('intro');
      setCurrentRestoreStep('intro');
      setCurrentManageStep('status');
      setGeneratedPassphrase(null);
      setInputPassphrase('');
      setConfirmPassphrase('');
      setSavedPassphrase(false);
    }
  }, [isOpen, mode, clearError]);

  // Setup flow handlers
  const handleGeneratePassphrase = useCallback(async () => {
    setCurrentSetupStep('generating');
    const passphrase = await generatePassphrase();
    
    if (passphrase) {
      setGeneratedPassphrase(passphrase);
      setCurrentSetupStep('passphrase');
    } else {
      setCurrentSetupStep('intro');
    }
  }, [generatePassphrase]);

  const handleConfirmPassphrase = useCallback(() => {
    if (generatedPassphrase && savedPassphrase) {
      setInputPassphrase(generatedPassphrase.passphrase);
      setCurrentSetupStep('confirm');
    }
  }, [generatedPassphrase, savedPassphrase]);

  const handleSetupBackup = useCallback(async () => {
    if (!inputPassphrase.trim()) return;
    
    setCurrentSetupStep('backup');
    const success = await initializeBackup(inputPassphrase);
    
    if (!success) {
      setCurrentSetupStep('confirm');
    }
  }, [inputPassphrase, initializeBackup]);

  // Restore flow handlers
  const handleRestoreBackup = useCallback(async () => {
    if (!inputPassphrase.trim()) return;
    
    setCurrentRestoreStep('restore');
    const success = await restoreBackup(inputPassphrase);
    
    if (!success) {
      setCurrentRestoreStep('passphrase');
    }
  }, [inputPassphrase, restoreBackup]);

  // Management flow handlers
  const handleManualBackup = useCallback(async () => {
    setCurrentManageStep('backup');
    const success = await backupKeys();
    
    setTimeout(() => {
      setCurrentManageStep('status');
    }, 2000);
  }, [backupKeys]);

  const handleDeleteBackup = useCallback(async () => {
    const success = await deleteBackup();
    
    if (success) {
      onClose();
    } else {
      setCurrentManageStep('status');
    }
  }, [deleteBackup, onClose]);

  // Copy to clipboard helper
  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  }, []);

  // Modal content rendering
  const renderContent = useCallback(() => {
    if (mode === 'setup') {
      switch (currentSetupStep) {
        case 'intro':
          return (
            <div className={styles.content}>
              <div className={styles.header}>
                <ShieldIcon className={styles.headerIcon} />
                <h2>Set Up Key Backup</h2>
                <p>Secure your encrypted messages by backing up your encryption keys.</p>
              </div>
              
              <div className={styles.features}>
                <div className={styles.feature}>
                  <CheckIcon />
                  <div>
                    <h4>End-to-end encrypted</h4>
                    <p>Your keys are encrypted before being uploaded</p>
                  </div>
                </div>
                <div className={styles.feature}>
                  <CheckIcon />
                  <div>
                    <h4>Restore on any device</h4>
                    <p>Access your message history from new devices</p>
                  </div>
                </div>
                <div className={styles.feature}>
                  <CheckIcon />
                  <div>
                    <h4>Secure passphrase</h4>
                    <p>Only you can decrypt your backed up keys</p>
                  </div>
                </div>
              </div>
              
              <div className={styles.actions}>
                <button 
                  onClick={handleGeneratePassphrase}
                  disabled={isLoading}
                  className={styles.primaryButton}
                >
                  {isLoading ? 'Generating...' : 'Set Up Key Backup'}
                </button>
              </div>
            </div>
          );

        case 'generating':
          return (
            <div className={styles.content}>
              <div className={styles.header}>
                <LoadingIcon className={styles.headerIcon} />
                <h2>Generating Secure Keys</h2>
                <p>Creating your backup passphrase and encryption keys...</p>
              </div>
            </div>
          );

        case 'passphrase':
          return (
            <div className={styles.content}>
              <div className={styles.header}>
                <KeyIcon className={styles.headerIcon} />
                <h2>Save Your Recovery Passphrase</h2>
                <p>This passphrase will allow you to restore your keys on new devices. Save it somewhere secure.</p>
              </div>
              
              {generatedPassphrase && (
                <div className={styles.passphraseDisplay}>
                  <div className={styles.passphraseBox}>
                    <code>{generatedPassphrase.passphrase}</code>
                    <button 
                      onClick={() => copyToClipboard(generatedPassphrase.passphrase)}
                      className={styles.copyButton}
                      title="Copy to clipboard"
                    >
                      <CopyIcon />
                    </button>
                  </div>
                </div>
              )}
              
              <div className={styles.warning}>
                <WarningIcon />
                <div>
                  <h4>Important: Save this passphrase</h4>
                  <p>If you lose this passphrase, you will not be able to restore your message history.</p>
                </div>
              </div>
              
              <div className={styles.checkbox}>
                <label>
                  <input 
                    type="checkbox" 
                    checked={savedPassphrase}
                    onChange={(e) => setSavedPassphrase(e.target.checked)}
                  />
                  <span>I have saved my recovery passphrase in a secure location</span>
                </label>
              </div>
              
              <div className={styles.actions}>
                <button 
                  onClick={() => setCurrentSetupStep('intro')}
                  className={styles.secondaryButton}
                >
                  Back
                </button>
                <button 
                  onClick={handleConfirmPassphrase}
                  disabled={!savedPassphrase}
                  className={styles.primaryButton}
                >
                  Continue
                </button>
              </div>
            </div>
          );

        case 'confirm':
          return (
            <div className={styles.content}>
              <div className={styles.header}>
                <CheckIcon className={styles.headerIcon} />
                <h2>Confirm Your Passphrase</h2>
                <p>Please enter your recovery passphrase to confirm you saved it correctly.</p>
              </div>
              
              <PassphraseInput
                value={confirmPassphrase}
                onChange={setConfirmPassphrase}
                onSubmit={handleSetupBackup}
                isLoading={isLoading}
                placeholder="Enter your recovery passphrase..."
                error={error}
              />
              
              <div className={styles.actions}>
                <button 
                  onClick={() => setCurrentSetupStep('passphrase')}
                  className={styles.secondaryButton}
                >
                  Back
                </button>
                <button 
                  onClick={handleSetupBackup}
                  disabled={!confirmPassphrase.trim() || isLoading}
                  className={styles.primaryButton}
                >
                  {isLoading ? 'Setting Up...' : 'Set Up Backup'}
                </button>
              </div>
            </div>
          );

        case 'backup':
          return (
            <div className={styles.content}>
              <div className={styles.header}>
                <UploadIcon className={styles.headerIcon} />
                <h2>Creating Your Backup</h2>
                <p>Encrypting and uploading your keys...</p>
              </div>
              
              {backupProgress && (
                <ProgressBar 
                  progress={backupProgress.backedUp} 
                  stage={backupProgress.stage} 
                />
              )}
            </div>
          );

        case 'complete':
          return (
            <div className={styles.content}>
              <div className={styles.header}>
                <SuccessIcon className={styles.headerIcon} />
                <h2>Backup Complete!</h2>
                <p>Your encryption keys are now safely backed up. You can restore them on any new device using your passphrase.</p>
              </div>
              
              <div className={styles.actions}>
                <button 
                  onClick={onClose}
                  className={styles.primaryButton}
                >
                  Done
                </button>
              </div>
            </div>
          );

        default:
          return null;
      }
    }

    if (mode === 'restore') {
      switch (currentRestoreStep) {
        case 'intro':
          return (
            <div className={styles.content}>
              <div className={styles.header}>
                <RestoreIcon className={styles.headerIcon} />
                <h2>Restore Key Backup</h2>
                <p>Enter your recovery passphrase to restore your encrypted message history.</p>
              </div>
              
              <div className={styles.actions}>
                <button 
                  onClick={() => setCurrentRestoreStep('passphrase')}
                  className={styles.primaryButton}
                >
                  Continue
                </button>
              </div>
            </div>
          );

        case 'passphrase':
          return (
            <div className={styles.content}>
              <div className={styles.header}>
                <KeyIcon className={styles.headerIcon} />
                <h2>Enter Recovery Passphrase</h2>
                <p>Enter the passphrase you saved when setting up key backup.</p>
              </div>
              
              <PassphraseInput
                value={inputPassphrase}
                onChange={setInputPassphrase}
                onSubmit={handleRestoreBackup}
                isLoading={isLoading}
                placeholder="Enter your recovery passphrase..."
                error={error}
              />
              
              <div className={styles.actions}>
                <button 
                  onClick={() => setCurrentRestoreStep('intro')}
                  className={styles.secondaryButton}
                >
                  Back
                </button>
                <button 
                  onClick={handleRestoreBackup}
                  disabled={!inputPassphrase.trim() || isLoading}
                  className={styles.primaryButton}
                >
                  {isLoading ? 'Restoring...' : 'Restore Backup'}
                </button>
              </div>
            </div>
          );

        case 'restore':
          return (
            <div className={styles.content}>
              <div className={styles.header}>
                <DownloadIcon className={styles.headerIcon} />
                <h2>Restoring Your Keys</h2>
                <p>Downloading and decrypting your backup...</p>
              </div>
              
              {restoreProgress && (
                <ProgressBar 
                  progress={restoreProgress.imported} 
                  stage={restoreProgress.stage} 
                />
              )}
            </div>
          );

        case 'complete':
          return (
            <div className={styles.content}>
              <div className={styles.header}>
                <SuccessIcon className={styles.headerIcon} />
                <h2>Restore Complete!</h2>
                <p>Your encrypted message history has been restored. You can now access your old messages.</p>
              </div>
              
              <div className={styles.actions}>
                <button 
                  onClick={onClose}
                  className={styles.primaryButton}
                >
                  Done
                </button>
              </div>
            </div>
          );

        default:
          return null;
      }
    }

    if (mode === 'manage') {
      switch (currentManageStep) {
        case 'status':
          return (
            <div className={styles.content}>
              <div className={styles.header}>
                <SettingsIcon className={styles.headerIcon} />
                <h2>Key Backup Settings</h2>
                <p>Manage your encrypted message backup.</p>
              </div>
              
              <div className={styles.statusGrid}>
                <div className={styles.statusItem}>
                  <h4>Backup Status</h4>
                  <div className={`${styles.status} ${isBackupEnabled ? styles.enabled : styles.disabled}`}>
                    {isBackupEnabled ? <CheckIcon /> : <XIcon />}
                    <span>{isBackupEnabled ? 'Enabled' : 'Disabled'}</span>
                  </div>
                </div>
                
                <div className={styles.statusItem}>
                  <h4>Trust Status</h4>
                  <div className={`${styles.status} ${isBackupTrusted ? styles.trusted : styles.untrusted}`}>
                    {isBackupTrusted ? <ShieldCheckIcon /> : <ShieldXIcon />}
                    <span>{isBackupTrusted ? 'Trusted' : 'Not Trusted'}</span>
                  </div>
                </div>
                
                <div className={styles.statusItem}>
                  <h4>Keys Backed Up</h4>
                  <div className={styles.statusText}>
                    {status?.count ?? 0} keys
                  </div>
                </div>
                
                <div className={styles.statusItem}>
                  <h4>Needs Backup</h4>
                  <div className={`${styles.status} ${needsBackup ? styles.warning : styles.good}`}>
                    {needsBackup ? <WarningIcon /> : <CheckIcon />}
                    <span>{needsBackup ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
              
              <div className={styles.actions}>
                {needsBackup && isBackupEnabled && isBackupTrusted && (
                  <button 
                    onClick={handleManualBackup}
                    disabled={isLoading}
                    className={styles.primaryButton}
                  >
                    {isLoading ? 'Backing Up...' : 'Backup Keys'}
                  </button>
                )}
                
                {isBackupEnabled && (
                  <button 
                    onClick={() => setCurrentManageStep('confirm-delete')}
                    className={styles.dangerButton}
                  >
                    Delete Backup
                  </button>
                )}
              </div>
            </div>
          );

        case 'backup':
          return (
            <div className={styles.content}>
              <div className={styles.header}>
                <UploadIcon className={styles.headerIcon} />
                <h2>Backing Up Keys</h2>
                <p>Encrypting and uploading your latest keys...</p>
              </div>
              
              {backupProgress && (
                <ProgressBar 
                  progress={backupProgress.backedUp} 
                  stage={backupProgress.stage} 
                />
              )}
            </div>
          );

        case 'confirm-delete':
          return (
            <div className={styles.content}>
              <div className={styles.header}>
                <WarningIcon className={styles.headerIcon} />
                <h2>Delete Key Backup?</h2>
                <p>This will permanently delete your backup from the server. You will not be able to restore your message history on new devices.</p>
              </div>
              
              <div className={styles.warning}>
                <WarningIcon />
                <div>
                  <h4>This action cannot be undone</h4>
                  <p>Make sure you have another way to access your messages before deleting your backup.</p>
                </div>
              </div>
              
              <div className={styles.actions}>
                <button 
                  onClick={() => setCurrentManageStep('status')}
                  className={styles.secondaryButton}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteBackup}
                  disabled={isLoading}
                  className={styles.dangerButton}
                >
                  {isLoading ? 'Deleting...' : 'Delete Backup'}
                </button>
              </div>
            </div>
          );

        default:
          return null;
      }
    }

    return null;
  }, [
    mode,
    currentSetupStep,
    currentRestoreStep,
    currentManageStep,
    isLoading,
    error,
    backupProgress,
    restoreProgress,
    generatedPassphrase,
    inputPassphrase,
    confirmPassphrase,
    savedPassphrase,
    isBackupEnabled,
    isBackupTrusted,
    needsBackup,
    status,
    handleGeneratePassphrase,
    handleConfirmPassphrase,
    handleSetupBackup,
    handleRestoreBackup,
    handleManualBackup,
    handleDeleteBackup,
    copyToClipboard,
    onClose,
  ]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="medium"
      className={styles.keyBackupModal}
    >
      {renderContent()}
    </Modal>
  );
}

// Icon components
function ShieldIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" {...props}>
      <path
        d="M16.25 6.25L8.75 13.75L3.75 8.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LoadingIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M21 12a9 9 0 11-6.219-8.56"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function KeyIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CopyIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...props}>
      <path
        d="M13.5 6.5h-3a2 2 0 00-2 2v3a2 2 0 002 2h3a2 2 0 002-2v-3a2 2 0 00-2-2z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 9.5a2 2 0 01-2-2v-3a2 2 0 012-2h3a2 2 0 012 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WarningIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" {...props}>
      <path
        d="M8.257 3.099c.765-1.36 2.72-1.36 3.485 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.742-2.98l5.58-9.92z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 7.5V10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 13.125h.008"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UploadIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SuccessIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RestoreIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M3 12a9 9 0 019-9 9.75 9.75 0 016.74 2.74L21 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M21 3v5h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M21 12a9 9 0 01-9 9 9.75 9.75 0 01-6.74-2.74L3 16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M3 21v-5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DownloadIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SettingsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
      <path
        d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" {...props}>
      <path
        d="M15 5L5 15M5 5l10 10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShieldCheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" {...props}>
      <path
        d="M10 18.333s6.667-3.333 6.667-8.333V5l-6.667-2.5L3.333 5v5c0 5 6.667 8.333 6.667 8.333z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 10l1.667 1.667L12.5 8.333"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShieldXIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" {...props}>
      <path
        d="M10 18.333s6.667-3.333 6.667-8.333V5l-6.667-2.5L3.333 5v5c0 5 6.667 8.333 6.667 8.333z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.333 8.333l3.334 3.334M11.667 8.333L8.333 11.667"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ErrorIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...props}>
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 5v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 11h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default KeyBackupModal;