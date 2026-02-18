import { MatrixClient } from 'matrix-js-sdk';

export interface ReportError {
  code: string;
  message: string;
  httpStatus?: number;
}

export interface ReportResult {
  success: boolean;
  error?: ReportError;
}

/**
 * Report a message to Matrix moderators/administrators
 * 
 * @param client - Matrix client instance
 * @param roomId - The room ID where the message was sent
 * @param messageId - The event ID of the message to report
 * @param reason - The reason for reporting (short code)
 * @param details - Optional additional details
 * @returns Promise<ReportResult>
 */
export async function reportMessage(
  client: MatrixClient,
  roomId: string,
  messageId: string,
  reason: string,
  details?: string
): Promise<ReportResult> {
  try {
    if (!client) {
      throw new Error('Matrix client not available');
    }

    // Validate inputs
    if (!roomId || !messageId || !reason) {
      throw new Error('Missing required parameters for reporting');
    }

    // Report the message with the primary reason
    // Score of -100 indicates this is a serious report requiring attention
    await client.reportEvent(roomId, messageId, -100, reason);

    // If additional details are provided, send a second report with the detailed reason
    if (details && details.trim()) {
      const detailedReason = `${reason}: ${details.trim()}`;
      await client.reportEvent(roomId, messageId, -100, detailedReason);
    }

    return { success: true };

  } catch (error: any) {
    console.error('Failed to report message:', error);
    
    const reportError: ReportError = {
      code: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred while reporting the message',
      httpStatus: error?.httpStatus,
    };

    // Handle specific Matrix API errors
    if (error?.httpStatus) {
      switch (error.httpStatus) {
        case 400:
          reportError.code = 'INVALID_REQUEST';
          reportError.message = 'Invalid request. The message or room may not exist.';
          break;
        case 401:
          reportError.code = 'UNAUTHORIZED';
          reportError.message = 'You are not authorized to perform this action.';
          break;
        case 403:
          reportError.code = 'FORBIDDEN';
          reportError.message = 'You do not have permission to report messages in this room.';
          break;
        case 404:
          reportError.code = 'NOT_FOUND';
          reportError.message = 'Message or room not found. It may have been deleted.';
          break;
        case 429:
          reportError.code = 'RATE_LIMITED';
          reportError.message = 'Too many reports sent. Please wait before reporting again.';
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          reportError.code = 'SERVER_ERROR';
          reportError.message = 'Server error. Please try again later.';
          break;
        default:
          reportError.message = `HTTP ${error.httpStatus}: ${error.message || 'Unknown error'}`;
      }
    } else if (error?.name === 'NetworkError' || error?.code === 'NETWORK_ERROR') {
      reportError.code = 'NETWORK_ERROR';
      reportError.message = 'Network error. Please check your connection and try again.';
    } else if (error?.name === 'TimeoutError') {
      reportError.code = 'TIMEOUT';
      reportError.message = 'Request timed out. Please try again.';
    } else if (error?.message) {
      reportError.message = error.message;
    }

    return { success: false, error: reportError };
  }
}

/**
 * Validate that a Matrix client is available and connected
 */
export function validateMatrixClient(client: MatrixClient | null): ReportError | null {
  if (!client) {
    return {
      code: 'CLIENT_UNAVAILABLE',
      message: 'Matrix client not available. Please try again later.',
    };
  }

  // Additional validation could be added here
  // For example, checking if the client is properly authenticated
  
  return null;
}

/**
 * Sanitize and validate report reason
 */
export function validateReportReason(reason: string): ReportError | null {
  if (!reason || typeof reason !== 'string') {
    return {
      code: 'INVALID_REASON',
      message: 'Please select a valid reason for reporting.',
    };
  }

  const trimmedReason = reason.trim();
  if (trimmedReason.length === 0) {
    return {
      code: 'EMPTY_REASON',
      message: 'Please select a reason for reporting.',
    };
  }

  if (trimmedReason.length > 100) {
    return {
      code: 'REASON_TOO_LONG',
      message: 'Reason is too long. Please select from the available options.',
    };
  }

  return null;
}

/**
 * Sanitize and validate additional details
 */
export function validateReportDetails(details?: string): ReportError | null {
  if (!details) {
    return null; // Details are optional
  }

  if (typeof details !== 'string') {
    return {
      code: 'INVALID_DETAILS',
      message: 'Additional details must be text.',
    };
  }

  const trimmedDetails = details.trim();
  if (trimmedDetails.length > 1000) {
    return {
      code: 'DETAILS_TOO_LONG',
      message: 'Additional details are too long. Please keep them under 1000 characters.',
    };
  }

  return null;
}

/**
 * Format error message for user display
 */
export function formatErrorForDisplay(error: ReportError): string {
  return error.message;
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: ReportError): boolean {
  const retryableCodes = ['NETWORK_ERROR', 'TIMEOUT', 'SERVER_ERROR'];
  return retryableCodes.includes(error.code);
}