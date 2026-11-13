import type { MetadataRoute } from 'next'
import { getContentLocale, stripLocalePrefix, withLocale } from '@/lib/locale-path'
import { getActiveBlogPage, getActiveBlogParams, reference, sdkSources } from '@/lib/source'

interface IListedSource {
  getLanguages(): { language: string; pages: { path: string; url: string }[] }[]
}

const DOCS_ORIGIN = 'https://docs.univer.ai'
const docsSources: readonly IListedSource[] = [
  sdkSources.overview,
  sdkSources.guides,
  sdkSources.server,
  sdkSources.ai,
  reference,
]

export default function sitemap(): MetadataRoute.Sitemap {
  // A page is listed in each locale it is written in. A locale that falls back to English is left out: it would
  // list the same text again under another address.
  const docs = docsSources.flatMap((source) =>
    source
      .getLanguages()
      .flatMap(({ language, pages }) =>
        pages
          .filter((page) => getContentLocale(page.path) === language)
          .map((page) => ({ url: `${DOCS_ORIGIN}${withLocale(language, page.url)}` })),
      ),
  )
  const blog = getActiveBlogParams().flatMap(({ slug, lang }) => {
    const page = getActiveBlogPage(slug, lang)
    return page && getContentLocale(page.path) === lang
      ? [{ url: `${DOCS_ORIGIN}${withLocale(lang, stripLocalePrefix(page.url))}` }]
      : []
  })
  return [{ url: `${DOCS_ORIGIN}/` }, ...docs, ...blog]
}
