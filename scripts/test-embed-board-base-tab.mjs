/* eslint-disable no-await-in-loop -- One active host/child and theme state must be exercised in order. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

const { createServer } = await import(pathToFileURL(process.env.SHOWCASE_VITE_MODULE).href)
const codeRoot = 'showcase/embed/boards-in-bases-tab/code'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/embed-board-base-tab')
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
      cacheDir: path.resolve('test-results/embed-board-base-tab/.vite'),
      optimizeDeps: { noDiscovery: true, include: dependencies },
      server: { host: '127.0.0.1', port: 4241, strictPort: true, watch: { ignored: ['**/.next/**'] } },
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
  viewport: { width: Number(process.env.SHOWCASE_VIEWPORT_WIDTH || 1600), height: 1200 },
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
    if (bounds.width > 300) {
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
const root = page.locator('.cove-embed')
const readHost = () => page.evaluate(() => window.univerAPI.getBase('cove-lending-desk').save())
const readChild = () =>
  page.evaluate(() => JSON.parse(JSON.stringify(window.univerAPI.getBoard('cove-service-blueprint').save())))
const table = (name) => root.getByText(name, { exact: true })
async function checkRenderedEndpoints() {
  const layout = await page.evaluate(() =>
    window.univerAPI.executeCommand('board-ui.command.analyze-rendered-layout', {
      unitId: 'cove-service-blueprint',
      subUnitId: 'blueprint',
    }),
  )
  assert.equal(layout.source, 'rendered', 'Inspect the native renderer, not fallback bounds')
  assert.equal(layout.routes.length, 17)
  const elements = (await readChild()).pages.blueprint.elements
  for (const route of layout.routes) {
    assert.equal(route.resolved, true)
    const edge = elements[route.connectorId].connectorData
    for (const [binding, point] of [
      [edge.start, route.points[0]],
      [edge.end, route.points.at(-1)],
    ]) {
      assert.equal(binding.kind, 'shapeSite')
      const { left, top, width, height } = elements[binding.shapeId].transform
      const expected = [
        { x: left + width / 2, y: top },
        { x: left + width, y: top + height / 2 },
        { x: left + width / 2, y: top + height },
        { x: left, y: top + height / 2 },
      ][binding.connectionSiteId]
      assert.ok(
        Math.abs(point.x - expected.x) < 0.01 && Math.abs(point.y - expected.y) < 0.01,
        `${route.connectorId} must end at ${binding.shapeId}'s actual connection site`,
      )
    }
  }
  return layout.routes
}
try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4241/', {
    waitUntil: 'domcontentloaded',
    timeout: 180000,
  })
  await page.waitForFunction(
    () => {
      const el = document.querySelector('.cove-embed')
      return el?.dataset.ready || el?.dataset.error || window.startupFailure
    },
    {},
    { timeout: 120000 },
  )
  assert.equal(await root.getAttribute('data-error'), null)
  assert.equal(await page.evaluate(() => window.startupFailure), null)
  report.descriptor = await page.evaluate(() =>
    window.univerAPI.listEmbeds({ hostUnitId: 'cove-lending-desk' })[0].getDescriptor(),
  )
  assert.equal(report.descriptor.entry, 'bases-table-list-block')
  assert.equal(report.descriptor.childUnitId, 'cove-service-blueprint')
  assert.equal(report.descriptor.hostAnchorId, 'cove-blueprint-tab')
  assert.deepEqual((await readHost()).tableOrder, ['requests', 'cove-blueprint-tab', 'touchpoints'])
  assert.equal((await readHost()).tables.requests.recordOrder.length, 8)
  assert.equal((await readHost()).tables.touchpoints.recordOrder.length, 4)
  assert.equal(await root.locator('iframe,fieldset,details,[data-action],[data-u-comp="embed-float-dom"]').count(), 0)
  await page.waitForFunction(() => window.painted.includes('Field recorder / R-104'))
  await root.screenshot({ path: path.join(directory, 'requests.png') })
  await table('Service blueprint').click()
  const child = root.locator('[data-embed-bases-table-list-host="cove-blueprint-tab"]')
  await child.waitFor()
  await child.locator('[data-board-viewport-host="true"]').waitFor()
  assert.equal(await child.evaluate((el) => getComputedStyle(el).backgroundColor), 'rgb(255, 255, 255)')
  await page.waitForFunction(() => window.painted.join('').includes('A clear handoff'))
  const initial = await readChild()
  assert.equal(initial.pages.blueprint.elementOrder.length, 41)
  assert.equal(Object.values(initial.pages.blueprint.elements).filter((el) => el.type === 'connector').length, 17)
  assert.equal(await page.evaluate(() => window.painted.includes('Enter text')), false)
  report.initialRoutes = await checkRenderedEndpoints()
  await root.screenshot({ path: path.join(directory, 'blueprint.png') })
  const hostBefore = await readHost()
  report.checks.push(
    'Native Base tab opens a real Board with twelve responsibility cards and seventeen bound connectors, beside eight requests/four linked stages; official white CSS and native tools without fixture/iframe/Float',
  )
  const examples = [
    ...(await fs.readFile('showcase/embed/boards-in-bases-tab/README.md', 'utf8')).matchAll(
      /\x60\x60\x60ts\r?\n([\s\S]*?)\x60\x60\x60/g,
    ),
  ]
  assert.equal(examples.length, 2)
  await page.evaluate(() => {
    window.painted = []
  })
  await page.evaluate(examples[0][1])
  await page.waitForFunction(() => window.painted.join('').includes('Confirm the return desk.'))
  assert.equal(
    await page.evaluate(() =>
      window.univerAPI.getBoard('cove-service-blueprint').getShape('desk-collect').getText().getPlainText(),
    ),
    'A clear handoff\nConfirm the return desk.',
  )
  assert.deepEqual(await readHost(), hostBefore)
  report.checks.push(
    'First literal README example changes and repaints the A clear handoff card without modifying the complete host',
  )
  await root.screenshot({ path: path.join(directory, 'edited-board.png') })
  try {
    const afterEdit = await readChild()
    await child.getByRole('button', { name: 'Undo', exact: true }).click()
    await page.waitForFunction(
      () =>
        window.univerAPI.getBoard('cove-service-blueprint').getShape('desk-collect').getText().getPlainText() ===
        'A clear handoff\nName the return point.',
      {},
      { timeout: 5000 },
    )
    await child.getByRole('button', { name: 'Redo', exact: true }).click()
    await page.waitForFunction(
      () =>
        window.univerAPI.getBoard('cove-service-blueprint').getShape('desk-collect').getText().getPlainText() ===
        'A clear handoff\nConfirm the return desk.',
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
        window.univerAPI.getBoard('cove-service-blueprint').getShape('desk-collect').getText().getPlainText() ===
        'A clear handoff\nName the return point.',
      {},
      { timeout: 5000 },
    )
    await page.keyboard.press('Control+y')
    await page.waitForFunction(
      () =>
        window.univerAPI.getBoard('cove-service-blueprint').getShape('desk-collect').getText().getPlainText() ===
        'A clear handoff\nConfirm the return desk.',
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
    const routesBeforeMove = await checkRenderedEndpoints()
    const bounds = await page.evaluate(
      () =>
        window.univerAPI
          .getBoard('cove-service-blueprint')
          .describeElements()
          .find((el) => el.id === 'desk-collect').bounds,
    )
    const point = await page.evaluate(() =>
      window.paintPoints.findLast(
        (p, index, points) =>
          p.text.startsWith('A') &&
          points
            .slice(index, index + 15)
            .map((item) => item.text)
            .join('')
            .startsWith('A clear handoff'),
      ),
    )
    assert.ok(point, 'Use actual character paint geometry to select the note')
    await page.mouse.click(point.x + 12, point.y - 4)
    await page.keyboard.press('ArrowRight')
    await page.waitForFunction(
      (left) =>
        window.univerAPI
          .getBoard('cove-service-blueprint')
          .describeElements()
          .find((el) => el.id === 'desk-collect').bounds.left > left,
      bounds.left,
      { timeout: 5000 },
    )
    await settle()
    report.movedRoutes = await checkRenderedEndpoints()
    assert.notDeepEqual(report.movedRoutes, routesBeforeMove, 'Bound routes must follow native card movement')
    assert.deepEqual(await readHost(), hostBefore)
    await page.keyboard.press('Control+z')
    await page.waitForFunction(
      (left) =>
        window.univerAPI
          .getBoard('cove-service-blueprint')
          .describeElements()
          .find((el) => el.id === 'desk-collect').bounds.left === left,
      bounds.left,
      { timeout: 5000 },
    )
    assert.deepEqual(await readChild(), beforeMove)
    await checkRenderedEndpoints()
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
          p.text.startsWith('A') &&
          points
            .slice(index, index + 15)
            .map((item) => item.text)
            .join('')
            .startsWith('A clear handoff'),
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
          .getBoard('cove-service-blueprint')
          .getShape('desk-collect')
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
        (snapshot) => JSON.stringify(window.univerAPI.getBoard('cove-service-blueprint').save()) !== snapshot,
        previous,
        { timeout: 5000 },
      )
      await settle()
      report.textUndoSteps.push(
        await page.evaluate(() =>
          window.univerAPI.getBoard('cove-service-blueprint').getShape('desk-collect').getText().getPlainText(),
        ),
      )
    }
    assert.deepEqual(await readChild(), beforeTyping)
    for (const key of ['Control+y', 'Control+z']) {
      for (let step = 0; step < report.textUndoSteps.length; step++) {
        const previous = JSON.stringify(await readChild())
        await page.keyboard.press(key)
        await page.waitForFunction(
          (snapshot) => JSON.stringify(window.univerAPI.getBoard('cove-service-blueprint').save()) !== snapshot,
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
      text: window.univerAPI.getBoard('cove-service-blueprint').getShape('desk-collect').getText().getPlainText(),
    }))
    await page.keyboard.press('Escape')
  }
  const edited = await readChild()
  await table('Requests').click()
  await page.waitForFunction(() => window.univerAPI.getBaseUI().getActiveTableId() === 'requests')
  await page.evaluate(examples[1][1])
  assert.equal(
    (await readHost()).tables.requests.records['requests-1'].values.next,
    'Confirm microphone and spare battery',
  )
  assert.deepEqual(await readChild(), edited)
  await table('Touchpoints').click()
  await page.waitForFunction(() => window.univerAPI.getBaseUI().getActiveTableId() === 'touchpoints')
  await page.setViewportSize({ width: 1598, height: 1200 })
  await settle()
  await page.evaluate(() => {
    window.paintPoints = []
  })
  await page.setViewportSize({ width: 1600, height: 1200 })
  await page.waitForFunction(() => window.paintPoints.some((p) => p.text === 'Reserve'))
  const point = await page.evaluate(() => window.paintPoints.findLast((p) => p.text === 'Reserve'))
  const beforeRename = await readHost()
  await page.mouse.dblclick(point.x + 18, point.y - 4)
  await page.keyboard.press('Control+A')
  await page.keyboard.type('Plan a loan')
  await page.keyboard.press('Enter')
  await page.waitForFunction(
    () =>
      window.univerAPI
        .getBase('cove-lending-desk')
        .getTableById('touchpoints')
        .getRecordById('touchpoints-1')
        .getValue('title') === 'Plan a loan',
  )
  const renamed = await readHost()
  for (const [command, expected, label] of [
    ['Undo', beforeRename, 'Reserve'],
    ['Redo', renamed, 'Plan a loan'],
  ]) {
    await page.getByRole('button', { name: command, exact: true }).click()
    await page.waitForFunction(
      (expectedLabel) =>
        window.univerAPI
          .getBase('cove-lending-desk')
          .getTableById('touchpoints')
          .getRecordById('touchpoints-1')
          .getValue('title') === expectedLabel,
      label,
    )
    assert.deepEqual(await readHost(), expected)
    assert.deepEqual(await readChild(), edited)
  }
  await page.evaluate(() => {
    window.painted = []
  })
  await table('Requests').click()
  await page.waitForFunction(() => window.painted.filter((text) => text === 'Plan a loan').length >= 3)
  const links = await page.evaluate(() =>
    ['requests-1', 'requests-2', 'requests-7'].map((id) =>
      window.univerAPI.getBase('cove-lending-desk').getTableById('requests').getRecordById(id).getValue('stage'),
    ),
  )
  assert.ok(links.every((v) => JSON.stringify(v).includes('touchpoints-1') && !JSON.stringify(v).includes('Plan')))
  assert.deepEqual(await readChild(), edited)
  await table('Service blueprint').click()
  await child.waitFor()
  assert.deepEqual(await readChild(), edited)
  const beforeTheme = await readHost()
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
    'Literal Base example, native touchpoint rename/history, three linked labels and host/child navigation preserve both models; only the native Board theme palette may regenerate',
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
console.log('PASS selected native Boards@Bases Tab')
