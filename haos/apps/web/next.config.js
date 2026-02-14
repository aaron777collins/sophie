/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@haos/shared'],
  eslint: {
    ignoreDuringBuilds: true,
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
  },
}

module.exports = nextConfig
