/**
 * Root Layout Component
 * 
 * Main layout for the HAOS v2 application with error boundaries,
 * error reporting integration, and comprehensive monitoring.
 */

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AppErrorBoundary } from '../components/error/error-boundary';
import { ClientProviders } from '../components/providers/client-providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'HAOS v2',
  description: 'Home Assistant Operating System v2 - Matrix-powered chat application',
};

export const viewport = 'width=device-width, initial-scale=1';

/**
 * Root Layout Component
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Meta tags for PWA and error reporting */}
        <meta name="theme-color" content="#000000" />
        <meta name="error-reporting-version" content="1.0" />
        
        {/* Sentry environment variables for client-side */}
        {process.env.SENTRY_DSN && (
          <>
            <meta name="sentry-dsn" content={process.env.SENTRY_DSN} />
            <meta name="sentry-environment" content={process.env.NODE_ENV} />
            <meta name="sentry-release" content={process.env.SENTRY_RELEASE || 'unknown'} />
          </>
        )}
      </head>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        {/* App-level Error Boundary - catches all errors */}
        <AppErrorBoundary>
          {/* Client-side Providers - error reporting, etc. */}
          <ClientProviders>
            {/* Main Application Content */}
            <div id="root" className="min-h-screen bg-background text-foreground">
              {children}
            </div>
            
            {/* Error Reporting Overlay Container */}
            <div id="error-reporting-overlay" />
            
            {/* Toast Notifications Container */}
            <div id="toast-container" />
          </ClientProviders>
        </AppErrorBoundary>
        
        {/* Development Error Overlay */}
        {process.env.NODE_ENV === 'development' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // Development error overlay helpers
                window.__HAOS_ERROR_REPORTING__ = {
                  enabled: true,
                  environment: 'development',
                  debug: true
                };
                
                // Enhanced console logging for development
                const originalError = console.error;
                console.error = function(...args) {
                  originalError.apply(console, args);
                  // Could add additional dev-only error handling here
                };
              `,
            }}
          />
        )}
        
        {/* Production Analytics and Monitoring */}
        {process.env.NODE_ENV === 'production' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.__HAOS_ERROR_REPORTING__ = {
                  enabled: ${!!process.env.SENTRY_DSN},
                  environment: 'production',
                  debug: false
                };
              `,
            }}
          />
        )}
      </body>
    </html>
  );
}