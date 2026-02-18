import {
  reportMessage,
  validateMatrixClient,
  validateReportReason,
  validateReportDetails,
  formatErrorForDisplay,
  isRetryableError,
  ReportError,
} from '../../src/utils/matrix-reporting';

// Mock Matrix client
const mockMatrixClient = {
  reportEvent: jest.fn(),
  userId: '@test:example.com',
} as any;

describe('Matrix Reporting Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('reportMessage', () => {
    const roomId = '!test-room:example.com';
    const messageId = '$test-message:example.com';
    const reason = 'spam';

    it('should successfully report a message', async () => {
      mockMatrixClient.reportEvent.mockResolvedValue(undefined);

      const result = await reportMessage(mockMatrixClient, roomId, messageId, reason);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(mockMatrixClient.reportEvent).toHaveBeenCalledWith(roomId, messageId, -100, reason);
    });

    it('should report with additional details', async () => {
      mockMatrixClient.reportEvent.mockResolvedValue(undefined);
      const details = 'Additional context';

      const result = await reportMessage(mockMatrixClient, roomId, messageId, reason, details);

      expect(result.success).toBe(true);
      expect(mockMatrixClient.reportEvent).toHaveBeenCalledTimes(2);
      expect(mockMatrixClient.reportEvent).toHaveBeenNthCalledWith(1, roomId, messageId, -100, reason);
      expect(mockMatrixClient.reportEvent).toHaveBeenNthCalledWith(2, roomId, messageId, -100, `${reason}: ${details}`);
    });

    it('should ignore empty details', async () => {
      mockMatrixClient.reportEvent.mockResolvedValue(undefined);

      const result = await reportMessage(mockMatrixClient, roomId, messageId, reason, '   ');

      expect(result.success).toBe(true);
      expect(mockMatrixClient.reportEvent).toHaveBeenCalledTimes(1);
    });

    it('should handle 400 Bad Request error', async () => {
      mockMatrixClient.reportEvent.mockRejectedValue({ httpStatus: 400 });

      const result = await reportMessage(mockMatrixClient, roomId, messageId, reason);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_REQUEST');
      expect(result.error?.message).toBe('Invalid request. The message or room may not exist.');
    });

    it('should handle 401 Unauthorized error', async () => {
      mockMatrixClient.reportEvent.mockRejectedValue({ httpStatus: 401 });

      const result = await reportMessage(mockMatrixClient, roomId, messageId, reason);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('UNAUTHORIZED');
    });

    it('should handle 403 Forbidden error', async () => {
      mockMatrixClient.reportEvent.mockRejectedValue({ httpStatus: 403 });

      const result = await reportMessage(mockMatrixClient, roomId, messageId, reason);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('FORBIDDEN');
      expect(result.error?.message).toBe('You do not have permission to report messages in this room.');
    });

    it('should handle 404 Not Found error', async () => {
      mockMatrixClient.reportEvent.mockRejectedValue({ httpStatus: 404 });

      const result = await reportMessage(mockMatrixClient, roomId, messageId, reason);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NOT_FOUND');
      expect(result.error?.message).toBe('Message or room not found. It may have been deleted.');
    });

    it('should handle 429 Rate Limited error', async () => {
      mockMatrixClient.reportEvent.mockRejectedValue({ httpStatus: 429 });

      const result = await reportMessage(mockMatrixClient, roomId, messageId, reason);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('RATE_LIMITED');
      expect(result.error?.message).toBe('Too many reports sent. Please wait before reporting again.');
    });

    it('should handle 500 Server Error', async () => {
      mockMatrixClient.reportEvent.mockRejectedValue({ httpStatus: 500 });

      const result = await reportMessage(mockMatrixClient, roomId, messageId, reason);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SERVER_ERROR');
      expect(result.error?.message).toBe('Server error. Please try again later.');
    });

    it('should handle Network Error', async () => {
      mockMatrixClient.reportEvent.mockRejectedValue({ name: 'NetworkError', message: 'Failed to fetch' });

      const result = await reportMessage(mockMatrixClient, roomId, messageId, reason);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NETWORK_ERROR');
      expect(result.error?.message).toBe('Network error. Please check your connection and try again.');
    });

    it('should handle Timeout Error', async () => {
      mockMatrixClient.reportEvent.mockRejectedValue({ name: 'TimeoutError', message: 'Request timeout' });

      const result = await reportMessage(mockMatrixClient, roomId, messageId, reason);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('TIMEOUT');
      expect(result.error?.message).toBe('Request timed out. Please try again.');
    });

    it('should handle generic errors', async () => {
      mockMatrixClient.reportEvent.mockRejectedValue(new Error('Generic error'));

      const result = await reportMessage(mockMatrixClient, roomId, messageId, reason);

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Generic error');
    });

    it('should validate required parameters', async () => {
      const result = await reportMessage(mockMatrixClient, '', messageId, reason);

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Missing required parameters for reporting');
    });

    it('should handle null client', async () => {
      const result = await reportMessage(null as any, roomId, messageId, reason);

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Matrix client not available');
    });
  });

  describe('validateMatrixClient', () => {
    it('should return null for valid client', () => {
      const error = validateMatrixClient(mockMatrixClient);
      expect(error).toBeNull();
    });

    it('should return error for null client', () => {
      const error = validateMatrixClient(null);
      expect(error?.code).toBe('CLIENT_UNAVAILABLE');
      expect(error?.message).toBe('Matrix client not available. Please try again later.');
    });
  });

  describe('validateReportReason', () => {
    it('should return null for valid reason', () => {
      const error = validateReportReason('spam');
      expect(error).toBeNull();
    });

    it('should return error for empty reason', () => {
      const error = validateReportReason('');
      expect(error?.code).toBe('EMPTY_REASON');
      expect(error?.message).toBe('Please select a reason for reporting.');
    });

    it('should return error for whitespace-only reason', () => {
      const error = validateReportReason('   ');
      expect(error?.code).toBe('EMPTY_REASON');
    });

    it('should return error for non-string reason', () => {
      const error = validateReportReason(null as any);
      expect(error?.code).toBe('INVALID_REASON');
    });

    it('should return error for overly long reason', () => {
      const longReason = 'a'.repeat(101);
      const error = validateReportReason(longReason);
      expect(error?.code).toBe('REASON_TOO_LONG');
    });
  });

  describe('validateReportDetails', () => {
    it('should return null for valid details', () => {
      const error = validateReportDetails('Some additional context');
      expect(error).toBeNull();
    });

    it('should return null for undefined details', () => {
      const error = validateReportDetails(undefined);
      expect(error).toBeNull();
    });

    it('should return null for empty string details', () => {
      const error = validateReportDetails('');
      expect(error).toBeNull();
    });

    it('should return error for non-string details', () => {
      const error = validateReportDetails(123 as any);
      expect(error?.code).toBe('INVALID_DETAILS');
    });

    it('should return error for overly long details', () => {
      const longDetails = 'a'.repeat(1001);
      const error = validateReportDetails(longDetails);
      expect(error?.code).toBe('DETAILS_TOO_LONG');
    });
  });

  describe('formatErrorForDisplay', () => {
    it('should return error message', () => {
      const error: ReportError = { code: 'TEST', message: 'Test error' };
      const formatted = formatErrorForDisplay(error);
      expect(formatted).toBe('Test error');
    });
  });

  describe('isRetryableError', () => {
    it('should return true for network errors', () => {
      const error: ReportError = { code: 'NETWORK_ERROR', message: 'Network error' };
      expect(isRetryableError(error)).toBe(true);
    });

    it('should return true for timeout errors', () => {
      const error: ReportError = { code: 'TIMEOUT', message: 'Timeout error' };
      expect(isRetryableError(error)).toBe(true);
    });

    it('should return true for server errors', () => {
      const error: ReportError = { code: 'SERVER_ERROR', message: 'Server error' };
      expect(isRetryableError(error)).toBe(true);
    });

    it('should return false for client errors', () => {
      const error: ReportError = { code: 'FORBIDDEN', message: 'Forbidden' };
      expect(isRetryableError(error)).toBe(false);
    });

    it('should return false for validation errors', () => {
      const error: ReportError = { code: 'INVALID_REASON', message: 'Invalid reason' };
      expect(isRetryableError(error)).toBe(false);
    });
  });
});