/**
 * Error Reporter Service
 * 
 * Centralized error reporting service for HAOS v2 application.
 * Provides a unified interface for capturing, enriching, and reporting errors
 * to various monitoring services (Sentry, custom endpoints, local logging).
 */

import { SentryIntegration } from './sentry-integration';

export enum ErrorSeverity {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  FATAL = 'fatal'
}

export interface ErrorContext {
  // User context
  userId?: string;
  userEmail?: string;
  displayName?: string;
  
  // Technical context
  userAgent?: string;
  url?: string;
  referrer?: string;
  timestamp?: string;
  sessionId?: string;
  correlationId?: string;
  
  // App context
  componentStack?: string;
  errorBoundary?: string;
  feature?: string;
  matrixRoomId?: string;
  matrixUserId?: string;
  
  // Custom metadata
  tags?: Record<string, string>;
  extra?: Record<string, any>;
}

export interface ErrorReport {
  error: Error;
  severity: ErrorSeverity;
  context: ErrorContext;
  fingerprint?: string[];
  userFeedback?: string;
}

export interface ErrorReportingConfig {
  environment: string;
  enabled: boolean;
  sentryDsn?: string;
  customEndpoint?: string;
  localLogging?: boolean;
  enableUserFeedback?: boolean;
  sampleRate?: number;
  beforeSend?: (errorReport: ErrorReport) => ErrorReport | null;
}

class ErrorReporter {
  private config: ErrorReportingConfig;
  private sentryIntegration?: SentryIntegration;
  private initialized = false;

  constructor() {
    this.config = this.getDefaultConfig();
  }

  /**
   * Initialize the error reporter with configuration
   */
  async initialize(config?: Partial<ErrorReportingConfig>): Promise<void> {
    if (this.initialized) {
      console.warn('ErrorReporter already initialized');
      return;
    }

    this.config = { ...this.config, ...config };

    // Initialize Sentry if DSN is provided
    if (this.config.enabled && this.config.sentryDsn) {
      this.sentryIntegration = new SentryIntegration();
      await this.sentryIntegration.initialize({
        dsn: this.config.sentryDsn,
        environment: this.config.environment,
        sampleRate: this.config.sampleRate,
        enableUserFeedback: this.config.enableUserFeedback,
      });
    }

    this.initialized = true;
    
    if (this.config.localLogging) {
      console.log('ErrorReporter initialized', {
        environment: this.config.environment,
        sentryEnabled: !!this.config.sentryDsn,
        customEndpoint: !!this.config.customEndpoint
      });
    }
  }

  /**
   * Report an error to configured monitoring services
   */
  async reportError(errorReport: ErrorReport): Promise<void> {
    if (!this.initialized) {
      console.warn('ErrorReporter not initialized, dropping error report');
      return;
    }

    if (!this.config.enabled) {
      if (this.config.localLogging) {
        console.debug('Error reporting disabled, skipping report');
      }
      return;
    }

    // Apply beforeSend filter
    const filteredReport = this.config.beforeSend ? this.config.beforeSend(errorReport) : errorReport;
    if (!filteredReport) {
      if (this.config.localLogging) {
        console.debug('Error report filtered out by beforeSend hook');
      }
      return;
    }

    // Report to Sentry
    if (this.sentryIntegration) {
      try {
        await this.sentryIntegration.captureError(filteredReport);
      } catch (error) {
        console.error('Failed to report error to Sentry:', error);
      }
    }

    // Report to custom endpoint
    if (this.config.customEndpoint) {
      try {
        await this.reportToCustomEndpoint(filteredReport);
      } catch (error) {
        console.error('Failed to report error to custom endpoint:', error);
      }
    }

    // Local logging
    if (this.config.localLogging) {
      this.logErrorLocally(filteredReport);
    }
  }

  /**
   * Convenience method for reporting errors with minimal context
   */
  async captureError(error: Error, context?: Partial<ErrorContext>, severity: ErrorSeverity = ErrorSeverity.ERROR): Promise<void> {
    const errorReport: ErrorReport = {
      error,
      severity,
      context: this.enrichContext(context || {}),
    };

    await this.reportError(errorReport);
  }

  /**
   * Report an exception from an error boundary
   */
  async captureErrorBoundary(error: Error, errorInfo: React.ErrorInfo, context?: Partial<ErrorContext>): Promise<void> {
    const enrichedContext: ErrorContext = {
      ...this.enrichContext(context || {}),
      componentStack: errorInfo.componentStack || undefined,
      errorBoundary: context?.errorBoundary || 'Unknown'
    };

    const errorReport: ErrorReport = {
      error,
      severity: ErrorSeverity.ERROR,
      context: enrichedContext,
    };

    await this.reportError(errorReport);
  }

  /**
   * Set user context for all subsequent error reports
   */
  setUserContext(userId: string, email?: string, displayName?: string): void {
    if (this.sentryIntegration) {
      this.sentryIntegration.setUserContext({ userId, email, displayName });
    }
  }

  /**
   * Clear user context
   */
  clearUserContext(): void {
    if (this.sentryIntegration) {
      this.sentryIntegration.clearUserContext();
    }
  }

  /**
   * Add tags to all subsequent error reports
   */
  setTags(tags: Record<string, string>): void {
    if (this.sentryIntegration) {
      this.sentryIntegration.setTags(tags);
    }
  }

  /**
   * Collect user feedback for the last reported error
   */
  async collectUserFeedback(feedback: string, userEmail?: string): Promise<void> {
    if (this.sentryIntegration && this.config.enableUserFeedback) {
      await this.sentryIntegration.submitUserFeedback(feedback, userEmail);
    }
  }

  /**
   * Test error reporting functionality
   */
  async testReporting(): Promise<void> {
    const testError = new Error('Test error from ErrorReporter');
    await this.captureError(testError, { feature: 'error-reporting-test' }, ErrorSeverity.INFO);
  }

  /**
   * Get default configuration from environment variables
   */
  private getDefaultConfig(): ErrorReportingConfig {
    return {
      environment: process.env.NODE_ENV || 'development',
      enabled: process.env.ERROR_REPORTING_ENABLED !== 'false',
      sentryDsn: process.env.SENTRY_DSN,
      customEndpoint: process.env.ERROR_REPORTING_ENDPOINT,
      localLogging: process.env.NODE_ENV === 'development',
      enableUserFeedback: process.env.SENTRY_USER_FEEDBACK_ENABLED === 'true',
      sampleRate: parseFloat(process.env.ERROR_SAMPLE_RATE || '1.0'),
    };
  }

  /**
   * Enrich error context with runtime information
   */
  private enrichContext(context: Partial<ErrorContext>): ErrorContext {
    const enriched: ErrorContext = {
      ...context,
      timestamp: context.timestamp || new Date().toISOString(),
      url: context.url || (typeof window !== 'undefined' ? window.location.href : undefined),
      userAgent: context.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : undefined),
      referrer: context.referrer || (typeof document !== 'undefined' ? document.referrer : undefined),
    };

    // Generate session ID if not provided
    if (!enriched.sessionId && typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('error-reporting-session-id');
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        sessionStorage.setItem('error-reporting-session-id', sessionId);
      }
      enriched.sessionId = sessionId;
    }

    return enriched;
  }

  /**
   * Report error to custom endpoint
   */
  private async reportToCustomEndpoint(errorReport: ErrorReport): Promise<void> {
    if (!this.config.customEndpoint) return;

    const payload = {
      error: {
        name: errorReport.error.name,
        message: errorReport.error.message,
        stack: errorReport.error.stack,
      },
      severity: errorReport.severity,
      context: errorReport.context,
      fingerprint: errorReport.fingerprint,
      userFeedback: errorReport.userFeedback,
      timestamp: new Date().toISOString(),
    };

    const response = await fetch(this.config.customEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Custom endpoint responded with status: ${response.status}`);
    }
  }

  /**
   * Log error locally for development/debugging
   */
  private logErrorLocally(errorReport: ErrorReport): void {
    console.group(`🚨 Error Report [${errorReport.severity.toUpperCase()}]`);
    console.error('Error:', errorReport.error);
    console.table(errorReport.context);
    if (errorReport.fingerprint) {
      console.log('Fingerprint:', errorReport.fingerprint);
    }
    if (errorReport.userFeedback) {
      console.log('User Feedback:', errorReport.userFeedback);
    }
    console.groupEnd();
  }
}

// Global instance
export const errorReporter = new ErrorReporter();

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
  errorReporter.initialize().catch(console.error);
}