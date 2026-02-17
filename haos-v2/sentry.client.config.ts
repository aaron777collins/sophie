/**
 * Sentry Client Configuration
 * 
 * Client-side Sentry configuration for browser error reporting
 */

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  
  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Error sampling
  sampleRate: 1.0,
  
  // Release tracking
  release: process.env.SENTRY_RELEASE || process.env.npm_package_version,
  
  // Debug mode
  debug: process.env.NODE_ENV === 'development',
  
  // Enhanced integrations (most are now built-in by default)
  integrations: [
    // Built-in integrations are included automatically
    // Custom integrations can be added here if needed
  ],
  
  // Before send hook for filtering and enrichment
  beforeSend(event, hint) {
    // Filter out noise in development
    if (process.env.NODE_ENV === 'development') {
      // Skip HMR and webpack errors
      if (event.exception?.values?.[0]?.value?.includes('ChunkLoadError') ||
          event.exception?.values?.[0]?.value?.includes('Loading chunk') ||
          event.exception?.values?.[0]?.value?.includes('webpack')) {
        return null;
      }
    }
    
    // Add additional context
    if (typeof window !== 'undefined') {
      event.contexts = {
        ...event.contexts,
        app: {
          name: 'HAOS v2',
          version: process.env.npm_package_version || 'unknown',
        },
        browser: {
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
          },
          url: window.location.href,
        },
      };
      
      // Add performance context
      if (typeof performance !== 'undefined') {
        const navigation = performance.getEntriesByType('navigation')[0] as any;
        if (navigation && navigation.domContentLoadedEventEnd && navigation.loadEventEnd) {
          event.contexts.performance = {
            domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - (navigation.navigationStart || 0)),
            loadComplete: Math.round(navigation.loadEventEnd - (navigation.navigationStart || 0)),
          };
        }
      }
    }
    
    return event;
  },
  
  // Additional options
  attachStacktrace: true,
  sendDefaultPii: false, // Don't send personally identifiable information
});