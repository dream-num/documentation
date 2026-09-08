/* eslint-disable no-await-in-loop -- Native operations are verified independently on both host languages. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { stripTypeScriptTypes } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import vm from 'node:vm'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const entry = JSON.parse(await fs.readFile(process.argv[2], 'utf8')).find(
  ({ slug }) => slug === 'sheets/formula-errors-and-recovery',
)
assert.ok(entry?.passed)
const source = (await readShowcaseSources()).find(({ slug }) => slug === entry.slug)
for (const [name, content] of Object.entries(source.files))
  assert.equal(await fs.readFile(path.join(entry.directory, name.slice(1)), 'utf8'), content)
const recipes = [...source.files['/README.md'].matchAll(/```ts\r?\n([\s\S]*?)```/g)].map((match) => match[1])
assert.equal(recipes.length, 4)
const output = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/formula-errors-native')
await fs.mkdir(output, { recursive: true })
// Factory fault injection replaces only test boundaries, never installed SDK code.
const factoryCode = stripTypeScriptTypes(
  source.files['/src/create-demo.ts'].slice(source.files['/src/create-demo.ts'].indexOf('export function createDemo')),
).replace('export function createDemo', 'exports.createDemo = function createDemo')
const cleanupChecks = []
for (const phase of ['create', 'workbook', 'selection', 'cleanup', 'success']) {
  let disposed = 0,
    removed = 0
  const startup = new Error(phase),
    cleanup = new Error('cleanup')
  const root = {
    dataset: {},
    remove() {
      removed++
    },
  }
  const owner = {},
    exported = {}
  const api = {
    createWorkbook() {
      if (phase === 'workbook' || phase === 'cleanup') throw startup
      return {
        getActiveSheet: () => ({
          getRange: () => ({
            activate() {
              if (phase === 'selection') throw startup
            },
          }),
        }),
      }
    },
  }
  vm.runInNewContext(factoryCode, {
    exports: exported,
    window: owner,
    document: { createElement: () => root },
    AggregateError,
    coreEnUS: {},
    LocaleType: { EN_US: 'enUS' },
    createWorkbookData: () => ({}),
    UniverSheetsCorePreset: () => ({}),
    createUniver() {
      if (phase === 'create') throw startup
      return {
        univerAPI: api,
        univer: {
          dispose() {
            disposed++
            if (phase === 'cleanup') throw cleanup
          },
        },
      }
    },
  })
  const start = () => exported.createDemo({ append() {} })
  if (phase === 'success') {
    const controller = start()
    assert.equal(owner.univerAPI, api)
    controller.dispose()
    controller.dispose()
  } else
    assert.throws(start, (error) =>
      phase === 'cleanup'
        ? error instanceof AggregateError &&
          error.cause === startup &&
          error.errors[0] === startup &&
          error.errors[1] === cleanup
        : error === startup,
    )
  assert.deepEqual([disposed, removed, owner.univerAPI], [phase === 'create' ? 0 : 1, 1, undefined])
  cleanupChecks.push({ phase, passed: true })
}
const { preview } = await import(
  pathToFileURL(path.join(entry.links.find(({ name }) => name === 'vite').target, 'dist/node/index.js'))
)
const server = await preview({
  root: entry.directory,
  configFile: false,
  preview: { host: '127.0.0.1', port: 4450, strictPort: true },
})
const browser = await chromium.launch()
const report = { passed: false, sourceFiles: Object.keys(source.files).length, cleanupChecks, hosts: [] }
try {
  for (const lang of ['en-US', 'zh-CN']) {
    const result = { lang, gates: {}, errors: [] }
    report.hosts.push(result)
    const page = await browser.newPage({ viewport: { width: 1600, height: 1050 } })
    page.setDefaultTimeout(10000)
    page.on('pageerror', (error) => result.errors.push(error.message))
    page.on('console', (message) => {
      if (message.type() === 'error') result.errors.push(message.text())
    })
    await page.route('http://127.0.0.1:4450/', async (route) => {
      const response = await route.fetch()
      await route.fulfill({ response, body: (await response.text()).replace(/<html[^>]*>/, `<html lang="${lang}">`) })
    })
    // Observe real canvas text; do not replace rendering or infer paint only from model values.
    await page.addInitScript(() => {
      window.paintedFormulaText = []
      const original = CanvasRenderingContext2D.prototype.fillText
      CanvasRenderingContext2D.prototype.fillText = function (text, ...args) {
        window.paintedFormulaText.push(String(text))
        if (window.paintedFormulaText.length > 50000) window.paintedFormulaText.splice(0, 25000)
        return original.call(this, text, ...args)
      }
    })
    const save = () => page.evaluate(() => window.univerAPI.getActiveWorkbook().save())
    const values = (address) =>
      page.evaluate(
        (range) => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange(range).getValues(),
        address,
      )
    async function settle() {
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
    }
    async function shot(name) {
      await settle()
      await page.screenshot({ path: path.join(output, `${lang}-${name}.png`) })
    }
    async function gate(name, action) {
      try {
        await action()
        result.gates[name] = { passed: true }
      } catch (error) {
        result.gates[name] = { passed: false, error: error.stack || String(error) }
        await shot(`failure-${name}`)
        await page.keyboard.press('Escape')
      }
      console.log(lang, name, result.gates[name].passed ? 'PASS' : 'FAIL')
    }
    async function waitValue(address, expected) {
      await page.waitForFunction(
        ({ range, value }) =>
          window.univerAPI.getActiveWorkbook().getActiveSheet().getRange(range).getValue() === value,
        { range: address, value: expected },
      )
    }
    async function fresh(tab = 'Six formula errors') {
      await page.goto('http://127.0.0.1:4450/')
      await page.waitForSelector('.formula-errors-gallery[data-ready="true"]')
      await page.getByText(tab, { exact: true }).first().click()
      await waitValue('D5', tab === 'IFERROR versus IFNA' ? '#N/A' : '#DIV/0!')
      await settle()
    }
    async function edit(address, value) {
      const nameBox = page.locator('input.univer-size-full')
      await nameBox.fill(address)
      await nameBox.press('Enter')
      await page.keyboard.type(value)
      await page.keyboard.press('Enter')
    }
    try {
      await fresh()
      await gate('six-calculated-errors-and-native-paint', async () => {
        assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), 'enUS')
        const errors = ['#DIV/0!', '#N/A', '#VALUE!', '#REF!', '#NAME?', '#NUM!']
        assert.deepEqual(
          await values('D5:D10'),
          errors.map((value) => [value]),
        )
        await page.waitForFunction(
          (expected) => expected.every((value) => window.paintedFormulaText.includes(value)),
          errors,
        )
        await shot('initial')
      })
      const history = {}
      await gate('native-source-division-repair', async () => {
        history.before = await save()
        await edit('C5', '7')
        await waitValue('D5', 12)
        history.after = await save()
        assert.equal(history.after.sheets.errors.cellData[4][3].f, '=B5/C5')
        await shot('division-repaired')
      })
      await gate('native-Undo-strict', async () => {
        await page.keyboard.press('Control+z')
        await waitValue('D5', '#DIV/0!')
        history.undo = await save()
        assert.deepEqual(history.undo, history.before)
      })
      await gate('native-Redo-strict', async () => {
        await page.keyboard.press('Control+y')
        await waitValue('D5', 12)
        history.redo = await save()
        assert.deepEqual(history.redo, history.after)
      })
      await fs.writeFile(path.join(output, `${lang}-history.json`), JSON.stringify(history, null, 2))
      for (const [address, replacement, resultAddress, expected] of [
        ['B6', 'Wood', 'D6', 1],
        ['B7', '9', 'D7', 14],
        ['B8', 'B5', 'D8', 84],
        ['D9', '=SUM(B9,3)', 'D9', 15],
        ['B10', '9', 'D10', 3],
      ])
        await gate(`native-repair-${resultAddress}`, async () => {
          await edit(address, replacement)
          await waitValue(resultAddress, expected)
          await shot(`repaired-${resultAddress}`)
        })
      await gate('native-selective-recovery-and-source-edits', async () => {
        await fresh('IFERROR versus IFNA')
        assert.deepEqual(await values('D5:F7'), [
          ['#N/A', 'Check input', 'Not stocked'],
          ['#DIV/0!', 'Check input', '#DIV/0!'],
          [5, 5, 5],
        ])
        await shot('selective-recovery')
        await edit('B5', 'Maple')
        await waitValue('F5', 1)
        await edit('C6', '4')
        await waitValue('F6', 18)
        assert.deepEqual(await values('D5:F6'), [
          [1, 1, 1],
          [18, 18, 18],
        ])
        await shot('recovery-repaired')
      })
      await gate('native-dependent-chain', async () => {
        await fresh('Dependent results')
        assert.deepEqual(await values('D5:F5'), [['#DIV/0!', '#DIV/0!', 'Enter attendees']])
        await edit('C5', '6')
        await waitValue('F5', 24)
        assert.deepEqual(await values('D5:F5'), [[16, 24, 24]])
        await shot('dependent-repaired')
      })
      for (const [index, code] of recipes.entries())
        await gate(`literal-${index + 1}`, async () => {
          await fresh()
          await page.evaluate((literal) => new Function(literal)(), code)
          await waitValue(['D5', 'F5', 'D9', 'F5'][index], [12, 'Order material', 15, 24][index])
          if (index === 1) {
            assert.equal((await values('D5'))[0][0], '#N/A')
            assert.equal((await values('F6'))[0][0], '#DIV/0!')
          }
          if (index === 3) assert.deepEqual(await values('D5:F5'), [[16, 24, 24]])
          await shot(`recipe-${index + 1}`)
        })
      const snapshot = await save()
      await gate('same-owner-theme-full-save', async () => {
        await page.evaluate(() => {
          window.formulaErrorOwner = window.univerAPI.getActiveWorkbook().getWorkbook()
          window.univerAPI.toggleDarkMode(true)
        })
        await page.locator('[data-u-comp^="workbench-skeleton-"]').first().waitFor({ state: 'detached' })
        await page.getByRole('tab', { name: 'Start', exact: true }).click({ trial: true })
        await page
          .locator('[data-u-command="sheet.command.set-range-text-color"][data-disabled="false"]')
          .first()
          .click({ trial: true })
        await shot('dark')
        await page.evaluate(() => window.univerAPI.toggleDarkMode(false))
        await settle()
        assert.equal(
          await page.evaluate(() => window.formulaErrorOwner === window.univerAPI.getActiveWorkbook().getWorkbook()),
          true,
        )
        assert.deepEqual(await save(), snapshot)
      })
      await gate('reload-strict', async () => {
        await page.evaluate((data) => {
          window.univerAPI.disposeUnit(data.id)
          window.univerAPI.createWorkbook(data)
        }, snapshot)
        await page.getByText('Dependent results', { exact: true }).first().click()
        await waitValue('F5', 24)
        assert.deepEqual(await save(), snapshot)
      })
      await gate('no-runtime-errors', async () => assert.deepEqual(result.errors, []))
    } catch (error) {
      result.fatal = error.stack || String(error)
      await shot('fatal')
    } finally {
      await page.close()
    }
    result.passed = !result.fatal && Object.values(result.gates).every((item) => item.passed)
  }
  report.passed = report.hosts.every((host) => host.passed)
} finally {
  await fs.writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
  await new Promise((resolve, reject) => server.httpServer.close((error) => (error ? reject(error) : resolve())))
}
assert.ok(report.passed, `See ${output}/report.json`)
