/* eslint-disable no-await-in-loop -- One active host/child and theme state must be exercised in order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

const { createServer } = await import(pathToFileURL(process.env.SHOWCASE_VITE_MODULE).href)
const codeRoot = 'showcase/embed/boards-in-slides-float/code'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-board-slide-float')
await fs.mkdir(directory, { recursive: true })
const sources = (
  await Promise.all(['create-demo.ts', 'data.ts'].map((name) => fs.readFile(`${codeRoot}/${name}`, 'utf8')))
).join('\n')
const dependencies = [
  ...new Set(
    [...sources.matchAll(/(?:from\s*|import\s*)['"](@[^'"]+)['"]/g)]
      .map((match) => match[1])
      .filter((name) => !name.endsWith('.css')),
  ),
]
const server = process.env.SHOWCASE_ORIGIN
  ? null
  : await createServer({
      configFile: false,
      root: process.cwd(),
      appType: 'custom',
      cacheDir: path.resolve('test-results/embed-board-slide-float/.vite'),
      optimizeDeps: { noDiscovery: true, include: dependencies },
      server: { host: '127.0.0.1', port: 4231, strictPort: true, watch: { ignored: ['**/.next/**'] } },
      plugins: [
        {
          name: 'one-embed-only',
          configureServer(vite) {
            vite.middlewares.use((request, response, next) => {
              if (request.url !== '/') return next()
              response.setHeader('Content-Type', 'text/html')
              response.end(
                `<html><head><link rel="icon" href="data:,"></head><body style="margin:0"><div id="app" style="height:100vh"></div><script type="module">import {createDemo} from '/${codeRoot}/create-demo.ts';window.demo=createDemo(document.getElementById('app'));window.addEventListener('pagehide',()=>window.demo.dispose(),{once:true});</script></body></html>`,
              )
            })
          },
        },
      ],
    })
await server?.listen()
const browser = await chromium.launch()
const page = await browser.newPage({
  viewport: { width: Number(process.env.SHOWCASE_VIEWPORT_WIDTH || 1220), height: 1200 },
})
const report = { passed: false, checks: [], errors: [], backendRequests: [], gates: {} }
page.on('requestfailed', (request) => report.errors.push(`${request.url()}: ${request.failure()?.errorText}`))
page.on('pageerror', (error) => report.errors.push(error.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
})
await page.addInitScript(() => {
  window.startupFailure = null
  window.addEventListener('error', (event) => {
    window.startupFailure = event.message
  })
  window.painted = []
  window.paintPoints = []
  const fill = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (...args) {
    window.painted.push(String(args[0]))
    const point = this.getTransform().transformPoint({ x: args[1], y: args[2] })
    const bounds = this.canvas.getBoundingClientRect()
    if (this.canvas.closest('[data-u-comp="embed-float-dom"]') && bounds.width > 300) {
      window.paintPoints.push({
        text: String(args[0]),
        x: bounds.x + (point.x * bounds.width) / this.canvas.width,
        y: bounds.y + (point.y * bounds.height) / this.canvas.height,
      })
      if (window.paintPoints.length > 10000) window.paintPoints.splice(0, 5000)
    }
    return Reflect.apply(fill, this, args)
  }
})
const settle = () =>
  page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))

page.on('request', (request) => {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method()) || request.url().includes('/universer-api/'))
    report.backendRequests.push({ method: request.method(), url: request.url() })
})
const root = page.locator('.beacon-embed')
const readHost = () => page.evaluate(() => window.univerAPI.getPresentation('beacon-observatory-review').save())
// Compare the serialized save contract; native geometry undo can add undefined flip flags.
const readChild = () =>
  page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getBoard('beacon-ingestion-boundaries').save())))
const textOf = () =>
  page.evaluate(() =>
    window.univerAPI.getBoard('beacon-ingestion-boundaries').getShape('quarantine').getText().getPlainText(),
  )
try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4231/', {
    waitUntil: 'domcontentloaded',
    timeout: 180000,
  })
  await page.waitForFunction(
    () => {
      const el = document.querySelector('.beacon-embed')
      return el?.dataset.ready || el?.dataset.error || window.startupFailure
    },
    {},
    { timeout: 120000 },
  )
  assert.equal(await root.getAttribute('data-error'), null)
  assert.equal(await page.evaluate(() => window.startupFailure), null)
  report.descriptor = await page.evaluate(() =>
    window.univerAPI.listEmbeds({ hostUnitId: 'beacon-observatory-review' })[0].getDescriptor(),
  )
  assert.equal(report.descriptor.entry, 'slides-floating-object')
  assert.equal(report.descriptor.childUnitId, 'beacon-ingestion-boundaries')
  const child = root.locator('[data-u-comp="embed-float-dom"]')
  await child.waitFor()
  await root.locator('[data-u-comp="ribbon-grid-toolbar"]').waitFor()
  assert.equal(await root.locator('iframe,:scope > fieldset,:scope > details,[data-action]').count(), 0)
  assert.equal(
    await root
      .locator('[data-u-comp="workbench-layout"]')
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundColor),
    'rgb(255, 255, 255)',
  )
  assert.deepEqual((await readHost()).slideOrder, ['architecture', 'tradeoffs', 'checks'])
  assert.equal(
    await page.evaluate(() => window.univerAPI.getBoard('beacon-ingestion-boundaries').getElementOrder().length),
    16,
  )
  await page.waitForFunction(() => window.painted.join('').includes('Review required'))
  await root.screenshot({ path: path.join(directory, 'architecture.png') })
  await child.dblclick({ position: { x: 180, y: 130 } })
  await page.waitForFunction(
    () =>
      document.querySelector('[data-u-comp="embed-float-dom"]')?.getAttribute('data-embed-float-stage') === 'stage2',
  )
  const hostBefore = await readHost()
  const boardBefore = await readChild()
  const connectors = Object.fromEntries(
    ['sample', 'upload', 'inspect', 'accept', 'reject', 'recheck'].map((id) => [
      id,
      boardBefore.pages.boundaries.elements[id],
    ]),
  )
  report.checks.push(
    'Native SlideFloating Board activates six nodes, six bound connectors and four annotations beside three original slides; Grid and official white CSS, no iframe or fixture panel',
  )
  const examples = [
    ...(await fs.readFile('showcase/embed/boards-in-slides-float/README.md', 'utf8')).matchAll(
      /\x60\x60\x60ts\n([\s\S]*?)\x60\x60\x60/g,
    ),
  ]
  assert.equal(examples.length, 2)
  await page.evaluate(() => {
    window.painted = []
  })
  await page.evaluate(examples[0][1])
  assert.equal(await textOf(), 'Quarantine\nReview today')
  await page.waitForFunction(() => window.painted.join('').includes('Review today'))
  assert.deepEqual(await readHost(), hostBefore)
  await root.screenshot({ path: path.join(directory, 'edited-board.png') })
  report.checks.push(
    'First literal README Facade example edits and repaints the quarantine node while preserving the entire presentation',
  )
  try {
    await child.locator('[data-board-viewport-host="true"]').click({ position: { x: 20, y: 30 } })
    const afterEdit = await readChild()
    await page.keyboard.press('Control+z')
    await page.waitForFunction(
      () =>
        window.univerAPI.getBoard('beacon-ingestion-boundaries').getShape('quarantine').getText().getPlainText() ===
        'Quarantine\nReview required',
      {},
      { timeout: 5000 },
    )
    await page.keyboard.press('Control+y')
    await page.waitForFunction(
      () =>
        window.univerAPI.getBoard('beacon-ingestion-boundaries').getShape('quarantine').getText().getPlainText() ===
        'Quarantine\nReview today',
      {},
      { timeout: 5000 },
    )
    assert.deepEqual(await readHost(), hostBefore)
    assert.deepEqual(await readChild(), afterEdit)
    report.gates.nativeHistory = { passed: true }
  } catch (error) {
    report.gates.nativeHistory = { passed: false, failure: error.message }
  }
  try {
    const beforeMove = await readChild()
    const bounds = await page.evaluate(
      () =>
        window.univerAPI
          .getBoard('beacon-ingestion-boundaries')
          .describeElements()
          .find((el) => el.id === 'quarantine').bounds,
    )
    const point = await page.evaluate(() =>
      window.paintPoints.findLast(
        (p, index, points) =>
          p.text.startsWith('Q') &&
          points
            .slice(index, index + 10)
            .map((item) => item.text)
            .join('')
            .startsWith('Quarantine'),
      ),
    )
    assert.ok(point, 'Use actual native canvas text geometry, not guessed scaled coordinates')
    await page.mouse.click(point.x + 12, point.y - 4)
    await page.keyboard.press('ArrowRight')
    await page.waitForFunction(
      (left) =>
        window.univerAPI
          .getBoard('beacon-ingestion-boundaries')
          .describeElements()
          .find((el) => el.id === 'quarantine').bounds.left > left,
      bounds.left,
      { timeout: 5000 },
    )
    assert.deepEqual(await readHost(), hostBefore)
    await page.keyboard.press('Control+z')
    await page.waitForFunction(
      (left) =>
        window.univerAPI
          .getBoard('beacon-ingestion-boundaries')
          .describeElements()
          .find((el) => el.id === 'quarantine').bounds.left === left,
      bounds.left,
      { timeout: 5000 },
    )
    assert.deepEqual(await readChild(), beforeMove)
    report.gates.nativeMovement = { passed: true }
  } catch (error) {
    report.gates.nativeMovement = { passed: false, failure: error.message }
    report.movementDiagnostic = await page.evaluate(() => ({
      points: window.paintPoints.slice(-40),
      active: document.activeElement?.outerHTML.slice(0, 600),
    }))
  }
  try {
    await page.getByRole('button', { name: 'Enter fullscreen', exact: true }).click({ timeout: 5000 })
    await page.locator('[data-embed-fullscreen-shell="true"]').waitFor({ timeout: 5000 })
    await page.screenshot({ path: path.join(directory, 'fullscreen.png'), fullPage: true })
    await page.getByRole('button', { name: 'Exit fullscreen', exact: true }).click()
    report.gates.nativeFullscreen = { passed: true }
  } catch (error) {
    report.gates.nativeFullscreen = { passed: false, failure: error.message }
  }
  const edited = await readChild()
  assert.deepEqual(
    Object.fromEntries(Object.keys(connectors).map((id) => [id, edited.pages.boundaries.elements[id]])),
    connectors,
  )
  for (const id of ['tradeoffs', 'checks', 'architecture']) {
    await root.locator('[data-u-comp="slide-thumbnail-item"][data-page-id="' + id + '"]').click()
    await page.waitForFunction(
      (expected) => window.univerAPI.getPresentation('beacon-observatory-review').getActiveSlide().getId() === expected,
      id,
    )
    assert.deepEqual(await readChild(), edited)
    await root.screenshot({ path: path.join(directory, id + '.png') })
  }
  await page.evaluate(examples[1][1])
  assert.deepEqual(await readChild(), edited)
  const hostEdited = await readHost()
  assert.ok(
    hostEdited.slides.architecture.elements.title.shapeData.shapeText.dataModel.doc.body.dataStream.includes(
      'Preserve evidence before retry.',
    ),
  )
  for (const dark of [true, false]) {
    await page.evaluate((enabled) => window.univerAPI.toggleDarkMode(enabled), dark)
    await settle()
    assert.deepEqual(await readHost(), hostEdited)
    const themed = await readChild()
    // BoardSettingsService.syncFollowUniverTheme regenerates the native theme palette.
    // No other field, including explicit element colors, geometry or resources, may change.
    assert.equal(themed.theme.id, edited.theme.id)
    assert.deepEqual({ ...themed, theme: edited.theme }, edited)
  }
  report.checks.push(
    'Six connector models, three-page navigation, the literal host README edit and live theme changes preserve independent content; only the SDK-generated Board theme palette may follow the UI theme',
  )
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.backendRequests, [])
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
  await settle()
  assert.equal(await root.count(), 0)
  assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
  assert.deepEqual(report.errors, [])
  report.checks.push(
    'Owned disposal releases the active native child, root and API without observed browser errors or backend requests',
  )
  assert.ok(
    Object.values(report.gates).every((gate) => gate.passed),
    'All native interaction gates must pass',
  )
  report.passed = true
} catch (error) {
  report.failure = error.stack
  report.diagnostic = await page
    .evaluate(() => ({ text: document.body.innerText.slice(-2500), painted: window.painted?.slice(-150) }))
    .catch(() => null)
  await page.screenshot({ path: path.join(directory, 'failure.png'), fullPage: true }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
  await server?.close()
}
assert.equal(report.passed, true, report.failure)
console.log('PASS selected native Boards@Slides Float')
