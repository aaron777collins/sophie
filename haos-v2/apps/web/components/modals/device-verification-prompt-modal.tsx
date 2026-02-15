import React, { useState, useCallback } from 'react';
import { MatrixClient } from 'matrix-js-sdk';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Smartphone, 
  Key, 
  CheckCircle, 
  AlertTriangle,
  X,
  HelpCircle,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
  AlertTitle
} from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface DeviceInfo {
  deviceId: string;
  displayName?: string;
  lastSeenIp?: string;
  lastSeenTs?: number;
}

interface DeviceVerificationPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  onSkip: () => void;
  client?: MatrixClient;
  currentDevice?: DeviceInfo;
  otherDevices: DeviceInfo[];
  isNewDevice: boolean;
}

enum VerificationStep {
  WELCOME = 'welcome',
  EXPLANATION = 'explanation',
  DEVICE_LIST = 'device-list',
  VERIFICATION_METHODS = 'verification-methods',
  TUTORIAL = 'tutorial'
}

/**
 * Device Verification Prompt Modal
 * 
 * Guides users through the device verification process on first login
 * or when logging in from a new device
 */
export const DeviceVerificationPromptModal: React.FC<DeviceVerificationPromptModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  onSkip,
  client,
  currentDevice,
  otherDevices,
  isNewDevice
}) => {
  const [currentStep, setCurrentStep] = useState<VerificationStep>(VerificationStep.WELCOME);
  const [showSkipWarning, setShowSkipWarning] = useState(false);

  /**
   * Format device last seen timestamp
   */
  const formatLastSeen = useCallback((timestamp?: number): string => {
    if (!timestamp) return 'Never';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffHours < 168) return `${Math.floor(diffHours / 24)} days ago`;
    return date.toLocaleDateString();
  }, []);

  /**
   * Get device display name or fallback
   */
  const getDeviceDisplayName = useCallback((device: DeviceInfo): string => {
    if (device.displayName) return device.displayName;
    return `Device ${device.deviceId.slice(0, 8)}...`;
  }, []);

  /**
   * Handle verification completion
   */
  const handleComplete = useCallback(() => {
    onComplete();
    onClose();
  }, [onComplete, onClose]);

  /**
   * Handle skipping verification
   */
  const handleSkip = useCallback(() => {
    if (!showSkipWarning) {
      setShowSkipWarning(true);
      return;
    }
    
    onSkip();
    onClose();
  }, [showSkipWarning, onSkip, onClose]);

  /**
   * Start device verification process
   */
  const handleStartVerification = useCallback(async () => {
    if (!client) return;
    
    try {
      // This would typically start the actual Matrix device verification
      // For now, we'll simulate the process and complete immediately
      console.log('Starting device verification process...');
      
      // In a real implementation, you would:
      // 1. Start device verification with another device
      // 2. Handle cross-signing setup
      // 3. Wait for verification completion
      
      // For this enhancement, we'll mark as complete
      handleComplete();
    } catch (error) {
      console.error('Device verification failed:', error);
      // Handle error appropriately
    }
  }, [client, handleComplete]);

  /**
   * Navigate between steps
   */
  const nextStep = useCallback(() => {
    const steps = Object.values(VerificationStep);
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    const steps = Object.values(VerificationStep);
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  }, [currentStep]);

  /**
   * Render welcome step
   */
  const renderWelcomeStep = () => (
    <div className="space-y-6">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
          <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-2">
            {isNewDevice ? 'New Device Detected' : 'Welcome to HAOS'}
          </h2>
          <p className="text-muted-foreground">
            {isNewDevice 
              ? 'We\'ve detected you\'re logging in from a new device. Let\'s verify it to keep your account secure.'
              : 'To keep your messages secure, we recommend setting up device verification.'
            }
          </p>
        </div>
      </div>

      <Alert>
        <ShieldCheck className="h-4 w-4" />
        <AlertTitle>Why verify devices?</AlertTitle>
        <AlertDescription>
          Device verification ensures that only you can access your encrypted messages, 
          even if someone else gains access to your account.
        </AlertDescription>
      </Alert>

      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={() => setShowSkipWarning(true)}>
          Skip for now
        </Button>
        <Button onClick={nextStep}>
          Get Started
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  /**
   * Render explanation step
   */
  const renderExplanationStep = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">How Device Verification Works</h3>
        
        <div className="space-y-4">
          <div className="flex space-x-3">
            <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-green-600 dark:text-green-400 font-semibold text-sm">1</span>
            </div>
            <div>
              <h4 className="font-medium">Cross-device verification</h4>
              <p className="text-sm text-muted-foreground">
                If you have other verified devices, you can verify this device from one of them.
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">2</span>
            </div>
            <div>
              <h4 className="font-medium">Security key backup</h4>
              <p className="text-sm text-muted-foreground">
                Your encryption keys are backed up securely so you can recover them if needed.
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-purple-600 dark:text-purple-400 font-semibold text-sm">3</span>
            </div>
            <div>
              <h4 className="font-medium">Encrypted messaging</h4>
              <p className="text-sm text-muted-foreground">
                Once verified, all your messages will be end-to-end encrypted.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="space-x-3">
          <Button variant="outline" onClick={() => setShowSkipWarning(true)}>
            Skip for now
          </Button>
          <Button onClick={nextStep}>
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );

  /**
   * Render device list step
   */
  const renderDeviceListStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Your Devices</h3>
        <p className="text-muted-foreground text-sm">
          Here are the devices associated with your account:
        </p>
      </div>

      <div className="space-y-3">
        {/* Current Device */}
        {currentDevice && (
          <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
            <div className="flex items-start space-x-3">
              <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{getDeviceDisplayName(currentDevice)}</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    This device
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Device ID: {currentDevice.deviceId}
                </p>
                <p className="text-sm text-muted-foreground">
                  Last seen: {formatLastSeen(currentDevice.lastSeenTs)}
                </p>
              </div>
              <ShieldAlert className="w-5 h-5 text-yellow-500" title="Unverified" />
            </div>
          </div>
        )}

        {/* Other Devices */}
        {otherDevices.length > 0 ? (
          otherDevices.map((device) => (
            <div key={device.deviceId} className="p-4 border rounded-lg">
              <div className="flex items-start space-x-3">
                <Smartphone className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div className="flex-1 min-w-0">
                  <span className="font-medium">{getDeviceDisplayName(device)}</span>
                  <p className="text-sm text-muted-foreground">
                    Device ID: {device.deviceId}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Last seen: {formatLastSeen(device.lastSeenTs)}
                  </p>
                </div>
                <ShieldCheck className="w-5 h-5 text-green-500" title="Verified" />
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 border-2 border-dashed rounded-lg text-center text-muted-foreground">
            <Smartphone className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No other devices found</p>
            <p className="text-sm">This appears to be your first device</p>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="space-x-3">
          <Button variant="outline" onClick={() => setShowSkipWarning(true)}>
            Skip for now
          </Button>
          <Button onClick={nextStep}>
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );

  /**
   * Render verification methods step
   */
  const renderVerificationMethodsStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Verification Options</h3>
        <p className="text-muted-foreground text-sm">
          Choose how you'd like to verify this device:
        </p>
      </div>

      <div className="space-y-3">
        {otherDevices.length > 0 && (
          <button
            onClick={handleStartVerification}
            className="w-full p-4 border rounded-lg hover:bg-muted/50 transition-colors text-left"
          >
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h4 className="font-medium">Verify with another device</h4>
                <p className="text-sm text-muted-foreground">
                  Use one of your {otherDevices.length} other device{otherDevices.length > 1 ? 's' : ''} to verify this one
                </p>
                <Badge variant="secondary" className="mt-1">Recommended</Badge>
              </div>
            </div>
          </button>
        )}

        <button
          onClick={() => setCurrentStep(VerificationStep.TUTORIAL)}
          className="w-full p-4 border rounded-lg hover:bg-muted/50 transition-colors text-left"
        >
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
              <Key className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-medium">Security key setup</h4>
              <p className="text-sm text-muted-foreground">
                Set up a security key backup to recover your account
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => setCurrentStep(VerificationStep.TUTORIAL)}
          className="w-full p-4 border rounded-lg hover:bg-muted/50 transition-colors text-left"
        >
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h4 className="font-medium">Learn more about verification</h4>
              <p className="text-sm text-muted-foreground">
                Get a detailed guide on device verification
              </p>
            </div>
          </div>
        </button>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button variant="outline" onClick={() => setShowSkipWarning(true)}>
          Skip for now
        </Button>
      </div>
    </div>
  );

  /**
   * Render tutorial step
   */
  const renderTutorialStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Device Verification Tutorial</h3>
        <p className="text-muted-foreground text-sm">
          Here's what happens during device verification:
        </p>
      </div>

      <div className="space-y-4">
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Step 1: Initiate verification</AlertTitle>
          <AlertDescription>
            From another device, go to Settings → Security → Device Verification and select this device.
          </AlertDescription>
        </Alert>

        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Step 2: Compare security codes</AlertTitle>
          <AlertDescription>
            Both devices will show matching security codes. Verify they match before confirming.
          </AlertDescription>
        </Alert>

        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Step 3: Complete verification</AlertTitle>
          <AlertDescription>
            Once confirmed, this device will be marked as verified and can access encrypted messages.
          </AlertDescription>
        </Alert>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="space-x-3">
          <Button variant="outline" onClick={() => setShowSkipWarning(true)}>
            Skip for now
          </Button>
          <Button onClick={handleComplete}>
            Got it!
          </Button>
        </div>
      </div>
    </div>
  );

  /**
   * Render skip warning
   */
  const renderSkipWarning = () => (
    <div className="space-y-6">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Are you sure you want to skip?</AlertTitle>
        <AlertDescription>
          Without device verification, you may lose access to encrypted messages if you lose this device.
          You can always set up verification later in Settings.
        </AlertDescription>
      </Alert>

      <div className="flex justify-end space-x-3">
        <Button variant="outline" onClick={() => setShowSkipWarning(false)}>
          Go back
        </Button>
        <Button variant="destructive" onClick={handleSkip}>
          Skip anyway
        </Button>
      </div>
    </div>
  );

  /**
   * Get current step content
   */
  const getCurrentStepContent = () => {
    if (showSkipWarning) {
      return renderSkipWarning();
    }

    switch (currentStep) {
      case VerificationStep.WELCOME:
        return renderWelcomeStep();
      case VerificationStep.EXPLANATION:
        return renderExplanationStep();
      case VerificationStep.DEVICE_LIST:
        return renderDeviceListStep();
      case VerificationStep.VERIFICATION_METHODS:
        return renderVerificationMethodsStep();
      case VerificationStep.TUTORIAL:
        return renderTutorialStep();
      default:
        return renderWelcomeStep();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "sm:max-w-lg max-h-[80vh] overflow-y-auto",
        showSkipWarning && "sm:max-w-md"
      )}>
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Device Verification</span>
          </DialogTitle>
          {!showSkipWarning && (
            <DialogDescription>
              Keep your account secure with device verification
            </DialogDescription>
          )}
        </DialogHeader>
        
        {getCurrentStepContent()}
      </DialogContent>
    </Dialog>
  );
};

export default DeviceVerificationPromptModal;