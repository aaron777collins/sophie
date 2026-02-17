/**
 * Error Reporting Hook
 * 
 * React hook for error reporting with monitoring service integration and user feedback.
 * Provides easy-to-use error reporting capabilities throughout the application.
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { errorReporter, ErrorSeverity, ErrorContext } from '../lib/monitoring/error-reporter';

export interface UseErrorReportingOptions {
  enableUserFeedback?: boolean;
  enableLocalLogging?: boolean;
  feature?: string;
  context?: Record<string, any>;
}

export interface ErrorReportingState {
  isInitialized: boolean;
  lastErrorId: string | null;
  reportingEnabled: boolean;
  userFeedbackEnabled: boolean;
}

export interface ErrorReportingActions {
  reportError: (error: Error, context?: Partial<ErrorContext>, severity?: ErrorSeverity) => Promise<void>;
  reportAsyncError: (errorPromise: Promise<any>, context?: Partial<ErrorContext>) => Promise<void>;
  reportErrorBoundary: (error: Error, errorInfo: React.ErrorInfo, context?: Partial<ErrorContext>) => Promise<void>;
  setUserContext: (userId: string, email?: string, displayName?: string) => void;
  clearUserContext: () => void;
  setTags: (tags: Record<string, string>) => void;
  submitFeedback: (feedback: string, userEmail?: string) => Promise<void>;
  testReporting: () => Promise<void>;
}

export interface UseErrorReportingReturn extends ErrorReportingState, ErrorReportingActions {}

/**
 * Hook for error reporting functionality
 */
export function useErrorReporting(options: UseErrorReportingOptions = {}): UseErrorReportingReturn {
  const [state, setState] = useState<ErrorReportingState>({
    isInitialized: false,
    lastErrorId: null,
    reportingEnabled: false,
    userFeedbackEnabled: false,
  });

  // Initialize error reporter
  useEffect(() => {
    const initializeReporting = async () => {
      try {
        await errorReporter.initialize({
          enableUserFeedback: options.enableUserFeedback !== false,
        });

        setState(prev => ({
          ...prev,
          isInitialized: true,
          reportingEnabled: true,
          userFeedbackEnabled: options.enableUserFeedback !== false,
        }));
      } catch (error) {
        console.error('Failed to initialize error reporting:', error);
        setState(prev => ({
          ...prev,
          isInitialized: true,
          reportingEnabled: false,
        }));
      }
    };

    initializeReporting();
  }, [options.enableUserFeedback]);

  /**
   * Report an error with optional context and severity
   */
  const reportError = useCallback(async (
    error: Error, 
    context?: Partial<ErrorContext>, 
    severity: ErrorSeverity = ErrorSeverity.ERROR
  ) => {
    try {
      const enrichedContext = {
        feature: options.feature,
        ...options.context,
        ...context,
      };

      await errorReporter.captureError(error, enrichedContext, severity);
      
      setState(prev => ({
        ...prev,
        lastErrorId: `error_${Date.now()}`,
      }));
    } catch (reportingError) {
      if (options.enableLocalLogging !== false) {
        console.error('Failed to report error:', reportingError, 'Original error:', error);
      }
    }
  }, [options.feature, options.context, options.enableLocalLogging]);

  /**
   * Report errors from async operations
   */
  const reportAsyncError = useCallback(async (
    errorPromise: Promise<any>,
    context?: Partial<ErrorContext>
  ) => {
    try {
      await errorPromise;
    } catch (error) {
      if (error instanceof Error) {
        await reportError(error, {
          ...context,
          tags: { ...context?.tags, errorType: 'async' },
        }, ErrorSeverity.ERROR);
      } else {
        // Handle non-Error objects
        const errorObj = new Error(`Async operation failed: ${String(error)}`);
        await reportError(errorObj, {
          ...context,
          tags: { ...context?.tags, errorType: 'async-non-error' },
          extra: { originalError: error },
        }, ErrorSeverity.ERROR);
      }
      throw error; // Re-throw to maintain async flow
    }
  }, [reportError]);

  /**
   * Report error from React Error Boundary
   */
  const reportErrorBoundary = useCallback(async (
    error: Error,
    errorInfo: React.ErrorInfo,
    context?: Partial<ErrorContext>
  ) => {
    try {
      const enrichedContext = {
        feature: options.feature,
        ...options.context,
        ...context,
      };

      await errorReporter.captureErrorBoundary(error, errorInfo, enrichedContext);
      
      setState(prev => ({
        ...prev,
        lastErrorId: `boundary_error_${Date.now()}`,
      }));
    } catch (reportingError) {
      if (options.enableLocalLogging !== false) {
        console.error('Failed to report error boundary error:', reportingError, 'Original error:', error);
      }
    }
  }, [options.feature, options.context, options.enableLocalLogging]);

  /**
   * Set user context for error reports
   */
  const setUserContext = useCallback((userId: string, email?: string, displayName?: string) => {
    errorReporter.setUserContext(userId, email, displayName);
  }, []);

  /**
   * Clear user context
   */
  const clearUserContext = useCallback(() => {
    errorReporter.clearUserContext();
  }, []);

  /**
   * Set tags for error reports
   */
  const setTags = useCallback((tags: Record<string, string>) => {
    errorReporter.setTags(tags);
  }, []);

  /**
   * Submit user feedback for the last error
   */
  const submitFeedback = useCallback(async (feedback: string, userEmail?: string) => {
    if (!state.userFeedbackEnabled) {
      console.warn('User feedback is not enabled');
      return;
    }

    try {
      await errorReporter.collectUserFeedback(feedback, userEmail);
    } catch (error) {
      if (options.enableLocalLogging !== false) {
        console.error('Failed to submit user feedback:', error);
      }
      throw error;
    }
  }, [state.userFeedbackEnabled, options.enableLocalLogging]);

  /**
   * Test error reporting functionality
   */
  const testReporting = useCallback(async () => {
    try {
      await errorReporter.testReporting();
    } catch (error) {
      if (options.enableLocalLogging !== false) {
        console.error('Error reporting test failed:', error);
      }
    }
  }, [options.enableLocalLogging]);

  return {
    // State
    ...state,
    
    // Actions
    reportError,
    reportAsyncError,
    reportErrorBoundary,
    setUserContext,
    clearUserContext,
    setTags,
    submitFeedback,
    testReporting,
  };
}

/**
 * Hook for async error handling with automatic reporting
 */
export function useAsyncErrorHandler(options: UseErrorReportingOptions = {}) {
  const { reportAsyncError } = useErrorReporting(options);

  /**
   * Wrap an async function with error reporting
   */
  const withErrorReporting = useCallback(<T extends any[], R>(
    asyncFn: (...args: T) => Promise<R>,
    context?: Partial<ErrorContext>
  ) => {
    return async (...args: T): Promise<R> => {
      const errorPromise = asyncFn(...args);
      return await reportAsyncError(errorPromise, context) as R;
    };
  }, [reportAsyncError]);

  /**
   * Handle promise with error reporting
   */
  const handlePromise = useCallback(
    (promise: Promise<any>, context?: Partial<ErrorContext>): Promise<any> => {
      return reportAsyncError(promise, context);
    },
    [reportAsyncError]
  );

  return {
    withErrorReporting,
    handlePromise,
  };
}

/**
 * Hook for Matrix-specific error reporting
 */
export function useMatrixErrorReporting(roomId?: string, userId?: string) {
  const errorReporting = useErrorReporting({
    feature: 'matrix-integration',
    context: {
      matrixRoomId: roomId,
      matrixUserId: userId,
    },
  });

  /**
   * Report Matrix API errors
   */
  const reportMatrixError = useCallback(async (
    error: Error,
    operation: string,
    additionalContext?: Record<string, any>
  ) => {
    await errorReporting.reportError(error, {
      tags: {
        matrixOperation: operation,
        errorType: 'matrix-api',
      },
      extra: additionalContext,
    }, ErrorSeverity.ERROR);
  }, [errorReporting]);

  /**
   * Report Matrix connection errors
   */
  const reportConnectionError = useCallback(async (
    error: Error,
    homeserver?: string
  ) => {
    await errorReporting.reportError(error, {
      tags: {
        errorType: 'matrix-connection',
        homeserver: homeserver || 'unknown',
      },
    }, ErrorSeverity.WARNING);
  }, [errorReporting]);

  /**
   * Report Matrix sync errors
   */
  const reportSyncError = useCallback(async (
    error: Error,
    syncState: string
  ) => {
    await errorReporting.reportError(error, {
      tags: {
        errorType: 'matrix-sync',
        syncState,
      },
    }, ErrorSeverity.WARNING);
  }, [errorReporting]);

  return {
    ...errorReporting,
    reportMatrixError,
    reportConnectionError,
    reportSyncError,
  };
}

/**
 * Global error handler for unhandled errors
 */
export function useGlobalErrorHandler() {
  const { reportError } = useErrorReporting({
    feature: 'global-handler',
    enableUserFeedback: true,
  });

  useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(`Unhandled promise rejection: ${String(event.reason)}`);
      
      reportError(error, {
        tags: { errorType: 'unhandled-promise-rejection' },
        extra: { reason: event.reason },
      }, ErrorSeverity.ERROR);
    };

    // Handle uncaught errors
    const handleError = (event: ErrorEvent) => {
      const error = event.error instanceof Error 
        ? event.error 
        : new Error(`Uncaught error: ${event.message}`);
      
      reportError(error, {
        tags: { errorType: 'uncaught-error' },
        url: event.filename,
        extra: {
          lineno: event.lineno,
          colno: event.colno,
        },
      }, ErrorSeverity.ERROR);
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, [reportError]);
}