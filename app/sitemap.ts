import type { MetadataRoute } from 'next'
import { getContentLocale, stripLocalePrefix, withLocale } from '@/lib/locale-path'
import { getActiveBlogPage, getActiveBlogParams } from '@/lib/source'

export default function sitemap(): MetadataRoute.Sitemap {
  return getActiveBlogParams().flatMap(({ slug, lang }) => {
    const page = getActiveBlogPage(slug, lang)
    return page && getContentLocale(page.path) === lang
      ? [
          {
            url: `https://docs.univer.ai${withLocale(lang, stripLocalePrefix(page.url))}`,
            lastModified: page.data.updated ?? page.data.date,
          },
        ]
      : []
  })
}
