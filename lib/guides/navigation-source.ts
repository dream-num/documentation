import documents from '@/.amamo-mdx/guides-navigation.json'

import type { IAmamoMetadata } from '../amamo-metadata'
import { createAmamoMetadataSource } from '../amamo-metadata'
import { createGuidesLoader } from './loader'
import { createSdkPageTree } from './navigation'

const sources = await Promise.all(
  ['guides', 'server', 'ai'].map(async (collection) =>
    createGuidesLoader(
      await createAmamoMetadataSource(
        collection,
        `content/${collection}`,
        (
          documents as (IAmamoMetadata<{ title: string; description?: string; icon?: string }> & {
            collection: string
          })[]
        ).filter((document) => document.collection === collection),
      ),
      `/${collection}`,
    ),
  ),
)

export const guideNavigationSource = { pageTree: createSdkPageTree(sources.map((source) => source.pageTree)) }
