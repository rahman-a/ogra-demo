import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tov5hovb66jl78as.public.blob.vercel-storage.com',
      },
    ],
  },
}

export default nextConfig
