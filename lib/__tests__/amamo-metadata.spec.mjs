import assert from 'node:assert/strict'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { createAmamoMetadataSource } from '../amamo-metadata.ts'

const previousDirectory = process.cwd()
const directory = await mkdtemp(path.join(os.tmpdir(), 'docs-metadata-'))
try {
  process.chdir(directory)
  await mkdir('.amamo-mdx')
  await mkdir('content/ai', { recursive: true })
  const first = { key: 'en-US:index', frontmatter: { title: 'AI SDK' } }
  const localized = { key: 'ja-JP:index', frontmatter: { title: 'AI SDK 日本語' } }
  const index = {
    version: 2,
    config: { collections: { ai: { directory: path.join(directory, 'content/ai') } } },
    documents: { [path.join(directory, 'content/ai/index.mdx')]: { collection: 'ai', key: first.key } },
  }
  await writeFile('.amamo-mdx/index.json', JSON.stringify(index))
  await createAmamoMetadataSource('ai', 'content/ai', [first])
  index.documents[path.join(directory, 'content/ai/index.ja-JP.mdx')] = { collection: 'ai', key: localized.key }
  await writeFile('.amamo-mdx/index.json', JSON.stringify(index))
  const source = await createAmamoMetadataSource('ai', 'content/ai', [first, localized])
  assert.ok(
    source.files.some((file) => file.path === 'index.ja-JP.mdx' && file.data.title === localized.frontmatter.title),
  )
  console.log('Newly generated locale pages are discovered without restarting the process.')
} finally {
  process.chdir(previousDirectory)
  await rm(directory, { recursive: true, force: true })
}
