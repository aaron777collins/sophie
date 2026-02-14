import { MatrixClient } from 'matrix-js-sdk'
import { IKeyBackupInfo } from 'matrix-js-sdk/lib/crypto/keybackup'

/**
 * Key backup recovery information
 */
export interface BackupRecoveryInfo {
  recoveryKey: string
  passphrase?: string
  keyBackupVersion?: string
}

/**
 * Key backup status information
 */
export interface BackupStatus {
  enabled: boolean
  version?: string
  algorithm?: string
  count?: number
  etag?: string
  trusted?: boolean
}

/**
 * Key backup service for Matrix encryption key recovery
 */
export class KeyBackupService {
  private client: MatrixClient

  constructor(client: MatrixClient) {
    this.client = client
  }

  /**
   * Check the current backup status
   */
  async getBackupStatus(): Promise<BackupStatus> {
    try {
      const backupInfo = await this.client.getKeyBackupVersion()
      
      if (!backupInfo) {
        return { enabled: false }
      }

      // Check if we trust this backup
      const trustInfo = await this.client.isKeyBackupTrusted(backupInfo)

      return {
        enabled: true,
        version: backupInfo.version,
        algorithm: backupInfo.algorithm,
        count: backupInfo.count,
        etag: backupInfo.etag,
        trusted: !!trustInfo && trustInfo.usable
      }
    } catch (error) {
      console.error('Failed to get backup status:', error)
      return { enabled: false }
    }
  }

  /**
   * Create a new key backup with recovery key
   */
  async createBackup(): Promise<BackupRecoveryInfo> {
    try {
      // Generate recovery key
      const recoveryKey = await this.client.createRecoveryKeyFromPassphrase()
      
      // Create the backup
      const backupInfo = await this.client.prepareKeyBackupVersion(recoveryKey.privateKey)
      const version = await this.client.createKeyBackupVersion(backupInfo)

      // Enable backup
      await this.client.enableKeyBackup(backupInfo)

      // Start backing up keys
      await this.client.scheduleAllGroupSessionsForBackup()

      return {
        recoveryKey: recoveryKey.encodedPrivateKey || '',
        keyBackupVersion: version.version || ''
      }
    } catch (error) {
      console.error('Failed to create backup:', error)
      throw error
    }
  }

  /**
   * Create a new key backup with passphrase
   */
  async createBackupWithPassphrase(passphrase: string): Promise<BackupRecoveryInfo> {
    try {
      // Generate recovery key from passphrase
      const recoveryKey = await this.client.createRecoveryKeyFromPassphrase(passphrase)
      
      // Create the backup
      const backupInfo = await this.client.prepareKeyBackupVersion(recoveryKey.privateKey)
      const version = await this.client.createKeyBackupVersion(backupInfo)

      // Enable backup
      await this.client.enableKeyBackup(backupInfo)

      // Start backing up keys
      await this.client.scheduleAllGroupSessionsForBackup()

      return {
        recoveryKey: recoveryKey.encodedPrivateKey || '',
        passphrase,
        keyBackupVersion: version.version || ''
      }
    } catch (error) {
      console.error('Failed to create backup with passphrase:', error)
      throw error
    }
  }

  /**
   * Restore keys from backup using recovery key
   */
  async restoreFromRecoveryKey(recoveryKey: string): Promise<void> {
    try {
      const backupInfo = await this.client.getKeyBackupVersion()
      if (!backupInfo) {
        throw new Error('No backup found')
      }

      // Restore the backup
      await this.client.restoreKeyBackupWithRecoveryKey(
        recoveryKey,
        undefined,
        undefined,
        backupInfo,
        { progressCallback: undefined }
      )

      // Check if backup is now trusted (the restore might have trusted it)
      const trustInfo = await this.client.isKeyBackupTrusted(backupInfo)
      if (!trustInfo || !trustInfo.usable) {
        console.warn('Backup was restored but may not be fully trusted')
      }
    } catch (error) {
      console.error('Failed to restore from recovery key:', error)
      throw error
    }
  }

  /**
   * Restore keys from backup using passphrase
   */
  async restoreFromPassphrase(passphrase: string): Promise<void> {
    try {
      const backupInfo = await this.client.getKeyBackupVersion()
      if (!backupInfo) {
        throw new Error('No backup found')
      }

      // Generate recovery key from passphrase
      const recoveryKey = await this.client.createRecoveryKeyFromPassphrase(passphrase)

      // Restore the backup
      await this.client.restoreKeyBackupWithRecoveryKey(
        recoveryKey.encodedPrivateKey || '',
        undefined,
        undefined,
        backupInfo,
        { progressCallback: undefined }
      )

      // Check if backup is now trusted (the restore might have trusted it)
      const trustInfo = await this.client.isKeyBackupTrusted(backupInfo)
      if (!trustInfo || !trustInfo.usable) {
        console.warn('Backup was restored but may not be fully trusted')
      }
    } catch (error) {
      console.error('Failed to restore from passphrase:', error)
      throw error
    }
  }

  /**
   * Delete the current backup
   */
  async deleteBackup(): Promise<void> {
    try {
      const backupInfo = await this.client.getKeyBackupVersion()
      if (!backupInfo || !backupInfo.version) {
        throw new Error('No backup found')
      }

      await this.client.deleteKeyBackupVersion(backupInfo.version)
      await this.client.disableKeyBackup()
    } catch (error) {
      console.error('Failed to delete backup:', error)
      throw error
    }
  }

  /**
   * Check if device has been backed up recently
   */
  async isBackedUp(): Promise<boolean> {
    try {
      const backupInfo = await this.client.getKeyBackupVersion()
      if (!backupInfo) {
        return false
      }

      // Check if we have pending keys to backup
      const remaining = await this.client.countSessionsNeedingBackup()
      return remaining === 0
    } catch (error) {
      console.error('Failed to check backup status:', error)
      return false
    }
  }

  /**
   * Force backup all keys now
   */
  async backupAllKeys(): Promise<void> {
    try {
      await this.client.scheduleAllGroupSessionsForBackup()
      // The actual backup happens in the background
    } catch (error) {
      console.error('Failed to schedule key backup:', error)
      throw error
    }
  }

  /**
   * Get backup progress
   */
  async getBackupProgress(): Promise<{ total: number; remaining: number; backed_up: number }> {
    try {
      const remaining = await this.client.countSessionsNeedingBackup()
      const backupInfo = await this.client.getKeyBackupVersion()
      const backed_up = backupInfo?.count || 0
      const total = remaining + backed_up

      return { total, remaining, backed_up }
    } catch (error) {
      console.error('Failed to get backup progress:', error)
      return { total: 0, remaining: 0, backed_up: 0 }
    }
  }
}