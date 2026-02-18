const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Dynamic output configuration - use 'export' for static builds, 'standalone' for Docker
  output: process.env.NEXT_OUTPUT_MODE === 'export' ? 'export' : 'standalone',
  
  // Fix workspace root warning (only for standalone mode)
  ...(process.env.NEXT_OUTPUT_MODE !== 'export' && {
    outputFileTracingRoot: path.join(__dirname, '../../'),
  }),
  
  // Enable trailing slash for static export compatibility
  trailingSlash: process.env.NEXT_OUTPUT_MODE === 'export' ? true : false,
  
  transpilePackages: ['@haos/shared'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Skip type checking during build - resolved hanging TypeScript compiler issue
    // Type checking can be done separately via `pnpm type-check` command
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['matrix.org', 'dev2.aaroncollins.info'],
    unoptimized: true,
  },
  
  // Build optimizations to prevent hanging
  experimental: {
    // Disable features that might cause build to hang
    optimizeCss: false,
    workerThreads: false,
  },
  
  // Webpack optimizations
  webpack: (config, { isServer }) => {
    // Fix matrix-js-sdk multiple entrypoints issue
    config.resolve.alias = {
      ...config.resolve.alias,
      'matrix-js-sdk': require.resolve('matrix-js-sdk'),
    }
    
    // Reduce build complexity and potential hanging points
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        buffer: false,
      }
    }
    
    // Disable complex optimization for export
    if (process.env.NEXT_OUTPUT_MODE === 'export') {
      config.optimization = {
        ...config.optimization,
        splitChunks: false,
        minimize: false, // Disable minification to speed up build
        sideEffects: false,
      }
      
      // Disable problematic plugins
      config.plugins = config.plugins.filter(plugin => {
        return !plugin.constructor.name.includes('OptimizeCssAssetsWebpackPlugin')
      })
    }
    
    return config
  },
  
  env: {
    // LiveKit Configuration
    NEXT_PUBLIC_LIVEKIT_URL: process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://livekit.dev2.aaroncollins.info',
    LIVEKIT_API_KEY: process.env.LIVEKIT_API_KEY || 'devkey',
    LIVEKIT_API_SECRET: process.env.LIVEKIT_API_SECRET || 'LiveKit2026SecretKeyForMatrix',
    LIVEKIT_JWT_SERVICE_URL: process.env.LIVEKIT_JWT_SERVICE_URL || 'https://dev2.aaroncollins.info/_livekit',
  },
}

module.exports = nextConfig
