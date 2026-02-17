const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js configuration
  
  // Turbopack configuration (required for Next.js 16+)
  turbopack: {},
  
  // Set the app directory path
  experimental: {
    // Other experimental features can go here
  },
  
  // Source maps for error reporting
  productionBrowserSourceMaps: true,
  
  // Environment variables for client-side
  env: {
    NEXT_PUBLIC_SENTRY_DSN: process.env.SENTRY_DSN,
  },
  
  // Headers for security and error reporting
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Security headers
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Error reporting headers
          {
            key: 'Report-To',
            value: JSON.stringify({
              group: 'default',
              max_age: 10886400,
              endpoints: [{ url: '/api/error-reports' }],
            }),
          },
        ],
      },
    ];
  },
};

// Sentry configuration
const sentryWebpackPluginOptions = {
  // Sentry auth token (set in environment)
  authToken: process.env.SENTRY_AUTH_TOKEN,
  
  // Organization and project
  org: process.env.SENTRY_ORG || 'haos-org',
  project: process.env.SENTRY_PROJECT || 'haos-v2',
  
  // Upload source maps to Sentry
  silent: true,
  
  // Release configuration
  release: {
    name: process.env.SENTRY_RELEASE || process.env.npm_package_version,
    create: true,
    deploy: {
      env: process.env.NODE_ENV,
    },
  },
  
  // Webpack plugin options
  include: ['.next/static/chunks/', '.next/server/'],
  ignore: ['node_modules/', 'cypress/', 'test/', '.next/cache/'],
  
  // Source map options
  sourcemaps: {
    disable: false,
    deleteAfterUpload: process.env.NODE_ENV === 'production',
  },
  
  // Error telemetry
  telemetry: false,
  
  // Disable during development to speed up builds
  disableServerWebpackPlugin: process.env.NODE_ENV === 'development',
  disableClientWebpackPlugin: process.env.NODE_ENV === 'development',
};

// Export configuration with Sentry integration
module.exports = process.env.SENTRY_DSN 
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig;