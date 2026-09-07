/* eslint-disable no-await-in-loop -- One active host/child and theme state must be exercised in order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

const { createServer } = await import(pathToFileURL(process.env.SHOWCASE_VITE_MODULE).href)
const codeRoot = 'showcase/embed/boards-in-slides-tab/code'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-board-slide-tab')
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
      cacheDir: path.resolve('test-results/embed-board-slide-tab/.vite'),
      optimizeDeps: { noDiscovery: true, include: dependencies },
      server: { host: '127.0.0.1', port: 4233, strictPort: true, watch: { ignored: ['**/.next/**'] } },
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
    if (this.canvas.closest('[data-embed-slides-page-list-host]') && bounds.width > 300) {
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
const root = page.locator('.kite-embed')
const readHost = () => page.evaluate(() => window.univerAPI.getPresentation('kite-volunteer-workshop').save())
const readChild = () =>
  page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getBoard('kite-shift-retrospective').save())))
const pageItem = (id) => root.locator('[data-u-comp="slide-thumbnail-item"][data-page-id="' + id + '"]')
try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4233/', {
    waitUntil: 'domcontentloaded',
    timeout: 180000,
  })
  await page.waitForFunction(
    () => {
      const el = document.querySelector('.kite-embed')
      return el?.dataset.ready || el?.dataset.error || window.startupFailure
    },
    {},
    { timeout: 120000 },
  )
  assert.equal(await root.getAttribute('data-error'), null)
  assert.equal(await page.evaluate(() => window.startupFailure), null)
  report.descriptor = await page.evaluate(() =>
    window.univerAPI.listEmbeds({ hostUnitId: 'kite-volunteer-workshop' })[0].getDescriptor(),
  )
  assert.equal(report.descriptor.entry, 'slides-page-list-block')
  assert.equal(report.descriptor.childUnitId, 'kite-shift-retrospective')
  assert.equal(report.descriptor.hostAnchorId, 'kite-retrospective-page')
  assert.deepEqual((await readHost()).slideOrder, ['kickoff', 'kite-retrospective-page', 'experiments', 'checkin'])
  await root.locator('[data-u-comp="ribbon-grid-toolbar"]').waitFor()
  assert.equal(
    await root
      .locator('[data-u-comp="workbench-layout"]')
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundColor),
    'rgb(255, 255, 255)',
  )
  assert.equal(
    await root
      .locator('iframe,:scope > fieldset,:scope > details,[data-action],[data-u-comp="embed-float-dom"]')
      .count(),
    0,
  )
  await page.waitForFunction(() => window.painted.join('').includes('Make room for'))
  await root.screenshot({ path: path.join(directory, 'kickoff.png') })
  await pageItem('kite-retrospective-page').click()
  const child = root.locator('[data-embed-slides-page-list-host]')
  await child.waitFor()
  await child.locator('[data-board-viewport-host="true"]').waitFor()
  await page.waitForFunction(() => window.painted.join('').includes('Buddy trial'))
  assert.equal(
    await page.evaluate(() => window.univerAPI.getBoard('kite-shift-retrospective').getElementOrder().length),
    17,
  )
  await root.screenshot({ path: path.join(directory, 'retrospective.png') })
  const hostBefore = await readHost()
  report.checks.push(
    'Native SlidesPageListBlock opens a complete Board with nine shape notes and three visual lanes between three original facilitation slides; native Grid host, official white CSS and no float/iframe/fixture',
  )
  const examples = [
    ...(await fs.readFile('showcase/embed/boards-in-slides-tab/README.md', 'utf8')).matchAll(
      /\x60\x60\x60ts\n([\s\S]*?)\x60\x60\x60/g,
    ),
  ]
  assert.equal(examples.length, 2)
  await page.evaluate(() => {
    window.painted = []
  })
  await page.evaluate(examples[0][1])
  await page.waitForFunction(() => window.painted.join('').includes('Start next Saturday.'))
  assert.equal(
    await page.evaluate(() =>
      window.univerAPI.getBoard('kite-shift-retrospective').getShape('buddy').getText().getPlainText(),
    ),
    'Buddy trial\nStart next Saturday.',
  )
  assert.deepEqual(await readHost(), hostBefore)
  report.checks.push(
    'First literal README example changes and repaints the Buddy trial card without modifying the complete host',
  )
  await root.screenshot({ path: path.join(directory, 'edited-board.png') })
  try {
    const afterEdit = await readChild()
    await child.getByRole('button', { name: 'Undo', exact: true }).click()
    await page.waitForFunction(
      () =>
        window.univerAPI.getBoard('kite-shift-retrospective').getShape('buddy').getText().getPlainText() ===
        'Buddy trial\nTwo shifts with a partner.',
      {},
      { timeout: 5000 },
    )
    await child.getByRole('button', { name: 'Redo', exact: true }).click()
    await page.waitForFunction(
      () =>
        window.univerAPI.getBoard('kite-shift-retrospective').getShape('buddy').getText().getPlainText() ===
        'Buddy trial\nStart next Saturday.',
      {},
      { timeout: 5000 },
    )
    assert.deepEqual(await readHost(), hostBefore)
    assert.deepEqual(await readChild(), afterEdit)
    report.gates.nativeMenuHistory = { passed: true }
  } catch (error) {
    report.gates.nativeMenuHistory = { passed: false, failure: error.message }
  }
  try {
    await child.locator('[data-board-viewport-host="true"]').click({ position: { x: 20, y: 30 } })
    const afterEdit = await readChild()
    await page.keyboard.press('Control+z')
    await page.waitForFunction(
      () =>
        window.univerAPI.getBoard('kite-shift-retrospective').getShape('buddy').getText().getPlainText() ===
        'Buddy trial\nTwo shifts with a partner.',
      {},
      { timeout: 5000 },
    )
    await page.keyboard.press('Control+y')
    await page.waitForFunction(
      () =>
        window.univerAPI.getBoard('kite-shift-retrospective').getShape('buddy').getText().getPlainText() ===
        'Buddy trial\nStart next Saturday.',
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
          .getBoard('kite-shift-retrospective')
          .describeElements()
          .find((el) => el.id === 'buddy').bounds,
    )
    const point = await page.evaluate(() =>
      window.paintPoints.findLast(
        (p, index, points) =>
          p.text.startsWith('B') &&
          points
            .slice(index, index + 11)
            .map((item) => item.text)
            .join('')
            .startsWith('Buddy trial'),
      ),
    )
    assert.ok(point, 'Use actual character paint geometry to select the note')
    await page.mouse.click(point.x + 12, point.y - 4)
    await page.keyboard.press('ArrowRight')
    await page.waitForFunction(
      (left) =>
        window.univerAPI
          .getBoard('kite-shift-retrospective')
          .describeElements()
          .find((el) => el.id === 'buddy').bounds.left > left,
      bounds.left,
      { timeout: 5000 },
    )
    assert.deepEqual(await readHost(), hostBefore)
    await page.keyboard.press('Control+z')
    await page.waitForFunction(
      (left) =>
        window.univerAPI
          .getBoard('kite-shift-retrospective')
          .describeElements()
          .find((el) => el.id === 'buddy').bounds.left === left,
      bounds.left,
      { timeout: 5000 },
    )
    assert.deepEqual(await readChild(), beforeMove)
    report.gates.nativeMovement = { passed: true }
  } catch (error) {
    report.gates.nativeMovement = { passed: false, failure: error.message }
    report.movementDiagnostic = await page.evaluate(() => ({
      points: window.paintPoints.slice(-50),
      active: document.activeElement?.outerHTML.slice(0, 800),
    }))
  }
  try {
    const beforeTyping = await readChild()
    const point = await page.evaluate(() =>
      window.paintPoints.findLast(
        (p, index, points) =>
          p.text.startsWith('B') &&
          points
            .slice(index, index + 11)
            .map((item) => item.text)
            .join('')
            .startsWith('Buddy trial'),
      ),
    )
    assert.ok(point)
    await page.mouse.dblclick(point.x + 12, point.y - 4)
    await page.waitForFunction(
      () =>
        document.activeElement?.isContentEditable || ['TEXTAREA', 'INPUT'].includes(document.activeElement?.tagName),
      {},
      { timeout: 5000 },
    )
    await page.keyboard.press('Control+End')
    await page.keyboard.type(' Reviewed.', { delay: 35 })
    // Escape cancels Board editing; wait for the typed text to paint and click outside to commit.
    await page.waitForFunction(() => window.painted.join('').includes('Reviewed.'), {}, { timeout: 5000 })
    await child.locator('[data-board-viewport-host="true"]').click({ position: { x: 20, y: 30 } })
    await page.waitForFunction(
      () =>
        window.univerAPI
          .getBoard('kite-shift-retrospective')
          .getShape('buddy')
          .getText()
          .getPlainText()
          .includes('Reviewed.'),
      {},
      { timeout: 5000 },
    )
    assert.deepEqual(await readHost(), hostBefore)
    await child.locator('[data-board-viewport-host="true"]').click({ position: { x: 20, y: 30 } })
    report.textUndoSteps = []
    const afterTyping = await readChild()
    // Native typing may commit several history entries. Keep full-state restoration strict.
    for (let step = 0; step < 8 && JSON.stringify(await readChild()) !== JSON.stringify(beforeTyping); step++) {
      const previous = JSON.stringify(await readChild())
      await page.keyboard.press('Control+z')
      await page.waitForFunction(
        (snapshot) => JSON.stringify(window.univerAPI.getBoard('kite-shift-retrospective').save()) !== snapshot,
        previous,
        { timeout: 5000 },
      )
      await settle()
      report.textUndoSteps.push(
        await page.evaluate(() =>
          window.univerAPI.getBoard('kite-shift-retrospective').getShape('buddy').getText().getPlainText(),
        ),
      )
    }
    assert.deepEqual(await readChild(), beforeTyping)
    for (const key of ['Control+y', 'Control+z']) {
      for (let step = 0; step < report.textUndoSteps.length; step++) {
        const previous = JSON.stringify(await readChild())
        await page.keyboard.press(key)
        await page.waitForFunction(
          (snapshot) => JSON.stringify(window.univerAPI.getBoard('kite-shift-retrospective').save()) !== snapshot,
          previous,
          { timeout: 5000 },
        )
        await settle()
      }
      assert.deepEqual(await readChild(), key === 'Control+y' ? afterTyping : beforeTyping)
    }
    assert.deepEqual(await readHost(), hostBefore)
    report.gates.nativeTextEditing = { passed: true, undoSteps: report.textUndoSteps.length }
  } catch (error) {
    report.gates.nativeTextEditing = { passed: false, failure: error.message }
    report.textDiagnostic = await page.evaluate(() => ({
      active: document.activeElement?.outerHTML.slice(0, 900),
      text: window.univerAPI.getBoard('kite-shift-retrospective').getShape('buddy').getText().getPlainText(),
    }))
    await page.keyboard.press('Escape')
  }
  const edited = await readChild()
  for (const id of ['experiments', 'checkin', 'kickoff']) {
    await pageItem(id).click()
    await page.waitForFunction(
      (expected) => window.univerAPI.getPresentation('kite-volunteer-workshop').getActiveSlide().getId() === expected,
      id,
    )
    assert.deepEqual(await readChild(), edited)
    await root.screenshot({ path: path.join(directory, id + '.png') })
  }
  await page.evaluate(examples[1][1])
  assert.deepEqual(await readChild(), edited)
  const hostEdited = await readHost()
  assert.ok(
    hostEdited.slides.kickoff.elements.title.shapeData.shapeText.dataModel.doc.body.dataStream.includes(
      'A better shift',
    ),
  )
  await pageItem('kite-retrospective-page').click()
  await child.waitFor()
  const beforeTheme = await readHost()
  assert.deepEqual(beforeTheme, { ...hostEdited, activeSlideId: 'kite-retrospective-page' })
  for (const dark of [true, false]) {
    await page.evaluate((enabled) => window.univerAPI.toggleDarkMode(enabled), dark)
    await settle()
    assert.deepEqual(await readHost(), beforeTheme)
    const themed = await readChild()
    // Native Board theme following regenerates only the palette, not authored card data.
    assert.equal(themed.theme.id, edited.theme.id)
    assert.deepEqual({ ...themed, theme: edited.theme }, edited)
  }
  report.checks.push(
    'Three host pages, literal README host edit and returning to the Board preserve both models; theme changes may regenerate only the native Board palette',
  )
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.backendRequests, [])
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
  await settle()
  assert.equal(await root.count(), 0)
  assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
  assert.deepEqual(report.errors, [])
  report.checks.push(
    'Owned active-child disposal releases DOM and API without observed browser errors or backend requests',
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
console.log('PASS selected native Boards@Slides Tab')
