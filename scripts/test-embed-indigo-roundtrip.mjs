/* eslint-disable no-await-in-loop -- Reconstruct each native owner before exercising its next source edit. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const [{ directory: exportDirectory }] = JSON.parse(
  await fs.readFile('test-results/indigo-formula-export/exports.json', 'utf8'),
)
const exportedSource = (await readShowcaseSources()).find((entry) => entry.slug === 'embed/slides-in-bases-formula-tab')
for (const [name, content] of Object.entries(exportedSource.files)) {
  const target = path.join(exportDirectory, name.slice(1))
  await fs.mkdir(path.dirname(target), { recursive: true })
  await fs.writeFile(target, content)
}
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-indigo-roundtrip')
await fs.mkdir(directory, { recursive: true })
const readme = await fs.readFile('showcase/embed/slides-in-bases-formula-tab/README.md', 'utf8')
const restores = [...readme.matchAll(/\x60\x60\x60js\r?\n([\s\S]*?)\x60\x60\x60/g)]
assert.equal(restores.length, 1)
const restore = restores[0][1]
const examples = [...readme.matchAll(/\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g)].map((m) => m[1])
assert.equal(examples.length, 14)
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
      name: 'indigo-roundtrip-harness',
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
  preview: { host: '127.0.0.1', port: 4318, strictPort: true },
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
    if (this.canvas.closest('.indigo-embed') && !this.canvas.closest('[data-embed-bases-table-list-host]')) {
      const p = this.getTransform().transformPoint({ x: args[1], y: args[2] }),
        b = this.canvas.getBoundingClientRect()
      if (b.width > 300)
        window.basePoints.push({
          text: String(args[0]),
          x: b.x + (p.x * b.width) / this.canvas.width,
          y: b.y + (p.y * b.height) / this.canvas.height,
        })
    }
    return Reflect.apply(fill, this, args)
  }
})

const root = page.locator('.indigo-embed')
const child = root.locator('[data-embed-bases-table-list-host="indigo-portfolio-tab"]')
const specs = [
  ['overview', 'total'],
  ['overview', 'count'],
  ['overview', 'average'],
  ...[0, 1, 2].flatMap((i) => [
    ['allocation', 'amount-' + i],
    ['allocation', 'share-' + i],
  ]),
  ['concentration', 'largest'],
  ['concentration', 'share'],
  ['concentration', 'signal'],
]
function expected(amounts, multiplier = 1) {
  const sum = amounts.reduce((a, b) => a + b, 0),
    largest = Math.max(...amounts)
  return [
    sum * multiplier,
    3,
    sum / 3,
    ...amounts.flatMap((v) => [v, v / sum]),
    largest,
    largest / sum,
    largest / sum > 0.5 ? 'Review concentration' : 'No project above half',
  ]
}
async function ready() {
  await page.waitForFunction(
    () =>
      document.querySelector('.indigo-embed')?.dataset.ready || document.querySelector('.indigo-embed')?.dataset.error,
    null,
    { timeout: 60000 },
  )
  assert.equal(await root.getAttribute('data-error'), null)
}
const snapshots = () =>
  page.evaluate(() =>
    JSON.parse(
      JSON.stringify({
        host: window.univerAPI.getBase('indigo-community-portfolio').save(),
        presentation: window.univerAPI.getPresentation('indigo-allocation-review').save(),
      }),
    ),
  )
async function values(wanted, entries = specs) {
  await page.waitForFunction(
    ({ entries: shapes, wanted: targets }) =>
      shapes.every(([p, id], i) => {
        const r = window.univerAPI
          .getPresentation('indigo-allocation-review')
          .getSlideById(p)
          .getShape(id)
          .getFormulaResult()
        return (
          r &&
          !r.stale &&
          (targets === null
            ? r.status === 'error' && typeof r.value === 'string' && r.value.startsWith('#')
            : r.status === 'success' &&
              (typeof targets[i] === 'number'
                ? typeof r.value === 'number' && Math.abs(r.value - targets[i]) < 1e-9
                : r.value === targets[i]))
        )
      }),
    { entries, wanted },
    { timeout: 30000 },
  )
}
async function openSource() {
  await root.getByText('Project register', { exact: true }).click()
  await page.waitForFunction(() => window.univerAPI.getBaseUI().getActiveTableId() === 'projects')
}
async function show(id, name, entries = specs) {
  await root.getByText('Portfolio review', { exact: true }).click()
  await child.waitFor()
  await root
    .locator('[data-u-comp="slide-thumbnail-item"]')
    .nth(['overview', 'allocation', 'concentration'].indexOf(id))
    .click()
  await page.waitForFunction(
    (pageId) => window.univerAPI.getPresentation('indigo-allocation-review').save().activeSlideId === pageId,
    id,
  )
  const texts = await page.evaluate(
    (shapes) =>
      shapes.map(
        ([p, shapeId]) =>
          window.univerAPI
            .getPresentation('indigo-allocation-review')
            .getSlideById(p)
            .getShape(shapeId)
            .getFormulaResult().displayText,
      ),
    entries.filter(([p]) => p === id),
  )
  await page.waitForFunction(
    (targets) =>
      [...window.framesPaint.entries()].some(([canvas, glyphs]) => {
        const b = canvas.getBoundingClientRect()
        return (
          canvas.isConnected &&
          canvas.closest('[data-embed-bases-table-list-host]') &&
          !canvas.closest('[data-u-comp="slide-thumbnail-item"]') &&
          b.width > 600 &&
          b.height > 300 &&
          targets.every((text) => glyphs.join('').includes(text))
        )
      }),
    texts,
  )
  await page.screenshot({ path: path.join(directory, name + '-' + id + '.png') })
}
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
  const oldEmbed = oldEmbeds.embeds['indigo-portfolio'],
    newEmbed = newEmbeds.embeds['indigo-portfolio']
  const activationTime = newEmbed.updatedAt
  assert.ok(activationTime >= oldEmbed.updatedAt)
  newEmbed.updatedAt = oldEmbed.updatedAt
  newResource.data = JSON.stringify(newEmbeds)
  // Native embed navigation opens the explicitly saved target, not the last page
  // visited inside the editor. Preserve and check that target; only normalize the
  // transient active selection after proving it equals the persisted target.
  const openedPage = after.presentation.activeSlideId
  assert.equal(openedPage, oldEmbed.displayTarget.pageId)
  after.presentation.activeSlideId = before.presentation.activeSlideId
  assert.deepEqual(after, before, 'Only embed activation time and its declared opening-page selection may differ')
  assert.equal(
    await page.evaluate(() => window.univerAPI.listEmbeds({ hostUnitId: 'indigo-community-portfolio' }).length),
    1,
  )
  report.checks.push({ name, completeSnapshotsPreservedExceptRecordedMetadata: true, activationTime, openedPage })
}
try {
  await page.goto('http://127.0.0.1:4318', { waitUntil: 'domcontentloaded', timeout: 60000 })
  await ready()
  await values(expected([15000, 22000, 8000]))
  const original = await snapshots()
  const rejected = await page.evaluate(() => {
    const owner = window.univerAPI
    const pair = {
      host: owner.getBase('indigo-community-portfolio').save(),
      presentation: owner.getPresentation('indigo-allocation-review').save(),
    }
    return ['host-id', 'child-id', 'table', 'missing-host', 'missing-child'].map((kind) => {
      const saved = structuredClone(pair)
      if (kind === 'host-id') saved.host.id = 'another-base'
      if (kind === 'child-id') saved.presentation.id = 'another-deck'
      if (kind === 'table') delete saved.host.tables.projects
      if (kind === 'missing-host') delete saved.host
      if (kind === 'missing-child') delete saved.presentation
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
        roots: document.querySelectorAll('.indigo-embed').length,
      }
    })
  })
  for (const r of rejected) {
    assert.match(r.message, /Restore both original Indigo unit IDs/)
    assert.equal(r.sameOwner, true)
    assert.equal(r.roots, 1)
  }
  assert.deepEqual(await snapshots(), original)
  report.checks.push({ rejected })
  await openSource()
  // Execute the published literal rename, note, filter and source mutations.
  for (const i of [10, 2, 3, 4, 1]) await page.evaluate(examples[i])
  await values(expected([18000, 30000, 10000]))
  await page.evaluate(() => {
    const deck = window.univerAPI.getPresentation('indigo-allocation-review')
    const overview = deck.getSlideById('overview')
    overview.setSpeakerNotes('Saved workshop decision: retain programme context and a doubled scenario total.')
    overview.setBackground({ ...overview.getBackground(), color: '#142542' })
    overview
      .getShape('total')
      .setFormula({
        formula: '=SUM([Indigo Portfolio]!Projects[Allocation])*2',
        externalReferences: [
          {
            qualifier: 'Indigo Portfolio',
            sourceUnitId: 'indigo-community-portfolio',
            sourceUnitType: window.univerAPI.Enum.UniverInstanceType.UNIVER_BASE,
          },
        ],
      })
      .setFormulaNumberFormat('$#,##0.00')
  })
  await values(expected([18000, 30000, 10000], 2))
  for (const id of ['overview', 'allocation', 'concentration']) await show(id, 'edited')
  assert.equal(
    await page.evaluate(() =>
      window.univerAPI
        .getEmbed({ hostUnitId: 'indigo-community-portfolio', embedId: 'indigo-portfolio' })
        .setDisplayTarget({ pageId: 'concentration' }),
    ),
    true,
  )
  await reconstruct('edited-owner')
  await values(expected([18000, 30000, 10000], 2))
  for (const id of ['overview', 'allocation', 'concentration']) await show(id, 'restored')
  await openSource()
  assert.equal(
    await page.evaluate(
      () =>
        window.univerAPI
          .getBase('indigo-community-portfolio')
          .getTableById('projects')
          .getViewById('projects-grid')
          .getProjection().rows.length,
    ),
    2,
  )
  // Hidden library remains in the whole-table formulas after reconstruction.
  await page.evaluate(() =>
    window.univerAPI
      .getBase('indigo-community-portfolio')
      .getTableById('projects')
      .getRecordById('project-1')
      .setValue('allocation', 20000),
  )
  await values(expected([20000, 30000, 10000], 2))
  await show('allocation', 'hidden-source-edit')
  await page.evaluate(() => {
    window.basePoints = []
  })
  await openSource()
  await page.waitForFunction(() => window.basePoints.some((p) => p.text === '30,000'))
  const point = await page.evaluate(() => window.basePoints.findLast((p) => p.text === '30,000'))
  await page.mouse.dblclick(point.x - 20, point.y - 4)
  const editor = root.locator('input[inputmode="decimal"]')
  await editor.waitFor()
  await editor.fill('32000')
  await editor.press('Enter')
  await values(expected([20000, 32000, 10000], 2))
  for (const id of ['overview', 'allocation', 'concentration']) await show(id, 'native-fresh-edit')
  report.checks.push(
    'Restored hidden-source mutation and native keyboard input update all twelve results/current canvases, including the edited formula/format',
  )
  await page.evaluate(examples[11])
  await values(null)
  await reconstruct('unavailable-binding')
  await values(null)
  await show('overview', 'unavailable-restored')
  await page.evaluate(examples[12])
  await values(expected([20000, 32000, 10000], 2))
  await page.evaluate(() => {
    window.univerAPI.setLocale('zhCN')
    window.univerAPI.toggleDarkMode(true)
  })
  await reconstruct('chinese-dark-owner')
  await values(expected([20000, 32000, 10000], 2))
  for (const id of ['overview', 'allocation', 'concentration']) await show(id, 'chinese-dark')
  await page.evaluate(() => {
    const slide = window.univerAPI.getPresentation('indigo-allocation-review').getSlideById('overview')
    slide.deleteElement(slide.getShape('average'))
  })
  await reconstruct('deleted-formula-shape')
  assert.equal((await snapshots()).presentation.slides.overview.elements.average, undefined)
  const remaining = specs.filter(([, id]) => id !== 'average')
  await values(
    expected([20000, 32000, 10000], 2).filter((_, i) => i !== 2),
    remaining,
  )
  await show('overview', 'deleted-shape-restored', remaining)
  await page.evaluate(() =>
    window.univerAPI
      .getBase('indigo-community-portfolio')
      .getTableById('projects')
      .getRecordById('project-3')
      .setValue('allocation', 12000),
  )
  await values(
    expected([20000, 32000, 12000], 2).filter((_, i) => i !== 2),
    remaining,
  )
  for (const id of ['overview', 'allocation', 'concentration']) await show(id, 'fresh-edit-after-deletion', remaining)
  assert.equal((await snapshots()).presentation.slides.overview.elements.average, undefined)
  report.checks.push(
    'Deleted Formula Shape stays deleted while all eleven remaining outputs recalculate and paint after another fresh source edit',
  )
  await page.evaluate(() => window.demo.dispose())
  await root.waitFor({ state: 'detached' })
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
