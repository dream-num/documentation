/* eslint-disable no-await-in-loop -- Selected native embeds must be exercised sequentially. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { isDeepStrictEqual } from 'node:util'

import { chromium } from 'playwright'

const { createServer } = await import(pathToFileURL(process.env.SHOWCASE_VITE_MODULE).href)
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-sheet-board-themes')
await fs.mkdir(directory, { recursive: true })
const specimens = [
  {
    kind: 'float',
    root: '.tidal-embed',
    host: 'tidal-berth-costs',
    child: 'tidal-dock-handoff',
    sheet: 'shift-estimate',
    shape: 'hold',
    page: 'handoff',
    value: 20,
    total: 'D18',
    expected: 2376,
  },
  {
    kind: 'tab',
    root: '.ember-embed',
    host: 'ember-incident-costs',
    child: 'ember-incident-review',
    sheet: 'loss-estimate',
    shape: 'guardrail',
    page: 'incident',
    value: 400,
    total: 'D16',
    expected: 9096.5,
  },
]
const sources = (
  await Promise.all(
    specimens.flatMap(({ kind }) =>
      ['create-demo.ts', 'data.ts'].map((name) =>
        fs.readFile(`showcase/embed/boards-in-sheets-${kind}/code/${name}`, 'utf8'),
      ),
    ),
  )
).join('\n')
const dependencies = [
  ...new Set(
    [...sources.matchAll(/(?:from\s*|import\s*)['"](@[^'"]+)['"]/g)]
      .map((match) => match[1])
      .filter((name) => !name.endsWith('.css')),
  ),
]
const port = Number(process.env.SHOWCASE_PORT || 4429)
const server = await createServer({
  configFile: false,
  root: process.cwd(),
  appType: 'custom',
  cacheDir: path.join(directory, '.vite'),
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
      name: 'selected-sheet-board-previews',
      configureServer(vite) {
        vite.middlewares.use((req, res, next) => {
          if (!req.url?.startsWith('/?kind=')) return next()
          const query = new URL(req.url, 'http://localhost').searchParams
          const kind = query.get('kind') === 'tab' ? 'tab' : 'float'
          const locale = query.get('locale') === 'zh-CN' ? 'zh-CN' : 'en-US'
          res.setHeader('Content-Type', 'text/html')
          res.end(
            `<html lang="${locale}"><head><link rel="icon" href="data:,"><style>html,body,#app,.h-full{height:100%;margin:0}.min-h-0{min-height:0}</style></head><body><div id="app"></div><script type="module" src="/board-theme-${kind}.jsx"></script></body></html>`,
          )
        })
      },
      resolveId(id) {
        if (/^\/board-theme-(float|tab)\.jsx$/.test(id)) return '\0' + id.slice(1)
      },
      load(id) {
        const match = id.match(/^\0board-theme-(float|tab)\.jsx$/)
        if (!match) return
        return `import React from 'react';import {createRoot} from 'react-dom/client';import {ThemeProvider} from 'next-themes';import Preview from '/showcase/embed/boards-in-sheets-${match[1]}/preview/main.tsx';const root=createRoot(document.getElementById('app'));root.render(React.createElement(ThemeProvider,{attribute:'class',defaultTheme:'light'},React.createElement(Preview)));window.unmountPreview=()=>root.unmount();`
      },
    },
  ],
})
await server.listen()
const browser = await chromium.launch()
const report = { passed: false, cases: [], errors: [] }
try {
  for (const specimen of specimens)
    for (const locale of ['en-US', 'zh-CN']) {
      const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } })
      const record = { kind: specimen.kind, locale, passed: false }
      report.cases.push(record)
      page.on('pageerror', (error) => report.errors.push(error.message))
      page.on('console', (message) => {
        if (message.type() === 'error') report.errors.push(message.text())
      })
      await page.addInitScript(() => {
        window.painted = []
        const original = CanvasRenderingContext2D.prototype.fillText
        CanvasRenderingContext2D.prototype.fillText = function (...args) {
          window.painted.push(String(args[0]))
          return Reflect.apply(original, this, args)
        }
      })
      const snapshots = () =>
        page.evaluate(
          ({ host, child }) => ({
            host: window.univerAPI.getWorkbook(host).save(),
            child: window.univerAPI.getBoard(child).save(),
          }),
          specimen,
        )
      try {
        await page.goto(`http://127.0.0.1:${port}/?kind=${specimen.kind}&locale=${locale}`, { timeout: 180000 })
        await page.waitForFunction(
          (selector) => document.querySelector(selector)?.dataset.ready === 'true',
          specimen.root,
          { timeout: 120000 },
        )
        assert.equal(await page.locator(specimen.root).getAttribute('data-error'), null)
        const nativeStyles = await page
          .locator('[data-u-comp="workbench-layout"]')
          .first()
          .evaluate((el) => ({
            background: getComputedStyle(el).backgroundColor,
            font: getComputedStyle(el).fontFamily,
            flex: getComputedStyle(el.querySelector('.univer-flex')).display,
          }))
        assert.equal(nativeStyles.background, 'rgb(255, 255, 255)')
        assert.equal(nativeStyles.flex, 'flex')
        assert.match(nativeStyles.font, /Arial/)
        const tab = (name) => page.locator('[data-u-comp="slide-tab-item"]').filter({ hasText: name })
        if (specimen.kind === 'tab') await tab('Loss estimate').click()
        await page.locator('[data-u-comp="ribbon-grid-toolbar"]').first().waitFor()
        if (specimen.kind === 'tab') await tab('Incident timeline').click()
        else {
          await page.locator('[data-u-comp="embed-float-dom"]').dblclick({ position: { x: 300, y: 180 } })
          await page.waitForFunction(
            () =>
              document.querySelector('[data-u-comp="embed-float-dom"]')?.getAttribute('data-embed-float-stage') ===
              'stage2',
          )
        }
        const original = await snapshots()
        await page.evaluate(
          ({ host, sheet, value }) =>
            window.univerAPI.getWorkbook(host).getSheetBySheetId(sheet).getRange('B5').setValue(value),
          specimen,
        )
        await page.waitForFunction(
          ({ host, sheet, total, expected }) =>
            window.univerAPI.getWorkbook(host).getSheetBySheetId(sheet).getRange(total).getRawValue() === expected,
          specimen,
        )
        assert.deepEqual((await snapshots()).child, original.child)
        const hostEdited = (await snapshots()).host
        await page.evaluate(({ child, shape }) => {
          window.painted = []
          window.univerAPI.getBoard(child).getShape(shape).getText().setText('Theme retained\nReview in progress')
        }, specimen)
        await page.waitForFunction(() => window.painted.join('').includes('Review in progress'))
        assert.deepEqual((await snapshots()).host, hostEdited)
        const edited = await snapshots()
        assert.notDeepEqual(edited.host, original.host)
        assert.notDeepEqual(edited.child, original.child)
        await page.evaluate((selector) => {
          window.originalOwner = window.univerAPI
          window.originalRoot = document.querySelector(selector)
        }, specimen.root)
        record.themes = []
        for (const theme of ['dark', 'light']) {
          await page.evaluate((value) => {
            const oldValue = localStorage.getItem('theme')
            localStorage.setItem('theme', value)
            window.dispatchEvent(
              new StorageEvent('storage', { key: 'theme', oldValue, newValue: value, storageArea: localStorage }),
            )
          }, theme)
          await page.waitForFunction((dark) => window.univerAPI.isDarkMode() === dark, theme === 'dark')
          await page.evaluate(
            () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
          )
          assert.equal(
            await page.evaluate(
              (selector) =>
                window.originalOwner === window.univerAPI && window.originalRoot === document.querySelector(selector),
              specimen.root,
            ),
            true,
          )
          const themed = await snapshots()
          const fullSnapshotPreserved = isDeepStrictEqual(themed, edited)
          record.themes.push({ theme, fullSnapshotPreserved })
          // Diagnose SDK theme serialization without treating it as an exact-roundtrip pass.
          assert.deepEqual(themed.host, edited.host)
          assert.deepEqual({ ...themed.child, theme: edited.child.theme }, edited.child)
          if (!fullSnapshotPreserved)
            await fs.writeFile(
              path.join(directory, `${specimen.kind}-${locale}-${theme}-theme-diff.json`),
              JSON.stringify({ before: edited.child.theme, after: themed.child.theme }, null, 2),
            )
          await page.screenshot({ path: path.join(directory, `${specimen.kind}-${locale}-${theme}.png`) })
        }
        if (specimen.kind === 'tab') {
          const themedChild = (await snapshots()).child
          await tab('Loss estimate').click()
          await tab('Incident timeline').click()
          assert.deepEqual((await snapshots()).child, themedChild)
        }
        // Exercise an actual Board canvas drag after theme updates, not just model reads.
        const canvas = page.locator('[data-board-canvas-view="true"]').first()
        const view = await canvas.evaluate((el) => ({
          zoom: Number(el.getAttribute('data-zoom-ratio')),
          pan: el.getAttribute('data-pan-offset').split(',').map(Number),
        }))
        const bounds = await canvas.locator('canvas').first().boundingBox()
        assert.ok(bounds)
        const boardPage = Object.values(edited.child.pages).find((item) => item.elements[specimen.shape])
        const shape = boardPage.elements[specimen.shape].transform
        const x = bounds.x + view.pan[0] + (shape.left + shape.width / 2) * view.zoom
        const y = bounds.y + view.pan[1] + (shape.top + shape.height / 2) * view.zoom
        await page.mouse.move(x, y)
        await page.mouse.down()
        await page.mouse.move(x + 24 * view.zoom, y + 18 * view.zoom, { steps: 10 })
        await page.mouse.up()
        await page.waitForFunction(
          ({ child, shape: shapeId, left }) =>
            Object.values(window.univerAPI.getBoard(child).save().pages).find((item) => item.elements[shapeId])
              .elements[shapeId].transform.left !== left,
          { ...specimen, left: shape.left },
        )
        assert.deepEqual((await snapshots()).host, edited.host)
        record.nativeDragAfterTheme = true
        await page.evaluate(() => window.unmountPreview())
        await page.waitForTimeout(250)
        assert.equal(await page.locator(specimen.root).count(), 0)
        assert.equal(await page.evaluate(() => window.univerAPI === undefined), true)
        record.unmount = true
        assert.ok(
          record.themes.every((item) => item.fullSnapshotPreserved),
          'SDK changed the serialized Board theme; full snapshot preservation remains unverified',
        )
        record.passed = true
      } catch (error) {
        record.failure = error.stack
        await page.screenshot({ path: path.join(directory, `${specimen.kind}-${locale}-failure.png`) }).catch(() => {})
      } finally {
        await page.close()
      }
    }
  assert.deepEqual(report.errors, [])
  assert.ok(
    report.cases.every((record) => record.passed),
    JSON.stringify(report.cases),
  )
  report.passed = true
} catch (error) {
  report.failure = error.stack
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
  await server.close()
}
console.log(JSON.stringify(report))
assert.equal(report.passed, true)
