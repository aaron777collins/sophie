'use client'

import React, { useState, useEffect } from 'react'
import { Check, X, Shield, ShieldCheck, ShieldAlert, QrCode, Smartphone, Monitor } from 'lucide-react'
import QRCode from 'react-qr-code'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { useDeviceVerification } from '../../hooks/use-device-verification'

/**
 * Emoji with description for SAS verification
 */
interface EmojiData {
  emoji: string
  description: string
}

/**
 * Device verification modal component
 */
export function DeviceVerificationModal() {
  const {
    verificationState,
    showModal,
    unverifiedDevices,
    startVerification,
    startEmojiVerification,
    startQRVerification,
    confirmEmojiMatch,
    cancelVerification,
    closeModal,
    refreshDeviceLists
  } = useDeviceVerification()

  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)
  const [verificationMethod, setVerificationMethod] = useState<'choose' | 'emoji' | 'qr'>('choose')

  // Reset state when modal closes
  useEffect(() => {
    if (!showModal) {
      setSelectedDeviceId(null)
      setVerificationMethod('choose')
    }
  }, [showModal])

  // Handle successful verification
  useEffect(() => {
    if (verificationState.phase === 'done') {
      // Close modal after a short delay to show success
      setTimeout(() => {
        closeModal()
        refreshDeviceLists()
      }, 2000)
    }
  }, [verificationState.phase, closeModal, refreshDeviceLists])

  if (!showModal) return null

  const renderContent = () => {
    // Show success state
    if (verificationState.phase === 'done') {
      return (
        <div className="text-center space-y-4 py-6">
          <div className="w-16 h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-green-400 mb-2">Verification Complete!</h3>
            <p className="text-gray-400">Your device has been successfully verified.</p>
          </div>
        </div>
      )
    }

    // Show cancelled state
    if (verificationState.phase === 'cancelled') {
      return (
        <div className="text-center space-y-4 py-6">
          <div className="w-16 h-16 mx-auto bg-gray-500 rounded-full flex items-center justify-center">
            <X className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-400 mb-2">Verification Cancelled</h3>
            <p className="text-gray-400">Device verification was cancelled.</p>
          </div>
          <Button onClick={closeModal} className="mt-4">
            Close
          </Button>
        </div>
      )
    }

    // Show error state
    if (verificationState.error) {
      return (
        <div className="text-center space-y-4 py-6">
          <div className="w-16 h-16 mx-auto bg-red-500 rounded-full flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-400 mb-2">Verification Failed</h3>
            <p className="text-gray-400 text-sm">{verificationState.error}</p>
          </div>
          <Button onClick={closeModal} className="mt-4">
            Close
          </Button>
        </div>
      )
    }

    // Show device selection if no verification active
    if (!verificationState.isVerifying && unverifiedDevices.length > 0) {
      return renderDeviceSelection()
    }

    // Show method selection
    if (verificationState.phase === 'ready' && verificationMethod === 'choose') {
      return renderMethodSelection()
    }

    // Show emoji verification
    if (verificationMethod === 'emoji' && verificationState.phase === 'showing_sas') {
      return renderEmojiVerification()
    }

    // Show QR verification
    if (verificationMethod === 'qr' && verificationState.phase === 'showing_sas') {
      return renderQRVerification()
    }

    // Show waiting state
    if (verificationState.phase === 'waiting_for_partner') {
      return (
        <div className="text-center space-y-4 py-6">
          <div className="w-16 h-16 mx-auto bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-400 mb-2">Waiting...</h3>
            <p className="text-gray-400">Waiting for the other device to confirm.</p>
          </div>
        </div>
      )
    }

    // Default loading state
    return (
      <div className="text-center space-y-4 py-6">
        <div className="w-16 h-16 mx-auto bg-gray-600 rounded-full flex items-center justify-center animate-spin">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-400 mb-2">Loading...</h3>
          <p className="text-gray-400">Setting up device verification.</p>
        </div>
      </div>
    )
  }

  const renderDeviceSelection = () => (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <ShieldAlert className="w-12 h-12 mx-auto text-yellow-500" />
        <h3 className="text-lg font-semibold text-white">Unverified Devices</h3>
        <p className="text-gray-400 text-sm">
          You have unverified devices that can access your encrypted messages.
          Verify them to ensure your security.
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-300">Select a device to verify:</p>
        {unverifiedDevices.map(device => (
          <div
            key={`${device.userId}-${device.deviceId}`}
            className={`p-3 rounded-lg border cursor-pointer transition-colors ${
              selectedDeviceId === device.deviceId
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
            }`}
            onClick={() => setSelectedDeviceId(device.deviceId)}
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {device.displayName?.toLowerCase().includes('mobile') || 
                 device.displayName?.toLowerCase().includes('phone') ? (
                  <Smartphone className="w-5 h-5 text-gray-400" />
                ) : (
                  <Monitor className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {device.displayName || 'Unknown Device'}
                </p>
                <p className="text-xs text-gray-400 font-mono">
                  {device.deviceId}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 pt-4">
        <Button 
          onClick={closeModal} 
          variant="outline" 
          className="flex-1"
        >
          Later
        </Button>
        <Button 
          onClick={() => {
            if (selectedDeviceId) {
              const device = unverifiedDevices.find(d => d.deviceId === selectedDeviceId)
              if (device) {
                startVerification(device.userId, selectedDeviceId)
              }
            }
          }}
          disabled={!selectedDeviceId}
          className="flex-1"
        >
          Verify Device
        </Button>
      </div>
    </div>
  )

  const renderMethodSelection = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Shield className="w-12 h-12 mx-auto text-blue-500" />
        <h3 className="text-lg font-semibold text-white">Choose Verification Method</h3>
        <p className="text-gray-400 text-sm">
          How would you like to verify this device?
        </p>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => {
            setVerificationMethod('emoji')
            startEmojiVerification()
          }}
          className="w-full p-4 text-left rounded-lg border border-gray-600 bg-gray-700/50 hover:border-gray-500 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <span className="text-xl">😀</span>
            </div>
            <div>
              <h4 className="font-medium text-white">Emoji Verification</h4>
              <p className="text-sm text-gray-400">Compare emoji on both devices</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => {
            setVerificationMethod('qr')
            startQRVerification()
          }}
          className="w-full p-4 text-left rounded-lg border border-gray-600 bg-gray-700/50 hover:border-gray-500 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <QrCode className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h4 className="font-medium text-white">QR Code Verification</h4>
              <p className="text-sm text-gray-400">Scan QR code with other device</p>
            </div>
          </div>
        </button>
      </div>

      <Button onClick={cancelVerification} variant="outline" className="w-full">
        Cancel
      </Button>
    </div>
  )

  const renderEmojiVerification = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 mx-auto bg-yellow-500/20 rounded-full flex items-center justify-center">
          <span className="text-2xl">😀</span>
        </div>
        <h3 className="text-lg font-semibold text-white">Compare Emoji</h3>
        <p className="text-gray-400 text-sm">
          Do these emoji match on both devices?
        </p>
      </div>

      {verificationState.emoji && (
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="grid grid-cols-4 gap-4">
            {verificationState.emoji.map((item: EmojiData, index: number) => (
              <div key={index} className="text-center space-y-2">
                <div className="text-3xl">{item.emoji}</div>
                <div className="text-xs text-gray-400 font-medium">
                  {item.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button 
          onClick={cancelVerification} 
          variant="outline" 
          className="flex-1"
        >
          <X className="w-4 h-4 mr-2" />
          Don't Match
        </Button>
        <Button 
          onClick={confirmEmojiMatch} 
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          <Check className="w-4 h-4 mr-2" />
          They Match!
        </Button>
      </div>
    </div>
  )

  const renderQRVerification = () => (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <QrCode className="w-12 h-12 mx-auto text-blue-500" />
        <h3 className="text-lg font-semibold text-white">Scan QR Code</h3>
        <p className="text-gray-400 text-sm">
          Scan this QR code with your other device
        </p>
      </div>

      {verificationState.qrCode && (
        <div className="bg-white p-4 rounded-lg mx-auto w-fit">
          <QRCode 
            value={verificationState.qrCode} 
            size={200}
            className="block"
          />
        </div>
      )}

      <div className="text-center">
        <p className="text-xs text-gray-400 mb-4">
          Open your Matrix client on the other device and scan this QR code
        </p>
        <Button onClick={cancelVerification} variant="outline">
          Cancel
        </Button>
      </div>
    </div>
  )

  return (
    <Dialog open={showModal} onOpenChange={() => !verificationState.isVerifying && closeModal()}>
      <DialogContent className="sm:max-w-md bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-center text-white">
            Device Verification
          </DialogTitle>
        </DialogHeader>
        <div className="px-6 pb-6">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Device verification prompt component for showing in UI
 */
export function DeviceVerificationPrompt() {
  const { unverifiedDevices, openModal } = useDeviceVerification()

  if (unverifiedDevices.length === 0) return null

  return (
    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-yellow-400 mb-1">
            Unverified Devices Detected
          </h4>
          <p className="text-xs text-gray-300 mb-3">
            You have {unverifiedDevices.length} unverified device{unverifiedDevices.length !== 1 ? 's' : ''} 
            that can access your encrypted messages. Verify them to ensure your security.
          </p>
          <Button 
            onClick={openModal}
            size="sm"
            className="text-xs px-3 py-1 h-auto bg-yellow-600 hover:bg-yellow-700"
          >
            Verify Devices
          </Button>
        </div>
      </div>
    </div>
  )
}

/**
 * Simple verification status indicator
 */
export function VerificationStatusBadge({ 
  userId, 
  deviceId, 
  className = "" 
}: { 
  userId: string
  deviceId: string
  className?: string
}) {
  const { checkDeviceVerification } = useDeviceVerification()
  const [isVerified, setIsVerified] = useState<boolean | null>(null)

  useEffect(() => {
    const check = async () => {
      const verified = await checkDeviceVerification(userId, deviceId)
      setIsVerified(verified)
    }
    check()
  }, [userId, deviceId, checkDeviceVerification])

  if (isVerified === null) {
    return <Shield className={`w-4 h-4 text-gray-400 ${className}`} />
  }

  return isVerified ? (
    <ShieldCheck className={`w-4 h-4 text-green-500 ${className}`} />
  ) : (
    <ShieldAlert className={`w-4 h-4 text-yellow-500 ${className}`} />
  )
}