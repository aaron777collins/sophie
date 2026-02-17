/**
 * Sentry Server Configuration
 * 
 * Server-side Sentry configuration for Node.js error reporting
 */

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  
  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Error sampling
  sampleRate: 1.0,
  
  // Release tracking
  release: process.env.SENTRY_RELEASE || process.env.npm_package_version,
  
  // Debug mode
  debug: process.env.NODE_ENV === 'development',
  
  // Enhanced integrations for server (most are now built-in by default)
  integrations: [
    // Built-in integrations are included automatically
    // Custom integrations can be added here if needed
  ],
  
  // Before send hook for server-side filtering
  beforeSend(event, hint) {
    // Filter out development noise
    if (process.env.NODE_ENV === 'development') {
      // Skip common development errors
      const errorMessage = event.exception?.values?.[0]?.value || '';
      if (errorMessage.includes('ECONNREFUSED') ||
          errorMessage.includes('ENOTFOUND') ||
          errorMessage.includes('connect ECONNREFUSED')) {
        return null;
      }
    }
    
    // Add server context
    event.contexts = {
      ...event.contexts,
      app: {
        name: 'HAOS v2 Server',
        version: process.env.npm_package_version || 'unknown',
      },
      runtime: {
        name: 'node',
        version: process.version,
      },
      os: {
        name: process.platform,
        version: process.version,
      },
    };
    
    return event;
  },
  
  // Server-specific options
  attachStacktrace: true,
  sendDefaultPii: false,
});