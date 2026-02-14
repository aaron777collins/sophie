'use client'

import { MatrixClient, createClient } from 'matrix-js-sdk'
import { IndexedDBCryptoStore } from './crypto/store'
// Use console instead of matrix logger for client-side compatibility
const logger = {
  info: console.log,
  warn: console.warn,
  error: console.error,
}

/**
 * Enhanced Matrix client with Rust crypto support
 * Provides E2EE capabilities through the matrix-sdk-crypto-wasm package
 */

let globalClient: MatrixClient | null = null
let globalCryptoStore: IndexedDBCryptoStore | null = null

/**
 * Initialize Matrix client with Rust crypto support
 */
export async function initializeMatrixClient(baseUrl: string, accessToken?: string, userId?: string): Promise<MatrixClient> {
  try {
    logger.info('Initializing Matrix client with crypto support')

    // If we already have a client, return it
    if (globalClient && globalClient.baseUrl === baseUrl) {
      return globalClient
    }

    // Shutdown existing client if it exists
    if (globalClient) {
      await shutdownMatrixClient()
    }

    // Create crypto store if we have user credentials
    if (userId) {
      globalCryptoStore = new IndexedDBCryptoStore(userId)
      await globalCryptoStore.startup()
      logger.info('Crypto store initialized for user:', userId)
    }

    // Create Matrix client
    const clientConfig: any = {
      baseUrl,
      userId,
      accessToken,
      deviceId: getDeviceId(),
      timelineSupport: true,
      unstableClientRelationAggregation: true,
    }

    globalClient = createClient(clientConfig)

    // Initialize Rust crypto if we have credentials and store
    if (accessToken && userId && globalCryptoStore) {
      await initRustCrypto(globalClient, userId)
    }

    logger.info('Matrix client initialized successfully')
    return globalClient

  } catch (error) {
    logger.error('Failed to initialize Matrix client:', error)
    throw error
  }
}

/**
 * Initialize Rust crypto for the Matrix client
 */
async function initRustCrypto(client: MatrixClient, userId: string): Promise<void> {
  try {
    logger.info('Initializing Rust crypto...')

    // Import the crypto module dynamically to handle potential loading issues
    const cryptoModule = await import('@matrix-org/matrix-sdk-crypto-wasm')
    
    // Initialize the WASM module
    await cryptoModule.initAsync()

    // Set up crypto on the client using IndexedDB
    await client.initRustCrypto({
      useIndexedDB: true,
    })

    logger.info('Rust crypto initialized successfully')

  } catch (error) {
    logger.error('Failed to initialize Rust crypto:', error)
    // Don't throw here - client should still work without crypto
    // but log the error for debugging
  }
}

/**
 * Shutdown Matrix client and cleanup resources
 */
export async function shutdownMatrixClient(): Promise<void> {
  try {
    if (globalClient) {
      logger.info('Shutting down Matrix client...')
      
      // Stop client sync
      globalClient.stopClient()
      
      // Clean up crypto
      if (globalClient.isCryptoEnabled()) {
        await globalClient.clearStores()
      }
      
      globalClient = null
    }

    if (globalCryptoStore) {
      await globalCryptoStore.shutdown()
      globalCryptoStore = null
    }

    logger.info('Matrix client shut down successfully')

  } catch (error) {
    logger.error('Error shutting down Matrix client:', error)
  }
}

/**
 * Get the current Matrix client instance
 */
export function getMatrixClient(): MatrixClient | null {
  return globalClient
}

/**
 * Check if crypto is enabled and ready
 */
export function isCryptoReady(): boolean {
  return globalClient?.isCryptoEnabled() ?? false
}

/**
 * Get or create a device ID for this client
 */
function getDeviceId(): string {
  const stored = localStorage.getItem('haos-device-id')
  if (stored) {
    return stored
  }

  // Generate a new device ID
  const deviceId = `HAOS_${Math.random().toString(36).substr(2, 9)}`
  localStorage.setItem('haos-device-id', deviceId)
  return deviceId
}

/**
 * Check if the browser supports the required crypto features
 */
function supportsCrypto(): boolean {
  return typeof window !== 'undefined' && 
         typeof window.indexedDB !== 'undefined' &&
         typeof WebAssembly !== 'undefined'
}

/**
 * Login with password and initialize crypto
 */
export async function loginWithPassword(homeserver: string, username: string, password: string): Promise<MatrixClient> {
  try {
    logger.info('Logging in with password...')

    // Create temporary client for login
    const tempClient = createClient({ baseUrl: homeserver })
    
    const response = await tempClient.login('m.login.password', {
      user: username,
      password: password,
      device_id: getDeviceId(),
      initial_device_display_name: 'HAOS Web Client',
    })

    // Store session data
    const sessionData = {
      baseUrl: homeserver,
      accessToken: response.access_token,
      userId: response.user_id,
      deviceId: response.device_id,
    }
    
    localStorage.setItem('haos-matrix-session', JSON.stringify(sessionData))
    
    // Initialize full client with crypto
    const authenticatedClient = await initializeMatrixClient(
      homeserver,
      response.access_token,
      response.user_id
    )
    
    // Start the client
    await authenticatedClient.startClient({
      initialSyncLimit: 20,
    })

    logger.info('Login completed successfully')
    return authenticatedClient

  } catch (error) {
    logger.error('Login failed:', error)
    throw error
  }
}

/**
 * Logout and cleanup
 */
export async function logout(): Promise<void> {
  try {
    if (globalClient) {
      // Attempt to logout from server
      try {
        await globalClient.logout()
      } catch (error) {
        logger.warn('Server logout failed, continuing with local cleanup:', error)
      }
    }
  } catch (error) {
    logger.error('Logout error:', error)
  } finally {
    // Always clean up locally
    localStorage.removeItem('haos-matrix-session')
    localStorage.removeItem('haos-first-run-completed')
    await shutdownMatrixClient()
  }
}

/**
 * Get session information from localStorage
 */
export function getStoredSession(): {
  baseUrl: string
  accessToken: string
  userId: string
  deviceId: string
} | null {
  const stored = localStorage.getItem('haos-matrix-session')
  if (!stored) {
    return null
  }

  try {
    return JSON.parse(stored)
  } catch (error) {
    logger.error('Failed to parse stored session:', error)
    localStorage.removeItem('haos-matrix-session')
    return null
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getStoredSession()
}