/* eslint-disable no-await-in-loop -- Native feature gates run independently on both host languages. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { stripTypeScriptTypes } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import vm from 'node:vm'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const entry = JSON.parse(await fs.readFile(process.argv[2], 'utf8')).find(
  ({ slug }) => slug === 'sheets/sparkline-types',
)
assert.ok(entry?.passed)
const source = (await readShowcaseSources()).find(({ slug }) => slug === entry.slug)
for (const [name, content] of Object.entries(source.files))
  assert.equal(await fs.readFile(path.join(entry.directory, name.slice(1)), 'utf8'), content)
const recipes = [...source.files['/README.md'].matchAll(/```ts\r?\n([\s\S]*?)```/g)].map((m) => m[1])
assert.equal(recipes.length, 4)
const output = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/sparkline-native')
await fs.mkdir(output, { recursive: true })
const cleanupChecks = []
for (const mode of ['success', 'workbook-failure', 'sparkline-failure', 'cleanup-failure']) {
  let attached = false
  let disposals = 0
  let unsubscribed = 0
  const errors = []
  const root = {
    dataset: {},
    remove() {
      attached = false
    },
    setAttribute(name, value) {
      this[name] = value
    },
  }
  const container = {
    append() {
      attached = true
    },
  }
  const sheet = {
    getRange: () => ({ getRange: () => ({}), activate() {} }),
    addSparkline: () => (mode === 'sparkline-failure' || mode === 'cleanup-failure' ? undefined : {}),
    getSparklineGroupByCell: () => ({ setConfig() {} }),
  }
  const workbook = { setActiveSheet() {}, getSheetBySheetId: () => sheet, getActiveSheet: () => sheet }
  const api = {
    getCurrentLifecycleStage: () => 3,
    Enum: { LifecycleStages: { Steady: 3 } },
    Event: { LifeCycleChanged: 'stage' },
    getWorkbook: () => workbook,
    createWorkbook() {
      if (mode === 'workbook-failure') throw new Error('Injected workbook failure')
    },
    addEvent: () => ({
      dispose() {
        unsubscribed++
      },
    }),
  }
  const context = vm.createContext({
    document: { createElement: () => root },
    window: {},
    console: { error: (e) => errors.push(e) },
    createUniver: () => ({
      univerAPI: api,
      univer: {
        dispose() {
          disposals++
          if (mode === 'cleanup-failure') throw new Error('Injected cleanup failure')
        },
      },
    }),
    SparklineTypeEnum: { LINE_CHART: 1, BAR_CHART: 2, PROFIT_AND_LOSS_CHART: 3 },
    UniverSheetSparklinePlugin: {},
    UniverSheetSparklineUIPlugin: {},
    UniverSheetsCorePreset: () => ({}),
    LocaleType: { EN_US: 'enUS' },
    mergeLocales: () => ({}),
    coreEnUS: {},
    sparklineEnUS: {},
    createWorkbookData: () => ({}),
  })
  const raw = source.files['/src/create-demo.ts']
    .replace(/^import .*\r?\n/gm, '')
    .replace('export function', 'function')
  vm.runInContext(stripTypeScriptTypes(raw), context)
  if (mode === 'workbook-failure') {
    assert.throws(() => context.createDemo(container), /Injected workbook failure/)
    assert.equal(attached, false)
  } else {
    const controller = context.createDemo(container)
    if (mode === 'success') assert.equal(root.dataset.ready, 'true')
    else {
      assert.equal(root.role, 'alert')
      assert.equal(attached, true)
      assert.equal(context.window.univerAPI, undefined)
      assert.equal(errors.length, 1)
    }
    controller.dispose()
    controller.dispose()
    assert.equal(attached, false)
  }
  assert.equal(disposals, 1)
  assert.equal(unsubscribed, 1)
  cleanupChecks.push({ mode, passed: true })
}
await fs.writeFile(path.join(output, 'factory-cleanup.json'), JSON.stringify(cleanupChecks, null, 2))
const { preview } = await import(
  pathToFileURL(path.join(entry.links.find(({ name }) => name === 'vite').target, 'dist/node/index.js'))
)
const server = await preview({
  root: entry.directory,
  configFile: false,
  preview: { host: '127.0.0.1', port: 4454, strictPort: true },
})
const browser = await chromium.launch()
const report = { passed: false, sourceFiles: Object.keys(source.files).length, hosts: [] }
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
    await page.route('http://127.0.0.1:4454/', async (route) => {
      const response = await route.fetch()
      await route.fulfill({ response, body: (await response.text()).replace(/<html[^>]*>/, `<html lang="${lang}">`) })
    })
    const save = () => page.evaluate(() => window.univerAPI.getActiveWorkbook().save())
    const config = () =>
      page.evaluate(() =>
        [...window.univerAPI.getActiveWorkbook().getActiveSheet().getAllSubSparkline().values()].map((g) => g.config),
      )
    async function select(address) {
      const box = page.locator('input.univer-size-full')
      await box.fill(address)
      await box.press('Enter')
    }
    async function settle() {
      await page.evaluate(async () => {
        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
        await Promise.all(
          document
            .getAnimations()
            .filter((a) => a.effect?.getComputedTiming().iterations !== Infinity)
            .map((a) => a.finished.catch(() => {})),
        )
      })
    }
    async function shot(name) {
      await settle()
      await page.screenshot({ path: path.join(output, `${lang}-${name}.png`) })
      await fs.writeFile(path.join(output, `${lang}-${name}.txt`), await page.locator('body').innerText())
      await fs.writeFile(path.join(output, `${lang}-${name}.html`), await page.locator('body').innerHTML())
    }
    async function raster() {
      await select('A13')
      await settle()
      return page.evaluate(() => {
        const r = window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('H5').getCellRect()
        const c = [...document.querySelectorAll('canvas')].toSorted((a, b) => b.clientHeight - a.clientHeight)[0]
        const scale = c.width / c.clientWidth
        const pixels = [
          ...c
            .getContext('2d')
            .getImageData(
              Math.floor((r.x + 4) * scale),
              Math.floor((r.y + 4) * scale),
              Math.floor((r.width - 8) * scale),
              Math.floor((r.height - 8) * scale),
            ).data,
        ]
        let coloured = 0
        for (let i = 0; i < pixels.length; i += 4)
          if (pixels[i + 3] > 100 && Math.max(...pixels.slice(i, i + 3)) - Math.min(...pixels.slice(i, i + 3)) > 45)
            coloured++
        return { coloured, pixels }
      })
    }
    async function gate(name, action) {
      try {
        await action()
        result.gates[name] = { passed: true }
      } catch (error) {
        result.gates[name] = { passed: false, error: error.stack || String(error) }
        await shot(`failure-${name}`)
      }
      console.log(lang, name, result.gates[name].passed ? 'PASS' : 'FAIL')
    }
    async function tab(name) {
      await page.getByText(name, { exact: true }).first().click()
      await settle()
    }
    try {
      await page.goto('http://127.0.0.1:4454/')
      await page.waitForSelector('.sparkline-gallery[data-ready="true"]')
      await gate('English-eighteen-native-objects', async () => {
        assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), 'enUS')
        assert.deepEqual(
          await page.evaluate(() =>
            ['line', 'column', 'winloss'].map(
              (id) => window.univerAPI.getActiveWorkbook().getSheetBySheetId(id).getAllSubSparkline().size,
            ),
          ),
          [6, 6, 6],
        )
        await shot('initial')
      })
      const history = {}
      for (const [index, name] of ['Line trends', 'Column volumes', 'Win-loss signs'].entries()) {
        await gate(`native-${index + 1}-source-edit-repaints`, async () => {
          await tab(name)
          assert.equal((await config())[0].type, index + 1)
          const before = await raster()
          assert.ok(before.coloured > 20, 'Real native sparkline must be painted')
          if (index === 0) history.before = await save()
          await select('B5')
          await page.keyboard.type(index === 2 ? '9' : '30')
          await page.keyboard.press('Enter')
          await page.waitForFunction(
            (value) => window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('B5').getValue() === value,
            index === 2 ? 9 : 30,
          )
          const after = await raster()
          assert.notDeepEqual(after.pixels, before.pixels)
          if (index === 0) history.after = await save()
          await shot(`edited-${index + 1}`)
        })
        if (index === 0) {
          await gate('native-Undo-strict', async () => {
            assert.ok(history.after)
            await page.keyboard.press('Control+z')
            history.undo = await save()
            assert.deepEqual(history.undo, history.before)
          })
          await gate('native-Redo-strict', async () => {
            assert.ok(history.after)
            await page.keyboard.press('Control+y')
            history.redo = await save()
            assert.deepEqual(history.redo, history.after)
          })
        }
      }
      await fs.writeFile(path.join(output, `${lang}-history.json`), JSON.stringify(history, null, 2))
      await page.reload()
      await page.waitForSelector('.sparkline-gallery[data-ready="true"]')
      for (const [index, code] of recipes.entries())
        await gate(`literal-${index + 1}`, async () => {
          await tab(index < 2 ? 'Line trends' : index === 2 ? 'Win-loss signs' : 'Column volumes')
          const before = await raster()
          await page.evaluate(async (literal) => {
            const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
            await new AsyncFunction(literal)()
          }, code)
          const after = await raster()
          assert.notDeepEqual(after.pixels, before.pixels)
          if (index === 1) assert.equal((await config())[0].type, 2)
          if (index === 2) assert.equal((await config())[0].axis.reverse, true)
          await shot(`recipe-${index + 1}`)
        })
      await gate('native-sparkline-controls', async () => {
        await tab('Line trends')
        await select('H5')
        const point = await page.evaluate(() => {
          const r = window.univerAPI.getActiveWorkbook().getActiveSheet().getRange('H5').getCellRect()
          const c = [...document.querySelectorAll('canvas')]
            .toSorted((a, b) => b.clientHeight - a.clientHeight)[0]
            .getBoundingClientRect()
          return [c.x + r.x + r.width / 2, c.y + r.y + r.height / 2]
        })
        await page.mouse.click(point[0], point[1], { button: 'right' })
        await shot('native-context-menu')
        await page.getByText('Sparkline', { exact: true }).last().hover()
        await shot('native-context-submenu')
        await page.getByText('Edit Sparkline', { exact: true }).click()
        await page.getByText('Basic Settings', { exact: true }).waitFor()
        await page.getByText('Advanced Settings', { exact: true }).waitFor()
        await shot('native-controls')
        assert.match(await page.locator('body').innerText(), /Sparkline Settings|Edit Sparkline/)
      })
      const snapshot = await save()
      await gate('same-owner-theme-full-save', async () => {
        await page.evaluate(() => {
          window.sparklineOwner = window.univerAPI.getActiveWorkbook().getWorkbook()
          window.univerAPI.toggleDarkMode(true)
        })
        await shot('dark')
        await page.evaluate(() => window.univerAPI.toggleDarkMode(false))
        await settle()
        assert.equal(
          await page.evaluate(() => window.sparklineOwner === window.univerAPI.getActiveWorkbook().getWorkbook()),
          true,
        )
        assert.deepEqual(await save(), snapshot)
      })
      await gate('reload-strict', async () => {
        await page.evaluate((data) => {
          window.univerAPI.disposeUnit(data.id)
          window.univerAPI.createWorkbook(data)
        }, snapshot)
        await settle()
        const restored = await save()
        await fs.writeFile(
          path.join(output, `${lang}-reload.json`),
          JSON.stringify({ before: snapshot, restored }, null, 2),
        )
        assert.deepEqual(restored, snapshot)
      })
      await gate('no-runtime-errors', async () => assert.deepEqual(result.errors, []))
    } catch (error) {
      result.fatal = error.stack || String(error)
      await shot('fatal')
    } finally {
      await page.close()
    }
    result.passed = !result.fatal && Object.values(result.gates).every((g) => g.passed)
  }
  report.passed = report.hosts.every((h) => h.passed)
} finally {
  await fs.writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
  await new Promise((resolve, reject) => server.httpServer.close((error) => (error ? reject(error) : resolve())))
}
assert.ok(report.passed, `See ${output}/report.json`)
