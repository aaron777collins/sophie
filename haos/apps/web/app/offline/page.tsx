'use client'

import { useState, useEffect } from 'react'
import { WifiOffIcon, RefreshCwIcon, CloudOffIcon, CheckCircleIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function OfflinePage() {
  const router = useRouter()
  const [isOnline, setIsOnline] = useState(true)
  const [retrying, setRetrying] = useState(false)
  const [offlineActions, setOfflineActions] = useState([
    { id: 1, type: 'message', content: 'Send message to #general', timestamp: Date.now() - 30000 },
    { id: 2, type: 'reaction', content: 'React to message with 👍', timestamp: Date.now() - 60000 },
    { id: 3, type: 'read', content: 'Mark #announcements as read', timestamp: Date.now() - 120000 },
  ])

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    setIsOnline(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleRetry = () => {
    setRetrying(true)
    setTimeout(() => {
      setRetrying(false)
      if (navigator.onLine) {
        router.push('/')
      }
    }, 2000)
  }

  const handleClearOfflineActions = () => {
    setOfflineActions([])
  }

  if (isOnline) {
    return (
      <div className="min-h-screen bg-discord-dark flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Back Online!</h1>
          <p className="text-gray-400 mb-6">
            Your connection has been restored. Redirecting you back to HAOS...
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded transition-colors"
          >
            Continue to HAOS
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-discord-dark">
      <div className="container mx-auto px-4 py-8">
        {/* Offline Status Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <WifiOffIcon className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">You're Offline</h1>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            HAOS couldn't connect to the Matrix network. Check your internet connection and try again.
          </p>
          
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="px-6 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCwIcon className={`w-5 h-5 ${retrying ? 'animate-spin' : ''}`} />
            {retrying ? 'Reconnecting...' : 'Try Again'}
          </button>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Offline Features */}
            <div className="bg-discord-light rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <CloudOffIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Offline Mode</h2>
                  <p className="text-gray-400 text-sm">What you can still do</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-discord-darker rounded-lg">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  <div>
                    <h4 className="text-white font-medium">View Cached Messages</h4>
                    <p className="text-gray-400 text-sm">Read recent conversations from your local cache</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-discord-darker rounded-lg">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  <div>
                    <h4 className="text-white font-medium">Draft Messages</h4>
                    <p className="text-gray-400 text-sm">Write messages that will send when you reconnect</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-discord-darker rounded-lg">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  <div>
                    <h4 className="text-white font-medium">Offline Settings</h4>
                    <p className="text-gray-400 text-sm">Adjust your preferences and settings</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-discord-darker rounded-lg">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                  <div>
                    <h4 className="text-white font-medium">Queue Actions</h4>
                    <p className="text-gray-400 text-sm">Actions will be synced when connection returns</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pending Actions */}
            <div className="bg-discord-light rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                    <RefreshCwIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Pending Actions</h2>
                    <p className="text-gray-400 text-sm">Will sync when online</p>
                  </div>
                </div>
                {offlineActions.length > 0 && (
                  <button
                    onClick={handleClearOfflineActions}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {offlineActions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400">No pending actions</p>
                  </div>
                ) : (
                  offlineActions.map((action) => (
                    <div key={action.id} className="flex items-center gap-3 p-3 bg-discord-darker rounded-lg">
                      <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
                      <div className="flex-1">
                        <p className="text-white text-sm">{action.content}</p>
                        <p className="text-gray-500 text-xs">
                          {Math.floor((Date.now() - action.timestamp) / 60000)} minutes ago
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Troubleshooting */}
          <div className="mt-8 bg-discord-light rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Troubleshooting</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-white font-medium mb-2">Check Your Connection</h4>
                <ul className="space-y-1 text-gray-400 text-sm">
                  <li>• Verify your internet connection</li>
                  <li>• Try refreshing the page</li>
                  <li>• Check if other websites work</li>
                  <li>• Restart your router if needed</li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-medium mb-2">Matrix Network Issues</h4>
                <ul className="space-y-1 text-gray-400 text-sm">
                  <li>• Matrix server might be down</li>
                  <li>• Try switching to a different homeserver</li>
                  <li>• Check Matrix status pages</li>
                  <li>• Contact your server administrator</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}