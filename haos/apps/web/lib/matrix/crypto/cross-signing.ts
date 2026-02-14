'use client'

import { MatrixClient } from 'matrix-js-sdk'

// Use console for client-side logging
const logger = {
  info: console.log,
  warn: console.warn,
  error: console.error,
}

/**
 * Cross-signing key types
 */
export interface CrossSigningKeys {
  masterKey: string | null
  selfSigningKey: string | null
  userSigningKey: string | null
}

/**
 * Cross-signing status information
 */
export interface CrossSigningStatus {
  isSetup: boolean
  hasMasterKey: boolean
  hasSelfSigningKey: boolean
  hasUserSigningKey: boolean
  canSignDevices: boolean
  canSignUsers: boolean
  error: string | null
}

/**
 * Device cross-signing information
 */
export interface DeviceSigningInfo {
  deviceId: string
  userId: string
  isSignedBySelf: boolean
  isSignedByUser: boolean
  isTrusted: boolean
  signatures: Record<string, Record<string, string>>
}

/**
 * Cross-signing bootstrap options
 */
export interface CrossSigningBootstrapOptions {
  setupNewCrossSigning?: boolean
  getCrossSigningKey?: (type: string) => Promise<Uint8Array>
  saveCrossSigningKeys?: (keys: Record<string, Uint8Array>) => Promise<void>
  setupNewKeyBackup?: boolean
}

/**
 * Events emitted by cross-signing manager
 */
export interface CrossSigningEvents {
  onStatusChange: (status: CrossSigningStatus) => void
  onBootstrapProgress: (phase: string, progress?: number) => void
  onBootstrapComplete: () => void
  onBootstrapError: (error: string) => void
  onDeviceSigned: (deviceId: string, userId: string) => void
  onUserSigned: (userId: string) => void
}

/**
 * Cross-signing manager for Matrix E2EE
 * Handles master key, self-signing key, and user-signing key generation and management
 */
export class CrossSigningManager {
  private client: MatrixClient
  private events: CrossSigningEvents
  private status: CrossSigningStatus
  private isBootstrapping: boolean = false

  constructor(client: MatrixClient, events: CrossSigningEvents) {
    this.client = client
    this.events = events
    this.status = {
      isSetup: false,
      hasMasterKey: false,
      hasSelfSigningKey: false,
      hasUserSigningKey: false,
      canSignDevices: false,
      canSignUsers: false,
      error: null
    }

    this.setupEventListeners()
  }

  /**
   * Set up event listeners for cross-signing events
   */
  private setupEventListeners(): void {
    // Listen for crypto events
    this.client.on('crypto.devicesUpdated' as any, this.handleDevicesUpdated.bind(this))
    this.client.on('crypto.keyBackupStatus' as any, this.handleKeyBackupStatus.bind(this))
    this.client.on('crypto.keySignatureUploadFailure' as any, this.handleSignatureUploadFailure.bind(this))
    
    logger.info('[CrossSigningManager] Event listeners set up')
  }

  /**
   * Handle devices updated event
   */
  private handleDevicesUpdated(users: string[]): void {
    logger.info('[CrossSigningManager] Devices updated for users:', users)
    this.updateStatus()
  }

  /**
   * Handle key backup status change
   */
  private handleKeyBackupStatus(enabled: boolean): void {
    logger.info('[CrossSigningManager] Key backup status changed:', enabled)
    this.updateStatus()
  }

  /**
   * Handle signature upload failure
   */
  private handleSignatureUploadFailure(failures: any): void {
    logger.error('[CrossSigningManager] Signature upload failed:', failures)
    this.status.error = 'Failed to upload key signatures'
    this.events.onStatusChange(this.status)
  }

  /**
   * Get current cross-signing status
   */
  async getStatus(): Promise<CrossSigningStatus> {
    await this.updateStatus()
    return { ...this.status }
  }

  /**
   * Update cross-signing status from Matrix client
   */
  private async updateStatus(): Promise<void> {
    try {
      const crypto = this.client.getCrypto()
      if (!crypto) {
        this.status = {
          isSetup: false,
          hasMasterKey: false,
          hasSelfSigningKey: false,
          hasUserSigningKey: false,
          canSignDevices: false,
          canSignUsers: false,
          error: 'Crypto not initialized'
        }
        this.events.onStatusChange(this.status)
        return
      }

      // Check cross-signing status using Matrix SDK methods
      const crossSigningInfo = await crypto.getCrossSigningStatus()
      const ownUserId = this.client.getUserId()!

      this.status = {
        isSetup: crossSigningInfo.publicKeysOnDevice && crossSigningInfo.privateKeysInSecretStorage,
        hasMasterKey: crossSigningInfo.publicKeysOnDevice,
        hasSelfSigningKey: crossSigningInfo.publicKeysOnDevice,
        hasUserSigningKey: crossSigningInfo.publicKeysOnDevice,
        canSignDevices: crossSigningInfo.publicKeysOnDevice,
        canSignUsers: crossSigningInfo.publicKeysOnDevice,
        error: null
      }

      logger.info('[CrossSigningManager] Status updated:', this.status)
      this.events.onStatusChange(this.status)
    } catch (error) {
      logger.error('[CrossSigningManager] Error updating status:', error)
      this.status.error = error instanceof Error ? error.message : 'Unknown error'
      this.events.onStatusChange(this.status)
    }
  }

  /**
   * Bootstrap cross-signing for the current user
   */
  async bootstrap(options: CrossSigningBootstrapOptions = {}): Promise<void> {
    if (this.isBootstrapping) {
      throw new Error('Cross-signing bootstrap already in progress')
    }

    this.isBootstrapping = true
    
    try {
      logger.info('[CrossSigningManager] Starting cross-signing bootstrap')
      this.events.onBootstrapProgress('Initializing cross-signing setup...', 0)

      const crypto = this.client.getCrypto()
      if (!crypto) {
        throw new Error('Crypto not initialized')
      }

      // Set up cross-signing keys
      this.events.onBootstrapProgress('Generating cross-signing keys...', 25)
      
      // Bootstrap cross-signing with the Matrix SDK
      await crypto.bootstrapCrossSigning({
        authUploadDeviceSigningKeys: async (makeRequest) => {
          // This would normally require interactive auth
          // For now, we'll attempt without additional auth
          try {
            await makeRequest({})
          } catch (error) {
            logger.warn('[CrossSigningManager] Auth required for cross-signing setup:', error)
            // In a real app, you'd prompt user for password/auth here
            throw new Error('Authentication required for cross-signing setup')
          }
        },
        setupNewCrossSigning: options.setupNewCrossSigning !== false
      })

      this.events.onBootstrapProgress('Uploading cross-signing keys...', 75)
      
      // Wait a moment for keys to be uploaded
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      this.events.onBootstrapProgress('Finalizing setup...', 90)
      
      // Update status
      await this.updateStatus()
      
      this.events.onBootstrapProgress('Cross-signing setup complete!', 100)
      this.events.onBootstrapComplete()
      
      logger.info('[CrossSigningManager] Cross-signing bootstrap completed successfully')
      
    } catch (error) {
      logger.error('[CrossSigningManager] Bootstrap failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      this.events.onBootstrapError(errorMessage)
      throw error
    } finally {
      this.isBootstrapping = false
    }
  }

  /**
   * Sign a device with cross-signing
   */
  async signDevice(userId: string, deviceId: string): Promise<void> {
    try {
      logger.info(`[CrossSigningManager] Signing device ${deviceId} for user ${userId}`)
      
      const crypto = this.client.getCrypto()
      if (!crypto) {
        throw new Error('Crypto not initialized')
      }

      // Get device info
      const deviceMap = await this.client.getCrypto()?.getUserDeviceInfo([userId])
      if (!deviceMap || !deviceMap.get(userId)?.get(deviceId)) {
        throw new Error(`Device ${deviceId} not found for user ${userId}`)
      }

      // Sign the device
      await crypto.setDeviceVerified(userId, deviceId, true)
      
      logger.info(`[CrossSigningManager] Successfully signed device ${deviceId}`)
      this.events.onDeviceSigned(deviceId, userId)
      
    } catch (error) {
      logger.error('[CrossSigningManager] Error signing device:', error)
      throw error
    }
  }

  /**
   * Sign another user with cross-signing
   */
  async signUser(userId: string): Promise<void> {
    try {
      logger.info(`[CrossSigningManager] Signing user ${userId}`)
      
      const crypto = this.client.getCrypto()
      if (!crypto) {
        throw new Error('Crypto not initialized')
      }

      // In Matrix SDK, user signing is typically done through device verification
      // This would require the user's cross-signing key to be trusted first
      await crypto.setDeviceVerified(userId, userId, true)
      
      logger.info(`[CrossSigningManager] Successfully signed user ${userId}`)
      this.events.onUserSigned(userId)
      
    } catch (error) {
      logger.error('[CrossSigningManager] Error signing user:', error)
      throw error
    }
  }

  /**
   * Get device signing information
   */
  async getDeviceSigningInfo(userId: string, deviceId: string): Promise<DeviceSigningInfo | null> {
    try {
      const crypto = this.client.getCrypto()
      if (!crypto) {
        return null
      }

      const deviceMap = await crypto.getUserDeviceInfo([userId])
      const device = deviceMap?.get(userId)?.get(deviceId)
      
      if (!device) {
        return null
      }

      // Check device verification status  
      const isVerified = Boolean(device.verified)
      
      return {
        deviceId,
        userId,
        isSignedBySelf: isVerified,
        isSignedByUser: isVerified,
        isTrusted: isVerified,
        signatures: {} // In real implementation, extract from device.signatures
      }
      
    } catch (error) {
      logger.error('[CrossSigningManager] Error getting device signing info:', error)
      return null
    }
  }

  /**
   * Get all cross-signing keys for the current user
   */
  async getCrossSigningKeys(): Promise<CrossSigningKeys> {
    try {
      const crypto = this.client.getCrypto()
      if (!crypto) {
        return {
          masterKey: null,
          selfSigningKey: null,
          userSigningKey: null
        }
      }

      const ownUserId = this.client.getUserId()!
      const crossSigningStatus = await crypto.getCrossSigningStatus()
      
      return {
        masterKey: crossSigningStatus.publicKeysOnDevice ? 'present' : null,
        selfSigningKey: crossSigningStatus.publicKeysOnDevice ? 'present' : null,
        userSigningKey: crossSigningStatus.publicKeysOnDevice ? 'present' : null
      }
      
    } catch (error) {
      logger.error('[CrossSigningManager] Error getting cross-signing keys:', error)
      return {
        masterKey: null,
        selfSigningKey: null,
        userSigningKey: null
      }
    }
  }

  /**
   * Check if cross-signing is ready for use
   */
  isReady(): boolean {
    return this.status.isSetup && !this.isBootstrapping
  }

  /**
   * Reset cross-signing status and re-check
   */
  async refresh(): Promise<void> {
    await this.updateStatus()
  }

  /**
   * Clean up event listeners
   */
  destroy(): void {
    this.client.removeAllListeners('crypto.devicesUpdated' as any)
    this.client.removeAllListeners('crypto.keyBackupStatus' as any)
    this.client.removeAllListeners('crypto.keySignatureUploadFailure' as any)
    
    logger.info('[CrossSigningManager] Cleaned up event listeners')
  }
}

/**
 * Utility functions for cross-signing
 */
export const CrossSigningUtils = {
  /**
   * Check if a user ID is valid
   */
  isValidUserId(userId: string): boolean {
    return typeof userId === 'string' && /^@[^:]+:[^:]+$/.test(userId)
  },

  /**
   * Check if a device ID is valid
   */
  isValidDeviceId(deviceId: string): boolean {
    return typeof deviceId === 'string' && deviceId.length > 0
  },

  /**
   * Generate a user-friendly status message
   */
  getStatusMessage(status: CrossSigningStatus): string {
    if (!status.isSetup) {
      return 'Cross-signing is not set up'
    }
    if (status.error) {
      return `Error: ${status.error}`
    }
    if (status.canSignDevices && status.canSignUsers) {
      return 'Cross-signing is fully operational'
    }
    if (status.canSignDevices) {
      return 'Can sign devices but not users'
    }
    return 'Cross-signing setup incomplete'
  },

  /**
   * Get security level based on cross-signing status
   */
  getSecurityLevel(status: CrossSigningStatus): 'none' | 'basic' | 'full' {
    if (!status.isSetup) return 'none'
    if (status.canSignDevices && status.canSignUsers) return 'full'
    return 'basic'
  }
}