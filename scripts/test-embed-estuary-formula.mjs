/* eslint-disable no-await-in-loop -- Run the published examples in their documented order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-estuary-formula')
await fs.mkdir(directory, { recursive: true })
const examples = [
  ...(await fs.readFile('showcase/embed/formula-customrange/README.md', 'utf8')).matchAll(
    /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
  ),
].map((m) => m[1])
assert.equal(examples.length, 6)
let server
let origin = process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4280'
if (process.argv[2]) {
  const manifest = JSON.parse(await fs.readFile(process.argv[2], 'utf8'))
  const entry = manifest.find(({ slug }) => slug === 'embed/formula-customrange')
  assert.ok(entry?.passed, 'A successful selected Estuary export is required')
  const vite = entry.links.find(({ name }) => name === 'vite')
  const pkg = JSON.parse(await fs.readFile(path.join(vite.target, 'package.json'), 'utf8'))
  assert.equal(pkg.version, vite.version)
  const { preview } = await import(pathToFileURL(path.join(vite.target, 'dist/node/index.js')))
  server = await preview({
    root: entry.directory,
    configFile: false,
    preview: { host: '127.0.0.1', port: 4448, strictPort: true },
  })
  origin = 'http://127.0.0.1:4448'
}
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
    const frame = window.docFrames.get(this.canvas) || []
    frame.push(String(args[0]))
    window.docFrames.set(this.canvas, frame)
    return Reflect.apply(fill, this, args)
  }
})
const body = () => page.evaluate(() => window.univerAPI.getDocument('estuary-field-brief').save().body)
const results = () =>
  page.evaluate(() =>
    window.univerAPI
      .getDocument('estuary-field-brief')
      .getFormulas()
      .map((f) => f.getResult()),
  )
const settle = () =>
  page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
async function values(funding, spending) {
  const expected = [funding, spending, funding - spending, funding ? spending / funding : '#DIV/0!']
  await page.waitForFunction(
    (targets) => {
      const actual = window.univerAPI
        .getDocument('estuary-field-brief')
        .getFormulas()
        .map((f) => f.getResult())
      return (
        actual.length === 4 &&
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
  await page.waitForFunction(
    (expectedFunding) =>
      window.univerAPI.getWorkbook('estuary-funding-model').save().sheets.funding.cellData[9][1].v === expectedFunding,
    funding,
  )
  if (!funding) {
    const result = (await results())[3]
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
          canvas.isConnected && canvas.width > 700 && targets.every((text) => frame.join('').includes(text)),
      ),
    texts,
  )
  await page.screenshot({ path: path.join(directory, name + '.png') })
}
async function expandBase() {
  const block = page.locator('[data-u-comp="embed-float-dom"][data-embed-id="estuary-base-block"]')
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
        .querySelector('[data-embed-id="estuary-base-block"][data-u-comp="embed-float-dom"]')
        ?.getAttribute('data-embed-float-stage') === 'stage2',
  )
  await page
    .locator('[data-u-comp="embed-float-dom-chrome"][data-embed-id="estuary-base-block"]')
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
  await page.goto(origin, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  })
  await page.waitForFunction(
    () => {
      const root = document.querySelector('.estuary-embed')
      return root?.dataset.ready === 'true' || root?.dataset.ready === 'error'
    },
    null,
    { timeout: 60000 },
  )
  assert.equal(await page.locator('.estuary-embed').getAttribute('data-error'), null)
  assert.equal(await page.locator('.estuary-embed').getAttribute('data-ready'), 'true')
  assert.equal(await page.evaluate(() => window.univerAPI.getCurrentLocale()), 'enUS')
  assert.equal(await page.locator('[data-u-comp="embed-float-dom"]').count(), 2)
  await values(16000, 9800)
  const originalBody = await body()
  await showNarrative('baseline')
  report.checks.push('Two native source blocks; four live inline results visible in the document canvas')
  const states = [
    [17500, 9800],
    [17500, 10400],
    [0, 10400],
    [16000, 10400],
    [16000, 9800],
  ]
  for (const [i, expected] of states.entries()) {
    if (i === 1 || i === 4) await expandBase()
    await page.evaluate(examples[i])
    await values(...expected)
    assert.deepEqual(
      await body(),
      originalBody,
      'Source changes preserve every body character, paragraph, style and custom range',
    )
    if (i === 1 || i === 4) await collapse()
    await showNarrative('example-' + (i + 1))
    report.checks.push('Literal example ' + (i + 1) + ': correct values, unchanged body, visible native rendering')
  }
  await page.evaluate(examples[5])
  const projection = await page.evaluate(() => {
    const doc = window.univerAPI.getDocument('estuary-field-brief')
    const nativeBefore = doc.save()
    const display = doc.saveFormulaDisplayTextSnapshot()
    return { nativeBefore, nativeAfter: doc.save(), projection: display }
  })
  assert.deepEqual(projection.nativeAfter, projection.nativeBefore)
  assert.ok(!projection.projection.body.dataStream.includes('\uFFFC'))
  for (const value of ['16,000.00', '9,800.00', '6,200.00', '61.25%'])
    assert.ok(projection.projection.body.dataStream.includes(value))
  report.checks.push('Sixth literal example and detached display-text snapshot preserve live bindings')
  await expandBase()
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
  await page.locator('.estuary-embed').waitFor({ state: 'detached' })
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
  await server?.close()
}
console.log(JSON.stringify(report, null, 2))
if (!report.passed) process.exitCode = 1
