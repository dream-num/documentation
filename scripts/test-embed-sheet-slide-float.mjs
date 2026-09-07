/* eslint-disable no-await-in-loop -- Native menu tabs share one active ribbon and must be visited sequentially. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

const { createServer } = await import(pathToFileURL(process.env.SHOWCASE_VITE_MODULE).href)
const codeRoot = 'showcase/embed/sheets-in-slides-float/code'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-sheet-slide-float')
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
      cacheDir: path.resolve('test-results/embed-sheet-slide-float/.vite'),
      optimizeDeps: { noDiscovery: true, include: dependencies },
      server: { host: '127.0.0.1', port: 4215, strictPort: true, watch: { ignored: ['**/.next/**'] } },
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
await page.addInitScript((diagnostic) => {
  if (diagnostic) {
    for (const method of ['stopPropagation', 'stopImmediatePropagation', 'preventDefault']) {
      const original = Event.prototype[method]
      Event.prototype[method] = function (...args) {
        if (window.fullscreenTrace && ['pointerdown', 'pointerup', 'mousedown', 'mouseup', 'click'].includes(this.type))
          window.fullscreenTrace.push({ method, type: this.type, stack: new Error().stack })
        return Reflect.apply(original, this, args)
      }
    }
    for (const type of ['pointerup', 'click'])
      window.addEventListener(
        type,
        (event) => {
          window.fullscreenTrace?.push({ early: type, target: event.target?.outerHTML?.slice(0, 300) })
        },
        true,
      )
  }
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
}, process.env.SHOWCASE_DIAGNOSTIC === '1')
const settle = () =>
  page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
const hostSnapshot = () =>
  page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getPresentation('tamar-quarterly-review').save())))
const childSnapshot = () =>
  page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getWorkbook('tamar-revenue-assumptions').save())))
const resultIs = (value) =>
  page.waitForFunction(
    (expected) =>
      window.univerAPI
        .getWorkbook('tamar-revenue-assumptions')
        .getSheetBySheetId('channels')
        .getRange('F12')
        .getRawValue() === expected,
    value,
  )
try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4215/', {
    waitUntil: 'domcontentloaded',
    timeout: 180000,
  })
  await page.waitForFunction(
    () => {
      const root = document.querySelector('.tamar-embed')
      return root?.dataset.ready || root?.dataset.error || window.startupFailure
    },
    {},
    { timeout: 120000 },
  )
  assert.equal(await page.evaluate(() => window.startupFailure), null)
  assert.equal(await page.locator('.tamar-embed').getAttribute('data-error'), null)
  report.descriptor = await page.evaluate(() =>
    window.univerAPI.listEmbeds({ hostUnitId: 'tamar-quarterly-review' })[0].getDescriptor(),
  )
  assert.equal(report.descriptor.entry, 'slides-floating-object')
  assert.equal(report.descriptor.childUnitId, 'tamar-revenue-assumptions')
  assert.equal(report.descriptor.context.resolved, true)
  const child = page.locator('[data-u-comp="embed-float-dom"]')
  await child.waitFor()
  await page.locator('[data-u-comp="ribbon-grid-toolbar"]').waitFor()
  assert.equal(
    await page.locator('iframe,.tamar-embed > fieldset,.tamar-embed > details,.tamar-embed [data-action]').count(),
    0,
  )
  await page.waitForFunction(() => window.painted.join('').includes('Test the demand.'))
  await page.screenshot({ path: path.join(directory, 'quarterly-review.png'), fullPage: true })
  await child.dblclick({ position: { x: 180, y: 130 } })
  await page.waitForFunction(
    () =>
      document.querySelector('[data-u-comp="embed-float-dom"]')?.getAttribute('data-embed-float-stage') === 'stage2',
  )
  await resultIs(11532)
  await page.waitForFunction(() => window.painted.join('').includes('Direct editions'))
  const styles = await page
    .locator('[data-u-comp="workbench-layout"]')
    .first()
    .evaluate((el) => ({
      background: getComputedStyle(el).backgroundColor,
      flex: getComputedStyle(el.querySelector('.univer-flex')).display,
    }))
  assert.equal(styles.background, 'rgb(255, 255, 255)')
  assert.equal(styles.flex, 'flex')
  report.checks.push(
    'Native SlideFloating hosts the real two-sheet revenue model with official white/Grid CSS and no fixture panel',
  )
  await page.screenshot({ path: path.join(directory, 'active-workbook.png'), fullPage: true })
  const hostBefore = await hostSnapshot()
  await page.evaluate(() => {
    window.painted = []
    window.univerAPI
      .getWorkbook('tamar-revenue-assumptions')
      .getSheetBySheetId('channels')
      .getRange('B5')
      .setValue(1800)
  })
  await resultIs(13932)
  assert.equal(
    await page.evaluate(() =>
      window.univerAPI
        .getWorkbook('tamar-revenue-assumptions')
        .getSheetBySheetId('channels')
        .getRange('E9')
        .getRawValue(),
    ),
    49680,
  )
  assert.deepEqual(await hostSnapshot(), hostBefore)
  await child.click({ position: { x: 350, y: 210 } })
  await page.keyboard.press('Escape')
  await page.keyboard.press('Control+z')
  await resultIs(11532)
  await page.keyboard.press('Control+y')
  await resultIs(13932)
  assert.deepEqual(await hostSnapshot(), hostBefore)
  report.checks.push(
    'Direct units 1600 to 1800 recalculates revenue to 49680 and operating result to 13932; native Undo/Redo preserves the whole presentation',
  )
  if (process.env.SHOWCASE_DIAGNOSTIC === '1') {
    const session = await page.context().newCDPSession(page)
    const { result: buttonInspection } = await session.send('Runtime.evaluate', {
      expression:
        'document.querySelector(\'[data-u-comp="sheet-embed-floating-menu"] button[aria-label="Enter fullscreen"]\')',
    })
    report.buttonListeners = await session.send('DOMDebugger.getEventListeners', {
      objectId: buttonInspection.objectId,
    })
    await session.detach()
    await page.evaluate(async () => {
      window.fullscreenTrace = []
      const originalButton = document.querySelector(
        '[data-u-comp="sheet-embed-floating-menu"] button[aria-label="Enter fullscreen"]',
      )
      for (const method of ['appendChild', 'insertBefore', 'removeChild']) {
        const original = Node.prototype[method]
        Node.prototype[method] = function (...args) {
          if (args[0]?.contains?.(originalButton))
            window.fullscreenTrace.push({
              dom: method,
              node: args[0].outerHTML?.slice(0, 350),
              stack: new Error().stack,
            })
          return Reflect.apply(original, this, args)
        }
      }
      new MutationObserver((records) => {
        for (const record of records)
          for (const node of record.removedNodes)
            if (node.contains(originalButton))
              window.fullscreenTrace.push({
                removed: node.outerHTML?.slice(0, 350),
                connected: originalButton.isConnected,
              })
      }).observe(document.body, { childList: true, subtree: true })
      for (const [moduleName, exportName, method] of [
        ['@univerjs-pro_embed-ui.js?', 'EmbedFullscreenService', 'enter'],
        ['@univerjs-pro_embed.js?', 'EmbedModelService', 'getDescriptor'],
      ]) {
        const loaded = performance.getEntriesByType('resource').find((entry) => entry.name.includes('/' + moduleName))
        const Class = (await import(loaded.name))[exportName]
        const original = Class.prototype[method]
        Class.prototype[method] = function (...args) {
          const result = Reflect.apply(original, this, args)
          window.fullscreenTrace.push({ method, args, result })
          return result
        }
      }
      for (const type of ['pointerdown', 'mousedown', 'mouseup', 'click'])
        window.addEventListener(
          type,
          (event) => {
            window.fullscreenTrace.push({
              type,
              original: event.target === originalButton,
              connected: originalButton.isConnected,
              target: event.target?.outerHTML?.slice(0, 500),
              prevented: event.defaultPrevented,
            })
            queueMicrotask(() => window.fullscreenTrace.push({ after: type, connected: originalButton.isConnected }))
          },
          true,
        )
    })
  }
  await page
    .locator('[data-u-comp="sheet-embed-floating-menu"]')
    .getByRole('button', { name: 'Enter fullscreen', exact: true })
    .click()
  const fullscreen = page.locator('[data-embed-fullscreen-shell="true"]')
  await fullscreen.waitFor()
  await fullscreen.locator('[data-u-comp="ribbon-grid-toolbar"]').waitFor()
  report.ribbonTabs = []
  for (const name of ['Start', 'Insert', 'Formulas', 'Data', 'View']) {
    await fullscreen.getByRole('tab', { name, exact: true }).click()
    await settle()
    const commands = await fullscreen
      .locator('[data-u-comp="ribbon-grid-toolbar"] [data-u-command]')
      .evaluateAll((elements) => elements.map((el) => el.getAttribute('data-u-command')))
    assert.ok(commands.length > 0, name)
    report.ribbonTabs.push({ name, commands })
    assert.deepEqual(report.errors, [])
  }
  await fullscreen.getByRole('tab', { name: 'Start', exact: true }).click()
  await fullscreen.locator('[data-u-comp="slide-tab-item"]').filter({ hasText: 'Sensitivity' }).click()
  await page.waitForFunction(
    () => window.univerAPI.getWorkbook('tamar-revenue-assumptions').getActiveSheet().getSheetId() === 'sensitivity',
  )
  await page.waitForFunction(() => window.painted.join('').includes('Volume changes, costs remain'))
  assert.deepEqual(
    await page.evaluate(() =>
      window.univerAPI
        .getWorkbook('tamar-revenue-assumptions')
        .getSheetBySheetId('sensitivity')
        .getRange('D4:D6')
        .getValues(),
    ),
    [[9142.2], [13932], [18721.8]],
  )
  await page.screenshot({ path: path.join(directory, 'fullscreen-sensitivity.png'), fullPage: true })
  report.checks.push(
    'Native fullscreen exposes five populated Grid tabs and lower/working/higher demand results linked across sheets',
  )
  await fullscreen.locator('[data-u-comp="slide-tab-item"]').filter({ hasText: 'Channels' }).click()
  await page.locator('[data-embed-fullscreen-close="true"]').click()
  await fullscreen.waitFor({ state: 'detached' })
  assert.deepEqual(await hostSnapshot(), hostBefore)
  const childBefore = await childSnapshot()
  const thumbnails = page.locator('[data-u-comp="slide-thumbnail-item"]')
  assert.equal(await thumbnails.count(), 3)
  await thumbnails.nth(1).click()
  await page.waitForFunction(
    () => window.univerAPI.getPresentation('tamar-quarterly-review').getActiveSlide().getId() === 'drivers',
  )
  await page.waitForFunction(() => window.painted.join('').includes('Three different economics.'))
  await page.screenshot({ path: path.join(directory, 'channel-drivers.png'), fullPage: true })
  await thumbnails.nth(2).click()
  await page.waitForFunction(
    () => window.univerAPI.getPresentation('tamar-quarterly-review').getActiveSlide().getId() === 'gates',
  )
  await page.screenshot({ path: path.join(directory, 'evidence-gates.png'), fullPage: true })
  await thumbnails.first().click()
  await child.waitFor()
  assert.deepEqual(await childSnapshot(), childBefore)
  report.checks.push(
    'Native host thumbnails visit three authored layouts and return to the edited child without changing its workbook',
  )
  await child.click({ position: { x: 180, y: 130 } })
  await settle()
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.backendRequests, [])
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
  await settle()
  assert.equal(await page.locator('.tamar-embed').count(), 0)
  assert.deepEqual(report.errors, [])
  report.checks.push('Selected active-child disposal releases the owner without browser errors or backend requests')
  report.passed = true
} catch (error) {
  report.failure = error.stack
  report.diagnostic = await page
    .evaluate(() => ({
      text: document.body.innerText.slice(-3500),
      fullscreenTrace: window.fullscreenTrace,
      painted: window.painted?.slice(-180),
      roots: [...document.querySelectorAll('.tamar-embed')].map((el) => ({
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
console.log('PASS selected native Sheet@Slides Float')
