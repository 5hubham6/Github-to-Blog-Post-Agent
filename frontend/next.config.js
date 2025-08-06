/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure Next.js - running on port 3003 to avoid Python backend on 3001
  experimental: {
    // removed appDir - it's default now in Next.js 15
  },
  // Docker configuration
  output: 'standalone',
  // Allow images from any domain (for blog generation)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}

module.exports = nextConfig
