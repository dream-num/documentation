import { execFileSync } from 'node:child_process'
import path from 'node:path'
import process from 'node:process'

import type { NextConfig } from 'next'
import { withAmamoMdx } from '@amamo/mdx/next'
import createNextIntlPlugin from 'next-intl/plugin'

import amamo from './amamo.config.mts'
import scopeLoader from './scripts/showcase-scope-loader.cjs'

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
  webpack(webpackConfig, { dev, isServer }) {
    if (dev && !isServer) {
      const cssPlugin = webpackConfig.plugins.find(
        (plugin: { constructor?: { name?: string } }) => plugin?.constructor?.name === 'NextMiniCssExtractPlugin',
      )
      if (!cssPlugin?.runtimeOptions) throw new Error('Next CSS runtime changed: reverify development stylesheet HMR.')
      // Next 16.3.4 deduplicates the replacement href, then HMR removes its only live link.
      // Restore mini-css-extract-plugin's DOM insertion/onload handling in development only.
      cssPlugin.options.insert = undefined
      cssPlugin.runtimeOptions.insert = undefined
    }
    if (webpackConfig.cache && typeof webpackConfig.cache === 'object') {
      // A pnpm patch changes package bytes without changing its version.
      webpackConfig.cache.buildDependencies ??= {}
      webpackConfig.cache.buildDependencies.lockfile = [path.resolve('pnpm-lock.yaml')]
    }
    // URL dependencies need original CSS bytes, not next-flight-css-loader's JS proxy.
    // Ordinary SDK CSS imports retain Next's pipeline.
    const rules = webpackConfig.module.rules.find((rule: { oneOf?: unknown[] }) => rule?.oneOf)?.oneOf
    if (!rules) throw new Error('Next CSS rules changed: verify Lit shadow stylesheet asset handling.')
    rules.unshift({
      test: /[\\/]@univerjs[\\/]preset-(docs|sheets)-core[\\/]lib[\\/]index\.css$/,
      issuer: /[\\/]showcase[\\/](docs|sheets)[\\/]lit[\\/]code[\\/]create-demo\.ts$/,
      dependency: 'url',
      type: 'asset/resource',
      generator: { filename: 'static/media/[name].[contenthash][ext]' },
    })
    if (showcaseScope.length) {
      if (webpackConfig.cache && typeof webpackConfig.cache === 'object') {
        webpackConfig.cache.version = `${webpackConfig.cache.version ?? ''}|showcase:${showcaseScope.join(',')}`
      }
      webpackConfig.module.rules.push({
        test: /[\\/]showcase[\\/]data\.ts$/,
        enforce: 'pre',
        use: [{ loader: path.resolve('scripts/showcase-scope-loader.cjs'), options: { slugs: showcaseScope } }],
      })
      webpackConfig.plugins.push(scopeLoader.createScopeAudit(showcaseScope))
    }
    return webpackConfig
  },
  reactStrictMode: true,

  env: {
    NEXT_PUBLIC_DOCS_SOURCE_REF: getDocsSourceRef(),
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
