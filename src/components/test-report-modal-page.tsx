import React, { useState } from 'react';
import { Button, Card, Typography } from 'antd';
import { ReportMessageModal } from './report-message-modal';
import { MatrixProvider } from '../../matrix-client/lib/matrix/matrix-context';

const { Title, Text } = Typography;

/**
 * Test page for demonstrating the Report Message Modal functionality
 * This component is used primarily for e2e testing
 */
export const TestReportModalPage: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);

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
    setModalVisible(false);
  };

  const handleReportCancel = () => {
    console.log('Report cancelled');
    setModalVisible(false);
  };

  return (
    <MatrixProvider>
      <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
        <Title level={2}>Message Reporting Test Page</Title>
        
        <Card title="Test Scenario" style={{ marginBottom: '24px' }}>
          <Text>
            This page is designed for testing the message reporting functionality. 
            Click the button below to open the report modal with mock message data.
          </Text>
        </Card>

        <Card title="Mock Message Data" style={{ marginBottom: '24px' }}>
          <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
            <div><strong>Message ID:</strong> {mockMessageData.messageId}</div>
            <div><strong>Room ID:</strong> {mockMessageData.roomId}</div>
            <div><strong>Sender:</strong> {mockMessageData.eventContent.sender}</div>
            <div><strong>Content:</strong> {mockMessageData.eventContent.body}</div>
            <div><strong>Timestamp:</strong> {new Date(mockMessageData.eventContent.timestamp).toLocaleString()}</div>
          </div>
        </Card>

        <Button 
          type="primary" 
          danger 
          size="large"
          onClick={() => setModalVisible(true)}
          data-testid="open-report-modal"
        >
          Report Message
        </Button>

        <ReportMessageModal
          visible={modalVisible}
          onCancel={handleReportCancel}
          onSuccess={handleReportSuccess}
          messageId={mockMessageData.messageId}
          roomId={mockMessageData.roomId}
          eventContent={mockMessageData.eventContent}
        />

        <Card title="Instructions" style={{ marginTop: '24px' }}>
          <ul>
            <li>Click "Report Message" to open the modal</li>
            <li>Select a reason from the dropdown</li>
            <li>Optionally add additional details</li>
            <li>Click "Report Message" to submit</li>
            <li>The modal will show success/error messages</li>
            <li>Check browser console for API call logs</li>
          </ul>
        </Card>
      </div>
    </MatrixProvider>
  );
};

export default TestReportModalPage;