/* eslint-disable no-await-in-loop -- One active host/child and theme state must be exercised in order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

const { createServer } = await import(pathToFileURL(process.env.SHOWCASE_VITE_MODULE).href)
const codeRoot = 'showcase/embed/docs-in-slides-tab/code'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-doc-slide-tab')
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
      cacheDir: path.resolve('test-results/embed-doc-slide-tab/.vite'),
      optimizeDeps: { noDiscovery: true, include: dependencies },
      server: { host: '127.0.0.1', port: 4229, strictPort: true, watch: { ignored: ['**/.next/**'] } },
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
const root = page.locator('.mosaic-embed')
const readHost = () => page.evaluate(() => window.univerAPI.getPresentation('mosaic-repair-research').save())
const readChild = () => page.evaluate(() => window.univerAPI.getDocument('mosaic-methods-appendix').save())
const pageItem = (id) => root.locator('[data-u-comp="slide-thumbnail-item"][data-page-id="' + id + '"]')
try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4229/', {
    waitUntil: 'domcontentloaded',
    timeout: 180000,
  })
  await page.waitForFunction(
    () => {
      const el = document.querySelector('.mosaic-embed')
      return el?.dataset.ready || el?.dataset.error || window.startupFailure
    },
    {},
    { timeout: 120000 },
  )
  assert.equal(await root.getAttribute('data-error'), null)
  assert.equal(await page.evaluate(() => window.startupFailure), null)
  report.descriptor = await page.evaluate(() =>
    window.univerAPI.listEmbeds({ hostUnitId: 'mosaic-repair-research' })[0].getDescriptor(),
  )
  assert.equal(report.descriptor.entry, 'slides-page-list-block')
  assert.equal(report.descriptor.childUnitId, 'mosaic-methods-appendix')
  assert.equal(report.descriptor.hostAnchorId, 'mosaic-research-appendix-page')
  assert.equal(
    await root
      .locator('iframe,:scope > fieldset,:scope > details,[data-action],[data-u-comp="embed-float-dom"]')
      .count(),
    0,
  )
  await root.locator('[data-u-comp="ribbon-grid-toolbar"]').waitFor()
  assert.equal(
    await root
      .locator('[data-u-comp="workbench-layout"]')
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundColor),
    'rgb(255, 255, 255)',
  )
  assert.deepEqual((await readHost()).slideOrder, ['question', 'mosaic-research-appendix-page', 'patterns', 'limits'])
  await page.waitForFunction(() => window.painted.join('').includes('What keeps repair'))
  await root.screenshot({ path: path.join(directory, 'research-question.png') })
  await pageItem(report.descriptor.hostAnchorId).click()
  const child = root.locator('[data-embed-slides-page-list-host]')
  await child.waitFor()
  const initial = await readChild()
  assert.equal(initial.body.paragraphs.length, 16)
  assert.ok(initial.body.dataStream.includes('Twenty-four visits'))
  await page.waitForFunction(() => window.painted.join('').includes('Methods before conclusions.'))
  await root.screenshot({ path: path.join(directory, 'research-appendix.png') })
  report.checks.push(
    'Native SlidesPageListBlock inserts a complete modern Docs appendix between three original research slides; sixteen paragraphs, native Grid and white official CSS, no float/iframe/fixture substitute',
  )
  const hostBefore = await readHost()
  const examples = [
    ...(await fs.readFile('showcase/embed/docs-in-slides-tab/README.md', 'utf8')).matchAll(
      /\x60\x60\x60ts\n([\s\S]*?)\x60\x60\x60/g,
    ),
  ]
  assert.equal(examples.length, 2)
  await page.evaluate(() => {
    window.painted = []
  })
  await page.evaluate(examples[0][1])
  assert.ok((await readChild()).body.dataStream.includes('Keep the methods visible.'))
  await page.waitForFunction(() => window.painted.join('').includes('Keep the methods visible.'))
  assert.deepEqual(await readHost(), hostBefore)
  report.checks.push(
    'The first literal README example edits and repaints the appendix title without changing the complete host',
  )
  await root.screenshot({ path: path.join(directory, 'edited-appendix.png') })
  try {
    const afterFacade = await readChild()
    // Native Grid icon buttons expose command IDs, but currently no accessible name.
    await root
      .locator('[data-u-comp="ribbon-grid-toolbar"] button[data-u-command="univer.command.undo"]')
      .click({ timeout: 5000 })
    await page.waitForFunction(
      () =>
        window.univerAPI
          .getDocument('mosaic-methods-appendix')
          .getBody()
          .dataStream.includes('Methods before conclusions.'),
      {},
      { timeout: 5000 },
    )
    // Undo materializes these omitted empty collections; retain strict checks on every other field.
    assert.deepEqual(await readChild(), {
      ...initial,
      body: { ...initial.body, customBlocks: [], customDecorations: [], customRanges: [] },
    })
    await root
      .locator('[data-u-comp="ribbon-grid-toolbar"] button[data-u-command="univer.command.redo"]')
      .click({ timeout: 5000 })
    await page.waitForFunction(
      () =>
        window.univerAPI
          .getDocument('mosaic-methods-appendix')
          .getBody()
          .dataStream.includes('Keep the methods visible.'),
      {},
      { timeout: 5000 },
    )
    assert.deepEqual(await readHost(), hostBefore)
    assert.deepEqual(await readChild(), afterFacade)
    report.gates.nativeRibbonHistory = { passed: true }
  } catch (error) {
    report.gates.nativeRibbonHistory = { passed: false, failure: error.message }
  }
  try {
    await child
      .locator('canvas')
      .first()
      .click({ position: { x: 230, y: 135 } })
    const beforeTyping = await readChild()
    await page.keyboard.type('Reviewed ', { delay: 35 })
    await page.waitForFunction(
      () => window.univerAPI.getDocument('mosaic-methods-appendix').getBody().dataStream.includes('Reviewed '),
      {},
      { timeout: 5000 },
    )
    const typed = await readChild()
    assert.deepEqual(await readHost(), hostBefore)
    report.gates.nativeKeyboard = { passed: true }
    try {
      await page.keyboard.press('Control+z')
      await page.waitForFunction(
        () => !window.univerAPI.getDocument('mosaic-methods-appendix').getBody().dataStream.includes('Reviewed '),
        {},
        { timeout: 5000 },
      )
      assert.deepEqual(await readChild(), beforeTyping)
      await page.keyboard.press('Control+y')
      await page.waitForFunction(
        () => window.univerAPI.getDocument('mosaic-methods-appendix').getBody().dataStream.includes('Reviewed '),
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
    report.gates.nativeHistory = { passed: false, failure: 'Not reached after native typing failed' }
    report.keyboardDiagnostic = await page.evaluate(() => ({
      active: document.activeElement?.outerHTML.slice(0, 1000),
      text: window.univerAPI.getDocument('mosaic-methods-appendix').getBody().dataStream,
    }))
  }
  const edited = await readChild()
  try {
    const bounds = await child.boundingBox()
    await page.evaluate(() => {
      window.painted = []
    })
    await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height - 100)
    await page.mouse.wheel(0, 1050)
    await page.waitForFunction(() => window.painted.join('').includes('Next learning step'), {}, { timeout: 5000 })
    assert.deepEqual(await readChild(), edited)
    assert.deepEqual(await readHost(), hostBefore)
    await root.screenshot({ path: path.join(directory, 'limitations-scroll.png') })
    report.gates.nativeScroll = { passed: true }
  } catch (error) {
    report.gates.nativeScroll = { passed: false, failure: error.message }
  }
  for (const id of ['patterns', 'limits', 'question']) {
    await pageItem(id).click()
    await page.waitForFunction(
      (expected) => window.univerAPI.getPresentation('mosaic-repair-research').getActiveSlide().getId() === expected,
      id,
    )
    assert.deepEqual(await readChild(), edited)
    await root.screenshot({ path: path.join(directory, id + '.png') })
  }
  await page.evaluate(examples[1][1])
  assert.deepEqual(await readChild(), edited)
  const hostEdited = await readHost()
  assert.ok(
    hostEdited.slides.question.elements.title.shapeData.shapeText.dataModel.doc.body.dataStream.includes(
      'Make repair easier',
    ),
  )
  await pageItem(report.descriptor.hostAnchorId).click()
  await child.waitFor()
  assert.deepEqual(await readChild(), edited)
  const beforeTheme = await readHost()
  // Native navigation intentionally changes the active page, not the authored slide content.
  assert.deepEqual(beforeTheme, { ...hostEdited, activeSlideId: report.descriptor.hostAnchorId })
  for (const dark of [true, false]) {
    await page.evaluate((enabled) => window.univerAPI.toggleDarkMode(enabled), dark)
    await settle()
    assert.deepEqual(await readHost(), beforeTheme)
    assert.deepEqual(await readChild(), edited)
  }
  report.checks.push(
    'Three native narrative pages, literal README host edit, returning to the document page and live theme changes preserve both independent models',
  )
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.backendRequests, [])
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
  await settle()
  assert.equal(await root.count(), 0)
  assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
  assert.deepEqual(report.errors, [])
  report.checks.push(
    'Owned active-document disposal releases DOM and API without observed browser errors or backend requests',
  )
  assert.ok(
    Object.values(report.gates).every((gate) => gate.passed),
    'Native Ribbon history, keyboard/history and scroll gates must all pass',
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
console.log('PASS selected native Docs@Slides Tab')
