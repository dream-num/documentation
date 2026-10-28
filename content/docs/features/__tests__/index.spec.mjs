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

for (const suffix of locales) {
  test(`${suffix || 'English'} overview diagram preserves the SDK dependencies`, async () => {
    const source = await readFile(new URL(`../../index${suffix}.mdx`, import.meta.url), 'utf8')
    const chart = JSON.parse(source.match(/<Mermaid chart=\{(".*")\} \/>/)[1])
    for (const sdk of ['AI', 'Server']) {
      assert.match(chart, new RegExp(`(?:^|\\n)\\s*${sdk}(?:\\[[^\\n]*?\\])?\\s+-->\\|[^|]+\\|\\s+Headless(?:\\s|$)`))
    }
    assert.doesNotMatch(chart, /(?:^|\n)\s*-->/)
  })
}

for (const [slug, groups, rows, yes, partial, no] of catalogs) {
  test(`${slug} translations preserve categories, support, source availability and guide links`, async () => {
    const baseline = await readFile(new URL(`../${slug}.mdx`, import.meta.url), 'utf8')
    await Promise.all(
      locales.map(async (suffix) => {
        const text = await readFile(new URL(`../${slug}${suffix}.mdx`, import.meta.url), 'utf8')
        const featureRows = text.split('\n').filter((line) => line.startsWith('| ') && line.includes('data-support='))
        const states = featureRows.map((line) =>
          [...line.matchAll(/data-support="(yes|partial|no)"/g)].map((match) => match[1]),
        )
        assert.ok(
          states.every((row) => row.length === 3),
          `${suffix}: all three products must be present`,
        )
        assert.equal(text.match(/^## /gm)?.length, groups, suffix)
        assert.equal(featureRows.length, rows, suffix)
        const headings = [...text.matchAll(/^## (.+)$/gm)].map((match) => match[1].replace(/ \[#[^\]]+\]$/, ''))
        assert.deepEqual(JSON.parse(text.match(/groups=\{(\[.*\])\}/)[1]), headings, `${suffix}: category selector`)
        assert.deepEqual(
          [...text.matchAll(/\]\(([^)]+)\)/g)].map((match) => match[1]),
          [...baseline.matchAll(/\]\(([^)]+)\)/g)].map((match) => match[1]),
          `${suffix}: guide links and chart previews`,
        )
        for (const [status, count] of [
          ['yes', yes],
          ['partial', partial],
          ['no', no],
        ]) {
          assert.equal(states.filter((row) => row[0] === status).length, count, `${suffix}: ${status}`)
        }
        assert.deepEqual(getCatalogFlags(text), getCatalogFlags(baseline), `${suffix}: support and source availability`)
        assert.deepEqual(getSummaryRelations(text), getSummaryRelations(baseline), `${suffix}: differences filter`)
        if (suffix) assert.notEqual(text.match(/^title: (.+)$/m)?.[1], baseline.match(/^title: (.+)$/m)?.[1])
      }),
    )
  })

  test(`${slug} server rendering and Markdown preserve every feature and category`, async () => {
    const source = await readFile(new URL(`../${slug}.zh-CN.mdx`, import.meta.url), 'utf8')
    const response = await fetch(`${origin}/zh-CN/overview/features/${slug}`)
    assert.equal(response.status, 200)
    const html = await response.text()
    assert.equal([...html.matchAll(/<h2\b[^>]*id="[^"]+"/g)].length, groups)
    assert.equal([...html.matchAll(/<tbody>/g)].length, groups)
    const markdown = await fetch(`${origin}/zh-CN/overview/features/${slug}.md`)
    assert.equal(markdown.status, 200)
    assert.match(markdown.headers.get('content-type'), /text\/markdown/)
    const text = await markdown.text()
    assert.doesNotMatch(text, /<FeatureComparison|<span|<small|<Callout/)
    const features = source.split('\n').filter((line) => line.startsWith('| ') && line.includes('data-support='))
    for (const feature of features) {
      const name = feature.split(' | ')[0].slice(2).split(' ![')[0]
      assert.ok(text.includes(name), `Missing feature: ${name}`)
    }
    assert.equal(text.split('\n').filter((line) => line.startsWith('| ') && /✓|◐|—/.test(line)).length, rows)
    assert.match(text, /> \[!NOTE/)
  })
}

for (const prefix of ['', '/zh-CN', '/ja-JP']) {
  test(`${prefix || 'English'} feature navigation exposes the product catalog`, async () => {
    const response = await fetch(`${origin}${prefix}/overview/features`)
    assert.equal(response.status, 200)
    const html = await response.text()
    const sidebar = html.match(/<aside\b[^>]*>([\s\S]*?)<\/aside>/)?.[1]
    assert.ok(sidebar)
    assert.ok(sidebar.includes(`href="${prefix}/overview"`))
    assert.equal(sidebar.split(`href="${prefix}/overview/features"`).length - 1, 1)
    for (const [slug] of catalogs) assert.ok(html.includes(`href="${prefix}/overview/features/${slug}"`), slug)
  })
}

for (const [locale, query] of [
  ['zh-CN', '电子表格'],
  ['en-US', 'PDF'],
]) {
  test(`${locale} feature categories appear in Office SDK search`, async () => {
    const response = await fetch(`${origin}/api/search?${new URLSearchParams({ scope: 'overview', locale, query })}`)
    assert.equal(response.status, 200)
    const results = await response.json()
    assert.ok(results.some((result) => result.source === 'overview' && result.url.includes('/overview/features/')))
  })
}

const shared = JSON.parse(await readFile(new URL('../shared/meta.json', import.meta.url), 'utf8'))
for (const entry of shared.pages.filter((item) => item.includes('/shared/'))) {
  const path = entry.match(/\(([^)]+)\)$/)[1]
  test(`${path} has a standalone page`, async () => {
    const response = await fetch(`${origin}/zh-CN${path}`)
    assert.equal(response.status, 200)
    assert.match(await response.text(), /<h1[^>]*>[^<]+<\/h1>/)
  })
}

test('shared capabilities and chart previews remain available to agents', async () => {
  const preview = await fetch(`${origin}/assets/features/charts/column.png`)
  assert.equal(preview.status, 200)
  assert.match(preview.headers.get('content-type'), /image\/png/)
  const response = await fetch(`${origin}/zh-CN/overview/features/shared/worktree.md`)
  assert.equal(response.status, 200)
  assert.match(await response.text(), /Worktree/)
})
