/* eslint-disable no-await-in-loop -- Each action depends on the previous rendered SDK state. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

import { prepareShowcaseSource } from '../showcase/source-files.ts'

// Optional independent-project gate: the browser must run the exact displayed source.
if (process.env.SHOWCASE_SOURCE_DIR) {
  const sourceDirectory = 'showcase/boards/connector-routing/code'
  const files = Object.fromEntries(
    await Promise.all(
      (await fs.readdir(sourceDirectory)).map(async (name) => [
        `/src/${name}`,
        await fs.readFile(path.join(sourceDirectory, name), 'utf8'),
      ]),
    ),
  )
  const versions = JSON.parse(await fs.readFile('package.json', 'utf8')).dependencies
  const prepared = prepareShowcaseSource(files, versions)
  for (const [name, content] of Object.entries(prepared.files)) {
    const actual = await fs.readFile(path.join(process.env.SHOWCASE_SOURCE_DIR, name.slice(1)), 'utf8')
    if (name === '/package.json') assert.deepEqual(JSON.parse(actual), JSON.parse(content))
    else if (name === '/index.html') assert.equal(actual.trimEnd(), content.trimEnd())
    else assert.equal(actual, content, `${name}: independent project must match displayed source byte-for-byte`)
  }
}

const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/boards-connectors')
const demoURL =
  process.env.SHOWCASE_DEMO_URL ||
  `${process.env.SHOWCASE_BASE_URL || 'http://localhost:3030'}/en-US/playground/boards/connector-routing`
await fs.mkdir(directory, { recursive: true })
const browser = await chromium.launch({ executablePath: chromium.executablePath() })
const page = await browser.newPage({ viewport: { width: 1500, height: 1100 } })
await page.emulateMedia({ colorScheme: 'light' })
const errors = []
const graph = (state) => ({
  elements: state.elements,
  order: state.order,
  connections: state.connections,
  styles: state.styles,
})
// Bound fallback coordinates are derived geometry, not the endpoint's relationship identity.
const identity = ({ fallbackPoint: _fallbackPoint, ...endpoint }) => endpoint
const relationships = (state) =>
  Object.fromEntries(
    Object.entries(state.connections).map(([id, connection]) => [
      id,
      {
        ...connection,
        start: identity(connection.start),
        end: identity(connection.end),
      },
    ]),
  )
const route = (state, id = 'tests-package') => state.rendered.routes.find((item) => item.connectorId === id)
function assertRenderedEndpoints(state) {
  for (const [id, connection] of Object.entries(state.connections)) {
    const renderedRoute = route(state, id)
    assert.equal(renderedRoute.resolved, true, `${id}: real rendered route`)
    for (const [endpoint, actual] of [
      [connection.start, renderedRoute.points[0]],
      [connection.end, renderedRoute.points.at(-1)],
    ]) {
      let expected = endpoint
      if (endpoint.kind === 'shapeSite') {
        const bounds = state.elements.find((element) => element.id === endpoint.shapeId).bounds
        expected = [
          { x: bounds.left + bounds.width / 2, y: bounds.top },
          { x: bounds.left + bounds.width, y: bounds.top + bounds.height / 2 },
          { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height },
          { x: bounds.left, y: bounds.top + bounds.height / 2 },
        ][endpoint.connectionSiteId]
      }
      assert.ok(
        Math.abs(actual.x - expected.x) < 0.01 && Math.abs(actual.y - expected.y) < 0.01,
        `${id}: rendered endpoint must meet its bound node site or its explicit free point`,
      )
    }
  }
}
page.on('pageerror', (error) => errors.push(error.message))
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text())
})
try {
  await page.goto(demoURL, { waitUntil: 'domcontentloaded', timeout: 300000 })
  await page.locator('.board-feature[data-ready="true"]').waitFor({ state: 'attached', timeout: 90000 })
  await page.locator('.board-feature-editor canvas').first().waitFor({ state: 'visible' })
  const controls = page.locator('.board-feature-controls')
  const model = async () => JSON.parse(await page.locator('.board-feature output').textContent())
  const idle = () => page.waitForFunction(() => document.querySelector('.board-feature-controls')?.disabled === false)
  const click = async (name, expectError = false) => {
    await controls.getByRole('button', { name, exact: true }).click()
    await idle()
    assert.equal(
      await page.locator('.board-feature [role="alert"]').isVisible(),
      expectError,
      await page.locator('.board-feature [role="alert"]').textContent(),
    )
    return model()
  }
  const choose = async (id) => {
    await controls.getByRole('combobox', { name: 'Variant', exact: true }).selectOption(id)
    await idle()
    assert.equal(
      await page.locator('.board-feature [role="alert"]').isVisible(),
      false,
      await page.locator('.board-feature [role="alert"]').textContent(),
    )
    return model()
  }
  const capture = async (name) => {
    await page.evaluate(() => document.fonts.ready)
    await page.locator('.board-feature').screenshot({ path: path.join(directory, `${name}.png`) })
  }
  const baseline = await model()
  await fs.writeFile(path.join(directory, 'baseline.json'), JSON.stringify(baseline, null, 2))
  assert.equal(baseline.elements.filter((element) => element.type === 'shape').length, 8)
  assert.equal(Object.keys(baseline.connections).length, 12)
  assert.equal(baseline.rendered.source, 'rendered')
  assert.ok(
    baseline.viewport.zoomRatio > 0.6,
    'Fit content should make the feature readable, not a tiny whole-page thumbnail',
  )
  assert.equal(route(baseline).resolved, true)
  assert.ok(route(baseline).points.length >= 2)
  assert.equal(baseline.connections['staging-release'].end.kind, 'free')
  const originalConnection = baseline.connections['tests-package']
  assertRenderedEndpoints(baseline)
  await capture('baseline')
  if (demoURL.includes('/playground/')) {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.locator('.board-feature[data-theme="dark"][data-ready="true"]').waitFor()
    assert.equal(await page.locator('.board-feature-editor canvas').count(), 1, 'Theme remount leaves one canvas')
    assert.equal(
      await page.locator('.board-feature').evaluate((element) => getComputedStyle(element).backgroundColor),
      'rgb(16, 24, 40)',
    )
    await page.emulateMedia({ colorScheme: 'light' })
    await page.locator('.board-feature[data-theme="light"][data-ready="true"]').waitFor()
    assert.equal(
      await page.locator('.board-feature-editor canvas').count(),
      1,
      'Second theme remount leaves one canvas',
    )
    assert.deepEqual(graph(await model()), graph(baseline), 'Theme remount preserves the baseline fixture')
  }
  for (const [variant, routing] of [
    ['straight', 'straight'],
    ['curve', 'curve'],
    ['manual', 'freePolyline'],
    ['orthogonal', 'orthogonal'],
  ]) {
    const state = await choose(variant)
    assert.equal(state.connections['tests-package'].routing, routing)
    assert.deepEqual(identity(state.connections['tests-package'].start), identity(originalConnection.start))
    assert.deepEqual(identity(state.connections['tests-package'].end), identity(originalConnection.end))
    assert.equal(route(state).resolved, true)
    assert.ok(route(state).points.every((point) => Number.isFinite(point.x) && Number.isFinite(point.y)))
    if (variant === 'manual') {
      assert.equal(state.connections['tests-package'].routingMode, 'manual')
      assert.equal(state.connections['tests-package'].waypoints.length, 2)
    }
    assertRenderedEndpoints(state)
    await capture(variant)
  }
  const beforeMove = await model()
  const moved = await click('Move Tests decision')
  assert.deepEqual(
    relationships(moved),
    relationships(beforeMove),
    'Moving a decision must preserve all endpoint relationships',
  )
  assert.equal(moved.elements.find((element) => element.id === 'tests').bounds.left, 535)
  for (const id of ['lint-tests', 'tests-package', 'tests-quarantine', 'staging-tests']) {
    assert.notDeepEqual(
      route(moved, id).points,
      route(beforeMove, id).points,
      `${id}: actual rendered route must follow the moved decision`,
    )
  }
  assertRenderedEndpoints(moved)
  await capture('decision-moved')
  await click('Undo')
  assert.deepEqual(graph(await model()), graph(beforeMove))
  await click('Redo')
  assert.deepEqual(graph(await model()), graph(moved))
  const detached = await click('Detach target')
  assert.equal(detached.connections['tests-package'].end.kind, 'free')
  assert.deepEqual(identity(detached.connections['tests-package'].start), identity(originalConnection.start))
  assertRenderedEndpoints(detached)
  await click('Reattach target')
  assert.deepEqual(identity((await model()).connections['tests-package'].end), identity(originalConnection.end))
  await click('Repair promotion')
  assert.notEqual((await model()).connections['staging-release'].end.kind, 'free')
  assertRenderedEndpoints(await model())
  await controls.getByRole('spinbutton', { name: 'Stroke width', exact: true }).fill('4')
  const styled = await click('Apply dashed arrow')
  assert.equal(styled.styles['tests-package'].strokeWidth, 4)
  assert.deepEqual(styled.styles['tests-package'].dash, [8, 5])
  assert.equal(styled.styles['tests-package'].endMarker.type, 'openArrow')
  await capture('dashed-arrow')
  await controls.getByRole('spinbutton', { name: 'Stroke width', exact: true }).fill('0')
  await click('Apply dashed arrow', true)
  await click('Inspect')
  assert.deepEqual(graph(await model()), graph(styled), 'Rejected width must not mutate the graph')
  await click('Try missing target', true)
  await click('Inspect')
  assert.deepEqual(graph(await model()), graph(styled), 'Rejected target must not mutate the connection')
  await click('Empty board')
  const empty = await model()
  assert.equal(empty.elements.length, 0)
  assert.equal(empty.rendered.routes.length, 0)
  await capture('empty')
  await click('Detach target', true)
  await click('Reset')
  assert.deepEqual(graph(await model()), graph(baseline), 'Exact graph reset')
  await click('Reset')
  assert.deepEqual(graph(await model()), graph(baseline), 'Repeated graph reset')
  await controls.getByRole('combobox', { name: 'Variant', exact: true }).focus()
  await page.keyboard.press('ArrowDown')
  await idle()
  assert.equal((await model()).connections['tests-package'].routing, 'straight', 'Keyboard routing selection')
  await page.keyboard.press('Tab')
  assert.equal(
    await controls
      .getByRole('spinbutton', { name: 'Stroke width', exact: true })
      .evaluate((element) => document.activeElement === element),
    true,
  )
  assert.equal(
    await controls
      .getByRole('spinbutton', { name: 'Stroke width', exact: true })
      .evaluate((element) => getComputedStyle(element).outlineStyle),
    'solid',
  )
  await controls.getByRole('button', { name: 'Reset', exact: true }).focus()
  await page.keyboard.press('Enter')
  await idle()
  assert.deepEqual(graph(await model()), graph(baseline), 'Keyboard reset')
  const beforeDrag = await click('Inspect')
  const canvas = await page.locator('.board-feature-editor canvas').first().boundingBox()
  const decision = beforeDrag.elements.find((element) => element.id === 'tests').bounds
  const { zoomRatio, panOffset } = beforeDrag.viewport
  const start = {
    x: canvas.x + panOffset.x + (decision.left + decision.width / 2) * zoomRatio,
    y: canvas.y + panOffset.y + (decision.top + decision.height / 2) * zoomRatio,
  }
  await page.mouse.move(start.x, start.y)
  await page.mouse.down()
  await page.mouse.move(start.x + 85 * zoomRatio, start.y + 125 * zoomRatio, { steps: 12 })
  await page.mouse.up()
  const dragged = await click('Inspect')
  assert.notDeepEqual(dragged.elements.find((element) => element.id === 'tests').bounds, decision, 'Native canvas drag')
  assert.deepEqual(relationships(dragged), relationships(beforeDrag), 'Canvas drag preserves endpoint relationships')
  for (const id of ['lint-tests', 'tests-package', 'tests-quarantine', 'staging-tests']) {
    assert.notDeepEqual(route(dragged, id).points, route(beforeDrag, id).points, `${id}: follows native drag`)
  }
  assertRenderedEndpoints(dragged)
  await capture('native-drag')
  await click('Undo')
  assert.deepEqual(graph(await model()), graph(beforeDrag), 'Native drag undo')
  await click('Redo')
  assert.deepEqual(graph(await model()), graph(dragged), 'Native drag redo')
  await click('Reset')
  const beforeKeyboardCanvas = await click('Inspect')
  const keyboardDecision = beforeKeyboardCanvas.elements.find((element) => element.id === 'tests').bounds
  await controls.getByRole('button', { name: 'Focus Tests decision', exact: true }).focus()
  await page.keyboard.press('Enter')
  await idle()
  assert.equal(
    await page.locator('.board-feature-editor').evaluate((element) => document.activeElement === element),
    true,
    'Accessible action must focus the Board canvas',
  )
  assert.equal(
    await page.locator('.board-feature-editor').evaluate((element) => getComputedStyle(element).outlineStyle),
    'solid',
  )
  await page.keyboard.press('ArrowRight')
  const keyboardMoved = await click('Inspect')
  assert.equal(keyboardMoved.elements.find((element) => element.id === 'tests').bounds.left, keyboardDecision.left + 1)
  assert.deepEqual(
    relationships(keyboardMoved),
    relationships(beforeKeyboardCanvas),
    'Keyboard canvas move preserves bindings',
  )
  assertRenderedEndpoints(keyboardMoved)
  await click('Undo')
  assert.deepEqual(graph(await model()), graph(beforeKeyboardCanvas), 'Keyboard canvas move undo')
  await page.setViewportSize({ width: 375, height: 900 })
  await click('Fit diagram')
  assert.equal(
    await page.locator('.board-feature').evaluate((element) => element.scrollWidth <= element.clientWidth),
    true,
    'Narrow layout must not overflow horizontally',
  )
  assert.ok((await page.locator('.board-feature-editor canvas').first().boundingBox()).height >= 258)
  assert.equal(await page.locator('.board-feature').evaluate((element) => getComputedStyle(element).overflowY), 'auto')
  await controls.getByRole('button', { name: 'Reset', exact: true }).scrollIntoViewIfNeeded()
  assert.equal(await controls.getByRole('button', { name: 'Reset', exact: true }).isVisible(), true)
  await capture('narrow')
  await page.setViewportSize({ width: 1500, height: 1100 })
  await click('Reset')
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.locator('.board-feature[data-ready="true"]').waitFor({ state: 'attached' })
  assert.deepEqual(graph(await model()), graph(baseline), 'Clean remount')
  assert.deepEqual(errors, [], 'Browser errors')
  await fs.writeFile(
    path.join(directory, 'result.json'),
    JSON.stringify(
      {
        passed: true,
        url: demoURL,
        sourceDirectory: process.env.SHOWCASE_SOURCE_DIR ?? null,
        checks:
          'routing variants, every rendered endpoint, API/native/keyboard movement, detach/reattach, repair, styles, invalid input, undo/redo, empty, reset twice, theme remount, narrow layout, keyboard controls, remount, console',
      },
      null,
      2,
    ),
  )
  console.log('PASS Boards connector routing')
} catch (error) {
  await page.screenshot({ path: path.join(directory, 'failure.png') }).catch(() => {})
  await fs.writeFile(
    path.join(directory, 'result.json'),
    JSON.stringify({ passed: false, url: demoURL, error: String(error), errors }, null, 2),
  )
  throw error
} finally {
  await browser.close()
}
