import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { test } from 'node:test'
import { runInNewContext } from 'node:vm'

const root = new URL('../../../', import.meta.url)
const locales = ['en-US', 'zh-CN', 'zh-TW', 'ja-JP', 'ko-KR', 'fr-FR', 'ru-RU', 'es-ES']
const readGuide = (path, locale) =>
  readFile(new URL(`content/guides/${path}${locale === 'en-US' ? '' : `.${locale}`}.mdx`, root), 'utf8')
const codeBlocks = (source) => [...source.matchAll(/```typescript\n([\s\S]*?)\n```/g)].map((match) => match[1])

test('document body examples point at paragraph and section delimiters in every language', async () => {
  const sources = await Promise.all(locales.map((locale) => readGuide('docs/model/document-body', locale)))
  for (const [index, source] of sources.entries()) {
    const locale = locales[index]
    const snippet = codeBlocks(source).find((code) => code.startsWith('const body: IDocumentBody'))
    const body = runInNewContext(`${snippet.replace(': IDocumentBody', '')}; body`)
    assert.equal(body.paragraphs.length, 2, locale)
    assert.equal(body.sectionBreaks.length, 1, locale)
    for (const paragraph of body.paragraphs) {
      assert.equal(body.dataStream[paragraph.startIndex], '\r', locale)
      assert.ok(paragraph.paragraphId, locale)
    }
    assert.equal(body.dataStream[body.sectionBreaks[0].startIndex], '\n', locale)
    assert.ok(body.sectionBreaks[0].sectionId, locale)
  }
})

test('localized Docs recipes preserve the same executable examples and stable entry links', async () => {
  const sources = await Promise.all(locales.map((locale) => readGuide('docs/features/core/docs-api', locale)))
  const expected = codeBlocks(sources[0])
  for (const [index, source] of sources.entries()) {
    const locale = locales[index]
    assert.deepEqual(codeBlocks(source), expected, locale)
    assert.doesNotMatch(source, /\.getDocumentDataModel\(|\.executeCommand\(|\.syncExecuteCommand\(/, locale)
    assert.ok(!source.includes('`\n`'), `${locale}: control characters must remain escaped in prose`)
    for (const anchor of [
      'create-document',
      'get-document-data',
      'document-identifiers',
      'text-style',
      'text-selection',
    ]) {
      assert.ok(source.includes(`[#${anchor}]`), `${locale}: ${anchor}`)
    }
  }
})

test('Docs API retains the published page title and all legacy section links in every language', async () => {
  const fixture = JSON.parse(await readFile(new URL('lib/docs/__tests__/fixtures/docs-api-anchors.json', root), 'utf8'))
  const sources = await Promise.all(locales.map((locale) => readGuide('docs/features/core/docs-api', locale)))
  for (const [index, source] of sources.entries()) {
    const locale = locales[index]
    const ids = [
      ...[...source.matchAll(/^#{2,6} .*\[#([^\]]+)\]/gm)].map((match) => match[1]),
      ...[...source.matchAll(/<span id="([^"]+)"/g)].map((match) => match[1]),
    ]
    assert.equal(new Set(ids).size, ids.length, `${locale}: duplicate section ID`)
    for (const anchor of fixture[locale].anchors) {
      assert.ok(ids.includes(anchor), `${locale}: missing legacy section ${anchor}`)
    }
    assert.ok(source.includes(`\ntitle: ${fixture[locale].frontmatter.title}\n`), locale)
  }
})

test('the downloadable Vue menu examples separate application and plugin APIs across all eight guides', async () => {
  const archive = new URL('public/assets/examples/vue3/univer-vue3-menu-starter.zip', root)
  const readEntry = (name) => execFileSync('unzip', ['-p', archive.pathname, name], { encoding: 'utf8' })
  const applicationRecipe = readEntry('review-menu.ts').trim()
  const pluginRecipe = readEntry('review-plugin.ts').trim()
  const manifest = JSON.parse(readEntry('package.json'))
  for (const [name, version] of Object.entries(manifest.dependencies)) {
    if (name.startsWith('@univerjs/')) assert.equal(version, '1.3.0', name)
  }
  assert.match(readEntry('main.ts'), /onBeforeUnmount\(\(\) => univer\?\.dispose\(\)\)/)
  assert.doesNotMatch(
    applicationRecipe,
    /IMenuManagerService|ComponentManager|IconManager|Injector|@univerjs\/design|__getSchema/,
  )
  assert.doesNotMatch(pluginRecipe, /__getSchema|\.__getInjector|sheet\.command\./)
  assert.equal(JSON.parse(readEntry('tsconfig.json')).compilerOptions.experimentalDecorators, true)
  const sources = await Promise.all(locales.map((locale) => readGuide('sheets/ui/components', locale)))
  for (const [index, source] of sources.entries()) {
    const locale = locales[index]
    for (const recipe of [applicationRecipe, pluginRecipe]) {
      assert.ok(
        codeBlocks(source).some((code) => code.trim() === recipe),
        locale,
      )
    }
    for (const anchor of ['menu-extension-paths', 'plugin-menu-example', 'menu-runtime-configuration']) {
      assert.ok(source.includes(`[#${anchor}]`), `${locale}: ${anchor}`)
    }
    assert.ok(source.includes('/assets/examples/vue3/univer-vue3-menu-starter.zip'), locale)
  }
})
