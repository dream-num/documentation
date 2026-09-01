import { execFileSync } from 'node:child_process'
import process from 'node:process'

import type { NextConfig } from 'next'
import { withAmamoMdx } from '@amamo/mdx/next'
import createNextIntlPlugin from 'next-intl/plugin'

import amamo from './amamo.config.mjs'

const withNextIntl = createNextIntlPlugin()
const DEV_API_ORIGIN = 'https://dev.univer.plus'

function getDocsSourceRef() {
  const configuredRef =
    process.env.NEXT_PUBLIC_DOCS_SOURCE_REF || process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME
  if (configuredRef) return configuredRef

  try {
    return execFileSync('git', ['branch', '--show-current'], { encoding: 'utf8' }).trim() || 'dev'
  } catch {
    return 'dev'
  }
}

const config: NextConfig = {
  reactStrictMode: true,

  env: {
    NEXT_PUBLIC_DOCS_SOURCE_REF: getDocsSourceRef(),
  },

  allowedDevOrigins: ['*'],

  output: 'standalone',

  outputFileTracingIncludes: {
    '/*': [
      '.amamo-mdx/index.json',
      'content/**/*.json',
      'content/**/*.mdx',
      'node_modules/.pnpm/@swc+helpers@*/node_modules/@swc/helpers/esm/**/*',
    ],
  },

  experimental: {
    turbopackRemoveUnusedImports: false,
    turbopackRemoveUnusedExports: false,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  async rewrites() {
    if (process.env.NODE_ENV !== 'development') return []

    return [
      {
        source: '/universer-api/:path*',
        destination: `${DEV_API_ORIGIN}/universer-api/:path*`,
      },
    ]
  },
}

export default withAmamoMdx(amamo)(withNextIntl(config))
