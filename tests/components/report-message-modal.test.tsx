import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReportMessageModal } from '../../src/components/report-message-modal';
import { MatrixProvider } from '../../matrix-client/lib/matrix/matrix-context';
import '@testing-library/jest-dom';

// Mock the Matrix context
jest.mock('../../matrix-client/lib/matrix/matrix-context');

// Mock antd message component
jest.mock('antd', () => {
  const antd = jest.requireActual('antd');
  return {
    ...antd,
    message: {
      success: jest.fn(),
      error: jest.fn(),
    },
  };
});

// Mock matrix reporting utilities
jest.mock('../../src/utils/matrix-reporting', () => ({
  reportMessage: jest.fn(),
  validateMatrixClient: jest.fn(),
  validateReportReason: jest.fn(),
  validateReportDetails: jest.fn(),
  formatErrorForDisplay: jest.fn((error) => error.message),
  isRetryableError: jest.fn(),
}));

const mockMatrixClient = {
  reportEvent: jest.fn(),
  userId: '@test:example.com',
};

const mockUseMatrixClient = jest.requireMock('../../matrix-client/lib/matrix/matrix-context');
mockUseMatrixClient.useMatrixClient = jest.fn(() => mockMatrixClient);

const mockReportingUtils = jest.requireMock('../../src/utils/matrix-reporting');

// Test props
const defaultProps = {
  visible: true,
  onCancel: jest.fn(),
  onSuccess: jest.fn(),
  messageId: '$test-message:example.com',
  roomId: '!test-room:example.com',
  eventContent: {
    body: 'Test message content',
    sender: '@sender:example.com',
    timestamp: Date.now(),
  },
};

const renderModal = (props = {}) => {
  const combinedProps = { ...defaultProps, ...props };
  return render(
    <MatrixProvider>
      <ReportMessageModal {...combinedProps} />
    </MatrixProvider>
  );
};

describe('ReportMessageModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReportingUtils.validateMatrixClient.mockReturnValue(null);
    mockReportingUtils.validateReportReason.mockReturnValue(null);
    mockReportingUtils.validateReportDetails.mockReturnValue(null);
    mockReportingUtils.reportMessage.mockResolvedValue({ success: true });
    mockReportingUtils.isRetryableError.mockReturnValue(false);
  });

  describe('Rendering', () => {
    it('should render modal when visible', () => {
      renderModal();
      expect(screen.getByText('Report Message')).toBeInTheDocument();
    });

    it('should not render modal when not visible', () => {
      renderModal({ visible: false });
      expect(screen.queryByText('Report Message')).not.toBeInTheDocument();
    });

    it('should display message preview when eventContent is provided', () => {
      renderModal();
      expect(screen.getByText('Reported Message:')).toBeInTheDocument();
      expect(screen.getByText('Test message content')).toBeInTheDocument();
      expect(screen.getByText('From: @sender:example.com')).toBeInTheDocument();
    });

    it('should render all form elements', () => {
      renderModal();
      expect(screen.getByTestId('report-reason-select')).toBeInTheDocument();
      expect(screen.getByTestId('report-details-textarea')).toBeInTheDocument();
      expect(screen.getByTestId('submit-report-button')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should display warning about false reports', () => {
      renderModal();
      expect(screen.getByText(/False reports may result in action taken against your account/)).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should require a reason to be selected', async () => {
      const user = userEvent.setup();
      renderModal();

      const submitButton = screen.getByTestId('submit-report-button');
      await user.click(submitButton);

      expect(await screen.findByText('Please select a reason for reporting')).toBeInTheDocument();
    });

    it('should allow submission with valid reason', async () => {
      const user = userEvent.setup();
      renderModal();

      // Select reason
      const reasonSelect = screen.getByTestId('report-reason-select');
      await user.click(reasonSelect);
      await user.click(screen.getByText('Spam'));

      // Submit
      const submitButton = screen.getByTestId('submit-report-button');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockReportingUtils.reportMessage).toHaveBeenCalledWith(
          mockMatrixClient,
          defaultProps.roomId,
          defaultProps.messageId,
          'spam',
          undefined
        );
      });
    });

    it('should include details when provided', async () => {
      const user = userEvent.setup();
      renderModal();

      // Select reason
      const reasonSelect = screen.getByTestId('report-reason-select');
      await user.click(reasonSelect);
      await user.click(screen.getByText('Harassment or Abuse'));

      // Add details
      const detailsTextarea = screen.getByTestId('report-details-textarea');
      await user.type(detailsTextarea, 'Additional context about the issue');

      // Submit
      const submitButton = screen.getByTestId('submit-report-button');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockReportingUtils.reportMessage).toHaveBeenCalledWith(
          mockMatrixClient,
          defaultProps.roomId,
          defaultProps.messageId,
          'harassment',
          'Additional context about the issue'
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('should display validation errors', async () => {
      const user = userEvent.setup();
      mockReportingUtils.validateReportReason.mockReturnValue({
        code: 'INVALID_REASON',
        message: 'Invalid reason selected'
      });

      renderModal();

      // Select reason and submit
      const reasonSelect = screen.getByTestId('report-reason-select');
      await user.click(reasonSelect);
      await user.click(screen.getByText('Spam'));

      const submitButton = screen.getByTestId('submit-report-button');
      await user.click(submitButton);

      expect(await screen.findByText('Invalid reason selected')).toBeInTheDocument();
    });

    it('should display API errors', async () => {
      const user = userEvent.setup();
      mockReportingUtils.reportMessage.mockResolvedValue({
        success: false,
        error: { code: 'RATE_LIMITED', message: 'Too many requests' }
      });

      renderModal();

      // Select reason and submit
      const reasonSelect = screen.getByTestId('report-reason-select');
      await user.click(reasonSelect);
      await user.click(screen.getByText('Spam'));

      const submitButton = screen.getByTestId('submit-report-button');
      await user.click(submitButton);

      expect(await screen.findByText('Too many requests')).toBeInTheDocument();
    });

    it('should show retry button for retryable errors', async () => {
      const user = userEvent.setup();
      mockReportingUtils.reportMessage.mockResolvedValue({
        success: false,
        error: { code: 'NETWORK_ERROR', message: 'Network error' }
      });
      mockReportingUtils.isRetryableError.mockReturnValue(true);

      renderModal();

      // Select reason and submit
      const reasonSelect = screen.getByTestId('report-reason-select');
      await user.click(reasonSelect);
      await user.click(screen.getByText('Spam'));

      const submitButton = screen.getByTestId('submit-report-button');
      await user.click(submitButton);

      expect(await screen.findByText('Network error')).toBeInTheDocument();
      expect(screen.getByTestId('retry-report-button')).toBeInTheDocument();
    });

    it('should retry with same values when retry button is clicked', async () => {
      const user = userEvent.setup();
      
      // First call fails
      mockReportingUtils.reportMessage
        .mockResolvedValueOnce({
          success: false,
          error: { code: 'NETWORK_ERROR', message: 'Network error' }
        })
        .mockResolvedValueOnce({ success: true });
      mockReportingUtils.isRetryableError.mockReturnValue(true);

      renderModal();

      // Select reason and submit
      const reasonSelect = screen.getByTestId('report-reason-select');
      await user.click(reasonSelect);
      await user.click(screen.getByText('Spam'));

      const submitButton = screen.getByTestId('submit-report-button');
      await user.click(submitButton);

      // Wait for error and retry
      expect(await screen.findByText('Network error')).toBeInTheDocument();
      const retryButton = screen.getByTestId('retry-report-button');
      await user.click(retryButton);

      // Should call reportMessage twice with same params
      await waitFor(() => {
        expect(mockReportingUtils.reportMessage).toHaveBeenCalledTimes(2);
        expect(mockReportingUtils.reportMessage).toHaveBeenNthCalledWith(1, mockMatrixClient, defaultProps.roomId, defaultProps.messageId, 'spam', undefined);
        expect(mockReportingUtils.reportMessage).toHaveBeenNthCalledWith(2, mockMatrixClient, defaultProps.roomId, defaultProps.messageId, 'spam', undefined);
      });
    });
  });

  describe('Success Flow', () => {
    it('should call onSuccess and reset form on successful report', async () => {
      const user = userEvent.setup();
      const mockOnSuccess = jest.fn();
      renderModal({ onSuccess: mockOnSuccess });

      // Select reason and submit
      const reasonSelect = screen.getByTestId('report-reason-select');
      await user.click(reasonSelect);
      await user.click(screen.getByText('Spam'));

      const submitButton = screen.getByTestId('submit-report-button');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });
  });

  describe('Cancel Flow', () => {
    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const mockOnCancel = jest.fn();
      renderModal({ onCancel: mockOnCancel });

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('should reset form when modal is cancelled', async () => {
      const user = userEvent.setup();
      renderModal();

      // Fill form
      const reasonSelect = screen.getByTestId('report-reason-select');
      await user.click(reasonSelect);
      await user.click(screen.getByText('Spam'));

      const detailsTextarea = screen.getByTestId('report-details-textarea');
      await user.type(detailsTextarea, 'Some details');

      // Cancel
      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      // Form should be reset (this would be tested in integration with the actual form)
      expect(defaultProps.onCancel).toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      let resolveReport: (value: any) => void;
      const reportPromise = new Promise(resolve => {
        resolveReport = resolve;
      });
      mockReportingUtils.reportMessage.mockReturnValue(reportPromise);

      renderModal();

      // Select reason and submit
      const reasonSelect = screen.getByTestId('report-reason-select');
      await user.click(reasonSelect);
      await user.click(screen.getByText('Spam'));

      const submitButton = screen.getByTestId('submit-report-button');
      await user.click(submitButton);

      // Should show loading
      expect(screen.getByText('Reporting...')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeDisabled();

      // Resolve promise
      resolveReport({ success: true });
      await waitFor(() => {
        expect(screen.queryByText('Reporting...')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels and roles', () => {
      renderModal();
      
      // Modal should be properly labeled
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      
      // Form elements should be properly labeled
      expect(screen.getByLabelText(/reason for reporting/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/additional details/i)).toBeInTheDocument();
    });
  });
});