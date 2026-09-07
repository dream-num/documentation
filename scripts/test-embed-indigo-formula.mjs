/* eslint-disable no-await-in-loop -- The published examples intentionally mutate one shared portfolio in order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-indigo-formula')
await fs.mkdir(directory, { recursive: true })
const examples = [
  ...(await fs.readFile('showcase/embed/slides-in-bases-formula-tab/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((m) => m[1])
assert.equal(examples.length, 14)
const specs = [
  ['overview', 'total'],
  ['overview', 'count'],
  ['overview', 'average'],
  ...[0, 1, 2].flatMap((i) => [
    ['allocation', 'amount-' + i],
    ['allocation', 'share-' + i],
  ]),
  ['concentration', 'largest'],
  ['concentration', 'share'],
  ['concentration', 'signal'],
]
// Independent expected arithmetic only in the test, never in the presentation renderer.
function expected(amounts) {
  const total = amounts.reduce((a, b) => a + b, 0),
    largest = Math.max(...amounts)
  return [
    total,
    3,
    total / 3,
    ...amounts.flatMap((n) => [n, total ? n / total : '#DIV/0!']),
    largest,
    total ? largest / total : '#DIV/0!',
    total ? (largest / total > 0.5 ? 'Review concentration' : 'No project above half') : '#DIV/0!',
  ]
}
const baseline = expected([15000, 22000, 8000])
const extended = expected([15000, 22000, 10000])
const states = [
  extended,
  expected([15000, 30000, 10000]),
  expected([15000, 30000, 10000]),
  expected([15000, 30000, 10000]),
  expected([18000, 30000, 10000]),
  expected([18000, 30000, 0]),
  expected([18000, 30000, 0]),
  expected([0, 0, 0]),
  baseline,
  baseline,
  extended,
  null,
  extended,
  extended,
]
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
    if (this.canvas.closest('.indigo-embed') && !this.canvas.closest('[data-embed-bases-table-list-host]')) {
      const p = this.getTransform().transformPoint({ x: args[1], y: args[2] }),
        b = this.canvas.getBoundingClientRect()
      if (b.width > 300)
        window.basePoints.push({
          text: String(args[0]),
          x: b.x + (p.x * b.width) / this.canvas.width,
          y: b.y + (p.y * b.height) / this.canvas.height,
        })
    }
    return Reflect.apply(fill, this, args)
  }
})
const root = page.locator('.indigo-embed')
const child = root.locator('[data-embed-bases-table-list-host="indigo-portfolio-tab"]')
const settle = () => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
const source = () => page.evaluate(() => window.univerAPI.getBase('indigo-community-portfolio').save())
const presentation = () => page.evaluate(() => window.univerAPI.getPresentation('indigo-allocation-review').save())
const results = () =>
  page.evaluate(
    (entries) =>
      entries.map(([p, id]) =>
        window.univerAPI.getPresentation('indigo-allocation-review').getSlideById(p).getShape(id).getFormulaResult(),
      ),
    specs,
  )
const authored = () =>
  page.evaluate(() => {
    const data = JSON.parse(JSON.stringify(window.univerAPI.getPresentation('indigo-allocation-review').save()))
    for (const slide of Object.values(data.slides))
      for (const e of Object.values(slide.elements || {}))
        if (e.shapeData?.formulaBinding) delete e.shapeData.formulaBinding.lastValue
    return { slides: data.slides, slideOrder: data.slideOrder, size: data.defaultPageSize }
  })
async function values(wanted, label) {
  await page.waitForFunction(
    ({ entries, wanted: targets }) =>
      entries.every(([p, id], i) => {
        const r = window.univerAPI
          .getPresentation('indigo-allocation-review')
          .getSlideById(p)
          .getShape(id)
          .getFormulaResult()
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
    { entries: specs, wanted },
    { timeout: 30000 },
  )
  const actual = await results()
  for (const [i, r] of actual.entries()) {
    const status = wanted === null || (typeof wanted[i] === 'string' && wanted[i].startsWith('#')) ? 'error' : 'success'
    if (r.status !== status)
      report.knownIssues.push({ gate: 'native-result-status', label, shape: specs[i], expected: status, actual: r })
  }
  return actual
}
async function openSource() {
  await root.getByText('Project register', { exact: true }).click()
  await page.waitForFunction(() => window.univerAPI.getBaseUI().getActiveTableId() === 'projects')
  await settle()
}
async function openPresentation() {
  await root.getByText('Portfolio review', { exact: true }).click()
  await child.waitFor()
  await root.locator('[data-u-comp="slide-thumbnail-item"]').first().waitFor()
}
async function painted(id) {
  const actual = await results(),
    wanted = specs.flatMap(([p], i) => (p === id ? [actual[i].displayText] : []))
  await page.waitForFunction(
    (texts) =>
      [...window.framesPaint.entries()].some(([c, a]) => {
        const b = c.getBoundingClientRect()
        return (
          c.isConnected &&
          b.width > 600 &&
          b.height > 200 &&
          c.closest('[data-embed-bases-table-list-host]') &&
          !c.closest('[data-u-comp="slide-thumbnail-item"]') &&
          texts.every((s) => a.join('').includes(s))
        )
      }),
    wanted,
    { timeout: 15000 },
  )
}
async function show(id, name) {
  await root.locator('[data-u-comp="slide-thumbnail-item"][data-page-id="' + id + '"]').click()
  await settle()
  await painted(id)
  await page.mouse.move(1690, 1090)
  await page.screenshot({ path: path.join(directory, name + '.png') })
}
async function gate(name, run) {
  try {
    await run()
    report.checks.push({ gate: name, passed: true })
    return true
  } catch (e) {
    report.knownIssues.push({ gate: name, error: e.stack })
    await page.screenshot({ path: path.join(directory, name + '-failure.png') })
    return false
  }
}
function includesPack(actual, pack) {
  for (const [key, value] of Object.entries(pack))
    if (value && typeof value === 'object') includesPack(actual?.[key], value)
    else assert.equal(actual?.[key], value, key)
}
try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4314', {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  })
  await page.waitForFunction(
    () =>
      document.querySelector('.indigo-embed')?.dataset.ready || document.querySelector('.indigo-embed')?.dataset.error,
    null,
    { timeout: 60000 },
  )
  assert.equal(await root.getAttribute('data-error'), null)
  report.descriptor = await page.evaluate(() =>
    window.univerAPI.listEmbeds({ hostUnitId: 'indigo-community-portfolio' })[0].getDescriptor(),
  )
  assert.equal(report.descriptor.entry, 'bases-table-list-block')
  assert.equal(report.descriptor.childUnitId, 'indigo-allocation-review')
  assert.equal(report.descriptor.hostAnchorId, 'indigo-portfolio-tab')
  assert.deepEqual((await source()).tableOrder, ['projects', 'indigo-portfolio-tab'])
  assert.equal(await root.locator('iframe,fieldset,details,[data-action],[data-u-comp="embed-float-dom"]').count(), 0)
  await values(baseline, 'baseline')
  const original = await authored()
  await page.screenshot({ path: path.join(directory, 'source-baseline.png') })
  await openPresentation()
  assert.ok(await root.locator('[data-u-comp="ribbon-grid-toolbar"]').count())
  for (const id of ['overview', 'allocation', 'concentration']) await show(id, 'baseline-' + id)
  for (const [i, wanted] of states.entries()) {
    await openSource()
    await page.evaluate(examples[i])
    const actual = await values(wanted, 'example-' + (i + 1))
    if (i === 5 || i === 6)
      assert.equal((await source()).tables.projects.records['project-3'].values.allocation, i === 5 ? null : 0)
    if (i >= 3 && i <= 8) {
      const projection = await page.evaluate(() =>
        window.univerAPI
          .getBase('indigo-community-portfolio')
          .getTableById('projects')
          .getViewById('projects-grid')
          .getProjection(),
      )
      assert.deepEqual(
        projection.rows.map((r) => r.recordId),
        ['project-2', 'project-3'],
      )
      assert.equal(Object.keys((await source()).tables.projects.records).length, 3)
    }
    if (i === 10) {
      assert.equal((await source()).name, 'Indigo / Reviewed community portfolio')
      assert.equal((await source()).tables.projects.formulaName, 'Projects')
    }
    assert.deepEqual(await authored(), original)
    await openPresentation()
    for (const id of ['overview', 'allocation', 'concentration']) await show(id, 'example-' + (i + 1) + '-' + id)
    report.checks.push({ example: i + 1, results: actual, authoredPreserved: true })
    console.log('Indigo example ' + (i + 1) + ' current canvases passed')
  }
  const returned = await gate('off-page-source-write-and-return', async () => {
    await page.evaluate(examples[1])
    await values(expected([15000, 30000, 10000]), 'off-page')
    // The currently visible slide must update before any navigation or refresh.
    await painted('concentration')
    assert.equal(await page.evaluate(() => window.univerAPI.getBaseUI().getActiveTableId()), 'indigo-portfolio-tab')
    report.checks.push('Off-page source write paints the active child page without navigation or refresh')
    for (const id of ['overview', 'allocation', 'concentration']) await show(id, 'off-page-' + id)
    assert.deepEqual(await authored(), original)
    // Fresh calculation alone is insufficient: the real navigation must still work.
    await openSource()
  })
  if (!returned) {
    // Retain a failed navigation gate, then isolate the remaining native-input checks.
    // This fallback does not count as saved-state recovery or a passing navigation path.
    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.waitForFunction(() => document.querySelector('.indigo-embed')?.dataset.ready, null, { timeout: 60000 })
    report.checks.push('Fresh source reload isolates native editing from the retained off-page navigation failure')
  } else {
    report.checks.push('Native return and subsequent source editing continue in the same owner without reload')
  }
  await openSource()
  await page.evaluate(examples[8])
  await values(baseline, 'before-native-input')
  const freshOriginal = await authored()
  // The fresh page's initial paint supplies current coordinates. A resize may
  // only blit the cached Base canvas and therefore need not emit fillText again.
  await page.waitForFunction(() => window.basePoints.some((p) => p.text.replaceAll(',', '') === '22000'))
  const point = await page.evaluate(() => window.basePoints.findLast((p) => p.text.replaceAll(',', '') === '22000'))
  const beforeType = await source()
  // The numeric glyph anchor is right-aligned: click inside, not at the next field boundary.
  await page.mouse.dblclick(point.x - 20, point.y - 4)
  await page.keyboard.press('Control+A')
  await page.keyboard.type('24000')
  await page.keyboard.press('Enter')
  await values(expected([15000, 24000, 8000]), 'native-input')
  assert.equal((await source()).tables.projects.records['project-2'].values.allocation, 24000)
  const afterType = await source()
  await page.screenshot({ path: path.join(directory, 'native-input.png') })
  await gate('native-value-history', async () => {
    await page.keyboard.press('Control+z')
    await values(baseline, 'undo')
    assert.deepEqual(await source(), beforeType)
    await page.keyboard.press('Control+y')
    await values(expected([15000, 24000, 8000]), 'redo')
    assert.deepEqual(await source(), afterType)
  })
  await openPresentation()
  for (const id of ['overview', 'allocation', 'concentration']) await show(id, 'native-updated-' + id)
  // This is a new source load, not restoration: compare its generated rich-text
  // paragraph IDs against its own baseline, without dropping any authored fields.
  assert.deepEqual(await authored(), freshOriginal)
  report.checks.push('Native Base keyboard22000->24000 updates all three output canvases')
  for (const [locale, code] of [
    ['en-US', 'enUS'],
    ['zh-CN', 'zhCN'],
  ]) {
    await page.evaluate((value) => window.univerAPI.setLocale(value), code)
    for (const pack of ['bases', 'bases-ui', 'slides-ui', 'shape-editor-ui', 'embed-ui', 'embed-unit-ui'])
      includesPack(
        await page.evaluate(() => window.univerAPI.getLocales()),
        (await import('@univerjs-pro/' + pack + '/locale/' + locale)).default,
      )
    for (const pack of ['design', 'docs-ui', 'ui'])
      includesPack(
        await page.evaluate(() => window.univerAPI.getLocales()),
        (await import('@univerjs/' + pack + '/locale/' + locale)).default,
      )
    const snapshot = { base: await source(), slides: await presentation() }
    await page.evaluate(() => {
      window.indigoOwner = window.univerAPI
      window.univerAPI.toggleDarkMode(true)
    })
    await settle()
    await page.evaluate(() => window.univerAPI.toggleDarkMode(false))
    await settle()
    assert.deepEqual({ base: await source(), slides: await presentation() }, snapshot)
    assert.equal(await page.evaluate(() => window.indigoOwner === window.univerAPI), true)
    await page.screenshot({ path: path.join(directory, 'locale-' + locale + '.png') })
    report.checks.push({ locale, wholePacks: 9, themeModelsPreserved: true })
  }
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
  await root.waitFor({ state: 'detached' })
  await settle()
  assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
  report.checks.push('Active child-tab disposal releases owned roots and global API')
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.backendRequests, [])
  report.passed = report.knownIssues.length === 0 && report.warnings.length === 0
} catch (e) {
  report.failure = e.stack
  report.lastResults = await results().catch(() => [])
  report.lastSource = await source().catch(() => null)
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(
    JSON.stringify(
      {
        ...report,
        checks: report.checks.map((c) => (typeof c === 'string' ? c : { ...c, results: undefined })),
        lastSource: undefined,
      },
      null,
      2,
    ),
  )
  await browser.close()
}
if (!report.passed) process.exitCode = 1
