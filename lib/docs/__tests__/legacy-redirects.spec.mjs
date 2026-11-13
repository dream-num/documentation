import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { test } from 'node:test'
import { withHttpsAlternateLinks } from '../alternate-links.ts'
import { LEGACY_DOCS_PATHS, resolveLegacyDocsPath } from '../legacy-redirects.ts'

const locales = ['en-US', 'zh-CN', 'zh-TW']
const content = new URL('../../../content/', import.meta.url)
const contentDirs = {
  guides: 'guides',
  server: 'server',
  ai: 'ai',
  overview: 'docs',
  reference: 'reference',
  blog: 'blog',
}

/** Whether a docs path such as /server/license is a page written in content/. */
function isContentPage(path) {
  const [, section, ...rest] = path.split('#')[0].split('/')
  const dir = contentDirs[section]
  if (!dir) return false
  const base = [dir, ...rest].join('/')
  return [`${base}.mdx`, `${base}/index.mdx`, `${base}.md`].some((file) => existsSync(new URL(file, content)))
}

test('an old address keeps its locale and loses a trailing slash', () => {
  assert.deepEqual(resolveLegacyDocsPath('/zh-CN/guides/pro/license/', locales), {
    locale: 'zh-CN',
    target: '/server/license',
  })
  assert.deepEqual(resolveLegacyDocsPath('/guides/recipes/architecture/web-worker', locales), {
    locale: undefined,
    target: '/blog/web-worker',
  })
  assert.deepEqual(resolveLegacyDocsPath('/en-US/introduction', locales), { locale: 'en-US', target: '/overview' })
})

test('current pages and unknown addresses are left alone', () => {
  assert.equal(resolveLegacyDocsPath('/guides/sheets', locales), undefined)
  assert.equal(resolveLegacyDocsPath('/zh-CN/server/license', locales), undefined)
  assert.equal(resolveLegacyDocsPath('/guides/go/getting-started/usage', locales), undefined)
})

test('every old address lands on a page that exists, and none of them is a page today', () => {
  const missing = [...LEGACY_DOCS_PATHS.values()].filter((target) => !isContentPage(target))
  const live = [...LEGACY_DOCS_PATHS.keys()].filter((path) => isContentPage(path))
  assert.deepEqual(missing, [])
  assert.deepEqual(live, [])
})

test('hreflang alternates for the production host use https', () => {
  const header =
    '<http://docs.univer.ai/guides/sheets>; rel="alternate"; hreflang="en-US", <http://docs.univer.ai/zh-CN/guides/sheets>; rel="alternate"; hreflang="zh-CN"'
  assert.equal(
    withHttpsAlternateLinks(header),
    '<https://docs.univer.ai/guides/sheets>; rel="alternate"; hreflang="en-US", <https://docs.univer.ai/zh-CN/guides/sheets>; rel="alternate"; hreflang="zh-CN"',
  )
  const local = '<http://localhost:3030/guides/sheets>; rel="alternate"; hreflang="en-US"'
  assert.equal(withHttpsAlternateLinks(local), local)
})
