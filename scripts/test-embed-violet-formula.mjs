/* eslint-disable no-await-in-loop -- Follow the exact documented editing sequence. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-violet-formula')
await fs.mkdir(directory, { recursive: true })
const examples = [
  ...(await fs.readFile('showcase/embed/base-to-slides-tab/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((m) => m[1])
assert.equal(examples.length, 12)
const specs = [
  ['overview', 'ready'],
  ['overview', 'total'],
  ['overview', 'count-rate'],
  ['overview', 'word-rate'],
  ['sections', 'guides-ready'],
  ['sections', 'guides-total'],
  ['sections', 'essays-ready'],
  ['sections', 'essays-total'],
  ['sections', 'interviews-ready'],
  ['sections', 'interviews-total'],
  ['decision', 'ready-repeat'],
  ['decision', 'unfinished'],
  ['decision', 'signal'],
]
const baseline = [5, 8, 0.625, 0.5365853658536586, 1900, 2700, 1400, 3200, 1100, 2300, 5, 3800, 'Resolve blockers']
const scenarios = [
  [6, 8, 0.75, 0.7560975609756098, 1900, 2700, 3200, 3200, 1100, 2300, 6, 2000, 'Resolve blockers'],
  [6, 8, 0.75, 0.7619047619047619, 1900, 2700, 3400, 3400, 1100, 2300, 6, 2000, 'Resolve blockers'],
  [6, 8, 0.75, 0.7619047619047619, 1900, 2700, 3400, 3400, 1100, 2300, 6, 2000, 'Review the mix'],
  [6, 8, 0.75, 0.7333333333333333, 1000, 1800, 3400, 3400, 1100, 2300, 6, 2000, 'Review the mix'],
  [6, 8, 0.75, 0.7333333333333333, 1000, 1800, 3400, 3400, 1100, 2300, 6, 2000, 'Review the mix'],
  [5, 8, 0.625, 0.5365853658536586, 1900, 2700, 1400, 3200, 1100, 2300, 5, 3800, 'Resolve blockers'],
  [5, 8, 0.625, 0.5365853658536586, 1900, 2700, 1400, 3200, 1100, 2300, 5, 3800, 'Resolve blockers'],
  [5, 8, 0.625, 0.5365853658536586, 1900, 2700, 1400, 3200, 1100, 2300, 5, 3800, 'Resolve blockers'],
  [5, 8, 0.625, 0.5176470588235295, 1900, 2700, 1400, 3200, 1100, 2600, 5, 4100, 'Resolve blockers'],
  [5, 8, 0.625, 0.5176470588235295, 1900, 2700, 1400, 3200, 1100, 2600, 5, 4100, 'Resolve blockers'],
  [5, 8, 0.625, '#DIV/0!', 0, 0, 0, 0, 0, 0, 5, 0, 'Resolve blockers'],
  [5, 8, 0.625, 0.5365853658536586, 1900, 2700, 1400, 3200, 1100, 2300, 5, 3800, 'Resolve blockers'],
]
const report = { passed: false, checks: [], knownIssues: [], errors: [], backendRequests: [] }
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 320, height: 1000 } })
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
    if (this.canvas.closest('[data-embed-slides-page-list-host]')) {
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
const root = page.locator('.violet-embed')
const settle = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
const results = () =>
  page.evaluate(
    (entries) =>
      entries.map(([p, id]) =>
        window.univerAPI.getPresentation('violet-editorial-deck').getSlideById(p).getShape(id).getFormulaResult(),
      ),
    specs,
  )
const source = () =>
  page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getBase('violet-editorial-register').save())))
const authored = () =>
  page.evaluate((entries) => {
    const data = window.univerAPI.getPresentation('violet-editorial-deck').save()
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
          .getPresentation('violet-editorial-deck')
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
  await root.locator('[data-u-comp="slide-thumbnail-item"][data-page-id="violet-launch-workstream-page"]').click()
  await page.locator('[data-embed-slides-page-list-host]').waitFor()
  await page.waitForFunction(() =>
    [...window.framesPaint.entries()].some(
      ([c, a]) =>
        c.isConnected &&
        c.closest('[data-embed-slides-page-list-host]') &&
        a.join('').includes('Repair a favourite cup'),
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
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4296', {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  })
  await page.waitForFunction(
    () =>
      document.querySelector('.violet-embed')?.dataset.ready || document.querySelector('.violet-embed')?.dataset.error,
    null,
    { timeout: 60000 },
  )
  assert.equal(await root.getAttribute('data-error'), null)
  assert.equal(await root.locator('iframe,fieldset,[data-action],[data-u-comp="embed-float-dom"]').count(), 0)
  await values(baseline)
  report.descriptor = await page.evaluate(() =>
    window.univerAPI.listEmbeds({ hostUnitId: 'violet-editorial-deck' })[0].getDescriptor(),
  )
  assert.equal(report.descriptor.entry, 'slides-page-list-block')
  assert.equal(report.descriptor.childUnitId, 'violet-editorial-register')
  await gate('compact-native-navigation', async () => {
    const before = await source()
    const layout = await authored()
    await page.evaluate(() => {
      window.compactOwner = window.univerAPI
    })
    const button = root.locator('.violet-page-navigation button')
    const painted = async (p) => {
      const actual = await results()
      const texts = specs.flatMap(([pageId], i) => (pageId === p ? [actual[i].displayText] : []))
      await page.waitForFunction(
        (wanted) =>
          [...window.framesPaint.entries()].some(([c, a]) => {
            const bounds = c.getBoundingClientRect()
            return (
              c.isConnected &&
              bounds.width >= innerWidth - 40 &&
              bounds.height > 300 &&
              !c.closest('[data-embed-id],[data-u-comp="slide-thumbnail-item"]') &&
              wanted.every((s) => a.join('').includes(s))
            )
          }),
        texts,
      )
    }
    // Initial narrow load must paint without navigating away and back.
    await painted('overview')
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 1000 })
      await button.getByText('Show pages', { exact: true }).waitFor()
      for (const p of ['overview', 'sections', 'decision']) {
        await button.focus()
        await page.keyboard.press('Enter')
        assert.equal(await button.getAttribute('aria-expanded'), 'true')
        await root.locator('[data-u-comp="slide-thumbnail-item"][data-page-id="' + p + '"]').click()
        await button.focus()
        await page.keyboard.press('Space')
        assert.equal(await button.getAttribute('aria-expanded'), 'false')
        await painted(p)
        assert.equal(await root.locator('[data-u-comp="slide-thumbnail-item"]').count(), 0)
        assert.equal(
          await page.evaluate(() => window.univerAPI.isUIVisible(window.univerAPI.Enum.BuiltInUIPart.LEFT_SIDEBAR)),
          false,
        )
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true)
        await page.screenshot({ path: path.join(directory, `compact-${width}-${p}.png`) })
      }
      assert.deepEqual(await source(), before)
      assert.deepEqual(await authored(), layout)
      assert.equal(await page.evaluate(() => window.compactOwner === window.univerAPI), true)
      await values(baseline)
    }
  })
  await page.setViewportSize({ width: 1700, height: 1100 })
  await root.locator('[data-u-comp="slide-thumbnail-item"][data-page-id="overview"]').waitFor()
  assert.equal(await root.locator('.violet-page-navigation').isVisible(), false)
  assert.equal(await root.locator('[data-u-comp="slide-thumbnail-item"]').count(), 4)
  const original = await authored()
  for (const p of ['overview', 'sections', 'decision']) await show(p, 'baseline-' + p)
  await openSource()
  await page.screenshot({ path: path.join(directory, 'editorial-data.png') })
  for (const [i, expected] of scenarios.entries()) {
    await openSource()
    await page.evaluate(examples[i])
    await values(expected)
    if (i === 3 || i === 4)
      assert.equal((await source()).tables.pieces.records['piece-1'].values.words, i === 3 ? null : 0)
    if (i === 6) {
      const saved = await source()
      assert.equal(saved.name, 'Violet / November editorial register')
      assert.equal(saved.tables.pieces.formulaName, 'Pieces')
      assert.equal(saved.tables.pieces.name, 'November articles')
    }
    if (i === 7 || i === 8) {
      const projection = await page.evaluate(() =>
        window.univerAPI
          .getBase('violet-editorial-register')
          .getTableById('pieces')
          .getViewById('pieces-grid')
          .getProjection(),
      )
      assert.deepEqual(
        projection.rows.map((r) => r.recordId),
        ['piece-1', 'piece-2', 'piece-3', 'piece-4', 'piece-5'],
      )
      assert.equal(Object.keys((await source()).tables.pieces.records).length, 8)
      report.checks.push({ projection, example: i + 1 })
    }
    assert.deepEqual(await authored(), original)
    for (const p of ['overview', 'sections', 'decision']) await show(p, 'example-' + (i + 1) + '-' + p)
    report.checks.push({ example: i + 1, expected, results: await results(), authoredPreserved: true })
  }
  await gate('off-page-source-write', async () => {
    await show('decision', 'off-page')
    await page.evaluate(examples[0])
    await values(scenarios[0])
    for (const p of ['overview', 'sections', 'decision']) await show(p, 'off-page-updated-' + p)
  })
  await openSource()
  await page.evaluate(examples[5])
  await values(baseline)
  await gate('native-base-title-history', async () => {
    const before = await source()
    const point = await page.evaluate(() => window.basePoints.findLast((p) => p.text === 'A quieter morning'))
    assert.ok(point)
    await page.mouse.dblclick(point.x + 30, point.y - 4)
    await page.keyboard.press('Control+A')
    await page.keyboard.type('A brighter morning')
    await page.keyboard.press('Enter')
    await page.waitForFunction(
      () =>
        window.univerAPI
          .getBase('violet-editorial-register')
          .getTableById('pieces')
          .getRecordById('piece-1')
          .getValue('title') === 'A brighter morning',
    )
    const edited = await source()
    await values(baseline)
    const child = page.locator('[data-embed-slides-page-list-host]')
    for (const [name, expected] of [
      ['Undo', before],
      ['Redo', edited],
    ]) {
      await child.getByRole('button', { name, exact: true }).click()
      await settle()
      assert.deepEqual(await source(), expected)
    }
    for (const p of ['overview', 'sections', 'decision']) await show(p, 'native-title-' + p)
    assert.deepEqual(await authored(), original)
  })
  await openSource()
  await gate('native-base-number-history', async () => {
    const point = await page.evaluate(() => window.basePoints.findLast((p) => p.text === '900.00'))
    assert.ok(point)
    const before = await source()
    await page.mouse.dblclick(point.x - 15, point.y - 4)
    await page.keyboard.press('Control+A')
    await page.keyboard.type('1200')
    await page.keyboard.press('Enter')
    const wanted = [5, 8, 0.625, 4700 / 8500, 2200, 3000, 1400, 3200, 1100, 2300, 5, 3800, 'Resolve blockers']
    await values(wanted)
    assert.equal((await source()).tables.pieces.records['piece-1'].values.words, 1200)
    const edited = await source()
    const child = page.locator('[data-embed-slides-page-list-host]')
    for (const [name, snapshot, expected] of [
      ['Undo', before, baseline],
      ['Redo', edited, wanted],
    ]) {
      await child.getByRole('button', { name, exact: true }).click()
      await settle()
      assert.deepEqual(await source(), snapshot)
      await values(expected)
    }
    for (const p of ['overview', 'sections', 'decision']) await show(p, 'native-number-' + p)
    assert.deepEqual(await authored(), original)
  })
  await gate('active-source-disposal', async () => {
    await openSource()
    await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
    await root.waitFor({ state: 'detached' })
    assert.equal(await page.evaluate(() => !!window.univerAPI), false)
    assert.equal(await page.locator('[data-embed-slides-page-list-host]').count(), 0)
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
  console.log(JSON.stringify(report, null, 2))
  await browser.close()
}
if (!report.passed) process.exitCode = 1
