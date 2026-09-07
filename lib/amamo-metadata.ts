import { globSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

import type { MetaData, PageData, StaticSource } from 'fumadocs-core/source'

export interface IFileInfo {
  fullPath: string
  path: string
}
export interface IAmamoMetaData extends MetaData {
  info: IFileInfo
}
export interface IAmamoMetadata<TFrontmatter extends PageData> {
  readonly frontmatter: Readonly<TFrontmatter>
  readonly key: string
}
interface IGeneratedIndex {
  config: { collections: Record<string, { directory: string }> }
  documents: Record<string, { collection: string; key: string }>
  version: number
}
let generatedIndexPromise: Promise<IGeneratedIndex> | undefined

// Shared by navigation and full article sources: identical paths, metadata and ordering,
// with no MDX body imports in the navigation dependency graph.
export async function createAmamoMetadataSource<TFrontmatter extends PageData>(
  collection: string,
  directory: string,
  documents: readonly IAmamoMetadata<TFrontmatter>[],
): Promise<StaticSource<{ metaData: IAmamoMetaData; pageData: TFrontmatter & { info: IFileInfo } }>> {
  const collectionDirectory = path.resolve(directory)
  generatedIndexPromise ??= readFile(path.join(process.cwd(), '.amamo-mdx/index.json'), 'utf8').then(
    (value) => JSON.parse(value) as IGeneratedIndex,
  )
  const index = await generatedIndexPromise
  if (index.version !== 2) throw new Error(`Unsupported generated index version: ${index.version}`)
  const indexedCollectionDirectory = index.config.collections[collection]?.directory
  if (!indexedCollectionDirectory) throw new Error(`Missing generated collection: ${collection}`)
  const documentPaths = new Map(
    Object.entries(index.documents)
      .filter(([, document]) => document.collection === collection)
      .map(([file, document]) => {
        const relativePath = path.relative(indexedCollectionDirectory, file).replaceAll(path.sep, '/')
        if (relativePath === '..' || relativePath.startsWith('../') || path.isAbsolute(relativePath))
          throw new Error(`Generated source path is outside ${directory}: ${file}`)
        return [document.key, relativePath]
      }),
  )
  const pages = documents.map((document) => {
    const relativePath = documentPaths.get(document.key)
    if (!relativePath) throw new Error(`Missing generated source path for ${collection}/${document.key}`)
    const fullPath = path.join(collectionDirectory, relativePath)
    return {
      type: 'page' as const,
      path: relativePath,
      absolutePath: fullPath,
      data: { ...document.frontmatter, info: { fullPath, path: relativePath } },
    }
  })
  const metas = await Promise.all(
    globSync('**/meta*.json', { cwd: collectionDirectory }).map(async (file) => {
      const fullPath = path.join(collectionDirectory, file)
      const relativePath = file.replaceAll(path.sep, '/')
      return {
        type: 'meta' as const,
        path: relativePath,
        absolutePath: fullPath,
        data: {
          info: { fullPath, path: relativePath },
          ...(JSON.parse(await readFile(fullPath, 'utf8')) as MetaData),
        },
      }
    }),
  )
  return { files: [...pages, ...metas] }
}
