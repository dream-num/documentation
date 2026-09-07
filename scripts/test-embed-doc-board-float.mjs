/* eslint-disable no-await-in-loop -- Native menu tabs share one active ribbon and must be visited sequentially. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

const { createServer } = await import(pathToFileURL(process.env.SHOWCASE_VITE_MODULE).href)
const codeRoot = 'showcase/embed/docs-in-boards-float/code'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-doc-board-float')
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
      cacheDir: path.resolve('test-results/embed-doc-board-float/.vite'),
      optimizeDeps: { noDiscovery: true, include: dependencies },
      server: { host: '127.0.0.1', port: 4245, strictPort: true, watch: { ignored: ['**/.next/**'] } },
      plugins: [
        {
          name: 'one-embed-only',
          configureServer(vite) {
            vite.middlewares.use((request, response, next) => {
              if (request.url?.split('?')[0] !== '/') return next()
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
const report = { passed: false, checks: [], errors: [], backendRequests: [], gates: {} }
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
    const bounds = this.canvas.getBoundingClientRect()
    if (bounds.width > 300) {
      window.paintPoints.push({
        text: String(args[0]),
        x: bounds.x + (point.x * bounds.width) / this.canvas.width,
        y: bounds.y + (point.y * bounds.height) / this.canvas.height,
      })
      if (window.paintPoints.length > 15000) window.paintPoints.splice(0, 7000)
    }
    return Reflect.apply(fill, this, args)
  }
})
const settle = () =>
  page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))
const hostSnapshot = () =>
  page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getBoard('maple-library-discovery').save())))
const childSnapshot = () =>
  page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getDocument('maple-interview-brief').save())))

const root = page.locator('.maple-embed')
const child = page.locator('[data-u-comp="embed-float-dom"]')
const docContains = (value) =>
  page.waitForFunction(
    (text) => window.univerAPI.getDocument('maple-interview-brief').getBody().dataStream.includes(text),
    value,
    { timeout: 8000 },
  )
async function gate(name, fn) {
  try {
    await fn()
    report.gates[name] = { passed: true }
  } catch (error) {
    report.gates[name] = { passed: false, failure: error.stack }
    await page.keyboard.press('Escape')
  }
}
try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4245/', {
    waitUntil: 'domcontentloaded',
    timeout: 180000,
  })
  await page.waitForFunction(
    () => {
      const el = document.querySelector('.maple-embed')
      return el?.dataset.ready || el?.dataset.error || window.startupFailure
    },
    {},
    { timeout: 120000 },
  )
  assert.equal(await root.getAttribute('data-error'), null)
  assert.equal(await page.evaluate(() => window.startupFailure), null)
  report.descriptor = await page.evaluate(() =>
    window.univerAPI.listEmbeds({ hostUnitId: 'maple-library-discovery' })[0].getDescriptor(),
  )
  assert.equal(report.descriptor.entry, 'boards-floating-object')
  assert.equal(report.descriptor.childUnitId, 'maple-interview-brief')
  assert.equal(report.descriptor.context.resolved, true)
  assert.equal((await hostSnapshot()).pages.discovery.elementOrder.length, 15)
  assert.equal(await root.locator('iframe,fieldset,details,[data-action]').count(), 0)
  await page.waitForFunction(() => window.painted.join('').includes('A BETTER FIRST VISIT'))
  await child.dblclick({ position: { x: 180, y: 110 } })
  await page.waitForFunction(
    () =>
      document.querySelector('[data-u-comp="embed-float-dom"]')?.getAttribute('data-embed-float-stage') === 'stage2',
  )
  // Docs paints its page on Canvas; unlike Sheets, its canvas wrapper has no background class.
  assert.deepEqual(
    await child
      .locator('[data-embed-canvas-root="true"] canvas')
      .evaluate((canvas) => [...canvas.getContext('2d').getImageData(20, 20, 1, 1).data]),
    [255, 255, 255, 255],
  )
  const initial = await childSnapshot()
  assert.equal(initial.body.paragraphs.length, 18)
  assert.ok(initial.body.dataStream.includes('six fictional interviews'))
  await page.waitForFunction(() => window.painted.join('').includes('Understand the first visit.'))
  await page.screenshot({ path: path.join(directory, 'discovery.png'), fullPage: true })
  report.checks.push(
    'Native BoardFloating modern Docs with seven sections, three synthetic observations and three hypotheses; white SDK canvas and no fixture/iframe/duplicate toolbar',
  )
  const hostBefore = await hostSnapshot()
  const examples = [
    ...(await fs.readFile('showcase/embed/docs-in-boards-float/README.md', 'utf8')).matchAll(
      /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
    ),
  ]
  assert.equal(examples.length, 2)
  await page.evaluate(() => {
    window.painted = []
  })
  await page.evaluate(examples[0][1])
  await docContains('Make the next visit easier.')
  await page.waitForFunction(() => window.painted.join('').includes('Make the next visit easier.'))
  assert.deepEqual(await hostSnapshot(), hostBefore)
  const facadeDoc = await childSnapshot()
  await gate('nativeDocumentHistory', async () => {
    await child.click({ position: { x: 230, y: 210 } })
    await page.keyboard.press('Control+z')
    await docContains('Understand the first visit.')
    assert.deepEqual(await childSnapshot(), {
      ...initial,
      body: { ...initial.body, customBlocks: [], customDecorations: [], customRanges: [] },
    })
    await page.keyboard.press('Control+y')
    await docContains('Make the next visit easier.')
    assert.deepEqual(await childSnapshot(), facadeDoc)
    assert.deepEqual(await hostSnapshot(), hostBefore)
  })
  await gate('nativeKeyboard', async () => {
    await child.click({ position: { x: 230, y: 250 } })
    const before = await childSnapshot()
    await page.keyboard.type('Checked ', { delay: 35 })
    await docContains('Checked ')
    const typed = await childSnapshot()
    assert.deepEqual(await hostSnapshot(), hostBefore)
    await page.keyboard.press('Control+z')
    await page.waitForFunction(
      () => !window.univerAPI.getDocument('maple-interview-brief').getBody().dataStream.includes('Checked '),
    )
    assert.deepEqual(await childSnapshot(), before)
    await page.keyboard.press('Control+y')
    await docContains('Checked ')
    assert.deepEqual(await childSnapshot(), typed)
    await page.screenshot({ path: path.join(directory, 'typed-brief.png'), fullPage: true })
  })
  const edited = await childSnapshot()
  await gate('nativeFullscreen', async () => {
    await page.getByRole('button', { name: 'Enter fullscreen', exact: true }).click({ timeout: 5000 })
    const fullscreen = page.locator('[data-embed-fullscreen-shell="true"]')
    await fullscreen.waitFor({ timeout: 8000 })
    await fullscreen.locator('[data-u-comp="ribbon-grid-toolbar"]').waitFor({ timeout: 8000 })
    report.ribbonTabs = await fullscreen.getByRole('tab').allTextContents()
    assert.ok(report.ribbonTabs.includes('Start'))
    for (const name of report.ribbonTabs) {
      await fullscreen.getByRole('tab', { name, exact: true }).click()
      await settle()
      assert.ok(await fullscreen.locator('[data-u-comp="ribbon-grid-toolbar"] [data-u-command]').count(), name)
    }
    await fullscreen.getByRole('tab', { name: 'Start', exact: true }).click()
    await page.screenshot({ path: path.join(directory, 'fullscreen-brief.png'), fullPage: true })
    await gate('nativeRibbonHistory', async () => {
      const before = await childSnapshot()
      await fullscreen.locator('button[data-u-command="univer.command.undo"]').click()
      await page.waitForFunction(
        () => !window.univerAPI.getDocument('maple-interview-brief').getBody().dataStream.includes('Checked '),
      )
      await fullscreen.locator('button[data-u-command="univer.command.redo"]').click()
      await docContains('Checked ')
      assert.deepEqual(await childSnapshot(), before)
      assert.deepEqual(await hostSnapshot(), hostBefore)
    })
    await gate('nativeScroll', async () => {
      await page.evaluate(() => {
        window.painted = []
      })
      const bounds = await fullscreen.boundingBox()
      await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height - 160)
      await page.mouse.wheel(0, 1300)
      await page.waitForFunction(
        () => window.painted.join('').includes('Decide what to test next'),
        {},
        { timeout: 8000 },
      )
      assert.deepEqual(await childSnapshot(), edited)
      assert.deepEqual(await hostSnapshot(), hostBefore)
      await page.screenshot({ path: path.join(directory, 'next-test-scroll.png'), fullPage: true })
    })
    await page.locator('[data-embed-fullscreen-close="true"]').click()
    await fullscreen.waitFor({ state: 'detached' })
    assert.deepEqual(await childSnapshot(), edited)
  })
  const close = page.locator('[data-embed-fullscreen-close="true"]')
  if (await close.count()) await close.click()
  const viewport = root.locator('[data-board-viewport-host="true"]')
  await viewport.click({ position: { x: 75, y: 80 } })
  await page.evaluate(examples[1][1])
  const boardText = () =>
    page.evaluate(() =>
      window.univerAPI.getBoard('maple-library-discovery').getShape('decision-note').getText().getPlainText(),
    )
  assert.ok((await boardText()).includes('Check the hold-code step.'))
  assert.deepEqual(await childSnapshot(), edited)
  await gate('nativeBoardHistory', async () => {
    const after = await hostSnapshot()
    await page.keyboard.press('Control+z')
    await page.waitForFunction(() =>
      window.univerAPI
        .getBoard('maple-library-discovery')
        .getShape('decision-note')
        .getText()
        .getPlainText()
        .includes('Ask before choosing'),
    )
    await page.keyboard.press('Control+y')
    await page.waitForFunction(() =>
      window.univerAPI
        .getBoard('maple-library-discovery')
        .getShape('decision-note')
        .getText()
        .getPlainText()
        .includes('Check the hold-code step.'),
    )
    assert.deepEqual(await hostSnapshot(), after)
    assert.deepEqual(await childSnapshot(), edited)
  })
  await gate('nativeBoardMovement', async () => {
    const before = await hostSnapshot()
    const point = await page.evaluate(() =>
      window.univerAPI.getBoard('maple-library-discovery').getElementViewportPoint('code-idea'),
    )
    assert.ok(point)
    const bounds = await viewport.boundingBox()
    await page.mouse.click(bounds.x + point.x, bounds.y + point.y)
    await page.keyboard.press('ArrowRight')
    await page.waitForFunction(
      (left) =>
        window.univerAPI
          .getBoard('maple-library-discovery')
          .describeElements()
          .find((el) => el.id === 'code-idea').bounds.left > left,
      before.pages.discovery.elements['code-idea'].transform.left,
      { timeout: 5000 },
    )
    assert.deepEqual(await childSnapshot(), edited)
    await page.keyboard.press('Control+z')
    await settle()
    assert.deepEqual(await hostSnapshot(), before)
  })
  const beforeTheme = await hostSnapshot()
  for (const dark of [true, false]) {
    await page.evaluate((value) => window.univerAPI.toggleDarkMode(value), dark)
    await settle()
    const host = await hostSnapshot()
    assert.equal(host.theme.id, beforeTheme.theme.id)
    assert.deepEqual({ ...host, theme: beforeTheme.theme }, beforeTheme)
    assert.deepEqual(await childSnapshot(), edited)
  }
  report.checks.push(
    'Both literal README examples, native Board history/movement and theme checks preserve independent full models',
  )
  await child.dblclick({ position: { x: 180, y: 110 } })
  await settle()
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
  await settle()
  assert.equal(await root.count(), 0)
  assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
  assert.deepEqual(report.errors, [])
  assert.deepEqual(report.backendRequests, [])
  report.checks.push('Active-child disposal releases root and API without observed browser errors or backend requests')
  assert.ok(
    Object.values(report.gates).every((g) => g.passed),
    'Every selected native gate must pass',
  )
  report.passed = true
} catch (error) {
  report.failure = error.stack
  report.diagnostic = await page
    .evaluate(() => ({
      text: document.body.innerText.slice(-2500),
      painted: window.painted.slice(-100),
      active: document.activeElement?.outerHTML.slice(0, 700),
    }))
    .catch(() => null)
  await page.screenshot({ path: path.join(directory, 'failure.png'), fullPage: true }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
  await server?.close()
}
assert.equal(report.passed, true, report.failure)
console.log('PASS selected native Modern Docs@Boards Float')
