/**
 * Device Verification Demo Component
 * 
 * This component demonstrates the device verification prompt system.
 * It can be used for testing and showcasing the functionality.
 */

'use client'

import React, { useState } from 'react'
import { Button } from '../../components/ui/button'
import { DeviceVerificationPromptModal } from '../../components/modals/device-verification-prompt-modal'
import { useFirstLoginDetection } from '../../hooks/use-first-login-detection'

export function DeviceVerificationDemo() {
  const [showFirstLogin, setShowFirstLogin] = useState(false)
  const [showNewDevice, setShowNewDevice] = useState(false)
  const [showUnverifiedDevices, setShowUnverifiedDevices] = useState(false)
  
  const { resetFirstLoginState, deviceInfo } = useFirstLoginDetection()

  const handleResetState = () => {
    resetFirstLoginState()
    alert('First login state has been reset. Refresh the page to see the prompt.')
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-white">
          Device Verification Demo
        </h1>
        <p className="text-gray-400">
          Test and preview the device verification prompt system
        </p>
      </div>

      {/* Current Device Info */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-white mb-3">
          Current Device Information
        </h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Device ID:</span>
            <span className="text-white font-mono">
              {deviceInfo.deviceId || 'Not available'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Is New Device:</span>
            <span className={deviceInfo.isNewDeviceId ? 'text-yellow-400' : 'text-green-400'}>
              {deviceInfo.isNewDeviceId ? 'Yes' : 'No'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Last Login:</span>
            <span className="text-gray-300">
              {deviceInfo.lastLoginTimestamp 
                ? new Date(deviceInfo.lastLoginTimestamp).toLocaleString()
                : 'Never'
              }
            </span>
          </div>
        </div>
      </div>

      {/* Demo Controls */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-white mb-4">
          Demo Different Scenarios
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button
            onClick={() => setShowFirstLogin(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            First Login
          </Button>
          <Button
            onClick={() => setShowNewDevice(true)}
            className="bg-orange-600 hover:bg-orange-700"
          >
            New Device
          </Button>
          <Button
            onClick={() => setShowUnverifiedDevices(true)}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            Unverified Devices
          </Button>
        </div>
      </div>

      {/* State Management */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-white mb-4">
          State Management
        </h2>
        <div className="space-y-3">
          <Button
            onClick={handleResetState}
            variant="outline"
            className="w-full"
          >
            Reset First Login State
          </Button>
          <div className="text-sm text-gray-400">
            <p>
              <strong>Reset:</strong> Clears all stored state (first login completion, device registry, session flags).
              After reset, refresh the page to trigger the actual first-login prompt.
            </p>
          </div>
        </div>
      </div>

      {/* Feature Checklist */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-white mb-4">
          Feature Implementation Status
        </h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span className="text-gray-300">Detect first login on new device</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span className="text-gray-300">Show verification modal automatically</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span className="text-gray-300">Display clear verification steps</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span className="text-gray-300">Allow skipping verification (with warning)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span className="text-gray-300">Ensure Matrix protocol compliance</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">✓</span>
            <span className="text-gray-300">Add tutorial/guidance</span>
          </div>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-white mb-4">
          How to Test
        </h2>
        <div className="space-y-2 text-sm text-gray-300">
          <div className="flex items-start gap-2">
            <span className="text-blue-400 font-bold">1.</span>
            <span>Use the buttons above to preview different prompt scenarios</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-400 font-bold">2.</span>
            <span>Click "Reset First Login State" then refresh to see real first-login flow</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-400 font-bold">3.</span>
            <span>Clear localStorage and sessionStorage to fully simulate new user</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-blue-400 font-bold">4.</span>
            <span>The prompt will automatically appear when appropriate conditions are met</span>
          </div>
        </div>
      </div>

      {/* Demo Modals */}
      <DeviceVerificationPromptModal
        isOpen={showFirstLogin}
        onClose={() => setShowFirstLogin(false)}
        reason="first-login"
        onVerificationStarted={() => console.log('First login verification started')}
      />

      <DeviceVerificationPromptModal
        isOpen={showNewDevice}
        onClose={() => setShowNewDevice(false)}
        reason="new-device"
        onVerificationStarted={() => console.log('New device verification started')}
      />

      <DeviceVerificationPromptModal
        isOpen={showUnverifiedDevices}
        onClose={() => setShowUnverifiedDevices(false)}
        reason="unverified-devices"
        onVerificationStarted={() => console.log('Unverified devices verification started')}
      />
    </div>
  )
}

export default DeviceVerificationDemo