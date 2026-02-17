/**
 * Error Boundary Component
 * 
 * Multi-level error boundary system with smart recovery and monitoring integration.
 * Provides comprehensive error isolation and user-friendly error handling.
 */

'use client';

import React, { Component, ReactNode } from 'react';
import { ErrorFallback } from './error-fallback';
import { errorReporter, ErrorSeverity } from '../../lib/monitoring/error-reporter';

export interface ErrorBoundaryProps {
  children: ReactNode;
  level?: 'app' | 'page' | 'section' | 'component';
  name?: string;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  enableRecovery?: boolean;
  enableUserFeedback?: boolean;
  context?: Record<string, any>;
}

export interface ErrorFallbackProps {
  error: Error;
  errorInfo: React.ErrorInfo;
  resetError: () => void;
  level: string;
  name: string;
  enableRecovery: boolean;
  enableUserFeedback: boolean;
  context?: Record<string, any>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorId: string | null;
  retryCount: number;
  isRecovering: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeouts: NodeJS.Timeout[] = [];

  constructor(props: ErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
      isRecovering: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state to trigger error UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Capture additional error info
    this.setState({
      errorInfo,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });

    // Report error to monitoring service
    this.reportError(error, errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Determine if auto-retry should be attempted
    if (this.shouldAutoRetry(error)) {
      this.scheduleAutoRetry();
    }
  }

  componentWillUnmount() {
    // Clean up any pending retry timeouts
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
  }

  /**
   * Report error to the monitoring service
   */
  private async reportError(error: Error, errorInfo: React.ErrorInfo) {
    try {
      const context = {
        errorBoundary: this.props.name || `${this.props.level || 'unknown'}-boundary`,
        feature: this.props.context?.feature,
        ...this.props.context,
      };

      await errorReporter.captureErrorBoundary(error, errorInfo, context);
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }

  /**
   * Determine if error should trigger auto-retry
   */
  private shouldAutoRetry(error: Error): boolean {
    const { level, enableRecovery } = this.props;
    const { retryCount } = this.state;

    // Don't auto-retry if disabled or too many attempts
    if (!enableRecovery || retryCount >= this.getMaxRetries()) {
      return false;
    }

    // Auto-retry network and chunk loading errors
    const retryableErrors = [
      'ChunkLoadError',
      'Loading chunk',
      'NetworkError',
      'fetch',
      'Connection',
    ];

    return retryableErrors.some(pattern => 
      error.message.includes(pattern) || error.name.includes(pattern)
    );
  }

  /**
   * Get maximum retry attempts based on boundary level
   */
  private getMaxRetries(): number {
    const { level } = this.props;
    
    switch (level) {
      case 'app':
        return 1; // App-level errors are serious, minimal retries
      case 'page':
        return 2;
      case 'section':
        return 3;
      case 'component':
        return 3;
      default:
        return 2;
    }
  }

  /**
   * Schedule automatic retry with exponential backoff
   */
  private scheduleAutoRetry() {
    const { retryCount } = this.state;
    const delay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Max 10s delay

    this.setState({ isRecovering: true });

    const timeout = setTimeout(() => {
      this.handleRetry();
    }, delay);

    this.retryTimeouts.push(timeout);
  }

  /**
   * Handle retry attempt
   */
  private handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: prevState.retryCount + 1,
      isRecovering: false,
    }));

    // Add breadcrumb for retry attempt
    errorReporter.setTags({
      errorRecovery: 'auto-retry',
      retryCount: this.state.retryCount.toString(),
    });
  };

  /**
   * Manual retry (triggered by user action)
   */
  private resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
      retryCount: 0,
      isRecovering: false,
    });

    // Add breadcrumb for manual retry
    errorReporter.setTags({
      errorRecovery: 'manual-reset',
    });
  };

  render() {
    const { hasError, error, errorInfo, isRecovering } = this.state;
    const { children, fallback: CustomFallback, level = 'component', name = 'Unknown' } = this.props;

    // Show recovery state
    if (isRecovering) {
      return (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Attempting to recover...</p>
          </div>
        </div>
      );
    }

    // Show error fallback if error occurred
    if (hasError && error && errorInfo) {
      const FallbackComponent = CustomFallback || ErrorFallback;
      
      return (
        <FallbackComponent
          error={error}
          errorInfo={errorInfo}
          resetError={this.resetError}
          level={level}
          name={name}
          enableRecovery={this.props.enableRecovery !== false}
          enableUserFeedback={this.props.enableUserFeedback !== false}
          context={this.props.context}
        />
      );
    }

    // Render children normally
    return children;
  }
}

/**
 * Higher-order component for wrapping components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

/**
 * App-level error boundary for critical error handling
 */
export const AppErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary
    level="app"
    name="app-boundary"
    enableRecovery={true}
    enableUserFeedback={true}
    context={{ feature: 'app-shell' }}
  >
    {children}
  </ErrorBoundary>
);

/**
 * Page-level error boundary for route-specific error handling
 */
export const PageErrorBoundary: React.FC<{ children: ReactNode; pageName?: string }> = ({ 
  children, 
  pageName = 'unknown-page' 
}) => (
  <ErrorBoundary
    level="page"
    name={`${pageName}-page-boundary`}
    enableRecovery={true}
    enableUserFeedback={true}
    context={{ feature: pageName }}
  >
    {children}
  </ErrorBoundary>
);

/**
 * Section-level error boundary for UI sections
 */
export const SectionErrorBoundary: React.FC<{ 
  children: ReactNode; 
  sectionName: string;
  feature?: string;
}> = ({ children, sectionName, feature }) => (
  <ErrorBoundary
    level="section"
    name={`${sectionName}-section-boundary`}
    enableRecovery={true}
    enableUserFeedback={false}
    context={{ feature: feature || sectionName }}
  >
    {children}
  </ErrorBoundary>
);

/**
 * Component-level error boundary for individual components
 */
export const ComponentErrorBoundary: React.FC<{ 
  children: ReactNode; 
  componentName: string;
  enableUserFeedback?: boolean;
}> = ({ children, componentName, enableUserFeedback = false }) => (
  <ErrorBoundary
    level="component"
    name={`${componentName}-component-boundary`}
    enableRecovery={true}
    enableUserFeedback={enableUserFeedback}
    context={{ feature: componentName }}
  >
    {children}
  </ErrorBoundary>
);