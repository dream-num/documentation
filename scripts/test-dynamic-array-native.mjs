/* eslint-disable no-await-in-loop -- Independent native gates preserve strict failures while exercising all three sheets. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { DELIVERIES } from '../showcase/sheets/dynamic-array-formulas/code/data.ts'
import { readShowcaseSources } from './showcase-sources.mjs'

const manifest = JSON.parse(await fs.readFile(process.argv[2], 'utf8'))
const entry = manifest.find(({ slug }) => slug === 'sheets/dynamic-array-formulas')
assert.ok(entry?.passed, 'Pass a successful selected export manifest')
const source = (await readShowcaseSources()).find(({ slug }) => slug === entry.slug)
for (const [name, content] of Object.entries(source.files))
  assert.equal(await fs.readFile(path.join(entry.directory, name.slice(1)), 'utf8'), content, name)
const readme = await fs.readFile('showcase/sheets/dynamic-array-formulas/code/README.md', 'utf8')
const recipes = [...readme.matchAll(/```ts\r?\n([\s\S]*?)```/g)].map((match) => match[1])
assert.equal(recipes.length, 3)
const output = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/dynamic-array-native')
await fs.mkdir(output, { recursive: true })
const vite = entry.links.find(({ name }) => name === 'vite')
assert.equal(JSON.parse(await fs.readFile(path.join(vite.target, 'package.json'), 'utf8')).version, vite.version)
const { preview } = await import(pathToFileURL(path.join(vite.target, 'dist/node/index.js')))
const server = await preview({
  root: entry.directory,
  configFile: false,
  preview: { host: '127.0.0.1', port: 4451, strictPort: true },
})
const browser = await chromium.launch()
const report = { passed: false, sourceFiles: Object.keys(source.files).length, manifest: entry, hosts: [] }
const write = (name, value) => fs.writeFile(path.join(output, name), JSON.stringify(value, null, 2))
const blank = (matrix) => matrix.every((row) => row.every((cell) => cell == null || cell === ''))
function compareLeaves(actual, expected) {
  for (const [key, value] of Object.entries(expected)) {
    if (value && typeof value === 'object') compareLeaves(actual?.[key], value)
    else assert.equal(actual?.[key], value, key)
  }
}
try {
  for (const lang of ['en-US', 'zh-CN']) {
    const result = { lang, passed: false, errors: [], networkWrites: [], gates: {} }
    report.hosts.push(result)
    const page = await browser.newPage({ viewport: { width: 1800, height: 1150 }, colorScheme: 'light' })
    page.setDefaultTimeout(15000)
    page.on('pageerror', (error) => result.errors.push(error.stack || error.message))
    page.on('console', (message) => {
      if (message.type() === 'error') result.errors.push(message.text())
    })
    page.on('request', (request) => {
      if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method())) result.networkWrites.push(request.url())
    })
    await page.route('http://127.0.0.1:4451/', async (route) => {
      const response = await route.fetch()
      await route.fulfill({ response, body: (await response.text()).replace(/<html[^>]*>/, `<html lang="${lang}">`) })
    })
    await page.addInitScript(() => {
      window.nativePaint = []
      const fillText = CanvasRenderingContext2D.prototype.fillText
      CanvasRenderingContext2D.prototype.fillText = function (value, ...args) {
        window.nativePaint.push(String(value))
        if (window.nativePaint.length > 30000) window.nativePaint.shift()
        return fillText.call(this, value, ...args)
      }
    })
    async function gate(name, action) {
      try {
        await action()
        result.gates[name] = { passed: true }
      } catch (error) {
        result.gates[name] = { passed: false, error: error.stack || String(error) }
      }
      console.log(lang, name, result.gates[name].passed ? 'PASS' : 'FAIL')
    }
    const calc = () => page.evaluate(() => window.univerAPI.getFormula().onCalculationResultApplied(10000))
    const save = () => page.evaluate(() => window.univerAPI.getActiveWorkbook().save())
    const values = (address) =>
      page.evaluate((a) => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange(a).getValues(), address)
    const value = async (address) => (await values(address))[0][0]
    const shot = async (name) => {
      await page.locator('[data-u-comp^="workbench-skeleton-"]').waitFor({ state: 'detached' })
      await page.screenshot({ path: path.join(output, `${lang}-${name}.png`) })
      await write(`${lang}-${name}.json`, await save())
    }
    async function ready() {
      await page.waitForFunction(
        () => window.univerAPI?.getCurrentLifecycleStage() >= window.univerAPI.Enum.LifecycleStages.Steady,
      )
      await calc()
      await page.getByRole('tab', { name: 'Start', exact: true }).waitFor()
      await page.locator('[data-u-comp^="workbench-skeleton-"]').waitFor({ state: 'detached' })
    }
    async function tab(name, id) {
      await page.evaluate(() => {
        window.nativePaint = []
      })
      await page.getByText(name, { exact: true }).first().click()
      await page.waitForFunction(
        (sheetId) => window.univerAPI.getActiveWorkbook().getActiveSheet().getSheetId() === sheetId,
        id,
      )
      await calc()
      await page.waitForFunction(() => window.nativePaint.length > 0)
    }
    async function edit(address, text) {
      const box = page.locator('input.univer-size-full')
      await box.fill(address)
      await box.press('Enter')
      await page.keyboard.type(text)
      await page.keyboard.press('Enter')
      await calc()
    }
    try {
      await page.goto('http://127.0.0.1:4451/')
      await ready()
      await gate('English-full-core-CSS-and-direct-twenty-cell-spill', async () => {
        assert.equal(await page.evaluate(() => document.documentElement.lang), lang)
        assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), 'enUS')
        compareLeaves(
          await page.evaluate(() => window.univerAPI.getLocales()),
          (await import('@univerjs/preset-sheets-core/locales/en-US')).default,
        )
        assert.equal(
          await page
            .locator('[data-u-comp="workbench-layout"]')
            .evaluate((node) => getComputedStyle(node).backgroundColor),
          'rgb(255, 255, 255)',
        )
        assert.deepEqual(await values('D1:E10'), [
          ['Route', 'Loads'],
          ...DELIVERIES.map(([route, , loads]) => [route, loads]),
        ])
        assert.equal(
          await page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('D1').getFormula()),
          '=A1:B10',
        )
        await page.waitForFunction(() => window.nativePaint.includes('Orchard schools'))
        await shot('range-initial')
      })
      const history = { before: await save() }
      await gate('native-source-edit-recalculates-spill', async () => {
        await edit('B3', '17')
        assert.equal(await value('B3'), 17)
        assert.equal(await value('E3'), 17)
        await page.waitForFunction(() => window.nativePaint.includes('17'))
        await shot('range-native-edited')
      })
      history.after = await save()
      await gate('native-Undo-exact-full-model', async () => {
        await page.keyboard.press('Control+z')
        await calc()
        history.undo = await save()
        assert.equal(await value('E3'), 7)
        assert.deepEqual(history.undo, history.before)
      })
      await gate('native-Redo-exact-full-model', async () => {
        await page.keyboard.press('Control+y')
        await calc()
        history.redo = await save()
        assert.equal(await value('E3'), 17)
        assert.deepEqual(history.redo, history.after)
      })
      await write(`${lang}-history.json`, history)
      await tab('Filter and sort', 'functions')
      for (const region of ['North', 'West', 'South', 'Missing'])
        await gate(`native-FILTER-${region}-and-tail-cleanup`, async () => {
          await edit('F2', region)
          const matches = DELIVERIES.filter((row) => row[1] === region)
          const actual = await values('E5:G13')
          if (matches.length) assert.deepEqual(actual.slice(0, matches.length), matches)
          else {
            assert.equal(actual[0][0], 'No matches')
            assert.ok(blank([actual[0].slice(1)]))
          }
          assert.ok(blank(actual.slice(matches.length || 1)), 'Shrinking spill clears previous outputs')
          await page.waitForFunction(
            (text) => window.nativePaint.includes(text),
            matches.length ? matches[0][0] : 'No matches',
          )
          await shot(`filter-${region}`)
        })
      await gate('SORT-UNIQUE-SEQUENCE-native-results', async () => {
        assert.deepEqual(
          await values('I5:K13'),
          DELIVERIES.toSorted((a, b) => b[2] - a[2]),
        )
        assert.deepEqual(await values('E18:E20'), [['North'], ['West'], ['South']])
        assert.deepEqual(await values('I18:K20'), [
          [10, 15, 20],
          [25, 30, 35],
          [40, 45, 50],
        ])
        await shot('functions')
      })
      await tab('Spill boundaries', 'boundaries')
      await gate('blocked-spill-keeps-occupying-cell', async () => {
        assert.deepEqual(await values('A4:B7'), [
          [1, 2],
          [3, 4],
          [5, 6],
          [7, 8],
        ])
        assert.equal(await value('E4'), '#SPILL!')
        assert.equal(await value('F5'), 'Occupied')
        assert.equal(await value('I4'), 'No matches')
        assert.equal(await value('A13'), 36)
        await page.waitForFunction(() => window.nativePaint.includes('#SPILL!'))
        await shot('blocked')
      })
      await gate('native-Delete-unblocks-spill', async () => {
        const box = page.locator('input.univer-size-full')
        await box.fill('F5')
        await box.press('Enter')
        await page.keyboard.press('Delete')
        await calc()
        assert.deepEqual(await values('E4:F7'), [
          [1, 2],
          [3, 4],
          [5, 6],
          [7, 8],
        ])
        await shot('unblocked')
      })
      await gate('native-anchor-shrink-clears-tail-and-recalculates-sum', async () => {
        await edit('A4', '=SEQUENCE(2,2)')
        assert.deepEqual(await values('A4:B5'), [
          [1, 2],
          [3, 4],
        ])
        assert.ok(blank(await values('A6:B7')))
        assert.equal(await value('A13'), 10)
        await page.waitForFunction(() => window.nativePaint.includes('10'))
        await shot('shrunk')
      })
      await gate('same-API-and-workbook-owner-full-save-through-themes', async () => {
        const before = await save()
        await page.evaluate(() => {
          window.themeAPI = window.univerAPI
          window.themeWorkbook = window.univerAPI.getActiveWorkbook().getWorkbook()
        })
        for (const dark of [true, false]) {
          await page.evaluate((darkMode) => window.univerAPI.toggleDarkMode(darkMode), dark)
          await page.waitForFunction((darkMode) => window.univerAPI.isDarkMode() === darkMode, dark)
          await page.getByRole('tab', { name: 'Start', exact: true }).click({ trial: true })
          assert.ok(
            await page.evaluate(
              () =>
                window.themeAPI === window.univerAPI &&
                window.themeWorkbook === window.univerAPI.getActiveWorkbook().getWorkbook(),
            ),
          )
          assert.deepEqual(await save(), before)
          await shot(dark ? 'dark' : 'light')
        }
      })
      await gate('public-same-ID-save-and-reload-full-model', async () => {
        const before = await save()
        await page.evaluate((saved) => {
          window.univerAPI.disposeUnit(saved.id)
          window.univerAPI.createWorkbook(saved)
        }, before)
        await calc()
        assert.deepEqual(await save(), before)
      })
      await page.reload()
      await ready()
      for (const [i, recipe] of recipes.entries())
        await gate(`README-literal-${i + 1}`, async () => {
          await page.evaluate(
            async (code) => await new (Object.getPrototypeOf(async function () {}).constructor)(code)(),
            recipe,
          )
          await calc()
          const check = await page.evaluate((n) => {
            const book = window.univerAPI.getActiveWorkbook()
            return n === 0
              ? book.getSheetBySheetId('range-spill').getRange('E3').getValue()
              : n === 1
                ? book.getSheetBySheetId('functions').getRange('E5').getRawValue()
                : book.getSheetBySheetId('boundaries').getRange('A13').getRawValue()
          }, i)
          assert.equal(check, [17, 'River clinic', 10][i])
        })
      await gate('no-runtime-errors-or-network-writes', () => {
        assert.deepEqual(result.errors, [])
        assert.deepEqual(result.networkWrites, [])
      })
    } catch (error) {
      result.fatal = error.stack || String(error)
    } finally {
      result.passed = !result.fatal && Object.values(result.gates).every(({ passed }) => passed)
      await page.close()
    }
  }
} finally {
  await browser.close()
  await new Promise((resolve) => server.httpServer.close(resolve))
  report.passed = report.hosts.length === 2 && report.hosts.every(({ passed }) => passed)
  await write('report.json', report)
  console.log(
    JSON.stringify(
      { output, passed: report.passed, hosts: report.hosts.map(({ lang, gates, fatal }) => ({ lang, gates, fatal })) },
      null,
      2,
    ),
  )
}
if (!report.passed) process.exitCode = 1
