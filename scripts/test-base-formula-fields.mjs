/* eslint-disable no-await-in-loop -- Native edits and recalculation are ordered. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import { stripTypeScriptTypes } from 'node:module'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import vm from 'node:vm'

import { chromium } from 'playwright'

// Execute the actual factory with stubbed SDK boundaries for fault paths only.
// These assertions are not native SDK acceptance and do not change SDK files.
const startupFaults = []
for (const gallery of ['formula-fields', 'attachment-fields']) {
  const factorySource = await fs.readFile(`showcase/bases/${gallery}/code/create-demo.ts`, 'utf8')
  const factoryCode = stripTypeScriptTypes(
    factorySource.slice(factorySource.indexOf('export function createDemo')),
  ).replace('export function createDemo', 'exports.createDemo = function createDemo')
  for (const phase of ['table', 'view', 'cleanup']) {
    const startup = new Error('Injected ' + phase + ' activation failure')
    const cleanup = new Error('Injected cleanup failure')
    const nodes = [],
      logged = [],
      released = []
    const owner = {},
      exported = {}
    const api = {
      Enum: { LifecycleStages: { Rendered: 3 } },
      Event: { LifeCycleChanged: 'lifecycle' },
      addEvent: () => ({ dispose: () => released.push('event') }),
      getCurrentLifecycleStage: () => 3,
      createBase() {},
      disposeUnit: () => released.push('unit'),
      getBaseUI: () => ({
        async activateTable() {
          if (phase !== 'view') throw startup
        },
        async activateView() {
          throw startup
        },
        openLeftSidebar() {},
      }),
    }
    const context = {
      exports: exported,
      window: owner,
      AggregateError,
      document: {
        createElement: (tag) => {
          const node = {
            tag,
            dataset: {},
            removed: 0,
            remove() {
              this.removed++
            },
            setAttribute() {},
            prepend() {},
          }
          nodes.push(node)
          return node
        },
      },
      console: { error: (error) => logged.push(error) },
      LocaleType: { EN_US: 'enUS' },
      mergeLocales: () => ({}),
      createData: () => ({}),
      unmount: () => released.push('unmount'),
      FUniver: { newAPI: () => api },
      Univer: class {
        registerPlugin() {}
        dispose() {
          released.push('univer')
          if (phase === 'cleanup') throw cleanup
        }
      },
    }
    for (const name of [
      'DesignEnUS',
      'UIEnUS',
      'DocsUIEnUS',
      'BasesEnUS',
      'BasesUIEnUS',
      'EngineFormulaEnUS',
      'UniverRenderEnginePlugin',
      'UniverUIPlugin',
      'UniverDocsPlugin',
      'UniverDocsUIPlugin',
      'UniverDrawingPlugin',
      'UniverLicensePlugin',
      'UniverProFormulaEnginePlugin',
      'UniverBasesPlugin',
      'UniverBasesUIPlugin',
    ])
      context[name] = {}
    vm.runInNewContext(factoryCode, context)
    const demo = exported.createDemo({ append() {} })
    await demo.ready
    assert.deepEqual(released, ['event', 'unmount', 'unit', 'univer'])
    assert.equal(owner.univerAPI, undefined)
    assert.equal(nodes[0].removed, 1)
    assert.equal(nodes[1].textContent, `The ${gallery.replaceAll('-', ' ')} demo could not load. Reload to retry.`)
    assert.equal(nodes[1].removed, 0)
    assert.equal(logged.length, 1)
    if (phase === 'cleanup') {
      assert.equal(logged[0].cause, startup)
      assert.equal(logged[0].errors[0], startup)
      assert.equal(logged[0].errors[1].errors[0], cleanup)
    } else assert.equal(logged[0], startup)
    demo.dispose()
    assert.equal(nodes[1].removed, 1)
    assert.equal(released.length, 4)
    startupFaults.push({ gallery, phase, passed: true })
  }
}
if (process.argv.includes('--startup-only')) {
  const report = { scope: 'Actual factories with stubbed SDK fault boundaries only', startupFaults }
  const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/base-startup-faults')
  await fs.mkdir(directory, { recursive: true })
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  process.exit(0)
}

const entry = JSON.parse(await fs.readFile(process.argv[2], 'utf8')).find(({ slug }) => slug === 'bases/formula-fields')
assert.ok(entry?.passed)
const output = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/base-formula-native')
await fs.mkdir(output, { recursive: true })
const recipes = [
  ...(await fs.readFile('showcase/bases/formula-fields/README.md', 'utf8')).matchAll(/```ts\r?\n([\s\S]*?)```/g),
].map((match) => match[1])
assert.equal(recipes.length, 4)
const { preview } = await import(
  pathToFileURL(path.join(entry.links.find(({ name }) => name === 'vite').target, 'dist/node/index.js'))
)
const server = await preview({
  root: entry.directory,
  configFile: false,
  preview: { host: '127.0.0.1', port: 4452, strictPort: true },
})
const browser = await chromium.launch()
const results = []
try {
  for (const [locale, timezoneId] of [
    ['en-US', 'UTC'],
    ['zh-CN', 'Asia/Shanghai'],
    ['en-US', 'America/Los_Angeles'],
  ]) {
    const label = timezoneId === 'America/Los_Angeles' ? 'en-US-los-angeles' : locale
    const result = { locale, timezoneId, passed: false, strictDatePaint: true, gates: [], errors: [] }
    results.push(result)
    const page = await browser.newPage({
      viewport: { width: 1500, height: 1000 },
      locale,
      timezoneId,
    })
    page.setDefaultTimeout(15000)
    page.on('pageerror', (error) => result.errors.push(String(error)))
    page.on('console', (message) => {
      if (message.type() === 'error') result.errors.push(message.text())
    })
    await page.route('http://127.0.0.1:4452/', async (route) => {
      const response = await route.fetch()
      await route.fulfill({ response, body: (await response.text()).replace(/<html[^>]*>/, `<html lang="${locale}">`) })
    })
    await page.addInitScript(() => {
      window.formulaPaint = []
      const fillText = CanvasRenderingContext2D.prototype.fillText
      CanvasRenderingContext2D.prototype.fillText = function (text, ...args) {
        const p = this.getTransform().transformPoint({ x: args[0], y: args[1] })
        const rect = this.canvas.getBoundingClientRect()
        window.formulaPaint.push({
          text: String(text),
          x: rect.x + (p.x * rect.width) / this.canvas.width,
          y: rect.y + (p.y * rect.height) / this.canvas.height,
        })
        window.formulaPaint = window.formulaPaint.slice(-20000)
        return fillText.call(this, text, ...args)
      }
    })
    const snap = () => page.evaluate(() => window.univerAPI.getActiveBase().save())
    const shot = (name) => page.screenshot({ path: path.join(output, `${label}-${name}.png`) })
    try {
      await page.goto('http://127.0.0.1:4452/')
      await page.locator('[data-ready=true]').waitFor({ timeout: 60000 })
      await page.waitForFunction(
        () => window.univerAPI.getActiveBase().getTableById('batches').getRecordById('mug').getValue('cost') === 96,
      )
      const initial = await snap()
      result.readback = await page.evaluate(() =>
        window.univerAPI
          .getActiveBase()
          .getTableById('batches')
          .getRecords()
          .map((record) => record.getValues()),
      )
      assert.deepEqual(
        result.readback.map(({ cost, days, ratio, safe, status }) => ({ cost, days, ratio, safe, status })),
        [
          { cost: 96, days: 2, ratio: 4, safe: 4, status: 'Ready' },
          { cost: 110, days: 4, ratio: '#DIV/0!', safe: 'Check hours', status: 'Ready' },
          { cost: 0, days: 7, ratio: 0, safe: 0, status: 'Not scheduled' },
          { cost: 0, days: '', ratio: '#DIV/0!', safe: 'Check hours', status: 'Missing quantity' },
          { cost: 144, days: 12, ratio: 2, safe: 2, status: 'Ready' },
          { cost: 90, days: 15, ratio: 2, safe: 2, status: 'Ready' },
        ],
      )
      assert.deepEqual(
        result.readback.map(({ due }) => due),
        [46815, 46817, 46820, null, 46825, 46828],
      )
      assert.equal(result.readback[3].units, null)
      assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), 'enUS')
      result.gates.push('all six calculated fields and identical integer date-only serials; no cached host outputs')
      for (const id of ['cost', 'labels', 'errors']) {
        await page.evaluate(() => {
          window.formulaPaint = []
        })
        await page.locator(`[data-u-comp="base-view-tab"][data-view-id="${id}"]`).click()
        await page.waitForTimeout(200)
        const paint = await page.evaluate(() => window.formulaPaint.map(({ text }) => text))
        for (const expected of id === 'cost'
          ? ['96.00', 'Missing quantity']
          : id === 'labels'
            ? ['Speckled mugs / Ready', '15']
            : ['#DIV/0!', 'Check hours'])
          assert.ok(paint.includes(expected), 'native paint: ' + expected)
        if (id === 'labels') {
          result.datePaint = [...new Set(paint.filter((text) => /^2028-03-\d\d$/.test(text)))]
          try {
            assert.ok(paint.includes('2028-03-03'), 'native Due must display the authored March 3 date')
          } catch (error) {
            result.strictDatePaint = false
            result.datePaintFailure = String(error)
          }
        }
        assert.deepEqual(await snap(), initial)
        assert.doesNotMatch(await page.locator('#app').innerText(), /[\u3400-\u9fff]/)
        await shot(id)
      }
      result.gates.push(
        'three native tabs show actual computed numeric/text/error paint; date display gate separate; full model unchanged',
      )
      await page.locator('[data-u-comp="base-view-tab"][data-view-id="cost"]').click()
      await page.waitForTimeout(150)
      const point = await page.evaluate(() =>
        window.formulaPaint.findLast(({ text, y }) => text === 'Speckled mugs' && y > 120),
      )
      assert.ok(point)
      await page.mouse.dblclick(585, point.y - 3)
      await page.keyboard.press('ControlOrMeta+A')
      await page.keyboard.type('16')
      await page.keyboard.press('Enter')
      await page.waitForFunction(
        () => window.univerAPI.getActiveBase().getTableById('batches').getRecordById('mug').getValue('cost') === 128,
      )
      const edited = await snap()
      for (const id of ['vase', 'bowl', 'tile', 'pitcher', 'planter'])
        assert.deepEqual(edited.tables.batches.records[id], initial.tables.batches.records[id])
      await page.waitForFunction(() => window.formulaPaint.some(({ text }) => text === '128.00'))
      await shot('native-units-edit')
      result.gates.push('real native Units keyboard edit recalculates and paints 128.00; other five records exact')
      await page.reload()
      await page.locator('[data-ready=true]').waitFor({ timeout: 60000 })
      await page.waitForFunction(
        () => window.univerAPI.getActiveBase().getTableById('batches').getRecordById('mug').getValue('cost') === 96,
      )
      for (const [index, code] of recipes.entries()) {
        await page.evaluate(() => {
          window.formulaPaint = []
        })
        await page.locator(`[data-u-comp="base-view-tab"][data-view-id="${index === 2 ? 'errors' : 'cost'}"]`).click()
        await page.evaluate((snippet) => {
          const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
          return new AsyncFunction('univerAPI', snippet)(window.univerAPI)
        }, code)
        if (index === 1)
          await page.waitForFunction(
            () =>
              window.univerAPI.getActiveBase().getTableById('batches').getRecordById('mug').getValue('cost') === 120,
          )
        if (index === 2)
          await page.waitForFunction(
            () =>
              window.univerAPI.getActiveBase().getTableById('batches').getRecordById('vase').getValue('safe') === 2.5,
          )
        if (index === 3)
          await page.waitForFunction(
            () =>
              window.univerAPI.getActiveBase().getTableById('batches').getRecordById('mug').getValue('cost') === 132,
          )
        await page.waitForTimeout(150)
        const current = await snap()
        if (index === 0) assert.deepEqual(current, initial)
        for (const recordId of ['mug', 'vase', 'bowl', 'tile', 'pitcher', 'planter']) {
          for (const fieldId of ['item', 'rate', 'due'])
            assert.deepEqual(
              current.tables.batches.records[recordId].values[fieldId],
              initial.tables.batches.records[recordId].values[fieldId],
            )
        }
        const expected = ['96.00', '120.00', '2.5', '132.00'][index]
        await page.waitForFunction((text) => window.formulaPaint.some((part) => part.text === text), expected)
        await shot('recipe-' + (index + 1))
      }
      result.gates.push(
        'four literal README recipes, numeric source and zero-divisor repair and formula-wide replacement',
      )
      const saved = await snap()
      await page.evaluate(() => {
        window.formulaOwner = window.univerAPI
        window.univerAPI.toggleDarkMode(true)
      })
      await page.waitForTimeout(250)
      await shot('dark')
      assert.deepEqual(await snap(), saved)
      await page.evaluate(() => window.univerAPI.toggleDarkMode(false))
      await page.waitForTimeout(250)
      assert.deepEqual(await snap(), saved)
      assert.equal(await page.evaluate(() => window.formulaOwner === window.univerAPI), true)
      result.gates.push('same owner and exact full saved model through dark/light')
      await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
      await page.waitForFunction(() => !window.univerAPI && !document.querySelector('.base-formula-fields'))
      result.gates.push('real pagehide disposal removes owner and root')
      assert.deepEqual(result.errors, [])
      result.interactionsPassed = true
      result.passed = result.strictDatePaint
    } catch (error) {
      result.failure = String(error)
      await shot('failure')
    } finally {
      await page.close()
      await fs.writeFile(
        path.join(output, 'report.json'),
        JSON.stringify({ manifest: process.argv[2], startupFaults, results }, null, 2),
      )
    }
  }
} finally {
  await browser.close()
  await server.close()
}
console.log(
  JSON.stringify(
    results.map(({ locale, passed, failure, readback }) => ({ locale, passed, failure, readback })),
    null,
    2,
  ),
)
assert.ok(
  results.every(({ passed, errors, strictDatePaint }) => passed && !errors.length && strictDatePaint),
  'All native gates, including strict date display, must pass',
)
