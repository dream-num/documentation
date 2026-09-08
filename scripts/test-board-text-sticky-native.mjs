/* eslint-disable no-await-in-loop -- Verify both locales and themes in the actual selected Preview. */
/* eslint-disable no-shadow -- Browser callbacks run in a separate JavaScript context. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { stripTypeScriptTypes } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import vm from 'node:vm'

import { chromium } from 'playwright'

// Exercise the real factory catch with test-only startup/teardown faults; SDK files are untouched.
const factorySource = await fs.readFile('showcase/boards/text-and-sticky-notes/code/create-demo.ts', 'utf8')
const startupFault = new Error('injected startup'),
  cleanupFault = new Error('injected cleanup')
let rootRemoved = false
const element = () => ({
  append() {},
  setAttribute() {},
  remove() {
    rootRemoved = true
  },
})
const faultContext = {
  exports: {},
  window: {},
  document: { createElement: element },
  AggregateError,
  Univer: class {
    registerPlugin() {
      throw startupFault
    }
    dispose() {
      throw cleanupFault
    }
  },
  LocaleType: { EN_US: 'enUS' },
  mergeLocales: () => ({}),
  UniverRenderEnginePlugin: {},
  ...Object.fromEntries(
    [
      'DesignEnUS',
      'UIEnUS',
      'DocsUIEnUS',
      'DrawingUIEnUS',
      'BoardsUIEnUS',
      'ShapeEditorEnUS',
      'EmbedUnitEnUS',
      'InkUIEnUS',
    ].map((name) => [name, {}]),
  ),
}
vm.runInNewContext(
  stripTypeScriptTypes(
    factorySource.replace(/^import .*$/gm, '').replace('export function createDemo', 'function createDemo'),
  ) + '\nexports.createDemo=createDemo',
  faultContext,
)
assert.throws(
  () => faultContext.exports.createDemo(element()),
  (error) => error instanceof AggregateError && error.errors[0] === startupFault && error.errors[1] === cleanupFault,
)
assert.equal(rootRemoved, true)

const { createServer } = await import(
  pathToFileURL(
    process.env.SHOWCASE_VITE_MODULE ||
      'C:/Users/wbfsa/AppData/Local/Temp/univer-vite-runner/node_modules/vite/dist/node/index.js',
  ).href
)
const slug = 'text-and-sticky-notes'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/board-text-sticky-native')
await fs.mkdir(directory, { recursive: true })
const sources = (
  await Promise.all(
    ['create-demo.ts', 'data.ts'].map((name) => fs.readFile('showcase/boards/' + slug + '/code/' + name, 'utf8')),
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
        return `import React from 'react'; import {createRoot} from 'react-dom/client'; import {ThemeProvider} from 'next-themes'; import Preview from '/showcase/boards/${slug}/preview/main.tsx'; const root=createRoot(document.getElementById('app')); root.render(React.createElement(ThemeProvider,{attribute:'class',defaultTheme:'light'},React.createElement(Preview))); window.unmountPreview=()=>root.unmount();`
      },
    },
  ],
})
await server.listen()
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1200 } })
const report = { passed: false, locales: [], errors: [] }
report.startupAndCleanupFaultsPreserved = true
page.on('pageerror', (e) => report.errors.push(e.message))
page.on('console', (e) => {
  if (e.type() === 'error') report.errors.push(e.text())
})

await page.addInitScript(() => {
  localStorage.setItem('theme', 'light')
  window.drawnText = []
  const fill = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (...args) {
    window.drawnText.push(String(args[0]))
    return Reflect.apply(fill, this, args)
  }
})
const root = page.locator('.text-sticky-demo')
const save = () => page.evaluate(() => window.univerAPI.getActiveBoard().save())
const capture = (name) => page.screenshot({ path: path.join(directory, name + '.png') })
const paint = (text) =>
  // Native shape text can insert hyphens at wrapped word boundaries.
  page.waitForFunction(
    (text) => window.drawnText.join('').replace(/[\s-]/g, '').includes(text.replace(/[\s-]/g, '')),
    text,
    {
      timeout: 5000,
    },
  )
const recipes = [
  ...(await fs.readFile('showcase/boards/text-and-sticky-notes/code/README.md', 'utf8')).matchAll(
    /```ts\s*\n([\s\S]*?)```/g,
  ),
].map((m) => m[1])
assert.equal(recipes.length, 4)
report.checks = []
async function gate(name, fn) {
  try {
    await fn()
    report.checks.push({ name, passed: true })
  } catch (e) {
    report.checks.push({ name, passed: false, error: e.stack, snapshot: await save() })
    await capture(name + '-failure')
  }
}
try {
  for (const locale of ['en-US', 'zh-CN']) {
    await page.goto('http://127.0.0.1:4450/?locale=' + locale, { timeout: 120000 })
    await root.locator(':scope[data-ready=true]').waitFor({ timeout: 60000 })
    assert.equal(await page.locator('html').getAttribute('lang'), locale)
    assert.doesNotMatch(await root.innerText(), /[\u3400-\u9fff]/)
    assert.ok((await root.locator('button').count()) > 0)
    await paint('Keep it short.')
    await capture(locale + '-initial')
    report.locales.push(locale)
    for (const id of ['body', 'yellow'])
      await gate(locale + '-native-' + id, async () => {
        const p = await page.evaluate((id) => {
          const p = window.univerAPI.getActiveBoard().getElementViewportPoint(id)
          const r = document.querySelector('[data-board-viewport-host] canvas').getBoundingClientRect()
          return { x: r.x + p.x, y: r.y + p.y }
        }, id)
        await page.mouse.dblclick(p.x, p.y)
        await page.waitForFunction(
          () =>
            document.activeElement?.tagName === 'TEXTAREA' ||
            document.activeElement?.getAttribute('contenteditable') === 'true',
        )
        await page.waitForTimeout(350) // Native editor ignores outside focus during its first 300ms.
        await page.keyboard.press('Control+A')
        await page.keyboard.insertText('Native ' + id + ' revised')
        await page.waitForTimeout(350)
        await page.mouse.click(30, 100)
        await page.waitForFunction(
          ({ id, text }) => {
            const b = window.univerAPI.getActiveBoard()
            return (
              (id === 'body' ? b.save().pages.gallery.elements[id].text : b.getShape(id).getText().getPlainText()) ===
              text
            )
          },
          { id, text: 'Native ' + id + ' revised' },
          { timeout: 5000 },
        )
        await paint('Native ' + id + ' revised')
        await capture(locale + '-native-' + id)
      })
    for (let i = 0; i < recipes.length; i++)
      await gate(locale + '-recipe-' + (i + 1), async () => {
        await page.evaluate(() => (window.drawnText = []))
        await page.evaluate('(async()=>{' + recipes[i] + '})()')
        const expected = [
          'Standalone text can be revised without changing its bounds.',
          'Ready to discuss.',
          'A little more detail',
          'A revised explanation stays inside the original sticky.',
        ][i]
        await paint(expected)
        const data = await save()
        if (i === 0) assert.equal(data.pages.gallery.elements.body.text, expected)
        if (i === 1 || i === 3)
          assert.ok(
            await page.evaluate(
              ({ id, expected }) =>
                window.univerAPI.getActiveBoard().getShape(id).getText().getPlainText().includes(expected),
              { id: i === 1 ? 'yellow' : 'pink', expected },
            ),
          )
        if (i === 2) assert.ok(JSON.stringify(data.pages.gallery.elements.blue).includes('174A74'))
        await capture(locale + '-recipe-' + (i + 1))
      })
    await gate(locale + '-theme-and-unmount', async () => {
      const before = await save()
      await page.evaluate(() => (window.savedOwner = window.univerAPI))
      for (const theme of ['dark', 'light']) {
        await page.evaluate((theme) => {
          localStorage.setItem('theme', theme)
          window.dispatchEvent(new StorageEvent('storage', { key: 'theme', newValue: theme }))
        }, theme)
        await page.waitForFunction((theme) => document.documentElement.classList.contains(theme), theme)
        assert.equal(await page.evaluate(() => window.savedOwner === window.univerAPI), true)
        assert.deepEqual(await save(), before)
      }
      await page.evaluate(() => window.unmountPreview())
      await root.waitFor({ state: 'detached' })
      assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
    })
  }
  assert.deepEqual(report.errors, [])
  assert.ok(
    report.checks.every((c) => c.passed),
    JSON.stringify(report.checks.filter((c) => !c.passed).map((c) => c.name)),
  )
  report.passed = true
} catch (e) {
  report.failure = e.stack
} finally {
  await browser.close()
  await server.close()
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify({ passed: report.passed, directory, failure: report.failure }))
  if (!report.passed) process.exitCode = 1
}
