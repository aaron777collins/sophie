'use client'

import { useCallback, useEffect, useState } from 'react'
import { Shield, Key, Check, X, AlertTriangle, RefreshCw, Lock, Unlock } from 'lucide-react'
import { useMatrix } from '../providers/matrix-provider'
import { 
  CrossSigningManager, 
  CrossSigningStatus, 
  CrossSigningUtils,
  type CrossSigningEvents 
} from '@/lib/matrix/crypto/cross-signing'

interface SecuritySettingsProps {
  className?: string
}

interface BootstrapProgress {
  phase: string
  progress: number
}

export function SecuritySettings({ className = '' }: SecuritySettingsProps) {
  const { client, isCryptoReady } = useMatrix()
  const [crossSigningManager, setCrossSigningManager] = useState<CrossSigningManager | null>(null)
  const [status, setStatus] = useState<CrossSigningStatus>({
    isSetup: false,
    hasMasterKey: false,
    hasSelfSigningKey: false,
    hasUserSigningKey: false,
    canSignDevices: false,
    canSignUsers: false,
    error: null
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isBootstrapping, setIsBootstrapping] = useState(false)
  const [bootstrapProgress, setBootstrapProgress] = useState<BootstrapProgress | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Initialize cross-signing manager
  useEffect(() => {
    if (!client || !isCryptoReady) {
      setCrossSigningManager(null)
      return
    }

    const events: CrossSigningEvents = {
      onStatusChange: (newStatus) => {
        setStatus(newStatus)
        if (newStatus.error) {
          setError(newStatus.error)
        }
      },
      onBootstrapProgress: (phase, progress = 0) => {
        setBootstrapProgress({ phase, progress })
      },
      onBootstrapComplete: () => {
        setIsBootstrapping(false)
        setBootstrapProgress(null)
        setError(null)
      },
      onBootstrapError: (errorMessage) => {
        setIsBootstrapping(false)
        setBootstrapProgress(null)
        setError(errorMessage)
      },
      onDeviceSigned: (deviceId, userId) => {
        console.log(`Device signed: ${deviceId} for user ${userId}`)
      },
      onUserSigned: (userId) => {
        console.log(`User signed: ${userId}`)
      }
    }

    const manager = new CrossSigningManager(client, events)
    setCrossSigningManager(manager)

    // Load initial status
    manager.getStatus().then(() => {
      setIsLoading(false)
    }).catch((err) => {
      setError(err.message)
      setIsLoading(false)
    })

    return () => {
      manager.destroy()
    }
  }, [client, isCryptoReady])

  const handleSetupCrossSigning = useCallback(async () => {
    if (!crossSigningManager) return

    setIsBootstrapping(true)
    setError(null)

    try {
      await crossSigningManager.bootstrap({
        setupNewCrossSigning: true
      })
    } catch (err) {
      console.error('Cross-signing setup failed:', err)
      // Error is already handled by the manager's events
    }
  }, [crossSigningManager])

  const handleRefreshStatus = useCallback(async () => {
    if (!crossSigningManager) return

    setIsLoading(true)
    setError(null)

    try {
      await crossSigningManager.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh status')
    } finally {
      setIsLoading(false)
    }
  }, [crossSigningManager])

  const getSecurityIcon = () => {
    const level = CrossSigningUtils.getSecurityLevel(status)
    switch (level) {
      case 'full':
        return <Shield className="w-6 h-6 text-green-500" />
      case 'basic':
        return <Shield className="w-6 h-6 text-yellow-500" />
      default:
        return <Shield className="w-6 h-6 text-red-500" />
    }
  }

  const getStatusColor = (hasFeature: boolean) => {
    return hasFeature ? 'text-green-500' : 'text-red-500'
  }

  const StatusIcon = ({ hasFeature }: { hasFeature: boolean }) => {
    return hasFeature ? 
      <Check className="w-4 h-4 text-green-500" /> : 
      <X className="w-4 h-4 text-red-500" />
  }

  if (!isCryptoReady) {
    return (
      <div className={`p-6 bg-gray-100 dark:bg-gray-800 rounded-lg ${className}`}>
        <div className="flex items-center justify-center">
          <RefreshCw className="w-6 h-6 animate-spin text-gray-500 mr-2" />
          <span className="text-gray-600 dark:text-gray-400">
            Waiting for encryption to initialize...
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center space-x-3">
        {getSecurityIcon()}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Security Settings
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your encryption and device security
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-800 dark:text-red-300">Error</h4>
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Cross-signing Status */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Key className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Cross-signing
            </h3>
          </div>
          <button
            onClick={handleRefreshStatus}
            disabled={isLoading}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            title="Refresh status"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="space-y-3">
          <p className="text-gray-600 dark:text-gray-400">
            {CrossSigningUtils.getStatusMessage(status)}
          </p>

          {/* Key Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <StatusIcon hasFeature={status.hasMasterKey} />
              <span className={`text-sm ${getStatusColor(status.hasMasterKey)}`}>
                Master Key
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <StatusIcon hasFeature={status.hasSelfSigningKey} />
              <span className={`text-sm ${getStatusColor(status.hasSelfSigningKey)}`}>
                Self-signing Key
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <StatusIcon hasFeature={status.hasUserSigningKey} />
              <span className={`text-sm ${getStatusColor(status.hasUserSigningKey)}`}>
                User-signing Key
              </span>
            </div>
          </div>

          {/* Capabilities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <StatusIcon hasFeature={status.canSignDevices} />
              <span className={`text-sm ${getStatusColor(status.canSignDevices)}`}>
                Can sign devices
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <StatusIcon hasFeature={status.canSignUsers} />
              <span className={`text-sm ${getStatusColor(status.canSignUsers)}`}>
                Can sign users
              </span>
            </div>
          </div>
        </div>

        {/* Setup Button */}
        {!status.isSetup && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleSetupCrossSigning}
              disabled={isBootstrapping || !crossSigningManager}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isBootstrapping ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Setting up...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Set up Cross-signing</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Bootstrap Progress */}
        {bootstrapProgress && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-800 dark:text-blue-300">
                {bootstrapProgress.phase}
              </span>
              <span className="text-sm text-blue-600 dark:text-blue-400">
                {Math.round(bootstrapProgress.progress)}%
              </span>
            </div>
            <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${bootstrapProgress.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Security Level */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-3">
          {CrossSigningUtils.getSecurityLevel(status) === 'full' ? (
            <Lock className="w-5 h-5 text-green-500" />
          ) : (
            <Unlock className="w-5 h-5 text-yellow-500" />
          )}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Security Level
          </h3>
        </div>

        <div className="space-y-2">
          {(() => {
            const level = CrossSigningUtils.getSecurityLevel(status)
            switch (level) {
              case 'full':
                return (
                  <div>
                    <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      Full Security
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Your encryption is fully set up. You can verify devices and users.
                    </p>
                  </div>
                )
              case 'basic':
                return (
                  <div>
                    <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                      Basic Security
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Your encryption is partially set up. Some features may be limited.
                    </p>
                  </div>
                )
              default:
                return (
                  <div>
                    <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                      No Security
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Cross-signing is not set up. Set it up to secure your account.
                    </p>
                  </div>
                )
            }
          })()}
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">
          What is Cross-signing?
        </h4>
        <p className="text-sm text-blue-700 dark:text-blue-400">
          Cross-signing allows you to verify your devices and other users without manually checking device keys. 
          It creates a web of trust that makes end-to-end encryption more user-friendly and secure.
        </p>
      </div>
    </div>
  )
}