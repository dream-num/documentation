/* eslint-disable no-await-in-loop -- Verify both locales and themes in the actual selected Preview. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

const slug = process.env.SHOWCASE_MODE || 'lit'
assert.ok(['lit', 'hide-headers'].includes(slug))
const { createServer } = await import(pathToFileURL(process.env.SHOWCASE_VITE_MODULE).href)
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/sheets-native-theme-' + slug)
await fs.mkdir(directory, { recursive: true })
const sources = (
  await Promise.all(
    ['create-demo.ts', 'data.ts'].map((name) => fs.readFile('showcase/sheets/' + slug + '/code/' + name, 'utf8')),
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
  server: { host: '127.0.0.1', port: 4427, strictPort: true, watch: { ignored: ['**/.next/**'] } },
  optimizeDeps: {
    noDiscovery: true,
    include: [
      'react',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'react-dom/client',
      'next-themes',
      'lit',
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
        return `import React from 'react'; import {createRoot} from 'react-dom/client'; import {ThemeProvider} from 'next-themes'; import Preview from '/showcase/sheets/${slug}/preview/main.tsx'; const root=createRoot(document.getElementById('app')); root.render(React.createElement(ThemeProvider,{attribute:'class',defaultTheme:'light'},React.createElement(Preview))); window.unmountPreview=()=>root.unmount();`
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
await page.addInitScript(() => {
  window.__paint = []
  window.__keys = []
  window.addEventListener('keydown', (event) => {
    const host = document.querySelector('univer-sheets-lit-demo')
    window.__keys.push({
      key: event.key,
      target: event.target.tagName,
      innerContainsTarget: host?.shadowRoot.querySelector('#editor').contains(event.target),
    })
  })
  const original = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (...args) {
    window.__paint.push({ text: String(args[0]), x: args[1], canvasHeight: this.canvas.height })
    return Reflect.apply(original, this, args)
  }
})
try {
  for (const locale of ['en-US', 'zh-CN']) {
    await page.goto('http://127.0.0.1:4427/?locale=' + locale, { timeout: 180000 })
    const selector = slug === 'lit' ? 'univer-sheets-lit-demo' : '.sheets-hide-headers-demo'
    const root = page.locator(selector + '[data-ready=true]')
    await root.waitFor({ timeout: 120000 })
    await page.locator('[data-u-comp="ribbon-grid-toolbar"]').waitFor()
    assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), locale === 'zh-CN' ? 'zhCN' : 'enUS')
    assert.equal(await root.evaluate((el) => getComputedStyle(el).fontFamily), 'Arial, sans-serif')
    if (slug === 'lit') {
      await page.waitForFunction(
        () => document.querySelector('univer-sheets-lit-demo').shadowRoot.querySelector('link').sheet,
      )
      assert.equal(
        await root
          .locator('.univer-flex')
          .first()
          .evaluate((el) => getComputedStyle(el).display),
        'flex',
      )
    } else {
      const sheet = await page.evaluate(() => window.univerAPI.getActiveWorkbook().save().sheets['sheet-01'])
      assert.equal(sheet.rowHeader.hidden, 1)
      assert.equal(sheet.columnHeader.hidden, 1)
      // Ignore the formula editor's character-level text; the grid paints A1 at its left edge.
      await page.waitForFunction(() =>
        window.__paint.some((item) => item.text === 'A1' && item.canvasHeight > 500 && item.x < 46),
      )
    }
    await page.evaluate(() => {
      window.__owner = window.univerAPI
    })
    await page.screenshot({ path: path.join(directory, locale + '-initial.png') })
    const canvases = root.locator('canvas')
    const sizes = await canvases.evaluateAll((items) =>
      items.map((item) => ({ width: item.clientWidth, height: item.clientHeight })),
    )
    const canvasIndex = sizes.findIndex((item) => item.width > 600 && item.height > 500)
    assert.ok(canvasIndex >= 0)
    await canvases.nth(canvasIndex).dblclick({ position: { x: 100, y: 80 } })
    await page.keyboard.type('Native edited cell')
    await page.keyboard.press('Enter')
    const enterCommit = await page.evaluate(() => {
      const book = window.univerAPI.getActiveWorkbook().save()
      return Object.values(book.sheets).some((sheet) =>
        Object.values(sheet.cellData || {}).some((row) =>
          Object.values(row).some((cell) => cell.v === 'Native edited cell'),
        ),
      )
    })
    const keyboardTargets = await page.evaluate(() => window.__keys.filter((event) => event.key === 'Enter'))
    // Finish with a native pointer commit; Shadow DOM keyboard routing is separately observable.
    await canvases.nth(canvasIndex).click({ position: { x: 280, y: 160 } })
    await page.waitForFunction(() => {
      const book = window.univerAPI.getActiveWorkbook().save()
      return Object.values(book.sheets).some((sheet) =>
        Object.values(sheet.cellData || {}).some((row) =>
          Object.values(row).some((cell) => cell.v === 'Native edited cell'),
        ),
      )
    })
    await page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('C8').setValue('=2+3'))
    await page.waitForFunction(
      () => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('C8').getValue() === 5,
    )
    const edited = await page.evaluate(() => window.univerAPI.getActiveWorkbook().save())
    for (const theme of ['dark', 'light']) {
      await page.evaluate((value) => {
        localStorage.setItem('theme', value)
        window.dispatchEvent(new StorageEvent('storage', { key: 'theme', newValue: value, storageArea: localStorage }))
      }, theme)
      await page.waitForFunction((value) => document.documentElement.classList.contains(value), theme)
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
      assert.equal(await page.evaluate(() => window.__owner === window.univerAPI), true)
      assert.deepEqual(await page.evaluate(() => window.univerAPI.getActiveWorkbook().save()), edited)
      await page.screenshot({ path: path.join(directory, locale + '-' + theme + '.png') })
    }
    await page.evaluate(() => window.unmountPreview())
    await page.waitForFunction(() => !window.univerAPI)
    report.locales.push({
      locale,
      nativeInput: true,
      enterCommit,
      keyboardTargets,
      formula: 5,
      ownerAndFullSnapshot: true,
      teardown: true,
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
assert.equal(report.passed, true, report.failure)
console.log('PASS Sheets ' + slug + ' native input and Preview theme owner')
