/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  typescript: {
    // Allow builds to proceed even with TypeScript errors during development
    ignoreBuildErrors: true,
  },
  eslint: {
    // Allow builds to proceed even with ESLint errors during development
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig