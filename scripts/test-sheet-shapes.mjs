/* eslint-disable no-await-in-loop -- Compare native render state after each public Facade action. */
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { chromium } from 'playwright'

const url = process.env.SHOWCASE_DEMO_URL || 'http://127.0.0.1:4209'
const directory = path.resolve(process.env.SHOWCASE_RESULTS_DIR || 'test-results/sheet-shapes')
await fs.mkdir(directory, { recursive: true })
const report = { passed: false, checks: [], errors: [], networkWrites: [], paints: [] }
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, colorScheme: 'light' })
page.setDefaultTimeout(30000)
page.on('pageerror', (e) => report.errors.push(e.stack || e.message))
page.on('request', (r) => {
  if (!['GET', 'HEAD', 'OPTIONS'].includes(r.method()))
    report.networkWrites.push({ url: r.url(), nextAction: !!r.headers()['next-action'] })
})
const root = page.locator('.sheet-shapes-demo')
const read = async () => JSON.parse(await root.locator('pre').textContent())
const ready = () => page.locator('.sheet-shapes-demo[data-ready="true"]').waitFor()
async function controls() {
  const panel = root.locator('.shape-controls')
  if (!(await panel.evaluate((e) => e.open))) await panel.locator('summary').click()
}
async function action(name) {
  await controls()
  await root.locator('[data-action="' + name + '"]').click()
  await ready()
  assert.doesNotMatch(await root.getByRole('status').textContent(), /Action failed/)
}
async function choose(label, value) {
  await controls()
  await root.getByLabel(label, { exact: true }).selectOption(value)
}
async function target(name) {
  const state = await read()
  const item = state.shapes.find((s) => s.name === name)
  assert.ok(item, name)
  await choose('Shape target', item.id)
  await page.waitForFunction(
    (id) => JSON.parse(document.querySelector('.sheet-shapes-demo pre').textContent).target === id,
    item.id,
  )
  return item.id
}
const picked = async () => {
  const s = await read()
  return s.shapes.find((x) => x.id === s.target)
}
const capture = (name) => page.screenshot({ path: path.join(directory, name + '.png'), fullPage: true })
const paint = () =>
  root.locator('canvas[id^="univer-sheet-main-canvas"]').evaluate((canvas) => {
    const width = Math.min(canvas.width - 50, 800),
      height = Math.min(canvas.height - 35, 320)
    const bytes = canvas.getContext('2d').getImageData(50, 35, width, height).data
    let hash = 2166136261,
      colored = 0
    for (let i = 0; i < bytes.length; i += 4) {
      for (let c = 0; c < 4; c++) hash = Math.imul(hash ^ bytes[i + c], 16777619) >>> 0
      if (
        bytes[i + 3] > 100 &&
        Math.max(bytes[i], bytes[i + 1], bytes[i + 2]) - Math.min(bytes[i], bytes[i + 1], bytes[i + 2]) > 45
      )
        colored++
    }
    return { hash, colored }
  })
async function settled(previous) {
  const deadline = Date.now() + 15000
  let last,
    stable = 0
  while (Date.now() < deadline) {
    const next = await paint()
    stable = next.hash === last?.hash && next.hash !== previous ? stable + 1 : 0
    if (stable >= 2) return next
    last = next
    await page.waitForTimeout(160)
  }
  assert.fail('Native shape paint did not settle/change: ' + JSON.stringify(last))
}
try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 240000 })
  await page.locator('.sheet-shapes-demo[data-ready="true"]').waitFor({ timeout: 180000 })
  assert.equal(
    await root.locator('[data-u-comp="workbench-layout"]').evaluate((e) => getComputedStyle(e).backgroundColor),
    'rgb(255, 255, 255)',
  )
  let state = await read()
  assert.equal(state.shapes.length, 6)
  assert.equal(state.shapes.filter((s) => s.connector).length, 2)
  const canvasSize = await root
    .locator('canvas[id^="univer-sheet-main-canvas"]')
    .evaluate((c) => ({ width: c.width, height: c.height }))
  for (const shape of state.shapes.filter((s) => !s.connector)) {
    const t = shape.snapshot.transform
    assert.ok(
      t.left + t.width <= canvasSize.width && t.top + t.height <= canvasSize.height,
      'Initial shape fits the native canvas: ' + shape.name,
    )
  }
  const originalData = state.taskData
  assert.deepEqual(
    originalData.slice(1).map((r) => r[2]),
    [6.5, 0, null, 3.25],
  )
  assert.equal(await root.getByLabel('Worksheet', { exact: true }).locator('option').count(), 4)
  let painted = await settled()
  assert.ok(painted.colored > 3000)
  await capture('initial')
  await page.waitForTimeout(3300)
  assert.equal((await read()).activeSheet, 'workbench', 'No delayed automatic worksheet switch')
  report.checks.push(
    'Opaque native white CSS, original numeric edge cases, six painted shapes/connectors, four sheets and no timed navigation',
  )

  const intakeId = await target('Intake')
  for (const [value, type] of [
    ['Rect', 'rect'],
    ['Ellipse', 'ellipse'],
    ['Diamond', 'diamond'],
    ['SmileyFace', 'smileyFace'],
    ['Heart', 'heart'],
    ['Star5', 'star5'],
    ['Cloud', 'cloud'],
    ['RoundRect', 'roundRect'],
  ]) {
    await choose('Shape preset', value)
    await action('preset')
    assert.equal((await picked()).snapshot.shapeType, type)
    assert.equal((await picked()).id, intakeId)
    painted = await settled(painted.hash)
    report.paints.push({ variant: value, ...painted })
  }
  await action('adjust')
  assert.equal((await picked()).snapshot.shapeData.adjustValues.adj, 40000)
  painted = await settled(painted.hash)
  await action('custom')
  assert.equal((await picked()).snapshot.shapeData.isCustom, true)
  painted = await settled(painted.hash)
  await capture('custom-path')
  await choose('Shape preset', 'RoundRect')
  await action('preset')
  assert.notEqual((await picked()).snapshot.shapeData.isCustom, true)
  painted = await settled()
  for (const fill of ['solid', 'gradient', 'image', 'crop', 'none']) {
    await choose('Fill', fill)
    await action('fill')
    const data = (await picked()).snapshot.shapeData.fill
    if (fill === 'solid') assert.equal(data.color, '#fbbf24')
    if (fill === 'gradient')
      assert.deepEqual(
        data.gradientStops.map((s) => s.color),
        ['#2563eb', '#22d3ee'],
      )
    if (fill === 'image' || fill === 'crop') {
      assert.match(data.fillImageSource, /^data:image\/svg\+xml/)
      assert.equal(data.srcRect.left, fill === 'crop' ? 20 : 0)
    }
    painted = await settled(painted.hash)
    report.paints.push({ variant: fill, fillType: data.fillType, ...painted })
    await capture('fill-' + fill)
  }
  for (const stroke of ['dash', 'faint', 'solid']) {
    await choose('Stroke', stroke)
    await action('stroke')
    const data = (await picked()).snapshot.shapeData.stroke
    assert.equal(data.width, stroke === 'dash' ? 4 : 2)
    assert.equal(data.opacity, stroke === 'faint' ? 0.5 : 1)
    painted = await settled(painted.hash)
  }
  report.checks.push(
    'Eight stable-ID presets, adjusted and custom geometry; five actual fill paints including image crop, three stroke styles',
  )

  await root.getByLabel('Shape text', { exact: true }).fill('Intake approved')
  await action('text')
  assert.equal((await picked()).text, 'Intake approved')
  painted = await settled(painted.hash)
  for (const style of ['bold', 'italic', 'plain']) {
    await choose('Text style', style)
    await action('text-style')
    const format = (await picked()).richText.documentStyle.textStyle
    assert.equal(format.fs, style === 'bold' ? 20 : style === 'italic' ? 16 : 14)
    painted = await settled(painted.hash)
  }
  for (const [align, h, v] of [
    ['start', 1, 1],
    ['end', 3, 3],
    ['center', 2, 2],
  ]) {
    await choose('Alignment', align)
    await action('align')
    const config = (await picked()).richText.documentStyle.renderConfig
    assert.equal(config.horizontalAlign, h)
    assert.equal(config.verticalAlign, v)
    painted = await settled(painted.hash)
  }
  await action('rotate')
  assert.equal((await picked()).snapshot.transform.rotation, 20)
  await action('undo')
  assert.equal((await picked()).snapshot.transform.rotation, 0)
  await action('redo')
  assert.equal((await picked()).snapshot.transform.rotation, 20)
  await root.getByLabel('Rotation', { exact: true }).fill('999')
  await root.locator('[data-action="rotate"]').click()
  await ready()
  assert.match(await root.getByRole('status').textContent(), /Action failed: Rotation/)
  assert.equal((await picked()).snapshot.transform.rotation, 20)
  await root.getByLabel('Rotation', { exact: true }).fill('0')
  await action('rotate')
  await action('size')
  assert.equal((await picked()).snapshot.transform.width, 220)
  await capture('text-format')
  report.checks.push(
    'Actual text/font/alignment paint; rotation one-step Undo/Redo, size, invalid input preserves shape',
  )

  await action('reset')
  await target('Intake')
  for (const mode of ['Position', 'Both', 'None']) {
    await choose('Placement', mode)
    await action('placement')
    const before = (await picked()).snapshot.transform
    await action('row-before')
    assert.equal((await read()).row1Height, 68)
    assert.equal(
      (await picked()).snapshot.transform.top,
      before.top + (mode === 'None' ? 0 : 40),
      mode + ' preceding-row movement',
    )
    await action('row-before')
    assert.equal((await picked()).snapshot.transform.top, before.top)
    await action('row-height')
    const after = (await picked()).snapshot.transform
    assert.equal((await read()).row3Height, 68)
    assert.equal(after.width, before.width)
    assert.equal(after.height, before.height + (mode === 'Both' ? 40 : 0), mode + ' row-size behavior')
    await action('row-height')
    assert.equal((await picked()).snapshot.transform.height, before.height)
  }
  const beforeMove = (await picked()).snapshot.transform.left
  const boundBefore = (await read()).shapes.find((s) => s.name === 'Intake to sample').connector
  await action('move')
  assert.equal((await picked()).snapshot.transform.left, beforeMove + 40)
  const boundAfter = (await read()).shapes.find((s) => s.name === 'Intake to sample').connector
  assert.notDeepEqual(boundAfter.route, boundBefore.route)
  await target('Intake to sample')
  assert.equal(await root.locator('[data-action="fill"]').isDisabled(), true)
  for (const [route, type] of [
    ['StraightConnector1', 'straightConnector1'],
    ['BentConnector3', 'bentConnector3'],
    ['CurvedConnector2', 'curvedConnector2'],
  ]) {
    painted = await settled()
    await choose('Connector route', route)
    await action('route')
    assert.equal((await picked()).snapshot.shapeType, type)
    const connector = (await picked()).connector
    // The installed adapter returns only intermediate points: route.slice(1, -1).
    // A straight connector has no intermediate points; its two endpoints remain explicit.
    assert.ok(Number.isFinite(connector.start.point.x) && Number.isFinite(connector.end.point.x))
    if (route === 'StraightConnector1') assert.deepEqual(connector.route, [])
    assert.ok(connector.start.binding && connector.end.binding)
    await settled(painted.hash)
  }
  for (const [mode, start, end] of [
    ['both', 3, 2],
    ['none', 0, 0],
    ['end', 0, 1],
  ]) {
    await choose('Arrowheads', mode)
    await action('arrows')
    const c = (await picked()).connector
    assert.equal(c.startArrow?.type ?? 0, start)
    assert.equal(c.endArrow?.type ?? 0, end)
  }
  await action('unbind')
  const free = (await picked()).connector
  const connectorId = (await picked()).id
  await target('Intake')
  await action('move')
  const afterFreeMove = (await read()).shapes.find((s) => s.id === connectorId).connector
  assert.deepEqual(afterFreeMove.route, free.route)
  await target('Intake to sample')
  await action('rebind')
  assert.notDeepEqual((await picked()).connector.route, free.route)
  await capture('connected')
  report.checks.push(
    'One-/two-cell/absolute row-height behavior; bound/free endpoint movement; straight/elbow/curved routes and three arrowhead variants',
  )

  await choose('Shape preset', 'Ellipse')
  await action('create')
  const created = (await picked()).id
  await action('overlap')
  assert.equal((await picked()).snapshot.transform.left, 100)
  painted = await settled()
  await action('back')
  await settled(painted.hash)
  painted = await settled()
  await action('front')
  await settled(painted.hash)
  painted = await settled()
  await action('visible')
  assert.equal((await picked()).snapshot.visible, false)
  await settled(painted.hash)
  await action('visible')
  assert.equal((await picked()).snapshot.visible, true)
  await action('selectable')
  assert.equal((await picked()).snapshot.selectable, false)
  await action('selectable')
  assert.equal((await picked()).snapshot.selectable, true)
  await action('remove')
  assert.equal(
    (await read()).shapes.some((s) => s.id === created),
    false,
  )
  await action('undo')
  assert.equal(
    (await read()).shapes.some((s) => s.id === created),
    true,
  )
  await action('redo')
  assert.equal(
    (await read()).shapes.some((s) => s.id === created),
    false,
  )
  assert.deepEqual((await read()).taskData, originalData)
  report.checks.push(
    'Create/overlap and actual front/back/visibility paint, selectability readback, remove/history; task data unchanged',
  )

  await action('reset')
  const nameBox = root.locator('.shapes-editor input.univer-size-full').first()
  await nameBox.fill('C14')
  await nameBox.press('Enter')
  await page.keyboard.type('8.75')
  await page.keyboard.press('Enter')
  await action('inspect')
  assert.equal((await read()).taskData[1][2], 8.75)
  const download = page.waitForEvent('download')
  await action('json')
  const artifact = await download
  const file = path.join(directory, 'workbook.json')
  await artifact.saveAs(file)
  const snapshot = JSON.parse(await fs.readFile(file, 'utf8'))
  assert.equal(snapshot.sheets.workbench.cellData[13][2].v, 8.75)
  state = await read()
  const priorUnit = state.unitId,
    priorIDs = state.shapes.map((s) => s.id)
  await action('reload')
  assert.notEqual((await read()).unitId, priorUnit)
  assert.deepEqual(
    (await read()).shapes.map((s) => s.id),
    priorIDs,
  )
  assert.equal((await read()).taskData[1][2], 8.75)
  assert.ok((await settled()).colored > 3000)
  for (const id of ['sheet-01', 'sheet-image-fill', 'sheet-image-crop', 'workbench']) {
    await choose('Worksheet', id)
    await action('sheet')
    assert.equal((await read()).activeSheet, id)
    await action('reveal')
    await capture('gallery-' + id)
  }
  await action('empty')
  assert.equal((await read()).shapes.length, 0)
  assert.equal((await read()).taskData[1][2], 8.75)
  assert.equal(await root.locator('[data-action="fill"]').isDisabled(), true)
  await action('reset')
  assert.equal((await read()).shapes.length, 6)
  assert.deepEqual((await read()).taskData, originalData)
  report.checks.push(
    'Native cell editing, downloaded JSON content, new-ID snapshot reload preserving shapes and edits, reference-sheet navigation, Empty and Reset',
  )

  for (const width of [760, 390, 320]) {
    await page.setViewportSize({ width, height: 900 })
    await action('reveal')
    assert.ok(await root.evaluate((e) => e.scrollWidth <= e.clientWidth + 1))
    assert.ok(await root.locator('[data-u-comp="workbench-layout"]').isVisible())
    await capture('narrow-' + width)
  }
  if (url.includes('/playground/')) {
    await page.setViewportSize({ width: 1440, height: 1100 })
    for (const theme of ['dark', 'light']) {
      await page.emulateMedia({ colorScheme: theme })
      await page.locator('.sheet-shapes-demo[data-theme="' + theme + '"][data-ready="true"]').waitFor()
      assert.equal((await read()).shapes.length, 6)
      await capture('theme-' + theme)
    }
    for (const [locale, heading, labels] of [
      ['en-US', 'Shapes', ['Variants', 'Actions', 'States']],
      ['zh-CN', '形状', ['变体', '操作', '状态']],
    ]) {
      await page.goto(new URL(url).origin + '/' + locale + '/showcase/sheets/shapes', {
        waitUntil: 'domcontentloaded',
        timeout: 240000,
      })
      await page.getByRole('heading', { name: heading, level: 1, exact: true }).waitFor()
      for (const name of labels) assert.equal(await page.getByRole('heading', { name, exact: true }).count(), 0)
      await page.locator('iframe').first().scrollIntoViewIfNeeded()
      const embedded = page.frameLocator('iframe').first()
      await embedded.locator('.sheet-shapes-demo[data-ready="true"]').waitFor()
      await embedded.locator('.shape-controls > summary').click()
      await embedded.getByLabel('Shape text', { exact: true }).fill('Keyboard checkpoint')
      await embedded.locator('[data-action="text"]').focus()
      await page.keyboard.press('Space')
      const frame = page.frames().find((f) => f.url().includes('/playground/'))
      await frame.waitForFunction(
        () =>
          JSON.parse(document.querySelector('.sheet-shapes-demo pre').textContent).shapes[0].text ===
          'Keyboard checkpoint',
      )
      const branch = page.locator('aside button').first()
      await branch.click()
      assert.equal(await branch.getAttribute('aria-expanded'), 'false')
      await branch.click()
      assert.equal(await branch.getAttribute('aria-expanded'), 'true')
    }
    report.checks.push(
      'Both themes, EN/ZH guides 9/6/5, hydrated tree and keyboard Facade text changes inside actual iframes',
    )
  }
  assert.deepEqual(report.errors, [])
  assert.ok(
    report.networkWrites.every((r) => r.nextAction),
    'No demo network writes',
  )
  report.checks.push('760/390/320 host bounds and native editor; no uncaught browser errors or demo network writes')
  report.passed = true
} catch (error) {
  report.failure = error.stack || String(error)
  await capture('failure').catch(() => {})
  report.state = await read().catch(() => null)
} finally {
  await fs.writeFile(path.join(directory, 'report.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify({ ...report, state: report.state ? '(see report.json)' : undefined }))
  await browser.close()
}
assert.equal(report.passed, true)
