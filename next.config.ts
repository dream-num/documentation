import type { NextConfig } from 'next'
import process from 'node:process'
import { createMDX } from 'fumadocs-mdx/next'

const withMDX = createMDX({})
const DEV_API_ORIGIN = 'https://dev.univer.plus'
const isGitHubPages = process.env.GITHUB_PAGES === 'true'
const githubPagesBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/documentation/v0.25'

const config: NextConfig = {
  reactStrictMode: true,

  allowedDevOrigins: ['*'],

  output: isGitHubPages ? 'export' : 'standalone',
  basePath: isGitHubPages ? githubPagesBasePath : undefined,
  assetPrefix: isGitHubPages ? githubPagesBasePath : undefined,
  trailingSlash: isGitHubPages ? true : undefined,
  images: isGitHubPages
    ? {
        unoptimized: true,
      }
    : undefined,

  typescript: {
    ignoreBuildErrors: true,
  },

  ...(isGitHubPages
    ? {}
    : {
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
      }),
}

export default withMDX(config)
