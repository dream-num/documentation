import type { SortedResult } from 'fumadocs-core/search'

export type SearchScope = 'all' | 'guides' | 'server' | 'ai' | 'reference'
export type SearchResultSource = Exclude<SearchScope, 'all'>

export interface IScopedSearchResult {
  id: string
  title: string
  url: string
  content: string
  breadcrumbs: string[]
  source: SearchResultSource
}

export function parseSearchScope(value: string | null): SearchScope {
  if (value === 'guides' || value === 'server' || value === 'ai' || value === 'reference') return value
  return 'all'
}

export function normalizeScopedSearchResults(
  results: SortedResult[],
  source: SearchResultSource,
): IScopedSearchResult[] {
  const pages = new Map<string, IScopedSearchResult>()
  for (const result of results) {
    if (!result.url.startsWith('/') || result.url.startsWith('//')) continue
    const pageUrl = result.url.split('#')[0]
    const content = result.content.replaceAll(/<[^>]*>/g, '')
    if (result.type === 'page') {
      pages.set(pageUrl, {
        id: `${source}:${pageUrl}`,
        title: content,
        url: result.url,
        content: '',
        breadcrumbs: (result.breadcrumbs ?? []).map((part) => part.replaceAll(/<[^>]*>/g, '')),
        source,
      })
    }
  }
  const snippets = new Set<string>()
  for (const result of results) {
    const page = pages.get(result.url.split('#')[0])
    if (!page || result.type === 'page') continue
    if (!page.content || (result.type === 'text' && !snippets.has(page.id))) {
      page.url = result.url
      page.content = result.content.replaceAll(/<[^>]*>/g, '')
      if (result.type === 'text') snippets.add(page.id)
    }
  }
  return [...pages.values()]
}

export function rankSearchResults(groups: IScopedSearchResult[][], query: string): IScopedSearchResult[] {
  const term = query.toLocaleLowerCase()
  return groups
    .flatMap((results) => results.map((result, index) => ({ result, index })))
    .toSorted((a, b) => {
      const aTitle = a.result.title.toLocaleLowerCase()
      const bTitle = b.result.title.toLocaleLowerCase()
      return (
        Number(bTitle === term) - Number(aTitle === term) ||
        Number(bTitle.includes(term)) - Number(aTitle.includes(term)) ||
        a.index - b.index
      )
    })
    .slice(0, 30)
    .map(({ result }) => result)
}
