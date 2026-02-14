'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
// Using simplified verification request interface from our verification utils
import { useMatrix } from '../components/providers/matrix-provider'
import { 
  DeviceVerificationManager, 
  DeviceVerificationState,
  DeviceVerificationEvents,
  createVerificationManager,
  getVerificationStatus
} from '../lib/matrix/crypto/verification'

// Use console for client-side logging
const logger = {
  info: console.log,
  warn: console.warn,
  error: console.error,
}

/**
 * Device info interface
 */
interface DeviceInfo {
  userId: string
  deviceId: string
  displayName?: string
}

/**
 * Hook state interface
 */
interface UseDeviceVerificationState {
  // Manager state
  verificationState: DeviceVerificationState
  manager: DeviceVerificationManager | null
  
  // Device lists
  verifiedDevices: DeviceInfo[]
  unverifiedDevices: DeviceInfo[]
  
  // UI state
  showModal: boolean
  isLoading: boolean
  
  // Actions
  startVerification: (userId: string, deviceId?: string) => Promise<void>
  acceptVerification: (request: any) => Promise<void>
  startEmojiVerification: () => Promise<void>
  startQRVerification: () => Promise<void>
  confirmEmojiMatch: () => Promise<void>
  cancelVerification: () => Promise<void>
  checkDeviceVerification: (userId: string, deviceId: string) => Promise<boolean>
  refreshDeviceLists: () => Promise<void>
  openModal: () => void
  closeModal: () => void
}

/**
 * Hook for device verification functionality
 */
export function useDeviceVerification(): UseDeviceVerificationState {
  const { client, isAuthenticated, isCryptoReady } = useMatrix()
  
  // Manager and state
  const [manager, setManager] = useState<DeviceVerificationManager | null>(null)
  const [verificationState, setVerificationState] = useState<DeviceVerificationState>({
    isVerifying: false,
    request: null,
    verifier: null,
    method: null,
    error: null,
    phase: 'idle'
  })
  
  // Device lists
  const [verifiedDevices, setVerifiedDevices] = useState<DeviceInfo[]>([])
  const [unverifiedDevices, setUnverifiedDevices] = useState<DeviceInfo[]>([])
  
  // UI state
  const [showModal, setShowModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  // Ref to track if manager is initialized
  const managerRef = useRef<DeviceVerificationManager | null>(null)

  /**
   * Initialize verification manager when client is ready
   */
  useEffect(() => {
    if (!client || !isAuthenticated || !isCryptoReady) {
      // Clean up existing manager
      if (managerRef.current) {
        managerRef.current.destroy()
        managerRef.current = null
        setManager(null)
      }
      return
    }

    logger.info('Initializing device verification manager')
    
    const events: DeviceVerificationEvents = {
      onStateChange: (state) => {
        logger.info('Verification state changed:', state.phase)
        setVerificationState(state)
      },
      
      onVerificationComplete: (deviceId, userId) => {
        logger.info('Device verification completed:', { deviceId, userId })
        // Refresh device lists
        refreshDeviceLists()
        setShowModal(false)
      },
      
      onVerificationFailed: (error) => {
        logger.error('Device verification failed:', error)
        // Modal stays open to show error
      },
      
      onVerificationCancelled: () => {
        logger.info('Device verification cancelled')
        setShowModal(false)
      }
    }

    const newManager = createVerificationManager(client, events)
    managerRef.current = newManager
    setManager(newManager)

    // Set up Matrix event listeners
    const handleIncomingVerificationRequest = (request: any) => {
      logger.info('Incoming verification request received:', request.requestId)
      
      // Auto-show modal for incoming requests
      setShowModal(true)
      
      // Update state with incoming request
      setVerificationState(prev => ({
        ...prev,
        request,
        phase: 'ready'
      }))
    }

    // Listen for verification requests
    client.on('crypto.verification.request' as any, handleIncomingVerificationRequest)

    // Initial device list load
    refreshDeviceLists()

    return () => {
      client.off('crypto.verification.request' as any, handleIncomingVerificationRequest)
      if (managerRef.current) {
        managerRef.current.destroy()
        managerRef.current = null
      }
    }
  }, [client, isAuthenticated, isCryptoReady])

  /**
   * Start device verification
   */
  const startVerification = useCallback(async (userId: string, deviceId?: string) => {
    if (!manager) {
      throw new Error('Verification manager not available')
    }

    setShowModal(true)
    await manager.startVerification(userId, deviceId)
  }, [manager])

  /**
   * Accept incoming verification request
   */
  const acceptVerification = useCallback(async (request: any) => {
    if (!manager) {
      throw new Error('Verification manager not available')
    }

    await manager.acceptVerification(request)
  }, [manager])

  /**
   * Start emoji verification
   */
  const startEmojiVerification = useCallback(async () => {
    if (!manager) {
      throw new Error('Verification manager not available')
    }

    await manager.startEmojiVerification()
  }, [manager])

  /**
   * Start QR verification
   */
  const startQRVerification = useCallback(async () => {
    if (!manager) {
      throw new Error('Verification manager not available')
    }

    await manager.startQRVerification()
  }, [manager])

  /**
   * Confirm emoji match
   */
  const confirmEmojiMatch = useCallback(async () => {
    if (!manager) {
      throw new Error('Verification manager not available')
    }

    await manager.confirmEmojiMatch()
  }, [manager])

  /**
   * Cancel verification
   */
  const cancelVerification = useCallback(async () => {
    if (!manager) {
      throw new Error('Verification manager not available')
    }

    await manager.cancelVerification()
    setShowModal(false)
  }, [manager])

  /**
   * Check if specific device is verified
   */
  const checkDeviceVerification = useCallback(async (userId: string, deviceId: string): Promise<boolean> => {
    if (!manager) {
      return false
    }

    return await manager.isDeviceVerified(userId, deviceId)
  }, [manager])

  /**
   * Refresh device verification lists
   */
  const refreshDeviceLists = useCallback(async () => {
    if (!client || !isCryptoReady) {
      return
    }

    try {
      setIsLoading(true)
      logger.info('Refreshing device verification status')
      
      const status = await getVerificationStatus(client)
      
      setVerifiedDevices(status.verified)
      setUnverifiedDevices(status.unverified)
      
      logger.info('Device lists updated:', { 
        verified: status.verified.length, 
        unverified: status.unverified.length 
      })
      
    } catch (error) {
      logger.error('Failed to refresh device lists:', error)
    } finally {
      setIsLoading(false)
    }
  }, [client, isCryptoReady])

  /**
   * Open verification modal
   */
  const openModal = useCallback(() => {
    setShowModal(true)
  }, [])

  /**
   * Close verification modal
   */
  const closeModal = useCallback(() => {
    setShowModal(false)
    
    // Cancel any active verification when closing
    if (verificationState.isVerifying && manager) {
      manager.cancelVerification()
    }
  }, [verificationState.isVerifying, manager])

  /**
   * Load device lists on mount and crypto ready
   */
  useEffect(() => {
    if (isCryptoReady) {
      refreshDeviceLists()
    }
  }, [isCryptoReady, refreshDeviceLists])

  return {
    // Manager state
    verificationState,
    manager,
    
    // Device lists
    verifiedDevices,
    unverifiedDevices,
    
    // UI state
    showModal,
    isLoading,
    
    // Actions
    startVerification,
    acceptVerification,
    startEmojiVerification,
    startQRVerification,
    confirmEmojiMatch,
    cancelVerification,
    checkDeviceVerification,
    refreshDeviceLists,
    openModal,
    closeModal
  }
}

/**
 * Lightweight hook for checking verification status
 */
export function useDeviceVerificationStatus(userId?: string, deviceId?: string) {
  const { client, isCryptoReady } = useMatrix()
  const [isVerified, setIsVerified] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!client || !isCryptoReady || !userId || !deviceId) {
      setIsVerified(null)
      return
    }

    const checkStatus = async () => {
      try {
        setIsLoading(true)
        const device = await client.getStoredDevice(userId, deviceId)
        setIsVerified(device?.isVerified() || false)
      } catch (error) {
        logger.error('Failed to check device verification status:', error)
        setIsVerified(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkStatus()
  }, [client, isCryptoReady, userId, deviceId])

  return { isVerified, isLoading }
}

/**
 * Hook for monitoring unverified devices and showing prompts
 */
export function useUnverifiedDevicePrompts() {
  const { unverifiedDevices, refreshDeviceLists } = useDeviceVerification()
  const [dismissedDevices, setDismissedDevices] = useState<Set<string>>(new Set())
  const [shouldShowPrompt, setShouldShowPrompt] = useState(false)

  // Check for new unverified devices
  useEffect(() => {
    const newUnverified = unverifiedDevices.filter(device => 
      !dismissedDevices.has(`${device.userId}-${device.deviceId}`)
    )

    setShouldShowPrompt(newUnverified.length > 0)
  }, [unverifiedDevices, dismissedDevices])

  const dismissDevice = useCallback((userId: string, deviceId: string) => {
    setDismissedDevices(prev => new Set(prev).add(`${userId}-${deviceId}`))
  }, [])

  const dismissAll = useCallback(() => {
    const allDeviceIds = unverifiedDevices.map(device => `${device.userId}-${device.deviceId}`)
    setDismissedDevices(new Set(allDeviceIds))
  }, [unverifiedDevices])

  return {
    unverifiedDevices: unverifiedDevices.filter(device => 
      !dismissedDevices.has(`${device.userId}-${device.deviceId}`)
    ),
    shouldShowPrompt,
    dismissDevice,
    dismissAll,
    refreshDeviceLists
  }
}