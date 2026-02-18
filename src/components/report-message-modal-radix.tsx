import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Select from '@radix-ui/react-select';
import { AlertTriangle, X, ChevronDown, RotateCcw } from 'lucide-react';
import { cn } from '../utils/cn';
import { useMatrixClient } from '../../matrix-client/lib/matrix/matrix-context';
import { 
  reportMessage, 
  validateMatrixClient, 
  validateReportReason, 
  validateReportDetails, 
  formatErrorForDisplay, 
  isRetryableError 
} from '../utils/matrix-reporting';

export interface ReportReason {
  value: string;
  label: string;
}

export interface ReportMessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
  open,
  onOpenChange,
  onSuccess,
  messageId,
  roomId,
  eventContent,
}) => {
  const [reason, setReason] = useState<string>('');
  const [details, setDetails] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFormValues, setLastFormValues] = useState<{ reason: string; details?: string } | null>(null);
  const matrixClient = useMatrixClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason) {
      setError('Please select a reason for reporting');
      return;
    }

    setLoading(true);
    setError(null);
    const values = { reason, details: details || undefined };
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
        // Show success message (you might want to use a toast library here)
        console.log('Message reported successfully');
        resetForm();
        onSuccess();
        onOpenChange(false);
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
      setReason(lastFormValues.reason);
      setDetails(lastFormValues.details || '');
      const syntheticEvent = { preventDefault: () => {} } as React.FormEvent;
      await handleSubmit(syntheticEvent);
    }
  };

  const resetForm = () => {
    setReason('');
    setDetails('');
    setError(null);
    setLastFormValues(null);
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  const formatTimestamp = (timestamp?: number) => {
    if (!timestamp) return 'Unknown time';
    return new Date(timestamp).toLocaleString();
  };

  const selectedReasonLabel = DEFAULT_REPORT_REASONS.find(r => r.value === reason)?.label || 'Select a reason...';

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 z-40" />
        <Dialog.Content className="fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-lg bg-white p-6 shadow-lg z-50 overflow-y-auto">
          <Dialog.Title className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Report Message
          </Dialog.Title>
          
          <Dialog.Close asChild>
            <button
              className="absolute top-4 right-4 inline-flex h-6 w-6 items-center justify-center rounded-full text-gray-400 hover:text-gray-600"
              aria-label="Close"
              onClick={handleCancel}
            >
              <X className="h-4 w-4" />
            </button>
          </Dialog.Close>

          {eventContent && (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-3 mb-4">
              <div className="text-xs text-gray-600 mb-1">Reported Message:</div>
              <div className="font-medium mb-1">From: {eventContent.sender || 'Unknown'}</div>
              <div className="text-xs text-gray-600 mb-2">
                {formatTimestamp(eventContent.timestamp)}
              </div>
              <div className="bg-white border rounded p-2 max-h-20 overflow-y-auto text-sm">
                {eventContent.body || 'No message content available'}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
                <div className="flex items-center gap-2">
                  {lastFormValues && isRetryableError({ code: 'UNKNOWN', message: error }) && (
                    <button
                      onClick={handleRetry}
                      disabled={loading}
                      className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded flex items-center gap-1 disabled:opacity-50"
                      data-testid="retry-report-button"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Retry
                    </button>
                  )}
                  <button
                    onClick={() => setError(null)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for reporting *
              </label>
              <Select.Root value={reason} onValueChange={setReason}>
                <Select.Trigger
                  className="inline-flex w-full items-center justify-between rounded border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                  data-testid="report-reason-select"
                >
                  <Select.Value placeholder="Select a reason...">
                    {selectedReasonLabel}
                  </Select.Value>
                  <Select.Icon>
                    <ChevronDown className="h-4 w-4" />
                  </Select.Icon>
                </Select.Trigger>

                <Select.Portal>
                  <Select.Content className="relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white text-gray-950 shadow-md animate-in fade-in-80">
                    <Select.Viewport className="p-1">
                      {DEFAULT_REPORT_REASONS.map((reportReason) => (
                        <Select.Item
                          key={reportReason.value}
                          value={reportReason.value}
                          className="relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-gray-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                        >
                          <Select.ItemText>{reportReason.label}</Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional details (optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Optional: Provide additional details about why you're reporting this message..."
                maxLength={500}
                rows={3}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                data-testid="report-details-textarea"
              />
              <div className="text-xs text-gray-500 mt-1">
                {details.length} / 500 characters
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Provide any additional context that might help moderators understand the issue.
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "px-4 py-2 text-sm font-medium text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed",
                  "bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                )}
                data-testid="submit-report-button"
              >
                {loading ? 'Reporting...' : 'Report Message'}
              </button>
            </div>
          </form>

          <div className="mt-4 p-3 bg-gray-50 rounded-md border">
            <div className="text-xs text-gray-600">
              <strong>Note:</strong> This report will be sent to the room moderators and server administrators. 
              False reports may result in action taken against your account.
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ReportMessageModal;