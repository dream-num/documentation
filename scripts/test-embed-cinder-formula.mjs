/* eslint-disable no-await-in-loop -- Run the published examples in their documented order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-cinder-formula')
await fs.mkdir(directory, { recursive: true })
const examples = [
  ...(await fs.readFile('showcase/embed/base-to-modern-doc/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((m) => m[1])
assert.equal(examples.length, 17)
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1700, height: 1100 } })
page.setDefaultTimeout(15000)
const report = { passed: false, checks: [], results: [], knownIssues: [], errors: [], backendRequests: [] }
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
  window.docFrames = new Map()
  window.basePoints = []
  const fill = CanvasRenderingContext2D.prototype.fillText,
    clear = CanvasRenderingContext2D.prototype.clearRect
  const drawImage = CanvasRenderingContext2D.prototype.drawImage
  // The native document renderer caches text on offscreen canvases before composition.
  CanvasRenderingContext2D.prototype.drawImage = function (source, ...args) {
    const texts = window.docFrames.get(this.canvas) || []
    texts.push(...(window.docFrames.get(source) || []))
    window.docFrames.set(this.canvas, texts)
    return Reflect.apply(drawImage, this, [source, ...args])
  }
  CanvasRenderingContext2D.prototype.clearRect = function (...args) {
    window.docFrames.set(this.canvas, [])
    return Reflect.apply(clear, this, args)
  }
  CanvasRenderingContext2D.prototype.fillText = function (...args) {
    if (this.canvas.closest('[data-embed-fullscreen-shell="true"]')) {
      const point = this.getTransform().transformPoint({ x: args[1], y: args[2] })
      const bounds = this.canvas.getBoundingClientRect()
      if (bounds.width > 300)
        window.basePoints.push({
          text: String(args[0]),
          x: bounds.x + (point.x * bounds.width) / this.canvas.width,
          y: bounds.y + (point.y * bounds.height) / this.canvas.height,
        })
    }
    const frame = window.docFrames.get(this.canvas) || []
    frame.push(String(args[0]))
    window.docFrames.set(this.canvas, frame)
    return Reflect.apply(fill, this, args)
  }
})
const body = () => page.evaluate(() => window.univerAPI.getDocument('cinder-incident-brief').save().body)
const results = () =>
  page.evaluate(() =>
    window.univerAPI
      .getDocument('cinder-incident-brief')
      .getFormulas()
      .map((f) => f.getResult()),
  )
const settle = () =>
  page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
async function values(expected) {
  await page.waitForFunction(
    (targets) => {
      const actual = window.univerAPI
        .getDocument('cinder-incident-brief')
        .getFormulas()
        .map((f) => f.getResult())
      return (
        actual.length === 10 &&
        actual.every(
          (r, i) =>
            !r.stale &&
            (typeof targets[i] === 'string'
              ? r.value === targets[i]
              : r.status === 'success' && Math.abs(r.value - targets[i]) < 1e-9),
        )
      )
    },
    expected,
    { timeout: 30000 },
  )
  report.results.push(await results())
  if (expected[8] === '#DIV/0!') {
    const result = (await results())[8]
    if (result.status !== 'error')
      report.knownIssues.push({ gate: 'native-error-status', expected: 'error', actual: result })
  }
}
async function showNarrative(name) {
  await page.mouse.move(1300, 500)
  await page.mouse.wheel(0, -20000)
  await settle()
  const texts = (await results()).map((r) => r.text)
  await page.waitForFunction(
    (targets) =>
      [...window.docFrames.entries()].some(
        ([canvas, frame]) =>
          canvas.isConnected &&
          !canvas.closest('[data-u-comp="embed-float-dom"]') &&
          canvas.width > 700 &&
          targets.every((text) => frame.join('').includes(text)),
      ),
    texts,
  )
  await page.screenshot({ path: path.join(directory, name + '.png') })
}
async function expandBase() {
  const block = page.locator('[data-u-comp="embed-float-dom"][data-embed-id="cinder-base-block"]')
  for (let i = 0; i < 20; i++) {
    const rect = await block.boundingBox()
    assert.ok(rect)
    if (rect.y >= 160 && rect.y + 180 < 1030) break
    await page.mouse.move(1350, 550)
    await page.mouse.wheel(0, rect.y - 280)
    await settle()
  }
  const rect = await block.boundingBox()
  await page.mouse.dblclick(rect.x + 180, rect.y + 110)
  await page.waitForFunction(
    () =>
      document
        .querySelector('[data-embed-id="cinder-base-block"][data-u-comp="embed-float-dom"]')
        ?.getAttribute('data-embed-float-stage') === 'stage2',
  )
  await page
    .locator('[data-u-comp="embed-float-dom-chrome"][data-embed-id="cinder-base-block"]')
    .getByRole('button', { name: 'Enter fullscreen', exact: true })
    .click()
  await page.locator('[data-embed-fullscreen-shell="true"]').waitFor()
  await settle()
}
async function collapse() {
  const shell = page.locator('[data-embed-fullscreen-shell="true"]')
  await shell.getByRole('button', { name: 'Exit fullscreen', exact: true }).click()
  await shell.waitFor({ state: 'detached' })
  await settle()
}
try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4300', {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  })
  await page.waitForFunction(
    () => {
      const root = document.querySelector('.cinder-embed')
      return root?.dataset.ready || root?.dataset.error
    },
    null,
    { timeout: 60000 },
  )
  assert.equal(await page.locator('.cinder-embed').getAttribute('data-error'), null)
  assert.equal(await page.locator('[data-u-comp="embed-float-dom"]').count(), 1)
  const baseline = [8, 3, 2, 3, 180, 40, 300, 0.375, 60, 'Investigation continues']
  const states = [
    [8, 2, 2, 4, 165, 40, 300, 0.5, 82.5, 'Investigation continues'],
    [8, 2, 2, 4, 195, 40, 330, 0.5, 97.5, 'Investigation continues'],
    [8, 1, 3, 4, 45, 190, 330, 0.5, 45, 'Investigation continues'],
    [8, 1, 3, 4, 0, 190, 285, 0.5, 0, 'Investigation continues'],
    [8, 1, 3, 4, 0, 190, 285, 0.5, 0, 'Investigation continues'],
    [8, 3, 2, 3, 180, 40, 300, 0.375, 60, 'Investigation continues'],
    [8, 3, 2, 3, 180, 40, 300, 0.375, 60, 'Investigation continues'],
    [8, 3, 2, 3, 180, 40, 300, 0.375, 60, 'Investigation continues'],
    [8, 3, 2, 3, 180, 40, 330, 0.375, 60, 'Investigation continues'],
    [8, 3, 2, 3, 180, 40, 330, 0.375, 60, 'Investigation continues'],
    [8, 0, 0, 8, 0, 0, 330, 1, '#DIV/0!', 'No open investigations'],
    [8, 3, 2, 3, 180, 40, 300, 0.375, 60, 'Investigation continues'],
  ]
  await values(baseline)
  const originalBody = await body()
  const binding = await page.evaluate(() => {
    const resource = window.univerAPI
      .getDocument('cinder-incident-brief')
      .save()
      .resources.find((r) => r.name === 'UNIVER_EXTERNAL_REFERENCE_PLUGIN')
    return Object.values(JSON.parse(resource.data).references)
  })
  assert.equal(binding.length, 1)
  assert.deepEqual(binding[0], {
    qualifier: 'Cinder Incidents',
    sourceUnitId: 'cinder-incident-register',
    sourceUnitType: 5,
  })
  await showNarrative('baseline')
  report.checks.push('One native Base block and ten live inline results on the current document canvas')
  for (const [i, expected] of states.entries()) {
    await expandBase()
    await page.evaluate(examples[i])
    await values(expected)
    const source = await page.evaluate(() => window.univerAPI.getBase('cinder-incident-register').save())
    if (i === 3 || i === 4)
      assert.equal(source.tables.incidents.records['incident-2'].values.sessions, i === 3 ? null : 0)
    if (i === 6) {
      assert.equal(source.name, 'Cinder Incidents')
      assert.equal(source.tables.incidents.name, 'Incidents')
      assert.equal(source.tables.incidents.formulaName, 'Incidents')
      assert.equal(source.tables.incidents.records['incident-1'].values.owner, 'Mara / next shift')
    }
    if (i === 7 || i === 8) {
      const projection = await page.evaluate(() =>
        window.univerAPI
          .getBase('cinder-incident-register')
          .getTableById('incidents')
          .getViewById('incidents-grid')
          .getProjection(),
      )
      assert.deepEqual(
        projection.rows.map((row) => row.recordId),
        ['incident-1', 'incident-2', 'incident-3'],
      )
      assert.equal(Object.keys(source.tables.incidents.records).length, 8)
    }
    assert.deepEqual(await body(), originalBody, 'Source edits preserve the complete authored document body')
    await collapse()
    await showNarrative('example-' + (i + 1))
    report.checks.push({ example: i + 1, expected, currentCanvasVerified: true, authoredBodyPreserved: true })
  }
  await page.evaluate(examples[12])
  const projection = await page.evaluate(() => {
    const doc = window.univerAPI.getDocument('cinder-incident-brief')
    const nativeBefore = doc.save()
    return { nativeBefore, projection: doc.saveFormulaDisplayTextSnapshot(), nativeAfter: doc.save() }
  })
  assert.deepEqual(projection.nativeAfter, projection.nativeBefore)
  for (const value of ['180', '40', '300', '37.5%', '60.0', 'Investigation continues'])
    assert.ok(projection.projection.body.dataStream.includes(value), value)
  assert.equal(
    await page.evaluate(() => window.univerAPI.getDocument('cinder-incident-brief').getFormulas().length),
    10,
  )
  report.checks.push({ example: 13, detachedProjectionPreservesLiveBindings: true })
  await expandBase()
  const source = () =>
    page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getBase('cinder-incident-register').save())))
  try {
    const before = await source()
    const point = await page.evaluate(() => window.basePoints.findLast((p) => p.text === '120' || p.text === '120.00'))
    assert.ok(point, 'Native session cell must have painted in the fullscreen Base')
    await page.mouse.dblclick(point.x - 15, point.y - 4)
    await page.keyboard.press('Control+A')
    await page.keyboard.type('140')
    await page.keyboard.press('Enter')
    const wanted = [8, 3, 2, 3, 200, 40, 320, 0.375, 200 / 3, 'Investigation continues']
    await values(wanted)
    assert.equal((await source()).tables.incidents.records['incident-1'].values.sessions, 140)
    const edited = await source()
    for (const [name, snapshot, expected] of [
      ['Undo', before, baseline],
      ['Redo', edited, wanted],
    ]) {
      await page.locator('[data-embed-fullscreen-shell="true"]').getByRole('button', { name, exact: true }).click()
      await settle()
      assert.deepEqual(await source(), snapshot)
      await values(expected)
    }
    report.checks.push({ gate: 'native-session-history-same-scope', passed: true })
    await collapse()
    await showNarrative('native-sessions')
    assert.deepEqual(await body(), originalBody)
    report.checks.push({ gate: 'native-session-input', passed: true, currentCanvasVerified: true })
    await expandBase()
    for (const [name, snapshot, expected] of [
      ['Undo', before, baseline],
      ['Redo', edited, wanted],
    ]) {
      await page.locator('[data-embed-fullscreen-shell="true"]').getByRole('button', { name, exact: true }).click()
      await settle()
      assert.deepEqual(await source(), snapshot)
      await values(expected)
    }
    report.checks.push({ gate: 'native-session-history-after-reentry', passed: true })
  } catch (error) {
    report.knownIssues.push({ gate: 'native-session-editing-history', error: error.stack })
    await page.screenshot({ path: path.join(directory, 'native-session-failure.png') })
  }
  // A failed Undo may target the host. Isolate the rename/disposal gates on a fresh owner.
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.locator('.cinder-embed[data-ready=true]').waitFor({ timeout: 60000 })
  await values(baseline)
  const beforeRenameBody = await body()
  await expandBase()
  await page.evaluate(examples[13])
  await settle()
  try {
    await values([8, 3, 2, 3, 181, 40, 301, 0.375, 181 / 3, 'Investigation continues'])
    await collapse()
    await showNarrative('source-renamed')
    assert.deepEqual(await body(), beforeRenameBody)
    const afterBinding = await page.evaluate(() => {
      const resource = window.univerAPI
        .getDocument('cinder-incident-brief')
        .save()
        .resources.find((r) => r.name === 'UNIVER_EXTERNAL_REFERENCE_PLUGIN')
      return Object.values(JSON.parse(resource.data).references)
    })
    assert.deepEqual(afterBinding, binding)
    report.checks.push({
      example: 14,
      sourceRenameLiveUpdate: true,
      currentCanvasVerified: true,
      sourceBindingPreserved: true,
    })
  } catch (error) {
    report.knownIssues.push({ gate: 'source-rename-live-update', error: error.message, actual: await results() })
    await page.screenshot({ path: path.join(directory, 'source-rename-failure.png') })
  }
  const beforeIdempotent = await page.evaluate(() => window.univerAPI.getDocument('cinder-incident-brief').save())
  await page.evaluate(examples[14])
  assert.deepEqual(
    await page.evaluate(() => window.univerAPI.getDocument('cinder-incident-brief').save()),
    beforeIdempotent,
  )
  report.checks.push({ example: 15, idempotentBindingPreservesFullDocument: true })
  if (!(await page.locator('[data-embed-fullscreen-shell="true"]').count())) await expandBase()
  await page.evaluate(examples[15])
  await page.waitForFunction(() => {
    const entries = window.univerAPI
      .getDocument('cinder-incident-brief')
      .getFormulas()
      .map((f) => f.getResult())
    return (
      entries.length === 10 &&
      entries.every((r) => !r.stale) &&
      entries.some((r) => r.value === '#REF!' || r.value === '#VALUE!')
    )
  })
  assert.equal((await source()).tables.incidents.records['incident-1'].values.sessions, 122)
  const unbound = await results()
  if (unbound.some((r) => ['#REF!', '#VALUE!'].includes(r.value) && r.status !== 'error'))
    report.knownIssues.push({ gate: 'missing-binding-error-status', actual: unbound })
  await collapse()
  await showNarrative('binding-removed')
  assert.deepEqual(await body(), beforeRenameBody)
  report.checks.push({ example: 16, nativeMissingBindingVisible: true, currentCanvasVerified: true })
  await expandBase()
  await page.evaluate(examples[16])
  await values([8, 3, 2, 3, 183, 40, 303, 0.375, 61, 'Investigation continues'])
  await collapse()
  await showNarrative('binding-repaired')
  assert.deepEqual(await body(), beforeRenameBody)
  report.checks.push({ example: 17, liveBindingRecovery: true, currentCanvasVerified: true })
  await expandBase()
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
  await page.locator('.cinder-embed').waitFor({ state: 'detached' })
  await settle()
  assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
  assert.equal(await page.locator('[data-embed-fullscreen-shell="true"]').count(), 0)
  report.checks.push('Active native Base fullscreen disposal releases the host, child shell and API owner')
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.backendRequests, [])
  report.passed = report.knownIssues.length === 0
} catch (error) {
  report.failure = error.stack
  report.currentResults = await results().catch(() => [])
  report.canvasFrames = await page
    .evaluate(() =>
      [...window.docFrames.entries()].map(([canvas, texts]) => ({
        connected: canvas.isConnected,
        width: canvas.width,
        height: canvas.height,
        text: texts.join(''),
      })),
    )
    .catch(() => [])
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
}
console.log(JSON.stringify(report, null, 2))
if (!report.passed) process.exitCode = 1
