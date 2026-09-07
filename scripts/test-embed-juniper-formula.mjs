/* eslint-disable no-await-in-loop -- Exercise published snippets in order against one native owner. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-juniper-formula')
await fs.mkdir(directory, { recursive: true })
const examples = [
  ...(await fs.readFile('showcase/embed/boards-in-sheets-formula-tab/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((m) => m[1])
assert.equal(examples.length, 22)
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
  'volume',
  'unit',
  'fixed',
  'breakeven',
  ...Array.from({ length: 3 }, (_, i) => ['quantity-' + i, 'gross-' + i, 'net-' + i]).flat(),
  'spread',
  'signal',
]
const root = page.locator('.juniper-embed')
const tab = (name) => page.getByText(name, { exact: true })
const run = (code) => page.evaluate('(() => {\n' + code + '\n})()')
const settle = () =>
  page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
const source = () =>
  page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getWorkbook('juniper-workshop-model').save())))
const board = () =>
  page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getBoard('juniper-sensitivity-workshop').save())))
const results = () =>
  page.evaluate(
    (shapes) =>
      shapes.map((id) => window.univerAPI.getBoard('juniper-sensitivity-workshop').getShape(id).getFormulaResult()),
    ids,
  )
const authored = async () => {
  const data = await board()
  for (const p of Object.values(data.pages))
    for (const e of Object.values(p.elements))
      if (e.shapeData?.formulaBinding) delete e.shapeData.formulaBinding.lastValue
  return { pages: data.pages, pageOrder: data.pageOrder, size: data.defaultPageSize, name: data.name }
}
function expected(v = 150, u = 18, f = 1800, m = [0.8, 1, 1.2]) {
  const invalid = typeof u === 'string',
    unit = Number(u)
  return [
    v,
    u,
    f,
    invalid ? '#VALUE!' : unit ? f / unit : '#DIV/0!',
    ...m.flatMap((k) => [v * k, invalid ? '#VALUE!' : v * k * unit, invalid ? '#VALUE!' : v * k * unit - f]),
    invalid ? '#VALUE!' : v * (m[2] - m[0]) * unit,
    invalid ? '#VALUE!' : v * m[1] * unit >= f ? 'Base case covers fixed cost' : 'Revisit contribution or scope',
  ]
}
const baseline = expected()
const states = [
  expected(150, 20),
  expected(150, 20, 2400),
  expected(180, 20, 2400),
  expected(180, 20, 2400, [0.8, 1, 1.4]),
  expected(180, 20, 2400, [0.6, 1, 1.4]),
  expected(180, 20, 2400, [0.6, 0.9, 1.4]),
  expected(0, 20, 2400, [0.6, 0.9, 1.4]),
  expected(0, 0, 2400, [0.6, 0.9, 1.4]),
  baseline,
  expected(150, null),
  expected(150, 0),
  expected(150, 'pending'),
  baseline,
  baseline,
  expected(175),
  null,
  expected(175),
  expected(175, 18, 1800, [0.8, 1, 2]),
]
async function values(wanted) {
  await page.waitForFunction(
    ({ ids: shapes, targets }) =>
      shapes.every((id, i) => {
        const r = window.univerAPI.getBoard('juniper-sensitivity-workshop').getShape(id).getFormulaResult()
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
  await tab('Sensitivity workshop').click()
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
  console.log('Juniper ' + name + ' ' + (report.gates[name].passed ? 'PASS' : 'FAIL'))
}
async function connectors() {
  const layout = await page.evaluate(() =>
    window.univerAPI.executeCommand('board-ui.command.analyze-rendered-layout', {
      unitId: 'juniper-sensitivity-workshop',
      subUnitId: 'scenarios',
    }),
  )
  assert.equal(layout.source, 'rendered')
  assert.equal(layout.routes.length, 3)
  const elements = (await board()).pages.scenarios.elements
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
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4346')
  await page.waitForSelector('.juniper-embed[data-ready="true"]', { timeout: 60000 })
  assert.equal(await root.locator('fieldset,[data-action],iframe').count(), 0)
  assert.equal(await root.locator('[data-u-comp="ribbon-grid-toolbar"]').count(), 1)
  report.descriptor = await page.evaluate(() =>
    window.univerAPI
      .getEmbed({ hostUnitId: 'juniper-workshop-model', embedId: 'juniper-workshop-tab' })
      .getDescriptor(),
  )
  assert.equal(report.descriptor.entry, 'sheets-sheet-tab')
  assert.equal(report.descriptor.childUnitId, 'juniper-sensitivity-workshop')
  await values(baseline)
  await tab('Assumptions').click()
  await page.screenshot({ path: path.join(directory, 'source.png') })
  await activate()
  await painted('baseline')
  const original = await authored()
  await gate('native-bound-connectors', async () => {
    report.routes = await connectors()
  })
  for (const [i, wanted] of states.entries()) {
    if (i % 2) await activate()
    else await tab('Assumptions').click()
    await run(examples[i])
    const actual = await values(wanted)
    assert.deepEqual(await authored(), original)
    if (i === 9) assert.ok((await source()).sheets.assumptions.cellData[5][1].v == null)
    if (i === 10) assert.equal((await source()).sheets.assumptions.cellData[5][1].v, 0)
    await activate()
    await painted('example-' + (i + 1))
    report.checks.push({
      example: i + 1,
      active: i % 2 ? 'board' : 'sheet',
      values: actual.map((r) => r.value),
      authoredPreserved: true,
      currentCanvas: true,
    })
    console.log('Juniper example ' + (i + 1) + ' PASS')
  }
  await gate('native-sheet-input-history', async () => {
    // Select the real source tab before locating its native Sheet canvas.
    await tab('Assumptions').click()
    await settle()
    const point = await page.evaluate(() => {
      const s = window.univerAPI.getWorkbook('juniper-workshop-model').save().sheets.assumptions
      const c = [...document.querySelectorAll('.juniper-embed canvas')].find(
        (candidate) => candidate.width > 1400 && candidate.height > 500 && !candidate.closest('[data-embed-id]'),
      )
      const r = c.getBoundingClientRect(),
        h = (i) => s.rowData?.[i]?.h || s.defaultRowHeight
      return {
        x: r.x + (s.rowHeader.width + s.columnData[0].w + s.columnData[1].w / 2) * s.zoomRatio,
        y:
          r.y +
          (s.columnHeader.height + Array.from({ length: 5 }, (_, i) => h(i)).reduce((a, b) => a + b, 0) + h(5) / 2) *
            s.zoomRatio,
      }
    })
    await page.mouse.click(point.x, point.y)
    await page.waitForFunction(
      () => window.univerAPI.getWorkbook('juniper-workshop-model').getActiveRange()?.getA1Notation() === 'B6',
    )
    const before = await source()
    await page.keyboard.type('22')
    await page.keyboard.press('Enter')
    await values(expected(175, 22, 1800, [0.8, 1, 2]))
    const after = await source()
    await page.keyboard.press('Control+z')
    await values(expected(175, 18, 1800, [0.8, 1, 2]))
    assert.deepEqual(await source(), before)
    await page.keyboard.press('Control+y')
    await values(expected(175, 22, 1800, [0.8, 1, 2]))
    assert.deepEqual(await source(), after)
    assert.deepEqual(await authored(), original)
    await activate()
    await painted('native-source')
  })
  await gate('literal-print', async () => {
    await tab('Assumptions').click()
    await page.evaluate(() => {
      window.univerAPI.addEvent(window.univerAPI.Event.SheetPrintOpen, ({ workbook, worksheet }) => {
        window.printOwner = { workbook: workbook.getId(), sheet: worksheet.getSheetId() }
      })
    })
    await run(examples[19])
    await page.getByRole('button', { name: 'CANCEL', exact: true }).waitFor()
    await page.waitForFunction(() => window.printOwner?.sheet === 'assumptions', null, { timeout: 45000 })
    await page
      .getByRole('status', { name: 'Printing, please do not close the page', exact: true })
      .waitFor({ state: 'detached', timeout: 45000 })
    await page.getByText(/^Total: [1-9]\d*pages$/).waitFor()
    // Dialog readiness is not proof that the paper has painted its source cells.
    await page.waitForFunction(
      () =>
        [...window.docFrames.entries()].some(([canvas, glyphs]) => {
          // The native Print portal remains inside the demo root. Match its A4 paper,
          // not the large editor canvas underneath the dialog (DPR is 1 in this test).
          if (!canvas.isConnected || canvas.id || canvas.width !== 794 || canvas.height !== 1124) return false
          const text = glyphs.join('').replace(/\s/g, '')
          return (
            text.includes('JUNIPER') &&
            text.includes('Referencevolume') &&
            text.includes('175') &&
            text.includes('22.00')
          )
        }),
      null,
      { timeout: 30000 },
    )
    assert.deepEqual(await page.evaluate(() => window.printOwner), {
      workbook: 'juniper-workshop-model',
      sheet: 'assumptions',
    })
    await page.screenshot({ path: path.join(directory, 'native-print.png') })
    await run(examples[20])
    await page.getByRole('button', { name: 'CANCEL', exact: true }).waitFor({ state: 'detached' })
    report.checks.push({ examples: [20, 21], sourceOwned: true, paperPaintedCurrentInputs: true })
  })
  await gate('native-board-text-history', async () => {
    // Isolate this gate from any earlier Print failure without accepting that failure.
    await run(examples[20])
    await page.getByRole('button', { name: 'CANCEL', exact: true }).waitFor({ state: 'detached' })
    await activate()
    const beforeSource = await source(),
      before = await board()
    await run(examples[18])
    await page.waitForFunction(
      () =>
        window.univerAPI
          .getBoard('juniper-sensitivity-workshop')
          .getShape('scenario-note-1')
          .getText()
          .getPlainText() === 'Reviewed / Keep the contribution assumption explicit.',
    )
    const after = await board()
    assert.deepEqual(await source(), beforeSource)
    await page.evaluate(() => {
      window.univerAPI.getBoard('juniper-sensitivity-workshop').undo()
    })
    await settle()
    assert.deepEqual(await board(), before)
    await page.evaluate(() => {
      window.univerAPI.getBoard('juniper-sensitivity-workshop').redo()
    })
    await settle()
    assert.deepEqual(await board(), after)
    assert.deepEqual(await source(), beforeSource)
    await painted('edited-board')
  })
  await run(examples[21])
  report.checks.push({ examples: [19, 22] })
  await gate('complete-locales-and-themes', async () => {
    const factory = await fs.readFile('showcase/embed/boards-in-sheets-formula-tab/code/create-demo.ts', 'utf8')
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
  await gate('active-board-tab-update-and-disposal', async () => {
    await activate()
    const before = await authored()
    await run(examples[8])
    await values(baseline)
    await painted('active-tab-source-update')
    assert.deepEqual(await authored(), before)
    await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
    await root.waitFor({ state: 'detached' })
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
