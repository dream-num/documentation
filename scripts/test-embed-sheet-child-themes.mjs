/* eslint-disable no-await-in-loop, no-shadow -- Native child activation is ordered; browser callbacks receive serialized case data. */
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
const out = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-sheet-child-themes')
await fs.mkdir(out, { recursive: true })
const cases = [
  {
    slug: 'sheets-in-docs-block',
    root: '.northstar-embed',
    host: 'northstar-investment-brief',
    child: 'northstar-pilot-budget',
    type: 'docs',
    sheet: 'investment',
    cell: 'B7',
    value: 34,
    total: 'D14',
    expected: 41492,
  },
  {
    slug: 'sheets-in-slides-float',
    root: '.tamar-embed',
    host: 'tamar-quarterly-review',
    child: 'tamar-revenue-assumptions',
    type: 'slides',
    sheet: 'channels',
    cell: 'B5',
    value: 1800,
    total: 'F12',
    expected: 13932,
  },
]
const sources = (
  await Promise.all(
    cases.flatMap((c) =>
      ['create-demo.ts', 'data.ts'].map((n) => fs.readFile(`showcase/embed/${c.slug}/code/${n}`, 'utf8')),
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
      name: 'selected-sheet-child-previews',
      configureServer(vite) {
        vite.middlewares.use((req, res, next) => {
          if (!req.url?.startsWith('/?')) return next()
          const q = new URL(req.url, 'http://localhost').searchParams
          const slug = q.get('slug')
          if (!cases.some((c) => c.slug === slug)) return next()
          res.setHeader('Content-Type', 'text/html')
          res.end(
            `<html lang="${q.get('locale') === 'zh-CN' ? 'zh-CN' : 'en-US'}"><head><link rel="icon" href="data:,"><style>html,body,#app,.h-full{height:100%;margin:0}.min-h-0{min-height:0}</style></head><body><div id="app"></div><script type="module" src="/${slug}.jsx"></script></body></html>`,
          )
        })
      },
      resolveId(id) {
        if (cases.some((c) => id === `/${c.slug}.jsx`)) return '\0' + id
      },
      load(id) {
        const c = cases.find((c) => id === `\0/${c.slug}.jsx`)
        if (!c) return
        return `import React from 'react';import {createRoot} from 'react-dom/client';import {ThemeProvider} from 'next-themes';import Preview from '/showcase/embed/${c.slug}/preview/main.tsx';const root=createRoot(document.getElementById('app'));root.render(React.createElement(ThemeProvider,{attribute:'class',defaultTheme:'light'},React.createElement(Preview)));window.unmountPreview=()=>root.unmount();`
      },
    },
  ],
})
await server.listen()
const browser = await chromium.launch()
const results = []
try {
  for (const c of cases)
    for (const locale of ['en-US', 'zh-CN']) {
      const page = await browser.newPage({ viewport: { width: 1600, height: 1100 }, colorScheme: 'light' })
      page.setDefaultTimeout(20000)
      const r = { slug: c.slug, locale, passed: false, errors: [] }
      results.push(r)
      page.on('pageerror', (e) => r.errors.push(e.message))
      page.on('console', (m) => {
        if (m.type() === 'error') r.errors.push(m.text())
      })
      const snapshots = () =>
        page.evaluate(
          (c) => ({
            host:
              c.type === 'docs'
                ? window.univerAPI.getDocument(c.host).save()
                : window.univerAPI.getPresentation(c.host).save(),
            child: window.univerAPI.getWorkbook(c.child).save(),
          }),
          c,
        )
      try {
        await page.goto(`http://127.0.0.1:4426/?slug=${c.slug}&locale=${locale}`, { timeout: 180000 })
        const root = page.locator(c.root)
        await page.waitForFunction((selector) => document.querySelector(selector)?.dataset.ready === 'true', c.root, {
          timeout: 120000,
        })
        assert.equal(await root.getAttribute('data-error'), null)
        assert.equal(await root.evaluate((e) => getComputedStyle(e).fontFamily), 'Arial, sans-serif')
        assert.equal(
          await root
            .locator('[data-u-comp="workbench-layout"]')
            .first()
            .evaluate((e) => getComputedStyle(e).backgroundColor),
          'rgb(255, 255, 255)',
        )
        assert.equal(
          await page.evaluate(() => window.univerAPI.getCurrentLocale()),
          locale === 'zh-CN' ? 'zhCN' : 'enUS',
        )
        await root.locator('[data-u-comp="ribbon-grid-toolbar"]').waitFor()
        const child = root.locator('[data-u-comp="embed-float-dom"]')
        if (c.type === 'docs') {
          await page.mouse.move(850, 400)
          await page.mouse.wheel(0, 400)
          await child.click({ position: { x: 180, y: 130 } })
        } else await child.dblclick({ position: { x: 180, y: 130 } })
        await page.waitForFunction(
          () =>
            document.querySelector('[data-u-comp="embed-float-dom"]')?.getAttribute('data-embed-float-stage') ===
            'stage2',
        )
        r.nativeActivation = true
        const initial = await snapshots()
        // Inline Sheets omits the name box: native grid cell coordinates use authored column/row geometry.
        await child
          .locator('canvas')
          .filter({ visible: true })
          .last()
          .dblclick({ position: { x: c.type === 'docs' ? 280 : 225, y: c.type === 'docs' ? 195 : 135 } })
        await page.keyboard.press('Control+a')
        await page.keyboard.type(String(c.value))
        await page.keyboard.press('Enter')
        await page.waitForFunction(
          (c) =>
            window.univerAPI.getWorkbook(c.child).getSheetBySheetId(c.sheet).getRange(c.cell).getRawValue() === c.value,
          c,
        )
        await page.waitForFunction(
          (c) =>
            window.univerAPI.getWorkbook(c.child).getSheetBySheetId(c.sheet).getRange(c.total).getRawValue() ===
            c.expected,
          c,
        )
        assert.deepEqual((await snapshots()).host, initial.host)
        r.nativeChildEdit = true
        const childEdited = (await snapshots()).child
        await page.evaluate((c) => {
          if (c.type === 'docs') window.univerAPI.getDocument(c.host).getParagraphs()[1].appendText(' Retained review.')
          else {
            const text = window.univerAPI.getPresentation(c.host).getActiveSlide().getShape('review-title').getText()
            const rich = text.getRichText().copy()
            rich.getParagraphs()[0].getTextRuns()[0].setText('Retained quarterly review')
            text.setRichText(rich)
          }
        }, c)
        assert.deepEqual((await snapshots()).child, childEdited)
        const edited = await snapshots()
        assert.notDeepEqual(edited.host, initial.host)
        r.hostEdit = 'Public Facade narrative edit, not native keyboard'
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
          await page.evaluate(
            () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
          )
          assert.equal(await page.evaluate(() => window.originalOwner === window.univerAPI), true)
          assert.deepEqual(await snapshots(), edited)
          await root.screenshot({ path: path.join(out, `${c.type}-${locale}-${theme}.png`) })
        }
        r.fullEditedSnapshotsAndOwnerPreserved = true
        await page.evaluate(() => window.unmountPreview())
        await page.waitForTimeout(300)
        assert.equal(await root.count(), 0)
        assert.equal(await page.evaluate(() => window.univerAPI === undefined), true)
        assert.deepEqual(r.errors, [])
        r.unmount = true
        r.passed = true
      } catch (error) {
        r.failure = error.stack
        r.state = await snapshots().catch(() => null)
        await page.screenshot({ path: path.join(out, `${c.type}-${locale}-failure.png`) }).catch(() => {})
      } finally {
        await page.close()
        await fs.writeFile(path.join(out, 'report.json'), JSON.stringify(results, null, 2))
      }
    }
} finally {
  await browser.close()
  await server.close()
}
console.log(
  JSON.stringify(
    results.map(({ state: _state, ...r }) => r),
    null,
    2,
  ),
)
assert.ok(results.every((r) => r.passed))
