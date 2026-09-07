/* eslint-disable no-await-in-loop -- Native menu tabs share one active ribbon and must be visited sequentially. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

const { createServer } = await import(pathToFileURL(process.env.SHOWCASE_VITE_MODULE).href)
const codeRoot = 'showcase/embed/bases-in-boards-float/code'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-base-board-float')
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
      cacheDir: path.resolve('test-results/embed-base-board-float/.vite'),
      optimizeDeps: { noDiscovery: true, include: dependencies },
      server: { host: '127.0.0.1', port: 4249, strictPort: true, watch: { ignored: ['**/.next/**'] } },
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
        fullscreen: Boolean(this.canvas.closest('[data-embed-fullscreen-shell]')),
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
  page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getBoard('grove-route-research').save())))
const childSnapshot = () =>
  page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getBase('grove-research-backlog').save())))
const root = page.locator('.grove-embed')
const child = page.locator('[data-u-comp="embed-float-dom"]')
const fullscreen = page.locator('[data-embed-fullscreen-shell="true"]')
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
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4249/', {
    waitUntil: 'domcontentloaded',
    timeout: 180000,
  })
  await page.waitForFunction(
    () =>
      document.querySelector('.grove-embed')?.dataset.ready ||
      document.querySelector('.grove-embed')?.dataset.error ||
      window.startupFailure,
    {},
    { timeout: 120000 },
  )
  assert.equal(await root.getAttribute('data-error'), null)
  assert.equal(await page.evaluate(() => window.startupFailure), null)
  report.descriptor = await page.evaluate(() =>
    window.univerAPI.listEmbeds({ hostUnitId: 'grove-route-research' })[0].getDescriptor(),
  )
  assert.equal(report.descriptor.entry, 'boards-floating-object')
  assert.equal(report.descriptor.childUnitId, 'grove-research-backlog')
  assert.equal(report.descriptor.hostAnchorId, 'grove-base-float-anchor')
  assert.equal(report.descriptor.context.resolved, true)
  assert.equal((await hostSnapshot()).pages.research.elementOrder.length, 11)
  assert.equal(await root.locator('iframe,fieldset,details,[data-action]').count(), 0)
  assert.deepEqual((await childSnapshot()).tableOrder, ['questions', 'themes'])
  assert.equal((await childSnapshot()).tables.questions.recordOrder.length, 9)
  assert.equal((await childSnapshot()).tables.themes.recordOrder.length, 4)
  await child.dblclick({ position: { x: 180, y: 110 } })
  await page.waitForFunction(
    () =>
      document.querySelector('[data-u-comp="embed-float-dom"]')?.getAttribute('data-embed-float-stage') === 'stage2',
  )
  await page.waitForFunction(() => window.painted.join('').includes('Late turn cue'))
  await page.screenshot({ path: path.join(directory, 'research-board.png'), fullPage: true })
  report.checks.push(
    'Native BoardFloating Base with nine distinct research questions/four linked themes and eleven Board elements; no fixture, duplicate toolbar or iframe',
  )
  const hostBefore = await hostSnapshot()
  const initial = await childSnapshot()
  const examples = [
    ...(await fs.readFile('showcase/embed/bases-in-boards-float/README.md', 'utf8')).matchAll(
      /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
    ),
  ]
  assert.equal(examples.length, 2)
  await page.evaluate(() => {
    window.painted = []
  })
  assert.equal(await page.evaluate(examples[0][1]), true)
  await page.waitForFunction(() => window.painted.join('').includes('Move the cue before'))
  assert.deepEqual(await hostSnapshot(), hostBefore)
  const afterFacade = await childSnapshot()
  const menu = page.locator('[data-u-comp="base-embed-floating-menu"]')
  await gate('nativeBaseHistory', async () => {
    for (const [command, expected] of [
      ['Undo', initial],
      ['Redo', afterFacade],
    ]) {
      await menu.getByRole('button', { name: command, exact: true }).click()
      await settle()
      assert.deepEqual(await childSnapshot(), expected)
      assert.deepEqual(await hostSnapshot(), hostBefore)
    }
  })
  await menu.getByRole('button', { name: 'Enter fullscreen', exact: true }).click()
  await fullscreen.waitFor({ timeout: 8000 })
  assert.equal(
    await fullscreen.locator('[data-u-comp="base-canvas-root"]').evaluate((el) => getComputedStyle(el).backgroundColor),
    'rgb(255, 255, 255)',
  )
  report.gates.nativeFullscreen = { passed: true }
  await page.evaluate(() => {
    window.painted = []
    window.paintPoints = []
  })
  await fullscreen.getByText('Themes', { exact: true }).click()
  await page.waitForFunction(() => window.paintPoints.some((p) => p.text === 'Wayfinding' && p.fullscreen))
  const themePoint = await page.evaluate(() =>
    window.paintPoints.findLast((p) => p.text === 'Wayfinding' && p.fullscreen),
  )
  const beforeRename = await childSnapshot()
  await page.mouse.dblclick(themePoint.x + 20, themePoint.y - 4)
  await page.keyboard.press('Control+A')
  await page.keyboard.type('Route finding')
  await page.keyboard.press('Enter')
  await page.waitForFunction(
    () =>
      window.univerAPI
        .getBase('grove-research-backlog')
        .getTableById('themes')
        .getRecordById('themes-1')
        .getValue('title') === 'Route finding',
  )
  const renamed = await childSnapshot()
  assert.deepEqual(await hostSnapshot(), hostBefore)
  await gate('nativeBaseTypingHistory', async () => {
    for (const [command, expected] of [
      ['Undo', beforeRename],
      ['Redo', renamed],
    ]) {
      await fullscreen.getByRole('button', { name: command, exact: true }).click()
      await settle()
      assert.deepEqual(await childSnapshot(), expected)
      assert.deepEqual(await hostSnapshot(), hostBefore)
    }
  })
  await page.screenshot({ path: path.join(directory, 'themes.png'), fullPage: true })
  await page.evaluate(() => {
    window.painted = []
  })
  await fullscreen.getByText('Questions', { exact: true }).click()
  await page.waitForFunction(() => window.painted.filter((t) => t === 'Route finding').length >= 3)
  const links = await page.evaluate(() =>
    ['questions-1', 'questions-5', 'questions-9'].map((id) =>
      window.univerAPI.getBase('grove-research-backlog').getTableById('questions').getRecordById(id).getValue('theme'),
    ),
  )
  assert.ok(links.every((v) => JSON.stringify(v).includes('themes-1') && !JSON.stringify(v).includes('Route')))
  await page.screenshot({ path: path.join(directory, 'linked-questions.png'), fullPage: true })
  report.gates.nativeLinkedLabels = { passed: true }
  assert.deepEqual(await hostSnapshot(), hostBefore)
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
      window.univerAPI.getBoard('grove-route-research').getShape('decision-note').getText().getPlainText(),
    )
  assert.ok((await boardText()).includes('Walk the short loop before changing signs.'))
  assert.deepEqual(await childSnapshot(), edited)
  await gate('nativeBoardHistory', async () => {
    const after = await hostSnapshot()
    await page.keyboard.press('Control+z')
    await page.waitForFunction(() =>
      window.univerAPI
        .getBoard('grove-route-research')
        .getShape('decision-note')
        .getText()
        .getPlainText()
        .includes('Test route choices'),
    )
    assert.deepEqual(await hostSnapshot(), beforeBoardText)
    assert.deepEqual(await childSnapshot(), edited)
    await page.keyboard.press('Control+y')
    await page.waitForFunction(() =>
      window.univerAPI
        .getBoard('grove-route-research')
        .getShape('decision-note')
        .getText()
        .getPlainText()
        .includes('Walk the short loop before changing signs.'),
    )
    assert.deepEqual(await hostSnapshot(), after)
    assert.deepEqual(await childSnapshot(), edited)
  })
  await gate('nativeBoardMovement', async () => {
    const before = await hostSnapshot()
    const point = await page.evaluate(() =>
      window.univerAPI.getBoard('grove-route-research').getElementViewportPoint('comfort'),
    )
    assert.ok(point)
    const bounds = await viewport.boundingBox()
    await page.mouse.click(bounds.x + point.x, bounds.y + point.y)
    await page.keyboard.press('ArrowRight')
    await page.waitForFunction(
      (left) =>
        window.univerAPI
          .getBoard('grove-route-research')
          .describeElements()
          .find((el) => el.id === 'comfort').bounds.left > left,
      before.pages.research.elements['comfort'].transform.left,
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
    'Both literal README examples, native Base editing/linked labels, native Board history/movement and theme checks preserve independent full models',
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
console.log('PASS selected native Bases@Boards Float')
