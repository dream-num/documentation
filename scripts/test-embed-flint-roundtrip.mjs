/* eslint-disable no-await-in-loop -- One native owner is disposed before rebuilding the next. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

const [{ directory: exportDirectory }] = JSON.parse(
  await fs.readFile('test-results/flint-formula-export/exports.json', 'utf8'),
)
const { createServer } = await import(
  pathToFileURL(path.join(exportDirectory, 'node_modules/vite/dist/node/index.js')).href
)
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-flint-roundtrip')
await fs.mkdir(directory, { recursive: true })
const readme = await fs.readFile('showcase/embed/base-to-boards-float/README.md', 'utf8')
const snippets = [
  ...readme
    .split('## Source identity, view projection and recovery')[1]
    .matchAll(/\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g),
].map((m) => m[1])
const restore = [...readme.matchAll(/\x60\x60\x60js\r?\n([\s\S]*?)\x60\x60\x60/g)][0][1]
assert.equal(snippets.length, 4)
// Test harness owns only the mount and lifecycle handle. The imported factory and data
// are the exact exported source; no test calculations or fallback UI enter the demo.
const server = await createServer({
  root: exportDirectory,
  configFile: false,
  appType: 'custom',
  server: { host: '127.0.0.1', port: 4289, strictPort: true },
  plugins: [
    {
      name: 'flint-roundtrip-harness',
      configureServer(vite) {
        vite.middlewares.use((request, response, next) => {
          if (request.url !== '/') return next()
          response.setHeader('Content-Type', 'text/html')
          response.end(`<html><head><link rel="icon" href="data:,"></head><body style="margin:0"><div id="app" style="height:100vh"></div><script type="module">
        import {createDemo} from '/src/create-demo.ts';
        window.createDemo = createDemo;
        window.container = document.getElementById('app');
        window.demo = createDemo(window.container);
      </script></body></html>`)
        })
      },
    },
  ],
})
await server.listen()
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1700, height: 1100 } })
page.setDefaultTimeout(20000)
const report = { passed: false, checks: [], errors: [], warnings: [] }
page.on('pageerror', (e) => report.errors.push(e.stack || e.message))
page.on('console', (m) => {
  if (m.type() === 'error') report.errors.push(m.text())
  if (m.type() === 'warning') report.warnings.push(m.text())
})
await page.addInitScript(() => {
  window.flintFrames = new Map()
  const clear = CanvasRenderingContext2D.prototype.clearRect
  const fill = CanvasRenderingContext2D.prototype.fillText
  const image = CanvasRenderingContext2D.prototype.drawImage
  CanvasRenderingContext2D.prototype.clearRect = function (...args) {
    window.flintFrames.set(this.canvas, [])
    return Reflect.apply(clear, this, args)
  }
  CanvasRenderingContext2D.prototype.fillText = function (...args) {
    const texts = window.flintFrames.get(this.canvas) || []
    texts.push(String(args[0]))
    window.flintFrames.set(this.canvas, texts)
    return Reflect.apply(fill, this, args)
  }
  CanvasRenderingContext2D.prototype.drawImage = function (source, ...args) {
    const texts = window.flintFrames.get(this.canvas) || []
    texts.push(...(window.flintFrames.get(source) || []))
    window.flintFrames.set(this.canvas, texts)
    return Reflect.apply(image, this, [source, ...args])
  }
})
const ready = async () => {
  await page.waitForFunction(
    () => {
      const r = document.querySelector('.flint-embed')
      return r?.dataset.ready || r?.dataset.error
    },
    null,
    { timeout: 120000 },
  )
  assert.equal(await page.locator('.flint-embed').getAttribute('data-error'), null)
}
const snapshots = () =>
  page.evaluate(() =>
    JSON.parse(
      JSON.stringify({
        host: window.univerAPI.getBoard('flint-delivery-control').save(),
        source: window.univerAPI.getBase('flint-delivery-register').save(),
      }),
    ),
  )
const ids = [
  'remaining',
  'open',
  'blocked',
  'completion',
  'content-remaining',
  'build-remaining',
  'access-remaining',
  'retained',
  'signal',
]
const expected = [25, 3, 2, 0.4, 12, 8, 5, 35, 'Unblock first']
function withoutCalculatedLastValues(snapshot) {
  const host = structuredClone(snapshot)
  // Only calculated caches may differ across a source value edit. Formula strings,
  // format/animation, rich text, geometry, native resources and connectors stay exact.
  for (const collection of [host.pages, host.slides])
    for (const item of Object.values(collection || {}))
      for (const shape of Object.values(item.elements || {}))
        if (shape.shapeData?.formulaBinding) delete shape.shapeData.formulaBinding.lastValue
  return host
}
async function values(target, name) {
  await page.waitForFunction(
    ({ keys, wanted }) =>
      keys.every((id, i) => {
        const r = window.univerAPI.getBoard('flint-delivery-control').getShape(id).getFormulaResult()
        return r && !r.stale && r.status === 'success' && r.value === wanted[i]
      }),
    { keys: ids, wanted: target },
  )
  const labels = await page.evaluate(
    (keys) =>
      keys.map((id) => window.univerAPI.getBoard('flint-delivery-control').getShape(id).getFormulaResult().displayText),
    ids,
  )
  await page.waitForFunction(
    (wanted) =>
      [...window.flintFrames.entries()].some(
        ([canvas, texts]) =>
          canvas.isConnected &&
          canvas.closest('[data-board-viewport-host]') &&
          wanted.every((label) => texts.join('').includes(label)),
      ),
    labels,
  )
  await page.screenshot({ path: path.join(directory, name + '.png') })
}
try {
  await page.goto('http://127.0.0.1:4289', { waitUntil: 'domcontentloaded', timeout: 120000 })
  await ready()
  const original = await snapshots()
  await values(expected, 'baseline')
  const rejected = await page.evaluate(() => {
    const owner = window.univerAPI
    const validationPair = {
      host: owner.getBoard('flint-delivery-control').save(),
      source: owner.getBase('flint-delivery-register').save(),
    }
    return ['host-id', 'source-id', 'page', 'table'].map((kind) => {
      const saved = structuredClone(validationPair)
      if (kind === 'host-id') saved.host.id = 'other-board'
      if (kind === 'source-id') saved.source.id = 'other-base'
      if (kind === 'page') delete saved.host.pages.delivery
      if (kind === 'table') delete saved.source.tables.tasks
      let message = ''
      try {
        window.createDemo(window.container, false, saved)
      } catch (error) {
        message = error.message
      }
      return {
        kind,
        message,
        sameOwner: window.univerAPI === owner,
        roots: document.querySelectorAll('.flint-embed').length,
      }
    })
  })
  for (const check of rejected) {
    assert.match(check.message, /Restore both original Flint unit IDs/)
    assert.equal(check.sameOwner, true)
    assert.equal(check.roots, 1)
  }
  assert.deepEqual(await snapshots(), original)
  report.checks.push({ rejectedSnapshots: rejected })
  for (const [i, code] of snippets.entries()) {
    await page.evaluate(code)
    if (i >= 2) {
      expected[0] = 31
      expected[4] = 18
      expected[7] = 41
    }
    await values(expected, 'example-' + (i + 10))
    const current = await snapshots()
    assert.equal(current.source.id, original.source.id)
    assert.equal(current.source.tables.tasks.formulaName, 'Tasks')
    assert.deepEqual(withoutCalculatedLastValues(current.host), withoutCalculatedLastValues(original.host))
    const rows = await page.evaluate(
      () =>
        window.univerAPI
          .getBase('flint-delivery-register')
          .getTableById('tasks')
          .getViewById('tasks-grid')
          .getProjection().rows,
    )
    assert.equal(rows.length, [5, 2, 2, 5][i])
    report.checks.push({ example: i + 10, visibleRows: rows.length, expected: [...expected] })
  }
  // Keep a deliberately changed formula to detect accidental reseeding during restore.
  await page.evaluate(() =>
    window.univerAPI
      .getBoard('flint-delivery-control')
      .getShape('retained')
      .setFormula({
        formula: '=SUM([Flint Delivery]!Tasks[Hours])+7',
        externalReferences: [
          { qualifier: 'Flint Delivery', sourceUnitId: 'flint-delivery-register', sourceUnitType: 5 },
        ],
      }),
  )
  expected[7] = 48
  await values(expected, 'edited-binding')
  const before = await snapshots()
  await page.evaluate(() => {
    window.oldAPI = window.univerAPI
  })
  await page.evaluate(`(async () => { ${restore} })()`)
  await ready()
  assert.equal(await page.evaluate(() => window.oldAPI === window.univerAPI), false)
  assert.equal(await page.locator('.flint-embed').count(), 1)
  await values(expected, 'restored')
  const after = await snapshots()
  assert.deepEqual(after.source, before.source)
  report.rawHostSnapshotEqual = JSON.stringify(after.host) === JSON.stringify(before.host)
  const previousEmbed = JSON.parse(before.host.resources.find((r) => r.name === 'UNIVER_EMBED_RESOURCE_PLUGIN').data)
  const restoredResource = after.host.resources.find((r) => r.name === 'UNIVER_EMBED_RESOURCE_PLUGIN')
  const restoredEmbed = JSON.parse(restoredResource.data)
  const previousTime = previousEmbed.embeds['flint-base-float'].updatedAt
  const restoredTime = restoredEmbed.embeds['flint-base-float'].updatedAt
  assert.ok(restoredTime >= previousTime, 'The native embed records its new activation time')
  restoredEmbed.embeds['flint-base-float'].updatedAt = previousTime
  restoredResource.data = JSON.stringify(restoredEmbed)
  assert.deepEqual(after.host, before.host, 'Only the native reactivation timestamp may differ after restore')
  report.reactivationTimestamp = { previousTime, restoredTime }
  assert.equal(
    await page.evaluate(() => window.univerAPI.listEmbeds({ hostUnitId: 'flint-delivery-control' }).length),
    1,
  )
  report.checks.push(
    'Base is exact; Board, edited formula and resources restore into one new owner except the checked native embed reactivation timestamp',
  )
  await page.evaluate(() =>
    window.univerAPI
      .getBase('flint-delivery-register')
      .getTableById('tasks')
      .getRecordById('task-1')
      .setValue('hours', 21),
  )
  expected[0] = 34
  expected[4] = 21
  expected[7] = 51
  await values(expected, 'post-restore-edit')
  report.checks.push('A new source edit after reconstruction recalculates and repaints all affected native results')
  await page.evaluate(() => window.demo.dispose())
  await page.locator('.flint-embed').waitFor({ state: 'detached' })
  assert.deepEqual(report.errors, [])
  report.passed = true
} catch (e) {
  report.failure = e.stack
  report.models = await snapshots().catch(() => null)
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify({ ...report, models: undefined }, null, 2))
  await browser.close()
  await server.close()
}
if (!report.passed) process.exitCode = 1
