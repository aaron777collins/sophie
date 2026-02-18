import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { ReportMessageModal } from './report-message-modal-radix';
import { MatrixProvider } from '../../matrix-client/lib/matrix/matrix-context';

/**
 * Test page for demonstrating the Report Message Modal functionality (Radix UI version)
 * This component is used primarily for e2e testing
 */
export const TestReportModalPageRadix: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);

  const mockMessageData = {
    messageId: '$test-message-id:example.com',
    roomId: '!test-room:example.com',
    eventContent: {
      body: 'This is a test message that needs to be reported for violations',
      sender: '@problematic-user:example.com',
      timestamp: Date.now() - 300000, // 5 minutes ago
    },
  };

  const handleReportSuccess = () => {
    console.log('Report submitted successfully');
    setModalOpen(false);
  };

  return (
    <MatrixProvider>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900">Message Reporting Test Page</h1>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h2 className="text-lg font-semibold text-blue-900 mb-2">Test Scenario</h2>
                <p className="text-blue-800">
                  This page is designed for testing the message reporting functionality. 
                  Click the button below to open the report modal with mock message data.
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Mock Message Data</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Message ID:</span> {mockMessageData.messageId}</div>
                  <div><span className="font-medium">Room ID:</span> {mockMessageData.roomId}</div>
                  <div><span className="font-medium">Sender:</span> {mockMessageData.eventContent.sender}</div>
                  <div><span className="font-medium">Content:</span> {mockMessageData.eventContent.body}</div>
                  <div><span className="font-medium">Timestamp:</span> {new Date(mockMessageData.eventContent.timestamp).toLocaleString()}</div>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  data-testid="open-report-modal"
                >
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Report Message
                </button>
              </div>

              <ReportMessageModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                onSuccess={handleReportSuccess}
                messageId={mockMessageData.messageId}
                roomId={mockMessageData.roomId}
                eventContent={mockMessageData.eventContent}
              />

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">Instructions</h3>
                <ul className="list-disc list-inside space-y-1 text-yellow-800">
                  <li>Click "Report Message" to open the modal</li>
                  <li>Select a reason from the dropdown</li>
                  <li>Optionally add additional details</li>
                  <li>Click "Report Message" to submit</li>
                  <li>The modal will show success/error messages</li>
                  <li>Check browser console for API call logs</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <h3 className="text-lg font-semibold text-green-900 mb-2">Features Tested</h3>
                <ul className="list-disc list-inside space-y-1 text-green-800">
                  <li>Form validation (required reason selection)</li>
                  <li>Character count for details field</li>
                  <li>Error handling and display</li>
                  <li>Loading states during submission</li>
                  <li>Retry functionality for network errors</li>
                  <li>Message preview display</li>
                  <li>Responsive design</li>
                  <li>Accessibility features</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MatrixProvider>
  );
};

export default TestReportModalPageRadix;