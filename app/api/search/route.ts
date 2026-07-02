import type { SearchResultSource } from '@/lib/guides/search'
import { createTokenizer } from '@orama/tokenizers/mandarin'
import { createFromSource } from 'fumadocs-core/search/server'
import { searchLocaleProfiles } from '@/i18n/locale-config'
import { routing } from '@/i18n/routing'
import {
  normalizeScopedSearchResults,
  parseSearchScope,

} from '@/lib/guides/search'
import { guides, icons, reference } from '@/lib/source'

const searchOptions = {
  localeMap: Object.fromEntries(routing.locales.map(locale => [
    locale,
    searchLocaleProfiles[locale] === 'english'
      ? { language: 'english' }
      : {
          components: {
            tokenizer: createTokenizer(),
          },
          search: {
            threshold: 0,
            tolerance: 0,
          },
        },
  ])),
}

const sourceHandlers = {
  guides: createFromSource(guides, searchOptions),
  reference: createFromSource(reference, searchOptions),
  icons: createFromSource(icons, searchOptions),
} satisfies Record<SearchResultSource, ReturnType<typeof createFromSource>>

async function searchSource(request: Request, source: SearchResultSource) {
  const response = await sourceHandlers[source].GET(request)
  const payload: unknown = await response.json()
  return normalizeScopedSearchResults(payload, source)
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const hasScope = url.searchParams.has('scope')
  const scope = parseSearchScope(url.searchParams.get('scope'))

  if (!hasScope) {
    return sourceHandlers.guides.GET(request)
  }

  if (scope === 'all') {
    const results = await Promise.all([
      searchSource(request, 'guides'),
      searchSource(request, 'reference'),
      searchSource(request, 'icons'),
    ])

    return Response.json(results.flat())
  }

  return Response.json(await searchSource(request, scope))
}
