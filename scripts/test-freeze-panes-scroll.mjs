/* eslint-disable no-await-in-loop -- Verify both locales and themes in the actual selected Preview. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

const slug = 'freeze-panes'
const { createServer } = await import(pathToFileURL(process.env.SHOWCASE_VITE_MODULE).href)
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/freeze-native-scroll')
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
const settle = () =>
  page.evaluate(async () => {
    await Promise.all(
      document
        .getAnimations()
        .filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
        .map((animation) => animation.finished.catch(() => {})),
    )
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
  })
try {
  for (const locale of ['en-US', 'zh-CN']) {
    await page.goto('http://127.0.0.1:4427/?locale=' + locale, { timeout: 180000 })
    const root = page.locator('.freeze-panes-demo[data-ready=true]')
    await root.waitFor({ timeout: 120000 })
    await root.locator('[data-u-comp="ribbon-grid-toolbar"]').waitFor()
    assert.equal(await root.evaluate((el) => getComputedStyle(el).fontFamily), 'Arial, sans-serif')
    assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), 'enUS')
    const baseline = await page.evaluate(() => window.univerAPI.getActiveWorkbook().save())
    const results = []
    for (const [id, en, dx, dy, area] of [
      ['rows', 'Header rows', 0, 540, { x: 400, y: 23, width: 500, height: 55 }],
      ['columns', 'Identity columns', 550, 0, { x: 50, y: 140, width: 240, height: 270 }],
      ['both', 'Rows and columns', 550, 540, { x: 50, y: 23, width: 240, height: 55 }],
    ]) {
      await root.getByText(en, { exact: true }).first().click()
      await page.waitForFunction(
        (value) => window.univerAPI.getActiveWorkbook().getActiveSheet().getSheetId() === value,
        id,
      )
      const canvas = root.locator('canvas[id^="univer-sheet-main-canvas"]').first()
      await canvas.hover({ position: { x: 600, y: 400 } })
      await settle()
      const box = await canvas.boundingBox()
      const clip = { ...area, x: box.x + area.x, y: box.y + area.y }
      const fixedBefore = await page.screenshot({ clip })
      const bodyClip = { x: box.x + 400, y: box.y + 200, width: 400, height: 300 }
      const bodyBefore = await page.screenshot({ clip: bodyClip })
      const before = await page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().getScrollState())
      await page.mouse.wheel(dx, dy)
      await page.waitForFunction(
        ({ before: previous, dx: horizontal, dy: vertical }) => {
          const now = window.univerAPI.getActiveWorkbook().getActiveSheet().getScrollState()
          return (
            (horizontal === 0 ||
              now.sheetViewStartColumn > previous.sheetViewStartColumn ||
              now.offsetX > previous.offsetX) &&
            (vertical === 0 || now.sheetViewStartRow > previous.sheetViewStartRow || now.offsetY > previous.offsetY)
          )
        },
        { before, dx, dy },
      )
      await settle()
      assert.deepEqual(await page.screenshot({ clip }), fixedBefore, id + ': frozen region pixels stay fixed')
      assert.notDeepEqual(await page.screenshot({ clip: bodyClip }), bodyBefore, id + ': unfrozen grid actually moves')
      assert.deepEqual(
        (await page.evaluate(() => window.univerAPI.getActiveWorkbook().save())).sheets[id].cellData,
        baseline.sheets[id].cellData,
      )
      await page.screenshot({ path: path.join(directory, locale + '-' + id + '-scrolled.png') })
      results.push({
        id,
        scroll: await page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().getScrollState()),
        fixedPixels: true,
        movingBody: true,
      })
    }
    await root.getByText('View', { exact: true }).first().click()
    const freezeMenu = root.locator('[data-u-command="sheet.toolbar.sheet-frozen"]')
    await freezeMenu.click()
    await page.getByText('Cancel freeze', { exact: true }).click()
    await settle()
    assert.equal(await page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().getFrozenRows()), 0)
    assert.equal(await page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().getFrozenColumns()), 0)
    await page.mouse.click(900, 90)
    await settle()
    const rowBefore = await page.evaluate(
      () => window.univerAPI.getActiveWorkbook().getActiveSheet().getScrollState().sheetViewStartRow,
    )
    await freezeMenu.click()
    await page.getByText('Freeze first row', { exact: true }).click()
    await settle()
    const firstRow = await page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().getFreeze())
    assert.equal(firstRow.ySplit, 1)
    assert.equal(firstRow.startRow, rowBefore + 1)
    await page.mouse.click(900, 90)
    await settle()
    const columnBefore = await page.evaluate(
      () => window.univerAPI.getActiveWorkbook().getActiveSheet().getScrollState().sheetViewStartColumn,
    )
    await freezeMenu.click()
    await page.getByText('Freeze first column', { exact: true }).click()
    await settle()
    const firstColumn = await page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().getFreeze())
    assert.equal(firstColumn.xSplit, 1)
    assert.equal(firstColumn.startColumn, columnBefore + 1)
    await page.mouse.click(900, 90)
    await settle()
    await page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().scrollToCell(0, 0, 0))
    await page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('C3').activate())
    await freezeMenu.click()
    await page
      .getByText('Freeze to active cell (2 row B column)', {
        exact: true,
      })
      .click()
    assert.equal(await page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().getFrozenRows()), 2)
    assert.equal(await page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().getFrozenColumns()), 2)
    await page.mouse.click(900, 90)
    await page.evaluate(() => {
      window.__owner = window.univerAPI
      window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('E9').setValue('Edited freeze fixture')
    })
    const edited = await page.evaluate(() => window.univerAPI.getActiveWorkbook().save())
    for (const theme of ['dark', 'light']) {
      await page.evaluate((value) => {
        localStorage.setItem('theme', value)
        window.dispatchEvent(new StorageEvent('storage', { key: 'theme', newValue: value, storageArea: localStorage }))
      }, theme)
      await page.waitForFunction((value) => document.documentElement.classList.contains(value), theme)
      await settle()
      assert.equal(await page.evaluate(() => window.__owner === window.univerAPI), true)
      assert.deepEqual(await page.evaluate(() => window.univerAPI.getActiveWorkbook().save()), edited)
      await page.screenshot({ path: path.join(directory, locale + '-' + theme + '.png') })
    }
    await page.evaluate(() => window.unmountPreview())
    await page.waitForFunction(() => !window.univerAPI)
    report.locales.push({ locale, results, nativeMenu: true, firstRow, firstColumn, ownerFullSnapshot: true })
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
console.log('PASS native freeze menus, real scroll pixels and themes')
