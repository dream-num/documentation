import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import process from 'node:process'

import type { NextConfig } from 'next'
import { withAmamoMdx } from '@amamo/mdx/next'
import createNextIntlPlugin from 'next-intl/plugin'

import amamo from './amamo.config.mts'
import packageJson from './package.json' with { type: 'json' }

const withNextIntl = createNextIntlPlugin()
const DEV_API_ORIGIN = 'https://dev.univer.plus'
const showcaseScope = process.env.UNIVER_SHOWCASE_DEMOS?.split(',').filter(Boolean) ?? []
if (showcaseScope.length && process.env.NODE_ENV === 'production') {
  throw new Error('UNIVER_SHOWCASE_DEMOS is development-only. Clear it before a production build.')
}

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
  agentRules: false,
  // MDX modules also need Next's server React and JSX runtime aliases.
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'mdx'],
  turbopack: {
    rules: showcaseScope.length
      ? {
          '*.ts': {
            condition: { path: /^showcase\/data\.ts$/ },
            loaders: [{ loader: './scripts/showcase-scope-loader.cjs', options: { slugs: showcaseScope } }],
          },
        }
      : {},
  },
  reactStrictMode: true,

  env: {
    NEXT_PUBLIC_DOCS_SOURCE_REF: getDocsSourceRef(),
    SHOWCASE_PACKAGE_VERSIONS: JSON.stringify(
      Object.fromEntries(
        Object.keys({ ...packageJson.dependencies, ...packageJson.devDependencies }).map((name) => [
          name,
          JSON.parse(readFileSync(`node_modules/${name}/package.json`, 'utf8')).version,
        ]),
      ),
    ),
  },

  allowedDevOrigins: ['*'],

  output: 'standalone',

  outputFileTracingIncludes: {
    '/*': [
      '.amamo-mdx/index.json',
      '.amamo-mdx/guides-navigation.json',
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
