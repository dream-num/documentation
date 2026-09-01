import { globSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

import type { IStructuredData, ITocItem } from '@amamo/mdx'
import type { StructuredData } from 'fumadocs-core/mdx-plugins/remark-structure'
import type { MetaData, PageData, StaticSource } from 'fumadocs-core/source'
import type { MDXContent, MDXModule } from 'mdx/types'

import { renderAgentMarkdown } from './agent-docs/mdx-projection'

interface IFileInfo {
  fullPath: string
  path: string
}

interface IGeneratedDocumentIndex {
  collection: string
  key: string
}

interface IGeneratedIndex {
  config: {
    collections: Record<string, { directory: string }>
  }
  documents: Record<string, IGeneratedDocumentIndex>
  version: number
}

interface IAmamoModule<TFrontmatter> extends MDXModule {
  default: MDXContent
  frontmatter: TFrontmatter
  structuredData: IStructuredData
  toc: readonly ITocItem[]
}

interface IAmamoMetaData extends MetaData {
  info: IFileInfo
}

type AmamoPageData<TFrontmatter extends PageData> = TFrontmatter & {
  getText: (type: 'processed' | 'raw') => Promise<string>
  info: IFileInfo
  load: () => Promise<IAmamoModule<TFrontmatter>>
  structuredData: () => Promise<StructuredData>
}

export interface IAmamoDocument<TFrontmatter extends PageData> {
  readonly frontmatter: Readonly<TFrontmatter>
  readonly key: string
  readonly load: () => Promise<IAmamoModule<TFrontmatter>>
}

let generatedIndexPromise: Promise<IGeneratedIndex> | undefined

function getGeneratedIndex() {
  generatedIndexPromise ??= readFile(path.join(process.cwd(), '.amamo-mdx/index.json'), 'utf8').then(
    (value) => JSON.parse(value) as IGeneratedIndex,
  )
  return generatedIndexPromise
}

function toFumadocsStructuredData(data: IStructuredData): StructuredData {
  return {
    contents: data.contents.map((item) => ({ content: item.content, heading: item.heading })),
    headings: data.headings,
  }
}

export async function createAmamoSource<TFrontmatter extends PageData>(
  collection: string,
  directory: string,
  documents: readonly IAmamoDocument<TFrontmatter>[],
): Promise<StaticSource<{ metaData: IAmamoMetaData; pageData: AmamoPageData<TFrontmatter> }>> {
  const collectionDirectory = path.resolve(directory)
  const index = await getGeneratedIndex()
  if (index.version !== 2) throw new Error(`Unsupported generated index version: ${index.version}`)

  const indexedCollectionDirectory = index.config.collections[collection]?.directory
  if (!indexedCollectionDirectory) throw new Error(`Missing generated collection: ${collection}`)

  const documentPaths = new Map(
    Object.entries(index.documents)
      .filter(([, document]) => document.collection === collection)
      .map(([file, document]) => {
        const relativePath = path.relative(indexedCollectionDirectory, file).replaceAll(path.sep, '/')
        if (relativePath === '..' || relativePath.startsWith('../') || path.isAbsolute(relativePath)) {
          throw new Error(`Generated source path is outside ${directory}: ${file}`)
        }
        return [`${document.collection}\0${document.key}`, relativePath]
      }),
  )
  const pages = documents.map((document) => {
    const relativePath = documentPaths.get(`${collection}\0${document.key}`)
    if (!relativePath) throw new Error(`Missing generated source path for ${collection}/${document.key}`)

    const fullPath = path.join(collectionDirectory, relativePath)
    const info = { fullPath, path: relativePath }
    let contentModulePromise: Promise<IAmamoModule<TFrontmatter>> | undefined
    let sourcePromise: Promise<string> | undefined
    let processedPromise: Promise<string> | undefined
    const load = () => (contentModulePromise ??= document.load())
    const readSource = () => (sourcePromise ??= readFile(fullPath, 'utf8'))

    return {
      type: 'page' as const,
      path: relativePath,
      absolutePath: fullPath,
      data: {
        ...document.frontmatter,
        info,
        load,
        async structuredData() {
          return toFumadocsStructuredData((await load()).structuredData)
        },
        async getText(type: 'processed' | 'raw') {
          const source = await readSource()
          if (type === 'raw') return source

          processedPromise ??= renderAgentMarkdown(source, fullPath)
          return processedPromise
        },
      },
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
