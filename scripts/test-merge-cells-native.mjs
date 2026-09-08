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
const out = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/merge-cells-preview')
await fs.mkdir(out, { recursive: true })
const sources = (
  await Promise.all(
    ['merge-cells'].flatMap((mode) =>
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
          const mode = 'merge-cells'
          res.setHeader('Content-Type', 'text/html')
          res.end(
            `<html lang="${q.get('locale') === 'zh-CN' ? 'zh-CN' : 'en-US'}"><head><link rel="icon" href="data:,"><style>html,body,#app,.h-full{height:100%;margin:0}</style></head><body><div id="app"></div><script type="module" src="/${mode}.jsx"></script></body></html>`,
          )
        })
      },
      resolveId(id) {
        if (['/merge-cells.jsx'].includes(id)) return '\0' + id
      },
      load(id) {
        if (!['\0/merge-cells.jsx'].includes(id)) return
        const mode = 'merge-cells'
        return `import React from 'react';import {createRoot} from 'react-dom/client';import {ThemeProvider} from 'next-themes';import Preview from '/showcase/sheets/${mode}/preview/main.tsx';const root=createRoot(document.getElementById('app'));root.render(React.createElement(ThemeProvider,{attribute:'class',defaultTheme:'light'},React.createElement(Preview)));window.unmountPreview=()=>root.unmount();`
      },
    },
  ],
})
await server.listen()
const browser = await chromium.launch()
const results = []
const geometry = (ranges) =>
  ranges.map(({ startRow, endRow, startColumn, endColumn }) => [startRow, endRow, startColumn, endColumn])
try {
  for (const mode of ['merge-cells'])
    for (const locale of ['en-US', 'zh-CN']) {
      const page = await browser.newPage({
        viewport: { width: 1440, height: 1100 },
        colorScheme: 'light',
      })
      page.setDefaultTimeout(12000)
      await page.addInitScript(() => {
        window.painted = []
        const fill = CanvasRenderingContext2D.prototype.fillText
        CanvasRenderingContext2D.prototype.fillText = function (value, ...args) {
          if (window.painted.length < 4000) window.painted.push(String(value))
          return fill.call(this, value, ...args)
        }
      })
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
        const root = page.locator('.merge-cells-demo')
        await page.waitForFunction(() => window.univerAPI?.getActiveWorkbook())
        await root.locator('canvas').filter({ visible: true }).first().waitFor({ timeout: 120000 })
        await page.locator('.merge-cells-demo[data-ready=true]').waitFor()
        await page.waitForFunction(() => !document.querySelector('[data-u-comp="workbench-skeleton-content"]'))
        assert.equal(await root.locator(':scope > pre,:scope > details,:scope > section').count(), 0)
        assert.equal(
          await root.locator('[data-u-comp="workbench-layout"]').evaluate((e) => getComputedStyle(e).backgroundColor),
          'rgb(255, 255, 255)',
        )
        assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), 'enUS')
        const save = () => page.evaluate(() => window.univerAPI.getActiveWorkbook().save())
        const initial = await save()
        assert.equal(initial.sheets.gallery.mergeData.length, 8)
        assert.deepEqual(geometry(initial.sheets.gallery.mergeData), [
          [1, 1, 1, 7],
          [4, 4, 1, 3],
          [8, 8, 1, 3],
          [9, 9, 1, 3],
          [10, 10, 1, 3],
          [4, 6, 5, 5],
          [4, 6, 6, 6],
          [9, 11, 5, 7],
        ])
        await page.waitForFunction((label) => window.painted.includes(label), 'Welcome desk')
        await root.screenshot({ path: path.join(out, locale + '-gallery.png') })
        await page.getByText('Try it', { exact: true }).click()
        await page.waitForFunction(
          () => window.univerAPI.getActiveWorkbook().getActiveSheet().getSheetId() === 'practice',
        )
        const select = async (address) => {
          const box = root.locator('input.univer-size-full').first()
          await box.click()
          await box.fill(address)
          await box.press('Enter')
        }
        const menu = async (name) => {
          await root.locator('[data-u-command="sheet.command.add-worksheet-merge"]').click()
          await page.getByText(name, { exact: true }).click()
        }
        await select('B3:D4')
        await menu('Merge all')
        await page.waitForFunction(
          () => window.univerAPI.getActiveWorkbook().save().sheets.practice.mergeData?.length === 1,
        )
        const merged = (await save()).sheets.practice.mergeData[0]
        assert.deepEqual([merged.startRow, merged.endRow, merged.startColumn, merged.endColumn], [2, 3, 1, 3])
        r.nativeMerge = true
        const cell = 'B3'
        await select(cell)
        await page.waitForFunction(
          () =>
            document.activeElement?.getAttribute('contenteditable') === 'true' &&
            document.getSelection().rangeCount > 0,
        )
        await page.keyboard.type('MERGED-LABEL')
        await page.keyboard.press('Enter')
        await page.waitForFunction(
          (address) =>
            window.univerAPI.getActiveWorkbook().getActiveSheet().getRange(address).getRawValue() === 'MERGED-LABEL',
          cell,
        )
        await select('B3')
        const beforeUnmerge = await save()
        await root.screenshot({ path: path.join(out, locale + '-native-merged.png') })
        await menu('Cancel merge')
        await page.waitForFunction(() => !window.univerAPI.getActiveWorkbook().save().sheets.practice.mergeData?.length)
        const afterUnmerge = await save()
        await select('B3')
        await page.keyboard.press('Control+z')
        await page.waitForFunction(
          () => window.univerAPI.getActiveWorkbook().save().sheets.practice.mergeData?.length === 1,
        )
        assert.deepEqual(await save(), beforeUnmerge)
        await page.keyboard.press('Control+y')
        await page.waitForFunction(() => !window.univerAPI.getActiveWorkbook().save().sheets.practice.mergeData?.length)
        assert.deepEqual(await save(), afterUnmerge)
        r.nativeUnmergeUndoRedo = true
        for (const [method, expected] of [
          ['merge', 1],
          ['mergeAcross', 2],
          ['mergeVertically', 3],
        ]) {
          await page.evaluate(
            (operation) => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('B10:D11')[operation](),
            method,
          )
          const merges = (await save()).sheets.practice.mergeData
          assert.equal(merges.length, expected, method)
          for (const merge of merges) {
            assert.equal(merge.startRow, method === 'mergeAcross' ? merge.endRow : 9)
            assert.equal(merge.endRow, method === 'mergeAcross' ? merge.startRow : 10)
            if (method === 'mergeVertically') assert.equal(merge.startColumn, merge.endColumn)
          }
          await page.evaluate(() =>
            window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('B10:D11').breakApart(),
          )
          assert.equal((await save()).sheets.practice.mergeData.length, 0)
        }
        assert.deepEqual((await save()).sheets.gallery, initial.sheets.gallery)
        r.publicFacadeVariants = ['merge', 'mergeAcross', 'mergeVertically', 'breakApart']
        const snapshot = await page.evaluate(() => {
          window.originalOwner = window.univerAPI
          return window.univerAPI.getActiveWorkbook().save()
        })
        assert.equal(snapshot.sheetOrder.length, 2)
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
