'use client'

import React, { useState, useEffect } from 'react'
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  X,
  ArrowRight,
  Lock,
  Smartphone,
  Monitor,
  Wifi
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Button } from '../ui/button'
import { useDeviceVerification } from '../../hooks/use-device-verification'
import { useFirstLoginDetection } from '../../hooks/use-first-login-detection'

// Use console for client-side logging
const logger = {
  info: console.log,
  warn: console.warn,
  error: console.error,
}

/**
 * Device verification prompt modal props
 */
interface DeviceVerificationPromptModalProps {
  isOpen: boolean
  onClose: () => void
  reason: 'first-login' | 'new-device' | 'unverified-devices'
  onVerificationStarted?: () => void
}

/**
 * Device verification prompt modal component
 * Shows when user first logs in or uses a new device
 */
export function DeviceVerificationPromptModal({ 
  isOpen, 
  onClose, 
  reason, 
  onVerificationStarted 
}: DeviceVerificationPromptModalProps) {
  const {
    unverifiedDevices,
    openModal: openVerificationModal,
    refreshDeviceLists
  } = useDeviceVerification()
  
  const {
    skipDeviceVerification,
    markDevicePromptShown,
    deviceInfo
  } = useFirstLoginDetection()

  const [currentStep, setCurrentStep] = useState<'intro' | 'explanation' | 'tutorial'>('intro')
  const [userChoice, setUserChoice] = useState<'verify' | 'skip' | null>(null)

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('intro')
      setUserChoice(null)
      refreshDeviceLists()
    }
  }, [isOpen, refreshDeviceLists])

  /**
   * Handle starting verification process
   */
  const handleStartVerification = () => {
    logger.info('User chose to start device verification')
    setUserChoice('verify')
    markDevicePromptShown()
    onVerificationStarted?.()
    onClose() // Close prompt modal
    openVerificationModal() // Open main verification modal
  }

  /**
   * Handle skipping verification with warning
   */
  const handleSkipVerification = () => {
    logger.info('User chose to skip device verification')
    setUserChoice('skip')
    skipDeviceVerification()
    onClose()
  }

  /**
   * Handle continuing to explanation step
   */
  const handleContinueToExplanation = () => {
    setCurrentStep('explanation')
  }

  /**
   * Handle continuing to tutorial step
   */
  const handleContinueToTutorial = () => {
    setCurrentStep('tutorial')
  }

  /**
   * Get appropriate content based on reason and step
   */
  const getModalContent = () => {
    switch (currentStep) {
      case 'intro':
        return renderIntroStep()
      case 'explanation':
        return renderExplanationStep()
      case 'tutorial':
        return renderTutorialStep()
      default:
        return renderIntroStep()
    }
  }

  /**
   * Render intro step based on reason
   */
  const renderIntroStep = () => {
    const content = getReasonContent(reason)
    
    return (
      <div className="space-y-6">
        {/* Header Icon & Title */}
        <div className="text-center space-y-3">
          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${content.iconBg}`}>
            {content.icon}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {content.title}
            </h3>
            <p className="text-gray-300 text-sm max-w-md mx-auto">
              {content.subtitle}
            </p>
          </div>
        </div>

        {/* Key Benefits */}
        <div className="bg-gray-700/30 rounded-lg p-4">
          <h4 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Why Verify Your Device?
          </h4>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Secure your encrypted messages</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Prevent unauthorized access</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              <span>Enable secure device sync</span>
            </li>
          </ul>
        </div>

        {/* Device Info (if available) */}
        {deviceInfo.deviceId && (
          <div className="bg-gray-700/30 rounded-lg p-4">
            <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              Current Device
            </h4>
            <div className="text-sm text-gray-300">
              <p className="font-mono text-xs text-gray-400 mb-1">
                ID: {deviceInfo.deviceId}
              </p>
              <p className="text-xs">
                {deviceInfo.isNewDeviceId ? 'New device detected' : 'Known device'}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            onClick={handleSkipVerification}
            variant="outline" 
            className="flex-1 text-gray-300 border-gray-600 hover:border-gray-500"
          >
            Skip for Now
          </Button>
          <Button 
            onClick={handleContinueToExplanation}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            Learn More
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    )
  }

  /**
   * Render detailed explanation step
   */
  const renderExplanationStep = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 mx-auto bg-blue-500/20 rounded-full flex items-center justify-center">
          <Info className="w-6 h-6 text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">
          How Device Verification Works
        </h3>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-medium text-blue-400">1</span>
          </div>
          <div>
            <h4 className="text-sm font-medium text-white mb-1">
              Compare Security Codes
            </h4>
            <p className="text-xs text-gray-400">
              We'll show emoji or QR codes on both devices. Make sure they match exactly.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-medium text-blue-400">2</span>
          </div>
          <div>
            <h4 className="text-sm font-medium text-white mb-1">
              Confirm the Match
            </h4>
            <p className="text-xs text-gray-400">
              If the codes match, confirm on both devices. If not, something's wrong.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-medium text-green-400">3</span>
          </div>
          <div>
            <h4 className="text-sm font-medium text-white mb-1">
              Secure Communication
            </h4>
            <p className="text-xs text-gray-400">
              Your devices are now verified and can safely share encrypted messages.
            </p>
          </div>
        </div>
      </div>

      {/* Matrix Protocol Badge */}
      <div className="bg-gray-700/30 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-300">Matrix Protocol</span>
        </div>
        <p className="text-xs text-gray-400">
          This verification uses Matrix's end-to-end encryption standard, 
          ensuring your messages are secure and private.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button 
          onClick={() => setCurrentStep('intro')}
          variant="outline" 
          className="flex-1 text-gray-300 border-gray-600 hover:border-gray-500"
        >
          Back
        </Button>
        <Button 
          onClick={handleContinueToTutorial}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          See Tutorial
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )

  /**
   * Render tutorial/guidance step
   */
  const renderTutorialStep = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
          <ShieldCheck className="w-6 h-6 text-green-400" />
        </div>
        <h3 className="text-lg font-semibold text-white">
          Ready to Verify?
        </h3>
      </div>

      {/* Tutorial Steps with Visual Indicators */}
      <div className="space-y-4">
        <div className="bg-gray-700/30 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <span className="text-lg">😀</span>
            </div>
            <h4 className="text-sm font-medium text-white">Emoji Method</h4>
          </div>
          <p className="text-xs text-gray-400 ml-9">
            Compare emoji symbols shown on both devices. This is the easiest method.
          </p>
        </div>

        <div className="bg-gray-700/30 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-blue-400 rounded-sm"></div>
            </div>
            <h4 className="text-sm font-medium text-white">QR Code Method</h4>
          </div>
          <p className="text-xs text-gray-400 ml-9">
            Scan a QR code with your other device's camera. Fast and secure.
          </p>
        </div>
      </div>

      {/* Warning Box */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-yellow-400 mb-1">
              Important Security Note
            </h4>
            <p className="text-xs text-gray-300">
              Only verify devices you control. If the codes don't match, 
              someone may be trying to intercept your messages.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button 
          onClick={handleSkipVerification}
          variant="outline" 
          className="flex-1 text-gray-300 border-gray-600 hover:border-gray-500"
        >
          Skip for Now
        </Button>
        <Button 
          onClick={handleStartVerification}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          Start Verification
          <ShieldCheck className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )

  /**
   * Get content configuration based on reason
   */
  const getReasonContent = (reason: 'first-login' | 'new-device' | 'unverified-devices') => {
    switch (reason) {
      case 'first-login':
        return {
          title: 'Welcome to HAOS!',
          subtitle: 'Let\'s secure your account by verifying this device.',
          icon: <Shield className="w-8 h-8 text-blue-400" />,
          iconBg: 'bg-blue-500/20'
        }
      case 'new-device':
        return {
          title: 'New Device Detected',
          subtitle: 'We notice you\'re using HAOS on a new device. Let\'s verify it for security.',
          icon: <Smartphone className="w-8 h-8 text-orange-400" />,
          iconBg: 'bg-orange-500/20'
        }
      case 'unverified-devices':
        return {
          title: 'Unverified Devices Found',
          subtitle: `You have ${unverifiedDevices.length} unverified device${unverifiedDevices.length !== 1 ? 's' : ''} that can access your messages.`,
          icon: <ShieldAlert className="w-8 h-8 text-yellow-400" />,
          iconBg: 'bg-yellow-500/20'
        }
      default:
        return {
          title: 'Device Verification',
          subtitle: 'Secure your account by verifying your devices.',
          icon: <Shield className="w-8 h-8 text-gray-400" />,
          iconBg: 'bg-gray-500/20'
        }
    }
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-gray-800 border-gray-700 text-white">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              Device Security
            </DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 border-gray-600 hover:border-gray-500"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="px-6 pb-6">
          {getModalContent()}
        </div>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Hook for checking if device verification prompt should be shown
 */
export function useDeviceVerificationPromptTrigger(): {
  shouldShowPrompt: boolean
  promptReason: 'first-login' | 'new-device' | 'unverified-devices' | null
} {
  const { isFirstLogin, isNewDevice, hasShownDevicePrompt } = useFirstLoginDetection()

  // Determine if and why we should show the prompt
  let shouldShowPrompt = false
  let promptReason: 'first-login' | 'new-device' | 'unverified-devices' | null = null

  if (!hasShownDevicePrompt) {
    if (isFirstLogin) {
      shouldShowPrompt = true
      promptReason = 'first-login'
    } else if (isNewDevice) {
      shouldShowPrompt = true
      promptReason = 'new-device'
    }
  }

  return {
    shouldShowPrompt,
    promptReason
  }
}

/**
 * Device verification prompt trigger component
 * Automatically shows the prompt modal when appropriate
 */
export function DeviceVerificationPromptTrigger() {
  const { 
    shouldShowPrompt, 
    promptReason 
  } = useDeviceVerificationPromptTrigger()
  
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Show modal when prompt should be triggered
  useEffect(() => {
    if (shouldShowPrompt && promptReason && !isModalOpen) {
      // Add a small delay to ensure UI is ready
      const timer = setTimeout(() => {
        setIsModalOpen(true)
        logger.info('Device verification prompt triggered:', promptReason)
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [shouldShowPrompt, promptReason, isModalOpen])

  const handleClose = () => {
    setIsModalOpen(false)
  }

  const handleVerificationStarted = () => {
    logger.info('Device verification started from prompt')
  }

  if (!promptReason) return null

  return (
    <DeviceVerificationPromptModal
      isOpen={isModalOpen}
      onClose={handleClose}
      reason={promptReason}
      onVerificationStarted={handleVerificationStarted}
    />
  )
}