import assert from 'node:assert/strict'
import process from 'node:process'
import { test } from 'node:test'

const origin = process.env.DOCS_ORIGIN || 'http://localhost:3030'
const slug = '/blog/rust-formula-performance'
const locales = ['en-US', 'zh-CN', 'zh-TW', 'ja-JP', 'ko-KR', 'fr-FR', 'ru-RU', 'es-ES']

for (const locale of locales) {
  test(`benchmark tables, downloads and SEO are available in HTML for ${locale}`, async () => {
    const pathname = `${locale === 'en-US' ? '' : `/${locale}`}${slug}`
    const response = await fetch(`${origin}${pathname}`, { headers: { 'User-Agent': 'Googlebot' } })
    assert.equal(response.status, 200)
    const html = await response.text()
    assert.equal((html.match(/<table[\s>]/g) || []).length, 4)
    const article = html.match(/<article\b[^>]*data-docs-body[^>]*>([\s\S]*?)<\/article>/)?.[1]
    assert.ok(article)
    const appendixStart = article.indexOf('<details ')
    assert.ok(appendixStart > 0)
    assert.equal((article.slice(0, appendixStart).match(/<table[\s>]/g) || []).length, 1)
    assert.ok(!/<details[^>]*\sopen(?:[\s=>])/.test(article))
    assert.match(html, /17\.67/)
    assert.match(html, /13\.94/)
    assert.match(html, /320\.01/)
    assert.match(html, /1,992,537/)
    assert.ok(!html.includes('timing-summary.csv'))
    assert.ok(!html.includes('measurement-records.zip'))
    assert.match(html, /<title>[^<]*Univer[^<]*<\/title>/)
    assert.match(html, /<meta name="description" content="[^"]*Univer[^"]*"/)
    assert.match(html, /<meta property="og:type" content="article"/)
    assert.ok(html.includes(`rel="canonical" href="https://docs.univer.ai${pathname}"`))
    const structuredData = JSON.parse(
      html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)?.[1] || 'null',
    )
    assert.ok(structuredData)
    assert.equal(structuredData['@type'], 'BlogPosting')
    assert.equal(structuredData.url, `https://docs.univer.ai${pathname}`)
    assert.equal(structuredData.mainEntityOfPage, structuredData.url)
    assert.equal(structuredData.inLanguage, locale)
    assert.equal(structuredData.datePublished, '2026-10-29')
    assert.deepEqual(structuredData.author, { '@type': 'Organization', name: 'Univer Engineering Team' })
    assert.equal(structuredData.publisher.name, 'Univer')
    assert.match(structuredData.headline, /Univer/)
    assert.match(structuredData.description, /Univer/)
    assert.match(article.slice(0, article.indexOf('</p>')), /Univer Office SDK/)
    assert.match(article, /<img[^>]+alt="[^"]*Univer[^"]*"/)
    for (const language of locales) {
      const target = `${language === 'en-US' ? '' : `/${language}`}${slug}`
      assert.ok(html.includes(`hrefLang="${language}" href="https://docs.univer.ai${target}"`))
    }
    const downloads = [...html.matchAll(/href="([^"]+\.xlsx)"/g)].map((match) => match[1])
    assert.equal(downloads.length, 10)
    assert.ok(downloads.every((url) => url.startsWith('/assets/blog/rust-formula-performance/samples/')))
    assert.ok(downloads.every((url) => !/\/[PF]\d{2}_/.test(url)))
  })
}

test('untranslated blog fallbacks identify their actual source language', async () => {
  const response = await fetch(`${origin}/fr-FR/blog/formula`)
  assert.equal(response.status, 200)
  const html = await response.text()
  const url = 'https://docs.univer.ai/blog/formula'
  assert.ok(html.includes(`rel="canonical" href="${url}"`))
  assert.ok(html.includes(`<meta property="og:url" content="${url}"`))
  const structuredData = JSON.parse(html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)?.[1] || 'null')
  assert.equal(structuredData.inLanguage, 'en-US')
  assert.equal(structuredData.url, url)
  for (const locale of locales) {
    assert.equal(html.includes(`hrefLang="${locale}"`), locale === 'en-US' || locale === 'zh-CN')
  }
})

test('existing blog authors retain their identity in structured data', async () => {
  const response = await fetch(`${origin}/blog/ot`)
  assert.equal(response.status, 200)
  const html = await response.text()
  const structuredData = JSON.parse(html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/)?.[1] || 'null')
  assert.deepEqual(structuredData.author, { '@type': 'Person', name: 'Wenzhao Hu' })
  assert.ok(html.includes(structuredData.headline))
})

test('workbook download links serve real XLSX files without locale prefixes', async () => {
  const response = await fetch(`${origin}${slug}`)
  assert.equal(response.status, 200)
  const html = await response.text()
  const downloads = new Set([...html.matchAll(/href="([^"]+\.xlsx)"/g)].map((match) => match[1]))
  assert.equal(downloads.size, 10)
  await Promise.all(
    [...downloads].map(async (href) => {
      const download = await fetch(`${origin}${href}`, { method: 'HEAD' })
      assert.equal(download.status, 200, href)
      assert.match(download.headers.get('content-type') || '', /application\/vnd\.openxmlformats-officedocument/)
      assert.ok(Number(download.headers.get('content-length')) > 0, href)
    }),
  )
})

test('the benchmark translations are discoverable in the sitemap', async () => {
  const response = await fetch(`${origin}/sitemap.xml`)
  assert.equal(response.status, 200)
  const xml = await response.text()
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])
  assert.equal(urls.length, new Set(urls).size)
  for (const locale of locales) {
    assert.ok(urls.includes(`https://docs.univer.ai${locale === 'en-US' ? '' : `/${locale}`}${slug}`))
    assert.equal(
      urls.includes(`https://docs.univer.ai${locale === 'en-US' ? '' : `/${locale}`}/blog/formula`),
      locale === 'en-US' || locale === 'zh-CN',
    )
  }
  const robots = await fetch(`${origin}/robots.txt`)
  assert.equal(robots.status, 200)
  assert.match(await robots.text(), /Sitemap: https:\/\/docs\.univer\.ai\/sitemap\.xml/)
})
