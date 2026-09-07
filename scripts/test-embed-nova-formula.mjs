/* eslint-disable no-await-in-loop -- Follow the exact documented editing sequence. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-nova-formula')
await fs.mkdir(directory, { recursive: true })
const examples = [
  ...(await fs.readFile('showcase/embed/sheet-to-slides-tab/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((m) => m[1])
assert.equal(examples.length, 10)
const specs = [
  ['overview', 'actual'],
  ['overview', 'target'],
  ['overview', 'attainment'],
  ['overview', 'variance'],
  ['channels', 'retail-actual'],
  ['channels', 'retail-rate'],
  ['channels', 'partners-actual'],
  ['channels', 'partners-rate'],
  ['channels', 'online-actual'],
  ['channels', 'online-rate'],
  ['decision', 'attainment-repeat'],
  ['decision', 'largest-gap'],
  ['decision', 'below-target'],
]
const baseline = [73500, 70000, 1.05, 3500, 31500, 1.05, 27500, 1.1, 14500, 0.9666666666666667, 1.05, 2500, 1]
const scenarios = [
  [77000, 70000, 1.1, 7000, 35000, 1.1666666666666667, 27500, 1.1, 14500, 0.9666666666666667, 1.1, 5000, 1],
  [
    77000, 72000, 1.0694444444444444, 5000, 35000, 1.09375, 27500, 1.1, 14500, 0.9666666666666667, 1.0694444444444444,
    3000, 1,
  ],
  [80500, 72000, 1.1180555555555556, 8500, 35000, 1.09375, 27500, 1.1, 18000, 1.2, 1.1180555555555556, 3000, 0],
  [53000, 72000, 0.7361111111111112, -19000, 35000, 1.09375, 0, 0, 18000, 1.2, 0.7361111111111112, 3000, 1],
  [53000, 72000, 0.7361111111111112, -19000, 35000, 1.09375, null, 0, 18000, 1.2, 0.7361111111111112, 3000, 1],
  [
    53000,
    72000,
    0.7361111111111112,
    -19000,
    35000,
    1.09375,
    'pending',
    '#VALUE!',
    18000,
    1.2,
    0.7361111111111112,
    '#VALUE!',
    0,
  ],
  [73500, 70000, 1.05, 3500, 31500, 1.05, 27500, 1.1, 14500, 0.9666666666666667, 1.05, 2500, 1],
  [73500, 40000, 1.8375, 33500, 31500, '#DIV/0!', 27500, 1.1, 14500, 0.9666666666666667, 1.8375, 31500, 1],
  [73500, 0, '#DIV/0!', 73500, 31500, '#DIV/0!', 27500, '#DIV/0!', 14500, '#DIV/0!', '#DIV/0!', 31500, 0],
  [73500, 70000, 1.05, 3500, 31500, 1.05, 27500, 1.1, 14500, 0.9666666666666667, 1.05, 2500, 1],
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
const root = page.locator('.nova-embed')
const settle = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
const results = () =>
  page.evaluate(
    (entries) =>
      entries.map(([p, id]) =>
        window.univerAPI.getPresentation('nova-operating-deck').getSlideById(p).getShape(id).getFormulaResult(),
      ),
    specs,
  )
const source = () =>
  page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getWorkbook('nova-channel-model').save())))
const authored = () =>
  page.evaluate((entries) => {
    const data = window.univerAPI.getPresentation('nova-operating-deck').save()
    return data.slideOrder.map((p) => {
      const slide = data.slides[p]
      return {
        id: p,
        name: slide.name,
        background: slide.background,
        speakerNotes: slide.speakerNotes,
        order: slide.elementOrder,
        elements: Object.entries(slide.elements || {}).map(([id, e]) =>
          entries.some(([pageId, shapeId]) => pageId === p && shapeId === id) ? { id, transform: e.transform } : e,
        ),
      }
    })
  }, specs)
async function values(expected) {
  await page.waitForFunction(
    ({ entries, wanted }) =>
      entries.every(([p, id], i) => {
        const r = window.univerAPI
          .getPresentation('nova-operating-deck')
          .getSlideById(p)
          .getShape(id)
          .getFormulaResult()
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
async function openSource() {
  await root.locator('[data-u-comp="slide-thumbnail-item"][data-page-id="nova-operating-source-page"]').click()
  await page.locator('[data-embed-slides-page-list-host]').waitFor()
  await page.waitForFunction(() =>
    [...window.framesPaint.entries()].some(
      ([c, a]) =>
        c.isConnected &&
        c.closest('[data-embed-slides-page-list-host]') &&
        a.join('').includes('NOVA / Channel operating model'),
    ),
  )
  await settle()
}
async function gate(name, run) {
  try {
    await run()
    report.checks.push({ gate: name, passed: true })
  } catch (e) {
    report.knownIssues.push({ gate: name, error: e.stack })
    await page.screenshot({ path: path.join(directory, name + '-failure.png') })
  }
}
try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4294', {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  })
  await page.waitForFunction(
    () => {
      const r = document.querySelector('.nova-embed')
      return r?.dataset.ready || r?.dataset.error
    },
    null,
    { timeout: 60000 },
  )
  assert.equal(await root.getAttribute('data-error'), null)
  assert.equal(await root.locator('iframe,fieldset,[data-action],[data-u-comp="embed-float-dom"]').count(), 0)
  await values(baseline)
  report.descriptor = await page.evaluate(() =>
    window.univerAPI.listEmbeds({ hostUnitId: 'nova-operating-deck' })[0].getDescriptor(),
  )
  assert.equal(report.descriptor.entry, 'slides-page-list-block')
  assert.equal(report.descriptor.childUnitId, 'nova-channel-model')
  assert.equal(await root.locator('[data-u-comp="slide-thumbnail-item"]').count(), 4)
  const original = await authored()
  for (const p of ['overview', 'channels', 'decision']) await show(p, 'baseline-' + p)
  await openSource()
  assert.equal(
    await root
      .locator('[data-u-comp="workbench-layout"]')
      .first()
      .evaluate((e) => getComputedStyle(e).backgroundColor),
    'rgb(255, 255, 255)',
  )
  await page.screenshot({ path: path.join(directory, 'operating-data.png') })
  await gate('off-page-source-write', async () => {
    await show('decision', 'off-page')
    await page.evaluate(examples[0])
    await values(scenarios[0])
  })
  await openSource()
  await page.evaluate(examples[6])
  await values(baseline)
  for (const [i, expected] of scenarios.entries()) {
    await openSource()
    await page.evaluate(examples[i])
    await values(expected)
    assert.deepEqual(await authored(), original)
    const actual = (await source()).sheets.channels.cellData[5][2]
    if (i === 3) assert.equal(actual.v, 0)
    if (i === 4) assert.ok(actual.v == null)
    if (i === 5) assert.equal(actual.v, 'pending')
    for (const p of ['overview', 'channels', 'decision']) await show(p, 'example-' + (i + 1) + '-' + p)
    report.checks.push({ example: i + 1, expected, results: await results(), authoredPreserved: true })
  }
  await gate('native-data-page-editing-history', async () => {
    await openSource()
    for (const name of ['Start', 'Insert', 'Formulas', 'Data', 'View']) {
      await page.getByRole('tab', { name, exact: true }).click()
      assert.ok(await page.locator('[data-u-comp="ribbon-grid-toolbar"] [data-u-command]').count())
    }
    await page.getByRole('tab', { name: 'Start', exact: true }).click()
    const point = await page.evaluate(() => {
      const s = window.univerAPI.getWorkbook('nova-channel-model').save().sheets.channels
      const canvas = [...document.querySelectorAll('[data-embed-slides-page-list-host] canvas')].find(
        (c) => c.width > 600 && c.height > 300,
      )
      const b = canvas.getBoundingClientRect(),
        h = (i) => s.rowData[i]?.h || s.defaultRowHeight
      return {
        x: b.x + (s.rowHeader.width + s.columnData[0].w + s.columnData[1].w + s.columnData[2].w / 2) * s.zoomRatio,
        y: b.y + (s.columnHeader.height + [0, 1, 2, 3].reduce((sum, i) => sum + h(i), 0) + h(4) / 2) * s.zoomRatio,
      }
    })
    await page.mouse.click(point.x, point.y)
    await page.waitForFunction(
      () => window.univerAPI.getWorkbook('nova-channel-model').getActiveRange()?.getA1Notation() === 'C5',
    )
    const before = await source()
    await page.keyboard.type('35000')
    await page.keyboard.press('Enter')
    await values(scenarios[0])
    const edited = await source()
    await page.keyboard.press('Control+z')
    await values(baseline)
    await gate('native-undo-exact-snapshot', async () => assert.deepEqual(await source(), before))
    await page.keyboard.press('Control+y')
    await values(scenarios[0])
    await gate('native-redo-exact-snapshot', async () => assert.deepEqual(await source(), edited))
    assert.deepEqual(await authored(), original)
    await page.screenshot({ path: path.join(directory, 'native-edit.png') })
    for (const p of ['overview', 'channels', 'decision']) await show(p, 'native-' + p)
  })
  await gate('native-source-print-menu', async () => {
    await openSource()
    await page.evaluate(() =>
      window.univerAPI.addEvent(window.univerAPI.Event.SheetPrintOpen, ({ workbook, worksheet }) => {
        window.printSource = { workbook: workbook.getId(), sheet: worksheet.getSheetId() }
      }),
    )
    await page.locator('[data-u-command="sheet.menu.print"]').click()
    await page.getByRole('menuitem', { name: 'Print', exact: true }).click()
    const cancel = page.getByRole('button', { name: 'CANCEL', exact: true })
    await cancel.waitFor()
    await page.getByText(/^Total: [1-9]\d*pages$/).waitFor()
    assert.deepEqual(await page.evaluate(() => window.printSource), {
      workbook: 'nova-channel-model',
      sheet: 'channels',
    })
    await page.screenshot({ path: path.join(directory, 'native-print.png') })
    await cancel.click()
    await show('decision', 'after-print')
  })
  await gate('active-source-disposal', async () => {
    await openSource()
    await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
    await root.waitFor({ state: 'detached' })
    await settle()
    assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
    assert.equal(await page.locator('[data-embed-slides-page-list-host]').count(), 0)
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
