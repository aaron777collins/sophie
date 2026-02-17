/**
 * Sentry Integration Service
 * 
 * Handles Sentry SDK integration for Next.js application.
 * Provides error capturing, user feedback, and performance monitoring.
 */

import * as Sentry from '@sentry/nextjs';
import type { ErrorReport, ErrorContext } from './error-reporter';

export interface SentryConfig {
  dsn: string;
  environment: string;
  sampleRate?: number;
  enableUserFeedback?: boolean;
  enablePerformance?: boolean;
  performanceSampleRate?: number;
  beforeSend?: (event: Sentry.Event) => Sentry.Event | null;
  beforeSendTransaction?: (event: Sentry.Event) => Sentry.Event | null;
}

export interface UserContext {
  userId: string;
  email?: string;
  displayName?: string;
}

export class SentryIntegration {
  private initialized = false;
  private config?: SentryConfig;

  /**
   * Initialize Sentry SDK with configuration
   */
  async initialize(config: SentryConfig): Promise<void> {
    if (this.initialized) {
      console.warn('Sentry integration already initialized');
      return;
    }

    this.config = config;

    Sentry.init({
      dsn: config.dsn,
      environment: config.environment,
      
      // Performance monitoring
      tracesSampleRate: config.enablePerformance ? (config.performanceSampleRate || 0.1) : 0,
      
      // Error sampling
      sampleRate: config.sampleRate || 1.0,
      
      // Release and version info
      release: process.env.SENTRY_RELEASE || process.env.npm_package_version,
      
      // Integration configuration
      integrations: [
        // Built-in integrations are automatically included in newer versions
        // Custom integrations can be added if needed
      ],
      
      // Before send hooks
      beforeSend: (event, hint) => {
        // Apply custom beforeSend if provided
        if (config.beforeSend) {
          const filteredEvent = config.beforeSend(event);
          if (!filteredEvent) return null;
          event = filteredEvent as any;
        }
        
        // Filter out development noise
        if (config.environment === 'development') {
          // Skip HMR and development-only errors
          if (event.exception?.values?.[0]?.value?.includes('ChunkLoadError') ||
              event.exception?.values?.[0]?.value?.includes('Loading chunk')) {
            return null;
          }
        }
        
        // Enhance error context
        if (event.exception?.values?.[0]) {
          const error = event.exception.values[0];
          
          // Add browser info
          if (typeof window !== 'undefined') {
            event.contexts = {
              ...event.contexts,
              browser: {
                name: this.getBrowserName(),
                version: this.getBrowserVersion(),
                viewport: {
                  width: window.innerWidth,
                  height: window.innerHeight,
                },
              },
            };
          }
          
          // Add performance info if available
          if (typeof performance !== 'undefined') {
            const navigation = performance.getEntriesByType('navigation')[0] as any;
            if (navigation && navigation.domContentLoadedEventEnd && navigation.loadEventEnd) {
              event.contexts = {
                ...event.contexts,
                performance: {
                  domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - (navigation.navigationStart || 0)),
                  loadComplete: Math.round(navigation.loadEventEnd - (navigation.navigationStart || 0)),
                  pageLoad: Math.round(navigation.loadEventEnd - (navigation.fetchStart || 0)),
                },
              };
            }
          }
        }
        
        return event;
      },
      
      // beforeSendTransaction: config.beforeSendTransaction, // Removed due to type conflicts
      
      // Debug mode in development
      debug: config.environment === 'development',
      
      // Attach stack trace for console messages
      attachStacktrace: true,
    });

    this.initialized = true;
    console.log('Sentry integration initialized', {
      environment: config.environment,
      performanceMonitoring: config.enablePerformance,
    });
  }

  /**
   * Capture an error report with Sentry
   */
  async captureError(errorReport: ErrorReport): Promise<string | null> {
    if (!this.initialized) {
      console.warn('Sentry not initialized');
      return null;
    }

    return new Promise((resolve) => {
      Sentry.withScope((scope) => {
        // Set severity
        scope.setLevel(this.mapSeverityToSentryLevel(errorReport.severity));
        
        // Set user context
        if (errorReport.context.userId) {
          scope.setUser({
            id: errorReport.context.userId,
            email: errorReport.context.userEmail,
            username: errorReport.context.displayName,
          });
        }
        
        // Set tags
        if (errorReport.context.tags) {
          Object.entries(errorReport.context.tags).forEach(([key, value]) => {
            scope.setTag(key, value);
          });
        }
        
        // Set additional context
        const contextData: Record<string, any> = {};
        
        if (errorReport.context.url) {
          contextData.url = errorReport.context.url;
        }
        
        if (errorReport.context.componentStack) {
          contextData.componentStack = errorReport.context.componentStack;
        }
        
        if (errorReport.context.errorBoundary) {
          scope.setTag('errorBoundary', errorReport.context.errorBoundary);
        }
        
        if (errorReport.context.feature) {
          scope.setTag('feature', errorReport.context.feature);
        }
        
        if (errorReport.context.matrixRoomId) {
          scope.setTag('matrixRoomId', errorReport.context.matrixRoomId);
        }
        
        if (errorReport.context.matrixUserId) {
          scope.setTag('matrixUserId', errorReport.context.matrixUserId);
        }
        
        if (errorReport.context.sessionId) {
          scope.setTag('sessionId', errorReport.context.sessionId);
        }
        
        if (errorReport.context.correlationId) {
          scope.setTag('correlationId', errorReport.context.correlationId);
        }
        
        // Add extra context
        if (errorReport.context.extra) {
          scope.setContext('additional', errorReport.context.extra);
        }
        
        scope.setContext('errorContext', contextData);
        
        // Set fingerprint for grouping
        if (errorReport.fingerprint) {
          scope.setFingerprint(errorReport.fingerprint);
        }
        
        // Capture the error
        const eventId = Sentry.captureException(errorReport.error);
        resolve(eventId);
      });
    });
  }

  /**
   * Set user context for all subsequent events
   */
  setUserContext(userContext: UserContext): void {
    if (!this.initialized) return;
    
    Sentry.setUser({
      id: userContext.userId,
      email: userContext.email,
      username: userContext.displayName,
    });
  }

  /**
   * Clear user context
   */
  clearUserContext(): void {
    if (!this.initialized) return;
    
    Sentry.setUser(null);
  }

  /**
   * Set tags for all subsequent events
   */
  setTags(tags: Record<string, string>): void {
    if (!this.initialized) return;
    
    Object.entries(tags).forEach(([key, value]) => {
      Sentry.setTag(key, value);
    });
  }

  /**
   * Submit user feedback for the last error
   */
  async submitUserFeedback(feedback: string, userEmail?: string): Promise<void> {
    if (!this.initialized || !this.config?.enableUserFeedback) return;
    
    const lastEventId = Sentry.lastEventId();
    if (!lastEventId) {
      console.warn('No recent error event to attach feedback to');
      return;
    }
    
    const user = Sentry.getCurrentScope().getUser();
    
    Sentry.captureFeedback({
      name: user?.username || 'Anonymous User',
      email: userEmail || user?.email || 'no-email@example.com',
      message: feedback,
    });
  }

  /**
   * Add breadcrumb for debugging context
   */
  addBreadcrumb(message: string, category?: string, level?: Sentry.SeverityLevel, data?: any): void {
    if (!this.initialized) return;
    
    Sentry.addBreadcrumb({
      message,
      category: category || 'custom',
      level: level || 'info',
      data,
      timestamp: Date.now() / 1000,
    });
  }

  /**
   * Start a performance transaction
   */
  startTransaction(name: string, op?: string): void {
    if (!this.initialized || !this.config?.enablePerformance) return;
    
    Sentry.startSpan({
      name,
      op: op || 'navigation',
    }, () => {
      // Transaction work goes here
    });
  }

  /**
   * Test Sentry integration
   */
  testCapture(): void {
    if (!this.initialized) return;
    
    const testError = new Error('Test error from Sentry integration');
    this.captureError({
      error: testError,
      severity: 'info' as any,
      context: {
        feature: 'sentry-integration-test',
        extra: { testMode: true },
      },
    });
  }

  /**
   * Map error reporter severity to Sentry severity level
   */
  private mapSeverityToSentryLevel(severity: string): Sentry.SeverityLevel {
    switch (severity) {
      case 'debug':
        return 'debug';
      case 'info':
        return 'info';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      case 'fatal':
        return 'fatal';
      default:
        return 'error';
    }
  }

  /**
   * Get browser name from user agent
   */
  private getBrowserName(): string {
    if (typeof navigator === 'undefined') return 'unknown';
    
    const userAgent = navigator.userAgent;
    
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';
    
    return 'unknown';
  }

  /**
   * Get browser version from user agent
   */
  private getBrowserVersion(): string {
    if (typeof navigator === 'undefined') return 'unknown';
    
    const userAgent = navigator.userAgent;
    const browserName = this.getBrowserName();
    
    let match: RegExpMatchArray | null = null;
    
    switch (browserName) {
      case 'Chrome':
        match = userAgent.match(/Chrome\/([0-9.]+)/);
        break;
      case 'Firefox':
        match = userAgent.match(/Firefox\/([0-9.]+)/);
        break;
      case 'Safari':
        match = userAgent.match(/Version\/([0-9.]+)/);
        break;
      case 'Edge':
        match = userAgent.match(/Edge\/([0-9.]+)/);
        break;
      case 'Opera':
        match = userAgent.match(/Opera\/([0-9.]+)/);
        break;
    }
    
    return match ? match[1] : 'unknown';
  }
}