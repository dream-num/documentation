/* eslint-disable no-await-in-loop -- Verify both locales and themes in the actual selected Preview. */
/* eslint-disable no-shadow -- Browser callbacks run in their own JavaScript context. */
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
const slug = 'pagination-rules'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/section-break-native')
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
  server: { host: '127.0.0.1', port: 4454, strictPort: true, watch: { ignored: ['**/.next/**'] } },
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
const report = { passed: false, locales: [], errors: [], failures: [] }
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
const shot = (name) => page.screenshot({ path: path.join(directory, name + '.png') })
const layout = () =>
  page.evaluate(() => {
    const api = window.univerAPI,
      doc = api.getActiveDocument(),
      inj = api._injector
    const key = [...inj.resolvedDependencyCollection.resolvedDependencies.keys()].find(
      (k) => String(k) === 'engine-render.render-manager.service',
    )
    const sk = inj.get(key).getRenderUnitById(doc.getId()).mainComponent._skeleton,
      pages = sk._skeletonData.pages,
      stream = doc.save().body.dataStream
    return {
      pages: pages.map((p) => ({ sectionId: p.sectionId, pageNumber: p.pageNumber })),
      sections: doc.getSections().map((s) => s.describe()),
      paragraphs: doc.getParagraphs().map((p) => {
        const pagesUsed = new Set()
        const range = p.getRange()
        for (let i = range.startOffset; i < range.endOffset - 1; i++) {
          if (/\s/.test(stream[i])) continue
          let n = sk.findNodeByCharIndex(i + 1)
          while (n && !pages.includes(n)) n = n.parent
          if (n) pagesUsed.add(pages.indexOf(n) + 1)
        }
        return { id: p.getInfo().paragraph.paragraphId, text: p.getText(), pages: [...pagesUsed] }
      }),
    }
  })
const recipes = [
  ...(await fs.readFile('showcase/docs-traditional/pagination-rules/README.md', 'utf8')).matchAll(
    /```ts\s*\n([\s\S]*?)```/g,
  ),
].map((m) => m[1])
assert.equal(recipes.length, 4)
try {
  for (const locale of ['en-US', 'zh-CN']) {
    const result = { locale, recipes: [] }
    report.locales.push(result)
    await page.goto('http://127.0.0.1:4454/?locale=' + locale, { timeout: 120000 })
    await page.locator('.pagination-demo[data-ready=true]').waitFor({ timeout: 60000 })
    await page.waitForFunction(
      () => window.univerAPI.getCurrentLifecycleStage() >= window.univerAPI.Enum.LifecycleStages.Steady,
    )
    assert.equal(await page.locator('html').getAttribute('lang'), locale)
    assert.equal((await save()).locale, 'enUS')
    assert.doesNotMatch(await page.locator('.pagination-demo').innerText(), /[\u3400-\u9fff]/)
    result.initial = await layout()
    await fs.writeFile(path.join(directory, locale + '-initial-layout.json'), JSON.stringify(result.initial, null, 2))
    await shot(locale + '-initial')
    const p = (id) => result.initial.paragraphs.find((p) => p.id === id).pages[0]
    assert.equal(p('break-lab-title'), p('continuous'))
    assert.equal(p('manual-after'), p('manual-before') + 1)
    assert.equal(p('next-page'), p('manual-after') + 1)
    assert.equal(p('odd-page') % 2, 1)
    assert.equal(p('even-page') % 2, 0)
    assert.equal(p('odd-page'), p('next-page') + 2)
    for (let i = 0; i < 6; i++) {
      await page.mouse.move(900, 600)
      await page.mouse.wheel(0, 480)
      await page.waitForTimeout(100)
      await shot(locale + '-leaf-' + (i + 2))
    }
    await page.mouse.wheel(0, -20000)
    await page.waitForTimeout(200)
    // The reviewed 1600×1200 viewport puts the first-page title at (568,200).
    await page.mouse.click(620, 200)
    await page.keyboard.press('Control+Home')
    const before = (await save()).body.dataStream.split('\f').length
    await page.keyboard.press('Control+Enter')
    try {
      await page.waitForFunction(
        (n) => window.univerAPI.getActiveDocument().save().body.dataStream.split('\f').length === n + 1,
        before,
        { timeout: 5000 },
      )
      result.nativePageBreak = true
    } catch (error) {
      result.nativePageBreak = false
      report.failures.push({ locale, gate: 'native Ctrl+Enter page break', error: error.message })
    }
    const count = await page.evaluate(() => window.univerAPI.getActiveDocument().getSections().length)
    await page.getByText('Insert', { exact: true }).click()
    await page.locator('[data-u-command="doc.menu.breaks"]').click()
    await fs.writeFile(path.join(directory, locale + '-break-menu.txt'), await page.locator('body').innerText())
    await page.getByText('Section Break (Next Page)', { exact: true }).click()
    try {
      await page.waitForFunction((n) => window.univerAPI.getActiveDocument().getSections().length === n + 1, count, {
        timeout: 5000,
      })
      result.nativeSectionBreak = true
    } catch (error) {
      result.nativeSectionBreak = false
      report.failures.push({ locale, gate: 'native Next Page section break', error: error.message })
    }
    await shot(locale + '-native-breaks')
    for (let i = 0; i < recipes.length; i++) {
      await page.goto('http://127.0.0.1:4454/?locale=' + locale)
      await page.locator('.pagination-demo[data-ready=true]').waitFor()
      await page.waitForFunction(
        () => window.univerAPI.getCurrentLifecycleStage() >= window.univerAPI.Enum.LifecycleStages.Steady,
      )
      const beforeLayout = await layout()
      await page.evaluate((code) => new Function(code)(), recipes[i])
      await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
      const after = await layout()
      result.recipes.push(after)
      if (i < 2) {
        const actual = await page.evaluate(() => {
          const d = window.univerAPI.getActiveDocument(),
            p = d.findParagraphs({ paragraphId: 'odd-page' })[0]
          return d.getSectionAt(p.getRange().startOffset).getConfig().sectionType
        })
        assert.equal(actual, i === 0 ? 3 : 1)
        const at = (id) => after.paragraphs.find((p) => p.id === id).pages[0]
        assert.equal(at('odd-page'), at('next-page') + (i === 0 ? 1 : 0))
      }
      if (i === 2) assert.equal(after.sections.length, beforeLayout.sections.length + 1)
      if (i === 3) {
        assert.equal(after.sections.length, beforeLayout.sections.length)
        assert.equal(
          await page.evaluate(
            () =>
              window.univerAPI
                .getActiveDocument()
                .getParagraphs()
                .find((p) => p.getText().startsWith('Continuous section:'))
                .getInfo().paragraph.paragraphStyle.pageBreakBefore,
          ),
          1,
        )
      }
      const targetId = i < 2 ? 'odd-page' : i === 2 ? 'manual-before' : 'continuous'
      const targetText = beforeLayout.paragraphs.find((p) => p.id === targetId).text
      const targetPage = after.paragraphs.find((p) => p.text === targetText).pages[0]
      await page.mouse.move(900, 600)
      await page.mouse.wheel(0, -30000)
      await page.mouse.wheel(0, (targetPage - 1) * 500)
      await page.waitForTimeout(150)
      await shot(locale + '-recipe-' + (i + 1))
    }
    const snapshot = await save()
    await page.evaluate(() => (window.savedOwner = window.univerAPI))
    for (const theme of ['dark', 'light']) {
      await page.evaluate((t) => {
        localStorage.setItem('theme', t)
        window.dispatchEvent(new StorageEvent('storage', { key: 'theme', newValue: t }))
      }, theme)
      await page.waitForFunction((t) => document.documentElement.classList.contains(t), theme)
      assert.equal(await page.evaluate(() => window.savedOwner === window.univerAPI), true)
      assert.deepEqual(await save(), snapshot)
    }
    await page.evaluate(() => window.unmountPreview())
    await page.locator('.pagination-demo').waitFor({ state: 'detached' })
    assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
  }
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.failures, [])
  report.passed = true
} catch (e) {
  report.failure = e.stack
  await shot('failure')
} finally {
  await browser.close()
  await server.close()
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify({ passed: report.passed, directory, failure: report.failure }))
  if (!report.passed) process.exitCode = 1
}
