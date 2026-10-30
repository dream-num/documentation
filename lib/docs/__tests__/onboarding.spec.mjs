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
    const examplePath = `/assets/examples/cdn/sheets${suffix}.html`
    const example = await readFile(new URL(`public${examplePath}`, root), 'utf8')
    assert.equal(source.match(/```html\n([\s\S]*?)\n```/)[1].trim(), example.trim())
    assert.ok(source.includes(`](${examplePath})`))
    assert.ok(source.includes(`href="${examplePath}"`))
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
  ['/guides/skills', '/guides/sheets/getting-started/installation#agent-skills'],
  ['/guides/skills/installation', '/guides/sheets/getting-started/installation#agent-skills'],
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

test('Skills setup separates SDK integration from application building', async () => {
  const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL })
  try {
    const page = await browser.newPage()
    await page.goto(`${origin}/zh-CN/guides/skills/installation?from=feedback`)
    assert.equal(page.url(), `${origin}/zh-CN/guides/sheets/getting-started/installation?from=feedback#agent-skills`)
    const heading = page.locator('h2#agent-skills')
    await heading.waitFor({ state: 'visible' })
    await page.waitForFunction(() => {
      const { top, bottom } = document.getElementById('agent-skills').getBoundingClientRect()
      return top >= 0 && bottom <= window.innerHeight
    })
    let content = await page.locator('article').innerText()
    assert.match(content, /npx skills add dream-num\/skills --skill univer-integrate/)
    assert.doesNotMatch(content, /npx skills add dream-num\/skills --skill build-with-univer/)
    assert.match(content, /npx skills list/)

    await page.goto(`${origin}/zh-CN/overview/get-started#agent-skills`)
    const optionalSkill = page.locator('details#agent-skills')
    await optionalSkill.locator('summary').waitFor({ state: 'visible' })
    assert.equal(await optionalSkill.getAttribute('open'), null)
    assert.equal(await page.locator('[data-toc-link][href$="#agent-skills"]').count(), 0)
    assert.ok(
      await optionalSkill.evaluate((element) => {
        const headings = document.querySelectorAll('article h3')
        return (
          Boolean(headings[0].compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING) &&
          Boolean(element.compareDocumentPosition(headings[1]) & Node.DOCUMENT_POSITION_FOLLOWING)
        )
      }),
    )
    const installCommand = optionalSkill.locator('pre')
    assert.equal(await installCommand.isVisible(), false)
    await optionalSkill.locator('summary').click()
    await installCommand.waitFor({ state: 'visible' })
    assert.match(await installCommand.innerText(), /npx skills add dream-num\/skills --skill build-with-univer/)
    content = await page.locator('article').innerText()
    assert.doesNotMatch(content, /univer-integrate/)

    await page.close()
    const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } })
    await mobilePage.goto(`${origin}/zh-CN/overview/get-started#agent-skills`)
    await mobilePage.waitForFunction(() => {
      const summary = document.querySelector('details#agent-skills summary').getBoundingClientRect()
      const header = document.querySelector('header').getBoundingClientRect()
      return summary.top >= header.bottom && summary.bottom <= window.innerHeight
    })
  } finally {
    await browser.close()
  }
})

test('localized CDN examples load, recalculate after keyboard editing, and support undo', async (t) => {
  const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL })
  const quantityLabels = {
    'en-US': 'Quantity',
    'zh-CN': '数量',
    'zh-TW': '數量',
    'ja-JP': '数量',
    'ko-KR': '수량',
    'fr-FR': 'Quantité',
    'ru-RU': 'Кол-во',
    'es-ES': 'Cantidad',
  }
  try {
    const context = await browser.newContext()
    for (const locale of locales) {
      const suffix = locale === 'en-US' ? '' : `.${locale}`
      const page = await context.newPage()
      const errors = []
      const failedRequests = []
      const completedResources = new Set()
      const resourcePath = (url) => new URL(url).pathname.replace(/^\/npm\//, '/')
      page.on('pageerror', (error) => errors.push(error.message))
      page.on('requestfailed', (request) => failedRequests.push(request.url()))
      page.on('requestfinished', (request) => completedResources.add(resourcePath(request.url())))
      await page.goto(`${origin}/assets/examples/cdn/sheets${suffix}.html`, { waitUntil: 'domcontentloaded' })
      await page.waitForFunction(
        () => window.univerAPI?.getActiveWorkbook()?.getActiveSheet()?.getRange('D2').getValue() === 36,
        null,
        { timeout: 60_000 },
      )
      assert.ok((await page.locator('canvas').count()) > 0)
      const actualLocale = await page.evaluate(() => ({
        language: document.documentElement.lang,
        sdkLocale: window.univerAPI.getCurrentLocale(),
        quantityLabel: window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('B1').getValue(),
      }))
      assert.deepEqual(actualLocale, {
        language: locale,
        sdkLocale: locale.replace('-', ''),
        quantityLabel: quantityLabels[locale],
      })
      await page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('B2').activate())
      await page.keyboard.type('4')
      await page.keyboard.press('Enter')
      await page.waitForFunction(
        () => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('D2').getValue() === 48,
      )
      await page.evaluate(() => window.univerAPI.getActiveWorkbook().undo())
      await page.waitForFunction(
        () => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('D2').getValue() === 36,
      )
      assert.deepEqual(errors, [], locale)
      assert.deepEqual(
        failedRequests.filter((url) => !completedResources.has(resourcePath(url))),
        [],
        `${locale}: every failed resource must complete successfully through a retry`,
      )
      await page.close()
      t.diagnostic(`${locale}: localized UI, keyboard editing, formula recalculation and undo pass`)
    }
  } finally {
    await browser.close()
  }
})

test('a closed locale connection retries another CDN before initialization', async () => {
  const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL })
  try {
    const page = await browser.newPage()
    const attempts = []
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.route('**/ui@1.3.0/lib/umd/locale/zh-CN.js', (route) => {
      attempts.push(route.request().url())
      return new URL(route.request().url()).hostname === 'cdn.jsdelivr.net'
        ? route.abort('connectionclosed')
        : route.continue()
    })
    await page.goto(`${origin}/assets/examples/cdn/sheets.zh-CN.html`, { waitUntil: 'domcontentloaded' })
    await page.waitForFunction(
      () => window.univerAPI?.getActiveWorkbook()?.getActiveSheet()?.getRange('D2').getValue() === 36,
      null,
      { timeout: 60_000 },
    )
    assert.ok(attempts.some((url) => new URL(url).hostname === 'cdn.jsdelivr.net'))
    assert.ok(attempts.some((url) => new URL(url).hostname === 'unpkg.com'))
    assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), 'zhCN')
    assert.deepEqual(errors, [])
  } finally {
    await browser.close()
  }
})

test('the CDN example can load entirely from the backup provider', async () => {
  const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL })
  try {
    const page = await browser.newPage()
    let blocked = 0
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.route('https://cdn.jsdelivr.net/**', (route) => {
      blocked++
      return route.abort('connectionclosed')
    })
    await page.goto(`${origin}/assets/examples/cdn/sheets.zh-CN.html`, { waitUntil: 'domcontentloaded' })
    await page.waitForFunction(
      () => window.univerAPI?.getActiveWorkbook()?.getActiveSheet()?.getRange('D2').getValue() === 36,
      null,
      { timeout: 60_000 },
    )
    assert.ok(blocked > 20)
    assert.ok((await page.locator('canvas').count()) > 0)
    assert.deepEqual(errors, [])
  } finally {
    await browser.close()
  }
})

test('failed CDN providers show the missing resource without initializing the SDK', async () => {
  const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL })
  try {
    const page = await browser.newPage()
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.route('**/ui@1.3.0/lib/umd/locale/zh-CN.js', (route) => route.abort('connectionclosed'))
    await page.goto(`${origin}/assets/examples/cdn/sheets.zh-CN.html`, { waitUntil: 'domcontentloaded' })
    const alert = page.locator('#app[role="alert"]')
    await alert.waitFor({ state: 'visible', timeout: 60_000 })
    assert.match(await alert.innerText(), /ui@1\.3\.0\/lib\/umd\/locale\/zh-CN\.js/)
    assert.match(await alert.innerText(), /加载失败/)
    assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
    assert.deepEqual(errors, [])
  } finally {
    await browser.close()
  }
})
