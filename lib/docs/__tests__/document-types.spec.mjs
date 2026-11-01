import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { runInNewContext } from 'node:vm'

const root = new URL('../../../content/guides/docs/', import.meta.url)
const locales = ['en-US', 'zh-CN', 'zh-TW', 'ja-JP', 'ko-KR', 'fr-FR', 'ru-RU', 'es-ES']
const suffix = (locale) => (locale === 'en-US' ? '' : `.${locale}`)
const guide = (path, locale) => readFile(new URL(`${path}${suffix(locale)}.mdx`, root), 'utf8')
const blocks = (source) => [...source.matchAll(/```(?:typescript|ts)\n([\s\S]*?)\n```/g)].map((match) => match[1])

test('all languages place specialized Docs features in the matching layout group', async () => {
  for (const locale of locales) {
    const { pages } = JSON.parse(await readFile(new URL(`meta${suffix(locale)}.json`, root), 'utf8'))
    assert.equal(pages.filter((page) => page === 'getting-started/document-types').length, 1, locale)
    assert.equal(new Set(pages).size, pages.length, `${locale}: duplicate navigation entry`)
    const groupFor = (path) => {
      const index = pages.indexOf(path)
      assert.ok(index > 0, `${locale}: missing ${path}`)
      return pages.slice(0, index).findLast((page) => page.startsWith('---'))
    }
    assert.equal(groupFor('features/traditional'), groupFor('features/footnotes'), locale)
    assert.equal(groupFor('features/modern'), groupFor('features/columns'), locale)
    assert.notEqual(groupFor('features/modern'), groupFor('features/traditional'), locale)
    assert.notEqual(groupFor('features/table'), groupFor('features/modern'), locale)
    assert.notEqual(groupFor('features/print'), groupFor('features/traditional'), locale)
    assert.equal(groupFor('features/print'), groupFor('features/import-export'), locale)
  }
})

test('localized type and layout guides keep the same executable examples', async () => {
  for (const path of ['getting-started/document-types', 'features/traditional', 'features/modern']) {
    const expected = blocks(await guide(path, 'en-US'))
    assert.ok(expected.length > 1)
    for (const locale of locales) assert.deepEqual(blocks(await guide(path, locale)), expected, `${locale}: ${path}`)
  }
})

test('shared Docs API examples separate creation choices from layout-specific recipes', async () => {
  for (const locale of locales) {
    const source = await guide('features/core/docs-api', locale)
    const code = blocks(source).join('\n')
    assert.match(code, /DocumentFlavor\.TRADITIONAL/)
    assert.match(code, /DocumentFlavor\.MODERN/)
    assert.doesNotMatch(code, /\.getSections?\(|\.insertSectionBreak\(|\.insertColumnGroup\(/)
    assert.ok(source.includes('/guides/docs/features/traditional#sections'))
    assert.ok(source.includes('/guides/docs/features/traditional#pagination'))
    const core = await guide('features/core/index', locale)
    assert.ok(core.includes('[#heading-collapse]'))
    assert.ok(core.includes('/guides/docs/features/modern#heading-collapse'))
    assert.ok(core.includes('[#header-footer-fields]'))
    assert.ok(core.includes('/guides/docs/features/traditional#header-footer-fields'))
  }
})

test('section snapshot examples align persisted paragraph and section IDs with their delimiters', async () => {
  for (const locale of locales) {
    const code = blocks(await guide('model/text-runs-and-paragraphs', locale)).at(-1)
    const body = runInNewContext(`${code.replace(': IDocumentBody', '')}; body`)
    for (const paragraph of body.paragraphs) {
      assert.ok(paragraph.paragraphId, locale)
      assert.equal(body.dataStream[paragraph.startIndex], '\r', locale)
    }
    for (const section of body.sectionBreaks) {
      assert.ok(section.sectionId, locale)
      assert.equal(body.dataStream[section.startIndex], '\n', locale)
      assert.equal(body.dataStream[section.startIndex - 1], '\r', locale)
    }
  }
})

test('column examples use offset-first text insertion and declare their table dependency', async () => {
  for (const locale of locales) {
    const source = await guide('features/columns', locale)
    const code = blocks(source).join('\n')
    assert.match(code, /insertText\(leftOffset,/)
    assert.doesNotMatch(code, /insertText\(['"`]/)
    assert.doesNotMatch(code, /deleteColumnGroup\(/)
    assert.match(code, /group\?\.remove\(\)/)
    assert.ok(source.includes('@univerjs-pro/docs-table/facade'), locale)
    const nodeGuide = await guide('getting-started/node', locale)
    const headerHelper = nodeGuide.slice(nodeGuide.indexOf('function testDocsHeaderFooterFacadeAPI('))
    assert.match(headerHelper, /if \(!fDocument\.isTraditional\(\)\)/, locale)
  }
})
