import React, { 
  createContext, 
  useContext, 
  useEffect, 
  useState, 
  useCallback,
  ReactNode
} from 'react';
import { MatrixClient, createClient, ClientEvent } from 'matrix-js-sdk';
import { useFirstLoginDetection } from '../../hooks/use-first-login-detection';
import { DeviceVerificationPromptModal } from '../modals/device-verification-prompt-modal';

interface MatrixProviderProps {
  children: ReactNode;
  homeServerUrl?: string;
  accessToken?: string;
  userId?: string;
  deviceId?: string;
}

interface MatrixContextValue {
  client?: MatrixClient;
  isConnected: boolean;
  isLoading: boolean;
  error?: string;
  showDeviceVerificationPrompt: boolean;
  setShowDeviceVerificationPrompt: (show: boolean) => void;
}

const MatrixContext = createContext<MatrixContextValue | undefined>(undefined);

/**
 * Custom hook to use Matrix context
 */
export const useMatrix = (): MatrixContextValue => {
  const context = useContext(MatrixContext);
  if (!context) {
    throw new Error('useMatrix must be used within a MatrixProvider');
  }
  return context;
};

/**
 * Matrix Provider Component
 * 
 * Manages Matrix client initialization and handles device verification prompts
 * for first-time login scenarios
 */
export const MatrixProvider: React.FC<MatrixProviderProps> = ({
  children,
  homeServerUrl = 'https://matrix.org',
  accessToken,
  userId,
  deviceId
}) => {
  const [client, setClient] = useState<MatrixClient | undefined>();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [showDeviceVerificationPrompt, setShowDeviceVerificationPrompt] = useState(false);

  // Use first login detection hook
  const {
    isFirstLogin,
    isNewDevice,
    currentDevice,
    otherDevices,
    isLoading: isDetectionLoading,
    completeVerification
  } = useFirstLoginDetection(client);

  /**
   * Initialize Matrix client
   */
  const initializeClient = useCallback(async () => {
    if (!accessToken || !userId) {
      setError('Missing authentication credentials');
      return;
    }

    try {
      setIsLoading(true);
      setError(undefined);

      // Create Matrix client
      const newClient = createClient({
        baseUrl: homeServerUrl,
        accessToken,
        userId,
        deviceId,
        timelineSupport: true,
        unstableClientRelationAggregation: true
      });

      // Set up event listeners
      newClient.on(ClientEvent.Sync, (state, prevState, res) => {
        console.log('Matrix sync state:', state);
        
        if (state === 'PREPARED') {
          setIsConnected(true);
          setIsLoading(false);
        } else if (state === 'ERROR') {
          setError('Sync error occurred');
          setIsConnected(false);
          setIsLoading(false);
        }
      });

      newClient.on(ClientEvent.SyncUnexpectedError, (err) => {
        console.error('Matrix sync unexpected error:', err);
        setError('Unexpected sync error');
        setIsConnected(false);
        setIsLoading(false);
      });

      // Start the client
      await newClient.startClient({ initialSyncLimit: 10 });
      
      setClient(newClient);

    } catch (err) {
      console.error('Failed to initialize Matrix client:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize client');
      setIsLoading(false);
    }
  }, [homeServerUrl, accessToken, userId, deviceId]);

  /**
   * Clean up Matrix client
   */
  const cleanupClient = useCallback(() => {
    if (client) {
      client.stopClient();
      setClient(undefined);
      setIsConnected(false);
    }
  }, [client]);

  // Initialize client when credentials are available
  useEffect(() => {
    if (accessToken && userId) {
      initializeClient();
    }

    return () => {
      cleanupClient();
    };
  }, [accessToken, userId, initializeClient, cleanupClient]);

  // Show device verification prompt when needed
  useEffect(() => {
    if (
      isConnected && 
      !isDetectionLoading && 
      isFirstLogin && 
      !showDeviceVerificationPrompt
    ) {
      console.log('Triggering device verification prompt for first login');
      setShowDeviceVerificationPrompt(true);
    }
  }, [isConnected, isDetectionLoading, isFirstLogin, showDeviceVerificationPrompt]);

  /**
   * Handle device verification completion
   */
  const handleVerificationComplete = useCallback(() => {
    console.log('Device verification completed');
    completeVerification();
    setShowDeviceVerificationPrompt(false);
  }, [completeVerification]);

  /**
   * Handle skipping device verification
   */
  const handleVerificationSkip = useCallback(() => {
    console.log('Device verification skipped');
    // Don't mark as completed, so prompt will show again on next login
    setShowDeviceVerificationPrompt(false);
  }, []);

  /**
   * Handle closing device verification modal
   */
  const handleVerificationClose = useCallback(() => {
    setShowDeviceVerificationPrompt(false);
  }, []);

  // Context value
  const contextValue: MatrixContextValue = {
    client,
    isConnected,
    isLoading,
    error,
    showDeviceVerificationPrompt,
    setShowDeviceVerificationPrompt
  };

  return (
    <MatrixContext.Provider value={contextValue}>
      {children}
      
      {/* Device Verification Prompt Modal */}
      <DeviceVerificationPromptModal
        isOpen={showDeviceVerificationPrompt}
        onClose={handleVerificationClose}
        onComplete={handleVerificationComplete}
        onSkip={handleVerificationSkip}
        client={client}
        currentDevice={currentDevice}
        otherDevices={otherDevices}
        isNewDevice={isNewDevice}
      />
    </MatrixContext.Provider>
  );
};

/**
 * Higher-order component to provide Matrix context
 */
export const withMatrix = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P & Partial<MatrixProviderProps>> => {
  return (props) => {
    const { homeServerUrl, accessToken, userId, deviceId, ...componentProps } = props as P & MatrixProviderProps;
    
    return (
      <MatrixProvider
        homeServerUrl={homeServerUrl}
        accessToken={accessToken}
        userId={userId}
        deviceId={deviceId}
      >
        <Component {...(componentProps as P)} />
      </MatrixProvider>
    );
  };
};

export default MatrixProvider;