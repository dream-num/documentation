import type { StructuredData } from 'fumadocs-core/mdx-plugins/remark-structure'
import type { SortedResult } from 'fumadocs-core/search'

export type SearchScope = 'all' | 'guides' | 'server' | 'ai' | 'reference' | 'blog'
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
  if (value === 'guides' || value === 'server' || value === 'ai' || value === 'reference' || value === 'blog')
    return value
  return 'all'
}

export function indexReferenceMembers(data: StructuredData): StructuredData {
  return {
    contents: data.contents,
    headings: data.headings.map((heading) => {
      const title = heading.content.replaceAll('`', '')
      const member = /^(?:F\w+|Event|Enum)\.(.+)$/.exec(title)?.[1]
      return { id: heading.id, content: member ? `${title}\n${member}` : title }
    }),
  }
}

export function normalizeScopedSearchResults(
  results: SortedResult[],
  source: SearchResultSource,
  query: string,
): IScopedSearchResult[] {
  const pages = new Map<string, IScopedSearchResult>()
  for (const result of results) {
    if (!result.url.startsWith('/') || result.url.startsWith('//')) continue
    const pageUrl = result.url.split('#')[0]
    const content = result.content.replaceAll(/<[^>]*>/g, '').replaceAll('`', '')
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
  if (source === 'reference') {
    const term = query.toLocaleLowerCase().replace(/\(\)$/, '').split('.').at(-1) ?? ''
    return [...pages.entries()].flatMap(([url, page]) => {
      if (page.title.toLocaleLowerCase() === query.toLocaleLowerCase()) return [page]
      const sections = results.filter((result) => result.url.split('#')[0] === url && result.type !== 'page')
      const headings = sections.filter(
        (result) =>
          result.type === 'heading' &&
          result.content
            .replaceAll(/<[^>]*>|`/g, '')
            .toLocaleLowerCase()
            .includes(term),
      )
      if (headings.length) {
        return headings.map((heading) => {
          const name = heading.content.replaceAll(/<[^>]*>|`/g, '').split('\n')[0]
          const snippet = sections.find((result) => result.type === 'text' && result.url === heading.url)
          return Object.assign({}, page, {
            id: `${source}:${heading.url}`,
            title: /^(?:F\w+|Event|Enum)\./.test(name) ? name : `${page.title}.${name}`,
            url: heading.url,
            content: snippet?.content.replaceAll(/<[^>]*>|`/g, '') ?? '',
          })
        })
      }
      const snippet = sections.find((result) => result.type === 'text')
      return [{ ...page, content: snippet?.content.replaceAll(/<[^>]*>|`/g, '') ?? '' }]
    })
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
  const term = query.toLocaleLowerCase().replace(/\(\)$/, '')
  return groups
    .flatMap((results) => results.map((result, index) => ({ result, index })))
    .toSorted((a, b) => {
      const aTitle = a.result.title.toLocaleLowerCase()
      const bTitle = b.result.title.toLocaleLowerCase()
      return (
        Number(bTitle === term) - Number(aTitle === term) ||
        Number(bTitle.endsWith(`.${term}`)) - Number(aTitle.endsWith(`.${term}`)) ||
        Number(bTitle.includes(term)) - Number(aTitle.includes(term)) ||
        a.index - b.index
      )
    })
    .slice(0, 30)
    .map(({ result }) => result)
}
