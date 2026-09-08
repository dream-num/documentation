/* eslint-disable no-await-in-loop -- Each native preview owns its units until unmount. */
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
const out = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-sheet-base-themes')
await fs.mkdir(out, { recursive: true })
const sources = (
  await Promise.all(
    ['float', 'tab'].map(async (kind) =>
      (
        await Promise.all(
          ['create-demo.ts', 'data.ts'].map((name) =>
            fs.readFile(`showcase/embed/bases-in-sheets-${kind}/code/${name}`, 'utf8'),
          ),
        )
      ).join('\n'),
    ),
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
      name: 'selected-sheet-base-previews',
      configureServer(vite) {
        vite.middlewares.use((req, res, next) => {
          if (!req.url?.startsWith('/?')) return next()
          const query = new URL(req.url, 'http://localhost').searchParams
          const kind = query.get('kind') === 'tab' ? 'tab' : 'float'
          res.setHeader('Content-Type', 'text/html')
          res.end(
            `<html lang="${query.get('locale') === 'zh-CN' ? 'zh-CN' : 'en-US'}"><head><link rel="icon" href="data:,"><style>html,body,#app,.h-full{height:100%;margin:0}.min-h-0{min-height:0}</style></head><body><div id="app"></div><script type="module" src="/${kind}-theme.jsx"></script></body></html>`,
          )
        })
      },
      resolveId(id) {
        if (/^\/(float|tab)-theme.jsx$/.test(id)) return '\0' + id
      },
      load(id) {
        if (!id.startsWith('\0/')) return
        const kind = id.includes('float') ? 'float' : 'tab'
        return `import React from 'react';import {createRoot} from 'react-dom/client';import {ThemeProvider} from 'next-themes';import Preview from '/showcase/embed/bases-in-sheets-${kind}/preview/main.tsx';const root=createRoot(document.getElementById('app'));root.render(React.createElement(ThemeProvider,{attribute:'class',defaultTheme:'light'},React.createElement(Preview)));window.unmountPreview=()=>root.unmount();`
      },
    },
  ],
})
await server.listen()
const browser = await chromium.launch()
const results = []
try {
  for (const kind of ['float', 'tab'])
    for (const locale of ['en-US', 'zh-CN']) {
      const page = await browser.newPage({ viewport: { width: 1600, height: 1100 }, colorScheme: 'light' })
      page.setDefaultTimeout(20000)
      const result = { kind, locale, passed: false, errors: [] }
      results.push(result)
      page.on('pageerror', (e) => result.errors.push(e.message))
      page.on('console', (m) => {
        if (m.type() === 'error') result.errors.push(m.text())
      })
      await page.addInitScript(() => {
        window.paintPoints = []
        const fill = CanvasRenderingContext2D.prototype.fillText
        CanvasRenderingContext2D.prototype.fillText = function (...args) {
          const p = this.getTransform().transformPoint({ x: args[1], y: args[2] })
          const b = this.canvas.getBoundingClientRect()
          if (b.width > 100)
            window.paintPoints.push({
              text: String(args[0]),
              x: b.x + (p.x * b.width) / this.canvas.width,
              y: b.y + (p.y * b.height) / this.canvas.height,
            })
          return Reflect.apply(fill, this, args)
        }
      })
      const config =
        kind === 'float'
          ? {
              root: '.atlas-embed',
              host: 'atlas-campaign-spend',
              child: 'atlas-campaign-work',
              table: 'deliverables',
              record: 'deliverable-1',
              field: 'task',
              text: 'Approve search landing',
              sheet: 'Campaign budget',
              cell: 'C7',
              value: '4000',
              total: 'B14',
              expected: 2580,
            }
          : {
              root: '.willow-embed',
              host: 'willow-landed-cost',
              child: 'willow-supplier-operations',
              table: 'suppliers',
              record: 'suppliers-1',
              field: 'title',
              text: 'Seabrook Looms',
              sheet: 'Landed cost',
              cell: 'E5',
              value: '600',
              total: 'G12',
              expected: 39135,
            }
      const snapshots = () =>
        page.evaluate(
          ({ host, child }) => ({
            host: window.univerAPI.getWorkbook(host).save(),
            child: window.univerAPI.getBase(child).save(),
          }),
          config,
        )
      try {
        await page.goto(`http://127.0.0.1:4426/?kind=${kind}&locale=${locale}`, { timeout: 180000 })
        const root = page.locator(config.root)
        await page.waitForFunction(
          (selector) => document.querySelector(selector)?.dataset.ready === 'true',
          config.root,
          { timeout: 120000 },
        )
        assert.equal(await root.getAttribute('data-error'), null)
        assert.equal(await root.evaluate((e) => getComputedStyle(e).fontFamily), 'Arial, sans-serif')
        if (kind === 'tab')
          await root.locator('[data-u-comp="slide-tab-item"]').filter({ hasText: config.sheet }).click()
        await root.getByRole('tab', { name: locale === 'zh-CN' ? '开始' : 'Start', exact: true }).click()
        const name = root.locator('input.univer-size-full').first()
        await name.click()
        await name.fill(config.cell)
        await name.press('Enter')
        await page.waitForFunction(
          () =>
            document.activeElement?.getAttribute('contenteditable') === 'true' &&
            document.getSelection().rangeCount > 0,
        )
        await page.keyboard.type(config.value)
        await page.keyboard.press('Enter')
        await page.waitForFunction(
          (c) =>
            window.univerAPI.getWorkbook(c.host).getSheetByName(c.sheet).getRange(c.total).getRawValue() === c.expected,
          config,
        )
        result.nativeHostEdit = true
        if (kind === 'float') {
          await root.locator('[data-u-comp="embed-float-dom"]').dblclick({ position: { x: 300, y: 180 } })
          await page.waitForFunction(
            () =>
              document.querySelector('[data-u-comp="embed-float-dom"]')?.getAttribute('data-embed-float-stage') ===
              'stage2',
          )
        } else await root.locator('[data-u-comp="slide-tab-item"]').filter({ hasText: 'Supplier operations' }).click()
        await page.waitForFunction((text) => window.paintPoints.some((p) => p.text.startsWith(text)), config.text)
        const point = await page.evaluate(
          (text) => window.paintPoints.findLast((p) => p.text.startsWith(text)),
          config.text,
        )
        const before = await snapshots()
        await page.mouse.dblclick(point.x + 20, point.y - 4)
        await page.keyboard.press('Control+a')
        await page.keyboard.type('Retained native record')
        await page.keyboard.press('Enter')
        await page.waitForFunction(
          (c) =>
            window.univerAPI.getBase(c.child).getTableById(c.table).getRecordById(c.record).getValue(c.field) ===
            'Retained native record',
          config,
        )
        assert.deepEqual((await snapshots()).host, before.host)
        result.nativeChildEdit = true
        const edited = await snapshots()
        await page.evaluate(() => {
          window.originalOwner = window.univerAPI
        })
        for (const theme of ['dark', 'light']) {
          await page.evaluate((value) => {
            localStorage.setItem('theme', value)
            window.dispatchEvent(
              new StorageEvent('storage', { key: 'theme', newValue: value, storageArea: localStorage }),
            )
          }, theme)
          await page.waitForFunction((dark) => window.univerAPI.isDarkMode() === dark, theme === 'dark')
          await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
          assert.equal(await page.evaluate(() => window.univerAPI === window.originalOwner), true)
          assert.deepEqual(await snapshots(), edited)
          await root.screenshot({ path: path.join(out, `${kind}-${locale}-${theme}.png`) })
        }
        result.fullSnapshotsAndOwnerPreserved = true
        await page.evaluate(() => window.unmountPreview())
        await page.waitForTimeout(300)
        assert.equal(await root.count(), 0)
        assert.equal(await page.evaluate(() => window.univerAPI === undefined), true)
        assert.deepEqual(result.errors, [])
        result.unmount = true
        result.passed = true
      } catch (error) {
        result.failure = error.stack
        await page.screenshot({ path: path.join(out, `${kind}-${locale}-failure.png`) }).catch(() => {})
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
