/* eslint-disable no-await-in-loop -- Native edits precede ordered formatting and theme checks. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'
const { createServer } = await import(
  pathToFileURL(
    process.env.SHOWCASE_VITE_MODULE ||
      'C:/Users/wbfsa/AppData/Local/Temp/univer-vite-runner/node_modules/vite/dist/node/index.js',
  ).href
)
const out = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/bases-number-preview')
await fs.mkdir(out, { recursive: true })
const sources = (
  await Promise.all(
    ['create-demo.ts', 'data.ts'].map((n) => fs.readFile(`showcase/bases/text-number-currency/code/${n}`, 'utf8')),
  )
).join('\n')
const dependencies = [
  ...new Set(
    [...sources.matchAll(/(?:from\s*|import\s*)['"](@[^'"]+)['"]/g)]
      .map((m) => m[1])
      .filter((n) => !n.endsWith('.css')),
  ),
]
const server = await createServer({
  configFile: false,
  root: process.cwd(),
  appType: 'custom',
  cacheDir: path.join(out, '.vite'),
  server: { host: '127.0.0.1', port: 4426, strictPort: true, watch: { ignored: ['**/.next/**'] } },
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
      name: 'number-preview',
      configureServer(vite) {
        vite.middlewares.use((req, res, next) => {
          if (!req.url?.startsWith('/?locale=')) return next()
          const locale = new URL(req.url, 'http://localhost').searchParams.get('locale')
          res.setHeader('Content-Type', 'text/html')
          res.end(
            `<html lang="${locale === 'zh-CN' ? 'zh-CN' : 'en-US'}"><head><link rel="icon" href="data:,"><style>html,body,#app,.h-full{height:100%;margin:0}.min-h-0{min-height:0}</style></head><body><div id="app"></div><script type="module" src="/number-preview.jsx"></script></body></html>`,
          )
        })
      },
      resolveId(id) {
        if (id === '/number-preview.jsx') return '\0number-preview.jsx'
      },
      load(id) {
        if (id !== '\0number-preview.jsx') return
        return `import React from 'react';import {createRoot} from 'react-dom/client';import {ThemeProvider} from 'next-themes';import Preview from '/showcase/bases/text-number-currency/preview/main.tsx';const root=createRoot(document.getElementById('app'));root.render(React.createElement(ThemeProvider,{attribute:'class',defaultTheme:'light'},React.createElement(Preview)));window.unmountPreview=()=>root.unmount();`
      },
    },
  ],
})
await server.listen()
const browser = await chromium.launch()
const results = []
try {
  for (const locale of ['en-US', 'zh-CN']) {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1100 }, colorScheme: 'light' })
    page.setDefaultTimeout(20000)
    const r = { locale, passed: false, errors: [] }
    results.push(r)
    page.on('pageerror', (e) => r.errors.push(e.message))
    page.on('console', (m) => {
      if (m.type() === 'error') r.errors.push(m.text())
    })
    await page.addInitScript(() => {
      window.points = []
      const fill = CanvasRenderingContext2D.prototype.fillText
      CanvasRenderingContext2D.prototype.fillText = function (...args) {
        const p = this.getTransform().transformPoint({ x: args[1], y: args[2] })
        const b = this.canvas.getBoundingClientRect()
        if (b.width > 300)
          window.points.push({
            text: String(args[0]),
            x: b.x + (p.x * b.width) / this.canvas.width,
            y: b.y + (p.y * b.height) / this.canvas.height,
          })
        return Reflect.apply(fill, this, args)
      }
    })
    const snapshot = () => page.evaluate(() => window.univerAPI.getBase('bracken-field-lab').save())
    try {
      await page.goto(`http://127.0.0.1:4426/?locale=${locale}`, { timeout: 180000 })
      const root = page.locator('.base-fields')
      await root.locator(':scope[data-ready=true]').waitFor({ timeout: 120000 })
      assert.equal(await root.getAttribute('data-error'), null)
      assert.equal(await root.evaluate((e) => getComputedStyle(e).fontFamily), 'Arial, sans-serif')
      assert.equal(
        await root
          .locator('[data-u-comp="workbench-layout"]')
          .first()
          .evaluate((e) => getComputedStyle(e).backgroundColor),
        'rgb(255, 255, 255)',
      )
      assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), locale === 'zh-CN' ? 'zhCN' : 'enUS')
      assert.equal(await root.locator('fieldset,pre,details,[data-action]').count(), 0)
      const original = await snapshot()
      assert.deepEqual(original.tableOrder, ['repairs', 'stations', 'checks'])
      assert.equal(original.tables.repairs.recordOrder.length, 30)
      for (const [field, text, value] of [
        ['units', '1,250.750', 4321.125],
        ['reserve', '$8.75', 98.25],
      ]) {
        await page.waitForFunction((t) => window.points.some((p) => p.text === t), text)
        const point = await page.evaluate(
          (t) => window.points.findLast((p) => p.text === t && p.y > 120 && p.y < 165),
          text,
        )
        await page.mouse.dblclick(point.x - 10, point.y - 4)
        await page.keyboard.press('Control+a')
        await page.keyboard.type(String(value))
        await page.keyboard.press('Enter')
        await page.waitForFunction(
          ({ field: key, value: expected }) =>
            window.univerAPI
              .getBase('bracken-field-lab')
              .getTableById('repairs')
              .getRecordById('repairs-01')
              .getValue(key) === expected,
          { field, value },
        )
      }
      r.nativeNumberAndCurrency = true
      const edited = await snapshot()
      assert.deepEqual(edited.tables.stations, original.tables.stations)
      assert.deepEqual(edited.tables.checks, original.tables.checks)
      r.formats = []
      for (const [separatorStyle, decimalPlaces, abbreviation, text] of [
        ['periodComma', 2, 'none', '4.321,13'],
        ['spacePeriod', 3, 'none', '4 321.125'],
        ['commaPeriod', 2, 'K', '4.32K'],
      ]) {
        await page.evaluate(
          ({ separatorStyle: separator, decimalPlaces: precision, abbreviation: abbr }) => {
            window.points = []
            const field = window.univerAPI.getBase('bracken-field-lab').getTableById('repairs').getFieldById('units')
            field.setConfig({
              ...field.getConfig(),
              separatorStyle: separator,
              decimalPlaces: precision,
              abbreviation: abbr,
            })
          },
          { separatorStyle, decimalPlaces, abbreviation },
        )
        await page.waitForFunction((t) => window.points.some((p) => p.text === t), text)
        assert.deepEqual((await snapshot()).tables.repairs.records, edited.tables.repairs.records)
        r.formats.push(text)
      }
      await page.evaluate(() => {
        window.originalOwner = window.univerAPI
      })
      const themed = await snapshot()
      for (const theme of ['dark', 'light']) {
        await page.evaluate((value) => {
          localStorage.setItem('theme', value)
          window.dispatchEvent(
            new StorageEvent('storage', { key: 'theme', newValue: value, storageArea: localStorage }),
          )
        }, theme)
        await page.waitForFunction((dark) => window.univerAPI.isDarkMode() === dark, theme === 'dark')
        await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
        assert.equal(await page.evaluate(() => window.originalOwner === window.univerAPI), true)
        assert.deepEqual(await snapshot(), themed)
        await root.screenshot({ path: path.join(out, `${locale}-${theme}.png`) })
      }
      r.fullEditedSnapshotAndOwner = true
      await page.evaluate(() => window.unmountPreview())
      await page.waitForTimeout(300)
      assert.equal(await root.count(), 0)
      assert.equal(await page.evaluate(() => window.univerAPI === undefined), true)
      assert.deepEqual(r.errors, [])
      r.unmount = true
      r.passed = true
    } catch (error) {
      r.failure = error.stack
      r.painted = await page.evaluate(() => window.points?.slice(-100))
      await page.screenshot({ path: path.join(out, `${locale}-failure.png`) }).catch(() => {})
    } finally {
      await page.close()
      await fs.writeFile(path.join(out, 'report.json'), JSON.stringify(results, null, 2))
    }
  }
} finally {
  await browser.close()
  await server.close()
}
console.log(JSON.stringify(results, null, 2))
assert.ok(results.every((r) => r.passed))
