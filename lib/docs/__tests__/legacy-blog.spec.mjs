import assert from 'node:assert/strict'
import { test } from 'node:test'

const origin = process.env.DOCS_ORIGIN || 'http://localhost:3030'
const articles = [
  ['univer-vs-handsontable-a-complete-comparison-of-next-generation-online-spreadsheet-engines', '2025-08-20'],
  ['univer-vs-luckysheet-a-comprehensive-comparison-of-open-source-spreadsheet-solutions', '2025-08-19'],
  [
    'univer-vs-spreadjs-comprehensive-analysis-of-the-next-generation-open-source-collaborative-engine-and-traditional-commercial-spreadsheet-controls',
    '2025-08-16',
  ],
  ['10-best-spreadsheet-components-for-developers-in-2025', '2025-08-14'],
]
const locales = ['en-US', 'zh-CN', 'zh-TW', 'ja-JP', 'ko-KR', 'fr-FR', 'ru-RU', 'es-ES']

for (const [slug, published] of articles) {
  for (const locale of locales) {
    test(`migrated article ${slug} preserves content identity in ${locale}`, async () => {
      const prefix = locale === 'en-US' ? '' : `/${locale}`
      const response = await fetch(`${origin}${prefix}/blog/${slug}`, { headers: { 'User-Agent': 'Googlebot' } })
      assert.equal(response.status, 200)
      assert.equal(response.redirected, false)
      assert.doesNotMatch(response.headers.get('link') || '', /hreflang=/)
      const html = await response.text()
      const head = html.split('</head>')[0]
      const contentLocale = locale === 'zh-CN' ? 'zh-CN' : 'en-US'
      const canonical = `https://docs.univer.ai${contentLocale === 'zh-CN' ? '/zh-CN' : ''}/blog/${slug}`
      assert.ok(head.includes(`rel="canonical" href="${canonical}"`))
      const data = JSON.parse(html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)?.[1] || 'null')
      assert.ok(data)
      assert.equal(data.inLanguage, contentLocale)
      assert.equal(data.datePublished, published)
      assert.equal(data.dateModified, '2026-10-31')
      assert.equal(data.url, canonical)
      assert.equal(data.author.name, slug.startsWith('10-best') && locale !== 'zh-CN' ? 'univer' : 'Ggol Afred')
      assert.equal(data.author['@type'], slug.startsWith('10-best') && locale !== 'zh-CN' ? 'Organization' : 'Person')
      for (const language of locales)
        assert.equal(head.includes(`hrefLang="${language}"`), language === 'en-US' || language === 'zh-CN')
      const article = html.match(/<article\b[^>]*data-docs-body[^>]*>([\s\S]*?)<\/article>/)?.[1]
      assert.ok(article)
      assert.match(article, /Apache-2\.0/)
      assert.match(article, /2026-10-31|October 31, 2026/)
    })
  }
}

test('migrated articles appear in native blog indexes, feeds and sitemap', async () => {
  await Promise.all(
    ['', '/zh-CN'].map(async (prefix) => {
      const [index, feed] = await Promise.all([
        fetch(`${origin}${prefix}/blog`).then((response) => response.text()),
        fetch(`${origin}${prefix}/blog/rss.xml`).then((response) => response.text()),
      ])
      const channel = feed.split('<item>')[0]
      assert.ok(channel.includes(`<link>https://docs.univer.ai${prefix}/blog</link>`))
      for (const [slug] of articles) {
        assert.ok(index.includes(`${prefix}/blog/${slug}`))
        assert.ok(feed.includes(`<link>https://docs.univer.ai${prefix}/blog/${slug}</link>`))
      }
    }),
  )
  const xml = await (await fetch(`${origin}/sitemap.xml`)).text()
  const entries = new Map(
    [...xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>\s*<\/url>/g)].map((match) => [
      match[1],
      match[2],
    ]),
  )
  for (const [slug] of articles) {
    for (const locale of locales)
      assert.equal(
        entries.has(`https://docs.univer.ai${locale === 'en-US' ? '' : `/${locale}`}/blog/${slug}`),
        locale === 'en-US' || locale === 'zh-CN',
      )
    for (const prefix of ['', '/zh-CN'])
      assert.equal(entries.get(`https://docs.univer.ai${prefix}/blog/${slug}`), '2026-10-31')
  }
  assert.equal(entries.get('https://docs.univer.ai/blog/formula'), '2025-06-26')
})
