/* eslint-disable no-await-in-loop -- Exercise the documented source changes and native menus in order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-flint-formula')
await fs.mkdir(directory, { recursive: true })
const examples = [
  ...(await fs.readFile('showcase/embed/base-to-boards-float/README.md', 'utf8'))
    .split('## Source identity, view projection and recovery')[0]
    .matchAll(/\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g),
].map((m) => m[1])
assert.equal(examples.length, 9)
const ids = [
  'remaining',
  'open',
  'blocked',
  'completion',
  'content-remaining',
  'build-remaining',
  'access-remaining',
  'retained',
  'signal',
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
  window.basePoints = []
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
    if (this.canvas.closest('[data-embed-fullscreen-shell]')) {
      const p = this.getTransform().transformPoint({ x: args[1], y: args[2] })
      const b = this.canvas.getBoundingClientRect()
      if (b.width > 300)
        window.basePoints.push({
          text: String(args[0]),
          x: b.x + (p.x * b.width) / this.canvas.width,
          y: b.y + (p.y * b.height) / this.canvas.height,
        })
    }
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
const root = page.locator('.flint-embed')
const child = root.locator('[data-u-comp="embed-float-dom"][data-embed-id="flint-base-float"]')
const shell = page.locator('[data-embed-fullscreen-shell="true"]')
const settle = () =>
  page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
const result = () =>
  page.evaluate(
    (keys) =>
      Object.fromEntries(
        keys.map((id) => [id, window.univerAPI.getBoard('flint-delivery-control').getShape(id).getFormulaResult()]),
      ),
    ids,
  )
const authored = () =>
  page.evaluate((keys) => {
    const boardPage = window.univerAPI.getBoard('flint-delivery-control').save().pages.delivery
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
const baseSnapshot = () =>
  page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getBase('flint-delivery-register').save())))
async function values(expected) {
  await page.waitForFunction(
    (target) =>
      target.ids.every((id, i) => {
        const r = window.univerAPI.getBoard('flint-delivery-control').getShape(id).getFormulaResult()
        const v = target.expected[i]
        return (
          r &&
          !r.stale &&
          r.status === 'success' &&
          (typeof v === 'number' ? Math.abs(r.value - v) < 1e-9 : r.value === v)
        )
      }),
    { ids, expected },
    { timeout: 30000 },
  )
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
        .querySelector('[data-u-comp="embed-float-dom"][data-embed-id="flint-base-float"]')
        ?.getAttribute('data-embed-float-stage') === 'stage2',
  )
  await page
    .locator('[data-u-comp="embed-float-dom-chrome"][data-embed-id="flint-base-float"]')
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
const baseline = [25, 3, 2, 0.4, 12, 8, 5, 35, 'Unblock first']
const scenarios = [
  [17, 2, 1, 0.6, 12, 0, 5, 35, 'Unblock first'],
  [17, 2, 1, 0.6, 12, 0, 5, 47, 'Unblock first'],
  [17, 2, 0, 0.6, 12, 0, 5, 47, 'Review next step'],
  [23, 2, 0, 0.6, 18, 0, 5, 53, 'Review next step'],
  [5, 2, 0, 0.6, 0, 0, 5, 35, 'Review next step'],
  [0, 2, 0, 0.6, 0, 0, 0, 30, 'Review next step'],
  baseline,
  baseline,
  baseline,
]
try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4288', {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  })
  await page.waitForFunction(
    () => {
      const r = document.querySelector('.flint-embed')
      return r?.dataset.ready || r?.dataset.error
    },
    null,
    { timeout: 60000 },
  )
  assert.equal(await root.getAttribute('data-error'), null)
  assert.equal(await root.locator('fieldset,[data-action],iframe').count(), 0)
  const descriptor = await page.evaluate(() =>
    window.univerAPI.listEmbeds({ hostUnitId: 'flint-delivery-control' })[0].getDescriptor(),
  )
  assert.equal(descriptor.entry, 'boards-floating-object')
  assert.equal(descriptor.childUnitId, 'flint-delivery-register')
  await values(baseline)
  await rendered('baseline')
  const original = await authored()
  for (const [i, code] of examples.entries()) {
    await page.evaluate(code)
    await values(scenarios[i])
    assert.deepEqual(
      await authored(),
      original,
      'Source edits preserve all Board prose, geometry and connector bindings',
    )
    await rendered('example-' + (i + 1))
    report.checks.push({ example: i + 1, results: await result() })
  }
  await gate('native-source-history', async () => {
    await expand()
    const before = await baseSnapshot()
    await page.evaluate(examples[0])
    await values(scenarios[0])
    const edited = await baseSnapshot()
    for (const [command, snapshot, expected] of [
      ['Undo', before, baseline],
      ['Redo', edited, scenarios[0]],
    ]) {
      await shell.getByRole('button', { name: command, exact: true }).click()
      await settle()
      assert.deepEqual(await baseSnapshot(), snapshot)
      await values(expected)
      assert.deepEqual(await authored(), original)
    }
    await collapse()
    await rendered('native-status-history')
  })
  await gate('native-source-typing', async () => {
    await expand()
    await page.waitForFunction(() => window.basePoints.some((p) => p.text === 'Write field guide'))
    const point = await page.evaluate(() => window.basePoints.findLast((p) => p.text === 'Write field guide'))
    const before = await baseSnapshot()
    await page.mouse.dblclick(point.x + 30, point.y - 4)
    await page.keyboard.press('Control+A')
    await page.keyboard.type('Publish visitor guide')
    await page.keyboard.press('Enter')
    await page.waitForFunction(
      () =>
        window.univerAPI
          .getBase('flint-delivery-register')
          .getTableById('tasks')
          .getRecordById('task-1')
          .getValue('title') === 'Publish visitor guide',
    )
    const edited = await baseSnapshot()
    assert.deepEqual(await authored(), original)
    for (const [command, snapshot] of [
      ['Undo', before],
      ['Redo', edited],
    ]) {
      await shell.getByRole('button', { name: command, exact: true }).click()
      await settle()
      assert.deepEqual(await baseSnapshot(), snapshot)
      assert.deepEqual(await authored(), original)
    }
    await collapse()
    await rendered('native-source-typing')
  })
  await gate('native-source-effort-typing', async () => {
    await expand()
    await page.waitForFunction(() => window.basePoints.some((p) => p.text === '12.00'))
    const point = await page.evaluate(() => window.basePoints.findLast((p) => p.text === '12.00'))
    const before = await baseSnapshot()
    // Numeric text is right-aligned: its paint anchor is the cell's right edge.
    await page.mouse.dblclick(point.x - 15, point.y - 4)
    await page.keyboard.press('Control+A')
    await page.keyboard.type('18')
    await page.keyboard.press('Enter')
    await values([23, 2, 1, 0.6, 18, 0, 5, 41, 'Unblock first'])
    assert.equal((await baseSnapshot()).tables.tasks.records['task-1'].values.hours, 18)
    const edited = await baseSnapshot()
    for (const [command, snapshot, expected] of [
      ['Undo', before, scenarios[0]],
      ['Redo', edited, [23, 2, 1, 0.6, 18, 0, 5, 41, 'Unblock first']],
    ]) {
      await shell.getByRole('button', { name: command, exact: true }).click()
      await settle()
      assert.deepEqual(await baseSnapshot(), snapshot)
      await values(expected)
      assert.deepEqual(await authored(), original)
    }
    await collapse()
    await rendered('native-effort-change')
  })
  await gate('active-fullscreen-disposal', async () => {
    await expand()
    await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
    await root.waitFor({ state: 'detached' })
    await settle()
    assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
  })
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.backendRequests, [])
  assert.ok(Object.values(report.gates).every((g) => g.passed))
  report.passed = true
} catch (e) {
  report.failure = e.stack
  report.results = await result().catch(() => null)
  report.source = await baseSnapshot().catch(() => null)
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
  await browser.close()
}
if (!report.passed) process.exitCode = 1
