/* eslint-disable no-await-in-loop -- Mutate the same native source in the published order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-reed-formula')
await fs.mkdir(directory, { recursive: true })
const examples = [
  ...(await fs.readFile('showcase/embed/boards-in-bases-formula-tab/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((m) => m[1])
assert.equal(examples.length, 16)
const ids = [
  'total',
  'capacity',
  'utilization',
  ...Array.from({ length: 3 }, (_, i) => ['load-' + i, 'spare-' + i]).flat(),
  'blocked',
  'overloaded',
  'signal',
]
function expected(loads = [14, 9, 7], capacities = [18, 12, 10], blocked = 1) {
  const load = loads.reduce((a, b) => a + b, 0),
    capacity = capacities.reduce((a, b) => a + b, 0)
  const overloaded = loads.filter((v, i) => v > capacities[i]).length
  return [
    load,
    capacity,
    capacity ? load / capacity : '#DIV/0!',
    ...loads.flatMap((v, i) => [v, capacities[i] - v]),
    blocked,
    overloaded,
    overloaded ? 'Rebalance the load' : blocked ? 'Resolve the blocker' : 'Ready to review',
  ]
}
const states = [
  expected([14, 12, 7]),
  expected([14, 12, 7], [18, 10, 10]),
  expected([14, 12, 7], [18, 10, 10], 0),
  ...Array.from({ length: 3 }, () => expected([14, 8, 7], [18, 10, 10], 0)),
  expected([14, 8, 11], [18, 10, 10], 0),
  expected([14, 8, 0], [18, 10, 10], 0),
  expected([14, 8, 0], [18, 10, 10], 0),
  expected([14, 8, 0], [0, 0, 0], 0),
  expected(),
  expected(),
  expected([14, 12, 7]),
  null,
  expected([14, 12, 7]),
  expected([14, 12, 7]),
]
const report = { passed: false, checks: [], knownIssues: [], errors: [], warnings: [], backendRequests: [] }
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1700, height: 1100 } })
page.setDefaultTimeout(15000)
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
    if (this.canvas.closest('.reed-embed') && !this.canvas.closest('[data-embed-bases-table-list-host]')) {
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

const root = page.locator('.reed-embed')
const child = root.locator('[data-embed-bases-table-list-host="reed-operations-tab"]')
const settle = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
const source = () => page.evaluate(() => window.univerAPI.getBase('reed-repair-station').save())
const board = () => page.evaluate(() => window.univerAPI.getBoard('reed-operations-map').save())
const results = () =>
  page.evaluate(
    (shapes) => shapes.map((id) => window.univerAPI.getBoard('reed-operations-map').getShape(id).getFormulaResult()),
    ids,
  )
const authored = () =>
  page.evaluate(() => {
    const data = JSON.parse(JSON.stringify(window.univerAPI.getBoard('reed-operations-map').save()))
    for (const p of Object.values(data.pages))
      for (const e of Object.values(p.elements))
        if (e.shapeData?.formulaBinding) delete e.shapeData.formulaBinding.lastValue
    return { pages: data.pages, pageOrder: data.pageOrder, size: data.defaultPageSize, name: data.name }
  })
async function values(wanted, label) {
  await page.waitForFunction(
    ({ ids: shapes, targets }) =>
      shapes.every((id, i) => {
        const r = window.univerAPI.getBoard('reed-operations-map').getShape(id).getFormulaResult()
        return (
          r &&
          !r.stale &&
          (targets === null
            ? typeof r.value === 'string' && r.value.startsWith('#')
            : typeof targets[i] === 'number'
              ? typeof r.value === 'number' && Math.abs(r.value - targets[i]) < 1e-9
              : r.value === targets[i])
        )
      }),
    { ids, targets: wanted },
    { timeout: 30000 },
  )
  const actual = await results()
  for (const [i, r] of actual.entries()) {
    const status = wanted === null || (typeof wanted[i] === 'string' && wanted[i].startsWith('#')) ? 'error' : 'success'
    if (r.status !== status)
      report.knownIssues.push({ gate: 'native-result-status', label, shape: ids[i], expected: status, actual: r })
  }
  return actual
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
async function painted(name) {
  const actual = await results()
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
async function gate(name, run) {
  try {
    await run()
    report.checks.push({ gate: name, passed: true })
    return true
  } catch (e) {
    report.knownIssues.push({ gate: name, error: e.stack })
    await page.screenshot({ path: path.join(directory, name + '-failure.png') })
    return false
  }
}
function includesPack(actual, pack) {
  for (const [key, value] of Object.entries(pack))
    if (value && typeof value === 'object') includesPack(actual?.[key], value)
    else assert.equal(actual?.[key], value, key)
}
try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4320', {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  })
  await page.waitForFunction(
    () => document.querySelector('.reed-embed')?.dataset.ready || document.querySelector('.reed-embed')?.dataset.error,
    null,
    { timeout: 60000 },
  )
  assert.equal(await root.getAttribute('data-error'), null)
  await values(expected(), 'baseline')
  report.descriptor = await page.evaluate(() =>
    window.univerAPI.getEmbed({ hostUnitId: 'reed-repair-station', embedId: 'reed-operations' }).getDescriptor(),
  )
  assert.equal(report.descriptor.hostAnchorId, 'reed-operations-tab')
  assert.equal(report.descriptor.childUnitId, 'reed-operations-map')
  assert.deepEqual((await source()).tableOrder, ['streams', 'reed-operations-tab'])
  assert.equal(await root.locator('iframe,fieldset,details,[data-action]').count(), 0)
  await openBoard()
  await painted('baseline')
  report.connectors = await connectors()
  const original = await authored()
  for (const [i, code] of examples.entries()) {
    await openSource()
    await page.evaluate(code)
    const actual = await values(states[i], 'example-' + (i + 1))
    const data = await source()
    if (i === 5)
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
    if (i === 7) assert.equal(data.tables.streams.records['stream-3'].values.load, null)
    if (i === 8) assert.equal(data.tables.streams.records['stream-3'].values.load, 0)
    if (i === 10)
      assert.equal(
        await page.evaluate(
          () =>
            window.univerAPI
              .getBase('reed-repair-station')
              .getTableById('streams')
              .getViewById('streams-grid')
              .getProjection().rows.length,
        ),
        1,
      )
    await openBoard()
    await painted('example-' + (i + 1))
    assert.deepEqual(await authored(), original)
    report.checks.push({ example: i + 1, results: actual, authoredPreserved: true })
    console.log('Reed example ' + (i + 1) + ' live canvas passed')
  }
  await gate('passive-source-write-and-return', async () => {
    await page.evaluate(() =>
      window.univerAPI
        .getBase('reed-repair-station')
        .getTableById('streams')
        .getRecordById('stream-1')
        .setValue('load', 20),
    )
    await values(expected([20, 12, 7]), 'off-page')
    await painted('passive-source-write')
    assert.equal(await page.evaluate(() => window.univerAPI.getBaseUI().getActiveTableId()), 'reed-operations-tab')
    await openSource()
  })
  await openSource()
  await page.evaluate(examples[10])
  await values(expected(), 'native-baseline')
  await page.evaluate(() => {
    window.basePoints = []
  })
  await openBoard()
  await openSource()
  await page.waitForFunction(() => window.basePoints.some((p) => p.text === '9'))
  const point = await page.evaluate(() => window.basePoints.findLast((p) => p.text === '9'))
  const before = await source()
  await page.mouse.dblclick(point.x - 20, point.y - 4)
  const editor = root.locator('input[inputmode="decimal"]')
  await editor.waitFor()
  await editor.fill('11')
  await editor.press('Enter')
  await values(expected([14, 11, 7]), 'native-input')
  assert.equal((await source()).tables.streams.records['stream-2'].values.load, 11)
  const after = await source()
  await gate('native-history', async () => {
    await page.keyboard.press('Control+z')
    await values(expected(), 'undo')
    assert.deepEqual(await source(), before)
    await page.keyboard.press('Control+y')
    await values(expected([14, 11, 7]), 'redo')
    assert.deepEqual(await source(), after)
  })
  await openBoard()
  await painted('native-updated')
  assert.deepEqual(await authored(), original)
  await connectors()
  report.checks.push('Native Base numeric input updates all twelve Board results and the current canvas')
  for (const [locale, code] of [
    ['en-US', 'enUS'],
    ['zh-CN', 'zhCN'],
  ]) {
    await page.evaluate((value) => window.univerAPI.setLocale(value), code)
    for (const pack of ['bases', 'bases-ui', 'boards-ui', 'slides-ui', 'shape-editor-ui', 'embed-ui', 'embed-unit-ui'])
      includesPack(
        await page.evaluate(() => window.univerAPI.getLocales()),
        (await import('@univerjs-pro/' + pack + '/locale/' + locale)).default,
      )
    for (const pack of ['design', 'docs-ui', 'ui'])
      includesPack(
        await page.evaluate(() => window.univerAPI.getLocales()),
        (await import('@univerjs/' + pack + '/locale/' + locale)).default,
      )
    await gate('theme-' + locale, async () => {
      const models = { base: await source(), board: await board() }
      await page.evaluate(() => {
        window.reedOwner = window.univerAPI
        window.univerAPI.toggleDarkMode(true)
      })
      await settle()
      await page.evaluate(() => window.univerAPI.toggleDarkMode(false))
      await settle()
      assert.deepEqual({ base: await source(), board: await board() }, models)
      assert.equal(await page.evaluate(() => window.reedOwner === window.univerAPI), true)
    })
    await painted('locale-' + locale)
    report.checks.push({ locale, wholePacks: 10 })
  }
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
  await root.waitFor({ state: 'detached' })
  await settle()
  assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.backendRequests, [])
  report.passed = report.knownIssues.length === 0 && report.warnings.length === 0
} catch (e) {
  report.failure = e.stack
  report.lastResults = await results().catch(() => [])
  report.lastSource = await source().catch(() => null)
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(
    JSON.stringify(
      {
        ...report,
        lastSource: undefined,
        checks: report.checks.map((c) => (typeof c === 'object' ? { ...c, results: undefined } : c)),
      },
      null,
      2,
    ),
  )
  await browser.close()
}
if (!report.passed) process.exitCode = 1
