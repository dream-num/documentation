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
const slug = 'filter-values-and-conditions'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/filter-values-and-conditions-native')
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
const reportPath = path.join(directory, 'report.json')
const readme = await fs.readFile('showcase/sheets/' + slug + '/README.md', 'utf8')
const recipes = [...readme.matchAll(/```ts\r?\n([\s\S]*?)```/g)].map((match) => match[1])
assert.equal(recipes.length, 6)
const save = () => page.evaluate(() => window.univerAPI.getActiveWorkbook().save())
const settle = () =>
  page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
const variants = [
  ['values', 'Value list', ['R01', 'R02', 'R03', 'R06', 'R07', 'R10', 'R11']],
  ['band', 'Numeric AND', ['R02', 'R03', 'R04', 'R05', 'R09']],
  ['text', 'Text wildcard', ['R01', 'R02', 'R03', 'R05', 'R06', 'R08', 'R10', 'R11']],
  ['blank', 'Blanks', ['R07', 'R11']],
  ['combined', 'Two columns', ['R01', 'R03']],
  ['none', 'No matches', []],
]
async function activate(id, name) {
  if ((await page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().getSheetId())) !== id) {
    await page.evaluate(() => {
      window.nativePaint = []
    })
    await page.getByText(name, { exact: true }).last().click()
    await page.waitForFunction(
      (value) => window.univerAPI.getActiveWorkbook().getActiveSheet().getSheetId() === value,
      id,
    )
  }
  await settle()
}
async function visibleIds() {
  return page.evaluate(() => {
    const s = window.univerAPI.getActiveWorkbook().getActiveSheet()
    const hidden = s.getFilter()?.getFilteredOutRows() || []
    return s
      .getRange('A5:E16')
      .getValues()
      .filter((_, i) => !hidden.includes(i + 4))
      .map((row) => row[0])
  })
}
async function checkIds(expected) {
  await page.waitForFunction((ids) => {
    const s = window.univerAPI.getActiveWorkbook().getActiveSheet()
    const hidden = s.getFilter()?.getFilteredOutRows() || []
    return (
      JSON.stringify(
        s
          .getRange('A5:E16')
          .getValues()
          .filter((_, i) => !hidden.includes(i + 4))
          .map((row) => row[0]),
      ) === JSON.stringify(ids)
    )
  }, expected)
  assert.deepEqual(await visibleIds(), expected)
  await settle()
}
try {
  for (const locale of ['en-US', 'zh-CN']) {
    await page.goto('http://127.0.0.1:4450/?locale=' + locale, { timeout: 120000 })
    await page.locator('.filter-gallery[data-ready=true]').waitFor({ timeout: 60000 })
    assert.equal(await page.locator('html').getAttribute('lang'), locale)
    assert.equal((await save()).locale, 'enUS')
    await page.getByRole('tab', { name: 'Data', exact: true }).click()
    await page.getByRole('tab', { name: 'Start', exact: true }).click()
    const originals = await page.evaluate(() =>
      window.univerAPI
        .getActiveWorkbook()
        .getSheets()
        .map((s) => s.getRange('A5:E16').getValues()),
    )
    const result = { locale, initial: [], nativeOperations: [] }
    report.locales.push(result)
    await activate('none', 'No matches')
    for (const [id, name, expected] of variants) {
      await activate(id, name)
      await checkIds(expected)
      await page.waitForFunction(
        (ids) => ids.every((recordId) => window.nativePaint.some((p) => p.text === recordId)),
        expected,
      )
      const painted = await page.evaluate(() =>
        [...new Set(window.nativePaint.filter((p) => /^R\d{2}$/.test(p.text)).map((p) => p.text))].toSorted(),
      )
      assert.deepEqual(painted, expected)
      await page.screenshot({ path: path.join(directory, locale + '-' + id + '.png') })
      result.initial.push({ id, visible: await visibleIds(), painted })
    }
    await activate('values', 'Value list')
    await page.mouse.click(337, 305)
    await page.getByText('By Values', { exact: true }).waitFor()
    await fs.writeFile(path.join(directory, locale + '-popup.html'), await page.locator('body').innerHTML())
    for (const value of ['North', 'South', 'West'])
      await page.getByText(value, { exact: true }).locator('xpath=ancestor::div[label][1]').locator('label').click()
    await page.screenshot({ path: path.join(directory, locale + '-popup-changed.png') })
    await page.getByRole('button', { name: 'Confirm', exact: true }).click()
    await checkIds(['R04', 'R08'])
    result.nativeOperations.push('Region value-list changed to West using native checkboxes')
    await page.screenshot({ path: path.join(directory, locale + '-native-west.png') })
    await activate('band', 'Numeric AND')
    await page.mouse.click(667, 305)
    await page.getByText('By Conditions', { exact: true }).click()
    await fs.writeFile(path.join(directory, locale + '-conditions.html'), await page.locator('body').innerHTML())
    await page.screenshot({ path: path.join(directory, locale + '-conditions.png') })
    await page.getByPlaceholder('Input Values', { exact: true }).nth(0).fill('20')
    await page.getByPlaceholder('Input Values', { exact: true }).nth(1).fill('50')
    await page.getByRole('button', { name: 'Confirm', exact: true }).click()
    await checkIds(['R03', 'R04', 'R05', 'R06', 'R09'])
    result.nativeOperations.push('Numeric AND inputs changed to inclusive 20 through 50')
    await page.screenshot({ path: path.join(directory, locale + '-native-band.png') })
    await activate('text', 'Text wildcard')
    await page.mouse.click(537, 305)
    await page.getByText('By Values', { exact: true }).click()
    const literal = page.getByText('kit*', { exact: true }).locator('xpath=ancestor::div[label][1]')
    await literal.locator('label').click()
    await page.getByRole('button', { name: 'Confirm', exact: true }).click()
    await checkIds(['R05'])
    result.nativeOperations.push('Native value-list checkbox selects literal kit*, unlike initial wildcard')
    await page.screenshot({ path: path.join(directory, locale + '-native-literal.png') })
    await activate('none', 'No matches')
    await page.mouse.click(667, 305)
    await page.getByText('Clear Filter', { exact: true }).click()
    await checkIds(originals[0].map((row) => row[0]))
    result.nativeOperations.push('No-match numeric condition cleared through native popup')
    assert.deepEqual(
      await page.evaluate(() =>
        window.univerAPI
          .getActiveWorkbook()
          .getSheets()
          .map((s) => s.getRange('A5:E16').getValues()),
      ),
      originals,
    )
    const box = page.locator('input.univer-size-full')
    await box.fill('C5')
    await box.press('Enter')
    await page.keyboard.type('native-edited')
    await page.keyboard.press('Enter')
    await page.waitForFunction(
      () => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('C5').getRawValue() === 'native-edited',
    )
    result.nativeEditing = true
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
      await page.locator('[data-u-comp^="workbench-skeleton-"]').first().waitFor({ state: 'detached' })
      await settle()
      assert.equal(await page.evaluate(() => window.univerAPI === window.originalOwner), true)
      assert.deepEqual(await save(), snapshot)
      await page.screenshot({ path: path.join(directory, locale + '-' + theme + '.png') })
    }
    result.themeOwnerAndFullSave = true
    const recipeExpected = [
      ['values', ['R04', 'R08']],
      ['values', ['R04', 'R08']],
      ['band', ['R02', 'R03', 'R04', 'R05', 'R09']],
      ['text', ['R05']],
      ['blank', ['R07', 'R11']],
      ['none', originals[0].map((row) => row[0])],
    ]
    result.literalReadmeRecipes = []
    for (const [index, code] of recipes.entries()) {
      const returned = await page.evaluate(
        ({ body, first }) => new Function('univerAPI', body + (first ? '\nreturn visible' : ''))(window.univerAPI),
        { body: code, first: index === 0 },
      )
      const [sheetId, expected] = recipeExpected[index]
      if (index === 0) assert.deepEqual(returned, expected)
      await page.waitForFunction(
        ({ id, ids }) => {
          const sheet = window.univerAPI.getActiveWorkbook().getSheetBySheetId(id)
          const hidden = sheet.getFilter().getFilteredOutRows()
          return (
            JSON.stringify(
              sheet
                .getRange('A5:E16')
                .getValues()
                .filter((_, i) => !hidden.includes(i + 4))
                .map((row) => row[0]),
            ) === JSON.stringify(ids)
          )
        },
        { id: sheetId, ids: expected },
      )
      result.literalReadmeRecipes.push({ index: index + 1, sheetId, visible: expected })
    }
    await page.evaluate(() => window.unmountPreview())
    await page.waitForFunction(() => window.univerAPI === undefined)
    assert.equal(await page.locator('.filter-gallery').count(), 0)
  }
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.networkWrites, [])
  report.passed = true
} catch (error) {
  report.failure = error.stack
  report.current = await page
    .evaluate(() => {
      const s = window.univerAPI?.getActiveWorkbook()?.getActiveSheet()
      return {
        id: s?.getSheetId(),
        criteria: s?.getFilter()?.getColumnFilterCriteria(1),
        hidden: s?.getFilter()?.getFilteredOutRows(),
        dom: document.body.innerText,
      }
    })
    .catch(() => null)
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
} finally {
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2))
  await browser.close()
  await server.close()
}
console.log(JSON.stringify(report))
assert.ok(report.passed)
