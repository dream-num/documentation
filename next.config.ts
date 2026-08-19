import process from 'node:process'

import type { NextConfig } from 'next'
import { createMDX } from 'fumadocs-mdx/next'
import createNextIntlPlugin from 'next-intl/plugin'

const withMDX = createMDX({})
const withNextIntl = createNextIntlPlugin()
const DEV_API_ORIGIN = 'https://dev.univer.plus'

const config: NextConfig = {
  reactStrictMode: true,

  allowedDevOrigins: ['*'],

  output: 'standalone',

  experimental: {
    turbopackRemoveUnusedImports: false,
    turbopackRemoveUnusedExports: false,
  },

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

export default withNextIntl(withMDX(config))
