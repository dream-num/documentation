/* eslint-disable no-await-in-loop -- Verify both locales and themes in the actual selected Preview. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

const { createServer } = await import(pathToFileURL(process.env.SHOWCASE_VITE_MODULE).href)
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-docblock-theme')
await fs.mkdir(directory, { recursive: true })
const sources = (
  await Promise.all(
    ['create-demo.ts', 'data.ts'].map((name) => fs.readFile('showcase/embed/bases-in-docs-block/code/' + name, 'utf8')),
  )
).join('\n')
const dependencies = [
  ...new Set(
    [...sources.matchAll(/(?:from\s*|import\s*)['"](@[^'"]+)['"]/g)]
      .map((match) => match[1])
      .filter((name) => !name.endsWith('.css')),
  ),
]
const server = await createServer({
  configFile: false,
  root: process.cwd(),
  appType: 'custom',
  cacheDir: path.join(directory, '.vite'),
  server: { host: '127.0.0.1', port: 4428, strictPort: true, watch: { ignored: ['**/.next/**'] } },
  optimizeDeps: {
    noDiscovery: true,
    include: [
      'react',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'react-dom/client',
      'next-themes',
      ...dependencies,
    ],
  },
  oxc: { jsx: { runtime: 'automatic' } },
  plugins: [
    {
      name: 'selected-docblock-theme',
      configureServer(vite) {
        vite.middlewares.use((req, res, next) => {
          if (!req.url?.startsWith('/?locale=')) return next()
          const locale = new URL(req.url, 'http://localhost').searchParams.get('locale')
          res.setHeader('Content-Type', 'text/html')
          res.end(
            `<html lang="${locale === 'zh-CN' ? 'zh-CN' : 'en-US'}"><head><link rel="icon" href="data:,"><style>html,body,#app,.h-full{height:100%;margin:0}.min-h-0{min-height:0}</style></head><body><div id="app"></div><script type="module" src="/docblock-theme.jsx"></script></body></html>`,
          )
        })
      },
      resolveId(id) {
        if (id === '/docblock-theme.jsx') return '\0docblock-theme.jsx'
      },
      load(id) {
        if (id !== '\0docblock-theme.jsx') return
        return `import React from 'react'; import {createRoot} from 'react-dom/client'; import {ThemeProvider} from 'next-themes'; import Preview from '/showcase/embed/bases-in-docs-block/preview/main.tsx'; const root=createRoot(document.getElementById('app')); root.render(React.createElement(ThemeProvider,{attribute:'class',defaultTheme:'light'},React.createElement(Preview))); window.unmountPreview=()=>root.unmount();`
      },
    },
  ],
})
await server.listen()
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } })
const report = { passed: false, locales: [], errors: [], networkWrites: [] }
page.on('pageerror', (e) => report.errors.push(e.message))
page.on('console', (e) => {
  if (e.type() === 'error') report.errors.push(e.text())
})
page.on('request', (r) => {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(r.method())) report.networkWrites.push(r.url())
})
const snapshots = () =>
  page.evaluate(() => ({
    host: window.univerAPI.getDocument('orchard-launch-brief').save(),
    child: window.univerAPI.getBase('orchard-launch-responsibilities').save(),
  }))
try {
  for (const locale of ['en-US', 'zh-CN']) {
    await page.goto('http://127.0.0.1:4428/?locale=' + locale, { timeout: 180000 })
    await page.waitForFunction(
      () => document.querySelector('.orchard-embed')?.dataset.ready === 'true',
      {},
      { timeout: 120000 },
    )
    assert.equal(await page.locator('.orchard-embed').getAttribute('data-error'), null)
    await page.locator('[data-u-comp="ribbon-grid-toolbar"]').waitFor()
    const child = page.locator('[data-u-comp="embed-docs-custom-block"] [data-u-comp="embed-float-dom"]')
    await child.click({ position: { x: 180, y: 130 } })
    await page.waitForFunction(
      () =>
        document.querySelector('[data-u-comp="embed-float-dom"]')?.getAttribute('data-embed-float-stage') === 'stage2',
    )
    const original = await snapshots()
    assert.equal(
      await page.evaluate(() =>
        window.univerAPI
          .getBase('orchard-launch-responsibilities')
          .getTableById('readiness')
          .getRecordById('readiness-1')
          .setValue('title', 'Theme retained record'),
      ),
      true,
    )
    assert.deepEqual((await snapshots()).host, original.host)
    const childEdited = (await snapshots()).child
    assert.equal(
      await page.evaluate(() =>
        window.univerAPI
          .getDocument('orchard-launch-brief')
          .getParagraphs()[1]
          .appendText(' Theme retained narrative.'),
      ),
      true,
    )
    assert.deepEqual((await snapshots()).child, childEdited)
    const edited = await snapshots()
    assert.notDeepEqual(edited.host, original.host)
    assert.notDeepEqual(edited.child, original.child)
    await page.evaluate(() => {
      window.originalOwner = window.univerAPI
    })
    for (const theme of ['dark', 'light']) {
      await page.evaluate((value) => {
        const oldValue = localStorage.getItem('theme')
        localStorage.setItem('theme', value)
        window.dispatchEvent(
          new StorageEvent('storage', { key: 'theme', oldValue, newValue: value, storageArea: localStorage }),
        )
      }, theme)
      await page.waitForFunction((value) => document.documentElement.classList.contains(value), theme)
      await page.waitForFunction((dark) => window.univerAPI.isDarkMode() === dark, theme === 'dark')
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
      assert.equal(await page.evaluate(() => window.univerAPI === window.originalOwner), true)
      assert.deepEqual(await snapshots(), edited)
      await page.screenshot({ path: path.join(directory, locale + '-' + theme + '.png') })
    }
    await page.evaluate(() => window.unmountPreview())
    await page.waitForTimeout(200)
    assert.equal(await page.locator('.orchard-embed').count(), 0)
    assert.equal(await page.evaluate(() => window.univerAPI === undefined), true)
    report.locales.push({
      locale,
      nativeChildActivated: true,
      independentHostChildEdits: true,
      sameOwner: true,
      fullSnapshotsPreserved: true,
      unmount: true,
    })
  }
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.networkWrites, [])
  report.passed = true
} catch (error) {
  report.failure = error.stack
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
  await server.close()
}
console.log(JSON.stringify(report))
assert.equal(report.passed, true)
