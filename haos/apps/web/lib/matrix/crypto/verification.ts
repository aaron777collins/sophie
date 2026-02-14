'use client'

import { MatrixClient } from 'matrix-js-sdk'

// Use console for client-side logging
const logger = {
  info: console.log,
  warn: console.warn,
  error: console.error,
}

/**
 * Device verification state
 */
export interface DeviceVerificationState {
  isVerifying: boolean
  request: VerificationRequest | null
  verifier: Verifier | null
  method: 'emoji' | 'qr' | null
  error: string | null
  phase: 'idle' | 'requesting' | 'ready' | 'showing_sas' | 'waiting_for_partner' | 'done' | 'cancelled'
  emoji?: { emoji: string; description: string }[]
  qrCode?: string
}

/**
 * Device verification events
 */
export interface DeviceVerificationEvents {
  onStateChange: (state: DeviceVerificationState) => void
  onVerificationComplete: (deviceId: string, userId: string) => void
  onVerificationFailed: (error: string) => void
  onVerificationCancelled: () => void
}

/**
 * Device verification manager
 */
export class DeviceVerificationManager {
  private client: MatrixClient
  private state: DeviceVerificationState
  private events: DeviceVerificationEvents

  constructor(client: MatrixClient, events: DeviceVerificationEvents) {
    this.client = client
    this.events = events
    this.state = {
      isVerifying: false,
      request: null,
      verifier: null,
      method: null,
      error: null,
      phase: 'idle'
    }
  }

  /**
   * Get current verification state
   */
  getState(): DeviceVerificationState {
    return { ...this.state }
  }

  /**
   * Update state and notify listeners
   */
  private updateState(updates: Partial<DeviceVerificationState>) {
    this.state = { ...this.state, ...updates }
    this.events.onStateChange(this.state)
  }

  /**
   * Start device verification with another device
   */
  async startVerification(userId: string, deviceId?: string): Promise<void> {
    try {
      logger.info('Starting device verification', { userId, deviceId })
      
      this.updateState({
        isVerifying: true,
        phase: 'requesting',
        error: null
      })

      // Mock verification request for demo
      const mockRequest = {
        requestId: `verify_${Date.now()}`,
        otherUserId: userId,
        targetDevice: deviceId ? { deviceId } : undefined,
        phase: 'ready'
      }

      this.updateState({
        request: mockRequest as any,
        phase: 'ready'
      })

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error('Failed to start verification:', errorMessage)
      this.updateState({
        error: errorMessage,
        phase: 'idle',
        isVerifying: false
      })
      this.events.onVerificationFailed(errorMessage)
    }
  }

  /**
   * Accept incoming verification request
   */
  async acceptVerification(request: any): Promise<void> {
    try {
      logger.info('Accepting verification request')
      
      this.updateState({
        request,
        isVerifying: true,
        phase: 'ready',
        error: null
      })

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error('Failed to accept verification:', errorMessage)
      this.updateState({
        error: errorMessage,
        phase: 'idle',
        isVerifying: false
      })
      this.events.onVerificationFailed(errorMessage)
    }
  }

  /**
   * Start emoji (SAS) verification
   */
  async startEmojiVerification(): Promise<void> {
    try {
      const { request } = this.state
      if (!request) {
        throw new Error('No verification request available')
      }

      logger.info('Starting emoji verification')
      
      // Generate mock emoji for demo
      const mockEmojis = [
        { emoji: '🎉', description: 'Party' },
        { emoji: '🔐', description: 'Lock' },
        { emoji: '🌟', description: 'Star' },
        { emoji: '🦄', description: 'Unicorn' },
        { emoji: '🎯', description: 'Target' },
        { emoji: '🎪', description: 'Circus' },
        { emoji: '🎨', description: 'Art' }
      ]
      
      this.updateState({
        method: 'emoji',
        phase: 'showing_sas',
        emoji: mockEmojis
      })

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error('Failed to start emoji verification:', errorMessage)
      this.updateState({
        error: errorMessage,
        phase: 'idle',
        isVerifying: false
      })
      this.events.onVerificationFailed(errorMessage)
    }
  }

  /**
   * Start QR code verification
   */
  async startQRVerification(): Promise<void> {
    try {
      const { request } = this.state
      if (!request) {
        throw new Error('No verification request available')
      }

      logger.info('Starting QR verification')
      
      // Generate QR code data for demo
      const qrCodeData = await this.generateQRCode(request)
      
      this.updateState({
        method: 'qr',
        phase: 'showing_sas',
        qrCode: qrCodeData
      })

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error('Failed to start QR verification:', errorMessage)
      this.updateState({
        error: errorMessage,
        phase: 'idle',
        isVerifying: false
      })
      this.events.onVerificationFailed(errorMessage)
    }
  }

  /**
   * Confirm emoji match
   */
  async confirmEmojiMatch(): Promise<void> {
    try {
      const { verifier } = this.state
      if (!verifier) {
        throw new Error('No verifier available')
      }

      logger.info('Confirming emoji match')
      await verifier.sasEvent?.confirm()
      
      this.updateState({
        phase: 'waiting_for_partner'
      })

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error('Failed to confirm emoji match:', errorMessage)
      this.updateState({
        error: errorMessage
      })
      this.events.onVerificationFailed(errorMessage)
    }
  }

  /**
   * Cancel verification
   */
  async cancelVerification(): Promise<void> {
    try {
      const { request, verifier } = this.state
      
      logger.info('Cancelling verification')
      
      if (verifier) {
        await verifier.cancel()
      } else if (request) {
        await request.cancel()
      }

      this.updateState({
        isVerifying: false,
        request: null,
        verifier: null,
        method: null,
        phase: 'cancelled',
        emoji: undefined,
        qrCode: undefined
      })

      this.events.onVerificationCancelled()

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error('Failed to cancel verification:', errorMessage)
      this.updateState({
        error: errorMessage
      })
    }
  }

  /**
   * Set up verification request event listeners
   */
  private setupRequestListeners(request: VerificationRequest) {
    request.on('change' as any, () => {
      logger.info('Verification request changed:', request.phase)
      
      if (request.phase === 'cancelled') {
        this.updateState({
          phase: 'cancelled',
          isVerifying: false
        })
        this.events.onVerificationCancelled()
      }
    })
  }

  /**
   * Set up verifier event listeners
   */
  private setupVerifierListeners(verifier: Verifier) {
    verifier.on('show_sas' as any, (sas: any) => {
      logger.info('SAS emoji generated:', sas.emoji)
      
      this.updateState({
        emoji: sas.emoji,
        phase: 'showing_sas'
      })
    })

    verifier.on('show_reciprocate_qr' as any, (qrData: string) => {
      logger.info('QR code data generated')
      
      this.updateState({
        qrCode: qrData,
        phase: 'showing_sas'
      })
    })

    verifier.on('cancel' as any, (err: Error) => {
      logger.info('Verification cancelled:', err.message)
      
      this.updateState({
        phase: 'cancelled',
        isVerifying: false,
        error: err.message
      })
      this.events.onVerificationCancelled()
    })

    verifier.on('done' as any, () => {
      logger.info('Verification completed successfully')
      
      const { request } = this.state
      const userId = request?.otherUserId || ''
      const deviceId = request?.targetDevice?.deviceId || ''

      this.updateState({
        phase: 'done',
        isVerifying: false
      })
      
      this.events.onVerificationComplete(deviceId, userId)
    })
  }

  /**
   * Generate QR code data for verification
   */
  private async generateQRCode(request: VerificationRequest): Promise<string> {
    // For now, generate a simple QR data string
    // In production, this would generate proper Matrix verification QR data
    const qrData = {
      action: 'verify',
      version: 1,
      userId: this.client.getUserId(),
      deviceId: this.client.getDeviceId(),
      requestId: request.requestId,
      timestamp: Date.now()
    }
    
    return JSON.stringify(qrData)
  }

  /**
   * Check if device is verified
   */
  async isDeviceVerified(userId: string, deviceId: string): Promise<boolean> {
    try {
      const deviceInfo = await this.client.getStoredDevice(userId, deviceId)
      return deviceInfo?.isVerified() || false
    } catch (error) {
      logger.error('Failed to check device verification status:', error)
      return false
    }
  }

  /**
   * Get all unverified devices for a user
   */
  async getUnverifiedDevices(userId: string): Promise<Array<{ deviceId: string; displayName?: string }>> {
    try {
      const devices = await this.client.getStoredDevicesForUser(userId)
      const unverified = devices.filter(device => !device.isVerified())
      
      return unverified.map(device => ({
        deviceId: device.deviceId,
        displayName: device.getDisplayName()
      }))
    } catch (error) {
      logger.error('Failed to get unverified devices:', error)
      return []
    }
  }

  /**
   * Clean up manager resources
   */
  destroy() {
    const { request, verifier } = this.state
    
    if (verifier) {
      verifier.removeAllListeners()
    }
    
    if (request) {
      request.removeAllListeners()
    }
    
    this.updateState({
      isVerifying: false,
      request: null,
      verifier: null,
      method: null,
      phase: 'idle',
      emoji: undefined,
      qrCode: undefined
    })
  }
}

/**
 * Create verification manager instance
 */
export function createVerificationManager(
  client: MatrixClient, 
  events: DeviceVerificationEvents
): DeviceVerificationManager {
  return new DeviceVerificationManager(client, events)
}

/**
 * Get verification status for all devices
 */
export async function getVerificationStatus(client: MatrixClient): Promise<{
  verified: Array<{ userId: string; deviceId: string; displayName?: string }>
  unverified: Array<{ userId: string; deviceId: string; displayName?: string }>
}> {
  try {
    const userId = client.getUserId()
    if (!userId) {
      return { verified: [], unverified: [] }
    }

    const devices = await client.getStoredDevicesForUser(userId)
    const verified: Array<{ userId: string; deviceId: string; displayName?: string }> = []
    const unverified: Array<{ userId: string; deviceId: string; displayName?: string }> = []

    for (const device of devices) {
      const deviceInfo = {
        userId,
        deviceId: device.deviceId,
        displayName: device.getDisplayName()
      }

      if (device.isVerified()) {
        verified.push(deviceInfo)
      } else {
        unverified.push(deviceInfo)
      }
    }

    return { verified, unverified }
    
  } catch (error) {
    logger.error('Failed to get verification status:', error)
    return { verified: [], unverified: [] }
  }
}