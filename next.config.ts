import type { NextConfig } from 'next'
import process from 'node:process'
import { createMDX } from 'fumadocs-mdx/next'

const withMDX = createMDX({})
const DEV_API_ORIGIN = 'https://dev.univer.plus'

const config: NextConfig = {
  reactStrictMode: true,

  allowedDevOrigins: ['*'],

  output: 'standalone',

  typescript: {
    ignoreBuildErrors: true,
  },

  async rewrites() {
    if (process.env.NODE_ENV !== 'development') {
      return []
    }

    return [
      {
        source: '/universer-api/:path*',
        destination: `${DEV_API_ORIGIN}/universer-api/:path*`,
      },
    ]
  },
}

export default withMDX(config)
