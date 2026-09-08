/* eslint-disable no-await-in-loop -- Verify both locales and themes in the actual selected Preview. */
/* eslint-disable no-shadow -- Browser callbacks execute in an isolated JavaScript context. */
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
const slug = 'connectors-and-endpoints'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/slides-connectors-native')
await fs.mkdir(directory, { recursive: true })
const sources = (
  await Promise.all(
    ['create-demo.ts', 'data.ts'].map((name) => fs.readFile('showcase/slides/' + slug + '/code/' + name, 'utf8')),
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
        return `import React from 'react'; import {createRoot} from 'react-dom/client'; import {ThemeProvider} from 'next-themes'; import Preview from '/showcase/slides/${slug}/preview/main.tsx'; const root=createRoot(document.getElementById('app')); root.render(React.createElement(ThemeProvider,{attribute:'class',defaultTheme:'light'},React.createElement(Preview))); window.unmountPreview=()=>root.unmount();`
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

await page.addInitScript(() => localStorage.setItem('theme', 'light'))
const save = () => page.evaluate(() => window.univerAPI.getActivePresentation().save())
const read = (id) =>
  page.evaluate((id) => {
    const s = window.univerAPI.getActivePresentation().getSlideById(id),
      c = s.getShape(id + '-connector')
    return {
      start: c.getStartEndpoint(),
      end: c.getEndEndpoint(),
      route: c.getRoutePoints(),
      arrow: c.getEndArrow(),
      target: s.getShape(id + '-b').getTransform(),
    }
  }, id)
const shot = (name) => page.screenshot({ path: path.join(directory, name + '.png') })
async function activate(id) {
  await page.locator('[data-u-comp="slide-thumbnail-item"][data-page-id="' + id + '"]').click()
  await page.waitForFunction((id) => window.univerAPI.getActivePresentation().getActiveSlide().getId() === id, id)
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
}
const recipes = [
  ...(await fs.readFile('showcase/slides/connectors-and-endpoints/README.md', 'utf8')).matchAll(
    /```ts\s*\n([\s\S]*?)```/g,
  ),
].map((m) => m[1])
assert.equal(recipes.length, 4)
try {
  for (const locale of ['en-US', 'zh-CN']) {
    const result = { locale, initial: [], recipes: [] }
    report.locales.push(result)
    await page.goto('http://127.0.0.1:4450/?locale=' + locale, { timeout: 120000 })
    await page.locator('.slide-connectors[data-ready=true]').waitFor({ timeout: 60000 })
    await page.waitForFunction(
      () => window.univerAPI.getCurrentLifecycleStage() >= window.univerAPI.Enum.LifecycleStages.Steady,
    )
    assert.equal((await save()).locale, 'enUS')
    assert.equal(await page.locator('html').getAttribute('lang'), locale)
    assert.doesNotMatch(await page.locator('.slide-connectors').innerText(), /[\u3400-\u9fff]/)
    for (const id of ['straight', 'elbow', 'free']) {
      await activate(id)
      const value = await read(id)
      result.initial.push({ id, ...value })
      assert.ok(value.start.binding)
      assert.equal(Boolean(value.end.binding), id !== 'free')
      // The adapter exposes interior route points, not the endpoint-inclusive polyline.
      assert.equal(value.route.length, id === 'elbow' ? 2 : 0)
      await shot(locale + '-' + id)
    }
    await activate('straight')
    const before = await read('straight')
    await page.mouse.move(1230, 750)
    await page.mouse.down()
    await page.mouse.move(1190, 680, { steps: 12 })
    await page.mouse.up()
    await page.waitForFunction(
      () =>
        window.univerAPI.getActivePresentation().getSlideById('straight').getShape('straight-b').getTransform().top !==
        330,
      {},
      { timeout: 5000 },
    )
    const after = await read('straight')
    assert.deepEqual(after.end.binding, before.end.binding)
    assert.notDeepEqual(after.end.point, before.end.point)
    assert.equal(after.end.point.y - before.end.point.y, after.target.top - before.target.top)
    result.nativeMove = { before, after }
    await shot(locale + '-native-move')
    for (let i = 0; i < recipes.length; i++) {
      await activate(['straight', 'free', 'free', 'elbow'][i])
      await page.evaluate((code) => new Function(code)(), recipes[i])
      const value = await read(['straight', 'free', 'free', 'elbow'][i])
      result.recipes.push(value)
      if (i === 0) {
        assert.equal(value.target.top, 220)
        // SDK connector transforms have minimum height 1; a horizontal route differs by half a pixel.
        assert.equal(value.end.point.x, 700)
        assert.ok(Math.abs(value.end.point.y - 290) <= 0.5)
      }
      if (i === 1) assert.ok(value.end.binding)
      if (i === 2) {
        assert.equal(value.end.binding, null)
        assert.deepEqual(value.end.point, { x: 570, y: 460 })
      }
      if (i === 3)
        assert.equal(value.arrow.type, await page.evaluate(() => window.univerAPI.Enum.ShapeArrowTypeEnum.DiamondArrow))
      await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
      await shot(locale + '-recipe-' + (i + 1))
    }
    const edited = await save()
    await page.evaluate(() => (window.savedOwner = window.univerAPI))
    for (const theme of ['dark', 'light']) {
      await page.evaluate((t) => {
        localStorage.setItem('theme', t)
        window.dispatchEvent(new StorageEvent('storage', { key: 'theme', newValue: t }))
      }, theme)
      await page.waitForFunction((t) => document.documentElement.classList.contains(t), theme)
      assert.equal(await page.evaluate(() => window.savedOwner === window.univerAPI), true)
      assert.deepEqual(await save(), edited)
    }
    await page.evaluate(() => window.unmountPreview())
    await page.locator('.slide-connectors').waitFor({ state: 'detached' })
    assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
  }
  assert.deepEqual(report.errors, [])
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
