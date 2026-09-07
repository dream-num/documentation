import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

const { createServer } = await import(pathToFileURL(process.env.SHOWCASE_VITE_MODULE).href)
const codeRoot = 'showcase/embed/boards-in-sheets-tab/code'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-board-tab')
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
      cacheDir: path.resolve('test-results/embed-board-tab/.vite'),
      optimizeDeps: { noDiscovery: true, include: dependencies },
      server: { host: '127.0.0.1', port: 4203, strictPort: true, watch: { ignored: ['**/.next/**'] } },
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
const report = { passed: false, checks: [], errors: [] }
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
  const fill = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (...args) {
    window.painted.push(String(args[0]))
    return Reflect.apply(fill, this, args)
  }
})
const settle = () =>
  page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4203/', {
    waitUntil: 'domcontentloaded',
    timeout: 180000,
  })
  await page.waitForFunction(
    () => {
      const root = document.querySelector('.ember-embed')
      return root?.dataset.ready || root?.dataset.error || window.startupFailure
    },
    {},
    { timeout: 120000 },
  )
  assert.equal(await page.locator('.ember-embed').getAttribute('data-error'), null)
  assert.equal(await page.evaluate(() => window.startupFailure), null)
  report.descriptor = await page.evaluate(() =>
    window.univerAPI.listEmbeds({ hostUnitId: 'ember-incident-costs' })[0].getDescriptor(),
  )
  assert.equal(report.descriptor.entry, 'sheets-sheet-tab')
  assert.equal(report.descriptor.childUnitId, 'ember-incident-review')
  assert.equal(report.descriptor.context.resolved, true)
  assert.equal(report.descriptor.context.index, 1)
  assert.equal(report.descriptor.context.name, 'Incident timeline')
  const tab = (name) => page.locator('[data-u-comp="slide-tab-item"]').filter({ hasText: name })
  await tab('Loss estimate').click()
  await page.screenshot({ path: path.join(directory, 'loss-estimate.png'), fullPage: true })
  await tab('Incident timeline').click()
  const child = page.locator('[data-embed-sheets-sheet-tab-host]')
  await child.waitFor()
  await page.waitForFunction(() => window.painted.join('').includes('Checkout errors'))
  assert.equal(
    await page.locator('iframe,.ember-embed > fieldset,.ember-embed > details,.ember-embed [data-action]').count(),
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
  await page.waitForFunction(
    () =>
      window.univerAPI
        .getWorkbook('ember-incident-costs')
        .getSheetBySheetId('loss-estimate')
        .getRange('D16')
        .getRawValue() === 8268.5,
  )
  assert.equal(
    await page.evaluate(() => window.univerAPI.getBoard('ember-incident-review').getElementOrder().length),
    17,
  )
  report.checks.push(
    'Native SheetTab Board paints four incident milestones and three follow-up cards with official CSS and no fixture controls',
  )
  await page.screenshot({ path: path.join(directory, 'native-tab.png'), fullPage: true })
  const hostBefore = await page.evaluate(() =>
    JSON.parse(JSON.stringify(window.univerAPI.getWorkbook('ember-incident-costs').save())),
  )
  await page.evaluate(() => {
    window.painted = []
    window.univerAPI
      .getBoard('ember-incident-review')
      .getShape('guardrail')
      .getText()
      .setText('ACTION / Theo\nCap client retries\nDue 16 Oct / In review')
  })
  await page.waitForFunction(() => window.painted.join('').includes('In review'))
  assert.equal(
    await page.evaluate(() =>
      window.univerAPI.getBoard('ember-incident-review').getShape('guardrail').getText().getPlainText(),
    ),
    'ACTION / Theo\nCap client retries\nDue 16 Oct / In review',
  )
  assert.deepEqual(
    await page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getWorkbook('ember-incident-costs').save()))),
    hostBefore,
  )
  report.checks.push(
    'Native activation and a real Board Shape text Facade edit repaint the corrective-action card without changing the host workbook',
  )
  await page.screenshot({ path: path.join(directory, 'edited-board.png'), fullPage: true })
  // Native pointer focus establishes keyboard ownership after the programmatic edit.
  await child.locator('[data-board-viewport-host="true"]').click({ position: { x: 20, y: 30 } })
  await page.keyboard.press('Control+z')
  await page.waitForFunction(
    () =>
      window.univerAPI.getBoard('ember-incident-review').getShape('guardrail').getText().getPlainText() ===
      'ACTION / Theo\nCap client retries\nDue 16 Oct / Open',
  )
  await page.keyboard.press('Control+y')
  await page.waitForFunction(
    () =>
      window.univerAPI.getBoard('ember-incident-review').getShape('guardrail').getText().getPlainText() ===
      'ACTION / Theo\nCap client retries\nDue 16 Oct / In review',
  )
  assert.deepEqual(
    await page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getWorkbook('ember-incident-costs').save()))),
    hostBefore,
  )
  report.checks.push(
    'Native Board keyboard Undo/Redo restores the Shape text while leaving the host workbook unchanged',
  )
  const boardCanvas = child.locator('[data-board-canvas-view="true"]')
  const view = await boardCanvas.evaluate((el) => ({
    zoom: Number(el.getAttribute('data-zoom-ratio')),
    pan: el.getAttribute('data-pan-offset').split(',').map(Number),
  }))
  const canvasBounds = await boardCanvas.locator('canvas').first().boundingBox()
  assert.ok(canvasBounds)
  const beforeDrag = await page.evaluate(() =>
    JSON.parse(JSON.stringify(window.univerAPI.getBoard('ember-incident-review').save())),
  )
  const shape = beforeDrag.pages.incident.elements.guardrail.transform
  const x = canvasBounds.x + view.pan[0] + (shape.left + shape.width / 2) * view.zoom
  const y = canvasBounds.y + view.pan[1] + (shape.top + shape.height / 2) * view.zoom
  await page.mouse.move(x, y)
  await page.mouse.down()
  await page.mouse.move(x + 35 * view.zoom, y + 24 * view.zoom, { steps: 10 })
  await page.mouse.up()
  await page.waitForFunction(
    (left) =>
      window.univerAPI.getBoard('ember-incident-review').save().pages.incident.elements.guardrail.transform.left !==
      left,
    shape.left,
  )
  const afterDrag = await page.evaluate(() =>
    JSON.parse(JSON.stringify(window.univerAPI.getBoard('ember-incident-review').save())),
  )
  assert.notDeepEqual(afterDrag.pages.incident.elements.guardrail.transform, shape)
  assert.deepEqual(
    await page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getWorkbook('ember-incident-costs').save()))),
    hostBefore,
  )
  await page.keyboard.press('Control+z')
  await page.waitForFunction(
    (left) =>
      window.univerAPI.getBoard('ember-incident-review').save().pages.incident.elements.guardrail.transform.left ===
      left,
    shape.left,
  )
  assert.deepEqual(
    await page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getBoard('ember-incident-review').save()))),
    beforeDrag,
  )
  report.checks.push(
    'Native canvas dragging moves the corrective-action card; native Undo restores the complete Board snapshot without changing the workbook',
  )
  const boardBefore = await page.evaluate(() =>
    JSON.parse(JSON.stringify(window.univerAPI.getBoard('ember-incident-review').save())),
  )
  await tab('Loss estimate').click()
  await page.evaluate(() =>
    window.univerAPI
      .getWorkbook('ember-incident-costs')
      .getSheetBySheetId('loss-estimate')
      .getRange('B5')
      .setValue(400),
  )
  await page.waitForFunction(
    () =>
      window.univerAPI
        .getWorkbook('ember-incident-costs')
        .getSheetBySheetId('loss-estimate')
        .getRange('D16')
        .getRawValue() === 9096.5,
  )
  assert.deepEqual(
    await page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getBoard('ember-incident-review').save()))),
    boardBefore,
  )
  await tab('Review gates').click()
  await page.waitForFunction(
    () =>
      window.univerAPI
        .getWorkbook('ember-incident-costs')
        .getSheetBySheetId('review-gates')
        .getRange('B3')
        .getRawValue() === 9096.5,
  )
  await tab('Incident timeline').click()
  await page.waitForFunction(() => window.painted.join('').includes('In review'))
  assert.deepEqual(
    await page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getBoard('ember-incident-review').save()))),
    boardBefore,
  )
  report.checks.push(
    'Affected checkouts recalculate the planning envelope to 9096.5; native tab round trips and linked review sheet preserve the full Board snapshot',
  )
  assert.deepEqual(report.errors, [])
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
  await settle()
  assert.equal(await page.locator('.ember-embed').count(), 0)
  assert.deepEqual(report.errors, [], 'Include asynchronous teardown errors')
  report.checks.push(
    'Selected active-child disposal releases the root without browser errors; broader lifecycle, native editing and history remain open',
  )
  report.passed = true
} catch (error) {
  report.failure = error.stack
  report.diagnostic = await page
    .evaluate(() => ({
      text: document.body.innerText.slice(-2500),
      painted: window.painted?.slice(-150),
      roots: [...document.querySelectorAll('.ember-embed')].map((el) => ({
        ready: el.dataset.ready,
        error: el.dataset.error,
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
console.log('PASS selected native Board@Sheet Tab')
