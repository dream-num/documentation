/* eslint-disable no-await-in-loop -- Verify both locales and themes in the actual selected Preview. */
/* eslint-disable no-shadow -- Browser callbacks run in their own JavaScript context. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { stripTypeScriptTypes } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import vm from 'node:vm'

import { chromium } from 'playwright'

// Test-only failure injection into the actual factory, not SDK source or shipped code.
const factorySource = await fs.readFile('showcase/pdfs/text-boxes-and-typography/code/create-demo.ts', 'utf8')
for (const failCleanup of [false, true]) {
  const startupFault = new Error('startup fault'),
    cleanupFault = new Error('cleanup fault')
  let callback,
    logged,
    cancelled = false
  const elements = []
  const element = () => {
    const node = {
      dataset: {},
      clientWidth: 1100,
      clientHeight: 1000,
      removed: false,
      append() {},
      setAttribute() {},
      remove() {
        this.removed = true
      },
      querySelector(selector) {
        return selector.includes('skeleton') ? null : { clientWidth: 1100, clientHeight: 1000 }
      },
    }
    elements.push(node)
    return node
  }
  const api = { Enum: { LifecycleStages: { Rendered: 1 } }, getCurrentLifecycleStage: () => 1, setUIVisible() {} }
  const context = {
    exports: {},
    window: {},
    document: { createElement: element },
    AggregateError,
    requestAnimationFrame(fn) {
      callback = fn
      return 1
    },
    cancelAnimationFrame() {
      cancelled = true
    },
    console: {
      error(e) {
        logged = e
      },
    },
    Univer: class {
      registerPlugin() {}
      dispose() {
        if (failCleanup) throw cleanupFault
      }
      __getInjector() {
        return {
          get: () => ({
            navigateToPage() {
              throw startupFault
            },
          }),
        }
      }
    },
    FUniver: { newAPI: () => api },
    LocaleType: { EN_US: 'enUS' },
    mergeLocales: () => ({}),
    BuiltInUIPart: { LEFT_SIDEBAR: 0 },
    createTextGallery: () => ({
      getId: () => 'test',
      getPageByIndex: () => ({ getData: () => ({ id: 'page', size: { width: 1, height: 1 } }) }),
    }),
    ...Object.fromEntries(
      [
        'DesignEnUS',
        'UIEnUS',
        'DocsUIEnUS',
        'DrawingUIEnUS',
        'PdfsUIEnUS',
        'UniverRenderEnginePlugin',
        'UniverUIPlugin',
        'UniverDocsPlugin',
        'UniverDocsUIPlugin',
        'UniverDrawingPlugin',
        'UniverDrawingUIPlugin',
        'UniverLicensePlugin',
        'UniverPdfsPlugin',
        'UniverPdfEditorPlugin',
        'UniverPdfsUIPlugin',
        'IPdfEditorRuntimeService',
      ].map((name) => [name, {}]),
    ),
  }
  vm.runInNewContext(
    stripTypeScriptTypes(
      factorySource.replace(/^import .*$/gm, '').replace('export function createDemo', 'function createDemo'),
    ) + '\nexports.createDemo=createDemo',
    context,
  )
  const controller = context.exports.createDemo(element())
  callback()
  assert.equal(context.window.univerAPI, undefined)
  assert.equal(elements[1].removed, true)
  assert.equal(cancelled, true)
  if (failCleanup) {
    assert.ok(logged instanceof AggregateError)
    assert.equal(logged.cause, startupFault)
    assert.deepEqual(logged.errors, [startupFault, cleanupFault])
  } else assert.equal(logged, startupFault)
  assert.equal(elements.at(-1).removed, false)
  controller.dispose()
  assert.equal(elements.at(-1).removed, true)
}

const { createServer } = await import(
  pathToFileURL(
    process.env.SHOWCASE_VITE_MODULE ||
      'C:/Users/wbfsa/AppData/Local/Temp/univer-vite-runner/node_modules/vite/dist/node/index.js',
  ).href
)
const slug = 'text-boxes-and-typography'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/pdf-text-native')
await fs.mkdir(directory, { recursive: true })
const sources = (
  await Promise.all(
    ['create-demo.ts', 'data.ts'].map((name) => fs.readFile('showcase/pdfs/' + slug + '/code/' + name, 'utf8')),
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
            `<html lang="${locale === 'zh-CN' ? 'zh-CN' : 'en-US'}"><head><link rel="icon" href="data:,"><style>html,body,#app,.h-full{height:100%;margin:0;font-family:Arial,sans-serif}.min-h-0{min-height:0}</style></head><body><div id="app"></div><script type="module" src="/docblock-theme.jsx"></script></body></html>`,
          )
        })
      },
      resolveId(id) {
        if (id === '/docblock-theme.jsx') return '\0docblock-theme.jsx'
      },
      load(id) {
        if (id !== '\0docblock-theme.jsx') return
        return `import React from 'react'; import {createRoot} from 'react-dom/client'; import {ThemeProvider} from 'next-themes'; import Preview from '/showcase/pdfs/${slug}/preview/main.tsx'; const root=createRoot(document.getElementById('app')); root.render(React.createElement(ThemeProvider,{attribute:'class',defaultTheme:'light'},React.createElement(Preview))); window.unmountPreview=()=>root.unmount();`
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
        main: this.canvas.matches('[data-pdf-active-page-id] > canvas'),
        text: String(text),
        x: r.x + ((m.a * x + m.c * y + m.e) * r.width) / this.canvas.width,
        y: r.y + ((m.b * x + m.d * y + m.f) * r.height) / this.canvas.height,
      })
    return original.call(this, text, x, y, ...args)
  }
})

const save = () => page.evaluate(() => window.univerAPI.getActivePdf().save())
const shot = (name) => page.screenshot({ path: path.join(directory, name + '.png') })
const settle = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
const recipes = [
  ...(await fs.readFile('showcase/pdfs/' + slug + '/README.md', 'utf8')).matchAll(/```ts\s*\n([\s\S]*?)```/g),
].map((m) => m[1])
assert.equal(recipes.length, 4)
const canvas = () => page.locator('[data-pdf-active-page-id] > canvas').first()
const pixels = () => canvas().evaluate((n) => n.toDataURL())
const boxes = () =>
  page.evaluate(() =>
    window.univerAPI
      .getActivePdf()
      .getPages()
      .map((p) =>
        [...p.getTextBoxes(), ...p.getParagraphs()].map((b) => ({
          id: b.getId(),
          text: b.getText
            ? b.getText()
            : b
                .getBlocks()
                .map((block) => block.text)
                .join('\n'),
          runs: b.getTextRuns ? b.getTextRuns() : [],
          anchor: b.getTextAnchor ? b.getTextAnchor() : undefined,
          bounds: b.getTransform(),
        })),
      ),
  )
async function show(index) {
  await page.evaluate(() => {
    window.paint = []
  })
  const id = await page.evaluate((i) => window.univerAPI.getActivePdf().getPageByIndex(i).getId(), index)
  await page
    .locator('[data-pdf-footer] input')
    .first()
    .fill(String(index + 1))
  await page.locator('[data-pdf-footer] input').first().press('Enter')
  await page
    .locator('[data-pdf-active-page-id="' + id + '"] > canvas')
    .first()
    .waitFor()
  await settle()
}
async function lineRows(top, height) {
  const rect = await canvas().boundingBox()
  const pageHeight = await page.evaluate(
    () => window.univerAPI.getActivePdf().getPageByIndex(1).getData().size.height / 12700,
  )
  return page.evaluate(
    ({ rect, pageHeight, top, height }) => [
      ...new Set(
        window.paint
          .filter(
            (p) =>
              p.main &&
              p.text.trim() &&
              ((p.y - rect.y) * pageHeight) / rect.height >= top &&
              ((p.y - rect.y) * pageHeight) / rect.height < top + height,
          )
          .map((p) => Math.round(p.y)),
      ),
    ],
    { rect, pageHeight, top, height },
  )
}
function leaves(actual, expected) {
  for (const [k, v] of Object.entries(expected)) {
    if (v && typeof v === 'object') leaves(actual?.[k], v)
    else assert.equal(actual?.[k], v, k)
  }
}
try {
  for (const locale of ['en-US', 'zh-CN']) {
    const result = { locale, gates: {} }
    report.locales.push(result)
    async function gate(name, fn) {
      try {
        await fn()
        result.gates[name] = { passed: true }
      } catch (e) {
        result.gates[name] = { passed: false, error: e.stack }
        report.failures.push({ locale, name, error: e.message })
        await shot(locale + '-' + name + '-failure')
      }
    }
    await page.goto('http://127.0.0.1:4454/?locale=' + locale, { timeout: 120000 })
    await page.locator('.pdf-text-gallery[data-ready=true]').waitFor({ timeout: 60000 })
    await page.locator('[data-u-comp="workbench-skeleton-content"]').waitFor({ state: 'detached' })
    await gate('English-packs-CSS', async () => {
      assert.equal(await page.locator('html').getAttribute('lang'), locale)
      assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), 'enUS')
      const packs = await page.evaluate(() => window.univerAPI.getLocales())
      for (const name of [
        '@univerjs/design',
        '@univerjs/ui',
        '@univerjs/docs-ui',
        '@univerjs/drawing-ui',
        '@univerjs-pro/pdfs-ui',
      ])
        leaves(packs, (await import(name + '/locale/en-US')).default)
      assert.equal(
        await page.locator('[data-u-comp="workbench-layout"]').evaluate((n) => getComputedStyle(n).backgroundColor),
        'rgb(255, 255, 255)',
      )
    })
    await gate('initial-painted-variants', async () => {
      result.initial = await boxes()
      assert.equal(result.initial.length, 2)
      for (let i = 0; i < 2; i++) {
        await show(i)
        await shot(locale + '-page-' + (i + 1))
      }
      assert.equal(
        result.initial[1].find((b) => b.id === 'wide').text,
        result.initial[1].find((b) => b.id === 'narrow').text,
      )
    })
    await show(0)
    await gate('native-text-input', async () => {
      await page.getByRole('tab', { name: 'Start', exact: true }).click()
      await page.locator('[data-u-command="pdf.menu.tool.mode"]').click()
      await page.getByText('Text mode', { exact: true }).last().click()
      const rect = await canvas().boundingBox()
      const size = await page.evaluate(() => window.univerAPI.getActivePdf().getPageByIndex(0).getData().size)
      await page.mouse.dblclick(
        rect.x + (65 / (size.width / 12700)) * rect.width,
        rect.y + (220 / (size.height / 12700)) * rect.height,
      )
      await page.waitForFunction(() => document.activeElement?.matches('[data-pdf-text-input]'))
      await page.keyboard.press('Control+A')
      await page.keyboard.insertText('Native text revised.')
      await page.getByRole('tab', { name: 'View', exact: true }).click()
      await page.waitForFunction(
        () =>
          window.univerAPI
            .getActivePdf()
            .getPageByIndex(0)
            .getTextBoxes()
            .find((b) => b.getId() === 'editable')
            .getText() === 'Native text revised.',
      )
      await page.waitForFunction(() => window.paint.some((p) => p.text.includes('Native text revised.')))
      await shot(locale + '-native-text')
    })
    for (let i = 0; i < recipes.length; i++)
      await gate('recipe-' + (i + 1), async () => {
        await show(i === 3 ? 1 : 0)
        const before = await pixels()
        const rowsBefore = i === 3 ? await lineRows(410, 160) : []
        await page.evaluate(() => {
          window.paint = []
        })
        await page.evaluate((code) => new Function(code)(), recipes[i])
        await settle()
        const state = await boxes()
        result['recipe' + i] = state
        if (i === 0) assert.equal(state[0].find((b) => b.id === 'editable').text, 'A revised sentence stays editable.')
        if (i === 1)
          assert.ok(state[0].find((b) => b.id === 'emphasis').runs.some((r) => r.underline && r.fill === '#116d71'))
        if (i === 2) assert.equal(state[0].find((b) => b.id === 'anchored').anchor, 'start')
        if (i === 3) {
          assert.equal(state[1].find((b) => b.id === 'narrow').bounds.width, 360)
          const rowsAfter = await lineRows(410, 160)
          result.wrapping = { rowsBefore, rowsAfter }
          assert.equal(rowsBefore.length, 4)
          assert.equal(rowsAfter.length, 3)
        }
        assert.notEqual(await pixels(), before, 'Actual native pixels change')
        await shot(locale + '-recipe-' + (i + 1))
      })
    await gate('theme-full-snapshot-and-unmount', async () => {
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
      await page.locator('.pdf-text-gallery').waitFor({ state: 'detached' })
      assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
    })
  }
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.failures, [])
  report.passed = true
} catch (e) {
  report.failure = e.stack
} finally {
  await browser.close()
  await server.close()
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify({ passed: report.passed, directory, failures: report.failures }))
  if (!report.passed) process.exitCode = 1
}
