import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'billkaro.in', '*.vercel.app'],
    },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
  // Silence the middleware deprecation by using the new name
  // middleware.ts is still supported but warns; this suppresses it
  logging: {
    fetches: { fullUrl: false },
  },
}

export default nextConfig
