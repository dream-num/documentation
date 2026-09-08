import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

const { createServer } = await import(pathToFileURL(process.env.SHOWCASE_VITE_MODULE).href)
const codeRoot = 'showcase/embed/boards-in-docs-block/code'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-board-doc-block')
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
      cacheDir: path.resolve('test-results/embed-board-doc-block/.vite'),
      optimizeDeps: { noDiscovery: true, include: dependencies },
      server: { host: '127.0.0.1', port: 4213, strictPort: true, watch: { ignored: ['**/.next/**'] } },
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
  viewport: { width: Number(process.env.SHOWCASE_VIEWPORT_WIDTH || 1600), height: 1100 },
})
const report = { passed: false, checks: [], errors: [], backendRequests: [] }
page.on('request', (request) => {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method()) || request.url().includes('/universer-api/'))
    report.backendRequests.push({ method: request.method(), url: request.url() })
})
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
    const rect = this.canvas.getBoundingClientRect()
    window.paintPoints.push({
      text: String(args[0]),
      fullscreen: Boolean(this.canvas.closest('[data-embed-fullscreen-shell="true"]')),
      x: rect.x + (point.x * rect.width) / this.canvas.width,
      y: rect.y + (point.y * rect.height) / this.canvas.height,
    })
    if (window.paintPoints.length > 20000) window.paintPoints.splice(0, 10000)
    return Reflect.apply(fill, this, args)
  }
})
const settle = () =>
  page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))

const hostSnapshot = () =>
  page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getDocument('pine-architecture-decision').save())))
const childSnapshot = () =>
  page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getBoard('pine-service-boundaries').save())))
try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4213/', {
    waitUntil: 'domcontentloaded',
    timeout: 180000,
  })
  await page.waitForFunction(
    () => {
      const root = document.querySelector('.pine-embed')
      return root?.dataset.ready === 'true' || root?.dataset.error || window.startupFailure
    },
    {},
    { timeout: 120000 },
  )
  assert.equal(await page.evaluate(() => window.startupFailure), null)
  assert.equal(await page.locator('.pine-embed').getAttribute('data-error'), null)
  report.descriptor = await page.evaluate(() =>
    window.univerAPI.listEmbeds({ hostUnitId: 'pine-architecture-decision' })[0].getDescriptor(),
  )
  assert.equal(report.descriptor.entry, 'docs-custom-block')
  assert.equal(report.descriptor.childUnitId, 'pine-service-boundaries')
  assert.equal(report.descriptor.context.resolved, true)
  assert.equal((await childSnapshot()).pages.boundaries.elementOrder.length, 18)
  const child = page.locator('[data-u-comp="embed-docs-custom-block"] [data-u-comp="embed-float-dom"]')
  await child.waitFor()
  await page.waitForFunction(() => window.painted.join('').includes('A reservation is not an email'))
  await page.locator('[data-u-comp="ribbon-grid-toolbar"]').waitFor()
  assert.equal(
    await page.locator('iframe,.pine-embed > fieldset,.pine-embed > details,.pine-embed [data-action]').count(),
    0,
  )
  const styles = await page
    .locator('[data-u-comp="workbench-layout"]')
    .first()
    .evaluate((el) => ({
      background: getComputedStyle(el).backgroundColor,
      flex: getComputedStyle(el.querySelector('.univer-flex')).display,
    }))
  assert.equal(styles.background, 'rgb(255, 255, 255)')
  assert.equal(styles.flex, 'flex')
  await page.screenshot({ path: path.join(directory, 'decision-record.png'), fullPage: true })
  await page.mouse.move(850, 400)
  await page.mouse.wheel(0, 400)
  await settle()
  await child.dblclick({ position: { x: 240, y: 180 } })
  await page.waitForFunction(
    () =>
      document.querySelector('[data-u-comp="embed-float-dom"]')?.getAttribute('data-embed-float-stage') === 'stage2',
  )
  await page.waitForFunction(() => window.painted.join('').includes('Retry queue'))
  await page.screenshot({ path: path.join(directory, 'active-board.png'), fullPage: true })
  report.checks.push(
    'Native Docs block paints an 18-element service-boundary Board with official white/Grid host CSS and no fixture panel',
  )
  const hostBefore = await hostSnapshot()
  await page.evaluate(() => {
    window.painted = []
    window.univerAPI
      .getBoard('pine-service-boundaries')
      .getShape('retry')
      .getText()
      .setText('Retry queue\n30 min / In review')
  })
  await page.waitForFunction(() => window.painted.join('').includes('In review'))
  assert.deepEqual(await hostSnapshot(), hostBefore)
  await child.locator('[data-board-viewport-host="true"]').click({ position: { x: 20, y: 30 } })
  await page.keyboard.press('Control+z')
  await page.waitForFunction(
    () =>
      window.univerAPI.getBoard('pine-service-boundaries').getShape('retry').getText().getPlainText() ===
      'Retry queue\n30 min / Open',
  )
  await page.keyboard.press('Control+y')
  await page.waitForFunction(
    () =>
      window.univerAPI.getBoard('pine-service-boundaries').getShape('retry').getText().getPlainText() ===
      'Retry queue\n30 min / In review',
  )
  assert.deepEqual(await hostSnapshot(), hostBefore)
  report.checks.push(
    'Board Shape text Facade edit repaints; native keyboard Undo/Redo owns the edit without modifying the entire host document',
  )
  await page.getByRole('button', { name: 'Enter fullscreen', exact: true }).filter({ visible: true }).click()
  const fullscreen = page.locator('[data-embed-fullscreen-shell="true"]')
  await fullscreen.waitFor()
  const boardCanvas = fullscreen.locator('[data-board-canvas-view="true"]')
  await boardCanvas.waitFor()
  const view = await boardCanvas.evaluate((el) => ({
    zoom: Number(el.getAttribute('data-zoom-ratio')),
    pan: el.getAttribute('data-pan-offset').split(',').map(Number),
  }))
  const bounds = await boardCanvas.locator('canvas').first().boundingBox()
  assert.ok(bounds)
  const beforeDrag = await childSnapshot()
  const shape = beforeDrag.pages.boundaries.elements.retry.transform
  const x = bounds.x + view.pan[0] + (shape.left + shape.width / 2) * view.zoom
  const y = bounds.y + view.pan[1] + (shape.top + shape.height / 2) * view.zoom
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x + 35 * view.zoom, y + 20 * view.zoom, { steps: 10 })
  await page.mouse.up()
  await page.waitForFunction(
    (left) =>
      window.univerAPI.getBoard('pine-service-boundaries').save().pages.boundaries.elements.retry.transform.left !==
      left,
    shape.left,
  )
  assert.deepEqual(await hostSnapshot(), hostBefore)
  await page.screenshot({ path: path.join(directory, 'dragged-retry.png'), fullPage: true })
  await page.keyboard.press('Control+z')
  await page.waitForFunction(
    (left) =>
      window.univerAPI.getBoard('pine-service-boundaries').save().pages.boundaries.elements.retry.transform.left ===
      left,
    shape.left,
  )
  assert.deepEqual(await childSnapshot(), beforeDrag)
  report.checks.push(
    'Native fullscreen canvas dragging moves a connected retry node; native Undo restores the whole Board snapshot',
  )
  await page.screenshot({ path: path.join(directory, 'fullscreen-board.png'), fullPage: true })
  await page.mouse.dblclick(x, y)
  await page.locator('[data-u-comp="shape-text-editor-content"]').filter({ visible: true }).waitFor()
  await page.keyboard.press('Control+End')
  await page.keyboard.down('Shift')
  // eslint-disable-next-line no-await-in-loop -- Native selection keystrokes must arrive in order.
  for (let index = 0; index < 'In review'.length; index++) await page.keyboard.press('ArrowLeft')
  await page.keyboard.up('Shift')
  await page.keyboard.type('Reviewed')
  await page.mouse.click(bounds.x + bounds.width / 2, bounds.y + 90)
  await page.waitForFunction(
    () =>
      window.univerAPI.getBoard('pine-service-boundaries').getShape('retry').getText().getPlainText() ===
      'Retry queue\n30 min / Reviewed',
  )
  assert.deepEqual(await hostSnapshot(), hostBefore)
  await page.screenshot({ path: path.join(directory, 'native-typed-label.png'), fullPage: true })
  report.checks.push('Native shape text typing commits through the child editor and preserves the entire host document')
  await fullscreen.getByRole('button', { name: 'Exit fullscreen', exact: true }).click()
  await fullscreen.waitFor({ state: 'detached' })
  const childBefore = await childSnapshot()
  assert.equal(
    await page.evaluate(() =>
      window.univerAPI.getDocument('pine-architecture-decision').getParagraphs()[1].appendText(' Revised.'),
    ),
    true,
  )
  const anchorAfter = await page.evaluate(
    () =>
      window.univerAPI.listEmbeds({ hostUnitId: 'pine-architecture-decision' })[0].getDescriptor().context.startIndex,
  )
  assert.equal(anchorAfter, report.descriptor.context.startIndex + ' Revised.'.length)
  assert.deepEqual(await childSnapshot(), childBefore)
  report.checks.push('Editing the decision title moves the native block anchor and preserves the complete edited Board')
  await child.click({ position: { x: 240, y: 180 } })
  await settle()
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.backendRequests, [])
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
  await settle()
  assert.equal(await page.locator('.pine-embed').count(), 0)
  assert.deepEqual(report.errors, [])
  report.checks.push('Selected active-child disposal releases the owner without browser errors or backend requests')
  report.passed = true
} catch (error) {
  report.failure = error.stack
  report.diagnostic = await page
    .evaluate(() => ({
      text: document.body.innerText.slice(-4000),
      retryText: window.univerAPI?.getBoard('pine-service-boundaries')?.getShape('retry')?.getText().getPlainText(),
      painted: window.painted?.slice(-150),
      roots: [...document.querySelectorAll('[data-embed-child-render-mode]')].map((root) => ({
        mode: root.getAttribute('data-embed-child-render-mode'),
        parent: root.parentElement?.outerHTML.slice(0, 500),
      })),
    }))
    .catch(() => null)
  await page.screenshot({ path: path.join(directory, 'failure.png'), fullPage: true, timeout: 30000 }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
  await server?.close()
}
assert.equal(report.passed, true, report.failure)
console.log('PASS selected native Board@Docs Block')
