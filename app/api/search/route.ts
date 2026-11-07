import type { StructuredData } from 'fumadocs-core/mdx-plugins/remark-structure'
import { structure } from 'fumadocs-core/mdx-plugins/remark-structure'
import { createFromSource } from 'fumadocs-core/search/server'
import type { Locale } from '@/i18n/routing'
import type { SearchResultSource } from '@/lib/guides/search'
import { normalizeLocale } from '@/i18n/locale-config'
import {
  indexReferenceMembers,
  normalizeScopedSearchResults,
  parseSearchScope,
  rankSearchResults,
} from '@/lib/guides/search'
import { ai, blog, guides, overview, reference, server } from '@/lib/source'

const sources = { overview, guides, server, ai, reference, blog }
const handlers = new Map<string, ReturnType<typeof createFromSource>>()
const referenceStructures = new Map<string, Promise<StructuredData>>()

function getSearchHandler(source: SearchResultSource, locale: Locale) {
  const key = `${source}:${locale}`
  const existing = handlers.get(key)
  if (existing) return existing

  const options = {
    async buildIndex(page: typeof guides.$inferPage) {
      let structuredData: StructuredData
      if (source === 'reference') {
        const path = page.data.info.fullPath
        let data = referenceStructures.get(path)
        if (!data) {
          data = page.data
            .getText('raw')
            .then((markdown) => indexReferenceMembers(structure(markdown.replace(/^---\n[\s\S]*?\n---\n/, ''))))
          referenceStructures.set(path, data)
          data.catch(() => referenceStructures.delete(path))
        }
        structuredData = await data
      } else {
        structuredData = await page.data.structuredData()
      }
      return {
        id: `${page.locale}:${page.url}`,
        title: page.data.title,
        description: page.data.description,
        url: page.url,
        structuredData,
      }
    },
  }
  const handler =
    source === 'blog'
      ? createFromSource(
          { ...blog, getPages: () => blog.getPages(locale).filter((page) => !page.data.deprecated) },
          options,
        )
      : createFromSource({ ...sources[source], getPages: () => sources[source].getPages(locale) }, options)
  handlers.set(key, handler)
  return handler
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const query = (url.searchParams.get('query') ?? '').trim()
  if (!query) return Response.json([])
  if (query.length > 200) return Response.json({ error: 'Query is too long' }, { status: 400 })

  const scope = parseSearchScope(url.searchParams.get('scope'))
  const locale = normalizeLocale(url.searchParams.get('locale') ?? undefined)
  const requestedSources: SearchResultSource[] =
    scope === 'all' ? ['overview', 'guides', 'server', 'ai', 'reference', 'blog'] : [scope]
  try {
    const groups = await Promise.all(
      requestedSources.map(async (source) => {
        const term = source === 'reference' ? (query.replace(/\(\)$/, '').split('.').at(-1) ?? query) : query
        const results = await getSearchHandler(source, locale).search(term, { locale, limit: 60 })
        return normalizeScopedSearchResults(results, source, query)
      }),
    )
    return Response.json(rankSearchResults(groups, query))
  } catch (error) {
    console.error('Documentation search failed', error)
    return Response.json({ error: 'Search unavailable' }, { status: 503 })
  }
}
