/* eslint-disable no-await-in-loop -- Native field edits and their readbacks run in order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/calibration-sort-native')
await fs.mkdir(directory, { recursive: true })
const readme = await fs.readFile('showcase/bases/multi-field-sort/code/README.md', 'utf8')
const examples = [...readme.matchAll(/\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g)].map((match) => match[1])
assert.equal(examples.length, 10)
const restore = [...readme.matchAll(/\x60\x60\x60js\r?\n([\s\S]*?)\x60\x60\x60/g)][0][1]
const buildStandalone = process.env.SHOWCASE_BUILD_STANDALONE === '1'
const url =
  process.env.SHOWCASE_DEMO_URL ||
  (buildStandalone
    ? 'http://127.0.0.1:4376'
    : `${process.env.SHOWCASE_BASE_URL || 'http://localhost:3030'}/en-US/playground/bases/multi-field-sort`)
let server
if (buildStandalone) {
  const exportDirectory =
    process.env.SHOWCASE_EXPORT_DIRECTORY ||
    (await fs.mkdtemp(path.join(os.tmpdir(), 'univer-calibration-sort-native-')))
  const source = (await readShowcaseSources()).find((entry) => entry.slug === 'bases/multi-field-sort')
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
        name: 'calibration-sort-native-harness',
        transformIndexHtml: {
          order: 'pre',
          handler:
            () => `<!doctype html><html lang="en-US"><head><link rel="icon" href="data:,"></head><body style="margin:0"><div id="app" style="height:100vh"></div><script type="module">
import {createDemo} from '/src/create-demo.ts';import {DATA} from '/src/data.ts';window.createDemo=createDemo;window.DATA=DATA;window.container=document.getElementById('app');window.demo=createDemo(window.container);
</script></body></html>`,
        },
      },
    ],
  })
  server = await preview({
    root: exportDirectory,
    configFile: false,
    build: { outDir },
    preview: { host: '127.0.0.1', port: 4376, strictPort: true },
  })
}
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, acceptDownloads: true })
page.setDefaultTimeout(15000)
const report = {
  slug: 'bases/multi-field-sort',
  passed: false,
  gates: {},
  checks: [],
  knownIssues: [],
  errors: [],
  warnings: [],
  backendRequests: [],
}
page.on('pageerror', (e) => report.errors.push(e.stack || e.message))
page.on('console', (m) => {
  if (m.type() === 'error') report.errors.push(m.text())
  if (m.type() === 'warning') report.warnings.push(m.text())
})
page.on('request', (r) => {
  if (
    !['GET', 'HEAD', 'OPTIONS'].includes(r.method()) ||
    r.url().includes('/universer-api/') ||
    (['xhr', 'fetch'].includes(r.resourceType()) && !['localhost', '127.0.0.1'].includes(new URL(r.url()).hostname))
  )
    report.backendRequests.push(r.url())
})
page.on('websocket', (s) => report.backendRequests.push(s.url()))
await page.addInitScript(() => {
  window.framesByCanvas = new Map()
  window.paintPoints = []
  window.currentPoints = new Map()
  const p = CanvasRenderingContext2D.prototype,
    fill = p.fillText,
    clear = p.clearRect
  p.clearRect = function (...args) {
    window.framesByCanvas.set(this.canvas, [])
    window.currentPoints.set(this.canvas, [])
    return Reflect.apply(clear, this, args)
  }
  p.fillText = function (text, ...args) {
    const texts = window.framesByCanvas.get(this.canvas) || []
    texts.push(String(text))
    window.framesByCanvas.set(this.canvas, texts.slice(-20000))
    if (this.canvas.isConnected) {
      const point = this.getTransform().transformPoint({ x: args[0], y: args[1] }),
        rect = this.canvas.getBoundingClientRect()
      window.paintPoints.push({
        text: String(text),
        x: rect.x + (point.x * rect.width) / this.canvas.width,
        y: rect.y + (point.y * rect.height) / this.canvas.height,
      })
      window.paintPoints = window.paintPoints.slice(-20000)
      const points = window.currentPoints.get(this.canvas) || []
      points.push(window.paintPoints.at(-1))
      window.currentPoints.set(this.canvas, points.slice(-20000))
    }
    return Reflect.apply(fill, this, [text, ...args])
  }
})
const root = page.locator('.base-sort')
const panel = page.locator('[data-u-comp="base-sort-panel"]')
const run = (code) => page.evaluate('(async()=>{\n' + code + '\n})()')
const snapshot = () =>
  page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getBase('multi-field-sort-base').save())))
const projection = () =>
  page.evaluate(() =>
    window.univerAPI
      .getBase('multi-field-sort-base')
      .getTableById('records')
      .getViewById('working')
      .getProjection()
      .rows.map((r) => r.recordId),
  )
const ready = async () => {
  await page.waitForFunction(
    () => document.querySelector('.base-sort')?.dataset.ready || document.querySelector('.base-sort')?.dataset.error,
    null,
    { timeout: 60000 },
  )
  assert.equal(await root.getAttribute('data-error'), null)
}
const paint = async (text) =>
  page.waitForFunction(
    (w) =>
      [...window.framesByCanvas].some(
        ([c, t]) => c.isConnected && c.getBoundingClientRect().width > 300 && t.includes(w),
      ),
    text,
  )
const capture = async (name) => page.screenshot({ path: path.join(directory, name + '.png') })
function differences(a, b, p = '') {
  if (Object.is(a, b)) return []
  if (a && b && typeof a === 'object' && typeof b === 'object')
    return [...new Set([...Object.keys(a), ...Object.keys(b)])].flatMap((k) => differences(a[k], b[k], p + '.' + k))
  return [{ path: p, before: a === undefined ? { absent: true } : a, after: b === undefined ? { absent: true } : b }]
}
async function exact(name, before, after) {
  const diff = differences(before, after)
  await fs.writeFile(
    path.join(directory, name + '.json'),
    JSON.stringify({ before, after, differences: diff }, null, 2),
  )
  if (diff.length) report.knownIssues.push({ name, differences: diff })
  else report.checks.push({ name, exact: true })
}
async function gate(name, action, standalone = false) {
  if (standalone && !buildStandalone) {
    report.gates[name] = {
      passed: false,
      skipped: true,
      reason: 'Use SHOWCASE_BUILD_STANDALONE=1 for factory reconstruction.',
    }
    return
  }
  const issues = report.knownIssues.length,
    errors = report.errors.length
  try {
    await action()
    report.gates[name] = { passed: issues === report.knownIssues.length && errors === report.errors.length }
  } catch (e) {
    report.gates[name] = { passed: false, failure: e.stack }
    await fs.writeFile(
      path.join(directory, name + '-state.json'),
      JSON.stringify(
        {
          snapshot: await snapshot().catch(() => null),
          body: await page
            .locator('body')
            .innerText()
            .catch(() => null),
          panel: await panel.evaluate((element) => element.outerHTML).catch(() => null),
        },
        null,
        2,
      ),
    )
    await capture(name + '-failure').catch(() => {})
  }
  console.log(name + ' ' + (report.gates[name].passed ? 'PASS' : 'FAIL'))
}
const orders = {
  original: ['r01', 'r02', 'r03', 'r04', 'r05', 'r06', 'r07', 'r08', 'r09', 'r10'],
  desc: ['r02', 'r07', 'r10', 'r01', 'r03', 'r04', 'r08', 'r05', 'r09', 'r06'],
  asc: ['r06', 'r09', 'r05', 'r08', 'r01', 'r03', 'r04', 'r02', 'r07', 'r10'],
  zone: ['r02', 'r07', 'r10', 'r05', 'r08', 'r06', 'r01', 'r03', 'r04', 'r09'],
  date: ['r05', 'r03', 'r04', 'r07', 'r10', 'r02', 'r08', 'r01', 'r06', 'r09'],
  name: ['r01', 'r10', 'r09', 'r08', 'r07', 'r06', 'r05', 'r04', 'r03', 'r02'],
  edited: ['r01', 'r02', 'r07', 'r10', 'r03', 'r04', 'r08', 'r05', 'r09', 'r06'],
}
const clear = () =>
  run("window.univerAPI.getBase('multi-field-sort-base').getTableById('records').getViewById('working').setSort([])")
async function openSort() {
  if (await panel.isVisible()) await closeSort()
  await root
    .locator('[data-u-comp="base-toolbar"]')
    .getByText(/^(\d+ )?Sort$/)
    .click()
  await panel.waitFor()
}
async function closeSort() {
  await page.keyboard.press('Escape')
  if (await panel.isVisible()) await page.mouse.click(1100, 850)
  await panel.waitFor({ state: 'hidden' })
}
function includesPack(actual, pack) {
  for (const [k, v] of Object.entries(pack))
    if (v && typeof v === 'object') includesPack(actual?.[k], v)
    else assert.equal(actual?.[k], v, k)
}
async function canvasOrder() {
  return page.evaluate(() => {
    const records = window.univerAPI.getBase('multi-field-sort-base').save().tables.records.records
    const byName = new Map(Object.entries(records).map(([id, r]) => [r.values.instrument, id]))
    const points = [...window.currentPoints]
      .filter(([canvas]) => canvas.isConnected && canvas.getBoundingClientRect().width > 300)
      .flatMap(([, p]) => p)
    const latest = new Map(points.filter((p) => byName.has(p.text)).map((p) => [byName.get(p.text), p.y]))
    return [...latest].toSorted((a, b) => a[1] - b[1]).map(([id]) => id)
  })
}
async function expectRows(ids) {
  await page.waitForFunction(
    (expected) =>
      JSON.stringify(
        window.univerAPI
          .getBase('multi-field-sort-base')
          .getTableById('records')
          .getViewById('working')
          .getProjection()
          .rows.map((r) => r.recordId),
      ) === JSON.stringify(expected),
    ids,
  )
  for (let i = 0; i < 30; i++) {
    if (JSON.stringify(await canvasOrder()) === JSON.stringify(ids)) break
    await page.waitForTimeout(50)
  }
  assert.deepEqual(await projection(), ids)
  assert.deepEqual(await canvasOrder(), ids)
  const data = await snapshot()
  assert.deepEqual(data.tables.records.recordOrder, orders.original)
  assert.equal(Object.keys(data.tables.records.records).length, 10)
}
async function liveOrder(name) {
  await page.waitForTimeout(350)
  const actual = await projection(),
    painted = await canvasOrder(),
    data = await snapshot()
  await fs.writeFile(
    path.join(directory, name + '.json'),
    JSON.stringify({ expected: orders.edited, actual, painted, snapshot: data }, null, 2),
  )
  if (
    JSON.stringify(actual) !== JSON.stringify(orders.edited) ||
    JSON.stringify(painted) !== JSON.stringify(orders.edited)
  )
    report.knownIssues.push({ name, expected: orders.edited, actual, painted })
  else report.checks.push({ name, passed: true })
}

try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await ready()
  await expectRows(orders.original)
  const initial = await snapshot()
  assert.equal(
    await root
      .locator(
        'fieldset,output,[data-action],.base-feature-controls,.base-feature-activity,.base-feature-limitation,.base-feature-editor',
      )
      .count(),
    0,
  )
  assert.equal(await root.locator('[data-u-comp="base-workbench-layout"]').count(), 1)
  await capture('baseline')
  await gate('null-versus-zero-native-presentation', async () => {
    assert.equal(initial.tables.records.records.r06.values.score, null)
    assert.equal(initial.tables.records.records.r05.values.score, 0)
    const points = await page.evaluate(() => {
      const all = [...window.currentPoints].filter(([c]) => c.isConnected).flatMap(([, p]) => p)
      const row = all.findLast((p) => p.text === 'Elm Sensor')
      return all.filter((p) => Math.abs(p.y - row.y) < 5)
    })
    await fs.writeFile(
      path.join(directory, 'null-score-paint.json'),
      JSON.stringify({ record: initial.tables.records.records.r06, points }, null, 2),
    )
    if (points.some((p) => p.text === '0.00'))
      report.knownIssues.push({ name: 'null-score-painted-as-zero', recordId: 'r06', source: null, painted: '0.00' })
  })
  await gate('native-multifield-sort-stability-and-history', async () => {
    await openSort()
    await panel.getByRole('button', { name: 'New condition', exact: true }).click()
    let rows = panel.locator('[data-u-comp="base-sort-condition-list"] > div')
    await rows.nth(0).getByText('Instrument', { exact: true }).click()
    await page.getByText('Readiness score', { exact: true }).last().click()
    await rows.nth(0).getByText('Sort from Z to A', { exact: true }).click()
    await closeSort()
    await expectRows(orders.desc)
    await capture('native-score-desc')
    await openSort()
    rows = panel.locator('[data-u-comp="base-sort-condition-list"] > div')
    await rows.nth(0).getByText('Readiness score', { exact: true }).click()
    await page.getByText('Zone', { exact: true }).last().click()
    await rows.nth(0).getByText('Sort from A to Z', { exact: true }).click()
    await panel.getByRole('button', { name: 'New condition', exact: true }).click()
    await rows.nth(1).getByText('Sort from Z to A', { exact: true }).click()
    await closeSort()
    await expectRows(orders.zone)
    await capture('native-zone-score')
    const zone = await snapshot()
    await openSort()
    rows = panel.locator('[data-u-comp="base-sort-condition-list"] > div')
    await rows.nth(0).getByText('Zone', { exact: true }).click()
    await page.getByText('Next calibration', { exact: true }).last().click()
    await capture('native-date-score-panel')
    await closeSort()
    await expectRows(orders.date)
    const date = await snapshot()
    await root.getByRole('button', { name: 'Undo', exact: true }).click()
    await expectRows(orders.zone)
    await exact('native-sort-undo', zone, await snapshot())
    await root.getByRole('button', { name: 'Redo', exact: true }).click()
    await expectRows(orders.date)
    await exact('native-sort-redo', date, await snapshot())
    await openSort()
    await panel.getByRole('button', { name: 'Delete', exact: true }).first().click()
    await panel.getByRole('button', { name: 'Delete', exact: true }).first().click()
    await closeSort()
    await expectRows(orders.original)
    await exact('cleared-native-sort-preserves-full-data', initial, await snapshot())
  })
  await gate('native-sort-key-edit-and-history', async () => {
    await run(examples[1])
    await expectRows(orders.desc)
    const before = await snapshot()
    const point = await page.evaluate(() => {
      const all = [...window.currentPoints].filter(([c]) => c.isConnected).flatMap(([, p]) => p),
        row = all.findLast((p) => p.text === 'Meridian Pump')
      return all.findLast((p) => p.text === '82.00' && Math.abs(p.y - row.y) < 5)
    })
    assert.ok(point)
    await page.mouse.dblclick(point.x - 15, point.y - 4)
    await page.keyboard.press('Control+A')
    await page.keyboard.type('98')
    await page.keyboard.press('Enter')
    await page.waitForFunction(
      () =>
        window.univerAPI
          .getBase('multi-field-sort-base')
          .getTableById('records')
          .getRecordById('r01')
          .getValue('score') === 98,
    )
    await paint('98.00')
    const edited = await snapshot()
    await liveOrder('native-live-sort')
    await capture('native-score-edited')
    await page.keyboard.press('Control+z')
    await page.waitForFunction(
      () =>
        window.univerAPI
          .getBase('multi-field-sort-base')
          .getTableById('records')
          .getRecordById('r01')
          .getValue('score') === 82,
    )
    await exact('native-cell-undo', before, await snapshot())
    await page.keyboard.press('Control+y')
    await page.waitForFunction(
      () =>
        window.univerAPI
          .getBase('multi-field-sort-base')
          .getTableById('records')
          .getRecordById('r01')
          .getValue('score') === 98,
    )
    await exact('native-cell-redo', edited, await snapshot())
    await page.keyboard.press('Control+z')
    await page.waitForFunction(
      () =>
        window.univerAPI
          .getBase('multi-field-sort-base')
          .getTableById('records')
          .getRecordById('r01')
          .getValue('score') === 82,
    )
    await clear()
    await expectRows(orders.original)
  })
  await gate('literal-facade-variants', async () => {
    const expected = {
      1: orders.desc,
      2: orders.asc,
      3: orders.zone,
      4: orders.date,
      5: orders.name,
      6: orders.original,
    }
    for (const [i, example] of examples.entries()) {
      const before = await snapshot(),
        download = i === 9 ? page.waitForEvent('download') : null
      await run(example)
      if (expected[i]) await expectRows(expected[i])
      if ([0, 8].includes(i)) await exact('literal-' + (i + 1) + '-unchanged', before, await snapshot())
      if (i === 7) {
        assert.equal((await snapshot()).tables.records.records.r01.values.score, 98)
        await paint('98.00')
        await liveOrder('facade-live-sort')
      }
      if (download) {
        const d = await download
        assert.equal(d.suggestedFilename(), 'calibration-queue.base.json')
        const target = path.join(directory, 'downloaded.base.json')
        await d.saveAs(target)
        assert.deepEqual(JSON.parse(await fs.readFile(target, 'utf8')), await snapshot())
      }
      report.checks.push({
        literal: i + 1,
        executed: true,
        projection: await projection(),
        canvasOrder: await canvasOrder(),
      })
    }
  })
  await gate('complete-english-packs-and-theme', async () => {
    const factory = await fs.readFile('showcase/bases/multi-field-sort/code/create-demo.ts', 'utf8'),
      packs = [...factory.matchAll(/^import \w+EnUS from '([^']+)en-US'/gm)]
    assert.equal(packs.length, 5)
    const before = await snapshot()
    await page.evaluate(() => {
      window.previousAPI = window.univerAPI
    })
    for (const locale of ['en-US']) {
      assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), 'enUS')
      for (const [, prefix] of packs)
        includesPack(await page.evaluate(() => window.univerAPI.getLocales()), (await import(prefix + locale)).default)
      for (const dark of [true, false]) await page.evaluate((v) => window.univerAPI.toggleDarkMode(v), dark)
      assert.equal(await page.evaluate(() => window.previousAPI === window.univerAPI), true)
      await exact(locale + '-theme', before, await snapshot())
      await capture(locale + '-native')
    }
  })
  await gate(
    'exact-edited-reconstruction-and-fresh-edit',
    async () => {
      const before = await snapshot()
      await page.evaluate(() => {
        window.oldAPI = window.univerAPI
        window.oldRoot = document.querySelector('.base-sort')
      })
      await run(restore)
      await ready()
      assert.equal(await page.evaluate(() => window.oldAPI === window.univerAPI || window.oldRoot.isConnected), false)
      assert.equal(await root.count(), 1)
      await exact('edited-roundtrip', before, await snapshot())
      await expectRows(orders.edited)
      await run(
        "window.univerAPI.getBase('multi-field-sort-base').getTableById('records').getRecordById('r01').setValue('instrument','Meridian / restored and live')",
      )
      await paint('Meridian / restored and live')
      assert.equal((await snapshot()).tables.records.records.r01.values.instrument, 'Meridian / restored and live')
      await capture('fresh-after-restore')
    },
    true,
  )
  await gate(
    'english-on-chinese-host-and-disposal',
    async () => {
      await page.evaluate(async () => {
        window.demo.dispose()
        document.documentElement.lang = 'zh-CN'
        window.demo = window.createDemo(window.container)
        await window.demo.ready
      })
      await ready()
      assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), 'enUS')
      await expectRows(orders.original)
      await root.getByText('Filter', { exact: true }).first().waitFor({ state: 'visible' })
      assert.equal(await page.evaluate(() => document.documentElement.lang), 'zh-CN')
      await capture('english-on-chinese-host')
      await page.evaluate(() => window.demo.dispose())
      await root.waitFor({ state: 'detached' })
      assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
    },
    true,
  )
  report.passed =
    Object.values(report.gates).every((g) => g.passed) &&
    !report.knownIssues.length &&
    !report.errors.length &&
    !report.warnings.length &&
    !report.backendRequests.length
} catch (e) {
  report.failure = e.stack
  await capture('failure').catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  await browser.close()
  if (server) await new Promise((resolve) => server.httpServer.close(resolve))
}
if (!report.passed) process.exitCode = 1
