/* eslint-disable no-await-in-loop -- Follow the exact documented editing sequence. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-orchid-formula')
await fs.mkdir(directory, { recursive: true })
const examples = [
  ...(await fs.readFile('showcase/embed/base-to-slides-float/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((m) => m[1])
assert.equal(examples.length, 12)
const specs = [
  ['pipeline', 'nominal'],
  ['pipeline', 'weighted'],
  ['forecast', 'nominal'],
  ['forecast', 'weighted'],
  ['forecast', 'coverage'],
  ['forecast', 'gap'],
  ['review', 'discovery'],
  ['review', 'proposal'],
  ['review', 'negotiation'],
  ['review', 'active'],
  ['review', 'weighted'],
  ['review', 'signal'],
]
const baseline = [80000, 25000, 80000, 25000, 0.3125, 55000, 18000, 32000, 30000, 3, 25000, 'Develop the pipeline']
const scenarios = [
  [84000, 27000, 84000, 27000, 0.32142857142857145, 57000, 18000, 36000, 30000, 3, 27000, 'Develop the pipeline'],
  [84000, 30000, 84000, 30000, 0.35714285714285715, 54000, 18000, 36000, 30000, 3, 30000, 'Coverage improved'],
  [84000, 30000, 84000, 30000, 0.35714285714285715, 54000, 8000, 46000, 30000, 3, 30000, 'Coverage improved'],
  [84000, 23000, 84000, 23000, 0.27380952380952384, 61000, 8000, 46000, 30000, 2, 23000, 'Develop the pipeline'],
  [84000, 23000, 84000, 23000, 0.27380952380952384, 61000, 8000, 46000, 30000, 2, 23000, 'Develop the pipeline'],
  [80000, 25000, 80000, 25000, 0.3125, 55000, 18000, 32000, 30000, 3, 25000, 'Develop the pipeline'],
  [80000, 25000, 80000, 25000, 0.3125, 55000, 18000, 32000, 30000, 3, 25000, 'Develop the pipeline'],
  [80000, 25000, 80000, 25000, 0.3125, 55000, 18000, 32000, 30000, 3, 25000, 'Develop the pipeline'],
  [82000, 25000, 82000, 25000, 0.3048780487804878, 57000, 20000, 32000, 30000, 3, 25000, 'Develop the pipeline'],
  [82000, 25000, 82000, 25000, 0.3048780487804878, 57000, 20000, 32000, 30000, 3, 25000, 'Develop the pipeline'],
  [0, 0, 0, 0, '#DIV/0!', 0, 0, 0, 0, 3, 0, 'Develop the pipeline'],
  [80000, 25000, 80000, 25000, 0.3125, 55000, 18000, 32000, 30000, 3, 25000, 'Develop the pipeline'],
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
  window.basePoints = []
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
    if (this.canvas.closest('[data-embed-id="orchid-base-float"]')) {
      const p = this.getTransform().transformPoint({ x: args[1], y: args[2] }),
        b = this.canvas.getBoundingClientRect()
      if (b.width > 300)
        window.basePoints.push({
          text: String(args[0]),
          x: b.x + (p.x * b.width) / this.canvas.width,
          y: b.y + (p.y * b.height) / this.canvas.height,
        })
    }
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
const root = page.locator('.orchid-embed')
const settle = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
const results = () =>
  page.evaluate(
    (entries) =>
      entries.map(([p, id]) =>
        window.univerAPI.getPresentation('orchid-pipeline-deck').getSlideById(p).getShape(id).getFormulaResult(),
      ),
    specs,
  )
const source = () =>
  page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getBase('orchid-opportunity-register').save())))
const authored = () =>
  page.evaluate((entries) => {
    const data = window.univerAPI.getPresentation('orchid-pipeline-deck').save()
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
          .getPresentation('orchid-pipeline-deck')
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
  await root.locator('[data-u-comp="slide-thumbnail-item"][data-page-id="pipeline"]').click()
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
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4298', {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  })
  await page.waitForFunction(
    () =>
      document.querySelector('.orchid-embed')?.dataset.ready || document.querySelector('.orchid-embed')?.dataset.error,
    null,
    { timeout: 60000 },
  )
  assert.equal(await root.getAttribute('data-error'), null)

  assert.equal(await root.locator('iframe,fieldset,[data-action]').count(), 0)
  await values(baseline)
  report.descriptor = await page.evaluate(() =>
    window.univerAPI.listEmbeds({ hostUnitId: 'orchid-pipeline-deck' })[0].getDescriptor(),
  )
  assert.equal(report.descriptor.entry, 'slides-floating-object')
  assert.equal(report.descriptor.childUnitId, 'orchid-opportunity-register')
  assert.equal(await root.locator('[data-u-comp="slide-thumbnail-item"]').count(), 3)
  const original = await authored()
  for (const p of ['pipeline', 'forecast', 'review']) await show(p, 'baseline-' + p)
  await gate('native-source-visible', async () => {
    await openSource()
    await page.waitForFunction(() =>
      [...window.framesPaint.entries()].some(
        ([c, a]) =>
          c.isConnected && c.closest('[data-embed-id="orchid-base-float"]') && a.join('').includes('Museum after dark'),
      ),
    )
  })
  for (const [i, expected] of scenarios.entries()) {
    await openSource()
    await root
      .locator('[data-u-comp="embed-float-dom"][data-embed-id="orchid-base-float"]')
      .dblclick({ position: { x: 150, y: 95 } })
    await page.waitForFunction(
      () =>
        document
          .querySelector('[data-u-comp="embed-float-dom"][data-embed-id="orchid-base-float"]')
          ?.getAttribute('data-embed-float-stage') === 'stage2',
    )
    await page.evaluate(examples[i])
    await values(expected)
    if (i === 3 || i === 4)
      assert.equal((await source()).tables.deals.records['deal-3'].values.probability, i === 3 ? null : 0)
    if (i === 6) {
      const saved = await source()
      assert.equal(saved.name, 'Orchid / December opportunities')
      assert.equal(saved.tables.deals.formulaName, 'Deals')
      assert.equal(saved.tables.deals.name, 'Studio pipeline')
    }
    if (i === 7 || i === 8) {
      const projection = await page.evaluate(() =>
        window.univerAPI
          .getBase('orchid-opportunity-register')
          .getTableById('deals')
          .getViewById('deals-grid')
          .getProjection(),
      )
      assert.deepEqual(
        projection.rows.map((r) => r.recordId),
        ['deal-1', 'deal-6'],
      )
      assert.equal(Object.keys((await source()).tables.deals.records).length, 6)
    }
    assert.deepEqual(await authored(), original)
    const hostVisible = (await root.locator('[data-u-comp="slide-thumbnail-item"]').count()) === 3
    if (hostVisible) {
      for (const p of ['pipeline', 'forecast', 'review']) await show(p, 'example-' + (i + 1) + '-' + p)
    } else if (!report.knownIssues.some((issue) => issue.gate === 'source-edit-preserves-host')) {
      report.knownIssues.push({
        gate: 'source-edit-preserves-host',
        error:
          'A Base Facade edit removes the native Slides workbench. Subsequent formula checks do not certify rendered output.',
      })
      await page.screenshot({ path: path.join(directory, 'source-edit-host-lost.png') })
    }
    report.checks.push({
      example: i + 1,
      expected,
      results: await results(),
      authoredPreserved: true,
      currentCanvasVerified: hostVisible,
    })
  }
  // Separate checks use a fresh instance after the recorded host-loss failure.
  // Never refocus a broken instance to make its current-canvas gate pass.
  const reload = async () => {
    await page.reload({ waitUntil: 'domcontentloaded' })
    await root.locator('[data-u-comp="slide-thumbnail-item"][data-page-id="pipeline"]').waitFor()
    await page.waitForFunction(() => document.querySelector('.orchid-embed')?.dataset.ready === 'true')
    await values(baseline)
  }
  await reload()
  await gate('off-page-source-write', async () => {
    await show('review', 'off-page')
    await page.evaluate(examples[0])
    await values(scenarios[0])
    for (const p of ['pipeline', 'forecast', 'review']) await show(p, 'off-page-updated-' + p)
  })
  await reload()
  await gate('native-base-title-history', async () => {
    const block = root.locator('[data-u-comp="embed-float-dom"][data-embed-id="orchid-base-float"]')
    await block.dblclick({ position: { x: 150, y: 95 } })
    await page.waitForFunction(
      () =>
        document
          .querySelector('[data-u-comp="embed-float-dom"][data-embed-id="orchid-base-float"]')
          ?.getAttribute('data-embed-float-stage') === 'stage2',
    )
    await page.waitForFunction(() => window.basePoints.some((p) => p.text === 'Museum after dark'))
    const point = await page.evaluate(() => window.basePoints.findLast((p) => p.text === 'Museum after dark'))
    const before = await source()
    await page.mouse.dblclick(point.x + 30, point.y - 4)
    await page.keyboard.press('Control+A')
    await page.keyboard.type('Museum evening programme')
    await page.keyboard.press('Enter')
    await page.waitForFunction(
      () =>
        window.univerAPI
          .getBase('orchid-opportunity-register')
          .getTableById('deals')
          .getRecordById('deal-1')
          .getValue('title') === 'Museum evening programme',
    )
    const edited = await source()
    await values(baseline)
    await gate('native-keyboard-undo', async () => {
      await page.keyboard.press('Control+z')
      await settle()
      assert.deepEqual(await source(), before)
    })
    const toolbar = page.locator('[data-u-comp="embed-float-dom-chrome"][data-embed-id="orchid-base-float"]')
    if ((await source()).tables.deals.records['deal-1'].values.title !== 'Museum after dark')
      await toolbar.getByRole('button', { name: 'Undo', exact: true }).click()
    await settle()
    assert.deepEqual(await source(), before)
    await toolbar.getByRole('button', { name: 'Redo', exact: true }).click()
    await settle()
    assert.deepEqual(await source(), edited)
    assert.deepEqual(await authored(), original)
    await page.screenshot({ path: path.join(directory, 'native-title.png') })
  })
  await gate('native-amount-live-slides', async () => {
    await reload()
    const block = root.locator('[data-u-comp="embed-float-dom"][data-embed-id="orchid-base-float"]')
    await block.dblclick({ position: { x: 150, y: 95 } })
    await page.waitForFunction(() => window.basePoints.some((p) => p.text === '24,000.00'))
    const point = await page.evaluate(() => window.basePoints.findLast((p) => p.text === '24,000.00'))
    await page.mouse.dblclick(point.x - 15, point.y - 4)
    await page.keyboard.press('Control+A')
    await page.keyboard.type('26000')
    await page.keyboard.press('Enter')
    await values([
      82000,
      26000,
      82000,
      26000,
      26000 / 82000,
      56000,
      18000,
      32000,
      32000,
      3,
      26000,
      'Develop the pipeline',
    ])
    assert.equal((await source()).tables.deals.records['deal-1'].values.amount, 26000)
    for (const p of ['pipeline', 'forecast', 'review']) await show(p, 'native-amount-' + p)
    assert.deepEqual(await authored(), original)
  })
  await gate('native-fullscreen', async () => {
    await reload()
    await openSource()
    const block = root.locator('[data-u-comp="embed-float-dom"][data-embed-id="orchid-base-float"]')
    await block.dblclick({ position: { x: 150, y: 95 } })
    await page.getByRole('button', { name: 'Enter fullscreen', exact: true }).click()
    await page.locator('[data-embed-fullscreen-shell=true]').waitFor()
    await page.screenshot({ path: path.join(directory, 'fullscreen.png') })
    await page.getByRole('button', { name: 'Exit fullscreen', exact: true }).click()
    await page.locator('[data-embed-fullscreen-shell=true]').waitFor({ state: 'detached' })
  })
  await gate('active-source-disposal', async () => {
    await openSource()
    await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
    await root.waitFor({ state: 'detached' })
    assert.equal(await page.evaluate(() => !!window.univerAPI), false)
    assert.equal(await page.locator('[data-embed-id="orchid-base-float"]').count(), 0)
  })
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.backendRequests, [])
  report.passed = report.knownIssues.length === 0
} catch (e) {
  report.failure = e.stack
  report.lastResults = await results().catch(() => null)
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify({ ...report, checks: report.checks.map((c) => ({ ...c, results: undefined })) }, null, 2))
  await browser.close()
}
if (!report.passed) process.exitCode = 1
