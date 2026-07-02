export type SearchScope = 'all' | 'guides' | 'reference' | 'icons'
export type SearchResultSource = Exclude<SearchScope, 'all'>

export interface ScopedSearchResult {
  id: string
  title: string
  url: string
  content?: string
  source: SearchResultSource
  score?: number
}

function stripHtml(value: string) {
  return value.replaceAll(/<[^>]*>/g, '')
}

export function parseSearchScope(value: string | null): SearchScope {
  if (value === 'all' || value === 'reference' || value === 'icons') return value
  return 'guides'
}

export function normalizeScopedSearchResults(
  payload: unknown,
  source: SearchResultSource,
): ScopedSearchResult[] {
  const results = Array.isArray(payload)
    ? payload
    : typeof payload === 'object' && payload !== null && 'results' in payload
      ? (payload as { results?: unknown }).results
      : []

  if (!Array.isArray(results)) return []

  return results.flatMap((item, index) => {
    if (typeof item !== 'object' || item === null) return []

    const value = item as Record<string, unknown>
    const url = value.url
    const rawTitle = value.title ?? value.content ?? value.id

    if (typeof url !== 'string' || typeof rawTitle !== 'string') return []

    const breadcrumbs = Array.isArray(value.breadcrumbs)
      ? value.breadcrumbs.filter((part): part is string => typeof part === 'string')
      : []

    return {
      id: typeof value.id === 'string' ? value.id : `${source}-${url}-${index}`,
      title: stripHtml(rawTitle),
      url,
      content: breadcrumbs.length > 0 ? breadcrumbs.join(' / ') : undefined,
      source,
      score: typeof value.score === 'number' ? value.score : undefined,
    }
  })
}
