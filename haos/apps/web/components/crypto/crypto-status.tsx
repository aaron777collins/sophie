'use client'

import { useMatrix } from '../providers/matrix-provider'
import { Shield, ShieldCheck, ShieldAlert } from 'lucide-react'

/**
 * Component to display Matrix crypto status
 * Shows whether E2EE is ready and functional
 */
export function CryptoStatus() {
  const { client, isCryptoReady, isAuthenticated, userId } = useMatrix()

  if (!isAuthenticated || !client) {
    return (
      <div className="flex items-center gap-2 text-gray-400 text-sm">
        <Shield className="w-4 h-4" />
        <span>Not authenticated</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      {isCryptoReady ? (
        <>
          <ShieldCheck className="w-4 h-4 text-green-500" />
          <span className="text-green-500">E2EE Ready</span>
        </>
      ) : (
        <>
          <ShieldAlert className="w-4 h-4 text-yellow-500" />
          <span className="text-yellow-500">E2EE Initializing...</span>
        </>
      )}
      
      <span className="text-gray-400">
        ({userId})
      </span>
    </div>
  )
}

/**
 * Detailed crypto debug component for development
 */
export function CryptoDebug() {
  const { client, isCryptoReady, isAuthenticated, isLoading, error } = useMatrix()

  return (
    <div className="p-4 bg-gray-800 rounded-lg space-y-2 text-sm font-mono">
      <div className="text-lg font-bold text-white mb-2">🔐 Crypto Debug</div>
      
      <div>
        <span className="text-gray-400">Loading: </span>
        <span className={isLoading ? 'text-yellow-500' : 'text-green-500'}>
          {isLoading ? 'true' : 'false'}
        </span>
      </div>
      
      <div>
        <span className="text-gray-400">Authenticated: </span>
        <span className={isAuthenticated ? 'text-green-500' : 'text-red-500'}>
          {isAuthenticated ? 'true' : 'false'}
        </span>
      </div>
      
      <div>
        <span className="text-gray-400">Client: </span>
        <span className={client ? 'text-green-500' : 'text-red-500'}>
          {client ? 'connected' : 'null'}
        </span>
      </div>
      
      <div>
        <span className="text-gray-400">Crypto Ready: </span>
        <span className={isCryptoReady ? 'text-green-500' : 'text-yellow-500'}>
          {isCryptoReady ? 'true' : 'false'}
        </span>
      </div>
      
      <div>
        <span className="text-gray-400">Crypto Enabled: </span>
        <span className={client?.isCryptoEnabled() ? 'text-green-500' : 'text-red-500'}>
          {client?.isCryptoEnabled() ? 'true' : 'false'}
        </span>
      </div>
      
      {error && (
        <div>
          <span className="text-gray-400">Error: </span>
          <span className="text-red-500">{error}</span>
        </div>
      )}
      
      {client && (
        <>
          <div>
            <span className="text-gray-400">User ID: </span>
            <span className="text-blue-400">{client.getUserId()}</span>
          </div>
          
          <div>
            <span className="text-gray-400">Device ID: </span>
            <span className="text-blue-400">{client.getDeviceId()}</span>
          </div>
          
          <div>
            <span className="text-gray-400">Homeserver: </span>
            <span className="text-blue-400">{client.baseUrl}</span>
          </div>
        </>
      )}
    </div>
  )
}