import type { SearchResultSource } from '@/lib/guides/search'
import { normalizeLocale } from '@/i18n/locale-config'
import { parseSearchScope } from '@/lib/guides/search'
import { searchDocumentation } from '@/lib/guides/search-server'

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
    return Response.json(await searchDocumentation(query, locale, requestedSources))
  } catch (error) {
    console.error('Documentation search failed', error)
    return Response.json({ error: 'Search unavailable' }, { status: 503 })
  }
}
