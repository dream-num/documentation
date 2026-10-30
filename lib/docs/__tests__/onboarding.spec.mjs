import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import process from 'node:process'
import { test } from 'node:test'
import { chromium } from 'playwright'

const origin = process.env.DOCS_ORIGIN || 'http://localhost:3030'
const root = new URL('../../../', import.meta.url)
const locales = ['en-US', 'zh-CN', 'zh-TW', 'ja-JP', 'ko-KR', 'fr-FR', 'ru-RU', 'es-ES']

for (const locale of locales) {
  test(`CDN copy and downloadable example agree in ${locale}`, async () => {
    const suffix = locale === 'en-US' ? '' : `.${locale}`
    const source = await readFile(
      new URL(`content/guides/sheets/getting-started/installation/cdn${suffix}.mdx`, root),
      'utf8',
    )
    const example = await readFile(new URL('public/assets/examples/cdn/sheets.html', root), 'utf8')
    assert.equal(source.match(/```html\n([\s\S]*?)\n```/)[1].trim(), example.trim())
  })
}

test('the Vue 2 download contains the documented component and runnable project files', async () => {
  const archive = new URL('public/assets/examples/vue2/univer-vue2-starter.zip', root)
  const readEntry = (entry) => execFileSync('unzip', ['-p', archive.pathname, entry], { encoding: 'utf8' })
  const source = await readFile(new URL('content/guides/sheets/getting-started/integrations/vue.mdx', root), 'utf8')
  const component = source.split('## Vue 2.x')[1].match(/```vue\n([\s\S]*?)\n```/)[1]
  assert.equal(readEntry('App.vue').trim(), component.trim())
  const manifest = JSON.parse(readEntry('package.json'))
  assert.equal(manifest.dependencies.vue, '2.7.16')
  assert.equal(manifest.dependencies['@univerjs/presets'], manifest.dependencies['@univerjs/preset-sheets-core'])
  assert.equal(manifest.scripts.dev, 'vite')
  assert.match(readEntry('main.js'), /import App from '\.\/App.vue'/)
  assert.match(readEntry('vite.config.js'), /@vitejs\/plugin-vue2/)
  assert.match(readEntry('index.html'), /src="\/main.js"/)
})

const redirects = [
  ['/guides/pro', '/server/license'],
  ['/guides/sheets/getting-started/pro', '/server/license'],
  ['/guides/pro/server', '/server/deployment'],
  ['/guides/skills', '/overview/get-started#agent-skills'],
  ['/guides/skills/installation', '/overview/get-started#agent-skills'],
  ['/guides/recipes/tutorials/custom-plugin', '/blog/custom-plugin'],
]
for (const locale of locales) {
  test(`legacy links preserve ${locale} and the query string`, async () => {
    const prefix = locale === 'en-US' ? '' : `/${locale}`
    await Promise.all(
      redirects.map(async ([from, to]) => {
        const response = await fetch(`${origin}${prefix}${from}?from=feedback`, { redirect: 'manual' })
        assert.equal(response.status, 308, from)
        const destination = new URL(response.headers.get('location'), origin)
        const expected = new URL(`${prefix}${to}`, origin)
        assert.equal(destination.pathname, expected.pathname)
        assert.equal(destination.hash, expected.hash)
        assert.equal(destination.search, '?from=feedback')
      }),
    )
  })
}

test('explicit English and trailing-slash legacy links redirect to the canonical page', async () => {
  // Next.js removes the trailing slash before running the locale-aware proxy.
  const canonicalResponse = await fetch(`${origin}/en-US/guides/pro/?from=feedback`, { redirect: 'manual' })
  assert.equal(canonicalResponse.status, 308)
  const response = await fetch(new URL(canonicalResponse.headers.get('location'), origin), { redirect: 'manual' })
  assert.equal(response.status, 308)
  const destination = new URL(response.headers.get('location'), origin)
  assert.equal(destination.pathname, '/server/license')
  assert.equal(destination.search, '?from=feedback')
})

test('legacy redirects do not swallow unknown subpages', async () => {
  const response = await fetch(`${origin}/zh-CN/guides/pro/not-a-page`, { redirect: 'manual' })
  assert.equal(response.status, 404)
})

test('the old Skills page opens the optional setup section within Get started', async () => {
  const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL })
  try {
    const page = await browser.newPage()
    await page.goto(`${origin}/zh-CN/guides/skills/installation?from=feedback`)
    assert.equal(page.url(), `${origin}/zh-CN/overview/get-started?from=feedback#agent-skills`)
    const heading = page.locator('h3#agent-skills')
    await heading.waitFor({ state: 'visible' })
    await page.waitForFunction(() => {
      const { top, bottom } = document.getElementById('agent-skills').getBoundingClientRect()
      return top >= 0 && bottom <= window.innerHeight
    })
    const content = await page.locator('article').innerText()
    assert.match(content, /npx skills add dream-num\/skills --skill univer-integrate/)
    assert.match(content, /npx skills add dream-num\/skills --skill build-with-univer/)
    assert.match(content, /npx skills list/)
  } finally {
    await browser.close()
  }
})

test('downloadable CDN example loads, recalculates after editing, and supports undo', async () => {
  const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL })
  try {
    const page = await browser.newPage()
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto(`${origin}/assets/examples/cdn/sheets.html`)
    await page.waitForFunction(
      () => window.univerAPI?.getActiveWorkbook()?.getActiveSheet()?.getRange('D2').getValue() === 36,
      null,
      { timeout: 60_000 },
    )
    assert.ok((await page.locator('canvas').count()) > 0)
    await page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('B2').setValue(4))
    await page.waitForFunction(
      () => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('D2').getValue() === 48,
    )
    await page.evaluate(() => window.univerAPI.getActiveWorkbook().undo())
    await page.waitForFunction(
      () => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('D2').getValue() === 36,
    )
    assert.deepEqual(errors, [])
  } finally {
    await browser.close()
  }
})
