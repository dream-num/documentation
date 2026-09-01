// See https://fumadocs.vercel.app/docs/headless/source-api for more info
import { loader } from 'fumadocs-core/source'
import { icons as lucideIcons } from 'lucide-react'
import { createElement } from 'react'

import type { IAmamoDocument } from '@/lib/amamo-source'
import { collections } from '@/.amamo-mdx/collections.mjs'
import { IconWrapper } from '@/components/icon-wrapper'
import { UniverIcon } from '@/components/univer-icon'
import { fumadocsI18n } from '@/i18n/fumadocs'
import { createAmamoSource } from '@/lib/amamo-source'
import { getGuideContentPlacementTargetFromUrl } from '@/lib/guides/content-placements'

import { isUniverIconName } from './univer-icons'

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
const iconsPosts = collections.icons as readonly IAmamoDocument<IDocumentFrontmatter>[]
const blogPosts = collections.blog as readonly IAmamoDocument<IBlogFrontmatter>[]
const [guidesSource, referenceSource, iconsSource, blogSource] = await Promise.all([
  createAmamoSource('guides', 'content/guides', guidesPosts),
  createAmamoSource('reference', 'content/reference', referencePosts),
  createAmamoSource('icons', 'content/icons', iconsPosts),
  createAmamoSource(
    'blog',
    'content/blog',
    blogPosts.filter((document) => !document.key.split(':').at(-1)?.startsWith('weekly-')),
  ),
])

export const guides = loader({
  baseUrl: '/guides',
  source: guidesSource,
  i18n: fumadocsI18n,
  pageTree: {
    transformers: [
      {
        file(node, filePath) {
          if (filePath) return node

          const target = getGuideContentPlacementTargetFromUrl(node.url)
          if (!target) return node

          const targetPage = this.storage.read(`${target}.mdx`)
          if (targetPage?.format !== 'page') {
            throw new Error(`Guide content placement target not found: ${target}.mdx`)
          }

          return { ...node, name: targetPage.data.title ?? node.name }
        },
      },
    ],
  },
  icon(icon) {
    if (!icon) return

    if (icon in lucideIcons) {
      return createElement(IconWrapper, {
        type: 'icon',
        icon: lucideIcons[icon as keyof typeof lucideIcons],
      })
    }

    if (isUniverIconName(icon)) {
      return createElement(UniverIcon, {
        name: icon,
      })
    }

    if (icon.startsWith('#pro')) {
      const [, iconName] = icon.split('/')
      return createElement(IconWrapper, {
        type: 'pro',
        icon: lucideIcons[iconName as keyof typeof lucideIcons],
      })
    }

    return createElement(IconWrapper, {
      type: 'text',
      text: icon,
    })
  },
})

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

export const icons = loader({
  baseUrl: '/icons',
  source: iconsSource,
  i18n: fumadocsI18n,
  icon(icon) {
    if (!icon) return

    if (icon in lucideIcons) {
      return createElement(IconWrapper, {
        type: 'icon',
        icon: lucideIcons[icon as keyof typeof lucideIcons],
      })
    }

    return createElement(IconWrapper, {
      type: 'text',
      text: icon,
    })
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
