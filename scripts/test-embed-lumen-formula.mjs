/* eslint-disable no-await-in-loop -- Follow the exact documented editing sequence. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-lumen-formula')
await fs.mkdir(directory, { recursive: true })
const examples = [
  ...(await fs.readFile('showcase/embed/sheet-to-slides-float/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((m) => m[1])
assert.equal(examples.length, 10)
const specs = [
  ['pricing', 'revenue'],
  ['pricing', 'units'],
  ['economics', 'variable'],
  ['economics', 'fixed'],
  ['economics', 'contribution'],
  ['economics', 'margin'],
  ['decision', 'breakeven'],
  ['decision', 'headroom'],
  ['decision', 'revenue-repeat'],
]
const baseline = [10800, 240, 4320, 3600, 2880, 2880 / 10800, 134, 106, 10800]
const scenarios = [
  [11520, 240, 4320, 3600, 3600, 0.3125, 120, 120, 11520],
  [11520, 240, 4800, 3600, 3120, 3120 / 11520, 129, 111, 11520],
  [11520, 240, 4800, 4200, 2520, 0.21875, 150, 90, 11520],
  [8640, 180, 3600, 4200, 840, 840 / 8640, 150, 30, 8640],
  [0, 0, 0, 4200, -4200, '#DIV/0!', 150, -150, 0],
  [0, null, 0, 4200, -4200, '#DIV/0!', 150, -150, 0],
  ['#VALUE!', 'pending', '#VALUE!', 4200, '#VALUE!', '#VALUE!', 150, '#VALUE!', '#VALUE!'],
  baseline,
  [4320, 240, 4320, 3600, -3600, -3600 / 4320, '#DIV/0!', '#DIV/0!', 4320],
  baseline,
]
const report = { passed: false, checks: [], knownIssues: [], errors: [], backendRequests: [] }
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1700, height: 1100 } })
page.setDefaultTimeout(15000)
page.on('pageerror', (e) => report.errors.push(e.stack || e.message))
page.on('console', (m) => {
  if (m.type() === 'error') report.errors.push(m.text())
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
  const fill = CanvasRenderingContext2D.prototype.fillText,
    clear = CanvasRenderingContext2D.prototype.clearRect,
    draw = CanvasRenderingContext2D.prototype.drawImage
  CanvasRenderingContext2D.prototype.clearRect = function (...args) {
    window.framesPaint.set(this.canvas, [])
    return Reflect.apply(clear, this, args)
  }
  CanvasRenderingContext2D.prototype.fillText = function (...args) {
    const a = window.framesPaint.get(this.canvas) || []
    a.push(String(args[0]))
    window.framesPaint.set(this.canvas, a)
    return Reflect.apply(fill, this, args)
  }
  CanvasRenderingContext2D.prototype.drawImage = function (source, ...args) {
    const a = window.framesPaint.get(this.canvas) || []
    a.push(...(window.framesPaint.get(source) || []))
    window.framesPaint.set(this.canvas, a)
    return Reflect.apply(draw, this, [source, ...args])
  }
})
const root = page.locator('.lumen-launch-embed')
const shell = page.locator('[data-embed-fullscreen-shell=true]')
const settle = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
const results = () =>
  page.evaluate(
    (entries) =>
      entries.map(([p, id]) =>
        window.univerAPI.getPresentation('lumen-launch-deck').getSlideById(p).getShape(id).getFormulaResult(),
      ),
    specs,
  )
const source = () =>
  page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getWorkbook('lumen-pricing-model').save())))
const authored = () =>
  page.evaluate((entries) => {
    const data = window.univerAPI.getPresentation('lumen-launch-deck').save()
    return data.slideOrder.map((p) => {
      const slide = data.slides[p]
      return {
        id: p,
        name: slide.name,
        background: slide.background,
        speakerNotes: slide.speakerNotes,
        order: slide.elementOrder,
        elements: Object.entries(slide.elements).map(([id, e]) =>
          entries.some(([pageId, shapeId]) => pageId === p && shapeId === id) ? { id, transform: e.transform } : e,
        ),
      }
    })
  }, specs)
async function values(expected) {
  await page.waitForFunction(
    ({ entries, wanted }) =>
      entries.every(([p, id], i) => {
        const r = window.univerAPI.getPresentation('lumen-launch-deck').getSlideById(p).getShape(id).getFormulaResult()
        return (
          r &&
          !r.stale &&
          (typeof wanted[i] === 'number'
            ? typeof r.value === 'number' && Math.abs(r.value - wanted[i]) < 1e-9
            : r.value === wanted[i])
        )
      }),
    { entries: specs, wanted: expected },
    { timeout: 30000 },
  )
  const actual = await results()
  for (const [i, r] of actual.entries())
    assert.equal(
      r.status,
      typeof expected[i] === 'string' && expected[i].startsWith('#') ? 'error' : 'success',
      specs[i].join('/'),
    )
}
async function show(p, name) {
  await root.locator('[data-u-comp="slide-thumbnail-item"][data-page-id="' + p + '"]').click()
  await settle()
  const actual = await results()
  const texts = specs.flatMap(([pageId], i) => (pageId === p ? [actual[i].displayText] : []))
  await page.waitForFunction(
    (wanted) =>
      [...window.framesPaint.entries()].some(
        ([c, a]) =>
          c.isConnected &&
          c.width > 700 &&
          !c.closest('[data-embed-id]') &&
          wanted.every((s) => a.join('').includes(s)),
      ),
    texts,
  )
  await page.screenshot({ path: path.join(directory, name + '.png') })
}
async function expand() {
  if (await shell.count()) return
  await show('pricing', 'before-fullscreen')
  await root
    .locator('[data-u-comp="embed-float-dom"][data-embed-id="lumen-launch-sheet-float"]')
    .dblclick({ position: { x: 150, y: 95 } })
  await page
    .locator('[data-u-comp="embed-float-dom-chrome"][data-embed-id="lumen-launch-sheet-float"]')
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
async function gate(name, fn) {
  try {
    await fn()
    report.checks.push({ gate: name, passed: true })
  } catch (e) {
    report.knownIssues.push({ gate: name, error: e.stack })
    await page.screenshot({ path: path.join(directory, name + '-failure.png') })
    if (await shell.count()) await collapse().catch(() => {})
  }
}
try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4292', {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  })
  await page.waitForFunction(
    () => {
      const r = document.querySelector('.lumen-launch-embed')
      return r?.dataset.ready || r?.dataset.error
    },
    null,
    { timeout: 60000 },
  )
  assert.equal(await root.getAttribute('data-error'), null)
  assert.equal(await root.locator('fieldset,[data-action],iframe').count(), 0)
  assert.equal(
    await root
      .locator('[data-u-comp="workbench-layout"]')
      .first()
      .evaluate((e) => getComputedStyle(e).backgroundColor),
    'rgb(255, 255, 255)',
  )
  await values(baseline)
  const original = await authored()
  report.descriptors = await page.evaluate(() =>
    window.univerAPI.listEmbeds({ hostUnitId: 'lumen-launch-deck' }).map((e) => e.getDescriptor()),
  )
  assert.equal(report.descriptors.length, 1)
  assert.equal(report.descriptors[0].entry, 'slides-floating-object')
  for (const p of ['pricing', 'economics', 'decision']) await show(p, 'baseline-' + p)
  await gate('inactive-source-render', async () => {
    await show('pricing', 'source-preview')
    await page.waitForFunction(() =>
      [...window.framesPaint.entries()].some(
        ([c, a]) =>
          c.isConnected &&
          c.closest('[data-embed-id="lumen-launch-sheet-float"]') &&
          a.join('').includes('First light collection'),
      ),
    )
  })
  await gate('off-page-source-write', async () => {
    await show('decision', 'off-page-before')
    await page.evaluate(examples[0])
    await values(scenarios[0])
  })
  await show('pricing', 'return-to-source')
  await page.evaluate(examples[9])
  await values(baseline)
  for (const [i, expected] of scenarios.entries()) {
    await show('pricing', 'before-example-' + (i + 1))
    await page.evaluate(examples[i])
    await values(expected)
    assert.deepEqual(await authored(), original)
    const qty = (await source()).sheets.pricing.cellData[4][1]
    if (i === 4) assert.equal(qty.v, 0)
    if (i === 5) assert.ok(qty.v == null)
    if (i === 6) assert.equal(qty.v, 'pending')
    for (const p of ['pricing', 'economics', 'decision']) await show(p, 'example-' + (i + 1) + '-' + p)
    report.checks.push({ example: i + 1, expected, results: await results(), authoredPreserved: true })
  }
  await gate('inline-source-keyboard-values', async () => {
    await show('pricing', 'before-inline-edit')
    const block = root.locator('[data-u-comp="embed-float-dom"][data-embed-id="lumen-launch-sheet-float"]')
    await block.dblclick({ position: { x: 150, y: 95 } })
    await page.waitForFunction(
      () =>
        document
          .querySelector('[data-u-comp="embed-float-dom"][data-embed-id="lumen-launch-sheet-float"]')
          ?.getAttribute('data-embed-float-stage') === 'stage2',
    )
    const point = await page.evaluate(() => {
      const s = window.univerAPI.getWorkbook('lumen-pricing-model').save().sheets.pricing
      const canvas = [
        ...document.querySelectorAll(
          '[data-u-comp="embed-float-dom"][data-embed-id="lumen-launch-sheet-float"] canvas',
        ),
      ].find((c) => c.width > 100)
      const b = canvas.getBoundingClientRect()
      const h = (i) => s.rowData[i]?.h || s.defaultRowHeight
      return {
        x: b.x + (s.rowHeader.width + s.columnData[0].w + s.columnData[1].w / 2) * s.zoomRatio,
        y: b.y + (s.columnHeader.height + [0, 1, 2, 3, 4].reduce((a, i) => a + h(i), 0) + h(5) / 2) * s.zoomRatio,
      }
    })
    await page.mouse.click(point.x, point.y)
    await page.waitForFunction(
      () => window.univerAPI.getWorkbook('lumen-pricing-model').getActiveRange()?.getA1Notation() === 'B6',
    )
    const before = await source()
    await page.keyboard.type('48')
    await page.keyboard.press('Enter')
    await values(scenarios[0])
    const edited = await source()
    await page.keyboard.press('Control+z')
    await values(baseline)
    await gate('inline-undo-exact-snapshot', async () => assert.deepEqual(await source(), before))
    await page.keyboard.press('Control+y')
    await values(scenarios[0])
    await gate('inline-redo-exact-snapshot', async () => assert.deepEqual(await source(), edited))
    await page.keyboard.press('Control+z')
    await values(baseline)
    assert.deepEqual(await authored(), original)
    await page.screenshot({ path: path.join(directory, 'inline-source-edit.png') })
  })
  await gate('native-source-keyboard-history', async () => {
    await expand()
    for (const name of ['Start', 'Insert', 'Formulas', 'Data', 'View']) {
      await shell.getByRole('tab', { name, exact: true }).click()
      assert.ok(await shell.locator('[data-u-comp="ribbon-grid-toolbar"] [data-u-command]').count())
    }
    await shell.getByRole('tab', { name: 'Start', exact: true }).click()
    const point = await page.evaluate(() => {
      const s = window.univerAPI.getWorkbook('lumen-pricing-model').save().sheets.pricing
      const b = document
        .querySelector('[data-embed-fullscreen-shell=true] [data-embed-canvas-root=true] canvas')
        .getBoundingClientRect()
      const h = (i) => s.rowData[i]?.h || s.defaultRowHeight
      return {
        x: b.x + (s.rowHeader.width + s.columnData[0].w + s.columnData[1].w / 2) * s.zoomRatio,
        y: b.y + (s.columnHeader.height + [0, 1, 2, 3, 4].reduce((a, i) => a + h(i), 0) + h(5) / 2) * s.zoomRatio,
      }
    })
    await page.mouse.click(point.x, point.y)
    await page.waitForFunction(
      () => window.univerAPI.getWorkbook('lumen-pricing-model').getActiveRange()?.getA1Notation() === 'B6',
    )
    const before = await source()
    await page.keyboard.type('48')
    await page.keyboard.press('Enter')
    await values(scenarios[0])
    const edited = await source()
    await page.keyboard.press('Control+z')
    await values(baseline)
    assert.deepEqual(await source(), before)
    await page.keyboard.press('Control+y')
    await values(scenarios[0])
    assert.deepEqual(await source(), edited)
    assert.deepEqual(await authored(), original)
    await page.screenshot({ path: path.join(directory, 'native-source.png') })
    await collapse()
    for (const p of ['pricing', 'economics', 'decision']) await show(p, 'native-' + p)
  })
  await gate('native-source-print-command-preview', async () => {
    await show('pricing', 'before-print')
    await root
      .locator('[data-u-comp="embed-float-dom"][data-embed-id="lumen-launch-sheet-float"]')
      .dblclick({ position: { x: 150, y: 95 } })
    await page.evaluate(() =>
      window.univerAPI.addEvent(window.univerAPI.Event.SheetPrintOpen, ({ workbook, worksheet }) => {
        window.printSource = { workbook: workbook.getId(), sheet: worksheet.getSheetId() }
      }),
    )
    await page.evaluate(() => window.univerAPI.executeCommand('sheet.operation.print-open'))
    const cancel = page.getByRole('button', { name: 'CANCEL', exact: true })
    await cancel.waitFor()
    await page.getByText(/^Total: [1-9]\d*pages$/).waitFor()
    assert.deepEqual(await page.evaluate(() => window.printSource), {
      workbook: 'lumen-pricing-model',
      sheet: 'pricing',
    })
    await page.screenshot({ path: path.join(directory, 'native-print.png') })
    await cancel.click()
  })
  await gate('active-source-disposal', async () => {
    await expand()
    await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
    await root.waitFor({ state: 'detached' })
    await settle()
    assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
    assert.equal(await shell.count(), 0)
  })
  await gate('owned-demo-disposal', async () => {
    if (await root.count()) await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
    await root.waitFor({ state: 'detached' })
    await settle()
    assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
    assert.equal(await page.locator('[data-embed-id="lumen-launch-sheet-float"]').count(), 0)
  })
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.backendRequests, [])
  report.passed = report.knownIssues.length === 0
} catch (e) {
  report.failure = e.stack
  report.currentResults = await results().catch(() => [])
  report.frames = await page
    .evaluate(() =>
      [...window.framesPaint.entries()]
        .filter(([c]) => c.isConnected)
        .map(([c, a]) => ({ width: c.width, text: a.join('') })),
    )
    .catch(() => [])
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify({ ...report, checks: report.checks.map((c) => ({ ...c, results: undefined })) }, null, 2))
  await browser.close()
}
if (!report.passed) process.exitCode = 1
