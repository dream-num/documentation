/* eslint-disable no-await-in-loop -- Run the published examples and native interactions in order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-grove-formula')
await fs.mkdir(directory, { recursive: true })
const examples = [
  ...(await fs.readFile('showcase/embed/mixed-to-boards/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((m) => m[1])
assert.equal(examples.length, 20)
const ids = [
  'budget',
  'cost',
  'balance',
  'ready-share',
  'ready-count',
  'gate-count',
  'blocked-count',
  'threshold',
  'headroom',
  'signal',
  'build-balance',
  'build-share',
  'programme-balance',
  'programme-share',
  'care-balance',
  'care-share',
]
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1780, height: 1200 } })
page.setDefaultTimeout(15000)
const report = { passed: false, examples: [], gates: {}, errors: [], warnings: [], issues: [], backendRequests: [] }
page.on('pageerror', (e) => report.errors.push(e.stack || e.message))
page.on('console', (m) => {
  if (m.type() === 'error') report.errors.push(m.text())
  if (m.type() === 'warning') report.warnings.push(m.text())
})
page.on('request', (r) => {
  if (
    !['GET', 'HEAD', 'OPTIONS'].includes(r.method()) ||
    r.url().includes('/universer-api/') ||
    (['fetch', 'xhr'].includes(r.resourceType()) && !['127.0.0.1', 'localhost'].includes(new URL(r.url()).hostname))
  )
    report.backendRequests.push(r.url())
})
page.on('websocket', (s) => report.backendRequests.push(s.url()))
await page.addInitScript(() => {
  window.framesNow = new Map()
  window.pointsNow = new Map()
  const fill = CanvasRenderingContext2D.prototype.fillText
  const clear = CanvasRenderingContext2D.prototype.clearRect
  const draw = CanvasRenderingContext2D.prototype.drawImage
  CanvasRenderingContext2D.prototype.clearRect = function (...args) {
    window.framesNow.set(this.canvas, [])
    window.pointsNow.set(this.canvas, [])
    return Reflect.apply(clear, this, args)
  }
  CanvasRenderingContext2D.prototype.fillText = function (...args) {
    const texts = window.framesNow.get(this.canvas) || []
    texts.push(String(args[0]))
    window.framesNow.set(this.canvas, texts)
    if (this.canvas.closest('[data-embed-fullscreen-shell], [data-board-viewport-host]')) {
      const p = this.getTransform().transformPoint({ x: args[1], y: args[2] })
      const b = this.canvas.getBoundingClientRect()
      const points = window.pointsNow.get(this.canvas) || []
      points.push({
        text: String(args[0]),
        x: b.x + (p.x * b.width) / this.canvas.width,
        y: b.y + (p.y * b.height) / this.canvas.height,
      })
      window.pointsNow.set(this.canvas, points)
    }
    return Reflect.apply(fill, this, args)
  }
  CanvasRenderingContext2D.prototype.drawImage = function (source, ...args) {
    const texts = window.framesNow.get(this.canvas) || []
    texts.push(...(window.framesNow.get(source) || []))
    window.framesNow.set(this.canvas, texts)
    return Reflect.apply(draw, this, [source, ...args])
  }
})
const root = page.locator('.grove-embed')
const shell = page.locator('[data-embed-fullscreen-shell="true"]')
const settle = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
const results = () =>
  page.evaluate(
    (keys) =>
      Object.fromEntries(
        keys.map((id) => [id, window.univerAPI.getBoard('grove-exhibition-readiness').getShape(id).getFormulaResult()]),
      ),
    ids,
  )
const snapshots = () =>
  page.evaluate(() =>
    JSON.parse(
      JSON.stringify({
        board: window.univerAPI.getBoard('grove-exhibition-readiness').save(),
        sheet: window.univerAPI.getWorkbook('grove-budget-plan').save(),
        base: window.univerAPI.getBase('grove-readiness-register').save(),
      }),
    ),
  )
const authored = () =>
  page.evaluate((keys) => {
    const p = window.univerAPI.getBoard('grove-exhibition-readiness').save().pages.readiness
    return {
      order: p.elementOrder,
      elements: Object.fromEntries(
        Object.entries(p.elements).map(([id, e]) => [
          id,
          keys.includes(id)
            ? {
                transform: e.transform,
                formula: window.univerAPI.getBoard('grove-exhibition-readiness').getShape(id).getFormula(),
              }
            : e,
        ]),
      ),
    }
  }, ids)
async function rendered(name) {
  const texts = Object.values(await results()).map((r) => r.displayText)
  await page.waitForFunction(
    (targets) =>
      [...window.framesNow.entries()].some(
        ([canvas, frame]) =>
          canvas.isConnected &&
          canvas.width > 700 &&
          canvas.closest('[data-board-viewport-host="true"]') &&
          targets.every((text) => frame.join('').includes(text)),
      ),
    texts,
  )
  await page.screenshot({ path: path.join(directory, name + '.png') })
}
function baseline() {
  return {
    budget: [6000, 7000, 5000],
    cost: [3200, 2800, 3600, 2100, 1700, 1200],
    status: ['Ready', 'Ready', 'Ready', 'In progress', 'Ready', 'Blocked'],
    zones: ['Build', 'Build', 'Programme', 'Programme', 'Care', 'Care'],
    ceiling: 0.85,
  }
}
let model = baseline()
function expected() {
  const b = model.budget.reduce((a, v) => a + v, 0),
    c = model.cost.reduce((a, v) => a + (v || 0), 0)
  const ready = model.status.filter((v) => v === 'Ready').length,
    blocked = model.status.filter((v) => v === 'Blocked').length
  return [
    b,
    c,
    b - c,
    ready / 6,
    ready,
    6,
    blocked,
    model.ceiling,
    b * model.ceiling - c,
    blocked ? 'Resolve blockers' : c > b * model.ceiling ? 'Review spending' : 'Continue gate review',
    ...['Build', 'Programme', 'Care'].flatMap((z, i) => {
      const rows = model.zones.map((v, j) => (v === z ? j : -1)).filter((j) => j >= 0)
      return [
        model.budget[i] - rows.reduce((a, j) => a + (model.cost[j] || 0), 0),
        rows.length ? rows.filter((j) => model.status[j] === 'Ready').length / rows.length : '#DIV/0!',
      ]
    }),
  ]
}
async function values(missingIds = []) {
  const wanted = expected()
  await page.waitForFunction(
    ({ keys, target, errorIds }) =>
      keys.every((id, i) => {
        const r = window.univerAPI.getBoard('grove-exhibition-readiness').getShape(id).getFormulaResult()
        if (!r || r.stale) return false
        if (errorIds.includes(id)) return r.displayText.startsWith('#')
        return typeof target[i] === 'number'
          ? r.status === 'success' && typeof r.value === 'number' && Math.abs(r.value - target[i]) < 1e-8
          : r.displayText === target[i] || r.value === target[i]
      }),
    { keys: ids, target: wanted, errorIds: missingIds },
    { timeout: 30000 },
  )
  const current = await results()
  for (const [id, r] of Object.entries(current))
    if (r.displayText.startsWith('#') && r.status !== 'error')
      report.issues.push({ id, result: r, reason: 'Native error displayed without error status' })
}
async function gate(name, fn) {
  try {
    await fn()
    report.gates[name] = { passed: true }
  } catch (e) {
    report.gates[name] = { passed: false, failure: e.stack }
    await page.screenshot({ path: path.join(directory, name + '-failure.png') }).catch(() => {})
  }
}
async function boardPoint() {
  return page.evaluate(() => {
    // The native Float's DOM rectangle follows the same Board viewport transform.
    // Resolve model coordinates from this live anchor, not stale cached glyph paints.
    const rect = document
      .querySelector('[data-u-comp="embed-float-dom"][data-embed-id="grove-sheet-float"]')
      .getBoundingClientRect()
    const shape = window.univerAPI.getBoard('grove-exhibition-readiness').save().pages.readiness.elements[
      'source-summary'
    ].transform
    const scale = rect.width / 710
    return { x: rect.x + (shape.left + 22 - 80) * scale, y: rect.y + (shape.top + 24 - 620) * scale }
  })
}
async function connectors() {
  const layout = await page.evaluate(() =>
    window.univerAPI.executeCommand('board-ui.command.analyze-rendered-layout', {
      unitId: 'grove-exhibition-readiness',
      subUnitId: 'readiness',
    }),
  )
  assert.equal(layout.source, 'rendered')
  assert.equal(layout.routes.length, 3)
  const elements = (await snapshots()).board.pages.readiness.elements
  for (const route of layout.routes) {
    assert.equal(route.resolved, true)
    const edge = elements[route.connectorId].connectorData
    for (const [binding, point] of [
      [edge.start, route.points[0]],
      [edge.end, route.points.at(-1)],
    ]) {
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
async function collapse() {
  if (await shell.count()) {
    await shell.getByRole('button', { name: /^(Exit fullscreen|退出全屏)$/, exact: true }).click()
    await shell.waitFor({ state: 'detached' })
    await settle()
  }
}
async function expand(kind) {
  await collapse()
  const before = await snapshots()
  const child = root.locator('[data-u-comp="embed-float-dom"][data-embed-id="grove-' + kind + '-float"]')
  await child.click({ position: { x: 180, y: 80 } })
  if ((await child.getAttribute('data-embed-float-stage')) !== 'stage2')
    await child.click({ position: { x: 180, y: 80 } })
  await page
    .locator('[data-u-comp="embed-float-dom-chrome"][data-embed-id="grove-' + kind + '-float"]')
    .getByRole('button', { name: 'Enter fullscreen', exact: true })
    .click()
  await shell.waitFor()
  await settle()
  const after = await snapshots()
  assert.deepEqual(after.sheet, before.sheet, 'Activating a Float must not edit the Sheet')
  assert.deepEqual(after.base, before.base, 'Activating a Float must not edit the Base')
}
try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4330', {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  })
  await page.waitForFunction(
    () => {
      const r = document.querySelector('.grove-embed')
      return r?.dataset.ready || r?.dataset.error
    },
    null,
    { timeout: 60000 },
  )
  assert.equal(await root.getAttribute('data-error'), null)
  const embeds = await page.evaluate(() =>
    window.univerAPI.listEmbeds({ hostUnitId: 'grove-exhibition-readiness' }).map((e) => e.getDescriptor()),
  )
  assert.equal(embeds.length, 2)
  assert.deepEqual(embeds.map((e) => e.childUnitId).toSorted(), ['grove-budget-plan', 'grove-readiness-register'])
  assert.ok(embeds.every((e) => e.entry === 'boards-floating-object'))
  await values()
  await rendered('baseline')
  const original = await authored()
  assert.equal(Object.keys(original.elements).filter((id) => id.startsWith('sources-to-')).length, 3)
  for (const [i, code] of examples.entries()) {
    const before = await snapshots()
    await page.evaluate(code)
    let errors = []
    switch (i + 1) {
      case 1:
        model.budget[0] = 7000
        break
      case 2:
        model.cost[0] = 4400
        break
      case 3:
        model.status[5] = 'Ready'
        break
      case 4:
        model.ceiling = 0.75
        break
      case 5:
        model.status[3] = 'Ready'
        break
      case 6:
        model.cost[0] = null
        break
      case 7:
        model.cost[0] = 0
        break
      case 9:
        model = baseline()
        break
      case 11:
        model.cost[3] = 2600
        break
      case 13:
        model.budget[2] = 5500
        break
      case 14:
        errors = ['budget', 'balance', 'threshold', 'headroom', 'build-balance', 'programme-balance', 'care-balance']
        break
      case 16:
        errors = ids.filter((id) => !['budget', 'threshold'].includes(id))
        break
      case 18:
        model.zones[4] = model.zones[5] = 'Visitor support'
        break
      case 19:
        model.zones[4] = model.zones[5] = 'Care'
        break
    }
    await values(errors)
    // External mapping is deliberately edited in 14-17; other steps preserve authored formula definitions too.
    if (![14, 15, 16, 17].includes(i + 1)) assert.deepEqual(await authored(), original)
    const after = await snapshots()
    if ([1, 4].includes(i + 1)) assert.deepEqual(after.base, before.base)
    if ([2, 3, 5, 6, 7, 8, 10, 11, 12, 18, 19].includes(i + 1)) assert.deepEqual(after.sheet, before.sheet)
    if ([6, 7].includes(i + 1)) assert.equal(after.base.tables.gates.records['gate-1'].values.cost, i === 5 ? null : 0)
    await rendered('example-' + (i + 1))
    report.examples.push({
      example: i + 1,
      results: await results(),
      authoredPreserved: ![14, 15, 16, 17].includes(i + 1),
    })
  }
  await gate('native-sheet-input-history', async () => {
    await page.evaluate(examples[8])
    model = baseline()
    await values()
    await expand('sheet')
    await shell.locator('[data-u-comp="ribbon-grid-toolbar"]').waitFor()
    for (const name of ['Start', 'Insert', 'Formulas', 'Data', 'View']) {
      await shell.getByRole('tab', { name, exact: true }).click()
      assert.ok(await shell.locator('[data-u-comp="ribbon-grid-toolbar"] [data-u-command]').count())
    }
    await shell.getByRole('tab', { name: 'Start', exact: true }).click()
    const point = await page.evaluate(() => {
      const s = window.univerAPI.getWorkbook('grove-budget-plan').save().sheets.budget
      const b = document
        .querySelector('[data-embed-fullscreen-shell="true"] [data-embed-canvas-root="true"] canvas')
        .getBoundingClientRect()
      return {
        x: b.x + (s.rowHeader.width + s.columnData[0].w + s.columnData[1].w / 2) * s.zoomRatio,
        y:
          b.y +
          (s.columnHeader.height +
            [0, 1, 2, 3].reduce((a, i) => a + (s.rowData[i]?.h || s.defaultRowHeight), 0) +
            (s.rowData[4]?.h || s.defaultRowHeight) / 2) *
            s.zoomRatio,
      }
    })
    await page.mouse.click(point.x, point.y)
    await page.waitForFunction(
      () => window.univerAPI.getWorkbook('grove-budget-plan').getActiveRange()?.getA1Notation() === 'B5',
    )
    const before = await snapshots()
    await page.keyboard.type('7200')
    await page.keyboard.press('Enter')
    model.budget[0] = 7200
    await values()
    const after = await snapshots()
    assert.deepEqual(after.base, before.base)
    await page.keyboard.press('Control+z')
    model.budget[0] = 6000
    await values()
    assert.deepEqual((await snapshots()).sheet, before.sheet)
    await page.keyboard.press('Control+y')
    model.budget[0] = 7200
    await values()
    assert.deepEqual((await snapshots()).sheet, after.sheet)
    await page.screenshot({ path: path.join(directory, 'native-sheet.png') })
    await collapse()
    await rendered('native-sheet-return')
  })
  await gate('native-print', async () => {
    await expand('sheet')
    await page.evaluate(() =>
      window.univerAPI.addEvent(window.univerAPI.Event.SheetPrintOpen, ({ workbook, worksheet }) => {
        window.printSource = { workbook: workbook.getId(), sheet: worksheet.getSheetId() }
      }),
    )
    await shell.locator('[data-u-command="sheet.menu.print"]').click()
    await page.getByRole('menuitem', { name: 'Print', exact: true }).click()
    const cancel = page.getByRole('button', { name: 'CANCEL', exact: true })
    await cancel.waitFor()
    await page.getByText(/^Total: [1-9]\d*pages$/).waitFor()
    assert.deepEqual(await page.evaluate(() => window.printSource), { workbook: 'grove-budget-plan', sheet: 'budget' })
    await page.screenshot({ path: path.join(directory, 'native-print.png') })
    await cancel.click()
  })
  await gate('native-base-cost-history', async () => {
    await expand('base')
    await page.waitForFunction(() =>
      [...window.pointsNow.entries()].some(
        ([c, ps]) => c.isConnected && ps.some((p) => p.text === '3,200.00' || p.text === '3200.00'),
      ),
    )
    const point = await page.evaluate(() =>
      [...window.pointsNow.entries()]
        .filter(([c]) => c.isConnected)
        .flatMap(([, ps]) => ps)
        .findLast((p) => p.text === '3,200.00' || p.text === '3200.00'),
    )
    const before = await snapshots()
    await page.mouse.dblclick(point.x - 15, point.y - 4)
    await page.keyboard.press('Control+A')
    await page.keyboard.type('3500')
    await page.keyboard.press('Enter')
    model.cost[0] = 3500
    await values()
    const after = await snapshots()
    assert.deepEqual(after.sheet, before.sheet)
    for (const [name, snapshot, value] of [
      ['Undo', before, 3200],
      ['Redo', after, 3500],
    ]) {
      await shell.getByRole('button', { name, exact: true }).click()
      await settle()
      model.cost[0] = value
      await values()
      assert.deepEqual((await snapshots()).base, snapshot.base)
    }
    await page.screenshot({ path: path.join(directory, 'native-base.png') })
    await collapse()
    await rendered('native-base-return')
  })
  await gate('native-board-movement-connectors-history', async () => {
    await collapse()
    const point = await boardPoint()
    await page.mouse.click(point.x + 12, point.y - 4)
    const before = await snapshots()
    const previous = before.board.pages.readiness.elements['source-summary'].transform.left
    const routesBefore = await connectors()
    await page.keyboard.press('ArrowRight')
    await page.waitForFunction(
      (x) =>
        window.univerAPI.getBoard('grove-exhibition-readiness').save().pages.readiness.elements['source-summary']
          .transform.left > x,
      previous,
    )
    assert.notDeepEqual(await connectors(), routesBefore)
    const after = await snapshots()
    assert.deepEqual(after.sheet, before.sheet)
    assert.deepEqual(after.base, before.base)
    await page.keyboard.press('Control+z')
    await settle()
    assert.deepEqual((await snapshots()).board, before.board)
    await page.keyboard.press('Control+y')
    await settle()
    assert.deepEqual((await snapshots()).board, after.board)
    await rendered('native-board-moved')
  })
  for (const locale of ['enUS', 'zhCN'])
    await gate('native-board-text-' + locale, async () => {
      await page.evaluate((value) => window.univerAPI.setLocale(value), locale)
      await settle()
      const point = await boardPoint()
      await page.mouse.dblclick(point.x + 12, point.y - 4)
      await page.waitForFunction(
        () =>
          document.activeElement?.isContentEditable || ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName),
      )
      const before = await snapshots()
      await page.keyboard.press('Control+End')
      await page.keyboard.type(' Reviewed.', { delay: 35 })
      const viewport = root.locator('[data-board-viewport-host="true"]')
      await viewport.click({ position: { x: 20, y: 30 } })
      await page.waitForFunction(() =>
        window.univerAPI
          .getBoard('grove-exhibition-readiness')
          .getShape('source-summary')
          .getText()
          .getPlainText()
          .includes('Reviewed.'),
      )
      const after = await snapshots()
      assert.deepEqual(after.sheet, before.sheet)
      assert.deepEqual(after.base, before.base)
      await values()
      await connectors()
      await viewport.click({ position: { x: 20, y: 30 } })
      let steps = 0
      while (steps < 8 && JSON.stringify((await snapshots()).board) !== JSON.stringify(before.board)) {
        await page.keyboard.press('Control+z')
        await settle()
        steps++
      }
      assert.deepEqual((await snapshots()).board, before.board)
      for (let i = 0; i < steps; i++) {
        await page.keyboard.press('Control+y')
        await settle()
      }
      assert.deepEqual((await snapshots()).board, after.board)
      await rendered('native-board-text-' + locale)
    })
  await gate('locales-themes-preserve-three-owners', async () => {
    await collapse()
    const before = await snapshots()
    for (const locale of ['zhCN', 'enUS']) {
      await page.evaluate((l) => window.univerAPI.setLocale(l), locale)
      for (const dark of [true, false]) {
        await page.evaluate((d) => window.univerAPI.toggleDarkMode(d), dark)
        await settle()
        const after = await snapshots()
        assert.deepEqual(after.sheet, before.sheet)
        assert.deepEqual(after.base, before.base)
        assert.deepEqual(after.board.pages, before.board.pages)
      }
    }
    await rendered('final-light')
    const source = await fs.readFile('showcase/embed/mixed-to-boards/code/create-demo.ts', 'utf8')
    const en = [...source.matchAll(/^import (\w+)EnUS from '([^']+)en-US'/gm)]
    assert.equal(en.length, 23)
    for (const [, n, p] of en)
      assert.ok(
        source.includes('import ' + n + 'ZhCN from ' + String.fromCharCode(39) + p + 'zh-CN' + String.fromCharCode(39)),
      )
  })
  await gate('active-base-disposal', async () => {
    await expand('base')
    await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
    await root.waitFor({ state: 'detached' })
    await settle()
    assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
    assert.equal(await shell.count(), 0)
  })
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.warnings, [])
  assert.deepEqual(report.backendRequests, [])
  assert.deepEqual(report.issues, [])
  assert.ok(Object.values(report.gates).every((g) => g.passed))
  report.passed = true
} catch (e) {
  report.failure = e.stack
  report.current = await results().catch(() => null)
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(
    JSON.stringify(
      {
        passed: report.passed,
        examples: report.examples.length,
        gates: report.gates,
        errors: report.errors,
        warnings: report.warnings,
        issues: report.issues.length,
        failure: report.failure,
      },
      null,
      2,
    ),
  )
  await browser.close()
}
if (!report.passed) process.exitCode = 1
