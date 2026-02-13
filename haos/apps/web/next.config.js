/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@haos/shared'],
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['matrix.dev2.aaroncollins.info'],
  },
}

module.exports = nextConfig