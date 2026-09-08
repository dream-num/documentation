/* eslint-disable no-await-in-loop -- Verify native table changes independently on both host languages. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { stripTypeScriptTypes } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import vm from 'node:vm'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const entry = JSON.parse(await fs.readFile(process.argv[2], 'utf8')).find(
  ({ slug }) => slug === 'sheets/table-create-and-resize',
)
assert.ok(entry?.passed)
const source = (await readShowcaseSources()).find(({ slug }) => slug === entry.slug)
for (const [name, content] of Object.entries(source.files))
  assert.equal(await fs.readFile(path.join(entry.directory, name.slice(1)), 'utf8'), content)
const recipes = [...source.files['/README.md'].matchAll(/```ts\r?\n([\s\S]*?)```/g)].map((match) => match[1])
assert.equal(recipes.length, 4)
const output = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/table-create-resize-native')
await fs.mkdir(output, { recursive: true })
const cleanupChecks = []
const factorySource = source.files['/src/create-demo.ts']
  .replace(/^import .*\r?\n/gm, '')
  .replace('export function', 'function')
for (const mode of ['success', 'create', 'subscribe', 'workbook', 'first-table', 'second-table', 'cleanup-error']) {
  const calls = { remove: 0, dispose: 0, unsubscribe: 0, tables: 0, errors: [] }
  const root = { dataset: {}, remove: () => calls.remove++ }
  const failure = new Error(mode)
  const sheet = {
    getRange: () => ({ getRange: () => ({}), activate() {} }),
    async addTable() {
      calls.tables++
      if (mode === 'first-table' || mode === 'cleanup-error') return false
      return !(mode === 'second-table' && calls.tables === 2)
    },
  }
  const api = {
    Enum: { LifecycleStages: { Steady: 3 } },
    Event: { LifeCycleChanged: 'stage' },
    getCurrentLifecycleStage: () => 3,
    getWorkbook: () => ({ getSheetBySheetId: () => sheet, setActiveSheet() {} }),
    addEvent() {
      if (mode === 'subscribe') throw failure
      return { dispose: () => calls.unsubscribe++ }
    },
    createWorkbook() {
      if (mode === 'workbook') throw failure
    },
  }
  const context = vm.createContext({
    document: { createElement: () => root },
    window: {},
    console: { error: (e) => calls.errors.push(e) },
    createUniver() {
      if (mode === 'create') throw failure
      return {
        univerAPI: api,
        univer: {
          dispose() {
            calls.dispose++
            if (mode === 'cleanup-error') throw failure
          },
        },
      }
    },
    UniverSheetsCorePreset: () => ({}),
    UniverSheetsTablePreset: () => ({}),
    LocaleType: { EN_US: 'enUS' },
    mergeLocales: () => ({}),
    coreEnUS: {},
    tableEnUS: {},
    createWorkbookData: () => ({}),
  })
  vm.runInContext(stripTypeScriptTypes(factorySource), context)
  let controller
  let thrown
  try {
    controller = context.createDemo({ append() {} })
  } catch (error) {
    thrown = error
  }
  await new Promise((resolve) => setImmediate(resolve))
  if (mode === 'success') {
    assert.equal(root.dataset.ready, 'true')
    controller.dispose()
    controller.dispose()
  } else if (['create', 'subscribe', 'workbook'].includes(mode)) assert.equal(thrown, failure)
  else {
    assert.equal(calls.errors.length, 1)
    assert.equal(root.dataset.ready, undefined)
    controller.dispose()
  }
  assert.equal(calls.remove, 1)
  assert.equal(calls.dispose, mode === 'create' ? 0 : 1)
  assert.equal(context.window.univerAPI, undefined)
  if (mode === 'cleanup-error') assert.equal(calls.errors[0].errors.length, 2)
  cleanupChecks.push({ mode, passed: true, ...calls, errors: calls.errors.map(String) })
}
await fs.writeFile(path.join(output, 'factory-cleanup.json'), JSON.stringify(cleanupChecks, null, 2))
const vite = entry.links.find(({ name }) => name === 'vite')
const { preview } = await import(pathToFileURL(path.join(vite.target, 'dist/node/index.js')))
const server = await preview({
  root: entry.directory,
  configFile: false,
  preview: { host: '127.0.0.1', port: 4454, strictPort: true },
})
const browser = await chromium.launch()
const report = { passed: false, sourceFiles: Object.keys(source.files).length, cleanupChecks, hosts: [] }
try {
  for (const lang of ['en-US', 'zh-CN']) {
    const result = { lang, gates: {}, errors: [] }
    report.hosts.push(result)
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } })
    page.setDefaultTimeout(10000)
    page.on('pageerror', (error) => result.errors.push(error.message))
    page.on('console', (message) => {
      if (message.type() === 'error') result.errors.push(message.text())
    })
    await page.route('http://127.0.0.1:4454/', async (route) => {
      const response = await route.fetch()
      await route.fulfill({ response, body: (await response.text()).replace(/<html[^>]*>/, `<html lang="${lang}">`) })
    })
    const save = () => page.evaluate(() => window.univerAPI.getActiveWorkbook().save())
    const values = () =>
      page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('A4:C10').getValues())
    const table = () => page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().getSubTableInfos()[0])
    async function select(address) {
      const box = page.locator('input.univer-size-full')
      await box.fill(address)
      await box.press('Enter')
    }
    async function shot(name) {
      await page.evaluate(async () => {
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
        await Promise.all(
          document
            .getAnimations()
            .filter((a) => a.effect?.getComputedTiming().iterations !== Infinity)
            .map((a) => a.finished.catch(() => {})),
        )
      })
      await page.screenshot({ path: path.join(output, `${lang}-${name}.png`) })
      await fs.writeFile(path.join(output, `${lang}-${name}.txt`), await page.locator('body').innerText())
      await fs.writeFile(path.join(output, `${lang}-${name}.html`), await page.locator('body').innerHTML())
    }
    async function gate(name, action) {
      try {
        await action()
        result.gates[name] = { passed: true }
      } catch (error) {
        result.gates[name] = { passed: false, error: error.stack || String(error) }
        await shot(`failure-${name}`)
        const cancel = page.getByRole('button', { name: 'Cancel', exact: true })
        if (await cancel.isVisible()) await cancel.click()
        await page.keyboard.press('Escape')
      }
      console.log(lang, name, result.gates[name].passed ? 'PASS' : 'FAIL')
    }
    async function tab(name) {
      await page.getByText(name, { exact: true }).first().click()
      await select('A5')
    }
    async function menu() {
      await select('A5')
      const point = await page.evaluate(() => {
        const r = window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('A4').getCellRect()
        const c = [...document.querySelectorAll('canvas')]
          .toSorted((a, b) => b.clientHeight - a.clientHeight)[0]
          .getBoundingClientRect()
        const name = window.univerAPI.getActiveWorkbook().getActiveSheet().getSubTableInfos()[0].name
        return { x: r.x + c.x + Math.max(122, Math.min(240, name.length * 8.5 + 54)) - 15, y: r.y + c.y - 14 }
      })
      await page.mouse.click(point.x, point.y)
      await page.getByText('Update Table Range', { exact: true }).waitFor()
    }
    async function resize(address) {
      await menu()
      await page.getByText('Update Table Range', { exact: true }).click()
      await shot('range-dialog')
      await page.locator('canvas').last().click()
      await page.keyboard.press('Control+a')
      await page.keyboard.insertText(address)
      await page.keyboard.press('Enter')
      const confirm = page.getByRole('button', { name: 'Confirm', exact: true })
      if (await confirm.isVisible()) await confirm.click()
    }
    try {
      await page.goto('http://127.0.0.1:4454/')
      await page.waitForSelector('.table-range-gallery[data-ready="true"]')
      await gate('English-initial-real-table', async () => {
        assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), 'enUS')
        assert.equal((await table()).id, 'deliveries')
        assert.equal((await table()).range.endRow, 7)
        assert.equal(
          await page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().getTableByCell(9, 0)),
          undefined,
        )
        await shot('initial')
      })
      const history = { before: await save(), values: await values() }
      await gate('native-expand-membership-data-intact', async () => {
        await resize('A4:C10')
        assert.equal((await table()).range.endRow, 9)
        assert.deepEqual(await values(), history.values)
        assert.equal(
          await page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().getTableByCell(9, 0)?.id),
          'deliveries',
        )
        history.after = await save()
        await shot('expanded')
      })
      await gate('native-expand-Undo-strict', async () => {
        assert.ok(history.after, 'Native expansion prerequisite must pass')
        await select('A5')
        await page.keyboard.press('Control+z')
        history.undo = await save()
        assert.deepEqual(history.undo, history.before)
      })
      await gate('native-expand-Redo-strict', async () => {
        assert.ok(history.after, 'Native expansion prerequisite must pass')
        await page.keyboard.press('Control+y')
        history.redo = await save()
        assert.deepEqual(history.redo, history.after)
      })
      await gate('native-shrink-data-preserved', async () => {
        await tab('Shrink a table')
        const before = await values()
        await resize('A4:C8')
        assert.equal((await table()).range.endRow, 7)
        assert.deepEqual(await values(), before)
        assert.equal(
          await page.evaluate(() => window.univerAPI.getActiveWorkbook().getActiveSheet().getTableByCell(9, 0)),
          undefined,
        )
        await shot('shrunk')
      })
      await gate('native-create-from-ordinary-cells', async () => {
        await tab('Create from cells')
        const before = await values()
        await select('A4:C10')
        await page.getByRole('tab', { name: 'Data', exact: true }).click()
        await shot('create-toolbar')
        await page.locator('[data-u-command="sheet.operation.open-table-selector"]').click()
        await page.getByRole('button', { name: 'Confirm', exact: true }).click()
        assert.equal((await table()).range.endRow, 9)
        assert.deepEqual(await values(), before)
        await shot('created')
      })
      await fs.writeFile(path.join(output, `${lang}-history.json`), JSON.stringify(history, null, 2))
      // Recipes start from a fresh authored specimen, as required by recipe 1.
      await page.reload()
      await page.waitForSelector('.table-range-gallery[data-ready="true"]')
      for (const [index, recipe] of recipes.entries())
        await gate(`literal-${index + 1}`, async () => {
          await page.evaluate(async (code) => {
            const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
            await new AsyncFunction(code)()
          }, recipe)
          await tab(index === 0 ? 'Create from cells' : index === 2 ? 'Shrink a table' : 'Expand a table')
          const actual = await table()
          if (index === 0) assert.equal(actual.id, 'tools')
          if (index === 1) assert.equal(actual.range.endRow, 9)
          if (index === 2) {
            assert.equal(actual.range.endRow, 7)
            assert.equal((await values())[6][0], 'Graphite blocks')
          }
          if (index === 3) {
            assert.equal(actual.id, 'deliveries')
            assert.equal(actual.name, 'StudioDeliveries')
          }
          await shot(`recipe-${index + 1}`)
        })
      let reloadSnapshot
      await gate('same-owner-theme-full-save', async () => {
        const before = await save()
        await page.evaluate(() => {
          window.tableOwner = window.univerAPI.getActiveWorkbook().getWorkbook()
          window.univerAPI.toggleDarkMode(true)
        })
        await shot('dark')
        await page.evaluate(() => window.univerAPI.toggleDarkMode(false))
        assert.equal(
          await page.evaluate(() => window.tableOwner === window.univerAPI.getActiveWorkbook().getWorkbook()),
          true,
        )
        assert.deepEqual(await save(), before)
        reloadSnapshot = before
      })
      await gate('reload-strict', async () => {
        assert.ok(reloadSnapshot)
        await page.evaluate((data) => {
          window.univerAPI.disposeUnit(data.id)
          window.univerAPI.createWorkbook(data)
        }, reloadSnapshot)
        const restored = await save()
        await fs.writeFile(
          path.join(output, `${lang}-reload.json`),
          JSON.stringify({ before: reloadSnapshot, restored }, null, 2),
        )
        assert.deepEqual(restored, reloadSnapshot)
      })
      await gate('no-runtime-errors', async () => assert.deepEqual(result.errors, []))
    } catch (error) {
      result.fatal = error.stack || String(error)
    } finally {
      await page.close()
    }
    result.passed = !result.fatal && Object.values(result.gates).every((g) => g.passed)
  }
  report.passed = report.hosts.every((host) => host.passed)
} finally {
  await fs.writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
  await new Promise((resolve, reject) => server.httpServer.close((error) => (error ? reject(error) : resolve())))
}
assert.ok(report.passed, `See ${output}/report.json`)
