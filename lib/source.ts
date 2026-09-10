// See https://fumadocs.vercel.app/docs/headless/source-api for more info
import { loader } from 'fumadocs-core/source'
import { createElement } from 'react'

import type { IAmamoDocument } from '@/lib/amamo-source'
import { collections } from '@/.amamo-mdx/collections.mjs'
import { IconWrapper } from '@/components/icon-wrapper'
import { fumadocsI18n } from '@/i18n/fumadocs'
import { createAmamoSource } from '@/lib/amamo-source'
import { createGuidesLoader } from '@/lib/guides/loader'

interface IDocumentFrontmatter {
  description?: string
  icon?: string
  title: string
}

interface IBlogFrontmatter extends IDocumentFrontmatter {
  author: string
  date: string
  deprecated?: boolean
}

const guidesPosts = collections.guides as readonly IAmamoDocument<IDocumentFrontmatter>[]
const referencePosts = collections.reference as readonly IAmamoDocument<IDocumentFrontmatter>[]
const blogPosts = collections.blog as readonly IAmamoDocument<IBlogFrontmatter>[]
const [guidesSource, serverSource, aiSource, referenceSource, blogSource] = await Promise.all([
  createAmamoSource('guides', 'content/guides', guidesPosts),
  createAmamoSource('server', 'content/server', collections.server as readonly IAmamoDocument<IDocumentFrontmatter>[]),
  createAmamoSource('ai', 'content/ai', collections.ai as readonly IAmamoDocument<IDocumentFrontmatter>[]),
  createAmamoSource('reference', 'content/reference', referencePosts),
  createAmamoSource('blog', 'content/blog', blogPosts),
])

export const guides = createGuidesLoader(guidesSource)
export const server = createGuidesLoader(serverSource, '/server')
export const ai = createGuidesLoader(aiSource, '/ai')
export const sdkSources = { guides, server, ai }

export const reference = loader({
  baseUrl: '/reference',
  source: referenceSource,
  i18n: fumadocsI18n,
  icon(icon) {
    if (!icon) return

    if (icon.startsWith('#ref')) {
      const [, iconName] = icon.split('/')
      return createElement(IconWrapper, {
        type: 'ref',
        text: iconName,
      })
    }
  },
})

export const blog = loader({
  baseUrl: '/blog',
  source: blogSource,
  i18n: fumadocsI18n,
})

export function getActiveBlogPages(lang: string) {
  return blog.getPages(lang).filter((page) => !page.data.deprecated)
}

export function getActiveBlogPage(slug: string[], lang: string) {
  const page = blog.getPage(slug, lang)
  if (!page || page.data.deprecated) {
    return undefined
  }

  return page
}

export function getActiveBlogParams() {
  return blog.generateParams().filter((page) => {
    const matchedPage = blog.getPage(page.slug, page.lang)
    return Boolean(matchedPage && !matchedPage.data.deprecated)
  })
}
