/**
 * Client Providers Component
 * 
 * Wraps the application with client-side providers like error reporting,
 * global state management, and other client-only functionality.
 */

'use client';

import React, { useEffect } from 'react';
import { errorReporter, ErrorSeverity } from '../../lib/monitoring/error-reporter';

interface ClientProvidersProps {
  children: React.ReactNode;
}

/**
 * Error Reporting Provider
 * 
 * Sets up global error handlers and error reporting context
 */
function ErrorReportingProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize error reporting
    errorReporter.initialize().catch(console.error);
    
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason instanceof Error 
        ? event.reason 
        : new Error(`Unhandled promise rejection: ${String(event.reason)}`);
      
      errorReporter.captureError(error, {
        tags: { errorType: 'unhandled-promise-rejection' },
        extra: { reason: event.reason },
      }, ErrorSeverity.ERROR).catch(console.error);
    };

    // Handle uncaught errors
    const handleError = (event: ErrorEvent) => {
      const error = event.error instanceof Error 
        ? event.error 
        : new Error(`Uncaught error: ${event.message}`);
      
      errorReporter.captureError(error, {
        tags: { errorType: 'uncaught-error' },
        url: event.filename,
        extra: {
          lineno: event.lineno,
          colno: event.colno,
        },
      }, ErrorSeverity.ERROR).catch(console.error);
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);
  
  return <>{children}</>;
}

/**
 * Main client providers wrapper
 */
export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ErrorReportingProvider>
      {children}
    </ErrorReportingProvider>
  );
}