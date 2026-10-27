import documents from '@/.amamo-mdx/guides-navigation.json'
import type { IAmamoMetadata } from '../amamo-metadata'
import { createAmamoMetadataSource } from '../amamo-metadata'
import { createGuidesLoader } from './loader'
import { createSdkPageTree } from './navigation'

const [overview, ...sources] = await Promise.all(
  ['docs', 'guides', 'server', 'ai'].map(async (collection) =>
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

const sdkPageTree = createSdkPageTree(sources.map((source) => source.pageTree))
export const guideNavigationSource = {
  pageTree: Object.fromEntries(
    Object.entries(sdkPageTree).map(([locale, tree]) => [
      locale,
      { children: [...overview.pageTree[locale].children, ...tree.children] },
    ]),
  ),
}
