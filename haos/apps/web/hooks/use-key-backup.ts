'use client'

import { useState, useEffect, useCallback } from 'react'
import { useMatrixClient } from './use-matrix-client'
import { KeyBackupService, BackupStatus, BackupRecoveryInfo } from '../lib/matrix/crypto/backup'

/**
 * Hook for managing Matrix key backup functionality
 */
export function useKeyBackup() {
  const { client } = useMatrixClient()
  const [backupService, setBackupService] = useState<KeyBackupService | null>(null)
  const [backupStatus, setBackupStatus] = useState<BackupStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize backup service when client is available
  useEffect(() => {
    if (client) {
      const service = new KeyBackupService(client)
      setBackupService(service)
    } else {
      setBackupService(null)
    }
  }, [client])

  // Load backup status when service is available
  useEffect(() => {
    if (backupService) {
      loadBackupStatus()
    }
  }, [backupService])

  /**
   * Load current backup status
   */
  const loadBackupStatus = useCallback(async () => {
    if (!backupService) return

    try {
      setLoading(true)
      setError(null)
      const status = await backupService.getBackupStatus()
      setBackupStatus(status)
    } catch (err) {
      console.error('Failed to load backup status:', err)
      setError('Failed to load backup status')
    } finally {
      setLoading(false)
    }
  }, [backupService])

  /**
   * Create a new backup with recovery key only
   */
  const createBackup = useCallback(async (): Promise<BackupRecoveryInfo> => {
    if (!backupService) {
      throw new Error('Backup service not available')
    }

    try {
      setLoading(true)
      setError(null)
      const recoveryInfo = await backupService.createBackup()
      await loadBackupStatus() // Refresh status
      return recoveryInfo
    } catch (err) {
      console.error('Failed to create backup:', err)
      setError('Failed to create backup')
      throw err
    } finally {
      setLoading(false)
    }
  }, [backupService, loadBackupStatus])

  /**
   * Create a new backup with passphrase
   */
  const createBackupWithPassphrase = useCallback(async (passphrase: string): Promise<BackupRecoveryInfo> => {
    if (!backupService) {
      throw new Error('Backup service not available')
    }

    if (!passphrase.trim()) {
      throw new Error('Passphrase is required')
    }

    try {
      setLoading(true)
      setError(null)
      const recoveryInfo = await backupService.createBackupWithPassphrase(passphrase)
      await loadBackupStatus() // Refresh status
      return recoveryInfo
    } catch (err) {
      console.error('Failed to create backup with passphrase:', err)
      setError('Failed to create backup with passphrase')
      throw err
    } finally {
      setLoading(false)
    }
  }, [backupService, loadBackupStatus])

  /**
   * Restore backup using recovery key
   */
  const restoreFromRecoveryKey = useCallback(async (recoveryKey: string): Promise<void> => {
    if (!backupService) {
      throw new Error('Backup service not available')
    }

    if (!recoveryKey.trim()) {
      throw new Error('Recovery key is required')
    }

    try {
      setLoading(true)
      setError(null)
      await backupService.restoreFromRecoveryKey(recoveryKey)
      await loadBackupStatus() // Refresh status
    } catch (err) {
      console.error('Failed to restore from recovery key:', err)
      setError('Failed to restore from recovery key')
      throw err
    } finally {
      setLoading(false)
    }
  }, [backupService, loadBackupStatus])

  /**
   * Restore backup using passphrase
   */
  const restoreFromPassphrase = useCallback(async (passphrase: string): Promise<void> => {
    if (!backupService) {
      throw new Error('Backup service not available')
    }

    if (!passphrase.trim()) {
      throw new Error('Passphrase is required')
    }

    try {
      setLoading(true)
      setError(null)
      await backupService.restoreFromPassphrase(passphrase)
      await loadBackupStatus() // Refresh status
    } catch (err) {
      console.error('Failed to restore from passphrase:', err)
      setError('Failed to restore from passphrase')
      throw err
    } finally {
      setLoading(false)
    }
  }, [backupService, loadBackupStatus])

  /**
   * Delete current backup
   */
  const deleteBackup = useCallback(async (): Promise<void> => {
    if (!backupService) {
      throw new Error('Backup service not available')
    }

    try {
      setLoading(true)
      setError(null)
      await backupService.deleteBackup()
      await loadBackupStatus() // Refresh status
    } catch (err) {
      console.error('Failed to delete backup:', err)
      setError('Failed to delete backup')
      throw err
    } finally {
      setLoading(false)
    }
  }, [backupService, loadBackupStatus])

  /**
   * Check if keys are backed up
   */
  const checkBackupStatus = useCallback(async (): Promise<boolean> => {
    if (!backupService) {
      return false
    }

    try {
      return await backupService.isBackedUp()
    } catch (err) {
      console.error('Failed to check backup status:', err)
      return false
    }
  }, [backupService])

  /**
   * Force backup all keys
   */
  const backupAllKeys = useCallback(async (): Promise<void> => {
    if (!backupService) {
      throw new Error('Backup service not available')
    }

    try {
      setLoading(true)
      setError(null)
      await backupService.backupAllKeys()
      // Note: Backup happens asynchronously, status will update when complete
    } catch (err) {
      console.error('Failed to backup keys:', err)
      setError('Failed to backup keys')
      throw err
    } finally {
      setLoading(false)
    }
  }, [backupService])

  /**
   * Get backup progress
   */
  const getBackupProgress = useCallback(async () => {
    if (!backupService) {
      return { total: 0, remaining: 0, backed_up: 0 }
    }

    try {
      return await backupService.getBackupProgress()
    } catch (err) {
      console.error('Failed to get backup progress:', err)
      return { total: 0, remaining: 0, backed_up: 0 }
    }
  }, [backupService])

  return {
    // State
    backupStatus,
    loading,
    error,
    isAvailable: !!backupService,

    // Actions
    loadBackupStatus,
    createBackup,
    createBackupWithPassphrase,
    restoreFromRecoveryKey,
    restoreFromPassphrase,
    deleteBackup,
    checkBackupStatus,
    backupAllKeys,
    getBackupProgress,

    // Computed
    hasBackup: backupStatus?.enabled || false,
    isBackupTrusted: backupStatus?.trusted || false,
  }
}