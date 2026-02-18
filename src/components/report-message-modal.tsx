import React, { useState } from 'react';
import { Modal, Form, Select, Input, Button, Alert, message } from 'antd';
import { ExclamationCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { useMatrixClient } from '../../matrix-client/lib/matrix/matrix-context';
import { 
  reportMessage, 
  validateMatrixClient, 
  validateReportReason, 
  validateReportDetails, 
  formatErrorForDisplay, 
  isRetryableError 
} from '../utils/matrix-reporting';

const { Option } = Select;
const { TextArea } = Input;

export interface ReportReason {
  value: string;
  label: string;
}

export interface ReportMessageModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  messageId: string;
  roomId: string;
  eventContent?: {
    body?: string;
    sender?: string;
    timestamp?: number;
  };
}

const DEFAULT_REPORT_REASONS: ReportReason[] = [
  { value: 'spam', label: 'Spam' },
  { value: 'harassment', label: 'Harassment or Abuse' },
  { value: 'hate_speech', label: 'Hate Speech' },
  { value: 'violence', label: 'Threats or Violence' },
  { value: 'illegal', label: 'Illegal Content' },
  { value: 'inappropriate', label: 'Inappropriate Content' },
  { value: 'misinformation', label: 'Misinformation' },
  { value: 'other', label: 'Other' },
];

export const ReportMessageModal: React.FC<ReportMessageModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  messageId,
  roomId,
  eventContent,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFormValues, setLastFormValues] = useState<{ reason: string; details?: string } | null>(null);
  const matrixClient = useMatrixClient();

  const handleSubmit = async (values: { reason: string; details?: string }) => {
    setLoading(true);
    setError(null);
    setLastFormValues(values);

    try {
      // Validate Matrix client
      const clientError = validateMatrixClient(matrixClient);
      if (clientError) {
        setError(formatErrorForDisplay(clientError));
        return;
      }

      // Validate reason
      const reasonError = validateReportReason(values.reason);
      if (reasonError) {
        setError(formatErrorForDisplay(reasonError));
        return;
      }

      // Validate details
      const detailsError = validateReportDetails(values.details);
      if (detailsError) {
        setError(formatErrorForDisplay(detailsError));
        return;
      }

      // Submit the report
      const result = await reportMessage(matrixClient!, roomId, messageId, values.reason, values.details);

      if (result.success) {
        message.success('Message reported successfully');
        form.resetFields();
        onSuccess();
      } else if (result.error) {
        setError(formatErrorForDisplay(result.error));
      }
    } catch (err: any) {
      console.error('Unexpected error during report submission:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    if (lastFormValues) {
      await handleSubmit(lastFormValues);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setError(null);
    setLastFormValues(null);
    onCancel();
  };

  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return 'Unknown time';
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ExclamationCircleOutlined style={{ color: '#faad14' }} />
          Report Message
        </div>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={500}
      destroyOnClose
    >
      {eventContent && (
        <div 
          style={{ 
            background: '#f5f5f5', 
            padding: '12px', 
            borderRadius: '4px', 
            marginBottom: '16px',
            border: '1px solid #d9d9d9'
          }}
        >
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
            Reported Message:
          </div>
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            From: {eventContent.sender || 'Unknown'}
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
            {formatTimestamp(eventContent.timestamp)}
          </div>
          <div style={{ 
            background: 'white', 
            padding: '8px', 
            borderRadius: '3px',
            maxHeight: '100px',
            overflow: 'auto'
          }}>
            {eventContent.body || 'No message content available'}
          </div>
        </div>
      )}

      {error && (
        <Alert 
          message={error} 
          type="error" 
          showIcon 
          closable 
          onClose={() => setError(null)}
          style={{ marginBottom: '16px' }}
          action={
            lastFormValues && isRetryableError({ code: 'UNKNOWN', message: error }) ? (
              <Button 
                size="small" 
                icon={<ReloadOutlined />}
                onClick={handleRetry}
                loading={loading}
                data-testid="retry-report-button"
              >
                Retry
              </Button>
            ) : undefined
          }
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
      >
        <Form.Item
          name="reason"
          label="Reason for reporting"
          rules={[{ required: true, message: 'Please select a reason for reporting' }]}
        >
          <Select 
            placeholder="Select a reason..."
            size="large"
            data-testid="report-reason-select"
          >
            {DEFAULT_REPORT_REASONS.map(reason => (
              <Option key={reason.value} value={reason.value}>
                {reason.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="details"
          label="Additional details (optional)"
          help="Provide any additional context that might help moderators understand the issue."
        >
          <TextArea 
            rows={3}
            placeholder="Optional: Provide additional details about why you're reporting this message..."
            maxLength={500}
            showCount
            data-testid="report-details-textarea"
          />
        </Form.Item>

        <div style={{ textAlign: 'right', gap: '8px', display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>
          <Button 
            type="primary" 
            danger
            htmlType="submit" 
            loading={loading}
            data-testid="submit-report-button"
          >
            {loading ? 'Reporting...' : 'Report Message'}
          </Button>
        </div>
      </Form>

      <div style={{ 
        marginTop: '16px', 
        padding: '12px', 
        background: '#f0f0f0', 
        borderRadius: '4px',
        fontSize: '12px',
        color: '#666'
      }}>
        <strong>Note:</strong> This report will be sent to the room moderators and server administrators. 
        False reports may result in action taken against your account.
      </div>
    </Modal>
  );
};

export default ReportMessageModal;