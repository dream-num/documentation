/* eslint-disable no-await-in-loop -- Native menu tabs share one active ribbon and must be visited sequentially. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

const { createServer } = await import(pathToFileURL(process.env.SHOWCASE_VITE_MODULE).href)
const codeRoot = 'showcase/embed/slides-in-boards-float/code'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-slide-board-float')
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
      cacheDir: path.resolve('test-results/embed-slide-board-float/.vite'),
      optimizeDeps: { noDiscovery: true, include: dependencies },
      server: { host: '127.0.0.1', port: 4247, strictPort: true, watch: { ignored: ['**/.next/**'] } },
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
        font: this.font,
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
  page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getBoard('prism-pitch-storyboard').save())))
const childSnapshot = () =>
  page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getPresentation('prism-night-sky-pitch').save())))
const root = page.locator('.prism-embed')
const child = page.locator('[data-u-comp="embed-float-dom"]')
const fullscreen = page.locator('[data-embed-fullscreen-shell="true"]')
const slideTab = (id) => fullscreen.locator('[data-u-comp="slide-thumbnail-item"][data-page-id="' + id + '"]')
async function gate(name, fn) {
  try {
    await fn()
    report.gates[name] = { passed: true }
  } catch (error) {
    report.gates[name] = { passed: false, failure: error.stack }
    await page.screenshot({ path: path.join(directory, name + '-failure.png') })
    await page.keyboard.press('Escape')
  }
}
try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4247/', {
    waitUntil: 'domcontentloaded',
    timeout: 180000,
  })
  await page.waitForFunction(
    () =>
      document.querySelector('.prism-embed')?.dataset.ready ||
      document.querySelector('.prism-embed')?.dataset.error ||
      window.startupFailure,
    {},
    { timeout: 120000 },
  )
  assert.equal(await root.getAttribute('data-error'), null)
  assert.equal(await page.evaluate(() => window.startupFailure), null)
  report.descriptor = await page.evaluate(() =>
    window.univerAPI.listEmbeds({ hostUnitId: 'prism-pitch-storyboard' })[0].getDescriptor(),
  )
  assert.equal(report.descriptor.entry, 'boards-floating-object')
  assert.equal(report.descriptor.childUnitId, 'prism-night-sky-pitch')
  assert.equal(report.descriptor.hostAnchorId, 'prism-slide-float-anchor')
  assert.equal(report.descriptor.context.resolved, true)
  assert.equal((await hostSnapshot()).pages.storyboard.elementOrder.length, 11)
  assert.equal(await root.locator('iframe,fieldset,details,[data-action]').count(), 0)
  assert.deepEqual((await childSnapshot()).slideOrder, ['invitation', 'journey', 'resources', 'decision'])
  await child.dblclick({ position: { x: 180, y: 110 } })
  await page.waitForFunction(
    () =>
      document.querySelector('[data-u-comp="embed-float-dom"]')?.getAttribute('data-embed-float-stage') === 'stage2',
  )
  await page.waitForFunction(() => window.painted.join('').includes('Bring the night'))
  await page.screenshot({ path: path.join(directory, 'storyboard.png'), fullPage: true })
  const hostBefore = await hostSnapshot()
  await page.getByRole('button', { name: 'Enter fullscreen', exact: true }).click({ timeout: 5000 })
  await fullscreen.waitFor({ timeout: 8000 })
  await fullscreen.locator('[data-u-comp="ribbon-grid-toolbar"]').waitFor({ timeout: 8000 })
  report.gates.nativeFullscreen = { passed: true }
  report.ribbonTabs = await fullscreen.getByRole('tab').allTextContents()
  for (const name of report.ribbonTabs) {
    await fullscreen.getByRole('tab', { name, exact: true }).click()
    await settle()
    assert.ok(await fullscreen.locator('[data-u-comp="ribbon-grid-toolbar"] [data-u-command]').count(), name)
  }
  await fullscreen.getByRole('tab', { name: 'Start', exact: true }).click()
  for (const [id, color] of [
    ['invitation', '#111c30'],
    ['journey', '#e8f2ee'],
    ['resources', '#f8f3ea'],
    ['decision', '#eadfef'],
  ]) {
    await slideTab(id).click()
    await page.waitForFunction(
      (pageId) => window.univerAPI.getPresentation('prism-night-sky-pitch').getActiveSlide().getId() === pageId,
      id,
    )
    await settle()
    const pixels = await fullscreen.evaluate((el, expectedColor) => {
      let count = 0
      for (const canvas of el.querySelectorAll('canvas')) {
        if (canvas.width < 500 || canvas.height < 300) continue
        const data = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data
        for (let i = 0; i < data.length; i += 64)
          if ('#' + Array.from(data.slice(i, i + 3), (x) => x.toString(16).padStart(2, '0')).join('') === expectedColor)
            count++
      }
      return count
    }, color)
    assert.ok(pixels > 1000, id + ': authored palette must actually render')
    await page.screenshot({ path: path.join(directory, id + '.png'), fullPage: true })
  }
  assert.deepEqual(await hostSnapshot(), hostBefore)
  report.gates.nativeNavigation = { passed: true }
  report.checks.push(
    'Native BoardFloating and fullscreen Grid; four real Slides layouts and palettes; eleven Board elements; no fixture, duplicate controls or iframe',
  )
  await slideTab('invitation').click()
  await settle()
  const initial = await childSnapshot()
  const examples = [
    ...(await fs.readFile('showcase/embed/slides-in-boards-float/README.md', 'utf8')).matchAll(
      /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
    ),
  ]
  assert.equal(examples.length, 2)
  await page.evaluate(() => {
    window.painted = []
    window.paintPoints = []
  })
  await page.evaluate(examples[0][1])
  await page.waitForFunction(() => window.painted.join('').includes('Eight local nights.'))
  const afterFacade = await childSnapshot()
  assert.deepEqual(await hostSnapshot(), hostBefore)
  await gate('nativeSlideHistory', async () => {
    for (const [command, expected] of [
      ['undo', initial],
      ['redo', afterFacade],
    ]) {
      await fullscreen
        .locator('[data-u-comp="ribbon-grid-toolbar"] button[data-u-command="univer.command.' + command + '"]')
        .click()
      await settle()
      assert.deepEqual(await childSnapshot(), expected)
      assert.deepEqual(await hostSnapshot(), hostBefore)
    }
  })
  // Actual glyph coordinates from the live canvas, not an invisible replacement control.
  report.titlePaint = await page.evaluate(() =>
    window.paintPoints.filter((p) => p.text === 'E' || p.text.includes('Eight')).slice(-20),
  )
  try {
    const point = await page.evaluate(() =>
      window.paintPoints.findLast((p) => p.text === 'E' && Number(p.font.match(/([\d.]+)px/)?.[1]) > 40),
    )
    assert.ok(point, 'Expected a rendered title glyph for native pointer selection')
    // Select blank space inside the title shape, outside its editable glyphs.
    await page.mouse.click(point.x + 400, point.y - 20)
    await settle()
    const beforeMove = await childSnapshot()
    await page.keyboard.press('ArrowRight')
    await settle()
    const moved = await childSnapshot()
    assert.notDeepEqual(
      moved.slides.invitation.elements['cover-title'].transform,
      beforeMove.slides.invitation.elements['cover-title'].transform,
    )
    assert.deepEqual(await hostSnapshot(), hostBefore)
    await page.keyboard.press('Control+z')
    await settle()
    assert.deepEqual(await childSnapshot(), beforeMove)
    report.gates.nativeMovement = { passed: true }
    await page.mouse.dblclick(point.x + 25, point.y - 25)
    // SlideTextEditingRenderController ignores pointer focus changes for 300ms.
    await page.waitForTimeout(350)
    // Enter and leave native editing once before measuring the edit history.
    // The SDK materializes its internal rich-text document on the first commit.
    await page.mouse.click(1520, 900)
    await settle()
    const materialized = await childSnapshot()
    assert.deepEqual(materialized.slides.resources, beforeMove.slides.resources)
    assert.deepEqual(materialized.slides.journey, beforeMove.slides.journey)
    assert.deepEqual(materialized.slides.decision, beforeMove.slides.decision)
    assert.equal(
      materialized.slides.invitation.elements['cover-title'].shapeData.shapeText.text,
      'Eight local nights.\nclose to home.',
    )
    assert.deepEqual(await hostSnapshot(), hostBefore)
    const editPoint = await page.evaluate(() =>
      window.paintPoints.findLast((p) => p.text === 'E' && Number(p.font.match(/([\d.]+)px/)?.[1]) > 40),
    )
    await page.mouse.dblclick(editPoint.x + 25, editPoint.y - 25)
    await page.waitForTimeout(350)
    const beforeType = await childSnapshot()
    await page.screenshot({ path: path.join(directory, 'before-native-text.png') })
    await page.keyboard.type('New ', { delay: 35 })
    report.typingFocus = await page.evaluate(() => document.activeElement?.outerHTML.slice(0, 1000))
    await page.mouse.click(1520, 900)
    await settle()
    const typed = await childSnapshot()
    report.typedTitle = typed.slides.invitation.elements['cover-title']
    await page.screenshot({ path: path.join(directory, 'after-native-text.png') })
    assert.ok(JSON.stringify(typed.slides.invitation.elements['cover-title']).includes('New '))
    assert.deepEqual(await hostSnapshot(), hostBefore)
    await page.keyboard.press('Control+z')
    await settle()
    assert.deepEqual(await childSnapshot(), beforeType)
    await page.keyboard.press('Control+y')
    await settle()
    assert.deepEqual(await childSnapshot(), typed)
    report.gates.nativeTextHistory = { passed: true }
  } catch (error) {
    report.gates.nativeTextHistory = { passed: false, failure: error.stack }
    report.gates.nativeMovement ??= { passed: false, failure: error.message }
  }

  const edited = await childSnapshot()
  const close = page.locator('[data-embed-fullscreen-close="true"]')
  if (await close.count()) await close.click()
  await fullscreen.waitFor({ state: 'detached' })
  assert.deepEqual(await childSnapshot(), edited)
  assert.deepEqual(await hostSnapshot(), hostBefore)
  const viewport = root.locator('[data-board-viewport-host="true"]')
  await viewport.click({ position: { x: 75, y: 80 } })
  const beforeBoardText = await hostSnapshot()
  await page.evaluate(examples[1][1])
  const boardText = () =>
    page.evaluate(() =>
      window.univerAPI.getBoard('prism-pitch-storyboard').getShape('decision-note').getText().getPlainText(),
    )
  assert.ok((await boardText()).includes('Walk both venues before the pilot.'))
  assert.deepEqual(await childSnapshot(), edited)
  await gate('nativeBoardHistory', async () => {
    const after = await hostSnapshot()
    await page.keyboard.press('Control+z')
    await page.waitForFunction(() =>
      window.univerAPI
        .getBoard('prism-pitch-storyboard')
        .getShape('decision-note')
        .getText()
        .getPlainText()
        .includes('Confirm access questions'),
    )
    assert.deepEqual(await hostSnapshot(), beforeBoardText)
    assert.deepEqual(await childSnapshot(), edited)
    await page.keyboard.press('Control+y')
    await page.waitForFunction(() =>
      window.univerAPI
        .getBoard('prism-pitch-storyboard')
        .getShape('decision-note')
        .getText()
        .getPlainText()
        .includes('Walk both venues before the pilot.'),
    )
    assert.deepEqual(await hostSnapshot(), after)
    assert.deepEqual(await childSnapshot(), edited)
  })
  await gate('nativeBoardMovement', async () => {
    const before = await hostSnapshot()
    const point = await page.evaluate(() =>
      window.univerAPI.getBoard('prism-pitch-storyboard').getElementViewportPoint('offer'),
    )
    assert.ok(point)
    const bounds = await viewport.boundingBox()
    await page.mouse.click(bounds.x + point.x, bounds.y + point.y)
    await page.keyboard.press('ArrowRight')
    await page.waitForFunction(
      (left) =>
        window.univerAPI
          .getBoard('prism-pitch-storyboard')
          .describeElements()
          .find((el) => el.id === 'offer').bounds.left > left,
      before.pages.storyboard.elements['offer'].transform.left,
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
    'Both literal README examples, native Slides editing/history, native Board history/movement and theme checks preserve independent full models',
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
console.log('PASS selected native Slides@Boards Float')
