/* eslint-disable no-await-in-loop -- Native menu tabs share one active ribbon and must be visited sequentially. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

const { createServer } = await import(pathToFileURL(process.env.SHOWCASE_VITE_MODULE).href)
const codeRoot = 'showcase/embed/bases-in-slides-tab/code'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-base-slide-tab')
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
      cacheDir: path.resolve('test-results/embed-base-slide-tab/.vite'),
      optimizeDeps: { noDiscovery: true, include: dependencies },
      server: { host: '127.0.0.1', port: 4219, strictPort: true, watch: { ignored: ['**/.next/**'] } },
      plugins: [
        {
          name: 'one-embed-only',
          configureServer(vite) {
            vite.middlewares.use((request, response, next) => {
              if (request.url !== '/') return next()
              response.setHeader('Content-Type', 'text/html')
              response.end(
                `<html><head><link rel="icon" href="data:,"></head><body style="margin:0"><div id="app" style="height:100vh"></div><script type="module">import {createDemo} from '/${codeRoot}/create-demo.ts';window.createDemo=createDemo;window.demo=createDemo(document.getElementById('app'));window.addEventListener('pagehide',()=>window.demo.dispose(),{once:true});</script></body></html>`,
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
const report = { passed: false, checks: [], errors: [], warnings: [], backendRequests: [] }
page.on('request', (request) => {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method()) || request.url().includes('/universer-api/'))
    report.backendRequests.push({ method: request.method(), url: request.url() })
})
page.on('requestfailed', (request) => report.errors.push(`${request.url()}: ${request.failure()?.errorText}`))
page.on('pageerror', (error) => report.errors.push(error.message))
page.on('console', (message) => {
  if (message.type() === 'error') report.errors.push(message.text())
  if (message.type() === 'warning') report.warnings.push(message.text())
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
      child: Boolean(this.canvas.closest('[data-embed-slides-page-list-host]')) && rect.width > 400,
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
  page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getPresentation('copper-retail-launch').save())))
const childSnapshot = () =>
  page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getBase('copper-channel-workstreams').save())))
const pageItem = (id) => page.locator('[data-u-comp="slide-thumbnail-item"][data-page-id="' + id + '"]')

const valueIs = (tableId, recordId, fieldId, expected) =>
  page.waitForFunction(
    ({ table, record, field, value }) =>
      window.univerAPI
        .getBase('copper-channel-workstreams')
        .getTableById(table)
        .getRecordById(record)
        .getValue(field) === value,
    { table: tableId, record: recordId, field: fieldId, value: expected },
  )
try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4219/', {
    waitUntil: 'domcontentloaded',
    timeout: 180000,
  })
  await page.waitForFunction(
    () => {
      const root = document.querySelector('.copper-embed')
      return root?.dataset.ready || root?.dataset.error || window.startupFailure
    },
    {},
    { timeout: 120000 },
  )
  assert.equal(await page.evaluate(() => window.startupFailure), null)
  assert.equal(await page.locator('.copper-embed').getAttribute('data-error'), null)
  report.descriptor = await page.evaluate(() =>
    window.univerAPI.listEmbeds({ hostUnitId: 'copper-retail-launch' })[0].getDescriptor(),
  )
  assert.equal(report.descriptor.entry, 'slides-page-list-block')
  assert.equal(report.descriptor.childUnitId, 'copper-channel-workstreams')
  assert.equal(await page.locator('[data-u-comp="slide-thumbnail-item"]').count(), 4)
  assert.equal(
    await page
      .locator(
        '.copper-embed iframe,.copper-embed [data-action],.copper-embed > fieldset,[data-u-comp="embed-float-dom"]',
      )
      .count(),
    0,
  )
  await page.waitForFunction(() => window.painted.join('').includes('Support every refill.'))
  await page.getByRole('tab', { name: 'View', exact: true }).click()
  assert.ok(await page.locator('[data-u-comp="ribbon-grid-toolbar"] [data-u-command]').count())
  await page.getByRole('tab', { name: 'Start', exact: true }).click()
  await page.screenshot({ path: path.join(directory, 'launch.png'), fullPage: true })
  await pageItem(report.descriptor.hostAnchorId).click()
  const child = page.locator('[data-embed-slides-page-list-host]')
  await child.waitFor()
  await page.waitForFunction(() => window.painted.includes('Counter demonstration'))
  assert.deepEqual(
    await page.evaluate(() =>
      window.univerAPI
        .getBase('copper-channel-workstreams')
        .getTables()
        .map((t) => t.getRecords().length),
    ),
    [10, 4],
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
  await page.screenshot({ path: path.join(directory, 'workstreams.png'), fullPage: true })
  report.checks.push(
    'Native SlidePage exposes a two-table Base with ten workstreams and four channels; white official CSS, Grid host menus and no float/iframe/fixture substitute',
  )
  const hostBefore = await hostSnapshot()
  await page.evaluate(() =>
    window.univerAPI
      .getBase('copper-channel-workstreams')
      .getTableById('workstreams')
      .getRecordById('workstreams-1')
      .setValue('title', 'Counter refill rehearsal'),
  )
  await page.waitForFunction(() => window.painted.includes('Counter refill rehearsal'))
  assert.deepEqual(await hostSnapshot(), hostBefore)
  await page.getByRole('button', { name: 'Undo', exact: true }).click()
  await valueIs('workstreams', 'workstreams-1', 'title', 'Counter demonstration')
  await page.getByRole('button', { name: 'Redo', exact: true }).click()
  await valueIs('workstreams', 'workstreams-1', 'title', 'Counter refill rehearsal')
  assert.deepEqual(await hostSnapshot(), hostBefore)
  report.checks.push('Facade record edit paints; native Undo/Redo changes only the Base and preserves the entire host')
  await page.evaluate(() => {
    window.painted = []
    window.paintPoints = []
  })
  await child.getByText('Channels', { exact: true }).click()
  await settle()
  // Table switches can paint before the native sidebar finishes layout.
  // Repaint at the final viewport and exclude thumbnail/offscreen canvases.
  await page.setViewportSize({ width: Number(process.env.SHOWCASE_VIEWPORT_WIDTH || 1600) - 2, height: 1100 })
  await settle()
  await page.evaluate(() => {
    window.paintPoints = []
  })
  await page.setViewportSize({ width: Number(process.env.SHOWCASE_VIEWPORT_WIDTH || 1600), height: 1100 })
  await page.waitForFunction(() => window.paintPoints.some((p) => p.text === 'Harbor Home' && p.child))
  const point = await page.evaluate(() => window.paintPoints.findLast((p) => p.text === 'Harbor Home' && p.child))
  report.channelHitTarget = point
  await page.mouse.dblclick(point.x + 20, point.y - 4)
  await page.keyboard.press('Control+A')
  await page.keyboard.type('Harbor Refill')
  await page.keyboard.press('Enter')
  await valueIs('channels', 'channels-1', 'title', 'Harbor Refill')
  await page.screenshot({ path: path.join(directory, 'channels.png'), fullPage: true })
  await page.evaluate(() => {
    window.painted = []
  })
  await child.getByText('Workstreams', { exact: true }).click()
  await page.waitForFunction(() => window.painted.includes('Harbor Refill'))
  const links = await page.evaluate(() =>
    ['workstreams-1', 'workstreams-2', 'workstreams-9'].map((id) =>
      window.univerAPI
        .getBase('copper-channel-workstreams')
        .getTableById('workstreams')
        .getRecordById(id)
        .getValue('channel'),
    ),
  )
  assert.ok(links.every((v) => JSON.stringify(v).includes('channels-1') && !JSON.stringify(v).includes('Harbor')))
  assert.deepEqual(await hostSnapshot(), hostBefore)
  report.checks.push(
    'Native table navigation and keyboard channel rename repaint three linked workstreams through unchanged stable record IDs',
  )
  const childBefore = await childSnapshot()
  for (const id of ['channels', 'gate', 'launch']) {
    await pageItem(id).click()
    await page.waitForFunction(
      (slideId) => window.univerAPI.getPresentation('copper-retail-launch').getActiveSlide().getId() === slideId,
      id,
    )
    await settle()
    await page.screenshot({ path: path.join(directory, id + '-slide.png'), fullPage: true })
    assert.deepEqual(await childSnapshot(), childBefore)
  }
  await page.evaluate(() => {
    const text = window.univerAPI
      .getPresentation('copper-retail-launch')
      .getActiveSlide()
      .getShape('launch-link')
      .getText()
    const rich = text.getRichText().copy()
    rich.getParagraphs()[0].getTextRuns()[0].setText('OPEN PAGE 2 / Revised workstreams')
    text.setRichText(rich)
  })
  await page.waitForFunction(() => window.painted.join('').includes('Revised workstreams'))
  assert.deepEqual(await childSnapshot(), childBefore)
  await pageItem(report.descriptor.hostAnchorId).click()
  await child.waitFor()
  await valueIs('channels', 'channels-1', 'title', 'Harbor Refill')
  const editedHost = await hostSnapshot()
  for (const dark of [true, false]) {
    await page.evaluate((darkMode) => window.univerAPI.toggleDarkMode(darkMode), dark)
    await page.waitForFunction(
      (darkMode) => document.documentElement.classList.contains('univer-dark') === darkMode,
      dark,
    )
    assert.deepEqual(await hostSnapshot(), editedHost)
    assert.deepEqual(await childSnapshot(), childBefore)
  }
  report.checks.push(
    'Three narrative slides, host rich-text editing and live dark/light theme switching preserve the entire edited child',
  )
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.backendRequests, [])
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
  await settle()
  assert.equal(await page.locator('.copper-embed').count(), 0)
  assert.deepEqual(report.errors, [])
  report.checks.push('Active-child disposal releases the owned root without browser errors or backend requests')
  report.passed = true
} catch (error) {
  report.failure = error.stack
  report.diagnostic = await page
    .evaluate(() => ({ text: document.body.innerText.slice(-5000), painted: window.painted?.slice(-100) }))
    .catch(() => null)
  await page.screenshot({ path: path.join(directory, 'failure.png'), fullPage: true }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
  await server?.close()
}
assert.equal(report.passed, true, report.failure)
console.log('PASS selected native Base@Slides Tab')
