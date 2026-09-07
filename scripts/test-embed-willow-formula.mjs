/* eslint-disable no-await-in-loop -- Exercise the documented source changes and native menus in order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-willow-formula')
await fs.mkdir(directory, { recursive: true })
const examples = [
  ...(await fs.readFile('showcase/embed/sheet-to-boards-float/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((m) => m[1])
assert.equal(examples.length, 9)
const ids = [
  'available',
  'planned',
  'remaining',
  'utilization',
  'editorial-free',
  'production-free',
  'access-free',
  'capacity-signal',
]
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1700, height: 1100 } })
page.setDefaultTimeout(15000)
const report = { passed: false, checks: [], gates: {}, errors: [], backendRequests: [] }
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
  window.boardFrames = new Map()
  const fill = CanvasRenderingContext2D.prototype.fillText,
    clear = CanvasRenderingContext2D.prototype.clearRect,
    drawImage = CanvasRenderingContext2D.prototype.drawImage
  CanvasRenderingContext2D.prototype.clearRect = function (...args) {
    window.boardFrames.set(this.canvas, [])
    return Reflect.apply(clear, this, args)
  }
  CanvasRenderingContext2D.prototype.fillText = function (...args) {
    const frame = window.boardFrames.get(this.canvas) || []
    frame.push(String(args[0]))
    window.boardFrames.set(this.canvas, frame)
    return Reflect.apply(fill, this, args)
  }
  CanvasRenderingContext2D.prototype.drawImage = function (source, ...args) {
    const frame = window.boardFrames.get(this.canvas) || []
    frame.push(...(window.boardFrames.get(source) || []))
    window.boardFrames.set(this.canvas, frame)
    return Reflect.apply(drawImage, this, [source, ...args])
  }
})
const root = page.locator('.willow-embed')
const child = root.locator('[data-u-comp="embed-float-dom"][data-embed-id="willow-sheet-float"]')
const shell = page.locator('[data-embed-fullscreen-shell="true"]')
const settle = () =>
  page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
const result = () =>
  page.evaluate(
    (keys) =>
      Object.fromEntries(
        keys.map((id) => [id, window.univerAPI.getBoard('willow-capacity-map').getShape(id).getFormulaResult()]),
      ),
    ids,
  )
const authored = () =>
  page.evaluate((keys) => {
    const boardPage = window.univerAPI.getBoard('willow-capacity-map').save().pages.planning
    return {
      order: boardPage.elementOrder,
      elements: Object.fromEntries(
        Object.entries(boardPage.elements).map(([id, shape]) => [
          id,
          keys.includes(id) ? { transform: shape.transform } : shape,
        ]),
      ),
    }
  }, ids)
const sheetSnapshot = () => page.evaluate(() => window.univerAPI.getWorkbook('willow-studio-capacity').save())
async function values(capacities, workloads) {
  const available = capacities.reduce((a, b) => a + b, 0),
    planned = workloads.reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0)
  const expected = Object.fromEntries(
    ids.map((id, i) => [
      id,
      [
        available,
        planned,
        available - planned,
        available ? planned / available : '#DIV/0!',
        ...capacities.map((c, j) => (typeof workloads[j] === 'number' ? c - workloads[j] : '#VALUE!')),
        available - planned < 0 ? 'Rebalance scope' : 'Within capacity',
      ][i],
    ]),
  )
  await page.waitForFunction(
    (targets) =>
      Object.entries(targets).every(([id, value]) => {
        const r = window.univerAPI.getBoard('willow-capacity-map').getShape(id).getFormulaResult()
        return (
          r &&
          !r.stale &&
          (typeof value === 'number'
            ? r.status === 'success' && Math.abs(r.value - value) < 1e-9
            : r.value === value && r.status === (value.startsWith('#') ? 'error' : 'success'))
        )
      }),
    expected,
    { timeout: 30000 },
  )
  return expected
}
async function rendered(name) {
  const texts = Object.values(await result()).map((r) => r.displayText)
  await page.waitForFunction(
    (targets) =>
      [...window.boardFrames.entries()].some(
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
async function expand() {
  if (await shell.count()) return
  await child.dblclick({ position: { x: 220, y: 130 } })
  await page.waitForFunction(
    () =>
      document
        .querySelector('[data-u-comp="embed-float-dom"][data-embed-id="willow-sheet-float"]')
        ?.getAttribute('data-embed-float-stage') === 'stage2',
  )
  await page
    .locator('[data-u-comp="embed-float-dom-chrome"][data-embed-id="willow-sheet-float"]')
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
    report.gates[name] = { passed: true }
  } catch (error) {
    report.gates[name] = { passed: false, failure: error.stack }
    await page.screenshot({ path: path.join(directory, name + '-failure.png') })
  }
}
try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4282', {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  })
  await page.waitForFunction(
    () => {
      const r = document.querySelector('.willow-embed')
      return r?.dataset.ready || r?.dataset.error
    },
    null,
    { timeout: 60000 },
  )
  assert.equal(await root.getAttribute('data-error'), null)
  assert.equal(await root.locator('fieldset,[data-action],iframe').count(), 0)
  const descriptor = await page.evaluate(() =>
    window.univerAPI.listEmbeds({ hostUnitId: 'willow-capacity-map' })[0].getDescriptor(),
  )
  assert.equal(descriptor.entry, 'boards-floating-object')
  assert.equal(descriptor.childUnitId, 'willow-studio-capacity')
  await values([128, 112, 80], [92, 104, 80])
  await rendered('baseline')
  const original = await authored()
  const scenarios = [
    [
      [128, 112, 80],
      [92, 128, 80],
    ],
    [
      [128, 144, 80],
      [92, 128, 80],
    ],
    [
      [128, 144, 80],
      [92, 128, 148],
    ],
    [
      [0, 0, 0],
      [92, 128, 148],
    ],
    [
      [128, 112, 80],
      [92, 104, 80],
    ],
  ]
  for (const [i, [capacities, workloads]] of scenarios.entries()) {
    const before = await result()
    await page.evaluate(examples[i])
    const expected = await values(capacities, workloads)
    assert.deepEqual(await authored(), original)
    if (i < 2) {
      const after = await result()
      assert.deepEqual(after['editorial-free'], before['editorial-free'])
      assert.deepEqual(after['access-free'], before['access-free'])
    }
    await rendered('example-' + (i + 1))
    report.checks.push({ example: i + 1, expected, authoredPreserved: true })
  }
  await page.evaluate(examples[8])
  await gate('blank-invalid-and-recovery', async () => {
    await page.evaluate(examples[5])
    await values([128, 112, 80], [92, 0, 80])
    await rendered('blank-plan')
    await page.evaluate(examples[6])
    await values([128, 112, 80], [92, 'pending', 80])
    assert.deepEqual(await authored(), original)
    await rendered('invalid-plan')
    await page.evaluate(examples[7])
    await values([128, 112, 80], [92, 104, 80])
  })
  report.checks.push(
    'All nine literal examples execute; eight native values and full authored text/geometry/connectors remain consistent',
  )
  await gate('native-source-edit-and-history', async () => {
    await expand()
    await shell.locator('[data-u-comp="ribbon-grid-toolbar"]').waitFor()
    for (const name of ['Start', 'Insert', 'Formulas', 'Data', 'View']) {
      await shell.getByRole('tab', { name, exact: true }).click()
      assert.ok(await shell.locator('[data-u-comp="ribbon-grid-toolbar"] [data-u-command]').count())
    }
    await shell.getByRole('tab', { name: 'Start', exact: true }).click()
    const point = await page.evaluate(() => {
      const sheet = window.univerAPI.getWorkbook('willow-studio-capacity').save().sheets.capacity
      const bounds = document
        .querySelector('[data-embed-fullscreen-shell="true"] [data-embed-canvas-root="true"] canvas')
        .getBoundingClientRect()
      const rowHeight = (i) => sheet.rowData[i]?.h || sheet.defaultRowHeight
      return {
        x:
          bounds.x +
          (sheet.rowHeader.width + sheet.columnData[0].w + sheet.columnData[1].w + sheet.columnData[2].w / 2) *
            sheet.zoomRatio,
        y:
          bounds.y +
          (sheet.columnHeader.height + [0, 1, 2, 3, 4].reduce((sum, i) => sum + rowHeight(i), 0) + rowHeight(5) / 2) *
            sheet.zoomRatio,
      }
    })
    await page.mouse.click(point.x, point.y)
    await page.waitForFunction(
      () => window.univerAPI.getWorkbook('willow-studio-capacity').getActiveRange()?.getA1Notation() === 'C6',
    )
    const before = await sheetSnapshot()
    await page.keyboard.type('128')
    await page.keyboard.press('Enter')
    await values([128, 112, 80], [92, 128, 80])
    const edited = await sheetSnapshot()
    await page.keyboard.press('Control+z')
    await values([128, 112, 80], [92, 104, 80])
    assert.deepEqual(await sheetSnapshot(), before)
    await page.keyboard.press('Control+y')
    await values([128, 112, 80], [92, 128, 80])
    assert.deepEqual(await sheetSnapshot(), edited)
    assert.deepEqual(await authored(), original)
    await page.screenshot({ path: path.join(directory, 'native-sheet.png') })
    await collapse()
    await rendered('native-roundtrip')
  })
  await gate('native-print-preview', async () => {
    await expand()
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
    assert.deepEqual(await page.evaluate(() => window.printSource), {
      workbook: 'willow-studio-capacity',
      sheet: 'capacity',
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
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.backendRequests, [])
  assert.ok(Object.values(report.gates).every((g) => g.passed))
  report.passed = true
} catch (error) {
  report.failure = error.stack
  report.currentResults = await result().catch(() => null)
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  await browser.close()
}
if (!report.passed) process.exitCode = 1
