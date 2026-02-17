import React from 'react';
import { MatrixProvider } from '../providers/matrix-provider';

/**
 * Example integration showing how to use the device verification prompt
 * with the Matrix provider
 */
const AppWithDeviceVerification: React.FC = () => {
  // These would typically come from your authentication system
  const authConfig = {
    homeServerUrl: 'https://matrix.org',
    accessToken: process.env.MATRIX_ACCESS_TOKEN,
    userId: '@user:matrix.org',
    deviceId: 'EXAMPLE_DEVICE_ID'
  };

  return (
    <MatrixProvider
      homeServerUrl={authConfig.homeServerUrl}
      accessToken={authConfig.accessToken}
      userId={authConfig.userId}
      deviceId={authConfig.deviceId}
    >
      <MainApplication />
    </MatrixProvider>
  );
};

/**
 * Your main application component
 */
const MainApplication: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-3">
          <h1 className="text-xl font-semibold">HAOS Chat Application</h1>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Welcome to HAOS</h2>
          <p className="text-muted-foreground">
            Your secure, decentralized chat application.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Device verification will be prompted automatically for new devices.
          </p>
        </div>
      </main>
    </div>
  );
};

export default AppWithDeviceVerification;

/**
 * Example of manual device verification trigger
 */
export const ManualVerificationExample: React.FC = () => {
  const [showModal, setShowModal] = React.useState(false);

  return (
    <MatrixProvider>
      <div className="p-4">
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Show Device Verification
        </button>
        
        {/* Manual control example - normally handled automatically by provider */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Manual Verification</h3>
              <p className="text-sm text-gray-600 mb-4">
                This would normally be triggered automatically by the MatrixProvider
              </p>
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1 bg-gray-200 rounded"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </MatrixProvider>
  );
};