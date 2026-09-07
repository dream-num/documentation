import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

const { createServer } = await import(pathToFileURL(process.env.SHOWCASE_VITE_MODULE).href)
const codeRoot = 'showcase/embed/boards-in-sheets-float/code'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-board-float')
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
      cacheDir: path.resolve('test-results/embed-board-float/.vite'),
      optimizeDeps: { noDiscovery: true, include: dependencies },
      server: { host: '127.0.0.1', port: 4201, strictPort: true, watch: { ignored: ['**/.next/**'] } },
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
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4201/', {
    waitUntil: 'domcontentloaded',
    timeout: 180000,
  })
  await page.waitForFunction(
    () => {
      const root = document.querySelector('.tidal-embed')
      return root?.dataset.ready || root?.dataset.error || window.startupFailure
    },
    {},
    { timeout: 120000 },
  )
  assert.equal(await page.locator('.tidal-embed').getAttribute('data-error'), null)
  assert.equal(await page.evaluate(() => window.startupFailure), null)
  report.descriptor = await page.evaluate(() =>
    window.univerAPI.listEmbeds({ hostUnitId: 'tidal-berth-costs' })[0].getDescriptor(),
  )
  assert.equal(report.descriptor.entry, 'sheets-floating-object')
  assert.equal(report.descriptor.childUnitId, 'tidal-dock-handoff')
  assert.equal(report.descriptor.context.resolved, true)
  const child = page.locator('[data-u-comp="embed-float-dom"]')
  await child.waitFor()
  const floatBounds = await child.boundingBox()
  assert.ok(floatBounds)
  assert.ok(
    floatBounds.x + floatBounds.width <= page.viewportSize().width + 1,
    'The floating Board must fit within the selected viewport',
  )
  await page.waitForFunction(() => window.painted.join('').includes('Check manifest'))
  assert.equal(
    await page.locator('iframe,.tidal-embed > fieldset,.tidal-embed > details,.tidal-embed [data-action]').count(),
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
        .getWorkbook('tidal-berth-costs')
        .getSheetBySheetId('shift-estimate')
        .getRange('D18')
        .getRawValue() === 2305.6,
  )
  assert.equal(await page.evaluate(() => window.univerAPI.getBoard('tidal-dock-handoff').getElementOrder().length), 16)
  report.checks.push(
    'Native SheetFloating Board paints six process nodes and bound connectors beside eight calculated shift cost lines, with official CSS and no fixture controls',
  )
  await page.screenshot({ path: path.join(directory, 'native-float.png'), fullPage: true })
  await child.dblclick({ position: { x: 300, y: 180 } })
  await page.waitForFunction(
    () =>
      document.querySelector('[data-u-comp="embed-float-dom"]')?.getAttribute('data-embed-float-stage') === 'stage2',
  )
  const hostBefore = await page.evaluate(() =>
    JSON.parse(JSON.stringify(window.univerAPI.getWorkbook('tidal-berth-costs').save())),
  )
  await page.evaluate(() => {
    window.painted = []
    window.univerAPI.getBoard('tidal-dock-handoff').getShape('hold').getText().setText('Hold bay\nRecount requested')
  })
  await page.waitForFunction(() => window.painted.join('').includes('Recount requested'))
  assert.equal(
    await page.evaluate(() =>
      window.univerAPI.getBoard('tidal-dock-handoff').getShape('hold').getText().getPlainText(),
    ),
    'Hold bay\nRecount requested',
  )
  assert.deepEqual(
    await page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getWorkbook('tidal-berth-costs').save()))),
    hostBefore,
  )
  report.checks.push(
    'Native activation and a real Board Shape text Facade edit repaint the hold node without changing the host workbook',
  )
  await page.screenshot({ path: path.join(directory, 'edited-board.png'), fullPage: true })
  // Native pointer focus establishes keyboard ownership after the programmatic edit.
  await child.locator('[data-board-viewport-host="true"]').click({ position: { x: 20, y: 30 } })
  await page.keyboard.press('Control+z')
  await page.waitForFunction(
    () =>
      window.univerAPI.getBoard('tidal-dock-handoff').getShape('hold').getText().getPlainText() ===
      'Hold bay B\n1 crate pending',
  )
  await page.keyboard.press('Control+y')
  await page.waitForFunction(
    () =>
      window.univerAPI.getBoard('tidal-dock-handoff').getShape('hold').getText().getPlainText() ===
      'Hold bay\nRecount requested',
  )
  assert.deepEqual(
    await page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getWorkbook('tidal-berth-costs').save()))),
    hostBefore,
  )
  report.checks.push(
    'Native Board keyboard Undo/Redo restores the Shape text while leaving the host workbook unchanged',
  )
  const boardBefore = await page.evaluate(() =>
    JSON.parse(JSON.stringify(window.univerAPI.getBoard('tidal-dock-handoff').save())),
  )
  await page.evaluate(() =>
    window.univerAPI.getWorkbook('tidal-berth-costs').getSheetBySheetId('shift-estimate').getRange('B5').setValue(20),
  )
  await page.waitForFunction(
    () =>
      window.univerAPI
        .getWorkbook('tidal-berth-costs')
        .getSheetBySheetId('shift-estimate')
        .getRange('D18')
        .getRawValue() === 2376,
  )
  assert.deepEqual(
    await page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getBoard('tidal-dock-handoff').save()))),
    boardBefore,
  )
  report.checks.push('Dock crew hours recalculate the total to 2376 while preserving the full edited Board snapshot')
  assert.deepEqual(report.errors, [])
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
  await settle()
  assert.equal(await page.locator('.tidal-embed').count(), 0)
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
      roots: [...document.querySelectorAll('.tidal-embed')].map((el) => ({
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
console.log('PASS selected native Board@Sheet Float')
