'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { MatrixClient } from 'matrix-js-sdk';
import {
  MatrixKeyBackupManager,
  BackupStatus,
  BackupPassphrase,
  BackupProgress,
  RestoreProgress,
  BackupProgressCallback,
  RestoreProgressCallback,
  KeyBackupError,
  BackupNotEnabledError,
  BackupTrustError,
  PassphraseError,
  createKeyBackupManager,
} from '@/lib/matrix/crypto/backup';

export interface UseKeyBackupState {
  // Current state
  status: BackupStatus | null;
  isLoading: boolean;
  error: string | null;
  
  // Progress states
  backupProgress: BackupProgress | null;
  restoreProgress: RestoreProgress | null;
  
  // Derived states
  isBackupEnabled: boolean;
  isBackupTrusted: boolean;
  needsBackup: boolean;
}

export interface UseKeyBackupActions {
  // Setup operations
  generatePassphrase: () => Promise<BackupPassphrase | null>;
  initializeBackup: (passphrase: string) => Promise<boolean>;
  
  // Backup operations
  backupKeys: () => Promise<boolean>;
  checkBackupNeeds: () => Promise<void>;
  
  // Recovery operations
  restoreBackup: (passphrase: string, backupVersion?: string) => Promise<boolean>;
  
  // Management operations
  deleteBackup: (backupVersion?: string) => Promise<boolean>;
  refreshStatus: () => Promise<void>;
  
  // Error handling
  clearError: () => void;
}

export interface UseKeyBackupOptions {
  // Matrix client (required)
  client?: MatrixClient;
  
  // Auto-refresh settings
  autoRefresh?: boolean;
  refreshInterval?: number;
  
  // Auto-backup settings
  autoBackup?: boolean;
  autoBackupInterval?: number;
  
  // Callbacks
  onBackupComplete?: () => void;
  onRestoreComplete?: () => void;
  onError?: (error: KeyBackupError) => void;
}

export interface UseKeyBackupReturn extends UseKeyBackupState, UseKeyBackupActions {}

/**
 * React hook for managing Matrix key backup operations
 * Provides a clean interface for backup setup, management, and recovery
 */
export function useKeyBackup(options: UseKeyBackupOptions = {}): UseKeyBackupReturn {
  const {
    client,
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
    autoBackup = false,
    autoBackupInterval = 300000, // 5 minutes
    onBackupComplete,
    onRestoreComplete,
    onError,
  } = options;

  // State
  const [status, setStatus] = useState<BackupStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backupProgress, setBackupProgress] = useState<BackupProgress | null>(null);
  const [restoreProgress, setRestoreProgress] = useState<RestoreProgress | null>(null);
  const [needsBackup, setNeedsBackup] = useState(false);

  // Refs
  const backupManagerRef = useRef<MatrixKeyBackupManager | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoBackupIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize backup manager when client is available
  useEffect(() => {
    if (client) {
      backupManagerRef.current = createKeyBackupManager(client);
      
      // Set up progress callbacks
      const backupProgressCallback: BackupProgressCallback = (progress) => {
        setBackupProgress(progress);
        
        if (progress.stage === 'complete' && onBackupComplete) {
          onBackupComplete();
        }
        
        if (progress.stage === 'error' && progress.error) {
          setError(progress.error);
        }
      };

      const restoreProgressCallback: RestoreProgressCallback = (progress) => {
        setRestoreProgress(progress);
        
        if (progress.stage === 'complete' && onRestoreComplete) {
          onRestoreComplete();
        }
        
        if (progress.stage === 'error' && progress.error) {
          setError(progress.error);
        }
      };

      backupManagerRef.current.setBackupProgressCallback(backupProgressCallback);
      backupManagerRef.current.setRestoreProgressCallback(restoreProgressCallback);
    }

    return () => {
      backupManagerRef.current = null;
    };
  }, [client, onBackupComplete, onRestoreComplete]);

  // Handle errors consistently
  const handleError = useCallback((err: unknown, defaultMessage = 'An unknown error occurred') => {
    const error = err instanceof KeyBackupError ? err : new KeyBackupError(defaultMessage);
    setError(error.message);
    
    if (onError) {
      onError(error);
    }
    
    console.error('Key backup error:', error);
  }, [onError]);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
    setBackupProgress(null);
    setRestoreProgress(null);
  }, []);

  // Refresh backup status
  const refreshStatus = useCallback(async () => {
    if (!backupManagerRef.current) {
      return;
    }

    try {
      const newStatus = await backupManagerRef.current.getBackupStatus();
      setStatus(newStatus);
      setError(null);
    } catch (err) {
      handleError(err, 'Failed to refresh backup status');
    }
  }, [handleError]);

  // Check if backup is needed
  const checkBackupNeeds = useCallback(async () => {
    if (!backupManagerRef.current) {
      return;
    }

    try {
      const needs = await backupManagerRef.current.needsBackup();
      setNeedsBackup(needs);
    } catch (err) {
      handleError(err, 'Failed to check backup needs');
    }
  }, [handleError]);

  // Generate secure passphrase
  const generatePassphrase = useCallback(async (): Promise<BackupPassphrase | null> => {
    if (!backupManagerRef.current) {
      setError('Matrix client not initialized');
      return null;
    }

    setIsLoading(true);
    clearError();

    try {
      const passphrase = await backupManagerRef.current.generateBackupPassphrase();
      return passphrase;
    } catch (err) {
      handleError(err, 'Failed to generate backup passphrase');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [clearError, handleError]);

  // Initialize backup with passphrase
  const initializeBackup = useCallback(async (passphrase: string): Promise<boolean> => {
    if (!backupManagerRef.current) {
      setError('Matrix client not initialized');
      return false;
    }

    if (!passphrase?.trim()) {
      setError('Passphrase is required');
      return false;
    }

    setIsLoading(true);
    clearError();

    try {
      await backupManagerRef.current.initializeBackup(passphrase);
      await refreshStatus();
      await checkBackupNeeds();
      return true;
    } catch (err) {
      handleError(err, 'Failed to initialize backup');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [clearError, handleError, refreshStatus, checkBackupNeeds]);

  // Backup keys manually
  const backupKeys = useCallback(async (): Promise<boolean> => {
    if (!backupManagerRef.current) {
      setError('Matrix client not initialized');
      return false;
    }

    setIsLoading(true);
    clearError();

    try {
      await backupManagerRef.current.backupKeys();
      await refreshStatus();
      await checkBackupNeeds();
      return true;
    } catch (err) {
      if (err instanceof BackupNotEnabledError) {
        handleError(err, 'Key backup is not enabled. Please set up backup first.');
      } else if (err instanceof BackupTrustError) {
        handleError(err, 'Backup is not trusted. Please verify your recovery key.');
      } else {
        handleError(err, 'Failed to backup keys');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [clearError, handleError, refreshStatus, checkBackupNeeds]);

  // Restore backup from passphrase
  const restoreBackup = useCallback(async (
    passphrase: string, 
    backupVersion?: string
  ): Promise<boolean> => {
    if (!backupManagerRef.current) {
      setError('Matrix client not initialized');
      return false;
    }

    if (!passphrase?.trim()) {
      setError('Passphrase is required');
      return false;
    }

    setIsLoading(true);
    clearError();

    try {
      await backupManagerRef.current.restoreBackup(passphrase, backupVersion);
      await refreshStatus();
      await checkBackupNeeds();
      return true;
    } catch (err) {
      if (err instanceof PassphraseError) {
        handleError(err, 'Invalid passphrase. Please check your recovery passphrase.');
      } else if (err instanceof BackupNotEnabledError) {
        handleError(err, 'No backup found to restore.');
      } else {
        handleError(err, 'Failed to restore backup');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [clearError, handleError, refreshStatus, checkBackupNeeds]);

  // Delete backup
  const deleteBackup = useCallback(async (backupVersion?: string): Promise<boolean> => {
    if (!backupManagerRef.current) {
      setError('Matrix client not initialized');
      return false;
    }

    setIsLoading(true);
    clearError();

    try {
      await backupManagerRef.current.deleteBackup(backupVersion);
      await refreshStatus();
      await checkBackupNeeds();
      return true;
    } catch (err) {
      handleError(err, 'Failed to delete backup');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [clearError, handleError, refreshStatus, checkBackupNeeds]);

  // Auto-refresh status
  useEffect(() => {
    if (!client || !autoRefresh) {
      return;
    }

    // Initial load
    refreshStatus();
    checkBackupNeeds();

    // Set up interval
    refreshIntervalRef.current = setInterval(() => {
      refreshStatus();
      checkBackupNeeds();
    }, refreshInterval);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [client, autoRefresh, refreshInterval, refreshStatus, checkBackupNeeds]);

  // Auto-backup
  useEffect(() => {
    if (!client || !autoBackup || !status?.enabled || !status.trusted) {
      return;
    }

    autoBackupIntervalRef.current = setInterval(async () => {
      if (needsBackup && backupManagerRef.current) {
        try {
          await backupManagerRef.current.backupKeys();
          await checkBackupNeeds();
        } catch (err) {
          // Silently handle auto-backup errors (user can still backup manually)
          console.warn('Auto-backup failed:', err);
        }
      }
    }, autoBackupInterval);

    return () => {
      if (autoBackupIntervalRef.current) {
        clearInterval(autoBackupIntervalRef.current);
        autoBackupIntervalRef.current = null;
      }
    };
  }, [client, autoBackup, autoBackupInterval, status, needsBackup, checkBackupNeeds]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      if (autoBackupIntervalRef.current) {
        clearInterval(autoBackupIntervalRef.current);
      }
    };
  }, []);

  // Derived states
  const isBackupEnabled = status?.enabled ?? false;
  const isBackupTrusted = status?.trusted ?? false;

  return {
    // State
    status,
    isLoading,
    error,
    backupProgress,
    restoreProgress,
    
    // Derived states
    isBackupEnabled,
    isBackupTrusted,
    needsBackup,
    
    // Actions
    generatePassphrase,
    initializeBackup,
    backupKeys,
    checkBackupNeeds,
    restoreBackup,
    deleteBackup,
    refreshStatus,
    clearError,
  };
}