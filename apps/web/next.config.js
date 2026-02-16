/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@haos/ui"],
  turbopack: {
    root: '/home/ubuntu/clawd/apps/web'
  }
};

module.exports = nextConfig;
