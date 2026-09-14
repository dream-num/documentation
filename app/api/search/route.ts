import type { StructuredData } from 'fumadocs-core/mdx-plugins/remark-structure'
import { structure } from 'fumadocs-core/mdx-plugins/remark-structure'
import { createFromSource } from 'fumadocs-core/search/server'

import type { SearchResultSource } from '@/lib/guides/search'
import { normalizeLocale } from '@/i18n/locale-config'
import {
  indexReferenceMembers,
  normalizeScopedSearchResults,
  parseSearchScope,
  rankSearchResults,
} from '@/lib/guides/search'
import { ai, blog, guides, reference, server } from '@/lib/source'

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

const referenceStructures = new Map<string, Promise<StructuredData>>()

const handlers = {
  guides: createFromSource(guides, searchOptions),
  server: createFromSource(server, searchOptions),
  ai: createFromSource(ai, searchOptions),
  reference: createFromSource(reference, {
    async buildIndex(page) {
      const path = page.data.info.fullPath
      let data = referenceStructures.get(path)
      if (!data) {
        data = page.data
          .getText('raw')
          .then((markdown) => indexReferenceMembers(structure(markdown.replace(/^---\n[\s\S]*?\n---\n/, ''))))
        referenceStructures.set(path, data)
      }
      return {
        id: `${page.locale}:${page.url}`,
        title: page.data.title,
        description: page.data.description,
        url: page.url,
        structuredData: await data,
      }
    },
  }),
  blog: createFromSource(
    {
      ...blog,
      getPages: (...args: Parameters<typeof blog.getPages>) =>
        blog.getPages(...args).filter((page) => !page.data.deprecated),
    },
    searchOptions,
  ),
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const query = (url.searchParams.get('query') ?? '').trim()
  if (!query) return Response.json([])
  if (query.length > 200) return Response.json({ error: 'Query is too long' }, { status: 400 })

  const scope = parseSearchScope(url.searchParams.get('scope'))
  const locale = normalizeLocale(url.searchParams.get('locale') ?? undefined)
  const sources: SearchResultSource[] = scope === 'all' ? ['guides', 'server', 'ai', 'reference', 'blog'] : [scope]
  try {
    const groups = await Promise.all(
      sources.map(async (source) => {
        const term = source === 'reference' ? (query.replace(/\(\)$/, '').split('.').at(-1) ?? query) : query
        const results = await handlers[source].search(term, { locale, limit: 60 })
        return normalizeScopedSearchResults(results, source, query)
      }),
    )
    return Response.json(rankSearchResults(groups, query))
  } catch (error) {
    console.error('Documentation search failed', error)
    return Response.json({ error: 'Search unavailable' }, { status: 503 })
  }
}
