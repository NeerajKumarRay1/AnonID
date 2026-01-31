import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.fallback = { fs: false, path: false, crypto: false };
    return config;
  },
  // Serve large static files
  async headers() {
    return [
      {
        source: '/:path*.(wasm|zkey|json)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }
        ]
      }
    ];
  }
};

export default nextConfig;
