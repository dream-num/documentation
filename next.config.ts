import type { NextConfig } from 'next'
import nextra from 'nextra'

const withNextra = nextra({
  defaultShowCopyCode: true,
  mdxOptions: {
    rehypePrettyCodeOptions: {
      theme: {
        dark: 'catppuccin-macchiato',
        light: 'catppuccin-latte',
      },
    },
  },
})

const nextConfig: NextConfig = {
  reactStrictMode: false,

  output: 'standalone',

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  i18n: {
    locales: ['en-US', 'zh-CN'],
    defaultLocale: 'en-US',
  },

  webpack(config) {
    config.module.rules.push({
      test: /\.excalidraw$/,
      use: {
        loader: 'file-loader',
        options: {
          emitFile: false,
        },
      },
    })

    return config
  },
}

export default withNextra(nextConfig)
