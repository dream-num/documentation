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
const slug = 'images-fit-and-crop'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/slides-images-native')
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
await page.addInitScript(() => {
  window.nativePaint = []
  window.imagePaint = []
  const cropRects = new WeakMap()
  const rect = CanvasRenderingContext2D.prototype.rect
  CanvasRenderingContext2D.prototype.rect = function (...args) {
    cropRects.set(this, args)
    return rect.apply(this, args)
  }
  const drawImage = CanvasRenderingContext2D.prototype.drawImage
  CanvasRenderingContext2D.prototype.drawImage = function (source, ...args) {
    if (source instanceof HTMLImageElement && source.src.startsWith('data:image/svg')) {
      const m = this.getTransform(),
        r = this.canvas.getBoundingClientRect()
      window.imagePaint.push({
        src: source.src,
        args,
        clip: cropRects.get(this),
        m: { a: m.a, b: m.b, c: m.c, d: m.d, e: m.e, f: m.f },
        rect: { x: r.x, y: r.y, width: r.width, height: r.height },
        canvas: [this.canvas.width, this.canvas.height],
      })
    }
    return drawImage.call(this, source, ...args)
  }
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
const reportPath = path.join(directory, 'report.json')
const recipes = [
  ...(await fs.readFile('showcase/slides/images-fit-and-crop/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((m) => m[1])
assert.equal(recipes.length, 4)
const save = () => page.evaluate(() => window.univerAPI.getActivePresentation().save())
const settle = () =>
  page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
async function activate(id) {
  await page.evaluate(() => {
    window.imagePaint = []
  })
  await page.locator('[data-u-comp="slide-thumbnail-item"][data-page-id="' + id + '"]').click()
  await page.waitForFunction((value) => window.univerAPI.getActivePresentation().getActiveSlide().getId() === value, id)
  await settle()
  await page.waitForFunction(() => window.imagePaint.some((p) => p.rect.width > 800))
}
try {
  for (const locale of ['en-US', 'zh-CN']) {
    const result = { locale, initial: [], recipes: [], nativeCrop: false }
    report.locales.push(result)
    await page.goto('http://127.0.0.1:4450/?locale=' + locale, { timeout: 120000 })
    await page.locator('.slide-images[data-ready=true]').waitFor({ timeout: 60000 })
    await page.waitForFunction(
      () => window.univerAPI.getCurrentLifecycleStage() >= window.univerAPI.Enum.LifecycleStages.Steady,
    )
    assert.equal(await page.locator('html').getAttribute('lang'), locale)
    assert.equal((await save()).locale, 'enUS')
    assert.doesNotMatch(await page.locator('.slide-images').innerText(), /[\u3400-\u9fff]/)
    const initial = await save()
    assert.deepEqual(initial.slideOrder, ['fit', 'crop', 'replace'])
    await activate('replace')
    for (const id of initial.slideOrder) {
      await activate(id)
      const paints = await page.evaluate(() => window.imagePaint.filter((p) => p.rect.width > 800))
      assert.ok(paints.length >= 2)
      if (id === 'crop') assert.ok(paints.some((p) => p.clip?.[2] === 180 && p.args[2] === 360 && p.args[3] === 240))
      if (id === 'fit') assert.ok(paints.some((p) => p.args[2] === 240 && p.args[3] === 160))
      if (id === 'replace') assert.equal(new Set(paints.map((p) => p.src)).size, 2)
      result.initial.push({
        id,
        draws: paints.map((paint) => ({
          args: paint.args,
          clip: paint.clip,
          source: paint.src.includes('SECOND%20SOURCE') ? 'second' : 'first',
        })),
      })
      await page.screenshot({ path: path.join(directory, locale + '-' + id + '.png') })
    }
    await activate('crop')
    await page.mouse.click(1100, 650)
    await page.getByRole('button', { name: 'Format Shape', exact: true }).waitFor()
    await page.getByRole('button', { name: 'Format Shape', exact: true }).click()
    await page.getByText('Position', { exact: true }).click()
    await page.getByText('Start Crop', { exact: true }).click()
    await settle()
    await page.screenshot({ path: path.join(directory, locale + '-crop-open.png') })
    await page.mouse.move(918, 678)
    await page.mouse.down()
    await page.mouse.move(958, 678, { steps: 8 })
    await page.mouse.up()
    await page.mouse.click(600, 950)
    await page.waitForFunction(
      () => window.univerAPI.getActivePresentation().save().slides.crop.elements['crop-sample'].crop.left === 130,
    )
    const edited = (await save()).slides.crop.elements['crop-sample']
    assert.equal(edited.transform.width, 140)
    assert.equal(edited.transform.left, 630)
    assert.equal(edited.crop.right, 90)
    await page.screenshot({ path: path.join(directory, locale + '-crop-edited.png') })
    await page.getByRole('tab', { name: 'Start', exact: true }).click()
    await page.locator('[data-u-command="univer.command.undo"]').click()
    await page.waitForFunction(
      () => window.univerAPI.getActivePresentation().save().slides.crop.elements['crop-sample'].crop.left === 90,
    )
    await page.locator('[data-u-command="univer.command.redo"]').click()
    await page.waitForFunction(
      () => window.univerAPI.getActivePresentation().save().slides.crop.elements['crop-sample'].crop.left === 130,
    )
    result.nativeCrop = true
    result.nativeHistory = true
    const targets = ['fit', 'crop', 'replace', 'fit']
    for (const [index, code] of recipes.entries()) {
      await activate(targets[index])
      await page.evaluate((source) => new Function('univerAPI', source)(window.univerAPI), code)
      await settle()
      const snapshot = await save()
      if (index === 0) assert.equal(snapshot.slides.fit.elements['fit-sample'].transform.width, 300)
      if (index === 1) {
        assert.deepEqual(snapshot.slides.crop.elements['crop-sample'].crop, { left: 36, right: 36, top: 0, bottom: 0 })
        assert.equal(snapshot.slides.crop.elements['crop-sample'].transform.width, 288)
      }
      if (index === 2) {
        assert.equal(
          snapshot.slides.replace.elements['replace-original'].source,
          snapshot.slides.replace.elements['replace-sample'].source,
        )
        for (const key of ['left', 'top', 'width', 'height', 'rotation'])
          assert.equal(
            snapshot.slides.replace.elements['replace-original'].transform[key],
            initial.slides.replace.elements['replace-original'].transform[key],
          )
      }
      if (index === 3) assert.equal(snapshot.slides.fit.elements['inserted-copy'].transform.width, 120)
      await page.screenshot({ path: path.join(directory, locale + '-recipe-' + (index + 1) + '.png') })
      result.recipes.push(index + 1)
    }
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
    result.themeOwnerFullSave = true
    await page.evaluate(() => window.unmountPreview())
    await page.waitForFunction(() => window.univerAPI === undefined)
    assert.equal(await page.locator('.slide-images').count(), 0)
  }
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.networkWrites, [])
  report.passed = true
} catch (error) {
  report.failure = error.stack
  report.snapshot = await save().catch(() => null)
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
} finally {
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2))
  await browser.close()
  await server.close()
}
console.log(JSON.stringify({ ...report, snapshot: undefined }))
assert.ok(report.passed)
