import type { NextConfig } from 'next'
import { createMDX } from 'fumadocs-mdx/next'

const withMDX = createMDX({})

const config: NextConfig = {
  reactStrictMode: true,

  allowedDevOrigins: ['*'],

  output: 'standalone',

  typescript: {
    ignoreBuildErrors: true,
  },
}

export default withMDX(config)
