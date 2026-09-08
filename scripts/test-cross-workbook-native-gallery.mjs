/* eslint-disable no-await-in-loop -- Exercise linked native workbooks and preserve their owner across theme changes. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'
const origin = new URL(process.env.SHOWCASE_DEMO_URL || 'http://localhost:4336').origin
const out = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/cross-workbook-native-gallery')
await fs.mkdir(out, { recursive: true })
let server
const port = Number(process.env.SHOWCASE_PORT || 4454)
if (process.argv[2]) {
  const manifest = JSON.parse(await fs.readFile(process.argv[2], 'utf8'))
  const entry = manifest.find(({ slug }) => slug === 'sheets/cross-workbook-formula')
  assert.ok(entry?.passed, 'Selected production build must pass')
  const { readShowcaseSources } = await import('./showcase-sources.mjs')
  const source = (await readShowcaseSources()).find(({ slug }) => slug === entry.slug)
  for (const [file, expected] of Object.entries(source.files))
    assert.equal(await fs.readFile(path.join(entry.directory, file.slice(1)), 'utf8'), expected, file)
  const { createServer } = await import(
    pathToFileURL(path.join(entry.links.find(({ name }) => name === 'vite').target, 'dist/node/index.js'))
  )
  const dependencies = [
    ...new Set(
      Object.entries(source.files)
        .filter(([file]) => file.startsWith('/src/') && /\.[jt]sx?$/.test(file))
        .flatMap(([, code]) =>
          [...code.matchAll(/(?:from\s*|import\s*)['"](@[^'"]+)['"]/g)]
            .map((match) => match[1])
            .filter((id) => !id.endsWith('.css')),
        ),
    ),
  ]
  server = await createServer({
    configFile: false,
    root: process.cwd(),
    appType: 'custom',
    cacheDir: path.resolve(out, '.vite'),
    server: { host: '127.0.0.1', port, strictPort: true, watch: { ignored: ['**/.next/**'] } },
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
        name: 'selected-cross-preview',
        configureServer(vite) {
          vite.middlewares.use((req, res, next) => {
            if (!req.url?.startsWith('/?locale=')) return next()
            const locale =
              new URL(req.url, 'http://localhost').searchParams.get('locale') === 'zh-CN' ? 'zh-CN' : 'en-US'
            res.setHeader('Content-Type', 'text/html')
            res.end(
              '<html lang="' +
                locale +
                '"><head><link rel="icon" href="data:,"><style>html,body,#app,.h-full{height:100%;margin:0}</style></head><body><div id="app"></div><script type="module" src="/cross-preview.jsx"></script></body></html>',
            )
          })
        },
        resolveId(id) {
          if (id === '/cross-preview.jsx') return '\0cross-preview'
        },
        load(id) {
          if (id === '\0cross-preview')
            return "import React from 'react';import {createRoot} from 'react-dom/client';import {ThemeProvider} from 'next-themes';import Preview from '/showcase/sheets/cross-workbook-formula/preview/main.tsx';const root=createRoot(document.getElementById('app'));root.render(React.createElement(ThemeProvider,{attribute:'class',defaultTheme:'light'},React.createElement(Preview)));window.unmountPreview=()=>root.unmount();"
        },
      },
    ],
  })
  await server.listen()
}

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1500, height: 1050 }, colorScheme: 'light' })
await page.addInitScript(() => localStorage.setItem('theme', 'light'))
const report = { passed: false, locales: [], errors: [], networkWrites: [] }
page.on('pageerror', (e) => report.errors.push(e.stack || e.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
})
page.on('request', (r) => {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(r.method()) && !r.headers()['next-action'])
    report.networkWrites.push(r.url())
})
const root = page.locator('.cross-workbook-demo')
const summary = () =>
  page.evaluate(() =>
    window.univerAPI
      .getWorkbook('tern-summary')
      .getSheetBySheetId('main')
      .getRange('B4:B12')
      .getRawValues()
      .map((r) => r[0]),
  )
const canvas = root.locator('canvas[id^="univer-sheet-main-canvas"]')
const pixels = () =>
  canvas.evaluate((element) => {
    const context = element.getContext('2d')
    const data = context.getImageData(330, 100, 140, 80).data
    let hash = 2166136261
    for (const value of data) hash = Math.imul(hash ^ value, 16777619) >>> 0
    return hash
  })
try {
  for (const locale of ['en-US', 'zh-CN']) {
    await page.goto(
      server
        ? `http://127.0.0.1:${port}/?locale=${locale}`
        : origin + '/' + locale + '/playground/sheets/cross-workbook-formula',
      {
        waitUntil: 'domcontentloaded',
        timeout: 180000,
      },
    )
    await page.locator('.cross-workbook-demo[data-ready="true"]').waitFor({ timeout: 90000 })
    await page.waitForFunction(
      () =>
        window.univerAPI.getWorkbook('tern-summary').getSheetBySheetId('main').getRange('B4').getRawValues()[0][0] ===
        1500,
    )
    assert.deepEqual((await summary()).slice(0, 6), [1500, 2700, 1920, 42, '#REF!', '#NAME?'])
    assert.equal(await root.locator('fieldset,pre,output,button[data-action],.cross-workbook-totals').count(), 0)
    assert.equal(await root.locator('select').count(), 1)
    assert.equal(await page.evaluate(() => document.documentElement.lang), locale)
    assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), 'enUS')
    assert.doesNotMatch(await root.innerText(), /[\u3400-\u9fff]|(?:sheets|formula|toolbar)\.[a-zA-Z]/)
    const picker = root.getByLabel('Viewed workbook', { exact: true })
    await page.evaluate(() => {
      window.__crossOwner = window.univerAPI
    })
    const before = await pixels()
    await page.screenshot({ path: path.join(out, locale + '-summary-before.png') })
    await picker.selectOption('income')
    await page.waitForFunction(() => window.univerAPI.getActiveWorkbook().getId() === 'tern-income')
    const box = root.locator('input.univer-size-full')
    await box.fill('B4')
    await box.press('Enter')
    await page.keyboard.type('180')
    await page.keyboard.press('Enter')
    await page.waitForFunction(
      () => window.univerAPI.getWorkbook('tern-income').getSheetBySheetId('main').getRange('B4').getValue() === 180,
    )
    await page.waitForFunction(
      () =>
        window.univerAPI.getWorkbook('tern-summary').getSheetBySheetId('main').getRange('B6').getRawValues()[0][0] ===
        2670,
    )
    assert.deepEqual((await summary()).slice(0, 6), [2250, 3450, 2670, 42, '#REF!', '#NAME?'])
    await picker.selectOption('summary')
    await page.waitForFunction(() => window.univerAPI.getActiveWorkbook().getId() === 'tern-summary')
    await page.waitForTimeout(300)
    assert.notEqual(await pixels(), before, 'Native result-cell region repaints after a source edit')
    await page.screenshot({ path: path.join(out, locale + '-summary-edited.png') })
    await picker.selectOption('fx')
    await page.waitForFunction(() => window.univerAPI.getActiveWorkbook().getId() === 'tern-fx')
    await box.fill('B4')
    await box.press('Enter')
    await page.keyboard.type('2')
    await page.keyboard.press('Enter')
    await page.waitForFunction(
      () => window.univerAPI.getWorkbook('tern-fx').getSheetBySheetId('main').getRange('B4').getRawValues()[0][0] === 2,
    )
    await page.waitForFunction(() => {
      const api = window.univerAPI
      const values = api.getWorkbook('tern-summary').getSheetBySheetId('main').getRange('B11:B12').getRawValues()
      return (
        values[0][0] === 5340 &&
        values[1][0] === 1560 &&
        api.getWorkbook('tern-costs').getSheetBySheetId('main').getRange('B10').getRawValues()[0][0] === 1560
      )
    })
    await picker.selectOption('summary')
    await page.waitForFunction(() => window.univerAPI.getActiveWorkbook().getId() === 'tern-summary')
    assert.deepEqual((await summary()).slice(7), [5340, 1560])
    await page.waitForTimeout(300)
    await page.screenshot({ path: path.join(out, locale + '-rates-edited.png') })
    for (const key of ['costs', 'fx', 'income', 'summary']) {
      await picker.selectOption(key)
      assert.equal(
        await page.evaluate(() =>
          window.univerAPI.getWorkbook('tern-income').getSheetBySheetId('main').getRange('B4').getValue(),
        ),
        180,
      )
    }
    const snapshots = await page.evaluate(() =>
      ['summary', 'income', 'costs', 'fx'].map((key) => window.univerAPI.getWorkbook('tern-' + key).save()),
    )
    for (const theme of ['dark', 'light']) {
      await page.evaluate((value) => {
        const oldValue = localStorage.getItem('theme')
        localStorage.setItem('theme', value)
        window.dispatchEvent(
          new StorageEvent('storage', { key: 'theme', oldValue, newValue: value, storageArea: localStorage }),
        )
      }, theme)
      await page.waitForFunction((value) => document.documentElement.classList.contains(value), theme)
      await page.waitForTimeout(200)
      assert.equal(await page.evaluate(() => window.__crossOwner === window.univerAPI), true)
      assert.deepEqual(
        await page.evaluate(() =>
          ['summary', 'income', 'costs', 'fx'].map((key) => window.univerAPI.getWorkbook('tern-' + key).save()),
        ),
        snapshots,
      )
      await page.screenshot({ path: path.join(out, locale + '-' + theme + '.png') })
    }
    report.locales.push({
      locale,
      nativeSourceEdit: true,
      nativeRatesEdit: true,
      directAndTransitiveReferences: [5340, 1560],
      sixSimultaneousVariants: true,
      nativeResultPaintChanged: true,
      pickerPreservesSources: true,
      themePreservesFourSnapshots: true,
    })
  }
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.networkWrites, [])
  report.passed = true
} catch (error) {
  report.failure = error.stack || String(error)
  report.values = await summary().catch(() => null)
  await page.screenshot({ path: path.join(out, 'failure.png') }).catch(() => {})
} finally {
  await fs.writeFile(path.join(out, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report))
  await browser.close()
  await server?.close()
}
assert.equal(report.passed, true)
