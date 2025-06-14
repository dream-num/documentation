import { loader } from 'fumadocs-core/source'
import { blog as blogPosts, guides as guidesPosts } from '@/.source'
import { i18n } from './i18n'

// See https://fumadocs.vercel.app/docs/headless/source-api for more info
export const guides = loader({
  // it assigns a URL to your pages
  baseUrl: '/guides',
  source: guidesPosts.toFumadocsSource(),
  i18n,
})

export const blog = loader({
  baseUrl: '/blog',
  source: blogPosts.toFumadocsSource(),
  i18n,
})
