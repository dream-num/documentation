/* eslint-disable no-await-in-loop -- One active host/child and theme state must be exercised in order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

const { createServer } = await import(pathToFileURL(process.env.SHOWCASE_VITE_MODULE).href)
const codeRoot = 'showcase/embed/docs-in-slides-float/code'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-doc-slide-float')
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
      cacheDir: path.resolve('test-results/embed-doc-slide-float/.vite'),
      optimizeDeps: { noDiscovery: true, include: dependencies },
      server: { host: '127.0.0.1', port: 4227, strictPort: true, watch: { ignored: ['**/.next/**'] } },
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
const root = page.locator('.vale-embed')
const readHost = () => page.evaluate(() => window.univerAPI.getPresentation('vale-walking-pilot').save())
const readChild = () => page.evaluate(() => window.univerAPI.getDocument('vale-decision-memo').save())
try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4227/', {
    waitUntil: 'domcontentloaded',
    timeout: 180000,
  })
  await page.waitForFunction(
    () => {
      const el = document.querySelector('.vale-embed')
      return el?.dataset.ready || el?.dataset.error || window.startupFailure
    },
    {},
    { timeout: 120000 },
  )
  assert.equal(await root.getAttribute('data-error'), null)
  assert.equal(await page.evaluate(() => window.startupFailure), null)
  report.descriptor = await page.evaluate(() =>
    window.univerAPI.listEmbeds({ hostUnitId: 'vale-walking-pilot' })[0].getDescriptor(),
  )
  assert.equal(report.descriptor.entry, 'slides-floating-object')
  assert.equal(report.descriptor.childUnitId, 'vale-decision-memo')
  assert.equal(report.descriptor.context.resolved, true)
  assert.equal(await root.locator('iframe,:scope > fieldset,:scope > details,[data-action]').count(), 0)
  await root.locator('[data-u-comp="ribbon-grid-toolbar"]').waitFor()
  assert.equal(
    await root
      .locator('[data-u-comp="workbench-layout"]')
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundColor),
    'rgb(255, 255, 255)',
  )
  const child = root.locator('[data-u-comp="embed-float-dom"]')
  await child.waitFor()
  const initial = await readChild()
  assert.equal(initial.body.paragraphs.length, 14)
  assert.ok(initial.body.dataStream.includes('$18,600'))
  assert.deepEqual((await readHost()).slideOrder, ['decision', 'options', 'review'])
  await page.waitForFunction(() => window.painted.join('').includes('Start with two routes.'))
  await root.screenshot({ path: path.join(directory, 'decision-memo.png') })
  await child.dblclick({ position: { x: 150, y: 120 } })
  await page.waitForFunction(
    () =>
      document.querySelector('[data-u-comp="embed-float-dom"]')?.getAttribute('data-embed-float-stage') === 'stage2',
  )
  report.checks.push(
    'Native SlideFloating resolves and activates a 14-paragraph modern Docs memo beside three original decision slides, with white official CSS and Grid',
  )
  const hostBefore = await readHost()
  const examples = [
    ...(await fs.readFile('showcase/embed/docs-in-slides-float/README.md', 'utf8')).matchAll(
      /\x60\x60\x60ts\n([\s\S]*?)\x60\x60\x60/g,
    ),
  ]
  assert.equal(examples.length, 2)
  await page.evaluate(() => {
    window.painted = []
  })
  await page.evaluate(examples[0][1])
  assert.ok((await readChild()).body.dataStream.includes('Pilot two routes first.'))
  await page.waitForFunction(() => window.painted.join('').includes('Pilot two routes first.'))
  assert.deepEqual(await readHost(), hostBefore)
  report.checks.push('The first literal README example edits and repaints only the modern document title')
  await root.screenshot({ path: path.join(directory, 'edited-memo.png') })
  try {
    const canvas = child.locator('canvas').first()
    await canvas.click({ position: { x: 110, y: 95 } })
    // Test plain insertion at the clicked caret independently of Ctrl+Home and slash-menu shortcuts.
    const beforeTyping = await readChild()
    await page.keyboard.type('Reviewed ', { delay: 35 })
    await page.waitForFunction(
      () => window.univerAPI.getDocument('vale-decision-memo').getBody().dataStream.includes('Reviewed '),
      {},
      { timeout: 5000 },
    )
    assert.deepEqual(await readHost(), hostBefore)
    const typed = await readChild()
    report.gates.nativeKeyboard = { passed: true }
    try {
      // Native keyboard history is distinct from the Docs floating menu, which has no Undo/Redo buttons.
      await page.keyboard.press('Control+z')
      await page.waitForFunction(
        () => !window.univerAPI.getDocument('vale-decision-memo').getBody().dataStream.includes('Reviewed '),
        {},
        { timeout: 5000 },
      )
      assert.deepEqual(await readChild(), beforeTyping)
      await page.keyboard.press('Control+y')
      await page.waitForFunction(
        () => window.univerAPI.getDocument('vale-decision-memo').getBody().dataStream.includes('Reviewed '),
        {},
        { timeout: 5000 },
      )
      assert.deepEqual(await readChild(), typed)
      assert.deepEqual(await readHost(), hostBefore)
      report.gates.nativeHistory = { passed: true }
    } catch (error) {
      report.gates.nativeHistory = { passed: false, failure: error.message }
    }
  } catch (error) {
    report.gates.nativeKeyboard = { passed: false, failure: error.message }
    report.keyboardDiagnostic = await page.evaluate(() => ({
      active: document.activeElement?.outerHTML.slice(0, 1200),
      text: window.univerAPI.getDocument('vale-decision-memo').getBody().dataStream,
      inputs: [...document.querySelectorAll('textarea,[contenteditable=true]')].map((el) => ({
        tag: el.tagName,
        role: el.getAttribute('role'),
        rect: el.getBoundingClientRect().toJSON(),
      })),
      points: window.paintPoints.slice(-100),
    }))
    report.gates.nativeHistory = { passed: false, failure: 'Not reached because native typing failed' }
    await page.keyboard.press('Escape')
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
  try {
    const bounds = await child.boundingBox()
    await page.evaluate(() => {
      window.painted = []
    })
    await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height - 80)
    await page.mouse.wheel(0, 950)
    await page.waitForFunction(() => window.painted.join('').includes('Stop and review'), {}, { timeout: 5000 })
    assert.deepEqual(await readChild(), edited)
    assert.deepEqual(await readHost(), hostBefore)
    await root.screenshot({ path: path.join(directory, 'review-scroll.png') })
    report.gates.nativeScroll = { passed: true }
  } catch (error) {
    report.gates.nativeScroll = { passed: false, failure: error.message }
  }
  for (const id of ['options', 'review', 'decision']) {
    await root.locator('[data-u-comp="slide-thumbnail-item"][data-page-id="' + id + '"]').click()
    await page.waitForFunction(
      (expected) => window.univerAPI.getPresentation('vale-walking-pilot').getActiveSlide().getId() === expected,
      id,
    )
    assert.deepEqual(await readChild(), edited)
    await root.screenshot({ path: path.join(directory, id + '.png') })
  }
  await page.evaluate(examples[1][1])
  assert.deepEqual(await readChild(), edited)
  const hostEdited = await readHost()
  assert.equal(
    hostEdited.slides.decision.elements.title.shapeData.shapeText.dataModel.doc.body.dataStream.trim(),
    'A reversible first step.',
  )
  for (const dark of [true, false]) {
    await page.evaluate((enabled) => window.univerAPI.toggleDarkMode(enabled), dark)
    await settle()
    assert.deepEqual(await readHost(), hostEdited)
    assert.deepEqual(await readChild(), edited)
  }
  report.checks.push(
    'Native slide navigation, the second literal README host edit and live theme changes preserve both independently edited models',
  )
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.backendRequests, [])
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
  await settle()
  assert.equal(await root.count(), 0)
  assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
  assert.deepEqual(report.errors, [])
  report.checks.push(
    'Owned active-child teardown releases its DOM and API without observed browser errors or backend requests',
  )
  assert.ok(
    Object.values(report.gates).every((gate) => gate.passed),
    'Native keyboard/history/fullscreen/scroll gates must all pass',
  )
  report.passed = true
} catch (error) {
  report.failure = error.stack
  report.diagnostic = await page
    .evaluate(() => ({ text: document.body.innerText.slice(-2500), painted: window.painted?.slice(-100) }))
    .catch(() => null)
  await page.screenshot({ path: path.join(directory, 'failure.png'), fullPage: true }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
  await server?.close()
}
assert.equal(report.passed, true, report.failure)
console.log('PASS selected native Docs@Slides Float')
