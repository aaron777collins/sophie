/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@haos/ui"],
  // Remove turbopack.root to let Next.js auto-detect workspace
};

module.exports = nextConfig;
