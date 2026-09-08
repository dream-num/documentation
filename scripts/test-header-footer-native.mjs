/* eslint-disable no-await-in-loop -- Verify both locales and themes in the actual selected Preview. */
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
const slug = 'headers-footers-and-section-links'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/header-footer-native')
await fs.mkdir(directory, { recursive: true })
const sources = (
  await Promise.all(
    ['create-demo.ts', 'data.ts'].map((name) =>
      fs.readFile('showcase/docs-traditional/' + slug + '/code/' + name, 'utf8'),
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
  server: { host: '127.0.0.1', port: 4450, strictPort: true, watch: { ignored: ['**/.next/**'] } },
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
        return `import React from 'react'; import {createRoot} from 'react-dom/client'; import {ThemeProvider} from 'next-themes'; import Preview from '/showcase/docs-traditional/${slug}/preview/main.tsx'; const root=createRoot(document.getElementById('app')); root.render(React.createElement(ThemeProvider,{attribute:'class',defaultTheme:'light'},React.createElement(Preview))); window.unmountPreview=()=>root.unmount();`
      },
    },
  ],
})
await server.listen()
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1200 } })
const report = { passed: false, locales: [], errors: [] }
page.on('pageerror', (e) => report.errors.push(e.message))
page.on('console', (e) => {
  if (e.type() === 'error') report.errors.push(e.text())
})
await page.addInitScript(() => {
  window.paint = []
  const original = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (text, x, y, ...args) {
    const m = this.getTransform(),
      r = this.canvas.getBoundingClientRect()
    if (window.paint.length < 100000)
      window.paint.push({
        text: String(text),
        x: r.x + ((m.a * x + m.c * y + m.e) * r.width) / this.canvas.width,
        y: r.y + ((m.b * x + m.d * y + m.f) * r.height) / this.canvas.height,
      })
    return original.call(this, text, x, y, ...args)
  }
})
const save = () => page.evaluate(() => window.univerAPI.getActiveDocument().save())
const recipes = [
  ...(await fs.readFile('showcase/docs-traditional/headers-footers-and-section-links/README.md', 'utf8')).matchAll(
    /```ts\r?\n([\s\S]*?)```/g,
  ),
].map((m) => m[1])
try {
  for (const locale of ['en-US', 'zh-CN']) {
    await page.goto('http://127.0.0.1:4450/?locale=' + locale, { timeout: 120000 })
    await page.locator('.header-footer-gallery[data-ready=true]').waitFor({ timeout: 60000 })
    await page.waitForFunction(
      () => window.univerAPI.getCurrentLifecycleStage() >= window.univerAPI.Enum.LifecycleStages.Steady,
    )
    assert.equal(await page.locator('html').getAttribute('lang'), locale)
    assert.doesNotMatch(await page.locator('.header-footer-gallery').innerText(), /[\u3400-\u9fff]/)
    const initial = await save()
    assert.equal(initial.locale, 'enUS')
    const result = { locale, initial, layout: null, recipes: [] }
    report.locales.push(result)
    result.layout = await page.evaluate(() => {
      const api = window.univerAPI,
        doc = api.getActiveDocument(),
        injector = api._injector
      const key = [...injector.resolvedDependencyCollection.resolvedDependencies.keys()].find(
        (k) => String(k) === 'engine-render.render-manager.service',
      )
      const skeleton = injector.get(key).getRenderUnitById(doc.getId()).mainComponent._skeleton
      return {
        pages: skeleton._skeletonData.pages.map((p) => ({
          sectionId: p.sectionId,
          headerId: p.headerId,
          footerId: p.footerId,
          pageNumber: p.pageNumber,
        })),
        sections: doc.getSections().map((s) => s.describe()),
      }
    })
    await page.screenshot({ path: path.join(directory, locale + '-initial.png') })
    assert.equal(result.layout.pages.length, 6, 'Six real physical pages')
    assert.equal(result.layout.sections.length, 2)
    for (const [index, variant] of ['first', 'even', 'default', 'even', 'default', 'even'].entries()) {
      const section = result.layout.sections[index < 3 ? 0 : 1]
      assert.equal(result.layout.pages[index].headerId, section.headerFooter[variant + 'Header'].segmentId)
      assert.equal(result.layout.pages[index].footerId, section.headerFooter[variant + 'Footer'].segmentId)
    }
    await page.mouse.move(800, 500)
    for (let i = 1; i < 6; i++) {
      const before = await page.evaluate(() => window.paint.length)
      await page.mouse.wheel(0, 500)
      await page.waitForFunction((n) => window.paint.length > n, before)
      await page.screenshot({ path: path.join(directory, locale + '-leaf-' + (i + 1) + '.png') })
    }
    const painted = await page.evaluate(() => window.paint.map((p) => p.text).join(''))
    for (const text of [
      'FIELD NOTES / FIRST',
      'FIELD NOTES / EVEN',
      'FIELD NOTES / DEFAULT',
      'LOCAL / FIELD NOTES / DEFAULT',
      'ARCHIVE COPY / FIRST',
      'ARCHIVE COPY / EVEN',
      'ARCHIVE COPY / DEFAULT',
    ])
      assert.ok(painted.includes(text), 'Actual native glyph paint: ' + text)
    result.paintedHeaders = true
    const beforeTop = await page.evaluate(() => window.paint.length)
    await page.mouse.wheel(0, -10000)
    await page.waitForFunction((n) => window.paint.length > n, beforeTop)
    await fs.writeFile(path.join(directory, locale + '-ui.txt'), await page.locator('body').innerText())
    const button = page.getByRole('button', { name: 'Header & Footer', exact: true })
    await button.click()
    await page.getByText('Header & footer settings are disabled', { exact: true }).waitFor()
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
    await page.screenshot({ path: path.join(directory, locale + '-before-doubleclick.png') })
    await page.mouse.dblclick(630, 183)
    await page.getByText('Different first page', { exact: true }).waitFor()
    await page.screenshot({ path: path.join(directory, locale + '-panel.png') })
    await fs.writeFile(path.join(directory, locale + '-panel.txt'), await page.locator('body').innerText())
    await page.getByText('Different first page', { exact: true }).click()
    await page.waitForFunction(
      () => window.univerAPI.getActiveDocument().getSection(0).getConfig().useFirstPageHeaderFooter === 0,
    )
    await page.getByText('Different first page', { exact: true }).click()
    await page.waitForFunction(
      () => window.univerAPI.getActiveDocument().getSection(0).getConfig().useFirstPageHeaderFooter === 1,
    )
    await page.getByText('Different odd and even pages', { exact: true }).click()
    await page.waitForFunction(
      () => window.univerAPI.getActiveDocument().getSection(0).getConfig().evenAndOddHeaders === 0,
    )
    await page.getByText('Different odd and even pages', { exact: true }).click()
    await page.waitForFunction(
      () => window.univerAPI.getActiveDocument().getSection(0).getConfig().evenAndOddHeaders === 1,
    )
    await page.mouse.dblclick(630, 183)
    await page.keyboard.press('Home')
    await page.keyboard.type('NATIVE ')
    await page.waitForFunction(() =>
      JSON.stringify(window.univerAPI.getActiveDocument().save().headers).includes('NATIVE '),
    )
    result.nativeHeaderEdit = true
    await page.screenshot({ path: path.join(directory, locale + '-native-edit.png') })
    await page.getByRole('button', { name: 'Close header & footer', exact: true }).click()
    let recipeScroll = 0
    for (let i = 0; i < recipes.length; i++) {
      await page.evaluate((code) => new Function(code)(), recipes[i])
      const value = await page.evaluate(() => {
        const doc = window.univerAPI.getActiveDocument(),
          a = doc.getSection(0),
          b = doc.getSection(1)
        return {
          first: a.getConfig(),
          sameHeader: a.getHeaderId() === b.getHeaderId(),
          linked: b.isHeaderLinkedToPrevious(),
          snapshot: doc.save(),
        }
      })
      if (i === 0) assert.ok(JSON.stringify(value.snapshot).includes('REVIEWED / '))
      if (i === 1) assert.equal(value.first.useFirstPageHeaderFooter, 0)
      if (i === 2) assert.equal(value.sameHeader, true)
      if (i === 3) {
        assert.equal(value.sameHeader, false)
        assert.equal(value.linked, false)
        assert.ok(JSON.stringify(value.snapshot).includes('SECOND SECTION / '))
      }
      result.recipes.push(value)
      const targetScroll = i === 0 ? 1000 : i === 1 ? 0 : 2000
      await page.mouse.move(800, 500)
      await page.mouse.wheel(0, targetScroll - recipeScroll)
      recipeScroll = targetScroll
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
      await page.screenshot({ path: path.join(directory, locale + '-recipe-' + (i + 1) + '.png') })
    }
    const edited = await save()
    await page.evaluate(() => {
      window.originalOwner = window.univerAPI
    })
    for (const theme of ['dark', 'light']) {
      await page.evaluate((value) => {
        localStorage.setItem('theme', value)
        window.dispatchEvent(new StorageEvent('storage', { key: 'theme', newValue: value }))
      }, theme)
      await page.waitForFunction((value) => document.documentElement.classList.contains(value), theme)
      assert.equal(await page.evaluate(() => window.originalOwner === window.univerAPI), true)
      assert.deepEqual(await save(), edited)
      await page.screenshot({ path: path.join(directory, locale + '-' + theme + '.png') })
    }
    await page.evaluate(() => window.unmountPreview())
    await page.waitForFunction(() => !window.univerAPI && !document.querySelector('.header-footer-gallery'))
  }
  assert.deepEqual(report.errors, [])
  report.passed = true
} catch (e) {
  report.failure = e.stack
  await page.screenshot({ path: path.join(directory, 'failure.png') })
  await fs.writeFile(path.join(directory, 'failure-ui.txt'), await page.locator('body').innerText())
  process.exitCode = 1
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(
    JSON.stringify({ passed: report.passed, failure: report.failure, report: path.join(directory, 'report.json') }),
  )
  await browser.close()
  await server.close()
}
