import { createFromSource } from 'fumadocs-core/search/server'

import type { SearchResultSource } from '@/lib/guides/search'
import { normalizeLocale } from '@/i18n/locale-config'
import { normalizeScopedSearchResults, parseSearchScope, rankSearchResults } from '@/lib/guides/search'
import { ai, guides, reference, server } from '@/lib/source'

const searchOptions = {
  async buildIndex(page: ReturnType<typeof guides.getPages>[number]) {
    return {
      id: `${page.locale}:${page.url}`,
      title: page.data.title,
      description: page.data.description,
      url: page.url,
      structuredData: await page.data.structuredData(),
    }
  },
}

const handlers = {
  guides: createFromSource(guides, searchOptions),
  server: createFromSource(server, searchOptions),
  ai: createFromSource(ai, searchOptions),
  reference: createFromSource(reference, searchOptions),
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const query = (url.searchParams.get('query') ?? '').trim()
  if (!query) return Response.json([])
  if (query.length > 200) return Response.json({ error: 'Query is too long' }, { status: 400 })

  const scope = parseSearchScope(url.searchParams.get('scope'))
  const locale = normalizeLocale(url.searchParams.get('locale') ?? undefined)
  const sources: SearchResultSource[] = scope === 'all' ? ['guides', 'server', 'ai', 'reference'] : [scope]
  try {
    const groups = await Promise.all(
      sources.map(async (source) => {
        const results = await handlers[source].search(query, { locale, limit: 30 })
        return normalizeScopedSearchResults(results, source)
      }),
    )
    return Response.json(rankSearchResults(groups, query))
  } catch (error) {
    console.error('Documentation search failed', error)
    return Response.json({ error: 'Search unavailable' }, { status: 503 })
  }
}
