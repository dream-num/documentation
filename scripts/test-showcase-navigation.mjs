import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

import { collections } from '../.amamo-mdx/collections.mjs'
import { createAmamoMetadataSource } from '../lib/amamo-metadata.ts'

const documents = JSON.parse(fs.readFileSync('.amamo-mdx/guides-navigation.json', 'utf8'))
const expected = collections.guides.map(({ key, frontmatter }) => ({ key, frontmatter }))
assert.deepEqual(documents, expected, 'Navigation must preserve every validated guide and locale in registry order')
assert.ok(documents.length > 0)
assert.ok(documents.every((document) => !('load' in document)))
const source = await createAmamoMetadataSource('guides', 'content/guides', documents)
const pages = source.files.filter((file) => file.type === 'page')
const metas = source.files.filter((file) => file.type === 'meta')
assert.equal(pages.length, documents.length)
const index = JSON.parse(fs.readFileSync('.amamo-mdx/index.json', 'utf8'))
const indexedPaths = new Map(
  Object.entries(index.documents)
    .filter(([, value]) => value.collection === 'guides')
    .map(([file, value]) => [value.key, file]),
)
for (const [i, page] of pages.entries()) {
  assert.equal(page.absolutePath, indexedPaths.get(documents[i].key))
  assert.equal(page.path, path.relative(path.resolve('content/guides'), page.absolutePath).replaceAll(path.sep, '/'))
  assert.deepEqual(page.data, { ...documents[i].frontmatter, info: { fullPath: page.absolutePath, path: page.path } })
  assert.ok(!('load' in page.data), 'Menu source must not pretend to provide an article loader')
}
assert.equal(metas.length, fs.globSync('**/meta*.json', { cwd: 'content/guides' }).length)
for (const meta of metas)
  assert.deepEqual(meta.data, {
    info: { fullPath: meta.absolutePath, path: meta.path },
    ...JSON.parse(fs.readFileSync(meta.absolutePath, 'utf8')),
  })
await assert.rejects(() => createAmamoMetadataSource('missing', 'content/guides', []), /Missing generated collection/)
await assert.rejects(
  () => createAmamoMetadataSource('guides', 'content/guides', [{ key: 'missing', frontmatter: { title: 'Missing' } }]),
  /Missing generated source path/,
)
console.log(
  `PASS navigation metadata parity: ${pages.length} guides, ${metas.length} folder files, all locales and paths`,
)
