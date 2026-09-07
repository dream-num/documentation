/* eslint-disable no-await-in-loop -- Exercise published snippets in order against one native owner. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-delta-formula')
await fs.mkdir(directory, { recursive: true })
const examples = [
  ...(await fs.readFile('showcase/embed/boards-in-sheets-formula-float/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((m) => m[1])
assert.equal(examples.length, 21)
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1100 } })
page.setDefaultTimeout(12000)
const report = { passed: false, checks: [], gates: {}, knownIssues: [], errors: [], warnings: [], backendRequests: [] }
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
  const fill = CanvasRenderingContext2D.prototype.fillText,
    clear = CanvasRenderingContext2D.prototype.clearRect
  const drawImage = CanvasRenderingContext2D.prototype.drawImage
  // The native document renderer caches text on offscreen canvases before composition.
  CanvasRenderingContext2D.prototype.drawImage = function (source, ...args) {
    const texts = window.docFrames.get(this.canvas) || []
    // Preserve repeated letters. A self-copy must not concatenate its own log;
    // retain only recent paint records when cache composition repeats a frame.
    if (source !== this.canvas) {
      window.docFrames.set(this.canvas, texts.concat(window.docFrames.get(source) || []).slice(-50000))
    }
    return Reflect.apply(drawImage, this, [source, ...args])
  }
  CanvasRenderingContext2D.prototype.clearRect = function (...args) {
    window.docFrames.set(this.canvas, [])
    return Reflect.apply(clear, this, args)
  }
  CanvasRenderingContext2D.prototype.fillText = function (...args) {
    const frame = window.docFrames.get(this.canvas) || []
    frame.push(String(args[0]))
    if (frame.length > 50000) frame.splice(0, frame.length - 50000)
    window.docFrames.set(this.canvas, frame)
    return Reflect.apply(fill, this, args)
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
const shell = page.locator('[data-embed-fullscreen-shell="true"]')
const run = (code) => page.evaluate('(() => {\n' + code + '\n})()')
const settle = () =>
  page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
const source = () =>
  page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getWorkbook('delta-studio-capacity').save())))
const board = () =>
  page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getBoard('delta-allocation-map').save())))
const results = () =>
  page.evaluate(
    (shapes) => shapes.map((id) => window.univerAPI.getBoard('delta-allocation-map').getShape(id).getFormulaResult()),
    ids,
  )
const authored = async () => {
  const data = await board()
  for (const p of Object.values(data.pages))
    for (const e of Object.values(p.elements))
      if (e.shapeData?.formulaBinding) delete e.shapeData.formulaBinding.lastValue
  return { pages: data.pages, pageOrder: data.pageOrder, size: data.defaultPageSize, name: data.name }
}
function expected(cap = [120, 200, 160], load = [110, 210, 105]) {
  const total = load.reduce((a, v) => a + (typeof v === 'number' ? v : 0), 0),
    capacity = cap.reduce((a, v) => a + v, 0)
  const over = load.filter((v, i) => typeof v === 'string' || Number(v) > cap[i]).length
  const peak = load.some((v) => typeof v === 'string')
    ? '#VALUE!'
    : cap.some((v) => v === 0)
      ? '#DIV/0!'
      : Math.max(...load.map((v, i) => Number(v) / cap[i]))
  return [
    capacity,
    total,
    capacity - total,
    capacity ? total / capacity : '#DIV/0!',
    ...load.flatMap((v, i) => [v, typeof v === 'string' ? '#VALUE!' : cap[i] - Number(v)]),
    over,
    peak,
    over ? 'Rebalance before adding scope' : 'Review the remaining buffer',
  ]
}
const baseline = expected()
const states = [
  expected(undefined, [110, 210, 130]),
  expected(undefined, [110, 190, 130]),
  expected([120, 170, 160], [110, 190, 130]),
  expected([120, 170, 160], [150, 190, 130]),
  expected([160, 170, 160], [150, 190, 130]),
  expected([160, 170, 160], [150, null, 130]),
  expected([160, 170, 160], [150, 0, 130]),
  baseline,
  expected([120, 0, 160]),
  expected([0, 0, 0]),
  baseline,
  expected(undefined, [110, 'pending', 105]),
  baseline,
  baseline,
  baseline,
  expected(undefined, [110, 210, 130]),
  null,
  expected(undefined, [110, 210, 130]),
]
async function values(wanted) {
  await page.waitForFunction(
    ({ ids: shapes, targets }) =>
      shapes.every((id, i) => {
        const r = window.univerAPI.getBoard('delta-allocation-map').getShape(id).getFormulaResult()
        return (
          r &&
          !r.stale &&
          (targets === null
            ? typeof r.value === 'string' && r.value.startsWith('#')
            : typeof targets[i] === 'number'
              ? typeof r.value === 'number' && Math.abs(r.value - targets[i]) < 1e-8
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
      report.knownIssues.push({ gate: 'native-error-status', id: ids[i], expected: status, actual: r })
  }
  return actual
}
async function painted(name) {
  const actual = await results()
  await page.waitForFunction(
    (texts) =>
      [...window.docFrames.entries()].some(([canvas, glyphs]) => {
        const b = canvas.getBoundingClientRect(),
          text = glyphs.join('')
        return (
          canvas.isConnected &&
          b.width > 600 &&
          b.height > 300 &&
          canvas.closest('[data-board-viewport-host="true"]') &&
          texts.every((s) => text.includes(s))
        )
      }),
    actual.map((r) => r.displayText),
    { timeout: 15000 },
  )
  await page.screenshot({ path: path.join(directory, name + '.png') })
}
async function activate() {
  await float.dblclick({ position: { x: 100, y: 40 } })
  await settle()
}
async function fullscreen() {
  await activate()
  await page
    .locator('[data-u-comp="embed-float-dom-chrome"][data-embed-id="delta-board-float"]')
    .getByRole('button', { name: 'Enter fullscreen', exact: true })
    .click()
  await shell.waitFor()
  await settle()
}
async function gate(name, fn) {
  try {
    await fn()
    report.gates[name] = { passed: true }
  } catch (e) {
    report.gates[name] = { passed: false, failure: e.stack }
    await page.screenshot({ path: path.join(directory, name + '-failure.png') }).catch(() => {})
  }
  console.log('Delta ' + name + ' ' + (report.gates[name].passed ? 'PASS' : 'FAIL'))
}
async function connectors() {
  const layout = await page.evaluate(() =>
    window.univerAPI.executeCommand('board-ui.command.analyze-rendered-layout', {
      unitId: 'delta-allocation-map',
      subUnitId: 'capacity',
    }),
  )
  assert.equal(layout.source, 'rendered')
  assert.equal(layout.routes.length, 3)
  const elements = (await board()).pages.capacity.elements
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
function includesPack(actual, pack) {
  for (const [key, value] of Object.entries(pack))
    if (value && typeof value === 'object') includesPack(actual?.[key], value)
    else assert.equal(actual?.[key], value, key)
}
try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4344')
  await page.waitForSelector('.delta-embed[data-ready="true"]', { timeout: 60000 })
  assert.equal(await root.locator('fieldset,[data-action],iframe').count(), 0)
  assert.equal(await root.locator('[data-u-comp="ribbon-grid-toolbar"]').count(), 1)
  report.descriptor = await page.evaluate(() =>
    window.univerAPI.getEmbed({ hostUnitId: 'delta-studio-capacity', embedId: 'delta-board-float' }).getDescriptor(),
  )
  assert.equal(report.descriptor.entry, 'sheets-floating-object')
  assert.equal(report.descriptor.childUnitId, 'delta-allocation-map')
  await values(baseline)
  await painted('baseline')
  const original = await authored()
  await gate('native-bound-connectors', async () => {
    report.routes = await connectors()
  })
  for (const [i, wanted] of states.entries()) {
    if (i % 2) await activate()
    else await page.mouse.click(180, 318)
    await run(examples[i])
    const actual = await values(wanted)
    assert.deepEqual(await authored(), original)
    if (i === 5) assert.ok((await source()).sheets.allocation.cellData[5][2].v == null)
    if (i === 6) assert.equal((await source()).sheets.allocation.cellData[5][2].v, 0)
    await painted('example-' + (i + 1))
    report.checks.push({
      example: i + 1,
      active: i % 2 ? 'board' : 'sheet',
      values: actual.map((r) => r.value),
      authoredPreserved: true,
      currentCanvas: true,
    })
    console.log('Delta example ' + (i + 1) + ' PASS')
  }
  await gate('native-sheet-input-history', async () => {
    // Leave the active Board editor before locating the host canvas.
    await page.mouse.click(180, 318)
    await settle()
    const point = await page.evaluate(() => {
      const s = window.univerAPI.getWorkbook('delta-studio-capacity').save().sheets.allocation
      const c = [...document.querySelectorAll('.delta-embed canvas')].find(
        (candidate) => candidate.width > 1400 && candidate.height > 500 && !candidate.closest('[data-embed-id]'),
      )
      const r = c.getBoundingClientRect(),
        h = (i) => s.rowData?.[i]?.h || s.defaultRowHeight
      return {
        x: r.x + (s.rowHeader.width + s.columnData[0].w + s.columnData[1].w + s.columnData[2].w / 2) * s.zoomRatio,
        y:
          r.y +
          (s.columnHeader.height + Array.from({ length: 5 }, (_, i) => h(i)).reduce((a, b) => a + b, 0) + h(5) / 2) *
            s.zoomRatio,
      }
    })
    await page.mouse.click(point.x, point.y)
    await page.waitForFunction(
      () => window.univerAPI.getWorkbook('delta-studio-capacity').getActiveRange()?.getA1Notation() === 'C6',
    )
    const before = await source()
    await page.keyboard.type('230')
    await page.keyboard.press('Enter')
    await values(expected(undefined, [110, 230, 130]))
    const after = await source()
    await page.keyboard.press('Control+z')
    await values(expected(undefined, [110, 210, 130]))
    assert.deepEqual(await source(), before)
    await page.keyboard.press('Control+y')
    await values(expected(undefined, [110, 230, 130]))
    assert.deepEqual(await source(), after)
    assert.deepEqual(await authored(), original)
    await painted('native-source')
  })
  await gate('literal-print', async () => {
    await page.mouse.click(180, 318)
    await page.evaluate(() => {
      window.univerAPI.addEvent(window.univerAPI.Event.SheetPrintOpen, ({ workbook, worksheet }) => {
        window.printOwner = { workbook: workbook.getId(), sheet: worksheet.getSheetId() }
      })
    })
    await run(examples[18])
    await page.getByRole('button', { name: 'CANCEL', exact: true }).waitFor()
    await page.getByText(/^Total: [1-9]\d*pages$/).waitFor()
    assert.deepEqual(await page.evaluate(() => window.printOwner), {
      workbook: 'delta-studio-capacity',
      sheet: 'allocation',
    })
    await page.screenshot({ path: path.join(directory, 'native-print.png') })
    await run(examples[19])
    await page.getByRole('button', { name: 'CANCEL', exact: true }).waitFor({ state: 'detached' })
    report.checks.push({ examples: [19, 20], sourceOwned: true })
  })
  await gate('native-board-text-history', async () => {
    await activate()
    const beforeSource = await source(),
      before = await board()
    await page.evaluate(() => {
      window.univerAPI
        .getBoard('delta-allocation-map')
        .getShape('team-note-0')
        .getText()
        .setText('Review handoff / Confirm the scope.')
    })
    await page.waitForFunction(
      () =>
        window.univerAPI.getBoard('delta-allocation-map').getShape('team-note-0').getText().getPlainText() ===
        'Review handoff / Confirm the scope.',
    )
    const after = await board()
    assert.deepEqual(await source(), beforeSource)
    await page.evaluate(() => {
      window.univerAPI.getBoard('delta-allocation-map').undo()
    })
    await settle()
    assert.deepEqual(await board(), before)
    await page.evaluate(() => {
      window.univerAPI.getBoard('delta-allocation-map').redo()
    })
    await settle()
    assert.deepEqual(await board(), after)
    assert.deepEqual(await source(), beforeSource)
    await painted('edited-board')
  })
  await run(examples[20])
  report.checks.push({ example: 21 })
  await gate('complete-locales-and-themes', async () => {
    const factory = await fs.readFile('showcase/embed/boards-in-sheets-formula-float/code/create-demo.ts', 'utf8')
    const packs = [...factory.matchAll(/^import \w+EnUS from '([^']+)en-US'/gm)]
    assert.equal(packs.length, 15)
    for (const [locale, code] of [
      ['en-US', 'enUS'],
      ['zh-CN', 'zhCN'],
    ]) {
      await page.evaluate((v) => window.univerAPI.setLocale(v), code)
      for (const [, prefix] of packs)
        includesPack(await page.evaluate(() => window.univerAPI.getLocales()), (await import(prefix + locale)).default)
      const beforeSource = await source(),
        before = await board()
      for (const dark of [true, false]) {
        await page.evaluate((v) => window.univerAPI.toggleDarkMode(v), dark)
        await settle()
      }
      assert.deepEqual(await source(), beforeSource)
      assert.deepEqual(await board(), before)
      assert.equal(
        /(?:shape-editor-ui|embed-unit-ui|boards-ui)\.[\w.]+/.test(await page.locator('body').innerText()),
        false,
      )
      await painted(locale + '-native')
      report.checks.push({ locale, completePacks: 15, modelsPreserved: true })
    }
    await page.evaluate(() => window.univerAPI.setLocale('enUS'))
  })
  await gate('fullscreen-source-update-and-disposal', async () => {
    await fullscreen()
    const before = await authored()
    await run(examples[7])
    await values(baseline)
    await painted('fullscreen-source-update')
    assert.deepEqual(await authored(), before)
    await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
    await root.waitFor({ state: 'detached' })
    await shell.waitFor({ state: 'detached' })
    await settle()
    assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
  })
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.warnings, [])
  assert.deepEqual(report.backendRequests, [])
  report.passed = report.knownIssues.length === 0 && Object.values(report.gates).every((g) => g.passed)
} catch (e) {
  report.failure = e.stack
  report.currentResults = await results().catch(() => [])
  report.frames = await page
    .evaluate(() =>
      [...window.docFrames.entries()]
        .filter(([c]) => c.isConnected)
        .map(([c, a]) => ({ width: c.width, height: c.height, text: a.join('') })),
    )
    .catch(() => [])
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(
    JSON.stringify(
      {
        passed: report.passed,
        checks: report.checks.length,
        gates: report.gates,
        issues: report.knownIssues.length,
        errors: report.errors,
        warnings: report.warnings,
        failure: report.failure,
      },
      null,
      2,
    ),
  )
  await browser.close()
}
if (!report.passed) process.exitCode = 1
