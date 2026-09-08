/* eslint-disable no-await-in-loop -- Verify both locales and themes in the actual selected Preview. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

const { createServer } = await import(pathToFileURL(process.env.SHOWCASE_VITE_MODULE).href)
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/slides-text-native-gallery')
await fs.mkdir(directory, { recursive: true })
const sources = (
  await Promise.all(
    ['create-demo.ts', 'data.ts'].map((name) =>
      fs.readFile('showcase/slides/text-editing-and-autofit/code/' + name, 'utf8'),
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
        return `import React from 'react'; import {createRoot} from 'react-dom/client'; import {ThemeProvider} from 'next-themes'; import Preview from '/showcase/slides/text-editing-and-autofit/preview/main.tsx'; const root=createRoot(document.getElementById('app')); root.render(React.createElement(ThemeProvider,{attribute:'class',defaultTheme:'light'},React.createElement(Preview))); window.unmountPreview=()=>root.unmount();`
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
const save = () => page.evaluate(() => window.univerAPI.getActivePresentation().save())
const settle = () =>
  page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
try {
  for (const locale of ['en-US', 'zh-CN']) {
    await page.goto('http://127.0.0.1:4428/?locale=' + locale, { timeout: 180000 })
    await page.locator('.slide-text-demo[data-ready="true"]').waitFor({ timeout: 120000 })
    await page.waitForFunction(
      () => window.univerAPI.getCurrentLifecycleStage() >= window.univerAPI.Enum.LifecycleStages.Steady,
    )
    await settle()
    const thumbs = page.locator('[data-u-comp="slide-thumbnail-item"]')
    assert.equal(await thumbs.count(), 3)
    const wb = page.locator('[data-u-comp="workbench-layout"]')
    assert.equal(await wb.evaluate((e) => getComputedStyle(e).backgroundColor), 'rgb(255, 255, 255)')
    assert.match(await wb.evaluate((e) => getComputedStyle(e).fontFamily), /Arial/)
    await page.getByRole('tab', { name: locale === 'zh-CN' ? '开始' : 'Start', exact: true }).waitFor()
    assert.equal(
      await page.locator('.slide-text-demo > button,.slide-text-demo > fieldset,.slide-text-demo > details').count(),
      0,
    )
    for (const [index, id] of ['welcome', 'workshops', 'invitation'].entries()) {
      await thumbs.nth(index).click()
      await page.waitForFunction((id) => window.univerAPI.getActivePresentation().getActiveSlide().getId() === id, id)
      await settle()
      await page.screenshot({ path: path.join(directory, locale + '-' + id + '.png') })
    }
    await thumbs.first().click()
    await page.waitForFunction(() => window.univerAPI.getActivePresentation().getActiveSlide().getId() === 'welcome')
    await settle()
    // Main-slide text position verified in the fixed 1600 × 1100 screenshot.
    await page.mouse.dblclick(560, 470)
    await page.locator('[data-u-comp="shape-text-editor-content"]').filter({ visible: true }).waitFor()
    await page.keyboard.press('Control+End')
    await page.keyboard.type(' Native edit.')
    // Clicking the empty slide commits; Escape cancels the active native text edit.
    await page.mouse.click(1350, 650)
    await thumbs.nth(1).click()
    await page.waitForFunction(() =>
      window.univerAPI
        .getActivePresentation()
        .getSlideByIndex(0)
        .getShape('editable-copy')
        .getText()
        .getPlainText()
        .includes('Native edit.'),
    )
    await thumbs.first().click()
    await settle()
    await page.screenshot({ path: path.join(directory, locale + '-edited.png') })
    const snapshot = await save()
    await page.evaluate(() => {
      window.originalOwner = window.univerAPI
    })
    for (const theme of ['dark', 'light']) {
      await page.evaluate((value) => {
        const oldValue = localStorage.getItem('theme')
        localStorage.setItem('theme', value)
        window.dispatchEvent(
          new StorageEvent('storage', { key: 'theme', oldValue, newValue: value, storageArea: localStorage }),
        )
      }, theme)
      await page.waitForFunction((dark) => window.univerAPI.isDarkMode() === dark, theme === 'dark')
      await settle()
      assert.equal(await page.evaluate(() => window.univerAPI === window.originalOwner), true)
      assert.deepEqual(await save(), snapshot)
      await page.screenshot({ path: path.join(directory, locale + '-' + theme + '.png') })
    }
    report.locales.push({ locale, nativeEditing: true, nativeThreePageGallery: true, themeOwnerAndFullSave: true })
    await page.evaluate(() => window.unmountPreview())
    await page.waitForTimeout(200)
    assert.equal(await page.locator('.slide-text-demo').count(), 0)
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
