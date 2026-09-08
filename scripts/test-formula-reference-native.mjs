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
const slug = 'formula-reference-modes'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/formula-reference-native')
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
        return `import React from 'react'; import {createRoot} from 'react-dom/client'; import {ThemeProvider} from 'next-themes'; import Preview from '/showcase/sheets/${slug}/preview/main.tsx'; const root=createRoot(document.getElementById('app')); root.render(React.createElement(ThemeProvider,{attribute:'class',defaultTheme:'light'},React.createElement(Preview))); window.unmountPreview=()=>root.unmount();`
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
const root = page.locator('.formula-reference-gallery')
const save = () => page.evaluate(() => window.univerAPI.getActiveWorkbook().save())
const read = () =>
  page.evaluate(() => {
    const book = window.univerAPI.getActiveWorkbook()
    return Object.fromEntries(
      ['relative', 'absolute', 'mixed'].map((id) => {
        const sheet = book.getSheetBySheetId(id)
        return [
          id,
          {
            values: sheet.getRange(id === 'mixed' ? 'B5:E8' : 'D5:D8').getRawValues(),
            formulas: sheet.getRange(id === 'mixed' ? 'B5:E8' : 'D5:D8').getFormulas(),
          },
        ]
      }),
    )
  })
const recipes = [
  ...(await fs.readFile('showcase/sheets/formula-reference-modes/README.md', 'utf8')).matchAll(
    /```ts\r?\n([\s\S]*?)```/g,
  ),
].map((m) => m[1])
async function activate(name, id) {
  await root.getByText(name, { exact: true }).last().click()
  await page.waitForFunction(
    (value) => window.univerAPI.getActiveWorkbook().getActiveSheet().getSheetId() === value,
    id,
  )
}
async function select(address) {
  const box = root.locator('input.univer-size-full')
  await box.fill(address)
  await box.press('Enter')
  await page.waitForFunction(
    (a) => window.univerAPI.getActiveWorkbook().getActiveSheet().getActiveRange()?.getA1Notation() === a,
    address,
  )
}
async function type(address, value) {
  await select(address)
  await page.keyboard.type(value)
  await page.keyboard.press('Enter')
}
try {
  for (const locale of ['en-US', 'zh-CN']) {
    const result = { locale, recipes: [] }
    report.locales.push(result)
    await page.goto('http://127.0.0.1:4450/?locale=' + locale, { timeout: 120000 })
    await page.waitForFunction(
      () =>
        window.univerAPI?.getActiveWorkbook()?.getSheetBySheetId('relative').getRange('D5').getRawValues()[0][0] === 16,
      {},
      { timeout: 60000 },
    )
    assert.equal(await page.locator('html').getAttribute('lang'), locale)
    assert.equal((await save()).locale, 'enUS')
    assert.doesNotMatch(await root.innerText(), /[\u3400-\u9fff]/)
    result.initial = await read()
    assert.deepEqual(result.initial.relative.values, [[16], [18], [20], [20]])
    assert.deepEqual(result.initial.absolute.values, [[7], [10.5], [14], [17.5]])
    assert.deepEqual(result.initial.mixed.values, [
      [10, 20, 30, 40],
      [20, 40, 60, 80],
      [30, 60, 90, 120],
      [40, 80, 120, 160],
    ])
    for (const [name, id] of [
      ['Relative rows', 'relative'],
      ['Fixed anchor', 'absolute'],
      ['Mixed matrix', 'mixed'],
    ]) {
      await activate(name, id)
      await page.screenshot({ path: path.join(directory, locale + '-' + id + '.png') })
    }
    await activate('Relative rows', 'relative')
    await type('D5', '=(B5+2)*C5')
    await page.waitForFunction(
      () => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('D5').getRawValues()[0][0] === 32,
    )
    await select('D5')
    await page.screenshot({ path: path.join(directory, locale + '-before-fill.png') })
    const canvas = root.locator('canvas[id^="univer-sheet-main-canvas"]')
    const bounds = await canvas.boundingBox()
    await page.mouse.move(bounds.x + 766, bounds.y + 209)
    await page.mouse.down()
    await page.mouse.move(bounds.x + 766, bounds.y + 323, { steps: 12 })
    await page.mouse.up()
    await page.waitForFunction(
      () => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('D8').getFormula() === '=(B8+2)*C8',
    )
    await page.waitForFunction(
      () =>
        window.univerAPI.getActiveWorkbook().getSheetBySheetId('relative').getRange('D8').getRawValues()[0][0] === 28,
    )
    assert.deepEqual((await read()).relative.values, [[32], [30], [30], [28]])
    result.nativeFill = true
    await page.screenshot({ path: path.join(directory, locale + '-native-fill.png') })
    await activate('Fixed anchor', 'absolute')
    await type('E5', '6')
    await page.waitForFunction(
      () => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('D8').getRawValues()[0][0] === 30,
    )
    assert.deepEqual((await read()).absolute.values, [[12], [18], [24], [30]])
    await page.waitForFunction(() =>
      window.univerAPI
        .getActiveWorkbook()
        .getActiveSheet()
        .getRange('C5:C8')
        .getRawValues()
        .every(([value]) => value === 6),
    )
    await activate('Mixed matrix', 'mixed')
    await type('C4', '7')
    await page.waitForFunction(
      () => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('C8').getRawValues()[0][0] === 28,
    )
    assert.deepEqual((await read()).mixed.values, [
      [10, 7, 30, 40],
      [20, 14, 60, 80],
      [30, 21, 90, 120],
      [40, 28, 120, 160],
    ])
    result.nativeRecalculation = true
    for (let i = 0; i < recipes.length; i++) {
      await page.evaluate(async (code) => {
        const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
        await new AsyncFunction(code)()
      }, recipes[i])
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
      await page.waitForFunction((index) => {
        const book = window.univerAPI.getActiveWorkbook()
        const sheet = book.getSheetBySheetId(index === 0 ? 'relative' : index === 1 ? 'absolute' : 'mixed')
        return sheet.getRange(index < 2 ? 'D8' : 'E8').getRawValues()[0][0] === [24, 20, 165, 125][index]
      }, i)
      const values = await read()
      result.recipes.push(values)
      if (i === 0) {
        assert.deepEqual(
          values.relative.formulas,
          ['5', '6', '7', '8'].map((r) => ['=(B' + r + '+1)*C' + r]),
        )
        assert.deepEqual(values.relative.values, [[24], [24], [25], [24]])
      }
      if (i === 1) assert.deepEqual(values.absolute.values, [[8], [12], [16], [20]])
      if (i === 2)
        for (let r = 0; r < 4; r++)
          assert.deepEqual(
            values.mixed.formulas[r],
            ['B', 'C', 'D', 'E'].map((c) => '=$A' + (r + 5) + '*' + c + '$4+5'),
          )
      if (i === 3)
        assert.deepEqual(values.mixed.values, [
          [17, 23, 29, 35],
          [29, 41, 53, 65],
          [41, 59, 77, 95],
          [53, 77, 101, 125],
        ])
      await activate(
        i === 0 ? 'Relative rows' : i === 1 ? 'Fixed anchor' : 'Mixed matrix',
        i === 0 ? 'relative' : i === 1 ? 'absolute' : 'mixed',
      )
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
      await page.waitForFunction((t) => document.documentElement.classList.contains(t), theme)
      assert.equal(await page.evaluate(() => window.originalOwner === window.univerAPI), true)
      assert.deepEqual(await save(), edited)
    }
    await page.evaluate(() => window.unmountPreview())
    await page.waitForFunction(() => !window.univerAPI && !document.querySelector('.formula-reference-gallery'))
  }
  assert.deepEqual(report.errors, [])
  report.passed = true
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
