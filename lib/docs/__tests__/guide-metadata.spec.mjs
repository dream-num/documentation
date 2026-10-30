import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { test } from 'node:test'

const root = new URL('../../../', import.meta.url)
const locales = ['en-US', 'zh-CN', 'zh-TW', 'ja-JP', 'ko-KR', 'fr-FR', 'ru-RU', 'es-ES']
const origin = 'https://docs.univer.ai'

function loadMetadata(source) {
  const strip = (code) => stripTypeScriptTypes(code, { mode: 'transform' }).replace(/^export /gm, '')
  const localeCode = strip(readFileSync(new URL('lib/locale-path.ts', root), 'utf8').replace(/^import .*\n/gm, ''))
  const helpers = Function(
    'routing',
    `${localeCode}; return { getContentLocale, stripLocalePrefix, withLocale }`,
  )({
    locales,
    defaultLocale: 'en-US',
  })
  const placementCode = strip(readFileSync(new URL('lib/guides/content-placements.ts', root), 'utf8'))
  const resolveSlug = Function(`${placementCode}; return resolveGuideContentSlug`)()
  const route = readFileSync(new URL('app/[lang]/[sdk]/[[...slug]]/page.tsx', root), 'utf8')
  const metadataCode = strip(
    route.slice(route.indexOf('const DOCS_ORIGIN'), route.indexOf('export default async function Page')),
  )
  return Function(
    'sdkSources',
    'notFound',
    'getContentLocale',
    'stripLocalePrefix',
    'withLocale',
    'resolveGuideContentSlug',
    `${metadataCode}; return generateMetadata`,
  )(
    { guides: source, overview: source, server: source, ai: source },
    () => {
      throw new Error('NOT_FOUND')
    },
    helpers.getContentLocale,
    helpers.stripLocalePrefix,
    helpers.withLocale,
    resolveSlug,
  )
}

function page(lang = 'en-US', url = '/guides/example') {
  return {
    path: `example${lang === 'en-US' ? '' : `.${lang}`}.mdx`,
    url,
    data: { title: 'Example', description: 'Example guide' },
  }
}

test('guide metadata excludes missing translations and canonicalizes fallback content to its actual language', async () => {
  const source = {
    getLanguages: () => locales.map((language) => ({ language })),
    getPage: (_slug, lang) => page(lang === 'zh-CN' ? lang : 'en-US'),
  }
  const metadata = await loadMetadata(source)({
    params: Promise.resolve({ sdk: 'guides', slug: ['example'], lang: 'fr-FR' }),
  })
  assert.equal(metadata.title, 'Example')
  assert.equal(metadata.description, 'Example guide')
  assert.deepEqual(metadata.alternates, {
    canonical: `${origin}/guides/example`,
    languages: { 'en-US': `${origin}/guides/example`, 'zh-CN': `${origin}/zh-CN/guides/example` },
  })
})

test('guide metadata resolves content placements before generating canonical and language URLs', async () => {
  const source = {
    getLanguages: () => [{ language: 'en-US' }, { language: 'zh-CN' }],
    getPage: (slug, lang) => {
      assert.deepEqual(slug, ['fundamentals', 'features', 'embed'])
      return page(lang, '/guides/fundamentals/features/embed')
    },
  }
  const metadata = await loadMetadata(source)({
    params: Promise.resolve({ sdk: 'guides', slug: ['sheets', 'features', 'embed'], lang: 'zh-CN' }),
  })
  assert.deepEqual(metadata.alternates, {
    canonical: `${origin}/zh-CN/guides/fundamentals/features/embed`,
    languages: {
      'en-US': `${origin}/guides/fundamentals/features/embed`,
      'zh-CN': `${origin}/zh-CN/guides/fundamentals/features/embed`,
    },
  })
})

test('guide metadata omits locales with no page', async () => {
  const source = {
    getLanguages: () => [{ language: 'en-US' }, { language: 'fr-FR' }],
    getPage: (_slug, lang) => (lang === 'fr-FR' ? undefined : page()),
  }
  const metadata = await loadMetadata(source)({
    params: Promise.resolve({ sdk: 'guides', slug: ['example'], lang: 'en-US' }),
  })
  assert.deepEqual(metadata.alternates, {
    canonical: `${origin}/guides/example`,
    languages: { 'en-US': `${origin}/guides/example` },
  })
})

test('metadata avoids duplicate locale prefixes and uses the same logic for every SDK section', async () => {
  await Promise.all(
    ['overview', 'guides', 'server', 'ai'].map(async (sdk) => {
      const source = {
        getLanguages: () => [{ language: 'zh-CN' }],
        getPage: () => page('zh-CN', `/zh-CN/${sdk}/example`),
      }
      const metadata = await loadMetadata(source)({
        params: Promise.resolve({ sdk, slug: ['example'], lang: 'zh-CN' }),
      })
      assert.deepEqual(metadata.alternates, {
        canonical: `${origin}/zh-CN/${sdk}/example`,
        languages: { 'zh-CN': `${origin}/zh-CN/${sdk}/example` },
      })
    }),
  )
})

test('missing guide pages still return notFound before metadata is generated', async () => {
  const source = { getPage: () => undefined }
  await assert.rejects(
    loadMetadata(source)({ params: Promise.resolve({ sdk: 'guides', slug: ['missing'], lang: 'en-US' }) }),
    /NOT_FOUND/,
  )
})
