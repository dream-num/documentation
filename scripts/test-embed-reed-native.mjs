/* eslint-disable no-await-in-loop -- Mutate the same native source in the published order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-reed-native')
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

const root = page.locator('.reed-embed')
const child = root.locator('[data-embed-bases-table-list-host="reed-operations-tab"]')
const settle = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
const source = () => page.evaluate(() => window.univerAPI.getBase('reed-repair-station').save())
const board = () =>
  page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getBoard('reed-operations-map').save())))
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

const diagnostic = () =>
  page.evaluate(() => ({
    active: document.activeElement?.outerHTML.slice(0, 700),
    focused: window.univerAPI._univerInstanceService.getFocusedUnit()?.getUnitId(),
  }))
async function glyphPoint(text) {
  await page.waitForFunction(
    (target) =>
      window.boardPoints.some((p, i, all) =>
        all
          .slice(i, i + target.length)
          .map((q) => q.text)
          .join('')
          .startsWith(target),
      ),
    text,
  )
  return page.evaluate(
    (target) =>
      window.boardPoints.findLast((p, i, all) =>
        all
          .slice(i, i + target.length)
          .map((q) => q.text)
          .join('')
          .startsWith(target),
      ),
    text,
  )
}
async function check(name, run) {
  try {
    await run()
    report.checks.push({ name, passed: true })
    console.log(name + ' PASS')
  } catch (e) {
    report.knownIssues.push({ name, error: e.stack, diagnostic: await diagnostic() })
    await page.screenshot({ path: path.join(directory, name + '-failure.png') })
    console.log(name + ' FAIL')
  }
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
  await openBoard()
  await values(expected(), 'baseline')
  await painted('baseline')
  for (const phase of ['fresh', 'after-facade-text', 'chinese-dark']) {
    if (phase === 'after-facade-text') {
      await openSource()
      for (const n of [12, 1, 2, 4, 5]) await page.evaluate(examples[n])
      await values(expected([14, 12, 7], [18, 10, 10], 0), phase)
      await openBoard()
      await page.evaluate(() =>
        window.univerAPI
          .getBoard('reed-operations-map')
          .getShape('stream-note-0')
          .getText()
          .setText('Reviewed / Keep a labelled shelf.'),
      )
      await page.evaluate(() =>
        window.univerAPI
          .getBoard('reed-operations-map')
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
          .setFormulaNumberFormat('0.0" h"'),
      )
      await values(expected([14, 12, 7], [18, 10, 10], 0, 2), phase)
    }
    if (phase === 'chinese-dark') {
      await page.evaluate(() => {
        window.univerAPI.setLocale('zhCN')
        window.univerAPI.toggleDarkMode(true)
      })
      await settle()
    }
    const hostBefore = await source()
    await check(phase + '-keyboard-movement', async () => {
      const childBefore = await board(),
        routesBefore = await connectors()
      const left = childBefore.pages.operations.elements['source-node'].transform.left
      const point = await glyphPoint('ONE BASE')
      report.checks.push({ phase, point, beforeClick: await diagnostic() })
      await page.mouse.click(point.x + 12, point.y - 4)
      report.checks.push({ phase, afterClick: await diagnostic() })
      await page.keyboard.press('ArrowRight')
      await page.waitForFunction(
        (x) =>
          window.univerAPI.getBoard('reed-operations-map').save().pages.operations.elements['source-node'].transform
            .left > x,
        left,
        { timeout: 5000 },
      )
      assert.notDeepEqual(await connectors(), routesBefore)
      assert.deepEqual(await source(), hostBefore)
      const childAfter = await board()
      await page.keyboard.press('Control+z')
      await page.waitForFunction(
        (x) =>
          window.univerAPI.getBoard('reed-operations-map').save().pages.operations.elements['source-node'].transform
            .left === x,
        left,
        { timeout: 5000 },
      )
      assert.deepEqual(await board(), childBefore)
      await page.keyboard.press('Control+y')
      await page.waitForFunction(
        (x) =>
          window.univerAPI.getBoard('reed-operations-map').save().pages.operations.elements['source-node'].transform
            .left > x,
        left,
        { timeout: 5000 },
      )
      assert.deepEqual(await board(), childAfter)
      assert.deepEqual(await source(), hostBefore)
      await painted(phase + '-moved')
    })
  }
  for (const locale of ['enUS', 'zhCN'])
    await check('native-board-text-' + locale, async () => {
      await page.evaluate((value) => window.univerAPI.setLocale(value), locale)
      await settle()
      const hostBefore = await source()
      const childBefore = await board()
      const point = await glyphPoint('ONE BASE')
      await page.mouse.dblclick(point.x + 12, point.y - 4)
      await page.waitForFunction(
        () =>
          document.activeElement?.isContentEditable || ['TEXTAREA', 'INPUT'].includes(document.activeElement?.tagName),
        null,
        { timeout: 5000 },
      )
      await page.keyboard.press('Control+End')
      await page.keyboard.type(' Reviewed.', { delay: 35 })
      await page.waitForFunction(
        () => [...window.framesPaint.values()].some((glyphs) => glyphs.join('').includes('Reviewed.')),
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
            .includes('Reviewed.'),
        null,
        { timeout: 5000 },
      )
      assert.deepEqual(await source(), hostBefore)
      await values(expected([14, 12, 7], [18, 10, 10], 0, 2), 'after-board-text')
      await painted('native-board-text-' + locale)
      const childAfter = await board()
      // The first outside click commits and unmounts the floating text editor.
      // Focus the surviving canvas before sending keyboard history shortcuts.
      await child.locator('[data-board-viewport-host="true"]').click({ position: { x: 20, y: 30 } })
      let steps = 0
      // Native typing may commit several edits; preserve every serialized model field.
      while (steps < 8 && JSON.stringify(await board()) !== JSON.stringify(childBefore)) {
        const previous = JSON.stringify(await board())
        await page.keyboard.press('Control+z')
        await page.waitForFunction(
          (snapshot) => JSON.stringify(window.univerAPI.getBoard('reed-operations-map').save()) !== snapshot,
          previous,
          { timeout: 5000 },
        )
        await settle()
        steps++
      }
      assert.deepEqual(await board(), childBefore)
      for (let n = 0; n < steps; n++) {
        const previous = JSON.stringify(await board())
        await page.keyboard.press('Control+y')
        await page.waitForFunction(
          (snapshot) => JSON.stringify(window.univerAPI.getBoard('reed-operations-map').save()) !== snapshot,
          previous,
          { timeout: 5000 },
        )
        await settle()
      }
      assert.deepEqual(await board(), childAfter)
      assert.deepEqual(await source(), hostBefore)
      report.checks.push({ locale, textHistorySteps: steps })
    })
  await page.keyboard.press('Escape')
  await openSource()
  await page.evaluate(examples[3])
  await values(expected([14, 8, 7], [18, 10, 10], 0, 2), 'source-after-board-edit')
  const mapBefore = await authored()
  await openBoard()
  await painted('source-after-board-edit')
  assert.deepEqual(await authored(), mapBefore)
  await connectors()
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
  await root.waitFor({ state: 'detached' })
  await settle()
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.warnings, [])
  assert.deepEqual(report.backendRequests, [])
  report.passed = report.knownIssues.length === 0
} catch (e) {
  report.failure = e.stack
  report.diagnostic = await diagnostic().catch(() => null)
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  await browser.close()
}
if (!report.passed) process.exitCode = 1
