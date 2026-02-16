/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Required for Docker builds
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
  env: {
    // LiveKit Configuration
    NEXT_PUBLIC_LIVEKIT_URL: process.env.NEXT_PUBLIC_LIVEKIT_URL || 'wss://livekit.dev2.aaroncollins.info',
    LIVEKIT_API_KEY: process.env.LIVEKIT_API_KEY || 'devkey',
    LIVEKIT_API_SECRET: process.env.LIVEKIT_API_SECRET || 'LiveKit2026SecretKeyForMatrix',
    LIVEKIT_JWT_SERVICE_URL: process.env.LIVEKIT_JWT_SERVICE_URL || 'https://dev2.aaroncollins.info/_livekit',
  },
}

module.exports = nextConfig
