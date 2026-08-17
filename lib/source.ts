// See https://fumadocs.vercel.app/docs/headless/source-api for more info
import { loader } from 'fumadocs-core/source'
import { blog as blogPosts, guides as guidesPosts, icons as iconsPosts, reference as referencePosts } from 'fumadocs-mdx:collections/server'
import { icons as lucideIcons } from 'lucide-react'
import { createElement } from 'react'

import { IconWrapper } from '@/components/icon-wrapper'
import { i18n, localizePath } from './i18n'

function localizePageTreeNode<T extends { url: string }>(this: { locale?: string }, node: T): T {
  return {
    ...node,
    url: localizePath(node.url, this.locale ?? i18n.defaultLanguage),
  }
}

const localizePageTreeLinks = {
  file: localizePageTreeNode,
}

export const guides = loader({
  baseUrl: '/guides',
  source: guidesPosts.toFumadocsSource(),
  i18n,
  pageTree: {
    transformers: [localizePageTreeLinks],
  },
  icon(icon) {
    if (!icon) return

    if (icon in lucideIcons) {
      return createElement(IconWrapper, {
        type: 'icon',
        icon: lucideIcons[icon as keyof typeof lucideIcons],
      })
    }

    if (icon.startsWith('#pro')) {
      const [,iconName] = icon.split('/')
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
  source: referencePosts.toFumadocsSource(),
  i18n,
  pageTree: {
    transformers: [localizePageTreeLinks],
  },
  icon(icon) {
    if (!icon) return

    if (icon.startsWith('#ref')) {
      const [,iconName] = icon.split('/')
      return createElement(IconWrapper, {
        type: 'ref',
        text: iconName,
      })
    }
  },
})

export const icons = loader({
  baseUrl: '/icons',
  source: iconsPosts.toFumadocsSource(),
  i18n,
  pageTree: {
    transformers: [localizePageTreeLinks],
  },
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
  source: blogPosts.toFumadocsSource(),
  i18n,
  pageTree: {
    transformers: [localizePageTreeLinks],
  },
})

export function getActiveBlogPages(lang: string) {
  return blog.getPages(lang).filter(page => !page.data.deprecated)
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
