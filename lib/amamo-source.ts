import { readFile } from 'node:fs/promises'

import type { IStructuredData, ITocItem } from '@amamo/mdx'
import type { StructuredData } from 'fumadocs-core/mdx-plugins/remark-structure'
import type { PageData, StaticSource } from 'fumadocs-core/source'
import type { MDXContent, MDXModule } from 'mdx/types'

import { renderAgentMarkdown } from './agent-docs/mdx-projection'
import { createAmamoMetadataSource, type IAmamoMetaData, type IFileInfo } from './amamo-metadata'

interface IAmamoModule<TFrontmatter> extends MDXModule {
  default: MDXContent
  frontmatter: TFrontmatter
  structuredData: IStructuredData
  toc: readonly ITocItem[]
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
  const metadata = await createAmamoMetadataSource(collection, directory, documents)
  const files = metadata.files.map((file, index) => {
    if (file.type !== 'page') return file
    // Metadata pages preserve the document order and precede folder metadata.
    const document = documents[index]
    const { fullPath } = file.data.info
    let contentModulePromise: Promise<IAmamoModule<TFrontmatter>> | undefined
    let sourcePromise: Promise<string> | undefined
    let processedPromise: Promise<string> | undefined
    const load = () => (contentModulePromise ??= document.load())
    const readSource = () => (sourcePromise ??= readFile(fullPath, 'utf8'))

    return {
      type: file.type,
      path: file.path,
      absolutePath: file.absolutePath,
      data: {
        ...file.data,
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
  return { files }
}
