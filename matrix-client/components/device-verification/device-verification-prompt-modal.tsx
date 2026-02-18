import React, { useState, useCallback } from 'react';
import { MatrixClient } from 'matrix-js-sdk';

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
  const [currentStep, setCurrentStep] = useState<
    'welcome' | 'explanation' | 'deviceList' | 'verificationMethods' | 'tutorial' | 'skipWarning'
  >('welcome');

  const formatLastSeen = useCallback((lastSeenTs?: number): string => {
    if (!lastSeenTs) return 'Never';
    
    const now = Date.now();
    const diffMs = now - lastSeenTs;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  }, []);

  const handleGetStarted = () => {
    setCurrentStep('explanation');
  };

  const handleContinue = () => {
    if (currentStep === 'explanation') {
      setCurrentStep('deviceList');
    } else if (currentStep === 'deviceList') {
      setCurrentStep('verificationMethods');
    }
  };

  const handleBack = () => {
    if (currentStep === 'deviceList') {
      setCurrentStep('explanation');
    } else if (currentStep === 'verificationMethods') {
      setCurrentStep('deviceList');
    } else if (currentStep === 'tutorial') {
      setCurrentStep('verificationMethods');
    } else if (currentStep === 'skipWarning') {
      setCurrentStep('welcome');
    }
  };

  const handleStartVerification = () => {
    // In real implementation, this would start the device verification process
    onComplete();
  };

  const handleOpenTutorial = () => {
    setCurrentStep('tutorial');
  };

  const handleSkip = () => {
    setCurrentStep('skipWarning');
  };

  const handleSkipConfirm = () => {
    onSkip();
  };

  const handleTutorialComplete = () => {
    onComplete();
  };

  if (!isOpen) return null;

  const renderWelcome = () => (
    <div>
      <h1>Device Verification</h1>
      <h2>{isNewDevice ? 'New Device Detected' : 'Welcome to HAOS'}</h2>
      <p>
        {isNewDevice 
          ? "We've detected you're logging in from a new device" 
          : 'To keep your messages secure'}
      </p>
      <button onClick={handleGetStarted}>Get Started</button>
      <button onClick={handleSkip}>Skip for now</button>
    </div>
  );

  const renderExplanation = () => (
    <div>
      <h2>How Device Verification Works</h2>
      <p>Device verification helps ensure your messages stay secure</p>
      <button onClick={handleBack}>Back</button>
      <button onClick={handleContinue}>Continue</button>
    </div>
  );

  const renderDeviceList = () => (
    <div>
      <h2>Your Devices</h2>
      <div>
        <h3>Current Device</h3>
        <div>This device</div>
        <div>{currentDevice?.deviceId}</div>
        <div>{currentDevice?.displayName}</div>
      </div>
      {otherDevices.length > 0 ? (
        <div>
          <h3>Other Devices</h3>
          {otherDevices.map((device) => (
            <div key={device.deviceId}>
              <div>{device.displayName}</div>
              <div>{device.deviceId}</div>
              <div>Last seen: {formatLastSeen(device.lastSeenTs)}</div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <div>No other devices found</div>
          <div>This appears to be your first device</div>
        </div>
      )}
      <button onClick={handleBack}>Back</button>
      <button onClick={handleContinue}>Continue</button>
    </div>
  );

  const renderVerificationMethods = () => (
    <div>
      <h2>Choose Verification Method</h2>
      {otherDevices.length > 0 && (
        <button onClick={handleStartVerification}>
          Verify with another device
          <div>Use one of your {otherDevices.length} other devices</div>
        </button>
      )}
      <button onClick={handleOpenTutorial}>
        Learn more about verification
        <div>Security key setup</div>
      </button>
      <button onClick={handleBack}>Back</button>
    </div>
  );

  const renderTutorial = () => (
    <div>
      <h2>Device Verification Tutorial</h2>
      <div>Step 1: Initiate verification</div>
      <div>Step 2: Compare security codes</div>
      <div>Step 3: Complete verification</div>
      <button onClick={handleBack}>Back</button>
      <button onClick={handleTutorialComplete}>Got it!</button>
    </div>
  );

  const renderSkipWarning = () => (
    <div>
      <h2>Are you sure you want to skip?</h2>
      <p>Without device verification</p>
      <button onClick={handleBack}>Go back</button>
      <button onClick={handleSkipConfirm}>Skip anyway</button>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'welcome':
        return renderWelcome();
      case 'explanation':
        return renderExplanation();
      case 'deviceList':
        return renderDeviceList();
      case 'verificationMethods':
        return renderVerificationMethods();
      case 'tutorial':
        return renderTutorial();
      case 'skipWarning':
        return renderSkipWarning();
      default:
        return renderWelcome();
    }
  };

  return (
    <div data-testid="dialog" onClick={onClose}>
      {renderCurrentStep()}
    </div>
  );
};