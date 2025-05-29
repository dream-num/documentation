'use client'

/* eslint-disable node/prefer-global/process */
import { DocSearch } from '@docsearch/react'
import { usePathname } from 'next/navigation'

import '@docsearch/css'

function DocSearchComponent() {
  const pathname = usePathname()
  const locale = pathname.split('/')[1] ?? 'en-US'

  return (
    <DocSearch
      appId={process.env.NEXT_PUBLIC_ALGOLIA_APP_ID ?? ''}
      apiKey={process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY ?? ''}
      indexName="univer"
      searchParameters={{
        facetFilters: [
          [`lang:en`, `lang:${locale}`],
        ],
      }}
    />
  )
}

export default DocSearchComponent
