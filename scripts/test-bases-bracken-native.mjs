/* eslint-disable no-await-in-loop -- Native field edits and their readbacks run in order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/bracken-native')
await fs.mkdir(directory, { recursive: true })
const readme = await fs.readFile('showcase/bases/text-number-currency/code/README.md', 'utf8')
const examples = [...readme.matchAll(/\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g)].map((match) => match[1])
assert.equal(examples.length, 23)
const restore = [...readme.matchAll(/\x60\x60\x60js\r?\n([\s\S]*?)\x60\x60\x60/g)][0][1]
const buildStandalone = process.env.SHOWCASE_BUILD_STANDALONE === '1'
const url =
  process.env.SHOWCASE_DEMO_URL ||
  (buildStandalone
    ? 'http://127.0.0.1:4356'
    : `${process.env.SHOWCASE_BASE_URL || 'http://localhost:3030'}/en-US/playground/bases/text-number-currency`)
let server
if (buildStandalone) {
  const exportDirectory =
    process.env.SHOWCASE_EXPORT_DIRECTORY || (await fs.mkdtemp(path.join(os.tmpdir(), 'univer-bracken-native-')))
  const source = (await readShowcaseSources()).find((entry) => entry.slug === 'bases/text-number-currency')
  for (const [name, content] of Object.entries(source.files)) {
    const target = path.join(exportDirectory, name.slice(1))
    await fs.mkdir(path.dirname(target), { recursive: true })
    await fs.writeFile(target, content)
  }
  // Use exact installed package versions; never mutate another preview's dependency directory.
  const manifest = JSON.parse(source.files['/package.json'])
  const viteDirectory = process.env.SHOWCASE_VITE_DIRECTORY || path.join(exportDirectory, 'node_modules', 'vite')
  const vitePackage = await fs.realpath(viteDirectory).catch(() => {
    throw new Error(
      `Vite ${manifest.devDependencies.vite} is unavailable at ${viteDirectory}. Reuse SHOWCASE_EXPORT_DIRECTORY with its installed node_modules/vite, set SHOWCASE_VITE_DIRECTORY to that exact installed Vite package directory, or run pnpm install in the generated selected export ${exportDirectory} and reuse it. No other demo's output is required.`,
    )
  })
  const linkedVersions = {}
  for (const [name, version] of Object.entries({ ...manifest.dependencies, ...manifest.devDependencies })) {
    const installed = name === 'vite' ? vitePackage : await fs.realpath(path.join(process.cwd(), 'node_modules', name))
    const actual = JSON.parse(await fs.readFile(path.join(installed, 'package.json'), 'utf8')).version
    assert.equal(actual, version, 'Use the exact exported version of ' + name)
    const target = path.join(exportDirectory, 'node_modules', name)
    await fs.mkdir(path.dirname(target), { recursive: true })
    if (await fs.lstat(target).catch(() => null)) assert.equal(await fs.realpath(target), installed)
    else await fs.symlink(installed, target, 'junction')
    linkedVersions[name] = actual
  }
  await fs.writeFile(path.join(directory, 'linked-versions.json'), JSON.stringify(linkedVersions, null, 2))
  await fs.writeFile(
    path.join(directory, 'exports.json'),
    JSON.stringify([{ slug: source.slug, directory: exportDirectory }], null, 2),
  )
  const { build, preview } = await import(
    pathToFileURL(path.join(exportDirectory, 'node_modules/vite/dist/node/index.js')).href
  )
  const outDir = path.join(directory, 'harness-dist')
  await build({
    root: exportDirectory,
    configFile: false,
    logLevel: 'warn',
    build: { outDir, emptyOutDir: false },
    plugins: [
      {
        name: 'bracken-native-harness',
        transformIndexHtml: {
          order: 'pre',
          handler:
            () => `<!doctype html><html lang="en-US"><head><link rel="icon" href="data:,"></head><body style="margin:0"><div id="app" style="height:100vh"></div><script type="module">
import {createDemo} from '/src/create-demo.ts';import {createData} from '/src/data.ts';window.createDemo=createDemo;window.createData=createData;window.container=document.getElementById('app');window.demo=createDemo(window.container);
</script></body></html>`,
        },
      },
    ],
  })
  server = await preview({
    root: exportDirectory,
    configFile: false,
    build: { outDir },
    preview: { host: '127.0.0.1', port: 4356, strictPort: true },
  })
}
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1100 }, acceptDownloads: true })
page.setDefaultTimeout(20000)
const report = {
  passed: false,
  checks: [],
  gates: {},
  knownIssues: [],
  expectedDiagnostics: [],
  errors: [],
  warnings: [],
  backendRequests: [],
}
let expectingDiagnostic = false
page.on('pageerror', (error) => report.errors.push(error.stack || error.message))
page.on('console', (message) => {
  if (message.type() === 'warning') report.warnings.push(message.text())
  if (message.type() !== 'error') return
  if (
    expectingDiagnostic &&
    /Failed to create update cell operation: Error: \[BaseField\]: (invalid number value|negative numbers are disabled)\./.test(
      message.text(),
    )
  )
    report.expectedDiagnostics.push(message.text())
  else report.errors.push(message.text())
})
page.on('request', (request) => {
  if (
    !['GET', 'HEAD', 'OPTIONS'].includes(request.method()) ||
    request.url().includes('/universer-api/') ||
    (['fetch', 'xhr'].includes(request.resourceType()) &&
      !['localhost', '127.0.0.1'].includes(new URL(request.url()).hostname))
  )
    report.backendRequests.push(request.url())
})
page.on('websocket', (socket) => report.backendRequests.push(socket.url()))
await page.addInitScript(() => {
  window.fieldFrames = new Map()
  window.fieldPoints = []
  const proto = CanvasRenderingContext2D.prototype,
    fill = proto.fillText,
    clear = proto.clearRect
  proto.clearRect = function (...args) {
    window.fieldFrames.set(this.canvas, [])
    return Reflect.apply(clear, this, args)
  }
  proto.fillText = function (text, ...args) {
    const texts = window.fieldFrames.get(this.canvas) || []
    texts.push(String(text))
    window.fieldFrames.set(this.canvas, texts.slice(-20000))
    if (this.canvas.isConnected) {
      const point = this.getTransform().transformPoint({ x: args[0], y: args[1] }),
        rect = this.canvas.getBoundingClientRect()
      window.fieldPoints.push({
        text: String(text),
        x: rect.x + (point.x * rect.width) / this.canvas.width,
        y: rect.y + (point.y * rect.height) / this.canvas.height,
      })
      window.fieldPoints = window.fieldPoints.slice(-20000)
    }
    return Reflect.apply(fill, this, [text, ...args])
  }
})
const root = page.locator('.base-fields')
const snapshot = () =>
  page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getBase('bracken-field-lab').save())))
const run = (code) => page.evaluate('(async () => {\n' + code + '\n})()')
const settle = () =>
  page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
async function ready() {
  await page.waitForFunction(
    () =>
      document.querySelector('.base-fields')?.dataset.ready || document.querySelector('.base-fields')?.dataset.error,
    null,
    { timeout: 60000 },
  )
  assert.equal(await root.getAttribute('data-error'), null)
}
async function paint(text) {
  await page.waitForFunction(
    (wanted) =>
      [...window.fieldFrames].some(
        ([canvas, texts]) => canvas.isConnected && canvas.getBoundingClientRect().width > 300 && texts.includes(wanted),
      ),
    text,
  )
}
async function gate(name, action) {
  if (
    !buildStandalone &&
    [
      'exact-snapshot-reconstruction',
      'separate-data-variants-and-native-empty-input',
      'active-owner-disposal',
    ].includes(name)
  ) {
    report.gates[name] = {
      passed: false,
      skipped: true,
      reason: 'Run SHOWCASE_BUILD_STANDALONE=1 to test factory lifecycle and separately constructed data variants.',
    }
    return
  }
  try {
    await action()
    report.gates[name] = { passed: true }
  } catch (error) {
    report.gates[name] = { passed: false, failure: error.stack }
    await page.screenshot({ path: path.join(directory, name + '-failure.png') }).catch(() => {})
  }
  console.log('Bracken ' + name + ' ' + (report.gates[name].passed ? 'PASS' : 'FAIL'))
}
const fields = (data) => data.tables.repairs.fields
const records = (data) => data.tables.repairs.records
const byName = (data, name) => Object.values(fields(data)).find((field) => field.name === name)
const byTitle = (data, title) => Object.values(records(data)).find((record) => record.values.title === title)
function includesPack(actual, pack) {
  for (const [key, value] of Object.entries(pack))
    if (value && typeof value === 'object') includesPack(actual?.[key], value)
    else assert.equal(actual?.[key], value, key)
}
try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await ready()
  await paint('Replace kettle handle')
  const initial = await snapshot()
  assert.deepEqual(
    Object.values(initial.tables).map((table) => Object.keys(table.records).length),
    [30, 12, 18],
  )
  assert.equal(
    await root
      .locator('fieldset,[data-action],output,details.base-fields-controls,.base-fields-comparison,iframe')
      .count(),
    0,
  )
  // Bases owns its native single-row toolbar; it is not the Sheets Grid-ribbon DOM.
  assert.equal(await root.locator('[data-u-comp="base-workbench-layout"]').count(), 1)
  assert.equal(await root.getByText('Customize Field', { exact: true }).isVisible(), true)
  assert.equal(
    await root
      .locator('[data-u-comp="workbench-layout"]')
      .evaluate((element) => getComputedStyle(element).backgroundColor),
    'rgb(255, 255, 255)',
  )
  await page.screenshot({ path: path.join(directory, 'baseline.png') })
  await gate('native-cell-keyboard-and-history', async () => {
    await paint('1,250.750')
    const point = await page.evaluate(() => {
      const title = window.fieldPoints.findLast((item) => item.text === 'Replace kettle handle')
      return window.fieldPoints.findLast((item) => item.text === '1,250.750' && Math.abs(item.y - title.y) < 5)
    })
    assert.ok(point)
    await page.mouse.dblclick(point.x - 20, point.y - 4)
    await page.keyboard.press('Control+A')
    await page.keyboard.type('18.625')
    await page.keyboard.press('Enter')
    await page.waitForFunction(
      () =>
        window.univerAPI
          .getBase('bracken-field-lab')
          .getTableById('repairs')
          .getRecordById('repairs-01')
          .getValue('units') === 18.625,
    )
    await paint('18.625')
    const edited = await snapshot()
    await run('await window.univerAPI.undo()')
    assert.deepEqual(await snapshot(), initial)
    await run('await window.univerAPI.redo()')
    assert.deepEqual(await snapshot(), edited)
    await run('await window.univerAPI.undo()')
    assert.deepEqual(await snapshot(), initial)
  })
  await gate('native-sidebar-navigation', async () => {
    for (const [title, id, view] of [
      ['Workshop projects', 'stations', 'stations-grid'],
      ['Return checks', 'checks', 'checks-grid'],
      ['Repair intake', 'repairs', 'repairs-grid'],
    ]) {
      await root.getByText(title, { exact: true }).click()
      await page.waitForFunction(
        ({ id: tableId, view: viewId }) =>
          window.univerAPI.getBaseUI().getActiveTableId() === tableId &&
          window.univerAPI.getBaseUI().getActiveViewId() === viewId,
        { id, view },
      )
    }
    assert.deepEqual(await snapshot(), initial)
  })
  await gate('all-literal-facade-examples', async () => {
    for (const [i, example] of examples.entries()) {
      const before = await snapshot()
      expectingDiagnostic = [7, 9].includes(i)
      const download = i === 19 ? page.waitForEvent('download') : null
      await run(example)
      await settle()
      expectingDiagnostic = false
      const after = await snapshot(),
        spare = byName(after, 'Spare units'),
        first = records(after)['repairs-01']
      if (i === 0) {
        assert.deepEqual(
          ['Intake note', 'Spare units', 'Parts reserve'].map((name) => byName(after, name).defaultValue),
          ['Needs triage', 2, 12.5],
        )
        assert.ok(
          Object.values(records(after)).every((record) =>
            ['Intake note', 'Spare units', 'Parts reserve'].every(
              (name) => !Object.hasOwn(record.values, byName(after, name).id),
            ),
          ),
        )
      }
      if (i === 1) assert.equal(first.values[spare.id], 8.5)
      if (i === 2) {
        assert.equal(spare.type, 'currency')
        assert.deepEqual(records(after), records(before))
        await paint('$8.50')
      }
      if ([3, 4].includes(i)) assert.deepEqual(records(after), records(before))
      if (i === 4) await paint('£8.50')
      if (i === 5) {
        assert.equal(fields(after).quote.type, 'number')
        assert.deepEqual(records(after), records(before))
        if (typeof first.values.quote === 'string')
          report.knownIssues.push({
            gate: 'schema-normalization',
            actual: first.values.quote,
            storageType: typeof first.values.quote,
            expected: 1250.75,
          })
        await fs.writeFile(path.join(directory, 'conversion.json'), JSON.stringify({ before, after }, null, 2))
      }
      if (i === 6) assert.equal(first.values.quote, 1250.75)
      if (i === 7) assert.deepEqual(after, before, 'Rejected writes must preserve the entire snapshot')
      if (i === 8) assert.equal(first.values.units, null)
      if (i === 9) {
        assert.deepEqual(records(after), records(before))
        assert.equal(fields(after).units.config.allowNegative, false)
      }
      if (i === 10) assert.equal(first.values.units, -8.25)
      if (i === 11) {
        assert.equal(spare.defaultValue, 2)
        assert.deepEqual(records(after), records(before))
      }
      if (i === 12) {
        assert.equal(byTitle(after, 'Default check / omitted').values[spare.id], 2)
        assert.equal(byTitle(after, 'Default check / explicitly blank').values[spare.id], null)
        assert.equal(byTitle(after, 'Default check / measured zero').values[spare.id], 0)
      }
      if (i === 13) {
        assert.equal(spare.defaultValue, null)
        assert.deepEqual(records(after), records(before))
      }
      if (i === 14) {
        const invalid = byTitle(after, 'Unsafe raw default / SDK probe')
        assert.ok(invalid)
        if (invalid.values[spare.id] === 'not a number')
          report.knownIssues.push({
            gate: 'unsafe-numeric-default',
            actual: invalid.values[spare.id],
            recordId: invalid.id,
            expected: 'Reject invalid numeric default',
          })
        await fs.writeFile(path.join(directory, 'unsafe-default.json'), JSON.stringify({ before, after }, null, 2))
      }
      if (i === 15) {
        assert.equal(spare.defaultValue, 2)
        assert.equal(byTitle(after, 'Unsafe raw default / SDK probe').values[spare.id], 2)
      }
      if (i === 16) {
        assert.equal(spare.type, 'number')
        assert.deepEqual(records(after), records(before))
      }
      if (i === 17) assert.ok(records(after)['repairs-03'].values.note.includes('Thread colour — café repair'))
      if (i === 18) assert.deepEqual(after, before)
      if (download) {
        const file = await download
        assert.equal(file.suggestedFilename(), 'bracken-field-lab.base.json')
        const target = path.join(directory, 'downloaded.base.json')
        await file.saveAs(target)
        assert.deepEqual(JSON.parse(await fs.readFile(target, 'utf8')), after)
      }
      if (i >= 20)
        assert.equal(
          await page.evaluate(() => window.univerAPI.getBaseUI().getActiveTableId()),
          ['stations', 'checks', 'repairs'][i - 20],
        )
      report.checks.push({ example: i + 1, passed: true })
    }
  })
  await gate('native-null-versus-zero-paint', async () => {
    const data = await snapshot(),
      spare = byName(data, 'Spare units')
    const nullRecord = byTitle(data, 'Default check / explicitly blank')
    assert.equal(nullRecord.values[spare.id], null)
    await page.evaluate(() => {
      window.fieldPoints = []
    })
    await page.setViewportSize({ width: 1598, height: 1100 })
    await page.waitForFunction(() =>
      window.fieldPoints.some((item) => item.text.startsWith('Default check / explicitly')),
    )
    const evidence = await page.evaluate(() => {
      const original = window.fieldPoints.findLast((item) => item.text === 'Replace kettle handle')
      const spareValue = window.fieldPoints.findLast(
        (item) => item.text === '8.50' && Math.abs(item.y - original.y) < 5,
      )
      const row = window.fieldPoints.findLast((item) => item.text.startsWith('Default check / explicitly'))
      const actual = window.fieldPoints.findLast(
        (item) => item.text === '0.00' && Math.abs(item.x - spareValue.x) < 10 && Math.abs(item.y - row.y) < 5,
      )
      return { row, spareColumn: spareValue, actual }
    })
    if (evidence.actual)
      report.knownIssues.push({
        gate: 'numeric-null-painted-as-zero',
        recordId: nullRecord.id,
        fieldId: spare.id,
        storedValue: null,
        expectedDisplay: '',
        evidence,
      })
    await page.screenshot({ path: path.join(directory, 'native-null-painted-as-zero.png') })
    await fs.writeFile(path.join(directory, 'null-display-evidence.json'), JSON.stringify({ data, evidence }, null, 2))
    await page.setViewportSize({ width: 1600, height: 1100 })
  })
  await gate('all-native-format-variants', async () => {
    await run(
      "window.univerAPI.getBase('bracken-field-lab').getTableById('repairs').getRecordById('repairs-01').setValue('units',1250.75)",
    )
    const before = records(await snapshot())
    for (const [decimalPlaces, separatorStyle, useThousands, abbreviation, text] of [
      [0, 'commaPeriod', true, 'none', '1,251'],
      [1, 'commaPeriod', true, 'none', '1,250.8'],
      [2, 'periodComma', true, 'none', '1.250,75'],
      [3, 'spaceComma', true, 'none', '1 250,750'],
      [4, 'spacePeriod', true, 'none', '1 250.7500'],
      [2, 'commaPeriod', false, 'none', '1250.75'],
      [2, 'commaPeriod', true, 'K', '1.25K'],
      [2, 'commaPeriod', true, 'M', '0.00M'],
    ]) {
      await page.evaluate(
        (config) => {
          const field = window.univerAPI.getBase('bracken-field-lab').getTableById('repairs').getFieldById('units')
          field.setConfig({ ...field.getConfig(), ...config })
        },
        { decimalPlaces, separatorStyle, useThousands, abbreviation },
      )
      await paint(text)
      assert.deepEqual(records(await snapshot()), before)
      report.checks.push({ nativeFormat: text, storageUnchanged: true })
    }
  })
  await gate('complete-english-packs-and-theme-preservation', async () => {
    const factory = await fs.readFile('showcase/bases/text-number-currency/code/create-demo.ts', 'utf8'),
      packs = [...factory.matchAll(/^import \w+EnUS from '([^']+)en-US'/gm)]
    assert.equal(packs.length, 5)
    const before = await snapshot()
    await page.evaluate(() => {
      window.originalAPI = window.univerAPI
    })
    for (const locale of ['en-US']) {
      assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), 'enUS')
      for (const [, prefix] of packs)
        includesPack(await page.evaluate(() => window.univerAPI.getLocales()), (await import(prefix + locale)).default)
      for (const dark of [true, false]) {
        await page.evaluate((value) => window.univerAPI.toggleDarkMode(value), dark)
        await settle()
        assert.deepEqual(await snapshot(), before)
        assert.equal(await page.evaluate(() => window.originalAPI === window.univerAPI), true)
      }
      assert.equal(/(?:bases-ui|base\.field|base\.toolbar)\.[\w.]+/.test(await page.locator('body').innerText()), false)
      await paint('Replace kettle handle')
      await page.screenshot({ path: path.join(directory, locale + '-native.png') })
    }
  })
  await gate('exact-snapshot-reconstruction', async () => {
    const before = await snapshot()
    await page.evaluate(() => {
      window.oldRoot = document.querySelector('.base-fields')
      window.oldAPI = window.univerAPI
    })
    await run(restore)
    await ready()
    assert.equal(await page.evaluate(() => window.oldRoot.isConnected || window.oldAPI === window.univerAPI), false)
    assert.deepEqual(await snapshot(), before)
    await fs.writeFile(path.join(directory, 'restored.base.json'), JSON.stringify(before, null, 2))
    await run(
      "window.univerAPI.getBase('bracken-field-lab').getTableById('repairs').getRecordById('repairs-02').setValue('units',14.5)",
    )
    assert.equal(records(await snapshot())['repairs-02'].values.units, 14.5)
  })
  await gate('separate-data-variants-and-native-empty-input', async () => {
    for (const state of ['empty', 'boundary', 'error', 'default']) {
      await page.evaluate(async (value) => {
        window.demo.dispose()
        window.demo = window.createDemo(window.container, false, 'enUS', window.createData(value))
        await window.demo.ready
      }, state)
      await ready()
      const data = await snapshot()
      assert.equal(Object.keys(records(data)).length, state === 'empty' ? 0 : 30)
      assert.equal(Object.keys(data.tables.stations.records).length, 12)
      assert.equal(Object.keys(data.tables.checks.records).length, 18)
      if (state === 'empty') {
        await run(
          "window.univerAPI.getBase('bracken-field-lab').getTableById('repairs').addRecord({title:'First repair / empty intake',units:0})",
        )
        await paint('First repair / empty intake')
        assert.equal(Object.values(records(await snapshot()))[0].values.units, 0)
      }
      if (state === 'boundary') {
        assert.equal(records(data)['repairs-01'].values.units, 0.0001)
        assert.equal(records(data)['repairs-02'].values.units, 9999999.875)
        assert.ok(records(data)['repairs-03'].values.note.includes('Thread colour — café repair'))
      }
      if (state === 'error')
        assert.deepEqual(
          ['repairs-01', 'repairs-02', 'repairs-03'].map((id) => records(data)[id].values.quote),
          ['not a number', '1,250.75', '12kg'],
        )
      report.checks.push({
        dataVariant: state,
        recordCount: Object.values(data.tables).reduce((sum, table) => sum + Object.keys(table.records).length, 0),
      })
    }
    assert.deepEqual(await snapshot(), initial, 'Default reconstruction retains all original data')
  })
  await gate('active-owner-disposal', async () => {
    await run("await window.univerAPI.getBaseUI().activateTable('stations')")
    await page.evaluate(() => window.demo.dispose())
    await root.waitFor({ state: 'detached' })
    await settle()
    assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
  })
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.warnings, [])
  assert.deepEqual(report.backendRequests, [])
  report.passed = report.knownIssues.length === 0 && Object.values(report.gates).every((result) => result.passed)
} catch (error) {
  report.failure = error.stack
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  await browser.close()
  if (server) await new Promise((resolve) => server.httpServer.close(resolve))
}
if (!report.passed) process.exitCode = 1
