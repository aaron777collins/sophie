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
}

module.exports = nextConfig
