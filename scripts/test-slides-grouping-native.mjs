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
const slug = 'grouping-and-stacking'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/slides-grouping-native')
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
const save = () => page.evaluate(() => window.univerAPI.getActivePresentation().save())
const recipes = [
  ...(await fs.readFile('showcase/slides/grouping-and-stacking/README.md', 'utf8')).matchAll(
    /```ts\r?\n([\s\S]*?)```/g,
  ),
].map((m) => m[1])
async function activate(id) {
  await page.locator('[data-u-comp="slide-thumbnail-item"][data-page-id="' + id + '"]').click()
  await page.waitForFunction((value) => window.univerAPI.getActivePresentation().getActiveSlide().getId() === value, id)
  await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
}
try {
  for (const locale of ['en-US', 'zh-CN']) {
    const result = { locale, recipes: [] }
    report.locales.push(result)
    await page.goto('http://127.0.0.1:4450/?locale=' + locale, { timeout: 120000 })
    await page.locator('.slide-grouping[data-ready=true]').waitFor({ timeout: 60000 })
    await page.waitForFunction(
      () => window.univerAPI.getCurrentLifecycleStage() >= window.univerAPI.Enum.LifecycleStages.Steady,
    )
    assert.equal(await page.locator('html').getAttribute('lang'), locale)
    assert.equal((await save()).locale, 'enUS')
    assert.doesNotMatch(await page.locator('.slide-grouping').innerText(), /[\u3400-\u9fff]/)
    result.initial = await save()
    assert.equal(
      await page.evaluate(() => window.univerAPI.getActivePresentation().getSlideById('grouped').getGroups().length),
      1,
    )
    for (const id of ['independent', 'grouped', 'stacking']) {
      await activate(id)
      await page.screenshot({ path: path.join(directory, locale + '-' + id + '.png') })
    }
    await activate('grouped')
    await page.mouse.click(700, 650)
    await fs.writeFile(path.join(directory, locale + '-menu.txt'), await page.locator('body').innerText())
    await page.screenshot({ path: path.join(directory, locale + '-menu.png') })
    result.nativeButtons = await page.locator('[data-u-command]').evaluateAll((nodes) =>
      nodes.map((n) => ({
        id: n.getAttribute('data-u-command'),
        title: n.getAttribute('title'),
        text: n.textContent,
      })),
    )
    try {
      await page.locator('[data-u-command="slide.operation.contextmenu.ungroup"]').click({ timeout: 3000 })
      await page.waitForFunction(
        () => window.univerAPI.getActivePresentation().getSlideById('grouped').getGroups().length === 0,
      )
      result.nativeUngroup = true
    } catch (e) {
      report.failures.push(locale + ': native Ungroup menu unavailable: ' + e.message)
    }
    await page.keyboard.press('Escape')
    await page.mouse.click(700, 650)
    await page.keyboard.down('Shift')
    await page.mouse.click(1100, 650)
    await page.keyboard.up('Shift')
    await page.locator('[data-u-command="slide.operation.contextmenu.group"]').click()
    await page.waitForFunction(
      () => window.univerAPI.getActivePresentation().getSlideById('grouped').getGroups().length === 1,
    )
    result.nativeGroup = true
    await page.screenshot({ path: path.join(directory, locale + '-native-regroup.png') })
    await activate('stacking')
    await page.mouse.click(700, 650)
    await page.locator('[data-u-command="slide.operation.contextmenu.arrange-front"]').click()
    await page.waitForFunction(
      () =>
        window.univerAPI.getActivePresentation().getSlideById('stacking').getElements().at(-1).getId() === 'stacking-a',
    )
    result.nativeBringToFront = true
    await page.screenshot({ path: path.join(directory, locale + '-native-front.png') })
    await page.mouse.move(1000, 950)
    await page.getByRole('tooltip').waitFor({ state: 'hidden' })
    await page.locator('[data-u-command="slide.operation.contextmenu.arrange-back"]').click()
    await page.waitForFunction(
      () => window.univerAPI.getActivePresentation().getSlideById('stacking').getElements()[0].getId() === 'stacking-a',
    )
    for (let i = 0; i < recipes.length; i++) {
      await activate(i < 2 ? 'independent' : 'stacking')
      await page.evaluate((code) => new Function(code)(), recipes[i])
      const value = await page.evaluate(() => {
        const p = window.univerAPI.getActivePresentation()
        return {
          groups: p
            .getSlideById('independent')
            .getGroups()
            .map((g) => g.getChildren().map((c) => c.getId())),
          order: p
            .getSlideById('stacking')
            .getElements()
            .map((e) => e.getId()),
        }
      })
      if (i === 0) assert.deepEqual(value.groups, [['independent-a', 'independent-b']])
      if (i === 1) assert.deepEqual(value.groups, [])
      if (i === 2) assert.equal(value.order.at(-1), 'stacking-a')
      if (i === 3) assert.equal(value.order[0], 'stacking-a')
      result.recipes.push(value)
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
    await page.waitForFunction(() => !window.univerAPI && !document.querySelector('.slide-grouping'))
  }
  assert.deepEqual(report.errors, [])
  report.passed = report.failures.length === 0
  if (!report.passed) process.exitCode = 1
} catch (e) {
  report.failure = e.stack
  await page.screenshot({ path: path.join(directory, 'failure.png') })
  process.exitCode = 1
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify({ passed: report.passed, failure: report.failure, directory }))
  await browser.close()
  await server.close()
}
