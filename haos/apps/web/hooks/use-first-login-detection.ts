'use client'

import { useState, useEffect, useCallback } from 'react'
import { useMatrix } from '../components/providers/matrix-provider'

// Use console for client-side logging
const logger = {
  info: console.log,
  warn: console.warn,
  error: console.error,
}

/**
 * First login detection state interface
 */
interface FirstLoginState {
  isFirstLogin: boolean
  isNewDevice: boolean
  hasShownDevicePrompt: boolean
  deviceInfo: {
    deviceId: string | null
    isNewDeviceId: boolean
    lastLoginTimestamp: number | null
  }
  // Actions
  markDevicePromptShown: () => void
  skipDeviceVerification: () => void
  resetFirstLoginState: () => void
}

/**
 * Storage keys for first login detection
 */
const STORAGE_KEYS = {
  DEVICE_REGISTRY: 'haos-device-registry',
  FIRST_LOGIN_COMPLETED: 'haos-first-login-completed', 
  DEVICE_PROMPT_SHOWN: 'haos-device-prompt-shown',
  LAST_LOGIN_TIMESTAMP: 'haos-last-login-timestamp'
} as const

/**
 * Device registry entry interface
 */
interface DeviceRegistryEntry {
  deviceId: string
  firstSeenAt: number
  lastSeenAt: number
  displayName?: string
  hasCompletedVerification: boolean
}

/**
 * Device registry structure
 */
interface DeviceRegistry {
  devices: Record<string, DeviceRegistryEntry>
  currentDeviceId: string | null
}

/**
 * Hook for detecting first-time login and new device scenarios
 */
export function useFirstLoginDetection(): FirstLoginState {
  const { client, isAuthenticated, userId } = useMatrix()
  const [state, setState] = useState<Omit<FirstLoginState, 'markDevicePromptShown' | 'skipDeviceVerification' | 'resetFirstLoginState'>>({
    isFirstLogin: false,
    isNewDevice: false, 
    hasShownDevicePrompt: false,
    deviceInfo: {
      deviceId: null,
      isNewDeviceId: false,
      lastLoginTimestamp: null
    }
  })

  /**
   * Get device registry from localStorage
   */
  const getDeviceRegistry = useCallback((): DeviceRegistry => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DEVICE_REGISTRY)
      if (!stored) {
        return { devices: {}, currentDeviceId: null }
      }
      return JSON.parse(stored)
    } catch (error) {
      logger.warn('Failed to parse device registry, resetting:', error)
      return { devices: {}, currentDeviceId: null }
    }
  }, [])

  /**
   * Save device registry to localStorage
   */
  const saveDeviceRegistry = useCallback((registry: DeviceRegistry) => {
    try {
      localStorage.setItem(STORAGE_KEYS.DEVICE_REGISTRY, JSON.stringify(registry))
    } catch (error) {
      logger.error('Failed to save device registry:', error)
    }
  }, [])

  /**
   * Get current device ID from Matrix client
   */
  const getCurrentDeviceId = useCallback((): string | null => {
    return client?.getDeviceId() || localStorage.getItem('haos-device-id') || null
  }, [client])

  /**
   * Check if this is the first login ever for this user
   */
  const checkFirstLogin = useCallback((): boolean => {
    // Check if user has ever completed first-run
    const firstRunCompleted = localStorage.getItem(STORAGE_KEYS.FIRST_LOGIN_COMPLETED)
    return !firstRunCompleted
  }, [])

  /**
   * Check if this is a new device
   */
  const checkNewDevice = useCallback((deviceId: string): boolean => {
    const registry = getDeviceRegistry()
    return !registry.devices[deviceId]
  }, [getDeviceRegistry])

  /**
   * Check if device verification prompt has been shown for current session
   */
  const checkPromptShown = useCallback((): boolean => {
    // Check session-level flag (resets on page refresh)
    const sessionShown = sessionStorage.getItem(STORAGE_KEYS.DEVICE_PROMPT_SHOWN)
    return !!sessionShown
  }, [])

  /**
   * Register current device in the registry
   */
  const registerCurrentDevice = useCallback((deviceId: string, isNew: boolean = false) => {
    const registry = getDeviceRegistry()
    const now = Date.now()
    
    if (isNew || !registry.devices[deviceId]) {
      // New device
      registry.devices[deviceId] = {
        deviceId,
        firstSeenAt: now,
        lastSeenAt: now,
        displayName: 'HAOS Web Client',
        hasCompletedVerification: false
      }
      logger.info('Registered new device:', deviceId)
    } else {
      // Update existing device
      registry.devices[deviceId].lastSeenAt = now
      logger.info('Updated existing device timestamp:', deviceId)
    }

    registry.currentDeviceId = deviceId
    saveDeviceRegistry(registry)
    
    // Update last login timestamp
    localStorage.setItem(STORAGE_KEYS.LAST_LOGIN_TIMESTAMP, now.toString())
  }, [getDeviceRegistry, saveDeviceRegistry])

  /**
   * Update first login detection state
   */
  const updateDetectionState = useCallback(() => {
    if (!isAuthenticated || !userId) {
      setState(prev => ({
        ...prev,
        isFirstLogin: false,
        isNewDevice: false,
        hasShownDevicePrompt: false,
        deviceInfo: {
          deviceId: null,
          isNewDeviceId: false,
          lastLoginTimestamp: null
        }
      }))
      return
    }

    const currentDeviceId = getCurrentDeviceId()
    if (!currentDeviceId) {
      logger.warn('No device ID available')
      return
    }

    const isFirstLogin = checkFirstLogin()
    const isNewDevice = checkNewDevice(currentDeviceId)
    const hasShownDevicePrompt = checkPromptShown()
    const lastLoginTimestamp = localStorage.getItem(STORAGE_KEYS.LAST_LOGIN_TIMESTAMP)

    // Register the device if it's new or first login
    if (isNewDevice || isFirstLogin) {
      registerCurrentDevice(currentDeviceId, isNewDevice)
    }

    setState({
      isFirstLogin,
      isNewDevice,
      hasShownDevicePrompt,
      deviceInfo: {
        deviceId: currentDeviceId,
        isNewDeviceId: isNewDevice,
        lastLoginTimestamp: lastLoginTimestamp ? parseInt(lastLoginTimestamp) : null
      }
    })

    logger.info('First login detection state updated:', {
      isFirstLogin,
      isNewDevice,
      hasShownDevicePrompt,
      deviceId: currentDeviceId
    })

  }, [isAuthenticated, userId, getCurrentDeviceId, checkFirstLogin, checkNewDevice, checkPromptShown, registerCurrentDevice])

  /**
   * Mark device verification prompt as shown for this session
   */
  const markDevicePromptShown = useCallback(() => {
    sessionStorage.setItem(STORAGE_KEYS.DEVICE_PROMPT_SHOWN, 'true')
    setState(prev => ({
      ...prev,
      hasShownDevicePrompt: true
    }))
    logger.info('Device prompt marked as shown')
  }, [])

  /**
   * Skip device verification (user chose to skip)
   */
  const skipDeviceVerification = useCallback(() => {
    const currentDeviceId = getCurrentDeviceId()
    if (currentDeviceId) {
      const registry = getDeviceRegistry()
      if (registry.devices[currentDeviceId]) {
        // Mark as verification skipped (not completed, but acknowledged)
        registry.devices[currentDeviceId].hasCompletedVerification = false
        saveDeviceRegistry(registry)
      }
    }
    
    markDevicePromptShown()
    logger.info('Device verification skipped by user')
  }, [getCurrentDeviceId, getDeviceRegistry, saveDeviceRegistry, markDevicePromptShown])

  /**
   * Reset first login state (useful for testing or account reset)
   */
  const resetFirstLoginState = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.FIRST_LOGIN_COMPLETED)
    localStorage.removeItem(STORAGE_KEYS.DEVICE_REGISTRY)
    localStorage.removeItem(STORAGE_KEYS.LAST_LOGIN_TIMESTAMP)
    sessionStorage.removeItem(STORAGE_KEYS.DEVICE_PROMPT_SHOWN)
    
    updateDetectionState()
    logger.info('First login state reset')
  }, [updateDetectionState])

  /**
   * Mark first login as completed
   */
  const markFirstLoginCompleted = useCallback(() => {
    localStorage.setItem(STORAGE_KEYS.FIRST_LOGIN_COMPLETED, 'true')
    logger.info('First login marked as completed')
  }, [])

  /**
   * Update state when authentication status changes
   */
  useEffect(() => {
    updateDetectionState()
  }, [isAuthenticated, userId, client, updateDetectionState])

  /**
   * Mark first login as completed when user successfully authenticates for the first time
   */
  useEffect(() => {
    if (isAuthenticated && state.isFirstLogin) {
      // Wait a bit to ensure everything is set up
      const timer = setTimeout(() => {
        markFirstLoginCompleted()
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [isAuthenticated, state.isFirstLogin])

  return {
    ...state,
    markDevicePromptShown,
    skipDeviceVerification,
    resetFirstLoginState
  }
}

// Note: useDeviceVerificationPromptTrigger has been moved to device-verification-prompt-modal.tsx 
// to avoid circular dependencies