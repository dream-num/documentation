/* eslint-disable no-await-in-loop -- Verify both locales and themes in the actual selected Preview. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

const { createServer } = await import(pathToFileURL(process.env.SHOWCASE_VITE_MODULE).href)
const slug = 'number-format-gallery'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/number-format-gallery-native')
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
        return `import React from 'react'; import {createRoot} from 'react-dom/client'; import {ThemeProvider} from 'next-themes'; import Preview from '/showcase/sheets/${slug}/preview/main.tsx'; const root=createRoot(document.getElementById('app')); root.render(React.createElement(ThemeProvider,{attribute:'class',defaultTheme:'light'},React.createElement(Preview))); window.unmountPreview=()=>root.unmount();`
      },
    },
  ],
})
await server.listen()
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1200 } })
await page.addInitScript(() => {
  window.nativePaint = []
  const fillText = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (text, ...args) {
    if (window.nativePaint.length < 30000) window.nativePaint.push({ text: String(text) })
    return fillText.call(this, text, ...args)
  }
})
const report = { passed: false, locales: [], errors: [], networkWrites: [] }
page.on('pageerror', (e) => report.errors.push(e.message))
page.on('console', (e) => {
  if (e.type() === 'error') report.errors.push(e.text())
})
page.on('request', (r) => {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(r.method())) report.networkWrites.push(r.url())
})
const save = () => page.evaluate(() => window.univerAPI.getActiveWorkbook().save())
const settle = () =>
  page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
try {
  for (const locale of ['en-US', 'zh-CN']) {
    await page.goto('http://127.0.0.1:4428/?locale=' + locale, { timeout: 180000 })
    await page.locator('.number-format-gallery[data-ready="true"]').waitFor({ timeout: 120000 })
    await page.waitForFunction(
      () => window.univerAPI.getCurrentLifecycleStage() >= window.univerAPI.Enum.LifecycleStages.Steady,
    )
    await settle()
    const wb = page.locator('[data-u-comp="workbench-layout"]')
    await page.getByRole('tab', { name: 'Start', exact: true }).waitFor()
    assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), 'enUS')
    assert.equal(await wb.evaluate((e) => getComputedStyle(e).backgroundColor), 'rgb(255, 255, 255)')
    assert.match(await wb.evaluate((e) => getComputedStyle(e).fontFamily), /Arial/)
    await page.screenshot({ path: path.join(directory, locale + '-initial.png') })
    const values = await page.evaluate(() => {
      const sheet = window.univerAPI.getActiveWorkbook().getActiveSheet()
      return ['C5', 'C13', 'C14', 'C18', 'C19', 'C20', 'C21', 'C22', 'C23', 'C24'].map((a) => ({
        value: sheet.getRange(a).getRawValue(),
        display: sheet.getRange(a).getDisplayValue(),
      }))
    })
    assert.deepEqual(
      values.map((v) => v.value),
      [1234.5678, 1.125, 1.125, 0, 1234.5, -85.25, 0, 2.375, 2.375, 0.3333333333],
    )
    assert.deepEqual(
      values.map((v) => v.display.replace(/\s+/g, ' ').trim()),
      ['1,234.57', '27:00', '03:00', '—', '$1,234.50', '$(85.25)', '$-', '2 3/8', '2 6/16', '1/3'],
    )
    await page.waitForFunction(() =>
      ['1,234.50', '85.25', '3/8', '6/16', '1/3'].every((t) => window.nativePaint.some((p) => p.text.includes(t))),
    )
    const box = page.locator('input.univer-size-full')
    for (const [address, text, expected] of [
      ['C19', '-640.5', '$(640.50)'],
      ['C22', '1.625', '1 5/8'],
    ]) {
      await box.fill(address)
      await box.press('Enter')
      await page.keyboard.type(text)
      await page.keyboard.press('Enter')
      await page.waitForFunction(
        ([a, v]) => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange(a).getRawValue() === Number(v),
        [address, text],
      )
      const display = await page.evaluate(
        (a) => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange(a).getDisplayValue(),
        address,
      )
      assert.equal(display.replace(/\s+/g, ' ').trim(), expected)
    }
    const raw = await page.evaluate(() =>
      ['B19', 'B22'].map((a) => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange(a).getRawValue()),
    )
    assert.deepEqual(raw, [1234.5, 2.375])
    await page.waitForFunction(() => ['640.50', '5/8'].every((t) => window.nativePaint.some((p) => p.text.includes(t))))
    await settle()
    await page.screenshot({ path: path.join(directory, locale + '-edited.png') })
    const snapshot = await save()
    await page.evaluate(() => {
      window.originalOwner = window.univerAPI
    })
    for (const theme of ['dark', 'light']) {
      await page.evaluate((value) => {
        window.nativePaint = []
        const oldValue = localStorage.getItem('theme')
        localStorage.setItem('theme', value)
        window.dispatchEvent(
          new StorageEvent('storage', { key: 'theme', oldValue, newValue: value, storageArea: localStorage }),
        )
      }, theme)
      await page.waitForFunction((dark) => window.univerAPI.isDarkMode() === dark, theme === 'dark')
      await page.locator('[data-u-comp^="workbench-skeleton-"]').first().waitFor({ state: 'detached' })
      await page.getByRole('tab', { name: 'Start', exact: true }).click({ trial: true })
      await page
        .locator('[data-u-command="sheet.command.set-range-text-color"][data-disabled="false"]')
        .first()
        .click({ trial: true })
      await page.waitForFunction(() =>
        ['640.50', '5/8'].every((text) => window.nativePaint.some((paint) => paint.text.includes(text))),
      )
      await page.evaluate(async () => {
        await document.fonts.ready
        await Promise.all(
          document
            .getAnimations()
            .filter((animation) => animation.effect?.getTiming().iterations !== Infinity)
            .map((animation) =>
              animation.finished.catch((error) => {
                if (error.name !== 'AbortError') throw error
              }),
            ),
        )
      })
      await settle()
      assert.equal(await page.evaluate(() => window.univerAPI === window.originalOwner), true)
      assert.deepEqual(await save(), snapshot)
      await fs.writeFile(
        path.join(directory, locale + '-' + theme + '-toolbar.html'),
        await page.locator('[data-u-comp="ribbon-grid-toolbar"]').innerHTML(),
      )
      await page.screenshot({ path: path.join(directory, locale + '-' + theme + '.png') })
    }
    report.locales.push({ locale, nativeEditing: true, accountingAndFractions: true, themeOwnerAndFullSave: true })
    await page.evaluate(() => window.unmountPreview())
    await page.waitForTimeout(200)
    assert.equal(await page.locator('.number-format-gallery').count(), 0)
    assert.equal(await page.evaluate(() => window.univerAPI === undefined), true)
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
