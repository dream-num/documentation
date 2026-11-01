import assert from 'node:assert/strict'
import process from 'node:process'
import { test } from 'node:test'

const origin = process.env.DOCS_ORIGIN || 'http://localhost:3030'
const publicOrigin = 'https://docs.univer.ai'
const locales = ['en-US', 'zh-CN', 'zh-TW', 'ja-JP', 'ko-KR', 'fr-FR', 'ru-RU', 'es-ES']
const slug = '/guides/docs/features/core/docs-api'

function alternates(html) {
  const head = html.match(/<head>([\s\S]*?)<\/head>/)?.[1]
  assert.ok(head, 'SEO links must be rendered in the HTML head for crawlers')
  const links = [...head.matchAll(/<link\b[^>]*>/g)].map((match) => match[0])
  const canonical = links.filter((link) => /rel="canonical"/.test(link))
  assert.equal(canonical.length, 1, 'exactly one canonical URL')
  return {
    canonical: canonical[0].match(/href="([^"]+)"/)[1],
    languages: Object.fromEntries(
      links
        .filter((link) => /rel="alternate"/.test(link) && /hrefLang="/.test(link))
        .map((link) => [link.match(/hrefLang="([^"]+)"/)[1], link.match(/href="([^"]+)"/)[1]]),
    ),
  }
}

for (const locale of locales) {
  test(`guide canonical and reciprocal language URLs are available in HTML for ${locale}`, async () => {
    const path = `${locale === 'en-US' ? '' : `/${locale}`}${slug}`
    const response = await fetch(`${origin}${path}?from=seo-test`, { headers: { 'User-Agent': 'Googlebot' } })
    assert.equal(response.status, 200)
    const metadata = alternates(await response.text())
    assert.equal(metadata.canonical, `${publicOrigin}${path}`)
    assert.deepEqual(
      metadata.languages,
      Object.fromEntries(
        locales.map((language) => [language, `${publicOrigin}${language === 'en-US' ? '' : `/${language}`}${slug}`]),
      ),
    )
  })
}

for (const path of ['/zh-CN/overview', '/zh-CN/server', '/zh-CN/ai']) {
  test(`SDK section metadata uses localized canonical URLs for ${path}`, async () => {
    const response = await fetch(`${origin}${path}`, { headers: { 'User-Agent': 'Googlebot' } })
    assert.equal(response.status, 200)
    const metadata = alternates(await response.text())
    assert.equal(metadata.canonical, `${publicOrigin}${path}`)
    assert.equal(metadata.languages['zh-CN'], `${publicOrigin}${path}`)
    assert.equal(Object.keys(metadata.languages).length, locales.length)
  })
}

test('guide content placements retain their existing canonical destination', async () => {
  const response = await fetch(`${origin}/zh-CN/guides/sheets/features/embed`, {
    headers: { 'User-Agent': 'Googlebot' },
  })
  assert.equal(response.status, 200)
  const metadata = alternates(await response.text())
  assert.equal(metadata.canonical, `${publicOrigin}/zh-CN/guides/fundamentals/features/embed`)
  assert.equal(metadata.languages['en-US'], `${publicOrigin}/guides/fundamentals/features/embed`)
  assert.equal(metadata.languages['zh-CN'], metadata.canonical)
})
