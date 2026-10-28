/* eslint-disable no-await-in-loop -- Keep development-server compilation bounded during route checks. */
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import process from 'node:process'
import { test } from 'node:test'

const origin = process.env.DOCS_ORIGIN || 'http://localhost:3030'
const locales = ['', '.zh-CN', '.zh-TW', '.ja-JP', '.ko-KR', '.fr-FR', '.es-ES', '.ru-RU']
const catalogs = [
  ['sheets', 14, 83, 64, 3, 16],
  ['docs', 11, 73, 51, 6, 16],
  ['slides', 14, 66, 34, 8, 24],
  ['canvas', 10, 51, 32, 3, 16],
  ['relational-table', 12, 62, 37, 8, 17],
  ['pdf', 15, 70, 26, 8, 36],
  ['charts', 8, 43, 43, 0, 0],
]

function getCatalogFlags(source) {
  return [...source.matchAll(/data-support="([^"]+)" data-open-source="([^"]+)"/g)].map((match) => [match[1], match[2]])
}

function getSummaryRelations(source) {
  return source
    .split('\n')
    .filter((line) => line.startsWith('| ') && line.includes('data-support='))
    .map((line) => {
      const values = [...line.matchAll(/data-summary="([^"]*)"/g)].map((match) => match[1])
      return [values[0] === values[1], values[0] === values[2], values[1] === values[2]]
    })
}

test('overview and feature overview have source translations in all eight languages', async () => {
  for (const page of ['overview', 'features/index']) {
    const english = await readFile(new URL(`../../../content/docs/${page}.mdx`, import.meta.url), 'utf8')
    for (const suffix of locales.slice(1)) {
      const translated = await readFile(new URL(`../../../content/docs/${page}${suffix}.mdx`, import.meta.url), 'utf8')
      assert.ok(translated.includes('title: '), `${page}${suffix}`)
      assert.notEqual(translated, english, `${page}${suffix}: actual source, not English fallback`)
    }
  }
})

test('localized overview diagrams preserve the SDK dependencies', async () => {
  for (const suffix of locales) {
    const source = await readFile(new URL(`../../../content/docs/overview${suffix}.mdx`, import.meta.url), 'utf8')
    const chart = JSON.parse(source.match(/<Mermaid chart=\{(".*")\} \/>/)[1])
    for (const sdk of ['AI', 'Server'])
      assert.match(
        chart,
        new RegExp(`(?:^|\\n)\\s*${sdk}(?:\\[[^\\n]*?\\])?\\s+-->\\|[^|]+\\|\\s+Headless(?:\\s|$)`),
        `${suffix}: ${sdk} dependency`,
      )
    assert.doesNotMatch(chart, /(?:^|\n)\s*-->/, `${suffix}: every dependency has an explicit source`)
  }
})

test('all eight catalogs preserve every category, feature, support level, and open-source flag', async () => {
  for (const [slug, groups, rows, yes, partial, no] of catalogs) {
    const baseline = await readFile(new URL(`../../../content/docs/features/${slug}.mdx`, import.meta.url), 'utf8')
    for (const suffix of locales) {
      const text = await readFile(
        new URL(`../../../content/docs/features/${slug}${suffix}.mdx`, import.meta.url),
        'utf8',
      )
      const featureRows = text.split('\n').filter((line) => line.startsWith('| ') && line.includes('data-support='))
      const states = featureRows.map((line) =>
        [...line.matchAll(/data-support="(yes|partial|no)"/g)].map((match) => match[1]),
      )
      assert.ok(
        states.every((row) => row.length === 3),
        `${slug}: all three products must be present`,
      )
      assert.equal(text.match(/^## /gm)?.length, groups, slug)
      assert.equal(featureRows.length, rows, slug)
      const headings = [...text.matchAll(/^## (.+)$/gm)].map((match) => match[1].replace(/ \[#[^\]]+\]$/, ''))
      assert.deepEqual(
        JSON.parse(text.match(/groups=\{(\[.*\])\}/)[1]),
        headings,
        `${slug}${suffix}: category selector`,
      )
      assert.deepEqual(
        [...text.matchAll(/\]\(([^)]+)\)/g)].map((match) => match[1]),
        [...baseline.matchAll(/\]\(([^)]+)\)/g)].map((match) => match[1]),
        `${slug}${suffix}: guide links and chart previews stay aligned`,
      )
      for (const [status, count] of [
        ['yes', yes],
        ['partial', partial],
        ['no', no],
      ]) {
        assert.equal(states.filter((row) => row[0] === status).length, count, `${slug}: ${status}`)
      }
      assert.deepEqual(
        getCatalogFlags(text),
        getCatalogFlags(baseline),
        `${slug}${suffix}: support and source availability stay aligned`,
      )
      assert.deepEqual(getSummaryRelations(text), getSummaryRelations(baseline), `${slug}${suffix}: differences filter`)
      if (suffix) {
        assert.notEqual(text.match(/^title: (.+)$/m)?.[1], baseline.match(/^title: (.+)$/m)?.[1])
      }
      assert.doesNotMatch(text, /file:\/\/|\/Users\//)
    }
  }
})

test('Features navigation is localized with stable product routes and no duplicate index', async () => {
  for (const locale of locales) {
    const meta = JSON.parse(
      await readFile(new URL(`../../../content/docs/features/meta${locale}.json`, import.meta.url), 'utf8'),
    )
    assert.equal(meta.pages[0], '!index')
    assert.ok(meta.pages.includes('products'))
    const products = JSON.parse(
      await readFile(new URL(`../../../content/docs/features/products/meta${locale}.json`, import.meta.url), 'utf8'),
    )
    assert.equal(products.pages.length, 6)
    for (const [slug] of catalogs.slice(0, 6))
      assert.ok(
        products.pages.some((entry) => entry.endsWith(`(/docs/features/${slug})`)),
        `${locale}: ${slug}`,
      )
    assert.ok(meta.pages.includes('shared'))
    const shared = JSON.parse(
      await readFile(new URL(`../../../content/docs/features/shared/meta${locale}.json`, import.meta.url), 'utf8'),
    )
    assert.equal(shared.pages.length, 15, `${locale}: every shared capability has an entry`)
    for (const slug of ['history', 'comments', 'worktree', 'compare', 'binding', 'embed'])
      assert.ok(
        shared.pages.some((entry) => entry.endsWith(`(/docs/features/shared/${slug})`)),
        slug,
      )
    assert.equal(meta.pages.filter((entry) => entry.endsWith('(/docs/features)')).length, 1)
  }
})

test('product pages, category anchors, Markdown, and localized navigation are available', async () => {
  for (const path of ['/zh-CN/docs/features', '/docs/features', '/ja-JP/docs/features']) {
    const response = await fetch(`${origin}${path}`)
    assert.equal(response.status, 200, path)
    const html = await response.text()
    assert.ok(html.includes('405'), path)
    const prefix = path.startsWith('/ja-JP') ? '/ja-JP' : path.startsWith('/zh-CN') ? '/zh-CN' : ''
    const sidebar = html.match(/<aside\b[^>]*>([\s\S]*?)<\/aside>/)?.[1]
    assert.ok(sidebar, path)
    assert.ok(
      sidebar.includes(`href="${prefix}/docs/overview"`),
      'Office SDK overview must be a clickable sidebar link',
    )
    assert.equal(sidebar.split(`href="${prefix}/docs/features"`).length - 1, 1, `${path}: single overview entry`)
    for (const [slug] of catalogs)
      assert.ok(html.includes(`href="${prefix}/docs/features/${slug}"`), `${path}: ${slug}`)
  }
  for (const [slug, groups, rows] of catalogs) {
    const response = await fetch(`${origin}/zh-CN/docs/features/${slug}`)
    assert.equal(response.status, 200, slug)
    const html = await response.text()
    assert.equal([...html.matchAll(/<h2\b[^>]*id="[^"]+"/g)].length, groups, `${slug}: rendered categories`)
    assert.equal([...html.matchAll(/<tbody>/g)].length, groups, `${slug}: rendered tables`)
    const markdown = await fetch(`${origin}/zh-CN/docs/features/${slug}.md`)
    assert.equal(markdown.status, 200, `${slug}.md`)
    assert.match(markdown.headers.get('content-type'), /text\/markdown/)
    assert.ok((await markdown.text()).includes(`${rows}`), `${slug}.md feature count`)
  }
})

test('feature categories can be found through Office SDK search', async () => {
  for (const [locale, query] of [
    ['zh-CN', '电子表格'],
    ['en-US', 'PDF'],
  ]) {
    const response = await fetch(`${origin}/api/search?${new URLSearchParams({ scope: 'docs', locale, query })}`)
    assert.equal(response.status, 200)
    const results = await response.json()
    assert.ok(results.some((result) => result.source === 'docs' && result.url.includes('/docs/features/')))
  }
})

test('shared capabilities have standalone pages and an agent-readable version', async () => {
  const meta = JSON.parse(
    await readFile(new URL('../../../content/docs/features/shared/meta.json', import.meta.url), 'utf8'),
  )
  for (const entry of meta.pages.filter((item) => item.includes('/shared/'))) {
    const path = entry.match(/\(([^)]+)\)$/)[1]
    const response = await fetch(`${origin}/zh-CN${path}`)
    assert.equal(response.status, 200, path)
    assert.match(await response.text(), /<h1[^>]*>[^<]+<\/h1>/)
  }
  const preview = await fetch(`${origin}/assets/features/charts/column.png`)
  assert.equal(preview.status, 200, 'Chart previews must bypass locale routing')
  assert.match(preview.headers.get('content-type'), /image\/png/)
  const response = await fetch(`${origin}/zh-CN/docs/features/shared/worktree.md`)
  assert.equal(response.status, 200)
  assert.match(await response.text(), /Worktree/)
})
