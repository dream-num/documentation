/* eslint-disable no-await-in-loop -- Each selected preview owns its workbook until unmount. */
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
const port = Number(process.env.SHOWCASE_PORT || 4426)
const out = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/big-data-preview')
await fs.mkdir(out, { recursive: true })
const sources = (
  await Promise.all(
    ['big-data'].flatMap((mode) =>
      ['create-demo.ts', 'data.ts'].map((n) => fs.readFile(`showcase/sheets/${mode}/code/${n}`, 'utf8')),
    ),
  )
).join('\n')
const deps = [
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
  server: { host: '127.0.0.1', port, strictPort: true, watch: { ignored: ['**/.next/**'] } },
  optimizeDeps: {
    noDiscovery: true,
    include: ['react', 'react/jsx-runtime', 'react/jsx-dev-runtime', 'react-dom/client', 'next-themes', ...deps],
  },
  oxc: { jsx: { runtime: 'automatic' } },
  plugins: [
    {
      name: 'slim-previews',
      configureServer(vite) {
        vite.middlewares.use((req, res, next) => {
          if (!req.url?.startsWith('/?')) return next()
          const q = new URL(req.url, 'http://localhost').searchParams
          const mode = 'big-data'
          res.setHeader('Content-Type', 'text/html')
          res.end(
            `<html lang="${q.get('locale') === 'zh-CN' ? 'zh-CN' : 'en-US'}"><head><link rel="icon" href="data:,"><style>html,body,#app,.h-full{height:100%;margin:0}</style></head><body><div id="app"></div><script type="module" src="/${mode}.jsx"></script></body></html>`,
          )
        })
      },
      resolveId(id) {
        if (['/big-data.jsx'].includes(id)) return '\0' + id
      },
      load(id) {
        if (!['\0/big-data.jsx'].includes(id)) return
        const mode = 'big-data'
        return `import React from 'react';import {createRoot} from 'react-dom/client';import {ThemeProvider} from 'next-themes';import Preview from '/showcase/sheets/${mode}/preview/main.tsx';const root=createRoot(document.getElementById('app'));root.render(React.createElement(ThemeProvider,{attribute:'class',defaultTheme:'light'},React.createElement(Preview)));window.unmountPreview=()=>root.unmount();`
      },
    },
  ],
})
await server.listen()
const browser = await chromium.launch()
const results = []
try {
  for (const mode of ['big-data'])
    for (const locale of ['en-US', 'zh-CN']) {
      const page = await browser.newPage({
        viewport: { width: 1440, height: 1100 },
        colorScheme: 'light',
      })
      page.setDefaultTimeout(20000)
      const r = { mode, locale, passed: false, errors: [], networkWrites: [] }
      results.push(r)
      page.on('pageerror', (e) => r.errors.push(e.message))
      page.on('console', (m) => {
        if (m.type() === 'error') r.errors.push(m.text())
      })
      page.on('request', (request) => {
        if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method())) r.networkWrites.push(request.url())
      })
      try {
        await page.goto(`http://127.0.0.1:${port}/?mode=${mode}&locale=${locale}`, { timeout: 180000 })
        const root = page.locator('.big-data-demo')
        await page.waitForFunction(() => window.univerAPI?.getActiveWorkbook())
        await root.locator('canvas').filter({ visible: true }).first().waitFor({ timeout: 120000 })
        await page.locator('.big-data-demo[data-ready=true]').waitFor()
        await page.waitForFunction(() => !document.querySelector('[data-u-comp="workbench-skeleton-content"]'))
        assert.equal(await root.locator('pre,details,[data-action=json],[data-action=reset]').count(), 0)
        assert.equal(await root.locator('[data-action]').count(), 3)
        assert.equal(
          await root.locator('[data-u-comp="workbench-layout"]').evaluate((e) => getComputedStyle(e).backgroundColor),
          'rgb(255, 255, 255)',
        )
        assert.equal(
          await page.evaluate(() => window.univerAPI.getCurrentLocale()),
          locale === 'zh-CN' ? 'zhCN' : 'enUS',
        )
        const zh = locale === 'zh-CN'
        const initial = await page.evaluate(() => window.univerAPI.getActiveWorkbook().save())
        assert.equal(initial.sheets.samples.rowCount, 1000000)
        assert.equal(Object.keys(initial.sheets.samples.cellData).length, 101)
        await root.getByLabel(zh ? '工作表容量' : 'Worksheet capacity', { exact: true }).selectOption('10000')
        await root.locator('[data-action=capacity]').click()
        await page.waitForFunction(() => window.univerAPI.getActiveWorkbook().getActiveSheet().getMaxRows() === 10000)
        await root.getByLabel(zh ? '分块大小' : 'Chunk size', { exact: true }).selectOption('250')
        await root.getByLabel(zh ? '窗口位置' : 'Window position', { exact: true }).selectOption('middle')
        await root.locator('[data-action=load]').click()
        await page.waitForFunction(
          () => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('A5001').getRawValue() === 'MR-0005000',
        )
        const loaded = await page.evaluate(() => window.univerAPI.getActiveWorkbook().save())
        assert.equal(Object.keys(loaded.sheets.samples.cellData).length, 351)
        assert.equal(loaded.sheets.samples.cellData[5249][0].v, 'MR-0005249')
        await root.getByLabel(zh ? '窗口位置' : 'Window position', { exact: true }).selectOption('top')
        await root.locator('[data-action=jump]').click()
        await page.waitForFunction(
          () => window.univerAPI.getActiveWorkbook().getActiveSheet().getActiveRange().getA1Notation() === 'A2',
        )
        assert.deepEqual(await page.evaluate(() => window.univerAPI.getActiveWorkbook().save()), loaded)
        r.boundedSample = '10,000 capacity; initial100 plus250 middle rows; jump preserves model'
        const cell = 'D2'
        const name = root.locator('input.univer-size-full').first()
        await name.click()
        await name.fill(cell)
        await name.press('Enter')
        await page.waitForFunction(
          () =>
            document.activeElement?.getAttribute('contenteditable') === 'true' &&
            document.getSelection().rangeCount > 0,
        )
        await page.keyboard.type('73')
        await page.keyboard.press('Enter')
        await page.waitForFunction(
          (address) => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange(address).getRawValue() === 73,
          cell,
        )
        const snapshot = await page.evaluate(() => {
          window.originalOwner = window.univerAPI
          return window.univerAPI.getActiveWorkbook().save()
        })
        assert.equal(snapshot.sheetOrder.length, 1)
        r.nativeInput = true
        for (const theme of ['dark', 'light']) {
          await page.evaluate((value) => {
            localStorage.setItem('theme', value)
            window.dispatchEvent(
              new StorageEvent('storage', { key: 'theme', newValue: value, storageArea: localStorage }),
            )
          }, theme)
          await page.waitForFunction((dark) => window.univerAPI.isDarkMode() === dark, theme === 'dark')
          await page.evaluate(
            () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
          )
          assert.equal(await page.evaluate(() => window.originalOwner === window.univerAPI), true)
          assert.deepEqual(await page.evaluate(() => window.univerAPI.getActiveWorkbook().save()), snapshot)
          await root.screenshot({ path: path.join(out, `${mode}-${locale}-${theme}.png`) })
        }
        r.fullSnapshotSameOwner = true
        await page.evaluate(() => window.unmountPreview())
        await page.waitForTimeout(300)
        assert.equal(await root.count(), 0)
        assert.equal(await page.evaluate(() => window.univerAPI === undefined), true)
        assert.deepEqual(r.errors, [])
        assert.deepEqual(r.networkWrites, [])
        r.unmount = true
        r.passed = true
      } catch (error) {
        r.failure = error.stack
        await page.screenshot({ path: path.join(out, `${mode}-${locale}-failure.png`) }).catch(() => {})
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
