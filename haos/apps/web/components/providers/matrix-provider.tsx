'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { MatrixClient, MatrixEvent, Room, ClientEvent } from 'matrix-js-sdk'
import { 
  initializeMatrixClient, 
  shutdownMatrixClient,
  getMatrixClient, 
  isCryptoReady,
  getStoredSession,
  loginWithPassword as clientLogin,
  logout as clientLogout 
} from '../../lib/matrix/client'
import { DeviceVerificationPromptTrigger } from '../modals/device-verification-prompt-modal'
// Use console instead of matrix logger for client-side compatibility
const logger = {
  info: console.log,
  warn: console.warn,
  error: console.error,
}

/**
 * Matrix context state interface
 */
interface MatrixContextState {
  client: MatrixClient | null
  isLoading: boolean
  isAuthenticated: boolean
  isCryptoReady: boolean
  error: string | null
  userId: string | null
  
  // Actions
  loginWithPassword: (homeserver: string, username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshCryptoStatus: () => void
}

/**
 * Matrix context
 */
const MatrixContext = createContext<MatrixContextState | null>(null)

/**
 * Matrix provider props
 */
interface MatrixProviderProps {
  children: ReactNode
}

/**
 * Matrix provider component that manages Matrix client and crypto state
 */
export function MatrixProvider({ children }: MatrixProviderProps) {
  const [client, setClient] = useState<MatrixClient | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [cryptoReady, setCryptoReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  /**
   * Initialize Matrix client on mount
   */
  useEffect(() => {
    initializeFromStorage()
    
    // Cleanup on unmount
    return () => {
      shutdownMatrixClient()
    }
  }, [])

  /**
   * Set up event listeners when client changes
   */
  useEffect(() => {
    if (!client) return

    const handleSyncState = (state: string, prevState: string | null, data: any) => {
      logger.info('Matrix sync state:', state, prevState, data)
      
      if (state === 'PREPARED') {
        // Client is ready and synced
        refreshCryptoStatus()
      } else if (state === 'ERROR') {
        setError('Sync error: ' + (data?.error?.message || 'Unknown error'))
      }
    }

    const handleCryptoEvent = (event: string, data?: any) => {
      logger.info('Crypto event:', event, data)
      refreshCryptoStatus()
    }

    // Listen for sync state changes
    client.on(ClientEvent.Sync, handleSyncState)
    
    // Listen for crypto events
    client.on('crypto.deviceVerificationChanged' as any, handleCryptoEvent)
    client.on('crypto.deviceList' as any, handleCryptoEvent)
    client.on('crypto.roomKeyRequest' as any, handleCryptoEvent)
    client.on('crypto.roomKeyRequestCancellation' as any, handleCryptoEvent)

    return () => {
      client.off(ClientEvent.Sync, handleSyncState)
      client.off('crypto.deviceVerificationChanged' as any, handleCryptoEvent)
      client.off('crypto.deviceList' as any, handleCryptoEvent)
      client.off('crypto.roomKeyRequest' as any, handleCryptoEvent)
      client.off('crypto.roomKeyRequestCancellation' as any, handleCryptoEvent)
    }
  }, [client])

  /**
   * Initialize client from stored session
   */
  async function initializeFromStorage() {
    try {
      setIsLoading(true)
      setError(null)

      const session = getStoredSession()
      
      if (session) {
        logger.info('Restoring Matrix session for:', session.userId)
        
        const restoredClient = await initializeMatrixClient(
          session.baseUrl,
          session.accessToken,
          session.userId
        )

        setClient(restoredClient)
        setUserId(session.userId)
        setIsAuthenticated(true)

        // Start client sync
        await restoredClient.startClient({
          initialSyncLimit: 20,
        })

        logger.info('Matrix client restored and started')
      } else {
        logger.info('No stored session found')
        setIsAuthenticated(false)
      }

    } catch (error: any) {
      logger.error('Failed to initialize from storage:', error)
      setError(error.message || 'Failed to initialize Matrix client')
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Login with username and password
   */
  async function loginWithPassword(homeserver: string, username: string, password: string) {
    try {
      setIsLoading(true)
      setError(null)

      logger.info('Logging in to:', homeserver, 'as:', username)
      
      const newClient = await clientLogin(homeserver, username, password)
      
      setClient(newClient)
      setUserId(newClient.getUserId())
      setIsAuthenticated(true)

      logger.info('Login successful')

    } catch (error: any) {
      logger.error('Login failed:', error)
      setError(error.message || 'Login failed')
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Logout and cleanup
   */
  async function logout() {
    try {
      setIsLoading(true)
      setError(null)

      await clientLogout()
      
      setClient(null)
      setUserId(null)
      setIsAuthenticated(false)
      setCryptoReady(false)

      logger.info('Logout successful')

    } catch (error: any) {
      logger.error('Logout failed:', error)
      setError(error.message || 'Logout failed')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Refresh crypto status
   */
  function refreshCryptoStatus() {
    const cryptoStatus = isCryptoReady()
    setCryptoReady(cryptoStatus)
    
    if (cryptoStatus) {
      logger.info('Crypto is ready and functional')
    } else {
      logger.warn('Crypto is not ready')
    }
  }

  /**
   * Context value
   */
  const contextValue: MatrixContextState = {
    client,
    isLoading,
    isAuthenticated,
    isCryptoReady: cryptoReady,
    error,
    userId,
    
    loginWithPassword,
    logout,
    refreshCryptoStatus,
  }

  return (
    <MatrixContext.Provider value={contextValue}>
      {children}
      {/* Device verification prompt - automatically shows when appropriate */}
      <DeviceVerificationPromptTrigger />
    </MatrixContext.Provider>
  )
}

/**
 * Hook to use Matrix context
 */
export function useMatrix(): MatrixContextState {
  const context = useContext(MatrixContext)
  
  if (!context) {
    throw new Error('useMatrix must be used within a MatrixProvider')
  }
  
  return context
}

/**
 * Hook to get Matrix client directly (for compatibility with existing code)
 */
export function useMatrixClient() {
  const { client, isLoading, error, isAuthenticated } = useMatrix()
  
  return {
    client,
    loading: isLoading,
    error,
    isAuthenticated,
    
    // Legacy methods for backwards compatibility
    loginWithPassword: async (homeserver: string, username: string, password: string): Promise<MatrixClient | null> => {
      const { loginWithPassword } = useMatrix()
      await loginWithPassword(homeserver, username, password)
      return client
    },
    
    logout: async (): Promise<void> => {
      const { logout } = useMatrix()
      await logout()
    },
    
    joinRoom: async (roomIdOrAlias: string, viaServers?: string[]): Promise<Room> => {
      if (!client) {
        throw new Error('No Matrix client available')
      }
      return await client.joinRoom(roomIdOrAlias, { viaServers: viaServers || [] })
    },
    
    getPublicRooms: async (options?: any): Promise<unknown> => {
      if (!client) {
        throw new Error('No Matrix client available')
      }
      return await client.publicRooms(options)
    },
  }
}