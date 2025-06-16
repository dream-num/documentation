// See https://fumadocs.vercel.app/docs/headless/source-api for more info
import { loader } from 'fumadocs-core/source'
import { icons } from 'lucide-react'
import { createElement } from 'react'
import { blog as blogPosts, guides as guidesPosts } from '@/.source'
import { IconWrapper } from '@/components/icon-wrapper'
import { i18n } from './i18n'

export const guides = loader({
  baseUrl: '/guides',
  source: guidesPosts.toFumadocsSource(),
  i18n,
  icon(icon) {
    if (!icon) return

    if (icon in icons) {
      return createElement(icons[icon as keyof typeof icons])
    }

    return createElement(IconWrapper, { children: icon })
  },
})

export const blog = loader({
  baseUrl: '/blog',
  source: blogPosts.toFumadocsSource(),
  i18n,
})
