'use client'

import { useState, useEffect } from 'react'
import { MatrixClient, createClient } from 'matrix-js-sdk'

export function useMatrixClient() {
  const [client, setClient] = useState<MatrixClient | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    initializeClient()
  }, [])

  const initializeClient = async () => {
    try {
      setLoading(true)
      setError(null)

      // Check if we have an existing authenticated session
      const existingSession = localStorage.getItem('haos-matrix-session')
      
      if (existingSession) {
        // Use existing authenticated session
        const sessionData = JSON.parse(existingSession)
        const authenticatedClient = createClient({
          baseUrl: sessionData.baseUrl,
          accessToken: sessionData.accessToken,
          userId: sessionData.userId,
        })
        
        setClient(authenticatedClient)
      } else {
        // Create a guest client for browsing public rooms
        // Default to matrix.org for discovery, but this should be configurable
        const guestClient = createClient({
          baseUrl: 'https://matrix.org',
        })
        
        setClient(guestClient)
      }
    } catch (err) {
      console.error('Failed to initialize Matrix client:', err)
      setError('Failed to initialize Matrix client')
    } finally {
      setLoading(false)
    }
  }

  const loginWithPassword = async (homeserver: string, username: string, password: string) => {
    try {
      const client = createClient({ baseUrl: homeserver })
      
      const response = await client.login('m.login.password', {
        user: username,
        password: password,
      })

      // Store session data
      const sessionData = {
        baseUrl: homeserver,
        accessToken: response.access_token,
        userId: response.user_id,
      }
      
      localStorage.setItem('haos-matrix-session', JSON.stringify(sessionData))
      
      // Update client with authentication
      const authenticatedClient = createClient({
        baseUrl: homeserver,
        accessToken: response.access_token,
        userId: response.user_id,
      })
      
      setClient(authenticatedClient)
      return authenticatedClient
    } catch (err) {
      console.error('Login failed:', err)
      throw err
    }
  }

  const logout = async () => {
    try {
      if (client) {
        await client.logout()
      }
    } catch (err) {
      console.error('Logout failed:', err)
    } finally {
      // Clean up local session
      localStorage.removeItem('haos-matrix-session')
      localStorage.removeItem('haos-first-run-completed')
      
      // Reset to guest client
      const guestClient = createClient({
        baseUrl: 'https://matrix.org',
      })
      
      setClient(guestClient)
    }
  }

  const joinRoom = async (roomIdOrAlias: string, viaServers?: string[]) => {
    if (!client) {
      throw new Error('No Matrix client available')
    }

    try {
      const result = await client.joinRoom(roomIdOrAlias, {
        viaServers: viaServers || [],
      })
      
      return result
    } catch (err) {
      console.error('Failed to join room:', err)
      throw err
    }
  }

  const getPublicRooms = async (options?: {
    limit?: number
    since?: string
    filter?: {
      generic_search_term?: string
    }
    server?: string
  }) => {
    if (!client) {
      throw new Error('No Matrix client available')
    }

    try {
      const result = await client.publicRooms(options)
      return result
    } catch (err) {
      console.error('Failed to get public rooms:', err)
      throw err
    }
  }

  return {
    client,
    loading,
    error,
    loginWithPassword,
    logout,
    joinRoom,
    getPublicRooms,
    isAuthenticated: !!localStorage.getItem('haos-matrix-session'),
  }
}