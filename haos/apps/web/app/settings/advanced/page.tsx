'use client'

import { useState } from 'react'
import { ArrowLeftIcon, SettingsIcon, CodeIcon, DownloadIcon, RefreshCwIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AdvancedSettingsPage() {
  const router = useRouter()
  
  const [settings, setSettings] = useState({
    developerMode: false,
    debugLogging: false,
    hardwareAcceleration: true,
    autoUpdates: true,
    betaFeatures: false,
    cacheClearInterval: '7',
    maxCacheSize: '500',
  })

  const [isClearing, setIsClearing] = useState(false)

  const handleClearCache = async () => {
    setIsClearing(true)
    // Simulate cache clearing
    setTimeout(() => {
      setIsClearing(false)
      console.log('Cache cleared')
    }, 2000)
  }

  const handleSave = () => {
    console.log('Saving advanced settings:', settings)
  }

  return (
    <div className="min-h-screen bg-discord-dark">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center">
              <SettingsIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Advanced Settings</h1>
              <p className="text-gray-400">Power user options and experimental features</p>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="space-y-8">
          {/* Developer Options */}
          <div className="bg-discord-light rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <CodeIcon className="w-5 h-5 text-white" />
              <h3 className="text-lg font-semibold text-white">Developer Options</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white">Developer Mode</h4>
                  <p className="text-gray-400 text-sm">Enable advanced debugging and development tools</p>
                </div>
                <button
                  onClick={() => setSettings({...settings, developerMode: !settings.developerMode})}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.developerMode ? 'bg-primary-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.developerMode ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white">Debug Logging</h4>
                  <p className="text-gray-400 text-sm">Enable detailed console logging (may affect performance)</p>
                </div>
                <button
                  onClick={() => setSettings({...settings, debugLogging: !settings.debugLogging})}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.debugLogging ? 'bg-primary-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.debugLogging ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Performance */}
          <div className="bg-discord-light rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Performance</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white">Hardware Acceleration</h4>
                  <p className="text-gray-400 text-sm">Use GPU acceleration when available</p>
                </div>
                <button
                  onClick={() => setSettings({...settings, hardwareAcceleration: !settings.hardwareAcceleration})}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.hardwareAcceleration ? 'bg-primary-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.hardwareAcceleration ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Cache Clear Interval (days)
                </label>
                <select
                  value={settings.cacheClearInterval}
                  onChange={(e) => setSettings({...settings, cacheClearInterval: e.target.value})}
                  className="w-full bg-discord-darker border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
                >
                  <option value="1">1 day</option>
                  <option value="3">3 days</option>
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                  <option value="never">Never</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Maximum Cache Size (MB)
                </label>
                <input
                  type="number"
                  min="100"
                  max="2000"
                  step="50"
                  value={settings.maxCacheSize}
                  onChange={(e) => setSettings({...settings, maxCacheSize: e.target.value})}
                  className="w-full bg-discord-darker border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-primary-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Updates & Features */}
          <div className="bg-discord-light rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Updates & Features</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white">Automatic Updates</h4>
                  <p className="text-gray-400 text-sm">Automatically download and install updates</p>
                </div>
                <button
                  onClick={() => setSettings({...settings, autoUpdates: !settings.autoUpdates})}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.autoUpdates ? 'bg-primary-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.autoUpdates ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-white">Beta Features</h4>
                  <p className="text-gray-400 text-sm">Enable experimental features (may be unstable)</p>
                </div>
                <button
                  onClick={() => setSettings({...settings, betaFeatures: !settings.betaFeatures})}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.betaFeatures ? 'bg-primary-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.betaFeatures ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Cache Management */}
          <div className="bg-discord-light rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Cache Management</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-discord-darker p-4 rounded-lg">
                  <h4 className="text-white font-medium">Message Cache</h4>
                  <p className="text-2xl text-primary-400 font-bold mt-2">156 MB</p>
                  <p className="text-gray-400 text-sm">12,450 messages</p>
                </div>
                <div className="bg-discord-darker p-4 rounded-lg">
                  <h4 className="text-white font-medium">Media Cache</h4>
                  <p className="text-2xl text-green-400 font-bold mt-2">89 MB</p>
                  <p className="text-gray-400 text-sm">342 files</p>
                </div>
                <div className="bg-discord-darker p-4 rounded-lg">
                  <h4 className="text-white font-medium">Total Size</h4>
                  <p className="text-2xl text-orange-400 font-bold mt-2">245 MB</p>
                  <p className="text-gray-400 text-sm">of 500 MB limit</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleClearCache}
                  disabled={isClearing}
                  className="px-6 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded transition-colors flex items-center gap-2"
                >
                  {isClearing ? (
                    <RefreshCwIcon className="w-4 h-4 animate-spin" />
                  ) : (
                    <DownloadIcon className="w-4 h-4" />
                  )}
                  {isClearing ? 'Clearing...' : 'Clear Cache'}
                </button>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded transition-colors">
                  Optimize Storage
                </button>
              </div>
            </div>
          </div>

          {/* Experimental Features */}
          {settings.betaFeatures && (
            <div className="bg-yellow-900/20 border border-yellow-500 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-300 mb-4">Experimental Features</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white">Matrix Spaces v2</h4>
                    <p className="text-gray-400 text-sm">Next generation Matrix Spaces implementation</p>
                  </div>
                  <button className="w-12 h-6 bg-gray-600 rounded-full">
                    <div className="w-5 h-5 bg-white rounded-full translate-x-1" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white">Enhanced Encryption</h4>
                    <p className="text-gray-400 text-sm">Improved end-to-end encryption protocols</p>
                  </div>
                  <button className="w-12 h-6 bg-gray-600 rounded-full">
                    <div className="w-5 h-5 bg-white rounded-full translate-x-1" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white">Voice Noise Suppression</h4>
                    <p className="text-gray-400 text-sm">AI-powered noise cancellation</p>
                  </div>
                  <button className="w-12 h-6 bg-primary-500 rounded-full">
                    <div className="w-5 h-5 bg-white rounded-full translate-x-6" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reset Section */}
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-400 mb-4">Reset</h3>
            <p className="text-gray-300 text-sm mb-4">
              Reset all settings to their default values. This will not affect your account or messages.
            </p>
            <button className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded transition-colors">
              Reset to Defaults
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded transition-colors"
            >
              Save Changes
            </button>
            <button
              onClick={() => router.back()}
              className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}