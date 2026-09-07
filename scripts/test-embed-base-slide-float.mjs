/* eslint-disable no-await-in-loop -- One active host/child and theme state must be exercised in order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

const { createServer } = await import(pathToFileURL(process.env.SHOWCASE_VITE_MODULE).href)
const codeRoot = 'showcase/embed/bases-in-slides-float/code'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-base-slide-float')
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
      cacheDir: path.resolve('test-results/embed-base-slide-float/.vite'),
      optimizeDeps: { noDiscovery: true, include: dependencies },
      server: { host: '127.0.0.1', port: 4223, strictPort: true, watch: { ignored: ['**/.next/**'] } },
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
const root = page.locator('.solstice-embed')
const readHost = () => page.evaluate(() => window.univerAPI.getPresentation('solstice-delivery-review').save())
const readChild = () => page.evaluate(() => window.univerAPI.getBase('solstice-supplier-readiness').save())
const titleIs = (value) =>
  page.waitForFunction(
    (expected) =>
      window.univerAPI
        .getBase('solstice-supplier-readiness')
        .getTableById('checks')
        .getRecordById('checks-1')
        .getValue('title') === expected,
    value,
    { timeout: 5000 },
  )
try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4223/', {
    waitUntil: 'domcontentloaded',
    timeout: 180000,
  })
  await page.waitForFunction(
    () => {
      const el = document.querySelector('.solstice-embed')
      return el?.dataset.ready || el?.dataset.error || window.startupFailure
    },
    {},
    { timeout: 120000 },
  )
  assert.equal(await root.getAttribute('data-error'), null)
  assert.equal(await page.evaluate(() => window.startupFailure), null)
  report.descriptor = await page.evaluate(() =>
    window.univerAPI.listEmbeds({ hostUnitId: 'solstice-delivery-review' })[0].getDescriptor(),
  )
  assert.equal(report.descriptor.entry, 'slides-floating-object')
  assert.equal(report.descriptor.childUnitId, 'solstice-supplier-readiness')
  assert.equal(report.descriptor.context.resolved, true)
  assert.equal(
    await page
      .locator('iframe,.solstice-embed > fieldset,.solstice-embed > details,.solstice-embed [data-action]')
      .count(),
    0,
  )
  await root.locator('[data-u-comp="ribbon-grid-toolbar"]').waitFor()
  const styles = await root
    .locator('[data-u-comp="workbench-layout"]')
    .first()
    .evaluate((el) => ({
      background: getComputedStyle(el).backgroundColor,
      flex: getComputedStyle(el.querySelector('.univer-flex')).display,
    }))
  assert.deepEqual(styles, { background: 'rgb(255, 255, 255)', flex: 'flex' })
  const child = root.locator('[data-u-comp="embed-float-dom"]')
  await child.waitFor()
  const initial = await readChild()
  assert.deepEqual(initial.tableOrder, ['checks', 'suppliers'])
  assert.equal(initial.tables.checks.recordOrder.length, 7)
  assert.equal(initial.tables.suppliers.recordOrder.length, 3)
  assert.deepEqual(
    initial.tables.checks.recordOrder.map((id) => initial.tables.checks.records[id].values.samples),
    [12, 8, 15, 3, 6, 4, 2],
  )
  await root.screenshot({ path: path.join(directory, 'delivery-review.png') })
  await child.dblclick({ position: { x: 180, y: 130 } })
  await page.waitForFunction(
    () =>
      document.querySelector('[data-u-comp="embed-float-dom"]')?.getAttribute('data-embed-float-stage') === 'stage2',
  )
  await page.waitForFunction(() => window.painted.join('').includes('Enclosure finish'))
  report.checks.push(
    'Native SlideFloating loads seven varied checks and three suppliers with white official CSS and Grid; no host form or iframe',
  )
  const before = await readHost()
  const example = (await fs.readFile('showcase/embed/bases-in-slides-float/README.md', 'utf8')).match(
    /```ts\n([\s\S]*?)```/,
  )?.[1]
  assert.ok(example)
  await page.evaluate(() => {
    window.painted = []
  })
  await page.evaluate(example)
  await titleIs('Enclosure edge review')
  await page.waitForFunction(() => window.painted.join('').includes('Enclosure edge'))
  assert.deepEqual(await readHost(), before)
  report.checks.push(
    'The verbatim README Facade edit changes the real Base and paints while preserving the complete presentation',
  )
  await root.screenshot({ path: path.join(directory, 'edited-register.png') })
  const toolbar = page.locator('[data-u-comp="base-embed-actions-surface"]')
  // Preserve each failing native gate but continue collecting independent state/ownership evidence.
  try {
    await toolbar.getByRole('button', { name: 'Undo', exact: true }).click({ timeout: 5000 })
    await titleIs('Enclosure finish')
    await toolbar.getByRole('button', { name: 'Redo', exact: true }).click({ timeout: 5000 })
    await titleIs('Enclosure edge review')
    assert.deepEqual(await readHost(), before)
    report.gates.nativeHistory = { passed: true }
  } catch (error) {
    report.gates.nativeHistory = { passed: false, failure: error.message }
  }
  try {
    await page.getByRole('button', { name: 'Enter fullscreen', exact: true }).click({ timeout: 5000 })
    await page.locator('[data-embed-fullscreen-shell="true"]').waitFor({ timeout: 5000 })
    report.gates.nativeFullscreen = { passed: true }
    await page.screenshot({ path: path.join(directory, 'fullscreen.png'), fullPage: true })
    await page.getByRole('button', { name: 'Exit fullscreen', exact: true }).click()
  } catch (error) {
    report.gates.nativeFullscreen = { passed: false, failure: error.message }
  }
  try {
    const point = await page.evaluate(() => window.paintPoints.findLast((p) => p.text.startsWith('Enclosure edge')))
    assert.ok(point, 'Fresh native cell paint locates the editable record')
    await page.mouse.dblclick(point.x + 12, point.y - 4)
    await page.waitForFunction(
      () =>
        document.activeElement?.matches('input,textarea') ||
        document.activeElement?.closest('[contenteditable="true"]'),
      {},
      { timeout: 5000 },
    )
    await page.keyboard.press('Control+A')
    await page.keyboard.type('Edge sample review')
    await page.keyboard.press('Enter')
    await titleIs('Edge sample review')
    assert.deepEqual(await readHost(), before)
    report.gates.nativeKeyboard = { passed: true, hitTarget: point }
  } catch (error) {
    report.gates.nativeKeyboard = { passed: false, failure: error.message }
    await page.keyboard.press('Escape')
  }
  const beforeSupplierRename = await readChild()
  const examples = [
    ...(await fs.readFile('showcase/embed/bases-in-slides-float/README.md', 'utf8')).matchAll(/```ts\n([\s\S]*?)```/g),
  ]
  assert.equal(examples.length, 2)
  await page.evaluate(() => {
    window.painted = []
  })
  await page.evaluate(examples[1][1])
  await page.waitForFunction(() => window.painted.join('').includes('Alder Works'))
  const edited = await readChild()
  assert.deepEqual(edited.tables.checks, beforeSupplierRename.tables.checks)
  assert.equal(edited.tables.suppliers.records['suppliers-1'].values.title, 'Alder Works')
  assert.deepEqual(await readHost(), before)
  await root.screenshot({ path: path.join(directory, 'linked-suppliers.png') })
  for (const id of ['quality', 'decision', 'readiness']) {
    await root.locator('[data-u-comp="slide-thumbnail-item"][data-page-id="' + id + '"]').click()
    await page.waitForFunction(
      (expected) => window.univerAPI.getPresentation('solstice-delivery-review').getActiveSlide().getId() === expected,
      id,
    )
    assert.deepEqual(await readChild(), edited)
    await root.screenshot({ path: path.join(directory, id + '.png') })
  }
  report.checks.push(
    'The second verbatim README example repaints a linked supplier label without changing check records; three native narrative pages preserve the edited Base',
  )
  await page.evaluate(() =>
    window.univerAPI
      .getPresentation('solstice-delivery-review')
      .getSlideById('readiness')
      .getShape('title')
      .getText()
      .setRichText(
        window.univerAPI
          .newRichText()
          .span('Review evidence. Keep the gate visible.', { fontSize: 34, bold: true, color: '#332B46' }),
      ),
  )
  assert.deepEqual(await readChild(), edited)
  const hostEdited = await readHost()
  for (const dark of [true, false]) {
    await page.evaluate((enabled) => window.univerAPI.toggleDarkMode(enabled), dark)
    await settle()
    assert.deepEqual(await readChild(), edited)
    assert.deepEqual(await readHost(), hostEdited)
  }
  report.checks.push(
    'Host shape-text editing and Facade theme changes preserve the full independent child and host snapshots',
  )
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.backendRequests, [])
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
  await settle()
  assert.equal(await root.count(), 0)
  assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
  assert.deepEqual(report.errors, [])
  report.checks.push('Owned disposal releases roots and API without observed browser errors/backend requests')
  assert.ok(
    Object.values(report.gates).every((gate) => gate.passed),
    'Native history/fullscreen gates must pass',
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
console.log('PASS selected native Base@Slides Float')
