/* eslint-disable no-await-in-loop -- Reconstruct each native owner before exercising its next source edit. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

import { readShowcaseSources } from './showcase-sources.mjs'

const [{ directory: exportDirectory }] = JSON.parse(
  await fs.readFile('test-results/cobalt-formula-export/exports.json', 'utf8'),
)
const exportedSource = (await readShowcaseSources()).find((entry) => entry.slug === 'embed/mixed-to-traditional-doc')
for (const [name, content] of Object.entries(exportedSource.files)) {
  const target = path.join(exportDirectory, name.slice(1))
  await fs.mkdir(path.dirname(target), { recursive: true })
  await fs.writeFile(target, content)
}
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-cobalt-roundtrip')
await fs.mkdir(directory, { recursive: true })
const readme = await fs.readFile('showcase/embed/mixed-to-traditional-doc/README.md', 'utf8')
const restores = [...readme.matchAll(/\x60\x60\x60js\r?\n([\s\S]*?)\x60\x60\x60/g)]
assert.equal(restores.length, 1)
const restore = restores[0][1]
const examples = [...readme.matchAll(/\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g)].map((m) => m[1])
assert.equal(examples.length, 20)
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
      name: 'cobalt-roundtrip-harness',
      transformIndexHtml: {
        order: 'pre',
        handler:
          () => `<!doctype html><html lang="en-US"><head><link rel="icon" href="data:,"></head><body style="margin:0"><div id="app" style="height:100vh"></div><script type="module">
      import {createDemo} from '/src/create-demo.ts';
      import {IRenderManagerService} from '@univerjs/engine-render';
      window.createDemo = createDemo;
      window.container = document.getElementById('app');
      window.demo = createDemo(window.container);
      window.readPages = () => window.univerAPI._injector.get(IRenderManagerService).getRenderUnitById('cobalt-operating-review').mainComponent.getSkeleton().getSkeletonData().pages.map(({pageWidth,pageHeight,st,ed}) => ({pageWidth,pageHeight,st,ed}));
    </script></body></html>`,
      },
    },
  ],
})
const server = await preview({
  root: exportDirectory,
  configFile: false,
  build: { outDir },
  preview: { host: '127.0.0.1', port: 4328, strictPort: true },
})
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1700, height: 1100 } })
page.setDefaultTimeout(15000)
const report = {
  passed: false,
  checks: [],
  results: [],
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
  window.docFrames = new Map()
  window.basePoints = []
  const fill = CanvasRenderingContext2D.prototype.fillText,
    clear = CanvasRenderingContext2D.prototype.clearRect
  const drawImage = CanvasRenderingContext2D.prototype.drawImage
  // The native document renderer caches text on offscreen canvases before composition.
  CanvasRenderingContext2D.prototype.drawImage = function (source, ...args) {
    const texts = window.docFrames.get(this.canvas) || []
    texts.push(...(window.docFrames.get(source) || []))
    window.docFrames.set(this.canvas, texts)
    return Reflect.apply(drawImage, this, [source, ...args])
  }
  CanvasRenderingContext2D.prototype.clearRect = function (...args) {
    window.docFrames.set(this.canvas, [])
    return Reflect.apply(clear, this, args)
  }
  CanvasRenderingContext2D.prototype.fillText = function (...args) {
    const frame = window.docFrames.get(this.canvas) || []
    frame.push(String(args[0]))
    window.docFrames.set(this.canvas, frame)
    if (this.canvas.closest('[data-embed-fullscreen-shell="true"]')) {
      const point = this.getTransform().transformPoint({ x: args[1], y: args[2] })
      const bounds = this.canvas.getBoundingClientRect()
      if (bounds.width > 300)
        window.basePoints.push({
          text: String(args[0]),
          x: bounds.x + (point.x * bounds.width) / this.canvas.width,
          y: bounds.y + (point.y * bounds.height) / this.canvas.height,
        })
    }
    return Reflect.apply(fill, this, args)
  }
})
const root = page.locator('.cobalt-embed')
const shell = page.locator('[data-embed-fullscreen-shell="true"]')
const body = () => page.evaluate(() => window.univerAPI.getDocument('cobalt-operating-review').save().body)
const source = () =>
  page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getWorkbook('cobalt-revenue-plan').save())))
const results = () =>
  page.evaluate(() =>
    window.univerAPI
      .getDocument('cobalt-operating-review')
      .getFormulas()
      .map((f) => f.getResult()),
  )
const settle = () =>
  page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))

const sum = (a) => a.reduce((n, v) => n + (typeof v === 'number' ? v : 0), 0)
// Independent test oracle; never imported by the runtime.
function expected(
  revenues = [24000, 28000, 34000],
  costs = [18500, 14200, 9700, 15100, 3200],
  target = 0.3,
  allIncluded = false,
) {
  const revenue = sum(revenues),
    included = sum(costs.slice(0, allIncluded ? 5 : 4)),
    balance = revenue - included
  const ratio = revenue ? balance / revenue : '#DIV/0!',
    headroom = balance - revenue * target
  return [
    revenue,
    included,
    balance,
    ratio,
    5,
    allIncluded ? 5 : 4,
    allIncluded ? 0 : costs[4],
    revenue,
    included,
    balance,
    target,
    typeof ratio === 'number' ? ratio - target : ratio,
    headroom,
    headroom >= 0 ? 'Room within the scenario' : 'Revisit the assumptions',
  ]
}
const baseline = expected()
async function values(wanted) {
  await page.waitForFunction(
    (targets) => {
      const actual = window.univerAPI
        .getDocument('cobalt-operating-review')
        .getFormulas()
        .map((f) => f.getResult())
      return (
        actual.length === targets.length &&
        actual.every(
          (r, i) =>
            r &&
            !r.stale &&
            (targets === null
              ? typeof r.value === 'string' && r.value.startsWith('#')
              : typeof targets[i] === 'number'
                ? typeof r.value === 'number' && Math.abs(r.value - targets[i]) < 1e-9
                : targets[i] === '#'
                  ? String(r.value).startsWith('#')
                  : r.value === targets[i]),
        )
      )
    },
    wanted,
    { timeout: 30000 },
  )
  const actual = await results()
  for (const [i, r] of actual.entries()) {
    const status = wanted === null || (typeof wanted[i] === 'string' && wanted[i].startsWith('#')) ? 'error' : 'success'
    if (r.status !== status)
      report.knownIssues.push({ gate: 'native-result-status', formulaIndex: i, expected: status, actual: r })
  }
  report.results.push(actual)
}
async function showSummary(name) {
  for (const chapter of [0, 3]) {
    await page.mouse.move(1400, 500)
    await page.mouse.wheel(0, -20000)
    await settle()
    if (chapter) {
      await page.mouse.wheel(0, 3450)
      await settle()
    }
    const all = await results(),
      texts = (chapter ? all.slice(7) : all.slice(0, 7)).map((r) => r.text)
    await page.waitForFunction(
      ({ targets, token }) =>
        [...window.docFrames.entries()].some(([canvas, glyphs]) => {
          const text = glyphs.join('')
          return (
            canvas.isConnected &&
            canvas.width > 700 &&
            !canvas.closest('[data-embed-id]') &&
            text.includes(token) &&
            targets.every((v) => text.includes(v))
          )
        }),
      { targets: texts, token: chapter ? 'RECONCILIATION' : 'POSITION' },
    )
    await page.screenshot({ path: path.join(directory, name + (chapter ? '-reconcile' : '') + '.png') })
  }
}
async function expand(kind = 'sheet') {
  if (await shell.count()) return
  const id = 'cobalt-' + kind + '-block'
  const block = page.locator('[data-u-comp="embed-float-dom"][data-embed-id="' + id + '"]')
  for (let i = 0; i < 20; i++) {
    const rect = await block.boundingBox()
    assert.ok(rect)
    if (rect.y >= 180 && rect.y + 180 < 1000) break
    await page.mouse.move(1400, 500)
    await page.mouse.wheel(0, rect.y - 280)
    await settle()
  }
  const rect = await block.boundingBox()
  // DocBlock activates on one pointer click. A double-click also starts a
  // native cell editor; leaving that editor for fullscreen can commit a blank.
  if ((await block.getAttribute('data-embed-float-stage')) !== 'stage2')
    await page.mouse.click(rect.x + 160, rect.y + 100)
  await page.waitForFunction(
    (embedId) =>
      document
        .querySelector('[data-embed-id="' + embedId + '"][data-u-comp="embed-float-dom"]')
        ?.getAttribute('data-embed-float-stage') === 'stage2',
    id,
  )
  await page
    .locator('[data-u-comp="embed-float-dom-chrome"][data-embed-id="' + id + '"]')
    .getByRole('button', { name: 'Enter fullscreen', exact: true })
    .click()
  await shell.waitFor()
  await settle()
}
async function collapse() {
  await shell.getByRole('button', { name: 'Exit fullscreen', exact: true }).click()
  await shell.waitFor({ state: 'detached' })
  await settle()
}
async function gate(name, run) {
  try {
    await run()
    report.checks.push({ gate: name, passed: true })
  } catch (error) {
    report.knownIssues.push({ gate: name, error: error.stack })
    await page.screenshot({ path: path.join(directory, name + '-failure.png') }).catch(() => {})
    if (await shell.count()) await collapse().catch(() => {})
  }
}

const snapshots = () =>
  page.evaluate(() =>
    JSON.parse(
      JSON.stringify({
        host: window.univerAPI.getDocument('cobalt-operating-review').save(),
        sheet: window.univerAPI.getWorkbook('cobalt-revenue-plan').save(),
        base: window.univerAPI.getBase('cobalt-cost-register').save(),
      }),
    ),
  )
const base = () => page.evaluate(() => window.univerAPI.getBase('cobalt-cost-register').save())
async function ready() {
  await page.waitForFunction(
    () =>
      document.querySelector('.cobalt-embed')?.dataset.ready || document.querySelector('.cobalt-embed')?.dataset.error,
    null,
    { timeout: 60000 },
  )
  assert.equal(await root.getAttribute('data-error'), null)
}
async function reconstruct(name, wanted) {
  const before = await snapshots()
  const pagination = await page.evaluate(() => window.readPages())
  assert.equal(pagination.length, 4)
  for (const item of pagination) assert.deepEqual([item.pageWidth, item.pageHeight], [794, 1123])
  const appearance = await page.evaluate(() => ({
    locale: window.univerAPI.getCurrentLocale(),
    darkMode: window.univerAPI.isDarkMode(),
  }))
  await page.evaluate(() => {
    window.oldAPI = window.univerAPI
  })
  await page.evaluate('(async()=>{' + restore + '})()')
  await ready()
  await values(wanted)
  assert.deepEqual(await page.evaluate(() => window.readPages()), pagination)
  assert.equal(await page.evaluate(() => window.oldAPI === window.univerAPI), false)
  assert.equal(await root.count(), 1)
  assert.equal(await shell.count(), 0)
  assert.equal(
    await page.evaluate(() => window.univerAPI.listEmbeds({ hostUnitId: 'cobalt-operating-review' }).length),
    2,
  )
  assert.deepEqual(
    await page.evaluate(() => ({
      locale: window.univerAPI.getCurrentLocale(),
      darkMode: window.univerAPI.isDarkMode(),
    })),
    appearance,
  )
  const after = await snapshots()
  await fs.writeFile(path.join(directory, name + '-snapshots.json'), JSON.stringify({ before, after }, null, 2))
  const previous = before.host.resources.find((r) => r.name === 'UNIVER_EMBED_RESOURCE_PLUGIN')
  const current = after.host.resources.find((r) => r.name === 'UNIVER_EMBED_RESOURCE_PLUGIN')
  const left = JSON.parse(previous.data),
    right = JSON.parse(current.data)
  const activationTimes = []
  for (const id of ['cobalt-sheet-block', 'cobalt-base-block']) {
    assert.ok(right.embeds[id].updatedAt >= left.embeds[id].updatedAt)
    activationTimes.push(right.embeds[id].updatedAt)
    right.embeds[id].updatedAt = left.embeds[id].updatedAt
  }
  current.data = JSON.stringify(right)
  let exactSnapshot = true
  try {
    assert.deepEqual(after, before, 'Complete serialized snapshots; only checked embed activation times may differ')
  } catch (error) {
    exactSnapshot = false
    report.knownIssues.push({ gate: 'complete-serialized-snapshots', name, error: error.stack })
  }
  // Keep the strict full-snapshot failure above; these independent checks make
  // subsequent restored interactions observable without silently stripping data.
  const { resources: oldResources, ...oldHost } = before.host
  const { resources: newResources, ...newHost } = after.host
  assert.deepEqual(newHost, oldHost)
  assert.deepEqual(
    newResources.map((r) => r.name),
    oldResources.map((r) => r.name),
  )
  for (const [i, resource] of oldResources.entries()) {
    const oldData = JSON.parse(resource.data),
      newData = JSON.parse(newResources[i].data)
    if (resource.name === 'DOC_FORMULA_PLUGIN') {
      // The strict comparison above retains any cached-lastValue mismatch.
      // Separately prove that no authored formula, format or ID was reseeded.
      for (const data of [oldData, newData])
        for (const formula of Object.values(data.formulas)) delete formula.lastValue
    }
    assert.deepEqual(newData, oldData, resource.name + ' authored configuration')
  }
  assert.deepEqual(after.base, before.base)
  assert.deepEqual(after.sheet.sheets, before.sheet.sheets)
  assert.deepEqual(after.sheet.styles, before.sheet.styles)
  await showSummary(name)
  report.checks.push({ name, exactSnapshot, authoredHostAndSourcesPreserved: true, pagination, activationTimes })
  console.log('Cobalt reconstructed: ' + name + '; exact snapshot: ' + exactSnapshot)
}
const uplift = (v) => v.map((x, i) => (i === 0 && typeof x === 'number' ? x * 1.05 : x))
try {
  await page.goto('http://127.0.0.1:4328', { waitUntil: 'domcontentloaded', timeout: 60000 })
  await ready()
  await values(baseline)
  const original = await snapshots()
  const rejected = await page.evaluate(() => {
    const owner = window.univerAPI
    const bundle = {
      host: owner.getDocument('cobalt-operating-review').save(),
      sheet: owner.getWorkbook('cobalt-revenue-plan').save(),
      base: owner.getBase('cobalt-cost-register').save(),
    }
    return [
      'host-id',
      'sheet-id',
      'base-id',
      'sheet',
      'table',
      'missing-host',
      'missing-sheet',
      'missing-base',
      'embed-resource',
      'anchor',
    ].map((kind) => {
      const saved = structuredClone(bundle)
      if (kind === 'host-id') saved.host.id = 'another-doc'
      if (kind === 'sheet-id') saved.sheet.id = 'another-sheet'
      if (kind === 'base-id') saved.base.id = 'another-base'
      if (kind === 'sheet') delete saved.sheet.sheets.revenue
      if (kind === 'table') delete saved.base.tables.costs
      if (kind === 'missing-host') delete saved.host
      if (kind === 'missing-sheet') delete saved.sheet
      if (kind === 'missing-base') delete saved.base
      if (kind === 'embed-resource')
        saved.host.resources = saved.host.resources.filter((r) => r.name !== 'UNIVER_EMBED_RESOURCE_PLUGIN')
      if (kind === 'anchor') saved.host.body.customBlocks = []
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
        roots: document.querySelectorAll('.cobalt-embed').length,
      }
    })
  })
  for (const result of rejected) {
    assert.match(result.message, /Restore .*Cobalt/)
    assert.equal(result.sameOwner, true)
    assert.equal(result.roots, 1)
  }
  assert.deepEqual(await snapshots(), original)
  report.checks.push({ rejected })
  for (const n of [0, 1, 2, 4, 5, 6]) await page.evaluate(examples[n])
  await page.evaluate(() => {
    const doc = window.univerAPI.getDocument('cobalt-operating-review')
    const first = doc.getFormulas()[0]
    if (
      !first.update({
        formula: first.getFormula() + '*1.05',
        numberFormat: { pattern: '$#,##0.00' },
        externalReferences: [
          {
            qualifier: 'Cobalt Revenue',
            sourceUnitId: 'cobalt-revenue-plan',
            sourceUnitType: window.univerAPI.Enum.UniverInstanceType.UNIVER_SHEET,
          },
        ],
      })
    )
      throw new Error('Formula edit failed')
    if (
      !doc.insertText(
        doc.getBody().dataStream.indexOf('POSITION'),
        'Scenario revision: the first revenue figure includes a 5% uplift; reconciliation keeps the unadjusted plan. ',
      )
    )
      throw new Error('Prose insertion failed')
  })
  let wanted = uplift(expected([26000, 28000, 34000], [18500, 15700, 9700, 15100, 3200], 0.4, true))
  await values(wanted)
  assert.equal(
    await page.evaluate(
      () =>
        window.univerAPI.getBase('cobalt-cost-register').getTableById('costs').getViewById('costs-grid').getProjection()
          .rows.length,
    ),
    0,
  )
  await reconstruct('edited-formula-prose-empty-filter', wanted)
  await gate('fresh-native-sheet-keyboard-value-history-after-restore', async () => {
    const beforeActivation = await source()
    await expand()
    assert.deepEqual(await source(), beforeActivation)
    const point = await page.evaluate(() => {
      const s = window.univerAPI.getWorkbook('cobalt-revenue-plan').save().sheets.revenue
      const r = document
        .querySelector('[data-embed-fullscreen-shell="true"] [data-embed-canvas-root="true"] canvas')
        .getBoundingClientRect()
      const h = (i) => s.rowData[i]?.h || s.defaultRowHeight
      return {
        x: r.x + (s.rowHeader.width + s.columnData[0].w + s.columnData[1].w / 2) * s.zoomRatio,
        y: r.y + (s.columnHeader.height + [0, 1, 2, 3].reduce((n, i) => n + h(i), 0) + h(4) / 2) * s.zoomRatio,
      }
    })
    await page.mouse.click(point.x, point.y)
    await page.waitForFunction(
      () => window.univerAPI.getWorkbook('cobalt-revenue-plan').getActiveRange()?.getA1Notation() === 'B5',
    )
    const before = await source(),
      beforeBase = await base(),
      beforeBody = await body()
    await page.keyboard.type('27000')
    await page.keyboard.press('Enter')
    const revised = uplift(expected([27000, 28000, 34000], [18500, 15700, 9700, 15100, 3200], 0.4, true))
    await values(revised)
    const after = await source()
    await page.keyboard.press('Control+z')
    await values(wanted)
    try {
      assert.deepEqual(await source(), before)
    } catch (error) {
      report.knownIssues.push({ gate: 'restored-sheet-exact-undo-snapshot', error: error.stack })
    }
    await page.keyboard.press('Control+y')
    await values(revised)
    assert.deepEqual(await source(), after)
    assert.deepEqual(await base(), beforeBase)
    assert.deepEqual(await body(), beforeBody)
    wanted = revised
    await collapse()
    await showSummary('fresh-native-sheet')
  })
  // Hidden Base changes must still refresh the restored document, without recreating it.
  await page.evaluate(() =>
    window.univerAPI
      .getBase('cobalt-cost-register')
      .getTableById('costs')
      .getRecordById('cost-3')
      .setValue('amount', 10700),
  )
  wanted = uplift(expected([27000, 28000, 34000], [18500, 15700, 10700, 15100, 3200], 0.4, true))
  await values(wanted)
  await page.evaluate(() => window.univerAPI.setCurrent('cobalt-operating-review'))
  await showSummary('fresh-hidden-base')
  report.checks.push('Hidden Base edits recalculate the restored formula and both report chapters')
  await page.evaluate(examples[15])
  const missing = wanted.map((v, i) => ([1, 4, 5, 6, 8].includes(i) ? v : '#'))
  await values(missing)
  await expand()
  await reconstruct('missing-binding-from-fullscreen', missing)
  await page.evaluate(examples[16])
  await values(wanted)
  await page.evaluate(() => {
    window.univerAPI.setLocale('zhCN')
    window.univerAPI.toggleDarkMode(true)
  })
  await settle()
  await reconstruct('chinese-dark-restoration', wanted)
  await page.evaluate(() => {
    window.univerAPI.setLocale('enUS')
    window.univerAPI.toggleDarkMode(false)
  })
  await settle()
  await page.evaluate(examples[17])
  const missingBase = wanted.map((v, i) => ([0, 7, 10].includes(i) ? v : '#'))
  await values(missingBase)
  await reconstruct('missing-base-binding', missingBase)
  await page.evaluate(examples[18])
  await values(wanted)
  await gate('fresh-native-base-keyboard-history-after-restore', async () => {
    await page.evaluate(() => {
      window.univerAPI.getBase('cobalt-cost-register').getTableById('costs').getViewById('costs-grid').setFilter(null)
      window.univerAPI.setCurrent('cobalt-operating-review')
      window.basePoints = []
    })
    const beforeActivation = await base()
    await expand('base')
    assert.deepEqual(await base(), beforeActivation)
    await page.waitForFunction(() => window.basePoints.some((p) => /^15,?700(?:\.00)?$/.test(p.text)))
    const point = await page.evaluate(() => window.basePoints.findLast((p) => /^15,?700(?:\.00)?$/.test(p.text)))
    const before = await base(),
      beforeSheet = await source(),
      beforeBody = await body()
    await page.mouse.dblclick(point.x - 8, point.y - 4)
    await page.keyboard.press('Control+A')
    await page.keyboard.type('16200')
    await page.keyboard.press('Enter')
    const revised = uplift(expected([27000, 28000, 34000], [18500, 16200, 10700, 15100, 3200], 0.4, true))
    await values(revised)
    const after = await base()
    await page.keyboard.press('Control+z')
    await values(wanted)
    assert.deepEqual(await base(), before)
    await page.keyboard.press('Control+y')
    await values(revised)
    assert.deepEqual(await base(), after)
    assert.deepEqual(await source(), beforeSheet)
    assert.deepEqual(await body(), beforeBody)
    wanted = revised
    await collapse()
    await showSummary('fresh-native-base')
  })
  const deletedId = await page.evaluate(() => {
    const last = window.univerAPI.getDocument('cobalt-operating-review').getFormulas().at(-1)
    const id = last.getId()
    if (!last.replaceWithText('Discussion recorded for the next review.')) throw new Error('Formula replacement failed')
    return id
  })
  wanted = wanted.slice(0, -1)
  await values(wanted)
  await reconstruct('removed-formula-reading-text', wanted)
  assert.equal(
    await page.evaluate(
      (id) =>
        window.univerAPI
          .getDocument('cobalt-operating-review')
          .getFormulas()
          .some((f) => f.getId() === id),
      deletedId,
    ),
    false,
  )
  await page.evaluate(() =>
    window.univerAPI.getWorkbook('cobalt-revenue-plan').getSheetBySheetId('revenue').getRange('B5').setValue(27500),
  )
  wanted = uplift(expected([27500, 28000, 34000], [18500, 16200, 10700, 15100, 3200], 0.4, true)).slice(0, -1)
  await values(wanted)
  await showSummary('removed-formula-fresh-source')
  report.checks.push('Replaced inline formula stays removed; thirteen live values recalculate after fresh input')
  await page.evaluate(() => window.demo.dispose())
  await root.waitFor({ state: 'detached' })
  await settle()
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.warnings, [])
  assert.deepEqual(report.backendRequests, [])
  report.passed = report.knownIssues.length === 0
} catch (e) {
  report.failure = e.stack
  report.models = await snapshots().catch(() => null)
  report.currentResults = await results().catch(() => [])
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify({ ...report, models: undefined, results: undefined }, null, 2))
  await browser.close()
  await new Promise((resolve) => server.httpServer.close(resolve))
}
if (!report.passed) process.exitCode = 1
