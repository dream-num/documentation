/* eslint-disable no-await-in-loop -- Reconstruct each native owner before exercising its next source edit. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const [{ directory: exportDirectory }] = JSON.parse(
  await fs.readFile('test-results/reed-formula-export/exports.json', 'utf8'),
)
const exportedSource = (await readShowcaseSources()).find((entry) => entry.slug === 'embed/boards-in-bases-formula-tab')
for (const [name, content] of Object.entries(exportedSource.files)) {
  const target = path.join(exportDirectory, name.slice(1))
  await fs.mkdir(path.dirname(target), { recursive: true })
  await fs.writeFile(target, content)
}
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-reed-roundtrip')
await fs.mkdir(directory, { recursive: true })
const readme = await fs.readFile('showcase/embed/boards-in-bases-formula-tab/README.md', 'utf8')
const restores = [...readme.matchAll(/\x60\x60\x60js\r?\n([\s\S]*?)\x60\x60\x60/g)]
assert.equal(restores.length, 1)
const restore = restores[0][1]
const examples = [...readme.matchAll(/\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g)].map((m) => m[1])
assert.equal(examples.length, 16)
const { build, preview } = await import(
  pathToFileURL(path.join(exportDirectory, 'node_modules/vite/dist/node/index.js')).href
)
// Only the lifecycle harness is substituted. SDK factory, CSS and data are the exact exported files.
// Production build avoids a second large dev dependency-optimizer cache.
const outDir = path.join(directory, 'harness-dist')
await build({
  root: exportDirectory,
  configFile: false,
  logLevel: 'warn',
  build: { outDir, emptyOutDir: false },
  plugins: [
    {
      name: 'reed-roundtrip-harness',
      transformIndexHtml: {
        order: 'pre',
        handler:
          () => `<!doctype html><html lang="en-US"><head><link rel="icon" href="data:,"></head><body style="margin:0"><div id="app" style="height:100vh"></div><script type="module">
      import {createDemo} from '/src/create-demo.ts';
      window.createDemo = createDemo;
      window.container = document.getElementById('app');
      window.demo = createDemo(window.container);
    </script></body></html>`,
      },
    },
  ],
})
const server = await preview({
  root: exportDirectory,
  configFile: false,
  build: { outDir },
  preview: { host: '127.0.0.1', port: 4322, strictPort: true },
})
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1700, height: 1100 } })
page.setDefaultTimeout(20000)
const report = { passed: false, checks: [], errors: [], warnings: [], backendRequests: [] }
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
  window.framesPaint = new Map()
  window.basePoints = []
  window.boardPoints = []
  const fill = CanvasRenderingContext2D.prototype.fillText,
    clear = CanvasRenderingContext2D.prototype.clearRect,
    draw = CanvasRenderingContext2D.prototype.drawImage
  CanvasRenderingContext2D.prototype.clearRect = function (...args) {
    window.framesPaint.set(this.canvas, [])
    return Reflect.apply(clear, this, args)
  }
  CanvasRenderingContext2D.prototype.drawImage = function (source, ...args) {
    const a = window.framesPaint.get(this.canvas) || []
    a.push(...(window.framesPaint.get(source) || []))
    window.framesPaint.set(this.canvas, a)
    return Reflect.apply(draw, this, [source, ...args])
  }
  CanvasRenderingContext2D.prototype.fillText = function (...args) {
    const a = window.framesPaint.get(this.canvas) || []
    a.push(String(args[0]))
    window.framesPaint.set(this.canvas, a)
    if (this.canvas.closest('.reed-embed')) {
      const p = this.getTransform().transformPoint({ x: args[1], y: args[2] }),
        b = this.canvas.getBoundingClientRect()
      if (b.width > 300)
        (this.canvas.closest('[data-board-viewport-host]') ? window.boardPoints : window.basePoints).push({
          text: String(args[0]),
          x: b.x + (p.x * b.width) / this.canvas.width,
          y: b.y + (p.y * b.height) / this.canvas.height,
        })
    }
    return Reflect.apply(fill, this, args)
  }
})

const ids = [
  'total',
  'capacity',
  'utilization',
  ...Array.from({ length: 3 }, (_, i) => ['load-' + i, 'spare-' + i]).flat(),
  'blocked',
  'overloaded',
  'signal',
]
function expected(loads = [14, 9, 7], capacities = [18, 12, 10], blocked = 1, extra = 0) {
  const load = loads.reduce((a, b) => a + b, 0),
    capacity = capacities.reduce((a, b) => a + b, 0)
  const overloaded = loads.filter((v, i) => v > capacities[i]).length
  return [
    load + extra,
    capacity,
    capacity ? load / capacity : '#DIV/0!',
    ...loads.flatMap((v, i) => [v, capacities[i] - v]),
    blocked,
    overloaded,
    overloaded ? 'Rebalance the load' : blocked ? 'Resolve the blocker' : 'Ready to review',
  ]
}
const root = page.locator('.reed-embed')
const child = root.locator('[data-embed-bases-table-list-host="reed-operations-tab"]')
const settle = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
const board = () => page.evaluate(() => window.univerAPI.getBoard('reed-operations-map').save())
const results = (entries = ids) =>
  page.evaluate(
    (shapes) => shapes.map((id) => window.univerAPI.getBoard('reed-operations-map').getShape(id).getFormulaResult()),
    entries,
  )

async function values(wanted, entries = ids) {
  await page.waitForFunction(
    ({ targets, shapes }) =>
      shapes.every((id, n) => {
        const result = window.univerAPI.getBoard('reed-operations-map').getShape(id).getFormulaResult()
        return (
          result &&
          !result.stale &&
          (targets === null
            ? result.status === 'error' && typeof result.value === 'string' && result.value.startsWith('#')
            : result.status === 'success' &&
              (typeof targets[n] === 'number'
                ? typeof result.value === 'number' && Math.abs(result.value - targets[n]) < 1e-9
                : result.value === targets[n]))
        )
      }),
    { targets: wanted, shapes: entries },
    { timeout: 30000 },
  )
}
async function openSource() {
  await root.getByText('Workstream register', { exact: true }).click()
  await page.waitForFunction(() => window.univerAPI.getBaseUI().getActiveTableId() === 'streams')
  await settle()
}
async function openBoard() {
  await root.getByText('Operations map', { exact: true }).click()
  await child.waitFor()
  await child.locator('[data-board-viewport-host="true"]').waitFor()
  await settle()
}
async function painted(name, entries = ids) {
  const actual = await results(entries)
  await page.waitForFunction(
    (texts) =>
      [...window.framesPaint.entries()].some(([c, a]) => {
        const b = c.getBoundingClientRect()
        return (
          c.isConnected &&
          b.width > 600 &&
          b.height > 300 &&
          c.closest('[data-board-viewport-host="true"]') &&
          c.closest('[data-embed-bases-table-list-host]') &&
          texts.every((s) => a.join('').includes(s))
        )
      }),
    actual.map((r) => r.displayText),
  )
  await page.screenshot({ path: path.join(directory, name + '.png') })
}
async function connectors() {
  const layout = await page.evaluate(() =>
    window.univerAPI.executeCommand('board-ui.command.analyze-rendered-layout', {
      unitId: 'reed-operations-map',
      subUnitId: 'operations',
    }),
  )
  assert.equal(layout.source, 'rendered')
  assert.equal(layout.routes.length, 3)
  const elements = (await board()).pages.operations.elements
  for (const route of layout.routes) {
    assert.equal(route.resolved, true)
    const edge = elements[route.connectorId].connectorData
    for (const [binding, point] of [
      [edge.start, route.points[0]],
      [edge.end, route.points.at(-1)],
    ]) {
      assert.equal(binding.kind, 'shapeSite')
      const { left, top, width, height } = elements[binding.shapeId].transform
      const target = [
        { x: left + width / 2, y: top },
        { x: left + width, y: top + height / 2 },
        { x: left + width / 2, y: top + height },
        { x: left, y: top + height / 2 },
      ][binding.connectionSiteId]
      assert.ok(Math.abs(point.x - target.x) < 0.01 && Math.abs(point.y - target.y) < 0.01)
    }
  }
  return layout.routes
}

async function ready() {
  await page.waitForFunction(
    () => document.querySelector('.reed-embed')?.dataset.ready || document.querySelector('.reed-embed')?.dataset.error,
    null,
    { timeout: 60000 },
  )
  assert.equal(await root.getAttribute('data-error'), null)
}
const snapshots = () =>
  page.evaluate(() =>
    JSON.parse(
      JSON.stringify({
        host: window.univerAPI.getBase('reed-repair-station').save(),
        board: window.univerAPI.getBoard('reed-operations-map').save(),
      }),
    ),
  )
async function reconstruct(name) {
  const before = await snapshots()
  const appearance = await page.evaluate(() => ({
    locale: window.univerAPI.getCurrentLocale(),
    darkMode: window.univerAPI.isDarkMode(),
  }))
  await page.evaluate(() => {
    window.oldAPI = window.univerAPI
  })
  await page.evaluate('(() => {' + restore + '})()')
  await ready()
  assert.equal(await page.evaluate(() => window.oldAPI === window.univerAPI), false)
  assert.equal(await root.count(), 1)
  assert.deepEqual(
    await page.evaluate(() => ({
      locale: window.univerAPI.getCurrentLocale(),
      darkMode: window.univerAPI.isDarkMode(),
    })),
    appearance,
  )
  const after = await snapshots()
  await fs.writeFile(path.join(directory, name + '-snapshots.json'), JSON.stringify({ before, after }, null, 2))
  const oldResource = before.host.resources.find((r) => r.name === 'UNIVER_EMBED_RESOURCE_PLUGIN')
  const newResource = after.host.resources.find((r) => r.name === 'UNIVER_EMBED_RESOURCE_PLUGIN')
  const oldEmbeds = JSON.parse(oldResource.data),
    newEmbeds = JSON.parse(newResource.data)
  const oldEmbed = oldEmbeds.embeds['reed-operations'],
    newEmbed = newEmbeds.embeds['reed-operations']
  const activationTime = newEmbed.updatedAt
  assert.ok(activationTime >= oldEmbed.updatedAt)
  newEmbed.updatedAt = oldEmbed.updatedAt
  newResource.data = JSON.stringify(newEmbeds)
  assert.deepEqual(after, before, 'Only checked native embed activation time may differ')
  assert.equal(await page.evaluate(() => window.univerAPI.listEmbeds({ hostUnitId: 'reed-repair-station' }).length), 1)
  report.checks.push({ name, completeSnapshotsPreservedExceptRecordedMetadata: true, activationTime })
}

try {
  await page.goto('http://127.0.0.1:4322', { waitUntil: 'domcontentloaded', timeout: 60000 })
  await ready()
  await values(expected())
  const original = await snapshots()
  const rejected = await page.evaluate(() => {
    const owner = window.univerAPI
    const pair = {
      host: owner.getBase('reed-repair-station').save(),
      board: owner.getBoard('reed-operations-map').save(),
    }
    return ['host-id', 'child-id', 'table', 'missing-host', 'missing-child'].map((kind) => {
      const saved = structuredClone(pair)
      if (kind === 'host-id') saved.host.id = 'another-base'
      if (kind === 'child-id') saved.board.id = 'another-board'
      if (kind === 'table') delete saved.host.tables.streams
      if (kind === 'missing-host') delete saved.host
      if (kind === 'missing-child') delete saved.board
      let message = ''
      try {
        window.createDemo(window.container, false, undefined, saved)
      } catch (e) {
        message = e.message
      }
      return {
        kind,
        message,
        sameOwner: owner === window.univerAPI,
        roots: document.querySelectorAll('.reed-embed').length,
      }
    })
  })
  for (const result of rejected) {
    assert.match(result.message, /Restore both original Reed unit IDs/)
    assert.equal(result.sameOwner, true)
    assert.equal(result.roots, 1)
  }
  assert.deepEqual(await snapshots(), original)
  report.checks.push({ rejected })
  await openSource()
  // Published rename, independent capacity/status, context and empty-view examples.
  for (const n of [12, 1, 2, 4, 5]) await page.evaluate(examples[n])
  await values(expected([14, 12, 7], [18, 10, 10], 0))
  await openBoard()
  const initialRoutes = await connectors()
  await page.evaluate(() => {
    const map = window.univerAPI.getBoard('reed-operations-map')
    map.getShape('stream-note-0').getText().setText('Reviewed / Keep a labelled shelf for small electrical items.')
    map
      .getShape('total')
      .setFormula({
        formula: '=SUM([Reed Operations]!Streams[Load])+2',
        externalReferences: [
          {
            qualifier: 'Reed Operations',
            sourceUnitId: 'reed-repair-station',
            sourceUnitType: window.univerAPI.Enum.UniverInstanceType.UNIVER_BASE,
          },
        ],
      })
      .setFormulaNumberFormat('0.0" h"')
  })
  await values(expected([14, 12, 7], [18, 10, 10], 0, 2))
  // Select the actually painted text, not an assumed offset from the outer viewport.
  const left = (await board()).pages.operations.elements['source-node'].transform.left
  const pointOnMap = await page.evaluate(() =>
    window.boardPoints.findLast((p, i, all) =>
      all
        .slice(i, i + 8)
        .map((q) => q.text)
        .join('')
        .startsWith('ONE BASE'),
    ),
  )
  assert.ok(pointOnMap)
  await page.mouse.click(pointOnMap.x + 12, pointOnMap.y - 4)
  await page.keyboard.press('ArrowRight')
  await page.waitForFunction(
    (x) =>
      window.univerAPI.getBoard('reed-operations-map').save().pages.operations.elements['source-node'].transform.left >
      x,
    left,
  )
  const nudgedRoutes = await connectors()
  assert.notDeepEqual(nudgedRoutes, initialRoutes)
  await page.mouse.dblclick(pointOnMap.x + 13, pointOnMap.y - 4)
  await page.waitForFunction(() => document.activeElement?.isContentEditable, null, { timeout: 5000 })
  await page.keyboard.press('Control+End')
  await page.keyboard.type(' Saved.', { delay: 35 })
  await page.waitForFunction(
    () => [...window.framesPaint.values()].some((glyphs) => glyphs.join('').includes('Saved.')),
    null,
    { timeout: 5000 },
  )
  await child.locator('[data-board-viewport-host="true"]').click({ position: { x: 20, y: 30 } })
  await page.waitForFunction(
    () =>
      window.univerAPI
        .getBoard('reed-operations-map')
        .getShape('source-node')
        .getText()
        .getPlainText()
        .includes('Saved.'),
    null,
    { timeout: 5000 },
  )
  // Native text auto-fit can grow the node; persist its post-edit bound routes.
  const movedRoutes = await connectors()
  await painted('edited')
  await reconstruct('edited-owner')
  await values(expected([14, 12, 7], [18, 10, 10], 0, 2))
  await openBoard()
  await painted('restored')
  assert.deepEqual(await connectors(), movedRoutes)
  assert.match(
    await page.evaluate(() =>
      window.univerAPI.getBoard('reed-operations-map').getShape('stream-note-0').getText().getPlainText(),
    ),
    /Reviewed/,
  )
  await openSource()
  assert.equal(
    await page.evaluate(
      () =>
        window.univerAPI
          .getBase('reed-repair-station')
          .getTableById('streams')
          .getViewById('streams-grid')
          .getProjection().rows.length,
    ),
    0,
  )
  await page.evaluate(() =>
    window.univerAPI
      .getBase('reed-repair-station')
      .getTableById('streams')
      .getRecordById('stream-3')
      .setValue('load', 11),
  )
  await values(expected([14, 12, 11], [18, 10, 10], 0, 2))
  await openBoard()
  await painted('hidden-fresh-edit')
  await openSource()
  await page.evaluate(examples[11])
  await page.evaluate(() => {
    window.basePoints = []
  })
  await openBoard()
  await openSource()
  await page.waitForFunction(() => window.basePoints.some((p) => p.text === '12'))
  const point = await page.evaluate(() => window.basePoints.findLast((p) => p.text === '12'))
  await page.mouse.dblclick(point.x - 20, point.y - 4)
  const editor = root.locator('input[inputmode="decimal"]')
  await editor.waitFor()
  await editor.fill('15')
  await editor.press('Enter')
  await values(expected([14, 15, 11], [18, 10, 10], 0, 2))
  await openBoard()
  await painted('native-fresh-edit')
  assert.deepEqual(await connectors(), movedRoutes)
  report.checks.push(
    'Edited formula/format, native text typing and keyboard-moved connector geometry, empty filter and fresh hidden/native input survive reconstruction',
  )
  await page.evaluate(examples[13])
  await values(null)
  await reconstruct('unavailable-binding')
  await values(null)
  await openBoard()
  await painted('unavailable-restored')
  await page.evaluate(examples[14])
  await values(expected([14, 15, 11], [18, 10, 10], 0, 2))
  await page.evaluate(() => {
    window.univerAPI.setLocale('zhCN')
    window.univerAPI.toggleDarkMode(true)
  })
  await reconstruct('chinese-dark-owner')
  await values(expected([14, 15, 11], [18, 10, 10], 0, 2))
  await openBoard()
  await painted('chinese-dark')
  assert.equal(
    await page.evaluate(() => window.univerAPI.getBoard('reed-operations-map').removeElement('utilization')),
    true,
  )
  await reconstruct('deleted-formula-shape')
  assert.equal((await board()).pages.operations.elements.utilization, undefined)
  const remaining = ids.filter((id) => id !== 'utilization')
  await values(
    expected([14, 15, 11], [18, 10, 10], 0, 2).filter((_, n) => n !== 2),
    remaining,
  )
  await openBoard()
  await painted('deleted-shape-restored', remaining)
  await page.evaluate(() =>
    window.univerAPI
      .getBase('reed-repair-station')
      .getTableById('streams')
      .getRecordById('stream-3')
      .setValue('load', 8),
  )
  await values(
    expected([14, 15, 8], [18, 10, 10], 0, 2).filter((_, n) => n !== 2),
    remaining,
  )
  await painted('fresh-edit-after-deletion', remaining)
  assert.equal((await board()).pages.operations.elements.utilization, undefined)
  await connectors()
  report.checks.push(
    'Deleted Formula Shape stays absent; eleven remaining native results and current canvas update after fresh input',
  )
  await page.evaluate(() => window.demo.dispose())
  await root.waitFor({ state: 'detached' })
  await settle()
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.warnings, [])
  assert.deepEqual(report.backendRequests, [])
  report.passed = true
} catch (e) {
  report.failure = e.stack
  report.models = await snapshots().catch(() => null)
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify({ ...report, models: undefined }, null, 2))
  await browser.close()
  await new Promise((resolve) => server.httpServer.close(resolve))
}
if (!report.passed) process.exitCode = 1
