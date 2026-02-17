/**
 * Sentry Edge Configuration
 * 
 * Edge runtime Sentry configuration for middleware and edge functions
 */

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  
  // Performance monitoring (lighter for edge)
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 0.5,
  
  // Error sampling
  sampleRate: 1.0,
  
  // Release tracking
  release: process.env.SENTRY_RELEASE || process.env.npm_package_version,
  
  // Debug mode
  debug: process.env.NODE_ENV === 'development',
  
  // Minimal integrations for edge runtime (most are now built-in by default)
  integrations: [
    // Built-in integrations are included automatically
    // Custom integrations can be added here if needed
  ],
  
  // Before send hook for edge filtering
  beforeSend(event, hint) {
    // Add edge context
    event.contexts = {
      ...event.contexts,
      app: {
        name: 'HAOS v2 Edge',
        version: process.env.npm_package_version || 'unknown',
      },
      runtime: {
        name: 'edge',
      },
    };
    
    return event;
  },
  
  // Edge-specific options
  attachStacktrace: true,
  sendDefaultPii: false,
});