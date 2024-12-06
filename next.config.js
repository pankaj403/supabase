/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove output: 'export' to enable dynamic routing
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: { unoptimized: true },
};

module.exports = nextConfig;