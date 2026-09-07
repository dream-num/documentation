/* eslint-disable no-await-in-loop -- Each edit depends on the preceding native owner reconstruction. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/delta-roundtrip-native')
await fs.mkdir(directory, { recursive: true })
const [{ directory: originalExport }] = JSON.parse(
  await fs.readFile('test-results/delta-formula-export/exports.json', 'utf8'),
)
const exportDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'univer-delta-roundtrip-'))
await fs.symlink(path.join(originalExport, 'node_modules'), path.join(exportDirectory, 'node_modules'), 'junction')
const source = (await readShowcaseSources()).find((entry) => entry.slug === 'embed/boards-in-sheets-formula-float')
for (const [name, content] of Object.entries(source.files)) {
  const target = path.join(exportDirectory, name.slice(1))
  await fs.mkdir(path.dirname(target), { recursive: true })
  await fs.writeFile(target, content)
}
await fs.writeFile(
  path.join(directory, 'exports.json'),
  JSON.stringify([{ slug: source.slug, directory: exportDirectory }], null, 2),
)
const readme = await fs.readFile('showcase/embed/boards-in-sheets-formula-float/README.md', 'utf8')
const restores = [...readme.matchAll(/\x60\x60\x60js\r?\n([\s\S]*?)\x60\x60\x60/g)]
assert.equal(restores.length, 1)
const restore = restores[0][1]
const { build, preview } = await import(
  pathToFileURL(path.join(exportDirectory, 'node_modules/vite/dist/node/index.js')).href
)
const outDir = path.join(directory, 'harness-dist')
// Substitute only the application's lifecycle handle; factory, data and official CSS are exact exports.
await build({
  root: exportDirectory,
  configFile: false,
  logLevel: 'warn',
  build: { outDir, emptyOutDir: false },
  plugins: [
    {
      name: 'delta-roundtrip-harness',
      transformIndexHtml: {
        order: 'pre',
        handler:
          () => `<!doctype html><html lang="en-US"><head><link rel="icon" href="data:,"></head><body style="margin:0"><div id="app" style="height:100vh"></div><script type="module">
    import {createDemo} from '/src/create-demo.ts';
    window.createDemo=createDemo;window.container=document.getElementById('app');window.demo=createDemo(window.container);
  </script></body></html>`,
      },
    },
  ],
})
const server = await preview({
  root: exportDirectory,
  configFile: false,
  build: { outDir },
  preview: { host: '127.0.0.1', port: 4352, strictPort: true },
})
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } })
page.setDefaultTimeout(20000)
const report = { passed: false, checks: [], knownIssues: [], errors: [], warnings: [], backendRequests: [] }
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
  window.docFrames = new Map()
  const proto = CanvasRenderingContext2D.prototype,
    fill = proto.fillText,
    clear = proto.clearRect,
    draw = proto.drawImage
  proto.fillText = function (...args) {
    const texts = window.docFrames.get(this.canvas) || []
    texts.push(String(args[0]))
    window.docFrames.set(this.canvas, texts.slice(-50000))
    return Reflect.apply(fill, this, args)
  }
  proto.clearRect = function (...args) {
    window.docFrames.set(this.canvas, [])
    return Reflect.apply(clear, this, args)
  }
  proto.drawImage = function (imageSource, ...args) {
    if (imageSource !== this.canvas)
      window.docFrames.set(
        this.canvas,
        (window.docFrames.get(this.canvas) || []).concat(window.docFrames.get(imageSource) || []).slice(-50000),
      )
    return Reflect.apply(draw, this, [imageSource, ...args])
  }
})
const ids = [
  'capacity',
  'assigned',
  'spare',
  'utilization',
  'load-0',
  'spare-0',
  'load-1',
  'spare-1',
  'load-2',
  'spare-2',
  'overloaded',
  'peak',
  'signal',
]
const root = page.locator('.delta-embed')
const float = page.locator('[data-u-comp="embed-float-dom"][data-embed-id="delta-board-float"]')
const snapshots = () =>
  page.evaluate(() =>
    JSON.parse(
      JSON.stringify({
        host: window.univerAPI.getWorkbook('delta-studio-capacity').save(),
        board: window.univerAPI.getBoard('delta-allocation-map').save(),
      }),
    ),
  )
async function ready() {
  await page.waitForFunction(
    () =>
      document.querySelector('.delta-embed')?.dataset.ready || document.querySelector('.delta-embed')?.dataset.error,
    null,
    { timeout: 60000 },
  )
  assert.equal(await root.getAttribute('data-error'), null)
}
async function values(load, bonus = 0) {
  const capacity = 480,
    assigned = load.reduce((a, v) => a + v, 0),
    caps = [120, 200, 160],
    overload = load.filter((v, i) => v > caps[i]).length
  const expected = load
    ? [
        capacity,
        assigned,
        capacity - assigned + bonus,
        assigned / capacity,
        ...load.flatMap((v, i) => [v, caps[i] - v]),
        overload,
        Math.max(...load.map((v, i) => v / caps[i])),
        overload ? 'Rebalance before adding scope' : 'Review the remaining buffer',
      ]
    : null
  await page.waitForFunction(
    ({ ids: shapes, expected: targets }) =>
      shapes.every((id, i) => {
        const result = window.univerAPI.getBoard('delta-allocation-map').getShape(id).getFormulaResult()
        return (
          result &&
          !result.stale &&
          result.status === 'success' &&
          (typeof targets[i] === 'number' ? Math.abs(result.value - targets[i]) < 1e-8 : result.value === targets[i])
        )
      }),
    { ids, expected },
    { timeout: 30000 },
  )
}
async function missing() {
  await page.waitForFunction(
    (shapes) =>
      shapes.every((id) => {
        const result = window.univerAPI.getBoard('delta-allocation-map').getShape(id).getFormulaResult()
        return result && !result.stale && result.status === 'error' && String(result.value).startsWith('#')
      }),
    ids,
    { timeout: 30000 },
  )
}
async function painted(name) {
  const texts = await page.evaluate(
    (shapes) =>
      shapes.map((id) => window.univerAPI.getBoard('delta-allocation-map').getShape(id).getFormulaResult().displayText),
    ids,
  )
  await page.waitForFunction(
    (targets) =>
      [...window.docFrames].some(
        ([canvas, glyphs]) =>
          canvas.isConnected &&
          canvas.getBoundingClientRect().width > 600 &&
          canvas.closest('[data-board-viewport-host="true"]') &&
          targets.every((t) => glyphs.join('').includes(t)),
      ),
    texts,
    { timeout: 15000 },
  )
  await page.screenshot({ path: path.join(directory, name + '.png') })
  report.checks.push({ name, currentCanvasText: texts })
}
// Every difference remains visible. Parse resource JSON for useful paths but never change model values.
function differences(before, after, location = '') {
  if (Object.is(before, after)) return []
  if (location.endsWith('.data') && typeof before === 'string' && typeof after === 'string') {
    try {
      return differences(JSON.parse(before), JSON.parse(after), location + '[JSON]')
    } catch {}
  }
  if (before && after && typeof before === 'object' && typeof after === 'object')
    return [...new Set([...Object.keys(before), ...Object.keys(after)])].flatMap((key) =>
      differences(before[key], after[key], location + '.' + key),
    )
  return [
    {
      path: location,
      before: before === undefined ? { absent: true } : before,
      after: after === undefined ? { absent: true } : after,
    },
  ]
}
const reference = (data) => data.resources.find((resource) => resource.name === 'UNIVER_EXTERNAL_REFERENCE_PLUGIN')
async function reconstruct(name) {
  const before = await snapshots(),
    apiState = await page.evaluate(() => ({
      locale: window.univerAPI.getCurrentLocale(),
      dark: window.univerAPI.isDarkMode(),
    }))
  await page.evaluate(() => {
    window.oldAPI = window.univerAPI
    window.oldRoot = document.querySelector('.delta-embed')
  })
  await page.evaluate('(async () => {\n' + restore + '\n})()')
  await ready()
  assert.equal(await page.evaluate(() => window.oldAPI === window.univerAPI || window.oldRoot.isConnected), false)
  assert.equal(await root.count(), 1)
  assert.equal(await float.count(), 1)
  assert.equal(await page.locator('[data-embed-fullscreen-shell="true"]').count(), 0)
  assert.deepEqual(
    await page.evaluate(() => ({ locale: window.univerAPI.getCurrentLocale(), dark: window.univerAPI.isDarkMode() })),
    apiState,
  )
  const after = await snapshots(),
    delta = differences(before, after)
  await fs.writeFile(
    path.join(directory, name + '-snapshots.json'),
    JSON.stringify({ before, after, differences: delta }, null, 2),
  )
  assert.deepEqual(
    reference(after.board),
    reference(before.board),
    'External reference resource identity and mappings must survive without repair',
  )
  assert.deepEqual(
    after.board.pages,
    before.board.pages,
    'All Board shapes, authored text, formulas, caches, geometry and connectors must survive',
  )
  assert.deepEqual(
    after.host.sheets,
    before.host.sheets,
    'All source Sheet cells, styles, formulas and layout must survive',
  )
  assert.deepEqual(after.board.theme, before.board.theme, 'Do not regenerate a saved theme')
  assert.equal(
    await page.evaluate(() => window.univerAPI.listEmbeds({ hostUnitId: 'delta-studio-capacity' }).length),
    1,
  )
  let exact = false
  try {
    assert.deepEqual(after, before)
    exact = true
  } catch (error) {
    report.knownIssues.push({ name, gate: 'exact-whole-model-roundtrip', differences: delta, failure: error.message })
  }
  report.checks.push({
    name,
    newOwner: true,
    oldRootDetached: true,
    oneFloat: true,
    sourceCellsAndBoardPagesPreserved: true,
    externalReferencesPreserved: true,
    exactWholeModel: exact,
    differences: delta,
  })
  console.log('Delta ' + name + ': fresh owner; exact snapshots ' + (exact ? 'PASS' : 'FAIL'))
}
try {
  await page.goto('http://127.0.0.1:4352', { waitUntil: 'domcontentloaded', timeout: 60000 })
  await ready()
  await values([110, 210, 105])
  await painted('baseline')
  const before = await snapshots()
  const rejected = await page.evaluate(() => {
    const api = window.univerAPI,
      pair = {
        host: api.getWorkbook('delta-studio-capacity').save(),
        board: api.getBoard('delta-allocation-map').save(),
      }
    return [
      'host-id',
      'board-id',
      'missing-host',
      'missing-board',
      'sheet',
      'page',
      'embed',
      'drawing',
      'drawing-order',
    ].map((kind) => {
      const saved = structuredClone(pair)
      if (kind === 'host-id') saved.host.id = 'another-source'
      if (kind === 'board-id') saved.board.id = 'another-board'
      if (kind === 'missing-host') delete saved.host
      if (kind === 'missing-board') delete saved.board
      if (kind === 'sheet') delete saved.host.sheets.allocation
      if (kind === 'page') delete saved.board.pages.capacity
      if (kind === 'embed')
        saved.host.resources = saved.host.resources.filter((r) => r.name !== 'UNIVER_EMBED_RESOURCE_PLUGIN')
      if (kind === 'drawing')
        saved.host.resources = saved.host.resources.filter((r) => r.name !== 'SHEET_DRAWING_PLUGIN')
      if (kind === 'drawing-order') {
        const resource = saved.host.resources.find((r) => r.name === 'SHEET_DRAWING_PLUGIN'),
          data = JSON.parse(resource.data)
        data.allocation.order = []
        resource.data = JSON.stringify(data)
      }
      let message = ''
      try {
        window.createDemo(window.container, false, undefined, saved)
      } catch (error) {
        message = error.message
      }
      return {
        kind,
        message,
        sameOwner: api === window.univerAPI,
        roots: document.querySelectorAll('.delta-embed').length,
      }
    })
  })
  for (const result of rejected) {
    assert.match(result.message, /Restore.*Delta/)
    assert.equal(result.sameOwner, true)
    assert.equal(result.roots, 1)
  }
  assert.deepEqual(await snapshots(), before)
  report.checks.push({ name: 'reject-invalid-owner-pairs-before-mount', rejected })
  await page.evaluate(() => {
    const api = window.univerAPI,
      book = api.getWorkbook('delta-studio-capacity'),
      board = api.getBoard('delta-allocation-map')
    book.setName('Delta / Retained review')
    book.getSheetBySheetId('allocation').getRange('C7').setValue(130)
    board.getShape('team-note-1').getText().setText('Reviewed / Split scope before the next commitment.')
    const shape = board.getShape('spare')
    shape.setFormula({
      formula: shape.getFormula() + '+7',
      externalReferences: [
        {
          qualifier: 'Delta Capacity',
          sourceUnitId: 'delta-studio-capacity',
          sourceUnitType: api.Enum.UniverInstanceType.UNIVER_SHEET,
        },
      ],
    })
  })
  await values([110, 210, 130], 7)
  await painted('edited')
  await float.dblclick({ position: { x: 100, y: 40 } })
  await page
    .locator('[data-u-comp="embed-float-dom-chrome"][data-embed-id="delta-board-float"]')
    .getByRole('button', { name: 'Enter fullscreen', exact: true })
    .click()
  await page.locator('[data-embed-fullscreen-shell="true"]').waitFor()
  await reconstruct('edited-fullscreen-owner')
  await values([110, 210, 130], 7)
  await painted('restored-edits')
  await page.evaluate(() => {
    window.univerAPI.getWorkbook('delta-studio-capacity').getSheetBySheetId('allocation').getRange('C6').setValue(190)
  })
  await values([110, 190, 130], 7)
  await painted('fresh-source-edit')
  await page.evaluate(() => {
    window.univerAPI.getFormula().upsertExternalReference({
      unitId: 'delta-allocation-map',
      qualifier: 'Delta Capacity',
      sourceUnitId: 'delta-unavailable-source',
      sourceUnitType: window.univerAPI.Enum.UniverInstanceType.UNIVER_SHEET,
    })
  })
  await missing()
  await painted('unavailable-before-reload')
  await reconstruct('unavailable-binding')
  await missing()
  await painted('unavailable-after-reload')
  await page.evaluate(() => {
    window.univerAPI.getFormula().upsertExternalReference({
      unitId: 'delta-allocation-map',
      qualifier: 'Delta Capacity',
      sourceUnitId: 'delta-studio-capacity',
      sourceUnitType: window.univerAPI.Enum.UniverInstanceType.UNIVER_SHEET,
    })
  })
  await values([110, 190, 130], 7)
  await painted('repaired-after-reload')
  await page.evaluate(() => {
    window.univerAPI.setLocale('zhCN')
    window.univerAPI.toggleDarkMode(true)
  })
  await reconstruct('chinese-dark-owner')
  await values([110, 190, 130], 7)
  await painted('chinese-dark-restored')
  await page.evaluate(() => {
    window.univerAPI.getWorkbook('delta-studio-capacity').getSheetBySheetId('allocation').getRange('C5').setValue(150)
  })
  await values([150, 190, 130], 7)
  await painted('fresh-source-after-chinese-dark-reload')
  await page.evaluate(() => window.demo.dispose())
  await root.waitFor({ state: 'detached' })
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.warnings, [])
  assert.deepEqual(report.backendRequests, [])
  report.passed = report.knownIssues.length === 0
} catch (error) {
  report.failure = error.stack
  report.models = await snapshots().catch(() => null)
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify({ ...report, models: undefined }, null, 2))
  await browser.close()
  await new Promise((resolve) => server.httpServer.close(resolve))
}
if (!report.passed) process.exitCode = 1
