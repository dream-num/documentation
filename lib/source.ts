// See https://fumadocs.vercel.app/docs/headless/source-api for more info
import { loader } from 'fumadocs-core/source'
import { icons } from 'lucide-react'
import { createElement } from 'react'
import { blog as blogPosts, guides as guidesPosts, reference as referencePosts } from '@/.source'
import { IconWrapper } from '@/components/icon-wrapper'
import { i18n } from './i18n'

export const guides = loader({
  baseUrl: '/guides',
  source: guidesPosts.toFumadocsSource(),
  i18n,
  icon(icon) {
    if (!icon) return

    if (icon in icons) {
      return createElement(IconWrapper, {
        type: 'icon',
        icon: icons[icon as keyof typeof icons],
      })
    }

    if (icon.startsWith('#pro')) {
      const [,iconName] = icon.split('/')
      return createElement(IconWrapper, {
        type: 'pro',
        icon: icons[iconName as keyof typeof icons],
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
  // icon(icon) {
  //   if (!icon) return

  //   if (icon in icons) {
  //     return createElement(IconWrapper, {
  //       type: 'icon',
  //       icon: icons[icon as keyof typeof icons],
  //     })
  //   }

  //   return createElement(IconWrapper, {
  //     type: 'text',
  //     text: icon,
  //   })
  // },
})

export const blog = loader({
  baseUrl: '/blog',
  source: blogPosts.toFumadocsSource(),
  i18n,
})
