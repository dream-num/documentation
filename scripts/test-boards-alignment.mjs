/* eslint-disable no-await-in-loop -- Layout, selection and history share one active Board. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

import { chromium } from 'playwright'

const { createServer } = await import(pathToFileURL(process.env.SHOWCASE_VITE_MODULE).href)
const codeRoot = 'showcase/boards/alignment-spacing/code'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/boards-alignment-native')
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
      cacheDir: path.resolve('test-results/boards-alignment-native/.vite'),
      optimizeDeps: { noDiscovery: true, include: dependencies },
      server: { host: '127.0.0.1', port: 4225, strictPort: true, watch: { ignored: ['**/.next/**'] } },
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
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
const report = { passed: false, checks: [], errors: [], warnings: [] }
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
  const fill = CanvasRenderingContext2D.prototype.fillText
  CanvasRenderingContext2D.prototype.fillText = function (...args) {
    window.painted.push(String(args[0]))
    return Reflect.apply(fill, this, args)
  }
})
const settle = () =>
  page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))))

const targetIds = ['assignment', 'draft', 'copy', 'art', 'publish']
const root = page.locator('.alignment-demo')
const read = () =>
  // Match the serializable snapshot contract: optional undefined flip flags are not persisted fields.
  page.evaluate(() =>
    JSON.parse(
      JSON.stringify(window.univerAPI.getBoard('editorial-alignment-board').describeElements({ includeHidden: true })),
    ),
  )
const boxes = (state) => targetIds.map((id) => state.find((el) => el.id === id).bounds)
const close = (a, b) => assert.ok(Math.abs(a - b) < 0.02, `${a} != ${b}`)
const undo = async () => {
  assert.equal(await page.evaluate(() => window.univerAPI.getBoard('editorial-alignment-board').undo()), true)
  await settle()
}
const redo = async () => {
  assert.equal(await page.evaluate(() => window.univerAPI.getBoard('editorial-alignment-board').redo()), true)
  await settle()
}
function gaps(state, axis, expected) {
  const pos = axis === 'horizontal' ? 'left' : 'top'
  const size = axis === 'horizontal' ? 'width' : 'height'
  const sorted = boxes(state).toSorted((a, b) => a[pos] - b[pos])
  const values = sorted.slice(1).map((b, i) => b[pos] - sorted[i][pos] - sorted[i][size])
  for (const value of values) close(value, expected ?? values[0])
}
const point = async (id) => {
  const p = await page.evaluate(
    (elementId) => window.univerAPI.getBoard('editorial-alignment-board').getElementViewportPoint(elementId),
    id,
  )
  const canvas = await root.locator('canvas').first().boundingBox()
  assert.ok(p && canvas)
  return { x: canvas.x + p.x, y: canvas.y + p.y }
}
try {
  await page.goto(process.env.SHOWCASE_ORIGIN || 'http://127.0.0.1:4225/', {
    waitUntil: 'domcontentloaded',
    timeout: 180000,
  })
  await root.locator(':scope[data-ready=true]').waitFor({ timeout: 120000 })
  await settle()
  assert.equal(await root.locator(':scope > fieldset,:scope > details,[data-action]').count(), 0)
  const baseline = await read()
  assert.equal(baseline.filter((el) => el.type === 'shape').length, 8)
  assert.equal(baseline.filter((el) => el.type === 'connector').length, 12)
  await page.waitForFunction(() => window.painted.join('').includes('Assignment'))
  await root.screenshot({ path: path.join(directory, 'publishing-desk.png') })
  for (const [direction, coordinate, expected] of [
    ['top', (b) => b.top, 65],
    ['middle', (b) => b.top + b.height / 2, 160],
    ['bottom', (b) => b.top + b.height, 255],
    ['left', (b) => b.left, 70],
    ['center', (b) => b.left + b.width / 2, 595],
    ['right', (b) => b.left + b.width, 1120],
  ]) {
    assert.equal(
      await page.evaluate(
        (input) => window.univerAPI.getBoard('editorial-alignment-board').alignElements(input.ids, input.direction),
        { ids: targetIds, direction },
      ),
      true,
    )
    const state = await read()
    for (const b of boxes(state)) close(coordinate(b), expected)
    for (const id of ['review', 'rights', 'archive'])
      assert.deepEqual(
        state.find((el) => el.id === id),
        baseline.find((el) => el.id === id),
      )
    await undo()
    assert.deepEqual(await read(), baseline)
    await redo()
    assert.deepEqual(await read(), state)
    await undo()
  }
  report.checks.push('Six Facade alignments preserve supporting nodes; Undo/Redo restores full described elements')
  for (const axis of ['horizontal', 'vertical']) {
    await page.evaluate(
      (input) => window.univerAPI.getBoard('editorial-alignment-board').distributeElements(input.ids, input.axis),
      { ids: targetIds, axis },
    )
    gaps(await read(), axis)
    await undo()
    assert.deepEqual(await read(), baseline)
  }
  const examples = [
    ...(await fs.readFile('showcase/boards/alignment-spacing/README.md', 'utf8')).matchAll(/```ts\n([\s\S]*?)```/g),
  ]
  assert.equal(examples.length, 2)
  await page.evaluate(examples[0][1])
  for (const b of boxes(await read())) close(b.top, 65)
  gaps(await read(), 'horizontal', 85)
  await settle()
  await root.screenshot({ path: path.join(directory, 'aligned-handoff.png') })
  await undo()
  for (const b of boxes(await read())) close(b.top, 65)
  await undo()
  assert.deepEqual(await read(), baseline)
  await page.evaluate(examples[1][1])
  gaps(await read(), 'horizontal', 40)
  await undo()
  for (const direction of ['horizontal', 'vertical'])
    for (const gap of [0, 40, 120]) {
      await page.evaluate(
        (input) =>
          window.univerAPI
            .getBoard('editorial-alignment-board')
            .arrangeElements(input.ids, { direction: input.direction, gap: input.gap, start: { x: 70, y: 65 } }),
        { ids: targetIds, direction, gap },
      )
      gaps(await read(), direction, gap)
      await undo()
      assert.deepEqual(await read(), baseline)
    }
  assert.equal(
    await page.evaluate(() =>
      window.univerAPI.getBoard('editorial-alignment-board').alignElements(['assignment', 'missing-card'], 'top'),
    ),
    false,
  )
  assert.deepEqual(await read(), baseline)
  report.checks.push(
    'Both README examples execute verbatim; distributions, horizontal/vertical gap variants 0/40/120 and atomic missing-target rejection pass',
  )
  for (const [index, id] of targetIds.entries()) {
    const p = await point(id)
    if (index) await page.keyboard.down('Shift')
    await page.mouse.click(p.x, p.y)
    if (index) await page.keyboard.up('Shift')
  }
  const p = await point('assignment')
  const nativeBefore = await read()
  await page.mouse.click(p.x, p.y, { button: 'right' })
  await page.getByText('Align', { exact: true }).hover()
  await page.screenshot({ path: path.join(directory, 'native-align-menu.png') })
  await page.getByText('Align Top', { exact: true }).click()
  await settle()
  for (const b of boxes(await read())) close(b.top, 65)
  await page.getByRole('button', { name: 'Undo', exact: true }).click()
  await settle()
  assert.deepEqual(await read(), nativeBefore)
  report.checks.push(
    'Native Shift-click selection, context-menu Align Top and native Undo operate without a host toolbar',
  )
  const draft = await point('draft')
  await page.mouse.click(draft.x, draft.y)
  await page.keyboard.press('ArrowRight')
  await settle()
  close(boxes(await read())[1].left, 281)
  await page.keyboard.press('Control+z')
  await settle()
  assert.deepEqual(await read(), nativeBefore)
  await page.evaluate(() =>
    window.univerAPI
      .getBoard('editorial-alignment-board')
      .arrangeElements(['assignment', 'draft', 'copy', 'art', 'publish'], {
        direction: 'horizontal',
        gap: 40,
        start: { x: 70, y: 65 },
      }),
  )
  const edited = await read()
  for (const dark of [true, false]) {
    await page.evaluate((enabled) => window.univerAPI.toggleDarkMode(enabled), dark)
    await settle()
    assert.deepEqual(await read(), edited)
  }
  report.checks.push('Native keyboard movement and live Facade theme changes preserve actual edited elements')
  await undo()
  await page.getByRole('button', { name: 'Zoom options', exact: true }).click()
  await page.getByText('Zoom to 100%', { exact: true }).click()
  await settle()
  report.snapping = []
  for (const [label, target, bypass] of [
    ['soft', 93, false],
    ['hard', 91, false],
    ['bypass', 91, true],
    ['breakaway', 105, false],
  ]) {
    const before = await read()
    // Facade layout may retain multi-selection. Clear it natively before testing one-card attraction.
    const canvas = await root.locator('canvas').first().boundingBox()
    await page.mouse.click(canvas.x + 100, canvas.y + canvas.height - 120)
    const start = await point('draft')
    const top = boxes(before)[1].top
    await page.mouse.click(start.x, start.y)
    await page.mouse.move(start.x, start.y)
    await page.mouse.down()
    if (bypass) await page.keyboard.down('Control')
    if (label === 'breakaway') await page.mouse.move(start.x, start.y + 93 - top)
    await page.mouse.move(start.x, start.y + target - top)
    await settle()
    await root.screenshot({ path: path.join(directory, `snap-${label}.png`) })
    await page.mouse.up()
    if (bypass) await page.keyboard.up('Control')
    await settle()
    const actual = boxes(await read())[1].top
    report.snapping.push({ label, requestedTop: target, actualTop: actual })
    if (label === 'soft') assert.ok(actual > 90 && actual < 93, `Soft attraction: ${actual}`)
    else close(actual, label === 'hard' ? 90 : target)
    await page.getByRole('button', { name: 'Undo', exact: true }).click()
    await settle()
    for (const [index, box] of boxes(await read()).entries()) assert.deepEqual(box, boxes(before)[index])
  }
  report.checks.push(
    'Real pointer dragging at native 100% zoom distinguishes soft attraction, hard snapping, Ctrl bypass and breakaway; native Undo restores card bounds',
  )
  assert.deepEqual(
    report.warnings.filter((message) => message.includes('[IconManager]')),
    [],
  )
  assert.deepEqual(report.errors, [])
  await page.evaluate(() => window.dispatchEvent(new Event('pagehide')))
  await settle()
  assert.equal(await root.count(), 0)
  assert.equal(await page.evaluate(() => typeof window.univerAPI), 'undefined')
  assert.deepEqual(report.errors, [])
  report.passed = true
} catch (error) {
  report.failure = error.stack
  report.diagnostic = await page
    .evaluate(() => ({ text: document.body.innerText.slice(-4000), painted: window.painted?.slice(-80) }))
    .catch(() => null)
  await page.screenshot({ path: path.join(directory, 'failure.png'), fullPage: true }).catch(() => {})
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  await browser.close()
  await server?.close()
}
assert.equal(report.passed, true, report.failure)
console.log('PASS native-only Boards alignment, Facade variants and literal README examples')
